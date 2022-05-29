#include "grid.h"

#include <math.h>
#include <assert.h>
#include <stdlib.h>
#include <string.h>

#include <shnet/error.h>

#include <stdio.h>

void grid_init(struct grid* const grid) {
  grid->entities_size = 1;
  grid->entities_used = 1;
  grid->free_entity = 0;
  
  grid->node_entities_size = 1;
  grid->node_entities_used = 1;
  grid->free_node_entity = 0;
  
  grid->inverse_cell_size = 1.0f / grid->cell_size;
  
  grid->cells = shnet_calloc((uint32_t) grid->cells_x * (uint32_t) grid->cells_y, sizeof(*grid->cells));
  assert(grid->cells);
}

void grid_free(struct grid* const grid) {
  free(grid->cells);
  free(grid->entities);
  free(grid->node_entities);
}

#define DEF(name, names) \
static void grid_resize_##names (struct grid* const grid, const uint16_t new_size) { \
  grid-> names = shnet_realloc(grid-> names , sizeof(*grid-> names ) * new_size); \
  assert(grid-> names ); \
  grid-> names##_size = new_size; \
} \
 \
static uint16_t grid_get_##name (struct grid* const grid) { \
  if(grid-> free_##name != 0) { \
    const uint16_t ret = grid-> free_##name ; \
    grid-> free_##name = grid-> names [ret].ref; \
    return ret; \
  } \
  while(grid-> names##_used >= grid-> names##_size ) { \
    assert(grid-> names##_used != UINT16_MAX); \
    if(grid-> names##_size >= 32768) { \
      grid_resize_##names (grid, UINT16_MAX); \
      break; \
    } \
    grid_resize_##names (grid, grid-> names##_size << 1); \
  } \
  ++grid-> names##_used ; \
  return grid-> names##_used - 1; \
}

DEF(node_entity, node_entities)
DEF(entity, entities)

static uint16_t clamp(const float x, const float min, const float max) {
  return x < min ? min : x > max ? max : x;
}

uint16_t grid_insert(struct grid* const grid, const struct grid_entity* const entity) {
  const uint16_t id = grid_get_entity(grid);
  grid->entities[id].ref = entity->ref;
  grid->entities[id].unused = 0;
  grid->entities[id].x = entity->x;
  grid->entities[id].y = entity->y;
  grid->entities[id].r = entity->r;
  
  grid->entities[id].min_x = clamp((entity->x - entity->r) * grid->inverse_cell_size, 0, grid->cells_x - 1);
  grid->entities[id].min_y = clamp((entity->y - entity->r) * grid->inverse_cell_size, 0, grid->cells_y - 1);
  grid->entities[id].max_x = clamp((entity->x + entity->r) * grid->inverse_cell_size, 0, grid->cells_x - 1);
  grid->entities[id].max_y = clamp((entity->y + entity->r) * grid->inverse_cell_size, 0, grid->cells_y - 1);
  
  for(uint16_t x = grid->entities[id].min_x; x <= grid->entities[id].max_x; ++x) {
    for(uint16_t y = grid->entities[id].min_y; y <= grid->entities[id].max_y; ++y) {
      const uint16_t idx = grid_get_node_entity(grid);
      grid->node_entities[idx].ref = id;
      grid->node_entities[idx].next = grid->cells[x * grid->cells_y + y];
      grid->cells[x * grid->cells_y + y] = idx;
    }
  }
  
  return id;
}

static void grid_remove_raw(struct grid* const grid, const uint16_t id) {
  for(uint16_t x = grid->entities[id].min_x; x <= grid->entities[id].max_x; ++x) {
    for(uint16_t y = grid->entities[id].min_y; y <= grid->entities[id].max_y; ++y) {
      for(uint16_t i = grid->cells[(uint32_t) x * grid->cells_y + y], prev = 0; i != 0; prev = i, i = grid->node_entities[i].next) {
        if(grid->node_entities[i].ref != id) {
          continue;
        }
        if(prev == 0) {
          grid->cells[(uint32_t) x * grid->cells_y + y] = grid->node_entities[i].next;
        } else {
          grid->node_entities[prev].next = grid->node_entities[i].next;
        }
        grid->node_entities[i].ref = grid->free_node_entity;
        grid->free_node_entity = i;
        break;
      }
    }
  }
}

