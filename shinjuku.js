/* JUJUTSU UNLIMITEDS — Build 0.16v1: the SHINJUKU extension. The stop that was sealed on the route map is open: a third district, built the
   way Shibuya and Kyoto are (their pieces, shibuya.js's kit), on the night of December 24th: the night the series twice brings war to
   Shinjuku, the Night Parade of a Hundred Demons and, years later, the Showdown. Light snow, Christmas lights, and at the east end, ruins.
   Laid out from the real place, west to east along one street: the Metropolitan Government Building's twin towers · the Cocoon Tower ·
   the giant eye in the West Exit's passage (Shinjuku's Eye) · Omoide Yokocho, the smoky lane of grills · Shinjuku Station, its West Exit,
   and the Marunouchi line going down under it · the East Exit's square and the corner screen with the giant cat on it · Kabukicho's red
   gate · the cinema tower with a monster's head looking over its roof · Golden Gai's tiny bars · Hanazono Shrine · the department store
   on the corner of 3-chome · the Christmas street · Takashimaya Times Square, with the clock tower over the rooftops · the gate of the
   great garden · and past it, what is left after the Showdown: cut buildings, rubble, and a crater.
   Who is met where, the three raids and the five secret bosses are ours */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, box = E.box, glow = E.glow, GLOW = E.GLOW, cam = E.cam, C = JU.cast, Fi = JU.fights, sfx = JU.sfx, S = JU.street, SH = JU.shibuya, K = SH.kit, M = SH.M;
const { lerp, clamp, rnd, LINE } = E, TAU = Math.PI * 2, { slab, fill, lit, on, text, lamp, column, arch, beacon, JP, EN } = K;

const LEN = 14400, Z0 = 500, Z1 = 1340, CURB1 = 790, CURB2 = 1240, BZ = 1380;
const DEEP = [{ id: 'omoide', x0: 2450, x1: 2720, z1: 2050 }, { id: 'east', x0: 4500, x1: 5280, z1: 2050 }, { id: 'kabuki', x0: 5900, x1: 6200, z1: 2150 }, { id: 'gai', x0: 6950, x1: 7180, z1: 2000 },
  { id: 'hanazono', x0: 7280, x1: 7600, z1: 2050 }, { id: 'gyoen', x0: 11000, x1: 11780, z1: 2250 }, { id: 'crater', x0: 12700, x1: 13900, z1: 2600 }];
const LAMPS = [350, 1250, 2300, 3100, 4100, 5500, 6900, 8300, 8900, 9500, 10100, 10700, 11900];
const AREAS = [[0, 'Nishi-Shinjuku', '西新宿'], [1800, 'Shinjuku’s Eye', '新宿の目'], [2420, 'Omoide Yokocho', '思い出横丁'], [2780, 'Shinjuku Station', '新宿駅'], [4450, 'East Exit', '東口'], [5880, 'Kabukicho', '歌舞伎町'],
  [6930, 'Golden Gai', 'ゴールデン街'], [7260, 'Hanazono Shrine', '花園神社'], [7650, 'Shinjuku 3-chome', '新宿三丁目'], [8600, 'The Christmas Street', '聖夜の通り'], [9900, 'Shinjuku South', '新宿南口'], [10950, 'The Garden Gate', '御苑'], [11850, 'The Showdown', '新宿決戦']];
const areaAt = x => AREAS.filter(a => x >= a[0]).pop();
const gy = z => (z < CURB1 || z > CURB2 ? 12 : 0);
const STAIRS = [3500, 1300];                                                   // the way down to the Marunouchi line
function free(x, z) {
  if (x < 80 || x > LEN - 80 || z < Z0) return false;
  if (z > Z1) { const d = DEEP.find(a => x > a.x0 + 34 && x < a.x1 - 34); return !!d && z < d.z1 - 130; }
  return true;
}
const near = (x0, x1, m = 2600) => x1 > cam.x - m && x0 < cam.x + m;

