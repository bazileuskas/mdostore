/* JUJUTSU UNLIMITEDS — early access: CURSED CANNON. Ryu Ishigori: more cursed energy output than anybody, let out of his hair in a straight line.
   1 Granite Blast, a second between them: let go at once it is 45; held 1.4 seconds, 80; held the full 3, somewhere from 120 to 145.
     Every quick one heats him. After four he is overheated and no blast will come out until he has combed his hair.
   2 Cursed Punches: he walks into it and trades. It takes 90 to 110. It gets its own back: he takes 30 to 40.
   3 Hair Comb: 2.78 seconds with the comb, and the heat is gone. Hit him while he is at it and it is not.
   4 is still to come.
   Right click (or C): underheat. A blast is worth less each time than the one before it (by the same share every time), but ten of them
   fit where four did. Seen as it is in the anime: the light at the front of his pompadour, both hands on his head, and a white-blue beam */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, C = JU.cut, keys = E.keys;
const { clamp, lerp, rnd, ease } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk, CYAN = '#7fe9ff', RGB = '127,233,255', HOT = '#ff8a3c', COLD = '#bfe9ff';
const SIZE = 1.12;                                  // he is a big man
const TAP = 45, HELD = 80, FULL = [120, 145], T_HELD = 1.4, T_FULL = 3, T_TAP = .16, REACH = 1500;      // Granite Blast: what it does, how long it has to be held for it, and how far it goes
const LIMIT = 4, UNDER = 10, DECAY = .82;           // quick blasts before he overheats; the same in underheat; and what each one in underheat is worth next to the one before it
const COMB_T = 2.78, OUT = [90, 110], IN = [30, 40];      // how long the comb takes; what Cursed Punches gives, and what it costs him
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const hint = (text, col = CYAN) => E.fx.push({ k: 2, x: E.P1.x, y: E.P1.y + 470, n: text, col, t: 0, life: 1.3 });
const free = p => !p.move && !p.ps && !p.dead && !(p.dashT > 0);
const AIM = [-.14, -.08, 2.75, 2.5, .5, -.5, 0], RECOIL = [-.34, -.2, 2.45, 2.2, .62, -.3, 0], COMB = [.05, .12, 2.62, .5, .32, -.32, 0];      // both hands on his head; the same, thrown back by it; and one hand up with the comb

let heat = 0, under = false, brawl = null, coolAt = -9;     // quick blasts since the comb; which mode; the exchange of Cursed Punches while it lasts; when he last finished combing
const limit = () => (under ? UNDER : LIMIT), over = () => heat >= limit();
const worth = () => (under ? DECAY ** heat : 1);
const holding = () => keys.has('1') || keys.has('hold:strikes');
const muzzle = p => [p.x + p.face * 62 * SIZE, p.y + 268 * SIZE];      // the front of his pompadour: where it all comes out

