/*
 * LOCAL STORAGE, LOCAL_STORAGE
 */

const { localStorage } = window;

/** @type {function(string):?string} */
function getItem(id) {
  return localStorage.getItem(id);
}

/** @type {function(string, string):void} */
function setItem(id, val) {
  localStorage.setItem(id, val);
}

/** @type {function(string):void} */
function removeItem(id) {
  localStorage.removeItem(id);
}

const { sin, cos, max, min, abs } = Math;

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
  ["menu"]: "KeyM",
  ["freecam"]: "KeyF"
};
/** @type {Object<string, string>} */
let keybinds = _keybinds != null ? /** @type {Object<string, string>} */ (JSON.parse(_keybinds)) : default_keybinds;
for(const prop in keybinds) {
  if(!(prop in default_keybinds)) {
    delete keybinds[prop];
  }
}
for(const prop in default_keybinds) {
  if(!(prop in keybinds)) {
    keybinds[prop] = default_keybinds[prop];
  }
}
function save_keybinds() {
  setItem("keybinds", JSON.stringify(keybinds));
}

const _settings = getItem("settings");
const default_settings = {
  ["fov"]: {
    ["min"]: 0.25,
    ["max"]: 4,
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
    ["max"]: 19 * 4,
    ["value"]: 40,
    ["step"]: 1
  },
  ["show_tutorial"]: true,
  ["show_ping"]: false,
  ["slowwalk_speed"]: {
    ["min"]: 0,
    ["max"]: 100,
    ["value"]: 50,
    ["step"]: 1
  },
  ["show_target_arrows"]: true,
  ["target_arrow_size"]: {
    ["min"]: 0.2,
    ["max"]: 4,
    ["value"]: 1.2,
    ["step"]: 0.05
  },
  ["target_arrow_dist"]: {
    ["min"]: 0.05,
    ["max"]: 4,
    ["value"]: 0.6,
    ["step"]: 0.05
  },
  ["target_arrow_opacity"]: {
    ["min"]: 0,
    ["max"]: 100,
    ["value"]: 20,
    ["step"]: 1
  }
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
  settings[prop]["value"] = max(min(settings[prop]["value"], settings[prop]["max"]), settings[prop]["min"]);
}
function save_settings() {
  setItem("settings", JSON.stringify(settings));
}

/** @type {number} */
const fov_max = settings["fov"]["max"];

/*
 * UTILITY
 */

/** @type {function(string):!HTMLElement} */
function getElementById(id) {
  return /** @type {!HTMLElement} */ (document.getElementById(id));
}

/** @type {function(string):!HTMLElement} */
function createElement(id) {
  return /** @type {!HTMLElement} */ (document.createElement(id));
}

const status = getElementById("ID_status");

const _token = window["token"];
let token = [];
if(typeof _token == "string") {
  token = _token.split(",").map(r => +r);
}

const _reload = location.reload.bind(location);

function reload() {
  setTimeout(_reload, 1000);
}

function reload_now() {
  _reload();
}

String.prototype.get_server_name = function() {
  const match = this.match(/\/\/(.*?)\.shadam\.xyz/);
  const match2 = this.match(/\/\/(.*?)[\/:]/);
  return match ? match[1] : (match2 ? match2[1] : this);
};

const websocket_send = WebSocket.prototype.send;
const websocket_close = WebSocket.prototype.close;

/** @suppress {checkTypes} */
WebSocket = class extends WebSocket {
  constructor(...args) {
    super(...args);
  }
  /** @param {!ArrayBuffer} data */
  send(data) {
    if(this.readyState == WebSocket.OPEN) {
      websocket_send.call(this, data);
    }
  }
  close() {
    if(this.readyState == WebSocket.CONNECTING || this.readyState == WebSocket.OPEN) {
      websocket_close.call(this);
    }
  }
}

/** @type {function(number):(function((KeyboardEvent | ClipboardEvent)):void)} */
function _limit_input_to(n) {
  return function(e) {
    const is_clipboard = e instanceof ClipboardEvent;
    if(is_clipboard && e.type != "paste") {
      return;
    }
    /** @type {HTMLInputElement} */
    const target = e.target;
    const new_val = target.value + (is_clipboard ? e.clipboardData.getData("text") : e.key);
    if(new TextEncoder().encode(new_val).byteLength - target.selectionEnd + target.selectionStart > n) {
      if(target.value == "" && is_clipboard) {
        const old = target.placeholder;
        target.placeholder = "Text too long to paste!";
        setTimeout(function() {
          target.placeholder = old;
        }, 1000);
      }
      e.preventDefault();
    }
  };
}

/** @type {function(number):(function(Event):void)} */
function limit_input_to(n) {
  return /** @type {function(Event):void} */ (_limit_input_to(n));
}

/** @param {Function} func */
function iife(func) {
  func();
  return func;
}

/** @type {function(number, number, number, boolean, boolean, boolean):!Array<number, number, boolean>} */
function get_sticky_position(_x, _y, k, whole_out, preserve_x, preserve_y) {
  k *= CANVAS.fov;
  const s_x = WINDOW.width * 0.5 + (_x - CAMERA.x) * CANVAS.fov;
  const s_y = WINDOW.height * 0.5 + (_y - CAMERA.y) * CANVAS.fov;
  let t_x;
  let t_y;
  const l = whole_out ? 0 : k;
  let outside = false;
  if(preserve_x && (s_x < l || s_x > WINDOW.width - l)) {
    outside = true;
  }
  t_x = max(min(s_x, WINDOW.width - k), k);
  if(preserve_y && (s_y < l || s_y > WINDOW.height - l)) {
    outside = true;
  }
  t_y = max(min(s_y, WINDOW.height - k), k);
  return [(t_x - WINDOW.width * 0.5) / CANVAS.fov + CAMERA.x, (t_y - WINDOW.height * 0.5) / CANVAS.fov + CAMERA.y, outside];
}

/** @type {function(number, number, number):number} */
function lerp(num, to, by) {
  return num + (to - num) * by;
}

if(window["s"].length == 0) {
  status.innerHTML = "No servers found";
  reload();
  throw new Error(status.innerHTML);
}

var GAME_INIT = false;

/** @enum {number} */
const CONSTS = {
  server_opcode_area: 0,
  server_opcode_players: 1,
  server_opcode_balls: 2,
  server_opcode_chat: 3,
  server_opcode_minimap: 4,

  client_opcode_spawn: 0,
  client_opcode_movement: 1,
  client_opcode_chat: 2,
  client_opcode_name: 3,
  client_opcode_spec: 4,
  client_opcode_init: 5,

  max_players: 100,
  max_balls: 65535,
  max_chat_message_len: 128,
  max_chat_timestamps: 5,
  max_pings: 10,
  max_name_len: 16,

  default_area_id: 0,
  default_fov: 1.75,
  default_player_radius: 19,

  circle_precision: 64,

  minimap_size: 256 * 4,
  minimap_pad: 20,

  buffer_size_in: 1048576,
  buffer_size_out: 129,

  texture_id_tutorial: 0,
  texture_ids: 1,

  general_tooltip_id_spec_help: 0,
  general_tooltip_id_map_help: 1,

  tooltip_picked_server: 1 << 0,
  tooltip_try_map_editor: 1 << 1,
  tooltip_try_help: 1 << 2
};

const Tile_colors = new Uint32Array([0xddddddff, 0xaaaaaaff, 0x333333ff, 0xfedf78ff]);
const Tile_colors_str = Array.from(Tile_colors).map(r => "#" + r.toString(16));

const Ball_colors = new Uint32Array([0xffffffff, 0x808080ff, 0xfc46aaff, 0x008080ff, 0xff8e06ff, 0x3cdfffff, 0x663a82ff, 0x39e75fff]);
const Ball_colors_str = Array.from(Ball_colors).map(r => "#" + r.toString(16));

const buffer = new ArrayBuffer(CONSTS.max_balls << 4);
const u8 = new Uint8Array(buffer);
const f32 = new Float32Array(buffer);
const view = new DataView(buffer);

/*
 * M3
 */

/** @type {function(Float32Array):Float32Array} */
Float32Array.prototype.multiply = function(by) {
  const a00 = this[0 * 3 + 0];
  const a01 = this[0 * 3 + 1];
  const a02 = this[0 * 3 + 2];
  const a10 = this[1 * 3 + 0];
  const a11 = this[1 * 3 + 1];
  const a12 = this[1 * 3 + 2];
  const a20 = this[2 * 3 + 0];
  const a21 = this[2 * 3 + 1];
  const a22 = this[2 * 3 + 2];
  const b00 = by[0 * 3 + 0];
  const b01 = by[0 * 3 + 1];
  const b02 = by[0 * 3 + 2];
  const b10 = by[1 * 3 + 0];
  const b11 = by[1 * 3 + 1];
  const b12 = by[1 * 3 + 2];
  const b20 = by[2 * 3 + 0];
  const b21 = by[2 * 3 + 1];
  const b22 = by[2 * 3 + 2];

  return new Float32Array([
    b00 * a00 + b01 * a10 + b02 * a20,
    b00 * a01 + b01 * a11 + b02 * a21,
    b00 * a02 + b01 * a12 + b02 * a22,
    b10 * a00 + b11 * a10 + b12 * a20,
    b10 * a01 + b11 * a11 + b12 * a21,
    b10 * a02 + b11 * a12 + b12 * a22,
    b20 * a00 + b21 * a10 + b22 * a20,
    b20 * a01 + b21 * a11 + b22 * a21,
    b20 * a02 + b21 * a12 + b22 * a22
  ]);
};

/** @type {function(number, number):Float32Array} */
Float32Array.prototype.translate = function(x, y) {
  return this.multiply(new Float32Array([
    1, 0, 0,
    0, 1, 0,
    x, y, 1
  ]));
};

/** @type {function(number, number=):Float32Array} */
Float32Array.prototype.scale = function(w, h=w) {
  return this.multiply(new Float32Array([
    w, 0, 0,
    0, h, 0,
    0, 0, 1
  ]));
};

/** @type {function(number):Float32Array} */
Float32Array.prototype.rotate = function(r) {
  const c = cos(r);
  const s = sin(r);
  return this.multiply(new Float32Array([
    c,-s, 0,
    s, c, 0,
    0, 0, 1
  ]));
};

class M3 extends Float32Array {
  /**
   * @param {number} w
   * @param {number} h
   */
  constructor(w, h) {
    super([
      2 / w, 0     , 0,
      0    , -2 / h, 0,
      -1   , 1     , 1
    ]);
  }
}

/*
 * WEBGL
 */

const GL = WebGL2RenderingContext.prototype;
const GL_used = new Map();

class WebGL {
  /**
   * @param {!string | !WebGL2RenderingContext} id
   * @param {string} vertex
   * @param {string} fragment
   */
  constructor(id, vertex, fragment) {
    /** @type {WebGL2RenderingContext} */
    this.gl;
    if(id instanceof WebGL2RenderingContext) {
      this.gl = id;
    } else {
      this.gl = WebGL.get(id);
    }

    const str = "#version 300 es\n";
    this.program = this.create_program(str + vertex, str + "precision mediump float;\nout vec4 fragColor;\n" + fragment);

    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);

    /** @type {WebGLBuffer} */
    this.transform_buffer;
    
