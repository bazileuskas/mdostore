/* JUJUTSU UNLIMITEDS — early access (Build 0.12): RATIO MAN. The Ratio Technique: anything he looks at can be split by a line, seven parts to
   three, and where the line is cut it is weakest. A suit, and a blade like a butcher's wrapped in spotted cloth.
   His strikes: five with the blade, not four. Each lands with a punch of its own (sounds/ratio-hit1..5.mp3, and the swings ratio-swing1..3.mp3:
   cut from "37 hits/punches" by Independent.nu and "Swishes" by artisticdude, OpenGameArt, CC0: free to use, here and online). A copy at home
   can have the Jujutsu Shenanigans hits instead: sounds/jjs-hit1..5.mp3, never on the public site. Hold jump through the chain and the fifth
   is an uppercut; in the air, a slam.
   1 Cleaving Rush: a dash with the blade. 70, and a Broken Limb (evasive.js).
   2 Ratio Kick: a kick with blue in it. 80, and a Broken Limb. With either of them in the air he goes to them instead: two kicks, 30 and 45,
     that keep them up there and break a guard. Straight after his uppercut it is three: a moment to wind it (long enough for them to get out
     with their Evasive), then 25, 25 and 45, the last a second Broken Limb on top of the first.
   3 Collapsed Fist (0.12v1): the hand without the blade, with blue in it. 80 and three stacks of Broken Limb; with a Ratio on him, 120 and five.
     Whatever it lands on, what is above it comes down on top of them. Its punch at home is a clip found online (sounds/home-nanami-punch.mp3,
     myinstants' "Anime Brutal Punch"), and so are his Black Flashes (home-nanami-bf.mp3, "Black Flash SFX"): never on the public site.
   4 is still to come.
   THE CHAIN (Build 0.13): Cleaving Rush's Black Flash opens it, and keeps it open four seconds at a time: a Ratio again (E, and E on the
   red), and Collapsed Fist is a Black Flash, 190; a Ratio again, and Collapsed Fist again, another; and then Ratio Kick, plain, is the last
   of it: 190, and a Black Flash past the ordinary kind (kokusen.js). Its sound at home is the anime's (sounds/home-nanami-final.mp3:
   myinstants' "Mahito Black Flash Effect (Season 2, Episode 20)"), never on the public site.
   RATIO, the passive: E, and a line over his head with a mark on it at seven to three, tilted (never more than 20 degrees either way). E again
   as the ring crosses the red and the Ratio is his for ten seconds: the fifth strike of a chain is a Black Flash, and so is Cleaving Rush,
   which then breaks any guard, and Collapsed Fist lands harder (each of the three once) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, M = E.MOVES, Z = JU.bossfx, Fi = JU.fights, EV = JU.evasive;
const { rnd, clamp, lerp } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk, NANAMI = JU.cast2.NANAMI;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const exact = (o, n) => n / (o.dr || 1);            // a hit worth the stated amount, whatever the target is made of
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const GOLD = '#ffd27a', GRGB = '255,210,122', BLUE = '#4fc3ff', BRGB = '79,195,255', INK = '#ff2440', IRGB = '255,36,64';
const CLOTH = '#efe8d8', CLOTH2 = '#d6ccb6', DOT = '#262a3a', GRIP = '#25201c', GRIP2 = '#4d4138', METER = '#a9a4ae';
const RUSH = 70, RUSH_BF = 105, KICK = 80, AIR = [30, 45], TRI = [25, 25, 30], TRI_MORE = 15, M1D = [4, 4, 4, 5, 8], SLAM = 12, M1_BF = 40;      // what each thing does
const FIST = [80, 3], FIST_R = [120, 5];            // Collapsed Fist: what it does, and how many stacks of Broken Limb; and with a Ratio on him
const FIST_BF = 190, KICK_FIN = 190, CHAIN_T = 4;   // the chain: Collapsed Fist as a Black Flash; the Ratio Kick it ends on; how long each step of it stays open
const UP_T = 1.3, CHARGE = .4, REACH = 900, GAP = .15;      // how long after his uppercut a Ratio Kick still follows it; its wind-up then; how far he goes after them; and between kicks
const RED = .7, TOL = .06, TILT = 20, QTE_CD = 3, ARMED_T = 10;      // the mark, seven to three along; how near the ring has to be to it; the most the line tilts (degrees); after a miss; how long a Ratio lasts
const HOME = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const SOUNDS = ['ratio-hit1', 'ratio-hit2', 'ratio-hit3', 'ratio-hit4', 'ratio-hit5', 'ratio-kick', 'ratio-swing1', 'ratio-swing2', 'ratio-swing3'];
const JJS = ['jjs-hit1', 'jjs-hit2', 'jjs-hit3', 'jjs-hit4', 'jjs-hit5'], NET = ['home-nanami-bf', 'home-nanami-punch', 'home-nanami-final'];
const finalSound = () => { if (!(HOME && sfx.file('home-nanami-final', 1))) { sfx.bf(); sfx.cannon(2); } };      // the chain's last kick
const bfSound = () => { if (!(HOME && sfx.file('home-nanami-bf', 1))) sfx.bf(); };      // his Black Flash: the clip at home, the built one online

/* ================= the blade: longer than his forearm and as wide as a hand, wrapped in pale cloth with dark spots, on a black grip ================= */
// pt(L, v): a point of it on screen, L along it from his fist and v across it (+ the spine, - the edge, whichever way he faces)
function grip(f) {
  const a = f.pose[2] - f.pose[6], w = E.hand(f, true), s = f.face * (f.spin === undefined ? 1 : f.spin), dx = Math.sin(a) * s, dy = -Math.cos(a);
  return (L, v = 0) => F(w[0] + dx * L - dy * v * s, w[1] + dy * L + dx * v * s);
}
function blade(f, lit) {
  const pt = grip(f), k = pt(0)[2];
  const path = pts => { g.beginPath(); pts.forEach(([L, v], i) => { const c = pt(L, v); if (i) g.lineTo(c[0], c[1]); else g.moveTo(c[0], c[1]); }); g.closePath(); };
  const seg = (a, b) => { const p = pt(...a), q = pt(...b); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); };
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if (lit) {                                        // a Ratio on him: the cloth burning gold, or red when it is about to be a Black Flash
    g.globalCompositeOperation = 'lighter';
    for (let L = 30; L <= 150; L += 30) { const c = pt(L, 0); E.glow(E.GLOW[lit], c[0], c[1], (90 + 16 * Math.sin(E.T * 9 + L)) * k, .55); }
    g.globalCompositeOperation = 'source-over';
  }
  // the end of the cloth, loose, trailing off the back of the blade
  const tail = [0, 1, 2, 3].map(i => pt(16 - i * 13, 12 + i * 7 + Math.sin(E.T * 8 + i * 1.3) * (2 + i * 2)));
  g.beginPath(); tail.forEach((c, i) => (i ? g.lineTo(c[0], c[1]) : g.moveTo(c[0], c[1])));
  g.strokeStyle = LINE; g.lineWidth = 10 * k; g.stroke(); g.strokeStyle = CLOTH2; g.lineWidth = 6 * k; g.stroke();
  // the grip, wound in black
  path([[-26, -5.5], [16, -5.5], [16, 5.5], [-26, 5.5]]); g.fillStyle = GRIP; g.fill(); g.lineWidth = 2.5 * k; g.strokeStyle = LINE; g.stroke();
  g.beginPath(); for (let L = -22; L < 14; L += 7) seg([L, -5], [L + 4, 5]); g.strokeStyle = GRIP2; g.lineWidth = 2 * k; g.stroke();
  // the blade: straight along the back, wide all the way, the end cut square and a little slanted, like a cleaver's
  const shape = [[15, -14], [138, -14], [152, -5], [152, 13], [15, 13]];
  path(shape); g.fillStyle = CLOTH; g.fill();
  g.save(); path(shape); g.clip();
  g.fillStyle = CLOTH2; path([[15, 7], [152, 7], [152, 13], [15, 13]]); g.fill();       // the back of it in shadow
  g.beginPath(); for (let L = 22; L < 150; L += 17) seg([L, -14], [L + 9, 13]); g.strokeStyle = 'rgba(150,135,110,.55)'; g.lineWidth = 1.6 * k; g.stroke();      // the turns of the wrapping
  g.fillStyle = DOT;                                // the spots
  for (let L = 24, row = 0; L < 152; L += 12, row++) for (let v = -9 + (row & 1) * 4.5; v < 12; v += 9) { const c = pt(L, v); g.beginPath(); g.arc(c[0], c[1], 2.3 * k, 0, TAU); g.fill(); }
  g.restore();
  path(shape); g.lineWidth = 3 * k; g.strokeStyle = LINE; g.stroke();
  path([[13, -15], [18, -15], [18, 15], [13, 15]]); g.fillStyle = '#3a332d'; g.fill(); g.lineWidth = 2.5 * k; g.strokeStyle = LINE; g.stroke();      // where cloth meets grip, bound tight
  g.restore();
}

