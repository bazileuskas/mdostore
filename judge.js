/* JUJUTSU UNLIMITEDS — CURSED JUDGE. Hiromi Higuruma's gavel, with the moves the Defense Attorney has in Jujutsu Shenanigans:
   gavel strikes that grow through the chain, Extended Swings, Justice Served, Judgement's Reach and Pressing Charges.
   G is Deadly Sentencing, his domain: a trial. Count by count the accused pleads (confess, silence or denial) and so does he; every plea he calls
   right fills a third of the verdict. Three, and the court hands him the Executioner's Sword. G again swings it: three circles to hit on the beat,
   his accuracy against the accused's, and if his is the better one the cut kills whatever it lands on, however much health it had.
   0.2v3: out of early access and on the roll at 3%. All of it redrawn from the anime: the gavel with its brass band and the cross cut into it,
   the handle let out into a red staff, the picture going crimson and black when it lands, and the sword as a blade of light. The stronger the
   accused, the harder the three circles are */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, M = E.MOVES;
const { clamp, lerp, rnd, ease, ZP } = E, { shout, near } = JU.tech.tk, D = JU.domain, TAU = Math.PI * 2;
const GOLD = '#e2c060', PALE = '#fff3c4', RED = '#e0182c', DEEP = '#4a0410', INK = '#150c05';
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const zf = z => clamp(z, E.ZNEAR + 12, ZP + 500);   // a depth that is still on the floor
const tall = o => 162 * (o.scale || 1);            // about chest height on whatever is being hit

/* ---------- the red light all of this is seen in: for a moment the whole picture is crimson and black, the way the anime shows him ---------- */
let redLvl = 0, redFall = .3, wallT = performance.now();
const crimson = (lvl, fall = .3) => { if (!JU.reduceMotion && lvl >= redLvl) { redLvl = lvl; redFall = fall; } };

/* ---------- loose things: dust rolling out along the floor, pieces of the floor, and where he was a moment ago ---------- */
const SMOKE = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 2, 32, 32, 32);
  gr.addColorStop(0, 'rgba(216,198,184,.9)'); gr.addColorStop(.55, 'rgba(150,126,118,.45)'); gr.addColorStop(1, 'rgba(90,70,66,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return c;
})();
const bits = [], ghosts = [];
function dust(x, n, pow = 1) {
  for (let i = 0; i < n; i++) bits.push({ k: 'd', x: x + rnd(-40, 40), y: rnd(4, 44), vx: (Math.random() < .5 ? -1 : 1) * rnd(140, 760) * pow, vy: rnd(30, 250) * pow, r: rnd(36, 84) * pow, t: 0, life: rnd(.5, 1.1) });
}
function chunks(x, n, pow = 1) {
  for (let i = 0; i < n; i++) bits.push({ k: 'c', x: x + rnd(-70, 70), y: rnd(0, 30), vx: rnd(-520, 520) * pow, vy: rnd(520, 1250) * pow, rot: rnd(0, TAU), vr: rnd(-8, 8), s: rnd(16, 40) * pow, hit: 0, t: 0, life: rnd(1, 1.6) });
}
const ghost = p => ghosts.push({ f: { skin: p.skin, x: p.x, y: p.y, face: p.face, spin: 1, scale: p.scale, pose: p.pose.slice() }, t: 0 });
function drawBits(dt) {
  for (let i = bits.length - 1; i >= 0; i--) {
    const b = bits[i];
    b.t += dt;
    if (b.t >= b.life) { bits.splice(i, 1); continue; }
    const u = b.t / b.life;
    if (b.k === 'd') {
      b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= Math.exp(-2.4 * dt); b.vy *= Math.exp(-2 * dt);
      const c = F(b.x, b.y), s = b.r * (1 + u * 1.6) * c[2];
      g.globalAlpha = .6 * (1 - u) ** 1.3; g.drawImage(SMOKE, c[0] - s, c[1] - s, s * 2, s * 2);
      continue;
    }
    b.vy -= 2400 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
    if (b.y < 0) { b.y = 0; b.vy = b.hit ? 0 : -b.vy * .3; b.vx *= .45; b.vr *= .35; b.hit = 1; }
    const c = F(b.x, b.y), s = b.s * c[2];
    g.save(); g.translate(c[0], c[1] - s * .5); g.rotate(b.rot); g.globalAlpha = Math.min(1, (1 - u) * 3);
    g.fillStyle = '#241a22'; g.strokeStyle = LINE; g.lineWidth = 2; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(-s, -s * .5); g.lineTo(-s * .3, -s * .8); g.lineTo(s, -s * .4); g.lineTo(s * .8, s * .6); g.lineTo(-s * .7, s * .7); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#5c4a52'; g.beginPath(); g.moveTo(-s, -s * .5); g.lineTo(-s * .3, -s * .8); g.lineTo(s, -s * .4); g.lineTo(s * .2, -s * .15); g.closePath(); g.fill();
    g.restore();
  }
  g.globalAlpha = 1;
}
function drawGhosts(dt) {                           // a dark shape of him with the red light on it, where he has just been
  for (let i = ghosts.length - 1; i >= 0; i--) {
    const h = ghosts[i];
    h.t += dt;
    if (h.t >= .3) { ghosts.splice(i, 1); continue; }
    const a = 1 - h.t / .3, c = F(h.f.x, h.f.y + 160);
    g.save(); g.filter = 'brightness(0)'; E.drawFighter(h.f, .5 * a); g.restore(); g.filter = 'none';
    lit(() => E.glow(E.GLOW.red, c[0], c[1], 380 * c[2], .45 * a));
  }
}

/* ---------- drawn on the floor, under the fighters ---------- */
// a ring running out along the floor from where something landed
function floorRing(x, r, life = .45, rgb = '226,192,96', w = 10) {
  V.custom(life, u => {
    const rr = r * ease(u);
    g.beginPath();
    for (let i = 0; i <= 32; i++) { const th = i / 32 * TAU, q = P(x + Math.cos(th) * rr, 0, zf(ZP + Math.sin(th) * rr * .55)); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }
    g.closePath();
    lit(() => { g.strokeStyle = `rgba(${rgb},${1 - u})`; g.lineWidth = w * (1 - u) + 1.5; g.stroke(); });
  }, 0, true);
}
// what the face of the gavel leaves in the floor: a round dent, and the cross that is cut into its head
function imprint(x, r, life = 2.8) {
  V.custom(life, u => {
    const a = Math.min(1, (1 - u) * 3), grow = Math.min(1, u * life * 14), hot = Math.max(0, 1 - u * life * 1.4);
    const oval = k => { g.beginPath(); for (let i = 0; i <= 28; i++) { const th = i / 28 * TAU, q = P(x + Math.cos(th) * r * k * grow, 0, zf(ZP + Math.sin(th) * r * k * .55 * grow)); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); } g.closePath(); };
    const bar = (x0, z0, x1, z1) => { const p0 = P(x + x0 * grow, 0, zf(ZP + z0 * grow)), p1 = P(x + x1 * grow, 0, zf(ZP + z1 * grow)); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); };
    g.save(); g.globalAlpha = a; g.lineJoin = 'round'; g.lineCap = 'round';
    oval(1); g.fillStyle = 'rgba(8,4,6,.6)'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.85)'; g.lineWidth = 5; g.stroke();
    oval(.8); g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2.5; g.stroke();
    g.beginPath(); bar(-r * .46, 0, r * .46, 0); bar(0, -r * .26, 0, r * .26); g.strokeStyle = 'rgba(0,0,0,.85)'; g.lineWidth = 8; g.stroke();
    if (hot > 0) lit(() => { g.globalAlpha = a * hot; oval(1); g.strokeStyle = RED; g.lineWidth = 4; g.stroke(); g.beginPath(); bar(-r * .46, 0, r * .46, 0); bar(0, -r * .26, 0, r * .26); g.strokeStyle = GOLD; g.lineWidth = 3; g.stroke(); });
    g.restore();
  }, 0, true);
}

