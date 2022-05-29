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
  uint8_t  exists:1;
  uint8_t  deleted_by_above:1;
  uint8_t  updated_x:1;
  uint8_t  updated_y:1;
  uint8_t  updated_r:1;
  uint8_t  type;
  uint8_t  client_id;
  uint8_t  speed;
  float    movement_speed;
  float    angle;
  char     name[5];
};

static struct client clients[256] = {0};

static uint32_t current_tick = UINT32_MAX;

int error_handler(int err, int count) {
  if(err == 0 || err == EINTR) return 0;
  return -1;
}

static int ball_tick(struct grid*, struct grid_entity*);

static int player_tick(struct grid*, struct grid_entity*);

static void player_collide(struct grid*, struct grid_entity*, struct grid_entity*);

/*
 * =================================== AREA ===================================
 */

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
  areas[idx].players.cells_x = area_infos[area_info_id].tile_info->width;
  areas[idx].players.cells_y = area_infos[area_info_id].tile_info->height;
  areas[idx].players.cell_size = cell_size;
  areas[idx].players.update = player_tick;
  areas[idx].players.collide = player_collide;
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
}

static void set_player_pos_to_area_spawn_tiles(const uint8_t client_id) {
  const struct area* const area = areas + clients[client_id].area_id;
  const struct pos pos = area_infos[area->area_info_id].spawn_tiles[rand() % area_infos[area->area_info_id].spawn_tiles_len];
  set_player_pos_to_tile(client_id, pos.tile_x, pos.tile_y);
}

