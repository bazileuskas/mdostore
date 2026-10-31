/* JUJUTSU UNLIMITEDS — Build 0.22v1: TRUE DIRECT CURSED ENERGY DISCHARGE, a Secret CT: Direct Cursed Energy Discharge (dced.js) combined with True
   Cursed Energy Discharge (tced.js), on the Secret CT row of the Awaken CT screen. The user's: "an insane moveset with over 50 different moves and
   4 variants with a different awakening for each variant", all in one moveset, switched with RMB + Z (Cursed Cannon: Direction Blast) and T + RMB
   (Cursed Energy Discharge: MAX); the other two were ours to make up: Scatter (RMB + X) and Zero Range (Y + RMB). Right click alone goes through
   the four in order (so does C, and the touch button). And while it is equipped, the songs the user named play: Jane You're Early and AIZO.
   Every mode has its own: 1 2 3 4; the same four in the air; one of them held; a follow-up; E; G (its own awakening, from the one bar); and a
   strike that comes out as it is switched to. 54 in all. The names and numbers are ours:
   DIRECTION (cyan)   1 Direction Blast 34 · S held: Down Blast, along the floor, 32 and up they go · away from them: Back Blast, through them, 28
                      2 Crossfire 8 x 9 · 3 Ricochet 3 x 18 (held: Charged Ricochet 5 x 16) · 4 Compass Rose 8 x 6 + 40
                      air: 1 Sky Direction 38 · 2 Falling Cross 2 x 20 · 3 Rebound Dive 30 · 4 Star Fall 5 x 10
                      1 after a Down Blast has them up: Sky Pierce 40 · E Redirect 60 · G Omnidirectional Discharge 400 · switched to: Turnabout 15
   MAX (white-blue)   1 MAX Granite 95 (held: MAX Overcharge 150) · 2 MAX Downpour 12 x 14 · 3 MAX Repulse 120 · 4 MAX Uppercut 60 + 60
                      air: 1 MAX Meteor 85 · 2 MAX Hail 6 x 18 · 3 MAX Air Burst 100 · 4 MAX Crash 110
                      1 after MAX Repulse: MAX Follow-Through 80 · E MAX Wall 50 · G City Breaker 1200 · switched to: Overload 20
   SCATTER (teal)     1 Scatter Shot 7 x 8 · 2 Machine Granite 16 x 4 (held: up to 40) · 3 Cluster Orb 25 + 6 x 7 · 4 Shrapnel Storm 20 x 5
                      air: 1 Scatter Rain 7 x 8 · 2 Strafe 12 x 5 · 3 Cluster Drop 3 x 20 · 4 Fireworks 10 x 6
                      3 after a Cluster Orb has burst: Recluster 40 · E Flak 12 x 5 · G Thousand Granite 100 x 4 · switched to: Spray 5 x 4
   ZERO RANGE (red)   1 Discharge Jabs 3 x 14 · 2 Granite Hook 55 · 3 Pompadour Headbutt 60 (held: up to 100) · 4 Full Course 6 x 10 + 50
                      air: 1 Hammer Drop 50 · 2 Air Combo 4 x 10 · 3 Comet Knee 55 · 4 Pile Driver 90
                      2 after a Granite Hook: Chase Hook 45 · E Trade 90 · G Dessert: Full Course 1000 · switched to: Lunge 18 */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, C = JU.cut, Z = JU.bossfx, T = JU.tech;
const DK = JU.dced.kit, { COL, beam, ray, onLine, impact, burstFx, cone, pillar, drop, smoke, fire, floorWave, hit, up, can, hs, mid, held, label, sideOf, palm, lit, shake, duel, dev, PALMS, SHOULDER, LOWER, SIZE, muzzle, AIM, RECOIL } = DK;
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2, SLOTS = T.SLOTS;
const SKY = [-.42, -.36, 2.9, 2.7, .4, -.56, 0], OPEN = [-.2, -.14, 1.9, -1.2, .46, -.46, 0], HEAD = [.7, .5, .3, -.4, .7, -.6, 0], HAMMER = [.4, .2, 3, 3, .6, -.5, 0], KNEE = [.3, .2, 1, .6, 2.3, -.3, 0];
const face = p => { const o = E.P2; if (o && !o.ko) p.face = sideOf(p, o); };
// 0.22v2 (the user: "better sfx and vfx for TDCED like from the anime and manga"): the big ones get impact frames, focus lines and the sound
// written in (modeset.js), over real clips (myinstants: home-tdc-*; and the game's own Hollow Purple blast, heavy punch and Black Flash)
const clipOf = (name, vol) => { if (sfx.file) sfx.file(name, vol); };
const manga = (p, word, col, kind, snd) => { if (JU.ms) JU.ms.bigHit(p, E.P2, word, col, kind); if (snd) clipOf(snd, .85); };
const fist = (p, front = true) => { const h = E.hand(p, front), s = hs(p); return [p.x + (h[0] - p.x) * s, p.y + (h[1] - p.y) * s]; };
// which way he is pushing as he does it: down (S), away from them (back), or neither
const dirOf = p => { const s = E.keys.has('s') || E.keys.has('arrowdown'), x = (E.keys.has('d') || E.keys.has('arrowright') ? 1 : 0) - (E.keys.has('a') || E.keys.has('arrowleft') ? 1 : 0); return s ? 'down' : x && x === -p.face ? 'back' : 'fwd'; };
// a line from a point at the middle of o (not too steep), as far as len
function at(p, x, y, o, len = 1700, steep = .6) {
  if (!o || o.ko) return ray(x, y, p.face, -.03, len);
  const dx = Math.max(120, (o.x - x) * p.face), dy = clamp(mid(o) - y, -steep * dx * 2, steep * dx * 2);
  return ray(x, y, p.face, Math.atan2(dy, dx), len);
}
function shoot(x, y, o, v, dmg, Cc, more = {}) {    // a shot at them from (x, y)
  const tx = o && !o.ko ? o.x : x + 900 * (more.face || 1), ty = o && !o.ko ? mid(o) + rnd(-40, 40) : y, L = Math.hypot(tx - x, ty - y) || 1, sp = more.spread || 0, a = Math.atan2(ty - y, tx - x) + sp;
  fire(Object.assign({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 11, dmg, Cc }, more));
  void L;
}
const ENDS = (p, m, t, end) => { if (t > end) E.endMove(p); };
let follow = null;                                  // a follow-up on offer: { key, until, def, need, mode }
const offer = (key, def, secs, need) => { follow = { key, until: E.T + secs, def, need, mode }; };

