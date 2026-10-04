/* JUJUTSU UNLIMITEDS — boss movesets III: Eso and Kechizu (Rot Technique), Maki Zenin (Heavenly Restriction) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, B = JU.boss, Fi = JU.fights;
const { rnd, lerp, clamp, LINE } = E, TAU = Math.PI * 2, { orb } = JU.tech.tk;

/* ================= the Death Paintings: Rot Technique. Their blood has to touch him before Decay can be called ================= */
const ROT = '#e0457a', SPOTS = [[-16, 125, 0], [18, 195, 2], [-2, 250, 4]];
let stain = null;
const stained = () => !!stain && !stain.gone;
function bloody() {
  if (stained()) { stain.t = 0; return; }
  B.say(E.P1, 'BLOODIED', ROT);
  stain = B.add({ life: 8, draw() {                 // it shows on him for as long as it lasts
    const p = E.P1;
    g.fillStyle = '#7a0f24';
    for (const s of SPOTS) { const c = F(p.x + s[0], p.y + s[1]); g.beginPath(); g.arc(c[0], c[1], 8 * c[2], 0, TAU); g.fill(); }
  } });
}
const blob = s => orb(s.x, s.y, s.r * .6, 'red', '#7a0f24');
// a gout of blood lobbed high, coming down on the mark
function lob(o, tx, T, w, a) {
  const x0 = o.x + o.face * 30, y0 = o.y + 250 * (o.scale || 1), G = 2400;
  B.mark(tx, w, T, ROT);
  B.shot({ x: x0, y: y0, vx: (tx - x0) / T, vy: (.5 * G * T * T - y0) / T, grav: G, r: 26, life: 3, trail: 'red', a, draw: blob, hit: bloody,
    land(s) { sfx.land(); V.sparks(s.x, 20, 'red', 10); E.addRing(s.x, '224,69,122', w * 1.6); if (B.burst(s.x, w, a, 200)) bloody(); } });
}
const DECAY = { name: 'Decay', cd: 9, when: stained, wind: .55, pre: 'jab', dur: .5, run(o, p, A) {
  o.target = POSE.jab;
  if (A.s) return;
  A.s = 1; sfx.charge(); B.say(p, '朽', ROT);
  if (stain) stain.t = stain.life;                  // the blood is spent
  for (let i = 0; i < 5; i++) B.later(.1 + i * .45, () => { Fi.chip(3 * B.mul(), ROT); V.ring(E.P1.x, E.P1.y + 150, 90, ROT, .3); });
  V.custom(2.4, u => {                              // the rot opens on him like flowers
    const q = E.P1;
    g.fillStyle = `rgba(122,15,36,${1 - u * u})`;
    for (const s of SPOTS) {
      const c = F(q.x + s[0], q.y + s[1]), r = (9 + 9 * Math.min(1, u * 4)) * c[2];
      for (let i = 0; i < 5; i++) { const an = i * 1.2566 + s[2] + u * 2; g.beginPath(); g.arc(c[0] + Math.cos(an) * r, c[1] + Math.sin(an) * r, r * .6, 0, TAU); g.fill(); }
    }
  });
} };

