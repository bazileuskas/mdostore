/* JUJUTSU UNLIMITEDS — the cast of chapters 22 to 30: Reggie Star, Takako Uro, Ryu Ishigori, Hajime Kashimo, Naoya as the curse he came back as,
   Kenjaku, the Angel, Yorozu, Sukuna in Megumi's body and Gojo with the blindfold off; Yuta, Hakari and Yuki as somebody to play;
   and three places: the gym, the docks of Tokyo No. 2 and Shinjuku on the night of the twenty-fourth */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, box = E.box, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, B = JU.boss, C = JU.cast, D = JU.domain;
const { rnd, lerp, clamp, ZP } = E, TAU = Math.PI * 2, { near, orb } = JU.tech.tk;
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
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const PALE = ['#e3c8ac', '#f3dcc3'], TAN = ['#d6b092', '#e9c8ab'], DARK = '#14131a', STEEL = '#e8f0ff', LILAC = '#d9c9ff', BOLT = '#9fe8ff', GOLD = '#e2c060', ROSE = '#ff5a8a';
let seed = 211;
const r = () => (seed = seed * 16807 % 2147483647) / 2147483647;

/* ---------- skins ---------- */
const REGGIE = skin({ t: '#d9d4c2', t2: '#f1eee2', h: PALE[0], h2: PALE[1], l: '#23262b', l2: '#33373e', s: '#0c0c10', s2: '#15151b',
  chest() {                                         // a coat made of receipts, and every one of them is a contract
    g.strokeStyle = 'rgba(0,0,0,.26)'; g.lineWidth = 1.5;
    for (let y = -TOR + 10; y < -4; y += 11) seg(-30, y, 30, y + 3);
    g.fillStyle = 'rgba(0,0,0,.12)'; for (const x of [-16, 3, 21]) g.fillRect(x, -TOR, 2, TOR);
  },
  head() {                                          // hair tied up out of the way, and the smile of a man who has already sold you something
    poly(DARK, [-20, -28, -36, -50, -26, -58, -10, -34]);
    E.headBase(PALE[0], PALE[1]);
    poly(DARK, [-27, 2, -29, -22, -18, -32, 8, -33, 24, -24, 24, -14, 8, -18, -8, -15, -16, 2]);
    g.fillStyle = LINE; eye(5, 1, 3.2, 1.5); eye(17, 1, 2.8, 1.5);
    g.strokeStyle = LINE; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.arc(12, 9, 7, .2, 2.3); g.stroke(); g.lineCap = 'butt';
  } });
const URO = skin({ t: '#2b2540', t2: '#3d3559', h: PALE[0], h2: PALE[1], l: '#2b2540', l2: '#3d3559', s: PALE[0], s2: PALE[1],
  chest() { g.fillStyle = '#c9a53a'; g.fillRect(-30, -15, 60, 4); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(14, -TOR, 3, TOR); },
  back() { poly(DARK, [-22, -TOR - 30, -40, -TOR - 4, -42, -TOR + 50, -28, -TOR + 74, -20, -TOR + 30, -15, -TOR - 6]); },   // hair to the waist
  head() {
    E.headBase(PALE[0], PALE[1]);
    poly(DARK, [-28, 16, -31, -20, -20, -33, 4, -35, 23, -27, 27, -12, 18, -17, 10, -7, 2, -17, -6, -8, -14, 16]);
    g.fillStyle = LINE; eye(5, 1, 3.4, 1.8); eye(17, 1, 3, 1.8);
    g.strokeStyle = LINE; g.lineWidth = 2.4; seg(0, -3, 9, -6, 13, -6, 21, -3); g.lineWidth = 2; seg(9, 15, 16, 14);
  } });
const FUR = '#f1ece2';
const ISHIGORI = skin({ t: TAN[0], t2: TAN[1], a: '#1c1b22', a2: '#2b2933', h: TAN[0], h2: TAN[1], l: '#22252e', l2: '#30343f', s: '#0c0c10', s2: '#15151b',
  chest() {                                         // a black jacket hung open over nothing, fur down the edges of it, and a tag on a chain
    g.fillStyle = '#1c1b22'; g.fillRect(-30, -TOR, 20, TOR); g.fillRect(24, -TOR, 6, TOR);
    g.fillStyle = FUR; g.fillRect(-12, -TOR, 6, 46); g.fillRect(19, -TOR, 6, 40);
    g.strokeStyle = 'rgba(80,40,30,.4)'; g.lineWidth = 2; seg(2, -58, 20, -58, 4, -40, 20, -40, 11, -64, 11, -22);
    g.strokeStyle = '#8f98a3'; g.lineWidth = 1.5; seg(1, -TOR, 9, -50, 20, -TOR, 12, -50); g.fillStyle = '#c9d2dc'; g.fillRect(7, -51, 7, 10);
  },
  head() {                                          // a pompadour that arrives a moment before he does, over a collar of fur
    poly(FUR, [-36, 30, -42, 14, -32, 18, -36, 4, -24, 14, -22, 28, -6, 34, 10, 30, 24, 34, 34, 22, 40, 30, 30, 40, -20, 40]);
    E.headBase(TAN[0], TAN[1]);
    poly('#1a1826', [-27, 0, -28, -22, -12, -40, 18, -48, 44, -40, 50, -26, 38, -16, 22, -15, -8, -14, -16, 0]);
    g.fillStyle = LINE; eye(5, 2, 3.2, 1.8); eye(17, 2, 2.8, 1.8);
    g.strokeStyle = LINE; g.lineWidth = 2.6; seg(0, -3, 9, -4, 13, -4, 21, -3);
    g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.arc(12, 10, 7.5, .2, 2.6); g.stroke(); g.lineCap = 'butt';
  } });
const TEAL = '#8fe0d8';
const KASHIMO = skin({ t: '#1d2430', t2: '#2a3444', h: PALE[0], h2: PALE[1], l: '#e2e3e9', l2: '#fafafc', s: '#1d2430', s2: '#2a3444',
  chest() { g.fillStyle = TEAL; g.fillRect(-30, -15, 60, 5); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(16, -TOR, 3, TOR); },
  back() {                                          // the staff he never puts down
    g.save(); g.translate(-13, -TOR + 8); g.rotate(-.55);
    g.fillStyle = '#5a4028'; g.fillRect(-3, -100, 6, 160); g.lineWidth = 2.5; g.strokeStyle = LINE; g.strokeRect(-3, -100, 6, 160); g.restore();
  },
  head() {                                          // hair the colour of a bolt, wound into two knots
    g.fillStyle = TEAL; g.lineWidth = 2.5; g.strokeStyle = LINE;
    for (const x of [-15, 14]) { g.beginPath(); g.arc(x, -34, 10, 0, TAU); g.fill(); g.stroke(); }
    E.headBase(PALE[0], PALE[1]);
    poly(TEAL, [-27, 0, -29, -22, -18, -31, 8, -32, 24, -24, 26, -10, 18, -16, 10, -8, 2, -16, -8, -9, -16, 0]);
    g.fillStyle = '#1a5a66'; eye(5, 1, 3, 2.6); eye(17, 1, 2.6, 2.6);
    g.strokeStyle = LINE; g.lineWidth = 2.2; seg(0, -4, 9, -6, 13, -6, 21, -4); g.lineWidth = 2; seg(9, 15, 16, 15);
  } });
const HANA = skin({ t: '#ecebe4', t2: '#ffffff', h: PALE[0], h2: PALE[1], l: '#ecebe4', l2: '#ffffff', s: '#c9a53a', s2: '#e2c060',
  chest() { g.fillStyle = '#c9a53a'; g.fillRect(-30, -14, 60, 4); g.fillRect(9, -TOR, 3, TOR); },
  back() { for (const s of [0, 1]) poly('#ffffff', [-22, -TOR + 14, -70 - s * 14, -TOR - 30 + s * 30, -78 - s * 8, -TOR + 10 + s * 34, -30, -TOR + 44]); },   // wings
  head() {
    g.strokeStyle = '#ffe9a0'; g.lineWidth = 4; g.beginPath(); g.ellipse(0, -52, 26, 7, 0, 0, TAU); g.stroke();   // and the ring over her head
    E.headBase(PALE[0], PALE[1]);
    poly('#f0d98a', [-27, 10, -30, -20, -18, -32, 6, -34, 24, -26, 27, -8, 19, -15, 10, -7, 2, -15, -8, -8, -15, 10]);
    g.fillStyle = '#3a6a8a'; eye(5, 2, 2.8, 3.2); eye(17, 2, 2.4, 3.2);
    g.strokeStyle = LINE; g.lineWidth = 2; seg(9, 15.5, 16, 15.5);
  } });
const YOROZU = skin({ t: '#3a1620', t2: '#55202e', h: '#17171b', h2: '#25252b', l: '#3a1620', l2: '#55202e', s: '#17171b', s2: '#25252b',
  chest() { g.strokeStyle = GOLD; g.lineWidth = 2; seg(-30, -56, 30, -48, -30, -34, 30, -26, 0, -TOR, 0, 0); },   // armour grown the way an insect grows it
  back() { poly(DARK, [-22, -TOR - 30, -42, -TOR - 2, -40, -TOR + 56, -27, -TOR + 70, -20, -TOR + 30, -15, -TOR - 6]); },
  head() {
    E.headBase(PALE[0], PALE[1]);
    poly(DARK, [-28, 16, -31, -20, -20, -33, 0, -36, 12, -34, 24, -27, 27, -10, 20, -16, 12, -30, 4, -14, -4, -18, -14, 16]);
    g.fillStyle = '#f4f1e6'; eye(5, 1, 4.4, 4.4); eye(17, 1, 4, 4);
    g.fillStyle = '#8a1030'; eye(6, 1, 2, 2); eye(18, 1, 1.8, 1.8);
    g.strokeStyle = LINE; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.arc(12, 9, 8, .1, 2.8); g.stroke(); g.lineCap = 'butt';   // far too pleased to see him
  } });
