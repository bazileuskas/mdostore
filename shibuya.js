/* JUJUTSU UNLIMITEDS — the Map Update: SHIBUYA, and the subway that goes there.
   The Tokyo block of Free Exploration now has a subway entrance at its east end. Reach it having exorcised ten curses and finished Season 1
   and a route map asks where to. For now one stop is open, the nearest: Shibuya, on the night of the incident, under the curtain.
   It is laid out from the real place, west to east along one long street, about three times the length of the Tokyo block:
     Dogenzaka and its alley · Mark City and the Inokashira line's Avenue Exit (the mural in its passage) · Shibuya 109 · Center Gai ·
     the Scramble Crossing under QFRONT's screen · Hachiko Square (the statue, the old green train car) · Shibuya Station and the Yamanote
     viaduct · the Tokyu store the curtain is centred on · Scramble Square and its rooftop · Hikarie, with the Fukutoshin platform five floors
     under it · Miyashita Park and Nonbei Yokocho · Expressway Route 3, C Tower, and the tollgate where the wounded are taken.
   What happens where follows the Shibuya Incident: who is met in which place, and what is hiding there.
   In it: people to talk to (E), three raids (a run of fights with something worse at the end), five secret bosses, and curses on every block.
   Everything here that is not a real place or a thing from the series is ours: the lines people say, the rewards, the numbers */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, box = E.box, glow = E.glow, GLOW = E.GLOW, cam = E.cam, C = JU.cast, Fi = JU.fights, H = E.hooks, sfx = JU.sfx, T0 = JU.tokyo, S = JU.street;
const { lerp, clamp, rnd, TOR, LINE } = E, TAU = Math.PI * 2;
const dev = () => !!(JU.account && JU.account.dev);

