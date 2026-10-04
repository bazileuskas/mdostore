/* JUJUTSU UNLIMITEDS — boss movesets II: the Finger Bearer (raw cursed energy), Jogo (Disaster Flames), Todo (Boogie Woogie) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, B = JU.boss;
const { rnd, clamp, LINE } = E, { orb, beam, sprite } = JU.tech.tk;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const arc = (o, r, col) => { const s = o.scale || 1; E.fx.push({ k: 4, x: o.x + o.face * 80 * s, y: o.y + 170 * s, face: o.face, r: r * s, col, t: 0, life: .18 }); };

/* ================= Finger Bearer: nothing clever, only more cursed energy than a body should hold ================= */
const CRIMSON = '#ff5a6e';
const ball = s => orb(s.x, s.y, s.r * .7, 'red', '#0b0306');
B.kit('finger', { tech: 'Cursed Energy', col: CRIMSON, glow: 'red', shots: true, moves: [
  { name: 'Cursed Barrage', cd: 7, min: 300, wind: .6, pre: 'divWind', dur: 1, run(o, p, A, t) {
    const n = Math.floor(t / .2);
    o.rate = 40; o.target = n < 4 ? (n & 1 ? POSE.jab : POSE.div) : POSE.idle;
    if (n !== A.n && n < 4) {                     // four of them skimming the floor: jump them
      A.n = n; sfx.blast();
      B.shot({ x: o.x + o.face * 110, y: 62, vx: o.face * 860, r: 34, trail: 'red', a: { dmg: 6, kb: 320, stun: .4 }, draw: ball, hit: s => V.sparks(s.x, s.y, 'red', 10) });
    }
  } },
  { name: 'Tremor', cd: 9, max: 560, wind: .65, pre: 'crushWind', dur: .9, run(o, p, A, t) {
    o.rate = 44; o.target = t < .5 ? POSE.crush : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.blast(); shake(26);              // both fists into the floor, and the shock runs out along it both ways
    V.crack(o.x, 380); V.rocks(o.x, 0, 16); E.addRing(o.x, '255,90,110', 440);
    for (const d of [-1, 1]) B.wave(o.x, d, 900, 780, { dmg: 12, kb: 380, lift: 600 }, CRIMSON);
  } },
  { name: 'Cursed Cannon', cd: 14, below: .7, min: 260, wind: 1, pre: 'divWind',
    charge(o) { const w = B.fist(o, false); V.mote(w[0], w[1], 'red'); },
    dur: .8, run(o, p, A, t) {
      o.rate = 40; o.target = t < .55 ? POSE.div : POSE.idle;
      if (!A.s) {
        A.s = 1; sfx.blast(); shake(30); E.zoomIn(.4);
        const f = o.face, x0 = o.x + f * 100, y = o.y + 185;
        V.custom(.45, u => beam(x0, x0 + f * 1500, y, 90 * (1 - u * u), 'red', 1 - u));
      }
      if (t < .12 && !A.done && B.swing(o, 1400, { dmg: 20, kb: 900, lift: 420 })) A.done = 1;
    } }
] });