/* ---------- drawn in the air ---------- */
// the red arc the head of it leaves behind it: round (cx, cy), r out, from one angle to another (the angles a handle uses: 0 hangs straight
// down, a quarter turn points ahead, a half turn is straight up), and as wide at the leading end as the head is long
function sweep(cx, cy, f, r, a0, a1, w, life = .2, delay = 0) {
  V.custom(life, u => {
    const n = 16, s0 = lerp(a0, a1, u * .75), fade = (1 - u) ** 1.3, out = [], inn = [];
    for (let i = 0; i <= n; i++) {
      const v = i / n, a = lerp(s0, a1, v), wi = w * (.06 + .94 * v ** 1.5) * (1 - u * .4), ro = r + wi * .45, ri = Math.max(0, r - wi * .55);
      out.push(F(cx + Math.sin(a) * f * ro, cy - Math.cos(a) * ro)); inn.push(F(cx + Math.sin(a) * f * ri, cy - Math.cos(a) * ri));
    }
    const edge = () => { g.beginPath(); out.forEach((q, i) => { if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); };
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    edge(); for (let i = n; i >= 0; i--) g.lineTo(inn[i][0], inn[i][1]); g.closePath();
    g.globalAlpha = .7 * fade; g.fillStyle = DEEP; g.fill();
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = .8 * fade; g.fillStyle = RED; g.fill();
    edge(); g.globalAlpha = fade; g.strokeStyle = GOLD; g.lineWidth = Math.max(2, w * .07 * out[n][2]); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = Math.max(1, w * .022 * out[n][2]); g.stroke();
    g.restore();
  }, delay);
}
// where it lands on somebody: light, a ring, splinters of it, and for an instant the cross off the head of the gavel
function bang(x, y, s = 1) {
  V.custom(.24, u => {
    const c = F(x, y), k = c[2] * s, e = ease(u), a = 1 - u, r = 32 * k * (.7 + .7 * e);
    g.save(); g.translate(c[0], c[1]);
    lit(() => {
      E.glow(E.GLOW.gold, 0, 0, 280 * k * (.5 + e), .8 * a);
      g.globalAlpha = a; g.strokeStyle = GOLD; g.lineWidth = a * 10 * k + 1; g.beginPath(); g.arc(0, 0, 86 * k * e, 0, TAU); g.stroke();
      g.lineCap = 'round'; g.beginPath();
      for (let i = 0; i < 10; i++) { const an = i / 10 * TAU + s * 1.7, r0 = (46 + 64 * e) * k, r1 = r0 + (26 + 46 * (i % 3)) * k * (1 - u * .5); g.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); g.lineTo(Math.cos(an) * r1, Math.sin(an) * r1); }
      g.strokeStyle = PALE; g.lineWidth = 3 * k; g.stroke();
    });
    g.globalAlpha = a * a; g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 9 * k;
    g.beginPath(); g.moveTo(-r, 0); g.lineTo(r, 0); g.moveTo(0, -r); g.lineTo(0, r); g.stroke();
    g.restore();
  });
}
// a column of gold light standing on the floor
function pillar(x, w, life, a0 = 1) {
  V.custom(life, u => {
    const c = F(x, 0), k = c[2], wd = w * k * (1 - u * .6), a = a0 * (1 - u) ** 1.5, gr = g.createLinearGradient(c[0] - wd, 0, c[0] + wd, 0);
    gr.addColorStop(0, 'rgba(255,210,61,0)'); gr.addColorStop(.5, `rgba(255,236,170,${a})`); gr.addColorStop(1, 'rgba(255,210,61,0)');
    lit(() => { g.fillStyle = gr; g.fillRect(c[0] - wd, c[1] - 900 * k, wd * 2, 900 * k); });
  });
}
// the air dragged along behind something moving very fast in a straight line
function streaks(x0, x1, y, n, life = .18) {
  const set = Array.from({ length: n }, () => [rnd(0, .5), rnd(.5, 1), rnd(-34, 34), rnd(1.5, 4)]);
  V.custom(life, u => lit(() => {
    g.lineCap = 'round';
    for (const s of set) {
      const a = F(lerp(x0, x1, s[0] + u * .4), y + s[2]), b = F(lerp(x0, x1, Math.min(1, s[1] + u * .4)), y + s[2]);
      g.strokeStyle = `rgba(255,214,140,${.8 * (1 - u)})`; g.lineWidth = s[3] * a[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    }
    g.lineCap = 'butt';
  }));
}

/* ---------- the gavel itself ---------- */
// where it is. The handle leaves whichever hand is doing the work. gv: { s: how big, len: how long the handle is, ang: which way it runs
// (left out, it carries on along that arm), bend: how far it is bowed, rod: let out into the red staff }
function hold(p, gv) {
  const ps = p.pose, tp = p.target || ps, back = tp[3] > tp[2], w = E.hand(p, !back), free = gv.ang === undefined;
  const a = free ? (back ? ps[3] : ps[2]) : gv.ang, L = free ? gv.len * Math.min(gv.s, 2.2) : gv.len;
  return { w, a, L, x: w[0] + Math.sin(a) * p.face * L, y: w[1] - Math.cos(a) * L };
}
// the head, drawn about the end of the handle with the handle arriving along x. Dark lacquered ends with the face it strikes with, a ring
// turned into each neck, a band of brass round the middle, and the cross cut into the brass
function head(hw, hh, lw = 3) {
  const r = hw / 2, cap = hh * .2, band = hh * .2, lip = hw * .1, neck = hh / 2 - cap - band;
  const wood = g.createLinearGradient(-r, 0, r, 0), brass = g.createLinearGradient(-r, 0, r, 0);
  wood.addColorStop(0, '#170a08'); wood.addColorStop(.3, '#5e2619'); wood.addColorStop(.5, '#8a422c'); wood.addColorStop(.75, '#4a1c12'); wood.addColorStop(1, '#170a08');
  brass.addColorStop(0, '#6e4f10'); brass.addColorStop(.28, '#d8ae44'); brass.addColorStop(.48, '#fff3b8'); brass.addColorStop(.7, '#e2c060'); brass.addColorStop(1, '#6e4f10');
  g.lineJoin = 'round';
  for (const s of [-1, 1]) {
    g.fillStyle = wood; g.strokeStyle = LINE; g.lineWidth = lw;
    g.beginPath(); g.rect(-r, s > 0 ? band : -band - neck, hw, neck); g.fill(); g.stroke();
    g.beginPath(); g.roundRect(-r - lip, s > 0 ? hh / 2 - cap : -hh / 2, hw + lip * 2, cap, Math.min(cap * .3, lip * 1.5)); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = Math.max(1, lw * .6);
    g.beginPath(); g.moveTo(-r, s * (band + neck * .5)); g.lineTo(r, s * (band + neck * .5)); g.stroke();
  }
  g.fillStyle = brass; g.strokeStyle = LINE; g.lineWidth = lw; g.beginPath(); g.rect(-r - lip * .5, -band, hw + lip, band * 2); g.fill(); g.stroke();
  const c = Math.min(band, r) * .6;
  g.strokeStyle = INK; g.lineWidth = Math.max(1.5, hw * .1); g.lineCap = 'round';
  g.beginPath(); g.moveTo(-c, 0); g.lineTo(c, 0); g.moveTo(0, -c); g.lineTo(0, c); g.stroke(); g.lineCap = 'butt';
  g.fillStyle = 'rgba(255,255,255,.7)';
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(-r * .15, s * (hh / 2 - cap * .5), hw * .07, cap * .26, 0, 0, TAU); g.fill(); }
}
function gavel(p, gv) {
  const q = hold(p, gv), s = gv.s, bend = gv.bend || 0, rod = gv.rod;
  const h0 = F(q.w[0], q.w[1]), h1 = F(q.x, q.y), hc = F((q.w[0] + q.x) / 2 + Math.cos(q.a) * bend * q.L, (q.w[1] + q.y) / 2 + Math.sin(q.a) * p.face * bend * q.L);
  const k = h0[2], thick = Math.min(s, 3) * 2, big = Math.min(s, 2.4), hw = 30 * s * k, hh = 74 * s * k;
  const run = () => { g.beginPath(); g.moveTo(h0[0], h0[1]); g.quadraticCurveTo(hc[0], hc[1], h1[0], h1[1]); };
  g.save(); g.lineCap = 'round';
  if (rod) lit(() => { run(); g.strokeStyle = 'rgba(224,24,44,.32)'; g.lineWidth = (24 + thick * 3) * k; g.stroke(); });
  run(); g.strokeStyle = LINE; g.lineWidth = (10 + thick) * k; g.stroke();
  g.strokeStyle = rod ? '#c4142a' : '#6a2217'; g.lineWidth = (6 + thick) * k; g.stroke();
  g.strokeStyle = rod ? '#ff9a92' : '#a5482e'; g.lineWidth = Math.max(1, (1.4 + thick * .25) * k); g.stroke();
  g.lineCap = 'butt';
  g.translate(h1[0], h1[1]); g.rotate(Math.atan2(h1[1] - hc[1], h1[0] - hc[0]));
  g.fillStyle = '#3a160f'; g.strokeStyle = LINE; g.lineWidth = 2.5; g.lineJoin = 'round';      // the collar where the handle goes into the head
  g.beginPath(); g.roundRect(-hw / 2 - 8 * big * k, -(5 + thick) * k, 9 * big * k, (10 + thick * 2) * k, 3 * k); g.fill(); g.stroke();
  if (s > 2.2) lit(() => E.glow(E.GLOW.gold, 0, 0, hh * 1.6, Math.min(.5, (s - 2.2) * .12)));
  head(hw, hh, clamp(s * 1.2, 2.5, 5));
  g.restore();
}

