/* JUJUTSU UNLIMITEDS — limited time, in Blood Brother's place (Build 0.10): VENGEFUL ARTIST. The manga artist of the Culling Game, who came
   into it with a grudge and a G Warstaff: a spear with a pen nib the size of a sword's blade on the end of it.
   His strikes are the spear's, and they reach further than a fist: 7 each (0.10v1; they were 3, 3, 4 and 6). Each of the four has a sound of
   its own: sounds/vengeful-hit1..4.mp3, cut from a clip the user supplied. There are four hits in that clip, not five, so the chain stays at
   four. The clip is of another game, so those sounds stay in this copy (.gitignore; build.py leaves them out): on the public site the game
   makes four of its own (index.html, sfx.spear). The fourth strike is one of three:
     on the floor, a thrust that sends whatever it hits end over end the length of the arena, into the wall, off it, off the floor and along it;
     with jump held through the chain (W, Space or ↑), an uppercut;
     in the air, a downslam.
   1 Catastrophe: the spear into the target twenty times, 4 each (0.10v1; it was 2.5), and every one of them keeps it stunned.
   2 Broil: a stab for 40; up it goes on the end of the spear, and down into the floor for 60 (0.10v1; it was 30 and 40). What it went through
     bleeds: every move it makes costs it 20, and everything lands on it a fifth harder. Stacks of it add up, and each lasts 30 seconds.
   3 Echart (0.10v1): the spear across him for 0.8 s. Whatever hits him then is caught on it, and paid back: 60. Broil within two seconds of
     that is 20 harder.
   4 is still to come.
   His guard (F) is not a block (0.10v1): he steps out of whatever comes, and a black afterimage takes it. Only a blow timed to land just as
   he settles from the last one catches him.
   There is a great deal of blood. He is not chosen without a warning first (shop.js, gory), and BLOOD OFF (under SFX) takes it away: a wound
   then gives nothing, and what comes off the nib is ink */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, M = E.MOVES, C = JU.cut, Z = JU.bossfx, Fi = JU.fights;
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const exact = (o, n) => n / (o.dr || 1);            // a hit worth the stated amount, whatever the target is made of
const jumping = () => E.keys.has('w') || E.keys.has(' ') || E.keys.has('arrowup');      // jump is held (the touch stick pushed up counts)
const duel = () => !!(JU.pvp && JU.pvp.busy);       // a 1v1: the other fighter is somebody else's game, and goes where that game puts it
const pick = a => a[Math.random() * a.length | 0];

const ENDS = Date.parse('2026-10-29T11:00:00Z');   // seven days from the day he arrived (22 Oct 2026). Move this date to run the event again
const GOLD = '#f2c14e', RGB = '242,193,78', NIB = '#e6e9ef', SHAFT = '#1d1823', INK = '#16121b', BLOOD = '#b3122c', BRGB = '179,18,44';
const M1_DMG = 7, STAB = 4, BROIL = [40, 60], COUNTER = 60, AFTER = 20, AFTER_T = 2;      // what each strike, each of Catastrophe's stabs, Broil's stab and slam, and Echart's payback are worth; and what Broil adds within AFTER_T of a payback
const gore = () => JU.gore !== false;              // the BLOOD switch under SFX
const wet = () => (gore() ? BLOOD : INK);           // what a wound gives; with the blood off, ink off the nib
const hitCol = () => (gore() ? BLOOD : GOLD);      // and the colour a hit flashes
const SOUNDS = ['vengeful-hit1', 'vengeful-hit2', 'vengeful-hit3', 'vengeful-hit4'];

