/* JUJUTSU UNLIMITEDS — the Kyoto expansion: a second district on the line, built the way Shibuya is (shibuya.js, whose pieces it borrows).
   Laid out from the real city, west to east along one street: the bamboo grove at Arashiyama · Kinkaku-ji, the Golden Pavilion, over its
   pond · Kyoto Jujutsu High · Kyoto Station and Kyoto Tower · the Kamo River and the bridge over it · Gion and Hanamikoji lane · Yasaka
   Shrine's vermilion gate · the five-storey Yasaka Pagoda · Kiyomizu-dera on its stage of timber · the thousand gates of Fushimi Inari · and,
   at the east end, the Zenin clan's estate. Over all of it the hills, with the great 大 of Daimonji burning on one of them.
   Who is met where, the three raids and the five secret bosses are ours, hung on what the series puts in Kyoto: the Goodwill Event and what
   broke into it, the thousand curses of the Night Parade, the Zenin clan, and the sorcerers of a thousand years ago who knew it as the capital */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, box = E.box, glow = E.glow, GLOW = E.GLOW, cam = E.cam, C = JU.cast, Fi = JU.fights, sfx = JU.sfx, S = JU.street, SH = JU.shibuya, K = SH.kit, M = SH.M;
const { lerp, clamp, rnd, LINE, TOR } = E, TAU = Math.PI * 2, { slab, fill, lit, on, text, lamp, column, arch, JP, EN } = K;

const LEN = 12000, Z0 = 500, Z1 = 1340, CURB1 = 790, CURB2 = 1240, BZ = 1380;
const DEEP = [{ id: 'bamboo', x0: 600, x1: 900, z1: 2300 }, { id: 'hanami', x0: 6900, x1: 7180, z1: 2100 }, { id: 'yasaka', x0: 7600, x1: 8400, z1: 1960 }, { id: 'torii', x0: 10500, x1: 10780, z1: 2400 }];
const RIVER = [5800, 6600], LAMPS = [350, 1250, 2600, 4050, 5450, 6750, 8500, 9150, 10300, 10950, 11700];
const AREAS = [[0, 'Arashiyama', '嵐山'], [1350, 'Kinkaku-ji', '金閣寺'], [2750, 'Kyoto Jujutsu High', '京都府立呪術高専'], [4150, 'Kyoto Station', '京都駅'], [5700, 'Crimson River', '鴨川'], [6700, 'Gion', '祇園'],
  [7500, 'Yasaka Shrine', '八坂神社'], [8450, 'Higashiyama', '東山'], [9250, 'Kiyomizu-dera', '清水寺'], [10350, 'Fushimi Inari', '伏見稲荷'], [10900, 'The Heavenly Estate', '一族の家']];
const areaAt = x => AREAS.filter(a => x >= a[0]).pop();
const gy = z => (z < CURB1 || z > CURB2 ? 12 : 0);
function free(x, z) {
  if (x < 80 || x > LEN - 80 || z < Z0) return false;
  if (z > Z1) { const d = DEEP.find(a => x > a.x0 + 34 && x < a.x1 - 34); return !!d && z < d.z1 - 130; }
  return true;
}
const roof = (x, y, z, w, d, h = 22) => box(x, y, z - 40, w, h, d + 80, '#2a2d33', '#191b1f', '#3b3f48');       // tiles, overhanging what they cover
const VERM = '#c8402a', VERM2 = '#8a2a1c', GOLD = '#e2b63c', WOOD = '#3a2a1e', WOOD2 = '#241a12';

