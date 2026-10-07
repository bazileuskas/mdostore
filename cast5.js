/* JUJUTSU UNLIMITEDS — the cast of chapters 17 to 21: Ogi and Mai Zenin and the clan's swordsmen, Panda, Hakari, Haba, Higuruma and The Arbiter,
   Maki as somebody to play, and four places: the pit, the fight club, the theatre and the courtroom inside Deadly Sentencing */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, box = E.box, quad = E.quad, F = E.F, cam = E.cam, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, B = JU.boss, X = JU.cast2;
const { rnd, lerp, clamp, ZP } = E, TAU = Math.PI * 2, { near } = JU.tech.tk;
const Z = JU.bossfx, FX_FIRE = '255,140,60', FX_GOLD = '255,210,61', FX_CYAN = '122,215,255', FX_PINK = '255,110,210', FX_STEEL = '232,240,255';      // (the Boss VFX update's pieces, and the colours its redraws here use)
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
const PALE = ['#e3c8ac', '#f3dcc3'], DARK = '#14131a', STEEL = '#e8f0ff', GREEN = '#7ddc9a', FLAME = '#ff8c50', GOLD = '#e2c060';
let seed = 131;
const r = () => (seed = seed * 16807 % 2147483647) / 2147483647;
const sword = (len, hilt) => {                      // a sheathed blade worn across the back
  g.save(); g.translate(-13, -TOR + 8); g.rotate(-.55);
  g.fillStyle = '#20222c'; g.fillRect(-4.5, -len, 9, len + 32); g.fillStyle = hilt; g.fillRect(-4, 32, 8, 26);
  g.lineWidth = 2.5; g.strokeStyle = LINE; g.strokeRect(-4.5, -len, 9, len + 32); g.restore();
};

/* ---------- skins ---------- */
const OGI = skin({ t: '#23262b', t2: '#33373e', h: PALE[0], h2: PALE[1], l: '#3c3a36', l2: '#4d4a45', s: '#e8e4d8', s2: '#f6f3ea',
  chest() { g.fillStyle = '#e8e4d8'; g.beginPath(); g.moveTo(8, -TOR); g.lineTo(30, -TOR); g.lineTo(30, -TOR + 12); g.lineTo(13, -TOR + 44); g.closePath(); g.fill(); g.fillStyle = '#6f2a2a'; g.fillRect(-30, -18, 60, 7); },
  back() { sword(84, '#6f2a2a'); },
  head() {                                          // hair dragged back into a knot, and a face that has been sour for decades
    poly(DARK, [-30, -26, -40, -40, -26, -44, -18, -30]);
    E.headBase(PALE[0], PALE[1]);
    poly(DARK, [-27, 0, -29, -22, -18, -32, 8, -33, 24, -24, 22, -15, 6, -19, -10, -15, -16, 0]);
    g.fillStyle = LINE; eye(5, 2, 3.2, 1.6); eye(17, 2, 2.8, 1.6);
    g.strokeStyle = LINE; g.lineWidth = 2.6; seg(0, -1, 9, -4, 13, -4, 21, -1);
    g.lineWidth = 2; seg(8, 16, 18, 14); g.strokeStyle = 'rgba(0,0,0,.3)'; seg(1, 9, 5, 14, 20, 9, 17, 14);
  } });
const MAI = skin({ t: '#1c1e2a', t2: '#2a2d3e', h: PALE[0], h2: PALE[1], l: '#15161d', l2: '#20222c', s: '#0c0c10', s2: '#15151b',
  chest() { g.fillStyle = '#c2a23a'; g.beginPath(); g.arc(20, -TOR + 26, 3.4, 0, TAU); g.fill(); g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(-30, -9, 60, 3); },
  head() {                                          // her sister's face, with the hair cut short
    E.headBase(PALE[0], PALE[1]);
    poly('#1f3a2a', [-28, 12, -30, -22, -18, -32, 6, -34, 24, -26, 27, -8, 19, -15, 9, -8, 0, -15, -9, -8, -15, -14, -16, 12]);
    g.fillStyle = '#3a2c14'; eye(5, 2, 2.8, 3.2); eye(17, 2, 2.3, 3.2);
    g.strokeStyle = LINE; g.lineWidth = 2; seg(9, 15.5, 16, 15.5);
  } });
const HEI = skin({ t: '#20242e', t2: '#2d3240', h: PALE[0], h2: PALE[1], l: '#2c3038', l2: '#3b404b', s: '#e8e4d8', s2: '#f6f3ea',
  chest() { g.fillStyle = '#e8e4d8'; g.beginPath(); g.moveTo(12, -TOR); g.lineTo(30, -TOR); g.lineTo(30, -TOR + 8); g.lineTo(16, -TOR + 36); g.closePath(); g.fill(); g.fillStyle = '#12151c'; g.fillRect(-30, -17, 60, 6); },
  back() { sword(78, '#3a3f52'); },
  head() {                                          // one of many: a cloth over the mouth and nothing to say
    E.headBase(PALE[0], PALE[1]);
    poly(DARK, [-27, -4, -29, -22, -18, -31, 8, -32, 24, -24, 25, -12, 8, -16, -8, -13, -16, -4]);
    g.fillStyle = '#20242e'; g.fillRect(-4, 7, 28, 14);
    g.fillStyle = LINE; eye(5, 0, 3.2, 1.7); eye(17, 0, 2.8, 1.7);
    g.strokeStyle = LINE; g.lineWidth = 2.4; seg(0, -4, 9, -5, 13, -5, 21, -4);
  } });
const INKY = ['#17171b', '#25252b'];
const PANDA = skin({ t: '#e6e5df', t2: '#fbfbf8', a: INKY[0], a2: INKY[1], h: INKY[0], h2: INKY[1], l: INKY[0], l2: INKY[1], s: INKY[0], s2: INKY[1],
  chest() { g.fillStyle = INKY[0]; g.fillRect(-30, -TOR, 60, 17); },
  head() {
    g.fillStyle = INKY[0]; g.lineWidth = 2.5; g.strokeStyle = LINE;
    for (const x of [-17, 15]) { g.beginPath(); g.arc(x, -24, 10, 0, TAU); g.fill(); g.stroke(); }
    E.headBase('#e6e5df', '#fbfbf8');
    g.fillStyle = INKY[0]; g.beginPath(); g.ellipse(4, 1, 6, 7.5, .35, 0, TAU); g.fill(); g.beginPath(); g.ellipse(18, 1, 5, 7.5, -.35, 0, TAU); g.fill();
    g.fillStyle = '#fff'; eye(5, 0, 1.8, 1.8); eye(17, 0, 1.6, 1.6);
    g.fillStyle = INKY[0]; g.fillRect(9, 9, 6, 4);
    g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.arc(12, 13, 5, .3, 2.8); g.stroke();
  } });
const HAKARI = skin({ t: '#22252e', t2: '#30343f', h: PALE[0], h2: PALE[1], l: '#1a1c22', l2: '#272a32', s: '#e9e9ee', s2: '#fafafc',
  chest() { g.fillStyle = '#d9d9de'; g.fillRect(8, -TOR, 12, TOR); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-30, -9, 60, 3); },   // the jacket hangs open
  head() {                                          // bleached hair cropped short, thin brows, a grin with money on its mind
    E.headBase(PALE[0], PALE[1]);
    poly('#d9cfae', [-27, -6, -29, -22, -22, -30, -16, -38, -8, -32, -2, -40, 6, -32, 14, -38, 20, -29, 26, -22, 26, -12, 16, -16, 4, -14, -8, -16, -18, -8]);
    g.fillStyle = LINE; eye(5, 1, 3, 2); eye(17, 1, 2.6, 2);
    g.strokeStyle = LINE; g.lineWidth = 1.6; seg(0, -5, 9, -6, 13, -6, 21, -5);
    g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.arc(12, 9, 7.5, .2, 2.5); g.stroke(); g.lineCap = 'butt';
  } });
