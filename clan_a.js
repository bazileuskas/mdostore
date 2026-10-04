/* JUJUTSU UNLIMITEDS — clan abilities I: Gojo (warp), Zenin (cursed tool + counter), Kenjaku (body takeover) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, K = JU.clan;
const { clamp, rnd } = E, TAU = Math.PI * 2;
const shout = (p, text, col) => E.fx.push({ k: 2, x: p.x, y: p.y + 390, n: text, col, t: 0, life: 1.1 });
const mouse = { x: 0, y: 0 };
let cd = 0, lastNow = 0;
E.root.addEventListener('pointermove', e => { mouse.x = e.clientX / E.S; mouse.y = e.clientY / E.S; });   // in view units

/* ================= Gojo: R breaks the screen like glass and puts him where the mouse is ================= */
const glass = [];
function shatter(x, y) {
  const lines = [];
  for (let i = 0; i < 11; i++) {
    const a = i / 11 * TAU + rnd(-.2, .2), pts = [];
    let r = 0;
    for (let j = 0; j < 5; j++) { r += rnd(40, 150); pts.push([Math.cos(a + rnd(-.25, .25)) * r, Math.sin(a + rnd(-.25, .25)) * r]); }
    lines.push(pts);
  }
  glass.push({ x, y, lines, t: 0, shards: Array.from({ length: 14 }, () => [rnd(0, TAU), rnd(60, 320), rnd(20, 72), rnd(-6, 6)]) });
}
function drawGlass() {
  const now = performance.now(), real = Math.min(.05, (now - lastNow) / 1000);
  lastNow = now;
  for (let i = glass.length - 1; i >= 0; i--) {
    const s = glass[i];
    s.t += real;
    if (s.t > .65) { glass.splice(i, 1); continue; }
    const u = s.t / .65, a = 1 - u, grow = Math.min(1, u * 5);
    g.save(); g.translate(s.x, s.y);
    g.strokeStyle = `rgba(235,248,255,${a})`; g.lineWidth = 2.5; g.lineJoin = 'miter'; g.beginPath();
    for (const pts of s.lines) { g.moveTo(0, 0); for (const q of pts) g.lineTo(q[0] * grow, q[1] * grow); }
    g.stroke();
    g.fillStyle = `rgba(200,235,255,${a * .5})`;
    for (const sh of s.shards) {                  // shards falling away from the break
      const d = sh[1] * (.3 + u * 1.4);
      g.save(); g.translate(Math.cos(sh[0]) * d, Math.sin(sh[0]) * d + u * u * 170); g.rotate(sh[3] * u);
      g.beginPath(); g.moveTo(-sh[2] * .5, sh[2] * .3); g.lineTo(sh[2] * .5, 0); g.lineTo(0, -sh[2] * .6); g.closePath(); g.fill();
      g.restore();
    }
    g.restore();
  }
}
K.ext('gojo', {
  r(p) {
    if (cd > 0) { shout(p, 'Not yet', '#8fb7c8'); return; }
    if (p.dead || p.ps === 'down') return;
    cd = 4;
    const a = F(p.x, p.y + 150), x = clamp(cam.x + mouse.x - E.VW / 2, -950, 950), y = clamp(E.GY - mouse.y - 130, 0, 330);
    shatter(a[0], a[1]);
    if (p.move) E.endMove(p);
    Object.assign(p, { x, y, vx: 0, vy: 0, ground: y <= 0, ps: null, inv: .35 });
    const b = F(x, y + 150);
    shatter(b[0], b[1]);
    cam.shake = Math.max(cam.shake, 14); sfx.hit(true); sfx.charge();
  },
  tick(dt) { if (cd > 0) cd -= dt; },
  post: drawGlass,
  begin() { cd = 0; glass.length = 0; }
});

