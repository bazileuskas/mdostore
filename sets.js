/* JUJUTSU UNLIMITEDS — sets and cast for chapter 3: Sukuna's innate domain, the morgue, Shoko and Nobara */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, box = E.box, quad = E.quad, glow = E.glow, GLOW = E.GLOW, cam = E.cam, LINE = E.LINE, TOR = E.TOR;
const { lerp, ZP } = E, TAU = Math.PI * 2;
const line = (a, b) => { g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); };
let seed = 77;
const r = () => (seed = seed * 16807 % 2147483647) / 2147483647;

/* ================= Sukuna's innate domain: blood-dark water under the ribs of something vast ================= */
const BONE = '#d9d2bd';
function skull(x, y, z, s) {
  const q = P(x, y, z), k = q[2] * s;
  g.save(); g.translate(q[0], q[1]); g.scale(k, k);
  g.fillStyle = BONE; g.strokeStyle = LINE; g.lineWidth = 2.5;
  g.beginPath(); g.roundRect(-22, -42, 44, 32, 13); g.fill(); g.stroke();
  g.beginPath(); g.rect(-13, -13, 26, 12); g.fill(); g.stroke();
  g.fillStyle = '#150a0c'; g.fillRect(-14, -30, 10, 11); g.fillRect(4, -30, 10, 11); g.fillRect(-2, -18, 4, 6);
  g.beginPath(); for (let i = -9; i <= 9; i += 6) { g.moveTo(i, -12); g.lineTo(i, -2); } g.stroke();
  g.restore();
}
const PILE = [];
for (let i = 0; i < 46; i++) { const h = r(), w = 300 * (1 - h * .82); PILE.push([330 + (r() * 2 - 1) * w, h * 185, .9 + r() * .6]); }
PILE.sort((a, b) => b[1] - a[1]);          // top first, so the lower skulls overlap the ones above them

const domain = {
  sky() {
    const HY = E.HY, VW = E.VW, gr = g.createLinearGradient(0, 0, 0, HY);
    gr.addColorStop(0, '#040001'); gr.addColorStop(.6, '#1c0206'); gr.addColorStop(1, '#5a0a14');
    g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
  },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, '#6a0c18'); gr.addColorStop(.25, '#2a0409'); gr.addColorStop(1, '#0c0103');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    g.beginPath();                               // slow ripples drifting toward the camera
    for (let i = 0; i < 16; i++) { const z = E.ZNEAR + 30 + (i * 90 + 1440 - E.T * 26 % 1440) % 1440; line(P(cam.x - 2600, 0, z), P(cam.x + 2600, 0, z)); }
    g.strokeStyle = 'rgba(255,90,110,.1)'; g.lineWidth = 2; g.stroke();
  },
  back() {
    g.lineCap = 'round';
    for (let i = 5; i >= 0; i--) {               // ribs, pair after pair, arching overhead and away into the dark
      const z = ZP + [-170, 130, 460, 840, 1280, 1800][i], f = i / 5;
      g.strokeStyle = `rgb(${lerp(207, 60, f) | 0},${lerp(198, 20, f) | 0},${lerp(173, 26, f) | 0})`;
      for (const s of [-1, 1]) {
        g.beginPath();
        for (let j = 0; j <= 14; j++) {
          const u = j / 14, q = P(s * (940 - 800 * Math.pow(u, 1.6)), 800 * Math.sin(u * Math.PI / 2), z);
          if (j) g.lineTo(q[0], q[1]); else { g.moveTo(q[0], q[1]); g.lineWidth = 34 * q[2]; }
        }
        g.stroke();
      }
    }
    g.beginPath(); line(P(0, 815, ZP - 170), P(0, 815, ZP + 1800)); g.lineWidth = 16; g.strokeStyle = '#6b5a52'; g.stroke();   // the spine they hang from
    // the mound of skulls he sits on, with a horned one for a throne
    const a = P(-10, 0, ZP + 60);
    g.beginPath(); g.moveTo(a[0], a[1]);
    for (let j = 0; j <= 12; j++) { const u = j / 12, q = P(-10 + 680 * u, 200 * Math.pow(Math.sin(u * Math.PI), .7), ZP + 60); g.lineTo(q[0], q[1]); }
    g.closePath(); g.fillStyle = '#1a0a0c'; g.fill();
    g.strokeStyle = BONE;
    for (const s of [-1, 1]) {
      const h0 = P(330 + s * 40, 222, ZP + 70), h1 = P(330 + s * 200, 272, ZP + 70), h2 = P(330 + s * 170, 422, ZP + 70);
      g.lineWidth = 22 * h0[2]; g.beginPath(); g.moveTo(h0[0], h0[1]); g.quadraticCurveTo(h1[0], h1[1], h2[0], h2[1]); g.stroke();
    }
    g.lineCap = 'butt';
    for (const k of PILE) skull(k[0], k[1] + 22, ZP + 50, k[2]);
  },
  front() { for (const [x, s] of [[-780, 1.7], [-420, 1.3], [640, 1.6], [900, 1.2]]) skull(x, 10, ZP - 200, s); }
};

