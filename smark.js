/* JUJUTSU UNLIMITEDS — Sukuna's Mark, the fourth awakened technique. Deadly Cleave (666), Shrine Cleave (a shrine without a domain: 500 over five
   seconds), 500% Fuga (700, and it goes a long way), Shinjutsu Shrine (a thousand cuts at 3 each: 3000), and 1 + R for a 0.2 second shrine (150).
   It is meant to be earned: the Sukuna clan, 150 Black Flashes landed as Sukuna and 500 curses exorcised. Both are counted already; NEED is off, so it is free for now */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, box = E.box, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, keys = E.keys;
const { rnd, clamp, ease, ZP } = E, TAU = Math.PI * 2, { shout, orb } = JU.tech.tk, RED = '#ff2440', FIRE = '#ff8c50';
const NEED = true, WANT = { bf: 150, kills: 500 };  // are the requirements on yet, and what they are
const S = { bf: 0, kills: 0 };
try { Object.assign(S, JSON.parse(localStorage.getItem('ju.mark') || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem('ju.mark', JSON.stringify(S)); } catch (e) {} };
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const exact = (o, n) => n / (o.dr || 1);
const cut = (o, n = 1, w) => { for (let i = 0; i < n; i++) JU.cut.slice(o.x + rnd(-110, 110), o.y + rnd(60, 290) * (o.scale || 1), rnd(-1.4, 1.4), rnd(220, 460), { shift: w ? 11 : 6, w: w ? 1.3 : .8, delay: i * .012 }); if (w) JU.cut.ink(o.x, o.y + 170 * (o.scale || 1), Math.random() < .5 ? -1 : 1, 8); };   // (0.2v4: a cut parts what it goes through, cuts.js)
// damage that does not stagger: the stated amount, and a proper death if that is what it comes to
function chip(o, n) { o.lastHit = 0; o.flash = .04; if (o.hp - n <= 0) E.applyHit(o, 1, { dmg: 999999, kb: 0, stun: .4, fixed: 1, col: RED }); else o.hp -= n; }

let shrine = null, arrow = null, quick = 0, quickCd = 0, pendR = 0;  // a shrine standing in the open; Fuga in flight; the 0.2 second one and its wait; an R that may yet be half of 1 + R
const HOLD = [.1, 0, 1.9, .5, .4, -.4, 0], pin = (o, x, face) => Object.assign(o, { x, y: 62, vx: 0, vy: 0, ground: true, state: 'hurt', stun: .5, face });

const MOVES = {
  // 1 — in on it, a hand round its throat, and Cleave let off again and again into what he is holding: 666
  strikes: { name: 'Deadly Cleave', cd: 14, dur: 1.7, glow: 'red', run(p, m, t) {
    const o = E.P2, gap = (o.x - p.x) * p.face;
    p.rate = 46;
    if (!m.got) {
      if (t > .45) { p.vx = 0; p.target = POSE.idle; if (t > .62) E.endMove(p); return; }       // nothing there to take hold of
      p.target = POSE.dash; p.vx = gap > 130 ? p.face * 1500 : 0;
      if (gap > -30 && gap < 185 && !o.ko && o.state !== 'down' && !(o.alpha < 1)) { m.got = t; m.n = 0; p.vx = 0; p.inv = Math.max(p.inv, 1.3); sfx.charge(); }
      return;
    }
    const u = t - m.got;
    p.vx = 0; p.target = u < 1.05 ? HOLD : POSE.idle;
    if (u < .95) {
      if (!o.ko) pin(o, p.x + p.face * 112, -p.face);
      for (const n = Math.min(9, Math.floor(u / .1)); m.n < n && !o.ko; m.n++) { E.applyHit(o, p.face, { dmg: exact(o, 66), kb: 0, stun: .5, stop: .02, col: RED, fixed: 1 }); cut(o, 3); V.sparks(o.x, o.y + 170, 'red', 6); }
      return;
    }
    if (m.fin) return;
    m.fin = 1; sfx.bf(); shake(34);
    if (o.ko) return;
    cut(o, 8, 12); V.impact(.2, o.x, o.y + 150);
    E.applyHit(o, p.face, { dmg: exact(o, 72), kb: 1100, lift: 520, stun: .9, stop: .26, heavy: 1, col: RED, fixed: 1 });
  } },
  // 2 — a shrine, standing in the open with no barrier round it. For five seconds it cuts at whatever he is fighting: 500 in all
  crush: { name: 'Shrine Cleave', cd: 20, dur: .6, glow: 'red', run(p, m, t) {
    p.vx = 0; p.rate = 30; p.target = t < .4 ? POSE.manjiWind : POSE.idle;
    if (m.s) return;
    m.s = 1; sfx.charge(); sfx.blast(); shake(14); shout(p, '御廚子', RED);
    raise({ rise: .5, dur: 6, n: 25, per: 20, x: clamp(p.x - p.face * 260, -700, 700), sc: .72, open: false });
  } },
  // 3 — Fuga at five times the heat: an arrow of fire. What it lands on is thrown the length of the arena
  div: { name: '500% Fuga', cd: 25, dur: 1.5, glow: 'fire', run(p, m, t) {
    const hx = p.x + p.face * 110, hy = p.y + 200;
    p.vx = 0; p.rate = 24;
    if (t < .85) {
      p.target = POSE.divWind;
      if (!m.c) { m.c = 1; p.inv = Math.max(p.inv, 1); E.slow(.4); E.banner('竈・開', '500% FUGA', 'sm'); sfx.charge(); V.custom(.85, u => { orb(hx, hy, 14 + 30 * u, 'fire', '#fff3b0'); V.mote(hx, hy, 'fire'); }); }
      return;
    }
    p.target = t < 1.2 ? POSE.div : POSE.idle;
    if (m.s) return;
    m.s = 1; sfx.bf(); shake(26);
    arrow = { x: hx, y: hy, face: p.face, t: 0 };
  } },
  // 4 — the shrine itself comes up out of the floor, with no barrier at all. A thousand cuts at 3 each: 3000
  manji: { name: 'Shinjutsu Shrine', cd: 60, dur: 1.3, glow: 'red', run(p, m, t) {
    p.vx = 0; p.rate = 20; p.target = t < 1.1 ? JU.domain.SIGN : POSE.idle;
    if (m.s) return;
    m.s = 1; p.inv = Math.max(p.inv, 1.4); sfx.bf(); sfx.blast(); shake(30); E.slow(.5); E.zoomIn(.6); E.banner('神術・御廚子', 'SHINJUTSU SHRINE', 'sm');
    if (JU.training.on) E.cd.manji = 0;             // no waiting in Training
    raise({ rise: 1, dur: 9, n: 1000, per: 3, x: 0, sc: 1.3, open: true });
  } }
};

// the shrine: built out of the same blocks as everything else, and growing up out of the floor
function raise(o) {
  shrine = Object.assign({ t: 0, done: 0, dealt: 0, numT: 0 }, o);
  V.crack(o.x, 420 * o.sc); V.rocks(o.x, 0, 18); V.rocks(o.x - 200 * o.sc, 0, 8); V.rocks(o.x + 200 * o.sc, 0, 8);
}
function drawShrine(s) {
  const up = ease(clamp(s.t / s.rise, 0, 1)) * (s.t > s.dur - .5 ? clamp((s.dur - s.t) / .5, 0, 1) : 1), k = s.sc, z = ZP + 350, x = s.x, hh = h => h * k * up;
  if (up <= 0) return;
  box(x, 0, z, 560 * k, hh(40), 220 * k, '#2a0810', '#17040a', '#3a0c16');
  for (const dx of [-200, -70, 70, 200]) box(x + dx * k, hh(40), z + 50 * k, 38 * k, hh(250), 38 * k, '#5a0d18', '#30060d');
  box(x, hh(290), z - 30 * k, 680 * k, hh(46), 300 * k, '#1a060a', '#0d0306', '#2a0a12');
  box(x, hh(336), z + 30 * k, 430 * k, hh(110), 170 * k, '#5a0d18', '#30060d');
  box(x, hh(446), z - 10 * k, 560 * k, hh(42), 250 * k, '#1a060a', '#0d0306', '#2a0a12');
  const a = P(x - 120 * k, hh(250), z + 49 * k), b = P(x + 120 * k, hh(70), z + 49 * k);         // the mouth in the middle of it, and its teeth
  g.fillStyle = '#060103'; g.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
  g.fillStyle = '#f4f1e6'; for (let i = 0; i < 7; i++) { const w = (b[0] - a[0]) / 7; g.fillRect(a[0] + i * w + w * .15, a[1], w * .7, (b[1] - a[1]) * .22); g.fillRect(a[0] + i * w + w * .15, b[1] - (b[1] - a[1]) * .22, w * .7, (b[1] - a[1]) * .22); }
  g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.red, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 700 * k * a[2] * up, .35 + .1 * Math.sin(E.T * 6)); g.globalCompositeOperation = 'source-over';
}
// 1 + R: the domain for a fifth of a second. Enough for one thing
function flash02(p) {
  pendR = 0;
  if (quickCd > 0) { shout(p, '0.2s Shrine: ' + Math.ceil(quickCd) + 's', '#c88'); return; }
  if (p.dead || p.ps || E.P2.ko) return;
  if (p.move) E.endMove(p);
  quickCd = 8; quick = .2; p.vx = 0; p.inv = Math.max(p.inv, .4); sfx.bf(); shake(28); shout(p, '0.2秒 · 御廚子', RED);
  E.after(.2, () => {
    const o = E.P2;
    if (o.ko || !on()) return;
    cut(o, 10, 12); V.impact(.15, o.x, o.y + 150);
    E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: exact(o, 150), kb: 420, lift: 320, stun: .8, stop: .16, heavy: 1, col: RED, fixed: 1 });
  });
}

