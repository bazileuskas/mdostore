/* JUJUTSU UNLIMITEDS — Build 0.16v1: JUJUTSU HIGH. Free Exploration starts here now, not on the Tokyo block.
   The school as the series has it: a campus of old wooden buildings high in the mountains on the edge of Tokyo, passed off as a Buddhist
   temple, hidden in cedar forest under the Barrier Master's barrier; reached by a long flight of stone stairs under torii gates. It has
   dormitories, classrooms, a training ground, an infirmary with a morgue, a storehouse for cursed objects, and far underground the corridor
   of doors called the Tombs of the Star. Late afternoon, the light going gold, crows over the trees.
   West to east: the storehouse and the way down to the Tombs · the dormitory, three rooms open (The Vessel's, the Shadow Summoner's, the
   Straw Doll's) · the vending machines and the bench · the school building (the first years' classroom, where Blindfolded Infinity
   teaches; the Principal's office, full of cursed corpses) · the main hall and its courtyard · the infirmary, where The Healer works ·
   the training ground (the second years) · the main gate, and through it the stone stairs down the mountain · the mountain road, through
   the cedars, with curses kept loose in the woods for practice · a convenience store, and the little station at the bottom, Jujutsu
   High Station (KO 55), one platform, where the trains into the city stop.
   The Healer's errands: find her three medical cases, beat the Clapping Brawler on the training ground, bring back a piece of the
   Disaster Bloom from the forest, clear the Soul Shaper out of the storehouse and find her old notes in it. About five minutes, and at the
   end she teaches REVERSED CURSED TECHNIQUE (the first sub technique, subtech.js) and pays ¥10,000.
   Two things are hiding: the Curse Eater in front of the main hall (once the errands are done), and the Sorcerer Killer down in the Tombs.
   Everything that is not from the series (the layout, the lines, the errands, the numbers) is ours */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, box = E.box, glow = E.glow, GLOW = E.GLOW, cam = E.cam, C = JU.cast, Fi = JU.fights, sfx = JU.sfx, S = JU.street, SH = JU.shibuya, K = SH.kit, M = SH.M, MT = JU.metro, Y = JU.yen;
const { lerp, clamp, rnd, LINE, TOR } = E, TAU = Math.PI * 2, { slab, fill, lit, on, text, column, JP, EN } = K;
const dev = () => !!(JU.account && JU.account.dev);
const quad = (a, b, c, d) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); };
const near = (x0, x1, m = 2600) => x1 > cam.x - m && x0 < cam.x + m;

/* ================= what is remembered ================= */
const J = { q: 0, cases: [0, 0, 0], been: 0 };      // q: how far through The Healer's errands (0 not started ... 8 done)
try { Object.assign(J, JSON.parse(localStorage.getItem('ju.jjh') || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem('ju.jjh', JSON.stringify(J)); } catch (e) {} };

/* ================= the lie of the land ================= */
const LEN = 13600, Z0 = 500, Z1 = 1340, BZ = 1380, FL = 420;     // FL: the ground floor's ceiling
const ROOMS = {
  yuji: { x0: 1150, x1: 1510, z1: 2040 }, megumi: { x0: 1550, x1: 1910, z1: 2040 }, nobara: { x0: 1950, x1: 2310, z1: 2040 },
  klass: { x0: 3080, x1: 3640, z1: 2100 }, yaga: { x0: 3700, x1: 4060, z1: 2040 }, inf: { x0: 5640, x1: 6260, z1: 2100 } };
const DEEP = { tomb: { x0: 700, x1: 980, z1: 2700 }, hall: { x0: 4320, x1: 5480, z1: 2340 }, field: { x0: 6380, x1: 7380, z1: 2560 },
  gstairs: { x0: 7630, x1: 7870, z1: 2900 }, bstairs: { x0: 8500, x1: 8740, z1: 2900 } };
const TREES = [8000, 8420];                                         // no way between the gate and the road but the stairs
const GX = 12520, CABS = [540, 830, 1120, 1330], LANES = [[575, 795], [865, 1085], [1155, 1300]];
const STN = [11640, 12480], PLAT = [12560, 13560], TSTOP = 14300;
const AREAS = [[0, 'The Storehouse', '忌庫'], [1050, 'The Dormitory', '学生寮'], [2420, 'The Vending Machines', '自販機'], [2980, 'The School Building', '校舎'], [4300, 'The Main Hall', '本堂'],
  [5560, 'The Infirmary', '医務室'], [6340, 'The Training Ground', '訓練場'], [7420, 'The Main Gate', '正門'], [8420, 'The Mountain Road', '山道'], [11000, 'The Foot of the Mountain', '麓'], [11640, 'Jujutsu High Station', '呪術高専前駅']];
const areaAt = x => AREAS.filter(a => x >= a[0]).pop();
const inA = (x, a, m = 30) => x > a.x0 + m && x < a.x1 - m;
const G = MT.gates(GX, LANES, 'jjh');
function gy(z, x) {
  if (z > Z1) {
    if (inA(x, DEEP.gstairs, 0)) return 12 - Math.max(0, z - BZ - 60) * .45;      // down the stone stairs, under the torii
    if (inA(x, DEEP.bstairs, 0)) return 12 + Math.max(0, z - BZ - 60) * .45;      // and up them, from the road
  }
  return 12;
}
function free(x, z) {
  if (x < 80 || x > LEN - 80 || z < Z0) return false;
  if (x > TREES[0] && x < TREES[1]) return false;
  if (z > Z1) {
    for (const k in ROOMS) if (inA(x, ROOMS[k])) return z < ROOMS[k].z1 - 110;
    for (const k in DEEP) if (inA(x, DEEP[k], 34)) return z < DEEP[k].z1 - 120;
    return false;
  }
  const gt = G.free(x, z); if (gt !== null) return gt;
  if (Math.abs(x - 7250) < 180 && z > 1040 && z < 1200) return false;      // round the car
  return true;
}

/* ================= drawing pieces ================= */
const WOOD = '#4a3426', WOOD2 = '#2e2018', PLAS = '#ece6d8', PLAS2 = '#bdb6a6', TILE = '#3d4452', TILE2 = '#2a303b', STONE = '#8f8a80', STONE2 = '#6a665e', VERM = '#c8402a', VERM2 = '#8a2a1c';
// a temple roof over a footprint: eaves that lift at the corners, hips going back to a ridge, tiles running down it
function roofT(x, y, z, w, d, h, col = TILE) {
  const ov = 70, x0 = x - w / 2 - ov, x1 = x + w / 2 + ov, zf = z - ov, zb = z + d + ov, zr = z + d / 2;
  const tl = P(x0, y + 26, zf), tr = P(x1, y + 26, zf), mid = P(x, y - 10, zf), rl = P(x - w / 2 + w * .2, y + h, zr), rr = P(x + w / 2 - w * .2, y + h, zr), bl = P(x0, y + 26, zb), br = P(x1, y + 26, zb);
  g.fillStyle = TILE2; quad(tl, rl, rl, bl); g.fill(); quad(tr, rr, rr, br); g.fill();
  g.beginPath(); g.moveTo(tl[0], tl[1]); g.quadraticCurveTo(mid[0], mid[1] + (tl[1] - mid[1]) * .2, tr[0], tr[1]); g.lineTo(rr[0], rr[1]); g.lineTo(rl[0], rl[1]); g.closePath(); g.fillStyle = col; g.fill();
  g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 1.5; g.beginPath();
  for (let i = 1; i < 18; i++) { const u = i / 18, e = P(lerp(x0, x1, u), y + 26 - Math.sin(u * Math.PI) * 30, zf), r = P(lerp(x - w / 2 + w * .2, x + w / 2 - w * .2, u), y + h, zr); g.moveTo(e[0], e[1]); g.lineTo(r[0], r[1]); }
  g.stroke();
  g.strokeStyle = '#1b1f27'; g.lineWidth = 9 * rl[2]; g.lineCap = 'round'; g.beginPath(); g.moveTo(rl[0], rl[1]); g.lineTo(rr[0], rr[1]); g.stroke(); g.lineCap = 'butt';
  g.fillStyle = '#1b1f27'; for (const q of [rl, rr]) g.fillRect(q[0] - 8 * q[2], q[1] - 18 * q[2], 16 * q[2], 18 * q[2]);      // the ridge's end tiles
  g.strokeStyle = '#1b1f27'; g.lineWidth = 4 * tl[2]; g.beginPath(); g.moveTo(tl[0], tl[1]); g.quadraticCurveTo(mid[0], mid[1] + (tl[1] - mid[1]) * .2, tr[0], tr[1]); g.stroke();
}
function torii(x, y, z, w, h, col = VERM, col2 = VERM2) {
  for (const s of [-1, 1]) { box(x + s * (w / 2 - 20), y, z, 26, h, 26, col, col2); box(x + s * (w / 2 - 20), y, z, 32, 36, 32, '#1c1c22', '#0e0e12'); }
  box(x, y + h * .72, z, w - 10, 22, 18, col, col2); box(x, y + h - 30, z, w + 40, 28, 26, col, col2);
  box(x, y + h - 2, z, w + 90, 26, 32, '#1c1c22', '#0e0e12', '#2a2a30');
}
function lantern(x, z, s = 1) {
  box(x, 12, z, 60 * s, 26 * s, 60 * s, STONE, STONE2, '#a39e94'); box(x, 38 * s, z + 10 * s, 24 * s, 86 * s, 24 * s, STONE, STONE2);
  box(x, 124 * s, z, 58 * s, 50 * s, 58 * s, '#9a958a', STONE2, '#b0aba0'); box(x, 174 * s, z - 10 * s, 86 * s, 18 * s, 80 * s, '#7a756c', '#5a564e', '#8f8a80'); box(x, 192 * s, z + 14 * s, 22 * s, 18 * s, 22 * s, STONE, STONE2);
  const q = P(x, 148 * s, z); g.fillStyle = 'rgba(255,214,150,.95)'; g.fillRect(q[0] - 10 * q[2] * s, q[1] - 12 * q[2] * s, 20 * q[2] * s, 22 * q[2] * s); lit(() => glow(GLOW.fire, q[0], q[1], 190 * q[2] * s, .55));
}
function cedar(x, z, h = 900, tone = 0) {
  box(x, 12, z, 30, h * .62, 30, '#5e3b28', '#3e2618');
  const greens = [['#1d3a29', '#16301f'], ['#244630', '#1a3523'], ['#1a3224', '#122619']][tone % 3];
  for (let i = 0; i < 4; i++) {
    const y0 = h * (.32 + i * .17), y1 = y0 + h * .3, r = 150 - i * 30, a = P(x - r, y0, z), b = P(x + r, y0, z), t = P(x, y1, z);
    g.fillStyle = greens[i % 2]; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + t[0]) / 2 - 10 * a[2], (a[1] + t[1]) / 2, t[0], t[1]); g.quadraticCurveTo((b[0] + t[0]) / 2 + 10 * a[2], (b[1] + t[1]) / 2, b[0], b[1]); g.closePath(); g.fill();
  }
}
function maple(x, z, red = true) {
  box(x, 12, z, 26, 200, 26, '#4a3020', '#2e1e14');
  const t = P(x, 280, z), k = t[2], cols = red ? ['#b3261e', '#d9542a', '#8f1f18'] : ['#3f7a3a', '#5a9a48', '#2f5a2c'];
  for (const [dx, dy, r, c] of [[0, 0, 110, 0], [-80, 30, 80, 1], [84, 26, 86, 2], [10, -66, 80, 1], [-40, -40, 60, 2]]) { g.fillStyle = cols[c]; g.beginPath(); g.arc(t[0] + dx * k, t[1] + dy * k, r * k, 0, TAU); g.fill(); }
}
function vend(x, z, col, light = true) {
  const f = box(x, 12, z, 92, 186, 60, col, '#7f8799', '#dfe4ec'), r = on(f, 186);
  fill('#1a1f2c', () => r(.1, 100, .9, 170));
  const drinks = ['#d62a2a', '#2a7fd6', '#f2c200', '#3ddc84', '#f4f4f0', '#8a4a20'];
  for (let j = 0; j < 3; j++) fill(drinks[(j * 2 + (x / 7 | 0)) % 6], () => { for (let i = 0; i < 5; i++) r(.14 + i * .15, 108 + j * 20, .24 + i * .15, 122 + j * 20); });
  fill('#222', () => r(.3, 30, .7, 46));
  if (light) { const q = P(x, 140, z); lit(() => glow(GLOW.blue, q[0], q[1], 260 * q[2], .45)); }
}
function crow(x, y, z, t) {                         // a crow, flapping
  const q = P(x, y, z), k = q[2] * 1.4, f = Math.sin(t * 9) * 7;
  g.strokeStyle = '#0b0b10'; g.lineWidth = 2.6 * k; g.beginPath(); g.moveTo(q[0] - 12 * k, q[1] - f * k); g.quadraticCurveTo(q[0] - 5 * k, q[1] - 3 * k, q[0], q[1]); g.quadraticCurveTo(q[0] + 5 * k, q[1] - 3 * k, q[0] + 12 * k, q[1] - f * k); g.stroke();
}

