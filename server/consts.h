#ifndef game_consts_h
#define game_consts_h 1

#include <stdint.h>

enum game_const {
  send_interval = 4,
  tick_interval = 40 / send_interval,
  player_radius = 19,
  default_area_id = 0
};

#define base_tick_interval (40.0f)
#define time_scale (tick_interval / base_tick_interval)
#define base_player_speed (15.0f * time_scale)

enum ball_type {
  ball_invalid,
  
  ball_grey,
  ball_pink,
  ball_teal,
  ball_sandy
};

enum radius_type {
  radius_fixed,
  radius_random,
  radius_relative
};

enum position_type {
  position_random,
  position_fixed,
  position_tile_fixed,
  position_relative
};

enum movement_type {
  movement_random,
  movement_velocity,
  movement_angle,
  movement_relative_velocity,
  movement_relative_angle
};

enum frequency_type {
  frequency_off,
  frequency_float_random,
  frequency_float_fixed,
  frequency_float_relative,
  frequency_num_random,
  frequency_num_fixed,
  frequency_num_relative
};

enum tick_type {
  tick_fixed,
  tick_random,
  tick_relative
};

enum game_tile {
  tile_normal,
  tile_safe,
  tile_wall,
  tile_teleport
};

struct ball_info {
  uint8_t type;
  uint8_t radius_type:2;
  uint8_t position_type:2;
  uint8_t movement_type:3;
  uint8_t frequency_type:3;
  uint8_t tick_type:2;
  uint8_t allow_walls:1;
  uint8_t die_on_collision:1;
  uint16_t count;
  union {
    struct {
      uint32_t frequency_num;
      uint32_t frequency_num_min;
      uint32_t frequency_num_max;
    };
    struct {
      float frequency_float;
      float frequency_float_min;
      float frequency_float_max;
    };
  };
  float speed;
  float angle;
  union {
    struct {
      float x;
      float y;
    };
    struct {
      uint16_t tile_x;
      uint16_t tile_y;
    };
  };
  union {
    float r;
    float r_min;
  };
  float r_max;
  float vx;
  float vy;
  uint64_t tick;
  uint64_t tick_min;
  uint64_t tick_max;
  struct ball_info* spawn;
  uint32_t spawn_len;
  uint32_t spawn_idx;
  uint32_t relative_entity_id;
};

struct tile_info {
  uint16_t width;
  uint16_t height;
  uint16_t cell_size;
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

extern struct teleport_dest dereference_teleport(const uint16_t, const uint16_t, const uint16_t);

extern struct area_info area_infos[];

#endif // game_consts_h