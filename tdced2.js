/* JUJUTSU UNLIMITEDS — Build 0.22v2: TRUE DIRECT CURSED ENERGY DISCHARGE, fifty variants. The user: "i meant 50 variants not 50 moves. 4 moves
   for each mode + e special + ult but 50 other variants. variants like direction 3 then max 2 to get like a cool direction X scatter variant
   and also like 3+2+4 variants for example more variety".
   A variant is pressed as a run of keys, each within 1.8 seconds of the one before (what the first ones start goes ahead as usual; the last key
   of the run is what turns it into the variant, in place of its own move):
   - 24 FUSIONS: a move in one mode, a switch (right click, or RMB + Z / T + RMB / RMB + X / Y + RMB), then a move in another: two of them for
     every pair of modes, in both orders. They come out in both modes' colours.
   - 24 CHAINS: three keys in one mode, six for each mode (Direction 3, 2, 4 is the user's own example).
   - 2 FULL SPECTRUM: a move in all four modes, one after another.
   And the anime's and the manga's way of showing them: impact frames, focus lines, the sound written into the picture, and real sounds under the
   built ones (myinstants: a beam shot, a big explosion; and the game's own clips of Hollow Purple's blast, a heavy punch and a Black Flash).
   The names and the numbers are ours */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, C = JU.cut, Z = JU.bossfx, T = JU.tech, ms = JU.ms, TD = JU.tdced;
const DK = JU.dced.kit, { COL, beam, onLine, impact, burstFx, cone, pillar, smoke, fire, floorWave, hit, can, hs, mid, label, muzzle, AIM, RECOIL, PALMS, LOWER, SIZE } = DK;
const up = o => !!o && !o.ko && !(o.alpha < 1);      // (a variant is what a run of keys pays off with: it lands on them down on the floor, or getting up, too)
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2, SLOTS = T.SLOTS;
const play = ms.play, shake = v => { if (!JU.reduceMotion) cam.shake = Math.max(cam.shake, v); };
sfx.preload(['home-tdc-shoot', 'home-tdc-charge', 'home-tdc-beam', 'home-tdc-boom', 'home-tdc-sweep', 'home-gojo-purple-boom', 'home-love-slam', 'home-nanami-bf']);
const IDS = TD.MODES.map(m => m.id), [CY, MX, SC, ZR] = [COL.cyan, COL.max, COL.teal, COL.red];
const K = { 1: 'strikes', 2: 'crush', 3: 'div', 4: 'manji' };
const SKYP = [-.42, -.36, 2.9, 2.7, .4, -.56, 0], OPENP = [-.2, -.14, 1.9, -1.2, .46, -.46, 0], HEADP = [.7, .5, .3, -.4, .7, -.6, 0], SUPLEX = [-.6, -.4, 2.8, 2.6, .3, -.5, 0];

/* ================= the pieces every variant is made of ================= */
const face = (p, o) => (o && !o.ko ? (o.x >= p.x ? 1 : -1) : p.face);
const at = o => (o && !o.ko ? [o.x, mid(o)] : [E.P1.x + E.P1.face * 600, 170]);
// a beam from (x0, y0) on through (x1, y1) to whatever stops it; n: what it does to them if it goes through them
function ray(p, x0, y0, x1, y1, w, n, Cc, h = {}, life = .32) {
  const L = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / L, uy = (y1 - y0) / L, far = uy < -.01 ? Math.min(1900, y0 / -uy) : 1900;
  const a = { x0, y0, x1: x0 + ux * far, y1: Math.max(0, y0 + uy * far) };
  beam(a.x0, a.y0, a.x1, a.y1, w, life, Cc, { bare: !!h.bare, quiet: !!h.quiet });
  if (a.y1 < 2) { V.crack(a.x1, 100 + w); V.rocks(a.x1, 0, 4); }
  const o = E.P2;
  if (n && up(o) && onLine(o, a, w)) { hit(o, face(p, o), n, Cc, Object.assign({ kb: 120, stun: .5, stop: .04 }, h)); impact(o.x, mid(o), .7, Cc); return true; }
  return false;
}
const fromHair = (p, n, Cc, w = 34, h = {}, dy = 0) => { const z = muzzle(p), [tx, ty] = at(E.P2); return ray(p, z[0], z[1], tx, ty + dy, w, n, Cc, h); };
function sky(x, n, Cc, w = 60, h = {}) {            // straight down out of the sky onto x
  beam(x + rnd(-50, 50), 1500, x, 0, w, .3, Cc, { keep: true, quiet: w < 110 }); V.crack(x, 120 + w); smoke(x, 20, 3, .8, Cc);
  const o = E.P2;
  if (up(o) && Math.abs(o.x - x) < 60 + w * .8) { hit(o, o.x >= x ? 1 : -1, n, Cc, Object.assign({ kb: 60, stun: .5, stop: .03 }, h)); impact(o.x, mid(o), .7, Cc); return true; }
  return false;
}
function boom(x, y, s, n, r, Cc, h = {}) {          // a burst at (x, y)
  burstFx(x, y, s, Cc); shake(14 + s * 14);
  const o = E.P2;
  if (n && up(o) && Math.hypot(o.x - x, mid(o) - y) < r) { hit(o, o.x >= x ? 1 : -1, n, Cc, Object.assign({ kb: 800, lift: 420, stun: .8, stop: .12, heavy: 1 }, h)); return true; }
  return false;
}
function shotAt(x, y, v, n, Cc, more = {}) {        // one shot, from (x, y) at them
  const [tx, ty] = at(E.P2), a = Math.atan2(ty - y + rnd(-30, 30), tx - x) + (more.spread || 0);
  fire(Object.assign({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 10, dmg: n, Cc, h: { kb: 30, stun: .3, stop: .01 } }, more));
}
function punch(p, n, Cc, big, h = {}) {             // a fist, and it let go out of it as it lands
  const o = E.P2, w = DK.palm(p);
  cone(w[0], w[1], p.face, big ? 420 : 240, Cc, big ? .26 : .16);
  if (big) play('home-love-slam', .75, () => sfx.hit(true)); else sfx.hit(false);
  if (o && !o.ko && Math.abs(o.x - p.x) < 320 && Math.abs(o.y - p.y) < 300 && o.state !== 'up') { hit(o, p.face, n, Cc, Object.assign(big ? { kb: 900, lift: 400, stun: .9, stop: .12, heavy: 1 } : { kb: 60, stun: .5, stop: .04 }, h)); impact(o.x, mid(o), big ? 1.1 : .5, Cc); return true; }
  return false;
}
function closeIn(p, gap = 150) {                    // there, next to them, in a moment (a blur where he was)
  const o = E.P2;
  if (!o || o.ko) return;
  const f = o.x >= p.x ? 1 : -1, x = clamp(o.x - f * gap, -960, 960);
  if (Math.abs(x - p.x) > 40) { V.puff('white', p.x, p.y + 150, 0, 0, 80, .25); E.addDust(p.x); }
  p.x = x; p.face = f;
  if (o.y > 60) { p.y = Math.max(0, o.y - 30); p.vy = 0; p.ground = false; }      // (up there with them, if that is where they are)
}
const hold = (o, t = .6) => { if (can(o) && !o.ko) Object.assign(o, { state: 'hurt', stun: Math.max(o.stun || 0, t), act: null, tele: 0, vx: 0 }); };
const liftUp = (o, vy = 1200) => { if (can(o) && !o.ko) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 1), vy, vx: 0 }); };
const spike = o => { if (can(o) && !o.ko && !o.ground) o.vy = -2400; };
function big(p, word, col, kind = 'bw', snd = 'home-tdc-boom') { const o = E.P2; ms.bigHit(p, o, word, col, kind); if (snd) play(snd, .85); }
const fused = (a, b) => { const o = E.P2; if (o && !o.ko) { V.ring(o.x, mid(o), 220, a.core, .25); V.ring(o.x, mid(o), 300, b.core, .32); } };      // the two colours meeting on them