// Megumi's face, with somebody else behind it
const MEGUNA = Object.assign({}, C.MEGUMI, { head() {
  C.MEGUMI.head();
  g.strokeStyle = '#0c0a0e'; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath();
  g.moveTo(8, -12); g.lineTo(11, -7); g.lineTo(14, -12); g.moveTo(-8, 10); g.lineTo(-2, 17); g.moveTo(-11, 13); g.lineTo(-5, 20); g.moveTo(22, 11); g.lineTo(24, 18);
  g.stroke(); g.lineCap = 'butt';
  g.fillStyle = '#d0102a'; eye(5, 11, 3, 1.4); eye(17, 11, 2.4, 1.4);
} });
// Gojo, and nothing over his eyes
const GOJO2 = Object.assign({}, C.GOJO, { head() {
  E.headBase('#ecc7a6', '#f8dcc0');
  poly('#f4f6fb', [-27, 2, -30, -22, -20, -30, -14, -42, -6, -32, 0, -44, 8, -32, 16, -40, 20, -28, 27, -22, 26, -8, 18, -13, 10, -5, 2, -13, -6, -6, -14, -12, -17, 2]);
  g.fillStyle = '#ffffff'; eye(5, 1, 4.2, 3.4); eye(17, 1, 3.8, 3.4);
  g.fillStyle = '#38c8ff'; eye(6, 1, 2.6, 2.6); eye(18, 1, 2.3, 2.3);
  g.strokeStyle = LINE; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.arc(11, 9, 6, .3, 2.2); g.stroke(); g.lineCap = 'butt';
  g.beginPath(); g.roundRect(-22, 17, 46, 11, [0, 0, 8, 8]); g.fillStyle = '#14151e'; g.fill(); g.lineWidth = 2.5; g.stroke();
} });

/* ---------- how they fight ---------- */
const A = (pre, pose, wind, lunge, reach, dmg, kb, more) => Object.assign({ pre, pose, wind, lunge, reach, dmg, kb, stun: .45 }, more);
Object.assign(Fi.DEFS, {
  reggie: { name: 'Receipt Man', jp: 'レシート', skin: REGGIE, hp: 240, scale: 1.02, speed: 270, range: 220, gap: [.4, .9], dr: .85, human: true,
    atk: [A('hookWind', 'hook', .4, 420, 230, 9, 440), A('kickWind', 'kick', .48, 440, 230, 11, 600, { lift: 500 })] },
  uro: { name: 'Sky Captain', jp: '空', skin: URO, hp: 230, scale: 1, speed: 330, range: 220, gap: [.3, .8], dr: .85, human: true,
    atk: [A('hookWind', 'hook', .34, 460, 240, 9, 460), A('kickWind', 'kick', .42, 460, 240, 11, 620, { lift: 520 })] },
  ishigori: { name: 'Granite Cannon', jp: '砲', skin: ISHIGORI, hp: 300, scale: 1.2, speed: 230, range: 210, gap: [.4, .95], dr: .75, human: true,
    atk: [A('hookWind', 'hook', .42, 400, 230, 11, 480), A('crushWind', 'crush', .58, 380, 240, 15, 680, { lift: 580 })] },
  kashimo: { name: 'Thunder God', jp: '雷神', skin: KASHIMO, hp: 420, scale: 1.02, speed: 340, range: 250, gap: [.25, .7], dr: .65, human: true,
    atk: [A('hookWind', 'hook', .3, 480, 270, 10, 480), A('dash', 'cross', .32, 1000, 320, 12, 620, { lift: 380 }), A('kickWind', 'kick', .45, 440, 240, 13, 640, { lift: 540 })] },
  naoya2: { name: 'Frame Runner', jp: '投射', skin: JU.awakened.SPIRIT, hp: 340, scale: 1.14, speed: 400, range: 230, gap: [.2, .6], dr: .7,
    atk: [A('hookWind', 'hook', .28, 500, 260, 10, 460), A('dash', 'cross', .28, 1100, 320, 12, 620, { lift: 380 }), A('kickWind', 'kick', .4, 460, 240, 13, 640, { lift: 540 })] },
  kenjaku: { name: 'The Stitched One', jp: '縫い目', skin: JU.cast3.KENJAKU, hp: 460, scale: 1.04, speed: 260, range: 220, gap: [.35, .85], dr: .6, human: true,
    atk: [A('hookWind', 'hook', .38, 440, 240, 11, 480), A('kickWind', 'kick', .46, 440, 240, 13, 640, { lift: 540 })] },
  yorozu: { name: 'The Constructor', jp: '万', skin: YOROZU, hp: 330, scale: 1.04, speed: 300, range: 230, gap: [.3, .8], dr: .75, human: true,
    atk: [A('hookWind', 'hook', .34, 460, 250, 10, 480), A('dash', 'cross', .34, 980, 310, 12, 620, { lift: 380 }), A('crushWind', 'crush', .5, 420, 260, 15, 700, { lift: 600 })] }
});

