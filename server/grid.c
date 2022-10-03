#include "grid.h"

#include <assert.h>
#include <stdlib.h>

#include <shnet/error.h>

void grid_init(struct grid* const grid, const uint16_t prealloc) {
  assert(prealloc);
  grid->cells = shnet_calloc((uint16_t) grid->cells_x * grid->cells_y, sizeof(*grid->cells));
  assert(grid->cells);
  grid->entities = shnet_malloc(sizeof(*grid->entities) * prealloc);
  assert(grid->entities);
  grid->node_entities = shnet_malloc(sizeof(*grid->node_entities) * prealloc);
  assert(grid->node_entities);

  grid->cells_x_mask = grid->cells_x - 1;
  grid->cells_y_mask = grid->cells_y - 1;

  grid->free_entity = 0;
  grid->entities_used = 1;
  grid->entities_size = prealloc;
  
  grid->free_node_entity = 0;
  grid->node_entities_used = 1;
  grid->node_entities_size = prealloc;
  
  grid->inverse_cell_size = 1.0f / grid->u8_cell_size;

  const uint8_t half = grid->u8_cell_size >> 1;
  grid->f_half_cell_size = half;
  grid->u8_half_cell_size = half;
  
  grid->f_cell_size = grid->u8_cell_size;
}

void grid_free(const struct grid* const grid) {
  free(grid->cells);
  free(grid->entities);
  free(grid->node_entities);
}

uint16_t grid_get_entity(struct grid* const grid) {
  if(grid->free_entity != 0) {
    const uint16_t ret = grid->free_entity;
    grid->free_entity = grid->entities[ret].ref;
    return ret;
  }
  assert(grid->entities_used <= grid->entities_size);
  if(grid->entities_used == grid->entities_size) {
    const uint16_t size = grid->entities_size + grid->addon;
    if(grid->entities_size > size) {
      grid->entities_size = UINT16_MAX;
    } else {
      grid->entities_size = size;
    }
    grid->entities = shnet_realloc(grid->entities, sizeof(*grid->entities) * grid->entities_size);
    assert(grid->entities);
  }
  return grid->entities_used++;
}

void grid_return_entity(struct grid* const grid, const uint16_t entity_id) {
  grid->entities[entity_id].max_x = UINT8_MAX;
  grid->entities[entity_id].ref = grid->free_entity;
  grid->free_entity = entity_id;
}

static uint32_t grid_get_node_entity(struct grid* const grid) {
  if(grid->free_node_entity != 0) {
    const uint32_t ret = grid->free_node_entity;
    grid->free_node_entity = grid->node_entities[ret].ref;
    return ret;
  }
  assert(grid->entities_used <= grid->entities_size);
  if(grid->node_entities_used == grid->node_entities_size) {
    grid->node_entities_size += grid->addon << 1;
    grid->node_entities = shnet_realloc(grid->node_entities, sizeof(*grid->node_entities) * grid->node_entities_size);
    assert(grid->node_entities);
  }
  return grid->node_entities_used++;
}

static uint8_t clamp(const float x, const float min, const float max) {
  return x < min ? min : x > max ? max : x;
}

void grid_insert(struct grid* const grid, const uint16_t entity_id) {
  struct grid_entity* const entity = grid->entities + entity_id;
  entity->min_x = clamp((entity->x - entity->r) * grid->inverse_cell_size, 0, grid->cells_x_mask);
  entity->min_y = clamp((entity->y - entity->r) * grid->inverse_cell_size, 0, grid->cells_y_mask);
  entity->max_x = clamp((entity->x + entity->r) * grid->inverse_cell_size, 0, grid->cells_x_mask);
  entity->max_y = clamp((entity->y + entity->r) * grid->inverse_cell_size, 0, grid->cells_y_mask);
  
  for(uint8_t x = entity->min_x; x <= entity->max_x; ++x) {
    for(uint8_t y = entity->min_y; y <= entity->max_y; ++y) {
      const uint32_t idx = grid_get_node_entity(grid);
      grid->node_entities[idx].ref = entity_id;
      grid->node_entities[idx].next = grid->cells[x * grid->cells_y + y];
      grid->cells[x * grid->cells_y + y] = idx;
    }
  }
}

static void grid_remove_raw(struct grid* const grid, const uint16_t id, uint8_t min_x, uint8_t min_y, const uint8_t max_x, const uint8_t max_y) {
  const uint8_t min_y_save = min_y;
  for(; min_x <= max_x; ++min_x) {
    for(min_y = min_y_save; min_y <= max_y; ++min_y) {
      uint32_t* const cell = grid->cells + ((uint16_t) min_x * grid->cells_y + min_y);
      for(uint32_t i = *cell, prev = 0; i != 0; prev = i, i = grid->node_entities[i].next) {
        if(grid->node_entities[i].ref != id) {
          continue;
        }
        if(prev == 0) {
          *cell = grid->node_entities[i].next;
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
  grid_remove_raw(grid, id, grid->entities[id].min_x, grid->entities[id].min_y, grid->entities[id].max_x, grid->entities[id].max_y);
  grid_return_entity(grid, id);
}

void grid_recalculate(const struct grid* const grid, struct grid_entity* const entity) {
  entity->min_x = clamp((entity->x - entity->r) * grid->inverse_cell_size, 0, grid->cells_x_mask);
  entity->min_y = clamp((entity->y - entity->r) * grid->inverse_cell_size, 0, grid->cells_y_mask);
  entity->max_x = clamp((entity->x + entity->r) * grid->inverse_cell_size, 0, grid->cells_x_mask);
  entity->max_y = clamp((entity->y + entity->r) * grid->inverse_cell_size, 0, grid->cells_y_mask);
}

void grid_update(struct grid* const grid) {
  GRID_FOR(grid, i) {
    struct grid_entity* entity = grid->entities + i;
    const uint8_t min_x = clamp((entity->x - entity->r) * grid->inverse_cell_size, 0, grid->cells_x_mask);
    const uint8_t min_y = clamp((entity->y - entity->r) * grid->inverse_cell_size, 0, grid->cells_y_mask);
    const uint8_t max_x = clamp((entity->x + entity->r) * grid->inverse_cell_size, 0, grid->cells_x_mask);
    const uint8_t max_y = clamp((entity->y + entity->r) * grid->inverse_cell_size, 0, grid->cells_y_mask);
    if(ball_tick(grid, i) == 0) {
      continue;
    }
    entity = grid->entities + i;
    if(min_x != entity->min_x || min_y != entity->min_y || max_x != entity->max_x || max_y != entity->max_y) {
      grid_remove_raw(grid, i, min_x, min_y, max_x, max_y);
      for(uint8_t x = entity->min_x; x <= entity->max_x; ++x) {
        for(uint8_t y = entity->min_y; y <= entity->max_y; ++y) {
          const uint32_t idx = grid_get_node_entity(grid);
          uint32_t* const cell = grid->cells + ((uint16_t) x * grid->cells_y + y);
          grid->node_entities[idx].ref = i;
          grid->node_entities[idx].next = *cell;
          *cell = idx;
        }
      }
    }
  } GRID_ROF();
}
