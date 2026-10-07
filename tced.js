/* JUJUTSU UNLIMITEDS — awakened: TRUE CURSED ENERGY DISCHARGE. Ryu Ishigori's technique is called Cursed Energy Discharge, and this is all of
   it, with nothing held back and no heat to mind: the awakened form of Cursed Cannon (cannon.js, whose pieces it borrows).
   Seen as it is in the anime (episode 59): a volley of thin white beams; more of them thrown up to come down out of the sky in wandering blue
   lines, and the black smoke they leave; the burst he turns a punch aside with; and Granite Blast at full power, the one that is shown from
   above going through whole blocks of Sendai.
   Only its name was asked for. The moves and every number in them are ours:
   1 Volley: ten quick beams, 14 each.
   2 Downpour: eight more, out of the sky, 26 each, wherever it is standing by then. He is free to move while they fall.
   3 Repulse: a third of a second gathering, then a burst all round him, 110. Hit him while he gathers and the hit is turned aside, the burst
     comes at once, and it is worth 176.
   4 Dessert: the finisher (160 in the beating, 140 in the swing, 700 in the last blow). See where it is written.
   G Max Granite Blast, when the bar his damage fills is full: 900 over a second and a third */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, C = JU.cut, K = JU.cannon.kit;
const { clamp, lerp, rnd } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk, CYAN = '#7fe9ff', RGB = '127,233,255', SKY = '#58b8ff';
const SIZE = K.SIZE, muzzle = K.muzzle, AIM = K.AIM, RECOIL = K.RECOIL, REACH = 1500;
const SHOTS = 10, SHOT = 14, GAP = .09;             // Volley: how many, what each does, and the time between them
const DROPS = 8, DROP = 26;                         // Downpour
const BURST = 110, TURNED = 176, GATHER = .33;      // Repulse: as it is; when it has turned a hit aside; and how long he gathers
const FULL = 900, TICKS = 12, TICK = 45, CHARGE = 1.2, HOLD = 1.3, INSERT = .62;      // Max Granite Blast: all of it; the beats of it and what each does; how long it is gathered, held, and seen from above
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const dev = () => !!(JU.account && JU.account.dev);
const up = o => !o.ko && !(o.alpha < 1) && o.state !== 'down' && o.state !== 'up' && !(o.inv > 0);
const ahead = (p, o) => { const dx = (o.x - p.x) * p.face; return up(o) && dx > -30 && dx < REACH; };
const exact = (o, n, more) => Object.assign({ dmg: n / (o.dr || 1), col: CYAN, fixed: 1 }, more);      // what it says, whatever he is fighting
const GATHERED = [.2, .16, .5, .3, .5, -.5, 0], THROWN = [-.2, -.14, 1.9, -1.2, .46, -.46, 0], SKYWARD = [-.42, -.36, 2.9, 2.7, .4, -.56, 0];      // drawn in on himself; flung open; and both hands on his head with it tipped back at the sky

let insert = null;                                  // the view from above, while it is on screen