/* ================= how he looks: long dark hair down his back, a coat with ink on it, and eyes that have not closed in days ================= */
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.min(255, (n >> 16) * f) | 0},${Math.min(255, (n >> 8 & 255) * f) | 0},${Math.min(255, (n & 255) * f) | 0})`; };
function poly(fill, pts) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
}
const seg = (...p) => { g.beginPath(); for (let i = 0; i < p.length; i += 4) { g.moveTo(p[i], p[i + 1]); g.lineTo(p[i + 2], p[i + 3]); } g.stroke(); };
const FACE = ['#e8ccb5', '#f6dfcb'], COAT = ['#2a2e3f', '#394056'], PANTS = ['#211e28', '#2e2a37'], SHOE = ['#4a3426', '#5e4332'], HAIR = '#2b1d16', HAIR2 = '#3d2a20';
const ARTIST = {
  torso: COAT,
  armF: [COAT[0], COAT[1], FACE[0], FACE[1], .2], armB: [shade(COAT[0], .62), shade(COAT[1], .62), shade(FACE[0], .78), shade(FACE[1], .78), .2],
  legF: [PANTS[0], PANTS[1], SHOE[0], SHOE[1], .17], legB: [shade(PANTS[0], .62), shade(PANTS[1], .62), shade(SHOE[0], .62), shade(SHOE[1], .62), .17],
  chest() {                                         // the coat open over a pale shirt, and the shirt has ink on it
    g.fillStyle = '#e9e1d0'; g.fillRect(5, -TOR, 21, TOR + 5);
    g.fillStyle = '#cbc1ad'; g.fillRect(5, -TOR, 4, TOR + 5);
    g.fillStyle = INK; g.beginPath(); g.ellipse(17, -46, 4.5, 3.2, .5, 0, TAU); g.fill(); g.beginPath(); g.ellipse(10, -29, 2.6, 2, 0, 0, TAU); g.fill(); g.fillRect(20, -24, 2, 7);
    g.fillStyle = '#1f2230'; g.beginPath(); g.moveTo(24, -TOR); g.lineTo(31, -TOR); g.lineTo(31, -TOR + 34); g.closePath(); g.fill();      // the lapel
    g.fillStyle = '#c9a24a'; g.fillRect(-30, -10, 60, 4);                                                                                // and his belt
  },
  head() {
    poly(HAIR, [-18, -27, -32, -16, -37, 6, -36, 30, -31, 50, -22, 44, -17, 28, -11, 38, -8, 16, -12, -4]);                 // long, and down his back
    E.headBase(FACE[0], FACE[1]);
    poly(HAIR, [-27, 8, -30, -20, -17, -32, 3, -35, 21, -29, 28, -15, 27, 2, 22, -8, 15, -4, 11, -15, 4, -7, -3, -16, -10, -4, -16, -12, -20, 10]);   // parted, and over his brow
    poly(HAIR2, [21, -9, 28, -15, 31, 8, 27, 22, 22, 11]);                                                                  // a lock down beside his face
    g.fillStyle = 'rgba(74,40,62,.42)'; g.fillRect(1, 5, 10, 3); g.fillRect(13, 5, 9, 3);                                     // he has been drawing all night
    g.fillStyle = '#f5f0e6'; g.beginPath(); g.ellipse(6, 1, 3.8, 2.5, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(18, 1, 3.2, 2.5, 0, 0, TAU); g.fill();
    g.fillStyle = LINE; g.beginPath(); g.arc(7.6, 1, 1.35, 0, TAU); g.fill(); g.beginPath(); g.arc(19.2, 1, 1.25, 0, TAU); g.fill();     // pupils like pinpricks
    g.strokeStyle = LINE; g.lineCap = 'round'; g.lineWidth = 2.2; seg(1, -4.5, 10, -2, 14, -2, 22, -5);
    g.lineWidth = 2; g.beginPath(); g.moveTo(8, 15); g.quadraticCurveTo(14, 18.5, 20, 13.5); g.stroke(); g.lineCap = 'butt';       // a thin smile
  }
};

/* ================= the G Warstaff ================= */
// It lies along his front arm: the butt behind his hand, the nib well out in front. Measured along it (L) from his hand, and across it (v)
const BUTT = -98, FERRULE = 106, BASE = 118, TIP = 200, SKEWER = 156;     // (SKEWER: where something run through it hangs, a little short of the point)
let stain = 0;                                      // how much of the nib is red (or black) from what it has been through
function grip(f) {
  const a = f.pose[2] - f.pose[6], w = E.hand(f, true), dx = Math.sin(a) * f.face * (f.spin === undefined ? 1 : f.spin), dy = -Math.cos(a);
  return { dx, dy, at: (L, v = 0) => [w[0] + dx * L - dy * v, w[1] + dy * L + dx * v] };
}
function drawSpear(f) {
  const s = grip(f), pt = (L, v) => F(...s.at(L, v)), k = pt(0)[2];
  const rod = (L0, L1, wd, col) => { const a = pt(L0), b = pt(L1); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.strokeStyle = LINE; g.lineWidth = (wd + 4) * k; g.stroke(); g.strokeStyle = col; g.lineWidth = wd * k; g.stroke(); };
  const shape = (pts, fill, edge) => {
    g.beginPath(); pts.forEach(([L, v], i) => { const c = pt(L, v); if (i) g.lineTo(c[0], c[1]); else g.moveTo(c[0], c[1]); }); g.closePath();
    g.fillStyle = fill; g.fill(); if (edge) { g.lineWidth = 2.5 * k; g.strokeStyle = LINE; g.stroke(); }
  };
  g.lineCap = 'round'; g.lineJoin = 'round';
  rod(BUTT, FERRULE, 7, SHAFT);                     // the staff, black lacquer
  rod(BUTT, BUTT + 10, 9, GOLD);                    // a cap on the end of it
  rod(FERRULE, BASE + 2, 12, GOLD);                 // and the holder the nib sits in
  shape([[BASE, -12], [BASE + 24, -16], [TIP - 16, -5], [TIP, 0], [TIP - 16, 5], [BASE + 24, 16], [BASE, 12]], NIB, true);       // the nib: a G-pen's
  if (stain > .02) {                                // what it has been through, and (with the blood on) running back down it
    g.globalAlpha = Math.min(1, stain); shape([[BASE + 38, -12], [TIP - 16, -5], [TIP, 0], [TIP - 16, 5], [BASE + 38, 12]], wet(), false);
    if (gore() && stain > .4) { const a = pt(BASE + 40, 0), b = pt(BASE - 14, 0); g.strokeStyle = BLOOD; g.lineWidth = 4 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(lerp(a[0], b[0], stain), lerp(a[1], b[1], stain)); g.stroke(); }
    g.globalAlpha = 1;
  }
  const h = pt(BASE + 44), e = pt(TIP), q0 = pt(BASE + 6, -8), q1 = pt(TIP - 20, -3);
  g.strokeStyle = LINE; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(h[0], h[1]); g.lineTo(e[0], e[1]); g.stroke();             // the slit
  g.fillStyle = LINE; g.beginPath(); g.arc(h[0], h[1], 4.5 * k, 0, TAU); g.fill();                                            // and the hole it runs to
  g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(q0[0], q0[1]); g.lineTo(q1[0], q1[1]); g.stroke();     // light along one edge
  g.lineCap = 'butt';
}

/* ================= what comes off it ================= */
// a sound effect lettered in, the way it would be on his pages: thick, tilted, outlined, punched in and gone
function pop(x, y, text, size = 52, fill = '#ffffff') {
  const tilt = rnd(-.22, .22);
  V.custom(.62, u => {
    const c = F(x, y), s = size * c[2] * (u < .12 ? lerp(1.6, 1, u / .12) : 1 + .08 * u);
    g.save(); g.translate(c[0], c[1]); g.rotate(tilt); g.globalAlpha = u < .7 ? 1 : Math.max(0, 1 - (u - .7) / .3);
    g.font = `${Math.round(s)}px 'Yuji Syuku','Yu Mincho',serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = s * .26; g.strokeStyle = LINE; g.strokeText(text, 0, 0);
    g.lineWidth = s * .1; g.strokeStyle = GOLD; g.strokeText(text, 0, 0);
    g.fillStyle = fill; g.fillText(text, 0, 0);
    g.restore();
  });
}
// flecks, thrown the way the spear went (twice as many of them with the blood on: 0.10v1)
const splash = (x, y, dir, n, pow) => C.ink(x, y, dir, gore() ? Math.round(n * 1.8) : Math.ceil(n / 2), pow, wet());
function blood(x, y, dir, n, up = 1) {              // drops that land, and stay on the floor a while
  if (!Z || !gore()) return;
  for (let i = 0; i < n; i++) Z.emit(4, x, y, dir * rnd(120, 640) + rnd(-160, 160), rnd(80, 620) * up, rnd(3, 7), 2, BRGB, { g: 1600, land: 'blood' });
}
function pool(x, r, life = 10) { if (Z && gore()) Z.decal('blood', x, r, '128,8,26', life); }      // what is left on the floor
// a gush: drops in a cone the way the wound faces, thick for a moment
function gush(x, y, dir, n, pow = 1) {
  if (!Z || !gore()) return;
  for (let i = 0; i < n; i++) { const a = rnd(-.5, .9), v = rnd(300, 900) * pow; Z.emit(4, x, y, dir * Math.cos(a) * v, Math.sin(a) * v + 120, rnd(3, 6), 2, i % 4 ? BRGB : '120,6,22', { g: 1700, land: 'blood' }); }
  C.ink(x, y, dir, Math.round(n * .6), pow, BLOOD);
}
// the thrust itself: a line of light the way it went. pz: the pose it is thrown from, since the arm has not got there yet
function jab(p, big, pz) {
  const s = grip({ x: p.x, y: p.y, face: p.face, spin: 1, pose: pz }), a = s.at(BASE), b = s.at(TIP + (big ? 260 : 150));
  V.custom(big ? .2 : .13, u => {
    const e = ease(Math.min(1, u * 3)), c0 = F(a[0], a[1]), c1 = F(lerp(a[0], b[0], e), lerp(a[1], b[1], e)), k = c0[2], al = (1 - u) ** 1.5;
    g.lineCap = 'round';
    lit(() => { g.strokeStyle = `rgba(${RGB},${.55 * al})`; g.lineWidth = (big ? 26 : 14) * k; g.beginPath(); g.moveTo(c0[0], c0[1]); g.lineTo(c1[0], c1[1]); g.stroke(); });
    g.strokeStyle = `rgba(255,250,235,${al})`; g.lineWidth = (big ? 6 : 3) * k; g.beginPath(); g.moveTo(c0[0], c0[1]); g.lineTo(c1[0], c1[1]); g.stroke();
    g.lineCap = 'butt';
  });
}