const BARE = ['#d6b092', '#e9c8ab'];
const HABA = skin({ t: BARE[0], t2: BARE[1], h: BARE[0], h2: BARE[1], l: '#2c3a4a', l2: '#3a4a5c', s: BARE[0], s2: BARE[1],
  chest() { g.strokeStyle = 'rgba(80,40,30,.45)'; g.lineWidth = 2; seg(-2, -60, 24, -60, 0, -42, 24, -42, 12, -66, 12, -22); },
  head() {                                          // hair grown out into the two blades of a propeller
    g.save(); g.translate(0, -28); g.rotate(Math.sin(E.T * 30) * .5);
    poly('#2a2d36', [-52, -3, -6, -9, -6, 5]); poly('#2a2d36', [52, 3, 6, 9, 6, -5]); g.restore();
    E.headBase(BARE[0], BARE[1]);
    g.fillStyle = '#f4f1e6'; eye(5, 0, 5, 5); eye(17, 0, 4.4, 4.4);
    g.fillStyle = LINE; eye(6, 0, 2, 2); eye(18, 0, 1.8, 1.8);
    g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.arc(11, 10, 8, .15, 2.7); g.stroke();
  } });
const HIGURUMA = skin({ t: '#15161b', t2: '#22232b', h: PALE[0], h2: PALE[1], l: '#15161b', l2: '#22232b', s: '#0a0a0d', s2: '#131318',
  chest() {                                         // black suit, white shirt, a tie pulled loose
    g.fillStyle = '#e9e9ee'; g.beginPath(); g.moveTo(8, -TOR); g.lineTo(30, -TOR); g.lineTo(30, -TOR + 6); g.lineTo(19, -TOR + 40); g.closePath(); g.fill();
    g.fillStyle = '#3a3f52'; g.beginPath(); g.moveTo(19, -TOR + 2); g.lineTo(25, -TOR + 2); g.lineTo(23, -TOR + 36); g.lineTo(19, -TOR + 40); g.closePath(); g.fill();
    g.fillStyle = GOLD; g.beginPath(); g.arc(4, -TOR + 20, 3, 0, TAU); g.fill();                    // the badge he still wears
  },
  head() {                                          // hair combed back and coming loose, and the eyes of somebody who stopped sleeping
    E.headBase(PALE[0], PALE[1]);
    poly(DARK, [-27, 2, -29, -22, -18, -32, 6, -34, 24, -26, 26, -14, 14, -19, 2, -21, -10, -17, -16, 2]);
    g.strokeStyle = DARK; g.lineWidth = 2.5; g.lineCap = 'round'; seg(14, -19, 19, -6, 4, -20, 7, -9); g.lineCap = 'butt';
    g.fillStyle = 'rgba(60,50,90,.5)'; g.fillRect(1, 5, 9, 3); g.fillRect(13, 5, 8, 3);
    g.fillStyle = LINE; eye(5, 1, 3.2, 1.8); eye(17, 1, 2.8, 1.8);
    g.strokeStyle = LINE; g.lineWidth = 2; seg(8, 16, 17, 16);
  } });

/* ---------- how they fight ---------- */
const A = (pre, pose, wind, lunge, reach, dmg, kb, more) => Object.assign({ pre, pose, wind, lunge, reach, dmg, kb, stun: .45 }, more);
Object.assign(Fi.DEFS, {
  ogi: { name: 'Blazing Elder', jp: '炎刀', skin: OGI, hp: 240, scale: 1.04, speed: 300, range: 240, gap: [.3, .8], dr: .8, human: true, blade: true,
    atk: [A('hookWind', 'hook', .32, 460, 260, 10, 460), A('dash', 'cross', .34, 980, 310, 12, 620, { lift: 380 }), A('crushWind', 'crush', .5, 420, 280, 15, 700, { lift: 600 })] },
  hei: { name: 'Clan Swordsman', jp: '剣士', skin: HEI, hp: 80, scale: 1, speed: 260, range: 220, gap: [.5, 1.1], human: true, blade: true,
    atk: [A('hookWind', 'hook', .42, 420, 240, 8, 400), A('dash', 'cross', .45, 900, 300, 10, 560, { lift: 340 })] },
  kukuru: { name: 'Guard Captain', jp: '隊長', skin: HEI, hp: 150, scale: 1.14, speed: 280, range: 230, gap: [.4, .9], dr: .9, human: true, blade: true,
    atk: [A('hookWind', 'hook', .36, 440, 250, 10, 440), A('dash', 'cross', .38, 960, 310, 12, 600, { lift: 360 }), A('crushWind', 'crush', .55, 400, 270, 14, 680, { lift: 580 })] },
  panda: { name: 'Panda', jp: 'パンダ', skin: PANDA, hp: 230, scale: 1.25, speed: 220, range: 200, gap: [.45, 1], dr: .85, human: true,
    atk: [A('hookWind', 'hook', .42, 400, 220, 10, 460), A('crushWind', 'crush', .6, 380, 230, 15, 640, { lift: 560 }), A('kickWind', 'kick', .5, 420, 220, 12, 600, { lift: 480 })] },
  hakari: { name: 'Jackpot Gambler', jp: '博徒', skin: HAKARI, hp: 400, scale: 1.1, speed: 300, range: 220, gap: [.3, .8], dr: .6, human: true,
    atk: [A('hookWind', 'hook', .34, 460, 240, 12, 480), A('dash', 'cross', .34, 980, 300, 13, 620, { lift: 380 }), A('crushWind', 'crush', .5, 420, 250, 17, 720, { lift: 620 })] },
  haba: { name: 'Rotor Head', jp: '回転翼', skin: HABA, hp: 210, scale: 1.05, speed: 260, range: 200, gap: [.4, .95], human: true,
    atk: [A('hookWind', 'hook', .4, 420, 220, 9, 420), A('kickWind', 'kick', .48, 440, 230, 12, 600, { lift: 520 })] },
  higuruma: { name: 'The Judge', jp: '裁判官', skin: HIGURUMA, hp: 330, scale: 1.02, speed: 280, range: 240, gap: [.35, .85], dr: .75, human: true,
    atk: [A('hookWind', 'hook', .36, 440, 260, 10, 460), A('crushWind', 'crush', .55, 400, 280, 14, 680, { lift: 580 })] }
});
Fi.DEFS.higuruma2 = Object.assign({}, Fi.DEFS.higuruma);        // the same man, holding the sword his domain has just handed him

