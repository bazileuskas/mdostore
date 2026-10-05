/* JUJUTSU UNLIMITEDS — Awakened Limitless. Maximum: Blue, Reversal Red: MAX, 150% Hollow Purple, and Unlimited Void on the fourth key.
   Two secrets. Reversal Red: MAX and then Maximum: Blue straight after it: the camera goes right round him and he fires Imaginary Technique: Purple (275,
   and both moves wait 25 seconds). And, with the Gojo clan, R and 2 while the domain is opening: a 0.2 second domain, after which the enemy cannot
   move for seven seconds, he is too fast to follow, every hit of his is worth 7, and it ends on a Black Flash worth 250.
   0.2v3: redrawn from the anime. Blue, Red and Purple are balls of the stuff now, with weather turning inside them: Blue drags the floor up into
   itself, Red is a bead at his fingertip and then a line across the arena, Purple leaves a trench where it went. No number has changed */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, D = JU.domain, keys = E.keys;
const { rnd, lerp, clamp, ease, ZP } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk;
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
const dragged = [], echoes = [];                    // what Blue has pulled up off the floor; and where he was a moment ago, while he is that fast

/* ---------- what the three of them look like ---------- */
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const zf = z => clamp(z, E.ZNEAR + 12, ZP + 500);   // a depth that is still on the floor
const TONE = {
  blue:   { glow: 'blue',   stops: ['#f2fdff', '#7fe0ff', '#1b6fe0', '#0a1e78', '#01051c'], light: 'rgba(190,240,255,.55)', dark: 'rgba(2,8,48,.6)',  rim: 'rgba(160,230,255,.9)' },
  red:    { glow: 'red',    stops: ['#ffffff', '#ff9aa6', '#ff2440', '#8a0018', '#160004'], light: 'rgba(255,170,170,.5)',  dark: 'rgba(30,0,6,.65)', rim: 'rgba(255,150,160,.9)' },
  purple: { glow: 'purple', stops: ['#ffffff', '#e4d4ff', '#9a5cff', '#3d1496', '#0b021c'], light: 'rgba(230,200,255,.55)', dark: 'rgba(14,2,40,.6)', rim: 'rgba(220,190,255,.95)' }
};
// a ball of it, wherever the canvas is pointing: a lit middle, a body that darkens to its edge, and bands of lighter and darker stuff turning
// inside it like the weather on a planet
function ball(cx, cy, R, tone, spin, a = 1) {
  const t = TONE[tone], gr = g.createRadialGradient(cx - R * .15, cy - R * .15, R * .04, cx, cy, R);
  gr.addColorStop(0, t.stops[0]); gr.addColorStop(.22, t.stops[1]); gr.addColorStop(.55, t.stops[2]); gr.addColorStop(.85, t.stops[3]); gr.addColorStop(1, t.stops[4]);
  lit(() => E.glow(E.GLOW[t.glow], cx, cy, R * 4.6, a));
  g.save(); g.globalAlpha = a;
  g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill();
  g.clip(); g.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const rr = R * (.2 + .095 * i), a0 = i * 2.4 + spin * (1.5 - i * .12) * (i & 1 ? -1 : 1), len = 1 + (i * 37 % 10) / 8;
    g.strokeStyle = i % 3 ? t.light : t.dark; g.lineWidth = R * (.045 + (i % 4) * .022);
    g.beginPath(); g.ellipse(cx + Math.cos(i * 1.7) * R * .1, cy + Math.sin(i * 2.3) * R * .1, rr, rr * (.5 + (i % 3) * .22), i * .8 + spin * .15, a0, a0 + len); g.stroke();
  }
  g.restore();
  g.save(); g.globalAlpha = a; g.strokeStyle = t.rim; g.lineWidth = Math.max(1.5, R * .035); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke(); g.restore();
}
const sphere = (x, y, r, tone, spin, a) => { const c = F(x, y); ball(c[0], c[1], r * c[2], tone, spin, a); return c; };     // the same, standing on the fighting plane
// arms of it winding in from further out (Blue pulls)
function arms(cx, cy, R, rgb, spin, n = 4, reach = 2.8) {
  lit(() => {
    g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const a0 = spin + i / n * TAU;
      g.beginPath();
      for (let j = 0; j <= 12; j++) { const v = j / 12, rr = R * lerp(reach, 1, v), a = a0 + v * 2.2, x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * .84; if (j) g.lineTo(x, y); else g.moveTo(x, y); }
      g.strokeStyle = `rgba(${rgb},.45)`; g.lineWidth = R * .1; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = Math.max(1, R * .025); g.stroke();
    }
    g.lineCap = 'butt';
  });
}
// thin rays standing out of it, no two the same length (Red pushes)
function rays(cx, cy, R, n, rgb, len, seed) {
  lit(() => {
    g.beginPath();
    for (let i = 0; i < n; i++) { const a = i / n * TAU + seed, l = R * (1.2 + len * (.4 + .6 * Math.abs(Math.sin(i * 12.9898 + seed * 7)))); g.moveTo(cx + Math.cos(a) * R * .6, cy + Math.sin(a) * R * .6); g.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); }
    g.strokeStyle = `rgba(${rgb},.85)`; g.lineWidth = Math.max(1, R * .05); g.stroke();
  });
}
// lightning crawling over the outside of it, different every frame (Purple is neither, and is not stable)
function crackle(cx, cy, R, n, col) {
  lit(() => {
    g.strokeStyle = col; g.lineWidth = Math.max(1.5, R * .03); g.lineJoin = 'miter';
    for (let i = 0; i < n; i++) {
      let a = rnd(0, TAU), r = R * rnd(.9, 1.1);
      g.beginPath(); g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      for (let j = 0; j < 5; j++) { a += rnd(.12, .4); r = R * rnd(.95, 1.5); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      g.stroke();
    }
  });
}
// a star of light across it, and rings standing off it
function flare(cx, cy, R, a = 1) {
  lit(() => {
    g.globalAlpha = a; g.fillStyle = '#fff';
    g.beginPath(); g.ellipse(cx, cy, R * 3.2, R * .07, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(cx, cy, R * .07, R * 2.2, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(220,200,255,.6)'; g.lineWidth = 1.5;
    for (const k of [1.35, 1.7, 2.3]) { g.beginPath(); g.arc(cx, cy, R * k, 0, TAU); g.stroke(); }
    g.globalAlpha = 1;
  });
}
// lines thrown straight out from a point, from r0 to r1
function lines(cx, cy, n, r0, r1, rgb, a, w = 3) {
  lit(() => {
    g.beginPath();
    for (let i = 0; i < n; i++) { const an = i / n * TAU + (i * 7 % 5) * .21, s0 = r0 * (1 + (i * 13 % 7) / 10), s1 = r1 * (.6 + (i * 29 % 10) / 14); g.moveTo(cx + Math.cos(an) * s0, cy + Math.sin(an) * s0); g.lineTo(cx + Math.cos(an) * s1, cy + Math.sin(an) * s1); }
    g.strokeStyle = `rgba(${rgb},${a})`; g.lineWidth = w; g.stroke();
  });
}
// a beam between two places on the fighting plane: wide and faint, narrower and brighter, and a white middle
function beam3(x0, x1, y, w, rgb, a) {
  const p0 = F(x0, y), p1 = F(x1, y), k = p0[2], seg = (wd, col) => { g.strokeStyle = col; g.lineWidth = wd * k; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke(); };
  lit(() => { g.lineCap = 'round'; seg(w, `rgba(${rgb},${.24 * a})`); seg(w * .55, `rgba(${rgb},${.5 * a})`); seg(w * .2, `rgba(255,255,255,${a})`); g.lineCap = 'butt'; });
}
const dim = a => { g.fillStyle = `rgba(2,2,10,${a})`; g.fillRect(-E.VW, -E.VH, E.VW * 3, E.VH * 3); };      // the light going out of everything else
// a mark left along the floor from x0 to x1, d deep either side of where they stand: dark, with an edge that glows for a while
function scar(x0, x1, d, rgb, life) {
  x0 = clamp(x0, -1040, 1040); x1 = clamp(x1, -1040, 1040);
  V.custom(life, u => {
    const a = Math.min(1, (1 - u) * 3), hot = Math.max(0, 1 - u * 2.2), q = [P(x0, 0, zf(ZP - d)), P(x1, 0, zf(ZP - d)), P(x1, 0, zf(ZP + d)), P(x0, 0, zf(ZP + d))];
    g.beginPath(); q.forEach((c, i) => { if (i) g.lineTo(c[0], c[1]); else g.moveTo(c[0], c[1]); }); g.closePath();
    g.fillStyle = `rgba(4,2,10,${.72 * a})`; g.fill();
    if (hot > 0) lit(() => { g.strokeStyle = `rgba(${rgb},${hot})`; g.lineWidth = 4; g.beginPath(); g.moveTo(q[0][0], q[0][1]); g.lineTo(q[1][0], q[1][1]); g.moveTo(q[3][0], q[3][1]); g.lineTo(q[2][0], q[2][1]); g.stroke(); });     // its two long edges, still hot
  }, 0, true);
}
// and a round one: what is left of the floor where something was put down on it
function crater(x, r, rgb, life) {
  V.custom(life, u => {
    const a = Math.min(1, (1 - u) * 3), hot = Math.max(0, 1 - u * 2), grow = Math.min(1, u * life * 10);
    g.beginPath();
    for (let i = 0; i <= 32; i++) { const th = i / 32 * TAU, q = P(x + Math.cos(th) * r * grow, 0, zf(ZP + Math.sin(th) * r * .55 * grow)); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }
    g.closePath(); g.fillStyle = `rgba(4,2,10,${.78 * a})`; g.fill();
    if (hot > 0) lit(() => { g.strokeStyle = `rgba(${rgb},${hot})`; g.lineWidth = 7; g.stroke(); });
  }, 0, true);
}

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
  E.glow(E.GLOW.blue, cx - VW * .3 * Math.cos(th), VH * .42, VW * .7, .3 * a); E.glow(E.GLOW.red, cx + VW * .3 * Math.cos(th), VH * .42, VW * .7, .26 * a);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = a;
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
  const orbs = [[0, 'blue'], [Math.PI, 'red']].map(o => { const d = o[0] - th + Math.PI / 2; return { depth: Math.cos(d), x: lerp(cx + Math.sin(d) * VW * .2, hx, hold), y: lerp(cy - VH * .3 + Math.cos(d) * VH * .03, hy, hold), img: o[1] }; });
  const one = o => { const r = VH * .058 * (1 + .3 * o.depth) * (1 - hold * .5); if (o.img === 'red') rays(o.x, o.y, r, 12, '255,255,255', 1.6, t * 5); else arms(o.x, o.y, r, '56,200,255', -t * 6, 3, 2.2); ball(o.x, o.y, r, o.img, t * 7 * (o.img === 'red' ? -1 : 1), a); };
  for (const o of orbs) if (o.depth < 0) one(o);
  hero({ skin: c.skin, x: 0, y: 0, face: c.face, spin: Math.cos(th) || .001, scale: 1, pose: hold > .3 ? POSE.div : POSE.manjiWind }, cx, cy, VH / 430 * (1 + .12 * u));
  g.globalAlpha = a;
  for (const o of orbs) if (o.depth >= 0) one(o);
  if (hold > 0) {                                   // the two of them brought together: the thing that is neither
    const r = VH * (.03 + .1 * hold);
    lines(hx, hy, 44, r * 1.4, VW * .8, '200,170,255', .3 * hold * a, 2);
    ball(hx, hy, r, 'purple', t * 5, a); crackle(hx, hy, r, 5, '#e9dcff'); flare(hx, hy, r * .8, hold * a);
  }
  g.globalAlpha = a;
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
    cine = { t: 0, skin: p.skin, face: p.face }; lastT = E.T; E.root.classList.add('dom'); sfx.rise(2.2); sfx.bf();
  }
  if (cine) { p.target = POSE.manjiWind; return; }
  p.target = t < .5 ? POSE.div : POSE.idle;
  if (m.s) return;
  m.s = 1; sfx.purple(); shake(40); E.zoomIn(.6); E.banner('虚式・茈', 'IMAGINARY TECHNIQUE: PURPLE', 'xs');
  const f = p.face, hx = p.x + f * 120, hy = p.y + 190;
  V.custom(.55, u => {                              // it goes the length of the arena with the air torn along beside it, and is not there afterwards
    const x = hx + f * 1600 * Math.min(1, u * 2.6), a = Math.min(1, (1 - u) * 2.2);
    beam3(hx, x, hy, 250, '157,123,255', a);
    lit(() => {
      g.lineCap = 'round';
      for (let i = 0; i < 16; i++) {
        const y = hy + ((i * 37 % 16) - 7.5) * 15, s0 = ((i * 53 % 17) / 17 + E.T * 2.6) % 1, a0 = F(lerp(hx, x, s0), y), b0 = F(lerp(hx, x, Math.min(1, s0 + .17)), y);
        g.strokeStyle = i % 3 ? `rgba(233,220,255,${.7 * a})` : `rgba(255,120,220,${.7 * a})`; g.lineWidth = 3 * a0[2]; g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(b0[0], b0[1]); g.stroke();
      }
      g.lineCap = 'butt';
    });
    if (u < .62) { const c = sphere(x, hy, 110, 'purple', E.T * 4); crackle(c[0], c[1], 110 * c[2], 4, '#e9dcff'); }
  });
  scar(hx, hx + f * 1600, 60, '183,155,255', 3.2);
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
  const w = E.hand(p, !m.alt), hs = o.scale || 1; V.ring(w[0], w[1], 44, BLUE, .14);
  V.slash(o.x + rnd(-40, 40), o.y + rnd(70, 250) * hs, rnd(0, TAU), rnd(150, 260), '#9fd8ff', 7);      // it is being hit from places he is no longer standing
  if (m.alt) sfx.whoosh();
} };
const reach = (p, o) => Math.abs(o.x - p.x) < 185 + 40 * ((o.scale || 1) - 1) && Math.abs(o.y - p.y) < 170 && o.state !== 'down';
let alt = 0, idle = 0, echoAt = 0;
function after02() {                                // the 0.2 seconds are over: it has seen everything there is, and has seven seconds of that still to get through
  const p = E.P1;
  if (p.dead || !on()) return;
  still = fast = 7; sfx.bf(); shake(20); hint('SEVEN SECONDS');
  V.ring(p.x, p.y + 150, 320, BLUE, .4);
  V.custom(.35, u => { const c = F(p.x, p.y + 170); lines(c[0], c[1], 30, 90 * c[2] * (1 + u * 3), 380 * c[2] * (1 + u * 2), '190,235,255', .7 * (1 - u), 2.5); });
}

