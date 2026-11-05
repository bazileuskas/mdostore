/* JUJUTSU UNLIMITEDS — REGISTRATION (Build 0.28, Early Access). The user: "registration (reggie). so a cool thing abt him is that he wont have an e
   special but instead it will show one of the 4 other moves and abive it will say NEXT and after one of the moves is used the move where it
   showed NEXT will come instead of the move you just used and the move where it shows NEXT is smaller but when it is replaced its normal. also
   add 1 more move called coupon and when you use it its gonna say below USE A MOVE and when you use a move it will change a varaiint for that
   move: Home run will theow a baseball before hitting with the bat and the ball does 50 damage when hits and the baseball bat does 100 damage.
   that was an example do that for all the other moves. also add another move called EXTRA COUPON which works just like a coupon but does a
   different varaint. a cool thing about it if theres a coupon and an extra coupon in the same moveset and you sue a coupon on an extra coupon
   and then use that extra coupon on a move (that is not e coupon or coupon) it will give you a random cursed tool or a gun with 2 bullets or a
   sdniper with 1 bullet", and the eight moves as a table: Home Run (a bat), Hit and Run (a scooter), Kitchen Nightmare (two knives), Express
   Delivery (cardboard boxes), Road Rage (a car), Furniture Frenzy (a chair), Fire Extinguisher and Final Purchase (a house).
   THE DECK: those eight, a Coupon and an Extra Coupon, shuffled at the start of a fight. Four are on 1 to 4; where E would be is the one that
     comes in NEXT, smaller; the rest wait behind it. A card used goes to the back, and NEXT takes its key (and that key's wait, which is the
     used card's).
   A COUPON: the next of the eight he uses is its coupon variant (each of the eight says USE A MOVE under its name until then). The user's
     example is Home Run's: a baseball first (50) and then the bat (100). The rest are ours, each with something thrown in. An EXTRA COUPON:
     its extra variant, the same thing bigger, or more of it. The Coupon on the Extra Coupon (Coupon, then Extra Coupon) makes it a PRIZE: the
     next of the eight is not done at all, and its receipt buys a random cursed tool (at the Cursed Tools reel's odds, tools.js), a pistol with
     two bullets or a sniper rifle with one, which takes that key until it is used up.
   The look is the Receipt Man's (cast6.js, REGGIE), and the Receipt Man is what the game calls him */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, T = JU.tech, Z = JU.bossfx;
const { rnd, clamp, lerp } = E, TAU = Math.PI * 2, SLOTS = T.SLOTS;
const PAPER = '#f1eee2', PRGB = '241,238,226', CPN = '#7dffb0', CRGB = '125,255,176', XTR = '#ffb347', XRGB = '255,179,71', GOLD = '#ffd84a', GRGB = '255,216,74', WHITE = '255,255,255';
const WOOD = '#c8955a', WOOD2 = '#9c6b38', WRGB = '170,118,66', STEEL = '#dfe6ee', CARD = '#c99c5f', CARD2 = '#ad8148', CRD = '190,146,92', TAPE = '#eadcae', GLASS = '200,230,255', RED = '#e2383c';
const ARMED = { coupon: CPN, extra: XTR, prize: GOLD };
const CARS = ['#3a6ea8', '#c23b3b', '#e0c341', '#e9e6dc', '#3f9e6a'];
const SKIN = JU.cast6.REGGIE;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const live = o => !!o && !o.ko && !(o.alpha < 1);
const can = o => live(o) && !(o.inv > 0) && o.state !== 'up';      // there to be hit by something of his that does not go through tryHit: on the floor too
const holdable = o => live(o) && !duel() && !o.net && !o.poise;
const on = () => T.active === DEF;
const fight = () => E.root.dataset.mode === 'fight';
const hs = o => o.scale || 1;
const mid = o => o.y + (o.state === 'down' ? 40 : 170) * hs(o);
const top = o => o.y + (o.state === 'down' ? 80 : 290) * hs(o);
const facing = (p, o) => { if (live(o)) p.face = o.x >= p.x ? 1 : -1; };
const bound = () => (H.bound ? H.bound() : 965);
const roomAhead = p => Math.abs(p.x + p.face * 70) < bound();
const gap = (p, o) => (live(o) ? (o.x - p.x) * p.face : 9999);
const side = (x, o) => (o.x >= x ? 1 : -1);
const label = (x, y, text, col = PAPER, life = 1.1) => E.fx.push({ k: 2, x, y, n: text, col, t: 0, life });
const big = (p, o, word, col = PAPER, kind = 'bw') => { if (JU.ms) JU.ms.bigHit(p, o, word, col, kind); };
const ono = (text, x, y, col = PAPER, s = .9, life = .8) => { if (JU.ms) JU.ms.ono(text, x, y, s, col, life); };
const exact = (o, n) => n / (o.dr || 1);
const dtOf = (m, t) => { const d = m.lt === undefined ? 0 : t - m.lt; m.lt = t; return d; };
const pick = a => a[Math.random() * a.length | 0];

// a blow of his that does not go through tryHit (a ball, a car, a house): on them wherever they are, worth exactly what it says
function hit(o, face, dmg, more) {
  if (!can(o)) return false;
  E.applyHit(o, face, Object.assign({ dmg: exact(o, dmg), kb: 200, stun: .6, stop: .06, col: PAPER, fixed: 1, mute: 1 }, more));
  return true;
}
// one in front of him and in reach, the engine's own way (tryHit): standing, or in the air
const reach = (p, r, dmg, more) => { const o = E.P2; return live(o) && E.tryHit(p, Object.assign({ reach: r, dmg: exact(o, dmg), kb: 200, stun: .6, stop: .06, col: PAPER, fixed: 1, mute: 1 }, more)); };
// whether a thing of his (its middle x, y; half its width and its height) is touching them
const touch = (x, y, hw, hh, o) => can(o) && Math.abs(o.x - x) < hw + 40 * hs(o) && y + hh > o.y && y - hh < top(o);
const down = (o, t) => { if (holdable(o) && !o.ko) Object.assign(o, { y: 0, vy: 0, vx: 0, ground: true, state: 'down', stun: Math.max(o.stun || 0, t) }); };      // knocked over, and staying there
function hold(o, t) {                               // kept where they are
  if (!holdable(o)) return;
  Object.assign(o, { vx: 0, state: o.state === 'air' || o.state === 'down' ? o.state : 'hurt', stun: Math.max(o.stun || 0, t), act: null, tele: 0 });
  if (o.ai) o.ai.t = Math.max(o.ai.t || 0, t);
}

/* ================= receipts: whatever one says he paid for, he has again ================= */
const SLIP = { g: 420, dr: 1.4, w: 1.7, edge: 'rgba(30,24,20,.5)' };
function receipt(x, y, n = 10, rgb = PRGB) {        // a receipt held up and burning away (cast6.js's, the boss's own)
  if (!Z) return;
  for (let i = 0; i < n; i++) Z.emit(3, x + rnd(-20, 20), y + rnd(-20, 20), rnd(-260, 260), rnd(40, 420), rnd(6, 10), rnd(.7, 1.3), rgb, Object.assign({ vr: rnd(-10, 10), rot: rnd(0, TAU) }, SLIP));
  for (let i = 0; i < 8; i++) Z.emit(5, x, y, rnd(-200, 200), rnd(0, 400), rnd(3, 5), rnd(.3, .6), '255,170,80');
  Z.flare(x, y, '255,210,120', 220, .16);
}
function buy(p, what, col = PAPER) { const h = E.hand(p, true); receipt(h[0], h[1]); sfx.rip(); label(p.x, p.y + 480, what, col, 1.1); }
const gone = (p, front = true) => { const h = E.hand(p, front); receipt(h[0], h[1], 5); };      // and what it bought, gone back into it
function bits(x, y, n, rgb, spread = 500, size = 10) {      // pieces of whatever it was
  if (Z) for (let i = 0; i < n; i++) Z.emit(3, x + rnd(-50, 50), y + rnd(-40, 40), rnd(-spread, spread), rnd(150, 900), rnd(size * .5, size * 1.4), rnd(.6, 1.3), rgb, { g: 1700, vr: rnd(-14, 14), rot: rnd(0, TAU), w: rnd(.25, .7), edge: 'rgba(30,20,12,.55)' });
}
function puffs(x, y, n, rgb = '232,234,238', s = 60, spread = 220, up = 120) { if (Z) for (let i = 0; i < n; i++) Z.emit(2, x + rnd(-40, 40), y + rnd(-20, 20), rnd(-spread, spread), rnd(20, up), s * rnd(.7, 1.3), rnd(.6, 1.2), rgb, { s1: 2.4, a: .6, dr: 2.2 }); }
function thud(x, hard) { sfx.blast(); if (hard) sfx.rough(1.1); else sfx.land(); shake(hard ? 36 : 14); V.crack(x, hard ? 340 : 160); V.rocks(x, 0, hard ? 12 : 4); if (Z) { Z.dust(x, hard ? 14 : 5); if (hard) Z.shock(x, 640, '235,225,205', .45, 12); } }