/* ================= DIRECTION: aimed, and wherever he is pushing ================= */
const D_ = COL.cyan;
const DIR = {
  strikes: { name: 'Direction Blast', cd: 2.5, dur: 1, run(p, m, t) {
    const o = E.P2;
    p.rate = 40;
    if (m.d === undefined) { m.d = dirOf(p); face(p); sfx.charge(); }
    if (t < .14) { p.vx = 0; p.target = m.d === 'down' ? LOWER : AIM; return; }
    if (!m.f) {
      m.f = 1; const z = muzzle(p);
      if (m.d === 'down') {                            // into the floor in front of him: it runs along the floor at them, and puts them up
        const x = p.x + p.face * 150; beam(z[0], z[1], x, 0, 40, .3, D_); burstFx(x, 40, .5, D_); V.crack(x, 200); sfx.cannon(1); shake(16);
        floorWave(x, p.face, 32, D_, { kb: 280, lift: 1050, stun: 1 }, 1800, 1400); label(p.x, p.y + 470, 'DOWN BLAST', D_.core);
        offer('strikes', SKYPIERCE, 1.2, () => E.P2.y > 120 && !E.P2.ko);
      } else if (m.d === 'back') {                     // behind him: and it throws him forward, through them
        beam(z[0], z[1], z[0] - p.face * 1300, z[1] - 40, 46, .35, D_); sfx.cannon(1); shake(18); m.rush = 1; p.inv = Math.max(p.inv, .5); label(p.x, p.y + 470, 'BACK BLAST', D_.core);
      } else {
        const a = at(p, z[0], z[1], o); beam(a.x0, a.y0, a.x1, a.y1, 40, .32, D_); sfx.cannon(1); shake(14);
        if (up(o) && onLine(o, a, 40)) { hit(o, p.face, 34, D_, { kb: 700, lift: 300, stun: .7, stop: .1, heavy: 1 }); impact(o.x, mid(o), 1, D_); }
        if (a.floor) { V.crack(a.x1, 160); V.rocks(a.x1, 0, 6); }
      }
    }
    if (m.rush && t < .5) {
      p.vx = p.face * 2700; p.target = POSE.dash; if (Math.random() < .9) V.puff('blue', p.x - p.face * 50, p.y + rnd(40, 260), -p.face * 400, 0, 30, .2);
      if (!m.hit && up(o) && Math.abs(o.x - p.x) < 120) { m.hit = 1; hit(o, p.face, 28, D_, { kb: 500, lift: 520, stun: .8, stop: .1, heavy: 1 }); impact(o.x, mid(o), 1, D_); }
      return;
    }
    p.vx = 0; p.target = t < .4 ? RECOIL : POSE.idle; ENDS(p, m, t, .6);
  } },
  crush: { name: 'Crossfire', cd: 7, dur: 1.2, run(p, m, t) {      // from four sides at once, crossing where they stand; then from the four corners
    const o = E.P2;
    p.vx = 0; p.rate = 40; p.target = t < .25 ? SKY : Math.floor(t / .05) % 2 ? OPEN : PALMS;
    if (!m.c) { m.c = 1; m.n = 0; sfx.charge(); face(p); m.x = up(o) ? o.x : p.x + p.face * 400; }
    while (m.n < 2 && t >= .25 + m.n * .3) {
      const tx = up(o) ? o.x : m.x, ty = up(o) ? mid(o) : 170;
      for (let i = 0; i < 4; i++) {
        const ang = (m.n ? Math.PI / 4 : 0) + i * Math.PI / 2, a = { x0: tx + Math.cos(ang) * 900, y0: Math.max(8, ty + Math.sin(ang) * 900), x1: tx - Math.cos(ang) * 320, y1: Math.max(0, ty - Math.sin(ang) * 320) };
        beam(a.x0, a.y0, a.x1, a.y1, 26, .28, D_, { bare: true });
        if (up(o) && onLine(o, a, 26)) hit(o, p.face, 9, D_, { kb: 0, stun: .5, stop: .03 });
      }
      m.n++; sfx.cannon(0); shake(12); V.ring(tx, ty, 170, D_.core, .2); V.sparks(tx, ty, 'blue', 8);
    }
    ENDS(p, m, t, .95);
  } },
  div: { name: 'Ricochet', cd: 6, dur: 2, run(p, m, t) {      // off the floor and the walls; held, two more times
    const o = E.P2;
    p.rate = 40; p.vx = 0;
    if (m.go === undefined) {
      p.target = AIM; face(p); if (!m.c) { m.c = 1; sfx.charge(); }
      if (t >= .16 && !(held('3', 'div') && t < .55)) { m.go = t; m.legs = t >= .5 ? 5 : 3; m.n = 0; m.pts = null; if (m.legs > 3) label(p.x, p.y + 470, 'CHARGED RICOCHET', D_.core); }
      return;
    }
    if (!m.pts) {                                     // the path: through them, on to whatever is behind them (floor, wall, the top of the picture), and back through them
      const z = muzzle(p), pts = [[z[0], z[1]]], T0 = up(o) ? [o.x, mid(o)] : [z[0] + p.face * 600, 170];
      let a = [z[0], z[1]];
      for (let i = 0; i < m.legs; i++) {
        let dx = T0[0] - a[0], dy = T0[1] - a[1]; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
        if (i && Math.abs(dy) < .15) { dy = i % 2 ? .45 : -.45; const n = Math.hypot(dx, dy); dx /= n; dy /= n; }      // (never quite flat, or it would go back and forth along the same line)
        const s = Math.max(160, Math.min(dy < 0 ? -T0[1] / dy : dy > 0 ? (1150 - T0[1]) / dy : 1e9, dx > 0 ? (980 - T0[0]) / dx : dx < 0 ? (-980 - T0[0]) / dx : 1e9));
        a = [clamp(T0[0] + dx * s, -1000, 1000), clamp(T0[1] + dy * s, 0, 1200)]; pts.push(a);
      }
      m.pts = pts;
    }
    p.target = RECOIL;
    while (m.n < m.legs && t >= m.go + m.n * .09) {
      const a = { x0: m.pts[m.n][0], y0: m.pts[m.n][1], x1: m.pts[m.n + 1][0], y1: m.pts[m.n + 1][1] };
      beam(a.x0, a.y0, a.x1, a.y1, 26, .26, D_, { bare: m.n > 0 }); sfx.zap(); V.ring(a.x1, a.y1, 90, D_.core, .14); if (a.y1 < 5) V.rocks(a.x1, 0, 3);
      if (up(o) && onLine(o, a, 26)) hit(o, p.face, m.legs > 3 ? 16 : 18, D_, { kb: 80, stun: .45, stop: .03 });
      m.n++;
    }
    if (t > m.go + m.legs * .09 + .3) E.endMove(p);
  } },
  manji: { name: 'Compass Rose', cd: 12, dur: 2, run(p, m, t) {      // round the compass one at a time, then every point at once
    const o = E.P2, y = p.y + 190 * SIZE;
    p.vx = 0; p.rate = 40;
    if (!m.c) { m.c = 1; m.n = 0; sfx.charge(); face(p); E.zoomIn(.3); }
    p.target = t < .2 ? LOWER : t < 1.1 ? (Math.floor(t / .05) % 2 ? OPEN : PALMS) : RECOIL;
    while (m.n < 8 && t >= .2 + m.n * .09) {
      const a = ray(p.x, y, 1, m.n * Math.PI / 4, 1400); m.n++;
      beam(a.x0, a.y0, a.x1, a.y1, 22, .22, D_, { bare: true }); sfx.zap();
      if (up(o) && onLine(o, a, 22)) hit(o, p.face, 6, D_, { kb: 30, stun: .5, stop: .02 });
    }
    if (t >= 1.05 && !m.all) {
      m.all = 1; burstFx(p.x, y, .9, D_); sfx.cannon(2); shake(28);
      let got = false;
      for (let i = 0; i < 8; i++) { const a = ray(p.x, y, 1, i * Math.PI / 4 + Math.PI / 8, 1600); beam(a.x0, a.y0, a.x1, a.y1, 34, .34, D_, { bare: i > 0 }); if (!got && up(o) && onLine(o, a, 34)) got = true; }
      if (got || (up(o) && Math.abs(o.x - p.x) < 320)) { hit(o, p.face, 40, D_, { kb: 1100, lift: 500, stun: .9, stop: .14, heavy: 1 }); impact(o.x, mid(o), 1.2, D_); }
    }
    ENDS(p, m, t, 1.45);
  } }
};
const DIR_AIR = {
  strikes: { name: 'Sky Direction', dur: .9, run(p, m, t) {      // down at them out of the air, steep
    const o = E.P2;
    p.rate = 40; if (p.vy < -150) p.vy = -150; p.vx *= .9;
    if (t < .12) { p.target = AIM; face(p); return; }
    if (!m.f) {
      m.f = 1; const z = muzzle(p), a = up(o) ? at(p, z[0], z[1], o, 1700, 2) : ray(z[0], z[1], p.face, -.9, 1700);
      beam(a.x0, a.y0, a.x1, a.y1, 42, .34, D_); sfx.cannon(1); shake(16); p.vy = 300;
      if (a.floor) { V.crack(a.x1, 220); V.rocks(a.x1, 0, 8); E.addDust(a.x1); }
      if (up(o) && onLine(o, a, 42)) { hit(o, p.face, 38, D_, { kb: 400, stun: .9, stop: .12, heavy: 1 }); impact(o.x, mid(o), 1.1, D_); if (can(o) && !o.ground) o.vy = -1600; }
    }
    p.target = RECOIL; if (p.ground && t > .3) E.endMove(p);
  } },
  crush: { name: 'Falling Cross', dur: .9, run(p, m, t) {      // two of them down from the air, crossing where they stand
    const o = E.P2;
    p.rate = 40; if (p.vy < -150) p.vy = -150;
    if (t < .12) { p.target = OPEN; face(p); return; }
    if (!m.f) {
      m.f = 1; const y = p.y + 190 * SIZE, tx = up(o) ? o.x : p.x + p.face * 300;
      for (const s of [-1, 1]) { const x0 = tx + s * 420, a = { x0, y0: y + 100, x1: tx - s * 60, y1: 0 }; beam(a.x0, a.y0, a.x1, a.y1, 34, .3, D_, { bare: true }); if (up(o) && onLine(o, a, 34)) hit(o, p.face, 20, D_, { kb: 200, lift: 300, stun: .7, stop: .08 }); }
      V.crack(tx, 220); V.rocks(tx, 0, 8); sfx.cannon(1); shake(16); label(tx, 470, 'X', D_.core, .6);
    }
    p.target = PALMS; if (p.ground && t > .3) E.endMove(p);
  } },
  div: { name: 'Rebound Dive', dur: 1.3, run(p, m, t) {      // straight up out of his hair: it drives him down, and the floor goes both ways
    const o = E.P2;
    p.rate = 40;
    if (!m.f) { m.f = 1; const z = muzzle(p); beam(z[0], z[1], z[0], z[1] + 900, 40, .3, D_); p.vy = -2600; p.vx = 0; sfx.cannon(1); shake(12); }
    p.target = SKY;
    if (m.land === undefined) { if (!p.ground && t < 1) return; m.land = t; burstFx(p.x, 30, .7, D_); V.crack(p.x, 260); E.addDust(p.x); shake(24); floorWave(p.x, 1, 30, D_); floorWave(p.x, -1, 30, D_); }
    ENDS(p, m, t, m.land + .35);
  } },
  manji: { name: 'Star Fall', dur: 1, run(p, m, t) {      // a fan of five down over them
    const o = E.P2;
    p.rate = 40; if (p.vy < -100) p.vy = -100;
    if (!m.c) { m.c = 1; m.n = 0; face(p); sfx.charge(); }
    p.target = Math.floor(t / .05) % 2 ? AIM : RECOIL;
    while (m.n < 5 && t >= .12 + m.n * .08) {
      const z = muzzle(p), base = up(o) ? Math.atan2(mid(o) - z[1], Math.max(80, (o.x - z[0]) * p.face)) : -.8, a = ray(z[0], z[1], p.face, base + (m.n - 2) * .14, 1600); m.n++;
      beam(a.x0, a.y0, a.x1, a.y1, 22, .24, D_, { bare: m.n > 1 }); sfx.zap(); if (a.floor) V.rocks(a.x1, 0, 3);
      if (up(o) && onLine(o, a, 22)) hit(o, p.face, 10, D_, { kb: 60, stun: .5, stop: .03 });
    }
    if ((p.ground && t > .5) || t > .9) E.endMove(p);
  } }
};
const SKYPIERCE = { name: 'Sky Pierce', dur: .7, run(p, m, t) {      // 1 again, once a Down Blast has them up: after them, up the line they went
  const o = E.P2;
  p.vx = 0; p.rate = 40; p.target = t < .1 ? SKY : RECOIL;
  if (t >= .1 && !m.f) { m.f = 1; face(p); const z = muzzle(p), a = at(p, z[0], z[1], o, 1800, 3); beam(a.x0, a.y0, a.x1, a.y1, 44, .34, D_); sfx.cannon(2); shake(20); if (!o.ko) { hit(o, p.face, 40, D_, { kb: 900, lift: 700, stun: 1, stop: .14, heavy: 1 }); impact(o.x, mid(o), 1.2, D_); if (JU.ms) { JU.ms.focus(o.x, mid(o), .35); JU.ms.ono('バシュッ', o.x, mid(o) + 260, .9, D_.core); } } label(p.x, p.y + 470, 'SKY PIERCE', D_.core); }
  ENDS(p, m, t, .55);
} };
const REDIRECT = { name: 'Redirect', jp: '転向', cd: 12, guard: 'redirect', dur: 1.1 };
const TURNABOUT = { name: 'Turnabout', dur: .5, run(p, m, t) {      // as Direction comes in: one quick one at them
  const o = E.P2;
  p.vx = 0; p.rate = 44; p.target = t < .08 ? AIM : RECOIL;
  if (t >= .08 && !m.f) { m.f = 1; face(p); const z = muzzle(p), a = at(p, z[0], z[1], o); beam(a.x0, a.y0, a.x1, a.y1, 20, .2, D_); sfx.zap(); if (up(o) && onLine(o, a, 20)) hit(o, p.face, 15, D_, { kb: 300, stun: .5, stop: .05 }); }
  ENDS(p, m, t, .35);
} };

