/* JUJUTSU UNLIMITEDS — heavier visuals: slashes, lightning, rubble, floor cracks, impact frames, the world splitting */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, cam = E.cam, H = E.hooks, GLOW = E.GLOW;
const { clamp, rnd, ease, ZP } = E, TAU = Math.PI * 2;

const list = [], ulist = [], cracks = [];
let impT = 0, impDur = 0, impAt = [0, 0], splitT = 0, splitAng = 0, lastNow = 0;

/* ---------- spawners (all positions are on the fighting plane: x along the floor, y up) ---------- */
const slash = (x, y, ang, len, col, w = 10, delay = 0) => list.push({ k: 's', x, y, ang, len, col, w, t: -delay, life: .26 });
const bolt = (x, y, x1, y1, col, life = .2, w = 3, core = '#fff') => list.push({ k: 'b', x, y, x1, y1, col, w, core, t: 0, life });
const ring = (x, y, r, col, life = .28) => list.push({ k: 'o', x, y, r, col, t: 0, life });
const custom = (life, fn, delay = 0, low = false) => (low ? ulist : list).push({ k: 'c', fn, t: -delay, life });
const puff = (img, x, y, vx, vy, s, life, grav = 0) => list.push({ k: 'g', img, x, y, vx, vy, s, grav, t: 0, life });
function rocks(x, y, n) {
  for (let i = 0; i < n; i++) list.push({ k: 'r', x: x + rnd(-40, 40), y: y + rnd(0, 30), vx: rnd(-420, 420), vy: rnd(380, 980), rot: rnd(0, TAU), vr: rnd(-9, 9), s: rnd(7, 20), hit: 0, t: 0, life: rnd(.8, 1.3) });
}
function sparks(x, y, img, n) { for (let i = 0; i < n; i++) { const a = rnd(0, TAU), v = rnd(300, 900); puff(img, x, y, Math.cos(a) * v, Math.sin(a) * v, rnd(16, 34), rnd(.18, .36), -1400); } }
function fire(x, y, n, img = 'fire') { for (let i = 0; i < n; i++) puff(img, x + rnd(-60, 60), y + rnd(0, 40), rnd(-120, 120), rnd(160, 520), rnd(50, 120), rnd(.3, .7)); }
function mote(x, y, img) { const a = rnd(0, TAU), r = rnd(90, 170); puff(img, x + Math.cos(a) * r, y + Math.sin(a) * r, -Math.cos(a) * r * 4, -Math.sin(a) * r * 4, rnd(18, 34), .25); }
// a star of cracks splitting the floor, drawn in the floor's own perspective
function crack(x, r) {
  const arms = [];
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU + rnd(-.3, .3), pts = [[0, 0]];
    for (let j = 1; j <= 4; j++) { const d = r * j / 4 * rnd(.8, 1.1); pts.push([Math.cos(a + rnd(-.25, .25)) * d, Math.sin(a + rnd(-.25, .25)) * d * .8]); }
    arms.push(pts);
  }
  cracks.push({ x, arms, t: 0, life: 3.2 });
  if (cracks.length > 6) cracks.shift();
}
function impact(dur, x, y) { if (JU.reduceMotion) return; impT = impDur = dur; const c = F(x, y); impAt = [c[0], c[1]]; }
function split(ang) { if (!JU.reduceMotion) { splitT = .55; splitAng = ang; } }
const tint = col => /4fc3ff|9fd8ff/i.test(col) ? 'blue' : /b79bff|9d7bff/i.test(col) ? 'purple' : /ff2440|d0102a/i.test(col) ? 'red' : 'fire';

/* ---------- drawing ---------- */
function under(dt) {                       // floor decals sit beneath the fighters
  for (let i = cracks.length - 1; i >= 0; i--) {
    const c = cracks[i];
    c.t += dt;
    if (c.t >= c.life) { cracks.splice(i, 1); continue; }
    const a = Math.min(1, (c.life - c.t) * 1.5), grow = Math.min(1, c.t * 9);
    g.beginPath();
    for (const arm of c.arms) arm.forEach((p, j) => { const q = P(c.x + p[0] * grow, 0, ZP + p[1] * grow); j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); });
    g.lineJoin = 'round'; g.strokeStyle = `rgba(0,0,0,${.8 * a})`; g.lineWidth = 5; g.stroke();
    g.strokeStyle = `rgba(255,90,70,${.5 * a * Math.max(0, 1 - c.t)})`; g.lineWidth = 2; g.stroke();
  }
}

function drawLow(dt) {
  for (let i = ulist.length - 1; i >= 0; i--) {
    const e = ulist[i];
    e.t += dt;
    if (e.t < 0) continue;
    if (e.t >= e.life) { ulist.splice(i, 1); continue; }
    e.fn(e.t / e.life, dt);
  }
}

