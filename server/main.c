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

static uint8_t buf[16777216];
static uint32_t buf_len = 0;

static pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

struct area {
  struct grid grid;
  uint8_t players_len;
  uint16_t area_info_id;
};

static struct area* areas = NULL;
static uint16_t areas_used = 0;
static uint16_t areas_size = 0;
static uint16_t free_area = UINT16_MAX;

struct client {
  struct grid_entity
           entity;
  uint16_t area_id;
  uint8_t  sees_clients[(max_players + 7) >> 3];
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
  uint32_t last_meaningful_movement;
  uint32_t last_message_at;
  uint8_t  name_len;
  char     name[4];
  uint8_t  chat_len;
  char     chat[max_chat_message_len];
};

static struct client clients[max_players] = {0};

struct ball {
  union {
    float    speed;
    uint32_t next;
  };
  uint16_t   entity_id;
  uint16_t   area_id;
  uint8_t    type;
  uint8_t    closest_client_id;
  uint8_t    allow_walls:1;
  uint8_t    die_on_collision:1;
  uint8_t    updated_x:1;
  uint8_t    updated_y:1;
  uint8_t    updated_r:1;
  uint8_t    updated_created:2;
  uint8_t    updated_removed:1;
  float      vx;
  float      vy;
  float      angle;
  float      range_sq;
  float      closest_client_dist_sq;
  union {
    float    frequency_float;
    uint32_t frequency_num;
  };
  uint64_t   tick;
  struct ball_info*
             spawn;
  uint32_t   spawn_len;
  uint32_t   spawn_idx;
};

static uint32_t current_tick = UINT32_MAX;

int error_handler(int err, int count) {
  if(err == 0 || err == EINTR) return 0;
  return -1;
}

static uint8_t alpha_tokens[][8] = (uint8_t[][8]) {
  { 118, 241,  26,  97,  99, 235, 221,  61 }, /* shadam */
  {  98,  61, 114,  13,  19,  84,  60, 252 }, /* inno */
  {   1,  17,  11, 215,  24,  99,  25, 101 }, /* spin */
  { 129, 233, 163, 179,   6, 112, 141,  83 }, /* penta */
  {  38,  33,  21,  78,  33,  93,  68, 193 }, /* nafi */
  { 176,  49,  92, 210, 130, 209,  79, 142 }, /* dimsi */
  { 149,  59, 209, 117,  50,  40,  58,  86 }, /* hydra */
  { 174, 252, 182,  48, 104,  74,  62,  94 }, /* kirame */
  { 190,   2, 209, 240, 163,   5, 234, 188 }, /* altanis */
  {  12,  58,  94,  83, 191,  65,  73, 152 },
  {  19, 167,  67, 202,  56, 220, 231,  79 }
};

static int ball_tick(struct grid* const, const uint16_t);

static void close_client(const uint8_t);

static uint32_t r_seed;

#define FAST_RAND_MAX 32767

static void fast_srand(const uint32_t seed) {
  r_seed = seed;
}

static uint16_t fast_rand(void) {
  r_seed = (1103515245 * r_seed + 12345) & 0x7FFF;
  return r_seed;
}

static uint32_t fast_rand32(void) {
  return ((uint32_t) fast_rand() << 15) | fast_rand();
}

/*
 * =================================== BALLS ===================================
 */

static struct ball* balls = NULL;
static uint32_t balls_used = 1;
static uint32_t balls_size = 1;
static uint32_t free_ball = UINT32_MAX;

