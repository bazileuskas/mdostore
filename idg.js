/* JUJUTSU UNLIMITEDS — Build 0.22: IDLE DEATH GAMBLE (坐殺博徒), the domain of Double or Nothing (gambler.js). The user asked for it by name.
   What the series says it is (the fan wiki): a pachinko machine, "CR Private Pure Love Train Version 1/239". The rules go straight into the
   head of whoever it closes on (harmless, and so it goes up in no time). His doors and his balls come out green, red or gold, the rarer the
   better; rainbow ones are a sure thing. Any of them starts a reach (riichi): two of the three numbers are up, and a scene plays on the screen:
   Transit Card (a poor chance), Seat Struggle or Potty Emergency (better), Friday Night Final Train (over eighty percent). Four consecutive
   effects are a sure thing too (in the series a defensive one that takes damage back: here a counter with E, Bouncer Doors, which also gives
   back what he took in the moment before). A miss puts the stage back to the start, a spin fewer. THE JACKPOT: the domain is gone, and for
   four minutes and eleven seconds (the length of the song that plays in the series) his cursed energy has no limit and his body heals itself
   faster than it can be hurt: nothing puts him down. When it is over his technique is ready again. Odd numbers: the next one opens in
   advanced probability (better colours); even: faster spins.
   Ours, not the series': 5 spins (6 in advanced probability), 45 seconds at most, the chances in SCENES and ROLL, whoever it closes on stunned
   1.2 seconds by the rules, no cooldowns and 35% of his health back a second in the jackpot, and none of it in a 1v1 */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, P = E.P, cam = E.cam, H = E.hooks, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, D = JU.domain, Z = JU.bossfx, T = JU.tech;
