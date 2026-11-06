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
   every blow on somebody lying down, so what reaches a ragdolled player, Build 0.30v1's Ultra Cannon and Puppet Breaker, never did there) */
(() => {
'use strict';

const E = JU.eng, H = E.hooks, Fi = JU.fights;
const UP_T = 1.6, SLAM_T = 2, SPIKE = 1300;         // seconds on the floor after an uppercut, after a down slam; how hard a slam in a duel puts me into it
const LONG = { up: UP_T, slam: SLAM_T };
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const knocked = s => s === 'air' || s === 'down';

let tags = new WeakMap();                           // whoever one has ragdolled: { k, end, was }. end: when it is over, counted from when they first came down
let mine = null;                                    // and me, in a duel

function tag(o, k) {
  if (!o || o.ko || o.poise || duel()) return;      // (too heavy to throw about; or a duel's puppet, whose own game ragdolls him)
  tags.set(o, { k, end: 0, was: o.state });
}
// a duel: his uppercut or slam has just landed on me (pvp.js)
function me(k) {
  const p = E.P1;
  if (!LONG[k] || p.dead || !(p.ps === 'air' || p.ps === 'hurt')) return;      // it did not knock me about: blocked, dashed through, No stun; or I was lying there already
  if (k === 'slam') Object.assign(p, { ps: 'air', ground: false, y: Math.max(p.y, 26), vy: -SPIKE });      // into the floor, as a slam puts anybody
  if (p.ps === 'air') mine = { k, end: 0, was: 'air' };
}
// on the floor: as long as it still has to run, from when it first came down
function hold(f, t, st, stun) {
  if (st === 'down' && t.was !== 'down') {
    if (!t.end) t.end = E.T + LONG[t.k];
    f[stun] = Math.max(f[stun] || 0, t.end - E.T);
  }
  t.was = st;
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
    hold(o, t, o.state, 'stun');
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

JU.ragdoll = { me, UP_T, SLAM_T, LONG, of: o => { const t = tags.get(o); return t ? { k: t.k, end: t.end, left: t.end ? Math.max(0, +(t.end - E.T).toFixed(2)) : null } : null; },
  get mine() { return mine && { k: mine.k, end: mine.end }; } };
})();
