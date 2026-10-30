/* JUJUTSU UNLIMITEDS — early access (Build 0.20): SLIT MOUTH. A curse out of an old story, and one of the strongest a curse user had when he
   was a second year. Tall, a light trench coat belted tight, long black hair hanging over a face wrapped in bandages, eyes that open in the
   hair when she is excited, bandaged hands, and under it all a mouth cut from ear to ear, full of teeth. The user asked for a niche curse,
   "kinda strong", weaker than the Shadow Summoner but stronger than the Kugisaki clan, and left the choice to me. Drawn after the anime's
   stills on the fan wiki (her face, the long coat, her Simple Domain: a corridor of frames running away into white light).
   E AM I PRETTY? (the gimmick, her Simple Domain): time stops for the two of them (the fight waits), the place becomes her corridor, and
     neither may lift a hand until her question is answered. The player answers for them, 1, 2 or 3 (or the buttons):
       1 YES: she is pleased. For eight seconds everything she does lands 30% harder, and she mends a little (12)
       2 NO: not her type. Shears all round them, and they close: 4 x10, and a bleed
       3 SO-SO: she pulls the bandage off her mouth and asks again, HOW ABOUT NOW?, and this time they answer for themselves. NO: they are
         cut in half (65). YES: their mouth is cut to match hers (20 and a bleed), and a curse with moves of its own cannot use them for six seconds
     Nothing picked in four seconds and they answer on their own. A duel's other player cannot be stopped, so there they answer at once
   1 SCISSOR RAIN: five pairs of shears flung in a fan, snapping as they go: 6 each
   2 SLIT: in, with a big pair of shears, and shut on them: 32, and a bleed (3 x3)
   3 BANDAGE BIND: the bandages off her hands, out to them and round them: 14, held two seconds, and pulled in to her
   4 SNIP SNIP: hold of them, and shears round them going to work: 5 x8, then a cut across them, 12
   G UNMASKED (Build 0.20v1, the awakening): see its own part below. The user asked for it with thought and speech bubbles of her most famous
     lines and real music from the anime behind it
   Sounds: the snips are clips (myinstants' "Scissor cut" and "scissors Sound": home-slit-* at home), the rest built (sfx.snip, pretty, shear) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, Z = JU.bossfx;
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2, { dot } = JU.tech.tk;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const exact = (o, n) => n / (o.dr || 1);            // a hit worth the stated amount, whatever the target is made of
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const crowd = () => !!(H.foes && H.foes());
const play = (name, vol, alt) => { if (!sfx.file(name, vol) && alt) alt(); };      // a clip (myinstants' online, sounds/home-* at home), or a built one
sfx.preload(['home-slit-snip', 'home-slit-snips', 'home-slit-awk']);
const RED = '#e8344a', RRGB = '232,52,74', BLUE = '#8fd8ff', BRGB = '143,216,255';
const live = o => !!o && !o.ko && !(o.alpha < 1);
const handAt = (f, front) => { const h = E.hand(f, front), s = f.scale || 1; return [f.x + (h[0] - f.x) * s, f.y + (h[1] - f.y) * s]; };
const mid = o => o.y + 170 * (o.scale || 1);
const faceAt = o => [o.x + (o.face || 1) * 13 * (o.scale || 1), o.y + 200 * (o.scale || 1)];      // about where a mouth is
const label = (x, y, n, col, life = 1.3) => E.fx.push({ k: 2, x, y, n, col, t: 0, life });
const gore = () => JU.gore !== false;
const can = (p, o) => p === E.P1 && !!o && !duel() && !o.net && !o.poise && !o.ko;      // may her hands move them about (hers, on a body this game runs)
function blood(x, y, n, dir = 0) { if (gore() && Z) for (let i = 0; i < n; i++) Z.emit(4, x + rnd(-14, 14), y + rnd(-20, 20), dir * rnd(100, 600) + rnd(-260, 260), rnd(-60, 520), rnd(3, 7), 1.5, i % 3 ? '150,8,20' : '200,20,32', { g: 1900, land: 'blood' }); }
function bleed(o, n, each, face) {                  // a cut that goes on bleeding: n more, each, half a second apart
  dot(o, face, n, .5, { dmg: exact(o, each), kb: 0, stun: .15, stop: 0, col: RED, fixed: 1, mute: 1 }, () => blood(o.x, mid(o), 3));
}

/* ================= how she looks ================= */
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.min(255, (n >> 16) * f) | 0},${Math.min(255, (n >> 8 & 255) * f) | 0},${Math.min(255, (n & 255) * f) | 0})`; };
function poly(fill, pts) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
}
const COAT = ['#c9bc9c', '#ddd2b6'], BAND = ['#e6dfcf', '#f4efe4'], TIGHT = ['#26212c', '#342d3c'], HAIR = '#0c0a10';
const look = { eyes: 0, mouth: 0, eyesTo: 0, mouthTo: 0, smile: 0 };      // the eyes in her hair, her mouth (0 shut, 1 wide open); smile: the eyes curved, pleased
function eyeIn(x, y, s, rot) {                      // one of the eyes in her hair: almond, a violet iris
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.beginPath(); g.moveTo(-7, 0); g.quadraticCurveTo(0, -5.5 * (1 - look.smile * .6), 7, 0); g.quadraticCurveTo(0, 5.5 * (1 - look.smile), -7, 0); g.closePath();
  g.fillStyle = '#f1edf6'; g.fill(); g.lineWidth = 1.4; g.strokeStyle = LINE; g.stroke();
  if (look.smile < .7) { g.fillStyle = '#6b5fc0'; g.beginPath(); g.arc(.5, 0, 3.1, 0, TAU); g.fill(); g.fillStyle = '#100c1c'; g.beginPath(); g.arc(.5, 0, 1.4, 0, TAU); g.fill(); }
  g.restore();
}
function mouthOf(open) {                            // the cut mouth: from one cheek to the other, and teeth all along it
  const h = 2 + open * 16;
  g.fillStyle = '#2a0408'; g.beginPath(); g.moveTo(-8, 10); g.quadraticCurveTo(10, 10 - h * .5, 29, 6); g.quadraticCurveTo(10, 10 + h, -8, 10); g.closePath(); g.fill();
  g.lineWidth = 1.6; g.strokeStyle = LINE; g.stroke();
  if (open > .15) {
    g.fillStyle = '#f2ece2';
    for (let i = 0; i < 7; i++) { const x = -5 + i * 4.6, top = 10 - h * .38 * Math.sin((i + .5) / 7 * Math.PI), bot = 10 + h * .7 * Math.sin((i + .5) / 7 * Math.PI); g.beginPath(); g.moveTo(x - 1.8, top); g.lineTo(x + 1.8, top); g.lineTo(x, top + 5 * open); g.closePath(); g.fill(); g.beginPath(); g.moveTo(x - 1.8, bot); g.lineTo(x + 1.8, bot); g.lineTo(x, bot - 5 * open); g.closePath(); g.fill(); }
  }
  g.strokeStyle = '#7a1a22'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(-8, 10); g.lineTo(-13, 12); g.moveTo(29, 6); g.lineTo(31, 9); g.stroke();      // where it was cut, at the ends
}
const SLIT = {
  torso: COAT,
  armF: [COAT[0], COAT[1], BAND[0], BAND[1], .26], armB: [shade(COAT[0], .66), shade(COAT[1], .66), shade(BAND[0], .78), shade(BAND[1], .78), .26],
  legF: [COAT[0], COAT[1], TIGHT[0], TIGHT[1], .5], legB: [shade(COAT[0], .62), shade(COAT[1], .62), shade(TIGHT[0], .7), shade(TIGHT[1], .7), .5],
  chest() {
    g.fillStyle = 'rgba(0,0,0,.16)'; g.beginPath(); g.moveTo(-6, -TOR); g.lineTo(14, -TOR + 34); g.lineTo(30, -TOR); g.closePath(); g.fill();      // the lapels, crossed over
    g.strokeStyle = 'rgba(60,50,30,.6)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-6, -TOR); g.lineTo(14, -TOR + 34); g.lineTo(30, -TOR + 2); g.stroke();
    g.beginPath(); g.moveTo(14, -TOR + 34); g.lineTo(10, 4); g.stroke();
    g.fillStyle = '#5a4c34'; for (const y of [-TOR + 42, -TOR + 56]) { g.beginPath(); g.arc(20, y, 2.2, 0, TAU); g.fill(); }      // buttons
    g.fillStyle = '#9a8a68'; g.fillRect(-30, -20, 60, 8);       // the belt, tied tight
    g.fillStyle = '#857558'; g.beginPath(); g.ellipse(18, -16, 6, 5, 0, 0, TAU); g.fill();
    g.strokeStyle = '#857558'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(18, -14); g.lineTo(14, 2); g.moveTo(19, -14); g.lineTo(25, 1); g.stroke();
  },
  back() {                                          // the hair, long, all the way down her back
    poly(HAIR, [-10, -TOR - 50, -30, -TOR - 26, -38, -TOR + 20, -36, -TOR + 70, -24, -TOR + 84, -16, -TOR + 66, -12, -TOR + 20, -4, -TOR - 30]);
  },
  head() {
    poly(HAIR, [-31, 36, -35, -6, -29, -34, -10, -45, 12, -44, 27, -32, 31, -10, 30, 30, 24, 46, 6, 40, -12, 46, -26, 42]);      // all of it, behind
    E.headBase(BAND[0], BAND[1]);                    // a head wrapped in bandages
    g.strokeStyle = 'rgba(110,98,78,.55)'; g.lineWidth = 1.2;
    for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(-25, -22 + i * 7.5); g.lineTo(27, -27 + i * 7.5 + (i & 1 ? 3 : 0)); g.stroke(); }
    const op = look.mouth;
    if (op < .3) mouthOf(op);
    poly(HAIR, [-30, -38, 26, -40, 31, -14, 29, 36, 23, 40, 20, 12, 15, 42, 10, 8, 4, 40, -2, 6, -8, 38, -14, 4, -22, 36, -30, 12]);      // and over the face, in long strands, the face showing between them
    if (op >= .3) mouthOf(op);                       // (open, the hair parts round it)
    if (look.eyes > .05) {
      const s = look.eyes;
      for (const [x, y, r] of [[-20, -18, -.4], [-6, -30, .1], [10, -24, .3], [24, -8, .6], [-24, 14, -.8], [6, 26, .2], [22, 24, .9], [-12, 30, -.2]]) eyeIn(x, y, .55 + .5 * s, r);
    }
  }
};
Object.assign(POSE, {
  slFling: [.3, -.05, 1.75, .2, .5, -.45, 0],       // the shears flung, the arm out
  slLunge: [.45, .05, 1.55, -.3, .75, -.75, 0],     // in, the shears out in front
  slGrab: [.25, -.1, 1.45, 1.35, .55, -.5, 0],      // both hands on them
  slAsk: [-.08, .25, .8, .6, .32, -.32, 0]          // the head on one side: well?
});

/* ================= shears ================= */
// a pair of them on the screen at (x, y), pointing along ang, open as far as `open` says (0 shut, 1 wide), s their size
function shears(x, y, ang, open, s, a = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s); g.globalAlpha *= a; g.lineJoin = 'round';
  const half = open * .32;
  for (const side of [-1, 1]) {
    g.save(); g.rotate(side * half);
    g.beginPath(); g.moveTo(0, -3.2 * side); g.lineTo(78, -1 * side); g.lineTo(84, 0); g.lineTo(0, 4 * side); g.closePath();      // the blade
    g.fillStyle = '#d9dee8'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = LINE; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1; g.beginPath(); g.moveTo(6, -1.6 * side); g.lineTo(76, -.6 * side); g.stroke();
    g.beginPath(); g.ellipse(-20, side * 9, 11, 7, side * .4, 0, TAU); g.lineWidth = 5; g.strokeStyle = LINE; g.stroke(); g.lineWidth = 3; g.strokeStyle = '#2b2733'; g.stroke();      // its ring
    g.beginPath(); g.moveTo(0, 0); g.lineTo(-12, side * 5); g.lineWidth = 4; g.strokeStyle = '#2b2733'; g.stroke();
    g.restore();
  }
  g.fillStyle = '#8a8f9c'; g.beginPath(); g.arc(0, 0, 3.4, 0, TAU); g.fill(); g.lineWidth = 1.2; g.strokeStyle = LINE; g.stroke();      // the screw
  g.restore();
}
let held = null;                                    // { open, s }: the big pair in her hand, while a move wants it there

/* ================= 1 — Scissor Rain ================= */
const flung = [];                                   // { x, y, vx, vy, t, rot, tg, hit }
const RAIN = { name: 'Scissor Rain', cd: 4, dur: .6, run(p, m, t) {
  p.vx = 0; p.rate = 36; p.target = t < .16 ? POSE.hookWind : t < .42 ? POSE.slFling : POSE.idle;
  if (!m.s) { m.s = 1; look.mouthTo = .4; }
  if (t > .5) look.mouthTo = 0;
  if (m.go || t < .16) return;
  m.go = 1; sfx.whoosh(); sfx.snip(.8);
  const w = handAt(p, true);
  for (let i = 0; i < 5; i++) { const a = (i - 2) * .085; flung.push({ x: w[0], y: w[1], vx: p.face * Math.cos(a) * 1500, vy: Math.sin(a) * 1500 + 60, t: -i * .025, rot: 0, tg: E.P2 }); }
} };
function flungTick(dt) {
  for (let i = flung.length - 1; i >= 0; i--) {
    const q = flung[i];
    q.t += dt; if (q.t < 0) continue;
    q.x += q.vx * dt; q.y += q.vy * dt; q.vy -= 260 * dt; q.rot += dt * 24;
    const o = q.tg, hs = o ? o.scale || 1 : 1;
    if (live(o) && !(o.inv > 0) && o.state !== 'down' && o.state !== 'up' && Math.abs(o.x - q.x) < 60 * hs && q.y > o.y && q.y < o.y + 380 * hs) {
      E.applyHit(o, q.vx > 0 ? 1 : -1, { dmg: exact(o, 6), kb: 90, stun: .35, stop: .03, col: RED, fixed: 1, mute: 1 });
      play('home-slit-snip', .55, () => sfx.snip(.8)); blood(q.x, q.y, 3, Math.sign(q.vx)); V.sparks(q.x, q.y, 'red', 4);
      flung.splice(i, 1); continue;
    }
    if (q.t > .75 || Math.abs(q.x) > 1000 || q.y < 0) { V.sparks(q.x, Math.max(10, q.y), 'white', 3); flung.splice(i, 1); }
  }
}

/* ================= 2 — Slit ================= */
const CUT = { name: 'Slit', cd: 7, dur: .8, run(p, m, t) {
  const o = E.P2, gap = (o.x - p.x) * p.face;
  p.rate = 44; p.vx = t > .1 && t < .32 && gap > 160 && !m.cut ? p.face * 1350 : 0;
  p.target = t < .1 ? POSE.dash : t < .55 ? POSE.slLunge : POSE.idle;
  if (!m.s) { m.s = 1; look.mouthTo = 1; look.eyesTo = 1; sfx.whoosh(); }
  held = { open: t < .3 ? Math.min(1, t / .12) : Math.max(0, 1 - (t - .3) / .05), s: 1.5 };
  if (t > .3 && !m.cut) {
    m.cut = 1; sfx.snip(1.6);
    if (E.tryHit(p, { reach: 270, dmg: exact(o, 32), kb: 420, lift: 200, stun: .8, stop: .14, heavy: 1, col: RED, fixed: 1, mute: 1 })) {
      play('home-slit-snip', 1, () => sfx.snip(1.4)); shake(18); E.zoomIn(.25);
      const c = faceAt(o);
      V.slash(c[0], c[1], p.face > 0 ? -.15 : Math.PI + .15, 260, RED, 12); V.slash(c[0], c[1], p.face > 0 ? -.15 : Math.PI + .15, 300, '#ffffff', 4, .02);
      blood(c[0], c[1], 12, p.face); bleed(o, 3, 3, p.face);
    }
  }
  if (t > .7) { look.mouthTo = 0; look.eyesTo = 0; }
} };

/* ================= 3 — Bandage Bind ================= */
let band = null;                                    // { x, y, u, o, held }: the bandage out of her hand, how far it is out, and who it has
const bound = [];                                   // { o, t, life }: wound round with it
const BIND = { name: 'Bandage Bind', cd: 9, dur: 1.05, run(p, m, t) {
  p.vx = 0; p.rate = 32; p.target = t < .12 ? POSE.divWind : t < .75 ? POSE.div : POSE.idle;
  const o = E.P2, f = p.face;
  if (!m.s) { m.s = 1; sfx.whoosh(); m.tx = live(o) && (o.x - p.x) * f > -40 && Math.abs(o.x - p.x) < 780 ? o : null; band = { u: 0, o: null }; }
  if (!band) return;
  const w = handAt(p, true), tgt = m.tx;
  const reach = tgt ? [tgt.x, mid(tgt)] : [p.x + f * 760, p.y + 200];
  if (t < .32) { band.u = ease(Math.max(0, (t - .12) / .2)); band.x = lerp(w[0], reach[0], band.u); band.y = lerp(w[1], reach[1], band.u); return; }
  if (!m.got) {
    m.got = 1;
    if (tgt && live(tgt) && tgt.state !== 'down' && tgt.state !== 'up' && E.tryHit(p, { reach: 800, dmg: exact(tgt, 14), kb: 0, stun: 2.2, stop: .1, col: '#f4efe4', fixed: 1, mute: 1 })) {
      band.o = tgt; bound.push({ o: tgt, t: 0, life: 2.2 }); sfx.hit(true); label(tgt.x, tgt.y + 430 * (tgt.scale || 1), 'BOUND', '#f4efe4');
    } else band.o = null;
  }
  if (band.o) {                                       // and pulled in to her
    const u = ease(clamp((t - .5) / .28, 0, 1)), q = band.o;
    if (t >= .5 && p === E.P1 && !duel() && !q.net && !q.poise && !q.ko) { if (m.x0 === undefined) m.x0 = q.x; q.x = lerp(m.x0, clamp(p.x + f * 150, -960, 960), u); q.vx = 0; }
    band.x = q.x; band.y = mid(q);
    if (t >= .78 && !m.tug) { m.tug = 1; sfx.whoosh(); E.addDust(q.x); }
  } else { const u = clamp((t - .32) / .25, 0, 1); band.x = lerp(reach[0], w[0], u); band.y = lerp(reach[1], w[1], u); }
  if (t > .95) band = null;
} };
function drawBand(p) {
  if (!band || band.x === undefined) return;
  const w = handAt(p, true), a = F(w[0], w[1]), b = F(band.x, band.y), k = a[2];
  g.save(); g.lineCap = 'round';
  const n = 14, pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * 22 * k * Math.sin(E.T * 9 + u * 6)]); }
  g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])));
  g.strokeStyle = LINE; g.lineWidth = 15 * k; g.stroke(); g.strokeStyle = '#efe8da'; g.lineWidth = 11 * k; g.stroke();
  g.strokeStyle = 'rgba(120,108,88,.6)'; g.lineWidth = 1.5 * k; g.setLineDash([7 * k, 9 * k]); g.stroke(); g.setLineDash([]);
  g.restore();
}
function drawBound(dt) {
  for (let i = bound.length - 1; i >= 0; i--) {
    const b = bound[i], o = b.o;
    if ((b.t += dt) >= b.life || o.ko) { bound.splice(i, 1); continue; }
    if (!duel() && !o.net) { o.vx = 0; if (o.ground && o.state !== 'down') Object.assign(o, { state: 'hurt', stun: Math.max(o.stun || 0, .2), act: null, tele: 0 }); }      // (held where they are)
    const hs = o.scale || 1, a = Math.min(1, (b.life - b.t) * 3);
    for (let j = 0; j < 4; j++) {                     // wound round them, from the knees to the chest
      const c = F(o.x, o.y + (70 + j * 55) * hs), k = c[2] * hs;
      g.save(); g.globalAlpha = a; g.translate(c[0], c[1]); g.rotate((j & 1 ? -.12 : .12));
      g.beginPath(); g.ellipse(0, 0, 44 * k, 12 * k, 0, 0, TAU); g.lineWidth = 11 * k; g.strokeStyle = LINE; g.stroke(); g.lineWidth = 8 * k; g.strokeStyle = '#efe8da'; g.stroke();
      g.restore();
    }
  }
}

/* ================= 4 — Snip Snip ================= */
const ring = [];                                    // { o, t, n, life }: shears all round somebody, closing one after another
function ringOf(o, n, life, big) { ring.push({ o, t: 0, n, life, big: !!big, ph: rnd(0, TAU) }); }
function drawRing(dt) {
  for (let i = ring.length - 1; i >= 0; i--) {
    const r = ring[i], o = r.o;
    if ((r.t += dt) >= r.life) { ring.splice(i, 1); continue; }
    const hs = o.scale || 1, c = F(o.x, mid(o)), k = c[2] * hs, u = r.t / r.life;
    for (let j = 0; j < r.n; j++) {
      const a = r.ph + j / r.n * TAU + u * .6, at = j / r.n * .7, s = clamp((u - at) / .12, 0, 1), rad = (r.big ? 230 : 190) * (1 - .55 * s) * k;
      const x = c[0] + Math.cos(a) * rad, y = c[1] + Math.sin(a) * rad * .85;
      const open = s >= 1 ? 0 : .5 + .5 * Math.sin(E.T * 30 + j);
      shears(x, y, a + Math.PI, open, (r.big ? 1.1 : .8) * k, Math.min(1, u * 8) * (u > .9 ? (1 - u) / .1 : 1));
    }
  }
}
const SNIPS = { name: 'Snip Snip', cd: 12, dur: 2, run(p, m, t) {
  const o = E.P2, f = p.face;
  if (m.got === undefined) {
    if (!m.s) { m.s = 1; look.mouthTo = 1; look.eyesTo = 1; }
    if (t < .08) { p.target = POSE.slGrab; p.vx = 0; return; }
    p.target = POSE.slLunge; p.vx = t < .3 ? f * 1200 : 0;
    const gap = (o.x - p.x) * f;
    if (gap > -30 && gap < 200 && live(o) && o.state !== 'down' && o.state !== 'up') {
      m.got = t; p.vx = 0;
      E.applyHit(o, f, { dmg: exact(o, 5), kb: 0, stun: 2, stop: .1, col: RED, fixed: 1, mute: 1 });
      ringOf(o, 8, 1.5); play('home-slit-snips', .9, () => sfx.snip(1)); m.n = 1;
    } else if (t > .48) { look.mouthTo = 0; look.eyesTo = 0; E.endMove(p); }
    return;
  }
  const s = t - m.got;
  p.vx = 0; p.target = POSE.slGrab;
  if (can(p, o)) { o.vx = 0; if (o.ground && o.state !== 'down') Object.assign(o, { state: 'hurt', stun: Math.max(o.stun || 0, .3), act: null, tele: 0 }); }
  while (m.n < 8 && s >= m.n * .15) {               // and they go to work, one after another
    m.n++;
    if (!o.ko) E.applyHit(o, f, { dmg: exact(o, 5), kb: 0, stun: .6, stop: .02, col: RED, fixed: 1, mute: 1 });
    sfx.snip(.9 + Math.random() * .4); if (m.n % 3 === 0) play('home-slit-snip', .6);
    blood(o.x + rnd(-30, 30), mid(o) + rnd(-50, 50), 3);
  }
  if (s >= 1.3 && !m.fin) {                          // and across them
    m.fin = 1;
    if (!o.ko) E.applyHit(o, f, { dmg: exact(o, 12), kb: 760, lift: 380, stun: .9, stop: .2, heavy: 1, col: RED, fixed: 1, mute: 1 });
    sfx.shear(); play('home-slit-snip', 1); shake(24); E.zoomIn(.3);
    if (JU.cut) { JU.cut.slice(o.x, mid(o), .55, 520, { shift: 10, life: .45, col: RRGB }); JU.cut.slice(o.x, mid(o), -.55, 520, { shift: 10, life: .45, delay: .05, col: RRGB }); }
    blood(o.x, mid(o), 18, f);
    label(o.x, o.y + 440 * (o.scale || 1), 'SNIP SNIP', RED);
  }
  if (s > 1.7) { look.mouthTo = 0; look.eyesTo = 0; E.endMove(p); }
} };

/* ================= E — AM I PRETTY? Her Simple Domain ================= */
const ASK_WAIT = 4, PLEASED_T = 8, PLEASED_POW = 1.3, HEAL = 12, SILENCE_T = 6;
let ask = null, pleased = 0, silenced = null;       // the question under way; how long she is still pleased; { o, t } whose moves are taken from them
const slits = [];                                   // { o, t, life }: mouths cut to match hers
const ui = document.createElement('div');
ui.className = 'pretty';
ui.innerHTML = '<p lang="ja">私、キレイ？</p><div class="ppicks">' + [['1', 'Yes', 'はい'], ['2', 'No', 'いいえ'], ['3', 'So-so', 'ふつう']].map(([k, w, j], i) => `<button type="button" data-ans="${i}"><kbd>${k}</kbd><b>${w}</b><span lang="ja">${j}</span></button>`).join('') + '</div>';
E.root.appendChild(ui);
ui.addEventListener('pointerdown', e => { const b = e.target.closest('[data-ans]'); if (b && ask && ask.phase === 'q1' && ask.pick === undefined) { e.preventDefault(); pick(+b.dataset.ans); } });
const showUI = on2 => ui.classList.toggle('on', !!on2);
const ANS = ['YES.', 'NO.', '...SO-SO.'];
function pick(i) {
  if (!ask || ask.pick !== undefined) return;
  ask.pick = i; ask.pt = ask.t;
  showUI(false); sfx.snip(.6);
  if (ask.o && JU.manga) JU.manga.say(ask.o, ANS[i], { life: 1.2, side: 0, up: 380 });
}
function unpause() { if (ask && ask.paused) { ask.paused = false; Fi.fight.paused = false; } }
const ESP = { name: 'Am I Pretty?', jp: '私、キレイ？', col: RED, get cd() { return unmOn() ? UNM_ECD : 20; }, dur: 12, run(p, m, t) {
  p.vx = 0;
  if (!m.set) {
    m.set = 1;
    const o = E.P2, ok = live(o) && o.state !== 'down' && o.state !== 'up' && Math.abs(o.x - p.x) < 950;
    if (!ok) { label(p.x, p.y + 420, '...', '#cfd6e6'); sfx.pretty(); m.miss = 1; }
    ask = m.a = { t: 0, o: ok ? o : null, phase: ok ? 'open' : 'miss', paused: false, dom: 0 };
    if (ok && !duel() && !crowd() && !Fi.fight.paused) { Fi.fight.paused = true; ask.paused = true; }      // (time stops for the two of them: not in a duel, not in a raid)
    look.eyesTo = 1; E.zoomIn(.6);
  }
  const A = m.a;
  A.t = t;
  p.target = POSE.slAsk; p.rate = 14;
  if (m.miss) { if (t > .8) { look.eyesTo = 0; ask = null; E.endMove(p); } return; }
  const o = A.o;
  if (o && !duel() && !o.net && !o.ko) { o.vx = 0; if (o.ground && o.state !== 'down') Object.assign(o, { state: 'hurt', stun: Math.max(o.stun || 0, .3), act: null, tele: 0 }); if (o.ai) o.ai.t = Math.max(o.ai.t || 0, .5); }      // (neither of them may lift a hand)
  if (A.phase === 'open') {                          // the corridor comes up round them, and the question
    A.dom = Math.min(1, t / .45);
    if (t >= .45) {
      A.phase = 'q1'; A.qt = t;
      if (JU.manga) JU.manga.say(p, 'AM I PRETTY?', { life: 2.6 });
      sfx.pretty(); look.eyesTo = 1;
      if (duel() || !o || o.net) pick(Math.random() * 3 | 0);      // (a duel's other player answers at once)
      else showUI(true);
    }
    return;
  }
  if (A.phase === 'q1') {
    if (A.pick === undefined && t - A.qt >= ASK_WAIT) pick(Math.random() < .45 ? 1 : Math.random() < .6 ? 0 : 2);      // nothing picked: they answer on their own
    if (A.pick === undefined || t - A.pt < .7) return;
    if (A.pick === 0) { A.phase = 'yes'; A.et = t; return yes(p, A); }
    if (A.pick === 1) { A.phase = 'no'; A.et = t; return no(p, A, o); }
    A.phase = 'q2'; A.qt = t;                        // so-so: the bandage off her mouth, and again
    look.mouthTo = 1; look.eyesTo = 1;
    if (JU.manga) JU.manga.say(p, 'HOW ABOUT NOW?', { life: 1.9 });
    sfx.pretty(); shake(8);
    return;
  }
  if (A.phase === 'q2') {
    if (A.p2 === undefined && t - A.qt >= 1.5) { A.p2 = Math.random() < .5 ? 1 : 0; A.pt2 = t; if (JU.manga) JU.manga.say(o, A.p2 ? 'NO...' : 'Y-YES...', { life: 1.1, side: 0, up: 380 }); }
    if (A.p2 === undefined || t - A.pt2 < .7) return;
    A.phase = A.p2 ? 'half' : 'match'; A.et = t;
    return A.p2 ? half(p, A, o) : match(p, A, o);
  }
  // after: the corridor goes, and she comes back to herself
  A.dom = Math.max(0, 1 - (t - A.et) / .3);
  if (t - A.et > (A.phase === 'no' ? 1.1 : A.phase === 'half' ? 1.2 : .9)) { look.mouthTo = 0; look.eyesTo = 0; look.smile = 0; ask = null; E.endMove(p); }
} };
function yes(p, A) {                                 // she is pleased
  unpause(); pleased = PLEASED_T; look.smile = 1; look.eyesTo = 1;
  p.hp = Math.min(p.max, p.hp + HEAL); E.addNum(p.x, p.y + 300, '+' + HEAL, '#9be7a0');
  label(p.x, p.y + 440, 'PRETTY', '#ffd2dc', 1.6); sfx.star && sfx.star(2);
  if (Z) Z.flash('255,210,220', .15, .3);
}
function no(p, A, o) {                               // not her type: shears all round them, closing
  unpause(); look.mouthTo = 1;
  label(o.x, o.y + 470 * (o.scale || 1), 'NOT HER TYPE', RED, 1.4);
  ringOf(o, 10, 1.1, true);
  const n = unmOn() ? 6 : 4;                         // (six of them close while she is unmasked)
  for (let i = 0; i < n; i++) E.after(.3 + i * .14, () => {
    if (o.ko) return;
    const last = i === n - 1;
    E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: exact(o, 10), kb: last ? 520 : 0, lift: last ? 300 : 0, stun: .7, stop: .05, heavy: last ? 1 : 0, col: RED, fixed: 1, mute: 1 });
    play('home-slit-snip', .8, () => sfx.snip(1.2)); blood(o.x, mid(o), 6);
    if (JU.cut) JU.cut.slice(o.x, mid(o), rnd(-1.2, 1.2), 380, { shift: 6, life: .3, col: RRGB });
  });
  E.after(.9, () => { if (!o.ko) bleed(o, 3, 3, o.x >= p.x ? 1 : -1); });
}
function half(p, A, o) {                             // cut in half
  unpause();
  if (!o.ko) E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: exact(o, 65), kb: 300, lift: 200, stun: 1.2, stop: .3, heavy: 1, col: RED, fixed: 1, mute: 1 });
  sfx.shear(); play('home-slit-snip', 1); shake(40); E.zoomIn(.5);
  if (JU.cut) { JU.cut.slice(o.x, mid(o), 0, 900, { shift: 22, life: .7, col: RRGB, w: 2 }); }
  if (JU.cut && JU.cut.frame) JU.cut.frame(.5, o.x, mid(o));
  blood(o.x, mid(o), 30, 1); blood(o.x, mid(o), 20, -1);
  V.custom(.5, u => {                               // one great pair, round their middle, shutting
    const c = F(o.x, mid(o)), k = c[2] * (o.scale || 1);
    shears(c[0] - 150 * k, c[1], 0, Math.max(0, 1 - u * 4), 3.4 * k, 1 - Math.max(0, (u - .6) / .4));
  });
  label(o.x, o.y + 480 * (o.scale || 1), 'CUT IN HALF', RED, 1.6);
}
function match(p, A, o) {                            // yes: then their mouth is cut to match hers
  unpause();
  if (JU.manga) JU.manga.say(p, 'THEN YOU CAN BE PRETTY TOO', { life: 1.6 });
  if (!o.ko) E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: exact(o, 20), kb: 120, stun: 1, stop: .16, heavy: 1, col: RED, fixed: 1, mute: 1 });
  play('home-slit-snip', 1, () => sfx.snip(1.2)); sfx.shear(); shake(20);
  const c = faceAt(o); blood(c[0], c[1], 14, 1); bleed(o, 4, 4, o.x >= p.x ? 1 : -1);
  slits.push({ o, t: 0, life: 9 });
  silenced = { o, t: SILENCE_T };
  label(o.x, o.y + 470 * (o.scale || 1), 'SLIT', RED, 1.5);
}
function drawSlits(dt) {
  for (let i = slits.length - 1; i >= 0; i--) {
    const s = slits[i], o = s.o;
    if ((s.t += dt) >= s.life || o.ko && s.t > 1) { slits.splice(i, 1); continue; }
    const c = faceAt(o), q = F(c[0], c[1]), k = q[2] * (o.scale || 1), f = o.face || 1, a = Math.min(1, (s.life - s.t) * 2), w = Math.min(1, s.t / .2);
    g.save(); g.globalAlpha = a; g.translate(q[0], q[1]); g.scale(f * k, k); g.lineCap = 'round';
    g.strokeStyle = '#5a0610'; g.lineWidth = 4; g.beginPath(); g.moveTo(-14 * w, 2); g.quadraticCurveTo(0, 6, 18 * w, -2); g.stroke();
    g.strokeStyle = '#d0182c'; g.lineWidth = 2; g.stroke();
    g.restore();
  }
}
// her Simple Domain: a corridor of frames running away into white light, the whole picture blue, while the question is open
function drawDomain() {
  const A = ask;
  if (!A || !A.dom) return;
  const cv = g.canvas, W = cv.width, Hh = cv.height, a = A.dom, vx = W * .5, vy = Hh * .43, T = E.T;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a;
  g.fillStyle = '#0a2140'; g.fillRect(0, 0, W, Hh);
  const N = 16, ph = (T * .35) % 1;
  for (let i = N; i >= 0; i--) {                     // the frames, from the nearest, out past the edges, to the furthest, a point of light
    const s = Math.pow((i + ph) / N, 2.1), w = W * .95 * s, h = Hh * 1.05 * s, x = vx - w / 2 + (1 - s) * Math.sin(T * .7) * W * .02, y = vy - h / 2;
    const lum = 1 - s;
    g.fillStyle = `rgb(${18 + 120 * lum | 0},${52 + 150 * lum | 0},${92 + 150 * lum | 0})`; g.fillRect(x, y, w, h);
    g.strokeStyle = `rgba(${200 + 55 * lum | 0},${230 + 25 * lum | 0},255,${.35 + .4 * lum})`; g.lineWidth = Math.max(1, 6 * s * (W / 1280)); g.strokeRect(x, y, w, h);
    g.fillStyle = 'rgba(4,14,30,.35)'; g.fillRect(x, y + h * .9, w, h * .1);      // the floor of each, darker
  }
  const gr = g.createRadialGradient(vx, vy, 0, vx, vy, W * .18);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(220,245,255,.7)'); gr.addColorStop(1, 'rgba(220,245,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
  const edge = g.createLinearGradient(0, 0, W, 0);  // the anime's purple at the edges of it
  edge.addColorStop(0, 'rgba(120,40,140,.45)'); edge.addColorStop(.18, 'rgba(120,40,140,0)'); edge.addColorStop(.82, 'rgba(120,40,140,0)'); edge.addColorStop(1, 'rgba(120,40,140,.45)');
  g.fillStyle = edge; g.fillRect(0, 0, W, Hh);
  g.restore();
}

/* ================= G — UNMASKED (Build 0.20v1): her awakening ================= */
// What every telling of her has: she asks with her face covered, then takes the covering off and asks again. A thought first ("NOBODY EVER
// SAYS YES..."), AM I PRETTY?, the bandages torn off her face and hands, HOW ABOUT NOW?, and then real music from the anime under the rest of
// it (myinstants' "Yuuuuta vs ryu vs oro theme"; sounds/home-slit-awk.mp3 at home), round and round, for thirty seconds. Unmasked: her mouth
// and the eyes in her hair stay open, shears follow her about and snip at whoever she hits (5, a third of the time), her question waits 6
// seconds instead of 20 and a NO closes six pairs of shears instead of four, and whatever she fights is slow with fear (x.75). When it is
// over she thinks it: "...THEY STILL SAY NO."
const UNM_T = 30, UNM_INTRO = 3, UNM_SNIP = .33, UNM_FEAR = .75, UNM_ECD = 6;
let unm = null, watch = 0, shownT = -1;            // { t, intro, paused, music }
const strips = [];                                  // the bandages, torn off, coming down
function unmOn() { return !!unm && !unm.intro; }
function awaken(p) {
  if (unm) return;
  unm = { t: UNM_T, intro: true, paused: false, music: null };
  if (!duel() && !crowd() && !Fi.fight.paused) { Fi.fight.paused = true; unm.paused = true; }      // (the fight waits for it: not a duel's, not a raid's)
  p.inv = Math.max(p.inv || 0, UNM_INTRO + .3);
  p.move = { def: UNMASK, t: 0 };
  E.zoomIn(UNM_INTRO);
  clearInterval(watch); watch = setInterval(() => { if (unm && E.root.dataset.mode !== 'fight') endUnm(true); if (!unm) clearInterval(watch); }, 250);
}
const UNMASK = { name: 'Unmasked', dur: UNM_INTRO, run(p, m, t) {
  p.vx = 0; p.rate = 14;
  p.target = t < 1.45 ? POSE.slAsk : t < 1.75 ? POSE.slGrab : POSE.slAsk;
  if (!m.a) { m.a = 1; if (JU.manga) JU.manga.think(p, 'NOBODY EVER SAYS YES...', { life: 1.2 }); sfx.pretty(); look.eyesTo = .6; }
  if (t >= 1 && !m.b) { m.b = 1; if (JU.manga) JU.manga.say(p, 'AM I PRETTY?', { life: .85 }); look.eyesTo = 1; }
  if (t >= 1.5 && !m.c) { m.c = 1; tear(p); }
  if (t >= 1.75 && !m.d) { m.d = 1; if (JU.manga) JU.manga.say(p, 'HOW ABOUT NOW?', { life: 1.2 }); shake(10); }
  if (t >= 2.75 && !m.e) { m.e = 1; begin(p); }
} };
function tear(p) {                                  // the bandages off her face and hands, all at once
  look.mouthTo = 1; sfx.rip(); sfx.snip(1.4);
  const hs = p.scale || 1;
  for (let i = 0; i < 16; i++) strips.push({ x: p.x + rnd(-34, 34) * hs, y: p.y + rnd(140, 300) * hs, vx: rnd(-460, 460), vy: rnd(250, 760), r: rnd(0, TAU), vr: rnd(-9, 9), t: 0, life: rnd(1.4, 2.6), len: rnd(26, 58) });
  blood(p.x + p.face * 14, p.y + 200 * hs, 6, p.face);
  if (Z) Z.flash(RRGB, .22, .25);
}
function begin(p) {
  unm.intro = false;
  if (unm.paused) { unm.paused = false; Fi.fight.paused = false; }
  E.banner('口裂け', 'UNMASKED'); sfx.shear(); shake(20);
  unm.music = sfx.song('home-slit-awk', 0, 1.2, .55, true);
  shownT = -1;
  void p;
}
function endUnm(quiet) {
  const u = unm;
  if (!u) return;
  unm = null; clearInterval(watch);
  if (u.music) u.music.stop(1.6);
  if (u.paused && Fi.fight.paused) Fi.fight.paused = false;
  look.mouthTo = look.eyesTo = 0;
  if (on()) JU.tech.drain();
  if (!quiet && on() && JU.manga) JU.manga.think(E.P1, '...THEY STILL SAY NO.', { life: 1.6 });
}
const awkEl = document.getElementById('awk');
function awkBar() {                                 // the bar while she is unmasked: the time left
  if (!unmOn() || !on()) return;
  const s = Math.max(0, Math.ceil(unm.t));
  if (s === shownT) return;
  shownT = s; awkEl.style.setProperty('--a', Math.max(0, unm.t / UNM_T)); awkEl.classList.remove('full');
  awkEl.lastElementChild.textContent = 'Unmasked · ' + s + 's';
}
function stripsTick(dt) {
  for (let i = strips.length - 1; i >= 0; i--) {
    const s = strips[i];
    if ((s.t += dt) >= s.life) { strips.splice(i, 1); continue; }
    s.x += s.vx * dt; s.y += s.vy * dt; s.vy -= 900 * dt; s.vx *= Math.exp(-dt * 1.5); s.r += s.vr * dt;
    if (s.y < 4) { s.y = 4; s.vy = 0; s.vx *= .5; s.vr *= .5; }
  }
}
function drawStrips() {
  for (const s of strips) {
    const c = F(s.x, s.y), k = c[2], a = Math.min(1, (s.life - s.t) * 2), L = s.len * k / 2;
    g.save(); g.globalAlpha = a; g.translate(c[0], c[1]); g.rotate(s.r);
    g.beginPath(); g.moveTo(-L, -4 * k); g.quadraticCurveTo(0, -9 * k * Math.sin(s.t * 6), L, -3 * k); g.lineTo(L, 4 * k); g.quadraticCurveTo(0, -1 * k, -L, 4 * k); g.closePath();
    g.fillStyle = '#efe8da'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = LINE; g.stroke();
    g.restore();
  }
}
function snipper(o, face) {                         // a pair of shears that has followed her about, snipping at whoever she has just hit
  E.after(.18, () => {
    if (o.ko) return;
    E.applyHit(o, face, { dmg: exact(o, 5), kb: 0, stun: .25, stop: .02, col: RED, fixed: 1, mute: 1, snipper: 1 });
    sfx.snip(1.1); blood(o.x, mid(o), 3, face);
    const x = o.x + rnd(-40, 40), y = mid(o) + rnd(-60, 60), a = rnd(0, TAU);
    V.custom(.3, u => { const c = F(x, y); shears(c[0], c[1], a, Math.max(0, 1 - u * 3), .9 * c[2], 1 - u); });
  });
}
function vignette() {                               // her corridor's blue, at the edges of everything, while she is unmasked
  const cv = g.canvas, W = cv.width, Hh = cv.height, a = unm.intro ? Math.min(1, (E.P1.move ? E.P1.move.t : 0) / 2.5) : Math.min(1, unm.t / 1.5);
  const gr = g.createRadialGradient(W / 2, Hh * .45, Math.min(W, Hh) * .35, W / 2, Hh * .45, Math.max(W, Hh) * .75);
  gr.addColorStop(0, 'rgba(10,33,64,0)'); gr.addColorStop(1, `rgba(10,33,64,${.55 * a})`);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = gr; g.fillRect(0, 0, W, Hh); g.restore();
}

/* ================= the technique ================= */
const MOVES = { strikes: RAIN, crush: CUT, div: BIND, manji: SNIPS };
JU.tech.add('slit', { name: 'Slit Mouth', jp: '口裂け', mark: '裂', who: 'Am I pretty?', odds: 0, col: RED, glow: 'red', moves: MOVES,
  early: true, gore: true, skin: SLIT, as: ['Slit Mouth', '口裂け'], awaken, awkName: 'Unmasked', awkKeep: true,
  get awkHits() { return !unm; },                   // (unmasked, the bar is the time left: hits do not fill it)
  hint: '<b>1</b> Scissor Rain · <b>2</b> Slit · <b>3</b> Bandage Bind · <b>4</b> Snip Snip · <b>E</b> Am I Pretty?: answer for them with <b>1</b>, <b>2</b> or <b>3</b> · <b>G</b> Unmasked' });
const DEF = JU.tech.TECH.slit, on = () => JU.tech.active === DEF;

/* ---------- wiring ---------- */
const press0 = H.press, pow0 = H.power, ban0 = H.kitBan, tick0 = H.tick, fx0 = H.fx, under0 = H.under, reset0 = H.reset, start0 = H.fightStart;
const hit0 = H.hit, rate0 = H.foeRate, post0 = H.post;
H.hit = (o, face, h) => {                           // unmasked: shears that follow her snip at whoever she hits
  hit0(o, face, h);
  if (on() && unmOn() && !h.snipper && o !== E.P1 && !o.ko && Math.random() < UNM_SNIP) snipper(o, face);
};
H.foeRate = o => (rate0 ? rate0(o) : 1) * (on() && unmOn() ? UNM_FEAR : 1);      // and what she fights is slow with fear
H.post = dt => { if (post0) post0(dt); if (on() && unm) vignette(); };
H.press = (a, inScene) => {                          // while she is asking: 1, 2 and 3 answer for them
  if (!inScene && ask && ask.phase === 'q1' && ask.pick === undefined) {
    const i = { strikes: 0, crush: 1, div: 2 }[a];
    if (i !== undefined) { pick(i); return true; }
    if (a === 'manji' || a === 'ok' || a === 'm1') return true;
  }
  return press0 ? press0(a, inScene) : false;
};
H.power = (h, o) => (pow0 ? pow0(h, o) : 1) * (on() && pleased > 0 && o !== E.P1 ? PLEASED_POW : 1);
H.kitBan = (o, m) => (ban0 ? ban0(o, m) : false) || (!!silenced && silenced.o === o && silenced.t > 0);      // their mouth cut: nothing of theirs that has a name
H.tick = dt => {
  tick0(dt);
  if (pleased > 0 && (pleased -= dt) <= 0) look.smile = 0;
  if (silenced && (silenced.t -= dt) <= 0) silenced = null;
  for (const k of ['eyes', 'mouth']) look[k] += (look[k + 'To'] - look[k]) * (1 - Math.exp(-dt * 12));
  if (strips.length) stripsTick(dt);
  if (!on()) { if (ask) { unpause(); ask = null; showUI(false); } if (unm) endUnm(true); flung.length = 0; band = held = null; return; }
  const p = E.P1;
  if (unm) {                                         // unmasked: the time going, her face open, red about her
    if (p.dead) endUnm(true);
    else if (!unm.intro) {
      unm.t -= dt; awkBar(); look.mouthTo = Math.max(look.mouthTo, .8); look.eyesTo = 1;
      if (Math.random() < dt * 10) V.mote(p.x, p.y + 230, 'red');
      if (unm.t <= 0) endUnm();
    }
  }
  if (ask && !(p.move && p.move.def === ESP)) { unpause(); ask = null; showUI(false); look.eyesTo = look.mouthTo = 0; }      // (cut short)
  if (held && !(p.move && (p.move.def === CUT))) held = null;
  if (band && !(p.move && p.move.def === BIND)) band = null;
  if (flung.length) flungTick(dt);
  if (pleased > 0 && Math.random() < dt * 6) V.mote(p.x, p.y + 250, 'red');
};
H.under = dt => { under0(dt); if (on()) drawDomain(); };
H.fx = dt => {
  fx0(dt);
  drawBound(dt); drawRing(dt); drawSlits(dt); drawStrips();
  if (!on()) return;
  const p = E.P1;
  if (unmOn()) { const c = F(p.x, p.y + 190 * (p.scale || 1)); lit(() => E.glow(E.GLOW.red, c[0], c[1], 380 * c[2], .28 + .08 * Math.sin(E.T * 7))); }
  for (const q of flung) { if (q.t < 0) continue; const c = F(q.x, q.y); lit(() => E.glow(E.GLOW.red, c[0], c[1], 60 * c[2], .4)); shears(c[0], c[1], q.rot * (q.vx > 0 ? 1 : -1), .5 + .5 * Math.sin(q.t * 40), 1.05 * c[2]); }
  drawBand(p);
  if (held) { const w = handAt(p, true), c = F(w[0], w[1]); shears(c[0], c[1], p.face > 0 ? -.15 : Math.PI + .15, held.open, held.s * c[2]); }
};
const clear = () => { flung.length = bound.length = ring.length = slits.length = 0; band = held = null; pleased = 0; silenced = null; look.eyes = look.mouth = look.eyesTo = look.mouthTo = look.smile = 0; if (ask) unpause(); ask = null; showUI(false); };
H.reset = () => { reset0(); clear(); endUnm(true); strips.length = 0; };
H.fightStart = (cfg, wave) => { start0(cfg, wave); clear(); if (!wave) endUnm(true); };      // (unmasked lasts through the waves of one fight)

JU.slit = { SKIN: SLIT, MOVES, esp: ESP,             // (esp: E, especial.js)
  get unmasked() { return unm && { t: +unm.t.toFixed(2), intro: unm.intro, music: !!(unm.music && unm.music.playing) }; },
  get state() { return { ask: ask && { phase: ask.phase, pick: ask.pick, p2: ask.p2, dom: +(ask.dom || 0).toFixed(2), paused: ask.paused }, pleased: +pleased.toFixed(2), silenced: !!silenced, flung: flung.length, bound: bound.length, ring: ring.length, slits: slits.length, strips: strips.length, look: { eyes: +look.eyes.toFixed(2), mouth: +look.mouth.toFixed(2) } }; },
  pick };
})();