    this.u_matrix = this.gl.getUniformLocation(this.program, "u_matrix");
    /** @type {Float32Array} */
    this.matrix;
    this.num = 0;
  }
  /**
   * @param {string} id
   * @returns {!WebGL2RenderingContext}
   */
  static get(id) {
    const canvas = /** @type {HTMLCanvasElement} */ (id ? getElementById(id) : createElement("canvas"));
    const gl = /** @type {WebGL2RenderingContext} */ (canvas.getContext("webgl2", {
      premultipliedAlpha: false,
      failIfMajorPerformanceCaveat: false
    }));
    if(!gl) {
      status.innerHTML = "Your browser/device does not support WebGL2.";
      throw new Error("Your browser/device does not support WebGL2.");
    }
    return gl;
  }
  /** @param {WebGL2RenderingContext} gl */
  static pre_draw(gl) {
    if(gl.canvas.width != WINDOW.width) {
      gl.canvas.width = WINDOW.width;
    }
    if(gl.canvas.height != WINDOW.height) {
      gl.canvas.height = WINDOW.height;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    gl.enable(GL.DEPTH_TEST);
    gl.enable(GL.BLEND);
    gl.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
    gl.depthFunc(GL.LEQUAL);
  }
  /**
   * @param {number} type
   * @param {string} source
   * @returns {!WebGLShader}
   */
  create_shader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if(this.gl.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      return shader;
    }
    throw new Error(this.gl.getShaderInfoLog(shader));
  }
  /**
   * @param {string} vertex
   * @param {string} fragment
   * @returns {!WebGLProgram}
   */
  create_program(vertex, fragment) {
    const program = this.gl.createProgram();
    this.gl.attachShader(program, this.create_shader(GL.VERTEX_SHADER, vertex));
    this.gl.attachShader(program, this.create_shader(GL.FRAGMENT_SHADER, fragment));
    this.gl.linkProgram(program);
    if(this.gl.getProgramParameter(program, GL.LINK_STATUS)) {
      return program;
    }
    throw new Error(this.gl.getProgramInfoLog(program));
  }
  /**
   * @param {!ArrayBuffer} data
   * @param {number} len
   */
  set(data, len) {
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.transform_buffer);
    this.gl.bufferData(GL.ARRAY_BUFFER, data, GL.DYNAMIC_DRAW);
    this.num = len;
  }
  /** @param {number} len */
  prealloc(len) {
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.transform_buffer);
    this.gl.bufferData(GL.ARRAY_BUFFER, len, GL.DYNAMIC_DRAW);
    this.num = len;
  }
  /** @param {!ArrayBuffer} data */
  subset(data) {
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.transform_buffer);
    this.gl.bufferSubData(GL.ARRAY_BUFFER, 0, data);
  }
  use() {
    if(GL_used.get(this.gl) == this) {
      return;
    }
    GL_used.set(this.gl, this);

    this.gl.useProgram(this.program);
    this.gl.bindVertexArray(this.vao);
    
    if(this.u_matrix != null && this.matrix != null) {
      this.gl.uniformMatrix3fv(this.u_matrix, false, this.matrix);
    }
  }
  /**
   * @param {!Uint8Array | !HTMLCanvasElement} data
   * @param {number} w
   * @param {number} h
   * @returns {WebGLTexture}
   */
  create_texture_raw(data, w, h) {
    const tex = this.gl.createTexture();
    this.gl.bindTexture(GL.TEXTURE_2D, tex);
    this.gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, w, h, 0, GL.RGBA, GL.UNSIGNED_BYTE, data);
    this.gl.generateMipmap(GL.TEXTURE_2D);
    this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
    this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

    return tex;
  }
  /**
   * @param {WebGLUniformLocation} location
   * @param {number} value
   */
  uniform1f(location, value) {
    this.use();
    this.gl.uniform1f(location, value);
  }
}

/*
 * BACKGROUND WEBGL, BACKGROUND_WEBGL
 */

class Background_WebGL extends WebGL {
  /** @param {!string | !WebGL2RenderingContext} id */
  constructor(id) {
    super(id,
      `
      layout(location = 0) in vec2 a_position;
      layout(location = 1) in vec3 a_offset;

      uniform mat3 u_matrix;
      uniform sampler2D u_texture;
      uniform float u_light;

      out vec4 v_color;

      void main() {
        gl_Position = vec4((u_matrix * vec3(a_position + a_offset.xy, 1.0)).xy, 0.5, 1.0);
        v_color = vec4(texelFetch(u_texture, ivec2(int(a_offset.z), 0), 0).xyz * u_light, 1.0);
      }
      `,
      `
      in vec4 v_color;

      void main() {
        fragColor = v_color;
      }
    `);

    const v = 0.0375;
    const w = 1 - v;
    this.model_border = new Float32Array([
      0, 1,
      v, w,
      1, 1,
      w, w,
      1, 0,
      w, v,
      0, 0,
      v, v,
      0, 1,
      v, w
    ]);
    this.model = new Float32Array([
      v, v,
      w, v,
      v, w,
      w, w
    ]);

    this.u_light = this.gl.getUniformLocation(this.program, "u_light");
    
    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    this.gl.vertexAttribPointer(0, 2, GL.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(0);

    this.transform_buffer = this.gl.createBuffer();
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.transform_buffer);
    /* [
       offset      type
      100, 100,     10
    ] */
    this.gl.vertexAttribPointer(1, 3, GL.UNSIGNED_BYTE, false, 0, 0);

    this.gl.vertexAttribDivisor(1, 1);

    this.gl.enableVertexAttribArray(1);

    for(let i = 0; i < Tile_colors.length; ++i) {
      view.setUint32(i << 2, Tile_colors[i]);
    }
    this.texture = this.create_texture_raw(new Uint8Array(buffer.slice(0, Tile_colors.length << 2)), Tile_colors.length, 1);
  }
  draw() {
    this.use();

    this.gl.bindTexture(GL.TEXTURE_2D, this.texture);

    this.gl.uniform1f(this.u_light, 1.0);
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(GL.ARRAY_BUFFER, this.model, GL.DYNAMIC_DRAW);
    this.gl.drawArraysInstanced(GL.TRIANGLE_STRIP, 0, 4, this.num);

    this.gl.uniform1f(this.u_light, 0.8);
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(GL.ARRAY_BUFFER, this.model_border, GL.DYNAMIC_DRAW);
    this.gl.drawArraysInstanced(GL.TRIANGLE_STRIP, 0, 10, this.num);
  }
}

/*
 * CIRCLE WEBGL, CIRCLE_WEBGL
 */

class Circle_WebGL extends WebGL {
  /** @param {!string | !WebGL2RenderingContext} id */
  constructor(id) {
    super(id,
      `
      layout(location = 0) in vec2 a_position;
      layout(location = 1) in vec2 a_offset;
      layout(location = 2) in float a_scale;
      layout(location = 3) in vec4 a_color;

      uniform mat3 u_matrix;
      uniform int u_precision;

      flat out vec4 v_color;

      void main() {
        gl_Position = vec4((u_matrix * vec3(a_position * a_scale + a_offset, 1.0)).xy, -1.0 / a_scale, 1.0);
        if(gl_VertexID < u_precision) {
          v_color = a_color;
        } else {
          v_color = vec4(a_color.xyz * 0.8, a_color.w);
        }
      }
      `,
      `
      flat in vec4 v_color;

      void main() {
        fragColor = v_color;
      }
    `);

    this.u_precision = this.gl.getUniformLocation(this.program, "u_precision");

    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    this.gl.vertexAttribPointer(0, 2, GL.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(0);

    this.transform_buffer = this.gl.createBuffer();
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.transform_buffer);
    /* [
       offset      scale         color
      100, 100,     10,     255,255,255,255
    ] */
    this.gl.vertexAttribPointer(1, 2, GL.FLOAT, false, 16, 0);
    this.gl.vertexAttribPointer(2, 1, GL.FLOAT, false, 16, 8);
    this.gl.vertexAttribPointer(3, 4, GL.UNSIGNED_BYTE, true, 16, 12);

    this.gl.vertexAttribDivisor(1, 1);
    this.gl.vertexAttribDivisor(2, 1);
    this.gl.vertexAttribDivisor(3, 1);

    this.gl.enableVertexAttribArray(1);
    this.gl.enableVertexAttribArray(2);
    this.gl.enableVertexAttribArray(3);
  }
  /**
   * @param {boolean} has_fill
   * @param {boolean} has_stroke
   * @param {number} stroke_thickness
   * @param {boolean} bright_stroke
   * @returns 
   */
  draw(has_fill, has_stroke, stroke_thickness, bright_stroke) {
    if(!has_fill && !has_stroke) {
      return;
    }
    this.use();

    if(!has_stroke) {
      stroke_thickness = 0;
    }

    const data_len = ((CONSTS.circle_precision << 2) - 4) * has_fill + 4 + (CONSTS.circle_precision << 3) * has_stroke;
    const inc = Math.PI / CONSTS.circle_precision;
    let idx = 0;
    if(has_fill) {
      const s = sin(inc);
      const c = cos(inc);
      let x = 1 - stroke_thickness;
      let y = 0;
      f32[idx++] = x;
      f32[idx++] = y;
      for(let i = 1; i < CONSTS.circle_precision; ++i) {
        let x_new = x * c - y * s;
        y = x * s + y * c;
        x = x_new;
        f32[idx++] = x;
        f32[idx++] = y;
        f32[idx++] = x;
        f32[idx++] = -y;
      }
      f32[idx++] = -1 + stroke_thickness;
      f32[idx++] = 0;
    }

    const precision = CONSTS.circle_precision << 1;
    if(has_stroke) {
      const s = sin(-inc);
      const c = cos(-inc);
      if(!has_fill) {
        let x = -1 + stroke_thickness;
        let y = 0;
        let x_new = x * c - y * s;
        y = x * s + y * c;
        x = x_new;
        f32[idx++] = x;
        f32[idx++] = -y;
        f32[idx++] = -1 + stroke_thickness;
        f32[idx++] = 0;
      }
      let x = -1;
      let y = 0;
      f32[idx++] = x;
      f32[idx++] = y;
      for(let i = 0; i < precision - 1; ++i) {
        let x_new = x * c - y * s;
        y = x * s + y * c;
        x = x_new;
        f32[idx++] = x * (1 - stroke_thickness);
        f32[idx++] = y * (1 - stroke_thickness);
        f32[idx++] = x;
        f32[idx++] = y;
      }
      f32[idx++] = -1;
      f32[idx++] = 0;
    }
    console.assert(idx == data_len);

    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(GL.ARRAY_BUFFER, f32.subarray(0, data_len), GL.DYNAMIC_DRAW);
    let p;
    if(has_fill) {
      p = precision;
    } else if(bright_stroke) {
      p = (precision << 1) + 2;
    } else {
      p = 0;
    }
    this.gl.uniform1i(this.u_precision, p);
    this.gl.drawArraysInstanced(GL.TRIANGLE_STRIP, 0, data_len >> 1, this.num);
  }
}

/*
 * TEX WEBGL, TEX_WEBGL
 */

/**
 * @typedef {{
 *           tex: WebGLTexture,
 *           w: number,
 *           h: number,
 *           size: number,
 *           color: string,
 *           date: number
 *          }}
 */
var Tex;

/**
 * @typedef {{
 *           tex: WebGLTexture,
 *           w: number,
 *           h: number
 *          }}
 */
var TexMin;

class Tex_WebGL extends WebGL {
  /** @param {!string | !WebGL2RenderingContext} id */
  constructor(id) {
    super(id,
      `
      layout(location = 0) in vec2  a_position;
      layout(location = 1) in vec2  a_texcoord;
      layout(location = 2) in float a_depth;
      layout(location = 3) in mat3  a_matrix;

      out vec2 v_texcoord;
      flat out int v_id;

      void main() {
        gl_Position = vec4((a_matrix * vec3(a_position, 1.0)).xy, -1.0 / a_depth, 1.0);
        v_texcoord = a_texcoord;
        v_id = gl_InstanceID;
      }
      `,
      `
      in vec2 v_texcoord;
      flat in int v_id;

      uniform sampler2D u_texture[16];

      void main() {
        switch(v_id) {
          ${[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(r => `case ${r}: fragColor = texture(u_texture[${r}], v_texcoord); break;\n`).join("")}
        }
      }
    `);

    this.gl.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);



    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(GL.ARRAY_BUFFER, new Float32Array([
      -1,  1,     0, 1,
      -1, -1,     0, 0,
       1,  1,     1, 1,
       1, -1,     1, 0,
    ]), GL.STATIC_DRAW);

    this.gl.vertexAttribPointer(0, 2, GL.FLOAT, false, 16, 0);
    this.gl.vertexAttribPointer(1, 2, GL.FLOAT, false, 16, 8);

    this.gl.enableVertexAttribArray(0);
    this.gl.enableVertexAttribArray(1);



