/* JUJUTSU UNLIMITEDS — boss movesets II: the Finger Bearer (raw cursed energy), Jogo (Disaster Flames), Todo (Boogie Woogie).
   Redrawn in the Boss VFX update: what they do is what it was, what it looks like is not (the pieces are bossfx.js's) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, B = JU.boss, X = JU.bossfx;
const { rnd, clamp, lerp, LINE } = E, TAU = Math.PI * 2;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const arc = (o, r, col) => { const s = o.scale || 1; E.fx.push({ k: 4, x: o.x + o.face * 80 * s, y: o.y + 170 * s, face: o.face, r: r * s, col, t: 0, life: .18 }); };

/* ================= Finger Bearer: nothing clever, only more cursed energy than a body should hold ================= */
const CRIMSON = '#ff5a6e', RED = '255,70,100';
// a ball of it, crackling, earthing itself on the floor as it goes
const ball = s => { X.orb(s.x, s.y, s.r * .8, RED); if (Math.random() < .12) X.lightning(s.x, s.y, s.x + rnd(-70, 70), 0, RED, .1, 2, 0); };
B.kit('finger', { tech: 'Cursed Energy', col: CRIMSON, glow: 'red', shots: true, moves: [
  { name: 'Cursed Barrage', cd: 7, min: 300, wind: .6, pre: 'divWind', dur: 1, run(o, p, A, t) {
    const n = Math.floor(t / .2);
    o.rate = 40; o.target = n < 4 ? (n & 1 ? POSE.jab : POSE.div) : POSE.idle;
    if (n !== A.n && n < 4) {                     // four of them skimming the floor: jump them
      A.n = n; sfx.blast(); shake(8);
      const x = o.x + o.face * 110;
      X.flare(x, 62, RED, 230, .16); X.dust(o.x, 2, -o.face); V.ring(x, 62, 110, CRIMSON, .2);
      B.shot({ x, y: 62, vx: o.face * 860, r: 34, trail: 'red', a: { dmg: 6, kb: 320, stun: .4 }, draw: ball, hit: s => V.sparks(s.x, s.y, 'red', 10) });
    }
  } },
  { name: 'Tremor', cd: 9, max: 560, wind: .65, pre: 'crushWind', dur: .9, run(o, p, A, t) {
    o.rate = 44; o.target = t < .5 ? POSE.crush : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.blast(); shake(30);              // both fists into the floor, and the shock runs out along it both ways
    V.crack(o.x, 420); V.rocks(o.x, 0, 22); E.addRing(o.x, '255,90,110', 440);
    X.boom(o.x + o.face * 60, 20, 120, RED, { n: 16 }); X.pillar(o.x + o.face * 60, 60, 380, RED, .45); X.dust(o.x, 12); X.shock(o.x, 620, RED, .7, 14); X.decal('crater', o.x + o.face * 60, 190, RED, 8, 0);
    for (const d of [-1, 1]) B.wave(o.x, d, 900, 780, { dmg: 12, kb: 380, lift: 600 }, CRIMSON);
  } },
  { name: 'Cursed Cannon', cd: 14, below: .7, min: 260, wind: 1, pre: 'divWind',
    charge(o, p, A, u) {                          // it is packed into his fist until the fist cannot hold it
      const w = B.fist(o, false);
      V.mote(w[0], w[1], 'red');
      if (!A.orb) { A.orb = 1; V.custom(1, q => { const h = B.fist(o, false); X.orb(h[0], h[1], 8 + 46 * q, RED); }); }
      if (Math.random() < .3 + u * .5) X.lightning(w[0], w[1], w[0] + rnd(-200, 200), Math.max(0, w[1] + rnd(-260, 120)), RED, .12, 2 + u * 2, 1);
      shake(4 * u);
    },
    dur: .8, run(o, p, A, t) {
      o.rate = 40; o.target = t < .55 ? POSE.div : POSE.idle;
      if (!A.s) {
        A.s = 1; sfx.blast(); shake(34); E.zoomIn(.4);
        const f = o.face, x0 = o.x + f * 100, y = o.y + 185, x1 = clamp(x0 + f * 1500, -1040, 1040);
        X.beam(x0, x0 + f * 1500, y, 82, RED, .5); X.dim(.55, .5);
        X.boom(x1, y, 150, RED, { n: 18 }); X.shock(o.x, 420, RED, .5); X.dust(o.x, 8, -f); o.vx = -f * 380;       // and it throws him back a step
        for (let i = 1; i < 5; i++) X.decal('scorch', x0 + f * i * 240, 70, RED, 6, 0);
      }
      if (t < .12 && !A.done && B.swing(o, 1400, { dmg: 20, kb: 900, lift: 420 })) A.done = 1;
    } }
] });

