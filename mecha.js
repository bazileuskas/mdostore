/* JUJUTSU UNLIMITEDS — Build 0.30: MECHAMASTER (Early Access), the user's. Puppetry: he is a puppet himself, worked from somewhere else, and
   he has more of them.
     1 MECHANICAL BARRAGE   both arms out on their pistons, a run of punches, and a piston-driven uppercut to finish (8 x 3, 16)
     2 ULTRA CANNON         energy gathered in his palm and let go as a beam that bursts where it lands (30, and 15 round it)
     3 STEEL PROPULSION     thrusters, across at them, hold of them, up, and down into the floor with them (35)
     4 PUPPET BREAKER       his arm fired out on its cable, them pulled back in on it, and one punch with all of it behind it (40)
     E SUPER CHARGE         (the user's, in place of the Jet Boost the list had: "ignore the e special here") blue all round him for nine
                            seconds and a puppet out beside him. A move pressed while it lasts, the puppet does it, and its wait is not
                            spent. The puppet's Steel Propulsion is its own: "the mecha kicks him into the air, spins him and throws the
                            enemy towards you" (12, 20)
     G ULTIMATE MECHAMASTER: ABSOLUTE   the fists together, the floor shaking, a puppet the size of a building up out of it, and him into its
                            cockpit. Its energy is all it has: 100, running down as it stands and spent by everything it does (the user's
                            idea). Its own four and its own E:
                            1 PIGEON VIOLA (20)        six that find them and burst (6 x 12)
                            2 ABSOLUTE CANNON (30)     a beam from its arm swept along the floor, and the floor going up under it (10 x 8, 30)
                            3 STEEL CATACLYSM (25)     up, and down with both fists: a shock the whole floor feels (90 close, 30 further)
                            4 SEVENTEEN YEARS (50)     everything stored up, let go round them at once (200)
                            E EMERGENCY THRUSTERS (10) full burn forward through whatever is in the way (40)
                            Its armour takes half of every blow, and nothing staggers it. Empty (or after 45 seconds), it powers down and
                            he climbs out
   Build 0.30v1, the user's: he looks like the regular Yuji now (no puppet's body of his own; the giant still has him in its cockpit),
   every move is orange (blue is left to Super Charge's aura, as their list had it), Ultra Cannon and Puppet Breaker reach them ragdolled
   (on the floor or flung), and Ultra Cannon held charges for up to 1.3 s into a longer, wider beam (45 to 80 by the charge; a tap is 45)
   The game calls him what the technique is called, Mechamaster; the character's own name is left to the series */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, T = JU.tech, X = JU.bossfx, C = JU.cast;
