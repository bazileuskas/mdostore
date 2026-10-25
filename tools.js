/* JUJUTSU UNLIMITEDS — cursed tools, and the clan that lives by them.
   The Cursed Tools screen (the button under the Shop) spins for one of four tools. Anybody can carry one, and it is used in place of a
   cursed technique: its moves take the first keys when no technique is active. The TOJI clan (limited time, 0.01%, disaster grade) carries
   three, switches between them with T, hits three times as hard with them, has four times the health, and cannot use a cursed technique at all.
   Build 0.16v2: the Dagger and its other form (the Dagger of the Demonly Holdings) are gone, and in their place on the reel is the CHAIN OF
   A THOUSAND MILES: 1 Lasso (whirled overhead and thrown: 60 when it catches, 40 more as it drags them in), 2 Whip (brought down on them,
   down or not: they stay down four seconds, bound, and cannot Evasive out of it). Whoever had the dagger has the chain now.
   And the INVERTED SPEAR OF HEAVEN strikes at the usual speed: four to a chain, jump held makes the fourth an uppercut, in the air a slam,
   with sounds of their own. Its second move is RUPTURE, used twice: a dash and an uppercut (30), then 2 again for a square closing on a
   square, and 2 once more as it lands inside it: a perfect thrust (70, and 100 in all). With E held as it winds up, the spear goes up with
   them instead, spinning on its chain for two seconds: 2 pulls it back early, and it tears through whatever is still in the air (60) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, M = E.MOVES, C = JU.clan, Z = JU.bossfx;
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk, SLOTS = JU.tech.SLOTS;
const STEEL = '#e8f0ff', GOLD = '#e2c060', CLOUD = '#ff5a6e', IRON = '#9aa3b5', BLOODC = '#b3121f';
const ENDS = Date.parse('2026-11-01T12:00:00Z');   // when the Toji clan leaves the draw. It first ran to 11 October; brought back for seven more days on 25 October (Build 0.16v2)
const TOJI_TOOL = 3, COUNTER = 3, COUNTER_CD = 20;  // +200% tool damage; Deadly Counter's seconds and its wait
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const gore = () => JU.gore !== false;
const say = (f, text, col, life = 1, up = 400) => E.fx.push({ k: 2, x: f.x, y: f.y + up * (f.scale || 1), n: text, col, t: 0, life });
sfx.preload(['home-isoh-1', 'home-isoh-2', 'home-isoh-3', 'home-isoh-4', 'home-isoh-spin', 'home-coatm-swing', 'home-coatm-hit', 'home-coatm-whip']);
const play = (name, vol, alt) => { if (!sfx.file(name, vol)) alt(); };      // a clip (at home its file, everywhere else where it is posted: index.html's WEB), or a built one

const S = { slots: [null, null, null], cur: 0 };    // what is in each pocket, and which one is in hand
try { Object.assign(S, JSON.parse(localStorage.getItem('ju.tools') || '{}')); } catch (e) {}
delete S.demon;
S.slots = S.slots.map(id => (id === 'dagger' ? 'chain' : id));      // (the dagger's pockets hold the chain now)
const save = () => { try { localStorage.setItem('ju.tools', JSON.stringify(S)); } catch (e) {} };
save();

let live = false, dressed = false;                  // tools are in play this session; the hotbar is wearing a tool's names
let m1cd = 0, dc = 0, dcCd = 0;                     // Playful Cloud's wait between strikes; Deadly Counter and its cooldown
const dots = [];                                    // damage still to come
const toji = () => !!C.active && C.active.id === 'toji';
const mult = () => (toji() ? TOJI_TOOL : 1);
const held = () => (!live ? null : toji() ? TOOLS[S.slots[S.cur]] || null : JU.tech.using ? null : TOOLS[S.slots[0]] || null);
const hit = (n, more) => Object.assign({ dmg: n, tool: n }, more);     // a tool's damage is exact, before the clan's bonus
const there = o => !!o && !o.ko && !(o.alpha < 1);                     // (to be hit by a tool that does not go through tryHit: on the floor, in the air, anywhere)
const mid = o => o.y + (o.state === 'down' ? 30 : o.state === 'air' ? 75 : 165) * (o.scale || 1);      // the middle of them, standing, thrown or lying

/* ================= the katana, Playful Cloud ================= */
const SLASH = { name: 'Katana Slash', cd: 5, dur: .55, run(p, m, t) {
  p.rate = 46; p.vx = t > .1 && t < .2 ? p.face * 520 : 0; p.target = t < .12 ? POSE.hookWind : t < .36 ? POSE.hook : POSE.idle;
  if (t < .12 || m.s) return;
  m.s = 1; sfx.whoosh(); V.slash(p.x + p.face * 150, p.y + 170, p.face > 0 ? -.35 : Math.PI + .35, 460, STEEL, 16);
  E.tryHit(p, hit(70, { reach: 280, kb: 640, lift: 320, stop: .14, heavy: 1, col: STEEL }));
} };
// Playful Cloud is all strikes: one every 0.3 seconds (`every`), and its target is free again before the next
const cloudM1 = i => Object.assign({}, M.m1[i], { dur: .24, strike: .05, pre: i % 2 ? 'hookWind' : 'crushWind', pose: i % 2 ? 'hook' : 'crush', lunge: 150, kick: 0,
  hit: hit(7, { reach: 215, kb: i === 3 ? 420 : 40, lift: i === 3 ? 300 : 0, stun: .2, stop: .02, col: CLOUD }) });

/* ================= the Inverted Spear of Heaven ================= */
// [lean, head, armF, armB, legF, legB, rot]: the point goes the way the front arm does
Object.assign(POSE, {
  isW1: [0, 0, 1, .5, .3, -.35, 0], isT1: [.32, 0, 1.62, 1.25, .62, -.5, 0], isW2: [.06, 0, 1.3, .3, .3, -.3, 0], isT2: [.36, .05, 1.8, 1, .58, -.52, 0],
  isW3: [-.14, -.1, 3.05, 1.6, .3, -.3, 0], isChop: [.5, .15, 1.15, .6, .72, -.55, 0], isW4: [-.3, 0, .9, .3, .15, -.45, 0], isLunge: [.62, 0, 1.58, 1.45, 1.05, -.78, 0],
  isLow: [.16, 0, .4, .2, .45, -.4, 0], isRise: [-.06, -.22, 2.85, 1.9, .5, -.3, 0], isDrive: [.5, .2, .75, .45, .7, -.5, 0], isThrow: [-.12, -.3, 3.1, 2.4, .4, -.35, 0]
});
const ISOH_DMG = [7, 7, 9, 16];                     // the four strikes; the fourth, the uppercut and (twice it) the slam
const isohSound = n => play('home-isoh-' + n, .95, () => sfx.spear(n - 1, 1.1));
const spearM1 = i => Object.assign({}, M.m1[i], [
  { pre: 'isW1', pose: 'isT1', lunge: 230 },
  { pre: 'isW2', pose: 'isT2', lunge: 230 },
  { pre: 'isW3', pose: 'isChop', lunge: 240, strike: .09, dur: .3 },
  { pre: 'isW4', pose: 'isLunge', lunge: 460, strike: .15, dur: .52, kick: 0 }][i], { sw: 'rgba(226,192,96,.9)', whoosh: () => sfx.swish(1.15),
  hit: hit(ISOH_DMG[i], Object.assign({ reach: 230, col: GOLD, mute: 1, isoh: i + 1 }, i === 3 ? { kb: 640, lift: 540, stun: .9, stop: .12, heavy: 1 } : { kb: 170, stun: .36, stop: .045 })) });