/* ---------- blood on the lens (0.10v1): the big ones throw it at the screen, and it runs down it ---------- */
const splats = [];
function lens(n, big) {
  if (!gore()) return;
  for (let i = 0; i < n; i++) splats.push({ x: rnd(.06, .94), y: rnd(.06, .62), r: rnd(16, 38) * (big ? 1.4 : 1), t: 0, life: rnd(2.2, 3.2), seed: rnd(1, 99),
    drips: Array.from({ length: 2 + (Math.random() * 3 | 0) }, () => [rnd(-.7, .7), rnd(60, 240), rnd(4, 9)]) });
  if (splats.length > 14) splats.splice(0, splats.length - 14);
}
function drawLens(dt) {
  const VW = E.VW, VH = E.VH, sc = VH / 900;
  for (let i = splats.length - 1; i >= 0; i--) {
    const s = splats[i];
    if ((s.t += dt) >= s.life) { splats.splice(i, 1); continue; }
    if (!gore()) continue;
    const a = Math.min(1, (s.life - s.t) / .8) * .82, x = s.x * VW, y = s.y * VH, r = s.r * sc * Math.min(1, s.t * 14), run = Math.min(1, s.t / 1.8), sd = n => Math.abs(Math.sin(s.seed * (n + 1) * 12.9898) * 43758.5453) % 1;
    g.fillStyle = `rgba(112,4,20,${a})`;
    g.beginPath();                                  // ragged at the edge
    for (let j = 0; j <= 18; j++) { const an = j / 18 * TAU, rr = r * (.7 + .55 * sd(j + 20)); if (j) g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); else g.moveTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
    g.closePath(); g.fill();
    for (let j = 0; j < 7; j++) {                   // thrown out of it in spikes, each with a drop on the end
      const an = sd(j + 40) * TAU, len = r * (1.2 + sd(j + 50) * 1.6), w = r * (.08 + sd(j + 60) * .12), ca = Math.cos(an), sa = Math.sin(an);
      g.beginPath(); g.moveTo(x - sa * w, y + ca * w); g.lineTo(x + ca * len, y + sa * len); g.lineTo(x + sa * w, y - ca * w); g.closePath(); g.fill();
      g.beginPath(); g.arc(x + ca * len * 1.1, y + sa * len * 1.1, w * .9, 0, TAU); g.fill();
    }
    for (let j = 0; j < 9; j++) { const an = s.seed + j * .7, d = r * (1.3 + sd(j) * 1.2); g.beginPath(); g.arc(x + Math.cos(an) * d, y + Math.sin(an) * d, r * (.05 + sd(j + 9) * .12), 0, TAU); g.fill(); }
    for (const [dx, len, w] of s.drips) { const L = len * sc * run, xx = x + dx * r, ww = w * sc; g.fillRect(xx - ww / 2, y, ww, L); g.beginPath(); g.arc(xx, y + L, ww * .85, 0, TAU); g.fill(); }
    g.fillStyle = `rgba(255,140,150,${a * .25})`; g.beginPath(); g.arc(x - r * .3, y - r * .3, r * .18, 0, TAU); g.fill();     // and the light on it
  }
}

/* ================= his strikes ================= */
// [lean, head, armF, armB, legF, legB, rot]. The spear points the way his front arm does
const PZ = {
  vaWind1: [0, 0, 1, .5, .3, -.35, 0],          vaThrust1: [.32, 0, 1.62, 1.25, .62, -.5, 0],
  vaWind2: [.06, 0, 1.3, .3, .3, -.3, 0],       vaThrust2: [.36, .05, 1.8, 1, .58, -.52, 0],
  vaWind3: [-.14, -.1, 3.05, 1.6, .3, -.3, 0],  vaChop: [.5, .15, 1.15, .6, .72, -.55, 0],
  vaWind4: [-.3, 0, .9, .3, .15, -.45, 0],      vaLunge: [.62, 0, 1.58, 1.45, 1.05, -.78, 0],
  vaLow: [.16, 0, .4, .2, .45, -.4, 0],         vaRise: [-.06, -.22, 2.85, 1.9, .5, -.3, 0],
  vaDrive: [.5, .2, .75, .45, .7, -.5, 0],
  vaGuard: [.1, .05, 2.05, 1.65, .58, -.58, 0], vaParry: [.04, -.06, 2.35, 2.05, .48, -.48, 0]
};
Object.assign(POSE, PZ);                            // (the plain strikes find their poses by name)
// the ordinary four, with the spear: they keep the engine's timing and its chain. The fourth sends whatever it hits flying (flung)
const SPEAR = [
  { pre: 'vaWind1', pose: 'vaThrust1', lunge: 230, hit: { reach: 222, kb: 170, stun: .36, stop: .045 } },
  { pre: 'vaWind2', pose: 'vaThrust2', lunge: 230, hit: { reach: 226, kb: 170, stun: .36, stop: .045 } },
  { pre: 'vaWind3', pose: 'vaChop', lunge: 240, strike: .1, dur: .32, hit: { reach: 214, kb: 210, stun: .4, stop: .06 } },
  { pre: 'vaWind4', pose: 'vaLunge', lunge: 560, strike: .17, dur: .62, kick: 0, hit: { reach: 245, kb: 1650, lift: 700, stun: .9, stop: .16, heavy: 1, flung: 1 } }
].map((o, i) => Object.assign({}, M.m1[i], o, { va: 1, sw: 'rgba(242,193,78,.9)', hit: Object.assign({ dmg: M1_DMG, col: GOLD, mute: 1 }, o.hit) }));
// jump held through the chain: the fourth comes up from underneath
const UP = { m1: 1, va: 1, dur: .62, run(p, m, t) {
  p.rate = 46;
  if (t < .14) { p.target = PZ.vaLow; if (p.ground) p.vx = p.face * 160; return; }
  p.target = t < .44 ? PZ.vaRise : POSE.idle; if (p.ground) p.vx = t < .2 ? p.face * 240 : 0;
  if (!m.sw) { m.sw = 1; sfx.whoosh(); V.slash(p.x + p.face * 120, p.y + 220, p.face > 0 ? 1.2 : Math.PI - 1.2, 400, GOLD, 14); }
  if (!m.done && t < .28 && E.tryHit(p, { reach: 228, dmg: M1_DMG, kb: 80, lift: 1150, stun: .9, stop: .1, heavy: 1, col: GOLD, mute: 1 })) m.done = 1;
} };
// in the air: the fourth goes down, and so does he, nib first
const DOWN = { m1: 1, va: 1, dur: 1.4, run(p, m, t) {
  const o = E.P2;
  p.rate = 46;
  if (m.land !== undefined) { p.vx = 0; p.target = t < m.land + .2 ? PZ.vaDrive : POSE.idle; if (t > m.land + .34) E.endMove(p); return; }
  if (p.ground && t > .02) { m.land = t; p.vy = 0; dent(p, m); return; }
  if (t < .12) { p.target = PZ.vaWind3; p.vy = Math.max(p.vy, 80); p.vx *= .88; return; }      // he hangs there a moment with it raised
  if (!m.aim) { m.aim = 1; p.face = o.x >= p.x ? 1 : -1; sfx.whoosh(); m.vx = clamp((o.x - p.face * 70 - p.x) / Math.max(.1, p.y / 1800), -1500, 1500); }
  p.target = PZ.vaDrive; p.vy = -1800; p.vx = m.vx;
  if (!m.done && E.tryHit(p, { reach: 232, dmg: M1_DMG, kb: 160, stun: .9, stop: .12, heavy: 1, col: GOLD, mute: 1 })) {
    m.done = 1;
    if (!o.poise && !o.ko && !duel()) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 26), vy: -1900, vx: p.face * 160, bounced: false });      // and into the floor ahead of him
  }
} };
function dent(p, m) {                               // where he comes down
  const x = p.x + p.face * 90;
  sfx.blast(); shake(m.done ? 26 : 14); E.zoomIn(.25);
  V.crack(x, m.done ? 300 : 180); V.rocks(x, 0, m.done ? 12 : 6); V.ring(x, 40, m.done ? 320 : 200, GOLD, .35);
  if (Z) { Z.shock(x, m.done ? 460 : 300, RGB, .45, 10); Z.dust(x, 8); }
  if (m.done) { pool(x + p.face * 60, 150); blood(x + p.face * 60, 40, p.face, 10, .6); blood(x + p.face * 60, 40, -p.face, 10, .6); }
}
function m1(i) {
  const p = E.P1;
  if (p.skin !== ARTIST) return true;               // in somebody else's body (a clan's): the ordinary strikes, then
  prime();
  p.move = { def: i < 3 ? SPEAR[i] : !p.ground ? DOWN : jumping() ? UP : SPEAR[3], i, t: 0 };
  return false;
}
// a strike of his has gone out, and then landed
function landed(p, m) {
  const o = E.P2, f = p.face, hs = o.scale || 1, n = m.def === UP || m.def === DOWN ? 3 : m.i, x = o.x - f * 18, y = o.y + 168 * hs;
  sfx.spear(n);
  stain = Math.min(1, stain + .18 + .1 * n);
  splash(x, y, f, 3 + 2 * n, .65 + .12 * n); V.sparks(x, y, 'gold', 3 + 2 * n);
  blood(x, y, f, 3 + 2 * n);
  if (n < 3) {
    V.ring(x, y, 60 + 22 * n, GOLD, .14);
    if (n === 2) { pop(x + f * 40, y + 120, 'ザシュ', 44); gush(x, y, f, 10, .8); }       // the cut opens
    return;
  }
  E.zoomIn(.3); shake(24); V.impact(.08, o.x, y); V.ring(x, y, 280, '#ffffff', .25);
  if (Z) { Z.flash(gore() ? BRGB : RGB, .12, .14); Z.flare(x, y, RGB, 380, .18); }
  gush(x, y, f, 18, 1.1); lens(1);
  pop(x + f * 30, y + 140, m.def === UP ? 'ガッ' : m.def === DOWN ? 'ズドッ' : 'ドォン', 66);
}

