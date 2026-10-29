/* JUJUTSU UNLIMITEDS — early access (Build 0.17): CURSED SPEAKER. The second year who says nothing but rice-ball fillings, because what
   he means, happens. His collar comes down, the seal at the corners of his mouth shows, and the word goes out in rings.
   Every command is a word he says in the anime (the clips are myinstants', played from there online; at home, copies: sounds/home-inu-*):
   (0.17v2: all of them a great deal stronger, the user's ask)
   1 DON'T MOVE    20, and they stop where they are, two and a half seconds (a heavy one, under one)         15 of his voice
   2 TWIST         it wrings them round, 75, and throws them                                                  25
   3 GET DOWN      into the floor, 60, and they stay down three seconds                                       25
   4 STOP          for a second he waits for it: whatever they swing at him stops short, they freeze, 85       20
   E COUGH SYRUP   half his voice back
   HIS STRIKES (0.17v2): three, not four, and no uppercut. Two punches, and the third is a word: with jump held (or in the air) he says FALL
   and they are slammed into the floor, 25 (he does not jump: it is the word that does it; the clip is his "down", the nearest there is);
   otherwise it is his TWIST, a quick 15. Each costs a little voice
   His VOICE is the bar under his health. It comes back by itself when he has been quiet a moment. Asking more of it than is left still
   works, but it tears his throat: he coughs blood, and it costs him health instead. Outside a fight he only talks in rice-ball
   fillings (salmon, tuna mayo, bonito flakes, kelp), and whoever he is talking to has to work out what he meant */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, Z = JU.bossfx, Fi = JU.fights, C = JU.cast, M = E.MOVES;
const { rnd, clamp } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk;
const COL = '#c9c2ff', CRGB = '201,194,255', SEAL = '#4a3470';
const VOICE = 100, REGEN = 9, REST = 1.2, HOLD = 2.5, HOLD_HEAVY = .9, PIN = 3, STOP_T = 1, STOP_HOLD = 3;      // his voice; what comes back a second, after how long quiet; how long Don't Move holds; Get Down; how long Stop waits
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const exact = (o, n) => n / (o.dr || 1);
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const gore = () => JU.gore !== false;
const play = (name, vol, alt) => { if (!sfx.file(name, vol) && alt) alt(); };
sfx.preload(['home-inu-dontmove', 'home-inu-twist', 'home-inu-down', 'home-inu-stop', 'home-inu-salmon', 'home-inu-tunamayo', 'home-inu-okaka', 'home-inu-konbu']);

