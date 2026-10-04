/* JUJUTSU UNLIMITEDS — Awakened Limitless. Maximum: Blue, Reversal Red: MAX, 150% Hollow Purple, and Unlimited Void on the fourth key.
   Two secrets. Reversal Red: MAX and then Maximum: Blue straight after it: the camera goes right round him and he fires Imaginary Technique: Purple (275,
   and both moves wait 25 seconds). And, with the Gojo clan, R and 2 while the domain is opening: a 0.2 second domain, after which the enemy cannot
   move for seven seconds, he is too fast to follow, every hit of his is worth 7, and it ends on a Black Flash worth 250 */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, D = JU.domain, keys = E.keys;
const { rnd, lerp, clamp, ease, ZP } = E, TAU = Math.PI * 2, { orb, beam, shout } = JU.tech.tk;
const BLUE = '#38c8ff', RED = '#ff2440', VIOLET = '#b79bff';
const QUEST = false;                                // 150% Hollow Purple is meant to be earned through a questline. Off: everybody has it
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const hint = text => E.fx.push({ k: 2, x: E.P1.x, y: E.P1.y + 335, n: text, col: VIOLET, t: 0, life: 1.4 });
const gojo = () => !!JU.clan.active && JU.clan.active.id === 'gojo';
const exact = (o, n) => n / (o.dr || 1);            // a hit worth a stated amount whatever the target is made of

let blue = null;                                    // the orb of Maximum: Blue while it is out
let armed = 0;                                      // seconds left in which Maximum: Blue, pressed after Red: MAX, becomes Purple
let cine = null, lastT = 0;                         // the camera going round him before Imaginary Technique: Purple
let quick = null;                                   // a domain being opened right now, and whether R and 2 have been pressed during it
let still = 0, fast = 0;                            // after a 0.2 second domain: how long the enemy stays frozen, and how long he stays fast

