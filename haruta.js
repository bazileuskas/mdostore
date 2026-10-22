/* JUJUTSU UNLIMITEDS — early access (Build 0.11): MIRACLE DORK. Miracles: the luck of somebody who has never had any, saved up for the moment
   it is wanted. He fights with a sword: a pink grip and a gold blade.
   1 Rush: a dash, and the sword through whatever is at the end of it. 60, and blood. The wet sounds are sounds/gore-splat1..3.mp3, from
     "8 wet squish, slurp impacts" by Independent.nu (OpenGameArt, CC0: free to use, here and online).
   2 Sword Play: the sword thrown, end over end. Whatever it hits is ragdolled, 40. 2 again: it comes back to his hand, through whatever is
     in the way, 40 more. The throw has a sound of its own, and the return is that sound backwards (index.html, sfx.blade).
     While it is away his strikes are punches, slower and steady, and every third one that lands is a miracle; and 1 is Lucky Cut, which if
     it lands is an uppercut: 50, a stack of bleeding (the same bleeding as the Vengeful Artist's Broil), and 30 more as it bleeds.
   3 and 4 are still to come.
   MIRACLES, the passive: six triangles under his health bar. A blow that would kill him spends them instead: the harder it is the more (one
   to five), and he lives through it with a quarter of his health. Not enough of them for that blow, and it kills him */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, M = E.MOVES, C = JU.cut, Z = JU.bossfx, Fi = JU.fights;
const { rnd, clamp, ease } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk, VA = JU.vengeful, FX = VA.fx;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const exact = (o, n) => n / (o.dr || 1);            // a hit worth the stated amount, whatever the target is made of
const gore = () => JU.gore !== false;
const PINK = '#ff7ab6', PINKD = '#b8487e', GOLDB = '#ffd86b', GOLDD = '#b8892a', GRGB = '255,216,107';
const RUSH = 60, THROWN = 40, BACK = 40, LUCKY = 50, LUCKY_BLEED = 30, MAXM = 6, HEAL = .25;      // what each thing does; how many miracles he can hold; and what one leaves him with
const SPLATS = ['gore-splat1', 'gore-splat2', 'gore-splat3'];

