/* JUJUTSU UNLIMITEDS — the cast of chapters 8 to 12: Toji, Geto (and what wears him), Mahoraga, Mahito's last shape, Choso as an opponent, and Shibuya station */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, box = E.box, F = E.F, cam = E.cam, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, B = JU.boss, X = JU.cast2;
const { rnd, lerp, clamp, ZP } = E, TAU = Math.PI * 2, Z = JU.bossfx;      // (Z: the Boss VFX update's pieces)
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
const eye = (x, rx, ry) => { g.beginPath(); g.ellipse(x, 1, rx, ry, .1, 0, TAU); g.fill(); };
const PALE = ['#e3c8ac', '#f3dcc3'], DARK = '#111016';

/* ---------- skins ---------- */
const TOJI = skin({ t: '#15151b', t2: '#22222b', a: '#d8b596', a2: '#ecccae', h: '#d8b596', h2: '#ecccae', l: '#d9d6cc', l2: '#efede4', s: '#15151b', s2: '#22222b',
  head() {                                          // hair hanging over the brow, and the scar at the corner of his mouth
    E.headBase('#d8b596', '#ecccae');
    poly(DARK, [-27, 2, -29, -22, -18, -32, 6, -34, 24, -26, 28, -8, 20, -6, 15, -14, 9, -5, 3, -14, -4, -6, -10, -13, -16, 2]);
    g.fillStyle = LINE; eye(5, 3.4, 1.5); eye(17, 2.8, 1.5);
    g.strokeStyle = LINE; g.lineWidth = 2.4; seg(0, -3, 9, -1, 13, -1, 21, -3);
    g.lineWidth = 2; seg(8, 15, 18, 13);
    g.strokeStyle = '#8a4a40'; seg(17, 9, 20, 18);
  } });
function getoHead() {                               // long hair tied up, one strand left loose
  poly(DARK, [-30, -30, -22, -46, -10, -44, -8, -30]);
  E.headBase(PALE[0], PALE[1]);
  poly(DARK, [-27, 8, -29, -20, -18, -31, 6, -33, 23, -26, 26, -14, 14, -20, 2, -22, -10, -18, -16, 8]);
  g.strokeStyle = DARK; g.lineWidth = 3; g.lineCap = 'round'; seg(16, -20, 21, 4); g.lineCap = 'butt';
  g.fillStyle = LINE; eye(5, 3.4, 1.4); eye(16, 2.8, 1.4);
  g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.arc(11, 10, 6, .3, 2.3); g.stroke();
  g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(-20, 8, 4, 0, TAU); g.fill();
}
const GETO = skin({ t: '#191922', t2: '#262633', h: PALE[0], h2: PALE[1], l: '#191922', l2: '#262633', s: '#0c0c10', s2: '#15151b',
  chest() { g.fillStyle = '#c2a23a'; g.beginPath(); g.arc(20, -TOR + 14, 3.5, 0, TAU); g.fill(); }, head: getoHead });
const KENJAKU = skin({ t: '#1d1a16', t2: '#2b2721', h: PALE[0], h2: PALE[1], l: '#1d1a16', l2: '#2b2721', s: '#e8e4d8', s2: '#f6f3ea',
  chest() {                                         // a monk's kesa over one shoulder
    g.fillStyle = '#b89a3c'; g.beginPath(); g.moveTo(-30, -TOR); g.lineTo(4, -TOR); g.lineTo(30, -TOR + 46); g.lineTo(30, 5); g.lineTo(-30, 5); g.closePath(); g.fill();
    g.fillStyle = 'rgba(0,0,0,.22)'; for (let i = 0; i < 3; i++) g.fillRect(-30, -50 + i * 18, 60, 3);
  },
  head() { getoHead(); g.strokeStyle = '#3a2a2a'; g.lineWidth = 1.6; seg(-22, -11, 25, -13); for (let i = -18; i <= 22; i += 7) seg(i, -15, i + 1, -9); } });   // the same face, with stitches across the brow
