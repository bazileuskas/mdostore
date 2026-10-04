/* JUJUTSU UNLIMITEDS — early access: SWITCHER STITCHER. Aoi Todo: Boogie Woogie, a punch with a very long wind-up behind it, and a pebble.
   He is bigger and slower with it and his strikes come slower too; every one of them lands half as hard again. There is no fourth move yet */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, X = JU.cast2;
const { clamp, lerp } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk, CYAN = '#7ad7ff';
const SLOW = .76, M1_RATE = .78, M1_POWER = 1.5, SIZE = 1.2;       // how fast he walks and strikes next to anybody else; what a strike is worth; how big he is
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const hint = text => E.fx.push({ k: 2, x: E.P1.x, y: E.P1.y + 360, n: text, col: CYAN, t: 0, life: 1.4 });
const free = p => !p.move && !p.ps && !p.dead && !(p.dashT > 0);
const CLAP = [.1, 0, 1.5, 1.45, .3, -.3, 0], BACK = [-.42, -.12, .7, -1.5, .5, -.55, 0];        // hands together; and the arm drawn back as far as it will go
let peb = null;                                     // the pebble, for as long as it is anywhere to be swapped with

/* ---------- Boogie Woogie: a clap, and two things are where the other one was ---------- */
function clap(ax, ay, bx, by) {
  sfx.gavel(.75); sfx.hover(); shake(8);
  for (const [x, y] of [[ax, ay], [bx, by]]) { V.ring(x, y + 150, 210, CYAN, .3); V.sparks(x, y + 160, 'blue', 10); }
  E.fx.push({ k: 2, x: ax, y: ay + 400, n: 'CLAP', col: CYAN, t: 0, life: .7 });
}
function swap(p, o) {                               // with whoever he is fighting: position, height and all
  const a = { x: p.x, y: p.y, ground: p.ground }, b = { x: o.x, y: o.y, ground: o.ground };
  Object.assign(p, { x: clamp(b.x, -965, 965), y: b.y, ground: b.ground, vy: 0, vx: 0 });
  Object.assign(o, { x: a.x, y: a.y, ground: a.ground, vy: 0, vx: 0 });
  if (!a.ground) Object.assign(o, { state: 'air', bounced: false });                              // he was in the air: now it is
  else if (!o.ko && o.state !== 'down') Object.assign(o, { state: 'hurt', stun: .55, act: null, tele: 0 });   // it takes it a moment to work out where it is
  p.face = o.x >= p.x ? 1 : -1; o.face = -p.face;
  clap(a.x, a.y, b.x, b.y);
}
function toStone(p) {                               // with the pebble: he is wherever it had got to, and it drops where he was standing
  const a = { x: p.x, y: p.y };
  Object.assign(p, { x: clamp(peb.x, -965, 965), y: Math.max(0, peb.y - 150), vy: 0, vx: 0 });
  p.ground = p.y <= 1; if (p.ground) p.y = 0;
  Object.assign(peb, { x: a.x, y: a.y + 150, vx: 0, vy: 0, t: Math.max(peb.t, 2.9), hit: true });
  p.face = E.P2.x >= p.x ? 1 : -1;
  clap(a.x, a.y, p.x, p.y);
}

