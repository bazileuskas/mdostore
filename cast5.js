/* JUJUTSU UNLIMITEDS — the cast of chapters 17 to 21: Ogi and Mai Zenin and the clan's swordsmen, Panda, Hakari, Haba, Higuruma and Judgeman,
   Maki as somebody to play, and four places: the pit, the fight club, the theatre and the courtroom inside Deadly Sentencing */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, box = E.box, quad = E.quad, F = E.F, cam = E.cam, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, B = JU.boss, X = JU.cast2;
const { rnd, lerp, clamp, ZP } = E, TAU = Math.PI * 2, { near } = JU.tech.tk;
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
  ogi: { name: 'Ogi Zenin', jp: '禪院扇', skin: OGI, hp: 240, scale: 1.04, speed: 300, range: 240, gap: [.3, .8], dr: .8, human: true, blade: true,
    atk: [A('hookWind', 'hook', .32, 460, 260, 10, 460), A('dash', 'cross', .34, 980, 310, 12, 620, { lift: 380 }), A('crushWind', 'crush', .5, 420, 280, 15, 700, { lift: 600 })] },
  hei: { name: 'Zenin Swordsman', jp: '躯倶留隊', skin: HEI, hp: 80, scale: 1, speed: 260, range: 220, gap: [.5, 1.1], human: true, blade: true,
    atk: [A('hookWind', 'hook', .42, 420, 240, 8, 400), A('dash', 'cross', .45, 900, 300, 10, 560, { lift: 340 })] },
  kukuru: { name: 'Kukuru Captain', jp: '躯倶留隊長', skin: HEI, hp: 150, scale: 1.14, speed: 280, range: 230, gap: [.4, .9], dr: .9, human: true, blade: true,
    atk: [A('hookWind', 'hook', .36, 440, 250, 10, 440), A('dash', 'cross', .38, 960, 310, 12, 600, { lift: 360 }), A('crushWind', 'crush', .55, 400, 270, 14, 680, { lift: 580 })] },
  panda: { name: 'Panda', jp: 'パンダ', skin: PANDA, hp: 230, scale: 1.25, speed: 220, range: 200, gap: [.45, 1], dr: .85, human: true,
    atk: [A('hookWind', 'hook', .42, 400, 220, 10, 460), A('crushWind', 'crush', .6, 380, 230, 15, 640, { lift: 560 }), A('kickWind', 'kick', .5, 420, 220, 12, 600, { lift: 480 })] },
  hakari: { name: 'Kinji Hakari', jp: '秤金次', skin: HAKARI, hp: 400, scale: 1.1, speed: 300, range: 220, gap: [.3, .8], dr: .6, human: true,
    atk: [A('hookWind', 'hook', .34, 460, 240, 12, 480), A('dash', 'cross', .34, 980, 300, 13, 620, { lift: 380 }), A('crushWind', 'crush', .5, 420, 250, 17, 720, { lift: 620 })] },
  haba: { name: 'Haba', jp: '羽場', skin: HABA, hp: 210, scale: 1.05, speed: 260, range: 200, gap: [.4, .95], human: true,
    atk: [A('hookWind', 'hook', .4, 420, 220, 9, 420), A('kickWind', 'kick', .48, 440, 230, 12, 600, { lift: 520 })] },
  higuruma: { name: 'Hiromi Higuruma', jp: '日車寛見', skin: HIGURUMA, hp: 330, scale: 1.02, speed: 280, range: 240, gap: [.35, .85], dr: .75, human: true,
    atk: [A('hookWind', 'hook', .36, 440, 260, 10, 460), A('crushWind', 'crush', .55, 400, 280, 14, 680, { lift: 580 })] }
});
Fi.DEFS.higuruma2 = Object.assign({}, Fi.DEFS.higuruma);        // the same man, holding the sword his domain has just handed him

