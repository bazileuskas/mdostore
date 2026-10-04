/* JUJUTSU UNLIMITEDS — the Boss Update: every boss fights with a moveset of its own. This file is the plumbing they share */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights;
const { rnd, lerp } = E, TAU = Math.PI * 2, fight = Fi.fight, EVERY = [2.6, 4.4];
const REAL = { tryHit: E.tryHit, applyHit: E.applyHit, after: E.after, P2: Object.getOwnPropertyDescriptor(E, 'P2') };
const haz = [];
let epoch = 0, shown = null, lit = -1, locks = '';

const mul = () => (fight.cfg && fight.cfg.rage && fight.time > fight.cfg.rage ? 2.2 : 1);
// a word over a fighter's head, kept clear of the health bars however tall it is
function say(o, text, col) {
  let y = o.y + 270 * (o.scale || 1) + 90;
  const c = F(o.x, y);
  if (c[1] < 250) y -= (250 - c[1]) / c[2];
  E.fx.push({ k: 2, x: o.x, y, n: text, col, t: 0, life: 1.2 });
}
const fist = (o, front) => { const h = E.hand(o, front), s = o.scale || 1; return [o.x + (h[0] - o.x) * s, o.y + (h[1] - o.y) * s]; };
// like E.after, but forgotten if the fight is interrupted or restaged before it comes due
const later = (t, fn) => { const ep = epoch; REAL.after(t, () => { if (ep === epoch) fn(); }); };
// the player's technique slots are shut for a while
const seal = t => { for (const k of JU.tech.SLOTS) E.cd[k] = Math.max(E.cd[k], t); };

/* ---------- did it catch him? Dashing through still dodges; jumping clears anything lower than `high` ---------- */
function swing(o, reach, a, high = 150) {         // in front of the boss
  const p = E.P1, dx = (p.x - o.x) * o.face;
  return dx > -30 && dx < reach && p.y < high && Fi.hurt(o.face, a, mul());
}
function burst(x, w, a, high = 150, face) {       // standing inside an area of the floor
  const p = E.P1;
  return Math.abs(p.x - x) < w && p.y < high && Fi.hurt(face || (p.x >= x ? 1 : -1), a, mul());
}

/* ---------- things a boss leaves in the arena: shots, shockwaves, marks on the floor ---------- */
function add(h) { h.t = 0; haz.push(h); return h; }
function clear() { for (const h of haz) h.gone = 1; haz.length = 0; epoch++; }
function fly(s, dt) {
  const p = E.P1;
  if (s.home) {                                   // it steers for him
    const tx = p.x - s.x, ty = p.y + 150 - s.y, d = Math.hypot(tx, ty) || 1, k = 1 - Math.exp(-dt * 3.2);
    s.vx += (tx / d * s.home - s.vx) * k; s.vy += (ty / d * s.home - s.vy) * k;
  } else s.vy -= s.grav * dt;
  s.x += s.vx * dt; s.y += s.vy * dt;
  if (s.trail && Math.random() < dt * 50) V.puff(s.trail, s.x, s.y, -s.vx * .1, rnd(-40, 40), s.r * 1.5, .25);
  if (Math.abs(p.x - s.x) < s.r + 28 && s.y + s.r > p.y && s.y - s.r < p.y + 290) {
    if (Fi.hurt(Math.sign(s.vx) || 1, s.a, mul())) { if (s.hit) s.hit(s); return false; }
    if (s.home && p.dashT > 0) { if (s.end) s.end(s); return false; }   // dashed through: it bursts on nothing
  }
  if (s.y <= 0 && (s.grav || s.home)) { if (s.land) s.land(s); return false; }
  return Math.abs(s.x) < 1200;
}
// s: { x, y, vx, vy, grav, home (speed), r, life, a (the hit), trail, draw(s), hit(s), land(s), end(s) }
const shot = s => add(Object.assign({ vy: 0, grav: 0, r: 30, life: 2.4, upd: fly }, s));
// a shock running along the floor: jump it
function wave(x, dir, speed, range, a, col) {
  add({ life: range / speed, x,
    upd(h, dt) {
      const p = E.P1;
      h.x += dir * speed * dt;
      if (Math.random() < dt * 30) V.rocks(h.x, 0, 1);
      if (!h.hit && Math.abs(p.x - h.x) < 60 && p.y < 60 && Fi.hurt(dir, a, mul())) h.hit = 1;
    },
    draw(h) {
      const c = F(h.x, 0), k = c[2], u = 1 - h.t / h.life;
      g.globalAlpha = .85 * u; g.fillStyle = col;
      g.beginPath(); g.moveTo(c[0] - dir * 90 * k, c[1]); g.lineTo(c[0], c[1] - 110 * k * u); g.lineTo(c[0] + dir * 30 * k, c[1]); g.closePath(); g.fill();
      g.globalAlpha = 1;
    } });
}
// a warning painted on the floor where something is about to land; it fills as the time runs out
function mark(x, w, life, col) {
  add({ life, under(h) {
    const c = F(x, 0), k = c[2], u = h.t / life;
    g.fillStyle = g.strokeStyle = col; g.lineWidth = 3;
    g.globalAlpha = .1 + .22 * u; g.beginPath(); g.ellipse(c[0], c[1], w * k, w * k * .26, 0, 0, TAU); g.fill();
    g.globalAlpha = .5 + .5 * u; g.stroke();
    g.beginPath(); g.ellipse(c[0], c[1], w * k * u, w * k * .26 * u, 0, 0, TAU); g.stroke();
    g.globalAlpha = 1;
  } });
}

