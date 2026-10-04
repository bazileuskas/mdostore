/* JUJUTSU UNLIMITEDS — Combat Update 2: the uppercut, the Black Flash uppercut and the slam that follows it,
   and three moves that change when they are used in the air (Cursed Strikes, Blade Arm, Mach) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, H = E.hooks, POSE = E.POSE, LINE = E.LINE, cam = E.cam, V = JU.vfx, sfx = JU.sfx, M = E.MOVES, Fi = JU.fights, T = JU.tech.TECH;
const { rnd, clamp } = E, TAU = Math.PI * 2, FIN = M.m1[3].hit, INK = '#ff2440', GOLD = '#ffd23d', TEAL = '#78e6c8', VIOLET = '#b79bff';
const BLADE = T.trans.moves.strikes, MACH = T.projection.moves.manji;

const held = () => E.keys.has('w') || E.keys.has(' ') || E.keys.has('arrowup');     // jump is down right now (pushing the touch stick up counts)
const free = p => !p.move && !p.ps && !p.dead && !(p.dashT > 0);
const own = k => (H.move ? H.move(k) : null);       // what a technique has put in that slot, if anything
const hint = text => E.fx.push({ k: 2, x: E.P1.x, y: E.P1.y + 335, n: text, col: INK, t: 0, life: 1.3 });
const shake = v => { cam.shake = Math.max(cam.shake, v); };
// driven into the floor instead of sent flying
function spike(p, o, v = 1300) { if (!o.poise) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 26), vy: -v, vx: p.face * 200, bounced: false }); }
function crater(x, r = 300) { V.crack(x, r); V.rocks(x, 0, 12); E.addRing(x, '255,255,255', r); shake(22); sfx.blast(); }

/* ---------- the uppercut: hold jump through the chain and its last strike goes straight up ---------- */
let armed = false;                                  // jump went down in the middle of a strike and has not come up since
let jumpAt = -1e9, preBF = -1e9;                    // when he last jumped off the floor; when 3 was pressed a moment before an uppercut
let follow = null;                                  // after a Black Flash uppercut: { t, m1, div, o }. The slam is one click and one press of 3 away
let lastUp = null;                                  // a plain uppercut that has just landed, for a press of 3 that comes a moment late
const WIND = [.42, .12, .35, .5, .55, -.5, 0], RISE = [-.2, -.24, 2.85, .1, .2, -.4, 0];
const spend = () => { E.cd.div = E.CD.div; };
function opened(o) { follow = { t: 1.6, m1: false, div: false, o }; hint('CLICK, THEN 3  ·  BLACK FLASH SLAM'); }

const UPPER = { m1: 1, dur: .6, run(p, m, t) {
  const o = E.P2;
  p.rate = 46;
  if (t < .13) {
    p.target = WIND; if (p.ground) p.vx = p.face * 160;
    if (m.bf) { const w = E.hand(p, true); V.mote(w[0], w[1], 'red'); }
    return;
  }
  p.target = t < .42 ? RISE : POSE.idle; if (p.ground) p.vx = t < .2 ? p.face * 220 : 0;
  if (!m.sw) { m.sw = 1; sfx.whoosh(); V.slash(p.x + p.face * 95, p.y + 200, p.face > 0 ? 1.25 : Math.PI - 1.25, 340, m.bf ? INK : '#ffffff', 14); }
  if (m.done || t > .27) return;
  if (m.bf) {                                       // Divergent Fist, pressed once on the way up: no timing to hit
    if (E.tryHit(p, { reach: 190, dmg: 30, kb: 70, lift: 1250, stun: .9, stop: .3, heavy: 1, col: INK })) { m.done = 1; E.blackFlash(); opened(o); }
  } else if (E.tryHit(p, { reach: 190, dmg: FIN.dmg, kb: 70, lift: 1150, stun: .9, stop: .1, heavy: 1 })) { m.done = 1; lastUp = { at: E.T, o }; }
} };
// 3 pressed just after the uppercut has already landed: the cursed energy catches it up
function late(p) {
  const o = lastUp.o;
  lastUp = null; spend(); sfx.charge();
  E.applyHit(o, p.face, { dmg: 30 - FIN.dmg, kb: 70, lift: 1250, stun: .9, stop: .3, heavy: 1, col: INK });
  E.blackFlash(); opened(o);
}

