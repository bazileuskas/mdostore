/* JUJUTSU UNLIMITEDS — techniques II: Limitless (Gojo), Projection Sorcery (Naoya), Shrine (Sukuna) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx;
const { orb, beam, shout, near } = JU.tech.tk;
const shake = v => { cam.shake = Math.max(cam.shake, v); };

/* ================= Limitless: attraction, repulsion, and the space in between ================= */
const BLUE = '#38c8ff', RED = '#ff2440';
let infT = 0;                                    // seconds of Infinity left
const LIMIT = {
  strikes: { name: 'Lapse: Blue', cd: 4, dur: .7, run(p, m, t) {
    p.vx = 0; p.rate = 30; p.target = t < .5 ? POSE.jab : POSE.idle;
    if (t > .18 && !m.s) {
      m.s = 1; sfx.charge();
      const f = p.face, ox = p.x + f * 330, oy = p.y + 175;
      V.custom(.6, u => { orb(ox, oy, 34 * Math.min(1, u * 5) * (u > .8 ? (1 - u) * 5 : 1), 'blue', '#06203a'); V.mote(ox, oy, 'blue'); });
      // everything nearby is dragged toward the point, wherever it started
      const tug = (dmg, lift) => { const o = near(p, 950); if (o) E.applyHit(o, ox > o.x ? 1 : -1, { dmg, kb: Math.min(700, Math.abs(ox - o.x) * 2.4), lift, stun: .7, stop: .06, heavy: lift ? 1 : 0, col: BLUE }); };
      tug(7, 0); E.after(.32, () => tug(7, 340));
    }
  } },
  crush: { name: 'Reversal: Red', cd: 5, dur: .65, run(p, m, t) {
    p.vx = 0; p.rate = 34; p.target = t < .22 ? POSE.divWind : t < .45 ? POSE.jab : POSE.idle;
    if (t > .22 && !m.s) {
      m.s = 1; sfx.blast();
      const f = p.face, x0 = p.x + f * 90, y = p.y + 175, o = near(p, 840), ex = o ? o.x : x0 + f * 760;
      V.custom(.14, u => orb(x0 + (ex - x0) * u, y, 22, 'red', '#fff'));
      E.after(.1, () => {
        V.ring(ex, y, 300, RED, .35); V.sparks(ex, y, 'red', 16); E.addBlast(ex, y, '255,44,72', 300); shake(20);
        E.tryHit(p, { reach: 860, dmg: 14, kb: 1150, lift: 380, stop: .12, heavy: 1, col: RED });
      });
    }
  } },
  div: { name: 'Infinity', cd: 10, dur: .35, run(p, m) {
    p.vx = 0; p.target = POSE.idle;
    if (m.s) return;
    m.s = 1; infT = 3.2; sfx.charge(); shout(p, '無下限', BLUE);
    V.custom(3.2, u => {                          // nothing that comes at him ever arrives
      const q = E.P1, c = F(q.x, q.y + 140), r = (150 + 6 * Math.sin(E.T * 9)) * c[2];
      g.strokeStyle = `rgba(120,210,255,${.7 * Math.min(1, (1 - u) * 6)})`; g.lineWidth = 3;
      g.beginPath(); g.arc(c[0], c[1], r, 0, 6.283); g.stroke();
      g.setLineDash([6, 14]); g.beginPath(); g.arc(c[0], c[1], r * .86, E.T, E.T + 6.283); g.stroke(); g.setLineDash([]);
    });
  } },
  manji: { name: 'Hollow Purple', cd: 14, dur: 1.5, run(p, m, t) {
    const f = p.face, hx = p.x + f * 120, hy = p.y + 190;
    p.vx = 0; p.rate = 26;
    if (t < .8) {
      p.target = POSE.manjiWind;
      if (!m.c) {
        m.c = 1; E.slow(.4); E.banner('虚式', 'HOLLOW PURPLE', 'sm'); sfx.charge();
        V.custom(.8, u => {                       // blue and red brought together
          const s = 1 - Math.min(1, u * 1.5);
          orb(hx - 90 * s, hy + 70 * s, 22, 'blue', '#06203a'); orb(hx + 90 * s, hy - 70 * s, 22, 'red', '#3a0610');
          if (u > .66) orb(hx, hy, 60 * (u - .66) * 3, 'purple', '#1a0630');
        });
      }
      return;
    }
    p.target = t < 1.2 ? POSE.div : POSE.idle;
    if (m.s) return;
    m.s = 1; sfx.bf(); shake(34); E.zoomIn(.5);
    V.custom(.36, u => { const x = hx + f * 1500 * u; beam(hx, x, hy, 60, 'purple', .5 * (1 - u)); orb(x, hy, 96, 'purple', '#14042a'); });
    for (let i = 1; i < 6; i++) V.crack(hx + f * i * 230, 150);
    if (E.tryHit(p, { reach: 1500, dmg: 55, kb: 1250, lift: 500, stop: .26, heavy: 1, col: '#b79bff' })) V.impact(.18, E.P2.x, E.P2.y + 150);
  } }
};