const jumpHeld = () => E.keys.has('w') || E.keys.has(' ') || E.keys.has('arrowup');
// jump held through the chain: the fourth comes up from underneath them
const IS_UP = { m1: 1, dur: .6, run(p, m, t) {
  p.rate = 46;
  if (t < .14) { p.target = POSE.isLow; if (p.ground) p.vx = p.face * 160; return; }
  p.target = t < .44 ? POSE.isRise : POSE.idle; if (p.ground) p.vx = t < .2 ? p.face * 240 : 0;
  if (!m.sw) { m.sw = 1; sfx.swish(1.3); V.slash(p.x + p.face * 120, p.y + 220, p.face > 0 ? 1.2 : Math.PI - 1.2, 400, GOLD, 14); }
  if (!m.done && t < .28 && E.tryHit(p, hit(ISOH_DMG[3], { reach: 230, kb: 80, lift: 1150, stun: .9, stop: .1, heavy: 1, col: GOLD, mute: 1, isoh: 4 }))) m.done = 1;
} };
// in the air: the fourth goes down, and so does he, point first
const IS_DOWN = { m1: 1, dur: 1.4, run(p, m, t) {
  const o = E.P2;
  p.rate = 46;
  if (m.land !== undefined) { p.vx = 0; p.target = t < m.land + .2 ? POSE.isDrive : POSE.idle; if (t > m.land + .34) E.endMove(p); return; }
  if (p.ground && t > .02) { m.land = t; p.vy = 0; const x = p.x + p.face * 90; sfx.blast(); shake(m.done ? 24 : 12); V.crack(x, m.done ? 280 : 170); V.rocks(x, 0, m.done ? 10 : 5); V.ring(x, 40, m.done ? 300 : 190, GOLD, .35); return; }
  if (t < .12) { p.target = POSE.isW3; p.vy = Math.max(p.vy, 80); p.vx *= .88; return; }
  if (!m.aim) { m.aim = 1; p.face = o.x >= p.x ? 1 : -1; sfx.swish(.9); m.vx = clamp((o.x - p.face * 70 - p.x) / Math.max(.1, p.y / 1800), -1500, 1500); }
  p.target = POSE.isDrive; p.vy = -1800; p.vx = m.vx;
  if (!m.done && E.tryHit(p, hit(ISOH_DMG[3] * 2, { reach: 232, kb: 160, stun: .9, stop: .12, heavy: 1, col: GOLD, mute: 1, isoh: 4 }))) {
    m.done = 1;
    if (!o.poise && !o.ko) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 26), vy: -1900, vx: p.face * 160, bounced: false });      // into the floor ahead of him
  }
} };
const INVERSION = { name: 'Inversion Stab', cd: 12, dur: .7, run(p, m, t) {
  p.rate = 46;
  if (t < .2) { p.target = POSE.divWind; p.vx = 0; return; }
  p.target = t < .45 ? POSE.jab : POSE.idle; p.vx = t < .32 ? p.face * 1300 : 0;
  if (m.done || t > .34 || !E.tryHit(p, hit(450, { reach: 250, kb: 900, lift: 420, stop: .3, heavy: 1, col: GOLD }))) return;
  m.done = 1; shake(34); sfx.bf(); V.impact(.2, E.P2.x, E.P2.y + 150);
} };

