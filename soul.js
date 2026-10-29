/* JUJUTSU UNLIMITEDS — Build 0.19: the SOUL SHAPER (Transfiguration) reworked, all of it. The user: "mahito full rework. add so when he uses
   his moves on his fists these purple flames (cursed energy). for the moves rework the damage sfx and vfx ... search up real stuff from the
   anime and use the vfx from there and make the vfx at 1000%", with a still of him, both hands in purple fire. Drawn from the fan wiki's
   anime stills: the arm split into black whips of blades; a palm on a face, and the face swelling; two souls forced into one lump of flesh
   between his hands; the Polymorphic Soul Isomer, hulking; the residue of his cursed energy left in footprints on the floor.
   HIS LOOK: the technique is the Soul Shaper's body now (JU.cast2.MAHITO), as the newer ones are.
   CURSED ENERGY: purple fire round both hands while a move of his is going (a little of it on his strikes), dark at the edges and pale in
     the heart the way the anime draws it; his outline lit purple; footprints of it on the floor where he walks.
   1 BLADE ARM: the arm splits into three black whips of blades, swept round over his head and down through them: 24, and still the 0.768
     of a second they can do nothing in.
   2 BODY REPEL (撥体): two souls forced into one between his hands, a lump that will not stay one; let go, the rejection comes out of it at
     them as a stream of transfigured bodies (6 x5), and the last of it bursts on them (12).
   3 IDLE TRANSFIGURATION (無為転変): in, a hand on them, and his voice saying it (the Japanese). Their shape will not hold: the picture of
     them swells and twists, veins and stitches come up on them, and it goes on hurting (12, then 6 x6). Then 2: the Black Flash, as before.
   4 POLYMORPHIC SOUL ISOMER (幾魂異性体): a little transfigured body thrown down in front of him swells into a hulking one, which goes at
     them and hits them the length of the arena (55), and then falls apart, as they do. He laughs.
   E SOUL TOUCH (especial.js takes this one): hold of them, their soul half out of them and twisted, and back in: 36.
   The Soul Shaper the boss (boss_a.js, and every copy of it) fights with these same moves, turned down for it here (BOSS) so that nothing in
   the story is harder than it was. Sounds: clips (sounds/home-mahito-* at home, myinstants online: his voice, his laugh, flesh changing,
   bones, gore) over built ones (sfx.curse, index.html) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, Z = JU.bossfx, B = JU.boss;
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2;
const T = JU.tech.TECH.trans, TR = T.moves, { shout, dot } = JU.tech.tk;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const exact = (o, n) => n / (o.dr || 1);            // a hit worth the stated amount, whatever the target is made of
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const play = (name, vol, alt) => { if (!sfx.file(name, vol) && alt) alt(); };      // a clip (myinstants' online, sounds/home-* at home), or a built one
sfx.preload(['home-mahito-mui', 'home-mahito-laugh', 'home-mahito-morph', 'home-mahito-bones', 'home-mahito-flesh', 'home-mahito-gore']);
const VIO = '#a77bff', VRGB = '167,123,255', DEEP = '#22073d', MID = '#7d3cf0', CORE = '#ead8ff';
const gore = () => JU.gore !== false;
const can = (p, o) => p === E.P1 && !!o && !duel() && !o.net && !o.poise && !o.ko;      // may this move put its hands on them (the player's own moves, on a body the game runs)
const handAt = (f, front) => { const h = E.hand(f, front), s = f.scale || 1; return [f.x + (h[0] - f.x) * s, f.y + (h[1] - f.y) * s]; };
const mid = o => o.y + 170 * (o.scale || 1);

/* ================= cursed energy: purple fire on his hands ================= */
// tongues of it, each a teardrop pointing up; all their edges are drawn first and dark, then all their bodies, then their hearts, so the
// fire of one hand reads as one shape with a dark line round it (the anime's), not a heap of little ones
const flames = [], heat = new Map();                // heat: how hard each fighter's hands are burning, 0 to 1
function want(f, v) { const h = heat.get(f) || { v: 0, want: 0 }; h.want = Math.max(h.want, v); heat.set(f, h); }
function tongue(x, y, r, lean) {
  g.beginPath();
  g.moveTo(x + lean * r * 1.7, y - r * 2.9);
  g.bezierCurveTo(x + r * .95 + lean * r, y - r * 1.7, x + r * 1.15, y - r * .25, x, y + r * .6);
  g.bezierCurveTo(x - r * 1.15, y - r * .25, x - r * .95 + lean * r, y - r * 1.7, x + lean * r * 1.7, y - r * 2.9);
  g.closePath();
}
function flameTick(dt) {
  for (const [f, h] of heat) {
    h.v += (h.want - h.v) * (1 - Math.exp(-dt * (h.want > h.v ? 14 : 3.2)));
    h.want = 0;
    if (h.v < .02) { heat.delete(f); continue; }
    const s = f.scale || 1;
    for (const front of [true, false]) {             // new tongues off each hand, more of them the hotter it is
      const n = dt * 70 * h.v + Math.random();
      for (let i = 1; i <= n; i++) {
        const w = handAt(f, front), big = Math.random() < .3;      // (a few big tongues, and many small ones licking up round them)
        flames.push({ x: w[0] + rnd(-12, 12) * s, y: w[1] + rnd(-8, 10) * s, vx: rnd(-60, 60) + (f.vx || 0) * .25, vy: big ? rnd(160, 260) : rnd(240, 460), t: 0, life: big ? rnd(.26, .4) : rnd(.14, .3), r: (big ? rnd(14, 20) : rnd(6, 11)) * s * (.55 + .6 * h.v), lean: rnd(-.6, .6), ph: rnd(0, TAU) });
      }
    }
  }
  for (let i = flames.length - 1; i >= 0; i--) {
    const q = flames[i];
    q.t += dt; if (q.t >= q.life) { flames.splice(i, 1); continue; }
    q.x += q.vx * dt; q.y += q.vy * dt; q.vy *= Math.exp(-dt * 1.5);
  }
  if (flames.length > 360) flames.splice(0, flames.length - 360);
}
function drawFlames() {
  if (!flames.length) return;
  for (const [f, h] of heat) for (const front of [true, false]) {      // the light of it, round each hand
    if (h.v < .05) continue;
    const w = handAt(f, front), c = F(w[0], w[1]);
    lit(() => E.glow(E.GLOW.purple, c[0], c[1], 170 * c[2] * h.v * (1 + .12 * Math.sin(E.T * 30 + (front ? 0 : 2))), .85 * h.v));
  }
  const pass = (fill, grow, alpha) => {
    g.fillStyle = fill;
    for (const q of flames) {
      const u = q.t / q.life, c = F(q.x, q.y), k = c[2], r = q.r * k * (1 - u * .55) * grow;
      g.globalAlpha = alpha * Math.min(1, (1 - u) * 2.2);
      tongue(c[0], c[1], r, q.lean + Math.sin(E.T * 18 + q.ph) * .35);
      g.fill();
    }
  };
  pass(DEEP, 1.32, .95); pass(MID, 1, .88); pass(CORE, .46, .78);
  g.globalAlpha = 1;
}