/* ================= Projection Sorcery: a second cut into twenty-four frames ================= */
const GOLD = '#ffd23d';
let frozen = 0;                                  // seconds the opponent stays pinned in its frame
// the path he took, laid out as a strip of film
function frames(x0, x1, y) {
  const n = Math.max(2, Math.min(6, Math.round(Math.abs(x1 - x0) / 90)));
  V.custom(.4, u => {
    for (let i = 0; i < n; i++) {
      const c = F(x0 + (x1 - x0) * i / (n - 1), y), k = c[2], a = (1 - u) * (.25 + .6 * i / n);
      g.fillStyle = `rgba(255,210,61,${a * .25})`; g.strokeStyle = `rgba(255,236,170,${a})`; g.lineWidth = 2.5;
      g.beginPath(); g.rect(c[0] - 46 * k, c[1] - 262 * k, 92 * k, 268 * k); g.fill(); g.stroke();
    }
  });
}
const blink = (p, x) => { const x0 = p.x; p.x = E.clamp(x, -950, 950); frames(x0, p.x, p.y); sfx.whoosh(); };

const PROJ = {
  strikes: { name: 'Frame Dash', cd: 2.5, dur: .4, run(p, m, t) {
    p.vx = 0; p.rate = 46; p.target = t < .25 ? POSE.cross : POSE.idle;
    if (t > .05 && !m.s) {
      m.s = 1;
      const o = near(p, 720), f = p.face;
      if (o) { E.tryHit(p, { reach: 720, dmg: 8, kb: 60, stun: .7, stop: .06, col: GOLD }); blink(p, o.x + f * 130); p.face = -f; }   // through it and out the far side
      else blink(p, p.x + f * 440);
    }
  } },
  crush: { name: 'Freeze Frame', cd: 7, dur: .55, run(p, m, t) {
    p.rate = 44; p.vx = t > .06 && t < .16 ? p.face * 700 : 0; p.target = t < .3 ? POSE.jab : POSE.idle;
    if (t > .08 && t < .24 && !m.done && E.tryHit(p, { reach: 200, dmg: 5, kb: 0, stun: 2.2, stop: .1, col: GOLD })) {
      m.done = 1; frozen = 2.2; sfx.charge(); shout(p, '1/24', GOLD);
      const o = E.P2;
      V.custom(2.2, u => {                        // caught in a single frame, flat as a photograph
        if (frozen <= 0) return;
        const c = F(o.x, o.y), k = c[2] * (o.scale || 1);
        g.fillStyle = 'rgba(255,236,170,.16)'; g.strokeStyle = `rgba(255,236,170,${.9 * Math.min(1, (1 - u) * 5)})`; g.lineWidth = 4;
        g.beginPath(); g.rect(c[0] - 70 * k, c[1] - 280 * k, 140 * k, 290 * k); g.fill(); g.stroke();
      });
    }
  } },
  div: { name: '24 Frames', cd: 8, dur: 1, run(p, m, t) {
    const o = E.P2, n = Math.floor(t / .1);
    p.vx = 0; p.rate = 50;
    if (n > 7) { p.target = POSE.idle; return; }
    p.target = [POSE.jab, POSE.cross, POSE.hook, POSE.kick][n % 4];
    if (n === m.n) return;
    m.n = n;
    if (m.lock || near(p, 900)) {                 // he is somewhere new every frame
      m.lock = 1;
      const side = n % 2 ? 1 : -1;
      blink(p, o.x + side * 120); p.face = -side;
      E.tryHit(p, n === 7 ? { reach: 190, dmg: 9, kb: 700, lift: 520, stop: .12, heavy: 1, col: GOLD } : { reach: 190, dmg: 4, kb: 0, stun: .5, stop: .02, col: GOLD });
    } else if (!n) blink(p, p.x + p.face * 300);
  } },
  manji: { name: 'Mach', cd: 12, dur: 1.1, run(p, m, t) {
    p.vx = 0; p.rate = 34;
    if (t < .45) { p.target = POSE.dash; V.mote(p.x, p.y + 120, 'gold'); if (!m.c) { m.c = 1; sfx.charge(); shout(p, '亜音速', GOLD); } return; }
    p.target = t < .8 ? POSE.div : POSE.idle;
    if (m.s) return;
    m.s = 1; sfx.bf(); shake(30);
    const f = p.face, x0 = p.x, hit = E.tryHit(p, { reach: 1500, dmg: 34, kb: 1050, lift: 460, stop: .2, heavy: 1, col: GOLD });
    blink(p, x0 + f * 1300);
    for (let i = 0; i < 6; i++) V.ring(x0 + (p.x - x0) * i / 5, p.y + 150, 150 + i * 16, '#ffffff', .3 + i * .03);   // the sound barrier, broken six times over
    if (hit) V.impact(.14, E.P2.x, E.P2.y + 150);
  } }
};

