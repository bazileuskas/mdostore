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
   fillings (salmon, tuna mayo, bonito flakes, kelp), and whoever he is talking to has to work out what he meant
   LAST WORD (Build 0.18, the user's design): his awakening, G with the bar full. A thought, "SIGH"; the user's song from eight seconds in,
   fading up; and one word: DIE. They die. Below, over it, what it costs him, and UNSEALED, the five words he has if he lives through it */
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
let hot = 0;                                        // (0.18) how lit the seal is: his last word, and everything after it
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
    if (hot > 0) {                                  // (0.18) lit: the snake's fangs running back from the corners of his mouth, glowing
      g.save(); g.shadowColor = '#b48cff'; g.shadowBlur = 10 * hot; g.strokeStyle = `rgba(214,190,255,${.5 + .5 * hot})`; g.lineWidth = 1.7; g.lineCap = 'round';
      for (const [x, d] of [[1, -1], [21, 1]]) { g.beginPath(); g.moveTo(x, 14); g.lineTo(x + d * 6, 16); g.lineTo(x + d * 8, 22); g.moveTo(x + d * 6, 16); g.lineTo(x + d * 10, 13); g.stroke(); }
      g.fillStyle = `rgba(214,190,255,${hot})`; g.beginPath(); g.arc(1, 14, 1.4, 0, TAU); g.arc(21, 14, 1.4, 0, TAU); g.fill();
      g.restore();
    }
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
  inuDrink: [0, -.32, 2.65, .4, .3, -.3, 0],          // the bottle to his mouth
  inuSigh: [.12, .4, .2, .12, .3, -.3, 0],            // (0.18) the sigh: shoulders down, head down, arms hanging
  inuBreath: [-.16, -.34, .55, .45, .36, -.36, 0],    // the breath in before it
  inuDie: [-.24, -.3, 1.15, .95, .48, -.48, 0],       // and the word: leaning back into it, arms out
  inuCough: [.42, .38, 2.35, .3, .42, -.36, 0]        // bent over it, a hand to his mouth
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

/* ================= G — LAST WORD (Build 0.18, the user's design): his awakening ================= */
// "SIGH", thought, not said (manga.js). The user's song from eight seconds in, fading up (sounds/home-aizo.mp3, the copy at home only: online
// there is no song). And one word: DIE, and they die. What it costs him is how much fight they had left in them, counted the way his blows
// count it (health, through whatever they are made of): more than STRONG and it takes him with them, and that fight is lost (they went
// together); more than MID, a great deal of his health; less, almost none. Nobody has posted a clip of him saying it (he never does, in the
// anime: it is Yuta, in 0, with his technique), so the word is lettered across the screen and the sound is built (sfx.word). Living through
// it, he is UNSEALED for the rest of that fight: the five below, the fifth on 5, and the song playing on
const HOME = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const SONG = 'home-aizo', SONG_FROM = 0, SONG_FADE = 3, SONG_VOL = .7;      // (the copy at home is the user's file cut to start eight seconds in: the dev server cannot be asked for the middle of a file, so a jump into it is not to be trusted)
const STRONG = 450, MID = 150, COST_MID = .6, COST_WEAK = .05, COST_DUEL = .25;      // how much fight left: it kills him, it costs a lot; what it costs (of his health)
const LW = { song: 1.3, breath: 2.3, word: 3.5, cost: 4.4, end: 5.6 };              // when each part of it comes (the sigh is at the start)
if (HOME) sfx.preload([SONG]);
sfx.preload(['home-inu-explode']);
const toughness = o => o.hp / (o.dr || 1);
const tierOf = o => duel() ? 'duel' : toughness(o) > STRONG ? 'strong' : toughness(o) > MID ? 'mid' : 'weak';
const crowd = () => !!(H.foes && H.foes());          // a raid: other games' curses in it as well, and nobody's fight to pause
const mortal = () => !duel() && !!Fi.fight.cfg && !(Fi.fight.floor > 0);      // whether this fight lets him die of it at all
const TIER = { weak: ['SAFE', '#9be7a0'], mid: ['IT WILL COST HIM', '#ffb86b'], strong: ['FATAL: BOTH OF THEM', '#ff4a5e'], duel: ['IT WILL COST HIM', '#ffb86b'] };
const awkEl = document.getElementById('awk'), hintEl = document.getElementById('techHint');
const HINT = '<b>1</b> Don\'t Move · <b>2</b> Twist · <b>3</b> Get Down · <b>4</b> Stop · 3 strikes: the third is a word (jump held: FALL) · every word costs voice · <b>G</b> Last Word';
const HINT_OPEN = 'UNSEALED · <b>1</b> Explode · <b>2</b> Twist Off · <b>3</b> Get Down: Crater · <b>4</b> Stillness · <b>5</b> Stop: Turn Back';
let lw = null, unsealed = false, song = null, watch = 0, auraT = 0, overT = 0;      // LAST WORD going on: { t, o, tier, word (the lettering's clock), dying, ... }

function startSong() { if (song) song.stop(.4); song = sfx.song(SONG, SONG_FROM, SONG_FADE, SONG_VOL); }
function stopSong(secs = 1.5) { if (song) { song.stop(secs); song = null; } }
const unpause = L => { if (L && L.paused) { L.paused = false; Fi.fight.paused = false; } };
// a blow that is all of them, whatever they have left: the number shown is what they had, not what it was worth
function lethal(o, face, h) {
  const had = o.hp, hs = o.scale || 1, n0 = E.fx.length;
  E.applyHit(o, face, Object.assign({ dmg: exact(o, duel() ? 9999 : o.hp + 99999), fixed: 1, mute: 1 }, h));
  for (let i = E.fx.length - 1; i >= n0; i--) if (typeof E.fx[i].n === 'number') E.fx.splice(i, 1);
  if (!duel()) E.addNum(o.x, o.y + 270 * hs, Math.round(had), '#ffd27a');
}
// blood up out of him: k, how much (0, a little)
function coughUp(p, k) {
  for (let i = 0; i <= k; i++) E.after(i * .14, () => { sfx.land(); if (gore()) sfx.splat(); });
  const m = mouthAt(p);
  if (gore() && Z) for (let i = 0; i < 6 + k * 10; i++) Z.emit(4, m[0], m[1], p.face * rnd(80, 420 + k * 90), rnd(-40, 260), rnd(3, 6 + k), 1.6, i % 3 ? '150,8,20' : '200,20,32', { g: 1900, land: 'blood' });
}
// what a word took out of him: a share of his health, never the last of it
function recoil(p, frac) {
  const n = Math.min(Math.max(0, p.hp - 1), Math.max(1, Math.round(p.max * frac)));
  if (n > 0) { p.hp -= n; p.flash = .1; E.addNum(p.x, p.y + 270, n, '#ff5a6e'); }
  coughUp(p, frac >= COST_MID ? 3 : frac > .1 ? 2 : 0);
}
// the word in them: blood from the eyes and the mouth
function bleed(o) {
  const hs = o.scale || 1, f = o.face || 1, hx = o.x + f * 14 * hs, hy = o.y + 300 * hs;
  o.flash = .2; V.sparks(o.x, o.y + 220 * hs, 'red', 10);
  if (!gore()) return;
  sfx.splat(); E.after(.12, () => sfx.splat());
  if (Z) for (let i = 0; i < 28; i++) Z.emit(4, hx + rnd(-8, 8) * hs, hy + rnd(-16, 6) * hs, f * rnd(20, 170), rnd(-60, 140), rnd(3, 6), 1.4, i % 3 ? '150,8,20' : '200,20,32', { g: 1900, land: 'blood' });
}

function awaken(p) {
  if (lw || p.skin !== SPEAKER) return;
  if (unsealed) { E.fx.push({ k: 2, x: p.x, y: p.y + 420, n: 'UNSEALED ALREADY', col: COL, t: 0, life: 1 }); return; }
  const o = E.P2;
  if (!o || o.ko || o.alpha < 1) return;            // nobody there to say it to: the bar is kept
  JU.tech.drain();
  lw = { t: 0, o, tier: tierOf(o), paused: false, done: {} };
  if (!duel() && !crowd() && !Fi.fight.paused) { Fi.fight.paused = true; lw.paused = true; }      // (the fight waits for it: not a duel's, not a raid's)
  p.inv = Math.max(p.inv || 0, LW.end + .3);
  if (o.ai) o.ai.t = Math.max(o.ai.t || 0, LW.end + .5);
  p.move = { def: LASTWORD, t: 0 };
  E.zoomIn(LW.end);
  JU.manga.think(p, 'SIGH', { life: 1.6 });
  watchOn();
}
const LASTWORD = { dur: LW.end, noCancel: true, run(p, m, t) {
  const L = lw;
  if (!L) { E.endMove(p); return; }
  const d = L.done;
  const dt = t - L.t;
  L.t = t; p.vx = 0;
  p.target = t < LW.breath ? POSE.inuSigh : t < LW.word ? POSE.inuBreath : t < LW.cost ? POSE.inuDie : t < LW.end - .35 && L.tier !== 'weak' ? POSE.inuCough : POSE.idle;
  p.rate = t < LW.breath ? 5 : t < LW.word ? 9 : 26;
  hot = Math.max(hot, clamp((t - .6) / 2.6, 0, 1));
  if (t > .5) talking = Math.max(talking, .3);       // the collar down, half a second in, and it stays down
  if (!d.zip && t > .5) { d.zip = 1; sfx.swish(.6); }
  if (!d.song && t > LW.song) { d.song = 1; startSong(); if (Z) Z.dim(.72, LW.end - LW.song); }
  if (!d.rise && t > LW.breath) { d.rise = 1; sfx.rise(1.2); }
  if (t > LW.breath && t < LW.word && (L.puff = (L.puff || 0) - dt) <= 0) { L.puff = .22; const w = mouthAt(p); V.ring(w[0], w[1], 70, COL, .3); }
  if (!d.boom && t > LW.word - .5) { d.boom = 1; sfx.word(); }      // (its boom comes half a second in: on the word)
  if (!d.word && t > LW.word) { d.word = 1; sayIt(p, L); }
  if (!d.cost && t > LW.cost) { d.cost = 1; pay(p, L); }
} };
function sayIt(p, L) {
  const o = L.o;
  L.word = 0;                                         // (the lettering's clock: H.post)
  voice = 0; quiet = 0; paint();                      // every bit of his voice, at once
  shout(p, '死ね', '#ff2440');
  rings(p, o, '#ff3355'); E.after(.1, () => rings(p, o, '#ffffff'));
  shake(44); E.stop(.12);
  if (Z) Z.shock(o.x, 980, '255,36,64', .8, 18);      // (no flash: the frames of it are white enough)
  if (o.ko) return;
  if (L.tier === 'duel') { E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: exact(o, 9999), kb: 300, lift: 700, stun: 1, stop: .3, heavy: 1, col: '#ff2440', fixed: 1, mute: 1 }); return; }
  L.dying = 0;                                        // it is in them: stock still, then blood, then down (H.tick), and gone at the end
  Object.assign(o, { state: 'hurt', stun: 9, vx: 0, act: null, tele: 0 });
}
function dying(dt) {
  const L = lw;
  if (!L || L.dying === undefined) return;
  const o = L.o;
  L.dying += dt;
  if (o.ko || o !== E.P2) return;
  if (!L.fell) Object.assign(o, { state: 'hurt', stun: 9, vx: 0, act: null, tele: 0 });
  if (!L.bled && L.dying > .3) { L.bled = 1; bleed(o); }
  if (!L.fell && L.dying > .75) { L.fell = 1; Object.assign(o, { state: 'air', ground: false, y: Math.max(o.y, 1), vy: 140, vx: -(o.face || 1) * 50, bounced: true }); }
  if (L.fell && o.state === 'down') o.stun = 9;       // and down it stays
}
function pay(p, L) {
  if (L.tier === 'strong' && mortal()) {              // they had more in them than he did: it takes him with them
    const o = L.o;
    if (!o.ko) { o.ko = true; o.hp = 0; }             // (and it is no win: they went together)
    E.fx.push({ k: 2, x: p.x, y: p.y + 440, n: 'BACKLASH', col: '#ff2440', t: 0, life: 1.8 });
    coughUp(p, 3); unpause(L); L.dead = true; stopSong(3);
    Fi.chip(p.hp + 1, '#ff2440');                     // (lose(): DEFEATED, and the fight again)
    return;
  }
  const frac = L.tier === 'weak' ? COST_WEAK : L.tier === 'duel' ? COST_DUEL : COST_MID;
  recoil(p, frac);
  E.fx.push({ k: 2, x: p.x, y: p.y + 440, n: L.tier === 'weak' ? 'IT COST HIM NOTHING' : 'BACKLASH', col: L.tier === 'weak' ? COL : '#ff5a6e', t: 0, life: 1.5 });
}
// LAST WORD over (or cut short): they are gone, and if he is still standing, he is unsealed
function finish() {
  const L = lw, p = E.P1;
  if (!L) return;
  lw = null; unpause(L);
  if (L.dead || p.dead) { hot = 0; return; }
  const o = L.o;
  if (L.dying !== undefined && !o.ko && o === E.P2) {
    lethal(o, o.x >= p.x ? 1 : -1, { kb: 0, stun: .5, stop: .1, col: '#ff2440' });
    Object.assign(o, { vy: 0, vx: 0, y: Math.min(o.y, 1) });      // (where they lie: no hop)
  }
  unseal(p);
}
function unseal(p) {
  unsealed = true; hot = 1; E.root.classList.add('unsealed');
  labels(); hintEl.innerHTML = HINT_OPEN;
  E.banner('解', 'UNSEALED'); sfx.blast(); shake(20); E.zoomIn(.4);
  V.ring(p.x, p.y + 300, 320, COL, .45); if (Z) Z.flash(CRGB, .3, .25);
  paintAwk(); watchOn();
}
function reseal(fade = 1.5) {
  if (lw) { const L = lw; lw = null; unpause(L); }
  if (spun) { spun.spin = 1; spun = null; }
  stopSong(fade); hot = 0; stillT = 0; stillO = null; turnT = 0; five.buf = 0; five.cd = 0;
  if (!unsealed) return;
  unsealed = false; E.root.classList.remove('unsealed');
  labels(); if (on()) { hintEl.innerHTML = HINT; JU.tech.drain(); }
}
function watchOn() {
  clearInterval(watch);
  watch = setInterval(() => { if ((lw || unsealed || song) && E.root.dataset.mode !== 'fight') reseal(1); if (!lw && !unsealed && !song) clearInterval(watch); }, 250);
}
// the awakening bar, while he is unsealed: it says so
function paintAwk() {
  if (!unsealed || !on()) return;
  const sp = awkEl.lastElementChild;
  if (sp.textContent !== 'Unsealed') { sp.textContent = 'Unsealed'; awkEl.style.setProperty('--a', 1); awkEl.classList.remove('full'); }
}