static void remove_client_from_its_area(const uint16_t client_id) {
  const struct client* const client = clients + client_id;
  grid_remove(&areas[client->area_id].players, client->entity_id);
  if(--areas[client->area_id].players_len == 0) {
    grid_free(&areas[client->area_id].balls);
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
  ++areas[area_id].players_len;
}

/*
 * =================================== TICK ===================================
 */

static int ball_tick(struct grid* g, struct grid_entity* ball) {
  
}

static int player_tick(struct grid* g, struct grid_entity* player) {
  struct client* const client = clients + player->ref;
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
  
  const struct area* const area = areas + client->area_id;
  const struct tile_info* const info = area_infos[area->area_info_id].tile_info;
  const struct grid* const player_grid = &area->players;
  const struct grid* const ball_grid = &area->balls;
  
  const float save_x = player->x;
  const float save_y = player->y;
  const float save_r = player->r;
  
  if(client->speed != 0) {
    player->x += cosf(client->angle) * client->movement_speed * (client->speed / 255.0f);
    player->y += sinf(client->angle) * client->movement_speed * (client->speed / 255.0f);
  }
  if(player->x < player->r) {
    player->x = player->r;
  } else {
    const uint32_t temp = (uint32_t) area->balls.cells_x * cell_size;
    if(player->x > temp - player->r) {
      player->x = temp - player->r;
    }
  }
  if(player->y < player->r) {
    player->y = player->r;
  } else {
    const uint32_t temp = (uint32_t) area->balls.cells_y * cell_size;
    if(player->y > temp - player->r) {
      player->y = temp - player->r;
    }
  }
  
  grid_recalculate(player_grid, player);
  
  float postpone_x;
  float postpone_y;
  
  for(uint16_t cell_x = player->min_x; cell_x <= player->max_x; ++cell_x) {
    for(uint16_t cell_y = player->min_y; cell_y <= player->max_y; ++cell_y) {
      if(info->tiles[(uint32_t) cell_x * info->height + cell_y] != tile_wall) continue;
      float x = (uint32_t) cell_x * cell_size;
      float y = (uint32_t) cell_y * cell_size;
      const float mid_x = x + half_cell_size;
      if(fabs(player->x - mid_x) >= half_cell_size + player->r) continue;
      const float mid_y = y + half_cell_size;
      if(fabs(player->y - mid_y) >= half_cell_size + player->r) continue;
      if(player->x < mid_x) {
        if(player->y < mid_y) {
          /* Top Left */
          if(player->y >= y && player->x + player->r > x) {
            player->x = x - player->r;
            updated.collided = 1;
            continue;
          }
          if(player->x >= x && player->y + player->r > y) {
            player->y = y - player->r;
            updated.collided = 1;
            continue;
          }
        } else {
          /* Bottom Left */
          y += cell_size;
          if(player->y <= y && player->x + player->r > x) {
            player->x = x - player->r;
            updated.collided = 1;
            continue;
          }
          if(player->x >= x && player->y - player->r < y) {
            player->y = y + player->r;
            updated.collided = 1;
            continue;
          }
        }
      } else {
        if(player->y < mid_y) {
          /* Top Right */
          x += cell_size;
          if(player->y >= y && player->x - player->r < x) {
            player->x = x + player->r;
            updated.collided = 1;
            continue;
          }
          if(player->x <= x && player->y + player->r > y) {
            player->y = y - player->r;
            updated.collided = 1;
            continue;
          }
        } else {
          /* Bottom Right */
          x += cell_size;
          y += cell_size;
          if(player->y <= y && player->x - player->r < x) {
            player->x = x + player->r;
            updated.collided = 1;
            continue;
          }
          if(player->x <= x && player->y - player->r < y) {
            player->y = y + player->r;
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
    const float dist_sq = (postpone_x - player->x) * (postpone_x - player->x) + (postpone_y - player->y) * (postpone_y - player->y);
    if(dist_sq < player->r * player->r) {
      const float angle = atan2f(player->y - postpone_y, player->x - postpone_x);
      player->x = postpone_x + cosf(angle) * player->r;
      player->y = postpone_y + sinf(angle) * player->r;
    }
  }
  
  grid_recalculate(player_grid, player);
  
  for(uint16_t cell_x = player->min_x; cell_x <= player->max_x; ++cell_x) {
    for(uint16_t cell_y = player->min_y; cell_y <= player->max_y; ++cell_y) {
      if(info->tiles[cell_x * info->height + cell_y] != tile_teleport) continue;
      const float mid_x = (uint32_t) cell_x * cell_size + half_cell_size;
      const float dist_x = fabs(player->x - mid_x);
      if(dist_x >= half_cell_size + player->r) continue;
      const float mid_y = (uint32_t) cell_y * cell_size + half_cell_size;
      const float dist_y = fabs(player->y - mid_y);
      if(dist_y >= half_cell_size + player->r) continue;
      if(dist_x < half_cell_size) goto true;
      if(dist_y < half_cell_size) goto true;
      if((dist_x - half_cell_size) * (dist_x - half_cell_size) +
        (dist_y - half_cell_size) * (dist_y - half_cell_size) >= player->r * player->r) continue;
      true:;
      const struct teleport_dest dest = dereference_teleport(area->area_info_id, cell_x, cell_y);
      if(dest.area_info_id == area->area_info_id) {
        if(dest.random_spawn) {
          set_player_pos_to_area_spawn_tiles(player->ref);
        } else {
          set_player_pos_to_tile(player->ref, dest.tile_x, dest.tile_y);
        }
        goto after_tp;
      } else {
        const uint8_t client_id = player->ref;
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
  
  grid_recalculate(player_grid, player);
  
  updated.x = player->x != save_x;
  updated.y = player->y != save_y;
  updated.r = player->r != save_r;
  
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

static void player_collide(struct grid* g, struct grid_entity* a, struct grid_entity* b) {
  
}

static void send_players(const uint8_t id) {
  uint8_t updated = 0;
  buf[buf_len++] = 1;
  const uint32_t that_idx = buf_len;
  ++buf_len;
  struct grid* const players = &areas[clients[id].area_id].players;
  
  uint8_t i = 0;
  do {
    uint8_t* const sees = clients[id].sees_clients + (i >> 3);
    const uint8_t bit = 1 << (i & 7);
    buf[buf_len++] = i;
    if(clients[i].exists) {
      if(clients[i].area_id == clients[id].area_id) {
        if(*sees & bit) {
          /* UPDATE */
          const uint32_t save = buf_len;
          if(clients[i].updated_x) {
            buf[buf_len++] = 1;
            memcpy(buf + buf_len, &players->entities[clients[i].entity_id].x, sizeof(float));
            buf_len += 4;
          }
          if(clients[i].updated_y) {
            buf[buf_len++] = 2;
            memcpy(buf + buf_len, &players->entities[clients[i].entity_id].y, sizeof(float));
            buf_len += 4;
          }
          if(clients[i].updated_r) {
            buf[buf_len++] = 3;
            memcpy(buf + buf_len, &players->entities[clients[i].entity_id].r, sizeof(float));
            buf_len += 4;
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
          memcpy(buf + buf_len, &players->entities[clients[i].entity_id].x, sizeof(float));
          buf_len += 4;
          memcpy(buf + buf_len, &players->entities[clients[i].entity_id].y, sizeof(float));
          buf_len += 4;
          memcpy(buf + buf_len, &players->entities[clients[i].entity_id].r, sizeof(float));
          buf_len += 4;
          buf[buf_len] = strlen(clients[i].name);
          memcpy(buf + buf_len + 1, clients[i].name, buf[buf_len]);
          buf_len += buf[buf_len] + 1;
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

void send_balls(const uint8_t id) {
  
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
  for(uint16_t j = 0; j < areas_used; ++j) {
    if(!areas[j].exists) continue;
    //grid_crosscollide(&areas[j].players, &areas[j].balls);
    //grid_collide(&areas[j].players);
    grid_update(&areas[j].players);
    grid_update(&areas[j].balls);
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
  printf("close_client(%hhu)\n", client_id);
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
    close_client(client_id);
    return;
  }
  if(!clients[client_id].got_name) {
    if(buffer[len] != 0) {
      close_client(client_id);
      return;
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
      close_client(client_id);
      return;
    }
    /* Update the player */
    memcpy(&clients[client_id].angle, buffer + 2, sizeof(float));
    clients[client_id].speed = buffer[6];
  }
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
  srand(time_get_time());
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