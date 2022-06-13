let loading = document.getElementById("loading");
loading.innerHTML = "Fetching servers...";
let sub = document.getElementById("sub");
let name = document.getElementById("name");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let background = document.createElement("canvas");
let bg_ctx = background.getContext("2d");
let light_background = document.createElement("canvas");
let lbg_ctx = light_background.getContext("2d");
let drawing = 0;
let tile_colors = ["#dddddd", "#aaaaaa", "#333333", "#fedf78"];
let ball_colors = ["#808080", "#fc46aa", "#008080", "#ff8e06", "#d2b48c"];
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
let us = { x: 0, y: 0, ip: { x1: 0, x2: 0, y1: 0, y2: 0 } };
let mouse = [0, 0];
let now = null;
let last_draw = 0;
let updates = [0, 0];
let reset = 0;
let name_y = 0;
let target_name_y = 0;
let settings_div = document.getElementById("settings");
let settings_insert = document.getElementById("ss");
let sees_settings = false;
let _keybinds = window.localStorage.getItem("keybinds");
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
  cell_size: 0,
  fills: [],
  strokes: []
};
let _settings = window.localStorage.getItem("settings");
let default_settings = {
  ["fov"]: {
    ["min"]: 0.25,
    ["max"]: 4,
    ["value"]: 1,
    ["step"]: 0.05
  },
  ["chat_on"]: true,
  ["max_chat_messages"]: {
    ["min"]: 1,
    ["max"]: 1000,
    ["value"]: 100,
    ["step"]: 1
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
  ["draw_player_name"]: true
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
}
window.localStorage.setItem("settings", JSON.stringify(settings));
let probing_key = false;
let probe_key = "";
let probe_resolve;
let fov = settings["fov"]["value"];
let target_fov = fov;
let chat = document.getElementById("chat");
let messages = document.getElementById("messages");
let sendmsg = document.getElementById("sendmsg");
let sees_chat = settings["chat_on"];
let chat_message_len = 0;
window["s"].then(r => r.json()).then(r => init(r));
function reload() {
  setTimeout(location.reload.bind(location), 1000);
}
function save_settings() {
  window.localStorage.setItem("settings", JSON.stringify(settings));
}
function save_keybinds() {
  window.localStorage.setItem("keybinds", JSON.stringify(keybinds));
}
function show_el(el) {
  settings_insert.appendChild(el);
}
function create_header(content) {
  let h1 = document.createElement("h1");
  h1.innerHTML = content;
  return h1;
}
function create_text(content) {
  let h3 = document.createElement("h3");
  h3.innerHTML = content;
  return h3;
}
function create_table() {
  return document.createElement("table");
}
function table_insert_el(table, left_el, right_el) {
  let tr = document.createElement("tr");
  let td = document.createElement("td");
  td.appendChild(left_el);
  tr.appendChild(td);
  td = document.createElement("td");
  td.appendChild(right_el);
  tr.appendChild(td);
  table.appendChild(tr);
  return table;
}
function create_switch(name) {
  let btn = document.createElement("button");
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
  let select = document.createElement("select");
  for(let option of settings[name].options) {
    let opt = document.createElement("option");
    opt.value = option;
    if(option == settings[name].selected) {
      opt.selected = 1;
    }
    opt.innerHTML = option;
    select.appendChild(opt);
  }
  select.onchange = save_settings;
  return select;
}
function create_keybind(name) {
  let btn = document.createElement("button");
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
function create_slider(name, add="") {
  let div = document.createElement("div");
  div.className = "input";
  let input = document.createElement("input");
  input.type = "range";
  input.min = settings[name].min;
  input.max = settings[name].max;
  input.step = settings[name].step;
  input.value = settings[name].value;
  input.oninput = function() {
    input.nextElementSibling.innerHTML = input.value + add;
    settings[name].value = input.valueAsNumber;
  };
  input.onchange = save_settings;
  div.appendChild(input);
  div.appendChild(create_text(input.value + add));
  return div;
}
function create_button(name, cb) {
  let btn = document.createElement("button");
  btn.innerHTML = name;
  btn.onclick = cb;
  return btn;
}
function create_settings() {
  settings_insert.innerHTML = "";
  show_el(create_header("GENERAL"));
  let table = create_table();
  table_insert_el(table, create_text("Show chat"), create_switch("chat_on"));
  table_insert_el(table, create_text("Max number of messages"), create_slider("max_chat_messages"));
  //table_insert_el(table, create_text("Chat position"), create_list("chat_position"));
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
  show_el(table);
  show_el(create_header("KEYBINDS"));
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
  let p = document.createElement("p");
  p.appendChild(document.createTextNode(author + ": " + msg));
  messages.insertBefore(p, messages.firstChild);
  if(++chat_message_len > settings["max_chat_messages"].value) {
    messages.removeChild(messages.lastChild);
  }
}
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
    if(e.target.val == undefined) {
      e.target.val = e.target.value;
    }
    let new_val = e.target.value + e.key;
    if(new TextEncoder().encode(new_val).byteLength > n) {
      e.target.value = e.target.val || "";
    } else {
      e.target.value = new_val;
      e.target.val = new_val;
    }
    e.preventDefault();
    return false;
  };
}
function game(ws) {
  loading.innerHTML = "Enter your name<br>";
  sub.innerHTML = "You are limited to 4 characters<br>Special characters might not fit<br>Press enter when you are done";
  name.style.display = "block";
  name.focus();
  let name_val = window.localStorage.getItem("name");
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
    if((x.keyCode || x.which) == 13) {
      window.localStorage.setItem("name", name.value);
      loading.innerHTML = "Spawning...";
      sub.innerHTML = "";
      name.style.display = "none";
      let token = window.localStorage.getItem("token");
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
  sendmsg.onmousedown = function(e) {
    e.stopPropagation();
  };
  sendmsg.onmouseup = function(e) {
    e.stopPropagation();
  };
  sendmsg.onkeydown = function(e) {
    e.stopPropagation();
    if(e.code == "Enter") {
      let encoded = new TextEncoder().encode(sendmsg.value);
      u8[0] = 1;
      u8[1] = encoded.length;
      u8.set(encoded, 2);
      ws.send(u8.subarray(0, u8[1] + 2));
      sendmsg.value = "";
      sendmsg.blur();
      canvas.focus();
    }
  };
  sendmsg.onkeyup = function(e) {
    e.stopPropagation();
  };
  sendmsg.onkeypress = sendmsg.onpaste = dont_go_over_limit(64);
  messages.onwheel = function(e) {
    e.stopPropagation();
  };
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
    if(sees_settings) {
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
  window.onwheel = function(x) {
    if(sees_settings) return;
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
    movement.angle = Math.atan2(mouse[1] - canvas.height / 2, mouse[0] - canvas.width / 2);
    movement.distance = Math.hypot(mouse[0] - canvas.width / 2, mouse[1] - canvas.height / 2) / fov;
    send_movement();
  };
  window.onmousedown = function() {
    if(!sees_settings) {
      movement.mouse = !movement.mouse;
    }
    movement.angle = Math.atan2(mouse[1] - canvas.height / 2, mouse[0] - canvas.width / 2);
    movement.distance = Math.hypot(mouse[0] - canvas.width / 2, mouse[1] - canvas.height / 2) / fov;
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
        sendmsg.focus();
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
        sees_settings = !sees_settings;
        settings_div.style.display = sees_settings ? "block" : "none";
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
    window.localStorage.setItem("settings", JSON.stringify(settings));
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
      movement.distance = Math.hypot(mouse[0] - canvas.width / 2, mouse[1] - canvas.height / 2) / fov;
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
    us.x = lerp(us.ip.x1, us.ip.x2, by);
    us.y = lerp(us.ip.y1, us.ip.y2, by);
    ctx.resetTransform();
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
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
    requestAnimationFrame(draw);
  }
  function start_drawing() {
    if(!drawing) {
      requestAnimationFrame(draw);
      drawing = 1;
    }
  }
}
