#include "consts.h"

#include <assert.h>

struct teleport_dest dereference_teleport(const uint16_t area_info_id, const uint16_t tile_x, const uint16_t tile_y) {
  const uint32_t tile_id = (uint32_t) tile_x * area_infos[area_info_id].tile_info->height + tile_y;
  switch(area_info_id) {
    case 0: switch(tile_id) {
      case 0: return (struct teleport_dest){ .area_info_id = 2, .random_spawn = 1 };
      case 26 * 50 + 23: return (struct teleport_dest){ .area_info_id = 1, .random_spawn = 1 };
      default: assert(0);
    }
    case 1: switch(tile_id) {
      case 4 * 5 + 0: return (struct teleport_dest){ .area_info_id = 2, .random_spawn = 1 };
      default: assert(0);
    }
    case 2: switch(tile_id) {
      case 99 * 10 + 1: return (struct teleport_dest){ .area_info_id = 0, .random_spawn = 1 };
      default: assert(0);
    }
    default: assert(0);
  }
  assert(0);
}




struct tile_info name = { 5, 5, 40, (uint8_t[]){
/*         0   1   2   3   4 */

/*   0*/   0,  0,  0,  1,  1,

/*   1*/   0,  0,  0,  1,  1,

/*   2*/   0,  0,  0,  0,  0,

/*   3*/   0,  2,  0,  0,  0,

/*   4*/   3,  0,  0,  0,  0,

/*         0   1   2   3   4 */
  }
};



struct tile_info name2 = { 50, 50, 40, (uint8_t[]){
/*         0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31  32  33  34  35  36  37  38  39  40  41  42  43  44  45  46  47  48  49 */

/*   0*/   3,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*   1*/   2,  2,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*   2*/   1,  1,  1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*   3*/   2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,

/*   4*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*   5*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*   6*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*   7*/   0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,  2,  0,  0,  0,

/*   8*/   0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*   9*/   0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  10*/   0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  11*/   0,  0,  0,  2,  0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  12*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  13*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  14*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  15*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  16*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  17*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  18*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  19*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  20*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  21*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  22*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  23*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  24*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  25*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  2,  2,  2,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  26*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  2,  3,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  27*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  2,  2,  2,  2,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  28*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  29*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  30*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  31*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  32*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  33*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  34*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  35*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  36*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  37*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  38*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  39*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  40*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  41*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  42*/   0,  0,  0,  2,  0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,  2,  0,  0,  0,

/*  43*/   0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*  44*/   0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*  45*/   0,  0,  0,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*  46*/   0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  0,  0,  0,

/*  47*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  48*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  49*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*         0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31  32  33  34  35  36  37  38  39  40  41  42  43  44  45  46  47  48  49 */
  }
};