/* ================= the fifty ================= */
const LIST = [];
// v(name, keys, dur, steps, o): keys like 'dir3 max2' or 'zero1 zero3 zero4'
function v(name, keys, dur, steps, o = {}) {
  const seq = keys.split(' ').map(s => [s.replace(/\d$/, ''), K[s.slice(-1)]]);
  const def = ms.script(name, dur, steps, Object.assign({ rate: 44 }, o));
  def.combo = 1; def.glow = 'blue';
  LIST.push({ seq, def, name, keys });
}
// ---- Direction x MAX ----
v('Ricochet Downpour', 'dir3 max2', 1.4, [
  [.05, p => { play('home-tdc-sweep', .7); const [tx] = at(E.P2), z = muzzle(p); for (const s of [-1, 1, 0]) ray(p, z[0], z[1], tx + s * 260, 0, 24, 0, CY, { bare: true, quiet: true }); }],
  [.18, p => { const [tx, ty] = at(E.P2); for (const s of [-1, 1]) ray(p, tx + s * 260, 0, tx, ty, 26, 12, CY, { bare: true }); }],
  [.3, p => { const [tx, ty] = at(E.P2); ray(p, tx, 0, tx, ty + 200, 26, 12, CY, { bare: true }); }],
  [.55, p => { const [tx, ty] = at(E.P2); ray(p, tx - 260, 1500, tx, ty, 90, 20, MX, { stun: .6 }); }], [.7, p => { const [tx, ty] = at(E.P2); ray(p, tx + 260, 1500, tx, ty, 90, 20, MX, { stun: .6 }); }],
  [.85, p => { const [tx] = at(E.P2); sky(tx, 20, MX, 130, { kb: 300, lift: 500, stun: .8, heavy: 1 }); big(p, 'ドドド', MX.core); fused(CY, MX); }]
], { poses: [[0, SKYP], [.9, 'idle']] });
v('Pinpoint Overload', 'dir1 max1', 1.2, [
  [.05, p => { fromHair(p, 20, CY, 16, { stun: .9 }); const o = E.P2; if (o && !o.ko) V.ring(o.x, mid(o), 120, CY.core, .5); label(p.x, p.y + 480, 'LOCKED ON', CY.core, .7); play('home-tdc-charge', .6); }],
  [.5, p => { fromHair(p, 90, MX, 180, { kb: 1500, lift: 520, stun: 1, stop: .22, heavy: 1, ring: 1 }); big(p, 'ドォン', MX.core, 'bw', null); fused(CY, MX); }]
], { poses: [[0, AIM], [.5, RECOIL], [.9, 'idle']] });
// ---- Direction x Scatter ----
v('Crossfire Shrapnel', 'dir2 scatter1', 1.1, [
  [.05, p => { const [tx, ty] = at(E.P2); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; ray(p, tx + Math.cos(a) * 900, Math.max(8, ty + Math.sin(a) * 900), tx, ty, 24, 8, CY, { bare: true, quiet: true, kb: 0 }); } sfx.cannon(0); }],
  [.3, p => { const [tx, ty] = at(E.P2); boom(tx, ty, .6, 0, 0, SC); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; fire({ x: tx + Math.cos(a) * 160, y: ty + Math.sin(a) * 160, vx: -Math.cos(a) * 700, vy: -Math.sin(a) * 700, r: 9, dmg: 5, Cc: SC, life: .5, h: { kb: 20, stun: .4, stop: .01 } }); } fused(CY, SC); }]
], { poses: [[0, SKYP], [.3, OPENP], [.8, 'idle']] });
v('Compass Cluster', 'dir4 scatter3', 1.6, [
  [.05, p => { const y = p.y + 190 * SIZE; for (let i = 0; i < 8; i++) { const a = .2 + i / 7 * 1.2; fire({ x: p.x, y, vx: Math.cos(a) * 900 * p.face, vy: Math.sin(a) * 900, r: 18, dmg: 9, Cc: SC, orb: true, home: 8, homeAfter: .15, life: 1.8, h: { kb: 60, stun: .5, stop: .03 } }); } burstFx(p.x, y, .7, CY); sfx.cannon(1); }],      // (all of them up and out first: the floor would take the ones fired down)
  [.9, p => { fused(CY, SC); }]
], { poses: [[0, LOWER], [.1, OPENP], [1.2, 'idle']] });
// ---- Direction x Zero Range ----
v('Redirect Hook', 'dir1 zero2', 1.1, [
  [.05, p => { fromHair(p, 25, CY, 30, { kb: 0, stun: 1.2 }); }],
  [.1, .35, (p, o, m, u) => { if (!o || o.ko) return; const f = face(p, o); p.x = lerp(p.x, clamp(o.x - f * 140, -960, 960), u * .6); p.face = f; V.puff('red', p.x - f * 40, p.y + rnd(60, 260), -f * 400, 0, 30, .2); }],
  [.36, p => { p.pose = POSE.hook.slice(); if (punch(p, 55, ZR, true, { kb: 1200, lift: 800 })) big(p, 'ドガッ', ZR.core, 'red', null); fused(CY, ZR); }]
], { poses: [[0, AIM], [.1, 'dash'], [.36, 'hook'], [.8, 'idle']] });
v('Ricochet Rush', 'dir3 zero1', 1.3, [
  [.05, p => { sfx.cannon(0); label(p.x, p.y + 480, 'RICOCHET RUSH', ZR.core, .8); }],
  ...[0, 1, 2].map(i => [.1 + i * .3, p => { const o = E.P2; if (!o || o.ko) return; const side = i % 2 ? 1 : -1; p.x = clamp(o.x + side * 170, -960, 960); p.face = -side; V.ring(p.x, p.y + 150, 140, CY.core, .2); punch(p, 22, i === 2 ? ZR : CY, i === 2, i === 2 ? { kb: 1000, lift: 500 } : { kb: 0, stun: .7 }); ms.focus(o.x, mid(o), .25); }])
], { poses: [[0, 'dash'], [.1, 'cross'], [.4, 'hook'], [.7, 'crush'], [1.1, 'idle']], inv: true });
// ---- MAX x Direction ----
v('MAX Cross', 'max1 dir2', 1.3, [
  [.05, () => play('home-tdc-charge', .7)],
  [.4, p => { const [tx, ty] = at(E.P2); ray(p, tx - 900, ty + 700, tx, ty, 120, 55, MX, { kb: 300, stun: 1, stop: .14, heavy: 1 }); }],
  [.55, p => { const [tx, ty] = at(E.P2); ray(p, tx + 900, ty + 700, tx, ty, 120, 55, MX, { kb: 900, lift: 500, stun: 1, stop: .2, heavy: 1, ring: 1 }); big(p, 'ドォン', MX.core); fused(MX, CY); }]
], { poses: [[0, SKYP], [.6, OPENP], [1, 'idle']] });
v('Repulse Compass', 'max3 dir4', 1.5, [
  [.05, p => { boom(p.x, p.y + 190 * SIZE, 1, 30, 560, MX, { kb: 150, lift: 0, stun: 1.2 }); }],      // (held where they are, for the beams coming back)
  ...Array.from({ length: 8 }, (_, i) => [.35 + i * .05, p => { const y = p.y + 190 * SIZE, a = i / 8 * TAU, x1 = p.x + Math.cos(a) * 700, y1 = Math.max(20, y + Math.sin(a) * 700), [tx, ty] = at(E.P2); beam(p.x, y, x1, y1, 18, .18, CY, { bare: true }); ray(p, x1, y1, tx, ty, 20, 10, CY, { bare: true, quiet: true, kb: 30 }); }]),
  [.85, p => { fused(MX, CY); ms.focus(E.P2.x, mid(E.P2), .3); }]
], { poses: [[0, OPENP], [1.2, 'idle']] });
// ---- MAX x Scatter ----
v('Downpour Gatling', 'max2 scatter2', 1.6, [
  [.05, p => { const z = muzzle(p); beam(z[0], z[1], z[0] + p.face * 120, 1400, 30, .3, MX); sfx.cannon(1); }],
  [.3, 1.4, (p, o, m) => { const k = Math.floor((m.t - .3) / .045); if (k === m.k) return; m.k = k; const [tx] = at(E.P2); fire({ x: tx + rnd(-60, 60), y: 1300, vx: rnd(-30, 30), vy: -2800, r: 9, dmg: 5, Cc: SC, h: { kb: 10, stun: .35, stop: .008 } }); if (k % 3 === 0) sfx.zap(); }],
  [1.4, () => fused(MX, SC)]
], { poses: [[0, SKYP], [1.4, 'idle']] });
v('Uppercut Fireworks', 'max4 scatter4', 1.6, [
  [.1, p => { const o = E.P2, x = o && !o.ko ? o.x : p.x + p.face * 300; pillar(x, 120, .45, MX); if (up(o) && Math.abs(o.x - x) < 160) { hit(o, p.face, 60, MX, { kb: 0, lift: 1300, stun: 1, stop: .14, heavy: 1 }); } }],
  [.6, p => { const o = E.P2; if (!o || o.ko) return; const y = mid(o); boom(o.x, y, .8, 0, 0, SC); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; fire({ x: o.x + Math.cos(a) * 200, y: y + Math.sin(a) * 200, vx: -Math.cos(a) * 600, vy: -Math.sin(a) * 600, r: 9, dmg: 6, Cc: SC, life: .6, h: { kb: 10, stun: .4, stop: .01 } }); } ms.ono('パァン', o.x, y + 300, 1, SC.core); fused(MX, SC); }]
], { poses: [[0, LOWER], [.1, SKYP], [1.2, 'idle']] });
// ---- MAX x Zero Range ----
v('Repulse Course', 'max3 zero4', 1.8, [
  [.05, p => { boom(p.x, p.y + 190 * SIZE, 1, 50, 560, MX, { kb: 300, lift: 0, stun: 1.2 }); }],
  [.3, p => closeIn(p, 140)],
  ...Array.from({ length: 5 }, (_, i) => [.35 + i * .15, p => { p.pose = (i % 2 ? POSE.hook : POSE.cross).slice(); hold(E.P2, .5); punch(p, 12, i === 4 ? ZR : MX, i === 4, i === 4 ? { kb: 1300, lift: 600 } : { kb: 0, stun: .6 }); if (i === 4) { big(p, 'ドガガッ', ZR.core, 'red', null); fused(MX, ZR); } }])
], { poses: [[0, OPENP], [.3, 'cross'], [1.4, 'idle']] });
v('MAX Headbutt', 'max1 zero3', 1.2, [
  [.05, p => { play('home-tdc-charge', .7); }],
  [.25, p => closeIn(p, 130)],
  [.3, p => { p.pose = HEADP.slice(); const z = muzzle(p); ray(p, z[0], z[1], z[0] + p.face * 900, z[1] - 40, 160, 120, MX, { kb: 1600, lift: 600, stun: 1, stop: .24, heavy: 1, ring: 1 }); big(p, 'ドォォン', MX.core); fused(MX, ZR); }]
], { poses: [[0, 'crushWind'], [.3, HEADP], [.8, 'idle']] });
// ---- Scatter x Direction ----
v('Scatter Ricochet', 'scatter1 dir3', 1.3, [
  [.05, p => { const z = muzzle(p); for (let i = 0; i < 7; i++) shotAt(z[0], z[1], 2300, 6, SC, { spread: (i - 3) * .08 * p.face, r: 9 }); sfx.cannon(0); }],
  [.5, p => { const [tx, ty] = at(E.P2); for (let i = 0; i < 7; i++) { const x0 = tx + (i - 3) * 140, y0 = i % 2 ? 0 : 900; ray(p, x0, y0, tx, ty, 14, 4, CY, { bare: true, quiet: true, kb: 10 }); } sfx.zap(); fused(SC, CY); }]
], { poses: [[0, AIM], [.1, RECOIL], [1, 'idle']] });
v('Detonator', 'scatter3 dir1', 1.3, [
  [.05, p => { const w = DK.palm(p); fire({ x: w[0], y: w[1], vx: p.face * 1100, vy: 0, r: 30, dmg: 0, Cc: SC, orb: true, life: 1, h: { kb: 0, stun: .5 }, tag: 'det', home: 3, pierce: true }); sfx.cannon(0); }],
  [.45, p => { const orb = DK.shots.find(s => s.tag === 'det'); if (!orb) return; const z = muzzle(p); beam(z[0], z[1], orb.x, orb.y, 30, .25, CY); const i = DK.shots.indexOf(orb); DK.shots.splice(i, 1);
    boom(orb.x, orb.y, 1.4, 80, 380, SC, { kb: 1300, lift: 600, stun: 1, stop: .2, heavy: 1, ring: 1 }); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; fire({ x: orb.x, y: orb.y, vx: Math.cos(a) * 900, vy: Math.sin(a) * 900 + 300, r: 9, dmg: 5, Cc: SC, grav: 1500, life: 1, h: { kb: 30, stun: .3, stop: .01 } }); } big(p, 'ドカァン', SC.core); fused(SC, CY); }]
], { poses: [[0, PALMS], [.4, AIM], [.5, RECOIL], [1, 'idle']] });
// ---- Scatter x MAX ----
v('Overflow Stream', 'scatter2 max3', 1.5, [
  [.05, .85, (p, o, m) => { const k = Math.floor(m.t / .05); if (k === m.k) return; m.k = k; const z = muzzle(p); shotAt(z[0], z[1], 2600, 3, SC, { spread: rnd(-.04, .04), r: 8, h: { kb: 10, stun: .3, stop: .006 } }); if (k % 2) sfx.zap(); }],
  [.9, p => { const o = E.P2; if (!o || o.ko) return; boom(o.x, mid(o), 1.3, 80, 300, MX, { kb: 1400, lift: 600, stun: 1, stop: .2, heavy: 1, ring: 1 }); big(p, 'ドォン', MX.core, 'bw', null); fused(SC, MX); }]
], { poses: [[0, AIM], [.9, OPENP], [1.2, 'idle']] });
v('Storm Front', 'scatter4 max2', 1.7, [
  ...Array.from({ length: 12 }, (_, i) => [.1 + i * .1, p => { const [tx] = at(E.P2); sky(tx + (i % 2 ? 1 : -1) * rnd(0, 90), 10, i % 3 ? MX : SC, 70); if (i === 11) fused(SC, MX); }])
], { poses: [[0, SKYP], [1.4, 'idle']] });
// ---- Scatter x Zero Range ----
v('Buckshot Jabs', 'scatter1 zero1', 1.1, [
  [.02, p => closeIn(p, 150)],
  ...[0, 1, 2].map(i => [.08 + i * .2, p => { p.pose = (i % 2 ? POSE.cross : POSE.jab).slice(); punch(p, 10, ZR, i === 2, i === 2 ? { kb: 900, lift: 300 } : { kb: 0, stun: .5 }); const w = DK.palm(p); for (let k = 0; k < 3; k++) shotAt(w[0], w[1], 2400, 4, SC, { spread: (k - 1) * .12 * p.face, r: 8 }); if (i === 2) fused(SC, ZR); }])
], { poses: [[0, 'jab'], [.8, 'idle']] });
v('Orb Hook', 'scatter3 zero2', 1.3, [
  [.05, p => { const w = DK.palm(p); fire({ x: w[0] + p.face * 60, y: w[1] + 80, vx: p.face * 120, vy: 300, r: 30, dmg: 0, Cc: SC, orb: true, life: 1.2, grav: 800, h: {}, tag: 'ball' }); }],
  [.4, p => { const ball = DK.shots.find(s => s.tag === 'ball'); if (ball) DK.shots.splice(DK.shots.indexOf(ball), 1); p.pose = POSE.hook.slice(); const w = DK.palm(p), o = E.P2; cone(w[0], w[1], p.face, 300, ZR, .2); play('home-love-slam', .8);
    fire({ x: w[0], y: w[1], vx: (o && !o.ko ? Math.sign(o.x - w[0]) || p.face : p.face) * 3200, vy: o && !o.ko ? (mid(o) - w[1]) * 3 : 0, r: 30, dmg: 70, Cc: SC, orb: true, h: { kb: 1500, lift: 500, stun: 1, stop: .2, heavy: 1, ring: 1 }, split: s => { for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; fire({ x: s.x, y: s.y, vx: Math.cos(a) * 800, vy: Math.sin(a) * 800 + 200, r: 9, dmg: 5, Cc: SC, grav: 1500, life: 1, h: { kb: 20, stun: .3, stop: .01 } }); } ms.ono('カキーン', s.x, s.y + 220, 1, SC.core); fused(SC, ZR); } }); }]
], { poses: [[0, PALMS], [.3, 'hookWind'], [.4, 'hook'], [1, 'idle']] });
// ---- Zero Range x Direction ----
v('Hook Shot', 'zero2 dir1', 1.3, [
  [.02, p => closeIn(p, 150)],
  [.08, p => { p.pose = POSE.hook.slice(); punch(p, 55, ZR, true, { kb: 300, lift: 1300 }); }],
  [.6, p => { const o = E.P2; fromHair(p, 45, CY, 50, { kb: 900, lift: 400, stun: 1, stop: .16, heavy: 1 }); if (o && !o.ko) ms.focus(o.x, mid(o), .3); fused(ZR, CY); }]
], { poses: [[0, 'hook'], [.5, SKYP], [1, 'idle']] });
v('Headbutt Compass', 'zero3 dir4', 1.6, [
  [.02, p => closeIn(p, 130)],
  [.08, p => { p.pose = HEADP.slice(); punch(p, 60, ZR, true, { kb: 200, lift: 0, stun: 1.4 }); ms.ono('ゴッ', E.P2.x, mid(E.P2) + 260, 1, ZR.core); }],
  ...Array.from({ length: 8 }, (_, i) => [.4 + i * .08, p => { const z = muzzle(p), a = i / 8 * TAU, r = { x0: z[0], y0: z[1], x1: z[0] + Math.cos(a) * 1300, y1: Math.max(0, z[1] + Math.sin(a) * 1300) }; beam(r.x0, r.y0, r.x1, r.y1, 22, .2, CY, { bare: true }); const o = E.P2; if (up(o) && (onLine(o, r, 22) || Math.abs(o.x - p.x) < 200)) hit(o, p.face, 6, CY, { kb: 20, stun: .5, stop: .02 }); if (i === 7) fused(ZR, CY); }])
], { poses: [[0, HEADP], [.4, OPENP], [1.2, 'idle']] });
// ---- Zero Range x MAX ----
v('MAX Dessert', 'zero4 max4', 2, [
  [.02, p => closeIn(p, 140)],
  ...Array.from({ length: 6 }, (_, i) => [.06 + i * .11, p => { hold(E.P2, .5); p.pose = (i % 2 ? POSE.hook : POSE.cross).slice(); punch(p, 10, ZR, false, { kb: 0, stun: .6 }); }]),
  [.9, p => { p.pose = SKYP.slice(); const o = E.P2, x = o && !o.ko ? o.x : p.x + p.face * 140; pillar(x, 160, .5, MX); if (up(o) && Math.abs(o.x - x) < 200) hit(o, p.face, 100, MX, { kb: 200, lift: 1500, stun: 1, stop: .26, heavy: 1, ring: 1 }); big(p, 'ドォォン', MX.core, 'red', 'home-gojo-purple-boom'); fused(ZR, MX); }]
], { poses: [[0, 'cross'], [.9, SKYP], [1.6, 'idle']] });
v('Jab Cannon', 'zero1 max1', 1.5, [
  [.02, p => closeIn(p, 150)],
  ...[0, 1, 2].map(i => [.06 + i * .13, p => { p.pose = (i % 2 ? POSE.cross : POSE.jab).slice(); punch(p, 14, ZR, false, { kb: 0, stun: .7 }); }]),
  [.5, p => play('home-tdc-charge', .6)],
  [.7, p => { p.pose = POSE.jab.slice(); const w = DK.palm(p); ray(p, w[0], w[1], w[0] + p.face * 900, w[1], 150, 90, MX, { kb: 1500, lift: 500, stun: 1, stop: .22, heavy: 1, ring: 1 }); big(p, 'ドォン', MX.core); fused(ZR, MX); }]
], { poses: [[0, 'jab'], [.7, 'jab'], [1.2, 'idle']] });
// ---- Zero Range x Scatter ----
v('Hook Storm', 'zero2 scatter4', 1.8, [
  [.02, p => closeIn(p, 150)],
  [.08, p => { p.pose = POSE.hook.slice(); punch(p, 55, ZR, true, { kb: 100, lift: 1400 }); }],
  [.4, 1.3, (p, o, m) => { const k = Math.floor((m.t - .4) / .075); if (k === m.k || !o || o.ko) return; m.k = k; const down = k % 2; fire({ x: o.x + rnd(-60, 60), y: down ? 1300 : 0, vx: 0, vy: down ? -2600 : 2600, r: 9, dmg: 5, Cc: SC, h: { kb: 0, stun: .4, stop: .006 } }); if (k % 2) sfx.zap(); if (k === 11) fused(ZR, SC); }]
], { poses: [[0, 'hook'], [.4, SKYP], [1.4, 'idle']] });
v('Headbutt Gatling', 'zero3 scatter2', 1.5, [
  [.02, p => closeIn(p, 130)],
  [.08, p => { p.pose = HEADP.slice(); punch(p, 60, ZR, true, { kb: 100, lift: 0, stun: 1.4 }); }],
  [.35, 1.15, (p, o, m) => { const k = Math.floor((m.t - .35) / .065); if (k === m.k) return; m.k = k; const z = muzzle(p); shotAt(z[0], z[1], 2600, 4, SC, { spread: rnd(-.03, .03), r: 8, h: { kb: 0, stun: .4, stop: .006 } }); if (k % 2) sfx.zap(); if (k === 11) fused(ZR, SC); }]
], { poses: [[0, HEADP], [.35, AIM], [1.2, 'idle']] });

