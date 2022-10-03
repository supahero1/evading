#ifndef _game_grid_h_
#define _game_grid_h_ 1

#include <stdint.h>

struct grid_entity {
  uint32_t ref;
  float x;
  float y;
  float r;
  uint8_t min_x;
  uint8_t min_y;
  uint8_t max_x;
  uint8_t max_y;
};

struct grid_node_entity {
  uint32_t ref;
  uint32_t next;
};

struct grid {
  uint32_t* cells;
  struct grid_entity* entities;
  struct grid_node_entity* node_entities;

  uint8_t cells_x_mask;
  uint8_t cells_y_mask;
  
  uint16_t free_entity;
  uint16_t entities_used;
  uint16_t entities_size;
  
  uint32_t free_node_entity;
  uint32_t node_entities_used;
  uint32_t node_entities_size;

  float inverse_cell_size;
  float f_half_cell_size;

  uint8_t cells_x;
  uint8_t cells_y;
  uint8_t u8_cell_size;
  uint8_t f_cell_size;
  uint8_t u8_half_cell_size;

  uint16_t addon;
};

#define GRID_FOR(grid, i) \
for(uint16_t i = 1; i < (grid)->entities_used; ++i) { \
  if((grid)->entities[i].max_x == UINT8_MAX) continue; \
  do 

#define GRID_ROF() while(0); }

extern void grid_init(struct grid* const, const uint16_t);

extern void grid_free(const struct grid* const);

extern uint16_t grid_get_entity(struct grid* const);

extern void grid_return_entity(struct grid* const, const uint16_t);

extern void grid_insert(struct grid* const, const uint16_t);

extern void grid_remove(struct grid* const, const uint16_t);

extern void grid_recalculate(const struct grid* const, struct grid_entity* const);

extern void grid_update(struct grid* const);


extern int ball_tick(struct grid* const, const uint16_t);

#endif /* _game_grid_h_ */
