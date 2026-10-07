/* JUJUTSU UNLIMITEDS — curses that fight back: their AI, getting hit, staged fights, Megumi's Divine Dog */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, C = JU.cast, V = JU.vfx, sfx = JU.sfx;
const { lerp, clamp, rnd, ZP, TOR, LINE } = E, TAU = Math.PI * 2;

/* ---------- skins ---------- */
const GRUNT = {
  torso: ['#3d5a4a', '#4f7360'],
  armF: ['#3d5a4a', '#4f7360', '#18261f', '#22352b', .22], armB: ['#28402f', '#335040', '#101a15', '#16231c', .22],
  legF: ['#36503f', '#466a55', '#18261f', '#22352b', .18], legB: ['#23382b', '#2d4737', '#101a15', '#16231c', .18],
  chest() { g.fillStyle = 'rgba(0,0,0,.3)'; for (let i = 0; i < 3; i++) g.fillRect(-30, -58 + i * 16, 60, 4); },
  head() {                                   // one huge eye and a jagged mouth
    E.headBase('#476a56', '#5a856c');
    g.beginPath(); g.ellipse(9, -4, 10, 11, 0, 0, TAU); g.fillStyle = '#f4f1d0'; g.fill(); g.lineWidth = 2; g.strokeStyle = LINE; g.stroke();
    g.beginPath(); g.arc(12, -4, 4.5, 0, TAU); g.fillStyle = '#c2182b'; g.fill();
    g.beginPath(); g.moveTo(-4, 12); for (let i = 1; i <= 7; i++) g.lineTo(-4 + i * 4, 12 + (i & 1 ? 6 : 0)); g.stroke();
  }
};
const FINGER = {                             // the Finger Bearer: pale, grinning, far too many eyes
  torso: ['#c3c8cb', '#e6e9ea'],
  armF: ['#c3c8cb', '#e6e9ea', '#6f7c82', '#8b979c', .2], armB: ['#8f989c', '#a5adb0', '#4d575b', '#5b666a', .2],
  legF: ['#b6bcbf', '#d6dadb', '#6f7c82', '#8b979c', .16], legB: ['#868e92', '#9aa2a5', '#4d575b', '#5b666a', .16],
  chest() {
    g.fillStyle = '#12090c';
    g.beginPath(); g.ellipse(12, -52, 11, 6, -.15, 0, TAU); g.fill();
    g.fillRect(-30, -30, 60, 3); g.fillRect(-30, -22, 60, 2);
    g.fillStyle = '#c2182b'; g.beginPath(); g.arc(14, -52, 3, 0, TAU); g.fill();
  },
  head() {
    E.headBase('#c3c8cb', '#e9ecec');
    g.fillStyle = '#12090c';
    for (const [x, y] of [[4, -10], [16, -10], [6, -2], [17, -2]]) { g.beginPath(); g.ellipse(x, y, 3.6, 1.9, -.2, 0, TAU); g.fill(); }
    g.beginPath(); g.roundRect(-3, 6, 27, 12, 4); g.fill();
    g.fillStyle = '#f4f1e6'; for (let i = 0; i < 6; i++) g.fillRect(-1 + i * 4.1, 8, 3, 8);
  }
};

