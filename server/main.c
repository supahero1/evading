#include <math.h>
#include <errno.h>
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>

#include "grid.h"
#include "consts.h"

#include <shnet/tcp.h>
#include <shnet/time.h>
#include <shnet/error.h>

static struct time_timers timers = {0};

static struct tcp_server server = {0};
static struct tcp_socket sock = {0};

static uint8_t buffer[4096];
static uint32_t buffer_len = 0;

static uint8_t buf[1048576];
static uint32_t buf_len = 0;

static pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

struct area {
  struct grid balls;
  struct grid players;
  uint8_t players_len;
  uint8_t exists:1;
  uint16_t area_info_id;
};

static struct area* areas = NULL;
static uint16_t areas_used = 0;
static uint16_t areas_size = 0;
static uint16_t free_area = UINT16_MAX;

struct client {
  uint16_t area_id;
  uint16_t entity_id;
  uint8_t  sees_clients[256 >> 3];
  uint8_t  got_name:1;
  uint8_t  sent_area:1;
  uint8_t  sent_balls:1;
  uint8_t  exists:1;
  uint8_t  dead:1;
  uint8_t  deleted_by_above:1;
  uint8_t  updated_x:1;
  uint8_t  updated_y:1;
  uint8_t  updated_r:1;
  uint8_t  updated_dc:1;
  uint8_t  type;
  uint8_t  client_id;
  uint8_t  speed;
  uint8_t  death_counter;
  uint8_t  died_ticks_ago;
  float    movement_speed;
  float    angle;
  char     name[5];
};

static struct client clients[256] = {0};

struct ball {
  union {
    struct {
      uint16_t entity_id;
      uint16_t tick;
    };
    uint32_t   next;
  };
  uint16_t     area_id;
  uint8_t      type;
  uint8_t      allow_walls:1;
  uint8_t      die_on_collision:1;
  uint8_t      updated_x:1;
  uint8_t      updated_y:1;
  uint8_t      updated_r:1;
  uint8_t      updated_created:1;
  uint8_t      updated_removed:1;
  float        speed;
  float        vx;
  float        vy;
};

static uint32_t current_tick = UINT32_MAX;

int error_handler(int err, int count) {
  if(err == 0 || err == EINTR) return 0;
  return -1;
}

static uint8_t alpha_tokens[][8] = (uint8_t[][8]) {
  { 118, 241,  26,  97,  99, 235, 221,  61 }, /* shadam */
  {  98,  61, 114,  13,  19,  84,  60, 252 },
  {   0,  17,  11, 215,  24,  99,  25, 101 },
  { 129, 233, 163, 179,   6, 112, 141,  83 },
  {  38,  33,  21,  78,  33,  93,  68, 193 },
  { 176,  49,  92, 210, 130, 209,  79, 142 },
  { 149,  59, 209, 117,  50,  40,  58,  86 },
  { 174, 252, 182,  48, 104,  74,  62,  94 }
};

static int ball_tick(struct grid*, struct grid_entity*);

static int player_tick(struct grid*, struct grid_entity*);

static void close_client(const uint8_t);

static uint32_t r_seed;

#define FAST_RAND_MAX 32766

static void fast_srand(const uint32_t seed) {
  r_seed = seed;
}

static uint32_t fast_rand(void) {
  r_seed = (1103515245 * r_seed + 12345) & 0x7FFF;
  return r_seed;
}

/*
 * =================================== BALLS ===================================
 */

static struct ball* balls = NULL;
static uint32_t balls_used = 1;
static uint32_t balls_size = 0;
static uint32_t free_ball = UINT32_MAX;

static uint32_t realloc_balls(const uint32_t new_size) {
  balls = realloc(balls, sizeof(*balls) * new_size);
  assert(balls);
  balls_size = new_size;
}

static uint32_t get_free_ball_idx(void) {
  if(free_ball != UINT32_MAX) {
    const uint32_t ret = free_ball;
    free_ball = balls[free_ball].next;
    return ret;
  }
  while(balls_used >= balls_size) {
    realloc_balls(balls_used << 1);
  }
  return balls_used++;
}

static void return_ball_idx(const uint32_t idx) {
  balls[idx].next = free_ball;
  free_ball = idx;
}

/*
 * =================================== AREA ===================================
 */

static float randf(void) {
  return (float) fast_rand() / FAST_RAND_MAX;
}