// Ogi: Blazing Courage. Fire run along the blade and thrown down the length of the yard
B.kit('ogi', { tech: 'Blazing Courage', col: FLAME, glow: 'fire', every: [2.2, 3.6], moves: [
  { name: 'Burning Edge', cd: 6, min: 260, wind: .5, pre: 'hookWind', dur: .5, run(o, p, A, t) {
    o.rate = 46; o.target = t < .3 ? POSE.hook : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.blast(); V.fire(o.x + o.face * 120, 10, 14); cam.shake = Math.max(cam.shake, 14);
    const f = o.face, sx = o.x + f * 150, sy = o.y + 150, an = f > 0 ? -.2 : Math.PI + .2;
    V.slash(sx, sy, an, 520, FLAME, 22); V.slash(sx, sy, an, 420, '#fff3c8', 8, .02);                 // the blade, and the fire he has run along it
    Z.flare(sx, sy, FX_FIRE, 420, .18); Z.flash(FX_FIRE, .12, .2); Z.dust(o.x, 5, -f);
    for (let i = 0; i < 14; i++) Z.emit(5, sx + rnd(-140, 140), sy + rnd(-80, 80), f * rnd(100, 600), rnd(0, 500), rnd(3, 6), rnd(.4, .8), i & 1 ? FX_FIRE : '255,225,130');
    B.wave(o.x + f * 80, f, 1300, 1150, { dmg: 12, kb: 420, lift: 380 }, FLAME);                      // it runs along the floor: jump it
    B.add({ life: 1150 / 1300, x: o.x + f * 80, n: 0, upd(h, dt) {                                    // and the floor it has crossed is left burning
      h.x += f * 1300 * dt; V.fire(h.x, 0, 2);
      if ((h.n += dt) > .1) { h.n = 0; const x = h.x; Z.decal('scorch', x, 70, FX_FIRE, 5, 0); B.add({ life: .9, upd(q, d2) { if (Math.random() < d2 * 24) V.fire(x + rnd(-40, 40), 0, 1); } }); }
    } });
  } },
  { name: 'Falling Blossom', cd: 6, min: 200, max: 580, wind: .36, pre: 'dash', dur: .6, run(o, p, A, t) {
    o.rate = 46;
    if (!A.s) { A.s = 1; A.dir = o.face; sfx.whoosh(); Z.dust(o.x, 6, -o.face); Z.flare(o.x + o.face * 60, o.y + 170, FX_FIRE, 240, .14); }
    if (t < .2) {                                   // drawn and through him in one movement
      o.target = POSE.dash; o.vx = Math.abs(o.x + A.dir * 60) < 940 ? A.dir * 2000 : 0;
      V.fire(o.x - A.dir * 30, 0, 1);               // the line of it he leaves down the yard
      if (!A.done && Math.abs(p.x - o.x) < 110) {
        A.done = 1; E.stop(.07); cam.shake = Math.max(cam.shake, 14);
        V.slash(p.x, p.y + 170, A.dir > 0 ? -.3 : Math.PI + .3, 620, FLAME, 20); V.slash(p.x, p.y + 170, A.dir > 0 ? -.3 : Math.PI + .3, 480, '#fff3c8', 8, .03); V.fire(p.x, 20, 10);
        Z.flare(p.x, p.y + 170, FX_FIRE, 460, .2); Z.flash(FX_FIRE, .14, .2); Z.boom(p.x, p.y + 150, 70, FX_FIRE, { n: 10, clean: true, flash: 0, shake: 0 });
        for (let i = 0; i < 18; i++) Z.emit(3, p.x + rnd(-60, 60), p.y + rnd(80, 260), rnd(-360, 360), rnd(60, 520), rnd(5, 9), rnd(.8, 1.4), i % 3 ? FX_FIRE : '255,190,200', { g: 420, dr: 1.2, vr: rnd(-9, 9), w: .55, rot: rnd(0, TAU) });      // the blossom: petals of it, burning as they fall
        B.burst(p.x, 200, { dmg: 12, kb: 420, lift: 380 }, 190, A.dir);
      }
      return;
    }
    o.face = p.x >= o.x ? 1 : -1; o.target = t < .4 ? POSE.cross : POSE.idle;
  } }
] });

// Panda: the gorilla core. A blow that carries straight through whatever is put in its way
B.kit('panda', { tech: 'Gorilla Mode', col: '#cfd8e0', every: [2.6, 4.2], moves: [
  { name: 'Drumming Beat', cd: 6, min: 120, max: 560, wind: .5, pre: 'crushWind', dur: .7, run(o, p, A, t) {
    const gap = (p.x - o.x) * o.face;
    o.rate = 44;
    if (A.done || t > .3) { o.target = A.done && t < A.at + .25 ? POSE.crush : POSE.idle; return; }
    o.target = POSE.dash; o.vx = gap > 170 ? o.face * 1100 : 0;
    if (gap > -30 && gap < 230) {
      A.done = 1; A.at = t; o.vx = 0; sfx.blast(); cam.shake = Math.max(cam.shake, 18);
      const bx = o.x + o.face * 130, bf = o.face;
      V.ring(bx, 160, 260, '#ffffff', .3); V.crack(o.x + o.face * 140, 280); V.rocks(bx, 0, 12); E.stop(.07);
      Z.flare(bx, 170, '255,255,255', 480, .2); Z.flash('255,255,255', .16, .15); Z.dust(bx, 12, bf); Z.decal('crater', bx, 150, '207,216,224', 8, 0);
      for (let i = 0; i < 3; i++) B.later(i * .09, () => { V.ring(bx + bf * i * 90, 170, 200 + i * 90, '#ffffff', .3); Z.shock(bx, 300 + i * 170, '255,255,255', .4, 12 - i * 3); cam.shake = Math.max(cam.shake, 14); });      // the beat of it: the blow lands once and is felt three times, each further in
      B.swing(o, 260, { dmg: 14, kb: 700, lift: 520 }, 190);
    }
  } }
] });

