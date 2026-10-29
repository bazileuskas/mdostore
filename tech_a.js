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
// all four were reworked in Build 0.19, with his purple fire on the hands: soul.js gives them their bodies (and these very objects, which
// combo.js and the Soul Shaper the boss hold on to)
const TRANS = {
  strikes: { name: 'Blade Arm', cd: 3.5, dur: .62, run() {} },
  crush: { name: 'Body Repel', cd: 7, dur: 1.25, run() {} },
  div: { name: 'Idle Transfiguration', cd: 9, dur: .85, run() {} },
  manji: { name: 'Polymorphic Soul Isomer', cd: 13, dur: 1.75, run() {} }
};

/* ================= Disaster Plants: slow, heavy, and the ground itself joins in ================= */
const GREEN = '#7ddc6a';
let lastM1 = -9;
const PLANTS = {
  // Root Spikes, Cursed Buds and Flower Field were reworked in update 0.2v1: plants.js gives these three their bodies
  strikes: { name: 'Root Spikes', cd: 6, dur: .85, run() {} },
  crush: { name: 'Cursed Buds', cd: 7, dur: .6, run() {} },
  div: { name: 'Flower Field', cd: 15, dur: .9, run() {} },
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

JU.tech.add('ten', { name: 'Ten Shadows', jp: '十種影法術', mark: '影', who: 'Shadow Summoner', odds: 19, col: INDIGO, glow: 'indigo', moves: TEN });      // (34 until 0.12v1: Cursed Cannon's 3% came out of it; 31 until 0.19, see tech.js roll())
JU.tech.add('trans', { name: 'Transfiguration', jp: '無為転変', mark: '魂', who: 'Soul Shaper', odds: 14, col: TEAL, glow: 'teal', moves: TRANS });
JU.tech.add('plants', { name: 'Disaster Plants', jp: '呪いの花', mark: '花', who: 'Disaster Bloom', odds: 14, col: GREEN, glow: 'green', moves: PLANTS,
  // one basic attack a second, but each lands twice as hard
  m1() { if (E.T - lastM1 < 1) return false; lastM1 = E.T; return true; },
  aim(p, h) { return p.move && p.move.def.m1 ? Object.assign({}, h, { dmg: h.dmg * 2, kb: h.kb * 1.4, heavy: 1, col: GREEN }) : h; }
});
})();
