#include <math.h>
#include <errno.h>
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>

#include <sys/reboot.h>

#include "ws.h"
#include "grid.h"
#include "consts.h"
#include "commands.h"

#include <shnet/tcp.h>
#include <shnet/time.h>
#include <shnet/error.h>

static struct time_timers timers = {0};

static struct tcp_server server = {0};
static struct tcp_socket sock = {0};

static uint8_t buf[16777216];
static uint32_t buf_len = 0;

struct client {
  struct grid_entity
           entity;
  uint8_t  body_area_id;
  uint8_t  camera_area_id;
  uint8_t  sees_clients[(max_players + 7) >> 3];
  char     name[max_name_len];
  char     chat[max_chat_message_len];
  uint64_t chat_timestamps[max_chat_timestamps];
  float    movement_speed;
  float    angle;
  uint32_t last_meaningful_movement;
  uint32_t last_spectator_change;
  uint16_t died_ticks_ago;
  uint8_t  traverse_area_idx;
  uint8_t  spectating_client_id;
  uint8_t  speed;
  uint8_t  death_counter;
  uint8_t  name_len;
  uint8_t  chat_len;
  uint8_t  chat_timestamp_idx;
  uint8_t  sent_balls:1;
  uint8_t  body_in_area:1;
  uint8_t  camera_in_area:1;
  uint8_t  spectating_a_player:1;
  uint8_t  dead:1;
  uint8_t  already_closed:1;
  uint8_t  targetable:1;
  uint8_t  named:1;
  uint8_t  init:1;
  uint8_t  admin:1;
  uint8_t  godmode:1;
  uint8_t  undying:1;
  uint8_t  updated_x:1;
  uint8_t  updated_y:1;
  uint8_t  updated_r:1;
  uint8_t  updated_dc:1;
  uint8_t  updated_tp:1;
};

static struct client clients[max_players] = {0};

struct ball {
  union {
    uint32_t next;
    float    vx;
  };
  float      vy;
  union {
    float    frequency_float;
    uint32_t frequency_num;
  };
  uint64_t   tick;
  const struct ball_info*
             info;
  uint16_t   spawn_idx;
  uint8_t    target_client_id;
  uint8_t    updated_x:1;
  uint8_t    updated_y:1;
  uint8_t    updated_r:1;
  uint8_t    updated_created:2;
  uint8_t    updated_removed:1;
};

static uint32_t current_tick = UINT32_MAX;

#define IS_SEND_TICK (current_tick % send_interval == 0)

int error_handler(int err, int count) {
  if(err == 0 || err == EINTR) return 0;
  return -1;
}

static uint8_t tokens[][32] = (uint8_t[][32]) {
  /* shadam */
  {   8, 249,  64,  73,  92, 242, 136,   8, 134, 148, 107,   8,  33, 234,  13, 165, 133,  72, 104, 102,  27, 188,  63, 187, 205,  41, 248, 209,  14, 200, 173, 206 }
};

#define tokens_len (sizeof(tokens) / sizeof(tokens[0]))

static uint32_t r_seed;

#define FAST_RAND_MAX 2147483647

static void fast_srand(const uint32_t seed) {
  r_seed = seed;
}

static uint32_t fast_rand(void) {
  r_seed = (1103515245 * r_seed + 12345) & 0x7FFFFFFF;
  return r_seed;
}

static float randf(void) {
  return (double) fast_rand() / (double) FAST_RAND_MAX;
}

static int angle_diff_turn_dir(const float a, const float b) {
  return fmodf(a - b + M_PI * 3, M_PI * 2) - M_PI > 0;
}

#define ptr_to_idx(ptr, base) ({ \
  __typeof__ (ptr) _ptr = (ptr); \
  ((uintptr_t) _ptr - (uintptr_t)(base)) / sizeof(*_ptr); \
})

/*
 * =================================== AREA ===================================
 */

struct area {
  union {
    struct grid grid;
    uint8_t     next;
  };
  struct ball*  balls;
  uint16_t      balls_used;
  uint16_t      balls_size;
  uint16_t      free_ball;
  uint8_t       players_len;
  uint8_t       area_info_id;
};

static struct area* areas = NULL;
static uint8_t areas_used = 1;
static uint8_t areas_size = 1;
static uint8_t free_area = 0;

struct a_pos {
  uint8_t tile_x;
  uint8_t tile_y;
};

struct area_data {
  struct a_pos* tiles;
  struct a_pos* wall_tiles;
  uint16_t      tiles_len;
  uint16_t      wall_tiles_len;
  uint16_t      const_ball_len;
  uint16_t      spawn_ball_len;
};

struct area_data area_data[area_infos_size];

static uint8_t area_traversal[area_infos_size];

static void return_ball_idx(struct area* const area, const uint16_t idx) {
  area->balls[idx].next = area->free_ball;
  area->free_ball = idx;
}