// the shapes most of their moves come in: in and hit; something coming down where he stood; something thrown down the lane; a shock along the floor
const Z = JU.bossfx, rgbOf = c => (/^#[0-9a-f]{6}$/i.test(c) ? Z.hex(c) : '255,255,255');      // (Z: the Boss VFX update's pieces. These movesets were redrawn with them)
const rush = (name, q) => ({ name, cd: q.cd || 6, min: q.min || 120, max: q.max || 620, below: q.below, wind: q.wind || .42, pre: q.pre || 'dash', dur: .7, run(o, p, M, t) {
  const gap = (p.x - o.x) * o.face;
  o.rate = 46;
  if (M.done || t > .3) { o.vx = 0; o.target = M.done && t < M.at + .25 ? POSE[q.pose || 'cross'] : POSE.idle; return; }
  if (!M.go) { M.go = 1; Z.dust(o.x, 6, -o.face); }
  o.target = POSE.dash; o.vx = gap > 170 ? o.face * (q.speed || 1400) : 0;
  if (gap > -30 && gap < 240) { M.done = 1; M.at = t; o.vx = 0; sfx.blast(); shake(18); E.stop(.05); if (q.fx) q.fx(o, p); B.swing(o, q.reach || 270, q.a, 190); }
} });
const drop = (name, q) => ({ name, cd: q.cd || 7, max: 900, below: q.below, wind: q.wind || .45, pre: q.pre || 'crushWind', dur: .7, run(o, p, M, t) {
  o.rate = 30; o.vx = 0; o.target = t < .5 ? POSE[q.pre || 'crushWind'] : POSE[q.pose || 'crush'];
  if (M.s) return;
  M.s = 1; sfx.charge();
  const x = clamp(p.x, -900, 900), at = q.delay || .55, w = q.w || 180;      // it lands where he was standing when it was called: be somewhere else
  B.mark(x, w, at, q.col);
  B.add({ life: at + .45, draw: h => { if (q.draw) q.draw(x, h.t, at); }, upd(h) {
    if (h.hit || h.t < at) return;
    h.hit = 1; sfx.blast(); shake(24); V.crack(x, 300); V.rocks(x, 0, 12); V.ring(x, 60, w + 120, q.col, .4);
    Z.dust(x, 10); Z.shock(x, (w + 120) * 1.6, rgbOf(q.col), .5, 12);
    if (q.land) q.land(x);
    B.burst(x, w + 10, q.a, q.high || 420);
  } });
} });
const flat = (name, q) => ({ name, cd: q.cd || 5, min: q.min || 360, below: q.below, wind: q.wind || .45, pre: q.pre || 'hookWind', dur: .5, run(o, p, M, t) {
  o.rate = 46; o.target = t < .3 ? POSE[q.pose || 'hook'] : POSE.idle;
  if (M.s) return;
  M.s = 1; sfx.whoosh(); Z.dust(o.x, 4, -o.face);   // thrown flat: jump it, or dash through
  if (q.fire) q.fire(o);
  B.shot({ x: o.x + o.face * 90, y: o.y + (q.y || 125), vx: o.face * (q.speed || 1400), r: q.r || 26, life: 1.4, a: q.a, trail: q.trail, rgb: q.rgb, hit: s => { V.sparks(s.x, s.y, q.trail || 'fire', 10); if (q.hit) q.hit(s); }, draw: q.draw });
} });
const quake = (name, q) => ({ name, cd: q.cd || 6, min: q.min || 260, below: q.below, wind: q.wind || .5, pre: q.pre || 'crushWind', dur: .5, run(o, p, M, t) {
  o.rate = 46; o.vx = 0; o.target = t < .3 ? POSE[q.pose || 'crush'] : POSE.idle;
  if (M.s) return;
  M.s = 1; sfx.blast(); shake(16); V.crack(o.x + o.face * 120, 200); V.rocks(o.x + o.face * 120, 0, 8);
  Z.dust(o.x + o.face * 100, 8, o.face); Z.shock(o.x + o.face * 100, 340, rgbOf(q.col), .4, 10);
  if (q.fx) q.fx(o);
  B.wave(o.x + o.face * 80, o.face, q.speed || 1300, 1150, q.a, q.col);            // it runs along the floor: jump it
} });
// where a falling thing has got to: [screen point, how solid it still is]
function falling(x, t, at) { g.globalAlpha = t > at + .25 ? Math.max(0, 1 - (t - at - .25) / .2) : 1; return F(x, lerp(760, 0, Math.min(1, t / at) ** 2)); }
const cuts = (o, col, n = 3) => { for (let i = 0; i < n; i++) V.slash(o.x + o.face * 150, o.y + 110 + i * 50, (o.face > 0 ? 0 : Math.PI) + rnd(-.5, .5), 380, col, 12, i * .03); };
// the shadow of something on its way down, arriving before it does
function shadowOf(x, t, at, w) { const c = F(x, 0), u = Math.min(1, t / at); if (t > at + .1) return; g.fillStyle = `rgba(0,0,0,${.45 * u})`; g.beginPath(); g.ellipse(c[0], c[1], w * c[2] * u, w * .16 * c[2] * u, 0, 0, TAU); g.fill(); }
const shards = (x, y, n, rgb, spread = 600) => { for (let i = 0; i < n; i++) Z.emit(3, x + rnd(-60, 60), y + rnd(-60, 60), rnd(-spread, spread), rnd(-100, 700), rnd(6, 14), rnd(.5, 1), rgb, { g: 1300, vr: rnd(-14, 14), w: .19, rot: rnd(0, TAU), a: .85 }); };

// Reggie: Contract Re-creation. Whatever a receipt says he bought, he has again
const PAPER = '241,238,226', SLIP = { g: 420, dr: 1.4, w: 1.7, edge: 'rgba(30,24,20,.5)' };
// a receipt held up and burning away: what it lists is on its way
function receipt(x, y) {
  for (let i = 0; i < 10; i++) Z.emit(3, x + rnd(-20, 20), y + rnd(-20, 20), rnd(-260, 260), rnd(40, 420), rnd(6, 10), rnd(.7, 1.3), PAPER, Object.assign({ vr: rnd(-10, 10), rot: rnd(0, TAU) }, SLIP));
  for (let i = 0; i < 8; i++) Z.emit(5, x, y, rnd(-200, 200), rnd(0, 400), rnd(3, 5), rnd(.3, .6), '255,170,80');
  Z.flare(x, y, '255,210,120', 220, .16);
}
B.kit('reggie', { tech: 'Contract Re-creation', col: '#f1eee2', every: [2.3, 3.8], moves: [
  flat('Receipt: Knives', { a: { dmg: 10, kb: 460, stun: .5 }, speed: 1500, rgb: '207,216,224', fire(o) { receipt(o.x + o.face * 60, o.y + 250); }, draw(s) {
    const c = F(s.x, s.y), k = c[2], d = Math.sign(s.vx);
    Z.lite(() => { g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 2 * k; for (const dy of [-34, 0, 34]) { g.beginPath(); g.moveTo(c[0] - d * 30 * k, c[1] + dy * k); g.lineTo(c[0] - d * (190 + rnd(0, 60)) * k, c[1] + dy * k); g.stroke(); } });
    g.strokeStyle = LINE; g.lineWidth = 2;
    for (const dy of [-34, 0, 34]) {                // three kitchen knives, handle and all, the way they were on the shelf
      g.fillStyle = '#3a2a22'; g.beginPath(); g.rect(c[0] - d * 40 * k, c[1] + (dy - 5) * k, d * 32 * k, 10 * k); g.fill(); g.stroke();
      g.fillStyle = '#dfe6ee'; g.beginPath(); g.moveTo(c[0] + d * 52 * k, c[1] + (dy + 2) * k); g.lineTo(c[0] - d * 8 * k, c[1] + (dy - 9) * k); g.lineTo(c[0] - d * 8 * k, c[1] + (dy + 7) * k); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#fff'; g.fillRect(c[0] + d * 6 * k, c[1] + (dy - 5) * k, d * 26 * k, 2 * k);
    }
  } }),
  drop('Receipt: Truck', { w: 210, col: '#f1eee2', a: { dmg: 15, kb: 520, lift: 620 }, draw(x, t, at) {
    shadowOf(x, t, at, 260);
    const c = falling(x, t, at), k = c[2];
    g.strokeStyle = LINE; g.lineWidth = 3; g.lineJoin = 'round';
    g.fillStyle = '#e4e8ee'; g.beginPath(); g.rect(c[0] - 210 * k, c[1] - 210 * k, 300 * k, 180 * k); g.fill(); g.stroke();                 // the box of it
    g.fillStyle = '#c23b3b'; g.fillRect(c[0] - 210 * k, c[1] - 130 * k, 300 * k, 22 * k); g.fillStyle = '#b9c0ca'; for (let i = 1; i < 6; i++) g.fillRect(c[0] + (-210 + i * 50) * k, c[1] - 208 * k, 2 * k, 76 * k);
    g.fillStyle = '#3a6ea8'; g.beginPath(); g.rect(c[0] + 90 * k, c[1] - 150 * k, 120 * k, 120 * k); g.fill(); g.stroke();                  // the cab
    g.fillStyle = '#bfe3ff'; g.fillRect(c[0] + 130 * k, c[1] - 138 * k, 70 * k, 44 * k); g.fillStyle = '#ffe9a0'; g.fillRect(c[0] + 196 * k, c[1] - 70 * k, 12 * k, 16 * k);
    for (const dx of [-150, -40, 150]) { g.fillStyle = '#17171b'; g.beginPath(); g.arc(c[0] + dx * k, c[1] - 26 * k, 28 * k, 0, TAU); g.fill(); g.fillStyle = '#8f98a3'; g.beginPath(); g.arc(c[0] + dx * k, c[1] - 26 * k, 11 * k, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
    if (t < at && Math.random() < .5) Z.emit(3, x + rnd(-200, 200), lerp(760, 0, Math.min(1, t / at) ** 2) + rnd(0, 220), rnd(-80, 80), rnd(60, 260), rnd(6, 10), rnd(.6, 1), PAPER, Object.assign({ vr: rnd(-10, 10), rot: rnd(0, TAU) }, SLIP));      // the receipts it was bought with, still coming off it
  }, land(x) { Z.boom(x, 60, 150, '255,170,80', { n: 16 }); shards(x, 150, 16, '200,230,255'); Z.decal('crater', x, 230, '255,170,80', 9, 0); for (let i = 0; i < 3; i++) Z.emit(3, x + rnd(-120, 120), 40, rnd(-500, 500), rnd(500, 1000), 24, 1.6, '23,23,27', { g: 2000, vr: rnd(-12, 12), rot: rnd(0, TAU), edge: 'rgba(143,152,163,.8)' }); } })      // (and its wheels)
] });
Fi.DEFS.reggie2 = Object.assign({}, Fi.DEFS.reggie, { hp: 170 });   // the same man, with fewer receipts left on him

// Uro: the sky is a surface to her, and surfaces can be taken hold of
const SKYC = '185,168,255', SKYP = '232,240,255';
// the sky breaking where she has put her fist through it: cracks out from the spot, and the pieces falling
function shatter(x, y, n = 9, R = 300) {
  V.custom(.34, u => {
    const c = F(x, y), k = c[2], al = 1 - u * u, grow = Math.min(1, u * 5);
    Z.lite(() => {
      g.strokeStyle = `rgba(${SKYP},${al})`; g.lineWidth = 2.5 * k; g.beginPath();
      for (let i = 0; i < n; i++) { const a = i / n * TAU + i * .7, r1 = R * k * grow * (.6 + .4 * ((i * 5) % 3) / 2); g.moveTo(c[0], c[1]); g.lineTo(c[0] + Math.cos(a) * r1 * .5 + Math.cos(a + 1.5) * 16 * k, c[1] + Math.sin(a) * r1 * .5 + Math.sin(a + 1.5) * 16 * k); g.lineTo(c[0] + Math.cos(a) * r1, c[1] + Math.sin(a) * r1); }
      g.stroke(); Z.glow(SKYC, c[0], c[1], R * 2.2 * k, .6 * al);
    });
  });
  shards(x, y, 18, SKYP); Z.flash(SKYC, .14, .2);
}
B.kit('uro', { tech: 'Sky Manipulation', col: '#b9a8ff', glow: 'purple', every: [2.1, 3.5], moves: [
  rush('Thin Ice Breaker', { a: { dmg: 14, kb: 700, lift: 520 }, speed: 1600, fx(o) { const x = o.x + o.face * 140; cuts(o, '#b9a8ff', 5); V.ring(x, 170, 260, '#b9a8ff', .3); shatter(x, o.y + 170, 11, 340); Z.shock(x, 420, SKYC, .4, 10); Z.flare(x, o.y + 170, SKYP, 420, .18); } }),
  quake('Sky Fold', { a: { dmg: 11, kb: 420, lift: 380 }, col: '#b9a8ff', pre: 'hookWind', pose: 'hook', fx(o) {
    const f = o.face, x0 = o.x + f * 60;
    V.custom(.6, u => {                             // a fold of the sky itself, pulled down and thrown along the floor like a sheet
      const al = u < .15 ? u / .15 : 1 - (u - .15) / .85, x = x0 + f * 900 * u, a = F(x - f * 260, 0), b = F(x, 0), top = F(x - f * 80, 420), k = b[2];
      Z.lite(() => {
        const gr = g.createLinearGradient(a[0], 0, b[0], 0); gr.addColorStop(0, `rgba(${SKYC},0)`); gr.addColorStop(.7, `rgba(${SKYC},${.5 * al})`); gr.addColorStop(1, `rgba(${SKYP},${.9 * al})`);
        g.fillStyle = gr; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(top[0], top[1], b[0], b[1]); g.lineTo(b[0], b[1] - 30 * k); g.quadraticCurveTo(top[0], top[1] - 60 * k, a[0], a[1]); g.closePath(); g.fill();
        g.strokeStyle = `rgba(255,255,255,${al})`; g.lineWidth = 3 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(top[0], top[1], b[0], b[1]); g.stroke();
      });
    });
    shatter(x0, o.y + 200, 7, 220);
  } })
] });
// Ishigori: more cursed energy output than anyone, let out in a straight line
const GRANITE = '127,233,255';
B.kit('ishigori', { tech: 'Granite Blast', col: '#7fe9ff', glow: 'blue', every: [2.4, 3.8], moves: [
  flat('Granite Blast', { cd: 6, min: 300, wind: .6, pre: 'divWind', pose: 'div', speed: 2000, r: 46, y: 160, trail: 'blue', a: { dmg: 15, kb: 700, lift: 420 },
    fire(o) { const x = o.x + o.face * 90, y = o.y + 160; Z.flare(x, y, GRANITE, 520, .22); Z.flash(GRANITE, .2, .25); Z.shock(o.x, 420, GRANITE, .45, 12); Z.dust(o.x, 8, -o.face); shake(22); o.vx = -o.face * 300; },      // it kicks: he goes back a step
    hit: s => Z.boom(s.x, s.y, 130, GRANITE, { n: 16, clean: true }),
    draw(s) {
      const c = F(s.x, s.y), k = c[2], d = Math.sign(s.vx);
      Z.beamAt(s.x - d * 520, s.x, s.y, 42, GRANITE, .8);                  // what is behind it is still arriving
      lit(() => E.glow(E.GLOW.blue, c[0], c[1], 420 * k, 1));
      g.fillStyle = '#eafcff'; g.beginPath(); g.ellipse(c[0], c[1], 78 * k, 40 * k, 0, 0, TAU); g.fill();
      Z.lite(() => { g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3 * k; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(c[0] - d * (40 + i * 60) * k, c[1], 14 * k, (56 + i * 14) * k, 0, 0, TAU); g.stroke(); } });
    } }),
  rush('Dessert', { cd: 5, pre: 'crushWind', pose: 'crush', a: { dmg: 15, kb: 760, lift: 600 }, speed: 1200, fx(o) {
    const x = o.x + o.face * 130;
    V.crack(o.x + o.face * 140, 260); V.ring(x, 160, 260, '#ffb060', .3); V.rocks(x, 0, 10);
    Z.boom(x, o.y + 150, 100, '255,176,96', { n: 14, clean: true }); Z.shock(x, 400, '255,176,96', .4, 12); Z.dust(x, 10, o.face);
    for (let i = 0; i < 8; i++) Z.emit(2, x + rnd(-60, 60), rnd(120, 260), rnd(-60, 60), rnd(120, 300), rnd(70, 120), rnd(.6, 1), '235,235,240', { s1: 2, a: .4 });      // the steam off him
  } })
] });
// Kashimo: his cursed energy is a charge. Once it is on you, the bolt cannot miss where you were
const KZ = rgbOf(BOLT);
const arcs = (x, y, n, R, w = 4) => { for (let i = 0; i < n; i++) { const a = rnd(0, TAU), l = rnd(R * .4, R); Z.lightning(x, y, x + Math.cos(a) * l, Math.max(0, y + Math.sin(a) * l), KZ, rnd(.12, .26), w, 1); } };
B.kit('kashimo', { tech: 'Lightning', col: BOLT, glow: 'blue', every: [1.9, 3.2], moves: [
  rush('Staff Thrust', { cd: 5, pose: 'jab', a: { dmg: 13, kb: 620, lift: 420 }, speed: 1700, fx(o) {
    const x = o.x + o.face * 160, y = o.y + 175;
    V.bolt(o.x, o.y + 180, o.x + o.face * 320, o.y + 170, BOLT, .25, 5); V.sparks(o.x + o.face * 150, 170, 'blue', 14);
    Z.lightning(o.x, y, o.x + o.face * 520, y, KZ, .3, 7, 3); arcs(x, y, 6, 300); Z.flash('255,255,255', .2, .12); Z.flare(x, y, KZ, 420, .18); Z.shock(x, 360, KZ, .35, 9);
  } }),
  drop('Lightning', { cd: 6, w: 150, delay: .45, col: BOLT, a: { dmg: 16, kb: 300, stun: .8 }, pre: 'manjiWind', pose: 'idle',
    draw(x, t, at) { if (t < at && Math.random() < .5) { const a = rnd(0, TAU); Z.lightning(x + Math.cos(a) * 230, rnd(0, 260), x + rnd(-30, 30), rnd(0, 120), KZ, .08, 2, 0); } },      // the charge that is already on him, finding its way in
    land(x) {
      for (let i = 0; i < 3; i++) V.bolt(x + rnd(-60, 60), 900, x + rnd(-20, 20), 0, BOLT, .3, 7);
      V.sparks(x, 60, 'blue', 20); E.addBlast(x, 120, '159,232,255', 300);
      for (let i = 0; i < 4; i++) Z.lightning(x + rnd(-90, 90), 900, x + rnd(-24, 24), 0, KZ, rnd(.25, .45), 9, 3);
      Z.pillar(x, 90, 900, KZ, .45); Z.flash('255,255,255', .5, .22); Z.dim(.6, .4); Z.shock(x, 520, KZ, .5, 14); Z.decal('scorch', x, 150, KZ, 8, 0); shake(30);
      B.add({ life: .9, upd(h, dt) { if (Math.random() < dt * 22) { const a = rnd(0, TAU), r = rnd(60, 260); Z.lightning(x, 6, x + Math.cos(a) * r, rnd(0, 60), KZ, .1, 2, 0); } } });      // and what is left of it, crawling over the floor
    } }),
  quake('Discharge', { cd: 7, a: { dmg: 12, kb: 420, lift: 380 }, col: BOLT, below: .7, fx(o) {
    const f = o.face;
    arcs(o.x, o.y + 160, 10, 420, 5); Z.flash('255,255,255', .3, .15); Z.pillar(o.x, 70, 520, KZ, .35);
    B.add({ life: 1150 / 1300, x: o.x + f * 80, upd(h, dt) { h.x += f * 1300 * dt; if (Math.random() < dt * 40) Z.lightning(h.x, rnd(60, 240), h.x + rnd(-80, 80), 0, KZ, .1, 3, 0); } });      // it earths itself all the way along
  } })
] });
// Naoya, as a curse: everything he was, and faster than sound
const NP = '255,106,208';
B.kit('naoya2', { tech: 'Projection Sorcery', col: '#ff6ad0', glow: 'purple', every: [1.8, 3], moves: [
  { name: 'Mach Dive', cd: 5, min: 200, max: 760, wind: .34, pre: 'dash', dur: .6, run(o, p, M, t) {
    o.rate = 46;
    if (!M.s) {
      M.s = 1; M.dir = o.face; sfx.whoosh();
      Z.dust(o.x, 10, -o.face); Z.shock(o.x, 420, NP, .4, 12); V.ring(o.x, o.y + 170, 300, '#ffffff', .25); Z.flash('255,255,255', .12, .1);
      V.custom(.18, () => {                         // the cone of air he is dragging: he is ahead of his own sound
        const c = F(o.x + M.dir * 60, o.y + 170), k = c[2], d = M.dir;
        Z.lite(() => {
          g.strokeStyle = `rgba(${NP},.6)`; g.lineWidth = 10 * k; g.beginPath(); g.moveTo(c[0] - d * 420 * k, c[1] - 250 * k); g.quadraticCurveTo(c[0] + d * 20 * k, c[1], c[0] - d * 420 * k, c[1] + 250 * k); g.stroke();
          g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 4 * k; g.beginPath(); g.moveTo(c[0] - d * 300 * k, c[1] - 190 * k); g.quadraticCurveTo(c[0] + d * 60 * k, c[1], c[0] - d * 300 * k, c[1] + 190 * k); g.stroke();
        });
      });
    }
    if (t < .18) {                                  // from one end of the pass to the other before the sound of it arrives
      o.target = POSE.dash; o.vx = Math.abs(o.x + M.dir * 60) < 940 ? M.dir * 2600 : 0;
      if (Math.random() < .7) V.puff('purple', o.x - M.dir * 60, o.y + rnd(60, 240), -M.dir * 300, 0, 40, .25);
      if (!M.done && Math.abs(p.x - o.x) < 120) {
        M.done = 1; V.ring(p.x, p.y + 160, 260, '#ff6ad0', .3); E.stop(.06); shake(18);
        Z.boom(p.x, p.y + 150, 90, NP, { n: 12, clean: true }); Z.shock(p.x, 420, NP, .4, 12);
        B.burst(p.x, 200, { dmg: 13, kb: 520, lift: 420 }, 190, M.dir);
      }
      return;
    }
    o.face = p.x >= o.x ? 1 : -1; o.target = t < .4 ? POSE.cross : POSE.idle;
  } },
  quake('Sonic Boom', { a: { dmg: 12, kb: 480, lift: 400 }, col: '#ff6ad0', pre: 'hookWind', pose: 'hook', speed: 1700, fx(o) {
    const f = o.face, x0 = o.x + f * 100, y = o.y + 170;
    V.ring(x0, y, 420, '#ffffff', .3); V.ring(x0, y, 300, '#ff6ad0', .4); Z.flash('255,255,255', .14, .1);
    B.add({ life: 1150 / 1700, x: x0, upd(h, dt) { h.x += f * 1700 * dt; }, draw(h) {                // the wall of it, standing up and travelling
      const c = F(h.x, 170), k = c[2], u = 1 - h.t / h.life;
      Z.lite(() => { g.strokeStyle = `rgba(255,255,255,${.8 * u})`; g.lineWidth = 4 * k; g.beginPath(); g.ellipse(c[0], c[1], 40 * k, 190 * k, 0, 0, TAU); g.stroke(); g.strokeStyle = `rgba(${NP},${.5 * u})`; g.lineWidth = 12 * k; g.beginPath(); g.ellipse(c[0] - f * 30 * k, c[1], 54 * k, 220 * k, 0, 0, TAU); g.stroke(); });
    } });
  } }),
  drop('Frame Break', { cd: 9, below: .7, w: 170, col: '#ff6ad0', a: { dmg: 14, kb: 200, stun: 1 }, pre: 'manjiWind', pose: 'idle', draw(x, t, at) {
    if (t > at + .1) return;
    const c = F(x, 0), k = c[2], u = Math.min(1, t / at), w = 90 * k, h = 300 * k, x0 = c[0] - w, y0 = c[1] - h, s = 1 + (1 - u) * .6;
    g.fillStyle = `rgba(255,106,208,${.08 + .12 * u})`; g.fillRect(x0, y0, w * 2, h);
    Z.lite(() => { g.strokeStyle = `rgba(255,106,208,${.4 + .6 * u})`; g.lineWidth = 4 * k; g.strokeRect(x0, y0, w * 2, h); g.lineWidth = 1.5 * k; g.strokeRect(c[0] - w * s, c[1] - h / 2 - h * s / 2, w * 2 * s, h * s); });      // a second frame closing on the first: when they meet, he is in it
    g.fillStyle = `rgba(20,4,14,${.8 * u})`; for (let i = 0; i < 8; i++) for (const sx of [x0 + 4 * k, x0 + w * 2 - 12 * k]) g.fillRect(sx, y0 + (10 + i * 37) * k, 8 * k, 16 * k);
  }, land(x) { shards(x, 160, 18, '255,200,240', 500); Z.flash(NP, .2, .2); Z.flare(x, 160, NP, 460, .2); } })
] });
// Kenjaku: every curse Geto ever swallowed, and the technique of a body he wore before this one
const KG = '201,165,58', KP = '150,90,200', KVOID = '20,4,42';
B.kit('kenjaku', { tech: 'Cursed Spirit Manipulation', col: '#c9a53a', glow: 'gold', every: [2, 3.4], moves: [
  flat('Cursed Spirit', { a: { dmg: 11, kb: 520, stun: .5 }, speed: 1300, r: 34, trail: 'purple', rgb: KP,
    fire(o) { const x = o.x + o.face * 60, y = o.y + 200; Z.flare(x, y, KP, 200, .15); for (let i = 0; i < 6; i++) Z.emit(2, x + rnd(-40, 40), y + rnd(-40, 40), rnd(-80, 80), rnd(-20, 160), rnd(80, 130), rnd(.5, .9), KVOID, { s1: 1.8, a: .7 }); },
    hit: s => { for (let i = 0; i < 6; i++) Z.emit(2, s.x + rnd(-40, 40), s.y + rnd(-40, 40), rnd(-160, 160), rnd(-40, 200), rnd(80, 140), rnd(.5, .9), KVOID, { s1: 1.8, a: .7 }); },
    draw(s) {
      const c = F(s.x, s.y), k = c[2], d = Math.sign(s.vx), T = E.T * 22;
      for (let i = 5; i >= 0; i--) {                // a long thing with too many joints, swimming through the air at him
        const x = c[0] - d * i * 44 * k, y = c[1] + Math.sin(T - i * .9) * 16 * k, r = (34 - i * 4) * k;
        g.strokeStyle = '#1a0f16'; g.lineWidth = 2; if (i) { g.beginPath(); g.moveTo(x, y + r * .8); g.lineTo(x - d * 10 * k, y + r + 14 * k); g.moveTo(x, y - r * .8); g.lineTo(x - d * 10 * k, y - r - 14 * k); g.stroke(); }
        g.fillStyle = i & 1 ? '#3a2233' : '#2a1a22'; g.strokeStyle = LINE; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, r * 1.25, r, 0, 0, TAU); g.fill(); g.stroke();
      }
      const hy = c[1] + Math.sin(T) * 16 * k;
      g.fillStyle = '#f4f1d0'; eye(c[0] + d * 14 * k, hy - 10 * k, 10 * k, 10 * k); g.fillStyle = '#c2182b'; eye(c[0] + d * 17 * k, hy - 10 * k, 4.5 * k, 4.5 * k);
      g.fillStyle = '#f4f1e6'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(c[0] + d * (40 - i * 9) * k, hy + 6 * k); g.lineTo(c[0] + d * (36 - i * 9) * k, hy + 19 * k); g.lineTo(c[0] + d * (32 - i * 9) * k, hy + 6 * k); g.closePath(); g.fill(); }
      if (Math.random() < .6) Z.emit(2, s.x - d * 200, s.y + rnd(-20, 20), -d * rnd(20, 100), rnd(-20, 60), rnd(60, 100), rnd(.4, .8), KVOID, { s1: 1.8, a: .6 });
    } }),
  drop('Antigravity System', { cd: 8, w: 250, delay: .7, col: '#c9a53a', high: 9999, a: { dmg: 16, kb: 0, stun: 1 }, pre: 'manjiWind', pose: 'idle', draw(x, t, at) {
    if (t > at + .3) return;
    const c = F(x, 0), k = c[2], u = Math.min(1, t / at);      // everything inside the ring is about to weigh a great deal more: leave it, jumping will not help
    Z.lite(() => {
      g.strokeStyle = `rgba(${KG},${.5 + .4 * u})`; g.lineWidth = 3 * k;
      for (let i = 0; i < 5; i++) { const y = ((t * 2 + i / 5) % 1) * 460, sq = .7 + .3 * y / 460; g.beginPath(); g.ellipse(c[0], c[1] - (460 - y) * k, 250 * k * sq, 60 * k * sq, 0, 0, TAU); g.stroke(); }
      const top = F(x, 520), gr = g.createLinearGradient(0, top[1], 0, c[1]); gr.addColorStop(0, `rgba(${KG},0)`); gr.addColorStop(1, `rgba(${KG},${.1 + .25 * u})`);
      g.fillStyle = gr; g.fillRect(c[0] - 250 * k, top[1], 500 * k, c[1] - top[1]);
    });
    if (t < at && Math.random() < .6) Z.emit(3, x + rnd(-240, 240), rnd(200, 460), 0, -rnd(200, 700), rnd(3, 7), rnd(.3, .6), '80,70,60', { rot: rnd(0, TAU), vr: rnd(-6, 6) });      // grit being pressed down out of the air
  }, land(x) {
    Z.dim(.5, .4); Z.flash(KG, .2, .2); Z.shock(x, 700, KG, .6, 16); Z.decal('crater', x, 260, KG, 10, 0); V.crack(x, 420);
    for (let i = 0; i < 20; i++) Z.emit(2, x + rnd(-240, 240), rnd(0, 20), rnd(-500, 500), rnd(0, 60), rnd(80, 140), rnd(.5, .9), '150,140,165', { s1: 2, a: .45, dr: 3 });
  } }),
  flat('Uzumaki', { cd: 12, below: .6, min: 260, wind: .7, pre: 'divWind', pose: 'div', speed: 1800, r: 60, y: 170, trail: 'purple', rgb: KP, a: { dmg: 20, kb: 800, lift: 520 },
    fire(o) { Z.dim(.7, .9); Z.flash(KP, .25, .3); Z.shock(o.x, 520, KP, .5, 14); shake(26); E.banner('極ノ番', 'MAXIMUM: UZUMAKI', 'sm'); },
    hit: s => Z.boom(s.x, s.y, 200, KP, { n: 26, smoke: KVOID, hot: '255,220,255' }),
    draw(s) {
      const c = F(s.x, s.y), k = c[2], T = E.T * 12;
      lit(() => E.glow(E.GLOW.purple, c[0], c[1], 620 * k, 1));
      g.lineCap = 'round';
      for (let arm = 0; arm < 3; arm++) {           // every curse he has left, wound into one: three arms of them turning in to the middle
        g.strokeStyle = arm ? (arm === 1 ? '#3a145e' : '#5a3a10') : '#14042a'; g.lineWidth = (16 - arm * 3) * k; g.beginPath();
        for (let a = 0; a < 13; a += .3) { const rr = a * 7.5 * k, x = c[0] + Math.cos(a + T + arm * 2.094) * rr, y = c[1] + Math.sin(a + T + arm * 2.094) * rr; a ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
      }
      g.lineCap = 'butt';
      Z.lite(() => { g.strokeStyle = `rgba(${KG},.8)`; g.lineWidth = 3 * k; g.beginPath(); g.arc(c[0], c[1], 104 * k, T, T + 4.4); g.stroke(); Z.glow('255,255,255', c[0], c[1], 130 * k, .9); });
      for (let i = 0; i < 4; i++) { const a = T * .7 + i * 1.57, x = c[0] + Math.cos(a) * 70 * k, y = c[1] + Math.sin(a) * 70 * k; g.fillStyle = '#f4f1d0'; eye(x, y, 8 * k, 8 * k); g.fillStyle = '#c2182b'; eye(x, y, 3.5 * k, 3.5 * k); }      // and their eyes still open in it
      if (Math.random() < .5) Z.lightning(s.x, s.y, s.x + rnd(-200, 200), Math.max(0, s.y + rnd(-200, 200)), KP, .1, 3, 0);
    } })
] });
// Yorozu: Construction. Liquid metal, armour, and one perfect thing
const SILVER = '226,232,244', RZ = rgbOf(ROSE);
B.kit('yorozu', { tech: 'Construction', col: ROSE, glow: 'red', every: [2, 3.4], moves: [
  quake('Liquid Metal', { a: { dmg: 12, kb: 440, lift: 400 }, col: '#cfd8e0', pre: 'hookWind', pose: 'hook', speed: 1500, fx(o) {
    const f = o.face;
    for (let i = 0; i < 14; i++) Z.emit(4, o.x + f * rnd(40, 160), rnd(20, 200), f * rnd(200, 800), rnd(100, 700), rnd(4, 9), 2, SILVER, { g: 1800 });
    B.add({ life: 1150 / 1500, x: o.x + f * 80, n: 0, upd(h, dt) {                                     // a tide of it along the floor, throwing spikes up as it goes
      h.x += f * 1500 * dt;
      if (Math.random() < dt * 60) Z.emit(4, h.x + rnd(-40, 40), rnd(10, 60), f * rnd(0, 300), rnd(200, 700), rnd(4, 8), 2, SILVER, { g: 1800 });
      if ((h.n += dt) < .07) return;
      h.n = 0; const x = h.x;
      V.custom(.4, u => {
        const a = F(x - 26, 0), b = F(x + 26, 0), c = F(x + f * 20, 150 * Math.sin(Math.min(1, u * 3) * Math.PI / 2) * (1 - Math.max(0, u - .5) * 2)), gr = g.createLinearGradient(a[0], 0, b[0], 0);
        gr.addColorStop(0, '#8f98a3'); gr.addColorStop(.5, '#ffffff'); gr.addColorStop(1, '#5a626c');
        g.fillStyle = gr; g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0], c[1]); g.lineTo(b[0], b[1]); g.closePath(); g.fill(); g.stroke();
      });
    } });
  } }),
  rush('Insect Armour', { a: { dmg: 14, kb: 700, lift: 520 }, speed: 1500, pose: 'crush', pre: 'crushWind', fx(o) {
    const x = o.x + o.face * 130, y = o.y + 160;
    cuts(o, ROSE, 4); Z.boom(x, y, 90, RZ, { n: 12, clean: true }); Z.shock(x, 380, RZ, .4, 12); Z.flare(x, y, RZ, 380, .18);
    for (let i = 0; i < 12; i++) Z.emit(3, x, y, o.face * rnd(100, 700) + rnd(-200, 200), rnd(0, 600), rnd(5, 10), rnd(.6, 1), i & 1 ? '60,30,44' : '120,40,70', { g: 1500, vr: rnd(-14, 14), w: .5, rot: rnd(0, TAU), edge: 'rgba(0,0,0,.6)' });      // plates of the armour breaking off on him
  } }),
  drop('True Sphere', { cd: 10, below: .65, w: 230, delay: .7, col: ROSE, a: { dmg: 22, kb: 560, lift: 680 }, draw(x, t, at) {
    shadowOf(x, t, at, 200);
    const c = falling(x, t, at), k = c[2], R = 150 * k, cy = c[1] - R, gr = g.createRadialGradient(c[0] - 46 * k, cy - 50 * k, 8 * k, c[0], cy, R);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(.18, '#c9d1dc'); gr.addColorStop(.55, '#59616c'); gr.addColorStop(1, '#101014');
    g.fillStyle = gr; g.beginPath(); g.arc(c[0], cy, R, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();
    g.save(); g.beginPath(); g.arc(c[0], cy, R, 0, TAU); g.clip();                                     // the world, bent across the face of it
    g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(c[0] - R, cy + R * .1, R * 2, R * .16); g.fillStyle = `rgba(${RZ},.22)`; g.fillRect(c[0] - R, cy + R * .34, R * 2, R * .5);
    g.restore();
    Z.lite(() => { g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2 * k; g.beginPath(); g.arc(c[0], cy, R * 1.08, -2.2, -1.2); g.stroke(); Z.glow('255,255,255', c[0] - 50 * k, cy - 56 * k, 110 * k, .9); });
    g.globalAlpha = 1;
  }, land(x) {                                      // a perfect sphere touches the floor at one point: all of its weight on nothing at all
    V.impact(.16, x, 120); Z.shock(x, 760, SILVER, .7, 18); Z.shock(x, 460, RZ, .5, 10); Z.decal('crater', x, 250, RZ, 12, 0); Z.flash('255,255,255', .3, .2); V.crack(x, 460);
    for (let i = 0; i < 24; i++) Z.emit(2, x + rnd(-200, 200), rnd(0, 20), rnd(-700, 700), rnd(0, 80), rnd(90, 150), rnd(.6, 1), '150,140,165', { s1: 2, a: .45, dr: 3 });
  } })
] });
// Sukuna, in Megumi: the same moves as ever, in a body that has not been cut yet
Fi.DEFS.meguna = Object.assign({}, Fi.DEFS.sukuna, { skin: MEGUNA, hp: 420 });
Fi.DEFS.meguna2 = Object.assign({}, Fi.DEFS.sukuna, { skin: MEGUNA, hp: 2400, dr: .9 });   // and at Shinjuku, with twenty fingers in him
Fi.DEFS.naoya3 = Object.assign({}, Fi.DEFS.naoya2, { hp: 240 });

