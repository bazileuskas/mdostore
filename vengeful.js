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
   4 Stronde (0.10v2): a manga panel, thrown, that sticks to the chest of whatever it hits. 4 again while it is there: a picture of it is
     left where it stood (the before-image), and it is made to dash: the way he is moving, or either way if he is standing still.
   G Final Chapter (0.10v2, the awakening): a counter. It can only be started with a panel on them, and whatever hits him in it turns the
     page: the whole scene from the user's clip (sounds/vengeful-ult.mp3 is its sound, this copy only again; without it the game makes its
     own). 300 against a player or a boss; anything else does not get up.
   His guard (F) is not a block (0.10v1): he steps out of whatever comes, and a black afterimage takes it. Only a blow timed to land just as
   he settles from the last one catches him.
   MR. INSTINCTO (0.10v2): the team's own, and nobody else's (admin). The same moveset, and every move of it kills: forty Black Flashes for
   Catastrophe; Broil kicks it into the floor and goes in a hundred and fifty times, every one a Black Flash; Echart goes through the head;
   a third 4 after the dash takes the head off, and only the head. Nothing hits him: his dodge is always on. Five times the blood.
   There is a great deal of blood. Neither is chosen without a warning first (shop.js, gory), and BLOOD OFF (under SFX) takes it away: a
   wound then gives nothing, and what comes off the nib is ink */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, M = E.MOVES, C = JU.cut, Z = JU.bossfx, Fi = JU.fights;
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const exact = (o, n) => n / (o.dr || 1);            // a hit worth the stated amount, whatever the target is made of
const jumping = () => E.keys.has('w') || E.keys.has(' ') || E.keys.has('arrowup');      // jump is held (the touch stick pushed up counts)
const sideways = () => (E.keys.has('d') || E.keys.has('arrowright') ? 1 : 0) - (E.keys.has('a') || E.keys.has('arrowleft') ? 1 : 0);
const duel = () => !!(JU.pvp && JU.pvp.busy);       // a 1v1: the other fighter is somebody else's game, and goes where that game puts it
const pick = a => a[Math.random() * a.length | 0];
const free = p => !p.move && !p.ps && !p.dead && !(p.dashT > 0);

