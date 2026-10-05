/* JUJUTSU UNLIMITEDS — what a cut looks like (update 0.2v4). Sukuna's technique does not throw lines at things: it parts whatever is in the way.
   JU.cut.slice() opens one. A hairline first; then the two sides of it slide past each other (the picture itself is moved: floor, background and
   anybody standing there), the gap shows black with its edges still hot, and it closes again. The rest of this file is what goes with that:
   the blade of air that carries a cut, gashes and a diced grid left in the floor, the pieces of whatever was diced, ink, and fire for the one
   thing of his that is not a cut. Drawn after the stills of Dismantle, Cleave and Malevolent Shrine in the anime */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, cam = E.cam, H = E.hooks, V = JU.vfx;
const { clamp, lerp, rnd, ease, ZP } = E, TAU = Math.PI * 2, HOT = '255,36,64', LAVA = '255,120,44';
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const zf = z => clamp(z, E.ZNEAR + 12, ZP + 500);   // a depth that is still on the floor

/* ================= the cut itself ================= */
const slices = [], MOVED = 10;                      // open cuts; and how many of them at once may move the picture (the rest are drawn, and move nothing)
let snap = null, sctx = null, wall = 0;
// a cut through (x, y) on the fighting plane. ang: 0 lies flat, a quarter turn stands upright (the way V.slash counts). len: end to end.
// o: { shift: how far the two sides slide, life, delay, w: how wide it gapes, col: the colour its edges glow }
function slice(x, y, ang, len, o = {}) {
  slices.push({ x, y, ang, len, shift: o.shift === undefined ? 9 : o.shift, life: o.life || .32, t: -(o.delay || 0), w: o.w || 1, col: o.col || HOT });
  if (slices.length > 44) slices.shift();
}
// how far open it is at each moment of its life: quickly there, slowly shut
const gape = u => Math.sin(Math.min(1, u / .22) * Math.PI / 2) * (1 - Math.max(0, (u - .22) / .78)) ** 1.6;
function drawSlices(real) {
  for (let i = slices.length - 1; i >= 0; i--) if ((slices[i].t += real) >= slices[i].life) slices.splice(i, 1);
  if (!slices.length) return;
  const cv = g.canvas, VW = E.VW, gy = E.GY - 120, zoom = cam.zoom, px = cv.width / VW, geo = [];
  let moved = 0, shot = false;
  for (const s of slices) {
    if (s.t < 0) continue;
    const c = F(s.x, s.y), k = c[2] * zoom, cx = (c[0] - VW / 2) * zoom + VW / 2, cy = (c[1] - gy) * zoom + gy - cam.lift;
    const u = s.t / s.life, dx = Math.cos(s.ang), dy = -Math.sin(s.ang), L = s.len * k / 2, open = gape(u), grow = Math.min(1, u / .14);
    const q = { s, u, k, dx, dy, open, x0: cx - dx * L, y0: cy - dy * L, x1: cx - dx * L + dx * 2 * L * grow, y1: cy - dy * L + dy * 2 * L * grow };
    geo.push(q);
    const sh = s.shift * k * open;
    if (JU.reduceMotion || sh < .6 || moved >= MOVED) continue;
    moved++;
    if (!shot) {                                    // one copy of the picture as it stands; every cut that moves anything moves a piece of this
      if (!snap) { snap = document.createElement('canvas'); sctx = snap.getContext('2d'); }
      if (snap.width !== cv.width || snap.height !== cv.height) { snap.width = cv.width; snap.height = cv.height; }
      sctx.globalCompositeOperation = 'copy'; sctx.drawImage(cv, 0, 0); shot = true;
    }
    const B = clamp(L * .5, 30 * k, 150 * k), ex = cx + dx * L, ey = cy + dy * L;
    for (const side of [1, -1]) for (const [far, part] of [[B, .5], [B * .5, 1]]) {      // further from the cut it moves half as far, so nothing tears at the edge of what moved
      const nx = -dy * side * far, ny = dx * side * far;
      g.save(); g.beginPath();
      g.moveTo(q.x0, q.y0); g.lineTo(ex, ey); g.lineTo(ex - dx * L * .35 + nx, ey - dy * L * .35 + ny); g.lineTo(q.x0 + dx * L * .35 + nx, q.y0 + dy * L * .35 + ny);
      g.closePath(); g.clip();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.drawImage(snap, dx * sh * part * side * px, dy * sh * part * side * px);
      g.restore();
    }
  }
  for (const q of geo) {                            // and the cuts themselves, over whatever they moved
    const s = q.s, k = q.k, mx = (q.x0 + q.x1) / 2, my = (q.y0 + q.y1) / 2, gw = (2.5 + 5 * s.w) * k * q.open, nx = -q.dy * gw, ny = q.dx * gw;
    const lens = () => { g.beginPath(); g.moveTo(q.x0, q.y0); g.quadraticCurveTo(mx + nx, my + ny, q.x1, q.y1); g.quadraticCurveTo(mx - nx, my - ny, q.x0, q.y0); };
    g.save(); g.lineCap = 'round';
    lit(() => { g.strokeStyle = `rgba(${s.col},${.5 * q.open})`; g.lineWidth = (8 + 12 * s.w) * k * q.open + 1; g.beginPath(); g.moveTo(q.x0, q.y0); g.lineTo(q.x1, q.y1); g.stroke(); });
    if (gw > .4) { lens(); g.fillStyle = '#050208'; g.fill(); lit(() => { g.strokeStyle = `rgba(${s.col},${.9 * q.open})`; g.lineWidth = Math.max(1, 1.6 * k); g.stroke(); }); }
    if (q.u < .34) { g.strokeStyle = `rgba(255,255,255,${1 - q.u / .34})`; g.lineWidth = Math.max(1, 1.8 * k * s.w); g.beginPath(); g.moveTo(q.x0, q.y0); g.lineTo(q.x1, q.y1); g.stroke(); }
    g.restore();
  }
}