/* ================= what he buys, drawn: (0, 0) the middle of the bottom of each, +x the way it faces, +y down the screen ================= */
let LWK = 1;                                        // (line widths, kept the same however big the thing is drawn)
function R(x, y, w, h, fill, l = 3) { g.fillStyle = fill; g.fillRect(x, y, w, h); g.lineWidth = l * LWK; g.strokeStyle = LINE; g.strokeRect(x, y, w, h); }
function Q(fill, pts, l = 3) { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = l * LWK; g.lineJoin = 'round'; g.strokeStyle = LINE; g.stroke(); }
function O(x, y, r, fill, l = 3) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = fill; g.fill(); g.lineWidth = l * LWK; g.strokeStyle = LINE; g.stroke(); }
const wheel = (x, y, r) => { O(x, y, r, '#17171b'); O(x, y, r * .42, '#9aa3ad', 2); };
function bat(len = 150, col = WOOD) {               // from its knob (0) to the end of its barrel (len), along x
  g.beginPath(); g.moveTo(0, -4); g.lineTo(len * .32, -4.5); g.quadraticCurveTo(len * .62, -10, len - 11, -11); g.arc(len - 11, 0, 11, -Math.PI / 2, Math.PI / 2); g.quadraticCurveTo(len * .62, 10, len * .32, 4.5); g.lineTo(0, 4); g.closePath();
  g.fillStyle = col; g.fill(); g.lineWidth = 3 * LWK; g.lineJoin = 'round'; g.strokeStyle = LINE; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(len * .4, -7.5, len * .48, 3);
  g.fillStyle = '#26262c'; g.fillRect(3, -4, len * .24, 8);
  R(-7, -7.5, 7, 15, '#26262c', 2);
}
function ball(r = 12) {
  O(0, 0, r, '#fbfbf4', 2.5);
  g.strokeStyle = '#d23a3a'; g.lineWidth = 2 * LWK;
  g.beginPath(); g.arc(-r * 1.3, 0, r, -.7, .7); g.stroke(); g.beginPath(); g.arc(r * 1.3, 0, r, Math.PI - .7, Math.PI + .7); g.stroke();
}
function knife() { R(-26, -5, 28, 10, '#3a2a22', 2.5); Q(STEEL, [2, -7, 58, -7, 78, 1, 2, 7], 2.5); g.fillStyle = '#ffffff'; g.fillRect(6, -5, 44, 2); }
function cleaver() { R(-36, -6, 38, 12, '#3a2a22', 3); Q(STEEL, [2, -14, 2, 12, 122, 12, 122, -56, 22, -56], 3); O(104, -40, 6, '#9aa3ad', 2); g.fillStyle = '#ffffff'; g.fillRect(6, 6, 110, 3); }
function chair() {                                  // a wooden chair, standing, its seat to +x
  R(-36, -160, 10, 160, WOOD); R(-36, -84, 80, 11, WOOD); R(34, -73, 10, 73, WOOD); R(-26, -40, 60, 6, WOOD2, 2);
  for (const y of [-150, -126, -104]) R(-30, y, 4, 12, WOOD2, 1.5);
}
function chairHeld() { R(-4, -5, 168, 10, WOOD); R(76, 0, 11, 84, WOOD); R(76, 74, 90, 10, WOOD); R(120, 4, 6, 70, WOOD2, 2); }      // held by the top of its back
function table() { R(-124, -102, 248, 15, WOOD); R(-114, -88, 228, 10, WOOD2, 2); R(-110, -80, 12, 80, WOOD2); R(98, -80, 12, 80, WOOD2); }
function sofa(col = '#7d4f9e') {
  R(-150, -134, 300, 76, col); R(-150, -64, 300, 46, col); R(-176, -104, 36, 86, col); R(140, -104, 36, 86, col);
  g.fillStyle = 'rgba(0,0,0,.18)'; for (const x of [-50, 50]) g.fillRect(x - 1, -130, 3, 66);
  R(-140, -20, 14, 20, '#3a2a22', 2); R(126, -20, 14, 20, '#3a2a22', 2);
}
function box(w = 120, h = 90) {
  R(-w / 2, -h, w, h, CARD); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-w / 2, -h, w * .18, h);
  R(-8, -h, 16, h * .42, TAPE, 2); R(w * .1, -h * .62, w * .3, h * .26, '#f4f1e6', 1.5);
  g.fillStyle = 'rgba(40,30,20,.5)'; g.fillRect(w * .13, -h * .55, w * .2, 2); g.fillRect(w * .13, -h * .47, w * .14, 2);
}
function boxes(n, seed) {                           // n of them, one on another, none of them quite square to the rest
  let y = 0;
  for (let i = 0; i < n; i++) {
    const w = 150 - (i % 3) * 16, h = 92 - (i % 2) * 10, dx = Math.sin(seed + i * 2.3) * 14;
    g.save(); g.translate(dx, y); g.rotate(Math.sin(seed * 1.7 + i) * .05); box(w, h); g.restore();
    y -= h - 2;
  }
}
function crate() { R(-100, -196, 200, 196, '#8f5d2c'); for (let i = 1; i < 4; i++) R(-100, -196 + i * 49, 200, 4, '#6e4520', 1.5); Q('#a86d34', [-92, -16, -76, -16, 92, -180, 76, -180], 2); R(-100, -196, 18, 196, '#6e4520', 2); R(82, -196, 18, 196, '#6e4520', 2); }
function scooter(col = '#e64a4f') {
  wheel(-64, -19, 19); wheel(66, -19, 19);
  Q(col, [-98, -32, -44, -30, -24, -42, 44, -42, 56, -30, 74, -30, 70, -52, 34, -66, -58, -70, -96, -56]);
  R(-86, -86, 62, 14, '#2a2a30');
  Q('#cfd6de', [50, -46, 60, -46, 84, -152, 74, -154]);
  R(60, -164, 44, 9, '#2a2a30');
  O(86, -122, 8, '#ffe9a0', 2);
}
function car(col = CARS[0]) {                       // a saloon, 300 long
  Q(col, [-150, -28, -150, -80, -122, -88, -58, -90, -30, -136, 52, -136, 86, -92, 140, -84, 150, -58, 150, -28]);
  Q('#bfe3ff', [-22, -96, 0, -128, 26, -128, 26, -96], 2); Q('#bfe3ff', [34, -96, 34, -128, 50, -128, 74, -96], 2);
  g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(-146, -58, 292, 3);
  g.fillStyle = '#ffe9a0'; g.fillRect(138, -78, 11, 13); g.fillStyle = '#ff5050'; g.fillRect(-149, -78, 8, 12);
  wheel(-90, -28, 27); wheel(92, -28, 27);
}
function bus() {                                    // a city bus, 640 long
  R(-320, -252, 640, 224, '#f2c230'); R(-320, -122, 640, 14, '#26262c', 2);
  for (let i = 0; i < 7; i++) R(-292 + i * 78, -230, 58, 72, '#bfe3ff', 2);
  R(256, -230, 54, 152, '#9fcbe8', 2); g.fillStyle = '#ffe9a0'; g.fillRect(308, -72, 12, 18); g.fillStyle = '#ff5050'; g.fillRect(-319, -80, 8, 18);
  wheel(-212, -30, 33); wheel(202, -30, 33);
}
function engine() {                                 // a fire engine
  R(-262, -172, 384, 144, '#d8262c'); R(120, -214, 142, 186, '#d8262c'); R(150, -200, 98, 64, '#bfe3ff', 2);
  R(-252, -198, 362, 12, '#cfd6de', 2); for (let i = 0; i < 9; i++) R(-246 + i * 40, -198, 4, 12, '#9aa3ad', 1);
  R(-222, -132, 92, 72, '#cfd6de', 2); O(-176, -96, 26, '#e9e2c9', 2);
  g.fillStyle = '#ffe9a0'; g.fillRect(256, -82, 10, 16); g.fillStyle = '#4a7ef0'; g.fillRect(140, -226, 30, 12); g.fillStyle = '#ff4a4a'; g.fillRect(200, -226, 30, 12);
  wheel(-172, -28, 30); wheel(28, -28, 30); wheel(190, -28, 30);
}
function ext() {                                    // a fire extinguisher, along x: the bottle, the valve, the hose and its horn out the front
  R(-10, -15, 86, 30, '#d8262c'); R(76, -9, 14, 18, '#26262c', 2); R(84, -21, 22, 6, '#cfd6de', 2);
  g.strokeStyle = LINE; g.lineWidth = 6 * LWK; g.beginPath(); g.moveTo(90, 4); g.quadraticCurveTo(116, 30, 128, 8); g.stroke();
  Q('#26262c', [124, 2, 152, -9, 152, 23, 128, 16], 2); g.fillStyle = '#f4f1e6'; g.fillRect(14, -8, 30, 14);
}
function nozzle() { R(-6, -6, 46, 12, '#3a3d46', 2.5); Q('#cfd6de', [40, -9, 62, -5, 62, 5, 40, 9], 2); }
function house() {
  const w = 330, h = 230;
  R(-w / 2, -h, w, h, '#efe3cd'); R(w * .24, -h - 112, 38, 84, '#8a7a6a');
  Q('#9b3b2e', [-w / 2 - 30, -h + 4, 0, -h - 160, w / 2 + 30, -h + 4]);
  g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 2 * LWK; for (let i = 1; i < 4; i++) { const y = -h - 160 + i * 40, hw = (w / 2 + 30) * i / 4; g.beginPath(); g.moveTo(-hw, y); g.lineTo(hw, y); g.stroke(); }
  R(-30, -106, 60, 106, '#6b4a2e'); O(18, -52, 4, '#e2b545', 1.5);
  for (const x of [-w * .4, w * .18]) { R(x, -h + 46, 70, 58, '#bfe3ff', 2.5); R(x + 33, -h + 46, 4, 58, '#efe3cd', 1.5); R(x, -h + 73, 70, 4, '#efe3cd', 1.5); }
  R(-w / 2, -14, w, 14, '#a99a86', 2);
}
function mansion() {
  const w = 880, h = 420;
  R(-w / 2, -h, w, h, '#f2ead8'); Q('#5a5f6e', [-w / 2 - 40, -h + 4, -w / 2 + 120, -h - 170, w / 2 - 120, -h - 170, w / 2 + 40, -h + 4]);
  for (const x of [-w * .32, w * .26]) R(x, -h - 230, 46, 90, '#8a7a6a');
  Q('#e8dcc4', [-150, -h + 4, 0, -h - 120, 150, -h + 4], 3);      // the front gable
  for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { if (r === 1 && (i === 2 || i === 3)) continue; R(-w / 2 + 50 + i * 136, -h + 50 + r * 190, 76, 96, '#bfe3ff', 2.5); }
  for (const x of [-150, -60, 60, 150]) R(x - 12, -h + 10, 24, h - 24, '#fbf7ec', 2);
  R(-44, -170, 88, 170, '#6b4a2e'); R(-w / 2, -18, w, 18, '#a99a86', 2);
}
function fridge() { R(-52, -196, 104, 196, '#f4f6f8'); R(-52, -128, 104, 4, '#c9d0d8', 1.5); R(36, -186, 6, 40, '#9aa3ad', 1.5); R(36, -116, 6, 50, '#9aa3ad', 1.5); }
function telly() { R(-80, -100, 160, 96, '#1d1e23'); R(-70, -92, 140, 78, '#3a4a6a', 2); R(-30, -6, 60, 6, '#1d1e23', 2); }
function lamp() { Q('#f2d28a', [-40, -170, 40, -170, 26, -120, -26, -120], 2.5); R(-4, -120, 8, 112, '#3a3d46', 2); R(-30, -10, 60, 10, '#3a3d46', 2); }
function pistol() { Q('#2a2c33', [-4, 2, 14, 2, 8, 30, -8, 30], 2.5); R(-8, -10, 64, 14, '#3a3d46', 2.5); R(54, -8, 8, 9, '#17171b', 2); }
function sniper() { Q('#3b4a3c', [-44, -3, 0, -10, 0, 12, -40, 18], 2.5); R(-2, -8, 172, 13, '#2c3a2e', 2.5); R(168, -5, 92, 7, '#17171b', 2); R(30, -27, 72, 12, '#17171b', 2); O(32, -21, 7, '#4a6aa0', 2); R(84, 5, 10, 26, '#17171b', 2); }
function katana() { R(-18, -4, 34, 8, '#3a2f4a', 2.5); R(14, -10, 5, 20, '#c9a53a', 2); Q(STEEL, [19, -4, 178, -3, 194, 1, 19, 4], 2); }
function chainHeld() { g.lineWidth = 3 * LWK; for (let i = 0; i < 10; i++) { g.strokeStyle = LINE; g.fillStyle = '#9aa3b5'; g.beginPath(); g.ellipse(i * 15, 0, 9, i % 2 ? 3 : 6, 0, 0, TAU); g.fill(); g.stroke(); } }
function cloudHeld() { for (let i = 0; i < 3; i++) R(-6 + i * 64, -6, 58, 12, '#ff5a6e', 2.5); g.fillStyle = '#c9a53a'; for (let i = 0; i < 2; i++) g.fillRect(52 + i * 64, -3, 6, 6); }
function spearHeld() { R(-20, -3, 180, 6, '#c9a53a', 2); Q(GOLD, [158, -10, 214, 0, 158, 10], 2); Q(GOLD, [150, -4, 176, -22, 168, -4], 1.5); Q(GOLD, [150, 4, 176, 22, 168, 4], 1.5); }
function ticket(col) { R(-4, -20, 74, 40, '#fbf8ee', 2); R(-4, -20, 74, 11, col, 2); g.fillStyle = 'rgba(30,24,20,.55)'; g.fillRect(6, 0, 40, 3); g.fillRect(6, 8, 28, 3); g.font = `bold 16px Anton, Impact, sans-serif`; g.fillStyle = LINE; g.fillText('%', 50, 13); }
const HELD = {
  bat: () => bat(150), ball: () => { g.translate(12, 0); ball(13); },
  bigbat: () => { g.translate(-12, 0); g.scale(2.3, 2.3); LWK = 1 / 2.3; bat(150, GOLD); LWK = 1; },
  knife, cleaver, chair: chairHeld, ext, hose: nozzle, pistol, sniper, katana, chain: chainHeld, cloud: cloudHeld, spear: spearHeld,
  ticketC: () => ticket(CPN), ticketX: () => ticket(XTR), ticketP: () => ticket(GOLD) };
// drawn along whichever arm holds it, out from the hand the way the arm points (as tools.js holds its tools)
function inHand(p, front, fn) {
  const ps = p.pose, an = front ? ps[2] : ps[3], w = E.hand(p, front), a = F(w[0], w[1]), b = F(w[0] + Math.sin(an) * p.face * 100, w[1] - Math.cos(an) * 100), k = a[2];
  g.save(); g.translate(a[0], a[1]); g.rotate(Math.atan2(b[1] - a[1], b[0] - a[0])); g.scale(k, k * p.face); fn(); g.restore();
}