/* ================= the fourth strike's thrust: end over end, into the wall and off it, off the floor and along it ================= */
let fly = null;
const settle = (r, to) => r - TAU * Math.round((r - to) / TAU);      // the same turn, wound round to whichever is nearest to where it is going
function launch(o) { fly = { o, t: 0, rot: o.pose[6], wall: false, hops: 0, down: false, skid: 0, smear: 0 }; E.slow(.12); }
function wallHit(x, y, side) {
  sfx.blast(); shake(26); E.stop(.06);
  V.rocks(x, Math.max(0, y - 100), 8); V.sparks(x, y, 'white', 10);
  if (Z) { Z.flare(x, y, '255,255,255', 300, .16); Z.dust(x, 6, -side, Math.max(0, y - 140)); }
  gush(x, y, -side, 14, .8);
  const seed = Array.from({ length: 9 }, () => [rnd(0, TAU), rnd(.5, 1)]), red = gore();
  V.custom(1.1, u => {                              // the crack it leaves where it hit (and what it left on it)
    const c = F(x, y), k = c[2];
    g.save(); g.strokeStyle = `rgba(255,255,255,${.85 * (u < .7 ? 1 : (1 - u) / .3)})`; g.lineWidth = 3 * k; g.lineCap = 'round'; g.lineJoin = 'round';
    for (const [an, l] of seed) {
      g.beginPath(); g.moveTo(c[0], c[1]);
      for (let j = 1; j <= 3; j++) { const r = 70 * l * j * k, q = an + Math.sin(j * 7 + an * 3) * .25; g.lineTo(c[0] + Math.cos(q) * r * .45, c[1] + Math.sin(q) * r); }
      g.stroke();
    }
    if (red) { g.fillStyle = `rgba(128,8,26,${.8 * (u < .7 ? 1 : (1 - u) / .3)})`; g.beginPath(); g.ellipse(c[0], c[1], 26 * k, 60 * k, 0, 0, TAU); g.fill(); g.fillRect(c[0] - 4 * k, c[1], 8 * k, 140 * k * Math.min(1, u * 2)); }
    g.restore();
  });
}
function flight(dt) {
  const s = fly, o = s.o, hs = o.scale || 1;
  s.t += dt;
  if (s.t > 2.6 || o !== E.P2) { fly = null; return; }
  if (!o.ground) {
    s.down = false; s.rot -= 12 * dt; o.pose[6] = s.rot;      // (set after the engine has blended its pose, so this is the turn that is drawn)
    if (Math.random() < dt * 30) V.puff('white', o.x - Math.sign(o.vx) * 40, o.y + rnd(80, 220) * hs, -o.vx * .1, rnd(-40, 40), rnd(30, 50), .3);      // the air it tears through
    if (Z && gore() && Math.random() < dt * 40) Z.emit(4, o.x + rnd(-30, 30), o.y + rnd(100, 220) * hs, -o.vx * rnd(.05, .2), rnd(-100, 200), rnd(3, 6), 2, BRGB, { g: 1500, land: 'blood' });     // and a trail of it behind
    if (!s.wall && Math.abs(o.x) >= 964 && o.vx * Math.sign(o.x) < 0) { s.wall = true; wallHit(o.x, o.y + 160 * hs, Math.sign(o.x)); o.vy = Math.max(o.vy, 520); }     // it has just come back off the wall
  } else if (!s.down) {
    s.down = true; o.pose[6] = settle(s.rot, POSE.down[6]);
    if (!s.hops && Math.abs(o.vx) > 300 && !o.ko) { s.hops = 1; Object.assign(o, { ground: false, state: 'air', y: 1, vy: 420, vx: o.vx * .6, bounced: true }); E.addDust(o.x); sfx.land(); shake(10); pool(o.x, 110, 8); }   // it bounces
    else s.skid = .45;
  }
  if (s.skid > 0) {                                 // and goes along the floor on its back
    s.skid -= dt;
    if (Math.abs(o.vx) > 120 && Math.random() < dt * 40) V.puff('white', o.x, 20, -o.vx * .2, rnd(40, 160), rnd(26, 44), .4);
    if ((s.smear -= dt) <= 0 && Math.abs(o.vx) > 60) { s.smear = .05; pool(o.x, rnd(45, 70), 8); }      // leaving a smear of itself behind
    if (s.skid <= 0) fly = null;
  }
}

