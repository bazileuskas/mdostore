/* JUJUTSU UNLIMITEDS — Build 0.22v3: three Secret CTs after the Love Reaper (reaper.js), the user's:
   "TRUE LOVE REAPER: 2 modes rika and katana with 20 variants for each mode. Final Love Reaper: 3 modes, Rika, katana, fists with 16 variants
   for each mode. True Final Love Reaper: 6 modes with 10 variants for each mode and good sfx".
   Six modes in all (the other three of the six are ours: Cursed Speech, Copy, Mutual Love). Each has its own 4 moves and its own E (a
   counter), and a pool of variants: in the air, held, two or three keys in a row in that mode, and into the next mode (a move, a switch, a
   move in the other mode). Each technique takes its modes' pools as the user counted them: 20 a mode for True, 16 for Final, 10 for True
   Final (more of the cross-mode ones the more modes there are). Higher tiers hit harder (x1, x1.2, x1.45).
   Right click: the next mode. RMB + Z, RMB + X, T + RMB, Y + RMB, RMB + H, RMB + N: that mode straight away (in the order of the strip).
   G is each technique's own: Rika: Full Manifestation (True), Pure Love: Final Declaration (Final), Domain Expansion: Authentic Mutual Love
   (True Final). Free for now: the user has not said how they are earned.
   Sounds: myinstants' katana (draw, iai, schwing, stab, parry, slash: home-lr-*), and the game's own: Rika screaming his name, the teleport,
   a heavy punch, bones, Black Flash, the Cursed Speech words (Japanese) and Hollow Purple's blast. The names and numbers are ours */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, P = E.P, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, C = JU.cut, Z = JU.bossfx, T = JU.tech, D = JU.domain, ms = JU.ms;