/* ================= MAX: as much as there is, and slower for it ================= */
const MX = COL.max;
function maxBeam(p, o, w, n, life, more) {          // one MAX beam out of his hair at them
  const z = muzzle(p), a = at(p, z[0], z[1], o, 2000, .4);
  beam(a.x0, a.y0, a.x1, a.y1, w, life, MX, { keep: true }); sfx.cannon(2); sfx.roar(life); shake(30 + w / 10); E.zoomIn(.4);
  if (a.floor) { V.crack(a.x1, 300); V.rocks(a.x1, 0, 14); C.cubes(a.x1, 20, 8); smoke(a.x1, 20, 8, 1.2, MX); }
  if (up(o) && onLine(o, a, w)) { hit(o, p.face, n, MX, Object.assign({ kb: 1500, lift: 560, stun: 1, stop: .24, heavy: 1, ring: 1 }, more)); impact(o.x, mid(o), 2, MX); V.impact(.14, o.x, mid(o)); C.cubes(o.x, 40, 8); manga(p, w > 200 ? 'ドォォォン' : 'ドォン', MX.core, 'bw'); return true; }
  return false;
}
const MAX = {
  strikes: { name: 'MAX Granite', cd: 6, dur: 3.2, run(p, m, t) {      // held past the first beat: Overcharge
    const o = E.P2;
    p.rate = 30; p.vx = 0;
    if (m.go === undefined) {
      p.target = AIM; face(p); if (!m.c) { m.c = 1; sfx.charge(); sfx.rise(.6); }
      const z = muzzle(p); V.mote(z[0], z[1], 'white'); if (Math.random() < .5) V.mote(z[0], z[1], 'blue');
      if (t >= .6 && !(held('1', 'strikes') && t < 1.8)) { m.go = t; m.over = t >= 1.7; }
      return;
    }
    if (!m.f) { m.f = 1; p.pose = RECOIL.slice(); maxBeam(p, o, m.over ? 260 : 170, m.over ? 150 : 95, m.over ? .8 : .6); if (m.over) label(p.x, p.y + 480, 'MAX OVERCHARGE', '#ffffff'); }
    p.target = t < m.go + .4 ? RECOIL : POSE.idle; p.vx = t < m.go + .25 ? -p.face * 260 : 0;
    ENDS(p, m, t, m.go + .6);
  } },
  crush: { name: 'MAX Downpour', cd: 11, dur: .8, run(p, m, t) {      // twelve of them, wider and heavier, all round wherever they stand
    p.vx = 0; p.rate = 34; p.target = t < .55 ? SKY : POSE.idle;
    if (m.c || t < .15) return;
    m.c = 1; const z = muzzle(p); sfx.cannon(2); shake(20); label(p.x, p.y + 480, 'MAX DOWNPOUR', '#ffffff');
    for (let i = 0; i < 12; i++) beam(z[0], z[1], z[0] + p.face * rnd(-200, 260) + (i - 5.5) * 40, 1300, 7, .24 + i * .01, MX, { bare: i > 0 });
    for (let i = 0; i < 12; i++) E.after(.45 + i * .08, () => {
      const o = E.P2, x = clamp(up(o) ? o.x + rnd(-80, 80) : E.P1.x + E.P1.face * (300 + i * 50), -1040, 1040);
      drop(x, MX, xx => { if (!on()) return; impact(xx, 50, 1.2, MX); V.crack(xx, 160); smoke(xx, 20, 4, 1, MX); sfx.blast(); shake(10); const q = E.P2; if (up(q) && Math.abs(q.x - xx) < 200 && q.y < 260) hit(q, q.x >= xx ? 1 : -1, 14, MX, { kb: 40, stun: .45, stop: .03 }); });
    });
  } },
  div: { name: 'MAX Repulse', cd: 9, dur: 1, run(p, m, t) {      // gathered in, then all round him at once, as far as it goes
    const o = E.P2;
    p.vx = 0; p.rate = 46;
    if (!m.c) { m.c = 1; sfx.charge(); }
    if (t < .4) { p.target = LOWER; if (Math.random() < .8) V.mote(p.x, p.y + 190 * SIZE, 'white'); return; }
    if (!m.f) {
      m.f = 1; p.pose = OPEN.slice(); const y = p.y + 190 * SIZE; burstFx(p.x, y, 1.6, MX); sfx.cannon(2); sfx.blast(); shake(36); E.zoomIn(.3); V.crack(p.x, 320); E.addDust(p.x - 120); E.addDust(p.x + 120);
      if (up(o) && Math.abs(o.x - p.x) < 520 && Math.abs(o.y - p.y) < 400) { hit(o, o.x >= p.x ? 1 : -1, 120, MX, { kb: 1600, lift: 700, stun: 1, stop: .2, heavy: 1, ring: 1 }); offer('strikes', FOLLOW, 1.1, () => !E.P2.ko); manga(p, null, MX.core, 'neg'); }
    }
    p.target = t < .7 ? OPEN : POSE.idle; ENDS(p, m, t, .85);
  } },
  manji: { name: 'MAX Uppercut', cd: 13, dur: 1.6, run(p, m, t) {      // up through them out of the floor, then down on them out of the sky
    const o = E.P2;
    p.vx = 0; p.rate = 36;
    if (!m.c) { m.c = 1; face(p); sfx.charge(); m.x = clamp(up(o) ? o.x : p.x + p.face * 350, -960, 960); }
    if (t < .3) { p.target = LOWER; return; }
    if (!m.a) { m.a = 1; p.pose = SKY.slice(); pillar(m.x, 120, .45, MX); sfx.cannon(2); shake(26); if (up(o) && Math.abs(o.x - m.x) < 160) { hit(o, p.face, 60, MX, { kb: 0, lift: 1200, stun: 1, stop: .14, heavy: 1 }); m.got = 1; } }
    if (t >= .75 && !m.b) {
      m.b = 1; const x = up(o) || (o && !o.ko) ? o.x : m.x, y = o && !o.ko ? mid(o) : 200;
      beam(x + p.face * 80, 1400, x, 0, 110, .4, MX, { keep: true }); sfx.cannon(2); shake(34); V.crack(x, 300); smoke(x, 20, 8, 1.2, MX);
      if (o && !o.ko && Math.abs(o.x - x) < 170) { hit(o, p.face, 60, MX, { kb: 200, stun: 1, stop: .2, heavy: 1, ring: 1 }); if (can(o) && !o.ground) o.vy = -2400; impact(o.x, y, 1.6, MX); }
    }
    p.target = t < 1 ? SKY : POSE.idle; ENDS(p, m, t, 1.25);
  } }
};
const MAX_AIR = {
  strikes: { name: 'MAX Meteor', dur: 1, run(p, m, t) {      // straight down under him, and it holds him up while it lasts
    const o = E.P2;
    p.rate = 34;
    if (t < .2) { p.target = SKY; p.vy = Math.max(p.vy, 0); return; }
    if (!m.f) { m.f = 1; const z = muzzle(p); beam(z[0], z[1] - 80, p.x, 0, 120, .5, MX, { keep: true }); sfx.cannon(2); shake(30); V.crack(p.x, 300); C.cubes(p.x, 20, 6); smoke(p.x, 20, 8, 1.2, MX); if (up(o) && Math.abs(o.x - p.x) < 210 && o.y < p.y) { hit(o, p.face, 85, MX, { kb: 300, stun: 1, stop: .2, heavy: 1 }); if (can(o)) o.vy = -2000; } }
    if (t < .55) { p.vy = 260; p.target = RECOIL; } else p.target = POSE.fall;
    if ((p.ground && t > .5) || t > .95) E.endMove(p);
  } },
  crush: { name: 'MAX Hail', dur: 1, run(p, m, t) {      // six heavy ones out of him, down over them
    const o = E.P2;
    p.rate = 36; if (p.vy < -120) p.vy = -120;
    if (!m.c) { m.c = 1; m.n = 0; face(p); sfx.charge(); }
    p.target = Math.floor(t / .06) % 2 ? OPEN : PALMS;
    while (m.n < 6 && t >= .12 + m.n * .09) {
      const z = muzzle(p), tx = (up(o) ? o.x : p.x + p.face * 400) + (m.n - 2.5) * 70, dx = tx - z[0], dy = -z[1], L = Math.hypot(dx, dy) || 1; m.n++;
      fire({ x: z[0], y: z[1], vx: dx / L * 1500, vy: dy / L * 1500, r: 20, dmg: 18, Cc: MX, orb: true, h: { kb: 120, stun: .5, stop: .04 } }); sfx.zap();
    }
    if ((p.ground && t > .6) || t > .95) E.endMove(p);
  } },
  div: { name: 'MAX Air Burst', dur: .9, run(p, m, t) {      // all round him, up there
    const o = E.P2;
    p.rate = 40; p.vy = Math.max(p.vy, 0);
    if (t < .25) { p.target = LOWER; V.mote(p.x, p.y + 190 * SIZE, 'white'); return; }
    if (!m.f) { m.f = 1; const y = p.y + 190 * SIZE; burstFx(p.x, y, 1.3, MX); sfx.cannon(2); shake(30); if (up(o) && Math.hypot(o.x - p.x, mid(o) - y) < 430) hit(o, o.x >= p.x ? 1 : -1, 100, MX, { kb: 1300, lift: 400, stun: 1, stop: .18, heavy: 1, ring: 1 }); }
    p.target = OPEN; if (t > .7) E.endMove(p);
  } },
  manji: { name: 'MAX Crash', dur: 1.6, run(p, m, t) {      // down into the floor with all of it, and the floor goes up
    const o = E.P2;
    p.rate = 40;
    if (!m.d) { m.d = 1; p.vy = -2800; face(p); if (up(o)) p.vx = clamp((o.x - p.x) / .3, -2200, 2200); sfx.whoosh(); }
    p.target = HAMMER;
    if (m.land === undefined) { if (!p.ground && t < 1.3) return; m.land = t; p.vx = 0; burstFx(p.x, 60, 1.4, MX); pillar(p.x, 140, .4, MX); sfx.cannon(2); shake(40); E.zoomIn(.4); C.cubes(p.x, 20, 10); smoke(p.x, 20, 10, 1.4, MX); if (up(o) && Math.abs(o.x - p.x) < 380 && o.y < 300) { hit(o, o.x >= p.x ? 1 : -1, 110, MX, { kb: 1200, lift: 900, stun: 1, stop: .22, heavy: 1, ring: 1 }); manga(p, 'ズドン', MX.core, 'bw'); } }
    ENDS(p, m, t, m.land + .45);
  } }
};
const FOLLOW = { name: 'MAX Follow-Through', dur: 1, run(p, m, t) {      // 1 again, after MAX Repulse: after them while they are still going
  const o = E.P2;
  p.vx = 0; p.rate = 34; p.target = t < .25 ? AIM : RECOIL;
  if (t >= .25 && !m.f) { m.f = 1; face(p); maxBeam(p, o, 130, 80, .45); label(p.x, p.y + 480, 'FOLLOW-THROUGH', '#ffffff'); }
  ENDS(p, m, t, .7);
} };
const MAXWALL = { name: 'MAX Wall', jp: '壁', cd: 14, guard: 'wall', dur: 1.2 };
const OVERLOAD = { name: 'Overload', dur: .5, run(p, m, t) {      // as MAX comes in: it spills out of him
  const o = E.P2;
  p.vx = 0; p.rate = 44; p.target = OPEN;
  if (!m.f) { m.f = 1; const y = p.y + 190 * SIZE; burstFx(p.x, y, .7, MX); sfx.blast(); shake(16); if (up(o) && Math.abs(o.x - p.x) < 380) hit(o, o.x >= p.x ? 1 : -1, 20, MX, { kb: 800, lift: 300, stun: .6, stop: .06 }); }
  ENDS(p, m, t, .35);
} };

