/* JUJUTSU UNLIMITEDS — limited time, in Blood Brother's place (Build 0.10): VENGEFUL ARTIST. The manga artist of the Culling Game, who came
   into it with a grudge and a G Warstaff: a spear with a pen nib the size of a sword's blade on the end of it.
   His strikes are the spear's, and they reach further than a fist. Each of the four has a sound of its own: sounds/vengeful-hit1..4.mp3, cut
   from a clip the user supplied. That clip is of another game, so those four stay in this copy (.gitignore; build.py leaves them out): on
   the public site the game makes four of its own (index.html, sfx.spear). The fourth strike is one of three:
     on the floor, a thrust that sends whatever it hits end over end the length of the arena, into the wall, off it, off the floor and along it;
     with jump held through the chain (W, Space or ↑), an uppercut;
     in the air, a downslam.
   1 Catastrophe: the spear into the target twenty times, 2.5 each, and every one of them keeps it stunned.
   2 Broil: a stab for 30; up it goes on the end of the spear, and down into the floor for 40.
   3 and 4 are still to come.
   There is a great deal of blood. He is not chosen without a warning first (shop.js, gory), and BLOOD OFF (beside SFX) takes it away: a wound
   then gives nothing, and what comes off the nib is ink */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, M = E.MOVES, C = JU.cut, Z = JU.bossfx;
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const exact = (o, n) => n / (o.dr || 1);            // a hit worth the stated amount, whatever the target is made of
const jumping = () => E.keys.has('w') || E.keys.has(' ') || E.keys.has('arrowup');      // jump is held (the touch stick pushed up counts)
const duel = () => !!(JU.pvp && JU.pvp.busy);       // a 1v1: the other fighter is somebody else's game, and goes where that game puts it
const pick = a => a[Math.random() * a.length | 0];

const ENDS = Date.parse('2026-10-29T11:00:00Z');   // seven days from the day he arrived (22 Oct 2026). Move this date to run the event again
const GOLD = '#f2c14e', RGB = '242,193,78', NIB = '#e6e9ef', SHAFT = '#1d1823', INK = '#16121b', BLOOD = '#b3122c', BRGB = '179,18,44';
const gore = () => JU.gore !== false;              // the BLOOD switch beside SFX
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
  if (stain > .02) { g.globalAlpha = Math.min(1, stain); shape([[BASE + 38, -12], [TIP - 16, -5], [TIP, 0], [TIP - 16, 5], [BASE + 38, 12]], wet(), false); g.globalAlpha = 1; }   // what it has been through
  const h = pt(BASE + 44), e = pt(TIP), q0 = pt(BASE + 6, -8), q1 = pt(TIP - 20, -3);
  g.strokeStyle = LINE; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(h[0], h[1]); g.lineTo(e[0], e[1]); g.stroke();             // the slit
  g.fillStyle = LINE; g.beginPath(); g.arc(h[0], h[1], 4.5 * k, 0, TAU); g.fill();                                            // and the hole it runs to
  g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(q0[0], q0[1]); g.lineTo(q1[0], q1[1]); g.stroke();     // light along one edge
  g.lineCap = 'butt';
}