const R = JU.reaper.kit, DK = JU.dced.kit, { rnd, clamp, lerp, ease, ZP } = E, TAU = Math.PI * 2, SLOTS = T.SLOTS;
const play = ms.play, shake = v => { if (!JU.reduceMotion) cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const dev = () => !!(JU.account && JU.account.dev), duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
sfx.preload(['home-lr-iai', 'home-lr-schwing', 'home-lr-stab', 'home-lr-parry', 'home-lr-draw', 'home-lr-slash', 'home-rika-yuta', 'home-yuta-tp', 'home-yuta-cut', 'home-love-slam', 'home-love-crack', 'home-love-crunch', 'home-nanami-bf', 'home-yuji-bf', 'home-inu-dontmove', 'home-inu-twist', 'home-inu-down', 'home-inu-stop', 'home-inu-explode', 'home-gojo-purple-boom', 'home-tdc-boom']);
const LILAC = '#c9a0ff', LRGB = '201,160,255', STEEL = '#eef3ff', FIST = '#ff6b9a', WORD = '#f1ecff', COPY = '#8fe3ff', MUT = '#ff4f9a';
const SKIN = Object.assign({}, JU.reaper.REAPER);   // (his look, as a copy: reaper.js draws Rika and the sword for its own only; these draw their own)
const SEE = .15;
const alive = o => !!o && !o.ko && !(o.alpha < 1);
const sideOf = (p, o) => (alive(o) ? (o.x >= p.x ? 1 : -1) : p.face);
const midOf = o => o.y + 170 * (o.scale || 1);
const can = o => alive(o) && !duel() && !o.net && !o.poise;
const hold = (o, t = .6) => { if (can(o)) Object.assign(o, { state: 'hurt', stun: Math.max(o.stun || 0, t), act: null, tele: 0, vx: 0 }); };
const label = (x, y, n, col, life = 1.1) => E.fx.push({ k: 2, x, y, n, col, t: 0, life });

/* ================= which one, and which mode ================= */
let tech = null, mi = 0;                            // the Love Reaper in use ({ id, modes, mult, n, ... }) and which of its modes he is in
const MO = () => (tech ? tech.modes[mi] : 'rika');
const M = n => n * (tech ? tech.mult : 1);
// a blow of his: exactly n (times the tier), whoever they are
function hit(p, n, col, h = {}, o = E.P2) {
  if (!alive(o) || !(n > 0)) return false;          // (nothing: only the look of it)
  E.applyHit(o, sideOf(p, o), Object.assign({ dmg: M(n) / (o.dr || 1), kb: 120, stun: .45, stop: .04, col, fixed: 1, mute: 1 }, h));
  return true;
}
const near = (p, r = 330) => { const o = E.P2; return alive(o) && Math.abs(o.x - p.x) < r && Math.abs(o.y - p.y) < 320 ? o : null; };

/* ================= Rika, behind him (all three have her) ================= */
const rk = { a: SEE, act: null, arm: null };        // how much of her shows; what she is doing ({ kind, t, ... }); her long arm out to somebody ({ o, hx, hy, shut, sq })
function rikaQ(dt) {
  const A = rk.act, T0 = E.T;
  if (A) A.t += dt;
  let q = { arm: .25 + .05 * Math.sin(T0 * 1.7), raise: 0, mouth: .12 + .08 * Math.sin(T0 * .9) }, want = MO() === 'rika' ? .5 : SEE;
  if (A) {
    want = 1;
    if (A.kind === 'swipe') q = { arm: A.t < .12 ? .6 : 1.2, raise: A.t < .12 ? .6 : .1, mouth: .7 };
    else if (A.kind === 'beam') q = { arm: .4, raise: .55, mouth: Math.min(1, A.t * 1.4) };
    else if (A.kind === 'scream') q = { arm: .3, raise: .2, mouth: 1 };
    else if (A.kind === 'grab') q = { arm: .3, raise: .35, mouth: .6 + .4 * Math.abs(Math.sin(A.t * 5)), noArm: true };
    else q = { arm: .8, raise: .5, mouth: .8 };
    if (A.t > (A.life || 1)) rk.act = null;
  }
  rk.a += (want - rk.a) * (1 - Math.exp(-dt * (want > rk.a ? 12 : 3)));
  return q;
}
const rika = (kind, life = 1) => { rk.act = { kind, t: 0, life }; };
let rq = { arm: .25, raise: 0, mouth: .1 };

/* ================= the pieces every move is made of ================= */
// ---- getting there
function to(p, side, gap, quiet) {                 // next to them: side 1 behind them, -1 in front (quiet: no sound, one of a run of them)
  const o = E.P2; if (!alive(o)) return;
  const d = Math.sign(o.x - p.x) || p.face, x = clamp(o.x + side * d * gap, -965, 965), f = -side * d;
  if (Math.abs(p.x - x) < 60 && p.face === f && Math.abs(o.y - p.y) < 80) return;      // (there already)
  if (quiet) { V.ring(p.x, p.y + 160, 120, '#d6d6de', .18); p.x = x; p.face = f; p.vx = 0; p.dashT = 0; V.ring(p.x, p.y + 160, 150, LILAC, .2); }
  else R.blink(p, x, f);
  if (o.y > 60) { p.y = Math.max(0, o.y - 20); p.vy = 0; p.ground = false; }
}
const behind = (p, gap = 130, quiet) => to(p, 1, gap, quiet), front = (p, gap = 140, quiet) => to(p, -1, gap, quiet);
const leap = (p, t) => { const o = E.P2; if (alive(o)) p.vx = clamp((o.x - p.face * 40 - p.x) / t, -2400, 2400); };      // (across to come down on them in about t seconds: keepVx)
// ---- the sword
function cut(p, n, o2 = {}) {                       // a cut across them: o2 { big, ang, slice (the picture parted along it), col, h }
  const o = E.P2, x = alive(o) ? o.x : p.x + p.face * 160, y = alive(o) ? midOf(o) + rnd(-40, 40) : p.y + 170, ang = o2.ang !== undefined ? o2.ang : (p.face > 0 ? -.4 : Math.PI + .4) + rnd(-.5, .5);
  V.slash(x, y, ang, o2.big ? 620 : 420, o2.col || STEEL, o2.big ? 14 : 8); if (o2.big) V.slash(x, y + 6, ang, 660, LILAC, 5);
  if (o2.slice && C && C.slice) C.slice(x, y, ang, 900, { shift: 14, life: .5 });
  play(o2.big ? 'home-lr-iai' : Math.random() < .5 ? 'home-lr-slash' : 'home-lr-schwing', o2.big ? .9 : .6, () => sfx.cut(o2.big ? 1.4 : .9));
  if (!o2.only && alive(o) && Math.abs(o.x - p.x) < (o2.reach || 360)) { hit(p, n, o2.col || LILAC, Object.assign(o2.big ? { kb: 700, lift: 350, stun: .9, stop: .12, heavy: 1 } : { kb: 60, stun: .5, stop: .04 }, o2.h)); V.sparks(x, y, 'purple', o2.big ? 12 : 4); return true; }
  return false;
}
const CRESCENT = (s, c, k) => {                      // a cut thrown through the air: a crescent of white and lilac
  const a = Math.atan2(-s.vy, s.vx), r = (s.r || 30) * k * 2.4;
  g.save(); g.translate(c[0], c[1]); g.rotate(a);
  lit(() => E.glow(E.GLOW.purple, 0, 0, r * 2.6, .7));
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(-r * .4, 0, r, -1.2, 1.2); g.arc(-r * .9, 0, r * .9, 1.1, -1.1, true); g.closePath(); g.fill();
  g.strokeStyle = LILAC; g.lineWidth = 3 * k; g.stroke();
  g.restore();
};
function wave(p, n, o2 = {}) {                      // a crescent of a cut, thrown: o2 { vy (down from the air), big, h }
  const o = E.P2, x = p.x + p.face * 90, y = p.y + 200;
  let vx = p.face * 2300, vy = 0;
  if (alive(o)) { const dx = o.x - x, dy = midOf(o) - y, L = Math.hypot(dx, dy) || 1; vx = dx / L * 2300; vy = dy / L * 2300; }
  DK.fire({ x, y, vx, vy, r: o2.big ? 44 : 30, dmg: M(n), Cc: { core: LILAC, rgb: LRGB, img: 'purple' }, life: 1.1, pierce: !!o2.pierce, home: 7, down: 1, draw: CRESCENT, h: Object.assign({ kb: 500, lift: 200, stun: .7, stop: .08 }, o2.h) });
  play('home-lr-schwing', .7, () => sfx.cut(1)); sfx.whoosh();
}
function thrust(p, n, o2 = {}) {                    // all of him behind the point of it
  const o = E.P2, x = alive(o) ? o.x : p.x + p.face * 200, y = alive(o) ? midOf(o) : p.y + 170;
  V.slash(x - p.face * 120, y, p.face > 0 ? 0 : Math.PI, 700, '#ffffff', 10); V.ring(x, y, 200, LILAC, .25);
  play('home-lr-stab', .9, () => sfx.cut(1.5));
  if (alive(o) && Math.abs(o.x - p.x) < 380) { hit(p, n, LILAC, Object.assign({ kb: 1300, lift: 300, stun: .9, stop: .14, heavy: 1 }, o2.h)); V.sparks(x, y, 'purple', 14); return true; }
  return false;
}
const swords = [], BL = 168;                        // katanas of his (Mutual Love): { x, y (the guard), vx, vy, ang (on the screen), t, life, stuck, dmg, done, rise, dom (one of the domain's) } · BL: guard to point
const tipOf = s => [s.x + Math.cos(s.ang) * BL, s.y - Math.sin(s.ang) * BL];
function blade(x, y, ang, s = 1) {                  // one katana, drawn at (x, y) pointing along ang
  const c = F(x, y), k = c[2] * s;
  g.save(); g.translate(c[0], c[1]); g.rotate(ang); g.lineCap = 'round';
  lit(() => E.glow(E.GLOW.purple, 0, 0, 120 * k, .45));
  g.fillStyle = '#dfe6f2'; g.beginPath(); g.moveTo(0, -4 * k); g.lineTo(150 * k, -2 * k); g.lineTo(168 * k, 0); g.lineTo(150 * k, 3 * k); g.lineTo(0, 4 * k); g.closePath(); g.fill(); g.lineWidth = 2 * k; g.strokeStyle = '#0a0812'; g.stroke();
  g.fillStyle = '#2a2633'; g.fillRect(-8 * k, -10 * k, 8 * k, 20 * k);
  g.fillStyle = '#f2f0f6'; g.fillRect(-46 * k, -4 * k, 38 * k, 8 * k);
  g.restore();
}
function rainSwords(p, k, n, how = 'fall', dom = false) {      // katanas: falling on them, rising under them, or loosed at them
  const o = E.P2, tx = alive(o) ? o.x : p.x + p.face * 400, ty = alive(o) ? midOf(o) : 170;
  for (let i = 0; i < k; i++) {
    const s = { t: -i * .06, dmg: M(n), stuck: false, dom, x: tx };
    if (how === 'fall') Object.assign(s, { off: rnd(-60, 60), y: 1300 + i * 60, vx: 0, vy: -2600, ang: Math.PI / 2, life: 1.4 });
    else if (how === 'rise') Object.assign(s, { off: rnd(-70, 70), y: -BL - 10, vx: 0, vy: 2100, ang: -Math.PI / 2, life: .9, rise: true });
    else { const sx = p.x - p.face * rnd(0, 260), sy = rnd(120, 520), dx = tx - sx, dy = ty - sy, L = Math.hypot(dx, dy) || 1; Object.assign(s, { x: sx, y: sy, vx: dx / L * 2600, vy: dy / L * 2600, ang: Math.atan2(-dy, dx), life: 1.2 }); }
    swords.push(s);
  }
  play('home-lr-draw', .7, () => sfx.cut(.8));
}
function swordsTick(dt) {
  const o = E.P2;
  for (let i = swords.length - 1; i >= 0; i--) {
    const s = swords[i];
    if ((s.t += dt) < 0) continue;
    if (s.off !== undefined && !s.done && !s.stuck && alive(o) && s.y > 0) s.x += clamp(o.x + s.off - s.x, -1400 * dt, 1400 * dt);      // (the ones that fall or rise keep over them, the way they go)
    else if (s.off !== undefined && s.t < .02) s.x = (alive(o) ? o.x : s.x) + s.off;
    if (!s.go) { s.go = 1; if (s.rise) { V.rocks(s.x, 0, 3); E.addDust(s.x); } }
    if (!s.stuck) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.ang = Math.atan2(-s.vy, s.vx);
      const [px, py] = tipOf(s), hs = (o && o.scale) || 1;
      if (!s.done && s.dmg > 0 && alive(o) && Math.abs(o.x - px) < 85 * hs && py > o.y - 20 && py < o.y + 380 * hs) {
        s.done = true;
        E.applyHit(o, Math.sign(s.vx || (o.x - E.P1.x)) || 1, { dmg: s.dmg / (o.dr || 1), kb: s.rise ? 60 : 80, lift: s.rise ? 520 : 0, stun: .55, stop: .03, col: MUT, fixed: 1, mute: 1, lrDom: s.dom ? 1 : 0 });
        V.sparks(px, py, 'purple', 5); if (Math.random() < .5) play('home-lr-stab', .4, () => sfx.cut(.6));
      }
      if (py <= 0 && s.vy < 0) { s.y = Math.sin(s.ang) * BL - 30; s.stuck = true; V.rocks(px, 0, 2); E.addDust(px); s.life = Math.max(s.t + .5, s.life); }      // (point first, into the floor)
      else if ((s.y > 1500 && s.vy > 0) || Math.abs(s.x) > 1300) { swords.splice(i, 1); continue; }      // (gone up out of sight, or off the side)
    }
    if (s.t > s.life) swords.splice(i, 1);
  }
}
function drawSwords() {
  for (const s of swords) {
    if (s.t < 0) continue;
    const fl = F(s.x, 0)[1];
    g.save(); g.beginPath(); g.rect(-4000, -4000, 8000 + E.VW, 4000 + fl); g.clip();      // (none of it under the floor)
    g.globalAlpha = Math.max(0, Math.min(1, (s.life - s.t) * 4)); blade(s.x, s.y, s.ang);
    g.restore();
  }
}
// ---- Rika
function swipe(p, n, o2 = {}) {                     // her hand across them: four long claws
  rika('swipe', .5);
  const o = E.P2, x = alive(o) ? o.x : p.x + p.face * 260, y = alive(o) ? midOf(o) : 200;
  for (let i = 0; i < 4; i++) V.slash(x + i * 14 * p.face, y + (i - 1.5) * 34, p.face > 0 ? -.8 : Math.PI + .8, 380, i % 2 ? '#ffffff' : LILAC, 7);
  sfx.rika(0); play('home-love-crack', .5);
  if (alive(o) && Math.abs(o.x - p.x) < (o2.reach || 760)) { hit(p, n, LILAC, Object.assign({ kb: 500, lift: 250, stun: .7, stop: .08 }, o2.h)); V.sparks(x, y, 'purple', 10); return true; }
  return false;
}
function grab(p, m) {                               // her arm, all the way out, and her hand shut round them
  const o = E.P2;
  if (!alive(o) || Math.abs(o.x - p.x) > 1500) return false;      // (her arm goes as far as it has to)
  rika('grab', 3); rk.arm = { o, hx: o.x, hy: midOf(o), shut: true, sq: 0 }; m.held = o;
  play('home-rika-yuta', .7, () => sfx.rika(1)); hit(p, 5, LILAC, { kb: 0, stun: 1.5, stop: .05 });
  return true;
}
function carry(p, m, x, y) { const o = m.held; if (!o || !rk.arm) return; rk.arm.hx = x; rk.arm.hy = y; if (can(o)) Object.assign(o, { x, y: Math.max(0, y - 170), vx: 0, vy: 0, ground: false, state: 'air', stun: 1, act: null }); }
function slam(p, m, n, toss) {                      // and into the floor (or thrown)
  const o = m.held; rk.arm = null; rk.act = null; m.held = null;
  if (!alive(o)) return;
  if (toss) { hit(p, n, LILAC, { kb: 1500, lift: 700, stun: 1, stop: .16, heavy: 1 }, o); play('home-love-crunch', .7); return; }
  if (can(o)) Object.assign(o, { y: 1, vy: -2400, ground: false, state: 'air' });
  hit(p, n, LILAC, { kb: 200, stun: 1, stop: .2, heavy: 1, ring: 1 }, o); R.floorHit(o, o.x);
}
function beam(p, n, w = 110) {                      // out of her mouth: all of it
  rika('beam', 1.2);
  const o = E.P2, a = R.mouth(p), there = alive(o) && Math.abs(o.x - p.x) < 1700, x1 = there ? o.x : p.x + p.face * 1500, y1 = there ? midOf(o) : 140;
  V.custom(.6, u => {
    const s = R.mouth(p), b = F(x1, y1), k = b[2], ww = w * k * (u < .15 ? u / .15 : 1 - (u - .15) * .9), al = Math.min(1, (1 - u) * 2.2);
    g.save(); g.lineCap = 'round';
    lit(() => { g.strokeStyle = `rgba(${LRGB},${.35 * al})`; g.lineWidth = ww * 2.6; g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(b[0], b[1]); g.stroke(); g.strokeStyle = `rgba(255,140,220,${.5 * al})`; g.lineWidth = ww * 1.4; g.stroke(); E.glow(E.GLOW.purple, b[0], b[1], 640 * k * al, al); });
    g.globalAlpha = al; g.strokeStyle = '#ffffff'; g.lineWidth = ww * .55; g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(b[0], b[1]); g.stroke();
    g.restore();
  });
  sfx.rika(1); play('home-tdc-shoot', .6, () => sfx.cannon(2)); shake(30);
  if (there && !o.ko) { hit(p, n, LILAC, { kb: 1300, lift: 450, stun: .9, stop: .2, heavy: 1 }); V.ring(x1, y1, 380, LILAC, .4); if (Z) Z.boom(x1, y1, 150, LRGB, { n: 20, smoke: '40,20,60', hot: '255,230,250' }); }
  void a;
}
function scream(p, n) {                             // her scream: a ring of it out of her mouth, and they cannot move for it
  rika('scream', 1);
  const a = R.mouth(p);
  play('home-rika-yuta', 1, () => sfx.rika(1)); shake(26);
  V.custom(.7, u => { const s = R.mouth(p), k = s[2]; g.save(); g.strokeStyle = `rgba(${LRGB},${1 - u})`; for (let i = 0; i < 4; i++) { g.lineWidth = (10 - i * 2) * k; g.beginPath(); g.arc(s[0], s[1], (120 + u * 900 + i * 80) * k, 0, TAU); g.stroke(); } g.restore(); });
  const o = E.P2;
  if (alive(o) && Math.abs(o.x - p.x) < 1500) { hit(p, n, LILAC, { kb: 300, stun: 1.6, stop: .1 }); hold(o, 1.6); }
  void a;
}
function stomp(p, n) {                              // her hand down out of the dark onto them
  const o = E.P2, x = alive(o) ? o.x : p.x + p.face * 300;
  rika('stomp', .6);
  V.custom(.5, u => R.slamHand(x, u / .35, Math.min(1, (1 - u) * 4)));
  E.after(.18, () => { if (!tech) return; R.floorHit(alive(o) ? o : { x }, x); if (alive(o) && Math.abs(o.x - x) < 200) { hit(E.P1, n, LILAC, { kb: 200, stun: 1.1, stop: .16, heavy: 1 }); if (can(o) && !o.ground) o.vy = -2200; } });
}
// ---- fists
function punch(p, n, big, h = {}) {
  const o = near(p, big ? 360 : 300), w = E.hand(p, true);
  p.pose = (Math.random() < .5 ? POSE.cross : POSE.jab).slice();
  DK.cone(w[0], w[1], p.face, big ? 380 : 220, { core: FIST, rgb: '255,107,154', img: 'red' }, big ? .24 : .14);
  if (big) play('home-love-slam', .8, () => sfx.hit(true)); else sfx.hit(false);
  if (o) { hit(p, n, FIST, Object.assign(big ? { kb: 900, lift: 400, stun: .9, stop: .12, heavy: 1 } : { kb: 50, stun: .5, stop: .04 }, h)); V.sparks(o.x, midOf(o), 'red', big ? 10 : 4); return true; }
  return false;
}
function blackFlash(p, n, insane) {                 // the black lightning
  const o = near(p, 360);
  if (!o) { punch(p, 0, true); return false; }
  p.pose = POSE.div.slice();
  hit(p, n, '#ff2440', { kb: 1200, lift: 500, stun: 1, stop: .3, heavy: 1, ring: 1 });
  if (insane && JU.kokusen && JU.kokusen.insane) JU.kokusen.insane(o, { snd: () => play('home-nanami-bf', 1, () => sfx.bf()), name: 'BLACK FLASH' });
  else { E.blackFlash(() => play('home-yuji-bf', 1, () => sfx.bf())); for (let i = 0; i < 5; i++) V.bolt(o.x + rnd(-150, 150), midOf(o) + rnd(-120, 160), o.x + rnd(-260, 260), midOf(o) + rnd(-160, 220), '#ff2440', .2, 3, '#120306'); }
  return true;
}
// ---- Cursed Speech: the word, written into the picture, and what it does
let wrung = null;                                   // TWIST: { o, t }: them, turning round where they are (spin, as the game draws it), for .9 of a second
const WORDS = { "DON'T MOVE": 'home-inu-dontmove', 'BLAST AWAY': 'home-inu-explode', TWIST: 'home-inu-twist', 'GET CRUSHED': 'home-inu-down', STOP: 'home-inu-stop' };
function say(p, text, n, how) {
  const o = E.P2;
  if (JU.manga) JU.manga.say(p, text, { life: 1.1 });
  play(WORDS[text] || 'home-inu-stop', 1, () => sfx.word && sfx.word());
  ms.ono(text === "DON'T MOVE" ? '動くな' : text === 'BLAST AWAY' ? '吹っ飛べ' : text === 'TWIST' ? '捻れろ' : text === 'GET CRUSHED' ? '潰れろ' : '止まれ', alive(o) ? o.x : p.x + p.face * 300, alive(o) ? midOf(o) + 300 : 400, .9, WORD);
  if (!alive(o)) return;
  if (how === 'freeze') { hit(p, n, WORD, { kb: 0, stun: 2.2, stop: .08 }); hold(o, 2.2); }
  else if (how === 'blast') { hit(p, n, WORD, { kb: 1600, lift: 500, stun: 1, stop: .16, heavy: 1, ring: 1 }); DK.burstFx(o.x, midOf(o), 1, { core: WORD, rgb: '241,236,255', img: 'white' }); }
  else if (how === 'twist') { hit(p, n, WORD, { kb: 300, lift: 600, stun: 1, stop: .2, heavy: 1 }); if (can(o)) wrung = { o, t: 0 }; }
  else if (how === 'crush') { hit(p, n, WORD, { kb: 100, stun: 1.2, stop: .2, heavy: 1, ring: 1 }); if (can(o)) Object.assign(o, { y: Math.max(o.y, 1), vy: -2600, ground: false, state: 'air' }); R.floorHit(o, o.x); }
}
// ---- Copy: what Rika has taken from others
const CYAN = { core: '#7fe9ff', rgb: '127,233,255', img: 'blue' }, REDC = { core: '#ff3355', rgb: '255,51,85', img: 'red' };
function granite(p, n, w = 60, down) {
  const z = E.hand(p, true), o = E.P2, tx = alive(o) ? o.x : p.x + p.face * 900, ty = alive(o) ? midOf(o) : (down ? 0 : z[1]);
  const L = Math.hypot(tx - z[0], ty - z[1]) || 1, a = { x0: z[0], y0: z[1], x1: z[0] + (tx - z[0]) / L * 1800, y1: Math.max(0, z[1] + (ty - z[1]) / L * 1800) };
  DK.beam(a.x0, a.y0, a.x1, a.y1, w, .34, CYAN); sfx.cannon(1);
  if (alive(o) && DK.onLine(o, a, w)) { hit(p, n, CYAN.core, { kb: 1000, lift: 350, stun: .9, stop: .14, heavy: 1 }); DK.impact(o.x, midOf(o), 1, CYAN); return true; }
  return false;
}
function dismantle(p, n, k = 3, big) {              // invisible cuts: the picture parted where they go through
  const o = E.P2, x = alive(o) ? o.x : p.x + p.face * 300, y = alive(o) ? midOf(o) : 200;
  for (let i = 0; i < k; i++) E.after(i * .07, () => { if (!tech) return; const a = rnd(-1.2, 1.2); if (C && C.slice) C.slice(x + rnd(-40, 40), y + rnd(-60, 60), a, big ? 1200 : 700, { shift: big ? 22 : 12, life: .5 }); play('home-lr-slash', .5, () => sfx.cut(1)); if (alive(o)) hit(p, n, '#ff2440', { kb: i === k - 1 ? 800 : 30, lift: i === k - 1 ? 300 : 0, stun: .6, stop: .05 }); });
}
function swap(p) {                                  // Boogie Woogie: a clap, and the two of them have changed places
  const o = E.P2;
  play('home-lr-parry', .4); sfx.hit(false); V.ring(p.x, p.y + 220, 150, '#7ad7ff', .2);
  if (!alive(o) || duel()) return;
  const x = p.x; p.x = clamp(o.x, -960, 960); if (can(o)) o.x = clamp(x, -960, 960); p.face = sideOf(p, o);
  V.ring(p.x, p.y + 160, 180, '#7ad7ff', .25); hold(o, .5);
}
function red(p, n) {                                // Reversal: Red, thrown
  const o = E.P2, w = E.hand(p, true);
  DK.fire({ x: w[0], y: w[1], vx: p.face * 2400, vy: 0, r: 26, dmg: M(n), Cc: REDC, orb: true, home: 6, down: 1, life: 1.4, h: { kb: 1500, lift: 500, stun: 1, stop: .2, heavy: 1, ring: 1 } });
  play('home-gojo-red', .7, () => sfx.cannon(1)); void o;
}
// ---- manga
const big = (p, word, col, kind = 'bw', snd) => { ms.bigHit(p, E.P2, word, col, kind); if (snd) play(snd, .85); };