JU.tech.add('smark', { name: 'Mark of the King', jp: '王の印', mark: '印', who: 'The King of Curses, through his vessel', odds: 0, col: RED, glow: 'red', moves: MOVES, awakened: true });
const DEF = JU.tech.TECH.smark, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
const press0 = H.press, tick0 = H.tick, under0 = H.under, fx0 = H.fx, post0 = H.post, reset0 = H.reset, start0 = H.fightStart, ko0 = H.ko, bf0 = H.bf;
const pass = (a, inScene) => (press0 ? press0(a, inScene) : false);
H.press = (a, inScene) => {
  if (!inScene && on()) {
    const p = E.P1, m = p.move;
    if (a === 'strikes' && (pendR > 0 || keys.has('r'))) { flash02(p); return true; }           // R, and 1 on top of it
    if (a === 'clan') {
      if (keys.has('1')) { if (m && m.def === MOVES.strikes && !m.got) E.cd.strikes = 0; flash02(p); return true; }
      if (m && m.def === MOVES.strikes && !m.got && m.t < .3) { E.cd.strikes = 0; flash02(p); return true; }   // 1 and then R at once: the dash is called off
      pendR = .14; return true;                     // R by itself: held for a moment, in case 1 is on its way. If not, the clan gets it
    }
  }
  return pass(a, inScene);
};
H.tick = dt => {
  tick0(dt);
  if (quickCd > 0) quickCd -= dt;
  if (quick > 0) quick -= dt;
  if (pendR > 0 && (pendR -= dt) <= 0) pass('clan', false);
  const p = E.P1, o = E.P2;
  if (arrow) {                                      // Fuga, on its way
    const A = arrow, hs = o.scale || 1;
    A.t += dt; A.x += A.face * 2300 * dt;
    V.puff('fire', A.x - A.face * 40, A.y + rnd(-14, 14), -A.face * 200, rnd(-60, 60), 60, .3);
    const reached = !o.ko && !(o.alpha < 1) && Math.abs(o.x - A.x) < 80 * hs + 40;
    if (reached || Math.abs(A.x) > 1050 || A.t > 1.2) {
      const x = clamp(A.x, -1000, 1000);
      arrow = null; sfx.bf(); sfx.blast(); shake(44); E.zoomIn(.5);
      E.addBlast(x, 180, '255,140,60', 620); V.fire(x, 20, 26); V.crack(x, 460); V.rocks(x, 0, 20);
      for (let i = 0; i < 4; i++) V.ring(x, 180, 240 + i * 150, FIRE, .35 + i * .07);
      if (reached) { V.impact(.4, o.x, o.y + 150); E.applyHit(o, A.face, { dmg: exact(o, 700), kb: 1750, lift: 900, stun: .9, stop: .34, heavy: 1, col: FIRE, fixed: 1 }); }   // and it does not stop where it lands
    }
  }
  if (shrine) {
    const s = shrine, u = clamp((s.t - s.rise) / (s.dur - s.rise - .5), 0, 1), due = Math.floor(u * s.n + 1e-6), live = !o.ko && !(o.alpha < 1);
    s.t += dt; s.numT -= dt;
    if (due > s.done) {
      const n = due - s.done;
      s.done = due;
      if (live) {
        chip(o, s.per * n); s.dealt += s.per * n; cut(o, Math.min(n, 3));
        if (s.numT <= 0) { s.numT = s.open ? .07 : 0; E.addNum(o.x + rnd(-60, 60), o.y + rnd(200, 300) * (o.scale || 1), s.per, '#ffd27a'); sfx.whoosh(); }
      }
    }
    if (s.open && Math.random() < dt * 9) JU.cut.slice(cam.x + rnd(-800, 800), rnd(30, 430), rnd(-1.4, 1.4), rnd(200, 520), { shift: 5, w: .7 });      // it is cutting at everything, not only at him
    if (s.t >= s.dur || p.dead) shrine = null;
  }
};
H.under = dt => { under0(dt); if (shrine) drawShrine(shrine); };
H.fx = dt => {
  fx0(dt);
  const o = E.P2;
  if (shrine && shrine.dealt > 0 && !(o.alpha < .05)) {                           // what it has taken off him so far
    const c = F(o.x, o.y + 345 * (o.scale || 1)), k = c[2];
    g.font = `${Math.round(30 * k)}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = 6 * k; g.strokeStyle = '#07060c'; g.fillStyle = RED;
    const text = shrine.dealt + ' / ' + shrine.n * shrine.per;
    g.strokeText(text, c[0], c[1]); g.fillText(text, c[0], c[1]);
  }
  if (!arrow) return;
  const A = arrow, c = F(A.x, A.y), k = c[2], d = A.face;                          // the arrow itself: a point of white in a long tongue of fire
  g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.fire, c[0], c[1], 380 * k, 1); E.glow(E.GLOW.fire, c[0] - d * 120 * k, c[1], 300 * k, .7); g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#fff3b0'; g.beginPath(); g.moveTo(c[0] + d * 90 * k, c[1]); g.lineTo(c[0] - d * 30 * k, c[1] - 26 * k); g.lineTo(c[0] - d * 10 * k, c[1]); g.lineTo(c[0] - d * 30 * k, c[1] + 26 * k); g.closePath(); g.fill();
  g.strokeStyle = '#fff3b0'; g.lineWidth = 7 * k; g.beginPath(); g.moveTo(c[0] - d * 10 * k, c[1]); g.lineTo(c[0] - d * 230 * k, c[1]); g.stroke();
};
H.post = dt => {
  post0(dt);
  const VW = E.VW, VH = E.VH;
  if (shrine && shrine.open && shrine.t > shrine.rise * .5) { g.fillStyle = `rgba(90,6,16,${.2 + .04 * Math.sin(E.T * 5)})`; g.fillRect(0, 0, VW, VH); }   // the colour of the place, with no wall to hold it in
  if (quick > 0) {                                  // a fifth of a second of it
    g.fillStyle = `rgba(10,0,4,${.82 * Math.min(1, quick / .08)})`; g.fillRect(0, 0, VW, VH);
    g.strokeStyle = RED; g.lineCap = 'round';
    for (let i = 0; i < 16; i++) { const y = (i * 97 % 100) / 100 * VH, x = (i * 53 % 100) / 100 * VW, a = (i * 37 % 60) / 30 - 1; g.lineWidth = 2 + i % 4 * 2; g.beginPath(); g.moveTo(x - 260, y - 260 * a); g.lineTo(x + 260, y + 260 * a); g.stroke(); }
    g.lineCap = 'butt';
  }
};
const clear = () => { shrine = arrow = null; quick = quickCd = pendR = 0; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { if (!wave) clear(); start0(cfg, wave); };
// what it will have to be earned with, counted from now on
H.ko = o => { const res = ko0(o), cfg = Fi.fight.cfg; if (cfg && !cfg.dummy) { S.kills++; save(); } return res; };
H.bf = o => { bf0(o); const cfg = Fi.fight.cfg; if (JU.clan.active && JU.clan.active.id === 'sukuna' && !(cfg && cfg.dummy)) { S.bf++; save(); } };

const open = () => !!(JU.account && JU.account.dev) || !NEED || (JU.clan.equipped === 'sukuna' && S.bf >= WANT.bf && S.kills >= WANT.kills);      // (the team's account has it regardless)
// its card on the Awaken CT screen
Object.assign(JU.awakened.LIST.find(a => a.id === 'smark'), { open,
  what: 'Deadly Cleave (666), Shrine Cleave (500), 500% Fuga (700), Shinjutsu Shrine (3000). 1 + R: a 0.2 second shrine (150).',
  later: () => `Needs the King of Curses clan, ${WANT.bf} Black Flashes as King of Curses (you have ${Math.min(S.bf, WANT.bf)}) and ${WANT.kills} curses exorcised (you have ${Math.min(S.kills, WANT.kills)}).` });

JU.smark = { MOVES, NEED, WANT, open, get progress() { return { bf: S.bf, kills: S.kills }; },
  get state() { return { shrine: shrine && { t: shrine.t, done: shrine.done, dealt: shrine.dealt, open: shrine.open }, arrow: !!arrow, quick, quickCd }; } };
})();