/* ---------- the strikes: the same chain of four, with the gavel a size bigger every time ---------- */
const hit = (i, more) => Object.assign({}, M.m1[i].hit, { col: GOLD }, more);
const GAVEL = [
  Object.assign({}, M.m1[0], { gv: 1, hit: hit(0, { reach: 180 }) }),
  Object.assign({}, M.m1[1], { gv: 1.35, hit: hit(1, { reach: 185 }) }),
  Object.assign({}, M.m1[2], { gv: 1.8, hit: hit(2, { reach: 195 }) }),
  Object.assign({}, M.m1[3], { gv: 2.6, pre: 'crushWind', pose: 'crush', kick: 0, hit: hit(3, { reach: 220, ring: 1 }) })    // not a kick: the whole thing brought down
];
// the way the head goes on each of the four, for the arc it leaves: a poke, a backhand coming up, a chop, and the whole thing brought down
const ARCS = [[.75, 1.75], [.15, 1.85], [3, 1.1], [3.3, .85]];
const STAFF = 160, SWINGS = [[2.75, .95], [.95, 2.6], [2.6, .95]];      // Extended Swings: how long the staff is, and the three swings of it: down, back up, down

const MOVES = {
  // 1 — the gavel becomes a long-handled hammer: three swings, and then it comes down
  strikes: { name: 'Extended Swings', cd: 6, dur: 1.25, glow: 'gold', run(p, m, t) {
    const k = t < .12 ? -1 : t < .36 ? 0 : t < .6 ? 1 : t < .78 ? 2 : t < .95 ? 3 : 4;      // which swing this is; 3 is the wind-up before the slam
    const f = p.face, at = k >= 0 && k < 3 ? t - [.12, .36, .6][k] : 0;
    p.rate = 44;
    p.target = k < 0 ? POSE.hookWind : k === 3 ? (t < .88 ? POSE.crushWind : POSE.crush) : k === 4 ? (t < 1.12 ? POSE.crush : POSE.idle) : [POSE.hook, POSE.cross, POSE.hook][k];
    p.vx = k >= 0 && k < 3 && at < .08 ? f * 240 : 0;
    // the staff: let out as he winds up, swung high to low and back again, raised, brought down, and drawn back in.
    // Each swing is on its way before its moment comes, so that the head is arriving as the blow lands
    if (t < .78) {
      const out = Math.min(1, t / .05);
      let ang = lerp(1.3, SWINGS[0][0], out), bend = 0;
      for (let i = 0; i < 3; i++) { const u = clamp((t - [.05, .29, .53][i]) / .07, 0, 1), A = SWINGS[i]; if (u > 0) { ang = lerp(A[0], A[1], u * u); bend = (A[1] > A[0] ? -.2 : .2) * Math.sin(u * Math.PI); } }
      m.gv = { s: lerp(1, 1.7, out), len: lerp(70, STAFF, out), ang, bend, rod: 1 };
      if (!m.r) { m.r = 1; sfx.rod(); }
    }
    else if (k === 3) {
      const u = clamp((t - .78) / .09, 0, 1), d = clamp((t - .88) / .07, 0, 1);
      m.gv = { s: lerp(1.7, 2.6, u), len: STAFF, ang: d > 0 ? lerp(3.3, 1.25, d * d) : lerp(SWINGS[2][1], 3.3, ease(u)), bend: .16 * Math.sin(d * Math.PI), rod: 1 };
      if (d > 0 && !m.dn) { const w = hold(p, m.gv).w; m.dn = 1; sfx.swish(2.6); sweep(w[0], w[1], f, STAFF, 3.3, 1.25, 200, .24); }
    } else { const back = clamp((t - 1.08) / .17, 0, 1); m.gv = { s: lerp(2.6, 1, back), len: lerp(STAFF, 70, back), ang: lerp(1.25, 1.2, back), rod: back < 1 }; }
    if (k < 0 || k === 3 || k === m.k) return;
    m.k = k;
    if (k < 3) {
      const A = SWINGS[k], w = hold(p, m.gv).w, o = E.P2;
      sfx.swish(1.7); sweep(w[0], w[1], f, STAFF, A[0], A[1], 130, .22);
      if (E.tryHit(p, { reach: 250, dmg: 4, kb: 60, stun: .5, stop: .04, col: GOLD })) { sfx.gavel(1.7); bang(o.x - f * 20, o.y + tall(o), 1.3); }
      return;
    }
    const x = p.x + f * 255;
    sfx.gavel(2.6); shake(20); crimson(.8, .4);
    V.crack(x, 260); V.rocks(x, 0, 10); imprint(x, 130); dust(x, 10, .7); chunks(x, 4, .8); floorRing(x, 330); bang(x, 60, 2);
    E.tryHit(p, { reach: 260, dmg: 10, kb: 300, lift: 520, stun: .9, stop: .14, heavy: 1, ring: 1, col: GOLD });
  } },
  // 2 — he holds it up and it grows until it is the size of a house, and then he lets it fall. Whatever is under it goes a long way up.
  // (0.2v2: half as hard again, and it reaches most of the way across the arena, a little behind him, and anything in the air over it)
  crush: { name: 'Justice Served', cd: 9, dur: 1.25, glow: 'gold', run(p, m, t) {
    const BIG = 7.4, UP = Math.PI + .3, REST = 1.94, o = E.P2, f = p.face, X = p.x + f * 480;      // X: where the face of it meets the floor
    p.vx = 0; p.rate = 30;
    if (t < .6) {
      const u = Math.min(1, t / .5), d = clamp((t - .5) / .1, 0, 1);      // half a second growing over his head, and a tenth of one on the way down
      p.target = d > 0 ? POSE.crush : POSE.crushWind; if (d > 0) p.rate = 50;
      m.gv = { s: lerp(1.2, BIG, u * u), len: lerp(70, 170, u) + 150 * d, ang: lerp(UP, REST, d * d), rod: 1 };
      crimson(.8 * u, .35);
      if (!m.c) {
        m.c = 1; sfx.charge(); sfx.rise(.5);
        V.custom(.6, v => {                         // its shadow, getting wider and darker on the floor where it is going to land
          const rr = lerp(70, 330, v);
          g.beginPath();
          for (let i = 0; i <= 24; i++) { const th = i / 24 * TAU, q = P(X + Math.cos(th) * rr, 0, zf(ZP + Math.sin(th) * rr * .5)); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }
          g.fillStyle = `rgba(0,0,0,${.12 + .45 * v})`; g.fill();
        }, 0, true);
      }
      const h = hold(p, m.gv);
      if (Math.random() < .8) V.mote(h.x, h.y, 'gold');
      if (d > 0 && !m.dn) { m.dn = 1; sfx.swish(5); sweep(h.w[0], h.w[1], f, 300, UP, REST, 520, .3); }
      return;
    }
    const back = clamp((t - .95) / .3, 0, 1);
    p.target = t < .95 ? POSE.crush : POSE.idle; p.rate = 50; m.gv = { s: BIG * (1 - back * .8), len: lerp(320, 70, back), ang: lerp(REST, 1.3, back), rod: back < 1 };
    if (m.s) return;
    m.s = 1; sfx.slam(2); shake(36); crimson(1, .5);
    const dx = (o.x - p.x) * f;
    V.crack(X, 560); V.crack(X - f * 240, 300); V.rocks(X, 0, 26); chunks(X, 14); dust(X, 34, 1.3); imprint(X, 290, 3.4);
    floorRing(X, 820, .55); floorRing(X, 520, .4, '255,255,255', 6); pillar(X, 190, .35); V.ring(X, 40, 600, GOLD, .5); E.addRing(X, '226,192,96', 620);
    if (o.ko || o.alpha < 1 || o.state === 'down' || o.state === 'up' || o.inv > 0 || dx < -180 || dx > 690 + 40 * ((o.scale || 1) - 1) || o.y > 560) return;
    E.applyHit(o, f, { dmg: 30, kb: 120, lift: 1150, stun: .9, stop: .2, heavy: 1, ring: 1, col: GOLD }); V.impact(.12, o.x, o.y + 150); bang(o.x, o.y + tall(o), 2.6);
  } },
  // 3 — the handle runs out as far as it has to, and the head comes down on whatever is at the end of it
  div: { name: 'Judgement\'s Reach', cd: 7, dur: .95, glow: 'gold', run(p, m, t) {
    const f = p.face, o = E.P2;
    p.vx = 0; p.rate = 40;
    if (t < .18) { p.target = POSE.divWind; m.gv = { s: 1.3, len: 70 }; return; }
    if (!m.s) {
      const q = near(p, 780);
      m.s = 1; m.len = q ? clamp(Math.abs(q.x - p.x) - 50, 120, 740) : 620; m.L = Math.max(60, m.len - 60);     // m.L: the handle as drawn, so that the head arrives where the blow does
      sfx.swish(1.2); sfx.rod(); streaks(p.x + f * 90, p.x + f * (m.len + 60), p.y + 176, 9);
    }
    const DOWN = Math.PI / 2 - Math.atan(60 / m.L);                           // tipped so the head meets the floor
    if (t < .5) {
      const u = Math.min(1, (t - .18) / .14), up = ease(clamp((t - .33) / .1, 0, 1)), d = clamp((t - .44) / .06, 0, 1);     // out, up, and down
      p.target = d > 0 ? POSE.crush : POSE.jab;
      m.gv = { s: lerp(1.4, 2.4, up), len: lerp(70, m.L, u), ang: lerp(lerp(1.62, 2.12, up), DOWN, d * d), bend: -.07 * Math.sin(up * Math.PI) + .06 * Math.sin(d * Math.PI), rod: 1 };
      if (u >= 1 && !m.done) { m.done = 1; if (E.tryHit(p, { reach: m.len + 90, dmg: 6, kb: 0, stun: .8, stop: .06, col: GOLD })) { sfx.gavel(1.4); bang(o.x - f * 20, o.y + tall(o), 1.4); } }
      if (d > 0 && !m.dn) { const w = hold(p, m.gv).w; m.dn = 1; sfx.swish(2.4); sweep(w[0], w[1], f, m.L, 2.12, DOWN, 170, .24); }
      return;
    }
    const back = clamp((t - .66) / .25, 0, 1);     // drawn back in
    p.target = t < .75 ? POSE.crush : POSE.idle; m.gv = { s: lerp(2.4, 1.3, back), len: lerp(m.L, 70, back), ang: lerp(DOWN, 1.2, back), rod: back < 1 };
    if (m.s2) return;
    const x = p.x + f * (m.len + 40);
    m.s2 = 1; sfx.gavel(2.4); shake(18); crimson(.6, .28);
    V.crack(x, 240); V.rocks(x, 0, 8); imprint(x, 120); dust(x, 9, .7); chunks(x, 3, .7); floorRing(x, 300); V.ring(x, 40, 240, GOLD, .35);
    if (E.tryHit(p, { reach: m.len + 120, dmg: 9, kb: 200, lift: 520, stun: .9, stop: .12, heavy: 1, ring: 1, col: GOLD })) bang(o.x, o.y + tall(o), 1.9);
  } },
  // 4 — in on a kick, in again behind it, and the gavel to finish. It leaves him set up for the third strike of the chain
  manji: { name: 'Pressing Charges', cd: 10, dur: 1.05, glow: 'gold', run(p, m, t) {
    const o = E.P2, f = p.face, gap = (o.x - p.x) * f;
    p.rate = 46; m.gv = { s: 1.5, len: 80 };
    if (Math.abs(p.vx) > 900 && E.T - (m.gh || 0) > .03) { m.gh = E.T; ghost(p); }      // going that fast, he leaves himself behind
    if (t < .3) {
      if (m.k) { p.target = POSE.kick; p.vx = 0; return; }
      p.target = POSE.dash; p.vx = gap > 150 ? f * 1500 : 0;
      if ((gap > -30 && gap < 200) || t > .2) {
        m.k = 1; p.vx = 0; sfx.whoosh(); p.pose = POSE.kick.slice();      // the kick is already out when it connects
        if (E.tryHit(p, { reach: 210, dmg: 7, kb: 420, stun: .7, stop: .08 })) { V.ring(o.x - f * 20, o.y + 120, 130, RED, .2); streaks(o.x - f * 160, o.x + f * 60, o.y + 120, 6, .14); }
      }
      return;
    }
    if (m.s) {
      const back = clamp((t - m.s - .12) / .1, 0, 1);
      p.vx = 0; p.target = t < m.s + .22 ? POSE.hook : POSE.idle;
      if (t < m.s + .22) m.gv = { s: lerp(2.1, 1.5, back), len: 90, ang: lerp(1.05, 1.25, back) };      // held where it landed for a moment
      if (!m.set && t > .8) { m.set = 1; p.chain = 2; p.chainT = .7; }
      return;
    }
    p.target = POSE.dash; p.vx = gap > 170 ? f * 1700 : 0;
    if ((gap > -30 && gap < 230) || t > .54) {
      m.s = t; p.vx = 0; sfx.swish(1.5); sweep(p.x + f * 20, p.y + 185, f, 185, 2.9, .95, 150, .22);
      p.pose = POSE.hook.slice(); m.gv = { s: 2.1, len: 90, ang: 1.05 };      // and so is the gavel: the arc is where it has just been
      if (E.tryHit(p, { reach: 250, dmg: 12, kb: 860, lift: 420, stop: .14, heavy: 1, col: GOLD })) { sfx.gavel(2); crimson(.6, .25); bang(o.x - f * 20, o.y + tall(o), 2.2); }
    }
  } }
};

