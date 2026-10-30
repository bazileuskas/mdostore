/* JUJUTSU UNLIMITEDS — early access (Build 0.21): DOUBLE OR NOTHING. A gambler who lives for the fever: kicks for strikes, pachinko balls,
   train doors, and cursed energy so rough it grinds. The user asked for the gambler of Jujutsu Shenanigans' moveset (Reserve Balls, Shutter
   Doors, Rough Energy, Fever Breaker, a door counter), a gambling name of three words, five strikes that are all legs and light his legs up
   green, and four combos of their own (below). 0.21v1, the user again: more damage; the doors are a train's (their picture: grey, a dark
   frame, a window high up, a handle, a paler kick plate), not a casino's; no skin of his own, so he looks as the player does; an uppercut
   and a down slam; and the last kick no longer sends them flying: a door comes across into them and they tumble. 0.21v2, the user:
   Reserve Balls a shot on a straight line, not something thrown; and the jackpot (4, 3, 2) a bit harder.
   STRIKES: five kicks (6, 6, 6, 7, then the last), his legs lit green for each. The last: held jump on the ground = an uppercut (14, up they
     go); in the air = a down slam (28, into the floor); otherwise a kick (12) and a door slammed into them that sends them tumbling (10)
   1 RESERVE BALLS: a pachinko ball shot at them on a straight line, as fast as a shot: 20 and a stun (0.21v2: no arc and no bounce)
   2 SHUTTER DOORS: a train's doors slam shut on them from either side: 25, and shut in there for 1.6 seconds
   3 ROUGH ENERGY: rough cursed energy gathered into his leg and let go in one kick: 42, and they go flying
   4 FEVER BREAKER: kicked back into a door that has come up behind them (20), and kicked off it the length of the arena (30)
   E BOUNCER DOORS: doors in front of him for 0.9 seconds. A blow into them comes straight back through them: 60. A shot only breaks them
   COMBOS (the user's own):
     1 then 2 (the ball still out): the doors close where the ball comes down
     1 then 3 (the ball still out, or just come off them), or 3 then 1 (while the energy gathers): he jumps on the ball and rides it 0.7
       seconds; when it comes down
       near them, Rough Energy, and it cannot miss (48)
     4 then 2 (before the second kick): the doors shut on them (15), and in place of the kick a leg brought down on them full of rough
       energy (45)
     4 then 3 then 2: in place of the second kick the doors hold them, the reels spin up over them and stop on 7 7 7, and he kicks the
       rough energy through the doors and them (110)
   Sounds: clips from myinstants (a metal door, a door slammed, a door kicked in, a hard kick, reels, a jackpot: home-gb-* at home), and built
   ones (sfx.ball, click, door, rough, ding). The anime has no clean sound effects of these on myinstants, only voices. 0.21v3, the user: the
   ball's pachinko clip was like an alarm. Gone: a click as the ball leaves his hand, and a clack and a hit when it lands on them */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, M = E.MOVES, Fi = JU.fights, Z = JU.bossfx;
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const exact = (o, n) => n / (o.dr || 1);            // a hit worth the stated amount, whatever the target is made of
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const play = (name, vol, alt) => { if (!sfx.file(name, vol) && alt) alt(); };      // a clip (myinstants' online, sounds/home-* at home), or a built one
sfx.preload(['home-gb-door', 'home-gb-slam', 'home-gb-jackpot', 'home-gb-reels', 'home-gb-kick', 'home-gb-bust']);
const GREEN = '#3cf08a', GRGB = '60,240,138', GOLD = '#ffd24a', DRGB = '255,210,74';
const live = o => !!o && !o.ko && !(o.alpha < 1);
const hs = o => o.scale || 1;
const mid = o => o.y + 170 * hs(o);
const can = (p, o) => p === E.P1 && !!o && !duel() && !o.net && !o.poise && !o.ko;      // may he move them about (his own moves, on a body this game runs)
const label = (x, y, n, col, life = 1.2) => E.fx.push({ k: 2, x, y, n, col, t: 0, life });
const handAt = (f, front) => { const h = E.hand(f, front), s = hs(f); return [f.x + (h[0] - f.x) * s, f.y + (h[1] - f.y) * s]; };
// where a foot is in the world: the engine draws the legs from the hip, unleaned (game.js drawFighter), so this is hand() for legs
const LEG = 76, K = 1.3;
function footAt(f, front) {
  const ps = f.pose, a = front ? ps[4] : ps[5], rot = ps[6], ox = front ? 8 : -8, s = hs(f);
  const hip = lerp(Math.max(Math.cos(ps[4]), Math.cos(ps[5]), .3) * LEG, 17, Math.min(1, Math.abs(rot) / 1.4));
  const x = ox + Math.sin(a) * LEG, y = Math.cos(a) * LEG, cr = Math.cos(rot), sr = Math.sin(rot);
  return [f.x + (x * cr - y * sr) * f.face * K * (f.spin === undefined ? 1 : f.spin) * s, f.y - (x * sr + y * cr - hip) * K * s];
}

/* ================= how he looks: as the player does (no skin of his own: the user's), his legs lit green while he kicks ================= */
const GREEN_LEGS = { legF: ['#2fd97a', '#86ffbf', '#d8ffe9', '#f2fff7', .17], legB: ['#1f9a56', '#4cc986', '#a8e9c6', '#c6f2da', .17] };
const hot = new Map(), cool = new Map();            // a look with green legs, made once for each look he has; and back
function greenOf(sk) { if (cool.has(sk)) return sk; if (!hot.has(sk)) { const h = Object.assign({}, sk, GREEN_LEGS); hot.set(sk, h); cool.set(h, sk); } return hot.get(sk); }
const unGreen = sk => cool.get(sk) || sk;
Object.assign(POSE, {
  gbFront: [-.35, 0, .55, -.7, 1.45, -.15, 0],
  gbRound: [-.52, .1, .95, -.35, 1.78, -.05, 0],
  gbKneeW: [.05, 0, 1.3, .9, .5, -.3, 0], gbKnee: [.2, 0, 1.25, .95, 1.12, -.35, 0],
  gbHookW: [.1, 0, .9, .9, .3, -.2, 0], gbHook: [-.55, -.1, .5, 1, -.15, 1.85, 0],
  gbAxeW: [-.32, -.12, 1.5, 1.35, 2.75, -.2, 0], gbAxe: [.38, .12, .9, .6, .95, -.45, 0],
  gbThrow: [.3, -.05, 1.85, .3, .5, -.45, 0],        // the ball flung
  gbSnap: [-.05, -.12, 2.5, .6, .32, -.32, 0],       // a hand up: doors
  gbCharge: [-.18, .05, .8, 1.6, .5, -.55, 0],       // rough energy gathering, low
  gbSurf: [.12, -.1, 2.1, 1.25, .5, -.6, 0],         // riding the ball
  gbGuard: [.05, 0, 1.95, 1.75, .4, -.4, 0],         // behind his doors
  gbUp: [-.45, -.25, 1.2, .5, 2.95, -.3, 0],          // a kick straight up: the uppercut
  gbDive: [.2, .15, 2.4, 2.2, 1.1, .4, 0]             // coming down on them, heel first
});

