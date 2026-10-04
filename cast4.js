/* JUJUTSU UNLIMITEDS — the cast of season three: Yuta Okkotsu and Rika, Naoya as an opponent, Yuki Tsukumo, Master Tengen, a grade 1 curse,
   and two places: Tokyo after Shibuya, and the Tombs of the Star Corridor */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, box = E.box, quad = E.quad, F = E.F, cam = E.cam, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, B = JU.boss, X = JU.cast2;
const { lerp, clamp, ZP } = E, TAU = Math.PI * 2, { sprite } = JU.tech.tk;
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.min(255, (n >> 16) * f) | 0},${Math.min(255, (n >> 8 & 255) * f) | 0},${Math.min(255, (n & 255) * f) | 0})`; };
function skin(o) {
  const a = o.a || o.t, a2 = o.a2 || o.t2;
  return { torso: [o.t, o.t2], armF: [a, a2, o.h, o.h2, .22], armB: [shade(a, .62), shade(a2, .62), shade(o.h, .78), shade(o.h2, .78), .22],
    legF: [o.l, o.l2, o.s, o.s2, .16], legB: [shade(o.l, .62), shade(o.l2, .62), shade(o.s, .62), shade(o.s2, .62), .16], chest: o.chest || (() => {}), back: o.back, head: o.head };
}
function poly(fill, pts) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
}
const seg = (...p) => { g.beginPath(); for (let i = 0; i < p.length; i += 4) { g.moveTo(p[i], p[i + 1]); g.lineTo(p[i + 2], p[i + 3]); } g.stroke(); };
const eye = (x, y, rx, ry) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); };
const PALE = ['#e3c8ac', '#f3dcc3'], DARK = '#14131a', LILAC = '#d9c9ff', GOLD = '#ffd23d', STEEL = '#e8f0ff';
let seed = 77;
const r = () => (seed = seed * 16807 % 2147483647) / 2147483647;

/* ---------- skins ---------- */
const YUTA = skin({ t: '#e2e3e9', t2: '#fafafc', h: PALE[0], h2: PALE[1], l: '#16171f', l2: '#22232e', s: '#0c0c10', s2: '#15151b',
  chest() {                                         // the white uniform, and the strap of the sword bag across it
    g.fillStyle = 'rgba(0,0,0,.13)'; g.fillRect(17, -TOR, 2.5, TOR);
    g.fillStyle = '#2a2c36'; g.beginPath(); g.moveTo(-30, -TOR + 2); g.lineTo(-20, -TOR); g.lineTo(30, -16); g.lineTo(30, -5); g.closePath(); g.fill();
    g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(-30, -9, 60, 3);
  },
  back() {                                          // the katana he carries on his back
    g.save(); g.translate(-13, -TOR + 8); g.rotate(-.55);
    g.fillStyle = '#20222c'; g.fillRect(-4.5, -84, 9, 116); g.fillStyle = '#b9a56a'; g.fillRect(-7, 32, 14, 5); g.fillStyle = '#3a2f4a'; g.fillRect(-4, 37, 8, 26);
    g.lineWidth = 2.5; g.strokeStyle = LINE; g.strokeRect(-4.5, -84, 9, 116); g.restore();
  },
  head() {                                          // dark hair falling either side of a parting, and eyes that have not slept
    E.headBase(PALE[0], PALE[1]);
    poly(DARK, [-27, 6, -30, -20, -20, -32, -4, -36, 12, -34, 25, -26, 28, -8, 22, -4, 19, -15, 13, -5, 9, -19, 3, -6, -3, -17, -9, -6, -15, -15, -17, 6]);
    g.fillStyle = 'rgba(60,50,90,.45)'; g.fillRect(1, 5, 9, 2.5); g.fillRect(13, 5, 8, 2.5);
    g.fillStyle = LINE; eye(5, 1, 3, 2.3); eye(17, 1, 2.6, 2.3);
    g.strokeStyle = LINE; g.lineWidth = 2; seg(9, 15, 16, 15);
  } });
const TAN = ['#e2bd9c', '#f2d3b6'], BLONDE = '#e8c95a';
const YUKI = skin({ t: '#1b1b22', t2: '#292933', a: TAN[0], a2: TAN[1], h: TAN[0], h2: TAN[1], l: '#8a7a5c', l2: '#a39170', s: '#2a2218', s2: '#3a3024',
  chest() { g.fillStyle = '#5a4c34'; g.fillRect(-30, -12, 60, 6); },
  back() { poly(BLONDE, [-24, -TOR - 34, -40, -TOR - 6, -38, -TOR + 46, -25, -TOR + 66, -19, -TOR + 30, -15, -TOR - 6]); },   // hair down to the waist
  head() {
    E.headBase(TAN[0], TAN[1]);
    poly(BLONDE, [-28, 16, -31, -20, -20, -33, 2, -36, 22, -29, 28, -14, 20, -18, 14, -6, 8, -19, 0, -10, -8, -18, -14, 16]);
    g.fillStyle = LINE; eye(5, 1, 3.2, 2.5); eye(17, 1, 2.8, 2.5);
    g.strokeStyle = LINE; g.lineCap = 'round'; g.lineWidth = 2.2; seg(0, -5, 9, -6.5, 13, -6.5, 21, -5);
    g.lineWidth = 2; g.beginPath(); g.arc(12, 10, 6.5, .25, 2.4); g.stroke(); g.lineCap = 'butt';   // an easy grin
  } });
const TENGEN = skin({ t: '#d6cfbc', t2: '#ece7d8', h: '#b3ad9e', h2: '#cbc6b8', l: '#d6cfbc', l2: '#ece7d8', s: '#8a8474', s2: '#a39d8c',
  chest() {                                         // an old robe crossed at the front, a cord at the waist
    g.fillStyle = '#8f8672'; g.beginPath(); g.moveTo(2, -TOR); g.lineTo(12, -TOR); g.lineTo(30, -TOR + 34); g.lineTo(30, -TOR + 46); g.closePath(); g.fill();
    g.fillStyle = '#6f2a2a'; g.fillRect(-30, -20, 60, 6);
  },
  head() {                                          // no longer a human head: a tall smooth column, and four eyes
    const gr = g.createLinearGradient(-22, 0, 24, 0);
    gr.addColorStop(.3, '#b3ad9e'); gr.addColorStop(.8, '#d2cdbf');
    g.beginPath(); g.roundRect(-22, -66, 46, 90, [22, 22, 12, 12]); g.fillStyle = gr; g.fill(); g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1.5; seg(-18, -36, 20, -36, -17, -48, 19, -48);
    g.fillStyle = LINE; eye(5, -10, 3.2, 1.9); eye(17, -10, 2.8, 1.9); eye(5, 3, 3.2, 1.9); eye(17, 3, 2.8, 1.9);
    g.strokeStyle = LINE; g.lineWidth = 1.8; seg(8, 15, 17, 15);
  } });
const RUIN = skin({ t: '#2a1a22', t2: '#3d2631', h: '#120b10', h2: '#1d1218', l: '#241720', l2: '#35222d', s: '#120b10', s2: '#1d1218',
  chest() {
    g.strokeStyle = 'rgba(255,60,70,.55)'; g.lineWidth = 2.5; seg(-30, -62, 4, -40, 4, -40, -10, -10, 4, -40, 30, -22);
    g.fillStyle = '#f4f1d0'; g.beginPath(); g.ellipse(13, -57, 8, 5, 0, 0, TAU); g.fill(); g.fillStyle = '#c2182b'; g.beginPath(); g.arc(14, -57, 3, 0, TAU); g.fill();
  },
  head() {                                          // a skull that kept on growing
    poly('#d8cdb4', [-18, -18, -30, -44, -8, -26]); poly('#d8cdb4', [10, -24, 26, -48, 22, -18]);
    E.headBase('#cfc6b0', '#e8e0cc');
    g.fillStyle = '#12090c'; eye(4, -3, 5, 7); eye(17, -3, 4, 7);
    g.fillStyle = '#ff2440'; eye(5, -2, 1.8, 1.8); eye(17, -2, 1.6, 1.6);
    g.fillStyle = '#12090c'; g.fillRect(-2, 9, 25, 9);
    g.fillStyle = '#e8e0cc'; for (let i = 0; i < 6; i++) { g.fillRect(-1 + i * 4.1, 9, 3, 4); g.fillRect(1 + i * 4.1, 14, 3, 4); }
  } });

/* ---------- Rika: no eyes, a mouth, and hands that can close round a man ---------- */
const BONE = '#cfcbd8';
function rika(x, face, s, a) {                      // the whole of her, hunched over whoever she has hold of
  sprite(x, 0, face, s, a, BONE, [[-60, -104, 120, 104], [-96, -252, 192, 160], [-112, -288, 204, 52], [-34, -334, 124, 98], [70, -206, 110, 44]], () => {
    g.fillStyle = '#17131d'; g.fillRect(-84, -330, 52, 190); g.fillRect(-40, -344, 60, 30);          // hair hanging down her back
    g.fillStyle = '#16070c'; g.fillRect(14, -290, 72, 38);                                           // the mouth
    g.fillStyle = '#f4f1e6'; for (let i = 0; i < 6; i++) { g.fillRect(17 + i * 11.5, -290, 7, 11); g.fillRect(20 + i * 11.5, -263, 7, 11); }
    g.fillStyle = 'rgba(40,30,60,.16)'; g.fillRect(-96, -150, 192, 58); g.fillRect(-60, -104, 120, 104);                       // her own shadow lower down
    g.strokeStyle = 'rgba(190,80,110,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-80, -220); g.lineTo(30, -170); g.moveTo(-70, -196); g.lineTo(10, -160); g.stroke();
  });
}
function grip(x, face, a) {                         // her hands, drawn over him
  sprite(x, 0, face, 1, a, BONE, [[-54, -196, 108, 36], [-54, -132, 108, 36]], () => {
    g.fillStyle = '#16070c'; for (const y of [-196, -132]) for (let i = 0; i < 4; i++) g.fillRect(-48 + i * 26, y + 24, 16, 18);
  });
}
function fist(x, t) {                               // one arm of hers, coming down out of the dark overhead
  const y = lerp(820, 0, Math.min(1, t / .5) ** 2), c = F(x, y), k = c[2];
  g.globalAlpha = t > .75 ? Math.max(0, 1 - (t - .75) / .25) : 1;
  g.fillStyle = BONE; g.strokeStyle = LINE; g.lineWidth = 3; g.lineJoin = 'round';
  g.beginPath(); g.rect(c[0] - 62 * k, c[1] - 1100 * k, 124 * k, 960 * k); g.fill(); g.stroke();
  g.beginPath(); g.rect(c[0] - 106 * k, c[1] - 150 * k, 212 * k, 150 * k); g.fill(); g.stroke();
  g.fillStyle = '#16070c'; for (let i = 0; i < 4; i++) g.fillRect(c[0] + (-94 + i * 50) * k, c[1] - 28 * k, 36 * k, 28 * k);
  g.globalAlpha = 1;
}

/* ---------- how they fight ---------- */
const A = (pre, pose, wind, lunge, reach, dmg, kb, more) => Object.assign({ pre, pose, wind, lunge, reach, dmg, kb, stun: .45 }, more);
Object.assign(Fi.DEFS, {
  ruin: { name: 'Grade 1 Curse', jp: '一級呪霊', skin: RUIN, hp: 170, scale: 1.3, speed: 200, range: 195, gap: [.45, 1], dr: .85,
    atk: [A('hookWind', 'hook', .45, 380, 220, 10, 440), A('crushWind', 'crush', .65, 360, 240, 14, 620, { lift: 560 }), A('divWind', 'div', .6, 0, 0, 11, 460, { far: 1, shot: 1, lift: 380 })] },
  naoya: { name: 'Naoya Zenin', jp: '禪院直哉', skin: X.NAOYA, hp: 250, scale: 1.02, speed: 360, range: 220, gap: [.25, .7], dr: .8, human: true,
    atk: [A('hookWind', 'hook', .3, 480, 250, 9, 440), A('dash', 'cross', .3, 1000, 300, 11, 600, { lift: 360 }), A('kickWind', 'kick', .45, 440, 230, 12, 620, { lift: 520 })] },
  yuta: { name: 'Yuta Okkotsu', jp: '乙骨憂太', skin: YUTA, hp: 420, scale: 1.02, speed: 340, range: 250, gap: [.25, .7], dr: .6, human: true, blade: true,
    atk: [A('hookWind', 'hook', .3, 480, 280, 11, 480), A('dash', 'cross', .32, 1000, 320, 13, 620, { lift: 380 }), A('crushWind', 'crush', .5, 420, 290, 16, 700, { lift: 620 })] }
});

// Naoya: the technique the player can roll, Projection Sorcery, turned round. Freeze Frame is his own: a touch, and you are one frame of film
const PROJ = JU.tech.TECH.projection.moves;
B.kit('naoya', { tech: 'Projection Sorcery', col: GOLD, glow: 'gold', scale: .8, every: [1.9, 3.2], moves: [
  { of: PROJ.strikes, cd: 4, min: 180, max: 700, wind: .35, pre: 'dash' },
  { name: 'Freeze Frame', cd: 9, max: 340, wind: .4, pre: 'jab', dur: .5, run(o, p, A, t) {
    o.rate = 44; o.vx = t < .12 ? o.face * 700 : 0; o.target = t < .3 ? POSE.jab : POSE.idle;
    if (A.done || t < .05 || t > .22 || !B.swing(o, 230, { dmg: 5, kb: 0, stun: 1.1 }, 190)) return;
    A.done = 1; sfx.charge(); B.say(p, '1/24', GOLD);
    V.custom(1.1, u => {
      const c = F(p.x, p.y), k = c[2];
      g.fillStyle = 'rgba(255,236,170,.16)'; g.strokeStyle = `rgba(255,236,170,${.9 * Math.min(1, (1 - u) * 5)})`; g.lineWidth = 4;
      g.beginPath(); g.rect(c[0] - 70 * k, c[1] - 280 * k, 140 * k, 290 * k); g.fill(); g.stroke();
    });
  } },
  { of: PROJ.div, cd: 10, max: 880, wind: .5, pre: 'hookWind', scale: .7 },
  { of: PROJ.manji, cd: 14, below: .75, min: 280, wind: .3, pre: 'dash', scale: .55 }
] });

// Yuta: a sword, more cursed energy than anyone alive, and Rika
function blade(o, len, ang) { const s = o.scale || 1; V.slash(o.x + o.face * 150 * s, o.y + 175 * s, o.face > 0 ? ang : Math.PI - ang, len, STEEL, 12); }
B.kit('yuta', { tech: 'Queen of Curses', col: LILAC, glow: 'purple', every: [2.1, 3.5], moves: [
  { name: 'Katana Rush', cd: 5, min: 150, max: 640, wind: .4, pre: 'dash', dur: .85, run(o, p, A, t) {
    const gap = (p.x - o.x) * o.face, n = Math.floor((t - .18) / .2);
    o.rate = 46;
    if (t < .18) { o.target = POSE.dash; o.vx = gap > 180 ? o.face * 1500 : 0; return; }
    o.vx = 0; o.target = n > 2 ? POSE.idle : [POSE.hook, POSE.cross, POSE.crush][n];
    if (n > 2 || n === A.n) return;
    A.n = n; sfx.whoosh(); blade(o, 400, [-.3, .35, -1.2][n]);                         // three cuts, and the last one lifts him off the floor
    B.swing(o, 290, n === 2 ? { dmg: 9, kb: 620, lift: 480 } : { dmg: 6, kb: 160, stun: .4 }, 190);
  } },
  { name: 'Rika', cd: 8, max: 900, wind: .5, pre: 'manjiWind', dur: .7, run(o, p, A, t) {
    o.rate = 30; o.vx = 0; o.target = t < .5 ? POSE.crushWind : POSE.crush;
    if (A.s) return;
    A.s = 1; sfx.charge();
    const x = clamp(p.x, -900, 900);                // where he was standing when she was called: that is the spot to leave
    B.mark(x, 190, .5, LILAC);
    B.add({ life: 1, draw: h => fist(x, h.t), upd(h) {
      if (h.hit || h.t < .5) return;
      h.hit = 1; sfx.blast(); cam.shake = Math.max(cam.shake, 26); V.crack(x, 320); V.rocks(x, 0, 14); V.ring(x, 60, 320, LILAC, .4);
      B.burst(x, 200, { dmg: 16, kb: 520, lift: 640 }, 420);
    } });
  } },
  { name: 'Cursed Energy Slash', cd: 6, min: 380, wind: .45, pre: 'hookWind', dur: .5, run(o, p, A, t) {
    o.rate = 46; o.target = t < .3 ? POSE.hook : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.whoosh(); blade(o, 420, -.2);      // a cut thrown the length of the street: jump it, or dash through
    B.shot({ x: o.x + o.face * 90, y: o.y + 120, vx: o.face * 1500, r: 26, life: 1.3, a: { dmg: 11, kb: 520, stun: .5 }, trail: 'purple', hit: s => V.sparks(s.x, s.y, 'purple', 10), draw(s) {
      const c = F(s.x, s.y), k = c[2], d = Math.sign(s.vx);
      g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.purple, c[0], c[1], 230 * k, .8); g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#fff'; g.beginPath(); g.moveTo(c[0] + d * 10 * k, c[1] - 95 * k); g.quadraticCurveTo(c[0] + d * 70 * k, c[1], c[0] + d * 10 * k, c[1] + 95 * k);
      g.quadraticCurveTo(c[0] + d * 36 * k, c[1], c[0] + d * 10 * k, c[1] - 95 * k); g.fill();
    } });
  } },
  { name: 'Reverse Cursed Technique', cd: 16, below: .62, wind: .6, pre: 'manjiWind', dur: .4, run(o, p, A) {
    o.target = POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.charge(); o.hp = Math.min(o.max, o.hp + o.max * .06);
    B.say(o, 'HEALED', '#bff5d8'); V.ring(o.x, o.y + 160, 220, '#bff5d8', .5); V.sparks(o.x, o.y + 180, 'green', 12);
  } }
] });

/* ---------- Tokyo after Shibuya: a city with its top torn off, still burning ---------- */
const wreck = (() => {                              // the skyline, every tower broken off at a different height
  const c = document.createElement('canvas'); c.width = 3200; c.height = 320;
  const x = c.getContext('2d');
  for (let px = -40; px < 3200;) {
    const w = 70 + r() * 150, h = 60 + r() * 220, n = 3 + (r() * 4 | 0);
    x.fillStyle = '#0b0910';
    x.beginPath(); x.moveTo(px, 320); x.lineTo(px, 320 - h * (.55 + r() * .45));
    for (let i = 1; i <= n; i++) x.lineTo(px + w * i / n, 320 - h * (.4 + r() * .6));
    x.lineTo(px + w, 320); x.closePath(); x.fill();
    x.fillStyle = 'rgba(255,130,60,.6)';
    for (let i = 0; i < 4; i++) if (r() < .35) x.fillRect(px + 8 + r() * (w - 20), 320 - h * .38 + r() * h * .3, 4, 6);
    px += w * (.75 + r() * .6);
  }
  return c;
})();
const HEAPS = Array.from({ length: 12 }, () => [(r() * 2 - 1) * 1000, 250 + r() * 250, 70 + r() * 150, 24 + r() * 70]);
const SMOKE = Array.from({ length: 6 }, (_, i) => [i * 560 + r() * 200, 200 + r() * 160, 90 + r() * 70]);
const JAG = Array.from({ length: 13 }, () => r());
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const ruins = {
  sky() {
    const HY = E.HY, VW = E.VW, T = E.T, gr = g.createLinearGradient(0, 0, 0, HY), sl = VW / 2 - 1600 - cam.x * .1 - cam.yaw * 760;
    gr.addColorStop(0, '#050408'); gr.addColorStop(.5, '#1a1016'); gr.addColorStop(.88, '#4d201b'); gr.addColorStop(1, '#93401f');
    g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
    const mx = VW / 2 - 300 - cam.x * .03 - cam.yaw * 700, my = Math.max(96, HY - 330);            // the moon, red through the smoke
    lit(() => E.glow(E.GLOW.fire, mx, my, 380, .3));
    g.fillStyle = '#e0b8a0'; g.beginPath(); g.arc(mx, my, 30, 0, TAU); g.fill();
    for (const s of SMOKE) {                                                                        // columns of smoke leaning with the wind
      const x = sl + s[0], lean = 120 + 30 * Math.sin(T * .4 + s[0]), top = HY - s[1] - 220, sg = g.createLinearGradient(0, top, 0, HY);
      sg.addColorStop(0, 'rgba(20,16,22,0)'); sg.addColorStop(.5, 'rgba(20,16,22,.5)'); sg.addColorStop(1, 'rgba(40,22,18,.7)');
      g.fillStyle = sg; g.beginPath(); g.moveTo(x - s[2] * .3, HY); g.quadraticCurveTo(x + lean * .3, HY - s[1], x + lean - s[2], top);
      g.lineTo(x + lean + s[2], top); g.quadraticCurveTo(x + lean * .5 + s[2] * .6, HY - s[1], x + s[2] * .3, HY); g.closePath(); g.fill();
    }
    g.drawImage(wreck, sl, HY - 318);
    lit(() => { for (let i = 0; i < 6; i++) E.glow(E.GLOW.fire, sl + 300 + i * 540, HY - 8, 460 + 70 * Math.sin(T * 2.3 + i * 2), .3); });   // what is still burning
  },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, '#4a2c22'); gr.addColorStop(.25, '#201a1c'); gr.addColorStop(1, '#09080b');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    g.beginPath();                                  // the road, split and heaved up
    for (let x = -1100; x <= 1100; x += 220) { const a = P(x + 60, 0, zn), m = P(x - 40, 0, ZP + 120), b = P(x + 30, 0, ZP + 520); g.moveTo(a[0], a[1]); g.lineTo(m[0], m[1]); g.lineTo(b[0], b[1]); }
    for (let z = Math.ceil(zn / 190) * 190; z <= ZP + 520; z += 190) { const a = P(-1100, 0, z), m = P(0, 0, z + 40), b = P(1100, 0, z - 20); g.moveTo(a[0], a[1]); g.lineTo(m[0], m[1]); g.lineTo(b[0], b[1]); }
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 2; g.stroke();
    const l0 = P(-1100, 0, ZP + 260), l1 = P(1100, 0, ZP + 260);                                    // what is left of the centre line
    g.strokeStyle = 'rgba(230,225,210,.26)'; g.lineWidth = 5; g.setLineDash([46, 60]);
    g.beginPath(); g.moveTo(l0[0], l0[1]); g.lineTo(l1[0], l1[1]); g.stroke(); g.setLineDash([]);
  },
  back() {
    const z = ZP + 520, T = E.T;
    for (const [x, w, h, k] of [[-720, 620, 330, 0], [690, 560, 260, 4]]) {                         // two ground floors: everything above them is gone
      const f = box(x, 0, z, w, h, 260, '#1b181f', '#111015', '#2a2630');
      g.beginPath(); g.moveTo(f[3][0], f[3][1]);                                                    // the edge where the upper floors sheared off
      for (let i = 0; i <= 8; i++) { const q = P(x - w / 2 + w * i / 8, h + JAG[i + k] * 150 * (i % 2 ? 1 : .3), z); g.lineTo(q[0], q[1]); }
      g.lineTo(f[2][0], f[2][1]); g.closePath(); g.fillStyle = '#1b181f'; g.fill();
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {                                     // windows punched dark, one or two with a fire behind them
        const wx = x - w / 2 + 50 + i * (w - 180) / 3, a = P(wx, 70 + j * 120, z), b = P(wx + 80, 150 + j * 120, z);
        g.fillStyle = (i * 2 + j + k) % 5 === 0 ? `rgba(255,${130 + 40 * Math.sin(T * 8 + i) | 0},50,.85)` : '#07060a';
        g.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
      }
    }
    quad(P(-170, 0, z - 80), P(240, 0, z - 80), P(330, 250, z + 110), P(-80, 250, z + 110)); g.fillStyle = '#26222b'; g.fill();   // a slab that came down between them and stayed leaning
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 2; g.stroke();
    for (const h of HEAPS) box(h[0], 0, ZP + h[1], h[2], h[3], h[2] * .7, '#221f27', '#151318', '#37323d');
    box(430, 0, ZP + 300, 14, 300, 14, '#2b2f36', '#1a1d22');                                       // a street light, still trying
    if (Math.sin(T * 17) > -.3) { const l = P(430, 300, ZP + 300); lit(() => E.glow(E.GLOW.fire, l[0], l[1], 260 * l[2], .6)); }
    for (const x of [-520, 130, 820]) { const c = P(x, 30, ZP + 380); lit(() => E.glow(E.GLOW.fire, c[0], c[1], (260 + 50 * Math.sin(T * 9 + x)) * c[2], .7)); }   // fires in the rubble
  },
  front() { for (const [x, w, h] of [[-840, 190, 46], [-240, 110, 30], [380, 150, 40], [900, 130, 34]]) box(x, 0, ZP - 190, w, h, 60, '#0b090d', '#060508', '#1d1a22'); }
};

/* ---------- the Tombs of the Star Corridor: the tree every barrier in the country hangs from, and nothing else ---------- */
const MOTES = Array.from({ length: 26 }, () => [(r() * 2 - 1) * 1100, 40 + r() * 460, 200 + r() * 500, r() * TAU]);
const tomb = {
  sky() {
    const HY = E.HY, VW = E.VW, T = E.T, gr = g.createLinearGradient(0, 0, 0, HY), cx = VW / 2 - cam.x * .08 - cam.yaw * 620, tw = 300, ry = HY - 168;
    gr.addColorStop(0, '#23283a'); gr.addColorStop(.5, '#69708a'); gr.addColorStop(.86, '#c5c8d0'); gr.addColorStop(1, '#f1efe8');
    g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
    lit(() => E.glow(E.GLOW.white, cx, HY - 40, VW * 1.1, .5));
    g.beginPath(); g.moveTo(cx - tw * 1.9, HY + 2); g.quadraticCurveTo(cx - tw * .9, HY - 120, cx - tw * .72, HY - 380); g.lineTo(cx - tw * .62, -90);   // the trunk, running up out of sight
    g.lineTo(cx + tw * .66, -90); g.lineTo(cx + tw * .74, HY - 380); g.quadraticCurveTo(cx + tw * .95, HY - 110, cx + tw * 2, HY + 2); g.closePath();
    const tg = g.createLinearGradient(cx - tw, 0, cx + tw, 0);
    tg.addColorStop(0, '#1a1410'); tg.addColorStop(.5, '#43362b'); tg.addColorStop(1, '#1e1712');
    g.fillStyle = tg; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.42)'; g.lineWidth = 4; g.beginPath();                              // bark
    for (let i = -7; i <= 7; i++) { const x = cx + i * tw * .09; g.moveTo(x, -90); g.quadraticCurveTo(x + i * 5, HY - 300, x + i * tw * .17, HY); }
    g.stroke();
    const rope = u => [cx + (2 * u - 1) * tw * 1.08, ry - 6 + 150 * u * (1 - u)];                   // the shimenawa: a rope thicker than a man, tied round it
    g.strokeStyle = '#d8cfb2'; g.lineWidth = 34;
    g.beginPath(); g.moveTo(...rope(0)); g.quadraticCurveTo(cx, ry + 69, ...rope(1)); g.stroke();
    g.strokeStyle = 'rgba(90,76,50,.55)'; g.lineWidth = 3; g.beginPath();
    for (let i = 1; i < 20; i++) { const q = rope(i / 20); g.moveTo(q[0] - 8, q[1] - 15); g.lineTo(q[0] + 8, q[1] + 15); }
    g.stroke();
    g.fillStyle = '#f4f1e6';
    for (let i = -3; i <= 3; i++) {                                                                 // paper streamers hanging from it
      const q = rope(.5 + i * .13), x = q[0] + Math.sin(T * 1.1 + i) * 3, y = q[1] + 16;
      g.beginPath(); g.moveTo(x - 9, y); g.lineTo(x + 9, y); g.lineTo(x + 2, y + 24); g.lineTo(x + 16, y + 24); g.lineTo(x + 7, y + 52); g.lineTo(x - 7, y + 52); g.lineTo(x, y + 28); g.lineTo(x - 14, y + 28); g.closePath(); g.fill();
    }
  },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, '#ecebe4'); gr.addColorStop(.3, '#aeb0b6'); gr.addColorStop(1, '#4a4d58');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    g.strokeStyle = 'rgba(40,44,60,.17)'; g.lineWidth = 2;                                          // rings worn into the stone, centred on the tree
    for (const R of [260, 520, 800, 1100, 1450]) {
      g.beginPath();
      for (let i = 0; i <= 60; i++) { const a = i / 60 * TAU, q = P(Math.cos(a) * R, 0, Math.max(zn, ZP + 700 + Math.sin(a) * R)); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }
      g.stroke();
    }
  },
  back() {
    const HY = E.HY, T = E.T, z = ZP + 560, mg = g.createLinearGradient(0, HY - 80, 0, HY + 110);
    for (const s of [-1, 1]) {                                                                      // roots as tall as houses
      box(s * 640, 0, z, 520, 120, 300, '#2c261f', '#1b1713', '#3c342b');
      box(s * 1000, 0, z - 190, 380, 70, 240, '#2c261f', '#1b1713', '#3c342b');
    }
    mg.addColorStop(0, 'rgba(241,239,232,0)'); mg.addColorStop(.45, 'rgba(241,239,232,.6)'); mg.addColorStop(1, 'rgba(241,239,232,0)');           // mist lying along the horizon
    g.fillStyle = mg; g.fillRect(-80, HY - 80, E.VW + 160, 190);
    for (const x of [-860, -430, 430, 860]) {                                                       // old posts, a paper charm on each
      box(x, 0, ZP + 330, 44, 300, 44, '#4a3f37', '#2f2823', '#5d5047');
      box(x, 300, ZP + 322, 70, 20, 60, '#3a312b', '#241e1a', '#4d423a');
      const t = P(x, 250, ZP + 330), k = t[2];
      g.fillStyle = '#f1ecdc'; g.fillRect(t[0] - 10 * k, t[1], 20 * k, 56 * k);
      g.fillStyle = '#a5102a'; g.fillRect(t[0] - 1.5 * k, t[1] + 10 * k, 3 * k, 36 * k);
    }
    lit(() => { for (const m of MOTES) { const c = P(m[0] + Math.sin(T * .3 + m[3]) * 40, m[1] + Math.sin(T * .5 + m[3]) * 20, ZP + m[2]); E.glow(E.GLOW.white, c[0], c[1], 26 * c[2], .35 + .25 * Math.sin(T * 1.7 + m[3])); } });
  },
  front() {}
};
JU.chapters.STAGES.ruins = () => ruins;
JU.chapters.STAGES.tomb = () => tomb;

Object.assign(JU.story.WHO, { yuta: ['Yuta Okkotsu', '乙骨憂太', LILAC], yuki: ['Yuki Tsukumo', '九十九由基', '#ffd87a'], tengen: ['Master Tengen', '天元', '#d9d2bc'] });

JU.cast4 = { YUTA, YUKI, TENGEN, RUIN, rika, grip, ruins, tomb };
})();