const ENDS = Date.parse('2026-10-29T11:00:00Z');   // seven days from the day he arrived (22 Oct 2026). Move this date to run the event again
const GOLD = '#f2c14e', RGB = '242,193,78', NIB = '#e6e9ef', SHAFT = '#1d1823', INK = '#16121b', BLOOD = '#b3122c', BRGB = '179,18,44', MADRED = '#ff2440';
const M1_DMG = 7, STAB = 4, BROIL = [40, 60], COUNTER = 60, AFTER = 20, AFTER_T = 2;      // what each strike, each of Catastrophe's stabs, Broil's stab and slam, and Echart's payback are worth; and what Broil adds within AFTER_T of a payback
const ONE = 9999;                                   // Mr. Instincto: any blow of his that is meant to finish it
let DEF = null, MDEF = null;                        // the two techniques (they are added at the bottom: the same moves, his rules or Mr. Instincto's)
const mad = () => !!MDEF && JU.tech.active === MDEF;
const on = () => { const a = JU.tech.active; return !!a && (a === DEF || a === MDEF); };
const gore = () => JU.gore !== false;              // the BLOOD switch under SFX
const GK = () => (mad() ? 5 : 1);                   // how much of it: Mr. Instincto's is five times anybody's
const wet = () => (gore() ? BLOOD : INK);           // what a wound gives; with the blood off, ink off the nib
const hitCol = () => (mad() ? MADRED : gore() ? BLOOD : GOLD);      // and the colour a hit flashes
const SOUNDS = ['vengeful-hit1', 'vengeful-hit2', 'vengeful-hit3', 'vengeful-hit4', 'vengeful-ult'];
const hexRGB = h => { if (!/^#[0-9a-f]{6}$/i.test(h || '')) return '96,84,104'; const n = parseInt(h.slice(1), 16); return `${n >> 16},${n >> 8 & 255},${n & 255}`; };

/* ================= how they look ================= */
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.min(255, (n >> 16) * f) | 0},${Math.min(255, (n >> 8 & 255) * f) | 0},${Math.min(255, (n & 255) * f) | 0})`; };
function poly(fill, pts) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
}
const seg = (...p) => { g.beginPath(); for (let i = 0; i < p.length; i += 4) { g.moveTo(p[i], p[i + 1]); g.lineTo(p[i + 2], p[i + 3]); } g.stroke(); };
// the Vengeful Artist: long blue hair down his back, a coat with ink on it, and eyes that have not closed in days
const FACE = ['#e8ccb5', '#f6dfcb'], COAT = ['#2a2e3f', '#394056'], PANTS = ['#211e28', '#2e2a37'], SHOE = ['#4a3426', '#5e4332'], HAIR = '#23449c', HAIR2 = '#3561c2';      // (blue: 0.10v2)
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
const SPEARMEN = new Set([ARTIST]);                 // whoever is drawn holding the spear (Mr. Instincto wears this too: the user's word)

/* ================= where things are on a body ================= */
// a point on a fighter, in the rig's own units (from the hip, before its lean), out in the world. (E.hand is the same sum for a fist)
const hipOf = ps => lerp(Math.max(Math.cos(ps[4]), Math.cos(ps[5]), .3) * 76, 17, Math.min(1, Math.abs(ps[6]) / 1.4));
function bodyAt(f, x, y) {
  const ps = f.pose, cl = Math.cos(ps[0]), sl = Math.sin(ps[0]), rx = x * cl - y * sl, ry = x * sl + y * cl, cr = Math.cos(ps[6]), sr = Math.sin(ps[6]), k = E.K * (f.scale || 1);
  return [f.x + (rx * cr - ry * sr) * f.face * k * (f.spin === undefined ? 1 : f.spin), f.y - (rx * sr + ry * cr - hipOf(ps)) * k];
}
const headAt = f => bodyAt(f, 3, -TOR - 19), neckAt = f => bodyAt(f, 3, -TOR + 2), chestAt = f => bodyAt(f, 10, -TOR + 30);

/* ================= the G Warstaff ================= */
// It lies along his front arm: the butt behind his hand, the nib well out in front. Measured along it (L) from his hand, and across it (v)
const BUTT = -98, FERRULE = 106, BASE = 118, TIP = 200, SKEWER = 156;     // (SKEWER: where something run through it hangs, a little short of the point)
let stain = 0;                                      // how much of the nib is red (or black) from what it has been through
function grip(f) {
  const a = f.pose[2] - f.pose[6], w = E.hand(f, true), dx = Math.sin(a) * f.face * (f.spin === undefined ? 1 : f.spin), dy = -Math.cos(a);
  return { dx, dy, at: (L, v = 0) => [w[0] + dx * L - dy * v, w[1] + dy * L + dx * v] };
}
function drawSpear(f) {
  const s = grip(f), pt = (L, v) => F(...s.at(L, v)), k = pt(0)[2], st = stain;
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
  if (st > .02) {                                   // what it has been through, and (with the blood on) running back down it
    g.globalAlpha = Math.min(1, st); shape([[BASE + 38, -12], [TIP - 16, -5], [TIP, 0], [TIP - 16, 5], [BASE + 38, 12]], wet(), false);
    if (gore() && st > .4) { const a = pt(BASE + 40, 0), b = pt(BASE - 14, 0); g.strokeStyle = BLOOD; g.lineWidth = 4 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(lerp(a[0], b[0], st), lerp(a[1], b[1], st)); g.stroke(); }
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
const splash = (x, y, dir, n, pow) => C.ink(x, y, dir, gore() ? Math.round(n * 1.8 * GK()) : Math.ceil(n / 2), pow, wet());
function blood(x, y, dir, n, up = 1) {              // drops that land, and stay on the floor a while
  if (!Z || !gore()) return;
  n *= GK();
  for (let i = 0; i < n; i++) Z.emit(4, x, y, dir * rnd(120, 640) + rnd(-160, 160), rnd(80, 620) * up, rnd(3, 7), 2, BRGB, { g: 1600, land: 'blood' });
}
function pool(x, r, life = 10) { if (Z && gore()) Z.decal('blood', x, r * (mad() ? 1.3 : 1), '128,8,26', life); }      // what is left on the floor
// a gush: drops in a cone the way the wound faces, thick for a moment
function gush(x, y, dir, n, pow = 1) {
  if (!Z || !gore()) return;
  n *= GK();
  for (let i = 0; i < n; i++) { const a = rnd(-.5, .9), v = rnd(300, 900) * pow; Z.emit(4, x, y, dir * Math.cos(a) * v, Math.sin(a) * v + 120, rnd(3, 6), 2, i % 4 ? BRGB : '120,6,22', { g: 1700, land: 'blood' }); }
  C.ink(x, y, dir, Math.round(n * .6), pow, BLOOD);
}
// the thrust itself: a line of light the way it went. pz: the pose it is thrown from, since the arm has not got there yet
function jab(p, big, pz, col = RGB) {
  const s = grip({ x: p.x, y: p.y, face: p.face, spin: 1, pose: pz, scale: p.scale }), a = s.at(BASE), b = s.at(TIP + (big ? 260 : 150));
  V.custom(big ? .2 : .13, u => {
    const e = ease(Math.min(1, u * 3)), c0 = F(a[0], a[1]), c1 = F(lerp(a[0], b[0], e), lerp(a[1], b[1], e)), k = c0[2], al = (1 - u) ** 1.5;
    g.lineCap = 'round';
    lit(() => { g.strokeStyle = `rgba(${col},${.55 * al})`; g.lineWidth = (big ? 26 : 14) * k; g.beginPath(); g.moveTo(c0[0], c0[1]); g.lineTo(c1[0], c1[1]); g.stroke(); });
    g.strokeStyle = `rgba(255,250,235,${al})`; g.lineWidth = (big ? 6 : 3) * k; g.beginPath(); g.moveTo(c0[0], c0[1]); g.lineTo(c1[0], c1[1]); g.stroke();
    g.lineCap = 'butt';
  });
}
// a Black Flash, where a blow of Mr. Instincto's lands: red and black, lightning off it. (Only on the spot: the engine's own, over the whole
// screen, is kept for the last blow of a string of them, so the screen is not strobing)
function flashBlack(x, y, big) {
  const c = F(x, y);
  if (JU.bolts) JU.bolts(c[0] * E.S, c[1] * E.S, big ? 16 : 5);
  E.addBlast(x, y, '255,36,64', big ? 320 : 150); V.sparks(x, y, 'red', big ? 16 : 5); V.ring(x, y, big ? 280 : 130, '#ff2440', .2);
  if (Z) Z.flare(x, y, '255,36,64', big ? 460 : 220, .14);
  if (big || Math.random() < .3) pop(x + rnd(-80, 80), y + rnd(120, 220), '黒閃', big ? 64 : 34, '#ff4a62');
}

/* ---------- blood on the lens (0.10v1): the big ones throw it at the screen, and it runs down it ---------- */
const splats = [];
function lens(n, big) {
  if (!gore()) return;
  n *= mad() ? 3 : 1;
  for (let i = 0; i < n; i++) splats.push({ x: rnd(.06, .94), y: rnd(.06, .62), r: rnd(16, 38) * (big ? 1.4 : 1), t: 0, life: rnd(2.2, 3.2), seed: rnd(1, 99),
    drips: Array.from({ length: 2 + (Math.random() * 3 | 0) }, () => [rnd(-.7, .7), rnd(60, 240), rnd(4, 9)]) });
  if (splats.length > 24) splats.splice(0, splats.length - 24);
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

/* ---------- what Mr. Instincto leaves (0.10v2): pieces, fountains, and heads that are not there any more ---------- */
const founts = [], holes = [], headless = [];
function fount(o, at, life) { founts.push({ o, at, t: 0, life }); }
function fountains(dt) {                            // blood out of a neck or a head, in time with a heart that has not stopped yet
  for (let i = founts.length - 1; i >= 0; i--) {
    const f = founts[i];
    if ((f.t += dt) >= f.life || f.o !== E.P2) { founts.splice(i, 1); continue; }
    if (!Z || !gore()) continue;
    const q = f.at === 'neck' ? neckAt(f.o) : headAt(f.o), beat = Math.max(0, Math.sin(f.t * 10)), n = Math.round((1 + 5 * beat) * (1 - f.t / f.life) * 2);
    for (let j = 0; j < n; j++) Z.emit(4, q[0] + rnd(-6, 6), q[1] + 6, rnd(-200, 200), rnd(300, 900) * (.4 + beat), rnd(3, 6), 2, BRGB, { g: 1600, land: 'blood' });
  }
}
function carnage(o) {                               // (Mr. Instincto's kills) all of it, everywhere
  const hs = o.scale || 1, x = o.x, y = o.y + 160 * hs;
  sfx.splat(); sfx.blast(); shake(40);
  if (!gore()) { C.ink(x, y, 1, 30, 1.4, INK); C.ink(x, y, -1, 30, 1.4, INK); if (Z) Z.boom(x, y, 260, '40,30,50'); return; }
  const cols = [hexRGB(o.skin && o.skin.torso && o.skin.torso[0]), '120,8,26', '92,6,20', '214,200,182', '200,96,120'];
  for (let i = 0; i < 34; i++) Z.emit(3, x + rnd(-40, 40), y + rnd(-60, 80), rnd(-950, 950), rnd(300, 1500), rnd(5, 13), rnd(1.6, 2.6), pick(cols), { g: 2200, vr: rnd(-12, 12), rot: rnd(0, TAU), edge: '#1a0408' });   // pieces of it
  gush(x, y, 1, 14, 1.6); gush(x, y, -1, 14, 1.6);
  for (let i = 0; i < 70; i++) Z.emit(4, x + rnd(-380, 380), 950 + rnd(0, 400), rnd(-60, 60), rnd(-220, 0), rnd(3, 7), 3.2, BRGB, { g: 1300, land: 'blood' });     // and it comes down again, for a while
  pool(x, 360, 16); pool(x - 280, 160, 14); pool(x + 280, 160, 14);
  lens(4, true); Z.flash(BRGB, .35, .45);
}
const stump = function () {                         // what is left where a head was (drawn in its place: the neck, and the bone in it)
  g.fillStyle = gore() ? '#6a0818' : '#2a2430'; g.fillRect(-9, 11, 18, 13); g.strokeStyle = LINE; g.lineWidth = 2.5; g.strokeRect(-9, 11, 18, 13);
  if (!gore()) return;
  g.fillStyle = '#c4122e'; g.beginPath(); g.ellipse(0, 11, 10, 4, 0, 0, TAU); g.fill();
  g.fillStyle = '#e8ddd0'; g.beginPath(); g.ellipse(0, 11, 3, 2, 0, 0, TAU); g.fill();
};
function behead(o) {                                // Mr. Instincto's third 4: the head, and only the head
  const h = headAt(o), f = E.P1.face;
  panel = null;
  if (!headless.some(e => e.o === o)) { headless.push({ o, skin: o.skin }); o.skin = Object.assign({}, o.skin, { head: stump, back: o.skin.back }); }
  sfx.blast(); sfx.splat(); sfx.bf(); shake(34); E.stop(.14); E.zoomIn(.5);
  if (gore() && Z) {
    for (let i = 0; i < 36; i++) Z.emit(3, h[0], h[1], rnd(-760, 760), rnd(200, 1400), rnd(3, 9), rnd(1.2, 2.3), pick(['236,226,210', '214,200,182', '200,96,120', '150,20,40', '120,8,26']), { g: 2300, vr: rnd(-14, 14), rot: rnd(0, TAU), edge: '#2a0a0e' });   // skull, and what was in it
    gush(h[0], h[1], 1, 12, 1.4); gush(h[0], h[1], -1, 12, 1.4);
    fount(o, 'neck', 3.4); lens(3, true); pool(o.x, 280, 16);
  } else { C.ink(h[0], h[1], 1, 24, 1.2, INK); C.ink(h[0], h[1], -1, 24, 1.2, INK); if (Z) Z.boom(h[0], h[1], 140, '40,30,50'); }
  pop(h[0], h[1] + 140, 'パァン', 84, '#ff4a62');
  E.applyHit(o, f, { dmg: ONE, kb: 0, stun: 1, stop: .22, heavy: 1, col: MADRED, fixed: 1, mute: 1, kill: 1 });
}
function pierceHead(o, f) {                         // Mr. Instincto's Echart: in through the face, and out of the back of it
  const h = headAt(o);
  holes.push({ o, t: 0, life: 4 });
  sfx.splat(); sfx.bf(); shake(30);
  if (gore() && Z) {
    gush(h[0] + f * 20, h[1], f, 16, 1.4);
    for (let i = 0; i < 18; i++) Z.emit(3, h[0] + f * 24, h[1], f * rnd(200, 900), rnd(100, 700), rnd(2, 6), rnd(1, 2), pick(['214,200,182', '200,96,120', '150,20,40']), { g: 2200, vr: rnd(-12, 12), rot: rnd(0, TAU) });
    fount(o, 'head', 2.6); lens(3, true);
  } else C.ink(h[0], h[1], f, 20, 1.2, INK);
  pop(h[0], h[1] + 140, 'グサッ', 76, '#ff4a62');
}
function drawHoles(dt) {                            // the hole it left, for as long as the fountain runs
  for (let i = holes.length - 1; i >= 0; i--) {
    const e = holes[i];
    if ((e.t += dt) >= e.life || e.o !== E.P2) { holes.splice(i, 1); continue; }
    const q = F(...headAt(e.o)), k = q[2] * (e.o.scale || 1);
    g.fillStyle = gore() ? '#4a0410' : INK; g.beginPath(); g.arc(q[0] + e.o.face * 10 * k, q[1] + 2 * k, 9 * k, 0, TAU); g.fill();
    if (gore()) { g.fillStyle = '#c4122e'; g.fillRect(q[0] + e.o.face * 8 * k, q[1] + 6 * k, 4 * k, 30 * k * Math.min(1, e.t)); }
  }
}

/* ================= the strikes ================= */
// [lean, head, armF, armB, legF, legB, rot]. The spear points the way his front arm does
const PZ = {
  vaWind1: [0, 0, 1, .5, .3, -.35, 0],          vaThrust1: [.32, 0, 1.62, 1.25, .62, -.5, 0],
  vaWind2: [.06, 0, 1.3, .3, .3, -.3, 0],       vaThrust2: [.36, .05, 1.8, 1, .58, -.52, 0],
  vaWind3: [-.14, -.1, 3.05, 1.6, .3, -.3, 0],  vaChop: [.5, .15, 1.15, .6, .72, -.55, 0],
  vaWind4: [-.3, 0, .9, .3, .15, -.45, 0],      vaLunge: [.62, 0, 1.58, 1.45, 1.05, -.78, 0],
  vaLow: [.16, 0, .4, .2, .45, -.4, 0],         vaRise: [-.06, -.22, 2.85, 1.9, .5, -.3, 0],
  vaDrive: [.5, .2, .75, .45, .7, -.5, 0],
  vaGuard: [.1, .05, 2.05, 1.65, .58, -.58, 0], vaParry: [.04, -.06, 2.35, 2.05, .48, -.48, 0],
  vaFreeze: [.45, .05, 2.1, 1.3, 1.5, -.55, 0], vaOver: [-.12, -.25, 3, 2.6, .45, -.4, 0]
};
Object.assign(POSE, PZ);                            // (the plain strikes find their poses by name)
// the ordinary four, with the spear: they keep the engine's timing and its chain. The fourth sends whatever it hits flying (flung)
const SPEAR = [
  { pre: 'vaWind1', pose: 'vaThrust1', lunge: 230, hit: { reach: 222, kb: 170, stun: .36, stop: .045 } },
  { pre: 'vaWind2', pose: 'vaThrust2', lunge: 230, hit: { reach: 226, kb: 170, stun: .36, stop: .045 } },
  { pre: 'vaWind3', pose: 'vaChop', lunge: 240, strike: .1, dur: .32, hit: { reach: 214, kb: 210, stun: .4, stop: .06 } },
  { pre: 'vaWind4', pose: 'vaLunge', lunge: 560, strike: .17, dur: .62, kick: 0, hit: { reach: 245, kb: 1650, lift: 700, stun: .9, stop: .16, heavy: 1, flung: 1 } }
].map((o, i) => Object.assign({}, M.m1[i], o, { va: 1, sw: 'rgba(242,193,78,.9)', hit: Object.assign({ dmg: M1_DMG, col: GOLD, mute: 1 }, o.hit) }));
// Mr. Instincto's: the same four, and each one is the last
const MSPEAR = SPEAR.map(d => Object.assign({}, d, { mad: 1, sw: 'rgba(255,36,64,.9)', hit: Object.assign({}, d.hit, { dmg: ONE, col: MADRED, kill: 1 }) }));
// jump held through the chain: the fourth comes up from underneath
const UP = { m1: 1, va: 1, dur: .62, run(p, m, t) {
  p.rate = 46;
  if (t < .14) { p.target = PZ.vaLow; if (p.ground) p.vx = p.face * 160; return; }
  p.target = t < .44 ? PZ.vaRise : POSE.idle; if (p.ground) p.vx = t < .2 ? p.face * 240 : 0;
  if (!m.sw) { m.sw = 1; sfx.whoosh(); V.slash(p.x + p.face * 120, p.y + 220, p.face > 0 ? 1.2 : Math.PI - 1.2, 400, m.mad ? MADRED : GOLD, 14); }
  if (!m.done && t < .28 && E.tryHit(p, { reach: 228, dmg: m.mad ? ONE : M1_DMG, kb: 80, lift: 1150, stun: .9, stop: .1, heavy: 1, col: m.mad ? MADRED : GOLD, mute: 1, kill: m.mad ? 1 : 0 })) m.done = 1;
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
  if (!m.done && E.tryHit(p, { reach: 232, dmg: m.mad ? ONE : M1_DMG, kb: 160, stun: .9, stop: .12, heavy: 1, col: m.mad ? MADRED : GOLD, mute: 1, kill: m.mad ? 1 : 0 })) {
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
  if (!SPEARMEN.has(p.skin)) return true;          // in somebody else's body (a clan's): the ordinary strikes, then
  prime();
  const m = mad();
  p.move = { def: i < 3 ? (m ? MSPEAR : SPEAR)[i] : !p.ground ? DOWN : jumping() ? UP : (m ? MSPEAR : SPEAR)[3], i, t: 0, mad: m };
  return false;
}
// a strike of his has gone out, and then landed
function landed(p, m) {
  const o = E.P2, f = p.face, hs = o.scale || 1, n = m.def === UP || m.def === DOWN ? 3 : m.i, x = o.x - f * 18, y = o.y + 168 * hs;
  sfx.spear(n);
  stain = Math.min(1, stain + .18 + .1 * n);
  splash(x, y, f, 3 + 2 * n, .65 + .12 * n); V.sparks(x, y, 'gold', 3 + 2 * n);
  blood(x, y, f, 3 + 2 * n);
  if (m.mad) { flashBlack(x, y, false); if (o.ko) carnage(o); }
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
    if (Z && gore() && Math.random() < dt * 40 * GK()) Z.emit(4, o.x + rnd(-30, 30), o.y + rnd(100, 220) * hs, -o.vx * rnd(.05, .2), rnd(-100, 200), rnd(3, 6), 2, BRGB, { g: 1500, land: 'blood' });     // and a trail of it behind
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
// a blow that is not to finish it (the finish comes later): `want`, or whatever is short of that and still leaves it standing
function spare(o, h, want) { h.dmg = Math.max(0, Math.min(want, o.hp - 1)) / ((o.dr || 1) * (H.power ? H.power(h, o) : 1)); return h; }

/* ================= 1: Catastrophe ================= */
const N = 20, MN = 40, EVERY = .068, WIND = .2;     // how many times the spear goes in (Mr. Instincto: forty), how far apart, and the wind-up before the first
// the lines a page draws round whatever everybody is looking at, for as long as the stabbing goes on
function lines(p, m, life) {
  const seed = Array.from({ length: 46 }, () => [rnd(0, TAU), rnd(0, 1), rnd(.6, 1.6)]);
  V.custom(life, u => {
    const o = E.P2, c = F(o.x, o.y + 170 * (o.scale || 1)), k = c[2], a = Math.min(1, u * 8) * Math.min(1, (1 - u) * 6) * (p.move === m ? 1 : 0);
    if (a <= 0) return;
    for (let i = 0; i < seed.length; i++) {
      if (Math.random() < .25) continue;            // they flicker
      const [an, d, w] = seed[i], r0 = (150 + 130 * d) * k, r1 = 1150 * k, cs = Math.cos(an), sn = Math.sin(an), hw = w * 5 * k;
      g.fillStyle = i % 3 ? `rgba(8,6,12,${.55 * a})` : m.mad ? `rgba(255,36,64,${.4 * a})` : `rgba(255,248,230,${.4 * a})`;
      g.beginPath(); g.moveTo(c[0] + cs * r0, c[1] + sn * r0); g.lineTo(c[0] + cs * r1 - sn * hw, c[1] + sn * r1 + cs * hw); g.lineTo(c[0] + cs * r1 + sn * hw, c[1] + sn * r1 - cs * hw); g.closePath(); g.fill();
    }
  });
}
// a spear that is not there, thrust and gone: enough of them at once and there is no telling which is the real one
function phantom(p, dy, big, col = RGB, down = 0) {
  const f = p.face, x0 = p.x + f * 60, y = p.y + 182 + dy, len = rnd(300, 360), tilt = down ? -rnd(.55, .8) : rnd(-.12, .12);
  V.custom(big ? .24 : .15, u => {
    const e = u < .35 ? ease(u / .35) : 1, a0 = F(x0 + f * 20, y), a1 = F(x0 + f * len * e * (down ? .6 : 1), Math.max(10, y + tilt * len * e)), k = a0[2], ang = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]);
    g.save(); g.globalAlpha = .85 * (1 - u) ** 1.4; g.lineCap = 'round';
    lit(() => { g.strokeStyle = `rgba(${col},.5)`; g.lineWidth = (big ? 24 : 16) * k; g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.stroke(); });
    g.strokeStyle = '#fff6dc'; g.lineWidth = 4 * k; g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.stroke();
    g.translate(a1[0], a1[1]); g.rotate(ang); g.fillStyle = NIB; g.strokeStyle = LINE; g.lineWidth = 2;
    g.beginPath(); g.moveTo(12 * k, 0); g.lineTo(-38 * k, -10 * k); g.lineTo(-38 * k, 10 * k); g.closePath(); g.fill(); g.stroke();
    g.restore();
  });
}
function stab(p, m, n) {
  const o = E.P2, f = p.face, last = n === m.N, hs = o.scale || 1, dy = rnd(-60, 80);
  m.pz = [rnd(.26, .4), 0, rnd(1.32, 1.95), rnd(.9, 1.5), .6, -.5, 0]; p.pose[0] -= .22;       // the arm back an inch, and out again
  phantom(p, dy, last, m.mad ? '255,36,64' : RGB);
  if (n & 1) sfx.whoosh();
  const h = { reach: 258, kb: last ? 140 : 36, stun: last ? 1.15 : .5, stop: last ? .12 : .016, col: m.mad ? MADRED : GOLD, fixed: 1, mute: 1 };
  if (last) h.heavy = 1;
  if (m.mad) { if (last) Object.assign(h, { dmg: ONE, kill: 1 }); else spare(o, h, 25); }      // Mr. Instincto: forty, and the fortieth is the end of it
  else h.dmg = exact(o, STAB);
  if (!E.tryHit(p, h)) return;
  const x = o.x - f * 16, y = o.y + (168 + dy * .5) * hs;
  sfx.spear(last ? 3 : n % 3, last ? 1 : .55);
  if (m.mad && (n % 4 === 0 || last)) sfx.bf();
  stain = Math.min(1, stain + .05);
  splash(x, y, f, last ? 8 : 2, last ? 1 : .55); V.sparks(x, y, 'gold', last ? 10 : 2); blood(x, y, f, last ? 6 : 2);
  if (m.mad) flashBlack(x, y, last);
  if (n % 5 === 0 && !last && !m.mad) pop(x + rnd(-70, 70), y + rnd(110, 190), pick(['ザク', 'ズッ', 'ドス', 'ザシュ']), 40);
  if (!last) return;
  shake(24); E.zoomIn(.3); V.impact(.08, o.x, y); V.ring(x, y, 300, '#ffffff', .3);
  if (Z) { Z.flash(gore() ? BRGB : RGB, .14, .16); Z.flare(x, y, RGB, 460, .2); }
  gush(x, y, f, 20, 1.1); pool(o.x, 160); lens(2);
  pop(x, y + 170, 'ドドドドッ', 60);
  if (m.mad) { E.blackFlash(); if (o.ko) carnage(o); }
}

/* ================= 2: Broil ================= */
const lift = e => PZ.vaLunge.map((v, i) => lerp(v, PZ.vaOver[i], e));
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
// Mr. Instincto's Broil: after the stab, a kick that puts it in the floor, and then the spear, a hundred and fifty times, every one a Black Flash
const GROUND = 150;
function kickDown(p, o) {
  const f = p.face;
  sfx.blast(); sfx.hit(true); shake(36); E.zoomIn(.4); E.stop(.08);
  o.x = clamp(p.x + f * 150, -940, 940);
  Object.assign(o, { y: 0, ground: true, state: 'down', stun: 99, vx: 0, vy: 0, act: null, tele: 0 }); o.pose = POSE.down.slice();
  V.crack(o.x, 420); V.rocks(o.x, 0, 20); V.ring(o.x, 40, 400, MADRED, .4); if (Z) Z.shock(o.x, 600, '255,36,64', .5, 14);
  gush(o.x, 60, f, 8, 1.2); pool(o.x, 260, 16);
  pop(o.x, 260, 'ドゴォッ', 74, '#ff4a62');
}
const pin = o => { if (!o.ko) Object.assign(o, { state: 'down', stun: 99, vx: 0, vy: 0, ground: true, y: 0, act: null }); };
function groundStab(p, o, m, k) {
  const last = k === GROUND, f = p.face, x = o.x + rnd(-80, 60) * f, y = rnd(20, 60);
  m.pz = [rnd(.4, .62), .12, rnd(.5, .95), rnd(.3, .7), .7, -.5, 0]; p.pose[0] -= .14;      // the spear down into it, and up, and down
  phantom(p, -40, last, '255,36,64', 1);
  const h = { kb: 0, stun: 99, stop: last ? .3 : .006, col: MADRED, fixed: 1, mute: 1 };
  if (last) { Object.assign(h, { dmg: ONE, kill: 1, heavy: 1 }); E.applyHit(o, f, h); }
  else { E.applyHit(o, f, spare(o, h, 15)); pin(o); }
  sfx.spear(k % 3, .45); if (k % 6 === 0 || last) sfx.bf();
  flashBlack(x, y + 30, last);
  gush(x, y + 20, Math.random() < .5 ? 1 : -1, last ? 20 : 2, .7);
  if (k % 10 === 0) pool(x, rnd(80, 140), 14);
  if (k % 25 === 0 && !last) lens(1);
  if (last) { E.blackFlash(); carnage(o); }
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
  p.face = o.x >= p.x ? 1 : -1;
  const f = p.face;
  if (m.mad) {                                      // Mr. Instincto: through the head
    p.pose = PZ.vaThrust2.slice();
    jab(p, true, PZ.vaThrust2, '255,36,64'); pierceHead(o, f); flashBlack(...headAt(o), true);
    E.applyHit(o, f, { dmg: ONE, kb: 260, lift: 300, stun: 1, stop: .3, heavy: 1, col: MADRED, fixed: 1, mute: 1, kill: 1 });
    sfx.spear(3); E.zoomIn(.45); E.blackFlash();
    return;
  }
  p.pose = PZ.vaLunge.slice();
  const x = o.x - f * 16, y = o.y + 168 * hs;
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
// end of his guard for a while (JU.block.brk), and it lands in full. (Mr. Instincto's is always on, from every side, and nothing catches it)
const OPEN = [.3, .42];
let dodgeAt = -9;
const shades = [];                                  // afterimages: { f: a copy of whoever it was as they were, t, life, pale: the enemy's before-image }
const copyOf = f => ({ skin: f.skin, x: f.x, y: f.y, z: f.z, face: f.face, spin: 1, scale: f.scale, pose: f.pose.slice(), alpha: 1 });
function afterimage(f, life = .55) {
  shades.push({ f: copyOf(f), t: 0, life });
  if (shades.length > 10) shades.shift();
  if (Z) for (let i = 0; i < 6; i++) Z.emit(2, f.x + rnd(-40, 40), f.y + rnd(40, 260), rnd(-40, 40), rnd(20, 90), rnd(50, 90), rnd(.4, .7), '24,16,34', { a: .7 });
}
const guardUp = () => !!(JU.block && JU.block.state.up);
function dodge(p, face, always) {
  const since = E.T - dodgeAt;
  if (since < OPEN[0]) return true;                 // still slipping out of the last one: this goes through where he was
  if (since < OPEN[1] && !always) {                 // on the beat, as he settles: caught
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
  E.fx.push({ k: 2, x: p.x, y: p.y + 330, n: 'DODGE', col: always ? '#ff8a98' : '#cfc6ff', t: 0, life: .5 });
  return true;
}
function drawShades(dt) {                           // under the fighters: the afterimages, black with a little violet round them (or pale, the enemy's)
  if (!shades.length && !(on() && guardUp())) return;
  for (let i = shades.length - 1; i >= 0; i--) {
    const s = shades[i];
    if ((s.t += dt) >= s.life) { shades.splice(i, 1); continue; }
    const a = (s.pale ? .55 : .8) * (1 - s.t / s.life) ** 1.2;
    g.save(); g.filter = s.pale ? 'grayscale(1) brightness(1.7) contrast(.55)' : 'brightness(0) drop-shadow(0 0 5px rgba(140,90,255,.75))';
    E.drawFighter(s.f, a);
    if (SPEARMEN.has(s.f.skin)) { g.globalAlpha = a; drawSpear(s.f); g.globalAlpha = 1; }
    g.filter = 'none'; g.restore();
  }
  const p = E.P1;
  if (!(on() && guardUp() && !p.dead)) return;
  g.save(); g.filter = 'brightness(0) drop-shadow(0 0 5px rgba(140,90,255,.75))';
  for (const d of [-1, 1]) {                        // the guard: him, not quite where he is, either side
    const f = { skin: p.skin, x: p.x - p.face * (16 + 8 * Math.sin(E.T * 9 + d)) * (d > 0 ? 1 : .5), y: p.y, z: p.z, face: p.face, spin: 1, scale: p.scale, pose: p.pose, alpha: 1 };
    E.drawFighter(f, .22); g.globalAlpha = .22; drawSpear(f); g.globalAlpha = 1;
  }
  g.filter = 'none'; g.restore();
}

/* ================= 4: Stronde (0.10v2) ================= */
// A panel off his page, thrown: it sticks to the chest of whatever it reaches. 4 again while it is on: a picture of it is left where it stood
// (the before-image), and it is made to dash, the way he is moving, or either way if he is standing still. The panel stays on for PANEL_T,
// and while it does the Final Chapter can be started
const PANEL_T = 20, CARD_V = 1700, CARD_R = 1000, FORCE = 380;
let panel = null, card = null, forced = null;
const panelOn = o => !!panel && panel.o === o && E.T < panel.until && !o.ko;
function throwCard(p) {
  const w = E.hand(p, true);
  card = { x: w[0] + p.face * 30, y: w[1], x0: w[0], f: p.face, t: 0 };
  sfx.swish(.6); sfx.tick(1);
}
function flyCard(dt) {
  const c = card, o = E.P2, hs = o.scale || 1, ch = chestAt(o);
  c.t += dt; c.x += c.f * CARD_V * dt; c.y += (ch[1] - c.y) * Math.min(1, dt * 8);
  if (!o.ko && !(o.alpha < 1) && Math.abs(c.x - ch[0]) < 50 * hs && Math.abs(c.y - ch[1]) < 160 * hs) { stick(o); card = null; return; }
  if (Math.abs(c.x - c.x0) > CARD_R || Math.abs(c.x) > 1100) card = null;
}
function stick(o) {
  panel = { o, until: E.T + PANEL_T, dashed: false, at: E.T };
  const ch = chestAt(o);
  sfx.tick(2); sfx.swish(.5);
  pop(ch[0], ch[1] + 130, 'ペタッ', 44); V.ring(ch[0], ch[1], 90, '#ffffff', .2);
  E.fx.push({ k: 2, x: o.x, y: o.y + 430 * (o.scale || 1), n: '4  ·  AGAIN', col: GOLD, t: 0, life: 1.2 });
}
function force(p) {                                 // the second 4
  const o = E.P2, dir = sideways() || (Math.random() < .5 ? -1 : 1);
  shades.push({ f: copyOf(o), t: 0, life: .9, pale: 1 });
  panel.dashed = true; E.cd.manji = Math.max(E.cd.manji, E.CD.manji);
  sfx.whoosh(); sfx.swish(1); pop(o.x, o.y + 330 * (o.scale || 1), 'シュッ', 46);
  if (duel()) { E.applyHit(o, dir, { dmg: 0, kb: FORCE * 7, stun: .4, stop: .02, mute: 1, col: GOLD }); return; }      // (his game moves him: a shove, as far)
  forced = { o, x0: o.x, x1: clamp(o.x + dir * FORCE, -965, 965), t: 0 };
  Object.assign(o, { state: 'hurt', stun: .45, act: null, tele: 0, vx: 0 });
}
function shove(dt) {                                // (the dash it was made to make, while it lasts)
  const s = forced, o = s.o, u = Math.min(1, (s.t += dt) / .16);
  if (o !== E.P2) { forced = null; return; }
  o.x = lerp(s.x0, s.x1, ease(u));
  if (Math.random() < .9) V.puff('white', o.x - Math.sign(s.x1 - s.x0) * 50, o.y + rnd(60, 240), 0, 0, rnd(30, 50), .25);
  if (u >= 1) forced = null;
}
function drawPanel(o) {                             // on its chest: a page of his, a frame with a scene in it
  const q = chestAt(o), c = F(q[0], q[1]), k = c[2] * (o.scale || 1), left = panel.until - E.T, a = Math.min(1, left / 2.5), w = 34 * k, h = 44 * k;
  g.save(); g.translate(c[0], c[1]); g.rotate(-.12 * o.face + .04 * Math.sin(E.T * 3)); g.globalAlpha = a;
  g.fillStyle = '#fbf8f0'; g.fillRect(-w / 2, -h / 2, w, h); g.lineWidth = 3 * k; g.strokeStyle = LINE; g.strokeRect(-w / 2, -h / 2, w, h);
  g.strokeStyle = 'rgba(8,6,12,.55)'; g.lineWidth = 1.2 * k; g.beginPath();
  for (let i = 0; i < 7; i++) { const y = -h / 2 + (i + 1) * h / 8; g.moveTo(-w / 2 + 3 * k, y); g.lineTo(-w / 2 + (6 + (i * 7 % 13)) * k, y); }      // speed lines on the page
  g.stroke();
  g.fillStyle = '#c4122e'; g.beginPath(); g.ellipse(4 * k, 3 * k, 8 * k, 6 * k, .4, 0, TAU); g.fill();                     // and something on it that is red
  g.fillStyle = LINE; g.font = `${Math.round(13 * k)}px 'Yuji Syuku','Yu Mincho',serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('筆', -6 * k, -11 * k);
  g.restore();
}
function drawCard() {
  const c = F(card.x, card.y), k = c[2], sx = Math.cos(card.t * 22);
  g.save(); g.translate(c[0], c[1]); g.scale(sx, 1); g.rotate(card.t * 4);
  g.fillStyle = '#fbf8f0'; g.fillRect(-14 * k, -18 * k, 28 * k, 36 * k); g.lineWidth = 2.5 * k; g.strokeStyle = LINE; g.strokeRect(-14 * k, -18 * k, 28 * k, 36 * k);
  g.restore();
}

