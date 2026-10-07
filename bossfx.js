/* JUJUTSU UNLIMITEDS — the Boss VFX update, part one: what every boss fight shares.
   Until now a boss's move was a pose, a ring closing on it and a shape or two. This file is the light, smoke, sparks and weight that were
   missing, and it is given to every boss at once:
     - each has an element of its own (fire, blood, lightning, slashes, a soul's wisps, petals, plain steel ...) that its body gives off the
       whole fight, harder while it winds something up and harder again once it has been hurt into its later moves;
     - a move is called on a card, energy is dragged in to the body while it is held, and the big ones dim the world behind them;
     - it leaves afterimages when it moves fast; what it throws trails light and bursts; what it lands throws sparks, splashes and dust in
       its own element, flashes the screen its colour and marks the floor;
     - it is introduced when the fight begins, flares when a held-back move comes free, and goes out properly when it is beaten.
   The second half of this file is a box of pieces (explosions, beams, pillars, lightning, floor marks) that the movesets themselves are
   redrawn with: boss_b.js, boss_c.js, cast3 to cast6 and plants.js */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, P = E.P, cam = E.cam, H = E.hooks, V = JU.vfx, B = JU.boss, Fi = JU.fights, sfx = JU.sfx;
const { rnd, lerp, clamp, ZP } = E, TAU = Math.PI * 2, fight = Fi.fight;
const lite = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const few = () => (JU.reduceMotion ? .35 : 1);          // how much of it there is, for somebody who has asked for less motion
const ease = u => 1 - (1 - u) ** 3;

/* ---------- light: a soft lamp in any colour, and a cloud with no hot centre ---------- */
const lamps = {}, clouds = {};
function sprite(rgb, core) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  if (core) { gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.2, `rgba(${rgb},.85)`); gr.addColorStop(.5, `rgba(${rgb},.2)`); }
  else { gr.addColorStop(0, `rgba(${rgb},.9)`); gr.addColorStop(.45, `rgba(${rgb},.5)`); }
  gr.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return c;
}
const lamp = rgb => lamps[rgb] || (lamps[rgb] = sprite(rgb, true)), cloud = rgb => clouds[rgb] || (clouds[rgb] = sprite(rgb, false));
const glow = (rgb, x, y, s, a) => { if (a > .004 && s > 0) E.glow(lamp(rgb), x, y, s, Math.min(1, a)); };

/* ---------- particles. k: 0 a light, 1 a streak, 2 smoke, 3 a shard (rock, petal, paper), 4 a drop of something wet, 5 an ember ---------- */
const ps = [];
function emit(k, x, y, vx, vy, s, life, rgb, o) {
  if (ps.length > 640) ps.splice(0, 60);
  const p = { k, x, y, vx, vy, s, life, rgb, t: 0, g: 0, dr: 0, s1: 1, a: 1, rot: 0, vr: 0, w: 1, back: false };
  if (o) Object.assign(p, o);
  ps.push(p);
  return p;
}
function drawPs(dt, back) {
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    if (p.back !== back) continue;
    p.t += dt;
    if (p.t < 0) continue;
    if (p.t >= p.life) { ps.splice(i, 1); continue; }
    if (dt > 0) {
      p.vy -= p.g * dt;
      if (p.dr) { const d = Math.exp(-p.dr * dt); p.vx *= d; p.vy *= d; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.y < 0 && p.k === 4) { if (p.land) decal(p.land, p.x, p.s * rnd(1.8, 3), p.rgb, 6); ps.splice(i, 1); continue; }
      if (p.y < 0 && p.k === 3) { p.y = 0; p.vy = -p.vy * .3; p.vx *= .5; p.vr *= .4; }
    }
    const u = p.t / p.life, c = F(p.x, Math.max(0, p.y)), k = c[2];
    if (p.k === 0) { g.globalCompositeOperation = 'lighter'; glow(p.rgb, c[0], c[1], p.s * lerp(1, p.s1, u) * k, p.a * (1 - u)); }
    else if (p.k === 1) {
      const d = F(p.x - p.vx * .04, Math.max(0, p.y - p.vy * .04));
      g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(${p.rgb},${p.a * (1 - u)})`; g.lineWidth = Math.max(1, p.s * k * (1 - u * .5)); g.lineCap = 'round';
      g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.stroke(); g.lineCap = 'butt';
    }
    else if (p.k === 2) E.glow(cloud(p.rgb), c[0], c[1], p.s * lerp(1, p.s1, u) * k, p.a * (1 - u) * Math.min(1, u * 6));
    else if (p.k === 3) {
      const s = p.s * k;
      g.save(); g.translate(c[0], c[1]); g.rotate(p.rot); g.globalAlpha = p.a * Math.min(1, (1 - u) * 3); g.fillStyle = `rgb(${p.rgb})`; g.fillRect(-s, -s * p.w, s * 2, s * 2 * p.w);
      if (p.edge) { g.strokeStyle = p.edge; g.lineWidth = 1.5; g.strokeRect(-s, -s * p.w, s * 2, s * 2 * p.w); }
      g.restore(); g.globalAlpha = 1;
    }
    else if (p.k === 4) {
      const sp = Math.hypot(p.vx, p.vy), s = p.s * k;
      g.fillStyle = `rgb(${p.rgb})`; g.globalAlpha = p.a; g.beginPath(); g.ellipse(c[0], c[1], s * (1 + sp / 900), s * .8, Math.atan2(-p.vy, p.vx), 0, TAU); g.fill(); g.globalAlpha = 1;
    }
    else { const s = p.s * k; g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(${p.rgb},${p.a * (1 - u) * (.6 + .4 * Math.sin(p.t * 40 + p.x))})`; g.fillRect(c[0] - s / 2, c[1] - s / 2, s, s); }
    g.globalCompositeOperation = 'source-over';
  }
}

/* ---------- what is left on the floor: scorch, blood, a dent ---------- */
const decals = [];
function decal(kind, x, r, rgb, life = 6, dz) {
  if (decals.length > 28) decals.shift();
  decals.push({ kind, x, r, rgb, life, t: 0, dz: dz === undefined ? rnd(-46, 46) : dz, seed: rnd(1, 90) });
}
function drawDecals(dt) {
  for (let i = decals.length - 1; i >= 0; i--) {
    const d = decals[i];
    d.t += dt;
    if (d.t >= d.life) { decals.splice(i, 1); continue; }
    const a = Math.min(1, (d.life - d.t) / 1.5) * Math.min(1, d.t * 12), c = P(d.x, 0, ZP + d.dz), k = c[2], r = d.r * k, sd = n => Math.abs(Math.sin(d.seed * (n + 1) * 12.9898) * 43758.5453) % 1;
    if (d.kind === 'blood') {
      g.fillStyle = `rgba(${d.rgb},${.82 * a})`;
      for (let j = 0; j < 5; j++) { g.beginPath(); g.ellipse(c[0] + (sd(j) - .5) * r * 1.5, c[1] + (sd(j + 9) - .5) * r * .34, r * (.3 + sd(j + 3) * .5), r * (.3 + sd(j + 3) * .5) * .26, 0, 0, TAU); g.fill(); }
    } else {                                        // scorch, crater
      g.fillStyle = `rgba(6,3,8,${(d.kind === 'crater' ? .7 : .55) * a})`; g.beginPath(); g.ellipse(c[0], c[1], r, r * .26, 0, 0, TAU); g.fill();
      for (let j = 0; j < 6; j++) { const an = sd(j) * TAU; g.beginPath(); g.ellipse(c[0] + Math.cos(an) * r * .8, c[1] + Math.sin(an) * r * .2, r * .34, r * .09, 0, 0, TAU); g.fill(); }
      const hot = Math.max(0, 1 - d.t / 2.2) * a;
      if (hot > .02) lite(() => { g.strokeStyle = `rgba(${d.rgb},${.7 * hot})`; g.lineWidth = 3 * k; g.beginPath(); g.ellipse(c[0], c[1], r * .7, r * .18, 0, 0, TAU); g.stroke(); glow(d.rgb, c[0], c[1], r * 2.4, .3 * hot); });
    }
  }
}

