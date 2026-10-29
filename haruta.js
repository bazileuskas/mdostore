/* JUJUTSU UNLIMITEDS — Build 0.11 (early access until 0.17v1, then 5% on the talisman): MIRACLE DORK. Miracles: the luck of somebody who has never had any, saved up for the moment
   it is wanted. He fights with a sword: a pink grip and a gold blade.
   1 Rush: a dash, and the sword through whatever is at the end of it. 60, and blood. The wet sounds are sounds/gore-splat1..3.mp3, from
     "8 wet squish, slurp impacts" by Independent.nu (OpenGameArt, CC0: free to use, here and online).
   2 Sword Play: the sword thrown, end over end. Whatever it hits is ragdolled, 40. 2 again: it comes back to his hand, through whatever is
     in the way, 40 more. The throw has a sound of its own, and the return is that sound backwards (index.html, sfx.blade).
     While it is away his strikes are punches, slower and steady, and every third one that lands is a miracle; and 1 is Lucky Cut, which if
     it lands is an uppercut: 50, a stack of bleeding (the same bleeding as the Vengeful Artist's Broil), and 30 more as it bleeds.
   3 Bastards Qusion (0.15v1): a quick barrage, with the sword or (while it is away) his fists, 70 in all, and the last of it sends them
     flying on. A TUT MIRACLE DORK COMBO: while they are still on their way (or lying where they came down), the sword coming back to his
     hand hooks them and brings them back with it, 60 instead of 40; and a Lucky Cut straight after that (1, sword or no sword) is 20
     harder and leaves five stacks of bleeding.
   4 Backstab (0.17v1): round behind them, and the sword into their back. Pulled out, 40 and two stacks of bleeding; then he throws them,
     50, and there is a great deal of blood. It needs the sword in his hand.
   E (0.17v1): the sword thrown, and if it lands it does Bastards Qusion on its own, round and round them, 80 in all; then it comes back.
     (Until 0.17v1 E dropped it in the floor to be pushed about with Z and X.)
   HIS AWAKENING (0.17v1, the user's, never in a duel: too much): a Backstab that misses (or that they block, or see coming), and then a
     Sword Play thrown inside six seconds, which they dodge. Then it is all speech, manga-lettered (manga.js): "I thought" ... "I cut you
     there." ... (a sigh) ... "I guess I'll try just a little harder." And then six miracles at once, and two moves:
     1 Dirty Stab: an uppercut with the sword, 40 and five stacks of bleeding. Used again, once its wait is over: an instant kill.
     2 My Death: the sword into himself. He falls; it gets up on its own and goes for them, and if Dirty Stab has landed, it kills them
       where they stand (and he is still dead, but it is a win). If it has not, it only cuts them, and he stays dead.
   MIRACLES, the passive: six triangles under his health bar. A blow that would kill him spends them instead: the harder it is the more (one
   to five), and he lives through it with a quarter of his health. Not enough of them for that blow, and it kills him */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, M = E.MOVES, C = JU.cut, Z = JU.bossfx, Fi = JU.fights;
const { rnd, clamp, ease } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk, VA = JU.vengeful, FX = VA.fx;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const exact = (o, n) => n / (o.dr || 1);            // a hit worth the stated amount, whatever the target is made of
const gore = () => JU.gore !== false;
const PINK = '#ff7ab6', PINKD = '#b8487e', GOLDB = '#ffd86b', GOLDD = '#b8892a', GRGB = '255,216,107';
const RUSH = 60, THROWN = 40, BACK = 40, LUCKY = 50, LUCKY_BLEED = 30, MAXM = 6, HEAL = .25;      // what each thing does; how many miracles he can hold; and what one leaves him with
const BQ = [7, 10], BQ_CD = 8, DRAG = 60, COMBO_DMG = 20, COMBO_BLEED = 5, HOOK_T = 3.5, COMBO_T = 3;      // Bastards Qusion: its hits and each one's; its wait; the sword bringing them back; the combo's Lucky Cut, harder, and its bleeding; how long after the barrage the sword can hook them; and after that, for the Lucky Cut
const SPLATS = ['gore-splat1', 'gore-splat2', 'gore-splat3'];
const STAB = [40, 50], STAB_CD = 9, FAIL_T = 6, SOLO_N = 8, SOLO_DMG = 10, E_CD = 14, DIRTY_DMG = 40, DIRTY_BLEED = 5, DIRTY_CD = 7;      // Backstab's pull and throw; its wait; how long after a miss Sword Play is dodged; E's cuts and each one's; E's wait; Dirty Stab
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const lerp = (a, b, u) => a + (b - a) * u;

