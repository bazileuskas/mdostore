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
   Build 0.28v1, the user's: "add real sound effects for registration from the internet. also add more moves to him and also on the internet
     take the inspiration from the models on the internet to make cars, the bat and everything else look 10000000000000000000x better".
     SOUNDS: real ones for all of it (home-rg-*: at home our cut of each, everywhere else straight from where it is posted, index.html's WEB),
     the built ones only where a clip cannot be had. FOUR MORE, each with its coupon and extra variant, so the deck is fourteen: Bowling
     Strike, Shopping Spree, Fishing Trip and Renovation. And everything he buys drawn again, after photographs of the real things.
   The look is the Receipt Man's (cast6.js, REGGIE), and the Receipt Man is what the game calls him */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, T = JU.tech, Z = JU.bossfx;
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2, SLOTS = T.SLOTS;
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
const play = (name, vol, alt, rate = 1) => { if (!sfx.file(name, vol, rate)) alt(); };      // the clip (at home ours, online from where it is posted), or a built sound
sfx.preload(['home-rg-rip', 'home-rg-tear', 'home-rg-bat', 'home-rg-mitt', 'home-rg-stamp', 'home-rg-slash', 'home-rg-stab', 'home-rg-box', 'home-rg-crash', 'home-rg-engine',
  'home-rg-boom', 'home-rg-wood', 'home-rg-smash', 'home-rg-spray', 'home-rg-hose', 'home-rg-splash', 'home-rg-collapse', 'home-rg-pistol', 'home-rg-sniper', 'home-rg-bolt',
  'home-rg-bowl', 'home-rg-reel', 'home-rg-hammer', 'home-rg-jack']);

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
function buy(p, what, col = PAPER) { const h = E.hand(p, true); receipt(h[0], h[1]); play('home-rg-rip', .7, () => sfx.rip()); label(p.x, p.y + 480, what, col, 1.1); }
const gone = (p, front = true) => { const h = E.hand(p, front); receipt(h[0], h[1], 5); };      // and what it bought, gone back into it
function bits(x, y, n, rgb, spread = 500, size = 10) {      // pieces of whatever it was
  if (Z) for (let i = 0; i < n; i++) Z.emit(3, x + rnd(-50, 50), y + rnd(-40, 40), rnd(-spread, spread), rnd(150, 900), rnd(size * .5, size * 1.4), rnd(.6, 1.3), rgb, { g: 1700, vr: rnd(-14, 14), rot: rnd(0, TAU), w: rnd(.25, .7), edge: 'rgba(30,20,12,.55)' });
}
function puffs(x, y, n, rgb = '232,234,238', s = 60, spread = 220, up = 120) { if (Z) for (let i = 0; i < n; i++) Z.emit(2, x + rnd(-40, 40), y + rnd(-20, 20), rnd(-spread, spread), rnd(20, up), s * rnd(.7, 1.3), rnd(.6, 1.2), rgb, { s1: 2.4, a: .6, dr: 2.2 }); }
function thud(x, hard, quiet) { if (!quiet) { sfx.blast(); if (hard) sfx.rough(1.1); else sfx.land(); } shake(hard ? 36 : 14); V.crack(x, hard ? 340 : 160); V.rocks(x, 0, hard ? 12 : 4); if (Z) { Z.dust(x, hard ? 14 : 5); if (hard) Z.shock(x, 640, '235,225,205', .45, 12); } }

/* ================= what he buys, drawn (Build 0.28v1: all of it again, after photographs of the real things: a 1992 Corolla, a Vespa LX150,
   an International school bus, a fire engine with its ladders, a wood bat's taper, a CO2 extinguisher, a brick ranch house, a Queen Anne chair,
   an Empire sofa, a Glock, a K14 rifle and the rest; looked at on Wikimedia Commons, drawn here in the game's own lines).
   (0, 0) is the middle of the bottom of each, +x the way it faces, +y down the screen; a thing in a hand runs along +x out of the hand ================= */
let LWK = 1;                                        // (line widths, kept the same however big the thing is drawn)
const hexn = h => parseInt(h.slice(1), 16), chan = (n, s) => n >> s & 255;
const lighten = (hex, a) => { const n = hexn(hex), c = s => Math.round(chan(n, s) + (255 - chan(n, s)) * a); return `rgb(${c(16)},${c(8)},${c(0)})`; };
const darken = (hex, a) => { const n = hexn(hex), c = s => Math.round(chan(n, s) * (1 - a)); return `rgb(${c(16)},${c(8)},${c(0)})`; };
function lgr(x0, y0, x1, y1, ...cols) { const gr = g.createLinearGradient(x0, y0, x1, y1); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); return gr; }
function rgr(x, y, r, ...cols) { const gr = g.createRadialGradient(x - r * .35, y - r * .4, r * .05, x, y, r); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); return gr; }
function ink(l = 3) { g.lineWidth = l * LWK; g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = LINE; g.stroke(); }
function fillInk(fill, l = 3) { g.fillStyle = fill; g.fill(); if (l) ink(l); }      // (l 0: no outline)
function pts(p) { g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.closePath(); }
function R(x, y, w, h, fill, l = 3) { g.beginPath(); g.rect(x, y, w, h); fillInk(fill, l); }
function RR(x, y, w, h, r, fill, l = 3) { g.beginPath(); g.roundRect(x, y, w, h, r); fillInk(fill, l); }
function Q(fill, p, l = 3) { pts(p); fillInk(fill, l); }
function O(x, y, r, fill, l = 3) { g.beginPath(); g.arc(x, y, r, 0, TAU); fillInk(fill, l); }
function E2(x, y, rx, ry, fill, l = 3, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); fillInk(fill, l); }
const thin = (x0, y0, x1, y1, col, w = 1.5) => { g.strokeStyle = col; g.lineWidth = w * LWK; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
function shine(x0, y0, x1, y1, a = .35, w = 3) { g.save(); g.globalAlpha *= a; g.lineCap = 'round'; thin(x0, y0, x1, y1, '#ffffff', w); g.restore(); }
function ground(w, a = .3) { g.fillStyle = `rgba(0,0,0,${a})`; g.beginPath(); g.ellipse(0, -1, w, w * .07, 0, 0, TAU); g.fill(); }      // its shadow on the floor
function word(text, x, y, size, col, face = 1, weight = 'bold') {      // writing on a thing, the right way round whichever way it faces
  g.save(); g.translate(x, y); g.scale(face < 0 ? -1 : 1, 1); g.font = `${weight} ${size}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(text, 0, 0); g.restore();
}
// a wheel: its tyre, a rim of five spokes turned by `spin` (how far it has rolled, over its radius), and the hub
function wheel(x, y, r, spin = 0, rim = '#c9ced6') {
  O(x, y, r, '#141418');
  g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = 2 * LWK; g.beginPath(); g.arc(x, y, r * .82, 0, TAU); g.stroke();
  g.beginPath(); g.arc(x, y, r * .62, 0, TAU); fillInk(lgr(x, y - r * .6, x, y + r * .6, lighten(rim, .5), rim, darken(rim, .4)), 2);
  g.save(); g.translate(x, y); g.rotate(spin); g.fillStyle = darken(rim, .55);
  for (let i = 0; i < 5; i++) { g.rotate(TAU / 5); g.beginPath(); g.ellipse(0, -r * .37, r * .11, r * .17, 0, 0, TAU); g.fill(); }
  g.restore();
  O(x, y, r * .15, darken(rim, .2), 1.5);
}

/* ---------- the bat, the ball ---------- */
function bat(len = 160, col = WOOD) {               // a wood bat from its knob (0) to the end of its barrel (len): the taper of a real one
  const L = len, hr = 3.6, br = 9.5;
  g.beginPath(); g.moveTo(2, -hr); g.lineTo(L * .34, -hr - .4); g.bezierCurveTo(L * .52, -hr - 1, L * .6, -br, L * .74, -br); g.lineTo(L - br, -br); g.arc(L - br, 0, br, -Math.PI / 2, Math.PI / 2);
  g.lineTo(L * .74, br); g.bezierCurveTo(L * .6, br, L * .52, hr + 1, L * .34, hr + .4); g.lineTo(2, hr); g.closePath();
  g.fillStyle = lgr(0, -br, 0, br, lighten(col, .45), col, darken(col, .35)); g.fill();
  g.save(); g.clip();                               // the grain, and a burn of a maker's stamp on the barrel
  for (let i = 0; i < 5; i++) thin(L * .3 + i * 9, -6 + i * 3, L - 8, -7 + i * 3.4, 'rgba(90,50,20,.22)', 1);
  g.fillStyle = 'rgba(40,20,10,.55)'; g.beginPath(); g.ellipse(L * .78, 0, 10, 4.5, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(L * .45, -br * .62, L * .5, 2.2);
  g.restore();
  ink(3);
  g.fillStyle = '#23232a'; g.beginPath(); g.rect(4, -hr - .6, L * .22, hr * 2 + 1.2); g.fill();      // the grip tape, wound on
  for (let x = 7; x < L * .22; x += 6) thin(x, -hr, x + 3, hr, 'rgba(255,255,255,.14)', 1.2);
  g.beginPath(); g.ellipse(1, 0, 3.5, 7.5, 0, 0, TAU); fillInk('#2c2c33', 2);      // the knob
}
function ball(r = 12) {
  g.beginPath(); g.arc(0, 0, r, 0, TAU); fillInk(rgr(0, 0, r, '#ffffff', '#f2f0e8', '#c9c5b8'), 2.5);
  g.strokeStyle = '#d0353a'; g.lineWidth = 1.6 * LWK;
  for (const s of [-1, 1]) {
    g.beginPath(); g.arc(s * r * 1.32, 0, r, s > 0 ? Math.PI - .72 : -.72, s > 0 ? Math.PI + .72 : .72); g.stroke();
    for (let i = -2; i <= 2; i++) { const a = (s > 0 ? Math.PI : 0) + i * .28, cx = s * r * 1.32 + Math.cos(a) * r, cy = Math.sin(a) * r; thin(cx - 2.2 * s, cy - 1.6, cx + 1.4 * s, cy, '#d0353a', 1.2); }      // the stitches
  }
}

/* ---------- the knives ---------- */
function knife() {                                  // a chef's knife: riveted handle, bolster, the belly of the blade out to its point
  RR(-34, -5.5, 34, 11, 4, '#2a211c', 2.5); for (const x of [-26, -16, -6]) O(x, 0, 1.6, '#cfd6de', 1);
  R(-1, -7, 6, 14, '#b9c2cc', 2);
  g.beginPath(); g.moveTo(5, -8); g.lineTo(70, -8); g.quadraticCurveTo(84, -6, 92, 1); g.quadraticCurveTo(60, 8, 5, 7); g.closePath();
  fillInk(lgr(0, -8, 0, 8, '#f4f8fc', '#c3ccd6', '#8d98a6'), 2.5);
  shine(10, 4, 80, 2, .9, 1.6); shine(12, -5, 60, -5, .5, 1.4);
}
function cleaver() {                                // a meat cleaver: a slab of a blade, a hole to hang it by, a wooden handle
  RR(-42, -6, 44, 12, 4, '#6e4422', 3); for (const x of [-32, -20]) O(x, 0, 2, '#d7dde3', 1);
  g.beginPath(); g.moveTo(2, -16); g.lineTo(2, 12); g.lineTo(124, 14); g.quadraticCurveTo(130, -20, 124, -58); g.lineTo(22, -58); g.closePath();
  fillInk(lgr(0, -58, 0, 14, '#eef3f8', '#aeb8c4', '#7c8794'), 3);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(4, 7); g.lineTo(125, 9); g.lineTo(125, 13); g.lineTo(4, 11); g.fill();      // its edge
  O(104, -42, 6, '#1b1b20', 2);
}

/* ---------- boxes, the crate ---------- */
function box(w = 120, h = 90, seed = 0) {           // a cardboard box, its top and one side showing: tape over the flaps, a label, which way up it goes
  const d = 16;
  pts([w / 2, -h, w / 2 + d, -h - d * .6, w / 2 + d, -d * .6, w / 2, 0]); fillInk(darken(CARD, .28), 2.5);      // the side
  pts([-w / 2, -h, -w / 2 + d, -h - d * .6, w / 2 + d, -h - d * .6, w / 2, -h]); fillInk(lighten(CARD, .18), 2.5);      // the top
  g.beginPath(); g.rect(-w / 2, -h, w, h); fillInk(lgr(0, -h, 0, 0, lighten(CARD, .08), CARD, darken(CARD, .12)), 2.5);
  g.fillStyle = 'rgba(234,220,174,.8)'; g.fillRect(-9, -h, 18, h * .36); pts([-9, -h, -9 + d * .5, -h - d * .6, 9 + d * .5, -h - d * .6, 9, -h]); g.fill();      // the tape
  thin(-w / 2 + d * .5, -h - d * .3, w / 2 + d * .5, -h - d * .3, 'rgba(60,40,20,.35)', 1.2);
  RR(w * .1, -h * .66, w * .32, h * .28, 2, '#f6f3ea', 1.5);      // the label
  for (let i = 0; i < 3; i++) thin(w * .13, -h * .6 + i * 5, w * (.3 - i * .04), -h * .6 + i * 5, 'rgba(40,30,20,.6)', 1.4);
  for (let i = 0; i < 9; i++) thin(w * .13 + i * 2.6, -h * .45, w * .13 + i * 2.6, -h * .4, '#222', i % 3 ? .8 : 1.6);
  if (seed % 2 < 1) word('FRAGILE', -w * .2, -h * .42, Math.max(9, w * .1), 'rgba(200,40,40,.85)', 1);
  else { g.save(); g.strokeStyle = 'rgba(40,30,20,.7)'; g.lineWidth = 2 * LWK; for (const x of [-w * .32, -w * .2]) { g.beginPath(); g.moveTo(x, -h * .3); g.lineTo(x, -h * .58); g.moveTo(x - 4, -h * .52); g.lineTo(x, -h * .58); g.lineTo(x + 4, -h * .52); g.stroke(); } g.restore(); }      // (this way up)
}
function boxes(n, seed) {                           // n of them, one on another, none of them quite square to the rest
  let y = 0;
  for (let i = 0; i < n; i++) {
    const w = 150 - (i % 3) * 16, h = 92 - (i % 2) * 10, dx = Math.sin(seed + i * 2.3) * 14;
    g.save(); g.translate(dx, y); g.rotate(Math.sin(seed * 1.7 + i) * .05); box(w, h, Math.floor(seed) + i); g.restore();
    y -= h - 2;
  }
}
function crate() {                                  // a wooden crate, planks and braces and the nails in them
  const w = 200, h = 196, d = 22, WD = '#9a6531';
  pts([w / 2, -h, w / 2 + d, -h - d * .6, w / 2 + d, -d * .6, w / 2, 0]); fillInk(darken(WD, .35), 3);
  pts([-w / 2, -h, -w / 2 + d, -h - d * .6, w / 2 + d, -h - d * .6, w / 2, -h]); fillInk(lighten(WD, .15), 3);
  g.beginPath(); g.rect(-w / 2, -h, w, h); fillInk(lgr(0, -h, 0, 0, lighten(WD, .1), WD, darken(WD, .2)), 3);
  for (let i = 1; i < 5; i++) thin(-w / 2, -h + i * h / 5, w / 2, -h + i * h / 5, 'rgba(50,28,10,.55)', 2);
  for (let i = 0; i < 10; i++) thin(-w / 2 + 10 + i * 19, -h + (i % 5) * 39 + 10, -w / 2 + 30 + i * 19, -h + (i % 5) * 39 + 12, 'rgba(60,32,12,.3)', 1);      // (the grain)
  Q(lighten(WD, .08), [-w / 2 + 16, -18, -w / 2 + 34, -18, w / 2 - 16, -h + 18, w / 2 - 34, -h + 18], 2.5);      // the brace
  for (const x of [-w / 2, w / 2 - 18]) R(x, -h, 18, h, darken(WD, .15), 2.5);
  for (const [x, y] of [[-w / 2 + 9, -h + 10], [w / 2 - 9, -h + 10], [-w / 2 + 9, -10], [w / 2 - 9, -10]]) O(x, y, 2.4, '#3a3a40', 1);
  word('HEAVY', 0, -h * .5, 26, 'rgba(20,14,8,.7)', 1);
}

/* ---------- the furniture ---------- */
function chair() {                                  // a dining chair, side on: the back leg running up into the back, a cushioned seat, a curved front leg
  const WD = '#8a5a30';
  g.beginPath(); g.moveTo(-44, 0); g.quadraticCurveTo(-34, -46, -36, -86); g.quadraticCurveTo(-38, -140, -48, -172); g.lineTo(-38, -176); g.quadraticCurveTo(-26, -140, -26, -86); g.quadraticCurveTo(-26, -46, -34, 0); g.closePath();
  fillInk(lgr(-48, 0, -26, 0, lighten(WD, .25), WD, darken(WD, .3)), 3);
  O(-43, -176, 5, lighten(WD, .1), 2);              // its finial
  g.beginPath(); g.moveTo(30, -80); g.bezierCurveTo(48, -60, 24, -34, 38, -6); g.lineTo(48, -4); g.lineTo(48, 0); g.lineTo(30, 0); g.bezierCurveTo(16, -30, 38, -56, 22, -80); g.closePath();      // the cabriole leg
  fillInk(lgr(20, 0, 48, 0, lighten(WD, .2), WD, darken(WD, .3)), 3);
  R(-28, -40, 58, 6, darken(WD, .1), 2);
  RR(-40, -90, 88, 12, 3, lgr(0, -90, 0, -78, lighten(WD, .2), darken(WD, .15)), 3);
  RR(-38, -104, 84, 16, 7, lgr(0, -104, 0, -88, '#c4404a', '#8e1f2a'), 3);      // the cushion
  for (const x of [-16, 8, 30]) O(x, -97, 1.6, 'rgba(60,8,12,.7)', 0);
}
function chairHeld() { g.save(); g.rotate(-Math.PI / 2); g.translate(43, 176); chair(); g.restore(); }      // held by the top of its back, the rest of it out along x
function table() {                                  // a dining table: a thick top with its edge rounded, an apron, two turned legs
  const WD = '#8c5a2f';
  const leg = x => { g.beginPath(); g.moveTo(x - 6, -86); g.lineTo(x + 6, -86); g.quadraticCurveTo(x + 14, -60, x + 5, -44); g.quadraticCurveTo(x + 11, -24, x + 5, -6); g.lineTo(x + 8, 0); g.lineTo(x - 8, 0); g.lineTo(x - 5, -6); g.quadraticCurveTo(x - 11, -24, x - 5, -44); g.quadraticCurveTo(x - 14, -60, x - 6, -86); g.closePath(); fillInk(lgr(x - 12, 0, x + 12, 0, lighten(WD, .25), WD, darken(WD, .3)), 3); };
  leg(-100); leg(100);
  R(-112, -96, 224, 12, darken(WD, .15), 2.5);
  RR(-128, -112, 256, 17, 7, lgr(0, -112, 0, -95, lighten(WD, .3), WD, darken(WD, .2)), 3);
  shine(-112, -108, 100, -108, .45, 2);
}
function sofa(col = '#9e1b2a') {                    // an Empire sofa in velvet: a carved frame, rolled arms with bolsters, buttons in the back
  const WD = '#5a3418';
  for (const x of [-150, 130]) { g.beginPath(); g.moveTo(x, -22); g.quadraticCurveTo(x - 10, -6, x - 4, 0); g.lineTo(x + 24, 0); g.quadraticCurveTo(x + 26, -10, x + 20, -22); g.closePath(); fillInk(lgr(x, -22, x, 0, lighten(WD, .2), darken(WD, .3)), 2.5); }      // the feet
  RR(-170, -40, 340, 22, 6, lgr(0, -40, 0, -18, lighten(WD, .25), WD, darken(WD, .3)), 3);      // the frame along the bottom
  RR(-150, -138, 300, 84, 18, lgr(0, -138, 0, -54, lighten(col, .25), col, darken(col, .35)), 3);      // the back
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) { const x = -110 + i * 55 + (r ? 27 : 0), y = -118 + r * 28; if (x > 120) continue; O(x, y, 2.6, darken(col, .5), 1); thin(x - 9, y + 6, x, y, 'rgba(0,0,0,.25)', 1.4); }
  RR(-148, -70, 296, 32, 10, lgr(0, -70, 0, -38, lighten(col, .3), col, darken(col, .3)), 3);      // the seat
  thin(-2, -68, -2, -40, 'rgba(0,0,0,.3)', 2);
  for (const s of [-1, 1]) {                        // the arms, rolled over, and a bolster against each
    const x = s * 160;
    g.beginPath(); g.moveTo(x - s * 26, -40); g.lineTo(x - s * 26, -96); g.arc(x, -100, 26, s > 0 ? Math.PI : 0, s > 0 ? 0 : Math.PI, s < 0); g.lineTo(x + s * 22, -40); g.closePath();
    fillInk(lgr(x - 26, 0, x + 26, 0, lighten(col, .2), col, darken(col, .35)), 3);
    O(x, -100, 12, lighten(WD, .15), 2.5); O(x, -100, 5, darken(WD, .2), 1.5);
    RR(x - s * 60 - 22, -92, 44, 24, 12, lgr(0, -92, 0, -68, lighten(col, .35), darken(col, .2)), 2.5);
  }
}
function fridge() {
  RR(-54, -200, 108, 200, 12, lgr(-54, 0, 54, 0, '#ffffff', '#eef1f4', '#c9d0d8'), 3);
  thin(-54, -134, 54, -134, 'rgba(60,70,80,.6)', 2.5);
  RR(36, -190, 7, 44, 3, lgr(0, -190, 0, -146, '#f4f6f8', '#9aa3ad'), 1.5); RR(36, -124, 7, 60, 3, lgr(0, -124, 0, -64, '#f4f6f8', '#9aa3ad'), 1.5);
  for (const [x, y, c] of [[-30, -170, '#e2383c'], [-10, -112, '#4aa3e6'], [-34, -90, '#ffd84a']]) RR(x, y, 12, 10, 3, c, 1.5);      // what is stuck to it
  shine(-40, -192, -40, -10, .5, 3);
}
function telly() {                                  // a set with a tube in it, in a wooden cabinet, and the aerial on top
  thin(-10, -104, -44, -150, '#3a3d46', 2.5); thin(10, -104, 40, -154, '#3a3d46', 2.5); O(-44, -150, 3, '#3a3d46', 1); O(40, -154, 3, '#3a3d46', 1);
  RR(-90, -106, 180, 100, 10, lgr(0, -106, 0, -6, '#8a5a30', '#5c3a1c'), 3);
  RR(-76, -94, 118, 76, 14, '#1d1e23', 2.5);
  g.beginPath(); g.roundRect(-70, -88, 106, 64, 12); g.fillStyle = rgr(-30, -60, 70, '#4a6a8a', '#22324a', '#11161f'); g.fill();
  g.save(); g.globalAlpha *= .3; g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(-40, -74, 22, 8, -.4, 0, TAU); g.fill(); g.restore();
  for (const y of [-80, -58]) O(64, y, 7, '#c9ced6', 2);
  for (const x of [-70, 70]) R(x - 6, -6, 12, 6, '#3a2a1c', 1.5);
}
function lamp() { g.beginPath(); g.moveTo(-42, -176); g.lineTo(42, -176); g.lineTo(28, -122); g.lineTo(-28, -122); g.closePath(); fillInk(lgr(-42, 0, 42, 0, '#fbe9b8', '#f2d28a', '#c9a25a'), 2.5); R(-3, -122, 6, 112, lgr(-3, 0, 3, 0, '#f2d68a', '#a8823a'), 2); E2(0, -6, 30, 7, '#a8823a', 2); }

/* ---------- the scooter, the cars, the bus, the fire engine ---------- */
function scooter(col = '#e64a4f', spin = 0) {       // after a Vespa: the round body over the back wheel, the floorboard, the leg shield up to the bar, the lamp in the bar
  ground(110);
  wheel(-64, -20, 20, spin, '#d6dbe0'); wheel(70, -20, 20, spin, '#d6dbe0');
  const body = lgr(0, -150, 0, -20, lighten(col, .45), col, darken(col, .3));
  g.beginPath(); g.moveTo(-20, -34); g.bezierCurveTo(-22, -70, -48, -92, -84, -90); g.bezierCurveTo(-112, -88, -122, -64, -116, -40); g.lineTo(-100, -36); g.arc(-64, -24, 30, Math.PI + .5, -.3); g.lineTo(-20, -34); g.closePath(); fillInk(body, 3);      // the body round the engine
  shine(-104, -60, -40, -78, .55, 3);
  RR(-46, -36, 92, 8, 3, '#2a2a30', 2.5); for (let x = -38; x < 40; x += 10) thin(x, -35, x, -29, 'rgba(255,255,255,.18)', 1.2);      // the floorboard
  g.beginPath(); g.moveTo(40, -32); g.quadraticCurveTo(44, -86, 56, -124); g.lineTo(68, -126); g.quadraticCurveTo(74, -74, 64, -32); g.closePath(); fillInk(body, 3);      // the leg shield
  g.beginPath(); g.moveTo(46, -34); g.arc(70, -26, 26, Math.PI + .25, -.25); g.lineTo(90, -34); g.quadraticCurveTo(70, -48, 46, -34); g.closePath(); fillInk(body, 2.5);      // the front mudguard
  g.beginPath(); g.moveTo(-26, -88); g.quadraticCurveTo(-60, -100, -108, -92); g.quadraticCurveTo(-112, -84, -100, -82); g.quadraticCurveTo(-60, -88, -28, -80); g.closePath(); fillInk(lgr(0, -100, 0, -80, '#3a3a42', '#16161a'), 3);      // the seat
  R(60, -152, 10, 30, body, 2.5);
  RR(46, -158, 54, 9, 4, '#26262c', 2.5);
  O(90, -150, 9, '#cfd6de', 2.5); O(91, -150, 5.5, rgr(91, -150, 6, '#fffbe0', '#ffe9a0', '#c9b26a'), 1.5);      // the lamp
  thin(54, -158, 50, -178, '#9aa3ad', 2); E2(50, -182, 6, 4, '#cfd6de', 2);      // a mirror
  O(-114, -58, 4, '#ff4a4a', 1.5);
}
function car(col = CARS[0], spin = 0) {             // a saloon after a 1992 Corolla, 320 long: bonnet, windscreen, three windows, the boot, the arches
  ground(175);
  wheel(-100, -30, 28, spin); wheel(102, -30, 28, spin);
  g.beginPath(); g.moveTo(-158, -30); g.lineTo(-163, -64); g.quadraticCurveTo(-162, -82, -146, -85); g.lineTo(-94, -89); g.quadraticCurveTo(-82, -92, -66, -122); g.quadraticCurveTo(-60, -131, -46, -132);
  g.lineTo(22, -132); g.quadraticCurveTo(34, -131, 42, -122); g.lineTo(70, -94); g.quadraticCurveTo(80, -90, 92, -89); g.lineTo(144, -82); g.quadraticCurveTo(160, -78, 162, -62); g.lineTo(163, -40); g.quadraticCurveTo(162, -30, 154, -30);
  g.lineTo(138, -30); g.arc(102, -30, 36, 0, Math.PI, true); g.lineTo(-64, -30); g.arc(-100, -30, 36, 0, Math.PI, true); g.closePath();
  fillInk(lgr(0, -132, 0, -30, lighten(col, .42), col, darken(col, .32)), 3);
  g.beginPath(); g.moveTo(-84, -93); g.lineTo(-60, -124); g.lineTo(-44, -126); g.lineTo(20, -126); g.lineTo(36, -118); g.lineTo(62, -94); g.closePath();      // the glass
  fillInk(lgr(0, -126, 0, -93, '#263546', '#4f6b85', '#7d9bb5'), 2.5);
  g.fillStyle = '#16161a'; g.fillRect(-14, -126, 7, 33); g.fillRect(-60, -122, 6, 29);      // the pillars
  g.save(); g.globalAlpha *= .3; g.fillStyle = '#ffffff'; pts([2, -124, 14, -124, -4, -95, -16, -95]); g.fill(); pts([28, -120, 34, -116, 20, -95, 14, -95]); g.fill(); g.restore();      // a glare on it
  thin(-88, -93, 66, -93, 'rgba(230,236,242,.8)', 2);      // the chrome along it
  for (const x of [-78, -12, 62]) thin(x, -90, x + (x > 0 ? -2 : 0), -36, 'rgba(0,0,0,.35)', 1.6);      // the doors
  for (const x of [-30, 36]) RR(x, -82, 14, 4, 2, darken(col, .45), 1);
  shine(-150, -70, 148, -66, .4, 2.4);
  Q(darken(col, .2), [56, -97, 68, -101, 70, -92, 60, -91], 2);      // the wing mirror
  RR(140, -76, 22, 12, 4, rgr(150, -70, 12, '#ffffff', '#fff3c0', '#d9c27a'), 2);      // the lamps
  RR(-164, -80, 12, 14, 3, lgr(0, -80, 0, -66, '#ff7070', '#c21d24'), 2);
  RR(-164, -50, 30, 16, 5, '#2a2a30', 2); RR(134, -48, 30, 16, 5, '#2a2a30', 2);      // the bumpers
}
function bus(spin = 0, face = 1) {                  // a school bus after an International: the bonnet out front, eight windows, black rails, the lamps, the stop sign folded
  const Y = '#f6b71a';
  ground(330);
  wheel(-206, -32, 33, spin, '#e8e8e8'); wheel(262, -32, 33, spin, '#e8e8e8');
  g.beginPath(); g.moveTo(-332, -28); g.lineTo(-332, -238); g.quadraticCurveTo(-330, -256, -310, -258); g.lineTo(226, -258); g.quadraticCurveTo(244, -256, 246, -240); g.lineTo(250, -150);
  g.lineTo(306, -146); g.quadraticCurveTo(330, -142, 332, -118); g.lineTo(334, -44); g.lineTo(298, -32); g.arc(262, -32, 38, 0, Math.PI, true); g.lineTo(-170, -32); g.arc(-206, -32, 38, 0, Math.PI, true); g.lineTo(-332, -28); g.closePath();
  fillInk(lgr(0, -258, 0, -28, lighten(Y, .35), Y, darken(Y, .25)), 3);
  for (const y of [-134, -104, -76]) R(-332, y, 582, 6, '#1a1a1e', 1);      // its rails
  for (let i = 0; i < 8; i++) { const x = -312 + i * 62; RR(x, -236, 52, 70, 4, '#1a1a1e', 2); g.fillStyle = lgr(0, -232, 0, -170, '#2f4256', '#6f8fab'); g.fillRect(x + 4, -232, 44, 62); thin(x + 4, -212, x + 48, -212, '#1a1a1e', 3); }
  RR(194, -236, 44, 190, 4, '#1a1a1e', 2.5); g.fillStyle = lgr(0, -230, 0, -60, '#36495e', '#7d9bb5'); g.fillRect(198, -230, 17, 170); g.fillRect(219, -230, 15, 170);      // the door
  Q('#2c4054', [246, -238, 262, -150, 250, -150, 246, -238], 2);      // the windscreen's edge
  R(296, -122, 38, 46, '#1a1a1e', 2); for (let y = -116; y < -80; y += 8) thin(298, y, 332, y, '#6a6a70', 2);      // the grille
  O(322, -134, 7, rgr(322, -134, 7, '#ffffff', '#fff3c0', '#c9b26a'), 1.5);
  RR(-60, -296, 300, 34, 4, '#1a1a1e', 2.5); RR(-56, -292, 292, 26, 3, Y, 1.5); word('SCHOOL BUS', 90, -279, 20, '#1a1a1e', face);
  for (const x of [-320, -296, 214, 236]) O(x, -248, 6, x < 0 || x > 230 ? '#ff4040' : '#ffb000', 1.5);      // the lamps up top
  g.save(); g.translate(150, -150); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + Math.PI / 8; i ? g.lineTo(Math.cos(a) * 16, Math.sin(a) * 16) : g.moveTo(Math.cos(a) * 16, Math.sin(a) * 16); } g.closePath(); fillInk('#d01c24', 2); word('STOP', 0, 0, 9, '#ffffff', face); g.restore();
  RR(310, -60, 26, 16, 4, '#1a1a1e', 2); RR(-338, -56, 24, 16, 4, '#1a1a1e', 2);
  shine(-320, -150, 240, -150, .45, 3);
}
function engine() {                                 // a fire engine: the cab and its lights, lockers down the side, a ladder on top, a hose reel at the back
  const RD = '#d4232b';
  ground(290);
  wheel(-176, -30, 30, 0, '#d8dde2'); wheel(-104, -30, 30, 0, '#d8dde2'); wheel(196, -30, 30, 0, '#d8dde2');
  g.beginPath(); g.rect(-274, -176, 404, 146); fillInk(lgr(0, -176, 0, -30, lighten(RD, .3), RD, darken(RD, .3)), 3);
  g.beginPath(); g.moveTo(130, -30); g.lineTo(130, -214); g.lineTo(244, -214); g.quadraticCurveTo(262, -212, 266, -190); g.lineTo(278, -110); g.lineTo(280, -30); g.closePath(); fillInk(lgr(0, -214, 0, -30, lighten(RD, .3), RD, darken(RD, .3)), 3);
  pts([150, -200, 236, -200, 256, -142, 150, -142]); fillInk(lgr(0, -200, 0, -142, '#2c4054', '#7d9bb5'), 2.5); thin(196, -200, 196, -142, '#1a1a1e', 4);
  R(-274, -96, 554, 10, '#f4f1e6', 1.5); g.fillStyle = '#ffd84a'; for (let x = -270; x < 276; x += 24) g.fillRect(x, -96, 12, 10);      // the stripe
  for (let i = 0; i < 4; i++) { const x = -262 + i * 98; RR(x, -168, 86, 64, 4, lgr(0, -168, 0, -104, lighten(RD, .15), darken(RD, .15)), 2); for (let y = -160; y < -108; y += 8) thin(x + 4, y, x + 82, y, 'rgba(0,0,0,.2)', 1.2); RR(x + 36, -112, 14, 5, 2, '#d8dde2', 1); }      // the lockers
  for (const x of [-250, 104]) R(x, -188, 6, 14, '#9aa3ad', 1.5);
  R(-262, -196, 360, 8, '#cfd6de', 2); R(-262, -186, 360, 8, '#cfd6de', 2); for (let x = -254; x < 94; x += 22) R(x, -194, 4, 14, '#9aa3ad', 1);      // the ladder
  O(-232, -60, 26, '#5a5a62', 2.5); O(-232, -60, 18, '#e9d9a8', 2); g.strokeStyle = 'rgba(120,90,40,.5)'; for (let r = 6; r < 18; r += 4) { g.beginPath(); g.arc(-232, -60, r, 0, TAU); g.stroke(); }      // the reel
  RR(140, -226, 104, 12, 4, '#1a1a1e', 2); for (let i = 0; i < 4; i++) RR(146 + i * 24, -224, 20, 8, 2, i % 2 ? '#3a6ef0' : '#ff3040', 1);      // the light bar
  RR(270, -64, 14, 34, 3, '#d8dde2', 2); O(272, -120, 7, rgr(272, -120, 7, '#ffffff', '#fff3c0', '#c9b26a'), 1.5);
  shine(-266, -170, 124, -170, .4, 3);
}
function ext() {                                    // an extinguisher across both hands: the bottle, its valve and gauge, the hose to a black horn out the front
  RR(-12, -17, 96, 34, 14, lgr(0, -17, 0, 17, '#ff7a7a', '#d8262c', '#8e1418'), 3);
  RR(8, -10, 34, 20, 3, '#f6f3ea', 1.5); R(8, -10, 34, 6, '#d8262c', 1); g.fillStyle = '#1a1a1e'; pts([20, 8, 25, -2, 30, 8]); g.fill();      // the label
  RR(82, -10, 16, 20, 3, lgr(0, -10, 0, 10, '#f4f6f8', '#8f98a3'), 2);      // the valve
  Q('#cfd6de', [88, -12, 112, -26, 116, -22, 94, -6], 2);      // its lever
  O(92, -20, 6, '#ffffff', 1.5); thin(92, -20, 95, -23, '#d8262c', 1.4); g.strokeStyle = '#3fa34d'; g.lineWidth = 1.5 * LWK; g.beginPath(); g.arc(92, -20, 4, Math.PI, Math.PI * 1.6); g.stroke();      // the gauge
  g.strokeStyle = LINE; g.lineWidth = 7 * LWK; g.lineCap = 'round'; g.beginPath(); g.moveTo(98, 6); g.quadraticCurveTo(124, 34, 132, 12); g.stroke();
  g.strokeStyle = '#26262c'; g.lineWidth = 4 * LWK; g.stroke();
  Q(lgr(0, -10, 0, 28, '#3a3a42', '#121216'), [128, 6, 160, -10, 160, 30, 130, 18], 2.5);      // the horn
  thin(52, -18, 60, -30, '#ffd84a', 2); RR(56, -40, 12, 10, 2, '#ffd84a', 1.2);      // the pin and its tag
  shine(-6, -10, 76, -10, .5, 2.2);
}
function nozzle() { RR(-8, -7, 52, 14, 4, lgr(0, -7, 0, 7, '#5a5e68', '#2a2c33'), 2.5); Q(lgr(0, -10, 0, 10, '#f2d68a', '#a8823a'), [44, -10, 70, -6, 70, 6, 44, 10], 2); for (let x = 2; x < 40; x += 8) thin(x, -6, x, 6, 'rgba(255,255,255,.18)', 1.5); }

/* ---------- the house, the mansion ---------- */
function bricks(x, y, w, h, base) {                 // a wall of them
  g.fillStyle = lgr(0, y, 0, y + h, lighten(base, .12), base, darken(base, .12)); g.fillRect(x, y, w, h);
  g.strokeStyle = 'rgba(70,30,22,.4)'; g.lineWidth = 1.2 * LWK; g.beginPath();
  for (let r = 0, yy = y + 12; yy < y + h; yy += 12, r++) { g.moveTo(x, yy); g.lineTo(x + w, yy); for (let xx = x + (r % 2 ? 14 : 0); xx < x + w; xx += 28) { g.moveTo(xx, yy - 12); g.lineTo(xx, yy); } }
  g.stroke();
}
function window2(x, y, w, h, shutters = '#2e5a3a') { // a window: shutters, a white frame, four panes, curtains, a sill
  if (shutters) for (const sx of [x - 16, x + w + 2]) { RR(sx, y, 14, h, 2, shutters, 2); for (let yy = y + 6; yy < y + h - 4; yy += 7) thin(sx + 2, yy, sx + 12, yy, 'rgba(0,0,0,.25)', 1.2); }
  R(x, y, w, h, '#ffffff', 2.5);
  g.fillStyle = lgr(0, y, 0, y + h, '#3d5872', '#8fb0cc'); g.fillRect(x + 5, y + 5, w - 10, h - 10);
  g.fillStyle = 'rgba(250,240,220,.85)'; pts([x + 5, y + 5, x + w * .34, y + 5, x + 9, y + h - 5, x + 5, y + h - 5]); g.fill(); pts([x + w - 5, y + 5, x + w * .66, y + 5, x + w - 9, y + h - 5, x + w - 5, y + h - 5]); g.fill();
  thin(x + w / 2, y + 5, x + w / 2, y + h - 5, '#ffffff', 3); thin(x + 5, y + h / 2, x + w - 5, y + h / 2, '#ffffff', 3);
  R(x - 4, y + h, w + 8, 6, '#e8e4da', 2);
}
function bush(x, r) { O(x, -r * .7, r, rgr(x, -r * .7, r, '#7ac36a', '#3f8a3a', '#245a26'), 2.5); O(x - r * .7, -r * .45, r * .62, rgr(x - r * .7, -r * .45, r * .62, '#7ac36a', '#3f8a3a', '#245a26'), 2.5); }
function house() {                                  // a brick house of one floor after a ranch house: a shingled roof, a chimney, shuttered windows, a porch and a door
  const w = 360, h = 210, RF = '#6e3a2e';
  R(w * .2, -h - 150, 40, 110, '#9a4a34', 3); bricks(w * .2 + 2, -h - 148, 36, 106, '#a5523a'); R(w * .2 - 6, -h - 158, 52, 12, '#5a5a62', 2.5);      // the chimney
  pts([-w / 2 - 34, -h + 6, -w * .3, -h - 136, w * .3, -h - 136, w / 2 + 34, -h + 6]); fillInk(lgr(0, -h - 136, 0, -h, lighten(RF, .2), RF, darken(RF, .3)), 3);
  g.save(); pts([-w / 2 - 34, -h + 6, -w * .3, -h - 136, w * .3, -h - 136, w / 2 + 34, -h + 6]); g.clip();
  for (let r = 0; r < 9; r++) { const y = -h - 136 + r * 16; g.strokeStyle = 'rgba(30,10,6,.35)'; g.lineWidth = 2 * LWK; g.beginPath(); g.moveTo(-w, y); g.lineTo(w, y); g.stroke(); for (let x = -w / 2 - 40 + (r % 2) * 12; x < w / 2 + 40; x += 24) thin(x, y, x, y + 16, 'rgba(30,10,6,.25)', 1.2); }
  g.restore();
  R(-w / 2 - 34, -h + 2, w + 68, 8, '#f2ede2', 2);      // the eaves
  g.beginPath(); g.rect(-w / 2, -h + 10, w, h - 10); fillInk('#a5523a', 3); bricks(-w / 2 + 2, -h + 12, w - 4, h - 26, '#a5523a');
  R(-w / 2, -16, w, 16, '#8f8f96', 2.5);      // the footing
  window2(-w * .4 + 4, -h + 48, 74, 70); window2(w * .18, -h + 48, 74, 70);
  pts([-46, -150, 0, -182, 46, -150]); fillInk('#f2ede2', 2.5); R(-40, -150, 6, 134, '#f2ede2', 2); R(34, -150, 6, 134, '#f2ede2', 2);      // the porch
  RR(-26, -132, 52, 116, 3, lgr(0, -132, 0, -16, '#3a6a4a', '#23402c'), 3);      // the door
  R(-18, -124, 36, 20, '#8fb0cc', 2); for (const y of [-96, -60]) RR(-18, y, 36, 26, 2, 'rgba(0,0,0,.15)', 1.5); O(16, -70, 3.5, '#e2b545', 1.5);
  R(-34, -16, 68, 8, '#c9c9cf', 2); R(-42, -8, 84, 8, '#b4b4ba', 2);      // the steps
  bush(-w / 2 + 36, 26); bush(w / 2 - 30, 24);
}
function mansion() {                                // a mansion after a Georgian house: two floors of windows, a portico on four columns, a slate roof with dormers
  const w = 900, h = 430, SL = '#4f5566';
  for (const x of [-w * .34, w * .3]) { R(x, -h - 240, 50, 100, '#a5523a', 3); R(x - 6, -h - 248, 62, 12, '#5a5a62', 2.5); }
  pts([-w / 2 - 30, -h + 6, -w / 2 + 110, -h - 170, w / 2 - 110, -h - 170, w / 2 + 30, -h + 6]); fillInk(lgr(0, -h - 170, 0, -h, lighten(SL, .25), SL, darken(SL, .3)), 3);
  for (const x of [-220, 0, 220]) { R(x - 30, -h - 110, 60, 64, '#f2ede2', 2.5); pts([x - 38, -h - 110, x, -h - 146, x + 38, -h - 110]); fillInk(SL, 2.5); R(x - 18, -h - 98, 36, 46, lgr(0, -h - 98, 0, -h - 52, '#3d5872', '#8fb0cc'), 2); }      // the dormers
  R(-w / 2 - 30, -h - 4, w + 60, 14, '#f8f4ea', 2.5);
  g.beginPath(); g.rect(-w / 2, -h + 10, w, h - 10); fillInk(lgr(0, -h, 0, 0, '#fbf4e2', '#efe2c2', '#d8c8a2'), 3);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) { if (r === 1 && (i === 3)) continue; if (i >= 2 && i <= 4 && r === 1) continue; window2(-w / 2 + 64 + i * 122, -h + 48 + r * 186, 70, r ? 110 : 92, '#26262c'); }
  pts([-170, -h + 70, 0, -h - 40, 170, -h + 70]); fillInk('#fbf8ee', 3); O(0, -h + 34, 20, lgr(0, -h + 14, 0, -h + 54, '#3d5872', '#8fb0cc'), 2.5);      // the pediment, and the round window in it
  R(-170, -h + 70, 340, 16, '#f2ede2', 2.5);
  for (const x of [-140, -50, 50, 140]) { R(x - 16, -h + 86, 32, 14, '#f2ede2', 2); g.beginPath(); g.rect(x - 12, -h + 100, 24, h - 140); fillInk(lgr(x - 12, 0, x + 12, 0, '#ffffff', '#ece6d6', '#c9c0aa'), 2.5); R(x - 16, -40, 32, 14, '#f2ede2', 2); }      // the columns
  RR(-46, -200, 92, 174, 46, lgr(0, -200, 0, -26, '#3a2a1e', '#1e140c'), 3); R(-46, -200, 92, 46, 'rgba(140,176,204,.8)', 2);      // the door, a fanlight over it
  R(-200, -26, 400, 13, '#d9d9df', 2.5); R(-220, -13, 440, 13, '#c4c4ca', 2.5);
  bush(-w / 2 + 40, 32); bush(w / 2 - 40, 32); bush(-260, 26); bush(260, 26);
}

/* ---------- the weapons the prize buys ---------- */
function pistol() {                                 // a polymer pistol after a Glock: a square slide with the grip cut into its back, a trigger guard, a grip that is mostly texture
  Q(lgr(0, 0, 0, 34, '#2c2e35', '#15161a'), [-6, 2, 16, 2, 10, 34, -10, 32], 2.5);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) O(-3 + j * 5 - i * .6, 10 + i * 6, .9, 'rgba(255,255,255,.12)', 0);
  g.beginPath(); g.moveTo(14, 2); g.lineTo(34, 2); g.quadraticCurveTo(36, 14, 26, 16); g.lineTo(16, 16); g.closePath(); fillInk('#15161a', 2); thin(22, 3, 24, 11, '#5a5e68', 2);      // the guard and the trigger
  RR(-10, -12, 74, 14, 2, lgr(0, -12, 0, 2, '#5a5e68', '#2f3138'), 2.5);      // the slide
  for (let x = -6; x < 6; x += 3) thin(x, -10, x, 0, 'rgba(0,0,0,.5)', 1);
  R(24, -10, 14, 5, '#17171b', 1); R(60, -15, 3, 3, '#17171b', 1); R(-8, -15, 4, 3, '#17171b', 1);
}
function sniper() {                                 // a bolt-action rifle after a K14: skeleton stock, the bolt, a scope on rings, a long barrel and its brake, the bipod folded under
  Q(lgr(0, -10, 0, 22, '#3c4638', '#22281f'), [-60, -6, -6, -8, -2, 10, -30, 14, -38, 6, -56, 24, -62, 22], 2.5);
  R(-64, -8, 8, 32, '#15161a', 2);
  RR(-4, -9, 70, 18, 3, lgr(0, -9, 0, 9, '#4a5246', '#262c24'), 2.5);
  O(20, 14, 5, '#9aa3ad', 2); thin(20, 9, 26, 6, '#9aa3ad', 3);      // the bolt
  R(28, 9, 14, 22, '#1a1a1e', 2);      // the magazine
  g.beginPath(); g.moveTo(64, -6); g.lineTo(252, -4.5); g.lineTo(252, 4.5); g.lineTo(64, 6); g.closePath(); fillInk(lgr(0, -6, 0, 6, '#5a5e68', '#1e2026'), 2.5);
  RR(250, -7, 20, 14, 2, '#2a2c33', 2); for (const x of [255, 262]) thin(x, -6, x, 6, '#0c0c10', 2);      // the brake
  for (const x of [22, 70]) R(x, -26, 8, 18, '#1a1a1e', 1.5);
  g.beginPath(); g.moveTo(4, -34); g.lineTo(16, -30); g.lineTo(96, -30); g.lineTo(108, -38); g.lineTo(108, -12); g.lineTo(96, -20); g.lineTo(16, -20); g.lineTo(4, -16); g.closePath(); fillInk(lgr(0, -38, 0, -12, '#3a3d46', '#121418'), 2.5);      // the scope
  R(50, -38, 10, 8, '#1a1a1e', 1.5); E2(108, -25, 3, 13, '#4a6aa0', 1.5);
  thin(110, 8, 168, 16, '#1a1a1e', 3); thin(118, 8, 176, 12, '#1a1a1e', 3);      // the bipod
}
function katana() {                                 // a katana: the wrapped handle, a round guard, the collar, a curved blade and the line of its temper
  RR(-44, -5, 44, 10, 3, '#f2ede2', 2); g.save(); g.beginPath(); g.rect(-44, -5, 44, 10); g.clip(); g.fillStyle = '#1a1a22'; for (let x = -44; x < 0; x += 9) { pts([x, -5, x + 4.5, 0, x, 5, x + 9, 5, x + 4.5, 0, x + 9, -5]); g.fill(); } g.restore(); ink(2);
  E2(1, 0, 3.5, 12, '#c9a53a', 2); R(4, -4, 8, 8, '#e2c060', 1.5);
  g.beginPath(); g.moveTo(12, -4); g.quadraticCurveTo(110, -10, 190, -16); g.lineTo(204, -16); g.quadraticCurveTo(196, -8, 186, -8); g.quadraticCurveTo(108, -1, 12, 4); g.closePath();
  fillInk(lgr(0, -14, 0, 4, '#ffffff', '#d4dbe3', '#9aa5b2'), 2);
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.4 * LWK; g.beginPath(); for (let x = 16; x < 184; x += 8) { const y = 1 - (x - 12) * .055 + Math.sin(x * .3) * 1.2; x === 16 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
}
function chainHeld() { for (let i = 0; i < 11; i++) { const x = i * 15; if (i % 2) RR(x - 9, -2.5, 18, 5, 2.5, lgr(0, -2.5, 0, 2.5, '#d8dee6', '#6f7884'), 2); else { E2(x, 0, 9, 6, lgr(0, -6, 0, 6, '#d8dee6', '#6f7884'), 2); E2(x, 0, 4.5, 2, '#1a1a1e', 0); } } }
function cloudHeld() { for (let i = 0; i < 3; i++) { const x = -6 + i * 66; RR(x, -7, 58, 14, 6, lgr(0, -7, 0, 7, '#ff9aa6', '#ff5a6e', '#b8243a'), 2.5); R(x - 2, -8, 6, 16, '#e2c060', 1.5); R(x + 54, -8, 6, 16, '#e2c060', 1.5); if (i < 2) { O(x + 61, 0, 2.5, '#c9ced6', 1); } } }
function spearHeld() { RR(-20, -3.5, 182, 7, 3, lgr(0, -3.5, 0, 3.5, '#f6d77a', '#b8902e'), 2); Q(lgr(0, -10, 0, 10, '#fff2b0', '#e2b545', '#a8822a'), [158, -11, 218, 0, 158, 11, 164, 0], 2); Q('#e2b545', [148, -4, 178, -26, 172, -4], 1.5); Q('#e2b545', [148, 4, 178, 26, 172, 4], 1.5); }
function ticket(col) {                              // a coupon: notched along one edge, its colour across the top, a big percent and a barcode
  g.beginPath(); g.moveTo(-6, -22); g.lineTo(72, -22); g.lineTo(72, 22); g.lineTo(-6, 22);
  for (let y = 18; y > -22; y -= 8) g.arc(-6, y - 4, 3, Math.PI / 2, -Math.PI / 2, false);      // (the notches, cut in)
  g.closePath(); fillInk('#fbf8ee', 2);
  g.fillStyle = col; g.fillRect(-2, -20, 72, 12); thin(-2, -8, 70, -8, 'rgba(0,0,0,.25)', 1);
  g.save(); g.translate(30, 6); g.scale(1, 1); g.font = `bold 18px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = LINE; g.fillText('%', 0, 0); g.restore();
  for (let i = 0; i < 12; i++) thin(48 + i * 1.8, 0, 48 + i * 1.8, 16, '#1a1a1e', i % 3 ? .6 : 1.3);
}

/* ---------- Build 0.28v1's own things ---------- */
function bowlingBall(r = 26, spin = 0, col = '#5a2fb0') {      // a resin ball: a swirl in it, a shine on it, three holes that go round as it rolls
  g.beginPath(); g.arc(0, 0, r, 0, TAU); fillInk(rgr(0, 0, r, lighten(col, .55), col, darken(col, .55)), 3);
  g.save(); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.clip(); g.rotate(spin);
  g.fillStyle = 'rgba(80,190,255,.35)'; g.beginPath(); g.ellipse(-r * .2, r * .1, r * .9, r * .28, .6, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(r * .3, -r * .3, r * .5, r * .14, -.9, 0, TAU); g.fill();
  for (const [x, y, s] of [[-r * .25, -r * .45, .13], [r * .08, -r * .52, .13], [-r * .05, -r * .15, .17]]) { g.fillStyle = '#0c0c12'; g.beginPath(); g.arc(x, y, r * s, 0, TAU); g.fill(); }
  g.restore();
  g.save(); g.globalAlpha *= .7; g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(-r * .38, -r * .42, r * .22, r * .12, -.6, 0, TAU); g.fill(); g.restore();
}
function pin() {                                    // a pin: white, two red stripes at its neck
  g.beginPath(); g.moveTo(-7, 0); g.bezierCurveTo(-16, -30, -14, -50, -6, -64); g.bezierCurveTo(-3, -72, -9, -80, -6, -88); g.arc(0, -90, 6, Math.PI, 0); g.bezierCurveTo(9, -80, 3, -72, 6, -64); g.bezierCurveTo(14, -50, 16, -30, 7, 0); g.closePath();
  fillInk(lgr(-14, 0, 14, 0, '#ffffff', '#f2f0ea', '#c9c5bc'), 2.5);
  R(-6.5, -72, 13, 3, '#d0353a', 0); R(-6, -66, 12, 3, '#d0353a', 0);
}
function cart(full = false, spin = 0) {             // a shopping trolley: a wire basket narrowing to the front, a red handle at the back, a rack under it, four castors
  if (full) groceriesIn();
  const M = '#c3cad2';
  g.save(); g.strokeStyle = LINE; g.lineWidth = 6 * LWK; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-96, -150); g.lineTo(96, -138); g.lineTo(84, -70); g.lineTo(-80, -64); g.closePath(); g.stroke();
  g.strokeStyle = M; g.lineWidth = 3 * LWK; g.stroke();
  g.lineWidth = 1.4 * LWK; g.beginPath(); for (let x = -80; x <= 84; x += 12) { g.moveTo(x, -149 + (x + 96) * .06); g.lineTo(x + (x > 70 ? -4 : 0), -65 - (x + 80) * .036); } for (let y = -132; y < -66; y += 12) { g.moveTo(-94 + (y + 150) * .17, y); g.lineTo(94 - (y + 138) * .17, y + 6); } g.stroke(); g.restore();
  thin(-88, -60, -76, -20, LINE, 6); thin(-88, -60, -76, -20, M, 3); thin(80, -66, 74, -20, LINE, 6); thin(80, -66, 74, -20, M, 3);      // the legs
  thin(-82, -30, 80, -30, LINE, 6); thin(-82, -30, 80, -30, M, 3);      // the rack
  thin(-96, -150, -122, -168, LINE, 6); thin(-96, -150, -122, -168, M, 3); RR(-136, -176, 30, 14, 6, lgr(0, -176, 0, -162, '#ff6a6a', '#c21d24'), 2.5);      // the handle
  for (const x of [-72, 70]) { thin(x, -20, x, -12, LINE, 4); wheel(x, -9, 9, spin, '#9aa3ad'); }
}
function groceriesIn() {                            // what is in the trolley, over the top of it
  O(-40, -152, 26, rgr(-40, -152, 26, '#9be07a', '#3f9a3a', '#1f5a22'), 2.5); for (let a = -1; a <= 1; a++) thin(-40 + a * 9, -176, -40 + a * 12, -128, 'rgba(20,60,20,.5)', 2);      // a melon
  RR(-6, -196, 34, 60, 4, lgr(-6, 0, 28, 0, '#ffffff', '#dfe6ee'), 2.5); Q('#4aa3e6', [-6, -196, 11, -210, 28, -196], 2); R(-6, -176, 34, 14, '#4aa3e6', 1.5);      // the milk
  for (const x of [40, 64]) { RR(x, -176, 20, 34, 3, lgr(x, 0, x + 20, 0, '#e9eef3', '#9aa3ad'), 2); R(x, -168, 20, 16, x > 50 ? '#e2383c' : '#ffd84a', 1); }      // two tins
  RR(-90, -168, 40, 24, 10, lgr(0, -168, 0, -144, '#e9b26a', '#b87a34'), 2.5);      // a loaf
}
const GROCERIES = [
  () => { O(0, -26, 26, rgr(0, -26, 26, '#9be07a', '#3f9a3a', '#1f5a22'), 2.5); },
  () => { RR(-17, -60, 34, 60, 4, lgr(-17, 0, 17, 0, '#ffffff', '#dfe6ee'), 2.5); Q('#4aa3e6', [-17, -60, 0, -74, 17, -60], 2); R(-17, -40, 34, 14, '#4aa3e6', 1.5); },
  () => { RR(-10, -34, 20, 34, 3, lgr(-10, 0, 10, 0, '#e9eef3', '#9aa3ad'), 2); R(-10, -26, 20, 16, '#e2383c', 1); },
  () => { RR(-20, -24, 40, 24, 10, lgr(0, -24, 0, 0, '#e9b26a', '#b87a34'), 2.5); },
  () => { g.beginPath(); g.moveTo(-8, 0); g.lineTo(-8, -40); g.lineTo(-4, -50); g.lineTo(-4, -60); g.lineTo(4, -60); g.lineTo(4, -50); g.lineTo(8, -40); g.lineTo(8, 0); g.closePath(); fillInk(lgr(-8, 0, 8, 0, '#7ad0a0', '#2f8a5a'), 2); R(-8, -30, 16, 14, '#f4f1e6', 1); },
  () => { g.save(); g.rotate(-.4); g.strokeStyle = LINE; g.lineWidth = 12 * LWK; g.lineCap = 'round'; g.beginPath(); g.arc(0, -30, 26, .3, 2.3); g.stroke(); g.strokeStyle = '#ffe14a'; g.lineWidth = 8 * LWK; g.stroke(); g.restore(); }
];
function rod() {                                    // a fishing rod in the hand: cork grip, a spinning reel under it, guides on the way out to its tip
  RR(-40, -4, 44, 8, 3, lgr(0, -4, 0, 4, '#e2c08a', '#a8823a'), 2);
  g.beginPath(); g.moveTo(4, -3); g.lineTo(220, -1); g.lineTo(220, 1); g.lineTo(4, 3); g.closePath(); fillInk('#26262c', 2);
  for (const x of [50, 100, 150, 196]) { thin(x, 1, x, 7 - x * .02, '#9aa3ad', 1.5); O(x, 8 - x * .02, 2.2, 'rgba(0,0,0,0)', 1.2); }
  thin(10, 3, 12, 14, '#3a3d46', 3); RR(0, 12, 24, 16, 6, lgr(0, 12, 0, 28, '#e9eef3', '#6f7884'), 2.5); RR(4, 14, 16, 12, 4, '#e2b545', 1.5); thin(24, 20, 34, 26, '#3a3d46', 2.5); O(34, 26, 3, '#26262c', 1.5);      // the reel
}
function swordfish() {                              // a swordfish held by the tail: the tail fin at the hand, the body, the sail, and the bill out in front
  Q(lgr(0, -40, 0, 40, '#4f7fb5', '#22406a'), [-30, -38, 8, -4, 8, 4, -30, 38, -16, 0], 2.5);
  g.beginPath(); g.moveTo(6, 0); g.bezierCurveTo(60, -30, 170, -42, 230, -10); g.lineTo(380, -3); g.lineTo(380, 1); g.lineTo(232, 8); g.bezierCurveTo(170, 34, 60, 22, 6, 0); g.closePath();
  fillInk(lgr(0, -40, 0, 30, '#6fa0d0', '#3f6fa0', '#d8e4ee'), 3);
  Q(lgr(0, -110, 0, -30, '#4f7fb5', '#22406a'), [110, -32, 140, -110, 196, -96, 210, -36], 2.5);      // the sail
  Q('#3f6fa0', [150, 18, 170, 46, 186, 20], 2);
  O(214, -10, 5, '#ffffff', 1.5); O(215, -10, 2.4, '#0c0c12', 0);
  shine(40, -10, 200, -22, .45, 2.4);
}
function sledge() {                                 // a sledgehammer: a long ash handle, a steel head with its two faces
  RR(-20, -5, 176, 10, 4, lgr(0, -5, 0, 5, '#f0d29a', '#c99a5a', '#8a6230'), 2.5);
  for (let i = 0; i < 3; i++) thin(10 + i * 40, -2 + i, 70 + i * 40, -1 + i, 'rgba(90,50,20,.3)', 1);
  g.beginPath(); g.moveTo(150, -34); g.lineTo(200, -34); g.lineTo(206, -28); g.lineTo(206, 28); g.lineTo(200, 34); g.lineTo(150, 34); g.lineTo(144, 28); g.lineTo(144, -28); g.closePath();
  fillInk(lgr(144, 0, 206, 0, '#cfd6de', '#7c8794', '#4a525c'), 3);
  shine(152, -26, 152, 26, .5, 2.5);
}
function wreckingBall() { thin(0, -50, 0, -1500, LINE, 9); thin(0, -50, 0, -1500, '#5a5e68', 5); for (let y = -60; y > -1500; y -= 22) thin(-3, y, 3, y - 8, '#2a2c33', 3); R(-10, -66, 20, 22, '#3a3d46', 2.5); O(0, 0, 58, rgr(0, 0, 58, '#7c8794', '#2f3138', '#0c0c10'), 3.5); }
function jackhammer() {                             // a jackhammer, held point down along x: the T handle at the hand, the body, the bit
  R(-6, -30, 12, 60, '#26262c', 2.5); RR(-14, -36, 28, 10, 4, '#1a1a1e', 2); RR(-14, 26, 28, 10, 4, '#1a1a1e', 2);
  RR(6, -16, 96, 32, 6, lgr(0, -16, 0, 16, '#ffe14a', '#e2b000', '#9a7800'), 3);
  for (let x = 20; x < 96; x += 14) thin(x, -14, x, 14, 'rgba(0,0,0,.25)', 2);
  R(100, -8, 18, 16, '#3a3d46', 2.5); Q(lgr(0, -6, 0, 6, '#cfd6de', '#5a5e68'), [118, -5, 168, -3, 176, 0, 168, 3, 118, 5], 2);
  g.strokeStyle = LINE; g.lineWidth = 6 * LWK; g.beginPath(); g.moveTo(12, 16); g.quadraticCurveTo(-10, 60, -40, 70); g.stroke(); g.strokeStyle = '#d8262c'; g.lineWidth = 3.5 * LWK; g.stroke();      // the air line
}
const HELD = {
  bat: () => bat(160), ball: () => { g.translate(12, 0); ball(13); },
  bigbat: () => { g.translate(-12, 0); g.scale(2.3, 2.3); LWK = 1 / 2.3; bat(160, GOLD); LWK = 1; },
  knife, cleaver, chair: chairHeld, ext, hose: nozzle, pistol, sniper, katana, chain: chainHeld, cloud: cloudHeld, spear: spearHeld,
  ticketC: () => ticket(CPN), ticketX: () => ticket(XTR), ticketP: () => ticket(GOLD),
  bowl: () => { g.translate(18, 0); bowlingBall(24, 0); }, rod, swordfish: () => { g.translate(14, 0); swordfish(); }, sledge, jack: jackhammer };
// drawn along whichever arm holds it, out from the hand the way the arm points (as tools.js holds its tools)
function inHand(p, front, fn) {
  const ps = p.pose, an = front ? ps[2] : ps[3], w = E.hand(p, front), a = F(w[0], w[1]), b = F(w[0] + Math.sin(an) * p.face * 100, w[1] - Math.cos(an) * 100), k = a[2];
  g.save(); g.translate(a[0], a[1]); g.rotate(Math.atan2(b[1] - a[1], b[0] - a[0])); g.scale(k, k * p.face); fn(); g.restore();
}
// where the end of what is in his hand is, out along the arm (the rod's tip, for its line)
function handOut(p, front, L) { const an = front ? p.pose[2] : p.pose[3], w = E.hand(p, front); return [w[0] + Math.sin(an) * p.face * L, w[1] - Math.cos(an) * L]; }

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
const CARD_IDS = ['home', 'hitrun', 'kitchen', 'express', 'road', 'furn', 'ext', 'final', 'bowl', 'shop', 'fish', 'reno', 'coupon', 'extra'];      // (fourteen from 0.28v1)
const deck = { hand: {}, line: [], armed: null, used: {}, ammo: {}, spent: 0 };      // the four on the keys; the rest in line (line[0] is NEXT); a coupon waiting for a move; each key's last wait; a weapon's bullets; cards used this fight (Checkout counts them)
function deal() {
  const all = CARD_IDS.slice();
  for (let i = all.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [all[i], all[j]] = [all[j], all[i]]; }
  SLOTS.forEach((k, i) => { deck.hand[k] = all[i]; });
  deck.line = all.slice(4); deck.armed = null; deck.used = {}; deck.ammo = {}; deck.spent = 0;
}
function cycle(k) { const used = deck.hand[k]; deck.hand[k] = deck.line.shift(); if (used && !WEAPON[used]) deck.line.push(used); }      // to the back with it, and NEXT in its place
// the first moment of a card's move: spent (a variant spends the coupon that made it)
function dealt(k, v) { if (v === 'c' || v === 'x') deck.armed = null; if (!k) return; deck.used[k] = E.CD[k]; cycle(k); deck.spent++; }
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
  play('home-rg-bat', hard ? 1 : .85, () => { sfx.snap(); sfx.hit(true); }, hard ? .85 : 1); shake(hard ? 34 : 20);
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
      play('home-rg-mitt', .95, () => { sfx.ball(1.6); sfx.hit(true); }); shake(14); V.sparks(e.x, e.y, 'white', 10); V.ring(e.x, e.y, 150, '#ffffff', .2); ono('バシッ', e.x, e.y + 200, CPN, 1, .6);
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
function vroom(o, col, word = 'ドンッ') { play('home-rg-crash', .5, () => sfx.blast(), 1.5); sfx.hit(true); shake(22); V.sparks(o.x, mid(o), 'white', 10); ono(word, o.x, o.y + 420 * hs(o), col, 1, .7); }
function scooting(p, m, dt, max = 1900) {          // on it and going: false once there is no more floor ahead of him
  riding = true; m.prop = 'scooter'; p.target = RP.scoot; p.y = RIDE_Y; p.vy = 0; p.ground = true;
  if (!m.rev) { m.rev = 1; play('home-rg-engine', .6, () => sfx.roar(.6), 1.6); }
  m.v = Math.min(max, (m.v || 0) + 7500 * dt);
  const room = Math.abs(p.x + p.face * 100) < bound() - 5;
  p.vx = room ? p.face * m.v : 0;
  if (Z && Math.random() < .5) Z.emit(2, p.x - p.face * 120, 26, -p.face * rnd(60, 160), rnd(10, 60), rnd(18, 30), rnd(.4, .7), '190,190,196', { s1: 2, a: .5, dr: 2 });      // (out of the back of it)
  return room;
}
function hopOff(p, m) {                             // off it; it goes on without him, and is gone
  const f = p.face, v = Math.max(700, (m.v || 0) * .6);
  p.ground = false; p.vy = 560; p.vx = -f * 160; m.prop = null; m.tilt = 0;
  prop({ x: p.x + f * 58, y: 0, face: f, s: SCOOT, life: .8, draw: e => scooter(undefined, e.x * f / 20), upd(e, dt) { e.x += f * v * Math.exp(-e.t * 3) * dt; if (e.t > .62 && !e.f) { e.f = 1; receipt(e.x, 90, 8); e.a = 0; } } });
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
  receipt(clamp(p.x - f * 380, -bound(), bound()), 120, 6, XRGB); play('home-rg-engine', .45, () => {}, 1.7 + i * .1);
  prop({ x: x0, y: 0, face: f, s: SCOOT, life: 1.6, draw: e => scooter(col, e.x * f / 20), upd(e, dt, o) {
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
    play('home-rg-slash', .55, () => (m.n % 2 ? sfx.cut(1.1) : sfx.snip(1.1)), 1 + (m.n % 3) * .12);
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
    if (ok) { down(o, 1.4); play('home-rg-stab', 1, () => sfx.snap(), .7); sfx.hit(true); shake(30); big(p, o, 'ドスッ', CPN, 'neg'); } else shake(10);
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
      if (touch(e.x + f * 40, e.y, 30, 14, o)) { e.gone = 1; hit(o, f, 11, { kb: 50, stun: .45, stop: .03, col: XTR }); V.sparks(e.x, e.y, 'white', 4); play('home-rg-stab', .45, () => sfx.snip(1.3), 1.25); }
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
function unbox(e) { bits(e.x, 120, 16, CRD, 520, 13); receipt(e.x, 150, 6); play('home-rg-box', .75, () => sfx.rough(.6), 1.15); }      // and out of it they come, through the side of it
function stack(o, n, more) {                        // n boxes, one on another, coming down on them
  return drop(o, Object.assign({ n, seed: rnd(0, 100), shadow: 120, hw: 110, from: 1250, draw: e => boxes(e.n, e.seed),
    landed(e) { thud(e.x, false, true); play('home-rg-box', .95, () => sfx.land()); bits(e.x, 40, 6, CRD, 300, 9); },
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
        landed(c) { thud(c.x, true); play('home-rg-smash', .8, () => {}, .8); bits(c.x, 80, 14, '143,93,44', 600, 14); },
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
    drop(o, { from: 1100 + i * 30, wait: 0, track: .16, shadow: 80, hw: 90, gr: 5200, draw: e => box(e.w, e.h, e.w | 0), w: rnd(110, 140), h: rnd(78, 96), keep: .15, rot: rnd(-.2, .2),
      hitThem(e, o) {
        hit(o, side(p.x, o), 13, { kb: 0, stun: 1, stop: .04, col: XTR }); play('home-rg-box', .7, () => sfx.land(), 1 + rnd(0, .3)); sfx.hit(false);
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
  play('home-rg-engine', .85, () => sfx.roar(opt.len > 400 ? 1.3 : .9), opt.len > 400 ? .7 : 1);
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
  play('home-rg-crash', .95, () => { sfx.blast(); sfx.snap(); sfx.rough(.8); }); shake(30); E.zoomIn(.25);
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
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'ROAD RAGE'); const col = pick(CARS); m.car = drive(p, { draw: e => car(col, e.x * e.face / 28), crash: (e, o) => crash(e, o, 40, { kb: 1600, lift: 640, stun: 1, stop: .18, heavy: 1, col: RED, flung: 1 }, PAPER) }); }
  hopOver(p, m, m.car, 520, 1150);
  if ((m.hop && p.ground && t > .45) || t > 1.9) E.endMove(p);
} });
// coupon: a full tank, and what a full tank does after (50, and 80)
const ROAD_C = card('road', 'c', { name: 'Road Rage: Full Tank', cd: 17, dur: 2, run(p, m, t) {
  const o = E.P2;
  if (!m.s) {
    m.s = 1; facing(p, o); buy(p, 'ROAD RAGE: FULL TANK', CPN);
    const col = pick(CARS);
    m.car = drive(p, { draw: e => car(col, e.x * e.face / 28), stay: .6, crash: (e, o) => crash(e, o, 50, { kb: 700, lift: 300, stun: 1.2, stop: .16, heavy: 1, col: CPN }, CPN),
      after(e, u, o) {
        if (u < .34 || e.boomed) return;
        e.boomed = 1; const x = e.x;
        if (Z) { Z.boom(x, 90, 160, '255,140,60', { n: 24 }); Z.flash('255,170,90', .3, .3); }
        play('home-rg-boom', 1, () => { sfx.blast(); sfx.rough(1.2); }); shake(40); E.zoomIn(.35);
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
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'ROAD RAGE: BUS', XTR); m.car = drive(p, { len: 640, speed: 2700, draw: e => bus(e.x * e.face / 33, e.face), crash: (e, o) => { crash(e, o, 140, { kb: 2400, lift: 950, stun: 1.2, stop: .26, heavy: 1, col: XTR, flung: 1 }, XTR, null); big(E.P1, o, 'ドカーン', XTR, 'neg'); } }); }
  hopOver(p, m, m.car, 900, 1500);
  if ((m.hop && p.ground && t > .5) || t > 2.3) E.endMove(p);
} });

/* ================= 6 — FURNITURE FRENZY ================= */
function chairBreak(p, onThem, x, y) {              // over their head, and in pieces
  play('home-rg-wood', .9, () => { sfx.snap(); sfx.rough(.7); }); shake(onThem ? 22 : 10);
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
      e.down = 1; thud(e.x, false, true); play('home-rg-smash', .85, () => sfx.rough(.7)); bits(e.x, 60, 10, WRGB, 380, 12);
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
      landed(e) { thud(e.x, true); play('home-rg-smash', .8, () => {}, .8); }, broke(e) { play('home-rg-wood', .8, () => {}); bits(e.x, 80, 16, '158,27,42', 500, 14); receipt(e.x, 120, 8); } });
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
  if (!m.hiss) { m.hiss = 1; play('home-rg-spray', .8, () => sfx.steam()); }
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
  if (!m.bonk) { m.bonk = 1; sfx.whoosh(); if (reach(p, 220, 20, { kb: 700, lift: 260, stun: .9, stop: .14, heavy: 1, col: RED })) { play('home-rg-hammer', .7, () => { sfx.hit(true); sfx.snap(); }, 1.3); shake(18); ono('ゴンッ', o.x, o.y + 420 * hs(o), PAPER, 1, .7); } }
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
    const h = E.hand(p, true), f = p.face; play('home-rg-spray', .9, () => sfx.steam(), .8); sfx.whoosh();
    prop({ x: h[0] + f * 40, y: h[1], face: f, life: 2, v: 900, draw: () => { g.translate(-60, 0); ext(); }, upd(e, dt, o) {
      e.v = Math.min(2800, e.v + 5200 * dt); e.x += f * e.v * dt; e.y += (live(o) ? mid(o) - e.y : 0) * Math.min(1, dt * 6); e.rot = Math.sin(e.t * 40) * .06;
      if (Z) Z.emit(2, e.x - f * 70, e.y, -f * rnd(300, 600), rnd(-60, 60), rnd(24, 40), rnd(.4, .7), '236,240,244', { s1: 2.6, a: .7, dr: 2.4 });
      const wall = Math.abs(e.x) > bound() + 60;
      if (touch(e.x + f * 60, e.y, 50, 30, o) || wall) {
        e.gone = 1; puffs(e.x, e.y, 14, '240,242,246', 90, 420, 300); bits(e.x, e.y, 12, '216,38,44', 600, 10); play('home-rg-boom', .85, () => sfx.blast(), 1.3); play('home-rg-spray', .6, () => sfx.steam(), 1.2); shake(34);
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
    receipt(x, 200, 10); play('home-rg-engine', .75, () => sfx.roar(.8), .6);
  }
  if (t < .35) { p.vx = 0; p.target = RP.point; return; }
  m.prop = 'hose'; p.vx = 0; p.target = RP.aim2;
  const k = t - .35;
  if (k < JET_T) {
    if (!m.hiss) { m.hiss = 1; play('home-rg-hose', .9, () => { sfx.steam(); sfx.roar(JET_T); }); }
    const h = E.hand(p, true), there = live(o) && (o.x - p.x) * f > -40 && Math.abs(o.x - p.x) < 1500 && Math.abs(o.y - p.y) < 320;
    if (there && holdable(o)) o.x = clamp(o.x + f * 640 * dt, -bound(), bound());      // (the water driving them back, all the way)
    m.jet = { x0: h[0] + f * 64, y: h[1], x1: there ? o.x : p.x + f * 1500 };
    if (Z) for (let i = 0; i < 2; i++) Z.emit(4, m.jet.x1 - f * rnd(0, 60), h[1] + rnd(-30, 30), -f * rnd(100, 400), rnd(100, 500), rnd(3, 6), 1, '170,220,255', { g: 1600 });
    const n = Math.min(JET_N, Math.floor(k / (JET_T / JET_N)) + 1);
    while ((m.n || 0) < n) { m.n = (m.n || 0) + 1; if (there && hit(o, f, 8.5, { kb: 380, stun: .35, stop: .01, col: '#aee0ff' }) && m.n % 4 === 1) { play('home-rg-splash', .55, () => sfx.splat(), 1 + rnd(0, .2)); V.sparks(o.x, mid(o), 'blue', 4); } }      // (and on them every tenth of a second, driving them back)
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
  thud(e.x, true); play('home-rg-collapse', 1, () => {}, hard ? .8 : 1); E.zoomIn(.4);
  if (Z) { Z.boom(e.x, 80, hard ? 240 : 160, '230,210,180', { n: 20, clean: 1 }); Z.dust(e.x, 20); }
  puffs(e.x, 60, hard ? 26 : 14, '200,190,175', 90, hard ? 900 : 500, 200);
}
function houseBreak(e, hard) { bits(e.x, 160, hard ? 36 : 22, '155,59,46', hard ? 900 : 600, 16); bits(e.x, 120, hard ? 30 : 18, '239,227,205', hard ? 900 : 600, 16); bits(e.x, 100, 12, GLASS, 600, 7); receipt(e.x, 200, hard ? 24 : 14); play('home-rg-smash', .7, () => sfx.rough(1.2), .9); }
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
          landed(q) { play('home-rg-box', .6, () => sfx.land(), .9); shake(8); bits(q.x, 40, 4, WRGB, 260, 9); }, broke(q) { bits(q.x, 60, 6, PRGB, 300, 9); receipt(q.x, 80, 3); } }));
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

/* ================= Build 0.28v1's four more: Bowling Strike, Shopping Spree, Fishing Trip, Renovation ================= */
Object.assign(RP, {
  bowlW: [-.1, -.05, .6, -1.3, .45, -.2, 0], bowl: [.55, .15, .4, 1.25, 1.05, -.75, 0],      // the ball back low behind him, and let go along the floor in a lunge
  cart: [.42, .05, 1.55, 1.45, .7, -.6, 0],                                                    // leant into the trolley
  castW: [-.2, -.12, 3.0, 2.9, .38, -.4, 0], cast: [.24, 0, 1.75, 1.6, .55, -.5, 0], reel: [-.08, 0, 2.2, 1.6, .5, -.45, 0],      // the rod back over his head, out, and up reeling in
  hamW: [-.2, -.14, 3.1, 3.05, .36, -.4, 0], ham: [.62, .24, .9, .85, .76, -.58, 0], jack: [.32, .2, .55, .5, .62, -.55, 0]
});

/* ---------- 9 — BOWLING STRIKE ---------- */
function pins(x, f, n = 4) {                        // the pins they were, going everywhere
  for (let i = 0; i < n; i++) prop({ x: x + rnd(-30, 30), y: rnd(0, 40), face: f, vx: f * rnd(200, 700), vy: rnd(500, 1000), vr: rnd(-14, 14), life: 1.3, draw: () => pin(), upd(e, dt) {
    e.vy -= 2400 * dt; e.x += e.vx * dt; e.y = Math.max(0, e.y + e.vy * dt); e.rot += e.vr * dt;
    if (e.y === 0) { e.vy = Math.abs(e.vy) * .3; e.vx *= .6; e.vr *= .5; }
    if (e.t > 1) e.a = Math.max(0, 1 - (e.t - 1) * 4);
  } });
}
function bowled(o, f, dmg, more, col, hard, quiet) {      // it knocks them over, the way it would a pin (quiet: something else says what it was)
  hit(o, f, dmg, Object.assign({ kb: 300, stun: 1.3, stop: .12, heavy: 1, col }, more));
  if (!(more && more.flung)) down(o, 1.3);
  play('home-rg-bowl', hard ? 1 : .8, () => sfx.blast()); shake(hard ? 30 : 18); pins(o.x, f, hard ? 7 : 4);
  if (!quiet) ono(hard ? 'ストライク' : 'ガラガラ', o.x, o.y + 400, col, hard ? 1.2 : 1, .8);
}
function roll(p, opt) {                             // a ball let go along the floor at them
  const f = p.face, r = opt.r || 24;
  sfx.rough(.5);
  return prop(Object.assign({ x: p.x + f * 90, y: r, face: f, life: 2.6, r, v: 1800, draw: e => bowlingBall(e.r, e.x * f / e.r, opt.col), upd(e, dt, o) {
    e.x += f * e.v * dt;
    if (Z && Math.random() < .3) Z.dust(e.x, 1, -f);
    if (!e.hit && touch(e.x + f * e.r * .5, e.r, e.r, e.r, o)) { e.hit = e.t; e.onHit(e, o); e.v *= .4; }
    if (Math.abs(e.x) > 1700 || (e.hit && e.t > e.hit + .6)) { if (!e.f) { e.f = 1; receipt(e.x, e.r, 5); } e.gone = 1; }
  } }, opt));
}
const BOWL = card('bowl', 'o', { name: 'Bowling Strike', cd: 10, dur: 1, run(p, m, t) {
  p.rate = 40;
  if (!m.s) { m.s = 1; facing(p, E.P2); buy(p, 'BOWLING STRIKE'); }
  if (t < .3) { p.vx = 0; p.target = RP.bowlW; m.prop2 = 'bowl'; return; }
  if (!m.go) { m.go = 1; m.prop2 = null; roll(p, { onHit: (e, o) => bowled(o, e.face, 28, null, PAPER) }); }
  p.vx = t < .4 && roomAhead(p) ? p.face * 300 : 0; p.target = t < .7 ? RP.bowl : POSE.idle;
  if (t > .8) E.endMove(p);
} });
function lob(p, o, col) {                           // the second one up, and down on them where they lie
  const f = p.face, x0 = p.x + f * 80, tx = live(o) ? o.x : p.x + f * 500, T = .42;
  sfx.whoosh();
  prop({ x: x0, y: 60, face: f, life: 2, r: 24, draw: e => bowlingBall(e.r, e.t * 12), upd(e, dt, o) {
    const u = Math.min(1, e.t / T);
    e.x = lerp(x0, live(o) ? o.x : tx, u); e.y = 60 + 4 * 320 * u * (1 - u) - 36 * u;
    if (u >= 1 && !e.hit) {
      e.hit = 1;
      if (can(o) && Math.abs(o.x - e.x) < 120 + 40 * hs(o)) { hit(o, f, 100, { kb: 0, stun: 1.4, stop: .2, heavy: 1, col }); down(o, 1.4); play('home-rg-bowl', 1, () => sfx.blast()); shake(32); big(E.P1, o, 'ストライク', col, 'neg'); pins(o.x, f, 7); }
      else thud(e.x, false);
    }
    if (e.hit && e.t > T + .5) { if (!e.f) { e.f = 1; receipt(e.x, 40, 5); } e.gone = 1; }
  } });
}
// coupon: a spare. The first one knocks them over (30), the second comes down on them (100)
const BOWL_C = card('bowl', 'c', { name: 'Bowling Strike: Spare', cd: 13, dur: 1.9, run(p, m, t) {
  p.rate = 40;
  if (!m.s) { m.s = 1; facing(p, E.P2); buy(p, 'BOWLING STRIKE: SPARE', CPN); }
  if (t < .3 || (t >= .62 && t < .82)) { p.vx = 0; p.target = RP.bowlW; m.prop2 = 'bowl'; return; }      // (the second wound up while they are still on the floor)
  m.prop2 = null; p.vx = 0; p.target = RP.bowl;
  if (!m.b1) { m.b1 = 1; roll(p, { onHit: (e, o) => bowled(o, e.face, 30, null, CPN) }); }
  if (t >= .82 && !m.b2) { m.b2 = 1; lob(p, E.P2, CPN); }
  if (t > 1.4) E.endMove(p);
} });
// extra: a turkey, three in a row, and the third the size of a boulder (35, 35, 80)
const BOWL_X = card('bowl', 'x', { name: 'Bowling Strike: Turkey', cd: 15, dur: 2, run(p, m, t) {
  p.rate = 44;
  if (!m.s) { m.s = 1; facing(p, E.P2); buy(p, 'BOWLING STRIKE: TURKEY', XTR); m.n = 0; }
  const due = t < .25 ? 0 : Math.min(3, Math.floor((t - .25) / .38) + 1);
  while (m.n < due) {
    const last = m.n++ === 2;
    roll(p, { r: last ? 70 : 24, v: last ? 1300 : 1900, col: last ? '#c21d24' : '#5a2fb0',
      onHit: (e, o) => { bowled(o, e.face, last ? 80 : 35, last ? { kb: 1300, lift: 760, stun: 1.2, flung: 1 } : null, XTR, last, last); if (last) big(E.P1, o, 'ターキー', XTR, 'neg'); } });
  }
  const ph = (t - .25) % .38;
  p.vx = 0; p.target = t < .25 || (m.n < 3 && ph > .2) ? RP.bowlW : RP.bowl; m.prop2 = m.n < 3 && (t < .25 || ph > .2) ? 'bowl' : null;
  if (t > 1.6) E.endMove(p);
} });

/* ---------- 10 — SHOPPING SPREE ---------- */
const CART_AT = 215;                                // (how far in front of him the trolley's middle is: its handle in his hands)
function trolley(p, m, dt, scoop, col) {            // in at them behind it; it scoops them up and goes on with them in it: false once there is wall ahead
  const o = E.P2, f = p.face, cx = p.x + f * CART_AT;
  m.prop = 'cart'; p.target = RP.cart;
  m.v = Math.min(1700, (m.v || 0) + 6000 * dt);
  const room = Math.abs(cx + f * 100) < bound() + 40;
  p.vx = room ? f * m.v : 0;
  if (Z && Math.random() < .4) Z.dust(cx, 1, -f);
  if (!m.got && touch(cx + f * 60, 90, 80, 90, o)) { m.got = 1; hit(o, f, scoop, { kb: 0, stun: 1.5, stop: .08, heavy: 1, col }); play('home-rg-box', .7, () => sfx.land(), 1.3); label(o.x, o.y + 400, 'IN THE TROLLEY', col, .8); }
  if (m.got && holdable(o)) Object.assign(o, { x: cx + f * 10, y: 70, vx: 0, vy: 0, ground: true, state: 'hurt', stun: .5, act: null, tele: 0 });      // (in it, legs over the side)
  return room;
}
function trolleyEnd(p, m, wall, col, more, after) {  // into the wall, and out of it they come
  const o = E.P2, f = p.face, x = p.x + f * (CART_AT + 100);
  play('home-rg-crash', .85, () => sfx.blast(), 1.25); shake(30); V.sparks(x, 100, 'white', 12); bits(x, 100, 10, '195,202,210', 400, 8); receipt(x, 120, 8);
  m.prop = null;
  if (!(m.got && live(o))) return;
  if (holdable(o)) Object.assign(o, { y: 80, ground: false, state: 'air' });
  hit(o, -f, wall, Object.assign({ kb: 700, lift: 820, stun: 1, stop: .16, heavy: 1, col, flung: 1 }, more));
  ono('ガシャーン', o.x, o.y + 420, col, 1.2, .8);
  if (after) after(o);
}
function spree(p, m, t, scoop, wall, col, more, after) {
  const dt = dtOf(m, t);
  p.rate = 40;
  if (t < .16) { p.vx = 0; p.target = RP.sum; return; }
  if (m.over === undefined) { if (!trolley(p, m, dt, scoop, col) || t > 2.2 || (!m.got && t > 1.3)) { m.over = t; p.vx = 0; trolleyEnd(p, m, wall, col, more, after); } return; }
  p.vx = 0; p.target = POSE.idle;
  if (t > m.over + .35) E.endMove(p);
}
const SHOP = card('shop', 'o', { name: 'Shopping Spree', cd: 11, dur: 2.8, run(p, m, t) {
  if (!m.s) { m.s = 1; facing(p, E.P2); buy(p, 'SHOPPING SPREE'); }
  spree(p, m, t, 10, 22, PAPER);
} });
// coupon: clearance. A trolley that was full: it scoops them (40), it hits the wall (30), and everything in it comes down on them (6 x 10)
function groceryRain(o, col) {
  GROCERIES.forEach((draw, i) => drop(o, { x: o.x + rnd(-50, 50), from: 820 + i * 50, wait: .18 + i * .11, track: .3 + i * .11, shadow: 40, hw: 80, gr: 5000, keep: .2, draw, rot: rnd(-.5, .5),
    hitThem(q, o) { hit(o, side(q.x, o), 10, { kb: 0, stun: .7, stop: .04, heavy: 1, col }); down(o, .7); play('home-rg-box', .5, () => sfx.land(), 1.4); },
    landed() { sfx.land(); }, broke(q) { receipt(q.x, 40, 3); } }));
}
const SHOP_C = card('shop', 'c', { name: 'Shopping Spree: Clearance', cd: 15, dur: 3.2, run(p, m, t) {
  if (!m.s) { m.s = 1; facing(p, E.P2); buy(p, 'SHOPPING SPREE: CLEARANCE', CPN); m.full = 1; }
  spree(p, m, t, 40, 30, CPN, { kb: 0, lift: 0, flung: 0, stun: 1.8 }, o => { down(o, 1.8); groceryRain(o, CPN); });
} });
function runaway(p, i, last) {                      // a trolley nobody is pushing, out of a receipt behind him and through where they are
  const f = p.face;
  receipt(clamp(p.x - f * 380, -bound(), bound()), 120, 4, XRGB);
  prop({ x: clamp(p.x - f * 760, -1500, 1500), y: 0, face: f, life: 1.8, draw: e => cart(i % 2 === 0, e.x * f / 9), upd(e, dt, o) {
    e.x += f * 2300 * dt;
    if (!e.hit && touch(e.x + f * 80, 80, 90, 80, o)) {
      e.hit = 1;
      hit(o, f, 28, last ? { kb: 1200, lift: 700, stun: 1, stop: .14, heavy: 1, col: XTR, flung: 1 } : { kb: 260, stun: 1.4, stop: .08, heavy: 1, col: XTR });
      if (!last) down(o, 1.4);
      play('home-rg-crash', .55, () => sfx.land(), 1.5); V.sparks(o.x, mid(o), 'white', 6);
    }
    if (Math.abs(e.x) > 1700) e.gone = 1;
  } });
}
// extra: black friday. Five of them, one after another, and him up out of their way (28 each)
const SHOP_X = card('shop', 'x', { name: 'Shopping Spree: Black Friday', cd: 15, dur: 2.2, run(p, m, t) {
  p.rate = 40;
  if (!m.s) { m.s = 1; facing(p, E.P2); buy(p, 'SHOPPING SPREE: BLACK FRIDAY', XTR); m.n = 0; }
  const due = t < .12 ? 0 : Math.min(5, Math.floor((t - .12) / .14) + 1);
  while (m.n < due) { runaway(p, m.n, m.n === 4); m.n++; }
  if (!m.hop && t > .18) { m.hop = 1; p.ground = false; p.vy = 1300; p.vx = 0; }
  p.target = !p.ground ? POSE.jump : t < .2 ? RP.point : POSE.idle;
  if ((m.hop && p.ground && t > .5) || t > 2) E.endMove(p);
} });

/* ---------- 11 — FISHING TRIP ---------- */
const LINE_OUT = .3, LINE_R = 820;
function castLine(p, m, t, t0, dmg, col) {          // the line out at them: true once it has them, false once it has gone all the way out for nothing
  const o = E.P2, f = p.face, tip = handOut(p, true, 220), u = Math.min(1, (t - t0) / LINE_OUT);
  m.hook = [tip[0] + f * LINE_R * u, tip[1] + (live(o) ? (mid(o) - tip[1]) * u : -tip[1] * .6 * u)];
  if (touch(m.hook[0], m.hook[1], 28, 28, o)) {
    m.caught = t; m.cx = o.x; m.cy = o.y;
    hit(o, f, dmg, { kb: 0, stun: 1.4, stop: .1, col }); play('home-rg-stab', .6, () => sfx.snip(1.3), 1.3); label(o.x, o.y + 400, 'HOOKED', col, .8);
    return true;
  }
  if (u >= 1) { m.hook = null; m.missed = t; }
  return false;
}
function fishing(p, m, t, dmg, col) {               // cast, and the line out: false while that is still going (or it missed)
  p.rate = 44; m.prop = 'rod';
  if (t < .26) { p.vx = 0; p.target = RP.castW; return false; }
  if (!m.cast) { m.cast = 1; sfx.swish(.9); }
  if (m.caught === undefined) {
    p.vx = 0; p.target = RP.cast;
    if (m.missed !== undefined) { if (t > m.missed + .3) E.endMove(p); return false; }
    castLine(p, m, t, .26, dmg, col);
    return false;
  }
  return true;
}
const FISH = card('fish', 'o', { name: 'Fishing Trip', cd: 11, dur: 2.4, run(p, m, t) {
  const o = E.P2, f = p.face;
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'FISHING TRIP'); }
  if (!fishing(p, m, t, 10, PAPER)) return;
  const k = t - m.caught;
  if (k < .5) {                                     // reeled in
    p.target = RP.reel; if (!m.reel) { m.reel = 1; play('home-rg-reel', .8, () => sfx.rough(.4)); }
    if (holdable(o)) Object.assign(o, { x: lerp(m.cx, p.x + f * 150, ease(k / .5)), vx: 0, state: 'hurt', stun: .6, act: null, tele: 0 });
    m.hook = live(o) ? [o.x, mid(o)] : null;
    return;
  }
  m.hook = null;
  if (!m.up) { m.up = 1; sfx.whoosh(); if (live(o) && Math.abs(o.x - p.x) < 280 && hit(o, f, 18, { kb: 200, lift: 1100, stun: 1, stop: .14, heavy: 1, col: PAPER })) { play('home-rg-bat', .7, () => sfx.hit(true), 1.3); shake(18); ono('ビシッ', o.x, o.y + 400, PAPER, 1, .7); } }
  p.target = k < .8 ? RP.castW : POSE.idle;
  if (k > .9) { gone(p); E.endMove(p); }
} });
// coupon: the big catch. Hooked (40), up out of the water over his head, and down on the boards behind him (90)
const FISH_C = card('fish', 'c', { name: 'Fishing Trip: Big Catch', cd: 15, dur: 2.8, run(p, m, t) {
  const o = E.P2, f = p.face;
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'FISHING TRIP: BIG CATCH', CPN); }
  if (!fishing(p, m, t, 40, CPN)) return;
  const k = t - m.caught;
  if (k < .55) {
    p.target = RP.reel; if (!m.reel) { m.reel = 1; play('home-rg-reel', .9, () => sfx.rough(.4)); }
    const u = ease(k / .55), bx = clamp(p.x - f * 170, -bound(), bound());
    if (holdable(o)) Object.assign(o, { x: lerp(m.cx, bx, u), y: Math.max(0, lerp(m.cy, 0, u) + 4 * 380 * u * (1 - u)), vx: 0, vy: 0, ground: false, state: 'air', stun: .6, act: null, tele: 0 });
    m.hook = live(o) ? [o.x, mid(o)] : null;
    return;
  }
  m.hook = null;
  if (!m.slam) {
    m.slam = 1; thud(o.x, true);
    if (live(o)) { if (holdable(o)) Object.assign(o, { y: 0, ground: true }); hit(o, -f, 90, { kb: 0, stun: 1.6, stop: .22, heavy: 1, col: CPN }); down(o, 1.6); big(p, o, 'ドッシーン', CPN, 'neg'); }
  }
  p.target = k < .9 ? RP.castW : POSE.idle;
  if (k > 1) { gone(p); E.endMove(p); }
} });
// extra: a swordfish, out of the receipt by the tail, and swung (40, 40, and the bill through them: 70)
const SWINGS = [[0, 'ham', 40], [.32, 'batUp', 40], [.64, 'batSw', 70]];
const FISH_X = card('fish', 'x', { name: 'Fishing Trip: Swordfish', cd: 15, dur: 2.2, run(p, m, t) {
  const o = E.P2;
  p.rate = 40; m.prop = 'swordfish';
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'FISHING TRIP: SWORDFISH', XTR); }
  if (t < .25) { p.vx = 0; p.target = RP.hamW; return; }
  if (m.at === undefined) { p.target = RP.hamW; if (runIn(p, o, t, .7, 260, 2000)) return; m.at = t; p.vx = 0; }
  const u = t - m.at;
  SWINGS.forEach(([at, pose, dmg], i) => {
    if (u < at || m['h' + i]) return;
    m['h' + i] = 1; p.target = RP[pose]; sfx.whoosh();
    const last = i === 2;
    if (live(o) && Math.abs(o.x - p.x) < 420 && (o.x - p.x) * p.face > -60 && hit(o, p.face, dmg, last ? { kb: 1500, lift: 700, stun: 1.2, stop: .2, heavy: 1, col: XTR, flung: 1 } : { kb: 160, stun: 1, stop: .12, heavy: 1, col: XTR })) {
      play('home-rg-smash', .7, () => sfx.hit(true), 1.2); shake(last ? 30 : 18); ono(last ? 'グサッ' : 'ベチッ', o.x, o.y + 420, XTR, last ? 1.2 : 1, .7);
      if (last) big(p, o, 'カジキ', XTR, 'neg');
    }
  });
  if (u > .9) { p.target = POSE.idle; if (u > 1.05) { gone(p); E.endMove(p); } }
} });

/* ---------- 12 — RENOVATION ---------- */
function hammerDown(p, o, dmg, col, hard) {         // the sledgehammer down through them and into the floor
  const x = p.x + p.face * 190, ok = can(o) && Math.abs(o.x - x) < 170 + 40 * hs(o) && Math.abs(o.y - p.y) < 220;
  play('home-rg-hammer', .9, () => sfx.hit(true), .75); thud(x, hard, true); sfx.blast();
  if (Z) Z.shock(x, 400, '235,225,205', .35, 10);
  if (ok) { hit(o, p.face, dmg, { kb: 120, stun: 1.4, stop: .2, heavy: 1, col }); down(o, 1.4); ono('ドゴッ', o.x, o.y + 400, col, 1.1, .7); }
  return ok;
}
function sledging(p, m, t, dmg, col, after) {       // up over his head, in at them, and down: true once it is over
  const o = E.P2;
  p.rate = 40; m.prop = 'sledge';
  if (t < .32) { p.vx = 0; p.target = RP.hamW; return false; }
  if (m.at === undefined) { p.target = RP.hamW; if (runIn(p, o, t, .7, 200, 1900)) return false; m.at = t; p.vx = 0; }
  const u = t - m.at;
  if (u < .08) { p.target = RP.hamW; return false; }
  if (!m.down) { m.down = 1; sfx.whoosh(); hammerDown(p, o, dmg, col, !!after); if (after) after(); }
  p.vx = 0; p.target = u < .5 ? RP.ham : POSE.idle;
  return u > .6;
}
const RENO = card('reno', 'o', { name: 'Renovation', cd: 10, dur: 1.6, run(p, m, t) {
  if (!m.s) { m.s = 1; facing(p, E.P2); buy(p, 'RENOVATION'); }
  if (sledging(p, m, t, 32, PAPER)) { gone(p); E.endMove(p); }
} });
function wreck(o, col) {                            // a wrecking ball on its chain, swung in from up out of sight
  const p = E.P1, f = p.face, px = live(o) ? o.x : p.x + f * 300, PIV = 1400, L = 1320;
  sfx.rise(.4);
  prop({ x: px - f * 900, y: 700, face: f, life: 2, draw: () => wreckingBall(), upd(e, dt, o) {
    const u = Math.min(1, e.t / .5), a = lerp(-1.1, .4, u);
    e.x = px + f * Math.sin(a) * L; e.y = PIV - Math.cos(a) * L; e.rot = -a;
    if (!e.hit && touch(e.x, e.y, 58, 58, o)) {
      e.hit = 1; hit(o, f, 90, { kb: 1600, lift: 700, stun: 1.2, stop: .26, heavy: 1, col, flung: 1 });
      play('home-rg-crash', 1, () => sfx.blast(), .7); play('home-rg-collapse', .5, () => {}); shake(40); E.zoomIn(.35); big(E.P1, o, 'ドガーン', col, 'neg'); bits(e.x, e.y, 14, '160,160,168', 600, 12);
    }
    if (e.t > .9) { if (!e.f) { e.f = 1; receipt(e.x, e.y, 8); } e.gone = 1; }
  } });
}
// coupon: demolition. The hammer (40), and then the wrecking ball (90)
const RENO_C = card('reno', 'c', { name: 'Renovation: Demolition', cd: 15, dur: 2, run(p, m, t) {
  if (!m.s) { m.s = 1; facing(p, E.P2); buy(p, 'RENOVATION: DEMOLITION', CPN); }
  if (sledging(p, m, t, 40, CPN, () => later(.15, () => wreck(E.P2, CPN)))) { gone(p); E.endMove(p); }
} });
// extra: the jackhammer, on them and through them, fourteen times (10 each), and the last one throws them off it
const RENO_X = card('reno', 'x', { name: 'Renovation: Jackhammer', cd: 15, dur: 2.6, run(p, m, t) {
  const o = E.P2;
  p.rate = 50; m.prop = 'jack';
  if (!m.s) { m.s = 1; facing(p, o); buy(p, 'RENOVATION: JACKHAMMER', XTR); }
  if (t < .2) { p.vx = 0; p.target = RP.jack; return; }
  if (m.at === undefined) { p.target = RP.jack; if (runIn(p, o, t, .7, 150, 2000)) return; m.at = t; p.vx = 0; play('home-rg-jack', .9, () => sfx.rough(1)); }
  const u = t - m.at, n = Math.min(14, Math.floor(u / .09) + 1);
  p.vx = 0; p.target = RP.jack;
  if (u < 1.3) { riding = true; p.ground = true; p.y = Math.abs(Math.sin(u * 60)) * 5; } else p.y = 0;      // (shaken by it)
  while ((m.n || 0) < n) {
    m.n = (m.n || 0) + 1;
    const last = m.n === 14, x = p.x + p.face * 140;
    V.rocks(x, 0, 2); if (Z) Z.dust(x, 1);
    if (can(o) && Math.abs(o.x - x) < 130 + 40 * hs(o) && hit(o, p.face, 10, last ? { kb: 900, lift: 900, stun: 1, stop: .16, heavy: 1, col: XTR, flung: 1 } : { kb: 0, stun: .5, stop: .02, col: XTR })) {
      if (!last) down(o, .6);
      shake(last ? 26 : 6); if (last) big(p, o, 'ガガガガ', XTR, 'neg');
    }
  }
  if (u > 1.5) { p.y = 0; gone(p); E.endMove(p); }
} });


function hookDraw(p, hk) {                          // the line from the end of the rod to the hook, sagging, and the float on it
  const tip = handOut(p, true, 220), a = F(tip[0], tip[1]), b = F(hk[0], hk[1]), k = a[2], mx = (a[0] + b[0]) / 2, my = Math.max(a[1], b[1]) + 40 * k;
  g.strokeStyle = 'rgba(245,245,245,.9)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(mx, my, b[0], b[1]); g.stroke();
  const bx = lerp(lerp(a[0], mx, .85), lerp(mx, b[0], .85), .85), by = lerp(lerp(a[1], my, .85), lerp(my, b[1], .85), .85);
  g.save(); g.translate(bx, by); g.scale(k, k);
  g.beginPath(); g.arc(0, 0, 7, 0, Math.PI); g.fillStyle = '#ffffff'; g.fill(); g.beginPath(); g.arc(0, 0, 7, Math.PI, TAU); g.fillStyle = '#e2383c'; g.fill();
  g.beginPath(); g.arc(0, 0, 7, 0, TAU); g.lineWidth = 2; g.strokeStyle = LINE; g.stroke(); g.restore();
  g.strokeStyle = '#cfd6de'; g.lineWidth = 2.6 * k; g.beginPath(); g.arc(b[0], b[1] + 7 * k, 7 * k, -Math.PI / 2, Math.PI * .9); g.stroke();
}

/* ================= COUPON, EXTRA COUPON, and the prize ================= */
function refuse(p, m, why) { label(p.x, p.y + 440, why, PAPER, 1.1); sfx.back(); if (m.key) E.cd[m.key] = 0; E.endMove(p); }
const busy = () => (deck.armed === 'prize' ? 'THE PRIZE IS WAITING · USE A MOVE' : 'A COUPON IS ALREADY WAITING · USE A MOVE');
function stamp(p, col, rgb, what) { const h = E.hand(p, true); receipt(h[0], h[1], 8, rgb); play('home-rg-tear', .8, () => sfx.rip()); play('home-rg-stamp', .9, () => sfx.snip(.8)); label(p.x, p.y + 500, what, col, 1.1); label(p.x, p.y + 440, 'USE A MOVE', col, 1.4); }
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
      const h = E.hand(p, true); receipt(h[0], h[1], 16, GRGB); play('home-rg-tear', .8, () => sfx.rip()); play('home-rg-stamp', 1, () => {}, .8); sfx.charge();
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
    const h = E.hand(p, true); receipt(h[0], h[1], 18, GRGB); play('home-rg-tear', .9, () => sfx.rip()); sfx.charge();
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
  if (rifle) play('home-rg-sniper', 1, () => sfx.cannon(1)); else play('home-rg-pistol', .9, () => { sfx.snap(); sfx.blast(); });
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
  if (!m.s) { m.s = 1; facing(p, E.P2); play('home-rg-bolt', .9, () => sfx.click()); }
  if (t >= AIM_T && !m.shot) { m.shot = 1; shoot(p, E.P2, 150, true); }
  if (t > AIM_T + .4) E.endMove(p);
} });
const KATANA = arm('katana', { name: 'Katana Slash', cd: 1.2, dur: .6, run(p, m, t) {
  p.rate = 46; m.prop = 'katana';
  p.vx = t > .1 && t < .2 && roomAhead(p) ? p.face * 520 : 0; p.target = t < .12 ? POSE.hookWind : t < .36 ? POSE.hook : POSE.idle;
  if (t < .12 || m.cut) { if (t > .5) E.endMove(p); return; }
  m.cut = 1; play('home-rg-slash', .8, () => sfx.whoosh(), .85); V.slash(p.x + p.face * 150, p.y + 170, p.face > 0 ? -.35 : Math.PI + .35, 460, STEEL, 16);
  if (reach(p, 280, 70, { kb: 640, lift: 320, stun: .8, stop: .14, heavy: 1, col: STEEL })) { sfx.hit(true); shake(18); }
} });
const LASSO_OUT = .32, LASSO_R = 760;
const CHAIN = arm('chain', { name: 'Lasso', cd: 2, dur: 1.8, run(p, m, t) {
  const o = E.P2, f = p.face;
  p.rate = 44; m.prop = 'chain'; p.vx = 0;
  if (!m.s) { m.s = 1; facing(p, o); }
  if (t < .3) { p.target = RP.sum; if (!m.whirl) { m.whirl = 1; play('home-coatm-swing', .8, () => sfx.swish(.8)); } return; }      // round over his head
  const h = E.hand(p, true);
  if (!m.caught) {
    const u = Math.min(1, (t - .3) / LASSO_OUT), x = h[0] + f * LASSO_R * u, y = h[1] + (live(o) ? (mid(o) - h[1]) * u : 0);
    m.end = [x, y]; p.target = RP.aim;
    if (touch(x, y, 30, 30, o)) { m.caught = t; m.cx = o.x; hit(o, f, 60, { kb: 0, stun: 1.2, stop: .12, heavy: 1, col: '#9aa3b5' }); play('home-coatm-hit', .8, () => sfx.snap()); }
    else if (u >= 1) { m.end = null; if (t > .3 + LASSO_OUT + .2) E.endMove(p); }
    return;
  }
  const k = t - m.caught, u = Math.min(1, k / .34), tx = p.x + f * 130;
  if (live(o) && holdable(o)) Object.assign(o, { x: lerp(m.cx, tx, u * u), vx: 0, state: 'hurt', stun: .5, act: null, tele: 0 });
  m.end = live(o) ? [o.x, mid(o)] : null; p.target = RP.chairDn;
  if (u >= 1 && !m.done) { m.done = 1; m.end = null; if (live(o)) { hit(o, f, 40, { kb: 600, lift: 400, stun: .9, stop: .16, heavy: 1, col: '#9aa3b5' }); play('home-coatm-whip', .7, () => sfx.hit(true)); shake(20); } }
  if (k > .6) E.endMove(p);
} });
const CLOUD = arm('cloud', { name: 'Cloud Barrage', cd: 1.2, dur: .9, run(p, m, t) {
  const o = E.P2;
  p.rate = 50; m.prop = 'cloud';
  if (!m.s) { m.s = 1; facing(p, o); }
  const n = Math.min(6, Math.floor(t / .1) + 1);
  p.vx = gap(p, o) > 170 && roomAhead(p) ? p.face * 300 : 0;
  while ((m.n || 0) < n) { m.n = (m.n || 0) + 1; p.target = m.n % 2 ? POSE.hook : POSE.crush; sfx.swish(1.1); if (reach(p, 275, 7, m.n === 6 ? { kb: 520, lift: 320, stun: .7, stop: .08, heavy: 1, col: '#ff5a6e' } : { kb: 40, stun: .3, stop: .02, col: '#ff5a6e' })) { V.sparks(o.x - p.face * 20, mid(o), 'red', 3); play('home-rg-bat', .4, () => {}, 1.5); } }
  if (t > .75) E.endMove(p);
} });
const SPEAR = arm('spear', { name: 'Inversion Stab', cd: .5, dur: .75, run(p, m, t) {
  p.rate = 46; m.prop = 'spear';
  if (t < .2) { p.target = POSE.divWind; p.vx = 0; return; }
  p.target = t < .45 ? POSE.jab : POSE.idle; p.vx = t < .32 && roomAhead(p) ? p.face * 1300 : 0;
  if (!m.done && t <= .34 && reach(p, 250, 450, { kb: 900, lift: 420, stun: 1, stop: .3, heavy: 1, col: GOLD })) { m.done = 1; shake(34); play('home-isoh-4', 1, () => sfx.bf()); V.impact(.2, E.P2.x, E.P2.y + 150); }
  if (t > .65) E.endMove(p);
} });
const ARMS = { pistol: PISTOL, sniper: SNIPER, katana: KATANA, chain: CHAIN, cloud: CLOUD, spear: SPEAR };

