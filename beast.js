/* JUJUTSU UNLIMITEDS — Build 0.26: LIGHTNING BEAST (limited, a week). The user: "new CT: LIGHTNING BEAST, m1s its a staff that kashimo carries and
   make it look like the staff in this image [a long red pole, gold at both ends, a black grip and a gold ring next to each] ... make him have 7 m1s
   and each m1 will emit lightning from it and each m1 make a different m1 sound by that i mean use the same one but make it lower pitch each time.
   have 3 moves for nOW", with the three described:
   STRIKES: seven, with the staff, and lightning off it each time. Each one's sound is the same crackle (home-lb-m1, the first crackle of a clip
     from the anime: at home our copy, online straight from where it is posted, index.html's WEB) played lower than the one before.
   1 THUNDERCLAP BARRAGE (14 s): in at them, three quick punches (6 each), and an uppercut with all of it in it that puts them in the air (16).
     The opening can be blocked.
   2 LIGHTNING DISCHARGE (20 s): a grab (no guard stops it), a kick that sends them back (10), and a bolt let go straight through them (40).
   3 ELECTRIC REVERSAL (18 s): a counter stance for a second. Hit him in it and he is behind them: their ribs (12), and into the floor with them,
     and the floor goes up in lightning (28). They are down.
   4 Coming soon (the user gave three). The look is the Thunder God's (cast6.js, KASHIMO), the staff in his hand and not on his back */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, T = JU.tech, Z = JU.bossfx, M = E.MOVES;
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2;
const ENDS = Date.parse('2026-11-12T12:00:00Z');   // a week from the day it arrived (with the Mythical Warrior clan: kashimo.js)
const BOLT = '#9fe8ff', KZ = '159,232,255', WHITE = '255,255,255';
const RED = '#c4202a', RED2 = '#e2383c', GOLD = '#e2b545', GOLD2 = '#f6d77a', GRIP = '#1b1b20';
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const live = o => !!o && !o.ko && !(o.alpha < 1);
const on = () => T.active === DEF;
const holdable = o => live(o) && !duel() && !o.net;
const mid = o => o.y + 170 * (o.scale || 1);
const facing = (p, o) => { if (live(o)) p.face = o.x >= p.x ? 1 : -1; };
const label = (x, y, text, col = BOLT, life = 1.1) => E.fx.push({ k: 2, x, y, n: text, col, t: 0, life });
const big = (p, o, word, kind = 'bw') => { if (JU.ms) JU.ms.bigHit(p, o, word, BOLT, kind); };
const ono = (text, x, y, s = .8, life = .8) => { if (JU.ms) JU.ms.ono(text, x, y, s, BOLT, life); };
const play = (name, vol, alt, rate = 1) => { if (!sfx.file(name, vol, rate)) alt(); };      // the clip (at home ours, online from where it is posted), or a built one
const zapAt = (x, y, n = 5, R = 220, w = 3) => { if (Z) for (let i = 0; i < n; i++) { const a = rnd(0, TAU), l = rnd(R * .4, R); Z.lightning(x, y, x + Math.cos(a) * l, Math.max(0, y + Math.sin(a) * l), KZ, rnd(.1, .22), w, 1); } };
const UPPER = [.16, -.25, 2.95, .55, .5, -.35, 0], GUARD = [-.06, 0, 1.45, .95, .42, -.42, 0], GRAB = [.3, 0, 1.55, 1.45, .5, -.45, 0], PALM = [.3, 0, 1.62, .55, .55, -.5, 0];
sfx.preload(['home-lb-m1', 'home-lb-crack', 'home-lb-shock']);