/* ================= the six modes ================= */
// v(keys, name, dur, steps, poses): keys like 'R1a' (in the air), 'R4h' (held), 'R1 R2' (a run), 'R2 K3' (into another mode)
const LET = { R: 'rika', K: 'katana', F: 'fists', S: 'speech', C: 'copy', M: 'mutual' }, KEY = { 1: 'strikes', 2: 'crush', 3: 'div', 4: 'manji' };
function move(name, dur, steps, poses, o = {}) { return ms.script(name, dur, steps, Object.assign({ poses, rate: 44 }, o)); }
function v(keys, name, dur, steps, poses, o = {}) {
  const def = move(name, dur, steps, poses, o); def.lrVar = 1; if (/K|M3/.test(keys) || o.sword) def.sword = 1;      // (sword: his katana in his hand for it)
  const parts = keys.split(' '), last = parts[parts.length - 1], kind = parts.length > 1 ? 'seq' : /a$/.test(last) ? 'air' : /h$/.test(last) ? 'held' : 'seq';
  const seq = parts.map(s => [LET[s[0]], KEY[s[1]]]);
  return { keys, name, def, kind, seq, mode: seq[0][0], key: seq[seq.length - 1][1], to: seq.length > 1 && seq[seq.length - 1][0] !== seq[0][0] ? seq[seq.length - 1][0] : null };
}
const S_ = (t, fn) => [t, fn];
const MODES = {};

/* ---------- RIKA ---------- */
MODES.rika = { name: 'Rika', short: 'RIKA', jp: '里香', col: LILAC,
  base: {
    strikes: move('Rika Swipe', .7, [S_(.15, p => swipe(p, 28))], [[0, 'manjiWind'], [.6, 'idle']], { def: { cd: 3 } }),
    crush: move('Rika Grab', 1.2, [S_(.1, (p, o, m) => grab(p, m)), [.15, .55, (p, o, m, u) => { if (m.held) carry(p, m, lerp(m.held.x, p.x + p.face * 220, u), midOf(m.held) + 220 * u); }], S_(.6, (p, o, m) => slam(p, m, 50))], [[0, 'kiReach' in POSE ? 'kiReach' : 'jab'], [1, 'idle']], { def: { cd: 7 } }),
    div: move('Rika Scream', 1, [S_(.12, p => scream(p, 35))], [[0, 'manjiWind'], [.8, 'idle']], { def: { cd: 9 } }),
    manji: move('Pure Love Beam', 1.6, [S_(.05, p => { rika('beam', 1.4); sfx.charge(); }), S_(.9, p => beam(p, 80))], [[0, 'manjiWind'], [1.3, 'idle']], { def: { cd: 12 } })
  },
  esp: { name: 'Rika Guard', jp: '守', cd: 12, guard: 'rika' },
  inmode: [
    v('R1 R2 R3', "Rika's Rampage", 2, [S_(.05, (p, o, m) => grab(p, m)), ...[0, 1, 2].map(i => [.15 + i * .4, .5 + i * .4, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * (180 + 140 * Math.sin(u * Math.PI)), 200 + 300 * Math.sin(u * Math.PI)); }]), ...[0, 1, 2].map(i => S_(.52 + i * .4, (p, o, m) => { const q = m.held; if (q && i < 2) { R.floorHit(q, q.x); hit(p, 30, LILAC, { kb: 0, stun: 1.2, stop: .1 }, q); } else slam(p, m, 30); })), S_(1.4, p => { scream(p, 10); big(p, 'ドゴォ', LILAC, 'red'); })], [[0, 'manjiWind'], [1.8, 'idle']]),
    v('R1 R2', 'Claw and Catch', 1.3, [S_(.05, (p, o, m) => grab(p, m)), [.1, .6, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * 200, 200 + 380 * u); }], S_(.62, (p, o, m) => slam(p, m, 60, true))], [[0, 'jab'], [1, 'idle']]),
    v('R1a', 'Falling Claws', .8, [S_(.12, p => { swipe(p, 34, { reach: 600, h: { kb: 300, stun: .8 } }); const o = E.P2; if (can(o) && !o.ground) o.vy = -2000; })], [[0, 'crushWind'], [.6, 'fall']], { face: true }),
    v('R1h', 'Rending Claws', 1.1, [0, 1, 2].map(i => S_(.1 + i * .22, p => swipe(p, 16, { reach: 600, h: i < 2 ? { kb: 0, stun: .7 } : { kb: 800, lift: 400, stun: .9 } }))), [[0, 'manjiWind'], [.9, 'idle']]),
    v('R2 R1', 'Crushing Swipe', 1.1, [S_(.08, p => stomp(p, 20)), S_(.5, p => swipe(p, 30, { reach: 700 })), S_(.55, p => big(p, 'ザン', LILAC))], [[0, 'kiReach' in POSE ? 'kiReach' : 'jab'], [.5, 'manjiWind'], [.9, 'idle']]),
    v('R3 R1 R4', 'Wail, Rend, Love', 2.2, [S_(.05, p => scream(p, 20)), S_(.5, p => swipe(p, 30, { reach: 900 })), S_(.75, p => { rika('beam', 1.2); sfx.charge(); }), S_(1.5, p => { beam(p, 70, 150); big(p, '純愛', LILAC, 'bw', 'home-gojo-purple-boom'); })], [[0, 'manjiWind'], [2, 'idle']]),
    v('R2a', 'Sky Grab', 1.2, [S_(.05, (p, o, m) => grab(p, m)), [.1, .55, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * 200, lerp(400, 700, u)); }], S_(.6, (p, o, m) => slam(p, m, 55))], [[0, 'jab'], [1, 'fall']]),
    v('R1 R3', 'Shredding Wail', 1.4, [S_(.05, p => scream(p, 20)), ...[0, 1, 2, 3].map(i => S_(.4 + i * .12, p => swipe(p, 10, { reach: 900, h: { kb: 0, stun: 1 } })))], [[0, 'manjiWind'], [1.2, 'idle']]),
    v('R4h', 'Pure Love: Overflow', 2, [S_(.05, p => { rika('beam', 1.8); sfx.charge(); play('home-tdc-charge', .7); }), S_(1.3, p => { beam(p, 130, 220); big(p, 'ドォォン', LILAC, 'bw', 'home-gojo-purple-boom'); })], [[0, 'manjiWind'], [1.8, 'idle']]),
    v('R3a', 'Wailing Dive', 1, [S_(.05, p => { p.vy = -2200; scream(p, 40); })], [[0, 'crush'], [.8, 'idle']]),
    v('R3 R4', 'Scream into Love', 1.6, [S_(.05, p => scream(p, 25)), S_(.2, p => { rika('beam', 1.2); }), S_(.85, p => beam(p, 70, 140))], [[0, 'manjiWind'], [1.4, 'idle']]),
    v('R2 R4 R1', 'Love Crush', 2, [S_(.05, (p, o, m) => grab(p, m)), [.1, .7, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * 260, 260 + 120 * Math.sin(u * 9)); }], ...[0, 1, 2, 3, 4].map(i => S_(.15 + i * .12, (p, o, m) => { if (m.held) { hit(p, 8, LILAC, { kb: 0, stun: 1, stop: .03 }, m.held); play('home-love-crunch', .5); } })), S_(.8, (p, o, m) => slam(p, m, 40)), S_(1.2, p => swipe(p, 30, { reach: 900 })), S_(1.25, p => big(p, 'グシャ', LILAC, 'red'))], [[0, 'jab'], [1.8, 'idle']]),
    v('R4a', 'Raining Love', 1.4, [S_(.05, p => { rika('beam', 1.2); p.vy = Math.max(p.vy, 0); }), S_(.7, p => beam(p, 75, 130))], [[0, 'manjiWind'], [1.2, 'fall']], { hover: true }),
    v('R4 R2', 'Beam Catch', 1.4, [S_(.05, (p, o, m) => grab(p, m)), [.1, .6, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * lerp(500, 220, u), 300); }], S_(.65, (p, o, m) => slam(p, m, 65))], [[0, 'jab'], [1.2, 'idle']]),
    v('R2 R3', 'Held and Howled', 1.5, [S_(.05, (p, o, m) => grab(p, m)), [.1, .9, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * 170, 330); }], S_(.3, p => scream(p, 30)), S_(.95, (p, o, m) => slam(p, m, 40))], [[0, 'jab'], [1.3, 'idle']]),
    v('R4 R3 R2', 'Heartbreak', 2.2, [S_(.05, p => stomp(p, 30)), S_(.6, p => scream(p, 30)), S_(1, (p, o, m) => grab(p, m)), [1.05, 1.5, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * 200, 200 + 400 * u); }], S_(1.55, (p, o, m) => { slam(p, m, 60); big(p, '失恋', LILAC, 'red', 'home-love-crunch'); })], [[0, 'kiReach' in POSE ? 'kiReach' : 'jab'], [2, 'idle']])
  ],
  cross: [
    v('R1 K1', 'Blade and Claw', 1, [S_(.02, p => front(p)), S_(.08, p => cut(p, 25, { big: true, slice: true })), S_(.3, p => swipe(p, 25))], [[0, 'lrCutA'], [.3, 'lrCutC'], [.8, 'idle']]),
    v('R2 K3', 'Held for the Sword', 1.6, [S_(.05, (p, o, m) => grab(p, m)), [.1, 1.2, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * 180, 300); }], ...[0, 1, 2, 3, 4, 5].map(i => S_(.25 + i * .14, (p, o, m) => { if (m.held) { cut(p, 0, { only: true }); hit(p, 10, LILAC, { kb: 0, stun: 1, stop: .03 }, m.held); } })), S_(1.25, (p, o, m) => slam(p, m, 10, true))], [[0, 'lrCutA'], [.5, 'lrCutB'], [1.4, 'idle']]),
    v('R3 K2', 'Scream Slash', 1.2, [S_(.05, p => scream(p, 20)), S_(.35, p => wave(p, 35, { big: true }))], [[0, 'manjiWind'], [.35, 'lrCutB'], [1, 'idle']]),
    v('R4 K4', 'Love Thrust Beam', 1.6, [S_(.05, p => { rika('beam', 1.2); }), S_(.7, p => beam(p, 50, 120)), S_(.9, p => front(p, 150)), S_(.95, p => { thrust(p, 40); big(p, '貫', LILAC); })], [[0, 'manjiWind'], [.9, 'lrThrust'], [1.4, 'idle']]),
    v('R2 F1', 'Held and Hit', 1.5, [S_(.05, (p, o, m) => grab(p, m)), [.1, 1.1, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * 150, 200); }], ...[0, 1, 2, 3, 4].map(i => S_(.25 + i * .15, (p, o, m) => { if (m.held) { hit(p, 12, FIST, { kb: 0, stun: 1, stop: .04 }, m.held); sfx.hit(i === 4); } })), S_(1.12, (p, o, m) => slam(p, m, 8, true))], [[0, 'jab'], [.25, 'cross'], [1.3, 'idle']]),
    v('R4 F3', 'Black Flash of Love', 1.6, [S_(.05, p => rika('beam', 1)), S_(.6, p => beam(p, 40, 100)), S_(.75, p => front(p, 140)), S_(.8, p => { blackFlash(p, 60, true); })], [[0, 'manjiWind'], [.75, 'divWind'], [.8, 'div'], [1.4, 'idle']]),
    v('R3 S1', "DON'T MOVE, RIKA", 1.5, [S_(.05, p => say(p, "DON'T MOVE", 20, 'freeze')), S_(.6, p => stomp(p, 50))], [[0, 'idle'], [1.3, 'idle']]),
    v('R1 C1', 'Copied Claw: Granite', 1.2, [S_(.05, p => swipe(p, 30)), S_(.4, p => granite(p, 40, 80))], [[0, 'manjiWind'], [.4, AIMP()], [1, 'idle']]),
    v('R4 M1', 'Love Rains Swords', 1.8, [S_(.05, p => rika('beam', 1)), S_(.6, p => beam(p, 40, 100)), S_(.8, p => rainSwords(p, 8, 7, 'fall'))], [[0, 'manjiWind'], [1.6, 'idle']])
  ] };