/* ================= SCATTER: a lot of small ones ================= */
const SC = COL.teal;
const SCAT = {
  strikes: { name: 'Scatter Shot', cd: 3, dur: .7, run(p, m, t) {      // a fan of seven
    const o = E.P2;
    p.vx = 0; p.rate = 44; p.target = t < .12 ? AIM : RECOIL;
    if (t >= .12 && !m.f) { m.f = 1; face(p); const z = muzzle(p); for (let i = 0; i < 7; i++) shoot(z[0], z[1], o, 2300, 8, SC, { spread: (i - 3) * .07 * p.face, face: p.face, h: { kb: 50, stun: .35, stop: .015 } }); sfx.cannon(0); sfx.zap(); shake(12); V.ring(z[0], z[1], 120, SC.core, .14); }
    ENDS(p, m, t, .45);
  } },
  crush: { name: 'Machine Granite', cd: 7, dur: 4, run(p, m, t) {      // a stream of them; held, it does not stop at sixteen
    const o = E.P2;
    p.vx = 0; p.rate = 50;
    if (!m.c) { m.c = 1; m.n = 0; face(p); sfx.charge(); }
    if (t < .15) { p.target = AIM; return; }
    const cap = m.more ? 40 : 16, n = Math.min(cap, Math.floor((t - .15) / .05) + 1);
    if (!m.more && m.n >= 15 && held('2', 'crush')) { m.more = 1; label(p.x, p.y + 470, 'HOLD', SC.core, .6); }
    while (m.n < n && !m.stop) { m.n++; face(p); const z = muzzle(p); shoot(z[0], z[1], o, 2500, 4, SC, { spread: rnd(-.04, .04), face: p.face, r: 8, h: { kb: 20, stun: .25, stop: .008 } }); if (m.n % 2) sfx.zap(); shake(4); }
    if (!m.stop && (m.n >= cap || (m.more && !held('2', 'crush')))) m.stop = t;
    p.target = m.stop ? POSE.idle : Math.floor(t / .04) % 2 ? AIM : RECOIL;
    if (m.stop && t > m.stop + .2) E.endMove(p);
  } },
  div: { name: 'Cluster Orb', cd: 8, dur: .7, run(p, m, t) {      // one big one, and it comes apart into six
    const o = E.P2;
    p.vx = 0; p.rate = 40; p.target = t < .2 ? PALMS : RECOIL;
    if (t >= .2 && !m.f) { m.f = 1; face(p); const w = palm(p); fire({ x: w[0], y: w[1], vx: p.face * 1300, vy: 0, r: 30, dmg: 25, Cc: SC, orb: true, fuse: .9, h: { kb: 200, stun: .7, stop: .08, heavy: 1 }, split: s => cluster(s) }); sfx.cannon(1); shake(12); }
    ENDS(p, m, t, .5);
  } },
  manji: { name: 'Shrapnel Storm', cd: 13, dur: 1.6, run(p, m, t) {      // thrown up, and twenty come down all over them
    const o = E.P2;
    p.vx = 0; p.rate = 40; p.target = t < .5 ? SKY : POSE.idle;
    if (!m.c) { m.c = 1; m.n = 0; sfx.cannon(1); const z = muzzle(p); for (let i = 0; i < 8; i++) beam(z[0], z[1], z[0] + rnd(-300, 300), 1300, 5, .2, SC, { bare: i > 0 }); label(p.x, p.y + 470, 'SHRAPNEL STORM', SC.core); }
    while (m.n < 20 && t >= .35 + m.n * .045) {
      m.n++; const cx = up(o) ? o.x : E.P1.x + p.face * 400, x = clamp(cx + rnd(-70, 70), -1040, 1040);
      fire({ x, y: 1250, vx: rnd(-40, 40), vy: -2400, r: 10, dmg: 5, Cc: SC, h: { kb: 20, stun: .3, stop: .01 } }); if (m.n % 3 === 0) sfx.zap();
    }
    ENDS(p, m, t, 1.4);
  } }
};
function cluster(s) {                               // a Cluster Orb comes apart: six, out from where it was
  impact(s.x, s.y, 1.2, SC); sfx.blast(); shake(14);
  const bits = [];
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + rnd(-.2, .2); const b = { x: s.x, y: Math.max(20, s.y), vx: Math.cos(a) * 900, vy: Math.sin(a) * 900 + 300, r: 10, dmg: 7, Cc: SC, grav: 1600, life: 1.1, h: { kb: 60, stun: .4, stop: .02 } }; fire(b); bits.push(b); }
  lastCluster = { t: E.T, x: s.x, y: s.y };
  offer('div', RECLUSTER, 1.2, () => !E.P2.ko);
}
let lastCluster = null;
const SCAT_AIR = {
  strikes: { name: 'Scatter Rain', dur: .8, run(p, m, t) {      // the fan, down
    const o = E.P2;
    p.rate = 44; if (p.vy < -150) p.vy = -150; p.target = t < .12 ? AIM : RECOIL;
    if (t >= .12 && !m.f) { m.f = 1; face(p); const z = muzzle(p); for (let i = 0; i < 7; i++) { const a = (up(o) ? Math.atan2(mid(o) - z[1], Math.max(60, (o.x - z[0]) * p.face)) : -.9) + (i - 3) * .09; fire({ x: z[0], y: z[1], vx: Math.cos(a) * 2200 * p.face, vy: Math.sin(a) * 2200, r: 11, dmg: 8, Cc: SC, h: { kb: 40, stun: .35, stop: .015 } }); } sfx.cannon(0); shake(10); }
    if ((p.ground && t > .3) || t > .75) E.endMove(p);
  } },
  crush: { name: 'Strafe', dur: 1, run(p, m, t) {      // a run of them along the floor under him as he goes
    const o = E.P2;
    p.rate = 50; if (p.vy < -80) p.vy = -80; p.vx = p.face * 500;
    if (!m.c) { m.c = 1; m.n = 0; face(p); }
    p.target = Math.floor(t / .04) % 2 ? AIM : RECOIL;
    while (m.n < 12 && t >= .08 + m.n * .05) { m.n++; const z = muzzle(p), tx = up(o) ? o.x + rnd(-60, 60) : z[0] + p.face * (200 + m.n * 40), dx = tx - z[0], dy = (up(o) ? mid(o) : 0) - z[1], L = Math.hypot(dx, dy) || 1; fire({ x: z[0], y: z[1], vx: dx / L * 2400, vy: dy / L * 2400, r: 8, dmg: 5, Cc: SC, h: { kb: 20, stun: .3, stop: .01 } }); if (m.n % 2) sfx.zap(); }
    if ((p.ground && t > .4) || t > .9) E.endMove(p);
  } },
  div: { name: 'Cluster Drop', dur: 1, run(p, m, t) {      // three dropped on them
    const o = E.P2;
    p.rate = 40; if (p.vy < -120) p.vy = -120; p.target = PALMS;
    if (!m.c) { m.c = 1; m.n = 0; face(p); }
    while (m.n < 3 && t >= .12 + m.n * .12) { m.n++; const w = palm(p), tx = (up(o) ? o.x : p.x + p.face * 300) + (m.n - 2) * 120; fire({ x: w[0], y: w[1], vx: (tx - w[0]) * 1.6, vy: 200, r: 22, dmg: 20, Cc: SC, orb: true, grav: 2600, h: { kb: 200, lift: 300, stun: .6, stop: .05 } }); sfx.zap(); }
    if ((p.ground && t > .5) || t > .95) E.endMove(p);
  } },
  manji: { name: 'Fireworks', dur: 1.1, run(p, m, t) {      // one up over them, and ten come down out of it
    const o = E.P2;
    p.rate = 40; if (p.vy < -120) p.vy = -120; p.target = SKY;
    if (!m.f) { m.f = 1; face(p); const z = muzzle(p), tx = up(o) ? o.x : p.x + p.face * 300; fire({ x: z[0], y: z[1], vx: (tx - z[0]) / .45, vy: 700, r: 16, dmg: 0, Cc: SC, orb: true, fuse: .45, split: s => { burstFx(s.x, s.y, .6, SC); sfx.blast(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i - 4.5) * .06; fire({ x: s.x, y: s.y, vx: Math.cos(a) * 900, vy: Math.sin(a) * rnd(700, 1000), r: 9, dmg: 6, Cc: SC, grav: 1200, life: 1.4, h: { kb: 20, stun: .3, stop: .01 } }); } } }); sfx.zap(); }      // (it bursts right over them)
    if ((p.ground && t > .5) || t > 1) E.endMove(p);
  } }
};
const RECLUSTER = { name: 'Recluster', dur: .7, run(p, m, t) {      // 3 again, once a Cluster Orb has come apart: the six of it come back together on them
  const o = E.P2;
  p.vx = 0; p.rate = 40; p.target = t < .3 ? PALMS : RECOIL;
  if (!m.f) { m.f = 1; for (let i = DK.shots.length - 1; i >= 0; i--) if (DK.shots[i].Cc === SC && DK.shots[i].r === 10) DK.shots.splice(i, 1); label(p.x, p.y + 470, 'RECLUSTER', SC.core); sfx.charge(); }
  if (t >= .25 && !m.b) { m.b = 1; if (!o.ko) { const x = o.x, y = mid(o); burstFx(x, y, 1, SC); sfx.blast(); shake(20); hit(o, p.face, 40, SC, { kb: 900, lift: 500, stun: .9, stop: .14, heavy: 1 }); } }
  ENDS(p, m, t, .55);
} };
const FLAK = { name: 'Flak', jp: '対空', cd: 12, guard: 'flak', dur: .8 };
const SPRAY = { name: 'Spray', dur: .45, run(p, m, t) {      // as Scatter comes in: five of them
  const o = E.P2;
  p.vx = 0; p.rate = 44; p.target = RECOIL;
  if (!m.f) { m.f = 1; face(p); const z = muzzle(p); for (let i = 0; i < 5; i++) shoot(z[0], z[1], o, 2300, 4, SC, { spread: (i - 2) * .06 * p.face, face: p.face, r: 8, h: { kb: 30, stun: .3, stop: .01 } }); sfx.zap(); }
  ENDS(p, m, t, .3);
} };