const { rnd, lerp, clamp, ease } = E, TAU = Math.PI * 2, SLOTS = T.SLOTS;
const CYAN = '#7fd8ff', CRGB = '127,216,255', GOLD = '#ffc94a', GRGB = '255,201,74', FIRE = '255,140,60', WHITE = '255,255,255';
const ORANGE = '#ff8a2a', ORGB = '255,138,42';      // (every move's colour since 0.30v1, the user's. Blue is Super Charge's aura; gold, the giant's own)
const play = (name, vol, alt, rate = 1) => { if (!sfx.file(name, vol, rate)) alt(); };      // the clip (at home ours, online from where it is posted), or a built sound
sfx.preload(['home-tdc-beam', 'home-tdc-charge', 'home-tdc-shoot', 'home-tdc-boom', 'home-tdc-sweep']);
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const live = o => !!o && !o.ko && !(o.alpha < 1);
const can = o => live(o) && !(o.inv > 0) && o.state !== 'down' && o.state !== 'up';
const canR = o => live(o) && !(o.inv > 0) && o.state !== 'up';      // (and ragdolled too: flat on the floor, or flung. Ultra Cannon's and Puppet Breaker's, the user's)
const holdable = o => live(o) && !duel() && !o.net && !o.poise;
const exact = (o, n) => n / (o.dr || 1);
const hs = o => o.scale || 1;
const mid = o => o.y + 170 * hs(o);
const bound = () => (H.bound ? H.bound() : 965);
const facing = (f, o) => { if (live(o)) f.face = o.x >= f.x ? 1 : -1; };
const gapOf = (f, o) => (live(o) ? (o.x - f.x) * f.face : 9999);
const label = (x, y, text, col = CYAN, life = 1.1) => E.fx.push({ k: 2, x, y, n: text, col, t: 0, life });
const big = (p, o, word, col = ORANGE, kind = 'bw') => { if (JU.ms) JU.ms.bigHit(p, o, word, col, kind); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
// where a hand is, for whoever is that size (E.hand counts the rig at its own size)
const fist = (f, front) => { const h = E.hand(f, front), s = hs(f); return [f.x + (h[0] - f.x) * s, f.y + (h[1] - f.y) * s]; };
// a blow of his (or his puppet's) on them wherever they are, worth exactly what it says; and one in front, in reach, the engine's own way
function hit(o, face, dmg, more, any) { if (!(any ? canR : can)(o)) return false; E.applyHit(o, face, Object.assign({ dmg: exact(o, dmg), kb: 200, stun: .6, stop: .06, col: ORANGE, fixed: 1 }, more)); return true; }
const reach = (f, r, dmg, more) => { const o = E.P2; return live(o) && E.tryHit(f, Object.assign({ reach: r, dmg: exact(o, dmg), kb: 200, stun: .6, stop: .06, col: ORANGE, fixed: 1 }, more)); };
// the end of a move, whoever was doing it: the engine's for him, the puppet's own for it
const done = (f, m) => { if (f === E.P1) E.endMove(f); else m.end = 1; };

/* ================= what they look like ================= */
const PLATE = '#d8dde4', EYE = '#ffd24a';
let charged = false;                                  // (the core in his chest burns brighter while Super Charge runs)
const pistons = (w, h) => { g.fillStyle = '#a3acb8'; g.fillRect(-w / 2, h * .57, w, 3.2); g.fillRect(-w / 2, h * .66, w, 2.2); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-w / 2 + 3, h * .1, 2, h * .44); };
const MECHA = {
  torso: ['#4a505c', '#5d6573'],
  armF: ['#4a505c', '#5d6573', '#2c3038', '#363b45', .36, pistons], armB: ['#3a3f49', '#474d58', '#22252c', '#2b2f37', .36, pistons],
  legF: ['#4a505c', '#5d6573', '#2c3038', '#363b45', .24], legB: ['#3a3f49', '#474d58', '#22252c', '#2b2f37', .24],
  chest() {
    g.fillStyle = PLATE; g.beginPath(); g.moveTo(-2, -TOR + 4); g.lineTo(28, -TOR + 4); g.lineTo(28, -32); g.lineTo(13, -24); g.lineTo(-2, -32); g.closePath(); g.fill();      // the chest plate
    g.strokeStyle = 'rgba(30,34,42,.55)'; g.lineWidth = 1.6; g.stroke();
    g.fillStyle = '#23262d'; g.beginPath(); g.arc(13, -52, 7.5, 0, TAU); g.fill();                                                   // the core
    g.fillStyle = charged ? '#bff6ff' : '#5fb8d8'; g.beginPath(); g.arc(13, -52, 4.4, 0, TAU); g.fill();
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-30, -18, 60, 3.5); g.fillRect(-30, -7, 60, 2);
    g.fillStyle = '#8c95a1'; for (const [x, y] of [[0, -TOR + 9], [25, -TOR + 9], [2, -36], [24, -36]]) { g.beginPath(); g.arc(x, y, 1.6, 0, TAU); g.fill(); }      // rivets
  },
  back() {                                            // a pack of thrusters on his back
    g.fillStyle = '#3a3f49'; g.beginPath(); g.roundRect(-42, -TOR + 6, 15, 42, 4); g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
    g.fillStyle = '#16181d'; g.fillRect(-41, -TOR + 44, 13, 7);
  },
  head() {
    E.headBase('#4a505c', '#5d6573');
    g.fillStyle = PLATE; g.fillRect(-20, -24, 40, 5);                                                                               // a ridge over the top
    g.fillStyle = '#17191e'; g.beginPath(); g.roundRect(-2, -13, 26, 27, 6); g.fill();                                              // the faceplate
    g.fillStyle = EYE; g.beginPath(); g.arc(6, -3, 3.8, 0, TAU); g.fill(); g.beginPath(); g.arc(17, -3, 3.3, 0, TAU); g.fill();
    g.fillStyle = '#7a5a10'; g.beginPath(); g.arc(6.7, -3, 1.4, 0, TAU); g.fill(); g.beginPath(); g.arc(17.5, -3, 1.2, 0, TAU); g.fill();
    g.strokeStyle = '#6c7482'; g.lineWidth = 1.6; g.beginPath(); for (let i = 0; i < 4; i++) { g.moveTo(3 + i * 5, 7); g.lineTo(3 + i * 5, 12); } g.stroke();      // the grille
    g.fillStyle = '#9aa3b0'; g.beginPath(); g.arc(-12, 0, 7, 0, TAU); g.fill(); g.lineWidth = 2; g.strokeStyle = LINE; g.stroke();  // an ear-disc
    g.fillStyle = '#5d6573'; g.beginPath(); g.arc(-12, 0, 3, 0, TAU); g.fill();
    g.strokeStyle = LINE; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-14, -20); g.lineTo(-18, -35); g.stroke();                     // and an aerial
    g.fillStyle = '#ff5a3c'; g.beginPath(); g.arc(-18, -36, 3, 0, TAU); g.fill();
  }
};
// the puppet Super Charge puts out: lighter, smaller, one great eye
const PUPPET = Object.assign({}, MECHA, {
  torso: ['#7a828e', '#919aa6'],
  armF: ['#7a828e', '#919aa6', '#4e555f', '#5c6470', .36, pistons], armB: ['#646b76', '#757d89', '#3c424b', '#474e58', .36, pistons],
  legF: ['#7a828e', '#919aa6', '#4e555f', '#5c6470', .24], legB: ['#646b76', '#757d89', '#3c424b', '#474e58', .24],
  chest() { g.fillStyle = '#c9ced6'; g.fillRect(2, -TOR + 6, 24, 30); g.fillStyle = '#2a2e36'; g.beginPath(); g.arc(14, -50, 6, 0, TAU); g.fill(); g.fillStyle = '#bff6ff'; g.beginPath(); g.arc(14, -50, 3.4, 0, TAU); g.fill(); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-30, -16, 60, 3); },
  back() {},
  head() {
    E.headBase('#7a828e', '#919aa6');
    g.fillStyle = '#17191e'; g.beginPath(); g.roundRect(0, -11, 22, 20, 8); g.fill();
    g.fillStyle = '#bff6ff'; g.beginPath(); g.arc(11, -1, 5.6, 0, TAU); g.fill(); g.fillStyle = '#2f9fe0'; g.beginPath(); g.arc(12, -1, 2.4, 0, TAU); g.fill();
    g.fillStyle = '#b9c0ca'; g.beginPath(); g.arc(-12, 1, 6, 0, TAU); g.fill(); g.lineWidth = 2; g.strokeStyle = LINE; g.stroke();
  }
});
// the giant one: black and gold, its cockpit in its chest with him in it
const cannonArm = (w, h) => { g.fillStyle = '#b08a2a'; g.fillRect(-w / 2, h * .55, w, 4); g.fillStyle = '#0c0d10'; g.beginPath(); g.ellipse(0, h - 2, w * .3, 4, 0, 0, TAU); g.fill(); };
const ABSOLUTE = {
  torso: ['#20232b', '#2c3039'],
  armF: ['#2c3039', '#383d48', '#16181d', '#1f2228', .32, cannonArm], armB: ['#1e2128', '#282c34', '#101114', '#16181c', .32, cannonArm],
  legF: ['#2c3039', '#383d48', '#16181d', '#1f2228', .2], legB: ['#1e2128', '#282c34', '#101114', '#16181c', .2],
  chest() {
    g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.moveTo(-4, -TOR + 4); g.lineTo(13, -30); g.lineTo(30, -TOR + 4); g.stroke();      // a V of gold down the front
    g.fillStyle = '#0d1a22'; g.beginPath(); g.roundRect(-27, -60, 22, 22, 7); g.fill();                                                         // the cockpit, in the side of it (the arm would hide it on the front)
    g.fillStyle = 'rgba(127,216,255,.38)'; g.beginPath(); g.roundRect(-25.5, -58.5, 19, 19, 6); g.fill();
    g.fillStyle = '#1b2033'; g.fillRect(-21, -45, 10, 5.5); g.fillStyle = '#c4142c'; g.fillRect(-21, -45, 10, 2);                              // him at the controls: the jacket and its red hood,
    g.fillStyle = '#e8b992'; g.beginPath(); g.arc(-16, -48.6, 3.6, 0, TAU); g.fill();                                                              // his face,
    g.fillStyle = '#f08ea6'; g.beginPath(); g.moveTo(-19.8, -49.4); g.lineTo(-19, -54); g.lineTo(-17.5, -51.8); g.lineTo(-16, -55.6); g.lineTo(-14.5, -51.8); g.lineTo(-13, -53.6); g.lineTo(-12.4, -49.4); g.closePath(); g.fill();      // and the pink of his hair
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-24, -44); g.lineTo(-22, -46.5); g.stroke();             // (the glass, catching the light)
    g.lineWidth = 1.8; g.strokeStyle = GOLD; g.beginPath(); g.roundRect(-27, -60, 22, 22, 7); g.stroke();
    g.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < 3; i++) g.fillRect(-26, -34 + i * 7, 18, 3);                                           // vents
    g.fillStyle = GOLD; for (const [x, y] of [[-24, -TOR + 8], [27, -TOR + 8], [-24, -14], [27, -14]]) { g.beginPath(); g.arc(x, y, 1.8, 0, TAU); g.fill(); }
  },
  back() {                                            // a pauldron over the shoulder, and two nozzles on the back
    g.fillStyle = '#2c3039'; g.beginPath(); g.moveTo(-34, -TOR - 4); g.quadraticCurveTo(-12, -TOR - 16, 6, -TOR - 2); g.lineTo(2, -TOR + 22); g.lineTo(-36, -TOR + 22); g.closePath(); g.fill();
    g.lineWidth = 3; g.strokeStyle = LINE; g.stroke(); g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.moveTo(-32, -TOR + 18); g.lineTo(0, -TOR + 18); g.stroke();
    g.fillStyle = '#16181d'; g.fillRect(-46, -TOR + 26, 12, 22); g.fillRect(-46, -TOR + 52, 12, 18); g.lineWidth = 2.5; g.strokeStyle = LINE; g.strokeRect(-46, -TOR + 26, 12, 22); g.strokeRect(-46, -TOR + 52, 12, 18);
  },
  head() {
    E.headBase('#20232b', '#2c3039');
    g.fillStyle = GOLD; g.beginPath(); g.moveTo(-2, -22); g.lineTo(-14, -44); g.lineTo(4, -26); g.lineTo(22, -44); g.lineTo(12, -22); g.closePath(); g.fill(); g.lineWidth = 2; g.strokeStyle = LINE; g.stroke();      // the crest
    g.fillStyle = '#0c0d10'; g.fillRect(-4, -8, 28, 10);                                                                                          // the visor, lit
    g.fillStyle = abs && abs.en < 25 ? '#ff6a3c' : '#ffd24a'; g.fillRect(-2, -6, 24, 5);
    g.fillStyle = '#3a3f4a'; g.fillRect(0, 6, 22, 12); g.strokeStyle = '#6c7482'; g.lineWidth = 1.4; g.beginPath(); for (let i = 0; i < 5; i++) { g.moveTo(2 + i * 4.4, 8); g.lineTo(2 + i * 4.4, 16); } g.stroke();      // the jaw
  }
};

/* ================= poses: [lean, head, armF, armB, legF, legB, rot] ================= */
const OUT = [.1, 0, 1.62, 1.52, .42, -.42, 0], UPPER = [.16, -.25, 2.95, .55, .5, -.35, 0], PALM = [.1, 0, 1.62, .5, .45, -.4, 0], PUNCH = [.5, .06, .35, 1.75, .62, -.58, 0];
const CLAP = [.05, -.1, 1.55, 1.5, .5, -.5, 0], ARMS_UP = [-.1, -.2, 2.7, 2.6, .4, -.4, 0], SLAMP = [.5, .2, .9, .85, .76, -.58, 0], HUNCH = [.3, .15, .8, .7, .7, -.6, 0];

/* ================= the thrusters: fire off his back and his feet, whoever's ================= */
function jets(f, hard) {
  if (!X) return;
  const s = hs(f), d = -f.face;
  for (let i = 0; i < (hard ? 3 : 1); i++) {
    X.emit(5, f.x + d * 40 * s, f.y + rnd(150, 230) * s, d * rnd(300, 700), rnd(-80, 80), rnd(4, 7) * s, rnd(.15, .3), Math.random() < .5 ? FIRE : '255,220,140');
    X.emit(0, f.x + d * 46 * s, f.y + 190 * s, d * 200, 0, 60 * s, .12, FIRE, { s1: .4 });
  }
  if (Math.random() < .4) X.emit(2, f.x + d * 60 * s, f.y + 40 * s, d * rnd(100, 260), rnd(20, 80), rnd(40, 70) * s, rnd(.3, .6), '180,184,192', { s1: 2, a: .4, dr: 2 });
}

