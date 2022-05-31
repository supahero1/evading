"use strict";

const https = require("https");

const game_client_close = 0;
const game_client_data = 1;
const game_client_open = 2;

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
socket.on("data", function(data) {
  buffer.set(data, buffer_at);
  buffer_at += data.length;
  let len = buffer[0] | (buffer[1] << 8) | (buffer[2] << 16);
  while(len <= buffer_at) {
    const id = buffer[3];
    if(typeof clients[id] == "object" && clients[id].game_ready == 1) {
      if(len == 4) {
        clients[id].game_close = 1;
        clients[id].end();
        return_client_id(id);
      } else {
        clients[id].send(buffer.subarray(4, len), true, true);
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
  console.error("master socket closed");
  process.exit();
});

const uWS = require("uWebSockets.js");
uWS.SSLApp({
  cert_file_name: "/etc/letsencrypt/live/amsterdam.shadam.xyz/fullchain.pem",
  key_file_name: "/etc/letsencrypt/live/amsterdam.shadam.xyz/privkey.pem"
}).ws("/*", {
  compression: uWS.DISABLED,
  maxPayloadLength: 15,
  idleTimeout: 0,
  open: function(ws) {
    if(free == -1 && clients.length >= 255) {
      return ws.end();
    }
    ws.game_id = get_client_id();
    ws.game_close = 0;
    clients[ws.game_id] = ws;
  },
  message: function(ws, message, is_binary) {
    if(ws.game_close) return;
    if(message.byteLength == 0) {
      return ws.send(new Uint8Array(0), true, false);
    }
    ws.game_ready = 1;
    message = new Uint8Array(message);
    socket.write(new Uint8Array([message.byteLength + 1, ws.game_id, ...message]));
  },
  close: function(ws, code, message) {
    if(ws.game_close) return;
    ws.game_close = 1;
    return_client_id(ws.game_id);
    if(ws.game_ready) {
      socket.write(new Uint8Array([1, ws.game_id]));
    }
  }
}).listen(34567, function(token) {
  if(token) {
    function register_self() {
      let req = https.request({
        host: "shadam.xyz",
        path: "/XnAD9SZs3xJ9SAcHmHQlh17bD6V8DzOvNAhw3WGZwL2JAn7MeWD06cx4YnmuLU78",
        port: 443,
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }, function(){});
      req.on("error", function(){});
      req.write(JSON.stringify({ ip: "wss://amsterdam.shadam.xyz", players: clients.length }));
      req.end();
    }
    setInterval(register_self, 5000);
    register_self();
  } else {
    console.log("server couldn't start");
    process.exit();
  }
});