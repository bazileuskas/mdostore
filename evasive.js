/* JUJUTSU UNLIMITEDS — Build 0.12: the Evasive, and the Broken Limb.
   THE EVASIVE is everybody's. Thrown up by an uppercut, driven down by a slam, or lying where one has left him: Q (or Dash) gets him out of it
   at once, with no stun, a moment in which nothing touches him, and a dash. Then it takes twenty seconds to come back (the line along the top
   of the Dash slot). Whatever he is fighting has one too, and can use it to get out of a blow it sees coming (JU.evasive.foe).
   A BROKEN LIMB (B L) is what Ratio Man's blade and kick leave behind (ratio.js). For six seconds from the latest stack whoever has it cannot
   block, dash or use their Evasive, and their blows do 40% less; every stack after the first takes 40% off what is left (up to five: Collapsed
   Fist leaves three at once, or five). In a duel it is sent with the
   blow, like bleeding, and whoever has it takes it off his own blows (so it is never taken off twice) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, keys = E.keys;
const { clamp } = E;
const EV_CD = 20, EV_T = .2, EV_V = 1300, EV_INV = .6, EV_AWAY = 360;      // how long it takes to come back; the dash it is (seconds, speed); how long nothing touches him; how far a foe's takes it
const BL_T = 6, BL_MAX = 5, BL_CUT = .6;            // a Broken Limb: how long from the latest stack; how many stacks there can be; and what each leaves of a blow
const CYAN = '#7fe9ff', BLC = '#ff8a3d', COLD = E.flat('#2f9fc8', '#8af0ff');      // (what an afterimage of it is drawn in)
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const say = (f, text, col, life, up) => E.fx.push({ k: 2, x: f.x, y: f.y + up * (f.scale || 1), n: text, col, t: 0, life });

/* ================= the Broken Limb ================= */
const limbed = f => !!(f && f.limb && f.limb.t > 0);
const stacks = f => (limbed(f) ? f.limb.n : 0);
const cut = f => Math.pow(BL_CUT, stacks(f));      // what is left of a blow thrown by somebody who has it
function limb(f, n = 1) {
  if (!f || f.ko || f.dead || !(n > 0)) return;
  const b = limbed(f) ? f.limb : (f.limb = { n: 0, t: 0, hot: 0 });
  b.n = Math.min(BL_MAX, b.n + n); b.t = BL_T; b.hot = .4;
  sfx.snap();
  say(f, b.n > 1 ? 'BROKEN LIMB  ×' + b.n : 'BROKEN LIMB', BLC, 1.1, 360);
  const w = E.hand(f, true);
  V.sparks(w[0], w[1], 'fire', 6); V.ring(w[0], w[1], 80, BLC, .22); V.slash(w[0], w[1], 1.1, 90, BLC, 6); V.slash(w[0], w[1], -.6, 70, '#ffffff', 4);
}