struct tile_info this_area_is_as_long_as_my_pp = { 116, 10, 40, (uint8_t[]){
/*         0   1   2   3   4   5   6   7   8   9 */

/*   0*/   1,  1,  1,  1,  0,  0,  1,  1,  1,  1,

/*   1*/   1,  2,  2,  1,  0,  0,  1,  2,  2,  1,

/*   2*/   1,  1,  2,  1,  0,  0,  1,  2,  1,  1,

/*   3*/   2,  2,  2,  1,  0,  0,  1,  2,  2,  2,

/*   4*/   1,  1,  1,  1,  0,  0,  1,  1,  1,  1,

/*   5*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*   6*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*   7*/   2,  0,  0,  2,  0,  0,  2,  0,  0,  2,

/*   8*/   0,  0,  2,  0,  0,  0,  0,  2,  0,  0,

/*   9*/   2,  0,  0,  0,  2,  2,  0,  0,  0,  2,

/*  10*/   2,  2,  0,  2,  2,  2,  2,  0,  2,  2,

/*  11*/   2,  0,  0,  0,  2,  2,  0,  0,  0,  2,

/*  12*/   2,  0,  0,  0,  2,  2,  0,  0,  0,  2,

/*  13*/   2,  0,  0,  2,  2,  2,  2,  0,  0,  2,

/*  14*/   2,  0,  0,  0,  0,  0,  0,  0,  0,  2,

/*  15*/   2,  0,  0,  2,  2,  2,  2,  0,  0,  2,

/*  16*/   2,  0,  0,  0,  2,  2,  0,  0,  0,  2,

/*  17*/   2,  0,  0,  0,  2,  2,  0,  0,  0,  2,

/*  18*/   2,  0,  0,  0,  2,  2,  0,  0,  0,  2,

/*  19*/   2,  0,  2,  0,  2,  2,  0,  2,  0,  2,

/*  20*/   0,  0,  2,  0,  0,  0,  0,  2,  0,  0,

/*  21*/   2,  0,  0,  2,  0,  0,  2,  0,  0,  2,

/*  22*/   0,  0,  2,  2,  0,  0,  2,  2,  0,  0,

/*  23*/   2,  0,  0,  2,  0,  0,  2,  0,  0,  2,

/*  24*/   0,  0,  2,  2,  0,  0,  2,  2,  0,  0,

/*  25*/   2,  0,  0,  0,  0,  0,  0,  0,  0,  2,

/*  26*/   0,  0,  2,  2,  0,  0,  2,  2,  0,  0,

/*  27*/   2,  0,  0,  2,  0,  0,  2,  0,  0,  2,

/*  28*/   2,  2,  0,  0,  2,  2,  0,  0,  2,  2,

/*  29*/   0,  2,  2,  0,  2,  2,  0,  2,  2,  0,

/*  30*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  31*/   0,  2,  2,  2,  2,  2,  2,  2,  2,  0,

/*  32*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  33*/   2,  2,  2,  2,  0,  0,  2,  2,  2,  2,

/*  34*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  35*/   0,  2,  2,  2,  2,  2,  2,  2,  2,  0,

/*  36*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  37*/   2,  2,  2,  2,  0,  0,  2,  2,  2,  2,

/*  38*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  39*/   0,  0,  0,  2,  0,  0,  2,  0,  0,  0,

/*  40*/   0,  2,  0,  0,  0,  0,  0,  0,  2,  0,

/*  41*/   0,  0,  0,  0,  2,  2,  0,  0,  0,  0,

/*  42*/   0,  0,  2,  0,  0,  0,  0,  2,  0,  0,

/*  43*/   2,  0,  0,  0,  0,  0,  0,  0,  0,  2,

/*  44*/   0,  0,  0,  2,  0,  0,  2,  0,  0,  0,

/*  45*/   0,  2,  0,  0,  0,  0,  0,  0,  2,  0,

/*  46*/   0,  0,  0,  0,  2,  2,  0,  0,  0,  0,

/*  47*/   0,  0,  2,  0,  0,  0,  0,  2,  0,  0,

/*  48*/   2,  0,  0,  0,  0,  0,  0,  0,  0,  2,

/*  49*/   0,  0,  0,  2,  0,  0,  2,  0,  0,  0,

/*  50*/   0,  2,  0,  0,  0,  0,  0,  0,  2,  0,

/*  51*/   0,  0,  0,  0,  2,  2,  0,  0,  0,  0,

/*  52*/   0,  0,  2,  0,  0,  0,  0,  2,  0,  0,

/*  53*/   2,  0,  0,  0,  0,  0,  0,  0,  0,  2,

/*  54*/   0,  0,  2,  0,  0,  0,  0,  2,  0,  0,

/*  55*/   0,  0,  0,  0,  2,  2,  0,  0,  0,  0,

/*  56*/   0,  0,  2,  0,  0,  0,  0,  2,  0,  0,

/*  57*/   2,  0,  0,  0,  0,  0,  0,  0,  0,  2,

/*  58*/   0,  0,  2,  0,  0,  0,  0,  2,  0,  0,

/*  59*/   0,  0,  0,  0,  2,  2,  0,  0,  0,  0,

/*  60*/   0,  0,  2,  0,  0,  0,  0,  2,  0,  0,

/*  61*/   2,  0,  0,  0,  0,  0,  0,  0,  0,  2,

/*  62*/   0,  0,  2,  0,  0,  0,  0,  2,  0,  0,

/*  63*/   0,  0,  0,  0,  2,  2,  0,  0,  0,  0,

/*  64*/   0,  2,  2,  2,  2,  2,  0,  2,  2,  2,

/*  65*/   0,  0,  2,  0,  0,  0,  0,  0,  0,  0,

/*  66*/   2,  0,  2,  0,  2,  0,  2,  2,  2,  0,

/*  67*/   2,  0,  2,  0,  2,  0,  0,  0,  0,  0,

/*  68*/   2,  0,  2,  0,  2,  0,  2,  2,  2,  0,

/*  69*/   2,  0,  0,  0,  0,  0,  2,  0,  2,  0,

/*  70*/   2,  0,  2,  0,  2,  0,  0,  0,  2,  0,

/*  71*/   2,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  72*/   2,  0,  2,  0,  2,  0,  2,  2,  0,  2,

/*  73*/   2,  0,  2,  0,  2,  0,  0,  0,  0,  0,

/*  74*/   2,  0,  2,  0,  2,  0,  2,  2,  2,  0,

/*  75*/   2,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*  76*/   2,  0,  2,  2,  2,  0,  2,  0,  2,  0,

/*  77*/   2,  0,  0,  0,  0,  0,  2,  0,  2,  0,

/*  78*/   2,  0,  2,  2,  2,  0,  2,  0,  2,  2,

/*  79*/   2,  0,  0,  0,  2,  0,  2,  0,  0,  0,

/*  80*/   2,  0,  2,  0,  2,  0,  2,  0,  2,  0,

/*  81*/   2,  0,  2,  0,  2,  0,  2,  0,  2,  0,

/*  82*/   2,  0,  2,  0,  2,  0,  2,  2,  2,  0,

/*  83*/   2,  0,  2,  0,  0,  0,  0,  0,  0,  0,

/*  84*/   2,  0,  2,  0,  2,  2,  2,  2,  2,  0,

/*  85*/   2,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  86*/   2,  2,  2,  2,  2,  0,  2,  2,  2,  0,

/*  87*/   2,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*  88*/   2,  0,  2,  2,  2,  0,  2,  0,  2,  0,

/*  89*/   2,  0,  2,  0,  0,  0,  0,  0,  2,  0,

/*  90*/   2,  0,  2,  0,  2,  2,  2,  0,  2,  0,

/*  91*/   2,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*  92*/   2,  0,  2,  2,  2,  0,  0,  0,  2,  2,

/*  93*/   2,  0,  0,  0,  0,  0,  2,  0,  0,  0,

/*  94*/   2,  0,  2,  2,  2,  0,  2,  2,  2,  0,

/*  95*/   2,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  96*/   2,  0,  2,  2,  2,  0,  2,  0,  2,  0,

/*  97*/   2,  0,  0,  0,  2,  0,  0,  0,  2,  0,

/*  98*/   2,  2,  2,  0,  2,  0,  2,  2,  2,  0,

/*  99*/   2,  3,  0,  0,  0,  0,  0,  0,  0,  0,

/* 100*/   2,  2,  2,  2,  2,  2,  2,  2,  2,  2,

/* 101*/   1,  1,  1,  1,  1,  1,  1,  1,  1,  1,

/* 102*/   1,  1,  2,  2,  2,  2,  2,  2,  1,  1,

/* 103*/   1,  1,  1,  1,  2,  2,  1,  1,  1,  1,

/* 104*/   1,  1,  2,  2,  1,  2,  2,  2,  1,  1,

/* 105*/   1,  1,  1,  1,  1,  1,  1,  1,  1,  1,

/* 106*/   1,  1,  2,  2,  2,  2,  2,  2,  1,  1,

/* 107*/   1,  1,  1,  1,  2,  2,  1,  1,  1,  1,

/* 108*/   1,  1,  2,  2,  1,  2,  2,  2,  1,  1,

/* 109*/   1,  1,  1,  1,  1,  1,  1,  1,  1,  1,

/* 110*/   1,  1,  2,  2,  2,  2,  2,  2,  1,  1,

/* 111*/   1,  1,  1,  1,  2,  2,  1,  1,  1,  1,

/* 112*/   1,  1,  2,  2,  1,  2,  2,  2,  1,  1,

/* 113*/   1,  1,  1,  1,  1,  1,  1,  1,  1,  1,

/* 114*/   1,  1,  2,  2,  2,  2,  1,  2,  1,  1,

/* 115*/   1,  1,  1,  1,  1,  1,  1,  1,  1,  1,

/*         0   1   2   3   4   5   6   7   8   9 */
  }
};