static void execute_ball_info_on_area_id(const struct ball_info* const info, const uint16_t area_id) {
  const uint32_t idx = get_free_ball_idx();
  memset(balls + idx, 0, sizeof(*balls));
  struct grid* const grid = &areas[area_id].balls;
  balls[idx].entity_id = grid_insert(grid, &((struct grid_entity) {
    .ref = idx,
    .r = info->r
  }));
  struct grid_entity* const entity = grid->entities + balls[idx].entity_id;
  if(info->fixed_pos) {
    entity->x = info->x;
    entity->y = info->y;
  } else {
    uint8_t ok;
    do {
      entity->x = info->r + randf() * (grid->cells_x * cell_size - info->r * 2.0f);
      entity->y = info->r + randf() * (grid->cells_y * cell_size - info->r * 2.0f);
      if(info->die_on_collision) break;
      grid_recalculate(grid, entity);
      ok = 1;
      for(uint16_t cell_x = entity->min_x; cell_x <= entity->max_x; ++cell_x) {
        for(uint16_t cell_y = entity->min_y; cell_y <= entity->max_y; ++cell_y) {
          const uint8_t tile_type = area_infos[areas[area_id].area_info_id].tile_info->tiles[cell_x * grid->cells_y + cell_y];
          if(tile_type != tile_normal && (!info->allow_walls || tile_type != tile_wall)) {
            ok = 0;
            goto out;
          }
        }
      }
      out:;
    } while(!ok);
  }
  grid_recalculate(&areas[area_id].balls, areas[area_id].balls.entities + balls[idx].entity_id);
  if(info->fixed_speed) {
    balls[idx].vx = info->vx;
    balls[idx].vy = info->vy;
  } else if(info->speed != 0) {
    const float angle = randf() * 10.0f;
    balls[idx].vx = cosf(angle) * info->speed;
    balls[idx].vy = sinf(angle) * info->speed;
  }
  balls[idx].tick = info->tick;
  balls[idx].area_id = area_id;
  balls[idx].type = info->type;
  balls[idx].updated_created = 1;
  balls[idx].speed = info->speed;
  balls[idx].allow_walls = info->allow_walls;
  balls[idx].die_on_collision = info->die_on_collision;
}

static void send_arena(const uint8_t client_id) {
  if(clients[client_id].sent_area) {
    return;
  }
  const struct area* const area = areas + clients[client_id].area_id;
  clients[client_id].sent_area = 1;
  buf[buf_len++] = 0;
  buf[buf_len++] = client_id;
  buf[buf_len++] = area->area_info_id & 255;
  buf[buf_len++] = (area->area_info_id >> 8) & 255;
  const uint16_t w = area->balls.cells_x;
  const uint16_t h = area->balls.cells_y;
  buf[buf_len++] = w & 255;
  buf[buf_len++] = (w >> 8) & 255;
  buf[buf_len++] = h & 255;
  buf[buf_len++] = (h >> 8) & 255;
  memcpy(buf + buf_len, area_infos[area->area_info_id].tile_info->tiles, (uint32_t) w * h);
  buf_len += (uint32_t) w * h;
}

static uint16_t create_area(const uint16_t area_info_id) {
  uint16_t idx;
  if(free_area != UINT16_MAX) {
    idx = free_area;
    free_area = areas[idx].area_info_id;
  } else {
    if(areas_used >= areas_size) {
      areas = shnet_realloc(areas, sizeof(*areas) * (areas_used + 1));
      assert(areas);
      areas_size = areas_used + 1;
    }
    idx = areas_used++;
  }
  memset(areas + idx, 0, sizeof(*areas));
  areas[idx].exists = 1;
  areas[idx].area_info_id = area_info_id;
  areas[idx].balls.cells_x = area_infos[area_info_id].tile_info->width;
  areas[idx].balls.cells_y = area_infos[area_info_id].tile_info->height;
  areas[idx].balls.cell_size = cell_size;
  areas[idx].balls.update = ball_tick;
  grid_init(&areas[idx].balls);
  for(const struct ball_info* info = area_infos[area_info_id].balls; info->type != ball_invalid; ++info) {
    for(uint32_t i = 0; i < info->count; ++i) {
      execute_ball_info_on_area_id(info, idx);
    }
  }
  areas[idx].players.cells_x = area_infos[area_info_id].tile_info->width;
  areas[idx].players.cells_y = area_infos[area_info_id].tile_info->height;
  areas[idx].players.cell_size = cell_size;
  areas[idx].players.update = player_tick;
  grid_init(&areas[idx].players);
  return idx;
}

static uint16_t find_or_create_area(const uint16_t area_info_id) {
  for(uint16_t i = 0; i < areas_used; ++i) {
    if(areas[i].exists && areas[i].area_info_id == area_info_id) {
      return i;
    }
  }
  return create_area(area_info_id);
}

