/* JUJUTSU UNLIMITEDS — Tokyo: one long block built out of boxes in real perspective */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, box = E.box, quad = E.quad, glow = E.glow, GLOW = E.GLOW, cam = E.cam, lerp = E.lerp;
const TAU = Math.PI * 2;

const LEN = 5400;                              // length of the block
const Z0 = 500, Z1 = 1340;                     // walkable depth: near pavement .. far pavement
const CURB1 = 790, CURB2 = 1240, BZ = 1380;    // the road lies between the kerbs; BZ is the building line
const AX0 = 4300, AX1 = 4560, AZ = 1900;       // the alley and how deep it runs
const SRC = [4430, 1650];                      // where the cursed energy is coming from
const gy = z => (z < CURB1 || z > CURB2 ? 12 : 0);   // pavements sit a step above the road
const CARS = [[900, '#c9ccd6', '#8a8d98'], [2500, '#8f1f2c', '#5d131c'], [3650, '#2a2c36', '#17181e']];
const LAMPS = [350, 1050, 1750, 2450, 3150, 3850, 4750], POLES = [300, 1400, 2500, 3600, 4700];
const WALKS = [[1500, 1720], [4320, 4540]], VEND = [620, 2050, 3300, 4680];

function free(x, z) {
  if (x < 80 || x > LEN - 80 || z < Z0) return false;
  if (z > Z1) return x > AX0 + 34 && x < AX1 - 34 && z < AZ - 130;      // only the alley goes deeper
  for (const c of CARS) if (Math.abs(x - c[0]) < 200 && z > 1090) return false;
  return true;
}

/* ---------- buildings ---------- */
const SIGNS = ['ラーメン', 'カラオケ', '居酒屋', 'ホテル', '喫茶', 'ゲーム', '寿司', '焼肉', '薬', '本'];
const WALLS = [['#1b2236', '#111626'], ['#2a2233', '#1a1522'], ['#20282c', '#14191c'], ['#2b2630', '#1b1820'], ['#1d2a3a', '#121b27']];
const NEON = ['#ff3d6e', '#38c8ff', '#ffd23d', '#8dff6a', '#c77dff'], WIN = ['#ffd98a', '#8fd6ff', '#ff9ec4'];
let seed = 5;
const r = () => (seed = seed * 16807 % 2147483647) / 2147483647;
const builds = [];
for (let x = -1700; x < LEN + 1700;) {
  if (x >= AX0 - 1 && x < AX1) { x = AX1; continue; }
  let w = 260 + r() * 300;
  if (x < AX0 && x + w > AX0 - 140) w = AX0 - x;                         // finish flush with the alley
  const h = 380 + r() * (r() < .3 ? 1100 : 520), cols = Math.max(2, Math.round(w / 86)), rows = Math.max(2, Math.floor((h - 190) / 92));
  const wins = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if (r() < .42) wins.push(i, j, r() < .7 ? 0 : r() < .6 ? 1 : 2);
  const wl = WALLS[r() * WALLS.length | 0];
  builds.push({ x, w, h, cols, wins, cf: wl[0], cs: wl[1], shop: NEON[r() * 5 | 0],
    sign: r() < .65 ? { t: SIGNS[r() * SIGNS.length | 0], c: NEON[r() * 5 | 0], y: 200 + r() * 120, side: r() < .5 ? .14 : .86 } : null });
  x += w;
}

function building(b) {
  const f = box(b.x + b.w / 2, 0, BZ, b.w, b.h, 520, b.cf, b.cs), a = f[0], bb = f[1], c = f[2], e = f[3];
  const X = (u, v) => lerp(lerp(a[0], bb[0], u), lerp(e[0], c[0], u), v), Y = (u, v) => lerp(lerp(a[1], bb[1], u), lerp(e[1], c[1], u), v);
  const rect = (u0, y0, u1, y1) => {            // a patch of the facade: across 0..1, up in world units
    const v0 = y0 / b.h, v1 = y1 / b.h;
    g.moveTo(X(u0, v0), Y(u0, v0)); g.lineTo(X(u1, v0), Y(u1, v0)); g.lineTo(X(u1, v1), Y(u1, v1)); g.lineTo(X(u0, v1), Y(u0, v1)); g.closePath();
  };
  g.beginPath(); rect(.06, 26, .94, 150); g.fillStyle = 'rgba(255,226,170,.82)'; g.fill();     // lit shopfront
  g.beginPath(); rect(.03, 150, .97, 178); g.fillStyle = b.shop; g.fill();                      // awning
  for (let ci = 0; ci < 3; ci++) {
    g.beginPath();
    for (let i = 0; i < b.wins.length; i += 3) if (b.wins[i + 2] === ci) {
      const u = b.wins[i] / b.cols, y = 214 + b.wins[i + 1] * 92;
      rect(u + .2 / b.cols, y, u + .8 / b.cols, y + 56);
    }
    g.fillStyle = WIN[ci]; g.fill();
  }
  if (b.sign) {                                  // neon sign box hanging out over the pavement
    const s = b.sign, n = s.t.length, sx = b.x + b.w * s.side;
    box(sx, s.y, BZ - 70, 46, n * 42 + 16, 70, s.c, 'rgba(0,0,0,.55)');
    g.fillStyle = '#14060b'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const q = P(sx, s.y + (n - i - .5) * 42 + 8, BZ - 70);
      g.font = `${34 * q[2] | 0}px 'Vessel Syuku','Yu Mincho',serif`; g.fillText(s.t[i], q[0], q[1]);
    }
  }
}