/* ================= 1 — MECHANICAL BARRAGE ================= */
const PUNCH_EVERY = .065, BARR_N = 8, ARM_REACH = 360;
const BARRAGE = { name: 'Mechanical Barrage', cd: 9, dur: 1.05, glow: 'fire', run(f, m, t) {
  const o = E.P2;
  f.rate = 46; f.vx = 0;
  if (!m.s) { m.s = 1; facing(f, o); sfx.whoosh(); }
  if (t < .12) { f.target = OUT; return; }
  if (t < .12 + BARR_N * PUNCH_EVERY) {               // both arms out on their pistons, one after the other
    const n = Math.min(BARR_N, Math.floor((t - .12) / PUNCH_EVERY) + 1);
    f.target = n % 2 ? POSE.jab : POSE.cross; m.ext = t;
    while ((m.n || 0) < n) { m.n = (m.n || 0) + 1; m.pt = t; sfx.hit(false); if (reach(f, ARM_REACH * hs(f), 3, { kb: 30, stun: .5, stop: .02 })) V.sparks(o.x - f.face * 20, mid(o), 'fire', 4); }
    return;
  }
  m.ext = 0;
  f.target = t < .72 ? POSE.crushWind : t < .95 ? UPPER : POSE.idle;
  if (t < .72) { if (gapOf(f, o) > 190 * hs(f) && Math.abs(f.x + f.face * 80) < bound()) { f.vx = f.face * 1900; jets(f); } return; }      // (the piston drives him in for it)
  if (t >= .72 && !m.up) {                            // and the piston behind the last one, straight up
    m.up = 1; sfx.blast(); sfx.whoosh(); shake(16);
    const h = fist(f, true);
    if (X) for (let i = 0; i < 10; i++) X.emit(1, h[0], h[1] - 20, rnd(-220, 220), rnd(200, 700), rnd(3, 6), rnd(.25, .45), ORGB);
    if (reach(f, 250 * hs(f), 16, { kb: 100, lift: 1150, stun: 1, stop: .12, heavy: 1 })) big(f, o, 'ガシャン', ORANGE);
  }
} };
// the arms as they go out and come back (drawn in H.fx): his reach drawn out in orange cursed energy, to a fist of it
function armsOut(f, m) {
  const u = clamp((m.ext - m.pt) / PUNCH_EVERY, 0, 1), front = (m.n || 0) % 2 === 1, s = hs(f), d = Math.sin(u * Math.PI) * ARM_REACH * .85 * s;
  for (const fr of [front, !front]) {
    const h = fist(f, fr), L = fr === front ? d : d * .25, end = [h[0] + f.face * L, h[1]], a = F(h[0], h[1]), b = F(end[0], end[1]), k = a[2] * s;
    if (L > 4) ray(a, b, 7 * k, ORGB, .85);
    energyFist(b, k);
  }
}
// a fist of orange cursed energy, at a point on the screen
function energyFist(b, k, r = 1) {
  const q = k * r;
  lit(() => E.glow(E.GLOW.fire, b[0], b[1], 64 * q, .85));
  g.fillStyle = '#ff9a3c'; g.beginPath(); g.roundRect(b[0] - 12 * q, b[1] - 11 * q, 24 * q, 22 * q, 6 * q); g.fill();
  g.lineWidth = 2.4 * k; g.strokeStyle = '#6a2604'; g.stroke();
  g.fillStyle = '#ffe9cf'; g.beginPath(); g.roundRect(b[0] - 6 * q, b[1] - 5 * q, 12 * q, 10 * q, 3 * q); g.fill();
}

