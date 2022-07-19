/*
 * LOCAL STORAGE, LOCAL_STORAGE
 */
const { localStorage } = window;
const getItem = localStorage.getItem.bind(localStorage);
const setItem = localStorage.setItem.bind(localStorage);
const removeItem = localStorage.removeItem.bind(localStorage);

const _keybinds = getItem("keybinds");
const default_keybinds = {
  ["settings"]: "Escape",
  ["up"]: "KeyW",
  ["left"]: "KeyA",
  ["right"]: "KeyD",
  ["down"]: "KeyS",
  ["slowwalk"]: "ShiftLeft",
  ["spec_prev"]: "KeyA",
  ["spec_next"]: "KeyD",
  //["minimap"]: "KeyM"
};
let keybinds = _keybinds != null ? JSON.parse(_keybinds) : default_keybinds;
for(const prop in default_keybinds) {
  if(!(prop in keybinds)) {
    keybinds[prop] = default_keybinds[prop];
  }
}
for(const prop in keybinds) {
  if(!(prop in default_keybinds)) {
    delete keybinds[prop];
  }
}
function save_keybinds() {
  setItem("keybinds", JSON.stringify(keybinds));
}

const _settings = getItem("settings");
const default_settings = {
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
  ["draw_ball_stroke_bright"]: true,
  ["ball_stroke"]: {
    ["min"]: 0,
    ["max"]: 100,
    ["value"]: 20,
    ["step"]: 1
  },
  ["draw_player_fill"]: true,
  ["draw_player_stroke"]: true,
  ["draw_player_stroke_bright"]: true,
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
  },
  ["show_tutorial"]: true,
  ["show_ping"]: false
};
let settings = _settings != null ? JSON.parse(_settings) : JSON.parse(JSON.stringify(default_settings));
for(const prop in default_settings) {
  if(!(prop in settings)) {
    settings[prop] = default_settings[prop];
  }
}
for(const prop in settings) {
  if(!(prop in default_settings)) {
    delete settings[prop];
    continue;
  }
  if(settings[prop]["min"] && settings[prop]["min"] != default_settings[prop]["min"]) {
    settings[prop]["min"] = default_settings[prop]["min"];
  }
  if(settings[prop]["max"] && settings[prop]["max"] != default_settings[prop]["max"]) {
    settings[prop]["max"] = default_settings[prop]["max"];
  }
  if(settings[prop]["step"] && settings[prop]["step"] != default_settings[prop]["step"]) {
    settings[prop]["step"] = default_settings[prop]["step"];
  }
  settings[prop]["value"] = Math.max(Math.min(settings[prop]["value"], settings[prop]["max"]), settings[prop]["min"]);
}
function save_settings() {
  setItem("settings", JSON.stringify(settings));
}

/*
 * UTILITY
 */

const getElementById = document.getElementById.bind(document);
const createElement = document.createElement.bind(document);

const status = getElementById("ID_status");

const _token = getItem("token");
let token = [];
if(typeof _token == "string") {
  token = _token.split(",").map(r => +r);
}

function reload() {
  setTimeout(location.reload.bind(location), 1000);
}

String.prototype.darken = function() {
  return "#" + (parseInt(this.substring(1, 3), 16) * 0.8 >> 0).toString(16).padStart(2, "0") + (parseInt(this.substring(3, 5), 16) * 0.8 >> 0).toString(16).padStart(2, "0") + (parseInt(this.substring(5, 7), 16) * 0.8 >> 0).toString(16).padStart(2, "0") + this.substring(7);
};

String.prototype.get_server_name = function() {
  const match = this.match(/\/\/(.*?)\.shadam\.xyz/);
  const match2 = this.match(/\/\/(.*?)[\/:]/);
  return match ? match[1] : (match2 ? match2[1] : this);
};

WebSocket.prototype.send = new Proxy(WebSocket.prototype.send, {
  apply: function(to, what, args) {
    if(what.readyState == WebSocket.OPEN) {
      return to.apply(what, args);
    }
  },
  configurable: true,
  enumerable: true
});

WebSocket.prototype.close = new Proxy(WebSocket.prototype.close, {
  apply: function(to, what, args) {
    if(what.readyState == WebSocket.CONNECTING || what.readyState == WebSocket.OPEN) {
      return to.apply(what, args);
    }
  },
  configurable: true,
  enumerable: true
});

function limit_input_to(n) {
  return function(e) {
    const is_clipboard = e instanceof ClipboardEvent;
    if(is_clipboard && e.type != "paste") {
      return;
    }
    const new_val = e.target.value + (is_clipboard ? e.clipboardData.getData("text") : e.key);
    if(new TextEncoder().encode(new_val).byteLength - e.target.selectionEnd + e.target.selectionStart > n) {
      if(e.target.value == "" && is_clipboard) {
        const old = e.target.placeholder;
        e.target.placeholder = "Text too long to paste!";
        setTimeout(function() {
          e.target.placeholder = old;
        }, 1000);
      }
      e.preventDefault();
    }
  };
}

/**
 * @param {number} _x
 * @param {number} _y
 * @param {number} k
 * @param {boolean} whole_out
 * @param {boolean} preserve_x
 * @param {boolean} preserve_y
 * @return {Array<number>}
 */
function get_sticky_position(_x, _y, k, whole_out, preserve_x, preserve_y) {
  k *= CANVAS.fov;
  const s_x = CANVAS.width * 0.5 + (_x - CAMERA.x) * CANVAS.fov;
  const s_y = CANVAS.height * 0.5 + (_y - CAMERA.y) * CANVAS.fov;
  let t_x;
  let t_y;
  const l = whole_out ? 0 : k;
  let outside = false;
  if(preserve_x && (s_x < l || s_x > CANVAS.width - l)) {
    outside = true;
    t_x = Math.max(Math.min(s_x, CANVAS.width - k), k);
  } else {
    t_x = s_x;
  }
  if(preserve_y && (s_y < l || s_y > CANVAS.height - l)) {
    outside = true;
    t_y = Math.max(Math.min(s_y, CANVAS.height - k), k);
  } else {
    t_y = s_y;
  }
  return [(t_x - CANVAS.width * 0.5) / CANVAS.fov + CAMERA.x, (t_y - CANVAS.height * 0.5) / CANVAS.fov + CAMERA.y, outside];
}

/**
 * @param {number} num
 * @param {number} to
 * @param {number} by
 * @return {number}
 */
function lerp(num, to, by) {
  return num + (to - num) * by;
}

/**
 * @param {string} text 
 * @param {number} _x 
 * @param {number} _y 
 */
function draw_text(text, _x, _y) {
  CANVAS.ctx.font = `700 20px Ubuntu`;
  CANVAS.ctx.textAlign = "center";
  CANVAS.ctx.textBaseline = "middle";
  CANVAS.ctx.fillStyle = "#fff";
  CANVAS.ctx.strokeStyle = "#333";
  CANVAS.ctx.lineWidth = 1;
  CANVAS.ctx.fillText(text, _x, _y);
  CANVAS.ctx.strokeText(text, _x, _y);
}

if(window["s"].length == 0) {
  status.innerHTML = "No servers found";
  reload();
  throw new Error(status.innerHTML);
}

status.innerHTML = "Connecting";

/**
 * @enum {number}
 */
const CONSTS = {
  server_opcode_area: 0,
  server_opcode_players: 1,
  server_opcode_balls: 2,
  server_opcode_chat: 3,
  //server_opcode_minimap: 4,

  client_opcode_spawn: 0,
  client_opcode_movement: 1,
  client_opcode_chat: 2,
  client_opcode_name: 3,
  client_opcode_spec: 4,

  max_players: 100,
  max_balls: 65535,
  max_chat_message_len: 128,
  max_chat_timestamps: 5,
  max_pings: 10,
  max_name_len: 16,

  default_area_id: 0
};

const Tile_colors = ["#dddddd", "#aaaaaa", "#333333", "#fedf78"];

const Ball_colors = ["#808080", "#fc46aa", "#008080", "#ff8e06", "#3cdfff", "#663a82"];

/*
 * MENU
 */