/* ================= the blade of air that carries one ================= */
// the outline of it, belly toward +x: an outer arc of radius r from -a to a, and an inner one bowed less
function moon(r, a, depth) {
  const tx = r * Math.cos(a), ty = r * Math.sin(a), d = r * depth, r2 = Math.hypot(tx + d, ty), a2 = Math.atan2(ty, tx + d);
  g.beginPath(); g.arc(0, 0, r, -a, a); g.arc(-d, 0, r2, a2, -a2, true); g.closePath();
}
// drawn at a place on the canvas: black, its cutting edge white, the air round it red
function blade(cx, cy, rot, r, a, al = 1, depth = .5, col = HOT) {
  g.save(); g.translate(cx, cy); g.rotate(rot);
  lit(() => { g.globalAlpha = .55 * al; g.strokeStyle = `rgb(${col})`; g.lineWidth = r * .24; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, r, -a, a); g.stroke(); });
  g.globalAlpha = al; moon(r, a, depth); g.fillStyle = '#060208'; g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = Math.max(1.5, r * .035); g.beginPath(); g.arc(0, 0, r, -a * .97, a * .97); g.stroke();
  g.restore(); g.globalAlpha = 1;
}
// one swung where he stands: it is there, it is a little further on, it is gone. face: which way its belly points; tilt: how far it is turned
function arc(x, y, face, r, tilt = 0, life = .16, col = HOT) {
  V.custom(life, u => {
    const c = F(x + face * (30 + 90 * ease(u)), y), k = c[2], grow = .55 + .45 * Math.min(1, u * 5);
    blade(c[0], c[1], (face > 0 ? 0 : Math.PI) - tilt * face, r * k * grow, 1.15, (1 - u) ** 1.4, .5, col);
  });
}
// one thrown: from x0 to x1 at height y in dur seconds, with what it was a moment ago still showing behind it. then() when it gets there
function fly(x0, x1, y, o = {}) {
  const face = x1 >= x0 ? 1 : -1, r = o.r || 110, dur = o.dur || .14, tilt = o.tilt || 0, col = o.col || HOT;
  let done = false;
  V.custom(dur + .1, u => {
    const v = Math.min(1, u * (dur + .1) / dur), rot = (face > 0 ? 0 : Math.PI) - tilt * face;
    if (v < 1) for (const [back, al] of [[.2, .22], [.1, .45], [0, 1]]) { const c = F(lerp(x0, x1, Math.max(0, v - back)), y); blade(c[0], c[1], rot, r * c[2], 1.2, al, .5, col); }
    else if (!done) { done = true; if (o.then) o.then(); }
  }, o.delay || 0);
}