let wheel = 0;                                      // how far Mahoraga's wheel has turned
const MAHORAGA = skin({ t: '#d8d6cf', t2: '#efeee9', h: '#b9b6ad', h2: '#d2cfc6', l: '#d8d6cf', l2: '#efeee9', s: '#8a877f', s2: '#a5a299',
  chest() { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-30, -50, 60, 4); g.fillRect(-30, -30, 60, 4); g.fillRect(-4, -TOR, 6, TOR); },
  back() {
    g.save(); g.translate(3, -TOR - 62); g.strokeStyle = '#c9a53a'; g.lineWidth = 4;
    g.beginPath(); g.arc(0, 0, 24, 0, TAU); g.stroke();
    for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + wheel; g.beginPath(); g.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); g.lineTo(Math.cos(a) * 33, Math.sin(a) * 33); g.stroke(); }
    g.restore();
  },
  head() {                                          // wings where its eyes should be
    E.headBase('#d8d6cf', '#efeee9');
    poly('#f6f5f0', [-4, -6, 2, -30, 12, -8]); poly('#f6f5f0', [10, -6, 22, -30, 26, -6]);
    g.fillStyle = '#12090c'; g.fillRect(0, 9, 22, 4); g.fillStyle = '#f4f1e6'; for (let i = 1; i < 21; i += 5) g.fillRect(i, 8, 3, 6);
  } });
const MAHITO2 = skin({ t: '#3d4258', t2: '#525a78', h: '#232632', h2: '#30344a', l: '#3d4258', l2: '#525a78', s: '#232632', s2: '#30344a',
  chest() { g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 3; seg(-30, -54, 30, -46, -30, -34, 30, -26, -30, -14, 30, -6); },
  back() { poly('#232632', [-30, -TOR + 6, -58, -TOR - 26, -34, -TOR + 30]); poly('#232632', [-30, -22, -66, -16, -32, 0]); },   // blades grown out of his back
  head() { X.MAHITO.head(); poly('#232632', [-6, -30, 2, -52, 10, -32]); } });

/* ---------- how they fight ---------- */
const A = (pre, pose, wind, lunge, reach, dmg, kb, more) => Object.assign({ pre, pose, wind, lunge, reach, dmg, kb, stun: .45 }, more);
Object.assign(Fi.DEFS, {
  toji: { name: 'Toji Fushiguro', jp: '伏黒甚爾', skin: TOJI, hp: 300, scale: 1.05, speed: 340, range: 240, gap: [.25, .7], dr: .7, human: true, blade: true,
    atk: [A('hookWind', 'hook', .3, 480, 270, 10, 480), A('dash', 'cross', .32, 1000, 320, 12, 620, { lift: 380 }), A('crushWind', 'crush', .5, 420, 280, 15, 700, { lift: 600 })] },
  choso: { name: 'Choso', jp: '脹相', skin: JU.choso.CHOSO, hp: 260, scale: 1.02, speed: 230, range: 190, gap: [.4, 1], dr: .8, human: true,
    atk: [A('hookWind', 'hook', .4, 400, 220, 10, 440), A('kickWind', 'kick', .5, 420, 220, 12, 620, { lift: 540 })] },
  mahoraga: { name: 'Mahoraga', jp: '魔虚羅', skin: MAHORAGA, hp: 255, scale: 1.5, speed: 200, range: 230, gap: [.7, 1.4], dr: .8, poise: true,
    atk: [A('hookWind', 'hook', .5, 380, 260, 11, 520), A('crushWind', 'crush', .65, 380, 270, 15, 720, { lift: 620 })] },
  mahito2: Object.assign({}, Fi.DEFS.mahito, { jp: '遍殺即霊体', skin: MAHITO2, hp: 320, dr: .65, scale: 1.12, gap: [.35, .85] })   // the same technique in a body built for killing
});

