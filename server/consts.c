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

struct area_info* area_infos;

void area_info_init() {
  area_infos = (struct area_info*) {
    &area_001/*,
    &area_002,
    &area_003,
    &area_004,
    &area_005,
    &area_006,
    &area_007,
    &area_008,
    &area_009*/
  };
}

const uint8_t whitespace_chars[256] = {
  0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
};
