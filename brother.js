/* JUJUTSU UNLIMITEDS — Build 0.23: the BLOOD BROTHER comes back (limited again: ENDS in choso.js), with a second mode, seven new variants and an
   ult for each mode. The user: "make the return of Chosos as another limited character AND MAKE IT HAVE ANOTHER MODE idk what to call it and 7 brand
   new varaints and an ult for both variants ... flight alongside for choso. in chosos ult there 3 moves for now, blood rain (summons a blood rain
   that does 2 damage per raindrop and lastst 9 second), wing king which starts automatically hitting m1s without the final m1 so for 6 seconds it
   dfoes normal m1s with double the damage, and also the fianl one pulls the enemy towards you sloiws the game down for a split second and slams
   them into the ground. Plasma wave (self explanatory)."
   TWO MODES (right click switches; F + right click as well: with two, back and next are the same one):
     BLOOD  Blood Manipulation, as choso.js has it: Slicing Exorcism, Flowing Red Scale, Supernova, Piercing Blood (held).
     STACK  Flowing Red Scale: Stack (the name and the four are ours): the blood run hot through all of him, and he fights close. His strikes come a
            quarter quicker and land a quarter harder, and he is quicker on his feet. 1 Blood Edge, 2 Crimson Binding, 3 Blood Meteorite (held for
            more), 4 Supernova Embrace.
   THE SEVEN VARIANTS (ours): 1 Supernova Hail (BLOOD, 3 in the air) · 2 Falling Needle (BLOOD, 4 in the air) · 3 Crimson Supernova (BLOOD, 3 just
     after Slicing Exorcism lands) · 4 Edge Whirl (STACK, 1 in the air) · 5 Heavy Meteorite (STACK, 3 held to the end) · 6 Bound Execution (STACK, 1
     while Crimson Binding holds them) · 7 Tethered Pierce (Crimson Binding, switch to BLOOD, 4 while they are still bound).
   G, THE ULT OF THE MODE HE IS IN (30 s; the mode is held while it lasts). Music: "Fight Alongside" is not anywhere the site can play it from, so a
     loop built in index.html (sfx.tune 'fight-alongside') plays; at home sounds/home-fight-alongside.mp3 plays instead, if it is there.
     BLOOD: BIG BROTHER (お兄ちゃん): 1 Blood Rain, 2 Wing King, 3 Plasma Wave (the user's three); 4 stays Piercing Blood.
     STACK: DEATH PAINTING (九相図, ours): 1 Nine Stages, 2 Crimson Crucifix, 3 Decay (his brothers' Rot Technique); 4 stays Supernova Embrace. */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, C = JU.cut, T = JU.tech, Z = JU.bossfx, MS = JU.ms;
const { rnd, clamp, lerp, ease, ZP } = E, TAU = Math.PI * 2, { orb } = T.tk;
const CH = JU.choso, DEF = T.TECH.blood, OLD = CH.MOVES, SLOTS = T.SLOTS;
const BLOOD = '#e0203c', DARK = '#7a0f24', WET = '#b3122c', RGB = '224,32,60', PALE = '#ffd3d9', INKC = '#2a030a', HOT = '#ff5a36', HRGB = '255,90,54';
const ROT = '#86a33a', ROTD = '#253109', RRGB = '150,190,60';
const CLASP = [.16, 0, 1.5, 1.62, .5, -.5, 0], RAISE = [-.1, -.25, 2.75, 2.6, .25, -.3, 0], SPREAD = [-.12, -.2, 2.2, -1.9, .35, -.35, 0], HUG = [.28, .05, 1.95, 1.85, .45, -.45, 0];
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const exact = (o, n) => n / (o.dr || 1);            // a hit worth the stated amount, whatever it hits
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const raid = () => !!(H.foes && H.foes());
const live = o => !!o && !o.ko && !(o.alpha < 1);
const on = () => T.active === DEF;
const free = p => !p.move && !p.ps && !p.dead && !(p.dashT > 0);
const mid = o => o.y + 170 * (o.scale || 1);
const label = (x, y, text, col = BLOOD, life = 1.1) => E.fx.push({ k: 2, x, y, n: text, col, t: 0, life });
const keyDown = (k, slot) => E.keys.has(k) || E.keys.has('hold:' + slot);
const holdable = o => live(o) && !duel() && !o.net;  // (another player's body is theirs to move)
const facing = (p, o) => { if (live(o)) p.face = o.x >= p.x ? 1 : -1; };
const up = o => o.state !== 'down' && o.state !== 'up';
// damage that does not stagger: rain, rot. The stated amount; a proper hit only if it is the last of them (or the body is someone else's to move)
function drip(o, n, col = BLOOD, show = true) {
  if (!live(o)) return;
  if (o.net || o.hp - n <= 0 || duel()) { E.applyHit(o, o.x >= E.P1.x ? 1 : -1, { dmg: exact(o, n), kb: 0, stun: .05, stop: .01, col, fixed: 1, mute: 1 }); return; }
  o.hp -= n; o.lastHit = 0; o.flash = Math.max(o.flash || 0, .03);
  if (show) E.addNum(o.x + rnd(-46, 46), o.y + 250 * (o.scale || 1) + rnd(0, 50), n, col);
}
// a jagged line of light from one place to another (plasma, and the wings' beams)
function arc(x0, y0, x1, y1, col, w, n = 7) {
  const a = F(x0, y0), b = F(x1, y1);
  g.beginPath(); g.moveTo(a[0], a[1]);
  for (let i = 1; i < n; i++) { const u = i / n; g.lineTo(lerp(a[0], b[0], u) + rnd(-14, 14) * a[2], lerp(a[1], b[1], u) + rnd(-14, 14) * a[2]); }
  g.lineTo(b[0], b[1]); g.strokeStyle = col; g.lineWidth = w; g.stroke();
}

/* ================= the two modes ================= */
const MODES = [
  { id: 'blood', short: 'BLOOD', name: 'Blood Manipulation', jp: '赤血操術', col: BLOOD, rgb: RGB },
  { id: 'stack', short: 'STACK', name: 'Flowing Red Scale: Stack', jp: '赤鱗躍動・載', col: HOT, rgb: HRGB }
];
const STACK_POW = 1.25, STACK_RATE = 1.25, STACK_WALK = .2;
let mode = 0;
const waits = [0, 1].map(() => ({ strikes: 0, crush: 0, div: 0, manji: 0 }));      // each mode's cooldowns, kept while he is in the other one

/* ================= STACK: the four ================= */
// a crescent of hardened blood, its belly the way it is going
function crescent(x, y, r, ang, w, a, col = BLOOD) {
  const c = F(x, y), k = c[2], R = r * k;
  g.save(); g.translate(c[0], c[1]); g.rotate(ang); g.globalAlpha = Math.max(0, a); g.lineCap = 'round';
  lit(() => { g.strokeStyle = `rgba(${RGB},.5)`; g.lineWidth = w * 2.4 * k; g.beginPath(); g.arc(0, 0, R, -1.1, 1.1); g.stroke(); });
  g.strokeStyle = INKC; g.lineWidth = (w + 5) * k; g.beginPath(); g.arc(0, 0, R, -1.05, 1.05); g.stroke();
  g.strokeStyle = col; g.lineWidth = w * k; g.stroke();
  g.strokeStyle = PALE; g.lineWidth = Math.max(1.2, w * .22 * k); g.beginPath(); g.arc(0, 0, R + w * .32 * k, -.85, .85); g.stroke();
  g.restore();
}
// 1 — BLOOD EDGE (血刃): blades of it off both forearms, in at them and three cuts, the last one a launcher
const CUTS = [[.14, 8, -.55], [.28, 8, .6], [.46, 14, -.12]];
function cut(p, i) {
  const [, dmg, tilt] = CUTS[i], f = p.face, x = p.x + f * 110, y = p.y + 175, last = i === 2, o = E.P2;
  sfx.cut(last ? 1.7 : 1.15); sfx.whoosh();
  V.custom(.22, u => crescent(x + f * 70 * u, y, last ? 155 : 118, (f > 0 ? 0 : Math.PI) + tilt * f, last ? 16 : 11, (1 - u) ** 1.2));
  if (!E.tryHit(p, last ? { reach: 235, dmg, kb: 700, lift: 470, stun: .8, stop: .12, heavy: 1, col: BLOOD } : { reach: 220, dmg, kb: 110, stun: .55, stop: .05, col: BLOOD })) return;
  C.ink(o.x, mid(o), f, last ? 14 : 7, last ? 1.1 : .8, WET); sfx.splat();
  if (last) { C.slice(o.x, mid(o), (f > 0 ? 0 : Math.PI) - .3 * f, 300, { shift: 8, col: RGB }); shake(18); }
}
const BEDGE = { name: 'Blood Edge', cd: 4, dur: .78, glow: 'red', run(p, m, t) {
  p.rate = 48;
  if (!m.s) { m.s = 1; facing(p, E.P2); MS.ono('刃', p.x + p.face * 90, p.y + 370, .6, BLOOD, .5); }
  p.vx = t < .13 ? p.face * 900 : t < .5 ? p.face * 110 : 0;
  p.target = t < .14 ? POSE.dash : t < .28 ? POSE.hook : t < .46 ? POSE.cross : t < .62 ? POSE.div : POSE.idle;
  for (let i = 0; i < 3; i++) if (t >= CUTS[i][0] && !(m.c & (1 << i))) { m.c = (m.c || 0) | (1 << i); cut(p, i); }
} };