void grid_remove(struct grid* const grid, const uint16_t id) {
  grid_remove_raw(grid, id);
  grid->entities[id].unused = 1;
  grid->entities[id].ref = grid->free_entity;
  grid->free_entity = id;
}

uint16_t grid_get_idx(const struct grid* const grid, const struct grid_entity* const entity) {
  return ((uintptr_t) entity - (uintptr_t) grid->entities) / sizeof(*grid->entities);
}

void grid_recalculate(const struct grid* const grid, struct grid_entity* const entity) {
  entity->min_x = clamp((entity->x - entity->r) * grid->inverse_cell_size, 0, grid->cells_x - 1);
  entity->min_y = clamp((entity->y - entity->r) * grid->inverse_cell_size, 0, grid->cells_y - 1);
  entity->max_x = clamp((entity->x + entity->r) * grid->inverse_cell_size, 0, grid->cells_x - 1);
  entity->max_y = clamp((entity->y + entity->r) * grid->inverse_cell_size, 0, grid->cells_y - 1);
}

void grid_update(struct grid* const grid) {
  for(uint16_t i = 1; i < grid->entities_used; ++i) {
    if(grid->entities[i].unused) continue;
    struct grid_entity* const entity = grid->entities + i;
    const uint16_t min_x = clamp((entity->x - entity->r) * grid->inverse_cell_size, 0, grid->cells_x - 1);
    const uint16_t min_y = clamp((entity->y - entity->r) * grid->inverse_cell_size, 0, grid->cells_y - 1);
    const uint16_t max_x = clamp((entity->x + entity->r) * grid->inverse_cell_size, 0, grid->cells_x - 1);
    const uint16_t max_y = clamp((entity->y + entity->r) * grid->inverse_cell_size, 0, grid->cells_y - 1);
    if(grid->update(grid, grid->entities + i) == 0) {
      continue;
    }
    if(min_x != entity->min_x || min_y != entity->min_y || max_x != entity->max_x || max_y != entity->max_y) {
      grid_remove_raw(grid, i);
      for(uint16_t x = entity->min_x; x <= entity->max_x; ++x) {
        for(uint16_t y = entity->min_y; y <= entity->max_y; ++y) {
          const uint16_t idx = grid_get_node_entity(grid);
          grid->node_entities[idx].ref = i;
          grid->node_entities[idx].next = grid->cells[(uint32_t) x * grid->cells_y + y];
          grid->cells[(uint32_t) x * grid->cells_y + y] = idx;
        }
      }
    }
  }
}

void grid_collide(struct grid* const grid) {
  for(uint16_t x = 0; x < grid->cells_x; ++x) {
    for(uint16_t y = 0; y < grid->cells_y; ++y) {
      for(uint16_t i = grid->cells[(uint32_t) x * grid->cells_y + y]; i != 0; i = grid->node_entities[i].next) {
        struct grid_entity* const entity = grid->entities + grid->node_entities[i].ref;
        for(uint16_t j = grid->node_entities[i].next; j != 0; j = grid->node_entities[j].next) {
          struct grid_entity* const e = grid->entities + grid->node_entities[j].ref;
          const float dist_sq = (entity->x - e->x) * (entity->x - e->x) + (entity->y - e->y) * (entity->y - e->y);
          if(dist_sq < (e->r + entity->r) * (e->r + entity->r)) {
            grid->collide(grid, entity, e);
          }
        }
      }
    }
  }
}

void grid_crosscollide(struct grid* const grid, struct grid* const grid2) {
  for(uint16_t x = 0; x < grid->cells_x; ++x) {
    for(uint16_t y = 0; y < grid->cells_y; ++y) {
      for(uint16_t i = grid->cells[(uint32_t) x * grid->cells_y + y]; i != 0; i = grid->node_entities[i].next) {
        struct grid_entity* const entity = grid->entities + grid->node_entities[i].ref;
        for(uint16_t j = grid2->cells[(uint32_t) x * grid->cells_y + y]; j != 0; j = grid2->node_entities[j].next) {
          struct grid_entity* const e = grid2->entities + grid2->node_entities[j].ref;
          const float dist_sq = (entity->x - e->x) * (entity->x - e->x) + (entity->y - e->y) * (entity->y - e->y);
          if(dist_sq < (e->r + entity->r) * (e->r + entity->r)) {
            grid->collide(grid, entity, e);
          }
        }
      }
    }
  }
}