class Menu {
  constructor() {
    this.div = getElementById("ID_menu");
    this.name = getElementById("ID_name");

    this.select_server = getElementById("ID_select_serv");
    /**
     * @type {HTMLOptionElement}
     */
    this.selected_server = null;
    this.servers = window["s"];

    this.picked_server_div = getElementById("ID_picked_server_for_you");
    this.picked_server_tooltip = getElementById("ID_picked_server_for_you_tooltip");

    this.ping = getElementById("ID_ping");
    this.ping_update();

    this.play = getElementById("ID_play");
    this.spec = getElementById("ID_spec");
    /**
     * @type {Element}
     */
    this.spec_help = null;
    this.spec_help_text = "";
    this.init_spec_help_text();
    this.spectating = getElementById("ID_spectating");
    this.refresh = getElementById("ID_refresh");
    
    const spec_help = getElementById("ID_spec_help");
    spec_help.parentElement.removeChild(spec_help);

    this.refresh.onclick = location.reload.bind(location);

    this.name.onkeypress = this.name.onpaste = limit_input_to(CONSTS.max_name_len);
    this.name.onchange = function() {
      CLIENT.sent_name = false;
      setItem("name", this.value);
    };

    this.visible = false;
    this.blocked = false;

    this.int = -1;

    const cached_name = getItem("name");
    if(typeof cached_name == "string" && new TextEncoder().encode(cached_name).length <= CONSTS.max_name_len) {
      this.name.value = cached_name;
    }

    this.play.onclick = function() {
      PACKET.create_spawn_packet();
      SOCKET.send();
    };

    this.spec.onclick = function() {
      PACKET.create_spec_packet(0);
      SOCKET.send();
    };
  }
  init() {
    this.init_server_list();

    this.int = setInterval(function() {
      fetch("servers.json").then(r => r.json()).then(function(res) {
        MENU.servers = res;
        MENU.init_server_list();
      });
    }, 5000);
  }
  get_name() {
    return new TextEncoder().encode(this.name.value);
  }
  block_show() {
    if(!this.visible) {
      this.blocked = false;
      this.show();
    }
    this.blocked = true;
  }
  block_hide() {
    if(this.visible) {
      this.blocked = false;
      this.hide();
    }
    this.blocked = true;
  }
  unblock() {
    this.blocked = false;
  }
  show() {
    if(this.blocked) {
      return;
    }
    this.visible = true;
    this.div.style.display = "block";
  }
  hide() {
    if(this.blocked) {
      return;
    }
    this.visible = false;
    this.div.style.display = "none";
  }
  show_name() {
    this.name.style.display = "block";
  }
  hide_name() {
    this.name.style.display = "none";
  }
  show_refresh() {
    if(!SOCKET.once) {
      reload();
    }
    this.hide_name();
    this.play.style.display = "none";
    this.spec.style.display = "none";
    this.refresh.style.display = "block";
    clearInterval(this.int);
  }
  init_spec_help_text() {
    this.spec_help_text = `Press ${keybinds["spec_prev"]} or ${keybinds["spec_next"]} to switch between players<br><br>Type "/menu" in chat to return to the main menu`;
  }
  show_spec_help() {
    const h5 = createElement("h5");
    h5.id = "ID_spec_help";
    h5.innerHTML = this.spec_help_text;
    setTimeout(function() {
      h5.style.opacity = 0;
    }, 3000);
    h5.addEventListener("transitionend", this.hide_spec_help.bind(this));
    document.body.insertBefore(h5, MENU.div);
    this.spec_help = h5;
  }
  hide_spec_help() {
    if(this.spec_help != null) {
      this.spec_help.parentElement.removeChild(this.spec_help);
      this.spec_help = null;
    }
  }
  can_spectate_state(on) {
    this.spec.disabled = on;
  }
  ping_update() {
    this.ping.style.display = settings["show_ping"] ? "block" : "none";
  }
  init_tooltip() {
    if(getItem("psfy_tooltip") == undefined) {
      this.picked_server_tooltip.innerHTML = "We picked a server<br>for you automatically.<br><br>You can change it here.";
      this.picked_server_div.style.display = "table";
    }
  }
  init_server_list() {
    this.select_server.innerHTML = "";
    for(const server of this.servers) {
      const option = createElement("option");
      option.value = server[2];
      if(server[2] == SOCKET.ws.url) {
        option.selected = true;
        option.disabled = true;
        this.selected_server = option;
      }
      if(server[0] >= server[1]) {
        option.disabled = 1;
      }
      const server_name = server[2].get_server_name();
      option.innerHTML = server_name[0].toUpperCase() + server_name.substring(1) + ` (${server[0]}/${server[1]})`;
      this.select_server.appendChild(option);
    }
    this.select_server.onfocus = function() {
      setItem("psfy_tooltip", "");
      this.picked_server_div.style.display = "none";
    }.bind(this);
    this.select_server.onchange = async function() {
      this.selected_server.disabled = false;
      const old = this.selected_server;
      this.selected_server = this.select_server.selectedOptions[0];
      this.selected_server.disabled = true;
      CLIENT.onconnecting();
      let resolver;
      const promise = new Promise(function(resolve) {
        resolver = resolve;
      });
      const sock = new Latency_socket(this.selected_server.value, resolver, 1);
      setTimeout(resolver, 2000);
      await promise;
      if(sock.packets == 0 || sock.ws.readyState != WebSocket.OPEN) {
        sock.stop();
        status.innerHTML = "Couldn't connect, returning to previous server";
        this.selected_server.disabled = false;
        this.selected_server = old;
        this.selected_server.disabled = true;
        setTimeout(CLIENT.onconnected.bind(CLIENT), 1000);
      } else {
        SOCKET.takeover(sock);
      }
    }.bind(this);
    this.init_tooltip();
  }
}

/*
 * SOCKET
 */

class Socket {
  constructor() {
    /**
     * @type {WebSocket}
     */
    this.ws = null;

    this.once = false;

    this.game_init = false;

    this.pings = new Array(CONSTS.max_pings).fill(0);
    this.ping_sent_at = 0;
    this.cached_ping = 0;
    this.idx = 0;

    this.updates = [0, 0];
  }
  takeover(latency_sock) {
    if(this.ws != null) {
      this.stop();

      this.once = false;

      this.game_init = false;

      this.updates = [0, 0];
    }

    this.pings = latency_sock.pings;
    this.ping_sent_at = latency_sock.ping_sent_at;
    this.cached_ping = latency_sock.cached_ping;
    this.idx = latency_sock.idx;

    this.ws = latency_sock.ws;
    this.ws.onmessage = function({ data }) {
      try {
        this.message({ data });
      } catch(err) {
        console.log(err);
        console.log(Array.from(new Uint8Array(data)).map(r => r.toString(16).padStart(2, "0")).join(" "));
      }
    }.bind(this);
    this.ws.onclose = this.close.bind(this);

    PACKET.create_init_packet();
    this.send();

    this.open();
  }
  open() {
    this.once = true;
    CHAT.clear();
    CAMERA.unblock();
    PLAYERS.clear();
    BALLS.clear();
    BACKGROUND.clear();
    CANVAS.clear();
    MOVEMENT.clear();
    CLIENT.clear();
  }
  message({ data }) {
    PACKET.set(new Uint8Array(data));
    if(PACKET.len == 0) {
      this.onping();
      return;
    }
    const id = PACKET.byte() - 1;
    let updated_id = false;
    if(id != CLIENT.id) {
      CLIENT.id = id;
      updated_id = true;
    }
    const info = PACKET.byte();
    const spectating = info & 0x01;
    if(spectating && !CLIENT.spectating) {
      CLIENT.spectating = true;
      CLIENT.onspectatestart();
    } else if(!spectating && CLIENT.spectating) {
      CLIENT.spectating = false;
      CLIENT.onspectatestop();
    }
    const exists = info & 0x02;
    if(exists && !CLIENT.in_game) {
      CLIENT.in_game = true;
      CLIENT.onspawn();
    } else if(!exists && CLIENT.in_game) {
      CLIENT.in_game = false;
      CLIENT.ondeath();
    }
    MENU.can_spectate_state(info & 0x04);
    this.updates[0] = this.updates[1];
    this.updates[1] = performance.now();
    PLAYERS.ip();
    BALLS.ip();
    CAMERA.ip();
    let updated_background = false;
    while(PACKET.idx < PACKET.len) {
      switch(PACKET.byte()) {
        case CONSTS.server_opcode_area: {
          updated_background = true;
          BALLS.clear();
          BACKGROUND.parse();
          break;
        }
        case CONSTS.server_opcode_players: {
          PLAYERS.parse();
          break;
        }
        case CONSTS.server_opcode_balls: {
          BALLS.parse();
          break;
        }
        case CONSTS.server_opcode_chat: {
          CHAT.parse();
          break;
        }
        default: throw new Error();
      }
    }
    if(PACKET.idx > PACKET.len) {
      throw new Error();
    }
    if(CLIENT.id == -1) {
      CAMERA.instant_move(BACKGROUND.width * 0.5, BACKGROUND.height * 0.5);
    } else if(updated_id) {
      CAMERA.move(PLAYERS.arr[CLIENT.id].x2, PLAYERS.arr[CLIENT.id].y2);
      if(updated_background) {
        CAMERA.ip();
      }
    }
    if(this.updates[0] != 0 && !this.game_init) {
      this.game_init = true;
      CANVAS.start_drawing();
      CLIENT.onconnected();
    }
  }
  close(code) {
    if(code == 4000) {
      CLIENT.onserverfull();
    } else {
      CLIENT.ondisconnected();
    }
  }
  onping() {
    this.pings[this.idx] = new Date().getTime() - this.ping_sent_at;
    this.calculate_ping();
    this.idx = (this.idx + 1) % CONSTS.max_pings;
    setTimeout(this.ping.bind(this), 10);
  }
  ping() {
    this.ping_sent_at = new Date().getTime();
    this.ws.send(new Uint8Array(0));
  }
  calculate_ping() {
    this.cached_ping = 0;
    let idx = this.idx;
    let total = 0;
    for(let i = 0; i < CONSTS.max_pings; ++i) {
      if(this.pings[idx] != 0) {
        this.cached_ping += this.pings[idx] * ((CONSTS.max_pings - total) / (CONSTS.max_pings + 1));
        ++total;
      }
      idx = (idx + 1) % CONSTS.max_pings;
    }
    if(total != 0) {
      this.cached_ping /= total * 0.5;
    }
  }
  stop() {
    this.ws.onopen = this.ws.onmessage = this.ws.onclose = null;
    this.ws.close();
  }
  send() {
    this.ws.send(PACKET.u8.subarray(0, PACKET.len));
  }
}

