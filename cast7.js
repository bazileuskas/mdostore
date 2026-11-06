/* JUJUTSU UNLIMITEDS — Build 0.32, Season 4: the cast of chapters 31 to 42 (ch3142.js), the Shinjuku Showdown to the end of it. The user's:
   "add s4 and 12 chapter to go with it".
   WHO: the Straw Doll, back at the very end (the eye she lost in Shibuya under a patch, her hammer on her back); Blindfolded Infinity's body
   with the Keeper of the Queen in it (the Stitched One's stitches across the brow, GOJOY). Everybody else is somebody the story already had.
   WHERE: the terminal Blindfolded Infinity finds himself in afterwards (airport: light, tall windows, a plane waiting, the board saying north
   and south), and the street at sundown the Vessel's domain opens onto (dusk: a small town's roofs, power lines, a level crossing).
   WHAT HE IS AS THEY MEET HIM: King of Curses as Shinjuku wears him down (meguna5..7), Mahoraga at Shinjuku (maho5), and the King of Jujutsu
   (heian.js, Build 0.29) as the story finds him: the same set, a fight at a time, with less health than the boss has (king_*).
   WHAT THE CHAPTERS SHOW: two domains raised against each other (clash, domain2.js's own clash), Hollow Purple at two hundred percent, the
   slash that cuts the world (heian.js's), the true form coming back, Mythical Beast Amber, Boogie Woogie and Resonance as what a partner does
   when they step in (script.js: ally.act), and the boy coming back out of him */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, box = E.box, F = E.F, cam = E.cam, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, K6 = JU.cast6, CUT = JU.cut, D = JU.domain;