JU.tech.add('judge', { name: 'Cursed Judge', jp: '誅伏賜死', mark: '槌', who: 'Hiromi Higuruma', odds: 3, col: GOLD, glow: 'gold', moves: MOVES,
  awkName: 'Deadly Sentencing',
  awaken(p) {
    const o = E.P2;
    if (o.ko || o.alpha < 1 || D.busy || D.now || D.clashing) { JU.tech.charge(100); return; }     // nobody to try, or a domain already standing: the bar is handed back
    p.inv = Math.max(p.inv, 1);
    D.open({ who: p, tone: 'gold', reveal() { convene(p); } });
  }
});

/* ---------- Deadly Sentencing: the court ---------- */
D.kind('court', { rim: '226,192,96', tint: '70,52,10', bare: true, inside() { const c = JU.cast5.court; c.sky(); c.floor(); c.back(); } });
const PLEAS = [['Confess', '自白'], ['Silence', '黙秘'], ['Denial', '否認']];
// how the accused is standing gives its plea away, nearly every time
const TELLS = ['Its shoulders have dropped: it looks ready to confess.', 'Its mouth is shut tight: it means to say nothing.', 'It is glaring back at the judge: it is going to deny it.'];
const COUNTS = ['The accused is charged with harm done to people who could not fight back.', 'Second count: it was seen at the place, at the hour.',
  'Third count: it could have stopped, and it did not.', 'Fourth count: it has done this before.', 'Fifth count: it knew exactly what it was doing.', 'Last count: it would do it again.'];