const DEFS = {
  grunt: { name: 'Grade 4 Curse', jp: '四級呪霊', skin: GRUNT, hp: 60, scale: .94, speed: 170, range: 150, gap: [.7, 1.5],
    atk: [{ pre: 'hookWind', pose: 'hook', wind: .5, lunge: 260, reach: 165, dmg: 7, kb: 300, stun: .4 }] },
  brute: { name: 'Grade 3 Curse', jp: '三級呪霊', skin: E.CURSE, hp: 95, scale: 1.12, speed: 150, range: 165, gap: [.6, 1.3],
    atk: [{ pre: 'hookWind', pose: 'hook', wind: .55, lunge: 280, reach: 180, dmg: 9, kb: 340, stun: .45 },
          { pre: 'crushWind', pose: 'crush', wind: .75, lunge: 320, reach: 200, dmg: 14, kb: 520, lift: 520 }] },
  finger: { name: 'Finger Bearer', jp: '特級呪霊', skin: FINGER, hp: 260, scale: 1.4, speed: 235, range: 200, gap: [.35, .9], dr: .3, poise: true,
    atk: [{ pre: 'hookWind', pose: 'hook', wind: .38, lunge: 420, reach: 230, dmg: 13, kb: 480, stun: .5 },
          { pre: 'crushWind', pose: 'crush', wind: .6, lunge: 380, reach: 240, dmg: 19, kb: 700, lift: 620 },
          { pre: 'divWind', pose: 'div', wind: .7, lunge: 0, far: 1, shot: 1, dmg: 15, kb: 520, lift: 420 }] }
};
function make(id, x) {
  const d = DEFS[id], f = E.fighter(d.skin, x, -1);
  f.hp = f.max = d.hp; f.scale = d.scale; f.dr = d.dr; f.poise = d.poise; f.human = d.human; f.ai = { d, t: rnd(.9, 1.5) };
  return f;
}

/* ---------- a staged fight ---------- */
const fight = { cfg: null, wave: 0, paused: false, floor: 0, low: null, lowDone: false, megumi: null, dogT: 0, time: 0 };
const shots = [], pend = [];
let dog = null;
const later = (ms, fn) => pend.push(setTimeout(fn, ms));
const $ = s => E.root.querySelector(s);
const nm = { p2: $('.fb.p2 .nm b'), p2j: $('.fb.p2 .nm span'), p1: $('.fb.p1 .nm b'), p1j: $('.fb.p1 .nm span'), vs: $('.vs span') };

// cfg: { foes: [ids], stage, label, megumi, floor, low: { at, fn }, rage, onWin, p1x, keepHp, win: [jp, en] or null for no banner, wait (ms before onWin) }
function start(cfg, wave = 0) {
  const id = cfg.foes[wave], d = DEFS[id], px = wave ? clamp(E.P1.x, -600, 600) : (cfg.p1x === undefined ? -230 : cfg.p1x);
  const foe = make(id, px + 440 > 900 ? px - 440 : px + 440);
  if (wave) foe.alpha = 0;                                      // later waves materialise out of the dark
  Object.assign(fight, { cfg, wave, paused: false, lowDone: false, floor: cfg.floor || 0, low: cfg.low || null, megumi: null, time: 0 });
  shots.length = 0; dog = null;
  const max0 = E.P1.max;
  E.arena({ stage: cfg.stage, foe, keepHp: wave > 0 || cfg.keepHp, p1x: px, yaw: wave ? 0 : undefined });
  if (wave) E.P1.max = max0;                                    // whoever is being played keeps the health they came in with
  nm.p2.textContent = d.name; nm.p2j.textContent = d.jp; nm.vs.textContent = cfg.label || 'Story';
  if (cfg.megumi) {
    const m = fight.megumi = E.fighter(C.MEGUMI, clamp(px - 480, -900, 900), 1);
    m.z = ZP + 190; m.pose = C.STAND.slice(); m.target = C.STAND; fight.dogT = 3.5;
  }
  if (wave) E.banner(d.jp, d.name.toUpperCase(), 'sm'); else E.banner('開戦', 'FIGHT!');
  if (H.fightStart) H.fightStart(cfg, wave);
}

function lose() {
  const p = E.P1;
  if (fight.cfg && fight.cfg.onLose) { p.dead = true; p.ps = p.ground ? 'down' : 'air'; p.stun = 99; E.slow(.8); fight.cfg.onLose(); return; }   // a duel: losing is the end of it, not a second go (pvp.js)
  if (H.death && H.death()) return;                 // a clan can have other plans for dying
  p.dead = true; p.ps = p.ground ? 'down' : 'air'; p.stun = 99;
  E.slow(.8); E.banner('敗北', 'DEFEATED');
  const cfg = fight.cfg;
  later(2800, () => { if (fight.cfg === cfg) start(cfg, 0); });   // straight back in
}

