#ifndef _game_ws_h_
#define _game_ws_h_ 1

#include "consts.h"

#include <stdint.h>

#include <libwebsockets.h>

struct ws_frame {
  uint8_t* data;
  uint32_t len;
};

struct ws_client {
  union {
    struct lws* ws;
    uint8_t next;
  };
  struct ws_frame* send_buf;
  uint8_t* recv_buf;
  uint32_t send_len;
  uint32_t recv_len;
  uint8_t active:1;
  uint8_t to_close:1;
};

extern void game_lock(void);

extern void game_unlock(void);

extern uint8_t clients_len;

extern void game_onmessage(const uint8_t, const uint8_t*, const uint32_t);

extern void game_send(const uint8_t, const uint8_t* const, const uint32_t);

extern void game_close(const uint8_t);

extern void game_onclose(const uint8_t);

extern void run_server(void);

#endif /* _game_ws_h_ */