/* ---------- Imaginary Technique: Purple. The fight stops; the camera flies once round him, comes to rest in front, and he lets it go ---------- */
const T_ORBIT = .2, T_HOLD = 1.9, T_FLASH = 2.35, T_OUT = 2.5;
const STREAKS = Array.from({ length: 46 }, (_, i) => [i / 46 * TAU + (i * 7 % 5) * .1, .08 + (i * 37 % 100) / 100 * .84, .5 + (i * 13 % 10) / 10]);   // angle round him, height, length
function hero(f, cx, cy, s) {                       // a fighter drawn straight onto the screen: feet at (cx, cy), s times the size the arena would draw it
  const q = P(f.x, f.y, ZP);
  g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(-q[0], -q[1]); E.drawFighter(f); g.restore();
}
function drawCine() {
  const c = cine, VW = E.VW, VH = E.VH, t = (c.t += E.T - lastT), cx = VW / 2, cy = VH * .82;
  lastT = E.T;
  if (t < T_OUT) E.stop(.05);
  const a = Math.min(1, t / .16) * (t > T_FLASH ? Math.max(0, 1 - (t - T_FLASH) / (T_OUT - T_FLASH)) : 1);
  const u = clamp((t - T_ORBIT) / (T_HOLD - T_ORBIT), 0, 1), th = TAU * ease(u), hold = clamp((t - T_HOLD) / (T_FLASH - T_HOLD), 0, 1);
  g.save(); g.globalAlpha = a;
  const sky = g.createLinearGradient(0, 0, 0, VH);
  sky.addColorStop(0, '#02030c'); sky.addColorStop(.6, '#0a1030'); sky.addColorStop(1, '#03040d');
  g.fillStyle = sky; g.fillRect(0, 0, VW, VH);
  g.globalCompositeOperation = 'lighter';
  E.glow(E.GLOW.blue, cx - VW * .3 * Math.cos(th), VH * .42, VW * .7, .3); E.glow(E.GLOW.red, cx + VW * .3 * Math.cos(th), VH * .42, VW * .7, .26);
  g.globalCompositeOperation = 'source-over';
  const turn = Math.abs(Math.sin(u * Math.PI));     // how fast the view is moving round him: the streaks stretch with it
  g.lineCap = 'round';
  for (const s of STREAKS) {                        // what is around him, sliding past as the camera goes round
    const d = s[0] - th, depth = Math.cos(d);
    if (depth < -.2) continue;
    const x = cx + Math.sin(d) * VW * .62, y = VH * s[1], len = (10 + 150 * turn) * s[2];
    g.strokeStyle = `rgba(190,225,255,${.12 + .5 * Math.max(0, depth)})`; g.lineWidth = 1 + 2.5 * Math.max(0, depth);
    g.beginPath(); g.moveTo(x - len, y); g.lineTo(x + len, y); g.stroke();
  }
  g.strokeStyle = 'rgba(190,225,255,.5)'; g.lineWidth = 3; g.setLineDash([26, 22]); g.lineDashOffset = -th * 220;      // the floor under him, turning the other way
  g.beginPath(); g.ellipse(cx, cy, VW * .2, VH * .05, 0, 0, TAU); g.stroke(); g.setLineDash([]);
  const hx = cx + c.face * VH * .15 * hold, hy = cy - VH * .34;                          // where his hands are
  const orbs = [[0, 'blue', '#06203a'], [Math.PI, 'red', '#3a0610']].map(o => { const d = o[0] - th + Math.PI / 2; return { depth: Math.cos(d), x: lerp(cx + Math.sin(d) * VW * .2, hx, hold), y: lerp(cy - VH * .3 + Math.cos(d) * VH * .03, hy, hold), img: o[1], core: o[2] }; });
  const ball = o => { const r = VH * .05 * (1 + .3 * o.depth) * (1 - hold * .5); g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW[o.img], o.x, o.y, r * 4.4, 1); g.globalCompositeOperation = 'source-over'; g.fillStyle = o.core; g.beginPath(); g.arc(o.x, o.y, r, 0, TAU); g.fill(); };
  for (const o of orbs) if (o.depth < 0) ball(o);
  hero({ skin: c.skin, x: 0, y: 0, face: c.face, spin: Math.cos(th) || .001, scale: 1, pose: hold > .3 ? POSE.div : POSE.manjiWind }, cx, cy, VH / 430 * (1 + .12 * u));
  for (const o of orbs) if (o.depth >= 0) ball(o);
  if (hold > 0) {                                   // the two of them brought together: the thing that is neither
    const r = VH * (.03 + .1 * hold);
    g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.purple, hx, hy, r * 5, 1); g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#14042a'; g.beginPath(); g.arc(hx, hy, r, 0, TAU); g.fill();
    g.strokeStyle = VIOLET; g.lineWidth = 4; g.stroke();
  }
  g.font = `${Math.round(VH * .05)}px Anton, Impact, sans-serif`; g.textAlign = 'left'; g.textBaseline = 'top'; g.lineJoin = 'round';
  g.lineWidth = VH * .012; g.strokeStyle = '#07060c'; g.strokeText('IMAGINARY TECHNIQUE', VW * .06, VH * .1); g.fillStyle = '#fff'; g.fillText('IMAGINARY TECHNIQUE', VW * .06, VH * .1);
  if (hold > 0) { g.font = `${Math.round(VH * .13)}px Anton, Impact, sans-serif`; g.strokeText('PURPLE', VW * .06, VH * .16); g.fillStyle = VIOLET; g.fillText('PURPLE', VW * .06, VH * .16); }
  g.restore();
  if (t > T_FLASH - .08) { g.fillStyle = `rgba(255,255,255,${t < T_FLASH ? (t - T_FLASH + .08) / .08 : Math.max(0, 1 - (t - T_FLASH) / (T_OUT - T_FLASH))})`; g.fillRect(0, 0, VW, VH); }
  if (t >= T_OUT) { cine = null; E.root.classList.remove('dom'); }
}
const PURPLE = { name: 'Imaginary Technique: Purple', dur: .9, glow: 'purple', run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.rate = 30;
  if (!m.c) {
    m.c = 1; p.inv = Math.max(p.inv, 3.6); p.face = o.x >= p.x ? 1 : -1;
    cine = { t: 0, skin: p.skin, face: p.face }; lastT = E.T; E.root.classList.add('dom'); sfx.charge(); sfx.bf();
  }
  if (cine) { p.target = POSE.manjiWind; return; }
  p.target = t < .5 ? POSE.div : POSE.idle;
  if (m.s) return;
  m.s = 1; sfx.bf(); sfx.blast(); shake(40); E.zoomIn(.6); E.banner('虚式・茈', 'IMAGINARY TECHNIQUE: PURPLE', 'xs');
  const f = p.face, hx = p.x + f * 120, hy = p.y + 190;
  V.custom(.4, u => { const x = hx + f * 1600 * Math.min(1, u * 2.5); beam(hx, x, hy, 80, 'purple', .6 * (1 - u)); orb(x, hy, 110, 'purple', '#14042a'); });
  for (let i = 1; i < 7; i++) V.crack(hx + f * i * 230, 170);
  if (!o.ko && (o.x - p.x) * f > -30) { E.applyHit(o, f, { dmg: exact(o, 275), kb: 1300, lift: 520, stun: .9, stop: .3, heavy: 1, col: VIOLET, fixed: 1 }); V.impact(.2, o.x, o.y + 150); }
} };

