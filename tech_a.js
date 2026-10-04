/* JUJUTSU UNLIMITEDS — techniques I: Ten Shadows (Megumi), Transfiguration (Mahito), Disaster Plants (Hanami) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, rnd = E.rnd;
const { sprite, orb, beam, shout, dot, near } = JU.tech.tk;
const shake = v => { cam.shake = Math.max(cam.shake, v); };

/* ================= Ten Shadows: shikigami called out of his shadow ================= */
const INDIGO = '#8f9bff';
const WOLF = [[-58, -52, 84, 34], [18, -70, 40, 34], [-74, -58, 22, 10], [-52, -22, 14, 26], [10, -22, 14, 26], [44, -84, 10, 16]];
const wolfFace = () => { g.fillStyle = '#c2182b'; g.fillRect(40, -62, 8, 6); g.fillStyle = LINE; g.fillRect(48, -52, 6, 5); };
const BIRD = [[-34, -26, 64, 30], [22, -40, 30, 26]];
const birdWings = () => {
  g.fillStyle = '#c9772e';
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(-10, -12); g.lineTo(-74, -12 + s * 72); g.lineTo(22, -12 + s * 22); g.closePath(); g.fill(); g.stroke(); }
  g.fillStyle = '#f4efe0'; g.fillRect(34, -36, 16, 14);
};
const TOAD = [[-52, -62, 104, 62], [-36, -82, 24, 22], [12, -82, 24, 22], [-66, -18, 28, 18], [38, -18, 28, 18]];
const toadEyes = () => { g.fillStyle = LINE; g.fillRect(-28, -76, 8, 10); g.fillRect(20, -76, 8, 10); };