/* ================= ZERO RANGE: his fists, and it let go out of them as they land ================= */
const ZR = COL.red;
function punch(p, o, n, h, big) {                   // a punch with it let go out of the fist as it lands
  const w = fist(p);
  cone(w[0], w[1], p.face, big ? 380 : 220, ZR, big ? .24 : .16); sfx.hit(!!big); if (big) { sfx.cannon(0); clipOf('home-love-slam', .7); }
  if (!o.ko && Math.abs(o.x - p.x) < 300 && Math.abs(o.y - p.y) < 260 && o.state !== 'up') { hit(o, p.face, n, ZR, h); impact(o.x, mid(o), big ? 1.2 : .6, ZR); return true; }
  return false;
}
function close(p, o, dt, gap = 150, v = 2000) {     // in on them first
  const d = (o.x - p.x) * p.face;
  if (!o.ko && d > gap) { p.vx = p.face * v; return false; }
  p.vx = 0; return true;
}
const ZERO = {
  strikes: { name: 'Discharge Jabs', cd: 3, dur: 1, run(p, m, t) {      // three, quick, each one letting go
    const o = E.P2;
    p.rate = 50;
    if (!m.c) { m.c = 1; m.n = 0; face(p); }
    if (m.at === undefined) { p.target = POSE.dash; if (close(p, o, 0, 150, 1800) || t > .35) { m.at = t; p.vx = 0; } return; }      // in on them, then the three
    p.vx = 0;
    while (m.n < 3 && t >= m.at + .02 + m.n * .14) { m.n++; p.pose = (m.n % 2 ? POSE.jab : POSE.cross).slice(); punch(p, o, 14, m.n === 3 ? { kb: 700, lift: 300, stun: .7, stop: .08, heavy: 1 } : { kb: 50, stun: .45, stop: .04 }, m.n === 3); }
    p.target = t < m.at + .5 ? (m.n % 2 ? POSE.jab : POSE.cross) : POSE.idle;
    ENDS(p, m, t, m.at + .6);
  } },
  crush: { name: 'Granite Hook', cd: 6, dur: 1, run(p, m, t) {      // in, and a hook that lets it all go: up and away
    const o = E.P2;
    p.rate = 46;
    if (!m.c) { m.c = 1; face(p); sfx.whoosh(); }
    if (!m.f) { p.target = POSE.dash; if (!close(p, o, 0, 160, 2200) && t < .45) return; m.f = 1; p.vx = 0; p.pose = POSE.hook.slice(); if (punch(p, o, 55, { kb: 1100, lift: 900, stun: 1, stop: .16, heavy: 1 }, true)) offer('crush', CHASE, 1, () => !E.P2.ko && E.P2.y > 60); shake(22); }
    p.vx = 0; p.target = t < .6 ? POSE.hook : POSE.idle; ENDS(p, m, t, .75);
  } },
  div: { name: 'Pompadour Headbutt', cd: 7, dur: 2.2, run(p, m, t) {      // his hair first, and it lets go out of it; held, more of it
    const o = E.P2;
    p.rate = 40;
    if (m.go === undefined) {
      p.target = POSE.crushWind; p.vx = 0; face(p); if (!m.c) { m.c = 1; sfx.charge(); }
      const z = muzzle(p), k = clamp((t - .2) / 1, 0, 1); V.mote(z[0], z[1], 'red'); if (k > 0) shake(2 + k * 6);
      if (t >= .2 && !(held('3', 'div') && t < 1.2)) { m.go = t; m.k = k < .05 ? 0 : k; }
      return;
    }
    if (!m.f) {
      p.target = HEAD; if (!close(p, o, 0, 140, 2000) && t < m.go + .35) return;
      m.f = 1; p.vx = 0; const z = muzzle(p), n = 60 + 40 * m.k;
      cone(z[0] + p.face * 30, z[1] - 40, p.face, 300 + 120 * m.k, ZR, .26); sfx.cannon(m.k > .5 ? 2 : 1); sfx.hit(true); shake(24 + 16 * m.k);
      if (!o.ko && Math.abs(o.x - p.x) < 280 && o.state !== 'up') { hit(o, p.face, n, ZR, { kb: 600 + 500 * m.k, lift: 200, stun: 1.2, stop: .16, heavy: 1 }); impact(o.x, mid(o) + 80, 1.3, ZR); V.impact(.1, o.x, mid(o)); label(o.x, o.y + 480 * hs(o), m.k > .9 ? 'HEADBUTT · FULL' : 'HEADBUTT', ZR.core, .9); }
    }
    p.vx = 0; p.target = t < m.go + .6 ? HEAD : POSE.idle; ENDS(p, m, t, m.go + .75);
  } },
  manji: { name: 'Full Course', cd: 14, dur: 2.6, run(p, m, t) {      // hold of them, six into them, and the last one up and out of the top of it
    const o = E.P2;
    p.rate = 50;
    if (!m.g) {
      p.target = POSE.dash; if (!m.c) { m.c = 1; face(p); sfx.whoosh(); }
      if (!close(p, o, 0, 150, 2300) && t < .5) return;
      if (o.ko || Math.abs(o.x - p.x) > 260 || o.state === 'up') { E.endMove(p); return; }
      m.g = t; m.n = 0; p.vx = 0; p.inv = Math.max(p.inv, 1.6); label(p.x, p.y + 470, 'FULL COURSE', ZR.core);
    }
    const u = t - m.g;
    if (can(o)) { o.x = clamp(p.x + p.face * 140, -960, 960); o.vx = 0; Object.assign(o, { state: 'hurt', stun: .5, act: null, tele: 0 }); }
    while (m.n < 6 && u >= .08 + m.n * .12) { m.n++; p.pose = (m.n % 2 ? POSE.hook : POSE.cross).slice(); punch(p, o, 10, { kb: 0, stun: .6, stop: .035 }); }
    if (u >= .95 && !m.up) { m.up = 1; p.pose = POSE.crush.slice(); punch(p, o, 50, { kb: 400, lift: 1300, stun: 1, stop: .22, heavy: 1, ring: 1 }, true); pillar(o.x, 70, .35, ZR); shake(30); }
    p.target = u < .95 ? (m.n % 2 ? POSE.hook : POSE.cross) : u < 1.3 ? SKY : POSE.idle;
    ENDS(p, m, t, m.g + 1.45);
  } }
};
const ZERO_AIR = {
  strikes: { name: 'Hammer Drop', dur: 1, run(p, m, t) {      // both fists down on them out of the air
    const o = E.P2;
    p.rate = 40; face(p);
    if (t < .14) { p.target = HAMMER; p.vy = Math.max(p.vy, 0); return; }
    if (!m.f) { m.f = 1; p.vy = -1800; if (up(o)) p.vx = clamp((o.x - p.x) / .25, -1600, 1600); }
    p.target = POSE.crush;
    if (!m.h && up(o) && Math.abs(o.x - p.x) < 200 && Math.abs(o.y - p.y) < 240) { m.h = 1; punch(p, o, 50, { kb: 200, stun: 1, stop: .16, heavy: 1 }, true); if (can(o) && !o.ground) o.vy = -2400; }
    if (p.ground && t > .2) { if (!m.l) { m.l = 1; p.vx = 0; E.addDust(p.x); shake(12); if (!m.h) cone(p.x + p.face * 60, 40, p.face, 200, ZR, .2); } ENDS(p, m, t, .6); }
    if (t > .95) E.endMove(p);
  } },
  crush: { name: 'Air Combo', dur: 1, run(p, m, t) {      // four up there
    const o = E.P2;
    p.rate = 52; p.vy = Math.max(p.vy, 40); if (!m.c) { m.c = 1; m.n = 0; face(p); }
    close(p, o, 0, 140, 1400);
    while (m.n < 4 && t >= .08 + m.n * .13) { m.n++; p.pose = (m.n % 2 ? POSE.jab : POSE.hook).slice(); punch(p, o, 10, m.n === 4 ? { kb: 900, lift: 200, stun: .8, stop: .08, heavy: 1 } : { kb: 40, lift: 120, stun: .5, stop: .04 }, m.n === 4); }
    p.target = m.n % 2 ? POSE.jab : POSE.hook; if (t > .6) p.vx = 0;
    if (t > .75) E.endMove(p);
  } },
  div: { name: 'Comet Knee', dur: 1.2, run(p, m, t) {      // down at them knee first, with it going off behind him
    const o = E.P2;
    p.rate = 44;
    if (!m.f) { m.f = 1; face(p); const tx = up(o) ? o.x : p.x + p.face * 300; p.vx = clamp((tx - p.x) / .3, -2400, 2400); p.vy = -1700; const z = muzzle(p); beam(z[0], z[1], z[0] - p.face * 500, z[1] + 400, 34, .25, ZR, { bare: true }); sfx.cannon(0); }
    p.target = KNEE;
    if (!m.h && up(o) && Math.abs(o.x - p.x) < 170 && Math.abs(o.y - p.y) < 260) { m.h = 1; hit(o, p.face, 55, ZR, { kb: 800, lift: 500, stun: 1, stop: .16, heavy: 1 }); impact(o.x, mid(o), 1.2, ZR); sfx.hit(true); shake(22); p.vx = -p.face * 300; p.vy = 500; }
    if (p.ground && t > .15) { p.vx = 0; ENDS(p, m, t, .5); }
    if (t > 1.1) E.endMove(p);
  } },
  manji: { name: 'Pile Driver', dur: 1.8, run(p, m, t) {      // hold of them in the air, down with them, and it let go into the floor
    const o = E.P2;
    p.rate = 40;
    if (!m.g) {
      if (!m.c) { m.c = 1; face(p); }
      const d = Math.hypot(o.x - p.x, o.y - p.y);
      if (!o.ko && d < 260 && o.state !== 'up') { m.g = t; p.inv = Math.max(p.inv, 1.2); sfx.hit(true); label(p.x, p.y + 470, 'PILE DRIVER', ZR.core); }
      else { p.vx = up(o) ? clamp((o.x - p.x) * 6, -1800, 1800) : 0; p.target = POSE.dash; if (t > .45) E.endMove(p); return; }
    }
    p.target = HAMMER;
    if (!m.down) { m.down = 1; p.vy = Math.max(p.vy, 600); }
    if (can(o)) { o.x = p.x + p.face * 60; o.y = Math.max(0, p.y + 60); o.vx = 0; o.vy = 0; Object.assign(o, { state: 'air', ground: false }); }
    if (t - m.g > .3 && p.vy > -2600) p.vy = -2600;
    if (m.land === undefined) { if (!p.ground && t - m.g < 1.2) return; m.land = t; burstFx(p.x + p.face * 60, 40, 1, ZR); V.crack(p.x, 320); C.cubes(p.x, 20, 8); sfx.cannon(2); shake(36); if (!o.ko) { if (can(o)) Object.assign(o, { y: 1, vy: 0, ground: false }); hit(o, p.face, 90, ZR, { kb: 600, lift: 700, stun: 1, stop: .24, heavy: 1, ring: 1 }); } }
    ENDS(p, m, t, m.land + .45);
  } }
};
const CHASE = { name: 'Chase Hook', dur: 1, run(p, m, t) {      // 2 again, after the Granite Hook has them up: after them, and another
  const o = E.P2;
  p.rate = 46;
  if (!m.f) { if (!m.x0) { m.x0 = [p.x, p.y]; face(p); sfx.whoosh(); } const u = ease(clamp(t / .15, 0, 1)); p.x = lerp(m.x0[0], clamp(o.x - p.face * 140, -960, 960), u); p.y = lerp(m.x0[1], Math.max(0, o.y - 40), u); p.vx = p.vy = 0; p.target = POSE.dash; if (t < .15) return; m.f = 1; p.pose = POSE.hook.slice(); if (!o.ko) { hit(o, p.face, 45, ZR, { kb: 1300, lift: 400, stun: 1, stop: .16, heavy: 1 }); impact(o.x, mid(o), 1.2, ZR); } const w = fist(p); cone(w[0], w[1], p.face, 360, ZR, .22); sfx.cannon(1); shake(22); label(p.x, p.y + 470, 'CHASE HOOK', ZR.core); }
  p.target = t < .5 ? POSE.hook : POSE.fall; if ((p.ground && t > .3) || t > .9) E.endMove(p);
} };
const TRADE = { name: 'Trade', jp: '交換', cd: 12, guard: 'trade', dur: 1.2 };
const LUNGE = { name: 'Lunge', dur: .55, run(p, m, t) {      // as Zero Range comes in: straight at them with a fist
  const o = E.P2;
  p.rate = 46;
  if (!m.f) { if (!m.c) { m.c = 1; face(p); } p.target = POSE.dash; if (!close(p, o, 0, 150, 2200) && t < .3) return; m.f = 1; p.vx = 0; p.pose = POSE.cross.slice(); punch(p, o, 18, { kb: 600, lift: 200, stun: .6, stop: .06 }); }
  p.vx = 0; p.target = POSE.cross; ENDS(p, m, t, .45);
} };

/* ================= the four, together ================= */
const MODES = [
  { id: 'dir', name: 'Cursed Cannon: Direction Blast', short: 'DIRECTION', jp: '方向', keys: 'RMB + Z', C: D_, moves: DIR, air: DIR_AIR, esp: REDIRECT, sw: TURNABOUT },
  { id: 'max', name: 'Cursed Energy Discharge: MAX', short: 'MAX', jp: '最大', keys: 'T + RMB', C: MX, moves: MAX, air: MAX_AIR, esp: MAXWALL, sw: OVERLOAD },
  { id: 'scatter', name: 'Cursed Energy Discharge: Scatter', short: 'SCATTER', jp: '散弾', keys: 'RMB + X', C: SC, moves: SCAT, air: SCAT_AIR, esp: FLAK, sw: SPRAY },
  { id: 'zero', name: 'Cursed Energy Discharge: Zero Range', short: 'ZERO RANGE', jp: '零距離', keys: 'Y + RMB', C: ZR, moves: ZERO, air: ZERO_AIR, esp: TRADE, sw: LUNGE }
];
let mode = 0;
const waits = MODES.map(() => ({ strikes: 0, crush: 0, div: 0, manji: 0 }));      // each mode's own waits, kept while another is the one in use
const ecds = [0, 0, 0, 0];
let swcd = 0, switchAt = -9, stance = null;       // the switch strike's wait; when it last changed; E, while it is up: { kind, t }
const MOVES = {};
for (const k of SLOTS) Object.defineProperty(MOVES, k, { enumerable: true, get: () => MODES[mode].moves[k] });

