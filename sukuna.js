/* JUJUTSU UNLIMITEDS — Ryomen Sukuna in Yuji's body: Dismantle, Cleave, Open and the World Slash */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx;
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

// a flurry of cuts opening on whatever was hit
function cuts(o, n, len, delay = 0) {
  for (let i = 0; i < n; i++) V.slash(o.x + rnd(-50, 50), o.y + rnd(70, 250) * (o.scale || 1), rnd(-1.1, 1.1) + (Math.random() < .5 ? 0 : Math.PI), len * rnd(.8, 1.2), RED, 9, delay + i * .03);
}
const shout = (p, text, col) => E.fx.push({ k: 2, x: p.x, y: p.y + 390, n: text, col, t: 0, life: 1.1 });

const SM = {
  // 1 — invisible blades thrown the length of the arena
  strikes: { name: 'Dismantle', cd: 2.5, dur: .62, glow: 'red', run(p, m, t) {
    p.rate = 40; p.vx = 0;
    if (t < .12) { p.target = POSE.hookWind; return; }
    const n = Math.min(3, Math.floor((t - .12) / .1));
    p.target = n >= 3 ? POSE.idle : n & 1 ? POSE.jab : POSE.hook;
    if (n < 3 && n !== m.n) {
      m.n = n; sfx.whoosh();
      V.slash(p.x + p.face * 500, p.y + 120 + n * 34, p.face > 0 ? rnd(-.07, .07) : Math.PI + rnd(-.07, .07), 900, RED, 5);
      const h = n === 2 ? { reach: 950, dmg: 9, kb: 380, lift: 380, stop: .09, heavy: 1, col: RED } : { reach: 950, dmg: 6, kb: 120, stun: .5, stop: .04, col: RED };
      if (E.tryHit(p, h)) cuts(E.P2, 3, 260);
    }
  } },
  // 2 — step in, one touch, and the target is diced where it stands
  crush: { name: 'Cleave', cd: 5, dur: .85, glow: 'red', run(p, m, t) {
    const o = E.P2, gap = (o.x - p.x) * p.face;
    p.rate = 44;
    if (m.done || t >= .34) { p.vx = 0; p.target = m.done && t < m.done + .45 ? POSE.jab : POSE.idle; return; }
    p.target = POSE.dash; p.vx = t > .08 && gap > 150 ? p.face * 1600 : 0;
    if (t > .08 && gap <= 200 && E.tryHit(p, { reach: 220, dmg: 5, kb: 0, stun: 1.1, stop: .12, col: RED })) {
      m.done = t; p.vx = 0;
      const face = p.face;
      cuts(o, 12, 300);
      for (let i = 1; i <= 4; i++) E.after(i * .09, () => { if (!o.ko) { E.applyHit(o, face, { dmg: 6, kb: 30, stun: .7, stop: .03, col: RED }); cuts(o, 3, 280); } });
      E.after(.5, () => { if (!o.ko) { E.applyHit(o, face, { dmg: 14, kb: 720, lift: 520, stop: .14, heavy: 1, col: RED }); V.ring(o.x, o.y + 150, 300, RED, .4); } });
    }
  } },
  // 3 — fire drawn out into an arrow and loosed
  div: { name: 'Fuga', cd: 9, dur: 1.15, glow: 'fire', run(p, m, t) {
    p.vx = 0; p.rate = 30;
    if (t < .6) {
      p.target = POSE.divWind;
      const w = E.hand(p, true); V.mote(w[0], w[1], 'fire');
      if (!m.cry) { m.cry = 1; shout(p, '■  開', '#ffb060'); sfx.charge(); }
      return;
    }
    p.target = t < .85 ? POSE.div : POSE.idle; p.rate = 46;
    if (m.done) return;
    m.done = 1; sfx.blast();
    const shrine = !!JU.domain && JU.domain.now === 'shrine';       // inside Malevolent Shrine the arrow lands twice as hard
    const hit = E.tryHit(p, { reach: 1100, dmg: shrine ? 100 : 50, kb: 950, lift: 640, stop: .2, heavy: 1, ring: 1, col: '#ff8c50' });
    const ex = hit ? E.P2.x : p.x + p.face * 800;
    for (let i = 0; i < 14; i++) V.puff('fire', lerp(p.x + p.face * 80, ex, i / 14), p.y + 170, p.face * 300, rnd(-30, 60), 110, .3);   // the arrow's wake
    V.fire(ex, 0, 26); V.fire(ex, 130, 14); V.crack(ex, 340); V.rocks(ex, 0, 16); V.ring(ex, 150, 400, '#ffb060', .4);
    E.addBlast(ex, 150, '255,140,60', shrine ? 760 : 440); if (shrine) { V.fire(ex, 60, 30); V.rocks(ex, 0, 14); }
    cam.shake = 30; E.zoomIn(.5);
  } },
  // 4 — a cut aimed at the world the target stands in. The picture splits with it.
  manji: { name: 'World Slash', cd: 12, dur: 1.25, run(p, m, t) {
    p.vx = 0; p.rate = 26;
    if (t < .55) {
      p.target = POSE.jab;
      if (!m.cry) { m.cry = 1; E.slow(.45); E.banner('斬', 'WORLD SLASH', 'sm'); sfx.charge(); }
      return;
    }
    p.target = t < .9 ? POSE.hook : POSE.idle; p.rate = 46;
    if (m.done) return;
    m.done = 1; sfx.bf();
    const o = E.P2;
    V.split(-.2);
    V.slash(p.x + p.face * 600, p.y + 190, p.face > 0 ? -.2 : Math.PI + .2, 2800, '#ffffff', 15);
    if (E.tryHit(p, { reach: 1500, dmg: 60, kb: 1100, lift: 560, stop: .28, heavy: 1, col: '#ffffff' })) { cuts(o, 7, 440); V.impact(.2, o.x, o.y + 150); }
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
  if (on || JU.sukuna.style) V.slash(p.x + p.face * 120, p.y + y, (p.face > 0 ? 0 : Math.PI) + rnd(-.7, .7), 230, RED, 8);
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
