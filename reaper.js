/* JUJUTSU UNLIMITEDS — early access (Build 0.15): LOVE REAPER. Yuta Okkotsu, with a katana in his hand, and Rika behind him: there all the
   time, 85% see-through, until she is wanted.
   RIGHT CLICK (or C; Rika on a touch screen): her moveset, or back to the sword's. Under the move's name it says which.
   1 Cleaving Love. With the sword: a barrage of cuts, 90 in all. With Rika: she throws him at them with the sword out in front; when he
     gets there it cuts them (80), she puts them into the floor (20), and he cuts them again on the way back up (30). Then Cleaving Love
     waits twenty seconds.
   2 REAPING SLASH (Build 0.17), used twice: gone, and behind them, and a cut (50). 2 again while they reel: gone again, and a Black Flash
     (90), and everything stops: the sparks of it hang in the air, they hang where they are for four seconds while it rings out, the world
     round him goes grey and smeared, and then he kicks them clean across the arena.
   3 and 4 are still to come.
   Rika is drawn after the user's picture of her (Build 0.17): a ridged shell of a head with long pale tendrils off the back of it, a mouth
   that is all teeth where a face would be, a starved ribcage, long thin arms and longer fingers, and no legs: from the waist down she is a
   black tail. Her scream is his name (myinstants' "YUTA", sfx.rika in index.html). The story's Rika, in chapter 15, is drawn the same way */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, P = E.P, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, ZP = E.ZP, V = JU.vfx, sfx = JU.sfx, M = E.MOVES, Z = JU.bossfx, Fi = JU.fights, K = JU.cast4;
const { rnd, clamp, lerp } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const play = (name, vol, alt) => { if (!sfx.file(name, vol) && alt) alt(); };      // a clip (myinstants' online, sounds/home-* at home), or a built one
sfx.preload(['home-rika-yuta', 'home-yuta-tp', 'home-yuta-cut', 'home-nanami-bf']);
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const exact = (o, n) => n / (o.dr || 1);            // a hit worth the stated amount, whatever the target is made of
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const LILAC = '#c9a0ff', LRGB = '201,160,255', STEEL = '#e8f0ff', BONE = '#eeebf1', BONE2 = '#b9b3c4', SHADE = '#a39cb0', TAIL = '#16131b', TAIL2 = '#3a3446', MAW = '#3d0a14', MAW2 = '#6e1522';
const BARRAGE = 9, BARRAGE_DMG = 10, THROW = [80, 20, 30], CD_KATANA = 8, CD_RIKA = 20, SEE = .15;      // the barrage's cuts, and each one; Rika's three; the waits; how much of her shows (85% see-through)

/* ================= how he looks: the uniform, and the sword out of its case (the case on his back, empty) ================= */
const REAPER = Object.assign({}, K.YUTA, {
  back() {
    g.save(); g.translate(-13, -TOR + 8); g.rotate(-.55);
    g.fillStyle = '#20222c'; g.fillRect(-4.5, -84, 9, 116); g.lineWidth = 2.5; g.strokeStyle = LINE; g.strokeRect(-4.5, -84, 9, 116);
    g.restore();
  } });

/* ================= the katana: a white grip wound over black, a round guard, and a long blade with a little curve in it ================= */
// pt(L, v): a point of it on the screen, L along it from his fist and v across it
function grip(f) {
  const a = f.pose[2] - f.pose[6], w = E.hand(f, true), s = f.face * (f.spin === undefined ? 1 : f.spin), dx = Math.sin(a) * s, dy = -Math.cos(a);
  return (L, v = 0) => F(w[0] + dx * L - dy * v * s, w[1] + dy * L + dx * v * s);
}
function katana(f, lit) {
  const pt = grip(f), k = pt(0)[2];
  const shape = (pts, fill, w = 2.5) => { g.beginPath(); pts.forEach(([L, v], i) => { const c = pt(L, v); if (i) g.lineTo(c[0], c[1]); else g.moveTo(c[0], c[1]); }); g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = w * k; g.strokeStyle = LINE; g.stroke(); };
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if (lit) {                                        // cursed energy run into it: lilac all along the steel
    g.globalCompositeOperation = 'lighter';
    for (let L = 40; L <= 190; L += 30) { const c = pt(L, 0); E.glow(E.GLOW.purple, c[0], c[1], (110 + 20 * Math.sin(E.T * 10 + L)) * k, .6); }
    g.globalCompositeOperation = 'source-over';
  }
  shape([[-36, -5], [10, -5], [10, 5], [-36, 5]], '#f2f0f6');      // the grip
  g.fillStyle = '#1d1b24';
  for (let L = -32; L < 8; L += 8) { const a = pt(L, 0), b = pt(L + 4, -4), c = pt(L + 8, 0), d = pt(L + 4, 4); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); g.fill(); }      // the diamonds of the wrap
  shape([[10, -12], [16, -12], [16, 12], [10, 12]], '#2a2633');      // the guard
  shape([[16, -4.5], [120, -6], [178, -3.5], [196, 1], [178, 3], [120, 2.5], [16, 4]], '#dfe6f2');      // the blade: the back of it curving a little, to a point
  const e0 = pt(20, 2.5), e1 = pt(180, 1.8);
  g.beginPath(); g.moveTo(e0[0], e0[1]);
  for (let L = 30; L <= 170; L += 14) { const c = pt(L, -.5 + Math.sin(L * .35) * 1.6); g.lineTo(c[0], c[1]); }      // the temper line
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1.4 * k; g.stroke();
  g.beginPath(); g.moveTo(e0[0], e0[1]); g.lineTo(e1[0], e1[1]); g.strokeStyle = 'rgba(160,175,200,.6)'; g.lineWidth = 1.2 * k; g.stroke();
  g.restore();
}

