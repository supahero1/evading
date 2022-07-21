#include "commands.h"

#include <string.h>
#include <stdlib.h>
#include <assert.h>

static struct command_def command_defs[] = (struct command_def[]) {
  { "respawn", command_respawn, .in_game = 1, .out_game = 1 },
  { "r", command_respawn, .in_game = 1, .out_game = 1 },
  { "die", command_die, .in_game = 1 },
  { "d", command_die, .in_game = 1 },
  { "menu", command_menu, .in_game = 1, .out_game = 1 },
  { "m", command_menu, .in_game = 1, .out_game = 1 },
  { "spectate", command_spectate, .out_game = 1 },
  { "s", command_spectate, .out_game = 1 },
  { "godmode", command_godmode, .in_game = 1, .admin = 1 },
  { "gm", command_godmode, .in_game = 1, .admin = 1 },
  {0}
};

static struct command_hashmap* commands;
static uint32_t commands_hashmap_len = 0;

static uint32_t FNV_1a(const char* const cmd, const uint32_t len) {
  uint32_t hash = 2166136261;
  for(uint32_t i = 0; i < len; ++i) {
    hash ^= cmd[i];
    hash *= 16777619;
  }
  return hash;
}

static void add_command(const uint16_t id) {
  uint32_t idx = FNV_1a(command_defs[id].command_char, command_defs[id].command_len) % commands_hashmap_len;
  while(commands[idx].command != command_invalid) {
    idx = (idx + 1) % commands_hashmap_len;
  }
  commands[idx].command_id = id;
  commands[idx].command = command_defs[id].command;
}

void init_commands(void) {
  for(uint32_t i = 0; command_defs[i].command != command_invalid; ++i) {
    ++commands_hashmap_len;
  }
  commands_hashmap_len <<= 1;
  commands = calloc(commands_hashmap_len, sizeof(*commands));
  assert(commands);
  for(uint32_t i = 0; command_defs[i].command != command_invalid; ++i) {
    command_defs[i].command_len = strlen(command_defs[i].command_char);
    add_command(i);
  }
}

const struct command_def* find_command(const char* cmd, uint32_t len) {
  if(len == 0 || cmd[0] != '/') {
    return NULL;
  }
  ++cmd;
  --len;
  uint32_t idx = FNV_1a(cmd, len) % commands_hashmap_len;
  while(1) {
    if(commands[idx].command == command_invalid) {
      return NULL;
    }
    const uint16_t id = commands[idx].command_id;
    if(command_defs[id].command_len == len && strncasecmp(command_defs[id].command_char, cmd, len) == 0) {
      return command_defs + id;
    }
    idx = (idx + 1) % commands_hashmap_len;
  }
  assert(0);
}