/* ================= the staff ================= */
// held at a third of the way along, at the front hand. a: its angle (0 straight ahead, up is positive), ext: slid forward through the hand (a thrust)
const st = { a: 1.75, ext: 0, swing: null };       // swing: { a0, a1, t0, t1, ext } while a strike is moving it
const BACK = 105, FRONT = 195;
function drawStaff(p) {
  const w = E.hand(p, true), s = p.scale || 1, d = [Math.cos(st.a) * p.face, Math.sin(st.a)];
  const at = L => F(w[0] + d[0] * L * s, w[1] + d[1] * L * s), k = at(0)[2] * s;
  const L0 = -BACK + st.ext, L1 = FRONT + st.ext, seg = (a, b, wd, col) => { const q0 = at(a), q1 = at(b); g.strokeStyle = col; g.lineWidth = wd * k; g.beginPath(); g.moveTo(q0[0], q0[1]); g.lineTo(q1[0], q1[1]); g.stroke(); };
  g.save(); g.lineCap = 'butt';
  seg(L0 - 2, L1 + 2, 14, LINE);                    // the outline, then the pole
  seg(L0, L1, 9, RED); seg(L0 + 8, L1 - 8, 2.5, RED2);
  for (const [e, dir] of [[L0, 1], [L1, -1]]) {     // each end: a gold cap, a black grip, a thin gold ring
    seg(e, e + dir * 12, 10, GOLD); seg(e + dir * 3, e + dir * 10, 3, GOLD2);
    seg(e + dir * 12, e + dir * 34, 9.5, GRIP);
    seg(e + dir * 34, e + dir * 39, 10.5, GOLD); seg(e + dir * 41, e + dir * 44, 9.5, GOLD);
  }
  g.restore();
  if (st.charge > 0 && Math.random() < .5 && Z) {   // the charge on it, crawling along
    const u = rnd(L0, L1), q = [w[0] + d[0] * u * s, w[1] + d[1] * u * s];
    Z.lightning(q[0], q[1], q[0] + rnd(-60, 60), q[1] + rnd(-60, 60), KZ, .07, 2, 0);
  }
}
const tipOf = (p, a = st.a, far = 1) => { const w = E.hand(p, true), s = p.scale || 1, L = (FRONT + st.ext) * far * s; return [w[0] + Math.cos(a) * p.face * L, w[1] + Math.sin(a) * L]; };
// where the staff is meant to be pointing just now: the strike moving it, or held up beside him
function staffTick(p, dt) {
  const sw = st.swing, m = p.move;
  if (sw && m && m.def === sw.def) {
    const u = clamp((m.t - sw.t0) / (sw.t1 - sw.t0), 0, 1), e = u < 0 ? 0 : ease(u);
    st.a = m.t < sw.t0 ? lerp(st.a, sw.a0, 1 - Math.exp(-dt * 30)) : lerp(sw.a0, sw.a1, e);
    st.ext = lerp(st.ext, m.t >= sw.t0 && m.t < sw.t1 + .05 ? sw.ext || 0 : 0, 1 - Math.exp(-dt * 26));
    return;
  }
  st.swing = null;
  const want = m && m.def.staff !== undefined ? m.def.staff : !p.ground ? 2.2 : 1.75;      // (a move may hold it somewhere of its own)
  let da = (want - st.a) % TAU; if (da > Math.PI) da -= TAU; if (da < -Math.PI) da += TAU;
  st.a += da * (1 - Math.exp(-dt * 14)); st.ext = lerp(st.ext, 0, 1 - Math.exp(-dt * 14));
}

/* ================= STRIKES: seven, the same crackle each time and a step lower ================= */
const RATE = [1, .93, .86, .8, .74, .68, .62];
const DMG = [3, 3, 3.5, 3.5, 4, 4, 7];
//            pre          pose      base  staff from → to   reach  thrust
const SW = [['jab', 'jab', 0, -.25, .05, 205, 60], ['crushWind', 'crush', 1, 2.1, -.7, 200, 0], ['hookWind', 'hook', 1, -.95, 1.5, 200, 0],
  ['manjiWind', 'manji', 2, .3, .3 - TAU, 210, 0], ['jab', 'cross', 1, -.2, .08, 215, 70], ['divWind', 'div', 2, 2.35, -1.05, 205, 0], ['kickWind', 'hook', 3, -1.25, 2.1, 225, 20]];