// 2 — CRIMSON BINDING (赤縛): ropes of blood thrown out, round them, and they are pulled in and held. 2.2 s (less for the heavy ones)
let bound = null;                                   // { o, t, pull }
const BIND_T = 2.2, BIND_POISE = .9, ROPE_V = 2800, ROPE_MAX = 780;
function tie(p, o) {
  E.applyHit(o, p.face, { dmg: 12, kb: 0, stun: .9, stop: .1, col: BLOOD, mute: 1 });
  sfx.splat(); sfx.hit(true); shake(14);
  if (holdable(o) && !o.ko && o.state !== 'air') bound = { o, t: o.poise ? BIND_POISE : BIND_T, pull: 0 };
  label(o.x, o.y + 430 * (o.scale || 1), 'BOUND', BLOOD, .9);
}
const BIND = { name: 'Crimson Binding', cd: 9, dur: .8, glow: 'red', run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.rate = 40;
  if (!m.s) { m.s = 1; m.rope = 0; facing(p, o); sfx.charge(); MS.ono('縛', p.x + p.face * 70, p.y + 380, .65, BLOOD, .5); }
  p.target = t < .16 ? POSE.hookWind : t < .55 ? CLASP : POSE.idle;
  if (t < .16 || m.done) return;
  m.rope = Math.min(ROPE_MAX, (t - .16) * ROPE_V);
  const dx = live(o) ? (o.x - p.x) * p.face : 1e9;
  if (dx > -40 && dx < m.rope + 40 && Math.abs(o.y - p.y) < 320 && up(o) && !(o.inv > 0)) { m.done = 1; tie(p, o); }
  else if (m.rope >= ROPE_MAX) m.done = 2;
} };
function ropeTo(p, x1, y1, a = 1, n = 3) {           // the ropes, from his hands to wherever they have got to
  const w = E.hand(p, true), b = E.hand(p, false), T0 = E.T;
  g.save(); g.globalAlpha = a; g.lineCap = 'round';
  for (let r = 0; r < n; r++) {
    const s = r ? b : w, A = F(s[0], s[1]), B = F(x1, y1 + (r - 1) * 26), k = A[2], amp = (18 - r * 4) * k;
    g.beginPath(); g.moveTo(A[0], A[1]);
    for (let i = 1; i <= 16; i++) { const u = i / 16, wob = Math.sin(u * 9 + T0 * 18 + r * 2) * amp * Math.sin(u * Math.PI); g.lineTo(lerp(A[0], B[0], u), lerp(A[1], B[1], u) + wob); }
    g.strokeStyle = INKC; g.lineWidth = 9 * k; g.stroke(); g.strokeStyle = r === 1 ? WET : BLOOD; g.lineWidth = 5.5 * k; g.stroke(); g.strokeStyle = 'rgba(255,190,200,.8)'; g.lineWidth = 1.4 * k; g.stroke();
  }
  g.restore();
}
function drawBound(o) {                             // coils round them: the chest, the waist, the knees
  const s = o.scale || 1, T0 = E.T;
  for (const [y, rx] of [[215, 62], [150, 58], [70, 50]]) {
    const c = F(o.x, o.y + y * s), k = c[2];
    g.lineWidth = 8 * k; g.strokeStyle = INKC; g.beginPath(); g.ellipse(c[0], c[1], rx * s * k, 13 * k, .08 * Math.sin(T0 * 3 + y), 0, TAU); g.stroke();
    g.lineWidth = 5 * k; g.strokeStyle = BLOOD; g.stroke();
    g.lineWidth = 1.4 * k; g.strokeStyle = 'rgba(255,200,210,.8)'; g.beginPath(); g.ellipse(c[0], c[1], rx * s * k, 13 * k, .08 * Math.sin(T0 * 3 + y), Math.PI * .1, Math.PI * .9); g.stroke();
  }
}

// 3 — BLOOD METEORITE (血星磊): blood pressed into a rock and thrown. Tap: 45. Held, it grows for 1.2 s more: up to 85 (HEAVY METEORITE)
const MET_MIN = .3, MET_MAX = 1.2;
let rock = null;                                    // { x, y, vx, r, dmg, c, f, t, spin }
const METEOR = { name: 'Blood Meteorite', cd: 8, dur: 3, glow: 'red', run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.rate = 36;
  if (m.fired === undefined) {
    p.target = CLASP;
    if (!m.s) { m.s = 1; sfx.charge(); MS.ono('磊', p.x + p.face * 70, p.y + 380, .6, BLOOD, .5); }
    facing(p, o);
    m.c = clamp((t - MET_MIN) / MET_MAX, 0, 1);
    if (m.c >= 1 && !m.full) { m.full = 1; label(p.x, p.y + 450, 'HEAVY METEORITE', '#ffb3bd', 1.1); sfx.bf(); shake(12); }
    if (m.c > 0 && t >= (m.beat || 0)) { m.beat = t + .22; sfx.beat(m.c); }
    if (t < MET_MIN || (keyDown('3', 'div') && t < MET_MIN + MET_MAX)) { if (Math.random() < .6) { const w = E.hand(p, true); V.mote(w[0] + p.face * 20, w[1], 'red'); } return; }
    m.fired = t; hurl(p, m.c);
    return;
  }
  p.target = t < m.fired + .3 ? POSE.div : POSE.idle; p.rate = 52;
  if (t > m.fired + .45) E.endMove(p);
} };
function hurl(p, c) {
  const w = E.hand(p, true), f = p.face;
  rock = { x: w[0] + f * 40, y: w[1], vx: f * (2100 + 700 * c), r: 24 + 20 * c, dmg: 45 + 40 * c, c, f, t: 0, spin: rnd(0, TAU) };
  sfx.whoosh(); sfx.blast(); shake(10 + 10 * c);
}
function rockTick(dt) {
  const s = rock, o = E.P2, hs = o.scale || 1;
  s.t += dt; s.x += s.vx * dt; s.spin += dt * 9 * s.f;
  if (Math.random() < dt * 40) V.puff('red', s.x - s.f * rnd(10, 60), s.y + rnd(-15, 15), -s.f * rnd(60, 200), rnd(-40, 80), 20 + 20 * s.c, .25);
  if (live(o) && Math.abs(o.x - s.x) < 55 * hs + s.r && s.y > o.y - 20 && s.y < o.y + 320 * hs && !(o.inv > 0) && up(o)) {
    E.applyHit(o, s.f, { dmg: s.dmg, kb: 1100 + 500 * s.c, lift: 480 + 200 * s.c, stun: 1, stop: .18 + .12 * s.c, heavy: 1, ring: 1, col: BLOOD });
    burst(s.x, s.y, 1 + s.c); C.ink(o.x, mid(o), s.f, 18 + 12 * s.c, 1.3, WET); shake(22 + 14 * s.c);
    if (s.c >= 1) MS.bigHit(E.P1, o, 'ゴッ', BLOOD, 'red');
    rock = null; return;
  }
  if (s.t > .55 || Math.abs(s.x) > 1060) { burst(s.x, s.y, .6); rock = null; }
}
function burst(x, y, s = 1) {                       // a rock of it going to pieces
  sfx.blast(); V.sparks(x, y, 'red', 10 + 8 * s); V.ring(x, y, 120 + 90 * s, BLOOD, .25); E.addBlast(x, y, RGB, 160 + 120 * s);
  for (let i = 0; i < 8 + 6 * s; i++) { const a = rnd(0, TAU), v = rnd(200, 700) * s; V.puff('red', x, y, Math.cos(a) * v, Math.sin(a) * v + 200, rnd(10, 22), rnd(.3, .6), -1600); }
}
function drawRock(x, y, r, spin, glow = 1) {        // dark, faceted, lit from inside along its cracks
  const c = F(x, y), k = c[2], R = r * k;
  lit(() => E.glow(E.GLOW.red, c[0], c[1], R * 4.2, .55 * glow));
  g.save(); g.translate(c[0], c[1]); g.rotate(spin);
  g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rr = R * (.82 + ((i * 37) % 7) / 25); i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath();
  g.fillStyle = '#4a0712'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INKC; g.stroke();
  g.fillStyle = '#7d0f22'; g.beginPath(); g.moveTo(-R * .6, -R * .5); g.lineTo(R * .2, -R * .75); g.lineTo(R * .55, -R * .1); g.lineTo(-R * .1, 0); g.closePath(); g.fill();
  lit(() => { g.strokeStyle = `rgba(255,120,140,${.8 * glow})`; g.lineWidth = Math.max(1.2, R * .07); g.beginPath(); g.moveTo(-R * .5, R * .2); g.lineTo(0, -R * .1); g.lineTo(R * .35, R * .35); g.moveTo(0, -R * .1); g.lineTo(R * .15, -R * .6); g.stroke(); });
  g.restore();
}

// 4 — SUPERNOVA EMBRACE: in, both arms round them, and eight beads of blood round the two of them going off one after another (5 each),
// then all of it at once (30). He is untouchable while he holds on
const EMBRACE = { name: 'Supernova Embrace', cd: 13, dur: 2.4, glow: 'red', run(p, m, t) {
  const o = E.P2, gap = (o.x - p.x) * p.face;
  p.rate = 46;
  if (m.got === undefined) {
    if (!m.s) { m.s = 1; facing(p, o); sfx.whoosh(); }
    if (t > .4) { p.vx = 0; p.target = POSE.idle; if (t > .55) E.endMove(p); return; }
    p.target = POSE.dash; p.vx = gap > 150 ? p.face * 1400 : 0;
    if (gap > -30 && gap < 200 && live(o) && up(o) && !(o.inv > 0)) { m.got = t; m.n = 0; p.vx = 0; p.inv = Math.max(p.inv || 0, 1.7); sfx.charge(); MS.ono('抱', p.x, p.y + 400, .7, BLOOD, .6); }
    return;
  }
  const u = t - m.got, f = p.face;
  p.vx = 0; p.target = u < 1.15 ? HUG : POSE.div;
  if (holdable(o) && u < 1.15) Object.assign(o, { x: clamp(p.x + f * 105, -980, 980), vx: 0, vy: 0, state: 'hurt', stun: .5, act: null, tele: 0, face: -f });
  m.cx = (p.x + o.x) / 2;
  while (m.n < 8 && u >= .2 + m.n * .11) {
    const i = m.n++, a = -Math.PI / 2 + i * TAU / 8 + u * 2, bx = m.cx + Math.cos(a) * 170, by = 170 + Math.sin(a) * 150;
    sfx.blast(); V.sparks(bx, by, 'red', 6); V.ring(bx, by, 80, BLOOD, .2); shake(6);
    if (live(o)) E.applyHit(o, f, { dmg: 5, kb: 0, stun: .5, stop: .03, col: BLOOD, mute: 1 });
  }
  if (u >= 1.15 && !m.boom) {
    m.boom = 1; sfx.bf(); sfx.blast(); shake(36); E.addBlast(m.cx, 170, RGB, 520); V.ring(m.cx, 170, 380, BLOOD, .4);
    if (Z) Z.flash(RGB, .35, .25);
    if (live(o)) { E.applyHit(o, f, { dmg: 30, kb: 1150, lift: 720, stun: 1, stop: .26, heavy: 1, col: BLOOD }); MS.bigHit(p, o, '超新星', BLOOD, 'red'); }
  }
  if (u > 1.6) E.endMove(p);
} };
function drawEmbrace(p, m) {                        // the beads still to go, going round the two of them
  if (m.got === undefined || m.boom) return;
  const u = m.t - m.got;
  for (let i = m.n; i < 8; i++) { const a = -Math.PI / 2 + i * TAU / 8 + u * 2, s = Math.min(1, u * 5); orb(m.cx + Math.cos(a) * 170, 170 + Math.sin(a) * 150, (10 + 2 * Math.sin(u * 30 + i)) * s, 'red', DARK); }
}

