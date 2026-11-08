/* JUJUTSU UNLIMITEDS — Build 0.35: BIT MODE, a DLC. The user's: "lets add a DLC caleld BIT MODE. Above the Play button add a green button in
   style of the 1980s arcade and also make it so it looks liek the bits are infecting its surrondings when it is pressed it play an aniamtion
   of it starting to beat and liek the main menu breaking and then it opens an event page and its BITHIT X jujutsu unlimited. and the dlc is
   JJU in BIT MODE and it has bosses and raid stuff and if yopu beat it you unlock a secret CT called BITKING".
   The button, the bits creeping off it over the menu, the heartbeat and the menu breaking are the title screen's (index.html). This file is
   the DLC itself, and like a real one it is downloaded when the button is pressed (a piece of its own, 'bit': index.html's loader):
     THE EVENT PAGE  BITHIT × JUJUTSU UNLIMITEDS: five stages, one after another, each with its best time; the prize, BITKING; music of
                     its own, made here the way an old console made it, which can be switched off
     BIT MODE        the game as a console from 1985 would have it: drawn a few hundred pixels across, in 64 colours, dithered, the lines of
                     an old screen over it, and the bars and names in an arcade's letters
     THE STAGES      1 GLITCH BEARER · 2 8-BIT FLAME · 3 PIXEL SOUL · 4 MEGA SHIKIGAMI: four of the game's bosses in bits, each on a stage
                     of its own colours (arcade machines along the back, a grid for a floor). 5 BIT RAID: Shibuya's street in bits, curses
                     all the way down it, and at the end THE BIT KING, whose moves are BITKING's turned on you (and below 45% his Kill
                     Screen: half the arena breaks up, get out of it). Lost: GAME OVER, CONTINUE? 9 ... any key to go again. Cleared:
                     STAGE CLEAR and the time; the first clear of each of the first four pays 50 Cursed Tokens; the raid gives BITKING
   Names, numbers and stages are ours; the user named BIT MODE, BITHIT and BITKING. No real names in it (the bosses go by what they are) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, sfx = JU.sfx, Fi = JU.fights, B = JU.boss, K = JU.bitking;
const { rnd, clamp, lerp } = E, TAU = Math.PI * 2, ZP = E.ZP, D = Fi.DEFS;
const S = K.S, FX = K.fx, GREEN = K.GREEN, GOLD = K.GOLD, PIX = K.PIX, INK = '#020804';
const $ = s => document.querySelector(s);
const dev = () => !!(JU.shop && JU.shop.dev);
const SKY = [-.42, -.36, 2.9, 2.7, .4, -.56, 0];
const fmt = t => { if (!(t > 0)) return '--:--'; const m = Math.floor(t / 60), s = t - m * 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };

/* ================= BIT MODE: drawn small, in 64 colours, dithered ================= */
// All of it on the graphics card, never read back (reading the picture back every frame is slow: tried first): the frame is darkened by a
// quarter, a 4x4 ordered-dither pattern is added on top, and the frame is drawn back over itself through index.html's #bitq filter, which
// keeps four levels of each colour. Darkening by a quarter and adding up to a quarter is what makes that an ordered dither to the nearest
// level, with white still white. A browser that cannot draw through an SVG filter (Safari) gets the big pixels without the 64 colours
let bitOn = false, canQ = null, PAT = null;
function testQ() {
  try {
    const a = document.createElement('canvas'), b = document.createElement('canvas');
    a.width = a.height = b.width = b.height = 2;
    const x = a.getContext('2d'), y = b.getContext('2d', { willReadFrequently: true });
    x.fillStyle = 'rgb(100,100,100)'; x.fillRect(0, 0, 2, 2);
    y.filter = 'url(#bitq)'; y.drawImage(a, 0, 0);
    return Math.abs(y.getImageData(0, 0, 1, 1).data[0] - 85) <= 2;      // (100 is in the second quarter: 85)
  } catch (e) { return false; }
}
function posterize() {
  if (canQ === null) canQ = testQ();
  if (!canQ) return;
  if (!PAT) {
    const c = document.createElement('canvas'), x = c.getContext('2d'), B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    c.width = c.height = 4;
    B.forEach((b, i) => { const v = Math.round((b + .5) / 64 * 255); x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i % 4, i >> 2, 1, 1); });
    PAT = g.createPattern(c, 'repeat');
  }
  const cv = g.canvas;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.shadowBlur = 0; g.filter = 'none';
  g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, cv.width, cv.height);
  g.globalCompositeOperation = 'lighter'; g.fillStyle = PAT; g.fillRect(0, 0, cv.width, cv.height);
  g.globalCompositeOperation = 'source-over'; g.filter = 'url(#bitq)'; g.drawImage(cv, 0, 0);
  g.restore();
}
function setBit(v) {
  v = !!v;
  if (v === bitOn) return;
  bitOn = v; E.root.classList.toggle('bit', v);
  dispatchEvent(new Event('resize'));               // (game.js draws at the size hooks.dpr says, below)
}
const dpr0 = H.dpr;
H.dpr = d => (bitOn ? 1 / clamp(innerWidth / 400, 2, 5) : dpr0 ? dpr0(d) : d);