/* ================= what is on each key ================= */
const CARDS = {
  home: [HOME, HOME_C, HOME_X], hitrun: [HIT_RUN, HIT_RUN_C, HIT_RUN_X], kitchen: [KITCHEN, KITCHEN_C, KITCHEN_X], express: [EXPRESS, EXPRESS_C, EXPRESS_X],
  road: [ROAD, ROAD_C, ROAD_X], furn: [FURN, FURN_C, FURN_X], ext: [EXT, EXT_C, EXT_X], final: [FINAL, FINAL_C, FINAL_X],
  bowl: [BOWL, BOWL_C, BOWL_X], shop: [SHOP, SHOP_C, SHOP_X], fish: [FISH, FISH_C, FISH_X], reno: [RENO, RENO_C, RENO_X] };
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

/* ================= Build 0.29v2: COMBOS. Two cards pressed together, and both spent on one bigger purchase ================= */
// The user: "Add more combos for registration too" (after the Lightning Beast's). 1+2 BULK ORDER, 2+3 REFUND (a counter), 3+4 TRAFFIC JAM,
// 1+4 CHECKOUT. A Coupon or an Extra Coupon waiting makes it that one's version, as it does any move: twelve in all. Both keys have to hold
// one of the twelve moves (not a coupon, nor what a prize bought) and both be ready. Both cards are spent: to the back with them, and NEXT
// and the one after it take the keys, which both wait the combo's time. Under the health bar each shows ??? until it has been found
function container() {                              // a shipping container: corrugated steel, doors at one end with their bars, the company's name
  const W = 300, Hh = 260;
  R(-W, -Hh, W * 2, Hh, lgr(0, -Hh, 0, 0, '#c94a32', '#a8392a', '#7a2a1f'), 3.5);
  for (let x = -W + 16; x < W - 76; x += 18) thin(x, -Hh + 14, x, -14, 'rgba(0,0,0,.25)', 4);
  R(W - 70, -Hh + 8, 62, Hh - 16, '#a8392a', 2.5); for (const x of [W - 56, W - 38, W - 20]) thin(x, -Hh + 16, x, -16, '#3a3d46', 3.5);
  R(-W, -Hh, W * 2, 14, '#8a3022', 2.5); R(-W, -14, W * 2, 14, '#8a3022', 2.5);
  word('RECEIPT CO.', -40, -Hh / 2, 54, 'rgba(255,240,220,.85)');
}
function till(open = 0) {                           // a cash register: the drawer (open as far as `open`), the keys, the display up on its stalk
  R(-70, -40, 140, 40, lgr(0, -40, 0, 0, '#3a3d46', '#22242a'), 3);
  if (open > 0) { R(-60, -26 + 0, 120 * open, 22, '#1d1f24', 2.5); for (let i = 0; i < 4; i++) R(-54 + i * 26 * open, -22, 20 * open, 14, i % 2 ? '#7dbf6a' : '#c9b26a', 1); }
  Q(lgr(0, -100, 0, -40, '#e4e0d4', '#b9b4a6'), [-64, -40, 64, -40, 46, -100, -56, -100], 3);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) R(-48 + c * 18 + r * 3, -88 + r * 15, 12, 10, '#6a6e78', 1.5);
  R(-6, -150, 12, 50, '#2a2c33', 2.5); R(-40, -186, 80, 40, '#16171b', 3);
  word('¥¥¥', 0, -166, 24, '#ff5a3c');
}
HELD.receipt = () => ticket(PAPER);
const MOVE_CARD = id => !!CARDS[id];
const RC = [PAPER, CPN, XTR];                       // the plain one's colour, the coupon's, the extra's
// 1+2 BULK ORDER: everything on one receipt, all of it brought down on them, one thing after another (v.last: and something big to finish)
const BULK_STUFF = [() => boxes(3, 1), fridge, () => sofa('#2f5d8a'), telly, () => crate(), () => chair(), () => table(), lamp, () => boxes(2, 4), () => sofa('#9e1b2a')];
function bulkOf(v) {
  return { name: v.name, reg: 1, combo: 1, cd: v.cd, dur: 1, run(p, m, t) {
    const o = E.P2;
    if (!m.s) {
      m.s = 1; facing(p, o); buy(p, v.label, v.col); sfx.rise(.6);
      for (let i = 0; i < v.n + (v.last ? 1 : 0); i++) {
        const big = !!v.last && i === v.n, at = .22 + i * v.gap;
        drop(o, { from: big ? 1500 : 1000 + (i % 3) * 60, wait: at, track: at - .05, shadow: big ? 320 : 100, hw: big ? 300 : 105, keep: big ? .6 : .25, gr: big ? 3000 : 5000, rot: big ? 0 : rnd(-.3, .3),
          draw: big ? v.big : BULK_STUFF[i % BULK_STUFF.length],
          hitThem(q, o) { hit(o, side(q.x, o), big ? v.last : v.each, { kb: 0, stun: big ? 1.8 : 1, stop: big ? .22 : .05, heavy: 1, col: v.col }); down(o, big ? 1.8 : 1); if (big) crushed(o, v.col, 'ドドォン'); else sfx.hit(true); },
          landed(q) { if (big) { thud(q.x, true); E.zoomIn(.35); bits(q.x, 60, 16, '160,60,40', 700, 14); } else { play('home-rg-box', .6, () => sfx.land(), .8 + rnd(0, .3)); shake(8); bits(q.x, 40, 4, WRGB, 260, 9); } },
          broke(q) { bits(q.x, 60, 6, PRGB, 300, 9); receipt(q.x, 80, big ? 14 : 3); } });
      }
    }
    p.vx = 0; p.target = t < .7 ? RP.sum : POSE.idle;
    if (t > .9) E.endMove(p);
  } };
}
const BULK = bulkOf({ name: 'Bulk Order', label: 'BULK ORDER', col: PAPER, cd: 14, n: 6, each: 12, gap: .14 });
const BULK_C = bulkOf({ name: 'Bulk Order: Wholesale', label: 'BULK ORDER: WHOLESALE', col: CPN, cd: 18, n: 10, each: 12, gap: .11, last: 60, big: () => crate() });
const BULK_X = bulkOf({ name: 'Bulk Order: Warehouse', label: 'BULK ORDER: WAREHOUSE', col: XTR, cd: 22, n: 10, each: 12, gap: .1, last: 120, big: container });
// 2+3 REFUND, a counter: a receipt held up. Hit him while it is, and the blow is taken back: none of it reaches him, and what it was worth
// goes back into them, and more (coupon: and some of his health back; extra: and every key ready again)
function refundOf(v) {
  const counter = { name: v.name, reg: 1, combo: 1, dur: 1.1, run(p, m, t) {
    const o = m.o || E.P2;
    p.vx = 0; p.rate = 44; m.prop = v.held;
    if (!m.s) { m.s = 1; p.inv = Math.max(p.inv || 0, 1); facing(p, o); E.stop(.06); play('home-rg-stamp', 1, () => sfx.snip(.8)); label(p.x, p.y + 520, v.word, v.col, 1.3); }
    if (t < .2) { p.target = RP.ticket; return; }
    p.target = t < .55 ? RP.point : POSE.idle; m.prop = null;
    if (!m.go) {
      m.go = 1;
      const h = E.hand(p, true);
      play('home-rg-tear', 1, () => sfx.rip()); shake(26);
      if (Z) for (let i = 0; i < 30; i++) Z.emit(3, h[0], h[1], p.face * rnd(500, 1500), rnd(-200, 500), rnd(7, 12), rnd(.5, .9), i % 3 ? PRGB : v.rgb, Object.assign({ vr: rnd(-14, 14), rot: rnd(0, TAU) }, SLIP));      // the receipts, back at them
      if (live(o)) { hit(o, p.face, v.dmg, { kb: 1300, lift: 620, stun: 1, stop: .2, heavy: 1, col: v.col, flung: 1 }); big(p, o, '返金', v.col, 'neg'); receipt(o.x, mid(o), 16, v.rgb); }
      if (v.heal) { p.hp = Math.min(p.max, p.hp + v.heal); E.addNum(p.x, p.y + 300, '+' + v.heal, v.col); }
      if (v.reset) { for (const k of SLOTS) E.cd[k] = 0; label(p.x, p.y + 580, 'EVERY KEY READY', v.col, 1.2); }
    }
    if (t > .9) E.endMove(p);
  } };
  return { name: v.name, reg: 1, combo: 1, refund: 1, T: 1.2, counter, cd: v.cd, dur: 1.3, run(p, m, t) {
    p.vx = 0; p.rate = 30; p.target = RP.ticket; m.prop = v.held;
    if (!m.s) { m.s = 1; facing(p, E.P2); label(p.x, p.y + 480, v.label, v.col, 1.1); play('home-rg-rip', .6, () => sfx.rip()); }
    if (Z && Math.random() < .25) { const h = E.hand(p, true); Z.emit(0, h[0], h[1], 0, 40, 60, .3, v.rgb, { s1: .4 }); }
    if (t > 1.2) { label(p.x, p.y + 440, 'NOTHING TO REFUND', PAPER, .9); E.endMove(p); }
  } };
}
const REFUND = refundOf({ name: 'Refund', label: 'REFUND', word: 'REFUNDED', col: PAPER, rgb: PRGB, held: 'receipt', cd: 14, dmg: 60 });
const REFUND_C = refundOf({ name: 'Refund: Store Credit', label: 'REFUND: STORE CREDIT', word: 'STORE CREDIT', col: CPN, rgb: CRGB, held: 'ticketC', cd: 18, dmg: 150, heal: 30 });
const REFUND_X = refundOf({ name: 'Refund: Money Back', label: 'REFUND: MONEY BACK', word: 'MONEY BACK', col: XTR, rgb: XRGB, held: 'ticketX', cd: 22, dmg: 200, reset: 1 });
function guard(face, a) {                           // hit while a refund is held up: it never lands, and the refund goes instead
  const p = E.P1, m = p.move, o = E.P2;
  if (!on() || !(m && m.def.refund && m.t <= m.def.T) || p.dead || !live(o)) return false;
  p.move = { def: m.def.counter, t: 0, o, combo: m.combo };
  return true;
}
// 3+4 TRAFFIC JAM: one after another from behind him, into them and into each other (v.pile: and the whole pile goes up)
const VEH = {
  scooter: { len: 260, speed: 3200, draw: e => scooter(undefined, e.x * e.face / 20) },
  car: { len: 300, speed: 3000, draw: e => car(pick(CARS), e.x * e.face / 28) },
  bus: { len: 640, speed: 2700, draw: e => bus(e.x * e.face / 33, e.face) },
  engine: { len: 600, speed: 2800, draw: e => engine() } };