function AIMP() { return [-.14, -.08, 2.75, 2.5, .5, -.5, 0]; }

/* ---------- KATANA ---------- */
MODES.katana = { name: 'Katana', short: 'KATANA', jp: '刀', col: STEEL,
  base: {
    strikes: move('Iai Slash', .7, [S_(.02, p => front(p, 150)), S_(.1, p => cut(p, 35, { big: true, slice: true }))], [[0, 'lrWindC'], [.1, 'lrCutC'], [.55, 'idle']], { def: { cd: 3 } }),
    crush: move('Crescent Wave', .6, [S_(.12, p => wave(p, 32))], [[0, 'lrWindB'], [.12, 'lrCutB'], [.5, 'idle']], { def: { cd: 5 } }),
    div: move('Thousand Cuts', 1.3, [S_(.02, p => front(p, 140)), ...Array.from({ length: 10 }, (_, i) => S_(.08 + i * .085, p => { cut(p, 6, { h: i === 9 ? { kb: 800, lift: 400, stun: .9 } : { kb: 0, stun: .6 } }); p.pose = (i % 2 ? POSE.lrCutA : POSE.lrCutB).slice(); }))], [[0, 'lrCutA'], [1.1, 'idle']], { def: { cd: 8 } }),
    manji: move('Love Thrust', .9, [S_(.02, p => sfx.whoosh()), [.05, .3, (p, o) => { if (alive(o) && Math.abs(o.x - p.x) > 160) p.vx = p.face * 2400; }], S_(.32, p => { thrust(p, 65); })], [[0, 'lrCrouch'], [.05, 'dash'], [.32, 'lrThrust'], [.75, 'idle']], { def: { cd: 10 }, keepVx: false })
  },
  esp: { name: 'Parry', jp: '受', cd: 11, guard: 'katana' },
  inmode: [
    v('K1 K2 K3', 'Three-Step Kata', 1.8, [S_(.02, p => front(p)), S_(.08, p => cut(p, 30, { big: true, slice: true })), S_(.4, p => wave(p, 30)), ...[0, 1, 2, 3, 4, 5].map(i => S_(.7 + i * .08, p => { behind(p, 140, true); cut(p, 8, { h: { kb: 0, stun: .7 } }); })), S_(1.25, p => big(p, '三段', STEEL))], [[0, 'lrCutA'], [.4, 'lrCutB'], [.7, 'lrCutC'], [1.5, 'idle']]),
    v('K1 K2', 'Draw and Release', 1, [S_(.02, p => front(p)), S_(.08, p => cut(p, 35, { big: true })), S_(.4, p => wave(p, 30, { big: true }))], [[0, 'lrCutC'], [.4, 'lrCutB'], [.8, 'idle']]),
    v('K1a', 'Falling Iai', .8, [S_(.05, p => { front(p, 110); p.vy = -1800; }), S_(.12, p => { cut(p, 40, { big: true, slice: true, h: { kb: 200, stun: 1 } }); const o = E.P2; if (can(o) && !o.ground) o.vy = -2200; })], [[0, 'lrWindC'], [.12, 'lrCutC'], [.6, 'fall']]),
    v('K1h', 'Charged Iai', 1, [S_(.02, p => { play('home-lr-draw', .8); front(p, 150); }), S_(.15, p => { cut(p, 90, { big: true, slice: true, h: { kb: 1400, lift: 500, stun: 1, stop: .22, heavy: 1, ring: 1 } }); big(p, '居合', STEEL); })], [[0, 'lrCrouch'], [.15, 'lrCutC'], [.8, 'idle']]),
    v('K2 K1', 'Chase the Crescent', 1, [S_(.05, p => wave(p, 25)), S_(.3, p => behind(p, 150)), S_(.35, p => cut(p, 30, { big: true }))], [[0, 'lrCutB'], [.35, 'lrCutC'], [.8, 'idle']]),
    v('K3 K2 K1', 'Reverse Kata', 1.8, [...[0, 1, 2, 3, 4, 5].map(i => S_(.05 + i * .08, p => { (i % 2 ? behind : front)(p, 140, true); cut(p, 8, { h: { kb: 0, stun: .7 } }); })), S_(.6, p => wave(p, 30, { big: true })), S_(.95, p => { front(p, 150); cut(p, 32, { big: true, slice: true }); big(p, '斬', STEEL); })], [[0, 'lrCutA'], [.6, 'lrCutB'], [.95, 'lrCutC'], [1.5, 'idle']]),
    v('K2a', 'Moon Crescent', .8, [S_(.08, p => wave(p, 36, { big: true }))], [[0, 'lrWindB'], [.08, 'lrCutB'], [.6, 'fall']], { hover: true }),
    v('K1 K3', 'Iai Flurry', 1.4, [S_(.02, p => front(p)), S_(.06, p => cut(p, 25, { big: true })), ...Array.from({ length: 6 }, (_, i) => S_(.3 + i * .09, p => { cut(p, 7, { h: i === 5 ? { kb: 900, lift: 400, stun: .9 } : { kb: 0, stun: .6 } }); p.pose = (i % 2 ? POSE.lrCutA : POSE.lrCutB).slice(); }))], [[0, 'lrCutC'], [1.2, 'idle']]),
    v('K2h', 'Twin Crescents', .9, [S_(.08, p => wave(p, 32)), S_(.28, p => wave(p, 32, { big: true }))], [[0, 'lrCutA'], [.28, 'lrCutB'], [.7, 'idle']]),
    v('K3a', 'Whirlwind', 1, [S_(.01, p => front(p, 120)), ...Array.from({ length: 6 }, (_, i) => S_(.05 + i * .1, p => { cut(p, 8, { reach: 420, h: { kb: 0, lift: 120, stun: .6 } }); p.spin = Math.cos(i * Math.PI); }))], [[0, 'lrCutA'], [.8, 'fall']], { hover: true }),
    v('K3 K4', 'Final Thrust', 1.4, [...Array.from({ length: 5 }, (_, i) => S_(.05 + i * .08, p => cut(p, 8, { h: { kb: 0, stun: .7 } }))), S_(.5, p => front(p, 170)), S_(.55, p => { thrust(p, 45); big(p, '貫', STEEL); })], [[0, 'lrCutA'], [.55, 'lrThrust'], [1.2, 'idle']]),
    v('K2 K3 K4', 'Rising Moon', 1.9, [S_(.05, p => wave(p, 25)), S_(.3, p => { front(p); const o = E.P2; hit(p, 25, LILAC, { kb: 0, lift: 1300, stun: 1 }); cut(p, 0, { big: true, only: true }); }), S_(.75, p => { const o = E.P2; if (alive(o)) { p.x = clamp(o.x - p.face * 120, -960, 960); p.y = Math.max(0, o.y + 40); p.vy = 0; p.ground = false; } }), ...[0, 1, 2].map(i => S_(.8 + i * .1, p => cut(p, 12, { reach: 500, h: { kb: 0, stun: .8 } }))), S_(1.15, p => { thrust(p, 34); const o = E.P2; if (can(o) && !o.ground) o.vy = -2400; big(p, '月', STEEL); })], [[0, 'lrCutB'], [.3, 'lrCutC'], [.8, 'lrCutA'], [1.15, 'lrThrust'], [1.6, 'fall']], { hover: true }),
    v('K4a', 'Meteor Thrust', 1, [S_(.03, p => { front(p, 90); p.vy = -2600; leap(p, .15); }), [.05, .5, (p, o, m) => { m.mv = 1; if (!m.h && alive(o) && Math.abs(o.x - p.x) < 180 && Math.abs(o.y - p.y) < 280) { m.h = 1; thrust(p, 60); } if (p.ground && !m.l) { m.l = 1; p.vx = 0; E.addDust(p.x); V.crack(p.x, 200); } }]], [[0, 'lrThrust'], [.8, 'idle']], { keepVx: true }),
    v('K4 K1', 'Return Cut', 1, [S_(.05, p => behind(p, 140)), S_(.1, p => cut(p, 55, { big: true, slice: true, h: { kb: 1200, lift: 400, stun: 1 } }))], [[0, 'lrCutC'], [.8, 'idle']]),
    v('K2 K4', 'Pierce the Wave', 1.1, [S_(.05, p => wave(p, 30, { pierce: true })), S_(.25, p => front(p, 160)), S_(.3, p => thrust(p, 40))], [[0, 'lrCutB'], [.3, 'lrThrust'], [.9, 'idle']]),
    v('K4 K3 K2', 'Falling Moon', 1.9, [S_(.05, p => { front(p, 150); thrust(p, 25); const o = E.P2; if (can(o)) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 1), vy: 1300 }); }), S_(.5, p => { const o = E.P2; if (alive(o)) { p.x = clamp(o.x - p.face * 110, -960, 960); p.y = Math.max(0, o.y + 60); p.vy = 0; p.ground = false; } }), ...[0, 1, 2, 3].map(i => S_(.55 + i * .09, p => cut(p, 10, { reach: 500, h: { kb: 0, stun: .8 } }))), S_(1, p => { wave(p, 40, { big: true, h: { kb: 300, stun: 1 } }); const o = E.P2; if (can(o) && !o.ground) o.vy = -2400; big(p, '落月', STEEL); })], [[0, 'lrThrust'], [.55, 'lrCutA'], [1, 'lrCutB'], [1.6, 'fall']], { hover: true })
  ],
  cross: [
    v('K1 R1', 'Claw After Cut', 1, [S_(.02, p => front(p)), S_(.06, p => cut(p, 30, { big: true })), S_(.3, p => swipe(p, 25))], [[0, 'lrCutC'], [.3, 'manjiWind'], [.8, 'idle']]),
    v('K3 R2', 'Cut and Catch', 1.4, [...[0, 1, 2, 3].map(i => S_(.03 + i * .07, p => cut(p, 8, { h: { kb: 0, stun: .8 } }))), S_(.35, (p, o, m) => grab(p, m)), [.4, .85, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * 200, 200 + 300 * u); }], S_(.9, (p, o, m) => slam(p, m, 38))], [[0, 'lrCutA'], [.35, 'jab'], [1.2, 'idle']]),
    v('K2 R4', 'Wave of Love', 1.5, [S_(.05, p => wave(p, 30, { big: true })), S_(.15, p => rika('beam', 1.2)), S_(.8, p => beam(p, 60, 130))], [[0, 'lrCutB'], [.3, 'manjiWind'], [1.3, 'idle']]),
    v('K4 R3', 'Thrust and Wail', 1.3, [S_(.02, p => front(p, 160)), S_(.06, p => thrust(p, 45)), S_(.4, p => scream(p, 35))], [[0, 'lrThrust'], [.4, 'manjiWind'], [1.1, 'idle']]),
    v('K1 F3', 'Black Flash Cut', 1.2, [S_(.02, p => front(p)), S_(.06, p => cut(p, 30, { big: true })), S_(.32, p => front(p, 130, true)), S_(.35, p => blackFlash(p, 65, true))], [[0, 'lrCutC'], [.3, 'divWind'], [.35, 'div'], [1, 'idle']]),
    v('K3 F1', 'Hilt Strikes', 1.2, [S_(.02, p => front(p, 130)), ...[0, 1, 2, 3, 4].map(i => S_(.06 + i * .12, p => punch(p, 12, i === 4, i === 4 ? { kb: 1000, lift: 300 } : { kb: 0, stun: .7 })))], [[0, 'jab'], [1, 'idle']]),
    v('K2 S2', 'BLAST AWAY', 1.2, [S_(.05, p => wave(p, 25)), S_(.4, p => say(p, 'BLAST AWAY', 45, 'blast'))], [[0, 'lrCutB'], [1, 'idle']]),
    v('K4 C2', 'Copied: Dismantle', 1.4, [S_(.02, p => front(p, 160)), S_(.06, p => thrust(p, 30)), S_(.4, p => dismantle(p, 18, 3, true)), S_(.65, p => big(p, '解', '#ff2440'))], [[0, 'lrThrust'], [.4, 'kiReach' in POSE ? 'kiReach' : 'jab'], [1.2, 'idle']]),
    v('K1 M2', 'Blade Garden Iai', 1.4, [S_(.02, p => front(p)), S_(.06, p => cut(p, 30, { big: true, slice: true })), S_(.35, p => rainSwords(p, 6, 10, 'rise'))], [[0, 'lrCutC'], [1.2, 'idle']])
  ] };