static void execute_ball_info_on_area(const struct ball_info* const info, const struct ball_info* const relative, struct area* const area) {
  if(info->type == ball_null) {
    return;
  }
  const struct area_data* const a_data = area_data + area->area_info_id;
  uint16_t idx = 0;
  struct ball* ball;
  if(area->free_ball == 0) {
    if(area->balls_used == area->balls_size) {
      area->balls_size += a_data->spawn_ball_len;
      area->balls = shnet_realloc(area->balls, sizeof(*area->balls) * area->balls_size);
      assert(area->balls);
    }
    idx = area->balls_used++;
    ball = area->balls + idx;
  } else {
    idx = area->free_ball;
    ball = area->balls + idx;
    area->free_ball = ball->next;
  }
  struct grid* const grid = &area->grid;
  const uint16_t entity_id = grid_get_entity(grid);
  struct grid_entity* const entity = grid->entities + entity_id;
  ball->info = info;
  ball->target_client_id = UINT8_MAX;
  ball->updated_x = 0;
  ball->updated_y = 0;
  ball->updated_r = 0;
  ball->updated_created = 1 + (relative != NULL && entity_id > relative->relative_entity_id);
  ball->updated_removed = 0;
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
  
  const struct a_pos* const tiles = info->allow_walls ? a_data->wall_tiles : a_data->tiles;
  const uint16_t tiles_len = info->allow_walls ? a_data->wall_tiles_len : a_data->tiles_len;
  const struct area_info* const area_info = area_infos[area->area_info_id];
  const struct tile_info* const tile_info = area_info->tile_info;
  const float area_width = (uint16_t) tile_info->width * grid->u8_cell_size;
  const float area_height = (uint16_t) tile_info->height * grid->u8_cell_size;
  uint8_t ok = 0;
  do {
    switch(info->position_type) {
      case position_random: {
        const uint32_t num = fast_rand();
        const struct a_pos* const pos = tiles + ((uint16_t) num % tiles_len);
        entity->x = (uint16_t) pos->tile_x * grid->u8_cell_size + grid->f_half_cell_size + (uint8_t)(num >> 16) / 256.0f * grid->f_cell_size;
        entity->y = (uint16_t) pos->tile_y * grid->u8_cell_size + grid->f_half_cell_size + (uint8_t)(num >> 24) / 128.0f * grid->f_cell_size;
        break;
      }
      case position_random_in_range: {
        const uint32_t num = fast_rand();
        switch(info->position_mode) {
          case position_tile: {
            entity->x = (uint16_t)(info->tile_x_min +
              ((uint8_t) num        % (info->tile_x_max - info->tile_x_min))) * grid->u8_cell_size + (uint8_t)(num >> 8 ) / 256.0f * grid->f_cell_size;
            entity->y = (uint16_t)(info->tile_y_min +
              ((uint8_t)(num >> 16) % (info->tile_y_max - info->tile_y_min))) * grid->u8_cell_size + (uint8_t)(num >> 24) / 128.0f * grid->f_cell_size;
            break;
          }
          case position_precise: {
            entity->x = info->x_min + ((uint16_t) num        / 65536.0f) * (info->x_max - info->x_min);
            entity->y = info->y_min + ((uint16_t)(num >> 16) / 32768.0f) * (info->y_max - info->y_min);
            break;
          }
          default: assert(0);
        }
        break;
      }
      case position_fixed: {
        switch(info->position_mode) {
          case position_tile: {
            entity->x = (uint16_t) info->tile_x * grid->u8_cell_size + grid->u8_half_cell_size;
            entity->y = (uint16_t) info->tile_y * grid->u8_cell_size + grid->u8_half_cell_size;
            break;
          }
          case position_precise: {
            entity->x = info->x;
            entity->y = info->y;
            break;
          }
          default: assert(0);
        }
        break;
      }
      case position_relative: {
        switch(info->position_mode) {
          case position_tile: {
            switch(relative->position_mode) {
              case position_tile: {
                entity->x = (uint16_t)(info->tile_x + relative->tile_x) * grid->u8_cell_size + grid->u8_half_cell_size;
                entity->y = (uint16_t)(info->tile_y + relative->tile_y) * grid->u8_cell_size + grid->u8_half_cell_size;
                break;
              }
              case position_precise: {
                entity->x = info->tile_x * grid->u8_cell_size + grid->u8_half_cell_size + relative->x;
                entity->y = info->tile_y * grid->u8_cell_size + grid->u8_half_cell_size + relative->y;
                break;
              }
              default: assert(0);
            }
            break;
          }
          case position_precise: {
            switch(relative->position_mode) {
              case position_tile: {
                entity->x = info->x + (uint16_t) relative->tile_x * grid->u8_cell_size + grid->u8_half_cell_size;
                entity->y = info->y + (uint16_t) relative->tile_y * grid->u8_cell_size + grid->u8_half_cell_size;
                break;
              }
              case position_precise: {
                entity->x = info->x + relative->x;
                entity->y = info->y + relative->y;
                break;
              }
              default: assert(0);
            }
            break;
          }
          default: assert(0);
        }
        break;
      }
      default: assert(0);
    }
    if(entity->x - entity->r < 0 || entity->y - entity->r < 0 || entity->x + entity->r > area_width || entity->y + entity->r > area_height) continue;
    grid_recalculate(grid, entity);
    ok = 1;
    for(uint8_t cell_x = entity->min_x; cell_x <= entity->max_x; ++cell_x) {
      for(uint8_t cell_y = entity->min_y; cell_y <= entity->max_y; ++cell_y) {
        const enum game_tile type = tile_info->tiles[(uint16_t) cell_x * tile_info->height + cell_y];
        switch(type) {
          case tile_safe:
          case tile_wall:
          case tile_teleport: break;
          default: continue;
        }
        const float mid_x = (uint16_t) cell_x * grid->u8_cell_size + grid->u8_half_cell_size;
        const float dist_x = fabs(entity->x - mid_x) - grid->f_half_cell_size;
        if(dist_x >= entity->r) continue;
        const float mid_y = (uint16_t) cell_y * grid->u8_cell_size + grid->u8_half_cell_size;
        const float dist_y = fabs(entity->y - mid_y) - grid->f_half_cell_size;
        if(dist_y >= entity->r) continue;
        if(dist_x < 0) goto true;
        if(dist_y < 0) goto true;
        if(dist_x * dist_x + dist_y * dist_y >= entity->r * entity->r) continue;
        true:
        if(type == tile_wall && info->allow_walls) {
          continue;
        }
        ok = 0;
      }
    }
  } while(!ok);

  grid_insert(grid, entity_id);
  switch(info->movement_type) {
    case movement_random: {
      const float angle = randf() * M_PI * 2.0f;
      ball->vx = cosf(angle) * info->speed;
      ball->vy = sinf(angle) * info->speed;
      break;
    }
    case movement_velocity: {
      ball->vx = info->vx;
      ball->vy = info->vy;
      break;
    }
    case movement_angle: {
      ball->vx = cosf(info->angle) * info->speed;
      ball->vy = sinf(info->angle) * info->speed;
      break;
    }
    case movement_relative_velocity: {
      ball->vx = info->vx + relative->vx;
      ball->vy = info->vy + relative->vy;
      break;
    }
    case movement_relative_angle: {
      ball->vx = cosf(info->angle + relative->angle) * info->speed;
      ball->vy = sinf(info->angle + relative->angle) * info->speed;
      break;
    }
    default: assert(0);
  }
  switch(info->frequency_type) {
    case frequency_off: break;
    case frequency_float_random: {
      ball->frequency_float = info->frequency_float_min + randf() * (info->frequency_float_max - info->frequency_float_min);
      ball->frequency_float *= time_scale;
      break;
    }
    case frequency_float_fixed: {
      ball->frequency_float = info->frequency_float;
      ball->frequency_float *= time_scale;
      break;
    }
    case frequency_float_relative: {
      ball->frequency_float = info->frequency_float + relative->frequency_float;
      ball->frequency_float *= time_scale;
      break;
    }
    case frequency_num_random: {
      ball->frequency_num = info->frequency_num_min + (fast_rand() % (info->frequency_num_max - info->frequency_num_min));
      ball->frequency_num /= tick_interval;
      break;
    }
    case frequency_num_fixed: {
      ball->frequency_num = info->frequency_num;
      ball->frequency_num /= tick_interval;
      break;
    }
    case frequency_num_relative: {
      ball->frequency_num = info->frequency_num + relative->frequency_num;
      ball->frequency_num /= tick_interval;
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
      ball->tick = info->tick_min + (fast_rand() % (info->tick_max - info->tick_min));
      break;
    }
    case tick_relative: {
      ball->tick = info->tick + relative->tick;
      break;
    }
    default: assert(0);
  }
  switch(info->spawn_idx_type) {
    case spawn_idx_fixed: {
      ball->spawn_idx = info->spawn_idx;
      break;
    }
    case spawn_idx_random: {
      ball->spawn_idx = info->spawn_idx_min + (fast_rand() % (info->spawn_idx_max - info->spawn_idx_min));
      break;
    }
    case spawn_idx_relative: {
      ball->spawn_idx = info->spawn_idx + relative->spawn_idx;
      break;
    }
    default: assert(0);
  }
  /* TIME SCALE */
  if(ball->tick >> 63) {
    ball->tick = -(-ball->tick / tick_interval);
  } else {
    ball->tick /= tick_interval;
  }
}

static uint8_t create_area(const uint8_t area_info_id) {
  struct area* area;
  uint8_t idx;
  if(free_area != 0) {
    idx = free_area;
    area = areas + idx;
    free_area = area->next;
  } else {
    if(areas_used == areas_size) {
      ++areas_size;
      areas = shnet_realloc(areas, sizeof(*areas) * areas_size);
      assert(areas);
    }
    idx = areas_used++;
    area = areas + idx;
  }
  const struct area_info* const info = area_infos[area_info_id];
  const struct tile_info* const tile_info = info->tile_info;
  const struct area_data* const a_data = area_data + area_info_id;
  struct grid* const grid = &area->grid;
  grid->cells_x = tile_info->width;
  grid->cells_y = tile_info->height;
  grid->u8_cell_size = tile_info->cell_size;
  grid->addon = a_data->spawn_ball_len;
  const uint16_t ball_len = a_data->const_ball_len + 1;
  grid_init(&area->grid, ball_len);
  area->balls = shnet_malloc(sizeof(*area->balls) * ball_len);
  assert(area->balls);
  area->balls_used = 1;
  area->balls_size = ball_len;
  area->free_ball = 0;
  area->players_len = 0;
  area->area_info_id = area_info_id;
  for(const struct ball_info* b_info = info->balls; b_info->type != ball_invalid; ++b_info) {
    for(uint16_t i = 0; i < b_info->count; ++i) {
      execute_ball_info_on_area(b_info, NULL, area);
    }
  }
  return idx;
}