/* ================= 2 — ULTRA CANNON ================= */
// Tapped: gathered in the palm and let go (30, and 15 round where it lands). Held (Build 0.30v1, the user's: "make ultra cannon be holdable
// and if held will become a more powerful longer beam and make it chargeable for 1.3 seconds for the held mode"): still held when a tap
// would fire, it goes on gathering until it is let go or 1.3 s is up, and then it is a beam that stays on: longer, wider, out to the wall,
// 4 to 8 x 5 on them and 25 to 40 where it ends (45 to 80, by how long it was held). Either way it finds them where they are, ragdolled
// too: flat on the floor, or flung
const C_TAP = .55, C_FULL = 1.3;
const cannonHeld = () => E.keys.has('2') || E.keys.has('hold:crush');      // (the key, or its button on a touch screen)
const bodyY = o => (o.state === 'down' ? o.y + 40 * hs(o) : mid(o));
// which way a shot from (hx, hy) goes: at them if they are in front, wherever they are (as far up or down as maxA), level if not
function aimAt(f, hx, hy, o, maxA = .95) {
  if (!canR(o) || (o.x - f.x) * f.face < -40) return [f.face, 0];
  const a = clamp(Math.atan2(bodyY(o) - hy, Math.max(1, (o.x - hx) * f.face)), -maxA, maxA);
  return [f.face * Math.cos(a), Math.sin(a)];
}
// how far it goes along (ux, uy): as far as max, or to the wall, or to the floor
function beamEnd(hx, hy, ux, uy, max) {
  const eb = bound();
  let d = max;
  if (Math.abs(ux) > .01) d = Math.min(d, ((ux > 0 ? eb : -eb) - hx) / ux);
  if (uy < -.01) d = Math.min(d, -hy / uy);
  d = Math.max(0, d);
  return [hx + ux * d, hy + uy * d, d];
}
// whether any of them is within w of it (lying down, there is less of them to hit)
function onBeam(o, hx, hy, ux, uy, d, w) {
  if (!canR(o)) return false;
  const top = o.y + (o.state === 'down' ? 90 : 300) * hs(o), r = w + 40 * hs(o);
  for (const by of [o.y + 20, (o.y + top) / 2, top - 20]) {
    const t = clamp((o.x - hx) * ux + (by - hy) * uy, 0, d);
    if (Math.hypot(hx + ux * t - o.x, hy + uy * t - by) < r) return true;
  }
  return false;
}
// a shot's look: the boss beam when it is level, a ray of it when it is not
function shotFx(x0, y0, x1, y1, w, life) {
  if (!X) return;
  if (Math.abs(y1 - y0) < 30) { X.beam(x0, x1, y0, w, ORGB, life); return; }
  V.custom(life, u => { const a = F(x0, y0), b = F(x1, y1), q = 1 - u * u; ray(a, b, w * 1.2 * a[2] * q, ORGB, q); });
  X.flash(ORGB, .16, .2);
}
const CANNON = { name: 'Ultra Cannon', cd: 11, dur: 3.2, glow: 'fire', run(f, m, t) {
  const o = E.P2;
  f.rate = 36; f.vx = 0;
  if (!m.s) { m.s = 1; facing(f, o); play('home-tdc-charge', .6, () => { sfx.charge(); sfx.rise(.5); }); }
  const h = fist(f, true);
  if (m.fire === undefined) {                         // gathered in the palm
    f.target = PALM;
    const c = m.held ? clamp((t - C_TAP) / (C_FULL - C_TAP), 0, 1) : 0;
    if (X && Math.random() < .9) { const a = rnd(0, TAU), r = rnd(60, 170) * (1 + c); X.emit(1, h[0] + Math.cos(a) * r, h[1] + Math.sin(a) * r, -Math.cos(a) * r * 5, -Math.sin(a) * r * 5, rnd(2, 4) * (1 + c * .8), .18, ORGB); }
    if (t < C_TAP) return;
    if (m.held === undefined) {                       // still held when a tap would go: it goes on gathering
      m.held = cannonHeld();
      if (m.held) { label(f.x, f.y + 540 * hs(f), 'CHARGING', ORANGE, .8); V.ring(h[0], h[1], 130, ORANGE, .24); sfx.rise(.9); }
    }
    if (m.held && t < C_FULL && cannonHeld()) { facing(f, o); if (Math.random() < .2 + c * .4) shake(3 + c * 6); return; }
    m.fire = t;
    if (m.held) heldShot(f, m, h, clamp((t - C_TAP) / (C_FULL - C_TAP), 0, 1)); else tapShot(f, h);
    return;
  }
  const k = t - m.fire, b = m.beam;
  if (!b) { f.target = k < .35 ? PALM : POSE.idle; if (k > .65) done(f, m); return; }      // (the tapped one: and back)
  f.target = PALM;
  if (k < b.life) {                                   // the held one, on: it follows them a little, and wears them down
    const hh = fist(f, true), [ux, uy] = aimAt(f, hh[0], hh[1], o);
    b.ux = lerp(b.ux, ux, .1); b.uy = lerp(b.uy, uy, .1);
    const n = Math.hypot(b.ux, b.uy) || 1; b.ux /= n; b.uy /= n;
    const e = beamEnd(hh[0], hh[1], b.ux, b.uy, 2600); b.ex = e[0]; b.ey = e[1]; b.d = e[2]; b.hx = hh[0]; b.hy = hh[1];
    if (Math.random() < .5) shake(5 + 6 * b.c);
    if (X && Math.random() < .8) X.emit(1, b.ex, b.ey, rnd(-500, 500), rnd(100, 700), rnd(3, 6), .3, ORGB);
    const due = Math.min(b.n, Math.floor(k / (b.life / b.n)) + 1);
    while (b.i < due) { b.i++; if (onBeam(o, hh[0], hh[1], b.ux, b.uy, b.d, b.w) && hit(o, f.face, 5, { kb: 160, lift: 240, stun: .6, stop: .02, mute: b.i % 2 === 0 ? 1 : 0 }, true)) b.hits++; }
    return;
  }
  if (!b.done) {                                      // and where it ends, it bursts
    b.done = 1;
    const on = onBeam(o, b.hx, b.hy, b.ux, b.uy, b.d, b.w + 40), ex = on ? o.x : b.ex, ey = on ? bodyY(o) : b.ey;
    if (X) { X.boom(ex, ey, lerp(150, 230, b.c), ORGB, { n: 26, hot: WHITE, flash: .25 }); X.shock(ex, 700, ORGB, .5, 12); }
    E.addBlast(ex, ey, ORGB, 520); V.crack(ex, 260); sfx.blast(); sfx.rough(.9); shake(30);
    if ((on || (canR(o) && Math.abs(o.x - ex) < 220 + 40 * hs(o) && Math.abs(bodyY(o) - ey) < 360)) && hit(o, o.x >= f.x ? 1 : -1, b.burst, { kb: lerp(700, 1100, b.c), lift: lerp(500, 760, b.c), stun: 1.1, stop: .18, heavy: 1, flung: b.c >= 1 ? 1 : 0 }, true)) big(f, o, 'ドォン', ORANGE, 'neg');
  }
  f.target = k < b.life + .3 ? PALM : POSE.idle;
  if (k > b.life + .45) done(f, m);
} };
// tapped: the beam, and where it lands it bursts (30, and 15 round it)
function tapShot(f, h) {
  const o = E.P2, [ux, uy] = aimAt(f, h[0], h[1], o), [x1, y1, d] = beamEnd(h[0], h[1], ux, uy, 1400), on = onBeam(o, h[0], h[1], ux, uy, d, 22 * hs(f));
  const ex = on ? o.x : x1, ey = on ? bodyY(o) : y1;
  play('home-tdc-shoot', .8, () => sfx.cannon()); shake(18);
  shotFx(h[0], h[1], ex, ey, 22 * hs(f), .35); if (X) X.flash(WHITE, .18, .14);
  if (on) hit(o, f.face, 30, { kb: 650, lift: 380, stun: 1, stop: .14, heavy: 1 }, true);
  E.after(.08, () => {
    if (X) X.boom(ex, ey, 110, ORGB, { n: 18, hot: WHITE }); E.addBlast(ex, ey, ORGB, 300); sfx.blast();
    const q = E.P2; if (canR(q) && Math.abs(q.x - ex) < 200 + 40 * hs(q) && Math.abs(bodyY(q) - ey) < 400) hit(q, q.x >= ex ? 1 : -1, 15, { kb: 500, lift: 300, stun: .8, stop: .08 }, true);
  });
}
// held: the long one, as strong as it was charged (c, 0 to 1)
function heldShot(f, m, h, c) {
  const o = E.P2, [ux, uy] = aimAt(f, h[0], h[1], o);
  m.beam = { c, ux, uy, hx: h[0], hy: h[1], ex: h[0], ey: h[1], d: 0, life: lerp(.45, .9, c), w: lerp(28, 46, c) * hs(f), n: Math.round(lerp(4, 8, c)), burst: Math.round(lerp(25, 40, c)), i: 0, hits: 0 };
  play('home-tdc-beam', .9, () => sfx.cannon()); sfx.blast(); shake(26); E.zoomIn(.2);
  label(f.x, f.y + 560 * hs(f), c >= 1 ? 'ULTRA CANNON · FULL' : 'ULTRA CANNON', ORANGE, .9);
  if (X) { X.flash(WHITE, .2, .18); X.flash(ORGB, .22, .3); }
}
// the palm while it gathers, and the held beam while it is on (drawn in H.fx)
function cannonFx(f, m) {
  const h = fist(f, true), c = F(h[0], h[1]), k = c[2] * hs(f);
  if (m.fire === undefined) {
    const ch = m.held ? clamp((m.t - C_TAP) / (C_FULL - C_TAP), 0, 1) : clamp(m.t / C_TAP, 0, 1) * .35;
    lit(() => E.glow(E.GLOW.fire, c[0], c[1], (50 + 150 * ch) * k, .65 + .25 * Math.sin(E.T * 34)));
    g.fillStyle = '#fff1dc'; g.beginPath(); g.arc(c[0], c[1], (4 + 9 * ch) * k, 0, TAU); g.fill();
    return;
  }
  const b = m.beam;
  if (!b || b.done || !(b.d > 0)) return;
  const a = F(b.hx, b.hy), e = F(b.ex, b.ey), fl = 1 + .12 * Math.sin(E.T * 60);
  ray(a, e, b.w * a[2] * fl, ORGB, 1);
  lit(() => { E.glow(E.GLOW.fire, a[0], a[1], b.w * 4 * a[2], .9); E.glow(E.GLOW.fire, e[0], e[1], b.w * 5 * e[2], .8); });
}

/* ================= 3 — STEEL PROPULSION ================= */
const PROPULSION = { name: 'Steel Propulsion', cd: 12, dur: 1.6, glow: 'fire', run(f, m, t) {
  const o = E.P2, eb = bound();
  f.rate = 44;
  if (!m.s) { m.s = 1; facing(f, o); sfx.roar(.55); }
  if (m.got === undefined) {                          // the thrusters, and across at them
    if (t > .5 || !live(o)) { f.vx = 0; f.target = POSE.idle; if (t > .66) done(f, m); return; }
    jets(f, true); f.target = POSE.dash;
    const gap = gapOf(f, o);
    f.vx = gap > 110 && Math.abs(f.x + f.face * 80) < eb ? f.face * 2600 : 0;
    if (gap > -40 && gap < 150 && Math.abs(o.y - f.y) < 260 && !(o.inv > 0) && o.state !== 'down' && o.state !== 'up') { m.got = t; f.vx = 0; sfx.hit(true); E.stop(.05); m.hold = holdable(o); }
    return;
  }
  const k = t - m.got, y = k < .3 ? 230 * ease(k / .3) : k < .44 ? 230 * (1 - ((k - .3) / .14) ** 2) : 0;
  if (k < .44) {                                      // up with them, and down
    f.y = y; f.vy = 0; f.ground = false; f.target = k < .3 ? ARMS_UP : SLAMP; jets(f);
    if (m.hold && live(o)) Object.assign(o, { x: clamp(f.x + f.face * 100, -eb, eb), y: Math.max(0, y + 40), vx: 0, vy: 0, ground: false, state: 'air', stun: .6, act: null, tele: 0, face: -f.face });
    return;
  }
  if (!m.slam) {                                      // and into the floor with them
    m.slam = 1; f.y = 0; f.vy = 0; f.ground = true;
    const x = clamp(f.x + f.face * 100, -eb, eb);
    sfx.blast(); shake(30); E.zoomIn(.25); V.crack(x, 300); V.rocks(x, 0, 12); E.addRing(x, ORGB, 360);
    if (X) { X.boom(x, 40, 120, ORGB, { n: 16, hot: WHITE }); X.dust(x, 10); X.decal('crater', x, 200, ORGB, 7, 0); }
    if (live(o)) { E.applyHit(o, f.face, { dmg: exact(o, 35), kb: 80, stun: 1.4, stop: .2, heavy: 1, col: ORANGE, fixed: 1 }); if (m.hold && live(o)) Object.assign(o, { x, y: 0, vy: 0, vx: 0, ground: true, state: 'down', stun: 1.4 }); big(f, o, 'ドゴォン', ORANGE, 'neg'); }
  }
  f.target = k < .7 ? SLAMP : POSE.idle;
  if (k > .9) done(f, m);
} };