    this.transform_buffer = this.gl.createBuffer();
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.transform_buffer);

    this.gl.vertexAttribPointer(2, 1, GL.FLOAT, false, 40, 0);
    for(let i = 0; i < 3; ++i) {
      this.gl.vertexAttribPointer(3 + i, 3, GL.FLOAT, false, 40, 4 + i * 4 * 3);
    }

    this.gl.vertexAttribDivisor(2, 1);
    for(let i = 0; i < 3; ++i) {
      this.gl.vertexAttribDivisor(3 + i, 1);
    }

    this.gl.enableVertexAttribArray(2);
    for(let i = 0; i < 3; ++i) {
      this.gl.enableVertexAttribArray(3 + i);
    }

    this.prealloc(40 * 16);

    this.drawing = false;

    /**
     * @type {!Array<WebGLTexture>}
     */
    this.textures = new Array(16);

    this.gl.useProgram(this.program);
    for(let i = 0; i < 16; ++i) {
      this.gl.uniform1i(this.gl.getUniformLocation(this.program, `u_texture[${i}]`), i);
    }


    /** @type {!Array<Object<string, Tex>>} */
    this.cache = new Array(CONSTS.texture_ids);
    for(let i = 0; i < CONSTS.texture_ids; ++i) {
      this.cache[i] = {};
    }

    setInterval(this.purge.bind(this), 1000);


    this.buffer = new ArrayBuffer(40 * 16);
    this.view = new DataView(this.buffer);


    /** @type {!Array<Tex>} */
    this.numbers = new Array(10);
    for(let i = 0; i < 10; ++i) {
      this.numbers[i] = this.create_cacheless(i.toString(), CONSTS.default_player_radius, "#f00");
    }
  }
  purge() {
    const now = performance.now();
    for(let i = 0; i < CONSTS.texture_ids; ++i) {
      for(const combined in this.cache[i]) {
        const tex = this.cache[i][combined];
        if(now - tex.date > 1000) {
          this.delete(tex);
          delete this.cache[i][combined];
        }
      }
    }
  }
  /**
   * @param {Tex | TexMin} param0
   */
  delete({ tex }) {
    this.gl.deleteTexture(tex);
  }
  /**
   * @param {string} text
   * @param {number} size
   * @param {string} color
   * @returns {Tex}
   */
  create_cacheless(text, size, color) {
    size *= fov_max;

    const canvas = /** @type {HTMLCanvasElement} */ (createElement("canvas"));
    const ctx = canvas.getContext("2d");
    ctx.font = `700 ${size}px Ubuntu`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = color;
    const info = ctx.measureText(text);
    const w = Math.ceil(info.width);
    const h = Math.ceil(info.actualBoundingBoxAscent + info.actualBoundingBoxDescent);
    canvas.width = w;
    canvas.height = h;
    ctx.font = `700 ${size}px Ubuntu`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = color;
    ctx.fillText(text, info.actualBoundingBoxLeft, info.actualBoundingBoxAscent);

    const texture = this.create_texture_raw(canvas, w, h);
    return { tex: texture, w: w * 0.5 / fov_max, h: h * 0.5 / fov_max, size: size / fov_max, color, date: performance.now() };
  }
  /**
   * @param {string} text
   * @param {number} size
   * @param {string} color
   * @param {number} tex_id
   * @returns {Tex}
   */
  create(text, size, color, tex_id) {
    const combined = "EVADING" + text;
    const cached = this.cache[tex_id][combined];
    if(cached !== undefined) {
      if(abs(cached.size - size) < 0.01 && cached.color == color) {
        cached.date = performance.now();
        return cached;
      } else {
        this.delete(cached);
        delete this.cache[tex_id][combined];
      }
    }

    const tex = this.create_cacheless(text, size, color);
    this.cache[tex_id][combined] = tex;
    return tex;
  }
  /**
   * @param {Tex | TexMin} param0
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  draw({ tex, w, h }, x, y, z) {
    if(!this.drawing) {
      this.num = 0;
      this.drawing = true;
    }

    this.textures[this.num] = tex;

    const matrix = this.matrix.translate(x, y).scale(w, h);

    this.view.setFloat32(this.num * 40, z, true);
    for(let _x = 0; _x < 3; ++_x) {
      for(let _y = 0; _y < 3; ++_y) {
        this.view.setFloat32(this.num * 40 + 4 + 4 * (_x * 3 + _y), matrix[_x * 3 + _y], true);
      }
    }

    if(++this.num == 16) {
      this.finish();
    }
  }
  /**
   * @param {number} number
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  draw_player_death_counter(number, x, y, z) {
    /** @type {!Array<number>} */
    let nums = [];
    if(number == 0) {
      nums = [0];
    } else {
      let num = number;
      while(num) {
        nums[nums.length] = num % 10;
        num = Math.floor(num / 10);
      }
    }
    const x_left = x - (nums.length - 1) * CONSTS.default_player_radius * 0.3;
    for(let i = nums.length - 1; i >= 0; --i) {
      this.draw(this.numbers[nums[i]], x_left + (nums.length - i - 1) * CONSTS.default_player_radius * 0.6, y, z);
    }
  }
  finish() {
    this.drawing = false;
    if(this.num == 0) return;
    this.use();
    this.subset(this.buffer.slice(0, this.num * 40));
    for(let i = 0; i < this.num; ++i) {
      this.gl.activeTexture(GL.TEXTURE0 + i);
      this.gl.bindTexture(GL.TEXTURE_2D, this.textures[i]);
    }
    this.gl.drawArraysInstanced(GL.TRIANGLE_STRIP, 0, 4, this.num);
    this.num = 0;
    this.gl.activeTexture(GL.TEXTURE0);
  }
}

/*
 * MINIMAP WEBGL, MINIMAP_WEBGL
 */

class Minimap_WebGL extends WebGL {
  /** @param {!string | !WebGL2RenderingContext} id */
  constructor(id) {
    super(id,
      `
      layout(location = 0) in vec2 a_position;
      layout(location = 1) in vec2 a_offset;

      uniform mat3 u_matrix;

      void main() {
        gl_Position = vec4((u_matrix * vec3(a_position + a_offset, 1.0)).xy, -1.0, 1.0);
      }
      `,
      `
      void main() {
        fragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    `);

    this.vertical_model_data = new Float32Array([
      0, 0,
      0, 1
    ]);
    this.horizontal_model_data = new Float32Array([
      0, 0,
      1, 0
    ]);
    
    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    this.gl.vertexAttribPointer(0, 2, GL.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(0);

    this.transform_buffer = this.gl.createBuffer();
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.transform_buffer);
    /* [
       offset
      100, 100
    ] */
    this.gl.vertexAttribPointer(1, 2, GL.BYTE, false, 0, 0);
    this.gl.vertexAttribDivisor(1, 1);
    this.gl.enableVertexAttribArray(1);
  }
  draw_vertical() {
    this.use();

    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(GL.ARRAY_BUFFER, this.vertical_model_data, GL.DYNAMIC_DRAW);
    this.gl.drawArraysInstanced(GL.LINES, 0, 2, this.num);
  }
  draw_horizontal() {
    this.use();

    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(GL.ARRAY_BUFFER, this.horizontal_model_data, GL.DYNAMIC_DRAW);
    this.gl.drawArraysInstanced(GL.LINES, 0, 2, this.num);
  }
}

/*
 * ARROW WEBGL, ARROW_WEBGL
 */