/* ================= how he looks: blond and all over the place, a brown hoodie over a pink shirt, and the face of somebody things happen to ================= */
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.min(255, (n >> 16) * f) | 0},${Math.min(255, (n >> 8 & 255) * f) | 0},${Math.min(255, (n & 255) * f) | 0})`; };
function poly(fill, pts) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
}
const seg = (...p) => { g.beginPath(); for (let i = 0; i < p.length; i += 4) { g.moveTo(p[i], p[i + 1]); g.lineTo(p[i + 2], p[i + 3]); } g.stroke(); };
const SKIN = ['#efd2b8', '#fbe2cc'], HOOD = ['#3a2f28', '#4b3d33'], JEANS = ['#2b3346', '#36405a'], KICKS = ['#d9d6cf', '#ffffff'], BLOND = '#f2d56b', BLOND2 = '#d9b544';
const HARUTA = {
  torso: HOOD,
  armF: [HOOD[0], HOOD[1], SKIN[0], SKIN[1], .2], armB: [shade(HOOD[0], .62), shade(HOOD[1], .62), shade(SKIN[0], .78), shade(SKIN[1], .78), .2],
  legF: [JEANS[0], JEANS[1], KICKS[0], KICKS[1], .17], legB: [shade(JEANS[0], .62), shade(JEANS[1], .62), shade(KICKS[0], .72), shade(KICKS[1], .72), .17],
  chest() {                                         // the hoodie open over a pink shirt, the hood down his back, and its strings
    g.fillStyle = PINK; g.fillRect(6, -TOR, 20, TOR + 5);
    g.fillStyle = PINKD; g.fillRect(6, -TOR, 4, TOR + 5);
    g.fillStyle = '#2e251f'; g.fillRect(-30, -TOR, 34, 10);
    g.strokeStyle = '#e9e6df'; g.lineWidth = 2; seg(14, -TOR + 2, 12, -TOR + 26, 22, -TOR + 2, 24, -TOR + 24);
  },
  head() {
    E.headBase(SKIN[0], SKIN[1]);
    poly(BLOND, [-27, 6, -29, -18, -20, -30, -4, -34, 14, -32, 26, -24, 28, -10, 22, -14, 18, -6, 12, -14, 6, -6, 0, -14, -6, -5, -12, -13, -18, -3, -22, 8]);      // blond, and everywhere
    poly(BLOND2, [-10, -30, -2, -42, 4, -30]);                                                                                // and the bit that will not lie down
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(6, 1, 3.6, 3.4, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(18, 1, 3.2, 3.4, 0, 0, TAU); g.fill();
    g.fillStyle = LINE; g.beginPath(); g.arc(7, 1.4, 1.7, 0, TAU); g.fill(); g.beginPath(); g.arc(18.6, 1.4, 1.6, 0, TAU); g.fill();   // big round eyes, a little lost
    g.strokeStyle = LINE; g.lineCap = 'round'; g.lineWidth = 2; seg(1, -5, 9, -6.5, 14, -6.5, 22, -5);
    g.beginPath(); g.moveTo(9, 14); g.quadraticCurveTo(14, 18.5, 19, 14); g.stroke(); g.lineCap = 'butt';                     // a wide, hopeful mouth
    g.fillStyle = 'rgba(255,120,150,.35)'; g.beginPath(); g.ellipse(3, 9, 3, 1.8, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(21, 9, 2.6, 1.8, 0, 0, TAU); g.fill();
  }
};

/* ================= the sword ================= */
// In his front hand, along the arm: the grip behind his fist, the guard, and the blade out in front. L along it from the hand, v across it
let held = true, blade = null;                      // is it in his hand; and if not, where it is: { x, y, f, ang, phase: 'out' | 'drop' | 'stuck' | 'back', ... }
function grip(f) {
  const a = f.pose[2] - f.pose[6], w = E.hand(f, true), dx = Math.sin(a) * f.face * (f.spin === undefined ? 1 : f.spin), dy = -Math.cos(a);
  return { dx, dy, at: (L, v = 0) => [w[0] + dx * L - dy * v, w[1] + dy * L + dx * v] };
}
// the sword itself, drawn along whatever line it is on: pt(L, v) is where a point of it is on the screen, k how big
function sword(pt, k) {
  const rod = (L0, L1, wd, col) => { const a = pt(L0, 0), b = pt(L1, 0); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.strokeStyle = LINE; g.lineWidth = (wd + 4) * k; g.stroke(); g.strokeStyle = col; g.lineWidth = wd * k; g.stroke(); };
  const shape = (pts, fill) => { g.beginPath(); pts.forEach(([L, v], i) => { const c = pt(L, v); if (i) g.lineTo(c[0], c[1]); else g.moveTo(c[0], c[1]); }); g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5 * k; g.strokeStyle = LINE; g.stroke(); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  rod(-28, 12, 9, PINK);                            // the grip, pink
  g.strokeStyle = PINKD; g.lineWidth = 2 * k; g.beginPath();
  for (let L = -22; L < 10; L += 7) { const a = pt(L, -4), b = pt(L + 4, 4); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }      // the wrap
  g.stroke();
  shape([[11, -15], [17, -15], [17, 15], [11, 15]], GOLDD);       // the guard
  shape([[17, -6], [152, -5.5], [172, 0], [152, 5.5], [17, 6]], GOLDB);      // and the blade, gold
  const e0 = pt(20, -2.5), e1 = pt(158, -2), m0 = pt(20, 1.5), m1 = pt(148, 1.5);
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(e0[0], e0[1]); g.lineTo(e1[0], e1[1]); g.stroke();     // its edge, catching the light
  g.strokeStyle = 'rgba(150,100,20,.55)'; g.lineWidth = 1.4 * k; g.beginPath(); g.moveTo(m0[0], m0[1]); g.lineTo(m1[0], m1[1]); g.stroke();
  g.lineCap = 'butt';
}
function drawHeld(f) { const s = grip(f), pt = (L, v) => F(...s.at(L, v)); sword(pt, pt(0, 0)[2]); }
function drawLoose() {                              // in the air, or in the floor
  const b = blade, c = F(b.x, b.y), k = c[2], ca = Math.cos(b.ang), sa = Math.sin(b.ang);
  sword((L, v) => { const L0 = L - 70; return [c[0] + (L0 * ca - v * sa) * k, c[1] + (L0 * sa + v * ca) * k]; }, k);
  if (b.phase === 'out' || b.phase === 'back') {    // and the circle it cuts as it turns
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(${GRGB},.35)`; g.lineWidth = 6 * k;
    g.beginPath(); g.arc(c[0], c[1], 92 * k, b.ang, b.ang + 2.2); g.stroke(); g.restore();
  }
}
const relabel = () => { const b = E.hud.mv.strikes && E.hud.mv.strikes.querySelector('b'); if (b && on()) b.textContent = held ? MOVES.strikes.name : 'Lucky Cut'; };
function throwSword(p) {
  const w = E.hand(p, true);
  blade = { x: w[0] + p.face * 50, y: w[1], f: p.face, ang: 0, phase: 'out', x0: w[0], t: 0, vy: 0, hitOut: false, hitBack: false };
  held = false; relabel(); sfx.blade(false);
}
function recall() {                                 // 2 again: back to his hand
  if (!blade || blade.phase === 'back') return;
  blade.phase = 'back'; blade.hitBack = false; sfx.blade(true);
  const o = E.P2;
  if (hook && hook.o === o && E.T - hook.at < HOOK_T && !o.ko) blade.via = o;      // what Bastards Qusion sent flying: the sword goes by way of them, wherever they are
  if (Z) Z.flare(blade.x, blade.y, GRGB, 180, .12);
}
function bladeHit(o, f, dmg) {                      // what the sword does to whatever it goes through, either way
  const hs = o.scale || 1, x = o.x, y = o.y + 165 * hs;
  E.applyHit(o, f, { dmg: exact(o, dmg), kb: 900, lift: 520, stun: .9, stop: .12, heavy: 1, col: GOLDB, fixed: 1, mute: 1, flung: 1 });      // (flung: it goes end over end: vengeful.js)
  sfx.splatter(); shake(18);
  V.slash(x, y, rnd(-.5, .5), 320, GOLDB, 12); V.sparks(x, y, 'gold', 10);
  FX.gush(x, y, f, 16, 1.1); FX.splash(x, y, f, 4, .9); FX.pool(o.x, 140);
  FX.pop(x, y + 150, 'ザンッ', 54);
}
function flyBlade(dt) {
  const b = blade, o = E.P2, hs = o.scale || 1;
  b.t += dt;
  const live = !o.ko && !(o.alpha < 1) && o.state !== 'down' && o.state !== 'up';
  if (b.phase === 'out') {
    b.x += b.f * 1900 * dt; b.ang += 26 * dt;
    if (live) b.y += (o.y + 165 * hs - b.y) * Math.min(1, dt * 6);
    if (!b.hitOut && live && Math.abs(b.x - o.x) < 60 * hs && Math.abs(b.y - (o.y + 165 * hs)) < 150 * hs) {
      b.hitOut = true;
      if (b.dodge) dodge(o, b);                     // after a Backstab that missed: they see this one coming too
      else if (b.solo) Object.assign(b, { phase: 'solo', o, t: 0, n: -1 });
      else { bladeHit(o, b.f, THROWN); b.phase = 'drop'; b.vy = 400; }
    }
    else if (Math.abs(b.x - b.x0) > 950 || Math.abs(b.x) > 1000) { b.phase = 'drop'; b.vy = 100; }
  } else if (b.phase === 'drop') {                  // off whatever it hit, and down into the floor point first
    b.vy -= 2600 * dt; b.y += b.vy * dt; b.x = clamp(b.x + b.f * 160 * dt, -1000, 1000); b.ang += 18 * dt;
    if (b.y <= 70) { b.y = 70; b.phase = 'stuck'; b.ang = b.f > 0 ? 1.9 : 1.24; E.addDust(b.x); V.rocks(b.x, 0, 4); sfx.land(); }
  } else if (b.phase === 'solo') soloCut(b, dt);
  else if (b.phase === 'auto') selfMove(b, dt);
  else if (b.phase === 'back') {                  // back to his hand, through anything in the way (and first by way of whatever Bastards Qusion sent flying)
    const p = E.P1, v = b.via && b.via === E.P2 && !b.via.ko ? b.via : null, w = v ? [v.x, v.y + 165 * (v.scale || 1)] : E.hand(p, true);
    const dx = w[0] - b.x, dy = w[1] - b.y, d = Math.hypot(dx, dy) || 1, step = Math.min(d, 2400 * dt), x0 = b.x;
    b.x += dx / d * step; b.y += dy / d * step; b.ang -= 26 * dt;
    if (v) { if (d < 70) { b.via = null; b.hitBack = true; drag(v, p.x >= v.x ? 1 : -1); } return; }      // through them, and they come back along with it
    b.via = null;
    const f = Math.sign(b.x - x0) || 1;
    const hooked = !!hook && hook.o === o && E.T - hook.at < HOOK_T && !o.ko && !(o.alpha < 1);      // sent flying by Bastards Qusion (lying where they came down counts)
    if (!b.hitBack && (live || hooked) && (o.x - x0) * (o.x - b.x) <= 0 && Math.abs(b.y - (o.y + 165 * hs)) < 170 * hs) { b.hitBack = true; if (hooked) drag(o, f); else bladeHit(o, f, BACK); }
    if (d < 50 && !E.P1.dying) { blade = null; held = true; relabel(); sfx.cut(.8); V.sparks(w[0], w[1], 'gold', 6); }
  }
}

