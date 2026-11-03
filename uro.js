/* JUJUTSU UNLIMITEDS — Build 0.24: GENERAL OF THE SKY (limited, a week). The user, who guessed 0.23v1's teaser: "General Of The Sky (URO). 3 moves,
   Direct Flight, picks up the oponent and dlies with them which is fastr and can controlled by WASD and with this you can actually go to the left/
   right of the map and there will be an extension and an updated border and if you fly up and once the enemy falls down instant 70 damage + on
   your 2nd m1 after flight up youre gonna go to the opponent and downlams them doing 30 damage and the damage for taking them and relaeseing themi
   nthe air is 20 damage. Sky Distortion: distorts the sky launching the enemy into the air doing 50 damage with warping vfx. 3rd move idk you make it
   and 2 variants for now."
   1 DIRECT FLIGHT: in at them, hold of them, and up. For as long as it lasts (four seconds at most) W A S D fly the two of them about, quicker than
     anybody walks, and the arena opens out: its walls go back to a new border over twice as far off, and stay there for the rest of the fight
     (game.js, hooks.wide). A click (or 1 again) lets go of them in the air: 20. Let go of high enough, and the moment they reach the floor: 70.
     Click again while they are still falling and the General is down after them and drives them into the floor: 30.
   2 SKY DISTORTION: the sky round them warps (the picture of it, pulled about), and throws them up: 50.
   3 FALLING SKY (ours): a sheet of the sky pulled down onto them: 40, and pinned under it for a moment.
   4 Coming soon (the user gave three).
   E SKY MIRROR (ours; the Sendai fight has the sky turned against a blast): a pane of sky in front for 0.8 s, and whatever hits it goes back: 40.
   VARIANTS (ours, two for now): DISTORTION SPIKE (2 in the air: the sky over them folds down and spikes them into the floor, 45) and SKY WALL CRASH
   (carry them into the new border during Direct Flight: 25, and they drop). The look is the Sendai boss's (cast6.js, URO) */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, C = JU.cut, T = JU.tech, Z = JU.bossfx;
const { rnd, clamp, lerp, ease, ZP } = E, TAU = Math.PI * 2;
const ENDS = Date.parse('2026-11-10T12:00:00Z');   // a week from the day the General arrived. Move this date to run the event again
const SKY = '#b9a8ff', SRGB = '185,168,255', PALE = '#efe9ff', PRGB = '239,233,255', DEEP = '#241d4a';
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const live = o => !!o && !o.ko && !(o.alpha < 1);
const on = () => T.active === DEF;
const free = p => !p.move && !p.ps && !p.dead && !(p.dashT > 0);
const mid = o => o.y + 170 * (o.scale || 1);
const label = (x, y, text, col = SKY, life = 1.1) => E.fx.push({ k: 2, x, y, n: text, col, t: 0, life });
const holdable = o => live(o) && !duel() && !o.net;  // (another player's body, or one somebody else's game runs, is not ours to carry)
const facing = (p, o) => { if (live(o)) p.face = o.x >= p.x ? 1 : -1; };
const big = (p, o, word, kind = 'bw') => { if (JU.ms) JU.ms.bigHit(p, o, word, SKY, kind); };
const ono = (text, x, y, s = .8, life = .8) => { if (JU.ms) JU.ms.ono(text, x, y, s, SKY, life); };
const shards = (x, y, n = 14, v = 900) => { if (Z) for (let i = 0; i < n; i++) Z.emit(3, x + rnd(-70, 70), y + rnd(-60, 60), rnd(-v, v), rnd(100, v), rnd(6, 14), rnd(.6, 1.2), i % 3 ? '214,206,255' : '255,255,255', { g: 1800, vr: rnd(-14, 14), rot: rnd(0, TAU), edge: 'rgba(40,30,90,.85)' }); };
const FLYP = [.6, -.3, 1.6, 1.45, .4, -.9, 0], RAISE = [-.1, -.3, 2.8, .6, .3, -.35, 0], PULL = [.45, .15, .5, .4, .55, -.55, 0], PALM = [.18, 0, 1.75, .3, .45, -.45, 0];