/* ================= the seven variants ================= */
// 1 — SUPERNOVA HAIL (BLOOD, 3 in the air): he hangs there and throws seven beads down over them; each goes off where it lands (6)
const hail = [];                                    // { x, y, vx, vy, t }
const HAIL = { name: 'Supernova', dur: .7, glow: 'red', run(p, m, t) {
  const o = E.P2;
  p.rate = 40; p.target = t < .16 ? POSE.divWind : t < .45 ? POSE.div : POSE.fall;
  if (t < .45) { p.vy = Math.max(p.vy, 40); p.vx *= .85; }
  if (t < .16 || m.s) return;
  m.s = 1; facing(p, o); sfx.whoosh(); label(p.x, p.y + 400, 'SUPERNOVA HAIL', '#ffb3bd', .9);
  const cx = live(o) ? o.x : p.x + p.face * 300, w = E.hand(p, true);
  for (let i = 0; i < 7; i++) { const tx = cx + (i - 3) * 62 + rnd(-20, 20), tt = .32 + i * .03; hail.push({ x: w[0], y: w[1], vx: (tx - w[0]) / tt, vy: -w[1] / tt * .4 - 300, t: 0 }); }
} };
function hailTick(dt) {
  const o = E.P2, hs = o.scale || 1;
  for (let i = hail.length - 1; i >= 0; i--) {
    const b = hail[i];
    b.t += dt; b.vy -= 2400 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
    const onO = live(o) && Math.abs(o.x - b.x) < 60 * hs && b.y < o.y + 300 * hs && b.y > o.y - 10;
    if (b.y <= 12 || onO || b.t > 1.2) {
      hail.splice(i, 1); sfx.blast(); V.sparks(b.x, Math.max(20, b.y), 'red', 7); V.ring(b.x, Math.max(30, b.y), 120, BLOOD, .22); E.addBlast(b.x, Math.max(30, b.y), RGB, 150); shake(5);
      if (live(o) && Math.abs(o.x - b.x) < 95 * hs && b.y < o.y + 320 * hs) E.applyHit(o, b.x <= o.x ? 1 : -1, { dmg: 6, kb: 60, stun: .45, stop: .03, col: BLOOD, mute: 1 });
    }
  }
}
// 2 — FALLING NEEDLE (BLOOD, 4 in the air): no holding it: he points it down at them and lets go. 34, and they are put into the floor
const NEEDLE = { name: 'Piercing Blood', dur: .75, glow: 'red', run(p, m, t) {
  const o = E.P2;
  p.rate = 40;
  if (t < .3) { p.target = CLASP; p.vy = Math.max(p.vy, 30); p.vx *= .8; if (!m.c) { m.c = 1; facing(p, o); sfx.charge(); MS.ono('穿', p.x, p.y + 330, .55, BLOOD, .4); } return; }
  p.target = POSE.div;
  if (m.s) return;
  m.s = 1; sfx.pierce(.8); shake(20); E.zoomIn(.3);
  const w = E.hand(p, true), tx = live(o) ? o.x : p.x + p.face * 420, ty = live(o) ? o.y + 120 : 0, x0 = w[0], y0 = w[1];
  const len = Math.hypot(tx - x0, ty - y0) || 1, ex = x0 + (tx - x0) / len * 1600, ey = y0 + (ty - y0) / len * 1600;
  V.custom(.36, u => {
    const a = F(x0, y0), b = F(ex, Math.max(-40, ey)), k = a[2], al = (1 - u) ** 1.2;
    g.save(); g.lineCap = 'round';
    lit(() => { g.strokeStyle = `rgba(${RGB},${.35 * al})`; g.lineWidth = 46 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
    g.globalAlpha = al; for (const [wd, col] of [[22, '#3d0612'], [15, BLOOD], [5, '#ffe3e6']]) { g.strokeStyle = col; g.lineWidth = wd * k * (1 - u * .6); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    g.restore();
  });
  const fx = clamp(x0 + (tx - x0) * (y0 / Math.max(1, y0 - ty)), -1000, 1000); C.gash(fx - 80, rnd(-20, 20), fx + 80, rnd(-20, 20), 5, 2, { col: RGB }); V.crack(clamp(fx, -1000, 1000), 200);
  if (live(o) && !(o.inv > 0) && o.state !== 'down') {
    const d = Math.abs((ty - y0) * (o.x - x0) - (tx - x0) * (mid(o) - y0)) / len;    // how far the middle of them is from the line of it
    if (d < 120 * (o.scale || 1) && (o.x - x0) * (tx - x0) >= 0) {
      E.applyHit(o, p.face, { dmg: 34, kb: 200, stun: .9, stop: .2, heavy: 1, col: BLOOD });
      if (!o.poise && !o.ko && holdable(o)) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 26), vy: -1600, vx: p.face * 120, bounced: false });
      C.ink(o.x, mid(o), p.face, 16, 1.2, WET); V.impact(.12, o.x, mid(o));
    }
  }
} };
// 3 — CRIMSON SUPERNOVA (BLOOD, 3 within 1.4 s of Slicing Exorcism landing): the wheel still in them comes apart into beads, and they go off. 30
let exo = null;                                     // { o, at }: the last Slicing Exorcism that landed
const CRIMSON = { name: 'Crimson Supernova', dur: .9, glow: 'red', run(p, m, t) {
  const o = m.o;
  p.vx = 0; p.rate = 40; p.target = t < .2 ? POSE.divWind : t < .6 ? POSE.div : POSE.idle;
  if (!m.s) { m.s = 1; sfx.charge(); label(p.x, p.y + 420, 'CRIMSON SUPERNOVA', '#ffb3bd', 1); }
  if (t >= .32 && !m.b && o) {
    m.b = 1; sfx.bf(); sfx.blast(); shake(26); E.addBlast(o.x, mid(o), RGB, 380);
    for (let i = 0; i < 10; i++) { const a = i * TAU / 10; V.sparks(o.x + Math.cos(a) * 120, mid(o) + Math.sin(a) * 100, 'red', 4); }
    V.ring(o.x, mid(o), 300, BLOOD, .35);
    if (live(o)) { E.applyHit(o, p.face, { dmg: 30, kb: 700, lift: 820, stun: 1, stop: .2, heavy: 1, col: BLOOD }); MS.bigHit(p, o, '赤', BLOOD, 'red'); }
  }
} };
function drawCrimson(m) {                           // the wheel, slowing in them and coming apart
  if (!m.o || m.b) return;
  const o = m.o, c = F(o.x, mid(o)), k = c[2], u = Math.min(1, m.t / .32), r = (64 + 40 * u) * k, a = E.T * (30 - 24 * u);
  g.lineCap = 'round';
  for (const [w, col] of [[13, DARK], [6, BLOOD]]) { g.strokeStyle = col; g.lineWidth = w * k; g.beginPath(); g.ellipse(c[0], c[1], r, r * .38, 0, a, a + 4.6 * (1 - u * .5)); g.stroke(); }
  g.lineCap = 'butt';
  for (let i = 0; i < 10; i++) { const q = i * TAU / 10 + a * .2; orb(o.x + Math.cos(q) * (64 + 60 * u), mid(o) + Math.sin(q) * (24 + 80 * u), 7 * u, 'red', DARK); }
}
// 4 — EDGE WHIRL (STACK, 1 in the air): turning over and over with the blades out, down onto them: two cuts on the way (6) and one into the floor (16)
const WHIRL = { name: 'Blood Edge', dur: 1.6, glow: 'red', run(p, m, t) {
  const o = E.P2, hs = o.scale || 1;
  p.rate = 50;
  if (m.land !== undefined) { p.vx = 0; p.spin = 1; p.target = t < m.land + .2 ? POSE.crush : POSE.idle; if (t > m.land + .32) E.endMove(p); return; }
  if (t < .1) { p.target = POSE.crushWind; p.vy = Math.max(p.vy, 60); p.vx *= .85; return; }
  if (!m.aim) { m.aim = 1; facing(p, o); sfx.whoosh(); label(p.x, p.y + 400, 'EDGE WHIRL', '#ffb3bd', .8); m.vx = clamp((o.x - p.face * 50 - p.x) / Math.max(.1, p.y / 1300), -2000, 2000); m.n = 0; }
  p.target = POSE.crush; p.vy = -1300; p.vx = m.vx; p.spin = Math.cos(t * 26);
  if (Math.random() < .9) V.custom(.14, u => crescent(p.x, p.y + 160, 120, E.T * 20, 9, (1 - u) * .8));
  const near = live(o) && Math.abs(o.x - p.x) < 170 * hs && Math.abs(o.y + 150 * hs - (p.y + 150)) < 220 && up(o);
  if (near && m.n < 2 && t > .1 + m.n * .12) { m.n++; sfx.cut(1.1); E.applyHit(o, p.face, { dmg: 6, kb: 40, stun: .6, stop: .04, col: BLOOD }); C.ink(o.x, mid(o), p.face, 6, .8, WET); }
  if (p.ground && t > .12) {
    m.land = t; p.vy = 0; p.spin = 1; sfx.blast(); shake(20); V.crack(p.x + p.face * 60, 240); V.rocks(p.x, 0, 8);
    V.custom(.3, u => crescent(p.x + p.face * 40, 60, 200 * (.6 + u * .6), -Math.PI / 2, 16, 1 - u));
    if (live(o) && Math.abs(o.x - p.x) < 230 * hs && o.y < 260) { E.applyHit(o, p.face, { dmg: 16, kb: 260, stun: .9, stop: .14, heavy: 1, col: BLOOD }); if (!o.poise && !o.ko && holdable(o)) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 26), vy: -1400, vx: p.face * 150, bounced: false }); C.ink(o.x, mid(o), p.face, 12, 1, WET); }
  }
} };
// 6 — BOUND EXECUTION (STACK, 1 while the ropes still hold them): five cuts into what cannot move (9 each), and a cross through it (25)
const EXEC = { name: 'Bound Execution', dur: 1.25, glow: 'red', run(p, m, t) {
  const o = m.o, f = p.face;
  p.vx = 0; p.rate = 56;
  if (!m.s) { m.s = 1; m.n = 0; label(p.x, p.y + 430, 'BOUND EXECUTION', '#ffb3bd', 1.1); sfx.charge(); }
  p.target = m.n & 1 ? POSE.cross : POSE.hook;
  if (o && holdable(o) && t < .9) Object.assign(o, { x: clamp(p.x + f * 150, -980, 980), vx: 0, state: 'hurt', stun: .5, act: null, tele: 0 });
  while (m.n < 5 && t >= .12 + m.n * .12) {
    const i = m.n++;
    sfx.cut(1.2); V.custom(.18, u => crescent(p.x + f * 120, p.y + 175, 120, (f > 0 ? 0 : Math.PI) + (i & 1 ? .6 : -.6) * f, 11, 1 - u));
    if (live(o)) { E.applyHit(o, f, { dmg: 9, kb: 0, stun: .6, stop: .04, col: BLOOD, mute: 1 }); C.ink(o.x, mid(o), f, 6, .7, WET); }
  }
  if (t >= .82 && !m.x) {
    m.x = 1; bound = null; p.target = POSE.div; sfx.cut(2); sfx.bf(); shake(30);
    if (live(o)) {
      for (const a of [.75, -.75]) C.slice(o.x, mid(o), a, 360, { shift: 10, col: RGB });
      E.applyHit(o, f, { dmg: 25, kb: 900, lift: 620, stun: 1, stop: .24, heavy: 1, col: BLOOD }); MS.bigHit(p, o, '斬', BLOOD, 'red'); C.ink(o.x, mid(o), f, 22, 1.4, WET);
    }
  }
} };
// 7 — TETHERED PIERCE (Crimson Binding, switch to BLOOD, 4 while they are still bound): the rope is the aim. Piercing Blood down the length of
// it, as hard as it comes, with nothing to hold: 80
const TETHER = { name: 'Tethered Pierce', dur: .8, glow: 'red', run(p, m, t) {
  const o = m.o;
  p.vx = 0; p.rate = 44;
  if (t < .16) { p.target = CLASP; if (!m.c) { m.c = 1; facing(p, o); sfx.charge(); label(p.x, p.y + 430, 'TETHERED PIERCE', '#ffb3bd', 1.1); } return; }
  p.target = t < .5 ? POSE.div : POSE.idle;
  if (m.s) return;
  m.s = 1; bound = null; sfx.pierce(1); sfx.bf(); shake(34); E.zoomIn(.45);
  const w = E.hand(p, true), f = p.face, x0 = w[0] + f * 24, y = w[1];
  V.custom(.45, u => {
    const a = F(x0, y), b = F(x0 + f * 1600, y), k = a[2], al = (1 - u) ** 1.1;
    g.save(); g.lineCap = 'round';
    lit(() => { g.strokeStyle = `rgba(${RGB},${.4 * al})`; g.lineWidth = 80 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
    g.globalAlpha = al; for (const [wd, col] of [[34, '#3d0612'], [24, BLOOD], [9, '#fff2f4']]) { g.strokeStyle = col; g.lineWidth = wd * k * (1 - u * .5); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    lit(() => { for (let i = 0; i < 5; i++) { const c = F(x0 + f * (40 + i * 70 + 260 * u), y), rr = (30 + i * 18 + 90 * u) * c[2]; g.strokeStyle = `rgba(255,140,150,${.8 * al})`; g.lineWidth = 3; g.beginPath(); g.ellipse(c[0], c[1], rr * .3, rr, 0, 0, TAU); g.stroke(); } });
    g.restore();
  });
  C.gash(x0, rnd(-30, 30), x0 + f * 1450, rnd(-30, 30), 7, 2.4, { col: RGB });
  if (live(o)) {
    E.applyHit(o, f, { dmg: 80, kb: 1300, lift: 420, stun: 1, stop: .3, heavy: 1, col: BLOOD });
    MS.bigHit(p, o, '穿血', BLOOD, 'red'); V.impact(.18, o.x, mid(o)); C.ink(o.x, mid(o), f, 26, 1.5, WET);
    for (let i = 0; i < 3; i++) C.slice(o.x + f * rnd(0, 90), mid(o) + rnd(-50, 50), (f > 0 ? 0 : Math.PI) + rnd(-.2, .2), 280, { shift: 7, col: RGB, delay: i * .02 });
  }
} };

/* ================= G: the ults ================= */
const ULT_T = 30, INTRO_T = 2.8;
let ult = null, watch = 0, shownT = -1, tint = 0;  // { mode, t, intro, paused, music }; how far the stage has gone to the ult's colour
const ultOn = () => !!ult && !ult.intro;
const ULT_NAME = ['Big Brother', 'Death Painting'], ULT_JP = ['お兄ちゃん', '九相図'];
function awaken(p) {
  if (ult || !on()) return;
  ult = { mode, t: ULT_T, intro: true, paused: false, music: null };
  if (!duel() && !raid() && !Fi.fight.paused) { Fi.fight.paused = true; ult.paused = true; }      // (the fight waits for it: not a duel's, not a raid's)
  p.inv = Math.max(p.inv || 0, INTRO_T + .3);
  p.move = { def: INTRO[mode], t: 0 };
  E.zoomIn(INTRO_T);
  clearInterval(watch); watch = setInterval(() => { if (ult && E.root.dataset.mode !== 'fight') endUlt(true); if (!ult) clearInterval(watch); }, 250);
}
const INTRO = [
  { name: 'Big Brother', dur: INTRO_T, run(p, m, t) {           // Convergence, his hands together; then the blood goes up out of him
    p.vx = 0; p.rate = 16; p.target = t < 1.3 ? CLASP : RAISE;
    if (!m.a) { m.a = 1; if (JU.manga) JU.manga.think(p, 'NINE OF US... AND I AM THE ELDEST.', { life: 1.3 }); sfx.beat(.3); }
    if (t >= 1.3 && !m.b) { m.b = 1; if (JU.manga) JU.manga.say(p, 'STAND BEHIND YOUR BIG BROTHER!', { life: 1.4 }); sfx.charge(); ult.sky = true; }
    if (t > .2 && Math.random() < .5) { const w = E.hand(p, true); V.mote(w[0], w[1], 'red'); }
    if (t >= 2.7 && !m.c) { m.c = 1; begin(p); }
  } },
  { name: 'Death Painting', dur: INTRO_T, run(p, m, t) {        // the nine of them, called by number, and the blood going black and green round him
    p.vx = 0; p.rate = 16; p.target = t < 1.3 ? POSE.manjiWind : SPREAD;
    if (!m.a) { m.a = 1; m.n = 0; if (JU.manga) JU.manga.think(p, 'WE WERE NINE.', { life: 1.3 }); sfx.beat(.2); }
    while (m.n < 9 && t >= .12 + m.n * .13) { const i = m.n++, a = -Math.PI / 2 + i * TAU / 9; MS.ono('一二三四五六七八九'[i], p.x + Math.cos(a) * 260, p.y + 200 + Math.sin(a) * 200, .5, i % 3 ? BLOOD : ROT, 1.4); sfx.tick(i % 3); }
    if (t >= 1.3 && !m.b) { m.b = 1; if (JU.manga) JU.manga.say(p, 'MY BROTHERS FIGHT WITH ME!', { life: 1.4 }); sfx.charge(); ult.sky = true; }
    if (t >= 2.7 && !m.c) { m.c = 1; begin(p); }
  } }
];
function begin(p) {
  ult.intro = false;
  if (ult.paused) { ult.paused = false; Fi.fight.paused = false; }
  E.banner(ULT_JP[ult.mode], ULT_NAME[ult.mode].toUpperCase()); sfx.bf(); sfx.blast(); shake(26);
  V.ring(p.x, p.y + 170, 520, ult.mode ? HOT : BLOOD, .45); V.sparks(p.x, p.y + 200, 'red', 26); E.addBlast(p.x, p.y + 170, RGB, 520);
  if (Z) { Z.flash(RGB, .35, .3); Z.shock(p.x, 800, RGB, .5, 14); }
  ult.music = sfx.tune('fight-alongside');
  for (const k of SLOTS) if (ULTS[ult.mode][k]) E.cd[k] = 0;      // the ult's own moves are there at once
  shownT = -1; relabel();
}
function endUlt(quiet) {
  const u = ult;
  if (!u) return;
  ult = null; clearInterval(watch);
  if (u.music) u.music.stop();
  if (u.paused && Fi.fight.paused) Fi.fight.paused = false;
  rain = null; drops.length = 0;
  if (on()) { relabel(); for (const k of SLOTS) E.cd[k] = Math.min(E.cd[k], E.CD[k]); T.drain(); }
  if (!quiet && on() && JU.manga) JU.manga.think(E.P1, u.mode ? '...REST NOW, BROTHERS.' : '...STAY SAFE, LITTLE BROTHER.', { life: 1.6 });
}
const awkEl = document.getElementById('awk');
function awkBar() {                                 // the bar while it lasts: the time left
  if (!ultOn() || !on()) return;
  const s = Math.max(0, Math.ceil(ult.t));
  if (s === shownT) return;
  shownT = s; awkEl.style.setProperty('--a', Math.max(0, ult.t / ULT_T)); awkEl.classList.remove('full');
  awkEl.lastElementChild.textContent = ULT_NAME[ult.mode] + ' · ' + s + 's';
}

/* ---------- BIG BROTHER 1: BLOOD RAIN. Blood thrown up into the sky, and for nine seconds it comes back down as rain: 2 a drop on whatever it
   falls on (the user's numbers). It goes on while he does other things ---------- */
const RAIN_T = 9, DROP_DMG = 2;
let rain = null;                                    // { t, acc, k (drops so far) }
const drops = [], splashes = [];                    // { x, y, z, vy, near }; { x, z, t }
const RAIN = { name: 'Blood Rain', cd: 14, dur: 1, glow: 'red', run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < .25 ? CLASP : t < .75 ? RAISE : POSE.idle;
  if (t >= .25 && !m.s) {
    m.s = 1; sfx.wave(); shake(16); MS.ono('血雨', p.x, p.y + 470, .8, BLOOD, 1);
    const w = E.hand(p, true);
    V.custom(.6, u => {                             // a column of it going straight up out of his hands
      const a = F(w[0], w[1]), b = F(w[0], w[1] + 1600 * Math.min(1, u * 2.5)), k = a[2], al = 1 - Math.max(0, u - .5) * 2;
      g.save(); g.lineCap = 'round'; g.globalAlpha = al;
      lit(() => { g.strokeStyle = `rgba(${RGB},.4)`; g.lineWidth = 60 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
      for (const [wd, col] of [[26, '#3d0612'], [17, BLOOD], [5, '#ffe3e6']]) { g.strokeStyle = col; g.lineWidth = wd * k; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      g.restore();
    });
  }
  if (t >= .7 && !m.r) { m.r = 1; rain = { t: RAIN_T, acc: 0, k: 0 };sfx.bloodRain(RAIN_T); label(p.x, p.y + 440, 'BLOOD RAIN', '#ffb3bd', 1.2); }
} };
function rainTick(dt) {
  const o = E.P2, hs = o.scale || 1;
  if (rain && (rain.t -= dt) <= 0) rain = null;
  if (rain) {
    const n = Math.floor((rain.acc += dt * 110));
    rain.acc -= n;
    for (let i = 0; i < n; i++) {                   // a quarter of it over them, the rest everywhere: about eight drops a second on them, 140 or so in all
      const near = rain.k++ % 4 === 0 && live(o), x = near ? o.x + rnd(-170, 170) : rnd(-1150, 1150);
      drops.push({ x, y: rnd(950, 1250), z: near ? ZP : ZP + rnd(-260, 320), vy: -rnd(1900, 2300), near });
    }
  }
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.y += d.vy * dt; d.x -= 60 * dt;
    if (Math.abs(d.z - ZP) < 90 && live(o) && Math.abs(o.x - d.x) < 46 * hs && d.y < o.y + 300 * hs && d.y > o.y) {      // on them
      drip(o, DROP_DMG); splashes.push({ x: d.x, y: d.y, z: d.z, t: 0, on: 1 }); drops.splice(i, 1);
      if (Math.random() < .3) sfx.drop();
      continue;
    }
    if (d.y <= 0) { splashes.push({ x: d.x, y: 0, z: d.z, t: 0 }); drops.splice(i, 1); }
  }
  if (drops.length > 500) drops.splice(0, drops.length - 500);
  for (let i = splashes.length - 1; i >= 0; i--) if ((splashes[i].t += dt) > .28) splashes.splice(i, 1);
  if (splashes.length > 160) splashes.splice(0, splashes.length - 160);
}
function drawRain() {
  g.save(); g.lineCap = 'round';
  for (const d of drops) {
    const a = P(d.x, d.y, d.z), b = P(d.x + 7, d.y + 70, d.z), k = a[2];
    g.strokeStyle = 'rgba(122,12,32,.75)'; g.lineWidth = 3.4 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    g.strokeStyle = 'rgba(255,90,110,.85)'; g.lineWidth = 1.3 * k; g.stroke();
  }
  for (const s of splashes) {
    const u = s.t / .28, c = P(s.x, s.y, s.z), k = c[2];
    g.strokeStyle = `rgba(224,32,60,${.8 * (1 - u)})`; g.lineWidth = 2 * k;
    g.beginPath(); g.ellipse(c[0], c[1], (6 + 26 * u) * k, (2 + 7 * u) * k, 0, 0, TAU); g.stroke();
    if (s.on) { g.fillStyle = `rgba(179,18,44,${1 - u})`; for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(c[0] + (j - 1) * 14 * u * k, c[1] - 18 * u * k * (j === 1 ? 1.4 : 1), 3 * k, 0, TAU); g.fill(); } }
  }
  g.restore();
}
function drawClouds(a) {                            // the sky it came out of: low, red-black, rolling
  const cv = g.canvas, W = cv.width, Hh = cv.height, T0 = E.T;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = `rgba(40,0,8,${.34 * a})`; g.fillRect(0, 0, W, Hh);
  for (let i = 0; i < 14; i++) {
    const x = ((i * 157 + T0 * (14 + i % 4 * 6)) % (W + 400)) - 200, y = Hh * (.03 + (i % 3) * .05), r = Hh * (.11 + (i % 4) * .03);
    const gr = g.createRadialGradient(x, y, r * .1, x, y, r);
    gr.addColorStop(0, `rgba(70,6,16,${.85 * a})`); gr.addColorStop(.7, `rgba(40,2,10,${.6 * a})`); gr.addColorStop(1, 'rgba(20,0,4,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  g.restore();
}

/* ---------- BIG BROTHER 2: WING KING (翅王, his brother's Maximum, which he borrows): wings of blood off his back, and for six seconds he strikes
   on his own, the ordinary strikes and never the last of the four, each at twice its damage; he goes after them if they get away. Then the
   wings take hold of them, the game slows for a moment, and they are slammed into the floor: 60 (the user's ask) ---------- */
const WING_T = 6, WING_SLAM = 60, REACH = 175;
let wing = null;                                    // { t, k (how far out the wings are), fin }
const WING = { name: 'Wing King', cd: 16, dur: .55, glow: 'red', run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < .35 ? SPREAD : POSE.idle;
  if (m.s) return;
  m.s = 1; wing = { t: WING_T, k: 0, fin: false, wait: 0 };
  sfx.wing(); sfx.bf(); shake(24); E.zoomIn(.4); MS.ono('翅王', p.x - p.face * 60, p.y + 480, .85, BLOOD, 1.1);
  label(p.x, p.y + 430, 'WING KING', '#ffb3bd', 1.2); V.sparks(p.x - p.face * 30, p.y + 240, 'red', 22);
  for (let i = 0; i < 14; i++) V.puff('red', p.x - p.face * rnd(10, 60), p.y + rnd(160, 300), -p.face * rnd(200, 700), rnd(100, 600), rnd(14, 26), rnd(.3, .6), -1400);
} };
const WING_FIN = { name: 'Wing King', dur: 1.1, glow: 'red', run(p, m, t) {
  const o = m.o, f = p.face;
  p.vx = 0; p.rate = 40;
  if (!m.s) { m.s = 1; facing(p, o); m.x0 = o ? o.x : 0; m.y0 = o ? o.y : 0; sfx.wing(); sfx.charge(); if (JU.manga) JU.manga.say(p, 'COME HERE!', { life: .9 }); }
  if (t < .34) {                                    // the wings take hold of them and drag them in
    p.target = SPREAD;
    if (o && live(o) && holdable(o)) { const u = ease(Math.min(1, t / .3)); Object.assign(o, { x: lerp(m.x0, clamp(p.x + f * 150, -980, 980), u), y: lerp(m.y0, 120, u), vx: 0, vy: 0, ground: false, state: 'hurt', stun: .6, act: null, tele: 0 }); }
    if (t >= .22 && !m.slow) { m.slow = 1; E.slow(.45); E.zoomIn(.7); if (o) MS.focus(o.x, mid(o), .5); sfx.beat(1); }
    return;
  }
  p.target = t < .7 ? POSE.crush : POSE.idle;
  if (m.hit) { if (t > .9) wing = null; return; }
  m.hit = 1;
  const x = clamp(p.x + f * 150, -980, 980);
  sfx.bf(); sfx.blast(); shake(46); V.crack(x, 420); V.rocks(x, 0, 18); E.addRing(x, '255,255,255', 480); E.addBlast(x, 90, RGB, 520);
  if (Z) Z.shock(x, 820, RGB, .5, 14);
  if (o && live(o) && (holdable(o) || Math.abs(o.x - p.x) < 420)) {
    if (holdable(o)) { o.x = x; o.y = 40; }
    E.applyHit(o, f, { dmg: exact(o, WING_SLAM), kb: 220, stun: 1, stop: .32, heavy: 1, col: BLOOD, fixed: 1 });
    if (!o.ko && !o.poise && holdable(o)) Object.assign(o, { ground: false, state: 'air', y: 30, vy: -1700, vx: f * 140, bounced: false });
    MS.bigHit(p, o, 'ドォン', BLOOD, 'red'); V.impact(.22, x, 120); C.ink(o.x, mid(o), f, 24, 1.5, WET);
  }
} };
function wingTick(dt) {
  const p = E.P1, o = E.P2;
  wing.k = Math.min(1, wing.k + dt / .3);
  if (p.dead || !on()) { wing = null; return; }
  if (wing.fin) { if (!(p.move && p.move.def === WING_FIN)) wing = null; return; }      // (the finish has the wings now; if it is cut short, they go)
  wing.t -= dt;
  if (wing.t <= 0) {                                // time: the finish, as soon as he can
    if (p.move && p.move.def.m1) E.endMove(p);
    if (!p.move && !p.ps) { wing.fin = true; p.move = { def: WING_FIN, t: 0, o: live(o) ? o : null }; }
    else if ((wing.wait += dt) > 1) wing = null;
    return;
  }
  if (p.chain === 3) p.chain = 0;                   // never the fourth: it would knock them away
  if (!free(p) || !live(o)) return;
  const d = Math.abs(o.x - p.x);
  p.face = o.x >= p.x ? 1 : -1;
  if (d > REACH) { p.x = clamp(p.x + p.face * Math.min(d - REACH + 10, 820 * dt), -965, 965); if (Math.random() < dt * 30) V.puff('red', p.x - p.face * 40, p.y + 200, -p.face * 300, 60, 22, .3); return; }      // after them
  if (up(o)) JU.game.press('m1');
}
function drawWings(p) {                             // two wings of blood off his shoulder blades, a beam running out along each feather
  const s = p.scale || 1, f = p.face, k0 = wing.fin ? 1 : wing.k, fin = p.move && p.move.def === WING_FIN, spread = fin && p.move.t < .5 ? 1.3 : 1, T0 = E.T;
  const root = [p.x - f * 18 * s, p.y + 236 * s];
  for (const side of [1, -1]) {                     // the far wing first, darker
    const far = side < 0, flap = Math.sin(T0 * 7 + (far ? .5 : 0)) * .12;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 2 + f * (.35 + i * .2) * spread + (far ? f * .12 : 0)) + flap * (1 + i * .2), len = (190 + i * 26 - (i > 3 ? (i - 3) * 40 : 0)) * k0 * s * (far ? .92 : 1);
      const tip = [root[0] + Math.cos(a) * len, root[1] + Math.sin(a) * len];      // (a leans back from straight up, whichever way he faces)
      const A = F(root[0], root[1]), B = F(tip[0], tip[1]), k = A[2], wd = (16 - i * 1.6) * k * k0;
      const nx = -(B[1] - A[1]), ny = B[0] - A[0], nl = Math.hypot(nx, ny) || 1;
      g.beginPath(); g.moveTo(A[0] + nx / nl * wd, A[1] + ny / nl * wd); g.quadraticCurveTo((A[0] + B[0]) / 2 + nx / nl * wd * 1.6, (A[1] + B[1]) / 2 + ny / nl * wd * 1.6, B[0], B[1]);
      g.quadraticCurveTo((A[0] + B[0]) / 2 - nx / nl * wd * .4, (A[1] + B[1]) / 2 - ny / nl * wd * .4, A[0] - nx / nl * wd * .5, A[1] - ny / nl * wd * .5); g.closePath();
      g.fillStyle = far ? '#5c0714' : (i % 2 ? WET : BLOOD); g.fill(); g.lineWidth = 2.5; g.strokeStyle = INKC; g.stroke();
      if (!far) lit(() => { g.strokeStyle = `rgba(255,170,180,${.55 + .3 * Math.sin(T0 * 12 + i)})`; g.lineWidth = 1.8 * k; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(lerp(A[0], B[0], .92), lerp(A[1], B[1], .92)); g.stroke(); });
    }
  }
  const c = F(root[0], root[1]);
  lit(() => E.glow(E.GLOW.red, c[0], c[1], 260 * c[2] * k0, .5));
  if (fin && p.move.t < .34 && p.move.o) {          // and their hold on them
    const o = p.move.o;
    g.save(); g.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const A = F(root[0], root[1] + (i - 1.5) * 30), B = F(o.x, mid(o) + (i - 1.5) * 40); g.strokeStyle = INKC; g.lineWidth = 7 * A[2]; g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo((A[0] + B[0]) / 2, Math.min(A[1], B[1]) - 60, B[0], B[1]); g.stroke(); g.strokeStyle = BLOOD; g.lineWidth = 4 * A[2]; g.stroke(); }
    g.restore();
  }
}

/* ---------- BIG BROTHER 3: PLASMA WAVE. Convergence until the blood in his hands is white, and then all of it let go as a wave too hot to be
   red any more: it crosses the arena, crackling, and goes through them three times as it passes (28, 28, 40) ---------- */
const PLASMA_DMG = [28, 28, 40];
let plasma = null;                                  // { x, x0, f, t, n, next, out }
const PLASMA = { name: 'Plasma Wave', cd: 14, dur: 1.5, glow: 'red', run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.rate = 30;
  if (t < .75) {
    p.target = CLASP;
    if (!m.c) { m.c = 1; facing(p, o); sfx.plasma(); MS.ono('百斂', p.x, p.y + 440, .7, PALE, .8); }
    if (live(o)) p.face = o.x >= p.x ? 1 : -1;
    if (Math.random() < .7) { const w = E.hand(p, true); V.mote(w[0] + p.face * 20, w[1], Math.random() < .5 ? 'red' : 'white'); }
    return;
  }
  p.target = t < 1.1 ? POSE.div : POSE.idle;
  if (m.s) return;
  m.s = 1; const f = p.face;
  plasma = { x: p.x + f * 80, x0: p.x + f * 80, f, t: 0, n: 0, next: 0, out: 0 };
  sfx.plasmaGo(); shake(40); E.zoomIn(.5); E.addBlast(p.x + f * 120, 170, '255,160,200', 520);
  if (Z) { Z.flash('255,200,225', .4, .25); Z.shock(p.x + f * 120, 900, '255,120,170', .5, 14); }
  label(p.x, p.y + 440, 'PLASMA WAVE', PALE, 1.2);
} };
function plasmaTick(dt) {
  const s = plasma, o = E.P2, hs = o.scale || 1;
  s.t += dt;
  if (s.out) { if ((s.out += dt) > .5) plasma = null; return; }
  s.x += s.f * 1550 * dt;
  if (Math.random() < dt * 30) V.puff(Math.random() < .5 ? 'red' : 'white', s.x - s.f * rnd(0, 200), rnd(60, 340), s.f * rnd(100, 300), rnd(50, 300), rnd(20, 40), .3);
  if (live(o) && s.n < 3 && Math.abs(o.x - s.x) < 210 * hs && (o.x - s.x0) * s.f > -80 && o.y < 520 && (s.next -= dt) <= 0) {      // going through them
    const last = s.n === 2;
    s.next = .065;                                  // (all three while it is still over them: it is quick)
    E.applyHit(o, s.f, last ? { dmg: exact(o, PLASMA_DMG[s.n]), kb: 1300, lift: 700, stun: 1, stop: .22, heavy: 1, col: '#ff9ac8', fixed: 1 }
                            : { dmg: exact(o, PLASMA_DMG[s.n]), kb: 200, stun: .7, stop: .08, col: '#ff9ac8', fixed: 1 });
    s.n++; V.sparks(o.x, mid(o), 'red', 12); V.sparks(o.x, mid(o), 'white', 8); shake(18);
    if (last) { MS.bigHit(E.P1, o, 'バチッ', '#ff9ac8', 'neg'); V.impact(.14, o.x, mid(o)); }
  }
  if ((s.x - s.x0) * s.f > 1900 || Math.abs(s.x) > 1250) s.out = .001;
}
function drawPlasma() {
  const s = plasma, f = s.f, fade = s.out ? Math.max(0, 1 - s.out / .5) : 1, Hh = 380 * fade * Math.min(1, s.t * 6 + .2), len = Math.min(Math.abs(s.x - s.x0) + 80, 760), T0 = E.T, N = 22;
  const top = Array.from({ length: N + 1 }, (_, i) => { const v = i / N; return [s.x - f * len * (1 - v), Hh * (.12 + .88 * v ** 1.6) * (1 + .1 * Math.sin(v * 13 - T0 * 16) + .05 * Math.sin(v * 31 + T0 * 9))]; });
  const body = k => {
    let c = F(s.x - f * len, 0), was = c;
    g.beginPath(); g.moveTo(c[0], c[1]);
    for (const q of top) { c = F(q[0], q[1] * k); g.quadraticCurveTo(was[0], was[1], (was[0] + c[0]) / 2, (was[1] + c[1]) / 2); was = c; }
    g.lineTo(c[0], c[1]);
    const lip = F(s.x + f * 130 * k, Hh * .58 * k), foot = F(s.x + f * 50, 0);
    g.quadraticCurveTo(lip[0], lip[1], foot[0], foot[1]); g.closePath();
  };
  const crest = F(s.x - f * 40, Hh * .6);
  g.save(); g.lineJoin = 'round';
  lit(() => { E.glow(E.GLOW.red, crest[0], crest[1], 1100 * crest[2], .7 * fade); E.glow(E.GLOW.white, crest[0], crest[1], 520 * crest[2], .55 * fade); });
  g.globalAlpha = fade;
  body(1); g.fillStyle = '#3a0a2a'; g.fill(); g.strokeStyle = '#16020e'; g.lineWidth = 3; g.stroke();
  body(.82); g.fillStyle = '#e0205c'; g.fill();
  body(.6); g.fillStyle = '#ff7ab4'; g.fill();
  lit(() => {
    g.globalAlpha = .9 * fade; body(.4); g.fillStyle = '#fff1f8'; g.fill();
    for (let i = 0; i < 4; i++) { const v = rnd(.15, .95), y = Hh * rnd(.2, .9), x = s.x - f * len * (1 - v); arc(x, y, x + f * rnd(60, 160), y + rnd(-120, 120), `rgba(255,${200 + (Math.random() * 55 | 0)},245,${.9 * fade})`, 2.2); }
    for (let i = 0; i < 2; i++) { const x = s.x - f * rnd(0, len * .6); arc(x, Hh * rnd(.5, 1), x + rnd(-80, 80), Hh * rnd(1.05, 1.35), `rgba(255,220,240,${.8 * fade})`, 1.8, 5); }
  });
  g.restore();
}