static uint8_t find_or_create_area(const uint8_t area_info_id) {
  for(uint8_t i = 1; i < areas_used; ++i) {
    if(areas[i].area_info_id == area_info_id && areas[i].players_len > 0) {
      return i;
    }
  }
  return create_area(area_info_id);
}

static void set_player_pos_to_tile(struct client* const client, const uint8_t tile_x, const uint8_t tile_y) {
  const struct area* const area = areas + client->body_area_id;
  client->entity.x = (uint16_t) tile_x * area->grid.u8_cell_size + area->grid.u8_half_cell_size;
  client->entity.y = (uint16_t) tile_y * area->grid.u8_cell_size + area->grid.u8_half_cell_size;
  grid_recalculate(&area->grid, &client->entity);
  client->updated_x = 1;
  client->updated_y = 1;
  client->updated_tp = 1;
  client->last_meaningful_movement = current_tick;
  const struct tile_info* const info = area_infos[area->area_info_id]->tile_info;
  client->targetable = (info->tiles[(uint16_t) tile_x * info->height + tile_y] == tile_path);
}

static void set_player_pos_to_area_spawn_tiles(struct client* const client) {
  const struct area* const area = areas + client->body_area_id;
  const struct area_info* const info = area_infos[area->area_info_id];
  const struct pos* const pos = info->spawn_tiles + (fast_rand() % info->spawn_tiles_len);
  set_player_pos_to_tile(client, pos->tile_x, pos->tile_y);
}

static void area_ref_up(struct area* const area) {
  ++area->players_len;
}

static void area_ref_down(struct area* const area) {
  if(--area->players_len == 0) {
    grid_free(&area->grid);
    area->next = free_area;
    free_area = ptr_to_idx(area, areas);
  }
}

static void remove_client_camera_from_its_area(struct client* const client) {
  assert(client->camera_in_area);
  if(!client->body_in_area || client->camera_area_id != client->body_area_id) {
    area_ref_down(areas + client->camera_area_id);
  }
  client->camera_in_area = 0;
}

static void add_client_camera_to_area(struct client* const client, const uint8_t area_info_id) {
  if(client->camera_in_area) {
    if(areas[client->camera_area_id].area_info_id == area_info_id) {
      return;
    }
    remove_client_camera_from_its_area(client);
  }
  assert(!client->camera_in_area);
  client->camera_in_area = 1;
  const uint8_t area_id = find_or_create_area(area_info_id);
  client->camera_area_id = area_id;
  client->sent_balls = 0;
  client->updated_tp = 1;
  if(!client->body_in_area || client->body_area_id != area_id) {
    area_ref_up(areas + area_id);
  }
}

static uint8_t area_bodies = 0;

static void remove_client_body_from_its_area(struct client* const client) {
  assert(client->body_in_area);
  if(!client->camera_in_area || client->body_area_id != client->camera_area_id) {
    area_ref_down(areas + client->body_area_id);
  }
  client->body_in_area = 0;
  --area_bodies;
}

static void add_client_body_to_area(struct client* const client, const uint8_t area_info_id) {
  if(client->body_in_area) {
    if(areas[client->body_area_id].area_info_id == area_info_id) {
      return;
    }
    remove_client_body_from_its_area(client);
  }
  assert(!client->body_in_area);
  client->body_in_area = 1;
  const uint8_t area_id = find_or_create_area(area_info_id);
  client->body_area_id = area_id;
  if(!client->camera_in_area || client->camera_area_id != area_id) {
    area_ref_up(areas + area_id);
  }
  ++area_bodies;
}

static void add_client_to_area(struct client* const client, const uint8_t area_info_id) {
  add_client_camera_to_area(client, area_info_id);
  add_client_body_to_area(client, area_info_id);
}

static const struct teleport_dest* dereference_teleport(const struct area_info* const info, const uint8_t tile_x, const uint8_t tile_y) {
  for(uint8_t i = 0; i < info->teleport_tiles_len; ++i) {
    const struct teleport* const teleport = info->teleport_tiles + i;
    if(teleport->pos.tile_x == tile_x && teleport->pos.tile_y == tile_y) {
      return &teleport->dest;
    }
  }
  return NULL;
}

/*
 * ================================== CLIENTS ==================================
 */

static void client_set_spectated_player(struct client* const client, const uint8_t i) {
  client->spectating_client_id = i;
  client->updated_tp = 1;
  add_client_camera_to_area(client, areas[clients[i].body_area_id].area_info_id);
}

static void client_start_spectating(struct client* const);

static void client_spectate(struct client* const client) {
  if(client->spectating_a_player) {
    const struct client* const spectated_client = clients + client->spectating_client_id;
    if(!spectated_client->body_in_area) {
      client->spectating_a_player = 0;
      client_start_spectating(client);
    } else {
      add_client_camera_to_area(client, areas[spectated_client->body_area_id].area_info_id);
    }
    return;
  }
  
  if(client->body_in_area || current_tick < spectating_interval + client->last_spectator_change) {
    return;
  }

  client->last_spectator_change = current_tick;
  if(area_bodies == 0) {
    client->traverse_area_idx = (client->traverse_area_idx + 1) % area_infos_size;
    add_client_camera_to_area(client, area_traversal[client->traverse_area_idx]);
  } else {
    for(uint8_t i = (client->spectating_client_id + 1) % max_players;; i = (i + 1) % max_players) {
      if(!clients[i].body_in_area) continue;
      client_set_spectated_player(client, i);
      break;
    }
  }
}

static void client_start_spectating(struct client* const client) {
  client->last_spectator_change = -spectating_interval;
  client->last_meaningful_movement = current_tick;
  client->traverse_area_idx = fast_rand() % area_infos_size;
  client_spectate(client);
}

static void client_remove(struct client* const client) {
  client->dead = 0;
  client->death_counter = 0;
  client->died_ticks_ago = 0;
  client->updated_x = 0;
  client->updated_y = 0;
  client->updated_r = 0;
  client->updated_dc = 0;
  client->updated_tp = 0;
  client->speed = 0;
  remove_client_body_from_its_area(client);
  client_start_spectating(client);
}

static void client_close(struct client* const client) {
  if(client->body_in_area) {
    remove_client_body_from_its_area(client);
  }
  if(client->camera_in_area) {
    remove_client_camera_from_its_area(client);
  }
  const uint8_t already_closed = client->already_closed;
  memset(client, 0, sizeof(*client));
  if(!already_closed) {
    game_close(ptr_to_idx(client, clients));
  }
}

/*
 * =================================== TICK ===================================
 */