/* ---------- Rupture: once, a dash and an uppercut; twice, the square; or, with E held, the spear goes up too ---------- */
const RUP_T = 1.5, QTE_T = 1, PERF = [.5, .7], HANG = 2, RIDE = .12, DESC = .35, BACK_T = .22, SPIN = 42;      // how long the second use waits; how long the square takes to close; when it is inside the other; how long the spear stays up, takes to reach them, to drift home and to come back when pulled; and how fast it turns (radians a second: about seven turns, as in the user's clip)
let rup = null, qte = null, thrown = null;          // { o, t } the second use, waiting · { o, t, res } the square · the spear in the air: { x, y, t (in this phase), life (since it left his hand), phase, o, rot, dir, side, hit }
const isoHeld = () => { const t = held(); return !!t && t.id === 'spear'; };
const RUPTURE = { name: 'Rupture', sub: 'USE TWICE', cd: 9, dur: .78, noCancel: 1, run(p, m, t) {      // (noCancel: the Vessel's E does not call it off, especial.js: E is part of it)
  const o = E.P2, f = p.face;
  if (t < .18) { p.target = POSE.isLow; p.vx = 0; p.rate = 30; if (E.keys.has('e') || E.keys.has('hold:esp')) m.up = 1; if (m.up && !m.told) { m.told = 1; shout(p, '天逆鉾', GOLD); } return; }
  p.rate = 46;
  if (!m.go) { m.go = 1; sfx.whoosh(); }
  const gap = (o.x - p.x) * f;
  if (t < .34) { p.target = POSE.isLunge; p.vx = gap > 150 ? f * 1600 : 0; if (Z && Math.random() < .7) Z.emit(1, p.x - f * 40, p.y + rnd(80, 240), -f * 900, 0, 4, .18, '226,192,96'); }      // the dash
  else { p.target = t < .58 ? POSE.isRise : POSE.idle; p.vx = 0; }
  if (!m.sw && t >= .3) { m.sw = 1; sfx.swish(1.3); V.slash(p.x + f * 130, p.y + 200, f > 0 ? 1.15 : Math.PI - 1.15, 440, GOLD, 16); }
  if (!m.done && t >= .28 && t < .5 && E.tryHit(p, hit(30, { reach: 240, kb: 60, lift: m.up ? 1400 : 1180, stun: .9, stop: .12, heavy: 1, col: GOLD, mute: 1, isoh: 4 }))) {      // and up they go (a little higher with the spear going up after them: long enough to pull it back through them)
    m.done = 1; V.ring(o.x, o.y + 160, 220, GOLD, .3);
    if (m.up) toss(p, o); else { rup = { o, t: RUP_T }; say(p, '2 · AGAIN', GOLD, 1.2, 430); }
  }
} };
// the second use: up after them, and the square
const RUPTURE2 = { name: 'Rupture', dur: 2.2, noCancel: 1, run(p, m, t) {
  const o = E.P2, f = p.face, dt = m.lt === undefined ? 1 / 60 : t - m.lt;
  m.lt = t;
  if (!m.s) { m.s = 1; p.vy = 0; p.face = o.x >= p.x ? 1 : -1; qte = { o, t: 0, res: null, y: o.poise ? o.y : Math.max(o.y, 260) }; sfx.charge(); sfx.swish(.8); }      // (too heavy to throw: it stays on its feet, and he beside it)
  if (!m.hit) {
    const q = 1 - Math.exp(-dt * 12);
    p.target = POSE.isW4; p.vx = 0; p.vy = 0;
    if (qte.y > 40) p.ground = false;               // (every frame: off the floor, or the engine would stand him on nothing)
    p.x += (o.x - p.face * 140 - p.x) * q; p.y += (Math.max(0, qte.y - 40) - p.y) * q;      // up beside them, hanging there
    if (qte.res || qte.t > QTE_T + .06) { m.hit = t; strike(p, o, qte.res === 'perfect'); qte = null; }
    return;
  }
  const s = t - m.hit;
  p.target = s < .3 ? POSE.isLunge : POSE.idle;
  if (s > .5) E.endMove(p);
} };
function second() {                                 // 2, while it waits: the second use
  const p = E.P1, o = rup.o;
  rup = null;
  if (!there(o) || o !== E.P2) return;
  if (p.move) E.endMove(p);
  p.move = { def: RUPTURE2, key: 'crush', t: 0 }; E.hud.mv.crush.classList.add('act');
}
function judge() {                                  // 2 again: is the square inside the other one?
  const u = qte.t / QTE_T;
  qte.res = u >= PERF[0] && u <= PERF[1] ? 'perfect' : 'miss';
}
function strike(p, o, perfect) {                    // the thrust, and down they go
  const n = perfect ? 70 : 30, f = p.face;
  if (there(o) && o === E.P2) {
    E.applyHit(o, f, hit(n, { kb: perfect ? 700 : 300, stun: .9, stop: perfect ? .3 : .12, heavy: 1, col: GOLD, fixed: 1, mute: 1 }));
    if (!o.poise && !o.ko) Object.assign(o, { ground: false, state: 'air', vy: perfect ? -2200 : -1200, bounced: false });
    isohSound(4);
  }
  V.slash(o.x, mid(o), f > 0 ? -.5 : Math.PI + .5, perfect ? 820 : 460, perfect ? '#ffffff' : GOLD, perfect ? 20 : 12);
  if (perfect) {
    sfx.bf(); shake(36); E.zoomIn(.4); V.impact(.25, o.x, mid(o)); V.ring(o.x, mid(o), 420, GOLD, .4);
    if (Z) { Z.flash('226,192,96', .3, .25); Z.shock(o.x, 600, '226,192,96', .5, 12); }
    say(o, 'PERFECT', '#ffffff', 1.2, 430);
  } else { shake(16); say(o, 'RUPTURE', GOLD, .9, 430); }
}
// with E held: the spear goes up with them, spinning on the end of its chain, and comes down through them. The way it flies is the user's
// clip's: up at their side as they go, still up there spinning when they come down, then down again to his hand, turning all the way
function toss(p, o) {
  const w = E.hand(p, true);
  thrown = { x: w[0], y: w[1], x0: w[0], y0: w[1], tx: w[0], ty: w[1], t: 0, life: 0, phase: 'up', o, rot: -p.face * Math.PI / 2, dir: -p.face, side: -p.face, hit: false };      // (dir: anticlockwise when he faces right, as in the clip; side: it rides on his side of them)
  play('home-isoh-spin', .9, () => { for (let i = 0; i < 5; i++) E.after(i * .32, () => sfx.swish(.7 + i * .06)); });
  say(p, '2 · PULL THE CHAIN', GOLD, 1.6, 500);
}
function pull() {                                   // 2 while it is up: back down along its chain, now
  if (!thrown || thrown.phase === 'back') return;
  const o = thrown.o, far = Math.hypot(o.x - thrown.x, mid(o) - thrown.y);
  Object.assign(thrown, { phase: 'back', t: 0, bx: thrown.x, by: thrown.y, bt: clamp(far / 2400, .06, BACK_T) });      // (bt: how long it takes to reach them: no time at all from right beside them)
  sfx.whoosh(); play('home-coatm-swing', .9, () => sfx.comb());
}
function flyTick(dt) {
  const s = thrown, p = E.P1, o = s.o, up = there(o) && o === E.P2 && !o.ground;
  s.t += dt; s.life += dt; s.rot += dt * SPIN * s.dir;
  if (s.phase === 'up') {                           // up with them, at their side, as fast as they go
    if (up) { s.tx = o.x + s.side * 55 * (o.scale || 1); s.ty = mid(o) - 30; }
    const u = Math.min(1, s.t / RIDE);
    if (u < 1) { s.x = lerp(s.x0, s.tx, ease(u)); s.y = lerp(s.y0, s.ty, ease(u)); }
    else { const q = 1 - Math.exp(-dt * 14); s.x += (s.tx - s.x) * q; s.y += (s.ty - s.y) * q; }
    if (u >= 1 && (!up || o.vy < -150 || s.life > .9)) { s.phase = 'hang'; s.t = 0; s.hx = s.x; s.hy = s.y; }      // they are on their way down: it stays up
  } else if (s.phase === 'hang') {                  // up there turning, drifting a little, until its time is up
    s.x = s.hx + Math.sin(s.t * 2.3) * 14; s.y = s.hy + Math.min(1, s.t * 3) * 20 + Math.sin(s.t * 3.1) * 10;
    if (s.life >= HANG - DESC) { if (up) pull(); else Object.assign(s, { phase: 'home', t: 0, bx: s.x, by: s.y }); }      // (somebody still in the air: it comes for them on the way)
  } else if (s.phase === 'home') {                  // left to itself: down to his hand again, still turning
    const w = E.hand(p, true), u = Math.min(1, s.t / DESC), q = u * u * (3 - 2 * u);
    s.x = lerp(s.bx, w[0], q); s.y = lerp(s.by, w[1], q);
    if (u >= 1) thrown = null;
  } else {                                          // pulled back: through them on the way, if they are still up there
    const w = E.hand(p, true), aim = there(o) && o === E.P2 && !o.ground && o.y > 40 && !s.hit;
    if (s.aim && !aim) { s.t = dt; s.bx = s.x; s.by = s.y; }      // (they came down before it got there: home from where it is, with no jump)
    s.aim = aim;
    const u = Math.min(1, s.t / (aim ? s.bt || BACK_T : BACK_T));
    if (aim) {
      const cx = o.x, cy = mid(o);
      s.x = lerp(s.bx, cx, u); s.y = lerp(s.by, cy, u);
      if (u >= 1) { s.hit = true; s.t = 0; s.bx = s.x; s.by = s.y; tear(p, o); }
    } else {
      s.x = lerp(s.bx, w[0], u); s.y = lerp(s.by, w[1], u);
      if (u >= 1) { thrown = null; sfx.whoosh(); }
    }
  }
}
function tear(p, o) {                               // 60, and it is not clean
  const x = o.x, y = mid(o);
  E.applyHit(o, o.x >= p.x ? 1 : -1, hit(60, { kb: 260, lift: 300, stun: .9, stop: .22, heavy: 1, col: gore() ? BLOODC : GOLD, fixed: 1, mute: 1 }));
  isohSound(4); shake(30); E.zoomIn(.3); V.impact(.15, x, y);
  if (gore()) {
    sfx.splatter();
    if (Z) for (let i = 0; i < 46; i++) Z.emit(4, x + rnd(-20, 20), y + rnd(-30, 30), rnd(-900, 900), rnd(-200, 1100), rnd(5, 11), 2, i % 4 ? '150,8,20' : '200,20,32', { g: 2400, land: 'blood' });
    V.sparks(x, y, 'red', 18); V.ring(x, y, 260, BLOODC, .35);
    if (Z) Z.flash('120,0,10', .25, .2);
    dots.push({ o, left: 4, per: 0, every: .25, t: .25, col: BLOODC, gush: true });      // (and it keeps coming out of them a moment: no more damage, only blood)
  } else { V.sparks(x, y, 'gold', 16); V.ring(x, y, 260, GOLD, .35); }
  say(o, '天逆鉾', gore() ? '#ff5a6e' : GOLD, 1.1, 440);
}
// the Inverted Spear of Heaven as the user's picture of it has it (Build 0.16v2): a flat blade with two prongs, the long one and a short one
// with a rounded slot between them, both cut off on the same slant, and a small mark cut in it near the base; a square brass guard and
// collar; a long black grip wound tight with cord; and a brass end with a ring in it (where the chain goes, in the story). In its own
// units: the guard at 0, the long prong's tip at 104, the ring at -97; -y is the long prong's side
const BRASS = '#d9c99f', BRASS_D = '#a08f69', WRAP = '#191413', CORD = '#3e2b27';
const BLADE = [[6, -9], [12, -16], [104, -16], [89, -1], [32, -1], [29, 2], [32, 5], [60, 5], [49, 16], [12, 16], [6, 9]];
function isohShape() {
  g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = LINE;
  g.lineWidth = 3.6; g.beginPath(); g.arc(-97, 0, 5, 0, TAU); g.stroke(); g.lineWidth = 1.8; g.strokeStyle = BRASS; g.stroke();      // the ring
  g.strokeStyle = LINE; g.lineWidth = 1.6;
  g.fillStyle = BRASS; g.beginPath(); g.roundRect(-93, -5.5, 8, 11, 2); g.fill(); g.stroke();                                         // its cap
  g.fillStyle = WRAP; g.beginPath(); g.moveTo(-86, -5.2); g.lineTo(-7, -6.6); g.lineTo(-7, 6.6); g.lineTo(-86, 5.2); g.closePath(); g.fill(); g.stroke();      // the grip
  g.strokeStyle = CORD; g.lineWidth = 1.4;
  for (let x = -83; x < -10; x += 4.4) { g.beginPath(); g.moveTo(x, -4.6); g.lineTo(x + 2.4, 4.6); g.stroke(); }                     // (the cord round it)
  g.strokeStyle = LINE; g.lineWidth = 1.6;
  g.fillStyle = BRASS_D; g.beginPath(); g.roundRect(-8, -13, 5.5, 26, 1.5); g.fill(); g.stroke();                                     // the guard
  g.fillStyle = BRASS; g.beginPath(); g.roundRect(-3.5, -9.5, 10, 19, 1.5); g.fill(); g.stroke();                                     // and its collar
  const gr = g.createLinearGradient(0, -16, 0, 16);
  gr.addColorStop(0, '#eef2f6'); gr.addColorStop(.45, '#cdd3da'); gr.addColorStop(1, '#a3abb5');
  g.fillStyle = gr; g.beginPath(); BLADE.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  g.lineWidth = 2; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.6;                                                                         // the bevel along its edges
  g.beginPath(); g.moveTo(14, -13.6); g.lineTo(100, -13.6); g.moveTo(14, 13.6); g.lineTo(50, 13.6); g.stroke();
  g.strokeStyle = 'rgba(70,78,90,.75)'; g.lineWidth = 1.1;                                                                            // the mark cut near its base
  for (const x of [14, 17, 20]) { g.beginPath(); g.moveTo(x, -5); g.lineTo(x, 5); g.stroke(); }
  g.beginPath(); g.moveTo(24, -5); g.lineTo(24, 5); g.moveTo(22, 0); g.lineTo(27, 0); g.stroke();
  g.lineCap = 'butt';
}
// drawn on screen at x, y (where its guard is), turned to ang, s pixels to its unit; flip: which side the short prong is on
function isohAt(x, y, ang, s, flip = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s * flip); isohShape(); g.restore();
}