function jamOf(v) {
  return { name: v.name, reg: 1, combo: 1, cd: v.cd, dur: .6 + v.cars.length * v.gap + 1.3, run(p, m, t) {
    const o = E.P2;
    if (!m.s) { m.s = 1; facing(p, o); buy(p, v.label, v.col); m.n = 0; m.cars = []; }
    const due = Math.min(v.cars.length, Math.floor(t / v.gap) + 1);
    while (m.n < due) {
      const [kind, dmg] = v.cars[m.n], q = VEH[kind], last = m.n === v.cars.length - 1, col = pick(CARS);
      m.n++;
      m.cars.push(drive(p, { len: q.len, speed: q.speed, stay: v.pile ? 1.6 - m.n * .2 : .7, draw: kind === 'car' ? e => car(col, e.x * e.face / 28) : q.draw,
        crash: (e, o) => crash(e, o, dmg, last && !v.pile ? { kb: 1600, lift: 700, stun: 1, stop: .18, heavy: 1, col: v.col, flung: 1 } : { kb: 120, stun: 1.2, stop: .1, heavy: 1, col: v.col }, v.col, last ? 'ドガァン' : 'ドンッ') }));
    }
    hopOver(p, m, m.cars[0], 700, 1450);
    if (v.pile && m.n === v.cars.length && !m.boom) {      // all of them in, against each other and against them: and up it goes
      const tail = m.cars[m.cars.length - 1];
      if (tail.crashed !== undefined && tail.t - tail.crashed > .3) {
        m.boom = 1; const x = tail.x + tail.face * tail.len * .4;
        if (Z) { Z.boom(x, 120, 260, '255,140,60', { n: 34, life: .8 }); Z.flash('255,170,90', .4, .3); Z.pillar(x, 160, 1000, '255,140,60', .6); }
        play('home-rg-boom', 1, () => { sfx.blast(); sfx.rough(1.2); }); shake(46); E.zoomIn(.45);
        bits(x, 120, 24, '40,40,44', 900, 16); bits(x, 100, 14, GLASS, 700, 7); receipt(x, 200, 20);
        if (can(o) && Math.abs(o.x - x) < 420 + 40 * hs(o)) { hit(o, side(x, o), v.pile, { kb: 1200, lift: 900, stun: 1.2, stop: .26, heavy: 1, col: '#ffa040', flung: 1 }); big(p, o, 'ドカーン', v.col, 'neg'); }
        for (const c of m.cars) c.a = 0;
      }
    }
    if (t > .6 + v.cars.length * v.gap + (v.pile ? 1.1 : .5) && p.ground) E.endMove(p);
  } };
}
const JAM = jamOf({ name: 'Traffic Jam', label: 'TRAFFIC JAM', col: PAPER, cd: 15, gap: .32, cars: [['car', 35], ['bus', 40]] });
const JAM_C = jamOf({ name: 'Traffic Jam: Rush Hour', label: 'TRAFFIC JAM: RUSH HOUR', col: CPN, cd: 19, gap: .28, cars: [['scooter', 20], ['car', 40], ['bus', 50], ['engine', 70]] });
const JAM_X = jamOf({ name: 'Traffic Jam: Pile-Up', label: 'TRAFFIC JAM: PILE-UP', col: XTR, cd: 23, gap: .24, cars: [['car', 30], ['car', 30], ['bus', 30], ['engine', 30]], pile: 120 });
// 1+4 CHECKOUT: the till rings up everything he has bought this fight, the receipt runs out round them, and the total is what it does to them
function checkoutOf(v) {
  return { name: v.name, reg: 1, combo: 1, cd: v.cd, dur: 2, run(p, m, t) {
    const o = E.P2, f = p.face, tx = p.x + f * 120;
    p.vx = 0; p.rate = 36;
    if (!m.s) {
      m.s = 1; facing(p, o); buy(p, v.label, v.col);
      m.total = Math.min(v.cap, v.base + v.per * deck.spent);
      m.till = prop({ x: tx, y: 0, face: f, life: 1.9, draw: e => till(clamp((e.t - 1.1) * 5, 0, 1)) });
    }
    p.target = t < 1.2 ? RP.point : t < 1.5 ? RP.elbow : POSE.idle;
    const n = Math.min(6, Math.floor(t / .14));      // rung up, item by item
    if (n > (m.n || 0)) { m.n = n; sfx.click(); }
    if (t > .5 && !m.wrap && live(o)) {             // the receipt out of it and round them
      m.wrap = 1; hold(o, 1.2); play('home-rg-tear', .8, () => sfx.rip());
      V.custom(.9, u => {
        if (!live(o)) return;
        for (let i = 0; i < 5; i++) {
          const a = E.T * 9 + i * 1.26, c = F(o.x + Math.cos(a) * 70 * hs(o), o.y + (60 + i * 40 + 30 * Math.sin(a)) * hs(o)), k = c[2];
          g.fillStyle = 'rgba(244,240,228,.95)'; g.strokeStyle = 'rgba(40,30,24,.6)'; g.lineWidth = 1.5;
          g.save(); g.translate(c[0], c[1]); g.rotate(Math.sin(a) * .6); g.fillRect(-26 * k, -7 * k, 52 * k, 14 * k); g.strokeRect(-26 * k, -7 * k, 52 * k, 14 * k); g.restore();
        }
        const a = F(tx, 120), b = F(o.x, mid(o));
        g.strokeStyle = 'rgba(244,240,228,.9)'; g.lineWidth = 10 * a[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, a[1] - 80 * a[2], b[0], b[1]); g.stroke();
      });
    }
    if (t > 1.15 && !m.go) {                        // the total
      m.go = 1; play('home-rg-stamp', 1, () => sfx.snip(.8)); sfx.ball(.9); shake(30); E.zoomIn(.3);
      if (live(o)) {
        label(o.x, o.y + 520 * hs(o), 'TOTAL · ¥' + (m.total * 1000).toLocaleString('en-US'), v.col, 1.6);
        hit(o, f, m.total, { kb: 1200, lift: 620, stun: 1, stop: .24, heavy: 1, col: v.col, flung: 1 }); big(p, o, 'お会計', v.col, 'neg'); receipt(o.x, mid(o), 24, v.rgb);
      }
    }
    if (t > 1.8) E.endMove(p);
  } };
}
const CHECKOUT = checkoutOf({ name: 'Checkout', label: 'CHECKOUT', col: PAPER, rgb: PRGB, cd: 15, base: 30, per: 4, cap: 110 });
const CHECKOUT_C = checkoutOf({ name: 'Checkout: Points Card', label: 'CHECKOUT: POINTS CARD', col: CPN, rgb: CRGB, cd: 19, base: 60, per: 8, cap: 200 });
const CHECKOUT_X = checkoutOf({ name: 'Checkout: Grand Total', label: 'CHECKOUT: GRAND TOTAL', col: XTR, rgb: XRGB, cd: 23, base: 90, per: 12, cap: 300 });
const RCOMBOS = { 12: [BULK, BULK_C, BULK_X], 23: [REFUND, REFUND_C, REFUND_X], 34: [JAM, JAM_C, JAM_X], 14: [CHECKOUT, CHECKOUT_C, CHECKOUT_X] };
const RPAIRS = ['12', '23', '34', '14'], RSHORT = { 12: 'Bulk Order', 23: 'Refund', 34: 'Traffic Jam', 14: 'Checkout' }, CHORD_T = .09;
const keyOf = n => SLOTS[n - 1];
const comboReady = pair => { const k1 = keyOf(+pair[0]), k2 = keyOf(+pair[1]); return MOVE_CARD(deck.hand[k1]) && MOVE_CARD(deck.hand[k2]) && !(E.cd[k1] > 0) && !(E.cd[k2] > 0) && deck.armed !== 'prize'; };
let foundR = new Set();
try { foundR = new Set(JSON.parse(localStorage.getItem('ju.rgcombo') || '[]')); } catch (e) {}
function foundOne(name) {
  if (foundR.has(name)) return;
  foundR.add(name);
  try { localStorage.setItem('ju.rgcombo', JSON.stringify([...foundR])); } catch (e) {}
  const p = E.P1; label(p.x, p.y + 640, 'NEW COMBO', '#ffffff', 1.4); shownC = '';
}
// the keys: one of the four held back a moment to see whether its partner follows. Together, a combo; alone, it goes as it was pressed
let pend = null, chord = null, passing = false, actK = null;
function letGo(a) { passing = true; try { JU.game.press(a); } finally { passing = false; } }
function chordPress(a) {
  const now = E.T;
  if (pend && pend.a !== a && now - pend.t <= CHORD_T) {
    const pair = [SLOTS.indexOf(pend.a) + 1, SLOTS.indexOf(a) + 1].sort().join(''), first = pend.a;
    pend = null;
    if (RPAIRS.includes(pair) && comboReady(pair)) { chord = { pair, t: now }; return true; }
    letGo(first); return false;                     // (not a pair that makes anything, or not two of the twelve moves, or a key not ready)
  }
  if (pend) letGo(pend.a);
  pend = { a, t: now };
  return true;
}
function comboStart(pair) {
  const p = E.P1, k1 = keyOf(+pair[0]), k2 = keyOf(+pair[1]);
  if (p.move || p.ps || p.dashT > 0 || !p.ground || p.dead) return false;
  if (!comboReady(pair)) return true;               // (the cards changed under it meanwhile: it is dropped)
  const v = deck.armed === 'coupon' ? 1 : deck.armed === 'extra' ? 2 : 0, def = RCOMBOS[pair][v];
  if (v) deck.armed = null;                         // (a coupon's version spends the coupon)
  E.cd[k1] = E.cd[k2] = def.cd; deck.used[k1] = deck.used[k2] = def.cd;
  cycle(k1); cycle(k2); deck.spent += 2;
  p.move = { def, key: k1, t: 0, combo: pair };
  E.hud.mv[k1].classList.add('act'); E.hud.mv[k2].classList.add('act'); actK = [k1, k2];
  foundOne(def.name);
  return true;
}
function chordTick() {
  if (pend && E.T - pend.t > CHORD_T) { const a = pend.a; pend = null; letGo(a); }
  if (chord) { if (E.T - chord.t > .2) chord = null; else if (comboStart(chord.pair)) chord = null; }
  const m = E.P1.move;
  if (actK && !(m && m.def.combo)) { for (const k of actK) E.hud.mv[k].classList.remove('act'); actK = null; }
}
// under the health bar: the four, ??? until found; the colour of a coupon while one waits
const combosEl = document.createElement('div');
combosEl.className = 'lbc rg'; combosEl.setAttribute('aria-hidden', 'true');
E.root.querySelector('.fb.p1').appendChild(combosEl);
let shownC = '';
function paintCombos() {
  const show = on() && fight();
  combosEl.classList.toggle('on', show);
  if (!show) { shownC = ''; return; }
  const v = deck.armed === 'coupon' ? 1 : deck.armed === 'extra' ? 2 : 0, key = v + '|' + foundR.size;
  if (key === shownC) return;
  shownC = key;
  combosEl.classList.toggle('cpn', v === 1); combosEl.classList.toggle('xtr', v === 2);
  combosEl.innerHTML = RPAIRS.map(pr => { const d = RCOMBOS[pr][v], has = foundR.has(d.name);
    return `<i class="${has ? '' : 'q'}"><kbd>${pr[0]}+${pr[1]}</kbd><span>${has ? d.name : '???'}</span></i>`; }).join('');
}

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
  early: true, skin: SKIN, as: ['Registration', '再契象'], guard,
  hint: '<b>1–4</b> the cards in your hand · <b>NEXT</b> takes the key of the one you use · a <b>Coupon</b> or an <b>Extra Coupon</b>, then a move' });