/* ---------- FISTS ---------- */
MODES.fists = { name: 'Fists', short: 'FISTS', jp: '拳', col: FIST,
  base: {
    strikes: move('Cursed Jabs', .8, [S_(.02, p => front(p, 140)), ...[0, 1, 2, 3].map(i => S_(.06 + i * .12, p => punch(p, 9, i === 3, i === 3 ? { kb: 700, lift: 300 } : {})))], [[0, 'jab'], [.7, 'idle']], { def: { cd: 3 } }),
    crush: move('Rising Knee', .8, [S_(.02, p => front(p, 120)), S_(.1, p => { p.vy = 900; p.ground = false; const o = near(p, 300); if (o) { hit(p, 45, FIST, { kb: 200, lift: 1200, stun: 1, stop: .12, heavy: 1 }); play('home-love-slam', .7); V.sparks(o.x, midOf(o), 'red', 10); } })], [[0, 'kickWind'], [.1, KNEEP()], [.6, 'fall']], { def: { cd: 5 } }),
    div: move('Black Flash', 1, [S_(.02, p => front(p, 130)), S_(.25, p => { if (blackFlash(p, 90, true)) big(p, '黒閃', '#ff2440', 'red'); })], [[0, 'divWind'], [.25, 'div'], [.8, 'idle']], { def: { cd: 10 } }),
    manji: move('Ground Pound', .9, [S_(.05, p => { p.vy = 1000; p.ground = false; leap(p, .45); }), S_(.3, p => { p.vy = -2600; }), [.3, .85, (p, o, m) => { if (p.ground && !m.l) { m.l = 1; p.vx = 0; DK.burstFx(p.x, 40, 1, { core: FIST, rgb: '255,107,154', img: 'red' }); V.crack(p.x, 300); R.floorHit({ x: p.x }, p.x); if (alive(o) && Math.abs(o.x - p.x) < 340 && o.y < 200) hit(p, 60, FIST, { kb: 900, lift: 800, stun: 1, stop: .18, heavy: 1, ring: 1 }); } }]], [[0, 'crushWind'], [.3, 'crush'], [.8, 'idle']], { def: { cd: 9 }, keepVx: true })
  },
  esp: { name: 'Counter Elbow', jp: '肘', cd: 11, guard: 'fists' },
  inmode: [
    v('F1 F2 F3', 'Hand to Hand', 1.8, [S_(.02, p => front(p, 140)), ...[0, 1, 2].map(i => S_(.06 + i * .1, p => punch(p, 12))), S_(.4, p => { const o = near(p, 300); if (o) hit(p, 30, FIST, { kb: 100, lift: 1100, stun: 1 }); p.vy = 900; p.ground = false; }), S_(.75, p => { const o = E.P2; if (alive(o)) { p.x = clamp(o.x - p.face * 120, -960, 960); p.y = Math.max(0, o.y - 20); p.vy = 0; } }), S_(.8, p => { if (blackFlash(p, 74, true)) big(p, '黒閃', '#ff2440', 'red'); })], [[0, 'jab'], [.4, KNEEP()], [.8, 'div'], [1.5, 'fall']], { hover: true }),
    v('F1 F2', 'Jab to Knee', 1, [S_(.02, p => front(p, 130)), ...[0, 1].map(i => S_(.05 + i * .1, p => punch(p, 10))), S_(.3, p => { const o = near(p, 300); if (o) hit(p, 35, FIST, { kb: 200, lift: 1200, stun: 1, stop: .12, heavy: 1 }); play('home-love-slam', .7); })], [[0, 'jab'], [.3, KNEEP()], [.8, 'idle']]),
    v('F1a', 'Air Jabs', .8, [S_(.02, p => front(p, 130)), ...[0, 1, 2, 3].map(i => S_(.05 + i * .1, p => punch(p, 9, i === 3, i === 3 ? { kb: 800 } : { lift: 100 })))], [[0, 'jab'], [.7, 'fall']], { hover: true }),
    v('F3h', 'Black Flash: Charged', 1.4, [S_(.05, p => { sfx.charge(); play('home-tdc-charge', .6); }), S_(.55, p => front(p, 130)), S_(.6, p => { if (blackFlash(p, 140, true)) big(p, '黒閃', '#ff2440', 'red', 'home-gojo-purple-boom'); })], [[0, 'divWind'], [.6, 'div'], [1.2, 'idle']]),
    v('F2 F1', 'Knee to Jabs', 1.2, [S_(.02, p => front(p, 120)), S_(.05, p => { const o = near(p, 300); if (o) hit(p, 20, FIST, { kb: 0, lift: 900, stun: 1 }); }), S_(.4, p => { const o = E.P2; if (alive(o)) { p.y = Math.max(0, o.y - 20); p.vy = 0; p.ground = false; p.x = clamp(o.x - p.face * 120, -960, 960); } }), ...[0, 1, 2].map(i => S_(.45 + i * .1, p => punch(p, 9, i === 2, i === 2 ? { kb: 1000 } : { lift: 80 })))], [[0, KNEEP()], [.45, 'jab'], [1, 'fall']], { hover: true }),
    v('F4 F2 F1', 'Ground and Pound', 1.9, [S_(.05, p => { R.floorHit({ x: p.x }, p.x); const o = E.P2; if (alive(o) && Math.abs(o.x - p.x) < 400) { hit(p, 30, FIST, { kb: 0, lift: 0, stun: 1.3 }); if (can(o)) Object.assign(o, { state: 'down', stun: 1.4, ground: true, y: 0 }); } }), ...Array.from({ length: 6 }, (_, i) => S_(.4 + i * .14, p => { front(p, 110, true); const o = E.P2; if (alive(o)) { hit(p, 10, FIST, { kb: 0, stun: 1, stop: .04 }); play('home-love-slam', .4); V.crack(o.x, 140); } p.pose = POSE.crush.slice(); })), S_(1.3, p => { const o = E.P2; if (alive(o)) hit(p, 30, FIST, { kb: 1100, lift: 700, stun: 1, stop: .2, heavy: 1, ring: 1 }); big(p, 'ドドド', FIST, 'red'); })], [[0, 'crush'], [1.3, 'div'], [1.7, 'idle']]),
    v('F2a', 'Falling Knee', .9, [S_(.03, p => { front(p, 90); p.vy = -2200; leap(p, .15); }), [.05, .6, (p, o, m) => { m.mv = 1; if (!m.h && alive(o) && Math.abs(o.x - p.x) < 170 && Math.abs(o.y - p.y) < 260) { m.h = 1; hit(p, 45, FIST, { kb: 600, lift: 500, stun: 1, stop: .14, heavy: 1 }); play('home-love-slam', .8); } if (p.ground) p.vx = 0; }]], [[0, KNEEP()], [.7, 'idle']], { keepVx: true }),
    v('F1 F3', 'Into the Black', 1.2, [S_(.02, p => front(p, 130)), ...[0, 1].map(i => S_(.05 + i * .1, p => punch(p, 10))), S_(.4, p => { if (blackFlash(p, 75, true)) big(p, '黒閃', '#ff2440', 'red'); })], [[0, 'jab'], [.4, 'div'], [1, 'idle']]),
    v('F1h', 'Rush', 1.3, [S_(.02, p => front(p, 130)), ...Array.from({ length: 8 }, (_, i) => S_(.05 + i * .1, p => punch(p, 7, i === 7, i === 7 ? { kb: 1200, lift: 400 } : { kb: 0, stun: .6 })))], [[0, 'jab'], [1.1, 'idle']]),
    v('F3a', 'Black Flash Dive', 1, [S_(.05, p => { const o = E.P2; if (alive(o)) { p.x = clamp(o.x - p.face * 120, -960, 960); p.y = Math.max(0, o.y); } }), S_(.1, p => { if (blackFlash(p, 90, true)) { big(p, '黒閃', '#ff2440', 'red'); const o = E.P2; if (can(o) && !o.ground) o.vy = -2200; } })], [[0, 'divWind'], [.1, 'div'], [.8, 'fall']]),
    v('F3 F4', 'Black Pound', 1.4, [S_(.05, p => { p.vy = 1100; p.ground = false; }), S_(.35, p => { const o = E.P2; if (alive(o)) p.x = clamp(o.x - p.face * 60, -960, 960); p.vy = -2800; }), [.35, 1.1, (p, o, m) => { if (p.ground && !m.l) { m.l = 1; R.floorHit({ x: p.x }, p.x); E.blackFlash(() => play('home-yuji-bf', 1, () => sfx.bf())); if (alive(o) && Math.abs(o.x - p.x) < 340) hit(p, 90, '#ff2440', { kb: 1000, lift: 900, stun: 1, stop: .3, heavy: 1, ring: 1 }); big(p, '黒閃', '#ff2440', 'red'); } }]], [[0, 'crushWind'], [.35, 'crush'], [1.2, 'idle']]),
    v('F4a', 'Meteor Pound', 1, [S_(.05, p => { p.vy = -2800; leap(p, .25); }), [.05, .8, (p, o, m) => { if (p.ground && !m.l) { m.l = 1; p.vx = 0; DK.burstFx(p.x, 40, 1.3, { core: FIST, rgb: '255,107,154', img: 'red' }); V.crack(p.x, 340); if (alive(o) && Math.abs(o.x - p.x) < 380 && o.y < 220) hit(p, 70, FIST, { kb: 1000, lift: 900, stun: 1, stop: .2, heavy: 1, ring: 1 }); } }]], [[0, 'crush'], [.85, 'idle']], { keepVx: true })
  ],
  cross: [
    v('F1 R2', 'Pass to Rika', 1.5, [S_(.02, p => front(p, 130)), ...[0, 1].map(i => S_(.05 + i * .1, p => punch(p, 10))), S_(.3, (p, o, m) => grab(p, m)), [.35, .9, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * 220, 200 + 350 * u); }], S_(.95, (p, o, m) => slam(p, m, 45))], [[0, 'jab'], [.3, 'manjiWind'], [1.3, 'idle']]),
    v('F3 R4', 'Black Love', 1.8, [S_(.02, p => front(p, 130)), S_(.08, p => blackFlash(p, 60, false)), S_(.3, p => rika('beam', 1.2)), S_(.95, p => { beam(p, 60, 150); big(p, '黒愛', LILAC, 'red', 'home-gojo-purple-boom'); })], [[0, 'div'], [.3, 'manjiWind'], [1.6, 'idle']]),
    v('F2 K1', 'Knee and Iai', 1.1, [S_(.02, p => front(p, 120)), S_(.05, p => { const o = near(p, 300); if (o) hit(p, 30, FIST, { kb: 0, lift: 1000, stun: 1 }); }), S_(.45, p => { const o = E.P2; if (alive(o)) { p.y = Math.max(0, o.y - 20); p.vy = 0; p.ground = false; } front(p, 140); cut(p, 40, { big: true, slice: true }); })], [[0, KNEEP()], [.45, 'lrCutC'], [.9, 'fall']], { hover: true }),
    v('F4 K3', 'Pound and Cuts', 1.6, [S_(.05, p => { R.floorHit({ x: p.x }, p.x); const o = E.P2; if (alive(o) && Math.abs(o.x - p.x) < 400) hit(p, 25, FIST, { kb: 0, lift: 600, stun: 1 }); }), ...Array.from({ length: 8 }, (_, i) => S_(.35 + i * .09, p => { (i % 2 ? front : behind)(p, 140, true); cut(p, 8, { h: { kb: 0, stun: .7 } }); }))], [[0, 'crush'], [.35, 'lrCutA'], [1.4, 'idle']]),
    v('F1 S3', 'TWIST', 1.2, [S_(.02, p => front(p, 130)), ...[0, 1].map(i => S_(.05 + i * .1, p => punch(p, 12))), S_(.4, p => say(p, 'TWIST', 50, 'twist'))], [[0, 'jab'], [1, 'idle']]),
    v('F2 C3', 'Boogie Knee', 1.2, [S_(.02, p => front(p, 120)), S_(.05, p => { const o = near(p, 300); if (o) hit(p, 25, FIST, { kb: 0, lift: 700, stun: 1 }); }), S_(.35, p => swap(p)), S_(.45, p => { front(p, 130, true); punch(p, 45, true, { kb: 1200, lift: 300 }); })], [[0, KNEEP()], [.45, 'cross'], [1, 'fall']]),
    v('F3 M3', 'Black Flash Blade', 1.4, [S_(.02, p => front(p, 130)), S_(.08, p => blackFlash(p, 55, false)), S_(.45, p => { rainSwords(p, 3, 0, 'rise'); front(p, 150); cut(p, 55, { big: true, slice: true, col: MUT }); big(p, '刀', MUT); })], [[0, 'div'], [.45, 'lrCutC'], [1.2, 'idle']])
  ] };