/* ================= how he looks: blond and all over the place, a brown hoodie over a pink shirt, and the face of somebody things happen to ================= */
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.min(255, (n >> 16) * f) | 0},${Math.min(255, (n >> 8 & 255) * f) | 0},${Math.min(255, (n & 255) * f) | 0})`; };
function poly(fill, pts) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
}
const seg = (...p) => { g.beginPath(); for (let i = 0; i < p.length; i += 4) { g.moveTo(p[i], p[i + 1]); g.lineTo(p[i + 2], p[i + 3]); } g.stroke(); };
const SKIN = ['#efd2b8', '#fbe2cc'], HOOD = ['#3a2f28', '#4b3d33'], JEANS = ['#2b3346', '#36405a'], KICKS = ['#d9d6cf', '#ffffff'], BLOND = '#f2d56b', BLOND2 = '#d9b544';
const HARUTA = {
  torso: HOOD,
  armF: [HOOD[0], HOOD[1], SKIN[0], SKIN[1], .2], armB: [shade(HOOD[0], .62), shade(HOOD[1], .62), shade(SKIN[0], .78), shade(SKIN[1], .78), .2],
  legF: [JEANS[0], JEANS[1], KICKS[0], KICKS[1], .17], legB: [shade(JEANS[0], .62), shade(JEANS[1], .62), shade(KICKS[0], .72), shade(KICKS[1], .72), .17],
  chest() {                                         // the hoodie open over a pink shirt, the hood down his back, and its strings
    g.fillStyle = PINK; g.fillRect(6, -TOR, 20, TOR + 5);
    g.fillStyle = PINKD; g.fillRect(6, -TOR, 4, TOR + 5);
    g.fillStyle = '#2e251f'; g.fillRect(-30, -TOR, 34, 10);
    g.strokeStyle = '#e9e6df'; g.lineWidth = 2; seg(14, -TOR + 2, 12, -TOR + 26, 22, -TOR + 2, 24, -TOR + 24);
  },
  head() {
    E.headBase(SKIN[0], SKIN[1]);
    poly(BLOND, [-27, 6, -29, -18, -20, -30, -4, -34, 14, -32, 26, -24, 28, -10, 22, -14, 18, -6, 12, -14, 6, -6, 0, -14, -6, -5, -12, -13, -18, -3, -22, 8]);      // blond, and everywhere
    poly(BLOND2, [-10, -30, -2, -42, 4, -30]);                                                                                // and the bit that will not lie down
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(6, 1, 3.6, 3.4, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(18, 1, 3.2, 3.4, 0, 0, TAU); g.fill();
    g.fillStyle = LINE; g.beginPath(); g.arc(7, 1.4, 1.7, 0, TAU); g.fill(); g.beginPath(); g.arc(18.6, 1.4, 1.6, 0, TAU); g.fill();   // big round eyes, a little lost
    g.strokeStyle = LINE; g.lineCap = 'round'; g.lineWidth = 2; seg(1, -5, 9, -6.5, 14, -6.5, 22, -5);
    g.beginPath(); g.moveTo(9, 14); g.quadraticCurveTo(14, 18.5, 19, 14); g.stroke(); g.lineCap = 'butt';                     // a wide, hopeful mouth
    g.fillStyle = 'rgba(255,120,150,.35)'; g.beginPath(); g.ellipse(3, 9, 3, 1.8, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(21, 9, 2.6, 1.8, 0, 0, TAU); g.fill();
  }
};

/* ================= the sword ================= */
// In his front hand, along the arm: the grip behind his fist, the guard, and the blade out in front. L along it from the hand, v across it
let held = true, blade = null;                      // is it in his hand; and if not, where it is: { x, y, f, ang, phase: 'out' | 'drop' | 'stuck' | 'back', ... }
function grip(f) {
  const a = f.pose[2] - f.pose[6], w = E.hand(f, true), dx = Math.sin(a) * f.face * (f.spin === undefined ? 1 : f.spin), dy = -Math.cos(a);
  return { dx, dy, at: (L, v = 0) => [w[0] + dx * L - dy * v, w[1] + dy * L + dx * v] };
}
// the sword itself, drawn along whatever line it is on: pt(L, v) is where a point of it is on the screen, k how big
function sword(pt, k) {
  const rod = (L0, L1, wd, col) => { const a = pt(L0, 0), b = pt(L1, 0); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.strokeStyle = LINE; g.lineWidth = (wd + 4) * k; g.stroke(); g.strokeStyle = col; g.lineWidth = wd * k; g.stroke(); };
  const shape = (pts, fill) => { g.beginPath(); pts.forEach(([L, v], i) => { const c = pt(L, v); if (i) g.lineTo(c[0], c[1]); else g.moveTo(c[0], c[1]); }); g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5 * k; g.strokeStyle = LINE; g.stroke(); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  rod(-28, 12, 9, PINK);                            // the grip, pink
  g.strokeStyle = PINKD; g.lineWidth = 2 * k; g.beginPath();
  for (let L = -22; L < 10; L += 7) { const a = pt(L, -4), b = pt(L + 4, 4); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }      // the wrap
  g.stroke();
  shape([[11, -15], [17, -15], [17, 15], [11, 15]], GOLDD);       // the guard
  shape([[17, -6], [152, -5.5], [172, 0], [152, 5.5], [17, 6]], GOLDB);      // and the blade, gold
  const e0 = pt(20, -2.5), e1 = pt(158, -2), m0 = pt(20, 1.5), m1 = pt(148, 1.5);
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(e0[0], e0[1]); g.lineTo(e1[0], e1[1]); g.stroke();     // its edge, catching the light
  g.strokeStyle = 'rgba(150,100,20,.55)'; g.lineWidth = 1.4 * k; g.beginPath(); g.moveTo(m0[0], m0[1]); g.lineTo(m1[0], m1[1]); g.stroke();
  g.lineCap = 'butt';
}
function drawHeld(f) { const s = grip(f), pt = (L, v) => F(...s.at(L, v)); sword(pt, pt(0, 0)[2]); }
function drawLoose() {                              // in the air, or in the floor
  const b = blade, c = F(b.x, b.y), k = c[2], ca = Math.cos(b.ang), sa = Math.sin(b.ang);
  sword((L, v) => { const L0 = L - 70; return [c[0] + (L0 * ca - v * sa) * k, c[1] + (L0 * sa + v * ca) * k]; }, k);
  if (b.phase === 'out' || b.phase === 'back') {    // and the circle it cuts as it turns
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(${GRGB},.35)`; g.lineWidth = 6 * k;
    g.beginPath(); g.arc(c[0], c[1], 92 * k, b.ang, b.ang + 2.2); g.stroke(); g.restore();
  }
}
const relabel = () => { const b = E.hud.mv.strikes && E.hud.mv.strikes.querySelector('b'); if (b && on()) b.textContent = held ? MOVES.strikes.name : 'Lucky Cut'; };
function throwSword(p) {
  const w = E.hand(p, true);
  blade = { x: w[0] + p.face * 50, y: w[1], f: p.face, ang: 0, phase: 'out', x0: w[0], t: 0, vy: 0, hitOut: false, hitBack: false };
  held = false; relabel(); sfx.blade(false);
}
function recall() {                                 // 2 again: back to his hand
  if (!blade || blade.phase === 'back') return;
  blade.phase = 'back'; blade.hitBack = false; sfx.blade(true);
  if (Z) Z.flare(blade.x, blade.y, GRGB, 180, .12);
}
function bladeHit(o, f, dmg) {                      // what the sword does to whatever it goes through, either way
  const hs = o.scale || 1, x = o.x, y = o.y + 165 * hs;
  E.applyHit(o, f, { dmg: exact(o, dmg), kb: 900, lift: 520, stun: .9, stop: .12, heavy: 1, col: GOLDB, fixed: 1, mute: 1, flung: 1 });      // (flung: it goes end over end: vengeful.js)
  sfx.splatter(); shake(18);
  V.slash(x, y, rnd(-.5, .5), 320, GOLDB, 12); V.sparks(x, y, 'gold', 10);
  FX.gush(x, y, f, 16, 1.1); FX.splash(x, y, f, 4, .9); FX.pool(o.x, 140);
  FX.pop(x, y + 150, 'ザンッ', 54);
}
function flyBlade(dt) {
  const b = blade, o = E.P2, hs = o.scale || 1;
  b.t += dt;
  const live = !o.ko && !(o.alpha < 1) && o.state !== 'down' && o.state !== 'up';
  if (b.phase === 'out') {
    b.x += b.f * 1900 * dt; b.ang += 26 * dt;
    if (live) b.y += (o.y + 165 * hs - b.y) * Math.min(1, dt * 6);
    if (!b.hitOut && live && Math.abs(b.x - o.x) < 60 * hs && Math.abs(b.y - (o.y + 165 * hs)) < 150 * hs) { b.hitOut = true; bladeHit(o, b.f, THROWN); b.phase = 'drop'; b.vy = 400; }
    else if (Math.abs(b.x - b.x0) > 950 || Math.abs(b.x) > 1000) { b.phase = 'drop'; b.vy = 100; }
  } else if (b.phase === 'drop') {                  // off whatever it hit, and down into the floor point first
    b.vy -= 2600 * dt; b.y += b.vy * dt; b.x = clamp(b.x + b.f * 160 * dt, -1000, 1000); b.ang += 18 * dt;
    if (b.y <= 70) { b.y = 70; b.phase = 'stuck'; b.ang = b.f > 0 ? 1.9 : 1.24; E.addDust(b.x); V.rocks(b.x, 0, 4); sfx.land(); }
  } else if (b.phase === 'back') {                  // back to his hand, through anything in the way
    const p = E.P1, w = E.hand(p, true), dx = w[0] - b.x, dy = w[1] - b.y, d = Math.hypot(dx, dy) || 1, step = Math.min(d, 2400 * dt), x0 = b.x;
    b.x += dx / d * step; b.y += dy / d * step; b.ang -= 26 * dt;
    const f = Math.sign(b.x - x0) || 1;
    if (!b.hitBack && live && (o.x - x0) * (o.x - b.x) <= 0 && Math.abs(b.y - (o.y + 165 * hs)) < 170 * hs) { b.hitBack = true; bladeHit(o, f, BACK); }
    if (d < 50) { blade = null; held = true; relabel(); sfx.cut(.8); V.sparks(w[0], w[1], 'gold', 6); }
  }
}

