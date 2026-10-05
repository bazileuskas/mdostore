/* JUJUTSU UNLIMITEDS — boss movesets III: Eso and Kechizu (Rot Technique), Maki Zenin (Heavenly Restriction).
   Redrawn in the Boss VFX update (the pieces are bossfx.js's): what they do is what it was */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, B = JU.boss, Fi = JU.fights, X = JU.bossfx;
const { rnd, lerp, clamp, LINE } = E, TAU = Math.PI * 2;
const shake = v => { cam.shake = Math.max(cam.shake, v); };

/* ================= the Death Paintings: Rot Technique. Their blood has to touch him before Decay can be called ================= */
const ROT = '#e0457a', RO = '224,69,122', GORE = '122,15,36', ACID = '141,255,106', BILE = '70,140,44', SPOTS = [[-16, 125, 0], [18, 195, 2], [-2, 250, 4]];
let stain = null;
const stained = () => !!stain && !stain.gone;
function bloody() {
  if (stained()) { stain.t = 0; return; }
  B.say(E.P1, 'BLOODIED', ROT);
  stain = B.add({ life: 8, upd(h, dt) { const p = E.P1; if (Math.random() < dt * 9) X.emit(4, p.x + rnd(-24, 24), p.y + rnd(110, 250), rnd(-30, 30), 0, rnd(3, 5), 2, GORE, { g: 1500, land: 'blood' }); },      // it runs off him while it lasts
    draw() {
      const p = E.P1;
      for (const s of SPOTS) {
        const c = F(p.x + s[0], p.y + s[1]), k = c[2];
        g.fillStyle = '#7a0f24'; g.beginPath(); g.arc(c[0], c[1], 9 * k, 0, TAU); g.fill(); g.beginPath(); g.ellipse(c[0] + 2 * k, c[1] + 12 * k, 3.5 * k, 9 * k, 0, 0, TAU); g.fill();
        g.fillStyle = 'rgba(255,170,190,.7)'; g.beginPath(); g.arc(c[0] - 3 * k, c[1] - 3 * k, 2.4 * k, 0, TAU); g.fill();
      }
    } });
}
// a gout of it in the air: thick, shining, pulling itself out of shape as it flies
const blobOf = (rgb, dark) => s => {
  const c = F(s.x, s.y), k = c[2], an = Math.atan2(-s.vy, s.vx), r = s.r * .62 * k, wob = 1 + .14 * Math.sin(E.T * 26 + s.x * .05);
  X.lite(() => X.glow(rgb, c[0], c[1], r * 6, .6));
  g.fillStyle = `rgb(${dark})`; g.strokeStyle = LINE; g.lineWidth = 2;
  g.beginPath(); g.ellipse(c[0], c[1], r * 1.5 * wob, r / wob, an, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = `rgb(${rgb})`; g.beginPath(); g.ellipse(c[0] + Math.cos(an) * r * .3, c[1] + Math.sin(an) * r * .3, r * .9, r * .6, an, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(c[0] - r * .3, c[1] - r * .35, r * .22, 0, TAU); g.fill();
  if (Math.random() < .7) X.emit(4, s.x + rnd(-10, 10), s.y + rnd(-10, 10), s.vx * .2 + rnd(-60, 60), s.vy * .2 + rnd(-60, 60), rnd(3, 6), 2, dark, { g: 1500, land: 'blood' });
};
// where it comes down: a crown of it thrown up, a pool left behind, and (the green kind) the floor hissing under it
function splash(x, w, rgb, dark, sour) {
  sfx.land(); V.sparks(x, 20, sour ? 'green' : 'red', 10); E.addRing(x, rgb, w * 1.6);
  X.shock(x, w * 2, rgb, .4, 8); X.decal('blood', x, w, dark, 8, 0);
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; X.emit(4, x + Math.cos(a) * w * .5, 10, Math.cos(a) * rnd(160, 420), rnd(380, 900), rnd(4, 9), 2, i & 1 ? rgb : dark, { g: 2000, land: 'blood' }); }
  if (sour) B.add({ life: 1.6, upd(h, dt) { if (Math.random() < dt * 26) X.emit(2, x + rnd(-w, w), rnd(0, 20), rnd(-20, 20), rnd(80, 200), rnd(50, 90), rnd(.6, 1), '150,220,120', { s1: 2, a: .4 }); if (Math.random() < dt * 20) X.emit(0, x + rnd(-w, w), rnd(0, 30), 0, rnd(40, 120), rnd(14, 26), rnd(.3, .6), ACID); } });
}
// a gout of blood lobbed high, coming down on the mark
function lob(o, tx, T, w, a, sour) {
  const x0 = o.x + o.face * 30, y0 = o.y + 250 * (o.scale || 1), G = 2400, rgb = sour ? ACID : RO, dark = sour ? BILE : GORE;
  B.mark(tx, w, T, sour ? '#8dff6a' : ROT);
  X.flare(x0, y0, rgb, 130, .14);
  B.shot({ x: x0, y: y0, vx: (tx - x0) / T, vy: (.5 * G * T * T - y0) / T, grav: G, r: 26, life: 3, trail: sour ? 'green' : 'red', a, draw: blobOf(rgb, dark), hit: bloody,
    land(s) { splash(s.x, w, rgb, dark, sour); if (B.burst(s.x, w, a, 200)) bloody(); } });
}
const DECAY = { name: 'Decay', cd: 9, when: stained, wind: .55, pre: 'jab', dur: .5, run(o, p, A) {
  o.target = POSE.jab;
  if (A.s) return;
  A.s = 1; sfx.charge(); B.say(p, '朽', ROT);
  if (stain) stain.t = stain.life;                  // the blood is spent
  X.dim(.5, 2.4); X.flash(RO, .2, .4); X.shock(p.x, 260, RO, .5);
  for (let i = 0; i < 5; i++) B.later(.1 + i * .45, () => {
    const q = E.P1;
    Fi.chip(3 * B.mul(), ROT); V.ring(q.x, q.y + 150, 110, ROT, .3); X.flash(RO, .08, .15);
    for (let j = 0; j < 8; j++) X.emit(3, q.x + rnd(-30, 30), q.y + rnd(110, 260), rnd(-160, 160), rnd(60, 320), rnd(4, 7), rnd(.7, 1.2), j & 1 ? RO : GORE, { g: 500, dr: 1.4, vr: rnd(-9, 9), w: .55, rot: rnd(0, TAU) });      // petals of it coming away
  });
  V.custom(2.4, u => {                              // the rot opens on him like flowers: five petals each, veined, turning as they spread
    const q = E.P1, al = 1 - u * u, open = Math.min(1, u * 4);
    for (const s of SPOTS) {
      const c = F(q.x + s[0], q.y + s[1]), k = c[2], r = (11 + 13 * open) * k;
      X.lite(() => X.glow(RO, c[0], c[1], r * 5, .5 * al));
      for (let i = 0; i < 5; i++) {
        const an = i * 1.2566 + s[2] + u * 2;
        g.fillStyle = `rgba(${GORE},${al})`; g.beginPath(); g.ellipse(c[0] + Math.cos(an) * r, c[1] + Math.sin(an) * r, r * .78, r * .42, an, 0, TAU); g.fill();
        g.strokeStyle = `rgba(255,150,180,${.7 * al})`; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0] + Math.cos(an) * r * 1.6, c[1] + Math.sin(an) * r * 1.6); g.stroke();
      }
      g.fillStyle = `rgba(20,2,8,${al})`; g.beginPath(); g.arc(c[0], c[1], r * .32, 0, TAU); g.fill();
    }
  });
} };