function strike(i) {                                // the moment it goes: the sound, and lightning off the end of it
  const p = E.P1;
  play('home-lb-m1', .62, () => sfx.zap(RATE[i]), RATE[i]);
  sfx.whoosh();
  const sw = st.swing, tip = tipOf(p, sw ? lerp(sw.a0, sw.a1, .6) : st.a), f = p.face;      // (where the end of it is about to be)
  if (Z) {
    Z.lightning(tip[0], tip[1], tip[0] + f * rnd(160, 260), tip[1] + rnd(-70, 70), KZ, .16, i === 6 ? 6 : 3, i === 6 ? 3 : 1);
    if (i === 6) { Z.lightning(tip[0], tip[1], tip[0] + f * 520, tip[1] + rnd(-40, 40), KZ, .26, 9, 4); Z.flash(WHITE, .16, .12); Z.flare(tip[0], tip[1], KZ, 380, .18); }
  }
  V.sparks(tip[0], tip[1], 'blue', i === 6 ? 14 : 5);
}
const STRIKES = SW.map(([pre, pose, base, a0, a1, reach, ext], i) => {
  const b = M.m1[base], last = i === 6;
  const d = Object.assign({}, b, { pre, pose, n: 7, kick: 0, lb: i, sw: 'rgba(159,232,255,.9)', whoosh: () => strike(i), lunge: last ? 300 : 230,
    hit: last ? { reach, dmg: DMG[i], kb: 720, lift: 520, stun: .9, stop: .12, heavy: 1, col: BOLT, mute: 1, lb: i }
      : { reach, dmg: DMG[i], kb: 170, stun: .38, stop: .045, col: BOLT, mute: 1, lb: i } });
  d.swingAt = [a0, a1, ext];
  return d;
});
function m1(i) {
  const p = E.P1;
  if (JU.clan && JU.clan.body()) return true;      // in somebody else's body (a clan's): the ordinary strikes
  const def = STRIKES[i] || STRIKES[0], d = def.swingAt;
  p.move = { def, i: STRIKES[i] ? i : 0, t: 0 };
  st.swing = { def, a0: d[0], a1: d[1], ext: d[2], t0: def.strike, t1: def.strike + .12 };
  return false;
}
// one of them landed
function landed(o, face, h) {
  const x = o.x - face * 20, y = mid(o);
  V.sparks(x, y, 'blue', 4 + h.lb); V.ring(x, y, 70 + 14 * h.lb, BOLT, .14); zapAt(x, y, 2 + (h.lb >> 1), 150 + 20 * h.lb);
  if (h.lb === 6) { E.zoomIn(.25); shake(20); play('home-lb-crack', .55, () => sfx.thunder()); E.addBlast(x, y, KZ, 260); }
}

/* ================= 1 — THUNDERCLAP BARRAGE ================= */
const PUNCH = [.26, .36, .46], UP_AT = .64;
const BARRAGE = { name: 'Thunderclap Barrage', cd: 14, dur: 1.05, glow: 'blue', staff: 2.4, run(p, m, t) {
  const o = E.P2;
  p.rate = 46;
  if (!m.s) { m.s = 1; facing(p, o); sfx.whoosh(); play('home-lb-m1', .5, () => sfx.zap(1.2), 1.15); if (Z) Z.dust(p.x, 6, -p.face); }
  if (t < .24) {                                    // in at them, a streak of it behind him
    const gap = live(o) ? (o.x - p.x) * p.face : 999;
    p.target = POSE.dash; p.vx = gap > 125 ? p.face * 2400 : 0;
    if (Math.random() < .8 && Z) Z.lightning(p.x - p.face * 30, p.y + rnd(80, 240), p.x - p.face * rnd(120, 240), p.y + rnd(60, 260), KZ, .1, 2, 0);
    return;
  }
  p.vx = 0;
  const n = PUNCH.filter(x => t >= x).length;
  if (t < UP_AT - .06) p.target = n % 2 ? POSE.jab : POSE.cross;
  else p.target = t < UP_AT ? POSE.crushWind : t < UP_AT + .25 ? UPPER : POSE.idle;
  if (n > (m.n || 0)) {                             // three quick ones
    m.n = n; sfx.whoosh();
    if (E.tryHit(p, { reach: 175, dmg: 6, kb: 40, stun: .55, stop: .05, col: BOLT, mute: 1 })) {
      const h = E.hand(p, n % 2 === 1); V.sparks(h[0] + p.face * 30, h[1], 'blue', 6); zapAt(o.x - p.face * 20, mid(o), 2, 140); play('home-lb-m1', .45, () => sfx.zap(1.3), 1.3); sfx.hit(false);
    }
  }
  if (t >= UP_AT && !m.up) {                        // and up, with all of it in it
    m.up = 1; sfx.whoosh();
    const hit = E.tryHit(p, { reach: 195, dmg: 16, kb: 110, lift: 1350, stun: 1, stop: .14, heavy: 1, col: BOLT, mute: 1 });
    const x = live(o) && hit ? o.x : p.x + p.face * 120, y0 = hit ? mid(o) : p.y + 200;
    play('home-lb-crack', .6, () => sfx.thunder());
    if (Z) { for (let i = 0; i < 3; i++) Z.lightning(x + rnd(-30, 30), y0 - 60, x + rnd(-60, 60), y0 + 900, KZ, rnd(.25, .4), 7, 3); Z.pillar(x, 60, 900, KZ, .3); Z.flash(WHITE, .25, .14); }
    V.ring(x, y0, 240, BOLT, .3); shake(hit ? 26 : 10);
    if (hit) { big(p, o, 'バチッ'); label(x, y0 + 360, 'THUNDERCLAP', BOLT, 1); }
  }
} };

