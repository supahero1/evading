"use strict";

let http;
let port;
if(0) {
  http = require("https");
  port = 443;
} else {
  http = require("http");
  port = 80;
}

let num = 0;
let max = 0;

let send = false;

function register_self() {
  if(!send) return;
  let req = http.request({
    host: "localhost",
    path: "/XnAD9SZs3xJ9SAcHmHQlh17bD6V8DzOvNAhw3WGZwL2JAn7MeWD06cx4YnmuLU78",
    port,
    method: "POST",
    headers: { "Content-Type": "text/plain" }
  });
  req.on("error", console.log);
  req.write(`ws://localhost:8191/,${num},${max}`);
  req.end();
}
function start() {
  setInterval(register_self, 2000);
  register_self();
}
let first = false;
function parse(n, m) {
  num = n;
  max = m;
  if(!first) {
    first = true;
    start();
  }
}

const net = require("net");
let socket;
function conn() {
  socket = net.createConnection(23456, "127.0.0.1");
  socket.setNoDelay(true);
  socket.setKeepAlive(true, 1);
  socket.on("data", function(data) {
    data = new Uint8Array(data);
    if(data.length == 2) {
      send = true;
      parse(data[0], data[1]);
    }
  });
  socket.on("error", function() {
    send = false;
    setTimeout(conn, 1000);
  });
  socket.on("end", function() {
    send = false;
    setTimeout(conn, 1000);
  });
}
conn();