/* ================= the arena, opened out (Direct Flight) ================= */
const EXTRA = 1100;                                 // how much further back each wall goes
const ext = { w: 0, to: 0 };
function openSky(p) {
  if (ext.to) return;
  ext.to = EXTRA;
  label(p.x, p.y + 520, 'THE SKY OPENS', PALE, 1.4); sfx.skyCrack(); shake(16);
  for (const s of [-1, 1]) { shards(s * 1000, 200, 10, 700); V.ring(s * 1040, 200, 300, SKY, .4); }
}
function drawBorder() {                             // the new border: a curtain of sky where the walls have gone back to
  if (ext.w < 20) return;
  const x0 = 1050 + ext.w - 6, T0 = E.T, a = Math.min(1, ext.w / EXTRA);
  for (const s of [-1, 1]) {
    const x = s * x0, zn = E.ZNEAR, zb = ZP + 520;
    const q = [P(x, 0, zn), P(x, 0, zb), P(x, 420, zb), P(x, 420, zn)];
    const gr = g.createLinearGradient(0, q[3][1], 0, q[0][1]);
    gr.addColorStop(0, `rgba(${SRGB},0)`); gr.addColorStop(.6, `rgba(${SRGB},${.14 * a})`); gr.addColorStop(1, `rgba(${PRGB},${.32 * a})`);
    g.beginPath(); g.moveTo(q[0][0], q[0][1]); for (const c of q.slice(1)) g.lineTo(c[0], c[1]); g.closePath(); g.fillStyle = gr; g.fill();
    lit(() => {
      g.strokeStyle = `rgba(${PRGB},${.7 * a})`; g.lineWidth = 2.5; g.beginPath(); g.moveTo(q[0][0], q[0][1]); g.lineTo(q[1][0], q[1][1]); g.stroke();
      g.strokeStyle = `rgba(${SRGB},${.35 * a})`; g.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {                  // ripples running up it
        const h = ((T0 * .35 + i / 5) % 1) * 420; g.beginPath();
        for (let j = 0; j <= 12; j++) { const z = lerp(zn, zb, j / 12), c = P(x, h + 10 * Math.sin(j * 1.3 + T0 * 3 + i), z); j ? g.lineTo(c[0], c[1]) : g.moveTo(c[0], c[1]); }
        g.stroke();
      }
    });
  }
}

/* ================= the picture of the sky, pulled about (Sky Distortion) =================
   As the Soul Shaper's warp does it (soul.js): what is on the screen round a place is taken, and put back in slices pushed about */