const DEF = T.TECH.regis;

/* ---------- wiring ---------- */
const tick0 = H.tick, fx0 = H.fx, under0 = H.under, reset0 = H.reset, start0 = H.fightStart, press0 = H.press;
let wasRiding = false;
H.press = (a, inScene) => {
  if (!inScene && on() && fight() && !passing && SLOTS.includes(a) && chordPress(a)) return true;      // (one of the four: held back a moment, in case it is half of a combo)
  return press0 ? press0(a, inScene) : false;
};
H.tick = dt => {
  tick0(dt);
  if (!on()) { if (dressed) undress(); nextSlot(false); if (props.length || trap) clear(); pend = chord = null; paintCombos(); return; }
  const p = E.P1;
  if (!deck.hand.strikes) deal();
  chordTick();
  if (wasRiding && !riding && p.ground && !p.plat && p.y > 1) p.ground = false;      // (knocked off it mid-ride: down to the floor, not left sat on the air)
  wasRiding = riding; riding = false;
  if (trap) trapTick(dt);
  propsTick(dt);
  if (fight()) relabel(); else if (dressed) undress();
  nextSlot(fight()); paintCombos();
};
H.under = dt => {
  under0(dt);
  if (!on()) return;
  shadows(); propsDraw(true);
  const p = E.P1, m = p.move;
  if (m && m.def.reg && m.prop === 'scooter' && p.skin === SKIN && !p.dead) {      // the scooter he is sat on, under him
    const c = F(p.x + p.face * 58, p.y - RIDE_Y), k = c[2] * SCOOT;
    g.save(); g.translate(c[0], c[1]); g.scale(k * p.face, k); if (m.tilt) g.rotate(m.tilt); LWK = 1 / SCOOT; scooter(undefined, p.x * p.face / 20); LWK = 1; g.restore();
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
    if (m.prop === 'cart') { const c = F(p.x + p.face * CART_AT, 0), k = c[2]; g.save(); g.translate(c[0], c[1]); g.scale(k * p.face, k); cart(!!m.full, p.x * p.face / 9); g.restore(); }      // the trolley, out in front of him
    if (m.hook) hookDraw(p, m.hook);
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
const clear = () => { props.length = 0; trap = null; riding = wasRiding = false; pend = chord = null; actK = null; };
H.reset = () => { reset0(); clear(); deck.hand = {}; };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) { clear(); deal(); undress(); } };

JU.regis = { MOVES, CARDS, WEAPON, ARMS, COUPON, EXTRA, PRIZE, deck, esp: ESP, deal, rollPrize, SKIN, RCOMBOS, get found() { return [...foundR]; }, get chord() { return { pend: pend && pend.a, chord: chord && chord.pair }; },
  get state() { return { hand: Object.assign({}, deck.hand), next: deck.line[0], line: deck.line.slice(), armed: deck.armed, ammo: Object.assign({}, deck.ammo), props: props.length, trap: trap && { t: +trap.t.toFixed(2), life: trap.life } }; } };
})();
