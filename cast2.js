/* JUJUTSU UNLIMITEDS — more cast: Nanami, Mahito, Jogo, Todo, Hanami, the Death Paintings, Naoya and Maki */
(() => {
'use strict';

const E = JU.eng, g = E.g, LINE = E.LINE, TOR = E.TOR, TAU = Math.PI * 2, Fi = JU.fights;
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.min(255, (n >> 16) * f) | 0},${Math.min(255, (n >> 8 & 255) * f) | 0},${Math.min(255, (n & 255) * f) | 0})`; };

// o: t/t2 torso, a/a2 sleeves (default: torso), h/h2 hands, l/l2 legs, s/s2 shoes, then chest / back / head drawing
function skin(o) {
  const a = o.a || o.t, a2 = o.a2 || o.t2;
  return {
    torso: [o.t, o.t2], armF: [a, a2, o.h, o.h2, .22], armB: [shade(a, .62), shade(a2, .62), shade(o.h, .78), shade(o.h2, .78), .22],
    legF: [o.l, o.l2, o.s, o.s2, .16], legB: [shade(o.l, .62), shade(o.l2, .62), shade(o.s, .62), shade(o.s2, .62), .16],
    chest: o.chest || (() => {}), back: o.back, head: o.head
  };
}
function eyes(col, ry, rx = 2.8) {
  g.fillStyle = col;
  g.beginPath(); g.ellipse(5, 2, rx, ry, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(17, 2, rx * .8, ry, 0, 0, TAU); g.fill();
}
function poly(fill, pts) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
}
const seg = (...p) => { g.beginPath(); for (let i = 0; i < p.length; i += 4) { g.moveTo(p[i], p[i + 1]); g.lineTo(p[i + 2], p[i + 3]); } g.stroke(); };
const SKIN = ['#e6c4a4', '#f3d7bb'];

const NANAMI = skin({ t: '#b5a585', t2: '#d0c1a2', h: SKIN[0], h2: SKIN[1], l: '#b5a585', l2: '#d0c1a2', s: '#3a2a20', s2: '#4c382b',
  chest() { g.fillStyle = '#5b83c4'; g.beginPath(); g.moveTo(8, -TOR); g.lineTo(30, -TOR); g.lineTo(30, -TOR + 40); g.closePath(); g.fill(); g.fillStyle = '#e0c040'; g.fillRect(22, -TOR + 6, 6, 40); },
  head() {                                        // hair parted seven to three, and the goggles
    E.headBase(SKIN[0], SKIN[1]);
    poly('#d9b45a', [-26, -4, -27, -24, -14, -31, 12, -30, 25, -22, 26, -12, 8, -14, -6, -19, -14, -8]);
    g.fillStyle = '#1a1a20'; g.fillRect(-2, -3, 26, 8);
    g.strokeStyle = LINE; g.lineWidth = 2; seg(9, 15, 15, 15);
  } });

const MAHITO = skin({ t: '#20222c', t2: '#2c2f3c', h: '#c9cfd8', h2: '#dfe4ea', l: '#20222c', l2: '#2c2f3c', s: '#0c0c10', s2: '#15151b',
  chest() { g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; seg(-30, -40, 30, -30); },
  back() { poly('#8e9bb8', [-30, -TOR - 20, -12, -TOR - 26, -8, -TOR + 44, -18, -TOR + 30, -26, -TOR + 50, -34, -TOR + 24]); },
  head() {                                        // a patchwork face held together with stitches
    E.headBase('#c9cfd8', '#dfe4ea');
    poly('#8e9bb8', [-28, 14, -30, -22, -18, -32, 6, -33, 24, -24, 27, -8, 18, -14, 8, -9, -2, -15, -12, -8, -16, 14]);
    eyes('#3a5a9a', 3.6);
    g.strokeStyle = '#3a3340'; g.lineWidth = 1.6; seg(-22, 6, 26, 2, 11, -8, 11, 24);
    for (let i = -18; i <= 22; i += 8) seg(i, 2, i + 1, 8);
    g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.arc(11, 12, 6, .2, 2.4); g.stroke();
  } });

const JOGO = skin({ t: '#191922', t2: '#24242f', h: '#c9c08a', h2: '#ddd4a0', l: '#191922', l2: '#24242f', s: '#c9c08a', s2: '#ddd4a0',
  chest() { g.fillStyle = '#c2a23a'; g.fillRect(-30, -TOR + 4, 60, 5); },
  head() {                                        // a volcano for a skull and one eye
    poly('#b8ae7a', [-20, -20, -12, -46, 12, -46, 20, -20]); g.fillStyle = '#ff7a2a'; g.fillRect(-9, -48, 18, 5);
    E.headBase('#c9c08a', '#ddd4a0');
    g.beginPath(); g.ellipse(10, -3, 11, 9, 0, 0, TAU); g.fillStyle = '#f4f1e6'; g.fill(); g.lineWidth = 2; g.strokeStyle = LINE; g.stroke();
    g.fillStyle = LINE; g.beginPath(); g.arc(12, -3, 4, 0, TAU); g.fill();
    g.fillRect(0, 11, 20, 3); for (let i = 2; i < 20; i += 5) g.fillRect(i, 9, 2, 7);
  } });

const TODO = skin({ t: '#c0906c', t2: '#d8a983', h: '#c0906c', h2: '#d8a983', l: '#1c1f2c', l2: '#282c3e', s: '#0c0c10', s2: '#15151b',
  chest() { g.strokeStyle = 'rgba(80,40,30,.6)'; g.lineWidth = 2.5; seg(-4, -62, 26, -40, 2, -30, 28, -30); },
  head() {
    E.headBase('#c0906c', '#d8a983');
    poly('#17141a', [-27, -6, -29, -24, -18, -30, -16, -46, -4, -34, 4, -50, 10, -33, 22, -26, 25, -12, 12, -15, 0, -12, -12, -14]);
    eyes(LINE, 3.4);
    g.strokeStyle = LINE; g.lineWidth = 2.6; seg(0, -7, 9, -4, 13, -4, 21, -7);
    g.strokeStyle = '#7a3b30'; g.lineWidth = 2; seg(-2, -12, 10, 10);                             // the scar
    g.strokeStyle = LINE; seg(8, 15, 17, 14);
  } });

const HANAMI = skin({ t: '#e2dfd0', t2: '#f4f2e6', a: '#3a2c3c', a2: '#4a3a4c', h: '#7a2a3a', h2: '#933446', l: '#e2dfd0', l2: '#f4f2e6', s: '#2a2224', s2: '#3a3033',
  chest() { g.fillStyle = '#12090c'; g.fillRect(-30, -52, 60, 4); g.fillRect(-30, -28, 60, 3); g.fillStyle = '#a5102a'; g.fillRect(6, -TOR, 6, TOR); },
  head() {                                        // branches growing where eyes should be
    E.headBase('#e2dfd0', '#f4f2e6');
    g.strokeStyle = '#6f5a38'; g.lineCap = 'round'; g.lineWidth = 7; seg(6, -2, 18, -40, 16, -2, 34, -30);
    g.lineWidth = 4; seg(14, -26, 4, -44, 28, -20, 40, -42); g.lineCap = 'butt';
    g.fillStyle = '#12090c'; g.fillRect(-2, 10, 24, 3); for (let i = 0; i < 22; i += 5) g.fillRect(i, 8, 2, 8);
  } });

const ESO = skin({ t: '#8a5a6a', t2: '#a36c7e', h: '#8a5a6a', h2: '#a36c7e', l: '#2a1c22', l2: '#38262e', s: '#0c0c10', s2: '#15151b',
  chest() { g.strokeStyle = '#12090c'; g.lineWidth = 6; seg(-30, -TOR, 30, 0, 30, -TOR, -30, 0); },
  head() {
    E.headBase('#8a5a6a', '#a36c7e');
    poly('#f0e6f0', [-6, -22, -4, -46, 6, -30, 10, -48, 14, -22]);
    eyes('#f4f1e6', 3.4); g.strokeStyle = LINE; g.lineWidth = 2; seg(8, 15, 18, 13);
  } });
const KECHIZU = skin({ t: '#5f8a4a', t2: '#76a65c', h: '#3d5c2e', h2: '#4c7139', l: '#4f743d', l2: '#628f4c', s: '#2a3d20', s2: '#34492a',
  chest() { g.fillStyle = '#2a0c10'; g.beginPath(); g.ellipse(8, -40, 20, 14, 0, 0, TAU); g.fill(); g.fillStyle = '#f4f1e6'; for (let i = -8; i < 26; i += 6) g.fillRect(i, -52, 4, 7); },
  head() { E.headBase('#5f8a4a', '#76a65c'); eyes('#12090c', 2, 2); g.fillStyle = '#2a0c10'; g.fillRect(-4, 8, 28, 9); g.fillStyle = '#e8718d'; g.fillRect(8, 12, 10, 12); } });

const WARPED = skin({ t: '#6a5a7a', t2: '#806e92', h: '#4a3d58', h2: '#5a4b6b', l: '#5a4c68', l2: '#6c5d7c', s: '#2a2233', s2: '#362c41',
  chest() { g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-30, -48, 60, 5); g.fillRect(-30, -24, 60, 4); },
  head() {                                        // what is left of a person
    E.headBase('#6a5a7a', '#806e92');
    g.fillStyle = '#f4f1d0'; g.beginPath(); g.ellipse(3, -6, 6, 8, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(17, 4, 4, 4, 0, 0, TAU); g.fill();
    g.fillStyle = LINE; g.fillRect(1, -8, 4, 5); g.fillRect(16, 3, 3, 3);
    g.strokeStyle = LINE; g.lineWidth = 2.5; seg(-2, 14, 8, 10, 8, 10, 20, 16);
  } });

const NAOYA = skin({ t: '#17161c', t2: '#24232c', h: '#ecc7a6', h2: '#f8dcc0', l: '#3a3d4a', l2: '#4a4e5e', s: '#e8e4d8', s2: '#f6f3ea',
  chest() {                                       // dark kimono, pale collar, sash
    g.fillStyle = '#e8e4d8'; g.beginPath(); g.moveTo(10, -TOR); g.lineTo(30, -TOR); g.lineTo(30, -TOR + 10); g.lineTo(14, -TOR + 44); g.lineTo(8, -TOR + 44); g.closePath(); g.fill();
    g.fillStyle = '#3a3d4a'; g.fillRect(-30, -16, 60, 7);
  },
  head() {                                        // bleached hair with the dark ends, and that look on his face
    E.headBase('#ecc7a6', '#f8dcc0');
    poly('#e2c060', [-27, -2, -29, -24, -17, -33, 6, -35, 24, -27, 28, -12, 20, -17, 12, -8, 5, -17, -3, -9, -10, -16, -16, -6]);
    g.fillStyle = '#1c1a1e'; g.beginPath(); g.moveTo(-27, -2); g.lineTo(-29, -14); g.lineTo(-18, -8); g.lineTo(-16, -6); g.closePath(); g.fill();
    g.fillStyle = LINE; g.beginPath(); g.ellipse(5, 2, 3.6, 1.7, -.2, 0, TAU); g.fill(); g.beginPath(); g.ellipse(17, 2, 3, 1.7, -.2, 0, TAU); g.fill();
    g.strokeStyle = LINE; g.lineCap = 'round'; g.lineWidth = 2.2; seg(0, -3, 9, -5.5, 13, -5.5, 21, -4);
    g.lineWidth = 2; g.beginPath(); g.arc(12, 11, 6, .5, 2.2); g.stroke(); g.lineCap = 'butt';
  } });

const MAKI = skin({ t: '#1c1e24', t2: '#2a2d36', a: '#d6b092', a2: '#e9c8ab', h: '#d6b092', h2: '#e9c8ab', l: '#2c3038', l2: '#3b404b', s: '#0c0c10', s2: '#15151b',
  back() {                                        // the sword across her back
    g.save(); g.translate(-14, -TOR + 6); g.rotate(-.5);
    g.fillStyle = '#b9c3cc'; g.fillRect(-4, -78, 8, 114); g.fillStyle = '#5a1420'; g.fillRect(-6, 36, 12, 26);
    g.lineWidth = 2.5; g.strokeStyle = LINE; g.strokeRect(-4, -78, 8, 114); g.restore();
  },
  head() {
    E.headBase('#d6b092', '#e9c8ab');
    g.fillStyle = 'rgba(150,70,60,.5)'; g.fillRect(8, -20, 16, 22); g.fillRect(-10, 6, 16, 12);   // burn scars
    poly('#1f3a2a', [-27, 4, -29, -22, -18, -32, 6, -34, 24, -26, 27, -12, 18, -16, 9, -9, 0, -16, -9, -9, -15, -14, -17, 4]);
    eyes('#3a2c14', 3.4);
    g.strokeStyle = LINE; g.lineCap = 'round'; g.lineWidth = 2.4; seg(0, -6, 9, -4, 13, -4, 21, -6.5);
    g.lineWidth = 2; seg(9, 15.5, 16, 15.5); g.lineCap = 'butt';
  } });

/* ---------- how each of them fights ---------- */
const A = (pre, pose, wind, lunge, reach, dmg, kb, more) => Object.assign({ pre, pose, wind, lunge, reach, dmg, kb, stun: .45 }, more);
const SHOT = { far: 1, shot: 1 };
Object.assign(Fi.DEFS, {
  warped: { name: 'Transfigured Human', jp: '改造人間', skin: WARPED, hp: 70, scale: 1, speed: 190, range: 150, gap: [.6, 1.3], atk: [A('hookWind', 'hook', .5, 280, 170, 8, 320)] },
  warped2: { name: 'Transfigured Human', jp: '改造人間', skin: WARPED, hp: 100, scale: 1.2, speed: 160, range: 170, gap: [.6, 1.2],
    atk: [A('hookWind', 'hook', .5, 300, 190, 9, 360), A('crushWind', 'crush', .7, 320, 210, 14, 540, { lift: 520 })] },
  jogo: { name: 'Jogo', jp: '漏瑚', skin: JOGO, hp: 220, scale: 1, speed: 210, range: 190, gap: [.4, 1], human: true,
    atk: [A('hookWind', 'hook', .4, 380, 200, 9, 420), A('divWind', 'div', .6, 0, 0, 12, 480, Object.assign({ lift: 380 }, SHOT)), A('crushWind', 'crush', .65, 360, 220, 15, 600, { lift: 580 })] },
  mahito: { name: 'Mahito', jp: '真人', skin: MAHITO, hp: 240, scale: 1.02, speed: 230, range: 190, gap: [.4, 1], dr: .8, human: true,
    atk: [A('hookWind', 'hook', .4, 400, 230, 10, 440), A('divWind', 'div', .6, 0, 0, 11, 460, SHOT), A('kickWind', 'kick', .5, 420, 220, 12, 620, { lift: 560 })] },
  todo: { name: 'Aoi Todo', jp: '東堂葵', skin: TODO, hp: 210, scale: 1.2, speed: 220, range: 190, gap: [.45, 1], human: true,
    atk: [A('hookWind', 'hook', .42, 400, 210, 10, 460), A('crushWind', 'crush', .6, 380, 220, 15, 640, { lift: 560 }), A('kickWind', 'kick', .5, 420, 220, 12, 600, { lift: 480 })] },
  hanami: { name: 'Hanami', jp: '花御', skin: HANAMI, hp: 300, scale: 1.3, speed: 200, range: 210, gap: [.4, .95], dr: .55, poise: true,
    atk: [A('hookWind', 'hook', .45, 400, 240, 12, 480), A('divWind', 'div', .65, 0, 0, 13, 500, Object.assign({ lift: 400 }, SHOT)), A('crushWind', 'crush', .6, 380, 250, 17, 680, { lift: 600 })] },
  kechizu: { name: 'Kechizu', jp: '血塗', skin: KECHIZU, hp: 150, scale: .95, speed: 200, range: 170, gap: [.5, 1.1],
    atk: [A('hookWind', 'hook', .45, 340, 190, 9, 380), A('divWind', 'div', .6, 0, 0, 9, 380, SHOT)] },
  eso: { name: 'Eso', jp: '壊相', skin: ESO, hp: 230, scale: 1.15, speed: 230, range: 200, gap: [.4, 1], dr: .8,
    atk: [A('hookWind', 'hook', .4, 400, 220, 10, 440), A('divWind', 'div', .55, 0, 0, 11, 440, SHOT), A('kickWind', 'kick', .5, 420, 230, 13, 620, { lift: 560 })] },
  maki: { name: 'Maki Zenin', jp: '禪院真希', skin: MAKI, hp: 320, scale: 1.02, speed: 330, range: 240, gap: [.25, .7], dr: .7, human: true, blade: true,
    atk: [A('hookWind', 'hook', .3, 460, 270, 10, 480), A('dash', 'cross', .34, 1000, 320, 12, 640, { lift: 380 }), A('crushWind', 'crush', .5, 420, 280, 16, 700, { lift: 620 })] }
});

Object.assign(JU.story.WHO, {
  nanami: ['Kento Nanami', '七海建人', '#ffd27a'], mahito: ['Mahito', '真人', '#9db4ff'], jogo: ['Jogo', '漏瑚', '#ff8c50'], todo: ['Aoi Todo', '東堂葵', '#7ad7ff'],
  hanami: ['Hanami', '花御', '#7ddc6a'], eso: ['Eso', '壊相', '#c77dff'], kechizu: ['Kechizu', '血塗', '#8dff6a'], naoya: ['Naoya Zenin', '禪院直哉', '#ffd23d'], maki: ['Maki Zenin', '禪院真希', '#7ddc9a']
});

JU.cast2 = { NANAMI, MAHITO, JOGO, TODO, HANAMI, ESO, KECHIZU, WARPED, NAOYA, MAKI };
})();