// ---- Direction chains ----
v('Prism Line', 'dir1 dir2 dir3', 1.3, [
  ...[0, 1, 2].map(i => [.05 + i * .15, p => { const [tx, ty] = at(E.P2), a = -Math.PI / 2 + i * TAU / 3, R = 700; ray(p, tx + Math.cos(a) * R, Math.max(8, ty + Math.sin(a) * R), tx, ty, 26, 20, CY, { bare: true, kb: 0, stun: .7 }); }]),
  [.6, p => { const [tx, ty] = at(E.P2); boom(tx, ty, 1, 40, 280, CY); ms.ono('キィン', tx, ty + 280, 1, CY.core); }]
], { poses: [[0, SKYP], [.6, OPENP], [1, 'idle']] });
v('Ricochet Cross Rose', 'dir3 dir2 dir4', 1.8, [
  ...[0, 1, 2, 3].map(i => [.05 + i * .08, p => { const [tx, ty] = at(E.P2), a = i * Math.PI / 2; ray(p, tx + Math.cos(a) * 800, Math.max(8, ty + Math.sin(a) * 800), tx, ty, 24, 10, CY, { bare: true, quiet: true, kb: 0, stun: .6 }); }]),
  [.4, 1.2, (p, o, m, u) => { const k = Math.floor(u * 10); if (k === m.k) return; m.k = k; const [tx, ty] = at(E.P2), a = u * TAU * 1.5; for (const s of [0, Math.PI]) beam(tx + Math.cos(a + s) * 500, ty + Math.sin(a + s) * 500, tx, ty, 18, .14, CY, { bare: true, quiet: true }); if (k % 5 === 0 && up(o)) hit(o, p.face, 10, CY, { kb: 0, stun: .5, stop: .02 }); }],
  [1.25, p => { const [tx, ty] = at(E.P2); boom(tx, ty, 1.2, 50, 300, CY); }]
], { poses: [[0, OPENP], [1.3, 'idle']] });
v('Star Map', 'dir2 dir1 dir4', 1.4, [
  ...[0, 1, 2, 3, 4].map(i => [.05 + i * .1, p => { const [tx, ty] = at(E.P2), a = -Math.PI / 2 + i * TAU / 5, R = 650; ray(p, tx + Math.cos(a) * R, Math.max(8, ty + Math.sin(a) * R), tx, ty, 22, 16, CY, { bare: true, quiet: i > 0, kb: 0, stun: .6 }); }]),
  [.65, p => { const [tx, ty] = at(E.P2); boom(tx, ty, 1, 30, 260, CY); ms.focus(tx, ty, .35); }]
], { poses: [[0, SKYP], [1, 'idle']] });
v('Lighthouse', 'dir4 dir3 dir1', 2.1, [
  [.05, () => play('home-tdc-sweep', .8)],
  [.1, 1.6, (p, o, m, u) => { const z = muzzle(p), [tx, ty] = at(o), base = Math.atan2(ty - z[1], tx - z[0]), a = base + Math.sin(u * Math.PI * 10) * .55, r = { x0: z[0], y0: z[1], x1: z[0] + Math.cos(a) * 1500, y1: Math.max(0, z[1] + Math.sin(a) * 1500) }; beam(r.x0, r.y0, r.x1, r.y1, 30, .06, CY, { bare: true, quiet: true }); if (up(o) && onLine(o, r, 30) && E.T - (m.lh || 0) > .14) { m.lh = E.T; hit(o, p.face, 9, CY, { kb: 0, stun: .6, stop: .02 }); } }],      // (swung back and forth across them, ten times)
  [1.65, p => { fromHair(p, 30, CY, 60, { kb: 1100, lift: 500, stun: 1, stop: .16, heavy: 1 }); }]
], { poses: [[0, OPENP], [1.65, RECOIL], [1.9, 'idle']] });
v('Mirror Maze', 'dir1 dir3 dir2', 1.4, [
  [.05, 1, (p, o, m, u) => { const k = Math.floor(u * 6); if (k === m.k) return; m.k = k; const [tx, ty] = at(E.P2), a0 = k * 1.9 + .3; ray(p, tx + Math.cos(a0) * 600, Math.max(8, ty + Math.sin(a0) * 600), tx, ty, 20, 14, CY, { bare: true, quiet: true, kb: 0, stun: .6 }); V.ring(tx + Math.cos(a0) * 600, Math.max(8, ty + Math.sin(a0) * 600), 80, '#ffffff', .14); sfx.zap(); }],      // (off a mirror, through them)
  [1.05, p => { const [tx, ty] = at(E.P2); ms.ono('ギィン', tx, ty + 260, .9, CY.core); }]
], { poses: [[0, PALMS], [1.1, 'idle']] });
v('Grid Lock', 'dir2 dir4 dir3', 1.5, [
  [.05, p => { const [tx, ty] = at(E.P2); for (const d of [-90, 0, 90]) { beam(tx - 900, ty + d, tx + 900, ty + d, 14, .5, CY, { bare: true, quiet: true }); beam(tx + d, 1300, tx + d, 0, 14, .5, CY, { bare: true, quiet: true }); } sfx.cannon(0); hold(E.P2, 1.2); }],
  ...[0, 1, 2, 3, 4, 5].map(i => [.15 + i * .08, p => { const o = E.P2; if (up(o) || (o && o.state === 'hurt')) hit(o, p.face, 12, CY, { kb: 0, stun: .8, stop: .02 }); }]),
  [.9, p => { const [tx, ty] = at(E.P2); boom(tx, ty, 1.1, 30, 300, CY); }]
], { poses: [[0, OPENP], [1.2, 'idle']] });
// ---- MAX chains ----
v('MAX Cataclysm', 'max1 max2 max3', 2, [
  [.05, () => play('home-tdc-charge', .7)],
  [.35, p => { fromHair(p, 60, MX, 170, { kb: 200, stun: 1, stop: .14, heavy: 1 }); }],
  ...[0, 1, 2, 3].map(i => [.7 + i * .1, () => { const [tx] = at(E.P2); sky(tx + (i - 1.5) * 90, 10, MX, 80); }]),
  [1.25, p => { const [tx, ty] = at(E.P2); boom(tx, ty, 1.6, 50, 420, MX, { kb: 1600, lift: 700, ring: 1 }); big(p, 'ドドォン', MX.core, 'bw', 'home-gojo-purple-boom'); }]
], { poses: [[0, AIM], [.35, RECOIL], [.6, SKYP], [1.25, OPENP], [1.7, 'idle']] });
v('Supernova Granite', 'max3 max1 max4', 2.1, [
  [.05, .8, (p, o, m, u) => { const y = p.y + 190 * SIZE; if (Math.random() < .8) V.mote(p.x, y, 'white'); if (can(o)) { o.x += (p.x + p.face * 180 - o.x) * .09; if (!o.ground) o.vy = Math.min(o.vy, 0); } shake(4 + u * 10); }],
  [.82, p => { boom(p.x, p.y + 190 * SIZE, 1.8, 80, 520, MX, { kb: 300, lift: 0, stun: 1.2 }); big(p, 'カッ', '#ffffff'); }],
  [1.2, p => { const o = E.P2, x = o && !o.ko ? o.x : p.x + p.face * 300; pillar(x, 150, .5, MX); if (up(o) || (o && o.state === 'hurt')) hit(o, p.face, 60, MX, { kb: 100, lift: 1500, stun: 1, stop: .2, heavy: 1, ring: 1 }); }]
], { poses: [[0, LOWER], [.82, OPENP], [1.2, SKYP], [1.8, 'idle']] });
v('Heaven Pillar', 'max2 max4 max1', 2, [
  [.05, p => { play('home-tdc-charge', .8); E.zoomIn(.8); if (Z) Z.dim(.5, 1); const o = E.P2; if (o && !o.ko) JU.boss && JU.boss.mark(o.x, 200, .8, MX.core); }],
  [.85, p => { const o = E.P2, x = o && !o.ko ? o.x : p.x + p.face * 300; beam(x, 1600, x, 0, 320, .7, MX, { keep: true }); V.crack(x, 420); C.cubes(x, 20, 10, 1.2); smoke(x, 20, 12, 1.6, MX); if (o && !o.ko && Math.abs(o.x - x) < 260) hit(o, p.face, 150, MX, { kb: 200, lift: 0, stun: 1.2, stop: .3, heavy: 1, ring: 1 }); big(p, 'ズドォン', MX.core, 'bw', 'home-gojo-purple-boom'); shake(60); }]
], { poses: [[0, SKYP], [1.6, 'idle']] });
v('Meteor MAX', 'max4 max3 max2', 2, [
  [.05, p => { p.vy = 1700; p.ground = false; sfx.whoosh(); }],
  [.55, p => { const o = E.P2; p.vy = -3200; if (o && !o.ko) p.vx = clamp((o.x - p.x) / .25, -3000, 3000); p.inv = Math.max(p.inv, .8); }],
  [.55, 1.4, (p, o, m) => { if (m.landed) p.vx = 0; if (!m.landed && p.ground) { m.landed = 1; p.vx = 0; boom(p.x, 60, 1.8, 140, 460, MX, { kb: 1300, lift: 900, ring: 1 }); C.cubes(p.x, 20, 10); big(p, 'ドゴォン', MX.core, 'bw', 'home-gojo-purple-boom'); } if (!m.landed) { m.mv = 1; V.puff('white', p.x, p.y + 100, 0, 300, 60, .25); } }]
], { poses: [[0, SKYP], [.55, LOWER], [1.6, 'idle']], keepVx: true, hover: false });
v('Granite Eclipse', 'max1 max4 max3', 2.2, [
  [.05, p => { const o = E.P2; if (o && !o.ko) { eclipse = { x: o.x, y: mid(o), t: 0 }; hold(o, 1.6); } play('home-tdc-charge', .8); }],
  [.1, 1.4, (p, o) => { if (o && !o.ko) hold(o, .4); }],
  [1.45, p => { const o = E.P2; eclipse = null; if (o && !o.ko) { boom(o.x, mid(o), 1.7, 150, 500, MX, { kb: 1500, lift: 700, ring: 1 }); big(p, 'ドォォォン', '#ffffff', 'neg', 'home-gojo-purple-boom'); } }]
], { poses: [[0, PALMS], [1.45, OPENP], [1.9, 'idle']] });
v('Skyfall Granite', 'max2 max1 max4', 1.9, [
  ...[0, 1, 2, 3, 4].map(i => [.1 + i * .12, () => { const [tx] = at(E.P2); sky(tx + (i - 2) * 160, 15, MX, 70); }]),
  [.9, p => { const o = E.P2, [tx, ty] = at(o); for (let i = 0; i < 5; i++) beam(tx + (i - 2) * 400, 1500, tx, ty, 40, .4, MX, { bare: true, quiet: i > 0 }); if (up(o) || (o && o.state === 'hurt')) hit(o, p.face, 70, MX, { kb: 400, lift: 0, stun: 1.1, stop: .2, heavy: 1, ring: 1 }); if (o && !o.ko) spike(o); big(p, 'ズドドド', MX.core); }]
], { poses: [[0, SKYP], [1.5, 'idle']] });
// ---- Scatter chains ----
v('Gatling Cluster', 'scatter1 scatter2 scatter3', 2, [
  [.05, 1.05, (p, o, m) => { const k = Math.floor(m.t / .05); if (k === m.k) return; m.k = k; const z = muzzle(p); shotAt(z[0], z[1], 2600, 3, SC, { spread: rnd(-.05, .05), r: 8, h: { kb: 0, stun: .35, stop: .006 } }); if (k % 2) sfx.zap(); }],
  [1.1, p => { const o = E.P2; if (!o || o.ko) return; boom(o.x, mid(o), 1.2, 40, 300, SC); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; fire({ x: o.x, y: mid(o), vx: Math.cos(a) * 900, vy: Math.sin(a) * 900 + 300, r: 9, dmg: 5, Cc: SC, grav: 1500, life: 1, home: 2, homeAfter: .3, h: { kb: 20, stun: .3, stop: .01 } }); } }]
], { poses: [[0, AIM], [1.1, OPENP], [1.6, 'idle']] });
v('Hailstorm', 'scatter2 scatter1 scatter4', 2, [
  [.05, p => { const z = muzzle(p); for (let i = 0; i < 10; i++) beam(z[0], z[1], z[0] + rnd(-400, 400), 1400, 5, .2, SC, { bare: i > 0, quiet: true }); sfx.cannon(1); }],
  [.35, 1.7, (p, o, m) => { const k = Math.floor((m.t - .35) / .045); if (k === m.k || k >= 30) return; m.k = k; const [tx] = at(E.P2); fire({ x: tx + rnd(-45, 45), y: 1300, vx: 0, vy: -2500, r: 9, dmg: 4, Cc: SC, h: { kb: 0, stun: .35, stop: .005 } }); if (k % 3 === 0) sfx.zap(); }]
], { poses: [[0, SKYP], [1.7, 'idle']] });
v('Chain Clusters', 'scatter3 scatter4 scatter1', 2, [
  ...[0, 1, 2].map(i => [.05 + i * .15, p => { const w = DK.palm(p); fire({ x: w[0], y: w[1] + i * 60, vx: p.face * 1000, vy: 200 - i * 100, r: 22, dmg: 20, Cc: SC, orb: true, home: 4, life: 1.4, h: { kb: 200, stun: .6, stop: .05 }, split: s => { for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; fire({ x: s.x, y: s.y, vx: Math.cos(a) * 700, vy: Math.sin(a) * 700 + 200, r: 8, dmg: 4, Cc: SC, grav: 1400, life: .9, home: 2, homeAfter: .2, h: { kb: 10, stun: .3, stop: .005 } }); } ms.ono('パン', s.x, s.y + 200, .7, SC.core); } }); sfx.zap(); }])
], { poses: [[0, PALMS], [1.6, 'idle']] });
v('Swarm', 'scatter4 scatter1 scatter2', 2.2, [
  [.05, p => { const y = p.y + 200 * SIZE; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; fire({ x: p.x + Math.cos(a) * 140, y: y + 120 + Math.sin(a) * 140, vx: rnd(-320, 320), vy: rnd(320, 620), r: 8, dmg: 5, Cc: SC, life: 2.4, home: 5, homeAfter: .3 + i * .025, h: { kb: 0, stun: .35, stop: .005 } }); } sfx.charge(); label(p.x, p.y + 480, 'SWARM', SC.core, .8); }]
], { poses: [[0, OPENP], [1.8, 'idle']] });
v('Fireworks Finale', 'scatter1 scatter3 scatter4', 2.2, [
  ...[0, 1, 2].map(i => [.05 + i * .35, p => { const z = muzzle(p), [tx] = at(E.P2), x = tx + (i - 1) * 150; fire({ x: z[0], y: z[1], vx: (x - z[0]) / .45, vy: 800, r: 14, dmg: 0, Cc: SC, orb: true, fuse: .45, split: s => { burstFx(s.x, s.y, .6, SC); sfx.blast(); ms.ono('パァン', s.x, s.y + 160, .8, SC.core); for (let k = 0; k < 8; k++) { const a = -Math.PI / 2 + (k - 3.5) * .09; fire({ x: s.x, y: s.y, vx: Math.cos(a) * 800, vy: Math.sin(a) * rnd(700, 1000), r: 8, dmg: 5, Cc: SC, grav: 1100, life: 1.3, h: { kb: 10, stun: .3, stop: .005 } }); } } }); sfx.zap(); }])
], { poses: [[0, SKYP], [1.8, 'idle']] });
v('Spiral Galaxy', 'scatter2 scatter4 scatter3', 2.2, [
  [.05, 1, (p, o, m, u) => { const k = Math.floor(u * 20); if (k === m.k) return; m.k = k; const y = p.y + 200 * SIZE, a = .15 + (k % 10) / 9 * (Math.PI - .3); fire({ x: p.x, y, vx: Math.cos(a) * 800, vy: Math.sin(a) * 800, r: 9, dmg: 6, Cc: SC, life: 2.2, home: 4.5, homeAfter: .4, h: { kb: 10, stun: .35, stop: .006 } }); if (k % 2) sfx.zap(); }]
], { poses: [[0, OPENP], [1.6, 'idle']] });
// ---- Zero Range chains ----
v('Three-Course Brawl', 'zero1 zero2 zero3', 1.8, [
  [.02, p => closeIn(p, 150)],
  ...[0, 1, 2, 3].map(i => [.05 + i * .1, p => { hold(E.P2, .5); p.pose = (i % 2 ? POSE.cross : POSE.jab).slice(); punch(p, 8, ZR, false, { kb: 0, stun: .6 }); }]),
  [.55, p => { p.pose = POSE.hook.slice(); punch(p, 48, ZR, true, { kb: 100, lift: 900 }); }],
  [.95, p => { closeIn(p, 130); p.pose = HEADP.slice(); punch(p, 70, ZR, true, { kb: 1400, lift: 300 }); big(p, 'ゴシャッ', ZR.core, 'red', null); }]
], { poses: [[0, 'jab'], [.55, 'hook'], [.95, HEADP], [1.5, 'idle']] });
v('Discharge Rush', 'zero2 zero1 zero4', 2, [
  [.02, p => closeIn(p, 150)],
  ...Array.from({ length: 10 }, (_, i) => [.05 + i * .085, p => { hold(E.P2, .5); p.pose = ([POSE.jab, POSE.cross, POSE.hook][i % 3]).slice(); punch(p, 9, ZR, false, { kb: 0, stun: .6 }); if (i % 3 === 2) ms.ono('ドドド', E.P2.x + rnd(-80, 80), mid(E.P2) + 280, .7, ZR.core); }]),
  [1, p => { p.pose = POSE.div.slice(); punch(p, 50, ZR, true, { kb: 1600, lift: 500 }); big(p, 'ドガァン', ZR.core, 'red', 'home-love-slam'); }]
], { poses: [[0, 'jab'], [1, 'div'], [1.6, 'idle']] });
v('Granite Suplex', 'zero3 zero4 zero2', 2.2, [
  [.02, p => closeIn(p, 110)],
  [.1, .7, (p, o, m, u) => { if (!can(o)) return; o.x = p.x - p.face * lerp(-110, 40, u); o.y = Math.sin(u * Math.PI) * 340; o.vx = o.vy = 0; Object.assign(o, { state: 'air', ground: false }); }],
  [.72, p => { const o = E.P2; if (can(o)) Object.assign(o, { y: 1, vy: -2600, ground: false, state: 'air' }); burstFx(p.x - p.face * 40, 40, 1.4, ZR); C.cubes(p.x - p.face * 40, 20, 8); if (o && !o.ko) hit(o, -p.face, 145, ZR, { kb: 400, lift: 600, stun: 1.2, stop: .3, heavy: 1, ring: 1 }); big(p, 'ドゴォン', ZR.core, 'red', 'home-gojo-purple-boom'); }]
], { poses: [[0, 'crushWind'], [.1, SUPLEX], [.75, LOWER], [1.8, 'idle']], inv: true });
v('Pompadour Rampage', 'zero4 zero3 zero1', 2, [
  ...[0, 1, 2, 3].map(i => [.05 + i * .2, p => { closeIn(p, 130); hold(E.P2, .6); p.pose = HEADP.slice(); punch(p, 20, ZR, i === 3, i === 3 ? { kb: 300, stun: 1 } : { kb: 0, stun: .7 }); ms.ono('ゴッ', E.P2.x + rnd(-60, 60), mid(E.P2) + 280, .7, ZR.core); }]),
  ...[0, 1, 2].map(i => [.95 + i * .13, p => { p.pose = (i % 2 ? POSE.cross : POSE.jab).slice(); punch(p, 20, ZR, i === 2, i === 2 ? { kb: 1400, lift: 500 } : { kb: 0, stun: .6 }); }])
], { poses: [[0, HEADP], [.95, 'jab'], [1.6, 'idle']] });
v('Point-Blank Banquet', 'zero1 zero3 zero4', 2, [
  [.02, p => closeIn(p, 130)],
  ...Array.from({ length: 5 }, (_, i) => [.08 + i * .22, p => { hold(E.P2, .7); p.pose = POSE.jab.slice(); const w = DK.palm(p); cone(w[0], w[1], p.face, 360, i === 4 ? MX : ZR, .2); const o = E.P2; if (o && !o.ko) hit(o, p.face, 28, ZR, i === 4 ? { kb: 1500, lift: 500, stun: 1, stop: .2, heavy: 1, ring: 1 } : { kb: 0, stun: .8, stop: .06 }); sfx.cannon(i === 4 ? 2 : 0); if (i === 4) big(p, 'ドォン', ZR.core, 'red', 'home-love-slam'); }])
], { poses: [[0, 'jab'], [1.5, 'idle']] });
v('Skybreaker Hook', 'zero2 zero4 zero3', 2, [
  [.02, p => closeIn(p, 150)],
  [.08, p => { p.pose = POSE.hook.slice(); punch(p, 40, ZR, true, { kb: 0, lift: 1500 }); }],
  [.5, p => { const o = E.P2; if (!o || o.ko) return; p.x = clamp(o.x - p.face * 100, -960, 960); p.y = Math.max(0, o.y + 80); p.vy = 0; p.ground = false; V.ring(p.x, p.y + 150, 160, ZR.core, .2); }],
  [.6, p => { p.pose = HEADP.slice(); const o = E.P2; if (o && !o.ko) { hit(o, p.face, 110, ZR, { kb: 200, stun: 1.2, stop: .3, heavy: 1, ring: 1 }); spike(o); } big(p, 'ドグシャ', ZR.core, 'red', 'home-love-slam'); p.vy = -1800; }]
], { poses: [[0, 'hook'], [.5, HEADP], [.9, 'fall'], [1.6, 'idle']], inv: true });
// ---- all four ----
v('Full Spectrum', 'dir2 max3 scatter2 zero2', 2.3, [
  [.05, p => { fromHair(p, 40, CY, 40, { kb: 0, stun: 1 }); }],
  [.35, p => { fromHair(p, 60, MX, 150, { kb: 0, stun: 1, stop: .14, heavy: 1 }); }],
  [.75, p => { const z = muzzle(p); for (let i = 0; i < 10; i++) shotAt(z[0], z[1], 2600, 4, SC, { spread: (i - 4.5) * .03 * p.face, r: 8, h: { kb: 0, stun: .5, stop: .005 } }); }],
  [1.15, p => closeIn(p, 140)],
  [1.2, p => { p.pose = POSE.div.slice(); punch(p, 60, ZR, true, { kb: 1800, lift: 700, ring: 1 }); big(p, '全色', '#ffffff', 'bw', 'home-gojo-purple-boom'); fused(CY, MX); fused(SC, ZR); }]
], { poses: [[0, AIM], [.35, RECOIL], [.75, AIM], [1.2, 'div'], [1.9, 'idle']] });
v('Granite Apocalypse', 'zero4 scatter4 max4 dir4', 2.8, [
  [.05, p => { E.banner('花崗岩の終末', 'GRANITE APOCALYPSE', 'xs'); if (Z) Z.dim(.6, 2.4); E.zoomIn(1.2); play('home-tdc-charge', .9); }],
  ...[0, 1, 2, 3, 4, 5].map(i => [.3 + i * .12, () => { const [tx] = at(E.P2); sky(tx + (i - 2.5) * 120, 12, i % 2 ? MX : SC, 70); }]),
  [1.1, 1.7, (p, o, m) => { const k = Math.floor((m.t - 1.1) / .05); if (k === m.k || !o || o.ko) return; m.k = k; fire({ x: o.x + rnd(-80, 80), y: 1300, vx: 0, vy: -2600, r: 8, dmg: 3, Cc: SC, h: { kb: 0, stun: .4, stop: .004 } }); }],
  [1.8, p => { const o = E.P2, x = o && !o.ko ? o.x : p.x + p.face * 300; pillar(x, 200, .6, MX); if (o && !o.ko && Math.abs(o.x - x) < 240) hit(o, p.face, 60, MX, { kb: 0, lift: 1400, stun: 1, stop: .2, heavy: 1 }); }],
  [2.2, p => { const [tx, ty] = at(E.P2); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; beam(tx + Math.cos(a) * 900, Math.max(8, ty + Math.sin(a) * 900), tx, ty, 40, .4, CY, { bare: true, quiet: i > 0 }); } const o = E.P2; if (o && !o.ko) hit(o, p.face, 82, CY, { kb: 2000, lift: 800, stun: 1.2, stop: .34, heavy: 1, ring: 1 }); big(p, 'ドドドドォン', '#ffffff', 'bw', 'home-gojo-purple-boom'); fused(ZR, SC); fused(MX, CY); shake(60); }]
], { poses: [[0, LOWER], [.3, SKYP], [1.8, OPENP], [2.2, RECOIL], [2.5, 'idle']], inv: true });