const ROUNDS = 6, GUILTY = 3, TELL = .85;           // counts in a trial; right calls needed; how often the tell is honest (0.2v2: it was 5 counts and .65, and nothing was ruled out)
const foeName = () => E.root.querySelector('.fb.p2 .nm b').textContent || 'The accused';
const board = document.createElement('div');
board.className = 'trial';
E.root.appendChild(board);
let trial = null, sword = false, duel = null, lastT = 0;

// a new count: what it is leaning toward, what it is really going to plead, and the one plea the court rules out for him
function deal(t) {
  t.lean = Math.random() * 3 | 0; t.pick = Math.random() < TELL ? t.lean : (t.lean + 1 + (Math.random() * 2 | 0)) % 3;
  const rest = [0, 1, 2].filter(i => i !== t.pick && i !== t.lean);
  t.out = rest[Math.random() * rest.length | 0]; t.me = t.foe = -1;
  if (JU.cast5.speak) JU.cast5.speak(1.3);          // Judgeman reads it out
}
function paint() {
  const t = trial, shown = t.phase !== 'ask', hit = t.me === t.foe;
  const said = t.phase === 'verdict' ? (t.won ? 'Guilty. The sentence is death: take the sword.' : 'The court cannot convict. Not guilty.')
    : shown ? `${t.name}: ${PLEAS[t.foe][0]}. ` + (hit ? 'You called it.' : 'You called it wrong.') : '';
  board.innerHTML = `<div class="tbar"><b>Verdict</b>${[0, 1, 2].map(i => `<i class="${i < t.score ? 'on' : ''}"></i>`).join('')}<span>${t.score} / ${GUILTY}</span><em>Count ${t.round + 1} of ${ROUNDS}</em></div>
    <div class="tbody"><small><span lang="ja">誅伏賜死</span> · Deadly Sentencing · Judgeman</small>
      <p>${COUNTS[t.round]} How does it plead?</p><p class="tt">${TELLS[t.lean]}</p>
      <div class="tpicks${shown ? ' done' : ''}">${PLEAS.map((p, i) => `<button data-plea="${i}" class="${shown && i === t.me ? 'me' : ''}${shown && i === t.foe ? ' foe' : ''}${i === t.out ? ' out' : ''}" aria-label="${p[0]}${i === t.out ? ', ruled out' : ''}"><kbd>${i + 1}</kbd><b>${p[0]}</b><span lang="ja">${i === t.out ? 'ruled out' : p[1]}</span></button>`).join('')}</div>
      <p class="tr${(t.phase === 'verdict' ? t.won : hit) ? '' : ' no'}">${said || 'Call its plea. One is ruled out for you, and how it is standing nearly always gives the answer away.'}</p></div>`;
}
function convene(p) {                               // the white-out has just covered the screen: the court is in session
  D.raise('court', { who: p, dur: 600 });
  trial = { phase: 'intro', t: 0, round: 0, score: 0, won: false, name: foeName() };
  deal(trial);
  lastT = E.T;
  for (let i = E.fx.length - 1; i >= 0; i--) if (E.fx[i].k === 2) E.fx.splice(i, 1);     // nothing is left hanging in the air over the court
  E.banner('誅伏賜死', 'DEADLY SENTENCING', 'sm'); sfx.court();
}
function plead(i) {
  const t = trial;
  if (!t || t.phase !== 'ask' || i === t.out) return;
  t.me = i; t.foe = t.pick;
  if (t.me === t.foe) t.score++;
  sfx.plea(t.me === t.foe);
  t.phase = 'shown'; t.t = 0; paint();
}
function runTrial() {                               // the fight does not move while the court sits, so this runs on the clock on the wall
  const t = trial, real = Math.min(.05, E.T - lastT);
  lastT = E.T; E.stop(.05); t.t += real;
  E.root.classList.add('dom');                      // the fight's own HUD is put away (the opening takes this off again as it ends, so it is set every frame)
  cam.lift = lerp(cam.lift, 120, 1 - Math.exp(-real * 3));     // and the picture is lifted clear of the pleas
  if (t.phase === 'intro') { if (t.t > 1.1) { t.phase = 'ask'; t.t = 0; paint(); board.classList.add('on'); } return; }
  if (t.phase === 'shown' && t.t > 1.5) {
    const left = ROUNDS - t.round - 1;
    if (t.score >= GUILTY || t.score + left < GUILTY) { t.phase = 'verdict'; t.won = t.score >= GUILTY; t.t = 0; if (JU.cast5.speak) JU.cast5.speak(2); sfx.verdict(t.won); if (t.won) { sfx.bf(); shake(24); } }
    else { t.round++; deal(t); t.phase = 'ask'; t.t = 0; }
    paint();
  } else if (t.phase === 'verdict' && t.t > 2) {
    const won = t.won;
    adjourn(); D.drop();
    if (won) { sword = true; E.banner('処刑人の剣', 'EXECUTIONER\'S SWORD', 'sm'); sfx.sword(); } else E.banner('無罪', 'NOT GUILTY', 'sm');
  }
}
function adjourn() { trial = null; cam.lift = 0; board.classList.remove('on'); E.root.classList.remove('dom'); }
board.addEventListener('click', e => { const b = e.target.closest('[data-plea]'); if (b) plead(+b.dataset.plea); });