/* ================= what is left afterwards ================= */
// a gash in the floor from (x0, z0) to (x1, z1) (z counted from where they stand, further back being more): w wide, black, and hot along its edges until it cools
function gash(x0, z0, x1, z1, w = 9, life = 3, o = {}) {
  const col = o.col || LAVA;
  V.custom(life, u => {
    const a = Math.min(1, (1 - u) * 4), hot = Math.max(0, 1 - u * 1.7), grow = Math.min(1, u * life * 14);
    const bx = lerp(x0, x1, grow), bz = lerp(z0, z1, grow), len = Math.hypot(bx - x0, bz - z0) || 1, nx = -(bz - z0) / len * w, nz = (bx - x0) / len * w, mx = (x0 + bx) / 2, mz = (z0 + bz) / 2;
    const A = P(x0, 0, zf(ZP + z0)), B = P(bx, 0, zf(ZP + bz)), M1 = P(mx + nx, 0, zf(ZP + mz + nz)), M2 = P(mx - nx, 0, zf(ZP + mz - nz));
    g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo(M1[0], M1[1], B[0], B[1]); g.quadraticCurveTo(M2[0], M2[1], A[0], A[1]);
    g.fillStyle = `rgba(3,1,4,${.92 * a})`; g.fill();
    if (hot > 0) lit(() => {
      g.strokeStyle = `rgba(${col},${hot})`; g.lineWidth = 1.5 + 3 * hot; g.stroke();
      g.strokeStyle = `rgba(255,226,190,${hot * .8})`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke();
    });
  }, o.delay || 0, true);
}
// the floor diced: gashes one way and the other, about x, reaching w to either side and d front to back
function grid(x, w, d, rows = 3, cols = 5, life = 3.4, o = {}) {
  for (let i = 0; i < rows; i++) { const z = lerp(-d, d, (i + .5) / rows) + rnd(-18, 18), s = rnd(-.06, .06); gash(x - w, z - s * w, x + w, z + s * w, 7, life, { col: o.col, delay: i * .03 }); }
  for (let i = 0; i < cols; i++) { const cx = x + lerp(-w, w, (i + .5) / cols) + rnd(-26, 26), s = rnd(-60, 60); gash(cx - s, -d, cx + s, d, 7, life, { col: o.col, delay: .05 + i * .025 }); }
}
// a web of them from one spot: spokes, and rings strung between the spokes (Spiderweb: a Cleave put into the ground)
function web(x, r, life = 3.2, o = {}) {
  const n = 9, spoke = Array.from({ length: n }, (_, i) => i / n * TAU + rnd(-.16, .16));
  for (const a of spoke) gash(x, 0, x + Math.cos(a) * r, Math.sin(a) * r * .55, 6, life, o);
  for (const k of [.34, .64, .92]) for (let i = 0; i < n; i++) {
    const a = spoke[i], b = spoke[(i + 1) % n] + (i === n - 1 ? TAU : 0), rr = r * k * rnd(.92, 1.06);
    gash(x + Math.cos(a) * rr, Math.sin(a) * rr * .55, x + Math.cos(b) * rr, Math.sin(b) * rr * .55, 4, life, { col: o.col, delay: .05 + k * .12 });
  }
}

