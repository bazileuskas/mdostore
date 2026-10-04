/* JUJUTSU UNLIMITEDS — Training: a curse that never fights back, for trying a technique and a clan on */
(() => {
'use strict';

const E = JU.eng, H = E.hooks, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights;

// it just stands there. `human` keeps it from dissolving when it is beaten: it gets back up instead
Fi.DEFS.dummy = { name: 'Training Curse', jp: '呪霊', skin: E.CURSE, hp: 300, scale: 1, speed: 0, range: 0, gap: [9, 9], human: true, atk: [] };

function start() {
  JU.tech.apply(); JU.clan.apply();               // whatever technique and clan are equipped, the same as Free Exploration
  if (JU.tools) JU.tools.apply();                 // and whatever cursed tool is being carried
  Fi.start({ foes: ['dummy'], stage: E.SHRINE, label: 'Training', dummy: true });
  E.P2.ai = null;                                 // nothing going on in its head at all
  E.banner('修練', 'TRAINING', 'sm');
}

const ko0 = H.ko, tick0 = H.tick;
H.ko = o => {
  const cfg = Fi.fight.cfg;
  if (!(cfg && cfg.dummy)) return ko0(o);
  E.after(1.8, () => {                            // beaten, it picks itself up as good as new
    if (Fi.fight.cfg !== cfg || E.P2 !== o) return;
    Object.assign(o, { ko: false, hp: o.max, state: 'up', stun: .3, inv: .4 });
    V.ring(o.x, 150, 240, '#b79bff', .4); sfx.land();
    E.fx.push({ k: 2, x: o.x, y: 400, n: 'RESET', col: '#b79bff', t: 0, life: 1 });
  });
  return true;
};
H.tick = dt => {
  tick0(dt);
  const o = E.P2, cfg = Fi.fight.cfg;             // left alone for a moment it heals, so every combo starts on a full bar
  if (!(cfg && cfg.dummy)) return;
  if (!o.ko && o.lastHit > 2.5 && o.hp < o.max) o.hp = Math.min(o.max, o.hp + o.max * dt);
  JU.tech.charge(100);                            // and the awakening, or the domain, is always ready in here: nothing has to be earned first
};

// domains that wait on a cooldown instead of a bar ask this before starting one
JU.training = { start, get on() { const c = Fi.fight.cfg; return !!(c && c.dummy); } };
})();