const MOVES = {
  // 1 — the orb at full output: it circles him, and whatever is near it is dragged after it
  strikes: { name: 'Maximum: Blue', cd: 10, dur: .6, glow: 'blue', run(p, m, t) {
    p.vx = 0; p.rate = 30; p.target = t < .45 ? POSE.manjiWind : POSE.idle;
    if (m.s || t < .15) return;
    m.s = 1; sfx.blue(); shout(p, '出力最大「蒼」', BLUE);
    blue = { t: 0, a: p.face > 0 ? 0 : Math.PI, pull: 0, x: p.x + p.face * 330, y: p.y + 175, z: 0 };
    const sx = blue.x, sy = blue.y;
    V.custom(.4, u => {                             // the air falling in on the place where it starts
      const c = F(sx, sy), k = c[2];
      lit(() => { for (let i = 0; i < 3; i++) { const v = clamp(1 - u * 1.4 + i * .18, 0, 1); g.strokeStyle = `rgba(150,225,255,${.8 * (1 - v)})`; g.lineWidth = 2 + 5 * (1 - v); g.beginPath(); g.arc(c[0], c[1], (60 + 420 * v) * k, 0, TAU); g.stroke(); } });
      lines(c[0], c[1], 26, 80 * k, (500 - 380 * u) * k, '120,215,255', .6 * (1 - u), 2);
    });
  } },
  // 2 — Red, with nothing held back: across the whole arena before the eye can follow it
  crush: { name: 'Reversal Red: MAX', cd: 7, dur: .6, glow: 'red', run(p, m, t) {
    p.vx = 0; p.rate = 36; p.target = t < .16 ? POSE.divWind : t < .42 ? POSE.jab : POSE.idle;
    if (!m.c) {                                     // the bead of it at his fingertip, with the light standing out of it
      m.c = 1; sfx.charge();
      V.custom(.16, u => { const w = E.hand(p, true), c = F(w[0] + p.face * 22, w[1]), R = (7 + 15 * u) * c[2]; rays(c[0], c[1], R, 14, '255,255,255', 5 * u, E.T * 9); ball(c[0], c[1], R, 'red', E.T * 12); });
    }
    if (t < .16 || m.s) return;
    m.s = 1; sfx.red(); shake(26);
    const f = p.face, x0 = p.x + f * 90, y = p.y + 175;
    V.custom(.32, u => {                            // a line of it, there all at once, and rings standing off the line where it pushed the air away
      const head = Math.min(1, u * 3.4), a = (1 - u) ** 1.2;
      beam3(x0, x0 + f * 1500 * head, y, 96 * a, '255,48,80', a);
      lit(() => {
        for (let i = 1; i <= 6; i++) {
          const v = i / 6.5;
          if (v > head) break;
          const c = F(x0 + f * 1500 * v, y), rr = (40 + 170 * u + i * 8) * c[2];
          g.strokeStyle = `rgba(255,96,116,${.8 * a})`; g.lineWidth = 3 * (1 - u) + 1; g.beginPath(); g.ellipse(c[0], c[1], rr * .28, rr, 0, 0, TAU); g.stroke();
        }
      });
      if (head < 1) sphere(x0 + f * 1500 * head, y, 30, 'red', E.T * 14);
    });
    scar(x0, x0 + f * 1500, 26, '255,60,90', 2.2);
    for (let i = 1; i < 7; i++) V.puff('red', x0 + f * i * 220, rnd(10, 50), rnd(-80, 80), rnd(120, 420), rnd(60, 110), rnd(.3, .6));
    if (E.tryHit(p, { reach: 1500, dmg: 32, kb: 1300, lift: 420, stop: .16, heavy: 1, col: RED })) {
      const hx = E.P2.x, hy = y;
      V.sparks(hx, hy, 'red', 20); E.addBlast(hx, hy, '255,44,72', 340); V.rocks(hx, 0, 10);
      V.custom(.4, u => { const c = sphere(hx, hy, lerp(40, 230, ease(u)), 'red', E.T * 6, (1 - u) ** 1.4); rays(c[0], c[1], 60 * c[2] * (1 + u), 18, '255,255,255', 4 * (1 - u), 2); });
    }
    if (E.cd.strikes <= 0) { armed = 1.6; hint('1  ·  IMAGINARY TECHNIQUE: PURPLE'); }
  } },
  // 3 — red and blue fed into each other until the thing is the size of a house, and then put down next to whatever he is looking at
  div: { name: '150% Hollow Purple', cd: 45, dur: 2.3, glow: 'purple', run(p, m, t) {
    const o = E.P2, top = p.y + 480;
    p.vx = 0; p.rate = 22;
    if (t < 1.25) {
      p.target = POSE.crushWind;
      if (m.c) return;
      m.c = 1; p.inv = Math.max(p.inv, 2.4); E.slow(.5); E.banner('虚式', '150% HOLLOW PURPLE', 'xs'); sfx.charge(); sfx.rise(1.2);
      V.custom(2, u => dim(.5 * Math.min(1, u * 5, (1 - u) * 5)), 0, true);     // everything else goes dark while it is made
      V.custom(1.25, u => {
        const s = 1 - Math.min(1, u * 1.6), x = p.x, R0 = 32 + 16 * u;
        if (s > 0) {                                // the two of them, with lightning going between them, closing on each other
          const a = sphere(x - 190 * s, top, R0, 'blue', E.T * 6), b = sphere(x + 190 * s, top, R0, 'red', -E.T * 6);
          arms(a[0], a[1], R0 * a[2], '56,200,255', -E.T * 5, 3, 2.2); rays(b[0], b[1], R0 * b[2], 12, '255,255,255', 1.8, E.T * 6);
          V.bolt(x - 190 * s, top, x + 190 * s, top, VIOLET, .05, 3, '#fff');
        }
        if (u > .45) { const r = 200 * Math.min(1, (u - .45) * 2.2), c = sphere(x, top, r, 'purple', E.T * 2.6); crackle(c[0], c[1], r * c[2], 6, '#e9dcff'); flare(c[0], c[1], r * c[2] * .5, .8); }
        if (Math.random() < .5) V.puff('purple', x + rnd(-420, 420), rnd(0, 40), 0, rnd(300, 700), rnd(14, 30), .5);      // and the floor starts to come up towards it
      });
      return;
    }
    p.target = t < 1.75 ? POSE.crush : POSE.idle;
    if (!m.s) {
      const x0 = p.x, x1 = m.x1 = o.ko ? p.x + p.face * 600 : o.x;
      m.s = 1; sfx.bf();
      V.custom(.45, u => {
        const e = ease(u);
        for (const back of [.16, .08]) { const v = ease(Math.max(0, u - back)); sphere(lerp(x0, x1, v), lerp(top, 200, v), 200, 'purple', E.T * 3, .25); }     // where it was on the way down
        const c = sphere(lerp(x0, x1, e), lerp(top, 200, e), 200, 'purple', E.T * 3); crackle(c[0], c[1], 200 * c[2], 6, '#e9dcff');
      });
    }
    if (m.b || t < 1.7) return;
    m.b = 1; sfx.purple(); shake(46); E.zoomIn(.6); V.impact(.5, m.x1, 200); E.addBlast(m.x1, 200, '157,123,255', 760);
    for (let i = 0; i < 5; i++) V.ring(m.x1, 200, 260 + i * 150, VIOLET, .35 + i * .07);
    V.crack(m.x1, 520); V.rocks(m.x1, 0, 24); crater(m.x1, 470, '183,155,255', 3.6);
    V.custom(.6, u => {                             // a dome of it over the place, and lines thrown out of the middle as far as the edges of the screen
      const c = F(m.x1, 200), k = c[2], a = (1 - u) ** 1.5, R = lerp(200, 860, ease(u)) * k;
      lit(() => { E.glow(E.GLOW.purple, c[0], c[1], R * 3.2, a); E.glow(E.GLOW.white, c[0], c[1], R * 1.5, a); });
      ball(c[0], c[1], R, 'purple', E.T * 3, a * .85);
      lines(c[0], c[1], 54, R * .9, R * 3.4, '233,200,255', .8 * a, 3); lines(c[0], c[1], 20, R * 1.1, R * 3, '255,120,220', .6 * a, 4);
    });
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
    D.open({ who: p, tone: 'blue', skin: p.skin, kind: 'void', reveal() {
      const short = quick && quick.r && quick.two;
      quick = null;
      D.raise('void', { who: p, dur: short ? .2 : 6 });
      E.after(.25, () => { if (!D.clashing) E.banner(short ? '0.2秒' : '無量空処', short ? '0.2 SECOND DOMAIN' : 'UNLIMITED VOID', 'sm'); });
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
    if (a === 'manji' && (D.now || D.clashing || E.P2.ko)) return true;               // one domain of his own at a time
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
    if (Math.random() < dt * 30 && dragged.length < 46) dragged.push({ x: b.x + rnd(-260, 260), y: 0, k: rnd(1.4, 3.2), vy: 0, s: rnd(5, 14), rot: rnd(0, TAU), t: 0 });     // a piece of the floor leaves the floor
    if (b.t > 4 || p.dead) { V.ring(b.x, b.y, 260, BLUE, .35); blue = null; }
  }
  for (let i = dragged.length - 1; i >= 0; i--) {   // pieces of the floor on their way into it: after it, round it, and in, harder the longer they have been up. With nothing left to pull them they fall
    const d = dragged[i];
    d.t += dt; d.rot += dt * 7;
    if (blue) {
      const dx = blue.x - d.x, dy = blue.y - d.y, n = Math.hypot(dx, dy) || 1, pull = 1 - Math.exp(-d.k * dt);
      d.x += dx * pull - dy / n * 260 * dt; d.y = Math.max(0, d.y + dy * pull + dx / n * 260 * dt); d.k += dt * 7;
      if (n < 56 || d.t > 1.6) dragged.splice(i, 1);
    } else { d.vy -= 2400 * dt; d.y += d.vy * dt; if (d.y < 0) dragged.splice(i, 1); }
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
    if ((echoAt -= dt) <= 0 && !p.dead) { echoAt = .045; echoes.push({ f: { skin: p.skin, x: p.x, y: p.y, face: p.face, spin: 1, scale: p.scale, pose: p.pose.slice() }, t: 0 }); }     // what the eye is still seeing of him
    if (fast <= 0 || o.ko) {                         // time is up: the last one is a Black Flash
      fast = still = 0;
      if (!o.ko && !p.dead) { if (p.move) E.endMove(p); p.ps = null; p.move = { def: FINISH, t: 0 }; }
    }
  }
};
// Maximum: Blue: light on the floor under it, rings closing on it and arms winding into it (the pull, where it can be seen), and the ball itself
function drawBlue() {
  const b = blue, c = F(b.x, b.y), fl = F(b.x, 0), k = c[2], R = (64 + 6 * Math.sin(E.T * 9)) * k, spin = E.T * 3.2;
  lit(() => {
    E.glow(E.GLOW.blue, fl[0], fl[1], 540 * k, .32);
    for (let i = 0; i < 3; i++) { const v = 1 - ((E.T * 1.3 + i / 3) % 1); g.strokeStyle = `rgba(120,215,255,${.55 * (1 - v)})`; g.lineWidth = 2 + 3 * (1 - v); g.beginPath(); g.ellipse(c[0], c[1], R * (1 + v * 2.6), R * (1 + v * 2.6) * .86, 0, 0, TAU); g.stroke(); }
  });
  arms(c[0], c[1], R, '56,200,255', -spin * .9, 4, 2.8);
  ball(c[0], c[1], R, 'blue', spin);
  g.strokeStyle = 'rgba(190,240,255,.8)'; g.lineWidth = 3 * k; g.beginPath(); g.ellipse(c[0], c[1], R * 1.75, R * .46, E.T * 3, 0, TAU); g.stroke();
}
H.under = dt => {
  under0(dt);
  for (let i = echoes.length - 1; i >= 0; i--) {    // where he was, a twentieth of a second ago, and the one before that
    const h = echoes[i];
    if ((h.t += dt) >= .22) { echoes.splice(i, 1); continue; }
    const a = 1 - h.t / .22, c = F(h.f.x, h.f.y + 160);
    E.drawFighter(h.f, .3 * a);
    lit(() => E.glow(E.GLOW.blue, c[0], c[1], 300 * c[2], .25 * a));
  }
  if (blue && blue.z > 0) drawBlue();
};
H.fx = dt => {
  fx0(dt);
  if (blue && blue.z <= 0) drawBlue();
  for (const d of dragged) {
    const c = F(d.x, d.y), s = d.s * c[2];
    g.save(); g.translate(c[0], c[1]); g.rotate(d.rot);
    g.fillStyle = '#16203c'; g.fillRect(-s, -s * .7, s * 2, s * 1.4); g.strokeStyle = 'rgba(127,224,255,.85)'; g.lineWidth = 1.5; g.strokeRect(-s, -s * .7, s * 2, s * 1.4);
    g.restore();
  }
  const p = E.P1, o = E.P2;
  if (still > 0 && !o.ko) {                         // everything there is to know, still arriving
    const c = F(o.x, o.y + 285 * (o.scale || 1)), k = c[2];
    g.strokeStyle = 'rgba(190,230,255,.8)'; g.lineWidth = 3;
    g.beginPath(); g.ellipse(c[0], c[1] - 34 * k, 46 * k, 13 * k, 0, E.T * 4, E.T * 4 + 4.6); g.stroke();
    g.strokeStyle = 'rgba(190,230,255,.4)'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(c[0], c[1] - 34 * k, 62 * k, 18 * k, 0, -E.T * 3, -E.T * 3 + 3.4); g.stroke();
  }
  if (fast > 0 && on()) { const c = F(p.x, p.y + 330), w = 90 * c[2]; g.fillStyle = 'rgba(8,6,14,.7)'; g.fillRect(c[0] - w, c[1], w * 2, 7 * c[2]); g.fillStyle = BLUE; g.fillRect(c[0] - w, c[1], w * 2 * fast / 7, 7 * c[2]); }
};
H.post = dt => { post0(dt); if (cine) drawCine(); };
const clear = () => { blue = cine = quick = null; armed = still = fast = 0; dragged.length = echoes.length = 0; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { clear(); start0(cfg, wave); };

JU.alimit = { MOVES, PURPLE, FINISH, FLURRY, QUEST, get state() { return { armed, still, fast, cine: !!cine, blue: !!blue, dragged: dragged.length }; } };
})();