/*
 * LATENCY SOCKET, LATENCY_SOCKET
 */

class Latency_socket extends Socket {
  constructor(ip, resolver, pings_to_finish=8) {
    super();

    this.packets = 0;
    this.pings_to_finish = pings_to_finish;
    this.resolver = resolver;
    this.ip = ip;

    this.connect();
  }
  connect() {
    this.ws = new WebSocket(this.ip);
    this.ws.binaryType = "arraybuffer";
    this.ws.onopen = this.open.bind(this);
    this.ws.onmessage = this.message.bind(this);
    this.ws.onclose = this.close.bind(this);
  }
  open() {
    this.ping();
  }
  message() {
    this.onping();
    if(++this.packets == this.pings_to_finish) {
      this.resolver(this.ws.url);
    }
  }
  close() {
    this.connect();
  }
}

/*
 * PACKET
 */

class Packet {
  constructor() {
    this.buffer = new ArrayBuffer(1048576);
    this.u8 = new Uint8Array(this.buffer);
    this.view = new DataView(this.buffer);
    this.len = 0;
    this.idx = 0;
  }
  set(arr) {
    this.u8.set(arr);
    this.len = arr.length;
    this.idx = 0;
  }
  clear() {
    this.len = 0;
    this.idx = 0;
  }
  byte() {
    return this.u8[this.idx++];
  }
  short() {
    const ret = this.u8[this.idx] | (this.u8[this.idx + 1] << 8);
    this.idx += 2;
    return ret;
  }
  float() {
    const ret = this.view.getFloat32(this.idx, true);
    this.idx += 4;
    return ret;
  }
  string(len) {
    const ret = new TextDecoder().decode(this.u8.subarray(this.idx, this.idx + len));
    this.idx += len;
    return ret;
  }
  create_init_packet() {
    if(token.length == 0) {
      this.len = 1;
    } else {
      this.u8.set(token);
      this.len = token.length;
    }
  }
  maybe_send_name() {
    if(!CLIENT.sent_name) {
      CLIENT.sent_name = true;
      this.create_name_packet();
      SOCKET.send();
    }
  }
  create_spawn_packet() {
    this.maybe_send_name();
    this.u8[0] = CONSTS.client_opcode_spawn;
    this.len = 1;
  }
  create_movement_packet() {
    let angle = 0;
    let distance = 0;
    if(!MOVEMENT.mouse_movement) {
      if(MOVEMENT.up != MOVEMENT.down || MOVEMENT.left != MOVEMENT.right) {
        angle = Math.atan2(MOVEMENT.down - MOVEMENT.up, MOVEMENT.right - MOVEMENT.left);
        distance = 160 * WINDOW.devicePixelRatio;
      }
    } else {
      const x = WINDOW.mouse[0] - CANVAS.canvas.width * 0.5;
      const y = WINDOW.mouse[1] - CANVAS.canvas.height * 0.5;
      angle = Math.atan2(y, x);
      distance = Math.hypot(x, y) / CANVAS.fov;
    }
    this.u8[0] = CONSTS.client_opcode_movement;
    this.view.setFloat32(1, angle, true);
    if(distance >= 160 * WINDOW.devicePixelRatio) {
      this.u8[5] = 255 * MOVEMENT.mult;
    } else {
      this.u8[5] = distance * 1.59375 / WINDOW.devicePixelRatio * MOVEMENT.mult;
    }
    this.len = 6;
  }
  create_chat_packet(chat) {
    this.maybe_send_name();
    this.u8[0] = CONSTS.client_opcode_chat;
    this.u8.set(chat, 1);
    this.len = chat.length + 1;
  }
  create_name_packet() {
    this.u8[0] = CONSTS.client_opcode_name;
    const name = MENU.get_name();
    this.u8.set(name, 1);
    this.len = name.length + 1;
  }
  create_spec_packet(id) {
    this.u8[0] = CONSTS.client_opcode_spec;
    this.u8[1] = id;
    this.len = 2;
  }
}

/*
 * DEATH ARROW, DEATH_ARROW
 */

class Death_arrow {
  constructor() {
    this.canvas = createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.size = 0;

    this.init();
  }
  init() {
    this.size = settings["death_arrow_size"]["value"];
    this.canvas.width = this.canvas.height = this.size;
    const h = this.canvas.width * 0.5;
    const k = this.canvas.width;
    this.ctx.beginPath();
    this.ctx.moveTo(h + k * 0.45, h);
    this.ctx.lineTo(h - k * 0.225, h - k * 0.675 / Math.sqrt(3));
    this.ctx.lineTo(h - k * 0.225, h + k * 0.675 / Math.sqrt(3));
    this.ctx.closePath();
    this.ctx.fillStyle = "#bbbbbbb0";
    this.ctx.fill();
    this.ctx.lineWidth = h * 0.1;
    this.ctx.strokeStyle = "#f00";
    this.ctx.stroke();
  }
  draw(ctx) {
    ctx.drawImage(this.canvas, -this.canvas.width * 0.5, -this.canvas.height * 0.5);
  }
}

/*
 * CHAT
 */