function draw(dt) {
  for (let i = list.length - 1; i >= 0; i--) {
    const e = list[i];
    e.t += dt;
    if (e.t < 0) continue;
    if (e.t >= e.life) { list.splice(i, 1); continue; }
    const p = e.t / e.life;
    if (e.k === 's') {                     // a cut: draws itself across, then thins out
      const c = F(e.x, e.y), k = c[2], grow = Math.min(1, p / .22), fade = 1 - Math.max(0, (p - .3) / .7);
      const dx = Math.cos(e.ang) * e.len * k, dy = -Math.sin(e.ang) * e.len * k, ax = c[0] - dx / 2, ay = c[1] - dy / 2;
      const bx = ax + dx * grow, by = ay + dy * grow, nx = -dy / (e.len * k) * e.w * fade * k, ny = dx / (e.len * k) * e.w * fade * k, mx = (ax + bx) / 2, my = (ay + by) / 2;
      g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(mx + nx, my + ny, bx, by); g.quadraticCurveTo(mx - nx, my - ny, ax, ay);
      g.globalCompositeOperation = 'lighter'; g.strokeStyle = e.col; g.globalAlpha = .55 * fade; g.lineWidth = e.w * 1.6 * k; g.stroke();
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = fade; g.fillStyle = '#fff'; g.fill(); g.globalAlpha = 1;
    } else if (e.k === 'b') {              // lightning, re-forked every frame
      const a = F(e.x, e.y), b = F(e.x1, e.y1), len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len;
      g.beginPath(); g.moveTo(a[0], a[1]);
      for (let j = 1; j < 8; j++) { const u = j / 8, o = rnd(-1, 1) * len * .09; g.lineTo(a[0] + (b[0] - a[0]) * u + nx * o, a[1] + (b[1] - a[1]) * u + ny * o); }
      g.lineTo(b[0], b[1]); g.lineJoin = 'miter';
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - p; g.strokeStyle = e.col; g.lineWidth = e.w * 3.2; g.stroke();
      g.globalCompositeOperation = 'source-over'; g.strokeStyle = e.core; g.lineWidth = e.w; g.stroke(); g.globalAlpha = 1;
    } else if (e.k === 'o') {              // shock ring
      const c = F(e.x, e.y);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - p; g.strokeStyle = e.col; g.lineWidth = (1 - p) * 12 + 1;
      g.beginPath(); g.arc(c[0], c[1], e.r * ease(p) * c[2], 0, TAU); g.stroke();
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    } else if (e.k === 'g') {              // glowing particle
      e.vy += e.grav * dt; e.x += e.vx * dt; e.y += e.vy * dt;
      const c = F(e.x, Math.max(0, e.y));
      g.globalCompositeOperation = 'lighter'; E.glow(GLOW[e.img], c[0], c[1], e.s * (1 + p) * c[2], 1 - p); g.globalCompositeOperation = 'source-over';
    } else if (e.k === 'c') {              // a move's own drawing
      e.fn(p, dt);
    } else if (e.k === 'r') {              // rubble with weight
      e.vy -= 2400 * dt; e.x += e.vx * dt; e.y += e.vy * dt; e.rot += e.vr * dt;
      if (e.y < 0) { e.y = 0; e.vy = e.hit ? 0 : -e.vy * .35; e.vx *= .5; e.vr *= .4; e.hit = 1; }
      const c = F(e.x, e.y), s = e.s * c[2];
      g.save(); g.translate(c[0], c[1] - s * .5); g.rotate(e.rot); g.globalAlpha = Math.min(1, (1 - p) * 3);
      g.fillStyle = '#2b2233'; g.fillRect(-s, -s * .7, s * 2, s * 1.4); g.fillStyle = '#6a5a78'; g.fillRect(-s, -s * .7, s * 2, s * .4);
      g.restore(); g.globalAlpha = 1;
    } else {                               // speed line trailing a swing
      const c = F(e.x, e.y), k = c[2];
      g.globalAlpha = (1 - p) * .8; g.strokeStyle = e.col; g.lineWidth = 3 * k; g.lineCap = 'round';
      g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0] - e.face * e.len * k * (1 - p * .5), c[1]); g.stroke();
      g.globalAlpha = 1; g.lineCap = 'butt';
    }
  }
}