/* ---------- Black Flash uppercut, then one click and one more press of 3: he goes up after it and brings it down. Three hundred ---------- */
const SLAM = { name: 'Black Flash', dur: 1.6, glow: 'red', run(p, m, t) {
  const o = E.P2, dt = t - (m.lt || 0);
  m.lt = t; p.rate = 46;
  if (m.land !== undefined) { p.vx = 0; p.target = t < m.land + .25 ? POSE.crush : POSE.idle; if (t > m.land + .4) E.endMove(p); return; }
  if (!m.c) { m.c = 1; p.inv = Math.max(p.inv, 1.4); p.face = o.x >= p.x ? 1 : -1; sfx.charge(); }
  if (!m.done) {                                    // up after it, faster than it is falling
    const k = 1 - Math.exp(-dt * 20), tx = o.x - p.face * 80, ty = o.y + 110, w = E.hand(p, false);
    p.ground = false; p.vx = 0; p.vy = 0; p.target = POSE.crushWind;
    p.x += (tx - p.x) * k; p.y += (ty - p.y) * k;
    V.mote(w[0], w[1], 'red');
    if (t < .2 && Math.hypot(tx - p.x, ty - p.y) > 40) return;
    m.done = 1; sfx.whoosh();
    if (o.ko || m.o !== o) return;
    E.applyHit(o, p.face, { dmg: 300 / (o.dr || 1), kb: 240, stun: .9, stop: .34, heavy: 1, col: INK, fixed: 1 });
    spike(p, o, 1700); E.blackFlash(); V.impact(.5, o.x, o.y + 150);
    for (let i = 0; i < 10; i++) { const a = rnd(0, TAU), l = rnd(260, 620); V.bolt(o.x, o.y + 150, o.x + Math.cos(a) * l, o.y + 150 + Math.sin(a) * l, INK, rnd(.3, .6), rnd(3, 7), '#060205'); }
    return;
  }
  p.target = POSE.crush; p.vy = -2200; p.vx = p.face * 160;      // and down with it
  if (p.ground) { m.land = t; crater(p.x + p.face * 70, 360); }
} };
function tryFollow() {
  const p = E.P1, f = follow;
  if (!f.m1 || !f.div) { hint(f.m1 ? '3' : 'CLICK'); return; }
  follow = null;
  if (p.dead || p.ps || f.o.ko || f.o !== E.P2) return;
  if (p.move) E.endMove(p);
  p.move = { def: SLAM, t: 0, o: f.o };
}