/* ================= Jogo: Disaster Flames ================= */
const FLAME = '#ff8c50', FIRE = '255,140,60', HOT = '255,232,150', LAVA = '255,96,30';
// an ember insect: a coal with a mouth, on wings too fast to see, screaming as it comes
function bug(s) {
  const c = F(s.x, s.y), k = c[2], d = Math.sign(s.vx) || 1, fl = Math.sin(E.T * 60 + s.x * .1);
  X.lite(() => { X.glow(FIRE, c[0], c[1], 150 * k, .9); g.fillStyle = 'rgba(255,220,150,.5)'; for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(c[0] - d * 4 * k, c[1] - 6 * k); g.lineTo(c[0] - d * 30 * k, c[1] - (26 + 14 * fl * sg) * k); g.lineTo(c[0] - d * 34 * k, c[1] - 4 * k); g.closePath(); g.fill(); } });
  g.fillStyle = '#1a0d08'; g.strokeStyle = LINE; g.lineWidth = 2;
  g.beginPath(); g.ellipse(c[0], c[1], 17 * k, 12 * k, 0, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = FLAME; g.beginPath(); g.arc(c[0] + d * 9 * k, c[1] - 2 * k, 4.5 * k, 0, TAU); g.fill();                       // its one eye
  g.strokeStyle = `rgb(${HOT})`; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(c[0] - d * 12 * k, c[1] - 6 * k); g.lineTo(c[0] - d * 3 * k, c[1] + 2 * k); g.lineTo(c[0] - d * 10 * k, c[1] + 8 * k); g.stroke();       // the fire showing through the cracks in it
  if (Math.random() < .5) X.emit(5, s.x - d * 16, s.y, -d * rnd(40, 160), rnd(-60, 120), rnd(3, 5), rnd(.2, .5), HOT);
}
const pop = (x, y, r) => { X.boom(x, y, r, FIRE, { n: 10, shake: 6 }); V.fire(x, Math.max(0, y - 40), 8); };
// the floor swells, glows, and goes up: a small volcano where he was standing
function erupt(x, delay) {
  B.mark(x, 125, delay, FLAME);
  B.add({ life: delay, upd(h, dt) {                 // it smokes and spits before it goes
    if (Math.random() < dt * 30) X.emit(2, x + rnd(-80, 80), rnd(0, 30), rnd(-30, 30), rnd(80, 220), rnd(60, 110), rnd(.5, .9), '40,30,34', { s1: 2, a: .5 });
    if (Math.random() < dt * 40) X.emit(4, x + rnd(-50, 50), 6, rnd(-160, 160), rnd(200, 520), rnd(3, 6), 2, LAVA, { g: 1500, land: 'scorch' });
  }, under(h) { const c = F(x, 0), u = h.t / delay; X.lite(() => X.glow(LAVA, c[0], c[1], (260 + 200 * u) * c[2], .35 + .5 * u)); } });
  B.later(delay, () => {
    sfx.blast(); shake(24); V.crack(x, 260); V.rocks(x, 0, 14); V.fire(x, 0, 26); V.fire(x, 170, 16); E.addBlast(x, 120, '255,140,60', 300);
    X.boom(x, 60, 140, FIRE, { n: 20, hot: HOT }); X.pillar(x, 78, 560, FIRE, .7); X.dust(x, 8);
    for (let i = 0; i < 16; i++) X.emit(4, x + rnd(-30, 30), 80, rnd(-420, 420), rnd(500, 1150), rnd(5, 10), 3, i % 3 ? LAVA : HOT, { g: 1900, land: 'scorch' });      // lava thrown out of it, landing where it likes
    V.custom(.9, u => {                           // the cone shoved up through the floor, lit from inside
      const h = Math.sin(Math.min(1, u * 4) * Math.PI / 2) * (1 - Math.max(0, u - .7) / .3) * 140, a = F(x - 100, 0), b = F(x + 100, 0), c = F(x, h), k = c[2];
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0] - 22 * k, c[1]); g.lineTo(c[0] + 22 * k, c[1]); g.lineTo(b[0], b[1]); g.closePath();
      g.fillStyle = '#2e2019'; g.fill(); g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();
      X.lite(() => {
        g.strokeStyle = `rgba(${LAVA},${1 - u})`; g.lineWidth = 3 * k;
        for (const m of [-.55, -.15, .3, .62]) { g.beginPath(); g.moveTo(c[0] + m * 14 * k, c[1] + 4 * k); g.lineTo(lerp(c[0], m < 0 ? a[0] : b[0], Math.abs(m) * .7 + .2), lerp(c[1], a[1], .55 + Math.abs(m) * .3)); g.stroke(); }
        X.glow(HOT, c[0], c[1], 150 * k, 1 - u);
      });
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
      const x = o.x + o.face * 70, y = o.y + 240;
      X.flare(x, y, FIRE, 150, .14); V.fire(x, y - 30, 4);
      B.shot({ x, y, vx: o.face * 320, vy: 300 - n * 190, r: 20, home: 540, life: 2.6, trail: 'fire', a: { dmg: 6, kb: 280, stun: .35 }, draw: bug,
        hit: s => pop(s.x, s.y, 62), land: s => pop(s.x, 20, 52), end: s => pop(s.x, s.y, 46) });
    }
  } },
  { name: 'Volcano', cd: 8, wind: .5, pre: 'crushWind', dur: 1.2, run(o, p, A, t) {
    const n = Math.floor(t / .5);
    o.rate = 30; o.target = t < 1 ? POSE.crush : POSE.idle;
    if (n !== A.n && n < 2) { A.n = n; X.shock(o.x, 300, FIRE, .4); erupt(clamp(p.x, -940, 940), .62); }       // wherever he is standing, twice
  } },
  { name: 'Flame Jet', cd: 6, max: 600, wind: .45, pre: 'divWind', dur: .9, run(o, p, A, t) {
    o.rate = 36; o.target = t < .7 ? POSE.div : POSE.idle;
    if (t > .7) return;
    const f = o.face, w = B.fist(o, false), n = Math.floor(t / .22);
    if (!A.s) {
      A.s = 1; sfx.blast(); X.flash(FIRE, .12, .3);
      V.custom(.7, u => {                         // the body of the jet: a cone of it out of his palm, white where it leaves
        const h = B.fist(o, false), a = F(h[0], h[1]), b = F(h[0] + o.face * 620, h[1]), k = a[2], al = u < .1 ? u / .1 : u > .8 ? (1 - u) / .2 : 1, fl = 1 + .12 * Math.sin(E.T * 50);
        X.lite(() => {
          for (const [wd, rgb, aa] of [[150, '255,80,30', .35], [100, FIRE, .5], [46, HOT, .8]]) {
            const gr = g.createLinearGradient(a[0], 0, b[0], 0); gr.addColorStop(0, `rgba(${rgb},${aa * al})`); gr.addColorStop(1, `rgba(${rgb},0)`);
            g.fillStyle = gr; g.beginPath(); g.moveTo(a[0], a[1] - 10 * k); g.quadraticCurveTo((a[0] + b[0]) / 2, a[1] - wd * k * fl, b[0], b[1] - wd * .7 * k); g.lineTo(b[0], b[1] + wd * .7 * k); g.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + wd * k * fl, a[0], a[1] + 10 * k); g.closePath(); g.fill();
          }
          X.glow('255,255,255', a[0], a[1], 190 * k, al); const fl2 = F(h[0] + o.face * 320, 0); g.fillStyle = `rgba(${FIRE},${.16 * al})`; g.beginPath(); g.ellipse(fl2[0], fl2[1], 330 * k, 34 * k, 0, 0, TAU); g.fill();
        });
      });
    }
    for (let i = 0; i < 3; i++) V.puff('fire', w[0] + f * rnd(20, 60), w[1] + rnd(-16, 16), f * rnd(700, 960), rnd(-70, 90), rnd(50, 100), .55);
    X.emit(1, w[0] + f * 30, w[1] + rnd(-20, 20), f * rnd(900, 1400), rnd(-160, 160), rnd(2, 5), rnd(.2, .4), HOT);
    if (Math.random() < .5) X.emit(2, w[0] + f * rnd(380, 600), w[1] + rnd(-40, 60), f * rnd(60, 200), rnd(80, 200), rnd(90, 150), rnd(.6, 1), '40,30,34', { s1: 2, a: .5 });
    if (n !== A.n) { A.n = n; if (B.swing(o, 600, { dmg: 5, kb: 300, stun: .3 }, 190)) X.decal('scorch', p.x, 80, FIRE, 5); }
  } },
  { name: 'Maximum: Meteor', cd: 20, below: .55, wind: 1.1, pre: 'crushWind',
    charge(o, p, A, u) {
      if (!A.cry) { A.cry = 1; E.slow(.4); E.banner('極ノ番', 'MAXIMUM: METEOR', 'sm'); X.dim(.72, 2.4); X.flash(LAVA, .2, 1.2); }
      if (Math.random() < .5) X.emit(5, cam.x + rnd(-900, 900), 0, rnd(-20, 20), rnd(200, 600), rnd(3, 6), rnd(.6, 1.4), HOT);      // the whole floor starts to give off sparks
      shake(3 + 5 * u);
    },
    dur: 1.4, run(o, p, A, t) {
      o.rate = 20; o.target = t < 1.1 ? POSE.crush : POSE.idle;
      if (A.s) return;
      A.s = 1;
      const x = clamp(p.x, -760, 760), from = -o.face * 420;
      B.mark(x, 300, 1, '#ff5a2a');
      V.custom(1, u => {                          // it comes down out of the sky: a hill of rock on fire, with everything it has burned streaming off behind it
        const q = u * u, cx = x + from * (1 - q), cy = 150 + 950 * (1 - q), c = F(cx, cy), k = c[2], r = 165 * k, an = Math.atan2(950, -from), spin = E.T * 1.4;
        X.lite(() => {
          for (let i = 0; i < 5; i++) { const l = (240 + i * 130) * k, wd = (150 - i * 22) * k; g.fillStyle = `rgba(${i < 2 ? HOT : i < 4 ? FIRE : LAVA},${.5 - i * .08})`; g.beginPath(); g.moveTo(c[0] + Math.sin(an) * wd, c[1] + Math.cos(an) * wd); g.lineTo(c[0] - Math.cos(an) * l + rnd(-10, 10), c[1] - Math.sin(an) * l); g.lineTo(c[0] - Math.sin(an) * wd, c[1] - Math.cos(an) * wd); g.closePath(); g.fill(); }
          X.glow(FIRE, c[0], c[1], r * 7, .95); X.glow(HOT, c[0], c[1], r * 3.4, .8);
        });
        g.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + spin, rr = r * (.86 + .16 * ((i * 7) % 3) / 2); i ? g.lineTo(c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr) : g.moveTo(c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr); }
        g.closePath(); g.fillStyle = '#24130e'; g.fill(); g.lineWidth = 4; g.strokeStyle = LINE; g.stroke();
        X.lite(() => { g.strokeStyle = `rgba(${HOT},.9)`; g.lineWidth = 3 * k; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + spin; g.beginPath(); g.moveTo(c[0] + Math.cos(a) * r * .2, c[1] + Math.sin(a) * r * .2); g.lineTo(c[0] + Math.cos(a + .35) * r * .6, c[1] + Math.sin(a + .35) * r * .6); g.lineTo(c[0] + Math.cos(a + .1) * r * .9, c[1] + Math.sin(a + .1) * r * .9); g.stroke(); } });
        V.puff('fire', cx + rnd(-80, 80), cy + rnd(40, 150), 0, 200, rnd(80, 150), .4);
        if (Math.random() < .8) X.emit(2, cx + rnd(-60, 60), cy + rnd(60, 200), rnd(-40, 40), rnd(100, 260), rnd(110, 180), rnd(.7, 1.2), '40,26,26', { s1: 2, a: .6 });
        shake(6 + 14 * u);
      });
      B.later(1, () => {
        sfx.blast(); sfx.bf(); shake(44); V.impact(.24, x, 120); V.crack(x, 460); V.rocks(x, 0, 28); V.fire(x, 0, 36); V.fire(x, 190, 22); E.addBlast(x, 150, '255,120,40', 540);
        X.boom(x, 90, 320, FIRE, { n: 40, hot: HOT, flash: .5, life: .8 }); X.pillar(x, 190, 760, FIRE, .9); X.shock(x, 900, LAVA, .9, 18); X.dust(x, 16); X.decal('crater', x, 330, LAVA, 12, 0);
        for (const dx of [-250, 250, -130, 130]) B.later(.08 + Math.abs(dx) * .0006, () => X.boom(x + dx, 40, 110, FIRE, { n: 8, flash: 0, shake: 0 }));
        for (let i = 0; i < 26; i++) X.emit(4, x + rnd(-80, 80), 100, rnd(-700, 700), rnd(500, 1400), rnd(6, 12), 3, i % 3 ? LAVA : HOT, { g: 1900, land: 'scorch' });
        B.add({ life: 2.2, upd(h, dt) { if (Math.random() < dt * 50) V.fire(x + rnd(-300, 300), 0, 1); if (Math.random() < dt * 20) X.emit(2, x + rnd(-260, 260), rnd(40, 160), rnd(-30, 30), rnd(100, 240), rnd(120, 200), rnd(.9, 1.5), '34,24,26', { s1: 2, a: .55, back: Math.random() < .5 }); } });      // and the floor burns for a while after
        B.burst(x, 310, { dmg: 26, kb: 700, lift: 760 }, 400);
      });
    } }
] });