// Hakari: cursed energy rough enough to hurt just by being near it, and shutter doors out of his own domain
function shutters(x, t) {
  const u = Math.min(1, t / .55), gap = lerp(330, 0, u * u), a = t > .8 ? Math.max(0, 1 - (t - .8) / .2) : 1;
  g.globalAlpha = a;
  for (const s of [-1, 1]) {
    const c0 = F(x + s * (gap + 150), 330), c1 = F(x + s * gap, 0), w = c1[0] - c0[0], h = c1[1] - c0[1];
    const gr = g.createLinearGradient(c0[0], 0, c1[0], 0); gr.addColorStop(0, '#6c747e'); gr.addColorStop(.5, '#a9b2bd'); gr.addColorStop(1, '#7a828c');
    g.fillStyle = gr; g.fillRect(c0[0], c0[1], w, h);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.beginPath();
    for (let i = 1; i < 9; i++) { g.moveTo(c0[0], c0[1] + h * i / 9); g.lineTo(c1[0], c0[1] + h * i / 9); }
    g.stroke(); g.lineWidth = 3; g.strokeStyle = LINE; g.strokeRect(c0[0], c0[1], w, h);
    Z.lite(() => {                                  // the lights down its edge, the way a parlour's doors have them
      g.strokeStyle = `rgba(${FX_PINK},${.9 * a})`; g.lineWidth = 4; g.beginPath(); g.moveTo(c1[0], c0[1]); g.lineTo(c1[0], c1[1]); g.stroke();
      for (let i = 0; i < 7; i++) { g.fillStyle = `rgba(${(i + Math.floor(E.T * 12)) % 2 ? FX_CYAN : '255,236,120'},${a})`; g.fillRect(c1[0] - s * 10 - 4, c0[1] + h * (i + .5) / 7 - 4, 8, 8); }
      Z.glow(FX_PINK, c1[0], c0[1] + h / 2, 260, .35 * a);
    });
  }
  g.globalAlpha = 1;
}
B.kit('hakari', { tech: 'Rough Cursed Energy', col: '#7ad7ff', glow: 'blue', every: [2.2, 3.6], moves: [
  { name: 'Shutter Doors', cd: 7, max: 900, wind: .45, pre: 'manjiWind', dur: .6, run(o, p, A, t) {
    o.rate = 30; o.vx = 0; o.target = t < .4 ? POSE.manjiWind : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.charge();
    const x = clamp(p.x, -900, 900);                // they close where he was standing: be somewhere else
    B.mark(x, 150, .55, '#7ad7ff');
    B.add({ life: 1, draw: h => shutters(x, h.t), upd(h) {
      if (h.hit || h.t < .55) return;
      h.hit = 1; sfx.hit(true); cam.shake = Math.max(cam.shake, 24); V.ring(x, 160, 240, '#7ad7ff', .3); E.stop(.05);
      Z.flare(x, 170, FX_PINK, 520, .22); Z.flash(FX_CYAN, .14, .15); Z.shock(x, 420, FX_CYAN, .45, 12); Z.dust(x, 8);
      for (let i = 0; i < 26; i++) Z.emit(4, x + rnd(-20, 20), rnd(20, 320), rnd(-700, 700), rnd(100, 900), rnd(4, 7), 2, i % 3 ? '226,232,244' : '255,236,120', { g: 1900 });      // and the balls out of the machine, everywhere
      for (let i = 0; i < 14; i++) { const an = rnd(0, TAU), v = rnd(400, 1200); Z.emit(1, x, rnd(40, 300), Math.cos(an) * v, Math.sin(an) * v, rnd(2, 4), rnd(.2, .4), i & 1 ? '255,200,120' : '255,255,255', { g: 2000 }); }
      B.burst(x, 150, { dmg: 14, kb: 260, stun: .8 }, 330);
    } });
  } },
  { name: 'Rough Blow', cd: 5, min: 120, max: 600, wind: .42, pre: 'divWind', dur: .7, run(o, p, A, t) {
    const gap = (p.x - o.x) * o.face;
    o.rate = 46;
    if (A.done || t > .3) { o.target = A.done && t < A.at + .25 ? POSE.div : POSE.idle; return; }
    o.target = POSE.dash; o.vx = gap > 170 ? o.face * 1400 : 0;
    if (gap > -30 && gap < 230) {
      A.done = 1; A.at = t; o.vx = 0; sfx.blast(); cam.shake = Math.max(cam.shake, 20);
      const bx = o.x + o.face * 120, by = o.y + 170;
      V.sparks(bx, 170, 'blue', 14); V.ring(bx, 170, 220, '#7ad7ff', .3); V.crack(bx, 240); E.stop(.07);
      Z.flash(FX_CYAN, .16, .15); Z.shock(bx, 380, FX_CYAN, .4, 12); Z.dust(bx, 8, o.face); Z.decal('crater', bx, 140, FX_CYAN, 8, 0);
      for (let i = 0; i < 9; i++) { const an = rnd(-1.1, 1.1) + (o.face > 0 ? 0 : Math.PI), l = rnd(160, 420); Z.lightning(bx, by, bx + Math.cos(an) * l, Math.max(0, by + Math.sin(an) * l), i & 1 ? FX_CYAN : FX_PINK, rnd(.14, .28), 4, 1); }
      V.custom(.26, u => {                          // his cursed energy is rough: it lands like a file, not a fist
        const c = F(bx, by), k = c[2], R = 190 * k * (.4 + .6 * Math.min(1, u * 4)), al = 1 - u;
        Z.lite(() => {
          g.fillStyle = `rgba(${FX_CYAN},${.7 * al})`; g.beginPath();
          for (let i = 0; i < 26; i++) { const an = i / 26 * TAU, r = R * (i & 1 ? .45 : 1 + .25 * Math.sin(i * 7.3)); i ? g.lineTo(c[0] + Math.cos(an) * r, c[1] + Math.sin(an) * r) : g.moveTo(c[0] + Math.cos(an) * r, c[1] + Math.sin(an) * r); }
          g.closePath(); g.fill(); Z.glow('255,255,255', c[0], c[1], R * 1.6, al);
        });
      });
      B.swing(o, 260, { dmg: 16, kb: 760, lift: 560 }, 190);
    }
  } }
] });

// Haba: the propeller is not for show
B.kit('haba', { tech: 'Rotor', col: '#9fd8ff', every: [2.4, 4], moves: [
  { name: 'Rotor Dive', cd: 7, max: 900, wind: .4, pre: 'crushWind', dur: 1.1, run(o, p, A, t) {
    o.rate = 40;
    if (!A.s) { A.s = 1; A.x0 = o.x; A.x = clamp(p.x, -900, 900); sfx.whoosh(); B.mark(A.x, 180, .75, '#9fd8ff'); }
    if (t < .75) {                                  // up on the rotor, then down on the spot he marked
      const u = t / .75, up = Math.sin(Math.min(1, u * 1.6) * Math.PI / 2);
      o.ground = false; o.vy = 0; o.vx = 0; o.target = u < .6 ? POSE.jump : POSE.crush;
      o.x = lerp(A.x0, A.x, u * u); o.y = Math.max(3, u < .62 ? 360 * up : 360 * (1 - (u - .62) / .38));
      if (Math.random() < .5) V.puff('blue', o.x, o.y + 300, rnd(-200, 200), 0, 30, .2);
      if (!A.rot) { A.rot = 1; V.custom(.75, () => {       // the rotor itself: a disc of blur over his head with the blades showing through it
        const c = F(o.x, o.y + 330 * (o.scale || 1)), k = c[2], an = E.T * 46;
        Z.lite(() => { g.fillStyle = `rgba(${FX_STEEL},.22)`; g.beginPath(); g.ellipse(c[0], c[1], 190 * k, 34 * k, 0, 0, TAU); g.fill(); g.strokeStyle = `rgba(${FX_STEEL},.7)`; g.lineWidth = 3 * k; g.stroke(); });
        g.strokeStyle = LINE; g.lineWidth = 9 * k; g.lineCap = 'round';
        for (let i = 0; i < 3; i++) { const a2 = an + i * TAU / 3; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0] + Math.cos(a2) * 180 * k, c[1] + Math.sin(a2) * 30 * k); g.stroke(); }
        g.lineCap = 'butt';
      }); }
      for (let i = 0; i < 2; i++) Z.emit(1, o.x + rnd(-150, 150), o.y + rnd(60, 300), rnd(-120, 120), -rnd(500, 1000), rnd(1.5, 3), rnd(.15, .3), '200,230,255', { a: .6 });      // the air it is pushing down
      if (Math.random() < .5) Z.dust(o.x, 1, Math.random() < .5 ? 1 : -1);
      return;
    }
    if (!A.done) {
      A.done = 1; o.y = 0; o.ground = true; o.vy = 0; sfx.blast(); cam.shake = Math.max(cam.shake, 24); V.crack(A.x, 280); V.rocks(A.x, 0, 14);
      Z.dust(A.x, 14); Z.shock(A.x, 460, '159,216,255', .5, 12); Z.shock(A.x, 280, '255,255,255', .35, 6); Z.decal('crater', A.x, 180, '159,216,255', 8, 0); Z.flare(A.x, 80, '255,255,255', 360, .16);
      for (let i = 0; i < 16; i++) Z.emit(1, A.x, rnd(10, 60), (i & 1 ? 1 : -1) * rnd(600, 1400), rnd(0, 200), rnd(2, 4), rnd(.2, .4), '200,230,255', { a: .7 });
      B.burst(A.x, 190, { dmg: 13, kb: 560, lift: 520 }, 200);
    }
    o.target = t < .95 ? POSE.crush : POSE.idle; o.face = p.x >= o.x ? 1 : -1;
  } },
  { name: 'Rotor Blade', cd: 5, min: 360, wind: .45, pre: 'hookWind', dur: .5, run(o, p, A, t) {
    o.rate = 46; o.target = t < .3 ? POSE.hook : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.whoosh();                          // thrown flat: jump it, or dash through
    B.shot({ x: o.x + o.face * 90, y: o.y + 125, vx: o.face * 1350, r: 26, life: 1.4, a: { dmg: 10, kb: 480, stun: .5 }, hit: s => V.sparks(s.x, s.y, 'blue', 10), draw(s) {
      const c = F(s.x, s.y), k = c[2], a = E.T * 40;      // spinning too fast to see as a blade: a disc of it, with the three of them showing through
      Z.lite(() => { g.fillStyle = 'rgba(159,216,255,.3)'; g.beginPath(); g.ellipse(c[0], c[1], 78 * k, 22 * k, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2.5 * k; g.stroke(); Z.glow('159,216,255', c[0], c[1], 240 * k, .6); });
      g.lineCap = 'round';
      for (const [w, col] of [[9, LINE], [5, '#9fd8ff']]) { g.strokeStyle = col; g.lineWidth = w * k; for (let i = 0; i < 3; i++) { const a2 = a + i * TAU / 3; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0] + Math.cos(a2) * 70 * k, c[1] + Math.sin(a2) * 19 * k); g.stroke(); } }
      g.lineCap = 'butt';
      if (Math.random() < .7) Z.emit(1, s.x, s.y + rnd(-20, 20), -Math.sign(s.vx) * rnd(200, 600), rnd(-80, 80), rnd(1.5, 3), rnd(.15, .3), '200,230,255', { a: .7 });
    } });
  } }
] });