/* ================= 2 — LIGHTNING DISCHARGE ================= */
let held = null;                                    // { o } while the grab has them
const DISCHARGE = { name: 'Lightning Discharge', cd: 20, dur: 1.75, glow: 'blue', staff: 2.5, run(p, m, t) {
  const o = E.P2;
  p.rate = 44;
  if (m.got === undefined) {                        // a lunge for them
    if (!m.s) { m.s = 1; facing(p, o); sfx.whoosh(); }
    const gap = live(o) ? (o.x - p.x) * p.face : 999;
    if (t > .38 || !live(o)) { p.vx = 0; p.target = POSE.idle; if (t > .55) E.endMove(p); return; }
    p.target = GRAB; p.vx = gap > 110 ? p.face * 1700 : 0;
    if (gap > -40 && gap < 160 && Math.abs(o.y - p.y) < 240 && !(o.inv > 0) && o.state !== 'down') {
      m.got = t; p.vx = 0; sfx.hit(true); shake(10); E.stop(.06);
      play('home-lb-shock', .5, () => sfx.zap(.9));
      label(p.x, p.y + 470, 'LIGHTNING DISCHARGE', BOLT, 1.2);
      if (holdable(o)) held = { o };
    }
    return;
  }
  const k = t - m.got;
  if (k < .32) {                                    // held there, with it running into them
    p.target = GRAB;
    if (held) Object.assign(held.o, { x: p.x + p.face * 115, y: Math.max(0, held.o.y * .8), vx: 0, vy: 0, state: 'hurt', stun: .5, act: null, tele: 0, face: -p.face });
    if (Math.random() < .7) zapAt(o.x, mid(o), 1, 160, 2);
    return;
  }
  if (!m.kick) {                                    // the kick: away from him
    m.kick = 1; held = null;
    if (live(o)) { E.applyHit(o, p.face, { dmg: 10, kb: 1350, stun: 1.4, stop: .08, col: BOLT, grab: 1, brk: 1, mute: 1 }); sfx.hit(true); V.sparks(o.x, mid(o), 'blue', 10); }
  }
  if (k < .62) { p.target = k < .5 ? POSE.kick : POSE.idle; return; }
  if (!m.bolt) {                                    // and the bolt, straight through them
    m.bolt = 1;
    const f = p.face, w = E.hand(p, true), far = live(o) ? (o.x - p.x) * f : 0, ex = p.x + f * Math.max(900, far + 500), y = w[1];
    play('home-lb-crack', .8, () => sfx.thunder()); sfx.blast();
    if (Z) {
      for (let i = 0; i < 3; i++) Z.lightning(w[0], y, ex, y + rnd(-50, 50), KZ, rnd(.35, .5), i ? 7 : 14, 4);
      Z.flash(WHITE, .55, .25); Z.dim(.6, .35); Z.flare(w[0], y, KZ, 520, .25); Z.shock(p.x + f * 200, 520, KZ, .4, 12);
    }
    V.bolt(w[0], y, ex, y, BOLT, .4, 12); shake(34); E.zoomIn(.35);
    if (live(o) && far > -60 && far < 1300 && !(o.inv > 0)) {
      E.applyHit(o, f, { dmg: 40, kb: 760, lift: 420, stun: 1.2, stop: .3, heavy: 1, col: BOLT, grab: 1, brk: 1, mute: 1 });
      sfx.hit(true); zapAt(o.x, mid(o), 8, 300, 4); E.addBlast(o.x, mid(o), KZ, 380); big(p, o, 'ドォン');
    }
  }
  p.target = k < 1 ? PALM : POSE.idle;
} };