/* ================= G: the Final Chapter (0.10v2) ================= */
// A counter, and only with a panel on them. Whatever hits him in it starts the scene (E.setScene: the fight stands still under it), timed to
// the clip the user supplied: the counter, and ink thrown off him (he stays himself all through: no penguin, the user's word); a run of
// blows; the page turns grey and stops; close on his face; the panel on their chest, nineteen times; the spear up; and the last of it in red. Then the damage, all of it: ULT_HURT against a
// player or a boss (so many of it during the stabs, the rest at the end), everything else does not get up. (Mr. Instincto: nothing gets up)
const ULT_WAIT = 1.2, ULT_HURT = 300, ULT_STAB = 12, FILM_T = 9.02;
const FLURRY = [5.34, 5.46, 5.54, 5.74, 5.97, 6.08, 6.13, 6.34, 6.41, 6.49, 6.57, 6.66, 6.70, 6.74, 6.79, 6.83, 6.92, 7.03, 7.18];      // (on the stabs in the clip)
const RUN = [[1.12, 'stab'], [1.79, 'kick'], [2.14, 'jump'], [2.26, 'cut'], [2.35, 'cut'], [2.43, 'cut'], [2.59, 'land']];
let film = null, ultCd = 0;
const ULT = { name: 'Final Chapter', dur: 9, glow: 'gold', run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.rate = 40; p.target = PZ.vaParry;
  if (!m.c) { m.c = 1; sfx.charge(); shout(p, '最終話', GOLD); }
  if (!o.ko) p.face = o.x >= p.x ? 1 : -1;
  if (Fi.fight.cfg && Fi.fight.cfg.dummy && t > .45) { roll(p); return; }      // (the training curse never swings: it is taken as read that it did)
  if (t > ULT_WAIT) { ultCd = 3; E.fx.push({ k: 2, x: p.x, y: p.y + 430, n: 'NOTHING CAME', col: '#cfc6ff', t: 0, life: 1 }); E.endMove(p); }
} };
const SPENT = { name: 'Final Chapter', dur: 99, run() {} };      // (what he is doing while the scene runs: it keeps his hits from refilling the bar)
function awaken(p) {                                // (tech.js: G, with the bar full. It keeps the bar until the counter lands)
  if (!panelOn(E.P2)) { E.fx.push({ k: 2, x: p.x, y: p.y + 430, n: 'A MANGA PANEL ON THEM FIRST  ·  4', col: GOLD, t: 0, life: 1.4 }); sfx.back(); return; }
  if (ultCd > 0 || film) return;
  p.move = { def: ULT, t: 0 };
}
function roll(p) {                                  // the counter has caught something: the scene
  const o = E.P2;
  if (film) return;
  JU.tech.drain();
  if (p.move) E.endMove(p);
  const cx = clamp((p.x + o.x) / 2, -740, 740), side = p.x <= o.x ? 1 : -1;
  film = { t: 0, p, o, skin: p.skin, cx, side, done: new Set(), dealt: 0, mad: mad(), heard: !!(sfx.file && sfx.file('vengeful-ult')), pz: null, kx: 0, fx: 0 };
  p.x = cx - side * 170; o.x = cx + side * 170; p.face = side; o.face = -side;
  Object.assign(p, { vx: 0, vy: 0, y: 0, ground: true, ps: null, dashT: 0, spin: 1, inv: 99 });
  Object.assign(o, { vx: 0, vy: 0, y: 0, ground: true, state: 'hurt', stun: 9, act: null, tele: 0 });
  p.move = { def: SPENT, t: 0 };
  E.root.classList.add('cine');
  E.setScene({ mode: 'ult', update: filmUpdate, render: filmRender, press: a => { if (film && (a === 'skip' || a === 'ok')) film.t = Math.max(film.t, FILM_T - .05); } });
}
// the camera, on a point: x along the fight, y up from the floor, z how close
function aim(x, y, z, yaw = 0) {
  cam.x = x; cam.zoom = z; cam.yaw = yaw;
  cam.lift = E.GY - 120 + z * (120 - y) - E.VH / 2;
}
function filmUpdate(dt, real) {
  const f = film;
  if (!f) return;
  f.t += real;
  const t = f.t, p = f.p, o = f.o, s = f.side, hs = o.scale || 1, cue = i => { if (!f.heard) sfx.ult(i); };
  const at = (k, when, fn) => { if (t >= when && !f.done.has(k)) { f.done.add(k); fn(); } };
  // what happens, on the beats of the clip
  at('clang', .03, () => { const x = p.x + s * 60; cue(0); sfx.block(); shake(14); V.ring(x, 210, 240, '#ffffff', .3); V.sparks(x, 210, 'white', 14); if (Z) Z.flash('255,255,255', .4, .2); pop(x, 360, 'ギィン', 60); });
  at('ink', .36, () => { cue(1); C.ink(p.x, p.y + 200, 1, 26, 1.3, INK); C.ink(p.x, p.y + 200, -1, 26, 1.3, INK); if (Z) for (let i = 0; i < 16; i++) Z.emit(2, p.x + rnd(-80, 80), rnd(30, 330), rnd(-120, 120), rnd(20, 160), rnd(70, 130), rnd(.5, .9), '20,16,28', { a: .8 }); pop(p.x, 400, '筆', 72); });      // the pen taken up
  RUN.forEach(([when, what], i) => at('run' + i, when, () => beat(f, what)));
  at('freeze', 2.62, () => { cue(2); f.fp = PZ.vaFreeze.slice(); p.pose = PZ.vaFreeze.slice(); o.pose = POSE.air.slice(); o.pose[6] = -.7; o.y = 150; o.x = f.cx + s * 330; });
  at('thaw', 4.02, () => { o.y = 0; o.x = f.cx + s * 170; o.pose = POSE.hurt.slice(); p.pose = POSE.idle.slice(); });
  at('glint', 5.02, () => { cue(3); const h = headAt(p); V.sparks(h[0] + s * 12, h[1] + 6, 'white', 10); });
  FLURRY.forEach((when, i) => at('st' + i, when, () => filmStab(f, i)));
  at('final', 8.27, () => { cue(4); sfx.spear(3); shake(40); f.fx = 1; jab(p, true, PZ.vaLunge, '255,36,64'); });
  // where they stand, and how
  p.vx = p.vy = o.vx = o.vy = 0; o.state = 'hurt'; o.stun = 9; o.act = null; o.face = -s; p.face = s;
  const frozen = t >= 2.62 && t < 4.02;
  if (!frozen) {
    if (t < .36) { p.target = PZ.vaParry; p.rate = 30; }
    else if (t < 1.05) { p.target = t < .75 ? POSE.idle : PZ.vaWind1; p.rate = 18; }
    else if (t < 2.62) { p.target = f.pz || POSE.idle; p.rate = 44; p.y = t >= 2.14 && t < 2.59 ? 190 * Math.sin((t - 2.14) / .45 * Math.PI) : 0; }
    else if (t < 5) { p.target = t < 4.02 ? PZ.vaOver : POSE.idle; p.rate = t < 4.02 ? 10 : 30; }
    else if (t < 5.34) { p.target = PZ.vaWind4; p.rate = 30; }
    else if (t < 7.22) { p.target = f.pz || PZ.vaThrust1; p.rate = 70; }
    else if (t < 8.22) { p.target = t < 7.95 ? PZ.vaOver : POSE.idle; p.rate = t < 7.95 ? 14 : 40; }
    else { p.target = PZ.vaLunge; p.rate = 60; }
    o.target = POSE.hurt; o.rate = 30;
    if (t < 2.62) { f.kx *= Math.exp(-real * 4); o.x = f.cx + s * (170 + f.kx); }
    if (f.fx) { o.x += s * 1500 * real; o.y += 480 * real; o.pose[6] -= 10 * real; } else { E.blend(o, real); }
    E.blend(p, real);
  }
  shot(f, t);
  if (t >= FILM_T) endFilm();
}
function beat(f, what) {                            // the run of blows before the page turns
  const p = f.p, o = f.o, s = f.side, ch = chestAt(o), cue = !f.heard;
  if (what === 'stab') { f.pz = PZ.vaThrust1; p.pose = PZ.vaWind1.slice(); jab(p, false, PZ.vaThrust1); f.kx = 60; if (cue) sfx.spear(0); }
  else if (what === 'kick') { f.pz = POSE.kick; f.kx = 120; if (cue) sfx.hit(true); }
  else if (what === 'jump') { f.pz = PZ.vaWind3; if (cue) sfx.whoosh(); }
  else if (what === 'cut') { f.pz = f.pz === PZ.vaChop ? PZ.vaWind3 : PZ.vaChop; V.slash(o.x, ch[1], rnd(-.6, .6), 300, '#ffffff', 12); f.kx += 25; if (cue) sfx.cut(1); }
  else { f.pz = PZ.vaDrive; f.kx = 160; V.crack(o.x, 220); V.rocks(o.x, 0, 8); if (cue) sfx.spear(2); }
  V.sparks(ch[0], ch[1], 'white', 8); V.ring(ch[0], ch[1], 120, '#ffffff', .16); shake(10);
  gush(ch[0], ch[1], s, 6, .8);
}
function filmStab(f, i) {                           // one of the nineteen: the spear through the panel on its chest
  const p = f.p, o = f.o, s = f.side, ch = chestAt(o), last = i === FLURRY.length - 1;
  f.pz = [rnd(.26, .42), 0, rnd(1.35, 1.9), rnd(.9, 1.5), .6, -.5, 0]; p.pose[0] -= .25;
  phantom(p, rnd(-30, 40), last);
  V.sparks(ch[0], ch[1], 'white', 6); V.ring(ch[0], ch[1], 110 + 8 * i, '#ffffff', .14); shake(8 + i);
  gush(ch[0], ch[1], s, 5, .9); splash(ch[0], ch[1], s, 2, .6); stain = 1;
  sfx.spear(i % 3, 1.2);                          // (on top of the track too, and loud: the user's ask, 0.11)
  if (i % 4 === 0) pop(ch[0] + rnd(-60, 60), ch[1] + rnd(120, 200), pick(['ドス', 'ザク', 'ズッ']), 46);
  if (duel() || f.mad) return;                      // (a player's game is told after; Mr. Instincto's are all at the end)
  const h = { kb: 0, stun: 9, stop: .01, col: hitCol(), fixed: 1, mute: 1 }, before = o.hp;
  E.applyHit(o, s, spare(o, h, ULT_STAB));
  f.dealt += before - o.hp;
}
function shot(f, t) {                               // where the camera is, shot by shot
  const p = f.p, s = f.side, mid = f.cx, h = headAt(p);
  if (t < .55) aim(mid, 175, 1.3);
  else if (t < 1.05) aim(p.x + s * 30, 210, lerp(2.2, 2.6, (t - .55) / .5));
  else if (t < 2.62) aim(mid, 190, 1.45, .06 * Math.sin(t * 2));
  else if (t < 4.02) aim(mid + s * 60, 200, lerp(1.45, 1.6, (t - 2.62) / 1.4), .08);
  else if (t < 4.77) aim(h[0] + s * 8, h[1], lerp(2.8, 4.6, (t - 4.02) / .75));
  else if (t < 5.0) aim(h[0] + s * 8, h[1], 5.2);
  else if (t < 5.34) aim(mid, 190, 1.6);
  else if (t < 7.22) { const n = FLURRY.filter(b => b <= t).length; if (n < 7) aim(mid, 190, 1.7); else if (n < 13) aim(f.o.x, 200, 2.2, -.05 * s); else aim(mid, 190, 1.5, .15 * s); }
  else if (t < 7.95) aim(mid, 210, 1.6);
  else if (t < 8.22) aim(h[0] + s * 8, h[1], 4);
  else aim(mid + s * 120, 190, 1.25);
}
function toScreen(x, y) {                           // a point in the world, where it is on the screen right now (the arena's own sums)
  const v = F(x, y), Zm = cam.zoom, GY = E.GY;
  return [E.VW / 2 + Zm * (v[0] - E.VW / 2), GY - 120 - cam.lift + Zm * (v[1] - (GY - 120))];
}
let tone = null;                                    // a screentone: dots, for the page
function screentone() {
  if (tone) return tone;
  const c = document.createElement('canvas'); c.width = c.height = 8;
  const x = c.getContext('2d'); x.fillStyle = 'rgba(0,0,0,.9)'; x.beginPath(); x.arc(4, 4, 1.6, 0, TAU); x.fill();
  return (tone = g.createPattern(c, 'repeat'));
}
function filmRender(dt, real) {
  const f = film;
  if (!f) { E.renderArena(real); return; }
  const t = f.t, VW = E.VW, VH = E.VH, frozen = t >= 2.62 && t < 4.02;
  E.renderArena(frozen ? 0 : real, []);
  if (frozen) {                                     // the page: white paper, a screentone, lines, and the two of them in ink and grey
    g.save();
    g.fillStyle = '#f3efe6'; g.fillRect(0, 0, VW, VH);
    g.globalAlpha = .3; g.fillStyle = screentone(); g.fillRect(0, VH * .55, VW, VH * .45); g.globalAlpha = 1;
    const c = toScreen(f.o.x, f.o.y + 170);
    g.fillStyle = 'rgba(0,0,0,.75)';
    for (let i = 0; i < 40; i++) { const an = i / 40 * TAU + .07, r0 = 160, r1 = Math.max(VW, VH), w = 3 + (i % 3) * 2; g.beginPath(); g.moveTo(c[0] + Math.cos(an) * r0, c[1] + Math.sin(an) * r0); g.lineTo(c[0] + Math.cos(an) * r1 - Math.sin(an) * w, c[1] + Math.sin(an) * r1 + Math.cos(an) * w); g.lineTo(c[0] + Math.cos(an) * r1 + Math.sin(an) * w, c[1] + Math.sin(an) * r1 - Math.cos(an) * w); g.closePath(); g.fill(); }
    g.save(); g.translate(VW / 2, E.GY - 120 - cam.lift); g.scale(cam.zoom, cam.zoom); g.translate(-VW / 2, -(E.GY - 120));
    g.filter = 'grayscale(1) contrast(1.3) brightness(1.1)'; E.drawFighter(f.o, 1); E.drawFighter(f.p, 1); drawSpear(f.p); g.filter = 'none';
    g.restore();
    g.font = "120px 'Yuji Syuku','Yu Mincho',serif"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.save(); g.translate(clamp(c[0] - 80, 160, VW - 160), clamp(c[1] + 160, VH * .3, VH * .74)); g.rotate(-.18); g.lineWidth = 26; g.strokeStyle = '#f3efe6'; g.strokeText('ドンッ', 0, 0); g.fillStyle = '#000'; g.fillText('ドンッ', 0, 0); g.restore();
    g.lineWidth = 9; g.strokeStyle = '#000'; g.strokeRect(VW * .03, VH * .13, VW * .94, VH * .74);
    g.fillStyle = '#fff'; g.fillRect(VW * .05, VH * .16, 150, 46); g.lineWidth = 3; g.strokeRect(VW * .05, VH * .16, 150, 46);
    g.fillStyle = '#000'; g.font = "30px 'Yuji Syuku','Yu Mincho',serif"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('最終話', VW * .05 + 75, VH * .16 + 24);
    g.restore();
  }
  if (t >= 8.22) {                                  // the last of it, in red: the two of them black against it
    const c = toScreen(f.o.x, f.o.y + 170 * (f.o.scale || 1)), gr = g.createRadialGradient(c[0], c[1], 10, c[0], c[1], Math.max(VW, VH));
    gr.addColorStop(0, '#ffe2e2'); gr.addColorStop(.1, '#ff2a3a'); gr.addColorStop(.55, '#8f0517'); gr.addColorStop(1, '#250006');
    g.save(); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
    g.fillStyle = '#000';
    for (let i = 0; i < 56; i++) { const an = i / 56 * TAU + Math.sin(i * 7.7) * .05, r0 = 90 + (i * 37 % 120), r1 = Math.max(VW, VH) * 1.2, w = 2 + (i % 4) * 3; g.beginPath(); g.moveTo(c[0] + Math.cos(an) * r0, c[1] + Math.sin(an) * r0); g.lineTo(c[0] + Math.cos(an) * r1 - Math.sin(an) * w, c[1] + Math.sin(an) * r1 + Math.cos(an) * w); g.lineTo(c[0] + Math.cos(an) * r1 + Math.sin(an) * w, c[1] + Math.sin(an) * r1 - Math.cos(an) * w); g.closePath(); g.fill(); }
    g.translate(VW / 2, E.GY - 120 - cam.lift); g.scale(cam.zoom, cam.zoom); g.translate(-VW / 2, -(E.GY - 120));
    g.filter = 'brightness(0)'; E.drawFighter(f.o, 1); E.drawFighter(f.p, 1); drawSpear(f.p); g.filter = 'none';
    g.restore();
  }
  const flash = t < .1 ? 1 - t / .1 : t > 2.62 && t < 2.72 ? 1 - (t - 2.62) / .1 : t > 8.22 && t < 8.32 ? 1 - (t - 8.22) / .1 : 0;
  if (flash > 0) { g.fillStyle = `rgba(255,255,255,${.8 * flash})`; g.fillRect(0, 0, VW, VH); }
}
function endFilm() {                                // the page turns back, and then the damage: all of it
  const f = film;
  film = null;
  E.setScene(null); E.root.classList.remove('cine');
  cam.lift = 0; cam.zoom = 1; cam.yaw = 0;
  const p = f.p, o = f.o, s = f.side;
  if (p.move) E.endMove(p);
  p.skin = f.skin; p.inv = .6; p.y = 0; p.ground = true; p.spin = 1; p.pose = POSE.idle.slice();
  panel = null; card = null;
  o.x = clamp(p.x + s * 230, -940, 940); o.y = 0; o.ground = true; o.state = 'hurt'; o.stun = .5; o.pose = POSE.hurt.slice();
  if (o.ko) return;
  sfx.spear(3); shake(36); E.zoomIn(.4);
  const h = { kb: 1500, lift: 760, stun: 1, stop: .22, heavy: 1, col: hitCol(), fixed: 1, mute: 1, flung: 1 };
  if (f.mad) { Object.assign(h, { dmg: ONE, kill: 1 }); E.applyHit(o, s, h); if (o.ko) carnage(o); return; }
  if (duel()) {                                     // a player: three hundred, in two (no single blow in a duel may take more than two fifths)
    E.applyHit(o, s, Object.assign({}, h, { dmg: ULT_HURT / 2, kb: 300, lift: 0, flung: 0 }));
    E.after(.16, () => { if (!o.ko) E.applyHit(o, s, Object.assign({}, h, { dmg: ULT_HURT / 2 })); });
    return;
  }
  const boss = !!(o.ai && o.ai.d && o.ai.d.kit), pw = (o.dr || 1) * (H.power ? H.power(h, o) : 1);
  h.dmg = (boss ? Math.max(1, ULT_HURT - f.dealt) : o.hp + 1) / pw;      // a boss: the rest of the three hundred. Anything else: all it has
  E.applyHit(o, s, h);
  gush(o.x, o.y + 170, s, 26, 1.3); lens(3, true); pool(o.x, 220);
}