/* ================= loose things: pieces, and ink ================= */
const bits = [];
// pieces of whatever was diced: black, square-cut, their cut faces still hot
function cubes(x, y, n, pow = 1) {
  for (let i = 0; i < n; i++) bits.push({ k: 'c', x: x + rnd(-50, 50), y: y + rnd(-40, 60), vx: rnd(-560, 560) * pow, vy: rnd(260, 1050) * pow, rot: rnd(0, TAU), vr: rnd(-10, 10), s: rnd(7, 20) * pow, hit: 0, t: 0, life: rnd(.9, 1.5) });
}
// ink thrown out of a cut, mostly the way dir points, and where each drop lands on the floor
function ink(x, y, dir, n, pow = 1, col = '#5c0714') {
  for (let i = 0; i < n; i++) bits.push({ k: 'i', x, y, vx: (dir * rnd(80, 760) + rnd(-220, 220)) * pow, vy: rnd(60, 720) * pow, r: rnd(2.5, 7), col, t: 0, life: rnd(.9, 1.5), flat: 0 });
}
function drawBits(dt) {
  for (let i = bits.length - 1; i >= 0; i--) {
    const b = bits[i];
    if ((b.t += dt) >= b.life) { bits.splice(i, 1); continue; }
    const u = b.t / b.life;
    if (!b.flat) { b.vy -= 2400 * dt; b.x += b.vx * dt; b.y += b.vy * dt; }
    if (b.k === 'i') {
      if (b.y <= 0 && !b.flat) { b.y = 0; b.flat = 1; b.t = b.life * .45; }     // it has landed: a spot on the floor, for a moment
      const c = F(b.x, b.y), r = b.r * c[2];
      g.globalAlpha = b.flat ? (1 - u) * 1.6 : 1; g.fillStyle = b.col;
      if (b.flat) { g.beginPath(); g.ellipse(c[0], c[1], r * 2.6, r * .7, 0, 0, TAU); g.fill(); continue; }
      const sp = Math.hypot(b.vx, b.vy) || 1, tx = -b.vx / sp * r * 3.4, ty = b.vy / sp * r * 3.4;     // a drop with its tail behind it
      g.beginPath(); g.moveTo(c[0] + tx, c[1] + ty); g.lineTo(c[0] - ty * .28, c[1] + tx * .28); g.lineTo(c[0] + ty * .28, c[1] - tx * .28); g.closePath(); g.fill();
      g.beginPath(); g.arc(c[0], c[1], r, 0, TAU); g.fill();
      continue;
    }
    b.rot += b.vr * dt;
    if (b.y < 0) { b.y = 0; b.vy = b.hit ? 0 : -b.vy * .32; b.vx *= .5; b.vr *= .4; b.hit = 1; }
    const c = F(b.x, b.y), s = b.s * c[2];
    g.save(); g.translate(c[0], c[1] - s); g.rotate(b.rot); g.globalAlpha = Math.min(1, (1 - u) * 3);
    g.fillStyle = '#0d0810'; g.fillRect(-s, -s, s * 2, s * 2); g.fillStyle = '#2a1c26'; g.fillRect(-s, -s, s * 2, s * .5);
    g.strokeStyle = `rgba(${LAVA},${Math.max(0, 1 - u * 1.8)})`; g.lineWidth = 2; g.strokeRect(-s, -s, s * 2, s * 2);
    g.restore();
  }
  g.globalAlpha = 1;
}

/* ================= put together ================= */
const tall = o => o.scale || 1;
// a target cut where it stands: n cuts through its body at whatever angles, the ink out of them, and (big) pieces
function dice(o, n, len = 260, big = false, delay = 0) {
  const hs = tall(o);
  for (let i = 0; i < n; i++) slice(o.x + rnd(-36, 36), o.y + rnd(60, 250) * hs, rnd(-1.25, 1.25), len * rnd(.8, 1.2), { shift: big ? 17 : 10, delay: delay + i * .028, w: big ? 1.7 : 1 });
  ink(o.x, o.y + 170 * hs, Math.random() < .5 ? -1 : 1, 3 + n * 2, big ? 1.1 : .8);
  if (big) cubes(o.x, o.y + 160 * hs, 8);
}
// cuts opening in the air across the whole arena about cx, and now and then one through the floor (Malevolent Shrine at work)
function storm(cx, n, heavy = false) {
  for (let i = 0; i < n; i++) {
    const x = cx + rnd(-760, 760), flat = Math.random() < .55;
    slice(x, rnd(40, 430), flat ? rnd(-.3, .3) : rnd(.5, 1.4) * (Math.random() < .5 ? 1 : -1), rnd(300, 640), { shift: heavy ? 12 : 8, delay: i * .035, w: heavy ? 1.2 : 1 });
    if (Math.random() < .5) gash(x - rnd(140, 320), rnd(-200, 260), x + rnd(140, 320), rnd(-200, 260), 7, 2.6);
    if (heavy && Math.random() < .6) cubes(x, rnd(0, 60), 3);
  }
}