static uint32_t get_free_ball_idx(void) {
  if(free_ball != UINT32_MAX) {
    const uint32_t ret = free_ball;
    free_ball = balls[free_ball].next;
    return ret;
  }
  if(balls_used >= balls_size) {
    balls_size <<= 1;
    balls = realloc(balls, sizeof(*balls) * balls_size);
    assert(balls);
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

static uint32_t execute_ball_info_on_area_id(const struct ball_info* const info, const struct ball_info* const relative, const uint16_t area_id) {
  const uint32_t idx = get_free_ball_idx();
  struct ball* const ball = balls + idx;
  memset(ball, 0, sizeof(*balls));
  ball->area_id = area_id;
  struct grid* const grid = &areas[area_id].grid;
  ball->entity_id = grid_get_entity(grid);
  ball->updated_created = 1 + (relative != NULL && ball->entity_id > relative->relative_entity_id);
  struct grid_entity* const entity = grid->entities + ball->entity_id;
  entity->ref = idx;
  switch(info->radius_type) {
    case radius_fixed: {
      entity->r = info->r;
      break;
    }
    case radius_random: {
      entity->r = info->r_min + randf() * (info->r_max - info->r_min);
      break;
    }
    case radius_relative: {
      entity->r = info->r + relative->r;
      break;
    }
    default: assert(0);
  }
  switch(info->position_type) {
    case position_random: {
      uint8_t ok;
      do {
        entity->x = info->r + randf() * ((uint32_t) grid->cells_x * grid->cell_size - info->r * 2.0f);
        entity->y = info->r + randf() * ((uint32_t) grid->cells_y * grid->cell_size - info->r * 2.0f);
        grid_recalculate(grid, entity);
        ok = 1;
        for(uint16_t cell_x = entity->min_x; cell_x <= entity->max_x; ++cell_x) {
          for(uint16_t cell_y = entity->min_y; cell_y <= entity->max_y; ++cell_y) {
            const uint8_t tile_type = area_infos[areas[area_id].area_info_id].tile_info->tiles[(uint32_t) cell_x * grid->cells_y + cell_y];
            if(tile_type != tile_normal && (!info->allow_walls || tile_type != tile_wall)) {
              ok = 0;
              goto out;
            }
          }
        }
        out:;
        if(!ok && info->die_on_collision) {
          grid_return_entity(grid, ball->entity_id);
          return_ball_idx(idx);
          return UINT32_MAX;
        }
      } while(!ok);
      break;
    }
    case position_fixed: {
      entity->x = info->x;
      entity->y = info->y;
      grid_recalculate(grid, entity);
      break;
    }
    case position_tile_fixed: {
      entity->x = (uint32_t) info->tile_x * grid->cell_size + grid->half_cell_size;
      entity->y = (uint32_t) info->tile_y * grid->cell_size + grid->half_cell_size;
      grid_recalculate(grid, entity);
      break;
    }
    case position_relative: {
      entity->x = info->x + relative->x;
      entity->y = info->y + relative->y;
      grid_recalculate(grid, entity);
      break;
    }
    default: assert(0);
  }
  grid_insert(grid, ball->entity_id);
  switch(info->movement_type) {
    case movement_random: {
      const float angle = randf() * M_PI * 2.0f;
      ball->vx = cosf(angle) * info->speed;
      ball->vy = sinf(angle) * info->speed;
      ball->angle = angle;
      break;
    }
    case movement_velocity: {
      ball->vx = info->vx;
      ball->vy = info->vy;
      ball->angle = atan2f(ball->vy, ball->vx);
      break;
    }
    case movement_angle: {
      ball->vx = cosf(info->angle) * info->speed;
      ball->vy = sinf(info->angle) * info->speed;
      ball->angle = info->angle;
      break;
    }
    case movement_relative_velocity: {
      ball->vx = info->vx + relative->vx;
      ball->vy = info->vy + relative->vy;
      ball->angle = atan2f(ball->vy, ball->vx);
      break;
    }
    case movement_relative_angle: {
      ball->vx = cosf(info->angle + relative->angle) * info->speed;
      ball->vy = sinf(info->angle + relative->angle) * info->speed;
      break;
    }
    default: assert(0);
  }
  ball->speed = info->speed;
  switch(info->frequency_type) {
    case frequency_off: break;
    case frequency_float_random: {
      ball->frequency_float = info->frequency_float_min + randf() * (info->frequency_float_max - info->frequency_float_min);
      break;
    }
    case frequency_float_fixed: {
      ball->frequency_float = info->frequency_float;
      break;
    }
    case frequency_float_relative: {
      ball->frequency_float = info->frequency_float + relative->frequency_float;
      break;
    }
    case frequency_num_random: {
      ball->frequency_num = info->frequency_num_min + (fast_rand32() % (info->frequency_num_max - info->frequency_num_min));
      break;
    }
    case frequency_num_fixed: {
      ball->frequency_num = info->frequency_num;
      break;
    }
    case frequency_num_relative: {
      ball->frequency_num = info->frequency_num + relative->frequency_num;
      break;
    }
    default: assert(0);
  }
  switch(info->tick_type) {
    case tick_fixed: {
      ball->tick = info->tick;
      break;
    }
    case tick_random: {
      ball->tick = info->tick_min + (fast_rand32() % (info->tick_max - info->tick_min));
      break;
    }
    case tick_relative: {
      ball->tick = info->tick + relative->tick;
      break;
    }
    default: assert(0);
  }
  ball->spawn = info->spawn;
  switch(info->spawn_idx_type) {
    case spawn_idx_fixed: {
      ball->spawn_idx = info->spawn_idx;
      break;
    }
    case spawn_idx_random: {
      ball->spawn_idx = info->spawn_idx_min + (fast_rand32() % (info->spawn_idx_max - info->spawn_idx_min));
      break;
    }
    case spawn_idx_relative: {
      ball->spawn_idx = info->spawn_idx + relative->spawn_idx;
      break;
    }
    default: assert(0);
  }
  switch(info->range_type) {
    case range_none: {
      ball->range_sq = 16777215;
      break;
    }
    case range_fixed: {
      ball->range_sq = info->range * info->range;
      break;
    }
    case range_random: {
      const float range = info->range_min + randf() * (info->range_max - info->range_min);
      ball->range_sq = range * range;
      break;
    }
    case range_relative: {
      const float range = info->range + relative->range;
      ball->range_sq = range * range;
      break;
    }
    default: assert(0);
  }
  ball->tick = info->tick;
  ball->type = info->type;
  ball->allow_walls = info->allow_walls;
  ball->die_on_collision = info->die_on_collision;
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
  const uint16_t w = area->grid.cells_x;
  const uint16_t h = area->grid.cells_y;
  buf[buf_len++] = w & 255;
  buf[buf_len++] = (w >> 8) & 255;
  buf[buf_len++] = h & 255;
  buf[buf_len++] = (h >> 8) & 255;
  buf[buf_len++] = area->grid.cell_size;
  const uint32_t total_area = (uint32_t) w * h;
  memcpy(buf + buf_len, area_infos[area->area_info_id].tile_info->tiles, total_area);
  buf_len += total_area;
}

static uint16_t create_area(const uint16_t area_info_id) {
  uint16_t idx;
  if(free_area != UINT16_MAX) {
    idx = free_area;
    free_area = areas[idx].area_info_id;
  } else {
    if(areas_used == areas_size) {
      ++areas_size;
      areas = shnet_realloc(areas, sizeof(*areas) * areas_size);
      assert(areas);
    }
    idx = areas_used++;
  }
  memset(areas + idx, 0, sizeof(*areas));
  areas[idx].area_info_id = area_info_id;
  areas[idx].grid.cells_x = area_infos[area_info_id].tile_info->width;
  areas[idx].grid.cells_y = area_infos[area_info_id].tile_info->height;
  areas[idx].grid.cell_size = area_infos[area_info_id].tile_info->cell_size;
  areas[idx].grid.update = ball_tick;
  grid_init(&areas[idx].grid);
  for(const struct ball_info* info = area_infos[area_info_id].balls; info->type != ball_invalid; ++info) {
    for(uint32_t i = 0; i < info->count; ++i) {
      execute_ball_info_on_area_id(info, NULL, idx);
    }
  }
  return idx;
}

static uint16_t find_or_create_area(const uint16_t area_info_id) {
  for(uint16_t i = 0; i < areas_used; ++i) {
    if(areas[i].players_len > 0 && areas[i].area_info_id == area_info_id) {
      return i;
    }
  }
  return create_area(area_info_id);
}

static void set_player_pos_to_tile(const uint8_t client_id, const uint16_t tile_x, const uint16_t tile_y) {
  const struct area* const area = areas + clients[client_id].area_id;
  clients[client_id].entity.x = (float)((uint32_t) tile_x * area->grid.cell_size + area->grid.cell_size / 2);
  clients[client_id].entity.y = (float)((uint32_t) tile_y * area->grid.cell_size + area->grid.cell_size / 2);
  grid_recalculate(&area->grid, &clients[client_id].entity);
  clients[client_id].updated_x = 1;
  clients[client_id].updated_y = 1;
  clients[client_id].last_meaningful_movement = current_tick;
}

static void set_player_pos_to_area_spawn_tiles(const uint8_t client_id) {
  const struct area* const area = areas + clients[client_id].area_id;
  const struct pos pos = area_infos[area->area_info_id].spawn_tiles[fast_rand() % area_infos[area->area_info_id].spawn_tiles_len];
  set_player_pos_to_tile(client_id, pos.tile_x, pos.tile_y);
}

static void remove_client_from_its_area(const uint16_t client_id) {
  if(--areas[clients[client_id].area_id].players_len == 0) {
    struct grid* const grid = &areas[clients[client_id].area_id].grid;
    GRID_FOR(grid, i);
    return_ball_idx(grid->entities[i].ref);
    GRID_ROF();
    grid_free(grid);
    areas[clients[client_id].area_id].area_info_id = free_area;
    free_area = clients[client_id].area_id;
  }
}

static void add_client_to_area(const uint8_t client_id, const uint16_t area_info_id) {
  const uint16_t area_id = find_or_create_area(area_info_id);
  clients[client_id].area_id = area_id;
  clients[client_id].sent_area = 0;
  clients[client_id].sent_balls = 0;
  ++areas[area_id].players_len;
}

/*
 * =================================== TICK ===================================
 */

static int ball_tick(struct grid* const grid, const uint16_t entity_id) {
  struct grid_entity* entity = grid->entities + entity_id;
  struct ball* ball = balls + entity->ref;
  struct area* const area = areas + ball->area_id;
  const struct tile_info* const info = area_infos[area->area_info_id].tile_info;

  if(ball->updated_created == 2) {
    ball->updated_created = 1;
    return 0;
  }

  if(current_tick % send_interval == 0) {
    ball->updated_x = 0;
    ball->updated_y = 0;
    ball->updated_r = 0;
    ball->updated_created = 0;
    if(ball->updated_removed) {
      const uint32_t ball_idx = entity->ref;
      grid_remove(grid, entity_id);
      return_ball_idx(ball_idx);
      return 0;
    }
  } else if(ball->updated_removed) {
    return 0;
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
  
  entity->x += ball->vx;
  entity->y += ball->vy;
  if(entity->x < entity->r) {
    entity->x = entity->r - (entity->x - entity->r);
    ball->vx = -ball->vx;
    updated.collided = 1;
  } else {
    const uint32_t temp = (uint32_t) grid->cells_x * grid->cell_size;
    if(entity->x > temp - entity->r) {
      entity->x = temp - entity->r - (entity->x - temp + entity->r);
      ball->vx = -ball->vx;
      updated.collided = 1;
    }
  }
  if(entity->y < entity->r) {
    entity->y = entity->r - (entity->y - entity->r);
    ball->vy = -ball->vy;
    updated.collided = 1;
  } else {
    const uint32_t temp = (uint32_t) grid->cells_y * grid->cell_size;
    if(entity->y > temp - entity->r) {
      entity->y = temp - entity->r - (entity->y - temp + entity->r);
      ball->vy = -ball->vy;
      updated.collided = 1;
    }
  }

  if(updated.collided) {
    if(ball->die_on_collision) {
      ball->updated_removed = 1;
      return 0;
    }
  } else {
    updated.collided = 0;
  }

  grid_recalculate(grid, entity);
  
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
      float x = (uint32_t) cell_x * grid->cell_size;
      float y = (uint32_t) cell_y * grid->cell_size;
      const float mid_x = x + grid->half_cell_size;
      if(fabs(entity->x - mid_x) >= grid->half_cell_size + entity->r) continue;
      const float mid_y = y + grid->half_cell_size;
      if(fabs(entity->y - mid_y) >= grid->half_cell_size + entity->r) continue;
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
          y += grid->cell_size;
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
          x += grid->cell_size;
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
          x += grid->cell_size;
          y += grid->cell_size;
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
  
  if(ball->die_on_collision && (updated.collided || updated.postponed)) {
    ball->updated_removed = 1;
    return 0;
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
      const float normal_x = diff_x / dist_sqrt;
      const float normal_y = diff_y / dist_sqrt;
      const float dot_p = ball->vx * normal_x + ball->vy * normal_y;
      ball->vx -= 2.0f * dot_p * normal_x;
      ball->vy -= 2.0f * dot_p * normal_y;
      dist_sqrt = entity->r - dist_sqrt;
      entity->x += cosf(angle) * dist_sqrt;
      entity->y += sinf(angle) * dist_sqrt;
    }
  }
  
  grid_recalculate(grid, entity);
  
  if(ball->range_sq < ball->closest_client_dist_sq) {
    if(ball->tick >= ball->frequency_num) {
      ball->tick = ball->frequency_num - 1;
    }
    goto past;
  }
  switch(ball->type) {
    case ball_grey: break;
    case ball_pink: {
      const float val = ball->tick * 0.1f * ball->frequency_float;
      float sf = sinf(val);
      sf *= sf;
      sf += 0.001f;
      sf *= ball->speed;
      ball->angle = atan2f(ball->vy, ball->vx);
      ball->vx = cosf(ball->angle) * sf;
      ball->vy = sinf(ball->angle) * sf;
      if(val >= M_PI && fmod(val, M_PI) < 0.01f) {
        ball->tick = UINT64_MAX;
      }
      break;
    }
    case ball_teal: {
      ball->angle = atan2f(ball->vy, ball->vx);
      ball->vx = cosf(ball->angle + ball->frequency_float * 0.1f) * ball->speed;
      ball->vy = sinf(ball->angle + ball->frequency_float * 0.1f) * ball->speed;
      break;
    }
    case ball_sandy: {
      if(ball->tick < ball->frequency_num) {
        break;
      }
      ball->tick = UINT64_MAX;
      execute_ball_info_on_area_id(ball->spawn + ball->spawn_idx, &((struct ball_info) {
        .x = entity->x,
        .y = entity->y,
        .relative_entity_id = entity_id
      }), ball->area_id);
      entity = grid->entities + entity_id;
      ball = balls + entity->ref;
      if(ball->spawn[++ball->spawn_idx].type == ball_invalid) {
        ball->spawn_idx = 0;
      }
      break;
    }
    case ball_light_blue: {
      if(ball->tick < ball->frequency_num) {
        break;
      }
      ball->tick = UINT64_MAX;
      const float angle = atan2f(clients[ball->closest_client_id].entity.y - entity->y, clients[ball->closest_client_id].entity.x - entity->x);
      execute_ball_info_on_area_id(ball->spawn + ball->spawn_idx, &((struct ball_info) {
        .angle = angle, /* .movement_type = movement_relative_angle */
        .x = entity->x,
        .y = entity->y,
        .relative_entity_id = entity_id
      }), ball->area_id);
      entity = grid->entities + entity_id;
      ball = balls + entity->ref;
      if(ball->spawn[++ball->spawn_idx].type == ball_invalid) {
        ball->spawn_idx = 0;
      }
      break;
    }
    default: assert(0);
  }
  
  past:;
  ++ball->tick;
  ball->closest_client_dist_sq = 16777215;

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

static int player_tick(const uint8_t client_id) {
  struct client* const client = clients + client_id;
  struct grid_entity* const entity = &client->entity;
  const struct area* const area = areas + client->area_id;
  const struct grid* const grid = &area->grid;
  const struct tile_info* const info = area_infos[area->area_info_id].tile_info;
  
  if(current_tick % send_interval == 0) {
    client->updated_x = 0;
    client->updated_y = 0;
    client->updated_r = 0;
    client->chat_len = 0;
  }
  struct {
    uint8_t x:1;
    uint8_t y:1;
    uint8_t r:1;
    uint8_t collided:1;
    uint8_t postponed:1;
  } updated = {0};
  
  if(current_tick - client->last_meaningful_movement > idle_timeout) {
    close_client(client_id);
    return 0;
  }

  const float save_x = entity->x;
  const float save_y = entity->y;
  const float save_r = entity->r;
  
  if(client->dead) {
    if(++client->died_ticks_ago * tick_interval >= 1000) {
      if(client->death_counter-- == 0) {
        close_client(client_id);
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
    const uint32_t temp = (uint32_t) grid->cells_x * grid->cell_size;
    if(entity->x > temp - entity->r) {
      entity->x = temp - entity->r;
    }
  }
  if(entity->y < entity->r) {
    entity->y = entity->r;
  } else {
    const uint32_t temp = (uint32_t) grid->cells_y * grid->cell_size;
    if(entity->y > temp - entity->r) {
      entity->y = temp - entity->r;
    }
  }
  
  grid_recalculate(grid, entity);
  
  float postpone_x;
  float postpone_y;
  
  for(uint16_t cell_x = entity->min_x; cell_x <= entity->max_x; ++cell_x) {
    for(uint16_t cell_y = entity->min_y; cell_y <= entity->max_y; ++cell_y) {
      if(info->tiles[(uint32_t) cell_x * info->height + cell_y] != tile_wall) continue;
      float x = (uint32_t) cell_x * grid->cell_size;
      float y = (uint32_t) cell_y * grid->cell_size;
      const float mid_x = x + grid->half_cell_size;
      if(fabs(entity->x - mid_x) >= grid->half_cell_size + entity->r) continue;
      const float mid_y = y + grid->half_cell_size;
      if(fabs(entity->y - mid_y) >= grid->half_cell_size + entity->r) continue;
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
          y += grid->cell_size;
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
          x += grid->cell_size;
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
          x += grid->cell_size;
          y += grid->cell_size;
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
  
  grid_recalculate(grid, entity);
  
  for(uint16_t cell_x = entity->min_x; cell_x <= entity->max_x; ++cell_x) {
    for(uint16_t cell_y = entity->min_y; cell_y <= entity->max_y; ++cell_y) {
      if(info->tiles[(uint32_t) cell_x * info->height + cell_y] != tile_teleport) continue;
      const float mid_x = (uint32_t) cell_x * grid->cell_size + grid->half_cell_size;
      const float dist_x = fabs(entity->x - mid_x);
      if(dist_x >= grid->half_cell_size + entity->r) continue;
      const float mid_y = (uint32_t) cell_y * grid->cell_size + grid->half_cell_size;
      const float dist_y = fabs(entity->y - mid_y);
      if(dist_y >= grid->half_cell_size + entity->r) continue;
      if(dist_x < grid->half_cell_size) goto true;
      if(dist_y < grid->half_cell_size) goto true;
      if((dist_x - grid->half_cell_size) * (dist_x - grid->half_cell_size) +
        (dist_y - grid->half_cell_size) * (dist_y - grid->half_cell_size) >= entity->r * entity->r) continue;
      true:;
      const struct teleport_dest dest = dereference_teleport(area->area_info_id, cell_x, cell_y);
      if(dest.area_info_id == area->area_info_id) {
        if(dest.random_spawn) {
          set_player_pos_to_area_spawn_tiles(client_id);
        } else {
          set_player_pos_to_tile(client_id, dest.tile_x, dest.tile_y);
        }
        goto after_tp;
      } else {
        remove_client_from_its_area(client_id);
        add_client_to_area(client_id, dest.area_info_id);
        if(dest.random_spawn) {
          set_player_pos_to_area_spawn_tiles(client_id);
        } else {
          set_player_pos_to_tile(client_id, dest.tile_x, dest.tile_y);
        }
        return 0;
      }
    }
  }
  
  after_tp:;
  
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
    client->last_meaningful_movement = current_tick;
    return 1;
  }
  return 0;
}

static void player_collide(const uint8_t client_id1, const uint8_t client_id2) {
  struct client* const client1 = clients + client_id1;
  struct client* const client2 = clients + client_id2;
  
  if(client1->dead && !client2->dead) {
    client1->dead = 0;
    client1->updated_dc = 1;
  } else if(!client1->dead && client2->dead) {
    client2->dead = 0;
    client2->updated_dc = 1;
  }
}

static void player_collide_ball(const uint8_t client_id, struct grid_entity* const ball_entity) {
  struct client* const client = clients + client_id;
  struct ball* const ball = balls + ball_entity->ref;

  if(!client->dead && !ball->updated_removed) {
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

  for(uint8_t i = 0; i < max_players; ++i) {
    uint8_t* const sees = clients[client_id].sees_clients + (i >> 3);
    const uint8_t bit = 1 << (i & 7);
    buf[buf_len++] = i;
    if(clients[i].exists) {
      if(clients[i].area_id == clients[client_id].area_id) {
        const struct grid_entity* const entity = &clients[i].entity;
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
          if(clients[i].chat_len) {
            buf[buf_len++] = 5;
            buf[buf_len++] = clients[i].chat_len;
            memcpy(buf + buf_len, clients[i].chat, clients[i].chat_len);
            buf_len += clients[i].chat_len;
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
          buf[buf_len++] = clients[i].name_len;
          memcpy(buf + buf_len, clients[i].name, clients[i].name_len);
          buf_len += clients[i].name_len;
          buf[buf_len++] = clients[i].dead;
          if(clients[i].dead) {
            buf[buf_len++] = clients[i].death_counter;
          }
          buf[buf_len++] = clients[i].chat_len;
          memcpy(buf + buf_len, clients[i].chat, clients[i].chat_len);
          buf_len += clients[i].chat_len;
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
  }
  
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
  
  GRID_FOR(&area->grid, i);
  buf[buf_len++] = i & 255;
  buf[buf_len++] = (i >> 8) & 255;
  const struct grid_entity* const entity = area->grid.entities + i;
  struct ball* const ball = balls + entity->ref;
  if(ball->updated_removed) {
    /* DELETE */
    buf[buf_len++] = 0;
    ++updated;
  } else if(ball->updated_created || !clients[client_id].sent_balls) {
    /* CREATE */
    buf[buf_len++] = ball->type;
    memcpy(buf + buf_len, &entity->x, sizeof(float));
    buf_len += 4;
    memcpy(buf + buf_len, &entity->y, sizeof(float));
    buf_len += 4;
    memcpy(buf + buf_len, &entity->r, sizeof(float));
    buf_len += 4;
    assert(entity->r > 1 && entity->r < 21);
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
      assert(entity->r > 1 && entity->r < 21);
    }
    if(save == buf_len) {
      buf_len -= 2;
    } else {
      buf[buf_len++] = 0;
      ++updated;
    }
  }
  /* Not part of creating a packet */
  const float dist_sq = (entity->x - clients[client_id].entity.x) * (entity->x - clients[client_id].entity.x) +
                        (entity->y - clients[client_id].entity.y) * (entity->y - clients[client_id].entity.y);
  if(dist_sq < ball->closest_client_dist_sq) {
    ball->closest_client_dist_sq = dist_sq;
    ball->closest_client_id = client_id;
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

void send_chat(const uint8_t client_id) {
  uint8_t updated = 0;
  buf[buf_len++] = 3;
  const uint32_t that_idx = buf_len;
  ++buf_len;

  for(uint8_t i = 0; i < max_players; ++i) {
    if(clients[i].area_id == clients[client_id].area_id || clients[i].chat_len == 0) continue;
    buf[buf_len++] = clients[i].name_len;
    memcpy(buf + buf_len, clients[i].name, clients[i].name_len);
    buf_len += clients[i].name_len;
    buf[buf_len++] = clients[i].chat_len;
    memcpy(buf + buf_len, clients[i].chat, clients[i].chat_len);
    buf_len += clients[i].chat_len;
    ++updated;
  }

  if(!updated) {
    buf_len -= 2;
  } else {
    buf[that_idx] = updated;
  }
}

static void tick(void* nil) {
  pthread_mutex_lock(&mutex);
  if(++current_tick % send_interval == 0) {
    tcp_socket_cork_on(&sock);
    for(uint8_t i = 0; i < max_players; ++i) {
      if(!clients[i].exists) continue;
      buf[4] = current_tick & 255;
      buf[5] = (current_tick >> 8) & 255;
      buf[6] = (current_tick >> 16) & 255;
      buf[7] = (current_tick >> 24) & 255;
      buf_len = 8;
      send_arena(i);
      send_players(i);
      send_balls(i);
      send_chat(i);
      buf[0] = buf_len & 255;
      buf[1] = (buf_len >> 8) & 255;
      buf[2] = (buf_len >> 16) & 255;
      buf[3] = i;
      tcp_send(&sock, &((struct data_frame) {
        .data = (char*) buf,
        .len = buf_len,
        .dont_free = 1,
        .read_only = 0,
        .free_onerr = 0
      }));
    }
    tcp_socket_cork_off(&sock);
  }
  for(uint8_t i = 0; i < max_players; ++i) {
    if(!clients[i].exists) continue;
    struct grid_entity* const entity = &clients[i].entity;
    for(uint8_t j = i + 1; j < max_players; ++j) {
      if(clients[i].area_id != clients[j].area_id) continue;
      struct grid_entity* const ent = &clients[j].entity;
      const float dist_sq = (entity->x - ent->x) * (entity->x - ent->x) + (entity->y - ent->y) * (entity->y - ent->y);
      if(dist_sq < (entity->r + ent->r) * (entity->r + ent->r)) {
        player_collide(i, j);
      }
    }
    struct area* const area = areas + clients[i].area_id;
    for(uint16_t x = entity->min_x; x <= entity->max_x; ++x) {
      for(uint16_t y = entity->min_y; y <= entity->max_y; ++y) {
        for(uint16_t j = area->grid.cells[(uint32_t) x * area->grid.cells_y + y]; j != 0; j = area->grid.node_entities[j].next) {
          struct grid_entity* const ent = area->grid.entities + area->grid.node_entities[j].ref;
          const float dist_sq = (entity->x - ent->x) * (entity->x - ent->x) + (entity->y - ent->y) * (entity->y - ent->y);
          if(dist_sq < (entity->r + ent->r) * (entity->r + ent->r)) {
            player_collide_ball(i, ent);
          }
        }
      }
    }
  }
  for(uint8_t i = 0; i < max_players; ++i) {
    if(!clients[i].exists) continue;
    player_tick(i);
  }
  for(uint16_t j = 0; j < areas_used; ++j) {
    if(areas[j].players_len == 0) continue;
    grid_update(&areas[j].grid);
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
      .data = (char*) payload,
      .len = payload[0],
      .read_only = 0,
      .dont_free = 1,
      .free_onerr = 0
    }));
  }
}

static void parse(void) {
  const uint8_t len = buffer[0];
  const uint8_t client_id = buffer[1];
  if(len == 0) {
    /* Delete the player */
    clients[client_id].deleted_by_above = 1;
    goto close;
  }
  if(!clients[client_id].exists) {
    if(sizeof(alpha_tokens[0]) > len) {
      goto close;
    }
    const uint8_t name_len = len - sizeof(alpha_tokens[0]);
    if(name_len > max_name_len) {
      goto close;
    }
    const uint8_t* const name = buffer + 2;
    const uint8_t* const token = name + name_len;
    uint8_t ok = 0;
    for(uint8_t i = 0; i < sizeof(alpha_tokens) / sizeof(alpha_tokens[0]); ++i) {
      if(memcmp(token, alpha_tokens[i], sizeof(alpha_tokens[0])) == 0) {
        ok = 1;
        break;
      }
    }
    if(!ok) {
      goto close;
    }
    /* Create the player */
    add_client_to_area(client_id, default_area_id);
    clients[client_id].exists = 1;
    clients[client_id].entity.r = default_player_radius;
    set_player_pos_to_area_spawn_tiles(client_id);
    clients[client_id].movement_speed = base_player_speed;
    clients[client_id].name_len = name_len;
    memcpy(clients[client_id].name, name, name_len);
  } else {
    if(len < 2) {
      goto close;
    }
    switch(buffer[2]) {
      case 0: {
        /* Update the player */
        memcpy(&clients[client_id].angle, buffer + 3, sizeof(float));
        clients[client_id].speed = buffer[7];
        break;
      }
      case 1: {
        /* Chat message */
        if(buffer[3] > max_chat_message_len || 2 + buffer[3] > len) {
          goto close;
        }
        if(current_tick - clients[client_id].last_message_at < chat_timeout) {
          goto close;
        }
        clients[client_id].last_message_at = current_tick;
        clients[client_id].chat_len = buffer[3];
        memcpy(clients[client_id].chat, buffer + 4, clients[client_id].chat_len);
        break;
      }
      default: goto close;
    }
  }
  return;
  
  close:;
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
    if(len + 2 <= buffer_len) {
      parse();
      buffer_len -= len + 2;
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
      uint8_t payload[] = { max_players, max_chat_message_len };
      assert(!tcp_send(socke, &((struct data_frame) {
        .data = payload,
        .len = sizeof(payload),
        .dont_free = 1,
        .read_only = 0,
        .free_onerr = 0
      })));
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
  //assert(!time_start(&timers));
  struct async_loop loop = {0};
  assert(!tcp_async_loop(&loop));
  server.loop = &loop;
  server.on_event = server_onevent;
  assert(!tcp_server(&server, &((struct tcp_server_options) {
    .hostname = "127.0.0.1",
    .port = "23456",
    .backlog = 1
  })));
  //(void) async_loop_thread(&loop);
  assert(!async_loop_start(&loop));
  (void) time_thread(&timers);
  assert(0);
}