const SOON = { name: 'Coming soon', cd: 1, dur: .01, run() {} };
const MOVES = {
  // 1 — Catastrophe
  strikes: { name: 'Catastrophe', cd: 9, dur: 99, glow: 'gold', run(p, m, t) {
    const o = E.P2, f = p.face, gap = (o.x - p.x) * f;
    if (m.mad === undefined) { m.mad = mad(); m.N = m.mad ? MN : N; }
    p.rate = 60;
    if (t < WIND) {                                 // the spear drawn back, and in he comes
      p.target = PZ.vaWind4; p.vx = gap > 210 && gap < 560 ? f * 1100 : 0;
      if (!m.c) { m.c = 1; m.n = 0; sfx.charge(); shout(p, '大惨事', m.mad ? MADRED : GOLD); lines(p, m, WIND + m.N * EVERY + .15); }
      return;
    }
    const end = WIND + m.N * EVERY, due = Math.min(m.N, Math.floor((t - WIND) / EVERY) + 1);
    while (m.n < due) stab(p, m, ++m.n);
    if (m.n < m.N || t < end) { p.target = m.pz || PZ.vaThrust1; p.vx = gap > 215 ? f * 300 : 0; if (m.mad) p.inv = Math.max(p.inv, .3); return; }
    p.vx = 0; p.target = t < end + .14 ? PZ.vaLunge : POSE.idle;
    if (t > end + .4) E.endMove(p);
  } },
  // 2 — Broil
  crush: { name: 'Broil', cd: 12, dur: 99, glow: 'gold', run(p, m, t) {
    const o = E.P2, f = p.face, gap = (o.x - p.x) * f;
    if (m.mad === undefined) m.mad = mad();
    p.rate = 46;
    if (m.got === undefined) {
      if (t < .22) {                                // drawn back, and closing in
        p.target = PZ.vaWind4; p.vx = gap > 215 && gap < 480 ? f * 1100 : 0;
        if (!m.c) { m.c = 1; m.after = E.T - afterAt < AFTER_T; afterAt = -9; sfx.charge(); shout(p, '炙り', m.mad ? MADRED : GOLD); }      // (straight after Echart's payback: harder)
        return;
      }
      p.target = PZ.vaLunge; p.vx = t < .28 ? f * 520 : 0;
      if (!m.sw) { m.sw = 1; sfx.cut(1.6); jab(p, true, PZ.vaLunge, m.mad ? '255,36,64' : RGB); }
      const h = { reach: 262, kb: 0, stun: 1.6, stop: .16, heavy: 1, col: hitCol(), fixed: 1, mute: 1 };
      if (m.mad) spare(o, h, 40); else h.dmg = exact(o, BROIL[0] + (m.after ? AFTER : 0));
      if (t < .32 && !o.ko && E.tryHit(p, h)) { m.got = t; skewer(p, o, m); if (m.mad) flashBlack(o.x, o.y + 168 * (o.scale || 1), true); return; }
      if (t > .66) { p.target = POSE.idle; if (t > .84) E.endMove(p); }       // nothing on the end of it
      return;
    }
    const u = t - m.got;
    p.vx = 0;
    if (m.mad) {                                    // Mr. Instincto: into the floor with it, and then a hundred and fifty
      p.inv = Math.max(p.inv, .5);
      if (o.ko && (m.k || 0) < GROUND) { p.target = POSE.idle; if (u > .5) E.endMove(p); return; }
      if (u < .14) { p.target = PZ.vaLunge; return; }
      if (u < .5) { p.target = POSE.kick; p.rate = 60; if (!m.kicked) { m.kicked = 1; kickDown(p, o); } return; }
      const due = Math.min(GROUND, Math.floor((u - .5) / EVERY) + 1);
      while ((m.k || 0) < due) groundStab(p, o, m, m.k = (m.k || 0) + 1);
      if ((m.k || 0) < GROUND) { pin(o); p.target = m.pz || PZ.vaDrive; p.rate = 70; return; }
      p.target = u < .5 + GROUND * EVERY + .3 ? PZ.vaDrive : POSE.idle;
      if (u > .5 + GROUND * EVERY + .6) E.endMove(p);
      return;
    }
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
    if (m.mad === undefined) m.mad = mad();
    p.vx = 0; p.rate = 44;
    if (m.got !== undefined) {                      // caught something
      const u = t - m.got;
      if (u < .12) { p.target = PZ.vaParry; return; }
      if (!m.paid) { m.paid = 1; payBack(p, m); }
      p.target = u < .4 ? (m.mad ? PZ.vaThrust2 : PZ.vaLunge) : POSE.idle;
      if (u > .55) E.endMove(p);
      return;
    }
    if (!m.c) { m.c = 1; sfx.charge(); shout(p, 'ECHART', m.mad ? MADRED : GOLD); }
    if (t < WINDOW) { p.target = PZ.vaParry; if (!o.ko) p.face = o.x >= p.x ? 1 : -1; return; }
    p.target = POSE.idle;                           // nothing came: the stance drops
    if (t > WINDOW + .25) E.endMove(p);
  } },
  // 4 — Stronde: the panel, thrown (the second 4, and Mr. Instincto's third, are taken in H.press)
  manji: { name: 'Stronde', cd: 12, dur: .55, glow: 'gold', run(p, m, t) {
    p.vx = 0; p.rate = 50; p.target = t < .12 ? PZ.vaWind2 : t < .32 ? PZ.vaThrust2 : POSE.idle;
    if (t < .12 || m.s) return;
    m.s = 1; throwCard(p);
  } }
};
// Echart, while it waits: a ring round him for the time it has left. The Final Chapter's stance: the same, bigger, and gold all through
function drawRing(p, u, r, col) {
  const c = F(p.x, p.y + 180), k = c[2];
  g.save(); g.lineCap = 'round';
  g.strokeStyle = 'rgba(8,6,14,.7)'; g.lineWidth = 7 * k; g.beginPath(); g.arc(c[0], c[1], r * k, 0, TAU); g.stroke();
  lit(() => { g.strokeStyle = `rgba(${col},.9)`; g.lineWidth = 4 * k; g.beginPath(); g.arc(c[0], c[1], r * k, -Math.PI / 2, -Math.PI / 2 + TAU * u); g.stroke(); });
  g.restore();
}

