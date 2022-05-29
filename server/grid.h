#ifndef game_grid_h
#define game_grid_h 1

#include <stdint.h>

struct grid_entity {
  uint16_t ref;
  uint16_t unused;
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
  
  uint16_t free_entity;
  uint16_t entities_used;
  uint16_t entities_size;
  
  uint16_t free_node_entity;
  uint16_t node_entities_used;
  uint16_t node_entities_size;
};

extern void grid_init(struct grid* const);

extern void grid_free(struct grid* const);

extern uint16_t grid_insert(struct grid* const, const struct grid_entity* const);

extern void grid_remove(struct grid* const, const uint16_t);

extern uint16_t grid_get_idx(const struct grid* const, const struct grid_entity* const);

extern void grid_recalculate(const struct grid* const, struct grid_entity* const);

extern void grid_update(struct grid* const);

extern void grid_collide(struct grid* const);

extern void grid_crosscollide(struct grid* const, struct grid* const);

#endif // game_grid_h