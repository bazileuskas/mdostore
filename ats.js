/* JUJUTSU UNLIMITEDS — Awakened Ten Shadows. Two meters under his health bar: how many shikigami he has left to call (one, and one more for
   everything he has exorcised), and cursed energy (each shikigami needs the meter at a certain level, and calling it uses that much up).
   1 Shiro · 2 Rabbit Escape, and Rabbit Stampede on a second press · 3 Mahoraga · 4 Max Elephant · G Chimera Shadow Garden, where nothing is counted */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, D = JU.domain, C = JU.cast;
const { rnd, lerp, clamp, ZP } = E, TAU = Math.PI * 2, { sprite, shout } = JU.tech.tk, INDIGO = '#8f9bff', GOLD = '#e2c060';
const COST = { strikes: 25, crush: 40, div: 100, manji: 60 };      // how full the cursed energy meter must be for each one, and what calling it takes
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const hint = text => E.fx.push({ k: 2, x: E.P1.x, y: E.P1.y + 335, n: text, col: INDIGO, t: 0, life: 1.6 });

let kills = 0, used = 0, ce = 30;                   // exorcised since he walked in; shikigami called this fight; the cursed energy meter, 0 to 100
let dog = null, rab = null, maho = null, ele = null, rite = null, garden = false, fled = false;
const left = () => Math.max(0, 1 + kills - used);
const can = k => garden || (left() > 0 && ce >= COST[k]);          // inside Chimera Shadow Garden nothing is counted
const pay = k => { if (!garden) { used++; ce -= COST[k]; } };
function refuse(p, k) { shout(p, left() <= 0 ? 'NO SHIKIGAMI LEFT' : 'NEEDS ' + COST[k] + '% CURSED ENERGY', INDIGO); sfx.back(); }

/* ---------- the two meters ---------- */
const hud = document.createElement('div');
hud.className = 'tsm';
hud.innerHTML = '<span class="tsk"><b>1</b>shikigami left</span><span class="tce"><i></i><em></em></span>';
E.root.querySelector('.fb.p1').appendChild(hud);
let shown = '';
function meters() {
  const live = on(), key = live ? (garden ? '∞' : left()) + '|' + Math.floor(ce) : '';
  if (key === shown) return;
  shown = key; hud.classList.toggle('on', live);
  if (!live) return;
  hud.firstChild.firstChild.textContent = garden ? '∞' : left();
  hud.lastChild.style.setProperty('--v', garden ? 1 : ce / 100);
  hud.lastChild.lastChild.textContent = garden ? 'Cursed energy · no limit' : 'Cursed energy · ' + Math.floor(ce) + '%';
}