/* ================= Rika ================= */
// after the user's picture of her: twice his height, hunched forward, a head like a ridged shell with long pale tendrils off the back of it
// and no face under it but a mouth full of long teeth, a starved ribcage, long thin arms with longer fingers, and below the waist a black
// tail, curling. Drawn in the world at (wx, wy, wz), facing face, s her size, a how much of her shows; q: { arm (her front arm reaching,
// 0 to 1.2), raise (lifted), mouth (open) }
function drawRika(wx, wy, wz, face, s, a, q) {
  if (a < .01) return;
  const c = P(wx, wy, wz), k = c[2] * s, T = E.T;
  g.save(); g.translate(c[0], c[1]); g.scale(face * k, k); g.lineJoin = 'round'; g.lineCap = 'round';
  g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.purple, 10, -300, 760, .22 * Math.min(1, a * 2)); g.globalCompositeOperation = 'source-over';      // a little of her cursed energy, round her
  g.globalAlpha = a;
  const ink = w => { g.lineWidth = w; g.strokeStyle = LINE; g.stroke(); };
  // the tail: black, thick at her waist, thinning, and curling up at the end
  const sw = Math.sin(T * 1.4) * 10;
  g.fillStyle = TAIL; g.beginPath(); g.moveTo(-56, -190); g.bezierCurveTo(-70, -90, -60 + sw, -20, 10 + sw, 30); g.bezierCurveTo(60 + sw, 60, 96, 40, 92, 4);
  g.bezierCurveTo(88, -14, 70, -10, 74, 8); g.bezierCurveTo(70, 26, 40 + sw, 22, 22 + sw, 4); g.bezierCurveTo(-8, -30, 2, -110, 52, -190); g.closePath(); g.fill(); ink(4);
  g.strokeStyle = TAIL2; g.lineWidth = 5; g.beginPath(); g.moveTo(-34, -170); g.bezierCurveTo(-40, -90, -30 + sw, -20, 20 + sw, 14); g.stroke();      // the light along it
  arm(-14, -400, q, true);
  // the body: a starved ribcage, hunched forward over a waist that is hardly there
  g.fillStyle = BONE; g.beginPath(); g.moveTo(-52, -188); g.quadraticCurveTo(-80, -290, -58, -392); g.quadraticCurveTo(-30, -446, 40, -448); g.quadraticCurveTo(98, -430, 104, -372);
  g.quadraticCurveTo(102, -300, 76, -246); g.quadraticCurveTo(58, -210, 50, -188); g.closePath(); g.fill(); ink(4);
  g.fillStyle = SHADE; g.beginPath(); g.moveTo(-52, -188); g.quadraticCurveTo(-80, -290, -58, -392); g.quadraticCurveTo(-40, -300, -20, -190); g.closePath(); g.fill();      // her back, in shadow
  g.strokeStyle = 'rgba(40,34,52,.75)'; g.lineWidth = 3;
  for (let i = 0; i < 6; i++) { const y = -392 + i * 26; g.beginPath(); g.moveTo(34, y); g.quadraticCurveTo(80 - i * 3, y + 6, 98 - i * 6, y + 22); g.stroke(); }      // ribs
  g.beginPath(); g.moveTo(34, -400); g.lineTo(30, -250); g.stroke();                                                                                           // and the bone down her middle
  g.fillStyle = '#2a2430'; for (const [x, y, r] of [[-20, -205, 7], [6, -214, 5], [24, -200, 8], [-36, -226, 4], [40, -222, 4], [-6, -192, 5]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }      // the dark where she turns to tail
  // the neck, reaching forward
  g.fillStyle = BONE; g.beginPath(); g.moveTo(36, -444); g.quadraticCurveTo(84, -470, 128, -446); g.lineTo(130, -416); g.quadraticCurveTo(92, -430, 64, -412); g.closePath(); g.fill(); ink(3.5);
  // the tendrils off the back of her head, long and pale, swaying
  for (let i = 0; i < 9; i++) {
    const r0 = [92 + i * 5, -508 + i * 8], len = 230 + (i % 3) * 40, ph = T * 1.6 + i * .8;
    g.beginPath(); g.moveTo(r0[0], r0[1]);
    g.bezierCurveTo(r0[0] - 70, r0[1] - 30 + Math.sin(ph) * 16, r0[0] - len * .55, r0[1] + 30 + Math.cos(ph) * 22, r0[0] - len, r0[1] + 90 + i * 12 + Math.sin(ph * 1.3) * 26);
    g.strokeStyle = LINE; g.lineWidth = 16 - i * .6; g.stroke(); g.strokeStyle = i % 2 ? BONE : '#dcd8e2'; g.lineWidth = 11 - i * .6; g.stroke();
  }
  g.save(); g.translate(150, -405); g.rotate(.32);
  // the mouth, under the shell: all teeth, the jaw dropping as it opens
  const op = q.mouth || 0, jaw = 40 + op * 70;
  g.fillStyle = MAW; g.beginPath(); g.moveTo(-36, 18); g.quadraticCurveTo(0, 24, 40, 14); g.lineTo(44, 24 + jaw * .7); g.quadraticCurveTo(10, 36 + jaw, -30, 24 + jaw * .85); g.closePath(); g.fill(); ink(3.5);
  g.fillStyle = MAW2; g.beginPath(); g.ellipse(4, 30 + jaw * .5, 20, jaw * .32, 0, 0, TAU); g.fill();
  g.fillStyle = '#f4f0e8'; g.strokeStyle = LINE; g.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {                     // long thin teeth, down from the top and up from the jaw
    const x = -30 + i * 9.5, l = 20 + (i % 3) * 7 + op * 10, y1 = 24 + jaw * (.85 - .15 * (i / 7)) + (i < 4 ? 0 : -4);
    g.beginPath(); g.moveTo(x - 3.2, 18); g.lineTo(x + 3.2, 18); g.lineTo(x + .5, 18 + l); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x - 3, y1); g.lineTo(x + 3, y1); g.lineTo(x + .5, y1 - l * .8); g.closePath(); g.fill(); g.stroke();
  }
  // the head: a shell, ridged from the crown down to the brow, over where a face should be
  g.fillStyle = BONE; g.beginPath(); g.moveTo(-58, 20); g.quadraticCurveTo(-76, -60, -44, -104); g.quadraticCurveTo(-4, -134, 38, -110); g.quadraticCurveTo(66, -70, 50, 18); g.quadraticCurveTo(-4, 34, -58, 20); g.closePath(); g.fill(); ink(4);
  g.strokeStyle = SHADE; g.lineWidth = 3.2;
  for (let i = 0; i < 7; i++) { const x = -48 + i * 15; g.beginPath(); g.moveTo(-8 + (x + 8) * .2, -118); g.quadraticCurveTo(x * 1.05, -56, x, 20 - Math.abs(x - 0) * .1); g.stroke(); }
  g.strokeStyle = LINE; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-58, 20); g.quadraticCurveTo(-4, 34, 50, 18); g.stroke();
  g.restore();
  arm(66, -416, q, false);
  g.restore();
}
function arm(sx, sy, q, back) {                     // from the shoulder (sx, sy): thin, and long, reaching as far as q.arm says, raised by q.raise
  const reach = (q.arm || 0) - (back ? .2 : 0), raise = q.raise || 0, sway = Math.sin(E.T * 1.3 + (back ? 1 : 0)) * 6;
  const ex = sx + 56 + reach * 50, ey = sy + 130 - raise * 120 + sway, hx = sx + 106 + reach * 190, hy = sy + 262 - raise * 340, col = back ? BONE2 : BONE;
  g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.strokeStyle = LINE; g.lineWidth = 26; g.stroke(); g.strokeStyle = col; g.lineWidth = 19; g.stroke();
  g.beginPath(); g.moveTo(ex, ey); g.lineTo(hx, hy); g.strokeStyle = LINE; g.lineWidth = 22; g.stroke(); g.strokeStyle = col; g.lineWidth = 15; g.stroke();
  g.fillStyle = col; g.beginPath(); g.arc(ex, ey, 12, 0, TAU); g.fill(); g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();      // the elbow, a knot of bone
  claw(hx, hy, Math.atan2(hy - ey, hx - ex), col);
}
function claw(x, y, ang, col) {                     // a narrow hand, four long jointed fingers with hooked tips, and a thumb
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = col; g.beginPath(); g.ellipse(8, 0, 24, 15, 0, 0, TAU); g.fill(); g.lineWidth = 3.5; g.strokeStyle = LINE; g.stroke();
  for (let i = 0; i < 5; i++) {
    const th = i === 4, a0 = th ? 1 : -.48 + i * .3, L1 = th ? 28 : 46, L2 = th ? 24 : 50, b = th ? .3 : .22;
    const j = [26 + Math.cos(a0) * L1, Math.sin(a0) * L1 * 1.1], t = [j[0] + Math.cos(a0 + b) * L2, j[1] + Math.sin(a0 + b) * L2];
    g.beginPath(); g.moveTo(18, Math.sin(a0) * 8); g.lineTo(j[0], j[1]); g.lineTo(t[0], t[1]);
    g.strokeStyle = LINE; g.lineWidth = 10; g.stroke(); g.strokeStyle = col; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#2a1830'; g.beginPath(); g.moveTo(t[0] - 3, t[1] - 3); g.lineTo(t[0] + Math.cos(a0 + b + .5) * 16, t[1] + Math.sin(a0 + b + .5) * 16); g.lineTo(t[0] + 3, t[1] + 3); g.closePath(); g.fill();      // the hooked nail
  }
  g.restore();
}
// her hand, come down out of the dark onto them: u from 0 (out of sight above) to 1 (on them)
function slamHand(x, u, a) {
  const y = lerp(900, 120, Math.min(1, u) ** 2), c = F(x, y), k = c[2] * 1.25;
  g.save(); g.translate(c[0], c[1]); g.scale(k, k); g.globalAlpha = a;
  g.beginPath(); g.moveTo(0, -60); g.lineTo(-30, -900); g.strokeStyle = LINE; g.lineWidth = 32; g.stroke(); g.strokeStyle = BONE; g.lineWidth = 24; g.stroke();      // the arm, thin, up out of the picture
  claw(0, -10, Math.PI / 2, BONE);
  g.restore();
}
// the story's Rika (chapter 15) is this one too now
K.rika = (x, face, s, a) => drawRika(x, 30, ZP + 40, face, (s || 1) * .95, clamp(a, 0, 1), { arm: .6, raise: .1, mouth: .45 + .25 * Math.sin(E.T * 3) });
K.grip = (x, face, a) => {                          // her hands closed round whoever she has, from behind
  const al = clamp(a, 0, 1);
  if (al < .01) return;
  for (const y of [190, 125]) { const c = F(x + face * 18, y), k = c[2]; g.save(); g.translate(c[0], c[1]); g.scale(-face * k, k); g.globalAlpha = al; claw(-30, 0, 0, BONE); g.restore(); }
};