/* ---------- DEATH PAINTING 1: NINE STAGES (九相). In at them, and nine blows, one for each of the nine, each its own shape of blood: 8 each,
   and the ninth 40 ---------- */
const NINE_POSE = ['jab', 'cross', 'hook', 'kick', 'div', 'cross', 'manji', 'hook', 'crush'];
const NINE = { name: 'Nine Stages', cd: 10, dur: 1.8, glow: 'red', run(p, m, t) {
  const o = E.P2, gap = (o.x - p.x) * p.face, f = p.face;
  p.rate = 60;
  if (m.got === undefined) {
    if (!m.s) { m.s = 1; facing(p, o); sfx.whoosh(); }
    if (t > .35) { p.vx = 0; p.target = POSE.idle; if (t > .5) E.endMove(p); return; }
    p.target = POSE.dash; p.vx = gap > 140 ? f * 1600 : 0;
    if (gap > -30 && gap < 190 && live(o) && up(o)) { m.got = t; m.n = 0; p.vx = 0; p.inv = Math.max(p.inv || 0, 1.4); }
    return;
  }
  const u = t - m.got;
  p.vx = 0;
  if (holdable(o) && m.n < 9) Object.assign(o, { x: clamp(p.x + f * 140, -980, 980), vx: 0, state: 'hurt', stun: .5, act: null, tele: 0 });
  while (m.n < 9 && u >= m.n * .1) {
    const i = m.n++, last = i === 8;
    p.target = POSE[NINE_POSE[i]];
    MS.ono('一二三四五六七八九'[i], (o ? o.x : p.x) + rnd(-70, 70), (o ? o.y : 0) + rnd(280, 380), last ? 1.1 : .55, i % 3 === 2 ? ROT : BLOOD, .6);
    if (i % 3 === 1) V.custom(.16, uu => crescent(p.x + f * 120, p.y + 175, 120, (f > 0 ? 0 : Math.PI) + (i & 1 ? .6 : -.6) * f, 11, 1 - uu));
    else V.slash(p.x + f * 130, p.y + rnd(130, 220), rnd(-.5, .5) + (f > 0 ? 0 : Math.PI), 230, BLOOD, 10);
    sfx.cut(last ? 1.8 : 1); if (!last) sfx.hit(false);
    if (!live(o)) continue;
    if (last) { E.applyHit(o, f, { dmg: exact(o, 40), kb: 1200, lift: 760, stun: 1, stop: .28, heavy: 1, col: BLOOD, fixed: 1 }); MS.bigHit(p, o, '九相', BLOOD, 'red'); C.ink(o.x, mid(o), f, 24, 1.5, WET); shake(40); }
    else { E.applyHit(o, f, { dmg: exact(o, 8), kb: 0, stun: .6, stop: .04, col: BLOOD, fixed: 1, mute: 1 }); C.ink(o.x, mid(o), f, 5, .7, WET); shake(8); }
  }
  if (m.n >= 9 && u > 1.25) E.endMove(p);
} };
/* ---------- DEATH PAINTING 2: CRIMSON CRUCIFIX. Ropes round them, a cross of hardened blood up out of the floor behind them with them on it,
   and then a meteorite of it into the cross: 20 for the ropes and the cross, 70 for the rock ---------- */