/* ================= 1: Catastrophe ================= */
const N = 20, EVERY = .068, WIND = .2;              // how many times the spear goes in, how far apart, and the wind-up before the first
// the lines a page draws round whatever everybody is looking at, for as long as the stabbing goes on
function lines(p, m) {
  const seed = Array.from({ length: 46 }, () => [rnd(0, TAU), rnd(0, 1), rnd(.6, 1.6)]);
  V.custom(WIND + N * EVERY + .15, u => {
    const o = E.P2, c = F(o.x, o.y + 170 * (o.scale || 1)), k = c[2], a = Math.min(1, u * 8) * Math.min(1, (1 - u) * 6) * (p.move === m ? 1 : 0);
    if (a <= 0) return;
    for (let i = 0; i < seed.length; i++) {
      if (Math.random() < .25) continue;            // they flicker
      const [an, d, w] = seed[i], r0 = (150 + 130 * d) * k, r1 = 1150 * k, cs = Math.cos(an), sn = Math.sin(an), hw = w * 5 * k;
      g.fillStyle = i % 3 ? `rgba(8,6,12,${.55 * a})` : `rgba(255,248,230,${.4 * a})`;
      g.beginPath(); g.moveTo(c[0] + cs * r0, c[1] + sn * r0); g.lineTo(c[0] + cs * r1 - sn * hw, c[1] + sn * r1 + cs * hw); g.lineTo(c[0] + cs * r1 + sn * hw, c[1] + sn * r1 - cs * hw); g.closePath(); g.fill();
    }
  });
}
// a spear that is not there, thrust and gone: enough of them at once and there is no telling which is the real one
function phantom(p, dy, big) {
  const f = p.face, x0 = p.x + f * 60, y = p.y + 182 + dy, len = rnd(300, 360), tilt = rnd(-.12, .12);
  V.custom(big ? .24 : .15, u => {
    const e = u < .35 ? ease(u / .35) : 1, a0 = F(x0 + f * 20, y), a1 = F(x0 + f * len * e, y + tilt * len * e), k = a0[2], ang = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]);
    g.save(); g.globalAlpha = .85 * (1 - u) ** 1.4; g.lineCap = 'round';
    lit(() => { g.strokeStyle = `rgba(${RGB},.5)`; g.lineWidth = (big ? 24 : 16) * k; g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.stroke(); });
    g.strokeStyle = '#fff6dc'; g.lineWidth = 4 * k; g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.stroke();
    g.translate(a1[0], a1[1]); g.rotate(ang); g.fillStyle = NIB; g.strokeStyle = LINE; g.lineWidth = 2;
    g.beginPath(); g.moveTo(12 * k, 0); g.lineTo(-38 * k, -10 * k); g.lineTo(-38 * k, 10 * k); g.closePath(); g.fill(); g.stroke();
    g.restore();
  });
}
function stab(p, m, n) {
  const o = E.P2, f = p.face, last = n === N, hs = o.scale || 1, dy = rnd(-60, 80);
  m.pz = [rnd(.26, .4), 0, rnd(1.32, 1.95), rnd(.9, 1.5), .6, -.5, 0]; p.pose[0] -= .22;       // the arm back an inch, and out again
  phantom(p, dy, last);
  if (n & 1) sfx.whoosh();
  const h = { reach: 258, dmg: exact(o, STAB), kb: last ? 140 : 36, stun: last ? 1.15 : .5, stop: last ? .12 : .016, col: GOLD, fixed: 1, mute: 1 };
  if (last) h.heavy = 1;
  if (!E.tryHit(p, h)) return;
  const x = o.x - f * 16, y = o.y + (168 + dy * .5) * hs;
  sfx.spear(last ? 3 : n % 3, last ? 1 : .55);
  stain = Math.min(1, stain + .05);
  splash(x, y, f, last ? 8 : 2, last ? 1 : .55); V.sparks(x, y, 'gold', last ? 10 : 2); blood(x, y, f, last ? 6 : 2);
  if (n % 5 === 0 && !last) pop(x + rnd(-70, 70), y + rnd(110, 190), pick(['ザク', 'ズッ', 'ドス', 'ザシュ']), 40);
  if (!last) return;
  shake(24); E.zoomIn(.3); V.impact(.08, o.x, y); V.ring(x, y, 300, '#ffffff', .3);
  if (Z) { Z.flash(gore() ? BRGB : RGB, .14, .16); Z.flare(x, y, RGB, 460, .2); }
  gush(x, y, f, 20, 1.1); pool(o.x, 160); lens(2);
  pop(x, y + 170, 'ドドドドッ', 60);
}

/* ================= 2: Broil ================= */
const OVER = [-.12, -.25, 3, 2.6, .45, -.4, 0];     // the spear straight up, and whatever is on it with it
const lift = e => PZ.vaLunge.map((v, i) => lerp(v, OVER[i], e));
function skewer(p, o, m) {                          // in
  const f = p.face, hs = o.scale || 1, x = o.x - f * 10, y = o.y + 168 * hs;
  sfx.spear(1); sfx.splat(); shake(20); E.zoomIn(.4); E.stop(.06);
  p.inv = Math.max(p.inv, 1.3);                     // nothing gets a word in while something is on the end of his spear
  stain = 1;
  V.ring(x, y, 220, '#ffffff', .2); V.sparks(x, y, 'gold', 8);
  if (gore()) { gush(x + f * 30, y, f, 34, 1.3); C.ink(x + f * 30, y, f, 30, 1.25, BLOOD); lens(1); }      // and out the other side
  else C.ink(x + f * 30, y, f, 8, .9, INK);
  pop(x + f * 50, y + 150, 'ズブッ', 58);
  if (m.after) pop(x - f * 40, y + 250, '+' + AFTER, 50, '#ffd23d');
}
function hold(p, o, u) {                            // what is on the spear goes where the spear goes
  if (o.ko || duel()) return;
  const q = grip(p).at(SKEWER), hs = o.scale || 1;
  Object.assign(o, { x: clamp(q[0], -965, 965), y: Math.max(0, q[1] - 165 * hs), vx: 0, vy: 0, ground: true, state: 'hurt', stun: .6, act: null, tele: 0, face: -p.face });
  if (!Z || !gore()) return;
  for (let i = 0; i < 2; i++) Z.emit(4, q[0] + rnd(-8, 8), q[1] - rnd(0, 20), rnd(-120, 120), rnd(-60, 160), rnd(3, 6), 2, BRGB, { g: 1500, land: 'blood' });      // it runs down the shaft, and off it
  if (Math.floor(u / .12) !== Math.floor((u - 1 / 60) / .12)) gush(q[0], q[1], Math.random() < .5 ? 1 : -1, 6, .7);      // and in spurts, with its heart
}
function smash(p, o) {                              // and down into the floor
  const f = p.face, x = clamp(p.x + f * 205, -940, 940), red = gore(), rgb = red ? BRGB : RGB;
  sfx.spear(3); sfx.blast(); shake(44); E.zoomIn(.5); E.slow(.28);
  V.crack(x, 420); V.rocks(x, 0, 18); V.ring(x, 60, 420, red ? BLOOD : GOLD, .45); E.addBlast(x, 90, rgb, 420); E.addDust(x - 120); E.addDust(x + 120);
  if (Z) { Z.shock(x, 620, rgb, .55, 14); Z.flash(rgb, .18, .2); Z.decal(red ? 'blood' : 'crater', x, red ? 300 : 170, red ? '128,8,26' : rgb, red ? 12 : 6); }
  if (red) {                                        // all of it, everywhere: up, out, on the floor and on the screen
    C.ink(x, 120, 1, 26, 1.5, BLOOD); C.ink(x, 120, -1, 26, 1.5, BLOOD); blood(x, 80, 1, 18); blood(x, 80, -1, 18);
    for (let i = 0; i < 16; i++) Z.emit(4, x + rnd(-60, 60), 140, rnd(-260, 260), rnd(900, 1500), rnd(3, 7), 2.4, BRGB, { g: 1700, land: 'blood' });      // thrown up, and coming down again
    pool(x - 150, 120); pool(x + 150, 120); lens(4, true);
  }
  pop(x, 260, 'グシャッ', 84);
  if (o.ko) return;
  if (!duel()) { o.x = x; o.y = 0; }
  E.applyHit(o, f, { dmg: exact(o, BROIL[1]), kb: 120, stun: .9, stop: .3, heavy: 1, col: hitCol(), fixed: 1, mute: 1, bleed: 1 });
  if (!o.ko) wound(o);                              // and it is left bleeding (from here on: Broil's own two are what they say)
  if (!o.poise && !o.ko && !duel()) Object.assign(o, { ground: false, state: 'air', y: 30, vy: -1500, vx: f * 140, bounced: false });      // into the floor, and up off it once
  V.impact(.24, x, 120);
}