/* ---------- a player's technique, turned round: while the move runs, "the opponent" is the player ---------- */
function engage(c) {
  E.tryHit = (who, h) => land(c, h);
  E.applyHit = (who, face, h) => strike(c, face, h);
  E.after = (t, fn) => REAL.after(t, () => { if (c.ep === epoch && !c.o.ko) mirror(c, fn); });
  Object.defineProperty(E, 'P2', { get: () => E.P1, configurable: true });
}
function release() { E.tryHit = REAL.tryHit; E.applyHit = REAL.applyHit; E.after = REAL.after; Object.defineProperty(E, 'P2', REAL.P2); }
function mirror(c, fn) { engage(c); try { fn(); } finally { release(); } }
// the hit itself is dealt with the engine put back the way it was: a guard may want to answer the real boss
function strike(c, face, h) {
  release();
  try {
    const s = c.mv.scale || c.kit.scale || .8;
    if (c.took && !h.lift && (h.kb || 0) < 100) { Fi.chip(h.dmg * s * mul(), h.col); return true; }   // follow-up ticks wear him down without staggering him
    const ok = Fi.hurt(face, { dmg: h.dmg * s, kb: (h.kb || 0) * .85, lift: h.lift && h.lift * .9, stun: Math.min(h.stun || .4, .8) }, mul());
    if (ok) c.took = 1;
    return ok;
  } finally { engage(c); }
}
function land(c, h) {
  const o = c.o, p = E.P1, dx = (p.x - o.x) * o.face;
  if (dx < -30 || dx > h.reach || p.y > 150) return false;
  if (c.mv.spot && Math.abs(p.x - c.spot) > c.mv.spot[1]) return false;      // it only comes down where it was aimed
  return strike(c, o.face, h);
}
function turned(o, p, A, t) {
  const m = A.a, c = A.K || (A.K = { o, A, mv: m, kit: o.ai.d.kit, ep: epoch, took: 0, spot: m.spot ? m.spot[0](o, p) : 0 });
  mirror(c, () => m.of.run(o, A, t));
  if (m.then && !c.th && t >= (m.at || 0)) { c.th = 1; m.then(o, p, c); }
}