/* ---------- the landmarks, west to east ---------- */
function tocho() {                                   // the Metropolitan Government Building: a low hall, and two towers that split at the top like a cathedral's
  const x = 800;
  const f = box(x, 0, BZ + 160, 820, 900, 520, '#4a4e58', '#2e313a'), r = on(f, 900);
  fill('rgba(255,226,170,.55)', () => { for (let i = 0; i < 14; i++) for (let j = 0; j < 9; j++) if ((i * 3 + j * 7) % 4) r(.04 + i * .068, 120 + j * 86, .09 + i * .068, 170 + j * 86); });
  for (const s of [-1, 1]) {
    const tx = x + s * 240, t = box(tx, 900, BZ + 220, 280, 1500, 320, '#565b66', '#353943'), q = on(t, 1500);
    fill('rgba(255,226,170,.5)', () => { for (let i = 0; i < 5; i++) for (let j = 0; j < 22; j++) if ((i + j * 3) % 5) q(.08 + i * .18, 40 + j * 64, .18 + i * .18, 80 + j * 64); });
    box(tx, 2400, BZ + 260, 200, 240, 240, '#5d626e', '#3a3e48'); box(tx, 2640, BZ + 300, 110, 160, 160, '#5d626e', '#3a3e48'); beacon(tx, 2820, BZ + 300, 90);
  }
  text('東京都庁', x, 860, BZ + 158, 40, '#e8e2d2');
}
function cocoon() {                                  // the Cocoon Tower: an egg stood on end, wrapped in white lattice
  const x = 1520, H = 2100, z = BZ + 120;
  const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20, w = 260 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05 + .02)), .7); pts.push([w, u * H]); }
  g.beginPath(); pts.forEach(([w, y], i) => { const q = P(x - w, y, z); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); for (let i = pts.length - 1; i >= 0; i--) { const q = P(x + pts[i][0], pts[i][1], z); g.lineTo(q[0], q[1]); } g.closePath();
  g.fillStyle = '#1d3048'; g.fill();
  g.strokeStyle = 'rgba(230,240,250,.75)'; g.lineWidth = 2.5;
  for (let k = -6; k <= 6; k++) { g.beginPath(); pts.forEach(([w, y], i) => { const q = P(x + w * Math.sin(k / 6 * 1.3 + y / H * 2), y, z); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.stroke(); }
  const t = P(x, H - 80, z); lit(() => glow(GLOW.blue, t[0], t[1], 300 * t[2], .3)); beacon(x, H + 20, z, 80);
}
function theEye() {                                  // the eye in the West Exit's passage: as tall as a house, and it looks back
  const x = 2100, f = box(x, 0, BZ, 560, 700, 520, '#2a2c34', '#1a1c22'), r = on(f, 700);
  fill('rgba(255,226,170,.5)', () => { for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) r(.06 + i * .16, 380 + j * 76, .14 + i * .16, 420 + j * 76); });
  fill('#101216', () => r(.1, 20, .9, 320));
  const c = P(x, 170, BZ - 2), k = c[2], blink = Math.abs(Math.sin(E.T * .4)) < .04 ? .1 : 1;
  g.save(); g.translate(c[0], c[1]); g.scale(1, blink);
  g.fillStyle = '#f4f1e6'; g.beginPath(); g.ellipse(0, 0, 200 * k, 110 * k, 0, 0, TAU); g.fill();
  const hue = ['#ffd23d', '#38c8ff', '#ff3d6e', '#8dff6a'][Math.floor(E.T / 4) % 4];
  g.fillStyle = hue; g.beginPath(); g.arc(Math.sin(E.T * .3) * 40 * k, 0, 80 * k, 0, TAU); g.fill(); g.fillStyle = '#0b0b10'; g.beginPath(); g.arc(Math.sin(E.T * .3) * 40 * k, 0, 38 * k, 0, TAU); g.fill();
  g.strokeStyle = LINE; g.lineWidth = 5 * k; g.beginPath(); g.ellipse(0, 0, 200 * k, 110 * k, 0, 0, TAU); g.stroke();
  g.restore();
  lit(() => glow(GLOW.fire, c[0], c[1], 700 * k, .35)); text('新宿の目', x, 360, BZ - 2, 26, '#f4efe4');
}
function station() {                                 // the West Exit: department stores stacked on the station, and the line's names over the door
  const x = 3550, f = box(x, 0, BZ + 40, 1500, 760, 480, '#30343e', '#1d2028'), r = on(f, 760);
  fill('rgba(255,226,170,.82)', () => r(.03, 26, .97, 170)); fill('rgba(200,230,255,.35)', () => { for (let y = 220; y < 700; y += 64) r(.03, y, .97, y + 34); });
  fill('#e8ecf4', () => r(.3, 176, .7, 214)); text('新宿駅 西口  SHINJUKU STATION · WEST EXIT', x, 195, BZ + 38, 26, '#1a1d28', EN);
  fill('#2a6fd0', () => r(.05, 620, .25, 680)); text('小田急', x - 525, 650, BZ + 38, 34, '#fff'); fill('#dd0077', () => r(.75, 620, .95, 680)); text('京王', x + 525, 650, BZ + 38, 34, '#fff');
  box(STAIRS[0], 12, STAIRS[1] + 20, 200, 150, 60, '#0b0c12', '#06070a'); box(STAIRS[0], 162, STAIRS[1] + 20, 240, 44, 60, '#e60012', '#8a0a14'); text('丸ノ内線 M08 SUBWAY', STAIRS[0], 184, STAIRS[1] + 20, 22, '#f4f6fb', EN);
  const s = P(STAIRS[0], 90, STAIRS[1]); lit(() => glow(GLOW.red, s[0], s[1], 380 * s[2], .45));
}
function catScreen() {                               // the corner screen, and the enormous cat that leans out of it to look at the street
  const x = 5560, H = 1100, f = box(x, 0, BZ, 520, H, 520, '#2a2d36', '#191b22'), r = on(f, H);
  fill('rgba(255,226,170,.8)', () => r(.04, 26, .96, 160)); fill('#05070c', () => r(.06, 480, .94, 980));
  const c = P(x, 700, BZ - 4), k = c[2], t = E.T, bob = Math.sin(t * .8) * 30, peek = (Math.sin(t * .35) + 1) / 2;
  g.save(); g.beginPath(); { const a = P(x - 243, 480, BZ - 4), b = P(x + 243, 980, BZ - 4); g.rect(a[0], b[1], b[0] - a[0], a[1] - b[1]); } g.clip();
  g.fillStyle = '#3a5a8a'; g.fillRect(c[0] - 400 * k, c[1] - 400 * k, 800 * k, 800 * k);
  const cx = c[0] + (peek - .5) * 120 * k, cy = c[1] + (90 - bob) * k;
  g.fillStyle = '#f4efe4'; g.beginPath(); g.ellipse(cx, cy, 190 * k, 160 * k, 0, 0, TAU); g.fill();       // a calico: white, ginger and black
  g.fillStyle = '#e8902a'; g.beginPath(); g.ellipse(cx - 90 * k, cy - 70 * k, 90 * k, 70 * k, -.4, 0, TAU); g.fill(); g.fillStyle = '#1a1612'; g.beginPath(); g.ellipse(cx + 100 * k, cy - 60 * k, 70 * k, 60 * k, .4, 0, TAU); g.fill();
  for (const s of [-1, 1]) { g.fillStyle = s < 0 ? '#e8902a' : '#1a1612'; g.beginPath(); g.moveTo(cx + s * 70 * k, cy - 120 * k); g.lineTo(cx + s * 150 * k, cy - 230 * k); g.lineTo(cx + s * 170 * k, cy - 90 * k); g.closePath(); g.fill(); }
  const shut = (t % 5) < .15;
  for (const s of [-1, 1]) { g.fillStyle = '#c8e070'; g.beginPath(); g.ellipse(cx + s * 70 * k, cy - 10 * k, 30 * k, shut ? 3 * k : 34 * k, 0, 0, TAU); g.fill(); if (!shut) { g.fillStyle = '#0b0b10'; g.beginPath(); g.ellipse(cx + s * 70 * k, cy - 10 * k, 9 * k, 28 * k, 0, 0, TAU); g.fill(); } }
  g.fillStyle = '#e88a9a'; g.beginPath(); g.moveTo(cx - 14 * k, cy + 40 * k); g.lineTo(cx + 14 * k, cy + 40 * k); g.lineTo(cx, cy + 56 * k); g.closePath(); g.fill();
  if ((t % 9) > 7.5) { g.fillStyle = '#3a1420'; g.beginPath(); g.ellipse(cx, cy + 84 * k, 40 * k, 26 * k, 0, 0, TAU); g.fill(); text('ニャー', x + 160, 930, BZ - 6, 40, '#ffffff'); }
  g.restore();
  const q = P(x, 730, BZ); lit(() => glow(GLOW.blue, q[0], q[1], 900 * q[2], .25)); text('CROSS SHINJUKU VISION', x, 1010, BZ - 4, 20, '#9fd0ea', EN);
}
function kaiju() {                                   // the cinema tower, and the monster's head looking over its roof
  const x = 6550, H = 620, f = box(x, 0, BZ + 60, 600, H, 480, '#2c2f38', '#1b1d23'), r = on(f, H);      // (low enough that what is on its roof is in the picture)
  fill('rgba(255,226,170,.8)', () => r(.04, 26, .96, 170)); fill('rgba(255,217,138,.55)', () => { for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) if ((i + j) % 3) r(.06 + i * .13, 240 + j * 90, .14 + i * .13, 290 + j * 90); });
  text('シネマ  CINEMA · HOTEL', x, 200, BZ + 58, 26, '#f4efe4', EN);
  const c = P(x + 120, H + 170, BZ + 260), k = c[2] * 1.4, open = Math.max(0, Math.sin(E.T * .7)) * 18;
  g.fillStyle = '#2f3a32';
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(c[0] - (120 - i * 40) * k, c[1] - 40 * k); g.lineTo(c[0] - (100 - i * 40) * k, c[1] - (150 + (i % 2) * 40) * k); g.lineTo(c[0] - (80 - i * 40) * k, c[1] - 40 * k); g.closePath(); g.fill(); }      // the plates down its back
  g.fillStyle = '#3c4a40'; g.beginPath(); g.ellipse(c[0], c[1], 140 * k, 90 * k, -.15, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(c[0] + 40 * k, c[1] - 30 * k); g.quadraticCurveTo(c[0] + 210 * k, c[1] - 20 * k, c[0] + 230 * k, c[1] + 20 * k); g.lineTo(c[0] + 60 * k, c[1] + 40 * k); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(c[0] + 50 * k, c[1] + (50 + open) * k); g.quadraticCurveTo(c[0] + 180 * k, c[1] + (60 + open) * k, c[0] + 210 * k, c[1] + (40 + open) * k); g.lineTo(c[0] + 60 * k, c[1] + 30 * k); g.closePath(); g.fill();
  g.fillStyle = '#f4f1e6'; for (let i = 0; i < 5; i++) { const tx = c[0] + (90 + i * 26) * k; g.beginPath(); g.moveTo(tx, c[1] + 22 * k); g.lineTo(tx + 8 * k, c[1] + 36 * k); g.lineTo(tx + 16 * k, c[1] + 22 * k); g.closePath(); g.fill(); }
  g.fillStyle = '#ffd23d'; g.beginPath(); g.arc(c[0] + 90 * k, c[1] - 30 * k, 8 * k, 0, TAU); g.fill(); lit(() => glow(GLOW.fire, c[0] + 90 * k, c[1] - 30 * k, 60 * k, .8));
}
function isetan() {                                  // the department store on the corner: stone, and the stepped lines of the twenties
  const x = 8100, f = box(x, 0, BZ, 800, 720, 520, '#8a7a62', '#5e5242'), r = on(f, 720);
  fill('rgba(255,226,170,.85)', () => r(.03, 26, .97, 180)); fill('#6a5a46', () => { for (let u = .05; u < 1; u += .1) r(u, 180, u + .02, 700); }); fill('rgba(255,217,138,.45)', () => { for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) r(.075 + i * .1, 220 + j * 92, .13 + i * .1, 280 + j * 92); });
  box(x, 720, BZ + 40, 520, 80, 400, '#8a7a62', '#5e5242'); box(x, 800, BZ + 80, 260, 60, 300, '#8a7a62', '#5e5242');
  text('伊勢丹', x, 640, BZ - 2, 56, '#f4efe4'); text('ISETAN · SHINJUKU', x, 196, BZ - 2, 20, '#2a1c12', EN);
}
function times() {                                   // Takashimaya Times Square
  const x = 10350, f = box(x, 0, BZ + 40, 860, 1200, 520, '#3c4250', '#252a33'), r = on(f, 1200);
  fill('rgba(255,226,170,.85)', () => r(.03, 26, .97, 170)); fill('rgba(170,215,255,.25)', () => { for (let y = 220; y < 1160; y += 56) r(.03, y, .97, y + 30); });
  text('TAKASHIMAYA TIMES SQUARE', x, 196, BZ + 38, 22, '#f4efe4', EN);
  const c = P(x, 1060, BZ + 38), k = c[2]; g.fillStyle = '#f4f1e6'; g.beginPath(); g.arc(c[0], c[1], 60 * k, 0, TAU); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 4 * k;
  const h = (E.T / 60) % 1 * TAU; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0] + Math.sin(h) * 40 * k, c[1] - Math.cos(h) * 40 * k); g.moveTo(c[0], c[1]); g.lineTo(c[0], c[1] - 50 * k); g.stroke();
}
function ruin(b) {                                   // past the garden: a building cut clean through, its top somewhere else
  const f = box(b.x + b.w / 2, 0, BZ, b.w, b.h, 520, '#2a2a30', '#18181d'), r = on(f, b.h);
  fill('rgba(0,0,0,.35)', () => { for (let i = 0; i < 6; i++) r(.08 + i * .15, 180, .15 + i * .15, b.h - 40); });
  const a = P(b.x - 30, b.h - b.cut, BZ - 6), c = P(b.x + b.w + 30, b.h + b.cut * .4, BZ - 6);
  g.strokeStyle = 'rgba(255,60,80,.6)'; g.lineWidth = 3 * a[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0], c[1]); g.stroke();
  fill('#0e0e12', () => { const p1 = P(b.x, b.h - b.cut, BZ - 4), p2 = P(b.x + b.w, b.h + b.cut * .4, BZ - 4), p3 = P(b.x + b.w, b.h + 400, BZ - 4), p4 = P(b.x, b.h + 400, BZ - 4); g.moveTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.lineTo(p3[0], p3[1]); g.lineTo(p4[0], p4[1]); g.closePath(); });
}
const LM = [{ x0: 360, x1: 1240, draw: tocho }, { x0: 1260, x1: 1780, draw: cocoon }, { x0: 1820, x1: 2400, draw: theEye }, { x0: 2780, x1: 4320, draw: station }, { x0: 5300, x1: 5820, draw: catScreen },
  { x0: 6250, x1: 6850, draw: kaiju }, { x0: 7700, x1: 8500, draw: isetan }, { x0: 9920, x1: 10780, draw: times }];