/* ================= the Evasive ================= */
let evT = 0, slammed = false, nagAt = -9, shown = '';      // seconds until it is back; whether what has hold of him is a slam's; when he was last told he cannot; what the Dash slot last showed
const knocked = p => p.ps === 'air' || p.ps === 'down' || (p.ps === 'hurt' && slammed);
const ready = p => !p.dead && knocked(p) && evT <= 0 && !limbed(p) && !Fi.fight.paused;
// where somebody was, left behind in a cold colour and fading
function ghost(f, life = .4, pose) {
  const s = { skin: COLD, x: f.x, y: f.y, z: f.z, face: f.face, spin: 1, scale: f.scale, pose: (pose || f.pose).slice() };
  V.custom(life, u => E.drawFighter(s, .6 * (1 - u)), 0, true);
  return s;
}
function evade(p) {
  const o = E.P2, dir = ((keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0)) || (p.x >= o.x ? 1 : -1);      // whichever way he is pushing, or away
  ghost(p);
  if (p.move) E.endMove(p);
  p.ps = null; p.stun = 0; p.flash = 0; slammed = false;
  p.inv = Math.max(p.inv || 0, EV_INV);
  p.dashT = EV_T; p.dashV = EV_V; p.dashTint = 1; p.dashDir = dir; p.face = dir; p.ghostT = 0;      // (the engine's dash from here: blue frames behind him)
  if (!p.ground) p.vy = Math.max(p.vy, 380);         // out of the air: a kick off nothing, and down on his feet
  evT = EV_CD;
  sfx.evade(); cam.shake = Math.max(cam.shake, 6);
  say(p, 'EVASIVE', CYAN, .9, 340);
  V.ring(p.x, p.y + 160, 170, CYAN, .3); V.sparks(p.x, p.y + 160, 'white', 6); E.addDust(p.x);
  paint();
}
// a foe's: out from under what is coming, along the floor. chance: how likely it is to see it in time. True if it went (not while it is
// bound: the Chain of a Thousand Miles' Whip, tools.js)
function foe(o, chance = .5) {
  if (!o || o !== E.P2 || o.ko || duel() || limbed(o) || o.alpha < 1 || o.noEvade > E.T || (o.evAt !== undefined && E.T - o.evAt < EV_CD) || !(Math.random() < chance)) return false;
  const p = E.P1, x0 = o.x, away = Math.sign(o.x - p.x) || 1, x1 = clamp(o.x + away * EV_AWAY, -940, 940);
  o.evAt = E.T;
  ghost(o, .45);
  for (let i = 1; i <= 3; i++) { o.x = x0 + (x1 - x0) * i / 4; ghost(o, .2 + i * .06, POSE.dash); }      // the streak it leaves
  Object.assign(o, { x: x1, y: 0, vy: 0, vx: 0, ground: true, bounced: false, state: 'idle', stun: 0, inv: .5, act: null, tele: 0, face: p.x >= x1 ? 1 : -1 });
  if (o.ai) o.ai.t = Math.max(o.ai.t || 0, .45);
  sfx.evade();
  say(o, 'EVASIVE', CYAN, .9, 300);
  V.ring(x1, 160, 170, CYAN, .3); E.addDust(x1);
  return true;
}

/* ================= on screen ================= */
// the Dash slot: a line along its top that empties when the Evasive is used and fills again; lit when there is something to get out of
const slot = E.hud.mv.dash, bar = document.createElement('i');
bar.className = 'ev'; bar.setAttribute('aria-hidden', 'true');
if (slot) slot.appendChild(bar);
function paint() {
  const p = E.P1, v = Math.round((1 - evT / EV_CD) * 50) / 50, now = v + '|' + (ready(p) ? 1 : 0) + (limbed(p) ? 1 : 0);
  if (now === shown || !slot) return;
  shown = now;
  bar.style.setProperty('--ev', v); bar.classList.toggle('low', v < 1);
  slot.classList.toggle('evo', ready(p)); slot.classList.toggle('lim', limbed(p));
}
// over whoever has a Broken Limb: what it is, how many, and how long it has left
function badge(f) {
  const b = f.limb, hs = f.scale || 1, c = F(f.x - f.face * 66 * hs, f.y + 262 * hs), k = c[2], w = 52 * k, h = 22 * k, x = c[0] - w / 2, y = c[1] - h / 2, pop = 1 + .35 * Math.max(0, b.hot) / .4;
  g.save(); g.translate(c[0], c[1]); g.scale(pop, pop); g.translate(-c[0], -c[1]);
  g.fillStyle = 'rgba(8,6,14,.82)'; g.strokeStyle = BLC; g.lineWidth = 2 * k;
  g.beginPath(); g.roundRect(x, y, w, h, 5 * k); g.fill(); g.stroke();
  g.font = `${Math.round(15 * k)}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = BLC;
  g.fillText(b.n > 1 ? 'B L ×' + b.n : 'B L', c[0], c[1] + k);
  g.fillStyle = 'rgba(255,138,61,.35)'; g.fillRect(x, y + h + 3 * k, w, 3 * k);
  g.fillStyle = BLC; g.fillRect(x, y + h + 3 * k, w * Math.max(0, b.t / BL_T), 3 * k);
  g.restore();
}
// knocked about, with it ready: say so, small, under the line where his name would be
function prompt(p) {
  const c = F(p.x, p.y + (p.ps === 'down' ? 150 : 330)), k = c[2], a = .65 + .35 * Math.sin(E.T * 12);
  g.save(); g.globalAlpha = a; g.font = `${Math.round(17 * k)}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const t = document.documentElement.classList.contains('touch') ? 'DASH · EVASIVE' : 'Q · EVASIVE';
  g.lineWidth = 4 * k; g.strokeStyle = '#07060c'; g.strokeText(t, c[0], c[1]); g.fillStyle = CYAN; g.fillText(t, c[0], c[1]);
  g.restore();
}