/* ---------- Yuta, to play: a sword, Rika, and more cursed energy than he knows what to do with ---------- */
function fist(x, t, col) {                          // one arm of something very large, coming down
  const c = falling(x, t, .5), k = c[2];
  g.fillStyle = col; g.strokeStyle = LINE; g.lineWidth = 3; g.lineJoin = 'round';
  g.beginPath(); g.rect(c[0] - 62 * k, c[1] - 1100 * k, 124 * k, 960 * k); g.fill(); g.stroke();
  g.beginPath(); g.rect(c[0] - 106 * k, c[1] - 150 * k, 212 * k, 150 * k); g.fill(); g.stroke();
  g.fillStyle = '#16070c'; for (let i = 0; i < 4; i++) g.fillRect(c[0] + (-94 + i * 50) * k, c[1] - 28 * k, 36 * k, 28 * k);
  g.globalAlpha = 1;
}
const cut = (p, ang, len, col = STEEL) => V.slash(p.x + p.face * 150, p.y + 175, p.face > 0 ? ang : Math.PI - ang, len, col, 12);
const YUTA_M = {
  strikes: { name: 'Katana Rush', cd: 4, dur: .85, glow: 'purple', run(p, m, t) {
    const o = E.P2, gap = (o.x - p.x) * p.face, n = Math.floor((t - .16) / .2);
    p.rate = 46;
    if (t < .16) { p.target = POSE.dash; p.vx = gap > 180 ? p.face * 1500 : 0; return; }
    p.vx = 0; p.target = n > 2 ? POSE.idle : [POSE.hook, POSE.cross, POSE.crush][n];
    if (n > 2 || n === m.n) return;
    m.n = n; sfx.whoosh(); cut(p, [-.3, .35, -1.2][n], 400);                    // three cuts, and the last one lifts it off the floor
    E.tryHit(p, n === 2 ? { reach: 290, dmg: 10, kb: 620, lift: 480, stop: .12, heavy: 1, col: STEEL } : { reach: 280, dmg: 6, kb: 120, stun: .5, stop: .05, col: STEEL });
  } },
  crush: { name: 'The Queen', cd: 8, dur: .8, glow: 'purple', run(p, m, t) {
    const o = E.P2;
    p.vx = 0; p.rate = 30; p.target = t < .5 ? POSE.crushWind : t < .7 ? POSE.crush : POSE.idle;
    if (!m.s) { m.s = 1; m.x = o.ko ? p.x + p.face * 300 : o.x; sfx.charge(); V.custom(.95, u => fist(m.x, u * .95, '#cfcbd8')); }
    if (m.b || t < .5) return;
    m.b = 1; sfx.blast(); shake(26); V.crack(m.x, 320); V.rocks(m.x, 0, 14); V.ring(m.x, 60, 320, LILAC, .4);
    if (!o.ko && Math.abs(o.x - m.x) < 220) E.applyHit(o, p.face, { dmg: 18, kb: 420, lift: 640, stun: .9, stop: .16, heavy: 1, col: LILAC });
  } },
  div: { name: 'Cursed Energy Slash', cd: 6, dur: .55, glow: 'purple', run(p, m, t) {
    p.vx = 0; p.rate = 46; p.target = t < .12 ? POSE.hookWind : t < .36 ? POSE.hook : POSE.idle;
    if (t < .12 || m.s) return;
    m.s = 1; sfx.whoosh(); cut(p, -.2, 420);
    const f = p.face, x0 = p.x + f * 90, y = p.y + 150, o = near(p, 900), x1 = o ? o.x : x0 + f * 860;
    V.custom(.16, u => {                            // a cut thrown the length of the street
      const c = F(x0 + (x1 - x0) * u, y), k = c[2];
      lit(() => E.glow(E.GLOW.purple, c[0], c[1], 230 * k, .8));
      g.fillStyle = '#fff'; g.beginPath(); g.moveTo(c[0] + f * 10 * k, c[1] - 95 * k); g.quadraticCurveTo(c[0] + f * 70 * k, c[1], c[0] + f * 10 * k, c[1] + 95 * k);
      g.quadraticCurveTo(c[0] + f * 36 * k, c[1], c[0] + f * 10 * k, c[1] - 95 * k); g.fill();
    });
    E.after(.14, () => { if (E.tryHit(p, { reach: 900, dmg: 13, kb: 560, stun: .7, stop: .1, heavy: 1, col: LILAC })) V.sparks(E.P2.x, E.P2.y + 170, 'purple', 10); });
  } },
  manji: { name: 'Reverse Cursed Technique', cd: 16, dur: .6, glow: 'green', run(p, m, t) {
    p.vx = 0; p.target = t < .45 ? POSE.manjiWind : POSE.idle;
    if (m.s) return;
    m.s = 1; sfx.charge(); p.hp = Math.min(p.max, p.hp + p.max * .3);
    E.fx.push({ k: 2, x: p.x, y: p.y + 390, n: 'HEALED', col: '#bff5d8', t: 0, life: 1.1 }); V.ring(p.x, p.y + 160, 220, '#bff5d8', .5); V.sparks(p.x, p.y + 180, 'green', 12);
  } }
};
JU.tech.TECH.yuta = { id: 'yuta', name: 'Queen of Curses', jp: '女王', who: 'Keeper of the Queen', odds: 0, col: LILAC, glow: 'purple', moves: YUTA_M };   // none of these three is on the roll: the story hands them out

