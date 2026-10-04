/* JUJUTSU UNLIMITEDS — the school yard at night (and the Tokyo street as a place to fight) */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, box = E.box, quad = E.quad, glow = E.glow, GLOW = E.GLOW, cam = E.cam, W = JU.tokyo;
const { lerp, ZP } = E, TAU = Math.PI * 2, STAGE = 1050, BACK = ZP + 520;
let boss = false, veilX = null, veilH = 0;      // boss: the special grade is here. veil: a curtain cutting the yard in two

let seed = 21;
const r = () => (seed = seed * 16807 % 2147483647) / 2147483647;
const LIT = Array.from({ length: 54 }, () => r() < .16);     // which classroom windows still have a light on
const line = (a, b) => { g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); };

function sky() {
  const HY = E.HY, VW = E.VW, gr = g.createLinearGradient(0, 0, 0, HY);
  if (boss) { gr.addColorStop(0, '#050003'); gr.addColorStop(.55, '#2a0410'); gr.addColorStop(1, '#7a0e1e'); }
  else { gr.addColorStop(0, '#04060d'); gr.addColorStop(.6, '#0e1a2c'); gr.addColorStop(1, '#27405a'); }
  g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
  const mx = VW / 2 - 330 - cam.x * .03 - cam.yaw * 700, my = Math.max(100, HY - 310);
  g.globalCompositeOperation = 'lighter'; glow(boss ? GLOW.red : GLOW.blue, mx, my, boss ? 560 : 300, boss ? .6 : .35); g.globalCompositeOperation = 'source-over';
  g.fillStyle = boss ? '#120005' : '#eef0e2'; g.beginPath(); g.arc(mx, my, boss ? 74 : 32, 0, TAU); g.fill();
  g.globalAlpha = boss ? .5 : 1; g.drawImage(E.skyline, VW / 2 - 1600 - cam.x * .1 - cam.yaw * 760, HY - 298); g.globalAlpha = 1;
}

function floor() {
  const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR, gr = g.createLinearGradient(0, HY, 0, VH);
  gr.addColorStop(0, boss ? '#4a0d1a' : '#2c343d'); gr.addColorStop(.3, boss ? '#22060c' : '#171b21'); gr.addColorStop(1, boss ? '#0c0204' : '#0a0c10');
  g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
  g.beginPath();                                             // faint seams in the tarmac
  for (let x = -STAGE; x <= STAGE; x += 150) line(P(x, 0, zn), P(x, 0, BACK));
  for (let z = Math.ceil(zn / 150) * 150; z <= BACK; z += 150) line(P(-STAGE, 0, z), P(STAGE, 0, z));
  g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 1.5; g.stroke();
  g.beginPath();                                             // painted court
  line(P(-720, 0, 400), P(720, 0, 400)); line(P(720, 0, 400), P(720, 0, 1020)); line(P(720, 0, 1020), P(-720, 0, 1020)); line(P(-720, 0, 1020), P(-720, 0, 400));
  line(P(0, 0, 400), P(0, 0, 1020));
  for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, q = P(Math.cos(a) * 170, 0, 710 + Math.sin(a) * 170); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }
  g.strokeStyle = boss ? 'rgba(255,90,110,.4)' : 'rgba(230,236,240,.3)'; g.lineWidth = 3; g.stroke();
}

