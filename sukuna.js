/* JUJUTSU UNLIMITEDS — Ryomen Sukuna in Yuji's body: Dismantle, Cleave, Open and the World Slash */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, C = JU.cut;
const { lerp, rnd } = E, TAU = Math.PI * 2, RED = '#ff2440';
let on = false;

// Yuji, with the King of Curses looking out of him
const SUKUNA = Object.assign({}, E.YUJI, {
  head() {
    E.YUJI.head();
    g.fillStyle = '#d0102a';                                                  // red eyes
    g.beginPath(); g.ellipse(5, 2, 2, 3.2, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(17, 2, 1.6, 3.2, 0, 0, TAU); g.fill();
    g.fillStyle = '#0c0a0e';                                                  // the second pair, opened beneath
    g.beginPath(); g.ellipse(5, 10, 3.2, 1.5, .15, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(17, 10, 2.6, 1.5, -.15, 0, TAU); g.fill();
    g.strokeStyle = '#0c0a0e'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath();
    g.moveTo(8, -10); g.lineTo(11, -5); g.lineTo(14, -10);                    // brow mark
    g.moveTo(-6, 11); g.lineTo(0, 17); g.moveTo(-9, 14); g.lineTo(-3, 20);    // cheek lines
    g.moveTo(21, 12); g.lineTo(23, 18);
    g.stroke(); g.lineCap = 'butt';
  }
});

// what a blade does to whatever it reaches: cuts opening through its body, and the ink out of them (big: and pieces)
const cuts = (o, n, len, big, delay) => C.dice(o, n, len, big, delay);
const shout = (p, text, col) => E.fx.push({ k: 2, x: p.x, y: p.y + 390, n: text, col, t: 0, life: 1.1 });

// 0.2v4: none of this is a line drawn across the screen any more. A cut parts what it goes through (cuts.js): the picture slides along it,
// the gap shows black with its edges hot, the floor keeps the gash. The numbers are what they were
const SM = {
  // 1 — invisible blades thrown the length of the arena. Each is seen by what it does on the way: the swing of his hand, the blade of air,
  // the whole arena parted along its path, and a gash in the floor under it
  strikes: { name: 'Dismantle', cd: 2.5, dur: .62, glow: 'red', run(p, m, t) {
    p.rate = 40; p.vx = 0;
    if (t < .12) { p.target = POSE.hookWind; return; }
    const n = Math.min(3, Math.floor((t - .12) / .1));
    p.target = n >= 3 ? POSE.idle : n & 1 ? POSE.jab : POSE.hook;
    if (n < 3 && n !== m.n) {
      const f = p.face, y = p.y + 120 + n * 34, last = n === 2;
      m.n = n; sfx.cut(last ? 1.5 : 1);
      C.arc(p.x, p.y + 175, f, 105, [-.5, .45, -.15][n]);
      C.fly(p.x + f * 110, p.x + f * 1040, y, { r: last ? 150 : 104, dur: .12, tilt: [.28, -.3, 0][n] });
      C.slice(p.x + f * 540, y, (f > 0 ? 0 : Math.PI) + rnd(-.05, .05), last ? 1060 : 900, { shift: last ? 12 : 7, w: last ? 1.25 : .8, delay: .04 });
      C.gash(p.x + f * 150, rnd(-70, 70), p.x + f * 1000, rnd(-70, 70), last ? 9 : 6, 2.4);
      const h = last ? { reach: 950, dmg: 9, kb: 380, lift: 380, stop: .09, heavy: 1, col: RED } : { reach: 950, dmg: 6, kb: 120, stun: .5, stop: .04, col: RED };
      if (E.tryHit(p, h)) { const o = E.P2; cuts(o, last ? 4 : 2, 250, last); if (last) { C.frame(.1, o.x, o.y + 160); C.stamp('解', o.x, o.y + 330 * (o.scale || 1), 190); } }
    }
  } },
  // 2 — step in, one touch, and the target is diced where it stands: cut everywhere at once, cut again four times, and then it comes apart,
  // with the floor under it webbed the way a Cleave put into the ground webs it
  crush: { name: 'Cleave', cd: 5, dur: .85, glow: 'red', run(p, m, t) {
    const o = E.P2, gap = (o.x - p.x) * p.face;
    p.rate = 44;
    if (m.done || t >= .34) { p.vx = 0; p.target = m.done && t < m.done + .45 ? POSE.jab : POSE.idle; return; }
    p.target = POSE.dash; p.vx = t > .08 && gap > 150 ? p.face * 1600 : 0;
    if (t > .08 && gap <= 200 && E.tryHit(p, { reach: 220, dmg: 5, kb: 0, stun: 1.1, stop: .12, col: RED })) {
      m.done = t; p.vx = 0; p.pose = POSE.jab.slice();          // his hand is on it
      const face = p.face;
      sfx.cut(1.3); cuts(o, 9, 300); C.stamp('捌', o.x, o.y + 340 * (o.scale || 1));
      V.ring(o.x - face * 30, o.y + 165 * (o.scale || 1), 110, RED, .2);
      for (let i = 1; i <= 4; i++) E.after(i * .09, () => { if (!o.ko) { E.applyHit(o, face, { dmg: 6, kb: 30, stun: .7, stop: .03, col: RED }); cuts(o, 2, 280); sfx.cut(.8); } });
      E.after(.5, () => {
        if (o.ko) return;
        E.applyHit(o, face, { dmg: 14, kb: 720, lift: 520, stop: .14, heavy: 1, col: RED });
        sfx.cut(1.8); cuts(o, 5, 430, true); C.web(o.x, 320); V.ring(o.x, o.y + 150, 300, RED, .4); C.frame(.17, o.x, o.y + 160);
      });
    }
  } },
  // 3 — fire drawn out into an arrow and loosed. It is a tenth of a second crossing the arena, and where it lands there is a fire
  // standing on a floor cracked and glowing
  div: { name: 'Fuga', cd: 9, dur: 1.15, glow: 'fire', run(p, m, t) {
    const f = p.face, y = p.y + 170;
    p.vx = 0; p.rate = 30;
    if (t < .6) {
      p.target = POSE.divWind;
      const w = E.hand(p, true); V.mote(w[0], w[1], 'fire');
      if (!m.cry) {
        m.cry = 1; shout(p, '■  開', '#ffb060'); sfx.charge(); sfx.rise(.6);
        V.custom(.6, u => {                         // flames turning in to his hand, and out of his hand the arrow
          const h = E.hand(p, true), n = Math.min(1, u * 1.5);
          for (let i = 0; i < 4; i++) { const a = E.T * 7 + i * 1.57, r = 90 * (1 - u * .6); C.tongue(h[0] + Math.cos(a) * r, h[1] - 30 + Math.sin(a) * r * .5, 60 + 40 * u, 30, i * 2.1, .85); }
          C.arrow(h[0] - f * 120 * n, h[1], f, 170 * n, Math.min(1, u * 4));
        });
      }
      return;
    }
    p.target = t < .85 ? POSE.div : POSE.idle; p.rate = 46;
    if (!m.loose) {
      const o = E.P2, far = (o.x - p.x) * f, x0 = p.x + f * 60;
      m.loose = 1; sfx.whoosh();
      m.ex = !o.ko && far > -30 && far < 1100 ? o.x : p.x + f * 800;       // where it is going
      const ex = m.ex;
      V.custom(.1, u => C.arrow(lerp(x0, ex - f * 150, u), y, f, 170));
      V.custom(.5, u => { for (let i = 0; i < 9; i++) if (i / 9 < Math.min(1, u * 5)) C.tongue(lerp(x0, ex, i / 9), y - 40, 90 * (1 - u), 34, i * 1.3, 1 - u); });   // what it leaves burning along the way
    }
    if (m.done || t < .7) return;
    m.done = 1; sfx.fuga();
    const shrine = !!JU.domain && JU.domain.now === 'shrine';       // inside Malevolent Shrine the arrow lands twice as hard
    const hit = E.tryHit(p, { reach: 1100, dmg: shrine ? 100 : 50, kb: 950, lift: 640, stop: .2, heavy: 1, ring: 1, col: '#ff8c50' });
    const ex = hit ? E.P2.x : m.ex;
    C.blaze(ex, shrine ? 330 : 220, shrine ? 560 : 400, shrine ? 1.2 : .95, shrine ? 19 : 13);
    C.web(ex, shrine ? 430 : 300, 3.6); C.cubes(ex, 10, shrine ? 12 : 6, 1.1);
    V.crack(ex, 340); V.rocks(ex, 0, 16); V.ring(ex, 150, 400, '#ffb060', .4);
    for (let i = 0; i < 12; i++) V.puff('fire', ex + rnd(-200, 200), rnd(10, 200), rnd(-300, 300), rnd(200, 700), rnd(20, 40), rnd(.5, 1));
    E.addBlast(ex, 150, '255,140,60', shrine ? 760 : 440);
    cam.shake = 30; E.zoomIn(.5);
  } },
  // 4 — a cut aimed at the world the target stands in. The light goes, a line is drawn across everything, and then the picture splits along it
  manji: { name: 'World Slash', cd: 12, dur: 1.25, run(p, m, t) {
    const f = p.face, ang = f > 0 ? .2 : Math.PI + .2;       // the line of it: the one the picture splits along
    p.vx = 0; p.rate = 26;
    if (t < .55) {
      p.target = POSE.jab;
      if (!m.cry) {
        m.cry = 1; E.slow(.45); E.banner('斬', 'WORLD SLASH', 'sm'); sfx.charge();
        V.custom(.75, u => C.dim(.6 * Math.min(1, u * 4, (1 - u) * 6)), 0, true);
        C.slice(cam.x, p.y + 200, ang, 2600, { shift: 0, w: .7, life: 1.4 });
      }
      return;
    }
    p.target = t < .9 ? POSE.hook : POSE.idle; p.rate = 46;
    if (m.done) return;
    m.done = 1; sfx.bf(); sfx.cut(2.4);
    const o = E.P2;
    V.split(-.2);
    C.slice(cam.x, p.y + 200, ang, 2800, { shift: 18, w: 2.2, life: .5 });
    C.gash(cam.x - 1050, -70, cam.x + 1050, 70, 15, 4.5); C.arc(p.x, p.y + 185, f, 150, .2, .2);
    if (E.tryHit(p, { reach: 1500, dmg: 60, kb: 1100, lift: 560, stop: .28, heavy: 1, col: '#ffffff' })) { cuts(o, 6, 440, true); C.frame(.24, o.x, o.y + 160); }
    cam.shake = 36;
  } }
};

const YUJI_CD = Object.assign({}, E.CD), YUJI_NAMES = {};
for (const k in SM) YUJI_NAMES[k] = E.hud.mv[k].querySelector('b').textContent;

function label() {
  for (const k in SM) { E.hud.mv[k].querySelector('b').textContent = on ? SM[k].name : YUJI_NAMES[k]; E.CD[k] = on ? SM[k].cd : YUJI_CD[k]; E.cd[k] = 0; }
  E.root.classList.toggle('sukuna', on);
  const nm = JU.fights.nm;
  nm.p1.textContent = on ? 'Ryomen Sukuna' : 'Yuji Itadori'; nm.p1j.textContent = on ? '両面宿儺' : '虎杖悠仁';
}
function awaken() {
  const p = E.P1;
  on = true; label();
  p.skin = SUKUNA; p.hp = p.max; p.ps = null; p.dead = false; p.inv = 1.2; p.move = null;
}
function revert() { if (on) { on = false; label(); } }

H.move = k => (on ? SM[k] : null);

const swing0 = H.swing;
H.swing = (p, y, r, col) => {                 // his plain strikes cut as well
  swing0(p, y, r, col);
  if (on || JU.sukuna.style) C.arc(p.x + p.face * 10, p.y + y, p.face, 100, rnd(-.6, .6), .15);
};
const hit0 = H.hit;
H.hit = (o, face, h) => {                     // and what they land on is cut
  hit0(o, face, h);
  const m = E.P1.move;
  if ((on || JU.sukuna.style) && m && m.def.m1) C.dice(o, 1, 190);
};
const under0 = H.under;
H.under = dt => {                             // the air around him runs red
  under0(dt);
  if (!on && !JU.sukuna.style) return;
  const p = E.P1, c = F(p.x, p.y + 140);
  g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.red, c[0], c[1], 460 * c[2], .32 + .08 * Math.sin(E.T * 9)); g.globalCompositeOperation = 'source-over';
  if (Math.random() < dt * 30) V.puff('red', p.x + rnd(-60, 60), p.y + rnd(0, 220), 0, rnd(120, 280), 34, .5);
};
const reset0 = H.reset;
H.reset = () => { reset0(); revert(); };

JU.sukuna = { awaken, revert, SUKUNA, SM, style: false, get on() { return on; } };
})();