/* ---------- Hakari, to play: rough cursed energy, and a domain that pays out ---------- */
function shutters(x, t) {
  const u = Math.min(1, t / .45), gap = lerp(330, 0, u * u), a = t > .7 ? Math.max(0, 1 - (t - .7) / .2) : 1;
  g.globalAlpha = a;
  for (const s of [-1, 1]) {
    const c0 = F(x + s * (gap + 150), 330), c1 = F(x + s * gap, 0), w = c1[0] - c0[0], h = c1[1] - c0[1];
    g.fillStyle = '#8c949e'; g.fillRect(c0[0], c0[1], w, h);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.beginPath();
    for (let i = 1; i < 9; i++) { g.moveTo(c0[0], c0[1] + h * i / 9); g.lineTo(c1[0], c0[1] + h * i / 9); }
    g.stroke(); g.lineWidth = 3; g.strokeStyle = LINE; g.strokeRect(c0[0], c0[1], w, h);
  }
  g.globalAlpha = 1;
}
const FEVER = '#7ad7ff';
let jack = 0;                                       // seconds of jackpot left: while it runs he cannot be put down
const HAKARI_M = {
  strikes: { name: 'Rough Blow', cd: 4, dur: .6, glow: 'blue', run(p, m, t) {
    const o = E.P2, gap = (o.x - p.x) * p.face;
    p.rate = 46;
    if (m.done || t > .26) { p.vx = 0; p.target = m.done && t < m.at + .25 ? POSE.div : POSE.idle; return; }
    p.target = POSE.dash; p.vx = gap > 170 ? p.face * 1500 : 0;
    if (gap > -30 && gap < 230) {
      m.done = 1; m.at = t; p.vx = 0; sfx.blast(); V.sparks(p.x + p.face * 110, p.y + 170, 'blue', 14);
      E.tryHit(p, { reach: 260, dmg: 14, kb: 760, lift: 480, stop: .14, heavy: 1, col: FEVER });
    }
  } },
  crush: { name: 'Shutter Doors', cd: 7, dur: .7, glow: 'blue', run(p, m, t) {
    const o = E.P2;
    p.vx = 0; p.rate = 30; p.target = t < .45 ? POSE.manjiWind : POSE.idle;
    if (!m.s) { m.s = 1; m.x = o.ko ? p.x + p.face * 300 : o.x; sfx.charge(); V.custom(.9, u => shutters(m.x, u * .9)); }
    if (m.b || t < .45) return;
    m.b = 1; sfx.hit(true); shake(20); V.ring(m.x, 160, 240, FEVER, .3);
    if (!o.ko && Math.abs(o.x - m.x) < 240) E.applyHit(o, p.face, { dmg: 16, kb: 200, stun: 1, stop: .14, heavy: 1, col: FEVER });   // caught between them, and held there a moment
  } },
  div: { name: 'Reserve Ball', cd: 5, dur: .5, glow: 'blue', run(p, m, t) {
    p.vx = 0; p.rate = 46; p.target = t < .12 ? POSE.hookWind : t < .34 ? POSE.hook : POSE.idle;
    if (t < .12 || m.s) return;
    m.s = 1; sfx.whoosh();
    const f = p.face, x0 = p.x + f * 90, y = p.y + 170, o = near(p, 900), x1 = o ? o.x : x0 + f * 860;
    V.custom(.14, u => { for (let i = 0; i < 5; i++) orb(x0 + (x1 - x0) * Math.max(0, u - i * .05), y + Math.sin(i * 2.1) * 26, 10, 'white', '#cfd8e0'); });   // a handful of pachinko balls, thrown hard
    E.after(.12, () => { if (E.tryHit(p, { reach: 900, dmg: 12, kb: 420, stun: .6, stop: .08, col: FEVER })) V.sparks(E.P2.x, E.P2.y + 170, 'blue', 10); });
  } },
  manji: { name: 'Fever Rush', cd: 10, dur: 1.1, glow: 'blue', run(p, m, t) {
    const n = Math.floor((t - .1) / .15);
    p.rate = 50;
    if (t < .1 || n > 5) { p.vx = 0; p.target = n > 5 ? POSE.idle : POSE.hookWind; return; }
    p.target = n === 5 ? POSE.crush : n % 2 ? POSE.cross : POSE.jab; p.vx = (t - .1) % .15 < .05 ? p.face * 380 : 0;
    if (n === m.n) return;
    m.n = n; sfx.whoosh();
    if (E.tryHit(p, n === 5 ? { reach: 250, dmg: 12, kb: 900, lift: 520, stop: .16, heavy: 1, col: FEVER } : { reach: 230, dmg: 4, kb: 60, stun: .5, stop: .04, col: FEVER }) && n === 5) V.crack(E.P2.x, 260);
  } }
};
JU.tech.TECH.hakari = { id: 'hakari', name: 'Idle Death Gamble', jp: '坐殺博徒', who: 'Jackpot Gambler', odds: 0, col: FEVER, glow: 'blue', moves: HAKARI_M, awkName: 'Jackpot',
  awaken(p) {                                       // the domain is a pachinko machine, and tonight it pays
    p.inv = Math.max(p.inv, 1);
    if (!D.open({ who: p, tone: 'teal', reveal() { jack = 12; sfx.bf(); E.after(.25, () => E.banner('大当り', 'JACKPOT', 'sm')); } })) JU.tech.charge(100);
  } };

