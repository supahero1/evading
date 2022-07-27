#include "../consts.h"

static const struct tile_info t;

#define V 4
#define R 11

#define BALL \
  .type = ball_grey, \
  .position_type = position_tile_fixed, \
  .movement_type = movement_velocity, \
  .r = R, \
  .speed = V * time_scale, \
  .count = 1

const struct area_info area_007 = {
  &t,
  (struct ball_info[]) {
    {
      BALL,
      .tile_x = 2,
      .tile_y = 4,
      .vx = V * time_scale
    },
    {
      BALL,
      .tile_x = 6,
      .tile_y = 6,
      .vx = -V * time_scale
    },
    {
      BALL,
      .tile_x = 2,
      .tile_y = 7,
      .vx = V * time_scale
    },
    {
      BALL,
      .tile_x = 6,
      .tile_y = 9,
      .vx = -V * time_scale
    },
    {
      BALL,
      .tile_x = 2,
      .tile_y = 10,
      .vx = V * time_scale
    },
    {
      BALL,
      .tile_x = 6,
      .tile_y = 11,
      .vx = -V * time_scale
    },
    {
      BALL,
      .tile_x = 3,
      .tile_y = 13,
      .vy = V * time_scale
    },
    {
      BALL,
      .tile_x = 5,
      .tile_y = 13,
      .vy = V * time_scale
    },
    {
      BALL,
      .tile_x = 2,
      .tile_y = 19,
      .vy = -V * time_scale
    },
    {
      BALL,
      .tile_x = 4,
      .tile_y = 20,
      .vy = -V * time_scale
    },
    {
      BALL,
      .tile_x = 6,
      .tile_y = 19,
      .vy = -V * time_scale
    },
    {
      BALL,
      .tile_x = 1,
      .tile_y = 15,
      .vx = V * time_scale
    },
    {
      BALL,
      .tile_x = 8,
      .tile_y = 16,
      .vx = -V * time_scale
    },
    {
      BALL,
      .tile_x = 0,
      .tile_y = 17,
      .vx = V * time_scale
    },
    {
      BALL,
      .tile_x = 7,
      .tile_y = 18,
      .vx = -V * time_scale
    },
    {
      BALL,
      .tile_x = 2,
      .tile_y = 24,
      .vx = V * time_scale
    },
    {
      BALL,
      .tile_x = 6,
      .tile_y = 26,
      .vx = -V * time_scale
    },
    {
      BALL,
      .tile_x = 2,
      .tile_y = 28,
      .vx = V * time_scale
    },
    {
      BALL,
      .tile_x = 6,
      .tile_y = 30,
      .vx = -V * time_scale
    },
    {
      BALL,
      .tile_x = 2,
      .tile_y = 32,
      .vx = V * time_scale
    },
    {
      BALL,
      .tile_x = 3,
      .tile_y = 33,
      .vx = -V * time_scale
    },
    {
      BALL,
      .tile_x = 0,
      .tile_y = 34,
      .vx = V * time_scale
    },
    {
      BALL,
      .tile_x = 6,
      .tile_y = 36,
      .vx = -V * time_scale
    },
    {
      BALL,
      .tile_x = 0,
      .tile_y = 38,
      .vx = V * time_scale
    },
    {
      BALL,
      .tile_x = 7,
      .tile_y = 39,
      .vx = -V * time_scale
    },
    {
      BALL,
      .tile_x = 2,
      .tile_y = 40,
      .vx = V * time_scale
    },
    {
      BALL,
      .tile_x = 0,
      .tile_y = 34,
      .vy = V * time_scale
    },
    {
      BALL,
      .tile_x = 2,
      .tile_y = 38,
      .vy = -V * time_scale
    },
    {
      BALL,
      .tile_x = 4,
      .tile_y = 34,
      .vy = V * time_scale
    },
    {
      BALL,
      .tile_x = 6,
      .tile_y = 40,
      .vy = -V * time_scale
    },
    {
      BALL,
      .tile_x = 8,
      .tile_y = 34,
      .vy = V * time_scale
    },
    {
      BALL,
      .tile_x = 6,
      .tile_y = 42,
      .vx = -V * time_scale
    },
    {
      BALL,
      .tile_x = 0,
      .tile_y = 44,
      .vx = V * time_scale
    },
    {
      BALL,
      .tile_x = 7,
      .tile_y = 46,
      .vx = -V * time_scale
    },
    {
      BALL,
      .tile_x = 2,
      .tile_y = 48,
      .vx = V * time_scale
    },
    {
      BALL,
      .tile_x = 5,
      .tile_y = 49,
      .vx = -V * time_scale
    },
    {
      BALL,
      .tile_x = 7,
      .tile_y = 52,
      .vy = -V * time_scale
    },
    {
      BALL,
      .tile_x = 6,
      .tile_y = 53,
      .vx = -V * time_scale
    },
    {
      BALL,
      .tile_x = 2,
      .tile_y = 55,
      .vy = V * time_scale
    },
    {
      BALL,
      .tile_x = 3,
      .tile_y = 55,
      .vy = V * time_scale
    },
    {
      BALL,
      .tile_x = 4,
      .tile_y = 55,
      .vy = V * time_scale
    },
    {
      BALL,
      .tile_x = 2,
      .tile_y = 59,
      .vy = -V * time_scale
    },
    {
      BALL,
      .tile_x = 3,
      .tile_y = 59,
      .vy = -V * time_scale
    },
    {
      BALL,
      .tile_x = 4,
      .tile_y = 59,
      .vy = -V * time_scale
    },
    {
      BALL,
      .tile_x = 6,
      .tile_y = 59,
      .vy = V * time_scale
    },
    {
      BALL,
      .tile_x = 7,
      .tile_y = 60,
      .vy = -V * time_scale
    },
    {0}
  },
  (struct pos[]){ { 3, 2 }, { 5, 2 } },
  (struct teleport[]){ { { 4, 0 }, { 1 } } },
  (struct teleport_min[]){ { 4, 0, 1 } },
  2, 1,
  .top = 1,
  .has_top = 1
};