/* ================= poses: [lean, head, armF, armB, legF, legB, rot]. The blade points the way his front arm does ================= */
const PZ = {
  rtWind1: [0, 0, 2.7, .5, .3, -.35, 0],         rtCut1: [.38, .05, .95, .9, .6, -.5, 0],       // over, and down
  rtWind2: [.05, 0, .45, .35, .3, -.3, 0],       rtCut2: [.32, -.05, 2.3, .8, .55, -.5, 0],     // and back up
  rtWind3: [-.12, 0, 1.2, 1.9, .3, -.3, 0],      rtCut3: [.45, 0, 1.65, .1, .62, -.52, 0],      // across, level
  rtWind4: [-.2, 0, 3, 1.4, .3, -.35, 0],        rtCut4: [.55, .1, .85, 1.2, .9, -.7, 0],       // a big one, down
  rtWind5: [-.32, -.12, 3.15, 2.5, .2, -.45, 0], rtCut5: [.66, .22, 1.15, 1.5, 1.05, -.72, 0],  // all of him behind it
  rtLow: [.16, 0, .4, .2, .45, -.4, 0],          rtRise: [-.06, -.22, 2.9, 1.9, .5, -.3, 0],    // the uppercut
  rtDrive: [.5, .2, .75, .45, .7, -.5, 0],                                                       // the slam
  rtCrouch: [-.22, 0, .55, .35, .5, -.6, 0],     rtRush: [.6, -.12, 1.5, -.7, 1, -.95, 0],      rtFollow: [.42, 0, 1.05, -.3, .62, -.5, 0],
  rtKick: [-.42, 0, .5, -.8, 1.7, -.12, 0],      rtHigh: [-.55, -.1, .7, -1, 2.35, -.1, 0],     rtAxe: [-.3, .1, .9, -.6, 2.9, -.2, 0]
};
Object.assign(POSE, PZ);                            // (the plain strikes find their poses by name)

/* ================= the strikes: five, the engine's timing and chain (n: 5). Their swings and their hits have sounds of their own ================= */
const swipe = i => () => sfx.swipe(i);
const CUT = (pre, pose, base, i, more) => Object.assign({}, M.m1[base], { pre, pose, n: 5, kick: 0, rt: 1, sw: 'rgba(239,232,216,.9)', whoosh: swipe(i & 1),
  hit: Object.assign({ reach: 196, dmg: M1D[i], kb: 170, stun: .38, stop: .045, col: CLOTH, mute: 1 }, more) });
const CUTS = [CUT('rtWind1', 'rtCut1', 0, 0), CUT('rtWind2', 'rtCut2', 1, 1), CUT('rtWind3', 'rtCut3', 1, 2), CUT('rtWind4', 'rtCut4', 2, 3, { kb: 210, stun: .42, stop: .06 })];
const FIN = Object.assign({}, M.m1[3], { pre: 'rtWind5', pose: 'rtCut5', n: 5, kick: 0, rt: 1, lunge: 330, sw: 'rgba(239,232,216,.95)', whoosh: swipe(2),
  hit: { reach: 210, dmg: M1D[4], kb: 760, lift: 520, stun: .9, stop: .1, heavy: 1, col: CLOTH, mute: 1 } });