/* ================= Jogo: Disaster Flames ================= */
const FLAME = '#ff8c50';
const bug = s => orb(s.x, s.y, 11, 'fire', '#1a0d08');
// the floor swells, glows, and goes up
function erupt(x, delay) {
  B.mark(x, 125, delay, FLAME);
  B.later(delay, () => {
    sfx.blast(); shake(20); V.crack(x, 240); V.rocks(x, 0, 10); V.fire(x, 0, 24); V.fire(x, 170, 14); E.addBlast(x, 120, '255,140,60', 300);
    V.custom(.5, u => {                           // a cone of rock shoved up through it
      const h = Math.sin(Math.min(1, u * 3) * Math.PI / 2) * (1 - Math.max(0, u - .6) / .4) * 130, a = F(x - 90, 0), b = F(x + 90, 0), c = F(x, h);
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0] - 18 * c[2], c[1]); g.lineTo(c[0] + 18 * c[2], c[1]); g.lineTo(b[0], b[1]); g.closePath();
      g.fillStyle = '#3a2a22'; g.fill(); g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();
    });
    B.burst(x, 130, { dmg: 13, kb: 260, lift: 720 }, 400);
  });
}
B.kit('jogo', { tech: 'Disaster Flames', col: FLAME, glow: 'fire', moves: [
  { name: 'Ember Insects', cd: 7, min: 260, wind: .5, pre: 'hookWind', dur: .7, run(o, p, A, t) {
    const n = Math.floor(t / .14);
    o.rate = 36; o.target = t < .5 ? POSE.jab : POSE.idle;
    if (n !== A.n && n < 3) {                     // three of them, each steering for him until it bursts
      A.n = n; sfx.whoosh();
      B.shot({ x: o.x + o.face * 70, y: o.y + 240, vx: o.face * 320, vy: 300 - n * 190, r: 20, home: 540, life: 2.6, trail: 'fire', a: { dmg: 6, kb: 280, stun: .35 }, draw: bug,
        hit: s => V.fire(s.x, s.y - 40, 8), land: s => V.fire(s.x, 0, 6), end: s => V.sparks(s.x, s.y, 'fire', 6) });
    }
  } },
  { name: 'Volcano', cd: 8, wind: .5, pre: 'crushWind', dur: 1.2, run(o, p, A, t) {
    const n = Math.floor(t / .5);
    o.rate = 30; o.target = t < 1 ? POSE.crush : POSE.idle;
    if (n !== A.n && n < 2) { A.n = n; erupt(clamp(p.x, -940, 940), .62); }       // wherever he is standing, twice
  } },
  { name: 'Flame Jet', cd: 6, max: 600, wind: .45, pre: 'divWind', dur: .9, run(o, p, A, t) {
    o.rate = 36; o.target = t < .7 ? POSE.div : POSE.idle;
    if (t > .7) return;
    const f = o.face, w = B.fist(o, false), n = Math.floor(t / .22);
    if (!A.s) { A.s = 1; sfx.blast(); }
    for (let i = 0; i < 3; i++) V.puff('fire', w[0] + f * rnd(20, 60), w[1] + rnd(-16, 16), f * rnd(700, 960), rnd(-70, 90), rnd(50, 100), .55);
    if (n !== A.n) { A.n = n; B.swing(o, 600, { dmg: 5, kb: 300, stun: .3 }, 190); }
  } },
  { name: 'Maximum: Meteor', cd: 20, below: .55, wind: 1.1, pre: 'crushWind',
    charge(o, p, A) { if (!A.cry) { A.cry = 1; E.slow(.4); E.banner('極ノ番', 'MAXIMUM: METEOR', 'sm'); } },
    dur: 1.4, run(o, p, A, t) {
      o.rate = 20; o.target = t < 1.1 ? POSE.crush : POSE.idle;
      if (A.s) return;
      A.s = 1;
      const x = clamp(p.x, -760, 760), from = -o.face * 420;
      B.mark(x, 300, 1, '#ff5a2a');
      V.custom(1, u => {                          // it comes down out of the sky, trailing fire
        const q = u * u, cx = x + from * (1 - q), cy = 150 + 950 * (1 - q), c = F(cx, cy), r = 150 * c[2];
        g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.fire, c[0], c[1], r * 5, .9); g.globalCompositeOperation = 'source-over';
        g.beginPath(); g.arc(c[0], c[1], r, 0, 6.2832); g.fillStyle = '#2a1712'; g.fill(); g.lineWidth = 4; g.strokeStyle = FLAME; g.stroke();
        if (Math.random() < .7) V.puff('fire', cx + rnd(-80, 80), cy + rnd(40, 150), 0, 200, rnd(80, 150), .4);
      });
      B.later(1, () => {
        sfx.blast(); sfx.bf(); shake(36); V.impact(.2, x, 120); V.crack(x, 420); V.rocks(x, 0, 22); V.fire(x, 0, 34); V.fire(x, 190, 20); E.addBlast(x, 150, '255,120,40', 540);
        B.burst(x, 310, { dmg: 26, kb: 700, lift: 760 }, 400);
      });
    } }
] });