/* ================= the stages: an arcade at night, in each boss's colours ================= */
const THEMES = [
  { sky: ['#000000', '#03100a', '#052010', '#083418'], moon: '#d9ffd0', far: '#0b4418', ground: '#020a04', grid: '#39ff14', cab: '#ffd23d' },
  { sky: ['#000000', '#180502', '#350c04', '#621806'], moon: '#ffd08a', far: '#4a1406', ground: '#0a0302', grid: '#ff6a2a', cab: '#ffd23d' },
  { sky: ['#000000', '#0b0416', '#1a0a32', '#2c1256'], moon: '#e6d4ff', far: '#280e48', ground: '#06020c', grid: '#a65cff', cab: '#ff3dd8' },
  { sky: ['#000000', '#020e18', '#042036', '#063258'], moon: '#ffffff', far: '#062e48', ground: '#020608', grid: '#7fe9ff', cab: '#ffd23d' }
];
function bitStage(th) {
  const STARS = Array.from({ length: 60 }, () => [Math.random(), Math.random() * .85, Math.random() < .2 ? 2 : 1, Math.random() * TAU]);
  const CABS = [-930, -640, -350, 350, 640, 930];
  return {
    sky() {
      const HY = E.HY, VW = E.VW, n = th.sky.length, bh = (HY + 84) / n, W2 = VW + 200;
      for (let i = 0; i < n; i++) { g.fillStyle = th.sky[i]; g.fillRect(-80, -80 + i * bh, VW + 160, bh + 1); }
      for (const [x, y, s, ph] of STARS) {
        if (Math.sin(E.T * 2.2 + ph * 3) < -.7) continue;
        const px = (((x * W2 - cam.x * .03 - cam.yaw * 260) % W2) + W2) % W2 - 100;
        g.fillStyle = s > 1 ? th.moon : '#ffffff'; g.fillRect(px, y * (HY - 40), 3 * s, 3 * s);
      }
      const mx = VW * .7 - cam.x * .02 - cam.yaw * 420, my = HY * .3, R = 64, st = 8;
      g.fillStyle = th.moon;
      for (let y = -R; y < R; y += st) { const w = Math.round(Math.sqrt(Math.max(0, R * R - (y + st / 2) ** 2)) / st) * st; g.fillRect(mx - w, my + y, w * 2, st); }
      g.fillStyle = th.sky[n - 1]; g.fillRect(mx - 24, my - 32, 16, 16); g.fillRect(mx + 8, my + 8, 24, 16); g.fillRect(mx - 40, my + 24, 8, 8);
      g.fillStyle = th.far;
      const off = cam.x * .05 + cam.yaw * 520 + 5000, step = 32;
      for (let x = -100 - (off % step); x < VW + 100; x += step) {
        const j = Math.floor((x + off) / step), h = 40 + 70 * Math.abs(Math.sin(j * .37)) + 30 * Math.abs(Math.sin(j * 1.13));
        g.fillRect(x, HY - h, step + 1, h + 2);
      }
    },
    floor() {
      const HY = E.HY, VW = E.VW, VH = E.VH;
      g.fillStyle = th.ground; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
      g.strokeStyle = th.grid; g.lineWidth = 2; g.globalAlpha = .55; g.beginPath();
      for (let x = -2250; x <= 2250; x += 150) { const a = E.P(x, 0, E.ZNEAR + 1), b = E.P(x, 0, ZP + 900); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
      const zs = (E.T * 120) % 100;
      for (let z = E.ZNEAR + 10 + (100 - zs); z <= ZP + 900; z += 100) { const a = E.P(-2250, 0, z), b = E.P(2250, 0, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
      g.stroke(); g.globalAlpha = 1;
    },
    back() {
      for (const x of CABS) {                         // arcade machines along the back wall, their screens lit
        const [a, , c, e] = E.box(x, 0, ZP + 470, 130, 290, 110, '#14141c', '#0c0c12', '#1c1c26');
        const sx0 = lerp(e[0], c[0], .14), sx1 = lerp(e[0], c[0], .86), sy0 = lerp(e[1], a[1], .12), sy1 = lerp(e[1], a[1], .5), w = sx1 - sx0, h = sy1 - sy0;
        g.fillStyle = th.grid; g.globalAlpha = .7 + .3 * Math.sin(E.T * 3 + x); g.fillRect(sx0, sy0, w, h); g.globalAlpha = 1;
        g.fillStyle = '#000'; const ix = sx0 + w * (.3 + .2 * Math.sin(E.T + x)); g.fillRect(ix, sy0 + h * .3, w * .2, h * .2); g.fillRect(ix - w * .05, sy0 + h * .45, w * .3, h * .1);
        g.fillStyle = th.cab; g.fillRect(lerp(e[0], c[0], .22), lerp(e[1], a[1], .64), (c[0] - e[0]) * .12, (a[1] - e[1]) * .05);
        g.fillStyle = '#ff2440'; g.fillRect(lerp(e[0], c[0], .62), lerp(e[1], a[1], .64), (c[0] - e[0]) * .12, (a[1] - e[1]) * .05);
      }
    },
    front() {}
  };
}

/* ================= the bosses, in bits ================= */
function bitDef(id, base, o) {
  const b = D[base];
  if (!b) return null;
  const d = D[id] = Object.assign({}, b, o);
  if (b.kit) d.kit = Object.assign({}, b.kit, { tech: o.tech || b.kit.tech });      // (its own moves, under a name of the DLC's)
  return d;
}
const BOSSES = [
  { id: 'bit_bearer', base: 'finger', name: 'GLITCH BEARER', jp: 'バグ', hp: 260, dr: .55, tech: 'Glitched Fingers', bitCol: '#39ff14', icon: 'bearer' },
  { id: 'bit_flame', base: 'jogo', name: '8-BIT FLAME', jp: '火山', hp: 560, dr: .9, tech: 'Pixel Flames', bitCol: '#ff6a2a', icon: 'flame' },
  { id: 'bit_soul', base: 'mahito', name: 'PIXEL SOUL', jp: '魂', hp: 600, dr: .85, tech: 'Pixel Transfiguration', bitCol: '#a65cff', icon: 'soul' },
  { id: 'bit_shiki', base: 'mahoraga', name: 'MEGA SHIKIGAMI', jp: '式神', hp: 620, dr: .8, tech: 'Adaptation.exe', bitCol: '#7fe9ff', icon: 'wheel' }
];
for (const b of BOSSES) bitDef(b.id, b.base, { name: b.name, jp: b.jp, hp: b.hp, dr: b.dr, tech: b.tech, bitCol: b.bitCol });
if (D.grunt) D.bit_grunt = Object.assign({}, D.grunt, { name: 'BIT GRUNT', jp: '四級', hp: 70, bitCol: '#39ff14' });
if (D.brute) D.bit_brute = Object.assign({}, D.brute, { name: 'BIT BRUTE', jp: '三級', hp: 110, bitCol: '#ffe83d' });
bitDef('bit_bloom', 'hanami', { name: 'BIT BLOOM', jp: '花', hp: 340, dr: .6, tech: 'Pixel Plants', bitCol: '#8cff3a' });

/* ---------- THE BIT KING: BITKING's moves, turned on you ---------- */
const KM = { c: GREEN, M: null };                    // the mode he is in, and its colour
const kcol = () => (KM.M && KM.M.king ? K.RAINBOW[(E.T * 10 | 0) % 10] : KM.c);
function kmode(o) {
  const M = K.MODES[Math.random() * 50 | 0];
  KM.M = M; KM.c = M.col;
  FX.word(o.x, o.y + 470, 'MODE ' + (M.n < 10 ? '0' : '') + M.n + ' · ' + M.name, M.col, 20, 1.1);
}
D.bit_king = { name: 'THE BIT KING', jp: 'ビット王', skin: K.skinFor(kcol), hp: 1100, scale: 1.25, speed: 260, range: 210, gap: [.35, .8], dr: .75, poise: true, bitCol: GREEN,
  atk: [{ pre: 'hookWind', pose: 'hook', wind: .38, lunge: 420, reach: 225, dmg: 12, kb: 460, stun: .45 },
        { pre: 'crushWind', pose: 'crush', wind: .55, lunge: 360, reach: 235, dmg: 17, kb: 680, lift: 600 }] };
let KS = null;                                       // his Kill Screen: { side, edge, t, warn }
const charge = (o, p, A) => { if (!A.m) { A.m = 1; kmode(o); } };
const KILLMOVE = { name: 'Kill Screen', cd: 15, below: .45, wind: .55, pre: SKY, dur: 2.7, charge,
  run(o, p, A, t, dt) {
    o.target = SKY; o.vx = 0;
    if (!A.side) { A.side = p.x >= o.x ? 1 : -1; KS = { side: A.side, edge: o.x, t: 0, warn: 1, seed: Math.random() * 1e4 }; K.chip('kill'); E.banner('崩壊', 'KILL SCREEN · GET OUT', 'xs'); }
    if (!KS) return;
    KS.t = t; KS.edge = o.x;
    if (t > 1.05 && t < 2.6) {
      KS.warn = 0; A.tk = (A.tk || 0) + (dt || 0);
      if (A.tk > .25) { A.tk = 0; if ((p.x - KS.edge) * KS.side > -30) Fi.chip(9, kcol()); }
    }
    if (t >= 2.6) KS = null;
  } };
B.kit('bit_king', { tech: 'BITKING', col: GREEN, glow: 'green', every: [1.5, 2.9], moves: [
  { name: 'Pixel Blaster', cd: 4, min: 240, wind: .45, pre: 'divWind', dur: .65, charge,
    run(o, p, A, t) {
      o.target = POSE.div;
      const n = Math.min(5, Math.floor(t / .1) + 1);
      while ((A.n || 0) < n) {
        A.n = (A.n || 0) + 1;
        const hx = o.x + o.face * 110, hy = 220, a = Math.atan2(p.y + 150 - hy, Math.max(200, Math.abs(p.x - hx))) * .5, c = kcol();
        B.shot({ x: hx, y: hy, vx: Math.cos(a) * 1100 * o.face, vy: Math.sin(a) * 1100, r: 18, life: 2, a: { dmg: 7, kb: 240, stun: .3 }, draw: s => FX.bit(s.x, s.y, 34, c) });
        K.chip('pew');
      }
    } },
  { name: 'Byte Dash', cd: 5, min: 180, max: 1100, wind: .5, pre: 'kickWind', dur: .6, charge,
    run(o, p, A, t) {
      if (t < .4) {
        o.target = POSE.dash; o.vx = o.face * 2000;
        if (!A.s) { A.s = 1; K.chip('dash'); }
        FX.pix(o.x - o.face * 50, o.y + rnd(40, 320), 1, [kcol()], 60, 18, .25);
        if (!A.hit && Math.abs(p.x - o.x) < 100 && p.y < 220 && Fi.hurt(o.face, { dmg: 16, kb: 760, lift: 420 }, B.mul())) A.hit = 1;
      } else { o.vx *= .5; o.target = POSE.idle; }
    } },
  { name: 'Cartridge Slam', cd: 6, wind: .3, pre: SKY, dur: 1, charge,
    run(o, p, A, t) {
      o.target = SKY;
      if (A.x === undefined) {
        A.x = p.x; const c = kcol(), x = A.x;
        B.mark(x, 170, .75, c); K.chip('fall');
        B.add({ life: .76, draw: h => { const u = Math.min(1, h.t / .75); K.fx.drawCart(x, 1300 * (1 - u * u), .85, c); } });
      }
      if (t >= .75 && !A.land) {
        A.land = 1; B.burst(A.x, 170, { dmg: 24, kb: 620, lift: 720 });
        FX.cross(A.x, 60, 280, kcol()); FX.pix(A.x, 20, 22, [kcol(), '#7c7c88', '#fff'], 640, 16, .6); cam.shake = Math.max(cam.shake, 20); K.chip('boom');
      }
    } },
  { name: 'Mega Beam', cd: 7, min: 160, wind: .75, pre: 'divWind', dur: .7,
    charge(o, p, A) {
      charge(o, p, A);
      if (!A.warn) { A.warn = 1; const x = o.x, f = o.face, c = kcol(); B.add({ life: .75, draw: h => { if ((h.t * 12 | 0) % 2) return; const a = F(x, 120), b = F(x + f * 1900, 120); g.fillStyle = c; g.globalAlpha = .7; g.fillRect(Math.min(a[0], b[0]), a[1] - 2, Math.abs(b[0] - a[0]), 4); g.globalAlpha = 1; } }); }
    },
    run(o, p, A, t) {
      o.target = POSE.div;
      if (!A.on) {
        A.on = 1; K.chip('beam'); cam.shake = Math.max(cam.shake, 10);
        const x = o.x, f = o.face, c = kcol();
        B.add({ life: .6, draw: h => {
          const u = h.t / .6, half = 60 * (u < .1 ? u / .1 : u > .85 ? (1 - u) / .15 : 1), a = F(f > 0 ? x + 80 : x - 1980, 120 + half), b = F(f > 0 ? x + 1980 : x - 80, 120 - half), hh = b[1] - a[1];
          g.fillStyle = INK; g.fillRect(a[0], a[1] - 3, b[0] - a[0], hh + 6); g.fillStyle = c; g.fillRect(a[0], a[1], b[0] - a[0], hh);
          g.fillStyle = '#fff'; g.fillRect(a[0], a[1] + hh * .38, b[0] - a[0], hh * .24);
        } });
      }
      if (t < .6 && !A.hit) { const dx = (p.x - o.x) * o.face; if (dx > 0 && dx < 1950 && p.y < 165 && Fi.hurt(o.face, { dmg: 22, kb: 820, lift: 380 }, B.mul())) A.hit = 1; }
    } },
  { name: 'Bit Rain', cd: 6, wind: .4, pre: SKY, dur: 1.1, charge,
    run(o, p, A, t) {
      o.target = SKY;
      if (!A.xs) { A.xs = [p.x, p.x + rnd(-320, -170), p.x + rnd(170, 320)]; for (const x of A.xs) B.mark(x, 90, .55, kcol()); }
      if (t >= .55 && !A.f) {
        A.f = 1; const c = kcol();
        for (const x of A.xs) for (let i = 0; i < 3; i++) B.shot({ x: x + rnd(-40, 40), y: 1100 + i * 170, vx: 0, vy: -1600, grav: 1, r: 18, life: 1.6, a: { dmg: 8, kb: 200, stun: .3 }, draw: s => FX.bit(s.x, s.y, 34, c), land: s => FX.pix(s.x, 10, 4, [c], 300, 10, .3) });
        K.chip('pew');
      }
    } },
  KILLMOVE
] });

/* ---------- the BIT RAID: down Shibuya's street, in bits ---------- */
const ROUTE = ['bit_grunt', 'bit_grunt', 'bit_brute', 'bit_grunt', 'bit_brute', 'bit_brute', 'bit_bloom', 'bit_grunt', 'bit_brute', 'bit_king'];

/* ================= a stage being played ================= */
let run = null;                                      // { n }
const ov = document.createElement('div'); ov.className = 'bvov'; ov.setAttribute('aria-live', 'assertive'); E.root.appendChild(ov);
let ovT = 0, ovKind = '';
function hideOv() { clearInterval(ovT); ovT = 0; ovKind = ''; ov.className = 'bvov'; ov.innerHTML = ''; }
function intro(n, title) {                          // READY? on the stage, the fight held still
  const t0 = performance.now();
  ov.className = 'bvov intro on'; ovKind = 'ready';
  ov.innerHTML = `<small>${n === 5 ? 'STAGE 5 · BIT RAID' : 'STAGE ' + n}</small><b>${title}</b><i>READY?</i>`;
  E.hud.banner.className = 'banner';
  E.setScene({ mode: 'fight', update() {}, render(dt) { E.renderArena(dt); }, press() {} });
  const done = () => {
    if (!run || run.n !== n || ovKind !== 'ready') return;
    hideOv(); E.setScene(null); E.banner('開戦', 'FIGHT!'); K.chip('mode');
  };
  setTimeout(done, JU.reduceMotion ? 500 : 1500);
  void t0;
}
function begin(n) {
  n = clamp(n | 0, 1, 5);
  hideOv(); KS = null;
  run = { n };
  setBit(true);
  JU.tech.apply(); JU.clan.apply(); if (JU.tools) JU.tools.apply();      // whatever is equipped, as in Free Exploration and Training
  if (n === 5) { raid(); return; }
  const b = BOSSES[n - 1];
  Fi.start({ foes: [b.id], stage: bitStage(THEMES[n - 1]), label: 'BIT MODE · STAGE ' + n, p1x: -260, win: ['勝利', 'STAGE CLEAR'], wait: 1800, bit: n,
    onWin: () => cleared(n), onLose: () => over(n) });
  MUS.start('fight');
  intro(n, b.name);
}
function raid() {
  const R = JU.raid, St = JU.street;
  if (!R || !R.solo || !St) { toast('The city is not in yet. Try again in a moment.'); JU.exitGame(); return; }
  const f0 = St.fight;
  St.fight = o => Fi.start(Object.assign({ stage: E.SHRINE, label: 'BIT RAID', p1x: -200, onWin: () => cleared(5), onFlee: () => over(5) }, o.cfg, { bit: 5 }));
  let ok = false;
  try { ok = R.solo({ name: 'BIT RAID', jp: 'ビット', foes: ROUTE, w: 'shibuya', at: 1e9, after() {} }); } finally { St.fight = f0; }
  if (!ok) { toast('A raid is already going. Finish it first.'); JU.exitGame(); return; }
  MUS.start('fight');
  intro(5, 'THE BIT KING WAITS AT THE END');
}
function toast(t) { const el = document.createElement('div'); el.className = 'bvtoast'; el.textContent = t; E.root.appendChild(el); setTimeout(() => el.remove(), 3200); }
function cleared(n) {
  if (!run || run.n !== n) return;
  const t = Fi.fight.time, first = S.st < n, key = 's' + n, best = S.best[key], rec = !(best > 0) || t < best;
  if (first) S.st = n;
  if (rec) S.best[key] = Math.round(t * 10) / 10;
  const pay = first && n < 5 ? 50 : 0;
  if (pay && JU.shop && JU.shop.earn) JU.shop.earn(pay, E.P1);
  const king = n === 5 && K.unlock();
  K.save();
  run.cleared = king ? 'king' : n;
  MUS.stop(); K.chip('up');
  ovKind = 'clear';
  ov.className = 'bvov clear on' + (n === 5 ? ' all' : '');
  ov.innerHTML = n === 5
    ? `<b>YOU BEAT BIT MODE!</b><span>TIME ${fmt(t)}${rec ? ' · NEW RECORD!' : ''}</span>${king ? '<em>SECRET CT UNLOCKED<br><u>BITKING</u></em>' : '<em>BITKING IS YOURS ALREADY</em>'}<small>PRESS ANY KEY</small>`
    : `<b>STAGE CLEAR!</b><span>TIME ${fmt(t)}</span><span>${rec ? 'NEW RECORD!' : 'BEST ' + fmt(best)}</span>${pay ? `<em>+${pay} CURSED TOKENS</em>` : ''}<small>PRESS ANY KEY</small>`;
  ovT = setTimeout(() => { if (ovKind === 'clear') JU.exitGame(); }, n === 5 ? 6500 : 4200);
}
function over(n) {
  if (!run || run.n !== n || ovKind === 'over') return;
  K.chip('over'); MUS.stop();
  ovKind = 'over';
  let left = 9;
  ov.className = 'bvov over on';
  const paint = () => { ov.innerHTML = `<b>GAME OVER</b><span>CONTINUE?</span><i>${left}</i><small>ANY KEY · CONTINUE &nbsp;&nbsp; ESC · QUIT</small>`; };
  paint();
  ovT = setInterval(() => { left--; if (left < 0) { hideOv(); JU.exitGame(); return; } paint(); sfx.hover(); }, 1000);
}
function again() { const n = run && run.n; hideOv(); if (n) JU.game.start('bit', n); }
// while GAME OVER or STAGE CLEAR is up, a key is an answer, not a move
addEventListener('keydown', e => {
  if (!ovKind || ovKind === 'ready' || !run) return;
  if (e.repeat) { e.preventDefault(); e.stopImmediatePropagation(); return; }
  e.preventDefault(); e.stopImmediatePropagation();
  const k = e.key;
  if (ovKind === 'over') { if (k === 'Escape') { hideOv(); JU.exitGame(); } else again(); }
  else if (ovKind === 'clear') { hideOv(); JU.exitGame(); }
}, true);
ov.addEventListener('pointerdown', e => {
  if (ovKind === 'over') { e.stopPropagation(); again(); }
  else if (ovKind === 'clear') { e.stopPropagation(); hideOv(); JU.exitGame(); }
});

/* ================= the music, made here: a pulse lead, a triangle bass, noise drums ================= */
const MUS = (() => {
  let master = null, timer = 0, step = 0, next = 0, song = null, wave = null;
  const ctx = () => sfx.ctx || null;
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);
  function pulse(a) {
    if (wave) return wave;
    const n = 24, re = new Float32Array(n), im = new Float32Array(n);
    for (let i = 1; i < n; i++) re[i] = 2 / (i * Math.PI) * Math.sin(i * Math.PI * .25);
    return (wave = a.createPeriodicWave(re, im));
  }
  function note(a, type, m, t, dur, vol) {
    const o = a.createOscillator(), v = a.createGain();
    if (type === 'pulse') o.setPeriodicWave(pulse(a)); else o.type = type;
    o.frequency.value = hz(m);
    v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(vol, t + .006); v.gain.setValueAtTime(vol, t + dur * .55); v.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(v); v.connect(master); o.start(t); o.stop(t + dur + .03);
  }
  let noiseBuf = null;
  function drum(a, kind, t) {
    if (kind === 'k') {
      const o = a.createOscillator(), v = a.createGain();
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + .12);
      v.gain.setValueAtTime(.32, t); v.gain.exponentialRampToValueAtTime(.0001, t + .16);
      o.connect(v); v.connect(master); o.start(t); o.stop(t + .18);
      return;
    }
    if (!noiseBuf) { const n = a.sampleRate * .2 | 0; noiseBuf = a.createBuffer(1, n, a.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; }
    const s = a.createBufferSource(), f = a.createBiquadFilter(), v = a.createGain(), dur = kind === 's' ? .12 : .035;
    s.buffer = noiseBuf; f.type = kind === 's' ? 'bandpass' : 'highpass'; f.frequency.value = kind === 's' ? 1800 : 7000;
    v.gain.setValueAtTime(kind === 's' ? .14 : .045, t); v.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(v); v.connect(master); s.start(t); s.stop(t + dur + .02);
  }
  // songs: per 16th step, lead (eighths, each held two steps), bass (eighths), drums
  const EV_LEAD = [69, 72, 76, 81, 79, 76, 72, 74, 72, 69, 65, 69, 72, 77, 76, 72, 76, 79, 84, 79, 76, 72, 74, 76, 74, 71, 67, 71, 74, 79, 76, 0];
  const EV_BASS = [45, 57, 45, 57, 45, 57, 45, 57, 41, 53, 41, 53, 41, 53, 41, 53, 48, 60, 48, 60, 48, 60, 48, 60, 43, 55, 43, 55, 43, 55, 43, 55];
  const CH = [[69, 72, 76, 81], [65, 69, 72, 77], [67, 71, 74, 79], [64, 68, 71, 76]], ARP = [0, 1, 2, 1, 0, 1, 2, 3, 0, 1, 2, 1, 3, 2, 1, 0];
  const FI_LEAD = []; for (const c of CH) for (const i of ARP) FI_LEAD.push(c[i]);
  const FI_BASS = []; for (const c of CH) for (let i = 0; i < 8; i++) FI_BASS.push(c[0] - (i % 2 ? 12 : 24));
  const SONGS = {
    event: { bpm: 126, len: 64, play(a, s, t, sp) {
      if (s % 2 === 0) { const m = EV_LEAD[s / 2]; if (m) note(a, 'pulse', m, t, sp * 1.9, .06); note(a, 'triangle', EV_BASS[s / 2], t, sp * 1.8, .1); }
      const b = s % 16; if (b === 0 || b === 8) drum(a, 'k', t); if (b === 4 || b === 12) drum(a, 's', t); if (b % 4 === 2) drum(a, 'h', t);
    } },
    fight: { bpm: 152, len: 64, play(a, s, t, sp) {
      note(a, 'pulse', FI_LEAD[s] + 12 * (s >= 32 && s < 48 ? 0 : 0), t, sp * .9, .045);
      if (s % 2 === 0) note(a, 'triangle', FI_BASS[s / 2] + 12, t, sp * 1.7, .11);
      const b = s % 16; if (b === 0 || b === 6 || b === 8 || b === 11) drum(a, 'k', t); if (b === 4 || b === 12) drum(a, 's', t); if (b % 2 === 1) drum(a, 'h', t);
    } }
  };
  function tick() {
    const a = ctx();
    if (!a || !song || !sfx.on || !S.music) { stop(); return; }
    const sp = 60 / song.bpm / 4;
    while (next < a.currentTime + .15) { try { song.play(a, step, next, sp); } catch (e) {} next += sp; step = (step + 1) % song.len; }
  }
  function start(name) {
    if (!sfx.on || !S.music) { stop(); return; }
    const a = ctx(), sg = SONGS[name];
    if (!a || !sg) return;
    if (song === sg && timer) return;
    stop();
    master = a.createGain(); master.gain.value = .55;
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    master.connect(lp); lp.connect(a.destination);
    song = sg; step = 0; next = a.currentTime + .06;
    timer = setInterval(tick, 40); tick();
  }
  function stop() {
    clearInterval(timer); timer = 0; song = null;
    if (master) { const m = master, a = ctx(); try { m.gain.setTargetAtTime(0, a.currentTime, .05); } catch (e) {} setTimeout(() => { try { m.disconnect(); } catch (e) {} }, 500); }
    master = null;
  }
  return { start, stop, get on() { return !!song; } };
})();

/* ================= the event page: BITHIT × JUJUTSU UNLIMITEDS ================= */
const ICONS = {
  bearer: { pal: { w: '#e6e9ea', g: '#8b979c', k: '#12090c', t: '#f4f1e6', r: '#c2182b' }, map: [
    '................', '....wwwwwwww....', '...wwwwwwwwww...', '..wwwwwwwwwwww..', '..wkkwwkkwwkkw..', '..wkrwwkrwwkrw..', '..wwwwwwwwwwww..', '..wwkkwwwwkkww..',
    '..wwkrwwwwkrww..', '..wwwwwwwwwwww..', '..wkkkkkkkkkkw..', '..wktktktktktw..', '..wkkkkkkkkkkw..', '...wwwwwwwwww...', '....gggggggg....', '................'] },
  flame: { pal: { y: '#ffd23d', o: '#ff6a2a', b: '#4a3a38', w: '#f4efe4', k: '#120808', r: '#ff2440' }, map: [
    '.....y..y.......', '....yoy.yoy..y..', '...yoooyoooyoy..', '....ooooooooo...', '.....bbbbbbb....', '....bbbbbbbbb...', '...bbbbbbbbbbb..', '...bbwwwwwbbbb..',
    '..bbbwwkkwwbbbb.', '..bbbwwkkwwbbbb.', '..bbbbwwwwbbbbb.', '.bbbbbbbbbbbbbbb', '.bbbkkkkkkkkbbbb', '.bbbbkrrrrkbbbbb', 'bbbbbbbbbbbbbbbb', '................'] },
  soul: { pal: { h: '#7d8aa6', s: '#d8c8b8', S: '#b8a898', l: '#3a2a2a', k: '#120808', b: '#4fc3ff', g: '#c0c0c0', t: '#f4f1e6' }, map: [
    '....hhhhhhhh....', '...hhhhhhhhhh...', '..hhhhhhhhhhhh..', '..hhssssssssshh.', '..hsSSSSlsssssh.', '..sSSSSSlssssss.', '..sSkkSSlsskkss.', '..sSkbSSlsskgss.',
    '..sSSSSSlssssss.', '..llllllllllll..', '..ssssssslssss..', '..sskkkkkkkkss..', '..sssktktktsss..', '...ssskkkkss....', '....ssssssss....', '................'] },
  wheel: { pal: { y: '#ffd23d', Y: '#9a7412', k: '#120808' }, map: [
    '.......yy.......', '...yy..yy..yy...', '...yyy.yy.yyy...', '....yyyyyyyy....', '.....yYYYYy.....', '..yyyYkkkkYyyy..', 'yyyyyYkyykYyyyyy', 'yyyyyYkyykYyyyyy',
    '..yyyYkkkkYyyy..', '.....yYYYYy.....', '....yyyyyyyy....', '...yyy.yy.yyy...', '...yy..yy..yy...', '.......yy.......', '................', '................'] },
  king: { pal: { y: '#ffd23d', G: '#39ff14', k: '#020804', d: '#0d2615', D: '#16401f', w: '#ffffff' }, map: [
    '..y....y....y...', '..yy..yyy..yy...', '..yyyyyyyyyyy...', '..yGyyyGyyyGy...', '..yyyyyyyyyyy...', '..kkkkkkkkkkkk..', '..kddddddddDDk..', '..kdkkkddkkkDk..',
    '..kdkGGddkGGDk..', '..kdkGwddkGwDk..', '..kddddddddDDk..', '..kdGdGdGdGdDk..', '..kddGdGdGdDDk..', '..kddddddddDDk..', '..kkkkkkkkkkkk..', '................'] }
};
function icon(cv, id, locked) {
  const I = ICONS[id], x = cv.getContext('2d');
  cv.width = cv.height = 16; x.clearRect(0, 0, 16, 16);
  I.map.forEach((row, y) => { for (let i = 0; i < 16; i++) { const c = row[i]; if (c === '.') continue; x.fillStyle = locked ? '#0c2a12' : I.pal[c] || '#fff'; x.fillRect(i, y, 1, 1); } });
  if (locked) { x.fillStyle = '#39ff14'; [[6, 4], [7, 3], [8, 3], [9, 4], [9, 5], [8, 6], [7, 7], [7, 8], [7, 10]].forEach(([a, b]) => x.fillRect(a, b, 1, 1)); }
}
// BITHIT, in a five-by-seven arcade alphabet, with its shadow
const FONT = { B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'], I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'], H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'] };
function logo(cv) {
  const word = 'BITHIT', x = cv.getContext('2d');
  cv.width = word.length * 6 + 1; cv.height = 10;
  const put = (dx, dy, col) => [...word].forEach((ch, n) => FONT[ch].forEach((r, y) => { for (let i = 0; i < 5; i++) if (r[i] === '1') { x.fillStyle = typeof col === 'function' ? col(y) : col; x.fillRect(n * 6 + i + dx, y + dy, 1, 1); } }));
  put(1, 2, '#041a08'); put(1, 1, '#0b4418');
  put(0, 0, y => (y < 2 ? '#e8ffe0' : y < 5 ? '#39ff14' : '#1fa80c'));
}

let busy = false, bgRaf = 0, fresh = 0;
function stage(n) {
  const st = dev() ? 5 : S.st, done = st >= n, open = n <= st + 1, b = BOSSES[n - 1], best = S.best['s' + n];
  const name = n === 5 ? 'BIT RAID' : b.name, sub = n === 5 ? 'THE BIT KING' : b.tech.toUpperCase();
  return `<button class="bvst${n === 5 ? ' raid' : ''}${done ? ' done' : ''}${open && !done ? ' next' : ''}${open ? '' : ' lock'}${fresh === n ? ' fresh' : ''}" data-st="${n}" style="--c:${n === 5 ? GREEN : b.bitCol}" aria-label="Stage ${n}: ${name}${open ? '' : ', locked'}">
    <canvas class="bvic" data-ic="${n === 5 ? 'king' : b.icon}"${open ? '' : ' data-lock="1"'}></canvas><small>STAGE ${n}</small><b>${name}</b><em>${open ? sub : '???'}</em>
    <i>${done ? 'CLEAR · ' + fmt(best) : open ? 'PRESS START' : 'LOCKED'}</i></button>`;
}
function mount() {
  const el = $('#bvIn');
  if (!el) return;
  const king = K.unlocked, eq = JU.tech.equipped === 'bitking';
  el.innerHTML = `<header class="bvlogo"><canvas class="bvword" aria-label="BITHIT"></canvas><b class="bvx" aria-hidden="true">×</b><span class="bvju">JUJUTSU<br>UNLIMITEDS</span></header>
    <p class="bvtag"><span>DLC</span> JJU IN BIT MODE <span>${dev() ? 'TEAM' : 'FREE'}</span></p>
    <div class="bvstages">${[1, 2, 3, 4, 5].map(stage).join('')}</div>
    <div class="bvprize${king ? ' got' : ''}${fresh === 'king' ? ' reveal' : ''}"><canvas class="bvic big" data-ic="king"${king ? '' : ' data-lock="1"'}></canvas>
      <div><small>SECRET CT</small><b>BITKING</b><p>15 MOVES · 50 MODES · VERY OP</p><i>${king ? (dev() ? 'UNLOCKED · TEAM ACCOUNT' : 'UNLOCKED') : 'BEAT STAGE 5 TO UNLOCK'}</i></div>
      ${king ? `<button class="bveq${eq ? ' on' : ''}" type="button">${eq ? 'EQUIPPED' : 'EQUIP'}</button>` : ''}</div>
    <footer class="bvfoot"><button class="bvback" type="button">◀ BACK <small>ESC</small></button><span class="bvcoin">INSERT COIN · CREDITS ∞</span>
      <button class="bvmus" type="button" aria-pressed="${!!S.music}">♪ ${S.music ? 'ON' : 'OFF'}</button></footer>`;
  logo(el.querySelector('.bvword'));
  el.querySelectorAll('canvas[data-ic]').forEach(c => icon(c, c.dataset.ic, !!c.dataset.lock));
  fresh = 0;
}
function focusFirst() {
  const el = $('#bvIn'), c = el && (el.querySelector('.bvst.next') || el.querySelector('.bveq') || el.querySelector('.bvst:not(.lock)') || el.querySelector('.bvback'));
  if (c) c.focus({ preventScroll: true });
}
function play(n, x, y) {
  if (busy || !JU.bitTitle || !JU.bitTitle.open) return;
  const st = dev() ? 5 : S.st;
  if (n > st + 1) { sfx.back(); return; }
  if (n === 5 && JU.load && !JU.load.has(['city'])) { busy = true; JU.load.need(['city'], 'the city').then(ok => { busy = false; if (ok) play(n, x, y); }); return; }
  MUS.stop(); stopBg();
  JU.startGame(x, y, 'bit', n);
}
document.addEventListener('click', e => {
  const page = $('#bitev');
  if (!page || !page.contains(e.target)) return;
  const st = e.target.closest('.bvst'), r = st && st.getBoundingClientRect();
  if (st) { if (st.classList.contains('lock')) { st.classList.remove('no'); void st.offsetWidth; st.classList.add('no'); K.chip('err'); return; } sfx.confirm(); play(+st.dataset.st, e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2); return; }
  if (e.target.closest('.bveq')) { if (JU.tech.equipped !== 'bitking') { JU.tech.equip('bitking'); K.chip('up'); } mount(); focusFirst(); return; }
  if (e.target.closest('.bvmus')) { S.music = S.music ? 0 : 1; K.save(); if (S.music) MUS.start('event'); else MUS.stop(); mount(); const m = $('#bvIn .bvmus'); if (m) m.focus(); return; }
  if (e.target.closest('.bvback')) { if (JU.bitTitle) JU.bitTitle.close(); }
});
addEventListener('keydown', e => {                    // the arrows go round the page; Esc goes back (index.html)
  if (!JU.bitTitle || !JU.bitTitle.open || (JU.game && JU.game.state.running)) return;
  const k = e.key, list = [...document.querySelectorAll('#bvIn .bvst, #bvIn .bveq, #bvIn .bvback, #bvIn .bvmus')];
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].includes(k) || !list.length) return;
  e.preventDefault();
  const i = Math.max(0, list.indexOf(document.activeElement)), dir = k === 'ArrowLeft' || k === 'a' || k === 'ArrowUp' || k === 'w' ? -1 : 1;
  list[(i + dir + list.length) % list.length].focus({ preventScroll: true }); sfx.hover();
});