/* ---------- bleeding out (Broil, 0.10v1) ---------- */
// What Broil went through carries a stack of it: every move it makes after that costs it BLEED_HP, and everything lands on it BLEED_MORE
// harder. Stacks add up (two of them: 40 a move, two fifths harder), and each lasts BLEED_T. In a 1v1 the one who is bleeding is the other
// player, in his own game: it goes with the hit (pvp.js, `bl`) and his game keeps it (H.bled, below)
const BLEED_HP = 20, BLEED_MORE = .2, BLEED_T = 30;
let bleed = [], paidAct = null;                     // when each stack on the foe runs out; the last move of its that has been paid for
let mine = [], paidMove = null;                     // the same, on me, when it is me who has been run through (a 1v1)
const stacks = list => { let n = 0; for (const t of list) if (t > E.T) n++; return n; };
function wound(o) {
  bleed = bleed.filter(t => t > E.T); bleed.push(E.T + BLEED_T);
  E.fx.push({ k: 2, x: o.x, y: o.y + 420 * (o.scale || 1), n: 'BLEEDING ×' + bleed.length, col: '#ff3b55', t: 0, life: 1.4 });
}
function bleedOut(o, n) {                           // a move made while it bleeds: it costs
  const dmg = BLEED_HP * n, hs = o.scale || 1, x = o.x, y = o.y + 170 * hs;
  sfx.splat(); gush(x, y, o.face || 1, 8 + 4 * n, .8); pool(x, 70 + 20 * n, 8);
  if (o.hp - dmg > 0) { o.hp -= dmg; o.flash = .06; E.addNum(x, o.y + 270 * hs, dmg, '#ff3b55'); return; }
  const h = { dmg: 1, kb: 60, stun: .4, stop: .06, col: BLOOD, fixed: 1, mute: 1 };      // that was the last of it: through the engine, so that it is a win like any other
  h.dmg = o.hp / ((o.dr || 1) * (H.power ? H.power(h, o) : 1)) + 1e-6;
  E.applyHit(o, -(o.face || 1), h);
}
H.bled = n => {                                     // (pvp.js) the other player's Broil has gone through me
  mine = mine.filter(t => t > E.T);
  for (let i = 0; i < n; i++) mine.push(E.T + BLEED_T);
  const p = E.P1;
  E.fx.push({ k: 2, x: p.x, y: p.y + 420, n: 'BLEEDING ×' + mine.length, col: '#ff3b55', t: 0, life: 1.4 });
};
function bleeding(dt) {
  const o = E.P2, p = E.P1, n = duel() ? 0 : stacks(bleed);
  if (n && !o.ko) {
    if (o.state === 'act' && o.act && o.act !== paidAct) { paidAct = o.act; bleedOut(o, n); }
    if (Z && gore() && Math.random() < dt * (4 + 4 * n)) { const hs = o.scale || 1; Z.emit(4, o.x + rnd(-28, 28) * hs, o.y + rnd(100, 230) * hs, rnd(-60, 60), rnd(-40, 90), rnd(2.5, 5), 2, BRGB, { g: 1500, land: 'blood' }); }
  }
  const k = stacks(mine);
  if (!k || p.dead) return;
  const m = p.move;
  if (m && m !== paidMove && (m.key || (m.def.m1 && m.i === 0))) {      // a move of mine, or the first strike of a chain
    paidMove = m;
    const sc = duel() ? p.max / JU.pvp.HP : 1;      // (a duel's twenty is twenty of its six hundred)
    Fi.chip(BLEED_HP * k * sc, '#ff3b55', BLEED_HP * k); sfx.splat(); gush(p.x, p.y + 170, -p.face, 6 + 3 * k, .7);
  }
  if (Z && gore() && Math.random() < dt * (4 + 4 * k)) Z.emit(4, p.x + rnd(-28, 28), p.y + rnd(100, 230), rnd(-60, 60), rnd(-40, 90), rnd(2.5, 5), 2, BRGB, { g: 1500, land: 'blood' });
}
function drawBleed(f, list) {                       // over its head: a drop, how many, and how long the newest has left
  const n = stacks(list);
  if (!n || f.ko) return;
  const hs = f.scale || 1, c = F(f.x, f.y + 330 * hs), k = c[2], left = Math.max(...list) - E.T, x = c[0] - 26 * k, y = c[1];
  g.save(); g.lineJoin = 'round';
  g.fillStyle = '#c4122e'; g.strokeStyle = LINE; g.lineWidth = 2.5 * k;
  g.beginPath(); g.moveTo(x, y - 15 * k); g.quadraticCurveTo(x + 11 * k, y - 1 * k, x + 8 * k, y + 5 * k); g.arc(x, y + 4 * k, 8 * k, 0, Math.PI); g.quadraticCurveTo(x - 11 * k, y - 1 * k, x, y - 15 * k); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(255,59,85,.9)'; g.lineWidth = 3 * k; g.beginPath(); g.arc(x, y, 15 * k, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, left / BLEED_T)); g.stroke();
  g.font = `${Math.round(20 * k)}px Anton, Impact, sans-serif`; g.textAlign = 'left'; g.textBaseline = 'middle';
  g.lineWidth = 4 * k; g.strokeStyle = '#07060c'; g.strokeText('×' + n, x + 17 * k, y); g.fillStyle = '#ff8a98'; g.fillText('×' + n, x + 17 * k, y);
  g.restore();
}

/* ================= 3: Echart ================= */
const WINDOW = .8;                                  // how long the spear is held across him
let afterAt = -9;                                   // when he last paid something back (Broil straight after is AFTER harder)
function caught(p, m, face, a) {                    // (H.guard) something has hit the spear: it is stopped there, and it is going to be paid for
  if (!m || m.def !== MOVES.div || m.got !== undefined || m.t >= WINDOW || a.pierce || a.dmg >= 9000) return false;
  m.got = m.t;
  const x = p.x + p.face * 60, y = p.y + 210;
  sfx.block(); sfx.cut(1.2); E.stop(.12); shake(12);
  V.ring(x, y, 200, '#ffffff', .25); V.sparks(x, y, 'white', 12); E.addSpark(x, y, '#ffffff', 120);
  if (Z) Z.flare(x, y, '255,255,255', 340, .16);
  pop(x, y + 150, 'ギィン', 50);
  p.inv = Math.max(p.inv, 1);
  return true;
}
function payBack(p, m) {                            // a step, and he is in front of whoever it was with the spear through them
  const o = E.P2, hs = o.scale || 1;
  if (o.ko || o.state === 'down' || o.state === 'up' || o.alpha < 1) return;
  afterimage(p, .5);
  if (!duel() || Math.abs(o.x - p.x) > 260) {
    const side = p.x <= o.x ? -1 : 1;
    p.x = clamp(o.x + side * 150 * hs, -965, 965);
  }
  p.face = o.x >= p.x ? 1 : -1; p.pose = PZ.vaLunge.slice();
  const f = p.face, x = o.x - f * 16, y = o.y + 168 * hs;
  E.applyHit(o, f, { dmg: exact(o, COUNTER), kb: 140, stun: 1.3, stop: .22, heavy: 1, col: hitCol(), fixed: 1, mute: 1 });      // (it is left standing, and stunned: Broil is next)
  sfx.spear(3); shake(30); E.zoomIn(.4); V.impact(.1, o.x, y); V.ring(x, y, 300, '#ffffff', .3);
  jab(p, true, PZ.vaLunge);
  if (Z) { Z.flash(gore() ? BRGB : RGB, .14, .16); Z.flare(x, y, RGB, 420, .2); }
  stain = 1; gush(x, y, f, 22, 1.1); lens(2); splash(x, y, f, 8, 1);
  pop(x, y + 170, 'ズバァッ', 70);
  afterAt = E.T;
  E.fx.push({ k: 2, x: p.x, y: p.y + 440, n: '2  ·  BROIL +' + AFTER, col: GOLD, t: 0, life: AFTER_T });
}