/* ================= 3 — ELECTRIC REVERSAL ================= */
const STANCE_T = 1;
const STANCE = { name: 'Electric Reversal', cd: 18, dur: STANCE_T + .1, glow: 'blue', staff: .12, run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = GUARD;
  if (!m.s) { m.s = 1; play('home-lb-m1', .4, () => sfx.zap(.8), .8); label(p.x, p.y + 440, 'ELECTRIC REVERSAL', BOLT, .9); }
  st.charge = 1;
  if (Math.random() < .5) zapAt(p.x + rnd(-60, 60), p.y + rnd(60, 280), 1, 130, 2);
  if (t > STANCE_T) { st.charge = 0; E.endMove(p); }
} };
const REVERSE = { name: 'Electric Reversal', dur: .95, glow: 'blue', staff: 2.3, run(p, m, t) {
  const o = m.o;
  p.rate = 50; p.vx = 0;
  if (!m.s) {                                       // behind them, before the blow has finished landing
    m.s = 1; st.charge = 0; p.inv = Math.max(p.inv || 0, 1);
    const x0 = p.x, y0 = p.y, side = p.x >= o.x ? 1 : -1, eb = H.bound ? H.bound() : 965;
    p.x = clamp(o.x - side * 115, -eb, eb); p.y = 0; p.vy = 0; p.face = o.x >= p.x ? 1 : -1;
    if (Z) { Z.lightning(x0, y0 + 170, p.x, 170, KZ, .22, 6, 2); zapAt(x0, y0 + 170, 4, 200); }
    V.sparks(p.x, 170, 'blue', 10); play('home-lb-m1', .55, () => sfx.zap(1.1), 1.1); sfx.whoosh(); E.stop(.05);
  }
  if (t < .3) {                                     // the ribs
    p.target = t < .1 ? POSE.hookWind : POSE.hook;
    if (t >= .1 && !m.rib && live(o)) {
      m.rib = 1;
      E.applyHit(o, p.face, { dmg: 12, kb: 30, stun: 1.3, stop: .1, col: BOLT, mute: 1 }); sfx.hit(true);
      V.sparks(o.x, mid(o), 'blue', 8); zapAt(o.x, mid(o), 3, 170); big(p, o, 'ガッ');
    }
    return;
  }
  p.target = t < .4 ? POSE.crushWind : t < .7 ? POSE.crush : POSE.idle;
  if (t >= .4 && !m.slam) {                         // and into the floor, which goes up in lightning
    m.slam = 1;
    const x = live(o) ? o.x : p.x + p.face * 110;
    if (live(o)) {
      E.applyHit(o, p.face, { dmg: 28, kb: 70, stun: 1.4, stop: .22, heavy: 1, col: BOLT, mute: 1 });
      if (holdable(o) && !o.poise) Object.assign(o, { y: 0, vy: 0, ground: true, state: 'down', stun: 1.4, vx: 0 });
    }
    play('home-lb-crack', .8, () => sfx.thunder()); sfx.blast(); shake(36); E.zoomIn(.3);
    V.crack(x, 360); V.rocks(x, 0, 14); E.addRing(x, KZ, 480); E.addBlast(x, 80, KZ, 440); zapAt(x, 30, 10, 420, 5);
    if (Z) { Z.boom(x, 70, 160, KZ, { n: 18, hot: WHITE }); Z.pillar(x, 70, 700, KZ, .4); Z.flash(WHITE, .4, .2); Z.shock(x, 700, KZ, .45, 14); Z.decal('scorch', x, 160, KZ, 8, 0); Z.dust(x, 10); }
    ono('バリバリ', x, 420, 1); label(x, 600, 'REVERSAL', BOLT, 1.1);
  }
} };
function guard(face, a) {                           // hit in the stance: it never lands
  const p = E.P1, m = p.move, o = E.P2;
  if (!(m && m.def === STANCE && m.t <= STANCE_T) || p.dead || !live(o)) return false;
  p.move = { def: REVERSE, t: 0, o };              // (the stance's wait is spent already: the counter is part of it)
  return true;
}