/* ---------- behind it: stars, a grid running away, bits falling at the sides ---------- */
const BITS = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), v: rnd(.05, .18), c: Math.random() < .5 ? '0' : '1', s: rnd(.6, 1.2) }));
function bg() {
  const cv = $('#bvbg');
  if (!cv) return;
  const W = Math.ceil(innerWidth / 3), Hh = Math.ceil(innerHeight / 3), x = cv.getContext('2d');
  if (cv.width !== W || cv.height !== Hh) { cv.width = W; cv.height = Hh; }
  const t = performance.now() / 1000;
  x.fillStyle = '#000'; x.fillRect(0, 0, W, Hh);
  const hy = Hh * .62;
  for (let i = 0; i < 60; i++) { const sx = (i * 97.13 % 1) * W, sy = (i * 41.77 % 1) * hy; if (Math.sin(t * 2 + i) > -.5) { x.fillStyle = i % 7 ? '#2a5a30' : '#d9ffd0'; x.fillRect(sx | 0, sy | 0, 1, 1); } }
  x.fillStyle = '#041a08'; x.fillRect(0, hy, W, Hh - hy);
  x.fillStyle = '#39ff14';
  for (let i = -12; i <= 12; i++) { const x0 = W / 2 + i * 6, x1 = W / 2 + i * W * .16; for (let s = 0; s < 1; s += .02) { const px = lerp(x0, x1, s), py = lerp(hy, Hh, s); if (s > .02) x.fillRect(px | 0, py | 0, 1, 1); } }
  const sc = (t * .6) % 1;
  for (let j = 0; j < 7; j++) { const u = ((j + sc) / 7) ** 2, py = lerp(hy, Hh, u); x.globalAlpha = .3 + .7 * u; x.fillRect(0, py | 0, W, 1); }
  x.globalAlpha = 1;
  x.font = '8px "Press Start 2P", monospace'; x.textBaseline = 'top';
  for (const b of BITS) {
    b.y += b.v / 60; if (b.y > 1.05) { b.y = -.05; b.c = Math.random() < .5 ? '0' : '1'; }
    const side = b.x < .5 ? b.x * .3 : .85 + (b.x - .5) * .3;
    x.fillStyle = b.s > 1 ? '#39ff14' : '#0f5a1c'; x.fillText(b.c, side * W, b.y * Hh);
  }
}
function loop() { bgRaf = requestAnimationFrame(loop); bg(); }
function startBg() { cancelAnimationFrame(bgRaf); bgRaf = requestAnimationFrame(loop); }
function stopBg() { cancelAnimationFrame(bgRaf); bgRaf = 0; }