B.kit('eso', { tech: 'Rot Technique', col: ROT, glow: 'red', moves: [
  { name: 'Wing King', cd: 6, min: 140, max: 540, wind: .5, pre: 'manjiWind', dur: .7, run(o, p, A, t) {
    const n = Math.floor((t - .08) / .14);
    o.rate = 40; o.target = t < .45 ? POSE.div : POSE.idle;
    if (!A.s) {
      A.s = 1; sfx.whoosh(); X.flash(RO, .1, .2);
      const f = o.face, x0 = o.x - f * 20, y0 = o.y + 235 * (o.scale || 1);
      V.custom(.46, u => {                          // wings of blood whipping forward off his back: three lashes of it, each ending in a hook
        const ext = Math.min(1, u * 3.5) * (u > .6 ? (1 - u) / .4 : 1), a = F(x0, y0), k = a[2];
        g.lineCap = 'round'; g.lineJoin = 'round';
        for (let i = 0; i < 3; i++) {
          const b = F(x0 + f * 560 * ext, 90 + i * 70), m = F(x0 + f * 240 * ext, y0 + 170 - i * 46 + 26 * Math.sin(u * 14 + i)), tip = F(x0 + f * (560 * ext + 44), 70 + i * 70);
          const lash = () => { g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(m[0], m[1], b[0], b[1]); g.lineTo(tip[0], tip[1]); };
          X.lite(() => { g.strokeStyle = `rgba(${RO},.5)`; g.lineWidth = (30 - i * 4) * k; lash(); g.stroke(); });
          g.strokeStyle = LINE; g.lineWidth = (17 - i * 2) * k; lash(); g.stroke();
          g.strokeStyle = '#8a1030'; g.lineWidth = (12 - i * 2) * k; lash(); g.stroke();
          g.strokeStyle = 'rgba(255,150,180,.8)'; g.lineWidth = 2.4 * k; g.beginPath(); g.moveTo(a[0], a[1] - 3 * k); g.quadraticCurveTo(m[0], m[1] - 4 * k, b[0], b[1] - 3 * k); g.stroke();
          if (Math.random() < .8) X.emit(4, x0 + f * rnd(60, 560) * ext, rnd(90, y0), f * rnd(100, 400), rnd(-100, 200), rnd(3, 6), 2, GORE, { g: 1600, land: 'blood' });
        }
        g.lineCap = 'butt';
      });
    }
    if (n >= 0 && n !== A.n && n < 2) { A.n = n; X.shock(o.x + o.face * 300, 260, RO, .3, 6); if (B.swing(o, 560, { dmg: 6, kb: n ? 420 : 120, stun: .45 }, 260)) bloody(); }
  } },
  { name: 'Blood Rain', cd: 8, min: 200, wind: .55, pre: 'hookWind', dur: .6, run(o, p, A, t) {
    o.rate = 40; o.target = t < .4 ? POSE.hook : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.whoosh();
    [-170, 0, 170].forEach((dx, i) => lob(o, clamp(p.x + dx, -940, 940), .7 + i * .16, 95, { dmg: 7, kb: 200, stun: .4 }));
  } },
  DECAY
] });