/* ---------- everything between them ---------- */
const SIGNS = ['カラオケ', 'ラーメン', '居酒屋', 'パチンコ', 'ホテル', 'ゲーム', '焼肉', '漫画', '寿司', '薬', 'バー', '占い'];
const WALLS = [['#1b2236', '#111626'], ['#2a2233', '#1a1522'], ['#20282c', '#14191c'], ['#2b2630', '#1b1820'], ['#1d2a3a', '#121b27']];
const NEON = ['#ff3d6e', '#38c8ff', '#ffd23d', '#8dff6a', '#c77dff'], WIN = ['#ffd98a', '#8fd6ff', '#ff9ec4'];
let seed = 53;
const r0 = () => (seed = seed * 16807 % 2147483647) / 2147483647;
const RES = LM.map(l => [l.x0, l.x1]).concat(DEEP.map(d => [d.x0, d.x1])).sort((a, b) => a[0] - b[0]), builds = [];
for (let x = -1700; x < LEN + 1700;) {
  const inside = RES.find(q => x >= q[0] - 1 && x < q[1]);
  if (inside) { x = inside[1]; continue; }
  const next = RES.find(q => q[0] > x), room = next ? next[0] - x : 1e9;
  let w = 260 + r0() * 300;
  if (room - w < 150) w = room;
  const wrecked = x > 11850, h = 380 + r0() * (r0() < .45 ? 1100 : 520), cols = Math.max(2, Math.round(w / 86)), rows = Math.max(2, Math.floor((h - 190) / 92)), wins = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if (r0() < .42) wins.push(i, j, r0() < .7 ? 0 : r0() < .6 ? 1 : 2);
  const wl = WALLS[r0() * WALLS.length | 0];
  builds.push(wrecked ? { x, w, h: 300 + r0() * 500, cut: 60 + r0() * 160, draw() { ruin(this); } }
    : { x, w, h, cols, wins, cf: wl[0], cs: wl[1], shop: NEON[r0() * 5 | 0], xmas: x > 8550 && x < 9950, sign: r0() < .7 ? { t: SIGNS[r0() * SIGNS.length | 0], c: NEON[r0() * 5 | 0], y: 200 + r0() * 120, side: r0() < .5 ? .14 : .86 } : null, draw() { generic(this); } });
  x += w;
}
for (const l of LM) builds.push({ x: l.x0, w: l.x1 - l.x0, draw: l.draw });
function generic(b) {
  const f = box(b.x + b.w / 2, 0, BZ, b.w, b.h, 520, b.cf, b.cs), r = on(f, b.h);
  fill('rgba(255,226,170,.82)', () => r(.06, 26, .94, 150)); fill(b.shop, () => r(.03, 150, .97, 178));
  for (let ci = 0; ci < 3; ci++) fill(WIN[ci], () => { for (let i = 0; i < b.wins.length; i += 3) if (b.wins[i + 2] === ci) { const u = b.wins[i] / b.cols, y = 214 + b.wins[i + 1] * 92; r(u + .2 / b.cols, y, u + .8 / b.cols, y + 56); } });
  if (b.xmas) fill('rgba(140,210,255,.9)', () => { for (let u = .05; u < .96; u += .06) r(u, 178, u + .015, 192); });
  if (b.sign) { const s = b.sign, n = s.t.length, sx = b.x + b.w * s.side; box(sx, s.y, BZ - 70, 46, n * 42 + 16, 70, s.c, 'rgba(0,0,0,.55)'); for (let i = 0; i < n; i++) text(s.t[i], sx, s.y + (n - i - .5) * 42 + 8, BZ - 70, 34, '#14060b'); }
}
function buildings() {
  const vis = builds.filter(b => b.x < cam.x + 2600 && b.x + b.w > cam.x - 2600).sort((p, q) => Math.abs(q.x + q.w / 2 - cam.x) - Math.abs(p.x + p.w / 2 - cam.x));
  for (const b of vis) b.draw();
  if (cam.x > 1800 && cam.x < 6000) {                 // the Chuo line, over the West Exit, orange
    const x0 = 2780, x1 = 4320, z = BZ - 80, cx = (x0 + x1) / 2;
    for (let x = x0 + 130; x < x1; x += 270) box(x, 12, z + 40, 44, 290, 70, '#3a3d48', '#24262e');
    box(cx, 300, z, x1 - x0, 60, 150, '#4a4e5c', '#2c2f39', '#5a5f6e');
    const tx = lerp(x0 - 1900, x1 + 300, (E.T * .07 + .4) % 1);
    for (let i = 0; i < 4; i++) { const c = tx + i * 410; if (c < x0 + 200 || c > x1 - 200) continue; const f = box(c, 372, z + 30, 396, 122, 90, '#c9ced8', '#8a8f9a'), r = on(f, 122); fill('#f15a22', () => r(0, 72, 1, 94)); fill('#ffe9a8', () => { for (let j = 0; j < 5; j++) r(.05 + j * .19, 34, .2 + j * .19, 66); }); }
  }
}