/* ================= Aoi Todo: Boogie Woogie ================= */
const AZURE = '#7ad7ff', APART = [-.05, 0, 2, -.9, .3, -.3, 0], CLAP = [.14, 0, 1.5, 1.42, .32, -.32, 0];
const rock = s => sprite(s.x, s.y - 40, 1, 1, 1, '#5a4d66', [[-46, -80, 92, 80], [-30, -98, 50, 22], [-58, -50, 16, 36]]);
// this time the black sparks choose him
function blackFlash(p) {
  const x = p.x, y = p.y + 150;
  V.impact(.4, x, y); V.crack(x, 330); V.rocks(x, 0, 12); E.addBlast(x, y, '255,36,64', 300);
  for (let i = 0; i < 8; i++) { const a = rnd(0, 6.283), l = rnd(200, 480); V.bolt(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, '#ff2440', rnd(.25, .5), rnd(3, 6), '#060205'); }
  E.banner('黒閃', 'BLACK FLASH', 'bf'); sfx.bf(); E.slow(.5); E.zoomIn(.6); shake(34);
}
B.kit('todo', { tech: 'Boogie Woogie', col: AZURE, glow: 'blue', moves: [
  { name: 'Boogie Woogie', cd: 6, min: 180, max: 700, wind: .5, pre: APART, dur: .75, run(o, p, A, t) {
    o.rate = 46;
    if (!A.s) {                                   // one clap, and he and the player have traded places
      A.s = 1; sfx.hit(true); sfx.charge(); shake(12); E.stop(.05);
      const ox = o.x, px = p.x;
      for (const x of [ox, px]) { V.ring(x, 170, 260, AZURE, .3); E.addBlast(x, 170, '122,215,255', 230); }
      o.x = px; p.x = ox; p.vx = 0; o.face = p.x >= o.x ? 1 : -1;
    }
    const gap = (p.x - o.x) * o.face;
    if (t < .12) { o.target = CLAP; return; }
    if (A.done || t > .42) { o.target = A.done && t < A.at + .25 ? POSE.hook : POSE.idle; return; }
    o.target = POSE.dash; o.vx = gap > 150 ? o.face * 1500 : 0;   // then he is on him from the side he was not watching
    if (gap > -30 && gap < 215) {
      A.done = 1; A.at = t; o.vx = 0; sfx.whoosh(); arc(o, 110, 'rgba(122,215,255,.9)');
      B.swing(o, 240, { dmg: 12, kb: 640, lift: 500 }, 190);
    }
  } },
  { name: 'Brother Rush', cd: 5, max: 280, wind: .42, pre: 'hookWind', dur: .8, run(o, p, A, t) {
    const n = Math.floor(t / .17);
    o.rate = 46; o.target = n > 2 ? POSE.idle : [POSE.jab, POSE.cross, POSE.hook][n]; o.vx = n < 3 && t % .17 < .08 ? o.face * 420 : 0;
    if (n !== A.n && n < 3) {
      A.n = n; sfx.whoosh(); arc(o, 100, 'rgba(122,215,255,.9)');
      B.swing(o, 220, n === 2 ? { dmg: 9, kb: 600, lift: 520 } : { dmg: 5, kb: 150, stun: .35 }, 190);
    }
  } },
  { name: 'Boulder Toss', cd: 8, min: 380, wind: .6, pre: 'crushWind',
    charge(o, p, A) { if (!A.r) { A.r = 1; V.crack(o.x + o.face * 60, 160); V.rocks(o.x + o.face * 60, 0, 6); sfx.land(); } },
    dur: .7, run(o, p, A, t) {
      o.rate = 44; o.target = t < .4 ? POSE.crush : POSE.idle;
      if (A.s) return;
      A.s = 1; sfx.whoosh();
      const x0 = o.x + o.face * 60, y0 = 300, T = .75, G = 2200, tx = clamp(p.x, -940, 940), hit = { dmg: 13, kb: 420, lift: 520 };
      B.mark(tx, 150, T, AZURE);
      B.shot({ x: x0, y: y0, vx: (tx - x0) / T, vy: (.5 * G * T * T - y0) / T, grav: G, r: 50, a: hit, draw: rock,
        land(s) { sfx.blast(); shake(18); V.crack(s.x, 240); V.rocks(s.x, 0, 12); E.addRing(s.x, '185,169,201', 260); B.burst(s.x, 150, hit); } });
    } },
  { name: 'Black Flash', cd: 16, below: .55, min: 120, max: 620, wind: .85, pre: 'divWind',
    charge(o) { const w = B.fist(o, false); V.mote(w[0], w[1], 'red'); if (Math.random() < .25) V.bolt(w[0], w[1], w[0] + rnd(-130, 130), w[1] + rnd(-130, 130), '#ff2440', .15, 2, '#060205'); },
    dur: .9, run(o, p, A, t) {
      const gap = (p.x - o.x) * o.face;
      o.rate = 46;
      if (A.done || t > .32) { o.target = A.done && t < A.at + .3 ? POSE.div : POSE.idle; return; }
      o.target = POSE.dash; o.vx = gap > 150 ? o.face * 1400 : 0;
      if (gap > -30 && gap < 220) {
        A.done = 1; A.at = t; o.vx = 0; sfx.whoosh(); arc(o, 120, 'rgba(255,36,64,.95)');
        if (B.swing(o, 250, { dmg: 22, kb: 1000, lift: 600 }, 190)) blackFlash(p);
      }
    } }
] });
})();