/* ================= his strikes: five kicks ================= */
const KICK_DEF = [['kickWind', 'gbFront', 6, 185, 180], ['gbFront', 'gbRound', 6, 190, 190], ['gbKneeW', 'gbKnee', 6, 150, 200], ['gbHookW', 'gbHook', 7, 195, 240]];
const KICKS = KICK_DEF.map(([pre, pose, dmg, reach, kb], i) => Object.assign({}, M.m1[i], {
  pre, pose, n: 5, kick: 1, lunge: 230 + i * 25, strike: .08, dur: .3, sw: 'rgba(110,255,170,.95)', whoosh: () => sfx.whoosh(),
  hit: { reach, dmg, kb, stun: .36, stop: .045, col: GREEN, gb: i + 1 } }));
const jumping = () => E.keys.has('w') || E.keys.has(' ') || E.keys.has('arrowup');
// the last of the five, three ways: a door into them (on the ground), an uppercut (jump held), a down slam (in the air)
const FIN5 = { m1: 1, n: 5, dur: .6, run(p, m, t) {
  p.rate = 42;
  if (t < .12) { p.target = POSE.gbHookW; if (p.ground) p.vx = p.face * 120; return; }
  p.target = t < .34 ? POSE.gbRound : POSE.idle; if (p.ground) p.vx = t < .2 ? p.face * 280 : 0;
  if (!m.sw) { m.sw = 1; sfx.whoosh(); }
  if (!m.done && t < .3 && E.tryHit(p, { reach: 205, dmg: 12, kb: 0, stun: .6, stop: .08, heavy: 1, col: GREEN, gb: 5 })) { m.done = 1; slamDoor(p, E.P2); }
} };
const UP5 = { m1: 1, n: 5, dur: .62, run(p, m, t) {
  p.rate = 44;
  if (t < .1) { p.target = POSE.kickWind; return; }
  p.target = t < .4 ? POSE.gbUp : POSE.jump;
  if (!m.hop) { m.hop = 1; p.vy = 700; p.ground = false; sfx.whoosh(); }
  if (!m.done && t < .32 && E.tryHit(p, { reach: 205, dmg: 14, kb: 60, lift: 1180, stun: .9, stop: .1, heavy: 1, col: GREEN, gb: 5 })) {
    m.done = 1; const o = E.P2;
    roughBurst(o.x, mid(o) + 60, .7); label(o.x, o.y + 460 * hs(o), 'UP', GREEN, .8);
  }
} };
const DOWN5 = { m1: 1, n: 5, dur: 1, run(p, m, t) {
  p.rate = 40;
  if (t < .12) { p.target = POSE.gbAxeW; p.vy = Math.max(p.vy, 0); return; }
  p.target = POSE.gbDive;
  if (!m.dive) { m.dive = 1; p.vy = -1900; sfx.whoosh(); }
  if (!m.done && E.tryHit(p, { reach: 225, dmg: 28, kb: 120, stun: 1, stop: .16, heavy: 1, col: GREEN, gb: 6 })) {
    m.done = 1; const o = E.P2;
    if (can(p, o)) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 30), vy: -2400, vx: 0, bounced: true });
    roughBurst(o.x, Math.max(80, mid(o) - 40), 1); V.crack(o.x, 320); V.rocks(o.x, 0, 12); E.addDust(o.x); shake(28);
    label(o.x, o.y + 460 * hs(o), 'DOWN', GREEN, .8);
  }
  if (p.ground && t > .2) { if (!m.landT) { m.landT = t; E.addDust(p.x); shake(10); } if (t > m.landT + .2) E.endMove(p); }
} };
function m1(i) {                                    // his five: kicks, and the last of them as above
  const p = E.P1;
  p.move = { def: i < 4 ? KICKS[i] : !p.ground ? DOWN5 : jumping() ? UP5 : FIN5, i: Math.min(i, 4), t: 0 };
  return false;
}
// the last kick lands, and a door comes across into them: they go tumbling (the ragdoll is the Vengeful Artist's: vengeful.js, h.flung)
function slamDoor(p, o) {
  const x0 = clamp(p.x - p.face * 60, -960, 960), x1 = clamp(o.x + p.face * 150, -960, 960);
  doors.push({ sweep: true, x0, x1, x: x0, t: 0, life: .5, face: p.face });
  E.after(.1, () => {
    if (o.ko) return;
    E.applyHit(o, p.face, { dmg: exact(o, 10), kb: 1150, lift: 420, stun: 1, stop: .12, heavy: 1, col: '#c9ced6', fixed: 1, mute: 1, flung: 1 });
    play('home-gb-slam', .8, () => sfx.door(1.2)); shake(22); E.addDust(o.x); V.sparks(o.x, mid(o), 'white', 10);
    label(o.x, o.y + 460 * hs(o), 'DOOR', '#d6dbe2', .8);
  });
}

