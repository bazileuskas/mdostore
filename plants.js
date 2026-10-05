/* JUJUTSU UNLIMITEDS — Disaster Plants, reworked (update 0.2v1). Drawn from how Hanami's technique looks in the anime:
   roots of pale bark, split with dark fissures and bristling with long thorns; cursed buds that are crimson, spotted and grinning;
   a flower field that is every kind of flower at once.
   Root Spikes is new from the ground up, and in the air it grows roots to stand on. Cursed Buds leave a bud on whatever they hit: it hits
   softer, and swings and walks slower. Flower Field takes the fight out of its target: it does not move at all for a few seconds */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, B = JU.boss, keys = E.keys;
const { rnd, clamp, ease, ZP } = E, TAU = Math.PI * 2, { orb, shout, dot, near } = JU.tech.tk, T = JU.tech.TECH.plants, PL = T.moves;
const GREEN = '#7ddc6a', PINK = '#ff9ec4', BARK = { hi: '#a89068', mid: '#806a4a', lo: '#5c4a34', crack: '#2a1f14', leaf: '#5fae4a' };
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const back = u => 1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2);       // arrives a little too far, and settles
const on = () => JU.tech.active === T, free = p => !p.move && !p.ps && !p.dead && !(p.dashT > 0);
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const disc = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };

/* ---------- a root: a horn of bark coming up out of the floor at (x, z), leaning as it grows ----------
   r: { x, z, h, lean, w, seed, blunt (how much of its width it keeps at the top), th: thorns [[how far up, which side, how long]], lf: leaves }
   up: how much of it is out of the ground, 0 to 1 and a little over */