/* ---------- the landmarks, west to east ---------- */
function kinkaku() {                                 // the Golden Pavilion: three storeys over a pond, the top two gilded
  const x = 1900;
  fill('#10283c', () => slab(1480, 2320, BZ - 30, BZ + 420, 2)); lit(() => { const q = P(x, 0, BZ + 40); g.save(); g.translate(q[0], q[1]); g.scale(1, .22); glow(GLOW.fire, 0, 0, 900 * q[2], .5); g.restore(); });
  box(x, 12, BZ + 120, 440, 130, 300, '#e9e2d0', '#b9b2a0'); fill(WOOD, () => { const r = on(box(x, 12, BZ + 120, 440, 130, 300, '#e9e2d0', '#b9b2a0'), 130); for (let u = .06; u < .94; u += .11) r(u, 0, u + .02, 130); });
  roof(x, 142, BZ + 120, 520, 300); box(x, 164, BZ + 150, 380, 120, 240, GOLD, '#a8842a'); roof(x, 284, BZ + 150, 460, 240);
  box(x, 306, BZ + 180, 240, 104, 180, '#f0c84a', '#b08c2e'); roof(x, 410, BZ + 180, 330, 180, 18);
  const t = P(x, 470, BZ + 270); g.fillStyle = GOLD; g.beginPath(); g.moveTo(t[0], t[1] - 30 * t[2]); g.lineTo(t[0] + 16 * t[2], t[1]); g.lineTo(t[0] - 16 * t[2], t[1]); g.closePath(); g.fill();
  lit(() => glow(GLOW.fire, t[0], t[1] + 150 * t[2], 760 * t[2], .32));
}
function school() {                                  // Kyoto Jujutsu High: a white wall with a tiled cap, a gate in it, and the hall behind
  const x = 3350;
  box(x, 12, BZ + 260, 620, 330, 300, '#3a2f28', '#231c17'); roof(x, 342, BZ + 260, 760, 300, 30); roof(x, 372, BZ + 300, 560, 220, 26);
  box(x, 12, BZ, 900, 210, 40, '#e8e2d2', '#b4ae9e'); roof(x, 222, BZ, 920, 40, 18);
  box(x, 12, BZ - 20, 230, 290, 70, WOOD, WOOD2); roof(x, 302, BZ - 20, 320, 70); fill('#0c0806', () => { const r = on(box(x, 12, BZ - 20, 230, 290, 70, WOOD, WOOD2), 290); r(.14, 0, .86, 230); });
  text('京都府立呪術高等専門学校', x, 262, BZ - 20, 19, '#e8e2d2');
}
function station() {                                 // Kyoto Station: glass and steel, the one thing here that is not old
  const x = 4700, f = box(x, 0, BZ, 800, 540, 520, '#1d2430', '#11161e'), r = on(f, 540);
  fill('rgba(170,215,255,.2)', () => { for (let i = 0; i < 12; i++) for (let j = 0; j < 5; j++) r(.03 + i * .08, 190 + j * 66, .095 + i * .08, 240 + j * 66); });
  fill('rgba(255,226,170,.85)', () => r(.05, 26, .95, 150)); fill('#e8ecf4', () => r(.3, 150, .7, 182)); text('京都駅  KYOTO STATION', x, 166, BZ, 24, '#1a1d28', EN);
}
function tower() {                                   // Kyoto Tower: a white candle with a ring of red near the top
  const x = 5300; box(x, 0, BZ, 300, 330, 480, '#2b3140', '#1a1d28'); fill('rgba(255,226,170,.8)', () => on(box(x, 0, BZ, 300, 330, 480, '#2b3140', '#1a1d28'), 330)(.06, 26, .94, 150));
  const a = P(x - 34, 330, BZ + 200), b = P(x + 34, 330, BZ + 200), c = P(x + 15, 900, BZ + 200), d = P(x - 15, 900, BZ + 200);
  g.fillStyle = '#eef0f4'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); g.fill();
  box(x, 880, BZ + 150, 130, 54, 100, '#e0462e', '#9c2c1c', '#f06a4a'); box(x, 934, BZ + 170, 80, 30, 60, '#eef0f4', '#b0b4be'); box(x, 964, BZ + 195, 8, 110, 8, '#eef0f4', '#b0b4be');
  K.beacon(x, 1080, BZ + 200, 80); const q = P(x, 905, BZ + 150); lit(() => glow(GLOW.fire, q[0], q[1], 420 * q[2], .5));
}
function pagoda() {                                  // the Yasaka Pagoda: five roofs, one over another, and a spire
  const x = 8750;
  for (let i = 0; i < 5; i++) { box(x, 12 + i * 112, BZ + 120, 170 - i * 16, 90, 170 - i * 16, WOOD, WOOD2); roof(x, 102 + i * 112, BZ + 120, 330 - i * 34, 170 - i * 16, 20); }
  box(x, 584, BZ + 195, 8, 150, 8, '#8a6a3c', '#5e4526'); const q = P(x, 300, BZ + 100); lit(() => glow(GLOW.fire, q[0], q[1], 620 * q[2], .22));
}
function kiyomizu() {                                // Kiyomizu-dera: the hall, and the stage it stands on, held up by timber and no nails
  const x = 9750, f = box(x, 12, BZ, 820, 300, 60, 'rgba(58,42,30,.0)', 'rgba(0,0,0,0)'), r = on(f, 300);
  fill(WOOD, () => { for (let u = .02; u < 1; u += .07) r(u, 0, u + .018, 300); for (let y = 40; y < 300; y += 62) r(0, y, 1, y + 12); });
  box(x, 312, BZ - 20, 900, 22, 300, '#4a3626', '#2c2016', '#5c4532'); box(x, 334, BZ + 120, 560, 150, 240, WOOD, WOOD2); roof(x, 484, BZ + 120, 720, 240, 40); roof(x, 524, BZ + 170, 420, 140, 34);
  for (const [dx, dz] of [[-470, 60], [470, 100], [-380, 220]]) { const t = P(x + dx, 300, BZ + dz), k = t[2]; g.fillStyle = '#b3261e'; for (const o of [[0, 0, 90], [-56, 26, 64], [58, 22, 70]]) { g.beginPath(); g.arc(t[0] + o[0] * k, t[1] + o[1] * k, o[2] * k, 0, TAU); g.fill(); } }      // maples, in the red of the season
}
function estate() {                                  // the Zenin clan's estate: a long white wall, and one heavy gate
  const x = 11450;
  box(x, 12, BZ + 300, 520, 300, 300, '#30261f', '#1d1712'); roof(x, 312, BZ + 300, 660, 300, 34);
  box(x, 12, BZ, 900, 240, 50, '#e6e0d0', '#b2ac9c'); roof(x, 252, BZ, 920, 50, 20);
  const f = box(x, 12, BZ - 26, 300, 320, 80, '#241a12', '#140e0a'), r = on(f, 320); roof(x, 332, BZ - 26, 400, 80, 26);
  fill('#0a0705', () => r(.1, 0, .9, 270)); fill('#8a6a3c', () => { r(.47, 0, .53, 270); for (const u of [.2, .8]) for (const y of [60, 200]) r(u - .02, y, u + .02, y + 12); });
  const q = P(x, 300, BZ - 26); g.strokeStyle = '#e6e0d0'; g.lineWidth = 3 * q[2]; g.beginPath(); g.arc(q[0], q[1], 20 * q[2], 0, TAU); g.stroke(); text('禪', x, 300, BZ - 26, 24, '#e6e0d0');
}
const LM = [{ x0: 1480, x1: 2320, draw: kinkaku }, { x0: 2900, x1: 3800, draw: school }, { x0: 4300, x1: 5100, draw: station }, { x0: 5150, x1: 5450, draw: tower }, { x0: RIVER[0], x1: RIVER[1], draw() {} },
  { x0: 8580, x1: 8920, draw: pagoda }, { x0: 9300, x1: 10200, draw: kiyomizu }, { x0: 11000, x1: 11900, draw: estate }];