class Chat {
  constructor() {
    this.timestamps = new Array(CONSTS.max_chat_timestamps).fill(0);
    this.timestamps_idx = 0;

    this.div = getElementById("ID_chat");
    this.messages = getElementById("ID_messages");
    this.sendmsg = getElementById("ID_sendmsg");

    this.try_typing_help_div = getElementById("ID_try_typing_help");
    this.try_typing_help_tooltip = getElementById("ID_try_typing_help_tooltip");
    this.init_tooltip();

    this.limit = limit_input_to(CONSTS.max_chat_message_len);

    this.len = 0;

    this.visible = false;
    this.blocked = false;

    this.old = "";
    this.timer = -1;
    this.total_message_length = 0;

    this.sendmsg.onkeydown = function(e) {
      e.stopPropagation();
      if(e.code == "Enter") {
        const val = this.sendmsg.value.trim();
        switch(val) {
          case "/help": {
            this.new(null, ">", true);
            this.new(null, "Available commands:", true);
            this.new(null, "/clear /c => clear the chat", true);
            this.new(null, "/respawn /r => tp to the first area", true);
            this.new(null, "/die /d => become downed", true);
            this.new(null, "/menu /m => quit the game and open the menu", true);
            this.new(null, ">", true);
            this.post_send();
            setItem("tth_tooltip", "");
            this.try_typing_help_div.style.display = "none";
            return;
          }
          case "/c":
          case "/clear": {
            this.messages.innerHTML = "";
            this.len = 0;
            this.post_send();
            return;
          }
          default: break;
        }
        const encoded = new TextEncoder().encode(val);
        if(encoded.length > 0) {
          PACKET.create_chat_packet(encoded);
          SOCKET.send();
          /* Init */
          this.timestamps[this.timestamps_idx] = new Date().getTime();
          const next_idx = (this.timestamps_idx + 1) % CONSTS.max_chat_timestamps;
          const timeout = CONSTS.max_chat_timestamps * 1000 - this.timestamps[this.timestamps_idx] + this.timestamps[next_idx];
          this.timestamps_idx = next_idx;
          /* Apply */
          if(timeout > 0) {
            this.disable("You are on cooldown for sending too many messages too quickly");
            this.timer = setTimeout(this.enable.bind(this), timeout);
          } else {
            this.post_send();
          }
        }
      }
    }.bind(this);
    this.sendmsg.onkeyup = function(e) {
      e.stopPropagation();
    };
    this.sendmsg.onkeypress = this.sendmsg.onpaste = this.limit;
  }
  clear() {
    this.timestamps = new Array(CONSTS.max_chat_timestamps).fill(0);
    this.timestamps_idx = 0;

    this.messages.innerHTML = "";
    this.len = 0;

    this.visible = false;
    this.blocked = false;

    this.old = "Press enter to chat";
    this.total_message_length = 0;

    this.enable();
  }
  disable(msg) {
    this.old = this.sendmsg.placeholder;
    this.sendmsg.placeholder = msg;
    this.sendmsg.disabled = true;
    this.sendmsg.value = "";
    CANVAS.canvas.focus();
  }
  enable() {
    if(this.timer != -1) {
      clearTimeout(this.timer);
      this.timer = -1;
    }
    this.sendmsg.disabled = false;
    this.sendmsg.placeholder = this.old;
  }
  block_show() {
    if(!this.visible) {
      this.blocked = false;
      this.show();
    }
    this.blocked = true;
  }
  block_hide() {
    if(this.visible) {
      this.blocked = false;
      this.hide();
    }
    this.blocked = true;
  }
  unblock() {
    this.blocked = false;
  }
  show() {
    if(this.blocked || !settings["chat_on"]) {
      return;
    }
    this.visible = true;
    this.div.style.display = "block";
  }
  hide() {
    if(this.blocked) {
      return;
    }
    this.visible = false;
    this.div.style.display = "none";
  }
  focus(e) {
    this.sendmsg.focus();
  }
  post_send() {
    this.sendmsg.value = "";
    this.sendmsg.blur();
    CANVAS.canvas.focus();
  }
  new(author, msg, no_author = false) {
    const p = createElement("p");
    p.appendChild(document.createTextNode((no_author ? "" : (author + ": ")) + msg));
    this.messages.insertBefore(p, this.messages.firstChild);
    if(++this.len > settings["max_chat_messages"]["value"]) {
      this.messages.removeChild(this.messages.lastChild);
    }
  }
  update() {
    while(this.len > settings["max_chat_messages"]["value"]) {
      this.messages.removeChild(this.messages.lastChild);
      --this.len;
    }
  }
  font_update() {
    this.messages.style["font-size"] = settings["chat_text_scale"]["value"] + "em";
  }
  init_tooltip() {
    if(getItem("tth_tooltip") == undefined) {
      this.try_typing_help_tooltip.innerHTML = "Try \"/help\"";
      this.try_typing_help_div.style.display = "inline-block";
    }
  }
  parse() {
    const count = PACKET.byte();
    for(let i = 0; i < count; ++i) {
      const name_len = PACKET.byte();
      const name = new TextDecoder().decode(PACKET.u8.subarray(PACKET.idx, PACKET.idx + name_len));
      PACKET.idx += name_len;
      const msg_len = PACKET.byte();
      this.new(name, new TextDecoder().decode(PACKET.u8.subarray(PACKET.idx, PACKET.idx + msg_len)));
      PACKET.idx += msg_len;
    }
  }
}

/*
 * CAMERA
 */

class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;

    this.blocked = false;
  }
  block() {
    this.blocked = true;
  }
  unblock() {
    this.blocked = false;
  }
  move(x, y) {
    if(this.blocked) {
      return;
    }
    this.move_f(x, y);
  }
  instant_move(x, y) {
    this.move(x, y);
    this.ip();
  }
  move_x(x) {
    if(this.blocked) {
      return;
    }
    this.x2 = x;
  }
  move_y(y) {
    if(this.blocked) {
      return;
    }
    this.y2 = y;
  }
  move_f(x, y) {
    this.x2 = x;
    this.y2 = y;
  }
  move_f_by(x, y, by) {
    this.x2 = lerp(this.x2, x, by);
    this.y2 = lerp(this.y2, y, by);
  }
  ip() {
    this.x1 = this.x2;
    this.y1 = this.y2;
  }
}

/*
 * PLAYERS
 */

/**
 * @typedef {{
 *            x: number,
 *            y: number,
 *            r: number,
 *            x1: number,
 *            y1: number,
 *            r1: number,
 *            x2: number,
 *            y2: number,
 *            r2: number,
 *            name: string,
 *            dead: boolean,
 *            death_counter: number,
 *            is_player: boolean
 *          }}
 */
var Player;

class Players {
  constructor() {
    /**
     * @type {Array<Player>}
     */
    this.arr = new Array(CONSTS.max_players);
  }
  clear() {
    this.arr = new Array(CONSTS.max_players);
  }
  ip() {
    for(let i = 0; i < CONSTS.max_players; ++i) {
      if(this.arr[i] == undefined) continue;
      this.arr[i].x1 = this.arr[i].x2;
      this.arr[i].y1 = this.arr[i].y2;
      this.arr[i].r1 = this.arr[i].r2;
    }
  }
  parse() {
    const count = PACKET.byte();
    for(let i = 0; i < count; ++i) {
      const id = PACKET.byte();
      if(this.arr[id] == undefined) {
        const x2 = PACKET.float();
        const y2 = PACKET.float();
        const r2 = PACKET.float();
        const name_len = PACKET.byte();
        const name = PACKET.string(name_len);
        const dead = PACKET.byte();
        let death_counter = 0;
        if(dead) {
          death_counter = PACKET.byte();
        }
        const chat_len = PACKET.byte();
        if(chat_len > 0) {
          CHAT.new(name, PACKET.string(chat_len));
        }
        this.arr[id] = { x: 0, y: 0, r: 0, x1: x2, x2, y1: y2, y2, r1: r2, r2, name, dead, death_counter, name_y: 0, is_player: true };
        if(CLIENT.id == id) {
          CAMERA.move(x2, y2);
        }
      } else {
        let field = PACKET.byte();
        if(field == 0) {
          delete this.arr[id];
          continue;
        }
        do {
          switch(field) {
            case 1: {
              this.arr[id].x2 = PACKET.float();
              if(CLIENT.id == id) {
                CAMERA.move_x(this.arr[id].x2);
              }
              break;
            }
            case 2: {
              this.arr[id].y2 = PACKET.float();
              if(CLIENT.id == id) {
                CAMERA.move_y(this.arr[id].y2);
              }
              break;
            }
            case 3: {
              this.arr[id].r2 = PACKET.float();
              break;
            }
            case 4: {
              this.arr[id].dead = PACKET.byte();
              if(this.arr[id].dead) {
                this.arr[id].death_counter = PACKET.byte();
              }
              break;
            }
            case 5: {
              const chat_len = PACKET.byte();
              CHAT.new(this.arr[id].name, PACKET.string(chat_len));
              break;
            }
            default: throw new Error();
          }
          field = PACKET.byte();
        } while(field);
      }
    }
  }
}

/*
 * BALLS
 */

/**
 * @typedef {{
 *            x: number,
 *            y: number,
 *            r: number,
 *            x1: number,
 *            y1: number,
 *            r1: number,
 *            x2: number,
 *            y2: number,
 *            r2: number,
 *            type: number,
 *            is_player: boolean
 *          }}
 */
var Ball;

class Balls {
  constructor() {
    /**
     * @type {Array<Ball>}
     */
    this.arr = new Array(CONSTS.max_balls);
  }
  clear() {
    this.arr = new Array(CONSTS.max_balls);
  }
  ip() {
    for(let i = 0; i < CONSTS.max_balls; ++i) {
      if(this.arr[i] == undefined) continue;
      this.arr[i].x1 = this.arr[i].x2;
      this.arr[i].y1 = this.arr[i].y2;
      this.arr[i].r1 = this.arr[i].r2;
    }
  }
  parse() {
    const count = PACKET.short();
    for(let i = 0; i < count; ++i) {
      const id = PACKET.short();
      if(this.arr[id] == undefined) {
        const type = PACKET.byte() - 1;
        const x2 = PACKET.float();
        const y2 = PACKET.float();
        const r2 = PACKET.float();
        this.arr[id] = { type, x: 0, y: 0, r: 0, x1: x2, x2, y1: y2, y2, r1: r2, r2, is_player: false };
      } else {
        let field = PACKET.byte();
        if(field == 0) {
          delete this.arr[id];
          continue;
        }
        do {
          switch(field) {
            case 1: {
              this.arr[id].x2 = PACKET.float();
              break;
            }
            case 2: {
              this.arr[id].y2 = PACKET.float();
              break;
            }
            case 3: {
              this.arr[id].r2 = PACKET.float();
              break;
            }
            default: throw new Error();
          }
          field = PACKET.byte();
        } while(field);
      }
    }
  }
}

/*
 * KEY PROBER, KEY_PROBER
 */