/* ---------- air variants ---------- */
// the dive they share: a beat hanging there, then straight at wherever it is standing. True once he is back on the floor
function dive(p, m, t, hang, pose, speed, hit, landed) {
  const o = E.P2;
  if (m.land !== undefined) { p.vx = 0; p.target = t < m.land + .2 ? pose : POSE.idle; if (t > m.land + .32) E.endMove(p); return true; }
  if (p.ground && t > .02) { m.land = t; p.vy = 0; if (!m.done) hit(); landed(); return true; }
  if (t < hang) return false;
  if (!m.aim) {
    m.aim = 1; p.face = o.x >= p.x ? 1 : -1; sfx.whoosh();
    m.vx = clamp((o.x - p.face * 60 - p.x) / Math.max(.1, p.y / speed), -2200, 2200);
  }
  p.target = pose; p.vy = -speed; p.vx = m.vx;
  if (!m.done) hit();
  return false;
}
// Cursed Strikes in the air, the way Jujutsu Shenanigans has it: a dropkick loaded with cursed energy that grounds whatever he lands on
const DK = [-.34, .16, 1, .6, 1.5, 1.32, -.42];
const DROP = { name: 'Cursed Strikes', dur: 1.6, glow: 'purple', run(p, m, t) {
  const o = E.P2;
  p.rate = 44;
  if (dive(p, m, t, .12, DK, 1400,
    () => { if (E.tryHit(p, { reach: 175, dmg: 24, kb: 220, stun: .9, stop: .14, heavy: 1, ring: 1, col: VIOLET })) { m.done = 1; spike(p, o); } },
    () => crater(p.x + p.face * 60))) return;
  if (t < .12) { p.target = POSE.kickWind; p.vy = Math.max(p.vy, 60); p.vx *= .85; }
  else if (Math.random() < .7) V.puff('purple', p.x, p.y + 60, -p.vx * .1, 200, 40, .25);
} };
// Blade Arm in the air: the arm becomes a blade as long as he is and he comes down on the point of it
const AIRBLADE = { name: 'Blade Arm', dur: 1.6, glow: 'teal', run(p, m, t) {
  const o = E.P2;
  p.rate = 44;
  if (dive(p, m, t, .14, POSE.crush, 1500,
    () => { if (E.tryHit(p, { reach: 230, dmg: 18, kb: 200, stun: .9, stop: .14, heavy: 1, col: TEAL })) { m.done = 1; spike(p, o); V.slash(o.x, o.y + 170, p.face > 0 ? -1.2 : Math.PI + 1.2, 380, TEAL, 14); } },
    () => { const x = p.x + p.face * 80; crater(x, 260); V.ring(x, 40, 240, TEAL, .35); })) return;
  if (t < .14) { p.target = POSE.crushWind; p.vy = Math.max(p.vy, 60); p.vx *= .85; }
} };
// Mach in the air: he hangs there while it charges, and then he is simply where the enemy is. A hundred and fifty
const AIRMACH = { name: 'Mach', dur: 2.2, glow: 'gold', run(p, m, t) {
  const o = E.P2;
  p.rate = 40;
  if (m.land !== undefined) { p.vx = 0; p.target = t < m.land + .3 ? POSE.div : POSE.idle; if (t > m.land + .45) E.endMove(p); return; }
  if (t < .5) {
    if (!m.c) { m.c = 1; m.y = Math.max(p.y, 120); p.inv = Math.max(p.inv, 1.2); sfx.charge(); E.fx.push({ k: 2, x: p.x, y: p.y + 390, n: '亜音速', col: GOLD, t: 0, life: 1.1 }); }
    p.target = POSE.dash; p.vx = 0; p.vy = 0; p.y += (m.y - p.y) * .2; p.ground = false; p.face = o.x >= p.x ? 1 : -1;
    V.mote(p.x, p.y + 130, 'gold');
    return;
  }
  if (!m.s) {
    m.s = 1; sfx.bf(); shake(34);
    const x0 = p.x, y0 = p.y, f = p.face, near = !o.ko && Math.abs(o.x - p.x) < 1700;
    const x1 = clamp(near ? o.x - f * 90 : p.x + f * 900, -950, 950), y1 = near ? o.y + 30 : 1;
    for (let i = 0; i <= 6; i++) V.ring(x0 + (x1 - x0) * i / 6, y0 + (y1 - y0) * i / 6 + 150, 130 + i * 18, '#ffffff', .28 + i * .03);   // the sound barrier, broken on the way down
    V.bolt(x0, y0 + 150, x1, y1 + 150, GOLD, .3, 6, '#fff');
    p.x = x1; p.y = Math.max(y1, 1);
    if (near) {
      E.applyHit(o, f, { dmg: 150 / (o.dr || 1), kb: 320, stun: .9, stop: .32, heavy: 1, col: GOLD, fixed: 1 });
      spike(p, o, 1700); V.impact(.5, o.x, o.y + 150); E.zoomIn(.5);
    }
  }
  p.target = POSE.div; p.vy = -2400; p.vx = p.face * 120;
  if (p.ground) { m.land = t; crater(p.x + p.face * 70, 380); }
} };
function air(p, k, def) {
  if (p.ground || !free(p) || E.cd[k] > 0) return false;
  E.cd[k] = E.CD[k]; p.move = { def, key: k, t: 0 }; E.hud.mv[k].classList.add('act');
  return true;
}