/* ---------- lightning that forks, rings that run out along the floor, the whole screen lit or dimmed ---------- */
const zaps = [], shocks = [], flashes = [], ghosts = [];
let dimA = 0, dimTo = 0, dimHold = 0;
const lightning = (x0, y0, x1, y1, rgb, life = .2, w = 3, forks = 2) => zaps.push({ x0, y0, x1, y1, rgb, life, w, forks, t: 0 });
function fork(a, b, w, rgb, al, n) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len, pts = [a];
  for (let j = 1; j < n; j++) { const u = j / n, o = rnd(-1, 1) * len * .1; pts.push([lerp(a[0], b[0], u) + nx * o, lerp(a[1], b[1], u) + ny * o]); }
  pts.push(b);
  g.beginPath(); pts.forEach((q, j) => (j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])));
  g.lineJoin = 'miter'; g.strokeStyle = `rgba(${rgb},${.55 * al})`; g.lineWidth = w * 4; g.stroke();
  g.strokeStyle = `rgba(255,255,255,${al})`; g.lineWidth = w; g.stroke();
  return pts;
}
function drawZaps(dt) {
  for (let i = zaps.length - 1; i >= 0; i--) {
    const z = zaps[i];
    z.t += dt;
    if (z.t >= z.life) { zaps.splice(i, 1); continue; }
    const al = 1 - z.t / z.life, a = F(z.x0, z.y0), b = F(z.x1, z.y1);
    lite(() => {
      const pts = fork(a, b, z.w * a[2], z.rgb, al, 9);
      for (let j = 0; j < z.forks; j++) { const q = pts[2 + (Math.random() * 5 | 0)], an = Math.atan2(b[1] - a[1], b[0] - a[0]) + rnd(-1.1, 1.1), l = Math.hypot(b[0] - a[0], b[1] - a[1]) * rnd(.2, .42); fork(q, [q[0] + Math.cos(an) * l, q[1] + Math.sin(an) * l], z.w * a[2] * .6, z.rgb, al * .8, 5); }
      glow(z.rgb, b[0], b[1], 150 * b[2], al * .8);
    });
  }
}
const shock = (x, r, rgb, life = .5, w = 10) => shocks.push({ x, r, rgb, life, w, t: 0 });
function drawShocks(dt) {
  for (let i = shocks.length - 1; i >= 0; i--) {
    const s = shocks[i];
    s.t += dt;
    if (s.t >= s.life) { shocks.splice(i, 1); continue; }
    const u = s.t / s.life, c = F(s.x, 0), r = s.r * ease(u) * c[2];
    lite(() => {
      g.strokeStyle = `rgba(${s.rgb},${1 - u})`; g.lineWidth = (s.w * (1 - u) + 1) * c[2]; g.beginPath(); g.ellipse(c[0], c[1] + 3, r, r * .26, 0, 0, TAU); g.stroke();
      g.strokeStyle = `rgba(255,255,255,${.7 * (1 - u)})`; g.lineWidth = 2 * c[2]; g.beginPath(); g.ellipse(c[0], c[1] + 3, r * .93, r * .93 * .26, 0, 0, TAU); g.stroke();
      g.fillStyle = `rgba(${s.rgb},${.12 * (1 - u)})`; g.beginPath(); g.ellipse(c[0], c[1] + 3, r, r * .26, 0, 0, TAU); g.fill();
    });
  }
}
function flash(rgb, a = .25, life = .25) { if (!JU.reduceMotion && a > 0) flashes.push({ rgb, a, life, t: 0 }); }
function dim(a, hold) { dimTo = Math.max(dimTo, a); dimHold = Math.max(dimHold, hold); }
// what somebody looked like a moment ago, left hanging where they were
function ghost(o, a = .45, life = .22) {
  if (ghosts.length > 14) ghosts.shift();
  ghosts.push({ f: { skin: o.skin, x: o.x, y: o.y, face: o.face, spin: o.spin || 1, pose: o.pose.slice(), scale: o.scale, z: o.z }, a, life, t: 0 });
}
// a four-pointed glint
function flare(x, y, rgb, len = 260, life = .2) {
  V.custom(life, u => {
    const c = F(x, y), k = c[2], l = len * k * (.4 + .6 * ease(Math.min(1, u * 3))) * (1 - u * .5), al = 1 - u;
    lite(() => {
      g.fillStyle = `rgba(${rgb},${al})`;
      for (const [ax, ay] of [[1, .08], [.08, 1]]) { g.beginPath(); g.moveTo(c[0] - l * ax, c[1]); g.lineTo(c[0], c[1] - l * ay); g.lineTo(c[0] + l * ax, c[1]); g.lineTo(c[0], c[1] + l * ay); g.closePath(); g.fill(); }
      glow('255,255,255', c[0], c[1], l * .9, al);
    });
  });
}
function dust(x, n = 6, dir = 0, y = 0) {
  for (let i = 0; i < n * few(); i++) emit(2, x + rnd(-40, 40), y + rnd(6, 34), dir * rnd(120, 420) + rnd(-150, 150), rnd(20, 130), rnd(70, 140), rnd(.5, 1), '150,140,165', { s1: 2.1, a: .42, dr: 2.6, back: Math.random() < .5 });
}