let cross = null;                                   // { o, x, t }
const CRUX = { name: 'Crimson Crucifix', cd: 12, dur: 2.1, glow: 'red', run(p, m, t) {
  const o = E.P2, f = p.face;
  p.vx = 0; p.rate = 36;
  if (!m.s) {
    m.s = 1; facing(p, o); sfx.charge();
    m.o = live(o) && Math.abs(o.x - p.x) < 900 && up(o) ? o : null;
    if (m.o) { E.applyHit(m.o, f, { dmg: exact(m.o, 20), kb: 0, stun: 1, stop: .1, col: BLOOD, fixed: 1, mute: 1 }); cross = { o: m.o, x: m.o.x + f * 40, t: 0 }; sfx.blast(); shake(20); MS.ono('磔', m.o.x, m.o.y + 460, .9, BLOOD, 1); }
    else label(p.x, p.y + 420, 'NOTHING TO HOLD', '#ffb3bd', .8);
  }
  const q = m.o;
  p.target = t < .3 ? CLASP : t < 1.2 ? POSE.hookWind : t < 1.5 ? POSE.div : POSE.idle;
  if (q && cross && holdable(q) && t < 1.3) Object.assign(q, { x: cross.x - f * 40, y: lerp(q.y, 90, Math.min(1, t * 4)), vx: 0, vy: 0, ground: false, state: 'hurt', stun: .5, act: null, tele: 0, face: -f });
  if (t >= 1.2 && !m.r) {
    m.r = 1; const w = E.hand(p, true);
    sfx.whoosh(); m.rx = w[0]; m.ry = w[1];
  }
  if (m.r && !m.hit) {                              // the rock on its way
    const u = Math.min(1, (t - 1.2) / .16), tx = q ? q.x : p.x + f * 500, ty = q ? mid(q) : 200;
    m.rkx = lerp(m.rx, tx, u); m.rky = lerp(m.ry, ty, u);
    if (u >= 1) {
      m.hit = 1; burst(tx, ty, 1.6); cross = null; shake(40);
      if (q && live(q)) {
        E.applyHit(q, f, { dmg: exact(q, 70), kb: 1300, lift: 620, stun: 1, stop: .3, heavy: 1, col: BLOOD, fixed: 1 });
        if (holdable(q) && !q.ko) Object.assign(q, { ground: false, state: 'air', bounced: false });
        MS.bigHit(p, q, 'ゴッ', BLOOD, 'red'); C.ink(q.x, mid(q), f, 26, 1.6, WET);
      }
    }
  }
  if (!q && t > .6) E.endMove(p);
} };
function drawCross() {                              // the cross: up out of the floor, dark, with its edges lit
  const s = cross, u = Math.min(1, s.t / .25), x = s.x, tall = 420 * ease(u), arm = 300 * ease(u);
  const box = (x0, y0, x1, y1) => { const a = F(x0, y0), b = F(x1, y1); g.beginPath(); g.rect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])); };
  lit(() => { const c = F(x, tall * .6); E.glow(E.GLOW.red, c[0], c[1], 500 * c[2], .5); });
  for (const [x0, y0, x1, y1] of [[x - 26, 0, x + 26, tall], [x - arm / 2, tall * .62, x + arm / 2, tall * .62 + 46]]) {
    box(x0, y0, x1, y1); g.fillStyle = '#4a0712'; g.fill(); g.lineWidth = 3; g.strokeStyle = INKC; g.stroke();
    box(x0 + 8, y0 + 4, x0 + 16, y1 - 4); g.fillStyle = 'rgba(255,120,140,.6)'; g.fill();
  }
}
/* ---------- DEATH PAINTING 3: DECAY (朽). His brothers' Rot Technique: blood that rots, thrown onto them. It flowers where it lands, takes 3 a
   quarter of a second for five seconds (60), without staggering, and while it does they move and strike at three quarters of their speed ---------- */