/* ================= what Rika is doing ================= */
const rk = { a: SEE, mode: 'katana', act: null, flare: 0 };      // how much of her shows; which moveset he is on; what she is doing ({ kind, t, x }); a moment of her shown, after a switch
function rikaPose(dt) {
  const T = E.T, A = rk.act;
  if (A) A.t += dt;
  let q = { arm: .25 + .05 * Math.sin(T * 1.7), raise: 0, mouth: .12 + .08 * Math.sin(T * .9) }, want = rk.flare > 0 ? .9 : SEE;
  if (A && A.kind === 'throw') {
    want = 1;
    const t = A.t;
    q = t < .32 ? { arm: lerp(.2, .55, t / .32), raise: .25, mouth: Math.min(1, t * 4) } : t < .5 ? { arm: 1.2, raise: .1, mouth: 1 } : { arm: .9, raise: 0, mouth: .7 };
  } else if (A && A.kind === 'slam') { want = 1; q = { arm: .6, raise: A.t < .14 ? .9 : .3, mouth: .9 }; }
  else if (A && A.kind === 'beam') { want = 1; q = { arm: .35 + .25 * Math.min(1, A.t), raise: .55, mouth: Math.min(1, A.t * 1.5) }; }
  rk.a += (want - rk.a) * (1 - Math.exp(-dt * (want > rk.a ? 12 : 3)));
  if (rk.flare > 0) rk.flare -= dt;
  return q;
}
function toggle(p) {
  rk.mode = rk.mode === 'katana' ? 'rika' : 'katana';
  rk.flare = .7; sfx.rika(0);
  E.fx.push({ k: 2, x: p.x, y: p.y + 400, n: rk.mode === 'rika' ? 'RIKA' : 'KATANA', col: LILAC, t: 0, life: 1 });
  V.ring(p.x - p.face * 125, p.y + 250, 300, LILAC, .35); V.sparks(p.x - p.face * 125, p.y + 300, 'purple', 10);
  labels();
}
// the hotbar: Cleaving Love's wait for whichever it is now, and under its name which one it is
let tag = null;
let sub = null;
function labels() {
  if (!on()) { if (tag) { tag.remove(); tag = null; } if (sub) { sub.remove(); sub = null; E.hud.mv.crush.classList.remove('twice'); } return; }
  if (!sub || !sub.isConnected) { sub = document.createElement('small'); sub.className = 'tsub'; sub.textContent = 'USE TWICE'; E.hud.mv.crush.appendChild(sub); }
  E.hud.mv.crush.classList.toggle('twice', !!rsWait);
  E.CD.strikes = rk.mode === 'rika' ? CD_RIKA : CD_KATANA;
  if (!tag || !tag.isConnected) { tag = document.createElement('small'); tag.className = 'cnt'; E.hud.mv.strikes.appendChild(tag); }
  const txt = rk.mode === 'rika' ? 'Rika' : 'Katana';
  if (tag.textContent !== txt) tag.textContent = txt;
}