/* ================= UNSEALED (Build 0.18): five words, the fifth on 5 ================= */
// 1 EXPLODE (爆ぜろ): they burst. Two at most, when there is more than one there (a raid): whoever he is fighting and the next nearest.
//   If either had more fight in it than STRONG, he goes with them (and that fight is lost); otherwise it costs him a little. Its clip is the
//   only one of the line on myinstants, titled in Portuguese ("IMPLODA - Inumaki"): sounds/home-inu-explode.mp3 at home
// 2 TWIST OFF: wrung round six times where they stand (12 each), and thrown (18)
// 3 GET DOWN: CRATER: put into the floor three times (25, 25, 40), and kept there four seconds
// 4 STILLNESS (Don't Move): five seconds stock still (two for a heavy one), and every blow on them lands half as hard again
// 5 STOP: TURN BACK: a second and a half waiting for it. What comes stops short and goes back into them (110). Nothing comes: he says it
//   anyway, and they freeze (30)
const BURST_RECOIL = .08, STILL_T = 5, STILL_HEAVY = 2, STILL_POW = 1.5, TURN_T = 1.5;
let stillT = 0, stillO = null, turnT = 0, spun = null;
function burst(p, o) {
  const face = o.x >= p.x ? 1 : -1, hs = o.scale || 1, x = o.x, y = o.y + 170 * hs;
  if (Z) Z.boom(x, y, 120 * hs, '255,90,140', { flash: .3, shake: 30 });
  E.addBlast(x, y, '255,90,140', 340); V.ring(x, y, 440, '#ff5a8c', .4); V.sparks(x, y, 'red', 16);
  if (gore()) {
    sfx.splat(); E.after(.06, () => sfx.splat());
    if (Z) for (let i = 0; i < 40; i++) { const a = rnd(0, TAU), v = rnd(300, 1200); Z.emit(4, x + rnd(-30, 30), y + rnd(-60, 60), Math.cos(a) * v, Math.sin(a) * v * .8 + 300, rnd(4, 9), 1.8, i % 3 ? '150,8,20' : '200,20,32', { g: 1900, land: 'blood' }); }
  }
  lethal(o, face, { kb: 700, lift: 900, stun: 1, stop: .3, heavy: 1, col: '#ff5a8c' });
}
const EXPLODE = { name: 'Explode', cd: 30, dur: 1.2, run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < .9 ? POSE.inuDie : POSE.idle;
  if (!m.s) { m.s = 1; command(p, 'home-inu-explode', '爆ぜろ', 'EXPLODE', 40); }
  if (t < .5 || m.done) return;                       // (on the word: the clip has it half a second in)
  m.done = 1;
  const o = hears(p), more = H.foes && H.foes();
  rings(p, o, '#ff5a8c');
  if (!o) return;
  const two = [o];
  if (more) { const b = more.filter(x => x !== o && !x.ko && !(x.alpha < 1) && Math.abs(x.x - p.x) < 1250).sort((a, c) => Math.abs(a.x - p.x) - Math.abs(c.x - p.x))[0]; if (b) two.push(b); }
  const fatal = mortal() && two.some(x => tierOf(x) === 'strong');
  if (fatal && !crowd()) o.ko = true;                 // (they went together: it is no win)
  sfx.purple(); shake(40); E.zoomIn(.5);
  for (const x of two) burst(p, x);
  if (!fatal) { recoil(p, duel() ? COST_DUEL * .6 : BURST_RECOIL); return; }
  E.after(.45, () => {
    const q = E.P1;
    if (q.dead) return;
    E.fx.push({ k: 2, x: q.x, y: q.y + 440, n: 'BACKLASH', col: '#ff2440', t: 0, life: 1.8 });
    coughUp(q, 3); reseal(3); Fi.chip(q.hp + 1, '#ff2440');
  });
} };
// the wringing, drawn: lines spiralling in on them
function spiral(o, life) {
  const x = o.x, y = o.y + 160 * (o.scale || 1);
  V.custom(life, u => {
    const c = F(x, y), k = c[2];
    g.save(); g.translate(c[0], c[1]); g.globalAlpha = 1 - u; g.strokeStyle = COL; g.lineWidth = 3 * k; g.lineCap = 'round';
    for (let i = 0; i < 4; i++) { g.beginPath(); for (let j = 0; j <= 24; j++) { const a = i * TAU / 4 + j * .26 + u * 9, r = (150 - j * 5.5) * k * (1 - u * .3); j ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r * .8) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r * .8); } g.stroke(); }
    g.restore();
  });
}
const WRING = { name: 'Twist Off', cd: 9, dur: 1.55, run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < 1.3 ? POSE.inuPoint : POSE.idle;
  if (!m.s) { m.s = 1; command(p, 'home-inu-twist', '捻じ切れろ', 'TWIST OFF', 20); }
  if (m.o === undefined && t > .22) { m.o = hears(p) || null; rings(p, m.o); if (m.o) { held = held && held.o === m.o ? null : held; hold(m.o, 1.2); } }
  const o = m.o;
  if (!o) return;
  if (!o.ko && t > .3 && t < 1.2 && !duel()) { o.spin = Math.cos((t - .3) * 24); spun = o; }      // wrung round where they stand
  for (let i = 0; i < 6; i++) {
    if (t < .3 + i * .14 || m['w' + i]) continue;
    m['w' + i] = 1;
    if (o.ko) continue;
    E.applyHit(o, p.face, { dmg: exact(o, 12), kb: 0, stun: .5, stop: .04, col: COL, fixed: 1, mute: 1 });
    sfx.snap(); shake(8 + i * 2); V.sparks(o.x, o.y + 170 * (o.scale || 1), 'purple', 5); spiral(o, .3);
    if (!duel() && !o.poise && !o.ko) Object.assign(o, { state: 'hurt', stun: .5, vx: 0 });      // (kept on their feet for the next one)
  }
  if (t > 1.2 && !m.f) {
    m.f = 1;
    if (spun === o) { o.spin = 1; spun = null; }
    if (o.ko) return;
    E.applyHit(o, p.face, { dmg: exact(o, 18), kb: 700, lift: 900, stun: .9, stop: .2, heavy: 1, col: COL, fixed: 1, mute: 1 });
    sfx.blast(); sfx.snap(); shake(26);
    if (!duel() && !o.poise && JU.vengeful && JU.vengeful.launch) JU.vengeful.launch(o);
  }
} };
const SLAMS = [[.25, 25], [.55, 25], [.85, 40]];
const CRATER = { name: 'Get Down: Crater', cd: 11, dur: 1.35, run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < 1.1 ? POSE.inuSay : POSE.idle;
  if (!m.s) { m.s = 1; command(p, 'home-inu-down', '伏せろ', 'GET DOWN', 20); }
  if (m.o === undefined && t > .2) { m.o = hears(p) || null; rings(p, m.o); }
  const o = m.o;
  if (!o) return;
  SLAMS.forEach(([at, dmg], i) => {
    if (t < at || m['c' + i] || o.ko) return;
    m['c' + i] = 1;
    held = held && held.o === o ? null : held;
    E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: exact(o, dmg), kb: 30, stun: 1, stop: i === 2 ? .25 : .12, heavy: 1, col: COL, fixed: 1, mute: 1 });
    if (!duel() && !o.poise && !o.ko) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 30), vy: -2100, vx: 0, bounced: true });
    sfx.slam(1 + i * .25); shake(16 + i * 8); V.crack(o.x, 240 + i * 90); V.ring(o.x, 30, 260 + i * 80, COL, .4); E.addDust(o.x);
    if (Z) Z.shock(o.x, 380 + i * 120, CRGB, .45, 9);
    if (i === 2) { V.rocks(o.x, 0, 10); if (!duel() && !o.poise && !o.ko) pinned = { o, t: 4 }; }
  });
} };
const STILL = { name: 'Stillness', cd: 16, dur: .85, run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < .6 ? POSE.inuSay : POSE.idle;
  if (!m.s) { m.s = 1; command(p, 'home-inu-dontmove', '動くな', 'DON\'T MOVE', 20); }
  if (t < .18 || m.done) return;
  m.done = 1;
  const o = hears(p);
  rings(p, o, '#ffffff');
  if (!o) return;
  const T = o.poise ? STILL_HEAVY : STILL_T;
  E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: exact(o, 10), kb: 0, stun: T, stop: .2, heavy: 1, col: COL, fixed: 1, mute: 1 });
  if (!duel()) { held = { o, t: T }; if (o.ai) o.ai.t = Math.max(o.ai.t || 0, T); }
  stillO = o; stillT = T;
  sfx.hush(); shake(14); E.zoomIn(.3); V.ring(o.x, o.y + 160, 300, '#ffffff', .5);
  if (Z) Z.flash('255,255,255', .25, .3);
} };
const TURN = { name: 'Stop: Turn Back', cd: 12, dur: TURN_T + .6, run(p, m, t) {
  p.vx = 0; p.rate = 26;
  if (!m.s) { m.s = 1; turnT = TURN_T; sfx.charge(); E.fx.push({ k: 2, x: p.x, y: p.y + 420, n: '...', col: '#ffffff', t: 0, life: .8 }); }
  p.target = m.fired !== undefined ? (t < m.fired + .45 ? POSE.inuDie : POSE.idle) : POSE.inuGuard;
  if (m.fired === undefined && t >= TURN_T) sayStop(p, null);      // nothing came: he says it anyway
  if (m.fired !== undefined && t > m.fired + .55) E.endMove(p);
} };
// STOP, said: face is which way the blow that came was going (null: nothing came)
function sayStop(p, face) {
  const o = E.P2, m = p.move, back = face !== null;
  turnT = 0;
  if (m && m.def === TURN && m.fired === undefined) m.fired = m.t;
  command(p, 'home-inu-stop', '止まれ', 'STOP', 15);
  rings(p, o, '#ffffff');
  sfx.hush();
  if (!o || o.ko) return;
  E.applyHit(o, back ? -face : (o.x >= p.x ? 1 : -1), { dmg: exact(o, back ? 110 : 30), kb: back ? 900 : 120, lift: back ? 700 : 0, stun: 1.5, stop: back ? .35 : .15, heavy: 1, col: '#ffffff', fixed: 1, mute: 1 });
  if (!back && !duel()) { held = { o, t: o.poise ? HOLD_HEAVY : 1.5 }; if (o.ai) o.ai.t = Math.max(o.ai.t || 0, held.t); }
  if (back) { sfx.blast(); shake(30); E.zoomIn(.35); V.sparks(o.x, o.y + 160, 'purple', 16); if (Z) Z.flash('255,255,255', .3, .2); }
}