B.kit('eso', { tech: 'Rot Technique', col: ROT, glow: 'red', moves: [
  { name: 'Wing King', cd: 6, min: 140, max: 540, wind: .5, pre: 'manjiWind', dur: .7, run(o, p, A, t) {
    const n = Math.floor((t - .08) / .14);
    o.rate = 40; o.target = t < .45 ? POSE.div : POSE.idle;
    if (!A.s) {
      A.s = 1; sfx.whoosh();
      const f = o.face, x0 = o.x - f * 20, y0 = o.y + 235 * (o.scale || 1);
      V.custom(.42, u => {                          // wings of blood whipping forward off his back
        const ext = Math.min(1, u * 3.5) * (u > .6 ? (1 - u) / .4 : 1), a = F(x0, y0);
        g.lineCap = 'round'; g.strokeStyle = '#8a1030';
        for (let i = 0; i < 3; i++) {
          const b = F(x0 + f * 560 * ext, 90 + i * 70), m = F(x0 + f * 240 * ext, y0 + 150 - i * 40);
          g.lineWidth = (13 - i * 2) * a[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(m[0], m[1], b[0], b[1]); g.stroke();
        }
        g.lineCap = 'butt';
      });
    }
    if (n >= 0 && n !== A.n && n < 2) { A.n = n; if (B.swing(o, 560, { dmg: 6, kb: n ? 420 : 120, stun: .45 }, 260)) bloody(); }
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
    A.s = 1; sfx.whoosh(); lob(o, clamp(p.x, -940, 940), .72, 125, { dmg: 8, kb: 240, stun: .4 });
  } },
  { name: 'Belly Maw', cd: 6, min: 150, max: 560, wind: .5, pre: 'crushWind', dur: .7, run(o, p, A, t) {
    const gap = (p.x - o.x) * o.face;
    o.rate = 44;
    if (A.done || t > .3) { o.target = A.done && t < A.at + .25 ? POSE.crush : POSE.idle; return; }
    o.target = POSE.dash; o.vx = gap > 140 ? o.face * 1000 : 0;   // he throws himself at him with the mouth in his belly wide open
    if (gap > -30 && gap < 200) {
      A.done = 1; A.at = t; o.vx = 0; sfx.hit(true);
      for (let i = 0; i < 4; i++) V.slash(o.x + o.face * 110, o.y + 110 + i * 18, (i % 2 ? .5 : -.5) + (o.face > 0 ? 0 : Math.PI), 150, '#f4f1e6', 7, i * .02);
      if (B.swing(o, 220, { dmg: 10, kb: 520, lift: 460 }, 190)) bloody();
    }
  } },
  DECAY
] });

/* ================= Maki Zenin: Heavenly Restriction. No cursed energy at all: a body that needs none, and a rack of cursed tools ================= */
const STEEL = '#e8f0ff';
const spear = s => {
  const c = F(s.x, s.y), k = c[2], d = Math.sign(s.vx);
  g.lineCap = 'round'; g.beginPath(); g.moveTo(c[0] - d * 150 * k, c[1]); g.lineTo(c[0] + d * 40 * k, c[1]);
  g.strokeStyle = LINE; g.lineWidth = 9 * k; g.stroke(); g.strokeStyle = '#5a1420'; g.lineWidth = 5 * k; g.stroke(); g.lineCap = 'butt';
  g.beginPath(); g.moveTo(c[0] + d * 86 * k, c[1]); g.lineTo(c[0] + d * 34 * k, c[1] - 11 * k); g.lineTo(c[0] + d * 34 * k, c[1] + 11 * k); g.closePath();
  g.fillStyle = '#cfd8e0'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
};
B.kit('maki', { tech: 'Heavenly Restriction', col: '#7ddc9a', every: [2.2, 3.8], moves: [
  { name: 'Split Soul Katana', cd: 5, min: 200, max: 560, wind: .34, pre: 'dash', dur: .6, run(o, p, A, t) {
    o.rate = 46;
    if (!A.s) { A.s = 1; A.dir = o.face; sfx.whoosh(); }
    if (t < .2) {                                   // straight through him and out the other side
      o.target = POSE.dash; o.vx = Math.abs(o.x + A.dir * 60) < 940 ? A.dir * 2100 : 0;
      if (!A.done && Math.abs(p.x - o.x) < 110) {
        A.done = 1; V.slash(p.x, p.y + 170, A.dir > 0 ? -.3 : Math.PI + .3, 460, STEEL, 14);
        B.burst(p.x, 200, { dmg: 11, kb: 420, lift: 380 }, 190, A.dir);
      }
      return;
    }
    o.face = p.x >= o.x ? 1 : -1; o.target = t < .4 ? POSE.cross : POSE.idle;
  } },
  { name: 'Spear Throw', cd: 6, min: 420, wind: .45, pre: 'hookWind', dur: .5, run(o, p, A, t) {
    o.rate = 46; o.target = t < .3 ? POSE.hook : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.whoosh();                          // thrown low and flat: jump it, or dash through
    B.shot({ x: o.x + o.face * 80, y: o.y + 118, vx: o.face * 1900, r: 24, life: 1.2, a: { dmg: 10, kb: 560, stun: .5 }, draw: spear, hit: s => V.sparks(s.x, s.y, 'fire', 8) });
  } },
  { name: 'Playful Cloud', cd: 7, max: 300, wind: .42, pre: 'manjiWind', dur: .8, run(o, p, A, t) {
    const n = Math.floor(t / .2);
    o.rate = 40; o.target = n < 3 ? (n & 1 ? POSE.cross : POSE.hook) : POSE.idle;
    if (n !== A.n && n < 3) {                       // the three-section staff whirled round her: it reaches both sides
      A.n = n; sfx.whoosh();
      const x = o.x, y = o.y + 175, a0 = n * 2.1;
      V.custom(.2, u => {
        const c = F(x, y), r = 255 * c[2], a = a0 + u * 4.4;
        g.lineCap = 'round';
        for (const [w, col] of [[15, LINE], [9, '#b3162c']]) { g.strokeStyle = col; g.lineWidth = w * c[2]; g.beginPath(); g.ellipse(c[0], c[1], r, r * .34, 0, a, a + 2.3); g.stroke(); }
        g.lineCap = 'butt';
      });
      B.burst(o.x, 285, n === 2 ? { dmg: 10, kb: 640, lift: 560 } : { dmg: 5, kb: 160, stun: .35 }, 190);
    }
  } },
  { name: 'Vanishing Step', cd: 10, below: .65, min: 160, wind: .28, pre: 'dash', dur: .75, run(o, p, A, t) {
    o.rate = 46;
    if (!A.s) {                                     // gone from where she stood, and already behind him
      A.s = 1; sfx.whoosh();
      const old = { skin: o.skin, x: o.x, y: o.y, face: o.face, spin: 1, pose: o.pose.slice(), scale: o.scale }, x1 = clamp(p.x + o.face * 150, -940, 940);
      V.custom(.3, u => E.drawFighter(old, .5 * (1 - u)));
      for (let i = 0; i < 6; i++) V.slash(lerp(o.x, x1, i / 5), 150 + rnd(-60, 60), o.face > 0 ? 0 : Math.PI, 300, STEEL, 4, i * .015);
      o.x = x1; o.vx = 0; o.face = p.x >= o.x ? 1 : -1;
    }
    if (t < .24) { o.target = POSE.crushWind; return; }
    o.target = t < .5 ? POSE.crush : POSE.idle;
    if (!A.done) {
      A.done = 1; sfx.whoosh(); V.slash(o.x + o.face * 120, o.y + 170, o.face > 0 ? -1.1 : Math.PI + 1.1, 380, STEEL, 14);
      B.swing(o, 250, { dmg: 14, kb: 700, lift: 620 }, 190);
    }
  } }
] });
})();