const warps = [];                                   // { x, y, t, life, ph }
let wcv = null, wctx = null;
function warp(x, y, life = .9) { warps.push({ x, y, t: 0, life, ph: rnd(0, TAU) }); }
function drawWarps(dt) {
  for (let i = warps.length - 1; i >= 0; i--) if ((warps[i].t += dt) >= warps[i].life) warps.splice(i, 1);
  if (!warps.length || JU.reduceMotion) return;
  const cv = g.canvas, VW = E.VW, gy = E.GY - 120, zoom = cam.zoom, px = cv.width / VW;
  for (const w of warps) {
    const c = F(w.x, w.y), k = c[2] * zoom, cx = (c[0] - VW / 2) * zoom + VW / 2, cy = (c[1] - gy) * zoom + gy - cam.lift;
    const bw = 620 * k, bh = 700 * k;
    let x0 = Math.round((cx - bw / 2) * px), y0 = Math.round((cy - bh / 2) * px), ww = Math.round(bw * px), hh = Math.round(bh * px);
    if (x0 < 0) { ww += x0; x0 = 0; } if (y0 < 0) { hh += y0; y0 = 0; }
    ww = Math.min(ww, cv.width - x0); hh = Math.min(hh, cv.height - y0);
    if (ww < 8 || hh < 8) continue;
    if (!wcv) { wcv = document.createElement('canvas'); wctx = wcv.getContext('2d'); }
    if (wcv.width < ww || wcv.height < hh) { wcv.width = Math.max(wcv.width, ww); wcv.height = Math.max(wcv.height, hh); }
    wctx.globalCompositeOperation = 'copy'; wctx.drawImage(cv, x0, y0, ww, hh, 0, 0, ww, hh);
    const u = w.t / w.life, on1 = u < .1 ? u / .1 : 1 - Math.max(0, (u - .55) / .45), amp = 34 * k * px * on1, step = Math.max(2, Math.round(3 * px));
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    for (let y = 0; y < hh; y += step) {             // rings of it: each slice pushed by a wave going out from the middle
      const v = y / hh - .5, env = Math.cos(v * Math.PI);
      const off = Math.sin(Math.abs(v) * 26 - w.t * 22 + w.ph) * amp * env + Math.sin(v * 9 + w.t * 7) * amp * .35;
      const sw = 1 + .22 * on1 * env * Math.sin(Math.abs(v) * 18 - w.t * 16), dw = ww * sw;
      g.drawImage(wcv, 0, y, ww, Math.min(step, hh - y), x0 + off + (ww - dw) / 2, y0 + y, dw, Math.min(step, hh - y));
    }
    g.restore();
  }
}
// rings of it going out from a place in the air: thin, pale, the inside of each a little lighter
function ripples(x, y, n = 5, life = .7, R = 360) {
  V.custom(life, u => {
    const c = F(x, y), k = c[2];
    lit(() => {
      for (let i = 0; i < n; i++) {
        const v = Math.max(0, u * 1.3 - i * .08); if (v <= 0 || v >= 1) continue;
        const r = R * ease(v) * k, a = (1 - v) * .9;
        g.strokeStyle = `rgba(${PRGB},${a})`; g.lineWidth = (3.5 - i * .4) * k; g.beginPath(); g.ellipse(c[0], c[1], r, r * .62, 0, 0, TAU); g.stroke();
        g.strokeStyle = `rgba(${SRGB},${a * .6})`; g.lineWidth = 9 * k; g.beginPath(); g.ellipse(c[0], c[1], r * .96, r * .6, 0, 0, TAU); g.stroke();
      }
    });
  });
}
// a seam in the sky, top to bottom, where it gives
function seam(x, life = .5) {
  V.custom(life, u => {
    const a = F(x, 1100), b = F(x, 0), k = b[2], al = (1 - u) ** 1.3, wv = (1 - u) * 18 * k;
    g.save(); g.lineCap = 'round';
    lit(() => { g.strokeStyle = `rgba(${SRGB},${.5 * al})`; g.lineWidth = 40 * k * (1 - u * .5); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
    g.strokeStyle = `rgba(255,255,255,${al})`; g.lineWidth = 3 * k; g.beginPath(); g.moveTo(a[0], a[1]);
    for (let i = 1; i <= 16; i++) { const v = i / 16; g.lineTo(lerp(a[0], b[0], v) + Math.sin(v * 21 + u * 30) * wv, lerp(a[1], b[1], v)); }
    g.stroke(); g.restore();
  });
}

/* ================= 1 — DIRECT FLIGHT ================= */
const FLY_V = 1000, FLY_T = 4, FLY_TOP = 320, FLY_LOW = 40, UP = 200;      // how fast; for how long; how high (a fight's sky ends about there); how low; let go above UP and the floor does 70
const LET_GO = 20, DIVE = 30, FLOOR = 70, CRASH = 25;
let carry = null, fall = null, dive = null;         // { o, t }: held; { o, armed }: let go of and on the way down; { o, until }: a click for the dive
const wind = { s: null };
function grab(p, m, o) {
  m.got = m.t; facing(p, o); sfx.wing(); sfx.hit(true); shake(14); E.stop(.06); openSky(p);
  ono('翔', p.x, p.y + 380, .7);
  if (!holdable(o)) {                               // (a body that is not ours to carry: up it goes instead, and that is all)
    E.applyHit(o, p.face, { dmg: LET_GO, kb: 200, lift: 1500, stun: 1, stop: .15, heavy: 1, col: SKY });
    m.done = 1; return;
  }
  carry = { o, t: 0 }; p.inv = Math.max(p.inv || 0, FLY_T + .4);
  V.ring(o.x, mid(o), 220, SKY, .3);
  if (sfx.wind) wind.s = sfx.wind(FLY_T);
}
function hold(p, o) {                               // in front of the General, a little below
  const eb = H.bound ? H.bound() : 965;
  Object.assign(o, { x: clamp(p.x + p.face * 125, -eb, eb), y: Math.max(1, p.y - 55), vx: 0, vy: 0, ground: false, state: 'hurt', stun: .5, act: null, tele: 0, face: -p.face });
}
function release(p, why) {
  const o = carry && carry.o;
  carry = null; p.inv = Math.min(p.inv || 0, .25);
  if (wind.s) { wind.s.stop(); wind.s = null; }
  if (!live(o)) return;
  if (why === 'crash') {                            // SKY WALL CRASH: into the border with them
    E.applyHit(o, -p.face, { dmg: CRASH, kb: 300, stun: 1, stop: .2, heavy: 1, col: SKY });
    label(o.x, o.y + 420, 'SKY WALL CRASH', PALE, 1.2); sfx.skyCrack(); shards(o.x, mid(o), 18); ripples(o.x, mid(o), 6, .6, 420); big(p, o, 'ガン');
  } else {
    E.applyHit(o, p.face, { dmg: LET_GO, kb: 160, stun: 1, stop: .1, col: SKY });
    label(o.x, o.y + 420, 'LET GO', PALE, .9);
  }
  Object.assign(o, { ground: false, state: 'air', vy: why === 'crash' ? -200 : -60, vx: why === 'crash' ? -p.face * 160 : p.face * 80, bounced: false });
  fall = { o, armed: o.y >= UP };
  dive = { o, until: E.T + 2.4 };
  sfx.whoosh(); V.ring(o.x, mid(o), 200, SKY, .25);
  if (fall.armed) label(o.x, o.y + 520, 'FALLING', SKY, .8);
}
function floorHit(o) {                              // they reach the floor from that high: 70, at once
  const n = FLOOR;                                  // (exactly that, whatever they are made of; and it does not stand them up again)
  if (duel() || o.net || o.hp - n <= 0) E.applyHit(o, o.x >= E.P1.x ? 1 : -1, { dmg: n / (o.dr || 1), kb: 0, stun: 1, stop: .25, heavy: 1, col: SKY, fixed: 1 });
  else { o.hp -= n; o.lastHit = 0; o.flash = .12; E.addNum(o.x, o.y + 300 * (o.scale || 1), n, '#ffd27a'); }
  sfx.blast(); sfx.bf(); shake(34); E.zoomIn(.3);
  V.crack(o.x, 360); V.rocks(o.x, 0, 16); E.addRing(o.x, '255,255,255', 440); E.addBlast(o.x, 60, SRGB, 420);
  if (Z) { Z.shock(o.x, 700, SRGB, .45, 12); Z.dust(o.x, 10); }
  ono('ドォン', o.x, o.y + 360, 1);
  label(o.x, o.y + 480, 'FROM THE SKY', PALE, 1.2);
}
const FLIGHT = { name: 'Direct Flight', cd: 12, dur: 9, glow: 'purple', run(p, m, t) {
  const o = E.P2, dt = t - (m.lt === undefined ? t : m.lt);
  m.lt = t; p.rate = 40;
  if (m.got === undefined) {                        // in at them
    if (!m.s) { m.s = 1; facing(p, o); sfx.whoosh(); }
    const gap = (o.x - p.x) * p.face;
    if (t > .45 || !live(o)) { p.vx = 0; p.target = POSE.idle; if (t > .6) E.endMove(p); return; }
    p.target = POSE.dash; p.vx = gap > 120 ? p.face * 1800 : 0;
    if (gap > -40 && gap < 170 && Math.abs(o.y - p.y) < 260 && !(o.inv > 0) && o.state !== 'down') grab(p, m, o);
    return;
  }
  if (m.done || !carry) {                           // let go (or never held): a moment, and then whatever the air does with the General
    if (m.rel === undefined) m.rel = t;
    p.target = POSE.fall; if (t > m.rel + .3) E.endMove(p);
    return;
  }
  const k = E.keys, dx = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0), dy = (k.has('w') || k.has('arrowup') || k.has(' ') ? 1 : 0) - (k.has('s') || k.has('arrowdown') ? 1 : 0);
  const n = Math.hypot(dx, dy) || 1;
  p.x += dx / n * FLY_V * dt;
  p.y = clamp(p.y + (dy ? dy / n * FLY_V * dt : (t - m.got < .5 ? 520 : 60) * dt), FLY_LOW, FLY_TOP);      // (nothing pressed: up off the floor at first, then a drift)
  p.vx = 0; p.vy = 0; p.ground = false;
  if (dx) p.face = dx;
  p.target = FLYP;
  hold(p, carry.o);
  carry.t += dt;
  if (Math.random() < .9) V.puff('purple', p.x - p.face * 50, p.y + rnd(80, 240), -p.face * rnd(200, 500) - dx * 300, -dy * 200, rnd(20, 36), .3);
  if (Math.random() < .5) V.custom(.22, u => { const a = F(p.x - p.face * (60 + 300 * u), p.y + 120 + rnd(0, 120)), L = 120 * a[2]; g.strokeStyle = `rgba(${PRGB},${.6 * (1 - u)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a[0] - p.face * L, a[1]); g.stroke(); });
  const eb = H.bound ? H.bound() : 965, o2 = carry.o;
  if (dx && Math.sign(o2.x) === dx && Math.abs(o2.x) >= eb - 12 && carry.t > .25 && ext.w > EXTRA * .9) { release(p, 'crash'); return; }      // into the border
  if (carry.t >= FLY_T || !live(o2)) release(p, 'time');
} };
// the click after letting go: down after them, and into the floor with them
const SKYDIVE = { name: 'Direct Flight', dur: 1.5, glow: 'purple', run(p, m, t) {
  const o = m.o, dt = t - (m.lt === undefined ? t : m.lt);
  m.lt = t; p.rate = 52;
  if (!m.hit) {
    if (!live(o) || t > .6) m.hit = 2;
    else {
      const tx = o.x - p.face * 70, ty = o.y + 50, ddx = tx - p.x, ddy = ty - p.y, d = Math.hypot(ddx, ddy), v = 2800 * dt;
      p.face = o.x >= p.x ? 1 : -1; p.vx = 0; p.vy = 0; p.ground = false; p.target = POSE.crushWind;
      if (Math.random() < .9) V.puff('purple', p.x, p.y + 140, 0, 0, 30, .25);
      if (d > v + 50) { p.x += ddx / d * v; p.y = Math.max(1, p.y + ddy / d * v); return; }
      m.hit = 1;
      E.applyHit(o, p.face, { dmg: DIVE, kb: 100, stun: 1, stop: .2, heavy: 1, col: SKY });
      Object.assign(o, { ground: false, state: 'air', vy: -2400, vx: p.face * 60, bounced: false });
      p.vy = -1700; sfx.blast(); shake(26); big(p, o, 'ドッ'); ripples(o.x, mid(o), 4, .5, 300);
      label(o.x, o.y + 440, 'SKY DIVE', PALE, 1);
    }
  }
  p.target = p.ground ? POSE.idle : POSE.crush;
  if (p.ground && m.land === undefined) { m.land = t; E.addDust(p.x); }
  if (m.land !== undefined && t > m.land + .25) E.endMove(p);
} };

/* ================= 2 — SKY DISTORTION (and in the air: DISTORTION SPIKE) ================= */
function distort(p, m, down) {
  const q = m.o;
  seam(m.x); ripples(m.x, m.y, 6, .8, 460); shards(m.x, m.y, 16, 1000); sfx.skyCrack(); shake(28); E.zoomIn(.3);
  if (Z) Z.flash(SRGB, .25, .2);
  if (!q || !live(q) || q.inv > 0 || Math.abs(q.x - m.x) > 260) return;
  if (down) {                                       // folded down on top of them
    E.applyHit(q, q.x >= p.x ? 1 : -1, { dmg: 45, kb: 60, stun: 1.2, stop: .2, heavy: 1, col: SKY });
    if (holdable(q) && !q.poise) Object.assign(q, { ground: false, state: 'air', y: Math.max(q.y, 26), vy: -2300, bounced: false });
    big(p, q, '墜', 'neg'); label(q.x, q.y + 440, 'DISTORTION SPIKE', PALE, 1.1);
  } else {
    E.applyHit(q, q.x >= p.x ? 1 : -1, { dmg: 50, kb: 60, lift: 1500, stun: 1, stop: .2, heavy: 1, col: SKY });
    big(p, q, '歪', 'neg');
  }
}
const DISTORT = { name: 'Sky Distortion', cd: 9, dur: 1, glow: 'purple', run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.rate = 30; p.target = t < .35 ? RAISE : t < .75 ? PALM : POSE.idle;
  if (!m.s) {
    m.s = 1; facing(p, o); m.o = live(o) && Math.abs(o.x - p.x) < 1000 ? o : null;
    m.x = m.o ? m.o.x : p.x + p.face * 420; m.y = m.o ? mid(m.o) + 20 : 200;
    warp(m.x, m.y, 1); sfx.skyWarp(); ono('歪曲', m.x, m.y + 300, .7, .9);
  }
  if (m.o && t < .35) m.x = m.o.x;                  // (it is round them, wherever they go meanwhile)
  if (t >= .35 && !m.go) { m.go = 1; distort(p, m, false); }
} };
const SPIKE = { name: 'Sky Distortion', dur: .9, glow: 'purple', run(p, m, t) {
  const o = E.P2;
  p.rate = 32; p.target = t < .3 ? RAISE : PULL;
  if (t < .5) { p.vy = Math.max(p.vy, 30); p.vx *= .85; }
  if (!m.s) { m.s = 1; facing(p, o); m.o = live(o) && Math.abs(o.x - p.x) < 1000 ? o : null; m.x = m.o ? m.o.x : p.x + p.face * 420; m.y = m.o ? mid(m.o) + 40 : 200; warp(m.x, m.y + 120, .9); sfx.skyWarp(); }
  if (m.o && t < .3) m.x = m.o.x;
  if (t >= .3 && !m.go) { m.go = 1; distort(p, m, true); }
} };

/* ================= 3 — FALLING SKY (ours): a sheet of the sky, pulled down onto them ================= */
const panes = [];                                   // { x, y, vy, t, hit, w, h, down }
const FALLSKY = { name: 'Falling Sky', cd: 11, dur: 1.1, glow: 'purple', run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.rate = 30; p.target = t < .32 ? RAISE : t < .8 ? PULL : POSE.idle;
  if (!m.s) {
    m.s = 1; facing(p, o);
    const x = live(o) && Math.abs(o.x - p.x) < 1000 ? o.x : p.x + p.face * 420;
    panes.push({ x, y: 640, vy: 0, t: 0, hit: false, w: 560, h: 210, down: false });      // (it comes down into sight at the top of the picture, hangs there, and drops)
    sfx.skyWarp(); ono('天墜', x, 700, .8, 1);
  }
} };
function paneTick(dt) {
  const o = E.P2;
  for (let i = panes.length - 1; i >= 0; i--) {
    const s = panes[i];
    s.t += dt;
    if (s.down) { if (s.t > s.down + .45) panes.splice(i, 1); continue; }
    if (s.t < .38) { s.y = lerp(640, 420, ease(s.t / .38)); continue; }      // (lowered into sight, then the General pulls)
    s.vy -= 6000 * dt; s.y += s.vy * dt;
    if (!s.hit && live(o) && Math.abs(o.x - s.x) < s.w / 2 && s.y < o.y + 300 * (o.scale || 1) && !(o.inv > 0)) {
      s.hit = true;
      E.applyHit(o, o.x >= E.P1.x ? 1 : -1, { dmg: 40, kb: 0, stun: 1.4, stop: .2, heavy: 1, col: SKY });
      if (holdable(o) && !o.poise) Object.assign(o, o.ground !== false && o.y < 2 ? { state: 'down', stun: 1.4, vx: 0 } : { ground: false, state: 'air', vy: -2200, bounced: false });
      big(E.P1, o, 'ズン');
    }
    if (s.y <= 0) {
      s.y = 0; s.down = s.t;
      sfx.skyCrack(); sfx.blast(); shake(30); shards(s.x, 60, 24, 1100); V.crack(s.x, 320); E.addRing(s.x, PRGB, 480); ripples(s.x, 20, 4, .5, 520);
      if (Z) Z.dust(s.x, 10);
    }
  }
}
function drawPane(s) {                              // a sheet of night sky: deep at the top, paler down, stars in it, its edge alight
  const a = s.down ? Math.max(0, 1 - (s.t - s.down) / .45) : Math.min(1, s.t / .2), T0 = E.T;
  const x0 = s.x - s.w / 2, x1 = s.x + s.w / 2, y0 = s.y, y1 = s.y + s.h * (s.down ? Math.max(0, 1 - (s.t - s.down) * 3) : 1);
  const tl = F(x0, y1), tr = F(x1, y1), br = F(x1, y0), bl = F(x0, y0), k = bl[2];
  g.save(); g.globalAlpha = a;
  const gr = g.createLinearGradient(0, tl[1], 0, bl[1]); gr.addColorStop(0, DEEP); gr.addColorStop(1, 'rgba(150,135,240,.75)');
  g.beginPath(); g.moveTo(tl[0], tl[1]);
  for (let i = 1; i <= 10; i++) { const u = i / 10; g.lineTo(lerp(tl[0], tr[0], u), lerp(tl[1], tr[1], u) + Math.sin(u * 12 + T0 * 9) * 5 * k); }      // (its top edge, rippling)
  g.lineTo(br[0], br[1]); g.lineTo(bl[0], bl[1]); g.closePath();
  g.fillStyle = gr; g.fill();
  g.save(); g.clip(); g.fillStyle = 'rgba(255,255,255,.9)';
  for (let i = 0; i < 26; i++) { const sx = lerp(tl[0], tr[0], (i * 37 % 26) / 26), sy = lerp(tl[1], bl[1], (i * 53 % 26) / 26), r = (1 + (i % 3) * .7) * k * (.6 + .4 * Math.sin(T0 * 3 + i)); g.beginPath(); g.arc(sx, sy, r, 0, TAU); g.fill(); }
  g.restore();
  lit(() => { g.strokeStyle = `rgba(${PRGB},.9)`; g.lineWidth = 3 * k; g.stroke(); E.glow(E.GLOW.purple, (bl[0] + br[0]) / 2, bl[1], 420 * k, .5); });
  g.restore();
}

/* ================= E — SKY MIRROR (ours) ================= */
let mirror = null;                                  // { t }
const MIRROR = { name: 'Sky Mirror', jp: '天鏡', col: SKY, cd: 12, dur: .9, run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = PALM;
  if (!m.s) { m.s = 1; mirror = { t: .8 }; sfx.skyWarp(); label(p.x, p.y + 440, 'SKY MIRROR', PALE, .8); }
} };
function drawMirror() {
  const p = E.P1, x = p.x + p.face * 110, T0 = E.T, a = Math.min(1, mirror.t * 4), b = F(x, 0), top = F(x, 330), k = b[2], w = 26 * k;
  g.save(); g.globalAlpha = .85 * a;
  const gr = g.createLinearGradient(0, top[1], 0, b[1]); gr.addColorStop(0, DEEP); gr.addColorStop(1, 'rgba(160,145,245,.6)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(top[0] - w, top[1]); g.lineTo(top[0] + w, top[1]); g.lineTo(b[0] + w, b[1]); g.lineTo(b[0] - w, b[1]); g.closePath(); g.fill();
  lit(() => { g.strokeStyle = `rgba(${PRGB},.95)`; g.lineWidth = 2.5 * k; g.stroke(); for (let i = 0; i < 3; i++) { const y = lerp(top[1], b[1], ((T0 * .8 + i / 3) % 1)); g.beginPath(); g.moveTo(top[0] - w, y); g.lineTo(top[0] + w, y); g.stroke(); } });
  g.restore();
}

/* ================= the moves ================= */
const COMING = { name: 'Coming soon', cd: 0, dur: .01, run(p) { E.endMove(p); } };
const MOVES = { strikes: FLIGHT, crush: DISTORT, div: FALLSKY, manji: COMING };
JU.tech.add('uro', { name: 'General of the Sky', jp: '天空操術', mark: '空', who: 'Sky Manipulation', odds: 2.5, col: SKY, glow: 'purple', moves: MOVES,
  limited: ENDS, skin: JU.cast6.URO, as: ['General of the Sky', '空'],
  hint: '<b>1</b> Direct Flight: <b>W A S D</b> to fly, click to let go · <b>2</b> Sky Distortion · <b>3</b> Falling Sky · <b>E</b> Sky Mirror' });
const DEF = T.TECH.uro;

/* ---------- wiring ---------- */
const press0 = H.press, tick0 = H.tick, fx0 = H.fx, under0 = H.under, post0 = H.post, guard0 = H.guard, reset0 = H.reset, start0 = H.fightStart, wide0 = H.wide, bound0 = H.bound;
H.wide = () => (wide0 ? wide0() : 0) + ext.w;
H.bound = () => { const b = bound0 ? bound0() : 965; return ext.w > 0 ? Math.max(b, 965 + ext.w) : b; };
H.press = (a, inScene) => {
  if (!inScene && on() && E.root.dataset.mode === 'fight' && !E.P1.dead) {
    const p = E.P1;
    if (carry && (a === 'm1' || a === 'strikes')) { release(p, 'let'); return true; }      // a click (or 1 again): let go
    if (carry && (a === 'jump' || a === 'dash' || a === 'crush' || a === 'div' || a === 'manji')) return true;      // (both hands are busy)
    if (a === 'm1' && dive && E.T < dive.until && live(dive.o) && dive.o.y > 30 && !p.ps && (!p.move || p.move.def === FLIGHT)) {      // the next click: down after them
      const o = dive.o; dive = null; if (p.move) E.endMove(p);
      p.move = { def: SKYDIVE, t: 0, o }; return true;
    }
    if (a === 'manji') return true;                 // (4 is still to come)
    if (a === 'crush' && !p.ground && free(p) && !(E.cd.crush > 0)) { E.cd.crush = E.CD.crush; p.move = { def: SPIKE, key: 'crush', t: 0 }; E.hud.mv.crush.classList.add('act'); return true; }      // 2 in the air
  }
  return press0 ? press0(a, inScene) : false;
};
H.guard = (face, a, mul) => {                       // the mirror: what hits it goes back
  if (guard0 && guard0(face, a, mul)) return true;
  if (!on() || !mirror || E.P1.dead) return false;
  mirror = null;
  const p = E.P1, o = E.P2;
  sfx.skyCrack(); shake(24); shards(p.x + p.face * 110, p.y + 180, 14, 800); ripples(p.x + p.face * 110, p.y + 180, 4, .5, 300);
  if (live(o) && Math.abs(o.x - p.x) < 900) E.after(.05, () => { if (!o.ko) { E.applyHit(o, p.face, { dmg: 40, kb: 1000, lift: 500, stun: 1, stop: .2, heavy: 1, col: SKY }); big(p, o, '返'); } });
  label(p.x, p.y + 470, 'TURNED BACK', PALE, 1);
  return true;
};
H.tick = dt => {
  tick0(dt);
  if (ext.w !== ext.to) ext.w = ext.to > ext.w ? Math.min(ext.to, ext.w + 1700 * dt) : Math.max(ext.to, ext.w - 3000 * dt);      // the walls going back
  if (!on()) { if (carry || fall || dive || mirror || panes.length) clear(); return; }
  const p = E.P1;
  if (carry) {
    if (!(p.move && p.move.def === FLIGHT) || p.dead) release(p, 'let');
    else hold(p, carry.o);                          // (again after the foe's own update: it stays in the General's hands)
  }
  if (fall) {
    const o = fall.o;
    if (!live(o) || o !== E.P2) fall = null;
    else if (o.y <= 1.5) { if (fall.armed) floorHit(o); fall = null; }
  }
  if (dive && (E.T > dive.until || !live(dive.o) || dive.o.y <= 30)) dive = null;
  if (mirror && (mirror.t -= dt) <= 0) mirror = null;
  if (panes.length) paneTick(dt);
};
H.under = dt => { under0(dt); if (ext.w > 20) drawBorder(); };
H.fx = dt => {
  fx0(dt);
  if (!on()) return;
  for (const s of panes) drawPane(s);
  if (mirror) drawMirror();
  if (carry) {                                      // the two of them, a wake of sky behind
    const p = E.P1, c = F(p.x, p.y + 160);
    lit(() => E.glow(E.GLOW.purple, c[0], c[1], 260 * c[2], .45));
  }
};
H.post = dt => { drawWarps(dt); if (post0) post0(dt); };
const clear = () => { carry = fall = dive = mirror = null; panes.length = warps.length = 0; if (wind.s) { wind.s.stop(); wind.s = null; } };
H.reset = () => { reset0(); clear(); ext.w = ext.to = 0; };
H.fightStart = (cfg, wave) => { start0(cfg, wave); clear(); if (!wave) ext.w = ext.to = 0; };      // (a new fight: the arena as it was)

JU.uro = { MOVES, FLIGHT, SKYDIVE, DISTORT, SPIKE, FALLSKY, ENDS, esp: MIRROR,      // (esp: E, especial.js)
  get state() { return { ext: Math.round(ext.w), to: ext.to, carry: carry && { t: +carry.t.toFixed(2), y: Math.round(carry.o.y) }, fall: fall && { armed: fall.armed }, dive: !!dive, mirror: !!mirror, panes: panes.length, warps: warps.length }; } };
})();
