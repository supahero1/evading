#include "consts.h"

#include <assert.h>

struct teleport_dest dereference_teleport(const uint16_t area_info_id, const uint32_t tile_x, const uint32_t tile_y) {
  const uint32_t tile_id = tile_x * area_infos[area_info_id].tile_info->height + tile_y;
  switch(area_info_id) {
    case 0: switch(tile_id) {
      case  0 * 11 + 5: return (struct teleport_dest){ .area_info_id = 0, .random_spawn = 1 };
      case 12 * 11 + 0: return (struct teleport_dest){ .area_info_id = 0, .tile_x = 5, .tile_y = 0 };
      case 12 * 11 + 6: return (struct teleport_dest){ .area_info_id = 1, .random_spawn = 1 };
      default: assert(0);
    }
    default: assert(0);
  }
  assert(0);
}




struct tile_info name = { 5, 5, (uint8_t[]){
/*         0   1   2   3   4 */

/*   0*/   0,  0,  0,  1,  1,

/*   1*/   0,  0,  0,  1,  1,

/*   2*/   0,  0,  0,  0,  0,

/*   3*/   0,  2,  0,  0,  0,

/*   4*/   0,  0,  0,  0,  0,

/*         0   1   2   3   4 */
  }
};







struct area_info area_infos[] = {
/* 0*/{ &name,
        (struct ball_info[]){
          {
            .type = ball_grey,
            .count = 1,
            .speed = 1 * time_scale,
            .r = 5
          },
          {
            .type = ball_pink,
            .count = 1,
            .r = 10
          }, {0}
        }, /* SPAWN POINTS */
        (struct pos[]){ { 0, 4 } }, 1
      },
/* 1*/{ 0,
        (struct ball_info[]){
          {
            .type = ball_grey,
            .count = 10,
            .speed = 1 * time_scale,
            .r = 15
          }, {0}
        }, /* SPAWN POINTS */
        (struct pos[]){ {  } }, 1
      },
/* 2*/{ 0,
        (struct ball_info[]){
          {
            .type = ball_grey,
            .count = 10000,
            .speed = 0.2f * time_scale,
            .r = 3
          },
          {
            .type = ball_grey,
            .count = 10000,
            .speed = 0.2f * time_scale,
            .r = 10
          }, {0}
        }, /* SPAWN POINTS */
        (struct pos[]){ { 32, 30 }, { 32, 34 }, { 30, 32 }, { 34, 32 } }, 4
      }
};