// Ogi: Blazing Courage. Fire run along the blade and thrown down the length of the yard
B.kit('ogi', { tech: 'Blazing Courage', col: FLAME, glow: 'fire', every: [2.2, 3.6], moves: [
  { name: 'Burning Edge', cd: 6, min: 260, wind: .5, pre: 'hookWind', dur: .5, run(o, p, A, t) {
    o.rate = 46; o.target = t < .3 ? POSE.hook : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.blast(); V.fire(o.x + o.face * 120, 10, 10); V.slash(o.x + o.face * 150, o.y + 150, o.face > 0 ? -.2 : Math.PI + .2, 420, FLAME, 14);
    B.wave(o.x + o.face * 80, o.face, 1300, 1150, { dmg: 12, kb: 420, lift: 380 }, FLAME);            // it runs along the floor: jump it
  } },
  { name: 'Falling Blossom', cd: 6, min: 200, max: 580, wind: .36, pre: 'dash', dur: .6, run(o, p, A, t) {
    o.rate = 46;
    if (!A.s) { A.s = 1; A.dir = o.face; sfx.whoosh(); }
    if (t < .2) {                                   // drawn and through him in one movement
      o.target = POSE.dash; o.vx = Math.abs(o.x + A.dir * 60) < 940 ? A.dir * 2000 : 0;
      if (!A.done && Math.abs(p.x - o.x) < 110) {
        A.done = 1; V.slash(p.x, p.y + 170, A.dir > 0 ? -.3 : Math.PI + .3, 460, FLAME, 14); V.fire(p.x, 20, 6);
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
      V.ring(o.x + o.face * 120, 160, 260, '#ffffff', .3); V.crack(o.x + o.face * 140, 240);
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
    g.fillStyle = '#8c949e'; g.fillRect(c0[0], c0[1], w, h);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.beginPath();
    for (let i = 1; i < 9; i++) { g.moveTo(c0[0], c0[1] + h * i / 9); g.lineTo(c1[0], c0[1] + h * i / 9); }
    g.stroke(); g.lineWidth = 3; g.strokeStyle = LINE; g.strokeRect(c0[0], c0[1], w, h);
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
      h.hit = 1; sfx.hit(true); cam.shake = Math.max(cam.shake, 20); V.ring(x, 160, 240, '#7ad7ff', .3);
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
      V.sparks(o.x + o.face * 110, 170, 'blue', 14); V.ring(o.x + o.face * 110, 170, 220, '#7ad7ff', .3);
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
      return;
    }
    if (!A.done) {
      A.done = 1; o.y = 0; o.ground = true; o.vy = 0; sfx.blast(); cam.shake = Math.max(cam.shake, 20); V.crack(A.x, 260); V.rocks(A.x, 0, 10);
      B.burst(A.x, 190, { dmg: 13, kb: 560, lift: 520 }, 200);
    }
    o.target = t < .95 ? POSE.crush : POSE.idle; o.face = p.x >= o.x ? 1 : -1;
  } },
  { name: 'Rotor Blade', cd: 5, min: 360, wind: .45, pre: 'hookWind', dur: .5, run(o, p, A, t) {
    o.rate = 46; o.target = t < .3 ? POSE.hook : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.whoosh();                          // thrown flat: jump it, or dash through
    B.shot({ x: o.x + o.face * 90, y: o.y + 125, vx: o.face * 1350, r: 26, life: 1.4, a: { dmg: 10, kb: 480, stun: .5 }, hit: s => V.sparks(s.x, s.y, 'blue', 10), draw(s) {
      const c = F(s.x, s.y), k = c[2], a = E.T * 40;
      g.strokeStyle = LINE; g.lineWidth = 9 * k; g.lineCap = 'round';
      g.beginPath(); g.moveTo(c[0] - Math.cos(a) * 62 * k, c[1] - Math.sin(a) * 16 * k); g.lineTo(c[0] + Math.cos(a) * 62 * k, c[1] + Math.sin(a) * 16 * k); g.stroke();
      g.strokeStyle = '#9fd8ff'; g.lineWidth = 5 * k; g.stroke(); g.lineCap = 'butt';
    } });
  } }
] });

// Higuruma: a gavel that is whatever size and shape he needs. And, once the court has passed sentence, the Executioner's Sword
function gavel(x, t) {                              // the head of it, coming down the size of a car
  const y = lerp(760, 0, Math.min(1, t / .55) ** 2), c = F(x, y), k = c[2];
  g.globalAlpha = t > .8 ? Math.max(0, 1 - (t - .8) / .2) : 1;
  g.fillStyle = '#3a2a1c'; g.strokeStyle = LINE; g.lineWidth = 3; g.lineJoin = 'round';
  g.beginPath(); g.rect(c[0] - 22 * k, c[1] - 1000 * k, 44 * k, 820 * k); g.fill(); g.stroke();
  g.fillStyle = '#5a4028'; g.beginPath(); g.rect(c[0] - 150 * k, c[1] - 190 * k, 300 * k, 190 * k); g.fill(); g.stroke();
  g.fillStyle = GOLD; g.fillRect(c[0] - 150 * k, c[1] - 150 * k, 300 * k, 16 * k); g.fillRect(c[0] - 150 * k, c[1] - 56 * k, 300 * k, 16 * k);
  g.globalAlpha = 1;
}
const SMASH = { name: 'Gavel', cd: 6, max: 900, wind: .45, pre: 'crushWind', dur: .7, run(o, p, A, t) {
  o.rate = 30; o.vx = 0; o.target = t < .5 ? POSE.crushWind : POSE.crush;
  if (A.s) return;
  A.s = 1; sfx.charge();
  const x = clamp(p.x, -900, 900);
  B.mark(x, 180, .55, GOLD);
  B.add({ life: 1, draw: h => gavel(x, h.t), upd(h) {
    if (h.hit || h.t < .55) return;
    h.hit = 1; sfx.blast(); cam.shake = Math.max(cam.shake, 24); V.crack(x, 300); V.rocks(x, 0, 12); V.ring(x, 60, 300, GOLD, .4);
    B.burst(x, 190, { dmg: 14, kb: 500, lift: 600 }, 420);
  } });
} };
const SWEEP = { name: 'Order in Court', cd: 5, min: 150, max: 620, wind: .5, pre: 'hookWind', dur: .5, run(o, p, A, t) {
  o.rate = 46; o.target = t < .3 ? POSE.hook : POSE.idle;
  if (A.s) return;
  A.s = 1; sfx.whoosh();                            // the handle runs out as long as the room and comes round at shin height: jump it
  V.slash(o.x + o.face * 300, o.y + 70, o.face > 0 ? 0 : Math.PI, 640, GOLD, 16);
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
      if (!A.s) { A.s = 1; sfx.bf(); V.custom(.34, () => { const c = F(o.x + o.face * 150, o.y + 185), k = c[2]; lit(() => E.glow(E.GLOW.gold, c[0], c[1], 420 * k, .9)); g.fillStyle = '#fff'; g.fillRect(c[0] - 150 * k, c[1] - 5 * k, 300 * k, 10 * k); }); }
      o.target = POSE.dash; o.vx = o.face * 1900;   // one touch is the sentence carried out: dash through it, or be in the air
      if (gap > -30 && gap < 230) { A.done = 1; o.vx = 0; if (B.swing(o, 260, { dmg: 9999, kb: 300, pierce: 1 }, 150)) V.impact(.4, p.x, p.y + 150); }
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
JU.tech.TECH.maki = { id: 'maki', name: 'Heavenly Restriction', jp: '天与呪縛', who: 'Maki Zenin', odds: 0, col: GREEN, glow: 'green', moves: MOVES };   // not on the roll: the story hands it to her

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
function judgeman() {                               // a judge who cannot be argued with: eyes sewn shut, the scales held out in front of him
  const T = E.T, z = ZP + 430, b = P(0, 0, z), k = b[2] * .72, x = b[0], y = b[1], tilt = Math.sin(T * .8) * .08;
  g.fillStyle = '#060608'; g.beginPath(); g.moveTo(x - 250 * k, y); g.lineTo(x - 150 * k, y - 470 * k); g.lineTo(x + 150 * k, y - 470 * k); g.lineTo(x + 250 * k, y); g.closePath(); g.fill();
  g.fillStyle = '#d9d2c0'; g.beginPath(); g.ellipse(x, y - 540 * k, 86 * k, 104 * k, 0, 0, TAU); g.fill();
  g.strokeStyle = '#060608'; g.lineWidth = 5 * k; g.beginPath();
  for (const s of [-1, 1]) { g.moveTo(x + s * 54 * k, y - 562 * k); g.lineTo(x + s * 18 * k, y - 556 * k); for (let i = 0; i < 3; i++) { g.moveTo(x + s * (26 + i * 10) * k, y - 572 * k); g.lineTo(x + s * (26 + i * 10) * k, y - 546 * k); } }
  g.moveTo(x - 30 * k, y - 486 * k); g.lineTo(x + 30 * k, y - 486 * k); g.stroke();
  g.fillStyle = '#060608'; g.fillRect(x - 96 * k, y - 664 * k, 192 * k, 46 * k);                    // the cap
  g.save(); g.translate(x, y - 380 * k); g.rotate(tilt);                                            // the scales
  g.strokeStyle = GOLD; g.lineWidth = 7 * k; g.beginPath(); g.moveTo(-330 * k, 0); g.lineTo(330 * k, 0); g.moveTo(0, -40 * k); g.lineTo(0, 30 * k); g.stroke();
  g.lineWidth = 3 * k;
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 330 * k, 0); g.lineTo(s * 380 * k, 130 * k); g.moveTo(s * 330 * k, 0); g.lineTo(s * 280 * k, 130 * k); g.stroke(); g.fillStyle = GOLD; g.beginPath(); g.ellipse(s * 330 * k, 134 * k, 66 * k, 14 * k, 0, 0, TAU); g.fill(); }
  g.restore();
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
  ogi: ['Ogi Zenin', '禪院扇', FLAME], mai: ['Mai Zenin', '禪院真依', '#9ad0c0'], hei: ['Zenin Swordsman', '躯倶留隊', '#9aa3b5'], panda: ['Panda', 'パンダ', '#e6e5df'],
  hakari: ['Kinji Hakari', '秤金次', '#7ad7ff'], haba: ['Haba', '羽場', '#9fd8ff'], higuruma: ['Hiromi Higuruma', '日車寛見', GOLD], judgeman: ['Judgeman', 'ジャッジマン', GOLD],
  kogane: ['Kogane', 'コガネ', '#b9c3cc']
});

JU.cast5 = { OGI, MAI, HEI, PANDA, HAKARI, HABA, HIGURUMA, pit, garage, theatre, court };
})();