const FIN_BF = Object.assign({}, FIN, { sw: 'rgba(255,36,64,.95)', hit: Object.assign({}, FIN.hit, { dmg: M1_BF, kb: 1050, lift: 560, stop: .3, col: INK }) });
const jumping = () => E.keys.has('w') || E.keys.has(' ') || E.keys.has('arrowup');
// jump held through the chain: the fifth comes up from underneath (and a Ratio Kick straight after it is the three-kick one)
let up = null;                                      // his last uppercut that landed: { at, o }
const UP = { m1: 1, n: 5, rt: 1, dur: .62, run(p, m, t) {
  p.rate = 46;
  if (t < .13) { p.target = PZ.rtLow; if (p.ground) p.vx = p.face * 160; return; }
  p.target = t < .44 ? PZ.rtRise : POSE.idle; if (p.ground) p.vx = t < .2 ? p.face * 240 : 0;
  if (!m.sw) { m.sw = 1; sfx.swipe(2); V.slash(p.x + p.face * 110, p.y + 210, p.face > 0 ? 1.2 : Math.PI - 1.2, 380, m.bf ? INK : CLOTH, 13); }
  if (!m.done && t < .28 && E.tryHit(p, { reach: 200, dmg: m.bf ? M1_BF : M1D[4], kb: 80, lift: 1150, stun: .9, stop: m.bf ? .3 : .1, heavy: 1, col: m.bf ? INK : CLOTH, mute: 1 })) { m.done = 1; up = { at: E.T, o: E.P2 }; }
} };
// in the air: the fifth goes down, and so does he
const DOWN = { m1: 1, n: 5, rt: 1, dur: 1.4, run(p, m, t) {
  const o = E.P2;
  p.rate = 46;
  if (m.land !== undefined) { p.vx = 0; p.target = t < m.land + .2 ? PZ.rtDrive : POSE.idle; if (t > m.land + .34) E.endMove(p); return; }
  if (p.ground && t > .02) { m.land = t; p.vy = 0; dent(p, m); return; }
  if (t < .12) { p.target = PZ.rtWind4; p.vy = Math.max(p.vy, 80); p.vx *= .88; return; }      // a moment up there with it raised
  if (!m.aim) { m.aim = 1; p.face = o.x >= p.x ? 1 : -1; sfx.swipe(2); m.vx = clamp((o.x - p.face * 70 - p.x) / Math.max(.1, p.y / 1800), -1500, 1500); }
  p.target = PZ.rtDrive; p.vy = -1800; p.vx = m.vx;
  if (!m.done && E.tryHit(p, { reach: 220, dmg: m.bf ? M1_BF : SLAM, kb: 160, stun: .9, stop: m.bf ? .3 : .12, heavy: 1, col: m.bf ? INK : CLOTH, mute: 1 })) {
    m.done = 1;
    if (!o.poise && !o.ko && !duel()) Object.assign(o, { ground: false, state: 'air', y: Math.max(o.y, 26), vy: -1900, vx: p.face * 160, bounced: false });      // and into the floor ahead of him
  }
} };
function dent(p, m) {                               // where he comes down
  const x = p.x + p.face * 90;
  sfx.blast(); shake(m.done ? 24 : 12);
  V.crack(x, m.done ? 280 : 170); V.rocks(x, 0, m.done ? 10 : 5); V.ring(x, 40, m.done ? 300 : 190, m.bf ? INK : CLOTH, .3);
}
function m1(i) {
  const p = E.P1;
  if (p.skin !== NANAMI) return true;               // in somebody else's body (a clan's): the ordinary strikes
  prime();
  const bf = i === 4 && !!(armed && armed.m1);      // a Ratio on him: the fifth is a Black Flash, whichever fifth it is
  p.move = { def: i < 4 ? CUTS[i] : !p.ground ? DOWN : jumping() ? UP : bf ? FIN_BF : FIN, i, t: 0, bf: bf ? 1 : 0 };
  return false;
}
// one of his strikes has landed
function landed(p, m) {
  const o = E.P2, f = p.face, hs = o.scale || 1, n = m.def === UP || m.def === DOWN ? 4 : m.i, x = o.x - f * 18, y = o.y + 168 * hs;
  sfx.punch(n);
  V.sparks(x, y, 'white', 3 + n);
  if (n < 4) { V.ring(x, y, 60 + 20 * n, CLOTH, .14); return; }
  if (m.bf) { spend('m1'); E.blackFlash(bfSound); weakCut(o); return; }
  E.zoomIn(.25); shake(20); V.ring(x, y, 260, '#ffffff', .25); V.slash(x, y, f > 0 ? -.5 : Math.PI + .5, 340, CLOTH, 12);
}