static const struct tile_info t = { 9, 62, 40, (uint8_t[]){
/*         0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31  32  33  34  35  36  37  38  39  40  41  42  43  44  45  46  47  48  49  50  51  52  53  54  55  56  57  58  59  60  61 */

/*   0*/   2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,  0,  0,  2,  2,  2,  2,  2,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,

/*   1*/   2,  2,  1,  1,  1,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  1,  2,  1,  0,  1,  2,  2,  2,  2,  0,  2,  2,  2,  2,  2,  2,  2,  2,  1,  1,  1,  2,  2,  1,  2,  2,  2,

/*   2*/   1,  1,  1,  2,  0,  2,  0,  0,  2,  0,  0,  0,  2,  2,  0,  0,  0,  0,  0,  0,  2,  2,  2,  2,  0,  1,  0,  2,  0,  1,  0,  2,  0,  0,  0,  0,  0,  0,  0,  1,  0,  2,  0,  1,  0,  2,  0,  1,  0,  0,  2,  2,  2,  0,  2,  0,  0,  0,  0,  0,  2,  2,

/*   3*/   1,  2,  1,  2,  0,  1,  0,  0,  1,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  2,  1,  1,  0,  2,  0,  1,  0,  2,  0,  1,  0,  0,  0,  2,  0,  2,  0,  1,  0,  2,  0,  2,  0,  2,  0,  2,  0,  0,  2,  2,  1,  0,  2,  0,  0,  0,  0,  0,  2,  2,

/*   4*/   3,  2,  2,  2,  0,  2,  0,  0,  2,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  2,  0,  2,  0,  2,  0,  2,  0,  2,  0,  2,  0,  0,  0,  0,  0,  2,  0,  1,  0,  2,  0,  2,  0,  2,  0,  0,  2,  2,  2,  0,  2,  0,  0,  0,  0,  0,  2,  2,

/*   5*/   1,  2,  1,  2,  0,  1,  0,  0,  1,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  2,  1,  1,  0,  2,  0,  1,  0,  2,  0,  1,  0,  1,  0,  2,  0,  2,  0,  0,  0,  2,  0,  2,  0,  2,  0,  2,  0,  0,  2,  2,  2,  0,  2,  2,  1,  2,  2,  1,  2,  2,

/*   6*/   1,  1,  1,  2,  0,  2,  0,  0,  2,  0,  0,  0,  2,  2,  0,  0,  0,  0,  0,  0,  2,  2,  2,  2,  0,  1,  0,  2,  0,  1,  0,  2,  0,  1,  0,  0,  0,  0,  0,  0,  0,  2,  0,  2,  0,  1,  0,  2,  1,  1,  2,  2,  2,  0,  2,  2,  2,  2,  2,  0,  0,  0,

/*   7*/   2,  2,  1,  1,  1,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  1,  0,  1,  2,  1,  0,  0,  2,  2,  2,  2,  2,  2,  0,  2,  2,  0,  0,  0,  0,  1,  2,  3,  1,  2,  1,  0,  0,  2,

/*   8*/   2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  1,  2,  2,  2,  2,  2,  1,  1,  1,  2,  2,  2

/*         0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31  32  33  34  35  36  37  38  39  40  41  42  43  44  45  46  47  48  49  50  51  52  53  54  55  56  57  58  59  60  61 */
  }
};