class Arrow_WebGL extends WebGL {
  /** @param {!string | !WebGL2RenderingContext} id */
  constructor(id) {
    super(id,
      `
      layout(location = 0) in vec2  a_position;
      layout(location = 1) in vec2  a_offset;
      layout(location = 2) in vec2  a_angle;
      layout(location = 3) in float a_depth;

      uniform mat3 u_matrix;
      uniform float u_size;
      uniform float u_dist;

      void main() {
        mat3 rotation;
        rotation[0] = vec3(a_angle[0], -a_angle[1], 0);
        rotation[1] = vec3(a_angle[1], a_angle[0], 0);
        rotation[2] = vec3(0, 0, 1);
        vec2 pos = ((vec3(a_position, 1.0) * rotation).xy + a_angle * u_size * u_dist) * a_depth * u_size * 0.5;
        pos = (u_matrix * vec3(pos + a_offset + a_angle * a_depth * 1.2, 1.0)).xy;
        gl_Position = vec4(pos, -1.0 / a_depth, 1.0);
      }
      `,
      `
      uniform float u_opacity;

      void main() {
        fragColor = vec4(0.0, 0.0, 0.0, u_opacity);
      }
    `);
    
    this.u_size = this.gl.getUniformLocation(this.program, "u_size");
    this.u_dist = this.gl.getUniformLocation(this.program, "u_dist");
    this.u_opacity = this.gl.getUniformLocation(this.program, "u_opacity");

    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(GL.ARRAY_BUFFER, new Float32Array([
      -0.8660254037844386, -1,
      -0.8660254037844386,  1,
       0.8660254037844386,  0
    ]), GL.STATIC_DRAW);
    this.gl.vertexAttribPointer(0, 2, GL.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(0);

    this.transform_buffer = this.gl.createBuffer();
    this.gl.bindBuffer(GL.ARRAY_BUFFER, this.transform_buffer);
    /* [
       offset          angle          depth
      100, 100,    cos(a), sin(a),      2
    ] */
    this.gl.vertexAttribPointer(1, 2, GL.FLOAT, false, 20, 0);
    this.gl.vertexAttribPointer(2, 2, GL.FLOAT, false, 20, 8);
    this.gl.vertexAttribPointer(3, 1, GL.FLOAT, false, 20, 16);

    this.gl.vertexAttribDivisor(1, 1);
    this.gl.vertexAttribDivisor(2, 1);
    this.gl.vertexAttribDivisor(3, 1);

    this.gl.enableVertexAttribArray(1);
    this.gl.enableVertexAttribArray(2);
    this.gl.enableVertexAttribArray(3);
  }
  size() {
    this.uniform1f(this.u_size, settings["target_arrow_size"]["value"]);
  }
  dist() {
    this.uniform1f(this.u_dist, settings["target_arrow_dist"]["value"]);
  }
  opacity() {
    this.uniform1f(this.u_opacity, settings["target_arrow_opacity"]["value"] / 100);
  }
  draw() {
    this.use();
    
    this.gl.drawArraysInstanced(GL.TRIANGLE_STRIP, 0, 3, this.num);
  }
}

/*
 * TOGGLER
 */

class Toggler {
  constructor() {
    /** @type {function():void} */
    this._on;
    /** @type {function():boolean} */
    this._on_rule = function() { return true; };
    /** @type {function():void} */
    this._off;
    /** @type {function():boolean} */
    this._off_rule = function() { return true; };
    /** @type {!Array<!Array<number | boolean>>} */
    this._states;
    /** @type {number | boolean} */
    this._last_state;
    /** @type {boolean} */
    this._repeat;
  }
  /**
   * @param {function():void} on
   * @param {function():void} off
   * @param {boolean} state
   * @param {boolean} init_needed
   * @param {boolean} repeat
   */
  toggler_init(on, off, state, init_needed = true, repeat = false) {
    [this._on, this._off, this._states, this._repeat] = [on, off, [[0, state]], repeat];
    if(init_needed) {
      this._last_state = !state;
      this.toggler_update();
    } else {
      this._last_state = state;
    }
  }
  toggler_on(cb) {
    this._on_rule = cb;
  }
  toggler_off(cb) {
    this._off_rule = cb;
  }
  toggler_update() {
    if(!this._repeat && this._states[0][1] == this._last_state) {
      return;
    }
    this._last_state = this._states[0][1];
    if(this._last_state) {
      if(this._on_rule()) {
        this._on();
      }
    } else {
      if(this._off_rule()) {
        this._off();
      }
    }
  }
  /**
   * @param {number} prio
   * @param {boolean} state
   */
  toggler_mod(prio, state) {
    const idx = this._states.findIndex(r => r[0] == prio);
    if(idx == -1) {
      this._states.push([prio, state]);
      this._states.sort((a, b) => b[0] - a[0]);
    } else {
      this._states[idx][1] = state;
    }
    this.toggler_update();
  }
  /** @param {number} prio */
  toggler_del(prio) {
    const idx = this._states.findIndex(r => r[0] == prio);
    if(idx == -1) return;
    this._states.splice(idx, 1);
    this.toggler_update();
  }
  /** @param {number} prio */
  toggler_check(prio) {
    if(prio == this.toggler_prio) {
      return this.toggler_state;
    }
    return prio >= this.toggler_prio;
  }
  /** @param {number} prio */
  toggler_toggle(prio) {
    const idx = this._states.findIndex(r => r[0] == prio);
    if(idx == -1) return;
    this._states[idx][1] = !this._states[idx][1];
    this.toggler_update();
  }
  get toggler_prio() {
    return this._states[0][0];
  }
  get toggler_state() {
    return this._states[0][1];
  }
}

/*
 * MOVEMENT
 */

class Movement extends Toggler {
  constructor() {
    super();
    this.toggler_init(this.send.bind(this), this.send.bind(this), true, false);

    this.mouse_movement = false;
    this.mult = 1;
    this.packet = new Uint8Array(0);

    this.up = 0;
    this.down = 0;
    this.left = 0;
    this.right = 0;
  }
  clear() {
    this.reset();
    this.packet = new Uint8Array(0);
  }
  reset() {
    this.mouse_movement = false;
    this.mult = 1;
  }
  upd_mult(mult) {
    this.mult = mult;
  }
  get_mult() {
    return this.mult;
  }
  send() {
    if(!GAME_INIT || !CLIENT.in_game) {
      return;
    }
    if(this.toggler_state) {
      PACKET_OUT.create_movement_packet(this.mult);
    } else {
      PACKET_OUT.create_movement_packet(0);
    }
    if(PACKET_OUT.len == this.packet.length) {
      let ok = 1;
      for(let i = 0; i < PACKET_OUT.len; ++i) {
        if(PACKET_OUT.u8[i] != this.packet[i]) {
          ok = 0;
          break;
        }
      }
      if(ok) {
        return;
      }
    }
    SOCKET.send();
  }
}

/*
 * MENU
 */

class Menu extends Toggler {
  constructor() {
    super();

    this.div = /** @type {HTMLDivElement} */ (getElementById("ID_menu"));
    this.toggler_off(function() {
      if(this.toggler_prio != 99) {
        return CLIENT.in_game || CLIENT.spectating;
      } else {
        return true;
      }
    });
    this.toggler_init(function() {
      MOVEMENT.toggler_mod(1, false);
      this.div.style.display = "block";
    }.bind(this), function() {
      this.div.style.display = "none";
      MOVEMENT.toggler_del(1);
    }.bind(this), true);

    this.name = /** @type {HTMLInputElement} */ (getElementById("ID_name"));

    this.select_server = /** @type {HTMLSelectElement} */ (getElementById("ID_select_serv"));
    /**
     * @type {HTMLOptionElement}
     */
    this.selected_server;
    /** @type {!Array<!Array>} */
    this.servers = window["s"];

    this.ping = /** @type {HTMLHeadingElement} */ (getElementById("ID_ping"));
    this.ping_update();

    this.play = /** @type {HTMLButtonElement} */ (getElementById("ID_play"));
    this.spec = /** @type {HTMLButtonElement} */ (getElementById("ID_spec"));
    /**
     * @type {Element}
     */
    this.general_tooltip = null;
    this.general_tooltip_text = "";
    this.general_tooltip_id = -1;
    this.spectating = /** @type {HTMLHeadingElement} */ (getElementById("ID_spectating"));
    this.refresh = /** @type {HTMLButtonElement} */ (getElementById("ID_refresh"));
    
    const general_tooltip = /** @type {HTMLHeadingElement} */ (getElementById("ID_general_tooltip"));
    general_tooltip.parentElement.removeChild(general_tooltip);

    this.refresh.onclick = reload_now;

    this.name.onkeypress = this.name.onpaste = limit_input_to(CONSTS.max_name_len);
    this.name.onchange = /** @this {HTMLInputElement} */ function() {
      CLIENT.sent_name = false;
      setItem("name", this.value);
    };

    this.int = -1;

    const cached_name = getItem("name");
    if(typeof cached_name == "string" && new TextEncoder().encode(cached_name).length <= CONSTS.max_name_len) {
      this.name.value = cached_name;
    }

    this.play.onclick = function() {
      PACKET_OUT.create_spawn_packet();
      SOCKET.send();
    };

    this.spec.onclick = function() {
      PACKET_OUT.create_spec_packet(0);
      SOCKET.send();
    };
  }
  init() {
    this.init_server_list();

    this.int = setInterval(function() {
      fetch("servers.json", { cache: "no-store" }).then(r => r.json()).then(function(res) {
        MENU.servers = res;
        MENU.init_server_list();
      });
    }, 5000);
  }
  get_name() {
    return new TextEncoder().encode(this.name.value);
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
  get_general_tooltip_text() {
    switch(this.general_tooltip_id) {
      case CONSTS.general_tooltip_id_spec_help: {
        return `Press ${keybinds["spec_prev"]} or ${keybinds["spec_next"]} to switch between players<br><br>Type "/menu" in chat to return to the main menu`;
      }
      /*case CONSTS.general_tooltip_id_map_help: {
        return `Press ${keybinds["map"]} to quit the map mode<br><br>Move with ${keybinds["up"]} ${keybinds["left"]} ${keybinds["down"]} ${keybinds["right"]}<br><br>Scroll out to see more of the map`;
      }*/
    }
  }
  set_general_tooltip(to) {
    this.general_tooltip_id = to;
    this.general_tooltip_text = this.get_general_tooltip_text();
    if(this.general_tooltip != null) {
      this.general_tooltip.innerHTML = this.general_tooltip_text;
    }
  }
  maybe_set_general_tooltip(to) {
    if(this.general_tooltip_id == to) {
      this.set_general_tooltip(to);
    }
  }
  show_general_tooltip() {
    const h5 = /** @type {HTMLHeadingElement} */ (createElement("h5"));
    h5.id = "ID_general_tooltip";
    h5.innerHTML = this.general_tooltip_text;
    setTimeout(function() {
      h5.style.opacity = 0;
    }, 5000);
    h5.addEventListener("transitionend", this.hide_general_tooltip.bind(this));
    document.body.insertBefore(h5, MENU.div);
    this.general_tooltip = h5;
  }
  hide_general_tooltip() {
    if(this.general_tooltip != null) {
      this.general_tooltip.parentElement.removeChild(this.general_tooltip);
      this.general_tooltip = null;
      this.general_tooltip_id = -1;
    }
  }
  can_spectate_state(on) {
    this.spec.disabled = on;
  }
  ping_update() {
    this.ping.style.display = settings["show_ping"] ? "block" : "none";
  }
  init_server_list() {
    this.select_server.innerHTML = "";
    /** @type {number} */
    let count;
    /** @type {number} */
    let max;
    /** @type {string} */
    let ip;
    for([count, max, ip] of this.servers) {
      const option = /** @type {HTMLOptionElement} */ (createElement("option"));
      option.value = ip;
      if(ip == SOCKET.ws.url) {
        option.selected = true;
        option.disabled = true;
        this.selected_server = option;
      }
      if(count >= max) {
        option.disabled = true;
      }
      const server_name = ip.get_server_name();
      option.innerHTML = server_name[0].toUpperCase() + server_name.substring(1) + ` (${count}/${max})`;
      this.select_server.appendChild(option);
    }
    this.select_server.onchange = this.select_server_onchange.bind(this);
  }
  async select_server_onchange() {
    this.selected_server.disabled = false;
    const old = this.selected_server;
    this.selected_server = this.select_server.selectedOptions[0];
    this.selected_server.disabled = true;
    CLIENT.onconnecting();
    /** @type {function(string):void} */
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
  }
}

/*
 * SOCKET
 */

class Socket {
  constructor() {
    /** @type {WebSocket} */
    this.ws = null;

    this.once = false;

    this.game_init = false;

    /** @type {Array<number>} */
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
    this.ws.onmessage = function(x) {
      x = new Uint8Array(x.data);
      try {
        this.message(x);
      } catch(err) {
        console.log(PACKET_IN.idx, PACKET_IN.len, err);
        console.log(Array.from(x).map(r => r.toString(16).padStart(2, "0")).join(" "));
      }
    }.bind(this);
    this.ws.onclose = this.close.bind(this);

    PACKET_OUT.create_init_packet();
    this.send();

    this.open();
  }
  open() {
    this.once = true;
    CHAT.clear();
    //CAMERA.unblock();
    PLAYERS.clear();
    BALLS.clear();
    CANVAS.clear();
    BACKGROUND.clear();
    MOVEMENT.clear();
    CLIENT.clear();
  }
  message(x) {
    PACKET_IN.set(x);
    if(PACKET_IN.len == 0) {
      this.onping();
      return;
    }
    const id = PACKET_IN.byte();
    let updated_id = false;
    if(id != CLIENT.id) {
      CLIENT.id = id;
      updated_id = true;
    }
    const info = PACKET_IN.byte();
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
    const reset_camera = info & 0x08;
    this.updates[0] = this.updates[1];
    this.updates[1] = performance.now();
    PLAYERS.ip();
    CAMERA.ip();
    const area_id = PACKET_IN.byte();
    let area_updated;
    if(area_id != BACKGROUND.area_id) {
      BACKGROUND.update(area_id);
      BALLS.clear();
      area_updated = true;
    } else {
      BALLS.ip();
      area_updated = false;
    }
    while(PACKET_IN.idx < PACKET_IN.len) {
      switch(PACKET_IN.byte()) {
        case CONSTS.server_opcode_players: {
          PLAYERS.parse();
          break;
        }
        case CONSTS.server_opcode_balls: {
          BALLS.parse(area_updated);
          break;
        }
        case CONSTS.server_opcode_chat: {
          CHAT.parse();
          break;
        }
        default: throw new Error();
      }
    }
    if(PACKET_IN.idx > PACKET_IN.len) {
      throw new Error();
    }
    if(CLIENT.id == 255) {
      CAMERA.instant_move(0, BACKGROUND.width * 0.5, BACKGROUND.height * 0.5);
    } else if(reset_camera || updated_id) {
      PLAYERS.ip_one(CLIENT.id);
      CAMERA.instant_move(0, PLAYERS.arr[CLIENT.id].x2, PLAYERS.arr[CLIENT.id].y2);
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
    this.ws.send(new ArrayBuffer(0));
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
    this.ws.send(PACKET_OUT.buffer.slice(0, PACKET_OUT.len));
  }
}

/*
 * LATENCY SOCKET, LATENCY_SOCKET
 */

class Latency_socket extends Socket {
  /**
   * @param {string} ip
   * @param {function(string):void} resolver
   * @param {number} pings_to_finish
   */
  constructor(ip, resolver, pings_to_finish=8) {
    super();

    this.packets = 0;
    this.ip = ip;
    this.resolver = resolver;
    this.pings_to_finish = pings_to_finish;
    this.code = 0;

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
  /** @param {CloseEvent} ev */
  close(ev) {
    this.code = ev.code;
    if(this.code != 4000) {
      setTimeout(this.connect.bind(this), 100);
    }
  }
}

/*
 * PACKET, PACKET IN, PACKET_IN, PACKET OUT, PACKET_OUT
 */

class Packet {
  /** @param {number} size */
  constructor(size) {
    this.buffer = new ArrayBuffer(size);
    this.u8 = new Uint8Array(this.buffer);
    this.view = new DataView(this.buffer);
    this.len = 0;
    this.idx = 0;
  }
  /** @param {!Uint8Array} arr */
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
  /** @param {number} len */
  string(len) {
    const ret = new TextDecoder().decode(this.u8.subarray(this.idx, this.idx + len));
    this.idx += len;
    return ret;
  }
  create_init_packet() {
    this.u8[0] = CONSTS.client_opcode_init;
    if(token.length == 0) {
      this.len = 1;
    } else {
      this.u8.set(token, 1);
      this.len = token.length + 1;
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
  /** @param {number} mult */
  create_movement_packet(mult) {
    let angle = 0;
    let distance = 0;
    if(!MOVEMENT.mouse_movement) {
      if(MOVEMENT.up != MOVEMENT.down || MOVEMENT.left != MOVEMENT.right) {
        angle = Math.atan2(MOVEMENT.down - MOVEMENT.up, MOVEMENT.right - MOVEMENT.left);
        distance = 160 * WINDOW.devicePixelRatio;
      }
    } else {
      const x = WINDOW.mouse[0] - WINDOW.width * 0.5;
      const y = WINDOW.mouse[1] - WINDOW.height * 0.5;
      angle = Math.atan2(y, x);
      distance = Math.hypot(x, y) / CANVAS.fov;
    }
    this.u8[0] = CONSTS.client_opcode_movement;
    this.view.setFloat32(1, angle, true);
    if(distance >= 160 * WINDOW.devicePixelRatio) {
      this.u8[5] = 255;
    } else {
      this.u8[5] = distance * 1.59375 / WINDOW.devicePixelRatio;
    }
    this.u8[5] *= mult;
    this.len = 6;
  }
  /** @param {!Uint8Array} chat */
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
    this.size = 0;

    /** @type {TexMin} */
    this.tex;
    this.has_tex = false;
  }
  init() {
    if(this.has_tex) {
      CANVAS.t_gl.delete(this.tex);
    }

    this.size = settings["death_arrow_size"]["value"];
    const canvas = /** @type {HTMLCanvasElement} */ (createElement("canvas"));
    canvas.width = canvas.height = Math.ceil(this.size * fov_max);
    const h = canvas.width * 0.5;
    const k = canvas.width;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(h + k * 0.45, h);
    ctx.lineTo(h - k * 0.225, h - k * 0.675 / Math.sqrt(3));
    ctx.lineTo(h - k * 0.225, h + k * 0.675 / Math.sqrt(3));
    ctx.closePath();
    ctx.fillStyle = "#bbbbbbb0";
    ctx.fill();
    ctx.lineWidth = h * 0.1;
    ctx.strokeStyle = "#f00";
    ctx.stroke();

    this.tex = { tex: CANVAS.t_gl.create_texture_raw(canvas, k, k), w: h / fov_max, h: h / fov_max };
  }
}

/*
 * CHAT
 */

class Chat extends Toggler {
  constructor() {
    super();

    this.messages = /** @type {HTMLDivElement} */ (getElementById("ID_messages"));
    this.send = /** @type {HTMLDivElement}*/ (getElementById("ID_send"));
    this.sendmsg = /** @type {HTMLInputElement}*/ (getElementById("ID_sendmsg"));

    this.toggler_init(function() {
      this.messages.style.display = "flex";
      this.send.style.display = "flex";
    }.bind(this), function() {
      this.messages.style.display = "none";
      this.send.style.display = "none";
    }.bind(this), true);

    /** @type {!Array<number>} */
    this.timestamps = new Array(CONSTS.max_chat_timestamps).fill(0);
    this.timestamps_idx = 0;

    this.limit = limit_input_to(CONSTS.max_chat_message_len);

    this.len = 0;

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
            this.new(null, "/spectate /s => start/stop spectating", true);
            this.new(null, ">", true);
            this.post_send();
            TOOLTIPS.chat();
            return;
          }
          case "/c":
          case "/clear": {
            this.messages.innerHTML = "";
            this.len = 0;
            this.post_send();
            return;
          }
          case "/r":
          case "/respawn": {
            PACKET_OUT.create_spawn_packet();
            SOCKET.send();
            this.post_send();
            return;
          }
          default: break;
        }
        const encoded = new TextEncoder().encode(val);
        if(encoded.length > 0) {
          PACKET_OUT.create_chat_packet(encoded);
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
        } else {
          this.post_send();
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

    this.old = "Press enter to chat";
    this.total_message_length = 0;

    this.enable();
  }
  disable(msg) {
    this.old = this.sendmsg.placeholder;
    this.sendmsg.placeholder = msg;
    this.sendmsg.disabled = true;
    this.sendmsg.value = "";
    CANVAS.gl.canvas.focus();
  }
  enable() {
    if(this.timer != -1) {
      clearTimeout(this.timer);
      this.timer = -1;
    }
    this.sendmsg.disabled = false;
    this.sendmsg.placeholder = this.old;
  }
  focus(e) {
    this.sendmsg.focus();
  }
  post_send() {
    this.sendmsg.value = "";
    this.sendmsg.blur();
    CANVAS.gl.canvas.focus();
  }
  new(author, msg, no_author = false) {
    const p = /** @type {HTMLParagraphElement} */ (createElement("p"));
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
  settings_toggle() {
    if(settings["chat_on"]) {
      this.toggler_mod(0, true);
    } else {
      this.toggler_mod(0, false);
    }
  }
  parse() {
    const count = PACKET_IN.byte();
    for(let i = 0; i < count; ++i) {
      const name_len = PACKET_IN.byte();
      const name = new TextDecoder().decode(PACKET_IN.u8.subarray(PACKET_IN.idx, PACKET_IN.idx + name_len));
      PACKET_IN.idx += name_len;
      const msg_len = PACKET_IN.byte();
      this.new(name, new TextDecoder().decode(PACKET_IN.u8.subarray(PACKET_IN.idx, PACKET_IN.idx + msg_len)));
      PACKET_IN.idx += msg_len;
    }
  }
}

/*
 * CAMERA
 */

class Camera extends Toggler {
  constructor() {
    super();
    this.toggler_init(function(){}, function(){}, true);

    this.x = 0;
    this.y = 0;
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
  }
  move(prio, x, y) {
    if(!this.toggler_check(prio)) return;
    this.x2 = x;
    this.y2 = y;
  }
  move_x(prio, x) {
    if(!this.toggler_check(prio)) return;
    this.x2 = x;
  }
  move_y(prio, y) {
    if(!this.toggler_check(prio)) return;
    this.y2 = y;
  }
  move_by(prio, x, y, by) {
    if(!this.toggler_check(prio)) return;
    this.x2 = lerp(this.x2, x, by);
    this.y2 = lerp(this.y2, y, by);
  }
  instant_move(prio, x, y) {
    if(!this.toggler_check(prio)) return;
    this.x2 = x;
    this.y2 = y;
    this.ip();
  }
  ip() {
    this.x1 = this.x2;
    this.y1 = this.y2;
  }
}

/*
 * PLAYERS
 */

class Players {
  constructor() {
    /**
     * @type {!Array<{
     *         x: number,
     *         y: number,
     *         r: number,
     *         x1: number,
     *         y1: number,
     *         r1: number,
     *         x2: number,
     *         y2: number,
     *         r2: number,
     *         name: string,
     *         dead: boolean,
     *         death_counter: number,
     *         name_tex: Tex,
     *         name_y: number
     *       }>}
     */
    this.arr = new Array(CONSTS.max_players);
    this.len = 0;
  }
  clear() {
    for(let i = 0; this.len; ++i) {
      if(this.arr[i] == undefined) continue;
      CANVAS.t_gl.delete(this.arr[i].name_tex);
      delete this.arr[i];
      --this.len;
    }
  }
  ip() {
    let to_go = this.len;
    for(let i = 0; to_go; ++i) {
      if(this.arr[i] == undefined) continue;
      this.arr[i].x1 = this.arr[i].x2;
      this.arr[i].y1 = this.arr[i].y2;
      this.arr[i].r1 = this.arr[i].r2;
      --to_go;
    }
  }
  ip_one(i) {
    this.arr[i].x1 = this.arr[i].x2;
    this.arr[i].y1 = this.arr[i].y2;
    this.arr[i].r1 = this.arr[i].r2;
  }
  parse() {
    const count = PACKET_IN.byte();
    for(let i = 0; i < count; ++i) {
      const id = PACKET_IN.byte();
      if(this.arr[id] == undefined) {
        const x2 = PACKET_IN.float();
        const y2 = PACKET_IN.float();
        const r2 = PACKET_IN.float();
        const name_len = PACKET_IN.byte();
        const name = PACKET_IN.string(name_len);
        const dead = PACKET_IN.byte();
        let death_counter = 0;
        if(dead) {
          death_counter = PACKET_IN.byte();
        }
        const chat_len = PACKET_IN.byte();
        if(chat_len > 0) {
          CHAT.new(name, PACKET_IN.string(chat_len));
        }
        const name_tex = CANVAS.t_gl.create_cacheless(name, r2 * 0.666, "#00000080");
        this.arr[id] = { x: 0, y: 0, r: 0, x1: x2, x2, y1: y2, y2, r1: r2, r2, name, dead, death_counter, name_tex, name_y: 0 };
        if(CLIENT.id == id) {
          CAMERA.move(0, x2, y2);
        }
        ++this.len;
      } else {
        let field = PACKET_IN.byte();
        if(field == 0) {
          if(this.arr[id] == undefined) {
            throw new Error("trying to delete an unknown player entity id " + id);
          }
          CANVAS.t_gl.delete(this.arr[id].name_tex);
          delete this.arr[id];
          --this.len;
          continue;
        }
        do {
          switch(field) {
            case 1: {
              this.arr[id].x2 = PACKET_IN.float();
              if(CLIENT.id == id) {
                CAMERA.move_x(0, this.arr[id].x2);
              }
              break;
            }
            case 2: {
              this.arr[id].y2 = PACKET_IN.float();
              if(CLIENT.id == id) {
                CAMERA.move_y(0, this.arr[id].y2);
              }
              break;
            }
            case 3: {
              this.arr[id].r2 = PACKET_IN.float();
              break;
            }
            case 4: {
              this.arr[id].dead = PACKET_IN.byte();
              if(this.arr[id].dead) {
                this.arr[id].death_counter = PACKET_IN.byte();
              }
              break;
            }
            case 5: {
              const chat_len = PACKET_IN.byte();
              CHAT.new(this.arr[id].name, PACKET_IN.string(chat_len));
              break;
            }
            default: throw new Error();
          }
          field = PACKET_IN.byte();
        } while(field > 0 && field < 16);
      }
    }
  }
}

/*
 * BALLS
 */

class Balls {
  constructor() {
    /**
     * @type {!Array<{
     *         x: number,
     *         y: number,
     *         r: number,
     *         x1: number,
     *         y1: number,
     *         r1: number,
     *         x2: number,
     *         y2: number,
     *         r2: number,
     *         type: number,
     *         targets: boolean
     *       }>}
     */
    this.arr = new Array(CONSTS.max_balls);
    this.len = 0;
  }
  clear() {
    this.arr = new Array(CONSTS.max_balls);
    this.len = 0;
  }
  ip() {
    let to_go = this.len;
    for(let i = 0; to_go; ++i) {
      if(this.arr[i] == undefined) continue;
      this.arr[i].x1 = this.arr[i].x2;
      this.arr[i].y1 = this.arr[i].y2;
      this.arr[i].r1 = this.arr[i].r2;
      this.arr[i].targets = false;
      --to_go;
    }
  }
  /** @param {boolean} area_changed */
  parse(area_changed) {
    const count = PACKET_IN.short();
    for(let i = 0; i < count; ++i) {
      let id;
      if(area_changed && i < BACKGROUND.area.const_ball_len) {
        id = i + 1;
      } else {
        id = PACKET_IN.short();
      }
      if(this.arr[id] == undefined) {
        const type = PACKET_IN.byte() - 1;
        if(type > 7) throw new Error("ball type out of bounds");
        const x2 = PACKET_IN.float();
        const y2 = PACKET_IN.float();
        const r2 = PACKET_IN.float();
        const flags = PACKET_IN.byte();
        this.arr[id] = { type, x: 0, y: 0, r: 0, x1: x2, x2, y1: y2, y2, r1: r2, r2, targets: !!(flags & 128) };
        ++this.len;
      } else {
        let field = PACKET_IN.byte();
        if(field == 0) {
          if(this.arr[id] == undefined) {
            throw new Error("trying to delete an unknown ball entity id " + id);
          }
          delete this.arr[id];
          --this.len;
          continue;
        }
        do {
          switch(field) {
            case 1: {
              this.arr[id].x2 = PACKET_IN.float();
              break;
            }
            case 2: {
              this.arr[id].y2 = PACKET_IN.float();
              break;
            }
            case 3: {
              this.arr[id].r2 = PACKET_IN.float();
              break;
            }
            default: throw new Error();
          }
          field = PACKET_IN.byte();
        } while(field > 0 && field < 16);
        if(field & 128) {
          this.arr[id].targets = true;
        }
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

    this.can_progress = false;
  }
  progress() {
    if(this.stage == 0) {
      if(settings["show_tutorial"] && CLIENT.in_game && BACKGROUND.area_id == CONSTS.default_area_id) {
        this.stage = 1;
        this.old_fov = CANVAS.target_fov;
        CHAT.disable("Waiting for the tutorial to finish...");
        CANVAS.target_fov = CONSTS.default_fov;
        CAMERA.toggler_mod(1, false);
        SETTINGS.toggler_mod(1, false);
        MOVEMENT.toggler_mod(4, false);
      }
    } else if(this.can_progress) {
      this.can_progress = false;
      if(++this.stage == this.stage_max) {
        this.btn.click();
        CANVAS.target_fov = this.old_fov;
        this.stop();
      }
    }
  }
  stop() {
    this.stage = 0;
    CHAT.enable();
    CAMERA.toggler_del(1);
    SETTINGS.toggler_del(1);
    MOVEMENT.toggler_del(4);
  }
  /**
   * @param {number} by
   * @returns {{ _x: number, _y: number }}
   */
  pre(by) {
    let _x = 0;
    let _y = 0;
    switch(this.stage) {
      case 0: {
        break;
      }
      case 1: {
        _x = PLAYERS.arr[CLIENT.id].x2;
        _y = PLAYERS.arr[CLIENT.id].y2;
        break;
      }
      case 2: {
        _x = BACKGROUND.width * 0.5 - BACKGROUND.cell_size * 6;
        _y = BACKGROUND.height * 0.5;
        break;
      }
      case 3: {
        _x = BACKGROUND.width * 0.5 + BACKGROUND.cell_size * 6;
        _y = BACKGROUND.height * 0.5;
        break;
      }
      case 4: {
        _x = BACKGROUND.cell_size * 0.5;
        _y = BACKGROUND.height * 0.5;
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
        _x = first_ball.x;
        _y = first_ball.y;
        break;
      }
      case 6: {
        _x = PLAYERS.arr[CLIENT.id].x2;
        _y = PLAYERS.arr[CLIENT.id].y2;
        break;
      }
    }
    if(this.stage != 0) {
      CAMERA.move_by(2, _x, _y, 0.2 * by);
    }
    if(abs(CAMERA.x - _x) <= 10 * WINDOW.devicePixelRatio && abs(CAMERA.y - _y) <= 10 * WINDOW.devicePixelRatio) {
      this.can_progress = 1;
    }
    return { _x, _y };
  }
  post({ _x, _y }) {
    const c = "#f48";
    switch(this.stage) {
      case 0: {
        if(settings["show_tutorial"] && BACKGROUND.area_id == CONSTS.default_area_id) {
          CANVAS.t_gl.draw(CANVAS.t_gl.create("Need help? Press KeyT for a tutorial.",
					20, c, CONSTS.texture_id_tutorial), BACKGROUND.width * 0.5, BACKGROUND.cell_size * 2.5, 1);
        }
        break;
      }
      case 1: {
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<-- Your character",
					20, c, CONSTS.texture_id_tutorial), CAMERA.x + 110, CAMERA.y, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("Your character -->",
					20, c, CONSTS.texture_id_tutorial), CAMERA.x - 110, CAMERA.y, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("This is your character. You can control it with these keys:",
					20, c, CONSTS.texture_id_tutorial), CAMERA.x, CAMERA.y - 220, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create(`${keybinds["up"]}: up`,
					20, c, CONSTS.texture_id_tutorial), CAMERA.x, CAMERA.y - 170, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create(`${keybinds["left"]}: left`,
					20, c, CONSTS.texture_id_tutorial), CAMERA.x, CAMERA.y - 130, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create(`${keybinds["down"]}: down`,
					20, c, CONSTS.texture_id_tutorial), CAMERA.x, CAMERA.y - 90, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create(`${keybinds["right"]}: right`,
					20, c, CONSTS.texture_id_tutorial), CAMERA.x, CAMERA.y - 50, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("You can also control it with mouse. Just",
					20, c, CONSTS.texture_id_tutorial), CAMERA.x, CAMERA.y + 50, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("press any mouse button to start or stop moving.",
					20, c, CONSTS.texture_id_tutorial), CAMERA.x, CAMERA.y + 70, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("Scroll to change your field of view.",
					20, c, CONSTS.texture_id_tutorial), CAMERA.x, CAMERA.y + 110, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("Note that you won't be able to perform some",
					20, c, CONSTS.texture_id_tutorial), CAMERA.x, CAMERA.y + 150, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("of the above actions until the tutorial ends.",
					20, c, CONSTS.texture_id_tutorial), CAMERA.x, CAMERA.y + 170, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("Press KeyT to continue",
					20, c, CONSTS.texture_id_tutorial), CAMERA.x, CAMERA.y + 220, 1);
        break;
      }
      case 2: {
        CANVAS.t_gl.draw(CANVAS.t_gl.create("-->",
					20, c, CONSTS.texture_id_tutorial), _x + BACKGROUND.cell_size * 2, _y - BACKGROUND.cell_size * 1, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("-->",
					20, c, CONSTS.texture_id_tutorial), _x + BACKGROUND.cell_size * 2, _y, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("-->",
					20, c, CONSTS.texture_id_tutorial), _x + BACKGROUND.cell_size * 2, _y + BACKGROUND.cell_size * 1, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x - BACKGROUND.cell_size * 2, _y - BACKGROUND.cell_size * 2, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x - BACKGROUND.cell_size * 3, _y - BACKGROUND.cell_size * 1, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x - BACKGROUND.cell_size * 4, _y, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x - BACKGROUND.cell_size * 3, _y + BACKGROUND.cell_size * 1, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x - BACKGROUND.cell_size * 2, _y + BACKGROUND.cell_size * 2, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("These are safezones. Enemies can't",
					20, c, CONSTS.texture_id_tutorial), _x, _y - 130, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("reach you inside of these tiles.",
					20, c, CONSTS.texture_id_tutorial), _x, _y - 110, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("Press KeyT to continue",
					20, c, CONSTS.texture_id_tutorial), _x, _y + 110, 1);
        break;
      }
      case 3: {
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x - BACKGROUND.cell_size * 2, _y - BACKGROUND.cell_size * 2, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x - BACKGROUND.cell_size * 1, _y - BACKGROUND.cell_size * 3, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x, _y - BACKGROUND.cell_size * 4, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x - BACKGROUND.cell_size * 2, _y + BACKGROUND.cell_size * 2, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x - BACKGROUND.cell_size * 1, _y + BACKGROUND.cell_size * 3, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x, _y + BACKGROUND.cell_size * 4, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("-->",
					20, c, CONSTS.texture_id_tutorial), _x + BACKGROUND.cell_size * 2, _y - BACKGROUND.cell_size * 3, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("-->",
					20, c, CONSTS.texture_id_tutorial), _x + BACKGROUND.cell_size * 2, _y + BACKGROUND.cell_size * 3, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x + BACKGROUND.cell_size * 5, _y - BACKGROUND.cell_size * 2, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x + BACKGROUND.cell_size * 6, _y - BACKGROUND.cell_size * 1, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x + BACKGROUND.cell_size * 7, _y, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x + BACKGROUND.cell_size * 6, _y + BACKGROUND.cell_size * 1, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<--",
					20, c, CONSTS.texture_id_tutorial), _x + BACKGROUND.cell_size * 5, _y + BACKGROUND.cell_size * 2, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("These are walls. Players can't walk over them.",
					20, c, CONSTS.texture_id_tutorial), _x, _y - 40, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("However, some types (colors) of enemies can.",
					20, c, CONSTS.texture_id_tutorial), _x, _y - 10, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("Press KeyT to continue",
					20, c, CONSTS.texture_id_tutorial), _x, _y + 40, 1);
        break;
      }
      case 4: {
        CANVAS.t_gl.draw(CANVAS.t_gl.create("-->",
					20, c, CONSTS.texture_id_tutorial), _x, _y, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("This is a teleport tile. If you walk on it,",
					20, c, CONSTS.texture_id_tutorial), _x, _y - 130, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("you will be teleported to the area it points to.",
					20, c, CONSTS.texture_id_tutorial), _x, _y - 110, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("If instead of an arrow you see a dot, that means you",
					20, c, CONSTS.texture_id_tutorial), _x, _y - 70, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("will be teleported to a tile somewhere in the same area.",
					20, c, CONSTS.texture_id_tutorial), _x, _y - 50, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("If instead you see an X mark, that teleport does not lead",
					20, c, CONSTS.texture_id_tutorial), _x, _y + 50, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("anywhere. Simply, the next area does not exist in that case.",
					20, c, CONSTS.texture_id_tutorial), _x, _y + 70, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("Press KeyT to continue",
					20, c, CONSTS.texture_id_tutorial), _x, _y + 120, 1);
        break;
      }
      case 5: {
        CANVAS.t_gl.draw(CANVAS.t_gl.create("Enemy ball -->",
					20, c, CONSTS.texture_id_tutorial), _x - 110, _y, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("<-- Enemy ball",
					20, c, CONSTS.texture_id_tutorial), _x + 110, _y, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("This is an enemy, also called a ball. A grey ball",
					20, c, CONSTS.texture_id_tutorial), _x, _y - 110, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("doesn't do a lot - it simply moves in one direction. However,",
					20, c, CONSTS.texture_id_tutorial), _x, _y - 90, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("as you are about to find out when you start exploring the game,",
					20, c, CONSTS.texture_id_tutorial), _x, _y - 70, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("there are lots of types of enemies, each having their own color.",
					20, c, CONSTS.texture_id_tutorial), _x, _y - 50, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("Coming in contact with an enemy downs you. While downed, you can't move,",
					20, c, CONSTS.texture_id_tutorial), _x, _y + 50, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("and after a while, you die, unless other players revive you by touching you.",
					20, c, CONSTS.texture_id_tutorial), _x, _y + 70, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("Press KeyT to continue",
					20, c, CONSTS.texture_id_tutorial), _x, _y + 120, 1);
        break;
      }
      case 6: {
        CANVAS.t_gl.draw(CANVAS.t_gl.create(`You can press ${keybinds["settings"]} to open settings.`,
					20, c, CONSTS.texture_id_tutorial), _x, _y - 80, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("There are a lot of cool options to change. Try it out later.",
					20, c, CONSTS.texture_id_tutorial), _x, _y - 60, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("That's it for this tutorial. See how far you can go!",
					20, c, CONSTS.texture_id_tutorial), _x, _y + 60, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("GLHF!",
					20, c, CONSTS.texture_id_tutorial), _x, _y + 80, 1);
        CANVAS.t_gl.draw(CANVAS.t_gl.create("Press KeyT to end the tutorial",
					20, c, CONSTS.texture_id_tutorial), _x, _y + 130, 1);
        break;
      }
    }
  }
}

/*
 * CANVAS
 */

class Canvas {
  constructor() {
    this.gl = WebGL.get("ID_canvas");

    this.c_gl = new Circle_WebGL(this.gl);
    this.t_gl = new Tex_WebGL(this.gl);
    this.m_gl = new Minimap_WebGL(this.gl);
    this.a_gl = new Arrow_WebGL(this.gl);

    /** @type {number} */
    this.fov = settings["fov"]["value"];
    this.target_fov = this.fov;

    this.animation = -1;
    this.draw_at = 0;
    this.last_draw_at = 0;

    this.gl.canvas.onwheel = this.wheel.bind(this);
    this.gl.canvas.onmousedown = this.mousedown.bind(this);
  }
  clear() {
    this.fov = settings["fov"]["value"];
    this.target_fov = this.fov;

    cancelAnimationFrame(this.animation);
    this.animation = -1;
    this.draw_at = 0;
    this.last_draw_at = 0;
  }
  /** @param {WheelEvent} e */
  _wheel(e) {
    const add = -Math.sign(e.deltaY) * 0.05;
    if(this.target_fov > 1) {
      this.target_fov += add * 3;
    } else {
      this.target_fov += add;
    }
    this.target_fov = min(max(this.target_fov, settings["fov"]["min"]), fov_max);
  }
  /** @param {Event} e */
  wheel(e) {
    this._wheel(/** @type {WheelEvent} */ (e));
  }
  mousedown() {
    MOVEMENT.mouse_movement = !MOVEMENT.mouse_movement;
    MOVEMENT.send();
  }
  start_drawing() {
    this.animation = requestAnimationFrame(this.draw.bind(this));
  }
  draw(when) {
    this.draw_at = min(max(this.draw_at, SOCKET.updates[0]), SOCKET.updates[1]);
    const old = this.fov;
    this.fov = +lerp(this.fov, this.target_fov, 0.1).toFixed(5);
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
    MENU.ping.innerHTML = SOCKET.cached_ping.toFixed(1) + "ms";


    WebGL.pre_draw(this.gl);
    const ret = TUTORIAL.pre(by);
    CAMERA.x = lerp(CAMERA.x1, CAMERA.x2, by);
    CAMERA.y = lerp(CAMERA.y1, CAMERA.y2, by);
    BACKGROUND.draw();
    this.c_gl.matrix = BACKGROUND.base_matrix;
    this.t_gl.matrix = BACKGROUND.base_matrix;
    this.a_gl.matrix = BACKGROUND.base_matrix;


    let idx = 0;
    let to_go = BALLS.len;
    for(let i = 0; to_go; ++i) {
      const ball = BALLS.arr[i];
      if(ball == undefined) continue;
      --to_go;

      ball.x = lerp(ball.x1, ball.x2, by);
      view.setFloat32(idx, ball.x, true);
      idx += 4;
      ball.y = lerp(ball.y1, ball.y2, by);
      view.setFloat32(idx, ball.y, true);
      idx += 4;
      ball.r = lerp(ball.r1, ball.r2, by);
      view.setFloat32(idx, ball.r, true);
      idx += 4;
      view.setUint32(idx, Ball_colors[ball.type]);
      idx += 4;
    }
    this.c_gl.set(buffer.slice(0, idx), idx >> 4);
    this.c_gl.draw(
      settings["draw_ball_fill"],
      settings["draw_ball_stroke"],
      settings["ball_stroke"]["value"] / 100,
      settings["draw_ball_stroke_bright"]
    );


    idx = 0;
    to_go = PLAYERS.len;
    for(let i = 0; to_go; ++i) {
      const player = PLAYERS.arr[i];
      if(player == undefined) continue;
      --to_go;

      player.x = lerp(player.x1, player.x2, by);
      view.setFloat32(idx, player.x, true);
      idx += 4;
      player.y = lerp(player.y1, player.y2, by);
      view.setFloat32(idx, player.y, true);
      idx += 4;
      player.r = lerp(player.r1, player.r2, by);
      view.setFloat32(idx, player.r, true);
      idx += 4;
      view.setUint32(idx, 0x4169e1ff);
      idx += 4;
    }
    this.c_gl.set(buffer.slice(0, idx), idx >> 4);
    this.c_gl.draw(
      settings["draw_player_fill"],
      settings["draw_player_stroke"],
      settings["player_stroke"]["value"] / 100,
      settings["draw_player_stroke_bright"]
    );


    to_go = PLAYERS.len;
    for(let i = 0; to_go; ++i) {
      const player = PLAYERS.arr[i];
      if(player == undefined) continue;
      --to_go;

      if(settings["draw_player_name"] && player.name.length != 0) {
        //const tex = this.t_gl.create(player.name, 12, "#00000080", CONSTS.texture_id_player_name);
        //this.t_gl.draw(tex, player.x, player.y - player.r - 10, player.r);
        player.name_y = lerp(player.name_y, 10, 0.1);
        this.t_gl.draw(player.name_tex, player.x, player.y - player.r - player.name_y, player.r);
      }
      if(player.dead) {
        this.t_gl.draw_player_death_counter(player.death_counter, player.x, player.y, player.r);
      }
    }
    this.t_gl.finish();

    
    if(settings["show_target_arrows"]) {
      idx = 0;
      to_go = BALLS.len;
      for(let i = 0; to_go; ++i) {
        const ball = BALLS.arr[i];
        if(ball == undefined) continue;
        --to_go;

        if(!ball.targets) continue;
        const angle = Math.atan2(PLAYERS.arr[CLIENT.id].y - ball.y, PLAYERS.arr[CLIENT.id].x - ball.x);
        const [x, y, out] = get_sticky_position(ball.x, ball.y, 0, false, true, true);
        view.setFloat32(idx + 0, x, true);
        view.setFloat32(idx + 4, y, true);
        view.setFloat32(idx + 8, Math.cos(angle), true);
        view.setFloat32(idx + 12, Math.sin(angle), true);
        view.setFloat32(idx + 16, ball.r, true);
        idx += 20;
      }
      this.a_gl.set(buffer.slice(0, idx), idx / 20);
      this.a_gl.draw();
    }


    if(settings["draw_death_arrow"]) {
      to_go = PLAYERS.len;
      for(let i = 0; to_go; ++i) {
        const player = PLAYERS.arr[i];
        if(player == undefined) continue;
        --to_go;

        if(player.dead) {
          const [x, y, out] = get_sticky_position(player.x, player.y, DEATH_ARROW.size * 0.75, true, true, true);
          if(out) {
            const angle = Math.atan2(player.y - y, player.x - x);
            const translated = BACKGROUND.base_matrix.translate(x, y);
            this.t_gl.matrix = translated.rotate(-angle);
            this.t_gl.draw(DEATH_ARROW.tex, 0, 0, 1);
            this.t_gl.matrix = translated.scale((DEATH_ARROW.size * 0.3) / CONSTS.default_player_radius);
            this.t_gl.draw_player_death_counter(player.death_counter, 0, 0, 1);
            this.t_gl.matrix = BACKGROUND.base_matrix;
          }
        }
      }
    }


    TUTORIAL.post(ret);
    this.t_gl.finish();
    /*if(CLIENT.in_game) {
      const w = BACKGROUND.cells_x;
      const h = BACKGROUND.cells_y;
      const scale = CONSTS.minimap_size / max(w, h);
      this.t_gl.matrix = new M3(WINDOW.width, WINDOW.height).translate(WINDOW.width - CONSTS.minimap_pad - w * scale, CONSTS.minimap_pad);
      //this.t_gl.draw({ tex: BACKGROUND.shade, w: w * scale * 0.5, h: h * scale * 0.5 }, w * scale * 0.5, h * scale * 0.5, 1);
      //this.t_gl.finish();

      this.m_gl.matrix = this.t_gl.matrix.scale(scale);
      this.m_gl.set(BACKGROUND.area.outline_vertical, BACKGROUND.area.outline_vertical.length >> 1);
      this.m_gl.draw_vertical();
      this.m_gl.set(BACKGROUND.area.outline_horizontal, BACKGROUND.area.outline_horizontal.length >> 1);
      this.m_gl.draw_horizontal();
    }*/
    this.animation = requestAnimationFrame(this.draw.bind(this));
  }
}

/*
 * BACKGROUND
 */

class Background {
  constructor() {
    this.gl = new Background_WebGL(CANVAS.gl);

    this.width = 0;
    this.height = 0;
    this.cell_size = 0;
    this.cells_x = 0;
    this.cells_y = 0;

    /**
     * @type {!Array<{
     *         const_ball_len: number,
     *         cell_size: number,
     *         width: number,
     *         height: number,
     *         cells_x: number,
     *         cells_y: number,
     *         tile_data: Uint8Array,
     *         outline_vertical: Uint8Array,
     *         outline_horizontal: Uint8Array,
     *         teleports: !Array<!Array<number>>
     *       }>}
     */
    this.areas = [];

    /**
     * @type {Float32Array}
     */
    this.base_matrix = null;

    /**
     * @type {!Array<WebGLTexture>}
     */
    this.teleports = new Array(6);

    const canvas = /** @type {HTMLCanvasElement} */ (createElement("canvas"));
    const ctx = canvas.getContext("2d");
    const w = 512;
    const v = w >> 1;
    const k = v >> 1;
    
    canvas.width = canvas.height = w;
    ctx.fillStyle = ctx.strokeStyle = "#cbb260";
    ctx.lineWidth = k >> 2;
    ctx.lineCap = "round";

    /* 0 = self */
    ctx.arc(v, v, k >> 1, 0, Math.PI * 2);
    ctx.fill();
    this.teleports[0] = this.gl.create_texture_raw(canvas, w, w);

    /* 1 = top */
    ctx.beginPath();
    ctx.clearRect(0, 0, w, w);
    ctx.moveTo(v, w - k);
    ctx.lineTo(v, k);
    ctx.moveTo(v, k);
    ctx.lineTo(k, v);
    ctx.moveTo(v, k);
    ctx.lineTo(w - k, v);
    ctx.stroke();
    this.teleports[1] = this.gl.create_texture_raw(canvas, w, w);

    /* 2 = left */
    ctx.beginPath();
    ctx.clearRect(0, 0, w, w);
    ctx.moveTo(w - k, v);
    ctx.lineTo(k, v);
    ctx.moveTo(k, v);
    ctx.lineTo(v, k);
    ctx.moveTo(k, v);
    ctx.lineTo(v, w - k);
    ctx.stroke();
    this.teleports[2] = this.gl.create_texture_raw(canvas, w, w);

    /* 3 = right */
    ctx.beginPath();
    ctx.clearRect(0, 0, w, w);
    ctx.moveTo(k, v);
    ctx.lineTo(w - k, v);
    ctx.moveTo(w - k, v);
    ctx.lineTo(v, k);
    ctx.moveTo(w - k, v);
    ctx.lineTo(v, w - k);
    ctx.stroke();
    this.teleports[3] = this.gl.create_texture_raw(canvas, w, w);

    /* 4 = bottom */
    ctx.beginPath();
    ctx.clearRect(0, 0, w, w);
    ctx.moveTo(v, k);
    ctx.lineTo(v, w - k);
    ctx.moveTo(v, w - k);
    ctx.lineTo(k, v);
    ctx.moveTo(v, w - k);
    ctx.lineTo(w - k, v);
    ctx.stroke();
    this.teleports[4] = this.gl.create_texture_raw(canvas, w, w);

    /* 5 = none */
    ctx.beginPath();
    ctx.clearRect(0, 0, w, w);
    ctx.moveTo(k, k);
    ctx.lineTo(w - k, w - k);
    ctx.moveTo(w - k, k);
    ctx.lineTo(k, w - k);
    ctx.stroke();
    this.teleports[5] = this.gl.create_texture_raw(canvas, w, w);

    this.area_id = -1;
  }
  clear() {
    this.area_id = -1;
  }
  /** @param {Uint8Array} mem */
  parse(mem) {
    let idx = 0;
    while(idx < mem.length) {
      const w = mem[idx++];
      const h = mem[idx++];
      const cell_size = mem[idx++];
      const const_ball_len = mem[idx] | (mem[idx + 1] << 8);
      idx += 2;
      const area = {
        const_ball_len,
        cell_size,
        width: w * cell_size,
        height: h * cell_size,
        cells_x: w,
        cells_y: h,
        tile_data: new Uint8Array(w * h * 3),
        outline_vertical: new Uint8Array(65536 << 1),
        outline_horizontal: new Uint8Array(65536 << 1),
        teleports: []
      };
      let i = 0;
      for(let x = 0; x < w; ++x) {
        for(let y = 0; y < h; ++y) {
          const type = mem[idx++];
          if(type == 2) continue;
          if(type == 3) {
            area.teleports[area.teleports.length] = [(x + 0.5) * cell_size, (y + 0.5) * cell_size, 0];
          }
          area.tile_data[i++] = x;
          area.tile_data[i++] = y;
          area.tile_data[i++] = type;
        }
      }
      area.tile_data = area.tile_data.subarray(0, i);
      i = 0;
      while(true) {
        const x = mem[idx++];
        if(x == 255) {
          break;
        }
        area.outline_vertical[i++] = x;
        area.outline_vertical[i++] = mem[idx++];
      }
      area.outline_vertical = area.outline_vertical.subarray(0, i);
      i = 0;
      while(true) {
        const x = mem[idx++];
        if(x == 255) {
          break;
        }
        area.outline_horizontal[i++] = x;
        area.outline_horizontal[i++] = mem[idx++];
      }
      area.outline_horizontal = area.outline_horizontal.subarray(0, i);
      for(i = 0; i < area.teleports.length; ++i) {
        area.teleports[i][2] = mem[idx++];
      }
      this.areas[this.areas.length] = area;
    }
  }
  /** @param {number} area_id */
  update(area_id) {
    this.area_id = area_id;
    this.width = this.area.width;
    this.height = this.area.height;
    this.cell_size = this.area.cell_size;
    this.cells_x = this.area.cells_x;
    this.cells_y = this.area.cells_y;
  }
  get area() {
    return this.areas[this.area_id];
  }
  draw() {
    this.gl.set(this.area.tile_data, this.area.tile_data.length / 3);

    this.base_matrix = new M3(WINDOW.width, WINDOW.height).translate(WINDOW.width * 0.5, WINDOW.height * 0.5).scale(CANVAS.fov).translate(-CAMERA.x, -CAMERA.y);

    this.gl.matrix = this.base_matrix.scale(this.cell_size);
    this.gl.draw();

    CANVAS.t_gl.matrix = this.base_matrix;
    const size = this.cell_size >> 1;
    for(const [x, y, type] of this.area.teleports) {
      CANVAS.t_gl.draw({ tex: this.teleports[type], w: size, h: size }, x, y, -2);
    }
    CANVAS.t_gl.finish();
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

    this.width = 0;
    this.height = 0;

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
      this.width = this.innerWidth * this.devicePixelRatio;
      this.height = this.innerHeight * this.devicePixelRatio;
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
      SETTINGS.toggler_toggle(0);
      return;
    }
    if(CLIENT.spectating) {
      switch(e.code) {
        case "Enter": {
          CHAT.focus(e);
          break;
        }
        case keybinds["spec_prev"]: {
          PACKET_OUT.create_spec_packet(-1);
          SOCKET.send();
          break;
        }
        case keybinds["spec_next"]: {
          PACKET_OUT.create_spec_packet(1);
          SOCKET.send();
          break;
        }
        case keybinds["menu"]: {
          MENU.toggler_toggle(0);
          break;
        }
        default: break;
      }
      return;
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
          MOVEMENT.upd_mult(settings["slowwalk_speed"]["value"] / 100);
          MOVEMENT.send();
        }
        break;
      }
      case keybinds["menu"]: {
        MENU.toggler_toggle(0);
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
        if(MOVEMENT.get_mult() != 1) {
          MOVEMENT.upd_mult(1);
          MOVEMENT.send();
        }
        break;
      }
      default: break;
    }
  }
  /** @param {MouseEvent} e */
  _mousemove(e) {
    this.mouse = [e.clientX * this.devicePixelRatio, e.clientY * this.devicePixelRatio];
    MOVEMENT.send();
  }
  /** @param {Event} e */
  mousemove(e) {
    this._mousemove(/** @type {MouseEvent} */ (e));
  }
  // not supported by GCC: /** @param {BeforeUnloadEvent} e */
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
 * CLIENT
 */

class Client {
  constructor() {
    this.in_game = false;
    this.spectating = false;
    this.sent_name = false;
    this.id = -1;
    //this.map_mode = false;
    this.connected_before = false;
  }
  clear() {
    this.in_game = false;
    this.spectating = false;
    this.sent_name = false;
    this.id = -1;
    //this.map_mode = false;
  }
  onconnecting() {
    status.innerHTML = "Connecting";
    if(this.connected_before) {
      MENU.toggler_mod(0, true);
      MENU.hide_name();
      CHAT.disable("Waiting for connection...");
    } else {
      this.connected_before = true;

      MENU.toggler_mod(99, false);
      CHAT.toggler_mod(99, false);
      SETTINGS.toggler_mod(99, false);
    }
  }
  onconnected() {
    MENU.toggler_del(99);
    CHAT.toggler_del(99);
    SETTINGS.toggler_del(99);

    MENU.toggler_mod(0, true);
    MENU.show_name();
    status.innerHTML = "";
  }
  ondisconnected() {
    this.in_game = false;
    this.spectating = false;
    status.innerHTML = "Disconnected";
    MENU.toggler_mod(0, true);
    CHAT.disable("You have been disconnected");
    MENU.show_refresh();
    SETTINGS.toggler_mod(99, false);
  }
  onserverfull() {
    this.ondisconnected();
    status.innerHTML = "Server is full";
  }
  onspectatestart() {
    MENU.toggler_mod(0, false);
    MENU.set_general_tooltip(CONSTS.general_tooltip_id_spec_help);
    MENU.show_general_tooltip();
    MENU.spectating.style.display = "block";
    MENU.spec.innerHTML = "Stop";
    MOVEMENT.toggler_mod(3, false);
  }
  onspectatestop() {
    if(!CLIENT.in_game) {
      MENU.toggler_mod(0, true);
    }
    MENU.hide_general_tooltip();
    MENU.spectating.style.display = "none";
    MENU.spec.innerHTML = "Spectate";
    MOVEMENT.toggler_del(3);
  }
  onspawn() {
    MENU.toggler_mod(0, false);
    MENU.play.innerHTML = "Respawn";
  }
  ondeath() {
    MENU.toggler_mod(0, true);
    MENU.play.innerHTML = "Play";
    TUTORIAL.stop();
    MOVEMENT.reset();
  }
  /*onmapmodeon() {
    MENU.set_general_tooltip(CONSTS.general_tooltip_id_map_help);
    MENU.show_general_tooltip();
    CAMERA.toggler_mod(2, false);
    MOVEMENT.toggler_mod(4, false);
  }*/
  /*onmapmodeoff() {
    MENU.hide_general_tooltip();
    CAMERA.toggler_del(2);
    MOVEMENT.toggler_del(4);
  }*/
}

/*
 * TOOLTIPS
 */

class Tooltips {
  constructor() {
    const _t = getItem("tooltips");
    this.active = _t ? +_t : (2147483647 >>> 0);

    this.picked_server_div = /** @type {HTMLDivElement} */ (getElementById("ID_picked_server_for_you"));
    this.picked_server_tooltip = /** @type {HTMLHeadingElement} */ (getElementById("ID_picked_server_for_you_tooltip"));
    MENU.select_server.onfocus = function() {
      this.remove(CONSTS.tooltip_picked_server);
      this.picked_server_div.style.display = "none";
    }.bind(this);

    this.try_map_editor = /** @type {HTMLDivElement} */ (getElementById("ID_try_map_editor"));
    this.try_map_editor_tooltip = /** @type {HTMLHeadingElement} */ (getElementById("ID_try_map_editor_tooltip"));
    getElementById("ID_map_editor_click").onclick = function() {
      this.remove(CONSTS.tooltip_try_map_editor);
      this.try_map_editor.style.display = "none";
    }.bind(this);

    this.try_typing_help_div = /** @type {HTMLDivElement} */ (getElementById("ID_try_typing_help"));
    this.try_typing_help_tooltip = /** @type {HTMLHeadingElement} */ (getElementById("ID_try_typing_help_tooltip"));
    this.chat = function() {
      this.remove(CONSTS.tooltip_try_help);
      this.try_typing_help_div.style.display = "none";
    }.bind(this);

    this.init();
  }
  init() {
    if(this.set(CONSTS.tooltip_picked_server)) {
      this.picked_server_tooltip.innerHTML = "We picked a server<br>for you automatically.<br><br>You can change it here.";
      this.picked_server_div.style.display = "table";
    }
    if(this.set(CONSTS.tooltip_try_map_editor)) {
      this.try_map_editor_tooltip.innerHTML = "Try out the map editor!<br><br>Submit your maps<br>in our Discord server";
      this.try_map_editor.style.display = "inline-block";
    }
    if(this.set(CONSTS.tooltip_try_help)) {
      this.try_typing_help_tooltip.innerHTML = "Try \"/help\"";
      this.try_typing_help_div.style.display = "inline-block";
    }
  }
  reset() {
    this.remove(CONSTS.tooltip_picked_server);
    this.remove(CONSTS.tooltip_try_map_editor);
    this.remove(CONSTS.tooltip_try_help);
    this.init();
  }
  set(num) {
    return (this.active & (num >>> 0)) != 0;
  }
  remove(num) {
    this.active &= ~(num >>> 0);
    setItem("tooltips", this.active.toString());
  }
}

/*
 * SETTINGS
 */

class Settings extends Toggler {
  constructor() {
    super();

    this.div = getElementById("ID_settings_container");
    this.insert = getElementById("ID_settings");
    this.toggler_init(function() {
      MOVEMENT.toggler_mod(2, false);
      this.div.style.display = "block";
    }.bind(this), function() {
      this.div.style.display = "none";
      MOVEMENT.toggler_del(2);
    }.bind(this), false);

    /**
     * @type {Element}
     */
    this.table = null;

    this.init();
  }
  show_el(el) {
    this.insert.appendChild(el);
  }
  add(left, right) {
    const tr = /** @type {HTMLTableRowElement} */ (createElement("tr"));
    let td = /** @type {HTMLTableCellElement} */ (createElement("td"));
    td.appendChild(left);
    tr.appendChild(td);
    td = /** @type {HTMLTableCellElement} */ (createElement("td"));
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
    this.table = /** @type {HTMLTableElement} */ (createElement("table"));
  }
  _create_h(which, content) {
    const h = /** @type {HTMLHeadingElement} */ (createElement(which));
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
  switch(name, cb=function(){}) {
    const btn = /** @type {HTMLButtonElement} */ (createElement("button"));
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
        cb();
      }
    };
    btn.onclick();
    return btn;
  }
  list(name) {
    const select = /** @type {HTMLSelectElement} */ (createElement("select"));
    for(let option of settings[name]["options"]) {
      const opt = /** @type {HTMLOptionElement} */ (createElement("option"));
      opt.value = option;
      if(option == settings[name]["selected"]) {
        opt.selected = true;
      }
      opt.innerHTML = option;
      select.appendChild(opt);
    }
    select.onchange = save_settings;
    return select;
  }
  keybind(name, cb=function(){}) {
    const btn = /** @type {HTMLButtonElement} */ (createElement("button"));
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
    const div = /** @type {HTMLDivElement} */ (createElement("div"));
    div.className = "input";
    const input = /** @type {HTMLInputElement} */ (createElement("input"));
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
    const btn = /** @type {HTMLButtonElement} */ (createElement("button"));
    btn.innerHTML = name;
    btn.onclick = cb;
    return btn;
  }
  init() {
    this.insert.innerHTML = "";
    this.new("CHAT");
    this.add(this.text("Show chat"), this.switch("chat_on", iife(CHAT.settings_toggle.bind(CHAT))));
    this.add(this.text("Max number of chat messages"), this.slider("max_chat_messages", "", iife(CHAT.update.bind(CHAT))));
    this.add(this.text("Chat text scale"), this.slider("chat_text_scale", "", iife(CHAT.font_update.bind(CHAT))));

    this.new("MENU");
    this.add(this.text("Show latency"), this.switch("show_ping", iife(MENU.ping_update.bind(MENU))));

    this.new("GAME");
    TUTORIAL.btn = this.switch("show_tutorial");
    this.add(this.text("Enable tutorial"), TUTORIAL.btn);
    this.add(this.text("Slow movement speed"), this.slider("slowwalk_speed", "%"));

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
    this.add(this.text("Death arrow size"), this.slider("death_arrow_size", "px", iife(DEATH_ARROW.init.bind(DEATH_ARROW))));
    this.add(this.text("Draw an arrow whenever a ball targets you"), this.switch("show_target_arrows"));
    this.add(this.text("Target arrow size"), this.slider("target_arrow_size", "", iife(CANVAS.a_gl.size.bind(CANVAS.a_gl))));
    this.add(this.text("Target arrow distance from the ball"), this.slider("target_arrow_dist", "", iife(CANVAS.a_gl.dist.bind(CANVAS.a_gl))));
    this.add(this.text("Target arrow opacity"), this.slider("target_arrow_opacity", "%", iife(CANVAS.a_gl.opacity.bind(CANVAS.a_gl))));

    this.new("KEYBINDS");
    this.show_el(this.comment("To change, click a button on the right side and then press the key you want to assign to it."));
    this.add(this.text("Settings"), this.keybind("settings"));
    this.add(this.text("Menu"), this.keybind("menu"));
    this.add(this.text("Move up"), this.keybind("up"));
    this.add(this.text("Move left"), this.keybind("left"));
    this.add(this.text("Move down"), this.keybind("down"));
    this.add(this.text("Move right"), this.keybind("right"));
    this.add(this.text("Move slowly"), this.keybind("slowwalk"));
    this.add(this.text("Spectate the previous player"), this.keybind("spec_prev", function() {
      MENU.maybe_set_general_tooltip(CONSTS.general_tooltip_id_spec_help);
    }));
    this.add(this.text("Spectate the next player"), this.keybind("spec_next", function() {
      MENU.maybe_set_general_tooltip(CONSTS.general_tooltip_id_spec_help);
    }));
    this.add(this.text("Free cam"), this.keybind("freecam"));
    /*this.add(this.text("Map mode"), this.keybind("map", function() {
      MENU.maybe_set_general_tooltip(CONSTS.general_tooltip_id_map_help);
    }));*/

    this.new("RESET");
    this.add(this.text("Reset settings"), this.button("RESET", function() {
      settings = JSON.parse(JSON.stringify(default_settings));
      save_settings();
      this.init();
    }.bind(this)));
    this.add(this.text("Reset keybinds"), this.button("RESET", function() {
      keybinds = /** @type {Object<string, string>} */ (JSON.parse(JSON.stringify(default_keybinds)));
      save_keybinds();
      this.init();
    }.bind(this)));
    this.add(this.text("Reset all tooltips"), this.button("RESET", TOOLTIPS.reset.bind(TOOLTIPS)));

    this.end();
  }
}

