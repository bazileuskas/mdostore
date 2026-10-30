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
   3 STAR STAMP (Build 0.19; the user: "make it so you can add stars with one of the moves"): a star flicked up and pinned in the sky over a
     spot in front, three at most. A pinned star is the next one in the order for whoever they are fighting, so it draws them to it (stars in
     order meet): pulled along the floor until they are under it, and then it comes down on them, 14 and the next star on them. It stays
     pinned there after, met, for 4 to fly through. While they wear IMAI the pinned stars wait, dim: that one belongs to GINAN
   4 INTERSTELLAR FLIGHT (0.19; 星間飛行 is the technique's own name): a streak of light from star to star. Through them, out to the first
     pinned star, back through them, out to the next, and so on, a blow every time through (15, the last 25) and the next star with each;
     the pinned stars go out as they are flown through. With none pinned, one is flicked up behind them first
   G FEVER (Build 0.20v1, the awakening): see its own part below. The user asked for it with thought and speech bubbles and real music from
     the anime behind it
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
sfx.preload(['home-kirara-awk']);              // (the fever's music: Build 0.20v1)

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
  kiRaise: [-.12, -.3, 3, .6, .35, -.35, 0],          // a hand up to the sky
  kiFly: [0, -.25, 2.95, 2.75, .2, -.12, 1.25],       // flying, arms out ahead, flat out along the line (Interstellar Flight)
  kiLand: [-.2, .1, 2.2, 1.2, .55, -.6, 0]            // and down again, arms still open
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
  if (!m.s && t > .1) {
    m.s = 1;
    const n = fevOn() ? 3 : 1;                       // (three of them in the fever)
    for (let i = 0; i < n; i++) shots.push({ x: p.x + p.face * 80, y: p.y + 250 + (i - (n - 1) / 2) * 80, vx: p.face * SHOT_V, t: 0, rot: 0, trail: [] });
    sfx.twinkle(); sfx.whoosh();
  }
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
  E.applyHit(o, f, { dmg: exact(o, fevOn() ? FEV_MEET : 85), kb: 900, lift: 700, stun: .9, stop: .3, heavy: 1, col: PINK, fixed: 1, mute: 1, nostar: 1 });
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

/* ================= 3 — Star Stamp (Build 0.19) ================= */
const PIN_MAX = 3, PIN_LIFE = 15, PIN_PULL = 620, PIN_R = 80, PIN_DMG = 14, PIN_AHEAD = 330, PIN_Y = [330, 470, 250];      // how many, how long each lasts, how fast it draws them, how close is touching, the blow; where it goes, how high
const pins = [];                                    // { x, y, t, pop, fly, met }: a star pinned in the sky over a spot on the floor (met: the star it gave them)
let pinN = 0, pinCool = 0;                          // how many have been pinned (for the heights); a moment after one comes down before the next may draw them
const awake = o => live(o) && !(o === markO && mark >= 4);      // (a pinned star waits while they wear IMAI: that one is GINAN's)
const nextName = o => STARS[Math.min(3, o === markO ? mark : 0)];      // the star a pinned one would put on them
const STAMP = { name: 'Star Stamp', cd: 1.6, dur: .5, run(p, m, t) {
  p.vx = 0; p.rate = 36; p.target = t < .14 ? POSE.kiWind : t < .4 ? POSE.kiRaise : POSE.idle;
  if (m.s || t < .14) return;
  m.s = 1;
  const x = clamp(p.x + p.face * PIN_AHEAD, -930, 930), y = PIN_Y[pinN % PIN_Y.length], w = E.hand(p, true);
  pinN++;
  if (pins.length >= PIN_MAX) { const old = pins.shift(); burstAt(old.x, old.y, .5); }      // (the oldest goes out to make room)
  pins.push({ x, y, t: 0, pop: .5, fly: { x0: w[0], y0: w[1], u: 0 } });
  sfx.twinkle(); sfx.star(pins.length - 1);
} };
function pinsTick(dt) {
  const p = E.P1, o = E.P2;
  if (pinCool > 0) pinCool -= dt;
  for (let i = pins.length - 1; i >= 0; i--) {
    const q = pins[i];
    q.t += dt; if (q.pop > 0) q.pop -= dt;
    if (q.fly) { q.fly.u += dt / .22; if (q.fly.u >= 1) { q.fly = null; burstAt(q.x, q.y, .6); } }
    if (q.t > PIN_LIFE) { burstAt(q.x, q.y, .4); pins.splice(i, 1); }
  }
  if (!pins.length || !awake(o) || crossS || flight || p.dead || pinCool > 0) return;
  const q = pins.filter(q => !q.fly && !q.met).sort((a, b) => Math.abs(a.x - o.x) - Math.abs(b.x - o.x))[0];
  if (!q) return;
  const d = q.x - o.x, held = !duel() && !o.net && Math.abs(o.x - p.x) <= GAP + 6 && (q.x - p.x) * (o.x - p.x) > 0 && Math.abs(q.x - p.x) < GAP;      // (on their side, but inside the wall: they meet it at the wall)
  if (Math.abs(d) < PIN_R || held) { meetPin(o, q); return; }
  if (duel() || o.net || !o.ground || !(o.state === 'idle' || o.state === 'act' || o.state === 'hurt')) return;
  o.x += Math.sign(d) * Math.min(PIN_PULL * dt, Math.abs(d));      // in order: drawn to it along the floor
  if (Math.random() < dt * 30) V.mote(o.x, o.y + 170, 'gold');
}
function meetPin(o, q) {                            // the pinned star comes down on them: the next star, and a blow; it stays up there, met
  pinCool = .55; q.pop = .5;
  const hs = o.scale || 1, x = o.x, y = o.y + 170 * hs;
  E.applyHit(o, x >= E.P1.x ? 1 : -1, { dmg: exact(o, PIN_DMG), kb: 260, lift: 340, stun: .6, stop: .08, col: GOLD, fixed: 1, mute: 1, nostar: 1 });
  advance(o); q.met = STARS[mark - 1];
  burstAt(x, y, 1); shake(14); sfx.hit(true);
  V.custom(.35, u => {                              // a line of light down out of where it hung, onto them
    const a = F(q.x, q.y), b = F(x, y), k = b[2];
    lit(() => { g.strokeStyle = `rgba(${GRGB},${1 - u})`; g.lineWidth = (18 - 14 * u) * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); E.glow(E.GLOW.gold, b[0], b[1], 260 * k * (1 - u), .9); });
  });
}
function drawPins() {
  const o = E.P2, on2 = awake(o);
  for (const q of pins) {
    let x = q.x, y = q.y;
    if (q.fly) { const u = ease(q.fly.u); x = lerp(q.fly.x0, q.x, u); y = lerp(q.fly.y0, q.y, u) + Math.sin(u * Math.PI) * 120; }
    const c = F(x, y), k = c[2], fade = Math.min(1, (PIN_LIFE - q.t) / 1), al = (q.met ? .75 : on2 ? 1 : .45) * fade, R = ((q.met ? 20 : 26) + 14 * Math.max(0, q.pop) / .5) * k;
    if (!q.fly && !q.met) {                         // a thread of light down to the spot on the floor it watches
      const f0 = F(q.x, 0), col = on2 ? PINK : '#d8cbe0';
      g.save(); g.globalAlpha = .35 * al; g.setLineDash([6 * k, 9 * k]); g.strokeStyle = col; g.lineWidth = 2.5 * k; g.beginPath(); g.moveTo(c[0], c[1] + R); g.lineTo(f0[0], f0[1]); g.stroke(); g.restore();
      g.save(); g.globalAlpha = .5 * al; g.strokeStyle = col; g.lineWidth = 3 * k; g.beginPath(); g.ellipse(f0[0], f0[1], 46 * k, 11 * k, 0, 0, TAU); g.stroke(); g.restore();
      if (on2 && live(o) && !duel() && Math.abs(o.x - q.x) > PIN_R) {      // and, drawing them in: light along the floor from them to it
        const a = F(o.x, 20);
        lit(() => { for (let i = 0; i < 3; i++) { const u = (E.T * 1.4 + i / 3) % 1; E.glow(E.GLOW.gold, lerp(a[0], f0[0], u), lerp(a[1], f0[1], u), 40 * k, .7 * al); } });
      }
    }
    lit(() => E.glow(E.GLOW[on2 && !q.met ? 'pink' : 'gold'], c[0], c[1], R * 4.5, (.55 + .2 * Math.sin(E.T * 6 + q.x)) * al));
    g.save(); g.globalAlpha = al;
    starPath(c[0], c[1], R, R * .42, q.t * 1.2); g.fillStyle = '#fff6d8'; g.fill(); g.lineWidth = 2.5 * k; g.strokeStyle = on2 && !q.met ? PINK : GOLD; g.stroke();
    if (!q.fly && (q.met || live(o))) {
      const nm = q.met || nextName(o), txt = q.met || on2 ? nm[1] + ' ' + nm[0] : 'WAITING';
      g.font = `${Math.max(10, Math.round(17 * k))}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'top';
      g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.75)'; g.strokeText(txt, c[0], c[1] + R + 4 * k); g.fillStyle = q.met ? GOLD : on2 ? '#ffe3f3' : '#cfc6d6'; g.fillText(txt, c[0], c[1] + R + 4 * k);
    }
    g.restore();
  }
}

/* ================= 4 — Interstellar Flight (Build 0.19) ================= */
const FLY_V = 2800, FLY_DMG = 15, FLY_LAST = 25;    // how fast the streak goes; each time through them, and the last
let flight = null;                                  // the flight under way: { o, legs, i, from, u, len, trail, lines, hits }
const FLIGHT = { name: 'Interstellar Flight', cd: 10, dur: 6, run(p, m, t) {
  if (!m.set) {
    m.set = 1;
    const o = E.P2, there = live(o) && Math.abs(o.x - p.x) < 1500 ? o : null, dir = there ? (Math.sign(o.x - p.x) || p.face) : p.face;
    let stars = pins.filter(q => !q.fly).slice(0, PIN_MAX).map(q => ({ x: q.x, y: q.y, pin: q }));
    if (!stars.length) {                            // nothing pinned: one flicked up behind them first, to fly out to
      const x = clamp((there ? o.x : p.x + dir * 400) + dir * 360, -930, 930);
      stars = [{ x, y: 400, pin: null }];
      burstAt(x, 400, .8); sfx.twinkle();
    }
    const legs = [];                                // where it goes: through them, out to a star, back through them, and so on
    for (const st of stars) { if (there) legs.push({ to: 'foe' }); legs.push({ to: st }); }
    if (there) legs.push({ to: 'foe', last: true });
    flight = m.f = { o: there, legs, i: 0, from: [p.x, p.y + 150], u: 0, len: 1, trail: [], lines: [], hits: 0, lt: 0 };
    sfx.cross(); E.zoomIn(.5); if (Z) Z.dim(.45, 1.2);
    p.vy = 0;
  }
  const f = m.f, dt = t - f.lt;
  f.lt = t;
  p.inv = Math.max(p.inv || 0, .25); p.vx = 0;
  if (t < .18) { p.target = POSE.kiRaise; p.rate = 30; return; }      // a breath, and gone
  if (f.i >= f.legs.length) {                       // the flight over: down beside them
    if (!f.down) { f.down = t; p.vy = -300; p.ground = false; }
    p.target = POSE.kiLand; p.rate = 26; p.spin = 1;
    if (p.ground || t > f.down + .6) { flight = null; E.endMove(p); }
    return;
  }
  const leg = f.legs[f.i], o = f.o;
  const to = leg.to === 'foe' ? (o && !o.ko ? [o.x, o.y + 170 * (o.scale || 1)] : f.from) : [leg.to.x, leg.to.y];
  if (f.u === 0) f.len = Math.max(60, Math.hypot(to[0] - f.from[0], to[1] - f.from[1]));
  f.u = Math.min(1, f.u + dt * FLY_V / f.len);
  const x = lerp(f.from[0], to[0], ease(f.u)), y = lerp(f.from[1], to[1], ease(f.u));
  p.x = clamp(x, -965, 965); p.y = Math.max(20, y - 150); p.vy = 0; p.ground = false;
  p.face = to[0] >= f.from[0] ? 1 : -1;
  p.target = POSE.kiFly; p.rate = 60; p.spin = 1;
  f.trail.push([p.x, p.y + 150]); if (f.trail.length > 18) f.trail.shift();
  if (Math.random() < .7) V.mote(p.x, p.y + 150, Math.random() < .5 ? 'pink' : 'gold');
  if (o && !o.ko && !duel() && !o.net && !o.poise) { o.vx = 0; if (o.ground) Object.assign(o, { state: 'hurt', stun: Math.max(o.stun || 0, .35), act: null, tele: 0 }); }      // (held where they are while it goes on)
  if (f.u < 1) return;
  f.lines.push({ a: f.from, b: to, t: 0 });         // the line it drew stays a moment: a constellation
  f.from = to; f.u = 0; f.i++;
  if (leg.to === 'foe') {
    if (o && !o.ko) {
      const last = !!leg.last, hs = o.scale || 1;
      E.applyHit(o, p.face, last ? { dmg: exact(o, FLY_LAST), kb: 760, lift: 640, stun: .9, stop: .2, heavy: 1, col: PINK, fixed: 1, mute: 1, nostar: 1 }
                                 : { dmg: exact(o, FLY_DMG), kb: 0, stun: .7, stop: .05, col: GOLD, fixed: 1, mute: 1, nostar: 1 });
      advance(o); f.hits++;
      burstAt(o.x, o.y + 170 * hs, last ? 1.4 : .8); shake(last ? 30 : 14);
      if (last) {
        sfx.bf(); sfx.star(4); E.zoomIn(.4);
        E.fx.push({ k: 2, x: o.x, y: o.y + 520 * hs, n: 'INTERSTELLAR', col: PINK, t: 0, life: 1.4 });
        if (Z) { Z.flash(PRGB, .3, .22); Z.shock(o.x, 640, PRGB, .45, 10); }
      } else sfx.hit(true);
    }
  } else {                                          // through a star: it goes out
    const st = leg.to;
    if (st.pin) { const k = pins.indexOf(st.pin); if (k >= 0) pins.splice(k, 1); }
    burstAt(st.x, st.y, 1); sfx.star(Math.min(4, f.i)); V.ring(st.x, st.y, 200, PINK, .3);
  }
} };
function flightTick(dt) {
  if (!flight) return;
  for (let i = flight.lines.length - 1; i >= 0; i--) if ((flight.lines[i].t += dt) > 1.1) flight.lines.splice(i, 1);
}
function drawFlight() {
  const f = flight;
  if (!f) return;
  lit(() => {
    for (const L of f.lines) {                      // what it has drawn: lines between the stars, going out
      const a = F(L.a[0], L.a[1]), b = F(L.b[0], L.b[1]), al = Math.max(0, 1 - L.t / 1.1);
      g.strokeStyle = `rgba(${PRGB},${.85 * al})`; g.lineWidth = 9 * a[2]; g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.strokeStyle = `rgba(255,255,255,${.8 * al})`; g.lineWidth = 3 * a[2]; g.stroke();
    }
    f.trail.forEach((q, i) => { const c = F(q[0], q[1]), u = (i + 1) / f.trail.length; E.glow(E.GLOW.pink, c[0], c[1], 150 * c[2] * u, .55 * u); });
    const h = f.trail[f.trail.length - 1];
    if (h && f.i < f.legs.length) { const c = F(h[0], h[1]); E.glow(E.GLOW.gold, c[0], c[1], 260 * c[2], 1); E.glow(E.GLOW.white, c[0], c[1], 110 * c[2], .9); }
  });
}

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
  if (!markO || !mark || duel() || crossS || flight || o.net || p.dead) return;
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

/* ================= G — FEVER (Build 0.20v1): the awakening ================= */
// Nothing makes the Star-Crossed happier than a fever running hot. A thought first ("THE FEVER'S RUNNING HOT TODAY~"), the sky going to stars
// with the Southern Cross in it, "STARS IN THE WRONG ORDER NEVER MEET!", and real music from the anime under the rest of it (myinstants'
// "Jjk theme season 3", the season the Star-Crossed is in; sounds/home-kirara-awk.mp3 at home), round and round, for thirty seconds. In the
// fever every hit puts two stars on them instead of one, IMAI lands x1.6 instead of x1.3, Shooting Star throws three, and the Rendezvous heel
// is 110 (176 on IMAI). When it is over: "...THE FEVER'S GONE COLD."
const FEV_T = 30, FEV_INTRO = 3, FEV_BONUS = 1.6, FEV_MEET = 110;
let fev = null, watch = 0, shownT = -1, sky = 0;   // { t, intro, paused, music, sky }; how far the sky has gone to stars
function fevOn() { return !!fev && !fev.intro; }
function awaken(p) {
  if (fev) return;
  fev = { t: FEV_T, intro: true, paused: false, music: null, sky: false };
  if (!duel() && !(H.foes && H.foes()) && !Fi.fight.paused) { Fi.fight.paused = true; fev.paused = true; }      // (the fight waits for it: not a duel's, not a raid's)
  p.inv = Math.max(p.inv || 0, FEV_INTRO + .3);
  p.move = { def: FEVER, t: 0 };
  E.zoomIn(FEV_INTRO);
  clearInterval(watch); watch = setInterval(() => { if (fev && E.root.dataset.mode !== 'fight') endFev(true); if (!fev) clearInterval(watch); }, 250);
}
const FEVER = { name: 'Fever', dur: FEV_INTRO, run(p, m, t) {
  p.vx = 0; p.rate = 16; p.target = t < 1.25 ? POSE.kiReach : POSE.kiRaise;
  if (!m.a) { m.a = 1; if (JU.manga) JU.manga.think(p, "THE FEVER'S RUNNING HOT TODAY~", { life: 1.25 }); sfx.twinkle(); }
  if (t >= 1.25 && !m.b) { m.b = 1; fev.sky = true; if (JU.manga) JU.manga.say(p, 'STARS IN THE WRONG ORDER NEVER MEET!', { life: 1.45 }); sfx.cross(); }
  if (t >= 2.75 && !m.c) { m.c = 1; begin(p); }
} };
function begin(p) {
  fev.intro = false;
  if (fev.paused) { fev.paused = false; Fi.fight.paused = false; }
  E.banner('星間飛行', 'FEVER'); sfx.star(4); sfx.bf(); shake(20); burstAt(p.x, p.y + 220, 1.6);
  if (Z) Z.flash(PRGB, .3, .3);
  fev.music = sfx.song('home-kirara-awk', 0, 1.2, .55, true);
  shownT = -1;
  feverLabels();                                    // (0.22v2: the fever's own four on the hotbar)
}
function endFev(quiet) {
  const f = fev;
  if (!f) return;
  fev = null; clearInterval(watch);
  if (f.music) f.music.stop(1.6);
  feverLabels(); ult.length = 0;
  if (f.paused && Fi.fight.paused) Fi.fight.paused = false;
  if (on()) JU.tech.drain();
  if (!quiet && on() && JU.manga) JU.manga.think(E.P1, "...THE FEVER'S GONE COLD.", { life: 1.6 });
}
const awkEl = document.getElementById('awk');
function awkBar() {                                 // the bar while the fever lasts: the time left
  if (!fevOn() || !on()) return;
  const s = Math.max(0, Math.ceil(fev.t));
  if (s === shownT) return;
  shownT = s; awkEl.style.setProperty('--a', Math.max(0, fev.t / FEV_T)); awkEl.classList.remove('full');
  awkEl.lastElementChild.textContent = 'Fever · ' + s + 's';
}
// the sky gone to stars: the stage darkened, stars everywhere twinkling, the Southern Cross big over it all, and now and then one falling
const SKY = Array.from({ length: 140 }, (_, i) => ({ x: (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1, y: (Math.sin(i * 78.233) * 12345.678 % 1 + 1) % 1 * .72, r: .6 + (i % 5) * .35, ph: i * 1.7 }));
const CRUX = [[.5, .1], [.4, .27], [.5, .44], [.61, .25], [.55, .36]];      // ACRUX at the foot... drawn as the sky has it: GACRUX top, ACRUX bottom
const falls = [];
function drawSky(dt) {
  if (sky < .01) return;
  const cv = g.canvas, W = cv.width, Hh = cv.height, T = E.T, s = Math.min(W / 1280, Hh / 720);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = `rgba(5,6,26,${.72 * sky})`; g.fillRect(0, 0, W, Hh);
  g.globalCompositeOperation = 'lighter';
  for (const st of SKY) { const a = sky * (.35 + .65 * Math.abs(Math.sin(T * 1.6 + st.ph))); g.fillStyle = `rgba(255,248,236,${a})`; g.beginPath(); g.arc(st.x * W, st.y * Hh, st.r * s * 1.3, 0, TAU); g.fill(); }
  const pts = [[.5, .52], [.43, .3], [.5, .1], [.58, .27], [.535, .4]].map(([x, y]) => [W * (.62 + (x - .5) * .9), Hh * (.06 + y * .55)]);      // ACRUX, MIMOSA, GACRUX, IMAI, GINAN
  g.strokeStyle = `rgba(${PRGB},${.55 * sky})`; g.lineWidth = 2.5 * s;
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); g.lineTo(pts[2][0], pts[2][1]); g.moveTo(pts[1][0], pts[1][1]); g.lineTo(pts[3][0], pts[3][1]); g.stroke();
  pts.forEach((q, i) => { E.glow(E.GLOW[i === 4 ? 'pink' : 'gold'], q[0], q[1], 70 * s, .9 * sky); g.fillStyle = `rgba(255,255,255,${sky})`; g.beginPath(); g.arc(q[0], q[1], 4 * s, 0, TAU); g.fill(); });
  for (let i = falls.length - 1; i >= 0; i--) {     // stars falling
    const f = falls[i]; f.t += dt;
    if (f.t > .7) { falls.splice(i, 1); continue; }
    const x = f.x * W + f.t * 900 * s, y = f.y * Hh + f.t * 420 * s, a = sky * (1 - f.t / .7);
    g.strokeStyle = `rgba(255,236,250,${a})`; g.lineWidth = 2 * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 120 * s, y - 56 * s); g.stroke();
  }
  if (Math.random() < dt * 1.2) falls.push({ x: Math.random() * .7, y: Math.random() * .3, t: 0 });
  g.restore();
}
void CRUX;

/* ================= Build 0.22v2: the fever's own moves (the user: "star crossed ult moves") =================
   While the fever lasts, 1 to 4 are these instead (the names and numbers are ours):
   1 METEOR SHOWER: nine shooting stars down out of the sky onto them, 10 each (and two stars on them a hit, as everything in the fever)
   2 SUPERNOVA RENDEZVOUS: whatever star they wear, all the way in, round once, and a heel that sets a star off in them: 120
   3 CONSTELLATION CAGE: five stars round them, joined up one line at a time (12 a line, and they cannot get out), then shut on them: 40
   4 COMET FLIGHT: a comet, through them six times (16) and down into them (40) */
const ult = [];                                     // what the fever's moves leave about: { kind, ... }
const MSTEP = .085;
const ULT = {
  strikes: { name: 'Meteor Shower', cd: 3, dur: 1.3, run(p, m, t) {
    const o = E.P2;
    p.vx = 0; p.rate = 30; p.target = t < 1 ? POSE.kiRaise : POSE.idle;
    if (!m.s) { m.s = 1; m.n = 0; sfx.twinkle(); E.fx.push({ k: 2, x: p.x, y: p.y + 470, n: 'METEOR SHOWER', col: PINK, t: 0, life: 1 }); }
    while (m.n < 9 && t >= .15 + m.n * MSTEP) {
      const x = clamp((live(o) ? o.x : p.x + p.face * 400) + rnd(-90, 90), -980, 980), i = m.n++;
      ult.push({ kind: 'meteor', x0: x + rnd(-500, -260) * p.face, y0: 1200, x, t: 0, life: .26, hit: false, rot: rnd(0, TAU) });
      if (i % 2) sfx.star(i % 4);
    }
  } },
  crush: { name: 'Supernova Rendezvous', cd: 7, dur: 1.15, run(p, m, t) {
    const o = E.P2, f = p.face;
    p.vx = 0; p.rate = 34;
    if (!m.s) { m.s = 1; m.o = live(o) ? o : null; m.x0 = m.o ? m.o.x : 0; sfx.cross(); E.zoomIn(.8); }
    const q = m.o;
    if (t < .32) { p.target = POSE.kiReach; if (q && !q.ko && !duel() && !q.net) { q.x = lerp(m.x0, clamp(p.x + f * 120, -960, 960), ease(Math.min(1, t / .3))); q.vx = 0; Object.assign(q, { state: 'hurt', stun: .7, act: null, tele: 0 }); } if (q && Math.random() < .9) V.mote(q.x, q.y + 170, 'pink'); return; }
    if (t < .48) { p.target = POSE.manjiWind; p.spin = Math.cos((t - .32) / .16 * TAU); p.rate = 30; return; }
    p.spin = 1; p.target = t < .8 ? POSE.manji : POSE.idle; p.rate = 46;
    if (m.done) return;
    m.done = 1;
    if (duel() && q) p.x = clamp(q.x - f * 120, -960, 960);
    if (!q || q.ko) return;
    E.applyHit(q, f, { dmg: exact(q, 120), kb: 1300, lift: 800, stun: 1, stop: .3, heavy: 1, col: PINK, fixed: 1, mute: 1, nostar: 1 });
    setMark(q, 1);
    ult.push({ kind: 'nova', x: q.x, y: q.y + 180, t: 0, life: .7 });
    burstAt(q.x, q.y + 180, 2.2); sfx.bf(); sfx.star(4); shake(40); E.zoomIn(.4);
    if (JU.ms) JU.ms.bigHit(p, q, 'キラッ', PINK, 'neg');
    if (Z) { Z.flash(PRGB, .45, .3); Z.shock(q.x, 800, PRGB, .5, 14); }
    E.fx.push({ k: 2, x: q.x, y: q.y + 540, n: 'SUPERNOVA', col: PINK, t: 0, life: 1.4 });
  } },
  div: { name: 'Constellation Cage', cd: 9, dur: 2, run(p, m, t) {
    const o = E.P2;
    p.vx = 0; p.rate = 22; p.target = t < 1.7 ? POSE.kiRaise : POSE.idle;
    if (!m.s) {
      m.s = 1; m.o = live(o) ? o : null; m.n = 0;
      const cx = m.o ? m.o.x : p.x + p.face * 400, cy = m.o ? m.o.y + 190 : 190;
      m.cage = { kind: 'cage', pts: Array.from({ length: 5 }, (_, i) => [cx + Math.cos(-Math.PI / 2 + i * TAU / 5) * 230, cy + Math.sin(-Math.PI / 2 + i * TAU / 5) * 210]), lines: 0, t: 0, life: 2, shut: 0 };
      ult.push(m.cage); sfx.cross();
    }
    const q = m.o;
    if (q && !q.ko && !duel() && !q.net && t < 1.5) Object.assign(q, { state: 'hurt', stun: .4, act: null, tele: 0, vx: 0 });      // (nothing gets out of it)
    while (m.n < 5 && t >= .25 + m.n * .2) {
      m.n++; m.cage.lines = m.n; sfx.star((m.n - 1) % 4);
      if (q && !q.ko) { E.applyHit(q, q.x >= p.x ? 1 : -1, { dmg: exact(q, 12), kb: 0, stun: .6, stop: .04, col: GOLD, fixed: 1, mute: 1 }); burstAt(q.x, q.y + 180, .5); }
    }
    if (t >= 1.35 && !m.shut) {
      m.shut = 1; m.cage.shut = E.T;
      if (q && !q.ko) { E.applyHit(q, q.x >= p.x ? 1 : -1, { dmg: exact(q, 40), kb: 900, lift: 600, stun: 1, stop: .22, heavy: 1, col: PINK, fixed: 1, mute: 1 }); burstAt(q.x, q.y + 180, 1.6); }
      sfx.bf(); shake(30); if (JU.ms && q) JU.ms.bigHit(p, q, '封', PINK, 'neg');
    }
  } },
  manji: { name: 'Comet Flight', cd: 12, dur: 2.2, run(p, m, t) {
    const o = E.P2;
    p.rate = 40;
    if (!m.s) { m.s = 1; m.n = 0; m.x0 = p.x; m.side = 1; p.inv = Math.max(p.inv || 0, 2); sfx.whoosh(); sfx.twinkle(); E.fx.push({ k: 2, x: p.x, y: p.y + 470, n: 'COMET FLIGHT', col: PINK, t: 0, life: 1 }); }
    const q = live(o) ? o : null, cx = q ? q.x : m.x0 + p.face * 300;
    if (m.n < 6) {
      const leg = Math.floor(t / .2), u = (t % .2) / .2;
      if (leg >= m.n + 1 || leg > 5) {             // each time through them: a blow
        m.n++;
        if (q && !q.ko) { E.applyHit(q, m.side, { dmg: exact(q, 16), kb: 0, stun: .6, stop: .04, col: PINK, fixed: 1, mute: 1 }); burstAt(q.x, q.y + 180, .6); if (Math.abs(q.y) < 1 && !duel() && !q.net && !q.poise) Object.assign(q, { ground: false, state: 'air', y: 1, vy: 300 }); }
        m.side = -m.side; sfx.star(m.n % 4);
      }
      p.x = clamp(cx + m.side * lerp(420, -420, ease(u)), -980, 980); p.y = 260 + Math.sin(u * Math.PI) * 140; p.vy = 0; p.ground = false; p.face = -m.side;
      p.target = POSE.kiFly;
      ult.push({ kind: 'tail', x: p.x, y: p.y + 180, t: 0, life: .28 });
      return;
    }
    if (!m.down) { m.down = t; p.vy = -2800; if (q) p.vx = clamp((q.x - p.x) / .2, -2600, 2600); }
    p.target = POSE.kiLand;
    if (!m.hit && (p.ground || t - m.down > .4)) {
      m.hit = 1; p.vx = 0;
      burstAt(p.x, 120, 2); sfx.bf(); shake(36); if (Z) Z.shock(p.x, 700, PRGB, .45, 12);
      if (q && !q.ko && Math.abs(q.x - p.x) < 320) { E.applyHit(q, q.x >= p.x ? 1 : -1, { dmg: exact(q, 40), kb: 1200, lift: 700, stun: 1, stop: .24, heavy: 1, col: PINK, fixed: 1, mute: 1 }); if (JU.ms) JU.ms.bigHit(p, q, 'ドォン', PINK, 'bw'); }
    }
    if (m.hit && t > m.down + .8) E.endMove(p);
  } }
};
function ultTick(dt) {
  const o = E.P2;
  for (let i = ult.length - 1; i >= 0; i--) {
    const u = ult[i];
    u.t += dt;
    if (u.kind === 'meteor' && !u.hit && u.t >= u.life) {      // it lands
      u.hit = true; burstAt(u.x, 30, .7); E.addDust(u.x); shake(8);
      if (live(o) && !(o.inv > 0) && Math.abs(o.x - u.x) < 110 * (o.scale || 1) && o.y < 380) E.applyHit(o, o.x >= u.x ? 1 : -1, { dmg: exact(o, 10), kb: 60, stun: .5, stop: .03, col: GOLD, fixed: 1, mute: 1 });
    }
    if (u.t > u.life + (u.kind === 'meteor' ? .25 : 0)) ult.splice(i, 1);
  }
}
function drawUlt() {
  for (const u of ult) {
    const a = Math.max(0, 1 - Math.max(0, u.t - u.life * .7) / (u.life * .3 + .001));
    if (u.kind === 'meteor') {                       // a shooting star coming down, its tail behind it
      const k0 = Math.min(1, u.t / u.life), x = lerp(u.x0, u.x, k0), y = lerp(u.y0, 30, k0), c = F(x, y), tl = F(lerp(u.x0, u.x, Math.max(0, k0 - .35)), lerp(u.y0, 30, Math.max(0, k0 - .35))), k = c[2];
      if (u.hit) continue;
      lit(() => { g.strokeStyle = `rgba(${PRGB},.75)`; g.lineWidth = 14 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(tl[0], tl[1]); g.lineTo(c[0], c[1]); g.stroke(); g.strokeStyle = 'rgba(255,248,236,.95)'; g.lineWidth = 4 * k; g.stroke(); E.glow(E.GLOW.gold, c[0], c[1], 110 * k, 1); });
      starPath(c[0], c[1], 20 * k, 8 * k, u.rot + u.t * 12); g.fillStyle = '#fff6d8'; g.fill();
    } else if (u.kind === 'nova') {                  // the star going off in them
      const c = F(u.x, u.y), k = c[2], e = 1 - (1 - Math.min(1, u.t / u.life)) ** 2;
      lit(() => { E.glow(E.GLOW.pink, c[0], c[1], 900 * e * k, 1 - e); E.glow(E.GLOW.gold, c[0], c[1], 500 * e * k, 1 - e); });
      g.save(); g.globalAlpha = 1 - e; starPath(c[0], c[1], 380 * e * k, 150 * e * k, e * 2); g.strokeStyle = '#fff'; g.lineWidth = 6 * k; g.stroke(); g.restore();
    } else if (u.kind === 'cage') {                  // the five stars, the lines between them, and then all of it shutting
      const sh = u.shut ? Math.min(1, (E.T - u.shut) / .25) : 0, cx = u.pts.reduce((s, q) => s + q[0], 0) / 5, cy = u.pts.reduce((s, q) => s + q[1], 0) / 5;
      const pt = q => F(lerp(q[0], cx, sh), lerp(q[1], cy, sh));
      g.save(); g.globalAlpha = a;
      lit(() => {
        g.strokeStyle = `rgba(${PRGB},.9)`; g.lineWidth = 5; g.lineCap = 'round';
        for (let i = 0; i < u.lines; i++) { const s0 = pt(u.pts[i]), s1 = pt(u.pts[(i + 2) % 5]); g.beginPath(); g.moveTo(s0[0], s0[1]); g.lineTo(s1[0], s1[1]); g.stroke(); }      // (a star drawn the way stars are, every other point)
        for (const q of u.pts) { const c = pt(q); E.glow(E.GLOW.gold, c[0], c[1], 90 * c[2], .9); }
      });
      for (const q of u.pts) { const c = pt(q); starPath(c[0], c[1], 18 * c[2], 7 * c[2], E.T * 3); g.fillStyle = '#fff6d8'; g.fill(); g.lineWidth = 2; g.strokeStyle = PINK; g.stroke(); }
      g.restore();
    } else if (u.kind === 'tail') {                  // the comet's tail
      const c = F(u.x, u.y), k = c[2], f = 1 - u.t / u.life;
      lit(() => { E.glow(E.GLOW.pink, c[0], c[1], 160 * k * f, f); E.glow(E.GLOW.white, c[0], c[1], 60 * k * f, f); });
    }
  }
}
// the hotbar while it lasts: the fever's four, or the usual four again
function feverLabels() {
  if (!on()) return;
  const set = fevOn() ? ULT : BASE;
  for (const k of JU.tech.SLOTS) { E.hud.mv[k].querySelector('b').textContent = set[k].name; E.CD[k] = set[k].cd; E.cd[k] = Math.min(E.cd[k], set[k].cd); }
}

/* ================= the technique ================= */
const BASE = { strikes: SHOOT, crush: MEET, div: STAMP, manji: FLIGHT };
const MOVES = { get strikes() { return fevOn() ? ULT.strikes : SHOOT; }, get crush() { return fevOn() ? ULT.crush : MEET; }, get div() { return fevOn() ? ULT.div : STAMP; }, get manji() { return fevOn() ? ULT.manji : FLIGHT; } };      // (0.22v2: the fever's own four while it lasts)
JU.tech.add('kirara', { name: 'Star-Crossed', jp: '星間飛行', mark: '星', who: 'Love Rendezvous', odds: 2.5, col: PINK, glow: 'pink', moves: MOVES,
  limited: ENDS, skin: KIRARA, as: ['Star-Crossed', '星'], awaken, awkName: 'Fever', awkKeep: true,
  get awkHits() { return !fev; },                   // (in the fever the bar is the time left: hits do not fill it)
  hint: '<b>1</b> Shooting Star · <b>2</b> Love Rendezvous · <b>3</b> Star Stamp: pin a star, it draws them in · <b>4</b> Interstellar Flight, through every star · <b>E</b> Southern Cross · <b>G</b> Fever · every hit puts the next star on them: the wrong order never meet, <b>IMAI</b> is drawn in' });
const DEF = JU.tech.TECH.kirara, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
const hit0 = H.hit, guard0 = H.guard, pow0 = H.power, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart, under0 = H.under;
H.under = dt => { under0(dt); if (on()) drawSky(dt); };
H.hit = (o, face, h) => {                           // a blow of the Star-Crossed's that lands: the next star on them
  hit0(o, face, h);
  if (!on() || h.nostar || o.ko) return;
  advance(o); if (fevOn()) advance(o);              // (two at a time in the fever)
  const m = E.P1.move;
  if (m && m.def.m1) burstAt(o.x - face * 20, o.y + 160 * (o.scale || 1), .35);
};
H.guard = (face, a, mul) => {
  if (guard0 && guard0(face, a, mul)) return true;
  if (!on() || E.P1.dead || duel() || (a && a.shot) || !wrong(E.P2)) return false;
  never();                                          // thrown across the wrong order: it stops short
  return true;
};
H.power = (h, o) => (pow0 ? pow0(h, o) : 1) * (on() && drawn(o) ? (fevOn() ? FEV_BONUS : BONUS) : 1);
H.tick = dt => {
  tick0(dt);
  sky += ((fev && fev.sky ? 1 : 0) - sky) * (1 - Math.exp(-dt * 3));
  if (!on()) { if (shots.length) shots.length = 0; markO = null; mark = 0; crossS = null; pins.length = 0; flight = null; if (fev) endFev(true); return; }
  if (fev) {                                         // the fever: the time going, and sparks off her
    const p = E.P1;
    if (p.dead) endFev(true);
    else if (!fev.intro) {
      fev.t -= dt; awkBar();
      if (Math.random() < dt * 14) V.mote(p.x, p.y + 230, Math.random() < .5 ? 'pink' : 'gold');
      if (fev.t <= 0) endFev();
    }
  }
  if (shots.length) flyShots(dt);
  if (ult.length) ultTick(dt);
  if (flight && !(E.P1.move && E.P1.move.def === FLIGHT)) flight = null;      // (cut short)
  flightTick(dt); pinsTick(dt);
  rules(dt);
};
H.fx = dt => {
  fx0(dt);
  if (!on()) return;
  drawCross(); drawPins(); drawShots(); drawFlight(); drawRules(); if (ult.length) drawUlt();
};
const clear = () => { mark = 0; markO = null; shots.length = 0; crossS = null; stampT = pushT = neverT = 0; pins.length = 0; flight = null; pinCool = 0; ult.length = 0; };
H.reset = () => { reset0(); clear(); endFev(true); sky = 0; };
H.fightStart = (cfg, wave) => { start0(cfg, wave); clear(); if (!wave) { endFev(true); sky = 0; } };      // (the fever lasts through the waves of one fight)

JU.kirara = { SKIN: KIRARA, MOVES, ULT, esp: CROSS, ENDS, STARS,      // (esp: E, especial.js)
  get fever() { return fev && { t: +fev.t.toFixed(2), intro: fev.intro, music: !!(fev.music && fev.music.playing), sky: +sky.toFixed(2) }; },
  get state() { return { mark, star: mark ? STARS[mark - 1][0] : null, on: markO === E.P2, shots: shots.length, cross: crossS ? +crossS.t.toFixed(2) : null,
    pins: pins.map(q => ({ x: Math.round(q.x), y: q.y, t: +q.t.toFixed(2) })), flight: flight ? { leg: flight.i, of: flight.legs.length, hits: flight.hits } : null }; },
  set(n) { setMark(E.P2, n); } };
})();
