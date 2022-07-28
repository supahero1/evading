#include "../consts.h"

static const struct tile_info t;

#define FAN_V 4

const struct area_info area_009 = {
  &t,
  (struct ball_info[]) {
    {
      .type = ball_sandy,
      .position_type = position_tile_fixed,
      .tile_x = 18,
      .tile_y = 6,
      .r = 19,
      .speed = 0,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 1000,
      .tick_type = tick_fixed,
      .tick = 1000,
      .spawn = (struct ball_info[]) {
#define BALL \
        { \
          .type = ball_grey, \
          .position_type = position_relative, \
          .r = 10, \
          .movement_type = movement_velocity, \
          .vy = -2, \
          .speed = 2, \
          .count = 1, \
          .die_on_collision = 1 \
        }
        BALL,
        BALL,
        BALL,
        BALL,
#undef BALL
        {
          .type = ball_null
        },
        {0}
      }
    },
    {
      .type = ball_sandy,
      .position_type = position_tile_fixed,
      .tile_x = 20,
      .tile_y = 0,
      .r = 19,
      .speed = 0,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 1000,
      .tick_type = tick_fixed,
      .tick = -1000,
      .spawn = (struct ball_info[]) {
        {
          .type = ball_null
        },
#define BALL \
        { \
          .type = ball_grey, \
          .position_type = position_relative, \
          .r = 10, \
          .movement_type = movement_velocity, \
          .vx = -2, \
          .speed = 2, \
          .count = 1, \
          .die_on_collision = 1 \
        }
        BALL,
        BALL,
        BALL,
        BALL,
#undef BALL
        {0}
      }
    },

    {
      .type = ball_sandy,
      .position_type = position_tile_fixed,
      .tile_x = 0,
      .tile_y = 10,
      .r = 19,
      .speed = 0,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 500,
      .spawn = (struct ball_info[]) {
        {
          .type = ball_null
        },
        {
          .type = ball_null
        },
#define BALL \
        { \
          .type = ball_grey, \
          .position_type = position_relative, \
          .r = 10, \
          .movement_type = movement_velocity, \
          .vx = 3, \
          .speed = 3, \
          .count = 1, \
          .die_on_collision = 1 \
        }
        BALL,
        BALL,
        BALL,
        BALL,
        BALL,
        BALL,
        BALL,
        BALL,
#undef BALL
        {
          .type = ball_null
        },
        {
          .type = ball_null
        },
        {0}
      }
    },
    {
      .type = ball_sandy,
      .position_type = position_tile_fixed,
      .tile_x = 0,
      .tile_y = 11,
      .r = 19,
      .speed = 0,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 500,
      .spawn = (struct ball_info[]) {
#define BALL \
        { \
          .type = ball_grey, \
          .position_type = position_relative, \
          .r = 10, \
          .movement_type = movement_velocity, \
          .vx = 3, \
          .speed = 3, \
          .count = 1, \
          .die_on_collision = 1 \
        }
        BALL,
        {
          .type = ball_null
        },
        {
          .type = ball_null
        },
        {
          .type = ball_null
        },
        {
          .type = ball_null
        },
        BALL,
        BALL,
        {
          .type = ball_null
        },
        {
          .type = ball_null
        },
        {
          .type = ball_null
        },
        {
          .type = ball_null
        },
        BALL,
#undef BALL
        {0}
      }
    },
    {
      .type = ball_sandy,
      .position_type = position_tile_fixed,
      .tile_x = 0,
      .tile_y = 12,
      .r = 19,
      .speed = 0,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 500,
      .spawn = (struct ball_info[]) {
#define BALL \
        { \
          .type = ball_grey, \
          .position_type = position_relative, \
          .r = 10, \
          .movement_type = movement_velocity, \
          .vx = 3, \
          .speed = 3, \
          .count = 1, \
          .die_on_collision = 1 \
        }
        BALL,
        BALL,
        BALL,
        BALL,
        {
          .type = ball_null
        },
        {
          .type = ball_null
        },
        {
          .type = ball_null
        },
        {
          .type = ball_null
        },
        BALL,
        BALL,
        BALL,
        BALL,
#undef BALL
        {0}
      }
    },
#define FAN \
      .type = ball_teal, \
      .position_type = position_tile_fixed, \
      .movement_type = movement_velocity, \
      .radius_type = radius_fixed, \
      .r = 10, \
      .count = 1, \
      .frequency_type = frequency_float_fixed, \
      .frequency_float = M_PI * 0.08 * FAN_V
    {
      FAN,
      .tile_x = 13,
      .tile_y = 4,
      .vx = FAN_V,
      .speed = FAN_V
    },
    {
      FAN,
      .tile_x = 13,
      .tile_y = 3,
      .vx = FAN_V * 2,
      .speed = FAN_V * 2
    },
    {
      FAN,
      .tile_x = 13,
      .tile_y = 2,
      .vx = FAN_V * 3,
      .speed = FAN_V * 3
    },
    {
      FAN,
      .tile_x = 14,
      .tile_y = 5,
      .vy = FAN_V,
      .speed = FAN_V
    },
    {
      FAN,
      .tile_x = 15,
      .tile_y = 5,
      .vy = FAN_V * 2,
      .speed = FAN_V * 2
    },
    {
      FAN,
      .tile_x = 16,
      .tile_y = 5,
      .vy = FAN_V * 3,
      .speed = FAN_V * 3
    },
    {
      FAN,
      .tile_x = 13,
      .tile_y = 6,
      .vx = -FAN_V,
      .speed = FAN_V
    },
    {
      FAN,
      .tile_x = 13,
      .tile_y = 7,
      .vx = -FAN_V * 2,
      .speed = FAN_V * 2
    },
    {
      FAN,
      .tile_x = 13,
      .tile_y = 8,
      .vx = -FAN_V * 3,
      .speed = FAN_V * 3
    },
    {
      FAN,
      .tile_x = 12,
      .tile_y = 5,
      .vy = -FAN_V,
      .speed = FAN_V
    },
    {
      FAN,
      .tile_x = 11,
      .tile_y = 5,
      .vy = -FAN_V * 2,
      .speed = FAN_V * 2
    },
    {
      FAN,
      .tile_x = 10,
      .tile_y = 5,
      .vy = -FAN_V * 3,
      .speed = FAN_V * 3
    },
#undef FAN
#define TURRET \
      .type = ball_light_blue, \
      .position_type = position_tile_fixed, \
      .r = 10, \
      .count = 1, \
      .frequency_type = frequency_num_fixed, \
      .frequency_num = 100, \
      .speed = 0, \
      .tick = 100, \
      .range_type = range_fixed, \
      .range = 45, \
      .spawn = (struct ball_info[]) { \
        { \
          .type = ball_grey, \
          .position_type = position_relative, \
          .movement_type = movement_relative_angle, \
          .r = 2, \
          .speed = 10, \
          .count = 1, \
          .die_on_collision = 1 \
        }, \
        {0} \
      }
    {
      TURRET,
      .tile_x = 1,
      .tile_y = 8
    },
    {
      TURRET,
      .tile_x = 1,
      .tile_y = 7
    },
    {
      TURRET,
      .tile_x = 1,
      .tile_y = 6
    },
    {
      TURRET,
      .tile_x = 1,
      .tile_y = 5
    },
    {
      TURRET,
      .tile_x = 1,
      .tile_y = 4
    },
    {
      TURRET,
      .tile_x = 1,
      .tile_y = 3
    },
    {
      TURRET,
      .tile_x = 1,
      .tile_y = 2
    },
    {
      TURRET,
      .tile_x = 1,
      .tile_y = 1
    },
    {
      TURRET,
      .tile_x = 1,
      .tile_y = 0
    },
    {
      TURRET,
      .tile_x = 3,
      .tile_y = 8
    },
    {
      TURRET,
      .tile_x = 3,
      .tile_y = 7
    },
    {
      TURRET,
      .tile_x = 3,
      .tile_y = 6
    },
    {
      TURRET,
      .tile_x = 3,
      .tile_y = 5
    },
    {
      TURRET,
      .tile_x = 3,
      .tile_y = 4
    },
    {
      TURRET,
      .tile_x = 3,
      .tile_y = 3
    },
    {
      TURRET,
      .tile_x = 3,
      .tile_y = 2
    },
    {
      TURRET,
      .tile_x = 3,
      .tile_y = 1
    },
    {
      TURRET,
      .tile_x = 4,
      .tile_y = 1
    },
    {
      TURRET,
      .tile_x = 5,
      .tile_y = 1
    },
    {
      TURRET,
      .tile_x = 6,
      .tile_y = 1
    },
    {
      TURRET,
      .tile_x = 7,
      .tile_y = 1
    },
    {
      TURRET,
      .tile_x = 7,
      .tile_y = 2
    },
    {
      TURRET,
      .tile_x = 7,
      .tile_y = 3
    },
    {
      TURRET,
      .tile_x = 7,
      .tile_y = 4
    },
    {
      TURRET,
      .tile_x = 7,
      .tile_y = 5
    },
    {
      TURRET,
      .tile_x = 7,
      .tile_y = 6
    },
    {
      TURRET,
      .tile_x = 7,
      .tile_y = 7
    },
#undef TURRET
    {0}
  }, // 1. favicon 2. swap frequency num in execute ball info to always be divided by tick interval
  (struct pos[]){ { 20, 10 } },
  (struct teleport[]){ { { 20, 12 }, { 5 } }, { { 10, 0 }, { 9 } } },
  (struct teleport_min[]){ { 20, 12, 5 }, { 10, 0, 9 } },
  1, 2,
  .right = 5,
  .has_right = 1
};