/* ---------- everything between them: machiya, the wooden townhouses ---------- */
const NOREN = ['#3b5b7a', '#7a2a2a', '#2f5a3a', '#5a4a7a', '#8a6a1c'], KANJI = ['茶', '酒', '湯', '麺', '菓', '宿', '花', '扇', '香', '味'];
let seed = 31;
const r0 = () => (seed = seed * 16807 % 2147483647) / 2147483647;
const RES = LM.map(l => [l.x0, l.x1]).concat(DEEP.map(d => [d.x0, d.x1])).sort((a, b) => a[0] - b[0]), builds = [];
for (let x = -1700; x < LEN + 1700;) {
  const inside = RES.find(q => x >= q[0] - 1 && x < q[1]);
  if (inside) { x = inside[1]; continue; }
  const next = RES.find(q => q[0] > x), room = next ? next[0] - x : 1e9;
  let w = 240 + r0() * 200;
  if (room - w < 140) w = room;
  builds.push({ x, w, h: r0() < .6 ? 330 + r0() * 60 : 230 + r0() * 30, col: NOREN[r0() * 5 | 0], k: KANJI[r0() * 10 | 0], lan: r0() < .6, draw() { machiya(this); } });
  x += w;
}
for (const l of LM) builds.push({ x: l.x0, w: l.x1 - l.x0, draw: l.draw });
function machiya(b) {
  const cx = b.x + b.w / 2, f = box(cx, 0, BZ, b.w, b.h, 480, WOOD, WOOD2), r = on(f, b.h), two = b.h > 300;
  fill('rgba(255,214,150,.78)', () => r(.07, 22, .93, 150));                                             // paper screens, lit from inside
  fill('#1c130c', () => { for (let u = .07; u < .93; u += .045) r(u, 22, u + .013, 150); r(.07, 84, .93, 92); });   // and the lattice over them
  if (two) { fill('rgba(255,214,150,.5)', () => r(.14, 214, .86, 292)); fill('#1c130c', () => { for (let u = .14; u < .86; u += .055) r(u, 214, u + .015, 292); }); }
  fill(b.col, () => r(.32, 98, .68, 152)); text(b.k, cx, 125, BZ, 34, '#f4efe4');                       // the cloth over the door, with what the house sells
  roof(cx, 166, BZ, b.w + 24, 30, 18); roof(cx, b.h, BZ, b.w + 24, 480, 24);
  if (b.lan) { const q = P(b.x + b.w * .14, 118, BZ - 44); g.fillStyle = '#f6e7c4'; g.beginPath(); g.ellipse(q[0], q[1], 15 * q[2], 22 * q[2], 0, 0, TAU); g.fill(); lit(() => glow(GLOW.fire, q[0], q[1], 190 * q[2], .7)); }
}
function buildings() {
  const vis = builds.filter(b => b.x < cam.x + 2600 && b.x + b.w > cam.x - 2600).sort((p, q) => Math.abs(q.x + q.w / 2 - cam.x) - Math.abs(p.x + p.w / 2 - cam.x));
  for (const b of vis) b.draw();
  if (cam.x > RIVER[0] - 2600 && cam.x < RIVER[1] + 2600) {                                               // the bridge's far railing, where the houses stop for the river
    box((RIVER[0] + RIVER[1]) / 2, 12, BZ - 20, RIVER[1] - RIVER[0], 70, 26, '#8b8f99', '#5c6069', '#a9adb7');
    for (let x = RIVER[0] + 60; x < RIVER[1]; x += 170) { box(x, 12, BZ - 26, 30, 110, 34, '#9a9ea8', '#666a73', '#b4b8c2'); const q = P(x, 138, BZ - 26); lit(() => glow(GLOW.fire, q[0], q[1], 150 * q[2], .5)); }
  }
}