/* ================= his strikes: the sword ================= */
Object.assign(POSE, {
  lrWindA: [0, 0, 2.7, .5, .3, -.35, 0],     lrCutA: [.38, .05, .95, .9, .6, -.5, 0],
  lrWindB: [.05, 0, .45, .35, .3, -.3, 0],   lrCutB: [.32, -.05, 2.3, .8, .55, -.5, 0],
  lrWindC: [-.2, 0, 3, 1.4, .3, -.35, 0],    lrCutC: [.55, .1, .85, 1.2, .9, -.7, 0],
  lrCrouch: [-.24, 0, .6, .3, .55, -.65, 0], lrThrust: [.55, -.12, 1.62, -.6, .9, -.9, 0]
});
const CUTS = [['lrWindA', 'lrCutA', 4], ['lrWindB', 'lrCutB', 4], ['lrWindA', 'lrCutA', 5], ['lrWindC', 'lrCutC', 7]].map(([pre, pose, dmg], i) =>
  Object.assign({}, M.m1[i], { pre, pose, kick: 0, lr: 1, sw: 'rgba(232,240,255,.95)', whoosh: () => sfx.cut(.7 + i * .15), hit: Object.assign({}, M.m1[i].hit, { dmg, reach: M.m1[i].hit.reach + 50, col: STEEL, mute: 1, yuta: i === 3 ? 1 : .7 }) }));      // (yuta: the katana clip's volume, H.hit)
function m1(i) {
  const p = E.P1;
  if (p.skin !== REAPER) return true;               // in somebody else's body: the ordinary strikes
  p.move = { def: CUTS[i], i, t: 0 };
  return false;
}