/* ---------- sky and ground ---------- */
function sky() {
  const HY = E.HY, VW = E.VW, pan = -(cam.x - LEN / 2) * .03 - cam.yaw * 760, T = E.T;
  let gr = g.createLinearGradient(0, 0, 0, HY);
  gr.addColorStop(0, '#2c4a78'); gr.addColorStop(.45, '#7d7fa6'); gr.addColorStop(.78, '#e8a36a'); gr.addColorStop(1, '#f7d39a');
  g.fillStyle = gr; g.fillRect(-300, -300, VW + 600, HY + 302);
  const sx = VW * .18 + pan * .4, sy = HY - 120;                                                  // the sun, low over the mountains
  lit(() => { glow(GLOW.fire, sx, sy, 900, .55); glow(GLOW.fire, sx, sy, 260, .9); }); g.fillStyle = '#fff4d6'; g.beginPath(); g.arc(sx, sy, 34, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,240,225,.5)';                                                            // long thin clouds lit from underneath
  for (let i = 0; i < 6; i++) { const cx = ((i * 331 + pan * .25) % (VW + 600) + VW + 600) % (VW + 600) - 300, cy = 70 + (i * 53 % 160); g.beginPath(); g.ellipse(cx, cy, 160 + i * 20, 9 + i % 3 * 3, 0, 0, TAU); g.fill(); }
  const layers = [['#5d6f93', 230, .6, 90], ['#465877', 170, 1, 70], ['#2f3d55', 120, 1.6, 54], ['#1f2a3a', 70, 2.4, 40]];      // the mountains, ridge behind ridge, bluer as they go back
  for (const [col, hh, par, amp] of layers) {
    g.fillStyle = col; g.beginPath(); g.moveTo(-300, HY + 2);
    for (let x = -300; x <= VW + 300; x += 30) { const u = x - pan * par; g.lineTo(x, HY - hh - amp * Math.sin(u * .0035 + par) - amp * .45 * Math.sin(u * .011 + par * 2)); }
    g.lineTo(VW + 300, HY + 2); g.closePath(); g.fill();
  }
  if (cam.x < TREES[1] + 1200) {                                                                   // the barrier over the school: you only see it where the light catches it
    const a = clamp((TREES[1] + 1200 - cam.x) / 1200, 0, 1), cx = VW / 2 + pan * .6 - (cam.x - 4000) * .08;
    g.strokeStyle = `rgba(200,220,255,${.16 * a})`; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(cx, HY + 60, VW * (1.1 - i * .12), HY * (1.15 - i * .1), 0, Math.PI, TAU); g.stroke(); }
    g.strokeStyle = `rgba(200,220,255,${.07 * a})`; g.beginPath();
    for (let i = 1; i < 12; i++) { const an = Math.PI + i / 12 * Math.PI; g.moveTo(cx + Math.cos(an) * VW * .2, HY + 60 + Math.sin(an) * HY * .2); g.lineTo(cx + Math.cos(an) * VW * 1.1, HY + 60 + Math.sin(an) * HY * 1.15); }
    g.stroke();
  }
  for (let i = 0; i < 5; i++) { const t = T * .05 + i * .21, x = ((t % 1) * (VW + 400)) - 200, y = 120 + i * 26 + Math.sin(T + i) * 8; const q = [x, y]; g.save(); g.translate(q[0], q[1]); g.scale(1.3, 1.3); g.strokeStyle = '#141018'; g.lineWidth = 2; const f = Math.sin(T * 8 + i) * 4; g.beginPath(); g.moveTo(-8, -f); g.quadraticCurveTo(-3, -2, 0, 0); g.quadraticCurveTo(3, -2, 8, -f); g.stroke(); g.restore(); }      // crows going home
  gr = g.createLinearGradient(0, HY - 140, 0, HY); gr.addColorStop(0, 'rgba(255,200,140,0)'); gr.addColorStop(1, 'rgba(255,200,140,.28)');
  g.fillStyle = gr; g.fillRect(-300, HY - 140, VW + 600, 142);
}
function ground() {
  const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR * .7, xa = cam.x - 3400, xb = cam.x + 3400, road = cam.x > TREES[0] - 1800;
  g.fillStyle = '#7d776c'; g.fillRect(-300, HY, VW + 600, VH - HY + 300);
  fill('#9a9488', () => slab(xa, Math.min(xb, TREES[0]), zn, BZ + 700, 12));                       // gravel, raked
  g.beginPath(); for (let z = 560; z < BZ; z += 46) { const a = P(xa, 12, z), b = P(Math.min(xb, TREES[0]), 12, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } g.strokeStyle = 'rgba(0,0,0,.07)'; g.lineWidth = 1.2; g.stroke();
  fill('#c8c1b2', () => { for (let x = Math.floor(xa / 130) * 130; x < Math.min(xb, TREES[0]); x += 130) slab(x, x + 116, 860, 980, 13); });      // the stone path
  if (road) {
    const r0 = Math.max(xa, TREES[1] - 60);
    fill('#3a3b40', () => slab(r0, xb, 760, 1300, 12)); fill('#4b5a3a', () => { slab(r0, xb, zn, 760, 12); slab(r0, Math.min(xb, STN[0] - 200), 1300, BZ + 700, 12); });
    fill('rgba(240,240,240,.7)', () => { slab(r0, xb, 790, 800, 13); slab(r0, xb, 1262, 1272, 13); for (let x = Math.floor(r0 / 260) * 260; x < xb; x += 260) slab(x, x + 140, 1026, 1036, 13); });
    if (cam.x > STN[0] - 2600) fill('#a9a59c', () => slab(Math.max(xa, STN[0] - 200), xb, zn, BZ + 4, 12));     // the station's concrete
    if (cam.x > PLAT[0] - 2600) fill('#f2c200', () => slab(Math.max(xa, PLAT[0]), xb, 1270, 1296, 13));
  }
  lit(() => { const q = P(cam.x, 12, 1000); g.save(); g.translate(q[0], q[1]); g.scale(1, .25); glow(GLOW.fire, 0, 0, 3000 * q[2], .1); g.restore(); });      // the evening light, lying across everything
}

/* ---------- rooms, and what lies back from the walk ---------- */
const STYLE = {
  yuji: { floor: '#b9905c', wall: '#e9e1cf', ceil: '#d7cdb8', light: GLOW.fire },
  megumi: { floor: '#a88456', wall: '#dfe3e6', ceil: '#cfd3d6', light: GLOW.fire },
  nobara: { floor: '#c49a66', wall: '#f1dfe4', ceil: '#e2d0d6', light: GLOW.fire },
  klass: { floor: '#9a7a52', wall: '#e2dccb', ceil: '#d4ccb8', light: GLOW.white || GLOW.fire },
  yaga: { floor: '#7a5a3a', wall: '#d9cfb8', ceil: '#c9bea6', light: GLOW.fire },
  inf: { floor: '#cfd3cf', wall: '#eef1ee', ceil: '#dfe3df', light: GLOW.white || GLOW.blue } };
function room(id) {
  const R = ROOMS[id], st = STYLE[id], cx = (R.x0 + R.x1) / 2, w = R.x1 - R.x0;
  if (!near(R.x0, R.x1)) return;
  box(cx, 12, R.z1, w, FL - 12, 20, st.wall, st.wall);
  g.fillStyle = 'rgba(0,0,0,.12)'; quad(P(R.x0, 12, BZ), P(R.x0, 12, R.z1), P(R.x0, FL, R.z1), P(R.x0, FL, BZ)); g.fill(); quad(P(R.x1, 12, BZ), P(R.x1, 12, R.z1), P(R.x1, FL, R.z1), P(R.x1, FL, BZ)); g.fill();
  g.fillStyle = st.wall; g.globalAlpha = .9; quad(P(R.x0, 12, BZ), P(R.x0, 12, R.z1), P(R.x0, FL, R.z1), P(R.x0, FL, BZ)); g.fill(); quad(P(R.x1, 12, BZ), P(R.x1, 12, R.z1), P(R.x1, FL, R.z1), P(R.x1, FL, BZ)); g.fill(); g.globalAlpha = 1;
  fill(st.floor, () => slab(R.x0, R.x1, BZ - 4, R.z1, 12));
  g.beginPath(); for (let x = R.x0; x < R.x1; x += 60) { const a = P(x, 12, BZ), b = P(x, 12, R.z1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 1.2; g.stroke();
  fill(st.ceil, () => slab(R.x0, R.x1, BZ - 4, R.z1, FL));
  const l = P(cx, FL - 6, (BZ + R.z1) / 2); lit(() => { glow(st.light, l[0], l[1], w * 1.6 * l[2], .55); });
  const win = on(box(cx, 12, R.z1 - 2, w, FL - 12, 2, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)'), FL - 12);      // a window in the back wall, the evening in it
  if (id !== 'inf') { fill('#f0b27a', () => win(.3, 170, .7, 330)); fill(WOOD, () => { win(.295, 166, .705, 172); win(.295, 328, .705, 334); win(.497, 170, .503, 330); }); }
}
function steps(a, upward) {                         // the stone stairs: down the mountain from the gate, or up it from the road
  const cx = (a.x0 + a.x1) / 2, n = 22;
  if (!upward) { const m = P(cx, 12, BZ)[1]; g.save(); g.beginPath(); g.rect(-9999, -9999, 30000, m + 9999); g.clip(); }      // (going down: the ground in front hides all of it that is lower than its edge)
  for (let i = n - 1; i >= 0; i--) {
    const z = BZ + 60 + (a.z1 - BZ - 60) * i / n, y = 12 + (upward ? 1 : -1) * (z - BZ - 60) * .45;
    fill(i % 2 ? '#a7a196' : '#938d82', () => slab(a.x0 + 10, a.x1 - 10, z, z + (a.z1 - BZ) / n, y));
  }
  fill('#938d82', () => slab(a.x0 + 10, a.x1 - 10, BZ - 4, BZ + 60, 12));
  for (let i = 5; i >= 0; i--) {                     // torii, one after another down the flight
    const z = BZ + 160 + i * 250, y = 12 + (upward ? 1 : -1) * (z - BZ - 60) * .45;
    torii(cx, y, z, a.x1 - a.x0 + 40, 380);
  }
  for (const s of [-1, 1]) for (let i = 4; i >= 0; i--) { const z = BZ + 260 + i * 300; cedar(cx + s * (a.x1 - a.x0) * .9, z, 1000, i); }
  if (!upward) g.restore();
}
function alley() {
  for (const id in ROOMS) room(id);
  const T = E.T, tb = DEEP.tomb;
  if (near(tb.x0, tb.x1)) {                          // the way down to the Tombs of the Star: a corridor of doors going on further than it should
    fill('#15131a', () => slab(tb.x0, tb.x1, BZ - 4, tb.z1, 12)); box((tb.x0 + tb.x1) / 2, 12, tb.z1, tb.x1 - tb.x0, 600, 20, '#0a090d', '#0a090d');
    for (let i = 9; i >= 0; i--) { const z = BZ + 120 + i * 120; for (const s of [-1, 1]) { const x = s < 0 ? tb.x0 + 26 : tb.x1 - 26, f = box(x, 12, z, 12, 300, 70, '#2a2230', '#1a1520'), r = on(f, 300); fill('#4a3a2a', () => r(.1, 0, .9, 260)); } }
    for (let i = 0; i < 4; i++) { const q = P((tb.x0 + tb.x1) / 2 + Math.sin(i * 2) * 60, 40, BZ + 300 + i * 300); lit(() => glow(GLOW.fire, q[0], q[1], 140 * q[2], .5 + .2 * Math.sin(T * 6 + i))); }
  }
  const h = DEEP.hall;
  if (near(h.x0, h.x1)) {                            // the courtyard, and the main hall at the back of it
    fill('#9f998c', () => slab(h.x0, h.x1, BZ - 4, h.z1, 12));
    fill('#c8c1b2', () => { for (let z = BZ + 40; z < h.z1 - 300; z += 110) slab(4840, 4960, z, z + 96, 13); });
    const hx = 4900, hz = h.z1 - 380;
    box(hx, 12, hz, 820, 60, 340, STONE, STONE2, '#a39e94'); box(hx, 72, hz + 40, 700, 300, 260, WOOD, WOOD2);
    const f = box(hx, 72, hz + 38, 700, 300, 2, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)'), r = on(f, 300);
    fill('#f2dfb8', () => { for (let i = 0; i < 6; i++) r(.06 + i * .155, 30, .17 + i * .155, 250); }); fill(WOOD2, () => { for (let i = 0; i < 7; i++) r(.035 + i * .155, 0, .055 + i * .155, 300); });
    roofT(hx, 372, hz + 40, 700, 260, 300); box(hx, 290, hz - 2, 170, 54, 6, '#2a1c12', '#1a120c'); text('呪術高専', hx, 317, hz - 6, 26, '#e8c86a');
    for (let i = 0; i < 4; i++) box(hx, 12 + i * 15, hz - 40 - i * 30, 300, 15, 30, STONE, STONE2, '#a39e94');      // steps up to it
    const q = P(hx, 200, hz); lit(() => glow(GLOW.fire, q[0], q[1], 700 * q[2], .3));
  }
  const fl = DEEP.field;
  if (near(fl.x0, fl.x1)) {
    fill('#8c7a5e', () => slab(fl.x0, fl.x1, BZ - 4, fl.z1, 12));
    fill('rgba(255,255,255,.35)', () => { slab(fl.x0 + 60, fl.x1 - 60, BZ + 90, BZ + 98, 13); slab(fl.x0 + 60, fl.x1 - 60, fl.z1 - 160, fl.z1 - 152, 13); slab(fl.x0 + 60, fl.x0 + 68, BZ + 90, fl.z1 - 152, 13); slab(fl.x1 - 68, fl.x1 - 60, BZ + 90, fl.z1 - 152, 13); });
    for (let i = 0; i < 7; i++) cedar(fl.x0 + 40 + i * (fl.x1 - fl.x0 - 80) / 6, fl.z1 + 60, 1100, i);
  }
  if (near(DEEP.gstairs.x0, DEEP.gstairs.x1, 3200)) steps(DEEP.gstairs, false);
  if (near(DEEP.bstairs.x0, DEEP.bstairs.x1, 3200)) steps(DEEP.bstairs, true);
  if (cam.x > PLAT[0] - 3200) {                      // the track behind the platform, and the train
    const xa = Math.max(cam.x - 3200, PLAT[0] - 200), xb = cam.x + 3200;
    fill('#5a5248', () => slab(xa, xb, BZ, 2100, -30)); fill('#7a7068', () => { slab(xa, xb, 1600, 1614, -24); slab(xa, xb, 1780, 1794, -24); });
    for (let x = Math.floor(xa / 90) * 90; x < xb; x += 90) fill('#3a3028', () => slab(x, x + 40, 1570, 1820, -27));
    MT.trainCars(LOCAL, tr, 1440, PLAT[0] - 200, LEN + 3000);
    for (let i = 0; i < 6; i++) cedar(PLAT[0] + i * 420, 2300, 1100, i);
  }
}

/* ---------- the buildings along the walk ---------- */
// a building whose ground floor opens into rooms: thin walls at the front, the rooms' own walls inside, a solid upper floor and a roof
function hall(x0, x1, top, roomIds, opts = {}) {
  if (!near(x0, x1)) return;
  const cx = (x0 + x1) / 2, w = x1 - x0, ops = roomIds.map(id => ROOMS[id]);
  const up = box(cx, FL, BZ, w, top - FL, 520, opts.wall || PLAS, opts.side || PLAS2), r = on(up, top - FL);
  fill(WOOD, () => { r(0, 0, 1, 18); for (let u = 0; u <= 1.001; u += .1) r(Math.min(.99, u), 0, Math.min(1, u + .012), top - FL); r(0, top - FL - 16, 1, top - FL); });
  fill(opts.win || 'rgba(255,214,150,.85)', () => { for (let u = .03; u < .97; u += .1) r(u + .015, 70, u + .085, (top - FL) * .72); });
  fill(WOOD2, () => { for (let u = .03; u < .97; u += .1) r(u + .048, 70, u + .052, (top - FL) * .72); });
  if (opts.rail) fill(WOOD2, () => { r(0, 40, 1, 52); for (let u = 0; u < 1; u += .025) r(u, 0, u + .006, 46); });
  let x = x0;
  for (const o of ops.concat([{ x0: x1, x1: x1 }])) {
    if (o.x0 > x) { const f = box((x + o.x0) / 2, 12, BZ, o.x0 - x, FL - 12, 40, opts.wall || PLAS, opts.side || PLAS2), rr = on(f, FL - 12); fill(WOOD, () => { rr(0, 0, 1, 26); rr(0, 0, .06, FL - 12); rr(.94, 0, 1, FL - 12); rr(0, FL - 40, 1, FL - 12); }); }
    if (o.x1 > o.x0) for (const s of [-1, 1]) box(s < 0 ? o.x0 + 28 : o.x1 - 28, 12, BZ - 4, 56, FL - 12, 8, '#e9dcc0', '#b9ad92');      // its sliding doors, pushed open
    x = o.x1;
  }
  box(x0 + 10, 12, BZ, 20, FL - 12, 520, opts.side || PLAS2, opts.side || PLAS2); box(x1 - 10, 12, BZ, 20, FL - 12, 520, opts.side || PLAS2, opts.side || PLAS2);
  roofT(cx, top, BZ, w, 520, opts.rh || 260);
  if (opts.sign) { box(cx, top - 70, BZ - 6, opts.sign[2] || 300, 50, 6, '#2a1c12', '#1a120c'); text(opts.sign[0], cx, top - 45, BZ - 10, 26, '#e8c86a'); if (opts.sign[1]) text(opts.sign[1], cx, FL + 24, BZ - 6, 15, '#2a1c12', EN); }
  for (const o of ops) { const lab = { yuji: 'THE VESSEL', megumi: 'SHADOW SUMMONER', nobara: 'STRAW DOLL', klass: '1年 FIRST YEARS', yaga: '学長室 PRINCIPAL', inf: '医務室 INFIRMARY' }[Object.keys(ROOMS).find(k => ROOMS[k] === o)]; box((o.x0 + o.x1) / 2, FL - 34, BZ - 8, 170, 26, 4, '#f4efe4', '#bdb6a6'); text(lab, (o.x0 + o.x1) / 2, FL - 21, BZ - 10, 13, '#2a1c12', EN); }
}
function storehouse() {                              // the storehouse for cursed objects: a fireproof kura, white plaster over black, sealed
  if (!near(150, 650)) return;
  const f = box(400, 12, BZ, 500, 560, 420, '#efe9db', '#c2bba9'), r = on(f, 560);
  fill('#22252c', () => { r(0, 0, 1, 150); for (let y = 0; y < 150; y += 24) r(0, y, 1, y + 2); });
  fill('#2a2d34', () => r(.36, 0, .64, 280)); fill('#4a4d55', () => { for (const u of [.4, .6]) for (let y = 30; y < 270; y += 50) r(u - .01, y, u + .01, y + 10); });
  fill('#f4f1e8', () => { r(.42, 120, .48, 230); r(.52, 120, .58, 230); }); fill('#b3261e', () => { r(.44, 150, .46, 200); r(.54, 150, .56, 200); });      // talismans over the seam
  fill('#2a2d34', () => r(.42, 420, .58, 470)); roofT(400, 560, BZ, 500, 420, 200); text('忌庫', 400, 330, BZ - 4, 34, '#2a2d34');
}
function vending() {
  if (!near(2420, 2960)) return;
  box(2690, 12, BZ, 540, 300, 40, '#b8b2a4', '#8f8a80'); box(2690, 300, BZ - 50, 580, 16, 90, TILE, TILE2, '#4a5262');      // the wall the machines stand in, and a little roof over them
  vend(2560, BZ - 64, '#e8ecf4'); vend(2670, BZ - 64, '#d62a2a'); vend(2780, BZ - 64, '#2a7fd6');
}
function mainGate() {                                // the main gate: a two-storey temple gate, the school's name over it, and the stairs through it
  if (!near(7420, 8020)) return;
  const cx = 7750;
  for (const s of [-1, 1]) { box(cx + s * 230, 12, BZ, 140, 380, 160, WOOD, WOOD2); box(cx + s * 300, 12, BZ - 10, 30, 400, 30, VERM, VERM2); }
  box(cx, 380, BZ, 600, 60, 160, WOOD, WOOD2); box(cx, 440, BZ + 20, 520, 160, 120, PLAS, PLAS2);
  roofT(cx, 600, BZ + 20, 520, 120, 150); roofT(cx, 400, BZ - 20, 640, 200, 70);
  box(cx, 470, BZ + 16, 330, 90, 6, '#2a1c12', '#1a120c'); text('東京都立呪術高等専門学校', cx, 515, BZ + 12, 22, '#e8c86a');
  for (const s of [-1, 1]) { box(7440 + (s < 0 ? -10 : 580), 12, BZ, 40, 200, 300, '#efe9db', '#c2bba9'); }
}
function forest(x0, x1) {                            // cedars, close together along the back of the road
  if (!near(x0, x1, 2900)) return;
  for (let x = Math.max(x0, Math.floor((cam.x - 2900) / 160) * 160); x < Math.min(x1, cam.x + 2900); x += 160) cedar(x + ((x * 37) % 60), BZ + 30 + ((x * 13) % 90), 1050 + ((x * 7) % 300), x / 160 | 0);
}
function konbini() {
  if (!near(11000, 11600)) return;
  const f = box(11300, 12, BZ, 520, 300, 400, '#f4f6f9', '#c9ced8'), r = on(f, 300);
  fill('rgba(240,250,255,.9)', () => r(.04, 20, .96, 200)); fill('#2a8a4a', () => r(0, 220, 1, 250)); fill('#e8402a', () => r(0, 250, 1, 270)); fill('#2a6fd0', () => r(0, 270, 1, 290));
  text('コンビニ  OPEN 24H', 11300, 236, BZ - 2, 20, '#fff', EN);
  const q = P(11300, 110, BZ); lit(() => glow(GLOW.white || GLOW.blue, q[0], q[1], 700 * q[2], .35));
}
function stationHouse() {                            // a small wooden station: tiled roof, a name board, one machine and the gates
  if (!near(STN[0], PLAT[1])) return;
  const cx = (STN[0] + STN[1]) / 2, w = STN[1] - STN[0], f = box(cx, 12, BZ, w, 360, 420, '#e9e1cf', '#bdb3a0'), r = on(f, 360);
  fill(WOOD, () => { r(0, 0, 1, 20); r(0, 340, 1, 360); for (let u = 0; u <= 1; u += .125) r(Math.min(.985, u), 0, Math.min(1, u + .015), 360); });
  fill('rgba(255,226,170,.8)', () => { r(.08, 60, .3, 240); r(.7, 60, .92, 240); });
  roofT(cx, 360, BZ, w, 420, 160);
  box(cx, 300, BZ - 10, 420, 60, 8, '#f7f7f2', '#c9c9c0'); text('呪術高専前', cx, 336, BZ - 14, 30, '#111'); text('JUJUTSU HIGH STATION · KO 55', cx, 312, BZ - 14, 14, '#555', EN);
  const m = box(12260, 12, BZ - 56, 150, 250, 56, '#dfe4ec', '#a9b0bc', '#eef1f5'), mr = on(m, 250);
  fill('#0f2a5c', () => mr(.12, 120, .88, 220)); fill('#38c8ff', () => mr(.16, 130, .84, 150)); const q = P(12260, 170, BZ - 56); lit(() => glow(GLOW.blue, q[0], q[1], 200 * q[2], .35));
  text('きっぷうりば', 12260, 280, BZ - 58, 18, '#111');
}
function buildings() {
  storehouse();
  hall(1080, 2380, 780, ['yuji', 'megumi', 'nobara'], { rail: true, sign: ['学生寮', 'DORMITORY', 260] });
  vending();
  hall(2990, 4130, 860, ['klass', 'yaga'], { sign: ['校舎', 'SCHOOL BUILDING', 280], rh: 300 });
  if (near(4280, 4320) || near(5480, 5520)) { box(4300, 12, BZ, 40, 260, 40, PLAS, PLAS2); box(5500, 12, BZ, 40, 260, 40, PLAS, PLAS2); }
  hall(5580, 6320, 700, ['inf'], { sign: ['医務室', 'INFIRMARY', 220], win: 'rgba(220,240,255,.85)' });
  mainGate();
  forest(TREES[0] - 40, DEEP.bstairs.x0); forest(DEEP.bstairs.x1, 11000);
  if (near(8420, 8820)) { box(DEEP.bstairs.x0 - 40, 12, BZ, 80, 120, 80, STONE, STONE2, '#a39e94'); box(DEEP.bstairs.x1 + 40, 12, BZ, 80, 120, 80, STONE, STONE2, '#a39e94'); text('呪術高専 参道', (DEEP.bstairs.x0 + DEEP.bstairs.x1) / 2, 150, BZ - 2, 18, '#2a2d34'); }
  konbini(); stationHouse();
  if (near(6340, 6380) || near(7380, 7440)) { cedar(6350, BZ + 40, 1150, 1); cedar(7400, BZ + 40, 1150, 2); }
  if (near(0, 1100)) { cedar(60, BZ + 60, 1200, 0); cedar(1030, BZ + 60, 1150, 1); }
}

/* ---------- things that share the walk with people ---------- */
const LOCAL = { body: '#d7dbe2', side: '#9aa0aa', band: '#dd0077', band2: '#2a6fd0', door: '#c9ced8', dest: '新宿' };
const tr = { x: TSTOP + 9000, st: 'away', t: 0, open: 0, leave: 0 };
function furniture(id) {
  const R = ROOMS[id], cx = (R.x0 + R.x1) / 2;
  const list = {
    yuji: [{ z: R.z1 - 120, draw() { box(cx - 60, 12, R.z1 - 120, 180, 70, 60, '#3a3530', '#262220'); const f = box(cx - 60, 82, R.z1 - 110, 170, 110, 30, '#15161c', '#0c0d11'), r = on(f, 110); fill(['#2a6fd0', '#d62a2a', '#3ddc84', '#f2c200'][Math.floor(E.T * 1.3) % 4], () => r(.06, 10, .94, 100)); const q = P(cx - 60, 140, R.z1 - 110); lit(() => glow(GLOW.blue, q[0], q[1], 280 * q[2], .4)); } },
      { z: BZ + 200, draw() { box(R.x1 - 90, 12, BZ + 200, 120, 40, 330, '#f4efe4', '#c9c2b0', '#ffffff'); box(R.x1 - 90, 52, BZ + 470, 120, 30, 50, '#d9d2c0', '#b0a990'); } },          // a futon
      { z: BZ + 420, draw() { const q = P(cx + 30, 40, BZ + 420), k = q[2]; g.fillStyle = '#e8d8b0'; g.beginPath(); g.arc(q[0], q[1] - 30 * k, 22 * k, 0, TAU); g.fill(); g.fillRect(q[0] - 16 * k, q[1] - 12 * k, 32 * k, 26 * k); g.fillStyle = '#d62a2a'; g.beginPath(); g.arc(q[0] - 18 * k, q[1] - 2 * k, 7 * k, 0, TAU); g.arc(q[0] + 18 * k, q[1] - 2 * k, 7 * k, 0, TAU); g.fill(); g.fillStyle = LINE; g.fillRect(q[0] - 9 * k, q[1] - 34 * k, 4 * k, 4 * k); g.fillRect(q[0] + 5 * k, q[1] - 34 * k, 4 * k, 4 * k); } }],      // the doll with boxing gloves
    megumi: [{ z: R.z1 - 100, draw() { box(cx + 80, 12, R.z1 - 100, 150, 130, 60, WOOD, WOOD2, '#5a4232'); box(cx - 90, 12, R.z1 - 60, 120, 260, 40, '#5a4232', WOOD2); const f = box(cx - 90, 12, R.z1 - 62, 120, 260, 2, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)'), r = on(f, 260); fill('#7a2a2a', () => { for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) if ((i + j) % 3) r(.06 + i * .15, 40 + j * 74, .16 + i * .15, 100 + j * 74); }); } },
      { z: BZ + 200, draw() { box(R.x0 + 90, 12, BZ + 200, 120, 40, 330, '#e4e8ee', '#b9bec8', '#f4f6f9'); } }],
    nobara: [{ z: R.z1 - 100, draw() { box(cx + 70, 12, R.z1 - 100, 160, 120, 60, '#f1dfe4', '#c9b0b8', '#fff'); const f = box(cx + 70, 140, R.z1 - 96, 90, 130, 4, '#cfe3ee', '#9ab0bc'); lit(() => { const q = P(cx + 70, 200, R.z1 - 96); glow(GLOW.white || GLOW.blue, q[0], q[1], 120 * q[2], .4); }); const d = P(cx + 40, 150, R.z1 - 100); g.fillStyle = '#c9a46a'; g.fillRect(d[0] - 6 * d[2], d[1] - 24 * d[2], 12 * d[2], 24 * d[2]); } },
      { z: BZ + 260, draw() { for (const [dx, col] of [[-110, '#ff9ad5'], [-60, '#f2c200'], [-150, '#ffffff']]) { box(R.x1 - 60 + dx * .3, 12, BZ + 240 + dx * .2, 60, 80, 30, col, 'rgba(0,0,0,.25)'); } } }],      // shopping bags
    klass: [{ z: R.z1 - 30, draw() { const f = box(cx, 120, R.z1 - 24, 380, 190, 6, '#25402f', '#16261c'), r = on(f, 190); fill('rgba(255,255,255,.75)', () => { r(.08, 120, .4, 126); r(.1, 90, .3, 95); r(.62, 60, .9, 66); }); text('今日の授業：自習', cx - 80, 250, R.z1 - 28, 16, '#f4f4f0'); const q = P(cx + 120, 230, R.z1 - 28), k = q[2]; g.strokeStyle = '#f4f4f0'; g.lineWidth = 2 * k; g.beginPath(); g.arc(q[0], q[1], 16 * k, 0, TAU); g.stroke(); g.beginPath(); g.arc(q[0], q[1] + 3 * k, 8 * k, .2, Math.PI - .2); g.stroke(); } },
      ...[0, 1, 2].map(i => ({ z: BZ + 300, draw() { box(R.x0 + 110 + i * 170, 12, BZ + 300, 110, 100, 70, WOOD, WOOD2, '#6a4c36'); } })), { z: R.z1 - 200, draw() { box(cx - 150, 12, R.z1 - 200, 120, 130, 60, '#5a4232', WOOD2, '#6a4c36'); } }],
    yaga: [{ z: R.z1 - 60, draw() { const f = box(cx, 12, R.z1 - 60, w(R) - 40, 340, 40, '#5a4232', WOOD2), r = on(f, 340); for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) { const q = P(R.x0 + 50 + i * (w(R) - 100) / 5, 60 + j * 105, R.z1 - 62), k = q[2]; g.fillStyle = ['#e8d8b0', '#6a5a4a', '#d9a0a0', '#9ab0d0'][(i + j) % 4]; g.beginPath(); g.arc(q[0], q[1] - 14 * k, 15 * k, 0, TAU); g.fill(); g.fillRect(q[0] - 12 * k, q[1] - 4 * k, 24 * k, 26 * k); g.fillStyle = LINE; g.fillRect(q[0] - 6 * k, q[1] - 18 * k, 3 * k, 3 * k); g.fillRect(q[0] + 3 * k, q[1] - 18 * k, 3 * k, 3 * k); } } },      // shelves of cursed corpses, all of them cute
      { z: BZ + 220, draw() { box(cx, 12, BZ + 220, 220, 110, 100, '#4a3020', '#2e1e14', '#6a4a30'); } }],
    inf: [{ z: R.z1 - 30, draw() { const f = box(R.x1 - 150, 12, R.z1 - 24, 220, 300, 10, '#c9ced6', '#9aa0aa'), r = on(f, 300); fill('#aeb4be', () => { for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) r(.06 + i * .48, 20 + j * 92, .48 + i * .48, 100 + j * 92); }); fill('#e8ecf2', () => { for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) r(.22 + i * .48, 55 + j * 92, .32 + i * .48, 62 + j * 92); }); text('霊安室', R.x1 - 150, 320, R.z1 - 30, 16, '#555'); } },      // the morgue's drawers
      ...[0, 1].map(i => ({ z: BZ + 220 + i * 0, draw() { box(R.x0 + 110 + i * 190, 12, BZ + 220, 140, 70, 300, '#f4f6f9', '#c9ced8', '#ffffff'); box(R.x0 + 110 + i * 190, 82, BZ + 470, 140, 30, 40, '#e8ecf2', '#b9bec8'); box(R.x0 + 110 + i * 190 + 80, 12, BZ + 200, 8, 300, 340, 'rgba(240,244,248,.65)', 'rgba(200,206,214,.6)'); } })),
      { z: R.z1 - 220, draw() { box(R.x0 + 120, 12, R.z1 - 220, 150, 110, 80, WOOD, WOOD2, '#6a4c36'); const q = P(R.x0 + 150, 130, R.z1 - 220); g.fillStyle = '#f4f4f0'; g.fillRect(q[0] - 6 * q[2], q[1] - 14 * q[2], 12 * q[2], 14 * q[2]); } }]
  };
  return list[id] || [];
}
const w = R => R.x1 - R.x0;
const people = [];                                   // whoever is about the place: drawn, and turned toward him, here (walk.js only draws a world's cast)
const props = [
  ...Object.keys(ROOMS).flatMap(id => furniture(id).map(p => ({ z: p.z, draw() { if (near(ROOMS[id].x0, ROOMS[id].x1)) p.draw(); } }))),
  { z: 1900, draw() { if (near(4320, 5480)) { box(4900, 12, 1900, 120, 40, 120, '#6a5a4a', '#4a3e32'); box(4900, 52, 1900, 90, 90, 90, '#5a4a3a', '#3a3028', '#6a5a4a'); box(4900, 142, 1890, 130, 20, 110, '#4a3e32', '#2e261e'); const q = P(4900, 170, 1900); lit(() => glow(GLOW.fire, q[0], q[1], 160 * q[2], .4)); for (let i = 0; i < 2; i++) { const s = P(4900 + Math.sin(E.T + i) * 20, 220 + ((E.T * 40 + i * 60) % 160), 1900); g.fillStyle = 'rgba(220,220,230,.2)'; g.beginPath(); g.arc(s[0], s[1], 18 * s[2], 0, TAU); g.fill(); } } } },      // the incense burner, smoking
  ...[[4480, 1700], [5320, 1700], [4480, 2050], [5320, 2050]].map(([x, z]) => ({ z, draw() { if (near(4320, 5480)) lantern(x, z); } })),
  { z: 2080, draw() { if (near(4320, 5480)) { cedar(4410, 2080, 1300, 2); const a = P(4380, 230, 2060), b = P(4440, 240, 2060); g.strokeStyle = '#e9dcc0'; g.lineWidth = 6 * a[2]; g.beginPath(); g.moveTo(a[0] - 30 * a[2], a[1]); g.quadraticCurveTo(a[0], a[1] + 12 * a[2], b[0] + 30 * a[2], b[1]); g.stroke(); g.fillStyle = '#f4f4f0'; for (let i = 0; i < 3; i++) g.fillRect(a[0] - 10 * a[2] + i * 20 * a[2], a[1] + 4 * a[2], 6 * a[2], 16 * a[2]); } } },      // the old cedar, with its rope and paper streamers
  { z: 2000, draw() { if (near(4320, 5480)) { box(5390, 12, 2000, 160, 70, 90, STONE, STONE2, '#6a8aa0'); for (const s of [-1, 1]) box(5390 + s * 70, 82, 2000, 14, 160, 14, WOOD, WOOD2); roofT(5390, 240, 2000, 160, 90, 50); } } },      // the basin to wash at
  ...[[6600, 1700], [6900, 1650], [7200, 1720]].map(([x, z]) => ({ z, draw() { if (near(6380, 7380)) { box(x, 12, z, 30, 240, 30, '#8a6a3c', '#5e4526'); box(x, 160, z, 90, 22, 22, '#8a6a3c', '#5e4526'); box(x, 90, z - 4, 40, 50, 6, '#e9dcc0', '#b9ad92'); } } })),      // the training posts, wrapped
  { z: 1300, draw() { if (near(2420, 2960)) { box(2700, 12, 1300, 300, 60, 70, WOOD, WOOD2, '#6a4c36'); box(2700, 72, 1330, 300, 70, 12, WOOD, WOOD2); } } },      // the bench by the machines
  { z: 1120, draw() { if (near(7000, 7500)) { const x = 7250; for (const dx of [-100, 100]) box(x + dx, 0, 1088, 56, 36, 96, '#0b0b0e', '#060608'); box(x, 18, 1090, 300, 60, 100, '#15161c', '#0b0b0e', '#1f2028'); box(x - 12, 78, 1102, 180, 50, 76, '#161c28', '#0e1219', '#15161c'); } } },      // The Driver's black car
  ...[9300, 10250].map(x => ({ z: 1290, draw() { if (near(x - 100, x + 100)) { box(x, 12, 1290, 16, 280, 16, '#e8702a', '#a84e1c'); const q = P(x, 300, 1280), k = q[2]; g.fillStyle = '#e8702a'; g.beginPath(); g.arc(q[0], q[1], 34 * k, 0, TAU); g.fill(); g.fillStyle = '#cfe6f5'; g.beginPath(); g.arc(q[0], q[1], 26 * k, 0, TAU); g.fill(); } } })),      // curve mirrors on the road
  { z: 1300, draw() { if (near(9600, 9800)) { box(9700, 12, 1300, 70, 40, 60, STONE, STONE2); box(9700, 52, 1305, 40, 70, 40, '#9a958a', STONE2); const q = P(9700, 140, 1305), k = q[2]; g.fillStyle = '#a8a296'; g.beginPath(); g.arc(q[0], q[1], 20 * k, 0, TAU); g.fill(); g.fillStyle = '#c8402a'; g.beginPath(); g.moveTo(q[0] - 22 * k, q[1] + 18 * k); g.lineTo(q[0] + 22 * k, q[1] + 18 * k); g.lineTo(q[0], q[1] + 44 * k); g.closePath(); g.fill(); } } },      // a jizo by the road, in a red bib
  { z: 1300, draw() { if (near(10500, 10700)) vend(10600, 1300, '#e8ecf4'); } },
  { z: 1290, draw() { if (near(10900, 11000)) { box(10950, 12, 1290, 12, 260, 12, '#c9ced8', '#8a909a'); const q = P(10950, 280, 1290), k = q[2]; g.fillStyle = '#2a6fd0'; g.beginPath(); g.arc(q[0], q[1], 30 * k, 0, TAU); g.fill(); text('バス', 10950, 280, 1288, 18, '#fff'); } } },      // a bus stop that nothing seems to stop at
  ...CABS.map(cz => ({ z: cz - 30, draw() { if (near(GX - 300, GX + 300)) MT.gateRow(GX, LANES, [cz]); } })),
  ...[12800, 13250].map(x => ({ z: 1220, draw() { if (near(PLAT[0], PLAT[1])) { box(x, 12, 1220, 16, 420, 16, '#5a5a62', '#3a3a42'); } } })),
  { z: 760, draw() { if (near(PLAT[0], PLAT[1])) box(13000, 12, 760, 220, 46, 60, '#8a6a3c', '#5e4526', '#a5824d'); } },      // a bench
  { z: 700, draw() { if (near(PLAT[0], PLAT[1])) { box(13400, 12, 700, 12, 120, 12, '#5a5a62', '#3a3a42'); const f = box(13400, 120, 700, 160, 200, 8, '#f7f7f2', '#c9c9c0'), r = on(f, 200); fill('#111', () => { for (let j = 0; j < 6; j++) r(.1, 20 + j * 28, .9, 26 + j * 28); }); text('時刻表', 13400, 300, 696, 16, '#111'); } } },      // the timetable
];
// what hangs over the walk from the near side: the platform's canopy, the road's poles and wires
function front() {
  if (cam.x > PLAT[0] - 2000) { const x0 = PLAT[0] - 60, x1 = PLAT[1] + 300; box((x0 + x1) / 2, 430, 860, x1 - x0, 24, 520, '#4a4e5c', '#2c2f39', '#5a5f6e'); text('呪術高専前  KO 55', 12900, 412, 860, 20, '#f4f4f0', EN); }
  if (cam.x > TREES[1] - 1800 && cam.x < STN[0] + 1800) {
    const poles = [8900, 9700, 10500, 11300];
    g.strokeStyle = '#141418'; g.lineWidth = 2.5;
    for (let i = 0; i < poles.length - 1; i++) { const a = P(poles[i], 560, 450), b = P(poles[i + 1], 560, 450); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 70, b[0], b[1]); g.stroke(); }
    for (const x of poles) if (Math.abs(x - cam.x) < 1800) { box(x, 12, 450, 26, 600, 26, '#4a4440', '#2e2a26'); box(x, 540, 446, 150, 12, 12, '#4a4440', '#2e2a26'); }
  }
  if (cam.x < TREES[0] + 600) for (const x of [900, 4250, 5500]) if (Math.abs(x - cam.x) < 1600) lantern(x, 480, .9);
}

/* ================= who is here ================= */
const poly = (pts, col) => { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke(); };
// the second year who only speaks in rice-ball fillings: his look is the Cursed Speaker's (inumaki.js, early access since 0.17)
const INUMAKI = JU.speaker.SKIN;
// The Principal: a big man in dark clothes, cropped hair, a beard, sunglasses; he makes cursed corpses, and they are cute
const YAGA = Object.assign({}, C.GOJO, { head() {
  E.headBase('#c99a76', '#d9ab88');
  g.beginPath(); g.roundRect(-25, -26, 50, 12, [10, 10, 2, 2]); g.fillStyle = '#1a1612'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
  g.fillStyle = '#0b0b10'; g.beginPath(); g.roundRect(-2, -4, 12, 8, 2); g.fill(); g.beginPath(); g.roundRect(13, -4, 11, 8, 2); g.fill(); g.fillRect(9, -2, 5, 2);
  g.fillStyle = '#1a1612'; g.beginPath(); g.moveTo(2, 11); g.quadraticCurveTo(12, 8, 23, 11); g.lineTo(21, 14); g.quadraticCurveTo(12, 12, 4, 14); g.closePath(); g.fill();      // the moustache
  g.beginPath(); g.moveTo(6, 17); g.lineTo(20, 17); g.lineTo(17, 27); g.lineTo(9, 27); g.closePath(); g.fill();      // and the beard
} });
const IJICHI = K.IJICHI || C.GOJO;
for (const [k, v] of Object.entries({ yaga: ['The Principal', '学長', '#c9a46a'], inumaki: ['Cursed Speaker', '呪言', '#c9c2ff'], jjh: ['Jujutsu High', '高専', '#ffd23d'], phone: ['A message', '連絡', '#9fe870'] })) if (!JU.story.WHO[k]) JU.story.WHO[k] = v;
const WHO = [['gojo', C.GOJO, 3360, 1880, 1.06, 'Blindfolded Infinity'], ['yuji', E.YUJI, 1300, 1820, 1, 'The Vessel'], ['megumi', C.MEGUMI, 1730, 1780, 1, 'Shadow Summoner'], ['nobara', JU.sets.NOBARA, 2150, 1800, 1, 'Straw Doll'],
  ['yaga', YAGA, 3880, 1820, 1.16, 'The Principal'], ['shoko', JU.sets.SHOKO, 5900, 1840, 1, 'The Healer'], ['maki', JU.cast2.MAKI, 6620, 1880, 1, 'Heavenly Blade'], ['panda', JU.cast5.PANDA, 7080, 2050, 1.25, 'Panda'],
  ['inumaki', INUMAKI, 6880, 2200, 1, 'Cursed Speaker'], ['ijichi', IJICHI, 7080, 1180, 1, 'The Driver']];
const BRAWLER = ['todo', JU.cast2.TODO, 6900, 2280, 1.2, 'Clapping Brawler'];
let brawler = null;
function cast() {
  return WHO.concat([BRAWLER]).map(w => { const f = E.fighter(w[1], w[2], -1); f.z = w[3]; f.y = f.ground0 = 12; f.scale = w[4]; f.pose = C.STAND.slice(); f.target = C.STAND; f.who = w[0]; if (w === BRAWLER) { brawler = f; f.alpha = J.q === 3 ? 1 : 0; } return f; });
}

/* ================= The Healer's errands ================= */
const CASES = [[2560, 1290, 'behind the vending machines'], [5150, 1880, 'by the incense burner'], [7240, 2360, 'at the far end of the training ground']];
const STEP = ['', 'Find her three medical cases on the campus', 'Back to the infirmary', 'Beat the Clapping Brawler on the training ground', '', 'Find the Disaster Bloom on the mountain road, past the gate', 'Clear the storehouse at the west end, and find her notes', 'Back to the infirmary', ''];
const errand = () => (J.q > 0 && J.q < 8 ? `The Healer's errands ${Math.min(4, [0, 1, 1, 2, 2, 3, 4, 4][J.q])}/4 · ${J.q === 1 ? `${J.cases.filter(Boolean).length}/3 · ` : ''}${STEP[J.q]}` : '');
function healer() {
  if (J.q === 0) return [['shoko', 'A new face. I am The Healer. I patch up everybody stupid enough to need it, which is everybody.'], ['shoko', 'You want reversed technique? Most sorcerers cannot even use it on themselves.'],
    ['shoko', 'Fine. Run some errands for me and we will see what you are made of. First: three of my medical cases walked off. Find them, somewhere on the campus.', () => { J.q = 1; save(); S.status(); sfx.confirm(); }]];
  if (J.q === 1) return [['shoko', `${J.cases.filter(Boolean).length} of 3. One went toward the vending machines, one toward the main hall, one out to the training ground. Probably.`]];
  if (J.q === 2) return [['shoko', 'All three. Good. Next problem.'], ['shoko', 'The Clapping Brawler came all the way from Kyoto again, and put two of my beds through a wall. He is out on the training ground asking people their type.'],
    ['shoko', 'Go and beat him. Or lose; I will have work either way.', () => { J.q = 3; save(); S.status(); sfx.confirm(); }]];
  if (J.q === 3) return [['shoko', 'He is on the training ground. You cannot miss him. Nobody can.']];
  if (J.q === 5) return [['shoko', 'The forest, down the mountain road. Something left over from the Goodwill Event, drinking the cursed energy out of the trees.']];
  if (J.q === 6) return [['shoko', 'The storehouse, at the west end, behind the dormitory. My notes are in there. So is something else, from the sound of it.']];
  if (J.q === 7) return [['shoko', 'My notes. Do not read the margins; somebody wrote rude things in them twenty years ago.'], ['shoko', 'Reversed technique: you take cursed energy, which is negative, and multiply it by itself. Negative times negative.'],
    ['shoko', 'Positive. You put it back into the body. You do not think about it. You feel it, the way you feel a hand you forgot you had.'],
    ['shoko', 'There. You have it. V in a fight, when you are about to die. And then do not, for once.', () => { J.q = 8; save(); JU.sub.grant('rct'); Y.earn(10000); E.banner('反転術式', 'REVERSED CURSED TECHNIQUE'); sfx.bf(); cam.shake = 10; S.status(); }],
    ['jjh', 'Sub technique learned: Reversed Cursed Technique. In a fight, V heals 45% of your health (B too). The Healer also paid you ¥10,000.']];
  return [['shoko', 'Still alive? Good. Do not make a habit of needing me.'], ['shoko', 'If you are going into the city, the trains take yen. Exorcisms pay.']];
}
function findCase(i) {
  J.cases[i] = 1;
  const n = J.cases.filter(Boolean).length;
  sfx.confirm();
  if (n >= 3) { J.q = 2; save(); S.talk([['jjh', 'A white case with a red cross on it, under a cloth. That is all three.'], ['jjh', 'Back to the infirmary.']]); }
  else { save(); S.talk([['jjh', `A white case with a red cross on it, ${CASES[i][2]}. ${n} of 3.`]]); }
  S.status();
}
function brawl() {
  begin({ mark: '討', tag: 'The Healer’s errand', title: 'Clapping Brawler', text: 'He has been waiting for somebody to fight all afternoon. He would like to know your type first.', yes: 'Fight him', no: 'Not yet', lead: 1 },
    () => S.talk([['todo', 'You! Before anything: what kind of woman is your type?'], ['todo', 'No. Do not answer. I can see it in how you stand. Show me with your fists!']], () => S.fight({ stay: true, cfg: { foes: ['todo'], label: 'The Healer’s errand', win: ['勝', 'YOU WIN'] }, after(won) {
      if (!won) return;
      J.q = 5; save();
      S.talk([['todo', 'Ha! Brilliant! You and I will understand each other perfectly. Next time, we go all out!'], ['phone', 'The Healer: "Heard that from here. Next: something left over from the Goodwill Event is in the forest down the mountain road, drinking the trees dry. Bring me a piece of it."']]);
      S.status();
    } })));
}
function bloom() {
  begin({ mark: '討', tag: 'The Healer’s errand', title: 'Disaster Bloom', text: 'The cedars here are grey and dry. Something with branches for arms is standing among them, very calm.', yes: 'Fight it', no: 'Not yet', lead: 1 },
    () => S.fight({ stay: true, cfg: { foes: ['hanami'], label: 'The Healer’s errand', wild: true, win: ['祓', 'EXORCISED'] }, after(won) {
      if (!won) return;
      J.q = 6; save();
      S.talk([['jjh', 'You take a sliver of what is left of it. It is still warm.'], ['phone', 'The Healer: "Got it? Good. Last thing. My old notes on reversed technique are in the storehouse at the west end, behind the dormitory. Something got in there, so be careful."']]);
      S.status();
    } }));
}
function storeRaid() {
  begin({ mark: '討', tag: 'The Healer’s errand', title: 'The Storehouse', text: 'The talismans on the door have been torn. Inside, something with a patchwork face is going through the shelves like it is shopping.', yes: 'Go in', no: 'Not yet', lead: 1 },
    () => S.fight({ stay: true, cfg: { foes: ['mahito'], label: 'The Healer’s errand', wild: true, win: ['祓', 'EXORCISED'] }, after(won) {
      if (!won) return;
      J.q = 7; save();
      S.talk([['jjh', 'Among what it pulled off the shelves: a notebook, the corners soft with use. On the cover, three names in three different hands, two of them scratched out.'], ['jjh', 'Back to the infirmary.']]);
      S.status();
    } }));
}
function begin(q, go) { S.st.hold = true; E.keys.clear(); JU.shop.ask([q]).then(yes => { S.st.hold = false; S.st.wait = E.T + .45; E.keys.clear(); if (yes) go(); }); }

/* ================= what the others say ================= */
const LINES = {
  gojo: () => (JU.sub.owns('rct') && J.q >= 8 ? [['gojo', 'The Healer taught you reversed technique? Ha. It took me nearly dying to work that one out.'], ['gojo', 'Negative times negative. Simple, right? Nobody ever thinks so.']]
    : [['gojo', 'Oh, the transfer student! Welcome to Jujutsu High. I am your teacher. Also the strongest, but you will work that out.'], ['gojo', 'Class is... optional today. Go and meet everybody. The Healer is in the infirmary if you break something. Including yourself.']]),
  yuji: () => [['yuji', 'Yo! You are the new one, right? Welcome!'], ['yuji', 'Sensei has me watching movies all day with this doll in my lap. If my cursed energy slips even a little, it punches me in the face.'], ['yuji', 'Training, apparently. Want to watch one? It is a shark movie. A bad one. The best kind.']],
  megumi: () => [['megumi', '...You are the transfer.'], ['megumi', J.q && J.q < 8 ? 'If you are running errands for The Healer, do them properly. She notices.' : 'The station is down the mountain, through the main gate. Long stairs. Run it if you are in a hurry.']],
  nobara: () => [['nobara', 'Knock first next time! ...Fine. Hi. I came to Tokyo to be a sorcerer. And to shop.'], ['nobara', 'Shibuya, Shinjuku, all of it. The trains take yen, by the way, so go exorcise something and get paid.']],
  yaga: () => [['yaga', 'Sit. I ask everybody the same question. Why did you come here?'], ['yaga', 'You do not have to answer today. But a sorcerer with no reason does not last.'], ['yaga', '...These? Cursed corpses. They are cute. They also bite.']],
  shoko: healer,
  maki: () => [['maki', 'You are the new one? Do not just stand on the field. Pick up a weapon or get off it.'], ['maki', J.q >= 4 ? 'You put the Brawler down? Not bad. He will want a rematch. He always does.' : 'If the big idiot from Kyoto shows up, do not tell him your type. It only encourages him.']],
  panda: () => [['panda', 'Hi. I am Panda. Yes, a panda. No, not a person in a suit.'], ['panda', 'Our Speaker says you look strong. Well. He said "salmon". It is the same thing.']],
  inumaki: () => [['inumaki', 'Salmon.', () => sfx.file('home-inu-salmon', .95)], ['inumaki', 'Tuna mayo! Kelp.', () => sfx.file('home-inu-tunamayo', .95)], ['panda', 'He says welcome, and that the vending machine on the left eats coins.']],
  ijichi: () => [['ijichi', 'Ah, the new student. I am The Driver. I drive everybody, everywhere, always.'], ['ijichi', 'Into the city? Through the gate, down the stairs, along the road to the station at the bottom. Or run it. Everybody runs it.']],
  todo: () => []
};

/* ================= what can be done ================= */
const SECRETS = {
  jgeto: { w: 'j', name: 'Curse Eater', foe: 'sb_geto', at: [4900, 1660], pay: 150, first: { ct: 3, cl: 1 }, show: () => J.q >= 8, say: 'A man in a monk’s robe is standing in front of the main hall with his hands in his sleeves, smiling as though the place were his.' },
  jtomb: { w: 'j', name: 'Sorcerer Killer', foe: 'sb_toji', at: [840, 2450], pay: 160, first: { tl: 2, ct: 1 }, show: () => true, say: 'Down in the Tombs of the Star, past more doors than there should be, a man with a scar at his mouth is sitting on the stairs, waiting for somebody.' }
};
Object.assign(SH.SECRETS, SECRETS);
const spots = [
  ...WHO.map(w => ({ x: w[2], z: w[3], r: 170, h: 350 * w[4], icon: '話', label: 'Talk to ' + w[5], use: () => S.talk(LINES[w[0]]()) })),
  { x: BRAWLER[2], z: BRAWLER[3], r: 190, h: 420, icon: '討', col: '#ff5a6e', show: () => J.q === 3, label: 'The Healer’s errand · Clapping Brawler', use: brawl },
  ...CASES.map((c, i) => ({ x: c[0], z: c[1], r: 150, h: 160, icon: '箱', col: '#9fe870', show: () => J.q === 1 && !J.cases[i], label: 'A medical case', use: () => findCase(i) })),
  { x: 10150, z: 1290, r: 180, h: 430, icon: '討', col: '#ff5a6e', show: () => J.q === 5, label: 'The Healer’s errand · Disaster Bloom', use: bloom },
  { x: 400, z: 1250, r: 200, h: 430, icon: '討', col: '#ff5a6e', show: () => J.q === 6, label: 'The Healer’s errand · the storehouse', use: storeRaid },
  ...Object.keys(SECRETS).map(id => ({ x: SECRETS[id].at[0], z: SECRETS[id].at[1], r: 150, h: 430, icon: '？', col: '#c77dff', secret: id, show: SECRETS[id].show, label: () => (M.secrets[id] ? SECRETS[id].name + ' · again' : 'Something is here'), use: () => K.secret(id) })),
  { x: 7750, z: 1250, r: 160, h: 300, icon: '走', col: '#38c8ff', label: 'Run down to the station', use: () => run(true) },
  { x: 11450, z: 760, r: 170, h: 300, icon: '走', col: '#38c8ff', label: 'Run up to the school', use: () => run(false) },
  { x: 12260, z: 1250, r: 200, h: 300, icon: '券', col: '#38c8ff', label: () => 'Buy a ticket · ' + (dev() ? 'free' : Y.fmt(Y.y)), use: () => MT.machine() },
  { x: 13100, z: 1250, r: 300, h: 360, icon: '乗', col: '#dd0077', show: () => tr.st === 'in' && tr.open > .8, label: 'Board the train', use: () => { S.st.goto = [13100, 1330]; S.st.arrive = () => SH.openMap(); } }
];
props.push(...spots.filter(s => s.secret || s.icon === '討').map(s => ({ z: s.z + 1, draw: () => column(s, s.secret ? GLOW.purple : GLOW.red, s.secret ? 'rgba(199,125,255,.9)' : 'rgba(255,90,110,.9)') })));
// the quick way between the gate and the station: he runs it, and the mountain goes by
function run(downhill) {
  sfx.whoosh(); MT.cut(() => { if (downhill) MT.put(11450, 700, 1); else MT.put(7750, 1150, 1); E.banner(downhill ? '呪術高専前駅' : '呪術高専', downhill ? 'JUJUTSU HIGH STATION' : 'JUJUTSU HIGH'); S.status(); }, .7);
}
function arrive() { S.travel(world, [13100, 1290, -1]); tr.x = TSTOP; tr.st = 'in'; tr.t = 0; tr.open = 1; tr.leave = 3.2; E.banner('呪術高専前', 'JUJUTSU HIGH STATION'); }

const world = { name: 'jjh', label: 'Jujutsu High', LEN, Z0, Z1, BZ, gy, free, sky, ground, alley, buildings, props, front, cast, spots, civs: 0, respawn: 40,
  start: () => [2700, 980, 1],
  clip: f => (f.z > BZ && inA(f.x, DEEP.gstairs, 0) ? P(f.x, 12, BZ)[1] : null),      // (Free Exploration starts here: by the vending machines, between the dormitory and the school)
  SPOTS: [[8950, 660, 'grunt'], [9500, 1290, 'grunt'], [10100, 660, 'brute'], [10800, 1290, ['grunt', 'brute']], [11250, 660, 'grunt']],
  stage(x0) { const sh = fn => () => { cam.x += x0; fn(); cam.x -= x0; }; return { sky: sh(sky), floor: sh(ground), back: sh(() => { alley(); buildings(); }), front: sh(front) }; },
  status(st, set) {
    const a = areaAt(S.me.x), e = errand();
    set(`${a[1]} <span lang="ja">${a[2]}</span>`, e || `Jujutsu High · E talk or use · Shift run · ${S.me.x > TREES[1] ? 'curses in the woods are fair game' : 'the station is down the stairs past the main gate'}`);
  },
  tick(dt, real, p, st) {
    if (!J.been) { J.been = 1; save(); S.talk([['jjh', 'Tokyo Jujutsu High. To anybody who finds the road, a temple in the mountains. It is not a temple.'], ['jjh', 'The dormitory is west. The Healer is in the infirmary, past the main hall. The trains into the city stop at the station at the bottom of the mountain, down the stairs past the main gate.']]); }
    const a = areaAt(p.x);
    if (st.area !== a) { st.area = a; S.status(); }
    G.tick(p, real);
    MT.trainTick(tr, TSTOP, real);
    if (brawler) brawler.alpha = J.q === 3 ? 1 : 0;
    if (p.x > GX + 60 && tr.st === 'away') { tr.st = 'come'; tr.t = 0; sfx.whoosh(); }
    if (MT.busy) return false;
    const gs = DEEP.gstairs, bs = DEEP.bstairs;
    if (inA(p.x, gs, 0) && p.z > gs.z1 - 190) { MT.cut(() => { MT.put((bs.x0 + bs.x1) / 2, bs.z1 - 270, 1); st.goto = [(bs.x0 + bs.x1) / 2, 1250]; st.arrive = () => {}; S.status(); }); return false; }      // down the mountain
    if (inA(p.x, bs, 0) && p.z > bs.z1 - 190) { MT.cut(() => { MT.put((gs.x0 + gs.x1) / 2, gs.z1 - 270, 1); st.goto = [(gs.x0 + gs.x1) / 2, 1250]; st.arrive = () => {}; S.status(); }); return false; }      // and up it
    return false;
  } };
SH.STOPS.push({ id: 'jjh', name: 'Jujutsu High', jp: '呪術高専前', code: ['KO', 55, '#dd0077'], x: 230, y: 92, at: () => [11450, 700, 1], world: () => world, arrive });
JU.jjh = { world, J, save, arrive, AREAS, ROOMS, get errand() { return errand(); } };
})();