function KNEEP() { return [.2, .1, 1.2, .6, 2.3, -.3, 0]; }

/* ---------- CURSED SPEECH ---------- */
MODES.speech = { name: 'Cursed Speech', short: 'SPEECH', jp: '呪言', col: WORD,
  base: {
    strikes: move("Don't Move", .7, [S_(.08, p => say(p, "DON'T MOVE", 15, 'freeze'))], [[0, 'idle']], { def: { cd: 6 } }),
    crush: move('Blast Away', .8, [S_(.08, p => say(p, 'BLAST AWAY', 55, 'blast'))], [[0, 'idle']], { def: { cd: 7 } }),
    div: move('Twist', .9, [S_(.08, p => say(p, 'TWIST', 60, 'twist'))], [[0, 'idle']], { def: { cd: 8 } }),
    manji: move('Get Crushed', 1, [S_(.08, p => say(p, 'GET CRUSHED', 70, 'crush'))], [[0, 'idle']], { def: { cd: 10 } })
  },
  esp: { name: 'Stop', jp: '止', cd: 12, guard: 'speech' },
  inmode: [
    v('S1 S3 S4', "Don't Move. Twist. Get Crushed.", 2.2, [S_(.05, p => say(p, "DON'T MOVE", 20, 'freeze')), S_(.75, p => say(p, 'TWIST', 50, 'twist')), S_(1.45, p => { say(p, 'GET CRUSHED', 80, 'crush'); big(p, '潰', WORD, 'bw'); })], [[0, 'idle']]),
    v('S1 S2', "Don't Move. Blast Away.", 1.5, [S_(.05, p => say(p, "DON'T MOVE", 20, 'freeze')), S_(.75, p => say(p, 'BLAST AWAY', 60, 'blast'))], [[0, 'idle']]),
    v('S1a', "Don't Move, Down There", .8, [S_(.08, p => { say(p, "DON'T MOVE", 30, 'freeze'); })], [[0, 'fall']], { hover: true }),
    v('S2h', 'Blast Away!!', 1.2, [S_(.05, p => { sfx.charge(); }), S_(.5, p => { say(p, 'BLAST AWAY', 90, 'blast'); big(p, '吹', WORD, 'neg', 'home-tdc-boom'); })], [[0, 'idle']]),
    v('S3 S4', 'Twist. Get Crushed.', 1.6, [S_(.05, p => say(p, 'TWIST', 50, 'twist')), S_(.8, p => say(p, 'GET CRUSHED', 70, 'crush'))], [[0, 'idle']]),
    v('S2 S3', 'Blast Away. Twist.', 1.6, [S_(.05, p => say(p, 'BLAST AWAY', 50, 'blast')), S_(.8, p => say(p, 'TWIST', 50, 'twist'))], [[0, 'idle']])
  ],
  cross: [
    v('S1 R2', "Don't Move: Rika Has You", 1.6, [S_(.05, p => say(p, "DON'T MOVE", 20, 'freeze')), S_(.5, (p, o, m) => grab(p, m)), [.55, 1, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * 220, 200 + 350 * u); }], S_(1.05, (p, o, m) => slam(p, m, 60))], [[0, 'idle'], [.5, 'jab'], [1.4, 'idle']]),
    v('S1 K1', "Don't Move. (Iai)", 1.2, [S_(.05, p => say(p, "DON'T MOVE", 20, 'freeze')), S_(.5, p => front(p)), S_(.55, p => cut(p, 55, { big: true, slice: true }))], [[0, 'idle'], [.55, 'lrCutC'], [1, 'idle']]),
    v('S1 F3', "Don't Move. (Black Flash)", 1.3, [S_(.05, p => say(p, "DON'T MOVE", 20, 'freeze')), S_(.5, p => front(p, 130)), S_(.6, p => { if (blackFlash(p, 90, true)) big(p, '黒閃', '#ff2440', 'red'); })], [[0, 'idle'], [.6, 'div'], [1.1, 'idle']]),
    v('S4 M1', 'Get Crushed Under Swords', 1.8, [S_(.05, p => say(p, 'GET CRUSHED', 40, 'crush')), S_(.6, p => rainSwords(p, 8, 8, 'fall'))], [[0, 'idle']])
  ] };

/* ---------- COPY ---------- */
MODES.copy = { name: 'Copy', short: 'COPY', jp: '模倣', col: COPY,
  base: {
    strikes: move('Copy: Granite Blast', .8, [S_(.2, p => granite(p, 55, 70))], [[0, AIMP()], [.6, 'idle']], { def: { cd: 5 } }),
    crush: move('Copy: Dismantle', .9, [S_(.1, p => dismantle(p, 18, 3))], [[0, 'kiReach' in POSE ? 'kiReach' : 'jab'], [.7, 'idle']], { def: { cd: 6 } }),
    div: move('Copy: Boogie Woogie', .9, [S_(.08, p => swap(p)), S_(.18, p => front(p, 130, true)), S_(.22, p => punch(p, 45, true, { kb: 1100, lift: 400 }))], [[0, 'idle'], [.2, 'cross'], [.7, 'idle']], { def: { cd: 7 } }),
    manji: move('Copy: Reversal Red', 1, [S_(.05, p => sfx.charge()), S_(.4, p => red(p, 75))], [[0, 'divWind'], [.4, 'jab'], [.8, 'idle']], { def: { cd: 11 } })
  },
  esp: { name: 'Copy: Simple Domain', jp: '簡易', cd: 12, guard: 'copy' },
  inmode: [
    v('C3 C1 C4', 'Boogie, Blast, Red', 2, [S_(.05, p => swap(p)), S_(.3, p => granite(p, 50, 80)), S_(.9, p => { red(p, 100); big(p, '赫', '#ff3355'); })], [[0, 'idle'], [.3, AIMP()], [.9, 'jab'], [1.6, 'idle']]),
    v('C1 C4', 'Granite into Red', 1.5, [S_(.05, p => granite(p, 45, 80)), S_(.6, p => red(p, 75))], [[0, AIMP()], [.6, 'jab'], [1.2, 'idle']]),
    v('C1a', 'Copy: Granite, Downward', .8, [S_(.1, p => granite(p, 55, 80, true))], [[0, AIMP()], [.6, 'fall']], { hover: true }),
    v('C2h', 'Copy: Cleave', 1.1, [S_(.05, p => sfx.charge()), S_(.45, p => { const o = E.P2; if (alive(o)) { if (C && C.slice) C.slice(o.x, midOf(o), p.face > 0 ? -.2 : Math.PI + .2, 1400, { shift: 30, life: .7 }); hit(p, 90, '#ff2440', { kb: 1200, lift: 500, stun: 1, stop: .24, heavy: 1, ring: 1 }); } big(p, '捌', '#ff2440', 'red', 'home-lr-iai'); })], [[0, 'kiReach' in POSE ? 'kiReach' : 'jab'], [.9, 'idle']]),
    v('C3 C2', 'Swap and Dismantle', 1.2, [S_(.05, p => swap(p)), S_(.25, p => dismantle(p, 22, 4, true))], [[0, 'idle'], [.9, 'idle']]),
    v('C2 C1', 'Cut, then Blast', 1.2, [S_(.05, p => dismantle(p, 15, 3)), S_(.45, p => granite(p, 40, 80))], [[0, 'jab'], [.45, AIMP()], [1, 'idle']])
  ],
  cross: [
    v('C3 R2', "Swap into Rika's Hand", 1.5, [S_(.05, p => swap(p)), S_(.2, (p, o, m) => grab(p, m)), [.25, .8, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * 200, 200 + 380 * u); }], S_(.85, (p, o, m) => slam(p, m, 60))], [[0, 'idle'], [.2, 'jab'], [1.3, 'idle']]),
    v('C2 K3', 'Dismantle and a Thousand Cuts', 1.6, [S_(.05, p => dismantle(p, 15, 3)), S_(.3, p => front(p, 140)), ...Array.from({ length: 8 }, (_, i) => S_(.35 + i * .08, p => cut(p, 7, { h: i === 7 ? { kb: 900, lift: 400 } : { kb: 0, stun: .6 } })))], [[0, 'jab'], [.35, 'lrCutA'], [1.4, 'idle']]),
    v('C3 F3', 'Boogie Woogie Black Flash', 1.2, [S_(.05, p => swap(p)), S_(.15, p => front(p, 130)), S_(.2, p => { if (blackFlash(p, 95, true)) big(p, '黒閃', '#ff2440', 'red'); })], [[0, 'idle'], [.2, 'div'], [1, 'idle']]),
    v('C4 S2', 'Blast Away into Red', 1.6, [S_(.05, p => say(p, 'BLAST AWAY', 40, 'blast')), S_(.7, p => red(p, 70))], [[0, 'idle'], [.7, 'jab'], [1.3, 'idle']])
  ] };

/* ---------- MUTUAL LOVE ---------- */
MODES.mutual = { name: 'Mutual Love', short: 'MUTUAL', jp: '相愛', col: MUT,
  base: {
    strikes: move('Sword Rain', 1, [S_(.08, p => rainSwords(p, 6, 10, 'fall'))], [[0, 'kiRaise' in POSE ? 'kiRaise' : 'jump'], [.8, 'idle']], { def: { cd: 6 } }),
    crush: move('Blade Garden', 1, [S_(.08, p => rainSwords(p, 5, 12, 'rise'))], [[0, 'crush'], [.8, 'idle']], { def: { cd: 7 } }),
    div: move('Drawn Copy', 1, [S_(.05, p => { rainSwords(p, 1, 0, 'rise'); play('home-lr-draw', .8); }), S_(.3, p => front(p, 150)), S_(.35, p => cut(p, 70, { big: true, slice: true, col: MUT }))], [[0, 'lrCrouch'], [.35, 'lrCutC'], [.85, 'idle']], { def: { cd: 8 } }),
    manji: move('Authentic Barrage', 1.4, [S_(.1, p => rainSwords(p, 12, 7, 'volley'))], [[0, 'lrWindC'], [.1, 'kiReach' in POSE ? 'kiReach' : 'jab'], [1.2, 'idle']], { def: { cd: 12 } })
  },
  esp: { name: 'Sword Wall', jp: '壁', cd: 12, guard: 'mutual' },
  inmode: [
    v('M1 M2 M4', 'Mutual Love', 2.4, [S_(.05, p => rainSwords(p, 6, 8, 'fall')), S_(.6, p => rainSwords(p, 5, 9, 'rise')), S_(1.2, p => { rainSwords(p, 12, 6, 'volley'); }), S_(1.8, p => big(p, '相愛', MUT, 'bw', 'home-gojo-purple-boom'))], [[0, 'kiRaise' in POSE ? 'kiRaise' : 'jump'], [1.2, 'lrWindC'], [2.2, 'idle']]),
    v('M1 M2', 'Rain and Garden', 1.6, [S_(.05, p => rainSwords(p, 6, 9, 'fall')), S_(.6, p => rainSwords(p, 5, 11, 'rise'))], [[0, 'kiRaise' in POSE ? 'kiRaise' : 'jump'], [1.4, 'idle']]),
    v('M1a', 'Sword Fall', 1, [S_(.08, p => rainSwords(p, 6, 10, 'fall'))], [[0, 'crush'], [.8, 'fall']], { hover: true }),
    v('M4h', 'Barrage: All of Them', 2, [S_(.05, p => { sfx.charge(); }), S_(.5, p => rainSwords(p, 20, 6, 'volley')), S_(1.3, p => big(p, '万刃', MUT, 'bw'))], [[0, 'lrWindC'], [.5, 'kiReach' in POSE ? 'kiReach' : 'jab'], [1.8, 'idle']]),
    v('M2 M3', 'Garden Draw', 1.4, [S_(.05, p => rainSwords(p, 5, 10, 'rise')), S_(.55, p => front(p, 150)), S_(.6, p => cut(p, 50, { big: true, slice: true, col: MUT }))], [[0, 'crush'], [.6, 'lrCutC'], [1.2, 'idle']]),
    v('M3 M4', 'Draw and Loose', 1.6, [S_(.02, p => front(p, 150)), S_(.06, p => cut(p, 40, { big: true, col: MUT })), S_(.4, p => rainSwords(p, 10, 8, 'volley'))], [[0, 'lrCutC'], [.4, 'kiReach' in POSE ? 'kiReach' : 'jab'], [1.4, 'idle']])
  ],
  cross: [
    v('M2 R2', 'Garden Grab', 1.6, [S_(.05, p => rainSwords(p, 4, 10, 'rise')), S_(.5, (p, o, m) => grab(p, m)), [.55, 1.05, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * 220, 200 + 350 * u); }], S_(1.1, (p, o, m) => slam(p, m, 50))], [[0, 'crush'], [.5, 'jab'], [1.4, 'idle']]),
    v('M3 K1', 'Two Swords', 1.2, [S_(.02, p => front(p, 150)), S_(.06, p => cut(p, 45, { big: true, col: MUT })), S_(.3, p => { behind(p, 150); cut(p, 55, { big: true, slice: true }); })], [[0, 'lrCutC'], [.3, 'lrCutA'], [1, 'idle']]),
    v('M1 F3', 'Black Flash in the Rain', 1.6, [S_(.05, p => rainSwords(p, 6, 8, 'fall')), S_(.65, p => front(p, 130)), S_(.7, p => { if (blackFlash(p, 70, true)) big(p, '黒閃', '#ff2440', 'red'); })], [[0, 'kiRaise' in POSE ? 'kiRaise' : 'jump'], [.7, 'div'], [1.4, 'idle']]),
    v('M4 C1', 'Copied Barrage', 1.8, [S_(.05, p => rainSwords(p, 8, 7, 'volley')), S_(.7, p => granite(p, 60, 120))], [[0, 'lrWindC'], [.7, AIMP()], [1.6, 'idle']])
  ] };

