#ifndef game_grid_h
#define game_grid_h 1

#include <stdint.h>

struct grid_entity {
  uint32_t ref;
  float x;
  float y;
  float r;
  uint16_t min_x;
  uint16_t min_y;
  uint16_t max_x;
  uint16_t max_y;
};

struct grid_node_entity {
  uint16_t ref;
  uint16_t next;
};

struct grid {
  uint16_t* cells;
  struct grid_entity* entities;
  struct grid_node_entity* node_entities;
  
  int  (*update)(struct grid*, struct grid_entity*);
  void (*collide)(struct grid*, struct grid_entity*, struct grid_entity*);
  
  uint16_t cells_x;
  uint16_t cells_y;
  float inverse_cell_size;
  uint16_t cell_size;
  
  uint32_t free_entity;
  uint32_t entities_used;
  uint32_t entities_size;
  
  uint32_t free_node_entity;
  uint32_t node_entities_used;
  uint32_t node_entities_size;
};

#define GRID_FOR(grid, i) \
for(uint32_t i = 1; i < (grid)->entities_used; ++i) { \
  if((grid)->entities[i].max_x == UINT16_MAX) continue

#define GRID_ROF() }

#define GRID_NESTED_FOR(grid, i, j) \
GRID_FOR(grid, i); \
for(uint32_t j = i + 1; j < (grid)->entities_used; ++j) { \
  if((grid)->entities[j].max_x == UINT16_MAX) continue

#define GRID_NESTED_ROF() } }

extern void grid_init(struct grid* const);

extern void grid_free(struct grid* const);

extern uint16_t grid_insert(struct grid* const, const struct grid_entity* const);

extern void grid_remove(struct grid* const, const uint16_t);

extern void grid_recalculate(const struct grid* const, struct grid_entity* const);

extern void grid_update(struct grid* const);

#endif // game_grid_h