/* ---------- a moveset ----------
   kit:  { tech, col, glow, scale, every: [min, max] seconds between moves, shots (keeps its plain energy blast), moves }
   move: { name, cd, min / max (distance to the player), below (only once its health is under this share), when(o, p),
           wind (seconds of warning), pre (pose held through it), charge(o, p, A, u), dur, run(o, p, A, t, dt) }
      or { of: one of the player's technique moves, cd, min, max, below, wind, pre, scale, spot: [where(o, p), radius], at, then(o, p, c) } */
function kit(id, k) {
  const d = Fi.DEFS[id];
  k.moves = k.moves.map(m => (m.of ? Object.assign({ name: m.of.name, dur: m.of.dur, run: turned }, m) : m));
  d.kit = k;
  if (!k.shots) d.atk = d.atk.filter(a => !a.shot);   // what it throws from range is its technique now
}

// making room: a quick slide back when something it has ready wants more distance than this
const BACK = { wind: .01, dur: .26, run(o, p, A, t) {
  o.target = POSE.kickWind; o.rate = 40; o.vx = -o.face * 1900 * (1 - t / .26);
  if (!A.s) { A.s = 1; E.addDust(o.x); sfx.whoosh(); }
} };

const idle0 = H.foeIdle, act0 = H.foeAct;
H.foeIdle = (o, p, dt) => {
  const ai = o.ai, k = ai && ai.d.kit;
  if (k && ai.kcd && ai.kt <= 0 && !p.dead && !fight.paused && !(o.alpha < 1)) {
    const ad = Math.abs(p.x - o.x), hp = o.hp / o.max, near = m => ad <= (m.max || 9e9);
    const ready = k.moves.filter((m, i) => ai.kcd[i] <= 0 && hp <= (m.below || 1) && (!m.when || m.when(o, p)));
    let pool = ready.filter(m => ad >= (m.min || 0) && near(m));
    if (ready.some(m => ad < (m.min || 0)) && (!pool.length || Math.random() < .4)) {   // something it has ready wants more room: back off once, and failing that do it point-blank
      if (!ai.back && Math.abs(o.x - o.face * 300) < 940) { ai.back = 1; o.state = 'act'; o.act = { a: BACK, t: 0 }; return; }
      if (!pool.length) pool = ready.filter(near);
    }
    ai.back = 0;
    if (pool.length) {
      const m = pool[Math.random() * pool.length | 0], ev = k.every || EVERY;
      ai.kcd[k.moves.indexOf(m)] = m.cd; ai.kt = rnd(ev[0], ev[1]);
      o.state = 'act'; o.act = { a: m, t: 0 }; o.tele = 0;
      say(o, m.name.toUpperCase(), k.col); sfx.charge();
      return;
    }
    ai.kt = .35;                                  // nothing fits from here: look again in a moment
  }
  idle0(o, p, dt);
};
H.foeAct = (o, p, dt) => {
  const A = o.act, m = A.a;
  if (!m.run) return act0(o, p, dt);
  const w = m.wind || .5, d = o.ai.d;
  A.t += dt; o.rate = 30; o.vx *= Math.exp(-dt * 10); o.tele = 0;
  if (A.t < w) {                                  // the warning: it squares up to him and holds the pose
    o.face = p.x >= o.x ? 1 : -1; o.target = typeof m.pre === 'string' ? POSE[m.pre] : m.pre || POSE.hookWind;
    if (m.charge) m.charge(o, p, A, A.t / w);
    return;
  }
  m.run(o, p, A, A.t - w, dt);
  if (o.act === A && o.state === 'act' && A.t - w >= m.dur) {
    const ev = d.kit.every || EVERY;
    o.state = 'idle'; o.act = null; o.ai.kt = m === BACK ? 0 : rnd(ev[0], ev[1]); o.ai.t = rnd(d.gap[0], d.gap[1]);
  }
};