int ball_tick(struct grid* const grid, const uint16_t entity_id) {
  struct grid_entity* entity = grid->entities + entity_id;
  struct area* const area = (struct area*) grid;
  const uint8_t area_id = ptr_to_idx(area, areas);
  struct ball* ball = area->balls + entity->ref;
  const struct tile_info* const info = area_infos[area->area_info_id]->tile_info;

  if(ball->updated_created == 2) {
    ball->updated_created = 1;
    return 0;
  }

  if(IS_SEND_TICK) {
    ball->updated_x = 0;
    ball->updated_y = 0;
    ball->updated_r = 0;
    ball->updated_created = 0;
    if(ball->updated_removed) {
      const uint32_t ball_idx = entity->ref;
      grid_remove(grid, entity_id);
      return_ball_idx(area, ball_idx);
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
    const uint16_t temp = (uint16_t) grid->cells_x * grid->u8_cell_size;
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
    const uint16_t temp = (uint16_t) grid->cells_y * grid->u8_cell_size;
    if(entity->y > temp - entity->r) {
      entity->y = temp - entity->r - (entity->y - temp + entity->r);
      ball->vy = -ball->vy;
      updated.collided = 1;
    }
  }

  if(updated.collided) {
    if(ball->info->die_on_collision) {
      ball->updated_removed = 1;
      return 0;
    }
    updated.collided = 0;
  }

  grid_recalculate(grid, entity);
  
  float postpone_x = postpone_x;
  float postpone_y = postpone_y;
  
  for(uint8_t cell_x = entity->min_x; cell_x <= entity->max_x; ++cell_x) {
    for(uint8_t cell_y = entity->min_y; cell_y <= entity->max_y; ++cell_y) {
      switch(info->tiles[(uint16_t) cell_x * info->height + cell_y]) {
        case tile_safe: break;
        case tile_wall: {
          if(ball->info->allow_walls) {
            continue;
          }
          break;
        }
        default: continue;
      }
      float x = (uint16_t) cell_x * grid->u8_cell_size;
      float y = (uint16_t) cell_y * grid->u8_cell_size;
      const float mid_x = x + grid->f_half_cell_size;
      if(fabs(entity->x - mid_x) >= grid->f_half_cell_size + entity->r) continue;
      const float mid_y = y + grid->f_half_cell_size;
      if(fabs(entity->y - mid_y) >= grid->f_half_cell_size + entity->r) continue;
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
          y += grid->f_cell_size;
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
          x += grid->f_cell_size;
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
          x += grid->f_cell_size;
          y += grid->f_cell_size;
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
      const float diff_x = x - entity->x;
      const float diff_y = y - entity->y;
      const float dist_sq = diff_x * diff_x + diff_y * diff_y;
      if(dist_sq < entity->r * entity->r) {
        postpone_x = x;
        postpone_y = y;
        updated.postponed = 1;
      }
    }
  }
  
  if(ball->info->die_on_collision && updated.collided) {
    ball->updated_removed = 1;
    return 0;
  }

  if(updated.postponed && !updated.collided) {
    /* Second calculation on purpose, don't remove */
    const float diff_x = postpone_x - entity->x;
    const float diff_y = postpone_y - entity->y;
    const float dist_sq = diff_x * diff_x + diff_y * diff_y;
    if(dist_sq < entity->r * entity->r) {
      if(ball->info->die_on_collision) {
        ball->updated_removed = 1;
        return 0;
      }
      const float angle = atan2f(entity->y - postpone_y, entity->x - postpone_x);
      const float c = cosf(angle);
      const float s = sinf(angle);
      entity->x = postpone_x + c * entity->r;
      entity->y = postpone_y + s * entity->r;
      float dist_sqrt = sqrtf(dist_sq);
      const float normal_x = diff_x / dist_sqrt;
      const float normal_y = diff_y / dist_sqrt;
      const float dot_p = ball->vx * normal_x + ball->vy * normal_y;
      ball->vx -= 2.0f * dot_p * normal_x;
      ball->vy -= 2.0f * dot_p * normal_y;
      dist_sqrt = entity->r - dist_sqrt;
      entity->x += c * dist_sqrt;
      entity->y += s * dist_sqrt;
    }
  }
  
  grid_recalculate(grid, entity);
  
  uint8_t closest_client_id;

  switch(ball->info->type) {
    case ball_light_blue:
    case ball_purple: {
      closest_client_id = UINT8_MAX;
      float closest_dist_sq = 16777215;
      const uint32_t range_sq = ball->info->range * ball->info->range;
      for(uint8_t client_id = 0; client_id < max_players; ++client_id) {
        const struct client* const client = clients + client_id;
        if(client->body_in_area && client->body_area_id == area_id && !client->dead && client->targetable && !client->godmode) {
          const float dist_sq = (entity->x - client->entity.x) * (entity->x - client->entity.x) +
                                (entity->y - client->entity.y) * (entity->y - client->entity.y);
          if(dist_sq <= range_sq && dist_sq < closest_dist_sq) {
            closest_client_id = client_id;
            closest_dist_sq = dist_sq;
          }
        }
      }
      ball->target_client_id = closest_client_id;
      break;
    }
    default: {
      closest_client_id = 0;
      ball->target_client_id = UINT8_MAX;
      break;
    }
  }

  if(closest_client_id == UINT8_MAX) {
    if(ball->tick >= ball->frequency_num) {
      ball->tick = ball->frequency_num - 1;
    }
    goto past;
  }

#define ANGLE_TO_NEAREST_PLAYER atan2f(clients[closest_client_id].entity.y - entity->y, clients[closest_client_id].entity.x - entity->x)

  switch(ball->info->type) {
    case ball_grey: break;
    case ball_pink: {
      const float val = ball->tick * 0.1f * ball->frequency_float;
      float sf = sinf(val);
      sf *= sf;
      sf += 0.001f;
      sf *= ball->info->speed;
      const float angle = atan2f(ball->vy, ball->vx);
      ball->vx = cosf(angle) * sf;
      ball->vy = sinf(angle) * sf;
      if(val >= M_PI && fmod(val, M_PI) < 0.01f) {
        ball->tick = UINT64_MAX;
      }
      break;
    }
    case ball_dark_green: {
      const float angle = atan2f(ball->vy, ball->vx);
      ball->vx = cosf(angle + ball->frequency_float * 0.1f) * ball->info->speed;
      ball->vy = sinf(angle + ball->frequency_float * 0.1f) * ball->info->speed;
      break;
    }
    case ball_sandy: {
      if(ball->tick != ball->frequency_num) {
        break;
      }
      ball->tick = UINT64_MAX;
      execute_ball_info_on_area(ball->info->spawn + ball->spawn_idx, &((struct ball_info) {
        .position_mode = position_precise,
        .x = entity->x,
        .y = entity->y,
        .relative_entity_id = entity_id
      }), area);
      entity = grid->entities + entity_id;
      ball = area->balls + entity->ref;
      if(ball->info->spawn[++ball->spawn_idx].type == ball_invalid) {
        ball->spawn_idx = 0;
      }
      break;
    }
    case ball_light_blue: {
      if(ball->tick != ball->frequency_num) {
        break;
      }
      ball->tick = UINT64_MAX;
      const float angle = ANGLE_TO_NEAREST_PLAYER;
      execute_ball_info_on_area(ball->info->spawn + ball->spawn_idx, &((struct ball_info) {
        .position_mode = position_precise,
        .angle = angle,
        .x = entity->x,
        .y = entity->y,
        .relative_entity_id = entity_id
      }), area);
      entity = grid->entities + entity_id;
      ball = area->balls + entity->ref;
      if(ball->info->spawn[++ball->spawn_idx].type == ball_invalid) {
        ball->spawn_idx = 0;
      }
      break;
    }
    case ball_purple: {
      const float angle = ANGLE_TO_NEAREST_PLAYER;
      float b_angle = atan2f(ball->vy, ball->vx);
      const int dir = angle_diff_turn_dir(b_angle, angle);
      if(dir) {
        b_angle -= ball->frequency_float;
      } else {
        b_angle += ball->frequency_float;
      }
      ball->vx = cosf(b_angle) * ball->info->speed;
      ball->vy = sinf(b_angle) * ball->info->speed;
      break;
    }
    case ball_light_green: {
      const float s = sinf(ball->tick * ball->frequency_float);
      const float angle = atan2f(ball->vy, ball->vx) + s * s * s * s * s * 0.02f * time_scale;
      ball->vx = cosf(angle) * ball->info->speed;
      ball->vy = sinf(angle) * ball->info->speed;
      break;
    }
    default: assert(0);
  }
  
  past:
  ++ball->tick;

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

static void player_reset(struct client* const client) {
  client->updated_x = 0;
  client->updated_y = 0;
  client->updated_r = 0;
  client->updated_tp = 0;
  client->chat_len = 0;
}

static void player_down(struct client* const client) {
  if(client->dead) return;
  client->dead = 1;
  client->death_counter = 60;
  client->died_ticks_ago = 0;
  client->updated_dc = 1;
}

static void player_revive(struct client* const client) {
  if(!client->dead) return;
  client->dead = 0;
  client->updated_dc = 1;
}

static void player_spawn(struct client* const client) {
  client->spectating_a_player = 0;
  if(client->body_in_area) {
    player_revive(client);
  } else {
    client->entity.r = default_player_radius;
    client->movement_speed = default_player_speed;
  }
  add_client_to_area(client, default_area_info_id);
  set_player_pos_to_area_spawn_tiles(client);
}

static void player_tick(struct client* const client) {
  if(!client->spectating_a_player && current_tick - client->last_meaningful_movement > idle_timeout) {
    client_close(client);
    return;
  }

  client_spectate(client);

  if(client->body_in_area) {
    struct grid_entity* const entity = &client->entity;
    const struct area* const area = areas + client->body_area_id;
    const struct grid* const grid = &area->grid;
    const struct area_info* const area_info = area_infos[area->area_info_id];
    const struct tile_info* const tile_info = area_info->tile_info;

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
          client_remove(client);
          return;
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
      const uint16_t temp = (uint16_t) grid->cells_x * grid->u8_cell_size;
      if(entity->x > temp - entity->r) {
        entity->x = temp - entity->r;
      }
    }
    if(entity->y < entity->r) {
      entity->y = entity->r;
    } else {
      const uint16_t temp = (uint16_t) grid->cells_y * grid->u8_cell_size;
      if(entity->y > temp - entity->r) {
        entity->y = temp - entity->r;
      }
    }
    
    grid_recalculate(grid, entity);
    
    float postpone_x = postpone_x;
    float postpone_y = postpone_y;

    for(uint8_t cell_x = entity->min_x; cell_x <= entity->max_x; ++cell_x) {
      for(uint8_t cell_y = entity->min_y; cell_y <= entity->max_y; ++cell_y) {
        if(tile_info->tiles[(uint16_t) cell_x * tile_info->height + cell_y] != tile_wall) continue;
        float x = (uint16_t) cell_x * grid->u8_cell_size;
        float y = (uint16_t) cell_y * grid->u8_cell_size;
        const float mid_x = (uint16_t) cell_x * grid->u8_cell_size + grid->u8_half_cell_size;
        if(fabs(entity->x - mid_x) >= grid->f_half_cell_size + entity->r) continue;
        const float mid_y = (uint16_t) cell_y * grid->u8_cell_size + grid->u8_half_cell_size;
        if(fabs(entity->y - mid_y) >= grid->f_half_cell_size + entity->r) continue;
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
            y += grid->f_cell_size;
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
            x += grid->f_cell_size;
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
            x += grid->f_cell_size;
            y += grid->f_cell_size;
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
        const float dist_sq = (x - entity->x) * (x - entity->x) + (y - entity->y) * (y - entity->y);
        if(dist_sq < entity->r * entity->r) {
          postpone_x = x;
          postpone_y = y;
          updated.postponed = 1;
        }
      }
    }
    
    if(updated.postponed && !updated.collided) {
      /* Second calculation on purpose, don't remove */
      const float dist_sq = (postpone_x - entity->x) * (postpone_x - entity->x) + (postpone_y - entity->y) * (postpone_y - entity->y);
      if(dist_sq < entity->r * entity->r) {
        const float angle = atan2f(entity->y - postpone_y, entity->x - postpone_x);
        entity->x = postpone_x + cosf(angle) * entity->r;
        entity->y = postpone_y + sinf(angle) * entity->r;
      }
    }
    
    grid_recalculate(grid, entity);
    
    client->targetable = 0;

    for(uint8_t cell_x = entity->min_x; cell_x <= entity->max_x; ++cell_x) {
      for(uint8_t cell_y = entity->min_y; cell_y <= entity->max_y; ++cell_y) {
        const enum game_tile type = tile_info->tiles[(uint16_t) cell_x * tile_info->height + cell_y];
        switch(type) {
          case tile_path:
          case tile_teleport: break;
          default: continue;
        }
        const float mid_x = (uint16_t) cell_x * grid->u8_cell_size + grid->u8_half_cell_size;
        const float dist_x = fabs(entity->x - mid_x) - grid->f_half_cell_size;
        if(dist_x >= entity->r) continue;
        const float mid_y = (uint16_t) cell_y * grid->u8_cell_size + grid->u8_half_cell_size;
        const float dist_y = fabs(entity->y - mid_y) - grid->f_half_cell_size;
        if(dist_y >= entity->r) continue;
        if(dist_x < 0) goto true;
        if(dist_y < 0) goto true;
        if(dist_x * dist_x + dist_y * dist_y >= entity->r * entity->r) continue;
        true:
        switch(type) {
          case tile_path: {
            client->targetable = 1;
            break;
          }
          case tile_teleport: {
            const struct teleport_dest* const dest = dereference_teleport(area_info, cell_x, cell_y);
            if(dest == NULL) {
              continue;
            }
            if(dest->area_info_id == area->area_info_id) {
              if(!dest->not_random_spawn) {
                set_player_pos_to_area_spawn_tiles(client);
              } else {
                set_player_pos_to_tile(client, dest->pos.tile_x, dest->pos.tile_y);
              }
              goto after_tp;
            } else {
              add_client_to_area(client, dest->area_info_id);
              if(!dest->not_random_spawn) {
                set_player_pos_to_area_spawn_tiles(client);
              } else {
                set_player_pos_to_tile(client, dest->pos.tile_x, dest->pos.tile_y);
              }
              return;
            }
          }
          default: assert(0);
        }
      }
    }
    
    after_tp:
    
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
    
    if(updated.x || updated.y) {
      client->last_meaningful_movement = current_tick;
    }
  }
}

static void player_collide(struct client* const client1, struct client* const client2) {
  if(client1->dead && !client2->dead) {
    player_revive(client1);
  } else if(!client1->dead && client2->dead) {
    player_revive(client2);
  }
}

static void player_collide_ball(struct client* const client, const struct area* const area, const struct grid_entity* const ball_entity) {
  struct ball* const ball = area->balls + ball_entity->ref;

  if(!ball->updated_removed && !client->godmode && !client->undying) {
    player_down(client);
    if(ball->info->speed == 0) {
      const float angle = atan2f(client->entity.y - ball_entity->y, client->entity.x - ball_entity->x);
      const float r_total = client->entity.r + ball_entity->r + 0.01f;
      client->entity.x = ball_entity->x + cosf(angle) * r_total;
      client->entity.y = ball_entity->y + sinf(angle) * r_total;
      client->updated_x = 1;
      client->updated_y = 1;
    }
  }
}

static void send_players(struct client* const client) {
  uint8_t updated = 0;
  buf[buf_len++] = server_opcode_players;
  const uint32_t that_idx = buf_len;
  ++buf_len;

  for(uint8_t i = 0; i < max_players; ++i) {
    const struct client* const peer = clients + i;
    uint8_t* const sees = client->sees_clients + (i >> 3);
    const uint8_t bit = 1 << (i & 7);
    buf[buf_len++] = i;

    if(peer->body_in_area) {
      if(peer->body_area_id == client->camera_area_id) {
        goto upcreate;
      } else {
        goto delete;
      }
    } else {
      goto delete;
    }

    delete:
    if(*sees & bit) {
      *sees ^= bit;
      buf[buf_len++] = 0;
      ++updated;
    } else {
      --buf_len;
    }
    continue;

    upcreate:;
    const struct grid_entity* const entity = &peer->entity;
    if(*sees & bit) {
      goto update;
    } else {
      *sees |= bit;
      goto create;
    }

    create:
    memcpy(buf + buf_len, &entity->x, sizeof(float));
    buf_len += 4;
    memcpy(buf + buf_len, &entity->y, sizeof(float));
    buf_len += 4;
    memcpy(buf + buf_len, &entity->r, sizeof(float));
    buf_len += 4;
    buf[buf_len++] = peer->name_len;
    memcpy(buf + buf_len, peer->name, peer->name_len);
    buf_len += peer->name_len;
    buf[buf_len++] = peer->dead;
    if(peer->dead) {
      buf[buf_len++] = peer->death_counter;
    }
    buf[buf_len++] = peer->chat_len;
    memcpy(buf + buf_len, peer->chat, peer->chat_len);
    buf_len += peer->chat_len;
    ++updated;
    continue;

    update:;
    const uint32_t save = buf_len;
    if(peer->updated_x) {
      buf[buf_len++] = 1;
      memcpy(buf + buf_len, &entity->x, sizeof(float));
      buf_len += 4;
    }
    if(peer->updated_y) {
      buf[buf_len++] = 2;
      memcpy(buf + buf_len, &entity->y, sizeof(float));
      buf_len += 4;
    }
    if(peer->updated_r) {
      buf[buf_len++] = 3;
      memcpy(buf + buf_len, &entity->r, sizeof(float));
      buf_len += 4;
    }
    if(peer->updated_dc) {
      buf[buf_len++] = 4;
      buf[buf_len++] = peer->dead;
      if(peer->dead) {
        buf[buf_len++] = peer->death_counter;
      }
    }
    if(peer->chat_len) {
      buf[buf_len++] = 5;
      buf[buf_len++] = peer->chat_len;
      memcpy(buf + buf_len, peer->chat, peer->chat_len);
      buf_len += peer->chat_len;
    }
    uint8_t flags = 0;
    if(save == buf_len && flags == 0) {
      --buf_len;
    } else {
      buf[buf_len++] = flags;
      ++updated;
    }
  }
  
  if(!updated) {
    buf_len -= 2;
  } else {
    buf[that_idx] = updated;
  }
}

void send_balls(struct client* const client) {
  uint16_t updated = 0;
  buf[buf_len++] = server_opcode_balls;
  const uint32_t that_idx = buf_len;
  buf_len += 2;
  const struct area* const area = areas + client->camera_area_id;
  const uint8_t client_id = ptr_to_idx(client, clients);
  
  GRID_FOR(&area->grid, i) {
    const uint8_t has_idx = client->sent_balls || i > area_data[area->area_info_id].const_ball_len;
    if(has_idx) {
      buf[buf_len++] = i;
      buf[buf_len++] = i >> 8;
    }
    const struct grid_entity* const entity = area->grid.entities + i;
    struct ball* const ball = area->balls + entity->ref;
    uint8_t flags = 0;
    flags |= (((client->spectating_a_player && client->spectating_client_id == ball->target_client_id) || client_id == ball->target_client_id) << 7);

    if(!client->sent_balls || ball->updated_created) {
      /* CREATE */
      buf[buf_len++] = ball->info->type;
      memcpy(buf + buf_len, &entity->x, sizeof(float));
      buf_len += 4;
      memcpy(buf + buf_len, &entity->y, sizeof(float));
      buf_len += 4;
      memcpy(buf + buf_len, &entity->r, sizeof(float));
      buf_len += 4;
      buf[buf_len++] = flags;
      ++updated;
    } else if(ball->updated_removed) {
      /* DELETE */
      if(client->sent_balls) {
        buf[buf_len++] = 0;
        ++updated;
      } else {
        buf_len -= 2;
      }
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
      if(save == buf_len && flags == 0) {
        buf_len -= 2;
      } else {
        buf[buf_len++] = flags;
        ++updated;
      }
    }
  } GRID_ROF();
  
  client->sent_balls = 1;
  
  if(!updated) {
    buf_len -= 3;
  } else {
    buf[that_idx] = updated;
    buf[that_idx + 1] = updated >> 8;
  }
}

void send_chat(const struct client* const client) {
  uint8_t updated = 0;
  buf[buf_len++] = server_opcode_chat;
  const uint32_t that_idx = buf_len;
  ++buf_len;

  for(uint8_t i = 0; i < max_players; ++i) {
    const struct client* const peer = clients + i;
    if((peer->body_in_area && peer->body_area_id == client->camera_area_id) || peer->chat_len == 0) continue;
    buf[buf_len++] = peer->name_len;
    memcpy(buf + buf_len, peer->name, peer->name_len);
    buf_len += peer->name_len;
    buf[buf_len++] = peer->chat_len;
    memcpy(buf + buf_len, peer->chat, peer->chat_len);
    buf_len += peer->chat_len;
    ++updated;
  }

  if(!updated) {
    buf_len -= 2;
  } else {
    buf[that_idx] = updated;
  }
}

static void send_upstream(void) {
  uint8_t payload[2] = { clients_len, max_players };
  assert(!tcp_send(&sock, &((struct data_frame) {
    .data = (char*) payload,
    .len = 2,
    .read_only = 0,
    .dont_free = 1,
    .free_onerr = 0
  })));
}

static void tick(void* nil) {
  game_lock();
  if(current_tick % ((1000 / tick_interval) * 2) == 0) {
    send_upstream();
  }
  for(uint8_t i = 0; i < max_players; ++i) {
    struct client* const client = clients + i;
    if(!client->body_in_area) continue;
    const struct grid_entity* const entity = &client->entity;
    for(uint8_t j = i + 1; j < max_players; ++j) {
      if(client->body_area_id != clients[j].body_area_id) continue;
      const struct grid_entity* const ent = &clients[j].entity;
      const float dist_sq = (entity->x - ent->x) * (entity->x - ent->x) + (entity->y - ent->y) * (entity->y - ent->y);
      if(dist_sq < (entity->r + ent->r) * (entity->r + ent->r)) {
        player_collide(clients + i, clients + j);
      }
    }
    struct area* const area = areas + client->body_area_id;
    for(uint8_t x = entity->min_x; x <= entity->max_x; ++x) {
      for(uint8_t y = entity->min_y; y <= entity->max_y; ++y) {
        for(uint32_t j = area->grid.cells[(uint16_t) x * area->grid.cells_y + y]; j != 0; j = area->grid.node_entities[j].next) {
          const struct grid_entity* const ent = area->grid.entities + area->grid.node_entities[j].ref;
          const float dist_sq = (entity->x - ent->x) * (entity->x - ent->x) + (entity->y - ent->y) * (entity->y - ent->y);
          if(dist_sq < (entity->r + ent->r) * (entity->r + ent->r)) {
            player_collide_ball(clients + i, area, ent);
          }
        }
      }
    }
  }
  for(uint8_t i = 0; i < max_players; ++i) {
    if(!clients[i].init) continue;
    player_tick(clients + i);
  }
  for(uint8_t i = 1; i < areas_used; ++i) {
    if(areas[i].players_len == 0) continue;
    grid_update(&areas[i].grid);
  }
  ++current_tick;
  if(IS_SEND_TICK) {
    for(uint8_t client_id = 0; client_id < max_players; ++client_id) {
      struct client* const client = clients + client_id;
      if(!client->init) continue;
      assert(client->camera_in_area);
      if(client->spectating_a_player) {
        buf[0] = client->spectating_client_id;
      } else if(client->body_in_area) {
        buf[0] = client_id;
      } else if(area_bodies == 0) {
        buf[0] = UINT8_MAX;
      } else {
        buf[0] = client->spectating_client_id;
      }
      buf[1]  = client->spectating_a_player;
      buf[1] |= client->body_in_area << 1;
      buf[1] |= (area_bodies == client->body_in_area) << 2;
      buf[1] |= client->updated_tp << 3;
      buf[2]  = areas[client->camera_area_id].area_info_id;
      buf_len = 3;
      send_players(client);
      send_balls(client);
      send_chat(client);
      game_send(client_id, buf, buf_len);
    }
    for(uint8_t i = 0; i < max_players; ++i) {
      if(!clients[i].init) continue;
      player_reset(clients + i);
    }
  }
  game_unlock();
}

static void socket_onevent(struct tcp_socket* socke, enum tcp_event event) {
  switch(event) {
    case tcp_open: {
      tcp_socket_nodelay_on(socke);
      tcp_socket_keepalive_on(socke);
      send_upstream();
      break;
    }
    case tcp_data: assert(0);
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

static void start_game(void) {
  const uint64_t start = time_get_time();
  puts("Initialising area traversal...");
  for(uint8_t i = 0; i < area_infos_size; ++i) {
    area_traversal[i] = i;
  }
  for(uint8_t k = 0; k < 10; ++k) {
    for(uint8_t i = 0; i < area_infos_size; ++i) {
      const uint8_t idx = fast_rand() % area_infos_size;
      const uint8_t temp = area_traversal[idx];
      area_traversal[idx] = area_traversal[i];
      area_traversal[i] = temp;
    }
  }
  puts("Initialising commands...");
  init_commands();
  puts("Initialising client memory data...");
  uint32_t total = 0;
  for(uint8_t i = 0; i < area_infos_size; ++i) {
    const struct tile_info* const info = area_infos[i]->tile_info;
    total += info->width * info->height + 3 + 2 + 2;
    for(uint8_t x = 0; x < info->width; ++x) {
      for(uint8_t y = 0; y < info->height; ++y) {
        if(info->tiles[(uint16_t) x * info->height + y] != tile_wall) {
          if(x == 0) {
            total += 2;
          }
          if(x + 1 == info->width) {
            total += 2;
          }
          if(y == 0) {
            total += 2;
          }
          if(y + 1 == info->height) {
            total += 2;
          }
          if(info->tiles[(uint16_t) x * info->height + y] == tile_teleport) {
            ++total;
          }
          continue;
        }
        if(x != 0 && info->tiles[(uint16_t) (x - 1) * info->height + y] != tile_wall) {
          total += 2;
        }
        if(x + 1 != info->width && info->tiles[(uint16_t) (x + 1) * info->height + y] != tile_wall) {
          total += 2;
        }
        if(y != 0 && info->tiles[(uint16_t) x * info->height + y - 1] != tile_wall) {
          total += 2;
        }
        if(y + 1 != info->height && info->tiles[(uint16_t) x * info->height + y + 1] != tile_wall) {
          total += 2;
        }
      }
    }
  }
  printf("Client data size: %.2fkb\n", total / 1000.0f);
  uint8_t* const data = malloc(total);
  assert(data);
  uint32_t idx = 0;
  for(uint8_t i = 0; i < area_infos_size; ++i) {
    const struct tile_info* const info = area_infos[i]->tile_info;
    data[idx++] = info->width;
    data[idx++] = info->height;
    data[idx++] = info->cell_size;



    struct area_data* const a_data = area_data + i;
    uint8_t ok = 1;
    for(const struct ball_info* b_info = area_infos[i]->balls; b_info->type != ball_invalid; ++b_info) {
      if(b_info->spawn) {
        a_data->spawn_ball_len += b_info->count;
      }
      if(b_info->die_on_collision) {
        ok = 0;
      } else if(ok) {
        a_data->const_ball_len += b_info->count;
      }
    }
    if(a_data->spawn_ball_len == 0) {
      a_data->spawn_ball_len = 1;
    }

    const uint16_t len = (uint16_t) info->width * info->height;
    a_data->tiles = malloc(sizeof(*a_data->tiles) * len);
    assert(a_data->tiles);
    a_data->wall_tiles = malloc(sizeof(*a_data->wall_tiles) * len);
    assert(a_data->wall_tiles);
    for(uint8_t x = 0; x < info->width; ++x) {
      for(uint8_t y = 0; y < info->height; ++y) {
        uint8_t _ok;
        uint8_t _wall_ok;
        switch(info->tiles[x * info->height + y]) {
          case tile_wall: {
            _ok = 0;
            _wall_ok = 1;
            break;
          }
          case tile_path: {
            _ok = 1;
            _wall_ok = 1;
            break;
          }
          default: {
            _ok = 0;
            _wall_ok = 0;
            break;
          }
        }
        if(_ok) {
          a_data->tiles[a_data->tiles_len++] = (struct a_pos) { .tile_x = x, .tile_y = y };
        }
        if(_wall_ok) {
          a_data->wall_tiles[a_data->wall_tiles_len++] = (struct a_pos) { .tile_x = x, .tile_y = y };
        }
      }
    }
    a_data->tiles = realloc(a_data->tiles, sizeof(*a_data->tiles) * a_data->tiles_len);
    assert(a_data->tiles);
    a_data->wall_tiles = realloc(a_data->wall_tiles, sizeof(*a_data->wall_tiles) * a_data->wall_tiles_len);
    assert(a_data->wall_tiles);

    data[idx++] = area_data[i].const_ball_len;
    data[idx++] = area_data[i].const_ball_len >> 8;
    memcpy(data + idx, info->tiles, len);
    idx += len;
    uint16_t edges = 0;
    for(uint8_t x = 0; x < info->width; ++x) {
      for(uint8_t y = 0; y < info->height; ++y) {
        if(info->tiles[(uint16_t) x * info->height + y] != tile_wall) {
          if(x == 0) {
            data[idx++] = x;
            data[idx++] = y;
            ++edges;
          }
          if(x + 1 == info->width) {
            data[idx++] = x + 1;
            data[idx++] = y;
            ++edges;
          }
          continue;
        }
        if(x != 0 && info->tiles[(uint16_t) (x - 1) * info->height + y] != tile_wall) {
          data[idx++] = x;
          data[idx++] = y;
          ++edges;
        }
        if(x + 1 != info->width && info->tiles[(uint16_t) (x + 1) * info->height + y] != tile_wall) {
          data[idx++] = x + 1;
          data[idx++] = y;
          ++edges;
        }
      }
    }
    data[idx++] = 255;
    edges = 0;
    for(uint8_t x = 0; x < info->width; ++x) {
      for(uint8_t y = 0; y < info->height; ++y) {
        if(info->tiles[(uint16_t) x * info->height + y] != tile_wall) {
          if(y == 0) {
            data[idx++] = x;
            data[idx++] = y;
            ++edges;
          }
          if(y + 1 == info->height) {
            data[idx++] = x;
            data[idx++] = y + 1;
            ++edges;
          }
          continue;
        }
        if(y != 0 && info->tiles[(uint16_t) x * info->height + y - 1] != tile_wall) {
          data[idx++] = x;
          data[idx++] = y;
          ++edges;
        }
        if(y + 1 != info->height && info->tiles[(uint16_t) x * info->height + y + 1] != tile_wall) {
          data[idx++] = x;
          data[idx++] = y + 1;
          ++edges;
        }
      }
    }
    data[idx++] = 255;
    for(uint8_t x = 0; x < info->width; ++x) {
      for(uint8_t y = 0; y < info->height; ++y) {
        if(info->tiles[(uint16_t) x * info->height + y] != tile_teleport) continue;
        uint8_t found = 0;
        for(uint8_t j = 0; j < area_infos[i]->teleport_tiles_len; ++j) {
          const struct teleport* const teleport = area_infos[i]->teleport_tiles + j;
          if(x != teleport->pos.tile_x || y != teleport->pos.tile_y) continue;
          found = 1;
          if(teleport->dest.area_info_id == i) {
            data[idx++] = 0;
          } else if(area_infos[i]->has_top && teleport->dest.area_info_id == area_infos[i]->top) {
            data[idx++] = 1;
          } else if(area_infos[i]->has_left && teleport->dest.area_info_id == area_infos[i]->left) {
            data[idx++] = 2;
          } else if(area_infos[i]->has_right && teleport->dest.area_info_id == area_infos[i]->right) {
            data[idx++] = 3;
          } else if(area_infos[i]->has_bottom && teleport->dest.area_info_id == area_infos[i]->bottom) {
            data[idx++] = 4;
          } else {
            assert(0);
          }
          break;
        }
        if(!found) {
          data[idx++] = 5;
        }
      }
    }
  }
  assert(total == idx);
  const int fd = openat(AT_FDCWD, "../client/memory.mem", O_WRONLY | O_CREAT, 0666);
  assert(fd != -1);
  assert(!ftruncate(fd, total));
  assert(lseek(fd, 0, SEEK_SET) != -1);
  assert(write(fd, data, total) == total);
  assert(fsync(fd) != -1);
  assert(close(fd) != -1);
  free(data);
  puts("Initialising local server...");
  server.on_event = server_onevent;
  assert(!tcp_server(&server, &((struct tcp_server_options) {
    .hostname = "127.0.0.1",
    .port = "23456",
    .backlog = 2
  })));
  printf("Init done in %lums\n", time_ns_to_ms(time_get_time() - start));
  assert(!time_add_interval(&timers, &((struct time_interval) {
    .base_time = time_get_time(),
    .interval = time_ms_to_ns(tick_interval),
    .func = tick
  })));
}

void game_onmessage(const uint8_t client_id, const uint8_t* msg, const uint32_t len) {
  struct client* const client = clients + client_id;
  const uint8_t opcode = msg[0];
  if(!client->init && opcode != client_opcode_init) {
    goto close;
  }
  uint8_t spec_op;
  ++msg;
  switch(opcode) {
    case client_opcode_spawn: {
      if(!client->named) {
        goto close;
      }
      player_spawn(client);
      break;
    }
    case client_opcode_movement: {
      if(len != 6) {
        goto close;
      }
      memcpy(&client->angle, msg, sizeof(float));
      client->speed = msg[4];
      break;
    }
    case client_opcode_chat: {
      if(!client->named) {
        goto close;
      }
      uint8_t chat_len = len - 1;
      if(chat_len > max_chat_message_len) {
        goto close;
      }
      /* Number of messages ratelimit */
      client->chat_timestamps[client->chat_timestamp_idx] = time_get_time();
      const uint8_t next_idx = (client->chat_timestamp_idx + 1) % max_chat_timestamps;
      const uint64_t diff = client->chat_timestamps[client->chat_timestamp_idx] - client->chat_timestamps[next_idx];
      if(diff < time_sec_to_ns(1) * (max_chat_timestamps - 1)) {
        goto close;
      }
      client->chat_timestamp_idx = next_idx;
      if(chat_len == 0) {
        goto out2;
      }
      /* Trim whitespace */
      uint8_t start = 0;
      uint8_t end = start + chat_len - 1;
      while(whitespace_chars[msg[start]] && ++start == chat_len) goto out2;
      while(whitespace_chars[msg[end]]) --end;
      chat_len = end - start + 1;
      /* Process */
      memcpy(client->chat, msg + start, chat_len);
      const struct command_def* command_def = find_command(client->chat, chat_len);
      enum game_command command;
      if(command_def == NULL ||
         (!client->body_in_area && !command_def->out_game) ||
         (client->body_in_area && !command_def->in_game) ||
         (!client->admin && command_def->admin)) {
        command = command_invalid;
      } else {
        command = command_def->command;
      }
      switch(command) {
        case command_invalid: {
          client->chat_len = chat_len;
          break;
        }
        case command_die: {
          player_down(client);
          break;
        }
        case command_menu: {
          if(client->body_in_area) {
            client_remove(client);
          }
          client->spectating_a_player = 0;
          break;
        }
        case command_spectate: {
          spec_op = 0;
          goto spectate;
        }
        case command_godmode: {
          client->godmode ^= 1;
          if(client->godmode) {
            player_revive(client);
          }
          break;
        }
        case command_server_reboot: {
          sync();
          reboot(RB_AUTOBOOT);
          break;
        }
        case command_server_restart: {
          exit(0);
        }
        case command_undying: {
          client->undying ^= 1;
          if(client->undying) {
            player_revive(client);
          }
          break;
        }
        default: assert(0);
      }
      out2:
      break;
    }
    case client_opcode_name: {
      if(client->body_in_area) {
        goto close;
      }
      const uint8_t name_len = len - 1;
      if(name_len > max_name_len) {
        goto close;
      }
      if(name_len != 0) {
        uint8_t start = 0;
        uint8_t end = start + name_len - 1;
        while(whitespace_chars[msg[start]] && ++start == name_len) goto out1;
        while(whitespace_chars[msg[end]]) --end;
        client->name_len = end - start + 1;
        memcpy(client->name, msg + start, client->name_len);
        out1:;
      }
      client->named = 1;
      break;
    }
    case client_opcode_spec: {
      spec_op = msg[0];
      spectate:
      if(area_bodies == client->body_in_area) {
        break;
      }
      if(spec_op == 0) {
        if(client->spectating_a_player) {
          client->spectating_a_player = 0;
          if(client->body_in_area) {
            add_client_camera_to_area(client, areas[client->body_area_id].area_info_id);
          } else {
            client_start_spectating(client);
          }
        } else {
          client->spectating_a_player = 1;
          if(client->body_in_area) {
            client_set_spectated_player(client, client_id);
          } else {
            for(uint8_t i = 0;; ++i) {
              if(!clients[i].body_in_area) continue;
              client_set_spectated_player(client, i);
              break;
            }
          }
        }
      } else if(client->spectating_a_player) {
        if(spec_op != 1 && spec_op != 255) {
          goto close;
        }
        uint8_t i = client->spectating_client_id;
        while(1) {
          const uint8_t temp = i + spec_op;
          i = temp % max_players;
          if(!clients[i].body_in_area) continue;
          client_set_spectated_player(client, i);
          break;
        }
      }
      break;
    }
    case client_opcode_init: {
      if(client->init) {
        goto close;
      }
      if(tokens_active) {
        if(len == sizeof(tokens[0]) + 1) {
          uint8_t ok = 0;
          for(uint8_t i = 0; i < tokens_len; ++i) {
            if(!memcmp(msg, tokens[i], sizeof(tokens[0]))) {
              ok = 1;
              break;
            }
          }
          if(!ok) {
            goto close;
          } else {
            client->admin = 1;
          }
        } else if(token_required || len != 1) {
          goto close;
        }
      }
      client->init = 1;
      client_start_spectating(client);
      break;
    }
    default: goto close;
  }
  return;

  close:
  client_close(client);
}

void game_onclose(const uint8_t client_id) {
  struct client* const client = clients + client_id;
  client->already_closed = 1;
  client_close(client);
}

int main() {
  fast_srand(time_get_time());
  assert(!time_timers(&timers));
  assert(!time_start(&timers));
  start_game();
  run_server();
  assert(0);
}
