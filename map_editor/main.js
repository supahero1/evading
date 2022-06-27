const getElementById = document.getElementById.bind(document);
const createElement = document.createElement.bind(document);
const { localStorage } = window;
const canvas = getElementById("canvas");
const ctx = canvas.getContext("2d");
const background = createElement("canvas");
const bg_ctx = background.getContext("2d");
const light_background = createElement("canvas");
const lbg_ctx = light_background.getContext("2d");
const tiles = getElementById("tiles");
tiles["a"] = tiles.appendChild.bind(tiles);
const tile_colors = ["#dddddd", "#aaaaaa", "#333333", "#fedf78"];
const tile_desc = [
  "Path",
  "Safezone",
  "Wall",
  "Teleport"
];
const postfix = " tiles";
const px2 = "2px";
const mt = "margin-top";
const mb = "margin-bottom";
const input = "input";
const nes = "nextElementSibling";
const pes = "previousElementSibling";
const van = "valueAsNumber";
const ih = "innerHTML";
let tile_type = 0;
let hs = [];
function set_selected() {
  for(let i = 0; i < hs.length; ++i) {
    hs[i].style["text-decoration"] = (i == tile_type) ? "underline" : "none";
  }
}
let old_w = 0;
let old_h = 0;
let u8 = new Uint8Array(0);
let width = 9;
let height = 9;
function gen_map() {
  let new_u8 = new Uint8Array(width * height);
  for(let i = 0; i < old_w; ++i) {
    if(i >= width) continue;
    for(let j = 0; j < old_h; ++j) {
      if(j >= height) continue;
      new_u8[i * height + j] = u8[i * old_h + j];
    }
  }
  for(let i = 0; i < cached_vals.length; ++i) {
    if(cached_vals[i][0] >= width || cached_vals[i][1] >= height) {
      delete spawns[`${cached_vals[i][0]},${cached_vals[i][1]}`];
      cached_vals.splice(i--, 1);
    }
  }
  old_w = width;
  old_h = height;
  u8 = new_u8;
  paint_bg();
}
let c_width = 0;
let c_height = 0;
let dpr = 0;
let fov_min = 0.2;
let fov_max = 2;
let fov = fov_min;
let target_fov = 1;
const cell_size = 40;
const default_y = height * 0.5 * cell_size;
let x = 0;
let y = default_y;
let mouse = [0, 0];
let pressing = 0;
let counter_pressing = 0;
let move = {
  left: 0,
  right: 0,
  up: 0,
  down: 0
};
let v = [0, 0];
let tile_idx;
let bg_data = {
  fills: [],
  strokes: []
};
let spawn = 0;
let spawns = {};
let resized = true;
let cached_vals = [];
let hidden = 0;
let c1 = function(){};
let c2 = function(){};
function get_move() {
  if(move.down - move.up == 0 && move.right - move.left == 0) {
    v = [lerp(v[0], 0, 0.1), lerp(v[1], 0, 0.1)];
  } else {
    const angle = Math.atan2(move.down - move.up, move.right - move.left);
    v = [lerp(v[0], Math.cos(angle) * 10 / fov, 0.1), lerp(v[1], Math.sin(angle) * 10 / fov, 0.1)];
  }
}
function maybe_add_spawn_point() {
  if(!spawn) return;
  const _x = (tile_idx / height) | 0;
  const _y = tile_idx % height;
  const id = `${_x},${_y}`;
  if(pressing && spawns[id] == undefined) {
    spawns[id] = [_x, _y];
    draw_text_at("S", 20 + spawns[id][0] * 40, 20 + spawns[id][1] * 40, 0, false, false);
    cached_vals[cached_vals.length] = spawns[id];
  } else if(counter_pressing && spawns[id] != undefined) {
    delete spawns[id];
    const old = tile_type;
    tile_type = u8[tile_idx];
    paint_bg_explicit(tile_idx);
    tile_type = old;
    cached_vals = Object.values(spawns);
  }
}
function resize() {
  if(window.innerWidth != c_width || window.innerHeight != c_height || dpr != window.devicePixelRatio) {
    resized = true;
    dpr = window.devicePixelRatio;
    c_width = window.innerWidth;
    canvas.width = c_width * dpr;
    c_height = window.innerHeight;
    canvas.height = c_height * dpr;
  }
}
resize();
window.onresize = resize;
function lerp(num, to, by) {
  return num + (to - num) * by;
}
canvas.onwheel = function(x) {
  const add = -Math.sign(x.deltaY) * 0.05;
  if(target_fov > 1) {
    target_fov += add * 3;
  } else {
    target_fov += add;
  }
  target_fov = Math.min(Math.max(target_fov, fov_min), fov_max);
};
window.onmousemove = function(x) {
  mouse = [x.clientX * dpr, x.clientY * dpr];
  tile_idx = get_tile_idx();
  if(tile_idx != -1) {
    if(pressing && !spawn && u8[tile_idx] != tile_type) {
      u8[tile_idx] = tile_type;
      paint_bg_explicit(tile_idx);
    }
    maybe_add_spawn_point();
  }
};
canvas.onmousedown = function(x) {
  if(x.button == 0) {
    pressing = 1;
    if(tile_idx != -1) {
      if(!spawn && u8[tile_idx] != tile_type) {
        u8[tile_idx] = tile_type;
        paint_bg_explicit(tile_idx);
      }
      maybe_add_spawn_point();
    }
  } else if(x.button == 2) {
    counter_pressing = 1;
    maybe_add_spawn_point();
  }
};
canvas.onmouseup = function(x) {
  if(x.button == 0) {
    pressing = 0;
  } else if(x.button == 2) {
    counter_pressing = 0;
  }
};
window.onkeydown = function(x) {
  if(x.repeat) return;
  switch(x.keyCode) {
    case 81: {
      spawn = 1;
      if(tile_idx != -1) {
        maybe_add_spawn_point();
      }
      break;
    }
    case 69: {
      hidden = 1;
      resized = 1;
      break;
    }
    case 38:
    case 87: {
      move.up = 1;
      break;
    }
    case 40:
    case 83: {
      move.down = 1;
      break;
    }
    case 37:
    case 65: {
      move.left = 1;
      break;
    }
    case 39:
    case 68: {
      move.right = 1;
      break;
    }
    default: break;
  }
};
window.onkeyup = function(x) {
  if(x.repeat) return;
  switch(x.keyCode) {
    case 81: {
      spawn = 0;
      break;
    }
    case 38:
    case 87: {
      move.up = 0;
      break;
    }
    case 40:
    case 83: {
      move.down = 0;
      break;
    }
    case 37:
    case 65: {
      move.left = 0;
      break;
    }
    case 39:
    case 68: {
      move.right = 0;
      break;
    }
    default: break;
  }
};
window.onbeforeunload = function(e) {
  e.preventDefault();
  e.returnValue = "Are you sure you want to quit?";
  localStorage.setItem("cache", export_tiles());
  return "Are you sure you want to quit?";
};
canvas.oncontextmenu = function(e) {
  e.preventDefault();
  return false;
};
function export_tiles() {
  const sp = cached_vals.length != 0 ? " " : "";
  let str = `#include "../consts.h"\n
\n
static struct tile_info t;\n
\n
struct area_info area_000 = {\n
  &t,\n
  (struct ball_info[]){\n
    {0}\n
  },\n
  (struct pos[]){${sp}${cached_vals.map(r => `{ ${r.join(", ")} }`).join(", ")}${sp}}, ${cached_vals.length}\n
};\n
\n
static struct tile_info t = { ${width}, ${height}, 40, (uint8_t[]){\n`;
  let m = "/*       ";
  for(let i = 0; i < height; ++i) {
      m += i.toString().padStart(3, " ") + " ";
  }
  m += "*/\n";
  str += m + "\n";
  for(let x = 0; x < width; ++x) {
    str += `/*${x.toString().padStart(4, " ")}*/  `;
    for(let y = 0; y < height; ++y) {
      str += ` ${u8[x * height + y]}, `;
    }
    str = str.substring(0, str.length - 1);
    str += "\n\n";
  }
  str = str.substring(0, str.length - 1);
  str += `\n${m}  }\n};\n`;
  return btoa(str);
}
function parse_tiles(config) {
  try {
    config = atob(config);
    let info = config.match(/{ (\d+), (\d+) }/g);
    if(info == null) {
      info = [];
    }
    info = info.map(r => r.match(/\d+/g).map(t => +t));
    if(info.length != config.match(/}, (\d+)\n};/)[1]) {
      return 0;
    }
    const reg = config.match(/{ (\d+), (\d+), 40, \(uint8_t\[\]\){/);
    if(reg == null) {
      return 0;
    }
    const _w = +reg[1];
    const _h = +reg[2];
    if(_w < 1 || _w > 200 || _h < 1 || _h > 200) {
      return 0;
    }
    const res = eval(`[${config.substring(reg.index + reg[0].length, config.length - 5)}]`);
    if(!(res instanceof Array)) return 0;
    if(res.length != _w * _h) {
      return 0;
    }
    for(let i = 0; i < info.length; ++i) {
      if(info[i][0] >= _w || info[i][1] >= _h) return 0;
    }
    width = _w;
    height = _h;
    old_w = width;
    old_h = height;
    c1();
    c2();
    spawns = {};
    for(let i = 0; i < info.length; ++i) {
      spawns[`${info[i][0]},${info[i][1]}`] = [info[i][0], info[i][1]];
    }
    cached_vals = Object.values(spawns);
    u8 = new Uint8Array(_w * _h);
    u8.set(res);
    paint_bg();
    return 1;
  } catch(err) {
    return 0;
  }
}
function paint_bg() {
  bg_data.fills = new Array(tile_colors.length);
  bg_data.strokes = new Array(tile_colors.length);
  let idx = 0;
  for(let x = 0; x < width; ++x) {
    for(let y = 0; y < height; ++y) {
      if(bg_data.fills[u8[idx]] == null) {
        bg_data.fills[u8[idx]] = new Path2D();
        bg_data.strokes[u8[idx]] = new Path2D();
      }
      bg_data.fills[u8[idx]].rect(
        (1.5 + x * cell_size) * fov_max,
        (1.5 + y * cell_size) * fov_max,
        (cell_size - 1.5 * 2) * fov_max,
        (cell_size - 1.5 * 2) * fov_max
      );
      bg_data.strokes[u8[idx]].rect(
        x * cell_size * fov_max,
        y * cell_size * fov_max,
        cell_size * fov_max,
        cell_size * fov_max
      );
      ++idx;
    }
  }
  background.width = cell_size * width * fov_max;
  background.height = cell_size * height * fov_max;
  light_background.width = cell_size * width * fov_max;
  light_background.height = cell_size * height * fov_max;
  for(let i = 0; i < 256; ++i) {
    if(!bg_data.fills[i]) continue;
    bg_ctx.fillStyle = tile_colors[i] + "b0";
    bg_ctx.fill(bg_data.strokes[i]);
    bg_ctx.fillStyle = tile_colors[i];
    bg_ctx.fill(bg_data.fills[i]);
    lbg_ctx.fillStyle = tile_colors[i];
    lbg_ctx.fill(bg_data.strokes[i]);
  }
  resized = 1;
}
function paint_bg_explicit(idx) {
  const y = idx % height;
  const x = (idx - y) / height;
  bg_ctx.clearRect(
    x * cell_size * fov_max,
    y * cell_size * fov_max,
    cell_size * fov_max,
    cell_size * fov_max
  );
  bg_ctx.fillStyle = tile_colors[tile_type] + "b0";
  bg_ctx.fillRect(
    x * cell_size * fov_max,
    y * cell_size * fov_max,
    cell_size * fov_max,
    cell_size * fov_max
  );
  bg_ctx.fillStyle = tile_colors[tile_type];
  bg_ctx.fillRect(
    (1.5 + x * cell_size) * fov_max,
    (1.5 + y * cell_size) * fov_max,
    (cell_size - 1.5 * 2) * fov_max,
    (cell_size - 1.5 * 2) * fov_max
  );
  lbg_ctx.fillStyle = tile_colors[tile_type];
  lbg_ctx.fillRect(
    x * cell_size * fov_max,
    y * cell_size * fov_max,
    cell_size * fov_max,
    cell_size * fov_max
  );
  resized = 1;
}
function get_mouse() {
  return {
    mx: (mouse[0] - canvas.width * 0.5) / fov + x,
    my: (mouse[1] - canvas.height * 0.5) / fov + y
  };
}
function get_tile_idx() {
  const { mx, my } = get_mouse();
  const cx = Math.floor(mx / cell_size);
  if(cx < 0 || cx >= width) {
    return -1;
  }
  const cy = Math.floor(my / cell_size);
  if(cy < 0 || cy >= height) {
    return -1;
  }
  return cx * height + cy;
}
gen_map();
{ /* don't ask */
  let h = createElement("button");
  h[ih] = "Export & copy";
  h.timeout = -1;
  h.onclick = function() {
    const exported = export_tiles();
    window.navigator.clipboard.writeText(exported);
    if(this.timeout != -1) {
      clearTimeout(this.timeout);
    }
    this[ih] = "Exported & copied";
    this.timeout = setTimeout(function() {
      this[ih] = "Export & copy";
      this.timeout = -1;
    }.bind(this), 500);
  }.bind(h);
  tiles["a"](h);
  h = createElement("button");
  h[ih] = "Import";
  h.onclick = function() {
    let answer = prompt("Please paste the config below:");
    if(!answer) return;
    answer = answer.trim();
    if(answer.length == 0) return;
    if(!parse_tiles(answer)) {
      alert("The config is invalid, it won't be loaded.");
    }
  };
  tiles["a"](h);
  h = createElement("h4");
  h[ih] = "Width";
  h.style[mb] = px2;
  tiles["a"](h);
  h = createElement(input);
  h.type = "range";
  h.min = 1;
  h.max = 200;
  h.value = 10;
  h.step = 1;
  c1 = function() {
    this.value = width;
    this[nes][ih] = width + postfix;
    this[nes][nes].value = width;
  }.bind(h);
  h.oninput = function() {
    width = this[van] || 1;
    c1();
    gen_map();
  }.bind(h);
  tiles["a"](h);
  h = createElement("h4");
  h[ih] = width + postfix;
  h.style[mt] = px2;
  h.style[mb] = px2;
  tiles["a"](h);
  h = createElement(input);
  h.type = "number";
  h.style[mt] = px2;
  h.value = width;
  h.min = 1;
  h.max = 200;
  h.oninput = function() {
    width = this[van] ? Math.max(Math.min(this[van], this.max), this.min) : 1;
    this[van] = width;
    this[pes][ih] = width + postfix;
    this[pes][pes].value = width;
    gen_map();
  }.bind(h);
  tiles["a"](h);

  h = createElement("h4");
  h[ih] = "Height";
  h.style[mb] = px2;
  tiles["a"](h);
  h = createElement(input);
  h.type = "range";
  h.min = 1;
  h.max = 200;
  h.value = 10;
  h.step = 1;
  c2 = function() {
    this.value = height;
    this[nes][ih] = height + postfix;
    this[nes][nes].value = height;
  }.bind(h);
  h.oninput = function() {
    height = this[van] || 1;
    c2();
    gen_map();
  }.bind(h);
  tiles["a"](h);
  h = createElement("h4");
  h[ih] = height + postfix;
  h.style[mt] = px2;
  h.style[mb] = px2;
  tiles["a"](h);
  h = createElement(input);
  h.type = "number";
  h.style[mt] = px2;
  h.value = height;
  h.min = 1;
  h.max = 200;
  h.oninput = function() {
    height = this[van] ? Math.max(Math.min(this[van], this.max), this.min) : 1;
    this[van] = height;
    this[pes][ih] = height + postfix;
    this[pes][pes].value = height;
    gen_map();
  }.bind(h);
  tiles["a"](h);

  for(let i = 0; i < tile_colors.length; ++i) {
    const el = createElement("div");
    h = createElement("h4");
    h[ih] = tile_desc[i];
    el.appendChild(h);
    hs[hs.length] = h;
    h = createElement("div");
    h.className = "tile";
    h.style["background-color"] = tile_colors[i];
    h.onclick = function() {
      tile_type = i;
      set_selected();
    };
    el.appendChild(h);
    tiles["a"](el);
  }
}
set_selected();
function draw_text_at(text, _x, _y, k, preserve_x, preserve_y) {
  k *= fov;
  let s_x = canvas.width * 0.5 + (_x - x) * fov;
  let s_y = canvas.height * 0.5 + (_y - y) * fov;
  let t_x;
  let t_y;
  if(preserve_x && (s_x < k || s_x > canvas.width - k)) {
    t_x = Math.max(Math.min(s_x, canvas.width - k), k);
  } else {
    t_x = s_x;
  }
  if(preserve_y && (s_y < k || s_y > canvas.height - k)) {
    t_y = Math.max(Math.min(s_y, canvas.height - k), k);
  } else {
    t_y = s_y;
  }
  let r_x = (t_x - canvas.width * 0.5) / fov + x;
  let r_y = (t_y - canvas.height * 0.5) / fov + y;
  ctx.translate(r_x, r_y);
  ctx.font = `700 20px Ubuntu`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.fillText(text, 0, 0);
  ctx.strokeText(text, 0, 0);
  ctx.translate(-r_x, -r_y);
}
const saved = localStorage.getItem("cache");
if(saved) {
  parse_tiles(saved);
}
function draw() {
  let old = fov;
  fov = lerp(fov, target_fov, 0.075);
  let old_x = x;
  let old_y = y;
  get_move();
  x += v[0];
  y += v[1];
  tile_idx = get_tile_idx();
  if(tile_idx != -1) {
    if(pressing && !spawn && u8[tile_idx] != tile_type) {
      u8[tile_idx] = tile_type;
      paint_bg_explicit(tile_idx);
    }
    maybe_add_spawn_point();
  }
  if(resized || old != fov || old_x != x || old_y != y) {
    resized = false;
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
    ctx.scale(fov, fov);
    ctx.translate(-x, -y);
    ctx.drawImage(background, 0, 0, background.width / fov_max, background.height / fov_max);
    if(fov < 1) {
      ctx.globalAlpha = 1 - fov * fov;
      ctx.drawImage(light_background, 0, 0, background.width / fov_max, background.height / fov_max);
      ctx.globalAlpha = 1;
    }
    if(!hidden) {
      draw_text_at("WASD or arrow keys to move around, scroll to zoom", -500, default_y - 80, 0, false, false);
      draw_text_at("Click on the left to pick what type of tile you want to place", -500, default_y - 40, 0, false, false);
      draw_text_at("Set spawnpoints by clicking LMB and pressing Q at the same time", -500, default_y, 0, false, false);
      draw_text_at("Unset spawnpoints by clicking RMB and pressing Q at the same time", -500, default_y + 40, 0, false, false);
      draw_text_at("Press E to hide this message", -500, default_y + 80, 0, false, false);
    }
    for(const val of cached_vals) {
      draw_text_at("S", 20 + val[0] * 40, 20 + val[1] * 40, 0, false, false);
    }
    for(let i = 0; i < width; ++i) {
      draw_text_at(i.toString(), 20 + i * 40, -40, 20, false, true);
    }
    if(width & 1) {
      draw_text_at("M", 20 + ((width - 1) >> 1) * 40, -20, 40, false, true);
    } else {
      draw_text_at("M", 20 + (width >> 1) * 40, -20, 40, false, true);
      draw_text_at("M", 20 + ((width >> 1) - 1) * 40, -20, 40, false, true);
    }
    for(let i = 0; i < height; ++i) {
      draw_text_at(i.toString(), width * 40 + 40, 20 + i * 40, 20, true, false);
    }
    if(height & 1) {
      draw_text_at("M", width * 40 + 20, 20 + ((height - 1) >> 1) * 40, 40, true, false);
    } else {
      draw_text_at("M", width * 40 + 20, 20 + (height >> 1) * 40, 40, true, false);
      draw_text_at("M", width * 40 + 20, 20 + ((height >> 1) - 1) * 40, 40, true, false);
    }
  }
  requestAnimationFrame(draw);
}
draw();