/* ---------- its moveset, listed under its health bar ---------- */
const strip = document.createElement('div');
strip.className = 'kit'; E.root.querySelector('.fb.p2').appendChild(strip);
function sync() {
  const o = E.P2, k = (o.ai && o.ai.d.kit) || null;
  if (k !== shown) {
    shown = k; lit = -1; locks = '';
    strip.classList.toggle('on', !!k);
    if (k) { strip.style.setProperty('--c', k.col); strip.innerHTML = `<b>${k.tech}</b>` + k.moves.map(m => `<span>${m.name}</span>`).join(''); }
  }
  if (!k) return;
  const A = o.state === 'act' && o.act, now = A && A.a.run ? k.moves.indexOf(A.a) : -1, hp = o.hp / o.max;
  const lk = k.moves.map(m => (hp > (m.below || 1) ? 1 : 0)).join('');      // moves it is holding back until it is hurt
  if (lk !== locks) { locks = lk; k.moves.forEach((m, i) => strip.children[i + 1].classList.toggle('off', lk[i] === '1')); }
  if (now !== lit) {
    if (lit >= 0) strip.children[lit + 1].classList.remove('on');
    if (now >= 0) strip.children[now + 1].classList.add('on');
    lit = now;
  }
}

const tick0 = H.tick, fx0 = H.fx, under0 = H.under, reset0 = H.reset, start0 = H.fightStart;
H.tick = dt => {
  tick0(dt);
  const ai = E.P2.ai, k = ai && ai.d.kit;
  if (k) {                                        // its moves come back on their own clock, whatever else it is doing
    if (!ai.kcd) { ai.kcd = k.moves.map(() => 0); ai.kt = rnd(1.4, 2.6); }
    for (let i = 0; i < ai.kcd.length; i++) ai.kcd[i] -= dt;
    ai.kt -= dt;
  }
  for (let i = haz.length - 1; i >= 0; i--) {
    const h = haz[i];
    h.t += dt;
    const out = h.t >= h.life;
    if (out && h.end) h.end(h);
    if (out || (h.upd && h.upd(h, dt) === false)) { h.gone = 1; haz.splice(i, 1); }
  }
  sync();
};
H.under = dt => {
  under0(dt);
  const o = E.P2, k = o.ai && o.ai.d.kit;
  if (k && k.glow && !o.ko && !(o.alpha < 1)) {   // its technique's colour pooling at its feet, the same as the player's does
    const c = F(o.x, o.y + 30);
    g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW[k.glow], c[0], c[1], 340 * c[2] * (o.scale || 1), .24 + .06 * Math.sin(E.T * 5)); g.globalCompositeOperation = 'source-over';
  }
  for (const h of haz) if (h.under) h.under(h);
};
H.fx = dt => {
  fx0(dt);
  if (fight.paused && haz.length) clear();        // a cutscene clears the air
  const o = E.P2, A = o.state === 'act' && o.act;
  if (A && A.a.run && A.t < (A.a.wind || .5)) {    // a double ring in its technique's colour closing in: a move from its own set is coming
    const u = A.t / (A.a.wind || .5), hs = o.scale || 1, c = F(o.x, o.y + 150 * hs);
    g.strokeStyle = o.ai.d.kit.col; g.globalAlpha = .45 + .55 * u;
    g.lineWidth = 5; g.beginPath(); g.arc(c[0], c[1], lerp(180, 50, u) * hs * c[2], 0, TAU); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.arc(c[0], c[1], lerp(240, 60, u) * hs * c[2], 0, TAU); g.stroke();
    g.globalAlpha = 1;
  }
  for (const h of haz) if (h.draw) h.draw(h);
};
H.reset = () => { reset0(); release(); clear(); shown = null; strip.classList.remove('on'); };
H.fightStart = (cfg, wave) => {
  clear();
  if (start0) start0(cfg, wave);
  const o = E.P2, k = o.ai && o.ai.d.kit;
  if (k) later(1.2, () => { if (!o.ko) say(o, k.tech.toUpperCase(), k.col); });
};

JU.boss = { kit, add, shot, wave, mark, swing, burst, fist, say, later, seal, mul };
})();