/* ================= his outline lit, and his footprints left on the floor ================= */
const steps = [];                                   // { x, side, t }: residue of his cursed energy where he has stood
let stepT = 0, stepSide = 1;
function stepTick(dt, p) {
  for (let i = steps.length - 1; i >= 0; i--) if ((steps[i].t += dt) > 3.2) steps.splice(i, 1);
  if (!p || !p.ground || p.dead || Math.abs(p.vx) < 120) return;
  if ((stepT -= dt) > 0) return;
  stepT = .26; stepSide = -stepSide;
  steps.push({ x: p.x + stepSide * 12, side: stepSide, face: p.vx > 0 ? 1 : -1, t: 0 });
  if (steps.length > 18) steps.shift();
}
function drawSteps() {
  for (const s of steps) {
    const c = F(s.x, 0), k = c[2], a = s.t < .1 ? s.t / .1 : Math.max(0, 1 - (s.t - .4) / 2.8);
    if (a <= 0) continue;
    g.save(); g.translate(c[0], c[1]); g.scale(s.face * k, k * .32);
    g.globalAlpha = .55 * a; g.fillStyle = '#0d0518'; g.beginPath(); g.ellipse(0, 0, 26, 12, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(22, -1, 9, 10, 0, 0, TAU); g.fill();
    g.globalAlpha = .9 * a; g.strokeStyle = VIO; g.lineWidth = 3; g.setLineDash([5, 4]); g.beginPath(); g.ellipse(0, 0, 28, 14, 0, 0, TAU); g.stroke(); g.setLineDash([]);
    g.restore();
    lit(() => E.glow(E.GLOW.purple, c[0], c[1], 60 * k, .25 * a));
  }
}

/* ================= 1 — Blade Arm: the arm split into whips of black blades ================= */
// three whips out of his front hand, each a chain of hooked black blades with a white edge (the anime's), swept round over his head and
// down through them. th: where the whips point (0 is straight ahead of him, up is positive); grow: how far out they are
function whips(p, th, grow, k0) {
  const w = handAt(p, true), c = F(w[0], w[1]), k = c[2] * (p.scale || 1), f = p.face;
  for (let i = 0; i < 3; i++) {
    const L = 360 * (1 - i * .12) * grow * k, n = 12, a0 = th - (i - 1) * .2 - i * .08;
    let x = c[0], y = c[1], a = a0;
    const pts = [];
    for (let j = 0; j < n; j++) { a -= .05 + i * .02; x += Math.cos(a) * f * L / n; y -= Math.sin(a) * L / n; pts.push([x, y, a]); }
    lit(() => { g.strokeStyle = `rgba(${VRGB},${.45 * k0})`; g.lineWidth = 16 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(c[0], c[1]); for (const q of pts) g.lineTo(q[0], q[1]); g.stroke(); });
    g.strokeStyle = '#08060c'; g.lineWidth = 7 * k * (1 - i * .15); g.lineCap = 'round'; g.beginPath(); g.moveTo(c[0], c[1]); for (const q of pts) g.lineTo(q[0], q[1]); g.stroke();
    pts.forEach((q, j) => {                         // the blades along it, hooked, smaller toward the tip
      const s = (1 - j / n * .6) * k, sgn = j & 1 ? 1 : -1;
      g.save(); g.translate(q[0], q[1]); g.scale(f, 1); g.rotate(-q[2] + sgn * .5);
      g.beginPath(); g.moveTo(-6 * s, 0); g.quadraticCurveTo(10 * s, -20 * s * sgn, 30 * s, -8 * s * sgn); g.quadraticCurveTo(12 * s, -6 * s * sgn, 8 * s, 4 * s * sgn); g.closePath();
      g.fillStyle = '#060509'; g.fill();
      g.strokeStyle = 'rgba(240,236,255,.95)'; g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(0, -4 * s * sgn); g.quadraticCurveTo(12 * s, -18 * s * sgn, 29 * s, -8 * s * sgn); g.stroke();
      g.restore();
    });
  }
}
function bulgeArm(p, u) {                           // before it goes: the flesh of the arm heaving, stitched lumps rising along it
  const w = handAt(p, true), sh = [p.x + p.face * 10, p.y + 236 * (p.scale || 1)], k = F(w[0], w[1])[2];
  for (let i = 0; i < 5; i++) {
    const v = (i + 1) / 6, x = lerp(sh[0], w[0], v), y = lerp(sh[1], w[1], v), c = F(x, y), r = (7 + 9 * Math.abs(Math.sin(u * 14 + i * 1.7))) * k * u;
    g.fillStyle = '#c9cfd8'; g.beginPath(); g.arc(c[0], c[1], r, 0, TAU); g.fill(); g.lineWidth = 2 * k; g.strokeStyle = LINE; g.stroke();
    g.strokeStyle = '#3a3340'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(c[0] - r * .6, c[1]); g.lineTo(c[0] + r * .6, c[1]); g.stroke();
  }
}
const BLADE = { name: 'Blade Arm', cd: 3.5, dur: .62, run(p, m, t) {
  p.rate = 40; p.vx = t > .12 && t < .26 ? p.face * 640 : 0;      // (a step into it: from where a fight starts, the whips just reach)
  p.target = t < .12 ? POSE.hookWind : t < .4 ? POSE.hook : POSE.idle;
  if (!m.s) {
    m.s = 1; play('home-mahito-morph', .65, () => sfx.charge()); sfx.curse();
    V.custom(.56, u => {
      if (u < .2) { bulgeArm(p, u / .2); return; }
      const s = (u - .2) / .8, sweep = ease(Math.min(1, s / .55)), grow = s < .12 ? s / .12 : s > .75 ? Math.max(0, 1 - (s - .75) / .25) : 1;
      whips(p, lerp(2.1, -.75, sweep), grow, 1 - s * .5);
    });
  }
  if (t > .12 && !m.sw) { m.sw = 1; sfx.whoosh(); sfx.cut(.9); V.slash(p.x + p.face * 170, p.y + 220, p.face > 0 ? -.9 : Math.PI + .9, 420, VIO, 16); V.slash(p.x + p.face * 170, p.y + 220, p.face > 0 ? -.9 : Math.PI + .9, 380, '#120818', 8, .02); }
  if (t > .14 && t < .3 && !m.done) {
    const o = E.P2;
    if (E.tryHit(p, { reach: 380, dmg: exact(o, 24), kb: 520, lift: 140, stun: p === E.P1 ? .768 : .5, stop: .1, heavy: 1, col: VIO, fixed: 1, mute: 1 })) {
      m.done = 1;
      if (p === E.P1 && JU.combat2) JU.combat2.stun(E.P2);      // in his hands it leaves what it cuts unable to do anything for 0.768 of a second
      const x = o.x, y = mid(o);
      play('home-mahito-flesh', .85, () => sfx.hit(true)); sfx.cut(1.4); shake(18); E.zoomIn(.2);
      for (let i = 0; i < 3; i++) V.slash(x, y - 30 + i * 30, p.face > 0 ? -.6 + i * .1 : Math.PI + .6 - i * .1, 300, i === 1 ? '#ffffff' : VIO, 10 - i * 2, i * .03);
      V.sparks(x, y, 'purple', 14);
      if (Z) Z.flare(x, y, VRGB, 300, .18);
      if (gore() && Z) for (let i = 0; i < 16; i++) Z.emit(4, x + rnd(-20, 20), y + rnd(-40, 40), p.face * rnd(200, 900), rnd(-100, 600), rnd(4, 8), 1.6, i % 3 ? '150,8,20' : '200,20,32', { g: 1900, land: 'blood' });
    }
  }
} };

/* ================= 2 — Body Repel: two souls forced into one, and what comes out of it ================= */
const SKINS = ['#c9a2d6', '#7a5aa8', '#5aa89a', '#d8b49a', '#a86a8a', '#8fa0c8'];      // transfigured flesh, as the anime colours its crowds of them
const bodies = [];                                  // { x, y, vx, vy, r, col, eye, t, life, spin, tg }: the stream of them
function lumpAt(p) { const a = handAt(p, true), b = handAt(p, false); return [(a[0] + b[0]) / 2 + p.face * 26, (a[1] + b[1]) / 2]; }
function lump(c, k, r, u) {                         // the two souls in one: a ridged lump of flesh, stitched, heaving
  g.save(); g.translate(c[0], c[1]); g.scale(k, k);
  const sq = 1 + .12 * Math.sin(u * 40), rx = r * sq, ry = r * .66 / sq;
  g.fillStyle = '#8a5a48'; g.beginPath(); g.ellipse(0, 0, rx, ry, .2, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();
  g.strokeStyle = '#4a2a20'; g.lineWidth = 2.2;
  for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(i * rx * .3, 0, rx * .12, ry * .9, .2, 0, TAU); g.stroke(); }      // the ridges round it
  g.strokeStyle = '#d8c0b0'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-rx * .7, -ry * .1); g.lineTo(rx * .7, ry * .1); g.stroke();
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * rx * .2, -4); g.lineTo(i * rx * .2 + 2, 6); g.stroke(); }      // a seam of stitches across it
  if (u > .4) { g.fillStyle = '#f4efe6'; g.beginPath(); g.ellipse(rx * .25, -ry * .35, 6, 4.5, 0, 0, TAU); g.fill(); g.fillStyle = '#1a0a10'; g.beginPath(); g.arc(rx * .27, -ry * .35, 2.4, 0, TAU); g.fill(); }      // an eye, opening in it
  g.restore();
}
function body(q) {                                  // one of the stream: a swollen body, an eye or a mouth in it
  const c = F(q.x, q.y), k = c[2], u = q.t / q.life, r = q.r * k * (.6 + .5 * Math.min(1, u * 3)), w = 1 + .15 * Math.sin(q.t * 30 + q.spin * 9);
  g.save(); g.translate(c[0], c[1]); g.rotate(q.spin + q.t * q.vr);
  g.fillStyle = q.col; g.beginPath(); g.ellipse(0, 0, r * w, r / w * .82, 0, 0, TAU); g.fill(); g.lineWidth = 3 * k; g.strokeStyle = LINE; g.stroke();
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(r * .2, r * .25, r * .7 * w, r * .45 / w, .3, 0, TAU); g.fill();
  g.beginPath(); g.arc(-r * .55, -r * .4, r * .28, 0, TAU); g.fillStyle = q.col; g.fill(); g.stroke();      // a lump growing off it
  if (q.eye) { g.fillStyle = '#f4efe6'; g.beginPath(); g.ellipse(r * .25, -r * .2, r * .3, r * .24, 0, 0, TAU); g.fill(); g.lineWidth = 1.5 * k; g.stroke(); g.fillStyle = '#c21f3a'; g.beginPath(); g.arc(r * .3, -r * .2, r * .13, 0, TAU); g.fill(); g.fillStyle = '#0a0508'; g.beginPath(); g.arc(r * .3, -r * .2, r * .06, 0, TAU); g.fill(); }
  else { g.fillStyle = '#2a0a14'; g.beginPath(); g.ellipse(r * .2, r * .1, r * .36, r * .14, 0, 0, TAU); g.fill(); g.fillStyle = '#f4efe6'; for (let i = -2; i <= 2; i++) g.fillRect(r * .2 + i * r * .13 - 1.2 * k, r * .1 - r * .14, 2.4 * k, r * .1); }
  g.strokeStyle = 'rgba(40,20,40,.7)'; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(-r * .6, r * .3); g.lineTo(r * .1, r * .55); g.stroke();
  g.restore();
}
function splat(x, y, s) {                           // one of them come apart
  if (Z) for (let i = 0; i < 10 * s; i++) Z.emit(3, x + rnd(-20, 20), y + rnd(-20, 20), rnd(-500, 500), rnd(-100, 700), rnd(4, 9) * s, rnd(.5, 1), i % 2 ? '138,90,72' : '122,90,168', { g: 1600, vr: rnd(-14, 14), rot: rnd(0, TAU), edge: 'rgba(20,10,20,.8)' });
  if (gore() && Z) for (let i = 0; i < 8 * s; i++) Z.emit(4, x, y, rnd(-600, 600), rnd(-50, 700), rnd(3, 7), 1.4, '150,8,20', { g: 1900, land: 'blood' });
  V.puff('purple', x, y, 0, 60, 90 * s, .35);
}
function bodiesTick(dt) {
  for (let i = bodies.length - 1; i >= 0; i--) {
    const q = bodies[i];
    q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy -= 300 * dt;
    const o = q.tg, reach = o && !o.ko && Math.abs(o.x - q.x) < 60 * (o.scale || 1) && q.y > o.y - 20;
    if (reach || q.t >= q.life || Math.abs(q.x) > 1000 || q.y < 0) { splat(q.x, Math.max(30, q.y), reach ? .8 : .5); bodies.splice(i, 1); }
  }
}
const REPEL = { name: 'Body Repel', cd: 7, dur: 1.25, run(p, m, t) {
  p.vx = 0; p.rate = 30;
  p.target = t < .38 ? POSE.divWind : t < 1 ? POSE.div : POSE.idle;
  if (!m.s) {
    m.s = 1; play('home-mahito-morph', .8, () => sfx.charge()); sfx.curse();
    V.custom(.4, u => { const c = lumpAt(p), cc = F(c[0], c[1]); lit(() => E.glow(E.GLOW.purple, cc[0], cc[1], 220 * cc[2] * u, .8)); lump(cc, cc[2] * (p.scale || 1), 18 + 26 * ease(u), u); });
  }
  if (t >= .38 && !m.go) { m.go = 1; m.n = 0; play('home-mahito-bones', .75); sfx.blast(); shake(16); const c = lumpAt(p); V.ring(c[0], c[1], 200, VIO, .3); if (Z) Z.flare(c[0], c[1], VRGB, 360, .2); }
  while (m.go && m.n < 20 && t >= .38 + m.n * .026) {     // the rejection: they pour out of it, one after another, swelling as they go
    m.n++;
    const c = lumpAt(p);
    bodies.push({ x: c[0], y: c[1] + rnd(-40, 40), vx: p.face * rnd(1400, 2100), vy: rnd(-120, 320), r: rnd(26, 46) * (p.scale || 1), col: SKINS[m.n % SKINS.length], eye: Math.random() < .55, t: 0, life: .7, spin: rnd(0, TAU), vr: rnd(-6, 6), tg: E.P2 });
  }
  for (let i = 0; i < 5; i++) {                      // and each wave of them that reaches them: 6
    if (t < .5 + i * .09 || m['h' + i]) continue;
    m['h' + i] = 1;
    const o = E.P2;
    if (E.tryHit(p, { reach: 900, dmg: exact(o, 6), kb: 60, stun: .5, stop: .03, col: VIO, fixed: 1, mute: 1 })) { play('home-mahito-flesh', .5 + Math.random() * .25, () => sfx.hit(false)); if (can(p, o)) o.vx = 0; }
  }
  if (t >= .98 && !m.last) {                         // the last of it, bursting on them
    m.last = 1;
    const o = E.P2;
    if (E.tryHit(p, { reach: 900, dmg: exact(o, 12), kb: 640, lift: 360, stun: .9, stop: .16, heavy: 1, col: VIO, fixed: 1, mute: 1 })) {
      const x = o.x, y = mid(o);
      play('home-mahito-gore', .8, () => sfx.splat()); sfx.blast(); shake(26); E.zoomIn(.3);
      splat(x, y, 1.6);
      if (Z) Z.boom(x, y, 110, VRGB, { n: 18, smoke: '40,20,50', hot: '235,220,255', flash: .15 });
    }
  }
} };