/* ---------- the shikigami themselves ---------- */
const DOG = [[-58, -52, 84, 34], [18, -70, 40, 34], [-74, -58, 22, 10], [-52, -22, 14, 26], [10, -22, 14, 26], [44, -84, 10, 16]];
const dogFace = () => { g.fillStyle = '#c2182b'; g.fillRect(40, -62, 8, 6); g.fillStyle = LINE; g.fillRect(48, -52, 6, 5); };
const ELE = [[-120, -190, 240, 150], [70, -230, 110, 110], [150, -150, 34, 130], [-104, -44, 54, 44], [44, -44, 54, 44], [-150, -170, 36, 20]];
const eleFace = () => { g.fillStyle = '#e06a9a'; g.fillRect(40, -236, 46, 96); g.fillStyle = LINE; g.fillRect(132, -196, 12, 12); g.fillStyle = '#f4f1e6'; g.fillRect(150, -70, 30, 12); };
function bunny(c, k, a, hop) {                      // one rabbit: small, white, and never alone
  g.fillStyle = `rgba(250,250,252,${a})`; g.strokeStyle = `rgba(7,6,12,${a})`; g.lineWidth = 1.5;
  g.beginPath(); g.ellipse(c[0], c[1] - (14 + hop) * k, 17 * k, 13 * k, 0, 0, TAU); g.fill(); g.stroke();
  g.beginPath(); g.ellipse(c[0] + 9 * k, c[1] - (32 + hop) * k, 4 * k, 12 * k, .25, 0, TAU); g.ellipse(c[0] + 15 * k, c[1] - (30 + hop) * k, 4 * k, 11 * k, .5, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = `rgba(255,150,170,${a})`; g.beginPath(); g.ellipse(c[0] + 9.5 * k, c[1] - (32 + hop) * k, 1.6 * k, 8 * k, .25, 0, TAU); g.fill();
  g.fillStyle = `rgba(200,16,40,${a})`; g.beginPath(); g.arc(c[0] + 10 * k, c[1] - (17 + hop) * k, 2 * k, 0, TAU); g.fill();
}
/* ---------- the shikigami, redrawn (the visual rework): no longer boxes. Each is drawn as the thing it is, from how the series shows it:
   the Divine Dog a lean white wolf with the mark on its brow; Max Elephant round and pink, water pouring from its trunk; Mahoraga under its
   eight-handled wheel; and in the domain the rest of the ten as shapes standing in the shadow: Nue with its wings out, the toad, the great
   serpent, the elephant. `ink` draws one as a shape cut out of the dark, with only its eyes lit ---------- */
function beast(c, k, face, a, fn) { if (a <= 0) return; g.save(); g.translate(c[0], c[1]); g.scale(face * k, k); g.globalAlpha = Math.min(1, a); g.lineJoin = 'round'; g.lineCap = 'round'; fn(); g.restore(); g.globalAlpha = 1; }
const shape = (pts, close = true) => { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); if (close) g.closePath(); g.fill(); g.stroke(); };
function wolf(coat, edge, eye, T, run, ink) {
  const sw = run ? Math.sin(T * 17) : Math.sin(T * 2.2) * .2, leg = (hx, d) => shape([hx - 9, -34, hx + 10, -34, hx + 7 + d * 16, -2, hx + 13 + d * 16, 0, hx - 6 + d * 16, 0]);
  g.fillStyle = coat; g.strokeStyle = edge; g.lineWidth = 3;
  g.beginPath(); g.moveTo(-62, -60); g.quadraticCurveTo(-112, -96 + sw * 8, -100, -44); g.quadraticCurveTo(-84, -52, -62, -44); g.closePath(); g.fill(); g.stroke();      // the tail
  leg(-52, -sw); leg(26, sw);                                                                                       // the far pair of legs
  g.beginPath(); g.moveTo(-68, -60); g.bezierCurveTo(-44, -84, 6, -82, 34, -74); g.lineTo(54, -54); g.bezierCurveTo(40, -26, -40, -22, -66, -34); g.closePath(); g.fill(); g.stroke();   // the body, deep in the chest and narrow at the hip
  for (let i = 0; i < 5; i++) shape([-40 + i * 16, -78, -34 + i * 16, -92 - (i % 2) * 5, -26 + i * 16, -78]);     // the ruff standing up along its back
  leg(-36, sw); leg(40, -sw);
  shape([28, -76, 42, -112, 54, -88, 62, -108, 72, -84, 100, -70, 100, -60, 76, -50, 48, -50]);                    // the head: two ears, a long muzzle
  g.fillStyle = ink ? eye : '#1a0a0e'; shape([74, -52, 98, -58, 80, -40]);                                         // its mouth, open
  if (!ink) { g.fillStyle = '#fff'; g.lineWidth = 1; shape([80, -52, 84, -45, 88, -53]); shape([90, -55, 93, -48, 96, -56]); }
  g.fillStyle = eye; g.strokeStyle = eye; g.lineWidth = 1; shape([62, -78, 72, -74, 62, -70]);                     // the eye
  if (!ink) shape([50, -96, 56, -84, 46, -86]);                                                                    // and the mark on its brow
}
function elephant(T, ink) {
  const body = ink ? '#05040c' : '#f7a8c8', dark = ink ? '#05040c' : '#e07aa6', edge = ink ? 'rgba(143,155,255,.6)' : LINE;
  g.fillStyle = dark; g.strokeStyle = edge; g.lineWidth = 4;
  for (const x of [-96, 56]) { g.beginPath(); g.roundRect(x, -70, 58, 70, 12); g.fill(); g.stroke(); }             // far legs
  g.fillStyle = body; g.beginPath(); g.ellipse(-10, -150, 150, 100, 0, 0, TAU); g.fill(); g.stroke();              // the body
  for (const x of [-130, 20]) { g.beginPath(); g.roundRect(x, -76, 62, 76, 14); g.fill(); g.stroke(); }
  g.beginPath(); g.ellipse(118, -196, 78, 72, 0, 0, TAU); g.fill(); g.stroke();                                    // the head
  g.fillStyle = dark; g.beginPath(); g.ellipse(70, -200, 50, 74, -.2, 0, TAU); g.fill(); g.stroke();               // an ear like a sail
  g.strokeStyle = edge; g.lineWidth = 34; g.beginPath(); g.moveTo(170, -190); g.quadraticCurveTo(232, -170, 214, -96 + Math.sin(T * 5) * 6); g.stroke();      // the trunk
  g.strokeStyle = body; g.lineWidth = 27; g.beginPath(); g.moveTo(170, -190); g.quadraticCurveTo(232, -170, 214, -96 + Math.sin(T * 5) * 6); g.stroke();
  g.lineWidth = 3; g.strokeStyle = edge; g.fillStyle = '#f4f1e6'; shape([156, -160, 196, -132, 162, -146]);        // a tusk
  g.fillStyle = ink ? INDIGO : LINE; g.beginPath(); g.arc(138, -206, ink ? 5 : 7, 0, TAU); g.fill();
  if (!ink) { g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-30, -206, 70, 22, -.1, 0, TAU); g.fill(); }
}
function toad() {                                    // squat, wide-mouthed, waiting
  g.fillStyle = '#05040c'; g.strokeStyle = 'rgba(143,155,255,.6)'; g.lineWidth = 3;
  g.beginPath(); g.ellipse(0, -44, 78, 46, 0, 0, TAU); g.fill(); g.stroke(); shape([-70, -20, -104, 0, -40, 0]); shape([50, -20, 96, 0, 30, 0]);
  g.beginPath(); g.ellipse(46, -78, 44, 30, 0, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.moveTo(14, -70); g.lineTo(88, -70); g.stroke();
  g.fillStyle = INDIGO; g.beginPath(); g.arc(40, -98, 7, 0, TAU); g.arc(66, -96, 7, 0, TAU); g.fill();
}
function nue(T) {                                    // the owl-masked one, wings out, hanging in the air
  const f = Math.sin(T * 5) * 16;
  g.fillStyle = '#05040c'; g.strokeStyle = 'rgba(143,155,255,.6)'; g.lineWidth = 3;
  shape([0, -60, -70, -110 - f, -150, -70 - f * 2, -120, -50, -84, -56, -60, -30, -20, -34]); shape([0, -60, 70, -110 - f, 150, -70 - f * 2, 120, -50, 84, -56, 60, -30, 20, -34]);
  g.beginPath(); g.ellipse(0, -44, 30, 40, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#e8e4d8'; g.beginPath(); g.ellipse(0, -66, 20, 16, 0, 0, TAU); g.fill();
  g.fillStyle = '#05040c'; g.beginPath(); g.arc(-8, -66, 5, 0, TAU); g.arc(8, -66, 5, 0, TAU); g.fill();
}
function serpent(T) {                                // the great serpent, most of it still under the floor
  g.strokeStyle = 'rgba(143,155,255,.6)'; g.lineWidth = 50; g.beginPath(); g.moveTo(-90, 0); g.bezierCurveTo(-110, -230, 30, -260 + Math.sin(T * 2) * 14, 60, -130); g.stroke();
  g.strokeStyle = '#05040c'; g.lineWidth = 44; g.beginPath(); g.moveTo(-90, 0); g.bezierCurveTo(-110, -230, 30, -260 + Math.sin(T * 2) * 14, 60, -130); g.stroke();
  g.fillStyle = '#05040c'; g.strokeStyle = 'rgba(143,155,255,.6)'; g.lineWidth = 3; shape([40, -150, 110, -128, 104, -104, 60, -100]);
  g.fillStyle = INDIGO; g.beginPath(); g.arc(78, -130, 5, 0, TAU); g.fill();
}
// the wheel that turns over Mahoraga's head: eight handles, and it has turned once for everything that has ever hit it
function wheel(c, k, a, spin) {
  g.save(); g.translate(c[0], c[1]); g.rotate(spin); g.globalAlpha = Math.min(1, a); g.lineCap = 'round';
  g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.gold || E.GLOW.fire, 0, 0, 380 * k, .5 * a); g.globalCompositeOperation = 'source-over';
  g.strokeStyle = '#3a2c10'; g.lineWidth = 13 * k; g.beginPath(); g.arc(0, 0, 62 * k, 0, TAU); g.stroke();
  g.strokeStyle = GOLD; g.lineWidth = 7 * k; g.beginPath(); g.arc(0, 0, 62 * k, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, 16 * k, 0, TAU); g.stroke();
  for (let i = 0; i < 8; i++) { const an = i * TAU / 8, cs = Math.cos(an), sn = Math.sin(an); g.lineWidth = 5 * k; g.beginPath(); g.moveTo(cs * 16 * k, sn * 16 * k); g.lineTo(cs * 62 * k, sn * 62 * k); g.stroke(); g.lineWidth = 9 * k; g.beginPath(); g.moveTo(cs * 70 * k, sn * 70 * k); g.lineTo(cs * 92 * k, sn * 92 * k); g.stroke(); }
  g.restore(); g.globalAlpha = 1;
}
// the pool a shikigami comes up out of: shadow, lying on the floor like spilt ink, with the edge of it still moving
function pool(x, r, a, col = '143,155,255') {
  const c = F(x, 0), k = c[2], T = E.T;
  g.fillStyle = `rgba(4,3,10,${.9 * a})`; g.beginPath();
  for (let i = 0; i <= 40; i++) { const an = i / 40 * TAU, rr = r * (1 + .07 * Math.sin(an * 5 + T * 3) + .05 * Math.sin(an * 9 - T * 2)); g.lineTo(c[0] + Math.cos(an) * rr * k, c[1] + Math.sin(an) * rr * .23 * k); }
  g.closePath(); g.fill(); g.strokeStyle = `rgba(${col},${.7 * a})`; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = `rgba(4,3,10,${.85 * a})`;
  for (let i = 0; i < 7; i++) { const u = (T * .9 + i * .37) % 1, px = c[0] + ((i * 61 % 100) / 50 - 1) * r * .8 * k; g.beginPath(); g.ellipse(px, c[1] - u * 150 * k, 5 * k * (1 - u), 12 * k * (1 - u), 0, 0, TAU); g.fill(); }   // and drops of it going up, not down
}
const RITUAL = [.12, -.06, 1.5, 1.42, .28, -.28, 0];               // both fists out in front of him, one on top of the other
function flee() {                                   // he is past the last of the rabbits: the fight is somebody else's problem now
  const cfg = Fi.fight.cfg;
  fled = true; Fi.fight.paused = true; sfx.confirm(); E.banner('脱兎', 'ESCAPED', 'sm');
  Fi.later(1400, () => { if (Fi.fight.cfg !== cfg) return; if (cfg && cfg.onFlee) cfg.onFlee(); else JU.exitGame(); });
}

const MOVES = {
  // 1 — the white Divine Dog, at heel. Press 1 again and it goes for whatever he is fighting: five bites, and it is gone
  strikes: { name: 'Shiro', cd: 1.5, dur: .45, glow: 'indigo', run(p, m, t) {
    p.vx = 0; p.rate = 30; p.target = t < .3 ? POSE.manjiWind : POSE.idle;
    if (m.s) return;
    m.s = 1; pay('strikes'); sfx.charge(); shout(p, '玉犬「白」', '#ffffff');
    dog = { x: p.x - p.face * 120, face: p.face, hits: 0, a: 0, at: null, gone: 0 };
    V.ring(dog.x, 60, 170, INDIGO, .3); hint('1  ·  SHIRO ATTACKS');
  } },
  // 2 — rabbits, more of them than there is floor. He can walk out of the arena on their backs. Press 2 again and they all go for the enemy instead
  crush: { name: 'Rabbit Escape', cd: 12, dur: .5, glow: 'indigo', run(p, m, t) {
    p.vx = 0; p.rate = 30; p.target = t < .3 ? POSE.manjiWind : POSE.idle;
    if (m.s) return;
    m.s = 1; pay('crush'); sfx.charge(); shout(p, '脱兎', '#ffffff');
    rab = { t: 8, storm: null, a: 0 }; hint('2  ·  RABBIT STAMPEDE');
  } },
  // 3 — the one nobody has ever tamed, called the way it has to be called
  div: { name: 'Mahoraga', cd: 30, dur: 2.2, glow: 'gold', run(p, m, t) {
    p.vx = 0; p.rate = 20; p.target = t < 1.9 ? RITUAL : POSE.idle;
    if (!m.c) {
      m.c = 1; pay('div'); p.inv = Math.max(p.inv, 2.4); E.slow(.6); sfx.charge(); E.banner('布瑠部由良由良', 'WITH THIS TREASURE, I SUMMON', 'xs');
      rite = { t: 0, x: clamp(p.x + p.face * 280, -860, 860), face: p.face };
    }
    if (rite) rite.t = t;
    if (t < 1.5 || m.s) return;
    m.s = 1; sfx.bf(); sfx.blast(); shake(32); E.banner('魔虚羅', 'MAHORAGA', 'sm');
    const f = E.fighter(JU.cast3.MAHORAGA, rite.x, rite.face);
    f.scale = 1.5; f.z = ZP + 70; f.alpha = 0;
    maho = { f, t: 14, cd: .9, sw: 0, hit: 1 };
    V.ring(rite.x, 120, 420, GOLD, .5); V.crack(rite.x, 360);
  } },
  // 4 — Max Elephant: it does not need to do anything except land
  manji: { name: 'Max Elephant', cd: 9, dur: .9, glow: 'indigo', run(p, m, t) {
    const o = E.P2;
    p.vx = 0; p.rate = 30; p.target = t < .45 ? POSE.crushWind : t < .75 ? POSE.crush : POSE.idle;
    if (m.s) return;
    m.s = 1; pay('manji'); sfx.charge(); shout(p, '満象', '#ff9ec4');
    ele = { x: clamp(o.ko ? p.x + p.face * 300 : o.x, -900, 900), t: 0, hit: false, face: p.face };
    JU.boss.mark(ele.x, 260, .45, '#ff9ec4');
  } }
};

/* ---------- Chimera Shadow Garden: the floor is shadow, everything he owns is standing in it, and whoever is caught there cannot move ---------- */
const SHAPES = Array.from({ length: 9 }, (_, i) => [-1000 + i * 250 + (i * 37 % 60), 260 + (i * 53 % 200), .9 + (i % 3) * .5, i % 2 ? 1 : -1]);
function gardenIn() {
  const HY = E.HY, VW = E.VW, T = E.T;
  g.fillStyle = 'rgba(6,5,16,.82)'; g.fillRect(-300, HY, VW + 600, E.VH - HY + 500);
  const hz = g.createLinearGradient(0, HY - 260, 0, HY); hz.addColorStop(0, 'rgba(14,12,48,0)'); hz.addColorStop(1, 'rgba(60,66,160,.34)'); g.fillStyle = hz; g.fillRect(-300, HY - 260, VW + 600, 262);      // the dark standing up out of the floor
  g.fillStyle = 'rgba(4,3,10,.9)'; for (let i = 0; i < 16; i++) { const x = ((i * 173 % 1000) / 1000) * (VW + 200) - 100, h = 120 + (i * 97 % 260) + 30 * Math.sin(T * 1.3 + i); g.beginPath(); g.moveTo(x - 26, HY); g.quadraticCurveTo(x - 6 + 10 * Math.sin(T + i), HY - h * .6, x, HY - h); g.quadraticCurveTo(x + 8 + 10 * Math.sin(T + i), HY - h * .6, x + 26, HY); g.fill(); }
  g.fillStyle = 'rgba(143,155,255,.5)'; for (let i = 0; i < 40; i++) { const u = (T * .35 + i * .137) % 1, c2 = P(-1100 + (i * 211 % 2200), u * 520, ZP + 60 + (i * 53 % 420)); g.fillRect(c2[0], c2[1], 3 * c2[2], 9 * c2[2] * (1 - u)); }      // drops of it, going up
  g.strokeStyle = 'rgba(143,155,255,.28)'; g.lineWidth = 2;                                       // rings going out across it, as if it were water
  for (let i = 0; i < 6; i++) { const r = ((T * 90 + i * 220) % 1320) + 60, c = P(0, 0, ZP + 120); g.beginPath(); g.ellipse(c[0], c[1], r * c[2], r * .24 * c[2], 0, 0, TAU); g.stroke(); }
  for (const s of SHAPES) {                                                                       // the rest of the ten, waiting
    const c = P(s[0], 0, ZP + s[1]), k = c[2] * s[2], bob = Math.sin(T * 1.4 + s[0]) * 8 * k;
    const kind = SHAPES.indexOf(s) % 5;
    beast([c[0], c[1] + (kind === 2 ? -150 * k + bob * 2 : bob)], k * (kind === 4 ? 1.5 : 1.1), s[3], 1, () => (kind === 0 ? wolf('#05040c', 'rgba(143,155,255,.6)', INDIGO, T + s[0], false, true) : kind === 1 ? toad() : kind === 2 ? nue(T + s[0]) : kind === 3 ? serpent(T + s[0]) : elephant(T, true)));
  }
}
function hold(o) { if (!o.ko && (o.state === 'idle' || o.state === 'act' || o.state === 'up')) Object.assign(o, { state: 'hurt', stun: .4, act: null, tele: 0 }); }
D.kind('garden', { rim: '143,155,255', tint: '14,12,48', inside: gardenIn, tick(dt, o) { if (o) hold(o); },
  fx(o) {                                           // shadow up to its knees
    const c = F(o.x, o.y + 40), k = c[2] * (o.scale || 1);
    g.fillStyle = 'rgba(6,5,16,.85)'; g.beginPath(); g.ellipse(c[0], c[1] + 30 * k, 96 * k, 34 * k, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(143,155,255,.6)'; g.lineWidth = 2; g.stroke();
  },
  end() { garden = false; } });

JU.tech.add('ats', { name: 'Awakened Ten Shadows', jp: '十種影法術', mark: '影', who: 'Megumi Fushiguro, with nothing held back', odds: 0, col: INDIGO, glow: 'indigo', moves: MOVES,
  awakened: true, awkName: 'Domain',
  awaken(p) {
    p.inv = Math.max(p.inv, 1);
    D.open({ who: p, tone: 'purple', kind: 'garden', reveal() {
      garden = true; D.raise('garden', { who: p, dur: 9 });
      E.after(.25, () => { if (!D.clashing) E.banner('嵌合暗翳庭', 'CHIMERA SHADOW GARDEN', 'xs'); });
    } });
  } });
const DEF = JU.tech.TECH.ats, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
const press0 = H.press, tick0 = H.tick, under0 = H.under, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart, ko0 = H.ko, hit0 = H.hit, cast0 = H.cast, bound0 = H.bound;
H.press = (a, inScene) => {
  if (!inScene && on() && COST[a] !== undefined) {
    const p = E.P1, o = E.P2;
    if (a === 'strikes' && dog) {                   // the dog is already out: this sends it in
      if (!dog.at && !dog.gone && !o.ko) { dog.at = { t: 0, x0: dog.x, hit: false }; sfx.whoosh(); }
      return true;
    }
    if (a === 'crush' && rab) {                     // the rabbits are already out: this turns them on the enemy
      if (!rab.storm && !o.ko) { rab.storm = { t: 0, n: 0 }; rab.t = Math.max(rab.t, 2.6); sfx.charge(); shout(p, 'RABBIT STAMPEDE', '#ffffff'); }
      return true;
    }
    if (!p.move && !p.ps && !p.dead && p.ground && E.cd[a] <= 0 && !can(a)) { refuse(p, a); return true; }
  }
  return press0 ? press0(a, inScene) : false;
};
H.bound = () => (rab && !rab.storm && on() ? 1700 : bound0 ? bound0() : 965);      // on the rabbits' backs the arena does not end where it used to
H.cast = () => { const c = cast0 ? cast0() : null; return maho ? (c || []).concat(maho.f) : c; };
H.hit = (o, face, h) => { hit0(o, face, h); if (on() && !h.sk) ce = Math.min(100, ce + h.dmg * 1.5); };   // his own blows feed the meter; a shikigami's do not
H.ko = o => { const res = ko0(o); if (on()) kills++; return res; };
H.tick = dt => {
  tick0(dt);
  meters();
  if (!on()) return;
  const p = E.P1, o = E.P2;
  ce = Math.min(100, ce + dt * 3);
  if (dog) {
    const d = dog, heel = p.x - p.face * 120;
    d.a = Math.min(1, d.a + dt * 4);
    if (d.at) {                                     // out to the enemy, a bite, and back
      const A = d.at, tx = o.x - Math.sign(o.x - d.x || 1) * 70;
      A.t += dt; d.face = o.x >= d.x ? 1 : -1;
      if (A.t < .18) d.x = lerp(A.x0, tx, A.t / .18);
      else if (!A.hit) {
        A.hit = true; d.x = tx;
        if (!o.ko) { E.applyHit(o, d.face, { dmg: 20 / (o.dr || 1), kb: 240, stun: .6, stop: .08, heavy: 1, col: '#ffffff', fixed: 1, sk: 1 }); for (let i = 0; i < 3; i++) V.slash(o.x, o.y + 120 + i * 40, d.face > 0 ? -.5 : Math.PI + .5, 180, '#ffffff', 9, i * .04); }
        if (++d.hits >= 5) d.gone = .001;
      } else if (A.t > .34) d.at = null;
    } else { d.x += (heel - d.x) * Math.min(1, dt * 8); d.face = p.face; }
    if (d.gone) { d.gone += dt; if (d.gone > .4) { V.ring(d.x, 60, 150, INDIGO, .3); dog = null; } }
  }
  if (rab) {
    const r = rab;
    r.t -= dt; r.a = Math.min(1, r.a + dt * 3);
    if (r.storm) {                                  // every one of them is worth a single point, and there are a great many of them
      const s = r.storm, due = Math.min(48, Math.floor((s.t += dt) / 2.2 * 48));
      for (; s.n < due && !o.ko; s.n++) E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: 1 / (o.dr || 1), kb: 0, stun: .4, stop: .001, col: '#ffffff', fixed: 1, sk: 1 });
      if (!o.ko) hold(o);
      if (s.t > 2.3 || o.ko) rab = null;
    } else if (!fled && Math.abs(p.x) > 1580) flee();
    if (rab && r.t <= 0) rab = null;
  }
  if (maho) {
    const m = maho, f = m.f, gap = Math.abs(o.x - f.x);
    m.t -= dt; f.alpha = m.t < .5 ? Math.max(0, m.t * 2) : Math.min(1, (f.alpha || 0) + dt * 2.2);
    f.face = o.x >= f.x ? 1 : -1;
    if (m.sw > 0) {                                 // the Sword of Extermination, as often as it can swing it
      m.sw -= dt; f.target = m.sw > .25 ? POSE.crushWind : POSE.crush; f.rate = 30;
      if (!m.hit && m.sw <= .25) {
        m.hit = 1; sfx.blast(); shake(18);
        V.slash(f.x + f.face * 200, 220, f.face > 0 ? -1.3 : Math.PI + 1.3, 520, '#fff3b0', 18); V.crack(f.x + f.face * 220, 260);
        if (!o.ko && gap < 360) E.applyHit(o, f.face, { dmg: 28, kb: 700, lift: 560, stun: .9, stop: .12, heavy: 1, col: GOLD, sk: 1 });
      }
      E.blend(f, dt);
    } else {
      const far = gap > 250 && !o.ko;
      if (far) f.x += f.face * 300 * dt;
      else if ((m.cd -= dt) <= 0 && !o.ko && f.alpha >= 1) { m.cd = 1.6; m.sw = .6; m.hit = 0; }
      C.stroll(f, far, dt, 1.2);
    }
    if (m.t <= 0) maho = null;
  }
  if (rite && (rite.t > 2.1 || !(p.move && p.move.def === MOVES.div))) rite = null;
  if (ele) {
    const e = ele;
    e.t += dt;
    if (!e.hit && e.t >= .45) {
      e.hit = true; sfx.blast(); shake(30); V.crack(e.x, 380); V.rocks(e.x, 0, 14);
      for (let i = 0; i < 4; i++) V.ring(e.x, 40, 220 + i * 110, '#7ad7ff', .3 + i * .06);
      if (!o.ko && Math.abs(o.x - e.x) < 270) E.applyHit(o, o.x >= e.x ? 1 : -1, { dmg: 30, kb: 900, lift: 520, stun: .9, stop: .16, heavy: 1, ring: 1, col: '#7ad7ff', sk: 1 });
    }
    if (e.t > 1.5) ele = null;
  }
};
H.under = dt => {
  under0(dt);
  if (!on()) return;
  if (rite) {                                       // the pool of shadow it comes up out of, and the two dogs howling over it
    const u = Math.min(1, rite.t / 1.2), c = F(rite.x, 0), k = c[2];
    pool(rite.x, 430 * u, u, '226,192,96'); pool(rite.x - 330, 130 * u, u); pool(rite.x + 330, 130 * u, u);
    wheel(F(rite.x, 330 + 90 * u), k * (1 + .4 * u), u, E.T * 3);
    beast(F(rite.x - 330, 0), k * 1.2, 1, u, () => wolf('#f2f4f8', LINE, '#c2182b', E.T, false)); beast(F(rite.x + 330, 0), k * 1.2, -1, u, () => wolf('#1b1a24', '#6a6f9a', '#f2f4f8', E.T, false));
  }
  if (dog && !dog.gone) pool(dog.x, 110 * Math.min(1, dog.a), Math.min(1, dog.a) * .8);
  if (maho && maho.f) pool(maho.f.x, 260, .8, '226,192,96');
  if (rab) {                                        // rabbits, wall to wall and well past it
    const r = rab, T = E.T, o = E.P2;
    if (r.storm) {                                  // ...or all of them in one place, which stops looking like rabbits at all
      const u = Math.min(1, r.storm.t / .35), c = F(o.x, o.y + 150 * (o.scale || 1)), k = c[2];
      for (let i = 0; i < 60; i++) { const a = i * 2.39996 + T * 3, d = (40 + (i * 37 % 150)) * u; bunny([c[0] + Math.cos(a) * d * k, c[1] + Math.sin(a) * d * .9 * k + 14 * k], k * 1.2, 1, 0); }
    } else for (let i = 0; i < 72; i++) { const c = P(-1740 + i * 49 + (i * 31 % 23), 0, ZP - 40 + (i * 53 % 130)); bunny(c, c[2], r.a * Math.min(1, r.t), Math.abs(Math.sin(T * 9 + i * 1.7)) * 20); }
  }
};
H.fx = dt => {
  fx0(dt);
  if (!on()) return;
  if (dog) { const da = dog.gone ? 1 - dog.gone / .4 : dog.a, c = F(dog.x, 0); beast(c, c[2] * 1.15, dog.face, da, () => wolf('#f2f4f8', LINE, '#c2182b', E.T, !!dog.at)); }
  if (maho && maho.f) { const f = maho.f, c = P(f.x, f.y + 560, f.z || ZP); wheel(c, c[2] * 1.15, f.alpha === undefined ? 1 : f.alpha, E.T * 1.6 + (maho.sw || 0) * .8); }      // the wheel stays over it for as long as it does
  if (rab && rab.storm) {                           // the front half of the blob, over whatever is inside it
    const o = E.P2, u = Math.min(1, rab.storm.t / .35), c = F(o.x, o.y + 150 * (o.scale || 1)), k = c[2], T = E.T;
    for (let i = 0; i < 44; i++) { const a = i * 2.39996 - T * 4, d = (20 + (i * 53 % 130)) * u; bunny([c[0] + Math.cos(a) * d * k, c[1] + Math.sin(a) * d * .9 * k + 14 * k], k * 1.25, 1, 0); }
  }
  if (ele) {                                        // it arrives from straight overhead
    const e = ele, y = e.t < .45 ? lerp(760, 0, (e.t / .45) ** 2) : 0, a = e.t > 1.1 ? Math.max(0, 1 - (e.t - 1.1) / .4) : 1;
    const c = F(e.x, y), k = c[2] * 1.5;
    if (e.t < .5) { g.fillStyle = `rgba(122,215,255,${.5 * a})`; g.beginPath(); g.rect(c[0] + e.face * 190 * k, c[1] - 110 * k, 34 * k * e.face, 900 * k); g.fill(); }      // the water is already coming down ahead of it
    else if (e.t < 1) { const u = (e.t - .5) / .5, g0 = F(e.x, 0); g.strokeStyle = `rgba(190,236,255,${1 - u})`; g.lineWidth = 6; for (let i = 0; i < 12; i++) { const an = Math.PI + i / 11 * Math.PI, r = (120 + 340 * u) * g0[2]; g.beginPath(); g.moveTo(g0[0] + Math.cos(an) * r * .5, g0[1]); g.quadraticCurveTo(g0[0] + Math.cos(an) * r, g0[1] + Math.sin(an) * r * .9, g0[0] + Math.cos(an) * r * 1.25, g0[1] + Math.sin(an) * r * .3 + u * 80 * g0[2]); g.stroke(); } }   // and where it lands, a crown of it thrown up
    beast(c, k, e.face, a, () => elephant(E.T, false));
  }
};
const clear = () => { dog = rab = maho = ele = rite = null; garden = fled = false; used = 0; ce = 30; };
H.reset = () => { reset0(); clear(); kills = 0; shown = ' '; meters(); };
H.fightStart = (cfg, wave) => { if (!wave) clear(); start0(cfg, wave); };

JU.ats = { MOVES, COST, get state() { return { kills, left: left(), ce, dog: dog && { hits: dog.hits }, rab: rab && { t: rab.t, storm: !!rab.storm }, maho: !!maho, ele: !!ele, garden, fled }; },
  set ce(v) { ce = v; } };
})();