/* ---------- the fifth slot on the hotbar, and 5 ---------- */
const five = { el: document.createElement('div'), cd: 0, buf: 0, shown: -1 };
five.el.className = 'mv inu5'; five.el.dataset.m = 'inu5'; five.el.hidden = true;
five.el.innerHTML = '<kbd>5</kbd><b>Stop: Turn Back</b>';
E.hud.mv.esp.parentNode.insertBefore(five.el, E.hud.mv.esp);      // (touch.js finds it with the rest, and taps it as 'inu5': H.press below)
addEventListener('keydown', e => {
  if (e.key !== '5' || e.repeat || !unsealed || !on() || E.root.dataset.mode !== 'fight') return;
  e.preventDefault(); five.buf = .18;
});
function fiveTick(dt) {
  const p = E.P1;
  if (five.cd > 0) five.cd = Math.max(0, five.cd - dt);
  if (five.buf > 0) five.buf -= dt;
  if (five.buf > 0 && unsealed && five.cd <= 0 && !p.move && !p.ps && !p.dead && p.ground && !(p.dashT > 0) && !Fi.fight.paused) {
    five.buf = 0; five.cd = TURN.cd; p.move = { def: TURN, t: 0 }; five.el.classList.add('act');
  }
  if (five.el.classList.contains('act') && !(p.move && p.move.def === TURN)) five.el.classList.remove('act');
  const v = Math.round(clamp(five.cd / TURN.cd, 0, 1) * 50) / 50;
  if (v === five.shown) return;
  if (v === 0 && five.shown > 0) { five.el.classList.remove('rdy'); void five.el.offsetWidth; five.el.classList.add('rdy'); }
  five.shown = v; five.el.style.setProperty('--cd', v);
}
// the hotbar's names and waits, as he is now
function labels() {
  five.el.hidden = !(unsealed && on());
  if (!on()) return;
  for (const k of JU.tech.SLOTS) { const d = MOVES[k]; E.hud.mv[k].querySelector('b').textContent = d.name; E.CD[k] = d.cd; E.cd[k] = 0; }
}

