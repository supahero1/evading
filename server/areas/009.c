#include "../consts.h"

static const struct tile_info t;

const struct area_info area_009 = {
  &t,
  (struct ball_info[]) {
    {
      .type = ball_sandy,
      .position_type = position_fixed,
      .tile_x = 20,
      .tile_y = 8,
      .r = 19,
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
          .position_mode = position_precise, \
          .r = 10, \
          .movement_type = movement_angle, \
          .angle = M_PI * 1.5, \
          .speed = TIME_SCALE(0.5), \
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
      .position_type = position_fixed,
      .tile_x = 22,
      .tile_y = 2,
      .r = 19,
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
          .position_mode = position_precise, \
          .r = 10, \
          .movement_type = movement_angle, \
          .angle = M_PI, \
          .speed = TIME_SCALE(0.5), \
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
      .position_type = position_fixed,
      .tile_x = 0,
      .tile_y = 13,
      .r = 19,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 500,
      .spawn = (struct ball_info[]) {
        { .type = ball_null },
        { .type = ball_null },
#define BALL \
        { \
          .type = ball_grey, \
          .position_type = position_relative, \
          .position_mode = position_precise, \
          .r = 10, \
          .movement_type = movement_angle, \
          .angle = 0, \
          .speed = TIME_SCALE(0.75), \
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
        { .type = ball_null },
        { .type = ball_null },
        {0}
      }
    },
    {
      .type = ball_sandy,
      .position_type = position_fixed,
      .tile_x = 0,
      .tile_y = 14,
      .r = 19,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 500,
      .spawn = (struct ball_info[]) {
        BALL,
        { .type = ball_null },
        { .type = ball_null },
        { .type = ball_null },
        { .type = ball_null },
        BALL,
        BALL,
        { .type = ball_null },
        { .type = ball_null },
        { .type = ball_null },
        { .type = ball_null },
        BALL,
        {0}
      }
    },
    {
      .type = ball_sandy,
      .position_type = position_fixed,
      .tile_x = 0,
      .tile_y = 15,
      .r = 19,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 500,
      .spawn = (struct ball_info[]) {
        BALL,
        BALL,
        BALL,
        BALL,
        { .type = ball_null },
        { .type = ball_null },
        { .type = ball_null },
        { .type = ball_null },
        BALL,
        BALL,
        BALL,
        BALL,
#undef BALL
        {0}
      }
    },
#define FAN_V TIME_SCALE(1)
#define FAN \
      .type = ball_teal, \
      .position_type = position_fixed, \
      .movement_type = movement_angle, \
      .radius_type = radius_fixed, \
      .r = 10, \
      .count = 1, \
      .frequency_type = frequency_float_fixed, \
      .frequency_float = 0.25
    {
      FAN,
      .tile_x = 15,
      .tile_y = 6,
      .angle = 0,
      .speed = FAN_V
    },
    {
      FAN,
      .tile_x = 15,
      .tile_y = 5,
      .angle = 0,
      .speed = FAN_V * 2
    },
    {
      FAN,
      .tile_x = 15,
      .tile_y = 4,
      .angle = 0,
      .speed = FAN_V * 3
    },
    {
      FAN,
      .tile_x = 16,
      .tile_y = 7,
      .angle = M_PI * 0.5,
      .speed = FAN_V
    },
    {
      FAN,
      .tile_x = 17,
      .tile_y = 7,
      .angle = M_PI * 0.5,
      .speed = FAN_V * 2
    },
    {
      FAN,
      .tile_x = 18,
      .tile_y = 7,
      .angle = M_PI * 0.5,
      .speed = FAN_V * 3
    },
    {
      FAN,
      .tile_x = 15,
      .tile_y = 8,
      .angle = M_PI,
      .speed = FAN_V
    },
    {
      FAN,
      .tile_x = 15,
      .tile_y = 9,
      .angle = M_PI,
      .speed = FAN_V * 2
    },
    {
      FAN,
      .tile_x = 15,
      .tile_y = 10,
      .angle = M_PI,
      .speed = FAN_V * 3
    },
    {
      FAN,
      .tile_x = 14,
      .tile_y = 7,
      .angle = M_PI * 1.5,
      .speed = FAN_V
    },
    {
      FAN,
      .tile_x = 13,
      .tile_y = 7,
      .angle = M_PI * 1.5,
      .speed = FAN_V * 2
    },
    {
      FAN,
      .tile_x = 12,
      .tile_y = 7,
      .angle = M_PI * 1.5,
      .speed = FAN_V * 3
    },
#undef FAN
#undef FAN_V
    {
      .type = ball_sandy,
      .position_type = position_fixed,
      .tile_x = 4,
      .tile_y = 11,
      .r = 19,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 500,
      .spawn = (struct ball_info[]) {
#define BALL \
        { \
          .type = ball_grey, \
          .position_type = position_relative, \
          .position_mode = position_precise, \
          .r = 10, \
          .movement_type = movement_angle, \
          .angle = M_PI * 1.5, \
          .speed = TIME_SCALE(0.75), \
          .count = 1, \
          .die_on_collision = 1 \
        }
        BALL,
        BALL,
        { .type = ball_null },
        {0}
      }
    },
    {
      .type = ball_sandy,
      .position_type = position_fixed,
      .tile_x = 5,
      .tile_y = 11,
      .r = 19,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 500,
      .spawn = (struct ball_info[]) {
        BALL,
        BALL,
        { .type = ball_null },
        {0}
      }
    },
    {
      .type = ball_sandy,
      .position_type = position_fixed,
      .tile_x = 6,
      .tile_y = 11,
      .r = 19,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 500,
      .spawn = (struct ball_info[]) {
        BALL,
        BALL,
        { .type = ball_null },
        {0}
      }
    },
    {
      .type = ball_sandy,
      .position_type = position_fixed,
      .tile_x = 7,
      .tile_y = 11,
      .r = 19,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 500,
      .spawn = (struct ball_info[]) {
        BALL,
        BALL,
        { .type = ball_null },
        {0}
      }
    },
    {
      .type = ball_sandy,
      .position_type = position_fixed,
      .tile_x = 8,
      .tile_y = 11,
      .r = 19,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 500,
      .spawn = (struct ball_info[]) {
        BALL,
        BALL,
        { .type = ball_null },
        {0}
      }
    },
    {
      .type = ball_sandy,
      .position_type = position_fixed,
      .tile_x = 9,
      .tile_y = 11,
      .r = 19,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 500,
      .spawn = (struct ball_info[]) {
        BALL,
        BALL,
        { .type = ball_null },
        {0}
      }
    },
    {
      .type = ball_sandy,
      .position_type = position_fixed,
      .tile_x = 10,
      .tile_y = 11,
      .r = 19,
      .count = 1,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 500,
      .spawn = (struct ball_info[]) {
        BALL,
        BALL,
#undef BALL
        { .type = ball_null },
        {0}
      }
    },
    {0}
  },
  (struct pos[]){ { 22, 12 } },
  (struct teleport[]){ { { 22, 14 }, { 5 } }, { { 12, 2 }, { 9 } }, { { 13, 0 }, { 9, { 0, 0 }, 1 } }, { { 2, 6 }, { 9, { 2, 8 }, 1 } } },
  1, 4,
  .right = 5,
  .has_right = 1
};

static const struct tile_info t = { 23, 16, 40, (uint8_t[]){
/*         0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15 */

/*   0*/   1,  2,  1,  1,  1,  1,  1,  3,  2,  2,  2,  2,  2,  0,  0,  0,

/*   1*/   1,  1,  1,  2,  1,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,

/*   2*/   2,  2,  2,  2,  1,  1,  3,  2,  1,  1,  1,  1,  1,  0,  0,  0,

/*   3*/   2,  2,  2,  2,  2,  2,  2,  2,  1,  1,  2,  2,  2,  0,  0,  0,

/*   4*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*   5*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*   6*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*   7*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*   8*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*   9*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*  10*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*  11*/   1,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,

/*  12*/   1,  2,  3,  2,  2,  0,  0,  0,  0,  0,  2,  2,  2,  0,  0,  0,

/*  13*/   3,  2,  0,  2,  0,  0,  0,  0,  0,  0,  0,  2,  2,  0,  0,  0,

/*  14*/   2,  2,  0,  2,  0,  0,  0,  0,  0,  0,  0,  2,  2,  0,  0,  0,

/*  15*/   2,  2,  0,  1,  0,  0,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0,

/*  16*/   2,  2,  0,  2,  0,  0,  0,  0,  0,  0,  0,  2,  2,  0,  0,  0,

/*  17*/   2,  2,  0,  2,  0,  0,  0,  0,  0,  0,  0,  2,  2,  0,  0,  0,

/*  18*/   2,  2,  0,  2,  2,  0,  0,  0,  0,  0,  2,  2,  2,  0,  0,  0,

/*  19*/   2,  2,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,

/*  20*/   2,  2,  0,  0,  0,  0,  0,  0,  0,  2,  2,  2,  2,  2,  2,  2,

/*  21*/   2,  2,  0,  2,  2,  2,  1,  2,  2,  2,  1,  1,  1,  1,  1,  2,

/*  22*/   2,  2,  0,  2,  2,  2,  1,  1,  1,  1,  1,  2,  1,  2,  3,  2

/*         0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15 */
  }
};