class Key_prober {
  constructor() {
    /**
     * @type {Function}
     */
    this.resolve = null;

    this.probing = false;
  }
  probe() {
    this.probing = true;
    const that = this;
    return new Promise(function(resolve) {
      that.resolve = function(key) {
        that.probing = false;
        resolve(key);
      };
    });
  }
}

/*
 * TUTORIAL
 */

class Tutorial {
  constructor() {
    this.stage = 0;
    this.stage_max = 7;

    this.old_fov = 0;

    /**
     * @type {Element}
     */
    this.btn = null;
  }
  progress() {
    if(this.stage == 0) {
      if(settings["show_tutorial"] && CLIENT.in_game) {
        this.stage = 1;
        this.old_fov = CANVAS.target_fov;
        CANVAS.target_fov = settings["fov"]["max"];
        CAMERA.block();
        SETTINGS.block_hide();
        MOVEMENT.stop();
        MOVEMENT.block();
      }
    } else if(++this.stage == this.stage_max) {
      this.btn.click();
      this.stage = 0;
      CANVAS.target_fov = this.old_fov;
      CAMERA.unblock();
      SETTINGS.unblock();
      MOVEMENT.unblock();
      MOVEMENT.start();
    }
  }
  run(by) {
    switch(this.stage) {
      case 0: {
        if(settings["show_tutorial"] && BACKGROUND.area_id == CONSTS.default_area_id) {
          draw_text("Need help? Press KeyT for a tutorial.", BACKGROUND.width * 0.5, BACKGROUND.cell_size * 2.5);
        }
        break;
      }
      case 1: {
        draw_text("<-- Your character", CAMERA.x + 110, CAMERA.y);
        draw_text("Your character -->", CAMERA.x - 110, CAMERA.y);
        draw_text("This is your character. You can control it with these keys:", CAMERA.x, CAMERA.y - 220);
        draw_text(`${keybinds["up"]}: up`, CAMERA.x, CAMERA.y - 170);
        draw_text(`${keybinds["left"]}: left`, CAMERA.x, CAMERA.y - 130);
        draw_text(`${keybinds["down"]}: down`, CAMERA.x, CAMERA.y - 90);
        draw_text(`${keybinds["right"]}: right`, CAMERA.x, CAMERA.y - 50);
        draw_text("You can also control it with mouse. Just", CAMERA.x, CAMERA.y + 50);
        draw_text("press any mouse button to start or stop moving.", CAMERA.x, CAMERA.y + 70);
        draw_text("Scroll to change your field of view.", CAMERA.x, CAMERA.y + 110);
        draw_text("Note that you won't be able to perform some", CAMERA.x, CAMERA.y + 150);
        draw_text("of the above actions until the tutorial ends.", CAMERA.x, CAMERA.y + 170);
        draw_text("Press KeyT to continue", CAMERA.x, CAMERA.y + 220);
        break;
      }
      case 2: {
        const _x = BACKGROUND.width * 0.5 - BACKGROUND.cell_size * 6;
        const _y = BACKGROUND.height * 0.5;
        CAMERA.move_f_by(_x, _y, 0.2 * by);
        draw_text("-->", _x + BACKGROUND.cell_size * 2, _y - BACKGROUND.cell_size * 1);
        draw_text("-->", _x + BACKGROUND.cell_size * 2, _y);
        draw_text("-->", _x + BACKGROUND.cell_size * 2, _y + BACKGROUND.cell_size * 1);
        draw_text("<--", _x - BACKGROUND.cell_size * 2, _y - BACKGROUND.cell_size * 2);
        draw_text("<--", _x - BACKGROUND.cell_size * 3, _y - BACKGROUND.cell_size * 1);
        draw_text("<--", _x - BACKGROUND.cell_size * 4, _y);
        draw_text("<--", _x - BACKGROUND.cell_size * 3, _y + BACKGROUND.cell_size * 1);
        draw_text("<--", _x - BACKGROUND.cell_size * 2, _y + BACKGROUND.cell_size * 2);
        draw_text("These are safezones. Enemies can't", _x, _y - 130);
        draw_text("reach you inside of these tiles.", _x, _y - 110);
        draw_text("Press KeyT to continue", _x, _y + 110);
        break;
      }
      case 3: {
        const _x = BACKGROUND.width * 0.5 + BACKGROUND.cell_size * 6;
        const _y = BACKGROUND.height * 0.5;
        CAMERA.move_f_by(_x, _y, 0.2 * by);
        draw_text("<--", _x - BACKGROUND.cell_size * 2, _y - BACKGROUND.cell_size * 2);
        draw_text("<--", _x - BACKGROUND.cell_size * 1, _y - BACKGROUND.cell_size * 3);
        draw_text("<--", _x, _y - BACKGROUND.cell_size * 4);
        draw_text("<--", _x - BACKGROUND.cell_size * 2, _y + BACKGROUND.cell_size * 2);
        draw_text("<--", _x - BACKGROUND.cell_size * 1, _y + BACKGROUND.cell_size * 3);
        draw_text("<--", _x, _y + BACKGROUND.cell_size * 4);
        draw_text("-->", _x + BACKGROUND.cell_size * 2, _y - BACKGROUND.cell_size * 3);
        draw_text("-->", _x + BACKGROUND.cell_size * 2, _y + BACKGROUND.cell_size * 3);
        draw_text("<--", _x + BACKGROUND.cell_size * 5, _y - BACKGROUND.cell_size * 2);
        draw_text("<--", _x + BACKGROUND.cell_size * 6, _y - BACKGROUND.cell_size * 1);
        draw_text("<--", _x + BACKGROUND.cell_size * 7, _y);
        draw_text("<--", _x + BACKGROUND.cell_size * 6, _y + BACKGROUND.cell_size * 1);
        draw_text("<--", _x + BACKGROUND.cell_size * 5, _y + BACKGROUND.cell_size * 2);
        draw_text("These are walls. Players can't walk over them.", _x, _y - 40);
        draw_text("However, some types (colors) of enemies can.", _x, _y - 10);
        draw_text("Press KeyT to continue", _x, _y + 40);
        break;
      }
      case 4: {
        const _x = BACKGROUND.cell_size * 0.5;
        const _y = BACKGROUND.height * 0.5;
        CAMERA.move_f_by(_x, _y, 0.2 * by);
        draw_text("-->", _x, _y);
        draw_text("This is a teleport tile. If you walk on it,", _x, _y - 130);
        draw_text("you will be teleported to the area it points to.", _x, _y - 110);
        draw_text("Minimap is not yet implemented, but once it is, you", _x, _y - 70);
        draw_text("will be able to see where any area is located at.", _x, _y - 50);
        draw_text("If a teleport doesn't have a number on it, it doesn't point", _x, _y + 50);
        draw_text("anywhere (perhaps because the next area is under construction).", _x, _y + 70);
        draw_text("Press KeyT to continue", _x, _y + 120);
        break;
      }
      case 5: {
        let first_ball;
        for(let i = 0; i < CONSTS.max_balls; ++i) {
          if(BALLS.arr[i]) {
            first_ball = BALLS.arr[i];
            break;
          }
        }
        const _x = first_ball.x2;
        const _y = first_ball.y2;
        CAMERA.move_f_by(_x, _y, 0.2 * by);
        draw_text("Enemy ball -->", _x - 110, _y);
        draw_text("<-- Enemy ball", _x + 110, _y);
        draw_text("This is an enemy, also called simply a ball. A grey ball", _x, _y - 110);
        draw_text("doesn't do a lot - it simply moves in one direction. However,", _x, _y - 90);
        draw_text("as you are about to find out when you start exploring the game,", _x, _y - 70);
        draw_text("there are lots of types of enemies, each having their own color.", _x, _y - 50);
        draw_text("Coming in contact with an enemy downs you. While downed, you can't move,", _x, _y + 50);
        draw_text("and after a while, you die, unless other players revive you by touching you.", _x, _y + 70);
        draw_text("Press KeyT to continue", _x, _y + 120);
        break;
      }
      case 6: {
        const _x = PLAYERS.arr[CLIENT.id].x2;
        const _y = PLAYERS.arr[CLIENT.id].y2;
        CAMERA.move_f_by(_x, _y, 0.2 * by);
        draw_text(`You can press ${keybinds["settings"]} to open settings.`, _x, _y - 80);
        draw_text("There are a lot of cool options to change. Try it out later.", _x, _y - 60);
        draw_text("That's it for this tutorial. See how far you can go!", _x, _y + 60);
        draw_text("GLHF!", _x, _y + 80);
        draw_text("Press KeyT to end the tutorial", _x, _y + 130);
        break;
      }
    }
  }
}

/*
 * SETTINGS
 */

