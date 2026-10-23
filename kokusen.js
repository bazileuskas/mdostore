/* JUJUTSU UNLIMITEDS — Build 0.13: more Black Flashes. Here: the Black Flash past the ordinary one (insane: the chains' last blows, and
   the Clapping Brawler's, switcher.js, and Ratio Man's, ratio.js, end on it), and the Vessel's chain of four.
   THE VESSEL'S CHAIN (no technique on him): every Black Flash he lands puts his dash, a broken guard and Divergent Fist straight back, and
   opens the next one for four seconds:
     2  dash round behind them (a dash at them now carries him past), and a Black Flash: Divergent Fist, on the timing
     3  dash, then F held, and Divergent Fist from behind the guard (3, and 3 again on the timing)
     4  the same again, and then 4: Manji Kick, the last of them, and the biggest
   Each Black Flash after the first is 190, and so is the kick. Then Divergent Fist and Manji Kick are gone for thirty seconds.
   Its sounds are the anime's: the Black Flashes, myinstants' "yuji's black flash" (sounds/home-yuji-bf.mp3 at home), the kick
   "Kokusen (Itadori VS Mahito)" (home-yuji-final.mp3). Online (Build 0.15v1) both are played from myinstants itself, never copied onto
   the site; if they cannot be had, the built ones play */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, Z = JU.bossfx, C = JU.cut, M = E.MOVES, keys = E.keys;
const { rnd, clamp } = E, TAU = Math.PI * 2, INK = '#ff2440', IRGB = '255,36,64';
const CHAIN_T = 4, FIN_T = 1.6, DMG = 190, LOCK = 30, STEP = 150;      // how long each step of the chain stays open; the last kick's; what each of them does; how long it shuts things after; how far past them a dash takes him
sfx.preload(['home-yuji-bf', 'home-yuji-final']);
const RED_FRAMES = E.flat('#3a0008', '#ff2440');    // what a dash leaves behind, in the chain

/* ================= the Black Flash past the ordinary one ================= */
// The ordinary one first (the slow, the banner, the bolts), and then: the hit held, the world dimmed and flashing red, lightning off it
// to every side, the floor broken under it, longer impact frames, and the word stamped across it. o: what it landed on.
// opt: { snd (its sound), acc (an rgb that runs through it with the red), kanji, split (the picture cut in two, at this angle), name (the banner) }
function insane(o, opt = {}) {
  const hs = o.scale || 1, x = o.x, y = o.y + 165 * hs, acc = opt.acc || IRGB;
  E.blackFlash(opt.snd);
  E.stop(.18); E.slow(1.1); E.zoomIn(1.3); cam.shake = Math.max(cam.shake, 44);
  V.impact(.66, x, y);
  if (Z) {
    Z.dim(.6, .9); Z.flash(IRGB, .5, .4); Z.flash('255,255,255', .35, .12);
    Z.boom(x, y, 170, IRGB, { hot: '255,236,236', n: 34, shake: 0 });
    Z.shock(o.x, 720, IRGB, .7, 16); Z.shock(o.x, 460, acc, .5, 10);
    for (let i = 0; i < 12; i++) { const a = rnd(0, TAU), l = rnd(500, 1100); Z.lightning(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l * .7, i & 1 ? IRGB : acc, rnd(.35, .7), rnd(3, 6), 3); }
    for (let i = 0; i < 40; i++) Z.emit(1, x + rnd(-60, 60), y + rnd(-60, 60), rnd(-900, 900), rnd(-200, 1200), rnd(3, 7), rnd(.5, 1.1), i % 3 ? '20,0,8' : IRGB, { g: 1400, dr: 1.2 });
  }
  for (let i = 0; i < 22; i++) { const a = rnd(0, TAU), l = rnd(320, 900); V.bolt(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, INK, rnd(.3, .65), rnd(3, 8), '#060205'); }
  V.ring(x, y, 560, INK, .5); V.ring(x, y, 360, '#ffffff', .3); E.addRing(o.x, IRGB, 780);
  V.crack(o.x, 560); V.rocks(o.x, 0, 26);
  if (opt.split !== undefined) V.split(opt.split);
  if (C) E.after(.08, () => C.stamp(opt.kanji || '黒閃', x, y + 250, opt.size || 300, INK));
  if (opt.name) E.after(.45, () => E.banner('黒閃', opt.name, 'bf'));
}
// the second great crack, a moment after (the Vessel's last kick has one in its sound)
function after(o, x, y, acc = IRGB) {
  if (!JU.game.state.running || o !== E.P2) return;
  cam.shake = Math.max(cam.shake, 30); V.impact(.2, x, y);
  if (Z) { Z.flash(IRGB, .4, .25); Z.shock(x, 640, acc, .6, 14); }
  for (let i = 0; i < 12; i++) { const a = rnd(0, TAU), l = rnd(300, 800); V.bolt(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, INK, rnd(.3, .5), rnd(3, 7), '#060205'); }
  V.ring(x, y, 480, INK, .4);
}