const MOVES = {
  get strikes() { return unsealed ? EXPLODE : DONT; }, get crush() { return unsealed ? WRING : TWIST; },
  get div() { return unsealed ? CRATER : DOWN; }, get manji() { return unsealed ? STILL : STOP; }
};
JU.tech.add('speaker', { name: 'Cursed Speaker', jp: '呪言', mark: '言', who: 'Cursed speech, and a throat that pays for it', odds: 0, col: COL, glow: 'purple', moves: MOVES,
  early: true, skin: SPEAKER, as: ['Cursed Speaker', '呪言'], m1, awaken, awkName: 'Last Word', awkKeep: true, awkStart: 0,
  get awkHits() { return !unsealed && !lw; },          // (unsealed, the bar is spent: hits do not fill it)
  hint: HINT });
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
const guard0 = H.guard, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart, post0 = H.post, press0 = H.press, pow0 = H.power, rim0 = H.rim;
H.guard = (face, a, mul) => {
  if (guard0 && guard0(face, a, mul)) return true;
  if (!on() || E.P1.dead) return false;
  if (turnT > 0) { sayStop(E.P1, face); return true; }      // (0.18, unsealed) it stops short, and goes back into them
  if (!(stopT > 0)) return false;
  stopped(face);                                    // it stops short of him
  return true;
};
H.press = (a, inScene) => {
  if (a === 'inu5' && !inScene) { if (unsealed && on()) five.buf = .18; return true; }      // (the fifth slot, tapped)
  return press0 ? press0(a, inScene) : false;
};
// Stillness: every blow on them half as hard again
H.power = (h, o) => (pow0 ? pow0(h, o) : 1) * (stillT > 0 && o === stillO && !o.ko && on() ? STILL_POW : 1);
// and they are drawn pale while it holds
H.rim = f => (stillT > 0 && f === stillO && !f.ko && on() ? { wash: '#ece8ff', a: .42 } : rim0 ? rim0(f) : null);
H.tick = dt => {
  tick0(dt);
  if (talking > 0) talking -= dt;
  if (!on()) { bar.classList.remove('on'); held = pinned = null; if (lw || unsealed || song) reseal(1); return; }
  bar.classList.add('on');
  const p = E.P1;
  if (lw && !(p.move && p.move.def === LASTWORD)) finish();      // (0.18) LAST WORD over: the move has run out, or been cut short
  dying(dt);
  const cfg = Fi.fight.cfg, last = !!cfg && !cfg.dummy && !crowd() && !!cfg.foes && Fi.fight.wave >= cfg.foes.length - 1 && E.P2.ko;
  overT = unsealed && last ? overT + dt : 0;
  if (unsealed) {
    if (p.dead) reseal(2.5);
    else if (overT > 3.5) reseal(3);                  // the last of them is down and the fight is won: the song goes, and so does the rest
    else {
      talking = Math.max(talking, .3); hot = 1; paintAwk();
      if ((auraT -= dt) <= 0) { auraT = .75; const w = mouthAt(p); V.ring(w[0], w[1], 80, COL, .45); }
    }
  }
  if (stillT > 0 && ((stillT -= dt) <= 0 || !stillO || stillO.ko)) { stillT = 0; stillO = null; }
  if (turnT > 0 && !(p.move && p.move.def === TURN)) turnT = 0;
  if (spun && !(p.move && p.move.def === WRING)) { spun.spin = 1; spun = null; }
  fiveTick(dt);
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
  if (turnT > 0 && !p.dead) {                       // (0.18) Turn Back's wait: the same ring, purple and doubled
    const c = F(p.x, p.y + 160), k = c[2];
    g.save(); g.strokeStyle = 'rgba(200,170,255,.9)'; g.lineWidth = 3 * k;
    for (const r of [150, 172]) { g.beginPath(); g.arc(c[0], c[1], r * k, -Math.PI / 2, -Math.PI / 2 + TAU * turnT / TURN_T); g.stroke(); }
    g.restore();
  }
  impact(); tag();
};
// (0.18) the moment of the word: three frames of it (black and white, white and black, blood dark), everything else gone
const SIL = { black: E.flat('#000000', '#000000'), white: E.flat('#ffffff', '#ffffff') };
function impact() {
  const L = lw;
  if (!L || L.word === undefined || L.word > .42) return;
  const u = L.word, full = col => { g.fillStyle = col; g.fillRect(-4000, -3000, 8000 + E.VW, 6000 + E.VH); };
  const sil = skin => { for (const w of [L.o, E.P1]) if (w && !(w.alpha < 1)) E.drawFighter(E.over(w, skin), 1); };
  if (u < .14) { full('#000'); sil(SIL.white); } else if (u < .28) { full('#fff'); sil(SIL.black); } else { full('#26000a'); sil(SIL.black); }
}
// with the bar full, over whoever he is fighting: what saying it to them would cost him
function tag() {
  if (lw || unsealed || !awkEl.classList.contains('full')) return;
  const o = E.P2, p = E.P1;
  if (!o || o.ko || o.alpha < 1 || p.skin !== SPEAKER) return;
  const [txt, col] = TIER[tierOf(o)], hs = o.scale || 1, c = F(o.x, o.y + 372 * hs), k = c[2], label = 'LAST WORD · ' + txt;
  g.save(); g.font = `${Math.max(10, Math.round(19 * k))}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'bottom';
  g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.8)'; g.strokeText(label, c[0], c[1]); g.fillStyle = col; g.fillText(label, c[0], c[1]);
  g.restore();
}
// and the word itself, lettered across the middle of the screen, shaking
H.post = dt => {
  if (post0) post0(dt);
  const L = lw;
  if (!L || L.word === undefined) return;
  const u = (L.word += dt || 0), life = 1.9;
  if (u > life) return;
  const VW = E.VW, VH = E.VH, a = u > life - .45 ? (life - u) / .45 : 1, jit = u < .8 ? 1 : 0;      // (all there at once: it is the scale that pops)
  const sc = 1 + .4 * Math.max(0, 1 - u / .12);
  g.save(); g.translate(VW / 2 + rnd(-7, 7) * jit, VH * .42 + rnd(-6, 6) * jit); g.scale(sc, sc); g.globalAlpha = Math.max(0, a);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.font = `italic 800 ${Math.round(VH * .3)}px "Shantell Sans", Anton, Impact, sans-serif`;
  g.lineWidth = VH * .034; g.strokeStyle = '#ffffff'; g.strokeText('DIE', 0, 0);
  g.fillStyle = '#0a0003'; g.fillText('DIE', 0, 0);
  g.lineWidth = VH * .007; g.strokeStyle = '#ff2440'; g.strokeText('DIE', 0, 0);
  g.font = `${Math.round(VH * .075)}px 'Yuji Syuku', 'Yu Mincho', serif`; g.lineWidth = VH * .012; g.strokeStyle = '#000'; g.strokeText('死ね', 0, VH * .2); g.fillStyle = '#ff2440'; g.fillText('死ね', 0, VH * .2);
  g.restore();
};
const clear = () => { voice = VOICE; quiet = 9; stopT = 0; talking = 0; held = pinned = null; paint(); };
H.reset = () => { reset0(); clear(); reseal(.6); bar.classList.remove('on'); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) { clear(); reseal(.8); } };      // (unsealed lasts the fight: through its waves, not into the next)

JU.speaker = { SKIN: SPEAKER, MOVES, esp: SYRUP, WORDS, tierOf,      // (esp: E, especial.js; SKIN: jjh.js dresses the one at Jujutsu High in it)
  get voice() { return Math.round(voice); }, set voice(v) { voice = clamp(+v || 0, 0, VOICE); paint(); },
  get state() { return { voice: Math.round(voice), held: held && +held.t.toFixed(2), pinned: pinned && +pinned.t.toFixed(2), stop: +stopT.toFixed(2),
    last: lw && { t: +lw.t.toFixed(2), tier: lw.tier, dying: lw.dying === undefined ? null : +lw.dying.toFixed(2), word: lw.word === undefined ? null : +lw.word.toFixed(2) },
    unsealed, song: !!(song && song.playing), songAt: song ? +song.at.toFixed(2) : null, songVol: song ? +song.vol.toFixed(2) : null,
    five: +five.cd.toFixed(2), still: +stillT.toFixed(2), turn: +turnT.toFixed(2) }; } };
})();