/* ================= 1 — Cleaving Love ================= */
const can = o => !o.ko && o.state !== 'down' && o.state !== 'up' && !(o.inv > 0) && !(o.alpha < 1);
// with the sword: in, and cut after cut, all round them
const CL_K = { name: 'Cleaving Love', cd: CD_KATANA, dur: 1.35, glow: 'purple', run(p, m, t) {
  const o = E.P2, f = p.face, gap = (o.x - p.x) * f, D = .085, hs = o.scale || 1;
  p.rate = 50;
  if (!m.s) { m.s = 1; sfx.charge(); shout(p, '純愛', LILAC); }
  if (t < .16) { p.target = POSE.dash; p.vx = gap > 170 ? f * 1700 : 0; return; }
  const n = Math.floor((t - .16) / D);
  if (n < BARRAGE) {
    p.vx = gap > 200 ? f * 300 : 0; p.target = n & 1 ? POSE.lrCutB : POSE.lrCutA;
    if (n !== m.n) {
      m.n = n;
      const last = n === BARRAGE - 1, x = o.x + rnd(-30, 30), y = o.y + 160 * hs + rnd(-60, 60);
      if (last) play('home-yuta-cut', 1, () => sfx.cut(1.6)); else sfx.cut(.7 + Math.random() * .3);
      V.slash(x, y, rnd(0, TAU), last ? 540 : rnd(260, 380), n % 3 ? STEEL : LILAC, last ? 14 : 7);
      if (E.tryHit(p, last ? { reach: 240, dmg: exact(o, BARRAGE_DMG), kb: 760, lift: 420, stun: .9, stop: .12, heavy: 1, col: LILAC, fixed: 1 }
                           : { reach: 240, dmg: exact(o, BARRAGE_DMG), kb: 30, stun: .5, stop: .02, col: STEEL, fixed: 1, mute: 1 })) {
        V.sparks(x, y, 'purple', last ? 14 : 3);
        if (last) { shake(20); E.zoomIn(.25); V.ring(o.x, o.y + 160 * hs, 280, LILAC, .3); if (Z) Z.flare(o.x, o.y + 160 * hs, LRGB, 360, .2); }
      }
    }
    return;
  }
  p.vx = 0; p.target = t < 1.15 ? POSE.lrCutC : POSE.idle;
} };
// with Rika: she throws him at them, the sword out in front
function cut1(p, o) {
  const f = p.face, hs = o.scale || 1, x = o.x, y = o.y + 165 * hs;
  E.applyHit(o, f, { dmg: exact(o, THROW[0]), kb: 120, stun: 1.1, stop: .2, heavy: 1, col: LILAC, fixed: 1, mute: 1 });
  sfx.cut(2); sfx.punch(4, .9); shake(26); E.zoomIn(.3);
  V.slash(x, y, f > 0 ? -.1 : Math.PI + .1, 640, LILAC, 18); V.slash(x, y + 10, f > 0 ? -.1 : Math.PI + .1, 680, '#ffffff', 6); V.sparks(x, y, 'purple', 16);
  if (Z) Z.flare(x, y, LRGB, 420, .2);
}
function slam(p, o) {                               // her hand: down onto them, and them into the floor
  const f = p.face, x = o.x;
  E.applyHit(o, f, { dmg: exact(o, THROW[1]), kb: 40, stun: 1, stop: .14, heavy: 1, col: BONE, fixed: 1, mute: 1 });
  if (!duel() && !o.poise && !o.ko) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 40), vy: -2400, vx: 0, bounced: true });
  sfx.slam(1.6); shake(34); V.crack(x, 360); V.rocks(x, 0, 18); V.ring(x, 40, 340, LILAC, .4); E.addDust(x); E.addRing(x, LRGB, 420);
  if (Z) { Z.boom(x, 40, 120, LRGB, { n: 16, smoke: '30,20,40', hot: '240,230,255' }); Z.shock(x, 500, LRGB, .5, 10); }
}
function cut2(p, o) {                               // and his again, on the way back up
  const f = p.face, hs = o.scale || 1, x = o.x, y = o.y + 120 * hs;
  p.x = clamp(o.x - f * 130, -965, 965);
  E.applyHit(o, f, { dmg: exact(o, THROW[2]), kb: 700, lift: 620, stun: .9, stop: .16, heavy: 1, col: LILAC, fixed: 1, mute: 1 });
  sfx.cut(2.2); shake(24); E.zoomIn(.4);
  V.slash(x, y, f > 0 ? -.9 : Math.PI + .9, 600, LILAC, 16); V.slash(x, y, f > 0 ? .7 : Math.PI - .7, 560, STEEL, 10, .05); V.sparks(x, y, 'purple', 14);
  if (Z) Z.flare(x, y, LRGB, 400, .2);
}
const trail = [];                                   // where he was a moment ago, flying
const CL_R = { name: 'Cleaving Love', cd: CD_RIKA, dur: 2.6, glow: 'purple', run(p, m, t) {
  const o = E.P2, f = p.face;
  if (!m.s) { m.s = 1; rk.act = { kind: 'throw', t: 0 }; sfx.rika(1); shout(p, '里香', LILAC); E.cd.strikes = CD_RIKA; }
  if (m.hit === undefined) {
    if (t < .32) { p.target = POSE.lrCrouch; p.vx = 0; return; }                      // she has him
    if (!m.go) { m.go = 1; m.x0 = p.x; sfx.whoosh(); sfx.cut(1.2); shake(10); E.addDust(p.x); }
    p.target = POSE.lrThrust; p.vx = f * 2600; p.vy = 0; p.ground = false; p.y = Math.max(p.y, 60);      // through the air, the sword out in front of him
    trail.push({ f: { skin: p.skin, x: p.x, y: p.y, z: p.z, face: p.face, spin: 1, scale: p.scale, pose: p.pose.slice() }, t: 0 }); if (trail.length > 10) trail.shift();
    const gap = (o.x - p.x) * f;
    if (gap > -40 && gap < 200 && can(o) && Math.abs(o.y - p.y) < 230) { m.hit = t; p.vx = 0; cut1(p, o); return; }
    if (t > .95 || Math.abs(p.x - m.x0) > 1150) { m.hit = -1; m.miss = t; p.vx *= .2; }      // nothing there: he comes down
    return;
  }
  if (m.hit < 0) { p.target = POSE.idle; if (t > m.miss + .45) E.endMove(p); return; }
  const s = t - m.hit;
  p.vx = 0;
  if (s < .7) { p.target = POSE.lrCutA; p.vy = Math.max(p.vy, 0); }
  if (s > .16 && !m.down) { m.down = 1; rk.act = { kind: 'slam', t: 0, x: o.x }; sfx.rika(0); }
  if (s > .32 && !m.slam) { m.slam = 1; slam(p, o); }
  if (s > .74 && !m.last) { m.last = 1; p.target = POSE.lrCutC; cut2(p, o); }
  if (s > .74) p.target = s < 1.05 ? POSE.lrCutC : POSE.idle;
  if (s > 1.25) E.endMove(p);
} };