/* ---------- after a 0.2 second domain: the Black Flash it all ends on ---------- */
const FINISH = { name: 'Black Flash', dur: .9, glow: 'red', run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.rate = 46;
  if (!m.c) {
    const side = o.x >= p.x ? 1 : -1;
    m.c = 1; p.inv = Math.max(p.inv, 1); sfx.charge();
    Object.assign(p, { x: clamp(o.x - side * 120, -950, 950), y: 0, vy: 0, ground: true, face: side });
  }
  if (t < .18) { p.target = POSE.divWind; const w = E.hand(p, false); V.mote(w[0], w[1], 'red'); return; }
  p.target = t < .5 ? POSE.div : POSE.idle;
  if (m.s) return;
  m.s = 1; sfx.whoosh();
  if (o.ko) return;
  E.applyHit(o, p.face, { dmg: exact(o, 250), kb: 1100, lift: 560, stun: .9, stop: .3, heavy: 1, col: RED, fixed: 1, fin: 1 });
  E.blackFlash();
} };
// while he is that fast he does not have to throw anything himself: stand within reach of it and the strikes simply land, seven at a time
const FLURRY = { name: 'Flurry', dur: .12, glow: 'blue', run(p, m, t) {
  const o = E.P2, dir = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
  p.rate = 60; p.vx = dir * 360; p.target = m.alt ? POSE.cross : POSE.jab;
  if (m.done) return;
  m.done = 1;
  if (o.ko || !reach(p, o)) return;
  p.face = o.x >= p.x ? 1 : -1;
  E.applyHit(o, p.face, { dmg: 7, kb: 0, stun: .5, stop: .012, col: BLUE });
  const w = E.hand(p, !m.alt); V.ring(w[0], w[1], 44, BLUE, .14);
  if (m.alt) sfx.whoosh();
} };
const reach = (p, o) => Math.abs(o.x - p.x) < 185 + 40 * ((o.scale || 1) - 1) && Math.abs(o.y - p.y) < 170 && o.state !== 'down';
let alt = 0, idle = 0;
function after02() {                                // the 0.2 seconds are over: it has seen everything there is, and has seven seconds of that still to get through
  const p = E.P1;
  if (p.dead || !on()) return;
  still = fast = 7; sfx.bf(); shake(20); hint('SEVEN SECONDS');
  V.ring(p.x, p.y + 150, 320, BLUE, .4);
}