/* ================= the Vessel's chain ================= */
let vc = null;                                      // { n (Black Flashes in it so far), t (seconds left for the next), o (on what), side (his side of them at the last), dashed, pending (the one landing is a step of it), fin (the kick's window) }
const vessel = () => !JU.tech.active && E.P1.skin === E.YUJI;
const NEXT = ['', 'DASH BEHIND THEM · 3', 'DASH · HOLD F · 3', 'DASH · HOLD F · 3 · THEN 4', '4 · MANJI KICK'];
const say = (text, col, life = 1.4, up = 440) => { const p = E.P1; E.fx.push({ k: 2, x: p.x, y: p.y + up, n: text, col, t: 0, life }); };
function refill(n) {                                // the dash, a broken guard, Divergent Fist; and for the last, the kick
  E.cd.dash = 0; E.cd.div = 0;
  if (JU.block && JU.block.state.broken > 0) JU.block.brk(0);
  if (n >= 3) E.cd.manji = 0;
}
const chainSound = () => { if (!sfx.file('home-yuji-bf', 1)) sfx.bf(); };
const finalSound = () => { if (!sfx.file('home-yuji-final', 1)) { sfx.bf(); sfx.slam(2); sfx.blast(); } };

// the last of it: a turn that takes him to them, and Manji Kick with everything left in him behind it. It finds them where they are,
// in the air or on the floor
const FINALE = { name: 'Manji Kick', dur: 1.7, glow: 'red', run(p, m, t) {
  const o = E.P2, ST = .3, dt = t - (m.lt === undefined ? t : m.lt);
  m.lt = t;
  if (!m.c) { m.c = 1; sfx.charge(); p.inv = Math.max(p.inv || 0, 1.5); if (!o.ko) p.face = o.x >= p.x ? 1 : -1; E.cd.div = E.cd.manji = LOCK; }      // (from here: thirty seconds without either)
  if (t < ST) {
    p.target = POSE.manjiWind; p.spin = Math.cos(t / ST * TAU * 2); p.rate = 30; p.vx = 0;
    if (!o.ko && Math.abs(o.x - p.x) < 900) { const q = 1 - Math.exp(-dt * 16); p.x += (o.x - p.face * 110 - p.x) * q; if (o.y > 60) { p.ground = false; p.vy = 0; p.y += (o.y - p.y) * q; } }
    const w = E.hand(p, false); V.mote(w[0], w[1], 'red');
    return;
  }
  p.spin = 1; p.rate = 46; p.target = t < ST + .3 ? POSE.manji : POSE.idle; p.vx = t < ST + .1 ? p.face * 460 : 0;
  if (!m.sw) { m.sw = 1; sfx.whoosh(); V.slash(p.x + p.face * 110, p.y + 160, p.face > 0 ? .25 : Math.PI - .25, 420, INK, 18); }
  if (!m.done && t < ST + .16 && !o.ko && !(o.inv > 0) && !(o.alpha < 1) && Math.abs(o.x - p.x) < 260 && Math.abs(o.y - p.y) < 260) {
    m.done = 1;
    E.applyHit(o, p.face, { dmg: DMG / (o.dr || 1), kb: 1700, lift: 760, stun: .9, stop: .35, heavy: 1, col: INK, fixed: 1, mute: 1 });
    const hs = o.scale || 1, x = o.x, y = o.y + 165 * hs;
    insane(o, { snd: finalSound, split: p.face > 0 ? -.35 : .35, name: 'BLACK FLASH  ×5', size: 360 });
    setTimeout(() => after(o, x, y), 1700);
  }
  if (t > ST + 1) E.endMove(p);
} };

