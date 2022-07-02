const { readFileSync } = require("fs");
const express = require("express");

function read(path) {
  return readFileSync(path, "utf8");
};

const main_checksum = read("../client/main.checksum.txt").substring(15, 23) + ".js";
const style_checksum = read("../client/style.checksum.txt").substring(15, 23) + ".css";

const index_html = read("../client/index.html").replace("main.js", main_checksum).replace("style.css", style_checksum);
const favicon = read("../client/favicon.ico");
const main_js = read("../client/main.min2.js");
const style_css = read("../client/style.min.css");

const map_editor_main_checksum = read("../map_editor/main.checksum.txt").substring(15, 23) + ".js";
const map_editor_style_checksum = read("../map_editor/style.checksum.txt").substring(15, 23) + ".css";

const map_editor_index_html = read("../map_editor/index.html").replace("main.js", map_editor_main_checksum).replace("style.css", map_editor_style_checksum);
const map_editor_main_js = read("../map_editor/main.min2.js");
const map_editor_style_css = read("../map_editor/style.min.css");

const options = {
  key: read("./key.pem"),
  cert: read("./cert.pem"),
  dhparam: read("./dhparams.pem")
};

const servers = {};
let servers_str = "[]";
function add_server(ip, players, max_players) {
  const was = servers[ip] == null;
  servers[ip] = [new Date().getTime(), players, max_players, ip];
  if(was) {
    servers_str = JSON.stringify(Object.values(servers).map(r => r.slice(1)));
  }
}
setInterval(function() {
  let ok = 0;
  for(const server in servers) {
    if(new Date().getTime() - servers[server][0] >= 1000 * 10) {
      delete servers[server];
      ok = 1;
    }
  }
  if(ok) {
    servers_str = JSON.stringify(Object.values(servers).map(r => r.slice(1)));
  }
}, 1000);

const app = express();
app.use(express.json());

app.get(["/", "/index.html"], function(req, res) {
  res.set("Content-Type", "text/html");
  res.status(200).end(index_html);
});

app.get("/favicon.ico", function(req, res) {
  res.set("Content-Type", "image/vnd.microsoft.icon");
  res.status(200).end(favicon);
});

app.get("/" + main_checksum, function(req, res) {
  res.set("Content-Type", "text/javascript");
  res.status(200).end(main_js);
});

app.get("/" + style_checksum, function(req, res) {
  res.set("Content-Type", "text/css");
  res.status(200).end(style_css);
});

app.get(["/map_editor/", "/map_editor/index.html"], function(req, res) {
  res.set("Content-Type", "text/html");
  res.status(200).end(map_editor_index_html);
});

app.get("/map_editor/" + map_editor_main_checksum, function(req, res) {
  res.set("Content-Type", "text/javascript");
  res.status(200).end(map_editor_main_js);
});

app.get("/map_editor/" + map_editor_style_checksum, function(req, res) {
  res.set("Content-Type", "text/css");
  res.status(200).end(map_editor_style_css);
});

app.get("/servers.json", function(req, res) {
  res.set("Content-Type", "application/json");
  res.set("Cache-Control", "public, max-age=2");
  res.status(200).end(servers_str);
});

app.post("/XnAD9SZs3xJ9SAcHmHQlh17bD6V8DzOvNAhw3WGZwL2JAn7MeWD06cx4YnmuLU78", function(req, res) {
  if(req.body && typeof req.body.ip == "string" && typeof req.body.players == "number" && typeof req.body.max_players == "number") {
    add_server(req.body.ip, req.body.players, req.body.max_players);
    res.status(204).end();
  } else {
    res.status(400).end();
  }
});

if(__SECURE_WEBSITE__) {
  require("https").createServer(options, app).listen(443, "0.0.0.0");
} else {
  require("http").createServer(app).listen(80, "0.0.0.0");
}