// E: the sword thrown, and if it lands, Bastards Qusion on its own; E again (or 2) while it is away, and it comes back
let eCd = 0;
function espPress(p) {
  if (blade) { if (blade.phase !== 'solo' && blade.phase !== 'auto') recall(); return true; }
  if (eCd > 0) { sfx.back(); return true; }
  if (!held || ult || p.move || p.ps || p.dead || p.dashT > 0) return true;
  throwSword(p); blade.solo = true; eCd = E_CD;
  shout(p, 'バスタード', PINK);
  return true;
}
function soloCut(b, dt) {                           // round and round them, cutting, with nobody holding it
  const o = b.o, hs = o.scale || 1, n = Math.floor(b.t / .09), a = b.t * 13;
  if (o.ko || o !== E.P2 || o.alpha < 1) { b.phase = 'back'; b.hitBack = true; sfx.blade(true); return; }
  b.x = o.x + Math.cos(a) * 115 * hs; b.y = o.y + 165 * hs + Math.sin(a) * 90 * hs; b.ang += 30 * dt;
  if (n === b.n || n >= SOLO_N) { if (n >= SOLO_N) { b.phase = 'back'; b.hitBack = true; sfx.blade(true); } return; }
  b.n = n;
  const last = n === SOLO_N - 1, f = Math.sign(o.x - b.x) || 1, x = o.x + rnd(-20, 20), y = o.y + 165 * hs + rnd(-50, 50);
  E.applyHit(o, f, { dmg: exact(o, SOLO_DMG), kb: last ? 1300 : 20, lift: last ? 520 : 0, stun: last ? .9 : .6, stop: last ? .12 : .025, heavy: last ? 1 : 0, col: n % 3 ? GOLDB : PINK, fixed: 1, mute: 1 });
  sfx.cut(.7 + Math.random() * .4); if (gore()) sfx.splat();
  V.slash(x, y, rnd(0, TAU), last ? 460 : rnd(220, 320), n % 3 ? GOLDB : PINK, last ? 13 : 7); V.sparks(x, y, 'gold', last ? 12 : 3);
  if (gore()) FX.splash(x, y, f, last ? 6 : 2, .7);
  if (last) { shake(24); E.zoomIn(.3); V.ring(o.x, o.y + 165 * hs, 260, PINK, .3); FX.pop(o.x, o.y + 335 * hs, 'ドカッ', 60, PINK); }
}

// the combo: the sword coming back has hooked them, and they come with it, to his feet. 60, and a Lucky Cut is open for three seconds
let hook = null, combo = null;                       // what Bastards Qusion sent flying, and when: { o, at }; the Lucky Cut's window: { o, t }
function drag(o, f) {
  const p = E.P1, hs = o.scale || 1, x = o.x, y = o.y + 165 * hs, d = Math.max(0, Math.abs(o.x - p.x) - 130);
  hook = null;
  E.applyHit(o, f, { dmg: exact(o, DRAG), kb: clamp(d / .5, 300, 1700), lift: 380, stun: .9, stop: .14, heavy: 1, col: GOLDB, fixed: 1, mute: 1 });      // (as far as it takes to land them at his feet)
  sfx.splatter(); shake(22); E.zoomIn(.25);
  V.slash(x, y, f > 0 ? 0 : Math.PI, 440, GOLDB, 12); V.sparks(x, y, 'gold', 12); FX.gush(x, y, f, 12, 1); FX.pop(x, y + 170, 'グイッ', 58, GOLDB);
  if (!o.ko) { combo = { o, t: COMBO_T }; E.fx.push({ k: 2, x: p.x, y: p.y + 420, n: '1 · LUCKY CUT', col: PINK, t: 0, life: 1.8 }); }
}

/* ================= his strikes: the sword's, or (while it is away) his fists ================= */
Object.assign(POSE, {
  haWindA: [0, 0, 2.6, .5, .3, -.35, 0],    haCutA: [.35, 0, 1, 1, .6, -.5, 0],
  haWindB: [.05, 0, .5, .4, .3, -.3, 0],    haCutB: [.3, 0, 2.2, .8, .55, -.5, 0],
  haWindC: [-.2, 0, 3, 1.5, .3, -.35, 0],   haCutC: [.55, .1, .9, 1.2, .9, -.7, 0],
  haCrouch: [-.2, 0, .6, .3, .5, -.6, 0],   haSweep: [.5, 0, 1.55, 1.2, .9, -.7, 0],
  haThrowWind: [-.2, 0, 3, 1, .3, -.35, 0], haThrow: [.4, 0, 1.4, .7, .6, -.5, 0]
});
const CUTS = [['haWindA', 'haCutA', 4], ['haWindB', 'haCutB', 4], ['haWindA', 'haCutA', 5], ['haWindC', 'haCutC', 7]].map(([pre, pose, dmg], i) =>
  Object.assign({}, M.m1[i], { pre, pose, kick: 0, ha: 1, sw: 'rgba(255,216,107,.95)', hit: Object.assign({}, M.m1[i].hit, { dmg, reach: M.m1[i].hit.reach + 45, col: GOLDB }) }));