// Higuruma: a gavel that is whatever size and shape he needs. And, once the court has passed sentence, the Executioner's Sword
function gavel(x, t) {                              // the head of it, coming down the size of a car
  const y = lerp(760, 0, Math.min(1, t / .55) ** 2), c = F(x, y), k = c[2];
  g.save(); g.globalAlpha = t > .8 ? Math.max(0, 1 - (t - .8) / .2) : 1;
  g.fillStyle = '#6a2217'; g.strokeStyle = LINE; g.lineWidth = 3; g.lineJoin = 'round';
  g.beginPath(); g.rect(c[0] - 22 * k, c[1] - 1000 * k, 44 * k, 860 * k); g.fill(); g.stroke();
  g.translate(c[0], c[1] - 82 * k); g.rotate(Math.PI / 2);     // the same head the player's gavel has (judge.js), lying across the end of its handle
  JU.judge.head(164 * k, 380 * k, 4);
  g.restore();
}
const SMASH = { name: 'Gavel', cd: 6, max: 900, wind: .45, pre: 'crushWind', dur: .7, run(o, p, A, t) {
  o.rate = 30; o.vx = 0; o.target = t < .5 ? POSE.crushWind : POSE.crush;
  if (A.s) return;
  A.s = 1; sfx.charge();
  const x = clamp(p.x, -900, 900);
  B.mark(x, 180, .55, GOLD);
  B.add({ life: 1, draw: h => gavel(x, h.t), upd(h) {
    if (h.hit || h.t < .55) return;
    h.hit = 1; sfx.blast(); cam.shake = Math.max(cam.shake, 30); V.crack(x, 320); V.rocks(x, 0, 18); V.ring(x, 60, 300, GOLD, .4); E.stop(.06);
    Z.boom(x, 30, 140, FX_GOLD, { n: 18, clean: true, hot: '255,255,255' }); Z.pillar(x, 80, 560, FX_GOLD, .5); Z.shock(x, 560, FX_GOLD, .6, 14); Z.dust(x, 12); Z.decal('crater', x, 200, FX_GOLD, 9, 0);      // the court's order, and the floor that heard it
    B.burst(x, 190, { dmg: 14, kb: 500, lift: 600 }, 420);
  } });
} };
const SWEEP = { name: 'Order in Court', cd: 5, min: 150, max: 620, wind: .5, pre: 'hookWind', dur: .5, run(o, p, A, t) {
  o.rate = 46; o.target = t < .3 ? POSE.hook : POSE.idle;
  if (A.s) return;
  A.s = 1; sfx.whoosh();                            // the handle runs out as long as the room and comes round at shin height: jump it
  V.slash(o.x + o.face * 300, o.y + 70, o.face > 0 ? 0 : Math.PI, 700, GOLD, 22); V.slash(o.x + o.face * 300, o.y + 70, o.face > 0 ? 0 : Math.PI, 600, '#ffffff', 7, .03);
  Z.flare(o.x + o.face * 560, o.y + 70, FX_GOLD, 300, .16); Z.dust(o.x + o.face * 200, 6, o.face); Z.dust(o.x + o.face * 460, 6, o.face); Z.shock(o.x + o.face * 300, 420, FX_GOLD, .35, 7);
  for (let i = 0; i < 14; i++) Z.emit(1, o.x + o.face * rnd(60, 600), rnd(20, 90), o.face * rnd(200, 700), rnd(100, 600), rnd(2, 4), rnd(.2, .45), i & 1 ? FX_GOLD : '255,255,255', { g: 1800 });
  B.swing(o, 600, { dmg: 11, kb: 560, lift: 320 }, 100);
} };
B.kit('higuruma', { tech: 'Deadly Sentencing', col: GOLD, glow: 'gold', every: [2.3, 3.8], moves: [SMASH, SWEEP] });
B.kit('higuruma2', { tech: 'Death Penalty', col: GOLD, glow: 'gold', every: [2, 3.2], moves: [
  { name: "Executioner's Sword", cd: 6, min: 0, max: 760, wind: .85, pre: 'divWind', dur: .7,
    charge(o) { const w = B.fist(o, false); if (Math.random() < .9) V.mote(w[0], w[1], 'gold'); },
    run(o, p, A, t) {
      const gap = (p.x - o.x) * o.face;
      o.rate = 46;
      if (A.done || t > .34) { o.vx = 0; o.target = t < .55 ? POSE.div : POSE.idle; return; }
      if (!A.s) {
        A.s = 1; sfx.bf(); Z.dim(.7, .8); Z.flash(FX_GOLD, .2, .3);
        V.custom(.4, u => {                         // the sword the court handed him: a blade of nothing but light, and one touch of it is the sentence
          const c = F(o.x + o.face * 60, o.y + 185), k = c[2], f = o.face, L = 330 * k, al = u > .85 ? (1 - u) / .15 : 1;
          Z.lite(() => {
            Z.glow(FX_GOLD, c[0] + f * L * .5, c[1], 620 * k, .9 * al);
            g.fillStyle = `rgba(${FX_GOLD},${.8 * al})`; g.beginPath(); g.moveTo(c[0], c[1] - 20 * k); g.lineTo(c[0] + f * L, c[1]); g.lineTo(c[0], c[1] + 20 * k); g.closePath(); g.fill();
            g.fillStyle = `rgba(255,255,255,${al})`; g.beginPath(); g.moveTo(c[0], c[1] - 8 * k); g.lineTo(c[0] + f * L * .96, c[1]); g.lineTo(c[0], c[1] + 8 * k); g.closePath(); g.fill();
            g.fillRect(c[0] - 3 * k, c[1] - 34 * k, 6 * k, 68 * k);
          });
          if (Math.random() < .9) Z.emit(5, o.x + f * rnd(60, 380), o.y + 185 + rnd(-30, 30), -f * rnd(100, 500), rnd(-80, 160), rnd(3, 6), rnd(.3, .6), Math.random() < .5 ? FX_GOLD : '255,255,255');
        });
      }
      o.target = POSE.dash; o.vx = o.face * 1900;   // one touch is the sentence carried out: dash through it, or be in the air
      if (gap > -30 && gap < 230) { A.done = 1; o.vx = 0; if (B.swing(o, 260, { dmg: 9999, kb: 300, pierce: 1 }, 150)) { V.impact(.4, p.x, p.y + 150); Z.flash('255,255,255', .6, .5); Z.pillar(p.x, 120, 760, FX_GOLD, .9); Z.shock(p.x, 700, FX_GOLD, .8, 16); } }
    } },
  SMASH, SWEEP
] });

