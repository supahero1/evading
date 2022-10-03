const { readFileSync } = require("fs");
const express = require("express");
const { createHash } = require("crypto");

function read(path) {
  return readFileSync(path, "utf8");
}

const changelog_txt = read("../client/changelog.txt");
let index_html = read("../client/index.html");
const favicon_ico = readFileSync("../client/favicon.ico");
const discord_svg = read("../client/discord.svg");
let main_js = read("../client/main.min.js");
let style_css = read("../client/style.min.css");
const memory_mem = readFileSync("../client/memory.mem");
const policy_txt = read("../client/policy.txt");
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

const memory_checksum = createHash("sha256").update(memory_mem).digest("hex").substring(0, 8) + ".mem";
main_js = main_js.replaceAll("memory.mem", memory_checksum);

const main_checksum = createHash("sha256").update(main_js).digest("hex").substring(0, 8) + ".js";
const style_checksum = createHash("sha256").update(style_css).digest("hex").substring(0, 8) + ".css";
index_html = index_html
.replaceAll("main.js", main_checksum)
.replaceAll("style.css", style_checksum)
.replaceAll("memory.mem", memory_checksum)
.replace("__CHANGELOG__", changelog_txt);

const map_editor_main_js = read("../map_editor/main.min.js");
const map_editor_style_css = read("../map_editor/style.min.css");
const map_editor_main_checksum = createHash("sha256").update(map_editor_main_js).digest("hex").substring(0, 8) + ".js";
const map_editor_style_checksum = createHash("sha256").update(map_editor_style_css).digest("hex").substring(0, 8) + ".css";
const map_editor_index_html = read("../map_editor/index.html").replaceAll("main.js", map_editor_main_checksum).replaceAll("style.css", map_editor_style_checksum);

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
const body_parser = require("body-parser");
app.use(body_parser.raw({
  inflate: false,
  type: "text/plain"
}));

app.get(["/", "/index.html"], function(req, res) {
  res.set("Content-Type", "text/html");
  res.status(200).end(replaced_index_html);
});

app.get("/favicon.ico", function(req, res) {
  res.set("Content-Type", "image/x-icon");
  res.status(200).end(favicon_ico);
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

app.get("/policy.txt", function(req, res) {
  res.set("Content-Type", "text/plain");
  res.status(200).end(policy_txt);
});

app.get("/" + memory_checksum, function(req, res) {
  res.set("Content-Type", "application/octet-stream");
  res.status(200).end(memory_mem);
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
  if(!req.body) return res.status(400).end();
  let info;
  try {
    info = new TextDecoder().decode(req.body).split(",");
  } catch(err) {
    return res.status(400).end();
  }
  if(info.length != 3) return res.status(400).end();
  add_server(info[0], parseInt(info[1], 10), parseInt(info[2], 10));
  res.status(204).end();
});

if(0) {
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
