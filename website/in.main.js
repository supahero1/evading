const { readFileSync } = require("fs");
const express = require("express");

function read(path) {
  return readFileSync(path, "utf8");
};

const main_checksum = read("../client/main.checksum.txt").substring(15, 23) + ".js";
const style_checksum = read("../client/style.checksum.txt").substring(15, 23) + ".css";

const changelog_txt = read("../client/changelog.txt");
let index_html = read("../client/index.html");
const favicon = read("../client/favicon.ico");
const discord_svg = read("../client/discord.svg");
let main_js = read("../client/main.min2.js");
let style_css = read("../client/style.min.css");
const map_editor_png = readFileSync("../client/map_editor.png");

const IDs = index_html.match(/ID_(\w+)/g);
const ID_map = {};
const ID_sorted = [];
for(const ID of IDs) {
  if(ID_map[ID] == undefined) {
    ID_map[ID] = 0;
    ID_sorted[ID_sorted.length] = ID;
  }
}
ID_sorted.sort((a, b) => b.length - a.length);
let i = 0;
const ID_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
for(const ID of ID_sorted) {
  index_html = index_html.replace(new RegExp(`"([#\.]?)${ID}"`, "g"), `"$1${ID_chars[i]}"`);
  main_js = main_js.replace(new RegExp(`"([#\.]?)${ID}"`, "g"), `"$1${ID_chars[i]}"`);
  style_css = style_css.replace(new RegExp(`([#\.])${ID.substring(3)}`, "g"), "$1" + ID_chars[i]);
  ++i;
}
index_html = index_html.replace("main.js", main_checksum).replace("style.css", style_checksum).replace("__CHANGELOG__", changelog_txt);

const map_editor_main_checksum = read("../map_editor/main.checksum.txt").substring(15, 23) + ".js";
const map_editor_style_checksum = read("../map_editor/style.checksum.txt").substring(15, 23) + ".css";

const map_editor_index_html = read("../map_editor/index.html").replace("main.js", map_editor_main_checksum).replace("style.css", map_editor_style_checksum);
const map_editor_main_js = read("../map_editor/main.min2.js");
const map_editor_style_css = read("../map_editor/style.min.css");

const options = {
  key: read("./key.pem"),
  cert: read("./cert.pem"),
  dhparam: read("./dhparams.pem"),

  rejectUnauthorized: true,
  requestCert: true,
  ca: [read("./cloudflare.pem")]
};

const servers = {};
let servers_str = "[]";
let replaced_index_html = index_html.replace("__SERVERS__", servers_str);
function add_server(ip, players, max_players) {
  servers[ip] = [new Date().getTime(), players, max_players, ip];
  servers_str = JSON.stringify(Object.values(servers).map(r => r.slice(1)));
  replaced_index_html = index_html.replace("__SERVERS__", servers_str);
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
    replaced_index_html = index_html.replace("__SERVERS__", servers_str);
  }
}, 1000);

const app = express();
app.use(express.json());

app.get(["/", "/index.html"], function(req, res) {
  res.set("Content-Type", "text/html");
  res.status(200).end(replaced_index_html);
});

app.get("/favicon.ico", function(req, res) {
  res.set("Content-Type", "image/vnd.microsoft.icon");
  res.status(200).end(favicon);
});

app.get("/discord.svg", function(req, res) {
  res.set("Content-Type", "image/svg+xml");
  res.status(200).end(discord_svg);
})

app.get("/" + main_checksum, function(req, res) {
  res.set("Content-Type", "text/javascript");
  res.status(200).end(main_js);
});

app.get("/" + style_checksum, function(req, res) {
  res.set("Content-Type", "text/css");
  res.status(200).end(style_css);
});

app.get("/map_editor.png", function(req, res) {
  res.set("Content-Type", "image/png");
  res.status(200).end(map_editor_png);
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
  const sessions = {};
  const server = require("https").createServer(options, app).listen(443, "0.0.0.0");
  server.on("newSession", function(id, data, cb) {
    id = id.toString("hex");
    sessions[id] = data;
    setTimeout(function() {
      delete sessions[id];
    }, 1000 * 60 * 5);
    cb();
  });
  server.on("resumeSession", function(id, cb) {
    cb(null, sessions[id.toString("hex")] || null);
  });
} else {
  require("http").createServer(app).listen(80, "0.0.0.0");
}