function buildings() {
  // outside-in, so nearer-to-centre fronts cover their neighbours' side walls
  const vis = builds.filter(b => b.x < cam.x + 2400 && b.x + b.w > cam.x - 2400)
    .sort((p, q) => Math.abs(q.x + q.w / 2 - cam.x) - Math.abs(p.x + p.w / 2 - cam.x));
  for (const b of vis) building(b);
  for (const x of VEND) {                        // vending machines
    box(x, 12, BZ - 46, 74, 150, 40, '#dfe7f5', '#7f8799');
    const a = P(x - 28, 140, BZ - 46), b = P(x + 28, 70, BZ - 46), c = P(x, 100, BZ - 46);
    g.fillStyle = '#26304c'; g.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
    g.globalCompositeOperation = 'lighter'; glow(GLOW.blue, c[0], c[1], 300 * c[2], .5); g.globalCompositeOperation = 'source-over';
  }
}

/* ---------- sky + ground ---------- */
function tower(x, base) {
  const h = 340;
  g.strokeStyle = '#c23a3a'; g.lineWidth = 2.5; g.beginPath();
  for (const s of [-1, 1]) { g.moveTo(x + s * 50, base); g.quadraticCurveTo(x + s * 10, base - h * .5, x + s * 4, base - h); }
  for (let i = 1; i < 9; i++) {
    const v = i / 9, w = 46 * (1 - v) ** 1.7 + 4, w2 = 46 * (1 - (i + 1) / 9) ** 1.7 + 4;
    g.moveTo(x - w, base - h * v); g.lineTo(x + w, base - h * v);
    if (i < 8) { g.moveTo(x - w, base - h * v); g.lineTo(x + w2, base - h * (i + 1) / 9); g.moveTo(x + w, base - h * v); g.lineTo(x - w2, base - h * (i + 1) / 9); }
  }
  g.moveTo(x, base - h); g.lineTo(x, base - h - 60); g.stroke();
  if (E.T % 1.6 < .8) { g.globalCompositeOperation = 'lighter'; glow(GLOW.red, x, base - h - 60, 46, 1); g.globalCompositeOperation = 'source-over'; }
}

function sky() {
  const HY = E.HY, VW = E.VW, pan = -(cam.x - LEN / 2) * .1 - cam.yaw * 760;
  let gr = g.createLinearGradient(0, 0, 0, HY);
  gr.addColorStop(0, '#05060f'); gr.addColorStop(.62, '#141737'); gr.addColorStop(1, '#4a2a5c');
  g.fillStyle = gr; g.fillRect(-300, -300, VW + 600, HY + 302);
  const mx = VW * .24 + pan * .3, my = Math.max(90, HY - 320);
  g.globalCompositeOperation = 'lighter'; glow(GLOW.blue, mx, my, 280, .3); g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#f3eedc'; g.beginPath(); g.arc(mx, my, 30, 0, TAU); g.fill();
  tower(VW * .5 + 420 + pan * .6, HY);
  g.drawImage(E.skyline, VW / 2 - 1600 + pan, HY - 298);
  gr = g.createLinearGradient(0, HY - 170, 0, HY);
  gr.addColorStop(0, 'rgba(255,120,160,0)'); gr.addColorStop(1, 'rgba(255,120,160,.28)');
  g.fillStyle = gr; g.fillRect(-300, HY - 170, VW + 600, 172);
}

const slab = (x0, x1, z0, z1, y) => { const a = P(x0, y, z0), b = P(x1, y, z0), c = P(x1, y, z1), d = P(x0, y, z1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); };