/* ================= RATIO: the meter, and what it gives ================= */
let qte = null;                                     // the meter while it is up: { t, dur, tilt, res ('hit' | 'miss'), at (where the ring was), rt (since) }
let armed = null;                                   // the Ratio, while it is his: { m1, rush (each a Black Flash still to come), fist (Collapsed Fist harder), t, ang (the line on them) }
let qcd = 0;                                        // seconds before the meter can be called again, after a miss
let nc = null;                                      // the chain, while it is open: { n (Black Flashes so far), t (seconds left for the next), ratio (a Ratio landed since the last) }
const wants = () => !!(nc && !nc.ratio && nc.n < 3);      // the chain is waiting on a Ratio
function call(p) {
  if (armed && !wants()) { shout(p, 'RATIO READY', GOLD); return; }
  if (qte || qcd > 0) return;
  qte = { t: 0, dur: rnd(.85, 1.05), tilt: rnd(-TILT, TILT) * Math.PI / 180, res: null, at: 0, rt: 0 };
  sfx.tick(0);
}
function judge(p) {
  const q = qte;
  q.at = clamp(q.t / q.dur, 0, 1); q.rt = 0;
  if (Math.abs(q.at - RED) <= TOL) {
    q.res = 'hit';
    armed = { m1: true, rush: true, fist: true, t: ARMED_T, ang: (Math.random() < .5 ? -1 : 1) * rnd(.55, 1.05) };
    sfx.tap(1); sfx.charge(); shake(8);
    E.fx.push({ k: 2, x: p.x, y: p.y + 570, n: 'RATIO  7 : 3', col: GOLD, t: 0, life: 1.3 });
    if (Z) Z.flare(p.x, p.y + 480, GRGB, 260, .2);
    if (wants()) { nc.ratio = true; cue('3  ·  COLLAPSED FIST'); }
  } else miss();
}
function miss() { qte.res = 'miss'; qte.rt = 0; qcd = nc ? .6 : QTE_CD; sfx.tap(0); }      // (in the chain there is no time to lose)
const cue = text => E.fx.push({ k: 2, x: E.P1.x, y: E.P1.y + 430, n: text, col: '#ff8a98', t: 0, life: 2 });
// a Black Flash of the chain's has landed: the next is open
function link(n) {
  nc = { n, t: CHAIN_T, ratio: false }; qcd = 0;
  if (n < 3) { E.cd.div = 0; cue('E  ·  RATIO, THEN 3'); } else { E.cd.crush = 0; cue('2  ·  RATIO KICK'); }
  if (n > 1) E.fx.push({ k: 2, x: E.P1.x, y: E.P1.y + 470, n: 'BLACK FLASH  ×' + n, col: GOLD, t: 0, life: 1.4 });
}
function spend(k) {
  if (!armed) return;
  armed[k] = false;
  if (!armed.m1 && !armed.rush && !armed.fist) armed = null;
}
// the line over his head: a long grey rule with marks along it and heavy ends, a red bar at seven to three, and the ring that runs along it
function drawMeter(p) {
  const q = qte, c = F(p.x, p.y + 480), k = c[2], L = 300 * k, u = q.res ? q.at : clamp(q.t / q.dur, 0, 1);
  const a = q.res ? Math.max(0, 1 - q.rt / .45) : Math.min(1, q.t / .06), hit = q.res === 'hit', x = n => -L / 2 + L * n;
  g.save(); g.translate(c[0], c[1]); g.rotate(q.tilt); g.globalAlpha = a; g.lineCap = 'butt';
  g.fillStyle = 'rgba(8,6,14,.42)'; g.beginPath(); g.roundRect(-L / 2 - 22 * k, -26 * k, L + 44 * k, 52 * k, 10 * k); g.fill();      // (a shade behind it, so it reads on anything)
  const rule = (x0, y0, x1, y1, w, col) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.strokeStyle = LINE; g.lineWidth = w + 3 * k; g.stroke(); g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
  rule(x(0), 0, x(1), 0, 3.5 * k, hit ? '#fff4d8' : METER);
  for (let i = 1; i < 20; i++) if (i !== 14) rule(x(i / 20), -(i % 5 ? 5 : 9) * k, x(i / 20), (i % 5 ? 5 : 9) * k, 2 * k, METER);      // the marks
  for (const e of [0, 1]) { g.fillStyle = METER; g.strokeStyle = LINE; g.lineWidth = 2.5 * k; g.beginPath(); g.rect(x(e) - 5 * k, -17 * k, 10 * k, 34 * k); g.fill(); g.stroke(); }      // its ends
  g.fillStyle = hit ? '#ffffff' : '#ff2440'; g.strokeStyle = LINE; g.lineWidth = 2.5 * k;       // seven to three
  g.beginPath(); g.rect(x(RED) - 4 * k, -20 * k, 8 * k, 40 * k); g.fill(); g.stroke();
  if (hit) { g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.gold, x(RED), 0, 160 * k * (1 + q.rt * 2), .9 * a); g.globalCompositeOperation = 'source-over'; }
  const nx = x(u);                                  // the ring
  g.beginPath(); g.arc(nx, 0, 12 * k, 0, TAU); g.fillStyle = 'rgba(8,6,14,.55)'; g.fill();
  g.strokeStyle = LINE; g.lineWidth = 6.5 * k; g.stroke();
  g.strokeStyle = hit ? GOLD : q.res ? '#5d5864' : '#d4d0d8'; g.lineWidth = 3.5 * k; g.stroke();
  g.restore();
}
// with the Ratio on him: the line he sees across them, divided in ten, and the mark where it is weakest
function drawWeak(o) {
  const hs = o.scale || 1, a = armed.ang, L = 125 * hs, cx = o.x, cy = o.y + 172 * hs;
  const p0 = F(cx - Math.cos(a) * L, cy + Math.sin(a) * L), p1 = F(cx + Math.cos(a) * L, cy - Math.sin(a) * L), k = p0[2];
  const at = u => [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)], nx = -(p1[1] - p0[1]), ny = p1[0] - p0[0], d = Math.hypot(nx, ny) || 1;
  const red = armed.m1 || armed.rush || armed.fist, pulse = .5 + .5 * Math.sin(E.T * 9);
  g.save(); g.lineCap = 'round';
  g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.strokeStyle = 'rgba(7,6,12,.6)'; g.lineWidth = 5 * k; g.stroke();
  g.strokeStyle = `rgba(255,236,190,${.7 + .25 * pulse})`; g.lineWidth = 2 * k; g.stroke();
  g.beginPath();
  for (let i = 1; i < 10; i++) { if (i === 7) continue; const c = at(i / 10), s = 5 * k; g.moveTo(c[0] - nx / d * s, c[1] - ny / d * s); g.lineTo(c[0] + nx / d * s, c[1] + ny / d * s); }
  g.stroke();
  if (red) {
    const c = at(RED);
    g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.red, c[0], c[1], (70 + 30 * pulse) * k, .8); g.globalCompositeOperation = 'source-over';
    g.strokeStyle = INK; g.lineWidth = 3 * k; g.beginPath(); g.arc(c[0], c[1], (11 + 4 * pulse) * k, 0, TAU); g.stroke();
    g.beginPath(); const s = 7 * k; g.moveTo(c[0] - s, c[1] - s); g.lineTo(c[0] + s, c[1] + s); g.moveTo(c[0] + s, c[1] - s); g.lineTo(c[0] - s, c[1] + s); g.stroke();
  }
  g.restore();
}
// a Black Flash through the weak point: the line it was, cut
function weakCut(o) {
  const hs = o.scale || 1, a = armed ? armed.ang : .8, x = o.x, y = o.y + 172 * hs;
  V.slash(x, y, -a, 560, INK, 16); V.slash(x, y, -a, 600, '#ffffff', 5, .04);
  V.ring(x, y, 300, INK, .3);
}