static void set_player_pos_to_tile(const uint8_t client_id, const uint16_t tile_x, const uint16_t tile_y) {
  const struct area* const area = areas + clients[client_id].area_id;
  area->players.entities[clients[client_id].entity_id].x =
    (float)((uint32_t) tile_x * cell_size) + half_cell_size;
  area->players.entities[clients[client_id].entity_id].y =
    (float)((uint32_t) tile_y * cell_size) + half_cell_size;
  grid_recalculate(&area->players, area->players.entities + clients[client_id].entity_id);
}

static void set_player_pos_to_area_spawn_tiles(const uint8_t client_id) {
  const struct area* const area = areas + clients[client_id].area_id;
  const struct pos pos = area_infos[area->area_info_id].spawn_tiles[fast_rand() % area_infos[area->area_info_id].spawn_tiles_len];
  set_player_pos_to_tile(client_id, pos.tile_x, pos.tile_y);
}

static void remove_client_from_its_area(const uint16_t client_id) {
  const struct client* const client = clients + client_id;
  grid_remove(&areas[client->area_id].players, client->entity_id);
  if(--areas[client->area_id].players_len == 0) {
    struct grid* const grid = &areas[client->area_id].balls;
    GRID_FOR(grid, i);
    return_ball_idx(grid->entities[i].ref);
    GRID_ROF();
    grid_free(grid);
    grid_free(&areas[client->area_id].players);
    areas[client->area_id].exists = 0;
    areas[client->area_id].area_info_id = free_area;
    free_area = client->area_id;
  }
}

static void add_client_to_area(const uint8_t client_id, const uint16_t area_info_id) {
  const uint16_t area_id = find_or_create_area(area_info_id);
  clients[client_id].area_id = area_id;
  clients[client_id].entity_id = grid_insert(&areas[area_id].players, &((struct grid_entity) {
    .ref = client_id,
    .r = player_radius
  }));
  clients[client_id].sent_area = 0;
  clients[client_id].sent_balls = 0;
  ++areas[area_id].players_len;
}

/*
 * =================================== TICK ===================================
 */