/* ================= the things out in the world ================= */
const props = [];                                   // { x, y, vx, vy, rot, face, t, life, draw(e), upd(e, dt, o), back (drawn behind the fighters), a, s }
function prop(e) { const q = Object.assign({ t: 0, life: 4, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, g: 0, face: 1 }, e); props.push(q); return q; }
const later = (wait, fn) => prop({ life: wait + .05, upd(e) { if (!e.f && e.t >= wait) { e.f = 1; fn(); } } });
function propsTick(dt) {
  const o = E.P2;
  for (let i = props.length - 1; i >= 0; i--) {
    const e = props[i];
    e.t += dt;
    if (e.upd) e.upd(e, dt, o); else { e.vy -= e.g * dt; e.x += e.vx * dt; e.y += e.vy * dt; e.rot += e.vr * dt; }
    if (e.gone || e.t >= e.life) props.splice(i, 1);
  }
}
function propsDraw(back) {
  for (const e of props) {
    if (!e.draw || !!e.back !== back || e.a === 0) continue;
    const c = F(e.x, e.y), s = e.s || 1, k = c[2] * s;
    g.save(); g.translate(c[0], c[1]); g.scale(k * e.face, k); if (e.rot) g.rotate(e.rot);
    g.globalAlpha = e.a === undefined ? 1 : e.a; LWK = 1 / s; e.draw(e);
    g.restore(); LWK = 1; g.globalAlpha = 1;
  }
}
function shadows() {                                // the shadows of whatever is coming down, before it does
  for (const e of props) {
    if (!e.shadow || e.phase !== 'fall') continue;
    const c = F(e.x, 0), u = clamp(1 - e.y / (e.from || 1200), .12, 1);
    g.fillStyle = `rgba(0,0,0,${.45 * u})`; g.beginPath(); g.ellipse(c[0], c[1], e.shadow * c[2] * u, e.shadow * .17 * c[2] * u, 0, 0, TAU); g.fill();
  }
}
// something bought over their heads: the shadow of it, and then all of it. hitThem when it reaches them, landed when it is down, broke when it goes
function drop(o, opt) {
  const p = E.P1, x0 = live(o) ? o.x : p.x + p.face * 360, from = opt.from || 1400;
  return prop(Object.assign({ x: x0, y: from, from, vy: 0, life: 12, phase: 'fall', track: .42, wait: .22, gr: 4600, hw: 120, keep: .4, upd: dropping }, opt));
}
function dropping(e, dt, o) {
  if (e.phase === 'fall') {
    if (e.t < e.track && live(o)) e.x = lerp(e.x, o.x, 1 - Math.exp(-dt * 12));      // (it finds them while it is still high)
    if (e.t < e.wait) return;
    e.vy -= e.gr * dt; e.y = Math.max(0, e.y + e.vy * dt);
    if (!e.struck && can(o) && Math.abs(o.x - e.x) < e.hw + 40 * hs(o) && e.y <= top(o)) { e.struck = 1; if (e.hitThem) e.hitThem(e, o); }
    if (e.y <= 0) { e.phase = 'rest'; e.t0 = e.t; if (e.landed) e.landed(e, o); }
    return;
  }
  if (e.rest) { e.rest(e, dt, o); return; }
  if (e.t > e.t0 + e.keep) { if (e.broke) e.broke(e); e.gone = 1; }
}

/* ================= the deck ================= */
const CARD_IDS = ['home', 'hitrun', 'kitchen', 'express', 'road', 'furn', 'ext', 'final', 'coupon', 'extra'];
const deck = { hand: {}, line: [], armed: null, used: {}, ammo: {} };      // the four on the keys; the rest in line (line[0] is NEXT); a coupon waiting for a move; each key's last wait; a weapon's bullets
function deal() {
  const all = CARD_IDS.slice();
  for (let i = all.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [all[i], all[j]] = [all[j], all[i]]; }
  SLOTS.forEach((k, i) => { deck.hand[k] = all[i]; });
  deck.line = all.slice(4); deck.armed = null; deck.used = {}; deck.ammo = {};
}
function cycle(k) { const used = deck.hand[k]; deck.hand[k] = deck.line.shift(); if (used && !WEAPON[used]) deck.line.push(used); }      // to the back with it, and NEXT in its place
// the first moment of a card's move: spent (a variant spends the coupon that made it)
function dealt(k, v) { if (v === 'c' || v === 'x') deck.armed = null; if (!k) return; deck.used[k] = E.CD[k]; cycle(k); }
function card(id, v, def) {
  const run = def.run;
  return Object.assign(def, { reg: 1, card: id, v, run(p, m, t) { if (!m.dealt) { m.dealt = 1; dealt(m.key, v); } run(p, m, t); } });
}

/* ================= poses: [lean, head, armF, armB, legF, legB, rot] ================= */
const RP = {
  sum: [-.05, -.16, 2.9, .5, .3, -.3, 0], point: [.1, -.08, 2.0, .45, .34, -.34, 0],
  batUp: [-.16, -.06, 3.0, 2.75, .36, -.42, 0], batSw: [.38, .05, 1.35, 1.25, .62, -.56, 0], batFo: [.3, .1, .4, .3, .56, -.5, 0],
  pitchW: [-.24, -.1, .95, -1.4, .48, -.3, 0], pitch: [.44, 0, .25, 2.05, .74, -.42, 0],
  scoot: [.06, 0, 1.5, 1.4, 1.3, 1.05, 0],
  knW: [-.06, 0, 2.5, 2.4, .32, -.32, 0], knA: [.24, 0, 1.75, .15, .52, -.46, 0], knB: [.32, 0, .35, 1.8, .56, -.5, 0], knX: [.42, .05, 1.05, 1.0, .64, -.56, 0],
  clvUp: [-.14, -.12, 3.05, .5, .32, -.36, 0], clv: [.56, .22, 1.0, .3, .72, -.55, 0],
  chairUp: [-.14, -.12, 3.05, 3.0, .32, -.36, 0], chairDn: [.5, .2, 1.05, 1.0, .72, -.56, 0],
  spray: [.18, 0, 1.55, 1.38, .46, -.4, 0], extW: [-.16, 0, 2.8, 2.65, .36, -.36, 0], extSw: [.46, .1, 1.0, .9, .66, -.55, 0],
  aim: [.04, 0, 1.62, .55, .36, -.36, 0], aim2: [.1, .06, 1.57, 1.47, .46, -.4, 0],
  elbow: [.95, .3, .35, 2.5, .55, -.3, 0], ticket: [.05, -.05, 2.0, 1.75, .3, -.3, 0]
};

/* ================= 1 — HOME RUN ================= */
function batHit(p, o, col, hard, word = 'カキーン') {      // what a bat sounds like when it is a good one
  const x = o.x - p.face * 20, y = mid(o);
  sfx.snap(); sfx.hit(true); shake(hard ? 34 : 20);
  V.sparks(x, y, 'white', hard ? 18 : 10); V.ring(x, y, hard ? 320 : 200, '#ffffff', .28);
  if (Z) Z.flare(x, y, WHITE, hard ? 520 : 300, .2);
  if (word) ono(word, x, o.y + 430 * hs(o), col, hard ? 1.3 : 1, .9);
}
function swingAt(p, m, u, r, dmg, more, col, hard, word) {      // round and through them, u into the swing: true the moment it lands
  p.target = RP.batSw; p.vx = u < .06 && roomAhead(p) ? p.face * 380 : 0;
  if (!m.sw) { m.sw = 1; sfx.whoosh(); }
  if (!m.done && u < .12 && reach(p, r, dmg, more)) { m.done = 1; batHit(p, E.P2, col, hard, word); return true; }
  return false;
}
function runIn(p, o, t, until, stop, speed = 2300) {      // in at them, while they are still where they were: true while he still is
  if (!live(o) || t >= until || gap(p, o) <= stop) return false;
  p.vx = roomAhead(p) ? p.face * speed : 0;
  if (Z && Math.random() < .5) Z.dust(p.x, 1, -p.face);
  return true;
}
const HOME = card('home', 'o', { name: 'Home Run', cd: 9, dur: 1, run(p, m, t) {
  const o = E.P2;
  p.rate = 42; m.prop = 'bat';
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'HOME RUN'); }
  if (t < .2) { p.vx = 0; p.target = RP.batUp; return; }
  if (t < .36) { swingAt(p, m, t - .2, 235, 26, { kb: 1300, lift: 650, stun: 1, stop: .14, heavy: 1, col: WOOD, flung: 1 }, PAPER); return; }
  p.vx = 0; p.target = t < .56 ? RP.batFo : POSE.idle;
  if (t > .68) { gone(p); E.endMove(p); }
} });
function pitch(p, o) {                              // a fastball, at their middle
  const h = E.hand(p, false), f = p.face, tx = live(o) ? o.x : p.x + f * 900, ty = live(o) ? mid(o) : h[1], sp = 2700, tt = Math.max(.06, Math.abs(tx - h[0]) / sp), dir = tx - h[0] >= 0 ? 1 : -1;
  sfx.whoosh();
  prop({ x: h[0], y: h[1], vx: dir * sp, vy: (ty - h[1]) / tt, vr: 28, life: 1.2, draw: () => ball(13), upd(e, dt, o) {
    e.x += e.vx * dt; e.y += e.vy * dt; e.rot += e.vr * dt;
    if (Z && Math.random() < .8) Z.emit(1, e.x, e.y, -e.vx * .05, -e.vy * .05, 4, .12, WHITE);      // (the air off it)
    if (touch(e.x, e.y, 16, 16, o)) {
      e.gone = 1; hit(o, dir, 50, { kb: 120, stun: 1.2, stop: .12, heavy: 1, col: '#ffffff' });
      sfx.ball(1.6); sfx.hit(true); shake(14); V.sparks(e.x, e.y, 'white', 10); V.ring(e.x, e.y, 150, '#ffffff', .2); ono('バシッ', e.x, e.y + 200, CPN, 1, .6);
    } else if (e.y < 0 || Math.abs(e.x) > 2000) e.gone = 1;
  } });
}
// the user's: a baseball first (50), and then the bat (100)
const HOME_C = card('home', 'c', { name: 'Home Run: Pitch', cd: 12, dur: 1.8, run(p, m, t) {
  const o = E.P2;
  p.rate = 44;
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'HOME RUN: PITCH', CPN); }
  if (t < .28) { p.vx = 0; p.target = RP.pitchW; m.prop2 = t > .05 ? 'ball' : null; return; }      // the ball back in the throwing hand
  if (!m.thrown) { m.thrown = 1; m.prop2 = null; pitch(p, o); }
  if (t < .44) { p.vx = 0; p.target = RP.pitch; return; }
  m.prop = 'bat';
  if (t < .52) { p.vx = 0; p.target = RP.batUp; return; }
  if (m.at === undefined) { p.target = RP.batUp; if (runIn(p, o, t, .95, 175)) return; m.at = t; p.vx = 0; }      // and in at them with the bat, while they are still seeing stars
  const u = t - m.at;
  if (u < .1) { p.target = RP.batUp; return; }
  if (u < .26) { swingAt(p, m, u - .1, 245, 100, { kb: 1700, lift: 760, stun: 1, stop: .2, heavy: 1, col: WOOD, flung: 1 }, CPN, true); return; }
  p.vx = 0; p.target = u < .46 ? RP.batFo : POSE.idle;
  if (u > .58) { gone(p); E.endMove(p); }
} });
function fireworks(x) { ['255,90,110', CRGB, GRGB, '159,232,255', XRGB].forEach((rgb, i) => later(.25 + i * .16, () => { if (Z) Z.boom(clamp(x + rnd(-500, 500), -1100, 1100), rnd(560, 820), rnd(40, 60), rgb, { n: 16, clean: 1, shake: 0, flash: 0 }); sfx.ball(.7); })); }
// extra: the same bat three times the size, in gold, and they leave the ballpark (160)
const HOME_X = card('home', 'x', { name: 'Home Run: Grand Slam', cd: 14, dur: 1.9, run(p, m, t) {
  const o = E.P2;
  p.rate = 36; m.prop = 'bigbat';
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'HOME RUN: GRAND SLAM', XTR); sfx.rise(.5); }
  if (t < .5) { p.vx = 0; p.target = RP.batUp; if (Z && Math.random() < .5) { const h = E.hand(p, true); Z.emit(5, h[0] + rnd(-140, 140), h[1] + rnd(60, 320), rnd(-60, 60), rnd(60, 200), rnd(3, 6), rnd(.3, .6), GRGB); } return; }      // wound right back, the gold of it catching the light
  if (m.at === undefined) { p.target = RP.batUp; if (runIn(p, o, t, 1, 250, 2400)) return; m.at = t; p.vx = 0; }
  const u = t - m.at;
  if (u < .2) {
    if (swingAt(p, m, u, 345, 160, { kb: 2400, lift: 950, stun: 1.2, stop: .28, heavy: 1, col: GOLD, flung: 1 }, GOLD, true, null)) { big(p, o, 'ホームラン', GOLD, 'neg'); label(o.x, 640, 'HOME RUN!', GOLD, 1.6); fireworks(o.x); }
    return;
  }
  p.vx = 0; p.target = u < .5 ? RP.batFo : POSE.idle;
  if (u > .64) { gone(p); E.endMove(p); }
} });