/* ---------- Granite Blast ---------- */
// the line it takes: from his hair through whatever he is fighting (or level, if there is nothing there), on until it meets the floor or runs out
function line(p) {
  const f = p.face, o = E.P2, [x0, y0] = muzzle(p), dx = (o.x - p.x) * f, there = !o.ko && !(o.alpha < 1) && dx > 90 && dx < REACH;
  const tx = there ? o.x : x0 + f * 900, ty = there ? o.y + 160 * (o.scale || 1) : dx > -30 && dx <= 90 && !o.ko ? 60 : 170;
  const n = Math.hypot(tx - x0, ty - y0) || 1, ux = (tx - x0) / n, uy = (ty - y0) / n, far = uy < -.02 ? Math.min(1700, y0 / -uy) : 1700;
  return { x0, y0, x1: x0 + ux * far, y1: Math.max(0, y0 + uy * far), floor: far < 1700 };
}
function beam(a, w, life, tier) {
  const sc = [.45, .72, 1][tier], cold = under;
  V.custom(life, u => {
    const p0 = F(a.x0, a.y0), p1 = F(a.x1, a.y1), k = p0[2], al = Math.min(1, (1 - u) * 2.4), wd = w * k * (u < .12 ? .6 + u / .3 : 1 - (u - .12) * .75);
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1], n = Math.hypot(dx, dy) || 1, nx = -dy / n, ny = dx / n;
    const seg = (width, col) => { g.strokeStyle = col; g.lineWidth = width; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke(); };
    g.save(); g.lineCap = 'round';
    lit(() => { seg(wd * 2.7, `rgba(${RGB},${.2 * al})`); seg(wd * 1.5, `rgba(${RGB},${.45 * al})`); });
    g.globalAlpha = al; seg(wd, cold ? COLD : CYAN); seg(wd * .6, '#ffffff'); g.globalAlpha = 1;
    lit(() => {
      g.strokeStyle = `rgba(255,255,255,${.7 * al})`; g.lineWidth = Math.max(1, 2 * k);      // the air torn along beside it
      for (let i = 0; i < 9; i++) {
        const s = ((i * 53 % 17) / 17 + E.T * 3) % 1, s1 = Math.min(1, s + .14), off = ((i * 37 % 9) - 4) / 4 * wd * .85;
        g.beginPath(); g.moveTo(p0[0] + dx * s + nx * off, p0[1] + dy * s + ny * off); g.lineTo(p0[0] + dx * s1 + nx * off, p0[1] + dy * s1 + ny * off); g.stroke();
      }
      E.glow(E.GLOW.blue, p0[0], p0[1], (420 + 400 * sc) * k, .8 * al); E.glow(E.GLOW.white, p0[0], p0[1], (220 + 260 * sc) * k * al, al);      // and the light at the mouth of it
      g.fillStyle = `rgba(255,255,255,${al})`;
      g.beginPath(); g.ellipse(p0[0], p0[1], (160 + 240 * sc) * k * al, 4 * k, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(p0[0], p0[1], 4 * k, (110 + 150 * sc) * k * al, 0, 0, TAU); g.fill();
    });
    g.restore();
  });
}
function overheat(p) {
  const m = muzzle(p);
  shout(p, 'OVERHEATED', HOT); sfx.steam(); shake(8);
  for (let i = 0; i < 10; i++) V.puff('white', m[0] + rnd(-30, 30), m[1] + rnd(-10, 30), rnd(-60, 60), rnd(160, 420), rnd(30, 60), rnd(.5, .9));
  hint('3  ·  HAIR COMB', HOT);
}
function fire(p, m, tier) {
  const f = p.face, o = E.P2, a = line(p), sc = [.45, .72, 1][tier], hs = o.scale || 1, dx = (o.x - p.x) * f;
  const dmg = [TAP, HELD, rnd(FULL[0], FULL[1])][tier] * worth(), w = [26, 50, 92][tier] * (under ? .8 : 1);
  E.cd.strikes = MOVES.strikes.cd;                  // the second he waits starts when it is let go, not when he began
  m.kick = [.1, .16, .26][tier]; m.back = [150, 420, 900][tier];
  sfx.cannon(tier); shake([10, 22, 40][tier]); if (tier) E.zoomIn(tier > 1 ? .5 : .25);
  beam(a, w, [.26, .38, .56][tier], tier);
  if (a.floor) {                                    // where it meets the floor: a hole, and a furrow on from it
    const x = clamp(a.x1, -1040, 1040);
    V.crack(x, 160 + 220 * sc); V.rocks(x, 0, 6 + 14 * tier); E.addBlast(x, 60, RGB, 240 + 420 * sc); V.ring(x, 50, 160 + 260 * sc, CYAN, .3); E.addDust(x);
    C.gash(x - f * 30, rnd(-24, 24), clamp(x + f * (160 + 460 * sc), -1040, 1040), rnd(-24, 24), 6 + 10 * sc, 2.4 + sc, { col: RGB });
    if (tier > 1) C.cubes(x, 20, 8, 1.1);
  }
  if (!o.ko && !(o.alpha < 1) && o.state !== 'down' && o.state !== 'up' && !(o.inv > 0) && dx > -30 && dx < REACH) {
    const base = { dmg: dmg / (o.dr || 1), col: CYAN, fixed: 1 }, y = o.y + 160 * hs;
    E.applyHit(o, f, Object.assign(base, [{ kb: 420, stun: .5, stop: .08 }, { kb: 820, lift: 380, stop: .14, heavy: 1 }, { kb: 1400, lift: 560, stop: .26, heavy: 1, ring: 1 }][tier]));
    E.addBlast(o.x, y, RGB, 260 + 400 * sc); V.ring(o.x, y, 160 + 240 * sc, CYAN, .3); V.sparks(o.x, y, 'blue', 10 + 14 * tier);
    if (tier > 1) { V.impact(.16, o.x, y); C.cubes(o.x, 40, 8); }
  }
  if (!tier && ++heat >= limit()) overheat(p);      // a quick one heats him, and the last of them is one too many
}