static int ball_tick(struct grid* ball_grid, struct grid_entity* entity) {
  struct ball* const ball = balls + entity->ref;
  struct area* const area = areas + ball->area_id;
  const struct tile_info* const info = area_infos[area->area_info_id].tile_info;
  
  if(ball->updated_removed) {
    const uint32_t ball_idx = entity->ref;
    grid_remove(ball_grid, ball->entity_id);
    return_ball_idx(ball_idx);
    return 0;
  }
  
  if(current_tick % send_interval == 0) {
    ball->updated_x = 0;
    ball->updated_y = 0;
    ball->updated_r = 0;
  }
  ball->updated_created = 0;
  struct {
    uint8_t x:1;
    uint8_t y:1;
    uint8_t r:1;
    uint8_t collided:1;
    uint8_t postponed:1;
  } updated = {0};
  
  const float save_x = entity->x;
  const float save_y = entity->y;
  const float save_r = entity->r;
  
  entity->x += ball->vx;
  entity->y += ball->vy;
  if(entity->x < entity->r) {
    entity->x = entity->r - (entity->x - entity->r);
    ball->vx = -ball->vx;
  } else {
    const uint32_t temp = (uint32_t) ball_grid->cells_x * cell_size;
    if(entity->x > temp - entity->r) {
      entity->x = temp - entity->r - (entity->x - temp + entity->r);
      ball->vx = -ball->vx;
    }
  }
  if(entity->y < entity->r) {
    entity->y = entity->r - (entity->y - entity->r);
    ball->vy = -ball->vy;
  } else {
    const uint32_t temp = (uint32_t) ball_grid->cells_y * cell_size;
    if(entity->y > temp - entity->r) {
      entity->y = temp - entity->r - (entity->y - temp + entity->r);
      ball->vy = -ball->vy;
    }
  }
  
  grid_recalculate(ball_grid, entity);
  
  float postpone_x;
  float postpone_y;
  
  for(uint16_t cell_x = entity->min_x; cell_x <= entity->max_x; ++cell_x) {
    for(uint16_t cell_y = entity->min_y; cell_y <= entity->max_y; ++cell_y) {
      switch(info->tiles[(uint32_t) cell_x * info->height + cell_y]) {
        case tile_safe: break;
        case tile_wall: {
          if(ball->allow_walls) {
            continue;
          }
          break;
        }
        default: continue;
      }
      if(ball->die_on_collision) {
        grid_remove(ball_grid, ball->entity_id);
        return 0;
      }
      float x = (uint32_t) cell_x * cell_size;
      float y = (uint32_t) cell_y * cell_size;
      const float mid_x = x + half_cell_size;
      if(fabs(entity->x - mid_x) >= half_cell_size + entity->r) continue;
      const float mid_y = y + half_cell_size;
      if(fabs(entity->y - mid_y) >= half_cell_size + entity->r) continue;
      if(entity->x < mid_x) {
        if(entity->y < mid_y) {
          /* Top Left */
          if(entity->y >= y && entity->x + entity->r > x) {
            entity->x = x - entity->r - (entity->x + entity->r - x);
            ball->vx = -ball->vx;
            updated.collided = 1;
            continue;
          }
          if(entity->x >= x && entity->y + entity->r > y) {
            entity->y = y - entity->r - (entity->y + entity->r - y);
            ball->vy = -ball->vy;
            updated.collided = 1;
            continue;
          }
        } else {
          /* Bottom Left */
          y += cell_size;
          if(entity->y <= y && entity->x + entity->r > x) {
            entity->x = x - entity->r - (entity->x + entity->r - x);
            ball->vx = -ball->vx;
            updated.collided = 1;
            continue;
          }
          if(entity->x >= x && entity->y - entity->r < y) {
            entity->y = y + entity->r - (entity->y - entity->r - y);
            ball->vy = -ball->vy;
            updated.collided = 1;
            continue;
          }
        }
      } else {
        if(entity->y < mid_y) {
          /* Top Right */
          x += cell_size;
          if(entity->y >= y && entity->x - entity->r < x) {
            entity->x = x + entity->r - (entity->x - entity->r - x);
            ball->vx = -ball->vx;
            updated.collided = 1;
            continue;
          }
          if(entity->x <= x && entity->y + entity->r > y) {
            entity->y = y - entity->r - (entity->y + entity->r - y);
            ball->vy = -ball->vy;
            updated.collided = 1;
            continue;
          }
        } else {
          /* Bottom Right */
          x += cell_size;
          y += cell_size;
          if(entity->y <= y && entity->x - entity->r < x) {
            entity->x = x + entity->r - (entity->x - entity->r - x);
            ball->vx = -ball->vx;
            updated.collided = 1;
            continue;
          }
          if(entity->x <= x && entity->y - entity->r < y) {
            entity->y = y + entity->r - (entity->y - entity->r - y);
            ball->vy = -ball->vy;
            updated.collided = 1;
            continue;
          }
        }
      }
      postpone_x = x;
      postpone_y = y;
      updated.postponed = 1;
    }
  }
  
  if(updated.postponed && !updated.collided) {
    const float diff_x = postpone_x - entity->x;
    const float diff_y = postpone_y - entity->y;
    const float dist_sq = diff_x * diff_x + diff_y * diff_y;
    if(dist_sq < entity->r * entity->r) {
      const float angle = atan2f(entity->y - postpone_y, entity->x - postpone_x);
      entity->x = postpone_x + cosf(angle) * entity->r;
      entity->y = postpone_y + sinf(angle) * entity->r;
      float dist_sqrt = sqrtf(dist_sq);
      const float n_x = diff_x / dist_sqrt;
      const float n_y = diff_y / dist_sqrt;
      const float p = ball->vx * n_x + ball->vy * n_y;
      ball->vx -= 2.0f * p * n_x;
      ball->vy -= 2.0f * p * n_y;
      dist_sqrt = entity->r - dist_sqrt;
      entity->x += cosf(angle) * dist_sqrt;
      entity->y += sinf(angle) * dist_sqrt;
    }
  }
  
  grid_recalculate(ball_grid, entity);
  
  const float angle = atan2f(ball->vy, ball->vx);
  
  switch(ball->type) {
    case ball_grey: break;
    case ball_pink: {
      ball->vx = cosf(ball->angle) * sinf(ball->tick) * time_scale;
      ball->vy = sinf(ball->angle) * sinf(ball->tick) * time_scale;
      break;
    }
    default: assert(0);
  }
  
  updated.x = entity->x != save_x;
  updated.y = entity->y != save_y;
  updated.r = entity->r != save_r;
  
  if(!ball->updated_x) {
    ball->updated_x = updated.x;
  }
  if(!ball->updated_y) {
    ball->updated_y = updated.y;
  }
  if(!ball->updated_r) {
    ball->updated_r = updated.r;
  }
  
  if(updated.x || updated.y || updated.r) {
    return 1;
  }
  return 0;
}