/* ================= 4 — PUPPET BREAKER ================= */
// (Build 0.30v1, the user's: it reaches them ragdolled as well. It is fired at where they are, on the floor or in the air, and a body on
// the floor is dragged in along the floor)
const CABLE_V = 3200, CABLE_MAX = 900;
const BREAKER = { name: 'Puppet Breaker', cd: 13, dur: 1.7, glow: 'fire', run(f, m, t) {
  const o = E.P2, eb = bound(), s = hs(f);
  f.rate = 44; f.vx = 0;
  const h = fist(f, true);
  if (!m.s) { m.s = 1; facing(f, o); sfx.whoosh(); m.d = 0; const u = aimAt(f, h[0], h[1], o, .8); m.ux = u[0]; m.uy = u[1]; }
  if (m.caught === undefined) {                       // the fist, fired out on its cable
    f.target = POSE.jab;
    m.d = Math.min(CABLE_MAX * s, t * CABLE_V);
    const tx = h[0] + m.ux * m.d, ty = h[1] + m.uy * m.d, top = live(o) ? o.y + (o.state === 'down' ? 90 : 300) * hs(o) : 0;
    m.tip = [tx, ty];
    if (canR(o) && (o.x - f.x) * f.face > 0 && Math.abs(o.x - tx) < 70 + 30 * hs(o) && ty > o.y - 70 && ty < top + 70) {
      m.caught = t; m.cx = o.x; m.cy = o.y; m.flat = o.state === 'down'; m.hold = holdable(o); sfx.hit(true); E.stop(.05); V.sparks(o.x, ty, 'fire', 8);
    } else if (m.d >= CABLE_MAX * s || ty < 0) { m.caught = null; m.back = t; m.d0 = m.d; }
    return;
  }
  if (m.caught === null) {                            // (nothing on the end of it: back it comes)
    m.d = Math.max(0, m.d0 * (1 - (t - m.back) / .25)); m.tip = [h[0] + m.ux * m.d, h[1] + m.uy * m.d]; f.target = POSE.idle;
    if (m.d <= 0) done(f, m);
    return;
  }
  const k = t - m.caught;
  if (k < .3) {                                       // them, reeled back in on it: along the floor, if that is where they were
    const u = ease(k / .3), x = clamp(lerp(m.cx, f.x + f.face * 130 * s, u), -eb, eb);
    f.target = POSE.jab;
    if (m.hold && live(o)) {
      if (m.flat) Object.assign(o, { x, y: 0, vx: 0, vy: 0, ground: true, state: 'down', stun: Math.max(o.stun || 0, .5), act: null, tele: 0 });
      else if (m.cy > 0) Object.assign(o, { x, y: lerp(m.cy, Math.min(m.cy, 140), u), vx: 0, vy: 0, ground: false, state: 'air', stun: .6, act: null, tele: 0, face: -f.face });
      else Object.assign(o, { x, vx: 0, state: o.ground ? 'hurt' : 'air', stun: .6, act: null, tele: 0, face: -f.face });
    }
    if (live(o)) m.tip = [o.x, bodyY(o)];
    m.d = Math.max(1, Math.hypot(m.tip[0] - h[0], m.tip[1] - h[1]));
    return;
  }
  m.d = 0;
  if (!m.punch) {                                     // and one punch with all of it behind it
    m.punch = 1; sfx.blast(); shake(30); E.zoomIn(.25);
    if (live(o) && hit(o, f.face, 40, { kb: 1300, lift: 520, stun: 1, stop: .2, heavy: 1, flung: 1 }, true)) { big(f, o, 'ドゴォ', ORANGE, 'neg'); E.addBlast(o.x, mid(o), ORGB, 340); }
  }
  f.target = k < .6 ? PUNCH : POSE.idle;
  if (k > .8) done(f, m);
} };
function cable(f, m) {                                // the cable out to the fist, and the fist with its jet behind it
  const h = fist(f, true), s = hs(f), e = m.tip || [h[0] + f.face * m.d, h[1]], a = F(h[0], h[1]), b = F(e[0], e[1]), k = a[2] * s, ux = m.ux || f.face, uy = m.uy || 0;
  g.strokeStyle = LINE; g.lineWidth = 5 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.lineCap = 'butt';
  ray(a, b, 2.6 * k, ORGB, .9);
  if (m.caught === undefined && X) X.emit(5, e[0] - ux * 18 * s, e[1] - uy * 18 * s, -ux * rnd(200, 500), -uy * rnd(200, 500) + rnd(-60, 60), rnd(3, 6) * s, .2, FIRE);
  energyFist(b, k, 1.2);
}

/* ================= E — SUPER CHARGE, and the puppet ================= */
const SC_T = 9, SC_CD = 25, HEEL = 140, P_SCALE = .82;
let sc = 0, scCd = 0, pup = null;                     // seconds of it left; before it can be used again; the puppet: { f, m (what it is doing), a (how solid it is) }
function superCharge(p) {
  sc = SC_T; scCd = SC_CD; charged = true;
  label(p.x, p.y + 520, 'SUPER CHARGE', CYAN, 1.3); sfx.charge(); sfx.rise(.5); shake(12);
  if (X) { X.flash(CRGB, .25, .3); X.shock(p.x, 520, CRGB, .5, 12); X.pillar(p.x, 70, 800, CRGB, .4); }
  if (!pup) {
    const f = E.fighter(PUPPET, clamp(p.x - p.face * HEEL, -bound() + 40, bound() - 40), p.face);
    f.scale = P_SCALE; f.alpha = 0;
    pup = { f, m: null, a: 0 };
    V.ring(f.x, 40, 200, CYAN, .3); if (X) X.shock(f.x, 260, CRGB, .4, 8);
  }
}
// the puppet's moves: his own, done by it from where it stands (it goes in close first for the ones that need to be close)
function approach(def, near) {
  return Object.assign({}, def, { dur: def.dur + .6, run(f, m, t) {
    const o = E.P2;
    if (m.t0 === undefined) {
      facing(f, o);
      if (live(o) && gapOf(f, o) > near && t < .6) { f.target = POSE.dash; f.vx = f.face * 2400; jets(f, true); return; }
      m.t0 = t; f.vx = 0;
    }
    def.run(f, m, t - m.t0);
  } });
}
// its Steel Propulsion: a kick that puts them in the air, round and round in its hands up there, and thrown at him
const SPIN = POSE.air.slice();
const P_PROPULSION = { name: 'Steel Propulsion', dur: 2.2, run(q, m, t) {
  const o = E.P2, p = E.P1, eb = bound();
  q.rate = 44;
  if (!m.s) { m.s = 1; facing(q, o); sfx.roar(.5); }
  if (m.kick === undefined) {                         // in at them, and the kick
    jets(q, true); q.target = POSE.dash;
    const gap = gapOf(q, o);
    q.vx = gap > 120 && Math.abs(q.x + q.face * 60) < eb ? q.face * 2500 : 0;
    if (gap < 160 || t > .55 || !live(o)) {
      m.kick = t; q.vx = 0; q.target = POSE.kick; sfx.whoosh();
      m.up = live(o) && hit(o, q.face, 12, { kb: 0, lift: 1200, stun: 1.2, stop: .1, heavy: 1 }) && holdable(o);
      if (m.up) big(q, o, 'ガン', ORANGE);
    }
    return;
  }
  const k = t - m.kick;
  if (!m.up) { q.target = k < .3 ? POSE.kick : POSE.idle; if (k > .4) m.end = 1; return; }
  if (k < .35) {                                      // up after them on its jets
    q.target = POSE.jump; jets(q, true);
    if (live(o)) { q.x = lerp(q.x, o.x - q.face * 70, .2); q.y = Math.max(q.y, Math.min(o.y - 40, q.y + 2000 * (1 / 60))); }
    return;
  }
  if (m.s0 === undefined) { m.s0 = t; m.cy = live(o) ? Math.max(200, o.y) : 300; }
  const s = t - m.s0;
  if (s < .7) {                                       // round and round in its hands
    q.target = ARMS_UP; q.y = m.cy - 60; q.vy = 0; jets(q);
    if (live(o)) {
      const a = s * 24;
      Object.assign(o, { x: clamp(q.x + Math.cos(a) * 80, -eb, eb), y: Math.max(0, m.cy + 80 + Math.sin(a) * 70), vx: 0, vy: 0, ground: false, state: 'air', stun: .6, act: null, tele: 0 });
      SPIN[6] = a; o.pose = SPIN.slice(); o.target = o.pose;
      if (X && Math.random() < .6) X.emit(1, o.x, mid(o), rnd(-400, 400), rnd(-400, 400), rnd(2, 4), .2, ORGB);
      if ((m.whirl = (m.whirl || 0) + 1) % 8 === 0) sfx.whoosh();
    }
    return;
  }
  if (!m.thrown) {                                    // and thrown, at him
    m.thrown = 1; const dir = p.x >= o.x ? 1 : -1;
    if (live(o)) { E.applyHit(o, dir, { dmg: exact(o, 20), kb: 950, lift: 480, stun: 1, stop: .12, heavy: 1, col: ORANGE, fixed: 1 }); big(q, o, 'ブン', ORANGE); }
    m.fall = 1; q.target = PUNCH;
  }
  q.target = s < .95 ? PUNCH : POSE.idle;
  if (s > 1.1) m.end = 1;
} };
const PUP = { strikes: approach(BARRAGE, 260), crush: CANNON, div: P_PROPULSION, manji: BREAKER };
function order(k) {                                   // a move pressed while Super Charge runs: the puppet does it, if it is free
  if (!pup) return false;
  if (pup.m) { sfx.back(); return true; }
  const p = E.P1;
  pup.m = { def: PUP[k], t: 0, key: k };
  label(pup.f.x, pup.f.y + 380, PUP[k].name.toUpperCase(), ORANGE, .8);
  if (p.dead) pup.m = null;
  return true;
}
function pupTick(dt) {
  const q = pup.f, p = E.P1, o = E.P2, m = pup.m;
  pup.a = (sc > 0 || m) ? Math.min(1, pup.a + dt * 4) : pup.a - dt * 3;
  q.alpha = clamp(pup.a, 0, 1);
  if (pup.a <= 0) { V.ring(q.x, 60, 160, CYAN, .3); if (X) X.emit(0, q.x, 160, 0, 60, 200, .3, CRGB, { s1: 1.5 }); pup = null; return; }
  if (m) {
    m.t += dt;
    m.def.run(q, m, m.t);
    if (m.end || m.t >= m.def.dur) pup.m = null;
    E.blend(q, dt);
  } else {                                            // at his side, facing what he is facing
    const heel = clamp(p.x - p.face * HEEL, -bound() + 40, bound() - 40), far = Math.abs(heel - q.x) > 24;
    q.x += clamp(heel - q.x, -620 * dt, 620 * dt); q.vx = 0;
    q.face = live(o) ? (o.x >= q.x ? 1 : -1) : p.face;
    C.stroll(q, far, dt, 1.1);
  }
  q.x = clamp(q.x + (m ? q.vx * dt : 0), -bound(), bound());
  if ((!m || m.fall) && q.y > 0) { q.vy = (q.vy || 0) - 2700 * dt; q.y = Math.max(0, q.y + q.vy * dt); if (q.y === 0) q.vy = 0; }
  if (!m) q.y = Math.max(0, q.y);
}