/* ================= 2 — HIT AND RUN ================= */
const RIDE_Y = 54, SCOOT = 1.2;
let riding = false;                                 // he is sat on it this frame (and up off the floor for the seat)
function vroom(o, col, word = 'ドンッ') { sfx.blast(); sfx.hit(true); shake(22); V.sparks(o.x, mid(o), 'white', 10); ono(word, o.x, o.y + 420 * hs(o), col, 1, .7); }
function scooting(p, m, dt, max = 1900) {          // on it and going: false once there is no more floor ahead of him
  riding = true; m.prop = 'scooter'; p.target = RP.scoot; p.y = RIDE_Y; p.vy = 0; p.ground = true;
  m.v = Math.min(max, (m.v || 0) + 7500 * dt);
  const room = Math.abs(p.x + p.face * 100) < bound() - 5;
  p.vx = room ? p.face * m.v : 0;
  if (Z && Math.random() < .5) Z.emit(2, p.x - p.face * 120, 26, -p.face * rnd(60, 160), rnd(10, 60), rnd(18, 30), rnd(.4, .7), '190,190,196', { s1: 2, a: .5, dr: 2 });      // (out of the back of it)
  return room;
}
function hopOff(p, m) {                             // off it; it goes on without him, and is gone
  const f = p.face, v = Math.max(700, (m.v || 0) * .6);
  p.ground = false; p.vy = 560; p.vx = -f * 160; m.prop = null; m.tilt = 0;
  prop({ x: p.x + f * 58, y: 0, face: f, s: SCOOT, life: .8, draw: () => scooter(), upd(e, dt) { e.x += f * v * Math.exp(-e.t * 3) * dt; if (e.t > .62 && !e.f) { e.f = 1; receipt(e.x, 90, 8); e.a = 0; } } });
}
const ended = (p, m, t, t0) => { p.target = POSE.idle; if ((p.ground && t > t0 + .3) || t > t0 + .8) E.endMove(p); };
const HIT_RUN = card('hitrun', 'o', { name: 'Hit and Run', cd: 10, dur: 2.4, run(p, m, t) {
  const o = E.P2, dt = dtOf(m, t);
  p.rate = 40;
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'HIT AND RUN'); }
  if (t < .16) { p.vx = 0; p.target = RP.sum; return; }
  if (m.off !== undefined) { ended(p, m, t, m.off); return; }
  const going = scooting(p, m, dt);
  if (!m.hit && touch(p.x + p.face * 80, 70, 90, 70, o)) { m.hit = t; hit(o, p.face, 24, { kb: 520, stun: 1.3, stop: .12, heavy: 1, col: RED }); down(o, 1.3); vroom(o, PAPER); }
  if ((m.hit && t > m.hit + .3) || t > 1.4 || !going) { m.off = t; hopOff(p, m); }
} });
// coupon: through them, round, back through them, round, and up on its back wheel over them (40, 40, 50)
const HIT_RUN_C = card('hitrun', 'c', { name: 'Hit and Run: Hit Again', cd: 14, dur: 4.5, run(p, m, t) {
  const o = E.P2, dt = dtOf(m, t);
  p.rate = 40;
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'HIT AND RUN: HIT AGAIN', CPN); m.pass = 0; m.passT = .16; }
  if (t < .16) { p.vx = 0; p.target = RP.sum; return; }
  if (m.off !== undefined) { ended(p, m, t, m.off); return; }
  if (m.turn !== undefined) {                       // round, skidding, for another go at them
    riding = true; m.prop = 'scooter'; p.target = RP.scoot; p.y = RIDE_Y; p.vx *= .82; m.v *= .8;
    if (Z && Math.random() < .7) Z.dust(p.x, 1, p.face);
    if (t > m.turn + .22) { m.turn = undefined; p.face = -p.face; m.v = 300; m.hit = 0; m.passT = t; sfx.rough(.6); }
    return;
  }
  const going = scooting(p, m, dt, 2000), last = m.pass === 2;
  m.tilt = last ? -.3 : 0;
  if (!m.hit && touch(p.x + p.face * 80, 70, 90, 80, o)) {
    m.hit = t;
    hit(o, p.face, last ? 50 : 40, last ? { kb: 1100, lift: 700, stun: 1, stop: .16, heavy: 1, col: CPN, flung: 1 } : { kb: 300, stun: 1.5, stop: .1, heavy: 1, col: CPN });
    if (!last) down(o, 1.6);
    vroom(o, CPN, last ? 'ドカッ' : 'ゴッ');
  }
  const past = m.hit && (live(o) ? (p.x - o.x) * p.face > 220 : t > m.hit + .3);
  if (past || !going || t > m.passT + 1.3) { if (last || !live(o)) { m.off = t; hopOff(p, m); } else { m.pass++; m.turn = t; } }
} });
function rider(p, i, last) {                        // a scooter with nobody on it, out of a receipt behind him and straight through where they are
  const f = p.face, x0 = clamp(p.x - f * 760, -1500, 1500), col = ['#ffb347', '#e64a4f', '#4fa3e6'][i % 3];
  receipt(clamp(p.x - f * 380, -bound(), bound()), 120, 6, XRGB);
  prop({ x: x0, y: 0, face: f, s: SCOOT, life: 1.6, draw: () => scooter(col), upd(e, dt, o) {
    e.x += f * 2700 * dt;
    if (Z && Math.random() < .6) Z.emit(2, e.x - f * 120, 26, -f * 100, 30, 22, .5, '190,190,196', { s1: 2, a: .45, dr: 2 });
    if (!e.hit && touch(e.x + f * 70, 70, 90, 80, o)) {
      e.hit = 1;
      hit(o, f, 45, last ? { kb: 1200, lift: 680, stun: 1, stop: .14, heavy: 1, col: XTR, flung: 1 } : { kb: 300, stun: 1.5, stop: .1, heavy: 1, col: XTR });
      if (!last) down(o, 1.5);
      vroom(o, XTR, last ? 'ドカッ' : 'ゴッ');
    }
    if (Math.abs(e.x) > 1700) e.gone = 1;
  } });
}
// extra: three of them, one after another, and he is up out of their way (45 each)
const HIT_RUN_X = card('hitrun', 'x', { name: 'Hit and Run: Rush Hour', cd: 14, dur: 2, run(p, m, t) {
  p.rate = 40;
  if (!m.s) { m.s = 1; facing(p, E.P2); buy(p, 'HIT AND RUN: RUSH HOUR', XTR); m.n = 0; }
  const due = t < .14 ? 0 : Math.min(3, Math.floor((t - .14) / .2) + 1);
  while (m.n < due) { rider(p, m.n, m.n === 2); m.n++; }
  if (!m.hop && t > .2) { m.hop = 1; p.ground = false; p.vy = 1250; p.vx = 0; }
  p.target = !p.ground ? POSE.jump : t < .2 ? RP.point : POSE.idle;
  if ((m.hop && p.ground && t > .5) || t > 1.9) E.endMove(p);
} });

/* ================= 3 — KITCHEN NIGHTMARE ================= */
const SL_AT = .14, SL_EVERY = .085;
// two knives, one after the other (n of them), and a cross with both to finish if there is one: true when they are done
function slashes(p, m, t, n, dmg, col, fin) {
  const o = E.P2, all = n + (fin ? 1 : 0), c = Math.min(all, Math.floor((t - SL_AT) / SL_EVERY) + 1);
  p.vx = gap(p, o) > 165 && roomAhead(p) ? p.face * 320 : 0;
  while ((m.n || 0) < c) {
    m.n = (m.n || 0) + 1;
    const last = fin && m.n === all, y = p.y + 150 + rnd(-30, 60), a = (p.face > 0 ? 0 : Math.PI) + (m.n % 2 ? -.5 : .5) * p.face;
    p.target = last ? RP.knX : m.n % 2 ? RP.knA : RP.knB;
    if (m.n % 2) sfx.cut(1.1); else sfx.snip(1.1);
    V.slash(p.x + p.face * 150, y, a, last ? 420 : 300, '#ffffff', last ? 14 : 8);
    if (last) V.slash(p.x + p.face * 150, y, a + (m.n % 2 ? 1 : -1), 420, '#ffffff', 14);
    if (reach(p, 205, last ? fin.dmg : dmg, last ? fin.more : { kb: 30, stun: .45, stop: .025, col })) { V.sparks(o.x - p.face * 20, mid(o), 'white', last ? 10 : 3); if (last) { sfx.hit(true); shake(16); } }
  }
  return m.n >= all;
}
const KITCHEN = card('kitchen', 'o', { name: 'Kitchen Nightmare', cd: 9, dur: 1.6, run(p, m, t) {
  const o = E.P2;
  p.rate = 52; m.prop = 'knife'; m.prop2 = 'knife';
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'KITCHEN NIGHTMARE'); }
  if (t < SL_AT) { p.vx = 0; p.target = RP.knW; return; }
  if (m.at === undefined) { p.target = RP.knW; if (runIn(p, o, t, .7, 185, 2000)) return; m.at = t - SL_AT; }      // (in reach of them first)
  if (m.over === undefined) { if (slashes(p, m, t - m.at, 8, 3, STEEL, { dmg: 6, more: { kb: 700, lift: 330, stun: .8, stop: .12, heavy: 1, col: STEEL } })) m.over = t; return; }
  p.vx = 0; p.target = t < m.over + .12 ? RP.knX : POSE.idle;
  if (t > m.over + .24) { gone(p); gone(p, false); E.endMove(p); }
} });
// coupon: the knives, and then a meat cleaver down on them from over his head (8 x 5, and 90)
const KITCHEN_C = card('kitchen', 'c', { name: 'Kitchen Nightmare: Meat Cleaver', cd: 13, dur: 2.2, run(p, m, t) {
  const o = E.P2;
  p.rate = 52;
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'KITCHEN NIGHTMARE: MEAT CLEAVER', CPN); }
  if (t < SL_AT) { p.vx = 0; p.target = RP.knW; m.prop = m.prop2 = 'knife'; return; }
  if (m.at === undefined) { p.target = RP.knW; if (runIn(p, o, t, .7, 185, 2000)) return; m.at = t - SL_AT; }
  if (m.over === undefined) { m.prop = m.prop2 = 'knife'; if (slashes(p, m, t - m.at, 8, 5, CPN)) { m.over = t; gone(p); gone(p, false); sfx.rip(); } return; }
  const u = t - m.over;
  m.prop = 'cleaver'; m.prop2 = null;
  if (u < .26) { p.target = RP.clvUp; p.vx = 0; if (u > .1 && !m.hop) { m.hop = 1; p.ground = false; p.vy = 520; p.vx = 0; } return; }
  if (!m.chop) {
    m.chop = 1; p.target = RP.clv; sfx.whoosh();
    const ok = live(o) && Math.abs(o.x - p.x) < 260 && (o.x - p.x) * p.face > -40 && hit(o, p.face, 90, { kb: 200, stun: 1.4, stop: .22, heavy: 1, col: CPN });
    V.slash(p.x + p.face * 140, p.y + 200, p.face > 0 ? 1.3 : Math.PI - 1.3, 460, '#ffffff', 18);
    if (ok) { down(o, 1.4); sfx.hit(true); sfx.snap(); shake(30); big(p, o, 'ドスッ', CPN, 'neg'); } else shake(10);
  }
  p.target = u < .6 ? RP.clv : POSE.idle;
  if (u > .72) { gone(p); E.endMove(p); }
} });
function knives(p, i) {                             // four, thrown at once, one at each height of them
  const f = p.face, h = E.hand(p, i % 2 === 0);
  sfx.swish(1.2);
  for (let j = 0; j < 4; j++) {
    const y = p.y + [90, 150, 210, 270][j] + rnd(-10, 10);
    prop({ x: h[0], y: h[1], face: f, life: 1, vy: (y - h[1]) * 7, draw: () => knife(), upd(e, dt, o) {
      e.x += f * 2300 * dt; e.y += e.vy * dt; e.vy *= Math.exp(-dt * 12); e.rot = -Math.atan2(e.vy, 2300) * .6;
      if (touch(e.x + f * 40, e.y, 30, 14, o)) { e.gone = 1; hit(o, f, 11, { kb: 50, stun: .45, stop: .03, col: XTR }); V.sparks(e.x, e.y, 'white', 4); sfx.snip(1.3); }
      else if (Math.abs(e.x) > 1800) e.gone = 1;
    } });
  }
}
// extra: the whole knife block, twelve of them, in threes (11 each)
const KITCHEN_X = card('kitchen', 'x', { name: 'Kitchen Nightmare: Knife Block', cd: 13, dur: 1.4, run(p, m, t) {
  const o = E.P2;
  p.rate = 52;
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'KITCHEN NIGHTMARE: KNIFE BLOCK', XTR); m.n = 0; }
  const due = t < .2 ? 0 : Math.min(3, Math.floor((t - .2) / .2) + 1);
  while (m.n < due) { knives(p, m.n); m.n++; }
  p.vx = 0; p.target = t < .2 ? RP.knW : m.n % 2 ? RP.knA : RP.knB;
  m.prop = m.n < 3 ? 'knife' : null; m.prop2 = m.n < 2 ? 'knife' : null;
  if (t > .95) E.endMove(p);
} });