/* ================= 3 — Idle Transfiguration: a hand on them, and their shape will not hold ================= */
// the picture of them is taken a frame at a time and put back in slices, each pushed sideways and swollen by a little more than the last
// (drawn over everything else, so it is their shape that goes, not the drawing of it); and over them: veins, lumps, stitches
const warps = [];                                   // { o, t, life, ph, str }
let wcv = null, wctx = null;
function drawWarps(dt) {
  for (let i = warps.length - 1; i >= 0; i--) if ((warps[i].t += dt) >= warps[i].life || warps[i].o.ko && warps[i].t > .6) warps.splice(i, 1);
  if (!warps.length || JU.reduceMotion) return;
  const cv = g.canvas, VW = E.VW, gy = E.GY - 120, zoom = cam.zoom, px = cv.width / VW;
  for (const w of warps) {
    const o = w.o, hs = o.scale || 1, c = F(o.x, o.y + 185 * hs), k = c[2] * zoom;
    const cx = (c[0] - VW / 2) * zoom + VW / 2, cy = (c[1] - gy) * zoom + gy - cam.lift;
    const bw = 330 * k * hs, bh = 500 * k * hs;
    let x0 = Math.round((cx - bw / 2) * px), y0 = Math.round((cy - bh / 2) * px), ww = Math.round(bw * px), hh = Math.round(bh * px);
    if (x0 < 0) { ww += x0; x0 = 0; } if (y0 < 0) { hh += y0; y0 = 0; }
    ww = Math.min(ww, cv.width - x0); hh = Math.min(hh, cv.height - y0);
    if (ww < 8 || hh < 8) continue;
    if (!wcv) { wcv = document.createElement('canvas'); wctx = wcv.getContext('2d'); }
    if (wcv.width < ww || wcv.height < hh) { wcv.width = Math.max(wcv.width, ww); wcv.height = Math.max(wcv.height, hh); }
    wctx.globalCompositeOperation = 'copy'; wctx.drawImage(cv, x0, y0, ww, hh, 0, 0, ww, hh);
    const u = w.t / w.life, on = (u < .08 ? u / .08 : 1 - Math.max(0, (u - .7) / .3)) * w.str, amp = 20 * k * px * on, step = Math.max(2, Math.round(3 * px));
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    for (let y = 0; y < hh; y += step) {
      const v = y / hh, env = Math.sin(v * Math.PI);
      const off = (Math.sin(v * 11 + w.t * 17 + w.ph) * .65 + Math.sin(v * 27 - w.t * 9) * .35) * amp * env;
      const sw = 1 + .3 * on * env * (.5 + .5 * Math.sin(v * 8 - w.t * 13 + w.ph)), dw = ww * sw;
      g.drawImage(wcv, 0, y, ww, Math.min(step, hh - y), x0 + off + (ww - dw) / 2, y0 + y, dw, Math.min(step, hh - y));
    }
    g.restore();
  }
}
const marks = [];                                   // { o, t, life, veins, lumps }: what comes up on them
function vein(n) { const pts = [[0, 0]]; let a = rnd(0, TAU); for (let i = 0; i < n; i++) { a += rnd(-.7, .7); const q = pts[i]; pts.push([q[0] + Math.cos(a) * 22, q[1] + Math.sin(a) * 26]); } return pts; }
function drawMarks(dt) {
  for (let i = marks.length - 1; i >= 0; i--) {
    const m = marks[i], o = m.o;
    if ((m.t += dt) >= m.life || (o.ko && m.t > .6)) { marks.splice(i, 1); continue; }
    const hs = o.scale || 1, c = F(o.x, o.y + 220 * hs), k = c[2] * hs, u = m.t / m.life, fade = Math.min(1, (1 - u) * 4), grow = Math.min(1, m.t / .45);
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    for (const v of m.veins) {                       // veins, out from where his hand was
      const n = Math.max(1, Math.round(v.length * grow));
      g.beginPath(); g.moveTo(c[0] + v[0][0] * k, c[1] + v[0][1] * k); for (let j = 1; j < n; j++) g.lineTo(c[0] + v[j][0] * k, c[1] + v[j][1] * k);
      g.globalAlpha = .85 * fade; g.strokeStyle = '#2a0a3a'; g.lineWidth = 4.5 * k; g.stroke(); g.strokeStyle = 'rgba(176,110,255,.75)'; g.lineWidth = 1.6 * k; g.stroke();
    }
    for (const L of m.lumps) {                       // flesh swelling up out of them, and going down again
      const s = Math.sin(clamp((m.t - L.at) / L.d, 0, 1) * Math.PI);
      if (s <= .01) continue;
      const x = c[0] + L.x * k, y = c[1] + L.y * k, r = L.r * k * s;
      g.globalAlpha = fade; g.fillStyle = L.col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.lineWidth = 2.2 * k; g.strokeStyle = LINE; g.stroke();
      if (L.eye && s > .5) { g.fillStyle = '#f4efe6'; g.beginPath(); g.arc(x + r * .2, y - r * .1, r * .35, 0, TAU); g.fill(); g.fillStyle = '#0a0508'; g.beginPath(); g.arc(x + r * .25, y - r * .1, r * .14, 0, TAU); g.fill(); }
    }
    g.globalAlpha = .9 * fade * grow; g.strokeStyle = '#3a3340'; g.lineWidth = 2 * k;      // and a seam of stitches across them
    g.beginPath(); g.moveTo(c[0] - 40 * k, c[1] - 30 * k); g.lineTo(c[0] + 44 * k, c[1] + 10 * k); g.stroke();
    for (let j = 0; j < 7; j++) { const x = c[0] + (-36 + j * 12) * k, y = c[1] + (-28 + j * 5.7) * k; g.beginPath(); g.moveTo(x - 3 * k, y - 6 * k); g.lineTo(x + 3 * k, y + 6 * k); g.stroke(); }
    if (m.t < .5) {                                  // his hand, printed on them in his cursed energy
      g.globalAlpha = 1 - m.t / .5;
      lit(() => { E.glow(E.GLOW.purple, c[0], c[1], 300 * k, .9); g.fillStyle = 'rgba(220,190,255,.8)'; g.beginPath(); g.ellipse(c[0], c[1], 22 * k, 26 * k, 0, 0, TAU); g.fill(); for (let j = 0; j < 4; j++) { g.beginPath(); g.ellipse(c[0] + (-15 + j * 10) * k, c[1] - 36 * k, 4.5 * k, 13 * k, 0, 0, TAU); g.fill(); } g.beginPath(); g.ellipse(c[0] + 24 * k, c[1] - 6 * k, 4.5 * k, 11 * k, -.8, 0, TAU); g.fill(); });
    }
    g.restore();
  }
}
function transfigure(o, life) {                     // their shape, going: the picture of them, and what comes up on them
  warps.push({ o, t: 0, life, ph: rnd(0, TAU), str: 1 });
  const lumps = [];
  for (let i = 0; i < 9; i++) lumps.push({ x: rnd(-46, 46), y: rnd(-130, 90), r: rnd(9, 22), at: rnd(.05, life - .5), d: rnd(.3, .6), col: SKINS[i % SKINS.length], eye: Math.random() < .35 });
  marks.push({ o, t: 0, life, veins: Array.from({ length: 7 }, () => vein(6 + (Math.random() * 4 | 0))), lumps });
}
const TOUCH = { name: 'Idle Transfiguration', cd: 9, dur: .85, run(p, m, t) {
  const o = E.P2, gap = (o.x - p.x) * p.face;
  p.rate = 40; p.vx = t > .06 && t < .34 && gap > 140 && !m.done ? p.face * 1400 : 0;      // (in, far enough to reach them from where a fight starts)
  p.target = t < .12 ? POSE.dash : t < .6 ? POSE.jab : POSE.idle;
  if (!m.s) { m.s = 1; sfx.curse(); }
  if (t > .08 && t < .38 && !m.done && E.tryHit(p, { reach: 230, dmg: exact(o, 12), kb: 0, stun: 1.9, stop: .2, heavy: 1, col: VIO, fixed: 1, mute: 1 })) {
    m.done = 1;                                      // (combo.js watches for this: 2 now is the Black Flash)
    play('home-mahito-mui', 1, () => sfx.charge()); E.after(.1, () => play('home-mahito-bones', .6));
    shout(p, '無為転変', VIO); shake(16); E.stop(.08);
    if (Z) { Z.flash(VRGB, .22, .22); Z.flare(o.x, mid(o), VRGB, 380, .22); }
    transfigure(o, 2.1);
    dot(o, p.face, 6, .3, { dmg: exact(o, 6), kb: 0, stun: 1, stop: .03, col: VIO, fixed: 1, mute: 1 }, () => {
      play('home-mahito-flesh', .5, () => sfx.hit(false)); V.sparks(o.x, mid(o), 'purple', 4);
      if (gore() && Z) for (let i = 0; i < 4; i++) Z.emit(4, o.x + rnd(-30, 30), mid(o) + rnd(-50, 50), rnd(-300, 300), rnd(0, 500), rnd(3, 6), 1.3, '150,8,20', { g: 1900, land: 'blood' });
    });
  }
} };