JU.tech.add('vengeful', { name: 'Vengeful Artist', jp: '復讐の画家', mark: '筆', who: 'G Warstaff', odds: 2.5, col: GOLD, glow: 'gold', moves: MOVES,
  limited: ENDS, gore: true, skin: ARTIST, as: ['Vengeful Artist', '画家'], m1, awaken, awkKeep: true, awkName: 'Final Chapter',
  hint: '<b>F</b> dodges · <b>3</b>→<b>2</b> +20 · <b>4</b> panel, <b>4</b> again: they dash · <b>G</b> with a panel on them' });
// Mr. Instincto: the team's, and nobody else's (admin: shop.js lets nobody else hold him, and he is never rolled, sold or shown)
JU.tech.add('instincto', { name: 'Mr. Instincto', jp: '本能', mark: '狂', who: 'Admin only', odds: 0, col: MADRED, glow: 'red', moves: MOVES,
  admin: true, gore: true, skin: ARTIST, as: ['Mr. Instincto', '本能'], m1, awaken, awkKeep: true, awkName: 'Final Chapter',
  hint: 'Nothing hits him · every move kills · <b>4</b>, <b>4</b>, <b>4</b>: the head' });
DEF = JU.tech.TECH.vengeful; MDEF = JU.tech.TECH.instincto;

