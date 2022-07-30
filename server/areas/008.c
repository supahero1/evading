#include "../consts.h"

static const struct tile_info t;

const struct area_info area_008 = {
  &t,
  (struct ball_info[]) {
    {
      .type = ball_grey,
      .radius_type = radius_random,
      .r_min = 60,
      .r_max = 300,
      .speed = 5,
      .count = 30
    },
    {0}
  },
  (struct pos[]){ { 7, 5 } },
  (struct teleport[]){ { { 5, 5 }, { 3 } } },
  (struct teleport_min[]){ { 5, 5, 3 } },
  1, 1,
  .bottom = 3,
  .has_bottom = 1
};

static const struct tile_info t = { 14, 6, 250, (uint8_t[]){
/*         0   1   2   3   4   5 */

/*   0*/   0,  0,  0,  0,  0,  0,

/*   1*/   0,  0,  0,  0,  0,  0,

/*   2*/   0,  0,  0,  0,  0,  0,

/*   3*/   0,  0,  0,  2,  2,  1,

/*   4*/   0,  0,  0,  2,  2,  3,

/*   5*/   0,  0,  0,  2,  1,  3,

/*   6*/   0,  0,  0,  2,  1,  2,

/*   7*/   0,  0,  0,  2,  1,  1,

/*   8*/   0,  0,  0,  2,  1,  2,

/*   9*/   0,  0,  0,  2,  1,  1,

/*  10*/   0,  0,  0,  2,  2,  1,

/*  11*/   0,  0,  0,  0,  0,  0,

/*  12*/   0,  0,  0,  0,  0,  0,

/*  13*/   0,  0,  0,  0,  0,  0

/*         0   1   2   3   4   5 */
  }
};