/* ---------- the big pieces the movesets are drawn with ---------- */
// something going up: a white heart, a ball of its colour, tongues thrown out of it, sparks, smoke after, a ring along the floor, a scorch
function boom(x, y, r, rgb, o = {}) {
  const hot = o.hot || '255,244,214', n = Math.round((o.n === undefined ? 22 : o.n) * few());
  flash(rgb, o.flash === undefined ? .2 : o.flash, .3);
  if (o.shake !== 0) cam.shake = Math.max(cam.shake, o.shake || r * .09);
  V.custom(o.life || .55, u => {
    const c = F(x, y), k = c[2], grow = ease(Math.min(1, u * 2.4));
    lite(() => {
      glow(rgb, c[0], c[1], r * 5.6 * grow * k, (1 - u) * .9); glow(hot, c[0], c[1], r * 2.7 * grow * k, 1 - u * u);
      g.fillStyle = `rgba(${rgb},${.8 * (1 - u)})`;
      for (let i = 0; i < 11; i++) {
        const a = i / 11 * TAU + i * 1.7, l = r * (1 + .5 * ((i * 7) % 3)) * grow * k, w = r * .24 * (1 - u) * k;
        g.beginPath(); g.moveTo(c[0] + Math.cos(a + 1.57) * w, c[1] - Math.sin(a + 1.57) * w); g.lineTo(c[0] + Math.cos(a) * l, c[1] - Math.sin(a) * l * .9); g.lineTo(c[0] + Math.cos(a - 1.57) * w, c[1] - Math.sin(a - 1.57) * w); g.closePath(); g.fill();
      }
    });
    if (u < .22) { g.globalAlpha = 1 - u / .22; g.fillStyle = '#fff'; g.beginPath(); g.arc(c[0], c[1], r * .75 * grow * k, 0, TAU); g.fill(); g.globalAlpha = 1; }
  });
  for (let i = 0; i < n; i++) { const a = rnd(0, TAU), v = rnd(.5, 1.6) * r * 4.2; emit(i % 3 ? 1 : 5, x, y, Math.cos(a) * v, Math.sin(a) * v + r, rnd(3, 7), rnd(.3, .7), i & 1 ? rgb : hot, { g: 900, dr: 1.5 }); }
  if (!o.clean) for (let i = 0; i < 6 * few(); i++) emit(2, x + rnd(-r, r) * .6, y + rnd(0, r * .6), rnd(-60, 60), rnd(120, 300), r * rnd(1.2, 2), rnd(.8, 1.5), o.smoke || '34,26,38', { s1: 2.2, a: .7, t: -rnd(.05, .3) });
  V.ring(x, y, r * 2.1, `rgb(${rgb})`, .35);
  if (y < r * 1.6) { shock(x, r * 2.7, rgb, .55, 12); if (!o.clean) decal('scorch', x, r * 1.25, rgb, 7); }
}
// a beam: a sheath of its colour round a white core, rings running down it, a flare where it leaves and where it ends, light on the floor under it
function beamAt(x0, x1, y, w, rgb, a) {
  const A = F(x0, y), Z = F(x1, y), k = A[2], hw = w * k, L = Math.min(A[0], Z[0]), W = Math.abs(Z[0] - A[0]);
  lite(() => {
    const gr = g.createLinearGradient(0, A[1] - hw * 2.2, 0, A[1] + hw * 2.2);
    gr.addColorStop(0, `rgba(${rgb},0)`); gr.addColorStop(.32, `rgba(${rgb},${.6 * a})`); gr.addColorStop(.5, `rgba(255,255,255,${a})`); gr.addColorStop(.68, `rgba(${rgb},${.6 * a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(L, A[1] - hw * 2.2, W, hw * 4.4);
    g.strokeStyle = `rgba(255,255,255,${.5 * a})`; g.lineWidth = 2;
    for (let i = 0; i < 7; i++) { const u = (E.T * 2.6 + i / 7) % 1; g.beginPath(); g.ellipse(lerp(A[0], Z[0], u), A[1], hw * .4, hw * (1.1 + u), 0, 0, TAU); g.stroke(); }
    glow(rgb, A[0], A[1], hw * 9, a); glow('255,255,255', A[0], A[1], hw * 4.5, a); glow(rgb, Z[0], Z[1], hw * 6, a * .8);
    const fl = F((x0 + x1) / 2, 0); g.fillStyle = `rgba(${rgb},${.13 * a})`; g.beginPath(); g.ellipse(fl[0], fl[1], W / 2, 30 * k, 0, 0, TAU); g.fill();
  });
}
function beam(x0, x1, y, w, rgb, life = .5) {
  const d = Math.sign(x1 - x0) || 1;
  V.custom(life, u => { beamAt(x0, x1, y, w * (1 - u * u), rgb, 1 - u * u); if (Math.random() < .8 * few()) emit(1, lerp(x0, x1, Math.random()), y + rnd(-w, w), d * rnd(300, 900), rnd(-200, 200), rnd(2, 5), rnd(.15, .3), rgb); });
  flare(x0, y, rgb, w * 5, .22); flash(rgb, .18, .25);
}
// a column of it standing up off the floor
function pillar(x, w, h, rgb, life = .6) {
  V.custom(life, u => {
    const a = F(x, 0), top = F(x, h), k = a[2], al = u < .1 ? u / .1 : 1 - (u - .1) / .9, wd = w * k * (u < .12 ? u / .12 : 1 - (u - .12) * .5);
    lite(() => {
      const gr = g.createLinearGradient(a[0] - wd, 0, a[0] + wd, 0);
      gr.addColorStop(0, `rgba(${rgb},0)`); gr.addColorStop(.3, `rgba(${rgb},${.7 * al})`); gr.addColorStop(.5, `rgba(255,255,255,${al})`); gr.addColorStop(.7, `rgba(${rgb},${.7 * al})`); gr.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gr; g.fillRect(a[0] - wd, top[1], wd * 2, a[1] - top[1]); glow(rgb, a[0], a[1], w * 5 * k, al * .8);
    });
    if (Math.random() < .7 * few()) emit(5, x + rnd(-w, w), rnd(0, h * .5), rnd(-40, 40), rnd(300, 800), rnd(3, 6), rnd(.3, .6), rgb);
  });
  shock(x, w * 2.6, rgb, life * .8);
}
// a ring of marks turning on the floor: where something is being called down, or where it stands while it gathers
function rune(x, r, rgb, a, spin, fill) {
  const c = F(x, 0), k = c[2], R = r * k;
  lite(() => {
    if (fill) { g.fillStyle = `rgba(${rgb},${fill})`; g.beginPath(); g.ellipse(c[0], c[1], R, R * .26, 0, 0, TAU); g.fill(); }
    g.strokeStyle = `rgba(${rgb},${a})`; g.lineWidth = 3 * k; g.beginPath(); g.ellipse(c[0], c[1], R, R * .26, 0, 0, TAU); g.stroke();
    g.lineWidth = 1.5 * k; g.beginPath(); g.ellipse(c[0], c[1], R * .8, R * .8 * .26, 0, 0, TAU); g.stroke();
    g.beginPath();
    for (let i = 0; i < 12; i++) { const an = i / 12 * TAU + spin, ca = Math.cos(an), sa = Math.sin(an) * .26; g.moveTo(c[0] + ca * R * .8, c[1] + sa * R * .8); g.lineTo(c[0] + ca * R * (i % 3 ? .9 : 1.08), c[1] + sa * R * (i % 3 ? .9 : 1.08)); }
    g.stroke();
  });
}
// the trail something thrown leaves: a ribbon through where it has just been
function tail(pts, r, rgb) {
  const n = pts.length;
  if (n < 2) return;
  lite(() => {
    g.lineCap = 'round';
    for (let i = 1; i < n; i++) { const a = F(pts[i - 1][0], pts[i - 1][1]), b = F(pts[i][0], pts[i][1]), u = i / n; g.strokeStyle = `rgba(${rgb},${.55 * u})`; g.lineWidth = r * 1.5 * u * b[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    g.lineCap = 'butt';
    const h = F(pts[n - 1][0], pts[n - 1][1]); glow(rgb, h[0], h[1], r * 6 * h[2], .7);
  });
}
// a ball of cursed energy: dark at the heart, a bright skin, arcs crawling over it
function orb(x, y, r, rgb, core = '#0b0306') {
  const c = F(x, y), k = c[2], R = r * k, T = E.T;
  lite(() => { glow(rgb, c[0], c[1], R * 6.5, .9); glow('255,255,255', c[0], c[1], R * 2.6, .5 + .2 * Math.sin(T * 30 + x)); });
  g.fillStyle = core; g.beginPath(); g.arc(c[0], c[1], R * .82, 0, TAU); g.fill();
  lite(() => {
    g.strokeStyle = `rgba(${rgb},.95)`; g.lineWidth = 3 * k; g.beginPath(); g.arc(c[0], c[1], R, 0, TAU); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.6 * k;
    for (let i = 0; i < 3; i++) { const a = T * (7 + i * 3) + i * 2.1 + x * .01; g.beginPath(); g.ellipse(c[0], c[1], R * 1.15, R * (.35 + i * .2), a, 0, Math.PI * .9); g.stroke(); }
  });
}

/* ---------- each boss's element ---------- */
const TH = {
  finger: ['energy', '255,70,100', '255,190,200'], jogo: ['fire', '255,140,60', '255,225,130'], todo: ['force', '122,215,255', '255,255,255'], mahito: ['soul', '120,230,200', '196,170,255'],
  sukuna: ['slash', '255,36,64', '255,170,170'], hanami: ['plant', '125,220,106', '255,150,190'], eso: ['blood', '224,69,122', '120,14,44'], kechizu: ['acid', '141,255,106', '64,130,40'],
  maki: ['steel', '232,240,255', '125,220,154'], toji: ['steel', '207,216,224', '255,255,255'], choso: ['blood', '224,32,60', '110,6,22'], mahoraga: ['gold', '226,192,96', '255,243,176'],
  naoya: ['frame', '255,210,61', '255,236,170'], yuta: ['dark', '201,160,255', '255,120,190'], ogi: ['fire', '255,140,60', '255,225,130'], panda: ['force', '207,216,224', '255,255,255'],
  hakari: ['energy', '122,215,255', '255,110,210'], haba: ['wind', '159,216,255', '255,255,255'], higuruma: ['gold', '255,210,61', '255,255,255'], higuruma2: ['gold', '255,210,61', '255,255,255'],
  reggie: ['paper', '241,238,226', '255,210,120'], uro: ['sky', '185,168,255', '232,240,255'], ishigori: ['energy', '127,233,255', '255,255,255'], kashimo: ['bolt', '120,220,255', '255,255,255'],
  naoya2: ['frame', '255,106,208', '255,200,240'], kenjaku: ['dark', '201,165,58', '150,90,200'], yorozu: ['metal', '226,232,244', '255,120,150']
};
const hex = h => { const n = parseInt(h.slice(1), 16); return `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`; };
const PLAIN = { el: 'energy', c1: '255,255,255', c2: '255,255,255' };
function themeOf(o) {
  const k = o && o.ai && o.ai.d.kit;
  if (!k) return null;
  if (!k.fx) {
    let t = null;
    for (const id in TH) if (Fi.DEFS[id] && Fi.DEFS[id].kit === k) { t = TH[id]; break; }
    k.fx = t ? { el: t[0], c1: t[1], c2: t[2] } : { el: 'energy', c1: /^#[0-9a-f]{6}$/i.test(k.col) ? hex(k.col) : '255,255,255', c2: '255,255,255' };
  }
  return k.fx;
}
const winding = o => { const A = o.state === 'act' && o.act; return A && A.a.run && A.t < (A.a.wind || .5) ? A.t / (A.a.wind || .5) : 0; };
const rage = o => o.fxRage || 0;                     // how many of its held-back moves have come free

// what its body gives off. s: its size, pow: how hard (more while it winds up, more once it has been hurt into its later moves)
const up = (o, s, x = 55, y0 = 20, y1 = 270) => [o.x + rnd(-x, x) * s, o.y + rnd(y0, y1) * s];
const AURA = {
  fire(o, s, th, pow, dt) {
    if (Math.random() < dt * 26 * pow) { const q = up(o, s); emit(0, q[0], q[1], rnd(-30, 30), rnd(140, 380), rnd(50, 110) * s, rnd(.3, .6), th.c1, { back: Math.random() < .6, s1: .4 }); }
    if (Math.random() < dt * 16 * pow) { const q = up(o, s, 75, 0, 200); emit(5, q[0], q[1], rnd(-60, 60), rnd(200, 520), rnd(3, 6), rnd(.6, 1.2), th.c2, { dr: .6 }); }
    if (Math.random() < dt * 5 * pow) { const q = up(o, s, 40, 230, 320); emit(2, q[0], q[1], rnd(-20, 20), rnd(80, 160), rnd(70, 120), rnd(.8, 1.3), '40,30,34', { s1: 2, a: .35, back: true }); }
  },
  energy(o, s, th, pow, dt) {
    if (Math.random() < dt * 22 * pow) { const q = up(o, s); emit(0, q[0], q[1], rnd(-40, 40), rnd(160, 420), rnd(44, 96) * s, rnd(.25, .5), th.c1, { back: Math.random() < .6, s1: .3 }); }
    if (Math.random() < dt * 14 * pow) { const q = up(o, s, 70, 0, 120); emit(1, q[0], q[1], rnd(-30, 30), rnd(500, 1000), rnd(2, 4), rnd(.2, .4), th.c2, { back: true }); }
  },
  blood(o, s, th, pow, dt) {
    if (Math.random() < dt * 14 * pow) { const q = up(o, s); emit(0, q[0], q[1], rnd(-20, 20), rnd(60, 200), rnd(30, 60) * s, rnd(.4, .8), th.c1, { back: Math.random() < .5, s1: .3 }); }
    if (Math.random() < dt * 9 * pow) { const q = up(o, s, 60, 60, 240); emit(4, q[0], q[1], rnd(-90, 90), rnd(60, 260), rnd(3, 6), 2, th.c2, { g: 1300, land: 'blood' }); }
  },
  acid(o, s, th, pow, dt) {
    if (Math.random() < dt * 14 * pow) { const q = up(o, s); emit(0, q[0], q[1], rnd(-20, 20), rnd(80, 220), rnd(20, 44) * s, rnd(.5, .9), th.c1, { s1: .2 }); }
    if (Math.random() < dt * 7 * pow) { const q = up(o, s, 60, 60, 240); emit(4, q[0], q[1], rnd(-90, 90), rnd(40, 220), rnd(3, 6), 2, th.c2, { g: 1300, land: 'blood' }); }
  },
  bolt(o, s, th, pow, dt) {
    if (Math.random() < dt * 10 * pow) { const q = up(o, s, 40, 40, 260), a = rnd(0, TAU), r = rnd(70, 170) * s; lightning(q[0], q[1], q[0] + Math.cos(a) * r, Math.max(0, q[1] + Math.sin(a) * r), th.c1, rnd(.07, .15), 2, 0); }
    if (Math.random() < dt * 14 * pow) { const q = up(o, s, 70, 0, 280); emit(5, q[0], q[1], rnd(-200, 200), rnd(-100, 300), rnd(3, 5), rnd(.2, .5), th.c2); }
  },
  slash(o, s, th, pow, dt) {
    if (Math.random() < dt * 5 * pow) V.slash(o.x + rnd(-130, 130) * s, o.y + rnd(40, 310) * s, rnd(0, Math.PI), rnd(90, 210), `rgb(${th.c1})`, 3);
    if (Math.random() < dt * 14 * pow) { const q = up(o, s, 70, 0, 200); emit(5, q[0], q[1], rnd(-40, 40), rnd(120, 360), rnd(3, 6), rnd(.6, 1.1), th.c1); }
    if (Math.random() < dt * 6 * pow) { const q = up(o, s, 50, 0, 120); emit(2, q[0], q[1], rnd(-20, 20), rnd(60, 140), rnd(80, 130), rnd(.8, 1.3), '40,0,10', { s1: 1.8, a: .5, back: true }); }
  },
  soul(o, s, th, pow, dt) {
    if (Math.random() < dt * 18 * pow) { const q = up(o, s, 80), sd = Math.random() < .5 ? 1 : -1; emit(0, q[0], q[1], sd * rnd(60, 200), rnd(60, 240), rnd(26, 60) * s, rnd(.5, 1), Math.random() < .7 ? th.c1 : th.c2, { back: Math.random() < .5, s1: .2, dr: 1.5 }); }
  },
  plant(o, s, th, pow, dt) {
    if (Math.random() < dt * 9 * pow) { const q = up(o, s, 120, 120, 360); emit(3, q[0], q[1], rnd(-120, 120), rnd(-40, 80), rnd(5, 9), rnd(1.2, 2.2), Math.random() < .5 ? th.c2 : '255,214,228', { g: 160, dr: 1.2, vr: rnd(-6, 6), w: .55, rot: rnd(0, TAU), back: Math.random() < .5 }); }
    if (Math.random() < dt * 9 * pow) { const q = up(o, s); emit(0, q[0], q[1], rnd(-30, 30), rnd(40, 140), rnd(16, 34), rnd(.6, 1.2), th.c1, { s1: .3 }); }
  },
  steel(o, s, th, pow, dt) {                        // no cursed energy at all: nothing comes off them but the air they move
    if (pow > .6 && Math.random() < dt * 26 * (pow - .5)) { const q = up(o, s, 150, 20, 300), d = Math.random() < .5 ? 1 : -1; emit(1, q[0], q[1], d * rnd(500, 1100), rnd(-30, 30), rnd(1.5, 3), rnd(.12, .25), '255,255,255', { a: .5, back: true }); }
    if (pow > .6 && Math.random() < dt * 8) dust(o.x, 1);
  },
  force(o, s, th, pow, dt) {
    if (Math.random() < dt * 9 * pow) { const q = up(o, s); emit(0, q[0], q[1], rnd(-30, 30), rnd(100, 300), rnd(40, 80) * s, rnd(.25, .5), th.c1, { back: true, s1: .3, a: .7 }); }
    if (pow > .6 && Math.random() < dt * 10) dust(o.x, 1);
  },
  gold(o, s, th, pow, dt) {
    if (Math.random() < dt * 16 * pow) { const q = up(o, s, 80, 0, 300); emit(5, q[0], q[1], rnd(-30, 30), rnd(80, 300), rnd(3, 6), rnd(.7, 1.3), Math.random() < .6 ? th.c1 : th.c2, { dr: .4 }); }
    if (Math.random() < dt * 8 * pow) { const q = up(o, s); emit(0, q[0], q[1], 0, rnd(60, 160), rnd(40, 80) * s, rnd(.4, .7), th.c1, { back: true, s1: .4, a: .6 }); }
  },
  frame(o, s, th, pow, dt) {
    if (Math.random() < dt * 14 * pow) { const q = up(o, s, 80, 0, 300); emit(5, q[0], q[1], rnd(-200, 200), rnd(-40, 140), rnd(3, 6), rnd(.3, .7), th.c1); }
    if (pow > .6 && Math.random() < dt * 14) ghost(o, .28, .2);       // a second of film: where he was a frame ago
  },
  dark(o, s, th, pow, dt) {
    if (Math.random() < dt * 14 * pow) { const q = up(o, s, 70, 0, 280); emit(2, q[0], q[1], rnd(-40, 40), rnd(80, 240), rnd(70, 130) * s, rnd(.6, 1.1), '18,8,30', { s1: 1.8, a: .6, back: Math.random() < .6 }); }
    if (Math.random() < dt * 14 * pow) { const q = up(o, s); emit(5, q[0], q[1], rnd(-60, 60), rnd(120, 400), rnd(3, 6), rnd(.5, 1), Math.random() < .5 ? th.c1 : th.c2); }
  },
  sky(o, s, th, pow, dt) {
    if (Math.random() < dt * 9 * pow) { const q = up(o, s, 110, 0, 320); emit(3, q[0], q[1], rnd(-60, 60), rnd(60, 220), rnd(6, 12), rnd(.6, 1.2), th.c2, { vr: rnd(-5, 5), w: .16, rot: rnd(0, TAU), a: .8, back: Math.random() < .5 }); }
    if (Math.random() < dt * 9 * pow) { const q = up(o, s); emit(0, q[0], q[1], 0, rnd(40, 120), rnd(40, 80), rnd(.5, .9), th.c1, { s1: .3, a: .7, back: true }); }
  },
  metal(o, s, th, pow, dt) {
    if (Math.random() < dt * 12 * pow) { const q = up(o, s, 80, 40, 280); emit(4, q[0], q[1], rnd(-140, 140), rnd(80, 320), rnd(3, 6), 1.6, th.c1, { g: 900 }); }
    if (Math.random() < dt * 8 * pow) { const q = up(o, s); emit(0, q[0], q[1], 0, rnd(40, 120), rnd(20, 44), rnd(.3, .6), th.c2, { s1: .3 }); }
  },
  paper(o, s, th, pow, dt) {
    if (Math.random() < dt * 9 * pow) { const q = up(o, s, 130, 60, 340); emit(3, q[0], q[1], rnd(-160, 160), rnd(-20, 160), rnd(6, 10), rnd(1, 1.8), th.c1, { g: 220, dr: 1.4, vr: rnd(-8, 8), w: 1.7, rot: rnd(0, TAU), edge: 'rgba(30,24,20,.5)', back: Math.random() < .5 }); }
  },
  wind(o, s, th, pow, dt) {
    if (Math.random() < dt * 22 * pow) { const q = up(o, s, 170, 20, 330), d = Math.random() < .5 ? 1 : -1; emit(1, q[0], q[1], d * rnd(600, 1300), rnd(-60, 60), rnd(1.5, 3.5), rnd(.12, .26), th.c1, { a: .6, back: Math.random() < .5 }); }
    if (Math.random() < dt * 5 * pow) dust(o.x, 1);
  }
};
// what a blow of its throws off whatever it lands on
function spray(el, x, y, face, heavy, th) {
  const n = Math.round((heavy ? 16 : 8) * few()), c1 = th.c1, c2 = th.c2, back = face > 0 ? 0 : Math.PI, wet = el === 'blood' || el === 'acid' || el === 'metal';
  for (let i = 0; i < n; i++) { const a = rnd(-.9, .9) + back, v = rnd(400, 1100) * (heavy ? 1.3 : 1); emit(1, x, y, Math.cos(a) * v, Math.sin(a) * v + 120, rnd(3, 6), rnd(.16, .34), i & 1 ? c1 : '255,255,255', { g: 1200, dr: 2 }); }
  emit(0, x, y, 0, 0, heavy ? 560 : 320, .18, c1, { s1: 1.6 });
  if (el === 'fire') boom(x, y, heavy ? 95 : 52, c1, { n: 8, flash: 0, shake: 0, clean: !heavy });
  else if (wet) { for (let i = 0; i < n; i++) emit(4, x, y, face * rnd(100, 700) + rnd(-200, 200), rnd(100, 700), rnd(4, 8), 2, el === 'metal' ? c1 : c2, { g: 1700, land: el === 'metal' ? null : 'blood' }); if (el !== 'metal') decal('blood', x, heavy ? 90 : 55, c2, 7); }
  else if (el === 'bolt') { for (let i = 0; i < (heavy ? 7 : 4); i++) { const a = rnd(0, TAU), l = rnd(140, heavy ? 420 : 260); lightning(x, y, x + Math.cos(a) * l, Math.max(0, y + Math.sin(a) * l), c1, rnd(.12, .24), heavy ? 4 : 3, 1); } flash('255,255,255', heavy ? .2 : .08, .12); }
  else if (el === 'slash') { for (let i = 0; i < (heavy ? 5 : 3); i++) V.slash(x + rnd(-40, 40), y + rnd(-70, 70), rnd(-.9, .9) + back, rnd(220, heavy ? 520 : 340), `rgb(${c1})`, heavy ? 12 : 7, i * .03); }
  else if (el === 'soul') { for (let i = 0; i < n; i++) emit(0, x, y, rnd(-500, 500), rnd(-200, 500), rnd(30, 70), rnd(.4, .8), i & 1 ? c1 : c2, { dr: 3, s1: .2 }); V.ring(x, y, heavy ? 240 : 140, `rgb(${c2})`, .4); }
  else if (el === 'plant') { for (let i = 0; i < n; i++) emit(3, x, y, face * rnd(100, 600) + rnd(-200, 200), rnd(100, 700), rnd(5, 10), rnd(.7, 1.3), i % 3 ? '96,66,40' : c2, { g: 1500, vr: rnd(-12, 12), w: i % 3 ? .3 : .55, rot: rnd(0, TAU) }); }
  else if (el === 'steel' || el === 'force') { for (let i = 0; i < n; i++) { const a = rnd(-1.2, 1.2) + back, v = rnd(500, 1300); emit(1, x, y, Math.cos(a) * v, Math.sin(a) * v + 200, rnd(2, 4), rnd(.2, .45), i & 1 ? '255,200,120' : '255,255,255', { g: 2200 }); } if (heavy) flare(x, y, '255,255,255', 300); }
  else if (el === 'gold' || el === 'frame') { for (let i = 0; i < n; i++) emit(5, x, y, rnd(-500, 500), rnd(-100, 600), rnd(4, 7), rnd(.4, .9), i & 1 ? c1 : c2, { g: 900 }); flare(x, y, c1, heavy ? 380 : 220); }
  else if (el === 'dark') { for (let i = 0; i < 5 * few(); i++) emit(2, x + rnd(-40, 40), y + rnd(-40, 40), rnd(-200, 200), rnd(-60, 260), rnd(90, 160), rnd(.5, .9), '18,8,30', { s1: 1.9, a: .7 }); for (let i = 0; i < n; i++) emit(5, x, y, rnd(-600, 600), rnd(-200, 600), rnd(4, 7), rnd(.4, .8), i & 1 ? c1 : c2, { g: 700 }); }
  else if (el === 'sky') { for (let i = 0; i < n; i++) emit(3, x, y, rnd(-600, 600), rnd(-100, 700), rnd(6, 13), rnd(.5, 1), c2, { g: 1300, vr: rnd(-14, 14), w: .18, rot: rnd(0, TAU), a: .85 }); V.ring(x, y, heavy ? 260 : 150, `rgb(${c1})`, .35); }
  else if (el === 'paper') { for (let i = 0; i < n; i++) emit(3, x, y, rnd(-500, 500), rnd(0, 700), rnd(6, 10), rnd(.9, 1.6), c1, { g: 500, dr: 1.6, vr: rnd(-12, 12), w: 1.7, rot: rnd(0, TAU), edge: 'rgba(30,24,20,.5)' }); }
  else if (el === 'wind') { for (let i = 0; i < n; i++) emit(1, x + rnd(-80, 80), y + rnd(-90, 90), face * rnd(700, 1500), rnd(-80, 80), rnd(2, 4), rnd(.15, .3), c1, { a: .7 }); dust(x, 4, face); }
  else V.ring(x, y, heavy ? 230 : 130, `rgb(${c1})`, .3);
  if (heavy) { dust(x, 6, face); shock(x, 230, c1, .4, 9); }
}

/* ---------- a move being called, and the boss being introduced ---------- */
let card = null, intro = null;
const seen = new WeakMap();
function call(o, m, k) {
  const th = themeOf(o) || PLAIN, big = !!m.below || (m.wind || .5) >= .8;
  card = { text: m.name.toUpperCase(), tech: k.tech.toUpperCase(), rgb: th.c1, t: 0, life: big ? 1.9 : 1.35, big };
  if (big) { dim(.5, (m.wind || .5) + .4); flash(th.c1, .12, .3); shock(o.x, 380, th.c1, .5); }
}
function slab(x, y, w, h, sk) { g.beginPath(); g.moveTo(x + sk, y); g.lineTo(x + w + sk, y); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath(); }
function drawCard(real) {
  const c = card, VW = E.VW;
  c.t += real;
  if (c.t >= c.life) { card = null; return; }
  const inn = ease(Math.min(1, c.t / .16)), out = Math.max(0, (c.t - (c.life - .22)) / .22), fs = c.big ? 44 : 32, y = E.VH * (intro ? .4 : .2);
  g.save(); g.font = `${fs}px Anton, Impact, sans-serif`;
  const w = g.measureText(c.text).width + 96, h = fs * 1.45, x = VW + 40 - (w + 70) * inn + (w + 120) * out * out;
  g.globalAlpha = 1 - out;
  slab(x - 10, y + 6, w, h, 26); g.fillStyle = `rgba(${c.rgb},.9)`; g.fill();
  slab(x, y, w, h, 26); g.fillStyle = 'rgba(8,5,12,.94)'; g.fill();
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.shadowColor = `rgb(${c.rgb})`; g.shadowBlur = 14; g.fillText(c.text, x + 58, y + h / 2 + 2); g.shadowBlur = 0;
  g.font = "600 13px Oswald, 'Segoe UI', sans-serif"; g.fillStyle = `rgb(${c.rgb})`; g.fillText(c.tech.split('').join(' '), x + 60, y - 10);
  slab(x + 22, y + 8, 12, h - 16, 6); g.fillStyle = `rgb(${c.rgb})`; g.fill();
  g.restore();
}
function introduce(o, d, th) {
  intro = { name: d.name.toUpperCase(), jp: d.jp || '', tech: d.kit.tech.toUpperCase(), rgb: th.c1, t: 0, life: 2.3 };
  dim(.45, 1.5); shock(o.x, 460, th.c1, .7, 14); shock(o.x, 300, th.c1, .5, 8); flash(th.c1, .16, .4);
  for (let i = 0; i < 26 * few(); i++) { const a = rnd(0, TAU), v = rnd(200, 800); emit(i % 3 ? 1 : 5, o.x, o.y + 160 * (o.scale || 1), Math.cos(a) * v, Math.sin(a) * v, rnd(3, 6), rnd(.4, .8), th.c1, { dr: 2 }); }
}
function drawIntro(real) {
  const c = intro, VW = E.VW, VH = E.VH;
  c.t += real;
  if (c.t >= c.life) { intro = null; return; }
  const inn = ease(Math.min(1, c.t / .28)), out = Math.max(0, (c.t - (c.life - .4)) / .4), al = (1 - out) * Math.min(1, c.t / .12), x = VW - 60 + 60 * (1 - inn) + 80 * out * out, y = VH * .27;      // (under its health, above where FIGHT! is written)
  g.save(); g.globalAlpha = al; g.textAlign = 'right'; g.textBaseline = 'alphabetic';
  slab(VW - 560 * inn + 700 * out, y - 66, 760, 5, 0); g.fillStyle = `rgb(${c.rgb})`; g.fill();
  g.font = "120px 'Vessel Syuku','Yu Mincho',serif"; g.fillStyle = `rgba(${c.rgb},.22)`; g.fillText(c.jp, x + 20, y + 34);
  g.font = '62px Anton, Impact, sans-serif'; g.lineJoin = 'round'; g.lineWidth = 10; g.strokeStyle = '#07060c'; g.strokeText(c.name, x, y); g.fillStyle = '#fff'; g.shadowColor = `rgb(${c.rgb})`; g.shadowBlur = 18; g.fillText(c.name, x, y); g.shadowBlur = 0;
  g.font = "600 20px Oswald, 'Segoe UI', sans-serif"; g.lineWidth = 5; g.strokeText(c.tech.split('').join(' '), x - 4, y + 30); g.fillStyle = `rgb(${c.rgb})`; g.fillText(c.tech.split('').join(' '), x - 4, y + 30);
  g.restore();
}

/* ---------- what it throws, the warning on the floor, the shock along it ---------- */
const shot0 = B.shot;
B.shot = s => {
  const th = themeOf(E.P2) || PLAIN, rgb = s.rgb || th.c1, d0 = s.draw, hit0 = s.hit, land0 = s.land, end0 = s.end, pts = [];
  s.draw = q => { if (!q.bare) { if (!pts.length || pts[pts.length - 1][0] !== q.x) { pts.push([q.x, q.y]); if (pts.length > 9) pts.shift(); } tail(pts, q.r, rgb); } if (d0) d0(q); };
  const pop = (q, f) => { if (!q._pop) { q._pop = 1; spray(th.el, q.x, Math.max(24, q.y), Math.sign(q.vx) || 1, q.r > 40, th); } if (f) f(q); };
  s.hit = q => pop(q, hit0); s.land = q => pop(q, land0); s.end = q => pop(q, end0);
  emit(0, s.x, s.y, 0, 0, (s.r || 30) * 9, .16, rgb, { s1: 1.5 });
  return shot0(s);
};
// the place something is about to come down: it fills as the time runs out, and a faint column of light stands on it
B.mark = (x, w, life, col) => {
  const rgb = /^#[0-9a-f]{6}$/i.test(col) ? hex(col) : '255,255,255';
  B.add({ life, under(h) {
    const u = h.t / life, c = F(x, 0), k = c[2];
    rune(x, w, rgb, .45 + .55 * u, E.T * 1.6, .06 + .2 * u);
    lite(() => {
      g.strokeStyle = `rgba(255,255,255,${.5 + .5 * u})`; g.lineWidth = 3 * k; g.beginPath(); g.ellipse(c[0], c[1], w * k * u, w * k * .26 * u, 0, 0, TAU); g.stroke();
      const top = F(x, 520), gr = g.createLinearGradient(0, c[1], 0, top[1]); gr.addColorStop(0, `rgba(${rgb},${.16 + .2 * u})`); gr.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gr; g.fillRect(c[0] - w * k * .8, top[1], w * k * 1.6, c[1] - top[1]);
    });
  }, upd(h, dt) { if (Math.random() < dt * 20 * few()) emit(5, x + rnd(-w, w), 0, 0, rnd(160, 420), rnd(3, 5), rnd(.3, .6), rgb, { back: true }); } });
};
// a shock running along the floor: a crest of torn ground with light under it, dust and chips behind
B.wave = (x, dir, speed, range, a, col) => {
  const rgb = /^#[0-9a-f]{6}$/i.test(col) ? hex(col) : '255,255,255';
  B.add({ life: range / speed, x,
    upd(h, dt) {
      const p = E.P1;
      h.x += dir * speed * dt;
      if (Math.random() < dt * 34) V.rocks(h.x, 0, 1);
      if (Math.random() < dt * 30 * few()) emit(2, h.x - dir * 30, rnd(4, 30), -dir * rnd(40, 160), rnd(30, 140), rnd(60, 110), rnd(.4, .8), '150,140,165', { s1: 2, a: .4, back: true });
      if (Math.random() < dt * 40 * few()) emit(1, h.x, rnd(10, 90), dir * rnd(100, 400), rnd(200, 600), rnd(2, 4), rnd(.15, .3), rgb);
      if (!h.hit && Math.abs(p.x - h.x) < 60 && p.y < 60 && Fi.hurt(dir, a, B.mul())) h.hit = 1;
    },
    under(h) {                                      // the split it leaves in the floor behind it
      const u = 1 - h.t / h.life, a0 = F(x, 0), b = F(h.x, 0);
      g.strokeStyle = `rgba(0,0,0,${.7 * u})`; g.lineWidth = 5 * b[2]; g.beginPath(); g.moveTo(a0[0], a0[1] + 2); g.lineTo(b[0], b[1] + 2); g.stroke();
      lite(() => { g.strokeStyle = `rgba(${rgb},${.6 * u})`; g.lineWidth = 2 * b[2]; g.beginPath(); g.moveTo(a0[0], a0[1] + 2); g.lineTo(b[0], b[1] + 2); g.stroke(); glow(rgb, b[0], b[1], 420 * b[2], .5 * u); });
    },
    draw(h) {
      const u = 1 - h.t / h.life, c = F(h.x, 0), k = c[2];
      g.fillStyle = '#231a2a'; g.strokeStyle = `rgb(${rgb})`; g.lineWidth = 2.5 * k; g.lineJoin = 'round';
      for (const [ox, hh, w] of [[-70, 60, 36], [-28, 104, 46], [16, 140, 50]]) {             // three teeth of floor, the tallest in front
        const x0 = c[0] + dir * ox * k, t = hh * k * (.5 + .5 * u);
        g.beginPath(); g.moveTo(x0 - dir * w * k, c[1]); g.lineTo(x0 + dir * w * .25 * k, c[1] - t); g.lineTo(x0 + dir * w * .7 * k, c[1]); g.closePath(); g.fill(); g.stroke();
      }
      lite(() => glow(rgb, c[0] + dir * 20 * k, c[1] - 40 * k, 300 * k, .7 * u));
    } });
};

/* ---------- the fight itself ---------- */
let trailT = 0, ambT = 0;
const fades = [];
// a move it was holding back has come free: it flares
function surge(o, th, m) {
  const s = o.scale || 1, y = o.y + 160 * s;
  o.fxRage = (o.fxRage || 0) + 1;
  shock(o.x, 520, th.c1, .7, 14); V.ring(o.x, y, 380, `rgb(${th.c1})`, .5); flash(th.c1, .22, .4); dim(.4, .7);
  cam.shake = Math.max(cam.shake, 16); E.slow(.3); sfx.charge(); dust(o.x, 8);
  for (let i = 0; i < 30 * few(); i++) { const a = rnd(0, TAU), v = rnd(300, 1100); emit(i % 3 ? 1 : 5, o.x, y, Math.cos(a) * v, Math.sin(a) * v, rnd(3, 6), rnd(.4, .8), i & 1 ? th.c1 : th.c2, { dr: 2 }); }
  B.say(o, 'UNSEALED · ' + m.name.toUpperCase(), `rgb(${th.c1})`);
}
// it is beaten: the light goes out of it all at once
function finale(o, th) {
  const s = o.scale || 1, y = o.y + 160 * s;
  flash('255,255,255', .5, .5); flash(th.c1, .3, .8); shock(o.x, 620, th.c1, .9, 16); shock(o.x, 380, '255,255,255', .6, 8); V.ring(o.x, y, 460, `rgb(${th.c1})`, .6);
  cam.shake = Math.max(cam.shake, 26); dust(o.x, 10);
  for (let i = 0; i < 44 * few(); i++) { const a = rnd(0, TAU), v = rnd(300, 1400); emit(i % 3 ? 1 : 5, o.x, y, Math.cos(a) * v, Math.sin(a) * v + 200, rnd(3, 7), rnd(.5, 1.1), i & 1 ? th.c1 : th.c2, { g: 500, dr: 1.4 }); }
  if (!o.human) { pillar(o.x, 110, 760, th.c1, 1.1); fades.push({ o, th, t: 0 }); }
  spray(th.el, o.x, y, o.face, true, th);
}

const tick0 = H.tick, fx0 = H.fx, under0 = H.under, post0 = H.post, rim0 = H.rim, ko0 = H.ko, start0 = H.fightStart, reset0 = H.reset;
H.tick = dt => {
  tick0(dt);
  const o = E.P2, th = themeOf(o);
  if (dimHold > 0) dimHold -= dt; else dimTo = 0;
  for (let i = fades.length - 1; i >= 0; i--) {     // a curse coming apart: what it was made of goes up off it
    const f = fades[i], q = f.o;
    if ((f.t += dt) > 2 || q !== E.P2) { fades.splice(i, 1); continue; }
    if (Math.random() < dt * 60 * few()) emit(Math.random() < .5 ? 0 : 5, q.x + rnd(-90, 90), rnd(0, 120), rnd(-40, 40), rnd(200, 700), rnd(4, 40), rnd(.5, 1.1), Math.random() < .6 ? f.th.c1 : f.th.c2, { s1: .2 });
  }
  if (!th || o.ko || o.alpha < 1 || fight.paused) return;
  const s = o.scale || 1, w = winding(o), pow = (.3 + .9 * w + .22 * rage(o)) * few();
  AURA[th.el](o, s, th, pow, dt);
  if (w > 0 && Math.random() < dt * 30 * few()) {   // while it winds up, light is dragged in to it and grit lifts off the floor
    const a = rnd(0, TAU), r = rnd(220, 380) * s; emit(1, o.x + Math.cos(a) * r, Math.max(0, o.y + 150 * s + Math.sin(a) * r), -Math.cos(a) * r * 3.2, -Math.sin(a) * r * 3.2, rnd(2, 4), .3, th.c1);
    if (Math.random() < .4) emit(3, o.x + rnd(-200, 200) * s, 0, 0, rnd(160, 420), rnd(3, 7), rnd(.4, .8), '60,50,70', { vr: rnd(-8, 8), rot: rnd(0, TAU), back: true });
  }
  if (o.state === 'act' && Math.abs(o.vx) > 640 && (trailT -= dt) <= 0) { trailT = .034; ghost(o, .42, .22); if (Math.random() < .5) dust(o.x - o.face * 40, 1, -o.face); }
  const k = o.ai.d.kit;                             // a move it was holding back comes free
  if (!o.fxOpen) o.fxOpen = k.moves.map(m => !m.below || o.hp / o.max <= m.below);
  k.moves.forEach((m, i) => { if (!o.fxOpen[i] && o.hp / o.max <= m.below && o.hp > 0) { o.fxOpen[i] = true; surge(o, th, m); } });
  if ((ambT -= dt) <= 0) {                          // and the air of the place, with it in it
    ambT = rnd(.05, .14) / few();
    const x = cam.x + rnd(-900, 900), el = th.el;
    if (el === 'fire') emit(5, x, 0, rnd(-30, 30), rnd(80, 260), rnd(3, 5), rnd(1, 2.2), th.c2, { dr: .3, back: Math.random() < .6 });
    else if (el === 'plant') emit(3, x, rnd(500, 640), rnd(-60, 60), rnd(-120, -40), rnd(4, 8), 3.4, Math.random() < .5 ? th.c2 : '255,214,228', { vr: rnd(-4, 4), w: .55, rot: rnd(0, TAU), a: .8, back: Math.random() < .6 });
    else if (el === 'soul' || el === 'dark') emit(0, x, rnd(20, 400), rnd(-30, 30), rnd(20, 80), rnd(14, 30), rnd(1, 2), el === 'soul' ? th.c1 : th.c2, { a: .5, s1: .2, back: true });
    else if (el === 'paper') emit(3, x, rnd(500, 640), rnd(-90, 90), rnd(-160, -60), rnd(6, 9), 3, th.c1, { vr: rnd(-6, 6), w: 1.7, rot: rnd(0, TAU), a: .8, edge: 'rgba(30,24,20,.4)', back: true });
    else if (el === 'blood' && Math.random() < .3) emit(0, x, rnd(20, 300), 0, rnd(10, 50), rnd(10, 20), rnd(1, 2), th.c1, { a: .4, back: true });
    else if (el === 'gold' || el === 'frame') emit(5, x, rnd(0, 500), rnd(-20, 20), rnd(10, 60), rnd(2, 4), rnd(1, 2), th.c1, { a: .5, back: true });
    else if (el === 'sky') emit(3, x, rnd(100, 600), rnd(-20, 20), rnd(-30, 30), rnd(5, 9), 2.4, th.c2, { vr: rnd(-2, 2), w: .14, rot: rnd(0, TAU), a: .4, back: true });
  }
};
H.under = dt => {
  if (dimA > .01) { g.fillStyle = `rgba(4,2,9,${dimA})`; g.fillRect(-E.VW, -E.VH, E.VW * 3, E.VH * 3); }
  under0(dt);
  drawDecals(dt); drawShocks(dt);
  const o = E.P2, th = themeOf(o), w = th && !o.ko ? winding(o) : 0;
  if (w > 0) rune(o.x, lerp(330, 170, w) * (o.scale || 1), th.c1, .3 + .6 * w, -E.T * 2.2, .05 + .1 * w);       // the ground under it, marked while it gathers
  for (let i = ghosts.length - 1; i >= 0; i--) { const gh = ghosts[i]; gh.t += dt; if (gh.t >= gh.life) { ghosts.splice(i, 1); continue; } E.drawFighter(gh.f, gh.a * (1 - gh.t / gh.life)); }
  drawPs(dt, true);
};
H.fx = dt => {
  fx0(dt);
  const o = E.P2, th = themeOf(o), w = th && !o.ko ? winding(o) : 0;
  if (w > 0) {                                      // light gathering on it, tighter as the move comes
    const s = o.scale || 1, c = F(o.x, o.y + 150 * s);
    lite(() => {
      glow(th.c1, c[0], c[1], (260 + 240 * w) * s * c[2], .25 + .4 * w);
      g.strokeStyle = `rgba(${th.c1},${.5 + .5 * w})`; g.lineWidth = 6 * c[2]; g.beginPath(); g.arc(c[0], c[1], lerp(190, 52, w) * s * c[2], 0, TAU); g.stroke();
      g.strokeStyle = `rgba(255,255,255,${.3 + .6 * w})`; g.lineWidth = 2 * c[2]; g.beginPath(); g.arc(c[0], c[1], lerp(250, 62, w) * s * c[2], 0, TAU); g.stroke();
      g.lineWidth = 3 * c[2]; g.strokeStyle = `rgba(${th.c1},${.8 * w})`;
      for (let i = 0; i < 16; i++) { const u = (E.T * 1.9 + i * .37) % 1, a = i * 2.39996, r0 = lerp(330, 60, u) * s * c[2], r1 = r0 + 44 * (1 - u) * c[2]; g.beginPath(); g.moveTo(c[0] + Math.cos(a) * r0, c[1] + Math.sin(a) * r0); g.lineTo(c[0] + Math.cos(a) * r1, c[1] + Math.sin(a) * r1); g.stroke(); }
    });
  }
  drawZaps(dt); drawPs(dt, false);
};
let lastNow = 0;
H.post = () => {
  if (post0) post0();
  const now = performance.now(), real = Math.min(.05, Math.max(0, (now - lastNow) / 1000)), VW = E.VW, VH = E.VH;
  lastNow = now;
  dimA += (dimTo - dimA) * (1 - Math.exp(-real * (dimTo > dimA ? 14 : 5)));
  for (let i = flashes.length - 1; i >= 0; i--) {
    const f = flashes[i];
    if ((f.t += real) >= f.life) { flashes.splice(i, 1); continue; }
    lite(() => { g.fillStyle = `rgba(${f.rgb},${f.a * (1 - f.t / f.life) ** 2})`; g.fillRect(0, 0, VW, VH); });
  }
  if (intro) drawIntro(real);
  if (card) drawCard(real);
};
H.rim = f => {                                      // its edge lit in its colour while it winds up, and for good once it is roused
  const r = rim0 ? rim0(f) : null;
  if (r || f !== E.P2 || f.ko) return r;
  const th = themeOf(f);
  if (!th || th.el === 'steel') return r;
  const w = winding(f), lv = rage(f);
  return w || lv ? { col: `rgb(${th.c1})`, blur: 8 + 24 * w + 5 * Math.min(2, lv) } : r;
};
H.ko = o => { const th = themeOf(o); if (th) finale(o, th); return ko0(o); };
// a blow of the boss's landing on the player (foes.js calls this)
H.struck = (p, face, a, dmg) => {
  const th = themeOf(E.P2);
  if (!th) return;
  const heavy = !!a.lift || dmg >= 14;
  spray(th.el, p.x + face * 20, p.y + 150, face, heavy, th);
  flash(th.c1, heavy ? .17 : .07, .2);
};
const wipe = () => { ps.length = decals.length = zaps.length = shocks.length = flashes.length = ghosts.length = fades.length = 0; dimA = dimTo = dimHold = 0; card = intro = null; };
H.reset = () => { reset0(); wipe(); };
H.fightStart = (cfg, wave) => {
  wipe();
  if (start0) start0(cfg, wave);
  const o = E.P2, th = themeOf(o);
  if (!th) return;
  o.fxRage = 0; o.fxOpen = null;
  let done = seen.get(cfg); if (!done) seen.set(cfg, done = {});
  if (!done[wave]) { done[wave] = 1; introduce(o, o.ai.d, th); }       // (once: not again every time the fight is lost and restarted)
};

JU.bossfx = { emit, decal, lightning, shock, flash, dim, ghost, flare, dust, boom, beam, beamAt, pillar, rune, tail, orb, glow, lamp, cloud, spray, call, themeOf, lite, hex, TH };
})();