/* ================= the morgue under Jujutsu High ================= */
const ZW = ZP + 380, TX = 30;                    // back wall depth, and where the table stands
const morgue = {
  sky() { g.fillStyle = '#141a19'; g.fillRect(-80, -80, E.VW + 160, E.HY + 82); },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, '#7f948e'); gr.addColorStop(.4, '#566661'); gr.addColorStop(1, '#27302e');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    g.beginPath();
    for (let x = -1050; x <= 1050; x += 150) line(P(x, 0, zn), P(x, 0, ZW));
    for (let z = Math.ceil(zn / 150) * 150; z <= ZW; z += 150) line(P(-1050, 0, z), P(1050, 0, z));
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1.5; g.stroke();
  },
  back() {
    const zn = E.ZNEAR;
    quad(P(-1050, 0, ZW), P(1050, 0, ZW), P(1050, 660, ZW), P(-1050, 660, ZW)); g.fillStyle = '#93a8a2'; g.fill();   // tiled wall
    g.beginPath();
    for (let x = -1050; x <= 1050; x += 105) line(P(x, 0, ZW), P(x, 660, ZW));
    for (let y = 0; y <= 660; y += 82) line(P(-1050, y, ZW), P(1050, y, ZW));
    g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 1.5; g.stroke();
    for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) {                                                      // cold-storage doors
      const x = -665 + i * 190, y = 50 + j * 190;
      box(x, y, ZW - 10, 168, 168, 10, '#b7c3c4', '#7d8a8b');
      const h = P(x + 44, y + 84, ZW - 10), k = h[2];
      g.fillStyle = '#4c5657'; g.fillRect(h[0], h[1] - 5 * k, 28 * k, 10 * k);
    }
    for (const s of [-1, 1]) { quad(P(s * 1050, 0, zn), P(s * 1050, 0, ZW), P(s * 1050, 660, ZW), P(s * 1050, 660, zn)); g.fillStyle = '#62746f'; g.fill(); }
    // steel table, and the lamp hanging over it
    for (const dx of [-150, 150]) box(TX + dx, 0, ZP - 50, 14, 76, 100, '#8b9797', '#667171');
    box(TX, 74, ZP - 62, 344, 16, 124, '#c4cdcd', '#8b9797', '#e6eded');
    const l = P(TX, 470, ZP), t0 = P(TX - 250, 92, ZP), t1 = P(TX + 250, 92, ZP), top = P(TX, 700, ZP), k = l[2];
    g.strokeStyle = '#2a3231'; g.lineWidth = 8 * k; g.beginPath(); line(top, l); g.stroke();
    g.globalCompositeOperation = 'lighter';
    g.beginPath(); g.moveTo(l[0] - 46 * k, l[1]); g.lineTo(l[0] + 46 * k, l[1]); g.lineTo(t1[0], t1[1]); g.lineTo(t0[0], t0[1]); g.closePath();
    g.fillStyle = 'rgba(225,255,248,.13)'; g.fill();
    glow(GLOW.white || GLOW.blue, l[0], l[1], 320 * k, .8);
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#39423f'; g.beginPath(); g.ellipse(l[0], l[1] - 6 * k, 70 * k, 14 * k, 0, 0, TAU); g.fill();
  },
  front() {
    box(-720, 0, ZP - 190, 150, 60, 60, '#1a2120', '#101514', '#3a4644');
    box(760, 0, ZP - 190, 110, 44, 60, '#1a2120', '#101514', '#3a4644');
  }
};

/* ================= cast ================= */
function eyes(col, ry) {
  g.fillStyle = col;
  g.beginPath(); g.ellipse(5, 2, 2.8, ry, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(17, 2, 2.2, ry, 0, 0, TAU); g.fill();
}
const hem = () => { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(-30, -9, 60, 3); };
function hair(fill, pts) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
}