/* ---------- Cursed Punches: what he gives, and what he gets back ---------- */
// the exchange, beat by beat: [when, whose (1 his, -1 its), the share of the whole that one is, the pose it is thrown with]
const BEATS = [[.05, 1, .18, 'jab'], [.22, -1, .3, 'cross'], [.4, 1, .22, 'cross'], [.58, -1, .3, 'hook'], [.76, 1, .25, 'hook'], [.94, -1, .4, 'cross'], [1.28, 1, .35, 'div']];
function blow(p, o, b, last) {
  const f = p.face, hs = o.scale || 1;
  if (b[1] > 0) {                                   // his
    const dmg = brawl.out * b[2] / (o.dr || 1);
    p.pose = POSE[b[3]].slice(); p.target = POSE[b[3]];
    E.applyHit(o, f, last ? { dmg, kb: 1000, lift: 520, stun: .9, stop: .2, heavy: 1, ring: 1, col: '#ff5a6e', fixed: 1 } : { dmg, kb: 0, stun: .16, stop: .05, col: '#ff5a6e', fixed: 1 });
    V.ring(o.x - f * 24, o.y + 165 * hs, last ? 260 : 110, '#ff5a6e', .2);
    if (last) { V.impact(.14, o.x, o.y + 160 * hs); V.crack(o.x, 240); V.rocks(o.x, 0, 8); shout(p, 'DESSERT', '#ff5a6e'); sfx.bf(); shake(26); }
    return;
  }
  const dmg = Math.max(0, Math.min(brawl.cost * b[2], p.hp - 1));      // its: he takes it on the chin, and it never quite puts him down
  Object.assign(o, { state: 'idle', act: null, stun: 0 }); brawl.pose = POSE[b[3]]; brawl.poseT = .16; o.pose = POSE[b[3]].slice();
  E.fx.push({ k: 4, x: o.x + o.face * 80 * hs, y: o.y + 160 * hs, face: o.face, r: 100 * hs, col: 'rgba(255,60,90,.85)', t: 0, life: .18 });
  Fi.chip(Math.round(dmg), '#ff5a6e'); p.flash = .1; p.pose = POSE.hurt.slice();
  E.addSpark(p.x + f * 20, p.y + 190 * SIZE, '#ff5a6e', 90); V.ring(p.x + f * 20, p.y + 190 * SIZE, 100, '#ff2440', .18); sfx.hit(false); E.stop(.05); shake(9);
}