/* ================= G — ULTIMATE MECHAMASTER: ABSOLUTE ================= */
const EN_MAX = 100, EN_DRAIN = 1.2, ABS_T = 45, ABS_SCALE = 1.7, COST = { strikes: 20, crush: 30, div: 25, manji: 50, esp: 10 };
let abs = null;                                       // while he is in it: { en (its energy), t }
let rise = null;                                      // the giant coming up out of the floor, or going back down: { x, face, t, life, up }
const ABS_IN = { name: 'Absolute', dur: 2.5, glow: 'fire', run(p, m, t) {
  p.vx = 0; p.rate = 30; p.inv = Math.max(p.inv || 0, .6);
  if (!m.s) { m.s = 1; sfx.charge(); }
  if (t < .45) { p.target = t < .3 ? ARMS_UP : CLAP; if (t >= .3 && !m.clap) { m.clap = 1; sfx.blast(); shake(20); if (X) X.shock(p.x, 600, ORGB, .5, 12); V.ring(p.x, p.y + 200, 220, ORANGE, .25); } return; }
  if (!m.rise) {                                      // the floor shaking, and the giant up out of it under him
    m.rise = 1; rise = { x: p.x, face: p.face, t: 0, life: 1.2, up: true };
    V.crack(p.x, 520); V.rocks(p.x, 0, 22); E.addRing(p.x, ORGB, 700); sfx.rough(1.2); if (X) { X.dust(p.x, 20); X.dim(.45, 2); }
  }
  shake(10);
  if (t < 1.65) { p.target = HUNCH; p.y = Math.max(0, 240 * ease(clamp((t - .45) / 1.2, 0, 1))); p.ground = false; p.vy = 0; if (Math.random() < .5) V.rocks(p.x + rnd(-300, 300), 0, 1); return; }      // carried up on it
  if (!m.in) { m.in = 1; enter(p); }                 // and into its cockpit
  p.target = POSE.idle;
} };
function enter(p) {
  rise = null;
  const skin0 = p.skin, scale0 = p.scale;              // (how he looked going in: the regular Yuji, or a clan's body; he comes out as that)
  p.skin = ABSOLUTE; p.scale = ABS_SCALE; p.y = 0; p.vy = 0; p.ground = true;
  abs = { en: EN_MAX, t: 0, skin0, scale0 };
  E.banner('究極・絶対形態', 'ULTIMATE MECHAMASTER: ABSOLUTE', 'sm');
  sfx.bf(); sfx.blast(); shake(36); E.zoomIn(.4);
  if (X) { X.flash(ORGB, .45, .4); X.shock(p.x, 900, ORGB, .7, 16); X.pillar(p.x, 160, 1200, ORGB, .6); }
  relabel();
}
function leave(p, why) {                              // powered down: out he climbs, and it goes back into the floor
  const was = abs; abs = null;
  p.skin = was.skin0 || E.YUJI; p.scale = was.scale0; p.inv = Math.max(p.inv || 0, 1);
  rise = { x: p.x, face: p.face, t: 0, life: 1, up: false };
  label(p.x, p.y + 520, why, GOLD, 1.4); sfx.steam(); sfx.rough(.8); shake(14);
  if (X) for (let i = 0; i < 10; i++) X.emit(2, p.x + rnd(-200, 200), rnd(100, 500), rnd(-80, 80), rnd(40, 160), rnd(60, 110), rnd(.6, 1.1), '200,204,212', { s1: 2, a: .5, dr: 1.5 });
  relabel();
}
// the giant, drawn coming up out of the floor (or going back into it): only what is above the floor shows
function drawRise() {
  const r = rise, u = clamp(r.t / r.life, 0, 1), y = r.up ? -560 * (1 - ease(u)) : -560 * u * u, gl = F(r.x, 0)[1];
  g.save(); g.beginPath(); g.rect(-1e4, -1e4, 2e4, gl + 1e4); g.clip();
  E.drawFighter({ skin: ABSOLUTE, x: r.x, y, face: r.face, spin: 1, scale: ABS_SCALE, pose: POSE.idle.slice() });
  g.restore();
}
// what each of its moves costs, paid as it starts. Not enough left (a press that waited while something else finished): refused, and nothing spent
function spend(k) {
  const p = E.P1;
  if (abs && abs.en >= COST[k]) { abs.en -= COST[k]; return true; }
  label(p.x, p.y + 640, 'NOT ENOUGH ENERGY', GOLD, .9); sfx.back();
  if (k !== 'esp') E.cd[k] = 0;
  E.endMove(p);
  return false;
}
// 1 — PIGEON VIOLA: six of them out of its shoulders, finding them, and bursting
const shots = [];
const PIGEON = { name: 'Pigeon Viola', cd: 2, dur: .9, glow: 'fire', run(p, m, t) {
  p.vx = 0; p.rate = 34; p.target = t < .6 ? ARMS_UP : POSE.idle;
  if (m.s) return;
  m.s = 1; if (!spend('strikes')) return; facing(p, E.P2); sfx.charge();
  for (let i = 0; i < 6; i++) shots.push({ x: p.x - p.face * rnd(0, 60) * ABS_SCALE, y: p.y + 380 * ABS_SCALE * .9, vx: rnd(-420, 420), vy: rnd(700, 1000), t: -i * .07, life: 3.2, pts: [] });
} };
function flyShots(dt) {
  const o = E.P2;
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    if ((s.t += dt) < 0) continue;
    if (s.t > .3 && live(o)) {                        // turning toward them
      const tx = o.x - s.x, ty = mid(o) - s.y, d = Math.hypot(tx, ty) || 1, k = 1 - Math.exp(-dt * 5);
      s.vx += (tx / d * 1500 - s.vx) * k; s.vy += (ty / d * 1500 - s.vy) * k;
    } else s.vy -= 900 * dt;
    s.x += s.vx * dt; s.y += s.vy * dt;
    s.pts.push([s.x, s.y]); if (s.pts.length > 8) s.pts.shift();
    const near = live(o) && Math.abs(o.x - s.x) < 60 + 30 * hs(o) && s.y > o.y && s.y < o.y + 300 * hs(o);
    if (near || s.t > s.life || s.y < 0) {
      shots.splice(i, 1);
      if (X) X.boom(s.x, Math.max(20, s.y), 60, ORGB, { n: 10, flash: 0, shake: 10 });
      sfx.blast();
      if (near) hit(o, s.vx >= 0 ? 1 : -1, 12, { kb: 220, lift: 260, stun: .8, stop: .05, heavy: 1 });
    }
  }
}
function drawShots() {
  for (const s of shots) {
    if (s.t < 0) continue;
    if (X) X.tail(s.pts, 14, ORGB);
    const c = F(s.x, s.y), k = c[2];
    lit(() => E.glow(E.GLOW.fire, c[0], c[1], 120 * k, .9));
    g.fillStyle = '#fff1e0'; g.beginPath(); g.arc(c[0], c[1], 9 * k, 0, TAU); g.fill();
  }
}
// 2 — ABSOLUTE CANNON: a beam out of its arm, swept along the floor away from it, the floor going up under it as it goes
function ray(a, b, w, rgb, al) {
  lit(() => {
    g.lineCap = 'round';
    for (const [lw, c, aa] of [[w * 3.2, rgb, .25], [w * 1.6, rgb, .6], [w * .55, WHITE, 1]]) { g.strokeStyle = `rgba(${c},${aa * al})`; g.lineWidth = lw; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    g.lineCap = 'butt';
  });
}
const SWEEP_T = 1.1;
const ACANNON = { name: 'Absolute Cannon', cd: 4, dur: .7 + SWEEP_T + .7, glow: 'fire', run(p, m, t) {
  const f = p.face;
  p.vx = 0; p.rate = 30; p.target = PALM;
  if (!m.s) { m.s = 1; if (!spend('crush')) return; facing(p, E.P2); play('home-tdc-charge', .8, () => { sfx.charge(); sfx.rise(.7); }); }
  const h = fist(p, true);
  if (t < .7) { if (X && Math.random() < .9) { const a = rnd(0, TAU), r = rnd(100, 260); X.emit(1, h[0] + Math.cos(a) * r, h[1] + Math.sin(a) * r, -Math.cos(a) * r * 4, -Math.sin(a) * r * 4, rnd(3, 5), .2, ORGB); } return; }
  const k = t - .7;
  if (!m.go) {                                        // the sweep: from in front of it, along the floor, across them and past them
    const o = E.P2, eb = bound();
    m.go = 1; m.x0 = p.x + f * 220 * ABS_SCALE / 1.7;
    m.x1 = clamp(live(o) ? o.x + f * 380 : p.x + f * 1500, -eb, eb); if ((m.x1 - m.x0) * f < 500) m.x1 = clamp(m.x0 + f * 500, -eb, eb);
    play('home-tdc-sweep', .9, () => sfx.cannon()); shake(24);
    V.custom(SWEEP_T, u => { const ex = lerp(m.x0, m.x1, u), a = F(h[0], h[1]), b = F(ex, 0); ray(a, b, 26 * a[2], ORGB, 1 - u * .3); });
  }
  if (k > SWEEP_T) {
    p.target = POSE.idle;
    if (!m.last) {                                    // and at the end of it, where they are, the biggest of them
      m.last = 1;
      const o = E.P2, x = live(o) ? o.x : m.x1;
      if (X) { X.boom(x, 80, 240, ORGB, { n: 30, hot: WHITE, flash: .35, shake: 34 }); X.pillar(x, 140, 1000, ORGB, .5); }
      E.addBlast(x, 120, ORGB, 600); V.crack(x, 360); sfx.blast(); sfx.rough(1.1);
      if (can(o) && Math.abs(o.x - x) < 300 + 40 * hs(o)) hit(o, f, 40, { kb: 1000, lift: 760, stun: 1, stop: .2, heavy: 1 });
    }
    return;
  }
  const n = Math.min(10, Math.floor(k / (SWEEP_T / 10)) + 1);
  while ((m.n || 0) < n) {                            // and where it touches the floor, up the floor goes
    m.n = (m.n || 0) + 1;
    const ex = clamp(lerp(m.x0, m.x1, m.n / 10), -bound(), bound()), o = E.P2;
    if (X) X.boom(ex, 40, 100, ORGB, { n: 10, flash: 0, shake: 12 });
    V.crack(ex, 170); sfx.blast();
    if (can(o) && Math.abs(o.x - ex) < 250 + 40 * hs(o) && o.y < 400) hit(o, f, 8, { kb: 60, stun: .8, stop: .04 });
  }
} };
// 3 — STEEL CATACLYSM: up, and down with both fists, and the floor feels it end to end
const CATACLYSM = { name: 'Steel Cataclysm', cd: 3, dur: 1.7, glow: 'fire', run(p, m, t) {
  const o = E.P2, eb = bound();
  p.rate = 40;
  if (!m.s) { m.s = 1; if (!spend('div')) return; facing(p, o); m.x0 = p.x; m.tx = clamp(live(o) ? o.x - p.face * 120 : p.x + p.face * 300, -eb, eb); sfx.roar(.5); }
  if (t < .15) { p.vx = 0; p.target = POSE.crushWind; return; }
  if (t < .6) { const u = (t - .15) / .45; p.x = lerp(m.x0, m.tx, u); p.y = 240 * Math.sin(u * Math.PI / 2); p.vy = 0; p.vx = 0; p.ground = false; p.target = ARMS_UP; jets(p, true); return; }
  if (t < .72) { const u = (t - .6) / .12; p.x = m.tx; p.y = 240 * (1 - u * u); p.vy = 0; p.target = SLAMP; return; }
  if (!m.hit) {
    m.hit = 1; p.y = 0; p.vy = 0; p.ground = true;
    const x = clamp(p.x + p.face * 140, -eb, eb);
    sfx.blast(); sfx.rough(1.3); shake(46); E.zoomIn(.45); V.crack(x, 640); V.rocks(x, 0, 30); E.addRing(x, ORGB, 1200);
    if (X) { X.boom(x, 60, 220, ORGB, { n: 30, hot: WHITE }); X.shock(x, 1500, ORGB, .7, 18); X.dust(x, 24); X.decal('crater', x, 360, ORGB, 9, 0); X.flash(WHITE, .25, .2); }
    if (can(o)) {
      const d = Math.abs(o.x - x);
      if (d < 320 + 40 * hs(o)) { hit(o, o.x >= x ? 1 : -1, 90, { kb: 600, lift: 900, stun: 1.2, stop: .22, heavy: 1 }); big(p, o, 'ズドォン', ORANGE, 'neg'); }
      else if (d < 1100 && o.y < 60) hit(o, o.x >= x ? 1 : -1, 30, { kb: 500, lift: 520, stun: .9, stop: .08, heavy: 1 });      // the shock along the floor
    }
  }
  p.target = t < 1.2 ? SLAMP : POSE.idle;
} };
// 4 — SEVENTEEN YEARS: everything he has stored up, let go round them at once
const SEVENTEEN = { name: 'Seventeen Years', cd: 6, dur: 2.5, glow: 'fire', run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.rate = 26;
  if (!m.s) { m.s = 1; if (!spend('manji')) return; facing(p, o); sfx.charge(); sfx.rise(1.2); E.banner('十七年', 'SEVENTEEN YEARS', 'sm'); if (X) X.dim(.6, 1.8); }
  if (t < 1.3) {                                      // all of it drawn in to it
    p.target = ARMS_UP;
    if (X) for (let i = 0; i < 2; i++) { const a = rnd(0, TAU), r = rnd(300, 700); X.emit(1, p.x + Math.cos(a) * r, p.y + 300 + Math.sin(a) * r, -Math.cos(a) * r * 2.6, -Math.sin(a) * r * 2.6, rnd(3, 6), .35, Math.random() < .5 ? ORGB : '255,200,120'); }
    if (Math.random() < .3) shake(8);
    return;
  }
  p.target = t < 1.8 ? PALM : POSE.idle;
  if (m.go) return;
  m.go = 1;
  const x = live(o) ? o.x : p.x + p.face * 500, y = live(o) ? mid(o) : 200;
  play('home-tdc-boom', 1, () => { sfx.blast(); sfx.rough(1.4); }); sfx.bf(); shake(56); E.zoomIn(.6); E.stop(.12);
  if (X) { X.flash(WHITE, .6, .5); X.flash(ORGB, .35, .8); X.boom(x, y, 420, ORGB, { n: 50, hot: WHITE, life: 1 }); X.pillar(x, 300, 1600, ORGB, 1); X.shock(x, 1500, ORGB, .9, 20); X.decal('crater', x, 460, ORGB, 10, 0); }
  E.addBlast(x, y, ORGB, 1200); V.crack(x, 700); V.rocks(x, 0, 30);
  if (can(o) && Math.abs(o.x - x) < 460 + 40 * hs(o)) { hit(o, o.x >= p.x ? 1 : -1, 200, { kb: 1400, lift: 1000, stun: 1.4, stop: .3, heavy: 1, flung: 1 }); big(p, o, '十七年', ORANGE, 'neg'); }
} };
// E in it — EMERGENCY THRUSTERS: full burn forward, and whatever is in the way is put aside
const THRUSTERS = { name: 'Emergency Thrusters', cd: 1.5, dur: .8, glow: 'fire', run(p, m, t) {
  const o = E.P2, eb = bound();
  p.rate = 40;
  if (!m.s) { m.s = 1; if (!spend('esp')) return; facing(p, o); sfx.roar(.7); label(p.x, p.y + 640, 'EMERGENCY THRUSTERS', ORANGE, 1); }
  if (t < .5) {
    p.target = POSE.dash; p.vx = Math.abs(p.x + p.face * 100) < eb ? p.face * 2600 : 0; jets(p, true);
    if (!m.hit && can(o) && Math.abs(o.x - p.x) < 220 && (o.x - p.x) * p.face > -60) { m.hit = 1; hit(o, p.face, 40, { kb: 1400, lift: 620, stun: 1, stop: .16, heavy: 1, flung: 1 }); big(p, o, 'ドォン', ORANGE); }
    return;
  }
  p.vx = 0; p.target = POSE.idle;
} };