const hit0 = H.hit, aim0 = H.aim, bf0 = H.bf, snd0 = H.bfSound, press0 = H.press, dash0 = H.dash, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
// a Black Flash landing on the timing of a step: one of the chain's (190), if what had to come before it did
H.aim = (p, h) => {
  h = aim0 ? aim0(p, h) : h;
  const m = p.move, o = E.P2;
  if (!vc || !vessel() || !m || m.def !== M.div || !m.bf || vc.o !== o || vc.n > 3) return h;
  const ok = vc.dashed && (vc.n === 1 ? Math.sign(p.x - o.x) !== vc.side : !!m.guard);
  return ok ? Object.assign({}, h, { dmg: DMG / (o.dr || 1), kb: 300, lift: 420, fixed: 1, vchain: 1 }) : h;      // (and it only pops them up: they stay near enough for the next)
};
H.hit = (o, face, h) => { hit0(o, face, h); if (h.vchain && vc) vc.pending = true; };
H.bfSound = () => (snd0 && snd0()) || (vc && vc.pending && vessel() ? chainSound : null);
H.bf = o => {
  bf0(o);
  if (!vessel() || o !== E.P2) return;
  const p = E.P1, m = p.move;
  if (m && m.def === FINALE) return;              // (the last of it: nothing comes after)
  if (vc && vc.pending) { vc.pending = false; vc.n++; } else vc = { n: 1, o };
  refill(vc.n);
  if (o.ko) { vc = null; return; }                // it is over: there is nothing to chain on to
  Object.assign(vc, { o, t: CHAIN_T, dashed: false, side: Math.sign(p.x - o.x) || 1, fin: vc.n === 4 ? FIN_T : 0 });
  if (vc.n > 1) say('BLACK FLASH  ×' + vc.n, '#ffd27a', 1.4, 470);
  say(NEXT[vc.n], '#ff8a98', vc.n === 4 ? FIN_T : 2.2, 420);
};
H.press = (a, inScene) => {
  if (!inScene && vc && vessel()) {
    const p = E.P1;
    if (a === 'div' && vc.n >= 2 && vc.n <= 3 && vc.dashed && JU.block && JU.block.state.up && E.cd.div <= 0 && !p.dead && !p.ps) {      // from behind the guard
      E.cd.div = E.CD.div; p.move = { def: M.div, key: 'div', t: 0, guard: 1 }; E.hud.mv.div.classList.add('act');
      return true;
    }
    if (a === 'manji' && vc.n === 4 && vc.fin > 0 && !p.dead && !p.ps) {      // and the last of it
      if (p.move) E.endMove(p);
      vc = null;
      p.move = { def: FINALE, key: 'manji', t: 0 }; E.hud.mv.manji.classList.add('act');
      return true;
    }
  }
  return press0 ? press0(a, inScene) : false;
};
// in the chain, a dash at them is a step past them: he comes out of it on the far side
H.dash = () => {
  const d = dash0 ? dash0() : null;
  if (!vc || !vessel()) return d;
  const p = E.P1, o = E.P2, dir = ((keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0)) || p.face, gap = (o.x - p.x) * dir;
  if (o.ko || gap < 0 || gap > 900) return Object.assign({}, d || { t: .17, v: 1050 }, { tint: RED_FRAMES });
  const T = .2, to = clamp(o.x + dir * STEP, -960, 960);
  return { t: T, v: Math.abs(to - p.x) / T, tint: RED_FRAMES };
};
H.tick = dt => {
  tick0(dt);
  if (!vc) return;
  const p = E.P1;
  if (p.dashT > 0) vc.dashed = true;
  if (vc.fin > 0) vc.fin -= dt;
  if ((vc.t -= dt) <= 0 || (vc.n === 4 && vc.fin <= 0) || p.dead || !vessel() || vc.o !== E.P2 || vc.o.ko) vc = null;
};
// over him while it is open: four marks, lit for every one so far, and how long he has left for the next
H.fx = dt => {
  fx0(dt);
  if (!vc || !vessel()) return;
  const p = E.P1, c = F(p.x, p.y + 400 * (p.scale || 1)), k = c[2], u = Math.max(0, vc.n === 4 ? vc.fin / FIN_T : vc.t / CHAIN_T);
  g.save();
  for (let i = 0; i < 4; i++) {
    const x = c[0] + (i - 1.5) * 26 * k, y = c[1], r = 9 * k, lit = i < vc.n;
    g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y); g.closePath();
    g.fillStyle = lit ? INK : 'rgba(8,6,14,.7)'; g.fill(); g.lineWidth = 2 * k; g.strokeStyle = lit ? '#ffffff' : 'rgba(255,255,255,.35)'; g.stroke();
  }
  g.fillStyle = 'rgba(8,6,14,.7)'; g.fillRect(c[0] - 52 * k, c[1] + 16 * k, 104 * k, 5 * k);
  g.fillStyle = INK; g.fillRect(c[0] - 52 * k, c[1] + 16 * k, 104 * k * u, 5 * k);
  g.restore();
};
H.reset = () => { reset0(); vc = null; };
H.fightStart = (cfg, wave) => { start0(cfg, wave); vc = null; };

JU.kokusen = { insane, after, DMG, LOCK, CHAIN_T, FINALE, get chain() { return vc && { n: vc.n, t: +vc.t.toFixed(2), dashed: vc.dashed, side: vc.side, fin: +vc.fin.toFixed(2) }; } };
})();