// the player takes a hit. Dashing through it dodges.
function hurt(face, a, mul = 1) {
  const p = E.P1;
  if (H.guard && H.guard(face, a, mul)) return false;
  if (p.dashT > 0 || p.inv > 0 || p.dead || p.ps === 'down' || p.ps === 'up' || fight.paused) return false;
  if (p.move) E.endMove(p);
  const raw = a.dmg * mul * (H.foePower ? H.foePower(a) : 1), dmg = a.exact ? raw : Math.round(raw);     // something may have weakened it, or put more behind its hits (exact: a duel's blows are counted to the fraction)
  p.hp = Math.max(fight.floor, p.hp - dmg); p.flash = .1; p.face = -face; p.vx = face * a.kb;
  if (a.lift) { p.vy = a.lift; p.ground = false; p.y = Math.max(p.y, 1); p.ps = 'air'; } else { p.ps = 'hurt'; p.stun = a.stun || .4; }
  E.stop(.08); cam.shake = Math.max(cam.shake, a.lift ? 20 : 11); cam.kick -= face * .04;
  E.addSpark(p.x + face * 20, p.y + 150, '#ff5a6e', a.lift ? 130 : 80); E.addNum(p.x, p.y + 270, a.exact ? +(a.shown || dmg).toFixed(1) : dmg, '#ff5a6e');
  V.ring(p.x, p.y + 150, a.lift ? 170 : 90, '#ff2440'); if (a.lift) V.rocks(p.x, 0, 6);
  sfx.hit(!!a.lift);
  if (H.struck) H.struck(p, face, a, dmg);          // what the blow throws off him, in the colours of whoever landed it (bossfx.js)
  if (fight.low && !fight.lowDone && p.hp <= p.max * fight.low.at) { fight.lowDone = true; fight.low.fn(); }
  else if (p.hp <= 0) lose();
  return true;
}

// damage that does not stagger him: rot, cursed buds feeding, a soul being reshaped
function chip(dmg, col) {
  const p = E.P1;
  if (p.dead || fight.paused || !(dmg > 0)) return;
  p.hp = Math.max(fight.floor, p.hp - dmg); p.flash = .06;
  E.addNum(p.x, p.y + 270, +dmg.toFixed(1), col || '#ff5a6e');
  if (fight.low && !fight.lowDone && p.hp <= p.max * fight.low.at) { fight.lowDone = true; fight.low.fn(); }
  else if (p.hp <= 0) lose();
}

H.playerPre = (p, o, dt) => {
  if (p.inv > 0) p.inv -= dt;
  if (!p.ps) return false;
  if (p.ps === 'hurt') { p.vx *= Math.exp(-dt * 7); p.target = POSE.hurt; p.rate = 32; if ((p.stun -= dt) <= 0) p.ps = null; }
  else if (p.ps === 'air') { p.target = POSE.air; p.rate = 12; if (p.ground) { p.ps = 'down'; p.stun = .55; } }
  else if (p.ps === 'down') { p.vx *= Math.exp(-dt * 9); p.target = POSE.down; p.rate = 22; if (!p.dead && (p.stun -= dt) <= 0) { p.ps = 'up'; p.stun = .3; p.inv = .8; } }
  else { p.target = POSE.idle; p.rate = 12; p.vx = 0; if ((p.stun -= dt) <= 0) p.ps = null; }
  return true;
};