function back() {
  const T = E.T, wall = boss ? '#1a0a10' : '#1d2630', side = boss ? '#0e0509' : '#121820', top = boss ? '#2a1018' : '#2a3542';
  // the school block: three storeys of classroom windows
  const f = box(0, 0, BACK, 2500, 540, 320, wall, side, top), a = f[0], b = f[1], c = f[2], e = f[3];
  const X = (u, v) => lerp(lerp(a[0], b[0], u), lerp(e[0], c[0], u), v), Y = (u, v) => lerp(lerp(a[1], b[1], u), lerp(e[1], c[1], u), v);
  for (const lit of [false, true]) {
    g.beginPath();
    for (let i = 0; i < 18; i++) for (let j = 0; j < 3; j++) if (LIT[i * 3 + j] === lit) {
      const u0 = (i + .18) / 18, u1 = (i + .82) / 18, v0 = (70 + j * 160) / 540, v1 = (170 + j * 160) / 540;
      g.moveTo(X(u0, v0), Y(u0, v0)); g.lineTo(X(u1, v0), Y(u1, v0)); g.lineTo(X(u1, v1), Y(u1, v1)); g.lineTo(X(u0, v1), Y(u0, v1)); g.closePath();
    }
    g.fillStyle = lit ? (boss ? `rgba(255,40,70,${.6 + .3 * Math.sin(T * 7)})` : '#c9e2ff') : (boss ? '#080205' : '#0a1119'); g.fill();
  }
  // entrance tower and its clock
  box(0, 0, BACK - 80, 380, 620, 80, boss ? '#220c14' : '#243040', side, top);
  const d0 = P(-70, 150, BACK - 80), d1 = P(70, 0, BACK - 80), ck = P(0, 520, BACK - 80), cr = 38 * ck[2];
  g.fillStyle = '#05070a'; g.fillRect(d0[0], d0[1], d1[0] - d0[0], d1[1] - d0[1]);
  g.fillStyle = boss ? '#ffb3bd' : '#e8ecdc'; g.beginPath(); g.arc(ck[0], ck[1], cr, 0, TAU); g.fill();
  g.strokeStyle = '#111'; g.lineWidth = 3 * ck[2]; g.beginPath();
  g.moveTo(ck[0], ck[1]); g.lineTo(ck[0], ck[1] - cr * .7); g.moveTo(ck[0], ck[1]); g.lineTo(ck[0] + cr * .5, ck[1] + cr * .2); g.stroke();
  // chain fence down both sides
  for (const s of [-1, 1]) {
    const x = s * STAGE, zn = E.ZNEAR;
    quad(P(x, 0, zn), P(x, 0, BACK), P(x, 280, BACK), P(x, 280, zn)); g.fillStyle = boss ? 'rgba(40,4,12,.75)' : 'rgba(14,20,28,.75)'; g.fill();
    g.beginPath();
    for (let z = 360; z < BACK; z += 110) line(P(x, 0, z), P(x, 280, z));
    line(P(x, 280, zn), P(x, 280, BACK)); line(P(x, 140, zn), P(x, 140, BACK));
    g.strokeStyle = boss ? '#6b1524' : '#4a5868'; g.lineWidth = 2.5; g.stroke();
  }
  // trees and yard lamps
  for (const x of [-800, 800]) {
    box(x, 0, ZP + 330, 34, 170, 34, '#1a1410', '#100c09');
    const t = P(x, 250, ZP + 345), k = t[2];
    g.fillStyle = boss ? '#1c060b' : '#0f1f1a';
    for (const o of [[0, 0, 120], [-70, 30, 84], [72, 26, 90], [10, -60, 80]]) { g.beginPath(); g.arc(t[0] + o[0] * k, t[1] + o[1] * k, o[2] * k, 0, TAU); g.fill(); }
  }
  for (const x of [-430, 430]) {
    box(x, 0, ZP + 250, 14, 360, 14, '#2b2f36', '#1a1d22');
    const l = P(x, 368, ZP + 250);
    g.globalCompositeOperation = 'lighter'; glow(boss ? GLOW.red : GLOW.blue, l[0], l[1], 300 * l[2], .8); g.globalCompositeOperation = 'source-over';
  }
  // the curtain
  veilH = lerp(veilH, veilX === null ? 0 : 900, .06);
  if (veilH > 4) {
    const x = veilX === null ? back.lastX : (back.lastX = veilX), zn = E.ZNEAR, p0 = P(x, 0, zn), p1 = P(x, 0, BACK + 320), p2 = P(x, veilH, BACK + 320), p3 = P(x, veilH, zn);
    quad(p0, p1, p2, p3); g.fillStyle = 'rgba(6,0,3,.93)'; g.fill();
    g.beginPath();
    for (let z = zn; z < BACK + 320; z += 46) { const h = veilH * (.55 + .45 * Math.sin(z * .05 + T * 3)); line(P(x, 0, z), P(x, h, z)); }
    g.strokeStyle = 'rgba(255,36,64,.35)'; g.lineWidth = 2; g.stroke();
  }
}

function front() {
  for (const [x, w] of [[-760, 190], [-120, 120], [540, 170]]) box(x, 0, ZP - 190, w, 34, 50, '#0a0d10', '#06080a', boss ? '#2a0a12' : '#18222a');
}

// fight right where you are standing in Tokyo: draw the block shifted so the brawl sits at x0
function street(x0) {
  const sh = fn => () => { cam.x += x0; fn(); cam.x -= x0; };
  return { sky: sh(W.sky), floor: sh(W.ground), back: sh(() => { W.alley(); W.buildings(); for (const p of W.props) p.draw(); }), front: sh(W.front) };
}

JU.stages = {
  school: { sky, floor, back, front }, street,
  setBoss(v) { boss = v; }, setVeil(x) { veilX = x; }, clear() { boss = false; veilX = null; veilH = 0; }
};
})();