/* ---------- wiring ---------- */
let primed = false;
function prime() { if (!primed) { primed = true; sfx.preload(SOUNDS); } }     // his sounds, if this copy has them
const hit0 = H.hit, moveFx0 = H.moveFx, tick0 = H.tick, fx0 = H.fx, under0 = H.under, post0 = H.post, reset0 = H.reset, start0 = H.fightStart;
const guard0 = H.guard, pre0 = H.playerPre, rim0 = H.rim, pow0 = H.power, fpow0 = H.foePower, press0 = H.press;
H.hit = (o, face, h) => { hit0(o, face, h); if (h.flung && o === E.P2 && !o.poise && !o.ko && !duel()) launch(o); };
H.moveFx = (p, m) => {
  if (moveFx0) moveFx0(p, m);
  if (p !== E.P1 || !m.def.va) return;
  if (m.sw && !m.fx) { m.fx = 1; if (m.def.pose && m.i !== 2) jab(p, m.i === 3, PZ[m.def.pose], m.mad ? '255,36,64' : RGB); }      // (the third is a cut, and the engine's swing is drawn for it)
  if (m.done && !m.snd) { m.snd = 1; landed(p, m); }
};
// a blow arriving: the Final Chapter's counter, or Echart, catches it; Mr. Instincto is never there; failing that the guard is a dodge;
// failing that, whatever anybody else's guard would do
H.guard = (face, a, mul = 1) => {
  const p = E.P1;
  if (film) return true;
  if (on() && !p.dead) {
    const m = p.move;
    if (m && m.def === ULT) { if (panelOn(E.P2)) roll(p); else E.endMove(p); return true; }
    if (caught(p, m, face, a)) return true;
    if (mad()) return dodge(p, face, true);
    if (guardUp() && p.face === -face && !a.pierce && !a.brk && !(a.dmg >= 9000)) return dodge(p, face);      // (a block breaker is not dodged: it breaks the guard, block.js)
  }
  return guard0 ? guard0(face, a, mul) : false;
};
H.press = (a, inScene) => {
  const p = E.P1, m = p.move;
  if (!inScene && on()) {
    if (a === 'crush' && m && m.def === MOVES.div && m.paid && E.cd.crush <= 0) {      // straight out of Echart's payback into Broil: it does not wait for the stance to drop
      E.endMove(p); E.cd.crush = E.CD.crush; p.move = { def: MOVES.crush, key: 'crush', t: 0 }; E.hud.mv.crush.classList.add('act');
      return true;
    }
    if (a === 'manji' && panelOn(E.P2) && free(p)) {      // Stronde again, with the panel on them
      if (mad() && panel.dashed) { behead(E.P2); return true; }
      if (!panel.dashed || E.cd.manji <= 0) { force(p); return true; }
    }
  }
  return press0 ? press0(a, inScene) : false;
};
H.playerPre = (p, o, dt) => { const r = pre0 ? pre0(p, o, dt) : false; if (r && on() && guardUp() && !p.ps) p.target = PZ.vaGuard; return r; };      // (block.js holds him behind it; this is how he stands there)
H.ownGuard = p => on();                             // (block.js does not draw its arcs for him)
H.rim = f => {                                      // the moment he settles from a dodge, when a blow would catch him, he is lit white; Mr. Instincto is lit red, always
  const since = E.T - dodgeAt;
  if (film && f === film.p) return { col: 'rgba(255,255,255,.95)', blur: 16 };
  if (f === E.P1 && on()) {
    if (mad()) return { col: '#ff1f3d', blur: 9 + 3 * Math.sin(E.T * 6) };
    if (since > OPEN[0] - .05 && since < OPEN[1]) return { col: '#ffffff', blur: 14 };
  }
  return rim0 ? rim0(f) : null;
};
H.power = (h, o) => (pow0 ? pow0(h, o) : 1) * (o === E.P2 && !duel() ? 1 + BLEED_MORE * stacks(bleed) : 1);      // bleeding: everything lands harder
H.foePower = a => (fpow0 ? fpow0(a) : 1) * (1 + BLEED_MORE * stacks(mine));      // (and on me, when it is me who is bleeding)
H.tick = dt => {
  tick0(dt);
  const p = E.P1;
  if (stain > 0) {
    stain = Math.max(0, stain - dt * .06);
    if (Z && gore() && stain > .3 && SPEARMEN.has(p.skin) && Math.random() < dt * 8 * stain * GK()) { const q = grip(p).at(TIP - 4); Z.emit(4, q[0], q[1], rnd(-30, 30), rnd(-60, 20), rnd(2, 4), 2, BRGB, { g: 1600, land: 'blood' }); }      // dripping off the point
  }
  if (fly) flight(dt);
  if (card) flyCard(dt);
  if (forced) shove(dt);
  if (ultCd > 0) ultCd -= dt;
  if (panel && (E.T >= panel.until || panel.o !== E.P2 || panel.o.ko)) panel = null;
  fountains(dt);
  for (let i = headless.length - 1; i >= 0; i--) { const e = headless[i]; if (e.o !== E.P2 || (!e.o.ko && e.o.hp > 0 && e.o.state !== 'down')) { e.o.skin = e.skin; headless.splice(i, 1); } }      // (the training curse gets up with its head back)
  if (mad() && !p.dead) { p.hp = p.max; if (Fi.fight) Fi.fight.floor = Math.max(Fi.fight.floor || 0, 1); }      // Mr. Instincto: nothing he could be hit by gets through, and nothing else counts either
  bleeding(dt);
};
H.under = dt => { under0(dt); drawShades(dt); };
H.fx = dt => {
  fx0(dt);
  for (const f of [E.P2, E.P1]) if (SPEARMEN.has(f.skin) && !(f.alpha < .05)) drawSpear(f);
  const p = E.P1, m = p.move, o = E.P2;
  if (panelOn(o)) drawPanel(o);
  if (card) drawCard();
  drawHoles(dt);
  if (on() && m && m.def === MOVES.div && m.got === undefined && m.t < WINDOW) drawRing(p, 1 - m.t / WINDOW, 150, RGB);
  if (on() && m && m.def === ULT) drawRing(p, 1 - m.t / ULT_WAIT, 200 + 10 * Math.sin(E.T * 14), '255,210,61');
  drawBleed(o, bleed); drawBleed(p, mine);
};
H.post = dt => { if (post0) post0(dt); drawLens(typeof dt === 'number' ? dt : 1 / 60); };
const clear = () => {
  if (film) { film = null; E.root.classList.remove('cine'); }
  for (const e of headless) e.o.skin = e.skin;
  fly = card = forced = panel = null; stain = 0; bleed = []; mine = []; paidAct = paidMove = null; dodgeAt = afterAt = -9; ultCd = 0;
  shades.length = splats.length = founts.length = holes.length = headless.length = 0;
};
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); clear(); if (on()) prime(); };

JU.vengeful = { fx: { gush, pool, lens, pop, splash, blood }, wound, launch, ARTIST, ENDS,      // (fx, wound and launch: Miracle Dork's blood, bleed and ragdoll are these)
  MOVES, SPEAR, MSPEAR, UP, DOWN, ULT, N, MN, GROUND, OPEN, WINDOW, BLEED: [BLEED_HP, BLEED_MORE, BLEED_T], M1_DMG, STAB, BROIL, COUNTER, AFTER, FLURRY, FILM_T, ULT_HURT,
  get stain() { return stain; }, get fly() { return fly && { x: Math.round(fly.o.x), wall: fly.wall, hops: fly.hops, down: fly.down }; },
  get bleed() { return stacks(bleed); }, get mine() { return stacks(mine); }, get splats() { return splats.length; }, get dodgeAt() { return dodgeAt; },
  get panel() { return panel && { left: +(panel.until - E.T).toFixed(1), dashed: panel.dashed }; }, get card() { return !!card; }, get film() { return film && { t: +film.t.toFixed(2), dealt: film.dealt, heard: film.heard }; },
  get mad() { return mad(); }, get headless() { return headless.length; } };
})();