B.kit('kechizu', { tech: 'Rot Technique', col: '#8dff6a', glow: 'green', moves: [
  { name: 'Corrosive Spit', cd: 5, min: 220, wind: .5, pre: 'hookWind', dur: .5, run(o, p, A, t) {
    o.rate = 40; o.target = t < .3 ? POSE.hook : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.whoosh(); lob(o, clamp(p.x, -940, 940), .72, 125, { dmg: 8, kb: 240, stun: .4 }, true);
  } },
  { name: 'Belly Maw', cd: 6, min: 150, max: 560, wind: .5, pre: 'crushWind', dur: .7, run(o, p, A, t) {
    const gap = (p.x - o.x) * o.face;
    o.rate = 44;
    if (A.done || t > .3) { o.target = A.done && t < A.at + .25 ? POSE.crush : POSE.idle; return; }
    o.target = POSE.dash; o.vx = gap > 140 ? o.face * 1000 : 0;   // he throws himself at him with the mouth in his belly wide open
    if (Math.random() < .6) X.emit(4, o.x + o.face * 40, o.y + rnd(100, 190), -o.face * rnd(60, 260), rnd(0, 240), rnd(3, 6), 2, BILE, { g: 1500, land: 'blood' });
    if (gap > -30 && gap < 200) {
      A.done = 1; A.at = t; o.vx = 0; sfx.hit(true); shake(14);
      const f = o.face, bx = o.x + f * 120, by = o.y + 150;
      V.custom(.28, u => {                          // the jaws themselves, shutting on him
        const c = F(bx, by), k = c[2], open = (1 - Math.min(1, u * 2.6)) * 80 * k, al = 1 - Math.max(0, u - .6) / .4;
        g.globalAlpha = al;
        for (const sg of [-1, 1]) {
          g.fillStyle = '#3c0d1c'; g.beginPath(); g.ellipse(c[0], c[1] + sg * (open + 26 * k), 120 * k, 40 * k, 0, 0, TAU); g.fill();
          g.fillStyle = '#f4f1e6'; g.strokeStyle = LINE; g.lineWidth = 2;
          for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(c[0] + (i * 24 - 11) * k, c[1] + sg * (open + 12 * k)); g.lineTo(c[0] + i * 24 * k, c[1] + sg * (open - 30 * k)); g.lineTo(c[0] + (i * 24 + 11) * k, c[1] + sg * (open + 12 * k)); g.closePath(); g.fill(); g.stroke(); }
        }
        g.globalAlpha = 1;
      });
      for (let i = 0; i < 4; i++) V.slash(bx, o.y + 110 + i * 18, (i % 2 ? .5 : -.5) + (f > 0 ? 0 : Math.PI), 190, '#f4f1e6', 8, .1 + i * .02);
      for (let i = 0; i < 14; i++) X.emit(4, bx, by, f * rnd(100, 600) + rnd(-200, 200), rnd(0, 600), rnd(4, 8), 2, i & 1 ? ACID : BILE, { g: 1800, land: 'blood' });
      if (B.swing(o, 220, { dmg: 10, kb: 520, lift: 460 }, 190)) bloody();
    }
  } },
  DECAY
] });

