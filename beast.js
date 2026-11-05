/* JUJUTSU UNLIMITEDS — LIGHTNING BEAST (Build 0.26; Early Access from Build 0.27). The user: "new CT: LIGHTNING BEAST, m1s its a staff that
   kashimo carries and make it look like the staff in this image [a long red pole, gold at both ends, a black grip and a gold ring next to each]
   ... make him have 7 m1s and each m1 will emit lightning from it and each m1 make a different m1 sound by that i mean use the same one but
   make it lower pitch each time. have 3 moves for nOW", with the three described:
   STRIKES: seven, with the staff, and lightning off it each time. Each one's sound is the same hit (home-lb-m1: at home our copy, online
     straight from where it is posted, index.html's WEB) played lower than the one before. Build 0.26v1: it was the first crackle of a clip from
     the anime, and that had a voice in it ("in kashimo or something sayin BLA. makew iot an actual hitting sfx"); it is a punch now.
   1 THUNDERCLAP BARRAGE (14 s): in at them, three quick punches (6 each), and an uppercut with all of it in it that puts them in the air (16).
   2 LIGHTNING DISCHARGE (20 s): a grab (no guard stops it), a kick that sends them back (10), and a bolt let go straight through them (40).
   3 ELECTRIC REVERSAL (18 s): a counter stance for a second. Hit him in it and he is behind them: their ribs (12), and into the floor with them,
     and the floor goes up in lightning (28). They are down.
   4 Coming soon.
   Build 0.27, the user's: E is a LIGHTNING METER of five bars, one a press. Each bar is one more strike in the chain (seven, up to twelve). Full:
     the strikes go purple and land half as hard again, and 1 and 2 become THUNDERCLAP BARRAGE: MAX (thirteen claps, seven purple strikes, a
     last of 40: 107) and LIGHTNING OUTPUT: MAX (it takes them down or flung as well: kicked into the air under lightning, the staff planted
     where they come down, and they come down on it; five seconds on it, E picks it up with them on it and slams them, five times, then 1 throws
     them off and he goes up after them and drives them into the floor with it, 80). Using one of the two spends the meter; so does leaving it
     for twenty seconds. Either way it rests, four seconds for every bar there was. While it rests, E charges it from the Beast bar instead (a
     third of it a time), and the third charge is BEAST MODE: orange, thirty seconds. Three strikes, colossal, the third a down slam in the air
     and an uppercut with jump held; BEAST: LIGHTNING BARRAGE (slammed into the floor, 80, and orange lightning out of his hands, 40) and
     LIGHTNING OUTPUT: BEAST MODE (a long dash, and if it meets them they go the length of the arena, and he is on them with the staff: 16, and
     seventy strikes of orange lightning, 110 in all). G with the Beast bar full and the meter resting is all three charges at once.
   The look is the Thunder God's (cast6.js, KASHIMO), the staff in his hand and not on his back */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, T = JU.tech, Z = JU.bossfx, M = E.MOVES;
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2;
const BOLT = '#9fe8ff', KZ = '159,232,255', WHITE = '255,255,255';
const PAL = { blue: { col: BOLT, rgb: KZ, spark: 'blue', glow: 'blue' }, purple: { col: '#c58cff', rgb: '197,140,255', spark: 'purple', glow: 'purple' }, orange: { col: '#ffa040', rgb: '255,160,64', spark: 'fire', glow: 'fire' } };
const RED = '#c4202a', RED2 = '#e2383c', GOLD = '#e2b545', GOLD2 = '#f6d77a', GRIP = '#1b1b20';
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const live = o => !!o && !o.ko && !(o.alpha < 1);
const on = () => T.active === DEF;
const holdable = o => live(o) && !duel() && !o.net;
const mid = o => o.y + 170 * (o.scale || 1);
const facing = (p, o) => { if (live(o)) p.face = o.x >= p.x ? 1 : -1; };
const bound = () => (H.bound ? H.bound() : 965);
const label = (x, y, text, col = BOLT, life = 1.1) => E.fx.push({ k: 2, x, y, n: text, col, t: 0, life });
const big = (p, o, word, col = BOLT, kind = 'bw') => { if (JU.ms) JU.ms.bigHit(p, o, word, col, kind); };
const ono = (text, x, y, col = BOLT, s = .8, life = .8) => { if (JU.ms) JU.ms.ono(text, x, y, s, col, life); };
const play = (name, vol, alt, rate = 1) => { if (!sfx.file(name, vol, rate)) alt(); };      // the clip (at home ours, online from where it is posted), or a built one
const zapAt = (x, y, n = 5, R = 220, w = 3, rgb = KZ) => { if (Z) for (let i = 0; i < n; i++) { const a = rnd(0, TAU), l = rnd(R * .4, R); Z.lightning(x, y, x + Math.cos(a) * l, Math.max(0, y + Math.sin(a) * l), rgb, rnd(.1, .22), w, 1); } };
const sky = (x, y, rgb, w = 7) => { if (Z) for (let i = 0; i < 2; i++) Z.lightning(x + rnd(-40, 40), 1000, x + rnd(-14, 14), y, rgb, rnd(.2, .32), i ? w * .5 : w, 3); };      // a bolt down out of the sky onto (x, y)
const jumpHeld = () => E.keys.has('w') || E.keys.has(' ') || E.keys.has('arrowup');
const UPPER = [.16, -.25, 2.95, .55, .5, -.35, 0], GUARD = [-.06, 0, 1.45, .95, .42, -.42, 0], GRAB = [.3, 0, 1.55, 1.45, .5, -.45, 0], PALM = [.3, 0, 1.62, .55, .55, -.5, 0], ROAR = [-.12, -.3, 2.6, 2.4, .5, -.5, 0];
sfx.preload(['home-lb-m1', 'home-lb-crack', 'home-lb-shock']);
// damage that does not move them (seventy strikes of lightning, or a bolt on somebody in the air): exactly n, as the clan's bonus sees it
function chip(o, n, col) {
  if (!live(o)) return 0;
  const k = H.power ? H.power({ dmg: n, fixed: 1, col }, o) : 1, d = n * k;
  if (o.hp - d <= 0) E.applyHit(o, E.P1.face, { dmg: n / (o.dr || 1), kb: 0, stun: .5, fixed: 1, col, mute: 1 });
  else { o.hp -= d; o.lastHit = 0; o.flash = .06; }
  return d;
}