const ROT_T = 5, ROT_DMG = 3;
let gob = null, rot = null;                         // the throw; { o, t, acc, marks }
const DECAY = { name: 'Decay', cd: 15, dur: .8, glow: 'red', run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.rate = 40; p.target = t < .2 ? POSE.hookWind : t < .5 ? POSE.hook : POSE.idle;
  if (!m.s) { m.s = 1; facing(p, o); sfx.charge(); }
  if (t >= .2 && !m.g) {
    m.g = 1; sfx.whoosh(); sfx.splat();
    const w = E.hand(p, true), tx = live(o) ? o.x : p.x + p.face * 500;
    gob = { x: w[0], y: w[1], vx: (tx - w[0]) / .35, vy: 520, t: 0 };
    MS.ono('朽', p.x + p.face * 90, p.y + 400, .8, ROT, .8);
  }
} };
function gobTick(dt) {
  const s = gob, o = E.P2, hs = o.scale || 1;
  s.t += dt; s.vy -= 2200 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
  if (Math.random() < .9) V.puff('green', s.x, s.y, -s.vx * .1, 40, 18, .25);
  if (live(o) && Math.abs(o.x - s.x) < 70 * hs && s.y < o.y + 320 * hs && s.y > o.y - 20) {
    gob = null; sfx.splat(); sfx.blast(); V.sparks(o.x, mid(o), 'green', 14);
    E.applyHit(o, o.x >= E.P1.x ? 1 : -1, { dmg: 6, kb: 120, stun: .6, stop: .08, col: ROT });
    rot = { o, t: ROT_T, acc: 0, marks: Array.from({ length: 7 }, () => [rnd(-40, 40), rnd(30, 290), rnd(.6, 1.2), rnd(0, TAU)]) };
    label(o.x, o.y + 440 * hs, 'DECAY', ROT, 1.2);
    return;
  }
  if (s.y <= 0 || s.t > 1.4) { gob = null; V.sparks(s.x, 20, 'green', 8); }
}
function rotTick(dt) {
  const r = rot, o = r.o;
  if (!live(o) || o !== E.P2 || (r.t -= dt) <= 0) { rot = null; return; }
  r.acc += dt;
  while (r.acc >= .25) { r.acc -= .25; drip(o, ROT_DMG, ROT); }
  if (Math.random() < dt * 14) V.puff('green', o.x + rnd(-40, 40), o.y + rnd(40, 280) * (o.scale || 1), 0, rnd(60, 160), 22, .5);
}
function drawRot() {                                // the marks it leaves on them, flowering as it goes on
  const r = rot, o = r.o, s = o.scale || 1, grow = Math.min(1, (ROT_T - r.t) / 1.5), T0 = E.T;
  for (const [dx, dy, sz, rot0] of r.marks) {
    const c = F(o.x + dx * s, o.y + dy * s), k = c[2], R = 18 * sz * grow * k;
    g.save(); g.translate(c[0], c[1]); g.rotate(rot0 + T0 * .3);
    g.fillStyle = ROTD; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(Math.cos(i * TAU / 5) * R * .7, Math.sin(i * TAU / 5) * R * .7, R * .55, R * .3, i * TAU / 5, 0, TAU); g.fill(); }
    g.fillStyle = ROT; g.beginPath(); g.arc(0, 0, R * .45, 0, TAU); g.fill();
    g.restore();
  }
}