// spinning in the air, as in the user's clip: end over end round its guard, and behind the blade half a disc of yellow-white light, filled
// right in to the guard, brightest at the blade and fading back from it; a brighter band round its edge, jagged on the inside, and the
// tip's own path along it. dir: 1 clockwise, -1 anticlockwise
const SWEEP = Math.PI * .95;
function spinDraw(x, y, ang, k, dir) {
  const R = 104 * k, ccw = dir > 0, at = (a, r) => [Math.cos(a) * r, Math.sin(a) * r], A = i => ang - dir * SWEEP * i;      // (R: from the guard to the tip; ccw: which way round the trail is drawn; A: a share of the way back along it)
  g.save(); g.translate(x, y); g.globalCompositeOperation = 'lighter';
  for (let i = 0, N = 14; i < N; i++) {             // the disc
    const f = 1 - .72 * i / N, gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
    gr.addColorStop(0, `rgba(255,222,120,${.12 * f})`); gr.addColorStop(.6, `rgba(255,232,145,${.24 * f})`); gr.addColorStop(1, `rgba(255,242,185,${.44 * f})`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, A(i / N), A((i + 1) / N), ccw); g.closePath(); g.fill();
  }
  for (let i = 0, M = 16; i < M; i++) {             // the band round its edge, jagged where it meets the rest
    const r0 = R * (i % 2 ? .6 : .78), r1 = R * ((i + 1) % 2 ? .6 : .78), p2 = at(A((i + 1) / M), r1), p3 = at(A(i / M), r0);
    g.fillStyle = `rgba(255,248,205,${.5 * Math.pow(1 - i / M, 1.3)})`;
    g.beginPath(); g.arc(0, 0, R, A(i / M), A((i + 1) / M), ccw); g.lineTo(p2[0], p2[1]); g.lineTo(p3[0], p3[1]); g.closePath(); g.fill();
  }
  g.lineCap = 'round';
  for (let i = 0; i < 6; i++) { g.strokeStyle = `rgba(255,255,245,${.85 * (1 - i / 6)})`; g.lineWidth = (4.5 - i * .6) * k; g.beginPath(); g.arc(0, 0, R, A(i / 7), A((i + 1) / 7), ccw); g.stroke(); }
  const b = at(A(.15), R * .65); E.glow(E.GLOW.gold || E.GLOW.fire, b[0], b[1], R * 1.7, .3); E.glow(E.GLOW.white || E.GLOW.fire, b[0], b[1], R * .9, .3);
  g.globalCompositeOperation = 'source-over'; g.restore();
  isohAt(x, y, ang, k, -dir);                       // and the spear over it, turning round its guard
}

/* ================= the Chain of a Thousand Miles ================= */
// its links: heavy and dark, one face-on and the next edge-on, all the way along. pts: screen points it runs through
function links(pts, k, dark = '#3c414c', lit = '#b8bec9') {
  const L = 13 * k;
  let next = 0, n = 0;
  for (let s = 0; s < pts.length - 1; s++) {
    const x0 = pts[s][0], y0 = pts[s][1], dx = pts[s + 1][0] - x0, dy = pts[s + 1][1] - y0, len = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    for (; next < len; next += L) {
      const x = x0 + dx * next / len, y = y0 + dy * next / len;
      g.save(); g.translate(x, y); g.rotate(a);
      if (n++ & 1) { g.fillStyle = dark; g.fillRect(-L * .58, -1.8 * k, L * 1.16, 3.6 * k); g.fillStyle = lit; g.fillRect(-L * .5, -1.8 * k, L, 1.1 * k); }
      else { g.strokeStyle = LINE; g.lineWidth = 4.6 * k; g.beginPath(); g.ellipse(0, 0, L * .64, 4.6 * k, 0, 0, TAU); g.stroke(); g.strokeStyle = dark; g.lineWidth = 3 * k; g.stroke(); g.strokeStyle = lit; g.lineWidth = 1.1 * k; g.beginPath(); g.ellipse(0, -.6 * k, L * .5, 3 * k, 0, Math.PI * 1.1, TAU * .95); g.stroke(); }
      g.restore();
    }
    next -= len;
  }
}
// a chain hanging between two screen points: it sags by `sag`
function sagged(a, b, sag, k, n = 18) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * sag]); }
  links(pts, k);
}
const ring = (x, y, r, k) => { g.strokeStyle = LINE; g.lineWidth = 7 * k; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.strokeStyle = '#4a4f5a'; g.lineWidth = 4.5 * k; g.stroke(); g.strokeStyle = '#c9ced8'; g.lineWidth = 1.4 * k; g.beginPath(); g.arc(x, y - 1 * k, r * .8, Math.PI * 1.1, TAU * .95); g.stroke(); };
const chainSwing = () => play('home-coatm-swing', .85, () => sfx.swish(.8));
const chainHit = () => play('home-coatm-hit', .95, () => { sfx.hit(true); sfx.snap(); });