// Toji: no cursed energy at all. A body beyond what a body should be, and tools that do the rest
const STEEL = '#e8f0ff', ST = '232,240,255';
const filings = (x, y, n = 10) => { for (let i = 0; i < n; i++) { const a = rnd(0, TAU), v = rnd(300, 1100); Z.emit(1, x, y, Math.cos(a) * v, Math.sin(a) * v + 200, rnd(2, 4), rnd(.2, .45), i & 1 ? '255,200,120' : '255,255,255', { g: 2200 }); } };
function blade(o, len) {
  const s = o.scale || 1, x = o.x + o.face * 150 * s, y = o.y + 175 * s, a = o.face > 0 ? -.15 : Math.PI + .15;
  V.slash(x, y, a, len, STEEL, 14); V.slash(x, y, a + .5 * o.face, len * .6, STEEL, 6, .04);
  Z.flare(x + o.face * len * .3, y, ST, len * .7, .16); filings(x + o.face * 60, y, 8); Z.dust(o.x, 4, -o.face);
}
B.kit('toji', { tech: 'Heavenly Restriction', col: '#cfd8e0', every: [2.2, 3.8], moves: [
  { name: 'Inverted Spear of Heaven', cd: 6, min: 150, max: 560, wind: .42, pre: 'dash', dur: .6, run(o, p, A, t) {
    const gap = (p.x - o.x) * o.face;
    o.rate = 46;
    if (A.done || t > .3) { o.target = A.done && t < A.at + .25 ? POSE.jab : POSE.idle; return; }
    o.target = POSE.dash; o.vx = gap > 170 ? o.face * 1400 : 0;
    if (gap > -30 && gap < 250) {                   // it cuts a technique off at the root: Infinity does not stop this one
      A.done = 1; A.at = t; o.vx = 0; sfx.whoosh(); blade(o, 420); E.stop(.05);
      const hx = o.x + o.face * 210, hy = o.y + 175;
      for (let i = 0; i < 14; i++) Z.emit(3, hx, hy, o.face * rnd(100, 700) + rnd(-200, 200), rnd(-100, 600), rnd(5, 11), rnd(.5, .9), '214,236,255', { g: 1300, vr: rnd(-14, 14), w: .2, rot: rnd(0, TAU), a: .85 });      // whatever was holding the technique up, coming apart like glass
      V.ring(hx, hy, 260, '#d6ecff', .3);
      V.custom(.2, u => { const a = F(o.x + o.face * 60, hy), b = F(o.x + o.face * (60 + 520 * Math.min(1, u * 4)), hy); Z.lite(() => { g.strokeStyle = `rgba(255,255,255,${1 - u})`; g.lineWidth = 7 * a[2] * (1 - u); g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.lineCap = 'butt'; }); });
      B.swing(o, 290, { dmg: 13, kb: 560, lift: 420, pierce: 1 }, 190);
    }
  } },
  { name: 'Chain of a Thousand Miles', cd: 6, min: 420, wind: .45, pre: 'hookWind', dur: .5, run(o, p, A, t) {
    o.rate = 46; o.target = t < .3 ? POSE.hook : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.whoosh(); Z.dust(o.x, 5, -o.face);  // the spear on the end of a chain, thrown flat: jump it, or dash through
    const x0 = o.x + o.face * 80, y0 = o.y + 122;
    B.shot({ x: x0, y: y0, vx: o.face * 1800, r: 24, life: 1.2, rgb: ST, a: { dmg: 11, kb: 560, stun: .5, pierce: 1 }, hit: s => { V.sparks(s.x, s.y, 'fire', 8); filings(s.x, s.y, 12); }, draw(s) {
      const a = F(x0, y0), b = F(s.x, s.y), k = b[2], d = Math.sign(s.vx), n = Math.max(2, Math.round(Math.abs(s.x - x0) / 26));
      g.strokeStyle = LINE; g.lineWidth = 4.5 * k;      // the chain: link after link, snaking as it pays out
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < n; i++) { const u = i / n, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) + Math.sin(u * 9 + E.T * 30) * 7 * k * (1 - u); g.beginPath(); g.ellipse(x, y, 9 * k, (i & 1 ? 3 : 6) * k, 0, 0, TAU); g.stroke(); }
        g.strokeStyle = '#aab4c0'; g.lineWidth = 2.2 * k;
      }
      g.beginPath(); g.moveTo(b[0] + d * 86 * k, b[1]); g.lineTo(b[0] + d * 10 * k, b[1] - 15 * k); g.lineTo(b[0] - d * 8 * k, b[1]); g.lineTo(b[0] + d * 10 * k, b[1] + 15 * k); g.closePath();
      g.fillStyle = '#cfd8e0'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
      Z.lite(() => Z.glow('255,255,255', b[0] + d * 70 * k, b[1], 100 * k, .8));
    } });
  } },
  { name: 'Unseen', cd: 9, min: 160, wind: .25, pre: 'dash', dur: .75, run(o, p, A, t) {
    o.rate = 46;
    if (!A.s) {                                     // nothing to sense: he is simply behind you
      A.s = 1; sfx.whoosh();
      const x0 = o.x, x1 = clamp(p.x + o.face * 150, -940, 940);
      for (let i = 0; i < 4; i++) Z.ghost({ skin: o.skin, x: lerp(x0, x1, i / 4), y: o.y, face: o.face, spin: 1, pose: (i ? POSE.dash : o.pose).slice(), scale: o.scale }, .5 - i * .08, .26 + i * .05);
      Z.dust(x0, 8, -o.face); Z.dust(x1, 6, o.face); Z.shock(x0, 260, ST, .3, 6);
      o.x = x1; o.vx = 0; o.face = p.x >= o.x ? 1 : -1;
    }
    if (t < .24) { o.target = POSE.crushWind; return; }
    o.target = t < .5 ? POSE.crush : POSE.idle;
    if (!A.done) {
      A.done = 1; sfx.whoosh(); blade(o, 420); cam.shake = Math.max(cam.shake, 18);
      const x = o.x + o.face * 130;
      V.crack(x, 220); V.rocks(x, 0, 8); Z.shock(x, 320, ST, .4, 10);
      B.swing(o, 250, { dmg: 14, kb: 700, lift: 620 }, 190);
    }
  } }
] });