/* ================= 1 — Reserve Balls ================= */
// 0.21v2 (the user's): not something thrown any more but a shot, on a straight line. No arc and no bounce: it goes at where the middle of them
// was when it left his hand (nobody in front of him: straight ahead), as fast as a shot, until it reaches them, the floor or a wall. Then it
// drops, spent, and is gone half a second later (long enough for the doors, 1 then 2, or the ride, 1 then 3, to find it)
const BALL_V = 1900, BALL_G = 2000, BALL_R = 22, BALL_SPENT = .5;
const balls = [];                                   // { x, y, vx, vy, t, face, doors, landed, lt, hit, spent, ride, spin, trail }
function throwBall(p) {
  const w = handAt(p, true), o = E.P2, x = w[0] + p.face * 20, y = Math.max(BALL_R + 30, w[1]);
  let ux = p.face, uy = 0;
  if (live(o) && (o.x - x) * p.face > 30) { const dx = o.x - x, dy = mid(o) - y, L = Math.hypot(dx, dy); ux = dx / L; uy = dy / L; }
  const b = { x, y, vx: ux * BALL_V, vy: uy * BALL_V, t: 0, face: p.face, doors: false, landed: false, hit: false, spent: false, ride: false, spin: 0, trail: [[x, y]] };
  balls.push(b);
  sfx.click(); sfx.whoosh();
  V.ring(x, y, 70, '#e6edf5', .12); V.sparks(x, y, 'white', 4);      // off his fingers
  return b;
}
const BALLS = { name: 'Reserve Balls', cd: 4, dur: .4, run(p, m, t) {
  p.vx = 0; p.rate = 38; p.target = t < .1 ? POSE.hookWind : t < .3 ? POSE.gbThrow : POSE.idle;
  if (!m.s && t >= .1) { m.s = 1; throwBall(p); }
} };
function land(b) {                                  // where it stops: doors waiting for it close there
  if (b.landed) return;
  b.landed = true; b.lt = b.t;
  if (b.doors) { b.doors = false; shut(clamp(b.x, -930, 930), { from: 'ball' }); label(b.x, 470, 'WHERE IT LANDS', GOLD, 1); }
}
function pop(b) { V.sparks(b.x, b.y, 'white', 6); V.ring(b.x, b.y, 80, '#e6edf5', .2); }
// did it go through them on its way from (x0, y0) to where it is now (at twice the game's speed it covers more than they are wide in a frame)
function through(b, x0, y0, o) {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - x0, b.y - y0) / 24)), half = 60 * hs(o), top = o.y + 380 * hs(o);
  for (let i = 1; i <= n; i++) { const x = lerp(x0, b.x, i / n), y = lerp(y0, b.y, i / n); if (Math.abs(o.x - x) < half && y > o.y - 10 && y < top) return [x, y]; }
  return null;
}
function stopBall(b, vx, vy) { land(b); b.spent = true; b.trail.length = 0; b.vx = vx; b.vy = vy; }
function ballsTick(dt) {
  const o = E.P2;
  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    b.t += dt; b.spin += dt * 22 * b.face;
    if (b.ride) continue;                            // (ridden: the ride moves it)
    if (b.spent) {                                   // dropping off whatever stopped it, and gone
      b.vy -= BALL_G * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.y <= BALL_R) { b.y = BALL_R; b.vy = b.vy < -250 ? -b.vy * .3 : 0; b.vx *= Math.exp(-dt * 6); }
      if (b.t - b.lt > BALL_SPENT) { pop(b); balls.splice(i, 1); }
      continue;
    }
    const x0 = b.x, y0 = b.y;
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.trail.push([b.x, b.y]); if (b.trail.length > 8) b.trail.shift();
    const at = live(o) && !(o.inv > 0) && o.state !== 'down' && o.state !== 'up' ? through(b, x0, y0, o) : null;
    if (at) {
      b.x = at[0]; b.y = at[1]; b.hit = true;
      E.applyHit(o, b.face, { dmg: exact(o, 20), kb: 160, stun: .9, stop: .06, col: '#e6edf5', fixed: 1, mute: 1 });
      sfx.ball(1.2); sfx.hit(false); V.sparks(b.x, b.y, 'green', 10); V.ring(b.x, b.y, 110, '#e6edf5', .16); if (Z) Z.flare(b.x, b.y, '230,240,255', 240, .14);
      stopBall(b, -b.face * 240, 360);
      continue;
    }
    if (b.y <= BALL_R || Math.abs(b.x) > 975 || b.y > 1300 || b.t > 1.2) {      // the floor, a wall, or out of the picture
      const floor = b.y <= BALL_R;
      b.x = clamp(b.x, -975, 975); b.y = clamp(b.y, BALL_R, 1300);
      sfx.ball(.7); V.sparks(b.x, b.y, 'white', 5); if (floor) E.addDust(b.x);
      stopBall(b, floor ? b.vx * .25 : -Math.sign(b.x) * 160, floor ? 260 : 120);
    }
  }
}
function drawBall(b) {
  const c = F(b.x, b.y), k = c[2], r = BALL_R * k;
  if (b.trail.length > 1 && !b.spent && !b.ride) {   // the line it is on, behind it: white in green, thinning out
    g.save(); g.lineCap = 'round'; g.globalCompositeOperation = 'lighter';
    for (let i = 1; i < b.trail.length; i++) {
      const a = F(b.trail[i - 1][0], b.trail[i - 1][1]), q = F(b.trail[i][0], b.trail[i][1]), u = i / (b.trail.length - 1);
      g.strokeStyle = `rgba(${GRGB},${.4 * u})`; g.lineWidth = r * 2.3 * u; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(q[0], q[1]); g.stroke();
      g.strokeStyle = `rgba(255,255,255,${.7 * u})`; g.lineWidth = r * 1.1 * u; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(q[0], q[1]); g.stroke();
    }
    g.restore();
  }
  lit(() => E.glow(E.GLOW.white, c[0], c[1], r * 4, b.spent ? .2 : .35));
  const gr = g.createRadialGradient(c[0] - r * .35, c[1] - r * .4, r * .1, c[0], c[1], r);
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, '#dfe6ef'); gr.addColorStop(.8, '#8d97a8'); gr.addColorStop(1, '#4b5262');
  g.fillStyle = gr; g.beginPath(); g.arc(c[0], c[1], r, 0, TAU); g.fill(); g.lineWidth = 2 * k; g.strokeStyle = LINE; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.5 * k; g.beginPath(); g.arc(c[0], c[1], r * .65, b.spin, b.spin + 1.2); g.stroke();      // the shine turning with it
  if (b.doors) { g.fillStyle = GOLD; g.font = `${Math.max(9, Math.round(14 * k))}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.fillText('▮▮', c[0], c[1] - r - 6 * k); }      // (doors waiting on it)
}

/* ================= 2 — Shutter Doors ================= */
const doors = [];                                   // { x, t, hold, o, hitDone, dmg, single, burst }: a pair shutting (or one door standing)
function shut(x, o = {}) {
  const d = { x, t: 0, hold: o.hold === undefined ? 1.6 : o.hold, o: null, hitDone: false, dmg: o.dmg === undefined ? 25 : o.dmg, noHit: !!o.noHit, target: o.target || null, single: !!o.single, face: o.face || 1, burst: 0, keep: !!o.keep };
  doors.push(d);
  play('home-gb-door', .75, () => sfx.door()); sfx.door(.6);
  return d;
}
const SHUT = .17;                                   // how long they take to slam
function doorsTick(dt) {
  const o = E.P2;
  for (let i = doors.length - 1; i >= 0; i--) {
    const d = doors[i];
    d.t += dt;
    if (d.single) { if (d.t > (d.life || 1)) doors.splice(i, 1); continue; }
    if (d.sweep) { d.x = lerp(d.x0, d.x1, ease(Math.min(1, d.t / .14))); if (d.t > d.life) doors.splice(i, 1); continue; }
    if (!d.hitDone && d.t >= SHUT) {               // shut: whoever is between them is in there
      d.hitDone = true; shake(16); E.addDust(d.x); V.rocks(d.x, 0, 6);
      if (Z) Z.shock(d.x, 360, DRGB, .3, 8);
      play('home-gb-slam', .55); sfx.door(1);
      const who = d.target || o;
      if (live(who) && Math.abs(who.x - d.x) < 165 * hs(who) && who.y < 260) {
        d.o = who;
        if (!d.noHit && d.dmg > 0) E.applyHit(who, who.x >= E.P1.x ? 1 : -1, { dmg: exact(who, d.dmg), kb: 0, stun: d.hold + .1, stop: .08, heavy: 1, col: GOLD, fixed: 1, mute: 1 });
        V.sparks(d.x, mid(who), 'gold', 10);
      } else if (!d.keep) d.hold = .35;            // shut on nothing: open again soon
    }
    if (d.o && d.t < SHUT + d.hold && !d.burst) {   // shut in there: kept where the doors are
      const q = d.o;
      if (!duel() && !q.net && !q.poise && !q.ko) { q.x = lerp(q.x, d.x, 1 - Math.exp(-dt * 20)); q.vx = 0; if (q.ground) Object.assign(q, { state: 'hurt', stun: Math.max(q.stun || 0, .2), act: null, tele: 0 }); }
    }
    const end = d.burst ? d.burst + .5 : SHUT + d.hold + .3;
    if (d.t > end) doors.splice(i, 1);
  }
}
function burstDoors(d) {                            // through them: the doors in pieces
  if (!d || d.burst) return;
  d.burst = d.t;
  play('home-gb-bust', .6, () => sfx.door(1.4)); shake(26);
  if (Z) for (let i = 0; i < 26; i++) Z.emit(3, d.x + rnd(-120, 120), rnd(60, 460), rnd(-900, 900), rnd(100, 900), rnd(6, 14), rnd(.6, 1.2), i % 4 === 0 ? '242,245,248' : i % 2 ? '155,158,163' : '38,44,53', { g: 1800, vr: rnd(-14, 14), rot: rnd(0, TAU), edge: 'rgba(10,6,12,.85)' });      // (grey door, dark frame, the window's glass)
}
// one train door (the user's picture): grey, a dark frame round it, a window high up, a handle on the side that opens, a paler kick plate along
// the bottom, and a dark line down the hinge side. side: which way it opens (-1: its open edge is on its right)
function panel(x0, y0, w, h, k, side) {
  const f = Math.max(4 * k, w * .075), ix = x0 + f, iy = y0 + f, iw = w - 2 * f, ih = h - 2 * f;
  g.fillStyle = '#262c35'; g.fillRect(x0, y0, w, h);
  g.fillStyle = '#9b9ea3'; g.fillRect(ix, iy, iw, ih);
  g.fillStyle = '#c9cbce'; g.fillRect(ix, iy + ih * .84, iw, ih * .16);
  g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(ix, iy, iw * .45, ih * .84);
  const wx = ix + iw * .2, wy = iy + ih * .1, ww = iw * .6, wh = ih * .36;
  g.fillStyle = '#262c35'; g.fillRect(wx - f * .6, wy - f * .6, ww + f * 1.2, wh + f * 1.2);
  g.fillStyle = '#f2f5f8'; g.fillRect(wx, wy, ww, wh);
  g.strokeStyle = 'rgba(150,180,200,.55)'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(wx + ww * .2, wy + wh * .85); g.lineTo(wx + ww * .7, wy + wh * .15); g.stroke();      // a glint on the glass
  const hx = side > 0 ? ix + iw * .1 : ix + iw * .82, hy = iy + ih * .56;
  g.fillStyle = '#b8babe'; g.fillRect(hx, hy, iw * .08, ih * .11); g.lineWidth = 2 * k; g.strokeStyle = '#262c35'; g.strokeRect(hx, hy, iw * .08, ih * .11);
  g.fillStyle = '#262c35'; g.fillRect(side > 0 ? x0 + w - f * 1.7 : x0 + f * .7, iy, f * .5, ih);
  g.lineWidth = 2.5 * k; g.strokeStyle = '#0e1116'; g.strokeRect(x0, y0, w, h);
}
function drawDoors() {
  for (const d of doors) {
    const c = F(d.x, 0), k = c[2], H2 = 500 * k, W2 = 120 * k, top = F(d.x, 500);
    if (d.single) {                                  // one door, standing behind somebody: they are about to be kicked into it
      const u = Math.min(1, d.t / .12), a = Math.min(1, ((d.life || 1) - d.t) * 4);
      g.save(); g.globalAlpha = a; panel(c[0] - W2 / 2, c[1] - H2 * u, W2, H2 * u, k, d.face); g.restore();
      continue;
    }
    if (d.sweep) {                                   // one coming across, fast, into them
      const a = Math.min(1, (d.life - d.t) * 5), w = 130 * k, h = 440 * k;
      g.save(); g.globalAlpha = a; panel(c[0] - w / 2, c[1] - h, w, h, k, d.face);
      g.strokeStyle = 'rgba(230,236,244,.7)'; g.lineWidth = 3 * k;
      for (let i = 0; i < 5; i++) { const y = c[1] - h * (.15 + i * .17); g.beginPath(); g.moveTo(c[0] - d.face * w * .6, y); g.lineTo(c[0] - d.face * (w * .6 + 140 * k), y); g.stroke(); }      // and the rush of it
      g.restore();
      continue;
    }
    const u = Math.min(1, d.t / SHUT), close = ease(u), endT = SHUT + d.hold;
    const open = d.burst ? 0 : d.t > endT ? ease(Math.min(1, (d.t - endT) / .3)) : 0;
    const gap = (1 - close) * 260 * k + open * 300 * k;
    const a = d.burst ? Math.max(0, 1 - (d.t - d.burst) / .12) : 1 - open;
    if (a <= 0) continue;
    g.save(); g.globalAlpha = a;
    panel(c[0] - gap - W2 * 2, top[1], W2 * 2, H2, k, -1);
    panel(c[0] + gap, top[1], W2 * 2, H2, k, 1);
    if (d.hitDone && d.t < SHUT + .12) lit(() => { g.strokeStyle = `rgba(255,255,255,${1 - (d.t - SHUT) / .12})`; g.lineWidth = 8 * k; g.beginPath(); g.moveTo(c[0], top[1]); g.lineTo(c[0], c[1]); g.stroke(); });      // the moment they meet
    g.restore();
  }
}

/* ================= 3 — Rough Energy ================= */
const grit = [];                                    // { x, y, vx, vy, t, life, s, r }: the roughness of it, flying off
function roughBurst(x, y, s = 1) {                  // rough cursed energy let go: jagged shards of it, grit, a green-white flash
  if (Z) { Z.flash(GRGB, .2 * s, .2); Z.flare(x, y, GRGB, 420 * s, .2); Z.shock(x, Math.min(700, 420 * s), GRGB, .35, 9); }
  E.addBlast(x, y, GRGB, 300 * s); V.ring(x, y, 300 * s, GREEN, .3);
  for (let i = 0; i < 26 * s; i++) { const a = rnd(0, TAU), v = rnd(300, 1300) * s; grit.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: rnd(.25, .55), s: rnd(5, 13) * s, r: rnd(0, TAU) }); }
  V.custom(.32, u => {                              // jagged shards out of where it landed
    const c = F(x, y), k = c[2] * s;
    g.save(); g.translate(c[0], c[1]);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU + i * .7, L = (120 + (i % 3) * 70) * k * ease(Math.min(1, u * 3)), w = 18 * k * (1 - u);
      g.beginPath(); g.moveTo(Math.cos(a + 1.5) * w, Math.sin(a + 1.5) * w);
      for (let j = 1; j <= 4; j++) { const r = L * j / 4, z = (j & 1 ? 1 : -1) * 10 * k; g.lineTo(Math.cos(a) * r + Math.cos(a + 1.57) * z, Math.sin(a) * r + Math.sin(a + 1.57) * z); }
      g.lineTo(Math.cos(a - 1.5) * w, Math.sin(a - 1.5) * w); g.closePath();
      g.globalAlpha = 1 - u; g.fillStyle = i % 2 ? '#b6ffd6' : GREEN; g.fill(); g.lineWidth = 2 * k; g.strokeStyle = '#0d3a22'; g.stroke();
    }
    g.restore();
  });
  sfx.rough(1.2 * s);
}
function gritTick(dt) {
  for (let i = grit.length - 1; i >= 0; i--) { const q = grit[i]; q.t += dt; if (q.t >= q.life) { grit.splice(i, 1); continue; } q.x += q.vx * dt; q.y += q.vy * dt; q.vy -= 1400 * dt; q.vx *= Math.exp(-dt * 4); q.r += dt * 12; }
  if (grit.length > 300) grit.splice(0, grit.length - 300);
}
function drawGrit() {
  for (const q of grit) {
    const c = F(q.x, q.y), k = c[2], s = q.s * k * (1 - q.t / q.life);
    g.save(); g.translate(c[0], c[1]); g.rotate(q.r);
    g.fillStyle = q.s > 9 ? '#b6ffd6' : GREEN; g.beginPath(); g.moveTo(-s, -s * .4); g.lineTo(s * .3, -s); g.lineTo(s, s * .2); g.lineTo(-s * .2, s); g.closePath(); g.fill();      // a rough chip of it, all corners
    g.restore();
  }
}
let gather = null;                                  // { f, t, s }: rough energy gathering round a leg
function drawGather() {
  const G = gather;
  if (!G) return;
  const f = G.f, w = footAt(f, true), c = F(w[0], w[1] + 30), k = c[2], u = Math.min(1, G.t / .3) * G.s;
  lit(() => E.glow(E.GLOW.green, c[0], c[1], 260 * k * u, .8));
  g.save(); g.lineCap = 'round'; g.lineJoin = 'miter';
  for (let i = 0; i < 7; i++) {                      // jagged rings round it, scraping
    const r = (60 + i * 10) * k * u, a0 = E.T * (i & 1 ? 9 : -9) + i;
    g.beginPath();
    for (let j = 0; j <= 10; j++) { const a = a0 + j / 10 * TAU, rr = r * (j & 1 ? .82 : 1.05); j ? g.lineTo(c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr * .7) : g.moveTo(c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr * .7); }
    g.strokeStyle = i & 1 ? 'rgba(182,255,214,.75)' : `rgba(${GRGB},.85)`; g.lineWidth = 2.4 * k; g.stroke();
  }
  g.restore();
}
const ROUGH = { name: 'Rough Energy', cd: 8, dur: .95, run(p, m, t) {
  const o = E.P2;
  p.rate = 36;
  if (t < .3) { p.target = POSE.gbCharge; p.vx = 0; gather = { f: p, t, s: 1 }; if (!m.s) { m.s = 1; sfx.rough(.6); } if (Math.random() < .6) grit.push({ x: p.x + rnd(-60, 60), y: p.y + rnd(20, 120), vx: rnd(-80, 80), vy: rnd(200, 500), t: 0, life: .3, s: rnd(4, 8), r: 0 }); return; }
  gather = null;
  const gap = (o.x - p.x) * p.face;                 // (in on them first, from as far as a fight starts)
  p.target = t < .62 ? POSE.gbRound : POSE.idle; p.vx = t < .54 && gap > 165 && !m.done ? p.face * 1350 : 0;
  if (!m.done && t > .32 && t < .58 && E.tryHit(p, { reach: 250, dmg: exact(o, 42), kb: 1250, lift: 620, stun: 1, stop: .2, heavy: 1, col: GREEN, fixed: 1, mute: 1 })) {
    m.done = 1; roughBurst(o.x, mid(o), 1); play('home-gb-kick', .9, () => sfx.hit(true)); shake(26); E.zoomIn(.3);
  }
} };

/* ================= 1 + 3: the ball, ridden ================= */
const RIDE = { name: 'Ball Ride', dur: 1.8, run(p, m, t) {
  const b = m.b, o = E.P2, dt = t - (m.lt || 0);
  m.lt = t;
  if (!m.s) { m.s = 1; b.ride = true; b.spent = false; b.trail.length = 0; b.y = Math.max(b.y, 70); m.dir = live(o) ? (Math.sign(o.x - b.x) || p.face) : p.face; sfx.whoosh(); sfx.rough(.7); label(p.x, p.y + 430, 'ALL IN', GREEN, 1); }
  p.inv = Math.max(p.inv || 0, .25);
  if (t < .7 && !m.down) {                          // up on it, rolling at them
    const tx = live(o) ? o.x : b.x + m.dir * 900;
    if (Math.abs(tx - b.x) > 110) b.x += Math.sign(tx - b.x) * Math.min(1050 * dt, Math.abs(tx - b.x) - 110);
    b.x = clamp(b.x, -950, 950); b.y = 60 + Math.abs(Math.sin(t * 9)) * 38;
    p.x = b.x; p.y = b.y + BALL_R - 4; p.vy = 0; p.vx = 0; p.ground = false; p.face = m.dir; p.target = POSE.gbSurf; p.rate = 30;
    gather = { f: p, t: .3, s: .7 };
    if (Math.random() < .7) grit.push({ x: b.x - m.dir * 30, y: BALL_R, vx: -m.dir * rnd(200, 500), vy: rnd(100, 300), t: 0, life: .3, s: rnd(4, 8), r: 0 });
    return;
  }
  if (!m.down) {                                    // it comes down: off it, and the rough energy, which cannot miss now
    m.down = 1; gather = null;
    b.ride = false; b.y = BALL_R; land(b); pop(b); const k = balls.indexOf(b); if (k >= 0) balls.splice(k, 1);
    p.vy = 520; p.ground = false; sfx.ball(.9);
    if (live(o) && Math.abs(o.x - p.x) < 430) m.hitAt = t + .12;
    else label(p.x, p.y + 430, 'BUST', '#a9a4ae', 1);
  }
  p.target = m.hitAt !== undefined && t < m.hitAt + .3 ? POSE.gbRound : POSE.idle;
  if (m.hitAt !== undefined && !m.done && t >= m.hitAt) {
    m.done = 1;
    if (!o.ko) {
      p.x = clamp(o.x - p.face * 130, -960, 960);
      E.applyHit(o, p.face, { dmg: exact(o, 48), kb: 1300, lift: 650, stun: 1, stop: .22, heavy: 1, col: GREEN, fixed: 1, mute: 1 });
      roughBurst(o.x, mid(o), 1.15); play('home-gb-kick', 1, () => sfx.hit(true)); shake(30); E.zoomIn(.35);
      label(o.x, o.y + 470 * hs(o), 'GUARANTEED', GREEN, 1.3);
    }
  }
  if (t > 1.15 && p.ground) E.endMove(p);
} };
function startRide(p, b) {
  if (p.move) E.endMove(p);
  p.move = { def: RIDE, key: 'div', t: 0, b }; E.hud.mv.div.classList.add('act');
}

/* ================= 4 — Fever Breaker, and its two endings with the doors ================= */
const FEVER = { name: 'Fever Breaker', cd: 10, dur: 3.4, run(p, m, t) {
  const f = p.face;
  if (!m.o) m.o = E.P2;
  const o = m.o;
  if (!m.k1) {                                      // in, and the first kick: back into a door that has come up behind them
    const gap = (o.x - p.x) * f;
    p.rate = 42; p.target = t < .12 ? POSE.dash : POSE.gbFront; p.vx = t < .22 && gap > 170 ? f * 1300 : 0;
    if (t < .2) return;
    m.k1 = 1;
    if (live(o) && gap > -40 && gap < 260 && o.state !== 'down' && o.state !== 'up') {
      E.applyHit(o, f, { dmg: exact(o, 20), kb: 0, stun: 1.2, stop: .08, heavy: 1, col: GREEN, fixed: 1, mute: 1 });
      play('home-gb-kick', .8, () => sfx.hit(true)); shake(12);
      m.door = clamp(o.x + f * 230, -930, 930); m.x0 = o.x;
      doors.push({ x: m.door, t: 0, single: true, life: 1.1, face: f });
      label(p.x, p.y + 440, 'FEVER', GOLD, .9);
    } else m.miss = 1;
    return;
  }
  if (m.miss) { p.target = POSE.idle; p.vx = 0; if (t > .55) E.endMove(p); return; }
  p.vx = 0;
  if (t < .7) {                                     // into the door, and off it (2 and 3 can still change how this ends)
    const u = clamp((t - .2) / .2, 0, 1);
    if (can(p, o)) { o.x = lerp(m.x0, m.door - f * 70, ease(u)); o.vx = 0; Object.assign(o, { state: 'hurt', stun: Math.max(o.stun || 0, .4), act: null, tele: 0 }); }
    if (u >= 1 && !m.bang) { m.bang = 1; sfx.door(1.1); shake(14); V.sparks(m.door - f * 60, mid(o), 'gold', 8); }
    p.target = t < .4 ? POSE.gbFront : POSE.kickWind;
    return;
  }
  if (!m.end) {
    m.end = m.doors && m.rough ? 'jackpot' : m.doors ? 'slam' : m.rough ? 'rough' : 'kick'; m.et = t;
    if (m.end === 'kick') {                        // the second kick: the length of the arena
      E.applyHit(o, f, { dmg: exact(o, 30), kb: 1400, lift: 520, stun: .9, stop: .16, heavy: 1, col: GREEN, fixed: 1, mute: 1 });
      play('home-gb-kick', 1, () => sfx.hit(true)); shake(22); V.ring(o.x, mid(o), 260, GREEN, .3); E.addBlast(o.x, mid(o), GRGB, 220);
    } else if (m.end === 'rough') {                // 4 then 3: the second kick full of rough energy
      E.applyHit(o, f, { dmg: exact(o, 42), kb: 1450, lift: 600, stun: 1, stop: .2, heavy: 1, col: GREEN, fixed: 1, mute: 1 });
      roughBurst(o.x, mid(o), 1); play('home-gb-kick', 1, () => sfx.hit(true)); shake(26);
    } else {                                        // 4 then 2 (and 3): the doors shut on them
      m.shut = shut(clamp(o.x, -930, 930), { target: o, hold: m.end === 'jackpot' ? 2.2 : 1.2, dmg: m.end === 'jackpot' ? 0 : 15, noHit: m.end === 'jackpot', keep: true });
      label(o.x, o.y + 470 * hs(o), m.end === 'jackpot' ? 'ALL OR NOTHING' : 'SHUT IN', GOLD, 1.2);
      if (m.end === 'jackpot') { play('home-gb-reels', .7, () => sfx.ding(0)); reels = { t: 0, x: o.x, stop: [], o }; }
    }
  }
  const s = t - m.et;
  if (m.end === 'kick' || m.end === 'rough') { p.target = s < .35 ? POSE.gbRound : POSE.idle; if (s > .5) E.endMove(p); return; }
  if (m.end === 'slam') {                           // up, and a leg brought down on them, full of rough energy
    if (s < .2) { p.target = POSE.kickWind; return; }
    if (!m.up) { m.up = 1; p.vy = 980; p.ground = false; p.x = clamp(o.x - f * 120, -960, 960); sfx.whoosh(); }
    p.target = s < .48 ? POSE.gbAxeW : POSE.gbAxe;
    gather = s < .48 ? { f: p, t: .3, s: .9 } : null;
    if (s >= .48 && !m.slam) {
      m.slam = 1; p.vy = -1600;
      if (!o.ko) E.applyHit(o, f, { dmg: exact(o, 45), kb: 300, lift: 0, stun: 1.1, stop: .22, heavy: 1, col: GREEN, fixed: 1, mute: 1 });
      if (can(p, o)) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 30), vy: -2200, vx: 0, bounced: true });
      burstDoors(m.shut); roughBurst(o.x, Math.max(80, mid(o) - 60), 1.2); play('home-gb-kick', 1, () => sfx.hit(true));
      V.crack(o.x, 380); V.rocks(o.x, 0, 16); E.addDust(o.x); shake(34); E.zoomIn(.35);
      if (Z) Z.boom(o.x, 40, 120, GRGB, { n: 18, smoke: '20,40,30', hot: '220,255,235' });
    }
    if (s > 1 && p.ground) E.endMove(p);
    return;
  }
  // 4, 3, 2: the jackpot. The doors hold them, the reels spin up over them and stop on 7 7 7, and the rough energy goes through it all
  p.inv = Math.max(p.inv || 0, .3);
  p.target = s < 1.3 ? POSE.gbCharge : s < 1.62 ? POSE.gbRound : POSE.idle;
  if (s < 1.3) gather = { f: p, t: .3, s: .6 + s };
  if (reels) for (let i = 0; i < 3; i++) if (s >= .55 + i * .22 && !reels.stop[i]) { reels.stop[i] = s; sfx.ding(i); shake(6); }
  if (s >= 1.22 && !m.jp) { m.jp = 1; play('home-gb-jackpot', .8, () => sfx.ding(3)); label(o.x, o.y + 540 * hs(o), 'JACKPOT', GOLD, 1.6); if (Z) Z.flash(DRGB, .3, .25); }
  if (s >= 1.36 && !m.kick) {
    m.kick = 1; gather = null; imp = { t: 0, o, p };
    p.x = clamp(o.x - f * 130, -960, 960);
    if (!o.ko) E.applyHit(o, f, { dmg: exact(o, 110), kb: 1700, lift: 800, stun: 1.2, stop: .3, heavy: 1, col: GREEN, fixed: 1, mute: 1 });
    burstDoors(m.shut); roughBurst(o.x, mid(o), 1.6); play('home-gb-kick', 1, () => sfx.hit(true)); shake(44); E.zoomIn(.5); E.stop(.12);
    if (Z) { Z.flash('255,255,255', .35, .14); Z.shock(o.x, 720, GRGB, .55, 14); }
    for (let i = 0; i < 30; i++) coins.push({ x: o.x, y: mid(o), vx: rnd(-900, 900), vy: rnd(300, 1200), t: 0, r: rnd(0, TAU) });
  }
  if (s > 2.1) { gather = null; reels = null; E.endMove(p); }
} };
let reels = null, imp = null;                       // the reels over them (the jackpot); the impact frames when it goes
const coins = [];                                   // gold, everywhere
function drawReels() {
  const R = reels;
  if (!R) return;
  const c = F(R.x, 455), k = c[2], w = 66 * k, h = 86 * k, a = Math.min(1, R.t / .2);      // (over the doors' faces, where the camera still has them)
  g.save(); g.globalAlpha = a;
  lit(() => E.glow(E.GLOW.gold, c[0], c[1], 420 * k, .5));
  g.fillStyle = '#1a0f1c'; g.fillRect(c[0] - w * 1.7, c[1] - h * .7, w * 3.4, h * 1.4); g.lineWidth = 4 * k; g.strokeStyle = GOLD; g.strokeRect(c[0] - w * 1.7, c[1] - h * .7, w * 3.4, h * 1.4);
  const SYM = ['7', '★', 'BAR', '7', '¥', '♦', '7', '♣'];
  for (let i = 0; i < 3; i++) {
    const x = c[0] + (i - 1) * w * 1.1, stopped = R.stop[i];
    g.save(); g.beginPath(); g.rect(x - w / 2, c[1] - h / 2, w, h); g.clip();
    g.fillStyle = '#f7f2e4'; g.fillRect(x - w / 2, c[1] - h / 2, w, h);
    g.font = `${Math.round(52 * k)}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (stopped) { g.fillStyle = '#c21f3a'; g.fillText('7', x, c[1]); }
    else { const off = (R.t * 1400 * k) % (h * .9); for (let j = -1; j < 3; j++) { g.fillStyle = j & 1 ? '#c21f3a' : '#1a1a1a'; g.fillText(SYM[(Math.floor(R.t * 15) + j + i * 3) % SYM.length], x, c[1] - h * .9 + j * h * .9 + off); } }
    g.restore();
    g.lineWidth = 2 * k; g.strokeStyle = LINE; g.strokeRect(x - w / 2, c[1] - h / 2, w, h);
  }
  if (R.stop[2]) lit(() => { g.strokeStyle = `rgba(${DRGB},${.6 + .4 * Math.sin(E.T * 30)})`; g.lineWidth = 8 * k; g.strokeRect(c[0] - w * 1.8, c[1] - h * .8, w * 3.6, h * 1.6); });
  g.restore();
}
function coinsTick(dt) { for (let i = coins.length - 1; i >= 0; i--) { const q = coins[i]; q.t += dt; q.vy -= 2100 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += dt * 14; if (q.y < 6) { q.y = 6; q.vy *= -.35; q.vx *= .6; } if (q.t > 1.6) coins.splice(i, 1); } }
function drawCoins() {
  for (const q of coins) {
    const c = F(q.x, q.y), k = c[2], a = Math.min(1, (1.6 - q.t) * 3), w = Math.abs(Math.cos(q.r)) * 11 * k + 2;
    g.globalAlpha = a; g.fillStyle = GOLD; g.beginPath(); g.ellipse(c[0], c[1], w, 11 * k, 0, 0, TAU); g.fill(); g.lineWidth = 1.5 * k; g.strokeStyle = '#7a5410'; g.stroke();
  }
  g.globalAlpha = 1;
}
const SIL = { black: E.flat('#000000', '#000000'), green: E.flat('#3cf08a', '#3cf08a') };
function drawImpact() {                             // the moment the jackpot kick lands: two frames of it, the way the game they come from does it
  const I = imp;
  if (!I) return;
  const full = col => { g.fillStyle = col; g.fillRect(-4000, -3000, 8000 + E.VW, 6000 + E.VH); };
  const sil = skin => { for (const w of [I.o, I.p]) E.drawFighter(E.over(w, skin), 1); };
  if (I.t < .07) { full('#ffffff'); sil(SIL.black); }
  else if (I.t < .14) { full('#05140c'); sil(SIL.green); }
}

