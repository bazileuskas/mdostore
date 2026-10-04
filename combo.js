/* JUJUTSU UNLIMITEDS — Black Flash Update: three techniques each have a route of their own to a Black Flash.
   Limitless: Reversal: Red, then R.   Transfiguration: Idle Transfiguration, then 2.   Shrine with the Sukuna clan: Cleave, choke hold (R), then Dismantle. */
(() => {
'use strict';

const E = JU.eng, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, T = JU.tech.TECH;
const { rnd } = E, { orb } = JU.tech.tk;
const RED = T.limitless.moves.crush, IDLE = T.trans.moves.div, CLEAVE = JU.sukuna.SM.crush, INK = '#ff2440';
const st = { kind: null, stage: 0, t: 0 };          // which route is open, how far along it is, and the seconds left to take the next step

const hint = text => E.fx.push({ k: 2, x: E.P1.x, y: E.P1.y + 335, n: text, col: INK, t: 0, life: 1.2 });
const arm = (kind, t, text) => { Object.assign(st, { kind, stage: 1, t }); hint(text); };
const sukuna = () => !!JU.clan.active && JU.clan.active.id === 'sukuna';

// the blow itself: an exact amount whatever the target's toughness, and then the sparks
function flash(p, o, dmg) {
  E.applyHit(o, p.face, { dmg: dmg / (o.dr || 1), kb: 1050, lift: 560, stop: .3, heavy: 1, col: INK, fixed: 1 });
  E.blackFlash();
}
const pin = (o, x, y, face) => Object.assign(o, { x, y, vx: 0, vy: 0, ground: true, state: 'hurt', stun: .5, face });
function sparks(p) {
  const w = E.hand(p, false);
  V.mote(w[0], w[1], 'red');
  if (Math.random() < .3) V.bolt(w[0], w[1], w[0] + rnd(-110, 110), w[1] + rnd(-110, 110), INK, .14, 2, '#060205');
}
const begin = (p, m) => { m.c = 1; p.face = E.P2.x >= p.x ? 1 : -1; p.inv = Math.max(p.inv, 1); sfx.charge(); };

// Limitless: Blue drags it back in from wherever Red threw it, straight onto the fist. Thirty percent of everything it has
const PULL = { name: 'Black Flash', dur: .95, glow: 'red', run(p, m, t) {
  const o = E.P2, dt = t - (m.lt || 0), tx = p.x + p.face * 125;
  m.lt = t; p.vx = 0; p.rate = 40;
  if (!m.c) { begin(p, m); V.custom(.34, u => orb(p.x + p.face * 125, p.y + 170, 26 * (1 - u * .5), 'blue', '#06203a')); }
  if (t < .34) {
    p.target = POSE.divWind; sparks(p);
    if (!o.ko) { pin(o, o.x + (tx - o.x) * (1 - Math.exp(-dt * 14)), o.y + (40 - o.y) * (1 - Math.exp(-dt * 14)), -p.face); V.puff('blue', o.x, o.y + 150, 0, 0, 60, .2); }
    return;
  }
  p.target = t < .62 ? POSE.div : POSE.idle; p.rate = 46;
  if (!m.done) { m.done = 1; sfx.whoosh(); if (!o.ko && Math.abs(o.x - p.x) < 280) flash(p, o, o.max * .3); }
} };

// Transfiguration: on it again before its soul has settled. Sixty
const TOUCH = { name: 'Black Flash', dur: .9, glow: 'red', run(p, m, t) {
  const o = E.P2, gap = (o.x - p.x) * p.face;
  p.rate = 44;
  if (!m.c) begin(p, m);
  if (t < .16) { p.target = POSE.divWind; p.vx = 0; sparks(p); return; }
  if (!m.done && t < .5) {
    p.target = POSE.dash; p.vx = gap > 150 ? p.face * 1300 : 0;
    if (gap > -30 && gap <= 190 && !o.ko) { m.done = 1; m.at = t; p.vx = 0; flash(p, o, 60); }
    return;
  }
  p.vx = 0; p.target = m.done && t < m.at + .3 ? POSE.div : POSE.idle;
} };

// Shrine: still held by the throat while the other hand is drawn back. A hundred and twenty, and then every move has to rest
const EXECUTE = { name: 'Black Flash', dur: 1, glow: 'red', run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.rate = 44;
  if (!m.c) { begin(p, m); for (const k of JU.tech.SLOTS) E.cd[k] = 20; }
  if (t < .3) {
    p.target = POSE.divWind; sparks(p);
    if (!o.ko) pin(o, p.x + p.face * 112, 62, -p.face);
    return;
  }
  p.target = t < .65 ? POSE.div : POSE.idle; p.rate = 46;
  if (m.done) return;
  m.done = 1; sfx.whoosh();
  if (o.ko) return;
  for (let i = 0; i < 8; i++) V.slash(o.x + rnd(-50, 50), o.y + rnd(80, 260), rnd(0, 6.28), rnd(240, 420), INK, 9, i * .02);
  flash(p, o, 120);
} };

function start(def) {
  const p = E.P1;
  if (p.move) E.endMove(p);
  p.move = { def, t: 0 };
  st.kind = null;
  return true;
}
// a key pressed while a route is open: is it the next step?
function step(a) {
  const p = E.P1, o = E.P2;
  if (p.dead || p.ps || o.ko) return false;
  if (st.kind === 'limitless' && a === 'clan') return start(PULL);
  if (st.kind === 'trans' && a === 'crush') { E.cd.crush = E.CD.crush; return start(TOUCH); }
  if (st.kind === 'shrine' && st.stage === 2 && a === 'strikes') return start(EXECUTE);
  if (st.kind === 'shrine' && st.stage === 1 && a === 'clan' && p.move && p.move.def === CLEAVE) E.endMove(p);   // let go of the Cleave so the hand is free for the throat
  return false;
}

const moveFx0 = H.moveFx, press0 = H.press, tick0 = H.tick, reset0 = H.reset, start0 = H.fightStart;
H.moveFx = (p, m) => {                              // watching what the player's moves have done so far
  moveFx0(p, m);
  if (m.seen) return;
  const d = m.def;
  if (d === RED && m.s) { m.seen = 1; arm('limitless', 1.3, 'R  ·  BLACK FLASH'); }
  else if (d === IDLE && m.done) { m.seen = 1; arm('trans', 1.7, '2  ·  BLACK FLASH'); }
  else if (d === CLEAVE && m.done && sukuna()) { m.seen = 1; arm('shrine', 6, 'R  ·  CHOKE HOLD'); }
  else if (d.name === 'Choke Hold' && st.kind === 'shrine' && st.stage === 1) { m.seen = 1; st.stage = 2; st.t = 2.6; hint('1  ·  BLACK FLASH'); }
};
H.press = (a, inScene) => (!inScene && st.kind && step(a)) || (press0 ? press0(a, inScene) : false);
H.tick = dt => { tick0(dt); if (st.kind && (st.t -= dt) <= 0) st.kind = null; };
H.reset = () => { reset0(); st.kind = null; };
H.fightStart = (cfg, wave) => { st.kind = null; start0(cfg, wave); };

JU.combo = { st };
})();
