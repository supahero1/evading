"use strict";

const fs = require("fs");

let http;
let port;
if(__SECURE_WEBSITE__) {
  http = require("https");
  port = 443;
} else {
  http = require("http");
  port = 80;
}

const clients = [];
let free = -1;
function get_client_id() {
  if(free == -1) {
    return clients.length;
  } else {
    const ret = free;
    free = clients[free];
    return ret;
  }
}
function return_client_id(id) {
  clients[id] = free;
  free = id;
}

const net = require("net");
const socket = net.createConnection(23456, "127.0.0.1");
socket.setNoDelay(true);
socket.setKeepAlive(true, 1);
const buffer = new Uint8Array(16777216);
let buffer_at = 0;
let first_msg = 1;
let max_players;
let max_chat_message_len;
socket.on("data", function(data) {
  buffer.set(data, buffer_at);
  if(first_msg) {
    first_msg = 0;
    max_players = buffer[0];
    max_chat_message_len = buffer[1];
    create_ws_server();
    return;
  }
  buffer_at += data.length;
  let len = buffer[0] | (buffer[1] << 8) | (buffer[2] << 16);
  while(len <= buffer_at) {
    const id = buffer[3];
    if(typeof clients[id] == "object" && clients[id].game_ready == 1 && clients[id].game_close == 0) {
      if(len == 4) {
        clients[id].game_close = 1;
        clearInterval(clients[id].pinging);
        clients[id].end();
        return_client_id(id);
      } else if(clients[id].send(buffer.subarray(4, len), true, false) == 2) {
        clients[id].close();
      }
    }
    buffer.copyWithin(0, len, buffer_at);
    buffer_at -= len;
    if(buffer_at >= 4) {
      len = buffer[0] | (buffer[1] << 8) | (buffer[2] << 16);
    } else {
      break;
    }
  }
});
socket.on("error", function(e) {
  console.log("master socket error", e);
  process.exit();
});
socket.on("end", function() {
  console.log("master socket closed");
  process.exit();
});

function create_ws_server() {
  const uWS = require("uWebSockets.js");
  let app;
  if(__SECURE_SERVER__) {
    app = uWS.SSLApp({
      cert_file_name: "/etc/letsencrypt/live/__SERVER_NAME__/fullchain.pem",
      key_file_name: "/etc/letsencrypt/live/__SERVER_NAME__/privkey.pem"
    });
  } else {
    app = uWS.App({});
  }
  app.ws("/*", {
    compression: uWS.DISABLED,
    maxPayloadLength: 1 + 1 + max_chat_message_len,
    maxBackpressure: 4194304,
    idleTimeout: 0,
    open: function(ws) {
      if(free == -1 && clients.length >= max_players) {
        ws.game_close = 1;
        return ws.end(4000);
      }
      ws.game_id = get_client_id();
      ws.game_close = 0;
      clients[ws.game_id] = ws;
    },
    message: function(ws, message, is_binary) {
      if(ws.game_close) {
        return;
      }
      if(!is_binary) {
        return ws.close();
      }
      if(message.byteLength == 0) {
        return ws.send(new Uint8Array(0), true, false);
      }
      if(!ws.game_ready) {
        ws.game_ready = 1;
        ws.pinging = setInterval(ws.ping.bind(ws), 1000);
      }
      socket.cork();
      socket.write(new Uint8Array([message.byteLength, ws.game_id]));
      socket.write(new Uint8Array(message));
      socket.uncork();
    },
    close: function(ws) {
      if(ws.game_close) return;
      ws.game_close = 1;
      clearInterval(ws.pinging);
      return_client_id(ws.game_id);
      if(ws.game_ready == 1) {
        socket.write(new Uint8Array([0, ws.game_id]));
      }
    }
  }).listen("0.0.0.0", 8191, function(token) {
    if(token) {
      function register_self() {
        let req = http.request({
          host: "__WEBSITE_NAME__",
          path: "/XnAD9SZs3xJ9SAcHmHQlh17bD6V8DzOvNAhw3WGZwL2JAn7MeWD06cx4YnmuLU78",
          port,
          method: "POST",
          headers: { "Content-Type": "application/json" }
        }, function(){});
        req.on("error", function(){});
        req.write(JSON.stringify({ ip: "ws__SECURE_SERVER_CHAR__://__SERVER_NAME__:8191", players: clients.length, max_players: max_players }));
        req.end();
      }
      setInterval(register_self, 5000);
      register_self();
    } else {
      console.log("server couldn't start");
      process.exit();
    }
  });
}