/* ================= his strikes: the sword's, or (while it is away) his fists ================= */
Object.assign(POSE, {
  haWindA: [0, 0, 2.6, .5, .3, -.35, 0],    haCutA: [.35, 0, 1, 1, .6, -.5, 0],
  haWindB: [.05, 0, .5, .4, .3, -.3, 0],    haCutB: [.3, 0, 2.2, .8, .55, -.5, 0],
  haWindC: [-.2, 0, 3, 1.5, .3, -.35, 0],   haCutC: [.55, .1, .9, 1.2, .9, -.7, 0],
  haCrouch: [-.2, 0, .6, .3, .5, -.6, 0],   haSweep: [.5, 0, 1.55, 1.2, .9, -.7, 0],
  haThrowWind: [-.2, 0, 3, 1, .3, -.35, 0], haThrow: [.4, 0, 1.4, .7, .6, -.5, 0]
});
const CUTS = [['haWindA', 'haCutA', 4], ['haWindB', 'haCutB', 4], ['haWindA', 'haCutA', 5], ['haWindC', 'haCutC', 7]].map(([pre, pose, dmg], i) =>
  Object.assign({}, M.m1[i], { pre, pose, kick: 0, ha: 1, sw: 'rgba(255,216,107,.95)', hit: Object.assign({}, M.m1[i].hit, { dmg, reach: M.m1[i].hit.reach + 45, col: GOLDB }) }));