/* ---------- the eclipse: a black sphere round them, a white ring at its edge, closing ---------- */
let eclipse = null;
function drawEclipse(dt) {
  const e = eclipse;
  if (!e) return;
  e.t += dt;
  const c = F(e.x, e.y), k = c[2], u = Math.min(1, e.t / 1.35), R = (420 - 260 * u) * k;
  lit(() => E.glow(E.GLOW.white, c[0], c[1], R * 2.4, .6));
  g.fillStyle = 'rgba(2,2,6,.92)'; g.beginPath(); g.arc(c[0], c[1], R, 0, TAU); g.fill();
  g.strokeStyle = '#ffffff'; g.lineWidth = (4 + 10 * u) * k; g.beginPath(); g.arc(c[0], c[1], R, 0, TAU); g.stroke();
  g.strokeStyle = `rgba(${MX.rgb},.8)`; g.lineWidth = 3 * k; g.beginPath(); g.arc(c[0], c[1], R * 1.12, E.T * 4, E.T * 4 + 4); g.stroke();
}
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };

/* ================= reading the keys ================= */
const DEF = T.TECH.tdced, on = () => T.active === DEF;
let seen = null;
const press0 = H.press, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset;
H.press = (a, inScene) => {
  if (!inScene && on() && E.root.dataset.mode === 'fight' && SLOTS.includes(a)) {
    const p = E.P1;
    if (!p.dead && !p.ps) {
      const c = ms.find(LIST, 'tdced', IDS[TD.mode], a);
      if (c && !(E.cd[a] > 0)) {
        if (p.move) E.endMove(p);
        E.cd[a] = E.CD[a]; p.move = { def: c.def, key: a, t: 0 }; E.hud.mv[a].classList.add('act'); ms.forget();
        E.fx.push({ k: 2, x: p.x, y: p.y + 520, n: c.name.toUpperCase(), col: '#ffffff', t: 0, life: 1.3 }); sfx.charge();
        return true;
      }
    }
  }
  return press0 ? press0(a, inScene) : false;
};
H.tick = dt => {                                    // what he has started, and in which mode: the combos read it
  tick0(dt);
  const p = E.P1, m = p.move;
  if (!on()) { seen = null; return; }
  if (m && m !== seen) {
    seen = m;
    const M = TD.MODES[TD.mode];
    if (m.key && SLOTS.includes(m.key) && !m.def.combo && m.def !== M.sw) ms.note('tdced', IDS[TD.mode], m.key);
  } else if (!m && seen) { seen = null; ms.ended(); }
};
H.fx = dt => { fx0(dt); if (on() && eclipse) drawEclipse(dt); };
H.reset = () => { reset0(); eclipse = null; seen = null; };

JU.tdced2 = { LIST, get count() { return LIST.length; }, keysOf: name => (LIST.find(c => c.name === name) || {}).keys };
})();