/* ---------- wiring ---------- */
const m10 = H.m1, press0 = H.press, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart, nj0 = H.noJump, pow0 = H.power;
H.m1 = i => {
  const p = E.P1;
  if (i === 0 && !p.ground && p.vy > 0 && held() && E.T - jumpAt < .1) { p.vy = -2600; armed = true; }   // jump and the first strike pressed together: he stays down, and the hold counts
  if (!m10(i)) return false;
  if (i !== 3 || !p.ground || !held()) return true;
  const bf = E.T - preBF < .6 && E.cd.div <= 0 && !own('div');
  if (bf) spend();
  p.move = { def: UPPER, i: 3, t: 0, bf: bf ? 1 : 0 };
  return false;
};
H.noJump = p => (armed && held()) || (nj0 ? nj0(p) : false);       // held through the chain, jump does not jump
H.press = (a, inScene) => {
  if (!inScene) {
    const p = E.P1, m = p.move;
    if (a === 'jump') {
      if (m && m.def.m1) armed = true;
      else if (p.ground && free(p)) jumpAt = E.T;
    } else if (a === 'm1') {
      if (follow && !follow.m1) { follow.m1 = true; if (follow.div) { tryFollow(); return true; } hint('3'); }   // the click still swings as usual: it is the 3 after it that sends him up
    } else if (a === 'div' && !own('div')) {
      if (follow) { if (!follow.div) { follow.div = true; tryFollow(); } return true; }
      if (m && m.def === UPPER && !m.bf && !m.done && m.t < .27 && E.cd.div <= 0) { m.bf = 1; spend(); sfx.charge(); return true; }
      if (lastUp && E.T - lastUp.at < .32 && !lastUp.o.ko && E.cd.div <= 0) { late(p); return true; }
      if (m && m.def.m1 && m.i === 2 && held() && E.cd.div <= 0) { preBF = E.T; return true; }     // a moment early, during the strike before it
    } else if (a === 'strikes') {
      const mine = own('strikes');
      if (mine ? mine === BLADE && air(p, a, AIRBLADE) : air(p, a, DROP)) return true;
    } else if (a === 'manji' && own('manji') === MACH && air(p, a, AIRMACH)) return true;
  }
  return press0 ? press0(a, inScene) : false;
};
H.tick = dt => {
  tick0(dt);
  if (!held()) armed = false;
  if (follow && ((follow.t -= dt) <= 0 || follow.o.ko || follow.o !== E.P2 || E.P1.dead)) follow = null;
  if (lastUp && E.T - lastUp.at > .4) lastUp = null;
};
H.fx = dt => {
  fx0(dt);
  const p = E.P1, m = p.move;
  if (m && m.def === AIRBLADE && m.t > .1 && (m.land === undefined || m.t < m.land + .14)) {   // the blade itself, point first
    const w = E.hand(p, false), a = F(w[0], w[1]), L = 270 * a[2];
    g.save(); g.translate(a[0], a[1]); g.scale(p.face, 1); g.rotate(.95);
    g.beginPath(); g.moveTo(0, -14); g.quadraticCurveTo(L * .6, -30, L, 0); g.quadraticCurveTo(L * .5, 10, 0, 14); g.closePath();
    g.fillStyle = '#b9c3cc'; g.fill(); g.lineWidth = 3; g.strokeStyle = LINE; g.stroke(); g.restore();
  }
  if (follow) {                                     // a ring closing on what is still in the air: the slam is there to be taken
    const o = follow.o, c = F(o.x, o.y + 150 * (o.scale || 1));
    g.strokeStyle = INK; g.lineWidth = 4; g.globalAlpha = .55 + .45 * Math.sin(E.T * 30);
    g.beginPath(); g.arc(c[0], c[1], (56 + 60 * follow.t / 1.6) * c[2], 0, TAU); g.stroke(); g.globalAlpha = 1;
  }
};
// a fight the story has not finished with cannot be ended early by one enormous hit: it is left on its last point of health
H.power = (h, o) => {
  const k = pow0 ? pow0(h, o) : 1, f = Fi.fight;
  if (o !== E.P2 || !f.cfg || !(JU.chapters.pending || (f.low && !f.lowDone))) return k;
  return Math.min(k, Math.max(0, (o.hp - 1) / (h.dmg * (o.dr || 1))));
};
const clear = () => { armed = false; follow = lastUp = null; jumpAt = preBF = -1e9; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { clear(); start0(cfg, wave); };

JU.combat2 = { UPPER, SLAM, DROP, AIRBLADE, AIRMACH, get follow() { return follow; } };
})();