/* ================= 4 — EXPRESS DELIVERY ================= */
let trap = null;                                    // { o, x, t, life, e }: shut in under what was delivered
function shut(e, o, life) { trap = { o, x: e.x, t: 0, life, e }; hold(o, .4); label(o.x, o.y + 440, 'TRAPPED', CARD, 1); }
function trapTick(dt) {
  const s = trap, o = s.o;
  if (o !== E.P2 || !live(o) || (s.t += dt) >= s.life || s.e.gone) { if (!s.e.gone) { unbox(s.e); s.e.gone = 1; } trap = null; return; }
  if (holdable(o)) { Object.assign(o, { x: s.x, vx: 0, state: o.state === 'down' ? 'down' : 'hurt', stun: Math.max(o.stun || 0, .3), act: null, tele: 0 }); if (o.ai) o.ai.t = Math.max(o.ai.t || 0, .3); }
}
function unbox(e) { bits(e.x, 120, 16, CRD, 520, 13); receipt(e.x, 150, 6); sfx.rough(.6); }      // and out of it they come, through the side of it
function stack(o, n, more) {                        // n boxes, one on another, coming down on them
  return drop(o, Object.assign({ n, seed: rnd(0, 100), shadow: 120, hw: 110, from: 1250, draw: e => boxes(e.n, e.seed),
    landed(e) { thud(e.x, false); bits(e.x, 40, 6, CRD, 300, 9); },
    rest(e) { if (!(trap && trap.e === e) && e.t > e.t0 + .5) { unbox(e); e.gone = 1; } } }, more));
}
const EXPRESS = card('express', 'o', { name: 'Express Delivery', cd: 12, dur: .8, run(p, m, t) {
  const o = E.P2;
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'EXPRESS DELIVERY'); stack(o, 4, { hitThem(e, o) { hit(o, side(p.x, o), 20, { kb: 0, stun: 2.2, stop: .12, heavy: 1, col: CARD }); shut(e, o, 2.2); sfx.hit(true); } }); }
  p.vx = 0; p.target = t < .5 ? RP.point : POSE.idle;
  if (t > .62) E.endMove(p);
} });
// coupon: the boxes, and a crate on top of them that took six men to lift (30, and 100)
const EXPRESS_C = card('express', 'c', { name: 'Express Delivery: Heavy Freight', cd: 15, dur: .9, run(p, m, t) {
  const o = E.P2;
  if (!m.s) {
    m.s = 1; facing(p, o); buy(p, 'EXPRESS DELIVERY: HEAVY FREIGHT', CPN);
    stack(o, 3, { hitThem(e, o) {
      hit(o, side(p.x, o), 30, { kb: 0, stun: 2.8, stop: .12, heavy: 1, col: CPN }); shut(e, o, 2.8); sfx.hit(true);
      later(.55, () => drop(o, { from: 1500, wait: 0, track: .2, shadow: 130, hw: 120, keep: .3, draw: () => crate(),
        hitThem(c, o) { hit(o, side(c.x, o), 100, { kb: 0, stun: 1.4, stop: .22, heavy: 1, col: CPN }); down(o, 1.4); if (trap) { unbox(trap.e); trap.e.gone = 1; } big(p, o, 'ドゴォ', CPN, 'neg'); },
        landed(c) { thud(c.x, true); bits(c.x, 80, 14, '143,93,44', 600, 14); },
        broke(c) { bits(c.x, 100, 18, '143,93,44', 520, 14); receipt(c.x, 140, 10); } }));
    } });
  }
  p.vx = 0; p.target = t < .55 ? RP.point : POSE.idle;
  if (t > .7) E.endMove(p);
} });
// extra: a bulk order, ten boxes one after another, and a heap of them round them (13 each)
const EXPRESS_X = card('express', 'x', { name: 'Express Delivery: Bulk Order', cd: 15, dur: 2, run(p, m, t) {
  const o = E.P2;
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'EXPRESS DELIVERY: BULK ORDER', XTR); m.n = 0; m.heap = null; }
  const due = Math.min(10, Math.floor(t / .12) + 1);
  while (m.n < due) {
    const i = m.n++;
    drop(o, { from: 1100 + i * 30, wait: 0, track: .16, shadow: 80, hw: 90, gr: 5200, draw: e => box(e.w, e.h), w: rnd(110, 140), h: rnd(78, 96), keep: .15, rot: rnd(-.2, .2),
      hitThem(e, o) {
        hit(o, side(p.x, o), 13, { kb: 0, stun: 1, stop: .04, col: XTR }); sfx.land(); sfx.hit(false);
        if (!m.heap) { m.heap = prop({ x: o.x, y: 0, life: 9, n: 0, seed: rnd(0, 100), draw: q => boxes(Math.min(5, q.n), q.seed), upd(q) { if (!(trap && trap.e === q)) { if (q.n) unbox(q); q.gone = 1; } } }); shut(m.heap, o, 3); }
        m.heap.n++;
      },
      landed(e) { sfx.land(); bits(e.x, 30, 3, CRD, 260, 8); }, broke(e) { bits(e.x, 40, 4, CRD, 200, 8); } });
  }
  p.vx = 0; p.target = t < 1.2 ? RP.point : POSE.idle;
  if (t > 1.35) E.endMove(p);
} });

/* ================= 5 — ROAD RAGE ================= */
function drive(p, opt) {                            // out of a receipt behind him, and flat out at them
  const f = p.face, len = opt.len || 300;
  receipt(clamp(p.x - f * 300, -bound(), bound()), 160, 8);
  sfx.roar(opt.len > 400 ? 1.3 : .9);
  return prop(Object.assign({ x: clamp(p.x - f * (800 + len), -2000, 2000), y: 0, face: f, life: 3.2, speed: 3000, len, upd: driving }, opt));
}
function driving(e, dt, o) {
  if (e.crashed === undefined) {
    e.x += e.face * e.speed * dt;
    if (Z && Math.random() < .5) Z.emit(2, e.x - e.face * e.len * .5, 30, -e.face * 120, 30, 26, .5, '170,170,176', { s1: 2, a: .4, dr: 2 });
    if (touch(e.x + e.face * e.len * .35, 90, e.len * .2, 90, o)) { e.crashed = e.t; e.crash(e, o); }
    else if (Math.abs(e.x) > 2200) e.gone = 1;
    return;
  }
  const u = e.t - e.crashed;
  e.x += e.face * e.speed * .25 * Math.exp(-u * 5) * dt;      // into them and on a little, braking
  if (Math.random() < .4) puffs(e.x + e.face * e.len * .4, 90, 1, '120,120,126', 40, 60, 160);      // (the bonnet smoking)
  if (e.after) e.after(e, u, o);
  if (u > (e.stay || .9) && !e.f) { e.f = 1; receipt(e.x, 120, 12); e.gone = 1; }
}
function crash(e, o, dmg, more, col, word = 'ドガッ') {      // (word null: something else says it)
  hit(o, e.face, dmg, more);
  sfx.blast(); sfx.snap(); sfx.rough(.8); shake(30); E.zoomIn(.25);
  const x = e.x + e.face * e.len * .45;
  bits(x, 120, 10, GLASS, 500, 6); V.sparks(x, 120, 'white', 12); if (Z) Z.flare(x, 120, WHITE, 360, .18);
  if (word) ono(word, o.x, o.y + 430 * hs(o), col, 1.2, .8);
}
function hopOver(p, m, e, near, vy) {               // up, and it goes under him
  if (!m.hop && e && (e.x - p.x) * p.face > -near) { m.hop = 1; p.ground = false; p.vy = vy; p.vx = 0; }
  p.target = !p.ground ? POSE.jump : m.hop ? POSE.idle : RP.point;
}
const ROAD = card('road', 'o', { name: 'Road Rage', cd: 14, dur: 2, run(p, m, t) {
  const o = E.P2;
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'ROAD RAGE'); const col = pick(CARS); m.car = drive(p, { draw: () => car(col), crash: (e, o) => crash(e, o, 40, { kb: 1600, lift: 640, stun: 1, stop: .18, heavy: 1, col: RED, flung: 1 }, PAPER) }); }
  hopOver(p, m, m.car, 520, 1150);
  if ((m.hop && p.ground && t > .45) || t > 1.9) E.endMove(p);
} });
// coupon: a full tank, and what a full tank does after (50, and 80)
const ROAD_C = card('road', 'c', { name: 'Road Rage: Full Tank', cd: 17, dur: 2, run(p, m, t) {
  const o = E.P2;
  if (!m.s) {
    m.s = 1; facing(p, o); buy(p, 'ROAD RAGE: FULL TANK', CPN);
    const col = pick(CARS);
    m.car = drive(p, { draw: () => car(col), stay: .6, crash: (e, o) => crash(e, o, 50, { kb: 700, lift: 300, stun: 1.2, stop: .16, heavy: 1, col: CPN }, CPN),
      after(e, u, o) {
        if (u < .34 || e.boomed) return;
        e.boomed = 1; const x = e.x;
        if (Z) { Z.boom(x, 90, 160, '255,140,60', { n: 24 }); Z.flash('255,170,90', .3, .3); }
        sfx.blast(); sfx.rough(1.2); shake(40); E.zoomIn(.35);
        bits(x, 100, 16, '40,40,44', 700, 14); bits(x, 100, 8, GLASS, 600, 6);
        if (Z) for (let i = 0; i < 2; i++) Z.emit(3, x, 60, rnd(-600, 600), rnd(700, 1100), 24, 1.6, '23,23,27', { g: 2000, vr: rnd(-12, 12), rot: rnd(0, TAU), edge: 'rgba(143,152,163,.8)' });      // (its wheels)
        if (can(o) && Math.abs(o.x - x) < 340 + 40 * hs(o)) { hit(o, side(x, o), 80, { kb: 1000, lift: 760, stun: 1, stop: .2, heavy: 1, col: '#ffa040', flung: 1 }); big(E.P1, o, 'ドカーン', CPN, 'neg'); }
        e.a = 0;
      } });
  }
  hopOver(p, m, m.car, 520, 1150);
  if ((m.hop && p.ground && t > .45) || t > 1.9) E.endMove(p);
} });
// extra: the bus (140)
const ROAD_X = card('road', 'x', { name: 'Road Rage: Bus', cd: 18, dur: 2.4, run(p, m, t) {
  const o = E.P2;
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'ROAD RAGE: BUS', XTR); m.car = drive(p, { len: 640, speed: 2700, draw: () => bus(), crash: (e, o) => { crash(e, o, 140, { kb: 2400, lift: 950, stun: 1.2, stop: .26, heavy: 1, col: XTR, flung: 1 }, XTR, null); big(E.P1, o, 'ドカーン', XTR, 'neg'); } }); }
  hopOver(p, m, m.car, 900, 1500);
  if ((m.hop && p.ground && t > .5) || t > 2.3) E.endMove(p);
} });