/* ================= Aoi Todo: Boogie Woogie ================= */
const AZURE = '#7ad7ff', AZ = '122,215,255', APART = [-.05, 0, 2, -.9, .3, -.3, 0], CLAP = [.14, 0, 1.5, 1.42, .32, -.32, 0];
// a slab of the floor, torn up and thrown
function rock(s) {
  const c = F(s.x, s.y), k = c[2], a = E.T * 5 * Math.sign(s.vx || 1);
  g.save(); g.translate(c[0], c[1]); g.rotate(a);
  g.beginPath(); for (const [x, y] of [[-52, -30], [-20, -58], [34, -50], [58, -8], [40, 44], [-10, 56], [-50, 26]]) g.lineTo(x * k, y * k);
  g.closePath(); g.fillStyle = '#5a4d66'; g.fill(); g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();
  g.fillStyle = '#7a6c88'; g.beginPath(); g.moveTo(-20 * k, -58 * k); g.lineTo(34 * k, -50 * k); g.lineTo(10 * k, -22 * k); g.lineTo(-30 * k, -26 * k); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-30 * k, -26 * k); g.lineTo(0, 6 * k); g.lineTo(-14 * k, 40 * k); g.moveTo(0, 6 * k); g.lineTo(36 * k, 16 * k); g.stroke();
  g.restore();
  if (Math.random() < .6) X.emit(3, s.x + rnd(-30, 30), s.y + rnd(-30, 30), rnd(-80, 80), rnd(-60, 120), rnd(3, 7), rnd(.4, .8), '90,77,102', { g: 1500, vr: rnd(-9, 9), rot: rnd(0, TAU) });
}
// this time the black sparks choose him
function blackFlash(p) {
  const x = p.x, y = p.y + 150;
  V.impact(.4, x, y); V.crack(x, 330); V.rocks(x, 0, 12); E.addBlast(x, y, '255,36,64', 300);
  for (let i = 0; i < 8; i++) { const a = rnd(0, 6.283), l = rnd(200, 480); V.bolt(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, '#ff2440', rnd(.25, .5), rnd(3, 6), '#060205'); }
  X.dim(.8, .6); X.flash('255,36,64', .4, .4); X.shock(x, 520, '255,36,64', .7, 16); X.flare(x, y, '255,36,64', 520, .3); X.decal('crater', x, 220, '255,36,64', 9, 0);
  E.banner('黒閃', 'BLACK FLASH', 'bf'); sfx.bf(); E.slow(.5); E.zoomIn(.6); shake(34);
}
B.kit('todo', { tech: 'Boogie Woogie', col: AZURE, glow: 'blue', moves: [
  { name: 'Boogie Woogie', cd: 6, min: 180, max: 700, wind: .5, pre: APART, dur: .75, run(o, p, A, t) {
    o.rate = 46;
    if (!A.s) {                                   // one clap, and he and the player have traded places
      A.s = 1; sfx.hit(true); sfx.charge(); shake(14); E.stop(.06);
      const ox = o.x, px = p.x, h = B.fist(o, false);
      X.ghost(o, .6, .4); X.ghost(p, .6, .4);     // where each of them was, for a moment after
      X.flare(h[0], h[1], AZ, 420, .22); X.flash(AZ, .16, .2);
      for (const x of [ox, px]) { V.ring(x, 170, 260, AZURE, .3); E.addBlast(x, 170, '122,215,255', 230); X.pillar(x, 70, 460, AZ, .4); }
      V.custom(.3, u => {                         // and the line the two of them were swapped along
        const a = F(ox, 190), b = F(px, 190), m = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 150 * a[2]];
        X.lite(() => { g.lineCap = 'round'; for (const sg of [1, -1]) { g.strokeStyle = `rgba(${sg > 0 ? AZ : '255,255,255'},${1 - u})`; g.lineWidth = (sg > 0 ? 9 : 3) * a[2] * (1 - u); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(m[0], m[1] + (sg < 0 ? 300 * a[2] : 0), b[0], b[1]); g.stroke(); } g.lineCap = 'butt'; });
      });
      o.x = px; p.x = ox; p.vx = 0; o.face = p.x >= o.x ? 1 : -1;
    }
    const gap = (p.x - o.x) * o.face;
    if (t < .12) { o.target = CLAP; return; }
    if (A.done || t > .42) { o.target = A.done && t < A.at + .25 ? POSE.hook : POSE.idle; return; }
    o.target = POSE.dash; o.vx = gap > 150 ? o.face * 1500 : 0;   // then he is on him from the side he was not watching
    if (gap > -30 && gap < 215) {
      A.done = 1; A.at = t; o.vx = 0; sfx.whoosh(); arc(o, 110, 'rgba(122,215,255,.9)');
      X.dust(o.x, 4, -o.face); X.shock(o.x + o.face * 120, 200, AZ, .3);
      B.swing(o, 240, { dmg: 12, kb: 640, lift: 500 }, 190);
    }
  } },
  { name: 'Brother Rush', cd: 5, max: 280, wind: .42, pre: 'hookWind', dur: .8, run(o, p, A, t) {
    const n = Math.floor(t / .17);
    o.rate = 46; o.target = n > 2 ? POSE.idle : [POSE.jab, POSE.cross, POSE.hook][n]; o.vx = n < 3 && t % .17 < .08 ? o.face * 420 : 0;
    if (n !== A.n && n < 3) {
      A.n = n; sfx.whoosh(); arc(o, 100, 'rgba(122,215,255,.9)');
      const h = B.fist(o, !(n & 1));
      X.flare(h[0] + o.face * 60, h[1], AZ, n === 2 ? 320 : 170, .14); X.ghost(o, .3, .16); if (n === 2) { X.shock(o.x + o.face * 100, 260, AZ, .35); X.dust(o.x, 5, o.face); }
      B.swing(o, 220, n === 2 ? { dmg: 9, kb: 600, lift: 520 } : { dmg: 5, kb: 150, stun: .35 }, 190);
    }
  } },
  { name: 'Boulder Toss', cd: 8, min: 380, wind: .6, pre: 'crushWind',
    charge(o, p, A) { if (!A.r) { A.r = 1; V.crack(o.x + o.face * 60, 190); V.rocks(o.x + o.face * 60, 0, 10); X.dust(o.x + o.face * 60, 8); X.decal('crater', o.x + o.face * 60, 110, AZ, 8, 0); sfx.land(); shake(10); } },
    dur: .7, run(o, p, A, t) {
      o.rate = 44; o.target = t < .4 ? POSE.crush : POSE.idle;
      if (A.s) return;
      A.s = 1; sfx.whoosh();
      const x0 = o.x + o.face * 60, y0 = 300, T = .75, G = 2200, tx = clamp(p.x, -940, 940), hit = { dmg: 13, kb: 420, lift: 520 };
      B.mark(tx, 150, T, AZURE);
      B.shot({ x: x0, y: y0, vx: (tx - x0) / T, vy: (.5 * G * T * T - y0) / T, grav: G, r: 50, a: hit, draw: rock, rgb: '150,140,165',
        land(s) { sfx.blast(); shake(22); V.crack(s.x, 260); V.rocks(s.x, 0, 18); E.addRing(s.x, '185,169,201', 260); X.dust(s.x, 14); X.shock(s.x, 380, '185,169,201', .5, 12); X.decal('crater', s.x, 170, AZ, 9, 0); B.burst(s.x, 150, hit); } });
    } },
  { name: 'Black Flash', cd: 16, below: .55, min: 120, max: 620, wind: .85, pre: 'divWind',
    charge(o, p, A, u) {
      const w = B.fist(o, false);
      V.mote(w[0], w[1], 'red');
      if (Math.random() < .25 + u * .4) V.bolt(w[0], w[1], w[0] + rnd(-130, 130), w[1] + rnd(-130, 130), '#ff2440', .15, 2, '#060205');
      if (Math.random() < .5) X.emit(5, w[0] + rnd(-30, 30), w[1] + rnd(-30, 30), rnd(-80, 80), rnd(-40, 160), rnd(3, 6), rnd(.2, .4), '255,36,64');
    },
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