class Settings {
  constructor() {
    this.div = getElementById("ID_settings_container");
    this.insert = getElementById("ID_settings");

    this.visible = false;
    this.blocked = false;

    /**
     * @type {Element}
     */
    this.table = null;

    this.init();
  }
  block_show() {
    if(!this.visible) {
      this.blocked = false;
      this.show();
    }
    this.blocked = true;
  }
  block_hide() {
    if(this.visible) {
      this.blocked = false;
      this.hide();
    }
    this.blocked = true;
  }
  unblock() {
    this.blocked = false;
  }
  show() {
    if(this.blocked) {
      return;
    }
    this.visible = true;
    this.div.style.display = "block";
    MOVEMENT.stop();
    MOVEMENT.block();
  }
  hide() {
    if(this.blocked) {
      return;
    }
    this.visible = false;
    this.div.style.display = "none";
    MOVEMENT.unblock();
    MOVEMENT.start();
  }
  show_el(el) {
    this.insert.appendChild(el);
  }
  add(left, right) {
    const tr = createElement("tr");
    let td = createElement("td");
    td.appendChild(left);
    tr.appendChild(td);
    td = createElement("td");
    td.appendChild(right);
    right.onchange = save_settings;
    tr.appendChild(td);
    this.table.appendChild(tr);
  }
  end() {
    if(this.table != null) {
      this.show_el(this.table);
      this.table = null;
    }
  }
  new(name) {
    this.end();
    this.show_el(this.header(name));
    this.table = createElement("table");
  }
  _create_h(which, content) {
    const h = createElement(which);
    h.innerHTML = content;
    return h;
  }
  header(content) {
    return this._create_h("h1", content);
  }
  text(content) {
    return this._create_h("h3", content);
  }
  comment(content) {
    return this._create_h("h5", content);
  }
  switch(name, cb=function(a){}) {
    const btn = createElement("button");
    settings[name] = !settings[name];
    let first = true;
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
      if(first) {
        first = false;
      } else {
        cb(settings[name]);
      }
    };
    btn.onclick();
    return btn;
  }
  list(name) {
    const select = createElement("select");
    for(let option of settings[name]["options"]) {
      const opt = createElement("option");
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
  keybind(name, cb=function(){}) {
    const btn = createElement("button");
    btn.innerHTML = keybinds[name];
    btn.onclick = async function() {
      btn.innerHTML = "...";
      const key = await KEY_PROBER.probe();
      btn.innerHTML = key;
      keybinds[name] = key;
      save_keybinds();
      cb();
    };
    btn.style.color = "#000";
    return btn;
  }
  slider(name, suffix="", cb=function(){}) {
    const div = createElement("div");
    div.className = "input";
    const input = createElement("input");
    input.type = "range";
    input.min = settings[name]["min"];
    input.max = settings[name]["max"];
    input.step = settings[name]["step"];
    input.value = settings[name]["value"];
    input.oninput = function() {
      input.nextElementSibling.innerHTML = input.value + suffix;
      settings[name]["value"] = input.valueAsNumber;
      cb();
    };
    input.onchange = save_settings;
    div.appendChild(input);
    div.appendChild(this.text(input.value + suffix));
    return div;
  }
  button(name, cb) {
    const btn = createElement("button");
    btn.innerHTML = name;
    btn.onclick = cb;
    return btn;
  }
  init() {
    this.insert.innerHTML = "";
    this.new("CHAT");
    this.add(this.text("Show chat"), this.switch("chat_on", function(visible) {
      if(visible) {
        CHAT.show();
      } else {
        CHAT.hide();
      }
    }));
    this.add(this.text("Max number of chat messages"), this.slider("max_chat_messages", "", CHAT.update.bind(CHAT)));
    this.add(this.text("Chat text scale"), this.slider("chat_text_scale", "", CHAT.font_update.bind(CHAT)));

    this.new("MENU");
    this.add(this.text("Show latency"), this.switch("show_ping", MENU.ping_update.bind(MENU)));

    this.new("GAME");
    TUTORIAL.btn = this.switch("show_tutorial");
    this.add(this.text("Enable tutorial"), TUTORIAL.btn);

    this.new("VISUALS");
    this.add(this.text("Default FOV"), this.slider("fov"));
    this.add(this.text("Draw balls' fill"), this.switch("draw_ball_fill"));
    this.add(this.text("Draw balls' stroke"), this.switch("draw_ball_stroke"));
    this.add(this.text("Draw stroke-only balls with brighter color"), this.switch("draw_ball_stroke_bright"));
    this.add(this.text("Balls' stroke radius percentage"), this.slider("ball_stroke", "%"));
    this.add(this.text("Draw players' fill"), this.switch("draw_player_fill"));
    this.add(this.text("Draw players' stroke"), this.switch("draw_player_stroke"));
    this.add(this.text("Draw stroke-only players with brighter color"), this.switch("draw_player_stroke_bright"));
    this.add(this.text("Players' stroke radius percentage"), this.slider("player_stroke", "%"));
    this.add(this.text("Draw players' name"), this.switch("draw_player_name"));
    this.add(this.text("Draw an arrow towards dead players"), this.switch("draw_death_arrow"));
    this.add(this.text("Death arrow size"), this.slider("death_arrow_size", "px", DEATH_ARROW.init.bind(DEATH_ARROW)));

    this.new("KEYBINDS");
    this.show_el(this.comment("To change, click a button on the right side and then press the key you want to assign to it."));
    this.add(this.text("Settings"), this.keybind("settings"));
    this.add(this.text("Move up"), this.keybind("up"));
    this.add(this.text("Move left"), this.keybind("left"));
    this.add(this.text("Move down"), this.keybind("down"));
    this.add(this.text("Move right"), this.keybind("right"));
    this.add(this.text("Move slowly"), this.keybind("slowwalk"));
    this.add(this.text("Spectate previous player"), this.keybind("spec_prev", MENU.init_spec_help_text.bind(MENU)));
    this.add(this.text("Spectate next player"), this.keybind("spec_next", MENU.init_spec_help_text.bind(MENU)));
    //this.add(this.text("Big minimap"), this.keybind("minimap"));

    this.new("RESET");
    this.add(this.text("Reset settings"), this.button("RESET", function() {
      settings = JSON.parse(JSON.stringify(default_settings));
      save_settings();
      this.init();
    }.bind(this)));
    this.add(this.text("Reset keybinds"), this.button("RESET", function() {
      keybinds = JSON.parse(JSON.stringify(default_keybinds));
      save_keybinds();
      this.init();
    }.bind(this)));
    this.add(this.text("Reset all tooltips"), this.button("RESET", function() {
      removeItem("psfy_tooltip");
      MENU.init_tooltip();
      removeItem("tth_tooltip");
      CHAT.init_tooltip();
    }));

    this.end();
  }
}

/*
 * BACKGROUND
 */

class Background {
  constructor() {
    this.canvas = createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    /*this.tiles = new Array(Tile_colors.length);
    for(let i = 0; i < Tile_colors.length; ++i) {
      const c = createElement("canvas");
      this.tiles[i] = [c, c.getContext("2d")];
    }*/

    this.light_canvas = createElement("canvas");
    this.light_ctx = this.light_canvas.getContext("2d");

    this.width = 0;
    this.height = 0;
    this.cell_size = 0;

    this.area_id = -1;
  }
  clear() {
    this.area_id = -1;
  }
  parse() {
    this.area_id = PACKET.byte();
    const w = PACKET.byte();
    const h = PACKET.byte();
    const cell_size = PACKET.byte();
    const fov_max = settings["fov"]["max"];
    const fov_cell_size = cell_size * fov_max;
    const teleports = new Array(PACKET.byte());
    for(let i = 0; i < teleports.length; ++i) {
      teleports[i] = [
        (PACKET.byte() + 0.5) * fov_cell_size,
        (PACKET.byte() + 0.5) * fov_cell_size,
        PACKET.byte()
      ]
    }
    const fills = new Array(256);
    const strokes = new Array(256);
    for(let x = 0; x < w; ++x) {
      for(let y = 0; y < h; ++y) {
        const i = PACKET.u8[PACKET.idx];
        if(i != 2) {
          if(fills[i] == undefined) {
            fills[i] = new Path2D();
            strokes[i] = new Path2D();
          }
          fills[i].rect(
            (1.5 + x * cell_size) * fov_max,
            (1.5 + y * cell_size) * fov_max,
            (cell_size - 1.5 * 2) * fov_max,
            (cell_size - 1.5 * 2) * fov_max
          );
          strokes[i].rect(
            x * fov_cell_size,
            y * fov_cell_size,
            fov_cell_size,
            fov_cell_size
          );
        }
        ++PACKET.idx;
      }
    }
    
    this.width = w * cell_size;
    this.height = h * cell_size;
    this.cell_size = cell_size;

    this.canvas.width = this.width * fov_max;
    this.canvas.height = this.height * fov_max;
    this.light_canvas.width = this.canvas.width;
    this.light_canvas.height = this.canvas.height;
    for(let i = 0; i < 256; ++i) {
      if(fills[i] == undefined) continue;
      this.ctx.fillStyle = Tile_colors[i] + "b0";
      this.ctx.fill(strokes[i]);
      this.ctx.fillStyle = Tile_colors[i];
      this.ctx.fill(fills[i]);
      this.light_ctx.fillStyle = Tile_colors[i];
      this.light_ctx.fill(strokes[i]);
    }
    this.ctx.font = `700 ${cell_size}px Ubuntu`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = Tile_colors[3].darken();
    for(const tp of teleports) {
      this.ctx.fillText(tp[2], tp[0], tp[1]);
    }
  }
}

/*
 * CANVAS
 */

class Canvas {
  constructor() {
    this.canvas = getElementById("ID_canvas");
    this.ctx = this.canvas.getContext("2d");

    this.width = 0;
    this.height = 0;

    this.fov = settings["fov"]["value"];
    this.target_fov = this.fov;

    this.animation = -1;
    this.stop_draw = false;
    this.draw_at = 0;
    this.last_draw_at = 0;

    this.canvas.onwheel = this.wheel.bind(this);
    this.canvas.onmousedown = this.mousedown.bind(this);
  }
  clear() {
    this.fov = settings["fov"]["value"];
    this.target_fov = this.fov;

    cancelAnimationFrame(this.animation);
    this.animation = -1;
    this.stop_draw = false;
    this.draw_at = 0;
    this.last_draw_at = 0;
  }
  resize() {
    this.width = WINDOW.innerWidth * WINDOW.devicePixelRatio;
    this.height = WINDOW.innerHeight * WINDOW.devicePixelRatio;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
  stop() {
    this.stop_draw = true;
    this.canvas.parentElement.removeChild(this.canvas);
  }
  wheel(e) {
    const add = -Math.sign(e.deltaY) * 0.05;
    if(this.target_fov > 1) {
      this.target_fov += add * 3;
    } else {
      this.target_fov += add;
    }
    this.target_fov = Math.min(Math.max(this.target_fov, settings["fov"]["min"]), settings["fov"]["max"]);
  }
  mousedown() {
    MOVEMENT.mouse_movement = !MOVEMENT.mouse_movement;
    MOVEMENT.send();
  }
  text(text, x, y) {
    this.ctx.font = `700 20px Ubuntu`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "#fff";
    this.ctx.strokeStyle = "#333";
    this.ctx.lineWidth = 1;
    this.ctx.fillText(text, x, y);
    this.ctx.strokeText(text, x, y);
  }
  start_drawing() {
    this.animation = window.requestAnimationFrame(this.draw.bind(this));
  }
  draw(when) {
    if(this.stop_draw) return;
    this.draw_at = Math.min(Math.max(this.draw_at, SOCKET.updates[0]), SOCKET.updates[1]);
    const old = this.fov;
    this.fov = lerp(this.fov, this.target_fov, 0.1);
    if(this.fov != old) {
      MOVEMENT.send();
    }
    let by;
    if(SOCKET.updates[0] == SOCKET.updates[1]) {
      by = 1;
    } else {
      by = (this.draw_at - SOCKET.updates[0]) / (SOCKET.updates[1] - SOCKET.updates[0]);
    }
    this.draw_at += when - this.last_draw_at;
    this.last_draw_at = when;
    if(settings["show_ping"]) {
      MENU.ping.innerHTML = SOCKET.cached_ping.toFixed(1) + "ms";
    }
    CAMERA.x = lerp(CAMERA.x1, CAMERA.x2, by);
    CAMERA.y = lerp(CAMERA.y1, CAMERA.y2, by);
    //tutorial stuff here from git
    this.ctx.resetTransform();
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
    this.ctx.scale(this.fov, this.fov);
    this.ctx.translate(-CAMERA.x, -CAMERA.y);
    this.ctx.drawImage(BACKGROUND.canvas, 0, 0, BACKGROUND.width, BACKGROUND.height);
    if(this.fov < 1) {
      this.ctx.globalAlpha = 1 - (this.fov - settings["fov"]["min"]) * 4 / 3;
      this.ctx.drawImage(BACKGROUND.light_canvas, 0, 0, BACKGROUND.width, BACKGROUND.height);
      this.ctx.globalAlpha = 1;
    }
    const sorted = new Array(CONSTS.max_players + CONSTS.max_balls);
    let idx = 0;
    if(settings["draw_player_fill"] || settings["draw_player_stroke"]) {
      for(let i = 0; i < CONSTS.max_players; ++i) {
        if(PLAYERS.arr[i] == undefined) continue;
        PLAYERS.arr[i].x = lerp(PLAYERS.arr[i].x1, PLAYERS.arr[i].x2, by);
        PLAYERS.arr[i].y = lerp(PLAYERS.arr[i].y1, PLAYERS.arr[i].y2, by);
        PLAYERS.arr[i].r = lerp(PLAYERS.arr[i].r1, PLAYERS.arr[i].r2, by);
        sorted[idx++] = PLAYERS.arr[i];
      }
    }
    if(settings["draw_ball_fill"] || settings["draw_ball_stroke"]) {
      for(let i = 0; i < CONSTS.max_balls; ++i) {
        if(BALLS.arr[i] == undefined) continue;
        BALLS.arr[i].x = lerp(BALLS.arr[i].x1, BALLS.arr[i].x2, by);
        BALLS.arr[i].y = lerp(BALLS.arr[i].y1, BALLS.arr[i].y2, by);
        BALLS.arr[i].r = lerp(BALLS.arr[i].r1, BALLS.arr[i].r2, by);
        sorted[idx++] = BALLS.arr[i];
      }
    }
    sorted.sort((a, b) => b.r - a.r);
    for(let i = 0; i < sorted.length; ++i) {
      if(sorted[i] == undefined) continue;
      this.ctx.beginPath();
      const obj = sorted[i];
      if(obj.is_player) {
        let r_sub = obj.r * (settings["player_stroke"]["value"] / 200);
        this.ctx.moveTo(obj.x + obj.r - r_sub, obj.y);
        this.ctx.arc(obj.x, obj.y, obj.r - r_sub, 0, Math.PI * 2);
        if(settings["draw_player_fill"]) {
          this.ctx.fillStyle = "#ebecf0";
          this.ctx.fill();
        }
        if(settings["draw_player_stroke"]) {
          if(!settings["draw_player_fill"] && settings["draw_player_stroke_bright"]) {
            this.ctx.strokeStyle = "#ebecf0";
          } else {
            this.ctx.strokeStyle = "#ebecf0".darken();
          }
          this.ctx.lineWidth = r_sub * 2;
          this.ctx.stroke();
        }
        if(settings["draw_player_name"] && obj.name.length != 0) {
          this.ctx.font = `700 ${obj.r / this.fov}px Ubuntu`;
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillStyle = "#00000080";
          let target_name_y;
          if(this.fov > 1) {
            target_name_y = obj.r * 0.5;
          } else {
            target_name_y = obj.r * 0.5 + (2 / (this.fov * this.fov));
          }
          obj.name_y = lerp(obj.name_y, target_name_y, 0.1);
          this.ctx.fillText(obj.name, obj.x, obj.y - obj.r - obj.name_y);
        }
        if(obj.dead) {
          this.ctx.font = `700 ${obj.r / Math.min(this.fov, 1)}px Ubuntu`;
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillStyle = "#f00";
          this.ctx.fillText(obj.death_counter, obj.x, obj.y);
          if(settings["draw_death_arrow"]) {
            const [x, y, out] = get_sticky_position(obj.x, obj.y, DEATH_ARROW.size * 0.75, true, true, true);
            if(out) {
              this.ctx.translate(x, y);
              const angle = Math.atan2(obj.y - y, obj.x - x);
              this.ctx.rotate(angle);
              DEATH_ARROW.draw(this.ctx);
              this.ctx.rotate(-angle);
              this.ctx.font = `700 ${DEATH_ARROW.size * 0.3}px Ubuntu`;
              this.ctx.fillText(obj.death_counter, 0, 0);
              this.ctx.translate(-x, -y);
            }
          }
        }
      } else {
        const r_sub = obj.r * (settings["ball_stroke"]["value"] / 200);
        this.ctx.moveTo(obj.x + obj.r - r_sub, obj.y);
        this.ctx.arc(obj.x, obj.y, obj.r - r_sub, 0, Math.PI * 2);
        if(settings["draw_ball_fill"]) {
          this.ctx.fillStyle = Ball_colors[obj.type];
          this.ctx.fill();
        }
        if(settings["draw_ball_stroke"]) {
          if(!settings["draw_ball_fill"] && settings["draw_ball_stroke_bright"]) {
            this.ctx.strokeStyle = Ball_colors[obj.type];
          } else {
            this.ctx.strokeStyle = Ball_colors[obj.type].darken();
          }
          this.ctx.lineWidth = r_sub * 2;
          this.ctx.stroke();
        }
      }
    }
    TUTORIAL.run(by);
    this.animation = window.requestAnimationFrame(this.draw.bind(this));
  }
}

/*
 * WINDOW
 */

class _Window {
  constructor() {
    this.devicePixelRatio = 0;
    this.innerWidth = 0;
    this.innerHeight = 0;

    this.mouse = [0, 0];

    window.onresize = this.resize.bind(this);
    window.onkeyup = this.keyup.bind(this);
    window.onkeydown = this.keydown.bind(this);
    window.onmousemove = this.mousemove.bind(this);
    window.onbeforeunload = this.beforeunload.bind(this);
  }
  resize() {
    if(window.devicePixelRatio != this.devicePixelRatio || window.innerWidth != this.innerWidth || window.innerHeight != this.innerHeight) {
      this.devicePixelRatio = window.devicePixelRatio;
      this.innerWidth = window.innerWidth;
      this.innerHeight = window.innerHeight;
      CANVAS.resize();
    }
  }
  keydown(e) {
    if(e.repeat) {
      return;
    }
    if(KEY_PROBER.probing) {
      e.preventDefault();
      KEY_PROBER.resolve(e.code);
      return;
    }
    if(e.code == keybinds["settings"]) {
      if(SETTINGS.visible) {
        SETTINGS.hide();
      } else {
        SETTINGS.show();
      }
      return;
    }
    if(CLIENT.spectating) {
      switch(e.code) {
        case keybinds["spec_prev"]: {
          PACKET.create_spec_packet(-1);
          SOCKET.send();
        }
        case keybinds["spec_next"]: {
          PACKET.create_spec_packet(1);
          SOCKET.send();
        }
        default: break;
      }
    }
    switch(e.code) {
      case "Enter": {
        CHAT.focus(e);
        break;
      }
      case keybinds["up"]: {
        if(!MOVEMENT.up) {
          MOVEMENT.up = 1;
          MOVEMENT.send();
        }
        break;
      }
      case keybinds["down"]: {
        if(!MOVEMENT.down) {
          MOVEMENT.down = 1;
          MOVEMENT.send();
        }
        break;
      }
      case keybinds["left"]: {
        if(!MOVEMENT.left) {
          MOVEMENT.left = 1;
          MOVEMENT.send();
        }
        break;
      }
      case keybinds["right"]: {
        if(!MOVEMENT.right) {
          MOVEMENT.right = 1;
          MOVEMENT.send();
        }
        break;
      }
      case keybinds["slowwalk"]: {
        if(MOVEMENT.get_mult() == 1) {
          MOVEMENT.upd_mult(0.5);
          MOVEMENT.send();
        }
        break;
      }
      case "KeyT": {
        TUTORIAL.progress();
        break;
      }
      default: break;
    }
  }
  keyup(e) {
    if(e.repeat) {
      return;
    }
    switch(e.code) {
      case keybinds["up"]: {
        if(MOVEMENT.up) {
          MOVEMENT.up = 0;
          MOVEMENT.send();
        }
        break;
      }
      case keybinds["down"]: {
        if(MOVEMENT.down) {
          MOVEMENT.down = 0;
          MOVEMENT.send();
        }
        break;
      }
      case keybinds["left"]: {
        if(MOVEMENT.left) {
          MOVEMENT.left = 0;
          MOVEMENT.send();
        }
        break;
      }
      case keybinds["right"]: {
        if(MOVEMENT.right) {
          MOVEMENT.right = 0;
          MOVEMENT.send();
        }
        break;
      }
      case keybinds["slowwalk"]: {
        if(MOVEMENT.get_mult() == 0.5) {
          MOVEMENT.upd_mult(1);
          MOVEMENT.send();
        }
        break;
      }
      default: break;
    }
  }
  mousemove(e) {
    this.mouse = [e.clientX * this.devicePixelRatio, e.clientY * this.devicePixelRatio];
    MOVEMENT.send();
  }
  beforeunload(e) {
    if(!CLIENT.in_game) {
      return;
    }
    e.preventDefault();
    const str = "Are you sure you want to quit?";
    e.returnValue = str;
    return str;
  }
}

/*
 * MOVEMENT
 */

class Movement {
  constructor() {
    this.mouse_movement = false;

    this.old_mult = 1;
    this.mult = 1;

    this.blocked = false;

    this.up = 0;
    this.down = 0;
    this.left = 0;
    this.right = 0;
  }
  clear() {
    this.unblock();

    this.mouse_movement = false;

    this.old_mult = 1;
    this.mult = 1;
  }
  block() {
    this.blocked = true;
  }
  unblock() {
    this.blocked = false;
  }
  stop() {
    if(this.blocked) {
      return;
    }
    this.old_mult = this.mult;
    this.mult = 0;
    this.send();
  }
  start() {
    if(this.blocked) {
      return;
    }
    this.mult = this.old_mult;
    this.send();
  }
  zero() {
    this.mouse_movement = false;
  }
  upd_mult(mult) {
    if(!this.blocked) {
      this.mult = mult;
    }
    this.old_mult = mult;
  }
  get_mult() {
    return this.old_mult;
  }
  send() {
    if(CLIENT.in_game && !this.blocked) {
      PACKET.create_movement_packet();
      SOCKET.send();
    }
  }
}

/*
 * CLIENT
 */

class Client {
  constructor() {
    this.in_game = false;
    this.spectating = false;
    this.sent_name = false;
    this.id = -1;
  }
  clear() {
    this.in_game = false;
    this.spectating = false;
    this.sent_name = false;
    this.id = -1;
  }
  onconnecting() {
    MENU.show();
    MENU.hide_name();
    status.innerHTML = "Connecting";
    CHAT.show();
    CHAT.disable("Waiting for connection...");
    SETTINGS.block_hide();
  }
  onconnected() {
    MENU.show();
    MENU.show_name();
    status.innerHTML = "";
    CHAT.enable();
    SETTINGS.unblock();
  }
  ondisconnected() {
    this.in_game = false;
    MENU.show();
    status.innerHTML = "Disconnected";
    MENU.show_refresh();
    SETTINGS.block_hide();
  }
  onserverfull() {
    this.ondisconnected();
    status.innerHTML = "Server is full";
  }
  onspectatestart() {
    MENU.hide();
    MENU.show_spec_help();
    MENU.spectating.style.display = "block";
  }
  onspectatestop() {
    MENU.show();
    MENU.hide_spec_help();
    MENU.spectating.style.display = "none";
    MOVEMENT.zero();
  }
  onspawn() {
    MENU.hide();
  }
  ondeath() {
    MENU.show();
    MOVEMENT.zero();
  }
}

/*
 * INIT
 */

const MENU = new Menu();
const SOCKET = new Socket();
const PACKET = new Packet();
const DEATH_ARROW = new Death_arrow();
const CHAT = new Chat();
const CAMERA = new Camera();
const PLAYERS = new Players();
const BALLS = new Balls();
const KEY_PROBER = new Key_prober();
const TUTORIAL = new Tutorial();
const SETTINGS = new Settings();
const BACKGROUND = new Background();
const CANVAS = new Canvas();
const WINDOW = new _Window();
const MOVEMENT = new Movement();
const CLIENT = new Client();

WINDOW.resize();

(async function() {
  CLIENT.onconnecting();
  let resolver;
  const promise = new Promise(function(resolve) {
    resolver = resolve;
  });
  const latency_sockets = [];
  for(const [players, max_players, ip] of MENU.servers) {
    latency_sockets[latency_sockets.length] = new Latency_socket(ip, resolver);
  }
  setTimeout(resolver, 2000, "");
  const ret = await promise;
  let url;
  if(ret.length == 0) {
    let max = 0;
    for(const socket of latency_sockets) {
      if(socket.ws.readyState == WebSocket.OPEN && socket.packets > max) {
        max = socket.packets;
        url = socket.ws.url;
      }
    }
  } else {
    url = ret;
  }
  if(url == undefined) {
    status.innerHTML = "Couldn't connect to any server";
    reload();
    throw new Error(status.innerHTML);
  }
  for(const socket of latency_sockets) {
    if(socket.ws.url != url) {
      socket.stop();
    } else {
      SOCKET.takeover(socket);
    }
  }
  MENU.init();
})();