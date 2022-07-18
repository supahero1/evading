#ifndef game_consts_h
#define game_consts_h 1

#include <stdint.h>

/* MAX 65534 balls in one area */

enum game_const {
  send_interval = 4,
  tick_interval = 40 / send_interval,
  default_player_radius = 19,
  default_area_info_id = 0,
  idle_timeout = (1000 / tick_interval) * 60 * 15,
  chat_timeout = (1000 / tick_interval) * 1,
  spectating_interval = (1000 / tick_interval) * 10,
  token_required = 1,
  max_players = 100,
  max_chat_message_len = 128,
  max_chat_timestamps = 6, /* in main.js this is -1 */
  max_name_len = 16
};

#define base_tick_interval (40.0f)
#define time_scale (tick_interval / base_tick_interval)
#define default_player_speed (15.0f * time_scale)

enum server_opcodes {
  server_opcode_area,
  server_opcode_players,
  server_opcode_balls,
  server_opcode_chat,
  server_opcode_minimap
};

enum client_opcodes {
  client_opcode_spawn,
  client_opcode_movement,
  client_opcode_chat,
  client_opcode_name
};

enum ball_type {
  ball_invalid,
  
  ball_grey,
  ball_pink,
  ball_teal,
  ball_sandy,
  ball_light_blue,
  ball_purple
};

enum radius_type {
  radius_fixed,
  radius_random,
  radius_relative
};

enum position_type {
  position_random,
  position_random_in_range,
  position_tile_random,
  position_tile_random_in_range,
  position_tile_random_in_range_snap_to_tiles,
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

enum spawn_idx_type {
  spawn_idx_fixed,
  spawn_idx_random,
  spawn_idx_relative
};

enum range_type {
  range_none,
  range_fixed,
  range_random,
  range_relative
};

struct ball_info {
  const uint8_t type;
  const uint8_t radius_type:2;
  const uint8_t position_type:3;
  const uint8_t movement_type:3;
  const uint8_t frequency_type:3;
  const uint8_t tick_type:2;
  const uint8_t spawn_idx_type:2;
  const uint8_t range_type:2;
  const uint8_t allow_walls:1;
  const uint8_t die_on_collision:1;
  const uint16_t count;
  union {
    struct {
      const uint32_t frequency_num;
      const uint32_t frequency_num_min;
      const uint32_t frequency_num_max;
    };
    struct {
      const float frequency_float;
      const float frequency_float_min;
      const float frequency_float_max;
    };
  };
  const float speed;
  const float angle;
  union {
    struct {
      const float x;
      const float y;
    };
    struct {
      const float x_min;
      const float x_max;
      const float y_min;
      const float y_max;
    };
    struct {
      const uint8_t tile_x;
      const uint8_t tile_y;
    };
    struct {
      const uint8_t tile_x_min;
      const uint8_t tile_x_max;
      const uint8_t tile_y_min;
      const uint8_t tile_y_max;
    };
  };
  union {
    const float r;
    const float r_min;
  };
  const float r_max;
  const float vx;
  const float vy;
  const uint64_t tick;
  const uint64_t tick_min;
  const uint64_t tick_max;
  const struct ball_info* const spawn;
  const uint16_t spawn_idx;
  const uint16_t spawn_idx_min;
  const uint16_t spawn_idx_max;
  const float range;
  const float range_min;
  const float range_max;
  const uint32_t relative_entity_id;
};

enum game_tile {
  tile_path,
  tile_safe,
  tile_wall,
  tile_teleport
};

struct tile_info {
  const uint8_t width;
  const uint8_t height;
  const uint8_t cell_size;
  const uint8_t* const tiles;
};

struct pos {
  const uint8_t tile_x;
  const uint8_t tile_y;
};

struct teleport_dest {
  const uint8_t area_info_id;
  const struct pos pos;
  const uint8_t not_random_spawn:1;
};

struct teleport {
  const struct pos pos;
  const struct teleport_dest dest;
};

struct teleport_min {
  const uint8_t tile_x;
  const uint8_t tile_y;
  const uint8_t target;
};

struct area_info {
  const struct tile_info* const tile_info;
  const struct ball_info* const balls;
  const struct pos* const spawn_tiles;
  const struct teleport* const teleport_tiles;
  const struct teleport_min* const serial;
  const uint8_t spawn_tiles_len;
  const uint8_t teleport_tiles_len;
  const uint8_t top;
  const uint8_t left;
  const uint8_t right;
  const uint8_t bottom;
  const uint8_t has_top:1;
  const uint8_t has_left:1;
  const uint8_t has_right:1;
  const uint8_t has_bottom:1;
};

#define area_infos_size 4

extern const struct area_info* area_infos[area_infos_size];

extern const uint8_t whitespace_chars[256];

extern const struct area_info area_000;
extern const struct area_info area_001;
extern const struct area_info area_002;
extern const struct area_info area_003;
extern const struct area_info area_004;
extern const struct area_info area_005;
extern const struct area_info area_006;
extern const struct area_info area_007;
extern const struct area_info area_008;
extern const struct area_info area_009;

#endif // game_consts_h