static int player_tick(struct grid* player_grid, struct grid_entity* entity) {
  struct client* const client = clients + entity->ref;
  const struct area* const area = areas + client->area_id;
  const struct tile_info* const info = area_infos[area->area_info_id].tile_info;
  
  if(current_tick % send_interval == 0) {
    client->updated_x = 0;
    client->updated_y = 0;
    client->updated_r = 0;
  }
  struct {
    uint8_t x:1;
    uint8_t y:1;
    uint8_t r:1;
    uint8_t collided:1;
    uint8_t postponed:1;
  } updated = {0};
  
  const float save_x = entity->x;
  const float save_y = entity->y;
  const float save_r = entity->r;
  
  if(client->dead) {
    if(++client->died_ticks_ago * tick_interval >= 1000) {
      if(client->death_counter-- == 0) {
        close_client(entity->ref);
        return 0;
      }
      client->died_ticks_ago = 0;
      client->updated_dc = 1;
    }
  } else if(client->speed != 0) {
    entity->x += cosf(client->angle) * client->movement_speed * (client->speed / 255.0f);
    entity->y += sinf(client->angle) * client->movement_speed * (client->speed / 255.0f);
  }
  if(entity->x < entity->r) {
    entity->x = entity->r;
  } else {
    const uint32_t temp = (uint32_t) player_grid->cells_x * cell_size;
    if(entity->x > temp - entity->r) {
      entity->x = temp - entity->r;
    }
  }
  if(entity->y < entity->r) {
    entity->y = entity->r;
  } else {
    const uint32_t temp = (uint32_t) player_grid->cells_y * cell_size;
    if(entity->y > temp - entity->r) {
      entity->y = temp - entity->r;
    }
  }
  
  grid_recalculate(player_grid, entity);
  
  float postpone_x;
  float postpone_y;
  
  for(uint16_t cell_x = entity->min_x; cell_x <= entity->max_x; ++cell_x) {
    for(uint16_t cell_y = entity->min_y; cell_y <= entity->max_y; ++cell_y) {
      if(info->tiles[(uint32_t) cell_x * info->height + cell_y] != tile_wall) continue;
      float x = (uint32_t) cell_x * cell_size;
      float y = (uint32_t) cell_y * cell_size;
      const float mid_x = x + half_cell_size;
      if(fabs(entity->x - mid_x) >= half_cell_size + entity->r) continue;
      const float mid_y = y + half_cell_size;
      if(fabs(entity->y - mid_y) >= half_cell_size + entity->r) continue;
      if(entity->x < mid_x) {
        if(entity->y < mid_y) {
          /* Top Left */
          if(entity->y >= y && entity->x + entity->r > x) {
            entity->x = x - entity->r;
            updated.collided = 1;
            continue;
          }
          if(entity->x >= x && entity->y + entity->r > y) {
            entity->y = y - entity->r;
            updated.collided = 1;
            continue;
          }
        } else {
          /* Bottom Left */
          y += cell_size;
          if(entity->y <= y && entity->x + entity->r > x) {
            entity->x = x - entity->r;
            updated.collided = 1;
            continue;
          }
          if(entity->x >= x && entity->y - entity->r < y) {
            entity->y = y + entity->r;
            updated.collided = 1;
            continue;
          }
        }
      } else {
        if(entity->y < mid_y) {
          /* Top Right */
          x += cell_size;
          if(entity->y >= y && entity->x - entity->r < x) {
            entity->x = x + entity->r;
            updated.collided = 1;
            continue;
          }
          if(entity->x <= x && entity->y + entity->r > y) {
            entity->y = y - entity->r;
            updated.collided = 1;
            continue;
          }
        } else {
          /* Bottom Right */
          x += cell_size;
          y += cell_size;
          if(entity->y <= y && entity->x - entity->r < x) {
            entity->x = x + entity->r;
            updated.collided = 1;
            continue;
          }
          if(entity->x <= x && entity->y - entity->r < y) {
            entity->y = y + entity->r;
            updated.collided = 1;
            continue;
          }
        }
      }
      postpone_x = x;
      postpone_y = y;
      updated.postponed = 1;
    }
  }
  
  if(updated.postponed && !updated.collided) {
    const float dist_sq = (postpone_x - entity->x) * (postpone_x - entity->x) + (postpone_y - entity->y) * (postpone_y - entity->y);
    if(dist_sq < entity->r * entity->r) {
      const float angle = atan2f(entity->y - postpone_y, entity->x - postpone_x);
      entity->x = postpone_x + cosf(angle) * entity->r;
      entity->y = postpone_y + sinf(angle) * entity->r;
    }
  }
  
  grid_recalculate(player_grid, entity);
  
  for(uint16_t cell_x = entity->min_x; cell_x <= entity->max_x; ++cell_x) {
    for(uint16_t cell_y = entity->min_y; cell_y <= entity->max_y; ++cell_y) {
      if(info->tiles[cell_x * info->height + cell_y] != tile_teleport) continue;
      const float mid_x = (uint32_t) cell_x * cell_size + half_cell_size;
      const float dist_x = fabs(entity->x - mid_x);
      if(dist_x >= half_cell_size + entity->r) continue;
      const float mid_y = (uint32_t) cell_y * cell_size + half_cell_size;
      const float dist_y = fabs(entity->y - mid_y);
      if(dist_y >= half_cell_size + entity->r) continue;
      if(dist_x < half_cell_size) goto true;
      if(dist_y < half_cell_size) goto true;
      if((dist_x - half_cell_size) * (dist_x - half_cell_size) +
        (dist_y - half_cell_size) * (dist_y - half_cell_size) >= entity->r * entity->r) continue;
      true:;
      const struct teleport_dest dest = dereference_teleport(area->area_info_id, cell_x, cell_y);
      if(dest.area_info_id == area->area_info_id) {
        if(dest.random_spawn) {
          set_player_pos_to_area_spawn_tiles(entity->ref);
        } else {
          set_player_pos_to_tile(entity->ref, dest.tile_x, dest.tile_y);
        }
        goto after_tp;
      } else {
        const uint8_t client_id = entity->ref;
        remove_client_from_its_area(client_id);
        add_client_to_area(client_id, dest.area_info_id);
        if(dest.random_spawn) {
          set_player_pos_to_area_spawn_tiles(client_id);
        } else {
          set_player_pos_to_tile(client_id, dest.tile_x, dest.tile_y);
        }
        client->updated_x = 1;
        client->updated_y = 1;
        return 0;
      }
    }
  }
  
  after_tp:;
  
  grid_recalculate(player_grid, entity);
  
  updated.x = entity->x != save_x;
  updated.y = entity->y != save_y;
  updated.r = entity->r != save_r;
  
  if(!client->updated_x) {
    client->updated_x = updated.x;
  }
  if(!client->updated_y) {
    client->updated_y = updated.y;
  }
  if(!client->updated_r) {
    client->updated_r = updated.r;
  }
  
  if(updated.x || updated.y || updated.r) {
    return 1;
  }
  return 0;
}

