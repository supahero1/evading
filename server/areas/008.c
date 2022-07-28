#include "../consts.h"

static const struct tile_info t;

const struct area_info area_008 = {
  &t,
  (struct ball_info[]) {
    {
      .type = ball_grey,
      .position_type = position_random,
      .radius_type = radius_random,
      .r_min = 60,
      .r_max = 300,
      .speed = 5,
      .count = 30
    },
    {0}
  },
  (struct pos[]){ { 5, 6 } },
  (struct teleport[]){ { { 5, 8 }, { 3 } } },
  (struct teleport_min[]){ { 5, 8, 3 } },
  1, 1,
  .right = 3,
  .has_right = 1
};

static const struct tile_info t = { 6, 14, 250, (uint8_t[]){
/*         0   1   2   3   4   5   6   7   8   9  10  11  12  13 */

/*   0*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*   1*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*   2*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*   3*/   0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,

/*   4*/   0,  0,  0,  2,  1,  1,  1,  1,  1,  2,  2,  0,  0,  0,

/*   5*/   0,  0,  0,  1,  1,  2,  1,  2,  3,  3,  1,  0,  0,  0

/*         0   1   2   3   4   5   6   7   8   9  10  11  12  13 */
  }
};
