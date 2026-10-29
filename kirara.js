/* JUJUTSU UNLIMITEDS — limited time (Build 0.18): STAR-CROSSED. The third year who was away from school most of the year, at the side of
   somebody who likes to gamble: the 0.17 teaser's next limited character, and the user guessed right. Love Rendezvous: stars, the five of
   the Southern Cross, put on whatever it touches, and the order they come in decides what may come close to what.
   THE SOUTHERN CROSS (the gimmick). The Star-Crossed wears the last of the five, GINAN. Every blow that lands on whoever they are fighting
   puts the next star on them: ACRUX, then MIMOSA, then GACRUX, then IMAI.
     ACRUX, MIMOSA, GACRUX: the wrong order. Stars in the wrong order never meet: nothing closes the gap between the two of them. Walked
       into, it holds them apart; a blow thrown across it stops short. Only what is thrown or shot gets across, either way.
     IMAI, the star just before GINAN: they are drawn together. Whoever wears it slides in toward the Star-Crossed and cannot get away, and
       every blow on them lands harder (x1.3)
   1 SHOOTING STAR: a star flicked at them, across anything: 16, and the next star on them
   2 LOVE RENDEZVOUS: with IMAI on them, they are pulled all the way in and met with a spinning heel: 85, and thrown back out of order
     (ACRUX). In the wrong order, the two stars push apart: 30, a long way back, and the next star. With no star yet: in with an open palm, 25
   E SOUTHERN CROSS: the whole constellation over the arena. They are dragged through it in order with a blow at each star (12 x4), and
     into the last one, which is the Star-Crossed (36), and left wearing IMAI: Love Rendezvous next is the meeting
   3 and 4 are still to come (the user asked for two).
   A duel's other player is moved by their own game: there, nothing is pushed apart or pulled in and no blow stops short, but the stars,
   the hits and the harder hits on IMAI are the same. The sounds are built (sfx.star, twinkle and cross, in index.html) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, Z = JU.bossfx;
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const exact = (o, n) => n / (o.dr || 1);            // a hit worth the stated amount, whatever the target is made of
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);

const ENDS = Date.parse('2026-11-05T14:00:00Z');   // seven days from the day the Star-Crossed arrived (29 Oct 2026). Move this date to run it again
const PINK = '#ff7ac8', PRGB = '255,122,200', GOLD = '#ffe08a', GRGB = '255,224,138';
const STARS = [['ACRUX', 'α'], ['MIMOSA', 'β'], ['GACRUX', 'γ'], ['IMAI', 'δ'], ['GINAN', 'ε']];      // the order Love Rendezvous counts them in
const GAP = 250, PULL = 560, NEAR = 150, BONUS = 1.3;      // how far apart the wrong order keeps them; how fast IMAI is drawn in, and to how close; how much harder blows on IMAI land
const SHOT_V = 1500, SHOT_R = 1150;                 // Shooting Star: how fast, how far

// a glow of its own colour, for the sparks and the light at the feet
function mk(rgb) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.2, `rgba(${rgb},.85)`); gr.addColorStop(.5, `rgba(${rgb},.2)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return c;
}
if (!E.GLOW.pink) E.GLOW.pink = mk(PRGB);

/* ================= how the Star-Crossed looks: long dark hair with pink through it, the school's dark uniform to the ankles, stars ================= */
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.min(255, (n >> 16) * f) | 0},${Math.min(255, (n >> 8 & 255) * f) | 0},${Math.min(255, (n & 255) * f) | 0})`; };
function poly(fill, pts) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
}
const eye = (x, y, rx, ry) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); };
// a five-pointed star: where, its outer and inner radius, and how far it is turned
function starPath(x, y, R, r, rot = 0) {
  g.beginPath();
  for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5, d = i & 1 ? r : R; if (i) g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); else g.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d); }
  g.closePath();
}
const SKIN = ['#efd2bf', '#fbe3d3'], NAVY = ['#1b1c2c', '#292b42'], SKIRT = ['#17182a', '#23253b'], BOOT = ['#101017', '#1b1b25'], HAIR = '#1a1524', STREAK = '#ff8fd0';
const KIRARA = {
  torso: NAVY,
  armF: [NAVY[0], NAVY[1], SKIN[0], SKIN[1], .22], armB: [shade(NAVY[0], .62), shade(NAVY[1], .62), shade(SKIN[0], .78), shade(SKIN[1], .78), .22],
  legF: [SKIRT[0], SKIRT[1], BOOT[0], BOOT[1], .16], legB: [shade(SKIRT[0], .62), shade(SKIRT[1], .62), shade(BOOT[0], .62), shade(BOOT[1], .62), .16],
  chest() {
    g.fillStyle = '#111220'; g.fillRect(-30, -TOR, 60, 9);                          // the high collar
    g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(14, -TOR + 9, 2.5, TOR - 6);         // the seam down the front
    starPath(22, -TOR + 22, 6.5, 2.7, .2); g.fillStyle = STREAK; g.fill(); g.lineWidth = 1.2; g.strokeStyle = LINE; g.stroke();      // a pink star pinned under it
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-30, -9, 60, 3);
  },
  back() {                                          // the hair, long, down the back past the shoulders, pink running through it
    poly(HAIR, [-14, -TOR - 44, -32, -TOR - 20, -38, -TOR + 22, -33, -TOR + 58, -20, -TOR + 70, -10, -TOR + 52, -8, -TOR + 6, -4, -TOR - 30]);
    g.strokeStyle = 'rgba(255,143,208,.6)'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-25, -TOR - 18); g.quadraticCurveTo(-35, -TOR + 20, -24, -TOR + 60); g.stroke();
  },
  head() {
    poly(HAIR, [-30, 26, -33, -8, -27, -30, -10, -42, 10, -42, 26, -32, 29, -12, 28, 10, 22, 6, 14, 10, -18, 14, -22, 30]);      // all of it, behind
    E.headBase(SKIN[0], SKIN[1]);
    poly(HAIR, [-26, 2, -28, -24, -16, -37, 6, -39, 22, -32, 28, -16, 28, 0, 22, -10, 16, -2, 10, -12, 3, -3, -4, -12, -10, -2, -16, -10]);      // the fringe
    poly(STREAK, [15, -36, 21, -33, 24, -12, 20, -4, 18, -14]);      // and the pink in it, over one eye
    g.fillStyle = '#2a1430'; eye(5, 3, 2.6, 3.3); eye(17, 3, 2.2, 3.3);
    g.strokeStyle = LINE; g.lineWidth = 1.8; g.beginPath(); g.moveTo(1, -1); g.lineTo(9, -.5); g.moveTo(14, -.5); g.lineTo(21, -1); g.lineTo(24, -3); g.stroke();      // lashes, one with a flick at the end
    g.fillStyle = '#e0568f'; g.beginPath(); g.ellipse(13, 15, 3.8, 1.7, 0, 0, TAU); g.fill();
    starPath(-8, 17, 4, 1.7, .3); g.fillStyle = GOLD; g.fill(); g.lineWidth = 1; g.strokeStyle = LINE; g.stroke();      // and a little gold star on the cheek
  }
};
Object.assign(POSE, {
  kiWind: [-.1, 0, 2.6, .5, .3, -.3, 0],              // the hand back, a star in it
  kiFlick: [.25, -.05, 1.5, .3, .5, -.45, 0],         // and flicked at them
  kiReach: [-.05, -.12, 1.6, .9, .36, -.36, 0],       // a hand held out to them: come here
  kiPush: [.3, 0, 1.55, 1.45, .55, -.5, 0],           // both hands out, pushing
  kiRaise: [-.12, -.3, 3, .6, .35, -.35, 0]           // a hand up to the sky
});

/* ================= the stars on them ================= */
let mark = 0, markO = null, stampT = 0, pushT = 0, neverT = 0, crossS = null;      // which star they wear (0: none, 1 to 4: ACRUX to IMAI), on whom; the pop of a new one; the wall's sparkle; the Southern Cross going on
const shots = [];
const live = o => !!o && !o.ko && !(o.alpha < 1);
const wrong = o => o === markO && mark >= 1 && mark <= 3;
const drawn = o => o === markO && mark === 4;
function setMark(o, n) {
  if (markO !== o) { markO = o; mark = 0; }
  const was = mark;
  mark = clamp(n, 0, 4);
  if (mark && mark !== was) { stampT = .55; E.fx.push({ k: 2, x: o.x, y: o.y + 470 * (o.scale || 1), n: STARS[mark - 1][1] + ' ' + STARS[mark - 1][0], col: mark === 4 ? PINK : GOLD, t: 0, life: 1 }); }
}
function advance(o) { if (markO !== o) { markO = o; mark = 0; } if (mark < 4) { setMark(o, mark + 1); sfx.star(mark - 1); } }
// a handful of little stars thrown out of a point
function burstAt(x, y, s = 1) {
  V.sparks(x, y, 'pink', Math.round(8 * s)); V.sparks(x, y, 'gold', Math.round(5 * s));
  const bits = Array.from({ length: Math.round(9 * s) }, () => { const a = rnd(0, TAU), v = rnd(200, 700) * s; return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v + 200, r: rnd(0, TAU), vr: rnd(-9, 9), z: rnd(7, 15) * s, c: Math.random() < .5 ? PINK : GOLD }; });
  V.custom(.7, (u, dt) => {
    for (const b of bits) {
      b.vy -= 900 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.r += b.vr * dt;
      const c = F(b.x, b.y), k = c[2];
      g.globalAlpha = 1 - u; starPath(c[0], c[1], b.z * k, b.z * .42 * k, b.r); g.fillStyle = b.c; g.fill();
    }
    g.globalAlpha = 1;
  });
}

/* ================= 1 — Shooting Star ================= */
const SHOOT = { name: 'Shooting Star', cd: 1.8, dur: .42, run(p, m, t) {
  p.vx = 0; p.rate = 36; p.target = t < .12 ? POSE.kiWind : t < .3 ? POSE.kiFlick : POSE.idle;
  if (!m.s && t > .1) { m.s = 1; shots.push({ x: p.x + p.face * 80, y: p.y + 250, vx: p.face * SHOT_V, t: 0, rot: 0, trail: [] }); sfx.twinkle(); sfx.whoosh(); }
} };
function flyShots(dt) {
  const o = E.P2;
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    s.t += dt; s.x += s.vx * dt; s.rot += dt * 16;
    s.trail.push([s.x, s.y]); if (s.trail.length > 12) s.trail.shift();
    const hs = o ? o.scale || 1 : 1;
    if (live(o) && !(o.inv > 0) && o.state !== 'down' && o.state !== 'up' && Math.abs(o.x - s.x) < 70 * hs && s.y > o.y && s.y < o.y + 380 * hs) {
      E.applyHit(o, s.vx > 0 ? 1 : -1, { dmg: exact(o, 16), kb: 180, stun: .45, stop: .06, col: PINK, fixed: 1, mute: 1 });      // (it lands: H.hit puts the next star on them)
      burstAt(s.x, s.y, .7); sfx.hit(false);
      shots.splice(i, 1); continue;
    }
    if (s.t * SHOT_V > SHOT_R || Math.abs(s.x) > 1000) shots.splice(i, 1);
  }
}
function drawShots() {
  for (const s of shots) {
    lit(() => {
      s.trail.forEach((q, i) => { const c = F(q[0], q[1]), u = (i + 1) / s.trail.length; E.glow(E.GLOW.pink, c[0], c[1], 70 * c[2] * u, .5 * u); });
      const c = F(s.x, s.y); E.glow(E.GLOW.gold, c[0], c[1], 120 * c[2], .9);
    });
    const c = F(s.x, s.y), k = c[2];
    starPath(c[0], c[1], 22 * k, 9 * k, s.rot); g.fillStyle = '#fff6d8'; g.fill(); g.lineWidth = 2.5 * k; g.strokeStyle = PINK; g.stroke();
  }
}

/* ================= 2 — Love Rendezvous ================= */
const MEET = { name: 'Love Rendezvous', cd: 7, dur: 1.05, run(p, m, t) {
  if (!m.kind) {
    const o = E.P2;
    m.o = live(o) ? o : null;
    m.kind = !m.o ? 'palm' : drawn(m.o) ? 'meet' : wrong(m.o) ? 'repel' : 'palm';
    if (m.kind === 'meet') { m.x0 = m.o.x; sfx.cross(); E.zoomIn(.7); }
  }
  if (m.kind === 'meet') meet(p, m, t); else if (m.kind === 'repel') repel(p, m, t); else palm(p, m, t);
} };
function meet(p, m, t) {                            // IMAI on them: come here, all the way
  const o = m.o, f = p.face;
  p.vx = 0; p.rate = 34;
  if (t < .14) { p.target = POSE.kiReach; return; }
  if (t < .42) {
    p.target = POSE.kiReach;
    if (!o.ko && !duel() && !o.net) { o.x = lerp(m.x0, clamp(p.x + f * 120, -960, 960), ease(Math.min(1, (t - .14) / .28))); o.vx = 0; Object.assign(o, { state: 'hurt', stun: .6, act: null, tele: 0 }); }
    if (Math.random() < .8) V.mote(o.x, o.y + 170, 'pink');
    return;
  }
  if (t < .56) { p.target = POSE.manjiWind; p.spin = Math.cos((t - .42) / .14 * TAU); p.rate = 30; return; }      // round once
  p.spin = 1; p.target = t < .8 ? POSE.manji : POSE.idle; p.rate = 46;
  if (m.done) return;
  m.done = 1;
  if (duel()) p.x = clamp(o.x - f * 120, -960, 960);      // (a duel's other player stays where they are: the heel goes to them)
  if (o.ko) return;
  E.applyHit(o, f, { dmg: exact(o, 85), kb: 900, lift: 700, stun: .9, stop: .3, heavy: 1, col: PINK, fixed: 1, mute: 1, nostar: 1 });
  setMark(o, 1);                                    // and out of order again
  burstAt(o.x, o.y + 180, 1.3); sfx.bf(); sfx.star(4); shake(30); E.zoomIn(.4);
  E.fx.push({ k: 2, x: o.x, y: o.y + 520, n: 'RENDEZVOUS', col: PINK, t: 0, life: 1.4 });
  if (Z) { Z.flash(PRGB, .3, .25); Z.shock(o.x, 620, PRGB, .45, 10); }
}
function repel(p, m, t) {                           // the wrong order: the two stars push apart
  const o = m.o;
  p.vx = 0; p.rate = 30; p.target = t < .5 ? POSE.kiPush : POSE.idle;
  if (t > .7) { E.endMove(p); return; }
  if (t < .12 || m.done) return;
  m.done = 1;
  if (o.ko) return;
  const mx = (p.x + o.x) / 2;
  E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: exact(o, 30), kb: 1300, lift: 320, stun: .7, stop: .14, heavy: 1, col: GOLD, fixed: 1, mute: 1 });      // (H.hit: the next star)
  sfx.blast(); shake(18); V.ring(mx, 200, 380, PINK, .4); burstAt(mx, 200, .8);
  E.fx.push({ k: 2, x: mx, y: 440, n: 'NEVER MEET', col: '#ffd2ec', t: 0, life: 1.3 });
  if (Z) Z.shock(mx, 600, PRGB, .4, 10);
}
function palm(p, m, t) {                            // no star on them yet: in, with an open palm
  p.rate = 34;
  if (t < .1) { p.target = POSE.kiWind; p.vx = 0; return; }
  p.target = t < .45 ? POSE.kiPush : POSE.idle; p.vx = t < .3 ? p.face * 1100 : 0;
  if (!m.done && t < .34 && live(E.P2) && E.tryHit(p, { reach: 200, dmg: exact(E.P2, 25), kb: 520, lift: 260, stun: .7, stop: .1, heavy: 1, col: PINK, fixed: 1, mute: 1 })) {
    m.done = 1; sfx.hit(true); burstAt(E.P2.x, E.P2.y + 170, .7);
  }
  if (t > .75) E.endMove(p);
}

/* ================= E — Southern Cross ================= */
const STEP = .34, AT0 = .35, FIN = AT0 + STEP * 4 + .02;      // a star every third of a second, and then the last one
const CROSS = { name: 'Southern Cross', jp: '南十字', col: PINK, cd: 20, dur: 2.6, run(p, m, t) {
  p.vx = 0; p.rate = 20; p.target = t < 2.1 ? POSE.kiRaise : POSE.idle;
  if (!m.set) {
    m.set = 1;
    const o = E.P2;
    m.o = live(o) ? o : null;
    const cx = clamp(m.o ? m.o.x : p.x + p.face * 420, -680, 680);
    // the cross round where they stand: ACRUX at its foot, MIMOSA one end of the arm, GACRUX at its head, IMAI the other end of the arm
    m.pts = [[cx, 170], [cx - 270, 360], [cx, 540], [cx + 240, 380]];
    m.drag = !!m.o && !duel() && !m.o.net && !m.o.poise;
    m.lit = 0; crossS = m;
    sfx.cross(); if (Z) Z.dim(.55, 2.4);
  }
  const o = m.o;
  for (let i = 0; i < 4; i++) {                     // one star after another, a blow at each
    if (t < AT0 + i * STEP || m['s' + i]) continue;
    m['s' + i] = 1; m.lit = i + 1;
    sfx.star(i);
    if (!o || o.ko) continue;
    if (m.drag) Object.assign(o, { x: m.pts[i][0], y: m.pts[i][1] - 170, vx: 0, vy: 0, ground: false, state: 'air' });
    E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: exact(o, 12), kb: 0, stun: .8, stop: .06, col: GOLD, fixed: 1, mute: 1, nostar: 1 });
    setMark(o, i + 1);
    burstAt(o.x, o.y + 170, .6); shake(10 + i * 3);
  }
  if (m.drag && o && !o.ko && t > AT0 && t < FIN) {     // and flown along the line from each to the next
    const seg = Math.min(3, Math.floor((t - AT0) / STEP)), u = ease(clamp((t - AT0 - seg * STEP) / .2, 0, 1)), a = m.pts[seg], b = m.pts[Math.min(3, seg + 1)];
    o.x = lerp(a[0], b[0], seg < 3 ? u : 0); o.y = lerp(a[1], b[1], seg < 3 ? u : 0) - 170; o.vx = o.vy = 0; o.ground = false; o.state = 'air';
  }
  if (t > FIN && !m.fin) {                          // and into GINAN, the last of them, which is the Star-Crossed
    m.fin = 1; m.lit = 5;
    if (o && !o.ko) {
      if (m.drag) { o.x = clamp(p.x + p.face * 140, -960, 960); o.y = 240; }
      E.applyHit(o, p.face, { dmg: exact(o, 36), kb: 300, stun: 1, stop: .3, heavy: 1, col: PINK, fixed: 1, mute: 1, nostar: 1 });
      if (m.drag && !o.ko) Object.assign(o, { ground: false, state: 'air', vy: -1800, vx: p.face * 120, bounced: true });      // and down
      setMark(o, 4);
      sfx.star(4); sfx.bf(); shake(32); burstAt(o.x, o.y + 160, 1.3);
      if (Z) { Z.flash(PRGB, .35, .3); Z.shock(o.x, 700, PRGB, .5, 12); }
    }
  }
  if (t > 2.45) crossS = null;
} };

/* ================= the Southern Cross's rules, every moment ================= */
function never() {                                  // a blow thrown across the wrong order: it stops short, and says so
  const p = E.P1, o = E.P2, mx = (p.x + o.x) / 2;
  burstAt(mx, 200, .5); sfx.star(0);
  if (neverT <= 0) { neverT = 1; E.fx.push({ k: 2, x: mx, y: 420, n: 'NEVER MEET', col: '#ffd2ec', t: 0, life: 1 }); }
}
function rules(dt) {
  const p = E.P1, o = markO;
  if (stampT > 0) stampT -= dt;
  if (neverT > 0) neverT -= dt;
  if (markO && (!live(markO) || (markO !== E.P2 && !(H.foes && H.foes())))) { markO = null; mark = 0; }
  if (!markO || !mark || duel() || crossS || o.net || p.dead) return;
  const dx = o.x - p.x, d = Math.abs(dx), s = dx >= 0 ? 1 : -1;
  if (mark <= 3 && d < GAP && o.state !== 'down' && o.state !== 'up') {      // never meet: whoever is not against a wall is the one moved
    const ox = clamp(p.x + s * GAP, -960, 960);
    if (Math.abs(ox - p.x) >= GAP - 1) o.x = ox; else p.x = clamp(o.x - s * GAP, -960, 960);
    if ((pushT -= dt) <= 0) { pushT = .35; const mx = (p.x + o.x) / 2; burstAt(mx, rnd(120, 300), .35); }
  }
  if (mark === 4 && d > NEAR && o.ground && (o.state === 'idle' || o.state === 'act' || o.state === 'hurt')) {      // drawn in
    o.x -= s * Math.min(PULL * dt, d - NEAR);
    if (Math.random() < dt * 30) V.mote(o.x, o.y + 170, 'pink');
  }
}

/* ================= drawing it: the star each of them wears, the line between them, the constellation ================= */
function badge(f, n, pop) {                         // a star over somebody's head, and its name
  const hs = f.scale || 1, c = F(f.x, f.y + 395 * hs), k = c[2], s = 1 + .5 * Math.max(0, pop) / .55, col = n >= 4 ? PINK : GOLD;
  lit(() => E.glow(E.GLOW[n >= 4 ? 'pink' : 'gold'], c[0], c[1], 110 * k * s, .6 + .15 * Math.sin(E.T * 5)));
  starPath(c[0], c[1], 22 * k * s, 9.5 * k * s, Math.sin(E.T * 2) * .15); g.fillStyle = n === 5 ? '#ffd7ee' : '#fff6d8'; g.fill(); g.lineWidth = 2.5 * k; g.strokeStyle = col; g.stroke();
  g.font = `${Math.max(10, Math.round(19 * k))}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'top';
  const txt = STARS[n - 1][1] + ' ' + STARS[n - 1][0];
  g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.8)'; g.strokeText(txt, c[0], c[1] + 25 * k); g.fillStyle = col; g.fillText(txt, c[0], c[1] + 25 * k);
  return c;
}
function drawRules() {
  const p = E.P1, o = markO;
  const a = badge(p, 5, 0);
  if (!live(o) || !mark) return;
  const b = badge(o, mark, stampT), k = a[2];
  if (mark <= 3) {                                  // the wrong order: a broken line, and a cross where they would have met
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    g.save(); g.setLineDash([10 * k, 10 * k]); g.strokeStyle = 'rgba(255,214,236,.7)'; g.lineWidth = 3 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.restore();
    g.strokeStyle = 'rgba(255,70,130,.95)'; g.lineWidth = 5 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(mx - 13 * k, my - 13 * k); g.lineTo(mx + 13 * k, my + 13 * k); g.moveTo(mx + 13 * k, my - 13 * k); g.lineTo(mx - 13 * k, my + 13 * k); g.stroke(); g.lineCap = 'butt';
  } else {                                          // drawn together: a line that shines, and light running along it
    lit(() => {
      g.strokeStyle = `rgba(${PRGB},.8)`; g.lineWidth = 3 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      for (let i = 0; i < 4; i++) { const u = (E.T * .9 + i / 4) % 1; E.glow(E.GLOW.pink, lerp(b[0], a[0], u), lerp(b[1], a[1], u), 46 * k, .8); }
    });
  }
}
function drawCross() {
  const m = crossS;
  if (!m) return;
  const p = E.P1, u = clamp(m.t / .3, 0, 1);
  const pts = m.pts.map(q => F(q[0], q[1])), me = F(p.x, p.y + 230);
  const line = (i, j, on) => { const A = i === 4 ? me : pts[i], B = j === 4 ? me : pts[j]; g.strokeStyle = on ? `rgba(${PRGB},.95)` : 'rgba(255,240,250,.3)'; g.lineWidth = (on ? 7 : 3) * A[2]; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke(); };
  g.save(); g.globalAlpha = u * (m.t > 2.1 ? Math.max(0, (2.45 - m.t) / .35) : 1);
  lit(() => { line(0, 2, m.lit >= 3); line(1, 3, m.lit >= 4); line(3, 4, m.lit >= 5); });      // the long bar of the cross, the short one, and on to the last
  for (let i = 0; i < 4; i++) {
    const c = pts[i], k = c[2], on = m.lit > i, R = (on ? 54 : 38) * k;
    lit(() => E.glow(E.GLOW[on ? 'pink' : 'gold'], c[0], c[1], R * 5, on ? .9 : .45));
    starPath(c[0], c[1], R, R * .42, 0); g.fillStyle = on ? '#fff' : '#fff6d8'; g.fill();
    g.font = `${Math.max(10, Math.round(22 * k))}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'top';
    g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.7)'; g.strokeText(STARS[i][1] + ' ' + STARS[i][0], c[0], c[1] + R + 6 * k);
    g.fillStyle = on ? PINK : 'rgba(255,240,250,.85)'; g.fillText(STARS[i][1] + ' ' + STARS[i][0], c[0], c[1] + R + 6 * k);
  }
  g.restore();
}

/* ================= the technique ================= */
const SOON = { name: 'Coming soon', cd: 1, dur: .01, run() {} };
const MOVES = { strikes: SHOOT, crush: MEET, div: SOON, manji: SOON };
JU.tech.add('kirara', { name: 'Star-Crossed', jp: '星間飛行', mark: '星', who: 'Love Rendezvous', odds: 2.5, col: PINK, glow: 'pink', moves: MOVES,
  limited: ENDS, skin: KIRARA, as: ['Star-Crossed', '星'],
  hint: '<b>1</b> Shooting Star · <b>2</b> Love Rendezvous · <b>E</b> Southern Cross · every hit puts the next star on them: the wrong order never meet, <b>IMAI</b> is drawn in' });
const DEF = JU.tech.TECH.kirara, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
const hit0 = H.hit, guard0 = H.guard, pow0 = H.power, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
H.hit = (o, face, h) => {                           // a blow of the Star-Crossed's that lands: the next star on them
  hit0(o, face, h);
  if (!on() || h.nostar || o.ko) return;
  advance(o);
  const m = E.P1.move;
  if (m && m.def.m1) burstAt(o.x - face * 20, o.y + 160 * (o.scale || 1), .35);
};
H.guard = (face, a, mul) => {
  if (guard0 && guard0(face, a, mul)) return true;
  if (!on() || E.P1.dead || duel() || (a && a.shot) || !wrong(E.P2)) return false;
  never();                                          // thrown across the wrong order: it stops short
  return true;
};
H.power = (h, o) => (pow0 ? pow0(h, o) : 1) * (on() && drawn(o) ? BONUS : 1);
H.tick = dt => {
  tick0(dt);
  if (!on()) { if (shots.length) shots.length = 0; markO = null; mark = 0; crossS = null; return; }
  if (shots.length) flyShots(dt);
  rules(dt);
};
H.fx = dt => {
  fx0(dt);
  if (!on()) return;
  drawCross(); drawShots(); drawRules();
};
const clear = () => { mark = 0; markO = null; shots.length = 0; crossS = null; stampT = pushT = neverT = 0; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); clear(); };

JU.kirara = { SKIN: KIRARA, MOVES, esp: CROSS, ENDS, STARS,      // (esp: E, especial.js)
  get state() { return { mark, star: mark ? STARS[mark - 1][0] : null, on: markO === E.P2, shots: shots.length, cross: crossS ? +crossS.t.toFixed(2) : null }; },
  set(n) { setMark(E.P2, n); } };
})();