/* ================= how he looks: pale hair, and the collar zipped up over his mouth (down while he speaks, and the seal under it) ================= */
let talking = 0;                                    // seconds his collar stays down
const poly = (pts, col) => { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke(); };
const seal = (x, y) => {                            // the snake's eye and fangs: a ring, a dot, and a line out from it
  g.strokeStyle = SEAL; g.lineWidth = 1.4; g.beginPath(); g.arc(x, y, 3.2, 0, TAU); g.stroke();
  g.fillStyle = SEAL; g.beginPath(); g.arc(x, y, 1.1, 0, TAU); g.fill();
};
const SPEAKER = Object.assign({}, C.MEGUMI, { head() {
  E.headBase('#ecd2bc', '#f6e2d0');
  poly([-26, 4, -30, -16, -26, -30, -12, -40, 4, -42, 18, -36, 27, -24, 26, -6, 18, -14, 10, -8, 2, -15, -6, -8, -14, -13, -19, 4], '#ece8f2');
  g.fillStyle = '#5a3f7a'; g.beginPath(); g.ellipse(5, 1, 2.6, 2.2, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(17, 1, 2.2, 2.2, 0, 0, TAU); g.fill();
  g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.moveTo(1, -2); g.lineTo(9, -2); g.moveTo(14, -2); g.lineTo(21, -2); g.stroke();
  if (talking > 0) {                                // the collar pulled down: his mouth, open, and the seal at each corner of it
    g.fillStyle = '#3a1418'; g.beginPath(); g.ellipse(11, 14, 6, 3.6 + 1.6 * Math.abs(Math.sin(E.T * 30)), 0, 0, TAU); g.fill(); g.lineWidth = 1.6; g.strokeStyle = LINE; g.stroke();
    seal(1, 14); seal(21, 14);
    g.beginPath(); g.roundRect(-22, 20, 48, 13, [4, 4, 8, 8]); g.fillStyle = '#1c1f2e'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
  } else {
    g.beginPath(); g.roundRect(-22, 7, 48, 22, [6, 6, 8, 8]); g.fillStyle = '#1c1f2e'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
    g.strokeStyle = '#8a8f9a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(12, 9); g.lineTo(12, 28); g.stroke();
  }
} });

/* ================= his voice ================= */
let voice = VOICE, quiet = 9;                       // what is left of it; seconds since he last used it
const bar = document.createElement('div');
bar.className = 'throat'; bar.innerHTML = '<i></i><b>Voice</b>'; bar.setAttribute('aria-hidden', 'true');
E.root.querySelector('.fb.p1').appendChild(bar);
let shownV = -1;
function paint() {
  const v = Math.round(voice);
  if (v === shownV) return;
  shownV = v; bar.style.setProperty('--v', v / VOICE); bar.classList.toggle('low', v < 25);
}
function spend(p, n) {                              // a command's cost. More than is left: it comes out anyway, and he pays the rest in blood
  const short = Math.max(0, n - voice);
  voice = Math.max(0, voice - n); quiet = 0; paint();
  if (short > 0) cough(p, short);
}
function cough(p, short) {
  const dmg = Math.min(Math.round(short * .6), Math.max(0, p.hp - 1));
  if (dmg > 0) Fi.chip(dmg, '#ff5a6e');
  E.fx.push({ k: 2, x: p.x, y: p.y + 420, n: 'COUGH', col: '#ff5a6e', t: 0, life: 1 });
  for (let i = 0; i < 3; i++) E.after(.12 + i * .15, () => { sfx.land(); if (gore()) sfx.splat(); });
  const m = mouthAt(p);
  if (gore() && Z) for (let i = 0; i < 14; i++) Z.emit(4, m[0], m[1], p.face * rnd(80, 420), rnd(-40, 260), rnd(3, 6), 1.6, i % 3 ? '150,8,20' : '200,20,32', { g: 1900, land: 'blood' });
}
const mouthAt = p => { const hs = p.scale || 1; return [p.x + p.face * 22 * hs, p.y + 300 * hs]; };

/* ================= the word going out ================= */
Object.assign(POSE, {
  inuSay: [-.12, -.18, .5, .4, .3, -.3, 0],           // head up, chest out: he says it
  inuPoint: [.08, -.08, 1.55, .35, .35, -.35, 0],     // and points it at them
  inuGuard: [-.05, -.1, 1.1, 1.3, .4, -.4, 0],        // waiting, a hand up
  inuDrink: [0, -.32, 2.65, .4, .3, -.3, 0]           // the bottle to his mouth
});
// rings of it, from his mouth to them
function rings(p, o, col = COL) {
  const a = mouthAt(p), b = o ? [o.x, o.y + 160 * (o.scale || 1)] : [p.x + p.face * 700, a[1]];
  for (let i = 0; i < 5; i++) E.after(i * .045, () => { const u = (i + 1) / 5; V.ring(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 60 + i * 26, col, .28); });
  if (Z) Z.shock(a[0], 220, CRGB, .3, 5);
}
// the command: the collar down, the word, its voice, and what it costs
function command(p, clip, jp, word, cost) {
  talking = 1.1; spend(p, cost);
  play(clip, 1, () => { sfx.charge(); sfx.rika(0); });
  shout(p, jp, COL);
  E.fx.push({ k: 2, x: p.x, y: p.y + 470, n: word, col: '#ffffff', t: 0, life: 1.1 });
}
// who hears it: whoever he is fighting, near enough, and not out of reach of it
const hears = (p, range = 1250) => { const o = E.P2; return o && !o.ko && !(o.alpha < 1) && !(o.inv > 0) && Math.abs(o.x - p.x) < range ? o : null; };

// held where they stand (Don't Move, Stop) or held down (Get Down): kept that way every moment until it runs out
let held = null, pinned = null;                     // { o, t }
function hold(o, t) {
  if (duel()) return;
  held = { o, t: o.poise ? Math.min(t, HOLD_HEAVY) : t };
  if (o.ai) o.ai.t = Math.max(o.ai.t || 0, held.t);
}
function holdTick(dt) {
  if (held) {
    const o = held.o;
    if ((held.t -= dt) <= 0 || o.ko || o !== E.P2) held = null;
    else {
      if (o.ground && o.state !== 'down' && o.state !== 'up') Object.assign(o, { state: 'hurt', stun: Math.max(o.stun || 0, held.t), vx: 0, act: null, tele: 0 });
      if (o.ai) o.ai.t = Math.max(o.ai.t || 0, held.t);
    }
  }
  if (pinned) {
    const o = pinned.o;
    if (o.ground) pinned.t -= dt;
    if (pinned.t <= 0 || o.ko || o !== E.P2) pinned = null;
    else if (o.ground && (o.state === 'down' || o.state === 'up' || o.state === 'idle' || o.state === 'act' || o.state === 'hurt')) Object.assign(o, { state: 'down', stun: Math.max(o.stun || 0, pinned.t), act: null, tele: 0 });
  }
}

/* ================= 1 — Don't Move ================= */
const DONT = { name: 'Don\'t Move', cd: 9, dur: .75, run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < .55 ? POSE.inuSay : POSE.idle;
  if (!m.s) { m.s = 1; command(p, 'home-inu-dontmove', '動くな', 'DON\'T MOVE', 15); }
  if (t < .16 || m.done) return;
  m.done = 1;
  const o = hears(p);
  rings(p, o);
  if (!o) return;
  E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: exact(o, 20), kb: 0, stun: HOLD, stop: .1, heavy: 1, col: COL, fixed: 1, mute: 1 });
  hold(o, HOLD);
  V.ring(o.x, o.y + 160, 220, COL, .4);
} };