/* ---------- Maki, to play: no cursed energy at all, and what Mai left her ---------- */
const MOVES = {
  strikes: { name: 'Split Soul Katana', cd: 3, dur: .5, run(p, m, t) {
    p.rate = 46;
    if (!m.s) { m.s = 1; m.dir = p.face; sfx.whoosh(); }
    if (t < .16) {                                  // through it and out the other side
      p.target = POSE.dash; p.vx = m.dir * 1800;
      if (!m.done && E.tryHit(p, { reach: 150, dmg: 12, kb: 380, lift: 380, stop: .1, heavy: 1, col: STEEL })) { m.done = 1; V.slash(E.P2.x, E.P2.y + 170, m.dir > 0 ? -.3 : Math.PI + .3, 460, STEEL, 14); }
      return;
    }
    p.vx = 0; p.target = t < .34 ? POSE.cross : POSE.idle;
  } },
  crush: { name: 'Spear Throw', cd: 5, dur: .6, run(p, m, t) {
    p.vx = 0; p.rate = 44; p.target = t < .14 ? POSE.hookWind : t < .4 ? POSE.hook : POSE.idle;
    if (t < .14 || m.s) return;
    m.s = 1; sfx.whoosh();
    const f = p.face, x0 = p.x + f * 80, y = p.y + 170, o = near(p, 900), x1 = o ? o.x : x0 + f * 860;
    V.custom(.16, u => {
      const c = F(x0 + (x1 - x0) * u, y), k = c[2];
      g.lineCap = 'round'; g.strokeStyle = LINE; g.lineWidth = 9 * k; g.beginPath(); g.moveTo(c[0] - f * 150 * k, c[1]); g.lineTo(c[0] + f * 40 * k, c[1]); g.stroke();
      g.strokeStyle = '#5a1420'; g.lineWidth = 5 * k; g.stroke(); g.lineCap = 'butt';
      g.fillStyle = '#cfd8e0'; g.beginPath(); g.moveTo(c[0] + f * 86 * k, c[1]); g.lineTo(c[0] + f * 34 * k, c[1] - 11 * k); g.lineTo(c[0] + f * 34 * k, c[1] + 11 * k); g.closePath(); g.fill();
    });
    E.after(.14, () => { if (E.tryHit(p, { reach: 900, dmg: 13, kb: 560, stun: .7, stop: .1, heavy: 1, col: STEEL })) V.sparks(E.P2.x, E.P2.y + 170, 'fire', 10); });
  } },
  div: { name: 'Vanishing Step', cd: 7, dur: .7, run(p, m, t) {
    p.rate = 46; p.vx = 0;
    if (!m.s) {                                     // nothing to sense, so nothing to see coming: she is simply behind it
      m.s = 1; sfx.whoosh();
      const o = near(p, 900);
      if (o) { const f = p.face; V.ring(p.x, p.y + 150, 160, GREEN, .25); p.x = clamp(o.x + f * 140, -950, 950); p.face = -f; }
    }
    if (t < .16) { p.target = POSE.crushWind; return; }
    p.target = t < .45 ? POSE.crush : POSE.idle;
    if (!m.done && t < .3 && E.tryHit(p, { reach: 240, dmg: 14, kb: 520, lift: 620, stop: .12, heavy: 1, col: STEEL })) { m.done = 1; V.slash(E.P2.x, E.P2.y + 180, p.face > 0 ? -1.2 : Math.PI + 1.2, 420, STEEL, 14); }
  } },
  manji: { name: 'Playful Cloud', cd: 10, dur: 1.05, run(p, m, t) {
    const n = Math.floor((t - .12) / .26);
    p.rate = 46;
    if (t < .12 || n > 2) { p.vx = 0; p.target = n > 2 ? POSE.idle : POSE.hookWind; return; }
    p.target = [POSE.hook, POSE.cross, POSE.crush][n]; p.vx = (t - .12) % .26 < .08 ? p.face * 420 : 0;
    if (n === m.n) return;
    m.n = n; sfx.whoosh();                          // three sections of red staff: it hits as hard as whoever swings it
    V.slash(p.x + p.face * 150, p.y + 170, (p.face > 0 ? 0 : Math.PI) + [-.5, .4, -1.2][n] * p.face, 380, '#ff5a6e', 15);
    if (E.tryHit(p, n === 2 ? { reach: 250, dmg: 16, kb: 900, lift: 500, stop: .16, heavy: 1, col: '#ff5a6e' } : { reach: 240, dmg: 7, kb: 90, stun: .6, stop: .06, col: '#ff5a6e' }) && n === 2) V.crack(E.P2.x, 260);
  } }
};
JU.tech.TECH.maki = { id: 'maki', name: 'Heavenly Restriction', jp: '天与呪縛', who: 'Heavenly Blade', odds: 0, col: GREEN, glow: 'green', moves: MOVES };   // not on the roll: the story hands it to her

/* ---------- the pit under the Zenin estate, where the clan keeps its curses and its failures ---------- */
const EYES = Array.from({ length: 22 }, () => [(r() * 2 - 1) * 1000, 60 + r() * 330, r() * TAU, 3 + r() * 4]);
const BONES = Array.from({ length: 26 }, () => [(r() * 2 - 1) * 1000, r() * 480, 20 + r() * 40, r() * 3]);
const pit = {
  sky() {
    const HY = E.HY, VW = E.VW, gr = g.createLinearGradient(0, 0, 0, HY), cx = VW / 2 - cam.x * .05 - cam.yaw * 500;
    gr.addColorStop(0, '#020304'); gr.addColorStop(1, '#0c1414');
    g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
    const sh = g.createLinearGradient(0, -80, 0, HY);                                              // the only light: the hole they were thrown in through
    sh.addColorStop(0, 'rgba(190,220,230,.34)'); sh.addColorStop(1, 'rgba(190,220,230,0)');
    g.fillStyle = sh; g.beginPath(); g.moveTo(cx - 90, -80); g.lineTo(cx + 90, -80); g.lineTo(cx + 380, HY); g.lineTo(cx - 380, HY); g.closePath(); g.fill();
  },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, '#1c2424'); gr.addColorStop(.3, '#0f1414'); gr.addColorStop(1, '#040606');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    g.strokeStyle = 'rgba(214,205,180,.5)'; g.lineCap = 'round';                                    // what is left of whoever was down here before
    for (const b of BONES) { const z = Math.max(E.ZNEAR, ZP - 240 + b[1]), a = P(b[0], 0, z), c = P(b[0] + Math.cos(b[3]) * b[2], 0, z + Math.sin(b[3]) * b[2]); g.lineWidth = 5 * a[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0], c[1]); g.stroke(); }
    g.lineCap = 'butt';
  },
  back() {
    const z = ZP + 520, T = E.T;
    box(0, 0, z, 2700, 620, 80, '#0d1212', '#080b0b');
    for (const x of [-980, -520, 60, 600, 1040]) box(x, 0, z - 120, 300, 180 + (x % 7) * 20, 160, '#131a1a', '#0b0f0f', '#1c2626');
    for (const e of EYES) {                                                                         // and what is still down here
      const c = P(e[0], e[1], z - 4), k = c[2], open = Math.sin(T * 1.3 + e[2]) > -.75;
      if (!open) continue;
      g.fillStyle = '#ff2440'; g.beginPath(); g.arc(c[0] - 9 * k, c[1], e[3] * k, 0, TAU); g.arc(c[0] + 9 * k, c[1], e[3] * k, 0, TAU); g.fill();
    }
  },
  front() { for (const [x, w, h] of [[-780, 200, 60], [-200, 120, 34], [460, 170, 50], [920, 130, 40]]) box(x, 0, ZP - 190, w, h, 60, '#050707', '#030404', '#101616'); }
};