/* ================= the moves, by mode and ult ================= */
const SETS = [{ strikes: OLD.strikes, crush: OLD.crush, div: OLD.div, manji: OLD.manji }, { strikes: BEDGE, crush: BIND, div: METEOR, manji: EMBRACE }];
const ULTS = [{ strikes: RAIN, crush: WING, div: PLASMA }, { strikes: NINE, crush: CRUX, div: DECAY }];
function cur(k) {
  if (!on()) return SETS[0][k];
  return (ultOn() && ULTS[ult.mode][k]) || SETS[mode][k];
}
DEF.moves = { get strikes() { return cur('strikes'); }, get crush() { return cur('crush'); }, get div() { return cur('div'); }, get manji() { return cur('manji'); } };
DEF.awaken = awaken; DEF.awkKeep = true;
Object.defineProperty(DEF, 'awkName', { get() { return ULT_NAME[ult ? ult.mode : mode]; }, configurable: true });
Object.defineProperty(DEF, 'awkHits', { get() { return !ult; }, configurable: true });
DEF.hint = '<b>Right click</b> switch mode · <b>Hold 4</b> Piercing Blood · <b>G</b> the mode\'s ult';

const strip = MS.strip('bbm', MODES.map(d => ({ short: d.short, keys: 'RMB', col: d.col })));
function relabel() {
  if (!on()) { E.root.classList.remove('bbmon'); return; }
  for (const k of SLOTS) { const d = cur(k); E.hud.mv[k].querySelector('b').textContent = d.name; E.CD[k] = d.cd; }
  strip.paint(mode); E.root.classList.add('bbmon');
  if (T.refresh) T.refresh();
}
function setMode(i) {
  if (!on() || i === mode) return;
  const p = E.P1;
  if (ult) { label(p.x, p.y + 470, 'THE ULT HOLDS THE MODE', PALE, .8); sfx.back(); return; }
  for (const k of SLOTS) waits[mode][k] = E.cd[k];
  mode = i;
  for (const k of SLOTS) E.cd[k] = waits[mode][k];
  relabel();
  const d = MODES[mode];
  label(p.x, p.y + 470, d.short, d.col, .9); sfx.charge(); sfx.splat();
  V.ring(p.x, p.y + 160, 230, d.col, .25); V.sparks(p.x, p.y + 190, 'red', 10);
  if (Z) Z.flare(p.x, p.y + 180, d.rgb, 300, .2);
  if (mode) MS.ono('載', p.x + p.face * 40, p.y + 390, .7, HOT, .6);
}
// a move of his started from here (the engine only starts them on the floor): its slot's cooldown is spent
function go(p, def, k, extra) {
  if (p.move) E.endMove(p);
  E.cd[k] = E.CD[k]; p.move = Object.assign({ def, key: k, t: 0 }, extra); E.hud.mv[k].classList.add('act');
  return true;
}
function special(p, a) {
  const air = !p.ground, ready = !(E.cd[a] > 0), busy = p.move && !p.move.def.m1;
  if (p.ps || p.dead || (p.move && INTRO.includes(p.move.def))) return false;
  if (ultOn() && ULTS[ult.mode][a]) return air && !busy && !(p.dashT > 0) && ready ? go(p, ULTS[ult.mode][a], a) : false;      // (in the air too)
  if (mode === 0) {
    if (a === 'div' && exo && E.T - exo.at < 1.4 && live(exo.o) && ready && (!busy || (p.move.def === OLD.strikes && p.move.t > .3))) { const o = exo.o; exo = null; return go(p, CRIMSON, a, { o }); }
    if (a === 'manji' && bound && ready && (!busy || p.move.def === BIND)) return go(p, TETHER, a, { o: bound.o });
    if (air && !busy && !(p.dashT > 0) && ready) { if (a === 'div') return go(p, HAIL, a); if (a === 'manji') return go(p, NEEDLE, a); }
  } else {
    if (a === 'strikes' && bound && ready && (!busy || p.move.def === BIND)) return go(p, EXEC, a, { o: bound.o });
    if (air && a === 'strikes' && !busy && !(p.dashT > 0) && ready) return go(p, WHIRL, a);
    if (air && a === 'crush') return true;          // (not Flowing Red Scale's dive: in this mode 2 is the ropes, and they want the floor)
  }
  return false;
}