struct area_info area_infos[] = {
/* 0*/{ &name2,
        (struct ball_info[]){
          {
            .type = ball_grey,
            .count = 8,
            .speed = 6 * time_scale,
            .radius_type = radius_random,
            .r_min = 10,
            .r_max = 20
          },
          {
            .type = ball_pink,
            .count = 8,
            .speed = 8 * time_scale,
            .frequency_type = frequency_float_random,
            .frequency_float_min = 0.05,
            .frequency_float_max = 0.5,
            .radius_type = radius_random,
            .r_min = 8,
            .r_max = 20,
            .tick_type = tick_random,
            .tick_min = 0,
            .tick_max = 1000
          },
          {
            .type = ball_teal,
            .count = 8,
            .speed = 5 * time_scale,
            .frequency_type = frequency_float_fixed,
            .frequency_float = 0.5f,
            .radius_type = radius_random,
            .r_min = 8,
            .r_max = 20
          },
          {
            .type = ball_sandy,
            .count = 8,
            .speed = 5 * time_scale,
            .frequency_type = frequency_num_fixed,
            .frequency_num = 1000 / tick_interval,
            .radius_type = radius_random,
            .r_min = 8,
            .r_max = 20,
            .spawn = (struct ball_info[]) {
              {
                .type = ball_grey,
                .position_type = position_relative,
                .speed = 3 * time_scale,
                .r = 4,
                .die_on_collision = 1
              }, {0}
            }
          },
          {
            .type = ball_light_blue,
            .count = 8,
            .speed = 5 * time_scale,
            .frequency_type = frequency_num_random,
            .frequency_num_min = 1000 / tick_interval,
            .frequency_num_max = 2000 / tick_interval,
            .tick_type = tick_random,
            .tick_min = 0,
            .tick_max = 3000 / tick_interval,
            .radius_type = radius_random,
            .r_min = 8,
            .r_max = 15,
            .range_type = range_fixed,
            .range = 200.0f,
            .spawn = (struct ball_info[]) {
              {
                .type = ball_grey,
                .position_type = position_relative,
                .speed = 6 * time_scale,
                .r = 3,
                .die_on_collision = 1,
                .movement_type = movement_relative_angle
              },
              {
                .type = ball_pink,
                .position_type = position_relative,
                .speed = 6 * time_scale,
                .r = 3,
                .die_on_collision = 1,
                .frequency_type = frequency_float_random,
                .frequency_float_min = 0.05f,
                .frequency_float_max = 0.5f,
                .tick_type = tick_random,
                .tick_min = 0,
                .tick_max = 1000 / tick_interval,
                .movement_type = movement_relative_angle
              },
              {
                .type = ball_teal,
                .position_type = position_relative,
                .speed = 6 * time_scale,
                .r = 3,
                .die_on_collision = 1,
                .frequency_type = frequency_float_fixed,
                .frequency_float = 0.05f,
                .movement_type = movement_relative_angle
              }, {0}
            },
            .spawn_idx_type = spawn_idx_random,
            .spawn_idx_min = 0,
            .spawn_idx_max = 2
          }, {0}
        }, /* SPAWN POINTS */
        (struct pos[]){ { 2, 0 }, { 2, 1 } }, 2
      },
/* 1*/{ &name,
        (struct ball_info[]){
          {
            .type = ball_grey,
            .count = 1,
            .speed = 1 * time_scale,
            .r = 10
          },
          {
            .type = ball_pink,
            .count = 1,
            .speed = 1 * time_scale,
            .frequency_type = frequency_float_fixed,
            .frequency_float = 0.1,
            .r = 10
          },
          {
            .type = ball_teal,
            .count = 1,
            .speed = 1 * time_scale,
            .r = 10
          },
          {
            .type = ball_sandy,
            .count = 1,
            .speed = 1 * time_scale,
            .frequency_type = frequency_num_fixed,
            .frequency_num = 500 / tick_interval,
            .r = 15,
            .spawn = (struct ball_info[]) {
              {
                .type = ball_grey,
                .position_type = position_relative,
                .speed = 1 * time_scale,
                .r = 6,
                .die_on_collision = 1
              }, {0}
            }
          },
          {
            .type = ball_light_blue,
            .count = 1,
            .speed = 1 * time_scale,
            .frequency_type = frequency_num_fixed,
            .frequency_num = 2000 / tick_interval,
            .r = 10,
            .range_type = range_fixed,
            .range = 200.0f,
            .spawn = (struct ball_info[]) {
              {
                .type = ball_grey,
                .position_type = position_relative,
                .speed = 2 * time_scale,
                .r = 3,
                .die_on_collision = 1,
                .movement_type = movement_relative_angle
              },
              {
                .type = ball_pink,
                .position_type = position_relative,
                .speed = 2 * time_scale,
                .r = 3,
                .die_on_collision = 1,
                .frequency_type = frequency_float_random,
                .frequency_float_min = 0.05f,
                .frequency_float_max = 0.5f,
                .tick_type = tick_random,
                .tick_min = 0,
                .tick_max = 1000 / tick_interval,
                .movement_type = movement_relative_angle
              },
              {
                .type = ball_teal,
                .position_type = position_relative,
                .speed = 2 * time_scale,
                .r = 3,
                .die_on_collision = 1,
                .frequency_type = frequency_float_fixed,
                .frequency_float = 0.05f,
                .movement_type = movement_relative_angle
              }, {0}
            },
            .spawn_idx_type = spawn_idx_random,
            .spawn_idx_min = 0,
            .spawn_idx_max = 2
          }, {0}
        }, /* SPAWN POINTS */
        (struct pos[]){ { 0, 4 } }, 1
      },
/* 2*/{ &this_area_is_as_long_as_my_pp,
        (struct ball_info[]){
          {
            .type = ball_grey,
            .count = 4,
            .speed = 3 * time_scale,
            .radius_type = radius_random,
            .r_min = 8,
            .r_max = 15
          },
          {
            .type = ball_pink,
            .count = 4,
            .speed = 3 * time_scale,
            .frequency_type = frequency_float_random,
            .frequency_float_min = 0.05f,
            .frequency_float_max = 0.5f,
            .radius_type = radius_random,
            .r_min = 8,
            .r_max = 15,
            .tick_type = tick_random,
            .tick_min = 0,
            .tick_max = 1000 / tick_interval
          },
          {
            .type = ball_teal,
            .count = 4,
            .speed = 3 * time_scale,
            .frequency_type = frequency_float_random,
            .frequency_float_min = 0.3f,
            .frequency_float_max = 0.05f,
            .radius_type = radius_random,
            .r_min = 8,
            .r_max = 15
          },
          {
            .type = ball_sandy,
            .count = 4,
            .speed = 3 * time_scale,
            .frequency_type = frequency_num_random,
            .frequency_num_min = 1000 / tick_interval,
            .frequency_num_max = 3000 / tick_interval,
            .tick_type = tick_random,
            .tick_min = 1000 / tick_interval,
            .tick_max = 3000 / tick_interval,
            .radius_type = radius_random,
            .r_min = 8,
            .r_max = 15,
            .spawn = (struct ball_info[]) {
              {
                .type = ball_grey,
                .position_type = position_relative,
                .speed = 2 * time_scale,
                .r = 4,
                .die_on_collision = 1
              }, {0}
            }
          },
          {
            .type = ball_light_blue,
            .count = 4,
            .speed = 3 * time_scale,
            .frequency_type = frequency_num_random,
            .frequency_num_min = 1000 / tick_interval,
            .frequency_num_max = 2000 / tick_interval,
            .tick_type = tick_random,
            .tick_min = 0,
            .tick_max = 3000 / tick_interval,
            .radius_type = radius_random,
            .r_min = 8,
            .r_max = 15,
            .range_type = range_fixed,
            .range = 200.0f,
            .spawn = (struct ball_info[]) {
              {
                .type = ball_grey,
                .position_type = position_relative,
                .speed = 6 * time_scale,
                .r = 3,
                .die_on_collision = 1,
                .movement_type = movement_relative_angle
              },
              {
                .type = ball_pink,
                .position_type = position_relative,
                .speed = 6 * time_scale,
                .r = 3,
                .die_on_collision = 1,
                .frequency_type = frequency_float_random,
                .frequency_float_min = 0.05f,
                .frequency_float_max = 0.5f,
                .tick_type = tick_random,
                .tick_min = 0,
                .tick_max = 1000 / tick_interval,
                .movement_type = movement_relative_angle
              },
              {
                .type = ball_teal,
                .position_type = position_relative,
                .speed = 6 * time_scale,
                .r = 3,
                .die_on_collision = 1,
                .frequency_type = frequency_float_fixed,
                .frequency_float = 0.05f,
                .movement_type = movement_relative_angle
              }, {0}
            },
            .spawn_idx_type = spawn_idx_random,
            .spawn_idx_min = 0,
            .spawn_idx_max = 2
          }, {0}
        }, /* SPAWN POINTS */
        (struct pos[]){ { 2, 1 }, { 2, 8 } }, 2
      }
};