const TEN = {
  strikes: { name: 'Divine Dog', cd: 3, dur: .6, run(p, m, t) {
    p.vx = 0; p.rate = 34; p.target = t < .4 ? POSE.jab : POSE.idle;
    if (t > .1 && !m.s) {
      m.s = 1; sfx.whoosh();
      const x0 = p.x, f = p.face;
      V.custom(.42, u => sprite(x0 + f * (60 + 580 * u), 34 + Math.abs(Math.sin(u * 9)) * 40, f, 1.3, (1 - u) * 6, '#f2f4f8', WOLF, wolfFace));
    }
    if (t > .26 && !m.done) {
      m.done = 1;
      if (E.tryHit(p, { reach: 600, dmg: 9, kb: 320, lift: 400, stop: .08, heavy: 1, col: '#ffffff' })) {
        const o = E.P2;
        for (let i = 0; i < 3; i++) V.slash(o.x, o.y + 120 + i * 40, p.face > 0 ? -.5 : Math.PI + .5, 170, INDIGO, 9, i * .04);
      }
    }
  } },
  crush: { name: 'Nue', cd: 5, dur: .85, run(p, m, t) {
    p.vx = 0; p.rate = 30; p.target = t < .5 ? POSE.hookWind : POSE.idle;
    if (t > .15 && !m.s) {
      m.s = 1; sfx.charge();
      const o = near(p, 760), tx = o ? o.x : p.x + p.face * 320, f = p.face;
      V.custom(.5, u => { const d = Math.min(1, u / .55); sprite(tx - f * 300 * (1 - d), 520 - 360 * d * d, f, 1.5, (1 - u) * 4, '#e09a3c', BIRD, birdWings); });
      E.after(.27, () => {                      // it lands like a thunderbolt and leaves the target numb
        for (let i = 0; i < 6; i++) V.bolt(tx + rnd(-40, 40), 330, tx + rnd(-150, 150), 0, '#ffe066', rnd(.2, .4), rnd(2, 5));
        V.ring(tx, 120, 240, '#ffe066'); shake(14); sfx.blast();
        if (near(p, 800)) E.tryHit(p, { reach: 800, dmg: 12, kb: 160, stun: 1.2, stop: .12, heavy: 1, col: '#ffe066' });
      });
    }
  } },
  div: { name: 'Toad', cd: 5, dur: .8, run(p, m, t) {
    p.vx = 0; p.rate = 30; p.target = t < .45 ? POSE.jab : POSE.idle;
    if (t > .12 && !m.s) {
      m.s = 1; sfx.whoosh();
      const f = p.face, tx = p.x + f * 110, o = near(p, 820), far = tx + f * 600;
      const hit = o && E.tryHit(p, { reach: 820, dmg: 6, kb: -760, stun: .9, stop: .05, col: '#7ddc6a' });   // negative knock-back: it is reeled in
      V.custom(.55, u => {
        const a = F(tx + f * 40, 70), b = F(hit ? E.P2.x : far, 150), ext = Math.min(1, u * 4) * (u > .5 ? Math.max(0, 1 - (u - .5) * 2) : 1);
        g.strokeStyle = '#e8718d'; g.lineWidth = 9 * a[2]; g.lineCap = 'round';
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a[0] + (b[0] - a[0]) * ext, a[1] + (b[1] - a[1]) * ext); g.stroke(); g.lineCap = 'butt';
        sprite(tx, 0, f, 1.2, (1 - u) * 5, '#4f9a52', TOAD, toadEyes);
      });
    }
  } },
  manji: { name: 'Great Serpent', cd: 9, dur: 1, run(p, m, t) {
    p.vx = 0; p.rate = 30; p.target = t < .3 ? POSE.crushWind : t < .7 ? POSE.crush : POSE.idle;
    if (t > .3 && !m.s) {
      m.s = 1;
      const o = near(p, 900), tx = o ? o.x : p.x + p.face * 360, f = p.face;
      V.crack(tx, 260); V.rocks(tx, 0, 12); shake(20); sfx.blast();
      V.custom(.9, u => {                       // the snake punches up through the floor, then sinks back
        const h = Math.sin(Math.min(1, u * 2.2) * Math.PI * .5) * (u > .6 ? 1 - (u - .6) / .4 : 1) * 460;
        for (let i = 0; i < 9; i++) sprite(tx + Math.sin(i * .9 + u * 6) * 26, h * i / 9 + 30, f, 1.25 - i * .04, 1, i % 2 ? '#2f3a66' : '#3d4a80', [[-34, -30, 68, 54]]);
        sprite(tx + Math.sin(8.1 + u * 6) * 26, h + 40, f, 1.2, 1, '#3d4a80', [[-40, -34, 92, 60]], () => { g.fillStyle = '#ffe066'; g.fillRect(28, -24, 12, 8); g.fillStyle = '#f4efe0'; g.fillRect(40, 6, 12, 14); });
      });
      if (o) E.tryHit(p, { reach: 900, dmg: 20, kb: 160, lift: 980, stop: .16, heavy: 1, col: INDIGO });
    }
  } }
};

