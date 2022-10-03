#include "../consts.h"

static const struct tile_info t;

const struct area_info area_003 = {
  &t,
  (struct ball_info[]) {
    {
      .type = ball_sandy,
      .position_type = position_random,
      .r = 10,
      .speed = TIME_SCALE(0.5),
      .count = 5,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 1000,
      .tick_type = tick_random,
      .tick_min = 0,
      .tick_max = 1000,
      .spawn = (struct ball_info[]) {
        {
          .type = ball_grey,
          .position_type = position_relative,
          .position_mode = position_precise,
          .r = 3,
          .speed = TIME_SCALE(0.5),
          .count = 1,
          .die_on_collision = 1
        },
        {0}
      }
    },
    {0}
  },
  (struct pos[]){ { 3, 6 } },
  (struct teleport[]){ { { 0, 7 }, { 1 } }, { { 1, 5 }, { 8 } } },
  1, 2,
  .top = 8,
  .has_top = 1,
  .bottom = 1,
  .has_bottom = 1
};

static const struct tile_info t = { 9, 10, 40, (uint8_t[]){
/*         0   1   2   3   4   5   6   7   8   9 */

/*   0*/   2,  0,  0,  0,  0,  1,  2,  3,  1,  2,

/*   1*/   0,  0,  0,  0,  2,  3,  2,  2,  1,  2,

/*   2*/   0,  0,  0,  2,  2,  2,  1,  1,  1,  1,

/*   3*/   0,  0,  0,  0,  2,  2,  1,  2,  1,  1,

/*   4*/   0,  0,  0,  0,  0,  2,  2,  2,  0,  0,

/*   5*/   2,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*   6*/   2,  2,  0,  0,  0,  0,  0,  0,  0,  0,

/*   7*/   2,  2,  2,  0,  0,  0,  0,  0,  0,  0,

/*   8*/   2,  2,  2,  2,  0,  0,  0,  0,  0,  2

/*         0   1   2   3   4   5   6   7   8   9 */
  }
};
