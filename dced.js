/* JUJUTSU UNLIMITEDS — Build 0.22v1: DIRECT CURSED ENERGY DISCHARGE, a Secret CT (the user's: "a stronger version of cursed cannon with brand new
   moves. obtained by killing the ryu boss in 2 player raids with a 3% chance"). Granite Cannon's energy, let go at no distance at all.
   The Ryu boss: the Granite raid (raid.js), on a public server, for two players or more: three waves of curses, then the Granite Cannon with a
   moveset of its own (below). Each player who clears it rolls once: 3% (S.raids counts the clears). The team account has it regardless.
   With True Cursed Energy Discharge it combines into True Direct Cursed Energy Discharge (tdced.js), on the Secret CT row of the Awaken CT screen.
   The moves and every number are ours:
   1 Point-Blank: both palms out and a cone of it, right there: 55; held up to 1.2 seconds more, up to 95
   2 Granite Lance: a thin beam that goes through and keeps on going through: 6 x 9, and the last 20 throws them
   3 Discharge Step: the floor behind him blown out, and him into them shoulder first: 48 (+12 if it puts them into a wall)
   4 Overflow: five beams out of him one after another, and a pillar of it up through them: 5 x 14 + 40
   E Recoil Counter: a blow while he stands ready is answered at no distance: 70 (a shot is only stopped)
   G Zero Distance, when the bar his damage fills is full: hold of them, his forehead to theirs, and all of it: 600
   This file also holds the pieces the two of them draw with (JU.dced.kit), and the Secret CT row's two cards */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, C = JU.cut, Z = JU.bossfx, CK = JU.cannon.kit;
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk;
const SIZE = CK.SIZE, muzzle = CK.muzzle, AIM = CK.AIM, RECOIL = CK.RECOIL;
const shake = v => { if (!JU.reduceMotion) cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const dev = () => !!(JU.account && JU.account.dev);
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const exact = (o, n) => n / (o.dr || 1);
const up = o => !!o && !o.ko && !(o.alpha < 1) && o.state !== 'down' && o.state !== 'up' && !(o.inv > 0);
const can = o => !!o && !duel() && !o.net && !o.poise && !o.ko;      // may it be moved about
const hs = o => o.scale || 1;
const mid = o => o.y + 170 * hs(o);
const held = (key, slot) => E.keys.has(key) || E.keys.has('hold:' + slot);
const label = (x, y, n, col, life = 1.1) => E.fx.push({ k: 2, x, y, n, col, t: 0, life });
const PALMS = [.12, 0, 1.62, 1.48, .5, -.48, 0], SHOULDER = [.62, -.2, .4, -.6, .95, -.9, 0], LOWER = [.55, .3, 2.3, 2.1, .95, -.8, 0];      // both palms out; a shoulder into them; down low, gathering

/* ================= the pieces: what a discharge looks like, in any colour ================= */
const COL = {                                       // rgb for the glow, the core colour, and the engine's glow image
  cyan: { rgb: '127,233,255', core: '#7fe9ff', img: 'blue' },
  pale: { rgb: '191,246,255', core: '#c9f8ff', img: 'white' },
  max: { rgb: '110,160,255', core: '#eef5ff', img: 'blue' },
  teal: { rgb: '98,255,217', core: '#62ffd9', img: 'teal' },
  red: { rgb: '255,77,109', core: '#ff4d6d', img: 'red' }
};
// a beam from (x0, y0) to (x1, y1), w wide, there for life seconds: o.keep holds its width to the end, o.bare leaves the light at its mouth out
function beam(x0, y0, x1, y1, w, life, Cc, o = {}) {
  V.custom(life, u => {
    const p0 = F(x0, y0), p1 = F(x1, y1), k = p0[2], al = Math.min(1, (1 - u) * 2.4);
    const wd = w * k * (u < .12 ? .6 + u / .3 : 1 - (u - .12) * (o.keep ? .15 : .75));
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1], n = Math.hypot(dx, dy) || 1, nx = -dy / n, ny = dx / n;
    const seg = (width, col) => { g.strokeStyle = col; g.lineWidth = Math.max(1, width); g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke(); };
    g.save(); g.lineCap = 'round';
    lit(() => { seg(wd * 2.8, `rgba(${Cc.rgb},${.2 * al})`); seg(wd * 1.55, `rgba(${Cc.rgb},${.45 * al})`); });
    g.globalAlpha = al; seg(wd, Cc.core); seg(wd * .55, '#ffffff'); g.globalAlpha = 1;
    lit(() => {
      g.strokeStyle = `rgba(255,255,255,${.7 * al})`; g.lineWidth = Math.max(1, 2 * k);      // the air torn along beside it
      for (let i = 0; i < 9; i++) {
        const s = ((i * 53 % 17) / 17 + E.T * 3) % 1, s1 = Math.min(1, s + .14), off = ((i * 37 % 9) - 4) / 4 * wd * .85;
        g.beginPath(); g.moveTo(p0[0] + dx * s + nx * off, p0[1] + dy * s + ny * off); g.lineTo(p0[0] + dx * s1 + nx * off, p0[1] + dy * s1 + ny * off); g.stroke();
      }
      if (!o.bare) {
        E.glow(E.GLOW[Cc.img], p0[0], p0[1], (220 + w * 7) * k, .8 * al); E.glow(E.GLOW.white, p0[0], p0[1], (100 + w * 3.5) * k * al, al);
        g.fillStyle = `rgba(255,255,255,${al})`;
        g.beginPath(); g.ellipse(p0[0], p0[1], (120 + w * 4) * k * al, 3.5 * k, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(p0[0], p0[1], 3.5 * k, (90 + w * 2.6) * k * al, 0, 0, TAU); g.fill();
      }
    });
    g.restore();
  });
}
// the line from (x0, y0) at an angle (0 straight ahead the way he faces, up is positive), as far as len or the floor
function ray(x0, y0, face, ang, len) {
  const ux = Math.cos(ang) * face, uy = Math.sin(ang), far = uy < -.01 ? Math.min(len, y0 / -uy) : len;
  return { x0, y0, x1: x0 + ux * far, y1: Math.max(0, y0 + uy * far), floor: uy < -.01 && far < len, ux, uy };
}
// is the middle of o within w of the segment (any of three points down its body)
function onLine(o, a, w = 60) {
  if (!o) return false;
  const dx = a.x1 - a.x0, dy = a.y1 - a.y0, L2 = dx * dx + dy * dy || 1, s = hs(o);
  for (const yy of [60, 170, 300]) {
    const px = o.x, py = o.y + yy * s, u = clamp(((px - a.x0) * dx + (py - a.y0) * dy) / L2, 0, 1), qx = a.x0 + dx * u, qy = a.y0 + dy * u;
    if (Math.hypot(px - qx, py - qy) < w / 2 + 46 * s) return true;
  }
  return false;
}
// where it lands: light, a ring, grit; s: how big
function impact(x, y, s, Cc) {
  E.addBlast(x, y, Cc.rgb, 220 * s); V.ring(x, y, 140 * s, Cc.core, .26); V.sparks(x, y, Cc.img === 'teal' ? 'green' : Cc.img === 'red' ? 'red' : 'blue', Math.round(6 * s));
  if (Z) Z.flare(x, y, Cc.rgb, 260 * s, .16);
}
// a burst all round a point: a white ball opening, and light thrown out of it every way
function burstFx(x, y, s, Cc) {
  const n = 16, rays = Array.from({ length: n }, (_, i) => [i / n * TAU + rnd(-.12, .12), rnd(240, 430), rnd(8, 20)]);
  V.custom(.28, u => {
    const c = F(x, y), k = c[2] * s, e = 1 - (1 - u) * (1 - u), al = 1 - u;
    lit(() => { E.glow(E.GLOW[Cc.img], c[0], c[1], 760 * e * k, al); E.glow(E.GLOW.white, c[0], c[1], 420 * e * k, al); });
    g.globalAlpha = al * .9; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(c[0], c[1], 150 * e * k, 0, TAU); g.fill();
    g.fillStyle = Cc.core;
    for (const r of rays) {
      const r0 = 110 * e * k, r1 = r[1] * e * k, w = r[2] * al * k, cs = Math.cos(r[0]), sn = Math.sin(r[0]);
      g.beginPath(); g.moveTo(c[0] + cs * r0 - sn * w, c[1] + sn * r0 + cs * w); g.lineTo(c[0] + cs * r1, c[1] + sn * r1); g.lineTo(c[0] + cs * r0 + sn * w, c[1] + sn * r0 - cs * w); g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
  });
  for (let i = 0; i < 3; i++) V.ring(x, y, (170 + i * 110) * s, i ? Cc.core : '#ffffff', .22 + i * .07);
}
// a cone of it out of his hands, right in front of him
function cone(x, y, face, reach, Cc, life = .24) {
  const L = Array.from({ length: 22 }, () => [rnd(-.42, .42), rnd(.5, 1), rnd(2, 7)]);
  V.custom(life, u => {
    const c = F(x, y), k = c[2], e = 1 - (1 - u) * (1 - u), al = 1 - u, R = reach * k * (.4 + .6 * e);
    lit(() => E.glow(E.GLOW[Cc.img], c[0] + face * R * .4, c[1], R * 1.2, al));
    g.save(); g.globalAlpha = al * .85; g.fillStyle = '#ffffff';
    g.beginPath(); g.moveTo(c[0], c[1]); g.arc(c[0], c[1], R, face > 0 ? -.4 : Math.PI - .4, face > 0 ? .4 : Math.PI + .4); g.closePath(); g.fill();
    g.globalAlpha = al; g.strokeStyle = Cc.core; g.lineCap = 'round';
    for (const q of L) { const a = (face > 0 ? 0 : Math.PI) + q[0], r0 = R * .3, r1 = R * q[1] * 1.25; g.lineWidth = q[2] * k; g.beginPath(); g.moveTo(c[0] + Math.cos(a) * r0, c[1] + Math.sin(a) * r0); g.lineTo(c[0] + Math.cos(a) * r1, c[1] + Math.sin(a) * r1); g.stroke(); }
    g.restore();
  });
}
// a column of it straight up out of the floor at x
function pillar(x, w, life, Cc) {
  V.custom(life, u => {
    const b = F(x, 0), tp = F(x, 1400), k = b[2], al = Math.min(1, (1 - u) * 2.2), wd = w * k * (u < .1 ? u / .1 : 1 - u * .5);
    g.save();
    lit(() => { g.fillStyle = `rgba(${Cc.rgb},${.3 * al})`; g.fillRect(b[0] - wd * 1.4, tp[1], wd * 2.8, b[1] - tp[1]); E.glow(E.GLOW[Cc.img], b[0], b[1], wd * 5, al); });
    g.globalAlpha = al; g.fillStyle = Cc.core; g.fillRect(b[0] - wd / 2, tp[1], wd, b[1] - tp[1]); g.fillStyle = '#fff'; g.fillRect(b[0] - wd / 4, tp[1], wd / 2, b[1] - tp[1]);
    g.restore();
  });
  V.crack(x, w * 3); V.rocks(x, 0, 8); E.addDust(x);
}
// one that falls out of the sky, wandering on its way, and lands on x; land(x) when it does
function drop(x, Cc, land, fall = .2) {
  const xs = x + (Math.random() < .5 ? -1 : 1) * rnd(240, 640), ph = rnd(0, TAU), amp = rnd(60, 120), FADE = .24;
  V.custom(fall + FADE, u => {
    const tt = u * (fall + FADE), head = Math.min(1, tt / fall), tail = clamp((tt - .08) / (fall + .1), 0, head), al = tt < fall ? 1 : 1 - (tt - fall) / FADE;
    const path = () => { g.beginPath(); for (let s = tail, first = true; s <= head + 1e-6; s += .035, first = false) { const c = F(lerp(xs, x, s) + Math.sin(s * 9.5 + ph) * amp * (1 - s) * (1 - s * .3), lerp(1000, 14, s)); if (first) g.moveTo(c[0], c[1]); else g.lineTo(c[0], c[1]); } };
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    lit(() => { g.strokeStyle = `rgba(${Cc.rgb},${.6 * al})`; g.lineWidth = 15; path(); g.stroke(); });
    g.globalAlpha = al; g.strokeStyle = '#eef8ff'; g.lineWidth = 3.6; path(); g.stroke();
    g.restore(); g.globalAlpha = 1;
  });
  E.after(fall, () => land(x));
}
// black smoke going up where it has hit, with the colour still in it
function smoke(x, y, n, s, Cc = COL.cyan) {
  const bl = Array.from({ length: n }, () => ({ x: x + rnd(-70, 70) * s, y: y + rnd(0, 60) * s, vx: rnd(-110, 110) * s, vy: rnd(140, 460) * s, r: rnd(44, 92) * s, q: Math.random() }));
  V.custom(1.1, (u, dt) => {
    for (const b of bl) {
      b.x += b.vx * dt; b.y += b.vy * dt; b.vy *= 1 - Math.min(1, 1.7 * dt); b.r += 56 * s * dt;
      const c = F(b.x, b.y);
      g.fillStyle = `rgba(${b.q > .5 ? '30,27,34' : '60,52,56'},${Math.min(1, (1 - u) * 1.7) * .8})`; g.beginPath(); g.arc(c[0], c[1], b.r * c[2], 0, TAU); g.fill();
    }
    lit(() => { for (const b of bl) if (b.q > .62) { const c = F(b.x + b.r * .3, b.y - b.r * .25); E.glow(E.GLOW[Cc.img], c[0], c[1], 70 * s * c[2], (1 - u) * .8); } });
  });
}
// shots: small (or big) things of it, flying; { x, y, vx, vy, r, dmg, Cc, h (the rest of the hit), grav, life, orb, split(s), land(s), hit(s, o) }
const shots = [];
function fire(s) { shots.push(Object.assign({ t: 0, r: 12, grav: 0, life: 1.4, h: {}, trail: [] }, s)); }
function shotsTick(dt) {
  const o = E.P2;
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    s.t += dt;
    const x0 = s.x, y0 = s.y;
    s.vy -= s.grav * dt; s.x += s.vx * dt; s.y += s.vy * dt;
    s.trail.push([s.x, s.y]); if (s.trail.length > 7) s.trail.shift();
    if (s.fuse !== undefined && s.t >= s.fuse) { if (s.split) s.split(s); shots.splice(i, 1); continue; }
    let hit = false;
    if (up(o) && !s.done) {                          // swept: fast ones cover more than they are wide in a frame
      const n = Math.max(1, Math.ceil(Math.hypot(s.x - x0, s.y - y0) / 20)), half = 50 * hs(o) + s.r, top = o.y + 380 * hs(o);
      for (let j = 1; j <= n && !hit; j++) { const x = lerp(x0, s.x, j / n), y = lerp(y0, s.y, j / n); if (Math.abs(o.x - x) < half && y > o.y - 10 - s.r && y < top + s.r) { hit = true; s.x = x; s.y = y; } }
    }
    if (hit) {
      E.applyHit(o, Math.sign(s.vx) || 1, Object.assign({ dmg: exact(o, s.dmg), kb: 60, stun: .3, stop: .02, col: s.Cc.core, fixed: 1, mute: 1 }, s.h));
      sfx.zap(); impact(s.x, s.y, s.orb ? 1 : .5, s.Cc);
      if (s.hit) s.hit(s, o);
      if (s.split) s.split(s);
      if (!s.pierce) { shots.splice(i, 1); continue; }
      s.done = true;
    }
    if (s.y <= 0 || Math.abs(s.x) > 1100 || s.y > 1500 || s.t > s.life) {
      if (s.y <= 0) { s.y = 0; impact(s.x, 20, s.orb ? .8 : .4, s.Cc); if (s.orb) { V.crack(s.x, 120); E.addDust(s.x); } }
      if (s.land) s.land(s); else if (s.split && s.y <= 0) s.split(s);
      shots.splice(i, 1);
    }
  }
}
function drawShots() {
  for (const s of shots) {
    const c = F(s.x, s.y), k = c[2], r = s.r * k;
    if (s.trail.length > 1) {
      g.save(); g.lineCap = 'round';
      lit(() => { for (let i = 1; i < s.trail.length; i++) { const a = F(s.trail[i - 1][0], s.trail[i - 1][1]), b = F(s.trail[i][0], s.trail[i][1]), u = i / (s.trail.length - 1); g.strokeStyle = `rgba(${s.Cc.rgb},${.5 * u})`; g.lineWidth = r * 2 * u; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); } });
      g.restore();
    }
    lit(() => E.glow(E.GLOW[s.Cc.img], c[0], c[1], r * (s.orb ? 6 : 4.5), .9));
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(c[0], c[1], r * .7, 0, TAU); g.fill();
    if (s.orb) { g.strokeStyle = s.Cc.core; g.lineWidth = 3 * k; g.beginPath(); g.arc(c[0], c[1], r, E.T * 9, E.T * 9 + 4.4); g.stroke(); }
  }
}
// a shock along the floor from x, the way dir goes: jump it (one blow, n)
const waves = [];
function floorWave(x, dir, n, Cc, h = {}, speed = 1500, range = 1200) { waves.push({ x, dir, n, Cc, h, speed, left: range, hit: false }); sfx.blast(); }
function wavesTick(dt) {
  const o = E.P2;
  for (let i = waves.length - 1; i >= 0; i--) {
    const w = waves[i], step = w.speed * dt;
    w.x += w.dir * step; w.left -= step;
    if (Math.random() < dt * 30) V.rocks(w.x, 0, 1);
    if (!w.hit && up(o) && Math.abs(o.x - w.x) < 80 && o.y < 90) { w.hit = true; E.applyHit(o, w.dir, Object.assign({ dmg: exact(o, w.n), kb: 500, lift: 620, stun: .8, stop: .08, heavy: 1, col: w.Cc.core, fixed: 1, mute: 1 }, w.h)); impact(o.x, 60, .8, w.Cc); sfx.blast(); }
    if (w.left <= 0 || Math.abs(w.x) > 1050) waves.splice(i, 1);
  }
}
function drawWaves() {
  for (const w of waves) {
    const c = F(w.x, 0), k = c[2];
    lit(() => { E.glow(E.GLOW[w.Cc.img], c[0], c[1], 160 * k, .8); });
    g.fillStyle = w.Cc.core; g.beginPath(); g.moveTo(c[0] - w.dir * 110 * k, c[1]); g.lineTo(c[0], c[1] - 120 * k); g.lineTo(c[0] + w.dir * 30 * k, c[1]); g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(c[0] - w.dir * 60 * k, c[1]); g.lineTo(c[0], c[1] - 70 * k); g.lineTo(c[0] + w.dir * 14 * k, c[1]); g.closePath(); g.fill();
  }
}
// the hit itself: exactly n, whatever it is made of
function hit(o, face, n, Cc, h = {}) { if (!o || o.ko) return false; E.applyHit(o, face, Object.assign({ dmg: exact(o, n), kb: 120, stun: .4, stop: .04, col: Cc.core, fixed: 1, mute: 1 }, h)); return true; }
const sideOf = (p, o) => (o && !o.ko ? (o.x >= p.x ? 1 : -1) : p.face);
const palm = p => { const h = E.hand(p, true), s = hs(p); return [p.x + (h[0] - p.x) * s + p.face * 20, p.y + (h[1] - p.y) * s]; };
const kit = { COL, beam, ray, onLine, impact, burstFx, cone, pillar, drop, smoke, fire, shots, floorWave, hit, exact, up, can, hs, mid, held, label, sideOf, palm, lit, shake, duel, dev,
  PALMS, SHOULDER, LOWER, SIZE, muzzle, AIM, RECOIL };