/* ================= wiring ================= */
const press0 = H.press, struck0 = H.struck, hit0 = H.hit, pow0 = H.power, fpow0 = H.foePower, ban0 = H.kitBan, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
H.press = (a, inScene) => {
  if (!inScene && a === 'dash') {
    const p = E.P1;
    if (ready(p)) { evade(p); return true; }
    if (limbed(p) && !p.dead) { if (E.T - nagAt > .7) { nagAt = E.T; say(p, 'BROKEN LIMB · NO DASH', BLC, .8, 380); } return true; }      // no dash, and no Evasive either
  }
  return press0 ? press0(a, inScene) : false;
};
H.struck = (p, face, a, dmg) => { if (struck0) struck0(p, face, a, dmg); slammed = !!(a.lift || (a.stun || 0) >= .8); };      // (an uppercut throws him; a slam's weight is in how long it holds him)
H.noGuard = p => limbed(p);                         // block.js: the guard does not go up
H.limbed = n => limb(E.P1, n);                      // pvp.js: a duel's blow that left me with one
H.kitBan = (o, m) => (ban0 ? ban0(o, m) : false) || (limbed(o) && !!(m.dash || m.pre === 'dash'));      // boss.js, foes.js: nothing it dashes in with
H.hit = (o, face, h) => { hit0(o, face, h); if (h.limb && o === E.P2) limb(o, h.limb); };
H.power = (h, o) => (pow0 ? pow0(h, o) : 1) * cut(E.P1);      // his own blows, with it
H.foePower = a => (fpow0 ? fpow0(a) : 1) * (duel() ? 1 : cut(E.P2));      // its, with it (a duel's come already cut)
H.tick = dt => {
  tick0(dt);
  if (evT > 0) evT = Math.max(0, evT - dt);
  const p = E.P1;
  if (!p.ps) slammed = false;
  for (const f of [p, E.P2]) {
    const b = f.limb;
    if (!b) continue;
    b.hot -= dt;
    if ((b.t -= dt) <= 0 || f.ko || f.dead) f.limb = null;
  }
  paint();
};
H.fx = dt => {
  fx0(dt);
  for (const f of [E.P2, E.P1]) if (limbed(f) && !(f.alpha < .05)) badge(f);
  const p = E.P1;
  if (ready(p) && E.root.dataset.mode === 'fight') prompt(p);
};
H.reset = () => { reset0(); evT = 0; slammed = false; paint(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) evT = 0; slammed = false; paint(); };

JU.evasive = { foe, limb, limbed, stacks, cut, ghost, EV_CD, BL_T, BL_MAX, BL_CUT,
  get cd() { return +evT.toFixed(2); }, set cd(v) { evT = clamp(+v || 0, 0, EV_CD); paint(); }, get ready() { return ready(E.P1); }, get slammed() { return slammed; } };
})();
