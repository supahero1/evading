const fs = require("fs");
const express = require("express");

const index_html = fs.readFileSync("../client/index.html");
const favicon = fs.readFileSync("../client/favicon.ico");
const main_js = fs.readFileSync("../client/main.min2.js");
const style_css = fs.readFileSync("../client/style.css");

const options = {
  key: fs.readFileSync("./key.pem"),
  cert: fs.readFileSync("./cert.pem"),
  dhparam: fs.readFileSync("./dhparams.pem")
};

const servers = {};
let servers_str = "[]";
function add_server(ip, players) {
  if(servers[ip] == null) {
    servers[ip] = [new Date().getTime(), players, ip];
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
}, 10000);

const app = express();
app.use(express.json());

app.get(["/", "/index.html"], function(req, res) {
  res.set("Content-Type", "text/html");
  res.status(200).end(index_html);
});

app.get(["/favicon.ico", "/map_editor/favicon.ico"], function(req, res) {
  res.set("Content-Type", "image/vnd.microsoft.icon");
  res.status(200).end(favicon);
});

app.get("/main.js", function(req, res) {
  res.set("Content-Type", "text/javascript");
  res.status(200).end(main_js);
});

app.get("/style.css", function(req, res) {
  res.set("Content-Type", "text/css");
  res.status(200).end(style_css);
});

app.get("/servers.json", function(req, res) {
  res.set("Content-Type", "application/json");
  res.status(200).end(servers_str);
});

app.post("/XnAD9SZs3xJ9SAcHmHQlh17bD6V8DzOvNAhw3WGZwL2JAn7MeWD06cx4YnmuLU78", function(req, res) {
  if(req.body && req.body.ip && req.body.players != undefined) {
    add_server(req.body.ip, req.body.players);
    res.status(204).end();
  } else {
    res.status(400).end();
  }
});

if(__SECURE_WEBSITE__) {
  require("https").createServer(options, app).listen(443);
} else {
  require("http").createServer(app).listen(80);
}