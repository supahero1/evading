
#ifndef game_consts_h
#define game_consts_h 1

#include <stdint.h>

enum game_const {
  cell_size = 40,
  send_interval = 4,
  tick_interval = 40 / send_interval,
  player_radius = 19,
  default_area_id = 0
};

#define base_tick_interval (40.0f)
#define time_scale (tick_interval / base_tick_interval)
#define base_player_speed (15.0f * time_scale)
#define half_cell_size (cell_size * 0.5f)

enum ball_type {
  ball_invalid,
  
  ball_grey
};

enum game_tile {
  tile_normal,
  tile_safe,
  tile_wall,
  tile_teleport
};

struct ball_info {
  uint8_t type;
  uint8_t fixed_pos:1;
  uint8_t fixed_speed:1;
  uint8_t allow_walls:1;
  uint8_t die_on_collision:1;
  uint16_t count;
  uint16_t tick;
  float speed;
  float x;
  float y;
  float r;
  float vx;
  float vy;
};

struct tile_info {
  uint16_t width;
  uint16_t height;
  uint8_t* tiles;
};

struct pos {
  uint16_t tile_x;
  uint16_t tile_y;
};

struct area_info {
  struct tile_info* tile_info;
  struct ball_info* balls;
  struct pos* spawn_tiles;
  uint32_t spawn_tiles_len;
};

struct teleport_dest {
  uint16_t area_info_id;
  uint16_t tile_x;
  uint16_t tile_y;
  uint16_t random_spawn:1;
};

extern struct teleport_dest dereference_teleport(const uint16_t, const uint32_t, const uint32_t);

extern struct area_info area_infos[];

extern struct tile_info tiles_50x8;

extern struct tile_info test_tiles;

extern struct tile_info test_lol;

#endif // game_consts_h