const getElementById = document.getElementById.bind(document);
const createElement = document.createElement.bind(document);
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
let tile_type = 0;
let hs = [];
function set_selected() {
  for(let i = 0; i < hs.length; ++i) {
    hs[i].style["text-decoration"] = (i == tile_type) ? "underline" : "none";
  }
}
let postfix = " tiles";
let px2 = "2px";
let mt = "margin-top";
let mb = "margin-bottom";
let input = "input";
let nes = "nextElementSibling";
let pes = "previousElementSibling";
let van = "valueAsNumber";
let ih = "innerHTML";
let u8 = new Uint8Array(0);
let width = 10;
let height = 10;
function gen_map() {
  u8 = new Uint8Array(width * height);
  paint_bg();
}
let c_width = 0;
let c_height = 0;
let dpr = 0;
let fov_min = 0.2;
let fov_max = 2;
let fov = fov_min;
let target_fov = 1;
let x = 0;
let y = 0;
let mouse = [0, 0];
let pressing = 0;
let move = {
  left: 0,
  right: 0,
  up: 0,
  down: 0
};
let v = [0, 0];
const cell_size = 50;
let bg_data = {
  fills: [],
  strokes: []
};
let resized = true;
function get_move() {
  if(move.down - move.up == 0 && move.right - move.left == 0) {
    v = [lerp(v[0], 0, 0.1), lerp(v[1], 0, 0.1)];
  } else {
    const angle = Math.atan2(move.down - move.up, move.right - move.left);
    v = [lerp(v[0], Math.cos(angle) * 10 / fov, 0.1), lerp(v[1], Math.sin(angle) * 10 / fov, 0.1)];
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
};
canvas.onmousedown = function(x) {
  pressing = 1;
};
canvas.onmouseup = function(x) {
  pressing = 0;
};
window.onkeydown = function(x) {
  if(x.repeat) return;
  switch(x.keyCode) {
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
  return "Are you sure you want to quit?";
};
canvas.oncontextmenu = function(e) {
  e.preventDefault();
  return false;
};
function export_tiles() {
  let str = `struct tile_info name = { ${width}, ${height}, 40, (uint8_t[]){\n`;
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
  str += `\n${m}  }\n};`;
  return btoa(str);
}
function parse_tiles(config) {
  try {
    config = atob(config.trim());
    const reg = config.match(/struct tile_info \w.*? = { (\d+), (\d+), 40, \(uint8_t\[\]\){/);
    const _w = +reg[1];
    const _h = +reg[2];
    if(reg == null) {
      return 0;
    }
    const res = eval(config.replace(reg[0], "[").replace("}\n};", "]"));
    if(!res.length || res.length != _w * _h) {
      return 0;
    }
    u8.set(res);
    width = _w;
    height = _h;
    paint_bg();
    resized = true;
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
    mx: (mouse[0] - window.innerWidth * 0.5) / fov + x,
    my: (mouse[1] - window.innerHeight * 0.5) / fov + y
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
    if(this.timeout == -1) {
      const old = this[ih];
      this[ih] = "Exported & copied";
      this.timeout = setTimeout(function() {
        this[ih] = old;
        this.timeout = -1;
      }.bind(this), 500);
    }
  }.bind(h);
  tiles["a"](h);
  h = createElement("button");
  h[ih] = "Import";
  h.onclick = function() {
    let answer = prompt("Please paste the config below:");
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
  h.max = 128;
  h.value = 10;
  h.step = 1;
  h.oninput = function() {
    width = this[van] || 1;
    this[nes][ih] = width + postfix;
    this[nes][nes].value = width;
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
  h.max = 128;
  h.oninput = function() {
    width = this[van] || 1;
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
  h.max = 128;
  h.value = 10;
  h.step = 1;
  h.oninput = function() {
    height = this[van] || 1;
    this[nes][ih] = height + postfix;
    this[nes][nes].value = height;
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
  h.max = 128;
  h.oninput = function() {
    height = this[van] || 1;
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
function draw() {
  let old = fov;
  fov = lerp(fov, target_fov, 0.075);
  let old_x = x;
  let old_y = y;
  get_move();
  x += v[0];
  y += v[1];
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
  }
  if(pressing) {
    const idx = get_tile_idx();
    if(idx != -1 && u8[idx] != tile_type) {
      u8[idx] = tile_type;
      paint_bg_explicit(idx);
    }
  }
  requestAnimationFrame(draw);
}
draw();