/* ================= Zenin: a cursed tool in hand, and a counter ================= */
const GREEN = '#7ddc9a';
const COUNTER = { name: 'Counter', dur: .75, run(p, m, t) { p.vx = 0; p.rate = 30; p.target = t < .6 ? POSE.manjiWind : POSE.idle; } };
K.ext('zenin', {
  r(p) {
    if (cd > 0) { shout(p, 'Not yet', '#8fc8a8'); return; }
    if (!p.ground || p.move || p.ps || p.dead) return;
    cd = 5; p.move = { def: COUNTER, t: 0 };
    sfx.charge(); V.ring(p.x, p.y + 150, 120, GREEN, .5);
  },
  guard() {                                       // hit while the stance is up: turn it aside and answer for exactly 30
    const p = E.P1, o = E.P2;
    if (!(p.move && p.move.def === COUNTER && p.move.t < .6)) return false;
    E.endMove(p);
    p.face = o.x >= p.x ? 1 : -1;
    shout(p, 'COUNTER', GREEN); sfx.hit(true);
    for (let i = 0; i < 3; i++) V.slash(o.x, o.y + 110 + i * 45, p.face > 0 ? -.5 : Math.PI + .5, 300, GREEN, 12, i * .03);
    E.applyHit(o, p.face, { dmg: 30 / (o.dr || 1), kb: 760, lift: 440, stop: .2, heavy: 1, col: GREEN, fixed: 1 });
    return true;
  },
  aim(p, h) { return p.move && p.move.def.m1 ? Object.assign({}, h, { reach: h.reach + 50, col: GREEN }) : h; },   // the blade reaches further
  tick(dt) { if (cd > 0) cd -= dt; },
  fx() {                                          // the tool itself, held out along the arm
    const p = E.P1;
    if (p.alpha === 0 || p.ps === 'down' || p.ps === 'air') return;
    const h = E.hand(p, true), a = F(h[0], h[1]), c = F(p.x, p.y + 165), l = Math.hypot(a[0] - c[0], a[1] - c[1]) || 1;
    const dx = (a[0] - c[0]) / l, dy = (a[1] - c[1]) / l, k = a[2], L = 150 * k;
    g.lineCap = 'round';
    g.strokeStyle = '#07060c'; g.lineWidth = 11 * k; g.beginPath(); g.moveTo(a[0] - dx * 22 * k, a[1] - dy * 22 * k); g.lineTo(a[0] + dx * L, a[1] + dy * L); g.stroke();
    g.strokeStyle = '#cfd8e0'; g.lineWidth = 6 * k; g.beginPath(); g.moveTo(a[0] + dx * 10 * k, a[1] + dy * 10 * k); g.lineTo(a[0] + dx * L, a[1] + dy * L); g.stroke();
    g.strokeStyle = '#5a1420'; g.lineWidth = 8 * k; g.beginPath(); g.moveTo(a[0] - dx * 20 * k, a[1] - dy * 20 * k); g.lineTo(a[0] + dx * 8 * k, a[1] + dy * 8 * k); g.stroke();
    g.lineCap = 'butt';
  },
  begin() { cd = 0; }
});

/* ================= Kenjaku: R over a body takes it ================= */
const TECH_OF = { Mahito: 'trans', Hanami: 'plants', 'Ryomen Sukuna': 'shrine', Choso: 'blood' };   // which bodies carry a technique worth having
// what a body is worth: its health, and how hard and fast it hits compared with Yuji
function hostOf(o, extra) {
  const d = o.ai.d;
  return Object.assign({ skin: o.skin, scale: o.scale || 1, name: d.name, jp: d.jp, hp: d.hp, tech: TECH_OF[d.name],
    m1: clamp(d.atk[0].dmg / 6 - 1, 0, 1.5), ce: clamp(d.hp / 200 - .3, 0, 1), m1s: clamp(d.speed / 200 - 1, -.1, .5) }, extra);
}
function wear(p, host) {                          // put a host body on, in the middle of a fight
  K.st.host = host;
  p.skin = host.skin; p.scale = host.scale;
  p.max = Math.round(host.hp * (1 + (K.active.hp || 0))); p.hp = p.max;
  Fi.nm.p1.textContent = host.name; Fi.nm.p1j.textContent = host.jp;
  if (host.tech) JU.tech.apply(host.tech);
}
K.ext('kenjaku', {
  r(p) {
    const o = E.P2;
    if (p.dead || p.ps) return;
    if (!(o.ko && o.ai && (o.alpha === undefined || o.alpha > .12) && Math.abs(o.x - p.x) < 240)) { shout(p, 'No body in reach', '#b99ad6'); return; }
    wear(p, hostOf(o));
    p.x = o.x; o.alpha = 0;
    V.ring(p.x, p.y + 150, 280, '#c77dff', .5); V.sparks(p.x, p.y + 220, 'purple', 18);
    cam.shake = 16; sfx.bf(); E.banner('羂索', 'BODY TAKEN', 'sm');
  },
  tick() {
    const o = E.P2;
    if (!o.ko || !o.ai || o.alpha === 0) return;
    if (!o.offered) { o.offered = 1; E.fx.push({ k: 2, x: o.x, y: 130, n: 'R  ·  TAKE THE BODY', col: '#c77dff', t: 0, life: 2.2 }); }
    if (o.alpha < .6) o.alpha = .6;               // it stops dissolving while he decides
  },
  death() {                                       // dying puts him back in the body he started with
    if (K.st.host) { const had = K.st.host.tech; K.st.host = null; if (had) { JU.tech.revert(); JU.tech.apply(); } }
    return false;
  }
});

JU.clanKit = { shout, hostOf, wear };
})();