// without the sword: punches. Slower, steady, the same every time, and nothing on the end of the chain to send anything flying
const FISTS = [['idle', 'jab'], ['jab', 'cross'], ['idle', 'jab'], ['jab', 'cross']].map(([pre, pose], i) =>
  Object.assign({}, M.m1[i], { pre, pose, kick: 0, ha: 1, fist: 1, dur: M.m1[0].dur * 1.3, strike: M.m1[0].strike * 1.4, lunge: 180, hit: { reach: 150, dmg: 6, kb: 150, stun: .42, stop: .05 } }));
function m1(i) {
  const p = E.P1;
  if (p.skin !== HARUTA) return true;               // in somebody else's body (a clan's): the ordinary strikes
  prime();
  p.move = { def: (held ? CUTS : FISTS)[i], i, t: 0 };
  return false;
}

/* ================= MIRACLES ================= */
let miracles = 0, punches = 0;
const row = document.createElement('div');          // under his health bar: six triangles, lit for each one he has
row.className = 'mir'; row.setAttribute('aria-label', 'Miracles');
row.innerHTML = Array.from({ length: MAXM }, () => '<i></i>').join('');
{ const bar = document.querySelector('.fb.p1'); if (bar) bar.appendChild(row); }
function paint(spent = 0) {
  row.classList.toggle('on', on());
  [...row.children].forEach((t, i) => { t.classList.toggle('full', i < miracles); t.classList.toggle('gone', i >= miracles && i < miracles + spent); });
  row.setAttribute('aria-label', `Miracles: ${miracles} of ${MAXM}`);
}
function gain(p) {
  if (miracles >= MAXM) return;
  miracles++; paint();
  sfx.tap(1);
  E.fx.push({ k: 2, x: p.x, y: p.y + 400, n: '+1 MIRACLE', col: GOLDB, t: 0, life: 1 });
  V.sparks(p.x, p.y + 330, 'gold', 8);
}
// a blow that would kill him: the harder it is the more it takes (a fifth of his health or less is one; most of it, five). Enough, and he
// lives through it with a quarter of his health. Not enough, and nothing is spent
function rescue(p, dmg) {
  if (!on() || p.dead || !(dmg > 0) || (Fi.fight.floor || 0) > 0 || p.hp - dmg > 0) return;
  const need = clamp(Math.ceil(dmg / (p.max * .2)), 1, 5);
  if (miracles < need) return;
  miracles -= need;
  p.hp = dmg + p.max * HEAL;                        // (so that when the blow has landed, this is what is left)
  paint(need);
  sfx.tap(1); sfx.confirm(); shake(20); E.stop(.12);
  if (Z) { Z.flash(GRGB, .3, .35); Z.flare(p.x, p.y + 200, GRGB, 520, .3); }
  V.ring(p.x, p.y + 180, 360, GOLDB, .45); V.sparks(p.x, p.y + 200, 'gold', 20);
  shout(p, '奇跡', GOLDB);
  E.fx.push({ k: 2, x: p.x, y: p.y + 470, n: 'MIRACLE  ×' + need, col: '#ffffff', t: 0, life: 1.6 });
}
const chip0 = Fi.chip;
Fi.chip = (dmg, col, shown) => { rescue(E.P1, dmg); return chip0(dmg, col, shown); };      // (bleeding, rot, a broken guard's half: these can kill too)