/* ================= THE LIGHTNING METER (E) ================= */
const BARS = 5, HOLD = 20, CD_PER = 4, COST = 33, BEAST_T = 30;
const mt = { bars: 0, hold: 0, cd: 0, cdMax: 0, ult: 0, beast: 0 };      // bars filled; seconds before they fade; resting, and for how long in all; Beast charges; Beast Mode's seconds
const beastOn = () => mt.beast > 0;
const full = () => !beastOn() && mt.bars >= BARS;
const pal = () => PAL[beastOn() ? 'orange' : full() ? 'purple' : 'blue'];
function spend() {                                  // the meter used (or left to fade): it rests, longer the more there was in it
  const n = mt.bars;
  if (!n) return;
  mt.bars = 0; mt.hold = 0; mt.cd = mt.cdMax = CD_PER * n; mt.ult = 0;
}
// one press: a bar, gathered into the staff
const CHARGE = { name: 'Lightning Meter', dur: .34, glow: 'blue', staff: 1.62, run(p, m, t) {
  p.vx = 0; p.rate = 36; p.target = t < .26 ? UPPER : POSE.idle;
  if (!m.s) {
    m.s = 1; const P = pal(), tip = tipOf(p, 1.62);
    sfx.zap(.8 + mt.bars * .06); V.sparks(tip[0], tip[1], P.spark, 6 + mt.bars * 2); zapAt(tip[0], tip[1], 2 + mt.bars, 160 + mt.bars * 30, 3, P.rgb);
    if (full()) {                                   // the fifth: purple, all of it
      play('home-lb-crack', .55, () => sfx.thunder()); shake(14); sky(p.x, p.y + 330, P.rgb, 9);
      if (Z) { Z.flash(P.rgb, .25, .2); Z.pillar(p.x, 60, 900, P.rgb, .35); }
      label(p.x, p.y + 520, 'MAX', P.col, 1.2); ono('雷', p.x, p.y + 600, P.col, 1, 1);
    } else label(p.x, p.y + 470, 'LIGHTNING ' + mt.bars + '/5', P.col, .7);
  }
  st.charge = 1;
} };
// three charges from the Beast bar while the meter rests: BEAST MODE
const ROARING = { name: 'Beast Mode', dur: 1.05, glow: 'fire', staff: 2.5, run(p, m, t) {
  const P = PAL.orange;
  p.vx = 0; p.rate = 30; p.target = t < .9 ? ROAR : POSE.idle;
  if (!m.s) {
    m.s = 1; p.inv = Math.max(p.inv || 0, 1.1); E.slow(.5);
    play('home-lb-crack', .9, () => sfx.thunder()); sfx.blast(); shake(30); E.zoomIn(.5);
    if (Z) { Z.flash(P.rgb, .45, .3); Z.pillar(p.x, 80, 1000, P.rgb, .6); Z.shock(p.x, 900, P.rgb, .5, 14); Z.dim(.5, .8); }
    label(p.x, p.y + 560, 'BEAST MODE', P.col, 1.6); ono('獣', p.x, p.y + 660, P.col, 1.2, 1.2);
    if (JU.manga) JU.manga.think(p, 'BEAST MODE.', { life: 1.4 });
  }
  if (Math.random() < .7) { zapAt(p.x + rnd(-60, 60), p.y + rnd(40, 320), 1, 220, 3, P.rgb); }
  if (t > .2 && t < .8 && Math.random() < .25) sky(p.x + rnd(-200, 200), 0, P.rgb, 5);
} };
function beastStart(p) {
  mt.beast = BEAST_T; mt.ult = 0; mt.bars = 0; mt.hold = 0;
  if (p.move && p.move.def.m1) E.endMove(p);
  if (!p.move && !p.ps && !p.dead) p.move = { def: ROARING, t: 0 };
  else { label(p.x, p.y + 560, 'BEAST MODE', PAL.orange.col, 1.6); play('home-lb-crack', .9, () => sfx.thunder()); }
}
function esPress(p) {
  if (p.dead) return true;
  if (imp) { if ((imp.phase === 'wait' || imp.phase === 'held') && imp.slams < SLAMS) slamStart(p); else if (imp.phase === 'slam') imp.qSlam = 1; return true; }      // (on the staff: E is the slam. One pressed while a slam is still going is the next)
  if (beastOn()) { label(p.x, p.y + 430, 'BEAST MODE · ' + Math.ceil(mt.beast) + 's', PAL.orange.col, .7); return true; }
  if (mt.cd > 0) {                                  // resting: charged from the Beast bar instead, a third of it at a time
    if (!T.spend(COST)) { label(p.x, p.y + 430, 'NEEDS A THIRD OF THE BEAST BAR', PAL.orange.col, .9); sfx.back(); return true; }
    mt.ult++; sfx.zap(.7); zapAt(p.x, p.y + 200, 3, 220, 3, PAL.orange.rgb); V.sparks(p.x, p.y + 200, 'fire', 8);
    label(p.x, p.y + 450, 'BEAST ' + mt.ult + '/3', PAL.orange.col, .8);
    if (mt.ult >= 3) beastStart(p);
    return true;
  }
  if (mt.bars >= BARS) { label(p.x, p.y + 430, 'MAX', PAL.purple.col, .6); return true; }
  if (p.move || p.ps || p.dashT > 0) return true;  // (in the middle of something)
  mt.bars++; mt.hold = HOLD;
  p.move = { def: CHARGE, t: 0 };
  return true;
}
function awaken(p) {                                // G, the Beast bar full: all three charges at once, if the meter is resting
  if (beastOn()) return;
  if (!(mt.cd > 0)) { label(p.x, p.y + 430, 'THE METER HAS TO BE RESTING', PAL.orange.col, 1); return; }
  const n = 3 - mt.ult;
  if (!T.spend(COST * n)) return;
  mt.ult = 3; beastStart(p);
}
const ESP = { jp: '雷', get col() { return pal().col; },
  name: () => (beastOn() ? 'Beast Mode' : mt.cd > 0 ? 'Beast Charge' : full() ? 'Max' : 'Lightning Meter'),
  get left() { return beastOn() ? 0 : mt.cd; }, get max() { return mt.cdMax || 1; },
  press: p => esPress(p) };
// the meter itself, under his health bar
const meter = document.createElement('div');
meter.className = 'lbm'; meter.setAttribute('aria-hidden', 'true');
meter.innerHTML = '<span>' + '<i></i>'.repeat(BARS) + '</span><em>' + '<u></u>'.repeat(3) + '</em><b></b>';
E.root.querySelector('.fb.p1').appendChild(meter);
const pips = [...meter.querySelectorAll('i')], dots = [...meter.querySelectorAll('u')], mtxt = meter.querySelector('b'), mdots = meter.querySelector('em');
let shownM = '';
function paintMeter() {
  const show = on() && E.root.dataset.mode === 'fight';
  meter.classList.toggle('on', show);
  if (!show) { shownM = ''; return; }
  const resting = mt.cd > 0 && !beastOn(), cdn = resting ? Math.ceil(mt.cd / (mt.cdMax || 1) * BARS) : 0;
  const key = [mt.bars, cdn, mt.ult, Math.ceil(mt.beast), Math.ceil(mt.cd), mt.bars && mt.hold < 4 ? 1 : 0].join();
  if (key === shownM) return;
  shownM = key;
  meter.classList.toggle('max', full()); meter.classList.toggle('beast', beastOn()); meter.classList.toggle('cd', resting); meter.classList.toggle('fade', mt.bars > 0 && mt.hold < 4);
  pips.forEach((el, i) => { el.className = beastOn() ? 'f' : resting ? (i < cdn ? 'c' : '') : i < mt.bars ? 'f' : ''; });
  dots.forEach((el, i) => { el.className = i < mt.ult ? 'f' : ''; });
  mdots.hidden = !resting;
  mtxt.textContent = beastOn() ? 'BEAST MODE · ' + Math.ceil(mt.beast) + 's' : resting ? 'RESTING · ' + Math.ceil(mt.cd) + 's' : full() ? 'MAX' : 'LIGHTNING ' + mt.bars + '/5';
}
function meterTick(dt) {
  if (mt.beast > 0 && (mt.beast -= dt) <= 0) { mt.beast = 0; const p = E.P1; label(p.x, p.y + 470, 'BEAST MODE OVER', PAL.orange.col, 1.2); }
  if (mt.cd > 0 && (mt.cd -= dt) <= 0) { mt.cd = 0; mt.ult = 0; const p = E.P1; if (!beastOn()) label(p.x, p.y + 450, 'METER READY', BOLT, .9); }
  if (mt.bars > 0 && !beastOn() && (mt.hold -= dt) <= 0) spend();      // left too long: it fades, and rests
}

/* ================= the staff ================= */
// held at a third of the way along, at the front hand. a: its angle (0 straight ahead, up is positive), ext: slid forward through the hand (a thrust).
// lock: a move is turning it itself; planted: stood in the floor at x (Lightning Output: MAX)
const st = { a: 1.75, ext: 0, swing: null, charge: 0, lock: false, planted: null };
const BACK = 105, FRONT = 195, PLANT_TOP = 290;
function drawPole(w, d, s, L0, L1) {                // from w (the world), along d, L0 to L1
  const at = L => F(w[0] + d[0] * L * s, w[1] + d[1] * L * s), k = at(0)[2] * s;
  const seg = (a, b, wd, col) => { const q0 = at(a), q1 = at(b); g.strokeStyle = col; g.lineWidth = wd * k; g.beginPath(); g.moveTo(q0[0], q0[1]); g.lineTo(q1[0], q1[1]); g.stroke(); };
  g.save(); g.lineCap = 'butt';
  seg(L0 - 2, L1 + 2, 14, LINE);                    // the outline, then the pole
  seg(L0, L1, 9, RED); seg(L0 + 8, L1 - 8, 2.5, RED2);
  for (const [e, dir] of [[L0, 1], [L1, -1]]) {     // each end: a gold cap, a black grip, a thin gold ring
    seg(e, e + dir * 12, 10, GOLD); seg(e + dir * 3, e + dir * 10, 3, GOLD2);
    seg(e + dir * 12, e + dir * 34, 9.5, GRIP);
    seg(e + dir * 34, e + dir * 39, 10.5, GOLD); seg(e + dir * 41, e + dir * 44, 9.5, GOLD);
  }
  g.restore();
}
function drawStaff(p) {
  const w = E.hand(p, true), s = p.scale || 1, d = [Math.cos(st.a) * p.face, Math.sin(st.a)], L0 = -BACK + st.ext, L1 = FRONT + st.ext;
  drawPole(w, d, s, L0, L1);
  const P = pal();
  if ((st.charge > 0 || full() || beastOn()) && Math.random() < (beastOn() ? .8 : .5) && Z) {      // the charge on it, crawling along
    const u = rnd(L0, L1), q = [w[0] + d[0] * u * s, w[1] + d[1] * u * s];
    Z.lightning(q[0], q[1], q[0] + rnd(-60, 60), q[1] + rnd(-60, 60), P.rgb, .07, 2, 0);
  }
}
const tipOf = (p, a = st.a, far = 1) => { const w = E.hand(p, true), s = p.scale || 1, L = (FRONT + st.ext) * far * s; return [w[0] + Math.cos(a) * p.face * L, w[1] + Math.sin(a) * L]; };
// where the staff is meant to be pointing just now: the strike moving it, or held up beside him
function staffTick(p, dt) {
  if (st.lock) return;
  const sw = st.swing, m = p.move;
  if (sw && m && m.def === sw.def) {
    const u = clamp((m.t - sw.t0) / (sw.t1 - sw.t0), 0, 1), e = ease(u);
    st.a = m.t < sw.t0 ? lerp(st.a, sw.a0, 1 - Math.exp(-dt * 30)) : lerp(sw.a0, sw.a1, e);
    st.ext = lerp(st.ext, m.t >= sw.t0 && m.t < sw.t1 + .05 ? sw.ext || 0 : 0, 1 - Math.exp(-dt * 26));
    return;
  }
  st.swing = null;
  const want = m && m.def.staff !== undefined ? m.def.staff : !p.ground ? 2.2 : 1.75;      // (a move may hold it somewhere of its own)
  let da = (want - st.a) % TAU; if (da > Math.PI) da -= TAU; if (da < -Math.PI) da += TAU;
  st.a += da * (1 - Math.exp(-dt * 14)); st.ext = lerp(st.ext, 0, 1 - Math.exp(-dt * 14));
}