/* ---------- Yuki, to play: Star Rage. Her fists weigh whatever she decides they weigh ---------- */
const STAR = '#ffd87a';
const YUKI_M = {
  strikes: { name: 'Star Rage', cd: 3.5, dur: .55, glow: 'gold', run(p, m, t) {
    p.rate = 46;
    if (t < .14) { p.target = POSE.divWind; p.vx = p.face * 500; return; }
    p.vx = 0; p.target = t < .38 ? POSE.div : POSE.idle;
    if (m.s) return;
    m.s = 1; sfx.blast();
    if (E.tryHit(p, { reach: 250, dmg: 15, kb: 900, lift: 420, stop: .14, heavy: 1, col: STAR })) { V.ring(E.P2.x, E.P2.y + 160, 260, STAR, .3); V.crack(E.P2.x, 220); }
  } },
  crush: { name: 'Garuda', cd: 6, dur: .6, glow: 'gold', run(p, m, t) {
    p.vx = 0; p.rate = 44; p.target = t < .14 ? POSE.kickWind : t < .4 ? POSE.kick : POSE.idle;
    if (t < .14 || m.s) return;
    m.s = 1; sfx.whoosh();
    const f = p.face, x0 = p.x + f * 80, y = p.y + 150, o = near(p, 760), x1 = o ? o.x : x0 + f * 700;
    V.custom(.2, u => {                             // her shikigami, kicked like a ball: a long white body with weight added to it
      const c = F(x0 + (x1 - x0) * Math.min(1, u * 1.3), y + Math.sin(u * Math.PI) * 60), k = c[2];
      g.strokeStyle = LINE; g.lineWidth = 30 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(c[0] - f * 170 * k, c[1] + 20 * k); g.quadraticCurveTo(c[0] - f * 80 * k, c[1] - 50 * k, c[0], c[1]); g.stroke();
      g.strokeStyle = '#f4f1e6'; g.lineWidth = 22 * k; g.stroke(); g.lineCap = 'butt';
      g.fillStyle = '#c2182b'; eye(c[0] - f * 6 * k, c[1] - 4 * k, 5 * k, 5 * k);
    });
    E.after(.15, () => { if (E.tryHit(p, { reach: 760, dmg: 14, kb: 620, lift: 380, stop: .12, heavy: 1, col: STAR })) V.sparks(E.P2.x, E.P2.y + 170, 'gold', 12); });
  } },
  div: { name: 'Mass Driver', cd: 8, dur: .8, glow: 'gold', run(p, m, t) {
    p.rate = 44;
    if (t < .3) { p.target = POSE.crushWind; p.vx = p.face * 620; return; }   // a run-up, and down with all of it
    p.vx = 0; p.target = t < .55 ? POSE.crush : POSE.idle;
    if (m.s) return;
    const x = p.x + p.face * 150;
    m.s = 1; sfx.blast(); shake(28); V.crack(x, 340); V.rocks(x, 0, 16); V.ring(x, 50, 340, STAR, .4);
    E.tryHit(p, { reach: 300, dmg: 20, kb: 520, lift: 700, stop: .18, heavy: 1, ring: 1, col: STAR });
  } },
  manji: { name: 'Bom Ba Ye', cd: 12, dur: 1.1, glow: 'gold', run(p, m, t) {
    const o = E.P2;
    p.vx = 0; p.rate = 30;
    if (t < .6) { p.target = POSE.divWind; if (!m.c) { m.c = 1; sfx.charge(); p.inv = Math.max(p.inv, .7); } const w = E.hand(p, false); V.mote(w[0], w[1], 'gold'); return; }
    p.target = t < .9 ? POSE.div : POSE.idle;
    if (m.s) return;
    m.s = 1; sfx.bf(); shake(34);                    // one punch, with as much mass behind it as the arm will survive
    if (E.tryHit(p, { reach: 280, dmg: 30, kb: 1300, lift: 520, stop: .26, heavy: 1, col: STAR })) { V.impact(.2, o.x, o.y + 150); V.crack(o.x, 380); E.addBlast(o.x, o.y + 150, '255,216,122', 360); }
  } }
};
JU.tech.TECH.yuki = { id: 'yuki', name: 'Star Rage', jp: '星の怒り', who: 'Star Rage', odds: 0, col: STAR, glow: 'gold', moves: YUKI_M };