const MOVES = {
  // 1 — the orb at full output: it circles him, and whatever is near it is dragged after it
  strikes: { name: 'Maximum: Blue', cd: 10, dur: .6, glow: 'blue', run(p, m, t) {
    p.vx = 0; p.rate = 30; p.target = t < .45 ? POSE.manjiWind : POSE.idle;
    if (m.s || t < .15) return;
    m.s = 1; sfx.charge(); sfx.blast(); shout(p, '出力最大「蒼」', BLUE);
    blue = { t: 0, a: p.face > 0 ? 0 : Math.PI, pull: 0, x: p.x, y: p.y + 175, z: 0 };
  } },
  // 2 — Red, with nothing held back: across the whole arena before the eye can follow it
  crush: { name: 'Reversal Red: MAX', cd: 7, dur: .6, glow: 'red', run(p, m, t) {
    p.vx = 0; p.rate = 36; p.target = t < .16 ? POSE.divWind : t < .42 ? POSE.jab : POSE.idle;
    if (t < .16 || m.s) return;
    m.s = 1; sfx.bf(); shake(26);
    const f = p.face, x0 = p.x + f * 90, y = p.y + 175;
    V.custom(.12, u => orb(x0 + f * 1500 * u, y, 34, 'red', '#fff'));
    V.bolt(x0, y, x0 + f * 1500, y, RED, .25, 8, '#fff');
    for (let i = 1; i < 6; i++) V.ring(x0 + f * i * 240, y, 120 + i * 20, RED, .2 + i * .03);
    if (E.tryHit(p, { reach: 1500, dmg: 32, kb: 1300, lift: 420, stop: .16, heavy: 1, col: RED })) { V.sparks(E.P2.x, y, 'red', 20); E.addBlast(E.P2.x, y, '255,44,72', 340); }
    if (E.cd.strikes <= 0) { armed = 1.6; hint('1  ·  IMAGINARY TECHNIQUE: PURPLE'); }
  } },
  // 3 — red and blue fed into each other until the thing is the size of a house, and then put down next to whatever he is looking at
  div: { name: '150% Hollow Purple', cd: 45, dur: 2.3, glow: 'purple', run(p, m, t) {
    const o = E.P2, top = p.y + 480;
    p.vx = 0; p.rate = 22;
    if (t < 1.25) {
      p.target = POSE.crushWind;
      if (m.c) return;
      m.c = 1; p.inv = Math.max(p.inv, 2.4); E.slow(.5); E.banner('虚式', '150% HOLLOW PURPLE', 'xs'); sfx.charge();
      V.custom(1.25, u => {
        const s = 1 - Math.min(1, u * 1.6), x = p.x;
        orb(x - 170 * s, top, 30, 'blue', '#06203a'); orb(x + 170 * s, top, 30, 'red', '#3a0610');
        if (u > .45) orb(x, top, 200 * Math.min(1, (u - .45) * 2.2), 'purple', '#14042a');
      });
      return;
    }
    p.target = t < 1.75 ? POSE.crush : POSE.idle;
    if (!m.s) {
      const x0 = p.x, x1 = m.x1 = o.ko ? p.x + p.face * 600 : o.x;
      m.s = 1; sfx.bf();
      V.custom(.45, u => orb(lerp(x0, x1, ease(u)), lerp(top, 200, ease(u)), 200, 'purple', '#14042a'));
    }
    if (m.b || t < 1.7) return;
    m.b = 1; sfx.bf(); sfx.blast(); shake(46); E.zoomIn(.6); V.impact(.5, m.x1, 200); E.addBlast(m.x1, 200, '157,123,255', 760);
    for (let i = 0; i < 5; i++) V.ring(m.x1, 200, 260 + i * 150, VIOLET, .35 + i * .07);
    V.crack(m.x1, 520); V.rocks(m.x1, 0, 24);
    if (!o.ko && Math.abs(o.x - m.x1) < 520) E.applyHit(o, p.face, { dmg: exact(o, 1050), kb: 1400, lift: 640, stun: .9, stop: .4, heavy: 1, col: VIOLET, fixed: 1 });
  } },
  // 4 — Domain Expansion. With the Gojo clan, R and 2 while it is opening make it the 0.2 second one
  manji: { name: 'Unlimited Void', cd: 30, dur: .6, glow: 'blue', run(p, m, t) {
    p.vx = 0; p.target = t > .3 ? POSE.idle : D.SIGN;
    if (m.c) return;
    m.c = 1; p.inv = Math.max(p.inv, 1);
    if (JU.training.on) E.cd.manji = 0;             // no waiting in Training
    quick = { r: false, two: false };
    if (gojo()) hint('R  +  2  ·  0.2 SECOND DOMAIN');
    D.open({ who: p, tone: 'blue', skin: p.skin, reveal() {
      const short = quick && quick.r && quick.two;
      quick = null;
      D.raise('void', { who: p, dur: short ? .2 : 6 });
      E.after(.25, () => E.banner(short ? '0.2秒' : '無量空処', short ? '0.2 SECOND DOMAIN' : 'UNLIMITED VOID', 'sm'));
      if (short) E.after(.24, after02);
    } });
  } }
};