/* ================= STRIKES: seven and one for every bar, the same hit each time and a step lower ================= */
const DMG = [3, 3, 3.5, 3.5, 4, 4], LAST = 7, MORE = 3.5, PURPLE_K = 1.5;
//            pre          pose      base  staff from → to   reach  thrust
const SW = [['jab', 'jab', 0, -.25, .05, 205, 60], ['crushWind', 'crush', 1, 2.1, -.7, 200, 0], ['hookWind', 'hook', 1, -.95, 1.5, 200, 0],
  ['manjiWind', 'manji', 2, .3, .3 - TAU, 210, 0], ['jab', 'cross', 1, -.2, .08, 215, 70], ['divWind', 'div', 2, 2.35, -1.05, 205, 0], ['kickWind', 'hook', 3, -1.25, 2.1, 225, 20]];
const BEAST_DMG = [15, 18, 32];                     // Beast Mode's three: colossal
const chainLen = () => (beastOn() ? 3 : 7 + mt.bars);
function strike(d) {                                // the moment it goes: the sound, and lightning off the end of it
  const p = E.P1, P = PAL[d.c], heavy = d.last || d.c === 'orange';
  play('home-lb-m1', d.c === 'orange' ? .8 : .62, () => sfx.hit(!!d.last), d.rate);      // (no clip to be had: the plain hit, at least)
  sfx.whoosh();
  const sw = st.swing, tip = tipOf(p, sw ? lerp(sw.a0, sw.a1, .6) : st.a), f = p.face;      // (where the end of it is about to be)
  if (Z) {
    Z.lightning(tip[0], tip[1], tip[0] + f * rnd(160, 260), tip[1] + rnd(-70, 70), P.rgb, .16, heavy ? 6 : 3, heavy ? 3 : 1);
    if (heavy) { Z.lightning(tip[0], tip[1], tip[0] + f * 520, tip[1] + rnd(-40, 40), P.rgb, .26, d.c === 'orange' ? 12 : 9, 4); Z.flash(WHITE, .16, .12); Z.flare(tip[0], tip[1], P.rgb, 380, .18); }
  }
  V.sparks(tip[0], tip[1], P.spark, heavy ? 14 : 5);
}
function strikeDef(i, L) {
  const c = beastOn() ? 'orange' : full() ? 'purple' : 'blue', P = PAL[c], rate = 1 - .38 * i / Math.max(1, L - 1);
  if (c === 'orange') {                             // Beast Mode: three, and the third goes down or up if he does
    if (i === 2 && !E.P1.ground) return Object.assign(B_DOWN, { rate });
    if (i === 2 && jumpHeld()) return Object.assign(B_UP, { rate });
    const s = SW[i === 2 ? 6 : i], [pre, pose, base, a0, a1, reach, ext] = s, last = i === 2, dmg = BEAST_DMG[i];
    const d = Object.assign({}, M.m1[base], { pre, pose, n: 3, kick: 0, lb: i, last, c, rate, sw: `rgba(${P.rgb},.95)`, lunge: 320,
      hit: { reach: reach + 15, dmg, kb: last ? 1000 : 300, lift: last ? 650 : 0, stun: last ? 1 : .55, stop: last ? .18 : .09, heavy: 1, col: P.col, mute: 1, lb: i, last, c } });
    d.whoosh = () => strike(d); d.swingAt = [a0, a1, ext];
    return d;
  }
  const last = i === L - 1, s = last ? SW[6] : SW[i % 6], [pre, pose, base, a0, a1, reach, ext] = s;
  const dmg = (last ? LAST : i < 6 ? DMG[i] : MORE) * (c === 'purple' ? PURPLE_K : 1);
  const d = Object.assign({}, M.m1[base], { pre, pose, n: L, kick: 0, lb: i, last, c, rate, sw: `rgba(${P.rgb},.9)`, lunge: last ? 300 : 230,
    hit: last ? { reach, dmg, kb: 720, lift: 520, stun: .9, stop: .12, heavy: 1, col: P.col, mute: 1, lb: i, last, c }
      : { reach, dmg, kb: 170, stun: .38, stop: .045, col: P.col, mute: 1, lb: i, c } });
  d.whoosh = () => strike(d); d.swingAt = [a0, a1, ext];
  return d;
}
// Beast Mode's third, in the air: down on them, and them into the floor
const B_DOWN = { m1: 1, n: 3, lb: 2, last: true, c: 'orange', rate: .62, dur: 1.3, swingAt: [2.3, -1.4, 0], staff: 2.3, run(p, m, t) {
  const o = E.P2, P = PAL.orange;
  p.rate = 46;
  if (m.land !== undefined) { p.vx = 0; p.target = t < m.land + .2 ? POSE.crush : POSE.idle; if (t > m.land + .34) E.endMove(p); return; }
  if (p.ground && t > .02) { m.land = t; p.vy = 0; dent(p.x + p.face * 90, !!m.done, P); return; }
  if (t < .12) { p.target = POSE.crushWind; p.vy = Math.max(p.vy, 80); p.vx *= .88; return; }
  if (!m.aim) { m.aim = 1; facing(p, o); strike(m.def); m.vx = clamp((o.x - p.face * 70 - p.x) / Math.max(.1, p.y / 1900), -1600, 1600); }
  p.target = POSE.crush; p.vy = -1900; p.vx = m.vx;
  if (!m.done && E.tryHit(p, { reach: 230, dmg: BEAST_DMG[2], kb: 160, stun: 1, stop: .14, heavy: 1, col: P.col, mute: 1, lb: 2, last: 1, c: 'orange' })) {
    m.done = 1;
    if (holdable(o) && !o.poise) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 26), vy: -2100, vx: p.face * 120, bounced: false });
  }
} };
// with jump held: up from underneath
const B_UP = { m1: 1, n: 3, lb: 2, last: true, c: 'orange', rate: .62, dur: .66, swingAt: [-1.4, 2.4, 0], run(p, m, t) {
  const P = PAL.orange;
  p.rate = 46;
  if (t < .13) { p.target = POSE.crushWind; if (p.ground) p.vx = p.face * 160; return; }
  p.target = t < .44 ? UPPER : POSE.idle; if (p.ground) p.vx = t < .2 ? p.face * 260 : 0;
  if (!m.sw) { m.sw = 1; strike(m.def); }
  if (!m.done && t < .3 && E.tryHit(p, { reach: 230, dmg: BEAST_DMG[2], kb: 80, lift: 1500, stun: 1, stop: .14, heavy: 1, col: P.col, mute: 1, lb: 2, last: 1, c: 'orange' })) { m.done = 1; sky(E.P2.x, mid(E.P2), P.rgb, 8); }
} };
function dent(x, hard, P) {                         // where something comes down hard
  sfx.blast(); shake(hard ? 30 : 14);
  V.crack(x, hard ? 320 : 180); V.rocks(x, 0, hard ? 12 : 5); V.ring(x, 40, hard ? 340 : 200, P.col, .3); zapAt(x, 20, hard ? 8 : 3, hard ? 360 : 200, 4, P.rgb);
  if (Z && hard) { Z.boom(x, 60, 130, P.rgb, { n: 16, hot: WHITE }); Z.shock(x, 600, P.rgb, .4, 12); }
}
function m1(i) {
  const p = E.P1;
  if (JU.clan && JU.clan.body()) return true;      // in somebody else's body (a clan's): the ordinary strikes
  const L = chainLen();
  if (i >= L) i = 0;
  const def = strikeDef(i, L), d = def.swingAt;
  p.move = { def, i, t: 0 };
  st.swing = { def, a0: d[0], a1: d[1], ext: d[2], t0: def.strike || .1, t1: (def.strike || .1) + .12 };
  return false;
}
// one of them landed
function landed(o, face, h) {
  const x = o.x - face * 20, y = mid(o), P = PAL[h.c || 'blue'], n = Math.min(h.lb, 8);
  V.sparks(x, y, P.spark, 4 + n); V.ring(x, y, 70 + 14 * n, P.col, .14); zapAt(x, y, 2 + (n >> 1), 150 + 20 * n, 3, P.rgb);
  if (h.c === 'orange') { shake(16); E.addBlast(x, y, P.rgb, 220); }
  if (h.last) { E.zoomIn(.25); shake(20); play('home-lb-crack', .55, () => sfx.thunder()); E.addBlast(x, y, P.rgb, 260); }
}