/* ---------- E: each mode's own stance; what comes into it decides what happens ---------- */
const STANCE = { name: 'Stance', dur: 1.3, run(p, m, t) {
  p.vx = 0; p.rate = 30;
  if (!m.s) { m.s = 1; stance = { kind: m.kind, t: m.kind === 'wall' ? 1 : .8, m }; if (m.kind === 'flak') flak(p); if (m.kind === 'wall') sfx.cannon(1); }
  if (m.ans === undefined) { p.target = m.kind === 'trade' ? POSE.crushWind : m.kind === 'wall' ? OPEN : PALMS; if (!stance) { E.endMove(p); } return; }
  p.target = t < m.ans + .25 ? RECOIL : POSE.idle; ENDS(p, m, t, m.ans + .45);
} };
function flak(p) {                                  // Scatter's E: a ring of twelve out of him, and nothing gets through it for a moment
  const y = p.y + 190 * SIZE;
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; fire({ x: p.x, y, vx: Math.cos(a) * 1900, vy: Math.sin(a) * 1900, r: 10, dmg: 5, Cc: SC, life: .9, h: { kb: 60, stun: .35, stop: .01 } }); }
  burstFx(p.x, y, .6, SC); sfx.cannon(0); shake(12); p.inv = Math.max(p.inv, .35);
}
const ESPEC = { get name() { return MODES[mode].esp.name; }, get jp() { return MODES[mode].esp.jp; }, get col() { return MODES[mode].C.core; },
  get left() { return ecds[mode]; }, get max() { return MODES[mode].esp.cd; }, nocd() { ecds.fill(0); },
  press(p) {
    if (ecds[mode] > 0) { sfx.back(); return true; }
    if (p.move || p.ps || p.dead || p.dashT > 0) return true;
    const d = MODES[mode].esp;
    ecds[mode] = d.cd; p.move = { def: STANCE, key: 'esp', t: 0, kind: d.guard }; E.hud.mv.esp.classList.add('act');
    JU.tech.tk.shout(p, d.jp, MODES[mode].C.core); sfx.charge();
    return true;
  } };
if (JU.especial) JU.especial.add('tdced', ESPEC);
function answer(p, a, mul) {                        // something has come into his stance
  const o = E.P2, m = p.move, S0 = stance;
  stance = null;
  if (m && m.def === STANCE) m.ans = m.t;
  const shot = !!(a && a.shot);
  if (S0.kind === 'redirect') {                     // back the way it came, as a beam
    const z = muzzle(p), dir = o && !o.ko ? sideOf(p, o) : p.face; p.face = dir; const a2 = at(p, z[0], z[1], o);
    beam(a2.x0, a2.y0, a2.x1, a2.y1, 44, .34, D_); sfx.cannon(1); shake(22); label(p.x, p.y + 470, 'REDIRECT', D_.core);
    if (up(o) && (shot || onLine(o, a2, 44) || Math.abs(o.x - p.x) < 400)) { hit(o, dir, 60, D_, { kb: 1100, lift: 450, stun: 1, stop: .16, heavy: 1 }); impact(o.x, mid(o), 1.2, D_); }
    return true;
  }
  if (S0.kind === 'wall') {                         // MAX Wall: it does not get through, and whatever touched it is thrown off it
    const x = p.x + p.face * 130; burstFx(x, p.y + 190 * SIZE, .7, MX); sfx.blast(); shake(18); label(x, 470, 'WALL', '#ffffff');
    if (!shot && up(o) && Math.abs(o.x - p.x) < 420) hit(o, p.face, 50, MX, { kb: 1300, lift: 400, stun: .9, stop: .14, heavy: 1 });
    stance = { kind: 'wall', t: Math.max(.2, S0.t), m };      // (it stands until its time is up)
    return true;
  }
  if (S0.kind === 'flak') return true;              // (nothing through it while it is up)
  if (S0.kind === 'trade') {                        // Zero Range: he takes it, half of it, and gives back more
    if (shot) return false;
    const d = (a && a.dmg || 8) * (mul || 1) * .5;
    Fi.chip(Math.round(Math.min(d, Math.max(0, p.hp - 1))), ZR.core); p.flash = .1;
    E.after(.06, () => { if (!o.ko && Math.abs(o.x - p.x) < 420) { p.pose = POSE.cross.slice(); const w = fist(p); cone(w[0], w[1], p.face, 420, ZR, .26); hit(o, p.face, 90, ZR, { kb: 1300, lift: 500, stun: 1, stop: .2, heavy: 1 }); impact(o.x, mid(o), 1.4, ZR); sfx.cannon(1); shake(28); label(p.x, p.y + 470, 'TRADE', ZR.core); } });
    return true;
  }
  return false;
}

/* ---------- G: four awakenings, one bar. Whichever mode he is in when it is full is the one that goes ---------- */
let show = null;                                    // full-screen pieces of an awakening: { kind, t0, dur, ... }
let pin = null;                                     // someone held where an awakening wants them
const OMNI = { name: 'Omnidirectional Discharge', dur: 4.2, run(p, m, t) {      // up into the air, and every way at once, three times; then all of it at them
  const o = E.P2, y = p.y + 190 * SIZE;
  p.rate = 30; p.vx = 0; p.inv = Math.max(p.inv, .3);
  if (!m.s) { m.s = 1; m.n = 0; E.banner('全方位', 'OMNIDIRECTIONAL DISCHARGE', 'xs'); sfx.charge(); sfx.rise(1); E.zoomIn(1); face(p); }
  if (t < 3.2) { p.y = lerp(p.y, 260, .08); p.vy = 0; p.ground = false; }
  p.target = t < .5 ? LOWER : t < 3 ? (Math.floor(t / .05) % 2 ? OPEN : PALMS) : SKY;
  while (m.n < 18 && t >= .5 + m.n * .14) {
    const rot = m.n * .19, base = (m.n % 6) * TAU / 96; m.n++;
    let got = false;
    for (let i = 0; i < 16; i++) { const a = ray(p.x, y, 1, base + rot + i * TAU / 16, 1500); beam(a.x0, a.y0, a.x1, a.y1, 18, .16, D_, { bare: true }); if (!got && up(o) && onLine(o, a, 18)) got = true; if (a.floor && i % 4 === 0) V.rocks(a.x1, 0, 1); }
    sfx.zap(); shake(10);
    if (got || (up(o) && Math.abs(o.x - p.x) < 260)) { hit(o, p.face, 12, D_, { kb: 0, stun: .6, stop: .015 }); if (can(o) && !o.ground) o.vy = Math.max(o.vy, 60); }
  }
  if (t >= 3.2 && !m.fin) {
    m.fin = 1; face(p); burstFx(p.x, y, 1.6, D_); sfx.cannon(2); sfx.bf(); shake(50); E.stop(.12); show = { kind: 'flash', t0: E.T, dur: .35, col: '255,255,255' }; manga(p, '全方位', D_.core, 'bw', 'home-gojo-purple-boom');
    for (let i = 0; i < 16; i++) { const tx = o && !o.ko ? o.x : p.x + p.face * 600, ty = o && !o.ko ? mid(o) : 150, a0 = i * TAU / 16, sx = p.x + Math.cos(a0) * 220, sy = y + Math.sin(a0) * 220; beam(sx, sy, tx + (tx - sx) * .4, ty + (ty - sy) * .4, 30, .5, D_, { bare: i > 0 }); }
    if (o && !o.ko) { hit(o, p.face, 184, D_, { kb: 1700, lift: 800, stun: 1.2, stop: .3, heavy: 1, ring: 1 }); V.impact(.2, o.x, mid(o)); C.cubes(o.x, 40, 10); smoke(o.x, 20, 10, 1.4, D_); }
  }
  if (t > 3.3) { p.target = POSE.fall; }
  ENDS(p, m, t, 4);
} };
const CITY = { name: 'City Breaker', dur: 5, run(p, m, t) {      // Granite Blast as big as it goes, the whole of it held on them; and seen from above, going through the city
  const o = E.P2;
  p.rate = 26;
  if (t < 2) {
    p.vx = 0; p.target = AIM; face(p);
    if (!m.s) { m.s = 1; m.n = 0; p.inv = Math.max(p.inv, 4.5); E.banner('都市破壊', 'MAX GRANITE BLAST: CITY BREAKER', 'xs'); sfx.rise(2); sfx.charge(); E.zoomIn(1.6); if (Z) Z.dim(.6, 2.2); }
    const z = muzzle(p); V.mote(z[0], z[1], 'white'); V.mote(z[0], z[1], 'blue'); if (Math.floor(t * 4) !== m.tk) { m.tk = Math.floor(t * 4); shake(6 + t * 8); V.ring(z[0], z[1], 300 - t * 100, '#ffffff', .2); }
    return;
  }
  if (!m.f) {
    m.f = 1; const z = muzzle(p), dx = Math.max(240, ((o.x || 0) - z[0]) * p.face), dy = clamp((o && !o.ko ? mid(o) : 150) - z[1], -.12 * dx, .05 * dx), n = Math.hypot(dx, dy);
    m.ux = p.face * dx / n; m.uy = dy / n; m.f0 = p.face;
    beam(z[0], z[1], z[0] + m.ux * 3000, z[1] + m.uy * 3000, 360, 2.1, MX, { keep: true }); sfx.cannon(2); sfx.roar(2.2); shake(60); V.split(p.face > 0 ? .06 : -.06); clipOf('home-tdc-beam', .8);
    if (!JU.reduceMotion) { show = { kind: 'city', t0: E.T, dur: .7, seed: 1 + (Math.random() * 1e6 | 0) }; E.stop(.7); }
  }
  const u = t - 2;
  if (u < 2) {
    p.target = RECOIL; p.vx = -m.f0 * 140;
    const n = Math.min(20, Math.floor(u / .1) + 1);
    while (m.n < n) {
      m.n++; const gx = clamp(p.x + m.f0 * rnd(200, 1400), -1040, 1040); V.rocks(gx, 0, 2); if (Math.random() < .5) V.crack(gx, rnd(80, 180));
      if (up(o) && (o.x - p.x) * m.f0 > 0) hit(o, m.f0, 30, MX, { kb: 90, stun: .3, stop: .012 });
    }
    return;
  }
  if (!m.end) { m.end = 1; p.vx = 0; if (o && !o.ko) { hit(o, m.f0, 600, MX, { kb: 2200, lift: 800, stun: 1.2, stop: .34, heavy: 1, ring: 1 }); V.impact(.2, o.x, mid(o)); C.cubes(o.x, 40, 12, 1.3); smoke(o.x, 20, 14, 1.6, MX); } sfx.bf(); shake(50); show = { kind: 'flash', t0: E.T, dur: .4, col: '235,245,255' }; manga(p, '都市破壊', '#ffffff', 'bw', 'home-gojo-purple-boom'); }
  p.target = POSE.idle; ENDS(p, m, t, 4.6);
} };
const THOUSAND = { name: 'Thousand Granite', dur: 4.4, run(p, m, t) {      // up, and a hundred of them out of his hair, one after another, at them
  const o = E.P2;
  p.rate = 50; p.vx = 0; p.inv = Math.max(p.inv, .3);
  if (!m.s) { m.s = 1; m.n = 0; E.banner('千発', 'THOUSAND GRANITE', 'xs'); sfx.charge(); face(p); }
  if (t < 3.6) { p.y = lerp(p.y, 200, .06); p.vy = 0; p.ground = false; }
  p.target = t < .4 ? AIM : Math.floor(t / .04) % 2 ? AIM : RECOIL;
  while (m.n < 100 && t >= .4 + m.n * .03) {
    m.n++; face(p); const z = muzzle(p);
    shoot(z[0], z[1], o, 2600, 4, SC, { spread: rnd(-.12, .12), face: p.face, r: 8, h: { kb: 10, stun: .3, stop: .004 } });
    if (m.n % 3 === 0) sfx.zap(); if (m.n % 10 === 0) shake(8);
  }
  if (t >= 3.5 && !m.fin) { m.fin = 1; label(p.x, p.y + 480, 'ONE THOUSAND', SC.core, 1.4); burstFx(p.x, p.y + 190 * SIZE, 1, SC); if (JU.ms && o && !o.ko) JU.ms.ono('ドドドドド', o.x, mid(o) + 300, 1.2, SC.core); }
  if (t > 3.6) p.target = POSE.fall;
  if ((p.ground && t > 3.7) || t > 4.3) E.endMove(p);
} };
// Zero Range's: a meal in three courses, the last of them the one with that name
const COURSE = { name: 'Dessert: Full Course', dur: 9, run(p, m, t) {
  const o = E.P2, f = p.face;
  p.rate = 50;
  if (m.g === undefined) {
    if (!m.s) { m.s = 1; face(p); E.banner('フルコース', 'DESSERT: FULL COURSE', 'xs'); burstFx(p.x - p.face * 60, 100, .7, ZR); sfx.cannon(1); p.inv = Math.max(p.inv, 1.4); }
    const gap = (o.x - p.x) * p.face;
    p.target = POSE.dash; p.vx = gap > 150 ? p.face * 2600 : 0;
    if (Math.random() < .8) V.puff('red', p.x - p.face * 40, p.y + rnd(40, 270), -p.face * 520, 0, 30, .25);
    if (!o.ko && gap > -40 && gap < 200 && o.state !== 'up') { m.g = t; m.n = 0; p.vx = 0; p.inv = Math.max(p.inv, 8); E.root.classList.add('cine'); pin = { o, f, x: clamp(p.x + f * 130, -950, 950) }; if (can(o)) Object.assign(o, { state: 'idle', stun: 0, act: null, vx: 0, vy: 0, tele: 0, y: 0, ground: true }); show = { kind: 'menu', t0: E.T, dur: 1.1, text: 'APPETIZER' }; sfx.hit(true); }
    else if (t > 1) { p.vx = 0; JU.tech.charge(60); E.endMove(p); }
    return;
  }
  const u = t - m.g, cap = n => Math.max(0, Math.min(n, o.hp - 1));      // (nothing before the last course finishes it)
  p.vx = 0;
  if (u < 1.6) {                                    // the first course: a dozen, quick
    while (m.n < 12 && u >= .1 + m.n * .11) { m.n++; p.pose = (m.n % 2 ? POSE.jab : POSE.cross).slice(); const w = fist(p); cone(w[0], w[1], f, 180, ZR, .12); if (!o.ko) hit(o, f, cap(10), ZR, { kb: 0, stun: 2, stop: .03 }); if (can(o)) Object.assign(o, { state: 'idle', stun: 0, act: null }); sfx.hit(false); shake(7); }
    p.target = m.n % 2 ? POSE.jab : POSE.cross; return;
  }
  if (u < 2.5) { if (!m.main) { m.main = 1; show = { kind: 'menu', t0: E.T, dur: .9, text: 'MAIN COURSE' }; p.pose = POSE.hookWind.slice(); } p.target = POSE.hookWind; return; }
  if (!m.sw) { m.sw = 1; p.pose = POSE.hook.slice(); const w = fist(p); cone(w[0], w[1], f, 520, ZR, .3); if (!o.ko) hit(o, f, cap(180), ZR, { kb: 0, stun: 2, stop: .14, heavy: 1 }); if (can(o)) Object.assign(o, { state: 'idle', stun: 0, act: null }); sfx.hit(true); sfx.cannon(1); shake(30); show = { kind: 'flash', t0: E.T, dur: .25, col: '200,16,46' }; }
  if (u < 3.4) { p.target = POSE.hook; return; }
  if (!m.d) { m.d = 1; show = { kind: 'menu', t0: E.T, dur: 1.4, text: 'DESSERT' }; E.stop(1.2); p.pose = POSE.divWind.slice(); sfx.rise(1); }
  if (u < 3.6) { p.target = POSE.divWind; return; }
  if (!m.fin) {
    m.fin = 1; pin = null; E.root.classList.remove('cine'); p.pose = POSE.cross.slice();
    const w = fist(p); cone(w[0], w[1], f, 700, ZR, .4); burstFx(o.x, mid(o), 1.6, ZR); sfx.cannon(2); sfx.bf(); shake(60); E.stop(.15);
    if (!o.ko) { hit(o, f, 700, ZR, { kb: 2600, lift: 800, stun: 1.2, stop: .34, heavy: 1, ring: 1 }); V.impact(.22, o.x, mid(o)); for (let i = 0; i < 6; i++) V.bolt(o.x + rnd(-200, 200), mid(o) + rnd(-160, 200), o.x + rnd(-320, 320), mid(o) + rnd(-200, 260), '#ff2440', .2, 3, '#120306'); }
    show = { kind: 'flash', t0: E.T, dur: .5, col: '255,255,255' }; label(p.x, p.y + 500, 'DESSERT', ZR.core, 1.6); manga(p, 'ドグシャァ', ZR.core, 'red', 'home-nanami-bf');
  }
  p.target = u < 4.1 ? POSE.cross : POSE.idle; ENDS(p, m, t, m.g + 4.4);
} };
const AWK = [OMNI, CITY, THOUSAND, COURSE];
function awaken(p) { p.move = { def: AWK[mode], t: 0 }; }