const MOVES = {
  // 1 — Boogie Woogie. If the pebble is still in play it is the pebble he changes places with
  strikes: { name: 'Boogie Woogie', cd: 3, dur: .32, glow: 'blue', run(p, m, t) {
    const o = E.P2;
    p.vx = 0; p.rate = 50; p.target = t < .22 ? CLAP : POSE.idle;
    if (m.s || t < .07) return;
    m.s = 1;
    if (peb) toStone(p); else if (!o.ko && !(o.alpha < 1)) swap(p, o); else clap(p.x, p.y, p.x, p.y);
  } },
  // 2 — the arm goes back for the better part of a second, and what comes forward is the size of a door
  crush: { name: 'Stitcher Punch', cd: 12, dur: 1.5, glow: 'blue', run(p, m, t) {
    const W = .9, o = E.P2;
    if (t < W) {
      p.vx = 0; p.rate = 14; p.target = BACK;
      if (!m.c) { m.c = 1; sfx.charge(); }
      const w = E.hand(p, false); if (Math.random() < .8) V.mote(w[0], w[1], 'blue');
      return;
    }
    p.rate = 54; p.target = t < W + .32 ? POSE.div : POSE.idle; p.vx = t < W + .1 ? p.face * 640 : 0;
    if (m.s) return;
    const x = p.x + p.face * 210;
    m.s = t; sfx.bf(); sfx.blast(); shake(36); E.zoomIn(.4);
    V.crack(x, 320); V.rocks(x, 0, 12); V.ring(x, 170, 320, CYAN, .4);
    if (E.tryHit(p, { reach: 330, dmg: 95 / (o.dr || 1), kb: 1500, lift: 560, stun: .9, stop: .32, heavy: 1, col: CYAN, fixed: 1 })) V.impact(.2, o.x, o.y + 150);   // and it goes a long way, limp
  } },
  // 3 — a pebble, thrown for real: it arcs, it bounces, it stings. Press 1 while it is still about and he is where it is
  div: { name: 'Pebble Throw', cd: 5, dur: .45, glow: 'blue', run(p, m, t) {
    p.vx = 0; p.rate = 44; p.target = t < .14 ? POSE.hookWind : t < .34 ? POSE.hook : POSE.idle;
    if (m.s || t < .14) return;
    const w = E.hand(p, true);
    m.s = 1; sfx.whoosh();
    peb = { x: w[0], y: w[1], vx: p.face * 1000, vy: 430, t: 0, n: 0, hit: false };
    hint('1  ·  SWAP WITH THE STONE');
  } },
  manji: { name: 'Coming soon', cd: 1, dur: .01, run() {} }                                       // no fourth move yet: the key does nothing
};

JU.tech.add('switcher', { name: 'Switcher Stitcher', jp: '不義遊戯', mark: '拍', who: 'Aoi Todo', odds: 0, col: CYAN, glow: 'blue', moves: MOVES,
  early: true, skin: X.TODO, as: ['Aoi Todo', '東堂葵'], scale: SIZE });