/* ================= the moves ================= */
const COMING = { name: 'Coming soon', cd: 0, dur: .01, run(p) { E.endMove(p); } };
const MOVES = { strikes: BARRAGE, crush: DISCHARGE, div: STANCE, manji: COMING };
const SKIN = Object.assign({}, JU.cast6.KASHIMO, {
  back() {                                          // on his back only where it is not in his hand (walking about the city)
    if (E.root.dataset.mode === 'fight' && on()) return;
    g.save(); g.translate(-13, -E.TOR + 8); g.rotate(-.55); g.lineWidth = 2.5; g.strokeStyle = LINE;
    g.fillStyle = RED; g.fillRect(-3, -100, 6, 160); g.strokeRect(-3, -100, 6, 160);
    g.fillStyle = GOLD; g.fillRect(-3.5, -102, 7, 6); g.fillRect(-3.5, 56, 7, 6); g.fillStyle = GRIP; g.fillRect(-3, -96, 6, 12); g.fillRect(-3, 44, 6, 12);
    g.restore();
  } });
JU.tech.add('beast', { name: 'Lightning Beast', jp: '雷獣', mark: '雷', who: 'Lightning', odds: 2.5, col: BOLT, glow: 'blue', moves: MOVES,
  limited: ENDS, skin: SKIN, as: ['Lightning Beast', '雷獣'], m1, guard,
  hint: '<b>1</b> Thunderclap Barrage · <b>2</b> Lightning Discharge · <b>3</b> Electric Reversal · seven strikes with the staff' });
const DEF = T.TECH.beast;

/* ---------- wiring ---------- */
const press0 = H.press, tick0 = H.tick, fx0 = H.fx, hit0 = H.hit, reset0 = H.reset, start0 = H.fightStart;
H.press = (a, inScene) => {
  if (!inScene && on() && E.root.dataset.mode === 'fight' && a === 'manji') return true;      // (4 is still to come)
  return press0 ? press0(a, inScene) : false;
};
H.hit = (o, face, h) => { hit0(o, face, h); if (on() && h.lb !== undefined) landed(o, face, h); };
H.tick = dt => {
  tick0(dt);
  if (!on()) { held = null; st.charge = 0; return; }
  const p = E.P1;
  if (held && !(p.move && p.move.def === DISCHARGE)) held = null;
  if (st.charge && !(p.move && p.move.def === STANCE)) st.charge = 0;
  staffTick(p, dt);
};
H.fx = dt => {
  fx0(dt);
  const p = E.P1;
  if (!on() || p.dead || p.alpha < .05 || p.skin !== SKIN) return;
  drawStaff(p);
  if (st.charge) { const c = F(p.x, p.y + 160); lit(() => E.glow(E.GLOW.blue, c[0], c[1], 300 * c[2], .4 + .15 * Math.sin(E.T * 30))); }
};
const clear = () => { held = null; st.charge = 0; st.swing = null; st.a = 1.75; st.ext = 0; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); clear(); };

JU.beast = { MOVES, STRIKES, BARRAGE, DISCHARGE, STANCE, REVERSE, SKIN, ENDS, RATE, st,
  get state() { return { held: !!held, charge: !!st.charge, a: +st.a.toFixed(2), ext: Math.round(st.ext) }; } };
})();