/* ================= the technique ================= */
const MOVES = {
  get strikes() { return abs ? PIGEON : BARRAGE; }, get crush() { return abs ? ACANNON : CANNON; },
  get div() { return abs ? CATACLYSM : PROPULSION; }, get manji() { return abs ? SEVENTEEN : BREAKER; } };
let shownL = '';
function relabel() {                                  // the hotbar's names, in it and out of it
  if (!on()) { shownL = ''; return; }
  const ds = SLOTS.map(k => MOVES[k]), key = ds.map(d => d.name).join('|');
  if (key === shownL) return;
  shownL = key;
  SLOTS.forEach((k, i) => { E.hud.mv[k].querySelector('b').textContent = ds[i].name; E.CD[k] = ds[i].cd; E.cd[k] = Math.min(E.cd[k], ds[i].cd); });
}
const ESP = { jp: '充', get col() { return abs ? ORANGE : CYAN; }, name: () => (abs ? 'Emergency Thrusters' : sc > 0 ? 'Super Charge · ' + Math.ceil(sc) + 's' : 'Super Charge'),
  get left() { return abs ? 0 : scCd; }, get max() { return SC_CD; },
  press(p) {
    if (p.dead) return true;
    if (abs) {
      if (p.move || p.ps || p.dashT > 0) return true;
      if (abs.en < COST.esp) { label(p.x, p.y + 600, 'NOT ENOUGH ENERGY', GOLD, .9); sfx.back(); return true; }
      p.move = { def: THRUSTERS, key: 'esp', t: 0 };
      return true;
    }
    if (scCd > 0) { sfx.back(); return true; }
    superCharge(p);
    return true;
  } };
