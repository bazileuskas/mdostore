/* JUJUTSU UNLIMITEDS — early access: SWITCHER STITCHER. Aoi Todo: Boogie Woogie, a punch with a very long wind-up behind it, a pebble,
   and Ground Slam: whatever he gets hold of goes through the floor, and the floor comes up in pieces that fall, bounce and can be kicked about.
   He is bigger and slower with it and his strikes come slower too; every one of them lands half as hard again */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, X = JU.cast2;
const { clamp, lerp, ease, rnd, ZP } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk, CYAN = '#7ad7ff';
const SLOW = .76, M1_RATE = .78, M1_POWER = 1.5, SIZE = 1.2;       // how fast he walks and strikes next to anybody else; what a strike is worth; how big he is
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const hint = text => E.fx.push({ k: 2, x: E.P1.x, y: E.P1.y + 360, n: text, col: CYAN, t: 0, life: 1.4 });
const free = p => !p.move && !p.ps && !p.dead && !(p.dashT > 0);
const CLAP = [.1, 0, 1.5, 1.45, .3, -.3, 0], BACK = [-.42, -.12, .7, -1.5, .5, -.55, 0];        // hands together; and the arm drawn back as far as it will go
let peb = null;                                     // the pebble, for as long as it is anywhere to be swapped with

/* ---------- Ground Slam: what is left of the floor afterwards ---------- */
const LIFT = [-.1, -.2, 2.9, 2.7, .3, -.3, 0];        // both arms straight up, with something heavy on the end of them
const slabs = [];                                   // pieces of the floor: { x, y, z, w, h, vx, vy, r, vr, t, rest, n, col }
let pit = null;                                     // and the hole they came out of: { x, t }
function quake(x) {
  pit = { x, t: 0 };
  V.crack(x, 480); V.crack(x + 110, 300); V.crack(x - 110, 300); V.rocks(x, 0, 28); V.ring(x, 60, 440, CYAN, .45);
  E.addRing(x, '255,255,255', 500); E.addBlast(x, 100, '122,215,255', 440); E.addDust(x - 120); E.addDust(x + 120);
  for (let i = 0; i < 14; i++) {                    // the nearer the middle, the higher it is thrown
    const side = i % 2 ? 1 : -1, d = 50 + (i >> 1) * 44 + rnd(-10, 20), near = 1 - d / 400;
    slabs.push({ x: x + side * d, y: 4, z: ZP + rnd(-150, 190), w: rnd(70, 150), h: rnd(22, 40), vx: side * rnd(120, 420) * (1.2 - near), vy: rnd(700, 1250) * (.5 + near), r: 0, vr: side * rnd(2, 8), t: 0, rest: false, n: 0, col: i % 3 });
  }
  if (slabs.length > 42) slabs.splice(0, slabs.length - 42);
}
function rubble(dt) {
  const p = E.P1, o = E.P2;
  if (pit && (pit.t += dt) > 5) pit = null;
  for (let i = slabs.length - 1; i >= 0; i--) {
    const s = slabs[i];
    s.t += dt;
    if (s.rest) {                                   // lying there: anything that comes through fast enough kicks it on
      for (const f of [p, o]) if (Math.abs(f.x - s.x) < 46 && f.y < 60 && Math.abs(f.vx) > 420 && s.t < 4) { s.rest = false; s.n = 1; s.vx = Math.sign(f.vx) * rnd(260, 520); s.vy = rnd(380, 720); s.vr = Math.sign(f.vx) * rnd(3, 9); sfx.land(); }
    } else {
      s.vy -= 2500 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.r += s.vr * dt;
      const low = s.y - (Math.abs(Math.sin(s.r)) * s.w + Math.abs(Math.cos(s.r)) * s.h) / 2;     // its lowest corner
      if (low <= 0 && s.vy < 0) {
        s.y -= low;
        if (++s.n > 2 || s.vy > -260) { s.rest = true; s.vx = s.vy = s.vr = 0; s.r = Math.round(s.r / Math.PI) * Math.PI + ((i * 7) % 5 - 2) * .09; s.y = s.h / 2 + Math.abs(Math.sin(s.r)) * s.w / 2; }
        else { s.vy *= -.36; s.vx *= .6; s.vr *= -.5; E.addDust(s.x); if (s.n === 1) sfx.land(); }
      }
      if (Math.abs(s.x) > 1020) { s.x = clamp(s.x, -1020, 1020); s.vx *= -.4; }
    }
    if (s.t > 5) slabs.splice(i, 1);
  }
}
function drawSlab(s) {
  const cs = Math.cos(s.r), sn = Math.sin(s.r), hw = s.w / 2, hh = s.h / 2, pt = (dx, dy) => P(s.x + dx * cs - dy * sn, s.y + dx * sn + dy * cs, s.z);
  const a = pt(-hw, -hh), b = pt(hw, -hh), c = pt(hw, hh), d = pt(-hw, hh), e = pt(hw, hh - 8), f = pt(-hw, hh - 8);
  g.globalAlpha = s.t > 4.2 ? Math.max(0, (5 - s.t) / .8) : 1; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath();
  g.fillStyle = ['#3b3542', '#463f4e', '#322c39'][s.col]; g.fill();
  g.beginPath(); g.moveTo(f[0], f[1]); g.lineTo(e[0], e[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); g.fillStyle = '#6f6779'; g.fill();     // what used to be the surface
  g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
  g.globalAlpha = 1;
}
function drawPit() {
  if (!pit) return;
  const c = P(pit.x, 0, ZP + 20), k = c[2], a = pit.t > 4 ? Math.max(0, 5 - pit.t) : Math.min(1, pit.t * 8);
  g.globalAlpha = a; g.fillStyle = '#050408'; g.beginPath();
  for (let i = 0; i <= 18; i++) { const q = i / 18 * TAU, r = (230 + ((i * 53) % 60) - 30) * k; i ? g.lineTo(c[0] + Math.cos(q) * r, c[1] + Math.sin(q) * r * .26) : g.moveTo(c[0] + r, c[1]); }
  g.closePath(); g.fill(); g.lineWidth = 3; g.strokeStyle = 'rgba(122,215,255,.35)'; g.stroke();
  g.globalAlpha = 1;
}

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
  // 4 — he runs it down, gets it over his head, and puts it through the floor. Seventy, and the floor does not come out of it well either
  manji: { name: 'Ground Slam', cd: 14, dur: 1.5, glow: 'blue', run(p, m, t) {
    const o = E.P2, gap = (o.x - p.x) * p.face;
    p.rate = 46;
    if (m.got === undefined) {
      if (t > .4) { p.vx = 0; p.target = POSE.idle; if (t > .58) E.endMove(p); return; }         // nothing there to get hold of
      p.target = POSE.dash; p.vx = gap > 140 ? p.face * 1400 : 0;
      if (gap > -30 && gap < 200 && !o.ko && o.state !== 'down' && !(o.alpha < 1)) { m.got = t; p.vx = 0; p.inv = Math.max(p.inv, 1.1); sfx.charge(); }
      return;
    }
    const u = t - m.got;
    p.vx = 0;
    if (u < .42) {                                  // up it goes
      const e = ease(u / .42);
      p.target = LIFT;
      if (!o.ko) Object.assign(o, { x: p.x + p.face * lerp(110, 20, e), y: lerp(20, 300, e), vx: 0, vy: 0, ground: true, state: 'hurt', stun: .6, face: -p.face });
      return;
    }
    if (u < .52) {                                  // and down
      const e = (u - .42) / .1;
      p.target = POSE.crush; p.rate = 60;
      if (!o.ko) Object.assign(o, { x: p.x + p.face * lerp(20, 170, e), y: lerp(300, 30, e * e), vx: 0, vy: 0, ground: true, state: 'hurt', stun: .6 });
      return;
    }
    p.target = u < .8 ? POSE.crush : POSE.idle;
    if (m.s) return;
    const x = clamp(p.x + p.face * 170, -940, 940);
    m.s = 1; sfx.bf(); sfx.blast(); shake(44); E.zoomIn(.45); E.slow(.3); shout(p, '叩きつけ', CYAN);
    quake(x);
    if (o.ko) return;
    o.x = x; o.y = 0;
    E.applyHit(o, p.face, { dmg: 70 / (o.dr || 1), kb: 160, stun: .9, stop: .3, heavy: 1, col: CYAN, fixed: 1 });
    if (!o.poise && !o.ko) Object.assign(o, { ground: false, state: 'air', y: 30, vy: -1500, vx: p.face * 160, bounced: false });      // it comes back up off the floor once before it stays there
    V.impact(.24, x, 120);
  } }
};