/* ================= 2 — Twist ================= */
const TWIST = { name: 'Twist', cd: 10, dur: .8, run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < .6 ? POSE.inuPoint : POSE.idle;
  if (!m.s) { m.s = 1; command(p, 'home-inu-twist', '捻れろ', 'TWIST', 25); }
  if (t < .22 || m.done) return;
  m.done = 1;
  const o = hears(p);
  rings(p, o);
  if (!o) return;
  const x = o.x, y = o.y + 160 * (o.scale || 1);
  held = held && held.o === o ? null : held;        // (it wrings them out of a Don't Move)
  E.applyHit(o, p.face, { dmg: exact(o, 75), kb: 360, lift: 420, stun: .9, stop: .2, heavy: 1, col: COL, fixed: 1, mute: 1 });
  sfx.snap(); sfx.hit(true); shake(18);
  if (!duel() && !o.poise && JU.vengeful && JU.vengeful.launch) JU.vengeful.launch(o);      // and round they go
  V.custom(.45, u => {                              // the wringing: lines spiralling in on them
    const c = F(x, y), k = c[2];
    g.save(); g.translate(c[0], c[1]); g.globalAlpha = 1 - u; g.strokeStyle = COL; g.lineWidth = 3 * k; g.lineCap = 'round';
    for (let i = 0; i < 4; i++) { g.beginPath(); for (let j = 0; j <= 24; j++) { const a = i * TAU / 4 + j * .26 + u * 9, r = (150 - j * 5.5) * k * (1 - u * .3); j ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r * .8) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r * .8); } g.stroke(); }
    g.restore();
  });
  V.sparks(x, y, 'purple', 10);
} };

/* ================= 3 — Get Down ================= */
const DOWN = { name: 'Get Down', cd: 11, dur: .8, run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < .6 ? POSE.inuSay : POSE.idle;
  if (!m.s) { m.s = 1; command(p, 'home-inu-down', '伏せろ', 'GET DOWN', 25); }
  if (t < .2 || m.done) return;
  m.done = 1;
  const o = hears(p);
  rings(p, o);
  if (!o) return;
  held = held && held.o === o ? null : held;
  E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: exact(o, 60), kb: 40, stun: 1, stop: .18, heavy: 1, col: COL, fixed: 1, mute: 1 });
  if (!duel() && !o.poise && !o.ko) { Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 26), vy: -1900, vx: 0, bounced: true }); pinned = { o, t: PIN }; }
  sfx.slam(1.2); shake(24); V.crack(o.x, 300); V.ring(o.x, 30, 320, COL, .4); E.addDust(o.x);
  if (Z) Z.shock(o.x, 420, CRGB, .45, 9);
} };