const tick0 = H.tick, reset0 = H.reset, start0 = H.fightStart;
H.tick = dt => {
  tick0(dt);
  if (jack <= 0) return;
  const p = E.P1;
  jack -= dt;
  if (JU.tech.active !== JU.tech.TECH.hakari || p.dead) { jack = 0; return; }
  p.hp = Math.min(p.max, p.hp + p.max * .6 * dt);   // whatever is done to him is undone before it matters
  if (Math.random() < dt * 24) V.puff('teal', p.x + rnd(-50, 50), p.y + rnd(20, 260), 0, rnd(120, 300), rnd(20, 40), .5);
  if (jack <= 0) E.fx.push({ k: 2, x: p.x, y: p.y + 390, n: 'THE ROUND IS OVER', col: FEVER, t: 0, life: 1.3 });
};
H.reset = () => { reset0(); jack = 0; };
H.fightStart = (cfg, wave) => { if (!wave) jack = 0; start0(cfg, wave); };

/* ---------- the gym: a school hall with nobody left in it ---------- */
const gym = {
  sky() {
    const HY = E.HY, VW = E.VW, gr = g.createLinearGradient(0, 0, 0, HY), off = cam.x * .1 + cam.yaw * 600;
    gr.addColorStop(0, '#10141c'); gr.addColorStop(1, '#2b3442');
    g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
    for (let i = -4; i <= 4; i++) {                  // high windows, and the evening coming in through them
      const x = VW / 2 + i * 250 - off;
      g.fillStyle = 'rgba(255,190,120,.24)'; g.fillRect(x - 70, 46, 140, 96);
      g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 3; g.strokeRect(x - 70, 46, 140, 96); seg(x, 46, x, 142);
    }
  },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, '#b58a55'); gr.addColorStop(.35, '#6a4a2c'); gr.addColorStop(1, '#20140a');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 1.5; g.beginPath();
    for (let x = -1200; x <= 1200; x += 80) { const a = P(x, 0, zn), b = P(x, 0, ZP + 520); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
    g.strokeStyle = 'rgba(244,241,230,.7)'; g.lineWidth = 4; g.beginPath();                          // the court
    for (let i = 0; i <= 60; i++) { const a = i / 60 * TAU, q = P(Math.cos(a) * 240, 0, Math.max(zn, ZP + 60 + Math.sin(a) * 150)); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }
    for (const x of [-1000, 0, 1000]) { const a = P(x, 0, Math.max(zn, ZP - 220)), b = P(x, 0, ZP + 500); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
  },
  back() {
    const z = ZP + 520;
    box(0, 0, z, 2700, 600, 60, '#394456', '#252d3a');
    box(0, 0, z - 40, 2700, 110, 20, '#5a4028', '#3a2a1c', '#6a4c30');                               // wooden panelling along the bottom of the wall
    for (const s of [-1, 1]) box(s * 880, 0, z - 150, 520, 150, 170, '#2a3140', '#1b202a', '#3a4456');   // stands, folded away
    box(0, 290, z - 60, 230, 150, 10, '#e9e9ee', '#b9c3cc');                                         // the backboard, and its hoop
    const h = P(0, 300, z - 130), k = h[2];
    g.strokeStyle = '#ff7a30'; g.lineWidth = 6 * k; g.beginPath(); g.ellipse(h[0], h[1], 52 * k, 14 * k, 0, 0, TAU); g.stroke();
    for (const x of [-520, 520]) { const l = P(x, 520, z - 200); lit(() => E.glow(E.GLOW.white, l[0], l[1], 520 * l[2], .16)); }
  },
  front() {}
};