// Choso fights with the technique the player can roll, Blood Manipulation. Supernova bursts where he aimed it
const BLOOD = JU.tech.TECH.blood.moves, aimed = (o, p) => { const d = (p.x - o.x) * o.face; return d > -30 && d < 780 ? p.x : o.x + o.face * 340; };
B.kit('choso', { tech: 'Blood Manipulation', col: '#e0203c', glow: 'red', scale: .8, moves: [
  { of: BLOOD.strikes, cd: 5, min: 200, max: 780, wind: .45, pre: 'hookWind' },
  { of: BLOOD.div, cd: 8, max: 760, wind: .4, pre: 'divWind', spot: [aimed, 250], then(o, p, c) { B.mark(c.spot, 250, .65, '#e0203c'); } },
  { of: BLOOD.manji, cd: 12, min: 300, wind: .3, pre: 'divWind', scale: .7, dur: 1.2 }
] });

// Mahoraga adapts: every turn of the wheel and it takes less from whatever is hitting it. Finish it before it has turned too far
const GO = '226,192,96', WH = '255,243,176';
B.kit('mahoraga', { tech: 'Adaptation', col: '#e2c060', glow: 'gold', every: [3.4, 5.2], moves: [
  { name: 'Sword of Extermination', cd: 6, max: 420, wind: .6, pre: 'crushWind', dur: .7, run(o, p, A, t) {
    o.rate = 44; o.target = t < .4 ? POSE.crush : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.blast(); cam.shake = Math.max(cam.shake, 28);
    const x = o.x + o.face * 240, an = o.face > 0 ? -1.3 : Math.PI + 1.3;      // the blade on its arm, lit with the opposite of cursed energy: it does not cut curses, it unmakes them
    V.slash(x, 220, an, 660, '#fff3b0', 24); V.slash(x, 220, an + .22 * o.face, 440, '#ffffff', 9, .04); V.crack(x, 330); V.rocks(x, 0, 18);
    Z.pillar(x, 96, 660, WH, .5); Z.boom(x, 40, 130, WH, { n: 16, clean: true, hot: '255,255,255' }); Z.shock(x, 560, WH, .6, 14); Z.dust(x, 10); Z.decal('crater', x, 210, GO, 9, 0);
    B.swing(o, 430, { dmg: 15, kb: 640, lift: 640 }, 240);
  } },
  { name: 'Turn of the Wheel', cd: 13, wind: .7, pre: 'manjiWind', dur: .5, run(o, p, A) {
    o.target = POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.charge(); cam.shake = Math.max(cam.shake, 14); E.stop(.06);
    const from = wheel;
    wheel += TAU / 8; o.dr = Math.max(.5, (o.dr || 1) * .88); o.hp = Math.min(o.max, o.hp + o.max * .03);
    B.say(o, 'ADAPTED', '#e2c060'); V.ring(o.x, o.y + 330, 260, '#e2c060', .5);
    Z.dim(.5, .9); Z.flash(GO, .16, .3); Z.shock(o.x, 520, GO, .7, 12); Z.pillar(o.x, 70, 560, GO, .6);
    for (let i = 0; i < 22; i++) Z.emit(5, o.x + rnd(-160, 160), rnd(0, 300), rnd(-30, 30), rnd(200, 600), rnd(3, 6), rnd(.6, 1.2), i & 1 ? GO : WH);
    V.custom(1, u => {                              // the wheel itself, written on the air behind it: eight handles, one notch round, and it stops dead
      const c = F(o.x, o.y + 300 * (o.scale || 1)), k = c[2], R = 250 * k, a0 = from + TAU / 8 * Math.min(1, (u * 3.2) ** 2), al = 1 - u * u;
      Z.lite(() => {
        Z.glow(GO, c[0], c[1], R * 3.4, .5 * al);
        g.strokeStyle = `rgba(${GO},${al})`; g.lineWidth = 9 * k; g.beginPath(); g.arc(c[0], c[1], R, 0, TAU); g.stroke();
        g.lineWidth = 4 * k; g.beginPath(); g.arc(c[0], c[1], R * .28, 0, TAU); g.stroke();
        for (let i = 0; i < 8; i++) {
          const a = a0 + i * TAU / 8, ca = Math.cos(a), sa = Math.sin(a);
          g.lineWidth = 6 * k; g.beginPath(); g.moveTo(c[0] + ca * R * .28, c[1] + sa * R * .28); g.lineTo(c[0] + ca * R * 1.26, c[1] + sa * R * 1.26); g.stroke();
          g.fillStyle = `rgba(${WH},${al})`; g.beginPath(); g.arc(c[0] + ca * R * 1.3, c[1] + sa * R * 1.3, 11 * k, 0, TAU); g.fill();
        }
      });
    });
  } },
  { name: 'Charge', cd: 7, min: 260, max: 800, wind: .5, pre: 'dash', dur: .6, run(o, p, A, t) {
    o.rate = 46;
    if (!A.s) { A.s = 1; A.dir = o.face; sfx.whoosh(); Z.dust(o.x, 9, -o.face); Z.shock(o.x, 320, GO, .35, 8); }
    if (t < .26) {
      o.target = POSE.dash; o.vx = Math.abs(o.x + A.dir * 60) < 940 ? A.dir * 1700 : 0;
      if (Math.random() < .7) { V.rocks(o.x, 0, 1); Z.dust(o.x - A.dir * 70, 1, -A.dir); }       // the floor does not survive it running
      if (!A.done && Math.abs(p.x - o.x) < 130) {
        A.done = 1; cam.shake = Math.max(cam.shake, 22); E.stop(.06);
        Z.boom(p.x, p.y + 150, 100, GO, { n: 12, clean: true }); V.crack(p.x, 230); Z.shock(p.x, 380, GO, .4, 10);
        B.burst(p.x, 220, { dmg: 11, kb: 700, lift: 520 }, 190, A.dir);
      }
      return;
    }
    o.face = p.x >= o.x ? 1 : -1; o.target = POSE.idle;
  } }
] });
const start0 = E.hooks.fightStart;
E.hooks.fightStart = (cfg, wave) => { wheel = 0; start0(cfg, wave); };