/*
 * INIT
 */

/** @type {Movement} */
var MOVEMENT;
/** @type {Menu} */
var MENU;
/** @type {Socket} */
var SOCKET;
/** @type {Packet} */
var PACKET_IN;
/** @type {Packet} */
var PACKET_OUT;
/** @type {Death_arrow} */
var DEATH_ARROW;
/** @type {Chat} */
var CHAT;
/** @type {Camera} */
var CAMERA;
/** @type {Players} */
var PLAYERS;
/** @type {Balls} */
var BALLS;
/** @type {Key_prober} */
var KEY_PROBER;
/** @type {Tutorial} */
var TUTORIAL;
/** @type {Canvas} */
var CANVAS;
/** @type {Background} */
var BACKGROUND;
/** @type {_Window} */
var WINDOW;
/** @type {Client} */
var CLIENT;
/** @type {Tooltips} */
var TOOLTIPS;
/** @type {Settings} */
var SETTINGS;

(async function() {
  const mem = new Uint8Array(await (await fetch("memory.mem", { cache: "force-cache" })).arrayBuffer());
  await document.fonts.ready;
  
  MOVEMENT = new Movement();
  MENU = new Menu();
  SOCKET = new Socket();
  PACKET_IN = new Packet(CONSTS.buffer_size_in);
  PACKET_OUT = new Packet(CONSTS.buffer_size_out);
  DEATH_ARROW = new Death_arrow();
  CHAT = new Chat();
  CAMERA = new Camera();
  PLAYERS = new Players();
  BALLS = new Balls();
  KEY_PROBER = new Key_prober();
  TUTORIAL = new Tutorial();
  CANVAS = new Canvas();
  BACKGROUND = new Background();
  WINDOW = new _Window();
  CLIENT = new Client();
  TOOLTIPS = new Tooltips();
  SETTINGS = new Settings();

  GAME_INIT = true;

  WINDOW.resize();
  BACKGROUND.parse(mem);

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
  for(const socket of latency_sockets) {
    if(socket.ws.url != url) {
      socket.stop();
    } else {
      SOCKET.takeover(socket);
    }
  }
  if(url == undefined) {
    let ok = 1;
    for(const socket of latency_sockets) {
      if(socket.code != 4000) {
        ok = 0;
        break;
      }
    }
    if(ok) {
      status.innerHTML = "Couldn't connect to any server - all servers are full";
    } else {
      status.innerHTML = "Couldn't connect to any server";
    }
    reload();
    throw new Error(status.innerHTML);
  }
  MENU.init();
})();