/* ================= 4 — Polymorphic Soul Isomer: a hulking one, made of many ================= */
// x, the place it stands; s its size (it swells); lean forward as it goes; punch: how far its front arm is out; down: falling apart
function isomer(q) {
  const c = F(q.x, 0), k = c[2] * q.s * 1.02, f = q.face, down = q.down || 0, a = 1 - down;      // (a head and more taller than whoever it is after)
  if (a <= .01) return;
  g.save(); g.translate(c[0], c[1]); g.scale(f * k, k * (1 - down * .35)); g.globalAlpha = Math.min(1, a * 1.5); g.lineJoin = 'round'; g.lineCap = 'round';
  const ink = w => { g.lineWidth = w; g.strokeStyle = LINE; g.stroke(); }, SK = '#d9c2a3', SH = '#a8896a', DK = '#7b5f48';
  const shape = (pts, fill) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = fill; g.fill(); ink(4); };
  g.rotate(q.lean * .35);
  shape([[-62, 0], [-30, 0], [-22, -190], [-70, -190]], SH);                // the legs, thick as posts
  shape([[14, 0], [52, 0], [56, -190], [6, -190]], SK);
  shape([[-84, -180], [80, -180], [120, -330], [96, -430], [-96, -430], [-118, -330]], SK);      // the body, the muscle of it
  g.strokeStyle = SH; g.lineWidth = 4;
  for (const y of [-220, -260, -300]) { g.beginPath(); g.moveTo(-30, y); g.lineTo(30, y); g.stroke(); }
  g.beginPath(); g.moveTo(0, -200); g.lineTo(0, -330); g.stroke();
  g.beginPath(); g.moveTo(-70, -360); g.quadraticCurveTo(-10, -380, 0, -340); g.quadraticCurveTo(10, -380, 70, -360); g.stroke();
  g.fillStyle = '#f4efe6'; for (const [x, y] of [[-24, -290], [14, -296]]) { g.beginPath(); g.ellipse(x, y, 9, 7, 0, 0, TAU); g.fill(); g.lineWidth = 2; g.strokeStyle = LINE; g.stroke(); }      // a face in its belly, from one of the ones it was made of
  g.fillStyle = '#c21f3a'; for (const [x, y] of [[-22, -290], [16, -296]]) { g.beginPath(); g.arc(x, y, 3.5, 0, TAU); g.fill(); }
  g.fillStyle = '#2a0a14'; g.beginPath(); g.ellipse(-4, -262, 18, 6 + 5 * (q.roar || 0), 0, 0, TAU); g.fill();
  // another of them, fused onto its back and shoulders, hunched, its arms round the first one's neck
  shape([[-110, -400], [-40, -470], [40, -480], [96, -430], [70, -400], [-60, -390]], SH);
  g.fillStyle = DK; g.beginPath(); g.ellipse(-70, -470, 34, 30, 0, 0, TAU); g.fill(); ink(3.5);
  g.fillStyle = '#f4efe6'; for (const [x, y] of [[-78, -476], [-60, -480]]) { g.beginPath(); g.arc(x, y, 4.5, 0, TAU); g.fill(); }
  g.fillStyle = LINE; for (const [x, y] of [[-78, -476], [-60, -480]]) { g.beginPath(); g.arc(x, y, 2, 0, TAU); g.fill(); }
  g.fillStyle = SK; g.beginPath(); g.ellipse(14, -470, 30, 28, 0, 0, TAU); g.fill(); ink(3.5);      // its own head, small for it
  g.fillStyle = '#2a0a14'; g.beginPath(); g.ellipse(26, -462, 13, 6 + 8 * (q.roar || 0), 0, 0, TAU); g.fill();
  g.strokeStyle = '#3a3340'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-6, -490); g.lineTo(40, -478); g.stroke();
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-2 + i * 12, -496 + i * 3); g.lineTo(2 + i * 12, -484 + i * 3); g.stroke(); }
  g.strokeStyle = '#3a3340'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-90, -320); g.lineTo(60, -250); g.stroke();      // stitches across the body
  for (let i = 0; i < 9; i++) { const x = -84 + i * 17, y = -317 + i * 7.6; g.beginPath(); g.moveTo(x - 3, y - 7); g.lineTo(x + 3, y + 7); g.stroke(); }
  // the back arm, hanging; the front one, the fist, out as far as the punch says
  shape([[-96, -420], [-126, -300], [-120, -190], [-90, -196], [-92, -300], [-70, -410]], SH);
  g.fillStyle = SH; g.beginPath(); g.ellipse(-104, -180, 30, 26, 0, 0, TAU); g.fill(); ink(4);
  const P = q.punch || 0, sx = 84, sy = -410, ex = sx + 60 + P * 70, ey = sy + 150 - P * 110, hx = ex + 50 + P * 110, hy = ey + 70 - P * 80;
  const limb = (x0, y0, x1, y1, w) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineWidth = w + 8; g.strokeStyle = LINE; g.stroke(); g.lineWidth = w; g.strokeStyle = SK; g.stroke(); };
  limb(sx, sy, ex, ey, 58); limb(ex, ey, hx, hy, 50);      // the upper arm and the forearm, bent at the elbow until it hits
  g.fillStyle = SH; g.beginPath(); g.arc(ex, ey, 26, 0, TAU); g.fill(); ink(3.5);
  g.fillStyle = SK; g.beginPath(); g.ellipse(hx + 10, hy, 46 + P * 8, 40, -P * .5, 0, TAU); g.fill(); ink(4.5);
  g.strokeStyle = SH; g.lineWidth = 3; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(hx + 30, hy + i * 14 - 6); g.lineTo(hx + 50, hy + i * 14); g.stroke(); }      // its knuckles
  g.restore();
}
const isos = [];                                    // { x, x0, tx, face, t, s, lean, punch, down, roar, th }: Isomers out
function isoTick(dt) {
  for (let i = isos.length - 1; i >= 0; i--) {
    const q = isos[i];
    q.t += dt;
    const t = q.t;
    if (t < .12) { q.s = .18; q.x = lerp(q.x0 - q.face * 110, q.x0, t / .12); }       // thrown down in front of him, small
    else if (t < .45) { q.s = lerp(.18, 1, ease((t - .12) / .33)); q.roar = Math.max(0, Math.sin((t - .12) / .33 * Math.PI)); }      // swelling up
    else if (t < .75) { const u = ease((t - .45) / .3); q.s = 1; q.lean = u; q.x = lerp(q.x0, q.tx, u); q.punch = u * .25; q.roar = .6; }      // at them
    else if (t < .95) { q.punch = Math.min(1, (t - .75) / .06); q.lean = 1 - (t - .75) * 2; }      // the blow
    else if (t < 1.4) { q.punch = Math.max(0, 1 - (t - .95) / .2); q.down = ease((t - 1.05) / .35); q.lean = .3; }      // and coming apart
    else { if (!q.burst) { q.burst = 1; splat(q.x, 200, 1.4); } isos.splice(i, 1); continue; }
    if (t >= 1.05 && !q.burst2) { q.burst2 = 1; splat(q.x + q.face * 40, 300, 1.2); splat(q.x, 140, 1); play('home-mahito-gore', .6, () => sfx.splat()); }
  }
}
const ISOMER = { name: 'Polymorphic Soul Isomer', cd: 13, dur: 1.75, run(p, m, t) {
  p.vx = 0; p.rate = 30;
  p.target = t < .25 ? POSE.crushWind : t < .55 ? POSE.crush : POSE.idle;
  if (!m.s) { m.s = 1; sfx.curse(); play('home-mahito-morph', .8, () => sfx.charge()); }
  if (t >= .2 && !m.q) {
    const o = E.P2, spot = m.K && m.K.mv && m.K.mv.spot ? m.K.spot : null;      // (the boss's: it goes where the mark on the floor is)
    const want = spot !== null ? spot : (!o.ko && (o.x - p.x) * p.face > 0 ? o.x : p.x + p.face * 700);
    const x0 = clamp(p.x + p.face * 190, -930, 930), tx = clamp(p.face > 0 ? Math.min(want - 290, p.x + 900) : Math.max(want + 290, p.x - 900), -930, 930);      // (its fist arrives where they are)
    m.q = { x: x0, x0, tx: (tx - x0) * p.face > 0 ? tx : x0, face: p.face, t: 0, s: .18, lean: 0, punch: 0, down: 0, roar: 0 };
    isos.push(m.q); sfx.whoosh(); play('home-mahito-bones', .7);
  }
  if (m.q && !m.big && m.q.t >= .42) { m.big = 1; sfx.slam(1.2); shake(14); E.addDust(m.q.x); V.rocks(m.q.x, 0, 8); }
  if (m.q && !m.hit && m.q.t >= .77) {               // the blow
    m.hit = 1;
    const o = E.P2;
    if (E.tryHit(p, { reach: 1150, dmg: exact(o, 55), kb: 1300, lift: 650, stun: 1, stop: .3, heavy: 1, col: VIO, fixed: 1, mute: 1 })) {
      const x = o.x, y = mid(o);
      play('home-love-slam', .9, () => sfx.slam(1.6)); sfx.blast(); play('home-mahito-flesh', .9); shake(36); E.zoomIn(.45);
      if (Z) { Z.boom(x, y, 140, VRGB, { n: 24, smoke: '40,20,50', hot: '240,230,255', flash: .25 }); Z.shock(x, 640, VRGB, .5, 12); }
      V.ring(x, y, 420, '#ffffff', .3); V.ring(x, y, 300, VIO, .35);
      E.fx.push({ k: 2, x, y: o.y + 470 * (o.scale || 1), n: 'POLYMORPHIC SOUL ISOMER', col: VIO, t: 0, life: 1.4 });
    } else { sfx.whoosh(); V.ring(m.q.x + p.face * 240, 260, 260, VIO, .3); }
  }
  if (!m.laugh && t >= 1.25) { m.laugh = 1; play('home-mahito-laugh', .8); }
} };