/* ================= Lucky Cut's bleeding: 30, a few at a time ================= */
const dots = [];
function bleedFor(o, total) { dots.push({ o, left: total, next: .3 }); }
function bleedTick(dt) {
  for (let i = dots.length - 1; i >= 0; i--) {
    const d = dots[i], o = d.o;
    if (o !== E.P2 || o.ko || d.left <= 0) { dots.splice(i, 1); continue; }
    if ((d.next -= dt) > 0) continue;
    d.next = .3;
    const n = Math.min(3, d.left), hs = o.scale || 1;
    d.left -= n;
    if (o.hp - n > 0) { o.hp -= n; o.flash = .05; E.addNum(o.x, o.y + 270 * hs, n, '#ff3b55'); }
    else E.applyHit(o, o.face || 1, { dmg: (o.hp + 1) / (o.dr || 1), kb: 40, stun: .3, stop: .04, col: '#ff3b55', fixed: 1, mute: 1 });      // (that was the last of it)
    if (gore() && Z) Z.emit(4, o.x + rnd(-20, 20), o.y + rnd(120, 220) * hs, rnd(-80, 80), rnd(0, 160), rnd(3, 5), 2, '179,18,44', { g: 1500, land: 'blood' });
  }
}

/* ================= the moves ================= */
const trail = [];                                   // Rush: him, a moment ago, pink
function rushHit(p, o) {
  const f = p.face, hs = o.scale || 1, x = o.x, y = o.y + 165 * hs;
  sfx.splatter(1.1); sfx.cut(1.4); shake(26); E.zoomIn(.35); E.stop(.08);
  V.slash(x, y, f > 0 ? -.15 : Math.PI + .15, 560, GOLDB, 16); V.slash(x, y + 10, f > 0 ? -.15 : Math.PI + .15, 600, '#ffffff', 6);
  V.sparks(x, y, 'gold', 14); V.ring(x, y, 240, PINK, .25);
  FX.gush(x, y, f, 26, 1.3); FX.gush(x, y, -f, 10, .9); FX.splash(x, y, f, 8, 1.1); FX.blood(x, y, f, 10); FX.pool(o.x, 200); FX.lens(2);
  FX.pop(x, y + 170, 'ズバァッ', 70);
}
const MOVES = {
  // 1 — Rush, with the sword. Without it: Lucky Cut
  strikes: { name: 'Rush', cd: 7, dur: 2, glow: 'gold', run(p, m, t) {
    const o = E.P2, f = p.face;
    if (m.kind === undefined) { m.kind = held ? 'rush' : 'lucky'; sfx.charge(); shout(p, m.kind === 'rush' ? '突進' : '幸運', m.kind === 'rush' ? GOLDB : PINK); }
    p.rate = 50;
    if (m.kind === 'rush') {
      if (t < .1) { p.target = POSE.haCrouch; p.vx = 0; return; }
      if (t < .26) {
        p.target = POSE.haSweep; p.vx = f * 2300;
        if (!m.sw) { m.sw = 1; sfx.whoosh(); sfx.cut(1); }
        trail.push({ f: { skin: p.skin, x: p.x, y: p.y, z: p.z, face: p.face, spin: 1, scale: p.scale, pose: p.pose.slice(), alpha: 1 }, t: 0 });
        if (trail.length > 10) trail.shift();
        if (!m.done && E.tryHit(p, { reach: 210, dmg: exact(o, RUSH), kb: 520, lift: 260, stun: .9, stop: .16, heavy: 1, col: '#ff3b55', fixed: 1, mute: 1 })) { m.done = 1; rushHit(p, o); }
        return;
      }
      p.vx = 0; p.target = t < .45 ? POSE.haSweep : POSE.idle;
      if (t > .7) E.endMove(p);
      return;
    }
    // Lucky Cut: low, and up through it
    if (t < .13) { p.target = POSE.vaLow || POSE.crushWind; p.vx = 0; return; }
    p.target = t < .42 ? (POSE.vaRise || POSE.jump) : POSE.idle; p.vx = t < .22 ? f * 260 : 0;
    if (!m.sw) { m.sw = 1; sfx.whoosh(); V.slash(p.x + f * 110, p.y + 220, f > 0 ? 1.2 : Math.PI - 1.2, 380, PINK, 13); }
    if (!m.done && t < .3 && E.tryHit(p, { reach: 175, dmg: exact(o, LUCKY), kb: 80, lift: 1100, stun: .9, stop: .12, heavy: 1, col: PINK, fixed: 1, mute: 1, bleed: 1 })) {
      m.done = 1;
      const hs = o.scale || 1, x = o.x, y = o.y + 165 * hs;
      sfx.splatter(); shake(22); E.zoomIn(.3);
      V.sparks(x, y, 'gold', 10); V.ring(x, y, 220, PINK, .25); FX.gush(x, y, f, 14, 1); FX.pop(x, y + 170, 'ラッキー', 56, PINK);
      if (!o.ko) { VA.wound(o); bleedFor(o, LUCKY_BLEED); }
    }
    if (t > .62) E.endMove(p);
  } },
  // 2 — Sword Play: thrown. (2 again, while it is away, brings it back: that is taken in H.press)
  crush: { name: 'Sword Play', cd: 3, dur: .5, glow: 'gold', run(p, m, t) {
    p.vx = 0; p.rate = 50; p.target = t < .14 ? POSE.haThrowWind : t < .32 ? POSE.haThrow : POSE.idle;
    if (t < .14 || m.s) return;
    m.s = 1;
    if (held) throwSword(p);
  } },
  div: { name: 'Coming soon', cd: 1, dur: .01, run() {} },
  manji: { name: 'Coming soon', cd: 1, dur: .01, run() {} }
};

