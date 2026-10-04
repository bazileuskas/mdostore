/* JUJUTSU UNLIMITEDS — the fight: a side-on arena drawn with real perspective */
(() => {
'use strict';

const JU = window.JU, sfx = JU.sfx;
const root = document.getElementById('game');
const cv = document.getElementById('gc'), g = cv.getContext('2d');
const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const rnd = (a, b) => a + Math.random() * (b - a);
const ease = t => 1 - (1 - t) ** 3;

/* ================= view ================= */
const ZP = 600;          // depth of the fighting plane; 1 world unit = 1 view unit there
const CAM_Y = 160;       // camera height
const STAGE = 1050;      // side walls sit at ±STAGE
const BOUND = 965;       // fighters stay inside ±BOUND
const BACK = ZP + 520;   // depth of the back wall
const GRAV = 2700;
let W = 0, H = 0, DPR = 1, S = 1, VW = 1280, VH = 720, GY = 580, HY = 420, ZNEAR = 300;
let T = 0, running = false, raf = 0, last = 0, armAt = 0;
let stopT = 0, slowT = 0, bfT = 0, zoomT = 0;
const cam = { x: 0, shake: 0, zoom: 1, yaw: 0, kick: 0, lift: 0 };
let cyaw = 1, syaw = 0, strip = .3, scene = null, endT = 0;
const hooks = {};   // other files plug behaviour in here: foes.js, fx2.js, sukuna.js, school.js

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2, 2400 / window.innerWidth, 1350 / window.innerHeight);   // cap the drawing resolution so huge windows stay smooth
  W = window.innerWidth; H = window.innerHeight;
  S = Math.min(H / 720, W / 900);
  VW = W / S; VH = H / S;
  GY = Math.min(VH - 140, VH / 2 + 300); HY = GY - CAM_Y;
  ZNEAR = CAM_Y * ZP / (VH + 40 - HY);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
}

// world (x right, y up, z into the screen) -> view [x, y, scale].
// The camera orbits the spot it is looking at by cam.yaw, so the whole stage turns in true perspective.
const P = (x, y, z) => {
  const dx = x - cam.x, dz = z - ZP;
  const k = ZP / Math.max(40, dx * syaw + dz * cyaw + ZP);
  return [VW / 2 + (dx * cyaw - dz * syaw) * k, HY - (y - CAM_Y) * k, k];
};
const F = (x, y) => P(x, y, ZP);      // a point on the fighting plane

function quad(a, b, c, d) {
  g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath();
}

// a box standing in the world: front face plus whichever side / top the camera can see
function box(x, y, z, w, h, d, cf, cs, ct) {
  const x0 = x - w / 2, x1 = x + w / 2, z1 = z + d, y1 = y + h;
  const a = P(x0, y, z), b = P(x1, y, z), c = P(x1, y1, z), e = P(x0, y1, z), lb = P(x0, y, z1), rb = P(x1, y, z1);
  if (lb[0] < a[0]) { quad(a, lb, P(x0, y1, z1), e); g.fillStyle = cs; g.fill(); }
  if (rb[0] > b[0]) { quad(b, rb, P(x1, y1, z1), c); g.fillStyle = cs; g.fill(); }
  if (ct) { const t0 = P(x0, y1, z1); if (t0[1] < e[1]) { quad(e, c, P(x1, y1, z1), t0); g.fillStyle = ct; g.fill(); } }
  quad(a, b, c, e); g.fillStyle = cf; g.fill();
  return [a, b, c, e];   // front face corners: bottom-left, bottom-right, top-right, top-left
}