/* ================= E — Soul Touch, again (especial.js takes this one in place of its own) ================= */
const SOUL = E.flat('#3a1366', '#c9a2ff');
const ESP = { name: 'Soul Touch', jp: '魂に触れる', col: VIO, cd: 14, dur: 1.5, run(p, m, t) {
  const o = E.P2, f = p.face;
  if (m.got === undefined) {
    if (!m.s) { m.s = 1; sfx.curse(); }
    if (t < .1) { p.target = POSE.divWind; p.vx = 0; return; }
    p.target = POSE.jab; p.vx = t < .3 ? f * 1500 : 0;
    const gap = (o.x - p.x) * f;
    if (gap > -30 && gap < 190 && !o.ko && !(o.alpha < 1) && o.state !== 'down' && o.state !== 'up') {
      m.got = t; p.vx = 0;
      E.stop(.12); shake(12); if (Z) Z.dim(.55, .8);
      play('home-mahito-mui', .9, () => sfx.charge());
      if (!duel()) Object.assign(o, { vx: 0, state: o.state === 'air' ? 'air' : 'hurt', stun: Math.max(o.stun || 0, 1.2), act: null, tele: 0 });
      transfigure(o, 1.3);
      V.custom(.85, u => {                           // its soul, half out of it toward his hand, twisted, and back: the shape it really is
        const pull = Math.sin(Math.min(1, u / .75) * Math.PI), side = p.x >= o.x ? 1 : -1, gh = E.over(o, SOUL);
        gh.x = o.x + side * 130 * pull; gh.y = o.y + 20 * pull; gh.spin = Math.cos(u * 14);
        E.drawFighter(gh, .62 * (1 - u * .4));
        const c = F(o.x + side * 65 * pull, mid(o)), k = c[2];
        lit(() => E.glow(E.GLOW.purple, c[0], c[1], 300 * k * pull, .55));
      });
    } else if (t > .45) E.endMove(p);
    return;
  }
  const s = t - m.got;
  p.vx = 0; p.target = s < .6 ? POSE.jab : POSE.idle;
  if (s > .62 && !m.back) {
    m.back = 1;
    if (!o.ko) E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: exact(o, 36), kb: 460, stun: 1.4, stop: .2, heavy: 1, col: VIO, fixed: 1, mute: 1 });
    play('home-mahito-flesh', .9, () => sfx.splat()); play('home-mahito-bones', .6); sfx.charge(); shake(24);
    V.ring(o.x, mid(o), 320, VIO, .35); V.sparks(o.x, mid(o), 'purple', 14);
    if (Z) Z.flash(VRGB, .25, .25);
    E.fx.push({ k: 2, x: o.x, y: o.y + 430 * (o.scale || 1), n: 'SOUL TOUCHED', col: '#d9c2ff', t: 0, life: 1.2 });
  }
  if (s > .95) E.endMove(p);
} };