/* ================= Transfiguration: flesh and souls reshaped by a touch ================= */
const TEAL = '#78e6c8';
const TRANS = {
  strikes: { name: 'Blade Arm', cd: 3, dur: .55, run(p, m, t) {
    p.rate = 40; p.vx = t > .1 && t < .22 ? p.face * 300 : 0; p.target = t < .1 ? POSE.hookWind : t < .36 ? POSE.hook : POSE.idle;
    if (t > .1 && !m.s) {
      m.s = 1; sfx.whoosh();
      V.custom(.24, u => {                      // the forearm stretched into a long blade, swept downward
        const w = E.hand(p, true), a = F(w[0], w[1]), L = 250 * a[2];
        g.save(); g.translate(a[0], a[1]); g.scale(p.face, 1); g.rotate(u * 1.9 - .9);
        g.beginPath(); g.moveTo(0, -14); g.quadraticCurveTo(L * .6, -30, L, 0); g.quadraticCurveTo(L * .5, 10, 0, 14); g.closePath();
        g.fillStyle = '#b9c3cc'; g.fill(); g.lineWidth = 3; g.strokeStyle = LINE; g.stroke(); g.restore();
      });
      V.slash(p.x + p.face * 150, p.y + 170, p.face > 0 ? -.5 : Math.PI + .5, 340, TEAL, 12);
    }
    if (t > .14 && t < .26 && !m.done && E.tryHit(p, { reach: 290, dmg: 10, kb: 440, stun: .5, stop: .09, heavy: 1, col: TEAL })) m.done = 1;
  } },
  crush: { name: 'Body Repel', cd: 5, dur: .7, run(p, m, t) {
    p.vx = 0; p.rate = 34; p.target = t < .25 ? POSE.divWind : t < .5 ? POSE.div : POSE.idle;
    if (t > .25 && !m.s) {
      m.s = 1; sfx.blast();
      const f = p.face, x0 = p.x + f * 80, y = p.y + 170;
      V.custom(.26, u => {                      // a twisted spike of flesh fired like a drill
        const x = x0 + f * 820 * u, c = F(x, y), k = c[2];
        g.save(); g.translate(c[0], c[1]); g.scale(f * k, k); g.beginPath(); g.moveTo(70, 0);
        for (let i = 0; i < 7; i++) g.lineTo(40 - i * 22, (i % 2 ? -1 : 1) * (10 + i * 5));
        g.lineTo(-110, 0);
        for (let i = 6; i >= 0; i--) g.lineTo(32 - i * 22, (i % 2 ? 1 : -1) * (10 + i * 5));
        g.closePath(); g.fillStyle = '#8e7aa8'; g.fill(); g.lineWidth = 3; g.strokeStyle = LINE; g.stroke(); g.restore();
        V.puff('teal', x - f * 60, y + rnd(-20, 20), -f * 200, 0, 40, .2);
      });
      E.after(.1, () => E.tryHit(p, { reach: 840, dmg: 13, kb: 580, lift: 300, stop: .1, heavy: 1, col: TEAL }));
    }
  } },
  div: { name: 'Idle Transfiguration', cd: 8, dur: .8, run(p, m, t) {
    const gap = (E.P2.x - p.x) * p.face;
    p.rate = 40; p.vx = t > .06 && t < .26 && gap > 150 && !m.done ? p.face * 1100 : 0; p.target = t < .12 ? POSE.dash : t < .5 ? POSE.jab : POSE.idle;
    if (t > .08 && t < .3 && !m.done && E.tryHit(p, { reach: 200, dmg: 6, kb: 0, stun: 1.9, stop: .14, col: TEAL })) {
      m.done = 1; sfx.charge(); shout(p, '無為転変', TEAL);
      const o = E.P2;
      dot(o, p.face, 5, .28, { dmg: 5, kb: 0, stun: 1, stop: .03, col: TEAL }, () => { V.ring(o.x, o.y + 150, 120, TEAL, .3); for (let i = 0; i < 4; i++) V.mote(o.x, o.y + 150, 'teal'); });
      V.custom(1.5, u => {                      // its outline will not hold still
        const c = F(o.x, o.y + 150 * (o.scale || 1)), k = c[2];
        g.beginPath();
        for (let i = 0; i <= 14; i++) { const a = i / 14 * 6.283, r = (90 + 26 * Math.sin(a * 5 + E.T * 22) + 16 * Math.sin(a * 3 - E.T * 15)) * k; i ? g.lineTo(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 1.5) : g.moveTo(c[0] + r, c[1]); }
        g.strokeStyle = `rgba(120,230,200,${1 - u})`; g.lineWidth = 4; g.stroke();
      });
    }
  } },
  manji: { name: 'Soul Isomer', cd: 10, dur: 1.1, run(p, m, t) {
    p.vx = 0; p.rate = 30; p.target = t < .5 ? POSE.crushWind : t < .8 ? POSE.crush : POSE.idle;
    if (m.s) return;
    m.s = 1; sfx.charge();
    const o = near(p, 760), tx = o ? o.x : p.x + p.face * 340;
    V.custom(.75, u => {                        // a fused mass of souls swells overhead, then drops
      const grow = Math.min(1, u / .5), y = u < .6 ? 470 : 470 - (u - .6) / .4 * 390, c = F(tx, y), r = 110 * grow * c[2];
      g.fillStyle = '#6d5a86'; g.strokeStyle = LINE; g.lineWidth = 3;
      for (const b of [[0, 0, 1], [-.7, .3, .62], [.7, .25, .66], [-.2, -.6, .6], [.4, -.5, .5]]) { g.beginPath(); g.arc(c[0] + b[0] * r, c[1] + b[1] * r, r * b[2], 0, 6.283); g.fill(); g.stroke(); }
      g.fillStyle = LINE; for (const e of [[-.3, -.1], [.25, .05], [-.6, .35], [.6, .3]]) g.fillRect(c[0] + e[0] * r - 4, c[1] + e[1] * r, 8 * grow, 12 * grow);
    });
    E.after(.72, () => {
      V.crack(tx, 320); V.rocks(tx, 0, 14); V.ring(tx, 80, 330, TEAL, .4); shake(24); sfx.blast();
      if (near(p, 820)) E.tryHit(p, { reach: 820, dmg: 24, kb: 300, lift: 520, stop: .16, heavy: 1, col: TEAL });
    });
  } }
};