let lasso = null;                                   // the Lasso's chain, as it is now: { m (its move) }
const LASSO = { name: 'Lasso', cd: 8, dur: 1.75, run(p, m, t) {
  const o = E.P2, f = p.face;
  p.vx = 0; lasso = { m };
  if (t < .6) { p.target = POSE.isThrow; p.rate = 22; if (t - (m.sw === undefined ? -1 : m.sw) > .2) { m.sw = t; chainSwing(); } return; }      // round and round over his head
  p.target = t < .8 ? POSE.isT2 : POSE.idle; p.rate = 40;
  if (!m.out) { m.out = t; m.tx = there(o) && o === E.P2 && (o.x - p.x) * f > -40 && Math.abs(o.x - p.x) < 820 ? o.x : p.x + f * 820; sfx.whoosh(); }
  const u = Math.min(1, (t - m.out) / .17);
  if (u >= 1 && m.caught === undefined && !m.miss) {
    if (there(o) && o === E.P2 && Math.abs(o.x - m.tx) < 90 && !(o.inv > 0)) {
      m.caught = t; chainHit(); shake(14);
      E.applyHit(o, o.x >= p.x ? 1 : -1, hit(60, { kb: 0, stun: 1.2, stop: .1, heavy: 1, col: IRON, fixed: 1, mute: 1 }));
      say(o, 'CAUGHT', IRON, .9, 420);
    } else m.miss = t;
  }
  if (m.miss !== undefined && t > m.miss + .25) E.endMove(p);
  if (m.caught !== undefined && there(o)) {         // and in it comes, to his feet
    const s = t - m.caught, to = p.x + f * 150;
    if (s < .4) { o.x += (to - o.x) * Math.min(1, s / .4 * .6 + .1); if (o.state !== 'air' && o.state !== 'down') Object.assign(o, { state: 'hurt', stun: Math.max(o.stun || 0, .3), act: null, tele: 0, vx: 0 }); }
    else if (!m.pulled) { m.pulled = 1; o.x = to; chainHit(); sfx.blast(); shake(20); E.applyHit(o, f, hit(40, { kb: 260, lift: 260, stun: .7, stop: .12, heavy: 1, col: IRON, fixed: 1, mute: 1 })); V.ring(o.x, o.y + 160, 240, IRON, .3); }
    if (s > .75) E.endMove(p);
  }
} };
// Whip: over his head and down on them, wherever they are lying. Bound: four seconds on the floor (counted from when they land), and no Evasive
const BIND_T = 4;
let bound = null;                                   // { o, t }
const WHIP = { name: 'Whip', cd: 10, dur: .95, run(p, m, t) {
  const o = E.P2, f = p.face;
  p.vx = 0; lasso = { m, whip: 1 };
  if (t < .28) { p.target = POSE.isThrow; p.rate = 26; if (!m.sw) { m.sw = 1; chainSwing(); } return; }
  p.target = t < .55 ? POSE.isChop : POSE.idle; p.rate = 44;
  if (!m.out) { m.out = t; m.tx = there(o) && o === E.P2 && (o.x - p.x) * f > -40 && Math.abs(o.x - p.x) < 760 ? o.x : p.x + f * 700; }
  if (!m.crack && t >= .36) {
    m.crack = 1; play('home-coatm-whip', 1, () => { sfx.snap(); sfx.hit(true); }); shake(18);
    V.crack(m.tx, 220); V.ring(m.tx, 30, 260, IRON, .3); E.addDust(m.tx);
    if (there(o) && o === E.P2 && Math.abs(o.x - m.tx) < 110) {      // down or not, it lands
      E.applyHit(o, f, hit(35, { kb: 120, stun: 1, stop: .14, heavy: 1, col: IRON, fixed: 1, mute: 1 })); chainHit();
      bind(o);
    }
  }
} };
function bind(o) {                                  // laid out, wrapped in it, and nothing gets them out early
  o.noEvade = E.T + BIND_T;
  say(o, 'BOUND', IRON, 1.2, 380);
  if (o.poise) { if (o.ai) o.ai.t = Math.max(o.ai.t || 0, 1.2); return; }      // too heavy to put down: it only stops a moment
  bound = { o, t: BIND_T };
  if (o.ko) return;
  if (o.ground && o.state !== 'down') Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 12), vy: 520, vx: (o.vx || 0) * .3, bounced: true, act: null, tele: 0 });      // off its feet, and down
  else if (o.ground) Object.assign(o, { stun: BIND_T, act: null, tele: 0, inv: 0 });
}
function bindTick(dt) {
  const o = bound.o;
  if (o.ground) bound.t -= dt;                      // (the time in the air on the way down is not part of it)
  if (bound.t <= 0 || o.ko || o !== E.P2) { bound = null; return; }
  if (o.ground && (o.state === 'down' || o.state === 'up' || o.state === 'idle' || o.state === 'act' || o.state === 'hurt')) Object.assign(o, { state: 'down', stun: Math.max(o.stun || 0, bound.t), act: null, tele: 0, vx: o.vx * .8 });
  o.noEvade = E.T + bound.t + .1;
}
// the chain in his hand while it is not working: wound round his fist, the rest hanging
function chainIdle(p) {
  const w = E.hand(p, true), a = F(w[0], w[1]), k = a[2], b = F(w[0] + p.face * 18, Math.max(16, w[1] - 120));
  sagged([a[0], a[1]], [b[0], b[1]], 10 * k, k, 8); ring(b[0], b[1] + 6 * k, 9 * k, k);
  for (let i = 0; i < 3; i++) { g.strokeStyle = LINE; g.lineWidth = 5 * k; g.beginPath(); g.ellipse(a[0], a[1] + (i - 1) * 5 * k, 15 * k, 6 * k, .3, 0, TAU); g.stroke(); g.strokeStyle = '#4a4f5a'; g.lineWidth = 3 * k; g.stroke(); }
}
// the chain at work: whirled overhead, thrown out, round them, and pulled
function chainWork(p) {
  const m = lasso.m, t = m.t, w = E.hand(p, true), a = F(w[0], w[1]), k = a[2], o = E.P2, f = p.face;
  if (t < (lasso.whip ? .28 : .6)) {               // the loop, going round over his head
    const c = F(p.x, p.y + 470 * (p.scale || 1)), R = (lasso.whip ? 70 : 110) * k, ry = R * .32, an = t * 22;
    const pts = []; for (let i = 0; i <= 26; i++) { const q = an + i / 26 * TAU; pts.push([c[0] + Math.cos(q) * R, c[1] + Math.sin(q) * ry]); }
    links(pts, k); links([[a[0], a[1]], [c[0] + Math.cos(an) * R, c[1] + Math.sin(an) * ry]], k);
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(200,210,230,.25)'; g.lineWidth = 6 * k; g.beginPath(); g.ellipse(c[0], c[1], R, ry, 0, 0, TAU); g.stroke(); g.globalCompositeOperation = 'source-over';
    return;
  }
  const u = Math.min(1, (t - m.out) / .17);
  if (lasso.whip) {                                 // brought down in an arc on the spot
    const end = F(lerp(p.x, m.tx, u), lerp(p.y + 520, 30, u * u)), top = F(lerp(p.x, m.tx, .4), p.y + 560);
    const pts = []; for (let i = 0; i <= 18; i++) { const s = i / 18, x = (1 - s) * (1 - s) * a[0] + 2 * (1 - s) * s * top[0] + s * s * end[0], y = (1 - s) * (1 - s) * a[1] + 2 * (1 - s) * s * top[1] + s * s * end[1]; pts.push([x, y]); }
    links(pts, k); ring(end[0], end[1], 11 * k, k);
    return;
  }
  const caught = m.caught !== undefined && there(o), tx = caught ? o.x : m.tx, ty = caught ? mid(o) : p.y + 200;
  const end = F(lerp(w[0], tx, u), lerp(w[1], ty, u));
  sagged([a[0], a[1]], [end[0], end[1]], (caught ? 6 : 26) * k, k, 20);
  if (caught) for (let i = 0; i < 3; i++) { g.strokeStyle = LINE; g.lineWidth = 6 * k; g.beginPath(); g.ellipse(end[0], end[1] + (i - 1) * 16 * k, 46 * k * (o.scale || 1), 12 * k, 0, 0, TAU); g.stroke(); g.strokeStyle = '#5a5f6a'; g.lineWidth = 3.6 * k; g.stroke(); }      // round them
  else ring(end[0], end[1], 12 * k, k);
}
function boundDraw() {                              // wrapped round whoever is lying there, still: four turns of it across the body
  const o = bound.o, hs = o.scale || 1, lying = o.ground && o.state === 'down', c = F(o.x - (lying ? o.face * 18 * hs : 0), o.y + (lying ? 30 : 150) * hs), k = c[2] * hs, a = Math.min(1, bound.t * 2);
  const rx = (lying ? 9 : 30) * k, ry = (lying ? 23 : 12) * k, gap = 38 * k;      // (still in the air: round the middle of them instead)
  g.save(); g.globalAlpha = a;
  for (let i = 0; i < 4; i++) {
    const pts = [], x = c[0] + (lying ? (i - 1.5) * gap : 0), y = c[1] + (lying ? 0 : (i - 1.5) * 26 * k);
    for (let j = 0; j <= 12; j++) { const q = j / 12 * TAU; pts.push([x + Math.cos(q) * rx, y + Math.sin(q) * ry]); }
    links(pts, k * .7);
  }
  g.restore();
}