/* ================= the moves ================= */
const trail = [];                                   // Cleaving Rush and the kicks' chase: him, a moment ago
const TRAILS = { gold: E.flat('#b8892a', GOLD), red: E.flat('#8a0f22', INK), blue: E.flat('#1d6fb8', BLUE) };
function smear(p, kind) { trail.push({ f: { skin: p.skin, x: p.x, y: p.y, z: p.z, face: p.face, spin: 1, scale: p.scale, pose: p.pose.slice() }, t: 0, kind }); if (trail.length > 12) trail.shift(); }
function rushHit(p, o, bf) {
  const f = p.face, hs = o.scale || 1, x = o.x, y = o.y + 165 * hs, ang = f > 0 ? -.12 : Math.PI + .12;
  sfx.punch(4, 1.1); sfx.cut(1.4); shake(26); E.zoomIn(.35); E.stop(.08);
  V.slash(x, y, ang, 600, bf ? INK : GOLD, 16); V.slash(x, y + 12, ang, 640, '#ffffff', 6);
  V.sparks(x, y, bf ? 'red' : 'gold', 14); V.ring(x, y, 250, bf ? INK : GOLD, .25);
  if (Z) Z.flare(x, y, bf ? IRGB : GRGB, 380, .18);
  if (bf) { spend('rush'); E.blackFlash(bfSound); weakCut(o); if (!o.ko) link(1); }
}
// where his front foot is, near enough, for the light on it
function foot(p) { const a = p.pose[4] - p.pose[6]; return [p.x + p.face * (10 + Math.sin(a) * 99), p.y + 99 - Math.cos(a) * 99]; }
function charge(p, n) { const w = foot(p); for (let i = 0; i < n; i++) V.mote(w[0], w[1], 'blue'); }
function arc(p, y, r) { E.fx.push({ k: 4, x: p.x + p.face * 70, y: p.y + y, face: p.face, r, col: 'rgba(79,195,255,.95)', t: 0, life: .18 }); }
function kickHit(p, o, pow) {
  const f = p.face, hs = o.scale || 1, x = o.x - f * 20, y = o.y + 160 * hs;
  sfx.punch(5, .8 + .3 * pow); shake(12 + 16 * pow);
  V.ring(x, y, 120 + 160 * pow, BLUE, .22); V.sparks(x, y, 'blue', 6 + Math.round(8 * pow));
  V.slash(x, y, f > 0 ? .5 : Math.PI - .5, 260 + 200 * pow, BLUE, 10 + 6 * pow);
  E.addBlast(x, y, BRGB, 120 + 140 * pow);
  if (pow >= 1) { E.zoomIn(.3); E.addRing(o.x, BRGB, 300); if (Z) Z.flare(x, y, BRGB, 420, .2); }
}
// Collapsed Fist landing: blue through them from the point it hit, and then whatever is above them comes down
const slabs = [];
function collapse(p, o, r) {
  const f = p.face, hs = o.scale || 1, x = o.x - f * 20, y = o.y + 165 * hs, seed = Array.from({ length: 8 }, (_, i) => [i / 8 * TAU + rnd(-.25, .25), rnd(.6, 1)]);
  if (!(HOME && sfx.file('home-nanami-punch', 1))) { sfx.punch(5, 1.3); sfx.blast(); }
  shake(30); E.zoomIn(.4); E.stop(.1);
  E.addBlast(x, y, BRGB, 380); V.ring(x, y, 300, BLUE, .3); V.ring(x, y, 180, '#ffffff', .2); V.sparks(x, y, 'blue', 20); V.impact(.12, o.x, y);
  V.custom(.7, u => {                              // the cracks it leaves in them, blue, spreading out from where it landed
    const c = F(x, y), k = c[2], a = u < .7 ? 1 : (1 - u) / .3;
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    for (const [w, col] of [[7, `rgba(79,195,255,${.45 * a})`], [2.5, `rgba(235,250,255,${a})`]]) {
      g.strokeStyle = col; g.lineWidth = w * k; g.beginPath();
      for (const [an, l] of seed) { g.moveTo(c[0], c[1]); for (let j = 1; j <= 3; j++) { const rr = 46 * l * j * k * Math.min(1, u * 5), q = an + Math.sin(j * 5 + an * 3) * .3; g.lineTo(c[0] + Math.cos(q) * rr, c[1] + Math.sin(q) * rr); } }
      g.stroke();
    }
    g.restore();
  });
  if (r) { spend('fist'); weakCut(o); if (Z) Z.flare(x, y, GRGB, 420, .2); }
  const lx = o.x + f * 140;                        // where it is thrown to: it all comes down on top of it there
  for (let i = 0, n = r ? 10 : 7; i < n; i++) slabs.push({ x: lx + rnd(-150, 150), y: rnd(640, 980), vy: rnd(-220, 0), w: rnd(26, 62), h: rnd(16, 38), rot: rnd(0, TAU), vr: rnd(-5, 5), t: -rnd(.08, .4), land: 0 });
  E.after(.5, () => { sfx.slam(1); shake(16); V.crack(lx, 260); E.addDust(lx); });
}
function drawSlabs(dt) {
  for (let i = slabs.length - 1; i >= 0; i--) {
    const s = slabs[i];
    if ((s.t += dt) < 0) continue;
    if (s.t > 1.8) { slabs.splice(i, 1); continue; }
    if (!s.land) { s.vy -= 2600 * dt; s.y += s.vy * dt; s.rot += s.vr * dt; if (s.y <= 0) { s.y = 0; s.land = 1; V.rocks(s.x, 0, 2); E.addDust(s.x); } }
    const c = F(s.x, s.y + s.h * .5), k = c[2], a = Math.min(1, (1.8 - s.t) * 2.5);
    g.save(); g.translate(c[0], c[1]); g.rotate(s.land ? Math.round(s.rot / (Math.PI / 2)) * Math.PI / 2 : s.rot); g.globalAlpha = a;
    g.fillStyle = '#5f5a66'; g.fillRect(-s.w / 2 * k, -s.h / 2 * k, s.w * k, s.h * k);
    g.fillStyle = '#8a8592'; g.fillRect(-s.w / 2 * k, -s.h / 2 * k, s.w * k, s.h * .3 * k);
    g.strokeStyle = LINE; g.lineWidth = 2.5 * k; g.strokeRect(-s.w / 2 * k, -s.h / 2 * k, s.w * k, s.h * k);
    g.restore();
  }
}
const can = o => !o.ko && o.state !== 'down' && o.state !== 'up' && !(o.inv > 0) && !(o.alpha < 1);
const aloft = o => o.state === 'air' || o.y > 40;
const limbs = o => (EV ? EV.stacks(o) : 0);
const odds = o => (!o.ai ? 0 : o.human || o.poise || o.ai.d.kit ? .55 : .3);      // how likely something is to see the three kicks coming and get out
function ground(p, m, t, o) {                       // on the floor, at something on the floor: one kick, 80
  const f = p.face;
  if (t < .16) { p.target = POSE.kickWind; p.vx = 0; charge(p, 1); return; }
  p.target = t < .38 ? PZ.rtKick : POSE.idle; p.vx = t < .26 ? f * 420 : 0;
  if (!m.sw) { m.sw = 1; sfx.swipe(2); arc(p, 150, 120); }
  if (!m.done && t < .3 && E.tryHit(p, { reach: 205, dmg: exact(o, m.fin ? KICK_FIN : KICK), kb: m.fin ? 1500 : 820, lift: m.fin ? 700 : 380, stun: .9, stop: .14, heavy: 1, col: m.fin ? INK : BLUE, fixed: 1, mute: 1, limb: 1 })) { m.done = 1; kickHit(p, o, 1); if (m.fin) lastKick(o); }
  if (t > .7) E.endMove(p);
}
function kick(p, m, o, n, of) {                     // one of the two (or three) in the air
  const last = n === of;
  p.target = n === 1 ? PZ.rtKick : last ? PZ.rtAxe : PZ.rtHigh;
  sfx.swipe(last ? 2 : n & 1); arc(p, 170, 110 + 25 * n);
  if (m.dodged || !can(o) || Math.abs(o.x - p.x) > 260 || Math.abs(o.y - p.y) > 240) return;      // nothing there: they got out of it
  const fin = m.fin && last;
  const h = m.kind === 'tri'
    ? { dmg: exact(o, TRI[n - 1] + (last ? TRI_MORE : 0)), kb: last ? 1150 : 120, lift: last ? 420 : 640, stun: .9, stop: last ? .18 : .08, heavy: 1, col: BLUE, fixed: 1, mute: 1, brk: 1,
        limb: n === 1 || (last && limbs(o) >= 1) ? 1 : 0 }       // the first leaves a Broken Limb, and the last a second on top of it
    : { dmg: exact(o, AIR[n - 1]), kb: last ? 560 : 120, lift: last ? 820 : 640, stun: .9, stop: .1, heavy: 1, col: BLUE, fixed: 1, mute: 1, brk: 1, limb: n === 1 ? 1 : 0 };
  if (fin) Object.assign(h, { dmg: exact(o, KICK_FIN), kb: 1500, lift: 700, col: INK });      // the chain's last
  E.applyHit(o, p.face, h);
  kickHit(p, o, n / of);
  if (fin) lastKick(o);
}
// the chain's last kick landing: a Black Flash past the ordinary kind, blue in its lightning
function lastKick(o) { JU.kokusen.insane(o, { snd: finalSound, acc: BRGB, name: 'BLACK FLASH  ×4', size: 330 }); }
function aloftKicks(p, m, t, o) {                   // after them, wherever they are, and two kicks; or three, straight after his uppercut
  const dt = t - (m.lt || 0), of = m.kind === 'tri' ? 3 : 2, W = m.kind === 'tri' ? CHARGE : .08;
  m.lt = t;
  if (t < W) {                                      // the wind-up: blue gathering on his foot (the three-kick one is long enough to read, and to get out of)
    p.target = POSE.kickWind; p.vx *= .8; if (!p.ground) p.vy = Math.max(p.vy, 30);
    charge(p, m.kind === 'tri' ? 2 : 1);
    if (m.kind === 'tri' && !m.rolled && t >= m.dodgeAt) { m.rolled = 1; m.dodged = !!(EV && EV.foe(o, odds(o))); }
    if (m.kind === 'tri' && !m.dodged && !duel() && aloft(o) && can(o) && !o.poise) o.vy = Math.max(o.vy, -140);      // and it holds them up there while it gathers (a duel's: their own game's)
    return;
  }
  if (m.at === undefined) {
    const live = can(o) && !m.dodged && Math.abs(o.x - p.x) < REACH, tx = o.x - p.face * 95, ty = Math.max(0, o.y + 20);
    if (!m.go) { m.go = 1; p.face = o.x >= p.x ? 1 : -1; sfx.swipe(2); p.inv = Math.max(p.inv || 0, .3); }
    p.target = PZ.rtKick;
    if (live) { const q = 1 - Math.exp(-dt * 22); p.ground = false; p.vx = 0; p.vy = 0; p.x += (tx - p.x) * q; p.y += (ty - p.y) * q; smear(p, 'blue'); }
    if (!live || Math.hypot(tx - p.x, ty - p.y) < 50 || t > W + .3) { m.at = t; m.n = 0; }
    return;
  }
  const due = Math.min(of, 1 + Math.floor((t - m.at) / GAP));
  while (m.n < due) { m.n++; kick(p, m, o, m.n, of); }
  if (t - m.at < of * GAP && can(o) && !m.dodged) { const q = 1 - Math.exp(-dt * 18); p.vx = 0; p.vy = 0; p.x += (o.x - p.face * 95 - p.x) * q; p.y += (Math.max(0, o.y + 20) - p.y) * q; }      // up there with them while they land
  else if (!m.fall) { m.fall = 1; p.vy = 260; p.vx = -p.face * 120; }
  if (t - m.at > of * GAP + .3 && (p.ground || t - m.at > of * GAP + 1)) E.endMove(p);
}
const MOVES = {
  // 1 — Cleaving Rush. With a Ratio on him: a Black Flash, and it breaks any guard
  strikes: { name: 'Cleaving Rush', cd: 7, dur: 1.2, glow: 'gold', run(p, m, t) {
    const o = E.P2, f = p.face;
    if (m.bf === undefined) { m.bf = armed && armed.rush ? 1 : 0; sfx.charge(); shout(p, m.bf ? '黒閃' : '十劃', m.bf ? INK : GOLD); }
    p.rate = 50;
    if (t < .12) { p.target = PZ.rtCrouch; p.vx = 0; return; }
    if (t < .32) {
      p.target = PZ.rtRush; p.vx = f * 2200;
      if (!m.sw) { m.sw = 1; sfx.swipe(2); sfx.cut(1); }
      smear(p, m.bf ? 'red' : 'gold');
      if (!m.done && E.tryHit(p, { reach: 220, dmg: exact(o, m.bf ? RUSH_BF : RUSH), kb: 560, lift: 300, stun: .9, stop: m.bf ? .3 : .16, heavy: 1, col: m.bf ? INK : GOLD, fixed: 1, mute: 1, limb: 1, brk: m.bf ? 1 : 0 })) { m.done = 1; rushHit(p, o, m.bf); }
      return;
    }
    p.vx = 0; p.target = t < .5 ? PZ.rtFollow : POSE.idle;
    if (t > .75) E.endMove(p);
  } },
  // 2 — Ratio Kick: on the floor, in the air, or straight after his uppercut (and in the air it can be started from the air: H.press)
  crush: { name: 'Ratio Kick', cd: 8, dur: 2.6, glow: 'blue', run(p, m, t) {
    const o = E.P2;
    if (!m.kind) {
      m.kind = up && up.o === o && E.T - up.at < UP_T && aloft(o) && !o.ko ? 'tri' : !p.ground || (aloft(o) && !o.ko) ? 'air' : 'ground';
      up = null; m.dodgeAt = rnd(.12, CHARGE - .06);
      m.fin = nc && nc.n === 3 ? 1 : 0; nc = null;      // the chain's last
      sfx.charge(); shout(p, m.fin ? '黒閃' : m.kind === 'tri' ? '比率' : '七三', m.fin ? INK : BLUE);
    }
    p.rate = 46;
    if (m.kind === 'ground') ground(p, m, t, o); else aloftKicks(p, m, t, o);
  } },
  // 3 — Collapsed Fist: the hand without the blade. With a Ratio on him it lands harder and leaves more
  div: { name: 'Collapsed Fist', cd: 9, dur: 1.1, glow: 'blue', run(p, m, t) {
    const o = E.P2, f = p.face, W = .3;
    if (m.r === undefined) {
      m.bf = nc && nc.ratio && nc.n < 3 ? 1 : 0;      // the chain's: a Ratio landed since its last Black Flash, and this is one too
      if (!m.bf) nc = null;
      m.r = m.bf || (armed && armed.fist) ? 1 : 0; sfx.charge(); shout(p, m.bf ? '黒閃' : m.r ? '瓦落瓦落' : '崩', m.bf ? INK : m.r ? GOLD : BLUE);
    }
    const [dmg, n] = m.bf ? [FIST_BF, FIST_R[1]] : m.r ? FIST_R : FIST;
    if (t < W) { p.target = POSE.divWind; p.vx = 0; p.rate = 26; const w = E.hand(p, false); V.mote(w[0], w[1], m.r ? 'gold' : 'blue'); return; }
    p.rate = 46; p.target = t < W + .22 ? POSE.div : POSE.idle; p.vx = t < W + .1 ? f * 420 : 0;
    if (!m.sw) { m.sw = 1; sfx.swipe(2); arc(p, 175, 100); }
    if (!m.done && t < W + .12 && E.tryHit(p, { reach: 195, dmg: exact(o, dmg), kb: 520, lift: 420, stun: .9, stop: m.bf ? .3 : .2, heavy: 1, col: m.bf ? INK : BLUE, fixed: 1, mute: 1, limb: n })) {
      m.done = 1; collapse(p, o, m.r);
      if (m.bf) { const k = nc.n + 1; E.blackFlash(bfSound); weakCut(o); if (o.ko) nc = null; else link(k); }
    }
    if (t > W + .6) E.endMove(p);
  } },
  manji: { name: 'Coming soon', cd: 1, dur: .01, run() {} }
};