/* ================= Disaster Plants: slow, heavy, and the ground itself joins in ================= */
const GREEN = '#7ddc6a';
let lastM1 = -9;
const PLANTS = {
  strikes: { name: 'Root Spikes', cd: 4, dur: .7, run(p, m, t) {
    p.vx = 0; p.rate = 30; p.target = t < .2 ? POSE.crushWind : t < .5 ? POSE.crush : POSE.idle;
    if (t > .2 && !m.s) {
      m.s = 1; sfx.blast(); shake(12);
      const x0 = p.x, f = p.face;
      V.custom(.8, u => {                       // roots spear up out of the floor one after another
        for (let i = 0; i < 7; i++) {
          const d = u * 3 - i * .16, h = d <= 0 ? 0 : Math.min(1, d * 5) * (u > .7 ? (1 - u) / .3 : 1) * (150 + (i % 3) * 50), x = x0 + f * (130 + i * 95);
          if (h <= 0) continue;
          const a = F(x - 26, 0), b = F(x + 26, 0), c = F(x + f * 16, h);
          g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0], c[1]); g.lineTo(b[0], b[1]); g.closePath();
          g.fillStyle = i % 2 ? '#5d4a2e' : '#6f5a38'; g.fill(); g.lineWidth = 3; g.strokeStyle = LINE; g.stroke();
        }
      });
      E.after(.12, () => E.tryHit(p, { reach: 760, dmg: 12, kb: 200, lift: 640, stop: .1, heavy: 1, col: GREEN }));
    }
  } },
  crush: { name: 'Cursed Buds', cd: 6, dur: .6, run(p, m, t) {
    p.vx = 0; p.rate = 34; p.target = t < .4 ? POSE.jab : POSE.idle;
    if (t > .15 && !m.s) {
      m.s = 1; sfx.whoosh();
      const o = near(p, 820), f = p.face, x0 = p.x + f * 70;
      V.custom(.22, u => { for (let i = 0; i < 3; i++) orb(x0 + f * 760 * u, p.y + 130 + i * 40 + Math.sin(u * 9 + i) * 14, 9, 'green', '#2e6b2a'); });
      if (o && E.tryHit(p, { reach: 820, dmg: 6, kb: 80, stun: .6, stop: .05, col: GREEN }))
        dot(o, f, 4, .4, { dmg: 3, kb: 0, stun: .3, col: GREEN }, () => {   // the buds feed on its cursed energy, and he gets it
          p.hp = Math.min(p.max, p.hp + 4); V.puff('green', o.x, o.y + 150, (p.x - o.x) * 2.4, 0, 40, .4); V.ring(p.x, p.y + 150, 60, GREEN, .25);
        });
    }
  } },
  div: { name: 'Flower Field', cd: 12, dur: .9, run(p, m, t) {
    p.vx = 0; p.rate = 26; p.target = t < .6 ? POSE.manjiWind : POSE.idle;
    if (t > .3 && !m.s) {
      m.s = 1; sfx.charge(); shout(p, '花畑', '#ff9ec4');
      const x0 = p.x, o = E.P2, FL = Array.from({ length: 46 }, () => [rnd(-760, 760), rnd(-170, 330), rnd(0, 6), Math.random() < .5]);
      V.custom(4.5, u => {                      // the whole floor comes up in flowers
        const a = Math.min(1, u * 12) * Math.min(1, (1 - u) * 5);
        for (const fl of FL) {
          const q = E.P(x0 + fl[0], 0, E.ZP + fl[1]), s = (9 + 3 * Math.sin(E.T * 3 + fl[2])) * q[2] * a;
          g.fillStyle = fl[3] ? '#ff9ec4' : '#fff3a8';
          for (let i = 0; i < 5; i++) { const an = i * 1.2566 + fl[2]; g.beginPath(); g.arc(q[0] + Math.cos(an) * s, q[1] - s + Math.sin(an) * s * .5, s * .7, 0, 6.283); g.fill(); }
          g.fillStyle = '#ffd23d'; g.beginPath(); g.arc(q[0], q[1] - s, s * .5, 0, 6.283); g.fill();
        }
      }, 0, true);
      if (o.ai && !o.ko) { o.ai.t = 4.5; if (o.state === 'act') { o.state = 'idle'; o.act = null; o.tele = 0; } }   // it forgets it was fighting
      for (let i = 1; i <= 5; i++) E.after(i * .7, () => { p.hp = Math.min(p.max, p.hp + 4); V.ring(p.x, p.y + 150, 70, '#ff9ec4', .3); });
    }
  } },
  manji: { name: 'Solar Beam', cd: 12, dur: 1.3, run(p, m, t) {
    p.vx = 0; p.rate = 26;
    if (t < .7) { p.target = POSE.divWind; const w = E.hand(p, false); V.mote(w[0], w[1] + 60, 'gold'); if (!m.c) { m.c = 1; sfx.charge(); } return; }
    p.target = t < 1.1 ? POSE.div : POSE.idle;
    if (m.s) return;
    m.s = 1; sfx.blast(); shake(26); E.zoomIn(.4);
    const f = p.face, x0 = p.x + f * 90, y = p.y + 185;
    V.custom(.4, u => beam(x0, x0 + f * 1500, y, 70 * (1 - u * u), 'gold', 1 - u));
    if (E.tryHit(p, { reach: 1400, dmg: 30, kb: 950, lift: 320, stop: .2, heavy: 1, col: '#ffd23d' })) V.fire(E.P2.x, 100, 14, 'gold');
  } }
};

JU.tech.add('ten', { name: 'Ten Shadows', jp: '十種影法術', mark: '影', who: 'Megumi Fushiguro', odds: 40, col: INDIGO, glow: 'indigo', moves: TEN });
JU.tech.add('trans', { name: 'Transfiguration', jp: '無為転変', mark: '魂', who: 'Mahito', odds: 20, col: TEAL, glow: 'teal', moves: TRANS });
JU.tech.add('plants', { name: 'Disaster Plants', jp: '呪いの花', mark: '花', who: 'Hanami', odds: 20, col: GREEN, glow: 'green', moves: PLANTS,
  // one basic attack a second, but each lands twice as hard
  m1() { if (E.T - lastM1 < 1) return false; lastM1 = E.T; return true; },
  aim(p, h) { return p.move && p.move.def.m1 ? Object.assign({}, h, { dmg: h.dmg * 2, kb: h.kb * 1.4, heavy: 1, col: GREEN }) : h; }
});
})();