/* ================= what is remembered ================= */
const M = { been: 0, last: 'tokyo', wins: 0, raids: {}, secrets: {}, bless: 0, hunt: 0 };
try { Object.assign(M, JSON.parse(localStorage.getItem('ju.map') || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem('ju.map', JSON.stringify(M)); } catch (e) {} };

/* ================= the lie of the land ================= */
const LEN = 15000, Z0 = 500, Z1 = 1340, CURB1 = 790, CURB2 = 1240, BZ = 1380;
// the places that can be walked into, off the main street: an alley, a square
const DEEP = [{ id: 'dalley', x0: 1300, x1: 1560, z1: 1950 }, { id: 'center', x0: 4300, x1: 4660, z1: 2350 }, { id: 'plaza', x0: 7400, x1: 8560, z1: 1980 }, { id: 'nonbei', x0: 12900, x1: 13150, z1: 2000 }];
const SCR = [5600, 7000], HACHI = [7780, 1640], FROG = [8140, 1500], STAIRS = [8380, 1840];      // the scramble crossing; the statue; the green train car; the way down to the line
const CARS = [[1900, '#e8c21a', '#a8880e'], [3900, '#2a2c36', '#17181e'], [9900, '#e8c21a', '#a8880e'], [12100, '#c9ccd6', '#8a8d98']];   // taxis, mostly
const LAMPS = [350, 1050, 1750, 2650, 3650, 4900, 7250, 8650, 9450, 10250, 11050, 11850, 12650, 13450];
const AREAS = [[0, 'Dogenzaka', '道玄坂'], [1980, 'Mark City · Avenue Exit', 'マークシティ'], [2700, 'Shibuya 109', '１０９前'], [3700, 'Center Gai', 'センター街'], [5100, 'Scramble Crossing', 'スクランブル交差点'],
  [7300, 'Hachikō Square', 'ハチ公前広場'], [8600, 'Shibuya Station', '渋谷駅'], [10150, 'Scramble Square', 'スクランブルスクエア'], [11200, 'Hikarie', 'ヒカリエ'], [12250, 'Miyashita Park', '宮下公園'], [13750, 'Expressway Route 3', '首都高三号線']];
const areaAt = x => AREAS.filter(a => x >= a[0]).pop();
const gy = z => (z < CURB1 || z > CURB2 ? 12 : 0);
function free(x, z) {
  if (x < 80 || x > LEN - 80 || z < Z0) return false;
  if (z > Z1) {
    const d = DEEP.find(a => x > a.x0 + 34 && x < a.x1 - 34);
    if (!d || z > d.z1 - 130) return false;
    return !(d.id === 'plaza' && ((Math.abs(x - HACHI[0]) < 70 && Math.abs(z - HACHI[1]) < 60) || (Math.abs(x - FROG[0]) < 215 && Math.abs(z - FROG[1]) < 56)));   // round the statue, round the train car
  }
  for (const c of CARS) if (Math.abs(x - c[0]) < 200 && z > 1090) return false;
  return true;
}

/* ---------- drawing helpers ---------- */
const slab = (x0, x1, z0, z1, y) => { const a = P(x0, y, z0), b = P(x1, y, z0), c = P(x1, y, z1), d = P(x0, y, z1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); };
const fill = (col, fn) => { g.beginPath(); fn(); g.fillStyle = col; g.fill(); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
// a patch of a box's front face: across 0..1, up in world units
const on = (f, hh) => {
  const a = f[0], b = f[1], c = f[2], e = f[3];
  const X = (u, v) => lerp(lerp(a[0], b[0], u), lerp(e[0], c[0], u), v), Y = (u, v) => lerp(lerp(a[1], b[1], u), lerp(e[1], c[1], u), v);
  return (u0, y0, u1, y1) => { const v0 = y0 / hh, v1 = y1 / hh; g.moveTo(X(u0, v0), Y(u0, v0)); g.lineTo(X(u1, v0), Y(u1, v0)); g.lineTo(X(u1, v1), Y(u1, v1)); g.lineTo(X(u0, v1), Y(u0, v1)); g.closePath(); };
};
const JP = "'Yuji Syuku','Yu Mincho',serif", EN = 'Anton, Impact, sans-serif';
function text(s, x, y, z, size, col, font) {
  const q = P(x, y, z), px = size * q[2];
  if (px < 5 || q[0] < -500 || q[0] > E.VW + 500) return;
  g.font = `${px | 0}px ${font || JP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, q[0], q[1]);
}
const beacon = (x, y, z, s) => { if (E.T % 1.6 < .8) { const q = P(x, y, z); lit(() => glow(GLOW.red, q[0], q[1], s * q[2], 1)); } };
// a video screen on a wall: it changes what it is showing every few seconds
function screen(r, cx, z, u0, y0, u1, y1, n) {
  const t = E.T * .3 + n * 1.7, ph = Math.floor(t) % 4, fr = t % 1, col = [['#0f2a5c', '#38c8ff'], ['#5c0f1c', '#ff3d6e'], ['#1c1030', '#c77dff'], ['#0b2b1c', '#8dff6a']][ph], w = u1 - u0;
  fill('#05060c', () => r(u0 - .012, y0 - 8, u1 + .012, y1 + 8)); fill(col[0], () => r(u0, y0, u1, y1));
  fill(col[1], () => { for (let i = 0; i < 3; i++) { const a = u0 + w * ((fr + i / 3) % 1); r(a, y0, Math.min(u1, a + w * .1), y1); } });
  const q = P(cx, (y0 + y1) / 2, z);
  lit(() => glow(ph === 1 ? GLOW.red : GLOW.blue, q[0], q[1], (y1 - y0) * 3.2 * q[2], .3));
  text(['呪', '祓', '帳', '宿'][ph], cx, (y0 + y1) / 2, z, (y1 - y0) * .72, 'rgba(255,255,255,.92)');
}

/* ---------- the landmarks, west to east ---------- */
function markCity() {
  const x = 2280, f = box(x, 0, BZ, 560, 560, 520, '#262a36', '#171a22'), r = on(f, 560), c = P(x, 348, BZ), k = c[2];
  fill('rgba(255,226,170,.8)', () => r(.05, 26, .95, 150)); fill('#3a3f52', () => r(0, 150, 1, 202));
  text('渋谷マークシティ ・ 井の頭線 アベニュー口', x, 176, BZ, 21, '#f4efe4');
  fill('#14080a', () => r(.05, 228, .95, 476)); fill('#a3122a', () => r(.07, 238, .93, 466));       // the long mural in the passage to the Inokashira line: red and black, and something white burning at the middle of it
  g.fillStyle = '#ffd23d';
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + .2; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0] + Math.cos(a) * 190 * k, c[1] + Math.sin(a) * 96 * k); g.lineTo(c[0] + Math.cos(a + .16) * 190 * k, c[1] + Math.sin(a + .16) * 96 * k); g.closePath(); g.fill(); }
  fill('#14080a', () => { for (let i = 0; i < 9; i++) r(.08 + i * .095, 238, .12 + i * .095, 270 + (i * 37 % 60)); });
  g.fillStyle = '#f4efe4'; g.beginPath(); g.arc(c[0], c[1] - 20 * k, 26 * k, 0, TAU); g.fill(); g.fillRect(c[0] - 7 * k, c[1], 14 * k, 70 * k);
}
function t109() {
  const x = 3200, f = box(x, 0, BZ, 480, 640, 520, '#2a2c38', '#191a22'), r = on(f, 640);
  fill('rgba(255,226,170,.82)', () => r(.06, 26, .94, 150)); fill('#ff3d6e', () => r(.03, 150, .97, 180));
  fill('rgba(255,217,138,.75)', () => { for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) if ((i * 3 + j * 5) % 4) r(.08 + i * .18, 220 + j * 100, .2 + i * .18, 280 + j * 100); });
  const cy = box(x, 0, BZ - 70, 196, 660, 196, '#aeb6c6', '#6f7686'), q = on(cy, 660);         // the drum on the corner: silver, and a little taller than the block behind it
  fill('rgba(255,255,255,.34)', () => q(.1, 0, .3, 660)); fill('rgba(10,14,26,.28)', () => q(.7, 0, 1, 660));
  fill('rgba(20,24,36,.45)', () => { for (let y = 190; y < 640; y += 76) q(0, y, 1, y + 8); });
  box(x, 660, BZ - 70, 240, 150, 60, '#f4f6fb', '#aab0c0');
  text('109', x, 736, BZ - 70, 120, '#d81f3c', EN);
  const t = P(x, 736, BZ - 70); lit(() => glow(GLOW.red, t[0], t[1], 620 * t[2], .3));
}
function qfront() {
  const x = 5480, f = box(x, 0, BZ, 560, 920, 520, '#1b2a3c', '#101a27'), r = on(f, 920);
  fill('rgba(170,220,255,.15)', () => { for (let y = 206; y < 890; y += 46) r(.02, y, .98, y + 30); });
  fill('rgba(255,226,170,.85)', () => r(.05, 26, .95, 150)); fill('#0e6b4a', () => r(.05, 150, .95, 198));
  text('珈琲 ・ 書店', x, 174, BZ, 27, '#f4efe4');
  screen(r, x, BZ, .09, 330, .91, 800, 1);
  text('QFRONT', x, 858, BZ, 46, '#eaf6ff', EN);
}
function station() {
  const x = 8930, f = box(x, 0, BZ + 40, 740, 620, 480, '#2c3140', '#1a1d28'), r = on(f, 620);
  fill('rgba(200,230,255,.5)', () => r(.04, 420, .96, 580));                                         // the Ginza line's hall, up on the third floor
  fill('#e8ecf4', () => r(.08, 300, .92, 384)); text('渋谷駅  SHIBUYA STATION', x, 342, BZ + 40, 36, '#1a1d28', EN);
}
function tokyu() {
  const x = 9700, f = box(x, 0, BZ + 40, 800, 840, 480, '#3a3540', '#221f27'), r = on(f, 840);
  fill('rgba(255,226,170,.8)', () => r(.04, 420, .96, 470));
  fill('rgba(255,217,138,.6)', () => { for (let i = 0; i < 9; i++) for (let j = 0; j < 2; j++) if ((i + j * 2) % 3) r(.05 + i * .1, 500 + j * 90, .12 + i * .1, 556 + j * 90); });
  fill('#f4efe4', () => r(.3, 700, .7, 796)); text('東急百貨店', x, 748, BZ + 40, 54, '#b3152f');
}
// the tracks, carried along in front of the station and the store, and what runs on them
function viaduct() {
  const x0 = 8560, x1 = 10200, z = BZ - 80, cx = (x0 + x1) / 2;
  for (let x = x0 + 130; x < x1; x += 270) box(x, 12, z + 40, 44, 290, 70, '#3a3d48', '#24262e');
  box(cx, 300, z, x1 - x0, 60, 150, '#4a4e5c', '#2c2f39', '#5a5f6e');
  const tx = lerp(x0 - 1900, x1 + 300, (E.T * .085) % 1);                                              // the Yamanote line: a train every twelve seconds
  for (let i = 0; i < 4; i++) {
    const c = tx + i * 410;
    if (c < x0 + 200 || c > x1 - 200) continue;
    const f = box(c, 372, z + 30, 396, 122, 90, '#c9ced8', '#8a8f9a'), r = on(f, 122);
    fill('#7fbf3f', () => r(0, 72, 1, 94)); fill('#ffe9a8', () => { for (let j = 0; j < 5; j++) r(.05 + j * .19, 34, .2 + j * .19, 66); });
  }
  box(cx, 360, z, x1 - x0, 24, 8, '#23252d', '#16171c');
}
function square() {
  const x = 10575, hh = 2700, f = box(x, 0, BZ, 600, hh, 560, '#22344a', '#131f2e'), r = on(f, hh);
  fill('rgba(150,200,255,.2)', () => { for (let y = 220; y < hh - 80; y += 58) r(.03, y, .97, y + 36); });
  fill('rgba(255,255,255,.1)', () => r(.03, 220, .2, hh - 80));
  fill('rgba(255,226,170,.85)', () => r(.05, 26, .95, 170)); fill('#eaf6ff', () => r(0, hh - 50, 1, hh));
  text('SHIBUYA SKY', x, hh - 120, BZ, 46, '#eaf6ff', EN); text('渋谷スクランブルスクエア', x, 198, BZ, 24, '#eaf6ff');
  beacon(x - 280, hh + 10, BZ, 90); beacon(x + 280, hh + 10, BZ, 90);
}
function hikarie() {
  const x = 11625;
  let y = 0, i = 0;
  for (const [w, h, col] of [[650, 520, '#2b3140'], [560, 430, '#3a4150'], [640, 360, '#283040'], [520, 560, '#353c4c']]) {       // boxes set one on another, none quite in line
    const f = box(x + (i++ % 2 ? 34 : -22), y, BZ, w, h, 500, col, '#161a22', '#4a5262'), r = on(f, h);
    fill('rgba(170,215,255,.2)', () => { for (let yy = 34; yy < h - 20; yy += 50) r(.03, yy, .97, yy + 30); });
    if (!y) { fill('rgba(255,226,170,.85)', () => r(.05, 26, .95, 150)); text('渋谷ヒカリエ ・ B5F 副都心線', x - 22, 180, BZ, 24, '#f4efe4'); }
    y += h;
  }
  const o = P(x + 30, 700, BZ);
  lit(() => glow(GLOW.fire, o[0], o[1], 520 * o[2], .55));                                             // the theatre, a lit ball seen through the glass
  text('Hikarie', x, 1760, BZ, 60, '#f4efe4', EN);
}
function miya(x0, x1) {
  const x = (x0 + x1) / 2, f = box(x, 0, BZ, x1 - x0, 330, 500, '#2a2d33', '#191b1f', '#1f3a28'), r = on(f, 330);
  fill('rgba(255,226,170,.8)', () => r(.03, 26, .97, 140)); fill('rgba(255,226,170,.42)', () => r(.03, 190, .97, 292));
  text('MIYASHITA PARK', x, 164, BZ, 28, '#f4efe4', EN);
  g.fillStyle = '#1f5a34';                                                                               // the park on its roof: hedges, and the hoops of the canopy over them
  for (let hx = x0 + 60; hx < x1 - 30; hx += 120) { const q = P(hx, 330, BZ + 40), k = q[2]; g.beginPath(); g.arc(q[0], q[1], 64 * k, Math.PI, TAU); g.fill(); }
  g.strokeStyle = '#8fe0a8'; g.lineWidth = 2;
  for (let hx = x0 + 90; hx < x1; hx += 180) { const a = P(hx - 84, 332, BZ), b = P(hx + 84, 332, BZ), c = P(hx, 560, BZ); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(c[0], c[1], b[0], b[1]); g.stroke(); }
}
function ctower() {
  const x = 14400, hh = 2350, f = box(x, 0, BZ + 60, 460, hh, 460, '#15171f', '#0b0c11'), r = on(f, hh);
  fill('rgba(255,217,138,.42)', () => { for (let i = 0; i < 7; i++) for (let j = 0; j < 30; j++) if ((i * 7 + j * 13) % 5 === 0) r(.06 + i * .13, 200 + j * 70, .15 + i * .13, 244 + j * 70); });
  box(x, hh, BZ + 60, 320, 14, 320, '#3a3d48', '#24262e', '#4a4e5c');                                   // the helipad
  const a = P(x, hh + 20, BZ + 200), b = P(x, hh + 1500, BZ + 200);
  lit(() => { for (let i = 0; i <= 8; i++) glow(GLOW.purple, lerp(a[0], b[0], i / 8), lerp(a[1], b[1], i / 8), (300 - i * 22) * a[2], .5 + .14 * Math.sin(E.T * 3 + i)); });   // where the curtain is held up from
  beacon(x, hh + 30, BZ + 60, 110); text('C TOWER', x, 230, BZ + 60, 30, '#8f96a8', EN);
}
const LM = [{ x0: 2000, x1: 2560, draw: markCity }, { x0: 2960, x1: 3440, draw: t109 }, { x0: 5200, x1: 5760, draw: qfront }, { x0: 8560, x1: 9300, draw: station },
  { x0: 9300, x1: 10100, draw: tokyu }, { x0: 10250, x1: 10900, draw: square }, { x0: 11280, x1: 11980, draw: hikarie }, { x0: 12300, x1: 12900, draw: () => miya(12300, 12900) },
  { x0: 13150, x1: 13700, draw: () => miya(13150, 13700) }, { x0: 14150, x1: 14650, draw: ctower }];

/* ---------- everything between them ---------- */
const SIGNS = ['カラオケ', 'ラーメン', '居酒屋', '古着', 'レコード', 'ゲーム', '寿司', '焼肉', '薬', '本', 'クラブ', '占い'];
const WALLS = [['#1b2236', '#111626'], ['#2a2233', '#1a1522'], ['#20282c', '#14191c'], ['#2b2630', '#1b1820'], ['#1d2a3a', '#121b27']];
const NEON = ['#ff3d6e', '#38c8ff', '#ffd23d', '#8dff6a', '#c77dff'], WIN = ['#ffd98a', '#8fd6ff', '#ff9ec4'];
let seed = 9;
const r0 = () => (seed = seed * 16807 % 2147483647) / 2147483647;
const RES = LM.map(l => [l.x0, l.x1]).concat(DEEP.map(d => [d.x0, d.x1])).sort((a, b) => a[0] - b[0]), builds = [];
for (let x = -1700; x < LEN + 1700;) {
  const inside = RES.find(q => x >= q[0] - 1 && x < q[1]);
  if (inside) { x = inside[1]; continue; }
  const next = RES.find(q => q[0] > x), room = next ? next[0] - x : 1e9;
  let w = 260 + r0() * 300;
  if (room - w < 150) w = room;                                                                         // finish flush with whatever comes next
  const tall = x > 4600 && x < 7500, h = 380 + r0() * (r0() < (tall ? .6 : .3) ? 1100 : 520), cols = Math.max(2, Math.round(w / 86)), rows = Math.max(2, Math.floor((h - 190) / 92)), wins = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if (r0() < .42) wins.push(i, j, r0() < .7 ? 0 : r0() < .6 ? 1 : 2);
  const wl = WALLS[r0() * WALLS.length | 0];
  builds.push({ x, w, h, cols, wins, cf: wl[0], cs: wl[1], shop: NEON[r0() * 5 | 0], scr: tall && h > 700 && w > 330 ? builds.length : 0,          // round the crossing the tall ones carry screens
    sign: r0() < .65 ? { t: SIGNS[r0() * SIGNS.length | 0], c: NEON[r0() * 5 | 0], y: 200 + r0() * 120, side: r0() < .5 ? .14 : .86 } : null,
    draw() { generic(this); } });
  x += w;
}
for (const l of LM) builds.push({ x: l.x0, w: l.x1 - l.x0, draw: l.draw });
function generic(b) {
  const f = box(b.x + b.w / 2, 0, BZ, b.w, b.h, 520, b.cf, b.cs), r = on(f, b.h);
  fill('rgba(255,226,170,.82)', () => r(.06, 26, .94, 150)); fill(b.shop, () => r(.03, 150, .97, 178));
  for (let ci = 0; ci < 3; ci++) fill(WIN[ci], () => { for (let i = 0; i < b.wins.length; i += 3) if (b.wins[i + 2] === ci) { const u = b.wins[i] / b.cols, y = 214 + b.wins[i + 1] * 92; r(u + .2 / b.cols, y, u + .8 / b.cols, y + 56); } });
  if (b.scr) screen(r, b.x + b.w / 2, BZ, .1, 250, .9, Math.min(b.h - 60, 640), b.scr);
  if (b.sign) {
    const s = b.sign, n = s.t.length, sx = b.x + b.w * s.side;
    box(sx, s.y, BZ - 70, 46, n * 42 + 16, 70, s.c, 'rgba(0,0,0,.55)');
    for (let i = 0; i < n; i++) text(s.t[i], sx, s.y + (n - i - .5) * 42 + 8, BZ - 70, 34, '#14060b');
  }
}
function buildings() {
  const vis = builds.filter(b => b.x < cam.x + 2600 && b.x + b.w > cam.x - 2600).sort((p, q) => Math.abs(q.x + q.w / 2 - cam.x) - Math.abs(p.x + p.w / 2 - cam.x));     // outside-in, so fronts nearer the middle cover their neighbours' side walls
  for (const b of vis) b.draw();
  if (cam.x > 5800 && cam.x < 12900) viaduct();
}

/* ---------- sky and ground ---------- */
function sky() {
  const HY = E.HY, VW = E.VW, pan = -(cam.x - LEN / 2) * .035 - cam.yaw * 760, T = E.T;
  let gr = g.createLinearGradient(0, 0, 0, HY);
  gr.addColorStop(0, '#020107'); gr.addColorStop(.6, '#0d0a24'); gr.addColorStop(1, '#3d1846');
  g.fillStyle = gr; g.fillRect(-300, -300, VW + 600, HY + 302);
  const mx = VW * .7 + pan * .3, my = Math.max(80, HY - 350), cx = VW / 2 + pan * .5;
  lit(() => glow(GLOW.purple, mx, my, 260, .22)); g.fillStyle = 'rgba(214,206,232,.5)'; g.beginPath(); g.arc(mx, my, 26, 0, TAU); g.fill();       // the moon, as much of it as gets through
  for (let i = 0; i < 4; i++) {                                                                         // the curtain: everything here is under it. Its inside shows as rings going up the sky
    g.strokeStyle = `rgba(150,110,255,${i ? .05 + .03 * Math.sin(T * .9 + i * 1.7) : .24})`; g.lineWidth = i ? 2 : 3;
    g.beginPath(); g.ellipse(cx, HY + 40, VW * (1.3 - i * .24), HY * (1.3 - i * .22), 0, Math.PI, TAU); g.stroke();
  }
  g.drawImage(E.skyline, VW / 2 - 1600 + pan * 2, HY - 298);
  gr = g.createLinearGradient(0, HY - 190, 0, HY);
  gr.addColorStop(0, 'rgba(255,90,170,0)'); gr.addColorStop(1, 'rgba(255,90,170,.3)');                  // neon, lying on the bottom of the dark
  g.fillStyle = gr; g.fillRect(-300, HY - 190, VW + 600, 192);
}
function ground() {
  const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR * .7, xa = cam.x - 3400, xb = cam.x + 3400, quad = E.quad;
  g.fillStyle = '#131319'; g.fillRect(-300, HY, VW + 600, VH - HY + 300);
  fill('#20202a', () => slab(xa, xb, CURB2, BZ + 700, 12));
  quad(P(xa, 12, CURB2), P(xb, 12, CURB2), P(xb, 0, CURB2), P(xa, 0, CURB2)); g.fillStyle = '#3a3a46'; g.fill();
  fill('rgba(232,232,240,.4)', () => {                                                                  // lane markings, except across the crossing
    for (let x = Math.floor((cam.x - 3000) / 240) * 240; x < cam.x + 3000; x += 240) if (x < SCR[0] - 200 || x > SCR[1] + 100) slab(x, x + 120, 1009, 1021, 0);
    slab(xa, xb, CURB1 + 24, CURB1 + 30, 0); slab(xa, xb, CURB2 - 30, CURB2 - 24, 0);
  });
  if (cam.x > SCR[0] - 2600 && cam.x < SCR[1] + 2600) fill('rgba(240,240,246,.78)', () => {             // the scramble: a crossing on every side of the junction, and two straight across the middle of it
    const a = SCR[0], b = SCR[1], z0 = CURB1 + 40, z1 = CURB2 - 40;
    for (let z = z0 + 12; z < z1 - 30; z += 70) { slab(a, a + 150, z, z + 36, 0); slab(b - 150, b, z, z + 36, 0); }
    for (let x = a + 190; x < b - 200; x += 64) { slab(x, x + 34, z0, z0 + 96, 0); slab(x, x + 34, z1 - 96, z1, 0); }
    for (const s of [1, -1]) for (let i = 1; i < 15; i++) {                                              // the diagonals
      const u = i / 15, x = lerp(a + 220, b - 220, u), z = s > 0 ? lerp(z0 + 118, z1 - 118, u) : lerp(z1 - 118, z0 + 118, u), p = [P(x - 22, 0, z - 34 * s), P(x + 22, 0, z - 22 * s), P(x + 22, 0, z + 34 * s), P(x - 22, 0, z + 22 * s)];
      g.moveTo(p[0][0], p[0][1]); for (let j = 1; j < 4; j++) g.lineTo(p[j][0], p[j][1]); g.closePath();
    }
  });
  lit(() => {
    for (const x of LAMPS) {
      if (Math.abs(x - cam.x) > 2800) continue;
      const p = P(x, 0, 1150);
      g.save(); g.translate(p[0], p[1]); g.scale(1, .3);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, 330 * p[2]);
      gr.addColorStop(0, 'rgba(255,170,90,.24)'); gr.addColorStop(1, 'rgba(255,170,90,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 330 * p[2], 0, TAU); g.fill(); g.restore();
    }
    const q = P((SCR[0] + SCR[1]) / 2, 0, 1010);                                                         // and the screens' light on the crossing
    if (Math.abs(q[0] - VW / 2) < VW * 1.6) { g.save(); g.translate(q[0], q[1]); g.scale(1, .32); glow(GLOW.blue, 0, 0, 2400 * q[2], .16 + .05 * Math.sin(E.T * 2)); g.restore(); }
  });
  fill('#262631', () => slab(xa, xb, zn, CURB1, 12));
  g.beginPath();
  for (let x = Math.floor((cam.x - 2400) / 150) * 150; x < cam.x + 2400; x += 150) { const a = P(x, 12, zn), b = P(x, 12, CURB1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  for (const z of [430, 550, 670, CURB1 - 14]) { const a = P(xa, 12, z), b = P(xb, 12, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  g.strokeStyle = 'rgba(0,0,0,.34)'; g.lineWidth = 2; g.stroke();
}
// what lies back from the street: the floor of each alley and of the square, and what stands at the far end of it
function alley() {
  const T = E.T;
  for (const d of DEEP) {
    if (d.x1 < cam.x - 2800 || d.x0 > cam.x + 2800) continue;
    const cx = (d.x0 + d.x1) / 2, w = d.x1 - d.x0;
    if (d.id === 'plaza') {
      fill('#2b2b36', () => slab(d.x0, d.x1, BZ - 4, d.z1, 12));
      g.beginPath();
      for (let x = d.x0; x <= d.x1; x += 116) { const a = P(x, 12, BZ), b = P(x, 12, d.z1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
      for (let z = BZ + 100; z < d.z1; z += 100) { const a = P(d.x0, 12, z), b = P(d.x1, 12, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
      g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1.5; g.stroke();
      const f = box(cx, 12, d.z1, w, 540, 40, '#2c3140', '#1a1d28'), r = on(f, 540);                    // the station, where it faces the square
      fill('rgba(200,230,255,.42)', () => r(.03, 260, .97, 500)); fill('#e8ecf4', () => r(.24, 180, .76, 250));
      text('渋谷駅 ハチ公口  HACHIKŌ GATE', cx, 215, d.z1, 30, '#1a1d28', EN);
      fill('rgba(255,226,170,.85)', () => { for (let i = 0; i < 6; i++) r(.08 + i * .12, 0, .16 + i * .12, 150); });       // ticket gates, all of them standing open
      box(STAIRS[0], 12, STAIRS[1] + 40, 190, 150, 60, '#0b0c12', '#06070a');                           // and the way down to the line
      box(STAIRS[0], 162, STAIRS[1] + 40, 230, 44, 60, '#1f6fd0', '#12407a'); text('地下鉄  SUBWAY', STAIRS[0], 184, STAIRS[1] + 40, 26, '#f4f6fb', EN);
      const s = P(STAIRS[0], 90, STAIRS[1]); lit(() => glow(GLOW.blue, s[0], s[1], 420 * s[2], .5));
      continue;
    }
    fill(d.id === 'center' ? '#22202c' : '#121018', () => slab(d.x0, d.x1, BZ - 4, d.z1, 12));
    box(cx, 12, d.z1, w, 620, 30, '#0e0c14', '#0e0c14');
    const n = d.id === 'center' ? 6 : 4;
    for (let i = n - 1; i >= 0; i--) for (const s of [-1, 1]) {                                          // signs and lanterns hung out over it from both sides, getting smaller down its length
      const z = lerp(BZ + 90, d.z1 - 90, i / (n - 1)), x = s < 0 ? d.x0 + 30 : d.x1 - 30, col = d.id === 'nonbei' ? '#ff3b2a' : d.id === 'dalley' ? ['#ff3d6e', '#5a3a6a'][(i + (s > 0)) % 2] : NEON[(i * 2 + (s > 0)) % 5];
      if (d.id === 'nonbei') { const q = P(x, 250, z); g.fillStyle = col; g.beginPath(); g.ellipse(q[0], q[1], 17 * q[2], 24 * q[2], 0, 0, TAU); g.fill(); lit(() => glow(GLOW.red, q[0], q[1], 190 * q[2], .7)); }
      else if (d.id !== 'dalley' || (i + (s > 0)) % 2 === 0 || Math.sin(T * 9 + i) > -.2) { box(x, 200 + (i % 3) * 70, z, 44, 150, 30, col, 'rgba(0,0,0,.5)'); const q = P(x, 280 + (i % 3) * 70, z); lit(() => glow(d.id === 'center' ? GLOW.blue : GLOW.red, q[0], q[1], 220 * q[2], .32)); }
    }
    if (d.id === 'center') { const q = P(cx, 60, d.z1 - 60); lit(() => glow(GLOW.purple, q[0], q[1], 900 * q[2], .35)); }
  }
}

/* ---------- things that share the walkable depth with people (drawn depth-sorted) ---------- */
function lamp(x) {
  box(x, 12, 1270, 14, 430, 14, '#2b2b36', '#1c1c24'); box(x, 436, 1196, 14, 10, 88, '#2b2b36', '#1c1c24');
  const p = P(x, 428, 1200); lit(() => glow(GLOW.fire, p[0], p[1], 320 * p[2], .85));
}
function car(x, cf, cs) {
  for (const dx of [-108, 108]) box(x + dx, 0, 1128, 58, 36, 96, '#0b0b0e', '#060608');
  box(x, 18, 1130, 330, 60, 100, cf, cs, cf); box(x - 12, 78, 1142, 190, 50, 76, '#161c28', '#0e1219', cs);
  const a = P(x - 160, 52, 1130), b = P(x + 160, 50, 1130);
  lit(() => { glow(GLOW.red, a[0], a[1], 70 * a[2], .9); glow(GLOW.fire, b[0], b[1], 80 * b[2], .7); });
}
// the arch over the mouth of an alley, with its name on it
function arch(d, name, col, ink) {
  const cx = (d.x0 + d.x1) / 2, w = d.x1 - d.x0;
  box(d.x0 + 16, 12, BZ - 30, 22, 420, 22, '#2b2b36', '#1c1c24'); box(d.x1 - 16, 12, BZ - 30, 22, 420, 22, '#2b2b36', '#1c1c24');
  box(cx, 400, BZ - 30, w, 78, 22, col, 'rgba(0,0,0,.5)'); text(name, cx, 439, BZ - 30, 40, ink);
  const q = P(cx, 439, BZ - 30); lit(() => glow(GLOW.red, q[0], q[1], w * 1.5 * q[2], .22));
}
function hachiko() {                                                                                     // a bronze dog on a stone plinth, sitting up, waiting
  const x = HACHI[0], z = HACHI[1], br = '#8a6a3c', sd = '#5e4526';
  box(x, 12, z, 120, 110, 90, '#8b8f99', '#5c6069', '#a9adb7');
  box(x - 6, 122, z + 20, 54, 74, 50, br, sd, '#a5824d'); box(x + 20, 122, z + 20, 22, 30, 50, br, sd);
  box(x + 12, 196, z + 24, 46, 40, 42, br, sd, '#a5824d'); box(x + 42, 204, z + 30, 22, 18, 30, br, sd); box(x - 2, 236, z + 30, 12, 18, 10, br, sd); box(x + 24, 236, z + 30, 12, 18, 10, br, sd);
  text('忠犬ハチ公', x, 66, z, 20, '#1c1d22');
}
function frog() {                                                                                        // the old green train car that stood in the square as a tourist office
  const x = FROG[0], z = FROG[1], f = box(x, 22, z, 400, 150, 100, '#3f8f5f', '#2a6642', '#4fa870'), r = on(f, 150);
  fill('#e9e3c8', () => { for (let i = 0; i < 6; i++) r(.05 + i * .155, 66, .17 + i * .155, 120); }); fill('#2a6642', () => r(0, 40, 1, 52));
  for (const dx of [-140, 140]) box(x + dx, 12, z + 10, 70, 14, 80, '#15151b', '#0c0c10');
  text('観光案内所', x, 140, z, 20, '#f4efe4');
}
function tree(x, z) {
  box(x, 12, z, 30, 150, 30, '#1a1410', '#100c09');
  const t = P(x, 240, z + 15), k = t[2];
  g.fillStyle = '#10241b'; for (const o of [[0, 0, 110], [-66, 28, 78], [68, 24, 84], [8, -56, 74]]) { g.beginPath(); g.arc(t[0] + o[0] * k, t[1] + o[1] * k, o[2] * k, 0, TAU); g.fill(); }
}
function tollgate() {                                                                                    // where the wounded are brought: a booth on the expressway's on-ramp, a green cross hung on it
  const x = 13950, z = 1296; box(x, 12, z, 170, 180, 60, '#e8ecf4', '#b4bac6', '#f6f8fc');
  const q = P(x, 150, z), k = q[2]; g.fillStyle = '#1f9d55'; g.fillRect(q[0] - 9 * k, q[1] - 30 * k, 18 * k, 60 * k); g.fillRect(q[0] - 30 * k, q[1] - 9 * k, 60 * k, 18 * k);
  lit(() => glow(GLOW.blue, q[0], q[1], 300 * k, .4)); text('料金所', x, 60, z, 22, '#2c3140');
}
function expressway() {                                                                                  // Route 3, carried over the far lane all the way out of the ward
  const x0 = 13700, x1 = LEN + 1700, cx = (x0 + x1) / 2;
  box(cx, 520, 1090, x1 - x0, 70, 250, '#3b3e4a', '#262830', '#4b4f5d'); box(cx, 590, 1090, x1 - x0, 34, 8, '#2a2c35', '#1b1c22');
  box(14020, 420, 1086, 300, 90, 8, '#156b3a', '#0c4023'); text('首都高速 3 渋谷線', 14020, 465, 1086, 26, '#f4f6fb');
}
// a column of light where something can be started: a raid, or something that was not meant to be found
function column(s, img, ring) {
  if (s.show && !s.show()) return;
  const a = P(s.x, 20, s.z), b = P(s.x, 520, s.z), k = a[2], T = E.T;
  lit(() => { for (let i = 0; i <= 6; i++) glow(img, lerp(a[0], b[0], i / 6), lerp(a[1], b[1], i / 6), (250 - i * 22) * k, .5 + .2 * Math.sin(T * 4 + i)); });
  g.strokeStyle = ring; g.lineWidth = 3;
  for (let i = 0; i < 2; i++) { const rr = (70 + 50 * ((T * .5 + i * .5) % 1)) * k; g.globalAlpha = 1 - ((T * .5 + i * .5) % 1); g.beginPath(); g.ellipse(a[0], a[1] + 6 * k, rr, rr * .3, 0, 0, TAU); g.stroke(); }
  g.globalAlpha = 1;
}
function front() {                                                                                       // at the near corners of the crossing: the lights that turn it loose
  const go = E.T % 24 < 14;
  for (const x of [SCR[0] - 40, SCR[1] + 40]) {
    box(x, 12, 450, 22, 520, 22, '#15151b', '#0c0c10'); box(x, 420, 446, 60, 110, 30, '#0c0c10', '#060608');
    const q = P(x, go ? 448 : 502, 446); lit(() => glow(go ? GLOW.blue : GLOW.red, q[0], q[1], 150 * q[2], 1));
  }
}

/* ================= who is here, and what can be done ================= */
const poly = (pts, col) => { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke(); };
// Gojo as he was at school: the same white hair, and round dark glasses where the blindfold is now
const YGOJO = Object.assign({}, C.GOJO, { head() {
  E.headBase('#ecc7a6', '#f8dcc0');
  poly([-27, 2, -30, -22, -20, -30, -14, -42, -6, -32, 0, -44, 8, -32, 16, -40, 20, -28, 27, -22, 26, -8, 18, -13, 10, -5, 2, -13, -6, -6, -14, -12, -17, 2], '#f4f6fb');
  g.fillStyle = '#07080c'; g.beginPath(); g.arc(4.5, 2, 6.6, 0, TAU); g.fill(); g.beginPath(); g.arc(17.5, 2, 5.8, 0, TAU); g.fill();
  g.strokeStyle = '#07080c'; g.lineWidth = 2; g.beginPath(); g.moveTo(10, 1); g.lineTo(12.5, 1); g.moveTo(-2, 1); g.lineTo(-22, -1); g.stroke();
  g.fillStyle = 'rgba(56,200,255,.55)'; g.fillRect(1.5, -1.5, 4, 1.6); g.fillRect(15, -1.5, 3.4, 1.6);
  g.strokeStyle = LINE; g.lineCap = 'round'; g.beginPath(); g.arc(11, 9, 6, .3, 2.2); g.stroke(); g.lineCap = 'butt';
  g.beginPath(); g.roundRect(-22, 17, 46, 11, [0, 0, 8, 8]); g.fillStyle = '#14151e'; g.fill(); g.lineWidth = 2.5; g.stroke();
} });
// Ijichi: a black suit, a white collar, glasses, and the look of a man holding several things at once
const IJICHI = Object.assign({}, C.GOJO, {
  chest() { g.fillStyle = '#eef0f4'; g.beginPath(); g.moveTo(8, -TOR); g.lineTo(24, -TOR); g.lineTo(16, -TOR + 22); g.closePath(); g.fill(); g.fillStyle = '#1a1b22'; g.fillRect(14.5, -TOR + 6, 3, 30); },
  head() {
    E.headBase('#d9b99b', '#e8cbb0');
    g.beginPath(); g.roundRect(-25, -27, 50, 15, [12, 12, 2, 2]); g.fillStyle = '#16141a'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
    g.fillStyle = LINE; g.beginPath(); g.ellipse(5, 3, 2.2, 2.6, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(17, 3, 2, 2.6, 0, 0, TAU); g.fill();
    g.lineWidth = 1.8; g.strokeStyle = '#2a2c36'; g.strokeRect(-1, -3, 11, 11); g.strokeRect(12.5, -3, 10, 11); g.beginPath(); g.moveTo(10, 1); g.lineTo(12.5, 1); g.stroke();
    g.lineWidth = 2; g.strokeStyle = LINE; g.beginPath(); g.moveTo(8, 17); g.lineTo(15, 16); g.stroke();
  } });
Object.assign(JU.story.WHO, { ijichi: ['Kiyotaka Ijichi', '伊地知潔高', '#9aa3b5'], ygojo: ['Satoru Gojo', '五条悟', '#38c8ff'], nanami: ['Kento Nanami', '七海建人', '#e2c060'], nobara: ['Nobara Kugisaki', '釘崎野薔薇', '#ff9a4d'],
  shoko: ['Shoko Ieiri', '家入硝子', '#b08cff'], panda: ['Panda', 'パンダ', '#e8ecf4'], yuki: ['Yuki Tsukumo', '九十九由基', '#ffd23d'], sign: ['Shibuya', '渋谷', '#ffd23d'] });

// ---- the raids, and what is hiding
const RAIDS = {
  parade: { name: 'The Night Parade', jp: '百鬼夜行', at: [6300, 1010], foes: ['warped', 'warped2', 'warped', 'brute', 'warped2', 'mahito'], pay: 60, give: { ct: 1 }, first: { ct: 2, cl: 1 },
    say: 'Transfigured humans, one after another, and the one who made them last.' },
  sealing: { name: 'The Sealing Ground', jp: '封印の地', at: [11625, 1290], foes: ['finger', 'hanami', 'jogo', 'choso'], pay: 120, give: { ct: 2 }, first: { cl: 3 }, stage: () => JU.chapters.STAGES.station(),
    say: 'Five floors down, the Fukutoshin line platform. Three special grades, and something to get past first.' },
  anchor: { name: 'The Curtain’s Anchor', jp: '帳の基', at: [14400, 700], foes: ['brute', 'ruin', 'warped2', 'ruin', 'finger'], pay: 90, give: { ct: 1, tl: 1 }, first: { tl: 2 },
    say: 'Under C Tower, on the expressway: whatever was set to guard what holds the curtain up.' }
};
const mk = (id, more) => { Fi.DEFS['sb_' + id] = Object.assign({}, Fi.DEFS[id], more); };       // the same enemies, as they are when nobody was meant to find them
mk('mahito', { hp: 380 }); mk('toji', { hp: 520 }); mk('mahoraga', { hp: 600, dr: .7 }); mk('kenjaku', { hp: 700 }); mk('sukuna', { hp: 900, dr: .5 });
const SECRETS = {
  double: { name: 'Mahito’s double', foe: 'sb_mahito', at: [1430, 1790], pay: 80, first: { ct: 2 }, show: () => true, say: 'At the bottom of the alley, something with a patchwork face turns round.' },
  toji: { name: 'Toji Fushiguro', foe: 'sb_toji', at: [2280, 1300], pay: 120, first: { tl: 2, cl: 1 }, show: () => M.wins >= 5, say: 'A man with a scar at his mouth is leaning by the Avenue Exit. He has been watching you fight.' },
  maho: { name: 'Mahoraga', foe: 'sb_mahoraga', at: [3200, 1010], pay: 150, first: { ct: 3 }, show: () => !!M.raids.parade, say: 'There is a wheel scratched into the road in front of 109. It is turning.' },
  kenjaku: { name: 'Kenjaku', foe: 'sb_kenjaku', at: [13025, 1830], pay: 180, first: { cl: 3 }, show: () => !!M.raids.sealing, say: 'Under the last lantern a man in a monk’s robe is drinking alone. There are stitches across his forehead.' },
  sukuna: { name: 'Ryomen Sukuna', foe: 'sb_sukuna', at: [9700, 700], pay: 300, first: { ct: 5, cl: 3, tl: 2 }, show: () => !!M.secrets.maho, say: 'In front of the store the road is gone, cut out in a circle. Somebody is standing in the middle of it, laughing.' }
};
const tally = o => Object.keys(o).filter(k => o[k]).length;
function reward(pay, give) {
  const got = [];
  if (JU.shop) { JU.shop.earn(pay); for (const k in give || {}) { JU.shop.give(k, give[k]); got.push(give[k] + ' ' + { ct: 'CT ticket', cl: 'clan roll', tl: 'tool spin' }[k] + (give[k] > 1 ? 's' : '')); } }
  return `${pay} Cursed Tokens${got.length ? ', ' + got.join(', ') : ''}`;
}
// before a raid or a boss: what it is, and a chance to walk away from it. He stands still while he decides
function begin(q, go) {
  S.st.hold = true; E.keys.clear();
  JU.shop.ask([q]).then(yes => { S.st.hold = false; S.st.wait = E.T + .45; E.keys.clear(); if (yes) go(); });
}
function raid(id) {
  const R = RAIDS[id];
  begin({ mark: '討', tag: 'Raid · ' + R.jp, title: R.name, text: `${R.say} ${R.foes.length} fights, one straight after another, and no leaving once it has begun.`, yes: 'Start the raid', no: 'Not yet', lead: 1 }, () => S.fight({ stay: true, cfg: Object.assign({ foes: R.foes, label: 'Raid · ' + R.name, win: ['祓', 'RAID CLEARED'] }, R.stage ? { stage: R.stage() } : null), after(won) {
    if (!won) return;
    const first = !M.raids[id];
    M.raids[id] = (M.raids[id] || 0) + 1; M.wins++; save();
    S.talk([['sign', `${R.name} is cleared. ${reward(R.pay, R.give)}.` + (first ? ` And for the first time through: ${reward(0, R.first).replace('0 Cursed Tokens, ', '')}.` : '')]]);
  } }));
}
function secret(id) {
  const B = SECRETS[id];
  begin({ mark: '？', tag: 'Something that was not meant to be found', title: M.secrets[id] ? B.name : 'Something is here', text: B.say, yes: 'Face it', no: 'Walk away', lead: 1 }, () => S.fight({ stay: true, cfg: { foes: [B.foe], label: 'Secret boss', wild: true, win: ['祓', 'EXORCISED'] }, after(won) {
    if (!won) return;
    const first = !M.secrets[id];
    M.secrets[id] = (M.secrets[id] || 0) + 1; M.wins++; save();
    S.talk([['sign', `${B.name} is down. ${reward(B.pay)}.` + (first ? ` The first time: ${reward(0, B.first).replace('0 Cursed Tokens, ', '')}.` : '')]]);
  } }));
}

// ---- the people
const have = id => !JU.shop || JU.shop.holds('tech', id);
const LINES = {
  ijichi: () => [['ijichi', 'Everything from Dogenzaka to the expressway is under the curtain. There are curses on every block.'],
    ['ijichi', 'Nanami is at the crossing. Ieiri has set up at the tollgate, as far east as you can walk. Fushiguro went west, up the hill.'],
    ['ijichi', 'And there is somebody with white hair by the dog. He would not tell me why. The stairs behind me go back down to the line.']],
  ygojo() {
    if (JU.awakened.gojo) return [['ygojo', 'Still here? Go and break something with it.']];
    if (!have('limitless')) return [['ygojo', 'Hm? I do not need the Six Eyes to see you are carrying nothing of mine.'], ['ygojo', 'Come back with Limitless on you. Then we will talk.']];
    return [['ygojo', 'Oh? My technique, in somebody else’s hands. That is funny.'], ['ygojo', 'You are using a tenth of it. Stop pushing at infinity. Let it fall toward you.'],
      ['ygojo', 'There. Blue that swallows, red that throws, and what is left when the two are put together.', () => { JU.awakened.grant('gojo'); E.banner('無下限・覚醒', 'LIMITLESS AWAKENED'); sfx.bf(); E.cam.shake = 14; }],
      ['ygojo', 'Do not thank me. I am the strongest. It cost me nothing.']];
  },
  megumi() {
    const q = JU.awakened.shadows;
    if (q.kills >= q.need[0] && q.boss >= q.need[1]) return [['megumi', 'A hundred, and ten that mattered. They answer to you now, all of them. Even the one I have never managed to call.']];
    if (!have('ten')) return [['megumi', 'If it is the Ten Shadows you are after, roll for them first. Then come and find me.']];
    return [['megumi', `The shadows keep the count, not me. ${Math.min(q.kills, q.need[0])} of ${q.need[0]} exorcised with them. ${Math.min(q.boss, q.need[1])} of ${q.need[1]} that could really have killed you.`],
      ['megumi', 'Special grades count. So does anything hiding in this ward. The raids are the quick way through it.']];
  },
  nanami: () => [['nanami', 'Transfigured humans, by the hundred, where the crossing used to be. This is overtime.'], ['nanami', 'The light standing in the middle of the road starts it. They come one at a time, and the one stitching them together comes last.'],
    ['nanami', M.raids.parade ? 'You have cleared it once already. Something answered that, up by 109. I would look.' : 'Clear it, and I will see that you are paid for it.']],
  nobara: () => [['nobara', 'There is something with a patchwork face at the bottom of this alley. It ran when I got a nail into it.'], ['nobara', M.secrets.double ? 'You got it? Good. I was going to.' : 'If you go down there, hit it somewhere it cannot shrug off.']],
  panda: () => [['panda', 'I am a panda. Yes, really.'], ['panda', M.raids.sealing ? 'The lanterns down the lane past the park are lit again. Nobody is drinking there tonight. Somebody is sitting there, though.' : 'They sealed him five floors under Hikarie. Whatever is still down there, it is not friendly.']],
  shoko() {
    if (M.bless) return [['shoko', 'It is still on you. Use it before you come back for another.']];
    return [['shoko', 'Sit. Hold still.'], ['shoko', 'Reversed technique, on somebody else. Not many can. Your next fight you go in with half again your health.', () => { M.bless = 1; save(); sfx.confirm(); }]];
  },
  yuki() {
    const n = tally(M.secrets), all = Object.keys(SECRETS).length;
    if (n >= all && !M.hunt) return [['yuki', 'All five? Every one of the things nobody was meant to find?'], ['yuki', `Then you are the kind of sorcerer I came back for. Here. ${reward(500, { ct: 5 })}.`, () => { M.hunt = 1; save(); sfx.bf(); }]];
    if (M.hunt) return [['yuki', 'Nothing left in this ward that can surprise you. Try the next one, when the line opens.']];
    return [['yuki', 'What kind of curse is your type? No? Then a serious question.'], ['yuki', `Five things are hiding in Shibuya tonight that have no business here. You have put down ${n}. Come and tell me when it is all of them.`]];
  },
  hachi: () => [['sign', 'A bronze dog on a stone plinth, sitting up. People have arranged to meet here for longer than anyone alive can remember.'], ['sign', 'Tonight nobody is waiting.']]
};
const WHO = [['ijichi', IJICHI, 8180, 1700, 1, 'Ijichi'], ['ygojo', YGOJO, 7900, 1600, 1.04, 'Gojo'], ['megumi', C.MEGUMI, 1000, 700, 1, 'Megumi'], ['nanami', JU.cast2.NANAMI, 7080, 700, 1.04, 'Nanami'],
  ['nobara', JU.sets.NOBARA, 1640, 1290, 1, 'Nobara'], ['panda', JU.cast5.PANDA, 12600, 700, 1.25, 'Panda'], ['shoko', JU.sets.SHOKO, 14060, 1250, 1, 'Ieiri'], ['yuki', JU.cast4.YUKI, 4480, 2180, 1.02, 'Yuki']];
function cast() {
  return WHO.map(w => { const f = E.fighter(w[1], w[2], -1); f.z = w[3]; f.y = f.ground0 = 12; f.scale = w[4]; f.pose = C.STAND.slice(); f.target = C.STAND; f.who = w[0]; return f; });
}
const spots = [
  { x: STAIRS[0], z: STAIRS[1] - 40, r: 150, h: 200, icon: '乗', col: '#38c8ff', label: 'Take the subway', use: () => openMap() },
  { x: HACHI[0], z: HACHI[1] - 70, r: 120, h: 300, icon: '犬', label: 'Look at the statue', use: () => S.talk(LINES.hachi()) },
  ...WHO.map(w => ({ x: w[2], z: w[3], r: 160, h: 350 * w[4], icon: '話', label: 'Talk to ' + w[5], use: () => S.talk(LINES[w[0]]()) })),
  ...Object.keys(RAIDS).map(id => ({ x: RAIDS[id].at[0], z: RAIDS[id].at[1], r: 150, h: 430, icon: '討', col: '#ff5a6e', raid: id, label: () => 'Raid · ' + RAIDS[id].name + (M.raids[id] ? ' · cleared ' + M.raids[id] : ''), use: () => raid(id) })),
  ...Object.keys(SECRETS).map(id => ({ x: SECRETS[id].at[0], z: SECRETS[id].at[1], r: 140, h: 430, icon: '？', col: '#c77dff', secret: id, show: SECRETS[id].show, label: () => (M.secrets[id] ? SECRETS[id].name + ' · again' : 'Something is here'), use: () => secret(id) }))
];
const props = [...LAMPS.map(x => ({ z: 1270, draw: () => lamp(x) })), ...CARS.map(c => ({ z: 1136, draw: () => car(c[0], c[1], c[2]) })),
  { z: 1356, draw: () => arch(DEEP[0], '道玄坂小路', '#2a2233', '#ff9ec4') }, { z: 1356, draw: () => arch(DEEP[1], '渋谷センター街', '#f4f6fb', '#d81f3c') }, { z: 1356, draw: () => arch(DEEP[3], 'のんべい横丁', '#3a1a12', '#ffd98a') },
  { z: HACHI[1], draw: hachiko }, { z: FROG[1], draw: frog }, { z: 1880, draw: () => tree(7500, 1880) }, { z: 1460, draw: () => tree(8500, 1460) }, { z: 1900, draw: () => tree(7700, 1900) },
  { z: 1296, draw: tollgate }, { z: 1100, draw: expressway }, ...[13800, 14250, 14700].map(x => ({ z: 1262, draw: () => box(x, 12, 1262, 70, 508, 70, '#3b3e4a', '#262830') })),
  ...spots.filter(s => s.raid || s.secret).map(s => ({ z: s.z + 1, draw: () => column(s, s.raid ? GLOW.red : GLOW.purple, s.raid ? 'rgba(255,90,110,.9)' : 'rgba(199,125,255,.9)') }))];

const world = { name: 'shibuya', label: 'Shibuya', LEN, Z0, Z1, BZ, gy, free, sky, ground, alley, buildings, props, front, cast, spots, civs: 16, respawn: 45,
  SPOTS: [[380, 640, 'grunt'], [1950, 660, 'brute'], [2700, 660, ['warped', 'warped2']], [3750, 1290, 'grunt'], [4050, 660, 'brute'], [5150, 640, ['warped', 'warped2']], [6720, 1150, ['warped', 'warped2', 'brute']],
    [9150, 660, 'ruin'], [10500, 1290, ['warped', 'brute']], [11000, 640, 'ruin'], [12450, 1290, 'grunt'], [13450, 660, 'brute'], [14720, 640, 'special']],
  stage(x0) { const sh = fn => () => { cam.x += x0; fn(); cam.x -= x0; }; return { sky: sh(sky), floor: sh(ground), back: sh(() => { alley(); buildings(); for (const p of props) if (p.z > 1000) p.draw(); }), front: sh(front) }; },
  won() { M.wins++; save(); },
  status(st, set) { const a = areaAt(S.me.x); set(`${a[1]} <span lang="ja">${a[2]}</span>`, `Shibuya · E talk or use · exorcised here ${M.wins} · raids ${tally(M.raids)}/3 · secret bosses ${tally(M.secrets)}/5`); },
  tick(dt, real, p, st) {
    if (!M.been) { M.been = 1; save(); S.talk([['ijichi', 'You came through the curtain in one piece. Good. I am Ijichi. I do the paperwork nobody else will.']].concat(LINES.ijichi())); }
    const a = areaAt(p.x);
    if (st.area !== a) { st.area = a; S.status(); }                                                      // the corner of the screen says which part of the ward this is
    return false;
  } };

/* ================= the subway ================= */
const seasonOne = () => { const CH = JU.chapters, end = CH.SEASONS[1].from, all = CH.CH.filter(c => c && c.n < end); return [all.filter(c => CH.DONE.includes(c.n)).length, all.length]; };
const exorcised = () => (JU.smark ? JU.smark.progress.kills : 0);
const NEED = 10;
const canRide = () => dev() || (exorcised() >= NEED && seasonOne()[0] >= seasonOne()[1]);
const STOPS = [{ id: 'tokyo', name: 'Tokyo', jp: '東京', x: 800, y: 250, at: () => [T0.LEN - 340, 1290, -1], world: () => T0 },      // (up the stairs onto the far pavement: the near one has a special grade standing on it)
  { id: 'shibuya', name: 'Shibuya', jp: '渋谷', x: 430, y: 250, at: () => [STAIRS[0] - 60, STAIRS[1] - 150, -1], world: () => world },
  { id: 'harajuku', name: 'Harajuku', jp: '原宿', x: 430, y: 150, soon: 1 }, { id: 'shinjuku', name: 'Shinjuku', jp: '新宿', x: 430, y: 60, soon: 1 },
  { id: 'ebisu', name: 'Ebisu', jp: '恵比寿', x: 430, y: 350, soon: 1 }, { id: 'ikebukuro', name: 'Ikebukuro', jp: '池袋', x: 700, y: 60, soon: 1 }, { id: 'roppongi', name: 'Roppongi', jp: '六本木', x: 620, y: 350, soon: 1 }];
const metro = document.createElement('div'), fade = E.root.querySelector('#fade');
metro.className = 'metro'; metro.id = 'metro';
E.root.appendChild(metro);
let mapOpen = false, armed = true;
function paintMap() {
  const here = S.world === world ? 'shibuya' : 'tokyo', ok = canRide(), s1 = seasonOne(), k = exorcised();
  metro.innerHTML = `<div class="mbox" role="dialog" aria-modal="true" aria-label="Subway map"><div class="mhd"><b lang="ja">路線図</b><h3>Where to?</h3><p>${ok ? 'One stop is open' : 'The line is closed to you'}</p></div>
    <div class="mmap"><svg viewBox="0 0 1000 420" aria-hidden="true">
      <path d="M430 30V400" stroke="#7fbf3f" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M120 250H880" stroke="#ff9a1f" stroke-width="14" fill="none" stroke-linecap="round"/>
      <path d="M430 250L560 150L700 60" stroke="#9c5a2c" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M430 250L620 350L860 370" stroke="#8f76d6" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g fill="#11141f" stroke="#f4efe4" stroke-width="4">${[[250, 250], [620, 250], [560, 150], [860, 370]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="9"/>`).join('')}</g>
      <g font-family="Oswald, sans-serif" font-size="15" fill="rgba(244,239,228,.45)" letter-spacing="2"><text x="250" y="284" text-anchor="middle">DOGENZAKA-UE</text><text x="620" y="284" text-anchor="middle">OMOTE-SANDO</text><text x="578" y="176" text-anchor="start">MEIJI-JINGUMAE</text><text x="860" y="402" text-anchor="middle">AZABU</text></g>
    </svg>${STOPS.map(s => { const cur = s.id === here, off = cur || s.soon || !ok; return `<button class="mst${cur ? ' here' : ''}" data-stop="${s.id}" style="left:${s.x / 10}%;top:${s.y / 4.2}%" ${off ? 'disabled' : ''}>${s.name}<span lang="ja">${s.jp}</span><small>${cur ? 'You are here' : s.soon ? 'Sealed · soon' : ok ? 'Ride' : 'Closed'}</small></button>`; }).join('')}</div>
    <div class="mft"><span>${ok ? (here === 'tokyo' ? 'The nearest stop is <b>Shibuya</b>, under the curtain: the night of the incident.' : 'Back to the block you started on, or stay.') + (dev() ? ' <b>Team account:</b> the line is open regardless.' : '')
      : `To ride: exorcise ${NEED} curses (<${k >= NEED ? 'b' : 'i'}>${Math.min(k, NEED)} / ${NEED}</${k >= NEED ? 'b' : 'i'}>) and finish Season 1 (<${s1[0] >= s1[1] ? 'b' : 'i'}>${s1[0]} / ${s1[1]} chapters</${s1[0] >= s1[1] ? 'b' : 'i'}>).`}</span><button id="mClose">Stay here <small>Esc</small></button></div></div>`;
}
function onKey(e) {
  if (!mapOpen) return;
  const k = e.key.toLowerCase(), live = [...metro.querySelectorAll('.mst:not(:disabled)'), metro.querySelector('#mClose')], at = live.indexOf(document.activeElement);
  if (k === 'escape' || k === 'tab' || k === 'x') { e.preventDefault(); e.stopPropagation(); closeMap(); return; }
  if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', 'w', 's'].includes(k)) { e.preventDefault(); e.stopPropagation(); live[(at + (k === 'arrowleft' || k === 'arrowup' || k === 'a' || k === 'w' ? -1 : 1) + live.length) % live.length].focus(); sfx.hover(); return; }
  if (k === 'e') { e.preventDefault(); e.stopPropagation(); if (at >= 0) live[at].click(); return; }
  if (k !== 'enter' && k !== ' ') e.stopPropagation();                                                   // nothing else typed here reaches the street behind
}
function openMap() {
  if (mapOpen) return;
  mapOpen = true; S.st.hold = true; E.keys.clear(); paintMap(); metro.classList.add('on'); sfx.confirm();
  addEventListener('keydown', onKey, true);
  const first = metro.querySelector('.mst:not(:disabled)') || metro.querySelector('#mClose'); first.focus({ preventScroll: true });
}
function closeMap() {
  if (!mapOpen) return;
  mapOpen = false; removeEventListener('keydown', onKey, true); metro.classList.remove('on'); S.st.hold = false; E.keys.clear(); sfx.back();
}
function ride(stop) {
  mapOpen = false; removeEventListener('keydown', onKey, true); metro.classList.remove('on'); sfx.whoosh(); E.keys.clear();
  if (fade) fade.classList.add('on');
  setTimeout(() => {
    S.travel(stop.world(), stop.at()); armed = false; M.last = stop.id; save();
    if (fade) fade.classList.remove('on');
    E.banner(stop.jp, stop.name.toUpperCase());
  }, 650);
}
metro.addEventListener('click', e => {
  const b = e.target.closest('[data-stop]');
  if (e.target.closest('#mClose')) { closeMap(); return; }
  if (b && !b.disabled) ride(STOPS.find(s => s.id === b.dataset.stop));
});

/* ---------- the Tokyo block's end of it ---------- */
const TX = T0.LEN - 150;
T0.props.push({ z: 1262, draw() {                                                                        // the way down, at the east end of the far pavement
  box(TX, 12, 1290, 190, 150, 60, '#0b0c12', '#06070a'); box(TX, 162, 1290, 230, 44, 60, '#1f6fd0', '#12407a'); text('地下鉄  SUBWAY', TX, 184, 1290, 26, '#f4f6fb', EN);
  const s = P(TX, 90, 1290); lit(() => glow(GLOW.blue, s[0], s[1], 420 * s[2], .5));
} });
T0.spots = [{ x: TX, z: 1270, r: 170, h: 200, icon: '乗', col: '#38c8ff', label: 'Take the subway', use: () => openMap() }];
T0.tick = (dt, real, p, st) => {                                                                         // and walking to the very end of the block asks the question by itself
  if (p.x < T0.LEN - 420) armed = true;
  else if (armed && p.x > T0.LEN - 96 && !st.hold) { armed = false; openMap(); }
  return false;
};

/* ---------- Ieiri's work lasts one fight ---------- */
const start0 = H.fightStart, reset0 = H.reset;
H.fightStart = (cfg, wave) => {
  if (start0) start0(cfg, wave);
  if (!wave && M.bless && S.world === world && cfg && !cfg.dummy) { const p = E.P1; p.max = Math.round(p.max * 1.5); p.hp = p.max; M.bless = 0; save(); E.fx.push({ k: 2, x: p.x, y: p.y + 420, n: 'REVERSED TECHNIQUE  ·  +50% HEALTH', col: '#b08cff', t: 0, life: 1.8 }); }
};
H.reset = () => { if (reset0) reset0(); if (mapOpen) { mapOpen = false; removeEventListener('keydown', onKey, true); } metro.classList.remove('on'); armed = true; };

JU.shibuya = { world, RAIDS, SECRETS, STOPS, canRide, openMap, closeMap, seasonOne, exorcised, NEED,
  resume: () => (M.last === 'shibuya' && canRide() ? { world, at: [STAIRS[0] - 60, STAIRS[1] - 150] } : null),      // Free Exploration starts wherever he last got off
  get state() { return Object.assign({ mapOpen }, JSON.parse(JSON.stringify(M))); } };
})();
