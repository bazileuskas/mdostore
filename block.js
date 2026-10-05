/* JUJUTSU UNLIMITEDS — Combat Update 4: the block. Hold F and his guard is up.
   An ordinary blow that lands on it from the front does nothing at all. A heavy one (anything that would have thrown him into the air, or
   that hits for 16 or more) goes through: his guard is broken, he takes half of it, he keeps his feet, and for two seconds he cannot block.
   Behind it he can walk, slowly, and nothing else: no strikes, no moves, no dash, no jump until the key is let go. Something that comes from
   behind him, a sure-hit, or a blade nothing stops is not blocked at all */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, keys = E.keys;
const { lerp } = E;
const GUARD = [-.05, .1, 2.34, 1.98, .46, -.46, 0];         // both arms up in front of his face, feet set
const SLOW = .35, BREAK_T = 2, SOFT = .5, HEAVY = 16;        // how fast he walks behind it; how long it is gone once broken; the share of a heavy blow that gets through; and how hard a blow has to be to count as one
const HELD = new Set(['m1', 'strikes', 'crush', 'div', 'manji', 'dash', 'jump']);      // what he cannot do while it is up
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };

let up = false, broken = 0, slide = 0, lastAt = -9, brokeAt = -9;      // is it up; seconds until it can be again; what a blocked blow pushed him back by; when it last stopped something; when it last gave
const want = () => keys.has('f') || keys.has('hold:block');
const can = p => !p.move && !p.ps && !p.dead && !(p.dashT > 0) && broken <= 0 && !Fi.fight.paused;
const frozen = () => E.root.classList.contains('dom');      // a domain opening, a trial, a cutscene over the fight: the keys belong to that

/* ---------- holding it ---------- */
const pre0 = H.playerPre;
H.playerPre = (p, o, dt) => {
  if (broken > 0) broken -= dt;
  if (pre0(p, o, dt)) { up = false; return true; }           // knocked about: there is no guard to speak of
  up = want() && can(p);
  if (!up) { slide = 0; return false; }
  const dir = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
  if (!o.ko) p.face = o.x >= p.x ? 1 : -1;                    // he keeps it between himself and whatever he is fighting
  p.vx = p.ground ? dir * 360 * SLOW + slide : lerp(p.vx, dir * 360 * SLOW, 1 - Math.exp(-dt * 5));
  slide *= Math.exp(-dt * 9);
  p.target = GUARD; p.rate = 30;
  return true;                                               // and that is all he does
};
const press0 = H.press;
H.press = (a, inScene) => {
  if (!inScene && HELD.has(a) && want() && can(E.P1) && !frozen()) return true;      // the key does nothing: his hands are busy
  return press0 ? press0(a, inScene) : false;
};

/* ---------- a blow arriving ---------- */
const guard0 = H.guard;
H.guard = (face, a, mul = 1) => {
  if (guard0 && guard0(face, a, mul)) return true;
  const p = E.P1, now = E.T;
  if (now - lastAt < .22) return true;                       // the same blow, still arriving: it has been dealt with
  if (!up || p.face !== -face || a.pierce || a.dmg >= 9000) return false;      // not behind it, or it came from behind him, or nothing stops it
  const x = p.x - face * 52, y = p.y + 205;
  lastAt = now;
  if (!a.lift && a.dmg < HEAVY) {                            // stopped
    slide = face * Math.min(300, (a.kb || 200) * .4);
    sfx.block(); E.stop(.05); cam.shake = Math.max(cam.shake, 6);
    E.addSpark(x, y, '#dff3ff', 90); V.ring(x, y, 120, '#bfe6ff', .18); V.sparks(x, y, 'white', 5);
    E.fx.push({ k: 2, x: p.x, y: p.y + 330, n: 'BLOCK', col: '#bfe6ff', t: 0, life: .5 });
    return true;
  }
  const dmg = Math.round(a.dmg * mul * (H.foePower ? H.foePower(a) : 1) * SOFT);      // it goes through
  up = false; broken = BREAK_T; brokeAt = now; slide = 0;
  p.inv = Math.max(p.inv, .3);                               // (the rest of the same swing does not get a second go at him)
  p.ps = 'hurt'; p.stun = .6; p.vx = face * (a.kb || 300) * .6; p.flash = .1;
  sfx.guardBreak(); E.stop(.1); cam.shake = Math.max(cam.shake, 16);
  V.ring(x, y, 230, '#ff5a6e', .3); V.sparks(x, y, 'red', 12); E.addSpark(x, y, '#ff5a6e', 130);
  E.fx.push({ k: 2, x: p.x, y: p.y + 360, n: 'GUARD BROKEN', col: '#ff5a6e', t: 0, life: 1 });
  Fi.chip(dmg, '#ffb37a');
  return true;
};

/* ---------- what it looks like ---------- */
const fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
H.fx = dt => {
  fx0(dt);
  const p = E.P1;
  if (p.dead) return;
  if (up) {                                                  // the guard: two arcs of light in front of his arms, brighter for a moment when something lands on them
    const f = p.face, c = F(p.x + f * 30, p.y + 208), k = c[2], hot = Math.max(0, 1 - (E.T - lastAt) / .22);
    g.save(); g.translate(c[0], c[1]); g.scale(f, 1);
    lit(() => {
      g.lineCap = 'round';
      for (const [r, w, a] of [[84, 7, .26], [68, 3, .2]]) { g.strokeStyle = `rgba(190,225,255,${a + .55 * hot + .05 * Math.sin(E.T * 9)})`; g.lineWidth = w * k; g.beginPath(); g.arc(0, 0, r * k * (1 + .08 * hot), -1.05, 1.05); g.stroke(); }
      if (hot > 0) E.glow(E.GLOW.white, 70 * k, 0, 300 * k * hot, .7 * hot);
    });
    g.restore();
  }
  if (broken > 0) {                                          // broken: a bar over his head that fills as it comes back
    const c = F(p.x, p.y + 318), k = c[2], w = 74 * k, u = 1 - broken / BREAK_T;
    g.fillStyle = 'rgba(8,6,14,.75)'; g.fillRect(c[0] - w - 2, c[1] - 2, w * 2 + 4, 7 * k + 4);
    g.fillStyle = '#ff5a6e'; g.fillRect(c[0] - w, c[1], w * 2 * u, 7 * k);
    g.font = `${Math.round(15 * k)}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.lineJoin = 'round';
    g.lineWidth = 4 * k; g.strokeStyle = '#07060c'; g.strokeText('GUARD', c[0], c[1] - 4 * k); g.fillStyle = '#ff9aa6'; g.fillText('GUARD', c[0], c[1] - 4 * k);
  }
};
const clear = () => { up = false; broken = slide = 0; lastAt = brokeAt = -9; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { if (!wave) clear(); start0(cfg, wave); };

JU.block = { GUARD, BREAK_T, HEAVY, SOFT, get state() { return { up, broken: +Math.max(0, broken).toFixed(2), slide: Math.round(slide) }; } };
})();