static void player_collide(struct grid_entity* a, struct grid_entity* b) {
  struct client* const client1 = clients + a->ref;
  struct client* const client2 = clients + b->ref;
  
  if(client1->dead && !client2->dead) {
    client1->dead = 0;
    client1->updated_dc = 1;
  } else if(!client1->dead && client2->dead) {
    client2->dead = 0;
    client2->updated_dc = 1;
  }
}

static void player_collide_ball(struct grid_entity* a, struct grid_entity* b) {
  struct client* const client = clients + a->ref;
  const struct ball* const ball = balls + b->ref;
  
  if(!client->dead) {
    client->dead = 1;
    client->death_counter = 60;
    client->died_ticks_ago = 0;
    client->updated_dc = 1;
  }
}

static void send_players(const uint8_t client_id) {
  uint8_t updated = 0;
  buf[buf_len++] = 1;
  const uint32_t that_idx = buf_len;
  ++buf_len;
  struct grid* const players = &areas[clients[client_id].area_id].players;
  
  uint8_t i = 0;
  do {
    uint8_t* const sees = clients[client_id].sees_clients + (i >> 3);
    const uint8_t bit = 1 << (i & 7);
    buf[buf_len++] = i;
    if(clients[i].exists) {
      if(clients[i].area_id == clients[client_id].area_id) {
        const struct grid_entity* const entity = players->entities + clients[i].entity_id;
        if(*sees & bit) {
          /* UPDATE */
          const uint32_t save = buf_len;
          if(clients[i].updated_x) {
            buf[buf_len++] = 1;
            memcpy(buf + buf_len, &entity->x, sizeof(float));
            buf_len += 4;
          }
          if(clients[i].updated_y) {
            buf[buf_len++] = 2;
            memcpy(buf + buf_len, &entity->y, sizeof(float));
            buf_len += 4;
          }
          if(clients[i].updated_r) {
            buf[buf_len++] = 3;
            memcpy(buf + buf_len, &entity->r, sizeof(float));
            buf_len += 4;
          }
          if(clients[i].updated_dc) {
            buf[buf_len++] = 4;
            buf[buf_len++] = clients[i].dead;
            if(clients[i].dead) {
              buf[buf_len++] = clients[i].death_counter;
            }
          }
          if(save == buf_len) {
            --buf_len;
          } else {
            buf[buf_len++] = 0;
            ++updated;
          }
        } else {
          /* CREATE */
          *sees |= bit;
          memcpy(buf + buf_len, &entity->x, sizeof(float));
          buf_len += 4;
          memcpy(buf + buf_len, &entity->y, sizeof(float));
          buf_len += 4;
          memcpy(buf + buf_len, &entity->r, sizeof(float));
          buf_len += 4;
          buf[buf_len] = strlen(clients[i].name);
          memcpy(buf + buf_len + 1, clients[i].name, buf[buf_len]);
          buf_len += buf[buf_len] + 1;
          buf[buf_len++] = clients[i].dead;
          if(clients[i].dead) {
            buf[buf_len++] = clients[i].death_counter;
          }
          ++updated;
        }
      } else if(*sees & bit) {
        /* DELETE */
        *sees ^= bit;
        buf[buf_len++] = 0;
        ++updated;
      } else {
        --buf_len;
      }
    } else if(*sees & bit) {
      /* DELETE */
      *sees ^= bit;
      buf[buf_len++] = 0;
      ++updated;
    } else {
      --buf_len;
    }
  } while(i++ != 255);
  
  if(!updated) {
    buf_len -= 2;
  } else {
    buf[that_idx] = updated;
  }
}