const DEF = JU.tech.TECH.switcher, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
const press0 = H.press, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart, pow0 = H.power, rate0 = H.m1rate;
H.press = (a, inScene) => {
  if (!inScene && on()) {
    const p = E.P1;
    if (a === 'manji') return true;
    if (a === 'strikes' && peb && free(p)) {        // the stone is still about: the clap does not wait for its cooldown
      E.cd.strikes = Math.max(E.cd.strikes, 1); p.move = { def: MOVES.strikes, key: 'strikes', t: 0 }; E.hud.mv.strikes.classList.add('act');
      return true;
    }
  }
  return press0 ? press0(a, inScene) : false;
};
H.power = (h, o) => (pow0 ? pow0(h, o) : 1) * (on() && o === E.P2 && E.P1.move && E.P1.move.def.m1 ? M1_POWER : 1);   // slower, and half as hard again
H.m1rate = () => (rate0 ? rate0() : 1) * (on() ? M1_RATE : 1);
H.tick = dt => {
  tick0(dt);
  if (!on()) return;
  const p = E.P1, o = E.P2, dir = (E.keys.has('d') || E.keys.has('arrowright') ? 1 : 0) - (E.keys.has('a') || E.keys.has('arrowleft') ? 1 : 0);
  if (free(p) && p.ground && dir) p.x = clamp(p.x - dir * 360 * (1 - SLOW) * dt, -965, 965);     // that much of every step is taken back off him
  if (!peb) return;
  const s = peb;
  s.t += dt;
  if (!s.rest) {
    s.vy -= 2400 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
    if (Math.abs(s.x) > 985) { s.x = clamp(s.x, -985, 985); s.vx *= -.5; }
    if (s.y <= 8 && s.vy < 0) { s.y = 8; s.vy *= -.45; s.vx *= .6; if (++s.n > 3 || s.vy < 70) { s.rest = true; s.vx = s.vy = 0; } else sfx.land(); }
    const hs = o.scale || 1;
    if (!s.hit && !o.ko && !(o.alpha < 1) && Math.abs(o.x - s.x) < 60 * hs && s.y > o.y && s.y < o.y + 290 * hs) {
      s.hit = true; s.vx *= -.3;
      E.applyHit(o, Math.sign(s.vx) > 0 ? -1 : 1, { dmg: 5, kb: 120, stun: .4, stop: .04, col: '#cfd8e0' });
    }
  }
  if (s.t > 3.4) peb = null;
};
function fistShape(c, k, a, face) {                 // the fist that arrives with the punch
  g.save(); g.translate(c[0], c[1]); g.scale(face * k, k); g.globalAlpha = a;
  g.fillStyle = 'rgba(122,215,255,.42)'; g.strokeStyle = 'rgba(220,245,255,.9)'; g.lineWidth = 4; g.lineJoin = 'round';
  g.beginPath(); g.roundRect(-150, -110, 300, 220, 46); g.fill(); g.stroke();
  g.beginPath(); for (const y of [-56, 0, 56]) { g.moveTo(150, y); g.lineTo(70, y); } g.moveTo(-40, -110); g.lineTo(-40, -30); g.lineTo(60, -30); g.stroke();
  g.restore(); g.globalAlpha = 1;
}
H.fx = dt => {
  fx0(dt);
  if (!on()) return;
  const p = E.P1, m = p.move;
  if (m && m.def === MOVES.crush) {
    if (!m.s) { const u = Math.min(1, m.t / .9), w = E.hand(p, false), c = F(w[0] - p.face * 60, w[1] + 10); fistShape(c, c[2] * (.25 + .6 * u), .35 + .5 * u, p.face); }   // growing behind him
    else { const u = Math.min(1, (m.t - m.s) / .28), c = F(p.x + p.face * lerp(120, 360, u), p.y + 180); fistShape(c, c[2] * 1.15, 1 - u, p.face); }                 // and then in front of him
  }
  if (peb) {
    const c = F(peb.x, peb.y), k = c[2];
    g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.blue, c[0], c[1], 70 * k, .5); g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#8f98a3'; g.strokeStyle = LINE; g.lineWidth = 2.5;
    g.beginPath(); g.ellipse(c[0], c[1], 11 * k, 9 * k, peb.x * .02, 0, TAU); g.fill(); g.stroke();
  }
};
H.reset = () => { reset0(); peb = null; flashes.length = 0; };
H.fightStart = (cfg, wave) => {
  start0(cfg, wave); peb = null;
  if (on() && !JU.clan.body()) E.P1.scale = SIZE;   // bigger than he was
};

/* ---------- out on the street (Free Exploration): R is the clap, and it is whoever is nearest that he changes places with ---------- */
const flashes = [];
function streetKey(a) {
  if (a !== 'clan' || !on()) return false;
  const st = JU.street, me = st.me;
  let who = null, best = 760;
  for (const f of st.npcs.concat(st.curses)) { const d = Math.hypot(f.x - me.x, (f.z - me.z) * 1.4); if (d < best) { best = d; who = f; } }
  sfx.gavel(.75); sfx.hover();
  if (!who) { flashes.push({ x: me.x, z: me.z, t: 0 }); return true; }
  const a0 = { x: me.x, z: me.z }, b0 = { x: who.x, z: who.z };
  me.x = b0.x; me.z = b0.z; who.x = a0.x; who.z = a0.z;
  if (who.home !== undefined) { who.home = a0.x; who.calm = 1.5; }                                // a curse keeps prowling round its new spot, and needs a moment before it goes for him
  flashes.push({ x: a0.x, z: a0.z, t: 0 }, { x: b0.x, z: b0.z, t: 0 });
  return true;
}
function streetDraw() {
  for (let i = flashes.length - 1; i >= 0; i--) {
    const f = flashes[i], u = (f.t += 1 / 60) / .35;
    if (u >= 1) { flashes.splice(i, 1); continue; }
    const c = P(f.x, 150, f.z);
    g.strokeStyle = `rgba(122,215,255,${1 - u})`; g.lineWidth = (1 - u) * 10 + 1;
    g.beginPath(); g.arc(c[0], c[1], 210 * u * c[2], 0, TAU); g.stroke();
  }
}

JU.switcher = { MOVES, streetKey, streetDraw, get pebble() { return peb; } };
})();
