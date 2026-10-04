/* JUJUTSU UNLIMITEDS — the rest of the cast: Gojo, Megumi and Tokyo's passers-by */
(() => {
'use strict';

const E = JU.eng, g = E.g, TOR = E.TOR, LINE = E.LINE, TAU = Math.PI * 2;

const seg = (...p) => { g.beginPath(); for (let i = 0; i < p.length; i += 4) { g.moveTo(p[i], p[i + 1]); g.lineTo(p[i + 2], p[i + 3]); } g.stroke(); };
function poly(pts, fill) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
}
function eyes(col, ry) {
  g.fillStyle = col;
  g.beginPath(); g.ellipse(5, 2, 2.8, ry, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(17, 2, 2.2, ry, 0, 0, TAU); g.fill();
}
const button = () => { g.fillStyle = '#d9a441'; g.beginPath(); g.arc(21, -TOR + 27, 3.6, 0, TAU); g.fill(); };
const hem = () => { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(-30, -9, 60, 3); };
const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${Math.min(255, (n >> 16) * f) | 0},${Math.min(255, (n >> 8 & 255) * f) | 0},${Math.min(255, (n & 255) * f) | 0})`;
};

// limb colours: [side, front, tip side, tip front, tip length]
const GOJO = {
  torso: ['#14151e', '#20222f'],
  armF: ['#14151e', '#20222f', '#ecc7a6', '#f8dcc0', .2],
  armB: ['#0c0d13', '#14151d', '#bb9879', '#caa98a', .2],
  legF: ['#111219', '#1b1d28', '#07070a', '#101016', .16],
  legB: ['#0a0b10', '#111219', '#040406', '#0a0a0e', .16],
  chest() { g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(19, -TOR, 2, TOR); button(); hem(); },
  head() {
    E.headBase('#ecc7a6', '#f8dcc0');
    g.fillStyle = '#0b0b10'; g.fillRect(-24.5, -9, 49, 14);                                  // blindfold
    poly([-26, -8, -31, -30, -21, -26, -20, -48, -9, -33, -3, -53, 5, -34, 14, -49, 17, -31, 28, -38, 25, -8], '#f4f6fb');
    g.lineWidth = 2; g.lineCap = 'round'; g.strokeStyle = LINE;
    g.beginPath(); g.arc(11, 8, 6, .3, 2.2); g.stroke();                                     // easy grin
    g.lineCap = 'butt';
    g.beginPath(); g.roundRect(-22, 17, 46, 11, [0, 0, 8, 8]);                               // high collar
    g.fillStyle = '#14151e'; g.fill(); g.lineWidth = 2.5; g.stroke();
  }
};

const MEGUMI = {
  torso: ['#191c2c', '#252a42'],
  armF: ['#191c2c', '#252a42', '#e6c4a4', '#f3d7bb', .22],
  armB: ['#0f111c', '#171a2a', '#b59479', '#c5a489', .22],
  legF: ['#151826', '#1f2337', '#0b0b10', '#14141b', .18],
  legB: ['#0c0e17', '#131624', '#060609', '#0c0c11', .18],
  chest() {
    g.fillStyle = '#0f111c'; g.beginPath(); g.moveTo(6, -TOR); g.lineTo(30, -TOR); g.lineTo(30, -TOR + 12); g.closePath(); g.fill();
    button(); hem();
  },
  head() {
    E.headBase('#e6c4a4', '#f3d7bb');
    poly([-25, 6, -36, -4, -26, -10, -38, -24, -24, -24, -30, -42, -14, -31, -12, -50, -1, -33, 8, -48, 13, -31, 25, -41, 23, -24, 31, -22, 24, -12,
      19, -15, 14, -6, 8, -14, 3, -5, -4, -14, -10, -7, -16, -13, -18, 5], '#12131c');   // black spikes, every direction
    eyes('#16323a', 3.4);
    g.lineWidth = 2.2; g.lineCap = 'round'; g.strokeStyle = LINE;
    seg(1, -2.5, 9, -3.5, 13.5, -3.5, 21, -2.5);                                             // flat, unimpressed brows
    g.lineWidth = 2; seg(10, 15.5, 16, 15.5);
    g.lineCap = 'butt';
  }
};

// a passer-by; i picks the outfit
function civ(i) {
  const sh = ['#3b5b7a', '#7a3b4a', '#4a6b46', '#77683a', '#5a4a7a', '#39626b'][i % 6];
  const hair = ['#16141a', '#2a1c14', '#3a2b20', '#111418'][i % 4], skin = i % 3 ? '#e6c4a4' : '#d2a988', long = i % 2;
  return {
    torso: [sh, shade(sh, 1.25)],
    armF: [sh, shade(sh, 1.25), shade(skin, .94), skin, .3],
    armB: [shade(sh, .6), shade(sh, .75), shade(skin, .72), shade(skin, .8), .3],
    legF: ['#23252f', '#2f3240', '#15161c', '#1e2028', .16],
    legB: ['#15161d', '#1d1f28', '#0c0d11', '#131419', .16],
    chest: hem,
    head() {
      E.headBase(shade(skin, .92), skin);
      g.beginPath(); g.roundRect(-25, -26, 50, long ? 23 : 17, [12, 12, 3, 3]);
      g.fillStyle = hair; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
      if (long) { g.fillRect(-25, -6, 14, 26); }
      eyes(LINE, 3.6);
    }
  };
}

// relaxed standing / walking for anyone who is not in a fight
const STAND = [.02, 0, .1, -.06, .07, -.07, 0];
function stroll(f, moving, dt, speed = 1) {
  if (!f.wp) f.wp = STAND.slice();
  if (moving) {
    f.walk += dt * 9.5 * speed;
    const s = Math.sin(f.walk), w = f.wp;
    w[0] = .06 + .05 * speed; w[2] = -.55 * s; w[3] = .55 * s; w[4] = .6 * s; w[5] = -.6 * s;
    f.target = w; f.rate = 22;
  } else { f.target = STAND; f.rate = 12; }
  E.blend(f, dt);
}

JU.cast = { GOJO, MEGUMI, civ, STAND, stroll };
})();
