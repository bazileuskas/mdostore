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
   down: only out of the ragdoll's own time on the floor (own: nothing but the engine's clock has touched how long it lies there).
   Build 0.31v1, HEAVY BLOWS: the harder the blow that threw them, the longer they lie there. The user's: "also add the ragdoll lasts longer
   for more stronge moves". Every throw counts now, not only an uppercut's and a slam's: whatever knocks one off its feet (a blow with lift,
   one that catches it in the air, one that reaches it on the floor and throws it again). What it is weighed by is the damage it did, the
   number that comes up off them (the engine passes it to hooks.hit since this build; so a boss's armour, which takes some of every blow,
   takes some of this too): the blow that threw it, the rest of the same move in the second before it (POW.win: a barrage's punches before
   its uppercut), and everything that lands while it is up there. Under POW.from it is the engine's .55 s as ever, so the light throws
   (the chain's last kick, a flurry's last punch) are as they were; above it the time climbs toward POW.max: about 0.9 s for a 30-damage
   move, 1.4 for 50, 2.2 for 100, 2.8 for 200, never 3 (heavy()). An uppercut or a slam still lies there at least UP_T / SLAM_T, and longer
   when there was more behind it. A second throw while it lies there is weighed on its own, and only ever adds: it gets up when the longer
   of the two runs out. Every throw that leaves it down longer than the engine would gets the enemy's Evasive roll above (once a throw: a
   short one never does). In a duel, a blow of his that throws me is weighed by what it hit for (pvp.js passes it: `me(k, d)`); in a raid,
   a partner's blow on a curse this game runs is weighed here as well (raid.js: `blow()`), and their uppercuts and slams count as theirs */