/* ================= what comes off it ================= */
// a sound effect lettered in, the way it would be on his pages: thick, tilted, outlined, punched in and gone
function pop(x, y, text, size = 52) {
  const tilt = rnd(-.22, .22);
  V.custom(.62, u => {
    const c = F(x, y), s = size * c[2] * (u < .12 ? lerp(1.6, 1, u / .12) : 1 + .08 * u);
    g.save(); g.translate(c[0], c[1]); g.rotate(tilt); g.globalAlpha = u < .7 ? 1 : Math.max(0, 1 - (u - .7) / .3);
    g.font = `${Math.round(s)}px 'Yuji Syuku','Yu Mincho',serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = s * .26; g.strokeStyle = LINE; g.strokeText(text, 0, 0);
    g.lineWidth = s * .1; g.strokeStyle = GOLD; g.strokeText(text, 0, 0);
    g.fillStyle = '#ffffff'; g.fillText(text, 0, 0);
    g.restore();
  });
}
const splash = (x, y, dir, n, pow) => C.ink(x, y, dir, gore() ? n : Math.ceil(n / 2), pow, wet());      // flecks, thrown the way the spear went
function blood(x, y, dir, n) {                      // drops that land, and stay on the floor a while
  if (!Z || !gore()) return;
  for (let i = 0; i < n; i++) Z.emit(4, x, y, dir * rnd(120, 640) + rnd(-160, 160), rnd(80, 620), rnd(3, 7), 2, BRGB, { g: 1600, land: 'blood' });
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

/* ================= his strikes ================= */
// [lean, head, armF, armB, legF, legB, rot]. The spear points the way his front arm does
const PZ = {
  vaWind1: [0, 0, 1, .5, .3, -.35, 0],          vaThrust1: [.32, 0, 1.62, 1.25, .62, -.5, 0],
  vaWind2: [.06, 0, 1.3, .3, .3, -.3, 0],       vaThrust2: [.36, .05, 1.8, 1, .58, -.52, 0],
  vaWind3: [-.14, -.1, 3.05, 1.6, .3, -.3, 0],  vaChop: [.5, .15, 1.15, .6, .72, -.55, 0],
  vaWind4: [-.3, 0, .9, .3, .15, -.45, 0],      vaLunge: [.62, 0, 1.58, 1.45, 1.05, -.78, 0],
  vaLow: [.16, 0, .4, .2, .45, -.4, 0],         vaRise: [-.06, -.22, 2.85, 1.9, .5, -.3, 0],
  vaDrive: [.5, .2, .75, .45, .7, -.5, 0]
};
Object.assign(POSE, PZ);                            // (the plain strikes find their poses by name)
// the ordinary four, with the spear: they keep the engine's timing and its chain. The fourth sends whatever it hits flying (flung)
const SPEAR = [
  { pre: 'vaWind1', pose: 'vaThrust1', lunge: 230, hit: { reach: 222, dmg: 3, kb: 170, stun: .36, stop: .045 } },
  { pre: 'vaWind2', pose: 'vaThrust2', lunge: 230, hit: { reach: 226, dmg: 3, kb: 170, stun: .36, stop: .045 } },
  { pre: 'vaWind3', pose: 'vaChop', lunge: 240, strike: .1, dur: .32, hit: { reach: 214, dmg: 4, kb: 210, stun: .4, stop: .06 } },
  { pre: 'vaWind4', pose: 'vaLunge', lunge: 560, strike: .17, dur: .62, kick: 0, hit: { reach: 245, dmg: 6, kb: 1650, lift: 700, stun: .9, stop: .16, heavy: 1, flung: 1 } }
].map((o, i) => Object.assign({}, M.m1[i], o, { va: 1, sw: 'rgba(242,193,78,.9)', hit: Object.assign({ col: GOLD, mute: 1 }, o.hit) }));
// jump held through the chain: the fourth comes up from underneath
const UP = { m1: 1, va: 1, dur: .62, run(p, m, t) {
  p.rate = 46;
  if (t < .14) { p.target = PZ.vaLow; if (p.ground) p.vx = p.face * 160; return; }
  p.target = t < .44 ? PZ.vaRise : POSE.idle; if (p.ground) p.vx = t < .2 ? p.face * 240 : 0;
  if (!m.sw) { m.sw = 1; sfx.whoosh(); V.slash(p.x + p.face * 120, p.y + 220, p.face > 0 ? 1.2 : Math.PI - 1.2, 400, GOLD, 14); }
  if (!m.done && t < .28 && E.tryHit(p, { reach: 228, dmg: 6, kb: 80, lift: 1150, stun: .9, stop: .1, heavy: 1, col: GOLD, mute: 1 })) m.done = 1;
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
  if (!m.done && E.tryHit(p, { reach: 232, dmg: 7, kb: 160, stun: .9, stop: .12, heavy: 1, col: GOLD, mute: 1 })) {
    m.done = 1;
    if (!o.poise && !o.ko && !duel()) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 26), vy: -1900, vx: p.face * 160, bounced: false });      // and into the floor ahead of him
  }
} };
function dent(p, m) {                               // where he comes down
  const x = p.x + p.face * 90;
  sfx.blast(); shake(m.done ? 26 : 14); E.zoomIn(.25);
  V.crack(x, m.done ? 300 : 180); V.rocks(x, 0, m.done ? 12 : 6); V.ring(x, 40, m.done ? 320 : 200, GOLD, .35);
  if (Z) { Z.shock(x, m.done ? 460 : 300, RGB, .45, 10); Z.dust(x, 8); }
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
  if (n < 3) { V.ring(x, y, 60 + 22 * n, GOLD, .14); if (n === 2) pop(x + f * 40, y + 120, 'ザシュ', 44); return; }
  E.zoomIn(.3); shake(24); V.impact(.08, o.x, y); V.ring(x, y, 280, '#ffffff', .25);
  if (Z) { Z.flash(RGB, .12, .14); Z.flare(x, y, RGB, 380, .18); }
  blood(x, y, f, 10);
  pop(x + f * 30, y + 140, m.def === UP ? 'ガッ' : m.def === DOWN ? 'ズドッ' : 'ドォン', 66);
}

/* ================= the fourth strike's thrust: end over end, into the wall and off it, off the floor and along it ================= */
let fly = null;
const settle = (r, to) => r - TAU * Math.round((r - to) / TAU);      // the same turn, wound round to whichever is nearest to where it is going
function launch(o) { fly = { o, t: 0, rot: o.pose[6], wall: false, hops: 0, down: false, skid: 0 }; E.slow(.12); }
function wallHit(x, y, side) {
  sfx.blast(); shake(26); E.stop(.06);
  V.rocks(x, Math.max(0, y - 100), 8); V.sparks(x, y, 'white', 10);
  if (Z) { Z.flare(x, y, '255,255,255', 300, .16); Z.dust(x, 6, -side, Math.max(0, y - 140)); }
  const seed = Array.from({ length: 9 }, () => [rnd(0, TAU), rnd(.5, 1)]);
  V.custom(1.1, u => {                              // the crack it leaves where it hit
    const c = F(x, y), k = c[2];
    g.save(); g.strokeStyle = `rgba(255,255,255,${.85 * (u < .7 ? 1 : (1 - u) / .3)})`; g.lineWidth = 3 * k; g.lineCap = 'round'; g.lineJoin = 'round';
    for (const [an, l] of seed) {
      g.beginPath(); g.moveTo(c[0], c[1]);
      for (let j = 1; j <= 3; j++) { const r = 70 * l * j * k, q = an + Math.sin(j * 7 + an * 3) * .25; g.lineTo(c[0] + Math.cos(q) * r * .45, c[1] + Math.sin(q) * r); }
      g.stroke();
    }
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
    if (!s.wall && Math.abs(o.x) >= 964 && o.vx * Math.sign(o.x) < 0) { s.wall = true; wallHit(o.x, o.y + 160 * hs, Math.sign(o.x)); o.vy = Math.max(o.vy, 520); }     // it has just come back off the wall
  } else if (!s.down) {
    s.down = true; o.pose[6] = settle(s.rot, POSE.down[6]);
    if (!s.hops && Math.abs(o.vx) > 300 && !o.ko) { s.hops = 1; Object.assign(o, { ground: false, state: 'air', y: 1, vy: 420, vx: o.vx * .6, bounced: true }); E.addDust(o.x); sfx.land(); shake(10); }   // it bounces
    else s.skid = .45;
  }
  if (s.skid > 0) {                                 // and goes along the floor on its back
    s.skid -= dt;
    if (Math.abs(o.vx) > 120 && Math.random() < dt * 40) V.puff('white', o.x, 20, -o.vx * .2, rnd(40, 160), rnd(26, 44), .4);
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
  const h = { reach: 258, dmg: exact(o, 2.5), kb: last ? 140 : 36, stun: last ? 1.15 : .5, stop: last ? .12 : .016, col: GOLD, fixed: 1, mute: 1 };
  if (last) h.heavy = 1;
  if (!E.tryHit(p, h)) return;
  const x = o.x - f * 16, y = o.y + (168 + dy * .5) * hs;
  sfx.spear(last ? 3 : n % 3, last ? 1 : .55);
  stain = Math.min(1, stain + .05);
  splash(x, y, f, last ? 8 : 2, last ? 1 : .55); V.sparks(x, y, 'gold', last ? 10 : 2);
  if (n % 5 === 0 && !last) pop(x + rnd(-70, 70), y + rnd(110, 190), pick(['ザク', 'ズッ', 'ドス', 'ザシュ']), 40);
  if (!last) return;
  shake(24); E.zoomIn(.3); V.impact(.08, o.x, y); V.ring(x, y, 300, '#ffffff', .3);
  if (Z) { Z.flash(RGB, .14, .16); Z.flare(x, y, RGB, 460, .2); }
  blood(x, y, f, 12);
  pop(x, y + 170, 'ドドドドッ', 60);
}

/* ================= 2: Broil ================= */
const OVER = [-.12, -.25, 3, 2.6, .45, -.4, 0];     // the spear straight up, and whatever is on it with it
const lift = e => PZ.vaLunge.map((v, i) => lerp(v, OVER[i], e));
function skewer(p, o) {                             // in
  const f = p.face, hs = o.scale || 1, x = o.x - f * 10, y = o.y + 168 * hs;
  sfx.spear(1); sfx.splat(); shake(20); E.zoomIn(.4); E.stop(.06);
  p.inv = Math.max(p.inv, 1.3);                     // nothing gets a word in while something is on the end of his spear
  stain = 1;
  V.ring(x, y, 220, '#ffffff', .2); V.sparks(x, y, 'gold', 8);
  if (gore()) { C.ink(x + f * 30, y, f, 22, 1.25, BLOOD); blood(x + f * 40, y, f, 16); }      // and out the other side
  else C.ink(x + f * 30, y, f, 8, .9, INK);
  pop(x + f * 50, y + 150, 'ズブッ', 58);
}
function hold(p, o) {                               // what is on the spear goes where the spear goes
  if (o.ko || duel()) return;
  const q = grip(p).at(SKEWER), hs = o.scale || 1;
  Object.assign(o, { x: clamp(q[0], -965, 965), y: Math.max(0, q[1] - 165 * hs), vx: 0, vy: 0, ground: true, state: 'hurt', stun: .6, act: null, tele: 0, face: -p.face });
  if (Z && gore() && Math.random() < .7) Z.emit(4, q[0] + rnd(-8, 8), q[1] - rnd(0, 20), rnd(-120, 120), rnd(-60, 160), rnd(3, 6), 2, BRGB, { g: 1500, land: 'blood' });      // it runs down the shaft, and off it
}
function smash(p, o) {                              // and down into the floor
  const f = p.face, x = clamp(p.x + f * 205, -940, 940), red = gore(), rgb = red ? BRGB : RGB;
  sfx.spear(3); sfx.blast(); shake(44); E.zoomIn(.5); E.slow(.28);
  V.crack(x, 420); V.rocks(x, 0, 18); V.ring(x, 60, 420, red ? BLOOD : GOLD, .45); E.addBlast(x, 90, rgb, 420); E.addDust(x - 120); E.addDust(x + 120);
  if (Z) { Z.shock(x, 620, rgb, .55, 14); Z.flash(rgb, .18, .2); Z.decal(red ? 'blood' : 'crater', x, red ? 230 : 170, rgb, red ? 9 : 6); }
  if (red) { C.ink(x, 120, 1, 18, 1.4, BLOOD); C.ink(x, 120, -1, 18, 1.4, BLOOD); blood(x, 80, 1, 12); blood(x, 80, -1, 12); }
  pop(x, 260, 'グシャッ', 84);
  if (o.ko) return;
  if (!duel()) { o.x = x; o.y = 0; }
  E.applyHit(o, f, { dmg: exact(o, 40), kb: 120, stun: .9, stop: .3, heavy: 1, col: hitCol(), fixed: 1, mute: 1 });
  if (!o.poise && !o.ko && !duel()) Object.assign(o, { ground: false, state: 'air', y: 30, vy: -1500, vx: f * 140, bounced: false });      // into the floor, and up off it once
  V.impact(.24, x, 120);
}

const SOON = { name: 'Coming soon', cd: 1, dur: .01, run() {} };
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
        if (!m.c) { m.c = 1; sfx.charge(); shout(p, '炙り', GOLD); }
        return;
      }
      p.target = PZ.vaLunge; p.vx = t < .28 ? f * 520 : 0;
      if (!m.sw) { m.sw = 1; sfx.cut(1.6); jab(p, true, PZ.vaLunge); }
      if (t < .32 && !o.ko && E.tryHit(p, { reach: 262, dmg: exact(o, 30), kb: 0, stun: 1.6, stop: .16, heavy: 1, col: hitCol(), fixed: 1, mute: 1 })) { m.got = t; skewer(p, o); return; }
      if (t > .66) { p.target = POSE.idle; if (t > .84) E.endMove(p); }       // nothing on the end of it
      return;
    }
    const u = t - m.got;
    p.vx = 0;
    if (o.ko && !m.slam) { p.target = POSE.idle; if (u > .35) E.endMove(p); return; }      // the stab was enough
    if (u < .16) { p.target = PZ.vaLunge; hold(p, o); return; }                                          // held there
    if (u < .6) { p.target = lift(ease((u - .16) / .44)); p.rate = 30; hold(p, o); return; }             // up it goes
    if (u < .67) { p.target = PZ.vaDrive; p.rate = 80; hold(p, o); return; }                             // over, and down
    p.target = u < 1.05 ? PZ.vaDrive : POSE.idle;
    if (!m.slam) { m.slam = 1; smash(p, o); }
    if (u > 1.2) E.endMove(p);
  } },
  div: SOON,
  manji: SOON
};

JU.tech.add('vengeful', { name: 'Vengeful Artist', jp: '復讐の画家', mark: '筆', who: 'G Warstaff', odds: 2.5, col: GOLD, glow: 'gold', moves: MOVES,
  limited: ENDS, gore: true, skin: ARTIST, as: ['Vengeful Artist', '画家'], m1,
  hint: '4th strike: <b>hold jump</b> for an uppercut · <b>in the air</b>, a downslam' });
const DEF = JU.tech.TECH.vengeful, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
let primed = false;
function prime() { if (!primed) { primed = true; sfx.preload(SOUNDS); } }     // his four sounds, if this copy has them
const hit0 = H.hit, moveFx0 = H.moveFx, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
H.hit = (o, face, h) => { hit0(o, face, h); if (h.flung && o === E.P2 && !o.poise && !o.ko && !duel()) launch(o); };
H.moveFx = (p, m) => {
  if (moveFx0) moveFx0(p, m);
  if (p !== E.P1 || !m.def.va) return;
  if (m.sw && !m.fx) { m.fx = 1; if (m.def.pose && m.i !== 2) jab(p, m.i === 3, PZ[m.def.pose]); }      // (the third is a cut, and the engine's swing is drawn for it)
  if (m.done && !m.snd) { m.snd = 1; landed(p, m); }
};
H.tick = dt => {
  tick0(dt);
  if (stain > 0) stain = Math.max(0, stain - dt * .06);
  if (fly) flight(dt);
};
H.fx = dt => {
  fx0(dt);
  for (const f of [E.P2, E.P1]) if (f.skin === ARTIST && !(f.alpha < .05)) drawSpear(f);
};
H.reset = () => { reset0(); fly = null; stain = 0; };
H.fightStart = (cfg, wave) => { start0(cfg, wave); fly = null; stain = 0; if (on()) prime(); };

JU.vengeful = { ARTIST, ENDS, MOVES, SPEAR, UP, DOWN, N, get stain() { return stain; }, get fly() { return fly && { x: Math.round(fly.o.x), wall: fly.wall, hops: fly.hops, down: fly.down }; } };
})();
