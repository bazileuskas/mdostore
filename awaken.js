/* JUJUTSU UNLIMITEDS — Awakened cursed techniques. The Cursed Technique screen has a second menu behind the AWAKEN CT button, with four of them.
   Awakened Projection is built: Naoya as the cursed spirit he came back as. The other three are announced and not built yet.
   It is earned: three Projection Frame v2, which the Maki boss drops 5% of the time. NEED is the switch for that, on since the public release.
   The team's account (account.js) has every one of them regardless */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, keys = E.keys;
const { rnd, lerp, clamp, ZP } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk, GOLD = '#ffd23d', PINK = '#d24fb4';
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const NEED = true, FRAMES = 3, DROP = .05;          // are the frames required; how many; the Maki boss's chance of dropping one
const dev = () => !!(JU.account && JU.account.dev);
const TS_KILLS = 100, TS_BOSS = 10;                 // Awakened Ten Shadows: a hundred curses exorcised with Ten Shadows, ten of them bosses (the user's rule, the Map Update)
const S = { frames: 0, tsKills: 0, tsBoss: 0, gojo: 0 };      // Projection Frames; curses and bosses exorcised with Ten Shadows; whether Gojo, as he was at school, has awakened his Limitless
try { Object.assign(S, JSON.parse(localStorage.getItem('ju.awk') || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem('ju.awk', JSON.stringify(S)); } catch (e) {} };

/* ---------- how he looks now: a shell the colour of raw meat split over something darker, and a skull looking out from under the hood of it ---------- */
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.min(255, (n >> 16) * f) | 0},${Math.min(255, (n >> 8 & 255) * f) | 0},${Math.min(255, (n & 255) * f) | 0})`; };
function poly(fill, pts) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
}
const seg = (...p) => { g.beginPath(); for (let i = 0; i < p.length; i += 4) { g.moveTo(p[i], p[i + 1]); g.lineTo(p[i + 2], p[i + 3]); } g.stroke(); };
const MAG = ['#b0348f', '#d24fb4'], TIP = ['#7a2468', '#93307c'], DEEP = '#23092e';
const SPIRIT = {
  torso: MAG,
  armF: [MAG[0], MAG[1], TIP[0], TIP[1], .24], armB: [shade(MAG[0], .62), shade(MAG[1], .62), shade(TIP[0], .7), shade(TIP[1], .7), .24],
  legF: [MAG[0], MAG[1], TIP[0], TIP[1], .2], legB: [shade(MAG[0], .62), shade(MAG[1], .62), shade(TIP[0], .7), shade(TIP[1], .7), .2],
  chest() {                                         // the split down the front, and the seams between the plates
    g.fillStyle = DEEP; g.beginPath(); g.moveTo(3, -TOR); g.lineTo(19, -TOR); g.lineTo(15, 5); g.lineTo(7, 5); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(35,9,46,.6)'; g.lineWidth = 2; seg(-30, -54, 3, -46, 19, -46, 30, -54, -30, -26, 5, -20, 17, -20, 30, -26, -14, -TOR, -18, 5);
  },
  back() { poly(MAG[1], [-22, -TOR - 6, -42, -TOR + 2, -46, -TOR + 28, -30, -TOR + 38, -24, -TOR + 12]); },      // the swell of the shoulder plate
  head() {
    poly(MAG[1], [-9, -56, -9, -80, 13, -80, 13, -56]);                                                           // the crest, and the two studs on it
    g.fillStyle = MAG[0]; g.fillRect(-6, -87, 5, 8); g.fillRect(5, -87, 5, 8); g.strokeRect(-6, -87, 5, 8); g.strokeRect(5, -87, 5, 8);
    poly(MAG[0], [-28, 26, -34, -14, -24, -42, 2, -60, 24, -44, 33, -16, 30, 26, 22, 30, -20, 30]);                // the hood
    g.fillStyle = DEEP; g.beginPath(); g.moveTo(-14, 26); g.lineTo(-18, -12); g.lineTo(-8, -34); g.lineTo(6, -42); g.lineTo(20, -34); g.lineTo(27, -12); g.lineTo(25, 26); g.closePath(); g.fill();
    const gr = g.createLinearGradient(-12, 0, 24, 0);                                                              // and the skull inside it
    gr.addColorStop(.2, '#8a2a72'); gr.addColorStop(.8, '#c247a4');
    g.beginPath(); g.moveTo(-8, -26); g.quadraticCurveTo(8, -36, 22, -24); g.lineTo(24, 0); g.lineTo(19, 10); g.lineTo(18, 24); g.lineTo(0, 24); g.lineTo(-2, 10); g.lineTo(-9, 0); g.closePath();
    g.fillStyle = gr; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
    g.fillStyle = '#0c0312'; g.beginPath(); g.ellipse(2, -8, 6.5, 7.5, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(16, -8, 5.5, 7.5, 0, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(3, -8, 2.1, 0, TAU); g.fill(); g.beginPath(); g.arc(17, -8, 1.9, 0, TAU); g.fill();
    g.fillStyle = '#0c0312'; g.beginPath(); g.moveTo(9, 0); g.lineTo(12, 7); g.lineTo(6, 7); g.closePath(); g.fill();
    g.strokeStyle = '#0c0312'; g.lineWidth = 1.6; seg(1, 14, 17, 14, 4, 11, 4, 22, 8, 11, 8, 23, 12, 11, 12, 23, 16, 11, 16, 22);
  }
};

/* ---------- frozen in a frame: a fight has one opponent, so one timer ---------- */
let iceT = 0, immune = 0, top = 0, lap = null, cycle = null;   // seconds the opponent stays frozen; before it can be frozen again; of top speed left; the run; Frame Breaker's count
function freeze(o, face, t) {
  if (o.ko) return;
  E.applyHit(o, face, { dmg: 3, kb: 0, stun: t, stop: .04, col: GOLD });
  Object.assign(o, { state: 'hurt', stun: t, act: null, vx: 0, tele: 0 });          // even the ones too heavy to stagger hold still for this
  iceT = t; immune = t + 1.6; sfx.charge();
}
// one frame, stood round whatever it has caught. It used to be drawn as film; this is what the technique really makes: a pane like a sheet of glass,
// with its target pressed flat inside it. n: how many times it has been cracked. tag: the number in its corner
function frame(c, k, a, n, tag) {
  if (a <= 0) return;
  const w = 152 * k, h = 300 * k, x = c[0] - w / 2, y = c[1] - 290 * k, r = 12 * k, gr = g.createLinearGradient(x, y, x + w, y + h);
  g.save(); g.globalAlpha = Math.min(1, a);
  gr.addColorStop(0, 'rgba(235,245,255,.36)'); gr.addColorStop(.5, 'rgba(170,205,245,.15)'); gr.addColorStop(1, 'rgba(235,245,255,.32)');
  g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = gr; g.fill();
  g.lineWidth = 3.5 * k + 1; g.strokeStyle = 'rgba(255,255,255,.95)'; g.stroke();
  g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,220,130,.85)'; g.beginPath(); g.roundRect(x + 6 * k, y + 6 * k, w - 12 * k, h - 12 * k, r * .6); g.stroke();   // the gold of his technique, just inside the edge
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, r); g.clip();                                  // light lying across the face of it
  g.fillStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.moveTo(x + w * .08, y + h); g.lineTo(x + w * .5, y); g.lineTo(x + w * .68, y); g.lineTo(x + w * .26, y + h); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.11)'; g.beginPath(); g.moveTo(x + w * .6, y + h); g.lineTo(x + w * .92, y); g.lineTo(x + w * 1.04, y); g.lineTo(x + w * .72, y + h); g.closePath(); g.fill();
  g.restore();
  if (tag) { g.font = `${Math.max(9, Math.round(22 * k))}px Anton, Impact, sans-serif`; g.textAlign = 'right'; g.textBaseline = 'top'; g.fillStyle = 'rgba(255,255,255,.9)'; g.fillText(tag, x + w - 10 * k, y + 9 * k); }
  if (n) {                                          // and the cracks: one more star of them each time it is hit
    g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 2; g.lineJoin = 'miter'; g.beginPath();
    for (let j = 0; j < n; j++) {
      const cx = c[0] + ((j * 61) % 90 - 45) * k, cy = c[1] - (64 + (j * 97) % 180) * k;
      for (let i = 0; i < 6; i++) { const an = i * 1.05 + j * 1.7, L = (28 + (i * 37 + j * 11) % 44) * k * (1 + j * .14); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(an) * L * .5 + 5 * k, cy + Math.sin(an) * L * .5); g.lineTo(cx + Math.cos(an + .3) * L, cy + Math.sin(an + .3) * L); }
    }
    g.stroke();
  }
  g.restore();
}
// bits of a pane coming away, each with some weight to it
function shards(x, y, n, pow) {
  const bits = Array.from({ length: n }, () => { const a = rnd(0, TAU), v = rnd(.3, 1) * pow; return { x: x + rnd(-56, 56), y: y + rnd(-120, 120), vx: Math.cos(a) * v, vy: Math.sin(a) * v + pow * .4, r: rnd(0, TAU), vr: rnd(-12, 12), s: rnd(9, 30), q: [rnd(.4, 1), rnd(.4, 1), rnd(.5, 1)] }; });
  V.custom(1.15, (u, dt) => {
    for (const b of bits) {
      b.vy -= 2300 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.r += b.vr * dt;
      if (b.y < 5) { b.y = 5; b.vy *= -.3; b.vx *= .5; b.vr *= .4; }
      const c = F(b.x, b.y), z = b.s * c[2];
      g.save(); g.translate(c[0], c[1]); g.rotate(b.r); g.globalAlpha = Math.min(1, (1 - u) * 2.4);
      g.beginPath(); g.moveTo(-z * b.q[0], z * .5); g.lineTo(z * b.q[1], z * .3); g.lineTo(-z * .1, -z * b.q[2]); g.closePath();
      g.fillStyle = 'rgba(214,234,255,.5)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 1.5; g.stroke();
      g.restore();
    }
    g.globalAlpha = 1;
  });
}
// a stroke of ink laid along the line he is moving on: the way his speed is drawn
function ink(x0, x1, y, w, a, col) {
  if (a <= 0) return;
  const A = F(x0, y), Z = F(x1, y), k = A[2], mx = (A[0] + Z[0]) / 2;
  g.globalAlpha = Math.min(1, a); g.fillStyle = col || '#0a0810';
  g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo(mx, A[1] - w * k, Z[0], Z[1]); g.quadraticCurveTo(mx, A[1] + w * k * .55, A[0], A[1]); g.fill();
  g.globalAlpha = 1;
}
// the disc of cloud that stands round something going through the sound barrier. u: how far it has opened
function cone(x, y, f, u, size) {
  if (u <= 0 || u >= 1) return;
  const c = F(x + f * 70 * u, y), k = c[2], r = size * (.22 + .78 * (1 - (1 - u) * (1 - u))) * k;
  g.save();
  g.globalAlpha = (1 - u) * .22; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(c[0], c[1], r * .3, r, 0, 0, TAU); g.fill();
  g.globalAlpha = (1 - u) * .95; g.strokeStyle = '#fff'; g.lineWidth = (12 * (1 - u) + 2) * k; g.beginPath(); g.ellipse(c[0], c[1], r * .3, r, 0, 0, TAU); g.stroke();
  g.strokeStyle = '#0a0810'; g.lineWidth = 2; g.beginPath(); g.ellipse(c[0] - f * 8 * k, c[1], r * .3, r * 1.02, 0, 0, TAU); g.stroke();
  g.restore();
}
// where it lands: a white disc, and ink thrown out of it in every direction
function splat(x, y) {
  const rays = Array.from({ length: 14 }, (_, i) => [i / 14 * TAU + rnd(-.15, .15), rnd(140, 330), rnd(8, 22)]);
  V.custom(.34, u => {
    const c = F(x, y), k = c[2], e = 1 - (1 - u) * (1 - u), a = 1 - u;
    g.globalAlpha = a * .8; g.fillStyle = '#fff'; g.beginPath(); g.arc(c[0], c[1], 150 * e * k, 0, TAU); g.fill();
    g.globalAlpha = a; g.fillStyle = '#0a0810';
    for (const r of rays) {
      const r0 = 60 * e * k, r1 = r[1] * e * k, w = r[2] * (1 - u) * k, cs = Math.cos(r[0]), sn = Math.sin(r[0]);
      g.beginPath(); g.moveTo(c[0] + cs * r0 - sn * w, c[1] + sn * r0 + cs * w); g.lineTo(c[0] + cs * r1, c[1] + sn * r1); g.lineTo(c[0] + cs * r0 + sn * w, c[1] + sn * r0 - cs * w); g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
  });
}
// one frame of him, standing somewhere he is not any more
function echo(skin, sc, x, y, face, pose, a, tag) {
  if (a <= 0) return;
  const c = F(x, y);
  frame(c, c[2] * (sc || 1), a * .8, 0, tag);
  E.drawFighter({ skin, x, y, face, spin: 1, scale: sc, pose }, a * .6);
}

/* ---------- Top Speed: twenty-four laps round whoever he is fighting, each one quicker than the last ---------- */
const LAPS = 24, lapTime = k => Math.max(.05, .3 * Math.pow(.86, k));
const TOTAL = Array.from({ length: LAPS }, (_, k) => lapTime(k)).reduce((a, b) => a + b, 0), FAST = 9;
function lapAt(t) { let k = 0; while (k < LAPS && t >= lapTime(k)) { t -= lapTime(k); k++; } return k >= LAPS ? [LAPS - 1, 1] : [k, t / lapTime(k)]; }
// where on the oval that puts him: across the front going right, round the back going left
function spot(r, cx, rx, z0, rz) {
  const at = lapAt(r.t), th = Math.PI + (at[0] + at[1]) * TAU;
  return { x: cx + Math.cos(th) * rx, z: z0 + Math.sin(th) * rz, face: Math.sin(th) < 0 ? 1 : -1, back: Math.sin(th) > 0, n: at[0] + 1 };
}
function runner(skin, s, y, a) { E.drawFighter({ skin, x: s.x, y, z: s.z, face: s.face, spin: 1, scale: 1, pose: POSE.dash }, a); }
function count(c, n) {
  g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.font = `${Math.round(110 * c[2])}px Anton, Impact, sans-serif`; g.lineWidth = 10 * c[2]; g.strokeStyle = '#07060c'; g.strokeText(n, c[0], c[1]); g.fillStyle = GOLD; g.fillText(n, c[0], c[1]);
  g.font = `${Math.round(34 * c[2])}px Anton, Impact, sans-serif`; g.lineWidth = 6 * c[2]; g.strokeText('/ 24', c[0] + 96 * c[2], c[1] + 26 * c[2]); g.fillStyle = '#fff'; g.fillText('/ 24', c[0] + 96 * c[2], c[1] + 26 * c[2]);
  g.restore();
}
function drawLap(behind) {                          // the fight's own run: the half of each lap behind the opponent is drawn before it, the rest after
  const r = lap, s = spot(r, r.cx, 860, ZP + 50, 200);
  if (behind) { r.trail.push(s); if (r.trail.length > 7) r.trail.shift(); }
  r.trail.forEach((q, i) => { if (q.back === behind) { const c = P(q.x, 0, q.z); frame(c, c[2], (i + 1) / 9, 0); runner(r.skin, q, 0, (i + 1) / 10); } });
  if (s.back === behind) runner(r.skin, s, 0, 1);
  if (!behind) count(F(r.cx, 385), s.n);
}

const MOVES = {
  // 1 — one target, shut in a frame. Four more frames of him arrive one after another to break it, and it gives a little further each time
  strikes: { name: 'Frame Breaker', cd: 7, dur: .5, glow: 'gold', run(p, m, t) {
    p.vx = t > .06 && t < .16 ? p.face * 800 : 0; p.rate = 46; p.target = t < .3 ? POSE.jab : POSE.idle;
    if (m.done || t < .08 || t > .24 || !E.tryHit(p, { reach: 230, dmg: 4, kb: 0, stun: 2.5, stop: .08, col: GOLD })) return;
    const o = E.P2, face = p.face, skin = p.skin, sc = p.scale, HITS = [POSE.cross, POSE.hook, POSE.kick, POSE.crush];
    m.done = 1; sfx.charge(); shout(p, '1/24', GOLD);
    Object.assign(o, { state: o.ko ? o.state : 'hurt', stun: 2.5, act: null, vx: 0 });
    cycle = { o, n: 0, t: 2.5 }; iceT = Math.max(iceT, 2.5);
    V.ring(o.x, o.y + 160, 230, '#ffffff', .25);
    for (let i = 1; i <= 4; i++) E.after(i * .5, () => {                              // stage by stage
      if (!cycle || cycle.o !== o || E.P2 !== o || o.ko) return;
      const side = i % 2 ? -1 : 1, hy = o.y + 160 * (o.scale || 1), gx = o.x + side * 170, last = i === 4;
      cycle.n = i; sfx.hit(last); sfx.whoosh();
      V.custom(.26, u => echo(skin, sc, gx - side * 46 * u, o.y, -side, HITS[i - 1], 1 - u, i * 6 + '/24'));       // a frame of him, there for an instant, hitting it
      V.slash(o.x + side * 40, hy + rnd(-40, 40), side > 0 ? Math.PI - .3 : .3, 300, '#ffffff', 12);
      shards(o.x, hy, last ? 36 : 10, last ? 950 : 520); V.ring(o.x, hy, 150 + i * 40, '#ffffff', .3);
      E.fx.push({ k: 2, x: o.x, y: o.y + 420, n: i + ' / 4', col: GOLD, t: 0, life: .5 });
      E.applyHit(o, face, last ? { dmg: 10, kb: 760, lift: 480, stop: .14, heavy: 1, col: GOLD } : { dmg: 5, kb: 0, stun: 2.5 - i * .5 + .2, stop: .05, col: GOLD });
      if (last) { cycle = null; iceT = 0; shake(26); V.impact(.12, o.x, hy); splat(o.x, hy); }
    });
  } },
  // 2 — the run itself. When it is over he is up to speed, and anything he so much as brushes stops dead for two seconds
  crush: { name: 'Top Speed', cd: 18, dur: TOTAL + .5, glow: 'gold', run(p, m, t) {
    const o = E.P2;
    p.vx = 0; p.target = t < TOTAL ? POSE.dash : POSE.idle;
    if (!m.c) {
      m.c = 1; lap = { cx: clamp(o.ko ? p.x : o.x, -420, 420), t: 0, trail: [], skin: p.skin, n: 0 };
      Fi.fight.paused = true; p.inv = Math.max(p.inv, TOTAL + 1); p.alpha = 0; E.root.classList.add('cine'); sfx.charge();
    }
    if (t < TOTAL) {
      const n = lapAt(t)[0];
      lap.t = t;
      if (n !== lap.n) { lap.n = n; if (n < 10 || n % 3 === 0) sfx.whoosh(); shake(4 + n * .5); }
      return;
    }
    if (m.e) return;
    m.e = 1; done(p);
    if (!o.ko && Math.abs(o.x - p.x) < 260) freeze(o, p.face, 2);
  } },
  // 3 — the air he pushes in front of him, let go of all at once: a wall of it, and three rings left standing where it went through
  div: { name: 'Sonic Boom', cd: 6, dur: .7, glow: 'gold', run(p, m, t) {
    p.vx = 0; p.rate = 40; p.target = t < .2 ? POSE.divWind : t < .46 ? POSE.div : POSE.idle;
    if (t < .2) { const w = E.hand(p, false); V.mote(w[0], w[1], 'white'); if (!m.c) { m.c = 1; sfx.charge(); } return; }
    if (m.s) return;
    m.s = 1; sfx.blast(); sfx.bf(); shake(22);
    const f = p.face, x0 = p.x + f * 90, y = p.y + 170, SPD = 2600, FAR = 900, o = E.P2;
    const L = Array.from({ length: 14 }, () => [rnd(-120, 140), rnd(140, 430), rnd(.4, 1), rnd(0, .25)]);      // the streaks behind it: height, length, weight, how far back each one starts
    V.custom(.56, u => {
      const t2 = u * .56, d = Math.min(FAR, t2 * SPD), x = x0 + f * d, a = t2 < .38 ? 1 : 1 - (t2 - .38) / .18, c = F(x, y), k = c[2];
      for (const q of [0, 250, 520]) if (d > q) cone(x0 + f * q, y, f, (d - q) / 760, 240);
      for (const q of L) { const x1 = x0 + f * Math.max(0, d - q[3] * 800); ink(x1 - f * q[1] * (.3 + d / FAR), x1, y + q[0], 10 * q[2], a * .85); ink(x1 - f * q[1] * .45, x1, y + q[0], 3 * q[2], a, '#fff'); }
      g.globalAlpha = Math.max(0, a); g.fillStyle = '#fff'; g.strokeStyle = '#0a0810'; g.lineWidth = 4; g.lineJoin = 'round';    // the front itself, bowed forward
      g.beginPath(); g.moveTo(c[0] - f * 34 * k, c[1] - 200 * k); g.quadraticCurveTo(c[0] + f * 120 * k, c[1], c[0] - f * 34 * k, c[1] + 160 * k); g.quadraticCurveTo(c[0] + f * 44 * k, c[1], c[0] - f * 34 * k, c[1] - 200 * k); g.fill(); g.stroke();
      g.globalAlpha = 1;
      if (d < FAR && Math.random() < .8) { E.addDust(x); V.rocks(x, 0, 1); }
    });
    V.crack(x0 + f * 40, 210);
    E.after(clamp((o.x - x0) * f, 0, FAR) / SPD, () => {                              // it lands when the front gets there, not before
      if (!E.tryHit(p, { reach: 990, dmg: 14, kb: 760, lift: 300, stop: .12, heavy: 1, col: '#ffffff' })) return;
      const q = E.P2; V.impact(.1, q.x, q.y + 150); splat(q.x, q.y + 160);
    });
  } },
  // 4 — three times the speed of sound. The frames line up at his back, he is gone, and the sound of it gets there after he does
  manji: { name: 'Mach 3', cd: 14, dur: 1.3, glow: 'gold', run(p, m, t) {
    p.vx = 0; p.rate = 34;
    if (t < .6) {
      const n = t < .2 ? 1 : t < .4 ? 2 : 3, f = p.face;
      p.target = POSE.dash;
      if (!m.c) {
        const skin = p.skin, sc = p.scale, x0 = p.x, y0 = p.y;
        m.c = 1; p.inv = Math.max(p.inv, .9); sfx.charge(); E.zoomIn(.6);
        V.custom(.6, u => {                         // the next second of him, drawn in advance: frame after frame of it stacking up behind him
          for (let i = 7; i >= 1; i--) echo(skin, sc, x0 - f * i * 38, y0, f, POSE.dash, clamp(u * 9 - i, 0, 1) * (1 - u * .3) * (.75 - i * .07), String(24 - i));
          const c = F(x0, y0 + 30);
          g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.gold, c[0], c[1], (260 + 420 * u) * c[2], .3 + .4 * u); g.globalCompositeOperation = 'source-over';
          for (let i = 0; i < 6; i++) { const q = (u * 3 + i * .37) % 1; ink(x0 - f * (760 - 620 * q), x0 - f * (560 - 620 * q), y0 + 60 + i * 44, 7, (1 - q) * .7 * u); }     // the air already being dragged in after him
        });
      }
      if (n !== m.n) {
        m.n = n; shout(p, 'MACH ' + n, n === 3 ? '#ffffff' : GOLD); sfx.whoosh(); shake(6 + n * 5); V.ring(p.x, p.y + 30, 120 + n * 80, GOLD, .25); E.addDust(p.x - f * 60);
        if (n === 3) { V.crack(p.x, 280); V.rocks(p.x, 0, 8); E.slow(.18); }
      }
      V.mote(p.x, p.y + 120, 'gold');
      return;
    }
    p.target = t < .95 ? POSE.div : POSE.idle;
    if (m.s) return;
    m.s = 1;
    const f = p.face, x0 = p.x, y = p.y, o = E.P2, skin = p.skin, sc = p.scale;
    const hit = E.tryHit(p, { reach: 1500, dmg: 28, kb: 600, lift: 380, stop: .2, heavy: 1, col: GOLD }), x1 = clamp(x0 + f * 1350, -950, 950);
    p.x = x1; sfx.bf(); sfx.blast(); shake(40); V.split(f > 0 ? .05 : -.05);
    V.custom(.75, u => { for (let i = 0; i <= 9; i++) echo(skin, sc, x0 + (x1 - x0) * i / 9, y, f, POSE.dash, 1 - u * 1.7 - (9 - i) * .05, String(i + 15)); });   // every frame he went through, still hanging where he was for it
    V.custom(.3, u => {                               // and the smear of him across the lot
      const a = 1 - u, th = 150 * (1 - u * .7);
      ink(x0, x1, y + 170, th, a * .9, '#b0348f'); ink(x0 + (x1 - x0) * .08, x1, y + 170, th * .55, a, GOLD); ink(x0 + (x1 - x0) * .2, x1, y + 170, th * .2, a, '#fff');
      for (let i = 0; i < 7; i++) ink(x0 + (x1 - x0) * i * .09, x1 - (x1 - x0) * i * .04, y + 40 + i * 48, 9, a * .8);
    });
    V.custom(.62, u => { for (const q of [.22, .5, .78]) cone(x0 + (x1 - x0) * q, y + 165, f, u * 1.5 - (q - .22) * .6, 340); });     // three of them: one for each time he broke it
    for (let i = 1; i < 8; i++) { const x = x0 + (x1 - x0) * i / 8; V.crack(x, 140 + (i % 3) * 50); V.rocks(x, 0, 4); E.addDust(x); }
    if (!hit) return;
    V.impact(.22, o.x, o.y + 150); splat(o.x, o.y + 160);
    E.after(.22, () => {                              // the sound, arriving late
      if (o.ko || o !== E.P2) return;
      sfx.blast(); shake(30); E.fx.push({ k: 2, x: o.x, y: o.y + 420, n: 'BOOM', col: '#ffffff', t: 0, life: .7 });
      for (let i = 0; i < 4; i++) V.ring(o.x, o.y + 150, 200 + i * 120, '#ffffff', .3 + i * .06);
      E.applyHit(o, f, { dmg: 12, kb: 900, lift: 420, stop: .14, heavy: 1, col: '#ffffff' });
    });
  } }
};
// the run is over: he is standing in front of it again, and fast
function done(p) {
  const cx = lap.cx;
  lap = null; top = FAST; Fi.fight.paused = false; E.root.classList.remove('cine');
  p.alpha = 1; p.x = clamp(cx - 150, -950, 950); p.face = 1;
  sfx.bf(); shake(30); E.banner('最高速', 'TOP SPEED', 'sm');
  for (let i = 0; i < 4; i++) V.ring(cx, 160, 240 + i * 120, '#ffffff', .3 + i * .06);
}

JU.tech.add('aproj', { name: 'Awakened Projection', jp: '投射呪法', mark: '蟲', who: 'Frame Runner, cursed spirit', odds: 0, col: PINK, glow: 'gold', moves: MOVES,
  awakened: true, skin: SPIRIT, as: ['Frame Runner', '投射'], dash: .45, dashFx: { t: .3, v: 1650, tint: 1 } });
const DEF = JU.tech.TECH.aproj, on = () => JU.tech.active === DEF;

const tick0 = H.tick, under0 = H.under, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart, ko0 = H.ko;
H.tick = dt => {
  tick0(dt);
  if (iceT > 0) iceT -= dt;
  if (immune > 0) immune -= dt;
  if (cycle && ((cycle.t -= dt) <= 0 || cycle.o !== E.P2)) cycle = null;
  if (lap && !(E.P1.move && E.P1.move.def === MOVES.crush)) { lap = null; Fi.fight.paused = false; E.P1.alpha = 1; E.root.classList.remove('cine'); }   // the run was cut short somehow: nothing is left hanging
  if (top <= 0 || !on()) return;
  const p = E.P1, o = E.P2, dir = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
  top -= dt;
  if (!p.move && !p.ps && !p.dead && !(p.dashT > 0) && dir) { p.x = clamp(p.x + dir * 480 * dt, -965, 965); if (Math.random() < dt * 40) V.puff('gold', p.x - dir * 40, p.y + rnd(40, 240), -dir * 300, 0, 26, .25); }
  if (immune <= 0 && !o.ko && o.state !== 'down' && !(o.alpha < 1) && Math.abs(o.x - p.x) < 100 && Math.abs(o.y - p.y) < 150) freeze(o, p.face, 2);   // a touch is enough
};
H.under = dt => { under0(dt); if (lap) drawLap(true); };
H.fx = dt => {
  fx0(dt);
  if (lap) drawLap(false);
  const o = E.P2;
  if (iceT > 0 && !o.ko) {
    const c = F(o.x, o.y), k = c[2] * (o.scale || 1), a = Math.min(1, iceT * 4);
    if (cycle) for (let i = 2; i >= 1; i--) frame([c[0] - i * 10 * k, c[1] - i * 8 * k], k, a * .35, 0);      // the frames stacked up behind this one
    frame(c, k, a, cycle ? cycle.n : 0, cycle ? cycle.n * 6 + 1 + '/24' : '1/24');
  }
  if (top > 0 && on()) {                              // how much of it is left, over his head
    const p = E.P1, c = F(p.x, p.y + 330), w = 90 * c[2];
    g.fillStyle = 'rgba(8,6,14,.7)'; g.fillRect(c[0] - w, c[1], w * 2, 7 * c[2]); g.fillStyle = GOLD; g.fillRect(c[0] - w, c[1], w * 2 * top / FAST, 7 * c[2]);
  }
};
const clear = () => { iceT = immune = top = 0; lap = cycle = null; };
H.reset = () => { reset0(); clear(); walk = null; fast = 0; E.root.classList.remove('cine'); };
H.fightStart = (cfg, wave) => { clear(); start0(cfg, wave); };
// what it will have to be earned with: the Maki boss gives up a Projection Frame v2 one time in twenty
H.ko = o => {
  const res = ko0(o), cfg = Fi.fight.cfg;
  if (cfg && !cfg.dummy && o.ai && JU.tech.active && JU.tech.active.id === 'ten') {      // exorcised with Ten Shadows: it counts toward awakening them
    const was = S.tsKills >= TS_KILLS && S.tsBoss >= TS_BOSS, boss = !!o.ai.d.kit;
    S.tsKills++; if (boss) S.tsBoss++; save();
    if (!was && S.tsKills >= TS_KILLS && S.tsBoss >= TS_BOSS) { sfx.bf(); E.fx.push({ k: 2, x: o.x, y: 470, n: 'AWAKENED TEN SHADOWS  ·  UNLOCKED', col: '#8f9bff', t: 0, life: 3 }); }
    else if (!was && (boss || S.tsKills % 10 === 0)) E.fx.push({ k: 2, x: o.x, y: 470, n: `TEN SHADOWS  ·  ${Math.min(S.tsKills, TS_KILLS)} / ${TS_KILLS}  ·  BOSSES ${Math.min(S.tsBoss, TS_BOSS)} / ${TS_BOSS}`, col: '#8f9bff', t: 0, life: 2 });
  }
  if (cfg && cfg.label === 'Heavenly Blade fight' && o.ai && o.ai.d === Fi.DEFS.maki && Math.random() < DROP) {
    S.frames++; save(); sfx.confirm();
    E.fx.push({ k: 2, x: o.x, y: 420, n: `PROJECTION FRAME V2  ·  ${Math.min(S.frames, FRAMES)} / ${FRAMES}`, col: GOLD, t: 0, life: 2.4 });
  }
  return res;
};

/* ---------- Top Speed out on the street (Free Exploration): hold R and press 2.
   There is nobody to circle out there, so it is a straight line: twenty-four strides down the street the way he is facing, each longer than the last ---------- */
let walk = null, fast = 0;                          // the run, and the seconds of speed after it
const brush = me => { for (const n of JU.street.npcs) if (!(n.frozen > 0) && Math.abs(n.x - me.x) < 90 && Math.abs(n.z - me.z) < 80) { n.frozen = 2; sfx.hover(); } };   // anybody he passes close to
function streetKey(a) {
  if (a !== 'crush' || !keys.has('r') || !on() || walk || fast > 0) return false;
  const me = JU.street.me, W = JU.street.world, dir = me.face || 1;
  let far = 0;                                      // how much clear pavement there is ahead of him
  while (far < 2400 && W.free(me.x + dir * (far + 40), me.z)) far += 40;
  walk = { x0: me.x, z: me.z, dir, far, t: 0, trail: [], skin: me.skin, n: 0 }; me.alpha = 0; sfx.charge();
  return true;
}
// called every step he takes out there. What it gives back multiplies how fast he walks: nothing while the run plays, a lot once it is over
function streetTick(dt) {
  const me = JU.street.me, W = JU.street.world;
  if (walk) {
    const n = lapAt(walk.t += dt)[0], u = Math.min(1, walk.t / TOTAL);
    if (n !== walk.n) { walk.n = n; if (n < 10 || n % 3 === 0) sfx.whoosh(); shake(3 + n * .3); }
    me.x = walk.x0 + walk.dir * walk.far * u * u; me.face = walk.dir;                 // he really does cover the ground
    cam.x = lerp(cam.x, clamp(me.x + walk.dir * 220, 700, W.LEN - 700), .3);           // and the camera has to keep up with him
    brush(me);
    if (walk.t < TOTAL) return 0;
    walk = null; fast = FAST + 3; me.alpha = 1; sfx.bf(); shake(20); E.banner('最高速', 'TOP SPEED', 'sm');
  }
  if (fast <= 0) return 1;
  fast -= dt; brush(me);
  return 2.6;
}
function streetDraw() {
  const st = JU.street, me = st.me;
  for (const f of st.npcs.concat(st.curses)) if (f.frozen > 0) { const c = P(f.x, f.ground0 || 0, f.z); frame(c, c[2] * (f.scale || 1), Math.min(1, f.frozen * 4), 0); }
  if (!walk) return;
  const s = { x: me.x, z: walk.z, face: walk.dir }, y = me.ground0 || 12;
  walk.trail.push(s); if (walk.trail.length > 9) walk.trail.shift();
  walk.trail.forEach((q, i) => { const c = P(q.x, y, q.z); frame(c, c[2], (i + 1) / 11, 0); runner(walk.skin, q, y, (i + 1) / 12); });
  runner(walk.skin, s, y, 1);
  count(P(me.x, 430, walk.z), walk.n + 1);
}

/* ---------- the AWAKEN CT menu ---------- */
const LIST = [
  { id: 'aproj', name: 'Awakened Projection', mark: '蟲', col: PINK, what: 'Frame Runner, as the cursed spirit he came back as. Frame Breaker, Top Speed, Sonic Boom, Mach 3.',
    later: () => `Needs 3 Projection Frame v2, dropped by the Heavenly Blade boss (5%). You have ${Math.min(S.frames, FRAMES)}.`, open: () => dev() || !NEED || S.frames >= FRAMES },
  { id: 'alimit', name: 'Awakened Limitless', mark: '蒼', col: '#38c8ff', what: 'Maximum: Blue, Reversal Red: MAX, 150% Hollow Purple, Unlimited Void. Two secret moves.',
    later: () => 'Needs Blindfolded Infinity, as he was at school. He is in Shibuya, by the statue of the dog, and he awakens it for whoever comes to him carrying Limitless.', open: () => dev() || !!S.gojo },
  { id: 'ats', name: 'Awakened Ten Shadows', mark: '影', col: '#8f9bff', what: 'Shiro, Rabbit Escape, Mahoraga, Max Elephant, and the domain Chimera Shadow Garden. Two meters: shikigami left, and cursed energy.',
    later: () => `Needs ${TS_KILLS} curses exorcised with Ten Shadows (you have ${Math.min(S.tsKills, TS_KILLS)}), ${TS_BOSS} of them bosses: Soul Shaper, Blood Brother, anything with a technique of its own (you have ${Math.min(S.tsBoss, TS_BOSS)}).`,
    note: 'Every exorcism adds one shikigami to call.', open: () => dev() || (S.tsKills >= TS_KILLS && S.tsBoss >= TS_BOSS) },
  { id: 'smark', name: 'King of Curses\'s Mark', mark: '印', col: '#ff2440' },
  { id: 'tced', name: 'True Cursed Energy Discharge', mark: '轟', col: '#7fe9ff' }      // tced.js fills this one in
];
function mount(body) {
  body.innerHTML = `<div class="awkhd"><button class="sback" id="awkback" aria-label="Back to the cursed techniques">‹ Cursed Techniques</button><b>Awakened CT</b><span lang="ja">覚醒術式</span></div>
    <div class="acards a${LIST.length}">${LIST.map(a => { const t = JU.tech.TECH[a.id]; return t && a.open
      ? `<button class="acard${JU.tech.equipped === a.id ? ' on' : ''}${a.open() ? '' : ' lock'}" data-awk="${a.id}" style="--c:${a.col}" aria-label="Equip ${a.name}"><b lang="ja">${a.mark}</b><h4>${a.name}</h4><p>${a.what}</p>
          <small>${dev() ? 'Unlocked · team account' : a.open() ? 'Unlocked' : 'Locked'}</small>
          <p>${a.open() ? a.note || '' : a.later()}</p></button>`
      : `<div class="acard soon" style="--c:${a.col}"><b lang="ja">${a.mark}</b><h4>${a.name}</h4><small>Coming soon</small></div>`; }).join('')}</div>
    <p class="fine">An awakened technique is equipped in place of your ordinary one. Pick a card on the Cursed Technique screen to go back.</p>`;
}
document.addEventListener('click', e => {
  const body = document.getElementById('pBody'), c = e.target.closest('[data-awk]');
  if (e.target.closest('#awkct')) { mount(body); sfx.confirm(); return; }
  if (e.target.closest('#awkback')) { JU.tech.mount(body); sfx.back(); return; }
  if (!c) return;
  const r = c.getBoundingClientRect();
  if (!LIST.find(a => a.id === c.dataset.awk).open()) { c.classList.remove('no'); void c.offsetWidth; c.classList.add('no'); sfx.back(); return; }
  JU.tech.equip(c.dataset.awk); mount(body); sfx.bf(); JU.flash(r.left + r.width / 2, r.top + r.height / 2);
});

JU.awakened = { LIST, SPIRIT, mount, streetKey, streetTick, streetDraw, get frames() { return S.frames; },
  grant(what) { if (what === 'gojo' && !S.gojo) { S.gojo = 1; save(); } }, get gojo() { return !!S.gojo; },
  get shadows() { return { kills: S.tsKills, boss: S.tsBoss, need: [TS_KILLS, TS_BOSS] }; } };
})();