// Awakening: first he fixes his hair. Then twenty-four punches in under two seconds.
let boost = 0;                                   // seconds of awakened strength left
const HAIR = [-.06, .2, 2.95, .25, .12, -.12, 0];
const AWAKEN = { name: 'Awakening', dur: 3.3, glow: 'gold', run(p, m, t) {
  const o = E.P2;
  p.vx = 0;
  if (t < 1.15) {
    p.target = HAIR; p.rate = 9;
    if (!m.c) {
      m.c = 1; E.slow(.5); E.banner('覚醒', 'AWAKENING', 'sm'); sfx.charge(); shout(p, 'Hmph.', GOLD);
      V.custom(1.1, u => {                        // glints off the hair he is so pleased with
        const w = E.hand(p, true);
        g.fillStyle = `rgba(255,243,176,${1 - u})`;
        for (let i = 0; i < 4; i++) {
          const c = F(w[0] + Math.cos(i * 1.7 + u * 5) * 46, w[1] + 30 + Math.sin(i * 2.3 + u * 7) * 30), s = (8 + 6 * Math.sin(u * 20 + i)) * c[2];
          g.beginPath(); g.moveTo(c[0], c[1] - s); g.lineTo(c[0] + s * .3, c[1]); g.lineTo(c[0], c[1] + s); g.lineTo(c[0] - s * .3, c[1]); g.closePath(); g.fill();
          g.beginPath(); g.moveTo(c[0] - s, c[1]); g.lineTo(c[0], c[1] + s * .3); g.lineTo(c[0] + s, c[1]); g.lineTo(c[0], c[1] - s * .3); g.closePath(); g.fill();
        }
      });
    }
    return;
  }
  const n = Math.floor((t - 1.15) / .065);
  p.rate = 60;
  if (n < 24) {
    p.target = n & 1 ? POSE.cross : POSE.jab;
    if (n === m.n) return;
    m.n = n;
    if (!m.lock && near(p, 1300)) { m.lock = 1; blink(p, o.x - p.face * 115); }
    E.tryHit(p, { reach: 230, dmg: 2.2, kb: 0, stun: .5, stop: .012, col: GOLD });
    const w = E.hand(p, !(n & 1)); V.ring(w[0], w[1], 44, GOLD, .14);
    if (n % 3 === 0) sfx.whoosh();
    return;
  }
  p.target = t < 3 ? POSE.div : POSE.idle;
  if (m.fin) return;
  m.fin = 1; boost = 15; sfx.bf(); shake(30);
  if (E.tryHit(p, { reach: 240, dmg: 18, kb: 1100, lift: 520, stop: .22, heavy: 1, col: GOLD })) V.impact(.16, o.x, o.y + 150);
} };

JU.tech.add('limitless', { name: 'Limitless', jp: '無下限呪術', mark: '蒼', who: 'Satoru Gojo', odds: 10, col: BLUE, glow: 'blue', moves: LIMIT,
  guard(face, a) {                               // Infinity: the blow stops short and the attacker is shoved off
    if (infT <= 0 || (a && a.pierce)) return false;   // unless it is the Inverted Spear of Heaven
    const p = E.P1, o = E.P2;
    V.ring(p.x - face * 70, p.y + 150, 130, BLUE, .25); o.vx = -face * 520; sfx.hover();
    return true;
  },
  tick(dt) { if (infT > 0) infT -= dt; }
});
JU.tech.add('projection', { name: 'Projection Sorcery', jp: '投射呪法', mark: '速', who: 'Naoya Zenin', odds: 5, col: GOLD, glow: 'gold', moves: PROJ, dash: .45,
  dashFx: { t: .3, v: 1650, tint: 1 },           // the dash runs much further and leaves blue frames of him behind
  awaken(p) { p.move = { def: AWAKEN, t: 0 }; },
  aim(p, h) {                                    // a frozen target stays frozen under light hits and shatters under a heavy one
    if (boost > 0) h = Object.assign({}, h, { dmg: h.dmg * 1.3 });
    if (frozen <= 0 || !near(p, h.reach)) return h;
    if (!h.heavy) return Object.assign({}, h, { stun: Math.max(h.stun || 0, frozen) });
    const o = E.P2;
    frozen = 0; V.rocks(o.x, 120, 12); V.ring(o.x, o.y + 150, 260, GOLD, .35); sfx.hit(true);
    return Object.assign({}, h, { dmg: h.dmg * 1.6 });
  },
  tick(dt) { if (frozen > 0) frozen -= dt; if (boost > 0) boost -= dt; }
});
JU.tech.add('shrine', { name: 'Shrine', jp: '御廚子', mark: '斬', who: 'Ryomen Sukuna', odds: 5, col: RED, glow: 'red', moves: JU.sukuna.SM });
})();