JU.tech.add('switcher', { name: 'Switcher Stitcher', jp: '不義遊戯', mark: '拍', who: 'Aoi Todo', odds: 0, col: CYAN, glow: 'blue', moves: MOVES,
  early: true, skin: X.TODO, as: ['Aoi Todo', '東堂葵'], scale: SIZE });
const DEF = JU.tech.TECH.switcher, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
const press0 = H.press, tick0 = H.tick, fx0 = H.fx, under0 = H.under, reset0 = H.reset, start0 = H.fightStart, pow0 = H.power, rate0 = H.m1rate;
H.press = (a, inScene) => {
  if (!inScene && on()) {
    const p = E.P1;
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
  rubble(dt);
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
H.under = dt => { under0(dt); drawPit(); for (const s of slabs) if (s.z >= ZP) drawSlab(s); };     // the pieces behind the fight; the ones in front of it are drawn over it
H.fx = dt => {
  fx0(dt);
  for (const s of slabs) if (s.z < ZP) drawSlab(s);
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
H.reset = () => { reset0(); peb = pit = null; slabs.length = 0; flashes.length = 0; };
H.fightStart = (cfg, wave) => {
  start0(cfg, wave); peb = pit = null; slabs.length = 0;
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

JU.switcher = { MOVES, streetKey, streetDraw, get pebble() { return peb; }, get slabs() { return slabs.length; } };
})();