// without the sword: punches. Slower, steady, the same every time, and nothing on the end of the chain to send anything flying
const FISTS = [['idle', 'jab'], ['jab', 'cross'], ['idle', 'jab'], ['jab', 'cross']].map(([pre, pose], i) =>
  Object.assign({}, M.m1[i], { pre, pose, kick: 0, ha: 1, fist: 1, dur: M.m1[0].dur * 1.3, strike: M.m1[0].strike * 1.4, lunge: 180, hit: { reach: 150, dmg: 6, kb: 150, stun: .42, stop: .05 } }));
function m1(i) {
  const p = E.P1;
  if (p.skin !== HARUTA) return true;               // in somebody else's body (a clan's): the ordinary strikes
  prime();
  p.move = { def: (held ? CUTS : FISTS)[i], i, t: 0 };
  return false;
}

/* ================= MIRACLES ================= */
let miracles = 0, punches = 0;
const row = document.createElement('div');          // under his health bar: six triangles, lit for each one he has
row.className = 'mir'; row.setAttribute('aria-label', 'Miracles');
row.innerHTML = Array.from({ length: MAXM }, () => '<i></i>').join('');
{ const bar = document.querySelector('.fb.p1'); if (bar) bar.appendChild(row); }
function paint(spent = 0) {
  row.classList.toggle('on', on());
  [...row.children].forEach((t, i) => { t.classList.toggle('full', i < miracles); t.classList.toggle('gone', i >= miracles && i < miracles + spent); });
  row.setAttribute('aria-label', `Miracles: ${miracles} of ${MAXM}`);
}
function gain(p) {
  if (miracles >= MAXM) return;
  miracles++; paint();
  sfx.tap(1);
  E.fx.push({ k: 2, x: p.x, y: p.y + 400, n: '+1 MIRACLE', col: GOLDB, t: 0, life: 1 });
  V.sparks(p.x, p.y + 330, 'gold', 8);
}
// a blow that would kill him: the harder it is the more it takes (a fifth of his health or less is one; most of it, five). Enough, and he
// lives through it with a quarter of his health. Not enough, and nothing is spent
function rescue(p, dmg) {
  if (!on() || p.dead || !(dmg > 0) || (Fi.fight.floor || 0) > 0 || p.hp - dmg > 0) return;
  const need = clamp(Math.ceil(dmg / (p.max * .2)), 1, 5);
  if (miracles < need) return;
  miracles -= need;
  p.hp = dmg + p.max * HEAL;                        // (so that when the blow has landed, this is what is left)
  paint(need);
  sfx.tap(1); sfx.confirm(); shake(20); E.stop(.12);
  if (Z) { Z.flash(GRGB, .3, .35); Z.flare(p.x, p.y + 200, GRGB, 520, .3); }
  V.ring(p.x, p.y + 180, 360, GOLDB, .45); V.sparks(p.x, p.y + 200, 'gold', 20);
  shout(p, '奇跡', GOLDB);
  E.fx.push({ k: 2, x: p.x, y: p.y + 470, n: 'MIRACLE  ×' + need, col: '#ffffff', t: 0, life: 1.6 });
}
const chip0 = Fi.chip;
Fi.chip = (dmg, col, shown) => { rescue(E.P1, dmg); return chip0(dmg, col, shown); };      // (bleeding, rot, a broken guard's half: these can kill too)

/* ================= Lucky Cut's bleeding: 30, a few at a time ================= */
const dots = [];
function bleedFor(o, total) { dots.push({ o, left: total, next: .3 }); }
function bleedTick(dt) {
  for (let i = dots.length - 1; i >= 0; i--) {
    const d = dots[i], o = d.o;
    if (o !== E.P2 || o.ko || d.left <= 0) { dots.splice(i, 1); continue; }
    if ((d.next -= dt) > 0) continue;
    d.next = .3;
    const n = Math.min(3, d.left), hs = o.scale || 1;
    d.left -= n;
    if (o.hp - n > 0) { o.hp -= n; o.flash = .05; E.addNum(o.x, o.y + 270 * hs, n, '#ff3b55'); }
    else E.applyHit(o, o.face || 1, { dmg: (o.hp + 1) / (o.dr || 1), kb: 40, stun: .3, stop: .04, col: '#ff3b55', fixed: 1, mute: 1 });      // (that was the last of it)
    if (gore() && Z) Z.emit(4, o.x + rnd(-20, 20), o.y + rnd(120, 220) * hs, rnd(-80, 80), rnd(0, 160), rnd(3, 5), 2, '179,18,44', { g: 1500, land: 'blood' });
  }
}