/* ---------- sky and ground ---------- */
function sky() {
  const HY = E.HY, VW = E.VW, pan = -(cam.x - LEN / 2) * .03 - cam.yaw * 760, T = E.T;
  let gr = g.createLinearGradient(0, 0, 0, HY);
  gr.addColorStop(0, '#040714'); gr.addColorStop(.6, '#101a3a'); gr.addColorStop(1, '#43305a');
  g.fillStyle = gr; g.fillRect(-300, -300, VW + 600, HY + 302);
  const mx = VW * .3 + pan * .3, my = Math.max(90, HY - 330);
  lit(() => glow(GLOW.blue, mx, my, 420, .32)); g.fillStyle = '#f6f1dc'; g.beginPath(); g.arc(mx, my, 42, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 40; i++) { const x = ((i * 197 + pan * .2) % (VW + 200) + VW + 200) % (VW + 200) - 100, y = (i * 83 % 100) / 100 * (HY - 160); g.fillRect(x, y, 2, 2); }
  for (let l = 0; l < 2; l++) {                                                                           // the hills that stand round the city
    g.fillStyle = l ? '#0c1220' : '#141c30'; g.beginPath(); g.moveTo(-300, HY + 2);
    for (let x = -300; x <= VW + 300; x += 40) g.lineTo(x, HY - (l ? 70 : 120) - 46 * Math.sin((x - pan * (l ? 1.6 : 1)) * .004 + l * 2) - 22 * Math.sin((x - pan * (l ? 1.6 : 1)) * .011 + l));
    g.lineTo(VW + 300, HY + 2); g.closePath(); g.fill();
  }
  const dx = VW * .68 + pan * 1.6, dy = HY - 128;                                                         // and on one of them, 大, in fire
  lit(() => glow(GLOW.fire, dx, dy, 240, .5 + .1 * Math.sin(T * 5))); g.font = "86px 'Vessel Syuku','Yu Mincho',serif"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffb04a'; g.fillText('大', dx, dy);
  gr = g.createLinearGradient(0, HY - 150, 0, HY); gr.addColorStop(0, 'rgba(255,170,90,0)'); gr.addColorStop(1, 'rgba(255,170,90,.22)');
  g.fillStyle = gr; g.fillRect(-300, HY - 150, VW + 600, 152);
}
function ground() {
  const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR * .7, xa = cam.x - 3400, xb = cam.x + 3400;
  g.fillStyle = '#1b1a1d'; g.fillRect(-300, HY, VW + 600, VH - HY + 300);
  fill('#262228', () => slab(xa, xb, CURB2, BZ + 700, 12));
  E.quad(P(xa, 12, CURB2), P(xb, 12, CURB2), P(xb, 0, CURB2), P(xa, 0, CURB2)); g.fillStyle = '#3d3840'; g.fill();
  g.beginPath();                                                                                           // stone setts, not tarmac
  for (let x = Math.floor((cam.x - 2800) / 110) * 110; x < cam.x + 2800; x += 110) { const a = P(x, 0, CURB1), b = P(x, 0, CURB2); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  for (let z = CURB1 + 75; z < CURB2; z += 75) { const a = P(xa, 0, z), b = P(xb, 0, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1.5; g.stroke();
  lit(() => { for (const x of LAMPS) { if (Math.abs(x - cam.x) > 2800) continue; const p = P(x, 0, 1150); g.save(); g.translate(p[0], p[1]); g.scale(1, .3); glow(GLOW.fire, 0, 0, 700 * p[2], .3); g.restore(); } });
  fill('#2c282e', () => slab(xa, xb, zn, CURB1, 12));
  g.beginPath();
  for (let x = Math.floor((cam.x - 2400) / 150) * 150; x < cam.x + 2400; x += 150) { const a = P(x, 12, zn), b = P(x, 12, CURB1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  for (const z of [430, 550, 670, CURB1 - 14]) { const a = P(xa, 12, z), b = P(xb, 12, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  g.strokeStyle = 'rgba(0,0,0,.34)'; g.lineWidth = 2; g.stroke();
}
// what lies back from the street: the river, the three lanes and the shrine's forecourt
function alley() {
  const T = E.T;
  if (cam.x > RIVER[0] - 2800 && cam.x < RIVER[1] + 2800) {                                               // the Kamo, running away north under the moon
    fill('#0f2740', () => slab(RIVER[0], RIVER[1], BZ - 4, BZ + 2600, -40)); fill('#151b26', () => { slab(RIVER[0], RIVER[0] + 90, BZ, BZ + 2600, 4); slab(RIVER[1] - 90, RIVER[1], BZ, BZ + 2600, 4); });
    lit(() => { for (let i = 0; i < 7; i++) { const q = P((RIVER[0] + RIVER[1]) / 2 + Math.sin(T * 1.3 + i) * 40, -38, BZ + 200 + i * 300); g.save(); g.translate(q[0], q[1]); g.scale(1, .2); glow(GLOW.blue, 0, 0, 520 * q[2], .35); g.restore(); } });
  }
  for (const d of DEEP) {
    if (d.x1 < cam.x - 2800 || d.x0 > cam.x + 2800) continue;
    const cx = (d.x0 + d.x1) / 2, w = d.x1 - d.x0;
    if (d.id === 'yasaka') {                                                                               // the shrine's forecourt, and its gate
      fill('#2f2a2e', () => slab(d.x0, d.x1, BZ - 4, d.z1, 12));
      box(cx, 12, d.z1 - 120, 620, 40, 120, '#8b8f99', '#5c6069', '#a9adb7'); box(cx, 52, d.z1 - 60, 540, 260, 70, VERM, VERM2);
      fill('#f1ead8', () => { const r = on(box(cx, 52, d.z1 - 60, 540, 260, 70, VERM, VERM2), 260); r(.06, 30, .3, 230); r(.7, 30, .94, 230); }); fill('#0c0806', () => on(box(cx, 52, d.z1 - 60, 200, 230, 70, VERM, VERM2), 230)(.08, 0, .92, 220));
      roof(cx, 312, d.z1 - 60, 700, 70, 34); box(cx, 346, d.z1 - 40, 420, 110, 60, VERM, VERM2); roof(cx, 456, d.z1 - 40, 600, 60, 40);
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const q = P(cx + s * (300 + i * 20), 150, d.z1 - 200 - i * 150); g.fillStyle = '#f6e7c4'; g.beginPath(); g.ellipse(q[0], q[1], 16 * q[2], 24 * q[2], 0, 0, TAU); g.fill(); lit(() => glow(GLOW.fire, q[0], q[1], 200 * q[2], .7)); }
      continue;
    }
    fill(d.id === 'bamboo' ? '#1c1a14' : d.id === 'torii' ? '#2a2420' : '#1e1a1c', () => slab(d.x0, d.x1, BZ - 4, d.z1, 12));
    box(cx, 12, d.z1, w, 620, 30, '#0c0a0e', '#0c0a0e');
    const n = d.id === 'hanami' ? 5 : 11;
    for (let i = n - 1; i >= 0; i--) {
      const z = lerp(BZ + 70, d.z1 - 80, i / (n - 1));
      if (d.id === 'torii') {                                                                              // gate after gate after gate, each one somebody's thanks
        box(d.x0 + 26, 12, z, 22, 330, 22, VERM, VERM2); box(d.x1 - 26, 12, z, 22, 330, 22, VERM, VERM2); box(cx, 330, z, w + 40, 26, 22, VERM, VERM2, '#e0583e'); box(cx, 292, z, w - 30, 14, 18, VERM, VERM2);
        box(d.x0 + 26, 12, z, 26, 40, 26, '#17120f', '#0c0908'); box(d.x1 - 26, 12, z, 26, 40, 26, '#17120f', '#0c0908');
      } else if (d.id === 'bamboo') for (const s of [-1, 1]) for (let j = 0; j < 2; j++) {                 // bamboo, close on both sides and far over his head
        const x = (s < 0 ? d.x0 + 24 + j * 30 : d.x1 - 24 - j * 30) + Math.sin(i * 3 + j) * 10;
        box(x, 12, z + j * 40, 16, 900, 16, j ? '#3f7a3a' : '#5a9a48', '#2a5626'); fill('#2a5626', () => { const a = P(x - 9, 200 + (i * 53 % 130), z + j * 40), b = P(x + 9, 206 + (i * 53 % 130), z + j * 40); g.rect(a[0], b[1], b[0] - a[0], a[1] - b[1]); });
      } else for (const s of [-1, 1]) { const q = P(s < 0 ? d.x0 + 30 : d.x1 - 30, 240, z); g.fillStyle = (i + (s > 0)) % 2 ? '#e0452f' : '#f6e7c4'; g.beginPath(); g.ellipse(q[0], q[1], 17 * q[2], 25 * q[2], 0, 0, TAU); g.fill(); lit(() => glow((i + (s > 0)) % 2 ? GLOW.red : GLOW.fire, q[0], q[1], 200 * q[2], .7)); }
    }
    if (d.id === 'torii') { const q = P(cx, 150, d.z1 - 200); lit(() => glow(GLOW.fire, q[0], q[1], 800 * q[2], .3)); }
  }
}
function front() {                                    // stone lanterns on the near side, here and there
  for (const x of [1100, 3350, 6200, 8000, 9750, 11450]) { if (Math.abs(x - cam.x) > 1700) continue; box(x, 12, 452, 40, 130, 40, '#3b3d44', '#27292e', '#4a4d55'); box(x, 142, 446, 62, 40, 52, '#44474e', '#2c2e33', '#55585f'); const q = P(x, 162, 446); lit(() => glow(GLOW.fire, q[0], q[1], 130 * q[2], .45)); }
}

/* ================= who is here, and what can be done ================= */
// Utahime Iori: a shrine maiden's white and red, and the scar across her face
const UTAHIME = Object.assign({}, C.civ(1), { torso: ['#d9d4c8', '#f1ece0'], armF: ['#d9d4c8', '#f1ece0', '#d9b99b', '#e8cbb0', .16], armB: ['#b9b4a8', '#cfcabd', '#b59479', '#c5a489', .16],
  legF: ['#9c1f1f', '#c22a2a', '#e8e2d2', '#f4efe4', .1], legB: ['#6e1616', '#8f1e1e', '#b9b4a8', '#cfcabd', .1], chest() { g.fillStyle = '#c22a2a'; g.fillRect(-30, -12, 60, 12); },
  head() {
    E.headBase('#d9b99b', '#e8cbb0');
    g.beginPath(); g.roundRect(-26, -28, 52, 22, [12, 12, 3, 3]); g.fillStyle = '#16141a'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke(); g.fillRect(-26, -8, 12, 34);
    g.fillStyle = '#f4efe4'; g.fillRect(-27, -22, 54, 5); g.fillStyle = LINE; g.beginPath(); g.ellipse(5, 3, 2.4, 3, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(17, 3, 2.1, 3, 0, 0, TAU); g.fill();
    g.strokeStyle = '#a8705c'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, 8); g.lineTo(22, 12); g.stroke();
  } });
Object.assign(JU.story.WHO, { todo: ['Clapping Brawler', '拍手', '#38c8ff'], mai: ['Bullet Maker', '構築', '#c77dff'], utahime: ['Shrine Singer', '歌姫', '#e0452f'], maki: ['Heavenly Blade', '天与', '#7ddc9a'], kyoto: ['Kyoto', '京都', '#ffb04a'] });
K.mk('todo', { hp: 480 }); K.mk('uro', { hp: 600 }); K.mk('yorozu', { hp: 640 }); K.mk('yuta', { hp: 760, dr: .7 }); K.mk('naoya2', { hp: 620 });
Fi.DEFS.sb_geto = Object.assign({}, Fi.DEFS.kenjaku, { name: 'Curse Eater', jp: '呪霊使い', skin: JU.cast3.GETO, hp: 520 });
Object.assign(SH.RAIDS, {
  goodwill: { w: 'k', name: 'The Goodwill Event', jp: '交流会', at: [3650, 1290], foes: ['ruin', 'brute', 'ruin', 'hanami'], pay: 90, give: { ct: 1 }, first: { cl: 2 }, say: 'The two schools were meant to be fighting each other. Something came through the curtain instead.' },
  thousand: { w: 'k', name: 'A Thousand Curses', jp: '百鬼夜行', at: [6200, 1010], foes: ['grunt', 'brute', 'ruin', 'warped2', 'ruin', 'sb_geto'], pay: 130, give: { ct: 2 }, first: { ct: 2, cl: 2 }, say: 'He loosed a thousand of them on Kyoto, and they are coming over the bridge. The man who keeps them comes last.' },
  zenin: { w: 'k', name: 'The Heavenly Estate', jp: '一族の家', at: [11450, 1290], foes: ['hei', 'hei', 'kukuru', 'ogi', 'naoya'], pay: 150, give: { tl: 2 }, first: { tl: 2, cl: 2 }, say: 'Through the gate: the clan’s swordsmen, the captain of its guard, its elders, and the one who thinks it is already his.' }
});
Object.assign(SH.SECRETS, {
  todo: { w: 'k', name: 'Clapping Brawler', foe: 'sb_todo', at: [3120, 1290], pay: 90, first: { ct: 2 }, show: () => true, say: 'He has already decided the two of you are best friends. He would like to find out how strong his best friend is.' },
  yorozu: { w: 'k', name: 'The Constructor', foe: 'sb_yorozu', at: [750, 2130], pay: 150, first: { cl: 2, tl: 1 }, show: () => true, say: 'At the far end of the bamboo somebody is standing very still. She has been waiting a thousand years for somebody else, and you will do for now.' },
  uro: { w: 'k', name: 'Sky Captain', foe: 'sb_uro', at: [10640, 2220], pay: 150, first: { ct: 3 }, show: () => (M.kwins || 0) >= 5, say: 'At the top of the gates the air is bent like glass. A captain of the old capital’s guard is standing in the middle of it.' },
  yuta: { w: 'k', name: 'Keeper of the Queen', foe: 'sb_yuta', at: [9750, 700], pay: 200, first: { ct: 3, cl: 2 }, show: () => !!M.raids.thousand, say: 'A boy in white with a sword on his back is looking down from the stage. Something very large is standing behind him.' },
  naoya2: { w: 'k', name: 'Frame Runner', foe: 'sb_naoya2', at: [11780, 700], pay: 220, first: { cl: 3, tl: 2 }, show: () => !!M.raids.zenin, say: 'Something has come back to the estate that died there, and it is faster than it was.' }
});
const T2 = (a, b) => [[a, b]];
const LINES = {
  todo: () => [['todo', 'My friend! Before anything else: what kind of woman is your type?'], ['todo', 'No, do not answer. I can see it in how you stand. We understand each other completely.'], ['todo', 'The light by the gate, if you want to know what I think of you with my fists.']],
  mai: () => [['mai', 'Tokyo sends its strays all the way out here now?'], ['mai', M.raids.zenin ? 'You went through the estate. Good. I never liked that house.' : 'My family’s estate is at the east end of this street. Nobody who goes in there uninvited comes out pleased.']],
  utahime: () => [['utahime', 'The barrier over the school was broken from the inside once. I would rather it were not broken twice.'], ['utahime', M.raids.thousand ? 'The bridge is quiet again. Somebody is standing on the stage at Kiyomizu now. He was not there yesterday.' : 'There are curses coming over the Crimson bridge in numbers I have not seen since that winter. Start there.']],
  maki: () => [['maki', 'That gate behind me. I grew up on the wrong side of it.'], ['maki', M.raids.zenin ? 'So it is done. Then whatever is still moving in there is not one of them any more.' : 'If you are going in, go in properly. The light in front of it.']],
  daimonji: () => T2('kyoto', 'On the hill a character as tall as a street is burning: 大, great. They light it once a year to see the dead back where they came from. Tonight it has been left alight.')
};
const WHO = [['todo', JU.cast2.TODO, 3000, 1290, 1.2, 'Clapping Brawler'], ['mai', JU.cast5.MAI, 3560, 700, 1, 'Bullet Maker'], ['utahime', UTAHIME, 7850, 1640, 1, 'Shrine Singer'], ['maki', JU.cast2.MAKI, 11150, 700, 1, 'Heavenly Blade']];
function cast() { return WHO.map(w => { const f = E.fighter(w[1], w[2], -1); f.z = w[3]; f.y = f.ground0 = 12; f.scale = w[4]; f.pose = C.STAND.slice(); f.target = C.STAND; return f; }); }
const mine = o => Object.keys(o).filter(k => o[k].w === 'k');
const spots = [
  { x: 4700, z: 1300, r: 170, h: 220, icon: '乗', col: '#38c8ff', label: 'Take the train', use: () => SH.openMap() },
  { x: 8000, z: 1500, r: 150, h: 300, icon: '大', label: 'Look up at the hill', use: () => S.talk(LINES.daimonji()) },
  ...WHO.map(w => ({ x: w[2], z: w[3], r: 160, h: 350 * w[4], icon: '話', label: 'Talk to ' + w[5], use: () => S.talk(LINES[w[0]]()) })),
  ...mine(SH.RAIDS).map(id => ({ x: SH.RAIDS[id].at[0], z: SH.RAIDS[id].at[1], r: 150, h: 430, icon: '討', col: '#ff5a6e', raid: id, label: () => 'Raid · ' + SH.RAIDS[id].name + (M.raids[id] ? ' · cleared ' + M.raids[id] : ''), use: () => K.raid(id) })),
  ...mine(SH.SECRETS).map(id => ({ x: SH.SECRETS[id].at[0], z: SH.SECRETS[id].at[1], r: 140, h: 430, icon: '？', col: '#c77dff', secret: id, show: SH.SECRETS[id].show, label: () => (M.secrets[id] ? SH.SECRETS[id].name + ' · again' : 'Something is here'), use: () => K.secret(id) }))
];
const props = [...LAMPS.map(x => ({ z: 1270, draw: () => lamp(x) })),
  { z: 1356, draw: () => arch(DEEP[0], '竹林の小径', '#2a3a22', '#bfe6a0') }, { z: 1356, draw: () => arch(DEEP[1], '花見小路', '#3a1a12', '#ffd98a') }, { z: 1356, draw: () => arch(DEEP[3], '千本鳥居', VERM, '#f4efe4') },
  ...spots.filter(s => s.raid || s.secret).map(s => ({ z: s.z + 1, draw: () => column(s, s.raid ? GLOW.red : GLOW.purple, s.raid ? 'rgba(255,90,110,.9)' : 'rgba(199,125,255,.9)') }))];

const world = { name: 'kyoto', label: 'Kyoto', LEN, Z0, Z1, BZ, gy, free, sky, ground, alley, buildings, props, front, cast, spots, civs: 13, respawn: 45,
  SPOTS: [[380, 640, 'grunt'], [1250, 660, 'brute'], [2600, 1290, 'grunt'], [4150, 660, 'ruin'], [5550, 1290, ['grunt', 'brute']], [6750, 660, 'brute'], [8480, 1290, 'ruin'], [9200, 660, ['brute', 'ruin']], [10330, 1290, 'finger'], [11850, 1290, 'special']],
  stage(x0) { const sh = fn => () => { cam.x += x0; fn(); cam.x -= x0; }; return { sky: sh(sky), floor: sh(ground), back: sh(() => { alley(); buildings(); for (const p of props) if (p.z > 1000) p.draw(); }), front: sh(front) }; },
  won() { M.kwins = (M.kwins || 0) + 1; SH.save(); },
  status(st, set) { const a = areaAt(S.me.x); set(`${a[1]} <span lang="ja">${a[2]}</span>`, `Kyoto · E talk or use · exorcised here ${M.kwins || 0} · raids ${K.tally(M.raids, 'k')}/3 · secret bosses ${K.tally(M.secrets, 'k')}/5`); },
  tick(dt, real, p, st) {
    if (!M.kbeen) { M.kbeen = 1; SH.save(); S.talk([['kyoto', 'Kyoto. A thousand years the capital, and older than that in places. The school’s sister is here, and so is the Heavenly clan.'], ['kyoto', 'West: the bamboo and the Golden Pavilion. East: Gion, the shrine, the pagoda, Kiyomizu, the thousand gates, and the estate at the end of the street.']]); }
    const a = areaAt(p.x);
    if (st.area !== a) { st.area = a; S.status(); }
    return false;
  } };
SH.STOPS.push({ id: 'kyoto', name: 'Kyoto', jp: '京都', code: ['K', 11, '#1f9d55'], x: 150, y: 250, at: () => [4700, 1250, -1], world: () => world });
JU.kyoto = { world, AREAS };
})();
