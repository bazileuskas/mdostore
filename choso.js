/* JUJUTSU UNLIMITEDS — limited time: BLOOD BROTHER. Choso's Blood Manipulation, and the one technique that changes how the player looks.
   0.2v4: the edge of him is lit red; his plain strikes are blades and spikes of hardened blood; and Piercing Blood is held. His hands come
   together and stay together for as long as the key is down, up to three seconds: the longer, the harder. Let go inside two seconds and it
   is Piercing Blood. At two seconds he flashes red, and from then on what he lets go is all of it at once: the wave */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, M = E.MOVES, C = JU.cut;
const { rnd, clamp, lerp, ease, ZP } = E, TAU = Math.PI * 2, { orb, shout, dot, near } = JU.tech.tk;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };

const ENDS = Date.parse('2026-10-11T07:10:00Z');   // seven days from the day he arrived. Move this date to run the event again

/* ================= how he looks ================= */
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.min(255, (n >> 16) * f) | 0},${Math.min(255, (n >> 8 & 255) * f) | 0},${Math.min(255, (n & 255) * f) | 0})`; };
function poly(fill, pts) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
}
const ROBE = ['#d6ccbf', '#eee7dc'], PALE = ['#e3cdbd', '#f3e2d5'], LEGS = ['#cbc0b0', '#e3dacd'], BOOT = ['#2a2530', '#3a3442'], HAIR = '#17141c';
const CHOSO = {
  torso: ROBE,
  armF: [ROBE[0], ROBE[1], PALE[0], PALE[1], .2], armB: [shade(ROBE[0], .62), shade(ROBE[1], .62), shade(PALE[0], .78), shade(PALE[1], .78), .2],
  legF: [LEGS[0], LEGS[1], BOOT[0], BOOT[1], .18], legB: [shade(LEGS[0], .62), shade(LEGS[1], .62), shade(BOOT[0], .62), shade(BOOT[1], .62), .18],
  chest() {                                         // a dark sleeveless vest over the pale robe, tied with a sash
    g.fillStyle = '#3b2c4a'; g.fillRect(-30, -TOR, 42, TOR + 5);
    g.fillStyle = '#2a1f36'; g.beginPath(); g.moveTo(12, -TOR); g.lineTo(23, -TOR); g.lineTo(12, -TOR + 42); g.closePath(); g.fill();
    g.fillStyle = '#b89a6a'; g.fillRect(-30, -21, 60, 8);
  },
  head() {
    poly(HAIR, [-24, -24, -40, -50, -27, -45, -21, -62, -9, -28]);     // two tails tied high, standing straight up
    poly(HAIR, [5, -29, 11, -62, 20, -46, 33, -55, 22, -25]);
    E.headBase(PALE[0], PALE[1]);
    poly(HAIR, [-27, 4, -29, -22, -18, -31, 6, -33, 24, -25, 27, -10, 17, -15, 8, -9, -1, -15, -10, -9, -16, 4]);
    g.fillStyle = 'rgba(80,45,90,.5)'; g.fillRect(1, 2, 9, 3); g.fillRect(13, 2, 8, 3);       // he has not slept in a long time
    g.fillStyle = LINE;
    g.beginPath(); g.ellipse(5, -1, 3.2, 1.7, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(17, -1, 2.7, 1.7, 0, 0, TAU); g.fill();
    g.fillStyle = '#4a1820'; g.fillRect(-1, 6, 25, 4);                                          // the mark across his nose
    g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.moveTo(8, 16); g.lineTo(17, 16); g.stroke();
  }
};

/* ================= Blood Manipulation ================= */
const BLOOD = '#e0203c', DARK = '#7a0f24', WET = '#b3122c', RGB = '224,32,60';
let scaleT = 0;                                     // seconds of Flowing Red Scale left
const SCALE_T = 10, SCALE_POW = 1.5, SCALE_RATE = 1.4, SCALE_WALK = .25;      // how long it runs; what it does to his hits, to how fast his fists come, and to his feet (buffed in 0.2v2: it was 8 s, 1.3 and 1.3)
// Piercing Blood, held: the least it is held for whatever the key does; when it becomes the wave; when it goes whether he lets go or not
const HOLD_MIN = .35, HOLD_WAVE = 2, HOLD_MAX = 3;
const pierceDmg = c => 20 + 22 * c, waveDmg = c => 70 + 40 * (c - HOLD_WAVE);      // 28 for a tap, 33 at the old six tenths, 64 just short of two seconds; the wave 70 to 110
const CLASP = [.16, 0, 1.5, 1.62, .5, -.5, 0];      // both hands out in front of him, palm to palm
const holding = () => E.keys.has('4') || E.keys.has('hold:manji');      // the fourth key is down (or a finger is on its button)
let flashAt = -9, tide = null, pend = null;         // when he last flashed red; the wave while it is crossing the arena; the move while it is being held

// a beam of it between two places on the fighting plane: dark outside, red, and white where it is fastest
function bolt(x0, x1, y, w, a) {
  const p0 = F(x0, y), p1 = F(x1, y), k = p0[2], seg = (wd, col) => { g.strokeStyle = col; g.lineWidth = wd * k; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke(); };
  g.lineCap = 'round';
  lit(() => seg(w * 2.4, `rgba(${RGB},${.3 * a})`));
  g.globalAlpha = a; seg(w, '#3d0612'); seg(w * .7, BLOOD); seg(w * .26, '#ffe3e6'); g.globalAlpha = 1;
  g.lineCap = 'butt';
}
// let go inside two seconds: a needle of it the length of the arena, rings of pressure where it left his hands, and the floor marked under it
function pierce(p, m, dmg) {
  const f = p.face, w = E.hand(p, true), x0 = w[0] + f * 26, y = w[1] + 4, k = clamp((m.pow - HOLD_MIN) / (HOLD_WAVE - HOLD_MIN), 0, 1);     // k: how much of a full one this is
  sfx.pierce(k); shake(16 + 12 * k); E.zoomIn(.3 + .2 * k);
  V.custom(.34 + .1 * k, u => {
    const a = (1 - u) ** 1.2;
    bolt(x0, x0 + f * 1500, y, (15 + 24 * k) * (1 - u * .7), a);
    lit(() => { for (let i = 0; i < 4; i++) { const c = F(x0 + f * (16 + i * 52 + 190 * u), y), rr = (24 + i * 15 + 70 * u) * c[2]; g.strokeStyle = `rgba(255,130,142,${.85 * a})`; g.lineWidth = 3 * a + 1; g.beginPath(); g.ellipse(c[0], c[1], rr * .3, rr, 0, 0, TAU); g.stroke(); } });
  });
  C.gash(x0, rnd(-30, 30), x0 + f * 1450, rnd(-30, 30), 4 + 3 * k, 2.2, { col: RGB });
  C.ink(x0, y, f, 6 + 8 * k, .9, WET);
  if (!E.tryHit(p, { reach: 1500, dmg, kb: 760, lift: 300, stop: .2, heavy: 1, col: BLOOD })) return;
  const o = E.P2, hs = o.scale || 1;
  V.sparks(o.x, o.y + 170 * hs, 'red', 18); C.ink(o.x, o.y + 170 * hs, f, 16 + 12 * k, 1.3, WET); V.ring(o.x, o.y + 170 * hs, 150 + 120 * k, BLOOD, .3);
  for (let i = 0; i < 3; i++) C.slice(o.x + f * rnd(0, 90), o.y + rnd(120, 220) * hs, (f > 0 ? 0 : Math.PI) + rnd(-.2, .2), 260, { shift: 6, w: .8, col: RGB, delay: i * .02 });      // through it and out the other side
}
// held past two seconds: all of it at once. It crosses the arena as a wave, and it lands when it gets there
function wave(p, m) {
  const f = p.face, x0 = p.x + f * 70;
  const me = tide = { x: x0, x0, f, k: clamp((m.pow - HOLD_WAVE) / (HOLD_MAX - HOLD_WAVE), 0, 1), dmg: waveDmg(m.pow), hit: false, out: 0, t: 0 };
  flashAt = E.T; sfx.wave(); shake(34); E.zoomIn(.5);
  V.ring(x0, p.y + 180, 420, BLOOD, .4); C.ink(x0, p.y + 180, f, 26, 1.4, WET);
  const end = clamp(x0 + f * 1750, -1040, 1040);
  V.custom(3.6, u => {                              // what it leaves on the floor behind it
    const a = Math.min(1, (1 - u) * 3), xf = tide === me ? clamp(me.x, -1040, 1040) : end, q = [P(x0, 0, ZP - 130), P(xf, 0, ZP - 130), P(xf, 0, ZP + 190), P(x0, 0, ZP + 190)];
    g.beginPath(); q.forEach((c, i) => { if (i) g.lineTo(c[0], c[1]); else g.moveTo(c[0], c[1]); }); g.closePath();
    g.fillStyle = `rgba(92,7,20,${.72 * a})`; g.fill();
    lit(() => { g.strokeStyle = `rgba(255,90,110,${.35 * a})`; g.lineWidth = 2; g.beginPath(); for (let i = 0; i < 5; i++) { const z = ZP - 100 + i * 62, s = P(x0 + (xf - x0) * (.08 + i * .13), 0, z), e = P(x0 + (xf - x0) * (.3 + i * .13), 0, z); g.moveTo(s[0], s[1]); g.lineTo(e[0], e[1]); } g.stroke(); });
  }, 0, true);
}
function runTide(dt) {
  const t = tide, o = E.P2, hs = o.scale || 1;
  t.t += dt;
  if (t.out) { if ((t.out += dt) > .45) tide = null; return; }
  t.x += t.f * 1900 * dt;
  if (Math.random() < dt * 60) C.ink(t.x - t.f * rnd(0, 200), rnd(120, 330), t.f, 1, 1, WET);
  if (!t.hit && !o.ko && !(o.alpha < 1) && (t.x - o.x) * t.f > -90 && (o.x - t.x0) * t.f > -60 && o.y < 420) {     // it has reached whatever is standing in its way
    t.hit = true;
    E.applyHit(o, t.f, { dmg: t.dmg, kb: 1300, lift: 520, stop: .22, heavy: 1, col: BLOOD });
    V.impact(.14, o.x, o.y + 150); V.sparks(o.x, o.y + 170 * hs, 'red', 22); C.ink(o.x, o.y + 170 * hs, t.f, 30, 1.5, WET); E.addBlast(o.x, 170, RGB, 420); shake(30);
  }
  if ((t.x - t.x0) * t.f > 1750 || Math.abs(t.x) > 1250) t.out = .001;
}
// the wave: a body of it that is tallest where it leads, rolls over at the front, and trails down to nothing behind
function drawTide() {
  const t = tide, f = t.f, fade = t.out ? Math.max(0, 1 - t.out / .45) : 1, Hh = (300 + 90 * t.k) * fade * Math.min(1, t.t * 7 + .25), len = Math.min(Math.abs(t.x - t.x0) + 60, 720), T = E.T, N = 22;
  const top = Array.from({ length: N + 1 }, (_, i) => { const v = i / N; return [t.x - f * len * (1 - v), Hh * (.1 + .9 * v ** 1.5) * (1 + .12 * Math.sin(v * 9 - T * 10) + .06 * Math.sin(v * 23 + T * 7))]; });
  const body = s => {
    let c = F(t.x - f * len, 0), was = c;
    g.beginPath(); g.moveTo(c[0], c[1]);
    for (const q of top) { c = F(q[0], q[1] * s); g.quadraticCurveTo(was[0], was[1], (was[0] + c[0]) / 2, (was[1] + c[1]) / 2); was = c; }      // rounded: it rolls, it does not have teeth
    g.lineTo(c[0], c[1]);
    const lip = F(t.x + f * 120 * s, Hh * .55 * s), foot = F(t.x + f * 46, 0);       // the front of it, leaning over what it is about to land on
    g.quadraticCurveTo(lip[0], lip[1], foot[0], foot[1]); g.closePath();
  };
  const crest = F(t.x - f * 40, Hh * .6);
  g.save(); g.globalAlpha = fade; g.lineJoin = 'round';
  lit(() => E.glow(E.GLOW.red, crest[0], crest[1], (900 + 300 * t.k) * crest[2], .75 * fade));
  g.globalAlpha = fade;
  body(1); g.fillStyle = '#5c0714'; g.fill(); g.strokeStyle = '#2a030a'; g.lineWidth = 3; g.stroke();
  body(.8); g.fillStyle = WET; g.fill();
  body(.56); g.fillStyle = '#ff3b55'; g.fill();
  lit(() => {                                       // the heart of it is too bright to be blood any more
    g.globalAlpha = .8 * fade; body(.3); g.fillStyle = '#ffd3d9'; g.fill();
    g.lineCap = 'round'; g.strokeStyle = `rgba(255,236,240,${.8 * fade})`;
    for (let i = 0; i < 9; i++) {                   // and lines of light run through it the way it is going
      const s = ((i * 53 % 17) / 17 + T * 2.2) % 1, y = Hh * (.08 + (i * 37 % 10) / 10 * .5), a = F(t.x - f * len * (1 - s) * .8, y), b = F(t.x - f * len * (1 - Math.min(1, s + .16)) * .8, y);
      g.lineWidth = 3 * a[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    }
    g.lineCap = 'butt';
  });
  g.restore();
}
// while it is being held: blood winding round him, beads of it shaken off his hands, the ball it is being squeezed into between his palms,
// and a ring round that which fills over the three seconds (the mark on it is two)
function drawCharge(p, m, front) {
  const t = m.t, T = E.T, f = p.face, hot = t >= HOLD_WAVE, u = Math.min(1, t / HOLD_MAX), body = F(p.x, p.y + 165), k = body[2], n = hot ? 6 : 4;
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) {                     // the ribbons: the half of each turn that passes behind him is drawn before he is
    const dir = i & 1 ? -1 : 1, a0 = T * (2.4 + i * .45) * dir + i * 1.9, mid = a0 + 1.1, behind = Math.sin(mid) < 0;
    if (behind === front) continue;
    const rx = (105 + i * 22 + 26 * Math.sin(T * 3 + i)) * k * (.6 + .5 * u), ry = (70 + i * 18) * k, cy = body[1] - (i - n / 2) * 30 * k, tilt = .35 * dir + .2 * Math.sin(T * 1.7 + i);
    for (const [wd, col] of [[(9 + 6 * u) * k, '#3d0612'], [(6 + 5 * u) * k, i % 3 ? BLOOD : WET], [1.6 * k, '#ff8f9c']]) { g.strokeStyle = col; g.lineWidth = wd; g.beginPath(); g.ellipse(body[0], cy, rx, ry, tilt, a0, a0 + 2.2); g.stroke(); }
  }
  if (!front) { g.restore(); return; }
  const w = E.hand(p, true), c = F(w[0] + f * 24, w[1] + 4), sq = Math.min(1, t / HOLD_WAVE), R = (lerp(30, 12, sq) + (hot ? 5 + 3 * Math.sin(T * 30) : 0)) * k;
  lit(() => E.glow(E.GLOW.red, c[0], c[1], (150 + 260 * u) * k, .6 + .3 * u));
  for (let i = 0; i < 12; i++) {                    // beads, flung out from between his palms and drawn straight back
    const a = i * .524 + T * 1.3, d = (34 + 60 * ((T * (1.4 + (i % 4) * .3) + i * .37) % 1)) * k * (.7 + .6 * u), bx = c[0] + Math.cos(a) * d, by = c[1] + Math.sin(a) * d * .8, r = (2.4 + (i % 3)) * k;
    g.fillStyle = i % 4 ? BLOOD : WET; g.beginPath(); g.moveTo(bx + Math.cos(a) * r * 3, by + Math.sin(a) * r * 2.4); g.lineTo(bx - Math.sin(a) * r, by + Math.cos(a) * r * .8); g.lineTo(bx + Math.sin(a) * r, by - Math.cos(a) * r * .8); g.closePath(); g.fill();
  }
  const gr = g.createRadialGradient(c[0] - R * .25, c[1] - R * .25, R * .05, c[0], c[1], R);
  gr.addColorStop(0, hot ? '#ffffff' : '#ff9aa6'); gr.addColorStop(.4, hot ? '#ff6a7c' : BLOOD); gr.addColorStop(1, '#3d0612');
  g.fillStyle = gr; g.beginPath(); g.arc(c[0], c[1], R, 0, TAU); g.fill();
  g.strokeStyle = '#2a030a'; g.lineWidth = 2; g.stroke();
  g.strokeStyle = 'rgba(255,220,225,.85)'; g.lineWidth = Math.max(1.2, R * .12); g.beginPath(); g.arc(c[0], c[1], R * .55, T * 16, T * 16 + 4.2); g.stroke();      // the turn of it
  const G = 58 * k, a1 = -Math.PI / 2 + TAU * u, am = -Math.PI / 2 + TAU * HOLD_WAVE / HOLD_MAX;
  g.strokeStyle = 'rgba(8,6,14,.75)'; g.lineWidth = 7 * k; g.beginPath(); g.arc(c[0], c[1], G, 0, TAU); g.stroke();
  g.strokeStyle = hot ? '#ffd3d9' : BLOOD; g.lineWidth = 4.5 * k; g.beginPath(); g.arc(c[0], c[1], G, -Math.PI / 2, a1); g.stroke();
  g.strokeStyle = '#fff'; g.lineWidth = 2.5 * k; g.beginPath(); g.moveTo(c[0] + Math.cos(am) * (G - 8 * k), c[1] + Math.sin(am) * (G - 8 * k)); g.lineTo(c[0] + Math.cos(am) * (G + 8 * k), c[1] + Math.sin(am) * (G + 8 * k)); g.stroke();
  g.restore();
}

const MOVES = {
  // 1 — a wheel of blood thrown flat, sawing at whatever it reaches
  strikes: { name: 'Slicing Exorcism', cd: 3, dur: .6, glow: 'red', run(p, m, t) {
    p.vx = 0; p.rate = 40; p.target = t < .12 ? POSE.hookWind : t < .4 ? POSE.hook : POSE.idle;
    if (t > .12 && !m.s) {
      m.s = 1; sfx.whoosh();
      const f = p.face, x0 = p.x + f * 80, y = p.y + 165, o = near(p, 800), x1 = o ? o.x : x0 + f * 760;
      V.custom(.36, u => {
        const c = F(x0 + (x1 - x0) * Math.min(1, u / .5), y), r = 64 * c[2], a = E.T * 30;
        g.lineCap = 'round';
        for (const [w, col] of [[13, DARK], [6, BLOOD]]) { g.strokeStyle = col; g.lineWidth = w * c[2]; g.beginPath(); g.ellipse(c[0], c[1], r, r * .36, 0, a, a + 4.6); g.stroke(); }
        g.lineCap = 'butt';
      });
      E.after(.14, () => {
        if (!E.tryHit(p, { reach: 800, dmg: 7, kb: 60, stun: .6, stop: .05, col: BLOOD })) return;
        const q = E.P2;
        dot(q, f, 3, .09, { dmg: 6, kb: 40, stun: .5, stop: .03, col: BLOOD }, i => {
          V.slash(q.x + rnd(-30, 30), q.y + rnd(100, 220), rnd(-.6, .6) + (i & 1 ? Math.PI : 0), 240, BLOOD, 9);
          if (i === 3) E.applyHit(q, f, { dmg: 5, kb: 460, lift: 360, stop: .08, heavy: 1, col: BLOOD });
        });
      });
    }
  } },
  // 2 — his blood runs hot and fast: for a while everything he does lands harder, his fists come quicker and so do his feet
  crush: { name: 'Flowing Red Scale', cd: 14, dur: .55, glow: 'red', run(p, m, t) {
    p.vx = 0; p.rate = 30; p.target = t < .4 ? POSE.manjiWind : POSE.idle;
    if (m.s) return;
    m.s = 1; scaleT = SCALE_T; sfx.charge(); shout(p, '赤鱗躍動', BLOOD);
    V.ring(p.x, p.y + 150, 260, BLOOD, .4); V.sparks(p.x, p.y + 200, 'red', 16); shake(10);
  } },
  // 3 — beads of blood flung out around the target, and then every one of them bursts at once
  div: { name: 'Supernova', cd: 8, dur: .95, glow: 'red', run(p, m, t) {
    p.vx = 0; p.rate = 34; p.target = t < .2 ? POSE.divWind : t < .6 ? POSE.div : POSE.idle;
    if (t > .2 && !m.s) {
      m.s = 1; sfx.whoosh();
      const o = near(p, 780), cx = o ? o.x : p.x + p.face * 340, x0 = p.x + p.face * 70, y0 = p.y + 190;
      const beads = Array.from({ length: 8 }, (_, i) => [cx + Math.cos(i * .785) * rnd(90, 190), 175 + Math.sin(i * .785) * rnd(60, 130)]);
      V.custom(.45, u => { const e = Math.min(1, u * 2.4); for (const b of beads) orb(x0 + (b[0] - x0) * e, y0 + (b[1] - y0) * e, 9 + 3 * Math.sin(u * 30), 'red', DARK); });
      E.after(.45, () => {
        sfx.blast(); shake(20); E.addBlast(cx, 175, RGB, 340);
        for (const b of beads) { V.sparks(b[0], b[1], 'red', 5); V.ring(b[0], b[1], 90, BLOOD, .25); }
        if (near(p, 820)) E.tryHit(p, { reach: 820, dmg: 17, kb: 520, lift: 500, stop: .14, heavy: 1, col: BLOOD });
      });
    }
  } },
  // 4 — Convergence, then Piercing Blood. Held: see the top of this file. (Anybody else who has this move has no key to hold, and gets the
  // old six tenths of a second and the old 32)
  manji: { name: 'Piercing Blood', cd: 11, dur: 4.4, run(p, m, t) {
    const mine = p === E.P1, o = E.P2;
    p.vx = 0; p.rate = 28;
    if (m.fired === undefined) {
      p.target = CLASP;
      if (mine) { pend = m; if (!o.ko) p.face = o.x >= p.x ? 1 : -1; }      // he keeps it pointed at whatever he is fighting
      if (!m.c) { m.c = 1; m.beat = 0; sfx.charge(); shout(p, '百斂', BLOOD); if (!mine) V.custom(.6, u => { const h = E.hand(p, true); orb(h[0] + p.face * 20, h[1], 26 * (1 - u * .7), 'red', DARK); }); }
      if (t >= m.beat) { m.beat = t + Math.max(.15, .42 - t * .09); sfx.beat(Math.min(1, t / HOLD_MAX)); }       // his pulse, and it quickens
      if (mine && t >= HOLD_WAVE && !m.hot) {
        m.hot = 1; flashAt = E.T; sfx.bf(); shake(14); shout(p, 'BLOOD WAVE', '#ff8f9c');
        V.ring(p.x + p.face * 90, p.y + 180, 320, BLOOD, .35); V.sparks(p.x + p.face * 90, p.y + 180, 'red', 14);
      }
      if (Math.random() < .5 + t * .15) { const w = E.hand(p, true); V.mote(w[0] + p.face * 20, w[1], 'red'); }
      if (((mine ? holding() : t < .6) && t < HOLD_MAX) || t < HOLD_MIN) return;
      m.fired = t; m.pow = Math.min(t, HOLD_MAX); p.pose = POSE.div.slice();
      if (mine && m.pow >= HOLD_WAVE) wave(p, m); else pierce(p, m, mine ? pierceDmg(m.pow) : 32);
      return;
    }
    p.target = t < m.fired + .4 ? POSE.div : POSE.idle; p.rate = 46;
    if (mine && t > m.fired + (m.pow >= HOLD_WAVE ? .75 : .5)) E.endMove(p);
  } }
};

JU.tech.add('blood', { name: 'Blood Brother', jp: '赤血操術', mark: '血', who: 'Blood Brother', odds: 2.5, col: BLOOD, glow: 'red', moves: MOVES,
  limited: ENDS, skin: CHOSO, as: ['Blood Brother', '血'], hint: '<b>Hold 4</b> Piercing Blood · 2s for the wave',
  tick(dt) {
    const p = E.P1, k = E.keys;
    if (saw) runSaw(dt);
    if (tide) runTide(dt);
    if (pend && p.move !== pend) { if (pend.fired === undefined) E.cd.manji = Math.min(E.cd.manji, 4); pend = null; }      // knocked out of it before he could let go: most of the wait is handed back
    if (scaleT <= 0) return;
    scaleT -= dt;
    const dir = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0);
    if (free(p) && p.ground && dir) p.x = Math.max(-965, Math.min(965, p.x + dir * 360 * SCALE_WALK * dt));      // quicker on his feet
    if (Math.random() < dt * 26) V.puff('red', p.x + rnd(-50, 50), p.y + rnd(20, 240), 0, rnd(120, 260), 30, .45);
  }
});

// Flowing Red Scale: half as hard again, and two fists in the time of one and a half
const DEF = JU.tech.TECH.blood, hot = () => scaleT > 0 && JU.tech.active === DEF, pow0 = H.power, rate0 = H.m1rate;
H.power = (h, o) => pow0(h, o) * (hot() && !h.fixed ? SCALE_POW : 1);
H.m1rate = () => rate0() * (hot() ? SCALE_RATE : 1);

// a technique with a skin of its own puts it on him when a fight starts (unless a clan has him wearing somebody else's body)
const start0 = H.fightStart;
H.fightStart = (cfg, wave) => {
  start0(cfg, wave);
  const t = JU.tech.active;
  scaleT = 0; saw = tide = pend = null;
  if (t && t.skin && !JU.clan.body()) { E.P1.skin = t.skin; Fi.nm.p1.textContent = t.as[0]; Fi.nm.p1j.textContent = t.as[1]; }
};

/* ---------- the edge of him lit red, and his plain strikes (update 0.2v4) ---------- */
// while the technique is his, the outline of him glows the colour of it: brighter while he is striking or gathering, and for a third of a
// second, when the gathering passes two seconds, all of him is that colour
const rim0 = H.rim;
H.rim = f => {
  if (f !== E.P1 || JU.tech.active !== DEF || f.dead) return rim0 ? rim0(f) : null;
  const m = f.move, busy = m && (m.def.bb || m.def === MOVES.manji), since = E.T - flashAt;
  return { col: '#ff1f3d', blur: (busy ? 11 : hot() ? 9 : 6) + 2 * Math.sin(E.T * 8), filter: since < .32 ? `brightness(${(1.2 + .9 * (1 - since / .32)).toFixed(2)}) sepia(1) saturate(7) hue-rotate(-38deg)` : null };
};
// the four strikes, with blood hardened over whatever is doing the striking: a spike off the first fist, an edge off each of the next two,
// and a wider one off his foot. They reach a little further than a bare hand does
const EDGE = M.m1.map(d => Object.assign({}, d, { bb: 1, sw: 'rgba(224,32,60,.95)', hit: Object.assign({}, d.hit, { col: BLOOD, reach: d.hit.reach + 26 }) }));
const TILT = [0, -.35, .7, -.15], RAD = [0, 108, 122, 156];
function moon(r, a, depth) {                        // a blade with its belly toward +x
  const tx = r * Math.cos(a), ty = r * Math.sin(a), d = r * depth, r2 = Math.hypot(tx + d, ty), a2 = Math.atan2(ty, tx + d);
  g.beginPath(); g.arc(0, 0, r, -a, a); g.arc(-d, 0, r2, a2, -a2, true); g.closePath();
}
function edge(p, i) {
  const f = p.face, kick = i === 3, y = p.y + (kick ? 140 : 172);
  if (!i) {                                         // the spike: out of his fist, as far as it goes, and back in
    V.custom(.16, u => {
      const w = E.hand(p, true), c = F(w[0], w[1]), k = c[2], L = 170 * Math.sin(Math.min(1, u * 2.2) * Math.PI / 2) * (1 - Math.max(0, u - .55) / .45) * k;
      g.save(); g.translate(c[0], c[1]); g.scale(f, 1); g.lineJoin = 'round';
      lit(() => { g.strokeStyle = `rgba(${RGB},.5)`; g.lineWidth = 16 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(L, 0); g.stroke(); });
      g.fillStyle = BLOOD; g.strokeStyle = '#2a030a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-6 * k, -11 * k); g.lineTo(L, 0); g.lineTo(-6 * k, 11 * k); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#ff8f9c'; g.beginPath(); g.moveTo(0, -4 * k); g.lineTo(L * .8, 0); g.lineTo(0, 1 * k); g.closePath(); g.fill();
      g.restore();
    });
    C.ink(p.x + f * 150, y, f, 3, .6, WET);
    return;
  }
  V.custom(.18, u => {                              // the edge: red with its own outline, a light along the cutting side of it
    const c = F(p.x + f * (24 + 80 * ease(u)), y), k = c[2], r = RAD[i] * k * (.55 + .45 * Math.min(1, u * 5)), al = (1 - u) ** 1.3;
    g.save(); g.translate(c[0], c[1]); g.rotate((f > 0 ? 0 : Math.PI) - TILT[i] * f); g.lineJoin = 'round';
    lit(() => { g.globalAlpha = .5 * al; g.strokeStyle = `rgb(${RGB})`; g.lineWidth = r * .26; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, r, -1.15, 1.15); g.stroke(); });
    g.globalAlpha = al; moon(r, 1.15, .5); g.fillStyle = BLOOD; g.fill(); g.strokeStyle = '#2a030a'; g.lineWidth = 2.5; g.stroke();
    moon(r * .97, 1.02, .78); g.fillStyle = DARK; g.fill();
    g.strokeStyle = '#ffb3bd'; g.lineWidth = Math.max(1.5, r * .03); g.beginPath(); g.arc(0, 0, r * .985, -1.05, 1.05); g.stroke();
    g.restore();
  });
  C.ink(p.x + f * (90 + RAD[i] * .5), y + 40, f, kick ? 6 : 3, kick ? .9 : .6, WET);
}
const moveFx0 = H.moveFx;
H.moveFx = (p, m) => {
  moveFx0(p, m);
  if (p !== E.P1 || JU.tech.active !== DEF || !m.def.m1) return;
  if (m.def === M.m1[m.i]) m.def = EDGE[m.i];       // an ordinary strike has just begun: it is one of these instead
  if (!m.def.bb) return;
  const f = p.face, o = E.P2, hs = o.scale || 1, hx = o.x - f * 22, hy = o.y + 162 * hs;
  if (m.sw && !m.bs) { m.bs = 1; edge(p, m.i); }
  if (m.done && !m.bk) {
    m.bk = 1; sfx.splat(); C.ink(hx, hy, f, 5 + m.i * 3, .8 + .15 * m.i, WET); V.ring(hx, hy, 60 + 26 * m.i, BLOOD, .16);
    if (m.i === 3) { C.gash(o.x - 120, rnd(-40, 40), o.x + 130, rnd(-40, 40), 5, 2, { col: RGB }); C.slice(hx, hy, f > 0 ? .5 : Math.PI - .5, 240, { shift: 7, col: RGB }); }
  }
};

/* ---------- out of the air (update 0.2v2) ---------- */
const free = p => !p.move && !p.ps && !p.dead && !(p.dashT > 0);
let saw = null;                                     // the wheel, once it has been thrown at the floor
// Slicing Exorcism: thrown down instead of across, it bites into the floor and runs along it at whatever he is fighting, like a saw
const AIRSAW = { name: 'Slicing Exorcism', dur: .6, glow: 'red', run(p, m, t) {
  p.rate = 40; p.target = t < .14 ? POSE.hookWind : t < .38 ? POSE.crush : POSE.fall;
  if (t < .2) { p.vy = Math.max(p.vy, 60); p.vx *= .85; }       // he hangs there for the throw
  if (t < .14 || m.s) return;
  const f = E.P2.x >= p.x ? 1 : -1;
  m.s = 1; p.face = f; sfx.whoosh();
  saw = { x: p.x + f * 60, y: p.y + 150, vx: f * 700, vy: -1100, f, t: 0, n: 0, next: 0, down: false };
} };
function runSaw(dt) {
  const s = saw, o = E.P2, hs = o.scale || 1;
  s.t += dt;
  if (!s.down) {                                    // on its way to the floor
    s.vy -= 2600 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
    if (s.y <= 46) { s.y = 46; s.down = true; sfx.blast(); shake(10); V.crack(s.x, 150); V.rocks(s.x, 0, 5); }
  } else {
    const at = !o.ko && !(o.alpha < 1) && Math.abs(o.x - s.x) < 70 * hs + 30 && o.y < 140;
    if (!at) s.x += s.f * 1250 * dt;               // it runs until it finds something, and then it stays on it
    if (Math.random() < dt * 40) V.puff('red', s.x - s.f * 30, 20, -s.f * rnd(100, 400), rnd(100, 500), 22, .25);
    if (Math.random() < dt * 14) V.rocks(s.x, 0, 1);
    if (at && (s.next -= dt) <= 0) {
      s.next = .1; s.n++;
      V.slash(o.x + rnd(-30, 30), o.y + rnd(60, 200), rnd(-.6, .6) + (s.n & 1 ? Math.PI : 0), 240, BLOOD, 9);
      if (s.n < 5) E.applyHit(o, s.f, { dmg: 6, kb: 20, stun: .5, stop: .03, col: BLOOD });
      else { E.applyHit(o, s.f, { dmg: 9, kb: 520, lift: 420, stop: .1, heavy: 1, col: BLOOD }); V.sparks(s.x, 80, 'red', 16); saw = null; return; }
    }
  }
  if (s.t > 1.8 || Math.abs(s.x) > 1050) { V.sparks(s.x, s.y, 'red', 8); saw = null; }
}
function drawSaw() {
  const s = saw, c = F(s.x, s.y), k = c[2], r = 46 * k, a = E.T * 34 * s.f;
  g.fillStyle = DARK;                               // teeth
  for (let i = 0; i < 8; i++) { const q = a + i * .785; g.beginPath(); g.moveTo(c[0] + Math.cos(q) * r, c[1] + Math.sin(q) * r); g.lineTo(c[0] + Math.cos(q + .2) * (r + 16 * k), c[1] + Math.sin(q + .2) * (r + 16 * k)); g.lineTo(c[0] + Math.cos(q + .45) * r, c[1] + Math.sin(q + .45) * r); g.closePath(); g.fill(); }
  g.lineCap = 'round';
  for (const [w, col] of [[14, DARK], [7, BLOOD]]) { g.strokeStyle = col; g.lineWidth = w * k; g.beginPath(); g.arc(c[0], c[1], r, a, a + 4.9); g.stroke(); }
  g.lineCap = 'butt';
  g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.red, c[0], c[1], 150 * k, .6); g.globalCompositeOperation = 'source-over';
}
// Flowing Red Scale: the blood goes hot on the way down, and he arrives fist first. The same ten seconds of it, and a hit to start them
const AIRSCALE = { name: 'Flowing Red Scale', dur: 1.6, glow: 'red', run(p, m, t) {
  const o = E.P2, hit = () => {
    if (m.done || !E.tryHit(p, { reach: 190, dmg: 22, kb: 240, stun: .9, stop: .16, heavy: 1, ring: 1, col: BLOOD })) return;
    m.done = 1; V.impact(.1, o.x, o.y + 150);
    if (!o.poise && !o.ko) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 26), vy: -1400, vx: p.face * 200, bounced: false });   // into the floor with it
  };
  p.rate = 44;
  if (m.land !== undefined) { p.vx = 0; p.target = t < m.land + .22 ? POSE.crush : POSE.idle; if (t > m.land + .36) E.endMove(p); return; }
  if (!m.c) { m.c = 1; scaleT = SCALE_T; sfx.charge(); shout(p, '赤鱗躍動', BLOOD); V.ring(p.x, p.y + 150, 240, BLOOD, .35); V.sparks(p.x, p.y + 200, 'red', 14); }
  if (p.ground && t > .02) {
    const x = p.x + p.face * 70;
    m.land = t; p.vy = 0; hit();
    sfx.blast(); shake(24); V.crack(x, 320); V.rocks(x, 0, 14); V.ring(x, 50, 300, BLOOD, .4); E.addBlast(x, 90, RGB, 300);
    return;
  }
  if (t < .16) { p.target = POSE.crushWind; p.vy = Math.max(p.vy, 60); p.vx *= .85; return; }
  if (!m.aim) { m.aim = 1; p.face = o.x >= p.x ? 1 : -1; sfx.whoosh(); m.vx = Math.max(-2200, Math.min(2200, (o.x - p.face * 60 - p.x) / Math.max(.1, p.y / 1500))); }
  p.target = POSE.crush; p.vy = -1500; p.vx = m.vx;
  if (Math.random() < .8) V.puff('red', p.x, p.y + 80, -p.vx * .1, 220, 44, .25);
  hit();
} };
const press0 = H.press, fx0 = H.fx, under0 = H.under;
H.press = (a, inScene) => {
  if (!inScene && JU.tech.active === DEF && (a === 'strikes' || a === 'crush')) {
    const p = E.P1;
    if (!p.ground && free(p) && E.cd[a] <= 0) {
      E.cd[a] = E.CD[a]; p.move = { def: a === 'strikes' ? AIRSAW : AIRSCALE, key: a, t: 0 }; E.hud.mv[a].classList.add('act');
      return true;
    }
  }
  return press0 ? press0(a, inScene) : false;
};
const charging = () => { const m = E.P1.move; return m && m.def === MOVES.manji && m.fired === undefined ? m : null; };
H.under = dt => { under0(dt); const m = charging(); if (m) drawCharge(E.P1, m, false); };
H.fx = dt => { fx0(dt); if (saw) drawSaw(); const m = charging(); if (m) drawCharge(E.P1, m, true); if (tide) { if (JU.tech.active === DEF) drawTide(); else tide = null; } };

JU.choso = { CHOSO, ENDS, AIRSAW, AIRSCALE, MOVES, HOLD: [HOLD_MIN, HOLD_WAVE, HOLD_MAX], pierceDmg, waveDmg, get scale() { return scaleT; }, get saw() { return saw && { x: Math.round(saw.x), n: saw.n, down: saw.down }; },
  get state() { const m = charging(); return { charge: m ? +m.t.toFixed(2) : null, hot: !!(m && m.hot), tide: tide && { x: Math.round(tide.x), hit: tide.hit, dmg: tide.dmg } }; } };
})();