/* ================= E — Bouncer Doors: a counter ================= */
let guard = null;                                   // { t, x, face }: doors in front of him, waiting
const ESP = { name: 'Bouncer Doors', jp: '用心棒', col: GREEN, cd: 12, dur: 1.6, run(p, m, t) {
  p.vx = 0; p.rate = 30;
  if (!m.s) { m.s = 1; guard = { t: .9, x: p.x + p.face * 105, face: p.face, open: 0 }; play('home-gb-door', .6, () => sfx.door()); }
  if (m.burst === undefined) {
    p.target = POSE.gbGuard;
    if (guard) guard.x = p.x + p.face * 105;
    if (t > .95) { guard = null; E.endMove(p); }
    return;
  }
  const s = t - m.burst;
  p.target = s < .3 ? POSE.gbFront : POSE.idle;
  if (s > .55) E.endMove(p);
} };
function drawGuard() {
  const G = guard;
  if (!G) return;
  const c = F(G.x, 0), k = c[2], top = F(G.x, 380), u = Math.min(1, (.9 - G.t) / .1 + .001);
  g.save(); g.globalAlpha = Math.min(1, G.t / .1 + .2);
  panel(c[0] - 70 * k * u, top[1], 70 * k * u, c[1] - top[1], k, -1);
  panel(c[0], top[1], 70 * k * u, c[1] - top[1], k, 1);
  lit(() => { g.strokeStyle = `rgba(${GRGB},${.4 + .3 * Math.sin(E.T * 24)})`; g.lineWidth = 6 * k; g.strokeRect(c[0] - 74 * k, top[1] - 4 * k, 148 * k, c[1] - top[1] + 8 * k); });
  g.restore();
}