/* ================= fire (Fuga) ================= */
// a tongue of flame standing on (x, y), h tall and w wide at the foot, wavering: dark red, orange, yellow, and white at the heart of it
function tongue(x, y, h, w, ph, a = 1) {
  const c = F(x, y), k = c[2], T = E.T, sway = Math.sin(T * 9 + ph) * w * .32 * k, hh = h * k * (1 + .12 * Math.sin(T * 13 + ph * 1.7)), tip = c[0] + sway + Math.sin(T * 5 + ph * 2) * w * .2 * k;
  g.globalAlpha = a; g.lineJoin = 'round';
  for (const [s, col] of [[1, '#a8130c'], [.74, '#ff7a1c'], [.46, '#ffd75a'], [.2, '#fff6cf']]) {
    const ww = w * k * s, top = c[1] - hh * (.5 + .5 * s), tx = lerp(c[0], tip, s);
    g.beginPath(); g.moveTo(c[0] - ww / 2, c[1]);
    g.bezierCurveTo(c[0] - ww * .72, c[1] - hh * .4 * s, tx - ww * .16 + sway * .4, top + hh * .26, tx, top);
    g.bezierCurveTo(tx + ww * .3 + sway * .4, top + hh * .34, c[0] + ww * .76, c[1] - hh * .3 * s, c[0] + ww / 2, c[1]);
    g.closePath(); g.fillStyle = col; g.fill();
    if (s === 1) { g.strokeStyle = '#3a0504'; g.lineWidth = 2; g.stroke(); }
  }
  g.globalAlpha = 1;
}
// a fire standing where something burst: tongues of it, most in the middle, for life seconds
function blaze(x, r, h, life = .9, n = 13) {
  const set = Array.from({ length: n }, (_, i) => { const v = (i + .5) / n * 2 - 1; return [x + v * r + rnd(-20, 20), h * (1 - .62 * v * v) * rnd(.75, 1.1), rnd(70, 130), rnd(0, TAU), rnd(0, .25)]; }).sort((a, b) => b[1] - a[1]);
  V.custom(life, u => {
    lit(() => { const c = F(x, h * .3); E.glow(E.GLOW.fire, c[0], c[1], r * 4.2 * c[2], .8 * (1 - u)); });
    for (const s of set) { const v = clamp((u - s[4]) / (1 - s[4]), 0, 1); if (v > 0) tongue(s[0], 0, s[1] * Math.sin(Math.min(1, v * 3.2) * Math.PI / 2) * (1 - v * .35), s[2], s[3], Math.min(1, (1 - v) * 2.4)); }
  });
}
// the arrow: lying along its flight from the nock (x, y) toward face, len long, with the fire coming off it
function arrow(x, y, face, len, a = 1) {
  const p0 = F(x, y), p1 = F(x + face * len, y), k = p0[2];
  lit(() => { E.glow(E.GLOW.fire, p1[0], p1[1], 240 * k, a); E.glow(E.GLOW.fire, (p0[0] + p1[0]) / 2, p0[1], 300 * k, .6 * a); });
  for (let i = 0; i < 5; i++) tongue(x + face * len * (.1 + i * .17), y - 6, 54 + 12 * Math.sin(E.T * 20 + i * 2), 28, i * 1.9, .9 * a);
  g.globalAlpha = a; g.lineCap = 'round';
  g.strokeStyle = '#a8130c'; g.lineWidth = 11 * k; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke();
  g.strokeStyle = '#ffd75a'; g.lineWidth = 5.5 * k; g.stroke(); g.strokeStyle = '#fff6cf'; g.lineWidth = 2 * k; g.stroke();
  g.fillStyle = '#ff7a1c'; g.strokeStyle = '#3a0504'; g.lineWidth = 2; g.lineJoin = 'round';      // the head of it
  g.beginPath(); g.moveTo(p1[0] + face * 40 * k, p1[1]); g.lineTo(p1[0] - face * 14 * k, p1[1] - 19 * k); g.lineTo(p1[0] - face * 3 * k, p1[1]); g.lineTo(p1[0] - face * 14 * k, p1[1] + 19 * k); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#fff6cf'; g.beginPath(); g.moveTo(p1[0] + face * 30 * k, p1[1]); g.lineTo(p1[0] - face * 3 * k, p1[1] - 8 * k); g.lineTo(p1[0] - face * 3 * k, p1[1] + 8 * k); g.closePath(); g.fill();
  g.lineCap = 'butt'; g.globalAlpha = 1;
}