/* ---------- Shibuya station: a platform under the city, the lights still on ---------- */
const station = {
  sky() {
    const HY = E.HY, VW = E.VW, gr = g.createLinearGradient(0, 0, 0, HY);
    gr.addColorStop(0, '#0a0c12'); gr.addColorStop(1, '#1c2230');
    g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
  },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, '#3a4250'); gr.addColorStop(.35, '#20252e'); gr.addColorStop(1, '#0c0e13');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    g.beginPath();                                  // tiles
    for (let x = -1200; x <= 1200; x += 120) { const a = P(x, 0, zn), b = P(x, 0, ZP + 520); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    for (let z = Math.ceil(zn / 120) * 120; z <= ZP + 520; z += 120) { const a = P(-1200, 0, z), b = P(1200, 0, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1.5; g.stroke();
    const y0 = P(-1200, 0, ZP + 320), y1 = P(1200, 0, ZP + 320);                    // the yellow line along the platform edge
    g.strokeStyle = 'rgba(240,200,60,.55)'; g.lineWidth = 6; g.beginPath(); g.moveTo(y0[0], y0[1]); g.lineTo(y1[0], y1[1]); g.stroke();
  },
  back() {
    const z = ZP + 520, T = E.T;
    box(0, 0, z, 2700, 150, 60, '#12161d', '#0b0e13', '#1b212b');                   // the far wall beyond the tracks
    box(0, 150, z, 2700, 330, 60, '#232a36', '#151a22', '#2c3543');
    for (let i = -3; i <= 3; i++) {                                                 // posters and a line map
      const a = P(i * 360 - 110, 400, z - 31), b = P(i * 360 + 110, 250, z - 31);
      g.fillStyle = i % 2 ? '#3d5a8a' : '#8a3d4a'; g.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
      g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(a[0] + 8, a[1] + 8, (b[0] - a[0]) * .5, 6);
    }
    const s0 = P(-240, 470, z - 32), s1 = P(240, 420, z - 32);                      // the station name
    g.fillStyle = '#e8ecf0'; g.fillRect(s0[0], s0[1], s1[0] - s0[0], s1[1] - s0[1]);
    g.fillStyle = '#12161d'; g.font = `${(s1[1] - s0[1]) * .7}px 'Yuji Syuku','Yu Mincho',serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('渋谷', (s0[0] + s1[0]) / 2, (s0[1] + s1[1]) / 2);
    box(0, 480, z - 320, 2700, 70, 60, '#0d1016', '#080a0e');                       // a beam under the ceiling, where the lights hang
    for (let i = -4; i <= 4; i++) {                                                 // strip lights, one of them failing
      const a = P(i * 300 - 90, 478, z - 260), b = P(i * 300 + 90, 478, z - 260), on = i !== 2 || Math.sin(T * 23) > -.2;
      if (on) { g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.white, (a[0] + b[0]) / 2, a[1] + 30, 420 * a[2], .22); g.globalCompositeOperation = 'source-over'; }
      g.strokeStyle = on ? '#f4f8ff' : '#3a4250'; g.lineWidth = 5 * a[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    }
    for (const x of [-900, -300, 300, 900]) box(x, 0, ZP + 240, 70, 480, 70, '#2c3543', '#1b212b');     // pillars
  },
  front() { for (const x of [-620, 620]) box(x, 0, ZP - 200, 90, 60, 60, '#0c0e13', '#07080b', '#1b212b'); }
};
JU.chapters.STAGES.station = () => station;

Object.assign(JU.story.WHO, {
  toji: ['Toji Fushiguro', '伏黒甚爾', '#cfd8e0'], geto: ['Suguru Geto', '夏油傑', '#c9a53a'], kenjaku: ['Suguru Geto?', '偽夏油', '#c9a53a'], choso: ['Choso', '脹相', '#e0203c']
});

JU.cast3 = { TOJI, GETO, KENJAKU, MAHORAGA, MAHITO2, station };
})();