/* ================= 1 — THUNDERCLAP BARRAGE ================= */
const PUNCH = [.26, .36, .46], UP_AT = .64;
function dashIn(p, o, t, P, until = .24) {          // in at them, a streak of it behind him
  if (t >= until) return false;
  const gap = live(o) ? (o.x - p.x) * p.face : 999;
  p.target = POSE.dash; p.vx = gap > 125 ? p.face * 2400 : 0;
  if (Math.random() < .8 && Z) Z.lightning(p.x - p.face * 30, p.y + rnd(80, 240), p.x - p.face * rnd(120, 240), p.y + rnd(60, 260), P.rgb, .1, 2, 0);
  return true;
}
function upper(p, o, dmg, P, word) {                // the uppercut, with all of it in it
  sfx.whoosh();
  const hit = E.tryHit(p, { reach: 200, dmg, kb: 110, lift: 1350, stun: 1, stop: .14, heavy: 1, col: P.col, mute: 1 });
  const x = live(o) && hit ? o.x : p.x + p.face * 120, y0 = hit ? mid(o) : p.y + 200;
  play('home-lb-crack', .6, () => sfx.thunder());
  if (Z) { for (let i = 0; i < 3; i++) Z.lightning(x + rnd(-30, 30), y0 - 60, x + rnd(-60, 60), y0 + 900, P.rgb, rnd(.25, .4), 7, 3); Z.pillar(x, 60, 900, P.rgb, .3); Z.flash(WHITE, .25, .14); }
  V.ring(x, y0, 240, P.col, .3); shake(hit ? 26 : 10);
  if (hit) { big(p, o, 'バチッ', P.col); label(x, y0 + 360, word, P.col, 1); }
  return hit;
}
const BARRAGE = { name: 'Thunderclap Barrage', cd: 14, dur: 1.05, glow: 'blue', staff: 2.4, run(p, m, t) {
  const o = E.P2, P = PAL.blue;
  p.rate = 46;
  if (!m.s) { m.s = 1; facing(p, o); sfx.whoosh(); sfx.zap(1.2); if (Z) Z.dust(p.x, 6, -p.face); }
  if (dashIn(p, o, t, P)) return;
  p.vx = 0;
  const n = PUNCH.filter(x => t >= x).length;
  if (t < UP_AT - .06) p.target = n % 2 ? POSE.jab : POSE.cross;
  else p.target = t < UP_AT ? POSE.crushWind : t < UP_AT + .25 ? UPPER : POSE.idle;
  if (n > (m.n || 0)) {                             // three quick ones
    m.n = n; sfx.whoosh();
    if (E.tryHit(p, { reach: 175, dmg: 6, kb: 40, stun: .55, stop: .05, col: P.col, mute: 1 })) {
      const h = E.hand(p, n % 2 === 1); V.sparks(h[0] + p.face * 30, h[1], 'blue', 6); zapAt(o.x - p.face * 20, mid(o), 2, 140); play('home-lb-m1', .45, () => sfx.zap(1.3), 1.3);
    }
  }
  if (t >= UP_AT && !m.up) { m.up = 1; upper(p, o, 16, P, 'THUNDERCLAP'); }
} };
// full: thirteen claps, seven strikes of purple lightning, and a last of 40. 107 in all
const CLAPS = 13, CLAP = 3, BOLTS = 7, BOLT_D = 4, MAX_UP = 40, CLAP_AT = .26, CLAP_EVERY = .065, BOLT_AT = 1.16, BOLT_EVERY = .08, MAX_UP_AT = 1.84;
const MAX_BARRAGE = { name: 'Thunderclap Barrage: MAX', cd: 14, dur: 2.3, glow: 'purple', staff: 2.4, run(p, m, t) {
  const o = E.P2, P = PAL.purple;
  p.rate = 50;
  if (!m.s) { m.s = 1; spend(); facing(p, o); sfx.whoosh(); sfx.zap(1.3); if (Z) Z.dust(p.x, 6, -p.face); label(p.x, p.y + 500, 'THUNDERCLAP BARRAGE: MAX', P.col, 1.2); }
  if (dashIn(p, o, t, P)) return;
  p.vx = 0;
  const n = Math.min(CLAPS, Math.max(0, Math.floor((t - CLAP_AT) / CLAP_EVERY) + 1));
  if (t < BOLT_AT) p.target = n % 2 ? POSE.jab : POSE.cross;
  else if (t < MAX_UP_AT - .08) p.target = PALM;
  else p.target = t < MAX_UP_AT ? POSE.crushWind : t < MAX_UP_AT + .3 ? UPPER : POSE.idle;
  if (n > (m.n || 0)) {                             // the claps: thirteen of them, faster than the eye
    m.n = n;
    if (n % 2) sfx.whoosh();
    if (E.tryHit(p, { reach: 200, dmg: CLAP, kb: 12, stun: .45, stop: .02, col: P.col, mute: 1 })) {
      const h = E.hand(p, n % 2 === 1); V.sparks(h[0] + p.face * 30, h[1], 'purple', 4); if (n % 3 === 0) zapAt(o.x - p.face * 20, mid(o), 1, 140, 3, P.rgb);
      if (n % 2) play('home-lb-m1', .35, () => sfx.zap(1.4), 1.2 - n * .02);
    }
  }
  const b = t >= BOLT_AT ? Math.min(BOLTS, Math.floor((t - BOLT_AT) / BOLT_EVERY) + 1) : 0;
  if (b > (m.b || 0)) {                             // then seven strikes of purple lightning, out of his hands and down out of the sky
    m.b = b;
    const there = live(o) && Math.abs(o.x - p.x) < 420 && (o.x - p.x) * p.face > -40, x = there ? o.x : p.x + p.face * 200, y = there ? mid(o) : p.y + 180, w = E.hand(p, true);
    if (Z) { Z.lightning(w[0], w[1], x, y + rnd(-40, 40), P.rgb, .14, 5, 2); if (b % 2) sky(x, y, P.rgb, 6); }
    sfx.zap(1 - b * .05);
    if (there) { E.applyHit(o, p.face, { dmg: BOLT_D, kb: 0, stun: .5, stop: .03, col: P.col, mute: 1 }); V.sparks(x, y, 'purple', 6); }
  }
  if (t >= MAX_UP_AT && !m.up) { m.up = 1; if (upper(p, o, MAX_UP, P, 'THUNDERCLAP: MAX') && Z) Z.flash(P.rgb, .35, .25); }
} };
// Beast Mode: into the floor with the staff (80), and orange lightning out of his hands (40)
const B_BARRAGE = { name: 'Beast: Lightning Barrage', cd: 14, dur: 1.5, glow: 'fire', staff: 2.4, run(p, m, t) {
  const o = E.P2, P = PAL.orange;
  p.rate = 46;
  if (!m.s) { m.s = 1; facing(p, o); sfx.whoosh(); sfx.zap(1); if (Z) Z.dust(p.x, 8, -p.face); label(p.x, p.y + 500, 'BEAST: LIGHTNING BARRAGE', P.col, 1.2); }
  if (dashIn(p, o, t, P, .22)) return;
  p.vx = 0;
  if (t < .42) { p.target = POSE.crushWind; st.lock = false; return; }
  if (!m.slam) {                                    // the staff, down through them and into the floor
    m.slam = 1;
    const hit = E.tryHit(p, { reach: 240, dmg: 80, kb: 40, stun: 1.6, stop: .26, heavy: 1, col: P.col, mute: 1 });
    const x = hit ? o.x : p.x + p.face * 160;
    if (hit && holdable(o) && !o.poise) Object.assign(o, { y: 0, vy: 0, vx: 0, ground: true, state: 'down', stun: 1.6 });
    play('home-lb-crack', .9, () => sfx.thunder()); dent(x, true, P); E.zoomIn(.4);
    if (Z) { Z.pillar(x, 80, 900, P.rgb, .45); Z.flash(P.rgb, .35, .2); Z.decal('scorch', x, 180, P.rgb, 8, 0); }
    if (hit) { big(p, o, 'ドゴォ', P.col, 'neg'); ono('獣', x, 560, P.col, 1.1, 1); }
  }
  if (t < .85) { p.target = POSE.crush; return; }
  p.target = t < 1.3 ? PALM : POSE.idle;
  if (!m.out) {                                     // and out of his hands, orange
    m.out = 1;
    const f = p.face, w = E.hand(p, true), far = live(o) ? (o.x - p.x) * f : 0, ex = p.x + f * Math.max(950, far + 400);
    play('home-lb-shock', .7, () => sfx.zap(.9)); sfx.blast(); shake(28);
    if (Z) { for (let i = 0; i < 4; i++) Z.lightning(w[0], w[1], ex, w[1] + rnd(-90, 60), P.rgb, rnd(.3, .45), i ? 6 : 13, 4); Z.flare(w[0], w[1], P.rgb, 480, .22); Z.shock(p.x + f * 240, 520, P.rgb, .4, 12); }
    V.bolt(w[0], w[1], ex, w[1], P.col, .35, 11);
    if (live(o) && far > -60 && far < 1000 && !(o.inv > 0)) { E.applyHit(o, f, { dmg: 40, kb: 900, lift: 380, stun: 1, stop: .2, heavy: 1, col: P.col, mute: 1 }); zapAt(o.x, mid(o), 7, 280, 4, P.rgb); }
  }
} };