#undef FAN_V

static const struct tile_info t = { 21, 13, 40, (uint8_t[]){
/*         0   1   2   3   4   5   6   7   8   9  10  11  12 */

/*   0*/   2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,

/*   1*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*   2*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,

/*   3*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*   4*/   0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,

/*   5*/   0,  0,  2,  3,  1,  1,  1,  1,  1,  2,  0,  0,  0,

/*   6*/   0,  0,  2,  2,  2,  2,  2,  2,  1,  2,  0,  0,  0,

/*   7*/   0,  0,  0,  0,  0,  0,  0,  0,  1,  2,  0,  0,  0,

/*   8*/   0,  0,  0,  0,  0,  0,  0,  0,  1,  2,  0,  0,  0,

/*   9*/   2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,

/*  10*/   3,  2,  2,  0,  0,  0,  0,  0,  2,  2,  0,  0,  0,

/*  11*/   0,  2,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*  12*/   0,  2,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*  13*/   0,  1,  0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,

/*  14*/   0,  2,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*  15*/   0,  2,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*  16*/   0,  2,  2,  0,  0,  0,  0,  0,  2,  2,  0,  0,  0,

/*  17*/   0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,

/*  18*/   0,  0,  0,  0,  0,  0,  0,  2,  2,  2,  2,  2,  2,

/*  19*/   0,  2,  2,  2,  1,  2,  2,  2,  1,  1,  1,  1,  1,

/*  20*/   0,  2,  2,  2,  1,  1,  1,  1,  1,  2,  1,  2,  3

/*         0   1   2   3   4   5   6   7   8   9  10  11  12 */
  }
};