/* ---------- the Executioner's Sword: three circles, his timing against the accused's ---------- */
const RING = [1.25, 1.05, .85], SPOT = [[.5, .46], [.33, .42], [.67, .42]], R0 = 3.2, R1 = .3;   // how long each ring takes to close on something weak; where each circle is; how big the ring starts and ends
// how strong the accused is, from 0 (the training dummy) to 1: how much it takes to put it down, and whether it has a technique of its own
function rank(o) {
  if (!o.ai) return 0;
  return clamp(.1 + .75 * Math.log(Math.max(o.max / (o.dr || 1), 60) / 60) / Math.log(25) + (o.ai.d.kit ? .15 : 0), 0, 1);
}
// and what that does to the three circles. The stronger it is: the faster the rings close, the less being off the beat is forgiven, the steadier
// its own hand is; past the middle the rings no longer close at an even speed (slow, then all at once), and near the top the circles drift
const terms = k => ({ k, speed: lerp(1.12, .62, k), win: lerp(.5, .28, k), skill: lerp(.34, .76, k), curve: k < .45 ? 1 : lerp(1, 1.8, (k - .45) / .55),
  drift: k < .7 ? 0 : lerp(.012, .04, (k - .7) / .3), stars: k < .12 ? 1 : k < .3 ? 2 : k < .5 ? 3 : k < .72 ? 4 : 5 });
