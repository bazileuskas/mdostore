/* JUJUTSU UNLIMITEDS — Build 0.29: the KING OF JUJUTSU (the user's boss). The King of Curses as he was a thousand years ago, when jujutsu was
   at its height: four arms, a second face on the side of his head, a mouth across his belly, a court robe open to the sash. More health than
   anything else in the game (5000, and he takes a fifth less than he is dealt), and nothing he does is small:
     Dismantle   blades of air the length of the arena, low, high, low: jump the low ones, dash through the high one
     Open        a fire arrow, quick and low: jump it
     Furnace     the real one. All four hands draw it, "Fuga" (the anime's line), and where it lands most of the arena goes up and stays
                 burning. Dash through it as it lands
     Cleave      in, one touch, and cut to pieces where he stands
     Ambush      gone, and behind him: a flurry from four fists, and a smash
     Kamutoke    a staff of lightning held up: bolts on the marks, and the last on him
   and his chant, said a line at a time as he is hurt (his E special, the user's word for it):
     Scale of the Dragon   Dismantle becomes more: five blades, bigger, and the arena parted after them
     Twin Meteors          two cuts out of the sky from either side, meeting on him; and Dismantle is more again
     Recoil                the World Cutting Slash. A grid drawn over everything on the screen, and everything is cut along it. It kills
                           whatever it touches, through any guard. Dash as it comes down (the lines go white just before)
   Nothing stops him in the middle of a move, and he does not stay down: kept off his feet too long, he throws whoever is doing it off.
   He is found in Shinjuku, in the crater the Showdown left (a secret boss), and in a private server's list */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, B = JU.boss, X = JU.bossfx, C = JU.cut;
const { rnd, lerp, clamp, LINE, TOR } = E, TAU = Math.PI * 2;
const RED = '#ff2440', RO = '255,36,64', FIRE = '255,140,60', BOLT = '170,215,255', WHITE = '255,255,255';
const play = (name, vol, alt, rate = 1) => { if (!sfx.file(name, vol, rate)) alt(); };      // the clip (at home ours, online from where it is posted), or a built sound
sfx.preload(['home-kj-fuga', 'home-kj-kai', 'home-kj-place', 'home-lb-crack', 'home-tdc-boom']);
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const edge = x => clamp(x, -930, 930);
const none = () => {};