/* ---------- the docks of Tokyo No. 2: containers, cranes, and the bay ---------- */
const CONT = Array.from({ length: 18 }, (_, i) => [-1150 + (i % 9) * 290 + r() * 30, i < 9 ? 0 : 1, ['#7a2c2c', '#2c4a7a', '#3c6a4a', '#8a6a2a', '#4a4f5a'][r() * 5 | 0], i < 9 || r() < .6]);
const docks = {
  sky() {
    const HY = E.HY, VW = E.VW, T = E.T, gr = g.createLinearGradient(0, 0, 0, HY), off = cam.x * .05 + cam.yaw * 520;
    gr.addColorStop(0, '#04060d'); gr.addColorStop(.6, '#0f1c30'); gr.addColorStop(1, '#27405a');
    g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
    const mx = VW / 2 + 380 - off * .4;
    lit(() => E.glow(E.GLOW.white, mx, 110, 300, .3));
    g.fillStyle = '#e8eef8'; g.beginPath(); g.arc(mx, 110, 26, 0, TAU); g.fill();
    g.strokeStyle = '#0a0f18'; g.lineWidth = 7;                                                      // cranes on the far quay
    for (let i = -1; i < 4; i++) { const x = VW / 2 + i * 420 - 300 - off; seg(x, HY, x, HY - 250, x - 60, HY - 250, x + 190, HY - 250, x + 190, HY - 250, x + 190, HY - 190, x, HY - 250, x + 90, HY - 320, x + 90, HY - 320, x + 190, HY - 250); }
    g.fillStyle = '#0b1a2a'; g.fillRect(-80, HY - 30, VW + 160, 32);                                 // the bay
    g.fillStyle = 'rgba(200,225,255,.35)'; for (let i = 0; i < 16; i++) g.fillRect(((i * 211 + T * 14) % (VW + 200)) - 100, HY - 26 + (i % 5) * 5, 30 + (i % 3) * 16, 2);
  },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, '#454c56'); gr.addColorStop(.3, '#22262c'); gr.addColorStop(1, '#08090b');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    g.strokeStyle = 'rgba(240,200,60,.45)'; g.lineWidth = 4; g.beginPath();
    for (const z of [ZP - 120, ZP + 200]) { const a = P(-1200, 0, Math.max(zn, z)), b = P(1200, 0, Math.max(zn, z)); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
  },
  back() {
    const z = ZP + 500, T = E.T;
    for (const c of CONT) if (c[3]) {                                                                // containers, two high
      box(c[0], c[1] * 132, z, 280, 128, 150, c[2], shade(c[2], .6), shade(c[2], 1.25));
      const a = P(c[0] - 140, c[1] * 132 + 128, z - 75), b = P(c[0] + 140, c[1] * 132, z - 75);
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.beginPath();
      for (let i = 1; i < 10; i++) { const x = a[0] + (b[0] - a[0]) * i / 10; g.moveTo(x, a[1]); g.lineTo(x, b[1]); }
      g.stroke();
    }
    for (const x of [-620, 620]) {                                                                   // flood lamps on masts
      box(x, 0, ZP + 320, 16, 420, 16, '#2b2f36', '#1a1d22');
      const l = P(x, 420, ZP + 320); lit(() => E.glow(E.GLOW.white, l[0], l[1], (420 + 20 * Math.sin(T * 3 + x)) * l[2], .5));
    }
  },
  front() { for (const x of [-760, -240, 300, 820]) box(x, 0, ZP - 200, 44, 50, 44, '#0c0d10', '#07080a', '#1b1d22'); }   // bollards along the edge of the quay
};

/* ---------- Shinjuku, the twenty-fourth of December: everybody gone, the lights left on, snow ---------- */
const towers = (() => {
  const c = document.createElement('canvas'); c.width = 3200; c.height = 440;
  const x = c.getContext('2d');
  for (let px = -40; px < 3200;) {
    const w = 80 + r() * 150, h = 150 + r() * 280;
    x.fillStyle = '#080b14'; x.fillRect(px, 440 - h, w, h);
    x.fillStyle = 'rgba(255,216,140,.75)';
    for (let wy = 440 - h + 14; wy < 430; wy += 16) for (let wx = px + 8; wx < px + w - 10; wx += 13) if (r() < .09) x.fillRect(wx, wy, 6, 8);
    x.fillStyle = '#ff3040'; x.fillRect(px + w / 2 - 2, 440 - h - 6, 4, 6);
    px += w * (.8 + r() * .5);
  }
  return c;
})();
const SNOW = Array.from({ length: 70 }, () => [(r() * 2 - 1) * 1300, r() * 700, -200 + r() * 760, 30 + r() * 50, r() * TAU]);
const shinjuku = {
  sky() {
    const HY = E.HY, VW = E.VW, gr = g.createLinearGradient(0, 0, 0, HY), sl = VW / 2 - 1600 - cam.x * .1 - cam.yaw * 760;
    gr.addColorStop(0, '#03040a'); gr.addColorStop(.6, '#0c1226'); gr.addColorStop(1, '#2a2444');
    g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
    g.drawImage(towers, sl, HY - 438);
    lit(() => { for (let i = 0; i < 5; i++) E.glow(E.GLOW.purple, sl + 400 + i * 620, HY - 10, 520, .16); });
  },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, '#3a3d4c'); gr.addColorStop(.3, '#1d1f29'); gr.addColorStop(1, '#07080c');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    g.fillStyle = 'rgba(235,238,245,.34)';                                                           // the crossing
    for (let x = -1040; x <= 1040; x += 160) { const a = P(x - 40, 0, ZP + 330), b = P(x + 40, 0, ZP + 330), c = P(x + 40, 0, ZP + 150), d = P(x - 40, 0, ZP + 150); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); g.fill(); }
    const l0 = P(-1200, 0, Math.max(zn, ZP - 150)), l1 = P(1200, 0, Math.max(zn, ZP - 150));
    g.strokeStyle = 'rgba(235,238,245,.3)'; g.lineWidth = 5; g.setLineDash([60, 50]); g.beginPath(); g.moveTo(l0[0], l0[1]); g.lineTo(l1[0], l1[1]); g.stroke(); g.setLineDash([]);
  },
  back() {
    const z = ZP + 540, T = E.T;
    for (const [x, w, h] of [[-860, 620, 640], [820, 560, 600]]) {                                   // the two nearest towers
      box(x, 0, z, w, h, 260, '#141826', '#0c0f18', '#1f2538');
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { const wx = x - w / 2 + 50 + i * (w - 150) / 4, a = P(wx, 60 + j * 110, z), b = P(wx + 60, 130 + j * 110, z); g.fillStyle = (i * 3 + j * 5 + (x > 0 ? 2 : 0)) % 7 === 0 ? 'rgba(255,216,140,.8)' : '#07090f'; g.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]); }
    }
    for (const x of [-360, 360]) { box(x, 0, ZP + 360, 14, 330, 14, '#2b2f36', '#1a1d22'); const l = P(x, 330, ZP + 360); lit(() => E.glow(E.GLOW.white, l[0], l[1], 300 * l[2], .5)); }
    g.fillStyle = 'rgba(255,255,255,.85)';
    for (const s of SNOW) { const c = P(s[0] + Math.sin(T * .7 + s[4]) * 30, 700 - ((s[1] + T * s[3]) % 700), ZP + s[2]); g.beginPath(); g.arc(c[0], c[1], 3.2 * c[2], 0, TAU); g.fill(); }
  },
  front() {}
};
Object.assign(JU.chapters.STAGES, { gym: () => gym, docks: () => docks, shinjuku: () => shinjuku });

Object.assign(JU.story.WHO, {
  reggie: ['Receipt Man', 'レシート', '#f1eee2'], uro: ['Sky Captain', '空', '#b9a8ff'], ishigori: ['Granite Cannon', '砲', '#ffb060'], kashimo: ['Thunder God', '雷神', BOLT],
  hana: ['The Angel', '天使', '#ffe9a0'], yorozu: ['The Constructor', '万', ROSE], kenjaku2: ['The Stitched One', '縫い目', '#c9a53a']
});

JU.cast6 = { REGGIE, URO, ISHIGORI, KASHIMO, HANA, YOROZU, MEGUNA, GOJO2, gym, docks, shinjuku, get jackpot() { return jack; } };
})();