/* ================= 6 — FURNITURE FRENZY ================= */
function chairBreak(p, onThem, x, y) {              // over their head, and in pieces
  sfx.snap(); sfx.rough(.7); shake(onThem ? 22 : 10);
  bits(x, y, 14, WRGB, 420, 12);
  if (Z) for (let i = 0; i < 3; i++) Z.emit(3, x, y, rnd(-500, 500), rnd(300, 800), rnd(26, 40), rnd(.9, 1.4), WRGB, { g: 1800, vr: rnd(-16, 16), rot: rnd(0, TAU), w: .14, edge: 'rgba(30,20,12,.6)' });      // (its legs)
  if (onThem) ono('バキッ', x, y + 140, PAPER, 1.1, .7);
}
// the chair down on them and the kick after: dmg, kick, and whether it has to find them on the floor (down)
function chairAndKick(p, m, t, t0, dmg, kick, col) {
  const o = E.P2;
  if (m.smash === undefined) {
    m.prop = 'chair';
    if (t < t0 + .14) { p.vx = 0; p.target = RP.chairUp; return; }
    p.target = RP.chairUp; if (runIn(p, o, t, t0 + .6, 150, 1900)) return;
    p.vx = 0; m.smash = t; p.target = RP.chairDn; m.prop = null;
    const floor = live(o) && o.state === 'down', near = live(o) && Math.abs(o.x - p.x) < 240 && (o.x - p.x) * p.face > -40;
    const ok = floor ? near && hit(o, p.face, dmg, { kb: 0, stun: 1, stop: .14, heavy: 1, col }) : reach(p, 210, dmg, { kb: 60, stun: 1, stop: .14, heavy: 1, col });
    if (ok && floor) down(o, 1);
    chairBreak(p, ok, ok ? o.x : p.x + p.face * 170, ok ? top(o) : p.y + 220);
    return;
  }
  const u = t - m.smash;
  if (u < .18) { p.target = RP.chairDn; return; }
  if (u < .26) { p.target = POSE.kickWind; return; }
  if (!m.kick) {
    m.kick = 1; sfx.whoosh();
    const near = live(o) && Math.abs(o.x - p.x) < 240 && (o.x - p.x) * p.face > -40;
    if (near && hit(o, p.face, kick, { kb: 1100, lift: 320, stun: .9, stop: .12, heavy: 1, col })) { sfx.hit(true); shake(16); ono('ドカッ', o.x, o.y + 400 * hs(o), col, 1, .6); }
  }
  p.target = u < .5 ? POSE.kick : POSE.idle;
  if (u > .62) E.endMove(p);
}
const FURN = card('furn', 'o', { name: 'Furniture Frenzy', cd: 10, dur: 1.8, run(p, m, t) {
  p.rate = 44;
  if (!m.s) { m.s = 1; facing(p, E.P2); buy(p, 'FURNITURE FRENZY'); }
  chairAndKick(p, m, t, 0, 18, 12, PAPER);
} });
// coupon: the dining set. The table over onto them, and then the chair and the kick (60, 40, 30)
function flip(p, o, after) {
  const f = p.face, x0 = p.x + f * 90, x1 = live(o) ? o.x : p.x + f * 360;
  sfx.whoosh();
  return prop({ x: x0, y: 0, face: f, life: 1.6, draw: () => table(), upd(e, dt, o) {
    const u = Math.min(1, e.t / .42);
    e.x = lerp(x0, live(o) ? o.x : x1, u); e.y = 4 * 260 * u * (1 - u); e.rot = Math.PI * u;
    if (u >= 1 && !e.down) {
      e.down = 1; thud(e.x, false); sfx.rough(.7); bits(e.x, 60, 10, WRGB, 380, 12);
      if (can(o) && Math.abs(o.x - e.x) < 160) { hit(o, f, 60, { kb: 0, stun: 1.4, stop: .16, heavy: 1, col: CPN }); down(o, 1.4); ono('ガシャン', o.x, o.y + 360, CPN, 1.1, .8); }
      if (after) after();
    }
    if (e.down && e.t > .8 && !e.f) { e.f = 1; bits(e.x, 60, 12, WRGB, 400, 12); e.a = 0; }
  } });
}
const FURN_C = card('furn', 'c', { name: 'Furniture Frenzy: Dining Set', cd: 14, dur: 2.6, run(p, m, t) {
  const o = E.P2;
  p.rate = 44;
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'FURNITURE FRENZY: DINING SET', CPN); flip(p, o); }
  if (t < .5) { p.vx = 0; p.target = t < .2 ? RP.chairDn : RP.batFo; return; }      // the table over, onto them
  chairAndKick(p, m, t, .5, 40, 30, CPN);
} });
// extra: a sofa on them, and him off the top of it after it, elbow first (90, and 50)
const FURN_X = card('furn', 'x', { name: 'Furniture Frenzy: Sofa Slam', cd: 15, dur: 2.6, run(p, m, t) {
  const o = E.P2;
  p.rate = 44;
  if (!m.s) {
    m.s = 1; facing(p, o); buy(p, 'FURNITURE FRENZY: SOFA SLAM', XTR);
    m.sofa = drop(o, { from: 1200, shadow: 170, hw: 160, keep: 1.4, draw: () => sofa(),
      hitThem(e, o) { hit(o, side(p.x, o), 90, { kb: 0, stun: 1.8, stop: .2, heavy: 1, col: XTR }); down(o, 1.8); big(p, o, 'ドスン', XTR, 'neg'); },
      landed(e) { thud(e.x, true); }, broke(e) { bits(e.x, 80, 16, '125,79,158', 500, 14); receipt(e.x, 120, 8); } });
  }
  const s = m.sofa;
  if (t < .62 || !s || s.phase === 'fall') { p.vx = 0; p.target = t < .5 ? RP.point : POSE.idle; return; }
  if (!m.jump) { m.jump = t; facing(p, o); p.ground = false; p.vy = 1350; const tx = live(o) ? o.x : s.x; m.vx = clamp((tx - p.x) / .95, -1700, 1700); sfx.whoosh(); }      // up, and over onto them
  if (!p.ground) { p.vx = m.vx; p.target = p.vy > 0 ? POSE.jump : RP.elbow; return; }
  if (!m.drop) {
    m.drop = 1; p.vx = 0; thud(p.x, true);
    if (can(o) && Math.abs(o.x - p.x) < 200 + 40 * hs(o)) { hit(o, p.face, 50, { kb: 300, lift: 200, stun: 1, stop: .22, heavy: 1, col: XTR }); big(p, o, 'ドゴッ', XTR, 'neg'); }
    if (!s.gone) { s.broke(s); s.gone = 1; }
  }
  p.target = t < m.jump + 1.4 ? RP.elbow : POSE.idle;
  if (t > m.jump + 1.55 || t > 2.5) E.endMove(p);
} });

/* ================= 7 — FIRE EXTINGUISHER ================= */
function spray(p, m, t, t0, t1, dmg) {              // the extinguisher let go at them: a cloud of it, and they cannot see a thing
  if (t < t0 || t >= t1) return;
  const o = E.P2, h = E.hand(p, true), f = p.face, nx = h[0] + f * 150, ny = h[1] + 10;
  if (!m.hiss) { m.hiss = 1; sfx.steam(); }
  if (Z) for (let i = 0; i < 3; i++) Z.emit(2, nx, ny, f * rnd(700, 1100), rnd(-120, 160), rnd(30, 50), rnd(.5, .9), '236,240,244', { s1: 3, a: .7, dr: 2.6 });
  const n = Math.floor((t - t0) / .1) + 1;
  if (n > (m.sp || 0)) {                            // (a mouthful of it, every tenth of a second)
    m.sp = n;
    if (live(o) && (o.x - p.x) * f > -40 && Math.abs(o.x - p.x) < 480 && Math.abs(o.y - p.y) < 260 && hit(o, f, dmg, { kb: 40, stun: .45, stop: .01, col: '#ffffff' }) && o.ai) o.ai.t = Math.max(o.ai.t || 0, .4);
  }
}
const EXT = card('ext', 'o', { name: 'Fire Extinguisher', cd: 11, dur: 1.4, run(p, m, t) {
  const o = E.P2;
  p.rate = 44; m.prop = 'ext';
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'FIRE EXTINGUISHER'); }
  if (t < .14) { p.vx = 0; p.target = RP.spray; return; }
  if (t < .62) { p.vx = 0; p.target = RP.spray; spray(p, m, t, .14, .62, 2); return; }
  if (m.at === undefined) { p.target = RP.extW; if (runIn(p, o, t, .95, 170, 2000)) return; m.at = t; p.vx = 0; }
  const u = t - m.at;
  if (u < .1) { p.target = RP.extW; return; }
  if (!m.bonk) { m.bonk = 1; sfx.whoosh(); if (reach(p, 220, 20, { kb: 700, lift: 260, stun: .9, stop: .14, heavy: 1, col: RED })) { sfx.hit(true); sfx.snap(); shake(18); ono('ゴンッ', o.x, o.y + 420 * hs(o), PAPER, 1, .7); } }
  p.target = u < .36 ? RP.extSw : POSE.idle;
  if (u > .48) { gone(p); E.endMove(p); }
} });
// coupon: the spray, and then he lets go of it and it goes off at them like a rocket (10, and 120)
const EXT_C = card('ext', 'c', { name: 'Fire Extinguisher: Blast Off', cd: 14, dur: 1.4, run(p, m, t) {
  const o = E.P2;
  p.rate = 44;
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'FIRE EXTINGUISHER: BLAST OFF', CPN); }
  if (t < .62) { p.vx = 0; p.target = RP.spray; m.prop = 'ext'; spray(p, m, t, .14, .62, 2); return; }
  if (!m.go) {
    m.go = 1; m.prop = null;
    const h = E.hand(p, true), f = p.face; sfx.steam(); sfx.whoosh();
    prop({ x: h[0] + f * 40, y: h[1], face: f, life: 2, v: 900, draw: () => { g.translate(-60, 0); ext(); }, upd(e, dt, o) {
      e.v = Math.min(2800, e.v + 5200 * dt); e.x += f * e.v * dt; e.y += (live(o) ? mid(o) - e.y : 0) * Math.min(1, dt * 6); e.rot = Math.sin(e.t * 40) * .06;
      if (Z) Z.emit(2, e.x - f * 70, e.y, -f * rnd(300, 600), rnd(-60, 60), rnd(24, 40), rnd(.4, .7), '236,240,244', { s1: 2.6, a: .7, dr: 2.4 });
      const wall = Math.abs(e.x) > bound() + 60;
      if (touch(e.x + f * 60, e.y, 50, 30, o) || wall) {
        e.gone = 1; puffs(e.x, e.y, 14, '240,242,246', 90, 420, 300); bits(e.x, e.y, 12, '216,38,44', 600, 10); sfx.blast(); sfx.steam(); shake(34);
        if (!wall) { hit(o, f, 120, { kb: 1400, lift: 640, stun: 1, stop: .24, heavy: 1, col: CPN, flung: 1 }); big(E.P1, o, 'ボンッ', CPN, 'neg'); }
      }
    } });
  }
  p.target = t < 1 ? RP.point : POSE.idle;
  if (t > 1.1) E.endMove(p);
} });
// extra: the fire department. The engine pulls up behind him, and the hose: across the arena with them (16 x 8.5)
const JET_T = 1.6, JET_N = 16;
const EXT_X = card('ext', 'x', { name: 'Fire Extinguisher: Fire Department', cd: 16, dur: 3, run(p, m, t) {
  const o = E.P2, f = p.face, dt = dtOf(m, t);
  p.rate = 44;
  if (!m.s) {
    m.s = 1; facing(p, o); buy(p, 'FIRE EXTINGUISHER: FIRE DEPARTMENT', XTR);
    const x = clamp(p.x - p.face * 330, -bound() - 200, bound() + 200), fc = p.face;
    m.truck = prop({ x, y: 0, face: fc, back: true, life: 3.2, draw: () => engine(), upd(e) { if (e.t > 2.9 && !e.f) { e.f = 1; receipt(e.x, 180, 14); e.a = 0; } } });
    receipt(x, 200, 10); sfx.roar(.8);
  }
  if (t < .35) { p.vx = 0; p.target = RP.point; return; }
  m.prop = 'hose'; p.vx = 0; p.target = RP.aim2;
  const k = t - .35;
  if (k < JET_T) {
    if (!m.hiss) { m.hiss = 1; sfx.steam(); sfx.roar(JET_T); }
    const h = E.hand(p, true), there = live(o) && (o.x - p.x) * f > -40 && Math.abs(o.x - p.x) < 1500 && Math.abs(o.y - p.y) < 320;
    if (there && holdable(o)) o.x = clamp(o.x + f * 640 * dt, -bound(), bound());      // (the water driving them back, all the way)
    m.jet = { x0: h[0] + f * 64, y: h[1], x1: there ? o.x : p.x + f * 1500 };
    if (Z) for (let i = 0; i < 2; i++) Z.emit(4, m.jet.x1 - f * rnd(0, 60), h[1] + rnd(-30, 30), -f * rnd(100, 400), rnd(100, 500), rnd(3, 6), 1, '170,220,255', { g: 1600 });
    const n = Math.min(JET_N, Math.floor(k / (JET_T / JET_N)) + 1);
    while ((m.n || 0) < n) { m.n = (m.n || 0) + 1; if (there && hit(o, f, 8.5, { kb: 380, stun: .35, stop: .01, col: '#aee0ff' }) && m.n % 4 === 1) { sfx.splat(); V.sparks(o.x, mid(o), 'blue', 4); } }      // (and on them every tenth of a second, driving them back)
    return;
  }
  m.jet = null; m.prop = null;
  p.target = POSE.idle;
  if (k > JET_T + .25) E.endMove(p);
} });
function jetDraw(j) {                               // the water, as thick as an arm and a long way out
  const a = F(j.x0, j.y), b = F(j.x1, j.y), k = a[2], n = 12;
  lit(() => {
    for (let pass = 0; pass < 2; pass++) {
      g.strokeStyle = pass ? 'rgba(255,255,255,.85)' : 'rgba(150,205,255,.6)'; g.lineWidth = (pass ? 7 : 26) * k; g.lineCap = 'round';
      g.beginPath();
      for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) + Math.sin(E.T * 40 + i * 1.3) * 6 * k * u; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
    }
    g.lineCap = 'butt'; E.glow(E.GLOW.blue, b[0], b[1], 120 * k, .5);
  });
}