/* ================= the technique ================= */
const MOVES = { strikes: BALLS, crush: { name: 'Shutter Doors', cd: 7, dur: .5, run(p, m, t) {
  p.vx = 0; p.rate = 34; p.target = t < .3 ? POSE.gbSnap : POSE.idle;
  if (m.s || t < .1) return;
  m.s = 1;
  const o = E.P2, x = live(o) && Math.abs(o.x - p.x) < 950 ? o.x : p.x + p.face * 420;
  shut(clamp(x, -930, 930));
} }, div: ROUGH, manji: FEVER };
JU.tech.add('gambler', { name: 'Double or Nothing', jp: '一か八か', mark: '博', who: 'Pachinko, doors, and rough energy', odds: 0, col: GREEN, glow: 'green', moves: MOVES,
  early: true, m1,
  hint: '<b>1</b> Reserve Balls · <b>2</b> Shutter Doors · <b>3</b> Rough Energy · <b>4</b> Fever Breaker · <b>E</b> Bouncer Doors · 5th kick: hold jump = uppercut, in the air = down slam · combos: <b>1</b>→<b>2</b> doors where the ball lands, <b>1</b>→<b>3</b> or <b>3</b>→<b>1</b> ride it, <b>4</b>→<b>2</b> slam, <b>4</b>→<b>3</b>→<b>2</b> jackpot' });
