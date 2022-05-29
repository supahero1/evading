#include "consts.h"

#include <assert.h>

struct teleport_dest dereference_teleport(const uint16_t area_info_id, const uint32_t tile_x, const uint32_t tile_y) {
  const uint32_t tile_id = tile_x * area_infos[area_info_id].tile_info->height + tile_y;
  switch(area_info_id) {
    case 0: switch(tile_id) {
      case  0 * 9 + 4: return (struct teleport_dest){ .area_info_id = 0, .random_spawn = 1 };
      case 12 * 9 + 0: return (struct teleport_dest){ .area_info_id = 0, .tile_x = 5, .tile_y = 0 };
      case 12 * 9 + 5: return (struct teleport_dest){ .area_info_id = 1, .random_spawn = 1 };
      default: assert(0);
    }
    case 1: switch(tile_id) {
      case 0 * 3 + 0:
      case 0 * 3 + 1:
      case 0 * 3 + 2: return (struct teleport_dest){ .area_info_id = 1, .random_spawn = 1 };
      case 4 * 3 + 1: return (struct teleport_dest){ .area_info_id = 0, .random_spawn = 1 };
      default: assert(0);
    }
    default: assert(0);
  }
  assert(0);
}

struct area_info area_infos[] = {
/* 0*/{ &tiles_50x8,
        (struct ball_info[]){
          {
            .type = ball_grey,
            .count = 20,
            .speed = 5,
            .r = 30
          }, {0}
        },
        (struct pos[]){ { 4, 4 } }, 1
      },
/* 1*/{ &test_tiles,
        (struct ball_info[]){
          {0}
        },
        (struct pos[]){ { 2, 0 }, { 2, 1 }, { 2, 2 } }, 3
      }
};

struct tile_info tiles_50x8 = { 45, 9, (uint8_t[]){
    2, 2, 2, 2, 3, 2, 2, 2, 2,
    2, 2, 2, 2, 1, 2, 2, 2, 2,
    2, 2, 2, 1, 1, 1, 2, 2, 2,
    2, 1, 1, 1, 2, 1, 1, 1, 2,
    2, 1, 2, 1, 1, 1, 2, 1, 2,
    1, 1, 2, 2, 2, 2, 2, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 2, 2, 2, 2, 2, 0, 0,
    0, 0, 2, 0, 2, 0, 0, 0, 0,
    0, 0, 2, 2, 2, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 2, 2, 2, 2, 2, 0, 0,
    3, 0, 2, 0, 2, 3, 2, 0, 0,
    0, 0, 2, 0, 2, 0, 2, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 2, 2, 2, 2, 2, 0, 0,
    0, 0, 0, 2, 2, 0, 0, 0, 0,
    0, 0, 0, 0, 2, 2, 0, 0, 0,
    0, 0, 2, 2, 2, 2, 2, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 2, 0, 0, 0, 0, 0, 0,
    0, 0, 2, 2, 2, 2, 2, 0, 0,
    0, 0, 2, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 2, 2, 2, 2, 0, 0,
    0, 0, 2, 0, 2, 1, 1, 0, 0,
    0, 0, 0, 2, 2, 2, 2, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 2, 2, 0, 0, 0, 0,
    0, 0, 0, 2, 2, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 2, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0
  }
};

struct tile_info test_tiles = { 5, 3, (uint8_t[]){
    3, 3, 3,
    1, 1, 1,
    1, 1, 1,
    1, 1, 1,
    2, 3, 2
  }
};