function awaken(p) { if (!abs) p.move = { def: ABS_IN, t: 0 }; }
JU.tech.add('mecha', { name: 'Mechamaster', jp: '傀儡操術', mark: '傀', who: 'Puppets, and the one who works them', odds: 0, col: ORANGE, glow: 'fire', moves: MOVES,
  early: true, as: ['Mechamaster', '傀儡'], awaken, awkName: 'Absolute', get awkHits() { return !abs; },      // (the giant does not fill its own bar. No skin: he is the regular Yuji, the user's)
  hint: '<b>Hold 2</b> charged Ultra Cannon · <b>E</b> Super Charge: a puppet does your moves · <b>G</b> Ultimate Mechamaster: Absolute' });
const DEF = T.TECH.mecha, on = () => T.active === DEF;
JU.especial.add('mecha', ESP);

// the meter under his health: Super Charge's seconds, or the giant's energy
const meter = document.createElement('div');
meter.className = 'mcm'; meter.setAttribute('aria-hidden', 'true');
meter.innerHTML = '<span><i></i></span><b></b>';
E.root.querySelector('.fb.p1').appendChild(meter);
const mbar = meter.querySelector('i'), mtxt = meter.querySelector('b');
let shownM = '';
function paintMeter() {
  const show = on() && E.root.dataset.mode === 'fight' && (!!abs || sc > 0);
  meter.classList.toggle('on', show);
  if (!show) { shownM = ''; return; }
  const v = abs ? abs.en / EN_MAX : sc / SC_T, txt = abs ? 'ABSOLUTE · ENERGY ' + Math.ceil(abs.en) : 'SUPER CHARGE · ' + Math.ceil(sc) + 's', key = txt + '|' + Math.round(v * 40);
  if (key === shownM) return;
  shownM = key;
  meter.classList.toggle('abs', !!abs); meter.classList.toggle('low', !!abs && abs.en < 25);
  mbar.style.setProperty('--e', v.toFixed(3)); mtxt.textContent = txt;
}

/* ================= wiring ================= */
const press0 = H.press, tick0 = H.tick, under0 = H.under, fx0 = H.fx, cast0 = H.cast, reset0 = H.reset, start0 = H.fightStart, fpow0 = H.foePower, firm0 = H.noStun;
H.press = (a, inScene) => {
  if (!inScene && on() && E.root.dataset.mode === 'fight' && SLOTS.includes(a)) {
    const p = E.P1;
    if (abs && abs.en < COST[a] && !p.move && !p.dead) { label(p.x, p.y + 600, 'NOT ENOUGH ENERGY', GOLD, .9); sfx.back(); return true; }
    if (!abs && sc > 0 && pup && !p.dead) return order(a);      // (Super Charge: the puppet does it, and the key's wait is left alone)
  }
  return press0 ? press0(a, inScene) : false;
};
H.cast = () => { const c = cast0 ? cast0() : null; return pup ? (c || []).concat(pup.f) : c; };
H.foePower = a => (fpow0 ? fpow0(a) : 1) * (abs && on() ? .5 : 1);      // the giant's armour takes half of every blow
H.noStun = (p, a) => !!(firm0 && firm0(p, a)) || !!(abs && on());       // and nothing staggers it
H.tick = dt => {
  tick0(dt);
  if (!on()) { if (abs) { const p = E.P1; p.skin = abs.skin0 || E.YUJI; p.scale = abs.scale0; abs = null; } sc = 0; pup = null; charged = false; rise = null; shots.length = 0; paintMeter(); return; }
  const p = E.P1;
  if (scCd > 0) scCd = Math.max(0, scCd - dt);
  if (sc > 0) { sc = Math.max(0, sc - dt); if (sc <= 0) { charged = false; label(p.x, p.y + 480, 'SUPER CHARGE OVER', CYAN, .9); } }
  if (pup) pupTick(dt);
  if (rise) { rise.t += dt; if (rise.t >= rise.life) rise = null; }
  if (shots.length) flyShots(dt);
  if (abs) {
    abs.en = Math.max(0, abs.en - EN_DRAIN * dt); abs.t += dt;
    if ((abs.en <= 0 || abs.t >= ABS_T) && !p.move && !p.dead) leave(p, abs.en <= 0 ? 'OUT OF ENERGY' : 'POWERED DOWN');
  }
  relabel(); paintMeter();
};
H.under = dt => {
  under0(dt);
  if (!on()) return;
  if (rise) drawRise();
  const p = E.P1;
  if (sc > 0 && !p.dead) { const c = F(p.x, p.y + 140); lit(() => E.glow(E.GLOW.blue, c[0], c[1], 460 * c[2], .32 + .1 * Math.sin(E.T * 9))); }      // blue all round him
};
H.fx = dt => {
  fx0(dt);
  if (!on()) return;
  const p = E.P1, m = p.move;
  if (sc > 0 && !p.dead && X && Math.random() < .45) X.lightning(p.x + rnd(-50, 50), p.y + rnd(40, 300), p.x + rnd(-130, 130), p.y + rnd(40, 320), CRGB, .08, 2, 0);
  for (const [f, mv] of [[p, m], pup ? [pup.f, pup.m] : [null, null]]) {
    if (!f || !mv || (f.alpha !== undefined && f.alpha < .1)) continue;
    if (mv.ext && (mv.def === BARRAGE || mv.def === PUP.strikes)) armsOut(f, mv);
    if (mv.d > 0 && mv.def === BREAKER) cable(f, mv);
    if (mv.def === CANNON) cannonFx(f, mv);
  }
  if (shots.length) drawShots();
};
const clear = () => { const p = E.P1; if (abs) { p.skin = abs.skin0 || E.YUJI; p.scale = abs.scale0; abs = null; } sc = 0; scCd = 0; pup = null; charged = false; rise = null; shots.length = 0; shownL = ''; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) clear(); };

JU.mecha = { MOVES, PUP, ESP, MECHA, PUPPET, ABSOLUTE, get state() { return { sc: +sc.toFixed(1), scCd: +scCd.toFixed(1), pup: !!pup, busy: !!(pup && pup.m), abs: abs && { en: +abs.en.toFixed(1), t: +abs.t.toFixed(1) }, shots: shots.length }; } };
})();