function post() {                          // whole-screen effects, on real time so they run through hit-stop
  const now = performance.now(), real = Math.min(.05, (now - lastNow) / 1000), VW = E.VW, VH = E.VH;
  lastNow = now;
  if (impT > 0) {                          // impact frames: negative, then flat silhouettes on black and on white
    impT -= real;
    const i = Math.floor((impDur - impT) / .06), mode = i % 4;
    if (mode === 0) { g.globalCompositeOperation = 'difference'; g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over'; }
    else {
      const dark = mode !== 2;
      let sd = i * 9301 + 49297; const rr = () => (sd = sd * 16807 % 2147483647) / 2147483647;
      g.fillStyle = dark ? '#000' : '#fff'; g.fillRect(0, 0, VW, VH);
      g.strokeStyle = mode === 3 ? '#ff2440' : dark ? '#fff' : '#000'; g.lineWidth = 2 + rr() * 4; g.beginPath();
      for (let k = 0; k < 50; k++) {
        const a = rr() * TAU, r0 = (.1 + rr() * .4) * VW, r1 = r0 + (.2 + rr() * .9) * VW;
        g.moveTo(impAt[0] + Math.cos(a) * r0, impAt[1] + Math.sin(a) * r0); g.lineTo(impAt[0] + Math.cos(a) * r1, impAt[1] + Math.sin(a) * r1);
      }
      g.stroke();
      g.save(); g.translate(VW / 2, E.GY - 120 - cam.lift); g.scale(cam.zoom, cam.zoom); g.translate(-VW / 2, -(E.GY - 120));
      g.filter = dark ? 'brightness(0) invert(1)' : 'brightness(0)';
      for (const f of [E.P2, E.P1]) if (f.alpha === undefined || f.alpha > .05) E.drawFighter(f);
      g.filter = 'none'; g.restore();
    }
  }
  if (splitT > 0) {                        // the picture itself is cut in two and the halves slide apart
    splitT -= real;
    const u = clamp(splitT / .55, 0, 1), cv = g.canvas, w = cv.width, h = cv.height, c = Math.cos(splitAng), s = Math.sin(splitAng), o = 90 * u * u * (w / VW), L = w + h;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    for (const sg of [1, -1]) {
      const nx = -s * sg, ny = c * sg;
      g.save(); g.beginPath();
      g.moveTo(w / 2 - c * L, h / 2 - s * L); g.lineTo(w / 2 + c * L, h / 2 + s * L); g.lineTo(w / 2 + c * L + nx * L, h / 2 + s * L + ny * L); g.lineTo(w / 2 - c * L + nx * L, h / 2 - s * L + ny * L);
      g.closePath(); g.clip(); g.drawImage(cv, c * o * sg, s * o * sg); g.restore();
    }
    g.beginPath(); g.moveTo(w / 2 - c * L, h / 2 - s * L); g.lineTo(w / 2 + c * L, h / 2 + s * L);
    g.strokeStyle = '#000'; g.lineWidth = 26 * u * (w / VW); g.stroke();
    g.strokeStyle = `rgba(255,255,255,${u})`; g.lineWidth = 3 * (w / VW); g.stroke();
    g.restore();
  }
}

/* ---------- better visuals for Yuji's own moves ---------- */
H.under = dt => { under(dt); drawLow(dt); }; H.fx = draw; H.post = post;
H.swing = (p, y, r, col) => {
  for (let i = 0; i < 5; i++) list.push({ k: 'l', x: p.x + p.face * rnd(30, 120), y: p.y + y + rnd(-r * .45, r * .45), len: rnd(70, 190), face: p.face, col, t: 0, life: .15 });
};
H.hit = (o, face, h) => {
  const hs = o.scale || 1, x = o.x - face * 26, y = o.y + 150 * hs, col = h.col || '#ffffff';
  ring(x, y, h.heavy ? 190 : 90, col);
  sparks(x, y, tint(col), h.heavy ? 12 : 5);
  if (h.heavy) { rocks(o.x, 0, 7); crack(o.x, 150); }
};
H.moveFx = (p, m) => {
  const M = E.MOVES, d = m.def;
  if (d === M.div && m.t < M.div.windup) { const w = E.hand(p, false); if (Math.random() < .8) mote(w[0], w[1], m.bf ? 'red' : 'blue'); }   // energy gathering in the fist
  else if (d === M.strikes && m.n !== m._n) { m._n = m.n; const w = E.hand(p, !(m.n & 1)); ring(w[0], w[1], 50, '#b79bff', .16); }
  else if (d === M.crush && m.slam && !m._c) { m._c = 1; const x = p.x + p.face * 110; crack(x, 270); rocks(x, 0, 12); fire(x, 10, 12); }
  else if (d === M.manji && m.sw && !m._c) { m._c = 1; slash(p.x + p.face * 100, p.y + 150, p.face > 0 ? .28 : Math.PI - .28, 330, '#9fd8ff', 16); }
};
H.bf = o => {
  const x = o.x, y = o.y + 150 * (o.scale || 1);
  impact(.44, x, y); crack(x, 330); rocks(x, 0, 14);
  for (let i = 0; i < 9; i++) { const a = rnd(0, TAU), l = rnd(220, 520); bolt(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, '#ff2440', rnd(.25, .5), rnd(3, 6), '#060205'); }
};

JU.vfx = { slash, bolt, ring, rocks, sparks, fire, mote, puff, custom, crack, impact, split, clear() { list.length = ulist.length = cracks.length = 0; impT = splitT = 0; } };
})();