/* ---------- AI: close in, wind up where the player can read it, strike, recover ---------- */
const WK = POSE.idle.slice();
H.foeIdle = (o, p, dt) => {
  const ai = o.ai;
  if (!ai || p.dead || fight.paused || o.alpha < 1) return;
  const d = ai.d, dx = p.x - o.x, ad = Math.abs(dx), near = ad < d.range;
  if ((ai.t -= dt) <= 0) {
    const pool = d.atk.filter(a => near ? !a.far : a.far);
    if (pool.length) { o.state = 'act'; o.act = { a: pool[Math.random() * pool.length | 0], t: 0 }; return; }
  }
  if (ad > d.range * .8) {
    o.vx = Math.sign(dx) * d.speed; o.walk += dt * 9;
    const s = Math.sin(o.walk);
    WK[2] = 1.15 + .1 * s; WK[3] = .62 - .1 * s; WK[4] = .5 * s; WK[5] = -.5 * s; o.target = WK; o.rate = 22;
  }
};
H.foeAct = (o, p, dt) => {
  const A = o.act, a = A.a, hs = o.scale || 1;
  A.t += dt; o.rate = 34;
  if (A.t < a.wind) { o.target = POSE[a.pre]; o.vx *= Math.exp(-dt * 10); o.tele = A.t / a.wind; }
  else if (A.t < a.wind + .16) {
    o.target = POSE[a.pose]; o.vx = o.face * a.lunge; o.tele = 0;
    if (!A.sw) { A.sw = 1; sfx.whoosh(); E.fx.push({ k: 4, x: o.x + o.face * 80 * hs, y: o.y + 160 * hs, face: o.face, r: 100 * hs, col: 'rgba(255,60,90,.85)', t: 0, life: .18 }); if (o.ai.d.blade) V.slash(o.x + o.face * 130 * hs, o.y + 160 * hs, o.face > 0 ? -.4 : Math.PI + .4, 330, '#e8f0ff', 12); }
    if (!A.done) {
      const dx = (p.x - o.x) * o.face, mul = fight.cfg && fight.cfg.rage && fight.time > fight.cfg.rage ? 2.2 : 1;
      if (a.shot) { A.done = 1; shots.push({ x: o.x + o.face * 90, y: 150 * hs, vx: o.face * 900, a, mul, t: 0 }); sfx.blast(); }
      else if (dx > -30 && dx < a.reach && p.y < 190 && hurt(o.face, a, mul)) A.done = 1;
    }
  } else if (A.t < a.wind + .62) { o.target = POSE.idle; o.vx *= Math.exp(-dt * 10); }
  else { o.state = 'idle'; o.act = null; o.ai.t = rnd(o.ai.d.gap[0], o.ai.d.gap[1]); }
};

const hit0 = H.hit;
H.hit = (o, face, h) => { hit0(o, face, h); o.tele = 0; if (o.ai && !o.poise) o.ai.t = Math.max(o.ai.t, .55); };

H.ko = o => {
  const cfg = fight.cfg;
  if (!cfg) return false;                                       // the training fight keeps its Black Flash finish
  E.slow(.7);
  if (fight.wave < cfg.foes.length - 1) later(1900, () => { if (fight.cfg === cfg) start(cfg, fight.wave + 1); });
  else { if (cfg.win !== null) E.banner(...(cfg.win || ['祓', 'EXORCISED'])); later(cfg.wait || 2700, () => { if (fight.cfg === cfg && cfg.onWin) cfg.onWin(); }); }
  return true;
};

H.tick = dt => {
  const o = E.P2, p = E.P1, m = fight.megumi;
  fight.time += dt;
  if (o.alpha < 1 && !o.ko) { o.alpha = Math.min(1, o.alpha + dt * 2.2); if (Math.random() < dt * 40) V.puff('purple', o.x + rnd(-60, 60), rnd(0, 260), 0, 120, 40, .5); }
  for (let i = shots.length - 1; i >= 0; i--) {                 // cursed-energy blasts: jump or dash through
    const s = shots[i];
    s.x += s.vx * dt; s.t += dt;
    if (Math.random() < dt * 60) V.puff('red', s.x, s.y, -s.vx * .1, rnd(-40, 40), 50, .25);
    if (Math.abs(p.x - s.x) < 62 && p.y < s.y + 50 && hurt(Math.sign(s.vx), s.a, s.mul)) { V.sparks(s.x, s.y, 'red', 12); shots.splice(i, 1); }
    else if (s.t > 2.2 || Math.abs(s.x) > 1100) shots.splice(i, 1);
  }
  if (m) {                                                      // Megumi hangs back and sends the Divine Dog in
    m.face = o.x >= m.x ? 1 : -1; C.stroll(m, false, dt);
    if (!o.ko && o.state !== 'down' && !(o.alpha < 1) && (fight.dogT -= dt) <= 0) {
      fight.dogT = rnd(6, 8); dog = { u: 0, x0: m.x + m.face * 60, z0: m.z, dir: m.face };
      E.fx.push({ k: 2, x: m.x, y: 360, n: 'DIVINE DOG', col: '#aab4ff', t: 0, life: 1.1 }); sfx.charge();
    }
  }
  if (dog) {
    const was = dog.u; dog.u += dt * 2.6;
    if (was < 1 && dog.u >= 1 && !o.ko && o.state !== 'down') {
      E.applyHit(o, dog.dir, { dmg: 8, kb: 300, lift: 420, stun: .6, stop: .08, heavy: 1, col: '#ffffff' });
      for (let i = 0; i < 3; i++) V.slash(o.x, o.y + 120 + i * 40, dog.dir > 0 ? -.5 : Math.PI + .5, 170, '#aab4ff', 9, i * .04);
    }
    if (dog.u > 1.6) dog = null;
  }
};