void send_balls(const uint8_t client_id) {
  uint16_t updated = 0;
  buf[buf_len++] = 2;
  const uint32_t that_idx = buf_len;
  buf_len += 2;
  const struct area* const area = areas + clients[client_id].area_id;
  
  GRID_FOR(&area->balls, i);
  buf[buf_len++] = i & 255;
  buf[buf_len++] = (i >> 8) & 255;
  const struct grid_entity* const entity = area->balls.entities + i;
  const struct ball* const ball = balls + entity->ref;
  if(ball->updated_created || !clients[client_id].sent_balls) {
    /* CREATE */
    buf[buf_len++] = ball->type - 1;
    memcpy(buf + buf_len, &entity->x, sizeof(float));
    buf_len += 4;
    memcpy(buf + buf_len, &entity->y, sizeof(float));
    buf_len += 4;
    memcpy(buf + buf_len, &entity->r, sizeof(float));
    buf_len += 4;
    ++updated;
  } else if(ball->updated_removed) {
    /* DELETE */
    buf[buf_len++] = 0;
    ++updated;
  } else {
    /* UPDATE */
    const uint32_t save = buf_len;
    if(ball->updated_x) {
      buf[buf_len++] = 1;
      memcpy(buf + buf_len, &entity->x, sizeof(float));
      buf_len += 4;
    }
    if(ball->updated_y) {
      buf[buf_len++] = 2;
      memcpy(buf + buf_len, &entity->y, sizeof(float));
      buf_len += 4;
    }
    if(ball->updated_r) {
      buf[buf_len++] = 3;
      memcpy(buf + buf_len, &entity->r, sizeof(float));
      buf_len += 4;
    }
    if(save == buf_len) {
      buf_len -= 2;
    } else {
      buf[buf_len++] = 0;
      ++updated;
    }
  }
  GRID_ROF();
  
  clients[client_id].sent_balls = 1;
  
  if(!updated) {
    buf_len -= 3;
  } else {
    buf[that_idx] = updated & 255;
    buf[that_idx + 1] = (updated >> 8) & 255;
  }
}

static void tick(void* nil) {
  pthread_mutex_lock(&mutex);
  if(++current_tick % send_interval == 0) {
    uint8_t i = 0;
    tcp_socket_cork_on(&sock);
    do {
      if(clients[i].exists) {
        buf[4] = 0;
        buf_len = 5;
        send_arena(i);
        send_players(i);
        send_balls(i);
        buf[0] = buf_len & 255;
        buf[1] = (buf_len >> 8) & 255;
        buf[2] = (buf_len >> 16) & 255;
        buf[3] = i;
        tcp_send(&sock, &((struct data_frame) {
          .data = buf,
          .len = buf_len,
          .dont_free = 1,
          .read_only = 0,
          .free_onerr = 0
        }));
      }
    } while(i++ != 255);
    tcp_socket_cork_off(&sock);
  }
  for(uint16_t i = 0; i < areas_used; ++i) {
    if(!areas[i].exists) continue;
    GRID_NESTED_FOR(&areas[i].players, j, k);
    struct grid_entity* const ent1 = areas[i].players.entities + j;
    struct grid_entity* const ent2 = areas[i].players.entities + k;
    const float dist_sq = (ent1->x - ent2->x) * (ent1->x - ent2->x) + (ent1->y - ent2->y) * (ent1->y - ent2->y);
    if(dist_sq < (ent1->r + ent2->r) * (ent1->r + ent2->r)) {
      player_collide(ent1, ent2);
    }
    GRID_ROF();
    struct grid_entity* const entity = areas[i].players.entities + j;
    for(uint16_t x = entity->min_x; x <= entity->max_x; ++x) {
      for(uint16_t y = entity->min_y; y <= entity->max_y; ++y) {
        for(uint16_t k = areas[i].balls.cells[x * areas[i].balls.cells_y + y]; k != 0; k = areas[i].balls.node_entities[k].next) {
          struct grid_entity* const ball = areas[i].balls.entities + areas[i].balls.node_entities[k].ref;
          const float dist_sq = (entity->x - ball->x) * (entity->x - ball->x) + (entity->y - ball->y) * (entity->y - ball->y);
          if(dist_sq < (entity->r + ball->r) * (entity->r + ball->r)) {
            player_collide_ball(entity, ball);
          }
        }
      }
    }
    GRID_ROF();
    grid_update(&areas[i].players);
    if(!areas[i].exists) continue;
    grid_update(&areas[i].balls);
  }
  pthread_mutex_unlock(&mutex);
}

