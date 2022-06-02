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
  grid->half_cell_size = grid->cell_size >> 1;

  grid->cells = shnet_calloc((uint32_t) grid->cells_x * (uint32_t) grid->cells_y, sizeof(*grid->cells));
  assert(grid->cells);
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
  if(grid->entities_used >= grid->entities_size) {
    if(grid->entities_size >= 32768) {
      grid->entities_size = UINT16_MAX;
    } else {
      grid->entities_size <<= 1;
    }
    grid->entities = shnet_realloc(grid->entities, sizeof(*grid->entities) * grid->entities_size);
    assert(grid->entities);
  }
  return grid->entities_used++;
}

void grid_return_entity(struct grid* const grid, const uint16_t entity_id) {
  grid->entities[entity_id].max_x = UINT16_MAX;
  grid->entities[entity_id].ref = grid->free_entity;
  grid->free_entity = entity_id;
}

static uint32_t grid_get_node_entity(struct grid* const grid) {
  if(grid->free_node_entity != 0) {
    const uint32_t ret = grid->free_node_entity;
    grid->free_node_entity = grid->node_entities[ret].ref;
    return ret;
  }
  if(grid->node_entities_used >= grid->node_entities_size) {
    grid->node_entities_size <<= 1;
    grid->node_entities = shnet_realloc(grid->node_entities, sizeof(*grid->node_entities) * grid->node_entities_size);
    assert(grid->node_entities);
  }
  return grid->node_entities_used++;
}

static uint16_t clamp(const float x, const float min, const float max) {
  return x < min ? min : x > max ? max : x;
}

void grid_insert(struct grid* const grid, const uint16_t entity_id) {
  struct grid_entity* const entity = grid->entities + entity_id;
  entity->min_x = clamp((entity->x - entity->r) * grid->inverse_cell_size, 0, grid->cells_x - 1);
  entity->min_y = clamp((entity->y - entity->r) * grid->inverse_cell_size, 0, grid->cells_y - 1);
  entity->max_x = clamp((entity->x + entity->r) * grid->inverse_cell_size, 0, grid->cells_x - 1);
  entity->max_y = clamp((entity->y + entity->r) * grid->inverse_cell_size, 0, grid->cells_y - 1);
  
  for(uint16_t x = entity->min_x; x <= entity->max_x; ++x) {
    for(uint16_t y = entity->min_y; y <= entity->max_y; ++y) {
      const uint32_t idx = grid_get_node_entity(grid);
      grid->node_entities[idx].ref = entity_id;
      grid->node_entities[idx].next = grid->cells[x * grid->cells_y + y];
      grid->cells[x * grid->cells_y + y] = idx;
    }
  }
}

static void grid_remove_raw(struct grid* const grid, const uint16_t id, uint16_t x, uint16_t y, const uint16_t max_x, const uint16_t max_y) {
  const uint16_t y_save = y;
  for(; x <= max_x; ++x) {
    for(y = y_save; y <= max_y; ++y) {
      uint16_t* const cell = grid->cells + ((uint32_t) x * grid->cells_y + y);
      for(uint16_t i = *cell, prev = 0; i != 0; prev = i, i = grid->node_entities[i].next) {
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
  entity->min_x = clamp((entity->x - entity->r) * grid->inverse_cell_size, 0, grid->cells_x - 1);
  entity->min_y = clamp((entity->y - entity->r) * grid->inverse_cell_size, 0, grid->cells_y - 1);
  entity->max_x = clamp((entity->x + entity->r) * grid->inverse_cell_size, 0, grid->cells_x - 1);
  entity->max_y = clamp((entity->y + entity->r) * grid->inverse_cell_size, 0, grid->cells_y - 1);
}

void grid_update(struct grid* const grid) {
  GRID_FOR(grid, i);
  struct grid_entity* const entity = grid->entities + i;
  const uint16_t min_x = clamp((entity->x - entity->r) * grid->inverse_cell_size, 0, grid->cells_x - 1);
  const uint16_t min_y = clamp((entity->y - entity->r) * grid->inverse_cell_size, 0, grid->cells_y - 1);
  const uint16_t max_x = clamp((entity->x + entity->r) * grid->inverse_cell_size, 0, grid->cells_x - 1);
  const uint16_t max_y = clamp((entity->y + entity->r) * grid->inverse_cell_size, 0, grid->cells_y - 1);
  if(grid->update(grid, i) == 0) {
    continue;
  }
  if(min_x != entity->min_x || min_y != entity->min_y || max_x != entity->max_x || max_y != entity->max_y) {
    grid_remove_raw(grid, i, min_x, min_y, max_x, max_y);
    for(uint16_t x = entity->min_x; x <= entity->max_x; ++x) {
      for(uint16_t y = entity->min_y; y <= entity->max_y; ++y) {
        const uint32_t idx = grid_get_node_entity(grid);
        uint16_t* const cell = grid->cells + ((uint32_t) x * grid->cells_y + y);
        grid->node_entities[idx].ref = i;
        grid->node_entities[idx].next = *cell;
        *cell = idx;
      }
    }
  }
  GRID_ROF();
}