const GB = JU.gambler, K = GB.kit, { GREEN, GOLD, GRGB, DRGB, play, label, live, hs, duel } = K;
const { rnd, clamp, lerp, ZP } = E, TAU = Math.PI * 2;
const shake = v => { if (!JU.reduceMotion) cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const AF = 'Anton, Impact, sans-serif', JPF = "'Yuji Syuku','Yu Mincho',serif";

const SPINS = 5, SPINS_ADV = 6, OPEN = 45, JACKPOT = 251, RULES = 1.2, RIICHI = 3.4, RIICHI_FAST = 2.3, HEAL = .35, WAIT = .45;
const COLS = ['green', 'red', 'gold', 'rainbow'], RANK = { green: 0, red: 1, gold: 2, rainbow: 3 };
const ROLL = { normal: [.6, .28, .1, .02], advanced: [.38, .34, .22, .06], fast: [.6, .28, .1, .02] };     // what colour a door or a ball comes out
const ADD = { green: .06, red: .12, gold: .25, rainbow: 1 };      // what one more of them, while a reach is on, adds to its chance
const SCENES = {
  transit: { name: 'TRANSIT CARD RIICHI', jp: 'ＩＣカードリーチ', stars: 1, base: .1, col: '#3cf08a', draw: vTransit },
  seat: { name: 'SEAT STRUGGLE RIICHI', jp: '座席争奪戦リーチ', stars: 2, base: .3, col: '#ff3b55', draw: vSeat },
  potty: { name: 'POTTY EMERGENCY RIICHI', jp: 'トイレ駆け込みリーチ', stars: 2, base: .3, col: '#ff3b55', draw: vPotty },
  final: { name: 'FRIDAY NIGHT FINAL TRAIN RIICHI', jp: '金曜最終電車リーチ', stars: 3, base: .82, col: '#ffd24a', draw: vFinal }
};

let G = null;          // the domain while it stands: { t, spins, all, best (best colour since the last reach), icons, riichi, consec, mode, pend }
let J = null;          // the jackpot: { t, all, n, odd }
let mode = 'normal';   // how the next one opens: normal; advanced (odd numbers last time); fast (even)
let show = null;       // the jackpot, announced over the whole screen
let lastInd = -9, seen = -9;
const hurt = [];       // [when, how much] he has been hurt lately: a consecutive effect gives it back
const on = () => T.active === T.TECH.gambler;
const colOf = c => K.tintCol(c) || '#ffffff';
const NAME = { green: 'GREEN', red: 'RED', gold: 'GOLD', rainbow: 'RAINBOW' };

/* ================= the game in it ================= */
function rollCol() {
  const w = ROLL[G ? G.mode : 'normal'];
  let r = Math.random();
  for (let i = 0; i < 4; i++) if ((r -= w[i]) < 0) return COLS[i];
  return 'green';
}
// one of his doors or balls has landed (or a counter has: a consecutive effect). col: the colour it came out, if it had one
function indicate(kind, col, x, y, force) {
  if (!G || D.clashing) return;
  if (!force && E.T - lastInd < .3) return;
  lastInd = E.T;
  col = col || rollCol();
  G.icons.push({ kind, col, t: 0 }); if (G.icons.length > 9) G.icons.shift();
  label(x, y, NAME[col] + (kind === 'ball' ? ' BALLS' : kind === 'door' ? ' DOORS' : ' · CONSECUTIVE'), colOf(col), 1.1);
  sfx.ding(Math.min(2, RANK[col]));
  if (col === 'rainbow') { if (Z) Z.flash('255,255,255', .25, .2); shake(10); }
  const R = G.riichi;
  if (R && !R.done) { R.chance = col === 'rainbow' ? 1 : Math.min(.97, R.chance + ADD[col]); R.boost = .45; return; }
  if (!R) { if (!G.best || RANK[col] > RANK[G.best]) G.best = col; if (!(G.pend > 0)) G.pend = WAIT; }
}
function riichi() {
  const best = G.best || 'green', sure = best === 'rainbow' || G.consec >= 4;
  const id = sure || best === 'gold' ? 'final' : best === 'red' ? (Math.random() < .5 ? 'seat' : 'potty') : 'transit', sc = SCENES[id];
  G.riichi = { id, t: 0, dur: G.mode === 'fast' ? RIICHI_FAST : RIICHI, chance: sure ? 1 : Math.min(.97, sc.base + (G.mode === 'advanced' ? .1 : 0)), n: 1 + (Math.random() * 9 | 0),
    done: false, hit: false, at: 0, third: 0, boost: 0, from: best };
  G.best = null; G.pend = 0;
  if (G.consec >= 4) G.consec = 0;
  play('home-gb-reels', .7, () => sfx.ding(0)); sfx.charge();
}
function consecutive() {
  const p = E.P1;
  G.consec++;
  let back = 0;
  for (const h of hurt) if (E.T - h[0] < 2.5) back += h[1];
  hurt.length = 0;
  if (back > 0 && !p.dead) { p.hp = Math.min(p.max, p.hp + back); E.addNum(p.x, p.y + 320, '+' + Math.round(back), GREEN); }
  label(p.x, p.y + 600, 'CONSECUTIVE ×' + G.consec + (G.consec >= 4 ? ' · A SURE THING' : ''), GOLD, 1.4);
  indicate('consecutive', G.consec >= 4 ? 'rainbow' : 'gold', p.x, p.y + 540, true);
}
function miss() {
  const p = E.P1;
  G.spins = Math.max(0, G.spins - 1);
  play('home-gb-bust', .35, () => sfx.door(.6)); sfx.back();
  label(p.x, p.y + 560, G.spins > 0 ? `MISS · BACK TO THE START · ${G.spins} SPIN${G.spins > 1 ? 'S' : ''} LEFT` : 'MISS · NO SPINS LEFT', '#b9b3c2', 1.5);
}
function jackpot(R) {
  const p = E.P1, n = R.n, all = duel() ? 30 : JACKPOT;
  G = null; K.setTint(null);                        // (done with: the domain going below is not it running out)
  J = { t: all, all, n, odd: n % 2 === 1 };
  show = { t0: E.T, n, coins: Array.from({ length: 80 }, () => [Math.random(), rnd(-.5, 0), rnd(.3, .8), rnd(0, TAU), rnd(.5, 1.2)]) };
  if (!duel()) E.stop(1.5);
  play('home-gb-jackpot', 1, () => sfx.ding(3)); sfx.bf(); shake(34);
  K.coinsAt(p.x, p.y + 240, 60);
  if (Z) { Z.flash(DRGB, .55, .45); Z.shock(p.x, 900, DRGB, .6, 16); }
  if (!p.dead) p.hp = p.max;
  if (D.now === 'idg') D.drop();
}
function jackEnd() {
  const p = E.P1, odd = J.odd;
  J = null;
  Fi.fight.floor = (Fi.fight.cfg && Fi.fight.cfg.floor) || 0;
  mode = odd ? 'advanced' : 'fast';
  T.charge(100); T.refresh();                       // and his technique is there again, ready
  label(p.x, p.y + 560, odd ? 'ODD NUMBERS · NEXT TIME, ADVANCED PROBABILITY' : 'EVEN NUMBERS · NEXT TIME, FASTER SPINS', GOLD, 2.2);
  sfx.charge();
}
function end() {                                    // spins gone, time gone, dropped, or broken in a clash
  if (!G) return;
  G = null; K.setTint(null);
  T.refresh();
  if (D.now === 'idg') D.drop();
}
function start(p) {
  G = { t: 0, spins: mode === 'advanced' ? SPINS_ADV : SPINS, best: null, icons: [], riichi: null, consec: 0, mode, pend: 0 };
  G.all = G.spins; seen = GB.ev.counterAt; hurt.length = 0;
  K.setTint(() => rollCol());
  const o = E.P2;
  if (live(o)) {                                    // the rules, straight into its head
    if (K.can(p, o)) Object.assign(o, { state: 'hurt', stun: RULES, act: null, tele: 0, vx: 0 });
    label(o.x, o.y + 500 * hs(o), 'THE RULES, STRAIGHT INTO ITS HEAD', GOLD, 1.8);
  }
  if (mode !== 'normal') { const m0 = mode; E.after(1.1, () => { if (G) label(p.x, p.y + 580, m0 === 'advanced' ? '確変 · ADVANCED PROBABILITY' : '時短 · FASTER SPINS', GOLD, 1.8); }); }
  mode = 'normal';
}
function awaken(p) {
  if (duel()) { label(p.x, p.y + 470, 'NO GAMBLING IN A 1V1', '#b9b3c2', 1.2); return; }
  if (G || J || D.now === 'idg') return;
  const opened = D.open({ who: p, tone: 'green', kind: 'idg', reveal() {
    D.raise('idg', { who: p, dur: OPEN + 10 });
    start(p);
    E.after(.25, () => { if (!D.clashing) E.banner('坐殺博徒', 'IDLE DEATH GAMBLE', 'xs'); });
  } });
  if (opened) { T.drain(); p.inv = Math.max(p.inv, 1); }
}
function tickG(dt) {
  G.t += dt;
  for (const i of G.icons) i.t += dt;
  if (D.clashing) return;
  if (D.now !== 'idg' && G.t > .6) { end(); return; }
  if (GB.ev.counterAt > seen) { seen = GB.ev.counterAt; consecutive(); }
  if (G.pend > 0 && (G.pend -= dt) <= 0 && !G.riichi) riichi();
  const R = G.riichi;
  if (R) {
    R.t += dt; if (R.boost > 0) R.boost -= dt;
    if (!R.done && R.t >= R.dur) {
      R.done = true; R.at = R.t; R.hit = Math.random() < R.chance;
      if (R.hit) { R.third = R.n; jackpot(R); return; }
      let x = 1 + (Math.random() * 8 | 0); if (x >= R.n) x++;      // anything but the one it needed
      R.third = x; miss();
    }
    if (R.done && R.t > R.at + 1.2) { G.riichi = null; if (G.spins <= 0) { end(); return; } }
  }
  if (G.t > OPEN && !G.riichi) end();
}
function tickJ(dt) {
  const p = E.P1;
  J.t -= dt;
  for (const k of T.SLOTS) E.cd[k] = 0;             // no limit to it
  K.ecd = 0;
  if (!p.dead && p.hp < p.max) {                    // and it heals him faster than anything can hurt him
    p.hp = Math.min(p.max, p.hp + p.max * HEAL * dt);
    if (Math.random() < dt * 16) V.puff('white', p.x + rnd(-50, 50), p.y + rnd(60, 300), rnd(-30, 30), rnd(120, 260), rnd(18, 34), rnd(.4, .7));
  }
  Fi.fight.floor = Math.max(Fi.fight.floor || 0, 1);
  if (Math.random() < dt * 22) V.mote(p.x + rnd(-60, 60), p.y + rnd(40, 320), Math.random() < .5 ? 'gold' : 'green');
  if (J.t <= 0) jackEnd();
}

/* ================= inside it: a pachinko machine as big as the sky, a parlour's floor, the doors of a train either side ================= */
const PINS = [];
for (let r = 0; r < 11; r++) for (let c = 0; c < 23; c++) { const x = -1100 + c * 100 + (r % 2) * 50, y = 1150 - r * 64; if (Math.abs(x) < 470 && y > 400 && y < 1010) continue; PINS.push([x, y]); }
const BALLZ = Array.from({ length: 34 }, (_, i) => [((i * 137) % 100) / 100, -1040 + ((i * 263) % 2080), .5 + ((i * 71) % 10) / 10]);
const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
function txt(s, x, y, size, fill, stroke, font = AF, align = 'center') {
  g.font = `${Math.max(6, Math.round(size))}px ${font}`; g.textAlign = align; g.textBaseline = 'middle'; g.lineJoin = 'round';
  if (stroke) { g.lineWidth = Math.max(2, size * .16); g.strokeStyle = stroke; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y);
}
function lamps(x, y, w, h, n, k, T0) {             // bulbs all the way round a frame, the light running along them
  for (let i = 0; i < n; i++) {
    const u = i / n, per = 2 * (w + h), d = u * per;
    const px = d < w ? x + d : d < w + h ? x + w : d < 2 * w + h ? x + w - (d - w - h) : x, py = d < w ? y : d < w + h ? y + (d - w) : d < 2 * w + h ? y + h : y + h - (d - 2 * w - h);
    const on1 = (i + Math.floor(T0 * 12)) % 4 < 2, col = ['#3cf08a', '#ffd24a', '#ff3b55'][(i + Math.floor(T0 * 3)) % 3];
    g.fillStyle = on1 ? col : 'rgba(60,50,30,.8)'; g.beginPath(); g.arc(px, py, Math.max(2, 8 * k), 0, TAU); g.fill();
    if (on1) lit(() => { g.fillStyle = col; g.globalAlpha = .3; g.beginPath(); g.arc(px, py, Math.max(5, 22 * k), 0, TAU); g.fill(); g.globalAlpha = 1; });
  }
}
function parlor() {
  const VW = E.VW, VH = E.VH, HY = E.HY, T0 = E.T, z = ZP + 1150;
  let gr = g.createLinearGradient(0, 0, 0, HY);
  gr.addColorStop(0, '#010402'); gr.addColorStop(1, '#06301f');
  g.fillStyle = gr; g.fillRect(-300, -300, VW + 600, HY + 302);
  gr = g.createLinearGradient(0, HY, 0, VH);       // the floor: dark, polished, the lights lying in it
  gr.addColorStop(0, '#0c2c1f'); gr.addColorStop(1, '#010604');
  g.fillStyle = gr; g.fillRect(-300, HY, VW + 600, VH - HY + 500);
  g.strokeStyle = 'rgba(60,240,138,.1)'; g.lineWidth = 1.5;
  for (let i = -14; i <= 14; i++) { const a = P(i * 180, 0, ZP - 600), b = P(i * 180, 0, z); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  for (let j = 0; j < 10; j++) { const zz = ZP - 600 + j * 190, a = P(-2800, 0, zz), b = P(2800, 0, zz); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  for (let i = 0; i < 9; i++) {                     // the reflections of the lamps, standing in the floor
    const c = P(-1100 + i * 275, 0, ZP + 500), w = 26 * c[2];
    gr = g.createLinearGradient(0, c[1], 0, c[1] + 220 * c[2]); gr.addColorStop(0, `rgba(${i % 2 ? '255,210,74' : '60,240,138'},.16)`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(c[0] - w / 2, c[1], w, 220 * c[2]);
  }
  const tl = P(-1220, 1290, z), br = P(1220, 40, z), x0 = tl[0], y0 = tl[1], w = br[0] - x0, h = br[1] - y0, k = tl[2];
  for (const s of [-1, 1]) {                        // a train's doors either side of it
    const a = P(s * 1700, 720, ZP + 900), b = P(s * 1700 + 330, 0, ZP + 900), kk = a[2];
    K.panel(Math.min(a[0], b[0]), a[1], Math.abs(b[0] - a[0]), b[1] - a[1], kk, s);
  }
  lit(() => { E.glow(E.GLOW.green, x0 + w / 2, y0 + h * .5, w * .75, .5 + .08 * Math.sin(T0 * 3)); E.glow(E.GLOW.gold, x0 + w / 2, y0 + h * .35, w * .4, .3); });
  rr(x0, y0, w, h, 70 * k); gr = g.createRadialGradient(x0 + w / 2, y0 + h * .45, 0, x0 + w / 2, y0 + h * .45, w * .62); gr.addColorStop(0, '#1b6b48'); gr.addColorStop(.55, '#0b3424'); gr.addColorStop(1, '#03120b'); g.fillStyle = gr; g.fill();
  g.lineWidth = 22 * k; g.strokeStyle = '#a07a1c'; g.stroke(); g.lineWidth = 9 * k; g.strokeStyle = '#ffd24a'; g.stroke();
  lamps(x0 + 20 * k, y0 + 20 * k, w - 40 * k, h - 40 * k, 64, k, T0);
  const rc = P(0, 560, z), rw = (P(1060, 560, z)[0] - rc[0]), rh = rc[1] - P(0, 1180, z)[1];      // the rail the balls are fired round
  g.lineWidth = 12 * k; g.strokeStyle = '#d8dee6'; g.beginPath(); g.ellipse(rc[0], rc[1], rw, rh, 0, Math.PI * 1.02, Math.PI * 1.98); g.stroke();
  g.lineWidth = 4 * k; g.strokeStyle = '#7d8696'; g.stroke();
  for (const s of [-1, 1]) {                        // windmills, turning in the fall of the balls
    const c = P(s * 820, 760, z), R = 46 * c[2], an = T0 * 4 * s;
    g.fillStyle = '#ffd24a';
    for (let i = 0; i < 4; i++) { const a = an + i * Math.PI / 2; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0] + Math.cos(a - .28) * R, c[1] + Math.sin(a - .28) * R); g.lineTo(c[0] + Math.cos(a + .28) * R, c[1] + Math.sin(a + .28) * R); g.closePath(); g.fill(); }
    g.fillStyle = '#ff3b55'; g.beginPath(); g.arc(c[0], c[1], R * .25, 0, TAU); g.fill();
  }
  g.fillStyle = 'rgba(245,248,252,.95)';            // the pins
  for (const q of PINS) { const c = P(q[0], q[1], z); g.beginPath(); g.arc(c[0], c[1], Math.max(1.6, 4.4 * c[2]), 0, TAU); g.fill(); }
  for (const b of BALLZ) {                          // and the balls coming down through them
    const u = (T0 * .3 * b[2] + b[0]) % 1, y = 1180 - u * 1120, x = b[1] + Math.sin(u * 37 + b[1]) * 34, c = P(x, y, z), r = 11 * c[2];
    gr = g.createRadialGradient(c[0] - r * .3, c[1] - r * .3, r * .1, c[0], c[1], r); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#7d8696');
    g.fillStyle = gr; g.beginPath(); g.arc(c[0], c[1], r, 0, TAU); g.fill();
  }
  for (const s of [-1, 0, 1]) {                     // the pockets: two tulips and the start chucker
    const c = P(s * 640, s ? 330 : 300, z), kk = c[2];
    g.fillStyle = s ? '#ff3b55' : '#ffd24a'; g.beginPath(); g.moveTo(c[0] - 34 * kk, c[1] - 24 * kk); g.lineTo(c[0] - 14 * kk, c[1] + 22 * kk); g.lineTo(c[0] + 14 * kk, c[1] + 22 * kk); g.lineTo(c[0] + 34 * kk, c[1] - 24 * kk); g.closePath(); g.fill();
    g.lineWidth = 3 * kk; g.strokeStyle = '#2a1206'; g.stroke();
  }
  const s0 = P(-440, 1000, z), s1 = P(440, 420, z), sx = s0[0], sy = s0[1], sw = s1[0] - sx, sh = s1[1] - sy, sk = s0[2];
  rr(sx, sy, sw, sh, 24 * sk); g.fillStyle = '#04070f'; g.fill(); g.lineWidth = 10 * sk; g.strokeStyle = '#ffd24a'; g.stroke();
  txt('坐殺博徒', sx + sw / 2, sy + sh * .14, sh * .13, '#ffd24a', '#05030a', JPF);
  const R = G && G.riichi;
  for (let i = 0; i < 3; i++) {                     // the reels, on the machine's own screen
    const cx = sx + sw * (.25 + i * .25), cy = sy + sh * .56, bw = sw * .2, bh = sh * .5;
    rr(cx - bw / 2, cy - bh / 2, bw, bh, 10 * sk); g.fillStyle = '#f6f1e3'; g.fill();
    let n = 1 + (Math.floor(T0 * 2 + i * 3) % 9);
    if (R) n = i < 2 ? R.n : R.done ? R.third : 1 + (Math.floor(R.t * 18) % 9);
    txt(String(n), cx, cy, bh * .62, n % 2 ? '#c21f3a' : '#1b3c8f', null);
  }
  txt('1/239', sx + sw * .1, sy + sh * .92, sh * .08, 'rgba(255,255,255,.7)', null, AF, 'left');
  if (G) for (let i = 0; i < G.all; i++) { g.fillStyle = i < G.spins ? '#3cf08a' : 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(sx + sw * (.6 + i * .065), sy + sh * .92, 12 * sk, 0, TAU); g.fill(); }
  const pl0 = P(-520, 1250, z), pl1 = P(520, 1140, z);      // and the plate over it all
  rr(pl0[0], pl0[1], pl1[0] - pl0[0], pl1[1] - pl0[1], 14 * k); g.fillStyle = '#ffd24a'; g.fill(); g.lineWidth = 4 * k; g.strokeStyle = '#5a3d06'; g.stroke();
  txt('IDLE DEATH GAMBLE', (pl0[0] + pl1[0]) / 2, (pl0[1] + pl1[1]) / 2, (pl1[1] - pl0[1]) * .62, '#3a2304', null);
  g.strokeStyle = 'rgba(240,250,255,.5)'; g.lineWidth = 4;   // the strip lights up in the dark
  for (let i = 0; i < 7; i++) { const a = P(-1500 + i * 500, 1600, ZP + 500), b = P(-1260 + i * 500, 1600, ZP + 500); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
}
D.kind('idg', { rim: GRGB, tint: '4,30,18', bare: true, inside: parlor, end() { if (G) { G = null; K.setTint(null); T.refresh(); } } });

/* ================= the reach, on a screen over the fight ================= */
function figure(x, y, s, col, run, sit) {          // somebody in the story: a dark shape, running, or sitting
  g.save(); g.translate(x, y); g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round';
  const sw = Math.sin(run) * .7;
  g.beginPath(); g.arc(0, -s * .86, s * .12, 0, TAU); g.fill();
  g.lineWidth = s * .13; g.beginPath(); g.moveTo(0, -s * .72); g.lineTo(sit ? s * .04 : s * .06, -s * .36); g.stroke();
  g.lineWidth = s * .09;
  if (sit) { g.beginPath(); g.moveTo(0, -s * .36); g.lineTo(s * .26, -s * .34); g.lineTo(s * .26, 0); g.stroke(); }
  else { for (const q of [sw, -sw]) { g.beginPath(); g.moveTo(s * .06, -s * .36); g.lineTo(s * .06 + Math.sin(q) * s * .3, -s * .36 + Math.cos(q) * s * .36); g.stroke(); } }
  for (const q of [sw, -sw]) { g.beginPath(); g.moveTo(0, -s * .66); g.lineTo(Math.sin(-q) * s * .26, -s * .66 + Math.cos(q) * s * .26); g.stroke(); }
  g.restore();
}
function vTransit(x, y, w, h, u, R) {               // to the gate before the clock gets to nine
  g.fillStyle = '#dfe4ea'; g.fillRect(x, y, w, h); g.fillStyle = '#a3abb6'; g.fillRect(x, y + h * .74, w, h * .26);
  g.fillStyle = '#1b3c8f'; g.fillRect(x, y + h * .08, w, h * .1); txt('改札  TICKET GATES', x + w * .3, y + h * .13, h * .07, '#fff', null);
  const mins = Math.min(60, 56 + Math.floor(u * 4.2)), late = mins >= 60;
  txt(late ? '9:00' : '8:' + mins, x + w * .88, y + h * .3, h * .14, late ? '#c21f3a' : '#111', '#fff');
  for (let i = 0; i < 3; i++) { const gx = x + w * (.5 + i * .15); g.fillStyle = '#4b5563'; g.fillRect(gx, y + h * .46, w * .05, h * .3); g.fillStyle = '#38bdf8'; g.fillRect(gx + w * .01, y + h * .49, w * .03, h * .04); }
  const open = R.done ? R.hit : false, fx = x + w * .55 + w * .05;
  g.fillStyle = R.done ? (open ? '#3cf08a' : '#ff3b55') : '#f59e0b'; g.fillRect(fx, y + h * .56, open ? w * .01 : w * .1, h * .05);      // the flap
  const px = x + w * (R.done && !R.hit ? .48 : lerp(.06, R.done ? .8 : .52, Math.min(1, R.done ? 1 : u * 1.05)));
  figure(px, y + h * .76, h * .42, '#1f2937', E.T * 18);
}
function vSeat(x, y, w, h, u, R) {                  // one seat left, and two going for it
  g.fillStyle = '#cfd8c9'; g.fillRect(x, y, w, h);
  for (let i = 0; i < 4; i++) { g.fillStyle = '#9fb2c8'; g.fillRect(x + w * (.06 + i * .24), y + h * .1, w * .18, h * .26); }      // the windows
  g.fillStyle = '#2f6d3a'; g.fillRect(x + w * .05, y + h * .58, w * .9, h * .12); g.fillStyle = '#204b28'; g.fillRect(x + w * .05, y + h * .44, w * .9, h * .14);      // the bench
  for (let i = 0; i < 6; i++) if (i !== 3) figure(x + w * (.12 + i * .15), y + h * .72, h * .46, '#3b3b46', 0, true);
  const gap = x + w * .57, us = R.done ? (R.hit ? gap : gap - w * .12) : lerp(x + w * .05, gap - w * .1, u), them = R.done ? (R.hit ? gap + w * .14 : gap) : lerp(x + w * .95, gap + w * .1, u);
  figure(us, y + h * .76, h * .46, '#0f5132', E.T * 18, R.done && R.hit); figure(them, y + h * .76, h * .46, '#7f1d1d', E.T * 17, R.done && !R.hit);
}
function vPotty(x, y, w, h, u, R) {                 // the next station before it is too late
  g.fillStyle = '#e8e2d0'; g.fillRect(x, y, w, h);
  g.fillStyle = '#7fb3d5'; g.fillRect(x + w * .08, y + h * .1, w * .84, h * .4);
  for (let i = 0; i < 6; i++) { const bx = x + w * .08 + ((i * .2 - E.T * .9) % 1 + 1) % 1 * w * .84; g.fillStyle = '#4b6b52'; g.fillRect(bx, y + h * .3, w * .06, h * .2); }      // the city going past
  g.fillStyle = '#c8bfa6'; g.fillRect(x + w * .1, y + h * .62, w * .8, h * .06);
  const q = R.done ? (R.hit ? 1 : .86) : u * .92;
  g.fillStyle = '#3cf08a'; g.fillRect(x + w * .1, y + h * .62, w * .8 * q, h * .06);
  txt('新百合ヶ丘', x + w * .82, y + h * .76, h * .09, '#111', null, JPF);
  figure(x + w * .3 + Math.sin(E.T * 22) * w * .01, y + h * .98, h * .36, '#4c1d95', 0);      // hopping from foot to foot
}
function vFinal(x, y, w, h, u, R) {                 // the last train, between them: is she still there when it has gone
  g.fillStyle = '#0b1026'; g.fillRect(x, y, w, h);
  for (let i = 0; i < 18; i++) { g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x + ((i * 97) % 100) / 100 * w, y + ((i * 53) % 40) / 100 * h, 2, 2); }
  g.fillStyle = '#4b5563'; g.fillRect(x, y + h * .78, w, h * .22); g.fillStyle = '#ffd24a'; g.fillRect(x, y + h * .78, w, h * .02);
  figure(x + w * .2, y + h * .8, h * .42, '#e5e7eb', 0);
  const pass = R.done ? 1 : clamp((u - .35) / .5, 0, 1), tx = x + w * (1.2 - pass * 2.4);
  const gone = R.done || pass >= 1, there = R.done ? R.hit : true;
  if (there) figure(x + w * .8, y + h * .8, h * .42, '#f9a8d4', 0);
  if (!gone || pass < 1) { g.fillStyle = '#d1d5db'; g.fillRect(tx, y + h * .36, w * 1.2, h * .38); g.fillStyle = '#1e3a8a'; for (let i = 0; i < 6; i++) g.fillRect(tx + w * (.04 + i * .19), y + h * .42, w * .12, h * .14); }
}
function drawRiichi() {
  const R = G && G.riichi;
  if (!R) return;
  const VW = E.VW, VH = E.VH, sc = SCENES[R.id], w = Math.min(VW * .25, VH * .46), h = w * .6, x = (VW - w) / 2, y = VH * .085;
  const a = Math.min(1, R.t / .2) * (R.done ? clamp(1 - (R.t - R.at - .9) / .3, 0, 1) : 1), u = clamp(R.t / R.dur, 0, 1);
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  lit(() => E.glow(E.GLOW.gold, x + w / 2, y + h / 2, w * (.8 + (R.boost > 0 ? .3 : 0)), .35));
  rr(x - 12, y - 12, w + 24, h + 24, 26); g.fillStyle = '#05100b'; g.fill(); g.lineWidth = 6; g.strokeStyle = GOLD; g.stroke();
  lamps(x - 4, y - 4, w + 8, h + 8, 40, 1, E.T);
  const vx = x + 8, vy = y + h * .14, vw = w - 16, vh = h * .52;      // the scene
  g.save(); rr(vx, vy, vw, vh, 10); g.clip(); sc.draw(vx, vy, vw, vh, u, R);
  if (R.done) { g.fillStyle = R.hit ? 'rgba(255,210,74,.35)' : 'rgba(10,10,14,.45)'; g.fillRect(vx, vy, vw, vh); txt(R.hit ? '当' : '×', vx + vw / 2, vy + vh / 2, vh * .8, R.hit ? GOLD : '#e5e7eb', '#05030a', R.hit ? JPF : AF); }
  g.restore();
  txt(sc.name, x + w / 2, y + h * .07, h * .075, sc.col, '#05030a');
  txt('★'.repeat(sc.stars) + '☆'.repeat(3 - sc.stars), x + w - 14, y + h * .07, h * .06, GOLD, null, 'sans-serif', 'right');
  for (let i = 0; i < 3; i++) {                     // the numbers: two up, the third still going
    const bw = w * .2, bh = h * .26, cx = x + w * (.25 + i * .25), cy = y + h * .83;
    rr(cx - bw / 2, cy - bh / 2, bw, bh, 10); g.fillStyle = '#f6f1e3'; g.fill(); g.lineWidth = 4; g.strokeStyle = i < 2 || (R.done && R.hit) ? GOLD : '#6b7280'; g.stroke();
    const n = i < 2 ? R.n : R.done ? R.third : 1 + (Math.floor(R.t * lerp(22, 5, u)) % 9);
    txt(String(n), cx, cy, bh * .8, n % 2 ? '#c21f3a' : '#1b3c8f', null);
  }
  if (G.icons.length) for (let i = 0; i < G.icons.length; i++) {      // what went into it
    const ic = G.icons[i], ix = x + 18 + i * 26, iy = y + h + 26, c = colOf(ic.col);
    g.fillStyle = c; if (ic.kind === 'ball') { g.beginPath(); g.arc(ix, iy, 9, 0, TAU); g.fill(); } else if (ic.kind === 'door') g.fillRect(ix - 7, iy - 11, 14, 22); else txt('★', ix, iy, 22, c, null, 'sans-serif');
  }
  g.restore();
}

/* ================= the jackpot ================= */
function drawShow() {
  const s = show, t = E.T - s.t0, VW = E.VW, VH = E.VH;
  if (t > 2.3) { show = null; return; }
  const a = t < 1.7 ? 1 : 1 - (t - 1.7) / .6, cx = VW / 2, cy = VH * .44;
  g.save(); g.globalAlpha = a;
  g.fillStyle = `rgba(4,20,12,${.55 * a})`; g.fillRect(0, 0, VW, VH);
  lit(() => {                                       // light thrown out of the middle, going round
    for (let i = 0; i < 18; i++) {
      const an = i / 18 * TAU + t * .9, L = Math.hypot(VW, VH);
      g.fillStyle = i % 2 ? 'rgba(255,210,74,.22)' : 'rgba(60,240,138,.18)';
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(an - .07) * L, cy + Math.sin(an - .07) * L); g.lineTo(cx + Math.cos(an + .07) * L, cy + Math.sin(an + .07) * L); g.closePath(); g.fill();
    }
    E.glow(E.GLOW.gold, cx, cy, VH * .9, .8);
  });
  if (t < .12) { g.fillStyle = `rgba(255,255,255,${1 - t / .12})`; g.fillRect(0, 0, VW, VH); }
  const pop = Math.min(1, t / .18), big = VH * .2 * (1.25 - .25 * pop);
  txt('大当り', cx, cy - VH * .06, big, GOLD, '#2a1300', JPF);
  txt('JACKPOT', cx, cy + VH * .1, VH * .08, '#ffffff', '#0b3d22');
  for (let i = 0; i < 3; i++) {                     // the three of them
    const bw = VH * .1, bx = cx + (i - 1) * bw * 1.25, by = cy + VH * .24;
    rr(bx - bw / 2, by - bw * .6, bw, bw * 1.2, 12); g.fillStyle = '#fff8e6'; g.fill(); g.lineWidth = 6; g.strokeStyle = GOLD; g.stroke();
    txt(String(s.n), bx, by, bw * .9, s.n % 2 ? '#c21f3a' : '#1b3c8f', null);
  }
  txt(s.n % 2 ? 'ODD · PROBABILITY CHANGE' : 'EVEN', cx, cy + VH * .36, VH * .035, '#d9ffe9', '#05140c');
  for (const q of s.coins) {                        // gold, coming down everywhere
    const yy = ((q[1] + t * q[2] * 1.6) % 1.2) * VH, xx = q[0] * VW + Math.sin(t * 3 + q[3]) * 30, wd = Math.abs(Math.cos(t * 9 * q[4] + q[3])) * 16 + 3;
    g.fillStyle = GOLD; g.beginPath(); g.ellipse(xx, yy, wd, 16, 0, 0, TAU); g.fill(); g.lineWidth = 2; g.strokeStyle = '#7a5410'; g.stroke();
  }
  g.restore();
}
const clock = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

/* ================= wiring ================= */
Object.assign(T.TECH.gambler, { awaken, awkName: 'Idle Death Gamble', awkKeep: true });
const awkEl = document.getElementById('awk');
const hit0 = H.hit, struck0 = H.struck, tick0 = H.tick, fx0 = H.fx, post0 = H.post, rim0 = H.rim, reset0 = H.reset, start0 = H.fightStart;
H.hit = (o, face, h) => {                           // one of his doors or balls (or a move with one in it) has landed: what colour was it
  hit0(o, face, h);
  if (!G || !on()) return;
  const m = E.P1.move, kind = h.ind || (m && !m.def.m1 && m.def.ind) || null;
  if (!kind) return;
  const src = h.src || m;
  if (src && src.indDone) return;
  if (src) src.indDone = 1;
  indicate(kind, h.indCol || null, o.x, o.y + 560 * (o.scale || 1));
};
H.struck = (p, face, a, dmg) => { if (struck0) struck0(p, face, a, dmg); if (G && on()) { hurt.push([E.T, dmg || 0]); if (hurt.length > 24) hurt.shift(); } };
H.tick = dt => {
  tick0(dt);
  if (!on()) { if (G || J) { G = J = show = null; K.setTint(null); } return; }
  if (G) tickG(dt);
  if (J) tickJ(dt);
  if (J) { awkEl.style.setProperty('--a', clamp(J.t / J.all, 0, 1)); awkEl.classList.add('full'); awkEl.lastElementChild.textContent = 'JACKPOT · ' + clock(J.t) + ' · no limit to his cursed energy'; }
  else if (G) { awkEl.style.setProperty('--a', G.spins / G.all); awkEl.classList.remove('full'); awkEl.lastElementChild.textContent = 'Idle Death Gamble · ' + G.spins + ' spin' + (G.spins === 1 ? '' : 's') + ' left'; }
};
H.fx = dt => {
  fx0(dt);
  if (!on() || !J) return;
  const p = E.P1, c = F(p.x, p.y + 380 * (p.scale || 1)), k = c[2];      // the time it has left, over his head
  txt('JACKPOT  ' + clock(J.t), c[0], c[1], 24 * k, GOLD, '#05140c');
  const f = F(p.x, p.y + 10);
  lit(() => { E.glow(E.GLOW.gold, f[0], f[1], 300 * f[2], .35 + .1 * Math.sin(E.T * 6)); E.glow(E.GLOW.green, f[0], f[1] - 150 * f[2], 260 * f[2], .25); });
};
H.post = dt => { if (post0) post0(dt); if (!on()) return; if (G && G.riichi) drawRiichi(); if (show) drawShow(); };
H.rim = f => {                                      // the jackpot: gold and green at the edges of him, flickering
  if (f === E.P1 && on() && J && !f.dead) return { col: Math.sin(E.T * 9) > 0 ? GOLD : GREEN, blur: 10 + 4 * Math.sin(E.T * 13) };
  return rim0 ? rim0(f) : null;
};
H.reset = () => { reset0(); G = J = show = null; mode = 'normal'; K.setTint(null); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) { G = J = show = null; K.setTint(null); } };

JU.idg = { SCENES, ROLL, SPINS, JACKPOT, indicate, awaken,
  get state() { return { open: !!G, spins: G && G.spins, mode: G ? G.mode : mode, riichi: G && G.riichi && { id: G.riichi.id, t: +G.riichi.t.toFixed(2), chance: +G.riichi.chance.toFixed(2), done: G.riichi.done, hit: G.riichi.hit, n: G.riichi.n, third: G.riichi.third }, best: G && G.best, consec: G && G.consec, icons: G ? G.icons.map(i => i.kind[0] + ':' + i.col) : [], jackpot: J && { t: +J.t.toFixed(1), n: J.n, odd: J.odd }, show: !!show, next: mode }; },
  set chance(v) { if (G && G.riichi) G.riichi.chance = v; }, set jackT(v) { if (J) J.t = v; }, jackpotNow() { if (G) { if (!G.riichi) riichi(); G.riichi.chance = 1; G.riichi.t = G.riichi.dur; } } };
})();
