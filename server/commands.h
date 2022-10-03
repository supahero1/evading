#ifndef _game_commands_h_
#define _game_commands_h_ 1

#include <stdint.h>

enum game_command {
  command_invalid,
  command_die,
  command_menu,
  command_spectate,
  command_godmode,
  command_server_reboot,
  command_server_restart,
  command_undying
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

#endif /* _game_commands_h_ */