/* ================= 8 — FINAL PURCHASE ================= */
function crushed(o, col, word = 'ドシャアン') { ono(word, o.x, o.y + 470, col, 1.4, 1); if (Z) Z.flash(WHITE, .22, .18); }
function houseDown(e, hard) {                       // and all of it on the floor at once
  thud(e.x, true); E.zoomIn(.4);
  if (Z) { Z.boom(e.x, 80, hard ? 240 : 160, '230,210,180', { n: 20, clean: 1 }); Z.dust(e.x, 20); }
  puffs(e.x, 60, hard ? 26 : 14, '200,190,175', 90, hard ? 900 : 500, 200);
}
function houseBreak(e, hard) { bits(e.x, 160, hard ? 36 : 22, '155,59,46', hard ? 900 : 600, 16); bits(e.x, 120, hard ? 30 : 18, '239,227,205', hard ? 900 : 600, 16); bits(e.x, 100, 12, GLASS, 600, 7); receipt(e.x, 200, hard ? 24 : 14); sfx.rough(1.2); }
const FINAL = card('final', 'o', { name: 'Final Purchase', cd: 22, dur: 1, run(p, m, t) {
  const o = E.P2;
  if (!m.s) {
    m.s = 1; facing(p, o); buy(p, 'FINAL PURCHASE'); sfx.rise(.7);
    drop(o, { from: 1150, gr: 3000, track: .5, wait: .3, shadow: 220, hw: 190, keep: .5, draw: () => house(),
      hitThem(e, o) { hit(o, side(p.x, o), 65, { kb: 0, stun: 1.6, stop: .22, heavy: 1, col: '#efe3cd' }); down(o, 1.6); crushed(o, PAPER); },
      landed(e) { houseDown(e, false); }, broke(e) { houseBreak(e, false); } });
  }
  p.vx = 0; p.target = t < .7 ? RP.sum : POSE.idle;
  if (t > .8) E.endMove(p);
} });
// coupon: fully furnished. The house, and then everything that was in it (80, and 6 x 15)
const STUFF = [fridge, telly, () => chair(), () => table(), lamp, () => sofa('#b0473a')];
const FINAL_C = card('final', 'c', { name: 'Final Purchase: Fully Furnished', cd: 26, dur: 1, run(p, m, t) {
  const o = E.P2;
  if (!m.s) {
    m.s = 1; facing(p, o); buy(p, 'FINAL PURCHASE: FULLY FURNISHED', CPN); sfx.rise(.7);
    drop(o, { from: 1150, gr: 3000, track: .5, wait: .3, shadow: 220, hw: 190, keep: .4, draw: () => house(),
      hitThem(e, o) { hit(o, side(p.x, o), 80, { kb: 0, stun: 1.8, stop: .22, heavy: 1, col: CPN }); down(o, 1.8); crushed(o, CPN); },
      landed(e) { houseDown(e, false); },
      broke(e) {
        houseBreak(e, false);
        STUFF.forEach((draw, i) => drop(E.P2, { x: e.x + rnd(-40, 40), from: 900 + i * 40, wait: .14 * i, track: .1 + .14 * i, shadow: 80, hw: 100, keep: .25, gr: 5200, draw, rot: rnd(-.3, .3),
          hitThem(q, o) { hit(o, side(q.x, o), 15, { kb: 0, stun: .8, stop: .05, heavy: 1, col: CPN }); down(o, .8); sfx.hit(true); },
          landed(q) { sfx.land(); shake(8); bits(q.x, 40, 4, WRGB, 260, 9); }, broke(q) { bits(q.x, 60, 6, PRGB, 300, 9); receipt(q.x, 80, 3); } }));
      } });
  }
  p.vx = 0; p.target = t < .7 ? RP.sum : POSE.idle;
  if (t > .8) E.endMove(p);
} });
// extra: the mansion (220, over twice the ground)
const FINAL_X = card('final', 'x', { name: 'Final Purchase: Mansion', cd: 28, dur: 1, run(p, m, t) {
  const o = E.P2;
  if (!m.s) {
    m.s = 1; facing(p, o); buy(p, 'FINAL PURCHASE: MANSION', XTR); sfx.rise(.9);
    drop(o, { from: 1550, track: .55, wait: .4, gr: 2800, shadow: 480, hw: 430, keep: .6, draw: () => mansion(),
      hitThem(e, o) { hit(o, side(p.x, o), 220, { kb: 0, stun: 2, stop: .3, heavy: 1, col: XTR }); down(o, 2); crushed(o, XTR, 'ズドドォン'); },
      landed(e) { houseDown(e, true); if (Z) Z.flash('255,240,220', .3, .3); }, broke(e) { houseBreak(e, true); } });
  }
  p.vx = 0; p.target = t < .8 ? RP.sum : POSE.idle;
  if (t > .9) E.endMove(p);
} });

/* ================= COUPON, EXTRA COUPON, and the prize ================= */
function refuse(p, m, why) { label(p.x, p.y + 440, why, PAPER, 1.1); sfx.back(); if (m.key) E.cd[m.key] = 0; E.endMove(p); }
const busy = () => (deck.armed === 'prize' ? 'THE PRIZE IS WAITING · USE A MOVE' : 'A COUPON IS ALREADY WAITING · USE A MOVE');
function stamp(p, col, rgb, what) { const h = E.hand(p, true); receipt(h[0], h[1], 8, rgb); sfx.rip(); sfx.snip(.8); label(p.x, p.y + 500, what, col, 1.1); label(p.x, p.y + 440, 'USE A MOVE', col, 1.4); }
const COUPON = { name: 'Coupon', cd: .8, dur: .6, reg: 1, card: 'coupon', run(p, m, t) {
  if (!m.s) {
    m.s = 1;
    if (deck.armed) { refuse(p, m, busy()); return; }
    deck.armed = 'coupon'; dealt(m.key, 'k'); stamp(p, CPN, CRGB, 'COUPON');
  }
  p.vx = 0; p.target = t < .4 ? RP.ticket : POSE.idle; m.prop = t < .34 ? 'ticketC' : null;
  if (t > .5) E.endMove(p);
} };
const EXTRA = { name: 'Extra Coupon', cd: .8, dur: .6, reg: 1, card: 'extra', run(p, m, t) {
  if (!m.s) {
    m.s = 1;
    if (deck.armed === 'coupon') {                  // the coupon on the extra coupon: a prize
      deck.armed = 'prize'; dealt(m.key, 'k');
      const h = E.hand(p, true); receipt(h[0], h[1], 16, GRGB); sfx.rip(); sfx.charge();
      if (Z) { Z.flash(GRGB, .2, .25); Z.flare(h[0], h[1], GRGB, 420, .3); }
      label(p.x, p.y + 540, 'COUPON ON THE EXTRA COUPON', GOLD, 1.4); label(p.x, p.y + 480, 'A PRIZE · USE A MOVE', GOLD, 1.6);
    } else if (deck.armed) { refuse(p, m, busy()); return; }
    else { deck.armed = 'extra'; dealt(m.key, 'k'); stamp(p, XTR, XRGB, 'EXTRA COUPON'); }
  }
  p.vx = 0; p.target = t < .4 ? RP.ticket : POSE.idle; m.prop = t < .34 ? (deck.armed === 'prize' ? 'ticketP' : 'ticketX') : null;
  if (t > .5) E.endMove(p);
} };
const WEAPON = {
  pistol: { name: 'Pistol', full: 'A pistol', ammo: 2, unit: 'BULLET', col: GOLD },
  sniper: { name: 'Sniper Rifle', full: 'A sniper rifle', ammo: 1, unit: 'BULLET', col: GOLD },
  katana: { name: 'Katana', full: 'Cursed Katana', ammo: 3, unit: 'USE', col: '#cfd8e0', tool: 1 },
  chain: { name: 'Chain', full: 'Chain of a Thousand Miles', ammo: 2, unit: 'USE', col: '#9aa3b5', tool: 1 },
  cloud: { name: 'Playful Cloud', full: 'Playful Cloud', ammo: 3, unit: 'USE', col: '#ff5a6e', tool: 1 },
  spear: { name: 'Inverted Spear', full: 'Inverted Spear of Heaven', ammo: 1, unit: 'USE', col: '#e2c060', tool: 1 }
};
const ammoText = (id, n) => n + ' ' + WEAPON[id].unit + (n === 1 ? '' : 'S');
function rollPrize() {                              // a third each: the pistol, the rifle, a cursed tool (and which, at the reel's odds)
  const r = Math.random() * 3;
  if (r < 1) return 'pistol';
  if (r < 2) return 'sniper';
  const TL = JU.tools && JU.tools.TOOLS, ids = ['katana', 'chain', 'cloud', 'spear'], odds = id => (TL && TL[id] && TL[id].odds) || 25;
  let q = Math.random() * ids.reduce((n, id) => n + odds(id), 0);
  for (const id of ids) if ((q -= odds(id)) < 0) return id;
  return 'katana';
}
function give(k, id) { const used = deck.hand[k]; if (used && !WEAPON[used]) deck.line.push(used); deck.hand[k] = id; deck.ammo[k] = WEAPON[id].ammo; }
const PRIZE = { name: 'Prize', cd: .6, dur: 1.1, reg: 1, run(p, m, t) {
  if (!m.s) {
    m.s = 1; deck.armed = null;
    const id = m.id = rollPrize(), w = WEAPON[id];
    if (m.key) { deck.used[m.key] = E.CD[m.key]; give(m.key, id); }
    const h = E.hand(p, true); receipt(h[0], h[1], 18, GRGB); sfx.rip(); sfx.charge();
    if (Z) { Z.flash(GRGB, .22, .3); Z.pillar(p.x, 60, 700, GRGB, .5); }
    label(p.x, p.y + 560, w.full.toUpperCase(), w.tool ? w.col : GOLD, 1.8); label(p.x, p.y + 500, ammoText(id, w.ammo), PAPER, 1.8);
  }
  p.vx = 0; p.target = t < .75 ? RP.sum : POSE.idle; m.prop = m.id;
  if (t > .85) E.endMove(p);
} };
// a weapon's turn on its key: a bullet (or a use) gone, and the key back to the deck once there are none
function spend(k) { if (!k || !(deck.ammo[k] > 0)) return; deck.used[k] = E.CD[k]; if (--deck.ammo[k] <= 0) { delete deck.ammo[k]; deck.hand[k] = deck.line.shift(); } }
function arm(id, def) { const run = def.run; return Object.assign(def, { reg: 1, wpn: id, run(p, m, t) { if (!m.dealt) { m.dealt = 1; spend(m.key); } run(p, m, t); } }); }
function shoot(p, o, dmg, rifle) {
  const w = E.hand(p, true), f = p.face, mz = [w[0] + f * (rifle ? 262 : 64), w[1] + 2];
  const there = live(o) && (o.x - p.x) * f > -30 && Math.abs(o.x - p.x) < (rifle ? 2600 : 1700) && Math.abs(o.y - p.y) < 240 && !(o.inv > 0) && o.state !== 'up' && o.state !== 'down';
  const end = there ? [o.x - f * 20, mid(o)] : [p.x + f * 2300, mz[1]];
  if (rifle) sfx.cannon(1); else { sfx.snap(); sfx.blast(); }
  V.bolt(mz[0], mz[1], end[0], end[1], rifle ? '#ffe9a0' : '#fff2b0', rifle ? .2 : .1, rifle ? 6 : 3);
  if (Z) { Z.flare(mz[0], mz[1], '255,220,140', rifle ? 360 : 200, .1); Z.emit(3, mz[0] - f * (rifle ? 200 : 50), mz[1] + 10, -f * rnd(100, 200), rnd(200, 400), 4, .8, '226,181,69', { g: 1600, vr: rnd(-20, 20), w: .5 }); }      // (and the shell out of the side of it)
  shake(rifle ? 26 : 10);
  if (there && hit(o, f, dmg, rifle ? { kb: 1300, lift: 380, stun: 1, stop: .22, heavy: 1, col: '#ffe9a0', flung: 1 } : { kb: 260, stun: .5, stop: .08, col: '#fff2b0' })) {
    V.sparks(end[0], end[1], 'white', rifle ? 14 : 6);
    if (rifle) big(p, o, 'ズドン', GOLD, 'neg'); else ono('バンッ', end[0], end[1] + 220, GOLD, .9, .5);
  }
}
const PISTOL = arm('pistol', { name: 'Pistol', cd: .7, dur: .55, run(p, m, t) {
  p.rate = 50; p.vx = 0; m.prop = 'pistol'; p.target = RP.aim;
  if (!m.s) { m.s = 1; facing(p, E.P2); }
  if (t >= .12 && !m.shot) { m.shot = 1; shoot(p, E.P2, 40, false); }
  if (t > .45) E.endMove(p);
} });
const AIM_T = .55;
const SNIPER = arm('sniper', { name: 'Sniper Rifle', cd: .5, dur: 1.1, run(p, m, t) {
  p.rate = 40; p.vx = 0; m.prop = 'sniper'; p.target = RP.aim2;
  if (!m.s) { m.s = 1; facing(p, E.P2); sfx.click(); }
  if (t >= AIM_T && !m.shot) { m.shot = 1; shoot(p, E.P2, 150, true); }
  if (t > AIM_T + .4) E.endMove(p);
} });
const KATANA = arm('katana', { name: 'Katana Slash', cd: 1.2, dur: .6, run(p, m, t) {
  p.rate = 46; m.prop = 'katana';
  p.vx = t > .1 && t < .2 && roomAhead(p) ? p.face * 520 : 0; p.target = t < .12 ? POSE.hookWind : t < .36 ? POSE.hook : POSE.idle;
  if (t < .12 || m.cut) { if (t > .5) E.endMove(p); return; }
  m.cut = 1; sfx.whoosh(); V.slash(p.x + p.face * 150, p.y + 170, p.face > 0 ? -.35 : Math.PI + .35, 460, STEEL, 16);
  if (reach(p, 280, 70, { kb: 640, lift: 320, stun: .8, stop: .14, heavy: 1, col: STEEL })) { sfx.hit(true); shake(18); }
} });
const LASSO_OUT = .32, LASSO_R = 760;
const CHAIN = arm('chain', { name: 'Lasso', cd: 2, dur: 1.8, run(p, m, t) {
  const o = E.P2, f = p.face;
  p.rate = 44; m.prop = 'chain'; p.vx = 0;
  if (!m.s) { m.s = 1; facing(p, o); }
  if (t < .3) { p.target = RP.sum; if (!m.whirl) { m.whirl = 1; sfx.swish(.8); } return; }      // round over his head
  const h = E.hand(p, true);
  if (!m.caught) {
    const u = Math.min(1, (t - .3) / LASSO_OUT), x = h[0] + f * LASSO_R * u, y = h[1] + (live(o) ? (mid(o) - h[1]) * u : 0);
    m.end = [x, y]; p.target = RP.aim;
    if (touch(x, y, 30, 30, o)) { m.caught = t; m.cx = o.x; hit(o, f, 60, { kb: 0, stun: 1.2, stop: .12, heavy: 1, col: '#9aa3b5' }); sfx.snap(); }
    else if (u >= 1) { m.end = null; if (t > .3 + LASSO_OUT + .2) E.endMove(p); }
    return;
  }
  const k = t - m.caught, u = Math.min(1, k / .34), tx = p.x + f * 130;
  if (live(o) && holdable(o)) Object.assign(o, { x: lerp(m.cx, tx, u * u), vx: 0, state: 'hurt', stun: .5, act: null, tele: 0 });
  m.end = live(o) ? [o.x, mid(o)] : null; p.target = RP.chairDn;
  if (u >= 1 && !m.done) { m.done = 1; m.end = null; if (live(o)) { hit(o, f, 40, { kb: 600, lift: 400, stun: .9, stop: .16, heavy: 1, col: '#9aa3b5' }); sfx.hit(true); shake(20); } }
  if (k > .6) E.endMove(p);
} });
const CLOUD = arm('cloud', { name: 'Cloud Barrage', cd: 1.2, dur: .9, run(p, m, t) {
  const o = E.P2;
  p.rate = 50; m.prop = 'cloud';
  if (!m.s) { m.s = 1; facing(p, o); }
  const n = Math.min(6, Math.floor(t / .1) + 1);
  p.vx = gap(p, o) > 170 && roomAhead(p) ? p.face * 300 : 0;
  while ((m.n || 0) < n) { m.n = (m.n || 0) + 1; p.target = m.n % 2 ? POSE.hook : POSE.crush; sfx.swish(1.1); if (reach(p, 240, 7, m.n === 6 ? { kb: 520, lift: 320, stun: .7, stop: .08, heavy: 1, col: '#ff5a6e' } : { kb: 40, stun: .3, stop: .02, col: '#ff5a6e' })) V.sparks(o.x - p.face * 20, mid(o), 'red', 3); }
  if (t > .75) E.endMove(p);
} });
const SPEAR = arm('spear', { name: 'Inversion Stab', cd: .5, dur: .75, run(p, m, t) {
  p.rate = 46; m.prop = 'spear';
  if (t < .2) { p.target = POSE.divWind; p.vx = 0; return; }
  p.target = t < .45 ? POSE.jab : POSE.idle; p.vx = t < .32 && roomAhead(p) ? p.face * 1300 : 0;
  if (!m.done && t <= .34 && reach(p, 250, 450, { kb: 900, lift: 420, stun: 1, stop: .3, heavy: 1, col: GOLD })) { m.done = 1; shake(34); sfx.bf(); V.impact(.2, E.P2.x, E.P2.y + 150); }
  if (t > .65) E.endMove(p);
} });
const ARMS = { pistol: PISTOL, sniper: SNIPER, katana: KATANA, chain: CHAIN, cloud: CLOUD, spear: SPEAR };