const MOVES = {
  // 1 — Granite Blast. Held: see the top of this file
  strikes: { name: 'Granite Blast', cd: 1, dur: 4.2, run(p, m, t) {
    const o = E.P2;
    p.rate = 30;
    if (m.fired === undefined) {
      p.vx = 0; p.target = AIM;
      if (!o.ko) p.face = o.x >= p.x ? 1 : -1;      // he keeps it pointed at whatever he is fighting
      if (!m.c) { m.c = 1; sfx.charge(); }
      if (t >= T_HELD && !m.up) { m.up = 1; sfx.tick(2); const z = muzzle(p); V.ring(z[0], z[1], 150, CYAN, .22); hint('HELD  ·  ' + HELD); }
      if (Math.random() < .4 + t * .2) { const z = muzzle(p); V.mote(z[0], z[1], 'blue'); }
      if ((holding() && t < T_FULL) || t < T_TAP) return;
      m.fired = t; p.pose = RECOIL.slice();
      fire(p, m, t >= T_FULL ? 2 : t >= T_HELD ? 1 : 0);
      return;
    }
    p.vx = t < m.fired + m.kick ? -p.face * m.back : 0;       // it throws him back
    p.target = t < m.fired + .26 ? RECOIL : POSE.idle;
    if (t > m.fired + .36) E.endMove(p);
  } },
  // 2 — Cursed Punches
  crush: { name: 'Cursed Punches', cd: 9, dur: 2.4, glow: 'red', run(p, m, t) {
    const o = E.P2, f = p.face, gap = (o.x - p.x) * f;
    p.rate = 46;
    if (m.go === undefined) {
      if (t > .34) { p.vx = 0; p.target = POSE.idle; if (t > .5) E.endMove(p); return; }      // never got to it
      p.target = POSE.dash; p.vx = gap > 150 ? f * 1500 : 0;
      if (gap > -30 && gap < 200 && !o.ko && o.state !== 'down' && !(o.alpha < 1)) {
        m.go = t; m.i = 0; p.vx = 0; p.inv = Math.max(p.inv, 1.9);        // nothing else gets a word in while the two of them are at it
        brawl = { o, f, out: rnd(OUT[0], OUT[1]), cost: rnd(IN[0], IN[1]), pose: POSE.idle, poseT: 0 };
        Object.assign(o, { state: 'idle', act: null, vx: 0 }); sfx.whoosh();
      }
      return;
    }
    const u = t - m.go;
    p.vx = 0;
    if (m.end !== undefined) { p.target = t < m.end + .22 ? POSE.div : POSE.idle; if (t > m.end + .34) E.endMove(p); return; }      // the last one has landed: he follows it through
    if (!brawl || o.ko) { brawl = null; p.target = POSE.idle; if (u > .3) E.endMove(p); return; }
    if (m.i < BEATS.length - 1 || u < 1.1) { o.x = clamp(p.x + f * 150, -945, 945); o.vx = 0; }      // toe to toe until the last one
    if (u > 1.08 && m.i === BEATS.length - 1) p.target = POSE.divWind;      // he draws the last one back
    else if (m.i < BEATS.length) p.target = POSE.idle;
    if (Math.random() < .3) V.bolt(p.x + rnd(-60, 200) * f, p.y + rnd(60, 300), p.x + rnd(-60, 260) * f, p.y + rnd(60, 320), '#ff2440', .12, 2, '#120306');
    while (m.i < BEATS.length && u >= BEATS[m.i][0]) { const b = BEATS[m.i++]; blow(p, o, b, m.i === BEATS.length); if (!brawl) return; }
    if (m.i >= BEATS.length) { brawl = null; m.end = t; }
  } },
  // 3 — Hair Comb: 2.78 seconds, and it has to be all of them
  div: { name: 'Hair Comb', cd: 1, dur: COMB_T + .3, run(p, m, t) {
    p.vx = 0; p.rate = 26;
    if (t < COMB_T) {
      const n = Math.floor(t / .34), z = muzzle(p);
      COMB[2] = 2.62 + .2 * Math.sin(t * 18.5); p.target = COMB;
      if (n !== m.n) { m.n = n; sfx.comb(); if (heat > 0) V.puff('white', z[0] + rnd(-40, 10) * p.face, z[1] + rnd(-6, 26), rnd(-40, 40), rnd(140, 320), rnd(26, 50), rnd(.5, .8)); }
      return;
    }
    p.target = POSE.idle;
    if (m.done) return;
    const z = muzzle(p);
    m.done = 1; heat = 0; coolAt = E.T;
    sfx.tap(1); V.ring(z[0], z[1], 170, '#ffffff', .3); V.sparks(z[0], z[1], 'white', 8); shout(p, 'COOL', COLD);
  } },
  // 4 — not yet
  manji: { name: 'Coming soon', cd: 1, dur: .01, run() {} }
};

JU.tech.add('cannon', { name: 'Cursed Cannon', jp: 'グラニテブラスト', mark: '砲', who: 'Granite Cannon', odds: 0, col: CYAN, glow: 'blue', moves: MOVES,
  early: true, skin: JU.cast6.ISHIGORI, as: ['Granite Cannon', '砲'], scale: SIZE, hint: '<b>Hold 1</b> Granite Blast · <b>Right click</b> / <b>C</b> underheat' });