/* ---------- sky and ground ---------- */
const flakes = Array.from({ length: 140 }, (_, i) => [((i * 197) % 1000) / 1000, ((i * 83) % 1000) / 1000, .4 + (i % 5) * .15]);
function sky() {
  const HY = E.HY, VW = E.VW, VH = E.VH, pan = -(cam.x - LEN / 2) * .035 - cam.yaw * 760, T = E.T;
  let gr = g.createLinearGradient(0, 0, 0, HY);
  gr.addColorStop(0, '#04060f'); gr.addColorStop(.6, '#0c1430'); gr.addColorStop(1, '#2a2050');
  g.fillStyle = gr; g.fillRect(-300, -300, VW + 600, HY + 302);
  const dx = VW * .62 + pan * .5, dy = HY;                                   // the clock tower over the south side: a spire, and a lit face
  g.fillStyle = '#0c1020'; g.fillRect(dx - 46, dy - 420, 92, 420); g.beginPath(); g.moveTo(dx - 46, dy - 420); g.lineTo(dx, dy - 560); g.lineTo(dx + 46, dy - 420); g.closePath(); g.fill(); g.fillRect(dx - 3, dy - 640, 6, 90);
  g.fillStyle = '#f4f1e6'; g.beginPath(); g.arc(dx, dy - 380, 20, 0, TAU); g.fill(); lit(() => glow(GLOW.white || GLOW.blue, dx, dy - 380, 90, .5));
  if (E.T % 1.6 < .8) lit(() => glow(GLOW.red, dx, dy - 640, 40, 1));
  g.drawImage(E.skyline, VW / 2 - 1600 + pan * 2, HY - 298);
  if (cam.x > 11000) {                                                       // over the Showdown: the sky still not right
    const a = clamp((cam.x - 11000) / 1500, 0, 1);
    gr = g.createRadialGradient(VW * .5, HY - 100, 50, VW * .5, HY - 100, VW * .8); gr.addColorStop(0, `rgba(255,60,80,${.18 * a})`); gr.addColorStop(1, 'rgba(255,60,80,0)');
    g.fillStyle = gr; g.fillRect(-300, -300, VW + 600, HY + 302);
  }
  gr = g.createLinearGradient(0, HY - 190, 0, HY); gr.addColorStop(0, 'rgba(255,90,170,0)'); gr.addColorStop(1, 'rgba(255,90,170,.28)');
  g.fillStyle = gr; g.fillRect(-300, HY - 190, VW + 600, 192);
}
function ground() {
  const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR * .7, xa = cam.x - 3400, xb = cam.x + 3400, quad = E.quad;
  g.fillStyle = '#141419'; g.fillRect(-300, HY, VW + 600, VH - HY + 300);
  fill('#22222b', () => slab(xa, xb, CURB2, BZ + 700, 12));
  quad(P(xa, 12, CURB2), P(xb, 12, CURB2), P(xb, 0, CURB2), P(xa, 0, CURB2)); g.fillStyle = '#3a3a46'; g.fill();
  fill('rgba(232,232,240,.4)', () => { for (let x = Math.floor((cam.x - 3000) / 240) * 240; x < cam.x + 3000; x += 240) slab(x, x + 120, 1009, 1021, 0); slab(xa, xb, CURB1 + 24, CURB1 + 30, 0); slab(xa, xb, CURB2 - 30, CURB2 - 24, 0); });
  fill('rgba(240,240,246,.74)', () => { for (const [a, b] of [[4600, 4820], [5900, 6120]]) for (let z = CURB1 + 44; z < CURB2 - 60; z += 72) slab(a, b, z, z + 38, 0); });
  fill('rgba(235,240,250,.18)', () => { slab(xa, xb, CURB2 - 20, CURB2, 1); slab(xa, xb, CURB1, CURB1 + 20, 1); });      // snow, at the edges where nobody walks
  lit(() => { for (const x of LAMPS) { if (Math.abs(x - cam.x) > 2800) continue; const p = P(x, 0, 1150); g.save(); g.translate(p[0], p[1]); g.scale(1, .3); glow(GLOW.fire, 0, 0, 660 * p[2], .26); g.restore(); } });
  fill('#262631', () => slab(xa, xb, zn, CURB1, 12));
  g.beginPath();
  for (let x = Math.floor((cam.x - 2400) / 150) * 150; x < cam.x + 2400; x += 150) { const a = P(x, 12, zn), b = P(x, 12, CURB1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  for (const z of [430, 550, 670, CURB1 - 14]) { const a = P(xa, 12, z), b = P(xb, 12, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  g.strokeStyle = 'rgba(0,0,0,.34)'; g.lineWidth = 2; g.stroke();
  if (cam.x > 11700) fill('rgba(0,0,0,.4)', () => { for (let i = 0; i < 9; i++) { const x = 11900 + i * 280; slab(x, x + 160 + (i * 37 % 90), 820 + (i * 53 % 300), 900 + (i * 53 % 300), 1); } });      // what the fighting left in the road
}
function alley() {
  const T = E.T;
  for (const d of DEEP) {
    if (!near(d.x0, d.x1, 2800)) continue;
    const cx = (d.x0 + d.x1) / 2, w = d.x1 - d.x0;
    if (d.id === 'east') {                           // the East Exit's square, and the station's east face at the back of it
      fill('#2b2b36', () => slab(d.x0, d.x1, BZ - 4, d.z1, 12));
      g.beginPath(); for (let x = d.x0; x <= d.x1; x += 112) { const a = P(x, 12, BZ), b = P(x, 12, d.z1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1.5; g.stroke();
      const f = box(cx, 12, d.z1, w, 560, 40, '#2c3140', '#1a1d28'), r = on(f, 560);
      fill('rgba(200,230,255,.42)', () => r(.03, 260, .97, 520)); fill('#e8ecf4', () => r(.2, 180, .8, 250)); text('新宿駅 東口  EAST EXIT', cx, 215, d.z1, 30, '#1a1d28', EN);
      fill('rgba(255,226,170,.85)', () => { for (let i = 0; i < 6; i++) r(.08 + i * .14, 0, .16 + i * .14, 150); });
      continue;
    }
    if (d.id === 'crater') {                         // where the last of it happened: a bowl in the road, scorched, the cuts still in it
      fill('#1a1716', () => slab(d.x0, d.x1, BZ - 4, d.z1, 12));
      for (let i = 0; i < 4; i++) { const q = P(cx, 12, BZ + 300 + i * 200); g.save(); g.translate(q[0], q[1]); g.scale(1, .3); g.strokeStyle = `rgba(80,60,50,${.6 - i * .1})`; g.lineWidth = 8 * q[2]; g.beginPath(); g.arc(0, 0, (520 - i * 90) * q[2], 0, TAU); g.stroke(); g.restore(); }
      g.strokeStyle = 'rgba(255,60,80,.5)'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { const a = P(d.x0 + 80 + i * 180, 12, BZ + 40), b = P(d.x0 + 300 + i * 150, 12, d.z1 - 100); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      const q = P(cx, 60, d.z1 - 300); lit(() => glow(GLOW.purple, q[0], q[1], 900 * q[2], .2 + .05 * Math.sin(T * 2)));
      continue;
    }
    if (d.id === 'hanazono') {                       // the shrine in the middle of all of it
      fill('#2a2626', () => slab(d.x0, d.x1, BZ - 4, d.z1, 12));
      box(cx, 12, d.z1 - 40, 280, 240, 160, '#8a2a1c', '#5a1c12'); box(cx, 252, d.z1 - 60, 340, 30, 200, '#2a2d33', '#191b1f', '#3b3f48');
      const t = P(cx, 140, d.z1 - 40); lit(() => glow(GLOW.fire, t[0], t[1], 300 * t[2], .4));
      continue;
    }
    if (d.id === 'gyoen') {                          // the garden's gate, and its trees, black against the snow
      fill('#1e2a22', () => slab(d.x0, d.x1, BZ - 4, d.z1, 12)); fill('rgba(235,240,250,.25)', () => slab(d.x0, d.x1, BZ + 200, d.z1, 13));
      for (let i = 0; i < 6; i++) K.tree(d.x0 + 80 + i * 125, d.z1 - 100 - (i % 2) * 120);
      continue;
    }
    fill(d.id === 'kabuki' ? '#22202c' : '#121018', () => slab(d.x0, d.x1, BZ - 4, d.z1, 12));
    box(cx, 12, d.z1, w, 620, 30, '#0e0c14', '#0e0c14');
    const n = d.id === 'kabuki' ? 7 : 5;
    for (let i = n - 1; i >= 0; i--) for (const s of [-1, 1]) {
      const z = lerp(BZ + 90, d.z1 - 90, i / (n - 1)), x = s < 0 ? d.x0 + 28 : d.x1 - 28;
      if (d.id === 'omoide') { const q = P(x, 250, z); g.fillStyle = '#e0452f'; g.beginPath(); g.ellipse(q[0], q[1], 15 * q[2], 22 * q[2], 0, 0, TAU); g.fill(); lit(() => glow(GLOW.red, q[0], q[1], 190 * q[2], .7)); const sm = P(x - s * 40, 330 + ((T * 50 + i * 40) % 200), z); g.fillStyle = 'rgba(220,220,230,.12)'; g.beginPath(); g.arc(sm[0], sm[1], 30 * sm[2], 0, TAU); g.fill(); }
      else { const col = NEON[(i * 2 + (s > 0)) % 5]; box(x, 200 + (i % 3) * 70, z, 40, 150, 30, col, 'rgba(0,0,0,.5)'); const q = P(x, 280 + (i % 3) * 70, z); lit(() => glow(d.id === 'kabuki' ? GLOW.red : GLOW.fire, q[0], q[1], 220 * q[2], .35)); }
    }
  }
}

/* ---------- things that share the walk ---------- */
function xmasTree(x, z) {                            // a tree of blue lights
  const b = P(x, 12, z), t = P(x, 520, z), k = b[2];
  g.fillStyle = 'rgba(20,40,80,.6)'; g.beginPath(); g.moveTo(t[0], t[1]); g.lineTo(b[0] - 130 * k, b[1]); g.lineTo(b[0] + 130 * k, b[1]); g.closePath(); g.fill();
  lit(() => { for (let i = 0; i < 26; i++) { const u = i / 26, q = P(x + Math.sin(i * 2.4) * 120 * (1 - u), 20 + u * 490, z), on2 = (Math.floor(E.T * 3) + i) % 4; glow(on2 ? GLOW.blue : GLOW.white || GLOW.blue, q[0], q[1], 40 * q[2], .9); } const q = P(x, 530, z); glow(GLOW.fire, q[0], q[1], 90 * q[2], 1); });
}
function rubble(x, z) { for (let i = 0; i < 5; i++) box(x + (i - 2) * 46, 12, z + (i * 37 % 60), 60 + (i * 13 % 40), 30 + (i * 29 % 50), 50, '#3a3836', '#24221f', '#4a4744'); }
function front() {
  if (cam.x > 8000 && cam.x < 10500) {               // strings of lights across the street
    lit(() => { for (let x = 8600; x < 9900; x += 260) { if (Math.abs(x - cam.x) > 1900) continue; for (let i = 0; i <= 10; i++) { const u = i / 10, q = P(x + u * 200, 620 - Math.sin(u * Math.PI) * 80, 460 + u * 800); glow((i + Math.floor(E.T * 2)) % 3 ? GLOW.blue : GLOW.fire, q[0], q[1], 34 * q[2], .9); } } });
  }
  const VW = E.VW, VH = E.VH;                         // and the snow, coming down over all of it
  g.fillStyle = 'rgba(240,244,255,.75)';
  for (const [u, v, s] of flakes) { const x = ((u * (VW + 200) + Math.sin(E.T * s + u * 9) * 30 - cam.x * .2 * s) % (VW + 200) + VW + 200) % (VW + 200) - 100, y = ((v + E.T * .05 * s) % 1) * VH; g.fillRect(x, y, 2.5 * s, 2.5 * s); }
}

/* ================= who is here, and what can be done ================= */
const mine = o => Object.keys(o).filter(k => o[k].w === 'n');
K.mk('kashimo', { hp: 680 }); K.mk('higuruma', { hp: 560 }); K.mk('choso', { hp: 480 }); K.mk('ishigori', { hp: 560 }); K.mk('naoya3', { hp: 460 });
Object.assign(SH.RAIDS, {
  nparade: { w: 'n', name: 'The Night Parade', jp: '百鬼夜行・新宿', at: [4900, 1010], foes: ['grunt', 'warped', 'brute', 'ruin', 'brute', 'ruin', 'finger'], pay: 110, give: { ct: 2 }, first: { ct: 2, cl: 1 },
    say: 'December 24th, and a thousand curses let loose on Shinjuku at once. They are coming up out of the station in a crowd.' },
  colony: { w: 'n', name: 'The Shinjuku Colony', jp: '死滅回游', at: [6050, 1010], foes: ['reggie2', 'haba', 'uro', 'naoya3'], pay: 130, give: { ct: 2, tl: 1 }, first: { cl: 2 },
    say: 'Kabukicho has been made a game board. Players with points to win, and you are worth points.' },
  showdown: { w: 'n', name: 'The Shinjuku Showdown', jp: '新宿決戦', at: [13300, 2050], foes: ['mahoraga', 'meguna2'], pay: 400, give: { ct: 5, cl: 3, tl: 2 }, first: { ct: 5 },
    say: 'The strongest of today against the strongest of all time. This is where it happened, and it is happening again. The hardest thing in the game: the general first, then the King, with every finger.' }
});
Object.assign(SH.SECRETS, {
  nkashimo: { w: 'n', name: 'Thunder God', foe: 'sb_kashimo', at: [12300, 1290], pay: 160, first: { ct: 3 }, show: () => true, say: 'Somebody with blue hair is sitting on the rubble, bored out of his mind. Four hundred years he waited for a fight like the one here. You will have to do.' },
  nchoso: { w: 'n', name: 'Blood Brother', foe: 'sb_choso', at: [7065, 1830], pay: 120, first: { cl: 2 }, show: () => true, say: 'At the back of the smallest bar in Golden Gai a man with a mark across his nose is drinking nothing. He says he is somebody’s big brother.' },
  nhiguruma: { w: 'n', name: 'The Judge', foe: 'sb_higuruma', at: [8100, 1290], pay: 150, first: { ct: 2, tl: 1 }, show: () => (M.nwins || 0) >= 3, say: 'On the department store’s steps a man in a suit has set up a court. He says the defendant is you.' },
  nishigori: { w: 'n', name: 'Granite Cannon', foe: 'sb_ishigori', at: [2585, 1850], pay: 140, first: { ct: 2 }, show: () => !!M.raids.nparade, say: 'Down Omoide Yokocho, a man with a pompadour is eating every skewer on the grill. He is still hungry. For a fight, he says.' },
  nnaoya: { w: 'n', name: 'Frame Runner', foe: 'sb_naoya3', at: [11390, 2000], pay: 160, first: { cl: 3 }, show: () => !!M.raids.colony, say: 'In the snow under the garden’s trees something is moving at twenty-four frames a second. It used to be a man.' }
});
Object.assign(JU.story.WHO, { shinjuku: JU.story.WHO.shinjuku || ['Shinjuku', '新宿', '#8fd6ff'] });
const LINES = {
  yuta: () => [['yuta', 'A year ago, on this same night, a thousand curses came up out of this station. I was somewhere else, fighting the one who sent them.'], ['yuta', M.raids.nparade ? 'You cleared them. Thank you. The East Exit is quiet again.' : 'They are back. The square at the East Exit. Start there.']],
  todo: () => [['todo', 'My friend! You found me in front of the eye. It suits me, does it not?'], ['todo', 'I stood here once and thought about the strongest people in the world. Then I thought about my best friend. Which is you.']],
  gojo: () => [['gojo', 'Am I going to lose? The King of Curses, back at full strength, with ten shadows to hand?'], ['gojo', 'Nah, I would win.'], ['gojo', M.raids.showdown ? '...You actually did it. Huh. Maybe you are the strongest now.' : 'The crater at the end of the street. Go and see for yourself what it takes.']],
  maki: () => [['maki', 'The towers behind me are where they run Tokyo from. Nobody up there knows what happened down here tonight.'], ['maki', 'If you are going east, go armed. Past the garden it is not a city any more.']],
  hakari: () => [['hakari', 'Kabukicho on Christmas Eve! Every parlour open, every machine hot. This is my kind of night.'], ['hakari', M.raids.colony ? 'You beat the game board? Ha! You have got fever.' : 'The red gate. Somebody turned the whole street into a game. Want to play? I would.']]
};
const WHO = [['yuta', JU.cast4.YUTA, 3300, 1290, 1.02, 'Keeper of the Queen'], ['todo', JU.cast2.TODO, 2100, 700, 1.2, 'Clapping Brawler'], ['gojo', C.GOJO, 12450, 700, 1.06, 'Blindfolded Infinity'],
  ['maki', JU.cast2.MAKI, 900, 700, 1, 'Heavenly Blade'], ['hakari', JU.cast5.HAKARI, 5760, 1290, 1.04, 'Jackpot Gambler']];
function cast() { return WHO.map(w => { const f = E.fighter(w[1], w[2], -1); f.z = w[3]; f.y = f.ground0 = 12; f.scale = w[4]; f.pose = C.STAND.slice(); f.target = C.STAND; return f; }); }
const spots = [
  { x: STAIRS[0], z: STAIRS[1] - 40, r: 160, h: 220, icon: '乗', col: '#e60012', label: 'Down to the subway', use: () => JU.metro.down('shinjuku') },
  { x: 5560, z: 1300, r: 160, h: 330, icon: '猫', label: 'Look up at the cat', use: () => S.talk([['shinjuku', 'Four storeys of cat lean out of the corner of the screen, look the crowd over, yawn, and go back in. Nobody but you looks up.']]) },
  ...WHO.map(w => ({ x: w[2], z: w[3], r: 160, h: 350 * w[4], icon: '話', label: 'Talk to ' + w[5], use: () => S.talk(LINES[w[0]]()) })),
  ...mine(SH.RAIDS).map(id => ({ x: SH.RAIDS[id].at[0], z: SH.RAIDS[id].at[1], r: 150, h: 430, icon: '討', col: '#ff5a6e', raid: id, label: () => 'Raid · ' + SH.RAIDS[id].name + (M.raids[id] ? ' · cleared ' + M.raids[id] : ''), use: () => K.raid(id) })),
  ...mine(SH.SECRETS).map(id => ({ x: SH.SECRETS[id].at[0], z: SH.SECRETS[id].at[1], r: 140, h: 430, icon: '？', col: '#c77dff', secret: id, show: SH.SECRETS[id].show, label: () => (M.secrets[id] ? SH.SECRETS[id].name + ' · again' : 'Something is here'), use: () => K.secret(id) }))
];
const props = [...LAMPS.map(x => ({ z: 1270, draw: () => lamp(x) })),
  { z: 1356, draw: () => arch(DEEP[0], '思い出横丁', '#3a1a12', '#ffd98a') }, { z: 1356, draw: () => arch(DEEP[2], '歌舞伎町一番街', '#c8102e', '#fff2c0') }, { z: 1356, draw: () => arch(DEEP[3], 'ゴールデン街', '#2a2233', '#ffd23d') },
  { z: 1356, draw() { if (near(7280, 7600)) K.arch(DEEP[4], '花園神社', '#8a2a1c', '#f4efe4'); } }, { z: 1356, draw() { if (near(11000, 11780)) K.arch(DEEP[5], '新宿御苑', '#1f3a28', '#e8e2d2'); } },
  ...[8800, 9300, 9800].map(x => ({ z: 1150, draw: () => { if (near(x - 200, x + 200)) xmasTree(x, 1150); } })),
  ...[12100, 12550, 14000].map((x, i) => ({ z: 700 + i * 220, draw: () => { if (near(x - 200, x + 200)) rubble(x, 700 + i * 220); } })),
  ...spots.filter(s => s.raid || s.secret).map(s => ({ z: s.z + 1, draw: () => column(s, s.raid ? GLOW.red : GLOW.purple, s.raid ? 'rgba(255,90,110,.9)' : 'rgba(199,125,255,.9)') }))];

const world = { name: 'shinjuku', label: 'Shinjuku', LEN, Z0, Z1, BZ, gy, free, sky, ground, alley, buildings, props, front, cast, spots, civs: 18, respawn: 45,
  SPOTS: [[380, 640, 'grunt'], [1700, 1290, 'brute'], [2900, 660, ['warped', 'warped2']], [4300, 1290, 'grunt'], [5200, 660, ['warped', 'warped2', 'brute']], [6300, 1290, 'brute'], [7400, 660, 'ruin'],
    [8600, 1290, ['grunt', 'brute']], [9600, 660, 'ruin'], [10800, 1290, 'brute'], [11950, 660, 'ruin'], [12800, 1290, 'finger'], [14100, 660, 'special']],
  stage(x0) { const sh = fn => () => { cam.x += x0; fn(); cam.x -= x0; }; return { sky: sh(sky), floor: sh(ground), back: sh(() => { alley(); buildings(); for (const p of props) if (p.z > 1000) p.draw(); }), front: sh(front) }; },
  won() { M.nwins = (M.nwins || 0) + 1; SH.save(); },
  status(st, set) { const a = areaAt(S.me.x); set(`${a[1]} <span lang="ja">${a[2]}</span>`, `Shinjuku · December 24th · E talk or use · exorcised here ${M.nwins || 0} · raids ${K.tally(M.raids, 'n')}/3 · secret bosses ${K.tally(M.secrets, 'n')}/5`); },
  tick(dt, real, p, st) {
    if (!M.nbeen) { M.nbeen = 1; SH.save(); S.talk([['shinjuku', 'Shinjuku, Christmas Eve. Snow, and lights in every window, and the busiest station in the world under it all.'], ['shinjuku', 'West: the towers, the eye, the lane of grills. East: the cat, Kabukicho, Golden Gai, the shrine, the Christmas street, the garden. And past the garden, what the Showdown left.']]); }
    const a = areaAt(p.x);
    if (st.area !== a) { st.area = a; S.status(); }
    return false;
  } };
const stop = SH.STOPS.find(s => s.id === 'shinjuku');
if (stop) Object.assign(stop, { at: () => [STAIRS[0] - 60, STAIRS[1] - 150, -1], world: () => world });
JU.shinjuku = { world, AREAS };
})();