/* ================= the technique: his body, his colour, these moves ================= */
for (const [key, def] of [['strikes', BLADE], ['crush', REPEL], ['div', TOUCH], ['manji', ISOMER]]) Object.assign(TR[key], def);      // (in place: combo.js and the bosses hold on to these very objects)
Object.assign(T, { col: VIO, glow: 'purple', skin: JU.cast2.MAHITO, as: ['Soul Shaper', '魂'],
  hint: '<b>1</b> Blade Arm · <b>2</b> Body Repel · <b>3</b> Idle Transfiguration, then <b>2</b>: Black Flash · <b>4</b> Polymorphic Soul Isomer · <b>E</b> Soul Touch' });
const MINE = new Set([TR.strikes, TR.crush, TR.div, TR.manji, ESP]);
const on = () => JU.tech.active === T;

// the boss's copies of them: the same moves, turned down (BOSS: what share of each lands on the player) so the story is no harder than it
// was (they did 10, 13, 6 + 5 x5 and 24, at .8 and .6); its mark on the floor stays up until the Isomer's blow comes down on it
const BOSS = { strikes: .4, crush: .3, div: .4, manji: .4 };
function bossKits() {
  for (const id in Fi.DEFS) {
    const k = Fi.DEFS[id] && Fi.DEFS[id].kit;
    if (!k || k.soul) continue;
    let mine = false;
    for (const m of k.moves) {
      const key = m.of && Object.keys(BOSS).find(x => TR[x] === m.of);
      if (!key) continue;
      mine = true; m.name = m.of.name; m.dur = m.of.dur; m.scale = BOSS[key];
      if (key === 'manji' && m.spot) m.then = (o, p, c) => B.mark(c.spot, 210, 1.05, VIO);
    }
    if (mine) { k.soul = true; k.col = VIO; k.glow = 'purple'; }
  }
}
bossKits();