/* ---------- pieces ---------- */
// a thin beam: a white line with blue either side of it, there for an instant
function streak(x0, y0, x1, y1, w, life) {
  V.custom(life, u => {
    const a = F(x0, y0), b = F(x1, y1), k = a[2], al = 1 - u;
    const seg = (width, col) => { g.strokeStyle = col; g.lineWidth = width; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
    g.save(); g.lineCap = 'round';
    lit(() => { seg(w * 3.4 * k, `rgba(${RGB},${.45 * al})`); E.glow(E.GLOW.white, a[0], a[1], 170 * k * al, al); });
    g.globalAlpha = al; seg(w * k * (1 - u * .5), '#ffffff');
    g.restore(); g.globalAlpha = 1;
  });
}
// what a blast leaves where it lands: black smoke going up, with the blue still in it
function smoke(x, y, n, s) {
  const bl = Array.from({ length: n }, () => ({ x: x + rnd(-70, 70) * s, y: y + rnd(0, 60) * s, vx: rnd(-110, 110) * s, vy: rnd(140, 460) * s, r: rnd(44, 92) * s, q: Math.random() }));
  V.custom(1.15, (u, dt) => {
    for (const b of bl) {
      b.x += b.vx * dt; b.y += b.vy * dt; b.vy *= 1 - Math.min(1, 1.7 * dt); b.r += 56 * s * dt;
      const c = F(b.x, b.y);
      g.fillStyle = `rgba(${b.q > .5 ? '30,27,34' : '60,52,56'},${Math.min(1, (1 - u) * 1.7) * .84})`; g.beginPath(); g.arc(c[0], c[1], b.r * c[2], 0, TAU); g.fill();
    }
    lit(() => { for (const b of bl) if (b.q > .62) { const c = F(b.x + b.r * .3, b.y - b.r * .25); E.glow(E.GLOW.blue, c[0], c[1], 70 * s * c[2], (1 - u) * .8); } });
  });
}
// the light a blast leaves at the mouth of his hair
const flash = (p, r) => { const z = muzzle(p); V.custom(.1, u => { const c = F(z[0], z[1]); lit(() => { E.glow(E.GLOW.blue, c[0], c[1], r * 2.2 * c[2], 1 - u); E.glow(E.GLOW.white, c[0], c[1], r * c[2] * (1 - u * .5), 1 - u); }); }); };

/* ---------- 1: Volley ---------- */
function shot(p, i) {
  const f = p.face, o = E.P2, z = muzzle(p), hs = o.scale || 1, hit = ahead(p, o), last = i === SHOTS;
  const tx = hit ? o.x + rnd(-24, 24) : z[0] + f * 1000, ty = hit ? o.y + rnd(90, 235) * hs : z[1] + rnd(-240, 20);
  const n = Math.hypot(tx - z[0], ty - z[1]) || 1, far = hit ? n + 70 : 1500, ux = (tx - z[0]) / n, uy = (ty - z[1]) / n, stop = uy < -.01 ? Math.min(far, z[1] / -uy) : far;
  const x1 = z[0] + ux * stop, y1 = Math.max(0, z[1] + uy * stop);
  sfx.zap(); shake(last ? 14 : 5); streak(z[0], z[1], x1, y1, last ? 11 : 7, .14); flash(p, last ? 130 : 80);
  if (hit) {
    E.applyHit(o, f, exact(o, SHOT, last ? { kb: 640, lift: 330, stun: .5, stop: .09, heavy: 1 } : { kb: 34, stun: .24, stop: .02 }));
    V.sparks(tx, ty, 'blue', last ? 9 : 4); V.ring(tx, ty, last ? 150 : 70, CYAN, .14);
  } else if (y1 <= 1) { E.addDust(x1); V.rocks(clamp(x1, -1040, 1040), 0, 2); V.ring(x1, 20, 80, CYAN, .14); }
}

/* ---------- 2: Downpour ---------- */
// one of the ones that comes down: a thin blue line that wanders on its way, the way they do in the anime
function drop(i) {
  const o = E.P2, p = E.P1, side = i % 2 ? 1 : -1, FALL = .2, FADE = .24;
  const x = clamp(up(o) || !o.ko ? o.x + rnd(-46, 46) : p.x + p.face * (320 + i * 90), -1040, 1040);
  const xs = x + side * rnd(240, 640), ph = rnd(0, TAU), amp = rnd(60, 120);
  V.custom(FALL + FADE, u => {
    const tt = u * (FALL + FADE), head = Math.min(1, tt / FALL), tail = clamp((tt - .08) / (FALL + .1), 0, head), al = tt < FALL ? 1 : 1 - (tt - FALL) / FADE;
    const path = () => {
      g.beginPath();
      for (let s = tail, first = true; s <= head + 1e-6; s += .035, first = false) {
        const c = F(lerp(xs, x, s) + Math.sin(s * 9.5 + ph) * amp * (1 - s) * (1 - s * .3), lerp(1000, 14, s));
        if (first) g.moveTo(c[0], c[1]); else g.lineTo(c[0], c[1]);
      }
    };
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    lit(() => { g.strokeStyle = `rgba(60,140,255,${.6 * al})`; g.lineWidth = 15; path(); g.stroke(); });
    g.globalAlpha = al; g.strokeStyle = '#eef8ff'; g.lineWidth = 3.6; path(); g.stroke();
    g.restore(); g.globalAlpha = 1;
  });
  E.after(FALL, () => land(i, x));
}
function land(i, x) {
  const o = E.P2, last = i === DROPS;
  if (!on() || E.P1.dead) return;
  if (i % 2) sfx.blast(); else sfx.zap();
  shake(last ? 22 : 12); E.addBlast(x, 60, RGB, last ? 420 : 300); V.ring(x, 40, last ? 300 : 200, CYAN, .26); V.crack(x, last ? 240 : 150); V.rocks(x, 0, last ? 9 : 4); V.sparks(x, 70, 'blue', 7);
  smoke(x, 20, last ? 9 : 6, last ? 1.25 : 1);
  if (!up(o) || Math.abs(o.x - x) > 170 || o.y > 240) return;
  E.applyHit(o, o.x >= x ? 1 : -1, exact(o, DROP, last ? { kb: 720, lift: 440, stun: .7, stop: .12, heavy: 1, ring: 1 } : { kb: 24, stun: .4, stop: .03 }));
}

/* ---------- 3: Repulse ---------- */
function burst(p, turned) {
  const o = E.P2, y = p.y + 170 * SIZE, n = 16, rays = Array.from({ length: n }, (_, i) => [i / n * TAU + rnd(-.12, .12), rnd(240, 430), rnd(8, 20)]);
  sfx.cannon(turned ? 1 : 0); sfx.blast(); shake(turned ? 34 : 24);
  if (turned) { shout(p, 'TURNED ASIDE', '#ffffff'); E.slow(.2); V.impact(.14, p.x, y); }
  E.addBlast(p.x, y, RGB, turned ? 700 : 520); V.crack(p.x, turned ? 300 : 220); V.rocks(p.x, 0, 8); E.addDust(p.x - 90); E.addDust(p.x + 90);
  for (let i = 0; i < 3; i++) V.ring(p.x, y, 170 + i * 110, i ? CYAN : '#ffffff', .22 + i * .07);
  V.custom(.26, u => {                              // the burst itself: a white ball that opens, and light thrown out of it every way
    const c = F(p.x, y), k = c[2], e = 1 - (1 - u) * (1 - u), al = 1 - u;
    lit(() => { E.glow(E.GLOW.blue, c[0], c[1], 760 * e * k, al); E.glow(E.GLOW.white, c[0], c[1], 420 * e * k, al); });
    g.globalAlpha = al * .9; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(c[0], c[1], 150 * e * k, 0, TAU); g.fill();
    g.fillStyle = '#eafaff';
    for (const r of rays) {
      const r0 = 110 * e * k, r1 = r[1] * e * k, w = r[2] * al * k, cs = Math.cos(r[0]), sn = Math.sin(r[0]);
      g.beginPath(); g.moveTo(c[0] + cs * r0 - sn * w, c[1] + sn * r0 + cs * w); g.lineTo(c[0] + cs * r1, c[1] + sn * r1); g.lineTo(c[0] + cs * r0 + sn * w, c[1] + sn * r0 - cs * w); g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
  });
  if (!up(o) || Math.abs(o.x - p.x) > 330 || Math.abs(o.y - p.y) > 240) return;
  E.applyHit(o, o.x >= p.x ? 1 : -1, exact(o, turned ? TURNED : BURST, { kb: turned ? 1500 : 1250, lift: turned ? 560 : 460, stun: .8, stop: turned ? .2 : .14, heavy: 1, ring: 1 }));
  V.sparks(o.x, o.y + 170, 'blue', 12);
}

/* ---------- 4: Max Granite Blast ---------- */
// one beat of it, on whatever is standing in it
function beat(p, m, last) {
  const o = E.P2, z = muzzle(p), hs = o.scale || 1, dx = (o.x - z[0]) * m.f, axis = z[1] + m.uy / (m.ux * m.f) * dx;
  const gx = clamp(z[0] + m.f * rnd(160, 1300), -1040, 1040);
  V.rocks(gx, 0, 2); E.addDust(gx); if (Math.random() < .5) V.crack(gx, rnd(80, 160));
  shake(last ? 46 : 18);
  if (!ahead(p, o) || Math.abs(o.y + 165 * hs - axis) > 250) return;
  const y = o.y + 165 * hs;
  E.applyHit(o, m.f, exact(o, last ? FULL - TICKS * TICK : TICK, last ? { kb: 1600, lift: 640, stun: 1, stop: .3, heavy: 1, ring: 1 } : { kb: 110, stun: .3, stop: .015 }));
  V.sparks(o.x, y, 'blue', last ? 22 : 5);
  if (last) { V.impact(.2, o.x, y); E.addBlast(o.x, y, RGB, 900); C.cubes(o.x, 40, 10, 1.2); smoke(o.x, 20, 10, 1.4); sfx.bf(); }
}
// the beam, for as long as it is held. It starts at his hair wherever that has got to, so it follows him as it pushes him back
function mega(p, m) {
  const u = m.t - CHARGE;
  if (!m.fired || u > HOLD + .22) return;
  const z = muzzle(p), T = E.T, env = (u < .07 ? u / .07 : u > HOLD ? Math.max(0, 1 - (u - HOLD) / .22) : 1) * (1 + .05 * Math.sin(T * 61)), w = 236 * env;
  const a = F(z[0], z[1]), b = F(z[0] + m.ux * 2800, z[1] + m.uy * 2800), k = a[2], dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1, nx = -dy / n, ny = dx / n, ang = Math.atan2(dy, dx);
  const seg = (width, col) => { g.strokeStyle = col; g.lineWidth = width; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
  if (w <= 0) return;
  g.save(); g.lineCap = 'butt';
  lit(() => { seg(w * 2.6 * k, `rgba(${RGB},.15)`); seg(w * 1.7 * k, `rgba(${RGB},.28)`); });
  seg(w * 1.14 * k, 'rgba(88,184,255,.7)'); seg(w * k, CYAN); seg(w * .8 * k, '#ffffff');
  g.lineCap = 'round'; g.lineWidth = Math.max(1.5, 3 * k);      // the air torn along both edges of it
  for (let i = 0; i < 22; i++) {
    const s = ((i * 61 % 23) / 23 + T * 2.8) % 1, s1 = Math.min(1, s + .07), side = i % 2 ? 1 : -1, off = side * (.44 + ((i * 37 % 11) / 11) * .34) * w * k;
    g.strokeStyle = i % 3 ? 'rgba(255,255,255,.85)' : SKY;
    g.beginPath(); g.moveTo(a[0] + dx * s * .6 + nx * off, a[1] + dy * s * .6 + ny * off); g.lineTo(a[0] + dx * s1 * .6 + nx * off, a[1] + dy * s1 * .6 + ny * off); g.stroke();
  }
  for (let j = 0; j < 4; j++) {                     // and rings of it going down the length
    const s = (T * 1.9 + j / 4) % 1, cx = a[0] + dx * s * .5, cy = a[1] + dy * s * .5;
    g.strokeStyle = `rgba(255,255,255,${(1 - s) * .9 * env})`; g.lineWidth = (7 - 5 * s) * k;
    g.beginPath(); g.ellipse(cx, cy, w * (.16 + .1 * s) * k, w * (.74 + .5 * s) * k, ang, 0, TAU); g.stroke();
  }
  lit(() => { E.glow(E.GLOW.blue, a[0], a[1], w * 4.6 * k, .9 * env); E.glow(E.GLOW.white, a[0], a[1], w * 2.9 * k, env); });
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(a[0], a[1], w * .66 * k, 0, TAU); g.fill();      // the mouth of it: nothing to be seen there but white
  g.beginPath(); g.ellipse(a[0], a[1], w * 2.6 * k, 5 * k * env, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(a[0], a[1], 5 * k * env, w * 1.9 * k, 0, 0, TAU); g.fill();
  g.restore();
}
// seen from above for a moment, the way the anime shows it: the roofs of a city, pale and blue, and the white of it going through them
function drawInsert() {
  const u = (E.T - insert.t0) / INSERT, VW = E.VW, VH = E.VH;
  if (u >= 1 || u < 0) { insert = null; return; }
  let sd = insert.seed;
  const rr = () => (sd = sd * 16807 % 2147483647) / 2147483647;
  const go = clamp(u / .5, 0, 1), head = 1 - (1 - go) * (1 - go), wide = VH * .2, len = Math.hypot(VW, VH) * 1.3;
  g.save();
  g.fillStyle = '#5f7fa6'; g.fillRect(0, 0, VW, VH);
  g.translate(VW / 2, VH / 2); g.rotate(-.52); g.scale(1 + .1 * u, 1 + .1 * u);      // the streets do not run square to the picture, and it drifts in
  const R = Math.hypot(VW, VH) * .62, cell = VH * .2;
  for (let y = -R; y < R; y += cell) for (let x = -R; x < R; x += cell * 1.5) {      // blocks: a few roofs to each, and the streets between
    const nb = 2 + (rr() * 3 | 0);
    for (let i = 0; i < nb; i++) {
      const w = cell * 1.36 / nb - 5, h = cell * (.5 + rr() * .34), bx = x + i * (cell * 1.36 / nb), by = y + rr() * cell * .1, tone = 196 + rr() * 50 | 0;
      g.fillStyle = `rgb(${tone - 34},${tone - 12},${Math.min(255, tone + 10)})`; g.fillRect(bx, by, w, h);
      g.fillStyle = 'rgba(40,62,104,.6)'; g.fillRect(bx, by + h, w, cell * .07); g.fillRect(bx + w, by + cell * .04, cell * .045, h);      // its shadow
      if (rr() > .5) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(bx + w * .16, by + h * .2, w * .3, h * .2); }
    }
  }
  g.rotate(.52);                                    // the blast: up and to the right, the way it goes in the still
  g.rotate(-.9);
  const x0 = -len / 2, x1 = x0 + len * head, grd = g.createLinearGradient(0, -wide, 0, wide);
  grd.addColorStop(0, 'rgba(88,184,255,0)'); grd.addColorStop(.2, 'rgba(140,214,255,.95)'); grd.addColorStop(.36, '#ffffff'); grd.addColorStop(.64, '#ffffff'); grd.addColorStop(.8, 'rgba(140,214,255,.95)'); grd.addColorStop(1, 'rgba(88,184,255,0)');
  g.fillStyle = grd; g.beginPath(); g.moveTo(x0, -wide * .7); g.lineTo(x1, -wide); g.quadraticCurveTo(x1 + wide * .9, 0, x1, wide); g.lineTo(x0, wide * .7); g.closePath(); g.fill();
  for (let i = 0; i < 46; i++) {                    // what was standing in its way
    const s = rr(), side = rr() > .5 ? 1 : -1, v1 = rr(), v2 = rr(), z = 5 + rr() * 16, age = u - s * .5;      // (every piece takes the same five numbers, born or not, so the rest do not jump)
    if (age <= 0) continue;
    const px = x0 + len * s + age * (100 + v1 * 300), py = side * (wide * .8 + age * (300 + v2 * 900));
    g.fillStyle = i % 3 ? 'rgba(34,48,84,.9)' : 'rgba(240,248,255,.95)'; g.save(); g.translate(px, py); g.rotate(age * 9 + i); g.fillRect(-z, -z * .5, z * 2, z); g.restore();
  }
  g.restore();
  const fl = u < .12 ? 1 - u / .12 : u > .82 ? (u - .82) / .18 : 0;       // it cuts in and out through white
  if (fl > 0) { g.fillStyle = `rgba(255,255,255,${fl})`; g.fillRect(0, 0, VW, VH); }
}

/* ---------- 4: Dessert. Staged after the clip the user sent of this awakening's finisher in Jujutsu Shenanigans, beat for beat as far as a
   side-on fight allows: steam off his hair; a burst of white crescents and teal lines that throws him forward; hold of the enemy, which goes
   down, and a beating where it lies; his face, close; one red swing; his eye, close, and red closing over it block by block; black, with
   something red catching in it; the flash; the blow itself held still against streaming red; one frame of pure black and white; and it is
   gone across the stage. The numbers are ours ---------- */
const PUM = 8, PUM_DMG = 20, SWING_DMG = 140, BF_DMG = 700, CUT1 = .5, FIN = 3.1;      // blows in the beating and what each does; the swing; the last blow; how long each of the two times the fight is held still lasts
let pin = null, show = null;                        // the enemy, held where the scene wants it; and what is over the whole screen just now
const cap = (o, n) => Math.max(0, Math.min(n, o.hp - 1));      // nothing before the last blow finishes it
function burstFx(p) {                               // the launch: white crescents and teal lines thrown out round him
  const x = p.x, y = p.y + 170 * SIZE, f = p.face, L = Array.from({ length: 30 }, () => [rnd(0, TAU), rnd(.3, 1), rnd(2, 8)]);
  V.custom(.36, u => {
    const c = F(x, y), k = c[2], e = 1 - (1 - u) * (1 - u), al = 1 - u, flip = f < 0 ? Math.PI : 0;
    g.save(); g.lineCap = 'round';
    lit(() => E.glow(E.GLOW.blue, c[0], c[1], 1500 * e * k, al * .8));
    for (const q of L) {
      const r0 = (90 + 520 * e * q[1]) * k, r1 = r0 + (240 + 520 * q[1]) * k * (1 - u * .5), cs = Math.cos(q[0]), sn = Math.sin(q[0]) * .62;
      g.strokeStyle = `rgba(${q[2] > 5 ? '255,255,255' : RGB},${al})`; g.lineWidth = q[2] * k;
      g.beginPath(); g.moveTo(c[0] + cs * r0, c[1] + sn * r0); g.lineTo(c[0] + cs * r1, c[1] + sn * r1); g.stroke();
    }
    g.strokeStyle = `rgba(255,255,255,${al})`;
    for (let i = 0; i < 3; i++) { g.lineWidth = Math.max(1, (24 - i * 6) * k * al); g.beginPath(); g.arc(c[0] - f * (60 + i * 60) * e * k, c[1], (160 + i * 140) * e * k, flip - 1.05, flip + 1.05); g.stroke(); }
    g.restore();
  });
}
function drops(x, n) {                              // what it leaves on the floor: red, in squares
  const bits = Array.from({ length: n }, () => [x + rnd(-190, 190), rnd(-70, 70), rnd(12, 30)]), ZP = E.ZP, P = E.P;
  V.custom(7, u => {
    g.fillStyle = `rgba(200,16,36,${Math.min(1, (1 - u) * 3) * .9})`;
    for (const b of bits) { const a = P(b[0] - b[2], 1, ZP + b[1] - b[2] * .5), c = P(b[0] + b[2], 1, ZP + b[1] - b[2] * .5), d = P(b[0] + b[2], 1, ZP + b[1] + b[2] * .5), e = P(b[0] - b[2], 1, ZP + b[1] + b[2] * .5); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.lineTo(e[0], e[1]); g.closePath(); g.fill(); }
  }, 0, true);
}
function crescent(p) {                              // the swing: a dark red crescent the width of the screen
  const x = p.x + p.face * 120, y = p.y + 170 * SIZE, f = p.face;
  V.custom(.3, u => {
    const c = F(x, y), k = c[2], al = 1 - u, a0 = f > 0 ? -2.2 : -.94, sweep = (f > 0 ? 1 : -1) * 2.5 * Math.min(1, u * 4);
    g.save(); g.lineCap = 'round'; g.strokeStyle = `rgba(150,8,24,${al})`; g.lineWidth = 46 * k * al;
    g.beginPath(); g.arc(c[0], c[1], 330 * k, a0, a0 + sweep, f < 0); g.stroke();
    g.strokeStyle = `rgba(255,70,90,${al})`; g.lineWidth = 10 * k * al; g.beginPath(); g.arc(c[0], c[1], 344 * k, a0, a0 + sweep, f < 0); g.stroke();
    g.restore();
  });
}
// his face, filling the screen. blocks: red closes over it, block by block, and what is left is black
function closeUp(p, u, blocks) {
  const VW = E.VW, VH = E.VH, c = F(p.x, p.y + 238 * (p.scale || 1)), k = 4.6 + u * .6, gr = g.createLinearGradient(0, 0, VW, VH);
  gr.addColorStop(0, '#0b1c2a'); gr.addColorStop(1, '#03070c'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  g.strokeStyle = 'rgba(190,240,255,.5)'; g.lineWidth = 2; g.beginPath();
  for (let i = 0; i < 26; i++) { const y = ((i * 97 % 100) / 100) * VH, x = ((i * 53 + E.T * 900) % (VW + 600)) - 300; g.moveTo(x, y); g.lineTo(x + 240 + (i % 5) * 60, y); }
  g.stroke();
  g.save(); g.translate(VW * (.5 - p.face * .05), VH * .58); g.rotate(-.1 * p.face); g.scale(k, k); g.translate(-c[0], -c[1]); E.drawFighter(p); g.restore();
  if (!blocks) return;
  const n = Math.floor(clamp((u - .4) / .5, 0, 1) * 7);
  for (let i = 0; i < n; i++) { g.save(); g.translate(VW * (.12 + (i * 37 % 80) / 100), VH * (.2 + (i * 53 % 60) / 100)); g.rotate((i * 1.3) % 1 - .5); g.fillStyle = i % 2 ? '#c8102e' : '#a00d24'; g.fillRect(-VW * .26, -VH * .3, VW * .52, VH * .6); g.restore(); }
  if (u > .9) { g.fillStyle = `rgba(0,0,0,${(u - .9) / .1})`; g.fillRect(0, 0, VW, VH); }
}
// black, and something red catching in it; white lines scratched across; and then, for an instant, the flash
function crackle(flash) {
  const VW = E.VW, VH = E.VH;
  let sd = 1 + Math.floor(E.T * 15) * 7919 % 2147483646;
  const rr = () => (sd = sd * 16807 % 2147483647) / 2147483647;
  g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH);
  lit(() => {
    for (let c = 0; c < (flash ? 7 : 3); c++) {
      const cx = rr() * VW, cy = rr() * VH, sp = 60 + rr() * 220;
      g.fillStyle = `rgba(255,${30 + rr() * 50 | 0},${60 + rr() * 40 | 0},${flash ? .55 : .4})`;
      for (let i = 0; i < 70; i++) { const a = rr() * TAU, d = rr() * rr() * sp, z = 2 + rr() * 7; g.fillRect(cx + Math.cos(a) * d * 1.6, cy + Math.sin(a) * d * .7, z * 2.2, z); }
    }
  });
  g.strokeStyle = `rgba(255,255,255,${.5 + rr() * .4})`; g.lineWidth = 2; g.lineJoin = 'round';
  for (let l = 0; l < 3; l++) { let x = rr() * VW * .3, y = rr() * VH; g.beginPath(); g.moveTo(x, y); for (let i = 0; i < 8; i++) { x += VW * (.06 + rr() * .1); y += (rr() - .5) * VH * .24; g.lineTo(x, y); } g.stroke(); }
  if (!flash) return;
  g.save(); g.shadowColor = '#ff2d55'; g.shadowBlur = 70; g.fillStyle = '#fff3f6'; g.strokeStyle = '#080205'; g.lineWidth = 5;
  for (let b = 0; b < 3; b++) {
    const cx = VW * (.26 + b * .26 + (rr() - .5) * .1), cy = VH * (.34 + rr() * .34), R = VH * (.16 + rr() * .16), n = 14;
    g.beginPath(); for (let i = 0; i < n; i++) { const a = i / n * TAU, r = R * (i % 2 ? .5 + rr() * .25 : .9 + rr() * .6); g.lineTo(cx + Math.cos(a) * r * 1.5, cy + Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke();
  }
  g.restore();
  g.fillStyle = '#ff4d6d'; for (let i = 0; i < 16; i++) { g.save(); g.translate(rr() * VW, rr() * VH); g.rotate(rr() * TAU); g.fillRect(-26, -4, 52, 8); g.restore(); }
}
// the blow itself, held: the two of them close, his fist in its face, and red streaming past behind
function posed(s, u) {
  const VW = E.VW, VH = E.VH, p = E.P1, o = E.P2, mid = F((p.x + o.x) / 2, 190), k = 2.05 + u * .3;
  g.fillStyle = '#10050a'; g.fillRect(0, 0, VW, VH);
  lit(() => {
    for (let i = 0; i < 46; i++) {
      const sp = 900 + (i * 61 % 9) * 240, x = ((i * 173 + E.T * sp * s.f) % (VW + 800) + VW + 800) % (VW + 800) - 400, y = ((i * 89 % 100) / 100) * VH, L = 160 + (i * 37 % 7) * 60;
      g.fillStyle = i % 3 ? 'rgba(255,60,90,.42)' : 'rgba(255,170,190,.5)'; g.beginPath(); g.ellipse(x, y + (x - VW / 2) * -.18 * s.f, L, 6 + (i % 4) * 5, -.18 * s.f, 0, TAU); g.fill();
    }
  });
  g.save(); g.translate(VW / 2, VH * .56); g.scale(k, k); g.translate(-mid[0], -mid[1]); E.drawFighter(o); E.drawFighter(p); g.restore();
  if (u < .42) { g.fillStyle = `rgba(255,246,248,${1 - u / .42})`; g.fillRect(0, 0, VW, VH); }
}
function drawShow() {
  const s = show, t = E.T - s.t0, VW = E.VW, VH = E.VH;
  if (t >= s.dur) { show = null; return; }
  if (s.kind === 'face') { closeUp(E.P1, t / s.dur, 0); return; }
  if (t < .5) closeUp(E.P1, t / .5, 1);
  else if (t < 1.25) crackle(0);
  else if (t < 1.45) { if (!s.bf) { s.bf = 1; sfx.bf(); } crackle(1); }
  else if (t < 1.55) { g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); }
  else posed(s, (t - 1.55) / (s.dur - 1.55));
}
const DESSERT = { name: 'Dessert', cd: 28, dur: 12, run(p, m, t) {
  const o = E.P2, f = p.face;
  p.rate = 44;
  if (m.grab === undefined) {
    if (t < .45) {                                  // steam off his hair first
      p.vx = 0; p.target = AIM;
      if (!o.ko) p.face = o.x >= p.x ? 1 : -1;
      if (!m.c) { m.c = 1; sfx.steam(); }
      if (Math.random() < .6) { const z = muzzle(p); V.puff('white', z[0] + rnd(-20, 20), z[1] + rnd(0, 20), rnd(-40, 40), rnd(160, 380), rnd(22, 46), rnd(.4, .7)); }
      return;
    }
    if (!m.b) { m.b = 1; sfx.cannon(1); sfx.whoosh(); shake(24); burstFx(p); p.inv = Math.max(p.inv, 1.1); E.zoomIn(.4); }
    const gap = (o.x - p.x) * f;
    p.target = POSE.dash; p.vx = gap > 150 ? f * 2500 : 0;
    if (Math.random() < .8) V.puff('blue', p.x - f * 40, p.y + rnd(40, 270), -f * 520, 0, 30, .25);
    if (gap > -30 && gap < 210 && up(o)) {          // hold of it: it goes down, and stays where it is put
      m.grab = t; m.n = 0; p.vx = 0; p.inv = Math.max(p.inv, 12); E.root.classList.add('cine'); sfx.hit(true); shake(18);
      pin = { o, f, pose: POSE.down, x: clamp(p.x + f * 120, -940, 940) };
      Object.assign(o, { state: 'idle', stun: 0, act: null, vx: 0, vy: 0, tele: 0, y: 0 });      // (idle is the state in which the scene, not the enemy, decides what it does: H.foePre)
    } else if (t > 1.2) { p.vx = 0; E.cd.manji = 6; E.endMove(p); }      // nothing to take hold of: most of the wait is given back
    return;
  }
  const u = t - m.grab, U1 = .14 + PUM * .13 + .1;
  p.vx = 0;
  if (m.rel !== undefined) { p.target = t < m.rel + .32 ? POSE.cross : POSE.idle; if (t > m.rel + .6) E.endMove(p); return; }
  if (m.fin) {                                      // the fight has just been let go again: this is where it lands
    const y = o.y + 165 * (o.scale || 1);
    m.rel = t; pin = null; Object.assign(o, { state: 'idle', stun: 0 }); E.root.classList.remove('cine'); p.inv = Math.max(.5, 0);
    V.impact(.16, o.x, y); sfx.blast(); shake(56); shout(p, 'DESSERT', '#ff5a6e');
    E.addBlast(o.x, y, '255,44,72', 900); for (let i = 0; i < 4; i++) V.ring(o.x, y, 200 + i * 150, i % 2 ? '#ff2440' : '#ffffff', .3 + i * .06);
    for (let i = 0; i < 6; i++) V.bolt(o.x + rnd(-200, 200), y + rnd(-160, 200), o.x + rnd(-320, 320), y + rnd(-200, 260), '#ff2440', .2, 3, '#120306');
    drops(o.x, 14); V.crack(o.x, 320); V.rocks(o.x, 0, 10);
    E.applyHit(o, f, exact(o, BF_DMG, { kb: 2400, lift: 760, stun: 1.2, stop: .34, heavy: 1, ring: 1, col: '#ff2440' }));
    return;
  }
  while (m.n < PUM && u >= .14 + m.n * .13) {       // the beating, where it lies
    const i = m.n++;
    p.pose = (i % 2 ? POSE.crush : POSE.hook).slice();
    E.applyHit(o, f, exact(o, cap(o, PUM_DMG), { kb: 0, stun: 12, stop: .035, col: '#8dffb0' })); Object.assign(o, { state: 'idle', stun: 0, act: null });
    V.slash(pin.x + rnd(-40, 40), 70 + rnd(0, 60), f > 0 ? rnd(-1.1, -.5) : Math.PI + rnd(.5, 1.1), 280, i % 2 ? '#8dffb0' : '#ffffff', 10);
    drops(pin.x, 2); sfx.hit(false); shake(9);
  }
  if (u < U1) { p.target = POSE.crushWind; return; }
  if (!m.c1) { m.c1 = 1; show = { kind: 'face', t0: E.T, dur: CUT1 }; E.stop(CUT1); sfx.charge(); p.pose = POSE.hookWind.slice(); p.target = POSE.hookWind; return; }
  if (u < U1 + .16) { p.target = POSE.hookWind; return; }
  if (!m.sw) {                                      // one red swing
    m.sw = 1; p.pose = POSE.hook.slice(); crescent(p); sfx.hit(true); sfx.whoosh(); shake(30);
    E.applyHit(o, f, exact(o, cap(o, SWING_DMG), { kb: 0, stun: 12, stop: .12, heavy: 1, col: '#c8102e' })); Object.assign(o, { state: 'idle', stun: 0, act: null });
    o.flash = .22; V.ring(pin.x, 150, 520, '#ffffff', .4); drops(pin.x, 7);
  }
  if (u < U1 + .6) { p.target = POSE.hook; return; }
  m.fin = 1;                                        // and the last of it: everything stops, and is shown
  pin.pose = POSE.hurt; pin.x = clamp(p.x + f * 150, -940, 940);
  Object.assign(o, { x: pin.x, y: 0 }); o.pose = POSE.hurt.slice(); o.target = POSE.hurt; p.pose = POSE.cross.slice(); p.target = POSE.cross;
  show = { kind: 'fin', t0: E.T, dur: FIN, f }; E.stop(FIN); sfx.rise(1.2);
} };

const MOVES = {
  strikes: { name: 'Volley', cd: 5, dur: 1.6, run(p, m, t) {
    const o = E.P2, END = .16 + SHOTS * GAP;
    p.vx = 0; p.rate = 40;
    if (t < .16) { p.target = AIM; if (!o.ko) p.face = o.x >= p.x ? 1 : -1; if (!m.c) { m.c = 1; m.n = 0; sfx.charge(); } return; }
    p.target = t < END + .08 ? (Math.floor(t / .045) % 2 ? AIM : RECOIL) : POSE.idle;       // his head knocked back by every one of them
    const n = Math.min(SHOTS, Math.floor((t - .16) / GAP) + 1);
    while (m.n < n) shot(p, ++m.n);
    if (t > END + .3) E.endMove(p);
  } },
  crush: { name: 'Downpour', cd: 10, dur: .62, run(p, m, t) {
    p.vx = 0; p.rate = 34; p.target = t < .46 ? SKYWARD : POSE.idle;
    if (m.c || t < .14) return;
    const z = muzzle(p);
    m.c = 1; sfx.cannon(1); shake(16); shout(p, 'DOWNPOUR', CYAN); flash(p, 190);
    for (let i = 0; i < DROPS; i++) streak(z[0], z[1], z[0] + p.face * rnd(-120, 220) + (i - 3.5) * 46, 1150, 5, .2 + i * .012);      // thrown up, all of them at once
    for (let i = 1; i <= DROPS; i++) E.after(.42 + i * .11, () => { if (on() && !E.P1.dead) drop(i); });                               // and they come down one after another
  } },
  div: { name: 'Repulse', cd: 8, dur: GATHER + .5, run(p, m, t) {
    p.vx = 0; p.rate = 46;
    if (!m.c) { m.c = 1; sfx.charge(); }
    if (m.s === undefined) {
      p.target = GATHERED;
      if (Math.random() < .7) V.mote(p.x, p.y + 170 * SIZE, 'blue');
      if (t < GATHER && !m.turned) return;
      m.s = t; p.pose = THROWN.slice(); burst(p, !!m.turned);
      return;
    }
    p.target = t < m.s + .22 ? THROWN : POSE.idle;
    if (t > m.s + .36) E.endMove(p);
  } },
  manji: DESSERT
};
// G, when the bar under his health is full: Granite Blast at full power
const MAXB = { name: 'Max Granite Blast', cd: 30, dur: CHARGE + HOLD + .7, run(p, m, t) {
    const o = E.P2;
    p.rate = 28;
    if (t < CHARGE) {
      p.vx = 0; p.target = AIM;
      if (!o.ko) p.face = o.x >= p.x ? 1 : -1;
      if (!m.c) { m.c = 1; m.n = 0; p.inv = Math.max(p.inv, CHARGE + HOLD + .2); sfx.rise(CHARGE); sfx.charge(); E.zoomIn(.6); E.banner('グラニテブラスト', 'GRANITE BLAST', 'sm'); }
      const z = muzzle(p);
      V.mote(z[0], z[1], 'blue'); if (Math.random() < .5) V.mote(z[0], z[1], 'white');
      return;
    }
    const u = t - CHARGE;
    if (!m.fired) {                                 // let go. Nearly level, so that it goes on a long way: it is wide enough to take in whatever he was looking at
      const z = muzzle(p), f = p.face, dx = Math.max(200, (o.x - z[0]) * f), dy = clamp((o.y + 165 * (o.scale || 1)) - z[1], -.14 * dx, .05 * dx), n = Math.hypot(dx, dy);
      m.fired = 1; m.f = f; m.ux = f * dx / n; m.uy = (o.ko ? -.04 * dx : dy) / n;
      p.pose = RECOIL.slice(); sfx.cannon(2); sfx.roar(HOLD + .2); shake(50); V.split(f > 0 ? .04 : -.04);
      if (!JU.reduceMotion) { insert = { t0: E.T, seed: 1 + (Math.random() * 1e6 | 0) }; E.stop(INSERT); }
    }
    if (u < HOLD) {
      p.target = RECOIL; p.vx = -m.f * 150;         // and it shoves him back the whole time it lasts
      const n = Math.min(TICKS, Math.floor(u / (HOLD / (TICKS + 1))) + 1);
      while (m.n < n) { m.n++; beat(p, m, false); }
      return;
    }
    if (!m.end) { m.end = 1; beat(p, m, true); }
    p.vx = 0; p.target = u < HOLD + .3 ? RECOIL : POSE.idle;
    if (u > HOLD + .5) E.endMove(p);
} };

JU.tech.add('tced', { name: 'True Cursed Energy Discharge', jp: '真・呪力放出', mark: '轟', who: 'Granite Cannon, nothing held back', odds: 0, col: CYAN, glow: 'blue', moves: MOVES,
  awakened: true, skin: JU.cast6.ISHIGORI, as: ['Granite Cannon', '砲'], scale: SIZE, hint: '<b>3</b> Repulse turns a hit aside while he gathers · <b>G</b> Max Granite Blast when the bar is full',
  awkName: 'Max Granite Blast', awkHits: false, awkStart: 0, awaken(p) { p.move = { def: MAXB, t: 0 }; } });
const DEF = JU.tech.TECH.tced, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
const fx0 = H.fx, post0 = H.post, reset0 = H.reset, start0 = H.fightStart, rim0 = H.rim, guard0 = H.guard, pre0 = H.foePre, hit0 = H.hit, tick0 = H.tick;
H.foePre = (o, p, dt) => {                          // during Dessert it is wherever the scene has put it, and does nothing of its own
  if (!pin || pin.o !== o) return pre0 ? pre0(o, p, dt) : false;
  o.vx = 0; o.x = pin.x; o.y = 0; o.face = -pin.f; o.target = pin.pose; o.rate = 40;
  return true;
};
H.hit = (o, face, h) => {                           // the bar for Max Granite Blast fills with the damage he does: about a thousand of it
  hit0(o, face, h);
  const m = E.P1.move;
  if (on() && !(m && m.def === MAXB)) JU.tech.charge(h.dmg * (o.dr || 1) * .1);
};
H.tick = dt => { tick0(dt); if (pin && !(on() && E.P1.move && E.P1.move.def === DESSERT)) { pin = null; show = null; E.root.classList.remove('cine'); } };      // cut short somehow: nothing is left hanging
H.guard = (face, a, mul) => {                       // hit while he is gathering Repulse: it is turned aside, and the burst comes now
  const p = E.P1, m = p.move;
  if (on() && m && m.def === MOVES.div && m.s === undefined && !m.turned) { m.turned = 1; p.inv = Math.max(p.inv, .3); sfx.tap(1); V.ring(p.x, p.y + 170 * SIZE, 150, '#ffffff', .16); return true; }
  return guard0 ? guard0(face, a, mul) : false;
};
H.rim = f => {                                      // awakened: the edge of him is lit the whole time, and harder while he gathers the big one
  if (f !== E.P1 || !on() || f.dead) return rim0 ? rim0(f) : null;
  const m = f.move, big = m && m.def === MAXB && m.t < CHARGE;
  return { col: CYAN, blur: big ? 7 + 9 * m.t / CHARGE : 5 + 1.5 * Math.sin(E.T * 5) };
};
H.fx = dt => {
  fx0(dt);
  const p = E.P1, m = p.move;
  if (!on() || p.dead || p.alpha < .05) return;
  const z = muzzle(p), c = F(z[0], z[1]), k = c[2], T = E.T;
  if (m && m.def === MAXB) {
    if (m.t < CHARGE) {                             // being gathered: the lens of light at the front of his hair, as it is seen from in front
      const u = m.t / CHARGE, R = (14 + 70 * u * u + 3 * Math.sin(T * 40)) * k;
      lit(() => { E.glow(E.GLOW.blue, c[0], c[1], (260 + 700 * u) * k, .9); E.glow(E.GLOW.white, c[0], c[1], R * 4.6, 1); });
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(c[0], c[1], R, 0, TAU); g.fill();
      g.strokeStyle = `rgba(${RGB},.9)`; g.lineWidth = Math.max(2, R * .16); g.beginPath(); g.arc(c[0], c[1], R * 1.14, 0, TAU); g.stroke();
      g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(c[0], c[1], R * (4 + 9 * u), 3 * k, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(c[0], c[1], 3 * k, R * (3 + 5 * u), 0, 0, TAU); g.fill();
      g.strokeStyle = `rgba(255,255,255,${.25 + .5 * u})`; g.lineWidth = 2;      // everything near being drawn in to it
      for (let i = 0; i < 12; i++) { const an = i / 12 * TAU + T * 1.4, q = 1 - ((T * 1.8 + i * .31) % 1), r0 = (70 + 360 * q) * k, r1 = r0 + 60 * k * q; g.beginPath(); g.moveTo(c[0] + Math.cos(an) * r0, c[1] + Math.sin(an) * r0); g.lineTo(c[0] + Math.cos(an) * r1, c[1] + Math.sin(an) * r1); g.stroke(); }
    } else mega(p, m);
    return;
  }
  lit(() => { E.glow(E.GLOW.blue, c[0], c[1], (96 + 14 * Math.sin(T * 7)) * k, .75); E.glow(E.GLOW.white, c[0], c[1], 30 * k, .9); });      // otherwise: it is simply never out
};
H.post = dt => { if (post0) post0(dt); if (insert) drawInsert(); if (show) drawShow(); };
H.reset = () => { reset0(); insert = null; pin = show = null; E.root.classList.remove('cine'); };
H.fightStart = (cfg, wave) => {
  start0(cfg, wave); if (!wave) insert = null; pin = show = null;
  if (on() && !JU.clan.body()) E.P1.scale = SIZE;
};

// its card on the Awaken CT screen. It is Cursed Cannon awakened, so it asks for Cursed Cannon, and that is Early Access
Object.assign(JU.awakened.LIST.find(a => a.id === 'tced'), {
  what: 'Granite Cannon with nothing held back, and no heat to mind. Volley, Downpour, Repulse, and Dessert, the finisher (1000). G: Granite Blast at full power (900).',
  later: () => 'Needs Cursed Cannon, which is Early Access. Early Access is not on sale yet.',
  open: () => dev() || !JU.shop || JU.shop.holds('tech', 'cannon') });

JU.tced = { MOVES, MAXB, SHOTS, SHOT, DROPS, DROP, BURST, TURNED, FULL, CHARGE, HOLD, DESSERT: PUM * PUM_DMG + SWING_DMG + BF_DMG, get state() { return { insert: !!insert, show: show && show.kind, pin: !!pin }; } };
})();