/* ================= E (Build 0.16): PURE LOVE. Rika, all of her, and what she has in her let out of her mouth in one beam ================= */
const LOVE = 45, LOVE_CD = 22;
function mouth(p) {                                 // where her mouth is, on the screen (drawRika's head, and the mouth in it)
  const bob = Math.sin(E.T * 1.6) * 14, s = 1.08, wx = p.x - p.face * 125 + p.face * 142 * s, wy = p.y + 10 + bob + 363 * s;
  return P(wx, wy, ZP + 160);
}
const BEAM = { name: 'Pure Love', jp: '純愛', col: LILAC, cd: LOVE_CD, dur: 1.9, run(p, m, t) {
  const o = E.P2, f = p.face;
  p.vx = 0; p.target = t < 1.4 ? POSE.manjiWind : POSE.idle;      // (him still: this is all hers)
  if (!m.s) {
    m.s = 1; rk.act = { kind: 'beam', t: 0 }; sfx.rika(1); if (Z) Z.dim(.6, 1.4);
    V.custom(1, u => {                              // gathering in her mouth: a ball of it, growing, white at the heart
      const a = mouth(p), k = a[2], r = (30 + 120 * u * u) * k;
      lit(() => { E.glow(E.GLOW.purple, a[0], a[1], r * 5, .9); E.glow(E.GLOW.white, a[0], a[1], r * 1.6, .8); });
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(a[0], a[1], r * .45, 0, TAU); g.fill();
    }, .3);
  }
  if (t >= 1 && !m.fire) {
    m.fire = 1;
    const there = !o.ko && !(o.alpha < 1) && (o.x - p.x) * f > -60 && Math.abs(o.x - p.x) < 1500;
    sfx.blast(); sfx.cannon(2); shake(36); E.zoomIn(.5);
    if (Z) { Z.flash(LRGB, .4, .3); Z.flash('255,255,255', .3, .12); }
    const x1 = there ? o.x : p.x + f * 1500, y1 = there ? o.y + 160 * (o.scale || 1) : 120;
    V.custom(.6, u => {                             // the beam: purple, and white at its heart, from her mouth to whatever it meets
      const a = mouth(p), b = F(x1, y1), k = b[2], w = 110 * k * (u < .15 ? u / .15 : 1 - (u - .15) * .9), al = Math.min(1, (1 - u) * 2.2);
      g.save(); g.lineCap = 'round';
      lit(() => {
        g.strokeStyle = `rgba(${LRGB},${.35 * al})`; g.lineWidth = w * 2.6; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
        g.strokeStyle = `rgba(255,140,220,${.5 * al})`; g.lineWidth = w * 1.4; g.stroke();
        E.glow(E.GLOW.purple, a[0], a[1], 520 * k * al, al); E.glow(E.GLOW.purple, b[0], b[1], 640 * k * al, al);
      });
      g.globalAlpha = al; g.strokeStyle = '#ffffff'; g.lineWidth = w * .55; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.restore();
    });
    if (there) {
      E.applyHit(o, f, { dmg: exact(o, LOVE), kb: 1200, lift: 420, stun: .9, stop: .2, heavy: 1, col: LILAC, fixed: 1, mute: 1 });
      V.ring(x1, y1, 420, LILAC, .4); V.sparks(x1, y1, 'purple', 20); V.crack(o.x, 320);
      if (Z) Z.boom(x1, y1, 160, LRGB, { n: 24, smoke: '40,20,60', hot: '255,230,250' });
    }
  }
} };