function ground() {
  const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR * .7, xa = cam.x - 3400, xb = cam.x + 3400;
  g.fillStyle = '#14141c'; g.fillRect(-300, HY, VW + 600, VH - HY + 300);                       // asphalt
  g.beginPath(); slab(xa, xb, CURB2, BZ + 700, 12); g.fillStyle = '#20202a'; g.fill();          // far pavement
  quad(P(xa, 12, CURB2), P(xb, 12, CURB2), P(xb, 0, CURB2), P(xa, 0, CURB2)); g.fillStyle = '#3a3a46'; g.fill();   // its kerb
  g.beginPath();                                                                                 // lane markings
  for (let x = Math.floor((cam.x - 3000) / 240) * 240; x < cam.x + 3000; x += 240) slab(x, x + 120, 1009, 1021, 0);
  slab(xa, xb, CURB1 + 24, CURB1 + 30, 0); slab(xa, xb, CURB2 - 30, CURB2 - 24, 0);
  g.fillStyle = 'rgba(232,232,240,.42)'; g.fill();
  g.beginPath();                                                                                 // zebra crossings
  for (const w of WALKS) for (let z = CURB1 + 44; z < CURB2 - 60; z += 72) slab(w[0], w[1], z, z + 38, 0);
  g.fillStyle = 'rgba(240,240,246,.74)'; g.fill();
  g.globalCompositeOperation = 'lighter';                                                        // lamplight on the road
  for (const x of LAMPS) {
    const p = P(x, 0, 1150);
    g.save(); g.translate(p[0], p[1]); g.scale(1, .3);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 330 * p[2]);
    gr.addColorStop(0, 'rgba(255,170,90,.26)'); gr.addColorStop(1, 'rgba(255,170,90,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 330 * p[2], 0, TAU); g.fill(); g.restore();
  }
  g.globalCompositeOperation = 'source-over';
  g.beginPath(); slab(xa, xb, zn, CURB1, 12); g.fillStyle = '#262631'; g.fill();                 // near pavement
  g.beginPath();                                                                                 // paving seams
  for (let x = Math.floor((cam.x - 2400) / 150) * 150; x < cam.x + 2400; x += 150) { const a = P(x, 12, zn), b = P(x, 12, CURB1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  for (const z of [430, 550, 670, CURB1 - 14]) { const a = P(xa, 12, z), b = P(xb, 12, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  g.strokeStyle = 'rgba(0,0,0,.34)'; g.lineWidth = 2; g.stroke();
}

function alley() {
  g.beginPath(); slab(AX0, AX1, BZ - 4, AZ, 12); g.fillStyle = '#121018'; g.fill();
  box((AX0 + AX1) / 2, 12, AZ, AX1 - AX0, 600, 30, '#0e0c14', '#0e0c14');
  const p = P(SRC[0] + 60, 50, SRC[1] + 110), fl = .7 + .3 * Math.sin(E.T * 5);                  // what is left of a curse
  g.globalCompositeOperation = 'lighter'; glow(GLOW.purple, p[0], p[1], 560 * p[2] * fl, .85); g.globalCompositeOperation = 'source-over';
}

/* ---------- things that share the walkable depth with people (drawn depth-sorted) ---------- */
function lamp(x) {
  box(x, 12, 1270, 14, 430, 14, '#2b2b36', '#1c1c24');
  box(x, 436, 1196, 14, 10, 88, '#2b2b36', '#1c1c24');
  const p = P(x, 428, 1200);
  g.globalCompositeOperation = 'lighter'; glow(GLOW.fire, p[0], p[1], 320 * p[2], .85); g.globalCompositeOperation = 'source-over';
}
function car(x, cf, cs) {
  for (const dx of [-108, 108]) box(x + dx, 0, 1128, 58, 36, 96, '#0b0b0e', '#060608');
  box(x, 18, 1130, 330, 60, 100, cf, cs, cf);
  box(x - 12, 78, 1142, 190, 50, 76, '#161c28', '#0e1219', cs);
  const a = P(x - 160, 52, 1130), b = P(x + 160, 50, 1130);
  g.globalCompositeOperation = 'lighter'; glow(GLOW.red, a[0], a[1], 70 * a[2], .9); glow(GLOW.fire, b[0], b[1], 80 * b[2], .7); g.globalCompositeOperation = 'source-over';
}
const props = [...LAMPS.map(x => ({ z: 1270, draw: () => lamp(x) })), ...CARS.map(c => ({ z: 1136, draw: () => car(c[0], c[1], c[2]) }))];

// utility poles and wires between the camera and the walkers
function front() {
  g.strokeStyle = '#0b0b0f'; g.lineWidth = 3;
  for (let i = 0; i < POLES.length - 1; i++) for (const y of [418, 384]) {
    const a = P(POLES[i], y, 440), b = P(POLES[i + 1], y, 440);
    g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 80, b[0], b[1]); g.stroke();
  }
  for (const x of POLES) { box(x, 12, 440, 28, 620, 28, '#15151b', '#0c0c10'); box(x, 404, 436, 170, 12, 12, '#15151b', '#0c0c10'); }
}

JU.tokyo = { LEN, Z0, Z1, BZ, AX0, AX1, AZ, SRC, gy, free, sky, ground, alley, buildings, props, front };
})();