/* ---------- Hakari's fight club: one level of a car park, a ring painted on the floor, and people who have paid to watch ---------- */
const CROWD = Array.from({ length: 34 }, (_, i) => [-1000 + i * 61 + r() * 20, 150 + r() * 40, r() * TAU, ['#20242e', '#2e2630', '#26302c', '#30281f'][i % 4]]);
const garage = {
  sky() {
    const HY = E.HY, VW = E.VW, gr = g.createLinearGradient(0, 0, 0, HY);
    gr.addColorStop(0, '#0b0c0f'); gr.addColorStop(1, '#22252b');
    g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
  },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, '#4a4d54'); gr.addColorStop(.35, '#2a2c32'); gr.addColorStop(1, '#101114');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    g.strokeStyle = 'rgba(240,200,60,.5)'; g.lineWidth = 4; g.beginPath();                          // parking bays
    for (let x = -1100; x <= 1100; x += 275) { const a = P(x, 0, ZP + 300), b = P(x, 0, ZP + 520); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
    g.strokeStyle = 'rgba(255,60,80,.6)'; g.lineWidth = 5; g.beginPath();                           // the ring
    for (let i = 0; i <= 60; i++) { const a = i / 60 * TAU, q = P(Math.cos(a) * 700, 0, Math.max(zn, ZP + 30 + Math.sin(a) * 250)); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }
    g.stroke();
  },
  back() {
    const z = ZP + 520, T = E.T;
    box(0, 0, z, 2700, 520, 60, '#2a2d34', '#1b1d22');
    for (let i = -4; i <= 4; i++) { const a = P(i * 300 - 100, 470, z - 120), b = P(i * 300 + 100, 470, z - 120), on = i !== -1 || Math.sin(T * 19) > 0;   // strip lights
      if (on) lit(() => E.glow(E.GLOW.white, (a[0] + b[0]) / 2, a[1] + 30, 420 * a[2], .2));
      g.strokeStyle = on ? '#f4f8ff' : '#3a3f48'; g.lineWidth = 5 * a[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    for (const c of CROWD) {                                                                        // the crowd, behind the barrier
      const y = Math.abs(Math.sin(T * 3 + c[2])) * 10, q = P(c[0], y, z - 70), k = q[2];
      g.fillStyle = c[3]; g.fillRect(q[0] - 26 * k, q[1] - c[1] * k, 52 * k, c[1] * k);
      g.fillStyle = '#0d0e11'; g.beginPath(); g.arc(q[0], q[1] - (c[1] + 22) * k, 22 * k, 0, TAU); g.fill();
    }
    box(0, 0, z - 110, 2700, 70, 20, '#3a3f48', '#22252b', '#4a505a');
    for (const x of [-820, -270, 270, 820]) {                                                       // pillars, striped where cars keep hitting them
      box(x, 0, ZP + 250, 90, 480, 90, '#3a3d44', '#24262b');
      for (let i = 0; i < 4; i++) { const a = P(x - 45, 40 + i * 30, ZP + 250), b = P(x + 45, 55 + i * 30, ZP + 250); g.fillStyle = i % 2 ? '#15161a' : '#e0b830'; g.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]); }
    }
  },
  front() { for (const x of [-700, 700]) box(x, 0, ZP - 200, 220, 46, 40, '#0c0d10', '#07080a', '#1b1d22'); }
};

