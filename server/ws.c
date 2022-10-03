#include "ws.h"

#include <string.h>
#include <assert.h>
#include <pthread.h>

#include <shnet/error.h>

#define PACKET_SIZE 16384
#define MAX_BUFFER  (UINT32_C(1) << UINT32_C(21)) /* 2MiB */

static struct ws_client clients[max_players] = {0};
static uint8_t clients_used = 0;
static uint8_t free_client = UINT8_MAX;
uint8_t clients_len = 0;

static pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

void game_lock(void) {
  assert(pthread_mutex_lock(&mutex) == 0);
}

void game_unlock(void) {
  assert(pthread_mutex_unlock(&mutex) == 0);
}

static int ws_callback(struct lws* ws, enum lws_callback_reasons reason, void* user, void* in, size_t len) {
  switch(reason) {
    case LWS_CALLBACK_ESTABLISHED:
    case LWS_CALLBACK_SERVER_WRITEABLE:
    case LWS_CALLBACK_RECEIVE:
    case LWS_CALLBACK_CLOSED: break;
    default: return 0;
  }
  game_lock();
  uint8_t* const u_data = user;
  uint8_t id = *(uint8_t*)user;
  if(id == UINT8_MAX) {
    goto close;
  }
  struct ws_client* client = clients + id;
  switch(reason) {
    case LWS_CALLBACK_ESTABLISHED: {
      if(clients_len >= max_players) {
        lws_close_reason(ws, 4000, NULL, 0);
        *u_data = UINT8_MAX;
        id = UINT8_MAX;
        goto close;
      }
      if(free_client == UINT8_MAX) {
        id = clients_used++;
      } else {
        id = free_client;
        free_client = clients[id].next;
      }
      *u_data = id;
      client = clients + id;
      /********************/
      client->next = 0;
      client->active = 1;
      client->ws = ws;
      ++clients_len;
      break;
    }
    case LWS_CALLBACK_SERVER_WRITEABLE: {
      if(client->to_close) goto close;
      while(client->send_len) {
        for(uint32_t i = 0; i < client->send_buf->len || client->send_buf->len == 0; i += PACKET_SIZE) {
          const uint32_t to_send = client->send_buf->len - i;
          const uint32_t sent = to_send > PACKET_SIZE ? PACKET_SIZE : to_send;
          const int ret = lws_write(ws, client->send_buf->data + LWS_PRE + i, sent, LWS_WRITE_BINARY);
          if(ret < sent) {
            goto close;
          }
          if(client->send_buf->len == 0) {
            break;
          }
        }
        free(client->send_buf->data);
        --client->send_len;
        memmove(client->send_buf, client->send_buf + 1, sizeof(*client->send_buf) * client->send_len);
      }
      break;
    }
    case LWS_CALLBACK_RECEIVE: {
      if(client->to_close) goto close;
      if(len == 0) {
        game_send(id, NULL, 0);
        break;
      }
      if(!lws_frame_is_binary(ws)) goto close;
      if(client->recv_len + len > max_message_len) goto close;
      const int final = lws_is_final_fragment(ws);
      if(lws_is_first_fragment(ws)) {
        if(final) {
          game_onmessage(id, in, len);
          break;
        }
        client->recv_buf = shnet_malloc(len);
        client->recv_len = 0;
      } else {
        client->recv_buf = shnet_realloc(client->recv_buf, client->recv_len + len);
      }
      if(client->recv_buf == NULL) goto close;
      memcpy(client->recv_buf + client->recv_len, in, len);
      client->recv_len += len;
      if(final) {
        game_onmessage(id, client->recv_buf, client->recv_len);
        free(client->recv_buf);
        client->recv_buf = NULL;
        client->recv_len = 0;
      }
      break;
    }
    case LWS_CALLBACK_CLOSED: {
      if(id == UINT8_MAX) break;
      game_onclose(id);
      client->active = 0;
      for(uint32_t i = 0; i < client->send_len; ++i) {
        free(client->send_buf[i].data);
      }
      free(client->send_buf);
      free(client->recv_buf);
      client->send_buf = NULL;
      client->recv_buf = NULL;
      client->send_len = 0;
      client->recv_len = 0;
      client->to_close = 0;
      client->next = free_client;
      free_client = id;
      --clients_len;
      break;
    }
    default: break;
  }
  game_unlock();
  return 0;

  close:
  if(id != UINT8_MAX) {
    client->to_close = 1;
  }
  game_unlock();
  return -1;
}

void game_send(const uint8_t id, const uint8_t* const data, const uint32_t len) {
  struct ws_client* const client = clients + id;
  if(!client->active) return;
  uint32_t total = len;
  for(uint32_t i = 0; i < client->send_len; ++i) {
    total += LWS_PRE + client->send_buf[i].len;
  }
  if(total > MAX_BUFFER) {
    goto close;
  }
  client->send_buf = shnet_realloc(client->send_buf, sizeof(*client->send_buf) * (client->send_len + 1));
  if(client->send_buf == NULL) {
    goto close;
  }
  void* const ptr = shnet_malloc(LWS_PRE + len);
  if(ptr == NULL) {
    goto close;
  }
  memcpy(ptr + LWS_PRE, data, len);
  client->send_buf[client->send_len].data = ptr;
  client->send_buf[client->send_len].len = len;
  ++client->send_len;
  lws_callback_on_writable(client->ws);
  return;

  close:
  client->to_close = 1;
  lws_callback_on_writable(client->ws);
}

void game_close(const uint8_t id) {
  struct ws_client* const client = clients + id;
  if(!client->active) return;
  client->to_close = 1;
  lws_callback_on_writable(client->ws);
}

void run_server(void) {
  struct lws_context_creation_info info = {0};
  const lws_retry_bo_t idle = (lws_retry_bo_t) {
    .secs_since_valid_ping = 1,
    .secs_since_valid_hangup = 10
  };
  info.port = 8191;
  info.protocols = (struct lws_protocols[]) {
    { "evading", ws_callback, sizeof(uint8_t), PACKET_SIZE, 0, NULL, 0 },
    LWS_PROTOCOL_LIST_TERM
  };
  info.pt_serv_buf_size = PACKET_SIZE;
  info.options = LWS_SERVER_OPTION_HTTP_HEADERS_SECURITY_BEST_PRACTICES_ENFORCE | LWS_SERVER_OPTION_DISABLE_IPV6;
#if 0 == 1
  info.options |= LWS_SERVER_OPTION_REDIRECT_HTTP_TO_HTTPS | LWS_SERVER_OPTION_DO_SSL_GLOBAL_INIT;
  info.ssl_cert_filepath = "/etc/letsencrypt/live/localhost/fullchain.pem";
  info.ssl_private_key_filepath = "/etc/letsencrypt/live/localhost/privkey.pem";
#endif
  info.retry_and_idle_policy = &idle;
  lws_set_log_level(0, NULL);
  struct lws_context* context = lws_create_context(&info);
  assert(context);
  while(1) {
    lws_service(context, 0);
  }
  assert(0);
}