/* ================= Maki Zenin: Heavenly Restriction. No cursed energy at all: a body that needs none, and a rack of cursed tools ================= */
const STEEL = '#e8f0ff', ST = '232,240,255';
const spear = s => {
  const c = F(s.x, s.y), k = c[2], d = Math.sign(s.vx);
  X.lite(() => { g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 3 * k; for (const dy of [-16, 0, 16]) { g.beginPath(); g.moveTo(c[0] - d * (170 + Math.abs(dy) * 4) * k, c[1] + dy * k); g.lineTo(c[0] - d * (360 + rnd(0, 80)) * k, c[1] + dy * k); g.stroke(); } });     // the air it has just come through
  g.lineCap = 'round'; g.beginPath(); g.moveTo(c[0] - d * 150 * k, c[1]); g.lineTo(c[0] + d * 40 * k, c[1]);
  g.strokeStyle = LINE; g.lineWidth = 9 * k; g.stroke(); g.strokeStyle = '#5a1420'; g.lineWidth = 5 * k; g.stroke(); g.lineCap = 'butt';
  g.beginPath(); g.moveTo(c[0] + d * 96 * k, c[1]); g.lineTo(c[0] + d * 34 * k, c[1] - 13 * k); g.lineTo(c[0] + d * 34 * k, c[1] + 13 * k); g.closePath();
  g.fillStyle = '#cfd8e0'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
  X.lite(() => X.glow('255,255,255', c[0] + d * 80 * k, c[1], 90 * k, .8));
};
// a blade's worth of sparks off whatever it met
const steel = (x, y, n = 10) => { for (let i = 0; i < n; i++) { const a = rnd(0, TAU), v = rnd(300, 1100); X.emit(1, x, y, Math.cos(a) * v, Math.sin(a) * v + 200, rnd(2, 4), rnd(.2, .45), i & 1 ? '255,200,120' : '255,255,255', { g: 2200 }); } };
B.kit('maki', { tech: 'Heavenly Restriction', col: '#7ddc9a', every: [2.2, 3.8], moves: [
  { name: 'Split Soul Katana', cd: 5, min: 200, max: 560, wind: .34, pre: 'dash', dur: .6, run(o, p, A, t) {
    o.rate = 46;
    if (!A.s) { A.s = 1; A.dir = o.face; A.x0 = o.x; sfx.whoosh(); X.dust(o.x, 6, -o.face); }
    if (t < .2) {                                   // straight through him and out the other side
      o.target = POSE.dash; o.vx = Math.abs(o.x + A.dir * 60) < 940 ? A.dir * 2100 : 0;
      if (!A.done && Math.abs(p.x - o.x) < 110) {
        A.done = 1; E.stop(.07); shake(14);
        V.slash(p.x, p.y + 170, A.dir > 0 ? -.3 : Math.PI + .3, 620, STEEL, 16); V.slash(p.x, p.y + 170, A.dir > 0 ? .5 : Math.PI - .5, 420, STEEL, 9, .05);
        X.flare(p.x, p.y + 170, ST, 460, .2); X.flash(ST, .14, .15); steel(p.x, p.y + 170, 14);
        V.custom(.3, u => { const a = F(A.x0, 175), b = F(o.x, 175); X.lite(() => { g.strokeStyle = `rgba(255,255,255,${1 - u})`; g.lineWidth = 5 * a[2] * (1 - u); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }); });       // the line she went down
        B.burst(p.x, 200, { dmg: 11, kb: 420, lift: 380 }, 190, A.dir);
      }
      return;
    }
    o.face = p.x >= o.x ? 1 : -1; o.target = t < .4 ? POSE.cross : POSE.idle;
  } },
  { name: 'Spear Throw', cd: 6, min: 420, wind: .45, pre: 'hookWind', dur: .5, run(o, p, A, t) {
    o.rate = 46; o.target = t < .3 ? POSE.hook : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.whoosh(); X.dust(o.x, 5, -o.face); X.shock(o.x, 240, ST, .3, 6);      // thrown low and flat: jump it, or dash through
    B.shot({ x: o.x + o.face * 80, y: o.y + 118, vx: o.face * 1900, r: 24, life: 1.2, rgb: ST, a: { dmg: 10, kb: 560, stun: .5 }, draw: spear, hit: s => { V.sparks(s.x, s.y, 'fire', 8); steel(s.x, s.y); } });
  } },
  { name: 'Playful Cloud', cd: 7, max: 300, wind: .42, pre: 'manjiWind', dur: .8, run(o, p, A, t) {
    const n = Math.floor(t / .2);
    o.rate = 40; o.target = n < 3 ? (n & 1 ? POSE.cross : POSE.hook) : POSE.idle;
    if (n !== A.n && n < 3) {                       // the three-section staff whirled round her: it reaches both sides
      A.n = n; sfx.whoosh();
      const x = o.x, y = o.y + 175, a0 = n * 2.1;
      V.custom(.22, u => {
        const c = F(x, y), r = 255 * c[2], a = a0 + u * 4.4, k = c[2];
        X.lite(() => { g.strokeStyle = `rgba(255,90,110,${.5 * (1 - u)})`; g.lineWidth = 46 * k; g.beginPath(); g.ellipse(c[0], c[1], r, r * .34, 0, a - .9, a + 2.3); g.stroke(); });       // the blur of it
        g.lineCap = 'round';
        for (let s = 0; s < 3; s++) {               // its three red lengths, and the links between
          const s0 = a + s * .8, s1 = s0 + .62;
          for (const [w, col] of [[16, LINE], [10, '#b3162c']]) { g.strokeStyle = col; g.lineWidth = w * k; g.beginPath(); g.ellipse(c[0], c[1], r, r * .34, 0, s0, s1); g.stroke(); }
          g.strokeStyle = '#cfd8e0'; g.lineWidth = 4 * k; g.beginPath(); g.ellipse(c[0], c[1], r, r * .34, 0, s1, s1 + .18); g.stroke();
        }
        g.lineCap = 'butt';
      });
      X.dust(o.x, 4); X.shock(o.x, n === 2 ? 420 : 300, n === 2 ? '255,90,110' : ST, .32, n === 2 ? 12 : 6); if (n === 2) { shake(16); V.crack(o.x, 200); }
      B.burst(o.x, 285, n === 2 ? { dmg: 10, kb: 640, lift: 560 } : { dmg: 5, kb: 160, stun: .35 }, 190);
    }
  } },
  { name: 'Vanishing Step', cd: 10, below: .65, min: 160, wind: .28, pre: 'dash', dur: .75, run(o, p, A, t) {
    o.rate = 46;
    if (!A.s) {                                     // gone from where she stood, and already behind him
      A.s = 1; sfx.whoosh();
      const x0 = o.x, x1 = clamp(p.x + o.face * 150, -940, 940);
      for (let i = 0; i < 5; i++) X.ghost({ skin: o.skin, x: lerp(x0, x1, i / 5), y: o.y, face: o.face, spin: 1, pose: (i ? POSE.dash : o.pose).slice(), scale: o.scale }, .5 - i * .06, .26 + i * .05);
      for (let i = 0; i < 6; i++) V.slash(lerp(x0, x1, i / 5), 150 + rnd(-60, 60), o.face > 0 ? 0 : Math.PI, 300, STEEL, 4, i * .015);
      X.dust(x0, 8, -o.face); X.dust(x1, 6, o.face); X.shock(x0, 240, ST, .3, 6);
      o.x = x1; o.vx = 0; o.face = p.x >= o.x ? 1 : -1;
    }
    if (t < .24) { o.target = POSE.crushWind; return; }
    o.target = t < .5 ? POSE.crush : POSE.idle;
    if (!A.done) {
      A.done = 1; sfx.whoosh(); shake(18);
      const x = o.x + o.face * 120;
      V.slash(x, o.y + 170, o.face > 0 ? -1.1 : Math.PI + 1.1, 480, STEEL, 16); V.slash(x, o.y + 170, o.face > 0 ? -1.3 : Math.PI + 1.3, 320, STEEL, 7, .04);
      V.crack(x, 220); V.rocks(x, 0, 8); X.dust(x, 8); X.shock(x, 320, ST, .4, 10); X.flare(x, o.y + 120, ST, 360, .18); steel(x, 60, 12);
      B.swing(o, 250, { dmg: 14, kb: 700, lift: 620 }, 190);
    }
  } }
] });
})();