/* ================= his guard (F, 0.10v1): he is not there when it lands ================= */
// In place of the ordinary block (block.js keeps the key, the walk and the rules for what it cannot stop): whatever comes at him from the
// front he steps back out of, and a black afterimage takes it. Nothing heavy breaks it. A blow that lands while he is still on his way out
// of the last one goes through the afterimage too; only one timed to land as he settles from it, OPEN after it, catches him. That one is the
// end of his guard for a while (JU.block.brk), and it lands in full
const OPEN = [.3, .42];
let dodgeAt = -9;
const shades = [];                                  // black afterimages: { f: a copy of him as he was, t, life }
function afterimage(f, life = .55) {
  shades.push({ f: { skin: f.skin, x: f.x, y: f.y, z: f.z, face: f.face, spin: 1, scale: f.scale, pose: f.pose.slice(), alpha: 1 }, t: 0, life });
  if (shades.length > 8) shades.shift();
  if (Z) for (let i = 0; i < 6; i++) Z.emit(2, f.x + rnd(-40, 40), f.y + rnd(40, 260), rnd(-40, 40), rnd(20, 90), rnd(50, 90), rnd(.4, .7), '24,16,34', { a: .7 });
}
const guardUp = () => !!(JU.block && JU.block.state.up);
function dodge(p, face) {
  const since = E.T - dodgeAt;
  if (since < OPEN[0]) return true;                 // still slipping out of the last one: this goes through where he was
  if (since < OPEN[1]) {                            // on the beat, as he settles: caught
    dodgeAt = -9; JU.block.brk();
    const x = p.x - face * 40, y = p.y + 205;
    sfx.guardBreak(); E.stop(.1); shake(16);
    V.ring(x, y, 230, '#ff5a6e', .3); V.sparks(x, y, 'red', 12);
    E.fx.push({ k: 2, x: p.x, y: p.y + 360, n: 'CAUGHT', col: '#ff5a6e', t: 0, life: 1 });
    return false;                                   // and the blow lands, all of it
  }
  dodgeAt = E.T;
  afterimage(p);
  p.x = clamp(p.x + face * 95, -965, 965);          // a step back, out of it
  sfx.whoosh(); sfx.swish(.8);
  E.fx.push({ k: 2, x: p.x, y: p.y + 330, n: 'DODGE', col: '#cfc6ff', t: 0, life: .5 });
  return true;
}
function drawShades(dt) {                           // under the fighters: the afterimages, black, with a little violet round their edges
  if (!shades.length && !(on() && guardUp())) return;
  g.save(); g.filter = 'brightness(0) drop-shadow(0 0 5px rgba(140,90,255,.75))';
  for (let i = shades.length - 1; i >= 0; i--) {
    const s = shades[i];
    if ((s.t += dt) >= s.life) { shades.splice(i, 1); continue; }
    const a = .8 * (1 - s.t / s.life) ** 1.2;
    E.drawFighter(s.f, a); g.globalAlpha = a; drawSpear(s.f); g.globalAlpha = 1;
  }
  const p = E.P1;
  if (on() && guardUp() && !p.dead) for (const d of [-1, 1]) {      // the guard: him, not quite where he is, either side
    const f = { skin: p.skin, x: p.x - p.face * (16 + 8 * Math.sin(E.T * 9 + d)) * (d > 0 ? 1 : .5), y: p.y, z: p.z, face: p.face, spin: 1, scale: p.scale, pose: p.pose, alpha: 1 };
    E.drawFighter(f, .22); g.globalAlpha = .22; drawSpear(f); g.globalAlpha = 1;
  }
  g.filter = 'none'; g.restore();
}

const MOVES = {
  // 1 — Catastrophe
  strikes: { name: 'Catastrophe', cd: 9, dur: WIND + N * EVERY + .4, glow: 'gold', run(p, m, t) {
    const o = E.P2, f = p.face, gap = (o.x - p.x) * f;
    p.rate = 60;
    if (t < WIND) {                                 // the spear drawn back, and in he comes
      p.target = PZ.vaWind4; p.vx = gap > 210 && gap < 560 ? f * 1100 : 0;
      if (!m.c) { m.c = 1; m.n = 0; sfx.charge(); shout(p, '大惨事', GOLD); lines(p, m); }
      return;
    }
    const due = Math.min(N, Math.floor((t - WIND) / EVERY) + 1);
    while (m.n < due) stab(p, m, ++m.n);
    if (m.n < N || t < WIND + N * EVERY) { p.target = m.pz || PZ.vaThrust1; p.vx = gap > 215 ? f * 300 : 0; return; }
    p.vx = 0; p.target = t < WIND + N * EVERY + .14 ? PZ.vaLunge : POSE.idle;
  } },
  // 2 — Broil
  crush: { name: 'Broil', cd: 12, dur: 1.9, glow: 'gold', run(p, m, t) {
    const o = E.P2, f = p.face, gap = (o.x - p.x) * f;
    p.rate = 46;
    if (m.got === undefined) {
      if (t < .22) {                                // drawn back, and closing in
        p.target = PZ.vaWind4; p.vx = gap > 215 && gap < 480 ? f * 1100 : 0;
        if (!m.c) { m.c = 1; m.after = E.T - afterAt < AFTER_T; afterAt = -9; sfx.charge(); shout(p, '炙り', GOLD); }      // (straight after Echart's payback: harder)
        return;
      }
      p.target = PZ.vaLunge; p.vx = t < .28 ? f * 520 : 0;
      if (!m.sw) { m.sw = 1; sfx.cut(1.6); jab(p, true, PZ.vaLunge); }
      if (t < .32 && !o.ko && E.tryHit(p, { reach: 262, dmg: exact(o, BROIL[0] + (m.after ? AFTER : 0)), kb: 0, stun: 1.6, stop: .16, heavy: 1, col: hitCol(), fixed: 1, mute: 1 })) {
        m.got = t; skewer(p, o, m);
        return;
      }
      if (t > .66) { p.target = POSE.idle; if (t > .84) E.endMove(p); }       // nothing on the end of it
      return;
    }
    const u = t - m.got;
    p.vx = 0;
    if (o.ko && !m.slam) { p.target = POSE.idle; if (u > .35) E.endMove(p); return; }      // the stab was enough
    if (u < .16) { p.target = PZ.vaLunge; hold(p, o, u); return; }                                       // held there
    if (u < .6) { p.target = lift(ease((u - .16) / .44)); p.rate = 30; hold(p, o, u); return; }          // up it goes
    if (u < .67) { p.target = PZ.vaDrive; p.rate = 80; hold(p, o, u); return; }                          // over, and down
    p.target = u < 1.05 ? PZ.vaDrive : POSE.idle;
    if (!m.slam) { m.slam = 1; smash(p, o); }
    if (u > 1.2) E.endMove(p);
  } },
  // 3 — Echart: the spear across him, and whatever lands on it in WINDOW is paid back (caught, payBack)
  div: { name: 'Echart', cd: 10, dur: 2, glow: 'gold', run(p, m, t) {
    const o = E.P2;
    p.vx = 0; p.rate = 44;
    if (m.got !== undefined) {                      // caught something
      const u = t - m.got;
      if (u < .12) { p.target = PZ.vaParry; return; }
      if (!m.paid) { m.paid = 1; payBack(p, m); }
      p.target = u < .4 ? PZ.vaLunge : POSE.idle;
      if (u > .55) E.endMove(p);
      return;
    }
    if (!m.c) { m.c = 1; sfx.charge(); shout(p, 'ECHART', GOLD); }
    if (t < WINDOW) { p.target = PZ.vaParry; if (!o.ko) p.face = o.x >= p.x ? 1 : -1; return; }
    p.target = POSE.idle;                           // nothing came: the stance drops
    if (t > WINDOW + .25) E.endMove(p);
  } },
  manji: { name: 'Coming soon', cd: 1, dur: .01, run() {} }
};
// Echart, while it waits: a ring round him for the time it has left
function drawEchart(p, m) {
  const c = F(p.x, p.y + 180), k = c[2], left = 1 - m.t / WINDOW;
  g.save(); g.lineCap = 'round';
  g.strokeStyle = 'rgba(8,6,14,.7)'; g.lineWidth = 7 * k; g.beginPath(); g.arc(c[0], c[1], 150 * k, 0, TAU); g.stroke();
  lit(() => { g.strokeStyle = `rgba(${RGB},.9)`; g.lineWidth = 4 * k; g.beginPath(); g.arc(c[0], c[1], 150 * k, -Math.PI / 2, -Math.PI / 2 + TAU * left); g.stroke(); });
  g.restore();
}