const ringT = d => RING[Math.min(d.i, 2)] * d.q.speed;                              // how long this ring takes
const beat = d => ringT(d) * ((R0 - 1) / (R0 - R1)) ** (1 / d.q.curve);             // the moment the ring is exactly on the circle
const avg = a => a.reduce((s, v) => s + v, 0) / (a.length || 1), pct = v => Math.round(v * 100) + '%';
// the sword: a blade that is nothing but light, a guard that is light drawn out sideways to two points, and where they cross the mark off his gavel
function blade(p, a) {
  const tp = p.target || p.pose, w = E.hand(p, !(tp[3] > tp[2])), L = 250;
  const h0 = F(w[0], w[1]), h1 = F(w[0] + Math.sin(a) * p.face * L, w[1] - Math.cos(a) * L), k = h0[2], dx = h1[0] - h0[0], dy = h1[1] - h0[1], n = Math.hypot(dx, dy) || 1;
  const ux = dx / n, uy = dy / n, px = -uy, py = ux, gx = h0[0] + dx * .13, gy = h0[1] + dy * .13, pulse = .8 + .2 * Math.sin(E.T * 7), G = 62 * k, c = 7 * k;
  const tri = (wd, col, al) => { g.globalAlpha = al; g.fillStyle = col; g.beginPath(); g.moveTo(gx + px * wd, gy + py * wd); g.lineTo(h1[0], h1[1]); g.lineTo(gx - px * wd, gy - py * wd); g.closePath(); g.fill(); };
  g.save(); g.lineCap = 'round';
  lit(() => {
    E.glow(E.GLOW.gold, h0[0] + dx * .5, h0[1] + dy * .5, 440 * k, .5 * pulse); E.glow(E.GLOW.white, gx, gy, 160 * k, .7 * pulse);
    const ray = g.createLinearGradient(h1[0], h1[1], h1[0] + dx * 1.7, h1[1] + dy * 1.7);      // it carries on past its own point, the way light does
    ray.addColorStop(0, 'rgba(255,240,180,.6)'); ray.addColorStop(1, 'rgba(255,240,180,0)');
    g.strokeStyle = ray; g.lineWidth = 5 * k; g.beginPath(); g.moveTo(h1[0], h1[1]); g.lineTo(h1[0] + dx * 1.7, h1[1] + dy * 1.7); g.stroke();
    tri(17 * k, '#ffd86a', .5 * pulse); tri(8 * k, PALE, .9);
    g.globalAlpha = .95; g.fillStyle = PALE; g.beginPath(); g.moveTo(gx + px * G, gy + py * G); g.lineTo(gx + ux * 5 * k, gy + uy * 5 * k); g.lineTo(gx - px * G, gy - py * G); g.lineTo(gx - ux * 5 * k, gy - uy * 5 * k); g.closePath(); g.fill();
    g.strokeStyle = PALE; g.lineWidth = 4 * k; g.beginPath(); g.moveTo(h0[0] - ux * 14 * k, h0[1] - uy * 14 * k); g.lineTo(gx, gy); g.stroke();
  });
  tri(3.2 * k, '#fff', 1);
  g.globalAlpha = 1; g.strokeStyle = INK; g.lineWidth = 2.6 * k;
  g.beginPath(); g.moveTo(gx - ux * c, gy - uy * c); g.lineTo(gx + ux * c, gy + uy * c); g.moveTo(gx - px * c, gy - py * c); g.lineTo(gx + px * c, gy + py * c); g.stroke();
  g.restore();
  if (Math.random() < .3) { const v = rnd(.15, 1); V.puff('gold', w[0] + Math.sin(a) * p.face * L * v, w[1] - Math.cos(a) * L * v, rnd(-30, 30), rnd(40, 150), rnd(10, 20), .4); }
}
const EXEC = { name: 'Execution', dur: .8, glow: 'gold', run(p, m, t) {
  const o = E.P2, gap = (o.x - p.x) * p.face;
  p.rate = 46;
  if (m.at !== undefined) { p.vx = 0; p.target = t < m.at + .3 ? POSE.hook : POSE.idle; return; }
  if (t > .45) { p.vx = 0; p.target = POSE.idle; return; }                       // never got there: the sword is still his
  p.target = POSE.dash; p.vx = gap > 150 ? p.face * 1700 : 0;
  if (E.T - (m.gh || 0) > .03) { m.gh = E.T; ghost(p); }
  if (gap > -30 && gap < 215 && !o.ko && !(o.alpha < 1)) {
    const q = terms(rank(o));                                                    // the stronger it is, the harder this is going to be
    m.at = t; p.vx = 0; p.inv = Math.max(p.inv, 1);
    duel = { phase: 'in', t: 0, age: 0, i: 0, q, mine: [], theirs: [0, 1, 2].map(() => clamp(q.skill + rnd(-.16, .16), .05, .97)), name: foeName(), who: p, foe: o, won: false };
    lastT = E.T; E.root.classList.add('dom'); sfx.sword();
  }
} };
function tap() {
  const d = duel;
  if (d.phase !== 'ring') return;
  const acc = clamp(1 - Math.abs(d.t - beat(d)) / d.q.win, 0, 1);
  d.mine.push(acc); d.phase = 'beat'; d.t = 0; sfx.tap(acc);
}
function text(s, x, y, size, col, align = 'center') {
  g.font = `${Math.round(size)}px Anton, Impact, sans-serif`; g.textAlign = align; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = size * .2; g.strokeStyle = '#07060c'; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y);
}
function runDuel() {
  const d = duel, q = d.q, VW = E.VW, VH = E.VH, real = Math.min(.05, E.T - lastT), R = VH * .085;
  lastT = E.T; E.stop(.05); d.t += real; d.age += real;
  if (d.phase === 'in' && d.t > .9) { d.phase = 'ring'; d.t = 0; sfx.tick(0); }
  else if (d.phase === 'ring' && d.t > ringT(d)) { d.mine.push(0); d.phase = 'beat'; d.t = 0; sfx.tap(0); }      // let it close without pressing: nothing for that one
  else if (d.phase === 'beat' && d.t > .65) { d.t = 0; if (++d.i < 3) { d.phase = 'ring'; sfx.tick(d.i); } else { d.phase = 'result'; d.won = avg(d.mine) >= avg(d.theirs); if (d.won) sfx.bf(); else sfx.back(); } }
  else if (d.phase === 'result' && d.t > 1.7) { strike(); return; }
  g.save();
  const bg = g.createRadialGradient(VW / 2, VH * .44, VH * .04, VW / 2, VH * .44, VW * .72), sx = VW / 2, top = VH * .02, gy = VH * .69, show = Math.min(1, d.age / .6);
  bg.addColorStop(0, 'rgba(20,34,25,.9)'); bg.addColorStop(1, 'rgba(2,5,4,.95)');     // the dark, gone green the way it does round that sword
  g.fillStyle = bg; g.fillRect(0, 0, VW, VH);
  lit(() => {                                       // the sword itself, standing in the middle of the dark
    E.glow(E.GLOW.gold, sx, VH * .4, VW * .75, .2 * show); E.glow(E.GLOW.white, sx, gy, VH * .34, .5 * show);
    const beam = g.createLinearGradient(sx - VH * .03, 0, sx + VH * .03, 0);
    beam.addColorStop(0, 'rgba(255,214,110,0)'); beam.addColorStop(.5, `rgba(255,236,170,${.55 * show})`); beam.addColorStop(1, 'rgba(255,214,110,0)');
    g.fillStyle = beam; g.fillRect(sx - VH * .03, top, VH * .06, (gy - top) * show + VH * .06);
    g.globalAlpha = .9 * show; g.fillStyle = '#fff'; g.beginPath(); g.moveTo(sx - VH * .006, gy); g.lineTo(sx, gy - (gy - top) * show); g.lineTo(sx + VH * .006, gy); g.closePath(); g.fill();
    g.fillStyle = PALE; g.beginPath(); g.moveTo(sx - VH * .2 * show, gy); g.lineTo(sx, gy - VH * .012); g.lineTo(sx + VH * .2 * show, gy); g.lineTo(sx, gy + VH * .012); g.closePath(); g.fill();
    g.globalAlpha = 1;
  });
  g.strokeStyle = INK; g.lineWidth = VH * .006; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx - VH * .014, gy); g.lineTo(sx + VH * .014, gy); g.moveTo(sx, gy - VH * .014); g.lineTo(sx, gy + VH * .014); g.stroke();
  text('EXECUTIONER\'S SWORD', VW / 2, VH * .085, VH * .075, GOLD);
  text('Press when the ring meets the circle   ·   J  ·  Click  ·  Space', VW / 2, VH * .16, VH * .03, '#f4efe4');
  text(d.name.toUpperCase() + '  ·  ' + '★'.repeat(q.stars) + '☆'.repeat(5 - q.stars) + (q.stars > 3 ? '  ·  THE RINGS CLOSE FASTER' : ''), VW / 2, VH * .21, VH * .026, q.stars > 3 ? '#ff8a8a' : 'rgba(244,239,228,.7)');
  if (d.phase === 'ring' || d.phase === 'beat') {
    const s = SPOT[d.i], done = d.phase === 'beat', acc = done ? d.mine[d.i] : 0, sway = q.drift * Math.sin(d.age * 2.3 + d.i * 2);
    const cx = VW * (s[0] + sway), cy = VH * (s[1] + sway * .5), c = R * .3;
    lit(() => E.glow(E.GLOW.gold, cx, cy, R * 4.4, done ? .25 + .6 * acc * (1 - d.t / .65) : .25));
    g.fillStyle = done ? `rgba(226,192,96,${.18 + .5 * acc * (1 - d.t / .65)})` : 'rgba(226,192,96,.12)'; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 5; g.stroke();
    g.strokeStyle = 'rgba(255,243,196,.5)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R * .8, 0, TAU); g.stroke();
    if (!done) {
      const rr = R * lerp(R0, R1, (d.t / ringT(d)) ** q.curve);
      g.strokeStyle = 'rgba(255,243,196,.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - c, cy); g.lineTo(cx + c, cy); g.moveTo(cx, cy - c); g.lineTo(cx, cy + c); g.stroke();
      lit(() => { g.strokeStyle = 'rgba(226,192,96,.5)'; g.lineWidth = 18; g.beginPath(); g.arc(cx, cy, rr, 0, TAU); g.stroke(); });
      g.strokeStyle = GOLD; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, rr, 0, TAU); g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
    } else {
      if (acc > .9) lit(() => { const e = ease(Math.min(1, d.t / .4)); g.strokeStyle = `rgba(255,243,196,${1 - e})`; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R * (1 + 1.6 * e), 0, TAU); g.stroke(); });
      text(pct(acc), cx, cy, VH * .07, acc > .5 ? '#fff' : '#ff5a6e'); text(acc > .9 ? 'PERFECT' : acc > .6 ? 'GOOD' : acc > 0 ? 'OFF' : 'MISSED', cx, cy + R * 1.5, VH * .04, acc > .6 ? GOLD : '#ff5a6e');
    }
    text(d.i + 1 + ' / 3', cx, cy - R * 1.6, VH * .035, '#f4efe4');
  }
  const y0 = VH * .8, col = [VW * .44, VW * .53, VW * .62];
  [['YOU', d.mine, GOLD], [d.name.toUpperCase(), d.theirs, '#ff5a6e']].forEach((r, j) => {      // both scores, a circle at a time
    const y = y0 + j * VH * .065;
    text(r[0], VW * .39, y, VH * .036, r[2], 'right');
    for (let i = 0; i < 3; i++) text(i < d.mine.length ? pct(r[1][i]) : '—', col[i], y, VH * .036, i < d.mine.length ? '#f4efe4' : 'rgba(244,239,228,.35)');
    if (d.phase === 'result') text(pct(avg(r[1])), VW * .73, y, VH * .046, r[2]);
  });
  if (d.phase === 'result') text(d.won ? 'EXECUTED' : 'THE BLADE MISSED', VW / 2, VH * .44, VH * .13, d.won ? GOLD : '#ff5a6e');
  g.restore();
}
let cutFx = null;                                   // the cut itself: for most of a second there is the dark, and a line of light through it
function drawCut(real) {
  const c = cutFx, VW = E.VW, VH = E.VH, u = (c.t += real) / .9;
  if (u >= 1) { cutFx = null; return; }
  const a = Math.min(1, (1 - u) * 1.7), dark = u < .1 ? u / .1 : Math.max(0, 1 - (u - .1) / .9);
  g.save();
  g.fillStyle = `rgba(4,9,6,${.74 * dark})`; g.fillRect(0, 0, VW, VH);
  g.translate(VW / 2, E.GY - 120 - cam.lift); g.scale(cam.zoom, cam.zoom); g.translate(-VW / 2, -(E.GY - 120));
  const q = F(c.x, c.y), k = q[2], wd = (70 * (1 - u) ** 2 + 5) * k, G = 560 * Math.min(1, u * 9) * k, m = 16 * k;
  lit(() => {
    const gr = g.createLinearGradient(q[0] - wd * 4, 0, q[0] + wd * 4, 0);
    gr.addColorStop(0, 'rgba(255,214,110,0)'); gr.addColorStop(.5, `rgba(255,236,170,${.7 * a})`); gr.addColorStop(1, 'rgba(255,214,110,0)');
    g.fillStyle = gr; g.fillRect(q[0] - wd * 4, -VH, wd * 8, VH * 3);
    g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(q[0] - wd / 2, -VH, wd, VH * 3);
    g.fillStyle = `rgba(255,243,196,${a})`; g.beginPath(); g.moveTo(q[0] - G, q[1]); g.lineTo(q[0], q[1] - 14 * k * a); g.lineTo(q[0] + G, q[1]); g.lineTo(q[0], q[1] + 14 * k * a); g.closePath(); g.fill();
    E.glow(E.GLOW.gold, q[0], q[1], 900 * k, .8 * a); E.glow(E.GLOW.white, q[0], q[1], 320 * k, a);
  });
  g.globalAlpha = a; g.strokeStyle = INK; g.lineWidth = 5 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(q[0] - m, q[1]); g.lineTo(q[0] + m, q[1]); g.moveTo(q[0], q[1] - m); g.lineTo(q[0], q[1] + m); g.stroke();
  g.restore();
}
function strike() {                                 // the duel is over: either the sentence is carried out, or the sword is gone
  const d = duel, p = d.who, o = d.foe;
  duel = null; sword = false; E.root.classList.remove('dom');
  if (!d.won || o !== E.P2 || o.ko) {               // it was not good enough: the light comes apart in his hand
    const w = E.hand(p, true), set = Array.from({ length: 12 }, () => [rnd(0, TAU), rnd(160, 520), rnd(30, 90), rnd(0, TAU)]);
    shout(p, 'THE SWORD BREAKS', '#c88'); V.sparks(w[0], w[1] + 60, 'gold', 16); sfx.tap(0);
    V.custom(.5, u => lit(() => {
      g.strokeStyle = `rgba(255,243,196,${1 - u})`; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath();
      for (const s of set) { const c = F(w[0] + Math.cos(s[0]) * s[1] * ease(u), w[1] + 80 + Math.sin(s[0]) * s[1] * ease(u) - 500 * u * u), an = s[3] + u * 9; g.moveTo(c[0] - Math.cos(an) * s[2] * .5 * c[2], c[1] - Math.sin(an) * s[2] * .5 * c[2]); g.lineTo(c[0] + Math.cos(an) * s[2] * .5 * c[2], c[1] + Math.sin(an) * s[2] * .5 * c[2]); }
      g.stroke(); g.lineCap = 'butt';
    }));
    return;
  }
  sfx.execute(); shake(40); V.split(p.face > 0 ? -.5 : .5); V.impact(.4, o.x, o.y + 150);
  cutFx = { t: 0, x: o.x, y: o.y + 170 * (o.scale || 1) }; pillar(o.x, 150, .7); floorRing(o.x, 620, .6, '255,243,196'); V.sparks(o.x, o.y + tall(o), 'gold', 22);
  V.slash(o.x, o.y + 170 * (o.scale || 1), p.face > 0 ? -.9 : Math.PI + .9, 640, GOLD, 22);
  E.applyHit(o, p.face, { dmg: (o.hp + 1) / (o.dr || 1), kb: 900, lift: 560, stun: .9, stop: .34, heavy: 1, col: GOLD, fixed: 1 });   // whatever it had left
}