function drawRoot(r, up, alpha = 1) {
  if (up <= .01 || alpha <= .01) return;
  const N = 9, C = [], L = [], R = [], blunt = r.blunt || 0, full = Math.min(1, up * 1.4);
  for (let i = 0; i <= N; i++) { const u = i / N; C.push(P(r.x + r.lean * Math.pow(u, 1.5) * up + Math.sin(u * 3.2 + r.seed) * r.w * .16 * u, r.h * up * u, r.z)); }
  for (let i = 0; i <= N; i++) {
    const u = i / N, c = C[i], a = C[Math.max(0, i - 1)], b = C[Math.min(N, i + 1)], tl = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, tx = (b[0] - a[0]) / tl, ty = (b[1] - a[1]) / tl;
    const half = r.w * .5 * (blunt + (1 - blunt) * Math.pow(1 - u, .8)) * c[2] * (.35 + .65 * full);
    L.push([c[0] - ty * half, c[1] + tx * half, tx, ty]); R.push([c[0] + ty * half, c[1] - tx * half]);
  }
  const strip = (A, f0, f1) => {                    // the band of it lying between two fractions of the way from the middle out to edge A
    g.beginPath();
    for (let i = 0; i <= N; i++) { const x = C[i][0] + (A[i][0] - C[i][0]) * f1, y = C[i][1] + (A[i][1] - C[i][1]) * f1; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    for (let i = N; i >= 0; i--) g.lineTo(C[i][0] + (A[i][0] - C[i][0]) * f0, C[i][1] + (A[i][1] - C[i][1]) * f0);
    g.closePath(); g.fill();
  };
  g.globalAlpha = alpha;
  const base = C[0], k0 = base[2];
  g.fillStyle = 'rgba(16,11,7,.7)'; g.beginPath(); g.ellipse(base[0], base[1], r.w * .95 * k0, r.w * .24 * k0, 0, 0, TAU); g.fill();   // the floor, broken open round it
  g.lineJoin = 'round';
  for (const t of r.th) {                           // thorns first, so the trunk overlaps where they leave it
    const i = Math.round(t[0] * N), e = t[1] > 0 ? L[i] : R[i], c = C[i], ol = Math.hypot(e[0] - c[0], e[1] - c[1]) || 1, ox = (e[0] - c[0]) / ol, oy = (e[1] - c[1]) / ol;
    const tx = L[i][2], ty = L[i][3], len = t[2] * c[2] * full, bw = (5 + t[2] * .09) * c[2];
    g.beginPath(); g.moveTo(e[0] - tx * bw - ox * 4, e[1] - ty * bw - oy * 4); g.lineTo(e[0] + (ox * .72 + tx * .7) * len, e[1] + (oy * .72 + ty * .7) * len); g.lineTo(e[0] + tx * bw - ox * 4, e[1] + ty * bw - oy * 4); g.closePath();
    g.fillStyle = t[1] > 0 ? BARK.lo : BARK.mid; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
  }
  g.beginPath();
  for (let i = 0; i <= N; i++) i ? g.lineTo(L[i][0], L[i][1]) : g.moveTo(L[i][0], L[i][1]);
  for (let i = N; i >= 0; i--) g.lineTo(R[i][0], R[i][1]);
  g.closePath(); g.fillStyle = BARK.mid; g.fill();
  g.fillStyle = BARK.lo; strip(L, .45, 1);          // the side away from the light
  g.fillStyle = BARK.hi; strip(R, .5, .92);         // and the side toward it
  g.beginPath();
  for (let i = 0; i <= N; i++) i ? g.lineTo(L[i][0], L[i][1]) : g.moveTo(L[i][0], L[i][1]);
  for (let i = N; i >= 0; i--) g.lineTo(R[i][0], R[i][1]);
  g.closePath(); g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();
  g.strokeStyle = BARK.crack; g.lineWidth = Math.max(1.2, 1.8 * k0); g.beginPath();                 // fissures running up the bark
  for (const j of [-.5, -.05, .38]) for (let i = 1; i < N - 1; i++) {
    const A = j < 0 ? R : L, f = Math.abs(j) + .1 * Math.sin(i * 1.7 + r.seed + j * 9), x = C[i][0] + (A[i][0] - C[i][0]) * f, y = C[i][1] + (A[i][1] - C[i][1]) * f;
    i === 1 || (i + (j > 0 ? 1 : 0)) % 4 === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
  }
  g.stroke();
  for (const l of r.lf) {                           // a leaf or two: it is alive, after all
    const i = Math.round(l[0] * N), e = l[1] > 0 ? L[i] : R[i], s = 13 * C[i][2] * full, d = l[1] > 0 ? 1 : -1;
    g.fillStyle = BARK.leaf; g.beginPath(); g.moveTo(e[0], e[1]); g.quadraticCurveTo(e[0] + d * s, e[1] - s * 1.3, e[0] + d * s * 2, e[1] - s * .5); g.quadraticCurveTo(e[0] + d * s, e[1] + s * .2, e[0], e[1]); g.fill();
  }
  g.globalAlpha = 1;
}
const mk = (x, z, h, lean, w, at, nth) => ({ x: clamp(x, -1040, 1040), z, h, lean, w, at, seed: rnd(0, 6),
  th: Array.from({ length: nth }, (_, i) => [.2 + .58 * (i + rnd(0, .8)) / nth, i % 2 ? 1 : -1, rnd(.5, 1) * w * .9]), lf: Math.random() < .55 ? [[rnd(.3, .7), Math.random() < .5 ? 1 : -1]] : [] });

/* ---------- Root Spikes: they come up one behind another, each bigger than the last, and the biggest of all under whatever he is fighting ---------- */
const WAVE = 2300, HOLD = 1, LIFE = 1.8;            // how fast the line of them runs; how long they stand; and the whole of it
const BUFF = 2.5;                                   // what the player's own are worth next to Hanami's (update 0.2v2): 12.5 and 22.5 where hers are 5 and 9
const DEPTH = [84, -64, 130, -96, 52, -40, 116, -78, 70];
function surge(p, m) {
  const f = p.face, x0 = p.x, o = near(p, 860), all = [], up = p === E.P1 ? BUFF : 1;
  for (let i = 0; i < 9; i++) { const d = 120 + i * 84 + rnd(-16, 16); all.push(mk(x0 + f * d, ZP + DEPTH[i] + rnd(-12, 12), 130 + i * 15 + rnd(0, 60), f * rnd(26, 84), 44 + i * 3.5 + rnd(0, 16), d / WAVE, 3)); }
  for (let i = 0; i < 8; i++) { const d = 90 + i * 96 + rnd(-30, 30); all.push(mk(x0 + f * d, ZP + rnd(-120, 150), rnd(50, 105), f * rnd(10, 46), rnd(18, 30), d / WAVE + rnd(0, .04), 1)); }
  if (o) {
    const tx = o.x, at = Math.abs(tx - x0) / WAVE;
    all.push(Object.assign(mk(tx - f * 14, ZP + 36, 410, f * 46, 126, at + .1, 7), { king: 1 }));
    // what was standing there is caught by the ones running past, and then lifted by the big one
    const there = () => Math.abs(E.P2.x - tx) < 200;
    E.after(at + .03, () => { if (there()) E.tryHit(p, { reach: 900, dmg: 5 * up, kb: 30, stun: .6, stop: .05, col: GREEN }); });
    E.after(at + .17, () => { if (there() && E.tryHit(p, { reach: 900, dmg: 9 * up, kb: 160, lift: 720, stun: .9, stop: .14, heavy: 1, col: GREEN })) V.impact(.12, E.P2.x, E.P2.y + 150); });
  }
  all.sort((a, b) => b.z - a.z);
  const layer = list => u => {
    const t = u * LIFE;
    for (const r of list) {
      const d = (t - r.at) / (r.king ? .14 : .1), end = (t - HOLD - r.at * .5) / .34;
      if (d <= 0) continue;
      if (!r.pop) {                                 // the moment it breaks the surface
        r.pop = 1; V.rocks(r.x, 0, r.king ? 14 : r.w > 36 ? 3 : 1);
        if (r.w > 36) { E.addDust(r.x); V.puff('green', r.x, 30, 0, 160, 46, .35); if (r.w > 56) sfx.gavel(1.4 + rnd(0, 1.2)); }
        if (r.king) { shake(26); V.crack(r.x, 340); sfx.blast(); }
      }
      drawRoot(r, d < 1 ? back(d) : end > 0 ? 1 - ease(Math.min(1, end)) : 1, end > 0 ? 1 - Math.min(1, end) * .7 : 1);
      if (r.king && d > 0 && end < 0) { const c = P(r.x, 20, r.z); lit(() => E.glow(E.GLOW.green, c[0], c[1], 300 * c[2], .35 + .1 * Math.sin(E.T * 9))); }
    }
  };
  V.custom(LIFE, layer(all.filter(r => r.z >= ZP)), 0, true);     // the ones behind the fight
  V.custom(LIFE, layer(all.filter(r => r.z < ZP)));              // and the ones in front of it
  V.crack(x0 + f * 110, 220);
}

/* ---------- in the air it is the same roots, grown to be stood on ---------- */
const plats = [], P_UP = .22, P_LIFE = 7, P_DOWN = .5, STEPS = [[0, 150], [230, 290], [460, 430]];
const topOf = pl => pl.top * (pl.t <= 0 ? 0 : pl.t < P_UP ? ease(pl.t / P_UP) : pl.t > pl.life - P_DOWN ? clamp((pl.life - pl.t) / P_DOWN, 0, 1) : 1);
const AIRROOT = { name: 'Root Spikes', dur: .5, glow: 'green', run(p, m, t) {
  p.rate = 40; p.target = t < .3 ? POSE.crush : POSE.fall;
  if (t < .16) { p.vy = Math.max(p.vy, 80); p.vx *= .8; }       // he hangs there a moment while they come up to meet him
  if (m.s) return;
  m.s = 1; sfx.blast(); shake(16); shout(p, '木の根', GREEN);
  const f = p.face;
  plats.length = 0;                                 // one set of steps at a time
  STEPS.forEach((s, i) => plats.push({ x: clamp(p.x + f * s[0], -900, 900), top: s[1], w: 104, t: -i * .07, life: P_LIFE, f, hit: false,
    roots: [[-38, 56, 0], [36, 62, 2.1], [0, 74, 4.2]].map(q => Object.assign(mk(0, 0, 0, 0, q[1], 0, 2), { dx: q[0], seed: q[2] + i, blunt: .62 })) }));
} };
function drawPlat(pl) {
  const top = topOf(pl), z = ZP + 34, a = pl.t > pl.life - P_DOWN ? clamp((pl.life - pl.t) / P_DOWN, 0, 1) * .7 + .3 : 1;
  if (top < 3) return;
  for (const r of pl.roots) { r.x = pl.x + r.dx; r.z = z + (r.dx ? 14 : 0); r.h = top - 4; r.lean = -r.dx * .75; drawRoot(r, 1, a); }
  const c = P(pl.x, top, z), k = c[2], rx = pl.w * 1.06 * k, ry = 24 * k;
  g.globalAlpha = a;
  g.lineJoin = 'round'; g.lineWidth = 2.5; g.strokeStyle = LINE;
  for (const s of [-1, 1]) for (const q of [[.92, 46, -.5], [.6, 30, -1.1]]) {     // thorns round the rim of it
    const bx = c[0] + s * rx * q[0], by = c[1] + 4 * k;
    g.beginPath(); g.moveTo(bx - s * 12 * k, by - 8 * k); g.lineTo(bx + s * Math.cos(q[2]) * q[1] * k, by + Math.sin(q[2]) * q[1] * k); g.lineTo(bx - s * 6 * k, by + 9 * k); g.closePath(); g.fillStyle = BARK.lo; g.fill(); g.stroke();
  }
  g.fillStyle = BARK.lo; g.beginPath(); g.ellipse(c[0], c[1] + 12 * k, rx, ry, 0, 0, TAU); g.fill(); g.lineWidth = 3; g.stroke();     // the thickness of it
  g.fillStyle = BARK.mid; g.beginPath(); g.ellipse(c[0], c[1] + 2 * k, rx, ry, 0, 0, TAU); g.fill(); g.stroke();                       // and the top, woven flat
  g.strokeStyle = BARK.crack; g.lineWidth = Math.max(1.2, 1.7 * k); g.beginPath();
  for (let i = -3; i <= 3; i++) { g.moveTo(c[0] + i * rx * .27 + rx * .2, c[1] + 2 * k); g.ellipse(c[0] + i * rx * .27, c[1] + 2 * k, rx * .2, ry * (1 - Math.abs(i) * .12), 0, 0, TAU); }
  g.stroke();
  g.strokeStyle = BARK.hi; g.lineWidth = 2.5 * k; g.beginPath(); g.ellipse(c[0], c[1] + 2 * k, rx * .9, ry * .82, 0, Math.PI * 1.1, Math.PI * 1.75); g.stroke();
  g.fillStyle = BARK.leaf; g.beginPath(); g.ellipse(c[0] + rx * .7, c[1] - 6 * k, 15 * k, 6 * k, -.6, 0, TAU); g.fill();
  g.globalAlpha = 1;
}

/* ---------- what the buds and the flowers do to whoever they are used on ---------- */
const MARK_T = 9, MARK_POW = .6, MARK_RATE = .65, DAZE_T = 4.5;       // an enemy with a bud on it: how long, and what is left of its hits and its speed; and how long the field holds it
const ME_T = 6, ME_POW = .7, ME_RATE = .75, ME_WALK = .6, ME_HELD = 3;  // the same, when Hanami does it to the player
let foeMark = null, foeDaze = null, meMark = 0, meRoot = null;
const CALM = [.02, 0, .16, -.1, .07, -.07, 0];
const isMe = f => f === E.P1;
const word = (f, text, col) => E.fx.push({ k: 2, x: f.x, y: f.y + 345 * (f.scale || 1), n: text, col, t: 0, life: 1.3 });
function mark(f) {
  if (isMe(f)) meMark = ME_T; else foeMark = { o: f, t: MARK_T };
  word(f, 'CURSED BUD  ·  WEAKER, SLOWER', '#ff6aa8'); sfx.charge(); V.ring(f.x, f.y + 190 * (f.scale || 1), 120, '#ff6aa8', .3);
}
function still(f) {
  if (isMe(f)) { meRoot = { t: ME_HELD, x: f.x }; if (f.dashT > 0) f.dashT = 0; return; }
  foeDaze = { o: f, t: DAZE_T };
  if (f.state === 'act') { f.state = 'idle'; f.act = null; f.tele = 0; }
  word(f, 'THE WILL TO FIGHT IS GONE', PINK);
}
function pop(f) { const y = f.y + 196 * (f.scale || 1); V.sparks(f.x, y, 'red', 8); V.ring(f.x, y, 90, '#ff6aa8', .25); }

// the bud itself, latched on: crimson, spotted and grinning, with its roots working their way in
function bud(f, gone) {
  const s = f.scale || 1, c = F(f.x + f.face * 6, f.y + 196 * s), k = c[2] * s * 1.5, grow = Math.min(1, gone * 3), beat = (1 + .08 * Math.sin(E.T * 9)) * grow;
  g.strokeStyle = '#6b4a2e'; g.lineWidth = 3 * k; g.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26 + .6, L = (40 + 14 * (i % 2)) * k * Math.min(1, gone * .8);
    g.beginPath(); g.moveTo(c[0], c[1]); g.quadraticCurveTo(c[0] + Math.cos(a) * L * .6 + Math.sin(a * 3) * 8 * k, c[1] + Math.sin(a) * L * .6, c[0] + Math.cos(a) * L, c[1] + Math.sin(a) * L * 1.2); g.stroke();
  }
  g.lineCap = 'butt';
  g.save(); g.translate(c[0], c[1]); g.scale(k * beat, k * beat);
  g.fillStyle = '#b08a58'; g.strokeStyle = LINE; g.lineWidth = 2; g.lineJoin = 'round';
  for (let i = 0; i < 5; i++) { const a = i * TAU / 5 - Math.PI / 2; g.beginPath(); g.moveTo(Math.cos(a - .5) * 11, Math.sin(a - .5) * 11); g.lineTo(Math.cos(a) * 30, Math.sin(a) * 30); g.lineTo(Math.cos(a + .5) * 11, Math.sin(a + .5) * 11); g.closePath(); g.fill(); g.stroke(); }
  g.fillStyle = '#9c1830'; g.beginPath(); g.arc(0, 0, 16, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = '#ff6aa8'; for (const q of [[-9, -8], [0, -11], [9, -8], [-12, 1], [12, 1], [-7, 10], [7, 10], [0, 12]]) disc(q[0], q[1], 2.3);
  g.fillStyle = '#16070c'; g.beginPath(); g.ellipse(0, 1, 9.5, 5, 0, 0, TAU); g.fill();
  g.fillStyle = '#f4f1e6'; g.beginPath(); for (let i = 0; i < 5; i++) { const x = -9 + i * 3.7; g.moveTo(x, -2.6); g.lineTo(x + 1.8, 2.2); g.lineTo(x + 3.6, -2.6); } g.fill();
  g.restore();
}

/* ---------- Flower Field: every kind of flower there is, all at once ---------- */
function flower(kind, x, y, r, tilt, seed) {
  g.save(); g.translate(x, y); g.rotate(tilt); g.scale(1, .82);
  if (kind === 0) {                                 // five broad red petals round a yellow heart
    g.fillStyle = '#e0263a'; for (let i = 0; i < 5; i++) { const a = i * TAU / 5 + seed; g.beginPath(); g.ellipse(Math.cos(a) * r * .5, Math.sin(a) * r * .5, r * .58, r * .42, a, 0, TAU); g.fill(); }
    g.fillStyle = '#9c1226'; disc(0, 0, r * .3); g.fillStyle = '#ffd23d'; disc(0, 0, r * .17);
  } else if (kind === 1) {                          // a white lily: six points
    g.fillStyle = '#f7f4ea'; g.strokeStyle = 'rgba(150,140,120,.6)'; g.lineWidth = 1;
    for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + seed, c = Math.cos(a), s = Math.sin(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a - .4) * r * .7, Math.sin(a - .4) * r * .7, c * r * 1.12, s * r * 1.12); g.quadraticCurveTo(Math.cos(a + .4) * r * .7, Math.sin(a + .4) * r * .7, 0, 0); g.fill(); g.stroke(); }
    g.fillStyle = '#ffd23d'; disc(0, 0, r * .15);
  } else if (kind === 2) {                          // a daisy, orange or yellow
    g.fillStyle = seed > 3 ? '#ff9a2e' : '#ffd23d'; for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + seed; g.beginPath(); g.ellipse(Math.cos(a) * r * .58, Math.sin(a) * r * .58, r * .44, r * .13, a, 0, TAU); g.fill(); }
    g.fillStyle = '#7a4a1e'; disc(0, 0, r * .27);
  } else if (kind === 3) {                          // a spider lily: thin red curls
    g.strokeStyle = '#ff2a3c'; g.lineWidth = Math.max(1.2, r * .09); g.lineCap = 'round';
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + seed; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a) * r * .9, Math.sin(a) * r * .9, Math.cos(a + .55) * r * 1.15, Math.sin(a + .55) * r * 1.15 - r * .2); g.stroke(); }
    g.lineCap = 'butt';
  } else if (kind === 4) {                          // violets, purple or blue
    g.fillStyle = seed > 3 ? '#8e6bff' : '#5aa2ff'; for (let i = 0; i < 5; i++) { const a = i * TAU / 5 + seed; disc(Math.cos(a) * r * .5, Math.sin(a) * r * .5, r * .42); }
    g.fillStyle = '#f7f4ea'; disc(0, 0, r * .24); g.fillStyle = '#ffd23d'; disc(0, 0, r * .12);
  } else {                                          // and a rose
    g.fillStyle = '#ff7fb0'; disc(0, 0, r * .9); g.fillStyle = '#ff9ec4'; disc(r * .08, -r * .06, r * .62); g.fillStyle = '#ffc4dc'; disc(-r * .06, r * .04, r * .34);
    g.strokeStyle = 'rgba(190,40,100,.55)'; g.lineWidth = Math.max(1, r * .07); g.beginPath(); g.arc(0, 0, r * .62, .4, 3.6); g.moveTo(r * .34, 0); g.arc(0, 0, r * .34, 0, 2.6); g.stroke();
  }
  g.restore();
}
const FIELD = 5, PETAL = ['#ff9ec4', '#ffffff', '#c9a8ff', '#ffd23d', '#ff6a7a'];
function bloom(x0) {
  const one = (x, z, r, st) => ({ x, z, kind: Math.random() * 6 | 0, r, st, seed: rnd(0, 6), d: Math.abs(x - x0) / 2600 });
  const FL = Array.from({ length: 104 }, () => one(x0 + rnd(-900, 900), ZP + rnd(-150, 340), rnd(17, 36), rnd(26, 78)))
    .concat(Array.from({ length: 10 }, (_, i) => one(x0 - 900 + i * 200 + rnd(-60, 60), ZP + rnd(-235, -185), rnd(44, 66), rnd(20, 60))))   // and a row of great big ones right up against the glass
    .sort((a, b) => b.z - a.z);
  const PT = Array.from({ length: 34 }, () => ({ x: x0 + rnd(-920, 920), y: rnd(0, 440), sp: rnd(40, 110), ph: rnd(0, 6), col: PETAL[Math.random() * 5 | 0] }));
  const layer = (list, air) => u => {
    const t = u * FIELD, out = t > FIELD - .5 ? Math.max(0, (FIELD - t) / .5) : 1;
    if (!air) lit(() => { const c = P(x0, 60, ZP + 300); E.glow(E.GLOW.white, c[0], c[1], E.VW * .9, .1 * out * Math.min(1, t * 3)); E.glow(E.GLOW.gold, c[0], c[1], E.VW * .6, .09 * out * Math.min(1, t * 3)); });
    for (const f of list) {
      const pop = (t - f.d) / .2;
      if (pop <= 0) continue;
      const s = (pop < 1 ? back(pop) : 1) * out, sway = Math.sin(E.T * 2 + f.seed) * .12, a = P(f.x, 0, f.z), b = P(f.x + sway * 30, f.st * s, f.z), k = a[2];
      g.strokeStyle = '#3f8a3a'; g.lineWidth = 2.6 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(a[0], (a[1] + b[1]) / 2, b[0], b[1]); g.stroke();
      g.fillStyle = '#4ea044'; g.beginPath(); g.ellipse(a[0] + 9 * k * s, (a[1] + b[1]) / 2, 10 * k * s, 4 * k * s, -.5, 0, TAU); g.fill();
      flower(f.kind, b[0], b[1], f.r * k * s, sway, f.seed);
    }
    if (air) for (const q of PT) {                  // petals loose on the air
      const y = (q.y + t * q.sp) % 460, c = F(q.x + Math.sin(t * 1.3 + q.ph) * 70, y), k = c[2];
      g.globalAlpha = Math.min(1, t * 2) * out * Math.min(1, (460 - y) / 80);
      g.fillStyle = q.col; g.beginPath(); g.ellipse(c[0], c[1], 8 * k, 3.6 * k, t * 3 + q.ph, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
  };
  V.custom(FIELD, layer(FL.filter(f => f.z >= ZP - 10), false), 0, true);
  V.custom(FIELD, layer(FL.filter(f => f.z < ZP - 10), true));
}

/* ---------- the three moves ---------- */
// 1 — he puts a hand to the floor and the floor answers
Object.assign(PL.strikes, { name: 'Root Spikes', cd: 6, dur: .85, glow: 'green', run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < .2 ? POSE.crushWind : t < .55 ? POSE.crush : POSE.idle;
  if (t < .2) { if (!m.c) { m.c = 1; sfx.charge(); } const w = E.hand(p, false); V.mote(w[0], w[1], 'green'); return; }
  if (m.s) return;
  m.s = 1; sfx.blast(); shake(16); surge(p, m);
} });
// 2 — the same seeds as ever. What is new is what they do once they are in: it hits softer, and swings and walks slower
Object.assign(PL.crush, { name: 'Cursed Buds', cd: 7, dur: .6, run(p, m, t) {
  p.vx = 0; p.rate = 34; p.target = t < .4 ? POSE.jab : POSE.idle;
  if (t < .15 || m.s) return;
  m.s = 1; sfx.whoosh();
  const o = near(p, 820), f = p.face, x0 = p.x + f * 70;
  V.custom(.22, u => { for (let i = 0; i < 3; i++) orb(x0 + f * 760 * u, p.y + 130 + i * 40 + Math.sin(u * 9 + i) * 14, 9, 'green', '#2e6b2a'); });
  if (!o || !E.tryHit(p, { reach: 820, dmg: 6, kb: 80, stun: .6, stop: .05, col: GREEN })) return;
  mark(o);
  dot(o, f, 4, .4, { dmg: 3, kb: 0, stun: .3, col: GREEN }, () => {   // the buds feed on its cursed energy, and he gets it
    p.hp = Math.min(p.max, p.hp + 4); V.puff('green', o.x, o.y + 150, (p.x - o.x) * 2.4, 0, 40, .4); V.ring(p.x, p.y + 150, 60, GREEN, .25);
  });
} });
// 3 — the whole floor comes up in flowers, and whatever he is fighting forgets why it came
Object.assign(PL.div, { name: 'Flower Field', cd: 15, dur: .9, run(p, m, t) {
  p.vx = 0; p.rate = 26; p.target = t < .6 ? POSE.manjiWind : POSE.idle;
  if (t < .3 || m.s) return;
  m.s = 1; sfx.charge(); shout(p, '花畑', PINK);
  bloom(p.x);
  const o = E.P2;
  if (!o.ko) still(o);
  for (let i = 1; i <= 5; i++) E.after(i * .7, () => { p.hp = Math.min(p.max, p.hp + 4); V.ring(p.x, p.y + 150, 70, PINK, .3); });
} });

// Hanami fights with the same three, turned round. Her field holds him where he stands instead of sealing his technique
B.kit('hanami', { tech: 'Disaster Plants', col: GREEN, glow: 'green', scale: .8, moves: [
  { of: PL.strikes, cd: 6, min: 120, max: 780, wind: .55, pre: 'crushWind' },
  { of: PL.crush, cd: 9, min: 260, max: 800, wind: .5, pre: 'hookWind' },
  { of: PL.div, cd: 18, below: .8, wind: .5, pre: 'manjiWind', at: .3, then(o, p) { B.say(p, 'HELD IN THE FLOWERS', PINK); } },
  { of: PL.manji, cd: 13, min: 320, wind: .4, pre: 'divWind' }
] });

/* ---------- wiring ---------- */
const pow0 = H.power, m1r0 = H.m1rate, nj0 = H.noJump, press0 = H.press, tick0 = H.tick, under0 = H.under, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
const floor0 = H.floor, rate0 = H.foeRate, pre0 = H.foePre, fpow0 = H.foePower;
H.foeRate = o => (rate0 ? rate0(o) : 1) * (foeMark && foeMark.o === o ? MARK_RATE : 1);
H.foePower = a => (fpow0 ? fpow0(a) : 1) * (foeMark && foeMark.o === E.P2 ? MARK_POW : 1);
H.foePre = (o, p, dt) => {
  if (pre0 && pre0(o, p, dt)) return true;
  if (!(foeDaze && foeDaze.o === o)) return false;
  o.vx *= Math.exp(-dt * 10); CALM[0] = .02 + .03 * Math.sin(E.T * 1.6); o.target = CALM; o.rate = 8;     // standing in the flowers, swaying a little
  return true;
};
H.power = (h, o) => (pow0 ? pow0(h, o) : 1) * (meMark > 0 && o === E.P2 && !h.fixed ? ME_POW : 1);
H.m1rate = () => (m1r0 ? m1r0() : 1) * (meMark > 0 ? ME_RATE : 1);
H.noJump = p => !!meRoot || (nj0 ? nj0(p) : false);
H.floor = p => {
  let best = floor0 ? floor0(p) : 0;
  for (const pl of plats) { const top = topOf(pl); if (top > best && top <= p.y + 2 && Math.abs(p.x - pl.x) <= pl.w) best = top; }
  return best;
};
H.press = (a, inScene) => {
  if (!inScene) {
    const p = E.P1;
    if (meRoot && a === 'dash') return true;        // held: there is no dashing out of it
    if (a === 'strikes' && on() && !p.ground && free(p) && E.cd.strikes <= 0) {       // Root Spikes in the air
      E.cd.strikes = E.CD.strikes; p.move = { def: AIRROOT, key: 'strikes', t: 0 }; E.hud.mv.strikes.classList.add('act');
      return true;
    }
  }
  return press0 ? press0(a, inScene) : false;
};
H.tick = dt => {
  tick0(dt);
  const p = E.P1, o = E.P2;
  if (foeMark && ((foeMark.t -= dt) <= 0 || foeMark.o !== o || o.ko)) { if (foeMark.o === o && !o.ko) pop(o); foeMark = null; }
  if (foeDaze && ((foeDaze.t -= dt) <= 0 || foeDaze.o !== o || o.ko)) foeDaze = null;
  if (meMark > 0) {
    const dir = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
    if (free(p) && p.ground && dir) p.x = clamp(p.x - dir * 360 * (1 - ME_WALK) * dt, -965, 965);     // that much of every step is taken back off him
    if ((meMark -= dt) <= 0 || p.dead) { meMark = 0; pop(p); }
  }
  if (meRoot) {
    if ((meRoot.t -= dt) <= 0 || p.dead) meRoot = null;
    else if (p.ps) meRoot.x = p.x;                  // knocked about, the flowers go with him
    else { p.x = meRoot.x; p.vx = 0; }
  }
  for (let i = plats.length - 1; i >= 0; i--) {
    const pl = plats[i], was = pl.t;
    pl.t += dt;
    if (was < .08 && pl.t >= .08) {                 // it breaks the surface: whatever is standing on that spot goes up with it
      V.rocks(pl.x, 0, 10); V.crack(pl.x, 240); E.addDust(pl.x); sfx.gavel(2 + i * .4);
      if (!o.ko && !(o.alpha < 1) && Math.abs(o.x - pl.x) < 130 && o.y < pl.top) E.applyHit(o, pl.f, { dmg: 8 * BUFF, kb: 120, lift: 640, stun: .8, stop: .1, heavy: 1, col: GREEN });
    }
    if (pl.t >= pl.life) plats.splice(i, 1);
  }
};
H.under = dt => { under0(dt); for (const pl of plats) drawPlat(pl); };
H.fx = dt => {
  fx0(dt);
  const p = E.P1, o = E.P2;
  if (foeMark && foeMark.o === o && !o.ko && !(o.alpha < .05)) bud(o, MARK_T - foeMark.t);
  if (meMark > 0 && !p.dead) bud(p, ME_T - meMark);
  if (foeDaze && foeDaze.o === o && !o.ko) {         // flowers going round its head
    const s = o.scale || 1;
    for (let i = 0; i < 3; i++) { const a = E.T * 2.2 + i * 2.094, c = F(o.x + Math.cos(a) * 52 * s, o.y + 300 * s + Math.sin(a * 2) * 6); flower(i * 2, c[0], c[1], 10 * c[2] * s * (.7 + .3 * Math.sin(a)), a, i * 2.2); }
  }
  if (meRoot) {                                     // and round his feet, holding them
    const a0 = Math.min(1, meRoot.t * 3);
    for (let i = 0; i < 6; i++) { const a = i * 1.047 + E.T * .6, q = P(p.x + Math.cos(a) * 58, 6 + 4 * Math.sin(E.T * 3 + i), ZP - 20 + Math.sin(a) * 34); flower(i, q[0], q[1], 13 * q[2] * a0, a, i * 1.1); }
    g.strokeStyle = '#3f8a3a'; g.lineWidth = 4; g.lineCap = 'round';
    for (const s of [-1, 1]) { const a = F(p.x + s * 30, 0), b = F(p.x + s * 12, 80 * a0); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(a[0] - s * 26 * a[2], (a[1] + b[1]) / 2, b[0], b[1]); g.stroke(); }
    g.lineCap = 'butt';
  }
};
const clear = () => { foeMark = foeDaze = meRoot = null; meMark = 0; plats.length = 0; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { foeMark = foeDaze = null; if (!wave) clear(); if (start0) start0(cfg, wave); };

JU.plants = { AIRROOT, drawRoot, flower, mark, still, plats, get state() { return { foeMark: foeMark && +foeMark.t.toFixed(2), foeDaze: foeDaze && +foeDaze.t.toFixed(2), meMark, meRoot: meRoot && +meRoot.t.toFixed(2), plats: plats.map(pl => [Math.round(pl.x), pl.top, +pl.t.toFixed(2)]) }; },
  dazed: o => !!foeDaze && foeDaze.o === o };
})();