/* ================= 2 (Build 0.17): REAPING SLASH. Used twice ================= */
const RS_DMG = [50, 90], RS_WAIT = 1.6, RS_HOLD = 4, RS_CD = 12;      // the cut, and the Black Flash; how long the second use waits; how long the finisher holds them; the wait after
let rsWait = null, fin = null;                      // { o, t }: the second use, waiting · the finisher holding them: { o, t, x, y, air }
const reachable = p => { const o = E.P2; return o && can(o) && Math.abs(o.x - p.x) < 1100 ? o : null; };
function blink(p, x, face) {                        // gone, a grey shape where he was, and there
  if (JU.evasive) JU.evasive.ghost(p, .35);
  V.ring(p.x, p.y + 160, 140, '#d6d6de', .25);
  p.x = clamp(x, -965, 965); p.face = face; p.vx = 0; p.dashT = 0;
  V.ring(p.x, p.y + 160, 190, LILAC, .25); E.addDust(p.x);
  play('home-yuta-tp', .9, () => sfx.whoosh());
}
const RS1 = { name: 'Reaping Slash', sub: 'USE TWICE', cd: RS_CD, dur: .6, glow: 'purple', run(p, m, t) {
  const o = m.o;
  p.rate = 50; p.vx = 0;
  if (!m.s) {
    m.s = 1; m.o = reachable(p);
    if (m.o) { const d = Math.sign(m.o.x - p.x) || p.face; blink(p, m.o.x + d * 130, -d); }      // behind them, turned round
    else blink(p, p.x + p.face * 420, p.face);
  }
  p.target = t < .07 ? POSE.lrWindB : t < .34 ? POSE.lrCutB : POSE.idle;
  if (t < .07 || m.cut) return;
  m.cut = 1;
  play('home-yuta-cut', 1, () => sfx.cut(1.6));
  const x = o ? o.x : p.x + p.face * 160, y = o ? o.y + 160 * (o.scale || 1) : p.y + 170;
  V.slash(x, y, p.face > 0 ? -.35 : Math.PI + .35, 560, LILAC, 14); V.slash(x, y + 8, p.face > 0 ? -.35 : Math.PI + .35, 600, '#ffffff', 5);
  if (!o || !can(o)) return;
  E.applyHit(o, p.face, { dmg: exact(o, RS_DMG[0]), kb: 200, stun: 1.2, stop: .12, heavy: 1, col: LILAC, fixed: 1, mute: 1 });
  V.sparks(x, y, 'purple', 12); shake(16);
  rsWait = { o, t: RS_WAIT };
  E.fx.push({ k: 2, x: p.x, y: p.y + 430, n: '2 · AGAIN', col: LILAC, t: 0, life: 1.2 });
} };
const KICK = E.POSE.kick, KWIND = E.POSE.kickWind;
const RS2 = { name: 'Reaping Slash', dur: RS_HOLD + 1.4, glow: 'purple', run(p, m, t) {
  const o = m.o;
  p.rate = 50; p.vx = 0;
  if (!m.s) { m.s = 1; m.o = rsWait ? rsWait.o : E.P2; rsWait = null; const d = Math.sign(m.o.x - p.x) || p.face; blink(p, m.o.x + d * 120, -d); p.inv = Math.max(p.inv || 0, RS_HOLD + 1.4); }
  if (!o) return;
  const kickAt = duel() ? .45 : .5 + RS_HOLD;
  if (t >= .06 && !m.bf) {                          // the Black Flash
    m.bf = 1;
    E.applyHit(o, p.face, duel() ? { dmg: exact(o, RS_DMG[1]), kb: 1800, lift: 520, stun: .9, stop: .25, heavy: 1, col: '#ff2440', fixed: 1, mute: 1 }
                                 : { dmg: exact(o, RS_DMG[1]), kb: 0, stun: RS_HOLD + 1, stop: .25, heavy: 1, col: '#ff2440', fixed: 1, mute: 1 });
    E.blackFlash(() => play('home-nanami-bf', 1, () => sfx.bf()));
    V.slash(o.x, o.y + 160, p.face > 0 ? .4 : Math.PI - .4, 700, '#ff2440', 18);
    if (!duel() && !o.ko) { fin = { o, t: 0, x: o.x, y: o.y, air: !o.ground }; E.after(2.3, () => { if (fin && fin.o === o) play('home-nanami-bf', .8, () => sfx.bf()); }); }      // (and it rings out again, while it holds them)
  }
  p.target = t < .06 ? POSE.lrWindC : t < .5 ? POSE.lrCutC : t < kickAt ? KWIND : t < kickAt + .35 ? KICK : POSE.idle;
  if (t >= kickAt && !m.kick) {                     // and the kick: clean across the arena
    m.kick = 1; fin = null;
    if (!duel() && !o.ko && !o.poise) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 30), vx: p.face * 2600, vy: 700, bounced: false, face: -p.face, flash: .1 });
    sfx.blast(); sfx.punch(4, 1.2); shake(40); E.zoomIn(.4);
    V.ring(o.x, o.y + 150, 380, '#ff2440', .35); V.sparks(o.x, o.y + 150, 'red', 18);
    if (Z) { Z.flash('255,36,64', .25, .15); Z.shock(o.x, 520, '255,36,64', .45, 10); }
  }
  if (t > kickAt + .5) E.endMove(p);
} };

const MOVES = {
  get strikes() { return rk.mode === 'rika' ? CL_R : CL_K; },
  crush: RS1,
  div: { name: 'Coming soon', cd: 1, dur: .01, run() {} },
  manji: { name: 'Coming soon', cd: 1, dur: .01, run() {} }
};

JU.tech.add('reaper', { name: 'Love Reaper', jp: '純愛', mark: '愛', who: 'Rika, and a katana', odds: 0, col: LILAC, glow: 'purple', moves: MOVES,
  early: true, skin: REAPER, as: ['Love Reaper', '純愛'], m1,
  hint: '<b>Right click</b> Rika\'s moves, or the sword\'s · <b>1</b> Cleaving Love · <b>2</b> Reaping Slash' });