/* ---------- wiring ---------- */
const DEF = JU.tech.TECH.judge, on = () => JU.tech.active === DEF;
const moveFx0 = H.moveFx, fx0 = H.fx, under0 = H.under, press0 = H.press, post0 = H.post, awaken0 = H.awaken, reset0 = H.reset, start0 = H.fightStart;
let size = 1, primed = false;
H.press = (a, inScene) => {
  if (trial) { const i = ['strikes', 'crush', 'div'].indexOf(a); if (i >= 0) plead(i); return true; }     // nothing else happens while the court sits
  if (duel) { if (a === 'm1' || a === 'jump' || a === 'ok') tap(); return true; }
  return press0 ? press0(a, inScene) : false;
};
H.awaken = p => {                                   // with the sword in his hand, G is the execution
  if (!(on() && sword) || D.busy || D.now) return awaken0(p);
  const o = E.P2;
  if (p.ground && !p.move && !p.ps && !p.dead && !o.ko) { p.face = o.x >= p.x ? 1 : -1; p.move = { def: EXEC, t: 0 }; sfx.swish(1.4); }
};
H.post = dt => {
  post0(dt);
  const now = performance.now(), real = Math.min(.05, (now - wallT) / 1000);
  wallT = now;
  if (redLvl > 0) {                                 // multiplied by red, everything that was light is red and everything that was dark is black
    const a = Math.min(1, redLvl);
    g.save(); g.fillStyle = '#ff2038';
    g.globalCompositeOperation = 'multiply'; g.globalAlpha = a; g.fillRect(0, 0, E.VW, E.VH);
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * .1; g.fillRect(0, 0, E.VW, E.VH);
    g.restore();
    redLvl -= real / redFall;
  }
  if (cutFx) drawCut(real);
  if (trial) runTrial(); else if (duel) runDuel();
};
const clear = () => { if (trial) adjourn(); if (duel) E.root.classList.remove('dom'); duel = cutFx = null; sword = false; redLvl = 0; bits.length = ghosts.length = 0; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { if (!wave) clear(); start0(cfg, wave); };
H.moveFx = (p, m) => {
  moveFx0(p, m);
  if (!on() || !m.def.m1) return;
  if (m.def === M.m1[m.i]) m.def = GAVEL[m.i];      // an ordinary strike has just begun: it is a gavel strike instead
  const s = m.def.gv || 1.8, f = p.face, o = E.P2, hx = o.x - f * 22, hy = o.y + tall(o);
  if (m.sw && !m.gs) { const A = ARCS[m.i] || ARCS[0]; m.gs = 1; sfx.swish(s); sweep(p.x + f * 18, p.y + 183, f, 91 + 70 * Math.min(s, 2.2), A[0], A[1], 62 * s, .18 + .02 * s); }
  if (m.done && !m.gk) {
    m.gk = 1; sfx.gavel(s); bang(hx, hy, .7 + .35 * s); V.sparks(hx, hy, 'gold', 3 + (s * 2 | 0));
    if (m.i === 3) { crimson(.65, .28); imprint(o.x, 120); dust(o.x, 9, .7); chunks(o.x, 3, .7); floorRing(o.x, 300); }      // the fourth is the whole thing brought down
  }
  if (m.def === GAVEL[1] && m.done && !m.tap && m.t > m.def.strike + .12) {     // the second strike raps twice
    m.tap = 1;
    if (!o.ko) { E.applyHit(o, f, { dmg: 2, kb: 60, stun: .34, stop: .03, col: GOLD }); sfx.gavel(1.35); bang(hx, hy - 30, .9); }
  }
};
H.under = dt => { under0(dt); drawGhosts(dt); };
H.fx = dt => {
  fx0(dt);
  drawBits(dt);
  const p = E.P1, m = p.move;
  if (!on() || p.dead || p.alpha < .05) return;
  if (!primed) { primed = true; sfx.preload(['gavel', 'gavel-heavy', 'gavel-slam', 'court', 'sword', 'execute']); }      // sound files of the player's own, if there are any
  if (sword) {                                      // the gavel is put away: this is what he is holding now, upright in front of him until it is used
    const c = F(p.x, p.y + 345), cutting = m && m.def === EXEC;
    blade(p, cutting && m.at !== undefined ? lerp(2.95, .9, ease(clamp((m.t - m.at) / .12, 0, 1))) : cutting ? 2.3 : 2.95 + .04 * Math.sin(E.T * 2));
    text('G  ·  EXECUTE', c[0], c[1], 24 * c[2], GOLD);
    return;
  }
  if (m && m.gv) { size = m.gv.s; gavel(p, m.gv); return; }      // a move sizes it for itself
  size += ((m && m.def.m1 ? m.def.gv || 1.8 : 1) - size) * Math.min(1, dt * 24);
  gavel(p, { s: size, len: 70 });
};

JU.judge = { GAVEL, MOVES, EXEC, plead, head, rank, terms, set sword(v) { sword = !!v; },
  get state() { return { sword, red: redLvl, bits: bits.length, trial: trial && { phase: trial.phase, round: trial.round, score: trial.score, lean: trial.lean, pick: trial.pick, out: trial.out, me: trial.me, foe: trial.foe },
    duel: duel && { phase: duel.phase, i: duel.i, t: duel.t, mine: duel.mine.slice(), theirs: duel.theirs.slice(), won: duel.won, beat: duel.i < 3 ? beat(duel) : 0, ring: ringT(duel), q: duel.q } }; } };
})();