/* ================= the frame it is all seen in, for an instant ================= */
// the way the anime shows a cut landing: first everything white with the cuts on it as hairlines and the two of them black; then
// the colour of raw meat, broad dark strokes across it, and the two of them white
let fr = null;
function frame(dur, x, y) { if (!JU.reduceMotion) fr = { t: 0, dur, x, y, seed: 1 + (Math.random() * 1e6 | 0) }; }
function drawFrame(real) {
  const f = fr, VW = E.VW, VH = E.VH, gy = E.GY - 120;
  if ((f.t += real) >= f.dur) { fr = null; return; }
  const first = f.t < f.dur * .4, c = F(f.x, f.y), cx = (c[0] - VW / 2) * cam.zoom + VW / 2, cy = (c[1] - gy) * cam.zoom + gy - cam.lift;
  let sd = f.seed + (first ? 0 : 7919);
  const rr = () => (sd = sd * 16807 % 2147483647) / 2147483647;
  g.save();
  g.fillStyle = first ? '#ffffff' : '#f3cdd3'; g.fillRect(0, 0, VW, VH);
  if (first) {
    g.strokeStyle = '#000'; g.lineWidth = 1.6; g.beginPath();
    for (let i = 0; i < 18; i++) { const a = rr() * Math.PI, l = VW * (.25 + rr() * .9), ox = (rr() - .5) * 300, oy = (rr() - .5) * 240; g.moveTo(cx + ox - Math.cos(a) * l, cy + oy - Math.sin(a) * l); g.lineTo(cx + ox + Math.cos(a) * l, cy + oy + Math.sin(a) * l); }
    g.stroke();
  } else {
    for (let i = 0; i < 11; i++) {                  // each stroke: thin where the brush came down, broad where it went through, thin where it lifted
      const a = -.45 + (rr() - .5) * 1.5 + (i % 3 === 2 ? 1.4 : 0), l = VW * (.4 + rr() * .7), w = 14 + rr() * 70, ox = (rr() - .5) * 420, oy = (rr() - .5) * 300, dx = Math.cos(a), dy = Math.sin(a);
      g.fillStyle = i % 3 ? '#7a0c20' : '#b3152f';
      g.beginPath(); g.moveTo(cx + ox - dx * l, cy + oy - dy * l); g.quadraticCurveTo(cx + ox - dy * w, cy + oy + dx * w, cx + ox + dx * l, cy + oy + dy * l); g.quadraticCurveTo(cx + ox + dy * w * .3, cy + oy - dx * w * .3, cx + ox - dx * l, cy + oy - dy * l); g.fill();
    }
  }
  g.translate(VW / 2, gy - cam.lift); g.scale(cam.zoom, cam.zoom); g.translate(-VW / 2, -gy);
  g.filter = first ? 'brightness(0)' : 'brightness(0) invert(1)';
  for (const p of [E.P2, E.P1]) if (p.alpha === undefined || p.alpha > .05) E.drawFighter(p);
  g.filter = 'none';
  g.restore();
}
// a character brushed onto the air for a moment: the name of what has just been done (解 for Dismantle, 捌 for Cleave)
function stamp(ch, x, y, size = 230, col = '#c8102e') {
  V.custom(.5, u => {
    const c = F(x, y), k = c[2], s = size * k * (1 + .5 * (1 - Math.min(1, u * 9)) ** 2), a = u < .5 ? 1 : 1 - (u - .5) / .5;
    g.save(); g.globalAlpha = .92 * a; g.font = `${Math.round(s)}px 'Yuji Syuku','Yu Mincho',serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = s * .09; g.strokeStyle = '#08030a'; g.strokeText(ch, c[0], c[1]); g.fillStyle = col; g.fillText(ch, c[0], c[1]);
    g.restore();
  });
}

// the light going out of everything behind the fight (for something drawn under the fighters to call)
const dim = a => { g.fillStyle = `rgba(2,1,4,${a})`; g.fillRect(-E.VW, -E.VH, E.VW * 3, E.VH * 3); };

/* ================= wiring ================= */
const post0 = H.post, fx0 = H.fx, clear0 = V.clear;
H.post = dt => { if (post0) post0(dt); const real = Math.min(.05, E.T - wall); wall = E.T; drawSlices(real); if (fr) drawFrame(real); };
H.fx = dt => { if (fx0) fx0(dt); drawBits(dt); };
V.clear = () => { clear0(); slices.length = bits.length = 0; fr = null; };

JU.cut = { slice, blade, arc, fly, gash, grid, web, cubes, ink, dice, storm, tongue, blaze, arrow, dim, frame, stamp, HOT, LAVA, get state() { return { slices: slices.length, bits: bits.length }; } };
})();
