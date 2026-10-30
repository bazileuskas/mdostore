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
   ball's pachinko clip was like an alarm. Gone: a click as the ball leaves his hand, and a clack and a hit when it lands on them.
   Build 0.22, the user: "15 more variants", some of them with E. The names and numbers are ours:
     IN THE AIR  1 Reserve Shower: three balls down at them (9 each) · 2 Drop Shutter: a door dropped on them from above, pinned under it (30)
                 3 Rough Meteor: down heel first, rough energy where he lands (40) · 4 Fever Spike: kicked down onto a door lying on the floor,
                 up off it and into the second kick (18 + 32)
     HELD        1 Reserve Barrage: a ball every tick while it is held, eight at most (6 each) · 3 All In: the rough energy gathered up to 1.2
                 seconds longer, 42 up to 70
     WITH E      E then 1 Rebound Ball: through them, off a door behind them and back through them (18 + 18) · E then 2 Closing Time: the doors
                 shut wherever the counter threw them, in the air too (30, shut in 1.6 s) · E then 3 Door Ram (while his doors are up): he kicks
                 them along the floor into whoever is there (30 + 8) · 2 then E Double Lock: a second pair round the first, 1.4 s more in
                 there (18) · 4 then E Spring Door: the door behind them throws them back at him, into a counter kick (45)
     AND         2 then 3 Door Breaker: rough energy through the doors and them (55) · 2 then 1 Pinball: a ball rattling round inside the shut
                 doors (6 x 6) · 3 then 4 Sky Fever: after them into the air, a door up there, the kick off it (22 + 34) · 1 then 4 Volley: he
                 catches his own ball with a kick, twice as fast and 40, into a door behind them (+10)
   His domain, Idle Death Gamble, is idg.js */
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
const free = p => !p.move && !p.ps && !p.dead && !(p.dashT > 0);
const held = (key, slot) => E.keys.has(key) || E.keys.has('hold:' + slot);      // a key still down (or its button, on a touch screen)
// Build 0.22: inside his domain (idg.js) every door and ball comes out a colour, green, red, gold or rainbow: tint(kind) says which
let tint = null;
const TINTS = { green: '#3cf08a', red: '#ff3b55', gold: '#ffd24a' };
const tintCol = c => (c === 'rainbow' ? `hsl(${(E.T * 420) % 360},100%,62%)` : TINTS[c] || null);
function glowRim(x, y, w, h, k, c) {                // a door's edge lit in its colour
  const col = tintCol(c);
  if (!col) return;
  lit(() => { g.globalAlpha = .55 + .3 * Math.sin(E.T * 18); g.strokeStyle = col; g.lineWidth = 8 * k; g.strokeRect(x - 5 * k, y - 5 * k, w + 10 * k, h + 10 * k); g.globalAlpha = 1; });
}
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
  if (!m.done && t < .3 && E.tryHit(p, { reach: 205, dmg: 12, kb: 0, stun: .6, stop: .08, heavy: 1, col: GREEN, gb: 5 })) { m.done = 1; slamDoor(p, E.P2, m); }
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
function slamDoor(p, o, m) {
  const x0 = clamp(p.x - p.face * 60, -960, 960), x1 = clamp(o.x + p.face * 150, -960, 960), col = tint ? tint('door') : null;
  doors.push({ sweep: true, x0, x1, x: x0, t: 0, life: .5, face: p.face, col });
  E.after(.1, () => {
    if (o.ko) return;
    E.applyHit(o, p.face, { dmg: exact(o, 10), kb: 1150, lift: 420, stun: 1, stop: .12, heavy: 1, col: '#c9ced6', fixed: 1, mute: 1, flung: 1, ind: 'door', indCol: col, src: m });
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
// o2 (Build 0.22): { dmg, turn (radians off the line), v (times as fast), small, m (the move it came from), rebound, quiet }
function throwBall(p, o2 = {}) {
  const w = handAt(p, true), o = E.P2, x = w[0] + p.face * 20, y = Math.max(BALL_R + 30, w[1]);
  let ux = p.face, uy = 0;
  const ty = o2.rebound && o.state === 'down' ? o.y + 45 : mid(o);      // (E then 1 comes after a counter that has usually put them on the floor: it goes along it at them)
  if (live(o) && (o.x - x) * p.face > 30) { const dx = o.x - x, dy = ty - y, L = Math.hypot(dx, dy); ux = dx / L; uy = dy / L; }
  if (o2.turn) { const c = Math.cos(o2.turn), s = Math.sin(o2.turn), nx = ux * c - uy * s; uy = ux * s + uy * c; ux = nx; }      // fanned off the line a little
  const v = BALL_V * (o2.v || 1);
  const b = { x, y, vx: ux * v, vy: uy * v, t: 0, face: p.face, doors: false, landed: false, hit: false, spent: false, ride: false, spin: 0, trail: [[x, y]],
    dmg: o2.dmg || 20, r: o2.small ? .72 : 1, m: o2.m || null, rebound: !!o2.rebound, col: tint ? tint('ball') : null };
  balls.push(b);
  if (!o2.quiet) { sfx.click(); sfx.whoosh(); }
  V.ring(x, y, 70, '#e6edf5', .12); V.sparks(x, y, 'white', 4);      // off his fingers
  return b;
}
// 0.22: held, it does not stop at one. A ball every tick while 1 stays down, eight at most (6 each): Reserve Barrage
const BAR_N = 8, BAR_GAP = .09, BAR_AT = .35;
const BALLS = { name: 'Reserve Balls', cd: 4, dur: 1.6, ind: 'ball', run(p, m, t) {
  p.vx = 0; p.rate = 38;
  if (!m.s && t >= .1) { m.s = 1; throwBall(p, { m }); }
  if (!m.bar && !m.out && t >= BAR_AT) { if (held('1', 'strikes')) { m.bar = t; m.n = 0; label(p.x, p.y + 440, 'BARRAGE', '#e6edf5', .8); } else m.out = 1; }
  if (m.bar) {
    const n = Math.min(BAR_N, Math.floor((t - m.bar) / BAR_GAP) + 1);
    while (!m.stop && m.n < n) { m.n++; throwBall(p, { dmg: 6, m, small: true, turn: rnd(-.07, .07), quiet: true }); sfx.click(.8); if (m.n === 1 || m.n % 3 === 0) sfx.whoosh(); }
    if (!m.stop && (m.n >= BAR_N || !held('1', 'strikes'))) m.stop = t;
    p.target = m.stop ? POSE.idle : Math.floor(t / .045) % 2 ? POSE.gbThrow : POSE.hookWind;
    if (m.stop && t > m.stop + .2) E.endMove(p);
    return;
  }
  p.target = t < .1 ? POSE.hookWind : t < .3 ? POSE.gbThrow : POSE.idle;
  if (m.out) E.endMove(p);
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
    if (b.skip > 0) b.skip -= dt;
    if (b.rebound && !b.back && b.wall !== undefined && (b.x - b.wall) * b.face >= 0) {      // E then 1: off the door behind them, and back
      b.x = b.wall; b.vx = -b.vx; b.face = -b.face; b.back = true; b.skip = 0; b.trail.length = 0;
      sfx.door(.9); sfx.ball(1.1); V.sparks(b.x, b.y, 'gold', 9); V.ring(b.x, b.y, 120, GOLD, .16); shake(8);
    }
    const at = !(b.skip > 0) && live(o) && !(o.inv > 0) && (o.state !== 'down' || b.rebound) && o.state !== 'up' ? through(b, x0, y0, o) : null;
    if (at) {
      b.x = at[0]; b.y = at[1]; b.hit = true;
      const goOn = b.rebound && !b.back;
      E.applyHit(o, b.face, { dmg: exact(o, b.dmg), kb: b.volley ? 700 : goOn ? 0 : 160, stun: .9, stop: b.volley ? .12 : .06, heavy: b.volley ? 1 : 0, col: '#e6edf5', fixed: 1, mute: 1, ind: 'ball', indCol: b.col, src: b.m || b });
      sfx.ball(1.2); sfx.hit(!!b.volley); V.sparks(b.x, b.y, 'green', 10); V.ring(b.x, b.y, 110, '#e6edf5', .16); if (Z) Z.flare(b.x, b.y, '230,240,255', 240, .14);
      if (goOn) {                                    // on through them to a door that has come up behind them
        b.wall = clamp(o.x + b.face * 230, -940, 940); b.skip = .14; b.vy = 0; b.y = o.state === 'down' ? o.y + 45 : mid(o);
        doors.push({ x: b.wall, t: 0, single: true, life: .8, face: b.face, col: b.col });
        continue;
      }
      if (b.volley) {                                // 1 then 4: and into a door behind them
        const f = b.face, q = o;
        doors.push({ x: clamp(q.x + f * 200, -930, 930), t: 0, single: true, life: .9, face: f, col: b.col });
        E.after(.1, () => { if (q.ko) return; E.applyHit(q, f, { dmg: exact(q, 10), kb: 420, lift: 380, stun: .8, stop: .1, heavy: 1, col: GOLD, fixed: 1, mute: 1 }); play('home-gb-slam', .8, () => sfx.door(1.2)); label(q.x, q.y + 460 * hs(q), 'INTO THE DOOR', GOLD, .9); });
      }
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
  const c = F(b.x, b.y), k = c[2], r = BALL_R * k * (b.r || 1), tc = tintCol(b.col);
  if (tc) lit(() => { g.fillStyle = tc; g.globalAlpha = .35; g.beginPath(); g.arc(c[0], c[1], r * 2.1, 0, TAU); g.fill(); g.globalAlpha = 1; });      // (its colour, in his domain)
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
// o: { hold, dmg, noHit, target, single, face, keep (stays shut on nothing), wide (0.22: the second pair of a Double Lock, round the first),
// air (0.22: Closing Time: catches them in the air too, and brings them down), m (the move, for idg.js) }
function shut(x, o = {}) {
  const d = { x, t: 0, hold: o.hold === undefined ? 1.6 : o.hold, o: null, hitDone: false, dmg: o.dmg === undefined ? 25 : o.dmg, noHit: !!o.noHit, target: o.target || null, single: !!o.single, face: o.face || 1, burst: 0, keep: !!o.keep,
    wide: o.wide ? 1.22 : 1, outer: !!o.wide, air: !!o.air, m: o.m || null, col: tint ? tint('door') : null };
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
      if (live(who) && Math.abs(who.x - d.x) < 165 * hs(who) * d.wide && who.y < (d.air ? 440 : 260)) {
        d.o = who;
        if (!d.noHit && d.dmg > 0) E.applyHit(who, who.x >= E.P1.x ? 1 : -1, { dmg: exact(who, d.dmg), kb: 0, stun: d.hold + .1, stop: .08, heavy: 1, col: GOLD, fixed: 1, mute: 1, ind: 'door', indCol: d.col, src: d.m || d });
        V.sparks(d.x, mid(who), 'gold', 10);
      } else if (!d.keep) d.hold = .35;            // shut on nothing: open again soon
    }
    if (d.o && d.t < SHUT + d.hold && !d.burst) {   // shut in there: kept where the doors are
      const q = d.o;
      if (!duel() && !q.net && !q.poise && !q.ko) {
        q.x = lerp(q.x, d.x, 1 - Math.exp(-dt * 20)); q.vx = 0;
        if (d.air && !q.ground) { q.y = Math.max(0, lerp(q.y, 0, 1 - Math.exp(-dt * 12))); q.vy = 0; if (q.y < 4) { q.y = 0; q.ground = true; } }      // (Closing Time: brought down out of the air)
        if (q.ground) Object.assign(q, { state: 'hurt', stun: Math.max(q.stun || 0, .2), act: null, tele: 0 });
      }
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
      g.save(); g.globalAlpha = a; panel(c[0] - W2 / 2, c[1] - H2 * u, W2, H2 * u, k, d.face); glowRim(c[0] - W2 / 2, c[1] - H2 * u, W2, H2 * u, k, d.col); g.restore();
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
    const gap = ((1 - close) * 260 * k + open * 300 * k) * d.wide, Ww = W2 * d.wide, Hw = H2 * d.wide, ty = c[1] - Hw;
    const a = d.burst ? Math.max(0, 1 - (d.t - d.burst) / .12) : 1 - open;
    if (a <= 0) continue;
    g.save(); g.globalAlpha = a;
    panel(c[0] - gap - Ww * 2, ty, Ww * 2, Hw, k, -1);
    panel(c[0] + gap, ty, Ww * 2, Hw, k, 1);
    if (d.col) { glowRim(c[0] - gap - Ww * 2, ty, Ww * 2, Hw, k, d.col); glowRim(c[0] + gap, ty, Ww * 2, Hw, k, d.col); }
    if (d.outer && d.t < SHUT + d.hold) {            // the second lock: a bar across both of them
      g.fillStyle = '#c9a23a'; g.fillRect(c[0] - Ww * 1.2, ty + Hw * .52, Ww * 2.4, 14 * k); g.strokeStyle = '#3a2a08'; g.lineWidth = 3 * k; g.strokeRect(c[0] - Ww * 1.2, ty + Hw * .52, Ww * 2.4, 14 * k);
      g.fillStyle = GOLD; g.beginPath(); g.arc(c[0], ty + Hw * .52 + 7 * k, 20 * k, 0, TAU); g.fill(); g.stroke();
    }
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
// 0.22: held, it goes on gathering for up to 1.2 seconds more, and what it does goes from 42 to 70: All In
const ALLIN = 1.2, ALLIN_MAX = 70;
let roughAt = -9;                                   // when Rough Energy last landed (3 then 4: Sky Fever)
const ROUGH = { name: 'Rough Energy', cd: 8, dur: 2.6, ind: 'ball', run(p, m, t) {
  const o = E.P2;
  p.rate = 36;
  if (m.go === undefined) {                         // gathering: .3 of a second, or for as long as 3 is held (1.2 more at most)
    const more = t >= .3 && held('3', 'div') && t < .3 + ALLIN;
    if (t >= .3 && !more) { m.go = t; m.c = clamp((t - .3) / ALLIN, 0, 1); if (m.c > .08) label(p.x, p.y + 450, m.c >= 1 ? 'ALL IN' : 'RAISE', GREEN, .8); }
    else {
      const c = clamp((t - .3) / ALLIN, 0, 1);
      p.target = POSE.gbCharge; p.vx = 0; gather = { f: p, t: Math.min(t, .3), s: 1 + c * .7 };
      if (!m.s) { m.s = 1; sfx.rough(.6); }
      if (c > 0 && Math.floor(c * 6) !== m.tick) { m.tick = Math.floor(c * 6); sfx.rough(.4 + c * .5); shake(4 + c * 8); }
      if (Math.random() < .6 + c * .4) grit.push({ x: p.x + rnd(-60, 60) * (1 + c), y: p.y + rnd(20, 120), vx: rnd(-80, 80), vy: rnd(200, 500), t: 0, life: .3, s: rnd(4, 8) * (1 + c * .6), r: 0 });
      return;
    }
  }
  gather = null;
  const s = t - m.go + .3, c = m.c, dmg = 42 + (ALLIN_MAX - 42) * c;      // (s: on the clock the move had before it could be held)
  const gap = (o.x - p.x) * p.face;                 // (in on them first, from as far as a fight starts)
  p.target = s < .62 ? POSE.gbRound : POSE.idle; p.vx = s < .54 && gap > 165 && !m.done ? p.face * (1350 + 500 * c) : 0;
  if (!m.done && s > .32 && s < .58 && E.tryHit(p, { reach: 250, dmg: exact(o, dmg), kb: 1250 + 300 * c, lift: 620 + 180 * c, stun: 1, stop: .2 + .1 * c, heavy: 1, col: GREEN, fixed: 1, mute: 1 })) {
    m.done = 1; roughAt = E.T; roughBurst(o.x, mid(o), 1 + .6 * c); play('home-gb-kick', .9, () => sfx.hit(true)); shake(26 + 14 * c); E.zoomIn(.3 + .2 * c);
  }
  if (s > .95) E.endMove(p);
} };

/* ================= 1 + 3: the ball, ridden ================= */
const RIDE = { name: 'Ball Ride', dur: 1.8, ind: 'ball', run(p, m, t) {
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
const FEVER = { name: 'Fever Breaker', cd: 10, dur: 3.4, ind: 'door', run(p, m, t) {
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
    m.end = m.spring ? 'spring' : m.doors && m.rough ? 'jackpot' : m.doors ? 'slam' : m.rough ? 'rough' : 'kick'; m.et = t;
    if (m.end === 'spring') {                      // 4 then E (0.22): the door behind them throws them back at him
      play('home-gb-slam', .8, () => sfx.door(1.3)); shake(16); V.ring(m.door - f * 60, mid(o), 220, GOLD, .25); V.sparks(m.door - f * 60, mid(o), 'gold', 10);
      if (can(p, o)) { o.vx = -f * 1150; Object.assign(o, { state: 'hurt', stun: .5, act: null, tele: 0 }); }
      label(o.x, o.y + 470 * hs(o), 'SPRING DOOR', GOLD, 1);
    }
    if (m.end === 'kick') {                        // the second kick: the length of the arena
      E.applyHit(o, f, { dmg: exact(o, 30), kb: 1400, lift: 520, stun: .9, stop: .16, heavy: 1, col: GREEN, fixed: 1, mute: 1 });
      play('home-gb-kick', 1, () => sfx.hit(true)); shake(22); V.ring(o.x, mid(o), 260, GREEN, .3); E.addBlast(o.x, mid(o), GRGB, 220);
    } else if (m.end === 'rough') {                // 4 then 3: the second kick full of rough energy
      E.applyHit(o, f, { dmg: exact(o, 42), kb: 1450, lift: 600, stun: 1, stop: .2, heavy: 1, col: GREEN, fixed: 1, mute: 1 });
      roughBurst(o.x, mid(o), 1); play('home-gb-kick', 1, () => sfx.hit(true)); shake(26);
    } else if (m.end !== 'spring') {                // 4 then 2 (and 3): the doors shut on them
      m.shut = shut(clamp(o.x, -930, 930), { target: o, hold: m.end === 'jackpot' ? 2.2 : 1.2, dmg: m.end === 'jackpot' ? 0 : 15, noHit: m.end === 'jackpot', keep: true });
      label(o.x, o.y + 470 * hs(o), m.end === 'jackpot' ? 'ALL OR NOTHING' : 'SHUT IN', GOLD, 1.2);
      if (m.end === 'jackpot') { play('home-gb-reels', .7, () => sfx.ding(0)); reels = { t: 0, x: o.x, stop: [], o }; }
    }
  }
  const s = t - m.et;
  if (m.end === 'kick' || m.end === 'rough') { p.target = s < .35 ? POSE.gbRound : POSE.idle; if (s > .5) E.endMove(p); return; }
  if (m.end === 'spring') {                         // and he is waiting for them: the counter kick
    if (s >= .16 && !m.kick2) {
      m.kick2 = 1;
      if (!o.ko) { E.applyHit(o, f, { dmg: exact(o, 45), kb: 1500, lift: 560, stun: 1, stop: .2, heavy: 1, col: GREEN, fixed: 1, mute: 1 }); roughBurst(o.x, mid(o), 1); play('home-gb-kick', 1, () => sfx.hit(true)); shake(28); E.zoomIn(.3); }
    }
    p.target = s < .16 ? POSE.kickWind : s < .5 ? POSE.gbRound : POSE.idle;
    if (s > .7) E.endMove(p);
    return;
  }
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

/* ================= Build 0.22: fifteen more ways to go about it (the head of this file has the list) ================= */
function begin(p, def, key) {                       // one thing over, and the next straight on from it
  if (p.move) E.endMove(p);
  p.move = { def, key, t: 0 };
  if (E.hud.mv[key]) E.hud.mv[key].classList.add('act');
  return p.move;
}
// the doors that have somebody shut in them just now (the first pair, not a Double Lock's second)
const holdingDoors = () => doors.find(d => d.o && !d.burst && !d.single && !d.sweep && !d.outer && d.t < SHUT + d.hold && live(d.o)) || null;
const burstAll = q => { for (const d of doors) if (d.o === q && !d.burst && !d.single) burstDoors(d); };

// ---- in the air, 1: three balls down at them, one after another, each fanned a little off the one before ----
const SHOWER = { name: 'Reserve Shower', dur: .62, ind: 'ball', run(p, m, t) {
  p.rate = 40; p.vx *= .92; if (p.vy < -140) p.vy = -140;      // (it holds him up a moment)
  p.target = t < .08 ? POSE.hookWind : Math.floor(t / .05) % 2 ? POSE.gbThrow : POSE.hookWind;
  while ((m.n || 0) < 3 && t >= .08 + (m.n || 0) * .09) { const i = m.n = (m.n || 0) + 1; throwBall(p, { dmg: 9, m, turn: (i - 2) * .11, quiet: i > 1 }); if (i > 1) sfx.click(.8); }
  if (t > .4 && p.ground) E.endMove(p);
} };
// ---- in the air, 2: one door, dropped on them from above. Whoever it lands on is pinned flat under it ----
const falls = [];                                   // { x, y, vy, t, landed, face, col, m }
const DROPDOOR = { name: 'Drop Shutter', dur: .55, ind: 'door', run(p, m, t) {
  p.rate = 36; p.target = t < .3 ? POSE.gbSnap : POSE.fall; if (p.vy < -200) p.vy = -200;
  if (m.s || t < .1) return;
  m.s = 1;
  const o = E.P2, x = live(o) && Math.abs(o.x - p.x) < 1200 ? o.x : p.x + p.face * 320;
  falls.push({ x: clamp(x, -930, 930), y: 1000, vy: -500, t: 0, landed: 0, face: p.face, col: tint ? tint('door') : null, m });
  sfx.whoosh(); play('home-gb-door', .5, () => sfx.door(.7));
} };
function fallsTick(dt) {
  const o = E.P2;
  for (let i = falls.length - 1; i >= 0; i--) {
    const d = falls[i];
    d.t += dt;
    if (!d.landed) {
      d.vy -= 5600 * dt; d.y += d.vy * dt;
      if (d.y > 0) continue;
      d.y = 0; d.landed = d.t;
      play('home-gb-slam', .9, () => sfx.door(1.3)); sfx.door(.8); shake(26); E.addDust(d.x); V.crack(d.x, 260); V.rocks(d.x, 0, 12);
      if (Z) Z.shock(d.x, 420, DRGB, .35, 10);
      if (live(o) && Math.abs(o.x - d.x) < 150 * hs(o) && o.y < 330 && o.state !== 'down' && o.state !== 'up') {
        E.applyHit(o, o.x >= E.P1.x ? 1 : -1, { dmg: exact(o, 30), kb: 0, stun: 1.3, stop: .12, heavy: 1, col: GOLD, fixed: 1, mute: 1, ind: 'door', indCol: d.col, src: d.m || d });
        if (can(E.P1, o)) Object.assign(o, { x: d.x, y: 0, vy: 0, vx: 0, ground: true, state: 'down', stun: 1.3, act: null, tele: 0 });      // flat under it
        label(d.x, 470, 'PINNED', GOLD, 1);
      }
    }
    if (d.landed && d.t - d.landed > .8) falls.splice(i, 1);
  }
}
function drawFalls() {
  for (const d of falls) {
    const c = F(d.x, Math.max(0, d.y)), k = c[2], w = 150 * k, h = 470 * k, a = d.landed ? clamp(1 - (d.t - d.landed - .5) / .3, 0, 1) : 1;
    if (a <= 0) continue;
    g.save(); g.globalAlpha = a;
    if (!d.landed) lit(() => { const gr = g.createLinearGradient(0, c[1] - h - 300 * k, 0, c[1] - h); gr.addColorStop(0, 'rgba(230,236,244,0)'); gr.addColorStop(1, 'rgba(230,236,244,.35)'); g.fillStyle = gr; g.fillRect(c[0] - w * .45, c[1] - h - 300 * k, w * .9, 300 * k); });      // the rush of air over it
    if (d.landed) { g.save(); g.translate(c[0], c[1] - 18 * k); g.scale(1, .2); panel(-w * .7, -h / 2, w * 1.4, h, k, d.face); g.restore(); }      // down flat, on them
    else { panel(c[0] - w / 2, c[1] - h, w, h, k, d.face); glowRim(c[0] - w / 2, c[1] - h, w, h, k, d.col); }
    g.restore();
  }
}
// ---- in the air, 3: down heel first with the rough energy round his leg, and it goes off where he lands ----
const METEOR = { name: 'Rough Meteor', dur: 1.8, ind: 'ball', run(p, m, t) {
  const o = E.P2;
  p.rate = 40;
  if (t < .2) { p.target = POSE.gbAxeW; p.vx *= .8; p.vy = Math.max(p.vy, 60); gather = { f: p, t: .3, s: .8 }; if (!m.s) { m.s = 1; sfx.rough(.6); } return; }
  if (!m.dive) { m.dive = 1; p.vy = -2700; const tx = live(o) ? o.x : p.x + p.face * 260; p.vx = clamp((tx - p.x) / .28, -2400, 2400); sfx.whoosh(); }
  if (m.land === undefined) {
    p.target = POSE.gbDive; gather = { f: p, t: .3, s: 1.1 };
    if (Math.random() < .8) grit.push({ x: p.x + rnd(-40, 40), y: p.y + rnd(40, 160), vx: rnd(-80, 80), vy: rnd(200, 600), t: 0, life: .3, s: rnd(4, 9), r: 0 });
    if (!p.ground && t < 1.4) return;
    m.land = t; gather = null; p.vx = 0;
    roughBurst(p.x, 70, 1.25); V.crack(p.x, 340); V.rocks(p.x, 0, 16); E.addDust(p.x); shake(34); E.zoomIn(.3);
    if (Z) Z.boom(p.x, 30, 130, GRGB, { n: 18, smoke: '20,40,30', hot: '220,255,235' });
    if (live(o) && Math.abs(o.x - p.x) < 270 && o.y < 260 && o.state !== 'down' && o.state !== 'up') {
      E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: exact(o, 40), kb: 700, lift: 950, stun: 1, stop: .18, heavy: 1, col: GREEN, fixed: 1, mute: 1 });
      label(o.x, o.y + 470 * hs(o), 'METEOR', GREEN, .9);
    }
    play('home-gb-kick', 1, () => sfx.hit(true));
    return;
  }
  p.target = t < m.land + .2 ? POSE.gbAxe : POSE.idle;
  if (t > m.land + .4) E.endMove(p);
} };
// ---- in the air, 4: kicked down onto a door lying on the floor, up off it, and into the second kick ----
const flats = [];                                   // { x, t, life, face, col }: doors lying on the floor
const SPIKE = { name: 'Fever Spike', dur: 1.6, ind: 'door', run(p, m, t) {
  const o = m.o || (m.o = E.P2), f = p.face;
  p.rate = 42;
  if (!m.k1) {
    p.target = t < .1 ? POSE.gbAxeW : POSE.gbAxe; if (p.vy < -300) p.vy = -300;
    const dx = (o.x - p.x) * f;
    if (t >= .08 && live(o) && dx > -40 && dx < 270 && Math.abs(o.y - p.y) < 320 && o.state !== 'down' && o.state !== 'up') {
      m.k1 = t;
      E.applyHit(o, f, { dmg: exact(o, 18), kb: 0, stun: 1.2, stop: .1, heavy: 1, col: GREEN, fixed: 1, mute: 1 });
      play('home-gb-kick', .9, () => sfx.hit(true)); shake(16);
      m.floor = clamp(o.x, -930, 930); flats.push({ x: m.floor, t: 0, life: 1.2, face: f, col: tint ? tint('door') : null });
      if (can(p, o)) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 30), vy: -2300, vx: 0, bounced: true });
      label(o.x, o.y + 460 * hs(o), 'SPIKE', GREEN, .8);
    } else if (t > .45) E.endMove(p);
    return;
  }
  const s = t - m.k1;
  if (s >= .22 && !m.bounce) {                       // off the door and back up, into the second
    m.bounce = 1; play('home-gb-slam', .7, () => sfx.door(1.1)); shake(18); V.sparks(m.floor, 20, 'gold', 10); E.addDust(m.floor); V.ring(m.floor, 20, 200, GOLD, .25);
    if (can(p, o)) Object.assign(o, { ground: false, state: 'air', y: 30, vy: 1250, vx: 0, bounced: false });
  }
  if (s >= .5 && !m.k2) {
    m.k2 = 1;
    if (!o.ko) {
      p.x = clamp(o.x - f * 140, -960, 960); p.y = Math.max(p.y, o.y); p.vy = 200;
      E.applyHit(o, f, { dmg: exact(o, 32), kb: 1350, lift: 520, stun: .9, stop: .16, heavy: 1, col: GREEN, fixed: 1, mute: 1 });
      roughBurst(o.x, mid(o), .7); play('home-gb-kick', 1, () => sfx.hit(true)); shake(24);
    }
  }
  p.target = s < .48 ? POSE.gbAxe : s < .75 ? POSE.gbRound : POSE.idle;
  if ((s > .9 && p.ground) || s > 1.4) E.endMove(p);
} };
function drawFlats() {
  for (const d of flats) {
    const c = F(d.x, 0), k = c[2], w = 230 * k, h = 470 * k, u = Math.min(1, d.t / .1), a = clamp((d.life - d.t) * 4, 0, 1);
    g.save(); g.globalAlpha = a; g.translate(c[0], c[1] - 6 * k); g.scale(u, .18); panel(-w / 2, -h / 2, w, h, k, d.face); glowRim(-w / 2, -h / 2, w, h, k, d.col); g.restore();
  }
}
// ---- E then 1: a ball through them, off a door that comes up behind them, and back through them ----
const REBOUND = { name: 'Rebound Ball', dur: .45, ind: 'ball', run(p, m, t) {
  p.vx = 0; p.rate = 38; p.target = t < .1 ? POSE.hookWind : t < .3 ? POSE.gbThrow : POSE.idle;
  if (!m.s && t >= .08) { m.s = 1; throwBall(p, { dmg: 18, m, rebound: true, v: 1.15 }); label(p.x, p.y + 440, 'REBOUND', GREEN, .8); }
} };
// ---- E then 2: the doors shut on them wherever the counter has thrown them, in the air too ----
const CLOSING = { name: 'Closing Time', dur: .5, ind: 'door', run(p, m, t) {
  p.vx = 0; p.rate = 34; p.target = t < .3 ? POSE.gbSnap : POSE.idle;
  if (m.s || t < .08) return;
  m.s = 1;
  const o = E.P2, x = clamp(live(o) ? o.x : p.x + p.face * 420, -930, 930);
  shut(x, { target: live(o) ? o : null, hold: 1.6, dmg: 30, air: true, m });
  label(x, 540, 'CLOSING TIME', GOLD, 1.1);
} };
// ---- E then 3, while his doors are up: he kicks them along the floor, and whoever is in the way goes with them ----
let ram = null;                                     // { x, face, t, hit, o, col, m }
const RAM = { name: 'Door Ram', dur: .9, ind: 'door', run(p, m, t) {
  p.rate = 44; p.vx = 0;
  p.target = t < .12 ? POSE.kickWind : t < .45 ? POSE.gbFront : POSE.idle;
  if (!m.s && t >= .12) { m.s = 1; ram = { x: p.x + p.face * 105, face: p.face, t: 0, hit: false, o: E.P2, col: tint ? tint('door') : null, m }; play('home-gb-kick', .9, () => sfx.hit(true)); sfx.door(1); shake(14); }
} };
function ramTick(dt) {
  const R = ram;
  if (!R) return;
  R.t += dt;
  const x0 = R.x, o = R.o;
  R.x = clamp(R.x + R.face * 2300 * dt, -960, 960);
  if (!R.hit && live(o) && (o.x - x0) * R.face > -60 && (o.x - R.x) * R.face < 70 && o.y < 300 && o.state !== 'down' && o.state !== 'up') {
    R.hit = true;
    E.applyHit(o, R.face, { dmg: exact(o, 30), kb: 0, stun: 1, stop: .12, heavy: 1, col: GOLD, fixed: 1, mute: 1, ind: 'door', indCol: R.col, src: R.m || R });
    play('home-gb-slam', .8, () => sfx.door(1.3)); shake(22); label(o.x, o.y + 460 * hs(o), 'RAMMED', GOLD, .9);
  }
  if (R.hit && can(E.P1, o)) { o.x = clamp(R.x + R.face * 75, -960, 960); o.vx = 0; Object.assign(o, { state: 'hurt', stun: Math.max(o.stun || 0, .3), act: null, tele: 0 }); }
  if (Math.abs(R.x) >= 960 || R.t > .45) {           // a wall, or as far as it goes: the doors in pieces, and whoever was on them thrown on
    burstDoors({ x: R.x, t: 0, burst: 0 });
    if (R.hit && !o.ko) E.applyHit(o, R.face, { dmg: exact(o, 8), kb: Math.abs(R.x) >= 960 ? 300 : 1100, lift: 480, stun: .9, stop: .1, heavy: 1, col: GREEN, fixed: 1, mute: 1 });
    ram = null;
  }
}
function drawRam() {
  const R = ram;
  if (!R) return;
  const c = F(R.x, 0), k = c[2], top = F(R.x, 380), h = c[1] - top[1], w = 70 * k;
  g.save();
  lit(() => { g.strokeStyle = 'rgba(230,236,244,.6)'; g.lineWidth = 3 * k; for (let i = 0; i < 6; i++) { const y = c[1] - h * (.1 + i * .16); g.beginPath(); g.moveTo(c[0] - R.face * w * 1.2, y); g.lineTo(c[0] - R.face * (w * 1.2 + (120 + i * 30) * k), y); g.stroke(); } });
  panel(c[0] - w, top[1], w, h, k, -1); panel(c[0], top[1], w, h, k, 1);
  if (R.col) { glowRim(c[0] - w, top[1], w, h, k, R.col); glowRim(c[0], top[1], w, h, k, R.col); }
  g.restore();
}
// ---- 2 then E: a second pair of doors shuts round the first, with a bar across: longer in there ----
function lock(p, d) {
  d.hold += 1.4; d.locked = 1;
  const outer = shut(d.x, { target: d.o, hold: Math.max(.3, d.hold - d.t), dmg: 18, wide: true, keep: true });
  outer.locked = 1;
  label(d.x, 560, 'DOUBLE LOCK', GOLD, 1.2); sfx.door(1.2); shake(12);
}
// ---- 2 then 3, while the doors have them: rough energy through the doors, and through them ----
const BREAKER = { name: 'Door Breaker', dur: 1, ind: 'door', run(p, m, t) {
  const d = m.d, o = (d && d.o) || E.P2, f = p.face;
  p.rate = 40;
  if (t < .22) { p.target = POSE.gbCharge; p.vx = 0; gather = { f: p, t: .3, s: .9 }; if (!m.s) { m.s = 1; sfx.rough(.8); } return; }
  gather = null;
  const gap = (o.x - p.x) * f;
  if (!m.done) {
    p.target = POSE.gbRound; p.vx = gap > 175 ? f * 1600 : 0;
    if (gap < 200 || t > .5) {
      m.done = 1; p.vx = 0;
      if (!o.ko) { if (gap > 200) p.x = clamp(o.x - f * 175, -960, 960); E.applyHit(o, f, { dmg: exact(o, 55), kb: 1450, lift: 640, stun: 1, stop: .22, heavy: 1, col: GREEN, fixed: 1, mute: 1 }); }
      burstAll(o); roughBurst(o.x, mid(o), 1.25); play('home-gb-kick', 1, () => sfx.hit(true)); shake(32); E.zoomIn(.35);
      label(o.x, o.y + 480 * hs(o), 'DOOR BREAKER', GREEN, 1);
    }
    return;
  }
  p.vx = 0; p.target = t < .7 ? POSE.gbRound : POSE.idle;
} };
// ---- 2 then 1, while the doors have them: a ball in there with them, rattling from one door to the other ----
let pin = null;                                     // { d, t, n, col, m }
const PIN_N = 6, PIN_GAP = .13;
const PINBALL = { name: 'Pinball', dur: .45, ind: 'ball', run(p, m, t) {
  p.vx = 0; p.rate = 38; p.target = t < .1 ? POSE.hookWind : t < .3 ? POSE.gbThrow : POSE.idle;
  if (!m.s && t >= .08) { m.s = 1; m.d.hold += .9; pin = { d: m.d, t: 0, n: 0, col: tint ? tint('ball') : null, m }; sfx.click(); sfx.whoosh(); label(m.d.x, 560, 'PINBALL', '#e6edf5', 1); }
} };
function pinTick(dt) {
  const P0 = pin;
  if (!P0) return;
  P0.t += dt;
  const d = P0.d, o = d.o;
  if (d.burst || !o || o.ko) { pin = null; return; }
  while (P0.n < PIN_N && P0.t >= .15 + P0.n * PIN_GAP) {
    P0.n++;
    E.applyHit(o, P0.n % 2 ? 1 : -1, { dmg: exact(o, 6), kb: 0, stun: 1, stop: .03, col: '#e6edf5', fixed: 1, mute: 1, ind: 'ball', indCol: P0.col, src: P0.m });
    sfx.ball(.9); V.sparks(d.x + (P0.n % 2 ? 60 : -60), mid(o) + rnd(-60, 90), 'white', 5);
  }
  if (P0.n >= PIN_N && P0.t > .25 + PIN_N * PIN_GAP) { pop({ x: d.x, y: mid(o) }); pin = null; }
}
function drawPin() {
  const P0 = pin;
  if (!P0 || !P0.d.o) return;
  const d = P0.d, o = d.o, u = (P0.t - .15) / PIN_GAP, tri = Math.abs(((u % 2) + 2) % 2 - 1) * 2 - 1;      // from one door to the other and back
  if (u < 0) return;
  const c = F(d.x + tri * 105, mid(o) + 60 * Math.sin(P0.t * 23)), k = c[2], r = BALL_R * k * .9, tc = tintCol(P0.col);
  if (tc) lit(() => { g.fillStyle = tc; g.globalAlpha = .4; g.beginPath(); g.arc(c[0], c[1], r * 2.2, 0, TAU); g.fill(); g.globalAlpha = 1; });
  lit(() => E.glow(E.GLOW.white, c[0], c[1], r * 4, .35));
  g.fillStyle = '#dfe6ef'; g.beginPath(); g.arc(c[0], c[1], r, 0, TAU); g.fill(); g.lineWidth = 2 * k; g.strokeStyle = LINE; g.stroke();
}
// ---- 3 then 4, while they are still up off Rough Energy: after them into the air, a door up there, and the kick off it ----
const airDoors = [];                                // { x, y, t, life, face, col, burstT }
const SKYFEVER = { name: 'Sky Fever', dur: 1.5, ind: 'door', run(p, m, t) {
  const o = m.o || (m.o = E.P2);
  p.rate = 44;
  if (!m.k1) {                                       // after them: there in a moment, wherever they have got to
    if (!m.from) { m.from = [p.x, p.y]; p.face = o.x >= p.x ? 1 : -1; sfx.whoosh(); V.ring(p.x, p.y + 120, 160, GREEN, .2); }
    const f = p.face, u = ease(clamp(t / .14, 0, 1));
    p.x = lerp(m.from[0], clamp(o.x - f * 150, -960, 960), u); p.y = lerp(m.from[1], Math.max(0, o.y - 30), u); p.vy = 0; p.vx = 0; p.ground = p.y <= 0;
    p.target = POSE.dash; p.inv = Math.max(p.inv || 0, .2);
    if (t < .14) return;
    m.k1 = t;
    if (!o.ko) E.applyHit(o, f, { dmg: exact(o, 22), kb: 0, stun: 1.2, stop: .1, heavy: 1, col: GREEN, fixed: 1, mute: 1 });
    m.door = { x: clamp(o.x + f * 200, -930, 930), y: Math.max(40, o.y - 40) };
    airDoors.push({ x: m.door.x, y: m.door.y, t: 0, life: 1, face: f, col: tint ? tint('door') : null });
    m.x0 = o.x; m.y0 = o.y; play('home-gb-kick', .8, () => sfx.hit(true)); shake(12); label(o.x, o.y + 460 * hs(o), 'SKY FEVER', GOLD, .9);
    return;
  }
  const f = p.face, s = t - m.k1;
  if (s < .3) {                                      // into the door, up there
    if (can(p, o)) { const u = clamp(s / .18, 0, 1); o.x = lerp(m.x0, m.door.x - f * 70, ease(u)); o.y = lerp(m.y0, m.door.y, ease(u)); o.vx = 0; o.vy = 0; Object.assign(o, { state: 'air', ground: false }); }
    if (s > .18 && !m.bang) { m.bang = 1; sfx.door(1.1); shake(14); V.sparks(m.door.x - f * 60, m.door.y + 170, 'gold', 8); }
    p.vy = Math.max(p.vy, 0); p.target = s < .15 ? POSE.gbFront : POSE.kickWind;
    return;
  }
  if (!m.k2) {
    m.k2 = 1;
    if (!o.ko) { p.x = clamp(o.x - f * 140, -960, 960); p.y = Math.max(0, o.y - 20); E.applyHit(o, f, { dmg: exact(o, 34), kb: 1500, lift: 300, stun: .9, stop: .18, heavy: 1, col: GREEN, fixed: 1, mute: 1 }); }
    roughBurst(o.x, mid(o), .9); play('home-gb-kick', 1, () => sfx.hit(true)); shake(26);
    const k = airDoors.length - 1; if (k >= 0) { airDoors[k].burstT = airDoors[k].t; burstDoors({ x: airDoors[k].x, t: 0, burst: 0 }); }
  }
  p.target = s < .55 ? POSE.gbRound : POSE.fall;
  if ((s > .6 && p.ground) || s > 1.1) E.endMove(p);
} };
function drawAirDoors() {
  for (const d of airDoors) {
    const c = F(d.x, d.y), k = c[2], w = 140 * k, h = 420 * k, u = Math.min(1, d.t / .12), a = d.burstT !== undefined ? 0 : clamp((d.life - d.t) * 4, 0, 1);
    if (a <= 0) continue;
    g.save(); g.globalAlpha = a; panel(c[0] - w / 2, c[1] - h * u, w, h * u, k, d.face); glowRim(c[0] - w / 2, c[1] - h * u, w, h * u, k, d.col); g.restore();
  }
}
// ---- 1 then 4, while the ball is still on its way: he catches it with a kick, at them, twice as fast and twice as hard, and into a door ----
const VOLLEY = { name: 'Volley', dur: .7, ind: 'ball', run(p, m, t) {
  const b = m.b, o = E.P2;
  p.rate = 44;
  if (!m.k) {
    if (!b || b.spent || b.hit || balls.indexOf(b) < 0) { E.endMove(p); return; }
    if (!m.x0) { m.x0 = p.x; sfx.whoosh(); }
    const tx = clamp(b.x - p.face * 75, -960, 960);
    p.x = lerp(m.x0, tx, ease(clamp(t / .12, 0, 1))); p.vx = 0; p.target = POSE.kickWind; p.inv = Math.max(p.inv || 0, .15);
    if (t < .12) return;
    m.k = 1;
    let ux = p.face, uy = 0;
    if (live(o)) { const dx = o.x - b.x, dy = mid(o) - b.y, L = Math.hypot(dx, dy) || 1; ux = dx / L; uy = dy / L; }
    b.vx = ux * BALL_V * 1.8; b.vy = uy * BALL_V * 1.8; b.dmg = 40; b.volley = true; b.face = Math.sign(b.vx) || p.face; b.m = m; b.trail.length = 0;
    play('home-gb-kick', .9, () => sfx.hit(true)); V.ring(b.x, b.y, 150, GREEN, .2); roughBurst(b.x, b.y, .5); shake(14); label(b.x, b.y + 140, 'VOLLEY', GREEN, .8);
    return;
  }
  p.target = t < .4 ? POSE.gbRound : POSE.idle;
} };
const AIR = { strikes: SHOWER, crush: DROPDOOR, div: METEOR, manji: SPIKE };
let afterE = -9;                                    // when Bouncer Doors last sent a blow back (E then 1, E then 2)

/* ================= the technique ================= */
const MOVES = { strikes: BALLS, crush: { name: 'Shutter Doors', cd: 7, dur: .5, ind: 'door', run(p, m, t) {
  p.vx = 0; p.rate = 34; p.target = t < .3 ? POSE.gbSnap : POSE.idle;
  if (m.s || t < .1) return;
  m.s = 1;
  const o = E.P2, x = live(o) && Math.abs(o.x - p.x) < 950 ? o.x : p.x + p.face * 420;
  shut(clamp(x, -930, 930), { m });
} }, div: ROUGH, manji: FEVER };
JU.tech.add('gambler', { name: 'Double or Nothing', jp: '一か八か', mark: '博', who: 'Pachinko, doors, and rough energy', odds: 0, col: GREEN, glow: 'green', moves: MOVES,
  early: true, m1,
  hint: '<b>1</b> Reserve Balls · <b>2</b> Shutter Doors · <b>3</b> Rough Energy · <b>4</b> Fever Breaker · <b>E</b> Bouncer Doors · <b>G</b> Idle Death Gamble' });      // (the bottom-left line is for the basics only: the user's rule)
const DEF = JU.tech.TECH.gambler, on = () => JU.tech.active === DEF;

// E (0.22): pressed by itself it is Bouncer Doors, as before; pressed while something else is going it can be part of that (4 then E, 2 then E).
// So it is a press of its own here (especial.js calls press), with its own wait
let ecd = 0;
const slotFlash = () => { const el = E.hud.mv.esp; if (el) { el.classList.add('act'); setTimeout(() => el.classList.remove('act'), 220); } };
const ESPECIAL = { name: ESP.name, jp: ESP.jp, col: GREEN, max: ESP.cd, get left() { return ecd; }, nocd() { ecd = 0; },
  press(p) {
    if (p.dead) return true;
    const m = p.move;
    if (m && m.def === FEVER && m.k1 && !m.miss && !m.end && !m.spring && ecd <= 0) {      // 4 then E: Spring Door
      m.spring = 1; ecd = ESP.cd; slotFlash(); label(p.x, p.y + 470, 'SPRING', GOLD, .7); return true;
    }
    const hd = holdingDoors();
    if (hd && !hd.locked && ecd <= 0 && (!m || m.def === MOVES.crush || m.def === CLOSING)) { ecd = ESP.cd; slotFlash(); lock(p, hd); return true; }      // 2 then E: Double Lock
    if (ecd > 0) { sfx.back(); return true; }
    if (m || p.ps || p.dashT > 0 || !p.ground) return true;      // (in the middle of something: not now)
    ecd = ESP.cd; p.move = { def: ESP, key: 'esp', t: 0 }; E.hud.mv.esp.classList.add('act');
    JU.tech.tk.shout(p, ESP.jp, GREEN); sfx.charge();
    return true;
  } };

/* ---------- wiring ---------- */
const press0 = H.press, guard0 = H.guard, hit0 = H.hit, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
const ready = k => !(E.cd[k] > 0);
function spend(k) { E.cd[k] = E.CD[k]; const el = E.hud.mv[k]; if (el) { el.classList.add('act'); setTimeout(() => el.classList.remove('act'), 220); } }
H.press = (a, inScene) => {                          // the combos: a second move pressed while the first is still going
  if (!inScene && on() && E.root.dataset.mode === 'fight' && !E.P1.dead) {
    const p = E.P1, m = p.move;
    if (AIR[a] && !p.ground && free(p) && ready(a)) { spend(a); begin(p, AIR[a], a); return true; }      // 0.22: the four in the air
    if (m && m.def === FEVER && m.k1 && !m.miss && !m.end) {      // Fever Breaker, before its second kick: 2 and 3 change how it ends
      if (a === 'crush' && !m.doors && ready('crush')) { m.doors = 1; spend('crush'); label(p.x, p.y + 470, 'DOORS', GOLD, .7); return true; }
      if (a === 'div' && !m.rough && ready('div')) { m.rough = 1; spend('div'); label(p.x, p.y + 470, 'ROUGH', GREEN, .7); return true; }
    }
    if (m && m.def === ESP && m.burst === undefined && guard && a === 'div' && ready('div')) { guard = null; spend('div'); begin(p, RAM, 'div'); label(p.x, p.y + 470, 'RAM', GOLD, .7); return true; }      // E then 3
    const ae = E.T - afterE < 1.2 && (!m || m.def === ESP) && !p.ps;
    if (ae && a === 'strikes' && ready('strikes')) { afterE = -9; spend('strikes'); begin(p, REBOUND, 'strikes'); return true; }      // E then 1
    if (ae && a === 'crush' && ready('crush')) { afterE = -9; spend('crush'); begin(p, CLOSING, 'crush'); return true; }             // E then 2
    const hd = holdingDoors(), byDoors = hd && (!m || m.def === MOVES.crush || m.def === CLOSING) && !p.ps;
    if (byDoors && a === 'div' && ready('div')) { spend('div'); begin(p, BREAKER, 'div').d = hd; return true; }                       // 2 then 3
    if (byDoors && a === 'strikes' && ready('strikes') && !pin) { spend('strikes'); begin(p, PINBALL, 'strikes').d = hd; return true; } // 2 then 1
    if (a === 'manji' && E.T - roughAt < .7 && ready('manji') && (!m || m.def === ROUGH) && live(E.P2) && !p.ps) { roughAt = -9; spend('manji'); begin(p, SKYFEVER, 'manji'); return true; }      // 3 then 4
    const fb = a === 'manji' && balls.filter(q => !q.ride && !q.landed && !q.spent && !q.hit && !q.volley).pop();
    if (fb && ready('manji') && (!m || m.def === BALLS || m.def === SHOWER) && !p.ps) { spend('manji'); begin(p, VOLLEY, 'manji').b = fb; return true; }      // 1 then 4
    if (m && m.def === ROUGH && m.go === undefined && a === 'strikes' && ready('strikes')) {      // 3 then 1: a ball, and up on it
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
  afterE = E.T; ev.counterAt = E.T; ev.blow = (a && a.dmg || 0) * (mul || 1);      // (E then 1, E then 2; and idg.js: a consecutive effect)
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
const GATHERS = new Set([ROUGH, RIDE, FEVER, METEOR, BREAKER]);
H.tick = dt => {
  tick0(dt);
  if (!on()) { if (balls.length || doors.length || guard || ram || pin || falls.length || flats.length || airDoors.length) clear(); else if (cool.has(E.P1.skin)) E.P1.skin = unGreen(E.P1.skin); return; }
  const p = E.P1, kicking = p.move && p.move.def.m1;
  if (kicking) p.skin = greenOf(p.skin); else if (cool.has(p.skin)) p.skin = unGreen(p.skin);      // his legs lit green while he kicks
  if (guard && (guard.t -= dt) <= 0) guard = null;
  if (gather && !(p.move && GATHERS.has(p.move.def))) gather = null;
  if (ecd > 0) ecd = Math.max(0, ecd - dt);
  if (reels) reels.t += dt;
  if (imp && (imp.t += dt) > .14) imp = null;
  for (const list of [flats, airDoors]) for (let i = list.length - 1; i >= 0; i--) if ((list[i].t += dt) > list[i].life) list.splice(i, 1);
  ballsTick(dt); doorsTick(dt); gritTick(dt); coinsTick(dt); fallsTick(dt); ramTick(dt); pinTick(dt);
};
H.fx = dt => {
  fx0(dt);
  if (!on()) return;
  const p = E.P1;
  if (p.move && p.move.def.m1) { const w = footAt(p, p.move.i !== 3); const c = F(w[0], w[1]); lit(() => E.glow(E.GLOW.green, c[0], c[1], 150 * c[2], .8)); }      // the kicking foot, lit
  drawFlats(); drawDoors(); drawGuard(); drawAirDoors(); drawFalls(); drawRam(); drawPin();
  for (const b of balls) drawBall(b);
  drawGather(); drawGrit(); drawCoins(); drawReels(); drawImpact();
};
const clear = () => { balls.length = doors.length = grit.length = coins.length = falls.length = flats.length = airDoors.length = 0; guard = gather = reels = imp = ram = pin = null; ecd = 0; afterE = roughAt = -9; if (cool.has(E.P1.skin)) E.P1.skin = unGreen(E.P1.skin); };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); clear(); };

// what idg.js (his domain) needs from in here
const ev = { counterAt: -9, blow: 0 };
const kit = { play, label, roughBurst, burstDoors, panel, glowRim, tintCol, live, mid, hs, exact, can, duel, GREEN, GOLD, GRGB, DRGB,
  setTint(fn) { tint = fn; }, coinsAt(x, y, n) { for (let i = 0; i < n; i++) coins.push({ x: x + rnd(-40, 40), y, vx: rnd(-1100, 1100), vy: rnd(500, 1500), t: 0, r: rnd(0, TAU) }); },
  get ecd() { return ecd; }, set ecd(v) { ecd = Math.max(0, +v || 0); } };
JU.gambler = { MOVES, KICKS, FIN5, UP5, DOWN5, esp: ESPECIAL, ESP, greenOf, ev, kit, clear,      // (esp: E, especial.js)
  VARIANTS: { SHOWER, DROPDOOR, METEOR, SPIKE, REBOUND, CLOSING, RAM, BREAKER, PINBALL, SKYFEVER, VOLLEY },
  get state() { return { balls: balls.map(b => ({ x: Math.round(b.x), y: Math.round(b.y), vx: Math.round(b.vx), vy: Math.round(b.vy), landed: b.landed, hit: b.hit, spent: b.spent, doors: b.doors, ride: b.ride })), doors: doors.map(d => ({ x: Math.round(d.x), shut: d.hitDone, held: !!d.o, single: d.single, outer: d.outer, hold: +(d.hold || 0).toFixed(2), col: d.col })), guard: !!guard, reels: !!reels, grit: grit.length, coins: coins.length,
    ecd: +ecd.toFixed(2), ram: !!ram, pin: pin && pin.n, falls: falls.length, flats: flats.length, airDoors: airDoors.length, afterE: +(E.T - afterE).toFixed(2) }; } };
})();