/* ================= the moves ================= */
const trail = [], TRAIL = E.flat(PINKD, PINK);      // Rush: him, a moment ago, pink
function rushHit(p, o) {
  const f = p.face, hs = o.scale || 1, x = o.x, y = o.y + 165 * hs;
  sfx.splatter(1.1); sfx.cut(1.4); shake(26); E.zoomIn(.35); E.stop(.08);
  V.slash(x, y, f > 0 ? -.15 : Math.PI + .15, 560, GOLDB, 16); V.slash(x, y + 10, f > 0 ? -.15 : Math.PI + .15, 600, '#ffffff', 6);
  V.sparks(x, y, 'gold', 14); V.ring(x, y, 240, PINK, .25);
  FX.gush(x, y, f, 26, 1.3); FX.gush(x, y, -f, 10, .9); FX.splash(x, y, f, 8, 1.1); FX.blood(x, y, f, 10); FX.pool(o.x, 200); FX.lens(2);
  FX.pop(x, y + 170, 'ズバァッ', 70);
}
const MOVES = {
  // 1 — Rush, with the sword. Without it: Lucky Cut
  strikes: { name: 'Rush', cd: 7, dur: 2, glow: 'gold', run(p, m, t) {
    const o = E.P2, f = p.face;
    if (m.kind === undefined) {
      m.kind = combo && combo.o === o && !o.ko ? 'combo' : held ? 'rush' : 'lucky';
      if (m.kind === 'combo') combo = null;
      sfx.charge(); shout(p, m.kind === 'rush' ? '突進' : '幸運', m.kind === 'rush' ? GOLDB : PINK);
    }
    p.rate = 50;
    if (m.kind === 'rush') {
      if (t < .1) { p.target = POSE.haCrouch; p.vx = 0; return; }
      if (t < .26) {
        p.target = POSE.haSweep; p.vx = f * 2300;
        if (!m.sw) { m.sw = 1; sfx.whoosh(); sfx.cut(1); }
        trail.push({ f: { skin: p.skin, x: p.x, y: p.y, z: p.z, face: p.face, spin: 1, scale: p.scale, pose: p.pose.slice(), alpha: 1 }, t: 0 });
        if (trail.length > 10) trail.shift();
        if (!m.done && E.tryHit(p, { reach: 210, dmg: exact(o, RUSH), kb: 520, lift: 260, stun: .9, stop: .16, heavy: 1, col: '#ff3b55', fixed: 1, mute: 1 })) { m.done = 1; rushHit(p, o); }
        return;
      }
      p.vx = 0; p.target = t < .45 ? POSE.haSweep : POSE.idle;
      if (t > .7) E.endMove(p);
      return;
    }
    // Lucky Cut: low, and up through it
    if (t < .13) { p.target = POSE.vaLow || POSE.crushWind; p.vx = 0; return; }
    p.target = t < .42 ? (POSE.vaRise || POSE.jump) : POSE.idle; p.vx = t < .22 ? f * 260 : 0;
    if (!m.sw) { m.sw = 1; sfx.whoosh(); V.slash(p.x + f * 110, p.y + 220, f > 0 ? 1.2 : Math.PI - 1.2, 380, PINK, 13); }
    const cb = m.kind === 'combo', hh = { reach: cb ? 230 : 175, dmg: exact(o, LUCKY + (cb ? COMBO_DMG : 0)), kb: 80, lift: 1100, stun: .9, stop: cb ? .2 : .12, heavy: 1, col: PINK, fixed: 1, mute: 1, bleed: cb ? COMBO_BLEED : 1 };
    let landed = false;
    if (!m.done && t < .3) {
      if (!cb) landed = E.tryHit(p, hh);
      else { const gap = (o.x - p.x) * f; if (gap > -60 && gap < hh.reach && Math.abs(o.y - p.y) < 220 && !o.ko && !(o.alpha < 1)) { E.applyHit(o, f, hh); landed = true; } }      // (the combo's scoops them up off the floor too)
    }
    if (landed) {
      m.done = 1;
      const hs = o.scale || 1, x = o.x, y = o.y + 165 * hs;
      sfx.splatter(); shake(22); E.zoomIn(.3);
      V.sparks(x, y, 'gold', 10); V.ring(x, y, 220, PINK, .25); FX.gush(x, y, f, 14, 1); FX.pop(x, y + 170, 'ラッキー', 56, PINK);
      if (!o.ko) { for (let i = cb ? COMBO_BLEED : 1; i > 0; i--) VA.wound(o); bleedFor(o, LUCKY_BLEED); }
      if (cb) {                                    // A TUT MIRACLE DORK COMBO
        E.banner('奇跡', 'A TUT MIRACLE DORK COMBO', 'xs'); sfx.tap(1); sfx.confirm(); E.zoomIn(.5); shake(30);
        V.ring(x, y, 420, GOLDB, .4); V.sparks(x, y, 'gold', 20); FX.gush(x, y, f, 24, 1.3); FX.blood(x, y, f, 12);
        if (Z) { Z.flash(GRGB, .25, .2); Z.flare(x, y, GRGB, 460, .25); }
      }
    }
    if (t > .62) E.endMove(p);
  } },
  // 2 — Sword Play: thrown. (2 again, while it is away, brings it back: that is taken in H.press)
  crush: { name: 'Sword Play', cd: 3, dur: .5, glow: 'gold', run(p, m, t) {
    p.vx = 0; p.rate = 50; p.target = t < .14 ? POSE.haThrowWind : t < .32 ? POSE.haThrow : POSE.idle;
    if (t < .14 || m.s) return;
    m.s = 1;
    if (!held) return;
    throwSword(p);
    if (failT > 0 && !duel() && !ult) { blade.dodge = true; failT = 0; }
  } },
  // 3 — Bastards Qusion: a quick barrage, with the sword or (while it is away) his fists, and the last of it sends them flying on
  div: { name: 'Bastards Qusion', cd: BQ_CD, dur: 1.2, glow: 'gold', run(p, m, t) {
    const o = E.P2, f = p.face, D = .075, gap = (o.x - p.x) * f;
    if (!m.s) { m.s = 1; m.sword = held; sfx.charge(); shout(p, 'バスタード', PINK); }
    p.rate = 52;
    if (t < .1) { p.target = POSE.haCrouch; p.vx = gap > 170 ? f * 1400 : 0; return; }
    const n = Math.floor((t - .1) / D);
    if (n < BQ[0]) {
      p.vx = gap > 190 ? f * 260 : 0;
      p.target = m.sword ? (n & 1 ? POSE.haCutB : POSE.haCutA) : (n & 1 ? POSE.cross : POSE.jab);
      if (n !== m.n) {
        m.n = n;
        const last = n === BQ[0] - 1, hs = o.scale || 1, x = o.x - f * 20 + rnd(-20, 20), y = o.y + 165 * hs + rnd(-50, 50);
        if (m.sword) { sfx.cut(.7 + Math.random() * .4); V.slash(x, y, rnd(0, TAU), last ? 460 : rnd(220, 320), n % 3 ? GOLDB : PINK, last ? 13 : 7); } else sfx.whoosh();
        const h = last ? { reach: 220, dmg: exact(o, BQ[1]), kb: 1300, lift: 520, stun: .9, stop: .12, heavy: 1, col: PINK, fixed: 1, mute: 1 }
                       : { reach: 210, dmg: exact(o, BQ[1]), kb: 40, stun: .5, stop: .025, col: m.sword ? GOLDB : '#ffffff', fixed: 1, mute: 1 };
        if (E.tryHit(p, h)) {
          if (m.sword) sfx.splat(); else sfx.hit(last);
          V.sparks(x, y, 'gold', last ? 12 : 3);
          if (gore()) FX.splash(x, y, f, last ? 6 : 2, .7);
          if (last) { shake(24); E.zoomIn(.3); V.ring(o.x, o.y + 165 * hs, 260, PINK, .3); FX.pop(o.x, o.y + 335 * hs, 'ドカッ', 60, PINK); hook = { o, at: E.T }; }
        }
      }
      return;
    }
    p.vx = 0; p.target = t < .95 ? (m.sword ? POSE.haCutC : POSE.cross) : POSE.idle;
  } },
  // 4 — Backstab: round behind them, the sword in, pulled out (40, two stacks of bleeding), and them thrown (50, and a lot of blood)
  manji: { name: 'Backstab', cd: STAB_CD, dur: 1.4, glow: 'gold', run(p, m, t) {
    const o = E.P2;
    p.rate = 50;
    if (!m.s) {
      m.s = 1; sfx.whoosh(); shout(p, '背後', PINK);
      if (!o.ko && !(o.alpha < 1) && o.state !== 'down' && o.state !== 'up' && !(o.inv > 0) && Math.abs(o.x - p.x) < 700) { m.d = Math.sign(o.x - p.x) || p.face; m.x0 = p.x; m.x1 = clamp(o.x + m.d * 110, -965, 965); }
      else m.miss = 'MISSED';
    }
    if (m.miss) { p.target = t < .3 ? POSE.haSweep : POSE.idle; p.vx = 0; if (!m.told) { m.told = 1; missed(p, m.miss); } if (t > .55) E.endMove(p); return; }
    if (t < .14) {                                  // round them, quick, in pink
      p.target = POSE.haSweep; p.vx = 0; p.x = lerp(m.x0, m.x1, t / .14); p.face = -m.d;
      trail.push({ f: { skin: p.skin, x: p.x, y: p.y, z: p.z, face: p.face, spin: 1, scale: p.scale, pose: p.pose.slice(), alpha: 1 }, t: 0 }); if (trail.length > 10) trail.shift();
      return;
    }
    p.vx = 0;
    const hs = o.scale || 1, x = o.x, y = o.y + 175 * hs, f = p.face;
    if (!m.stab) {                                  // the sword into their back: or not
      m.stab = 1; p.x = m.x1; p.face = -m.d;
      if (o.ko || o.state === 'down' || o.state === 'up' || Math.abs(o.x - p.x) > 260) m.miss = 'MISSED';
      else if (E.hooks.shield && E.hooks.shield(o, p.face, { dmg: 0, kb: 0, stun: 0 })) m.miss = 'BLOCKED';
      else if (!duel() && JU.evasive && JU.evasive.foe(o, .3)) m.miss = 'DODGED';
      if (m.miss) return;
      Object.assign(o, { state: 'hurt', stun: 1.2, vx: 0, act: null, tele: 0, face: p.face }); if (o.ai) o.ai.t = Math.max(o.ai.t || 0, 1.2);
      sfx.cut(1.3); if (gore()) { sfx.splat(); FX.gush(x, y, f, 10, .9); } V.slash(x, y, f > 0 ? 0 : Math.PI, 240, PINK, 8); FX.pop(x, y + 160, 'ズブッ', 56, PINK);
    }
    p.target = t < .45 ? POSE.haCutA : t < .85 ? POSE.haWindC : t < 1.15 ? POSE.haThrow : POSE.idle;
    if (t < .45) { if (!o.ko) Object.assign(o, { state: 'hurt', stun: Math.max(o.stun || 0, .8), vx: 0 }); return; }
    if (!m.pull) {                                  // out it comes
      m.pull = 1;
      E.applyHit(o, -f, { dmg: exact(o, STAB[0]), kb: 60, stun: 1.1, stop: .14, heavy: 1, col: '#ff3b55', fixed: 1, mute: 1 });
      if (!o.ko) { VA.wound(o); VA.wound(o); }
      sfx.splatter(); shake(18); V.slash(x, y, f > 0 ? Math.PI : 0, 300, GOLDB, 10);
      if (gore()) { FX.gush(x, y, -f, 18, 1.1); FX.splash(x, y, -f, 6, .9); }
      FX.pop(x, y + 170, 'ズルッ', 58, PINK);
    }
    if (t < .85) { if (!o.ko) Object.assign(o, { state: 'hurt', stun: Math.max(o.stun || 0, .6), vx: 0 }); return; }
    if (!m.throw) {                                 // and them, thrown: and everywhere, blood
      m.throw = 1;
      E.applyHit(o, f, { dmg: exact(o, STAB[1]), kb: 1100, lift: 700, stun: .9, stop: .2, heavy: 1, col: '#ff3b55', fixed: 1, mute: 1, flung: 1 });
      sfx.splatter(1.2); sfx.blast(); shake(30); E.zoomIn(.35);
      V.ring(x, y, 280, PINK, .3); FX.pop(x, y + 190, 'ブシャァッ', 72, '#ff3b55');
      if (gore()) {
        FX.gush(x, y, f, 30, 1.4); FX.gush(x, y, -f, 18, 1.1); FX.splash(x, y, f, 10, 1.2); FX.splash(x, y, -f, 6, 1); FX.blood(x, y, f, 16); FX.pool(o.x, 260); FX.lens(3);
        if (Z) for (let i = 0; i < 40; i++) Z.emit(4, x + rnd(-30, 30), y + rnd(-40, 40), rnd(-1000, 1000), rnd(0, 1100), rnd(4, 10), 2, i % 4 ? '150,8,20' : '200,20,32', { g: 2300, land: 'blood' });
      } else V.sparks(x, y, 'gold', 16);
    }
    if (t > 1.3) E.endMove(p);
  } }
};
const BASE_MOVES = Object.assign({}, MOVES);
// in his awakening: 1 Dirty Stab, 2 My Death, and nothing else
const NONE = { name: '—', cd: 1, dur: .01, run() {} };
const DIRTY = { name: 'Dirty Stab', cd: DIRTY_CD, dur: .8, glow: 'gold', run(p, m, t) {
  const o = E.P2, f = p.face;
  if (!m.s) { m.s = 1; m.kill = !!(ult && ult.dirty); shout(p, m.kill ? '終わり' : '卑怯', m.kill ? '#ff3b55' : PINK); sfx.charge(); }
  p.rate = 50;
  if (t < .12) { p.target = POSE.vaLow || POSE.crushWind; p.vx = 0; return; }
  p.target = t < .45 ? (POSE.vaRise || POSE.jump) : POSE.idle; p.vx = t < .22 ? f * 300 : 0;
  if (!m.sw) { m.sw = 1; sfx.whoosh(); V.slash(p.x + f * 110, p.y + 220, f > 0 ? 1.2 : Math.PI - 1.2, 420, m.kill ? '#ff3b55' : PINK, 14); }
  if (m.done || t > .32) return;
  const h = m.kill ? { reach: 230, dmg: exact(o, o.hp + 99999), kb: 900, lift: 1200, stun: .9, stop: .3, heavy: 1, col: '#ff3b55', fixed: 1, mute: 1 }
                   : { reach: 220, dmg: exact(o, DIRTY_DMG), kb: 80, lift: 1100, stun: .9, stop: .14, heavy: 1, col: PINK, fixed: 1, mute: 1 };
  if (!E.tryHit(p, h)) return;
  m.done = 1;
  const hs = o.scale || 1, x = o.x, y = o.y + 165 * hs;
  sfx.splatter(); shake(m.kill ? 40 : 24); E.zoomIn(m.kill ? .5 : .3); V.ring(x, y, m.kill ? 420 : 240, m.kill ? '#ff3b55' : PINK, .3);
  if (gore()) { FX.gush(x, y, f, m.kill ? 34 : 16, 1.2); FX.splash(x, y, f, m.kill ? 10 : 4, 1); if (m.kill) { FX.blood(x, y, f, 14); FX.lens(2); } }
  FX.pop(x, y + 170, m.kill ? 'トドメ' : 'ザクッ', 64, m.kill ? '#ff3b55' : PINK);
  if (m.kill) { E.banner('即死', 'INSTANT KILL', 'xs'); return; }
  if (!o.ko) for (let i = 0; i < DIRTY_BLEED; i++) VA.wound(o);
  if (ult) ult.dirty = true;
  E.fx.push({ k: 2, x: p.x, y: p.y + 430, n: 'NEXT ONE KILLS', col: '#ff3b55', t: 0, life: 1.6 });
} };
const MYDEATH = { name: 'My Death', cd: 1, dur: 30, glow: 'gold', run(p, m, t) {      // (dur: he does not get up again; the fight ends round him)
  const o = E.P2;
  p.vx = 0; p.rate = 30;
  if (!m.s) { m.s = 1; shout(p, '死', '#ff3b55'); sfx.charge(); p.inv = 9; p.dying = true; miracles = 0; paint(); m.dirty = !!(ult && ult.dirty); }      // (the miracles go: nothing is saving him from this one)
  if (t < .35) { p.target = POSE.haWindC; return; }
  if (!m.stab) {                                    // into himself
    m.stab = 1;
    const hs = p.scale || 1, x = p.x, y = p.y + 175 * hs;
    p.hp = 1; p.flash = .1;
    sfx.splatter(1.2); shake(26); E.stop(.15); FX.pop(x, y + 190, 'ザクッ', 64, '#ff3b55');
    if (gore()) { FX.gush(x, y, p.face, 22, 1.2); FX.gush(x, y, -p.face, 12, 1); FX.pool(p.x, 220); }
    const w = E.hand(p, true);
    blade = { x: w[0], y: w[1], f: p.face, ang: 0, phase: 'auto', x0: w[0], t: 0, vy: 0, hitOut: true, hitBack: true, dirty: m.dirty, o };
    held = false;
  }
  p.target = POSE.down || POSE.idle;
  if (!m.end && t > 3.2) {                          // the sword has had its turn: if they are still standing, he is dead
    m.end = 1;
    if (!o.ko) { p.inv = 0; Fi.chip(p.hp + 1, '#ff3b55'); }
  }
} };
function selfMove(b, dt) {                          // My Death: up out of him, turning, and then at them on its own
  const o = b.o;
  if (b.t < .7) { b.y += 420 * dt; b.ang += 22 * dt; return; }
  if (!o || o.ko || o !== E.P2) { b.phase = 'drop'; b.vy = 200; return; }
  const tx = o.x, ty = o.y + 165 * (o.scale || 1), dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy) || 1, step = Math.min(d, 2600 * dt);
  b.x += dx / d * step; b.y += dy / d * step; b.ang += 30 * dt;
  if (d > 70) return;
  const f = Math.sign(dx) || 1, hs = o.scale || 1;
  E.applyHit(o, f, b.dirty ? { dmg: exact(o, o.hp + 99999), kb: 900, lift: 900, stun: .9, stop: .3, heavy: 1, col: '#ff3b55', fixed: 1, mute: 1 }
                           : { dmg: exact(o, THROWN), kb: 700, lift: 420, stun: .9, stop: .14, heavy: 1, col: GOLDB, fixed: 1, mute: 1 });
  sfx.splatter(1.1); shake(b.dirty ? 40 : 18); V.slash(tx, ty, rnd(-.5, .5), 520, b.dirty ? '#ff3b55' : GOLDB, 16);
  if (gore()) { FX.gush(tx, ty, f, b.dirty ? 30 : 12, 1.2); if (b.dirty) FX.blood(tx, ty, f, 14); }
  if (b.dirty) E.banner('即死', 'INSTANT KILL', 'xs');
  FX.pop(tx, ty + 170 * hs, b.dirty ? 'トドメ' : 'ザンッ', 64, b.dirty ? '#ff3b55' : GOLDB);
  b.phase = 'drop'; b.vy = 300;
}
const ULT_MOVES = { strikes: DIRTY, crush: MYDEATH, div: NONE, manji: NONE };
for (const k of Object.keys(BASE_MOVES)) Object.defineProperty(MOVES, k, { get: () => (ult ? ULT_MOVES[k] : BASE_MOVES[k]), enumerable: true });