/* ---------- wiring ---------- */
const tick0 = H.tick, fx0 = H.fx, under0 = H.under, post0 = H.post, rim0 = H.rim, reset0 = H.reset, start0 = H.fightStart;
H.tick = dt => {
  tick0(dt);
  const p = E.P1, o = E.P2;
  if (on() && p.move && !p.dead) want(p, MINE.has(p.move.def) ? 1 : p.move.def.m1 ? .45 : 0);      // his hands burn while a move of his is going, and a little as he strikes
  if (o && o.state === 'act' && o.act && o.act.a && MINE.has(o.act.a.of)) want(o, 1);      // and the boss's, the same
  flameTick(dt); stepTick(dt, on() ? p : null); bodiesTick(dt); isoTick(dt);
};
H.under = dt => { under0(dt); if (steps.length) drawSteps(); for (const q of isos) isomer(q); };      // (the Isomer behind the two of them)
H.fx = dt => {
  fx0(dt);
  for (const q of bodies) body(q);
  drawMarks(dt);
  drawFlames();
};
H.post = dt => { drawWarps(dt); if (post0) post0(dt); };
H.rim = f => {
  const h = heat.get(f);
  if (!h || h.v < .15 || f.dead) return rim0 ? rim0(f) : null;
  return { col: '#9b5cff', blur: 6 + 8 * h.v + 2 * Math.sin(E.T * 14), a: .6 };
};
const clear = () => { flames.length = steps.length = bodies.length = warps.length = marks.length = isos.length = 0; heat.clear(); };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) clear(); bossKits(); };

JU.soul = { esp: ESP, MOVES: TR, BOSS, transfigure,      // (esp: E, especial.js)
  get state() { const h = heat.get(E.P1); return { heat: h ? +h.v.toFixed(2) : 0, flames: flames.length, steps: steps.length, bodies: bodies.length, warps: warps.length, isos: isos.length }; } };
})();