/* ================= the three techniques ================= */
// which variants a technique takes from each of its modes: n of them, up to 40% into its other modes (spread across them, and one into each
// of them if it has that many), the rest in the mode
function pick(id, modes, n) {
  const md = MODES[id], byTo = {};
  for (const x of md.cross) if (modes.includes(x.to)) (byTo[x.to] = byTo[x.to] || []).push(x);
  const rr = [];
  for (let i = 0, more = true; more; i++) { more = false; for (const to of Object.keys(byTo)) if (byTo[to][i]) { rr.push(byTo[to][i]); more = true; } }
  const xs = rr.slice(0, Math.min(Math.max(Math.floor(n * .4), modes.length - 1), rr.length)), ins = md.inmode.slice(0, n - xs.length);      // (at least one into each of the others, where there is one)
  let res = ins.concat(xs);
  if (res.length < n) res = res.concat(rr.slice(xs.length, xs.length + n - res.length));
  return res;
}
const KEYS6 = ['RMB + Z', 'RMB + X', 'T + RMB', 'Y + RMB', 'RMB + H', 'RMB + N'], MKEY = { z: 0, x: 1, t: 2, y: 3, h: 4, n: 5 };
const TIERS = [
  { id: 'tlr', name: 'True Love Reaper', jp: '真・純愛', mark: '愛', modes: ['rika', 'katana'], n: 20, mult: 1, col: '#d9b8ff', who: 'Rika and a katana: two modes', ult: 'manifest' },
  { id: 'flr', name: 'Final Love Reaper', jp: '終・純愛', mark: '終', modes: ['rika', 'katana', 'fists'], n: 16, mult: 1.2, col: '#ff8fc8', who: 'Rika, a katana and his fists: three modes', ult: 'declare' },
  { id: 'tflr', name: 'True Final Love Reaper', jp: '真終・純愛', mark: '真', modes: ['rika', 'katana', 'fists', 'speech', 'copy', 'mutual'], n: 10, mult: 1.45, col: '#ff4f9a', who: 'Six modes: Rika, katana, fists, Cursed Speech, Copy, Mutual Love', ult: 'domain' }
];
for (const tr of TIERS) {
  tr.vars = {}; tr.seqs = []; tr.air = {}; tr.held = {};
  for (const m of tr.modes) {
    const list = pick(m, tr.modes, tr.n);
    tr.vars[m] = list;
    for (const x of list) {
      if (x.kind === 'air') tr.air[m + ':' + x.key] = x;
      else if (x.kind === 'held') tr.held[m + ':' + x.key] = x;
      else tr.seqs.push({ seq: x.seq, def: x.def, name: x.name });
    }
  }
  tr.waits = tr.modes.map(() => ({ strikes: 0, crush: 0, div: 0, manji: 0 }));
  tr.ecd = tr.modes.map(() => 0);
}
const ULTS = {};
for (const tr of TIERS) {
  const moves = {};
  for (const k of SLOTS) Object.defineProperty(moves, k, { enumerable: true, get: () => MODES[tr.modes[tech === tr ? mi : 0]].base[k] });
  T.add(tr.id, { name: tr.name, jp: tr.jp, mark: tr.mark, who: tr.who, odds: 0, col: tr.col, glow: 'purple', moves, awakened: true, secret: true, skin: SKIN, as: [tr.name, '純愛'],
    hint: `<b>Right click</b> next mode · ${tr.modes.map((m, i) => `<b>${KEYS6[i]}</b> ${MODES[m].name}`).join(' · ')} · <b>G</b> ${tr.ult === 'manifest' ? 'Full Manifestation' : tr.ult === 'declare' ? 'Final Declaration' : 'Authentic Mutual Love'}`,
    m1(i) { const p = E.P1; if (tech !== tr || !['katana', 'mutual'].includes(MO())) return true; p.move = { def: R.CUTS[i], i, t: 0 }; return false; },
    awkName: tr.ult === 'manifest' ? 'Rika: Full Manifestation' : tr.ult === 'declare' ? 'Pure Love: Final Declaration' : 'Authentic Mutual Love', awkHits: false, awkStart: 0,
    awkKeep: tr.ult === 'domain',                   // (the domain empties the bar itself once it has opened, as idg.js does)
    awaken(p) { if (tr.ult === 'domain') openDomain(p); else p.move = { def: ULTS[tr.ult], t: 0 }; } });
  tr.def = T.TECH[tr.id];
  JU.awakened.LIST.push({ id: tr.id, secret: true, name: tr.name, mark: tr.mark, col: tr.col,
    what: `${tr.who}, each with 4 moves and its own E, and ${tr.n} variants a mode (${tr.n * tr.modes.length} in all). G: ${tr.def.awkName}.`,
    note: 'Free for now.', later: () => 'Free for now.', open: () => true });
}

/* ================= the three awakenings ================= */
let show = null;                                    // a card or a flash over everything: { kind, t0, dur, text }
ULTS.manifest = move('Rika: Full Manifestation', 4.2, [
  S_(.05, p => { E.banner('完全顕現', 'RIKA: FULL MANIFESTATION', 'xs'); rika('show', 4); p.inv = Math.max(p.inv, 4); play('home-rika-yuta', 1, () => sfx.rika(1)); if (Z) Z.dim(.6, 3.6); E.zoomIn(1); }),
  S_(.6, (p, o, m) => grab(p, m)),
  [.65, 2.2, (p, o, m, u) => { if (m.held) carry(p, m, p.x + p.face * (220 + 120 * Math.sin(u * TAU * 1.5)), 260 + 300 * Math.abs(Math.sin(u * TAU * 1.5))); }],
  ...[0, 1, 2].map(i => S_(1 + i * .4, (p, o, m) => { const q = m.held; if (q) { R.floorHit(q, q.x); hit(p, 60, LILAC, { kb: 0, stun: 2, stop: .1 }, q); shake(30); } })),
  S_(2.25, (p, o, m) => slam(p, m, 60)),
  S_(2.6, p => { rika('beam', 1.4); play('home-tdc-charge', .8); }),
  S_(3.3, p => { beam(p, 260, 260); big(p, '里香', LILAC, 'red', 'home-gojo-purple-boom'); show = { kind: 'flash', t0: E.T, dur: .4, col: '201,160,255' }; })
], [[0, 'manjiWind'], [3.8, 'idle']], { inv: true });
ULTS.declare = move('Pure Love: Final Declaration', 4.4, [
  S_(.05, p => { E.banner('純愛砲', 'PURE LOVE: FINAL DECLARATION', 'xs'); rika('beam', 4); p.inv = Math.max(p.inv, 4.2); if (Z) Z.dim(.7, 3.8); E.zoomIn(1.4); sfx.charge(); }),
  S_(.4, p => { if (JU.manga) JU.manga.think(p, 'ALL OF IT. EVERYTHING I HAVE.', { life: 1.4 }); }),
  S_(1.9, p => { if (JU.manga) JU.manga.say(p, 'I LOVE YOU, RIKA.', { life: 1.4 }); play('home-tdc-charge', 1); }),
  [2, 3.3, (p, o, m, u) => { if (Math.random() < .8) V.mote(p.x - p.face * 20, p.y + 420, 'purple'); shake(6 + 20 * u); }],
  S_(3.35, p => { beam(p, 700, 420); show = { kind: 'flash', t0: E.T, dur: .6, col: '255,255,255' }; big(p, '純愛', LILAC, 'neg', 'home-gojo-purple-boom'); shake(70); })
], [[0, 'manjiWind'], [4, 'idle']], { inv: true });
// True Final's: a domain. Countless katanas standing in the ground under a white moon, every one of them something Rika has copied. While it
// stands, a sword comes up out of the ground into them every time he lands a blow; when it closes, all of them at once
D.kind('mutual', { rim: '255,79,154', tint: '50,6,30', bare: true, inside: garden, end() { const d = domain; domain = null; if (d && d.t > 2) finale(); } });
let domain = null;                                  // { t (how long it has stood), last (when the last sword came up), wait }
const FIELD = Array.from({ length: 70 }, (_, i) => [(i * 137 % 100) / 100 * 2600 - 1300, (i * 53 % 100) / 100 * 600, .6 + (i * 29 % 10) / 15, ((i * 71) % 20 - 10) * .025]);
function garden() {
  const VW = E.VW, HY = E.HY;
  let gr = g.createLinearGradient(0, 0, 0, HY); gr.addColorStop(0, '#07020a'); gr.addColorStop(1, '#3a0a24'); g.fillStyle = gr; g.fillRect(-300, -300, VW + 600, HY + 302);
  gr = g.createLinearGradient(0, HY, 0, E.VH); gr.addColorStop(0, '#2a0618'); gr.addColorStop(1, '#070106'); g.fillStyle = gr; g.fillRect(-300, HY, VW + 600, E.VH - HY + 500);
  const mo = P(500, 900, ZP + 1400);                // the moon, white, huge
  lit(() => E.glow(E.GLOW.white, mo[0], mo[1], 520 * mo[2], .7));
  g.fillStyle = '#fff8fb'; g.beginPath(); g.arc(mo[0], mo[1], 170 * mo[2], 0, TAU); g.fill();
  for (const f of FIELD) {                          // and every one of them a sword in the ground, leaning a little
    const c = P(f[0], 0, ZP + 120 + f[1]), k = c[2] * f[2];
    g.save(); g.translate(c[0], c[1]); g.rotate(Math.PI + f[3]);
    g.fillStyle = '#d7dce8'; g.fillRect(-3 * k, 0, 6 * k, 150 * k); g.fillStyle = '#2a2633'; g.fillRect(-10 * k, 150 * k, 20 * k, 7 * k); g.fillStyle = '#f2f0f6'; g.fillRect(-4 * k, 157 * k, 8 * k, 40 * k);
    g.restore();
  }
}
function openDomain(p) {
  if (duel()) {                                     // (no domains in a 1v1: every sword at once instead)
    T.drain(); E.banner('真贋相愛', 'AUTHENTIC MUTUAL LOVE', 'xs'); rainSwords(p, 14, 10, 'volley'); rainSwords(p, 8, 10, 'fall');
    E.after(.5, () => { if (tech) big(p, '相愛', MUT, 'bw', 'home-gojo-purple-boom'); });
    return;
  }
  if (domain || D.now === 'mutual') return;
  const opened = D.open({ who: p, tone: 'purple', kind: 'mutual', reveal() {
    D.raise('mutual', { who: p, dur: 12 }); domain = { t: 0, last: -9 };
    E.after(.25, () => { if (!D.clashing) E.banner('真贋相愛', 'AUTHENTIC MUTUAL LOVE', 'xs'); });
    play('home-rika-yuta', .7, () => sfx.rika(1));
  } });
  if (opened) { T.drain(); p.inv = Math.max(p.inv || 0, 1); }
}
function domainTick(dt) {
  if (!domain) return;
  if (D.now === 'mutual') { domain.t += dt; return; }
  if (D.clashing) return;
  if ((domain.wait = (domain.wait || 0) + dt) > 1) domain = null;      // (it never stood, or it went without its end being called)
}
function finale() {                                 // the domain closing: every sword in it, at them (about 300)
  const p = E.P1;
  if (!tech || !alive(E.P2)) return;
  rainSwords(p, 16, 8, 'volley'); rainSwords(p, 10, 8, 'fall');
  E.after(.5, () => { if (tech) big(p, '相愛', MUT, 'bw', 'home-gojo-purple-boom'); });
}
function drawShow() {
  const s = show, t = E.T - s.t0;
  if (t >= s.dur) { show = null; return; }
  g.fillStyle = `rgba(${s.col},${(1 - t / s.dur) * .85})`; g.fillRect(0, 0, E.VW, E.VH);
}