const { rnd, clamp, ZP } = E, TAU = Math.PI * 2, { orb, beam } = JU.tech.tk;
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.min(255, (n >> 16) * f) | 0},${Math.min(255, (n >> 8 & 255) * f) | 0},${Math.min(255, (n & 255) * f) | 0})`; };
function skin(o) {
  const a = o.a || o.t, a2 = o.a2 || o.t2;
  return { torso: [o.t, o.t2], armF: [a, a2, o.h, o.h2, .22], armB: [shade(a, .62), shade(a2, .62), shade(o.h, .78), shade(o.h2, .78), .22],
    legF: [o.l, o.l2, o.s, o.s2, .16], legB: [shade(o.l, .62), shade(o.l2, .62), shade(o.s, .62), shade(o.s2, .62), .16], chest: o.chest || (() => {}), back: o.back, head: o.head };
}
function poly(fill, pts) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
}
const seg = (...p) => { g.beginPath(); for (let i = 0; i < p.length; i += 4) { g.moveTo(p[i], p[i + 1]); g.lineTo(p[i + 2], p[i + 3]); } g.stroke(); };
const eye = (x, y, rx, ry) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const said = (f, text, col, up = 390) => E.fx.push({ k: 2, x: f.x, y: f.y + up, n: text, col, t: 0, life: 1.4 });
const PALE = ['#e3c8ac', '#f3dcc3'], RUST = '#b8642c', RUST2 = '#d4803e', NAIL = '#c9ccd4', BLOODY = '#ff3048', CYAN = '#7ad7ff', BOLT = '#9fe8ff';
let seed = 3142;
const r = () => (seed = seed * 16807 % 2147483647) / 2147483647;

/* ---------- skins ---------- */
// the Straw Doll: the school's jacket with its gold buttons, a belt of nails, the hammer on her back, and a patch over the eye Shibuya took
const NOBARA = skin({ t: '#1f2438', t2: '#2c3350', h: PALE[0], h2: PALE[1], l: '#232030', l2: '#322d42', s: '#4a2e1c', s2: '#64402a',
  chest() {
    g.fillStyle = '#e2c060'; for (const y of [-60, -42, -24]) { g.beginPath(); g.arc(5, y, 2.6, 0, TAU); g.fill(); }
    g.fillStyle = '#4a3020'; g.fillRect(-30, -10, 60, 6);
    g.fillStyle = NAIL; for (let i = -24; i <= 24; i += 8) g.fillRect(i, -17, 2, 8);
  },
  back() {
    g.save(); g.translate(-15, -TOR + 22); g.rotate(.55);
    g.fillStyle = '#6a4a2a'; g.fillRect(-3, -66, 6, 92); g.lineWidth = 2.5; g.strokeStyle = LINE; g.strokeRect(-3, -66, 6, 92);
    g.fillStyle = '#8a8f9a'; g.fillRect(-15, -80, 30, 15); g.strokeRect(-15, -80, 30, 15);
    g.restore();
  },
  head() {
    poly(RUST, [-31, 24, -33, -16, -22, -34, 2, -39, 22, -33, 31, -16, 31, 12, 26, 24, 21, 6, 17, -12, 6, -16, -6, -12, -15, -4, -21, 8, -23, 24]);      // the bob, behind
    E.headBase(PALE[0], PALE[1]);
    poly(RUST2, [-27, 2, -28, -22, -15, -33, 8, -34, 24, -27, 28, -11, 21, -18, 13, -10, 4, -18, -6, -10, -14, -15, -19, 2]);                           // and the fringe
    g.fillStyle = '#6a3a1a'; eye(17, 2, 2.8, 3.2);
    g.fillStyle = '#15131a'; eye(5, 2, 5.2, 4.6);
    g.strokeStyle = '#15131a'; g.lineWidth = 2; seg(-27, -7, 0, -1, 10, -1, 28, -6);
    g.strokeStyle = LINE; g.lineWidth = 2; seg(10, 15.5, 16, 15.5);
  } });
// Blindfolded Infinity's body, with somebody else behind the eyes: the Stitched One's technique leaves its mark across the brow
const GOJOY = Object.assign({}, K6.GOJO2, { head() {
  K6.GOJO2.head();
  g.strokeStyle = '#5a2830'; g.lineWidth = 1.7; g.lineCap = 'round';
  seg(-24, -12, 27, -14); for (let i = -20; i <= 23; i += 6.5) seg(i, -16.5, i + 1, -9.5);
  g.lineCap = 'butt';
} });

/* ---------- places ---------- */
// the terminal: all light, tall windows the whole length of the wall, a plane waiting out on the apron, and the board over the gates
const airport = {
  sky() {
    const HY = E.HY, VW = E.VW, gr = g.createLinearGradient(0, 0, 0, HY), off = cam.x * .08 + cam.yaw * 500;
    gr.addColorStop(0, '#d8e4ee'); gr.addColorStop(1, '#fbf8ef');
    g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
    const px = VW / 2 + 300 - off * .5, py = HY - 74;
    g.fillStyle = '#ffffff'; g.strokeStyle = 'rgba(60,70,90,.35)'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(px, py, 270, 24, 0, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(px + 196, py - 12); g.lineTo(px + 252, py - 90); g.lineTo(px + 276, py - 90); g.lineTo(px + 246, py - 8); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(px - 24, py + 8); g.lineTo(px + 96, py + 44); g.lineTo(px + 128, py + 44); g.lineTo(px + 64, py + 6); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = 'rgba(60,70,90,.4)'; for (let i = -7; i <= 7; i++) g.fillRect(px - 160 + i * 21, py - 7, 9, 6);
    lit(() => E.glow(E.GLOW.white, VW / 2 - off * .2, HY * .3, VW * 1.2, .5));
    g.fillStyle = 'rgba(40,46,58,.5)';
    for (let i = -7; i <= 7; i++) { const x = VW / 2 + i * 210 - off; g.fillRect(x - 5, 0, 10, HY); }
    g.fillRect(-80, HY * .3, VW + 160, 6);
  },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, '#ece9df'); gr.addColorStop(.4, '#d3cec2'); gr.addColorStop(1, '#8e897f');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 1.5; g.beginPath();
    for (let x = -1400; x <= 1400; x += 140) { const a = P(x, 0, zn), b = P(x, 0, ZP + 560); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    for (const z of [ZP - 100, ZP + 100, ZP + 300]) { const a = P(-1400, 0, Math.max(zn, z)), b = P(1400, 0, Math.max(zn, z)); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
    lit(() => { for (const x of [-700, 0, 700]) { const c = P(x, 0, ZP + 120); E.glow(E.GLOW.white, c[0], c[1], 700 * c[2], .2); } });
  },
  back() {
    const z = ZP + 520;
    for (const x of [-960, -340, 340, 960]) { box(x, 0, z - 40, 440, 48, 60, '#5a6476', '#3e4656', '#6c768a'); box(x, 48, z - 10, 440, 60, 12, '#4c5568', '#353c4c'); }   // rows of seats
    box(0, 330, z, 560, 150, 16, '#1b1f2a', '#10131a');                                                                                // the board
    const c = P(0, 405, z - 10), k = c[2];
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `${Math.round(30 * k)}px Anton, Impact, sans-serif`; g.fillStyle = '#ffd27a'; g.fillText('DEPARTURES   出発', c[0], c[1] - 30 * k);
    g.font = `${Math.round(24 * k)}px Anton, Impact, sans-serif`; g.fillStyle = '#e8eef8'; g.fillText('NORTH  北      ·      SOUTH  南', c[0], c[1] + 18 * k);
    for (const x of [-640, 640]) { const l = P(x, 560, z - 120); lit(() => E.glow(E.GLOW.white, l[0], l[1], 560 * l[2], .24)); }
  },
  front() {}
};
// the Vessel's domain: no walls and no sure hit, only the street he grew up on at sundown, the power lines, and the crossing
const TOWN = Array.from({ length: 16 }, (_, i) => [-1500 + i * 200 + r() * 60, 120 + r() * 70, 50 + r() * 70]);
const dusk = {
  sky() {
    const HY = E.HY, VW = E.VW, gr = g.createLinearGradient(0, 0, 0, HY), off = cam.x * .06 + cam.yaw * 520;
    gr.addColorStop(0, '#24163a'); gr.addColorStop(.5, '#b4523a'); gr.addColorStop(1, '#ffb066');
    g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
    const sx = VW / 2 - 200 - off * .3;
    lit(() => E.glow(E.GLOW.fire, sx, HY - 70, 1000, .75));
    g.fillStyle = '#ffe3a6'; g.beginPath(); g.arc(sx, HY - 70, 66, 0, TAU); g.fill();
    g.fillStyle = '#2a1722';
    for (const [x, w, h] of TOWN) { const X0 = VW / 2 + x - off; g.beginPath(); g.moveTo(X0 - w / 2, HY + 2); g.lineTo(X0 - w / 2, HY - h); g.lineTo(X0, HY - h - w * .32); g.lineTo(X0 + w / 2, HY - h); g.lineTo(X0 + w / 2, HY + 2); g.closePath(); g.fill(); }
    g.strokeStyle = 'rgba(26,14,20,.9)'; g.lineWidth = 2;
    for (let i = -4; i <= 4; i++) {
      const x = VW / 2 + i * 360 - off * 1.4;
      g.fillStyle = '#1c0f16'; g.fillRect(x - 4, HY - 340, 8, 342); g.fillRect(x - 26, HY - 330, 52, 5);
      for (const yy of [-326, -306]) { g.beginPath(); g.moveTo(x - 22, HY + yy); g.quadraticCurveTo(x + 180, HY + yy + 44, x + 338, HY + yy); g.stroke(); }
    }
  },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, '#6a4a48'); gr.addColorStop(.35, '#3a2a30'); gr.addColorStop(1, '#120c10');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    lit(() => { const c = P(-200, 0, ZP + 200); E.glow(E.GLOW.fire, c[0], c[1], 1400 * c[2], .22); });
    const l0 = P(-1400, 0, Math.max(zn, ZP - 140)), l1 = P(1400, 0, Math.max(zn, ZP - 140));
    g.strokeStyle = 'rgba(244,236,220,.55)'; g.lineWidth = 4; g.beginPath(); g.moveTo(l0[0], l0[1]); g.lineTo(l1[0], l1[1]); g.stroke();
    g.strokeStyle = 'rgba(30,22,26,.9)'; g.lineWidth = 5;                                                                    // the rails, across the road
    for (const x of [600, 690]) { const a = P(x, 0, zn), b = P(x - 120, 0, ZP + 560); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    g.lineWidth = 3; for (let z = ZP - 250; z <= ZP + 540; z += 60) { const a = P(560 - (z - ZP) * .14, 0, Math.max(zn, z)), b = P(740 - (z - ZP) * .14, 0, Math.max(zn, z)); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  },
  back() {
    const z = ZP + 480, T = E.T;
    for (const x of [-1100, -560, 980]) box(x, 0, z, 300, 230, 160, '#3a2630', '#24161c', '#4a3038');                     // houses along it
    box(760, 0, ZP + 360, 10, 260, 10, '#e8e2d6', '#b8b0a2');                                                                  // the crossing's post, its lights, its arm
    const on = Math.floor(T * 2) % 2, a = P(742, 238, ZP + 350), b = P(778, 238, ZP + 350);
    for (const [c, l] of [[a, on], [b, !on]]) { g.fillStyle = l ? '#ff3a2a' : '#3a1a18'; g.beginPath(); g.arc(c[0], c[1], 9 * c[2], 0, TAU); g.fill(); if (l) lit(() => E.glow(E.GLOW.red, c[0], c[1], 120 * c[2], .6)); }
    const s = P(760, 120, ZP + 352), t = P(420, 120, ZP + 352);
    g.lineWidth = 7 * s[2]; g.strokeStyle = '#f2ece0'; g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(t[0], t[1]); g.stroke();
    g.strokeStyle = '#d02a22'; g.setLineDash([16 * s[2], 16 * s[2]]); g.stroke(); g.setLineDash([]);
  },
  front() {}
};
Object.assign(JU.chapters.STAGES, { airport: () => airport, dusk: () => dusk });

/* ---------- what he is, as they meet him ---------- */
const SUK = Fi.DEFS.sukuna, MAHO = Fi.DEFS.mahoraga, KING = Fi.DEFS.heian;
const king = hp => Object.assign({}, KING, { hp });
Object.assign(Fi.DEFS, {
  meguna5: Object.assign({}, SUK, { skin: K6.MEGUNA, hp: 1100, dr: .9 }),      // the two domains locked over him (31)
  maho5: Object.assign({}, MAHO, { hp: 760 }),                                  // the wheel, turning towards the Infinity (32)
  meguna6: Object.assign({}, SUK, { skin: K6.MEGUNA, hp: 900, dr: .9 }),       // the last exchange (33)
  meguna7: Object.assign({}, SUK, { skin: K6.MEGUNA, hp: 700 }),               // worn down, against the Thunder God (34)
  king_judge: king(1300), king_blood: king(1300), king_todo: king(1400), king_maki: king(1300), king_void: king(1500), king_dusk: king(1500),
  king_last: king(1100)                                                         // (41: this one is fought to the end)
});
Object.assign(JU.story.WHO, { nobara: ['Straw Doll', '藁人形', '#ff8a5a'] });

/* ---------- what the chapters show ---------- */
// two domains raised against each other, and locked: domain2.js's own clash, seam and all. Again every so often, as long as the fight lasts
// (his breaks, he raises it again). first: the opening has just played (a scene's), so straight in
function clash(p, o, first) {
  const cfg = Fi.fight.cfg, up = () => { D.raise('shrine', { who: o, dur: 30 }); D.raise('void', { who: p, dur: 30 }); };
  const again = n => Fi.later(15000, () => {
    if (Fi.fight.cfg !== cfg || o.ko || p.dead) return;
    if (Fi.fight.paused) { again(n); return; }
    if (!D.open({ who: p, tone: 'blue', vs: { who: o, tone: 'red' }, reveal: up })) up();
    if (n > 1) again(n - 1);
  });
  if (first) up(); else if (!D.open({ who: p, tone: 'blue', vs: { who: o, tone: 'red' }, reveal: up })) up();
  again(2);
}
// Hollow Purple at two hundred percent: Blue and Red brought together in front of him, and let go across the whole of the ward
function purple200(p, hit) {
  const f = p.face, x0 = p.x + f * 140;
  sfx.charge(); shake(16);
  V.custom(1, u => { const s = 26 + 54 * u; orb(x0 - f * 70 * (1 - u), 240, s, 'blue', null); orb(x0 + f * 70 * (1 - u), 240, s, 'red', null); });
  Fi.later(1000, () => {
    sfx.bf(); sfx.blast(); shake(48); V.impact(.45, x0 + f * 500, 230);
    V.custom(1.5, u => { const x = x0 + f * 2600 * Math.min(1, u * 1.3); beam(x0, x, 230, 280, 'purple', .75 * (1 - u * .6)); orb(x, 230, 240 * (1 - u * .3), 'purple', '#14042a'); });
    for (const o of hit || []) if (o) { V.crack(o.x, 640); V.rocks(o.x, 0, 30); E.addBlast(o.x, 200, '157,123,255', 900); o.flash = .3; }
  });
}
// the slash that cuts the world: heian.js's grid and its frame, and one cut straight through him. He goes down, and does not get up
function worldCut(f) {
  const G = JU.heian.lines();
  JU.heian.worldCutFx(G);
  Fi.later(420, () => {
    CUT.slice(f.x, f.y + 120, 0, 1400, { shift: 22, w: 2.4, life: 1.1 });
    V.sparks(f.x, f.y + 120, 'red', 34); shake(30);
    V.custom(2.6, u => { f.target = POSE.down; f.rate = 5; f.alpha = Math.max(0, 1 - Math.max(0, u - .45) * 1.8); }, .25);
  });
}
// the body he wore a thousand years ago, taken back: red light over him, and then the second pair of arms, the second face, the mouth
function trueForm(o) {
  sfx.charge(); shake(18);
  V.custom(1.1, u => lit(() => { const c = F(o.x, o.y + 170); E.glow(E.GLOW.red, c[0], c[1], (300 + 700 * u) * c[2], .8 * u); }));
  Fi.later(1050, () => {
    sfx.bf(); sfx.blast(); shake(42); o.flash = .45;
    V.impact(.35, o.x, 200); V.ring(o.x, 200, 540, '#ff2440', .6); V.sparks(o.x, 220, 'red', 44); V.rocks(o.x, 0, 18);
    o.skin = JU.heian.KING; o.scale = 1.12;
    E.banner('呪いの王', 'THE TRUE FORM', 'sm');
  });
}
// Mythical Beast Amber: everything he has, turned into lightning at once, his body with it
function amber(p) {
  sfx.bf(); sfx.blast(); shake(32); p.flash = .35;
  V.ring(p.x, p.y + 160, 480, BOLT, .55);
  for (let i = 0; i < 14; i++) { const a = rnd(0, TAU), l = rnd(220, 460); V.bolt(p.x, p.y + 170, p.x + Math.cos(a) * l, p.y + 170 + Math.sin(a) * l, BOLT, rnd(.3, .6), rnd(3, 6), '#ffffff'); }
  V.custom(2.6, u => lit(() => { const c = F(p.x, p.y + 160); E.glow(E.GLOW.blue, c[0], c[1], 560 * c[2], .55 * (1 - u)); }));
}
// somebody stepping in out of nowhere: they come in out of the air (alpha 0 to 1), with a clap or a crack to say so
function arrive(f, col = CYAN) { if (!f) return; sfx.gavel(.8); V.ring(f.x, f.y + 160, 230, col, .35); V.sparks(f.x, f.y + 170, 'blue', 12); V.custom(.5, u => { f.alpha = Math.min(1, u * 2); }); }
// Boogie Woogie, from one palm and the right instrument: a clap, and the player and whatever he is fighting are where the other one was.
// It takes it a moment to work out where it is (it is hit as it does)
function boogie(f, o, p) {
  const a = { x: p.x, y: p.y, ground: p.ground }, b = { x: o.x, y: o.y, ground: o.ground };
  sfx.gavel(.75); sfx.hover(); shake(8);
  for (const s of [a, b]) { V.ring(s.x, s.y + 150, 210, CYAN, .3); V.sparks(s.x, s.y + 160, 'blue', 10); }
  if (JU.evasive) { JU.evasive.ghost(p, .3); JU.evasive.ghost(o, .3); }
  Object.assign(p, { x: clamp(b.x, -950, 950), y: b.y, ground: b.ground, vy: 0, vx: 0 });
  Object.assign(o, { x: clamp(a.x, -950, 950), y: a.y, ground: a.ground, vy: 0, vx: 0 });
  p.face = o.x >= p.x ? 1 : -1; o.face = -p.face;
  E.fx.push({ k: 2, x: o.x, y: o.y + 400, n: 'CLAP', col: CYAN, t: 0, life: .7 });
  E.applyHit(o, p.face, { dmg: 6, kb: 60, stun: .7, stop: .05, col: CYAN, mute: 1 });
}
// Resonance: a nail through her straw doll, and whatever has a piece of itself in it feels it in its soul
function nail(f, o) {
  const s = o.scale || 1, x = o.x, y = o.y + 170 * s;
  sfx.hit(true); sfx.blast(); shake(14);
  V.ring(x, y, 220 * s, BLOODY, .3); V.ring(x, y, 130 * s, '#140a10', .26); V.sparks(x, y, 'red', 18);
  CUT.stamp('共', x, y + 200 * s, 200, '#c8102e');
  E.applyHit(o, f.face, { dmg: 14, kb: 120, stun: .6, stop: .1, heavy: 1, col: BLOODY, mute: 1 });
}
// the same, as the scene shows it the first time: the hammer on the nail, and the King of Curses feeling his own finger go
function resonance(o) {
  const s = o.scale || 1;
  sfx.bf(); sfx.blast(); shake(36); o.flash = .4;
  V.impact(.3, o.x, 200); V.ring(o.x, 190, 460, BLOODY, .5); V.ring(o.x, 190, 300, '#140a10', .45); V.sparks(o.x, 200, 'red', 36);
  CUT.stamp('共鳴', o.x, o.y + 380 * s, 260, '#c8102e');
  V.custom(1.6, u => { o.target = POSE.hurt; o.rate = 9; });
}
// the boy coming back out of him: white light, the King fading, and the one he was wearing on his feet in front of him
function separate(o, m) {
  sfx.bf(); sfx.confirm(); shake(28);
  V.impact(.4, o.x, 200); V.ring(o.x, 200, 620, '#ffffff', .8); V.sparks(o.x, 200, 'white', 30);
  V.custom(1.8, u => { o.alpha = Math.max(.25, 1 - u); if (m) m.alpha = Math.min(1, u * 1.4); });
}
// and what is left of him going: to ash, slowly, while he is still talking
function ashes(o) {
  V.custom(3.2, u => {
    o.alpha = Math.max(0, 1 - u * .95);
    if (Math.random() < .5) V.puff('red', o.x + rnd(-60, 60), o.y + rnd(40, 320) * (o.scale || 1), rnd(-40, 40), rnd(120, 260), rnd(14, 30), rnd(.6, 1.1));
  });
}

JU.cast7 = { NOBARA, GOJOY, airport, dusk, clash, purple200, worldCut, trueForm, amber, arrive, boogie, nail, resonance, separate, ashes, said };
})();