/* ================= wiring ================= */
const press0 = H.press, tick0 = H.tick, fx0 = H.fx, under0 = H.under, pow0 = H.power, rate0 = H.m1rate, hit0 = H.hit, rim0 = H.rim, reset0 = H.reset, start0 = H.fightStart, foeRate0 = H.foeRate;
H.press = (a, inScene) => {
  if (!inScene && on() && E.root.dataset.mode === 'fight' && !E.P1.dead) {
    if (a === 'alt') { setMode(1 - mode); return true; }      // (two modes: right click, and F + right click, both go to the other one)
    if (SLOTS.includes(a) && special(E.P1, a)) return true;
  }
  return press0 ? press0(a, inScene) : false;
};
H.power = (h, o) => {
  let k = pow0 ? pow0(h, o) : 1;
  const m = E.P1.move;
  if (on() && o !== E.P1 && m && m.def.m1 && !h.fixed) { if (mode === 1) k *= STACK_POW; if (wing) k *= 2; }      // Stack's strikes; Wing King's, doubled
  return k;
};
H.m1rate = () => (rate0 ? rate0() : 1) * (on() && mode === 1 ? STACK_RATE : 1);
H.foeRate = o => (foeRate0 ? foeRate0(o) : 1) * (rot && rot.o === o ? .75 : 1);
H.hit = (o, face, h) => {
  hit0(o, face, h);
  const m = E.P1.move;
  if (on() && m && m.def === OLD.strikes && !h.fixed) exo = { o, at: E.T };      // Slicing Exorcism has landed: a Crimson Supernova is there to be had
};
H.rim = f => {
  const r = rim0 ? rim0(f) : null;
  if (!r || f !== E.P1 || !on()) return r;
  if (mode === 1) r.col = HOT;
  if (ultOn()) r.blur = (r.blur || 6) + 5 + 3 * Math.sin(E.T * 14);
  return r;
};
H.tick = dt => {
  tick0(dt);
  tint += ((ult && ult.sky ? 1 : 0) - tint) * (1 - Math.exp(-dt * 3));
  if (!on()) {
    if (ult) endUlt(true);
    rain = wing = plasma = rock = bound = gob = rot = cross = exo = null; hail.length = drops.length = 0;
    if (E.root.classList.contains('bbmon')) E.root.classList.remove('bbmon');
    return;
  }
  const p = E.P1;
  for (let i = 0; i < 2; i++) if (i !== mode) for (const k of SLOTS) if (waits[i][k] > 0) waits[i][k] = Math.max(0, waits[i][k] - dt);
  if (ult) {
    if (p.dead) endUlt(true);
    else if (!ult.intro) {
      ult.t -= dt; awkBar();
      if (Math.random() < dt * 16) V.mote(p.x, p.y + 230, 'red');
      if (ult.t <= 0) endUlt();
    }
  }
  if (mode === 1 && !p.dead) {                      // Stack: the blood in him is that hot
    const dir = (E.keys.has('d') || E.keys.has('arrowright') ? 1 : 0) - (E.keys.has('a') || E.keys.has('arrowleft') ? 1 : 0);
    if (free(p) && p.ground && dir) p.x = clamp(p.x + dir * 360 * STACK_WALK * dt, -965, 965);
    if (Math.random() < dt * 18) V.puff('red', p.x + rnd(-40, 40), p.y + rnd(30, 260), rnd(-30, 30), rnd(140, 280), 24, .45);
  }
  if (bound) {
    const o = bound.o;
    if (!live(o) || o !== E.P2 || o.state === 'air' || o.state === 'down' || (bound.t -= dt) <= 0) bound = null;
    else {
      if (bound.pull < 1) { bound.pull = Math.min(1, bound.pull + dt / .25); const want = clamp(p.x + (o.x >= p.x ? 1 : -1) * 160, -980, 980); if (Math.abs(o.x - p.x) > 160) o.x = lerp(o.x, want, Math.min(1, dt * 14)); }
      Object.assign(o, { state: 'hurt', stun: Math.max(o.stun || 0, .2), act: null, tele: 0, vx: 0 });
    }
  }
  if (exo && E.T - exo.at > 1.4) exo = null;
  if (rock) rockTick(dt);
  if (hail.length) hailTick(dt);
  if (rain || drops.length || splashes.length) rainTick(dt);
  if (wing) wingTick(dt);
  if (plasma) plasmaTick(dt);
  if (cross) cross.t += dt;
  if (gob) gobTick(dt);
  if (rot) rotTick(dt);
};
H.under = dt => {
  under0(dt);
  if (tint > .01 && on()) drawClouds(tint * (ult && ult.mode ? .7 : 1));
  if (!on()) return;
  if (cross) drawCross();
  if (wing) drawWings(E.P1);
};
H.fx = dt => {
  fx0(dt);
  if (!on()) return;
  const p = E.P1, m = p.move;
  if (m && m.def === BIND && m.rope > 0 && !m.done) ropeTo(p, p.x + p.face * m.rope, p.y + 175);
  if (bound) { ropeTo(p, bound.o.x, mid(bound.o), .95, 2); drawBound(bound.o); }
  if (m && m.def === METEOR && m.fired === undefined) { const w = E.hand(p, true); drawRock(w[0] + p.face * 26, w[1] + 4, (12 + 14 * Math.min(1, m.t / MET_MIN)) * (1 + m.c * .9), E.T * 3, .6 + .4 * m.c); }
  if (rock) drawRock(rock.x, rock.y, rock.r, rock.spin);
  if (m && m.def === EMBRACE) drawEmbrace(p, m);
  if (m && m.def === CRIMSON) drawCrimson(m);
  for (const b of hail) orb(b.x, b.y, 11, 'red', DARK);
  if (m && m.def === CRUX && m.r && !m.hit && m.rkx !== undefined) drawRock(m.rkx, m.rky, 40, E.T * 12);
  if (gob) { orb(gob.x, gob.y, 14, 'green', ROTD); }
  if (rot) drawRot();
  if (plasma) drawPlasma();
  if (drops.length || splashes.length) drawRain();
  if (m && m.def === PLASMA && m.t < .75) {         // the blood between his palms going white
    const w = E.hand(p, true), c = F(w[0] + p.face * 26, w[1] + 4), k = c[2], u = Math.min(1, m.t / .75);
    lit(() => { E.glow(E.GLOW.red, c[0], c[1], (160 + 300 * u) * k, .7); E.glow(E.GLOW.white, c[0], c[1], (60 + 160 * u) * k, .6 + .4 * u); for (let i = 0; i < 3; i++) arc(w[0] + p.face * 26, w[1] + 4, w[0] + p.face * 26 + rnd(-120, 120) * u, w[1] + rnd(-120, 120) * u, 'rgba(255,220,240,.9)', 1.6, 4); });
  }
};
const clear = () => { rain = wing = plasma = rock = bound = gob = rot = cross = exo = null; hail.length = drops.length = splashes.length = 0; };
H.reset = () => { reset0(); endUlt(true); clear(); tint = 0; for (const w of waits) for (const k of SLOTS) w[k] = 0; };
H.fightStart = (cfg, wave) => {
  start0(cfg, wave);
  clear();
  if (!wave) { endUlt(true); tint = 0; }
  if (on()) relabel(); else E.root.classList.remove('bbmon');
};

JU.brother = { MODES, SETS, ULTS, BEDGE, BIND, METEOR, EMBRACE, HAIL, NEEDLE, CRIMSON, WHIRL, EXEC, TETHER, RAIN, WING, WING_FIN, PLASMA, NINE, CRUX, DECAY, INTRO, setMode,
  get mode() { return mode; },
  get ult() { return ult && { mode: ult.mode, t: +ult.t.toFixed(2), intro: ult.intro, music: !!ult.music }; },
  get state() { return { mode, bound: bound && +bound.t.toFixed(2), rain: rain && +rain.t.toFixed(2), drops: drops.length, wing: wing && { t: +wing.t.toFixed(2), fin: wing.fin }, plasma: plasma && { x: Math.round(plasma.x), n: plasma.n },
    rock: rock && { x: Math.round(rock.x), dmg: +rock.dmg.toFixed(1) }, hail: hail.length, exo: !!exo, cross: !!cross, rot: rot && +rot.t.toFixed(2), waits: waits.map(w => Object.values(w).map(v => +v.toFixed(1))) }; } };
})();