/* ================= Direct Cursed Energy Discharge ================= */
const DC = COL.pale, PB = [55, 95], PB_MORE = 1.2;
let ready = null;                                   // Recoil Counter: { t } while he stands ready for it
const MOVES = {
  // 1 — Point-Blank: palms out, and all of it right there in front of him. Held, it keeps gathering
  strikes: { name: 'Point-Blank', cd: 3, dur: 2.4, run(p, m, t) {
    const o = E.P2;
    p.rate = 36; p.vx = 0;
    if (m.go === undefined) {
      p.target = PALMS; if (!o.ko) p.face = sideOf(p, o);
      if (!m.c) { m.c = 1; sfx.charge(); }
      const k = clamp((t - .18) / PB_MORE, 0, 1), w = palm(p);
      if (Math.random() < .5 + k * .5) V.mote(w[0], w[1], 'white');
      if (k > 0 && Math.floor(k * 4) !== m.tick) { m.tick = Math.floor(k * 4); sfx.tick(m.tick); shake(3 + k * 6); }
      if (t >= .18 && !(held('1', 'strikes') && t < .18 + PB_MORE)) { m.go = t; m.k = k < .05 ? 0 : k; }      // (a tap is a tap)
      return;
    }
    if (!m.f) {
      m.f = 1; const k = m.k, w = palm(p), reach = 300 + 120 * k, dx = (o.x - p.x) * p.face;
      p.pose = RECOIL.slice(); sfx.cannon(k > .6 ? 2 : 1); shake(16 + 20 * k); E.zoomIn(.2 + .3 * k);
      cone(w[0], w[1], p.face, reach + 120, DC, .26 + .1 * k);
      if (up(o) && dx > -40 && dx < reach + 60 && Math.abs(o.y - p.y) < 260) {
        hit(o, p.face, PB[0] + (PB[1] - PB[0]) * k, DC, { kb: 900 + 600 * k, lift: 300 + 300 * k, stun: .8, stop: .12 + .1 * k, heavy: 1 });
        impact(o.x, mid(o), 1 + k, DC); if (k > .6) { V.impact(.12, o.x, mid(o)); C.cubes(o.x, 40, 6); }
        label(o.x, o.y + 470 * hs(o), k >= 1 ? 'POINT-BLANK · FULL' : 'POINT-BLANK', DC.core, .9);
      }
    }
    p.target = t < m.go + .25 ? RECOIL : POSE.idle; p.vx = t < m.go + .12 ? -p.face * 300 : 0;
    if (t > m.go + .4) E.endMove(p);
  } },
  // 2 — Granite Lance: thin, and it goes on through whatever is in it, again and again
  crush: { name: 'Granite Lance', cd: 7, dur: 1.1, run(p, m, t) {
    const o = E.P2;
    p.vx = 0; p.rate = 40;
    if (t < .2) { p.target = AIM; if (!o.ko) p.face = sideOf(p, o); const z = muzzle(p); V.mote(z[0], z[1], 'white'); if (!m.c) { m.c = 1; sfx.charge(); } return; }
    if (!m.a) {
      const z = muzzle(p), dx = Math.max(200, (o.x - z[0]) * p.face), dy = clamp(mid(o) - z[1], -.4 * dx, .2 * dx), ang = up(o) ? Math.atan2(dy, dx) : -.05;
      m.a = ray(z[0], z[1], p.face, ang, 1700); m.n = 0;
      sfx.cannon(1); sfx.roar(.6); shake(14); beam(m.a.x0, m.a.y0, m.a.x1, m.a.y1, 24, .62, DC, { keep: true });
      if (m.a.floor) { V.crack(m.a.x1, 200); V.rocks(m.a.x1, 0, 8); }
    }
    p.target = RECOIL;
    while (m.n < 7 && t >= .22 + m.n * .065) {
      const last = m.n === 6; m.n++;
      if (up(o) && onLine(o, m.a, 24)) { hit(o, p.face, last ? 20 : 9, DC, last ? { kb: 900, lift: 400, stun: .8, stop: .1, heavy: 1 } : { kb: 30, stun: .3, stop: .02 }); V.sparks(o.x, mid(o), 'white', 3); }
    }
    if (t > .95) E.endMove(p);
  } },
  // 3 — Discharge Step: the floor blown out behind him, and him into them shoulder first
  div: { name: 'Discharge Step', cd: 6, dur: 1.1, run(p, m, t) {
    const o = E.P2, f = p.face;
    p.rate = 44;
    if (t < .12) { p.target = LOWER; p.vx = 0; if (!o.ko) p.face = sideOf(p, o); return; }
    if (!m.go) { m.go = 1; const bx = p.x - f * 70; burstFx(bx, 60, .55, DC); beam(bx, 80, bx - f * 420, 40, 40, .2, DC, { bare: true }); V.crack(bx, 200); E.addDust(bx); sfx.cannon(0); sfx.whoosh(); shake(14); p.inv = Math.max(p.inv, .35); }
    if (!m.done) {
      const gap = (o.x - p.x) * f;
      p.target = SHOULDER; p.vx = f * 2600;
      if (Math.random() < .9) V.puff('white', p.x - f * 60, p.y + rnd(40, 260), -f * 500, 0, 30, .2);
      if (up(o) && gap > -40 && gap < 160) {
        m.done = t; p.vx = 0;
        hit(o, f, 48, DC, { kb: 1300, lift: 380, stun: .9, stop: .14, heavy: 1 });
        impact(o.x, mid(o), 1.2, DC); sfx.hit(true); shake(22);
      } else if (t > .5) { m.done = t; p.vx = 0; }
      return;
    }
    p.vx = 0; p.target = t < m.done + .25 ? SHOULDER : POSE.idle;
    if (!m.wall && t > m.done + .2 && t < m.done + .6 && Math.abs(o.x) > 900 && !o.ko && m.done < .5) {      // and if it has put them into a wall: that too
      m.wall = 1; hit(o, -Math.sign(o.x), 12, DC, { kb: 200, stun: .6, stop: .08 }); label(o.x, o.y + 420 * hs(o), 'WALL SPLAT', DC.core, .9); V.crack(o.x, 180); shake(12);
    }
    if (t > m.done + .7) E.endMove(p);
  } },
  // 4 — Overflow: five beams out of him one after another, round from low to high, then a pillar of it up through them
  manji: { name: 'Overflow', cd: 12, dur: 1.8, run(p, m, t) {
    const o = E.P2, ANG = [-.16, -.08, 0, .08, .16];      // (fanned across them, low to high)
    p.vx = 0; p.rate = 40;
    if (!m.c) { m.c = 1; m.n = 0; sfx.charge(); shout(p, 'OVERFLOW', DC.core); if (!o.ko) p.face = sideOf(p, o); }
    if (t < .25) { p.target = LOWER; return; }
    p.target = Math.floor(t / .05) % 2 ? AIM : RECOIL;
    while (m.n < 5 && t >= .25 + m.n * .1) {
      const z = muzzle(p), aim = up(o) ? Math.atan2(mid(o) - z[1], Math.max(120, (o.x - z[0]) * p.face)) : -.05, a = ray(z[0], z[1], p.face, aim + ANG[m.n], 1600); m.n++;
      beam(a.x0, a.y0, a.x1, a.y1, 30, .3, DC); sfx.zap(); shake(8);
      if (a.floor) { V.rocks(a.x1, 0, 3); E.addDust(a.x1); }
      if (up(o) && onLine(o, a, 30)) hit(o, p.face, 14, DC, { kb: 60, stun: .5, stop: .03 });
    }
    if (t >= .9 && !m.pl) {
      m.pl = 1; const x = clamp(!o.ko ? o.x : p.x + p.face * 300, -960, 960);
      pillar(x, 90, .5, DC); sfx.cannon(2); shake(30); E.zoomIn(.3); smoke(x, 20, 7, 1.1, DC);
      if (up(o) && Math.abs(o.x - x) < 130) hit(o, p.face, 40, DC, { kb: 200, lift: 1100, stun: 1, stop: .16, heavy: 1 });
    }
    if (t > 1.3) E.endMove(p);
  } }
};
// E — Recoil Counter: he stands ready; a blow is answered at no distance
const ESP = { name: 'Recoil Counter', jp: '反動', col: DC.core, cd: 12, dur: 1.2, run(p, m, t) {
  p.vx = 0; p.rate = 30;
  if (!m.s) { m.s = 1; ready = { t: .7 }; }
  if (m.ans === undefined) { p.target = PALMS; if (t > .8) { ready = null; E.endMove(p); } return; }
  p.target = t < m.ans + .25 ? RECOIL : POSE.idle;
  if (t > m.ans + .45) E.endMove(p);
} };
// G — Zero Distance: hold of them, his forehead to theirs, and all of it let go there
let pin = null, white = 0;
const ZERO = { name: 'Zero Distance', dur: 5, run(p, m, t) {
  const o = E.P2, f = p.face;
  p.rate = 40;
  if (m.grab === undefined) {
    if (!m.s) { m.s = 1; p.inv = Math.max(p.inv, 1.5); E.banner('零距離', 'ZERO DISTANCE', 'sm'); burstFx(p.x - f * 60, 100, .6, DC); sfx.cannon(0); }
    const gap = (o.x - p.x) * f;
    p.target = POSE.dash; p.vx = gap > 140 ? f * 2400 : 0;
    if (Math.random() < .8) V.puff('white', p.x - f * 40, p.y + rnd(40, 270), -f * 520, 0, 30, .25);
    if (!o.ko && gap > -40 && gap < 170 && o.state !== 'up') {
      m.grab = t; p.vx = 0; p.inv = Math.max(p.inv, 3); E.root.classList.add('cine'); sfx.hit(true); shake(16);
      pin = { o, f, x: clamp(p.x + f * 105, -950, 950) };
      if (can(o)) Object.assign(o, { state: 'idle', stun: 0, act: null, vx: 0, vy: 0, tele: 0, y: 0, ground: true });
    } else if (t > 1) { p.vx = 0; JU.tech.charge(60); E.endMove(p); }      // nobody to take hold of: most of it back
    return;
  }
  const u = t - m.grab;
  p.vx = 0;
  if (u < 1.2) {                                    // the two of them, head to head, and it gathering between them
    p.target = [.5, .35, 1.7, 1.55, .5, -.5, 0];
    const c = [p.x + f * 60, p.y + 300 * SIZE];
    V.mote(c[0], c[1], 'white'); if (Math.random() < .5) V.mote(c[0], c[1], 'blue');
    if (Math.floor(u * 5) !== m.tk) { m.tk = Math.floor(u * 5); sfx.tick(m.tk % 3); shake(4 + u * 14); V.ring(c[0], c[1], 260 - u * 160, DC.core, .2); }
    if (!m.r) { m.r = 1; sfx.rise(1.2); E.zoomIn(1.2); }
    return;
  }
  if (!m.go) {
    m.go = 1; white = .5; pin = null; E.root.classList.remove('cine');
    sfx.cannon(2); sfx.bf(); shake(60); E.stop(.12); V.split(f > 0 ? .05 : -.05);
    const z = muzzle(p); beam(z[0], z[1], z[0] + f * 2600, z[1] - 120, 150, .9, DC, { keep: true });
    if (!o.ko) { hit(o, f, 600, DC, { kb: 2300, lift: 700, stun: 1.2, stop: .3, heavy: 1, ring: 1 }); V.impact(.2, o.x, mid(o)); C.cubes(o.x, 40, 12, 1.3); smoke(o.x, 20, 12, 1.5, DC); }
    label(p.x, p.y + 480, 'ZERO DISTANCE', '#ffffff', 1.4);
  }
  p.target = u < 1.6 ? RECOIL : POSE.idle;
  if (u > 1.9) E.endMove(p);
} };
JU.tech.add('dced', { name: 'Direct Cursed Energy Discharge', jp: '直・呪力放出', mark: '直', who: 'Granite Cannon, at no distance', odds: 0, col: DC.core, glow: 'white', moves: MOVES,
  awakened: true, secret: true, skin: JU.cast6.ISHIGORI, as: ['Granite Cannon', '砲'], scale: SIZE,
  hint: '<b>Hold 1</b> Point-Blank · <b>2</b> Granite Lance · <b>3</b> Discharge Step · <b>4</b> Overflow · <b>E</b> Recoil Counter · <b>G</b> Zero Distance',
  awkName: 'Zero Distance', awkHits: false, awkStart: 0, awaken(p) { p.move = { def: ZERO, t: 0 }; } });