/* ================= 4 — Stop ================= */
let stopT = 0;                                      // the second he is waiting through
const STOP = { name: 'Stop', cd: 14, dur: STOP_T + .25, run(p, m, t) {
  p.vx = 0; p.rate = 26;
  if (!m.s) { m.s = 1; stopT = STOP_T; sfx.charge(); E.fx.push({ k: 2, x: p.x, y: p.y + 420, n: '...', col: COL, t: 0, life: .8 }); }
  p.target = m.fired ? (t < m.fired + .45 ? POSE.inuPoint : POSE.idle) : t < STOP_T ? POSE.inuGuard : POSE.idle;
  if (m.fired && t > m.fired + .55) E.endMove(p);
} };
function stopped(face) {                            // they swung at him while he was waiting: STOP
  const p = E.P1, o = E.P2, m = p.move;
  stopT = 0;
  if (m && m.def === STOP) m.fired = m.t;
  command(p, 'home-inu-stop', '止まれ', 'STOP', 20);
  rings(p, o, '#ffffff');
  if (!o || o.ko) return;
  E.applyHit(o, -face, { dmg: exact(o, 85), kb: 200, stun: STOP_HOLD, stop: .3, heavy: 1, col: COL, fixed: 1, mute: 1 });
  hold(o, STOP_HOLD);
  sfx.blast(); shake(26); E.zoomIn(.35); V.ring(o.x, o.y + 160, 320, '#ffffff', .35); V.sparks(o.x, o.y + 160, 'purple', 14);
  if (Z) Z.flash(CRGB, .25, .2);
}

/* ================= his strikes (0.17v2): two punches, and the third is a word ================= */
const PUNCH = [0, 1].map(i => Object.assign({}, M.m1[i], { n: 3 }));      // (n: a chain of three)
const jumping = p => !p.ground || E.keys.has('w') || E.keys.has(' ') || E.keys.has('arrowup');
// FALL: with jump held. They are put into the floor; he stays where he is
const FALL = { m1: 1, n: 3, dur: .55, run(p, m, t) {
  p.vx = 0; p.rate = 34; p.target = t < .4 ? POSE.inuPoint : POSE.idle;
  if (!m.s) { m.s = 1; command(p, 'home-inu-down', '落ちろ', 'FALL', 6); }
  if (t < .12 || m.done) return;
  m.done = 1;
  const o = hears(p, 560);
  rings(p, o);
  if (!o) return;
  held = held && held.o === o ? null : held;
  E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: exact(o, 25), kb: 40, stun: .9, stop: .12, heavy: 1, col: COL, fixed: 1, mute: 1 });
  if (!duel() && !o.poise && !o.ko) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 26), vy: -1900, vx: 0, bounced: true });
  sfx.slam(1); shake(18); V.crack(o.x, 220); V.ring(o.x, 30, 240, COL, .35); E.addDust(o.x);
} };
// and without it: his TWIST, quick, 15
const QUICK = { m1: 1, n: 3, dur: .45, run(p, m, t) {
  p.vx = 0; p.rate = 34; p.target = t < .32 ? POSE.inuPoint : POSE.idle;
  if (!m.s) { m.s = 1; command(p, 'home-inu-twist', '捻れろ', 'TWIST', 6); }
  if (t < .1 || m.done) return;
  m.done = 1;
  const o = hears(p, 560);
  rings(p, o);
  if (!o) return;
  E.applyHit(o, p.face, { dmg: exact(o, 15), kb: 220, stun: .55, stop: .08, col: COL, fixed: 1, mute: 1 });
  sfx.snap(); V.sparks(o.x, o.y + 160 * (o.scale || 1), 'purple', 6);
} };
function m1(i) {
  const p = E.P1;
  if (p.skin !== SPEAKER) return true;              // in somebody else's body: the ordinary strikes
  p.move = { def: i < 2 ? PUNCH[i] : jumping(p) ? FALL : QUICK, i: Math.min(i, 2), t: 0 };
  return false;
}

/* ================= E — Cough Syrup ================= */
const SYRUP = { name: 'Cough Syrup', jp: '薬', col: COL, cd: 18, dur: .9, quiet: true, run(p, m, t) {
  p.vx = 0; p.rate = 22; p.target = t < .7 ? POSE.inuDrink : POSE.idle;
  if (t < .45 || m.done) return;
  m.done = 1;
  voice = Math.min(VOICE, voice + VOICE / 2); quiet = REST; paint();
  sfx.confirm(); E.fx.push({ k: 2, x: p.x, y: p.y + 420, n: '+ VOICE', col: COL, t: 0, life: 1 });
  V.ring(p.x, p.y + 300, 120, COL, .3);
} };

const MOVES = { strikes: DONT, crush: TWIST, div: DOWN, manji: STOP };
JU.tech.add('speaker', { name: 'Cursed Speaker', jp: '呪言', mark: '言', who: 'Cursed speech, and a throat that pays for it', odds: 0, col: COL, glow: 'purple', moves: MOVES,
  early: true, skin: SPEAKER, as: ['Cursed Speaker', '呪言'], m1,
  hint: '<b>1</b> Don\'t Move · <b>2</b> Twist · <b>3</b> Get Down · <b>4</b> Stop · 3 strikes: the third is a word (jump held: FALL) · every word costs voice' });
