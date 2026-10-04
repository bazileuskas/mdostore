/* JUJUTSU UNLIMITEDS — limited time: BLOOD BROTHER. Choso's Blood Manipulation, and the one technique that changes how the player looks */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights;
const { rnd } = E, TAU = Math.PI * 2, { orb, beam, shout, dot, near } = JU.tech.tk;
const shake = v => { cam.shake = Math.max(cam.shake, v); };

const ENDS = Date.parse('2026-10-11T07:10:00Z');   // seven days from the day he arrived. Move this date to run the event again

/* ================= how he looks ================= */
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.min(255, (n >> 16) * f) | 0},${Math.min(255, (n >> 8 & 255) * f) | 0},${Math.min(255, (n & 255) * f) | 0})`; };
function poly(fill, pts) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
}
const ROBE = ['#d6ccbf', '#eee7dc'], PALE = ['#e3cdbd', '#f3e2d5'], LEGS = ['#cbc0b0', '#e3dacd'], BOOT = ['#2a2530', '#3a3442'], HAIR = '#17141c';
const CHOSO = {
  torso: ROBE,
  armF: [ROBE[0], ROBE[1], PALE[0], PALE[1], .2], armB: [shade(ROBE[0], .62), shade(ROBE[1], .62), shade(PALE[0], .78), shade(PALE[1], .78), .2],
  legF: [LEGS[0], LEGS[1], BOOT[0], BOOT[1], .18], legB: [shade(LEGS[0], .62), shade(LEGS[1], .62), shade(BOOT[0], .62), shade(BOOT[1], .62), .18],
  chest() {                                         // a dark sleeveless vest over the pale robe, tied with a sash
    g.fillStyle = '#3b2c4a'; g.fillRect(-30, -TOR, 42, TOR + 5);
    g.fillStyle = '#2a1f36'; g.beginPath(); g.moveTo(12, -TOR); g.lineTo(23, -TOR); g.lineTo(12, -TOR + 42); g.closePath(); g.fill();
    g.fillStyle = '#b89a6a'; g.fillRect(-30, -21, 60, 8);
  },
  head() {
    poly(HAIR, [-24, -24, -40, -50, -27, -45, -21, -62, -9, -28]);     // two tails tied high, standing straight up
    poly(HAIR, [5, -29, 11, -62, 20, -46, 33, -55, 22, -25]);
    E.headBase(PALE[0], PALE[1]);
    poly(HAIR, [-27, 4, -29, -22, -18, -31, 6, -33, 24, -25, 27, -10, 17, -15, 8, -9, -1, -15, -10, -9, -16, 4]);
    g.fillStyle = 'rgba(80,45,90,.5)'; g.fillRect(1, 2, 9, 3); g.fillRect(13, 2, 8, 3);       // he has not slept in a long time
    g.fillStyle = LINE;
    g.beginPath(); g.ellipse(5, -1, 3.2, 1.7, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(17, -1, 2.7, 1.7, 0, 0, TAU); g.fill();
    g.fillStyle = '#4a1820'; g.fillRect(-1, 6, 25, 4);                                          // the mark across his nose
    g.strokeStyle = LINE; g.lineWidth = 2; g.beginPath(); g.moveTo(8, 16); g.lineTo(17, 16); g.stroke();
  }
};

/* ================= Blood Manipulation ================= */
const BLOOD = '#e0203c', DARK = '#7a0f24';
let scaleT = 0;                                     // seconds of Flowing Red Scale left
const MOVES = {
  // 1 — a wheel of blood thrown flat, sawing at whatever it reaches
  strikes: { name: 'Slicing Exorcism', cd: 3.5, dur: .6, glow: 'red', run(p, m, t) {
    p.vx = 0; p.rate = 40; p.target = t < .12 ? POSE.hookWind : t < .4 ? POSE.hook : POSE.idle;
    if (t > .12 && !m.s) {
      m.s = 1; sfx.whoosh();
      const f = p.face, x0 = p.x + f * 80, y = p.y + 165, o = near(p, 800), x1 = o ? o.x : x0 + f * 760;
      V.custom(.36, u => {
        const c = F(x0 + (x1 - x0) * Math.min(1, u / .5), y), r = 64 * c[2], a = E.T * 30;
        g.lineCap = 'round';
        for (const [w, col] of [[13, DARK], [6, BLOOD]]) { g.strokeStyle = col; g.lineWidth = w * c[2]; g.beginPath(); g.ellipse(c[0], c[1], r, r * .36, 0, a, a + 4.6); g.stroke(); }
        g.lineCap = 'butt';
      });
      E.after(.14, () => {
        if (!E.tryHit(p, { reach: 800, dmg: 5, kb: 60, stun: .6, stop: .05, col: BLOOD })) return;
        const q = E.P2;
        dot(q, f, 3, .09, { dmg: 4, kb: 40, stun: .5, stop: .03, col: BLOOD }, i => {
          V.slash(q.x + rnd(-30, 30), q.y + rnd(100, 220), rnd(-.6, .6) + (i & 1 ? Math.PI : 0), 240, BLOOD, 9);
          if (i === 3) E.applyHit(q, f, { dmg: 2, kb: 460, lift: 360, stop: .08, heavy: 1, col: BLOOD });
        });
      });
    }
  } },
  // 2 — his blood runs hot and fast: for a while everything he does lands harder and his fists come quicker
  crush: { name: 'Flowing Red Scale', cd: 14, dur: .55, glow: 'red', run(p, m, t) {
    p.vx = 0; p.rate = 30; p.target = t < .4 ? POSE.manjiWind : POSE.idle;
    if (m.s) return;
    m.s = 1; scaleT = 8; sfx.charge(); shout(p, '赤鱗躍動', BLOOD);
    V.ring(p.x, p.y + 150, 260, BLOOD, .4); V.sparks(p.x, p.y + 200, 'red', 16); shake(10);
  } },
  // 3 — beads of blood flung out around the target, and then every one of them bursts at once
  div: { name: 'Supernova', cd: 8, dur: .95, glow: 'red', run(p, m, t) {
    p.vx = 0; p.rate = 34; p.target = t < .2 ? POSE.divWind : t < .6 ? POSE.div : POSE.idle;
    if (t > .2 && !m.s) {
      m.s = 1; sfx.whoosh();
      const o = near(p, 780), cx = o ? o.x : p.x + p.face * 340, x0 = p.x + p.face * 70, y0 = p.y + 190;
      const beads = Array.from({ length: 8 }, (_, i) => [cx + Math.cos(i * .785) * rnd(90, 190), 175 + Math.sin(i * .785) * rnd(60, 130)]);
      V.custom(.45, u => { const e = Math.min(1, u * 2.4); for (const b of beads) orb(x0 + (b[0] - x0) * e, y0 + (b[1] - y0) * e, 9 + 3 * Math.sin(u * 30), 'red', DARK); });
      E.after(.45, () => {
        sfx.blast(); shake(20); E.addBlast(cx, 175, '224,32,60', 340);
        for (const b of beads) { V.sparks(b[0], b[1], 'red', 5); V.ring(b[0], b[1], 90, BLOOD, .25); }
        if (near(p, 820)) E.tryHit(p, { reach: 820, dmg: 17, kb: 520, lift: 500, stop: .14, heavy: 1, col: BLOOD });
      });
    }
  } },
  // 4 — Convergence, then Piercing Blood: blood squeezed down to a point and let go faster than sound
  manji: { name: 'Piercing Blood', cd: 11, dur: 1.2, run(p, m, t) {
    p.vx = 0; p.rate = 28;
    if (t < .6) {
      p.target = POSE.divWind;
      const w = E.hand(p, true); V.mote(w[0], w[1], 'red');
      if (!m.c) { m.c = 1; sfx.charge(); shout(p, '百斂', BLOOD); V.custom(.6, u => { const h = E.hand(p, true); orb(h[0] + p.face * 20, h[1], 26 * (1 - u * .7), 'red', DARK); }); }
      return;
    }
    p.target = t < 1 ? POSE.div : POSE.idle; p.rate = 46;
    if (m.s) return;
    m.s = 1; sfx.blast(); shake(24); E.zoomIn(.4);
    const f = p.face, x0 = p.x + f * 90, y = p.y + 185;
    V.custom(.35, u => {
      const a = F(x0, y), b = F(x0 + f * 1500, y);
      beam(x0, x0 + f * 1500, y, 34 * (1 - u), 'red', 1 - u);
      g.globalAlpha = 1 - u; g.strokeStyle = DARK; g.lineWidth = 4 * a[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.globalAlpha = 1;
    });
    if (E.tryHit(p, { reach: 1500, dmg: 32, kb: 760, lift: 300, stop: .2, heavy: 1, col: BLOOD })) {
      const o = E.P2;
      V.sparks(o.x, o.y + 170, 'red', 18);
      for (let i = 0; i < 4; i++) V.slash(o.x + f * rnd(0, 120), o.y + rnd(110, 230), (f > 0 ? 0 : Math.PI) + rnd(-.25, .25), 300, BLOOD, 8, i * .02);
    }
  } }
};

JU.tech.add('blood', { name: 'Blood Brother', jp: '赤血操術', mark: '血', who: 'Choso', odds: 2.5, col: BLOOD, glow: 'red', moves: MOVES,
  limited: ENDS, skin: CHOSO, as: ['Choso', '脹相'],
  tick(dt) {
    if (scaleT <= 0) return;
    const p = E.P1;
    scaleT -= dt;
    if (Math.random() < dt * 26) V.puff('red', p.x + rnd(-50, 50), p.y + rnd(20, 240), 0, rnd(120, 260), 30, .45);
  }
});

// Flowing Red Scale: thirty percent harder, thirty percent quicker
const DEF = JU.tech.TECH.blood, hot = () => scaleT > 0 && JU.tech.active === DEF, pow0 = H.power, rate0 = H.m1rate;
H.power = (h, o) => pow0(h, o) * (hot() && !h.fixed ? 1.3 : 1);
H.m1rate = () => rate0() * (hot() ? 1.3 : 1);

// a technique with a skin of its own puts it on him when a fight starts (unless a clan has him wearing somebody else's body)
const start0 = H.fightStart;
H.fightStart = (cfg, wave) => {
  start0(cfg, wave);
  const t = JU.tech.active;
  scaleT = 0;
  if (t && t.skin && !JU.clan.body()) { E.P1.skin = t.skin; Fi.nm.p1.textContent = t.as[0]; Fi.nm.p1j.textContent = t.as[1]; }
};

JU.choso = { CHOSO, ENDS };
})();