/* ================= what he looks like ================= */
const SKIN = '#d6a283', SKIN2 = '#e9b996', INK = '#140a10', ROBE = '#e4ded0', ROBE2 = '#f6f2e7', HAKAMA = '#2b2731', HAKAMA2 = '#3b3644';
let gape = 0;                                         // how far the mouth across his belly is open: it says the words of his fire, and of the chant
const bands = (w, h) => { g.fillStyle = INK; g.fillRect(-w / 2, h * .66, w, 3.2); g.fillRect(-w / 2, h * .79, w, 3.2); };      // the black bands round his forearms
const KING = {
  four: true,                                         // (game.js draws the second pair under the first)
  torso: [ROBE, ROBE2],
  armF: [ROBE, ROBE2, SKIN, SKIN2, .42, bands], armB: ['#bdb6a7', '#cec7b8', '#a87b60', '#ba8b6e', .42, bands],
  legF: [HAKAMA, HAKAMA2, '#18151c', '#24202a', .12], legB: ['#1e1b23', '#28242e', '#100e13', '#18151c', .12],
  chest() {
    // the robe open to the sash: his chest, and the marks across it
    g.fillStyle = SKIN; g.beginPath(); g.moveTo(4, -TOR); g.lineTo(31, -TOR); g.lineTo(31, -25); g.lineTo(16, -25); g.closePath(); g.fill();
    g.strokeStyle = INK; g.lineWidth = 2.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(14, -63); g.quadraticCurveTo(22, -58, 31, -61); g.moveTo(17, -52); g.quadraticCurveTo(24, -48, 31, -50); g.stroke();
    g.strokeStyle = '#c9c2b2'; g.lineWidth = 6; g.beginPath(); g.moveTo(3, -TOR + 1); g.lineTo(15, -26); g.stroke();      // the lapel
    g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(6.5, -TOR + 1); g.lineTo(17.5, -27); g.stroke();
    // the mouth across his belly: lips, teeth and the dark inside, and fire in it when it is open wide
    const m = gape, cx = 24, cy = -35, rw = 6.5 + 1.5 * m, rh = 2.2 + 4.2 * m;
    g.fillStyle = '#6b1020'; g.beginPath(); g.ellipse(cx, cy, rw + 1.6, rh + 1.4, 0, 0, TAU); g.fill();
    g.fillStyle = '#1a0308'; g.beginPath(); g.ellipse(cx, cy, rw, rh, 0, 0, TAU); g.fill();
    if (m > .3) { g.fillStyle = `rgba(255,140,60,${.7 * m})`; g.beginPath(); g.ellipse(cx, cy + rh * .2, rw * .55, rh * .45, 0, 0, TAU); g.fill(); }
    g.fillStyle = '#f3ece0';
    for (let i = -2; i <= 2; i++) { const tw = 1.6 + m * 1.6; g.fillRect(cx + i * 2.5 - .9, cy - rh, 1.8, tw); g.fillRect(cx + i * 2.5 - .9, cy + rh - tw, 1.8, tw); }
    g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.ellipse(cx, cy, rw + 1.6, rh + 1.4, 0, 0, TAU); g.stroke();
    // the sash with its red cord and its knot, and the hakama under it
    g.fillStyle = HAKAMA; g.fillRect(-30, -13, 60, 19); g.fillStyle = HAKAMA2; g.fillRect(12, -13, 18, 19);
    g.fillStyle = '#2a2026'; g.fillRect(-30, -25, 60, 12); g.fillStyle = '#9a1c2c'; g.fillRect(-30, -20, 60, 2.2);
    g.fillStyle = '#2a2026'; g.beginPath(); g.roundRect(18, -29, 9, 18, 2); g.fill(); g.lineWidth = 1.4; g.strokeStyle = INK; g.stroke();
    g.lineCap = 'butt';
  },
  back() {                                            // the robe's collar, standing up behind his neck
    g.fillStyle = '#d4cdbd'; g.beginPath(); g.roundRect(-27, -TOR - 7, 30, 13, 5); g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
  },
  head() {
    E.headBase(SKIN, SKIN2);
    // the second face, on the side of his head: a face of its own laid over it, brow, cheek and jaw; an eye open and red with a lesser one
    // under it, marks running down from them, and a grin that reaches back to where an ear would be
    g.fillStyle = '#c48d6f'; g.beginPath();
    g.moveTo(-21, -10); g.quadraticCurveTo(-12, -14, -2.5, -10); g.quadraticCurveTo(-.5, 2, -2.5, 14); g.quadraticCurveTo(-10, 21.5, -19, 16.5); g.quadraticCurveTo(-23.5, 4, -21, -10);
    g.closePath(); g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
    g.fillStyle = '#f2ebe0'; g.beginPath(); g.ellipse(-11.5, -3.5, 4.6, 3, 0, 0, TAU); g.fill();
    g.fillStyle = '#d0102a'; g.beginPath(); g.arc(-10.6, -3.5, 2.3, 0, TAU); g.fill(); g.fillStyle = INK; g.fillRect(-11.1, -5.9, 1.1, 4.8);
    g.beginPath(); g.ellipse(-11.5, 3.2, 2.8, 1.2, 0, 0, TAU); g.fill();
    g.strokeStyle = INK; g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath();
    g.moveTo(-17.5, -8); g.lineTo(-5.5, -8.5); g.moveTo(-17, 0); g.lineTo(-19, 6); g.moveTo(-5.5, 0); g.lineTo(-4, 5.5); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = '#2a0610'; g.beginPath(); g.moveTo(-20, 9.5); g.quadraticCurveTo(-11, 19.5, -2.5, 9); g.quadraticCurveTo(-11, 12.5, -20, 9.5); g.fill();
    g.fillStyle = '#f2ebe0'; for (let i = 0; i < 6; i++) g.fillRect(-18 + i * 2.9, 10.2 + Math.sin(i / 5 * Math.PI) * 2, 1.6, 2.2);
    // the hair: pale pink, spiked, swept back off both faces
    g.fillStyle = '#f2b6be'; g.beginPath();
    g.moveTo(-24, -8); g.lineTo(-37, -17); g.lineTo(-27, -22); g.lineTo(-40, -33); g.lineTo(-23, -31); g.lineTo(-30, -47); g.lineTo(-10, -35);
    g.lineTo(-11, -52); g.lineTo(4, -36); g.lineTo(9, -49); g.lineTo(15, -32); g.lineTo(26, -36); g.lineTo(23, -21); g.lineTo(27, -14);
    g.lineTo(17, -17); g.lineTo(10, -13); g.lineTo(2, -17); g.lineTo(-6, -13); g.lineTo(-14, -17); g.lineTo(-20, -12); g.closePath();
    g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
    // his own face: four eyes, red over black, a band across the brow and the marks down his cheeks
    g.fillStyle = '#d0102a'; g.beginPath(); g.ellipse(6, 1, 2.1, 3.1, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(17.5, 1, 1.7, 3.1, 0, 0, TAU); g.fill();
    g.fillStyle = INK; g.beginPath(); g.ellipse(6, 9, 3, 1.5, .15, 0, TAU); g.fill(); g.beginPath(); g.ellipse(17.5, 9, 2.5, 1.5, -.15, 0, TAU); g.fill();
    g.strokeStyle = INK; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath();
    g.moveTo(1, -9); g.lineTo(23, -10); g.moveTo(9, -9); g.lineTo(11.5, -4.5); g.lineTo(14, -9);
    g.moveTo(1, 13); g.lineTo(5, 19); g.moveTo(14, 13); g.lineTo(16.5, 19.5);
    g.moveTo(8, 17.5); g.quadraticCurveTo(14, 20, 21, 16);
    g.stroke(); g.lineCap = 'butt';
  }
};

Fi.DEFS.heian = { name: 'King of Jujutsu', jp: '呪術の王', skin: KING, hp: 5000, scale: 1.22, speed: 310, range: 250, gap: [.3, .75], dr: .8,
  atk: [{ pre: 'hookWind', pose: 'hook', wind: .3, lunge: 460, reach: 250, dmg: 11, kb: 480, stun: .45 },
        { pre: 'kickWind', pose: 'kick', wind: .38, lunge: 480, reach: 265, dmg: 14, kb: 720, lift: 620 },
        { pre: 'crushWind', pose: 'crush', wind: .45, lunge: 400, reach: 270, dmg: 17, kb: 780, lift: 680 }] };
X.TH.heian = ['slash', RO, '255,190,120'];             // (bossfx.js: what his body gives off, and what his blows throw off)

// what is his own in this fight: how far through the chant he is, and how long he has been kept off his feet
const king = o => !!(o && o.ai && o.ai.d.kit && o.ai.d.kit.king);
const st = o => o.kj || (o.kj = { chant: 0, lock: 0, voiceT: -99 });
const lvl = o => (king(o) ? Math.min(2, st(o).chant) : 0);
let lastDash = -9;

/* ================= the pieces ================= */
// a blade of air thrown the length of the arena at height y, r tall: what it passes through parts behind it, and the floor under it is gashed.
// Jump the low ones, dash through the rest
function cutter(o, y, a, q = {}) {
  const dir = o.face, r = q.r || 120, speed = q.speed || 2700, tilt = q.tilt || 0, x0 = o.x + dir * 90;
  B.add({ life: 2600 / speed, x: x0, upd(h, dt) {
    const p = E.P1;
    h.x += dir * speed * dt;
    if (!h.hit && Math.abs(p.x - h.x) < 50 + r * .25 && p.y < y + r * .5 && p.y + 290 > y - r * .5 && Fi.hurt(dir, a, B.mul())) {
      h.hit = 1; C.dice(p, q.big ? 4 : 2, 240, !!q.big);
      if (q.big) { C.frame(.1, p.x, p.y + 160); C.stamp('解', p.x, p.y + 330, 180); }
    }
    if (Math.random() < dt * 70) X.emit(1, h.x - dir * rnd(0, 140), y + rnd(-r, r) * .4, dir * rnd(300, 900), rnd(-60, 60), rnd(2, 4), rnd(.12, .25), RO);
    return Math.abs(h.x) < 1500;
  }, draw(h) {
    const rot = (dir > 0 ? 0 : Math.PI) - tilt * dir;
    for (const [back, al] of [[110, .22], [55, .45], [0, 1]]) { const c = F(h.x - dir * back, y); C.blade(c[0], c[1], rot, r * c[2], 1.2, al, .5); }
  } });
  C.arc(o.x, y + 30, dir, r * .9, tilt);              // the swing that threw it
  C.slice(o.x + dir * 620, y, (dir > 0 ? 0 : Math.PI) + tilt * .3, q.len || 1150, { shift: q.big ? 13 : 8, w: q.big ? 1.4 : .9, delay: .05 });
  C.gash(o.x + dir * 160, rnd(-70, 70), o.x + dir * 1150, rnd(-70, 70), q.big ? 9 : 6, 2.4);
}
// a bolt of Kamutoke's: out of the sky onto the mark
function bolt(x, w, a, big, loud) {
  const p = E.P1;
  X.lightning(x + rnd(-60, 60), 1500, x, 0, BOLT, big ? .42 : .26, big ? 9 : 5, 3);
  X.lightning(x + rnd(-140, 140), 1500, x + rnd(-20, 20), 0, BOLT, .2, 3, 2);
  X.flash('215,235,255', big ? .42 : .2, big ? .3 : .16);
  X.boom(x, 30, big ? 170 : 80, BOLT, { n: big ? 26 : 10, clean: true, shake: big ? 34 : 14 });
  X.shock(x, w * 2.4, BOLT, .45, 9); V.crack(x, big ? 320 : 150); X.decal('scorch', x, w, BOLT, 6);
  if (big) X.pillar(x, 130, 1500, BOLT, .55);
  if (loud) play('home-lb-crack', big ? .9 : .5, () => sfx.thunder()); else sfx.skyCrack();
  if (big || p.ps !== 'air') B.burst(x, w, a, 560);      // (one that has thrown him is not hit again by the next in line: only the last one)
}
// Furnace, where it lands: most of the arena goes up, and then the floor stays on fire
function furnace(x, f) {
  sfx.fuga(); play('home-tdc-boom', .9, () => sfx.blast());
  X.boom(x, 120, 260, FIRE, { n: 40, shake: 44, flash: .45, life: .8 });
  C.blaze(x, 560, 680, 1.7, 21); C.web(x, 460, 3.6); C.cubes(x, 40, 14, 1.4);
  V.crack(x, 480); V.rocks(x, 0, 24); E.addBlast(x, 150, FIRE, 1000);
  X.pillar(x, 170, 1300, FIRE, 1.1); X.decal('crater', x, 360, FIRE, 10, 0);
  for (let i = 1; i <= 3; i++) for (const s of [-1, 1]) B.later(i * .09, () => { X.pillar(x + s * i * 175, 70, 760, FIRE, .8); X.boom(x + s * i * 175, 40, 90, FIRE, { n: 8, flash: 0, shake: 0, clean: true }); });
  E.zoomIn(.55);
  B.burst(x, 520, { dmg: 42, kb: 960, lift: 780, fire: 1 }, 800, f);
  B.add({ life: 2.6, upd(h, dt) {
    const p = E.P1;
    if ((h.tick = (h.tick || 0) - dt) <= 0 && Math.abs(p.x - x) < 420 && p.y < 70) { h.tick = .3; Fi.chip(2.5 * B.mul(), '#ff8c50'); }
    if (Math.random() < dt * 40) X.emit(0, x + rnd(-420, 420), rnd(0, 40), rnd(-20, 20), rnd(100, 300), rnd(40, 90), rnd(.3, .6), FIRE, { s1: .3 });
  }, under(h) {
    const u = 1 - h.t / h.life;
    for (let i = 0; i < 7; i++) C.tongue(x + (i - 3) * 120 + Math.sin(i * 7.3) * 30, 0, (60 + 40 * Math.sin(E.T * 3 + i)) * u, 46, i * 1.7, Math.min(1, u * 2));
  } });
}
// the two meteors coming down on the mark, and where they meet
function meteors(tx) {
  sfx.bf(); sfx.cut(2.4); play('home-tdc-boom', .8, () => sfx.blast());
  C.slice(tx - 423, 500, -.87, 2600, { shift: 22, w: 2.4, life: .8 }); C.slice(tx + 423, 500, .87, 2600, { shift: 22, w: 2.4, life: .8, delay: .03 });
  X.boom(tx, 80, 230, RO, { n: 36, shake: 42, flash: .4, life: .7 }); C.cubes(tx, 60, 18, 1.5); C.grid(tx, 640, 260, 4, 7, 3.8);
  V.crack(tx, 520); V.rocks(tx, 0, 28); X.decal('crater', tx, 330, RO, 10, 0); C.frame(.2, tx, 200); E.zoomIn(.5);
  B.burst(tx, 300, { dmg: 32, kb: 1000, lift: 820 }, 800);
  for (const s of [-1, 1]) B.wave(tx + s * 140, s, 1500, 1300, { dmg: 10, kb: 420, lift: 520 }, RED);      // and the floor torn open both ways from it: jump those
}
// Recoil's grid: lines across everything on the screen, fixed where they were drawn
function lines() { const xs = []; for (let k = -4; k <= 4; k++) xs.push(cam.x + k * 245 + rnd(-30, 30)); return { xs, ys: [70, 215, 360, 505], cx: cam.x }; }
function drawGrid(G, u) {
  const hot = u > .885, al = Math.min(1, .2 + .7 * u) * (hot ? 1 : .72 + .28 * Math.sin(E.T * 18));
  const line = (a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
  X.lite(() => {
    for (const [w, a, col] of [[hot ? 14 : 8, .3, RO], [hot ? 3.2 : 1.6, 1, hot ? WHITE : RO]]) {
      g.strokeStyle = `rgba(${col},${al * a})`; g.lineWidth = w;
      for (const x of G.xs) line(F(x, -260), F(x, 1400));
      for (const y of G.ys) line(F(G.cx - 1500, y), F(G.cx + 1500, y));
    }
  });
}
// the instant it lands, the way the anime shows a cut landing (as cuts.js's frame does), but along his grid: first white with the grid black
// and the two of them black, then the colour of raw meat with the grid in broad dark strokes and the two of them white
let gf = null, wall = 0;
function drawGridFrame(real) {
  const f = gf, VW = E.VW, VH = E.VH, gy = E.GY - 120;
  if ((f.t += real) >= f.dur) { gf = null; return; }
  const first = f.t < f.dur * .45, line = (a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
  g.save();
  g.fillStyle = first ? '#ffffff' : '#f3cdd3'; g.fillRect(0, 0, VW, VH);
  g.translate(VW / 2, gy - cam.lift); g.scale(cam.zoom, cam.zoom); g.translate(-VW / 2, -gy);
  g.strokeStyle = first ? '#000000' : '#7a0c20'; g.lineWidth = first ? 3 : 18;
  for (const x of f.G.xs) line(F(x, -500), F(x, 1700));
  for (const y of f.G.ys) line(F(f.G.cx - 1900, y), F(f.G.cx + 1900, y));
  const sk = E.flat(first ? '#000000' : '#ffffff');
  for (const p of [E.P2, E.P1]) if (p.alpha === undefined || p.alpha > .05) E.drawFighter(E.over(p, sk));
  g.restore();
}
// it kills: through anything, a guard, a counter, a block, the Infinity itself. Dashing through it as it comes down is what lives
// (or having just dashed, or being on the floor when it went over)
function oneTap(face) {
  const p = E.P1;
  if (p.dead || Fi.fight.paused) return false;
  if (p.dashT > 0 || E.T - lastDash < .32 || p.inv > 0 || p.ps === 'down' || p.ps === 'up') return false;
  const g0 = H.guard; H.guard = null;
  try { return Fi.hurt(face, { dmg: p.hp + 1e4, kb: 1300, lift: 900, exact: 1, shown: p.hp }, 1); } finally { H.guard = g0; }
}
function worldCut(o, G) {
  sfx.bf(); sfx.cut(2.8); shake(44); X.flash(WHITE, .7, .45); X.flash(RO, .35, .8);
  G.xs.forEach((x, i) => C.slice(x, 560, Math.PI / 2, 1700, { shift: 18, w: 1.8, life: .8, delay: i * .012 }));
  G.ys.forEach((y, i) => C.slice(G.cx, y, 0, 3000, { shift: 18, w: 1.8, life: .8, delay: .05 + i * .012 }));
  if (!JU.reduceMotion) gf = { G, t: 0, dur: .32 };
  for (const x of G.xs) C.gash(x, -200, x + rnd(-40, 40), 260, 9, 4);
  E.banner('世界を断つ斬撃', 'WORLD CUTTING SLASH', 'sm');
  const p = E.P1;
  if (oneTap(o.face)) { C.dice(p, 9, 420, true); C.stamp('断', p.x, p.y + 340, 260); }
  else B.say(p, 'DODGED', '#ffffff');
}
// the chant: hands together, the words written over him, the mouth on his belly saying them
function chanting(o, A, kanji) {
  if (A.c) return;
  A.c = 1; sfx.charge(); C.stamp(kanji, o.x, o.y + 430 * (o.scale || 1), 230); X.dim(.55, (A.a.wind || 1) + .6);
}
// Kamutoke itself, held up: a short staff of gold, three prongs at its head and a ring under them, lightning crawling on it
function staff(o) {
  const h = B.fist(o, true), s = o.scale || 1, f = o.face, a = F(h[0], h[1]), b = F(h[0] + f * 18 * s, h[1] + 150 * s), k = a[2];
  const at = u => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)], r = at(.72);
  g.lineCap = 'round';
  g.strokeStyle = LINE; g.lineWidth = 10 * k; g.beginPath(); g.moveTo(a[0], a[1] + 14 * k); g.lineTo(b[0], b[1]); g.stroke();
  g.strokeStyle = '#d8ae46'; g.lineWidth = 6 * k; g.stroke(); g.strokeStyle = '#fff1b4'; g.lineWidth = 2 * k; g.stroke();
  g.strokeStyle = LINE; g.lineWidth = 6 * k; g.beginPath(); g.arc(r[0], r[1], 15 * k, 0, TAU); g.stroke(); g.strokeStyle = '#d8ae46'; g.lineWidth = 3.4 * k; g.stroke();
  for (const d of [-1, 0, 1]) {
    const tip = [b[0] + d * 16 * k, b[1] - (d ? 26 : 36) * k];
    g.strokeStyle = LINE; g.lineWidth = 7 * k; g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(tip[0], tip[1]); g.stroke(); g.strokeStyle = '#e8c45a'; g.lineWidth = 3.6 * k; g.stroke();
  }
  g.lineCap = 'butt';
  X.lite(() => X.glow(BOLT, b[0], b[1] - 20 * k, 300 * k, .65 + .25 * Math.sin(E.T * 30)));
  if (Math.random() < .3) { const w = (h[1] + 150 * s), an = rnd(0, TAU), l = rnd(60, 150); X.lightning(h[0] + f * 18 * s, w, h[0] + f * 18 * s + Math.cos(an) * l, Math.max(0, w + Math.sin(an) * l), BOLT, .08, 2, 0); }
}

/* ================= the moveset ================= */
const CHANT_POSE = [-.04, -.18, 2.25, 2.05, .32, -.32, 0], RAISE = [-.08, -.25, 3.05, .25, .3, -.3, 0], BOW = [-.12, -.08, 1.65, -1.25, .45, -.45, 0];
// Dismantle, as it grows with the chant: [how many blades, the time between them, their heights, how big, what each one does]
const LV = [
  { n: 3, gap: .17, ys: [70, 195, 70], r: 120, a: [9, 9, 13] },
  { n: 5, gap: .13, ys: [70, 200, 70, 200, 135], r: 150, a: [8, 8, 8, 8, 15] },
  { n: 7, gap: .11, ys: [70, 205, 70, 205, 70, 205, 140], r: 175, a: [7, 7, 7, 7, 7, 7, 18] }
];
const TILT = [.15, -.17, .06, -.12, .18, -.06, 0];
const DISMANTLE = { get name() { return ['Dismantle', 'Dismantle: Dragon Scale', 'Dismantle: Twin Meteors'][lvl(E.P2)]; }, cd: 3.6, max: 1400, wind: .42, pre: 'hookWind', when: o => !due(o),
  get dur() { const L = LV[lvl(E.P2)]; return L.n * L.gap + .3; },
  run(o, p, A, t) {
    const L = A.L || (A.L = LV[lvl(o)]), n = Math.floor(t / L.gap);
    o.rate = 46; o.vx = 0; o.target = n >= L.n ? POSE.idle : n & 1 ? POSE.cross : POSE.hook;      // four hands, one after another
    if (!A.v && L !== LV[0]) { A.v = 1; play('home-kj-kai', .9, none); }
    if (n >= L.n || n === A.n) return;
    A.n = n;
    const last = n === L.n - 1;
    sfx.cut(last ? 1.6 : 1.1);
    cutter(o, L.ys[n], last ? { dmg: L.a[n], kb: 560, lift: 560 } : { dmg: L.a[n], kb: 200, stun: .5 }, { r: L.r * (last ? 1.25 : 1), big: last, tilt: TILT[n] });
    if (last && L !== LV[0]) {                         // and once it has grown, the whole arena parted after it
      C.slice(cam.x, 300, o.face > 0 ? .12 : Math.PI - .12, 2600, { shift: 14, w: 1.6, life: .55, delay: .08 });
      X.flash(RO, .18, .25); shake(22);
      if (L === LV[2]) { V.split(o.face > 0 ? -.12 : .12); C.storm(cam.x, 8, true); }
    }
  } };
const OPEN = { name: 'Open', cd: 5.5, min: 240, wind: .5, pre: 'divWind', dur: .7, when: o => !due(o),
  charge(o, p, A) {
    if (!A.c) { A.c = 1; sfx.charge(); C.stamp('開', o.x, o.y + 380 * (o.scale || 1), 150, '#ff8c50'); }
    const h = B.fist(o, true); V.mote(h[0], h[1], 'fire');
  },
  run(o, p, A, t) {
    o.rate = 46; o.target = t < .35 ? POSE.div : POSE.idle;
    if (A.s) return;
    A.s = 1; sfx.whoosh();
    const f = o.face;
    Fi.burning(true, () => B.shot({ x: o.x + f * 110, y: 115, vx: f * 2300, r: 30, life: 1, rgb: FIRE, trail: 'fire', a: { dmg: 16, kb: 700, lift: 540, fire: 1 },
      draw: s => C.arrow(s.x - f * 120, s.y, f, 150),
      hit: s => { X.boom(s.x, s.y, 80, FIRE, { n: 14 }); C.blaze(s.x, 120, 220, .7, 7); sfx.fuga(); } }));
  } };
const FURNACE = { name: 'Furnace', cd: 15, below: .75, min: 280, wind: 1.6, pre: BOW, dur: 1.3, when: o => !due(o),
  charge(o, p, A, u) {
    if (!A.c) {
      A.c = 1; sfx.charge(); sfx.rise(1.5); C.stamp('竈', o.x, o.y + 420 * (o.scale || 1), 210, '#ff8c50');
      V.custom(1.6, v => {                             // fire turning in to his hands, and the arrow drawn out between them, longer the longer he holds it
        if (o.act !== A || o.state !== 'act') return;
        const h = B.fist(o, true), f = o.face, n = Math.min(1, v * 1.25);
        for (let i = 0; i < 5; i++) { const a = E.T * 6 + i * 1.26, r = 130 * (1 - v * .6); C.tongue(h[0] + Math.cos(a) * r, h[1] - 40 + Math.sin(a) * r * .5, 70 + 50 * v, 34, i * 2.1, .85); }
        C.arrow(h[0] - f * 260 * n, h[1], f, 260 * n, Math.min(1, v * 4));
      });
    }
    if (!A.v && u >= .66) { A.v = 1; play('home-kj-fuga', 1, () => sfx.roar(.6)); }      // "Fuga": its last sound comes as he lets go
    if (Math.random() < .6) X.emit(5, o.x + rnd(-200, 200), rnd(0, 60), rnd(-40, 40), rnd(200, 600), rnd(3, 6), rnd(.5, 1), FIRE);
  },
  run(o, p, A, t) {
    const f = o.face;
    o.rate = 40; o.target = t < .4 ? POSE.div : POSE.idle;
    if (!A.s) {
      A.s = 1; sfx.whoosh();
      const far = (p.x - o.x) * f, h = B.fist(o, true), x0 = h[0], y0 = h[1];
      const ex = A.ex = edge(far > -30 && far < 1500 ? p.x : o.x + f * 700);
      V.custom(.34, u => C.arrow(lerp(x0, ex - f * 260, u), lerp(y0, 140, u), f, 260));
      V.custom(.6, u => { for (let i = 0; i < 9; i++) if (i / 9 < Math.min(1, u * 4)) C.tongue(lerp(x0, ex, i / 9), 40, 110 * (1 - u), 40, i * 1.3, 1 - u); });
    }
    if (A.done || t < .34) return;
    A.done = 1;
    Fi.burning(true, () => furnace(A.ex, f));
  } };
const CLEAVE = { name: 'Cleave', cd: 6.5, max: 820, wind: .38, pre: 'hookWind', dur: 1.25, when: o => !due(o), run(o, p, A, t) {
  const gap = (p.x - o.x) * o.face;
  o.rate = 44;
  if (A.done !== undefined || t > .34) { o.vx = 0; o.target = A.done !== undefined && t < A.done + .5 ? POSE.jab : POSE.idle; return; }
  o.target = POSE.dash; o.vx = gap > 170 ? o.face * 2100 : 0;
  if (gap < 260 && B.swing(o, 260, { dmg: 6, kb: 0, stun: 1.6 }, 300)) {
    A.done = t; o.vx = 0; o.pose = POSE.jab.slice();     // his hand is on him
    const face = o.face;
    sfx.cut(1.3); C.dice(p, 7, 300); C.stamp('捌', p.x, p.y + 340, 200); V.ring(p.x - face * 30, p.y + 165, 120, RED, .2);
    for (let i = 1; i <= 4; i++) B.later(i * .09, () => { const q = E.P1; if (q.ps === 'hurt') { Fi.chip(4 * B.mul(), RED); C.dice(q, 2, 280); sfx.cut(.8); } });
    B.later(.5, () => {
      const q = E.P1;
      if (q.ps !== 'hurt') return;
      Fi.hurt(face, { dmg: 20, kb: 820, lift: 620 }, B.mul());
      sfx.cut(1.9); C.dice(q, 5, 430, true); C.web(q.x, 360); C.frame(.16, q.x, q.y + 160); shake(26);
    });
  }
} };
const AMBUSH = { name: 'Ambush', cd: 8, min: 150, wind: .3, pre: 'crushWind', dur: 1.05, when: o => !due(o), run(o, p, A, t) {
  o.rate = 48; o.vx = 0;
  if (!A.s) {                                         // gone, and behind him
    A.s = 1;
    for (let i = 0; i < 3; i++) X.ghost(o, .5 - i * .12, .35);
    X.dust(o.x, 6); sfx.whoosh(); X.flash('60,0,12', .22, .2);
    let bx = p.x - p.face * 175; if (Math.abs(bx) > 920) bx = p.x + p.face * 175;
    o.x = edge(bx); o.face = p.x >= o.x ? 1 : -1;
    V.slash(o.x, o.y + 200, o.face > 0 ? -.6 : Math.PI + .6, 300, RED, 10); X.shock(o.x, 260, RO, .3, 8);
  }
  if (t < .7) {                                       // four fists, as fast as they come
    const n = Math.floor(t / .075);
    o.target = n & 1 ? POSE.cross : POSE.jab;
    if (n !== A.n) {
      A.n = n; sfx.hit(false);
      const q = E.P1, dx = (q.x - o.x) * o.face;
      E.fx.push({ k: 4, x: o.x + o.face * 95, y: o.y + 150 + rnd(-50, 70), face: o.face, r: 80, col: 'rgba(255,60,90,.85)', t: 0, life: .16 });
      if (!A.hit) { if (B.swing(o, 270, { dmg: 5, kb: 60, stun: 1 }, 300)) A.hit = 1; }
      else if (q.ps === 'hurt' && dx > -30 && dx < 330) { Fi.chip(2 * B.mul(), RED); q.stun = Math.max(q.stun, .3); E.addSpark(q.x, q.y + 150 + rnd(-60, 60), '#ff8c9a', 70); }
    }
    return;
  }
  o.target = t < .9 ? POSE.crush : POSE.idle;
  if (A.smash) return;
  A.smash = 1; sfx.blast(); shake(24); X.dust(o.x + o.face * 120, 8, o.face); V.crack(o.x + o.face * 150, 220);
  if (B.swing(o, 300, { dmg: 14, kb: 950, lift: 720 }, 320)) { X.flash(RO, .2, .25); C.frame(.12, E.P1.x, E.P1.y + 160); }
} };
const KAMUTOKE = { name: 'Kamutoke', cd: 13, below: .65, wind: .9, pre: RAISE, dur: 2.1, when: o => !due(o),
  charge(o, p, A) { if (!A.c) { A.c = 1; sfx.charge(); X.dim(.55, 3.2); } },
  run(o, p, A, t) {
    o.rate = 30; o.target = t < 1.8 ? RAISE : POSE.idle;
    if (A.s) return;
    A.s = 1; X.flash('200,230,255', .25, .3); sfx.thunder();
    const xs = [-430, -250, -90, 80, 250, 420].map(d => edge(p.x + d + rnd(-40, 40))).sort(() => Math.random() - .5);
    xs.forEach((x, i) => { const at = .45 + i * .14; B.mark(x, 105, at, '#aad7ff'); B.later(at, () => bolt(x, 105, { dmg: 11, kb: 320, lift: 640 }, false, i % 2 === 0)); });
    B.later(1.25, () => { const x = edge(E.P1.x); B.mark(x, 210, .6, '#ffffff'); B.later(.6, () => bolt(x, 210, { dmg: 22, kb: 600, lift: 900 }, true, true)); });
  } };
// the chant, a line at a time. Each comes as soon as he has been hurt far enough, before anything else he has ready
const SCALE = { name: 'Scale of the Dragon', cd: 1e9, below: .85, ok: o => st(o).chant === 0, wind: 1.1, pre: CHANT_POSE, dur: .8,
  charge(o, p, A) { chanting(o, A, '竜鱗'); },
  run(o, p, A, t) {
    o.target = t < .5 ? CHANT_POSE : POSE.idle;
    if (A.s) return;
    A.s = 1; st(o).chant = 1; relabel();
    E.banner('竜鱗', 'SCALE OF THE DRAGON', 'sm'); sfx.bf(); shake(26);
    X.flash(RO, .3, .5); X.shock(o.x, 720, RO, .9, 18); X.pillar(o.x, 150, 1000, RO, 1);
    o.fxRage = (o.fxRage || 0) + 1;
    for (let i = 0; i < 40; i++) X.emit(3, o.x + rnd(-60, 60), o.y + rnd(80, 300), rnd(-900, 900), rnd(-100, 900), rnd(7, 12), rnd(.7, 1.3), i & 1 ? RO : '255,190,120', { g: 900, dr: 1.2, vr: rnd(-12, 12), w: .62, rot: rnd(0, TAU), edge: 'rgba(20,0,6,.7)' });      // scales of it, coming off him
    B.burst(o.x, 330, { dmg: 6, kb: 1050, lift: 420 }, 420);
    B.later(.5, () => B.say(o, 'DISMANTLE EMPOWERED', RED));
  } };
const METEORS = { name: 'Twin Meteors', cd: 1e9, below: .55, ok: o => st(o).chant === 1, wind: 1.2, pre: CHANT_POSE, dur: 1.5,
  charge(o, p, A) { chanting(o, A, '番'); },
  run(o, p, A, t) {
    o.target = t < .9 ? CHANT_POSE : POSE.idle;
    if (A.s) return;
    A.s = 1; st(o).chant = 2; relabel();
    E.banner('番いの流星', 'TWIN METEORS', 'sm'); sfx.charge(); sfx.rise(.75); X.dim(.6, 1.4);
    const tx = edge(p.x);
    B.mark(tx, 300, .75, RED);
    V.custom(.75, u => {                               // two of them out of the sky, one from either side, meeting on him
      const v = u * u;
      for (const s of [-1, 1]) {
        const rot = Math.atan2(1350, -s * 1150);
        for (const [back, al] of [[.12, .25], [.06, .5], [0, 1]]) {
          const w = Math.max(0, v - back), c = F(lerp(tx + s * 1150, tx, w), lerp(1350, 0, w));
          X.lite(() => X.glow(RO, c[0], c[1], 380 * c[2], .5 * al));
          C.blade(c[0], c[1], rot, 210 * c[2], 1.25, al, .5);
        }
        if (Math.random() < .9) X.emit(5, lerp(tx + s * 1150, tx, v) + rnd(-40, 40), lerp(1350, 0, v) + rnd(-40, 40), s * rnd(100, 400), rnd(100, 500), rnd(3, 6), rnd(.3, .6), Math.random() < .5 ? RO : '255,190,120');
      }
    });
    B.later(.75, () => meteors(tx));
    B.later(1, () => B.say(o, 'DISMANTLE EMPOWERED', RED));
  } };
const RECOIL = { name: 'Recoil', cd: 24, below: .35, ok: o => st(o).chant >= 2, wind: 2.6, pre: CHANT_POSE, dur: 1.4,
  charge(o, p, A, u) {
    if (!A.c) {
      A.c = 1; A.beat = 0; E.banner('反発', 'RECOIL', 'sm'); X.dim(.7, 4.4); sfx.charge(); C.stamp('反', o.x, o.y + 430 * (o.scale || 1), 230);
      const G = A.grid = lines();
      V.custom(2.6, v => { if (o.act === A) drawGrid(G, v); });
    }
    const b = u < .3 ? 0 : u < .6 ? 1 : 2;
    if (b > A.beat) { A.beat = b; sfx.beat(b / 2); shake(6 + b * 4); X.flash(RO, .06 + b * .05, .15); }
    if (!A.v && u >= .896) { A.v = 1; play('home-kj-kai', 1, () => sfx.cut(2)); }      // "Kai": its loudest comes as the cut does
  },
  run(o, p, A, t) {
    o.target = t < .4 ? POSE.hook : POSE.idle;        // the hand comes down
    if (A.s) return;
    A.s = 1; st(o).chant = 3;
    worldCut(o, A.grid || lines());
  } };
const CHANTS = [SCALE, METEORS, RECOIL];
for (const m of CHANTS) m.when = o => m.ok(o);
// where the lower arms go in his moves: [front, back]. Out of the way of the mouth on his belly while it speaks; all four on the bow for Furnace
const LOW = new Map([[OPEN, [-.35, .55]], [FURNACE, [2.4, -.9]], [KAMUTOKE, [-.4, .35]], [SCALE, [-.5, .3]], [METEORS, [-.5, .3]], [RECOIL, [-.5, .3]]]);
// kept off his feet too long: whoever is doing it is thrown off him (not one of his set: it is not shown under his health)
const THROW = { name: 'Know Your Place', wind: .06, pre: 'crushWind', dur: .55, run(o, p, A, t) {
  o.target = t < .3 ? POSE.crush : POSE.idle; o.vx = 0;
  if (A.s) return;
  A.s = 1;
  const S = st(o);
  if (E.T - S.voiceT > 14) { S.voiceT = E.T; play('home-kj-place', .95, none); }
  B.say(o, 'KNOW YOUR PLACE', RED); sfx.blast(); shake(26);
  X.shock(o.x, 600, RO, .6, 16); X.flash(RO, .25, .3); V.ring(o.x, o.y + 160, 420, RED, .4); X.dust(o.x, 10);
  B.burst(o.x, 380, { dmg: 8, kb: 1150, lift: 560 }, 500);
} };

B.kit('heian', { tech: 'Shrine', col: RED, glow: 'red', every: [1, 1.8], king: true, moves: [DISMANTLE, OPEN, FURNACE, CLEAVE, AMBUSH, KAMUTOKE, SCALE, METEORS, RECOIL] });
const KIT = Fi.DEFS.heian.kit;
// a line of the chant is due: it goes before anything else he has ready
function due(o) {
  const ai = o.ai;
  if (!ai || !ai.kcd) return false;
  const hp = o.hp / o.max;
  return CHANTS.some(m => hp <= m.below && m.ok(o) && ai.kcd[KIT.moves.indexOf(m)] <= 0);
}
// Dismantle's name under his health, as the chant grows it
function relabel() {
  const strip = E.root.querySelector('.fb.p2 .kit'), i = KIT.moves.indexOf(DISMANTLE);
  if (strip && strip.children[i + 1]) strip.children[i + 1].textContent = DISMANTLE.name;
}

/* ================= wiring ================= */
const tick0 = H.tick, fx0 = H.fx, post0 = H.post, start0 = H.fightStart, reset0 = H.reset;
H.post = dt => { if (post0) post0(dt); const real = Math.min(.05, Math.max(0, E.T - wall)); wall = E.T; if (gf) drawGridFrame(real); };
H.tick = dt => {
  tick0(dt);
  const p = E.P1, o = E.P2;
  if (p.dashT > 0) lastDash = E.T;
  if (!king(o) || o.ko) { gape += (0 - gape) * (1 - Math.exp(-dt * 10)); return; }
  const S = st(o), A = o.state === 'act' && o.act, m = A && A.a;
  o.poise = !!(m && m.run);                           // nothing stops him in the middle of something of his own
  const off = o.state === 'hurt' || o.state === 'air' || o.state === 'down' || o.state === 'up';
  S.lock = off ? S.lock + dt : Math.max(0, S.lock - dt * 2);
  if (S.lock > 3 && o.state === 'hurt' && !Fi.fight.paused && !p.dead) { S.lock = 0; o.state = 'act'; o.act = { a: THROW, t: 0 }; o.tele = 0; o.vx = 0; }
  const open = m && (m === OPEN || m === FURNACE || CHANTS.includes(m)) ? 1 : 0;
  gape += (open - gape) * (1 - Math.exp(-dt * 10));
  // the second pair of arms: following the first, unless the move puts them somewhere (game.js draws them where o.low says)
  const want = m && LOW.get(m), k = 1 - Math.exp(-dt * 14), ps = o.pose, dflt = [ps[2] * .6 - .2, ps[3] * .55 + .45];
  if (want) { if (!o.low) o.low = dflt; for (let i = 0; i < 2; i++) o.low[i] += (want[i] - o.low[i]) * k; }
  else if (o.low) { for (let i = 0; i < 2; i++) o.low[i] += (dflt[i] - o.low[i]) * k; if (Math.abs(o.low[0] - dflt[0]) + Math.abs(o.low[1] - dflt[1]) < .05) o.low = null; }
};
H.fx = dt => {
  fx0(dt);
  const o = E.P2;
  if (king(o) && !o.ko && o.state === 'act' && o.act && o.act.a === KAMUTOKE && o.act.t < KAMUTOKE.wind + 1.85) staff(o);
};
H.fightStart = (cfg, wave) => {
  if (start0) start0(cfg, wave);
  const o = E.P2;
  if (!king(o)) return;
  relabel();                                          // (a fresh go at him starts the chant again: boss.js keeps the strip it already built)
  B.later(1.3, () => { if (!o.ko && E.P2 === o) { st(o).voiceT = E.T; play('home-kj-place', .9, none); } });      // "Know your place"
};
H.reset = () => { reset0(); gape = 0; gf = null; };

JU.heian = { KING, KIT, st, oneTap, get gape() { return gape; } };
})();