/* ================= E: each mode's counter ================= */
let stance = null;                                  // { kind, t }
const STANCE = { name: 'Stance', dur: 1.2, run(p, m, t) {
  p.vx = 0; p.rate = 30;
  if (!m.s) { m.s = 1; stance = { kind: m.kind, t: .85 }; if (m.kind === 'rika') rika('show', .9); }
  if (m.ans === undefined) { p.target = m.kind === 'katana' ? POSE.lrWindB : m.kind === 'speech' ? POSE.idle : POSE.crushWind; if (!stance) E.endMove(p); return; }
  p.target = t < m.ans + .25 ? POSE.cross : POSE.idle;
  if (t > m.ans + .45) E.endMove(p);
} };
function answer(p, a) {
  const k = stance.kind, m = p.move;
  stance = null;
  if (m && m.def === STANCE) m.ans = m.t;
  const shot = !!(a && a.shot);
  E.after(.04, () => {
    if (!tech) return;
    if (k === 'rika') { rika('swipe', .5); swipe(p, 60, { reach: 700, h: { kb: 1300, lift: 400 } }); label(p.x, p.y + 470, 'RIKA', LILAC); }
    else if (k === 'katana') { play('home-lr-parry', 1, () => sfx.cut(1.5)); front(p, 140); cut(p, 65, { big: true, slice: true, h: { kb: 1200, lift: 400, stun: 1 } }); label(p.x, p.y + 470, 'PARRY', STEEL); }
    else if (k === 'fists') { punch(p, 60, true, { kb: 1300, lift: 500 }); label(p.x, p.y + 470, 'COUNTER', FIST); }
    else if (k === 'speech') { say(p, 'STOP', 50, 'freeze'); }
    else if (k === 'copy') { V.ring(p.x, p.y + 170, 260, COPY, .3); granite(p, 55, 90); label(p.x, p.y + 470, 'SIMPLE DOMAIN', COPY); }
    else if (k === 'mutual') { rainSwords(p, 6, 10, 'rise'); label(p.x, p.y + 470, 'SWORD WALL', MUT); }
  });
  void shot;
  return true;
}
const ESPEC = { get name() { return tech ? MODES[MO()].esp.name : 'Stance'; }, get jp() { return tech ? MODES[MO()].esp.jp : ''; }, get col() { return tech ? MODES[MO()].col : LILAC; },
  get left() { return tech ? tech.ecd[mi] : 0; }, get max() { return tech ? MODES[MO()].esp.cd : 1; }, nocd() { for (const tr of TIERS) tr.ecd.fill(0); },
  press(p) {
    if (!tech) return true;
    if (tech.ecd[mi] > 0) { sfx.back(); return true; }
    if (p.move || p.ps || p.dead || p.dashT > 0) return true;
    const d = MODES[MO()].esp;
    tech.ecd[mi] = d.cd; p.move = { def: STANCE, key: 'esp', t: 0, kind: d.guard }; E.hud.mv.esp.classList.add('act');
    JU.tech.tk.shout(p, d.jp, MODES[MO()].col); sfx.charge();
    return true;
  } };
for (const tr of TIERS) if (JU.especial) JU.especial.add(tr.id, ESPEC);

/* ================= held: a moment to see whether the key stays down ================= */
const HELD_AT = .32;
const HOLDER = { name: 'Holding', dur: 1, run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = POSE.crushWind;
  const down = E.keys.has(m.k) || E.keys.has('hold:' + m.slot);
  if (Math.random() < .5) V.mote(p.x, p.y + 200, 'purple');
  if (!down) { begin(p, MODES[MO()].base[m.slot], m.slot, true); return; }      // let go: the move itself
  if (t >= HELD_AT) begin(p, m.v.def, m.slot, true);                           // still down: the held one
} };
function begin(p, def, slot, keepCd) {
  if (p.move) E.endMove(p);
  p.move = { def, key: slot, t: 0 }; E.hud.mv[slot].classList.add('act');
  if (!keepCd) E.cd[slot] = E.CD[slot];
}

/* ================= switching ================= */
let rmb = false, cycleAt = 0, tAt = 0;
E.root.addEventListener('pointerdown', e => { if (e.button === 2) rmb = true; });
addEventListener('pointerup', e => { if (e.button === 2) rmb = false; });
addEventListener('blur', () => { rmb = false; });
const altDown = () => rmb || E.keys.has('c');
function relabel() {
  if (!tech) return;
  for (const k of SLOTS) { const d = MODES[MO()].base[k]; E.hud.mv[k].querySelector('b').textContent = d.name; E.CD[k] = d.cd; }
  paintStrip();
}
function setMode(i) {
  if (!tech || i >= tech.modes.length) return;
  const p = E.P1;
  if (i === mi) { label(p.x, p.y + 480, MODES[MO()].short, MODES[MO()].col, .6); return; }
  for (const k of SLOTS) tech.waits[mi][k] = E.cd[k];
  mi = i;
  for (const k of SLOTS) E.cd[k] = tech.waits[mi][k];
  relabel();
  const md = MODES[MO()];
  label(p.x, p.y + 500, md.short, md.col, 1); sfx.hover(); V.ring(p.x, p.y + 190, 200, md.col, .22);
  if (MO() === 'rika') { rika('show', .6); sfx.rika(0); }
  if (MO() === 'katana' || MO() === 'mutual') play('home-lr-draw', .7);
}
const KEYS = SLOTS, busy = p => !!(p.move && (p.move.def === STANCE || p.move.def === ULTS.manifest || p.move.def === ULTS.declare));
const press0 = H.press;
H.press = (a, inScene) => {
  if (!inScene && tech && T.active === tech.def && !E.P1.dead) {
    const p = E.P1;
    if (a === 'alt') { for (const k in MKEY) if (E.keys.has(k) && MKEY[k] < tech.modes.length) { tAt = 0; setMode(MKEY[k]); return true; } cycleAt = E.T || .001; return true; }
    if (a === 'takeover' && tech.modes.length > 2) { if (altDown()) { setMode(2); return true; } tAt = E.T || .001; return true; }      // (T: is right click coming)
    if (E.root.dataset.mode === 'fight' && KEYS.includes(a) && !p.ps && !busy(p)) {
      const m0 = MO(), c = ms.find(tech.seqs, tech.id, m0, a);
      if (c && !(E.cd[a] > 0)) { begin(p, c.def, a); E.fx.push({ k: 2, x: p.x, y: p.y + 520, n: c.name.toUpperCase(), col: '#ffffff', t: 0, life: 1.3 }); sfx.charge(); return true; }
      if (!p.move && !(p.dashT > 0) && !(E.cd[a] > 0)) {
        const air = !p.ground && tech.air[m0 + ':' + a], held = p.ground && tech.held[m0 + ':' + a];
        if (air) { begin(p, air.def, a); return true; }
        if (held) { const k = String(SLOTS.indexOf(a) + 1); E.cd[a] = E.CD[a]; p.move = { def: HOLDER, key: a, t: 0, k, slot: a, v: held }; E.hud.mv[a].classList.add('act'); return true; }
      }
    }
  }
  return press0 ? press0(a, inScene) : false;
};
addEventListener('keydown', e => {                  // a mode's key pressed while right click is held
  if (!tech || T.active !== tech.def || e.repeat || !altDown()) return;
  const k = e.key.toLowerCase();
  if (MKEY[k] !== undefined && MKEY[k] < tech.modes.length) { cycleAt = 0; tAt = 0; setMode(MKEY[k]); }
});

/* ---------- the strip of its modes, on his health bar ---------- */
const strip = document.createElement('div'); strip.className = 'lrm';
const fb = E.root.querySelector('.fb.p1'); if (fb) fb.appendChild(strip);
let stripOf = null;
function paintStrip() {
  if (!tech) { E.root.classList.remove('lrmon'); return; }
  if (stripOf !== tech) { stripOf = tech; strip.innerHTML = tech.modes.map((m, i) => `<i style="--c:${MODES[m].col}"><b>${MODES[m].short}</b><u>${KEYS6[i]}</u></i>`).join(''); }
  strip.querySelectorAll('i').forEach((el, i) => el.classList.toggle('on', i === mi));
  E.root.classList.add('lrmon');
}

/* ================= wiring ================= */
let seen = null;
const tick0 = H.tick, under0 = H.under, fx0 = H.fx, post0 = H.post, guard0 = H.guard, hit0 = H.hit, reset0 = H.reset, start0 = H.fightStart;
H.tick = dt => {
  tick0(dt);
  if (wrung) { const w = wrung; w.t += dt; if (w.t > .9 || w.o.ko || w.o !== E.P2) { w.o.spin = 1; wrung = null; } else w.o.spin = Math.cos(w.t * 24) || .001; }
  const tr = TIERS.find(x => T.active === x.def) || null;
  if (tr !== tech) { tech = tr; mi = 0; stripOf = null; if (tech) relabel(); else { E.root.classList.remove('lrmon'); swords.length = 0; rk.act = rk.arm = null; } }
  if (!tech) return;
  const p = E.P1, m = p.move;
  rq = rikaQ(dt);
  for (let i = 0; i < tech.modes.length; i++) { if (tech.ecd[i] > 0) tech.ecd[i] = Math.max(0, tech.ecd[i] - dt); if (i !== mi) for (const k of SLOTS) if (tech.waits[i][k] > 0) tech.waits[i][k] = Math.max(0, tech.waits[i][k] - dt); }
  if (cycleAt && E.T - cycleAt > .12) { cycleAt = 0; tAt = 0; setMode((mi + 1) % tech.modes.length); }
  if (tAt && E.T - tAt > .35) { tAt = 0; if (press0) press0('takeover', false); }
  if (stance && (stance.t -= dt) <= 0) stance = null;
  if (rk.arm && !(m && m.held)) rk.arm = null;
  if (m && m !== seen) { seen = m; if (m.key && SLOTS.includes(m.key) && m.def !== HOLDER) ms.note(tech.id, MO(), m.key); }      // (every move on 1 to 4, a variant too: it can be the start of a longer one)
  else if (!m && seen) { seen = null; ms.ended(); }
  swordsTick(dt);
  domainTick(dt);
};
H.under = dt => {                                   // Rika, behind him
  under0(dt);
  if (!tech) return;
  const p = E.P1;
  if (p.ko || p.alpha < .05) return;
  const bob = Math.sin(E.T * 1.6) * 14, s = 1.08;      // (always this size: her mouth and shoulder are worked out for it, reaper.js)
  R.drawRika(p.x - p.face * 125, p.y + 10 + bob, ZP + 160, p.face, s, rk.a, rk.arm ? Object.assign({}, rq, { noArm: true }) : rq);
};
H.fx = dt => {
  fx0(dt);
  if (!tech) return;
  const p = E.P1;
  if (['katana', 'mutual'].includes(MO()) || (p.move && p.move.def.sword)) R.katana(p, !!(p.move && !p.move.def.m1));
  if (rk.arm) { const A = rk.arm, a = R.longArm(p, A.hx, A.hy, true, Math.max(.9, rk.a)); if (A.o) R.fist([a.x, a.y], a.ang, a.k, A.sq); }
  drawSwords();
  if (stance) { const c = F(p.x, p.y + 190), k = c[2]; lit(() => { g.strokeStyle = MODES[MO()].col; g.lineWidth = 5 * k; g.globalAlpha = .6 + .3 * Math.sin(E.T * 24); g.beginPath(); g.arc(c[0], c[1], 170 * k, 0, TAU); g.stroke(); g.globalAlpha = 1; }); }
};
H.post = dt => { if (post0) post0(dt); if (tech && show) drawShow(); };
H.guard = (face, a, mul) => {
  if (guard0 && guard0(face, a, mul)) return true;
  if (!tech || !stance || E.P1.dead) return false;
  return answer(E.P1, a);
};
H.hit = (o, face, h) => {                           // the bar fills with what he does; and in the domain, a sword comes up into them
  hit0(o, face, h);
  if (!tech) return;
  const m = E.P1.move;
  if (!(m && Object.values(ULTS).includes(m.def))) T.charge(h.dmg * (o.dr || 1) * .12);
  if (domain && D.now === 'mutual' && E.T - domain.last > .5 && !h.lrDom) {
    domain.last = E.T;
    swords.push({ x: o.x + rnd(-40, 40), y: -BL - 10, vx: 0, vy: 2300, ang: -Math.PI / 2, t: 0, life: .7, dmg: M(18), stuck: false, rise: true, dom: true });
  }
};
const clear = () => { swords.length = 0; rk.act = rk.arm = null; stance = null; show = null; cycleAt = tAt = 0; domain = null; if (wrung) { wrung.o.spin = 1; wrung = null; } };
H.reset = () => { reset0(); clear(); for (const tr of TIERS) { tr.ecd.fill(0); for (const w of tr.waits) for (const k of SLOTS) w[k] = 0; } };
H.fightStart = (cfg, wave) => {
  start0(cfg, wave);
  if (!wave) clear();
  const tr = TIERS.find(x => T.active === x.def) || null;
  tech = tr; mi = 0; stripOf = null;
  if (tech) relabel(); else E.root.classList.remove('lrmon');
};

JU.lovereap = { MODES, TIERS, ULTS, pick, setMode,
  get tech() { return tech && tech.id; }, get mode() { return MO(); },
  counts: () => TIERS.map(tr => ({ id: tr.id, modes: tr.modes.length, variants: Object.values(tr.vars).reduce((n, l) => n + l.length, 0), perMode: tr.modes.map(m => tr.vars[m].length) })),
  get state() { return { tech: tech && tech.id, mode: MO(), stance: stance && stance.kind, swords: swords.length, rika: { a: +rk.a.toFixed(2), act: rk.act && rk.act.kind, arm: !!rk.arm }, domain: !!domain }; } };
})();