/* ================= the way into his awakening ================= */
let failT = 0, cine = null, ult = null;             // after a missed Backstab: how long Sword Play will be dodged; the speech; the awakening itself ({ dirty: Dirty Stab has landed })
function missed(p, why) {
  E.fx.push({ k: 2, x: p.x, y: p.y + 420, n: why, col: '#ffffff', t: 0, life: 1.1 });
  if (duel() || ult || cine) return;
  failT = FAIL_T;
  E.fx.push({ k: 2, x: p.x, y: p.y + 470, n: '2 · SWORD PLAY', col: PINK, t: 0, life: 1.6 });
}
function dodge(o, b) {                              // they step out of its way, and it goes on past
  if (JU.evasive) JU.evasive.ghost(o, .4);
  o.x = clamp(o.x + b.f * 230, -940, 940); Object.assign(o, { state: 'idle', vx: 0, act: null, tele: 0, inv: .4 });
  sfx.evade(); E.fx.push({ k: 2, x: o.x, y: o.y + 380, n: 'DODGED', col: '#7fe9ff', t: 0, life: 1 });
  b.phase = 'drop'; b.vy = 300;
  E.after(.45, () => startCine(o));
}
// "I thought" ... "I cut you there." ... a sigh ... "I guess I'll try just a little harder."
const CINE_LINES = [[.3, 'say', 'I THOUGHT', 1.4, -1], [1.5, 'say', 'I CUT YOU THERE.', 1.8, 1], [3.1, 'think', 'SIGH', 1.4, 0], [4.3, 'say', 'I GUESS I\u2019LL TRY JUST A LITTLE HARDER', 2.3, 1]];
const CINE_T = 6.6;
const CINE = { name: '', dur: CINE_T + .2, run(p, m, t) { p.vx = 0; p.rate = 14; p.target = t > 3.1 && t < 4.2 ? (POSE.haCrouch || POSE.idle) : POSE.idle; } };
function startCine(o) {
  const p = E.P1;
  if (!on() || duel() || ult || cine || p.dead || o !== E.P2 || o.ko) return;
  cine = { o, t: 0, said: 0 };
  if (p.move) E.endMove(p);
  p.move = { def: CINE, t: 0 };
  if (blade) recall();
}
function cineTick(dt) {
  const c = cine, p = E.P1, o = c.o;
  c.t += dt; p.inv = Math.max(p.inv || 0, .3);
  if (o === E.P2 && !o.ko) { Object.assign(o, { vx: 0, act: null, tele: 0, inv: .3 }); if (o.state === 'hurt' || o.state === 'act') o.state = 'idle'; if (o.ai) o.ai.t = Math.max(o.ai.t || 0, 1); }
  while (c.said < CINE_LINES.length && c.t >= CINE_LINES[c.said][0]) {
    const [, kind, text, life, side] = CINE_LINES[c.said++];
    if (JU.manga) JU.manga[kind](p, text, { life, side });
    sfx.tap(kind === 'say' ? 0 : 1);
  }
  if (c.t >= CINE_T) { cine = null; awaken(p); }
}
function awaken(p) {                                // six miracles at once, and two moves
  if (!on() || duel()) return;
  ult = { dirty: false };
  if (blade) { blade = null; }
  held = true; miracles = MAXM; paint();
  E.banner('奇跡', 'JUST A LITTLE HARDER', 'xs'); sfx.bf(); sfx.confirm(); shake(30); E.zoomIn(.4);
  if (Z) { Z.flash(GRGB, .35, .3); Z.flare(p.x, p.y + 200, GRGB, 620, .35); Z.shock(p.x, 520, GRGB, .5, 10); }
  V.ring(p.x, p.y + 180, 420, GOLDB, .45); V.sparks(p.x, p.y + 220, 'gold', 24);
  labels();
}
function labels() {                                 // the hotbar: his awakening's two, or his own four
  const set = ult ? ULT_MOVES : BASE_MOVES;
  for (const k of ['strikes', 'crush', 'div', 'manji']) { const b = E.hud.mv[k] && E.hud.mv[k].querySelector('b'); if (b) b.textContent = set[k].name; E.CD[k] = set[k].cd; E.cd[k] = 0; }
  if (!ult) relabel();
}


