/* JUJUTSU UNLIMITEDS — Build 0.30v3: the ragdoll an uppercut or a down slam leaves behind lasts longer, and the Evasive still gets anybody
   out of it. The user's: "make the uppercut ragdoll and downslam last longer" (asked first as "make it so the uppercut ragdoll and downslam
   last longer but can be evased out of").
   WHICH BLOWS: the uppercut and the down slam at the end of a chain of strikes, whoever's chain it is. Each says so on the blow itself,
   rag: 'up' or rag: 'slam': the Vessel's (combat2.js, combat.js, with the Black Flash uppercut and the Black Flash slam after it), the
   Inverted Spear of Heaven's (tools.js), the Vengeful Artist's, Ratio Man's, the gambler's fifth kick, the Lightning Beast's third in
   Beast Mode, and the Cursed Speaker's FALL (a word for a slam).
   HOW LONG: the flight is as it was, so everything timed on it still is (the Black Flash slam, a Ratio Kick after the uppercut, strikes in
   the air after it). What lasts longer is the time on the floor once they are down: UP_T after an uppercut and SLAM_T after a slam, where
   the engine's own is .55 s. Hit again meanwhile (Ultra Cannon, Puppet Breaker, Skyfall Crush's floor: what reaches a body lying there)
   and down again, and they lie there to the end of it still: a follow-up never cuts it short.
   THE EVASIVE: Q (or Dash) gets you out of it at any moment, in the air or lying there, as it always has (evasive.js); the Evasive dummy
   gets out of it as it always has (ps.js).
   IN A DUEL (pvp.js): the blow carries rag across. An uppercut leaves the other player on the floor as long; a down slam puts him into it
   and leaves him there as long (in a duel it only staggered him before); and a blow that found him lying there lands (dn: a duel refused
   every blow on somebody lying down, so what reaches a ragdolled player, Build 0.30v1's Ultra Cannon and Puppet Breaker, never did there).
   Build 0.30v4, THE ENEMY'S EVASIVE: whatever fights back sometimes gets out of it as well. The user's: "make enemies sometimes evasive out
   of it". Never in the air, so whatever follows an uppercut up there still lands: once it is down, a moment after it hits the floor
   (TUNE.at), on a roll each time it is put there (TUNE.out for a curse; TUNE.kit for one with a moveset of its own, a boss). It is the
   Evasive every foe has (evasive.js): twenty seconds before it is back, none with a Broken Limb or while bound. Not a dummy (the Evasive dummy
   keeps its own, ps.js), not a duel's player (his own Q is his), not another game's curse in a raid; and not while something else holds it
   down: only out of the ragdoll's own time on the floor (own: nothing but the engine's clock has touched how long it lies there) */
(() => {
'use strict';

const E = JU.eng, H = E.hooks, Fi = JU.fights;
const UP_T = 1.6, SLAM_T = 2, SPIKE = 1300;         // seconds on the floor after an uppercut, after a down slam; how hard a slam in a duel puts me into it
const LONG = { up: UP_T, slam: SLAM_T };
const TUNE = { out: .3, kit: .5, at: [.3, .9] };    // how often a curse gets out of it, and one with a moveset of its own (a boss); how long after it is down
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const knocked = s => s === 'air' || s === 'down';

// whoever one has ragdolled: { k, end, was, out, lay, st, own }. end: when it is over, counted from when they first came down; out: how long
// after it is down it gets out (0: not this time); lay: how long it has lain there since it last came down; st: its stun as last left; own:
// whether that is still the ragdoll's alone
let tags = new WeakMap();
let mine = null;                                    // and me, in a duel

// its roll, as it is put on the floor: how long after it is down it gets out with its Evasive, or 0
function roll(o) {
  if (!o.ai || o.net || (o.psKind && o.psKind !== 'foe')) return 0;      // nothing on its mind (a dummy, a staged scene), or another game's to run
  return Math.random() < (o.ai.d && o.ai.d.kit ? TUNE.kit : TUNE.out) ? E.rnd(TUNE.at[0], TUNE.at[1]) : 0;
}
function tag(o, k) {
  if (!o || o.ko || o.poise || duel()) return;      // (too heavy to throw about; or a duel's puppet, whose own game ragdolls him)
  tags.set(o, { k, end: 0, was: o.state, out: roll(o), lay: 0, st: 0, own: false });
}
// a duel: his uppercut or slam has just landed on me (pvp.js)
function me(k) {
  const p = E.P1;
  if (!LONG[k] || p.dead || !(p.ps === 'air' || p.ps === 'hurt')) return;      // it did not knock me about: blocked, dashed through, No stun; or I was lying there already
  if (k === 'slam') Object.assign(p, { ps: 'air', ground: false, y: Math.max(p.y, 26), vy: -SPIKE });      // into the floor, as a slam puts anybody
  if (p.ps === 'air') mine = { k, end: 0, was: 'air' };
}
// on the floor: as long as it still has to run, from when it first came down. True as it comes down
function hold(f, t, st, stun) {
  const fell = st === 'down' && t.was !== 'down';
  if (fell) {
    if (!t.end) t.end = E.T + LONG[t.k];
    f[stun] = Math.max(f[stun] || 0, t.end - E.T);
  }
  t.was = st;
  return fell;
}

const hit0 = H.hit, tick0 = H.tick, reset0 = H.reset, start0 = H.fightStart;
H.hit = (o, face, h) => { if (hit0) hit0(o, face, h); if (h && LONG[h.rag]) tag(o, h.rag); };
H.tick = dt => {
  if (tick0) tick0(dt);
  const more = H.foes && H.foes();
  for (const o of more ? [E.P2, ...more.filter(x => x !== E.P2)] : [E.P2]) {
    const t = o && tags.get(o);
    if (!t) continue;
    if (o.ko || !knocked(o.state)) { tags.delete(o); continue; }      // up again, out of it by its Evasive, or gone
    const st0 = o.stun || 0;
    if (hold(o, t, o.state, 'stun')) { t.lay = 0; t.own = st0 <= Math.max(.56, t.end - E.T + .01); }      // down: by the engine's landing, or put there by something for no longer than this: its own
    else if (o.state === 'down') { t.lay += dt; if (Math.abs((o.stun || 0) - (t.st - dt)) > 1e-3) t.own = false; }      // its time there changed by more than the clock: something is holding it down
    t.st = o.stun || 0;
    if (t.out && t.own && o.state === 'down' && t.lay >= t.out && !Fi.fight.paused && !E.P1.dead) {
      t.out = 0;                                    // its one go at it (its Evasive not back yet: it lies there)
      if (JU.evasive && JU.evasive.foe(o, 1, true)) tags.delete(o);
    }
  }
  if (mine) {
    const p = E.P1;
    if (p.dead || !knocked(p.ps)) mine = null;      // out of it: the Evasive, or up again
    else hold(p, mine, p.ps, 'stun');
  }
};
const clear = () => { tags = new WeakMap(); mine = null; };
H.reset = () => { if (reset0) reset0(); clear(); };
H.fightStart = (cfg, wave) => { if (start0) start0(cfg, wave); clear(); };

JU.ragdoll = { me, UP_T, SLAM_T, LONG, TUNE,
  of: o => { const t = tags.get(o); return t ? { k: t.k, end: t.end, left: t.end ? Math.max(0, +(t.end - E.T).toFixed(2)) : null, out: +t.out.toFixed(2), lay: +t.lay.toFixed(2), own: t.own } : null; },
  get mine() { return mine && { k: mine.k, end: mine.end }; } };
})();
