/* JUJUTSU UNLIMITEDS — Combat Update (0.17): the down slam, the Black Flash down slam, and what happens when a Black Flash is the killing blow */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, H = E.hooks, POSE = E.POSE, cam = E.cam, V = JU.vfx, sfx = JU.sfx, M = E.MOVES;
const { rnd, lerp } = E, TAU = Math.PI * 2, FIN = M.m1[3].hit, INK = '#ff2440';

// driven into the floor instead of sent flying: it comes down hard enough to bounce
function spike(p, o) {
  if (o.poise) return;
  Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 26), vy: -1200, vx: p.face * 200, bounced: false });
}
function crater(x) { V.crack(x, 300); V.rocks(x, 0, 12); E.addRing(x, '255,255,255', 300); cam.shake = Math.max(cam.shake, 22); sfx.blast(); }
// the plunge every slam shares: a beat hanging in the air, straight down, and the floor. Returns true once he has landed
function plunge(p, m, t, hang, pose, hit) {
  if (m.land !== undefined) { p.vx = 0; p.target = t < m.land + .22 ? pose : POSE.idle; if (t > m.land + .3) E.endMove(p); return true; }
  if (p.ground) { m.land = t; p.vy = 0; if (!m.done) hit(); crater(p.x + p.face * 70); return true; }
  if (t < hang) return false;
  p.target = pose; p.vy = -2100; p.vx = p.face * 280;
  if (!m.sw) { m.sw = 1; sfx.whoosh(); }
  if (!m.done) hit();
  return false;
}

/* ---------- the down slam: the last strike of the chain, thrown in the air. Twice what the finisher does on the ground ---------- */
const SLAM = { m1: 1, dur: 1.4, run(p, m, t) {
  const o = E.P2;
  p.rate = 46;
  if (plunge(p, m, t, .1, POSE.crush, () => { if (E.tryHit(p, { reach: 190, dmg: FIN.dmg * 2, kb: 260, stun: .9, stop: .14, heavy: 1, ring: 1 })) { m.done = 1; spike(p, o); } })) return;
  if (t < .1) { p.target = POSE.crushWind; p.vy = Math.max(p.vy, 80); p.vx *= .9; }
} };
const m10 = H.m1;
H.m1 = i => {
  if (!m10(i)) return false;
  if (i !== 3 || E.P1.ground) return true;
  E.P1.move = { def: SLAM, i: 3, t: 0 };            // the chain's last hit, but he is off the ground: it becomes the slam
  return false;
};

/* ---------- Divergent Fist in the air. Hit the Black Flash timing on the way and it lands for three times a Black Flash ---------- */
const AIR = { name: 'Divergent Fist', dur: 1.6, glow: 'blue', run(p, m, t) {
  const W = M.div.windup, o = E.P2;
  p.rate = 40;
  if (t < W) {                                      // hanging there with the fist drawn back: press 3 again as the ring closes
    const w = E.hand(p, false);
    p.target = POSE.divWind; p.vx *= .9; p.vy = Math.max(p.vy, 40);
    if (Math.random() < .8) V.mote(w[0], w[1], m.bf ? 'red' : 'blue');
    return;
  }
  plunge(p, m, t, W, POSE.div, () => {
    if (m.bf) {
      if (E.tryHit(p, { reach: 200, dmg: 90, kb: 300, stop: .3, heavy: 1, col: INK })) { m.done = 1; spike(p, o); E.blackFlash(); }
    } else if (E.tryHit(p, { reach: 195, dmg: 6, kb: 130, stun: .75, stop: .08, col: '#4fc3ff' })) {
      const face = p.face;
      m.done = 1; spike(p, o);
      E.after(.34, () => {                          // the cursed energy catching up, as it does on the ground
        if (o.ko) return;
        E.addBlast(o.x, o.y + 150, '79,195,255', 200); E.addRing(o.x, '79,195,255', 280); sfx.blast();
        E.applyHit(o, face, { dmg: 10, kb: 640, lift: 430, stop: .12, heavy: 1, col: '#4fc3ff' });
      });
    }
  });
} };
const press0 = H.press, fx0 = H.fx;
H.press = (a, inScene) => {
  const p = E.P1;
  if (!inScene && a === 'div') {
    if (p.move && p.move.def === AIR) { M.div.again(p.move); return true; }
    if (!p.ground && !p.move && !p.ps && !p.dead && !(p.dashT > 0) && E.cd.div <= 0 && !(H.move && H.move('div'))) {   // only Yuji's own Divergent Fist
      E.cd.div = E.CD.div; p.move = { def: AIR, key: 'div', t: 0 }; E.hud.mv.div.classList.add('act');
      return true;
    }
  }
  return press0 ? press0(a, inScene) : false;
};
H.fx = dt => {                                      // the same timing ring the move shows on the ground
  fx0(dt);
  const p = E.P1, m = p.move;
  if (!m || m.def !== AIR || m.t >= M.div.windup) return;
  const w = E.hand(p, false), h = F(w[0], w[1]), hot = m.t >= .2 || m.bf;
  g.lineWidth = hot ? 6 : 3;
  g.strokeStyle = m.bf ? '#fff' : hot ? INK : m.tried ? 'rgba(160,160,170,.6)' : 'rgba(79,195,255,.9)';
  g.beginPath(); g.arc(h[0], h[1], lerp(110, 26, m.t / M.div.windup), 0, TAU); g.stroke();
  g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.5)';
  g.beginPath(); g.arc(h[0], h[1], 26, 0, TAU); g.stroke();
};

/* ---------- the Black Flash finisher: the killing blow holds its target where it was hit while the sparks keep coming ---------- */
// The voice line is a sound file of your own, not shipped with the game: sounds/blackflash.mp3 (the one-file build carries it in window.JU_SOUNDS)
const HOLD = 1.5;
let voice = null, mute = false;
function shout() {
  const b = document.getElementById('sfx');
  if (mute || (b && b.getAttribute('aria-pressed') === 'false')) return;
  if (!voice) { voice = new Audio((window.JU_SOUNDS && window.JU_SOUNDS.blackflash) || 'sounds/blackflash.mp3'); voice.addEventListener('error', () => { mute = true; }); }
  try { voice.currentTime = 0; const pl = voice.play(); if (pl && pl.catch) pl.catch(() => {}); } catch (e) {}
}
const bf0 = H.bf;
H.bf = o => {
  bf0(o);
  if (!o.ko) return;
  const x = o.x, y = o.y + 150 * (o.scale || 1), c = F(x, y), sx = c[0] * E.S, sy = c[1] * E.S;
  E.stop(HOLD); E.zoomIn(HOLD);
  for (let i = 0; i < 14; i++) { const a = rnd(0, TAU), l = rnd(240, 640); V.bolt(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, INK, .5, rnd(3, 7), '#060205'); }
  for (const s of [.3, .6, .9, 1.2]) setTimeout(() => { if (JU.game.state.running) { JU.bolts(sx, sy, 10); sfx.hit(true); } }, s * 1000);
  shout(); sfx.charge();
};

JU.combat = { SLAM, AIR };
})();
