const getElementById = document.getElementById.bind(document);
const createElement = document.createElement.bind(document);
const { localStorage } = window;
let loading = getElementById("loading");
loading.innerHTML = "Fetching servers...";
let sub = getElementById("sub");
let name = getElementById("name");
let canvas = getElementById("canvas");
let ctx = canvas.getContext("2d");
let background = createElement("canvas");
let bg_ctx = background.getContext("2d");
let light_background = createElement("canvas");
let lbg_ctx = light_background.getContext("2d");
let death_arrow = createElement("canvas");
let death_arrow_ctx = death_arrow.getContext("2d");
let drawing = 0;
let tile_colors = ["#dddddd", "#aaaaaa", "#333333", "#fedf78"];
let ball_colors = ["#808080", "#fc46aa", "#008080", "#ff8e06", "#3cdfff", "#663a82"];
let width = 0;
let height = 0;
let dpr = 0;
let buffer = new ArrayBuffer(1048576);
let u8 = new Uint8Array(buffer);
let view = new DataView(u8.buffer);
let len = 0;
let self_id = 0;
let players = [];
let balls = [];
let teleports = {};
let us = { x: 0, y: 0, ip: { x1: 0, x2: 0, y1: 0, y2: 0 } };
let mouse = [0, 0];
let now = null;
let last_draw = 0;
let updates = [0, 0];
let reset = 0;
let name_y = 0;
let target_name_y = 0;
let settings_div = getElementById("settings");
let settings_insert = getElementById("ss");
let sees_settings = false;
let chat_timestamps = new Array(5).fill(0);
let saw_tutorial = localStorage.getItem("tutorial") ? 1 : 0;
let tutorial_running = 0;
let tutorial_stage = 0;
let old_fov = 0;
let _keybinds = localStorage.getItem("keybinds");
let default_keybinds = {
  ["settings"]: "Escape",
  ["up"]: "KeyW",
  ["left"]: "KeyA",
  ["right"]: "KeyD",
  ["down"]: "KeyS",
  ["slowwalk"]: "ShiftLeft"
};
let keybinds = _keybinds != null ? JSON.parse(_keybinds) : default_keybinds;
for(let prop in default_keybinds) {
  if(keybinds[prop] == undefined) {
    keybinds[prop] = default_keybinds[prop];
  }
}
for(let prop in keybinds) {
  if(default_keybinds[prop] == undefined) {
    delete keybinds[prop];
    continue;
  }
}
let movement = {
  up: 0,
  left: 0,
  right: 0,
  down: 0,
  mult: 1,
  angle: 0,
  mouse: 0,
  distance: 0
};
let bg_data = {
  area_id: 0,
  width: 0,
  height: 0,
  real_width: 0,
  real_height: 0,
  cell_size: 0,
  fills: [],
  strokes: []
};
let _settings = localStorage.getItem("settings");
let default_settings = {
  ["fov"]: {
    ["min"]: 0.25,
    ["max"]: 1.75,
    ["value"]: 1.75,
    ["step"]: 0.05
  },
  ["chat_on"]: true,
  ["max_chat_messages"]: {
    ["min"]: 1,
    ["max"]: 1000,
    ["value"]: 100,
    ["step"]: 1
  },
  ["chat_text_scale"]: {
    ["min"]: 1,
    ["max"]: 2,
    ["value"]: 1,
    ["step"]: 0.05
  },
  /*["chat_position"]: {
    ["selected"]: "Bottom left",
    ["options"]: [
      "Top left",
      "Top right",
      "Bottom left",
      "Bottom right"
    ]
  },*/
  ["draw_ball_fill"]: true,
  ["draw_ball_stroke"]: true,
  ["draw_ball_stroke_bright"]: false,
  ["ball_stroke"]: {
    ["min"]: 0,
    ["max"]: 100,
    ["value"]: 20,
    ["step"]: 1
  },
  ["draw_player_fill"]: true,
  ["draw_player_stroke"]: true,
  ["draw_player_stroke_bright"]: false,
  ["player_stroke"]: {
    ["min"]: 0,
    ["max"]: 100,
    ["value"]: 10,
    ["step"]: 1
  },
  ["draw_player_name"]: true,
  ["draw_death_arrow"]: true,
  ["death_arrow_size"]: {
    ["min"]: 10,
    ["max"]: 100,
    ["value"]: 40,
    ["step"]: 1
  }
};
let settings = _settings != null ? JSON.parse(_settings) : JSON.parse(JSON.stringify(default_settings));
for(let prop in default_settings) {
  if(settings[prop] == undefined) {
    settings[prop] = default_settings[prop];
  }
}
for(let prop in settings) {
  if(default_settings[prop] == undefined) {
    delete settings[prop];
  }
  if(settings[prop]["min"] && settings[prop]["min"] != default_settings[prop]["min"]) {
    settings[prop]["min"] = default_settings[prop]["min"];
  }
  if(settings[prop]["max"] && settings[prop]["max"] != default_settings[prop]["max"]) {
    settings[prop]["max"] = default_settings[prop]["max"];
  }
  settings[prop]["value"] = Math.max(Math.min(settings[prop]["value"], settings[prop]["max"]), settings[prop]["min"]);
}
localStorage.setItem("settings", JSON.stringify(settings));
let probing_key = false;
let probe_key = "";
let probe_resolve;
let fov = settings["fov"]["value"];
let target_fov = fov;
let chat = getElementById("chat");
let messages = getElementById("messages");
let sendmsg = getElementById("sendmsg");
let sees_chat = settings["chat_on"];
let chat_message_len = 0;
window["s"].then(r => r.json()).then(r => init(r));
function reload() {
  setTimeout(location.reload.bind(location), 1000);
}
function save_settings() {
  localStorage.setItem("settings", JSON.stringify(settings));
}
function save_keybinds() {
  localStorage.setItem("keybinds", JSON.stringify(keybinds));
}
function show_el(el) {
  settings_insert.appendChild(el);
}
function create_header(content) {
  let h1 = createElement("h1");
  h1.innerHTML = content;
  return h1;
}
function create_text(content) {
  let h3 = createElement("h3");
  h3.innerHTML = content;
  return h3;
}
function create_comment(content) {
  let h5 = createElement("h5");
  h5.innerHTML = content;
  return h5;
}
function create_table() {
  return createElement("table");
}
function table_insert_el(table, left_el, right_el) {
  let tr = createElement("tr");
  let td = createElement("td");
  td.appendChild(left_el);
  tr.appendChild(td);
  td = createElement("td");
  td.appendChild(right_el);
  tr.appendChild(td);
  table.appendChild(tr);
  return table;
}
function create_switch(name) {
  let btn = createElement("button");
  settings[name] = !settings[name];
  btn.onclick = function() {
    settings[name] = !settings[name];
    if(settings[name] == true) {
      btn.innerHTML = "ON";
      btn.style["background-color"] = "#23c552";
    } else {
      btn.innerHTML = "OFF";
      btn.style["background-color"] = "#f84f31";
    }
    save_settings();
  };
  btn.onclick();
  return btn;
}
function create_list(name) {
  let select = createElement("select");
  for(let option of settings[name]["options"]) {
    let opt = createElement("option");
    opt.value = option;
    if(option == settings[name]["selected"]) {
      opt.selected = 1;
    }
    opt.innerHTML = option;
    select.appendChild(opt);
  }
  select.onchange = save_settings;
  return select;
}
function create_keybind(name) {
  let btn = createElement("button");
  btn.innerHTML = keybinds[name];
  btn.onclick = async function() {
    btn.innerHTML = "...";
    probing_key = 1;
    await new Promise(function(resolve) {
      probe_resolve = resolve;
    });
    probing_key = 0;
    btn.innerHTML = probe_key;
    keybinds[name] = probe_key;
    save_keybinds();
  };
  return btn;
}
function create_slider(name, add="", cb=function(){}) {
  let div = createElement("div");
  div.className = "input";
  let input = createElement("input");
  input.type = "range";
  input.min = settings[name]["min"];
  input.max = settings[name]["max"];
  input.step = settings[name]["step"];
  input.value = settings[name]["value"];
  input.oninput = function() {
    input.nextElementSibling.innerHTML = input.value + add;
    settings[name]["value"] = input.valueAsNumber;
    cb();
  };
  input.onchange = save_settings;
  div.appendChild(input);
  div.appendChild(create_text(input.value + add));
  return div;
}
function create_button(name, cb) {
  let btn = createElement("button");
  btn.innerHTML = name;
  btn.onclick = cb;
  return btn;
}
function create_settings() {
  settings_insert.innerHTML = "";
  show_el(create_header("CHAT"));
  let table = create_table();
  table_insert_el(table, create_text("Show chat"), create_switch("chat_on"));
  table_insert_el(table, create_text("Max number of chat messages"), create_slider("max_chat_messages", "", function() {
    while(chat_message_len > settings["max_chat_messages"]["value"]) {
      messages.removeChild(messages.lastChild);
      --chat_message_len;
    }
  }));
  table_insert_el(table, create_text("Chat text scale"), create_slider("chat_text_scale", "", function() {
    messages.style["font-size"] = settings["chat_text_scale"]["value"] + "em";
  }));
  show_el(table);
  show_el(create_header("VISUALS"));
  table = create_table();
  //table_insert_el(table, create_text("Chat position"), create_list("chat_position")); // usage example of list
  table_insert_el(table, create_text("Default FOV"), create_slider("fov"));
  table_insert_el(table, create_text("Draw balls' fill"), create_switch("draw_ball_fill"));
  table_insert_el(table, create_text("Draw balls' stroke"), create_switch("draw_ball_stroke"));
  table_insert_el(table, create_text("Draw stroke-only balls with brighter color"), create_switch("draw_ball_stroke_bright"));
  table_insert_el(table, create_text("Balls' stroke radius percentage"), create_slider("ball_stroke", " %"));
  table_insert_el(table, create_text("Draw players' fill"), create_switch("draw_player_fill"));
  table_insert_el(table, create_text("Draw players' stroke"), create_switch("draw_player_stroke"));
  table_insert_el(table, create_text("Draw stroke-only players with brighter color"), create_switch("draw_player_stroke_bright"));
  table_insert_el(table, create_text("Players' stroke radius percentage"), create_slider("player_stroke", " %"));
  table_insert_el(table, create_text("Draw players' name"), create_switch("draw_player_name"));
  table_insert_el(table, create_text("Draw an arrow towards dead players"), create_switch("draw_death_arrow"));
  table_insert_el(table, create_text("Death arrow size"), create_slider("death_arrow_size", "px", update_death_arrow_size));
  show_el(table);
  show_el(create_header("KEYBINDS"));
  show_el(create_comment("To change, click a button on the right side and then press the key you want to asign to it."));
  table = create_table();
  table_insert_el(table, create_text("Settings"), create_keybind("settings"));
  table_insert_el(table, create_text("Move up"), create_keybind("up"));
  table_insert_el(table, create_text("Move left"), create_keybind("left"));
  table_insert_el(table, create_text("Move down"), create_keybind("down"));
  table_insert_el(table, create_text("Move right"), create_keybind("right"));
  table_insert_el(table, create_text("Move slowly"), create_keybind("slowwalk"));
  show_el(table);
  show_el(create_header("RESET"));
  table = create_table();
  table_insert_el(table, create_text("Reset settings"), create_button("RESET", function() {
    settings = default_settings;
    save_settings();
    create_settings();
  }));
  table_insert_el(table, create_text("Reset keybinds"), create_button("RESET", function() {
    keybinds = default_keybinds;
    save_keybinds();
    create_settings();
  }));
  show_el(table);
}
create_settings();
function display_chat_message(author, msg) {
  let p = createElement("p");
  p.appendChild(document.createTextNode(author + ": " + msg));
  messages.insertBefore(p, messages.firstChild);
  if(++chat_message_len > settings["max_chat_messages"]["value"]) {
    messages.removeChild(messages.lastChild);
  }
}
function update_death_arrow_size() {
  death_arrow.width = death_arrow.height = settings["death_arrow_size"]["value"];
  let h = death_arrow.width * 0.5;
  let k = death_arrow.width;
  death_arrow_ctx.beginPath();
  death_arrow_ctx.moveTo(h + k * 0.45, h);
  death_arrow_ctx.lineTo(h - k * 0.225, h - k * 0.675 / Math.sqrt(3));
  death_arrow_ctx.lineTo(h - k * 0.225, h + k * 0.675 / Math.sqrt(3));
  death_arrow_ctx.closePath();
  death_arrow_ctx.fillStyle = "#bbbbbbb0";
  death_arrow_ctx.fill();
  death_arrow_ctx.lineWidth = death_arrow.width * 0.05;
  death_arrow_ctx.strokeStyle = "#f00";
  death_arrow_ctx.stroke();
}
update_death_arrow_size();
function init(servers) {
  if(servers.length == 0) {
    loading.innerHTML = "No servers found";
    reload();
    return;
  }
  loading.innerHTML = "Connecting...";
  let arr = servers.map(function(serv) {
    let ws = new WebSocket(serv[1]);
    ws.binaryType = "arraybuffer";
    ws.probes = [];
    ws.onopen = function() {
      this.send(new Uint8Array(0));
      this.time = performance.now();
    };
    ws.onmessage = function(x) {
      this.probes[this.probes.length] = performance.now() - this.time;
      if(this.probes.length < 5) {
        this.send(new Uint8Array(0));
      }
    };
    return ws;
  });
  setTimeout(function() {
    let min = 999999;
    let min_ws = null;
    for(let ws of arr) {
      ws.s = 0;
      for(let probe of ws.probes) {
        ws.s += probe;
      }
      if(ws.probes.length > 0) {
        ws.s /= ws.probes.length;
      } else {
        ws.s = 999999;
      }
      if(ws.s < min) {
        min = ws.s;
        min_ws = ws;
      }
    }
    for(let ws of arr) {
      ws.onopen = function(){};
      ws.onmessage = function(){};
      delete ws.probes;
      delete ws.time;
      delete ws.s;
      if(ws != min_ws) {
        ws.close();
      }
    }
    if(min_ws == null || min_ws.readyState != 1) {
      loading.innerHTML = "Failed connecting";
      reload();
      return;
    }
    game(min_ws);
  }, 1000);
}
function ip() {
  us.ip.x1 = us.ip.x2;
  us.ip.y1 = us.ip.y2;
  for(let player of players) {
    if(!player) continue;
    player.ip.x1 = player.ip.x2;
    player.ip.y1 = player.ip.y2;
    player.ip.r1 = player.ip.r2;
  }
  for(let ball of balls) {
    if(!ball) continue;
    ball.ip.x1 = ball.ip.x2;
    ball.ip.y1 = ball.ip.y2;
    ball.ip.r1 = ball.ip.r2;
  }
}
function dont_go_over_limit(n) {
  return function(e) {
    let clipboard = e instanceof ClipboardEvent;
    if(clipboard && e.type != "paste") {
      return true;
    }
    let new_val = e.target.value + (clipboard ? e.clipboardData.getData("text") : e.key);
    if(new TextEncoder().encode(new_val).byteLength > n) {
      if(e.target.value == "" && clipboard) {
        const old = e.target.placeholder;
        e.target.placeholder = "Text too long to paste!";
        setTimeout(function() {
          e.target.placeholder = old;
        }, 1000);
      }
      e.preventDefault();
      return false;
    } else {
      return true;
    }
  };
}
function draw_text(text, _x, _y) {
  ctx.translate(_x, _y);
  ctx.font = `700 20px Ubuntu`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.fillText(text, 0, 0);
  ctx.strokeText(text, 0, 0);
  ctx.translate(-_x, -_y);
}
function game(ws) {
  loading.innerHTML = "Enter your name<br>";
  sub.innerHTML = "You are limited to 4 characters<br>Special characters might not fit<br>Press enter when you are done";
  name.style.display = "block";
  name.focus();
  let name_val = localStorage.getItem("name");
  if(name_val) {
    name.value = name_val;
  }
  name.onkeypress = name.onpaste = dont_go_over_limit(4);
  ws.onclose = function() {
    window.onbeforeunload = function(){};
    canvas.parentElement.removeChild(canvas);
    settings_div.parentElement.removeChild(settings_div);
    chat.parentElement.removeChild(chat);
    loading.innerHTML = "Disconnected";
    sub.innerHTML = "";
    name.style.display = "none";
    reload();
  };
  window.onkeydown = function(x) {
    if(x.code == "Enter") {
      localStorage.setItem("name", name.value);
      loading.innerHTML = "Spawning...";
      sub.innerHTML = "";
      name.style.display = "none";
      let token = localStorage.getItem("token");
      token = token ? token.split(",").map(r => +r) : [];
      let encoded = new TextEncoder().encode(name.value);
      ws.send(new Uint8Array([...encoded, ...token]));
      game2(ws);
    }
  };
}
function game2(ws) {
  sees_chat = !settings["chat_on"];
  let last_tick = 0;
  function onmessage({ data }) {
    u8.set(new Uint8Array(data));
    len = data.byteLength;
    let tick = u8[0] | (u8[1] << 8) | (u8[2] << 16) | (u8[3] << 24);
    if(last_tick != 0 && tick - last_tick != 4) {
      ws.onmessage = function(){};
      throw new Error(`tick - last_tick = ${tick - last_tick}`);
    }
    last_tick = tick;
    let idx = 4;
    updates[0] = updates[1];
    updates[1] = performance.now();
    ip();
    if(idx == len) {
      return;
    }
    if(u8[idx] == 0) {
      /* Arena */
      ++idx;
      reset = 1;
      balls = [];
      self_id = u8[idx++];
      bg_data.area_id = u8[idx] | (u8[idx + 1] << 8);
      idx += 2;
      bg_data.width = u8[idx] | (u8[idx + 1] << 8);
      idx += 2;
      bg_data.height = u8[idx] | (u8[idx + 1] << 8);
      idx += 2;
      bg_data.cell_size = u8[idx++];
      bg_data.real_width = bg_data.width * bg_data.cell_size;
      bg_data.real_height = bg_data.height * bg_data.cell_size;
      bg_data.fills = new Array(256);
      bg_data.strokes = new Array(256);
      for(let x = 0; x < bg_data.width; ++x) {
        for(let y = 0; y < bg_data.height; ++y) {
          if(bg_data.fills[u8[idx]] == null) {
            bg_data.fills[u8[idx]] = new Path2D();
            bg_data.strokes[u8[idx]] = new Path2D();
          }
          bg_data.fills[u8[idx]].rect(
            (1.5 + x * bg_data.cell_size) * settings["fov"]["max"],
            (1.5 + y * bg_data.cell_size) * settings["fov"]["max"],
            (bg_data.cell_size - 1.5 * 2) * settings["fov"]["max"],
            (bg_data.cell_size - 1.5 * 2) * settings["fov"]["max"]
          );
          bg_data.strokes[u8[idx]].rect(
            x * bg_data.cell_size * settings["fov"]["max"],
            y * bg_data.cell_size * settings["fov"]["max"],
            bg_data.cell_size * settings["fov"]["max"],
            bg_data.cell_size * settings["fov"]["max"]
          );
          ++idx;
        }
      }
      background.width = bg_data.cell_size * bg_data.width * settings["fov"]["max"];
      background.height = bg_data.cell_size * bg_data.height * settings["fov"]["max"];
      light_background.width = bg_data.cell_size * bg_data.width * settings["fov"]["max"];
      light_background.height = bg_data.cell_size * bg_data.height * settings["fov"]["max"];
      for(let i = 0; i < 256; ++i) {
        if(!bg_data.fills[i]) continue;
        bg_ctx.fillStyle = tile_colors[i] + "b0";
        bg_ctx.fill(bg_data.strokes[i]);
        bg_ctx.fillStyle = tile_colors[i];
        bg_ctx.fill(bg_data.fills[i]);
        lbg_ctx.fillStyle = tile_colors[i];
        lbg_ctx.fill(bg_data.strokes[i]);
      }
      start_drawing();
    }
    if(idx == len) {
      return;
    }
    if(u8[idx] == 1) {
      /* Players */
      ++idx;
      let count = u8[idx++];
      for(let i = 0; i < count; ++i) {
        let id = u8[idx++];
        if(!players[id]) {
          let x2 = view.getFloat32(idx, true);
          idx += 4;
          let y2 = view.getFloat32(idx, true);
          idx += 4;
          let r2 = view.getFloat32(idx, true);
          idx += 4;
          let name_len = u8[idx++];
          let name = new TextDecoder().decode(u8.subarray(idx, idx + name_len));
          idx += name_len;
          let dead = u8[idx++];
          let death_counter = 0;
          if(dead) {
            death_counter = u8[idx++];
          }
          let len = u8[idx++];
          if(len > 0) {
            display_chat_message(name, new TextDecoder().decode(u8.subarray(idx, idx + len)));
            idx += len;
          }
          players[id] = { x: 0, y: 0, r: 0, ip: { x1: x2, x2, y1: y2, y2, r1: r2, r2 }, name, dead, death_counter };
          if(self_id == id) {
            us.ip.x2 = x2;
            us.ip.y2 = y2;
          }
        } else {
          let field = u8[idx++];
          if(!field) {
            players[id] = undefined;
            continue;
          }
          while(field) {
            switch(field) {
              case 1: {
                players[id].ip.x2 = view.getFloat32(idx, true);
                idx += 4;
                if(self_id == id) {
                  us.ip.x2 = players[id].ip.x2;
                }
                break;
              }
              case 2: {
                players[id].ip.y2 = view.getFloat32(idx, true);
                idx += 4;
                if(self_id == id) {
                  us.ip.y2 = players[id].ip.y2;
                }
                break;
              }
              case 3: {
                players[id].ip.r2 = view.getFloat32(idx, true);
                idx += 4;
                break;
              }
              case 4: {
                players[id].dead = u8[idx++];
                if(players[id].dead) {
                  players[id].death_counter = u8[idx++];
                }
                break;
              }
              case 5: {
                let len = u8[idx++];
                display_chat_message(players[id].name, new TextDecoder().decode(u8.subarray(idx, idx + len)));
                idx += len;
                break;
              }
            }
            field = u8[idx++];
          }
        }
      }
    }
    if(idx == len) {
      return;
    }
    if(u8[idx] == 2) {
      /* Balls */
      ++idx;
      let count = u8[idx] | (u8[idx + 1] << 8);
      idx += 2;
      for(let i = 0; i < count; ++i) {
        let id = u8[idx] | (u8[idx + 1] << 8);
        idx += 2;
        if(!balls[id]) {
          let type = u8[idx++];
          if(type == 0) {
            continue;
          }
          --type;
          let x2 = view.getFloat32(idx, true);
          idx += 4;
          let y2 = view.getFloat32(idx, true);
          idx += 4;
          let r2 = view.getFloat32(idx, true);
          idx += 4;
          balls[id] = { type, x: 0, y: 0, r: 0, ip: { x1: x2, x2, y1: y2, y2, r1: r2, r2 } };
          if(balls[id].ip.r2 < 1 || balls[id].ip.r2 > 60) {
            console.log(`create ball id ${id} r ${balls[id].ip.r2}`);
            ws.onmessage = function(){};
            throw new Error();
          }
        } else {
          let field = u8[idx++];
          if(!field) {
            balls[id] = undefined;
            continue;
          }
          while(field) {
            switch(field) {
              case 1: {
                balls[id].ip.x2 = view.getFloat32(idx, true);
                idx += 4;
                break;
              }
              case 2: {
                balls[id].ip.y2 = view.getFloat32(idx, true);
                idx += 4;
                break;
              }
              case 3: {
                balls[id].ip.r2 = view.getFloat32(idx, true);
                if(balls[id].ip.r2 < 1 || balls[id].ip.r2 > 60) {
                  console.log(`update ball id ${id} r ${balls[id].ip.r2}`);
                  ws.onmessage = function(){};
                  throw new Error();
                }
                idx += 4;
                break;
              }
            }
            field = u8[idx++];
          }
        }
      }
    }
    if(idx == len) {
      return;
    }
    if(u8[idx] == 3) {
      /* Chat messages */
      ++idx;
      let count = u8[idx++];
      for(let i = 0; i < count; ++i) {
        let name_len = u8[idx++];
        let name = new TextDecoder().decode(u8.subarray(idx, idx + name_len));
        idx += name_len;
        let len = u8[idx++];
        display_chat_message(name, new TextDecoder().decode(u8.subarray(idx, idx + len)));
        idx += len;
      }
    }
  };
  ws.onmessage = function(x) {
    reset = 0;
    onmessage(x);
    if(reset) {
      loading.innerHTML = "";
      ip();
    }
  };
  sendmsg.onkeydown = function(e) {
    e.stopPropagation();
    if(e.code == "Enter") {
      let encoded = new TextEncoder().encode(sendmsg.value.trim());
      if(encoded.length > 0) {
        u8[0] = 1;
        u8[1] = encoded.length;
        u8.set(encoded, 2);
        ws.send(u8.subarray(0, u8[1] + 2));
        chat_timestamps.pop();
        /* Note: MUST NOT BE performance.now() !!! */
        chat_timestamps.unshift(new Date().getTime());
        const diff = Math.abs(chat_timestamps[chat_timestamps.length - 1] - chat_timestamps[0]);
        const allowed = 1000 * chat_timestamps.length;
        if(diff < allowed) {
          const old = sendmsg.placeholder;
          sendmsg.placeholder = "You are on cooldown for sending too many messages too fast";
          sendmsg.oncooldown = 1;
          sendmsg.onkeypress = sendmsg.onpaste = null;
          setTimeout(function() {
            sendmsg.onkeypress = sendmsg.onpaste = dont_go_over_limit(128);
            sendmsg.oncooldown = 0;
            sendmsg.placeholder = old;
          }, allowed - diff);
        }
      }
      sendmsg.value = "";
      sendmsg.blur();
      canvas.focus();
    }
  };
  sendmsg.onkeyup = function(e) {
    e.stopPropagation();
  };
  sendmsg.onkeypress = sendmsg.onpaste = dont_go_over_limit(128);
  function resize() {
    if(window.innerWidth != width || window.innerHeight != height || dpr != window.devicePixelRatio) {
      dpr = window.devicePixelRatio;
      width = window.innerWidth;
      canvas.width = width * dpr;
      height = window.innerHeight;
      canvas.height = height * dpr;
    }
  }
  resize();
  window.onresize = resize;
  function lerp(num, to, by) {
    return num + (to - num) * by;
  }
  function darken(hex) {
    return "#" + (parseInt(hex.substring(1, 3), 16) * 0.8 >> 0).toString(16).padStart(2, "0") + (parseInt(hex.substring(3, 5), 16) * 0.8 >> 0).toString(16).padStart(2, "0") + (parseInt(hex.substring(5, 7), 16) * 0.8 >> 0).toString(16).padStart(2, "0") + hex.substring(7);
  }
  function send_movement() {
    if(!movement.mouse) {
      if(movement.down - movement.up == 0 && movement.right - movement.left == 0) {
        movement.angle = 0;
        movement.distance = 0;
      } else {
        movement.angle = Math.atan2(movement.down - movement.up, movement.right - movement.left);
        movement.distance = 160 * dpr;
      }
    }
    if(sees_settings || tutorial_running) {
      ws.send(new Uint8Array([0, 0, 0, 0, 0, 0]));
      return;
    }
    u8[0] = 0;
    view.setFloat32(1, movement.angle, true);
    if(movement.distance >= 160 * dpr) {
      view.setUint8(5, (255 * movement.mult) >>> 0);
    } else {
      view.setUint8(5, (movement.distance * 1.59375 / dpr * movement.mult) >>> 0);
    }
    ws.send(u8.subarray(0, 6));
  }
  canvas.onwheel = function(x) {
    const add = -Math.sign(x.deltaY) * 0.05;
    if(target_fov > 1) {
      target_fov += add * 3;
    } else {
      target_fov += add;
    }
    target_fov = Math.min(Math.max(target_fov, settings["fov"]["min"]), settings["fov"]["max"]);
  };
  window.onmousemove = function(x) {
    mouse = [x.clientX * dpr, x.clientY * dpr];
    movement.angle = Math.atan2(mouse[1] - canvas.height  * 0.5, mouse[0] - canvas.width  * 0.5);
    movement.distance = Math.hypot(mouse[0] - canvas.width  * 0.5, mouse[1] - canvas.height  * 0.5) / fov;
    send_movement();
  };
  canvas.onmousedown = function() {
    if(!tutorial_running) {
      movement.mouse = !movement.mouse;
    }
    movement.angle = Math.atan2(mouse[1] - canvas.height * 0.5, mouse[0] - canvas.width  * 0.5);
    movement.distance = Math.hypot(mouse[0] - canvas.width  * 0.5, mouse[1] - canvas.height  * 0.5) / fov;
    send_movement();
  };
  window.onkeydown = function(x) {
    if(x.repeat) return;
    if(sees_settings) {
      if(probing_key) {
        x.preventDefault();
        probe_key = x.code;
        probe_resolve();
      } else if(x.code == keybinds["settings"]) {
        sees_settings = false;
        settings_div.style.display = "none";
      }
      return;
    }
    switch(x.code) {
      case "Enter": {
        if(!sendmsg.oncooldown) {
          sendmsg.focus();
        }
        x.preventDefault();
        break;
      }
      case keybinds["slowwalk"]: {
        if(movement.mult == 1) {
          movement.mult = 0.5;
          send_movement();
        }
        break;
      }
      case keybinds["up"]: {
        if(!movement.up) {
          movement.up = 1;
          send_movement();
        }
        break;
      }
      case keybinds["left"]: {
        if(!movement.left) {
          movement.left = 1;
          send_movement();
        }
        break;
      }
      case keybinds["right"]: {
        if(!movement.right) {
          movement.right = 1;
          send_movement();
        }
        break;
      }
      case keybinds["down"]: {
        if(!movement.down) {
          movement.down = 1;
          send_movement();
        }
        break;
      }
      case keybinds["settings"]: {
        if(!tutorial_running) {
          sees_settings = !sees_settings;
          settings_div.style.display = sees_settings ? "block" : "none";
        }
        break;
      }
      case "KeyT": {
        if(!tutorial_running) {
          if(bg_data.area_id == 0) {
            tutorial_running = 1;
            tutorial_stage = 0;
            old_fov = target_fov;
            target_fov = settings["fov"]["max"];
          }
        } else {
          ++tutorial_stage;
        }
        break;
      }
      default: break;
    }
  };
  window.onkeyup = function(x) {
    if(x.repeat || sees_settings) return;
    switch(x.code) {
      case keybinds["slowwalk"]: {
        if(movement.mult == 0.5) {
          movement.mult = 1;
          send_movement();
        }
        break;
      }
      case keybinds["up"]: {
        if(movement.up) {
          movement.up = 0;
          send_movement();
        }
        break;
      }
      case keybinds["left"]: {
        if(movement.left) {
          movement.left = 0;
          send_movement();
        }
        break;
      }
      case keybinds["right"]: {
        if(movement.right) {
          movement.right = 0;
          send_movement();
        }
        break;
      }
      case keybinds["down"]: {
        if(movement.down) {
          movement.down = 0;
          send_movement();
        }
        break;
      }
      default: break;
    }
  };
  window.onbeforeunload = function(e) {
    e.preventDefault();
    e.returnValue = "Are you sure you want to quit?";
    localStorage.setItem("settings", JSON.stringify(settings));
    return "Are you sure you want to quit?";
  };
  canvas.oncontextmenu = function(e) {
    e.preventDefault();
    return false;
  };
  function draw(when) {
    if(updates[0] == 0) {
      requestAnimationFrame(draw);
      return;
    }
    if(settings["chat_on"] == !sees_chat) {
      sees_chat = settings["chat_on"];
      if(sees_chat) {
        chat.style.display = "block";
      } else {
        chat.style.display = "none";
      }
    }
    if(!now) {
      now = updates[0];
    } else if(now < updates[0]) {
      now = updates[0];
    } else if(now > updates[1]) {
      now = updates[1];
    }
    let old = fov;
    fov = lerp(fov, target_fov, 0.1);
    if(fov != old) {
      movement.distance = Math.hypot(mouse[0] - canvas.width * 0.5, mouse[1] - canvas.height * 0.5) / fov;
      send_movement();
    }
    let by;
    if(updates[0] == updates[1]) {
      by = 0;
    } else {
      by = (now - updates[0]) / (updates[1] - updates[0]);
    }
    now += when - last_draw;
    last_draw = when;
    if(!tutorial_running || tutorial_stage == 0) {
      us.x = lerp(us.ip.x1, us.ip.x2, by);
      us.y = lerp(us.ip.y1, us.ip.y2, by);
    }
    ctx.resetTransform();
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
    ctx.scale(fov, fov);
    ctx.translate(-us.x, -us.y);
    ctx.drawImage(background, 0, 0, background.width / settings["fov"]["max"], background.height / settings["fov"]["max"]);
    if(fov < 1) {
      ctx.globalAlpha = 1 - fov * fov;
      ctx.drawImage(light_background, 0, 0, background.width / settings["fov"]["max"], background.height / settings["fov"]["max"]);
      ctx.globalAlpha = 1;
    }
    let sorted = [];
    if(settings["draw_player_fill"] || settings["draw_player_stroke"]) {
      for(let player of players) {
        if(!player) continue;
        player.x = lerp(player.ip.x1, player.ip.x2, by);
        player.y = lerp(player.ip.y1, player.ip.y2, by);
        player.r = lerp(player.ip.r1, player.ip.r2, by);
        sorted[sorted.length] = { player };
      }
    }
    if(settings["draw_ball_fill"] || settings["draw_ball_stroke"]) {
      for(let ball of balls) {
        if(!ball) continue;
        ball.x = lerp(ball.ip.x1, ball.ip.x2, by);
        ball.y = lerp(ball.ip.y1, ball.ip.y2, by);
        ball.r = lerp(ball.ip.r1, ball.ip.r2, by);
        sorted[sorted.length] = { ball };
      }
    }
    sorted.sort((a, b) => a.r - b.r);
    for(let { ball, player } of sorted) {
      ctx.beginPath();
      if(player) {
        let r_sub = player.r * (settings["player_stroke"]["value"] / 200);
        ctx.moveTo(player.x + player.r - r_sub, player.y);
        ctx.arc(player.x, player.y, player.r - r_sub, 0, Math.PI * 2);
        if(settings["draw_player_fill"]) {
          ctx.fillStyle = "#ebecf0";
          ctx.fill();
        }
        if(settings["draw_player_stroke"]) {
          if(!settings["draw_player_fill"] && settings["draw_player_stroke_bright"]) {
            ctx.strokeStyle = "#ebecf0";
          } else {
            ctx.strokeStyle = darken("#ebecf0");
          }
          ctx.lineWidth = r_sub * 2;
          ctx.stroke();
        }
        if(settings["draw_player_name"] && player.name.length != 0) {
          ctx.font = `700 ${player.r / fov}px Ubuntu`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#00000080";
          if(fov > 1) {
            target_name_y = player.r * 0.5;
          } else {
            target_name_y = player.r * 0.5 + (2 / (fov * fov));
          }
          name_y = lerp(name_y, target_name_y, 0.1);
          ctx.fillText(player.name, player.x, player.y - player.r - name_y);
        }
        if(player.dead) {
          ctx.font = `700 ${player.r / Math.min(fov, 1)}px Ubuntu`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#f00";
          ctx.fillText(player.death_counter, player.x, player.y);
          if(settings["draw_death_arrow"]) {
            let s_x = canvas.width * 0.5 + (player.x - us.x) * fov;
            let s_y = canvas.height * 0.5 + (player.y - us.y) * fov;
            let k = death_arrow.width * 0.75 * fov;
            if(s_x < 0 || s_x > canvas.width || s_y < 0 || s_y > canvas.height) {
              let t_x = Math.max(Math.min(s_x, canvas.width - k), k);
              let t_y = Math.max(Math.min(s_y, canvas.height - k), k);
              let angle;
              if((s_x < k || s_x > canvas.width - k) && (s_y < k || s_y > canvas.height - k)) {
                angle = Math.atan2(s_y - t_y, s_x - t_x);
              } else {
                angle = Math.atan2(s_y < k ? -1 : s_y > canvas.height - k ? 1 : 0, s_x < k ? -1 : s_x > canvas.width - k ? 1 : 0);
              }
              let r_x = (t_x - canvas.width * 0.5) / fov + us.x;
              let r_y = (t_y - canvas.height * 0.5) / fov + us.y;
              ctx.translate(r_x, r_y);
              ctx.rotate(angle);
              ctx.drawImage(death_arrow, -death_arrow.width * 0.5, -death_arrow.width * 0.5);
              ctx.rotate(-angle);
              ctx.font = `700 ${death_arrow.width * 0.3}px Ubuntu`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#f00";
              ctx.fillText(player.death_counter, 0, 0);
              ctx.translate(-r_x, -r_y);
            }
          }
        }
      } else {
        let r_sub = ball.r * (settings["ball_stroke"]["value"] / 200);
        ctx.moveTo(ball.x + ball.r - r_sub, ball.y);
        ctx.arc(ball.x, ball.y, ball.r - r_sub, 0, Math.PI * 2);
        if(settings["draw_ball_fill"]) {
          ctx.fillStyle = ball_colors[ball.type];
          ctx.fill();
        }
        if(settings["draw_ball_stroke"]) {
          if(!settings["draw_ball_fill"] && settings["draw_ball_stroke_bright"]) {
            ctx.strokeStyle = ball_colors[ball.type];
          } else {
            ctx.strokeStyle = darken(ball_colors[ball.type]);
          }
          ctx.lineWidth = r_sub * 2;
          ctx.stroke();
        }
      }
    }
    if(!tutorial_running) {
      if(bg_data.area_id == 0 && !saw_tutorial) {
        draw_text("Need help? Press T for a tutorial.", bg_data.real_width * 0.5, bg_data.cell_size * 2.5);
      }
    } else {
      switch(tutorial_stage) {
        case 0: {
          draw_text("<-- Your character", us.x + 110, us.y);
          draw_text("Your character -->", us.x - 110, us.y);
          draw_text("This is your character. You can control it with these keys:", us.x, us.y - 220);
          draw_text(`${keybinds["up"]}: up`, us.x, us.y - 170);
          draw_text(`${keybinds["left"]}: left`, us.x, us.y - 130);
          draw_text(`${keybinds["right"]}: right`, us.x, us.y - 90);
          draw_text(`${keybinds["down"]}: down`, us.x, us.y - 50);
          draw_text("You can also control it with mouse. Just", us.x, us.y + 50);
          draw_text("press any mouse button to start or stop moving.", us.x, us.y + 70);
          draw_text("Scroll to change your field of view.", us.x, us.y + 110);
          draw_text("Note that you won't be able to perform some", us.x, us.y + 150);
          draw_text("of the above actions until the tutorial ends.", us.x, us.y + 170);
          draw_text("Press T to continue", us.x, us.y + 220);
          break;
        }
        case 1: {
          const _x = bg_data.real_width * 0.5 - bg_data.cell_size * 6;
          const _y = bg_data.real_height * 0.5;
          us.x = lerp(us.x, _x, 0.2 * by);
          us.y = lerp(us.y, _y, 0.2 * by);
          draw_text("-->", _x + bg_data.cell_size * 2, _y - bg_data.cell_size * 1);
          draw_text("-->", _x + bg_data.cell_size * 2, _y);
          draw_text("-->", _x + bg_data.cell_size * 2, _y + bg_data.cell_size * 1);
          draw_text("<--", _x - bg_data.cell_size * 2, _y - bg_data.cell_size * 2);
          draw_text("<--", _x - bg_data.cell_size * 3, _y - bg_data.cell_size * 1);
          draw_text("<--", _x - bg_data.cell_size * 4, _y);
          draw_text("<--", _x - bg_data.cell_size * 3, _y + bg_data.cell_size * 1);
          draw_text("<--", _x - bg_data.cell_size * 2, _y + bg_data.cell_size * 2);
          draw_text("These are safezones. Enemies can't", _x, _y - 130);
          draw_text("reach you inside of these tiles.", _x, _y - 110);
          draw_text("Press T to continue", _x, _y + 110);
          break;
        }
        case 2: {
          const _x = bg_data.real_width * 0.5 + bg_data.cell_size * 6;
          const _y = bg_data.real_height * 0.5;
          us.x = lerp(us.x, _x, 0.2 * by);
          us.y = lerp(us.y, _y, 0.2 * by);
          draw_text("<--", _x - bg_data.cell_size * 2, _y - bg_data.cell_size * 2);
          draw_text("<--", _x - bg_data.cell_size * 1, _y - bg_data.cell_size * 3);
          draw_text("<--", _x, _y - bg_data.cell_size * 4);
          draw_text("<--", _x - bg_data.cell_size * 2, _y + bg_data.cell_size * 2);
          draw_text("<--", _x - bg_data.cell_size * 1, _y + bg_data.cell_size * 3);
          draw_text("<--", _x, _y + bg_data.cell_size * 4);
          draw_text("-->", _x + bg_data.cell_size * 2, _y - bg_data.cell_size * 3);
          draw_text("-->", _x + bg_data.cell_size * 2, _y + bg_data.cell_size * 3);
          draw_text("<--", _x + bg_data.cell_size * 5, _y - bg_data.cell_size * 2);
          draw_text("<--", _x + bg_data.cell_size * 6, _y - bg_data.cell_size * 1);
          draw_text("<--", _x + bg_data.cell_size * 7, _y);
          draw_text("<--", _x + bg_data.cell_size * 6, _y + bg_data.cell_size * 1);
          draw_text("<--", _x + bg_data.cell_size * 5, _y + bg_data.cell_size * 2);
          draw_text("These are walls. Players can't walk over them.", _x, _y - 40);
          draw_text("However, some types (colors) of enemies can.", _x, _y - 10);
          draw_text("Press T to continue", _x, _y + 40);
          break;
        }
        case 3: {
          const _x = bg_data.cell_size * 0.5;
          const _y = bg_data.real_height * 0.5;
          us.x = lerp(us.x, _x, 0.2 * by);
          us.y = lerp(us.y, _y, 0.2 * by);
          draw_text("-->", _x, _y);
          draw_text("This is a teleport tile. If you walk on it, it will teleport you", _x, _y - 90);
          draw_text("to an area it points to. Using the number on the tile, you can", _x, _y - 70);
          draw_text("look at the minimap in the top left corner to see where that area is.", _x, _y - 50);
          draw_text("Press T to continue", _x, _y + 50);
          break;
        }
        case 4: {
          let first_ball;
          for(const ball of balls) {
            if(ball) {
              first_ball = ball;
              break;
            }
          }
          const _x = first_ball.x;
          const _y = first_ball.y;
          us.x = lerp(us.x, _x, 0.2 * by);
          us.y = lerp(us.y, _y, 0.2 * by);
          draw_text("This is an enemy, also called simply a ball. A grey ball", _x, _y - 110);
          draw_text("doesn't do a lot - it simply moves in one direction. However,", _x, _y - 90);
          draw_text("as you are about to find out when you start exploring the game,", _x, _y - 70);
          draw_text("there are lots of types of enemies, each having their own color.", _x, _y - 50);
          draw_text("Coming in contact with an enemy downs you. While downed, you can't move,", _x, _y + 50);
          draw_text("and after a while, you die, unless other players revive you by touching you.", _x, _y + 70);
          draw_text("Press T to continue", _x, _y + 120);
          break;
        }
        case 5: {
          const _x = us.ip.x2;
          const _y = us.ip.y2;
          us.x = lerp(us.x, _x, 0.2 * by);
          us.y = lerp(us.y, _y, 0.2 * by);
          draw_text(`You can press ${keybinds["settings"]} to open settings. There`, _x, _y - 80);
          draw_text("are a lot of cool options there to change. Try it out later.", _x, _y - 60);
          draw_text("That's it for this tutorial. See how far you can go!", _x, _y + 60);
          draw_text("GLHF!", _x, _y + 80);
          draw_text("Press T to end the tutorial", _x, _y + 130);
          break;
        }
        case 6: {
          target_fov = old_fov;
          tutorial_running = 0;
          localStorage.setItem("tutorial", "1");
          saw_tutorial = 1;
          break;
        }
      }
    }
    requestAnimationFrame(draw);
  }
  function start_drawing() {
    if(!drawing) {
      requestAnimationFrame(draw);
      drawing = 1;
    }
  }
}