const DEF = JU.tech.TECH.dced, on = () => JU.tech.active === DEF;
if (JU.especial) JU.especial.add('dced', ESP);

/* ================= the Secret CT row: what has been found, and the combined one ================= */
const S = { dced: 0, tdced: 0, raids: 0 };          // whether it has dropped; whether the two have been combined; Granite raids cleared
try { Object.assign(S, JSON.parse(localStorage.getItem('ju.secret') || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem('ju.secret', JSON.stringify(S)); } catch (e) {} };
const DROP = .03;
const tcedOpen = () => { const a = JU.awakened.LIST.find(x => x.id === 'tced'); return !!(a && a.open && a.open()); };
JU.awakened.LIST.push({ id: 'dced', secret: true, name: 'Direct Cursed Energy Discharge', mark: '直', col: DC.core,
  what: 'Granite Cannon at no distance, stronger than Cursed Cannon. Point-Blank, Granite Lance, Discharge Step, Overflow. E: Recoil Counter. G: Zero Distance (600).',
  later: () => `The Granite Cannon drops it at the end of a Granite raid, 3% a clear. A Granite raid takes two players or more (a public server: Start a raid). Granite raids cleared: ${S.raids}.`,
  open: () => dev() || !!S.dced });
// each player who clears a Granite raid rolls for it once (raid.js)
function raidDrop() {
  S.raids++; save();
  if (S.dced) return false;
  if (Math.random() >= DROP) return false;
  S.dced = 1; save();
  sfx.bf(); E.banner('秘伝', 'SECRET CT · DIRECT CURSED ENERGY DISCHARGE', 'xs');
  label(E.P1.x, E.P1.y + 520, 'IT DROPPED: DIRECT CURSED ENERGY DISCHARGE (3%)', DC.core, 4);
  return true;
}

/* ================= the Granite raid's boss: the Granite Cannon, with a moveset fit for two ================= */
const B = JU.boss, BC = COL.cyan;
Fi.DEFS.gr_ryu = Object.assign({}, Fi.DEFS.ishigori, { name: 'Granite Cannon', jp: '砲', hp: 1100, scale: 1.25, dr: .7, speed: 250 });
const base = (Fi.DEFS.ishigori.kit && Fi.DEFS.ishigori.kit.moves) || [];
const BOSS = [
  ...base,                                          // Granite Blast and Dessert, as the story has them
  { name: 'Downpour', cd: 8, max: 1500, wind: .5, pre: 'crushWind', dur: 1.5, run(o, p, M, t) {      // where he is standing, and either side of it: move
    o.rate = 30; o.vx = 0; o.target = t < 1 ? [-.42, -.36, 2.9, 2.7, .4, -.56, 0] : POSE.idle;
    if (M.s) return;
    M.s = 1; sfx.cannon(1); shake(14);
    for (let i = 0; i < 5; i++) {
      const x = clamp(p.x + (i - 2) * 190 + rnd(-30, 30), -930, 930), at = .5 + i * .13;
      B.mark(x, 110, at, BC.core);
      B.later(at, () => { pillar(x, 50, .3, BC); sfx.zap(); smoke(x, 10, 4, .9, BC); B.burst(x, 110, { dmg: 9, kb: 300, lift: 420, stun: .5 }, 420); });
    }
  } },
  { name: 'Repulse', cd: 7, max: 420, wind: .35, pre: 'crushWind', dur: .7, run(o, p, M, t) {      // too close: all round him at once
    o.rate = 40; o.vx = 0; o.target = t < .3 ? [-.2, -.14, 1.9, -1.2, .46, -.46, 0] : POSE.idle;
    if (M.s) return;
    M.s = 1; burstFx(o.x, o.y + 200, 1.1, BC); sfx.blast(); sfx.cannon(0); shake(22);
    B.burst(o.x, 360, { dmg: 13, kb: 950, lift: 540, stun: .7 }, 400);
  } },
  { name: 'Volley', cd: 6, min: 260, wind: .4, pre: 'hookWind', dur: 1.1, run(o, p, M, t) {      // thin ones, quick, one after another: dash through, or jump
    o.rate = 40; o.vx = 0; o.target = Math.floor(t / .05) % 2 ? [-.14, -.08, 2.75, 2.5, .5, -.5, 0] : [-.34, -.2, 2.45, 2.2, .62, -.3, 0];
    while ((M.n || 0) < 6 && t >= .1 + (M.n || 0) * .11) {
      M.n = (M.n || 0) + 1;
      const x = o.x + o.face * 80, y = o.y + 300, dx = p.x - x, dy = p.y + 150 - y, L = Math.hypot(dx, dy) || 1;
      B.shot({ x, y, vx: dx / L * 2100, vy: dy / L * 2100, r: 16, life: 1.2, a: { dmg: 4, kb: 120, stun: .25 }, rgb: BC.rgb,
        draw(s) { const c = F(s.x, s.y); lit(() => E.glow(E.GLOW.blue, c[0], c[1], 70 * c[2], 1)); g.fillStyle = '#fff'; g.beginPath(); g.arc(c[0], c[1], 9 * c[2], 0, TAU); g.fill(); } });
      sfx.zap(); V.ring(x, y, 70, BC.core, .12);
    }
  } },
  { name: 'Max Granite Blast', cd: 18, below: .5, wind: 1.1, pre: 'divWind', dur: 1.9, run(o, p, M, t) {      // the whole floor in front of him: dash through it
    o.rate = 26; o.vx = t < 1.3 ? -o.face * 110 : 0; o.target = t < 1.4 ? [-.34, -.2, 2.45, 2.2, .62, -.3, 0] : POSE.idle;
    if (!M.s) { M.s = 1; sfx.cannon(2); sfx.roar(1.3); shake(40); E.zoomIn(.4); const y = o.y + 330; beam(o.x + o.face * 80, y, o.x + o.face * 2800, y - 140, 200, 1.3, BC, { keep: true }); }
    if (t < 1.3 && !M.hit) { const dx = (p.x - o.x) * o.face; if (dx > 0 && dx < 2000 && p.y < 380 && !(p.dashT > 0) && Fi.hurt(o.face, { dmg: 26, kb: 1200, lift: 600, stun: .9 }, B.mul())) M.hit = 1; }
  } }
];
B.kit('gr_ryu', { tech: 'Cursed Energy Discharge', col: BC.core, glow: 'blue', every: [1.7, 2.9], moves: BOSS });
Fi.DEFS.gr_ryu.kit.fx = { el: 'energy', c1: BC.rgb, c2: '255,255,255' };      // (its colours, for bossfx.js)

/* ================= wiring ================= */
const tick0 = H.tick, fx0 = H.fx, post0 = H.post, guard0 = H.guard, pre0 = H.foePre, hit0 = H.hit, rim0 = H.rim, reset0 = H.reset, start0 = H.fightStart;
H.tick = dt => {
  tick0(dt);
  if (shots.length) shotsTick(dt);
  if (waves.length) wavesTick(dt);
  if (white > 0) white -= dt;
  if (ready && (ready.t -= dt) <= 0) ready = null;
  if (pin && !(on() && E.P1.move && E.P1.move.def === ZERO)) { pin = null; E.root.classList.remove('cine'); }
};
H.fx = dt => { fx0(dt); if (waves.length) drawWaves(); if (shots.length) drawShots(); };
H.post = dt => { if (post0) post0(dt); if (white > 0) { g.fillStyle = `rgba(255,255,255,${Math.min(1, white * 2.4)})`; g.fillRect(0, 0, E.VW, E.VH); } };
H.guard = (face, a, mul) => {                       // Recoil Counter: the blow is stopped, and answered
  if (guard0 && guard0(face, a, mul)) return true;
  if (!on() || !ready || E.P1.dead) return false;
  const p = E.P1, m = p.move, o = E.P2;
  ready = null;
  if (m && m.def === ESP) m.ans = m.t;
  if (a && a.shot) { V.ring(p.x, p.y + 170 * SIZE, 160, DC.core, .2); sfx.tap(1); return true; }
  const w = palm(p);
  cone(w[0], w[1], p.face, 520, DC, .3); sfx.cannon(1); shake(26); E.zoomIn(.3); p.pose = RECOIL.slice();
  if (!o.ko && Math.abs(o.x - p.x) < 560) E.after(.04, () => { hit(o, p.face, 70, DC, { kb: 1300, lift: 480, stun: 1, stop: .2, heavy: 1 }); impact(o.x, mid(o), 1.3, DC); label(o.x, o.y + 470 * hs(o), 'RECOIL', DC.core, 1); });
  return true;
};
H.foePre = (o, p, dt) => {                          // held, head to head, for Zero Distance
  if (!pin || pin.o !== o) return pre0 ? pre0(o, p, dt) : false;
  o.vx = 0; o.x = pin.x; o.y = 0; o.face = -pin.f; o.target = POSE.hurt; o.rate = 30;
  return true;
};
H.hit = (o, face, h) => {                           // the bar for Zero Distance fills with what he does: about 900 of it
  hit0(o, face, h);
  const m = E.P1.move;
  if (on() && !(m && m.def === ZERO)) JU.tech.charge(h.dmg * (o.dr || 1) * .11);
};
H.rim = f => {
  if (f !== E.P1 || !on() || f.dead) return rim0 ? rim0(f) : null;
  const m = f.move, big = m && m.def === ZERO && m.grab !== undefined;
  return { col: DC.core, blur: big ? 9 + 6 * Math.sin(E.T * 30) : 4 + 1.5 * Math.sin(E.T * 5) };
};
const clear = () => { shots.length = waves.length = 0; ready = pin = null; white = 0; E.root.classList.remove('cine'); };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => {
  start0(cfg, wave); if (!wave) clear();
  if (on() && !JU.clan.body()) E.P1.scale = SIZE;
};

JU.dced = { MOVES, ESP, ZERO, kit, raidDrop, DROP, BOSS, get found() { return !!S.dced; }, get combined() { return !!S.tdced; },
  combine() { if (S.tdced || !(dev() || S.dced) || !tcedOpen()) return false; S.tdced = 1; save(); return true; },
  tcedOpen, get raids() { return S.raids; },
  get state() { return { shots: shots.length, waves: waves.length, ready: !!ready, pin: !!pin, S: Object.assign({}, S) }; } };
})();