/* ---------- full-screen pieces ---------- */
function drawShow() {
  const s = show, t = E.T - s.t0, VW = E.VW, VH = E.VH;
  if (t >= s.dur) { show = null; return; }
  const u = t / s.dur;
  if (s.kind === 'flash') { g.fillStyle = `rgba(${s.col},${(1 - u) * .9})`; g.fillRect(0, 0, VW, VH); return; }
  if (s.kind === 'menu') {                          // a course announced, as a menu card would
    const a = u < .15 ? u / .15 : u > .8 ? (1 - u) / .2 : 1, w = VH * .7, h = VH * .16, x = (VW - w) / 2, y = VH * .16;
    g.save(); g.globalAlpha = a; g.fillStyle = '#120306'; g.fillRect(x, y, w, h); g.strokeStyle = ZR.core; g.lineWidth = 4; g.strokeRect(x + 6, y + 6, w - 12, h - 12);
    g.font = `${Math.round(h * .45)}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff3f6'; g.fillText(s.text, VW / 2, y + h / 2);
    g.restore(); return;
  }
  if (s.kind === 'city') {                          // the city from above, and the white of it going through
    let sd = s.seed; const rr = () => (sd = sd * 16807 % 2147483647) / 2147483647;
    g.save(); g.fillStyle = '#5f7fa6'; g.fillRect(0, 0, VW, VH); g.translate(VW / 2, VH / 2); g.rotate(-.5); g.scale(1 + .1 * u, 1 + .1 * u);
    const R = Math.hypot(VW, VH) * .62, cell = VH * .2;
    for (let y = -R; y < R; y += cell) for (let x = -R; x < R; x += cell * 1.5) { const nb = 2 + (rr() * 3 | 0); for (let i = 0; i < nb; i++) { const w = cell * 1.36 / nb - 5, h = cell * (.5 + rr() * .34), bx = x + i * (cell * 1.36 / nb), by = y + rr() * cell * .1, tone = 196 + rr() * 50 | 0; g.fillStyle = `rgb(${tone - 34},${tone - 12},${Math.min(255, tone + 10)})`; g.fillRect(bx, by, w, h); g.fillStyle = 'rgba(40,62,104,.6)'; g.fillRect(bx, by + h, w, cell * .07); } }
    g.rotate(-.4); const len = Math.hypot(VW, VH) * 1.3, wide = VH * .22, x0 = -len / 2, x1 = x0 + len * (1 - (1 - Math.min(1, u / .5)) ** 2), gr = g.createLinearGradient(0, -wide, 0, wide);
    gr.addColorStop(0, 'rgba(110,160,255,0)'); gr.addColorStop(.2, 'rgba(160,200,255,.95)'); gr.addColorStop(.4, '#fff'); gr.addColorStop(.6, '#fff'); gr.addColorStop(.8, 'rgba(160,200,255,.95)'); gr.addColorStop(1, 'rgba(110,160,255,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0, -wide * .7); g.lineTo(x1, -wide); g.quadraticCurveTo(x1 + wide, 0, x1, wide); g.lineTo(x0, wide * .7); g.closePath(); g.fill();
    g.restore();
    const fl = u < .12 ? 1 - u / .12 : u > .82 ? (u - .82) / .18 : 0; if (fl > 0) { g.fillStyle = `rgba(255,255,255,${fl})`; g.fillRect(0, 0, VW, VH); }
  }
}

JU.tech.add('tdced', { name: 'True Direct Cursed Energy Discharge', jp: '真・直接呪力放出', mark: '真', who: 'Granite Cannon, four ways at once', odds: 0, col: '#4fd8ff', glow: 'blue', moves: MOVES,
  awakened: true, secret: true, skin: JU.cast6.ISHIGORI, as: ['Granite Cannon', '砲'], scale: SIZE,
  hint: '<b>Right click</b> next mode · <b>F + RMB</b> previous mode · <b>RMB + Z</b> Direction · <b>T + RMB</b> MAX · <b>RMB + X</b> Scatter · <b>Y + RMB</b> Zero Range · <b>G</b> the mode\'s awakening',
  get awkName() { return AWK[mode].name; }, awkHits: false, awkStart: 0, awaken });      // (the bar says which one G is, in the mode he is in)
const DEF = JU.tech.TECH.tdced, on = () => JU.tech.active === DEF;
JU.awakened.LIST.push({ id: 'tdced', secret: true, name: 'True Direct Cursed Energy Discharge', mark: '真', col: '#4fd8ff',
  what: 'Direct and True Cursed Energy Discharge in one: four modes (Direction Blast, MAX, Scatter, Zero Range), 54 moves, an awakening for each mode. Plays Jane You\'re Early and AIZO while equipped.',
  later: () => (JU.dced.found && JU.dced.tcedOpen() ? 'Both are yours: press to combine them.' : 'Combine Direct Cursed Energy Discharge (a Secret CT) with True Cursed Energy Discharge (Awakened CT).'),
  open: () => dev() || JU.dced.combined, combine: () => !dev() && !JU.dced.combined && JU.dced.found && JU.dced.tcedOpen(), fuse: () => JU.dced.combine() });

/* ---------- switching: right click goes on to the next; with Z, T, X or Y down it goes to that one; with F down (0.22v4), back to the one before ---------- */
const KEYS = { z: 0, t: 1, x: 2, y: 3 };
let rmb = false, cycleAt = 0, tAt = 0, went = false;      // went: right click still down from a press that has gone on to the next already (F then goes back past it)
E.root.addEventListener('pointerdown', e => { if (e.button === 2) rmb = true; });
addEventListener('pointerup', e => { if (e.button === 2) rmb = false; });
addEventListener('blur', () => { rmb = false; });
const altDown = () => rmb || E.keys.has('c');
const backDown = () => E.keys.has('f') || E.keys.has('hold:block');      // (F is Block too: the guard goes up as well, as it would)
function relabel() {
  for (const k of SLOTS) { const d = MODES[mode].moves[k]; E.hud.mv[k].querySelector('b').textContent = d.name; E.CD[k] = d.cd; }
  paintModes(); if (T.refresh) T.refresh();
}
function setMode(i, strike = true) {
  if (!on()) return;
  if (i === mode) { label(E.P1.x, E.P1.y + 480, MODES[i].short, MODES[i].C.core, .6); return; }
  for (const k of SLOTS) waits[mode][k] = E.cd[k];
  mode = i; switchAt = E.T; follow = null;
  for (const k of SLOTS) E.cd[k] = waits[mode][k];
  relabel();
  const p = E.P1, M0 = MODES[mode];
  label(p.x, p.y + 500, M0.short, M0.C.core, 1); sfx.tick(mode % 3); sfx.hover();
  if (Z) Z.flare(p.x, p.y + 190 * SIZE, M0.C.rgb, 300, .2);
  V.ring(p.x, p.y + 190 * SIZE, 200, M0.C.core, .22);
  if (strike && swcd <= 0 && !p.move && !p.ps && !p.dead && p.ground && E.root.dataset.mode === 'fight') { swcd = 4; p.move = { def: M0.sw, key: 'strikes', t: 0 }; }
}
const press0 = H.press;
H.press = (a, inScene) => {
  if (!inScene && on() && !E.P1.dead) {
    const p = E.P1;
    if (a === 'alt') {
      for (const k in KEYS) if (E.keys.has(k)) { tAt = 0; setMode(KEYS[k]); return true; }
      if (backDown()) { cycleAt = 0; tAt = 0; setMode((mode + 3) % 4); return true; }      // F + right click: the one before
      cycleAt = E.T || .001; return true;          // (alone: the next one, a moment from now, in case Z, T, X, Y or F is coming)
    }
    if (a === 'takeover') { if (altDown()) { setMode(1); return true; } tAt = E.T || .001; return true; }      // T: is right click coming
    if (E.root.dataset.mode === 'fight' && SLOTS.includes(a)) {
      if (follow && a === follow.key && E.T < follow.until && follow.mode === mode && (!follow.need || follow.need()) && !p.ps && !p.dead) {
        const d = follow.def; follow = null; if (p.move) E.endMove(p); p.move = { def: d, key: a, t: 0 }; E.hud.mv[a].classList.add('act'); return true;
      }
      if (!p.ground && !p.move && !p.ps && !(p.dashT > 0) && !(E.cd[a] > 0)) { E.cd[a] = E.CD[a]; p.move = { def: MODES[mode].air[a], key: a, t: 0 }; E.hud.mv[a].classList.add('act'); return true; }      // the four in the air
    }
  }
  return press0 ? press0(a, inScene) : false;
};
addEventListener('keydown', e => {                  // Z, T, X, Y or F pressed while right click is held down
  if (!on() || e.repeat || !altDown()) return;
  const k = e.key.toLowerCase();
  if (KEYS[k] !== undefined) { cycleAt = 0; tAt = 0; went = false; setMode(KEYS[k]); }
  else if (k === 'f') { const n = went ? 2 : 1; cycleAt = 0; tAt = 0; went = false; setMode((mode + 4 - n) % 4); }
});

/* ---------- the strip of the four, on his health bar ---------- */
const strip = document.createElement('div'); strip.className = 'tdm';
strip.innerHTML = MODES.map((d, i) => `<i data-i="${i}" style="--c:${d.C.core}"><b>${d.short}</b><u>${d.keys}</u></i>`).join('');
const fb = E.root.querySelector('.fb.p1'); if (fb) fb.appendChild(strip);
function paintModes() { strip.querySelectorAll('i').forEach((el, i) => el.classList.toggle('on', i === mode)); E.root.classList.toggle('tdmon', on()); }

/* ---------- wiring ---------- */
const tick0 = H.tick, fx0 = H.fx, post0 = H.post, guard0 = H.guard, pre0 = H.foePre, hit0 = H.hit, rim0 = H.rim, reset0 = H.reset, start0 = H.fightStart, under0 = H.under;
H.tick = dt => {
  tick0(dt);
  if (!on()) { if (E.root.classList.contains('tdmon')) E.root.classList.remove('tdmon'); return; }
  for (let i = 0; i < 4; i++) { if (ecds[i] > 0) ecds[i] = Math.max(0, ecds[i] - dt); if (i !== mode) for (const k of SLOTS) if (waits[i][k] > 0) waits[i][k] = Math.max(0, waits[i][k] - dt); }
  if (swcd > 0) swcd -= dt;
  if (cycleAt && E.T - cycleAt > .12) { cycleAt = 0; tAt = 0; setMode((mode + 1) % 4); went = altDown(); }
  if (went && !altDown()) went = false;
  if (tAt && E.T - tAt > .35) { tAt = 0; if (press0) press0('takeover', false); }      // no right click came: T is the clan's again
  if (stance && (stance.t -= dt) <= 0) stance = null;
  if (pin && !(E.P1.move && E.P1.move.def === COURSE)) { pin = null; E.root.classList.remove('cine'); }
  if (follow && E.T > follow.until) follow = null;
};
H.guard = (face2, a, mul) => {
  if (guard0 && guard0(face2, a, mul)) return true;
  if (!on() || !stance || E.P1.dead) return false;
  return answer(E.P1, a, mul);
};
H.foePre = (o, p, dt) => {
  if (!pin || pin.o !== o) return pre0 ? pre0(o, p, dt) : false;
  o.vx = 0; o.x = pin.x; o.y = 0; o.face = -pin.f; o.target = POSE.hurt; o.rate = 40;
  return true;
};
H.hit = (o, f2, h) => {                             // the bar fills with the damage he does: about 900 of it
  hit0(o, f2, h);
  const m = E.P1.move;
  if (on() && !(m && AWK.includes(m.def))) JU.tech.charge(h.dmg * (o.dr || 1) * .11);
};
H.under = dt => {                                   // the mode's colour at his feet, under the technique's own
  under0(dt);
  if (!on()) return;
  const p = E.P1, c = F(p.x, p.y + 20), M0 = MODES[mode];
  lit(() => E.glow(E.GLOW[M0.C.img], c[0], c[1], 360 * c[2], .3 + .08 * Math.sin(E.T * 5)));
};
H.fx = dt => {
  fx0(dt);
  if (!on() || E.P1.dead) return;
  const p = E.P1, z = muzzle(p), c = F(z[0], z[1]), k = c[2], M0 = MODES[mode];
  lit(() => { E.glow(E.GLOW[M0.C.img], c[0], c[1], (90 + 14 * Math.sin(E.T * 7)) * k, .8); E.glow(E.GLOW.white, c[0], c[1], 28 * k, .9); });      // never out
  if (stance) {                                     // E, while it is up
    const y = p.y + 190 * SIZE, s = F(p.x + (stance.kind === 'wall' ? p.face * 130 : 0), y), kk = s[2];
    lit(() => { g.strokeStyle = M0.C.core; g.lineWidth = 5 * kk; g.globalAlpha = .6 + .3 * Math.sin(E.T * 24);
      if (stance.kind === 'wall') { g.fillStyle = `rgba(${M0.C.rgb},.25)`; g.fillRect(s[0] - 26 * kk, s[1] - 260 * kk, 52 * kk, 450 * kk); g.strokeRect(s[0] - 26 * kk, s[1] - 260 * kk, 52 * kk, 450 * kk); }
      else { g.beginPath(); g.arc(s[0], s[1], 170 * kk, 0, TAU); g.stroke(); }
      g.globalAlpha = 1; });
  }
};
H.post = dt => { if (post0) post0(dt); if (on() && show) drawShow(); };
H.rim = f => {
  if (f !== E.P1 || !on() || f.dead) return rim0 ? rim0(f) : null;
  const m = f.move, big = m && AWK.includes(m.def);
  return { col: MODES[mode].C.core, blur: big ? 9 + 5 * Math.sin(E.T * 20) : 5 + 1.5 * Math.sin(E.T * 5) };
};
const clear = () => { stance = pin = show = follow = null; cycleAt = tAt = 0; swcd = 0; E.root.classList.remove('cine'); };
H.reset = () => { reset0(); clear(); for (const w of waits) for (const k of SLOTS) w[k] = 0; ecds.fill(0); };
H.fightStart = (cfg, wave) => {
  start0(cfg, wave);
  if (!wave) clear();
  if (on()) { if (!JU.clan.body()) E.P1.scale = SIZE; relabel(); }
  else E.root.classList.remove('tdmon');
};

/* ================= while it is equipped: Jane You're Early, then AIZO, round again =================
   At home both are the user's own: the AIZO they gave us (sounds/home-aizo.mp3, from 8 s in) and myinstants' "Jane youre early" (sounds/home-jane.mp3).
   Online, from myinstants (index.html's WEB): "Jane youre early" (13.7 s) and AIZO's intro, the only AIZO there (6.2 s). Off with the sound */
const HOMEHOST = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const TRACKS = HOMEHOST ? ['home-jane', 'home-aizo'] : ['home-jane', 'home-tdc-aizo'];
sfx.preload(TRACKS);
let track = null, ti = 0, gest = false, retry = 0;
const touched = () => { gest = true; };
addEventListener('pointerdown', touched, true); addEventListener('keydown', touched, true);
const inGame = () => { const el = document.getElementById('game'); return !!(el && el.classList.contains('open')); };
const wanted = () => gest && sfx.on && T.equipped === 'tdced' && (!inGame() || on());
setInterval(() => {
  if (!wanted()) { if (track) { track.stop(.8); track = null; } return; }
  if (track && track.playing) return;
  if (track) {
    if (track.at > .5) { ti++; track = null; }      // it has played to its end: the next one
    else if (Date.now() < track.t0 + 2500) return;   // still starting
    else { track = null; retry = Date.now() + 3000; }      // it would not start (the browser said no): the same one again, in a while
  }
  if (Date.now() < retry) return;
  const t = sfx.song(TRACKS[ti % TRACKS.length], 0, ti ? .4 : 1.2, .42);
  if (t.playing !== undefined) { track = t; track.t0 = Date.now(); }      // (not loaded yet: tried again in a moment)
}, 500);

JU.tdced = { MODES, AWK, SKYPIERCE, FOLLOW, RECLUSTER, CHASE, STANCE, setMode, TRACKS,
  get mode() { return mode; }, get music() { return track ? { playing: track.playing, at: +track.at.toFixed(1), name: TRACKS[ti % TRACKS.length] } : null; },
  get state() { return { mode, stance: stance && stance.kind, follow: follow && follow.def.name, show: show && show.kind, pin: !!pin, swcd: +swcd.toFixed(2), ecds: ecds.map(v => +v.toFixed(1)), waits: waits.map(w => Object.values(w).map(v => +v.toFixed(1))) }; } };
})();
