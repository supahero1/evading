"use strict";

const uWS = require("uWebSockets.js");
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

const clients = {};
let clients_i = 1;
let clients_len = 0;

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
    const id = buffer[3] | (buffer[4] << 8) | (buffer[5] << 16);
    const ws = clients[id];
    if(typeof ws !== "undefined" && ws.game_ready == 1 && ws.game_close == 0) {
      if(len == 6) {
        ws.game_ready = 0;
        ws.end();
      } else if(ws.send(buffer.subarray(6, len), true, false) == 2) {
        ws.close();
      }
    }
    buffer.copyWithin(0, len, buffer_at);
    buffer_at -= len;
    if(buffer_at >= 6) {
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
    maxPayloadLength: 1 + max_chat_message_len,
    maxBackpressure: 4194304,
    idleTimeout: 0,
    open: function(ws) {
      if(clients_len >= max_players) {
        ws.game_close = 1;
        return ws.end(4000);
      }
      ws.game_ready = 0;
      ws.game_close = 0;
      ws.pinging = -1;
      ws.game_id = clients_i;
      clients_i = Math.max((clients_i + 1) & ((1 << 24) - 1), 1);
      clients[ws.game_id] = ws;
      ++clients_len;
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
      const a = new Uint8Array([message.byteLength, ws.game_ready, ws.game_id, ws.game_id >> 8, ws.game_id >> 16]);
      if(!ws.game_ready) {
        ws.game_ready = 1;
        ws.pinging = setInterval(ws.ping.bind(ws), 1000);
      }
      socket.cork();
      socket.write(a);
      socket.write(new Uint8Array(message));
      socket.uncork();
    },
    close: function(ws) {
      if(ws.game_close) return;
      ws.game_close = 1;
      clearInterval(ws.pinging);
      delete clients[ws.game_id];
      if(ws.game_ready == 1) {
        socket.write(new Uint8Array([0, 2, ws.game_id, ws.game_id >> 8, ws.game_id >> 16]));
      }
      --clients_len;
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
        req.write(JSON.stringify({ ip: "ws__SECURE_SERVER_CHAR__://__SERVER_NAME__:8191/", players: clients_len, max_players: max_players }));
        req.end();
      }
      setInterval(register_self, 5000);
      register_self();
    } else {
      console.log("uWebSockets.js server failed to start");
      process.exit();
    }
  });
}