JU.tech.add('alimit', { name: 'Awakened Limitless', jp: '無下限呪術', mark: '蒼', who: 'Satoru Gojo, with nothing held back', odds: 0, col: BLUE, glow: 'blue', moves: MOVES, awakened: true });
const DEF = JU.tech.TECH.alimit, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
const press0 = H.press, tick0 = H.tick, under0 = H.under, fx0 = H.fx, post0 = H.post, reset0 = H.reset, start0 = H.fightStart, pow0 = H.power, rate0 = H.m1rate;
H.press = (a, inScene) => {
  if (!inScene && on()) {
    const p = E.P1;
    if (quick && D.busy && (a === 'clan' || a === 'crush')) {                         // the domain is opening: R, then 2
      if (!gojo()) return true;
      if (a === 'clan') quick.r = true; else quick.two = true;
      sfx.hover(); if (quick.r && quick.two) { sfx.charge(); hint('0.2 SECOND DOMAIN'); }
      return true;
    }
    if (cine || D.busy) return press0 ? press0(a, inScene) : false;
    if (a === 'strikes' && armed > 0 && E.cd.strikes <= 0 && !p.dead && !p.ps) {      // Blue straight after Red: MAX: neither of them, but Purple
      if (p.move) E.endMove(p);
      armed = 0; E.cd.strikes = E.cd.crush = 25; p.move = { def: PURPLE, t: 0 };
      return true;
    }
    if (a === 'div' && QUEST) { shout(p, 'LOCKED', VIOLET); return true; }
    if (a === 'manji' && (D.now || E.P2.ko)) return true;                             // one domain at a time
  }
  return press0 ? press0(a, inScene) : false;
};
H.power = (h, o) => {
  const k = pow0 ? pow0(h, o) : 1;
  return fast > 0 && on() && o === E.P2 && !h.fin && h.dmg > 0 ? 7 / (h.dmg * (o.dr || 1)) : k;      // too fast to put any weight behind it: every hit is seven
};
H.m1rate = () => (rate0 ? rate0() : 1) * (fast > 0 && on() ? 2 : 1);
H.tick = dt => {
  tick0(dt);
  const p = E.P1, o = E.P2;
  if (armed > 0) armed -= dt;
  if (blue) {
    const b = blue;
    b.t += dt; b.a += dt * 4.4;
    b.x = p.x + Math.cos(b.a) * 330; b.y = p.y + 175 + Math.sin(b.a * 2) * 34; b.z = Math.sin(b.a);
    if (!o.ko && !(o.alpha < 1)) {                  // dragged toward it wherever it has got to
      const dx = b.x - o.x, d = Math.abs(dx);
      if (d < 760) o.x = clamp(o.x + Math.sign(dx) * Math.min(d, 640 * dt * (1 - d / 1000)), -965, 965);
      if ((b.pull -= dt) <= 0 && d < 250) { b.pull = .32; E.applyHit(o, Math.sign(dx) || 1, { dmg: 4, kb: 0, stun: .5, stop: .02, col: BLUE }); }
    }
    if (Math.random() < dt * 50) V.mote(b.x, b.y, 'blue');
    if (Math.random() < dt * 12) V.rocks(b.x + rnd(-260, 260), 0, 1);
    if (b.t > 4 || p.dead) { V.ring(b.x, b.y, 260, BLUE, .35); blue = null; }
  }
  if (still > 0) {
    still -= dt;
    if (!o.ko && (o.state === 'idle' || o.state === 'act' || o.state === 'up' || o.state === 'hurt')) Object.assign(o, { state: 'hurt', stun: Math.max(o.stun || 0, .3), act: null, tele: 0 });
  }
  if (fast > 0 && on()) {
    const dir = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
    fast -= dt;
    if (!p.move && !p.ps && !p.dead && !(p.dashT > 0) && dir) { p.x = clamp(p.x + dir * 560 * dt, -965, 965); if (Math.random() < dt * 40) V.puff('blue', p.x - dir * 40, p.y + rnd(40, 240), -dir * 300, 0, 26, .25); }
    if (!p.move && !p.ps && !p.dead && !(p.dashT > 0) && p.ground && !o.ko && reach(p, o)) {      // in reach: it hits by itself
      if (idle++) { idle = 0; p.move = { def: FLURRY, t: 0, alt: (alt ^= 1) }; }                     // (one frame is left between strikes, so a dash, a jump or a move can still be got in)
    } else idle = 0;
    if (fast <= 0 || o.ko) {                         // time is up: the last one is a Black Flash
      fast = still = 0;
      if (!o.ko && !p.dead) { if (p.move) E.endMove(p); p.ps = null; p.move = { def: FINISH, t: 0 }; }
    }
  }
};
function drawBlue() { const b = blue; orb(b.x, b.y, 62 + 6 * Math.sin(E.T * 9), 'blue', '#06203a'); const c = F(b.x, b.y); g.strokeStyle = 'rgba(160,225,255,.7)'; g.lineWidth = 3; g.beginPath(); g.ellipse(c[0], c[1], 110 * c[2], 30 * c[2], E.T * 3, 0, TAU); g.stroke(); }
H.under = dt => { under0(dt); if (blue && blue.z > 0) drawBlue(); };
H.fx = dt => {
  fx0(dt);
  if (blue && blue.z <= 0) drawBlue();
  const p = E.P1, o = E.P2;
  if (still > 0 && !o.ko) {                         // everything there is to know, still arriving
    const c = F(o.x, o.y + 285 * (o.scale || 1)), k = c[2];
    g.strokeStyle = 'rgba(190,230,255,.8)'; g.lineWidth = 3;
    g.beginPath(); g.ellipse(c[0], c[1] - 34 * k, 46 * k, 13 * k, 0, E.T * 4, E.T * 4 + 4.6); g.stroke();
  }
  if (fast > 0 && on()) { const c = F(p.x, p.y + 330), w = 90 * c[2]; g.fillStyle = 'rgba(8,6,14,.7)'; g.fillRect(c[0] - w, c[1], w * 2, 7 * c[2]); g.fillStyle = BLUE; g.fillRect(c[0] - w, c[1], w * 2 * fast / 7, 7 * c[2]); }
};
H.post = dt => { post0(dt); if (cine) drawCine(); };
const clear = () => { blue = cine = quick = null; armed = still = fast = 0; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { clear(); start0(cfg, wave); };

JU.alimit = { MOVES, PURPLE, FINISH, FLURRY, QUEST, get state() { return { armed, still, fast, cine: !!cine, blue: !!blue }; } };
})();