const DEF = JU.tech.TECH.gambler, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
const press0 = H.press, guard0 = H.guard, hit0 = H.hit, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
const ready = k => !(E.cd[k] > 0);
function spend(k) { E.cd[k] = E.CD[k]; const el = E.hud.mv[k]; if (el) { el.classList.add('act'); setTimeout(() => el.classList.remove('act'), 220); } }
H.press = (a, inScene) => {                          // the combos: a second move pressed while the first is still going
  if (!inScene && on() && E.root.dataset.mode === 'fight' && !E.P1.dead) {
    const p = E.P1, m = p.move;
    if (m && m.def === FEVER && m.k1 && !m.miss && !m.end) {      // Fever Breaker, before its second kick: 2 and 3 change how it ends
      if (a === 'crush' && !m.doors && ready('crush')) { m.doors = 1; spend('crush'); label(p.x, p.y + 470, 'DOORS', GOLD, .7); return true; }
      if (a === 'div' && !m.rough && ready('div')) { m.rough = 1; spend('div'); label(p.x, p.y + 470, 'ROUGH', GREEN, .7); return true; }
    }
    if (m && m.def === ROUGH && m.t < .3 && a === 'strikes' && ready('strikes')) {      // 3 then 1: a ball, and up on it
      spend('strikes'); const b = throwBall(p); startRide(p, b); return true;
    }
    const b = balls.filter(q => !q.ride && (!q.landed || q.t - q.lt < .35)).pop();
    if (b && a === 'crush' && ready('crush') && !(m && m.def === FEVER)) {      // 1 then 2: the doors go where the ball comes down
      spend('crush');
      if (b.landed) shut(clamp(b.x, -930, 930)); else { b.doors = true; label(b.x, b.y + 120, 'DOORS ↓', GOLD, .7); }
      return true;
    }
    if (b && (!b.landed || b.t - b.lt < .25) && b.t < .8 && a === 'div' && ready('div') && !(m && (m.def === FEVER || m.def === RIDE))) {      // 1 then 3: up on the ball (in the air, or just come off them)
      spend('div'); startRide(p, b); return true;
    }
  }
  return press0 ? press0(a, inScene) : false;
};
H.guard = (face, a, mul) => {                        // Bouncer Doors: what comes at him goes back through them
  if (guard0 && guard0(face, a, mul)) return true;
  if (!on() || !guard || E.P1.dead) return false;
  const p = E.P1, m = p.move, x = guard.x;
  guard = null;
  if (a && a.shot) {                                 // a shot: it breaks them, and that is all
    play('home-gb-bust', .5, () => sfx.door(1.3)); burstDoors({ x, t: 0, burst: 0 });
    if (m && m.def === ESP) E.endMove(p);
    return true;
  }
  if (m && m.def === ESP) m.burst = m.t;
  const o = E.P2;
  play('home-gb-bust', .9, () => sfx.door(1.4)); play('home-gb-kick', .8); shake(28); E.zoomIn(.3);
  if (Z) for (let i = 0; i < 22; i++) Z.emit(3, x + rnd(-60, 60), rnd(60, 360), p.face * rnd(200, 1100), rnd(100, 800), rnd(6, 13), rnd(.6, 1.1), i % 4 === 0 ? '242,245,248' : i % 2 ? '155,158,163' : '38,44,53', { g: 1800, vr: rnd(-14, 14), rot: rnd(0, TAU), edge: 'rgba(10,6,12,.85)' });
  if (live(o) && Math.abs(o.x - p.x) < 520) E.after(.05, () => {
    if (o.ko) return;
    E.applyHit(o, p.face, { dmg: exact(o, 60), kb: 1150, lift: 420, stun: 1, stop: .2, heavy: 1, col: GREEN, fixed: 1, mute: 1 });
    V.ring(o.x, mid(o), 300, GREEN, .3); E.addBlast(o.x, mid(o), GRGB, 260);
    label(o.x, o.y + 470 * hs(o), 'BOUNCED', GREEN, 1.2);
  });
  return true;
};
H.hit = (o, face, h) => {                            // his kicks land with a crack, and green off the foot
  hit0(o, face, h);
  if (!on() || !h.gb) return;
  const w = footAt(E.P1, h.gb !== 4);
  V.sparks(w[0], w[1], 'green', h.gb === 5 ? 10 : 4);
  if (h.gb >= 5) { play('home-gb-kick', .7, () => sfx.hit(true)); E.addBlast(o.x, mid(o), GRGB, 180); } else sfx.hit(false);
};
H.tick = dt => {
  tick0(dt);
  if (!on()) { balls.length = doors.length = grit.length = coins.length = 0; guard = gather = reels = imp = null; if (cool.has(E.P1.skin)) E.P1.skin = unGreen(E.P1.skin); return; }
  const p = E.P1, kicking = p.move && p.move.def.m1;
  if (kicking) p.skin = greenOf(p.skin); else if (cool.has(p.skin)) p.skin = unGreen(p.skin);      // his legs lit green while he kicks
  if (guard && (guard.t -= dt) <= 0) guard = null;
  if (gather && !(p.move && (p.move.def === ROUGH || p.move.def === RIDE || p.move.def === FEVER))) gather = null;
  if (reels) reels.t += dt;
  if (imp && (imp.t += dt) > .14) imp = null;
  ballsTick(dt); doorsTick(dt); gritTick(dt); coinsTick(dt);
};
H.fx = dt => {
  fx0(dt);
  if (!on()) return;
  const p = E.P1;
  if (p.move && p.move.def.m1) { const w = footAt(p, p.move.i !== 3); const c = F(w[0], w[1]); lit(() => E.glow(E.GLOW.green, c[0], c[1], 150 * c[2], .8)); }      // the kicking foot, lit
  drawDoors(); drawGuard();
  for (const b of balls) drawBall(b);
  drawGather(); drawGrit(); drawCoins(); drawReels(); drawImpact();
};
const clear = () => { balls.length = doors.length = grit.length = coins.length = 0; guard = gather = reels = imp = null; if (cool.has(E.P1.skin)) E.P1.skin = unGreen(E.P1.skin); };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); clear(); };

JU.gambler = { MOVES, KICKS, FIN5, UP5, DOWN5, esp: ESP, greenOf,      // (esp: E, especial.js)
  get state() { return { balls: balls.map(b => ({ x: Math.round(b.x), y: Math.round(b.y), vx: Math.round(b.vx), vy: Math.round(b.vy), landed: b.landed, hit: b.hit, spent: b.spent, doors: b.doors, ride: b.ride })), doors: doors.map(d => ({ x: Math.round(d.x), shut: d.hitDone, held: !!d.o, single: d.single })), guard: !!guard, reels: !!reels, grit: grit.length, coins: coins.length }; } };
})();
