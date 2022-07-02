#include "../consts.h"

static const struct tile_info t;

const struct area_info area_003 = {
  &t,
  (struct ball_info[]) {
    {
      .type = ball_sandy,
      .position_type = position_random,
      .r = 10,
      .speed = 2 * time_scale,
      .count = 5,
      .frequency_type = frequency_num_fixed,
      .frequency_num = 1000 / tick_interval,
      .tick_type = tick_random,
      .tick_min = 0,
      .tick_max = 1000 / tick_interval,
      .spawn = (struct ball_info[]) {
        {
          .type = ball_grey,
          .position_type = position_relative,
          .r = 3,
          .speed = 2 * time_scale,
          .count = 1,
          .die_on_collision = 1
        },
        {0}
      }
    },
    {0}
  },
  (struct pos[]){ { 0, 8 } },
  (struct teleport[]){ { { 2, 5 }, { 1 } } },
  (struct teleport_min[]){ { 2, 5, 1 } },
  1, 1,
  .bottom = 1,
  .has_bottom = 1
};

static const struct tile_info t = { 9, 9, 40, (uint8_t[]){
/*         0   1   2   3   4   5   6   7   8 */

/*   0*/   2,  0,  0,  0,  0,  1,  2,  1,  1,

/*   1*/   0,  0,  0,  0,  2,  3,  2,  1,  2,

/*   2*/   0,  0,  0,  0,  2,  3,  1,  1,  1,

/*   3*/   0,  0,  0,  2,  2,  2,  2,  2,  1,

/*   4*/   0,  0,  0,  0,  2,  0,  0,  0,  0,

/*   5*/   0,  0,  0,  0,  0,  0,  0,  0,  0,

/*   6*/   2,  0,  0,  0,  0,  0,  0,  0,  2,

/*   7*/   2,  2,  0,  0,  0,  0,  0,  2,  2,

/*   8*/   2,  2,  2,  0,  0,  0,  2,  2,  2

/*         0   1   2   3   4   5   6   7   8 */
  }
};