JU.tech.add('haruta', { name: 'Miracle Dork', jp: '奇跡', mark: '奇', who: 'Miracles', odds: 5, col: PINK, glow: 'gold', moves: MOVES,      // (out of Early Access in 0.17v1: 5%, on top of the rest, so the talisman's odds came to 105, until 0.19 brought them back to 100)
  gore: true, skin: HARUTA, as: ['Miracle Dork', '奇跡'], m1,
  hint: '<b>2</b> again: the sword comes back · without it: punches, every 3rd a miracle · <b>1</b> is Lucky Cut · <b>4</b> Backstab · <b>3</b>, then the sword back through them, then <b>1</b>: the combo' });
const DEF = JU.tech.TECH.haruta, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
let primed = false;
function prime() { if (!primed) { primed = true; sfx.preload(SPLATS); } }
const moveFx0 = H.moveFx, press0 = H.press, guard0 = H.guard, tick0 = H.tick, fx0 = H.fx, under0 = H.under, reset0 = H.reset, start0 = H.fightStart, rate0 = H.m1rate;
H.moveFx = (p, m) => {
  if (moveFx0) moveFx0(p, m);
  if (p !== E.P1 || !m.def.ha || !m.done || m.counted) return;
  m.counted = 1;
  const o = E.P2, hs = o.scale || 1, x = o.x - p.face * 18, y = o.y + 165 * hs;
  if (m.def.fist) { sfx.hit(false); if (++punches % 3 === 0) gain(p); return; }      // a punch that landed: every third, a miracle
  sfx.cut(.7 + .15 * m.i); FX.splash(x, y, p.face, 2 + m.i, .7); if (m.i === 3) FX.gush(x, y, p.face, 10, 1);
}
H.press = (a, inScene) => {
  const p = E.P1;
  if (!inScene && on() && (cine || p.dying)) return true;                                   // (nothing, while he talks, or dies)
  if (!inScene && on() && ult && (a === 'div' || a === 'manji')) { sfx.back(); return true; }      // his awakening has two moves, no more
  if (!inScene && on() && !ult && a === 'manji' && !held && !p.move) { sfx.back(); E.fx.push({ k: 2, x: p.x, y: p.y + 420, n: 'NO SWORD', col: PINK, t: 0, life: .9 }); return true; }
  if (!inScene && on() && !ult && a === 'crush' && blade && blade.phase !== 'back' && blade.phase !== 'solo' && blade.phase !== 'auto' && !p.dead) { recall(); return true; }
  if (!inScene && on() && a === 'strikes' && combo && E.root.dataset.mode === 'fight' && !p.move && !p.ps && !p.dead && !(p.dashT > 0)) {      // the combo's Lucky Cut, now, whatever 1's wait
    E.cd.strikes = E.CD.strikes; p.move = { def: MOVES.strikes, key: 'strikes', t: 0 }; E.hud.mv.strikes.classList.add('act');
    return true;
  }
  return press0 ? press0(a, inScene) : false;
};
H.guard = (face, a, mul = 1) => {
  if (guard0 && guard0(face, a, mul)) return true;
  const p = E.P1, f = Fi.fight;
  if (on() && !(p.dashT > 0 || p.inv > 0 || p.dead || p.ps === 'down' || p.ps === 'up' || f.paused)) {      // (a blow that is going to land: if it would kill him, the miracles have their say)
    const raw = a.dmg * mul * (H.foePower ? H.foePower(a) : 1);
    rescue(p, a.exact ? raw : Math.round(raw));
  }
  return false;
};
H.m1rate = () => (rate0 ? rate0() : 1) * (on() && !held ? .8 : 1);      // his fists come slower than the sword did
H.tick = dt => {
  tick0(dt);
  if (blade) flyBlade(dt);
  if (dots.length) bleedTick(dt);
  if (hook && E.T - hook.at > HOOK_T) hook = null;
  if (combo && ((combo.t -= dt) <= 0 || combo.o !== E.P2 || combo.o.ko)) combo = null;
  if (eCd > 0) eCd -= dt;
  if (failT > 0) failT -= dt;
  if (cine) cineTick(dt);
  if (ult && on() && Math.random() < dt * 14) { const p = E.P1; V.puff('gold', p.x + rnd(-50, 50), p.y + rnd(40, 320), rnd(-30, 30), rnd(80, 200), rnd(30, 50), .5); }      // (his awakening: gold coming off him)
};
H.under = dt => {
  under0(dt);
  for (let i = trail.length - 1; i >= 0; i--) {     // Rush: where he was, a moment ago, in pink
    const s = trail[i];
    if ((s.t += dt) >= .22) { trail.splice(i, 1); continue; }
    E.drawFighter(E.over(s.f, TRAIL), .55 * (1 - s.t / .22));
  }
};
H.fx = dt => {
  fx0(dt);
  for (const f of [E.P2, E.P1]) if (f.skin === HARUTA && !(f.alpha < .05) && (f !== E.P1 || held)) drawHeld(f);
  if (blade) drawLoose();
};
const clear = () => { held = true; blade = null; dots.length = trail.length = 0; punches = 0; hook = combo = null; failT = 0; cine = null; if (E.P1) E.P1.dying = false; if (ult) { ult = null; if (on()) labels(); } };
H.reset = () => { reset0(); clear(); miracles = 0; paint(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); clear(); if (!wave) miracles = 0; paint(); relabel(); if (on()) prime(); };

JU.haruta = { HARUTA, MOVES, CUTS, FISTS, MAXM,
  esp: { name: () => (held ? 'Sword Qusion' : 'Sword Back'), jp: '剣', col: PINK, get left() { return Math.max(0, eCd); }, max: E_CD, press: espPress },      // E (especial.js)
  get ult() { return ult && { dirty: ult.dirty }; }, get cine() { return cine && +cine.t.toFixed(2); }, get failT() { return +failT.toFixed(2); }, DIRTY, MYDEATH,
 get hook() { return hook && { at: hook.at }; }, get combo() { return combo && { t: +combo.t.toFixed(2) }; }, get held() { return held; }, get blade() { return blade && { phase: blade.phase, x: Math.round(blade.x) }; }, get miracles() { return miracles; }, set miracles(n) { miracles = clamp(n | 0, 0, MAXM); paint(); }, get punches() { return punches; } };
})();