const TOOLS = {
  katana: { id: 'katana', name: 'Cursed Katana', jp: '呪刀', mark: '刀', odds: 40, col: '#cfd8e0', moves: [SLASH], what: 'Katana Slash: 70.' },
  chain: { id: 'chain', name: 'Chain of a Thousand Miles', jp: '万里ノ鎖', mark: '鎖', odds: 40, col: IRON, moves: [LASSO, WHIP],
    what: 'Lasso: whirled and thrown, 60 when it catches, 40 more as it drags them in. Whip: down on them even when they are down: 35, bound for four seconds, no Evasive.' },
  cloud: { id: 'cloud', name: 'Playful Cloud', jp: '游雲', mark: '雲', odds: 19.9, col: CLOUD, moves: [], m1: cloudM1, every: .3, what: 'No moves, only strikes: 7 each, one every 0.3 seconds.' },
  spear: { id: 'spear', name: 'Inverted Spear of Heaven', jp: '天逆鉾', mark: '鉾', odds: .1, col: GOLD, moves: [INVERSION, RUPTURE], m1: spearM1,
    what: 'Inversion Stab: 450. Rupture (use twice): dash and uppercut, then a perfect thrust, 100 in all; E held as it winds up throws the spear up with them (60 coming back). Strikes: four to a chain, with an uppercut and a slam.' }
};
const ORDER = ['katana', 'chain', 'cloud', 'spear'];
const movesOf = t => (!t ? [] : t.moves);
const nameOf = t => t.name;

/* ---------- the hotbar wears the tool in hand ---------- */
const BASE = { names: {}, cd: {} };
for (const k of SLOTS) { BASE.names[k] = E.hud.mv[k].querySelector('b').textContent; BASE.cd[k] = E.CD[k]; }
const strip = document.createElement('div');
strip.className = 'tsm tools';
E.root.querySelector('.fb.p1').appendChild(strip);
function subOf(k, m) {                              // the small line under a move's name (Rupture: USE TWICE)
  const el = E.hud.mv[k];
  let s = el.querySelector('small.tsub');
  if (!m || !m.sub) { if (s) s.remove(); return; }
  if (!s) { s = document.createElement('small'); s.className = 'tsub'; el.appendChild(s); }
  if (s.textContent !== m.sub) s.textContent = m.sub;
}
function dress() {
  const t = held(), mv = movesOf(t), wear = toji() || !!t;
  if (wear || dressed) for (let i = 0; i < 4; i++) {
    const k = SLOTS[i], m = wear ? mv[i] : null, b = E.hud.mv[k].querySelector('b');
    b.textContent = m ? m.name : wear && toji() ? '—' : BASE.names[k];
    E.CD[k] = m ? m.cd : wear && toji() ? 1 : BASE.cd[k];
    subOf(k, m);
  }
  dressed = wear;
  strip.classList.toggle('on', wear);
  if (!wear) return;
  const n = toji() ? 3 : 1, where = ['In hand', 'Cursed spirit', 'Waist'];
  strip.innerHTML = Array.from({ length: n }, (_, j) => { const i = (S.cur + j) % n, x = TOOLS[toji() ? S.slots[i] : S.slots[0]]; return `<span class="tpk${j ? '' : ' on'}"><small>${where[j]}</small>${x ? nameOf(x) : '—'}</span>`; }).join('') + (n > 1 ? '<span class="tpk key">T switches</span>' : '');
}
function swap() {                                   // T: whatever was round his neck is in his hand now
  const filled = [0, 1, 2].filter(i => TOOLS[S.slots[i]]);
  if (filled.length < 2) return;
  S.cur = filled[(filled.indexOf(S.cur) + 1) % filled.length]; save();
  const p = E.P1, t = held();
  if (p.move && !p.move.def.m1) E.endMove(p);
  rup = qte = thrown = null;
  for (const k of SLOTS) E.cd[k] = Math.min(E.cd[k], 1);
  sfx.whoosh(); shout(p, nameOf(t).toUpperCase(), t.col); dress();
}

/* ---------- the tool, drawn in whichever hand is doing the work ---------- */
function weapon(p, t) {
  if (t.id === 'chain') { if (lasso && p.move === lasso.m) chainWork(p); else chainIdle(p); return; }
  if (t.id === 'spear' && thrown) {                 // the spear is up: only its chain runs from his hand to it
    const w = E.hand(p, true), a = F(w[0], w[1]), b = F(thrown.x, thrown.y), k = a[2];
    sagged([a[0], a[1]], [b[0], b[1]], (thrown.phase === 'back' ? 4 : 30) * k, k, 24);
    return;
  }
  const ps = p.pose, tp = p.target || ps, back = tp[3] > tp[2], an = back ? ps[3] : ps[2], w = E.hand(p, !back), dx = Math.sin(an) * p.face, dy = -Math.cos(an);
  const at = L => F(w[0] + dx * L, w[1] + dy * L), h0 = at(-16), k = h0[2];
  const rod = (L0, L1, wd, col) => { const a0 = at(L0), a1 = at(L1); g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.strokeStyle = LINE; g.lineWidth = (wd + 4) * k; g.stroke(); g.strokeStyle = col; g.lineWidth = wd * k; g.stroke(); };
  g.lineCap = 'round';
  if (t.id === 'katana') { rod(-16, 14, 8, '#3a2f4a'); rod(14, 165, 6, STEEL); }
  else if (t.id === 'cloud') { for (let i = 0; i < 3; i++) rod(-10 + i * 62, 42 + i * 62, 11, CLOUD); }
  else {                                            // the spear: held near the end of its grip, the ring just behind his fist, all of the rest out in front of it
    g.lineCap = 'butt';
    const a = at(0), b = at(100), len = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]), u = len / 100 * .72;
    isohAt(a[0] + Math.cos(ang) * 76 * u, a[1] + Math.sin(ang) * 76 * u, ang, u, p.face < 0 ? -1 : 1);
    return;
  }
  g.lineCap = 'butt';
}

/* ---------- the Toji clan ---------- */
const TOJI = Object.assign({}, JU.cast3.TOJI, {
  chest() { g.save(); g.translate(-12, -10); g.rotate(.55); g.fillStyle = '#2a2c36'; g.fillRect(-3.5, -6, 7, 34); g.fillStyle = '#b9a56a'; g.fillRect(-5, -8, 10, 4); g.restore(); },   // one on his waist
  back() {                                          // and the cursed spirit he keeps the rest in, wound round his neck
    g.lineCap = 'round'; g.beginPath(); g.moveTo(-32, -TOR + 20); g.quadraticCurveTo(-10, -TOR - 16, 24, -TOR + 8);
    g.strokeStyle = LINE; g.lineWidth = 18; g.stroke(); g.strokeStyle = '#b9a6c9'; g.lineWidth = 13; g.stroke(); g.lineCap = 'butt';
    g.fillStyle = '#d8c8e6'; g.beginPath(); g.arc(27, -TOR + 10, 10, 0, TAU); g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
    g.fillStyle = LINE; g.fillRect(28, -TOR + 6, 3, 3); g.fillRect(31, -TOR + 12, 4, 2);
  } });
const HOST = { skin: TOJI, scale: 1.05, hp: 100, name: 'Sorcerer Killer', jp: '術師殺し', m1: 0, ce: 0, m1s: 0 };
C.CLAN.toji = { id: 'toji', name: 'Sorcerer Killer', jp: '殺し', odds: .01, col: '#cfd8e0', hp: 3, limited: ENDS, grade: 'Disaster grade',
  lines: ['+300% health', '+200% cursed tool damage', 'Carries three cursed tools at once: one in hand, one in the cursed spirit round his neck, one at his waist. T switches',
    'No cursed energy at all: a cursed technique cannot be equipped with this clan, nor this clan with a cursed technique'],
  ability: 'R — Deadly Counter. For three seconds, anything that hits you dies on the spot' };