JU.tech.add('ratio', { name: 'Ratio Man', jp: '十劃', mark: '七', who: 'Ratio Technique', odds: 0, col: GOLD, glow: 'gold', moves: MOVES,
  early: true, skin: NANAMI, as: ['Ratio Man', '十劃'], m1,
  hint: '<b>E</b> Ratio, <b>E</b> again on the red: a Black Flash on the 5th strike and on <b>1</b>, <b>3</b> harder · <b>2</b> in the air, or after an uppercut · after <b>1</b>\'s Black Flash: Ratio, <b>3</b>, Ratio, <b>3</b>, <b>2</b>' });
const DEF = JU.tech.TECH.ratio, on = () => JU.tech.active === DEF;
const LAUNCHERS = new Set([UP, FIN, FIN_BF, MOVES.strikes]);      // what Ratio Kick can be thrown straight out of: the uppercut, the fifth strike, Cleaving Rush
const free = p => !p.move && !p.ps && !p.dead && !(p.dashT > 0);

/* ---------- wiring ---------- */
let primed = false;
function prime() { if (!primed) { primed = true; sfx.preload(HOME ? SOUNDS.concat(JJS, NET) : SOUNDS); } }
const moveFx0 = H.moveFx, press0 = H.press, tick0 = H.tick, fx0 = H.fx, under0 = H.under, reset0 = H.reset, start0 = H.fightStart;
H.moveFx = (p, m) => {
  if (moveFx0) moveFx0(p, m);
  if (p === E.P1 && m.def.rt && m.done && !m.snd) { m.snd = 1; landed(p, m); }
};
H.press = (a, inScene) => {
  if (!inScene && on() && E.root.dataset.mode === 'fight') {
    const p = E.P1;
    if (a === 'ok') { if (!p.dead) { if (qte && !qte.res) judge(p); else call(p); } return true; }      // E: the meter, and E again to stop it
    const m = p.move, cancel = m && m.done && LAUNCHERS.has(m.def) && !p.ps && !p.dead;      // straight out of whatever threw them, once it has landed: it does not wait for him to finish it
    if (a === 'crush' && E.cd.crush <= 0 && (cancel || (!p.ground && free(p)))) {      // (and Ratio Kick can be started in the air)
      if (cancel) E.endMove(p);
      E.cd.crush = E.CD.crush; p.move = { def: MOVES.crush, key: 'crush', t: 0 }; E.hud.mv.crush.classList.add('act');
      return true;
    }
  }
  return press0 ? press0(a, inScene) : false;
};
H.tick = dt => {
  tick0(dt);
  if (qcd > 0) qcd -= dt;
  if (qte) {
    if (!qte.res) { if ((qte.t += dt) >= qte.dur) { qte.at = 1; miss(); } }
    else if ((qte.rt += dt) > .5) qte = null;
  }
  if (armed && (armed.t -= dt) <= 0) { armed = null; if (on()) E.fx.push({ k: 2, x: E.P1.x, y: E.P1.y + 400, n: 'RATIO FADES', col: '#a9a4ae', t: 0, life: .9 }); }
  if (up && E.T - up.at > UP_T) up = null;
  if (nc && ((nc.t -= dt) <= 0 || E.P2.ko)) nc = null;
  if (E.P1.dead) qte = armed = nc = null;
};
H.under = dt => {
  under0(dt);
  for (let i = trail.length - 1; i >= 0; i--) {     // where he was, a moment ago: gold for the Rush, red for a Black Flash one, blue chasing a kick
    const s = trail[i];
    if ((s.t += dt) >= .22) { trail.splice(i, 1); continue; }
    E.drawFighter(E.over(s.f, TRAILS[s.kind] || TRAILS.gold), .55 * (1 - s.t / .22));
  }
};
H.fx = dt => {
  fx0(dt);
  if (slabs.length) drawSlabs(dt);
  const p = E.P1, o = E.P2, mine = on() && p.skin === NANAMI;
  for (const f of [o, p]) if (f.skin === NANAMI && !(f.alpha < .05)) blade(f, f === p && mine && armed ? (p.move && p.move.bf ? 'red' : 'gold') : null);
  if (!mine) return;
  if (armed && !o.ko && !(o.alpha < .05)) drawWeak(o);
  if (qte) drawMeter(p);
  if (nc) {
    const c = F(p.x, p.y + 400), k = c[2], u = Math.max(0, nc.t / CHAIN_T);
    g.save();
    for (let i = 0; i < 4; i++) {
      const x = c[0] + (i - 1.5) * 26 * k, y = c[1], r = (i === 3 ? 11 : 9) * k, done = i < nc.n;
      g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y); g.closePath();
      g.fillStyle = done ? INK : i === 3 ? 'rgba(79,195,255,.35)' : 'rgba(8,6,14,.7)'; g.fill(); g.lineWidth = 2 * k; g.strokeStyle = done ? '#ffffff' : 'rgba(255,255,255,.35)'; g.stroke();
    }
    g.fillStyle = 'rgba(8,6,14,.7)'; g.fillRect(c[0] - 52 * k, c[1] + 16 * k, 104 * k, 5 * k);
    g.fillStyle = nc.ratio ? GOLD : INK; g.fillRect(c[0] - 52 * k, c[1] + 16 * k, 104 * k * u, 5 * k);
    g.restore();
  }
};
const clear = () => { qte = armed = up = nc = null; qcd = 0; trail.length = slabs.length = 0; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) clear(); else qte = null; if (on()) prime(); };

JU.ratio = { MOVES, CUTS, FIN, UP, DOWN, RED, TOL, TILT, RUSH, KICK, AIR, TRI, TRI_MORE, M1D, M1_BF, FIST, FIST_R, get slabs() { return slabs.length; },
  get qte() { return qte && { u: +clamp(qte.t / qte.dur, 0, 1).toFixed(3), dur: qte.dur, tilt: +(qte.tilt * 180 / Math.PI).toFixed(1), res: qte.res }; },
  get armed() { return armed && { m1: armed.m1, rush: armed.rush, fist: armed.fist, t: +armed.t.toFixed(1) }; }, set armed(v) { armed = v ? { m1: true, rush: true, fist: true, t: ARMED_T, ang: .8 } : null; },
  get up() { return up && { at: up.at }; }, get qcd() { return qcd; }, get chain() { return nc && { n: nc.n, t: +nc.t.toFixed(2), ratio: nc.ratio }; } };
})();