const fx0 = H.fx;
H.fx = dt => {
  fx0(dt);
  const o = E.P2;
  if (o.state === 'act' && o.tele > 0) {                        // the warning ring closing on a curse that is about to strike
    const hs = o.scale || 1, c = F(o.x, o.y + 150 * hs);
    g.strokeStyle = `rgba(255,36,64,${.35 + .6 * o.tele})`; g.lineWidth = 4;
    g.beginPath(); g.arc(c[0], c[1], lerp(150, 46, o.tele) * hs * c[2], 0, TAU); g.stroke();
  }
  g.globalCompositeOperation = 'lighter';
  for (const s of shots) { const c = F(s.x, s.y); E.glow(E.GLOW.red, c[0], c[1], 190 * c[2], 1); }
  g.globalCompositeOperation = 'source-over';
  for (const s of shots) { const c = F(s.x, s.y); g.fillStyle = '#0b0306'; g.beginPath(); g.arc(c[0], c[1], 24 * c[2], 0, TAU); g.fill(); }
  if (dog) {                                                    // a blocky white wolf, bounding in from where Megumi stands
    const u = dog.u, x = lerp(dog.x0, o.x, Math.min(u, 1)) + (u > 1 ? (u - 1) * 500 * dog.dir : 0), z = lerp(dog.z0, ZP, Math.min(u, 1));
    const c = P(x, 30 + Math.abs(Math.sin(u * 9)) * 40, z), k = c[2] * 1.3;
    g.save(); g.translate(c[0], c[1]); g.scale(dog.dir * k, k); g.globalAlpha = u > 1 ? Math.max(0, 1 - (u - 1) / .6) : 1;
    g.fillStyle = '#f2f4f8'; g.strokeStyle = LINE; g.lineWidth = 3; g.lineJoin = 'round';
    for (const r of [[-58, -52, 84, 34], [18, -70, 40, 34], [-74, -58, 22, 10], [-52, -22, 14, 26], [10, -22, 14, 26], [44, -84, 10, 16]]) { g.beginPath(); g.rect(r[0], r[1], r[2], r[3]); g.fill(); g.stroke(); }
    g.fillStyle = '#c2182b'; g.fillRect(40, -62, 8, 6); g.fillStyle = LINE; g.fillRect(48, -52, 6, 5);
    g.restore(); g.globalAlpha = 1;
  }
};
H.cast = () => (fight.megumi ? [fight.megumi] : null);

const reset0 = H.reset;
H.reset = () => {
  if (reset0) reset0();
  while (pend.length) clearTimeout(pend.pop());
  Object.assign(fight, { cfg: null, megumi: null, paused: false, low: null, floor: 0 });
  shots.length = 0; dog = null; V.clear();
  nm.p2.textContent = 'Training Curse'; nm.p2j.textContent = '呪霊'; nm.p1.textContent = 'The Vessel'; nm.p1j.textContent = '器'; nm.vs.textContent = 'Training';
};

JU.fights = { start, hurt, chip, make, DEFS, fight, later, nm };
})();