C.ORDER.push('toji');
C.ext('toji', {
  begin() { C.st.host = HOST; JU.tech.revert(); },  // he looks like Toji, and whatever technique was equipped stays where it is
  r(p) {
    if (dcCd > 0) { shout(p, 'Deadly Counter: ' + Math.ceil(dcCd) + 's', '#c88'); return; }
    if (p.dead || p.ps) return;
    dc = COUNTER; dcCd = COUNTER_CD; sfx.charge(); shout(p, 'DEADLY COUNTER', '#ffffff'); V.ring(p.x, p.y + 150, 260, '#ffffff', .4);
  },
  press(a, inScene) { if (a === 'takeover' && !inScene) { swap(); return true; } return false; },
  guard(face) {                                     // it did hit him. That was the mistake
    if (dc <= 0) return false;
    const p = E.P1, o = E.P2;
    dc = 0; sfx.bf(); shake(32); V.impact(.3, o.x, o.y + 150); V.slash(o.x, o.y + 170, face > 0 ? Math.PI + .3 : -.3, 620, '#ffffff', 22);
    E.fx.push({ k: 2, x: p.x, y: p.y + 400, n: 'DEADLY COUNTER', col: '#ffffff', t: 0, life: 1.2 });
    if (!o.ko) E.applyHit(o, -face, { dmg: 999999, kb: 900, lift: 520, stun: .9, stop: .3, heavy: 1, col: '#ffffff', fixed: 1 });
    return true;
  }
});