/* ---------- the theatre Higuruma has taken for himself, and the courtroom his domain puts in its place ---------- */
function boards() {
  const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR, gr = g.createLinearGradient(0, HY, 0, VH);
  gr.addColorStop(0, '#6a4a30'); gr.addColorStop(.35, '#3a2718'); gr.addColorStop(1, '#120b07');
  g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
  g.strokeStyle = 'rgba(0,0,0,.32)'; g.lineWidth = 1.5; g.beginPath();
  for (let x = -1200; x <= 1200; x += 100) { const a = P(x, 0, zn), b = P(x, 0, ZP + 520); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  g.stroke();
}
const theatre = {
  sky() {
    const HY = E.HY, VW = E.VW, off = cam.x * .12 + cam.yaw * 700, gr = g.createLinearGradient(0, 0, 0, HY);
    gr.addColorStop(0, '#1c0406'); gr.addColorStop(1, '#5a0d14');
    g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
    for (let i = -2; i < VW / 70 + 3; i++) {                                                        // the folds of the curtain
      const x = i * 70 - (off % 70), fg = g.createLinearGradient(x, 0, x + 70, 0);
      fg.addColorStop(0, 'rgba(0,0,0,.34)'); fg.addColorStop(.5, 'rgba(255,120,120,.07)'); fg.addColorStop(1, 'rgba(0,0,0,.34)');
      g.fillStyle = fg; g.fillRect(x, -80, 70, HY + 82);
    }
    g.fillStyle = '#2a0508'; g.fillRect(-80, -80, VW + 160, 150);
    g.fillStyle = GOLD; g.fillRect(-80, 68, VW + 160, 5);
  },
  floor: boards,
  back() {
    const T = E.T;
    for (const x of [-700, 0, 700]) {                                                               // lamps hung over the stage
      const a = P(x, 520, ZP + 300), k = a[2];
      g.fillStyle = '#15161a'; g.fillRect(a[0] - 34 * k, a[1], 68 * k, 44 * k);
      lit(() => E.glow(E.GLOW.fire, a[0], a[1] + 60 * k, (560 + 30 * Math.sin(T * 3 + x)) * k, .3));
    }
    for (const s of [-1, 1]) box(s * 1100, 0, ZP + 200, 200, 620, 320, '#3a080d', '#22050a');       // the wings
  },
  front() {
    for (let i = -6; i <= 6; i++) {                                                                 // the first row of seats, backs to us
      const c = P(i * 170, 0, ZP - 235), k = c[2];
      g.fillStyle = '#16070a'; g.beginPath(); g.roundRect(c[0] - 56 * k, c[1] - 58 * k, 112 * k, 90 * k, 20 * k); g.fill();
    }
  }
};
let jaw = 0;                                        // the moment until which his mouth is open: he is saying something
// A judge who cannot be argued with. Not a man in a robe any more but what he is: a dark mass the shape of a pair of scales, hung in the air,
// with a long white mask for a face, its eyes sewn shut, and a pan on three chains at either end of him
function judgeman() {
  const T = E.T, z = ZP + 430, b = P(0, 96 + Math.sin(T * 1.1) * 14, z), k = b[2] * .7, x = b[0], y = b[1], tilt = Math.sin(T * .8) * .07, W = 430 * k, H = 520 * k;
  lit(() => E.glow(E.GLOW.white, x, y - H * .7, 1000 * k, .13));
  g.save(); g.translate(x, y);
  g.fillStyle = '#050507'; g.beginPath();           // broad across the top like the beam of a balance, and falling away to a point
  g.moveTo(-W, -H * .98); g.quadraticCurveTo(-W * .5, -H * 1.14, 0, -H * 1.1); g.quadraticCurveTo(W * .5, -H * 1.14, W, -H * .98);
  g.quadraticCurveTo(W * .8, -H * .58, W * .32, -H * .3); g.quadraticCurveTo(W * .1, -H * .12, 0, 0);
  g.quadraticCurveTo(-W * .1, -H * .12, -W * .32, -H * .3); g.quadraticCurveTo(-W * .8, -H * .58, -W, -H * .98);
  g.closePath(); g.fill();
  g.strokeStyle = 'rgba(214,208,192,.3)'; g.lineWidth = 1.2; g.beginPath();                          // fine pale lines combed out across the top of it
  for (let i = -11; i <= 11; i++) { const u = i / 12; g.moveTo(u * W * .42, -H * (1.09 - Math.abs(u) * .03)); g.quadraticCurveTo(u * W * .78, -H * .99, u * W * 1.02, -H * (.88 - Math.abs(u) * .12)); }
  g.stroke();
  g.strokeStyle = 'rgba(214,208,192,.16)'; g.beginPath();                                            // and folds lower down, running in to the point
  for (const u of [-.5, -.2, .2, .5]) { g.moveTo(u * W * .9, -H * .62); g.quadraticCurveTo(u * W * .4, -H * .3, 0, -H * .03); }
  g.stroke();
  g.strokeStyle = '#d9d2c0'; g.lineWidth = 2 * k; seg(0, 0, 0, 44 * k);                              // the plumb hanging from it
  g.fillStyle = '#d9d2c0'; g.beginPath(); g.moveTo(-7 * k, 44 * k); g.lineTo(7 * k, 44 * k); g.lineTo(0, 72 * k); g.closePath(); g.fill();
  const fy = -H * .82, fw = 60 * k, fh = 88 * k, fg = g.createLinearGradient(-fw, 0, fw, 0);         // the face
  fg.addColorStop(0, '#bdb6a6'); fg.addColorStop(.45, '#f1ede2'); fg.addColorStop(1, '#cfc8b8');
  g.fillStyle = fg; g.beginPath(); g.ellipse(0, fy, fw, fh, 0, 0, TAU); g.fill(); g.lineWidth = 2; g.strokeStyle = '#050507'; g.stroke();
  g.strokeStyle = 'rgba(60,50,45,.5)'; g.lineWidth = 1.6 * k; seg(0, fy - 8 * k, -4 * k, fy + 22 * k, -4 * k, fy + 22 * k, 5 * k, fy + 24 * k);
  g.strokeStyle = '#17100f'; g.lineWidth = 2.4 * k; g.lineCap = 'round';
  for (const s of [-1, 1]) {                        // eyes sewn shut
    const ex = s * 25 * k, ey = fy - 10 * k;
    g.fillStyle = 'rgba(40,20,20,.28)'; g.beginPath(); g.ellipse(ex, ey + 12 * k, 14 * k, 7 * k, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(ex - 15 * k, ey + 2 * k); g.quadraticCurveTo(ex, ey + 7 * k, ex + 15 * k, ey + 2 * k); g.stroke();
    g.beginPath(); for (let i = -2; i <= 2; i++) { g.moveTo(ex + i * 6 * k - 2 * k, ey - 6 * k); g.lineTo(ex + i * 6 * k + 2 * k, ey + 12 * k); } g.stroke();
  }
  g.lineCap = 'butt';
  if (jaw > T) {                                    // pronouncing
    g.fillStyle = '#17070a'; g.beginPath(); g.ellipse(0, fy + 50 * k, 20 * k, (16 + 6 * Math.sin(T * 22)) * k, 0, 0, TAU); g.fill();
    g.fillStyle = '#e9e2d2'; g.fillRect(-13 * k, fy + 37 * k, 26 * k, 5 * k);
  } else {                                          // full lips, shut
    g.fillStyle = '#6a3a38'; g.beginPath(); g.ellipse(0, fy + 48 * k, 17 * k, 6.5 * k, 0, 0, TAU); g.fill();
    g.strokeStyle = '#17100f'; g.lineWidth = 1.5 * k; seg(-17 * k, fy + 48 * k, 17 * k, fy + 48 * k);
  }
  g.restore();
  for (const s of [-1, 1]) {                        // the pans, never quite level
    const tx = x + s * W * .97, ty = y - H * .97, py = ty + (210 + s * tilt * 420) * k;
    g.strokeStyle = '#cfc7ae'; g.lineWidth = 1.6 * k + .6; seg(tx, ty, tx - 62 * k, py, tx, ty, tx + 62 * k, py, tx, ty, tx, py + 10 * k);
    g.fillStyle = '#8f8560'; g.beginPath(); g.ellipse(tx, py + 12 * k, 74 * k, 20 * k, 0, 0, Math.PI); g.fill();
    g.fillStyle = '#efe6c4'; g.beginPath(); g.ellipse(tx, py + 6 * k, 76 * k, 15 * k, 0, 0, TAU); g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#3a3220'; g.stroke();
    lit(() => E.glow(E.GLOW.gold, tx, py, 190 * k, .22));
  }
}
const court = {
  sky() {
    const HY = E.HY, VW = E.VW;
    g.fillStyle = '#020203'; g.fillRect(-80, -80, VW + 160, HY + 82);
    lit(() => E.glow(E.GLOW.gold, VW / 2 - cam.x * .05, HY - 320, VW * .9, .3));
  },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, '#2a2416'); gr.addColorStop(.3, '#0f0d09'); gr.addColorStop(1, '#020203');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    g.strokeStyle = 'rgba(226,192,96,.2)'; g.lineWidth = 2; g.beginPath();
    for (let x = -1200; x <= 1200; x += 200) { const a = P(x, 0, E.ZNEAR), b = P(x, 0, ZP + 520); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
  },
  back() {
    const T = E.T;
    judgeman();
    for (let i = -4; i <= 4; i++) {                                                                 // guillotines hung in a row, waiting on the verdict
      if (!i) continue;
      const sway = Math.sin(T * .9 + i) * 14, a = P(i * 250 + sway, 600, ZP + 300), b = P(i * 250 + sway, 430, ZP + 300), k = a[2];
      g.strokeStyle = 'rgba(226,192,96,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(a[0], a[1] - 400 * k); g.lineTo(b[0], b[1]); g.stroke();
      g.fillStyle = '#b9c3cc'; g.beginPath(); g.moveTo(b[0] - 70 * k, b[1]); g.lineTo(b[0] + 70 * k, b[1]); g.lineTo(b[0] + 70 * k, b[1] + 60 * k); g.lineTo(b[0] - 70 * k, b[1] + 130 * k); g.closePath(); g.fill();
      g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
    }
    for (const x of [-560, 560]) { box(x, 0, ZP + 150, 210, 150, 120, '#3a2718', '#22160d', '#5a4028'); box(x, 150, ZP + 146, 230, 14, 128, '#5a4028', '#3a2718', '#6a4c30'); }   // the two stands
  },
  front() {}
};
Object.assign(JU.chapters.STAGES, { pit: () => pit, garage: () => garage, theatre: () => theatre, court: () => court });

Object.assign(JU.story.WHO, {
  ogi: ['Blazing Elder', '炎刀', FLAME], mai: ['Bullet Maker', '構築', '#9ad0c0'], hei: ['Clan Swordsman', '剣士', '#9aa3b5'], panda: ['Panda', 'パンダ', '#e6e5df'],
  hakari: ['Jackpot Gambler', '博徒', '#7ad7ff'], haba: ['Rotor Head', '回転翼', '#9fd8ff'], higuruma: ['The Judge', '裁判官', GOLD], judgeman: ['The Arbiter', 'ジャッジマン', GOLD],
  kogane: ['Tally', '点', '#b9c3cc']
});

JU.cast5 = { OGI, MAI, HEI, PANDA, HAKARI, HABA, HIGURUMA, pit, garage, theatre, court, speak(sec) { jaw = E.T + sec; } };   // speak: The Arbiter's mouth opens for that long
})();