JU.tech.add('haruta', { name: 'Miracle Dork', jp: '奇跡', mark: '奇', who: 'Miracles', odds: 0, col: PINK, glow: 'gold', moves: MOVES,
  early: true, gore: true, skin: HARUTA, as: ['Miracle Dork', '奇跡'], m1,
  hint: '<b>2</b> again: the sword comes back · without it: punches, every 3rd a miracle · <b>1</b> is Lucky Cut' });
const DEF = JU.tech.TECH.haruta, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
let primed = false;
function prime() { if (!primed) { primed = true; sfx.preload(SPLATS); } }
const moveFx0 = H.moveFx, press0 = H.press, guard0 = H.guard, tick0 = H.tick, fx0 = H.fx, under0 = H.under, reset0 = H.reset, start0 = H.fightStart, rate0 = H.m1rate;
H.moveFx = (p, m) => {
  if (moveFx0) moveFx0(p, m);
  if (p !== E.P1 || !m.def.ha || !m.done || m.counted) return;
  m.counted = 1;
  const o = E.P2, hs = o.scale || 1, x = o.x - p.face * 18, y = o.y + 165 * hs;
  if (m.def.fist) { sfx.hit(false); if (++punches % 3 === 0) gain(p); return; }      // a punch that landed: every third, a miracle
  sfx.cut(.7 + .15 * m.i); FX.splash(x, y, p.face, 2 + m.i, .7); if (m.i === 3) FX.gush(x, y, p.face, 10, 1);
}
H.press = (a, inScene) => {
  if (!inScene && on() && a === 'crush' && blade && blade.phase !== 'back' && !E.P1.dead) { recall(); return true; }
  return press0 ? press0(a, inScene) : false;
};
H.guard = (face, a, mul = 1) => {
  if (guard0 && guard0(face, a, mul)) return true;
  const p = E.P1, f = Fi.fight;
  if (on() && !(p.dashT > 0 || p.inv > 0 || p.dead || p.ps === 'down' || p.ps === 'up' || f.paused)) {      // (a blow that is going to land: if it would kill him, the miracles have their say)
    const raw = a.dmg * mul * (H.foePower ? H.foePower(a) : 1);
    rescue(p, a.exact ? raw : Math.round(raw));
  }
  return false;
};
H.m1rate = () => (rate0 ? rate0() : 1) * (on() && !held ? .8 : 1);      // his fists come slower than the sword did
H.tick = dt => {
  tick0(dt);
  if (blade) flyBlade(dt);
  if (dots.length) bleedTick(dt);
};
H.under = dt => {
  under0(dt);
  for (let i = trail.length - 1; i >= 0; i--) {     // Rush: where he was, a moment ago, in pink
    const s = trail[i];
    if ((s.t += dt) >= .22) { trail.splice(i, 1); continue; }
    g.save(); g.filter = 'brightness(.6) sepia(1) saturate(6) hue-rotate(290deg)'; E.drawFighter(s.f, .55 * (1 - s.t / .22)); g.filter = 'none'; g.restore();
  }
};
H.fx = dt => {
  fx0(dt);
  for (const f of [E.P2, E.P1]) if (f.skin === HARUTA && !(f.alpha < .05) && (f !== E.P1 || held)) drawHeld(f);
  if (blade) drawLoose();
};
const clear = () => { held = true; blade = null; dots.length = trail.length = 0; punches = 0; };
H.reset = () => { reset0(); clear(); miracles = 0; paint(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); clear(); if (!wave) miracles = 0; paint(); relabel(); if (on()) prime(); };

JU.haruta = { HARUTA, MOVES, CUTS, FISTS, MAXM, get held() { return held; }, get blade() { return blade && { phase: blade.phase, x: Math.round(blade.x) }; }, get miracles() { return miracles; }, set miracles(n) { miracles = clamp(n | 0, 0, MAXM); paint(); }, get punches() { return punches; } };
})();