/* ---------- wiring ---------- */
const move0 = H.move, m10 = H.m1, moveFx0 = H.moveFx, press0 = H.press, pow0 = H.power, hit0 = H.hit, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
H.move = k => { const m = movesOf(held())[SLOTS.indexOf(k)]; return m || move0(k); };
H.m1 = i => {
  const t = held();
  if (t && t.id === 'spear' && !thrown && i === 3) { const p = E.P1; p.move = { def: !p.ground ? IS_DOWN : jumpHeld() ? IS_UP : spearM1(3), i: 3, t: 0 }; return false; }      // the fourth: an uppercut, a slam, or the thrust
  if (t && t.every) { if (m1cd > 0) return false; m1cd = t.every; }
  return m10(i);
};
H.moveFx = (p, m) => { moveFx0(p, m); const t = held(); if (t && t.m1 && !(t.id === 'spear' && thrown) && m.def === M.m1[m.i]) m.def = t.m1(m.i); };
H.press = (a, inScene) => {
  if (!inScene && live && isoHeld()) {
    if (a === 'crush') {
      if (qte && !qte.res) { judge(); return true; }                                   // the square
      if (thrown && thrown.phase !== 'back') { pull(); return true; }                   // the chain
      if (rup && !E.P1.dead) { second(); return true; }                                 // Rupture, the second time
    }
    if (thrown && (a === 'strikes' || a === 'crush')) { shout(E.P1, 'The spear is up', GOLD); return true; }
  }
  if (!inScene && live && toji() && SLOTS.includes(a) && !movesOf(held())[SLOTS.indexOf(a)]) return true;   // nothing on that key: he has no cursed energy to put there
  return press0 ? press0(a, inScene) : false;
};
H.power = (h, o) => {
  const k = pow0 ? pow0(h, o) : 1, m = E.P1.move;
  if (h.tool) return h.tool * mult() / (h.dmg * (o.dr || 1));                    // a tool's own damage: the stated amount, and three times that for Toji
  return held() && o === E.P2 && m && m.def.m1 && !h.fixed ? k * mult() : k;      // an ordinary strike with a tool in his hand
};
H.hit = (o, face, h) => { hit0(o, face, h); if (h.isoh) isohSound(h.isoh); };
H.tick = dt => {
  tick0(dt);
  if (!live) return;
  if (m1cd > 0) m1cd -= dt;
  if (dc > 0) dc -= dt;
  if (dcCd > 0) dcCd -= dt;
  const p = E.P1;
  if (rup && ((rup.t -= dt) <= 0 || !isoHeld())) rup = null;
  if (qte) { qte.t += dt; const o = qte.o; if (there(o) && o === E.P2 && !o.poise) Object.assign(o, { ground: false, state: 'air', vy: 0, y: qte.y, vx: 0 }); if (!isoHeld()) qte = null; }      // they hang there while the square closes
  if (thrown) { if (!isoHeld() || p.dead) thrown = null; else flyTick(dt); }
  if (bound) bindTick(dt);
  if (lasso && p.move !== lasso.m) lasso = null;
  E.hud.mv.crush.classList.toggle('twice', !!(rup || (thrown && thrown.phase !== 'back') || qte));
  for (let i = dots.length - 1; i >= 0; i--) {
    const d = dots[i];
    if (d.o !== E.P2 || d.o.ko) { dots.splice(i, 1); continue; }
    if ((d.t -= dt) > 0) continue;
    d.t = d.every;
    if (d.gush && Z && gore()) for (let j = 0; j < 8; j++) Z.emit(4, d.o.x + rnd(-14, 14), d.o.y + 160, rnd(-300, 300), rnd(100, 600), rnd(4, 8), 1.5, '150,8,20', { g: 2200, land: 'blood' });
    if (--d.left <= 0) dots.splice(i, 1);
  }
};
H.fx = dt => {
  fx0(dt);
  if (!live) return;
  const p = E.P1, t = held();
  if (bound && bound.o === E.P2) boundDraw();
  if (thrown) { const c = F(thrown.x, thrown.y); spinDraw(c[0], c[1], thrown.rot, c[2] * 1.2, thrown.dir); }
  if (t && !p.dead && !(p.alpha < .05)) weapon(p, t);
  if (qte) {                                        // a square closing on a square: 2 while it is inside the gold one
    const o = qte.o, c = F(o.x, mid(o)), k = c[2], u = qte.t / QTE_T, size = v => 64 * k * lerp(2.6, .25, Math.min(1, v)), s = size(u), inside = u >= PERF[0] && u <= PERF[1];
    const sq = (w, col, lw) => { g.strokeStyle = col; g.lineWidth = lw * k; g.strokeRect(c[0] - w / 2, c[1] - w / 2, w, w); }, out = size(PERF[0]), inn = size(PERF[1]), S0 = (out + inn) / 2;
    g.save();
    g.fillStyle = inside ? 'rgba(226,192,96,.3)' : 'rgba(226,192,96,.13)'; g.beginPath(); g.rect(c[0] - out / 2, c[1] - out / 2, out, out); g.rect(c[0] - inn / 2, c[1] - inn / 2, inn, inn); g.fill('evenodd');      // the band it has to be in
    sq(out, 'rgba(226,192,96,.45)', 2); sq(inn, 'rgba(226,192,96,.45)', 2); sq(S0, GOLD, 4);
    sq(s, inside ? '#ffffff' : 'rgba(255,255,255,.8)', inside ? 5 : 3);
    if (inside) { g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.fire, c[0], c[1], 220 * k, .35); g.globalCompositeOperation = 'source-over'; }
    g.font = `${Math.round(20 * k)}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.fillText('2', c[0], c[1] - S0 * 1.6);
    g.restore();
  }
  if (dc > 0) {                                     // the counter is up: the ring round him says for how long
    const c = F(p.x, p.y + 150), r = 150 * c[2], u = dc / COUNTER;
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 4;
    g.beginPath(); g.arc(c[0], c[1], r, -Math.PI / 2, -Math.PI / 2 + TAU * u); g.stroke();
    g.setLineDash([8, 14]); g.lineWidth = 2; g.beginPath(); g.arc(c[0], c[1], r * 1.14, E.T * 2, E.T * 2 + TAU); g.stroke(); g.setLineDash([]);
  }
};
const clear = () => { m1cd = dc = dcCd = 0; dots.length = 0; rup = qte = thrown = bound = lasso = null; };
H.reset = () => {
  reset0(); clear(); live = false;
  if (dressed) { for (const k of SLOTS) { E.hud.mv[k].querySelector('b').textContent = BASE.names[k]; E.CD[k] = BASE.cd[k]; subOf(k, null); } dressed = false; }
  E.hud.mv.crush.classList.remove('twice');
  strip.classList.remove('on');
};
H.fightStart = (cfg, wave) => { if (!wave) clear(); start0(cfg, wave); if (live) dress(); };
// Free Exploration and Training call this after the technique and the clan have been put on
function apply() { live = true; if (!TOOLS[S.slots[S.cur]]) S.cur = Math.max(0, S.slots.findIndex(x => TOOLS[x])); dress(); }
// and a duel puts them away before the technique goes on (pvp.js): the hotbar is given back first, so nothing of the technique's is written over later
function off() { live = false; clear(); if (dressed) { for (const k of SLOTS) { E.hud.mv[k].querySelector('b').textContent = BASE.names[k]; E.CD[k] = BASE.cd[k]; subOf(k, null); } dressed = false; } strip.classList.remove('on'); }

/* ---------- the Cursed Tools screen: the reel, the pockets, the four cards ---------- */
let spinning = false, pick = 0;                     // which pocket the next tool goes into
const count = () => (C.equipped === 'toji' ? 3 : 1);
const roll = () => { let r = Math.random() * 100; for (const id of ORDER) if ((r -= TOOLS[id].odds) < 0) return id; return ORDER[0]; };
const tile = id => { const t = TOOLS[id]; return `<i class="tile" style="--c:${t.col}"><b lang="ja">${t.mark}</b><span>${t.name}</span></i>`; };
function put(id) { S.slots[pick] = id; if (pick >= count()) pick = 0; save(); }
// since the public release a card gives him only a tool he has spun or bought (shop.js keeps the list), and a spin uses a cursed tool spin
const mine = id => !JU.shop || JU.shop.owns('tool', id);
const nope = el => { el.classList.remove('no'); void el.offsetWidth; el.classList.add('no'); sfx.back(); };
const retix = no => { const el = document.getElementById('tix'); if (el && JU.shop) el.outerHTML = JU.shop.tix('tl', no); };
// and what is in his pockets has to be his: called when the page loads (shop.js)
function check(owns) {
  let ch = false;
  S.slots = S.slots.map(id => (id && !owns(id) ? (ch = true, null) : id));
  if (ch) save();
}
function mount(body) {
  const n = count(), where = ['In hand', 'Cursed spirit, round the neck', 'Waist'];
  if (pick >= n) pick = 0;
  body.innerHTML = `<div class="reelbox"><div class="reel"><div class="strip" id="strip">${ORDER.concat(ORDER, ORDER).map(tile).join('')}</div><u></u></div>
      <button class="spinb" id="spinb">Spin<span lang="ja">回</span></button><div class="rres" id="tres" aria-live="polite"></div></div>
    ${JU.shop ? JU.shop.tix('tl') : ''}
    <div class="pockets">${Array.from({ length: n }, (_, i) => { const t = TOOLS[S.slots[i]]; return `<button class="pocket${i === pick ? ' on' : ''}" data-pocket="${i}" style="--c:${t ? t.col : '#555'}" aria-label="${where[i]}: ${t ? nameOf(t) : 'empty'}"><small>${n > 1 ? where[i] : 'Your cursed tool'}</small><b>${t ? nameOf(t) : 'Empty'}</b></button>`; }).join('')}</div>
    <div class="tcards wcards">${ORDER.map(id => { const t = TOOLS[id]; return `<button class="wcard${S.slots.slice(0, n).includes(id) ? ' on' : ''}${mine(id) ? '' : ' lock'}" data-tool="${id}" style="--c:${t.col}" aria-label="Take the ${t.name}${mine(id) ? '' : ', not yours yet'}"><b lang="ja">${t.mark}</b><span>${t.name}</span><i>${t.odds}%</i><p>${t.what}</p></button>`; }).join('')}</div>
    <p class="fine">${n > 1 ? 'The Sorcerer Killer clan carries three: pick a pocket, then spin or take a card to fill it. In a fight, T switches between them.' : 'You carry one cursed tool. It is used in place of a cursed technique, in Free Exploration and Training: its moves are on the first keys when no technique is equipped. The Sorcerer Killer clan carries three.'}${JU.shop && JU.shop.PAID ? ' A spin uses a cursed tool spin, and what it lands on is yours: after that its card puts it in your pocket.' : ''}</p>`;
}
function spin() {
  if (spinning) return;
  if (JU.shop && !JU.shop.take('tl')) { nope(document.getElementById('spinb')); retix(true); return; }      // no cursed tool spin, no spin
  retix();
  const strip = document.getElementById('strip'), res = document.getElementById('tres'), id = roll(), seq = Array.from({ length: 30 }, roll), dur = JU.reduceMotion ? 300 : 3200;
  seq[26] = id; spinning = true; res.innerHTML = '';
  strip.style.transition = 'none'; strip.style.transform = 'translateX(0)'; strip.innerHTML = seq.map(tile).join('');
  void strip.offsetWidth;
  const w = strip.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(strip).columnGap || 0), view = strip.parentNode.getBoundingClientRect().width;
  strip.style.transition = `transform ${dur}ms cubic-bezier(.12,.72,.14,1)`; strip.style.transform = `translateX(${-(26 * w + w / 2 - view / 2)}px)`;
  const tick = setInterval(() => sfx.hover(), 110);
  setTimeout(() => {
    const t = TOOLS[id], body = document.getElementById('pBody'), r = strip.parentNode.getBoundingClientRect();
    clearInterval(tick); spinning = false; if (JU.shop) JU.shop.grant('tool', id); put(id);
    JU.flash(r.left + r.width / 2, r.top + r.height / 2); if (t.odds <= 1) { sfx.bf(); JU.bolts(r.left + r.width / 2, r.top + r.height / 2, 30); } else sfx.confirm();
    if (body && document.getElementById('strip')) { mount(body); document.getElementById('strip').innerHTML = [id, id, id].map(tile).join(''); document.getElementById('tres').innerHTML = `<small>You spun · ${t.odds}%</small><b style="color:${t.col}">${t.name}</b><span lang="ja">${t.jp}</span><p>${t.what}</p>`; }
  }, dur + 120);
}
document.addEventListener('click', e => {
  const body = document.getElementById('pBody'), k = e.target.closest('[data-tool]'), pk = e.target.closest('[data-pocket]');
  if (e.target.closest('#spinb')) { spin(); return; }
  if (spinning) return;
  if (pk) { pick = +pk.dataset.pocket; sfx.hover(); mount(body); return; }
  if (!k) return;
  if (!mine(k.dataset.tool)) {                      // not his: he has not spun it
    const t = TOOLS[k.dataset.tool], res = document.getElementById('tres');
    nope(k); if (res) res.innerHTML = `<small>Sealed · not yours yet</small><b style="color:${t.col}">${t.name}</b><span lang="ja">${t.jp}</span><p>Spin the reel for it (${t.odds}%).</p>`;
    return;
  }
  const r = k.getBoundingClientRect();
  put(k.dataset.tool); sfx.confirm(); JU.flash(r.left + r.width / 2, r.top + r.height / 2); mount(body);
});

JU.tools = { TOOLS, ORDER, mount, apply, off, roll, check, ENDS, TOJI, RUPTURE, RUPTURE2, LASSO, WHIP, IS_UP, IS_DOWN, PERF, QTE_T,
  get state() { return { live, slots: S.slots.slice(), cur: S.cur, dc, dcCd, m1cd, dots: dots.length, held: held() && held().id,
    rup: rup && +rup.t.toFixed(2), qte: qte && { t: +qte.t.toFixed(2), res: qte.res }, thrown: thrown && { phase: thrown.phase, t: +thrown.t.toFixed(2), hit: thrown.hit, x: Math.round(thrown.x), y: Math.round(thrown.y) }, bound: bound && +bound.t.toFixed(2) }; } };
})();