/* ================= wiring ================= */
const gstart0 = JU.game.start;
JU.game.start = (mode, arg) => { gstart0(mode, arg); if (mode === 'bit') begin(arg); };
const exit0 = JU.exitGame;
JU.exitGame = () => {
  const was = run;
  if (was) { run = null; hideOv(); KS = null; }
  exit0();
  if (!was) return;
  setBit(false);
  fresh = was.cleared || 0;
  if (JU.bitTitle && JU.bitTitle.open) { mount(); startBg(); MUS.start('event'); setTimeout(focusFirst, 60); }
};
const reset0 = H.reset, post0 = H.post, rim0 = H.rim, tick0 = H.tick;
H.reset = () => { reset0(); KS = null; if (!run) setBit(false); };
H.tick = dt => {
  tick0(dt);
  if (KS) { const o = (H.foes && H.foes() || []).concat([E.P2]).find(f => f && f.act && f.act.a === KILLMOVE); if (!o || o.ko) KS = null; }
};
H.rim = f => {
  const r = rim0 ? rim0(f) : null;
  if (r || !bitOn || f === E.P1 || !f.ai || !f.ai.d || !f.ai.d.bitCol) return r;
  return { col: f.ai.d.bitCol, blur: 7 + 2 * Math.sin(E.T * 6) };
};
// the BIT KING's Kill Screen: the half of the screen he points at, breaking up (it warns first)
function drawKS() {
  if (!KS) return;
  const VW = E.VW, VH = E.VH, sx = F(KS.edge, 0)[0], TS = 30, cols = Math.ceil(VW / TS) + 1, rows = Math.ceil(VH / TS) + 1, tick = Math.floor(E.T * 12);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = c * TS, y = r * TS, inside = KS.side > 0 ? x > sx + 20 : x + TS < sx - 20;
    if (!inside) continue;
    const h = Math.sin((c * 12.9898 + r * 78.233 + KS.seed) * 43758.5453), hv = h - Math.floor(h);
    if (KS.warn) { if (hv > .12 || (tick + c) % 2) continue; g.fillStyle = kcol(); g.globalAlpha = .55; g.fillRect(x, y, TS, TS); continue; }
    if (hv > .72) continue;
    g.globalAlpha = .82; g.fillStyle = ['#000', K.RAINBOW[(c + r + tick) % 10], '#1a1a2e', kcol(), INK][Math.floor(hv * 50 + tick * (hv > .4 ? 1 : 0)) % 5];
    g.fillRect(x, y, TS, TS);
  }
  g.globalAlpha = 1;
}
H.post = dt => { post0(dt); if (!bitOn) return; drawKS(); posterize(); };

JU.bitmode = {
  open() { fresh = 0; mount(); startBg(); MUS.start('event'); setTimeout(focusFirst, 80); if (document.fonts) document.fonts.load('10px "Press Start 2P"').catch(() => {}); },
  close() { stopBg(); MUS.stop(); },
  focus: focusFirst, mount, play, BOSSES, ROUTE, THEMES,
  get on() { return bitOn; }, get run() { return run && { n: run.n }; }, get over() { return ovKind; }, get ks() { return !!KS; }, music: MUS
};
})();