function makeGlow(rgb) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.2, `rgba(${rgb},.85)`);
  gr.addColorStop(.5, `rgba(${rgb},.2)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return c;
}
const GLOW = { blue: makeGlow('79,195,255'), red: makeGlow('255,44,72'), purple: makeGlow('157,123,255'), fire: makeGlow('255,140,60') };
const glow = (img, x, y, s, a = 1) => { g.globalAlpha = a; g.drawImage(img, x - s / 2, y - s / 2, s, s); g.globalAlpha = 1; };

/* ================= stage ================= */
const skyline = (() => {
  const c = document.createElement('canvas'); c.width = 3200; c.height = 300;
  const x = c.getContext('2d');
  let seed = 11; const r = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  x.fillStyle = '#0d0719';
  for (let px = -40; px < 3200;) {
    const w = 60 + r() * 120;
    if (r() < .2) {                                   // pagoda
      const tiers = 3 + (r() * 3 | 0), cx = px + w / 2;
      let y = 300, tw = w * .9;
      for (let i = 0; i < tiers; i++) {
        x.fillRect(cx - tw * .32, y - 34, tw * .64, 34);
        x.beginPath(); x.moveTo(cx - tw * .62, y - 30); x.quadraticCurveTo(cx - tw * .4, y - 36, cx - tw * .3, y - 48);
        x.lineTo(cx + tw * .3, y - 48); x.quadraticCurveTo(cx + tw * .4, y - 36, cx + tw * .62, y - 30); x.closePath(); x.fill();
        y -= 46; tw *= .84;
      }
      x.fillRect(cx - 2, y - 30, 4, 34);
    } else {                                          // tower block
      const h = 40 + r() * 170;
      x.fillRect(px, 300 - h, w, h);
      x.fillStyle = 'rgba(255,90,110,.5)';
      for (let i = 0; i < 5; i++) if (r() < .6) x.fillRect(px + 8 + r() * (w - 20), 300 - h + 10 + r() * (h - 30), 3, 5);
      x.fillStyle = '#0d0719';
    }
    px += w * (.7 + r() * .5);
  }
  return c;
})();

const embers = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), d: rnd(.3, 1.5), v: rnd(.02, .07), ph: rnd(0, TAU), c: Math.random() < .6 ? 'red' : 'purple' }));
const PILLARS = [-780, -260, 260, 780], LANTERNS = [-960, -520, 520, 960];

function drawSky() {
  let gr = g.createLinearGradient(0, 0, 0, HY);
  gr.addColorStop(0, '#04030a'); gr.addColorStop(.5, '#130a27'); gr.addColorStop(.86, '#3d0f2f'); gr.addColorStop(1, '#6d1632');
  g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
  // eclipse hanging over the shrine
  const mx = VW / 2 + 310 - cam.x * .03 - cam.yaw * 700, my = Math.max(110, HY - 300), r = 84;
  g.globalCompositeOperation = 'lighter';
  gr = g.createRadialGradient(mx, my, r * .8, mx, my, r * 4.6);
  gr.addColorStop(0, 'rgba(255,60,96,.5)'); gr.addColorStop(.3, 'rgba(170,92,255,.15)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(mx, my, r * 4.6, 0, TAU); g.fill();
  g.beginPath();
  for (let i = 0; i <= 60; i++) {
    const a = i / 60 * TAU, rr = r * (1.06 + .22 * (.5 + .5 * Math.sin(a * 7 + T * .9)) * (.6 + .4 * Math.sin(a * 3 - T * 1.4)));
    i ? g.lineTo(mx + Math.cos(a) * rr, my + Math.sin(a) * rr) : g.moveTo(mx + rr, my);
  }
  g.fillStyle = 'rgba(255,110,140,.55)'; g.fill();
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#040208'; g.beginPath(); g.arc(mx, my, r, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,220,230,.8)'; g.lineWidth = 2; g.stroke();
  g.drawImage(skyline, VW / 2 - 1600 - cam.x * .1 - cam.yaw * 760, HY - 298);
  gr = g.createLinearGradient(0, HY - 150, 0, HY);
  gr.addColorStop(0, 'rgba(109,22,50,0)'); gr.addColorStop(1, 'rgba(109,22,50,.6)');
  g.fillStyle = gr; g.fillRect(-80, HY - 150, VW + 160, 152);
}

function drawFloor() {
  let gr = g.createLinearGradient(0, HY, 0, VH);
  gr.addColorStop(0, '#34122a'); gr.addColorStop(.2, '#180b1f'); gr.addColorStop(1, '#08050d');
  g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
  // stone tiles
  const TS = 150;
  g.beginPath();
  for (let zi = Math.floor(ZNEAR / TS); zi * TS < BACK; zi++) {
    const za = Math.max(ZNEAR, zi * TS), zb = Math.min(BACK, (zi + 1) * TS);
    for (let i = -STAGE / TS; i < STAGE / TS; i++) {
      if ((i + zi) & 1) continue;
      const a = P(i * TS, 0, za), b = P((i + 1) * TS, 0, za), c = P((i + 1) * TS, 0, zb), d = P(i * TS, 0, zb);
      g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath();
    }
  }
  g.fillStyle = 'rgba(255,190,210,.045)'; g.fill();
  g.beginPath();
  for (let i = -STAGE / TS; i <= STAGE / TS; i++) { const a = P(i * TS, 0, ZNEAR), b = P(i * TS, 0, BACK); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  for (let z = Math.ceil(ZNEAR / TS) * TS; z <= BACK; z += TS) { const a = P(-STAGE, 0, z), b = P(STAGE, 0, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  g.strokeStyle = 'rgba(255,120,150,.12)'; g.lineWidth = 1.5; g.stroke();
  // seal painted on the floor
  g.strokeStyle = 'rgba(255,36,64,.42)'; g.lineWidth = 3;
  for (const R of [250, 222, 96]) {
    g.beginPath();
    for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, p = P(Math.cos(a) * R, 0, ZP + 20 + Math.sin(a) * R); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
    g.stroke();
  }
  g.beginPath();
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU + .26, p = P(Math.cos(a) * 96, 0, ZP + 20 + Math.sin(a) * 96), q = P(Math.cos(a) * 222, 0, ZP + 20 + Math.sin(a) * 222);
    g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]);
  }
  g.lineWidth = 1.5; g.stroke();
  // lantern light pooling on the stone
  g.globalCompositeOperation = 'lighter';
  for (const x of LANTERNS) {
    const p = P(x, 0, ZP + 190);
    g.save(); g.translate(p[0], p[1]); g.scale(1, .26);
    gr = g.createRadialGradient(0, 0, 0, 0, 0, 230);
    gr.addColorStop(0, 'rgba(255,130,60,.3)'); gr.addColorStop(1, 'rgba(255,130,60,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 230, 0, TAU); g.fill();
    g.restore();
  }
  g.globalCompositeOperation = 'source-over';
}

function drawBack() {
  // torii out past the wall
  const zt = ZP + 760;
  box(-300, 0, zt, 62, 600, 62, '#8f1224', '#560a16');
  box(300, 0, zt, 62, 600, 62, '#8f1224', '#560a16');
  box(0, 455, zt + 6, 780, 40, 40, '#7d0f1e', '#4a0813');
  box(0, 520, zt + 10, 86, 82, 20, '#1a0b10', '#0d0508');
  box(0, 600, zt - 10, 940, 30, 80, '#8f1224', '#560a16');
  box(0, 630, zt - 16, 1010, 34, 92, '#15090d', '#0a0407');
  // back wall, open in the middle
  for (const s of [-1, 1]) {
    const cx = s * (STAGE + 330) / 2, w = STAGE - 330;
    box(cx, 0, BACK, w, 118, 70, '#1c1024', '#120a18', '#3a2444');
    g.fillStyle = 'rgba(0,0,0,.3)';
    for (let x = 330; x <= STAGE; x += 144) { const a = P(s * x, 118, BACK), b = P(s * x, 0, BACK); g.fillRect(a[0] - 2, a[1], 4, b[1] - a[1]); }
    box(cx, 118, BACK - 14, w + 20, 16, 98, '#2a1a34', '#1a0f20', '#4a3058');
  }
  // side walls running away from the camera
  for (const s of [-1, 1]) {
    const x = s * STAGE, a = P(x, 0, ZNEAR), b = P(x, 0, BACK), c = P(x, 340, BACK), d = P(x, 340, ZNEAR);
    const gr = g.createLinearGradient(a[0], 0, b[0], 0);
    gr.addColorStop(0, '#0a0610'); gr.addColorStop(1, '#241330');
    quad(a, b, c, d); g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.beginPath();
    for (let z = 420; z < BACK; z += 140) { const u = P(x, 0, z), v = P(x, 340, z); g.moveTo(u[0], u[1]); g.lineTo(v[0], v[1]); }
    g.stroke();
    g.strokeStyle = '#4a3058'; g.lineWidth = 4; g.beginPath(); g.moveTo(d[0], d[1]); g.lineTo(c[0], c[1]); g.stroke();
  }
  // shrine pillars strung with rope
  const zp = ZP + 300, kp = ZP / (zp + 30);
  g.strokeStyle = '#cfc2a2'; g.lineWidth = 6 * kp; g.fillStyle = '#efe6d0';
  for (let i = 0; i < 3; i++) {
    const a = P(PILLARS[i] + 36, 440, zp + 30), b = P(PILLARS[i + 1] - 36, 440, zp + 30), sag = 70 * kp;
    g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + sag * 2, b[0], b[1]); g.stroke();
    for (const u of [.25, .5, .75]) {                 // paper streamers
      const x = lerp(a[0], b[0], u) + Math.sin(T * 1.3 + i + u * 9) * 2, y = a[1] + sag * 4 * u * (1 - u), k = kp;
      g.beginPath(); g.moveTo(x - 5 * k, y); g.lineTo(x + 5 * k, y); g.lineTo(x + k, y + 11 * k); g.lineTo(x + 9 * k, y + 11 * k);
      g.lineTo(x + 4 * k, y + 24 * k); g.lineTo(x - 4 * k, y + 24 * k); g.lineTo(x, y + 13 * k); g.lineTo(x - 8 * k, y + 13 * k); g.closePath(); g.fill();
    }
  }
  for (const x of PILLARS) {
    box(x, 0, zp, 72, 470, 72, '#261629', '#170d1a');
    box(x, 470, zp - 10, 100, 24, 92, '#33203a', '#1f1324');
    box(x, 330, zp - 3, 80, 24, 78, '#cfc2a2', '#8d8266');
    const t = P(x, 322, zp - 3), k = ZP / (zp - 3);
    g.fillStyle = '#eadfc4'; g.fillRect(t[0] - 9 * k, t[1], 18 * k, 46 * k);
    g.fillStyle = '#a5102a'; g.fillRect(t[0] - 1.5 * k, t[1] + 8 * k, 3 * k, 30 * k);
  }
  // stone lanterns
  const zl = ZP + 160;
  for (const x of LANTERNS) {
    const fl = .8 + .2 * Math.sin(T * 9 + x);
    box(x, 0, zl, 70, 16, 70, '#2c2433', '#1a1520', '#40354a');
    box(x, 16, zl + 22, 26, 78, 26, '#2c2433', '#1a1520');
    box(x, 94, zl + 8, 54, 46, 54, '#33262a', '#1e1517');
    const a = P(x - 17, 132, zl + 8), b = P(x + 17, 102, zl + 8);
    g.fillStyle = `rgba(255,${150 * fl | 0},70,${.9 * fl})`; g.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
    box(x, 140, zl - 6, 84, 14, 82, '#261d2e', '#171119', '#3d3048');
    box(x, 154, zl + 20, 22, 12, 22, '#261d2e', '#171119');
    const c = P(x, 117, zl);
    g.globalCompositeOperation = 'lighter'; glow(GLOW.fire, c[0], c[1], 230 * fl, .7); g.globalCompositeOperation = 'source-over';
  }
}

// rubble and candles between the camera and the fighters
function drawFront() {
  const z = ZP - 190;
  for (const [x, w] of [[-820, 150], [-260, 90], [330, 130], [860, 110]]) {
    box(x, 0, z, w, 30, 46, '#0a0710', '#06040a', '#1d1526');
    const c = P(x - w * .2, 30, z + 20), k = ZP / (z + 20), fl = .8 + .2 * Math.sin(T * 11 + x);
    g.fillStyle = '#d9cfb8'; g.fillRect(c[0] - 4 * k, c[1] - 15 * k, 8 * k, 15 * k);
    g.globalCompositeOperation = 'lighter'; glow(GLOW.fire, c[0], c[1] - 22 * k, 80 * k * fl, .9); g.globalCompositeOperation = 'source-over';
  }
}

const SHRINE = { sky: drawSky, floor: drawFloor, back: drawBack, front: drawFront };
let stage = SHRINE;

/* ================= fighters (blocky rigs: whole limbs swing, nothing bends) ================= */
const K = 1.3, LEG = 76, TOR = 76, ARM = 70, LINE = '#07060c';
let flip = 1;   // which way the rig being drawn is mirrored, so text on it can be un-mirrored

// pose = [lean, head, armF, armB, legF, legB, rot]   limb angles: 0 hangs down, + swings forward
const POSE = {
  idle:      [.07, 0, 1.15, .62, .32, -.32, 0],
  jump:      [.05, -.1, 2.3, -.5, .7, -.15, 0],
  fall:      [.02, .1, 1.9, 1.3, .25, -.45, 0],
  dash:      [.6, -.25, -.7, -1, .95, -.9, 0],
  jab:       [.2, 0, 1.62, .3, .5, -.45, 0],
  cross:     [.34, 0, .5, 1.66, .55, -.5, 0],
  hookWind:  [-.05, 0, 2.9, .4, .3, -.3, 0],
  hook:      [.36, .1, 1.25, .2, .55, -.5, 0],
  kickWind:  [-.1, 0, .9, -.4, .2, -.2, 0],
  kick:      [-.42, 0, .5, -.8, 1.6, -.12, 0],
  crushWind: [-.2, -.15, .8, 3, .35, -.35, 0],
  crush:     [.62, .2, .3, 1, .7, -.6, 0],
  divWind:   [-.16, 0, 1.3, -1.15, .45, -.45, 0],
  div:       [.42, 0, .2, 1.64, .7, -.6, 0],
  manjiWind: [.1, 0, .9, .9, .2, -.2, 0],
  manji:     [-.5, 0, .6, -.9, -.2, 1.72, 0],
  hurt:      [-.34, -.3, .25, -.5, .1, -.4, 0],
  air:       [-.2, -.3, 1.2, .9, .9, .5, -1.1],
  down:      [0, 0, .1, .1, .1, -.05, -1.5]
};
const WALK = POSE.idle.slice(), IDLE = POSE.idle.slice(), IDLE2 = POSE.idle.slice();

function headBase(side, front) {
  const gr = g.createLinearGradient(-24, 0, 24, 0);
  gr.addColorStop(.35, side); gr.addColorStop(.8, front);
  g.beginPath(); g.roundRect(-24, -23, 48, 46, 13);
  g.fillStyle = gr; g.fill();
  g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();
}

// limb colours: [side, front, tip side, tip front, tip length]  (tip = hand / shoe)
const YUJI = {
  torso: ['#1b2033', '#283050'],
  armF: ['#1b2033', '#283050', '#e8b992', '#f7d3b1', .25],
  armB: ['#10131f', '#181d30', '#b98c6c', '#caa07f', .25],
  legF: ['#171b2b', '#222943', '#b5172b', '#d92a41', .21],
  legB: ['#0d101a', '#141828', '#7a0e1d', '#93162a', .21],
  chest() {
    g.fillStyle = '#c4142c'; g.beginPath(); g.moveTo(4, -TOR); g.lineTo(30, -TOR); g.lineTo(30, -TOR + 16); g.lineTo(16, -TOR + 9); g.closePath(); g.fill();
    g.fillStyle = '#d9a441'; g.beginPath(); g.arc(21, -TOR + 27, 3.6, 0, TAU); g.fill();
    g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(-30, -9, 60, 3);
  },
  back() {   // red hood sitting on the shoulders
    g.fillStyle = '#c4142c'; g.beginPath(); g.ellipse(-13, -TOR + 3, 22, 11, -.2, 0, TAU); g.fill();
    g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();
  },
  head() {
    headBase('#e8b992', '#f7d3b1');
    g.fillStyle = '#2b1f24'; g.beginPath(); g.roundRect(-24.5, -14, 20, 22, [0, 0, 5, 9]); g.fill();   // undercut
    g.fillStyle = '#f08ea6';                                                                           // pink spikes
    g.beginPath();
    g.moveTo(-26, -9); g.lineTo(-31, -25); g.lineTo(-21, -23); g.lineTo(-24, -39); g.lineTo(-10, -30); g.lineTo(-7, -45);
    g.lineTo(3, -31); g.lineTo(11, -42); g.lineTo(16, -29); g.lineTo(27, -34); g.lineTo(24, -19); g.lineTo(28, -12);
    g.lineTo(20, -16); g.lineTo(15, -11); g.lineTo(9, -17); g.lineTo(2, -12); g.lineTo(-5, -17); g.lineTo(-11, -12); g.lineTo(-17, -16);
    g.closePath(); g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
    g.fillStyle = LINE;
    g.beginPath(); g.ellipse(5, 2, 2.8, 4.4, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(17, 2, 2.2, 4.4, 0, 0, TAU); g.fill();
    g.lineCap = 'round'; g.lineWidth = 2.4;
    g.beginPath(); g.moveTo(0, -6.5); g.lineTo(8, -4.5); g.moveTo(13.5, -4.5); g.lineTo(21, -6.5); g.stroke();   // brows
    g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(2, 9); g.lineTo(8, 9.6); g.moveTo(14, 9.6); g.lineTo(20, 9); g.stroke();             // marks under the eyes
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(9, 16); g.lineTo(16, 15); g.stroke();
    g.lineCap = 'butt';
  }
};
const CURSE = {
  torso: ['#3a3050', '#4d4169'],
  armF: ['#3a3050', '#4d4169', '#1d1729', '#2a2139', .22],
  armB: ['#261f36', '#322945', '#120e1a', '#1a1524', .22],
  legF: ['#342b48', '#453a5f', '#1d1729', '#2a2139', .18],
  legB: ['#221c30', '#2d2540', '#120e1a', '#1a1524', .18],
  chest() {   // stitched grin and a staring eye
    g.fillStyle = '#120d1c'; g.beginPath(); g.moveTo(-12, -34);
    for (let i = 0; i <= 6; i++) g.lineTo(-12 + i * 7, -34 + (i & 1 ? 9 : 0));
    g.lineTo(30, -20); g.lineTo(-12, -24); g.closePath(); g.fill();
    g.fillStyle = '#ff2440'; g.beginPath(); g.arc(14, -54, 4.5, 0, TAU); g.fill();
  },
  head() {
    g.fillStyle = '#d8cdb4'; g.lineWidth = 2.5; g.strokeStyle = LINE;
    g.beginPath(); g.moveTo(-14, -20); g.lineTo(-20, -40); g.lineTo(-5, -22); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(6, -22); g.lineTo(17, -42); g.lineTo(18, -20); g.closePath(); g.fill(); g.stroke();
    headBase('#463b60', '#5a4d79');
    g.fillStyle = '#eadfc4'; g.fillRect(1, -19, 21, 37);                    // talisman over the face
    g.lineWidth = 1.5; g.strokeStyle = '#a5102a'; g.strokeRect(3, -17, 17, 33);
    g.fillStyle = '#a5102a'; g.fillRect(10.5, 4, 2, 10);
    g.save(); g.translate(11.5, -6); g.scale(flip, 1);
    g.font = "15px 'Yuji Syuku','Yu Mincho',serif"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('呪', 0, 0);
    g.restore();
  }
};

const SHADE = g.createLinearGradient(0, 0, 0, 80);
SHADE.addColorStop(0, 'rgba(255,255,255,.08)'); SHADE.addColorStop(.55, 'rgba(0,0,0,0)'); SHADE.addColorStop(1, 'rgba(0,0,0,.24)');

function limb(px, py, ang, w, h, c) {
  g.save(); g.translate(px, py); g.rotate(-ang);
  g.beginPath(); g.roundRect(-w / 2, -5, w, h + 5, 7);
  g.save(); g.clip();
  g.fillStyle = c[0]; g.fillRect(-w / 2, -5, w, h + 5);
  g.fillStyle = c[1]; g.fillRect(w * (.5 - strip), -5, w * strip, h + 5);   // lighter strip = the box's front face
  if (c[2]) {
    const th = h * c[4];
    g.fillStyle = c[2]; g.fillRect(-w / 2, h - th, w, th);
    g.fillStyle = c[3]; g.fillRect(w * (.5 - strip), h - th, w * strip, th);
  }
  g.fillStyle = SHADE; g.fillRect(-w / 2, -5, w, h + 5);
  g.restore();
  g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();
  g.restore();
}

const hipOf = ps => lerp(Math.max(Math.cos(ps[4]), Math.cos(ps[5]), .3) * LEG, 17, Math.min(1, Math.abs(ps[6]) / 1.4));

function drawFighter(f, alpha) {
  const ps = f.pose, sk = f.skin, lean = ps[0], q = P(f.x, f.y, f.z || ZP), sc = K * q[2] * (f.scale || 1);
  flip = f.face * (f.spin < 0 ? -1 : 1);
  strip = clamp(.3 - flip * cam.yaw * 1.5, .12, .56);   // orbiting shows more or less of each block's front
  g.save();
  g.translate(q[0], q[1]);
  g.scale(f.face * sc * f.spin, sc);
  g.translate(0, -hipOf(ps));
  g.rotate(ps[6]);
  if (alpha !== undefined) g.globalAlpha = alpha;
  g.lineJoin = 'round';
  g.save(); g.rotate(lean); limb(-9, -TOR + 13, ps[3] + lean, 27, ARM, sk.armB); g.restore();
  limb(-8, 0, ps[5], 33, LEG, sk.legB);
  limb(8, 0, ps[4], 33, LEG, sk.legF);
  g.rotate(lean);
  g.beginPath(); g.roundRect(-30, -TOR, 60, TOR + 5, 8);
  g.save(); g.clip();
  g.fillStyle = sk.torso[0]; g.fillRect(-30, -TOR, 60, TOR + 5);
  g.fillStyle = sk.torso[1]; g.fillRect(30 - 63 * strip, -TOR, 63 * strip, TOR + 5);
  sk.chest();
  g.restore();
  g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();
  if (sk.back) sk.back();
  g.save(); g.translate(3, -TOR - 19); g.rotate(ps[1]); sk.head(); g.restore();
  limb(7, -TOR + 13, ps[2] + lean, 27, ARM, sk.armF);
  g.restore();
}

// where a fist is in the world, for effects
function hand(f, front) {
  const ps = f.pose, lean = ps[0], a = front ? ps[2] : ps[3], rot = ps[6];
  const ox = front ? 7 : -9, oy = -TOR + 13, cl = Math.cos(lean), sl = Math.sin(lean);
  const x = ox * cl - oy * sl + Math.sin(a) * ARM, y = ox * sl + oy * cl + Math.cos(a) * ARM;
  const cr = Math.cos(rot), sr = Math.sin(rot);
  return [f.x + (x * cr - y * sr) * f.face * K * f.spin, f.y - (x * sr + y * cr - hipOf(ps)) * K];
}

function fighter(skin, x, face) {
  return { skin, x, y: 0, vx: 0, vy: 0, face, spin: 1, ground: true, pose: POSE.idle.slice(), target: POSE.idle, rate: 18,
    state: 'idle', stun: 0, hp: 100, max: 100, flash: 0, inv: 0, lastHit: 9, ko: false, bounced: false,
    move: null, dashT: 0, dashDir: 1, ghostT: 0, walk: 0, chain: 0, chainT: 0 };
}
let P1 = fighter(YUJI, -230, 1), P2 = fighter(CURSE, 230, -1);

function blend(f, dt) {
  const k = 1 - Math.exp(-dt * f.rate), a = f.pose, b = f.target;
  for (let i = 0; i < 7; i++) a[i] += (b[i] - a[i]) * k;
  if (f.flash > 0) f.flash -= dt;
}

/* ================= effects ================= */
const fx = [], ghosts = [], timers = [];
const after = (t, fn) => timers.push({ t, fn });
function addSpark(x, y, col, r) { const rays = []; for (let i = 0; i < 9; i++) rays.push(rnd(0, TAU), rnd(.5, 1)); fx.push({ k: 0, x, y, col, r, rays, t: 0, life: .22 }); }
const addRing = (x, rgb, r) => fx.push({ k: 1, x, rgb, r, t: 0, life: .45 });
const addNum = (x, y, n, col) => fx.push({ k: 2, x: x + rnd(-24, 24), y, n, col, t: 0, life: .8 });
function addDust(x) { for (let i = 0; i < 5; i++) fx.push({ k: 3, x, vx: rnd(-150, 150), y: rnd(4, 14), s: rnd(9, 20), t: 0, life: rnd(.3, .5) }); }
const addSwoosh = (x, y, face, r, col) => fx.push({ k: 4, x, y, face, r, col, t: 0, life: .16 });
const addBlast = (x, y, rgb, r) => fx.push({ k: 5, x, y, rgb, r, t: 0, life: .42 });

function drawFx(dt) {
  for (let i = fx.length - 1; i >= 0; i--) {
    const e = fx[i];
    e.t += dt;
    if (e.t >= e.life) { fx.splice(i, 1); continue; }
    const p = e.t / e.life, q = ease(p), s0 = F(e.x, e.y || 0), sx = s0[0], sy = s0[1];
    if (e.k === 0) {                       // impact spark
      g.globalCompositeOperation = 'lighter'; g.strokeStyle = e.col; g.lineCap = 'round'; g.lineWidth = (1 - p) * 7 + .5;
      g.beginPath();
      for (let j = 0; j < e.rays.length; j += 2) {
        const a = e.rays[j], l = e.rays[j + 1] * e.r * q;
        g.moveTo(sx + Math.cos(a) * l * .35, sy + Math.sin(a) * l * .35); g.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l);
      }
      g.stroke();
      g.globalAlpha = 1 - p; g.fillStyle = '#fff'; g.beginPath(); g.arc(sx, sy, e.r * .3 * (1 - p * .5), 0, TAU); g.fill();
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.lineCap = 'butt';
    } else if (e.k === 1) {                // shockwave rolling over the floor
      g.strokeStyle = `rgba(${e.rgb},${1 - p})`; g.lineWidth = 7 * (1 - p) + 1;
      g.beginPath(); g.ellipse(sx, sy + 4, e.r * q, e.r * q * .26, 0, 0, TAU); g.stroke();
    } else if (e.k === 2) {                // damage number
      g.globalAlpha = 1 - p * p; g.font = "38px Anton, Impact, sans-serif"; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 6; g.strokeStyle = LINE; g.lineJoin = 'round'; g.strokeText(e.n, sx, sy - 70 * q);
      g.fillStyle = e.col; g.fillText(e.n, sx, sy - 70 * q); g.globalAlpha = 1;
    } else if (e.k === 3) {                // dust
      g.globalAlpha = .35 * (1 - p); g.fillStyle = '#b9a9c9';
      const d = F(e.x + e.vx * e.t, e.y + 22 * q);
      g.beginPath(); g.arc(d[0], d[1], e.s * (.6 + q), 0, TAU); g.fill(); g.globalAlpha = 1;
    } else if (e.k === 4) {                // swing arc
      g.save(); g.translate(sx, sy); g.scale(e.face, 1); g.globalAlpha = (1 - p) * .85; g.fillStyle = e.col;
      g.beginPath(); g.arc(-e.r * .55, 0, e.r, -1.05, 1.05); g.arc(-e.r * .8, 0, e.r * 1.04, .95, -.95, true); g.closePath(); g.fill();
      g.restore(); g.globalAlpha = 1;
    } else if (e.k === 6) {                // wisp of cursed energy drifting up
      g.globalCompositeOperation = 'lighter'; glow(GLOW.purple, sx, sy - 150 * q, 44 * (1 - p * .6), 1 - p); g.globalCompositeOperation = 'source-over';
    } else {                               // energy blast
      g.globalCompositeOperation = 'lighter';
      const r = e.r * q, gr = g.createRadialGradient(sx, sy, 0, sx, sy, r);
      gr.addColorStop(0, `rgba(255,255,255,${1 - p})`); gr.addColorStop(.35, `rgba(${e.rgb},${.8 * (1 - p)})`); gr.addColorStop(1, `rgba(${e.rgb},0)`);
      g.fillStyle = gr; g.beginPath(); g.arc(sx, sy, r, 0, TAU); g.fill();
      g.strokeStyle = `rgba(${e.rgb},${1 - p})`; g.lineWidth = 5 * (1 - p) + 1; g.beginPath(); g.arc(sx, sy, r * .8, 0, TAU); g.stroke();
      g.globalCompositeOperation = 'source-over';
    }
  }
}

/* ================= HUD ================= */
const $ = s => root.querySelector(s);
const hud = { hp: [$('#hp1'), $('#hp2')], lag: [$('#lag1'), $('#lag2')], v: [-1, -1], combo: $('#combo'), cN: $('#cN'), cD: $('#cD'), banner: $('#banner'), mv: {}, cdv: {} };
root.querySelectorAll('.mv').forEach(el => { hud.mv[el.dataset.m] = el; });
let combo = 0, comboDmg = 0, comboT = 0;

function banner(jp, en, cls) {
  const b = hud.banner;
  b.className = 'banner' + (cls ? ' ' + cls : '');
  b.innerHTML = `<span lang="ja">${jp}</span><b>${en}</b>`;
  void b.offsetWidth;
  b.classList.add('go');
}
function hudSync() {
  [P1, P2].forEach((f, i) => {
    const v = Math.round(f.hp / f.max * 1000) / 1000;
    if (v !== hud.v[i]) { hud.v[i] = v; hud.hp[i].style.transform = hud.lag[i].style.transform = `scaleX(${v})`; }
  });
  for (const k in CD) {
    const v = Math.round(cd[k] / CD[k] * 50) / 50;
    if (v !== hud.cdv[k]) {
      if (v === 0 && hud.cdv[k] > 0) { hud.mv[k].classList.remove('rdy'); void hud.mv[k].offsetWidth; hud.mv[k].classList.add('rdy'); }
      hud.cdv[k] = v; hud.mv[k].style.setProperty('--cd', v);
    }
  }
}
function hudCombo() {
  hud.cN.textContent = combo; hud.cD.textContent = Math.round(comboDmg) + ' DMG';
  hud.combo.classList.toggle('on', combo >= 2);
  hud.cN.classList.remove('pop'); void hud.cN.offsetWidth; hud.cN.classList.add('pop');
}

/* ================= combat ================= */
const CD = { strikes: 6, crush: 8, div: 7, manji: 8, dash: 1.1 };
const cd = { strikes: 0, crush: 0, div: 0, manji: 0, dash: 0 };
const keys = new Set(), buf = {};
const take = k => buf[k] > 0 ? (buf[k] = 0, true) : false;

function tryHit(p, h) {
  const o = P2;
  if (hooks.aim) h = hooks.aim(p, h);
  if (o.state === 'down' || o.state === 'up' || o.inv > 0) return false;
  const dx = (o.x - p.x) * p.face;
  if (dx < -30 || dx > h.reach + 40 * ((o.scale || 1) - 1) || Math.abs(o.y - p.y) > 160) return false;
  applyHit(o, p.face, h);
  return true;
}

function applyHit(o, face, h) {
  const dmg = h.dmg * (o.dr || 1) * (hooks.power ? hooks.power(h, o) : 1), hs = o.scale || 1, dead = o.hp - dmg <= 0;
  o.hp = Math.max(0, o.hp - dmg); o.lastHit = 0; o.flash = .09;
  if (o.poise && !dead) o.vx += face * h.kb * .12;          // too heavy to stagger: it only flinches
  else {
    o.face = -face; o.vx = face * h.kb;
    if (h.lift || !o.ground || dead) {
      o.vy = Math.max(h.lift || 0, o.ground ? 520 : 320);
      o.ground = false; o.bounced = false; o.y = Math.max(o.y, 1); o.state = 'air';
    } else { o.state = 'hurt'; o.stun = h.stun; }
  }
  stopT = Math.max(stopT, h.stop || .04);
  cam.shake = Math.max(cam.shake, h.heavy ? 18 : 6);
  if (h.heavy) cam.kick += face * .05;
  combo++; comboDmg += dmg; comboT = 1.9; hudCombo();
  addSpark(o.x - face * 26, o.y + 150 * hs, h.col || '#fff', h.heavy ? 130 : 72);
  addNum(o.x, o.y + 270 * hs, +dmg.toFixed(1), h.heavy ? '#ffd27a' : '#fff');
  if (h.ring) addRing(o.x, '255,150,90', 300);
  sfx.hit(!!h.heavy);
  if (hooks.hit) hooks.hit(o, face, h);
  if (dead && !o.ko) {
    o.ko = true;
    if (hooks.ko && hooks.ko(o)) return;      // a staged fight decides what winning means
    endT = 4.4; blackFlash();                  // training: the killing blow always erupts as a Black Flash
    after(.5, () => banner('祓', 'EXORCISED'));
  }
}

// the second, delayed impact that gives Divergent Fist its name
function divergentBlast(face) {
  const o = P2;
  if (o.state === 'down' || o.state === 'up') return;
  addBlast(o.x, o.y + 150, '79,195,255', 200); addRing(o.x, '79,195,255', 280);
  applyHit(o, face, { dmg: 10, kb: 640, lift: 430, stop: .12, heavy: 1, col: '#4fc3ff' });
  sfx.blast();
}

function blackFlash() {
  if (bfT > .3) return;
  const o = P2, c = F(o.x, o.y + 150), cx = c[0] * S, cy = c[1] * S;
  slowT = .6; bfT = .5; zoomT = .7; cam.shake = 34;
  addBlast(o.x, o.y + 150, '255,36,64', 300); addRing(o.x, '255,36,64', 420);
  JU.flash(cx, cy); JU.bolts(cx, cy, 18);
  banner('黒閃', 'BLACK FLASH', 'bf');
  sfx.bf();
  if (hooks.bf) hooks.bf(o);
}

const swing = (p, y, r, col) => { addSwoosh(p.x + p.face * 70, p.y + y, p.face, r, col); if (hooks.swing) hooks.swing(p, y, r, col); };

function runBasic(p, m, t) {
  const d = m.def;
  p.rate = 42;
  if (t < d.strike) { p.target = POSE[d.pre]; if (p.ground) p.vx = p.face * d.lunge * .4; return; }
  p.target = t < d.strike + .13 ? POSE[d.pose] : POSE.idle;
  if (p.ground) p.vx = t < d.strike + .07 ? p.face * d.lunge : 0;
  if (!m.sw) { m.sw = 1; sfx.whoosh(); swing(p, d.kick ? 140 : 170, d.kick ? 110 : 78, 'rgba(255,255,255,.9)'); }
  if (!m.done && t < d.strike + .09 && tryHit(p, d.hit)) m.done = 1;
  if (m.i < 3 && t > d.strike + .08 && take('m1')) startM1(m.i + 1);
}

const MOVES = {
  m1: [
    { m1: 1, dur: .25, strike: .06, pre: 'idle', pose: 'jab', lunge: 210, run: runBasic, hit: { reach: 150, dmg: 3, kb: 170, stun: .34, stop: .04 } },
    { m1: 1, dur: .25, strike: .06, pre: 'jab', pose: 'cross', lunge: 210, run: runBasic, hit: { reach: 155, dmg: 3, kb: 170, stun: .34, stop: .04 } },
    { m1: 1, dur: .3, strike: .09, pre: 'hookWind', pose: 'hook', lunge: 220, run: runBasic, hit: { reach: 152, dmg: 4, kb: 200, stun: .38, stop: .06 } },
    { m1: 1, dur: .5, strike: .15, pre: 'kickWind', pose: 'kick', lunge: 300, kick: 1, run: runBasic, hit: { reach: 185, dmg: 6, kb: 620, lift: 560, stun: .9, stop: .1, heavy: 1 } }
  ],
  // 1 — a flurry that ends in a launcher
  strikes: { dur: 1, glow: 'purple', run(p, m, t) {
    p.rate = 46;
    if (t < .1) { p.target = POSE.divWind; p.vx = 0; return; }
    const n = Math.floor((t - .1) / .1);
    if (n > 6) { p.target = POSE.idle; p.vx = 0; return; }
    p.target = n & 1 ? POSE.cross : POSE.jab; p.vx = p.face * 150;
    if (n !== m.n) {
      m.n = n; sfx.whoosh(); swing(p, 170 + (n & 1 ? 12 : -8), 74, 'rgba(157,123,255,.9)');
      tryHit(p, n === 6 ? { reach: 170, dmg: 5, kb: 560, lift: 420, stun: .8, stop: .1, heavy: 1, col: '#b79bff' }
                        : { reach: 165, dmg: 2, kb: 70, stun: .3, stop: .025, col: '#b79bff' });
    }
  } },
  // 2 — hop up and hammer down
  crush: { dur: .85, glow: 'fire', run(p, m, t) {
    if (t < .3) {
      p.target = POSE.crushWind; p.vx = p.face * 120; p.rate = 26;
      if (!m.hop && p.ground) { m.hop = 1; p.vy = 520; p.ground = false; }
      return;
    }
    p.target = t < .56 ? POSE.crush : POSE.idle; p.rate = 46; p.vx = t < .4 ? p.face * 260 : 0;
    if (!m.sw) { m.sw = 1; sfx.whoosh(); swing(p, 150, 120, 'rgba(255,140,80,.9)'); }
    if (!m.done && t < .42 && tryHit(p, { reach: 180, dmg: 12, kb: 260, lift: 430, stun: .5, stop: .14, heavy: 1, ring: 1, col: '#ff8c50' })) m.done = 1;
    if (!m.slam && p.ground) { m.slam = 1; addRing(p.x + p.face * 110, '255,150,90', 240); cam.shake = Math.max(cam.shake, 12); }
  } },
  // 3 — the hit lands, then the cursed energy catches up. Press 3 again as the ring closes for a Black Flash.
  div: { dur: .8, glow: 'blue', windup: .34, run(p, m, t) {
    const ST = this.windup;
    if (t < ST) { p.target = POSE.divWind; p.vx = 0; p.rate = 26; return; }
    p.target = t < ST + .2 ? POSE.div : POSE.idle; p.rate = 46; p.vx = t < ST + .1 ? p.face * 420 : 0;
    if (!m.sw) { m.sw = 1; sfx.whoosh(); swing(p, 172, 96, m.bf ? 'rgba(255,36,64,.95)' : 'rgba(79,195,255,.9)'); }
    if (m.done || t >= ST + .1) return;
    if (m.bf) {
      if (tryHit(p, { reach: 185, dmg: 30, kb: 1050, lift: 560, stop: .3, heavy: 1, col: '#ff2440' })) { m.done = 1; blackFlash(); }
    } else if (tryHit(p, { reach: 180, dmg: 6, kb: 130, stun: .75, stop: .08, col: '#4fc3ff' })) {
      m.done = 1; const face = p.face; after(.34, () => divergentBlast(face));
    }
  }, again(m) {
    if (m.tried) return;
    m.tried = 1;
    if (m.t >= .2 && m.t < this.windup) { m.bf = 1; sfx.charge(); }
  } },
  // 4 — a full spin into a back kick
  manji: { dur: .75, run(p, m, t) {
    const ST = .28;
    if (t < ST) { p.target = POSE.manjiWind; p.spin = Math.cos(t / ST * TAU); p.vx = p.face * 200; p.rate = 30; return; }
    p.spin = 1; p.target = t < ST + .22 ? POSE.manji : POSE.idle; p.rate = 46; p.vx = t < ST + .08 ? p.face * 380 : 0;
    if (!m.sw) { m.sw = 1; sfx.whoosh(); swing(p, 150, 130, 'rgba(255,255,255,.9)'); }
    if (!m.done && t < ST + .1 && tryHit(p, { reach: 200, dmg: 11, kb: 820, lift: 330, stop: .12, heavy: 1 })) m.done = 1;
  } }
};

function startM1(i) { if (hooks.m1 && !hooks.m1(i)) return; P1.move = { def: MOVES.m1[i], i, t: 0 }; }
function tryStart(k) {
  if (!(buf[k] > 0) || cd[k] > 0) return false;
  buf[k] = 0; cd[k] = CD[k];
  P1.move = { def: (hooks.move && hooks.move(k)) || MOVES[k], key: k, t: 0 };
  hud.mv[k].classList.add('act');
  return true;
}
function endMove(p) {
  const m = p.move;
  p.move = null; p.spin = 1;
  if (m.key) hud.mv[m.key].classList.remove('act');
  if (m.def.m1) { p.chain = (m.i + 1) % 4; p.chainT = .45; }
}

function updatePlayer(dt) {
  const p = P1, o = P2;
  const dir = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
  p.rate = 18;
  if (p.chainT > 0 && (p.chainT -= dt) <= 0) p.chain = 0;
  if (hooks.playerPre && hooks.playerPre(p, o, dt)) { /* knocked about: foes.js is driving */ }
  else if (p.dashT > 0) {
    p.dashT -= dt; p.vx = p.dashDir * (p.dashV || 1050); p.target = POSE.dash; p.rate = 34;
    if ((p.ghostT -= dt) <= 0) { p.ghostT = .028; ghosts.push({ skin: p.skin, x: p.x, y: p.y, face: p.face, spin: 1, pose: p.pose.slice(), t: 0, tint: p.dashTint }); }
    if (p.dashT <= 0) p.vx *= .2;
  } else if (p.move) {
    const m = p.move;
    m.t += dt * (m.def.m1 && hooks.m1rate ? hooks.m1rate() : 1); m.def.run(p, m, m.t);
    if (hooks.moveFx) hooks.moveFx(p, m);
    if (p.move === m && m.t >= m.def.dur) endMove(p);
  } else {
    if (p.ground) {
      p.face = o.x >= p.x ? 1 : -1;            // always square up to the opponent
      p.vx = dir * 360;
      if (dir) {
        p.walk += dt * 11 * dir * p.face;
        const s = Math.sin(p.walk);
        WALK[0] = .07 + .08 * dir * p.face; WALK[2] = 1.15 + .14 * s; WALK[3] = .62 - .14 * s; WALK[4] = .6 * s; WALK[5] = -.6 * s;
        p.target = WALK; p.rate = 24;
      } else {
        const s = Math.sin(T * 3.2);
        IDLE[0] = .07 + .012 * s; IDLE[2] = 1.15 + .05 * s; IDLE[3] = .62 + .05 * s;
        p.target = IDLE;
      }
      if (take('jump') && !(hooks.noJump && hooks.noJump(p))) { p.vy = 1020; p.ground = false; sfx.jump(); addDust(p.x); }
    } else {
      p.vx = lerp(p.vx, dir * 360, 1 - Math.exp(-dt * 5));
      p.target = p.vy > 0 ? POSE.jump : POSE.fall;
    }
    if (buf.dash > 0 && cd.dash <= 0) {
      const dz = hooks.dash && hooks.dash();
      buf.dash = 0; cd.dash = CD.dash; p.dashT = dz ? dz.t : .17; p.dashV = dz ? dz.v : 1050; p.dashTint = dz ? dz.tint : null; p.dashDir = dir || p.face; p.face = p.dashDir; p.ghostT = 0;
      sfx.whoosh(); if (p.ground) addDust(p.x);
    } else if (p.ground && (tryStart('strikes') || tryStart('crush') || tryStart('div') || tryStart('manji'))) { /* started */ }
    else if (take('m1')) startM1(p.chain);
  }
  if (!p.ground) {
    p.vy -= GRAV * dt; p.y += p.vy * dt;
    if (p.y <= 0) { p.y = 0; p.vy = 0; p.ground = true; addDust(p.x); sfx.land(); }
  }
  const edge = hooks.bound ? hooks.bound() : BOUND;   // something may have made the arena bigger for him
  p.x = clamp(p.x + p.vx * dt, -edge, edge);
  const sep = VW - 240;                         // the screen edge is a wall too
  if (edge === BOUND && Math.abs(p.x - o.x) > sep) p.x = o.x + Math.sign(p.x - o.x) * sep;
  blend(p, dt);
}

function updateFoe(dt) {
  const o = P2, p = P1;
  o.lastHit += dt; o.rate = 16;
  if (o.inv > 0) o.inv -= dt;
  if (o.state === 'idle') {
    o.face = p.x >= o.x ? 1 : -1; o.vx *= Math.exp(-dt * 12);
    const s = Math.sin(T * 2.6 + 1);
    IDLE2[0] = .07 + .012 * s; IDLE2[2] = 1.15 + .06 * s; IDLE2[3] = .62 + .06 * s;
    o.target = IDLE2;
    if (hooks.foeIdle) hooks.foeIdle(o, p, dt);
  } else if (o.state === 'act') {                // mid-attack: foes.js runs it
    hooks.foeAct(o, p, dt);
  } else if (o.state === 'hurt') {
    o.vx *= Math.exp(-dt * 7); o.target = POSE.hurt; o.rate = 32;
    if ((o.stun -= dt) <= 0) o.state = 'idle';
  } else if (o.state === 'air') {
    o.target = POSE.air; o.rate = 12;
  } else if (o.state === 'down') {
    o.vx *= Math.exp(-dt * 9); o.target = POSE.down; o.rate = 22;
    if (o.ko && !o.human) {                     // exorcised: it breaks apart into cursed energy
      o.alpha = Math.max(0, (o.alpha === undefined ? 1 : o.alpha) - dt * .5);
      if (o.alpha > 0 && Math.random() < dt * 45) fx.push({ k: 6, x: o.x + rnd(-70, 70), y: rnd(10, 60), t: 0, life: rnd(.6, 1.1) });
    } else if (!o.ko && (o.stun -= dt) <= 0) { o.state = 'up'; o.stun = .32; o.inv = .5; }
  } else {                                      // getting up
    o.target = POSE.idle; o.rate = 12;
    if ((o.stun -= dt) <= 0) o.state = 'idle';
  }
  if (!o.ground) {
    o.vy -= GRAV * dt; o.y += o.vy * dt;
    if (o.y <= 0) {
      o.y = 0; addDust(o.x); sfx.land();
      if (o.vy < -820 && !o.bounced) { o.bounced = true; o.vy = -o.vy * .34; o.vx *= .6; o.y = 1; cam.shake = Math.max(cam.shake, 8); addRing(o.x, '185,169,201', 170); }
      else { o.ground = true; o.vy = 0; o.state = 'down'; o.stun = o.ko ? 1.7 : .55; }
    }
  }
  o.x += o.vx * dt;
  if (Math.abs(o.x) > BOUND) {
    o.x = clamp(o.x, -BOUND, BOUND);
    if (Math.abs(o.vx) > 320) { addSpark(o.x + Math.sign(o.x) * 30, o.y + 150, '#fff', 90); cam.shake = Math.max(cam.shake, 12); sfx.hit(true); o.vx *= -.45; }
    else o.vx = 0;
  }
  blend(o, dt);
}

function update(dt, real) {
  for (const k in buf) if (buf[k] > 0) buf[k] -= real;
  if (dt > 0) {
    for (const k in cd) if (cd[k] > 0) cd[k] = Math.max(0, cd[k] - dt);
    for (let i = timers.length - 1; i >= 0; i--) { const t = timers[i]; if ((t.t -= dt) <= 0) { timers.splice(i, 1); t.fn(); } }
    updatePlayer(dt); updateFoe(dt);
    // bodies can't overlap (a dash slips through)
    const dx = P2.x - P1.x, min = 39 + 39 * (P2.scale || 1);
    if (P1.ground && P2.ground && P2.state !== 'down' && P1.dashT <= 0 && Math.abs(dx) < min) {
      const s = dx >= 0 ? 1 : -1, push = min - Math.abs(dx);
      P1.x = clamp(P1.x - s * push * .7, -BOUND, BOUND); P2.x = clamp(P2.x + s * push * .3, -BOUND, BOUND);
    }
    if (comboT > 0 && (comboT -= dt) <= 0) { combo = 0; comboDmg = 0; hud.combo.classList.remove('on'); }
    if (hooks.tick) hooks.tick(dt);
  }
  const lim = Math.max(0, STAGE - VW / 2);
  cam.x = lerp(cam.x, clamp((P1.x + P2.x) / 2, -lim, lim), 1 - Math.exp(-real * 6));
  if (zoomT > 0) zoomT -= real;
  cam.zoom = lerp(cam.zoom, zoomT > 0 ? 1.16 : 1, 1 - Math.exp(-real * 9));
  // the camera swings round the fighters: toward whichever corner they are in, and hard on a Black Flash
  const want = (lim ? cam.x / lim * .09 : 0) + (zoomT > 0 ? P1.face * .3 : 0) + cam.kick;
  cam.yaw = lerp(cam.yaw, want, 1 - Math.exp(-real * (zoomT > 0 ? 7 : 3)));
  cam.kick *= Math.exp(-real * 5);
  if (endT > 0 && (endT -= real) <= 0) {
    if (JU.story) JU.story.fightWon();
    else { P2.ko = false; P2.hp = P2.max; P2.alpha = 1; P2.state = 'up'; P2.stun = .3; }
  }
  for (let i = ghosts.length - 1; i >= 0; i--) if ((ghosts[i].t += real) > .22) ghosts.splice(i, 1);
  hudSync();
}

/* ================= render ================= */
function shadow(f) {
  const k = clamp(1 - f.y / 520, .3, 1), q = P(f.x, f.ground0 || 0, f.z || ZP), r = k * q[2] * (f.scale || 1);
  g.fillStyle = `rgba(0,0,0,${.5 * k * (f.alpha === undefined ? 1 : f.alpha)})`;
  g.beginPath(); g.ellipse(q[0], q[1] + 5 * q[2], 64 * r, 13 * r, 0, 0, TAU); g.fill();
}
function drawBody(f) {
  if (f.flash > 0) g.filter = 'brightness(2.6) saturate(.2)';
  drawFighter(f, f.alpha);
  if (f.flash > 0) g.filter = 'none';
}

function render(fdt, extra) {
  g.setTransform(DPR * S, 0, 0, DPR * S, 0, 0);
  const sh = JU.reduceMotion ? 0 : cam.shake;
  g.save();
  g.translate(VW / 2 + rnd(-sh, sh), GY - 120 + rnd(-sh, sh) * .6 - cam.lift);   // cutscenes lift the frame clear of the dialogue box
  g.scale(cam.zoom, cam.zoom);
  g.translate(-VW / 2, -(GY - 120));

  stage.sky(); stage.floor(); stage.back();
  if (hooks.under) hooks.under(fdt);
  const more = extra || (hooks.cast && hooks.cast());
  const cast = (more ? [P2, P1, ...more] : [P2, P1]).filter(f => f.alpha === undefined || f.alpha > .01);
  if (extra) ghosts.length = 0;
  if (more) cast.sort((a, b) => (b.z || ZP) - (a.z || ZP));
  for (const f of cast) shadow(f);
  for (const gh of ghosts) {
    if (gh.tint) g.filter = 'brightness(.7) sepia(1) hue-rotate(170deg) saturate(7)';   // Projection Sorcery leaves blue frames behind
    drawFighter(gh, (gh.tint ? .62 : .34) * (1 - gh.t / .22));
    if (gh.tint) g.filter = 'none';
  }
  for (const f of cast) drawBody(f);

  // cursed energy on the fists while a technique is out
  const m = P1.move;
  if (m && m.def.glow) {
    g.globalCompositeOperation = 'lighter';
    const img = GLOW[m.bf ? 'red' : m.def.glow], pulse = 1 + .15 * Math.sin(T * 40);
    for (const front of [true, false]) { const w = hand(P1, front), h = F(w[0], w[1]); glow(img, h[0], h[1], 120 * pulse, .9); }
    g.globalCompositeOperation = 'source-over';
  }
  // Black Flash timing ring closing on the fist
  if (m && m.def === MOVES.div && m.t < MOVES.div.windup) {
    const w = hand(P1, false), h = F(w[0], w[1]), u = m.t / MOVES.div.windup, hot = m.t >= .2 || m.bf;
    g.lineWidth = hot ? 6 : 3;
    g.strokeStyle = m.bf ? '#fff' : hot ? '#ff2440' : m.tried ? 'rgba(160,160,170,.6)' : 'rgba(79,195,255,.9)';
    g.beginPath(); g.arc(h[0], h[1], lerp(110, 26, u), 0, TAU); g.stroke();
    g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.5)';
    g.beginPath(); g.arc(h[0], h[1], 26, 0, TAU); g.stroke();
  }
  drawFx(fdt);
  if (hooks.fx) hooks.fx(fdt);
  stage.front();

  g.globalCompositeOperation = 'lighter';
  for (const e of embers) {
    e.y -= e.v * fdt; if (e.y < -.05) { e.y = 1.05; e.x = Math.random(); }
    const span = VW * 1.4, x = ((e.x * span - cam.x * e.d * .6) % span + span) % span - VW * .2 + Math.sin(T * e.d + e.ph) * 14;
    glow(GLOW[e.c], x, e.y * VH, 10 + e.d * 14, .3 + .3 * Math.sin(T * 3 + e.ph));
  }
  g.globalCompositeOperation = 'source-over';
  g.restore();

  if (bfT > 0) {                      // impact frame: negative for an instant, then the world dims
    if (bfT > .4 && !JU.reduceMotion) { g.globalCompositeOperation = 'difference'; g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over'; }
    else { g.fillStyle = `rgba(10,0,4,${.6 * bfT / .4})`; g.fillRect(0, 0, VW, VH); }
  }
  if (hooks.post) hooks.post(fdt);
  const vg = g.createRadialGradient(VW / 2, VH * .5, VH * .45, VW / 2, VH * .5, Math.max(VW, VH) * .75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)');
  g.fillStyle = vg; g.fillRect(0, 0, VW, VH);
}

function frame(now) {
  if (!running) return;
  const real = Math.min(.033, (now - last) / 1000);
  last = now; T += real;
  let dt = real;
  if (stopT > 0) { stopT -= real; dt = 0; }
  else if (slowT > 0) { slowT -= real; dt = real * .22; }
  cam.shake = Math.max(0, cam.shake - real * 70);
  if (bfT > 0) bfT -= real;
  if (scene) scene.update(dt, real); else update(dt, real);
  cyaw = Math.cos(cam.yaw); syaw = Math.sin(cam.yaw);
  if (scene) scene.render(dt, real); else render(dt);
  raf = requestAnimationFrame(frame);
}

/* ================= input ================= */
const KEYMAP = { tab: 'skip', x: 'skip', g: 'awk', r: 'clan', t: 'takeover', v: 'vow', enter: 'ok', e: 'ok', j: 'm1', '1': 'strikes', '2': 'crush', '3': 'div', '4': 'manji', q: 'dash', shift: 'dash', w: 'jump', arrowup: 'jump', ' ': 'jump' };
function press(a) {
  if (performance.now() < armAt) return;
  if (scene) { if (scene.press) scene.press(a); return; }
  if (hooks.press && hooks.press(a, false)) return;
  if (a === 'skip') return;
  if (a === 'awk') { if (hooks.awaken) hooks.awaken(P1); return; }
  if (a === 'div' && P1.move && P1.move.def === MOVES.div) { MOVES.div.again(P1.move); return; }
  buf[a] = .18;
}
addEventListener('keydown', e => {
  if (!running) return;
  const k = e.key.toLowerCase();
  if (k === 'escape') { e.preventDefault(); JU.exitGame(); return; }
  if (KEYMAP[k] || k === 'a' || k === 'd' || k === 's' || k.startsWith('arrow')) e.preventDefault();
  if (e.repeat) return;
  keys.add(k);
  if (KEYMAP[k]) press(KEYMAP[k]);
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => keys.clear());
addEventListener('resize', () => { if (running) resize(); });
root.addEventListener('pointerdown', e => { if (running && e.button === 0) press('m1'); });
root.addEventListener('contextmenu', e => e.preventDefault());

/* ================= lifecycle ================= */
function start(mode, arg) {
  resize();
  stage = SHRINE;
  if (hooks.reset) hooks.reset();
  P1 = fighter(YUJI, -230, 1); P2 = fighter(CURSE, 230, -1);
  fx.length = ghosts.length = timers.length = 0; keys.clear();
  for (const k in buf) buf[k] = 0;
  for (const k in cd) cd[k] = 0;
  for (const k in hud.mv) hud.mv[k].classList.remove('act', 'rdy');
  combo = comboDmg = comboT = stopT = slowT = bfT = zoomT = endT = 0;
  cam.x = 0; cam.shake = 0; cam.zoom = 1; cam.kick = 0; cam.lift = 0;
  cam.yaw = JU.reduceMotion ? 0 : -.5;          // open on a sweep round the arena
  cyaw = Math.cos(cam.yaw); syaw = Math.sin(cam.yaw);
  scene = null; root.dataset.mode = 'fight';
  if (JU.story) JU.story.reset();
  hud.combo.classList.remove('on'); hud.banner.className = 'banner';
  running = true; last = performance.now(); armAt = last + 300;
  hudSync(); render(0);
  cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  if (mode === 'free') JU.street.start({ free: true });
  else if (mode === 'maki') JU.maki.start();
  else if (mode === 'training') JU.training.start();
  else if (mode === 'story' && arg > 1) JU.chapters.play(arg);
  else setTimeout(() => { if (running && !scene) banner('開戦', 'FIGHT!'); }, 600);
}
function stop() { running = false; scene = null; cancelAnimationFrame(raf); keys.clear(); if (JU.story) JU.story.reset(); }

// stage a fresh fight without leaving the game: the story and free exploration both use this
function arena(o) {
  const old = P1;
  stage = o.stage || SHRINE;
  P1 = fighter(o.skin || old.skin, o.p1x === undefined ? -230 : o.p1x, 1);
  if (o.keepHp) P1.hp = old.hp;
  P2 = o.foe;
  fx.length = ghosts.length = timers.length = 0;
  for (const k in buf) buf[k] = 0;
  for (const k in hud.mv) hud.mv[k].classList.remove('act');
  combo = comboDmg = comboT = stopT = slowT = bfT = zoomT = endT = 0;
  cam.x = (P1.x + P2.x) / 2; cam.zoom = 1; cam.kick = 0; cam.lift = 0; cam.shake = 0;
  cam.yaw = JU.reduceMotion ? 0 : (o.yaw === undefined ? -.35 : o.yaw);
  hud.combo.classList.remove('on');
  scene = null; root.dataset.mode = 'fight'; armAt = performance.now() + 250;
}

JU.game = { start, stop, press, keys, get state() { return { p1: P1, p2: P2, combo, cd, cam, running, scene }; } };

// shared with the story scenes (chars.js / street.js / story.js)
JU.eng = {
  g, root, P, quad, box, glow, GLOW, drawFighter, shadow, fighter, blend, POSE, YUJI, headBase, cam, keys, banner, skyline, embers,
  ZP, CAM_Y, TOR, LINE, lerp, clamp, rnd, ease,
  renderArena: render,
  hooks, F, hand, tryHit, applyHit, after, endMove, arena, MOVES, CD, cd, hud, fx, K, CURSE, SHRINE,
  addSpark, addRing, addNum, addDust, addBlast, blackFlash,
  stop(t) { stopT = Math.max(stopT, t); }, slow(t) { slowT = Math.max(slowT, t); }, zoomIn(t) { zoomT = Math.max(zoomT, t); },
  setScene(sc) { scene = sc; root.dataset.mode = sc ? sc.mode : 'fight'; },
  get VW() { return VW; }, get VH() { return VH; }, get GY() { return GY; }, get HY() { return HY; }, get S() { return S; },
  get T() { return T; }, get ZNEAR() { return ZNEAR; }, get P1() { return P1; }, get P2() { return P2; }
};
})();