static void start_game(void) {
  assert(!time_add_interval(&timers, &((struct time_interval) {
    .base_time = time_get_time(),
    .interval = time_ms_to_ns(tick_interval),
    .func = tick
  })));
}

static void close_client(const uint8_t client_id) {
  uint8_t deleted_by_above = clients[client_id].deleted_by_above;
  if(clients[client_id].exists) {
    remove_client_from_its_area(client_id);
  }
  memset(clients + client_id, 0, sizeof(*clients));
  if(!deleted_by_above) {
    uint8_t payload[] = { 4, 0, 0, client_id };
    tcp_send(&sock, &((struct data_frame) {
      .data = payload,
      .len = 4,
      .read_only = 0,
      .dont_free = 1,
      .free_onerr = 0
    }));
  }
}

static void parse(void) {
  const uint8_t len = buffer[0];
  const uint8_t client_id = buffer[1];
  if(len == 1) {
    /* Delete the player */
    clients[client_id].deleted_by_above = 1;
    goto close;
  }
  if(!clients[client_id].got_name) {
    if(len < 5 || buffer[len] != 0) {
      goto close;
    }
    const uint8_t* const name = buffer + 3;
    const uint32_t name_len = strlen(name);
    if(name_len > 4) {
      goto close;
    }
    const uint8_t* const token = name + name_len + 1;
    if(token == buffer + len + 1) {
      goto close;
    }
    const uint32_t token_len = strlen(token);
    if(token_len < 8) {
      goto close;
    }
    uint8_t ok = 0;
    for(uint8_t i = 0; i < 8; ++i) {
      if(memcmp(token, alpha_tokens[i], 8) == 0) {
        ok = 1;
        break;
      }
    }
    if(!ok) {
      goto close;
    }
    
    /* Create the player */
    clients[client_id].exists = 1;
    add_client_to_area(client_id, default_area_id);
    set_player_pos_to_area_spawn_tiles(client_id);
    clients[client_id].movement_speed = base_player_speed;
    memcpy(clients[client_id].name, buffer + 3, len - 1);
    clients[client_id].got_name = 1;
  } else {
    if(len != 6) {
      goto close;
    }
    /* Update the player */
    memcpy(&clients[client_id].angle, buffer + 2, sizeof(float));
    clients[client_id].speed = buffer[6];
  }
  
  return;
  
  close:
  close_client(client_id);
}

/*
 * ================================== SERVER ==================================
 */

static void consume_data(void) {
  if(buffer_len == 0) {
    return;
  }
  while(1) {
    const uint8_t len = buffer[0];
    if(len < buffer_len) {
      parse();
      buffer_len -= len + 1;
    } else {
      break;
    }
  }
}

static void socket_onevent(struct tcp_socket* socke, enum tcp_event event) {
  switch(event) {
    case tcp_open: {
      tcp_socket_nodelay_on(socke);
      tcp_socket_keepalive_on(socke);
      start_game();
      break;
    }
    case tcp_data: {
      pthread_mutex_lock(&mutex);
      tcp_socket_cork_on(socke);
      while(1) {
        const uint64_t to_read = sizeof(buffer) / sizeof(buffer[0]) - buffer_len;
        if(to_read == 0) {
          consume_data();
          continue;
        }
        const uint64_t read = tcp_read(socke, buffer + buffer_len, to_read);
        buffer_len += read;
        if(read < to_read) {
          break;
        }
      }
      consume_data();
      tcp_socket_cork_off(socke);
      pthread_mutex_unlock(&mutex);
      break;
    }
    case tcp_close: assert(0);
    default: break;
  }
}

static struct tcp_socket* server_onevent(struct tcp_server* a, struct tcp_socket* socke, enum tcp_event event) {
  switch(event) {
    case tcp_open: {
      socke->on_event = socket_onevent;
      return &sock;
    }
    default: assert(0);
  }
  return NULL;
}

int main() {
  fast_srand(time_get_time());
  assert(!time_timers(&timers));
  assert(!time_start(&timers));
  struct async_loop loop = {0};
  assert(!tcp_async_loop(&loop));
  server.loop = &loop;
  server.on_event = server_onevent;
  assert(!tcp_server(&server, &((struct tcp_server_options) {
    .hostname = "127.0.0.1",
    .port = "23456",
    .backlog = 1
  })));
  (void) async_loop_thread(&loop);
  assert(0);
}