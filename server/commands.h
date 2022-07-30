#ifndef game_commands_h
#define game_commands_h 1

#include <stdint.h>

enum game_command {
  command_invalid,
  command_respawn,
  command_die,
  command_menu,
  command_spectate,
  command_godmode,
  command_server_reboot
};

struct command_def {
  const char* const command_char;
  const enum game_command command;
  uint8_t command_len;
  uint8_t in_game:1;
  uint8_t out_game:1;
  uint8_t admin:1;
};

struct command_hashmap {
  uint16_t command_id;
  uint16_t command;
};

extern void init_commands(void);

extern const struct command_def* find_command(const char*, uint32_t);

#endif // game_commands_h