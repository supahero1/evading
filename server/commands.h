#ifndef game_commands_h
#define game_commands_h 1

#include <stdint.h>

enum game_command {
  command_invalid,
  command_respawn,

  commands_len
};

struct command_def {
  const char* const command_char;
  const uint32_t command;
  uint32_t command_len;
};

struct command_hashmap {
  uint16_t command_id;
  uint16_t command;
};

extern void init_commands(void);

extern uint16_t find_command(const char* const, const uint32_t);

#endif // game_commands_h