// Shoko Ieiri: the school doctor. White coat, long hair, has not slept
const SHOKO = {
  torso: ['#d5dade', '#f1f3f5'],
  armF: ['#d5dade', '#f1f3f5', '#e6c4a4', '#f3d7bb', .2], armB: ['#a9afb5', '#bfc5ca', '#b59479', '#c5a489', .2],
  legF: ['#262932', '#33374a', '#0e0e12', '#17171c', .16], legB: ['#181a21', '#21242e', '#08080b', '#0f0f13', .16],
  chest() {
    g.fillStyle = '#3a3f4d'; g.beginPath(); g.moveTo(6, -TOR); g.lineTo(30, -TOR); g.lineTo(30, -TOR + 34); g.closePath(); g.fill();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(8, -TOR, 2, TOR); hem();
  },
  back() { hair('#5a3d2c', [-34, -TOR - 26, -8, -TOR - 30, -6, -TOR + 26, -30, -TOR + 30]); },   // hair down her back
  head() {
    E.headBase('#e6c4a4', '#f3d7bb');
    hair('#5a3d2c', [-27, 14, -28, -22, -16, -32, 8, -33, 24, -24, 26, -12, 16, -15, 8, -9, -2, -15, -10, -8, -14, 12]);
    eyes('#2a1c14', 2.1);                         // half-lidded
    g.strokeStyle = '#8a6a5a'; g.lineWidth = 1.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(2, 7); g.lineTo(9, 7.6); g.moveTo(14, 7.6); g.lineTo(20, 7); g.stroke();   // shadows under them
    g.fillStyle = '#2a1c14'; g.beginPath(); g.arc(19, 10.5, 1.2, 0, TAU); g.fill();                     // mole
    g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.moveTo(9, 15.5); g.lineTo(15, 15.5); g.stroke(); g.lineCap = 'butt';
  }
};

// Nobara Kugisaki: first-year, straight from the countryside, afraid of nothing
const NOBARA = {
  torso: ['#1b2033', '#283050'],
  armF: ['#1b2033', '#283050', '#ecc7a6', '#f8dcc0', .24], armB: ['#10131f', '#181d30', '#bb9879', '#caa98a', .24],
  legF: ['#4a2f2a', '#5c3b34', '#14141a', '#1e1e26', .16], legB: ['#33201c', '#402823', '#0b0b0f', '#131318', .16],
  chest() { g.fillStyle = '#d9a441'; g.beginPath(); g.arc(21, -TOR + 27, 3.6, 0, TAU); g.fill(); },
  back() {                                        // skirt, drawn over the tops of the legs
    g.beginPath(); g.moveTo(-31, -10); g.lineTo(31, -10); g.lineTo(37, 30); g.lineTo(-37, 30); g.closePath();
    g.fillStyle = '#1b2033'; g.fill(); g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();
    g.fillStyle = '#283050'; g.fillRect(12, -8, 20, 36);
  },
  head() {
    E.headBase('#ecc7a6', '#f8dcc0');
    hair('#c0703a', [-28, 18, -30, -20, -18, -32, 6, -34, 24, -27, 28, -10, 27, 14, 21, 16, 22, -8, 14, -15, 6, -8, -3, -16, -12, -9, -16, 16]);   // bob
    eyes('#5a2f14', 4.2);
    g.strokeStyle = LINE; g.lineCap = 'round'; g.lineWidth = 2.3;
    g.beginPath(); g.moveTo(0, -5.5); g.lineTo(9, -4); g.moveTo(13, -4); g.lineTo(21, -6); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(8, 14); g.quadraticCurveTo(13, 18, 18, 13); g.stroke(); g.lineCap = 'butt';   // smirk
  }
};

// a heart, held in a hand. s pulses it.
function heart(x, y, s) {
  const c = F(x, y), k = c[2] * s;
  g.save(); g.translate(c[0], c[1]); g.scale(k, k);
  g.beginPath(); g.moveTo(0, 16); g.bezierCurveTo(-26, -4, -14, -24, 0, -10); g.bezierCurveTo(14, -24, 26, -4, 0, 16); g.closePath();
  g.fillStyle = '#c2182b'; g.fill(); g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();
  g.restore();
}

JU.sets = { domain, morgue, SHOKO, NOBARA, heart };
})();