const DEF = JU.tech.TECH.reaper, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
const press0 = H.press, tick0 = H.tick, fx0 = H.fx, under0 = H.under, reset0 = H.reset, start0 = H.fightStart;
H.press = (a, inScene) => {
  if (!inScene && on() && a === 'crush' && rsWait && !E.P1.dead) {      // Reaping Slash, the second time
    const p = E.P1;
    if (p.move) E.endMove(p);
    p.move = { def: RS2, key: 'crush', t: 0 }; E.hud.mv.crush.classList.add('act');
    return true;
  }
  if (!inScene && on() && E.root.dataset.mode === 'fight' && a === 'alt') {      // right click: her moveset, or the sword's
    const p = E.P1;
    if (!p.dead && !p.move && p.skin === REAPER) toggle(p);
    return true;
  }
  return press0 ? press0(a, inScene) : false;
};
let q = { arm: .25, raise: 0, mouth: .1 };
H.tick = dt => {
  tick0(dt);
  if (!on()) { if (tag || sub) labels(); rsWait = fin = null; return; }
  if (rsWait && ((rsWait.t -= dt) <= 0 || rsWait.o.ko || rsWait.o !== E.P2)) rsWait = null;
  if (fin) {                                        // the finisher: held where the Black Flash left them, the sparks of it still going
    const o = fin.o;
    fin.t += dt;
    if (o.ko || o !== E.P2) fin = null;
    else {
      Object.assign(o, { x: fin.x, y: fin.y, vx: 0, vy: 0, ground: !fin.air, state: 'hurt', stun: Math.max(o.stun || 0, 1), act: null, tele: 0 });
      if (o.ai) o.ai.t = Math.max(o.ai.t || 0, 1);
      if (Math.random() < dt * 9) { const y = o.y + rnd(80, 260); if (Z) Z.lightning(o.x + rnd(-90, 90), y, o.x + rnd(-160, 160), y + rnd(-120, 120), Math.random() < .5 ? '255,36,64' : '20,0,8', .16, 3, 2); V.sparks(o.x + rnd(-40, 40), y, 'red', 2); }
    }
  }
  labels();
  q = rikaPose(dt);
  const A = rk.act, p = E.P1;
  if (A && ((A.kind === 'throw' && !(p.move && p.move.def === CL_R)) || (A.kind === 'slam' && A.t > .9) || (A.kind === 'beam' && !(p.move && p.move.def === BEAM)))) rk.act = null;
  if (rk.a > .5 && Math.random() < dt * 20) V.puff('purple', p.x - p.face * 125 + rnd(-90, 90), p.y + rnd(20, 380), 0, rnd(60, 180), 40, .6);
};
H.under = dt => {
  under0(dt);
  for (let i = trail.length - 1; i >= 0; i--) {     // him through the air, a moment ago
    const s = trail[i];
    if ((s.t += dt) >= .22) { trail.splice(i, 1); continue; }
    E.drawFighter(E.over(s.f, TRAIL), .5 * (1 - s.t / .22));
  }
  for (const f of [E.P2, E.P1, ...(JU.raid ? JU.raid.allies() : [])]) {      // Rika, behind him (and behind the other one in a duel, or one in a raid with him, if that is who they are)
    if (f.skin !== REAPER || f.ko || (f.alpha !== undefined && f.alpha < .05)) continue;
    const mine = f === E.P1 && on(), bob = Math.sin(E.T * 1.6) * 14;
    drawRika(f.x - f.face * 125, f.y + 10 + bob, ZP + 160, f.face, 1.08, mine ? rk.a : SEE, mine ? q : { arm: .25, raise: 0, mouth: .12 });
  }
};
const TRAIL = E.flat('#5a3a8a', LILAC);
// while the finisher holds them: the world round the two of them grey and smeared, as if time had nearly stopped
const post0 = H.post;
H.post = dt => {
  if (post0) post0(dt);
  if (!fin || !on()) return;
  const o = fin.o, p = E.P1, c = F((o.x + p.x) / 2, (o.y + p.y) / 2 + 170), u = Math.min(1, fin.t * 3), VW = E.VW, VH = E.VH;
  const gr = g.createRadialGradient(c[0], c[1], 160 * c[2], c[0], c[1], Math.max(VW, VH) * .7);
  gr.addColorStop(0, 'rgba(90,90,100,0)'); gr.addColorStop(.35, `rgba(96,96,106,${.45 * u})`); gr.addColorStop(1, `rgba(70,70,80,${.82 * u})`);
  g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  g.save(); g.globalAlpha = .07 * u; g.fillStyle = '#e8e8ee';      // the smear: long faint streaks, drifting
  for (let i = 0; i < 14; i++) { const y = (i * 97 + fin.t * 30) % VH, x = ((i * 233 + fin.t * (40 + i * 6)) % (VW + 600)) - 300; g.fillRect(x, y, 300 + (i % 4) * 90, 3 + (i % 3) * 2); }
  g.restore();
};
H.fx = dt => {
  fx0(dt);
  const p = E.P1;
  for (const f of [E.P2, p, ...(JU.raid ? JU.raid.allies() : [])]) if (f.skin === REAPER && !(f.alpha < .05)) katana(f, f === p && p.move && (p.move.def === CL_K || p.move.def === CL_R));
  const A = rk.act;
  if (A && A.kind === 'slam' && on()) slamHand(A.x, A.t / .16, Math.min(1, (.9 - A.t) / .25));
};
const clear = () => { rk.act = null; rk.flare = 0; rk.a = SEE; trail.length = 0; rsWait = fin = null; };
const hit0 = H.hit;
H.hit = (o, face, h) => { hit0(o, face, h); if (h.yuta) play('home-yuta-cut', .5 * h.yuta, () => sfx.hit(!!h.heavy)); };      // (his strikes: a katana landing)
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) clear(); };

JU.reaper = { MOVES, CL_K, CL_R, RS1, RS2, REAPER, drawRika, esp: BEAM,      // (esp: E, especial.js)
  get finisher() { return fin && { t: +fin.t.toFixed(2) }; }, get waiting() { return !!rsWait; },
  get mode() { return rk.mode; }, set mode(v) { rk.mode = v === 'rika' ? 'rika' : 'katana'; labels(); }, get rika() { return { a: +rk.a.toFixed(2), act: rk.act && rk.act.kind }; } };
})();