(() => {
'use strict';

const E = JU.eng, H = E.hooks, Fi = JU.fights;
const UP_T = 1.6, SLAM_T = 2, SPIKE = 1300;         // seconds on the floor after an uppercut, after a down slam; how hard a slam in a duel puts me into it
const LONG = { up: UP_T, slam: SLAM_T };
const TUNE = { out: .3, kit: .5, at: [.3, .9] };    // how often a curse gets out of it, and one with a moveset of its own (a boss); how long after it is down
const BASE = .55;                                   // the engine's own time on the floor (game.js, foes.js)
const POW = { from: 20, k: 70, max: 3, win: 1 };    // Build 0.31v1: under `from` damage, the engine's own; above it toward `max` s (two thirds of the way there by from + k); win: the second before a throw that counts to it
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const knocked = s => s === 'air' || s === 'down';
const RAG = k => (k === 'up' || k === 'slam' ? k : null);
// how long a throw of this weight leaves one on the floor (0: no longer than the engine would)
const heavy = d => (d > POW.from ? BASE + (POW.max - BASE) * (1 - Math.exp(-(d - POW.from) / POW.k)) : 0);
const lie = (k, d) => Math.max(LONG[RAG(k)] || 0, heavy(d));

// whoever one has thrown: { k, d, end, was, out, rolled, lay, st, own, len }. k: an uppercut's or a slam's; d: the weight of the throw it is
// in, so far; end: when it gets up (the fight's clock); out: how long after it is down it gets out (0: not this time); rolled: whether this
// throw has had its roll; lay: how long it has lain there since it last came down; st: its stun as last left; own: whether that is still the
// ragdoll's alone; len: how long the last landing was for
let tags = new WeakMap(), recent = new WeakMap();
let mine = null, mrun = [];                         // and me, in a duel: my throw, and the blows on me just now
let now = 0;                                        // the fight's own clock: it stands still while the fight does (a hit-stop, a pause)

// the blows on one in the last POW.win seconds, with this one: what they add up to
function note(r, d) {
  while (r.length && now - r[0][0] > POW.win) r.shift();
  r.push([now, d]);
  let s = 0; for (const x of r) s += x[1];
  return s;
}
// its roll, as it is put on the floor: how long after it is down it gets out with its Evasive, or 0
function roll(o) {
  if (!o.ai || o.net || (o.psKind && o.psKind !== 'foe')) return 0;      // nothing on its mind (a dummy, a staged scene), or another game's to run
  return Math.random() < (o.ai.d && o.ai.d.kit ? TUNE.kit : TUNE.out) ? E.rnd(TUNE.at[0], TUNE.at[1]) : 0;
}
// a blow has landed on one this game runs, for d: if it threw it, or found it thrown, it is weighed into the throw
function blow(o, d, k) {
  if (!o || o.ko || o.poise || o.net || duel()) return;      // (too heavy to throw about; another game's to run; or a duel's puppet, whose own game ragdolls him)
  d = Math.max(0, +d || 0);
  let r = recent.get(o);
  if (!r) recent.set(o, r = []);
  const run = note(r, d);
  if (!knocked(o.state)) return;                    // it did not throw it: a stagger, or nothing at all
  let t = tags.get(o);
  if (!t) tags.set(o, t = { k: null, d: run, end: 0, was: o.state, out: 0, rolled: false, lay: 0, st: 0, own: false, len: 0 });      // (thrown just now: the rest of the move that did it counts)
  else t.d += d;
  if (RAG(k)) t.k = RAG(k);
}
// a duel: a blow of his has just landed on me (pvp.js), for d; k: his uppercut's or down slam's
function me(k, d) {
  const p = E.P1;
  if (p.dead) return;
  const run = note(mrun, Math.max(0, +d || 0));
  if (!(p.ps === 'air' || p.ps === 'hurt')) return;      // it did not knock me about: blocked, dashed through, No stun; or I was lying there already
  k = RAG(k);
  if (k === 'slam') Object.assign(p, { ps: 'air', ground: false, y: Math.max(p.y, 26), vy: -SPIKE });      // into the floor, as a slam puts anybody
  if (p.ps !== 'air') return;                       // only staggered
  if (!mine) mine = { k: null, d: run, end: 0, was: 'air', len: 0 };
  else mine.d += Math.max(0, +d || 0);
  if (k) mine.k = k;
}
// on the floor: as long as it still has to run. As it comes down, the throw that put it there is weighed, and can only make it longer.
// True as it comes down
function hold(f, t, st, stun) {
  const fell = st === 'down' && t.was !== 'down';
  if (fell) {
    const n = lie(t.k, t.d);
    t.len = n; t.k = null; t.d = 0;                 // (whatever throws it from here is a throw of its own)
    if (n > 0) t.end = Math.max(t.end, now + n);
    if (t.end > now) f[stun] = Math.max(f[stun] || 0, t.end - now);
  }
  t.was = st;
  return fell;
}

const hit0 = H.hit, tick0 = H.tick, reset0 = H.reset, start0 = H.fightStart;
H.hit = (o, face, h, dmg) => {                      // (dmg: what it took, as the engine counted it: game.js)
  if (hit0) hit0(o, face, h);
  if (h) blow(o, typeof dmg === 'number' ? dmg : (h.dmg || 0) * (o.dr || 1), h.rag);
};
H.tick = dt => {
  if (tick0) tick0(dt);
  now += dt;
  const more = H.foes && H.foes();
  for (const o of more ? [E.P2, ...more.filter(x => x !== E.P2)] : [E.P2]) {
    const t = o && tags.get(o);
    if (!t) continue;
    if (o.ko || !knocked(o.state)) { tags.delete(o); continue; }      // up again, out of it by its Evasive, or gone
    const st0 = o.stun || 0;
    if (hold(o, t, o.state, 'stun')) {
      t.lay = 0; t.own = st0 <= Math.max(.56, t.end - now + .01);      // down: by the engine's landing, or put there by something for no longer than this: its own
      if (!t.rolled && t.end - now > BASE + .05) { t.rolled = true; t.out = roll(o); }      // (a throw that keeps it down longer than the engine would: its roll, once)
    }
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
const clear = () => { tags = new WeakMap(); recent = new WeakMap(); mine = null; mrun = []; };
H.reset = () => { if (reset0) reset0(); clear(); };
H.fightStart = (cfg, wave) => { if (start0) start0(cfg, wave); clear(); };

const left = t => (t.end ? Math.max(0, +(t.end - now).toFixed(2)) : null);
JU.ragdoll = { me, blow, lie, heavy, UP_T, SLAM_T, LONG, TUNE, POW, BASE,
  of: o => { const t = tags.get(o); return t ? { k: t.k, d: +t.d.toFixed(1), len: +t.len.toFixed(2), end: t.end, left: left(t), out: +t.out.toFixed(2), lay: +t.lay.toFixed(2), own: t.own } : null; },
  get mine() { return mine && { k: mine.k, d: +mine.d.toFixed(1), len: +mine.len.toFixed(2), end: mine.end, left: left(mine) }; },
  get now() { return now; } };
})();