/* ================= what is on each key ================= */
const CARDS = {
  home: [HOME, HOME_C, HOME_X], hitrun: [HIT_RUN, HIT_RUN_C, HIT_RUN_X], kitchen: [KITCHEN, KITCHEN_C, KITCHEN_X], express: [EXPRESS, EXPRESS_C, EXPRESS_X],
  road: [ROAD, ROAD_C, ROAD_X], furn: [FURN, FURN_C, FURN_X], ext: [EXT, EXT_C, EXT_X], final: [FINAL, FINAL_C, FINAL_X] };
const nameOf = id => (WEAPON[id] ? WEAPON[id].name : id === 'coupon' ? 'Coupon' : id === 'extra' ? 'Extra Coupon' : CARDS[id] ? CARDS[id][0].name : '—');
const colOf = id => (WEAPON[id] ? GOLD : id === 'coupon' ? CPN : id === 'extra' ? XTR : PAPER);
function defFor(k) {
  if (!deck.hand[k]) deal();
  const id = deck.hand[k];
  if (WEAPON[id]) return ARMS[id];
  if (id === 'coupon') return COUPON;
  if (id === 'extra') return EXTRA;
  const c = CARDS[id];
  return deck.armed === 'coupon' ? c[1] : deck.armed === 'extra' ? c[2] : deck.armed === 'prize' ? PRIZE : c[0];
}
const MOVES = { get strikes() { return defFor('strikes'); }, get crush() { return defFor('crush'); }, get div() { return defFor('div'); }, get manji() { return defFor('manji'); } };

/* ---------- the hotbar: each key's card, a coupon's colour on the eight while one waits, and NEXT where E would be ---------- */
const subs = {}, shownK = {};
let dressed = false;
function sub(k, text, col) {
  let s = subs[k];
  if (!s) { s = subs[k] = document.createElement('small'); s.className = 'rgs'; }
  const el = E.hud.mv[k];
  if (!text) { if (s.parentNode) s.remove(); return; }
  if (s.parentNode !== el) el.appendChild(s);
  s.textContent = text; s.style.color = col;
}
function relabel() {
  for (const k of SLOTS) {
    const id = deck.hand[k], d = defFor(k), kind = WEAPON[id] ? 'w' : id === 'coupon' ? 'c' : id === 'extra' ? 'x' : 'o', armed = kind === 'o' && deck.armed;
    E.CD[k] = E.cd[k] > 0 ? (deck.used[k] || d.cd) : d.cd;      // (while the key waits, what it waits for is the card just used)
    const col = armed ? ARMED[deck.armed] : colOf(id), text = armed ? 'USE A MOVE' : kind === 'w' ? ammoText(id, deck.ammo[k] || 0) : '', key = [id, kind, armed, col, text].join('|');
    if (shownK[k] === key) continue;
    shownK[k] = key;
    const el = E.hud.mv[k];
    el.querySelector('b').textContent = nameOf(id);
    el.classList.add('rg'); el.classList.toggle('rg-c', kind === 'c'); el.classList.toggle('rg-x', kind === 'x'); el.classList.toggle('rg-w', kind === 'w'); el.classList.toggle('rg-arm', !!armed);
    el.style.setProperty('--rgc', col);
    sub(k, text, col);
  }
  dressed = true;
}
function undress() {
  for (const k of SLOTS) { const el = E.hud.mv[k]; el.classList.remove('rg', 'rg-c', 'rg-x', 'rg-w', 'rg-arm'); el.style.removeProperty('--rgc'); sub(k, ''); shownK[k] = ''; }
  dressed = false;
}
const esp = E.hud.mv.esp, espKey = esp.querySelector('kbd'), ESP_KEY = espKey.textContent;
function nextSlot(want) { if (esp.classList.contains('nx') === want) return; esp.classList.toggle('nx', want); espKey.textContent = want ? 'NEXT' : ESP_KEY; }
// E does nothing of his own: the slot is only where NEXT is shown (especial.js draws its name, and this, its colour)
const ESP = { jp: '次', get col() { return colOf(deck.line[0]); }, name: () => nameOf(deck.line[0]), left: 0, max: 1,
  press(p) { const id = deck.line[0]; if (id && !p.dead) label(p.x, p.y + 430, 'NEXT · ' + nameOf(id).toUpperCase(), colOf(id), .8); return true; } };

JU.tech.add('regis', { name: 'Registration', jp: '再契象', mark: '券', who: 'Receipts, and whatever is on them', odds: 0, col: PAPER, glow: 'gold', moves: MOVES,
  early: true, skin: SKIN, as: ['Registration', '再契象'],
  hint: '<b>1–4</b> the cards in your hand · <b>NEXT</b> takes the key of the one you use · a <b>Coupon</b> or an <b>Extra Coupon</b>, then a move' });
const DEF = T.TECH.regis;

/* ---------- wiring ---------- */
const tick0 = H.tick, fx0 = H.fx, under0 = H.under, reset0 = H.reset, start0 = H.fightStart;
let wasRiding = false;
H.tick = dt => {
  tick0(dt);
  if (!on()) { if (dressed) undress(); nextSlot(false); if (props.length || trap) clear(); return; }
  const p = E.P1;
  if (!deck.hand.strikes) deal();
  if (wasRiding && !riding && p.ground && !p.plat && p.y > 1) p.ground = false;      // (knocked off it mid-ride: down to the floor, not left sat on the air)
  wasRiding = riding; riding = false;
  if (trap) trapTick(dt);
  propsTick(dt);
  if (fight()) relabel(); else if (dressed) undress();
  nextSlot(fight());
};
H.under = dt => {
  under0(dt);
  if (!on()) return;
  shadows(); propsDraw(true);
  const p = E.P1, m = p.move;
  if (m && m.def.reg && m.prop === 'scooter' && p.skin === SKIN && !p.dead) {      // the scooter he is sat on, under him
    const c = F(p.x + p.face * 58, p.y - RIDE_Y), k = c[2] * SCOOT;
    g.save(); g.translate(c[0], c[1]); g.scale(k * p.face, k); if (m.tilt) g.rotate(m.tilt); LWK = 1 / SCOOT; scooter(); LWK = 1; g.restore();
  }
};
H.fx = dt => {
  fx0(dt);
  if (!on()) return;
  propsDraw(false);
  const p = E.P1, m = p.move;
  if (p.dead || p.alpha < .05 || p.skin !== SKIN) return;
  if (m && m.def.reg) {
    if (m.prop && HELD[m.prop]) inHand(p, true, HELD[m.prop]);
    if (m.prop2 && HELD[m.prop2]) inHand(p, false, HELD[m.prop2]);
    if (m.jet) jetDraw(m.jet);
    if (m.end) {                                    // the chain out to wherever its end is
      const h = E.hand(p, true), a = F(h[0], h[1]), b = F(m.end[0], m.end[1]);
      g.strokeStyle = LINE; g.lineWidth = 7 * a[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.strokeStyle = '#9aa3b5'; g.lineWidth = 4 * a[2]; g.setLineDash([8 * a[2], 5 * a[2]]); g.stroke(); g.setLineDash([]);
    }
    if (m.def === SNIPER && m.t < AIM_T) {          // the laser on them, before the shot
      const o = E.P2, h = E.hand(p, true), a = F(h[0] + p.face * 262, h[1] + 2), b = live(o) ? F(o.x, mid(o)) : F(p.x + p.face * 2300, h[1]);
      g.strokeStyle = `rgba(255,40,60,${.5 + .4 * Math.sin(E.T * 30)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      lit(() => E.glow(E.GLOW.red, b[0], b[1], 40 * b[2], .8));
    }
    return;
  }
  for (const k of SLOTS) if (WEAPON[deck.hand[k]]) { inHand(p, false, HELD[deck.hand[k]]); break; }      // a weapon he has bought, in his other hand while it is not in use
};
const clear = () => { props.length = 0; trap = null; riding = wasRiding = false; };
H.reset = () => { reset0(); clear(); deck.hand = {}; };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) { clear(); deal(); undress(); } };

JU.regis = { MOVES, CARDS, WEAPON, ARMS, COUPON, EXTRA, PRIZE, deck, esp: ESP, deal, rollPrize, SKIN,
  get state() { return { hand: Object.assign({}, deck.hand), next: deck.line[0], line: deck.line.slice(), armed: deck.armed, ammo: Object.assign({}, deck.ammo), props: props.length, trap: trap && { t: +trap.t.toFixed(2), life: trap.life } }; } };
})();