/* ================= 2 — LIGHTNING DISCHARGE ================= */
let held = null;                                    // { o } while the grab has them
const DISCHARGE = { name: 'Lightning Discharge', cd: 20, dur: 1.75, glow: 'blue', staff: 2.5, run(p, m, t) {
  const o = E.P2, P = PAL.blue;
  p.rate = 44;
  if (m.got === undefined) {                        // a lunge for them
    if (!m.s) { m.s = 1; facing(p, o); sfx.whoosh(); }
    const gap = live(o) ? (o.x - p.x) * p.face : 999;
    if (t > .38 || !live(o)) { p.vx = 0; p.target = POSE.idle; if (t > .55) E.endMove(p); return; }
    p.target = GRAB; p.vx = gap > 110 ? p.face * 1700 : 0;
    if (gap > -40 && gap < 160 && Math.abs(o.y - p.y) < 240 && !(o.inv > 0) && o.state !== 'down') {
      m.got = t; p.vx = 0; sfx.hit(true); shake(10); E.stop(.06);
      play('home-lb-shock', .5, () => sfx.zap(.9));
      label(p.x, p.y + 470, 'LIGHTNING DISCHARGE', P.col, 1.2);
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
    if (live(o)) { E.applyHit(o, p.face, { dmg: 10, kb: 1350, stun: 1.4, stop: .08, col: P.col, grab: 1, brk: 1, mute: 1 }); sfx.hit(true); V.sparks(o.x, mid(o), 'blue', 10); }
  }
  if (k < .62) { p.target = k < .5 ? POSE.kick : POSE.idle; return; }
  if (!m.bolt) { m.bolt = 1; throughThem(p, o, 40, P, 'ドォン'); }
  p.target = k < 1 ? PALM : POSE.idle;
} };
function throughThem(p, o, dmg, P, word) {          // a bolt out of his hand, straight through them
  const f = p.face, w = E.hand(p, true), far = live(o) ? (o.x - p.x) * f : 0, ex = p.x + f * Math.max(900, far + 500), y = w[1];
  play('home-lb-crack', .8, () => sfx.thunder()); sfx.blast();
  if (Z) {
    for (let i = 0; i < 3; i++) Z.lightning(w[0], y, ex, y + rnd(-50, 50), P.rgb, rnd(.35, .5), i ? 7 : 14, 4);
    Z.flash(WHITE, .55, .25); Z.dim(.6, .35); Z.flare(w[0], y, P.rgb, 520, .25); Z.shock(p.x + f * 200, 520, P.rgb, .4, 12);
  }
  V.bolt(w[0], y, ex, y, P.col, .4, 12); shake(34); E.zoomIn(.35);
  if (live(o) && far > -60 && far < 1300 && !(o.inv > 0)) {
    E.applyHit(o, f, { dmg, kb: 760, lift: 420, stun: 1.2, stop: .3, heavy: 1, col: P.col, grab: 1, brk: 1, mute: 1 });
    sfx.hit(true); zapAt(o.x, mid(o), 8, 300, 4, P.rgb); E.addBlast(o.x, mid(o), P.rgb, 380); big(p, o, word, P.col);
  }
}
/* ---------- full: LIGHTNING OUTPUT: MAX. Into the air under lightning, down onto the staff, five slams on it, thrown off it, and driven into the floor ---------- */
const KICK_D = 10, AIR_D = 5, PIN_D = 10, SLAM_D = 8, FLING_D = 5, STAB = 80, SLAMS = 5, ON_IT = 5, AIR_T = 1.15, PIN_Y = 125, AIR_AT = [.18, .42, .66];
let imp = null;                                     // what the staff is doing with them: { o, phase, t, x0, y0, x1, slams, life, n (bolts so far), gx, gy (where they were thrown to) }
const OUTPUT_MAX = { name: 'Lightning Output: MAX', cd: 20, dur: 30, glow: 'purple', staff: 2.5, run(p, m, t) {
  const o = E.P2, P = PAL.purple;
  p.rate = 46;
  if (m.got === undefined) {                        // a lunge for them: down, flung, it takes them all the same
    if (!m.s) { m.s = 1; spend(); facing(p, o); sfx.whoosh(); label(p.x, p.y + 500, 'LIGHTNING OUTPUT: MAX', P.col, 1.3); }
    const gap = live(o) ? (o.x - p.x) * p.face : 999;
    if (t > .45 || !live(o)) { p.vx = 0; p.target = POSE.idle; if (t > .62) E.endMove(p); return; }
    p.target = GRAB; p.vx = gap > 110 ? p.face * 1900 : 0;
    if (gap > -70 && gap < 190 && Math.abs(o.y - p.y) < 440) {
      m.got = t; p.vx = 0; sfx.hit(true); shake(12); E.stop(.06); play('home-lb-shock', .55, () => sfx.zap(.9));
      if (holdable(o)) held = { o };
    }
    return;
  }
  const k = t - m.got;
  if (k < .22) { p.target = GRAB; if (held) Object.assign(held.o, { x: p.x + p.face * 115, vx: 0, vy: 0, state: 'hurt', stun: .5, act: null, tele: 0 }); if (Math.random() < .7) zapAt(o.x, mid(o), 1, 160, 2, P.rgb); return; }
  if (!m.kick) {                                    // the kick: up
    m.kick = 1; held = null;
    if (live(o)) {
      E.applyHit(o, p.face, { dmg: KICK_D, kb: 120, lift: 1700, stun: 2, stop: .06, col: P.col, grab: 1, brk: 1, mute: 1 }); sfx.hit(true); V.sparks(o.x, mid(o), 'purple', 12);
      if (holdable(o) && !o.poise) { const eb = bound(); imp = { o, phase: 'air', t: 0, x0: o.x, y0: Math.max(o.y, 80), x1: clamp(o.x + p.face * 380, -eb + 100, eb - 100), slams: 0, life: ON_IT, n: 0, face: p.face }; }
      else m.loose = 1;                             // (a body not ours to steer: the lightning, and a bolt through them)
    }
  }
  if (m.loose) {
    p.target = k < .45 ? POSE.kick : k < 1.2 ? PALM : POSE.idle;
    const n = AIR_AT.filter(a => k >= .22 + a).length;
    if (n > (m.n || 0)) { m.n = n; if (live(o)) { sky(o.x, mid(o), P.rgb); chip(o, AIR_D, P.col); sfx.zap(.9); } }
    if (k >= 1 && !m.bolt) { m.bolt = 1; throughThem(p, o, 30, P, 'ドォン'); }
    if (k > 1.5) E.endMove(p);
    return;
  }
  if (!imp) { p.target = POSE.idle; if (m.over === undefined) m.over = t; if (t > m.over + .35) E.endMove(p); return; }
  p.vx = 0;
  const f = imp, ph = f.phase;
  p.target = ph === 'air' ? (f.t < .3 ? POSE.kick : f.t < .55 ? POSE.dash : f.t < .75 ? POSE.crush : POSE.idle)
    : ph === 'wait' ? POSE.idle : ph === 'slam' ? (f.t < .16 ? UPPER : POSE.crush) : ph === 'held' ? UPPER
    : ph === 'throw' ? (f.t < .14 ? POSE.crushWind : UPPER) : ph === 'leap' ? (f.t < .3 ? UPPER : POSE.crush) : POSE.idle;
} };
function impTick(dt) {
  const f = imp, o = f.o, p = E.P1, P = PAL.purple, hs = o.scale || 1;
  if (!live(o) || o !== E.P2 || !(p.move && p.move.def === OUTPUT_MAX) || p.dead) { impEnd(); return; }
  f.t += dt;
  if (o.ai) o.ai.t = Math.max(o.ai.t || 0, .5);
  const put = (x, y, state = 'hurt') => Object.assign(o, { x, y: Math.max(0, y), vx: 0, vy: 0, ground: y <= 0, state, stun: .6, act: null, tele: 0 });
  const onTip = () => { const tip = tipOf(p, st.a); put(tip[0], tip[1] - 170 * hs); return tip; };
  if (f.phase === 'air') {                          // up, under lightning, and on its way down onto where the staff will be
    const u = Math.min(1, f.t / AIR_T);
    put(lerp(f.x0, f.x1, u), lerp(f.y0, PIN_Y, u) + 4 * 230 * u * (1 - u), 'air');      // (kept under the top of the picture)
    const n = AIR_AT.filter(a => f.t >= a).length;
    if (n > f.n) { f.n = n; sky(o.x, mid(o), P.rgb, 7); chip(o, AIR_D, P.col); sfx.zap(.95); V.sparks(o.x, mid(o), 'purple', 8); if (n === 1) ono('バリッ', o.x, mid(o) + 200, P.col, .8, .7); }
    if (f.t >= .3 && !f.went) {                     // to where they will come down
      f.went = 1; const x0 = p.x, eb = bound();
      p.x = clamp(f.x1 - f.face * 95, -eb, eb); p.face = f.face; p.y = 0; p.vy = 0;
      if (Z) { Z.lightning(x0, 170, p.x, 170, P.rgb, .22, 6, 2); zapAt(x0, 170, 3, 200, 3, P.rgb); }
      sfx.whoosh(); sfx.zap(1.1);
    }
    if (f.t >= .58 && !st.planted) {                // and the staff stood in the floor there, crackling
      st.planted = { x: f.x1 }; sfx.hit(true); shake(10); V.sparks(f.x1, 30, 'purple', 10); zapAt(f.x1, 40, 4, 220, 3, P.rgb);
      label(f.x1, PLANT_TOP + 260, 'PLANTED', P.col, .8);
    }
    if (u >= 1) {                                   // down onto it
      f.phase = 'wait'; f.t = 0;
      E.applyHit(o, f.face, { dmg: PIN_D, kb: 0, stun: 1, stop: .16, heavy: 1, col: P.col, mute: 1 }); put(f.x1, PIN_Y);
      sfx.hit(true); play('home-lb-crack', .55, () => sfx.thunder()); shake(24); zapAt(f.x1, PLANT_TOP, 8, 320, 4, P.rgb); E.addBlast(f.x1, PLANT_TOP, P.rgb, 320);
      big(p, o, 'グサッ', P.col, 'neg'); label(f.x1, PLANT_TOP + 300, 'E · SLAM', P.col, 1.4);
    }
    return;
  }
  if (f.phase === 'wait') {                         // on the staff, five seconds at most
    put(f.x1, PIN_Y);
    if (Math.random() < .5) zapAt(f.x1 + rnd(-20, 20), rnd(20, PLANT_TOP), 1, 160, 2, P.rgb);
    if ((f.life -= dt) <= 0) slideOff();
    return;
  }
  if (f.phase === 'slam') {                         // up with them on it, and down
    const t = f.t;
    st.a = t < .16 ? lerp(1.57, 2.05, t / .16) : t < .26 ? lerp(2.05, -.12, (t - .16) / .1) : t < .44 ? lerp(-.12, 1.57, (t - .26) / .18) : 1.57;
    const tip = onTip();
    if (t >= .26 && !f.hit) {
      f.hit = 1; f.slams++;
      E.applyHit(o, f.face, { dmg: SLAM_D, kb: 0, stun: 1, stop: .1, heavy: 1, col: P.col, mute: 1 }); onTip();
      play('home-lb-m1', .8, () => sfx.hit(true), 1 - f.slams * .08); sfx.blast(); shake(26);
      V.crack(tip[0], 300); V.rocks(tip[0], 0, 8); zapAt(tip[0], 30, 6, 320, 4, P.rgb); E.addRing(tip[0], P.rgb, 380);
      if (Z) Z.shock(tip[0], 520, P.rgb, .35, 10);
      label(tip[0], 520, 'SLAM ' + f.slams + '/' + SLAMS, P.col, .7);
      if (f.slams >= SLAMS) { f.life = 2.5; label(p.x, p.y + 600, '1 · THROW THEM OFF', P.col, 1.6); }
      else f.life = Math.max(f.life, 1.6);
    }
    if (t >= .44) {
      f.phase = 'held'; f.t = 0; f.hit = 0;
      if (f.qSlam && f.slams < SLAMS) { f.qSlam = 0; slamStart(p); } else if (f.qThrow && f.slams >= SLAMS) { f.qThrow = 0; throwOff(p); }
    }
    return;
  }
  if (f.phase === 'held') {                         // up in his hands, with them on it
    st.a = 1.57; onTip();
    if (Math.random() < .4) zapAt(o.x, mid(o), 1, 140, 2, P.rgb);
    if ((f.life -= dt) <= 0) slideOff();
    return;
  }
  if (f.phase === 'throw') {                        // off the end of it, and up
    const t = f.t;
    st.a = t < .14 ? lerp(1.57, 2.3, t / .14) : lerp(2.3, .7, Math.min(1, (t - .14) / .1));
    if (t < .2) { onTip(); return; }
    if (!f.flung) { f.flung = 1; f.gx = clamp(o.x + f.face * 160, -bound() + 60, bound() - 60); f.gy = 320; f.fx = o.x; f.fy = o.y; chip(o, FLING_D, P.col); sfx.whoosh(); V.sparks(o.x, mid(o), 'purple', 10); }
    const u = Math.min(1, (t - .2) / .32);
    put(lerp(f.fx, f.gx, ease(u)), lerp(f.fy, f.gy, ease(u)), 'air');
    if (u >= 1) { f.phase = 'leap'; f.t = 0; f.px = p.x; }
    return;
  }
  if (f.phase === 'leap') {                         // up after them, and down through them with it
    const t = f.t;
    if (t < .3) {
      const u = ease(t / .3);
      p.x = lerp(f.px, f.gx - f.face * 30, u); p.y = lerp(0, f.gy - 60, u); p.vy = 0; p.ground = false; p.face = f.face;
      st.a = 2.4; put(f.gx, f.gy, 'air');
      if (Math.random() < .6) zapAt(p.x, p.y + 180, 1, 180, 2, P.rgb);
      return;
    }
    const u = Math.min(1, (t - .3) / .14);
    st.a = -1.45;
    p.y = lerp(f.gy - 60, 0, u * u); p.vy = 0; p.x = f.gx - f.face * 30;
    put(f.gx, Math.max(0, p.y - 40), 'air');
    if (u >= 1 && !f.stab) {                        // into the floor
      f.stab = 1; p.ground = true; p.y = 0;
      E.applyHit(o, f.face, { dmg: STAB, kb: 60, stun: 1.8, stop: .3, heavy: 1, col: P.col, mute: 1 });
      if (live(o) && !o.poise) Object.assign(o, { x: f.gx, y: 0, vy: 0, vx: 0, ground: true, state: 'down', stun: 1.8 });
      play('home-lb-crack', 1, () => sfx.thunder()); sfx.bf(); shake(46); E.zoomIn(.55);
      dent(f.gx, true, P); V.crack(f.gx, 460); E.addBlast(f.gx, 80, P.rgb, 560);
      if (Z) { Z.pillar(f.gx, 90, 1100, P.rgb, .6); Z.flash(WHITE, .5, .25); Z.flash(P.rgb, .3, .4); Z.shock(f.gx, 900, P.rgb, .5, 16); Z.decal('crater', f.gx, 300, P.rgb, 10, 0); }
      big(p, o, 'ズドォン', P.col, 'neg'); ono('雷獣', f.gx, 560, P.col, 1.2, 1.2); label(f.gx, 700, 'LIGHTNING OUTPUT: MAX', P.col, 1.4);
      f.phase = 'done'; f.t = 0;
    }
    return;
  }
  if (f.phase === 'done') { st.a = -1.45; if (f.t > .5) impEnd(); }
}
function slamStart(p) {                             // E: up with the staff and them on it, and down (the first E picks it up out of the floor)
  const f = imp;
  if (f.phase === 'wait') { st.planted = null; st.lock = true; st.a = 1.57; p.x = f.x1 - f.face * 40; p.face = f.face; sfx.whoosh(); }
  f.phase = 'slam'; f.t = 0; f.hit = 0;
}
function throwOff(p) { const f = imp; f.phase = 'throw'; f.t = 0; sfx.whoosh(); label(p.x, p.y + 520, 'THROWN OFF', PAL.purple.col, .8); }
function slideOff() {                               // too long on it: they come off it
  const o = imp.o;
  if (live(o)) Object.assign(o, { state: 'air', vy: 200, vx: imp.face * 200, ground: false, bounced: false });
  impEnd();
}
function impEnd() {
  const p = E.P1;
  imp = null; st.planted = null; st.lock = false;
  if (p.move && p.move.def === OUTPUT_MAX) { p.ground = p.y <= 1; E.endMove(p); }
}
/* ---------- Beast Mode: LIGHTNING OUTPUT: BEAST MODE. A long dash; if it meets them they go the length of the arena, and he is on them: the staff (16) and seventy strikes of orange lightning (84) ---------- */
const BO_HIT = 10, BO_STAFF = 16, BO_N = 70, BO_EACH = 1.2, BO_EVERY = .02, BO_DASH = 1.1;
const B_OUTPUT = { name: 'Lightning Output: BEAST MODE', cd: 20, dur: 6, glow: 'fire', staff: .1, run(p, m, t) {
  const o = E.P2, P = PAL.orange;
  p.rate = 50;
  if (!m.s) { m.s = 1; facing(p, o); sfx.whoosh(); sfx.zap(.8); if (Z) Z.dust(p.x, 10, -p.face); label(p.x, p.y + 520, 'LIGHTNING OUTPUT: BEAST MODE', P.col, 1.3); }
  if (m.hit === undefined) {                        // the dash: a long one
    const eb = bound();
    p.target = POSE.dash; p.vx = Math.abs(p.x + p.face * 60) < eb ? p.face * 2700 : 0;
    if (Z && Math.random() < .9) { Z.lightning(p.x - p.face * 30, p.y + rnd(60, 260), p.x - p.face * rnd(160, 320), p.y + rnd(40, 280), P.rgb, .12, 3, 1); }
    const gap = live(o) ? (o.x - p.x) * p.face : 999;
    if (gap > -40 && gap < 150 && Math.abs(o.y - p.y) < 260 && o.state !== 'down' && !(o.inv > 0)) {
      m.hit = t; p.vx = 0;
      E.applyHit(o, p.face, { dmg: BO_HIT, kb: 2600, lift: 760, stun: 2.2, stop: .2, heavy: 1, col: P.col, mute: 1 });      // the length of the arena
      play('home-lb-crack', .7, () => sfx.thunder()); sfx.hit(true); shake(30); big(p, o, 'ドンッ', P.col);
      return;
    }
    if (t > BO_DASH || p.vx === 0 && t > .2) { m.hit = -1; m.miss = t; }
    return;
  }
  if (m.hit < 0) { p.vx *= .8; p.target = POSE.idle; if (t > m.miss + .35) E.endMove(p); return; }
  const k = t - m.hit;
  p.vx = 0;
  if (k < .42) { p.target = POSE.idle; return; }
  if (!m.on) {                                      // after them, and the staff into them
    m.on = 1;
    if (!live(o)) { E.endMove(p); return; }
    const x0 = p.x, eb = bound(), side = o.x >= p.x ? 1 : -1;
    p.x = clamp(o.x - side * 120, -eb, eb); p.y = Math.max(0, o.y - 40); p.vy = 0; p.face = side;
    if (Z) Z.lightning(x0, 170, p.x, p.y + 170, P.rgb, .25, 7, 2);
    E.applyHit(o, p.face, { dmg: BO_STAFF, kb: 0, stun: 2.4, stop: .14, heavy: 1, col: P.col, mute: 1 }); play('home-lb-m1', .9, () => sfx.hit(true), .7);
    m.held = holdable(o) && !o.poise ? { x: o.x, y: o.y } : null; m.n = 0; m.sum = 0; m.shown = 0;
  }
  p.target = k < .5 ? POSE.hook : PALM;
  if (m.held) { Object.assign(o, { x: m.held.x, y: m.held.y, vx: 0, vy: 0, ground: m.held.y <= 0, state: 'hurt', stun: .6, act: null, tele: 0 }); p.y = Math.max(0, m.held.y - 40); p.vy = 0; }      // (the two of them, held there while it goes)
  const n = Math.min(BO_N, Math.floor((k - .5) / BO_EVERY) + 1);
  while (m.n < n) {                                 // seventy strikes of it
    m.n++;
    m.sum += chip(o, BO_EACH, P.col);
    if (m.n % 3 === 0 && live(o)) { const w = E.hand(p, true); if (Z) Z.lightning(w[0], w[1], o.x + rnd(-40, 40), mid(o) + rnd(-80, 80), P.rgb, .1, 4, 1); }
    if (m.n % 7 === 0) { sfx.zap(.8 + (m.n % 14) * .02); if (live(o)) V.sparks(o.x, mid(o), 'fire', 4); }
    if (m.n % 10 === 0 || m.n === BO_N) { if (live(o)) E.addNum(o.x, o.y + 300, +(m.sum - m.shown).toFixed(1), P.col); m.shown = m.sum; label(o.x, o.y + 420, '×' + m.n, P.col, .4); }
  }
  if (live(o) && Math.random() < .5) sky(o.x, mid(o), P.rgb, 4);
  if (m.n >= BO_N && !m.end) {
    m.end = k; m.held = null;
    if (live(o)) { Object.assign(o, { state: 'air', vy: 400, vx: p.face * 500, ground: false, bounced: false }); E.addBlast(o.x, mid(o), P.rgb, 420); zapAt(o.x, mid(o), 10, 380, 5, P.rgb); }
    play('home-lb-crack', .9, () => sfx.thunder()); sfx.blast(); shake(36); if (Z) Z.flash(P.rgb, .35, .25);
  }
  if (m.end !== undefined && k > m.end + .45) { p.ground = p.y <= 1; E.endMove(p); }
} };

/* ================= 3 — ELECTRIC REVERSAL ================= */
const STANCE_T = 1;
const STANCE = { name: 'Electric Reversal', cd: 18, dur: STANCE_T + .1, glow: 'blue', staff: .12, run(p, m, t) {
  const P = pal();
  p.vx = 0; p.rate = 30; p.target = GUARD;
  if (!m.s) { m.s = 1; sfx.zap(.8); label(p.x, p.y + 440, 'ELECTRIC REVERSAL', P.col, .9); }
  st.charge = 1;
  if (Math.random() < .5) zapAt(p.x + rnd(-60, 60), p.y + rnd(60, 280), 1, 130, 2, P.rgb);
  if (t > STANCE_T) { st.charge = 0; E.endMove(p); }
} };
const REVERSE = { name: 'Electric Reversal', dur: .95, glow: 'blue', staff: 2.3, run(p, m, t) {
  const o = m.o, P = m.P || (m.P = pal());
  p.rate = 50; p.vx = 0;
  if (!m.s) {                                       // behind them, before the blow has finished landing
    m.s = 1; st.charge = 0; p.inv = Math.max(p.inv || 0, 1);
    const x0 = p.x, y0 = p.y, side = p.x >= o.x ? 1 : -1, eb = bound();
    p.x = clamp(o.x - side * 115, -eb, eb); p.y = 0; p.vy = 0; p.face = o.x >= p.x ? 1 : -1;
    if (Z) { Z.lightning(x0, y0 + 170, p.x, 170, P.rgb, .22, 6, 2); zapAt(x0, y0 + 170, 4, 200, 3, P.rgb); }
    V.sparks(p.x, 170, P.spark, 10); sfx.zap(1.1); sfx.whoosh(); E.stop(.05);
  }
  if (t < .3) {                                     // the ribs
    p.target = t < .1 ? POSE.hookWind : POSE.hook;
    if (t >= .1 && !m.rib && live(o)) {
      m.rib = 1;
      E.applyHit(o, p.face, { dmg: 12, kb: 30, stun: 1.3, stop: .1, col: P.col, mute: 1 }); play('home-lb-m1', .7, () => sfx.hit(true), .9);
      V.sparks(o.x, mid(o), P.spark, 8); zapAt(o.x, mid(o), 3, 170, 3, P.rgb); big(p, o, 'ガッ', P.col);
    }
    return;
  }
  p.target = t < .4 ? POSE.crushWind : t < .7 ? POSE.crush : POSE.idle;
  if (t >= .4 && !m.slam) {                         // and into the floor, which goes up in lightning
    m.slam = 1;
    const x = live(o) ? o.x : p.x + p.face * 110;
    if (live(o)) {
      E.applyHit(o, p.face, { dmg: 28, kb: 70, stun: 1.4, stop: .22, heavy: 1, col: P.col, mute: 1 });
      if (holdable(o) && !o.poise) Object.assign(o, { y: 0, vy: 0, ground: true, state: 'down', stun: 1.4, vx: 0 });
    }
    play('home-lb-crack', .8, () => sfx.thunder()); sfx.blast(); shake(36); E.zoomIn(.3);
    V.crack(x, 360); V.rocks(x, 0, 14); E.addRing(x, P.rgb, 480); E.addBlast(x, 80, P.rgb, 440); zapAt(x, 30, 10, 420, 5, P.rgb);
    if (Z) { Z.boom(x, 70, 160, P.rgb, { n: 18, hot: WHITE }); Z.pillar(x, 70, 700, P.rgb, .4); Z.flash(WHITE, .4, .2); Z.shock(x, 700, P.rgb, .45, 14); Z.decal('scorch', x, 160, P.rgb, 8, 0); Z.dust(x, 10); }
    ono('バリバリ', x, 420, P.col, 1); label(x, 600, 'REVERSAL', P.col, 1.1);
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
const MOVES = {
  get strikes() { return beastOn() ? B_BARRAGE : full() ? MAX_BARRAGE : BARRAGE; },
  get crush() { return beastOn() ? B_OUTPUT : full() ? OUTPUT_MAX : DISCHARGE; },
  div: STANCE, manji: COMING };
let shownL = '';
function relabel() {                                // the hotbar's names, as the meter changes them
  if (!on()) { shownL = ''; return; }
  const a = MOVES.strikes, b = MOVES.crush, key = a.name + '|' + b.name;
  if (key === shownL) return;
  shownL = key;
  E.hud.mv.strikes.querySelector('b').textContent = a.name; E.CD.strikes = a.cd;
  E.hud.mv.crush.querySelector('b').textContent = b.name; E.CD.crush = b.cd;
}
const SKIN = Object.assign({}, JU.cast6.KASHIMO, {
  back() {                                          // on his back only where it is not in his hand (walking about the city)
    if (E.root.dataset.mode === 'fight' && on()) return;
    g.save(); g.translate(-13, -E.TOR + 8); g.rotate(-.55); g.lineWidth = 2.5; g.strokeStyle = LINE;
    g.fillStyle = RED; g.fillRect(-3, -100, 6, 160); g.strokeRect(-3, -100, 6, 160);
    g.fillStyle = GOLD; g.fillRect(-3.5, -102, 7, 6); g.fillRect(-3.5, 56, 7, 6); g.fillStyle = GRIP; g.fillRect(-3, -96, 6, 12); g.fillRect(-3, 44, 6, 12);
    g.restore();
  } });
JU.tech.add('beast', { name: 'Lightning Beast', jp: '雷獣', mark: '雷', who: 'Lightning', odds: 0, col: BOLT, glow: 'blue', moves: MOVES,
  early: true, skin: SKIN, as: ['Lightning Beast', '雷獣'], m1, guard, awaken, awkName: 'Beast', awkKeep: true, get awkHits() { return !beastOn(); },      // (Beast Mode does not fill its own bar)
  hint: '<b>E</b> Lightning meter · <b>1</b> Thunderclap Barrage · <b>2</b> Lightning Discharge · <b>3</b> Electric Reversal' });
const DEF = T.TECH.beast;

/* ---------- wiring ---------- */
const press0 = H.press, tick0 = H.tick, fx0 = H.fx, hit0 = H.hit, reset0 = H.reset, start0 = H.fightStart, under0 = H.under;
H.press = (a, inScene) => {
  if (!inScene && on() && E.root.dataset.mode === 'fight') {
    if (imp) {                                      // on the staff: 1 throws them off it after the fifth slam; nothing else does anything
      if (a === 'strikes' && imp.phase === 'held' && imp.slams >= SLAMS) throwOff(E.P1);
      else if (a === 'strikes' && imp.phase === 'slam') imp.qThrow = 1;      // (pressed during the fifth: as soon as it is down)
      if (['m1', 'strikes', 'crush', 'div', 'manji', 'jump', 'dash', 'alt', 'awk'].includes(a)) return true;
    }
    if (a === 'manji') return true;                 // (4 is still to come)
  }
  return press0 ? press0(a, inScene) : false;
};
H.hit = (o, face, h) => { hit0(o, face, h); if (on() && h.lb !== undefined) landed(o, face, h); };
H.tick = dt => {
  tick0(dt);
  if (!on()) { if (imp) impEnd(); held = null; st.charge = 0; paintMeter(); return; }
  const p = E.P1;
  if (held && !(p.move && (p.move.def === DISCHARGE || p.move.def === OUTPUT_MAX))) held = null;
  if (st.charge && !(p.move && (p.move.def === STANCE || p.move.def === CHARGE))) st.charge = 0;
  if (E.root.dataset.mode === 'fight') meterTick(dt);
  if (imp) impTick(dt);
  staffTick(p, dt);
  relabel(); paintMeter();
};
H.under = dt => {
  under0(dt);
  if (!on() || !beastOn()) return;
  const p = E.P1, c = F(p.x, p.y + 30);            // Beast Mode: orange, pooling at his feet and off him
  lit(() => E.glow(E.GLOW.fire, c[0], c[1], 380 * c[2], .32 + .1 * Math.sin(E.T * 14)));
};
H.fx = dt => {
  fx0(dt);
  const p = E.P1;
  if (!on() || p.dead || p.alpha < .05 || p.skin !== SKIN) return;
  if (st.planted) {                                 // stood in the floor, crackling, waiting for them
    drawPole([st.planted.x, -12], [0, 1], 1, 0, PLANT_TOP + 12);
    if (Math.random() < .7 && Z) Z.lightning(st.planted.x + rnd(-10, 10), rnd(0, PLANT_TOP), st.planted.x + rnd(-90, 90), rnd(0, PLANT_TOP + 60), PAL.purple.rgb, .08, 2, 0);
  } else drawStaff(p);
  const P = pal();
  if (st.charge || full() || beastOn()) { const c = F(p.x, p.y + 160); lit(() => E.glow(E.GLOW[P.glow], c[0], c[1], (beastOn() ? 360 : 300) * c[2], (full() || beastOn() ? .3 : .4) + .15 * Math.sin(E.T * 30))); }
  if (beastOn() && Math.random() < .3) zapAt(p.x + rnd(-50, 50), p.y + rnd(60, 300), 1, 140, 2, P.rgb);
};
const clear = () => {
  held = null; imp = null; Object.assign(st, { charge: 0, swing: null, a: 1.75, ext: 0, lock: false, planted: null });
  Object.assign(mt, { bars: 0, hold: 0, cd: 0, cdMax: 0, ult: 0, beast: 0 }); shownL = ''; shownM = '';
};
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) clear(); };

JU.beast = { MOVES, BARRAGE, MAX_BARRAGE, B_BARRAGE, DISCHARGE, OUTPUT_MAX, B_OUTPUT, STANCE, REVERSE, SKIN, st, mt, esp: ESP,      // (esp: E, especial.js)
  get state() { return { bars: mt.bars, cd: +mt.cd.toFixed(1), ult: mt.ult, beast: +mt.beast.toFixed(1), chain: chainLen(), imp: imp && { phase: imp.phase, slams: imp.slams, t: +imp.t.toFixed(2) }, planted: !!st.planted }; } };
})();