const DEF = JU.tech.TECH.speaker, on = () => JU.tech.active === DEF;
if (JU.story && JU.story.WHO && !JU.story.WHO.inumaki) JU.story.WHO.inumaki = ['Cursed Speaker', '呪言', COL];

/* ================= outside a fight: rice-ball fillings, and nothing else ================= */
const WORDS = [['Salmon.', 'home-inu-salmon'], ['Tuna mayo.', 'home-inu-tunamayo'], ['Bonito flakes.', 'home-inu-okaka'], ['Kelp.', 'home-inu-konbu'], ['Salmon, salmon.', 'home-inu-salmon'], ['Tuna mayo!', 'home-inu-tunamayo']];
const NARRATION = new Set(['sign', 'jjh', 'phone', 'inumaki']);
const REPLY = ['...I am going to take that as a yes.', 'Right. Sure. Me too.', '...Okay?', 'Was that a yes? It sounded like a yes.', 'I never know what you are saying.', 'Sure, I guess.'];
const PANDA = ['He says thanks.', 'He says that is a yes.', 'He says he will think about it.', 'He says do not be weird about it.'];
const pick = a => a[Math.floor(Math.random() * a.length)];
const say = ([text, clip]) => ['inumaki', text, () => play(clip, .95)];
const talk0 = JU.street.talk;
JU.street.talk = (list, then) => {
  if (JU.tech.equipped !== 'speaker' || !Array.isArray(list)) return talk0(list, then);
  const them = list.slice().reverse().find(l => !NARRATION.has(l[0]) && JU.story.WHO[l[0]]);
  if (!them) return talk0(list, then);              // (a sign, a message: nobody to answer)
  talk0(list.concat([say(pick(WORDS)), them[0] === 'panda' ? ['panda', pick(PANDA)] : [them[0], pick(REPLY)]]), then);
};

/* ---------- wiring ---------- */
const guard0 = H.guard, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
H.guard = (face, a, mul) => {
  if (guard0 && guard0(face, a, mul)) return true;
  if (!on() || !(stopT > 0) || E.P1.dead) return false;
  stopped(face);                                    // it stops short of him
  return true;
};
H.tick = dt => {
  tick0(dt);
  if (talking > 0) talking -= dt;
  if (!on()) { bar.classList.remove('on'); held = pinned = null; return; }
  bar.classList.add('on');
  if (stopT > 0) stopT -= dt;
  if ((quiet += dt) > REST && voice < VOICE) { voice = Math.min(VOICE, voice + REGEN * dt); }
  paint();
  holdTick(dt);
};
H.fx = dt => {
  fx0(dt);
  if (!on()) return;
  const p = E.P1;
  for (const h of [held, pinned]) {                 // the word still on them: two rings of it, turning
    if (!h || h.o.ko) continue;
    const o = h.o, c = F(o.x, o.y + (h === pinned ? 40 : 160) * (o.scale || 1)), k = c[2];
    g.save(); g.strokeStyle = `rgba(${CRGB},${.5 + .3 * Math.sin(E.T * 9)})`; g.lineWidth = 2.5 * k; g.setLineDash([10 * k, 9 * k]);
    for (let i = 0; i < 2; i++) { g.beginPath(); g.ellipse(c[0], c[1], (110 + i * 26) * k, (h === pinned ? 26 : 150) * k, 0, E.T * (i ? -2 : 2), E.T * (i ? -2 : 2) + TAU); g.stroke(); }
    g.restore();
  }
  if (stopT > 0 && !p.dead) {                       // waiting: a ring round him, closing as the second runs out
    const c = F(p.x, p.y + 160), k = c[2];
    g.save(); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3 * k; g.beginPath(); g.arc(c[0], c[1], 150 * k, -Math.PI / 2, -Math.PI / 2 + TAU * stopT / STOP_T); g.stroke(); g.restore();
  }
};
const clear = () => { voice = VOICE; quiet = 9; stopT = 0; talking = 0; held = pinned = null; paint(); };
H.reset = () => { reset0(); clear(); bar.classList.remove('on'); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) clear(); };

JU.speaker = { SKIN: SPEAKER, MOVES, esp: SYRUP, WORDS,      // (esp: E, especial.js; SKIN: jjh.js dresses the one at Jujutsu High in it)
  get voice() { return Math.round(voice); }, set voice(v) { voice = clamp(+v || 0, 0, VOICE); paint(); }, get state() { return { voice: Math.round(voice), held: held && +held.t.toFixed(2), pinned: pinned && +pinned.t.toFixed(2), stop: +stopT.toFixed(2) }; } };
})();