JU.tech.add('vengeful', { name: 'Vengeful Artist', jp: '復讐の画家', mark: '筆', who: 'G Warstaff', odds: 2.5, col: GOLD, glow: 'gold', moves: MOVES,
  limited: ENDS, gore: true, skin: ARTIST, as: ['Vengeful Artist', '画家'], m1,
  hint: '<b>F</b> dodges · <b>3</b> then <b>2</b>: Broil +20 · 4th strike: <b>hold jump</b> uppercut, <b>in the air</b> downslam' });
const DEF = JU.tech.TECH.vengeful, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
let primed = false;
function prime() { if (!primed) { primed = true; sfx.preload(SOUNDS); } }     // his four sounds, if this copy has them
const hit0 = H.hit, moveFx0 = H.moveFx, tick0 = H.tick, fx0 = H.fx, under0 = H.under, post0 = H.post, reset0 = H.reset, start0 = H.fightStart;
const guard0 = H.guard, pre0 = H.playerPre, rim0 = H.rim, pow0 = H.power, fpow0 = H.foePower;
H.hit = (o, face, h) => { hit0(o, face, h); if (h.flung && o === E.P2 && !o.poise && !o.ko && !duel()) launch(o); };
H.moveFx = (p, m) => {
  if (moveFx0) moveFx0(p, m);
  if (p !== E.P1 || !m.def.va) return;
  if (m.sw && !m.fx) { m.fx = 1; if (m.def.pose && m.i !== 2) jab(p, m.i === 3, PZ[m.def.pose]); }      // (the third is a cut, and the engine's swing is drawn for it)
  if (m.done && !m.snd) { m.snd = 1; landed(p, m); }
};
// a blow arriving: Echart catches it; failing that his guard is a dodge; failing that, whatever anybody else's guard would do
H.guard = (face, a, mul = 1) => {
  const p = E.P1;
  if (on() && !p.dead) {
    if (caught(p, p.move, face, a)) return true;
    if (guardUp() && p.face === -face && !a.pierce && !(a.dmg >= 9000)) return dodge(p, face);
  }
  return guard0 ? guard0(face, a, mul) : false;
};
const press0 = H.press;
H.press = (a, inScene) => {                        // straight out of Echart's payback into Broil: it does not wait for the stance to drop
  const p = E.P1, m = p.move;
  if (!inScene && a === 'crush' && on() && m && m.def === MOVES.div && m.paid && E.cd.crush <= 0) {
    E.endMove(p); E.cd.crush = E.CD.crush; p.move = { def: MOVES.crush, key: 'crush', t: 0 }; E.hud.mv.crush.classList.add('act');
    return true;
  }
  return press0 ? press0(a, inScene) : false;
};
H.playerPre = (p, o, dt) => { const r = pre0 ? pre0(p, o, dt) : false; if (r && on() && guardUp() && !p.ps) p.target = PZ.vaGuard; return r; };      // (block.js holds him behind it; this is how he stands there)
H.ownGuard = p => on();                             // (block.js does not draw its arcs for him)
H.rim = f => {                                      // the moment he settles from a dodge, when a blow would catch him, he is lit white
  const since = E.T - dodgeAt;
  if (f === E.P1 && on() && since > OPEN[0] - .05 && since < OPEN[1]) return { col: '#ffffff', blur: 14 };
  return rim0 ? rim0(f) : null;
};
H.power = (h, o) => (pow0 ? pow0(h, o) : 1) * (o === E.P2 && !duel() ? 1 + BLEED_MORE * stacks(bleed) : 1);      // bleeding: everything lands harder
H.foePower = a => (fpow0 ? fpow0(a) : 1) * (1 + BLEED_MORE * stacks(mine));      // (and on me, when it is me who is bleeding)
H.tick = dt => {
  tick0(dt);
  if (stain > 0) {
    stain = Math.max(0, stain - dt * .06);
    const p = E.P1;
    if (Z && gore() && stain > .3 && p.skin === ARTIST && Math.random() < dt * 8 * stain) { const q = grip(p).at(TIP - 4); Z.emit(4, q[0], q[1], rnd(-30, 30), rnd(-60, 20), rnd(2, 4), 2, BRGB, { g: 1600, land: 'blood' }); }      // dripping off the point
  }
  if (fly) flight(dt);
  bleeding(dt);
};
H.under = dt => { under0(dt); drawShades(dt); };
H.fx = dt => {
  fx0(dt);
  for (const f of [E.P2, E.P1]) if (f.skin === ARTIST && !(f.alpha < .05)) drawSpear(f);
  const p = E.P1, m = p.move;
  if (on() && m && m.def === MOVES.div && m.got === undefined && m.t < WINDOW) drawEchart(p, m);
  drawBleed(E.P2, bleed); drawBleed(E.P1, mine);
};
H.post = dt => { if (post0) post0(dt); drawLens(typeof dt === 'number' ? dt : 1 / 60); };
const clear = () => { fly = null; stain = 0; bleed = []; mine = []; paidAct = paidMove = null; dodgeAt = afterAt = -9; shades.length = splats.length = 0; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); clear(); if (on()) prime(); };

JU.vengeful = { ARTIST, ENDS, MOVES, SPEAR, UP, DOWN, N, OPEN, WINDOW, BLEED: [BLEED_HP, BLEED_MORE, BLEED_T], M1_DMG, STAB, BROIL, COUNTER, AFTER,
  get stain() { return stain; }, get fly() { return fly && { x: Math.round(fly.o.x), wall: fly.wall, hops: fly.hops, down: fly.down }; },
  get bleed() { return stacks(bleed); }, get mine() { return stacks(mine); }, get splats() { return splats.length; }, get dodgeAt() { return dodgeAt; } };
})();