const DEF = JU.tech.TECH.cannon, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
const press0 = H.press, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart, pre0 = H.foePre, rim0 = H.rim, tick0 = H.tick;
function toggle() {                                 // right click: the other way of running it
  const p = E.P1, z = muzzle(p);
  under = !under; sfx.hover(); sfx.tick(under ? 0 : 2);
  shout(p, under ? 'UNDERHEAT' : 'FULL HEAT', under ? COLD : HOT); V.ring(z[0], z[1], 150, under ? COLD : HOT, .25);
  if (over()) overheat(p);                          // (going back to four with more than four behind him is overheating on the spot)
}
H.press = (a, inScene) => {
  if (a === 'alt') { if (!inScene && on() && !E.P1.dead) { toggle(); return true; } return press0 ? press0(a, inScene) : false; }
  if (!inScene && on()) {
    const p = E.P1;
    if (a === 'manji') { if (free(p)) hint('4  ·  COMING SOON'); return true; }
    if (a === 'strikes' && over()) {                // nothing comes out: his hair has to cool first
      if (free(p) && E.cd.strikes <= 0) { const z = muzzle(p); E.cd.strikes = .5; sfx.steam(); hint('OVERHEATED  ·  3  HAIR COMB', HOT); for (let i = 0; i < 4; i++) V.puff('white', z[0] + rnd(-20, 20), z[1] + rnd(0, 20), rnd(-40, 40), rnd(160, 320), rnd(24, 44), rnd(.4, .7)); }
      return true;
    }
  }
  return press0 ? press0(a, inScene) : false;
};
H.foePre = (o, p, dt) => {                          // while the two of them are trading it does what the exchange has it do, and nothing of its own
  if (!brawl || brawl.o !== o) return pre0 ? pre0(o, p, dt) : false;
  if ((brawl.poseT -= dt) <= 0) brawl.pose = POSE.idle;
  o.vx = 0; o.face = -brawl.f; o.target = brawl.pose; o.rate = 46;
  return true;
};
H.tick = dt => { tick0(dt); if (brawl && (!on() || E.P1.move === null || E.P1.move.def !== MOVES.crush)) brawl = null; };      // knocked out of it, or it is over: it is its own again
H.rim = f => {                                      // the edge of him: orange while he is too hot to fire, pale while he is running cold
  if (f !== E.P1 || !on() || f.dead) return rim0 ? rim0(f) : null;
  const m = f.move, aiming = m && m.def === MOVES.strikes && m.fired === undefined;
  return over() ? { col: '#ff5a2a', blur: 8 + 3 * Math.sin(E.T * 10) } : aiming ? { col: CYAN, blur: 5 + 2.4 * Math.min(T_FULL, m.t) } : under ? { col: COLD, blur: 4 } : null;
};
H.fx = dt => {
  fx0(dt);
  const p = E.P1, m = p.move;
  if (!on() || p.dead || p.alpha < .05) return;
  const z = muzzle(p), c = F(z[0], z[1]), k = c[2], T = E.T, hot = over();
  if (hot) lit(() => E.glow(E.GLOW.fire, c[0], c[1], (150 + 30 * Math.sin(T * 11)) * k, .8));      // his hair, too hot to touch
  if (hot && Math.random() < dt * 9) V.puff('white', z[0] + rnd(-24, 24), z[1] + rnd(0, 24), rnd(-30, 30), rnd(120, 260), rnd(20, 40), rnd(.5, .8));
  if (m && m.def === MOVES.strikes && m.fired === undefined) {      // being gathered: the light at the front of his hair, and a ring round it that fills over the three seconds
    const t = m.t, u = Math.min(1, t / T_FULL), R = (10 + 30 * u + 2 * Math.sin(T * 30)) * k, G = 62 * k, a1 = -Math.PI / 2 + TAU * u, am = -Math.PI / 2 + TAU * T_HELD / T_FULL;
    lit(() => {
      E.glow(E.GLOW.blue, c[0], c[1], (200 + 420 * u) * k, .85); E.glow(E.GLOW.white, c[0], c[1], R * 4.4, 1);
      g.fillStyle = '#fff'; g.beginPath(); g.ellipse(c[0], c[1], R * (3 + 5 * u), 2.4 * k, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(c[0], c[1], 2.4 * k, R * (2 + 3 * u), 0, 0, TAU); g.fill();
    });
    g.fillStyle = '#fff'; g.beginPath(); g.arc(c[0], c[1], R, 0, TAU); g.fill();
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(8,6,14,.75)'; g.lineWidth = 7 * k; g.beginPath(); g.arc(c[0], c[1], G, 0, TAU); g.stroke();
    g.strokeStyle = t >= T_HELD ? '#fff' : CYAN; g.lineWidth = 4.5 * k; g.beginPath(); g.arc(c[0], c[1], G, -Math.PI / 2, a1); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 2.5 * k; g.beginPath(); g.moveTo(c[0] + Math.cos(am) * (G - 8 * k), c[1] + Math.sin(am) * (G - 8 * k)); g.lineTo(c[0] + Math.cos(am) * (G + 8 * k), c[1] + Math.sin(am) * (G + 8 * k)); g.stroke();
    g.lineCap = 'butt';
  }
  if (m && m.def === MOVES.div && m.t < COMB_T) {    // the comb, where his hand is, and how far through he has got
    const w = E.hand(p, true), h = F(w[0], w[1]), u = m.t / COMB_T;
    g.save(); g.translate(h[0], h[1]); g.rotate(-.5 * p.face); g.fillStyle = '#16141a'; g.strokeStyle = LINE; g.lineWidth = 2;
    g.beginPath(); g.rect(-20 * k, -5 * k, 40 * k, 9 * k); g.fill(); g.stroke();
    g.beginPath(); for (let i = -4; i <= 4; i++) { g.moveTo(i * 4.4 * k, 4 * k); g.lineTo(i * 4.4 * k, 15 * k); } g.stroke();
    g.restore();
    g.lineCap = 'round'; g.strokeStyle = 'rgba(8,6,14,.75)'; g.lineWidth = 7 * k; g.beginPath(); g.arc(c[0], c[1], 58 * k, 0, TAU); g.stroke();
    g.strokeStyle = COLD; g.lineWidth = 4.5 * k; g.beginPath(); g.arc(c[0], c[1], 58 * k, -Math.PI / 2, -Math.PI / 2 + TAU * u); g.stroke(); g.lineCap = 'butt';
    if (Math.random() < dt * 14) { const a = rnd(0, TAU); V.puff('white', z[0] + Math.cos(a) * 46, z[1] + Math.sin(a) * 34, 0, 60, 12, .3); }      // it catches the light
  }
  // how hot he is: a pip for every quick blast since the comb, out of four, or out of ten
  const n = limit(), shown = m && m.def === MOVES.div && m.t < COMB_T ? heat * (1 - m.t / COMB_T) : heat, top = F(p.x, p.y + 384 * SIZE), pw = (under ? 9 : 16) * top[2], gap = 4 * top[2], w = n * pw + (n - 1) * gap, x0 = top[0] - w / 2;
  g.fillStyle = 'rgba(8,6,14,.7)'; g.fillRect(x0 - 4, top[1] - 4, w + 8, 9 * top[2] + 8);
  for (let i = 0; i < n; i++) {
    const fill = clamp(shown - i, 0, 1), x = x0 + i * (pw + gap);
    g.fillStyle = 'rgba(244,239,228,.16)'; g.fillRect(x, top[1], pw, 9 * top[2]);
    if (fill > 0) { g.fillStyle = hot ? (Math.sin(T * 14) > 0 ? '#ff3b2a' : HOT) : under ? COLD : HOT; g.fillRect(x, top[1], pw * fill, 9 * top[2]); }
  }
  g.font = `${Math.round(14 * top[2])}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.lineJoin = 'round';
  const label = hot ? 'OVERHEATED' : under ? 'UNDERHEAT  ·  ×' + worth().toFixed(2) : 'HEAT';
  g.lineWidth = 4 * top[2]; g.strokeStyle = '#07060c'; g.strokeText(label, top[0], top[1] - 5 * top[2]); g.fillStyle = hot ? '#ff8a7a' : under ? COLD : 'rgba(244,239,228,.8)'; g.fillText(label, top[0], top[1] - 5 * top[2]);
};
const clear = () => { heat = 0; brawl = null; };
H.reset = () => { reset0(); clear(); under = false; };
H.fightStart = (cfg, wave) => {
  start0(cfg, wave); if (!wave) clear();
  if (on() && !JU.clan.body()) E.P1.scale = SIZE;
};

JU.cannon = { MOVES, LIMIT, UNDER, DECAY, COMB_T, kit: { SIZE, AIM, RECOIL, muzzle, line, beam },      // (kit: what its awakened form borrows, tced.js)
  get state() { return { heat, under, over: over(), worth: +worth().toFixed(3), brawl: brawl && { out: +brawl.out.toFixed(1), cost: +brawl.cost.toFixed(1) } }; }, set heat(v) { heat = v; }, toggle };
})();
