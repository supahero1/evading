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
let ball_paths = new Array(ball_colors.length);
let width = 0;
let height = 0;
let dpr = 0;
let buffer = new ArrayBuffer(524288);
let u8 = new Uint8Array(buffer);
let view = new DataView(u8.buffer);
let len = 0;
let self_id = 0;
let players = new Array(256);
let balls = [];
let us = { x: 0, y: 0, ip: { x1: 0, x2: 0, y1: 0, y2: 0 } };
let mouse = [0, 0];
let now = null;
let reset = 0;
let name_y = 0;
let target_name_y = 0;
let movement = {
  up: 0,
  left: 0,
  right: 0,
  bottom: 0,
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
let settings = {
  min_fov: 0.25,
  max_fov: 4,
  default_fov: 1
};
let fov = settings.default_fov;
let target_fov = fov;
let updates = [0, 0];
window["s"].then(r => r.json()).then(r => init(r));
function reload() {
  setTimeout(location.reload.bind(location),1000);
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
function game(ws) {
  loading.innerHTML = "Enter your name<br>";
  sub.innerHTML = "You are limited to 4 characters<br>Special characters might not fit<br>Press enter when you are done";
  name.style.display = "block";
  name.onkeypress = name.onblur = name.onpaste = function(e) {
    let new_val = e.target.value + e.key;
    if(new TextEncoder().encode(new_val).byteLength > 4) {
      e.target.value = e.target.val || "";
    } else {
      e.target.value = new_val
      e.target.val = new_val;
    }
    e.preventDefault();
    return false;
  };
  ws.onclose = function() {
    window.onbeforeunload = function(){};
    canvas.parentElement.removeChild(canvas);
    loading.innerHTML = "Disconnected";
    sub.innerHTML = "";
    name.style.display = "none";
    reload();
  };
  window.onkeydown = function(x) {
    if((x.keyCode || x.which) == 13) {
      loading.innerHTML = "Spawning...";
      sub.innerHTML = "";
      name.style.display = "none";
      let token = window.localStorage.getItem("token");
      token = token ? token.split(",").map(r => +r) : [];
      ws.send(new Uint8Array([0, ...new TextEncoder().encode(name.value), 0, ...token, 0]));
      game2(ws);
    }
  };
}
function game2(ws) {
  function onmessage({ data }) {
    //console.log("onmessage", updates[0].toFixed(1), updates[1].toFixed(1), performance.now().toFixed(1));
    u8.set(new Uint8Array(data));
    len = data.byteLength;
    let idx = 1;
    updates[0] = updates[1];
    updates[1] += 40;
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
            (1.5 + x * bg_data.cell_size) * settings.max_fov,
            (1.5 + y * bg_data.cell_size) * settings.max_fov,
            (bg_data.cell_size - 1.5 * 2) * settings.max_fov,
            (bg_data.cell_size - 1.5 * 2) * settings.max_fov
          );
          bg_data.strokes[u8[idx]].rect(
            x * bg_data.cell_size * settings.max_fov,
            y * bg_data.cell_size * settings.max_fov,
            bg_data.cell_size * settings.max_fov,
            bg_data.cell_size * settings.max_fov
          );
          ++idx;
        }
      }
      background.width = bg_data.cell_size * bg_data.width * settings.max_fov;
      background.height = bg_data.cell_size * bg_data.height * settings.max_fov;
      light_background.width = bg_data.cell_size * bg_data.width * settings.max_fov;
      light_background.height = bg_data.cell_size * bg_data.height * settings.max_fov;
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
          let x2 = view.getFloat32(idx, true);
          idx += 4;
          let y2 = view.getFloat32(idx, true);
          idx += 4;
          let r2 = view.getFloat32(idx, true);
          idx += 4;
          balls[id] = { type, x: 0, y: 0, r: 0, ip: { x1: x2, x2, y1: y2, y2, r1: r2, r2 } };
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
                idx += 4;
                break;
              }
            }
            field = u8[idx++];
          }
        }
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
  }
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
      if(movement.up || movement.left || movement.right || movement.bottom) {
        movement.angle = Math.atan2(movement.bottom - movement.up, movement.right - movement.left);
        movement.distance = 160 * dpr;
      } else {
        movement.angle = 0;
        movement.distance = 0;
      }
    }
    view.setFloat32(0, movement.angle, true);
    if(movement.distance >= 160 * dpr) {
      view.setUint8(4, (255 * movement.mult) >>> 0);
    } else {
      view.setUint8(4, (movement.distance * 1.59375 / dpr * movement.mult) >>> 0);
    }
    ws.send(u8.subarray(0, 5));
  }
  window.onwheel = function(x) {
    const add = -Math.sign(x.deltaY) * 0.05;
    if(target_fov > 1) {
      target_fov += add * 3;
    } else {
      target_fov += add;
    }
    target_fov = Math.min(Math.max(target_fov, settings.min_fov), settings.max_fov);
  };
  window.onmousemove = function(x) {
    mouse = [x.clientX * dpr, x.clientY * dpr];
    movement.angle = Math.atan2(mouse[1] - canvas.height / 2, mouse[0] - canvas.width / 2);
    movement.distance = Math.hypot(mouse[0] - canvas.width / 2, mouse[1] - canvas.height / 2) / fov;
    send_movement();
  };
  window.onmousedown = function() {
    movement.mouse = !movement.mouse;
    movement.angle = Math.atan2(mouse[1] - canvas.height / 2, mouse[0] - canvas.width / 2);
    movement.distance = Math.hypot(mouse[0] - canvas.width / 2, mouse[1] - canvas.height / 2) / fov;
    send_movement();
  };
  window.onkeydown = function(x) {
    switch(x.keyCode || x.which) {
      case 16: {
        if(movement.mult == 1) {
          movement.mult = 0.5;
          send_movement();
        }
        break;
      }
      case 87:
      case 38: {
        if(!movement.up) {
          movement.up = 1;
          send_movement();
        }
        break;
      }
      case 65:
      case 37: {
        if(!movement.left) {
          movement.left = 1;
          send_movement();
        }
        break;
      }
      case 68:
      case 39: {
        if(!movement.right) {
          movement.right = 1;
          send_movement();
        }
        break;
      }
      case 83:
      case 40: {
        if(!movement.bottom) {
          movement.bottom = 1;
          send_movement();
        }
        break;
      }
    }
  };
  window.onkeyup = function(x) {
    switch(x.keyCode || x.which) {
      case 16: {
        if(movement.mult == 0.5) {
          movement.mult = 1;
          send_movement();
        }
        break;
      }
      case 87:
      case 38: {
        if(movement.up) {
          movement.up = 0;
          send_movement();
        }
        break;
      }
      case 65:
      case 37: {
        if(movement.left) {
          movement.left = 0;
          send_movement();
        }
        break;
      }
      case 68:
      case 39: {
        if(movement.right) {
          movement.right = 0;
          send_movement();
        }
        break;
      }
      case 83:
      case 40: {
        if(movement.bottom) {
          movement.bottom = 0;
          send_movement();
        }
        break;
      }
    }
  };
  window.onbeforeunload = function(e) {
    e.preventDefault();
    e.returnValue = "Are you sure you want to quit?";
    return "Are you sure you want to quit?";
  };
  function draw() {
    if(updates[0] == 0) {
      requestAnimationFrame(draw);
      return;
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
    //console.log(updates[0].toFixed(1), updates[1].toFixed(1), now.toFixed(1), by.toFixed(3), performance.now().toFixed(1));
    now += 16.66666;
    us.x = lerp(us.ip.x1, us.ip.x2, by);
    us.y = lerp(us.ip.y1, us.ip.y2, by);
    ctx.resetTransform();
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(fov, fov);
    ctx.translate(-us.x, -us.y);
    ctx.drawImage(background, 0, 0, background.width / settings.max_fov, background.height / settings.max_fov);
    if(fov < 1) {
      ctx.globalAlpha = 1 - fov * fov;
      ctx.drawImage(light_background, 0, 0, background.width / settings.max_fov, background.height / settings.max_fov);
      ctx.globalAlpha = 1;
    }
    for(let i = 0; i < ball_paths.length; ++i) {
      ball_paths[i] = new Path2D();
    }
    for(let ball of balls) {
      if(!ball) continue;
      ball.x = lerp(ball.ip.x1, ball.ip.x2, by);
      ball.y = lerp(ball.ip.y1, ball.ip.y2, by);
      ball.r = lerp(ball.ip.r1, ball.ip.r2, by);
      ball_paths[ball.type].moveTo(ball.x + ball.r - 1, ball.y);
      ball_paths[ball.type].arc(ball.x, ball.y, ball.r - 1, 0, Math.PI * 2);
    }
    ctx.beginPath();
    ctx.lineWidth = 2;
    for(let i = 0; i < ball_paths.length; ++i) {
      ctx.fillStyle = ball_colors[i];
      ctx.strokeStyle = darken(ball_colors[i]);
      ctx.stroke(ball_paths[i]);
      ctx.fill(ball_paths[i]);
    }
    const players_path = new Path2D();
    for(let player of players) {
      if(!player) continue;
      player.x = lerp(player.ip.x1, player.ip.x2, by);
      player.y = lerp(player.ip.y1, player.ip.y2, by);
      player.r = lerp(player.ip.r1, player.ip.r2, by);
      players_path.moveTo(player.x + player.r - 1, player.y);
      players_path.arc(player.x, player.y, player.r - 1, 0, Math.PI * 2);
    }
    ctx.beginPath();
    ctx.fillStyle = "#6f2faf";
    ctx.strokeStyle = darken("#6f2faf");
    ctx.lineWidth = 2;
    ctx.stroke(players_path);
    ctx.fill(players_path);
    for(let player of players) {
      if(!player) continue;
      ctx.beginPath();
      if(player.name.length != 0) {
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
