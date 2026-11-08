/* JUJUTSU UNLIMITEDS — Build 0.35: BITKING, the Secret CT that the BIT MODE DLC gives to whoever beats it (bitmode.js). The user's: "if yopu
   beat it you unlock a secret CT called BITKING it has 15 FUCKING MOVES and 50 modes and it is VERY op". The moves, the modes and every
   number are ours:
     1  PIXEL BLASTER    six bits fired one after another, 9 each         held: HYPER BLASTER   one bit the size of him, 140, through anything
     2  BYTE DASH        into them as a streak, 8 x 5 carrying them, 30  held: COMBO BREAKER   16 x 5, the count over them, an uppercut, 50
     3  CARTRIDGE SLAM   a cartridge the size of a car on them, 80 + 20   held: SYSTEM CRASH    they hang, ERROR all over them, 160 exact
     4  MEGA BEAM        a beam as tall as he is, 14 x 7                  held: ORBITAL LASER   down from the top of the screen, 6 x 30
     in the air: 1 BIT RAIN 12 x 5 · 2 SPRITE DIVE 65 · 3 8-BIT BOMB 90, an old game's cross of a bomb · 4 PIXEL STORM 16 x 5 every way
     E  SAVE STATE, then LOAD STATE: where he was and the health he had, both back, even out of a combo (14 s after a load)
     G  KILL SCREEN: the half of the screen in front of him breaks up into garbage and whatever is in it takes 50 x 30 (1500, exact)
     RMB, C or the mouse wheel: the next mode (the wheel goes either way), and MODE SHIFT as it changes, a ring of bits off him, 25 (2.5 s)
     and EXTRA LIFE, which is no key: the first time in a fight he would go down he does not, and is back up with all of it (not in 1v1s)
   The 50 modes are ten elements in five forms (MODE 01 to MODE 49) and MODE 50, KING MODE, every element at once. Every hit of his carries
   the mode he is in:
     VOLT a second zap, 30% · FIRE a burn, 3 x 12% · FROST frozen still .7 s · TOXIC poison, 5 x 7%, three deep · VOID pulled in, and 20%
     more · BLOOD 30% of it back to him · GOLD half as much again · GLITCH one hit in three lands twice · SHADOW his shadow behind them lands
     it again, 50% · LIGHT straight through armour
     BYTE as it is · SPLIT three of whatever he throws, 70% each · MEGA 1.6x the size, 1.45x the damage, a little slower · TURBO 1.5x quicker,
     cooldowns x0.55, 90% · LOCK-ON whatever he throws steers for them */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, T = JU.tech;
const { rnd, clamp, lerp } = E, TAU = Math.PI * 2, SLOTS = T.SLOTS;
const GREEN = '#39ff14', GOLD = '#ffd23d', INK = '#020804';
const PIX = '"Press Start 2P", ui-monospace, Consolas, monospace';
const dev = () => !!(JU.shop && JU.shop.dev);
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const SKY = [-.42, -.36, 2.9, 2.7, .4, -.56, 0], OPEN = [-.2, -.14, 1.9, -1.2, .46, -.46, 0], KNEE = [.3, .2, 1, .6, 2.3, -.3, 0];

/* ---------- what the DLC has come to, kept in ju.bit (bitmode.js reads and writes it through JU.bitking) ---------- */
// st: how many of its five stages are cleared · best: the best time on each (seconds) · king: BITKING unlocked · mode: the mode he is in
const S = { st: 0, best: {}, king: 0, mode: 0, music: 1 };
try { Object.assign(S, JSON.parse(localStorage.getItem('ju.bit') || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem('ju.bit', JSON.stringify(S)); } catch (e) {} };
let saveT = 0;
const saveSoon = () => { clearTimeout(saveT); saveT = setTimeout(save, 600); };

/* ---------- the 50 modes ---------- */
const ELEM = [
  { id: 'volt', name: 'VOLT', col: '#ffe83d', alt: '#fffbd0' },
  { id: 'fire', name: 'FIRE', col: '#ff6a2a', alt: '#ffd08a' },
  { id: 'frost', name: 'FROST', col: '#7fe9ff', alt: '#eafcff' },
  { id: 'toxic', name: 'TOXIC', col: '#8cff3a', alt: '#e2ffc4' },
  { id: 'void', name: 'VOID', col: '#a65cff', alt: '#e6d4ff' },
  { id: 'blood', name: 'BLOOD', col: '#ff2440', alt: '#ffa0ad' },
  { id: 'gold', name: 'GOLD', col: '#ffd23d', alt: '#fff3c0' },
  { id: 'glitch', name: 'GLITCH', col: '#ff3dd8', alt: '#3dfcff' },
  { id: 'shadow', name: 'SHADOW', col: '#5a78ff', alt: '#c0ccff' },
  { id: 'light', name: 'LIGHT', col: '#ffffff', alt: '#fff4c8' }
];
const FORM = [
  { id: 'byte', name: 'BYTE', dmg: 1, size: 1, speed: 1, count: 1, home: 0, cdm: 1 },
  { id: 'split', name: 'SPLIT', dmg: .7, size: .85, speed: 1, count: 3, home: 0, cdm: 1 },
  { id: 'mega', name: 'MEGA', dmg: 1.45, size: 1.6, speed: .82, count: 1, home: 0, cdm: 1.1 },
  { id: 'turbo', name: 'TURBO', dmg: .9, size: .9, speed: 1.5, count: 1, home: 0, cdm: .55 },
  { id: 'lock', name: 'LOCK-ON', dmg: 1, size: 1, speed: 1.1, count: 1, home: 1, cdm: 1 }
];
const RAINBOW = ELEM.map(e => e.col);
const MODES = [];
for (let f = 0; f < 5; f++) for (let e = 0; e < 10; e++) MODES.push({ n: MODES.length + 1, e: [ELEM[e]], f: FORM[f], name: ELEM[e].name + ' ' + FORM[f].name, col: ELEM[e].col, alt: ELEM[e].alt });
MODES[49] = { n: 50, e: ELEM, f: Object.assign({}, FORM[0], { id: 'king', name: 'KING', dmg: 1.2 }), name: 'KING MODE', col: GREEN, alt: GOLD, king: true };
let mi = clamp(S.mode | 0, 0, MODES.length - 1);
const mode = () => MODES[mi];
const has = (M, id) => M.e.some(x => x.id === id);
const colOf = M => (M.king ? RAINBOW[(E.T * 10 | 0) % RAINBOW.length] : M.col);
let DEF = null;
const on = () => !!DEF && T.active === DEF;
const fighting = () => E.root.dataset.mode === 'fight' && !!(JU.game && JU.game.state.running);

/* ---------- the sound of it: an old console's, made here (no files) ---------- */
const chip8 = (() => {
  const ctx = () => (sfx.on && sfx.ctx) || null;
  let pewAt = 0;
  function blip(type, f0, f1, dur, vol, at = 0, cut = 3400) {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + at, o = a.createOscillator(), v = a.createGain(), lp = a.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = cut;
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    v.gain.setValueAtTime(vol, t); v.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(lp); lp.connect(v); v.connect(a.destination); o.start(t); o.stop(t + dur + .03);
  }
  function hiss(dur, vol, freq, at = 0, type = 'lowpass') {
    const a = ctx(); if (!a) return;
    const n = Math.max(1, Math.floor(a.sampleRate * dur)), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), v = a.createGain(), t = a.currentTime + at;
    s.buffer = buf; f.type = type; f.frequency.value = freq; v.gain.value = vol;
    s.connect(f); f.connect(v); v.connect(a.destination); s.start(t);
  }
  const SND = {
    pew() { const n = performance.now(); if (n - pewAt < 45) return; pewAt = n; blip('square', 1250, 280, .07, .045); },
    big() { blip('square', 420, 60, .32, .07, 0, 1800); hiss(.3, .16, 900); },
    boom() { blip('square', 160, 38, .34, .08, 0, 1200); hiss(.38, .3, 700); },
    dash() { hiss(.16, .14, 2600, 0, 'highpass'); blip('square', 300, 900, .09, .03); },
    fall() { blip('triangle', 900, 120, .35, .07); },
    beam() { blip('sawtooth', 110, 90, .75, .05, 0, 900); hiss(.7, .08, 1600); },
    err() { blip('square', 240, 240, .07, .05); blip('square', 180, 180, .09, .05, .1); },
    save() { blip('triangle', 440, 880, .1, .07); blip('triangle', 660, 1320, .1, .06, .08); },
    load() { blip('triangle', 1320, 440, .16, .07); hiss(.12, .08, 3000, 0, 'highpass'); },
    up() { [523, 659, 784, 1047].forEach((f, i) => blip('square', f, f, .07, .045, i * .07, 2600)); },
    mode() { blip('square', 520, 1040, .06, .035, 0, 2400); blip('square', 780, 1560, .05, .03, .05, 2400); },
    kill() { blip('sawtooth', 220, 30, 1.4, .07, 0, 800); hiss(1.2, .16, 500); },
    over() { [392, 330, 262, 196].forEach((f, i) => blip('square', f, f * .98, .16, .05, i * .17, 1800)); }
  };
  return name => { try { if (SND[name]) SND[name](); } catch (e) {} };
})();

/* ---------- what flies about: pieces, shots, explosions, words, zaps, and the bigger things he calls down (props) ---------- */
const parts = [], shots = [], booms = [], words = [], zaps = [], props = [], DOTS = [];
const hs = f => f.scale || 1;
function sq(x, y, s, col, a = 1) {
  const c = F(x, y), w = s * c[2];
  g.globalAlpha = a; g.fillStyle = col; g.fillRect(c[0] - w / 2, c[1] - w / 2, w, w); g.globalAlpha = 1;
}
function bit(x, y, s, col, a = 1) {                  // one bit: a dark edge, its colour, a bright corner
  const c = F(x, y), w = s * c[2], x0 = c[0] - w / 2, y0 = c[1] - w / 2, e = Math.max(1, w * .14);
  g.globalAlpha = Math.max(0, Math.min(1, a));
  g.fillStyle = INK; g.fillRect(x0 - e, y0 - e, w + 2 * e, w + 2 * e);
  g.fillStyle = col; g.fillRect(x0, y0, w, w);
  g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x0, y0, w * .34, w * .34);
  g.globalAlpha = 1;
}
function pix(x, y, n, col, sp = 520, s = 10, life = .6) {
  if (parts.length > 700) parts.splice(0, parts.length - 700);
  for (let i = 0; i < n; i++) {
    const a = rnd(0, TAU), v = rnd(.25, 1) * sp;
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v + sp * .35, s: s * rnd(.6, 1.3), col: Array.isArray(col) ? col[i % col.length] : col, t: 0, life: life * rnd(.7, 1.3) });
  }
}
const cross = (x, y, r, col, life = .5) => { booms.push({ x, y, r, col, t: 0, life }); if (booms.length > 24) booms.shift(); };
const word = (x, y, n, col, size = 26, life = 1) => { const w = { x, y, n, col, size, t: 0, life }; words.push(w); if (words.length > 30) words.shift(); return w; };
const zap = (x0, y0, x1, y1, col) => zaps.push({ x0, y0, x1, y1, col, t: 0, life: .16 });
function clearAll() { parts.length = shots.length = booms.length = words.length = zaps.length = props.length = DOTS.length = 0; }

/* ---------- who he can hit: the one he is fighting, or everybody in a raid ---------- */
function targets() {
  if (Fi.fight.paused) return [];
  const L = H.foes && H.foes();
  return (L && L.length ? L : [E.P2]).filter(o => o && !o.ko && !(o.alpha < .3));
}
const can = (o, down) => !!o && !o.ko && !(o.inv > 0) && o.state !== 'up' && (down || o.state !== 'down') && !(o.alpha < .3);
function focus() {
  const o = E.P2, L = H.foes && H.foes();
  return o && !o.ko && (!L || !L.length || L.includes(o)) ? o : null;
}
const mid = o => o.y + 150 * hs(o);
// a target's own clock for the things that would pile up too fast: a zap, a freeze, a shadow
function cool(o, k, t) { const C = o.bkCool || (o.bkCool = {}); if ((C[k] || 0) > E.T) return false; C[k] = E.T + t; return true; }

/* ---------- a hit of his, with the mode in it ---------- */
function strike(p, o, h0, M) {
  M = M || mode();
  if (!o || o.ko) return false;
  const face = o.x >= p.x ? 1 : -1, mul = h0.flat ? 1 : M.f.dmg * (has(M, 'gold') ? 1.5 : 1);
  const h = { dmg: h0.dmg * mul, kb: h0.kb === undefined ? 220 : h0.kb, lift: h0.lift, stun: h0.stun || .35, stop: h0.stop === undefined ? .05 : h0.stop, heavy: h0.heavy, col: colOf(M), mute: h0.mute, bk: 1 };
  if (h0.exact || has(M, 'light')) h.dmg /= (o.dr || 1);       // (LIGHT: straight through whatever it is made of)
  const before = o.hp;
  E.applyHit(o, face, h);
  aura(p, o, face, Math.max(0, before - o.hp) || h.dmg * (o.dr || 1), M);
  return true;
}
// damage that does not stagger: burns, poison, a zap, a shadow's blow (a raid's curse that is run by another game is told, as any hit is)
function chip(o, n, col) {
  if (!o || o.ko || !(n > 0) || Fi.fight.paused) return;
  n = Math.max(1, Math.round(n));
  if (o.net || o.hp - n <= 0) { E.applyHit(o, o.x >= E.P1.x ? 1 : -1, { dmg: n / (o.dr || 1), kb: 0, stun: .05, stop: 0, mute: 1, col, bk: 1 }); return; }
  o.hp -= n; o.lastHit = 0; o.flash = .05;
  E.addNum(o.x + rnd(-30, 30), o.y + 250 * hs(o), n, col);
}
function burn(o, n, ticks, every, col, kind, deep = 1) {
  if (!(n > 0)) return;
  const mine = DOTS.filter(d => d.o === o && d.kind === kind);
  if (mine.length >= deep) { const d = mine[0]; d.left = ticks; d.n = Math.max(d.n, n); return; }
  DOTS.push({ o, n, left: ticks, every, t: 0, col, kind });
}
// what the mode's elements do, on top of the hit
function aura(p, o, face, dealt, M) {
  const X = o.x, Y = mid(o);
  for (const el of M.e) switch (el.id) {
    case 'volt': if (cool(o, 'volt', .2)) E.after(.14, () => { if (o.ko) return; zap(p.x + p.face * 40, p.y + 175 * hs(p), o.x, mid(o) + 20, el.col); chip(o, Math.max(2, dealt * .3), el.col); }); break;
    case 'fire': burn(o, dealt * .12, 3, .4, el.col, 'fire'); break;
    case 'frost': if (cool(o, 'frost', 2.2)) { o.bkIce = E.T + .7; pix(X, Y, 8, ['#eafcff', el.col], 300, 12, .6); } break;
    case 'toxic': burn(o, dealt * .07, 5, .5, el.col, 'toxic', 3); break;
    case 'void': if (!o.net) o.vx += (p.x >= o.x ? 1 : -1) * 420; chip(o, dealt * .2, el.col); break;
    case 'blood': if (!p.dead && p.hp > 0) p.hp = Math.min(p.max, p.hp + dealt * .3); break;
    case 'gold': if (Math.random() < .5) pix(X, Y, 4, [GOLD, '#fff3c0'], 380, 9, .5); break;
    case 'glitch': if (Math.random() < .35 && cool(o, 'glitch', .1)) E.after(.11, () => { if (o.ko) return; chip(o, dealt * .6, el.col); pix(o.x, mid(o), 6, ['#ff3dd8', '#3dfcff', '#fff'], 260, 14, .3); }); break;
    case 'shadow': if (cool(o, 'shadow', .25)) E.after(.28, () => { if (o.ko) return; props.push(shadowOf(o, face)); chip(o, dealt * .5, el.col); }); break;
    case 'light': if (Math.random() < .3) V.ring(X, Y, 90, '#ffffff', .2); break;
  }
}
// his shadow, a moment behind them, landing the same blow
function shadowOf(o, face) {
  return { x: o.x - face * 110, t: 0, life: .3, face, s: hs(o),
    draw(q) {
      const u = q.t / q.life, c = F(q.x, 0), k = c[2] * q.s;
      g.globalAlpha = .7 * (1 - u); g.fillStyle = '#0a0f2e';
      g.fillRect(c[0] - 26 * k, c[1] - 280 * k, 52 * k, 280 * k); g.fillRect(c[0] - 22 * k + q.face * 30 * k, c[1] - 190 * k, 60 * k, 18 * k);
      g.fillStyle = '#5a78ff'; g.fillRect(c[0] + q.face * 4 * k, c[1] - 262 * k, 10 * k, 8 * k); g.globalAlpha = 1;
    } };
}

/* ---------- shots: whatever he throws, flying until it finds something ---------- */
function blast(p, M, sz, dmg, v, more) {
  const hx = p.x + p.face * 70 * hs(p), hy = p.y + 175 * hs(p), o = focus(), n = M.f.count;
  let ang = 0;
  if (o) ang = Math.atan2(mid(o) - hy, Math.max(200, Math.abs(o.x - hx))) * .6;
  for (let i = 0; i < n; i++) {
    const a = ang + (n > 1 ? (i - (n - 1) / 2) * .16 : 0);
    shots.push(Object.assign({ p, M, x: hx, y: hy, vx: Math.cos(a) * v * p.face, vy: Math.sin(a) * v, s: 22 * sz, dmg, kb: 160, stun: .3, home: M.f.home ? 1300 * M.f.speed : 0, hit: new Set(), t: 0, life: 1.6 }, more || {}));
  }
  chip8('pew');
  pix(hx, hy, 4, [colOf(M), '#fff'], 300, 8, .25);
}
function steer(s, dt) {
  let best = null, bd = 1e9;
  for (const o of targets()) { const d = Math.hypot(o.x - s.x, mid(o) - s.y); if (d < bd && !s.hit.has(o)) { bd = d; best = o; } }
  if (!best) return;
  const v = Math.hypot(s.vx, s.vy) || s.home, tx = best.x - s.x, ty = mid(best) - s.y, d = Math.hypot(tx, ty) || 1, k = 1 - Math.exp(-dt * s.home / 260);      // (home: how hard it turns, 1300 a second's worth is LOCK-ON's)
  s.vx += (tx / d * v - s.vx) * k; s.vy += (ty / d * v - s.vy) * k;
}
function updShots(dt) {
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    s.t += dt;
    if (s.home) steer(s, dt);
    if (s.grav) s.vy -= s.grav * dt;
    s.x += s.vx * dt; s.y += s.vy * dt;
    if (Math.random() < dt * 30) parts.push({ x: s.x, y: s.y, vx: -s.vx * .05, vy: 0, s: s.s * .45, col: s.M.alt, t: 0, life: .2 });
    let gone = s.t >= s.life || Math.abs(s.x - E.P1.x) > 2400 || s.y > 2200;
    if (!gone) for (const o of targets()) {
      if (s.hit.has(o) || !can(o, s.down)) continue;
      const k = hs(o);
      if (Math.abs(o.x - s.x) < 44 * k + s.s / 2 && s.y > o.y - s.s / 2 && s.y < o.y + 300 * k + s.s / 2) {
        s.hit.add(o);
        if (s.touch) { s.touch(s, o); gone = true; break; }
        strike(s.p, o, { dmg: s.dmg, kb: s.kb, lift: s.lift, stun: s.stun, heavy: s.heavy, stop: s.stop }, s.M);
        pix(s.x, s.y, 6, [colOf(s.M), s.M.alt], 420, s.s * .45, .45);
        if (s.onHit) s.onHit(s, o);
        if (!s.pierce) { gone = true; break; }
      }
    }
    if (!gone && s.y <= 0 && (s.grav || s.vy < 0)) { gone = true; if (s.floor) s.floor(s); else pix(s.x, 4, 4, [colOf(s.M), s.M.alt], 300, s.s * .4, .35); }
    if (gone) { shots.splice(i, 1); if (s.boom) s.boom(s); }
  }
}
function drawShot(s) {
  const col = colOf(s.M);
  if (s.bomb) {                                     // an old game's bomb: round, black, a fuse that sparks
    const c = F(s.x, s.y), r = s.s / 2 * c[2], st = Math.max(2, r / 4);
    g.fillStyle = INK; for (let y = -4; y <= 4; y++) { const w = Math.round(Math.sqrt(Math.max(0, 20 - y * y)) ); g.fillRect(c[0] - w * st, c[1] + y * st - st / 2, w * 2 * st, st); }
    g.fillStyle = '#3b3b48'; g.fillRect(c[0] - 2 * st, c[1] - 3 * st, 2 * st, 2 * st);
    g.fillStyle = '#c9a36a'; g.fillRect(c[0] + st, c[1] - 6 * st, st, 2 * st);
    g.fillStyle = Math.random() < .5 ? '#fff' : col; g.fillRect(c[0] + st * 1.5, c[1] - 8 * st, st * 1.6, st * 1.6);
    return;
  }
  bit(s.x - s.vx * .018, s.y - s.vy * .018, s.s * .7, s.M.alt, .5);
  bit(s.x, s.y, s.s, col);
}

/* ---------- the four, and what they turn into when the key is held ---------- */
const HOLD_T = .2;
const keyOf = k => String(SLOTS.indexOf(k) + 1);
const held = m => !!m.key && (E.keys.has(keyOf(m.key)) || E.keys.has('hold:' + m.key));
function init(p, m) {
  if (m.M) return;
  m.M = mode(); m.sp = m.M.f.speed; m.sz = m.M.f.size; m.lt = 0;
  const o = focus(); if (o) p.face = o.x >= p.x ? 1 : -1;
  if (m.key && m.M.f.cdm !== 1) E.cd[m.key] = (E.CD[m.key] || 0) * m.M.f.cdm;
}
// a tap is the move; still held at HOLD_T, it is the big one instead. Returns true once it is the tap's to go on with
function decided(p, m, t, big) {
  if (m.dec) return true;
  if (held(m)) {
    if (t >= HOLD_T) { m.def = big; m.t = 0; m.dec = 1; E.cd[m.key] = (big.cd || 8) * m.M.f.cdm; return false; }
    p.vx = 0; p.target = POSE.divWind; p.rate = 30;
    if (Math.random() < .5) parts.push({ x: p.x + rnd(-90, 90), y: p.y + rnd(40, 300), vx: 0, vy: 160, s: 9, col: colOf(m.M), t: 0, life: .3 });
    return false;
  }
  m.dec = 1; m.t0 = t;
  return true;
}

// 1: PIXEL BLASTER, six bits
const BLASTER = { name: 'Pixel Blaster', cd: 3, dur: 9, run(p, m, t) {
  init(p, m);
  if (!decided(p, m, t, HYPER)) return;
  const tt = (t - m.t0) * m.sp;
  p.rate = 40; p.vx = 0; p.target = POSE.div;
  const n = Math.min(6, Math.floor(tt / .075) + 1);
  while ((m.n || 0) < n) { m.n = (m.n || 0) + 1; blast(p, m.M, m.sz, 9, 1550 * m.sp); }
  if (tt > .62) E.endMove(p);
} };
// hold 1: HYPER BLASTER, one bit the size of him
const HYPER = { name: 'Hyper Blaster', cd: 7, dur: 9, run(p, m, t) {
  const tt = t * m.sp, M = m.M, sz = m.sz;
  p.vx = 0; p.rate = 30;
  if (tt < .55) { p.target = POSE.divWind; m.ch = tt / .55; if (Math.random() < .7) parts.push({ x: p.x + p.face * 70 + rnd(-160, 160), y: p.y + 240 + rnd(-140, 140), vx: 0, vy: 0, s: 10, col: colOf(M), t: 0, life: .2 }); return; }
  if (!m.f) {
    m.f = 1; m.ch = 0; p.target = POSE.div; cam.shake = Math.max(cam.shake, 12); chip8('big');
    const o = focus(), y = o ? clamp(mid(o), 120, 260) : p.y + 175;
    shots.push({ p, M, x: p.x + p.face * 110, y, vx: p.face * 1150 * m.sp, vy: 0, s: 96 * sz, dmg: 140, kb: 950, lift: 640, heavy: 1, stop: .16, pierce: 1, home: M.f.home ? 900 : 0, hit: new Set(), t: 0, life: 1.8,
      onHit: s => cross(s.x, s.y, 240 * sz, colOf(M)) });
  }
  if (tt > .95) E.endMove(p);
}, draw(p, m) {
  if (!m.ch) return;
  const s = 20 + 76 * m.ch * m.sz, y = p.y + 260 + 40 * m.ch;
  bit(p.x + p.face * 60, y, s, colOf(m.M), .6 + .4 * m.ch);
} };

// 2: BYTE DASH, through them as a streak of bits, carrying them
const DASH = { name: 'Byte Dash', cd: 4, dur: 9, run(p, m, t) {
  init(p, m);
  if (!decided(p, m, t, COMBO)) return;
  const tt = (t - m.t0) * m.sp, M = m.M;
  p.rate = 44;
  if (tt < .1) { p.target = POSE.dashWind || POSE.kickWind; p.vx = 0; return; }
  if (tt < .46) {
    if (!m.go) { m.go = 1; m.n = 0; p.inv = Math.max(p.inv || 0, .42 / m.sp); chip8('dash'); }
    p.target = POSE.dash; p.vx = p.face * 2300 * m.sp;
    parts.push({ x: p.x - p.face * 40, y: p.y + rnd(30, 280), vx: -p.face * 200, vy: 0, s: 16 * m.sz, col: Math.random() < .5 ? colOf(M) : M.alt, t: 0, life: .22 });
    if (!m.o) for (const o of targets()) if (can(o) && Math.abs(o.x - p.x) < 130 * m.sz && o.y < 260) { m.o = o; break; }
    const o = m.o;
    if (o && !o.ko) {
      if (!o.net) { o.vx = p.vx; o.x = clamp(p.x + p.face * 70, -960, 960); }
      const k = Math.floor((tt - .1) / .04);
      if (k !== m.k && m.n < 8) { m.k = k; m.n++; strike(p, o, { dmg: 5, kb: 0, stun: .6, stop: .01, mute: m.n % 2 }, M); }
    }
    return;
  }
  if (!m.end) {
    m.end = 1; p.vx = 0;
    const o = m.o;
    if (o && !o.ko) {
      pix(p.x, p.y + 150, 14, [colOf(M), M.alt], 420, 12, .3);
      p.x = clamp(o.x + p.face * 150, -955, 955); p.face = -p.face;
      strike(p, o, { dmg: 30, kb: 950, lift: 520, heavy: 1, stop: .12 }, M);
      cross(o.x, mid(o), 200 * m.sz, colOf(M)); chip8('boom');
    } else pix(p.x + p.face * 60, p.y + 150, 10, [colOf(M), M.alt], 300, 10, .3);
  }
  p.target = POSE.idle;
  if (tt > .64) E.endMove(p);
} };
// hold 2: COMBO BREAKER, sixteen, the count over them, and an uppercut
const COMBO = { name: 'Combo Breaker', cd: 8, dur: 9, run(p, m, t) {
  const tt = t * m.sp, M = m.M;
  if (m.o === undefined) {
    const o = focus(); m.o = o && can(o, true) && Math.abs(o.x - p.x) < 1200 ? o : null;
    if (m.o) { pix(p.x, p.y + 150, 12, [colOf(M), M.alt], 380, 12, .3); const side = m.o.x >= p.x ? 1 : -1; p.x = clamp(m.o.x - side * 120, -955, 955); p.face = side; chip8('dash'); }
  }
  const o = m.o;
  p.vx = 0; p.rate = 50;
  if (!o || o.ko) { p.target = POSE.idle; if (tt > .3) E.endMove(p); return; }
  if (!o.net) o.vx = 0;
  if (tt < 1) {
    const n = Math.min(16, Math.floor(tt / .058) + 1);
    while ((m.n || 0) < n) {
      m.n = (m.n || 0) + 1;
      p.target = [POSE.jab, POSE.cross, POSE.hook, POSE.kick][m.n % 4];
      if (can(o, true)) strike(p, o, { dmg: 5, kb: 0, stun: .7, stop: .02, mute: m.n % 3 }, M);
      if (!m.w) m.w = word(o.x, o.y + 360 * hs(o), '', colOf(M), 30, 1.6);
      m.w.n = 'x' + m.n + ' COMBO'; m.w.t = 0; m.w.x = o.x;
      if (m.n % 2) sfx.whoosh();
    }
    return;
  }
  if (!m.up) {
    m.up = 1; p.target = POSE.crush;
    strike(p, o, { dmg: 50, kb: 300, lift: 1100, heavy: 1, stop: .18 }, M);
    cross(o.x, mid(o), 220 * m.sz, colOf(M)); chip8('boom'); cam.shake = Math.max(cam.shake, 16);
    word(o.x, o.y + 420 * hs(o), 'COMBO BREAKER!', GOLD, 30, 1.4);
  }
  if (tt > 1.3) E.endMove(p);
} };

// 3: CARTRIDGE SLAM, a cartridge the size of a car comes down on them
function cartridge(x, M, sz, follow) {
  const q = { x, y: 1300, t: 0, life: 1.2, M, sz, landed: false,
    upd(q, dt) {
      if (!q.landed) {
        if (follow && !follow.ko && q.t < .2) q.x = lerp(q.x, follow.x, .2);
        const u = Math.min(1, q.t / .32); q.y = 1300 * (1 - u * u);
        if (u >= 1) {
          q.landed = true; q.y = 0; chip8('boom'); cam.shake = Math.max(cam.shake, 22);
          for (const o of targets()) {
            const d = Math.abs(o.x - q.x);
            if (d < 150 * sz && can(o, true)) strike(E.P1, o, { dmg: 80, kb: 500, lift: 720, heavy: 1, stop: .16 }, M);
            else if (d < 440 * sz && o.y < 120 && can(o)) strike(E.P1, o, { dmg: 20, kb: 700, lift: 300, stop: .06 }, M);
          }
          pix(q.x, 20, 26, [colOf(M), M.alt, '#7c7c88'], 700, 16, .7); cross(q.x, 60, 300 * sz, colOf(M), .45); V.rocks(q.x, 0, 8);
        }
      } else if (q.t > .95 && !q.broke) { q.broke = 1; pix(q.x, 150 * sz, 30, ['#7c7c88', '#5a5a66', colOf(M)], 520, 18, .6); }
    },
    draw(q) { if (!q.broke) drawCart(q.x, q.y, q.sz, colOf(q.M)); } };
  props.push(q);
  return q;
}
// a game cartridge standing on (x, y): grey, ridged, a label in the mode's colour, gold pins (the BIT KING drops them too: bitmode.js)
function drawCart(x, y, sz, col) {
  const w = 230 * sz, h = 270 * sz, a = F(x - w / 2, y + h), b = F(x + w / 2, y), k = a[2];
  const x0 = a[0], y0 = a[1], W = b[0] - a[0], Hh = b[1] - a[1], u = 1 / 23;
  g.fillStyle = INK; g.fillRect(x0 - 3 * k, y0 - 3 * k, W + 6 * k, Hh + 6 * k);
  g.fillStyle = '#80808c'; g.fillRect(x0, y0, W, Hh);
  g.fillStyle = '#9a9aa8'; g.fillRect(x0, y0, W, Hh * .08);
  g.fillStyle = '#5c5c68'; for (let i = 0; i < 5; i++) g.fillRect(x0 + W * (.12 + i * .17), y0 + Hh * .1, W * .08, Hh * .06);
  g.fillStyle = INK; g.fillRect(x0 + W * .1, y0 + Hh * .24, W * .8, Hh * .5);
  g.fillStyle = col; g.fillRect(x0 + W * .13, y0 + Hh * .27, W * .74, Hh * .44);
  g.fillStyle = INK; g.font = `${Math.max(8, W * .16) | 0}px ${PIX}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BIT', x0 + W / 2, y0 + Hh * .49);
  g.fillStyle = GOLD; for (let i = 0; i < 9; i++) g.fillRect(x0 + W * (.08 + i * u * 2), y0 + Hh * .88, W * u, Hh * .1);
}
const SLAM = { name: 'Cartridge Slam', cd: 5, dur: 9, run(p, m, t) {
  init(p, m);
  if (!decided(p, m, t, CRASH)) return;
  const tt = (t - m.t0) * m.sp;
  p.vx = 0; p.rate = 30; p.target = SKY;
  if (!m.cx) { const o = focus(); m.cx = o ? o.x : p.x + p.face * 420; }
  if (tt >= .22 && !m.c) { m.c = cartridge(m.cx, m.M, m.sz, m.M.f.home ? focus() : null); chip8('fall'); }
  if (tt > .62) E.endMove(p);
} };
// hold 3: SYSTEM CRASH, they hang, ERROR all over them, and then the crash
const CRASH = { name: 'System Crash', cd: 10, dur: 9, run(p, m, t) {
  const tt = t * m.sp, M = m.M;
  p.vx = 0; p.rate = 30; p.target = POSE.div;
  if (!m.lock) {
    m.lock = 1; const o = focus();
    if (o && can(o, true)) { m.o = o; o.bkIce = E.T + 1.9; word(o.x, o.y + 380 * hs(o), 'ERROR', '#ff3dd8', 30, 1.3); chip8('err'); }
  }
  const o = m.o;
  if (o && !o.ko && tt < 1.15 && Math.random() < .8) parts.push({ x: o.x + rnd(-70, 70) * hs(o), y: o.y + rnd(20, 300) * hs(o), vx: rnd(-60, 60), vy: 0, s: rnd(10, 26), col: ['#ff3dd8', '#3dfcff', '#ffe83d', '#fff', INK][Math.random() * 5 | 0], t: 0, life: .14 });
  if (tt >= 1.15 && !m.f) {
    m.f = 1;
    if (o && !o.ko) { strike(p, o, { dmg: 160, exact: 1, kb: 700, lift: 560, heavy: 1, stop: .22 }, M); cross(o.x, mid(o), 260 * m.sz, '#ff3dd8'); word(o.x, o.y + 440 * hs(o), 'FATAL ERROR', '#ff3dd8', 30, 1.4); chip8('boom'); cam.shake = Math.max(cam.shake, 20); }
  }
  if (tt > 1.45) E.endMove(p);
} };

// 4: MEGA BEAM, as tall as he is
const BEAM = { name: 'Mega Beam', cd: 6, dur: 9, run(p, m, t) {
  init(p, m);
  if (!decided(p, m, t, ORBIT)) return;
  const tt = (t - m.t0) * m.sp;
  p.vx = 0; p.rate = 30;
  if (tt < .32) { p.target = POSE.divWind; m.ch = tt / .32; return; }
  p.target = POSE.div; m.ch = 0;
  if (!m.on) {
    m.on = 1; chip8('beam'); cam.shake = Math.max(cam.shake, 10);
    const o = m.M.f.home && focus(); m.y = o ? clamp(mid(o), 90, 300) : p.y + 175 * hs(p);
  }
  m.bt = tt - .32;
  const k = Math.floor(m.bt / .05);
  if (k !== m.k && k < 14) {
    m.k = k; const half = 72 * m.sz;
    for (const o of targets()) {
      const dx = (o.x - p.x) * p.face;
      if (can(o) && dx > -20 && dx < 1900 && o.y < m.y + half && o.y + 290 * hs(o) > m.y - half) strike(p, o, { dmg: 7, kb: 120, stun: .32, stop: .012, mute: k % 2 }, m.M);
    }
  }
  if (tt > 1.2) E.endMove(p);
}, draw(p, m) {
  if (m.ch) { const s = 14 + 40 * m.ch * m.sz; bit(p.x + p.face * 80, p.y + 175 * hs(p), s, colOf(m.M), .8); return; }
  if (!m.on || m.bt > .72) return;
  const u = m.bt / .72, half = 72 * m.sz * (u < .1 ? u / .1 : u > .85 ? (1 - u) / .15 : 1), x0 = p.x + p.face * 80, x1 = p.x + p.face * 1950;
  const a = F(Math.min(x0, x1), m.y + half), b = F(Math.max(x0, x1), m.y - half), M = m.M;
  const h = b[1] - a[1];
  g.fillStyle = INK; g.fillRect(a[0], a[1] - 4, b[0] - a[0], h + 8);
  g.fillStyle = colOf(M); g.fillRect(a[0], a[1], b[0] - a[0], h);
  g.fillStyle = M.alt; g.fillRect(a[0], a[1] + h * .25, b[0] - a[0], h * .5);
  g.fillStyle = '#fff'; g.fillRect(a[0], a[1] + h * .4, b[0] - a[0], h * .2);
  g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = a[1]; y < b[1]; y += 6) g.fillRect(a[0], y, b[0] - a[0], 2);
  for (let i = 0; i < 6; i++) bit(p.x + p.face * rnd(100, 1900), m.y + rnd(-half, half) * 1.3, rnd(10, 24) * m.sz, Math.random() < .5 ? '#fff' : colOf(M), .9);
} };
// hold 4: ORBITAL LASER, from the top of the screen, wherever they went
const ORBIT = { name: 'Orbital Laser', cd: 10, dur: 9, run(p, m, t) {
  const tt = t * m.sp;
  p.vx = 0; p.rate = 30; p.target = SKY;
  const o = focus();
  if (m.x === undefined) { m.x = o ? o.x : p.x + p.face * 420; chip8('err'); }
  if (tt < .7 && o && !o.ko) m.x = lerp(m.x, o.x, .14);
  if (tt >= .7) {
    if (!m.f) { m.f = 1; chip8('beam'); }
    const k = Math.floor((tt - .7) / .08);
    if (k !== m.k && k < 6) {
      m.k = k; cam.shake = Math.max(cam.shake, 9);
      for (const q of targets()) if (can(q, true) && Math.abs(q.x - m.x) < 115 * m.sz) strike(p, q, { dmg: 30, kb: 60, stun: .5, stop: .04, heavy: k === 5, lift: k === 5 ? 500 : 0 }, m.M);
      pix(m.x, 10, 6, [colOf(m.M), '#fff'], 500, 12, .4);
    }
  }
  if (tt > 1.35) E.endMove(p);
}, draw(p, m) {
  if (m.x === undefined) return;
  const tt = m.t * m.sp, col = colOf(m.M);
  if (tt < .7) {                                    // the reticle on them
    const c = F(m.x, 150), r = (130 - 60 * tt / .7) * c[2] * m.sz, s = Math.max(3, r * .12);
    g.fillStyle = col;
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { g.fillRect(c[0] + dx * r - (dx > 0 ? s * 3 : 0), c[1] + dy * r - (dy > 0 ? s : 0), s * 3, s); g.fillRect(c[0] + dx * r - (dx > 0 ? s : 0), c[1] + dy * r - (dy > 0 ? s * 3 : 0), s, s * 3); }
    g.fillRect(c[0] - s / 2, c[1] - s / 2, s, s);
    return;
  }
  if (tt > 1.25) return;
  const u = (tt - .7) / .55, w = 115 * m.sz * (u < .1 ? u / .1 : u > .8 ? (1 - u) / .2 : 1), top = F(m.x - w, 2400), bot = F(m.x + w, 0);
  g.fillStyle = INK; g.fillRect(top[0] - 4, -20, bot[0] - top[0] + 8, bot[1] + 20);
  g.fillStyle = col; g.fillRect(top[0], -20, bot[0] - top[0], bot[1] + 20);
  g.fillStyle = m.M.alt; g.fillRect(top[0] + (bot[0] - top[0]) * .25, -20, (bot[0] - top[0]) * .5, bot[1] + 20);
  g.fillStyle = '#fff'; g.fillRect(top[0] + (bot[0] - top[0]) * .4, -20, (bot[0] - top[0]) * .2, bot[1] + 20);
} };

/* ---------- the same four in the air ---------- */
// 1: BIT RAIN
const RAIN = { name: 'Bit Rain', dur: 9, hover: 1, run(p, m, t) {
  init(p, m);
  const tt = t * m.sp, M = m.M;
  p.vy = 0; p.vx *= .9; p.target = OPEN; p.rate = 30;
  const n = Math.min(12, Math.floor(tt / .05) + 1);
  while ((m.n || 0) < n) {
    m.n = (m.n || 0) + 1;
    const o = focus(), cx = o ? o.x : p.x + p.face * 320;
    for (let i = 0; i < M.f.count; i++) shots.push({ p, M, x: cx + rnd(-80, 80) + (i - (M.f.count - 1) / 2) * 150, y: p.y + 260 + rnd(0, 120), vx: rnd(-30, 30), vy: -1500 * m.sp, s: 22 * m.sz, dmg: 5, kb: 90, stun: .3, down: 1, home: M.f.home ? 700 : 0, hit: new Set(), t: 0, life: 1.4 });
    chip8('pew');
  }
  if (tt > .74) E.endMove(p);
} };
// 2: SPRITE DIVE
const DIVE = { name: 'Sprite Dive', dur: 9, run(p, m, t) {
  init(p, m);
  const tt = t * m.sp, M = m.M;
  p.rate = 40;
  if (!m.ph) {
    p.vy = 150; p.vx = 0; p.target = KNEE;
    if (tt >= .12) { m.ph = 'dive'; const o = focus(); m.tx = o ? o.x : p.x + p.face * 500; chip8('dive'); chip8('dash'); }
    return;
  }
  if (m.ph === 'dive') {
    p.target = KNEE;
    if (!p.ground && p.y > 0) {                       // straight at the spot on the floor where they stand
      const o = focus(); if (o) m.tx = lerp(m.tx, o.x, .2);
      const dx = m.tx - p.x, dy = -Math.max(1, p.y), L = Math.hypot(dx, dy) || 1;
      p.vx = dx / L * 3200 * m.sp; p.vy = dy / L * 3200 * m.sp; p.face = dx >= 0 ? 1 : -1;
      parts.push({ x: p.x, y: p.y + rnd(60, 260), vx: 0, vy: 300, s: 16 * m.sz, col: Math.random() < .5 ? colOf(M) : M.alt, t: 0, life: .2 });
      if (tt > 1.4) E.endMove(p);
      return;
    }
    m.ph = 'up';
    for (const o of targets()) if (can(o, true) && Math.abs(o.x - p.x) < 175 * m.sz && o.y < 300) strike(p, o, { dmg: 65, kb: 720, lift: 640, heavy: 1, stop: .12 }, M);
    cross(p.x, 30, 230 * m.sz, colOf(M)); cam.shake = Math.max(cam.shake, 16); chip8('boom');
    p.vy = 560; p.vx = -p.face * 200; p.ground = false; p.y = Math.max(p.y, 1);
    return;
  }
  p.target = POSE.jump;
  if ((p.ground && tt > .3) || tt > 2.2) E.endMove(p);
} };
// 3: 8-BIT BOMB, and the cross it goes off in
function explode(s) {
  const M = s.M, sz = s.sz || 1, x = s.x, y = Math.max(40, s.y), R = 340 * sz;
  cross(x, y, R, colOf(M), .55); chip8('boom'); cam.shake = Math.max(cam.shake, 18);
  pix(x, y, 18, [colOf(M), M.alt, '#fff'], 640, 16, .55);
  for (const o of targets()) {
    if (!can(o, true)) continue;
    const dx = Math.abs(o.x - x), arm = (dx < R && Math.abs(mid(o) - y) < 120 * sz + 150) || (dx < 90 * sz + 40 && o.y < y + R);
    if (arm) strike(s.p, o, { dmg: 90, kb: 820, lift: 720, heavy: 1, stop: .14 }, M);
  }
}
const BOMB = { name: '8-Bit Bomb', dur: 9, run(p, m, t) {
  init(p, m);
  const tt = t * m.sp, M = m.M;
  p.rate = 36; p.target = tt < .12 ? POSE.crushWind : POSE.crush;
  if (!m.f && tt >= .12) {
    m.f = 1; const o = focus(), tx = o ? o.x : p.x + p.face * 520;
    for (let i = 0; i < M.f.count; i++) {
      const dx = tx - p.x + (i - (M.f.count - 1) / 2) * 260;
      shots.push({ p, M, sz: m.sz, bomb: 1, x: p.x + p.face * 50, y: p.y + 210, vx: dx / .6, vy: 420, grav: 2200, s: 48 * m.sz, dmg: 0, down: 1, home: 0, hit: new Set(), t: 0, life: 3, touch: s => explode(s), floor: s => explode(s) });
    }
    chip8('fall');
  }
  if (tt > .42) E.endMove(p);
} };
// 4: PIXEL STORM, every way at once, twice
const STORM = { name: 'Pixel Storm', dur: 9, hover: 1, run(p, m, t) {
  init(p, m);
  const tt = t * m.sp, M = m.M;
  p.vy = 0; p.vx *= .85; p.rate = 40; p.target = OPEN; p.spin = Math.cos(tt * 20);
  for (const [i, at] of [[0, .1], [1, .45]]) if (tt >= at && !m['w' + i]) {
    m['w' + i] = 1; chip8('pew'); chip8('big');
    for (let j = 0; j < 8; j++) {
      const a = j / 8 * TAU + i * TAU / 16, v = 1300 * m.sp;
      shots.push({ p, M, x: p.x, y: p.y + 160, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 20 * m.sz, dmg: 5, kb: 140, stun: .3, down: 1, home: M.f.home ? 1300 : 600, hit: new Set(), t: 0, life: 1.1 });      // (they all bend round for them a little; LOCK-ON, a lot)
    }
  }
  if (tt > .8) { p.spin = 1; E.endMove(p); }
} };
const MOVES = { strikes: BLASTER, crush: DASH, div: SLAM, manji: BEAM };
const AIR = { strikes: RAIN, crush: DIVE, div: BOMB, manji: STORM };

/* ---------- RMB / C / the wheel: the next mode, and MODE SHIFT as it changes ---------- */
let scd = 0, bannerT = 0;
const SCD = 2.5;
function shiftStrike(p) {
  const M = mode();
  chip8('mode');
  pix(p.x, p.y + 150, 20, [colOf(M), M.alt, '#fff'], 700, 13, .45);
  V.ring(p.x, p.y + 150, 260, colOf(M), .3);
  if (scd > 0) return;
  scd = SCD;
  for (const o of targets()) if (can(o) && Math.abs(o.x - p.x) < 270 && o.y < 300) strike(p, o, { dmg: 25, kb: 620, lift: 280, stop: .06 }, M);
}
function setMode(i, quiet) {
  i = ((i % MODES.length) + MODES.length) % MODES.length;
  if (i === mi) return;
  mi = i; S.mode = i; saveSoon();
  paintMode(true);
  const p = E.P1;
  if (!quiet && on() && fighting() && p && !p.dead) shiftStrike(p);
}

/* ---------- E: SAVE STATE, then LOAD STATE ---------- */
let saved = null, ecd = 0;
const ECD = 14;
const ESP = { jp: 'セーブ', col: GREEN, name: () => (saved ? 'Load State' : 'Save State'), get left() { return ecd; }, get max() { return ECD; },
  press(p) {
    if (p.dead) return true;
    if (!saved) {
      if (ecd > 0) { sfx.back(); return true; }
      saved = { hp: p.hp, x: p.x };
      word(p.x, p.y + 400, 'SAVED', GREEN, 24, 1); chip8('save'); pix(p.x, p.y + 330, 10, [GREEN, '#fff'], 260, 10, .4);
      return true;
    }
    const s = saved; saved = null; ecd = ECD;
    pix(p.x, p.y + 150, 22, [GREEN, '#fff', colOf(mode())], 620, 13, .45);
    if (p.move) E.endMove(p);
    p.hp = Math.max(p.hp, s.hp); p.x = clamp(s.x, -955, 955); p.y = 0; p.vy = 0; p.vx = 0; p.ground = true; p.ps = null; p.stun = 0; p.inv = Math.max(p.inv || 0, .6);
    pix(p.x, p.y + 150, 22, [GREEN, '#fff'], 620, 13, .45);
    word(p.x, p.y + 400, 'LOADED', GREEN, 24, 1); chip8('load');
    return true;
  } };

/* ---------- G: KILL SCREEN ---------- */
let ks = null;                                       // { t, side, x }: the screen breaking, while it lasts
const KILL = { dur: 9, run(p, m, t) {
  const M = m.M || (m.M = mode());
  p.vx = 0; p.inv = Math.max(p.inv || 0, .3); p.rate = 26;
  if (!m.go) { m.go = 1; m.n = 0; ks = { t: 0, side: p.face, x: p.x, M, seed: Math.random() * 1e4 }; chip8('kill'); E.banner('崩壊', 'KILL SCREEN', 'sm'); }
  ks.t = t; ks.x = p.x;
  p.target = t < .5 ? POSE.divWind : SKY;
  const N = duel() ? 10 : 50;
  if (t >= .6 && t < 3.6) {
    const k = Math.floor((t - .6) / (3 / N));
    while (m.n <= k && m.n < N) {
      m.n++;
      for (const o of targets()) if ((o.x - p.x) * ks.side > -40) { o.bkIce = E.T + .25; if (!o.net) o.vx = 0; strike(p, o, { dmg: 30, exact: 1, flat: 1, kb: 0, stun: .6, stop: 0, mute: m.n % 3 !== 0 }, M); }
    }
  }
  if (t >= 3.6 && !m.end) { m.end = 1; chip8('over'); for (const o of targets()) if ((o.x - p.x) * ks.side > -40) word(o.x, o.y + 420, 'GAME OVER', '#ff2440', 30, 1.5); }
  if (t > 4.1) { ks = null; E.endMove(p); }
} };
// drawn over everything, in screen space: tiles of garbage, as an old game's last level was when its counter ran out
function drawKill() {
  if (!ks) return;
  const VW = E.VW, VH = E.VH, sx = F(ks.x, 0)[0], u = clamp((ks.t - .2) / .5, 0, 1), out = ks.t > 3.6 ? clamp((ks.t - 3.6) / .45, 0, 1) : 0;
  const TS = 28, cols = Math.ceil(VW / TS) + 1, rows = Math.ceil(VH / TS) + 1, edge = ks.side > 0 ? sx + 40 : sx - 40;
  const tick = Math.floor(E.T * 14);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = c * TS, y = r * TS, h = Math.sin((c * 12.9898 + r * 78.233 + ks.seed) * 43758.5453), hv = h - Math.floor(h);
    const jag = (Math.sin(r * 1.7 + ks.seed) * .5 + .5) * 3 * TS, inside = ks.side > 0 ? x > edge + jag : x + TS < edge - jag;
    if (!inside || hv > u * 1.15 || hv < out) continue;
    const kind = Math.floor((hv * 97 + tick * (hv > .5 ? 1 : 0)) % 7);
    g.globalAlpha = .9;
    g.fillStyle = ['#000', RAINBOW[(c + r + tick) % 10], INK, '#1a1a2e', colOf(ks.M), '#000', '#fff'][kind]; g.fillRect(x, y, TS, TS);
    if (kind === 2 || kind === 3) { g.fillStyle = RAINBOW[(c * 3 + r) % 10]; g.font = `${TS - 6}px ${PIX}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('@#%&?!0123456789ABZ'[(c * 7 + r * 3 + tick) % 19], x + TS / 2, y + TS / 2 + 1); }
    if (kind === 5) { g.fillStyle = GREEN; g.fillRect(x + 4, y + 4, 8, 8); g.fillRect(x + 16, y + 14, 8, 8); }
  }
  g.globalAlpha = 1;
  if (ks.t > 3.55) {
    const a = clamp((ks.t - 3.55) / .2, 0, 1) * (1 - out * .6), cx = ks.side > 0 ? (sx + VW) / 2 : sx / 2;
    g.globalAlpha = a; g.font = `44px ${PIX}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#000'; g.fillText('GAME OVER', cx + 4, VH * .42 + 4); g.fillStyle = '#ff2440'; g.fillText('GAME OVER', cx, VH * .42);
    g.globalAlpha = 1;
  }
}

/* ---------- EXTRA LIFE ---------- */
let lives = 1;
const ls0 = H.lastStand;
H.lastStand = () => {
  const p = E.P1;
  if (on() && lives > 0 && !duel() && p) {
    lives--;
    p.hp = p.max; p.dead = false; p.ps = 'up'; p.stun = .35; p.inv = 2.4; p.vx = 0;
    word(p.x, p.y + 420, '1UP!', GREEN, 36, 1.5); pix(p.x, p.y + 150, 30, [GREEN, GOLD, '#fff'], 760, 14, .7); chip8('up');
    E.banner('残機', 'EXTRA LIFE', 'sm');
    return true;
  }
  return ls0 ? ls0() : false;
};

/* ---------- his look: black and green, a crown of bits, eyes and a core in the colours of his mode ---------- */
function skinFor(col) {
  return {
    torso: ['#14472a', '#1f6b3c'],
    armF: ['#14472a', '#1f6b3c', '#1c1c24', '#33333f', .25],
    armB: ['#0c2e1a', '#134226', '#101016', '#1c1c24', .25],
    legF: ['#123c24', '#1a5934', '#1c1c24', '#33333f', .2],
    legB: ['#0b2816', '#123a21', '#101016', '#1c1c24', .2],
    chest() {
      const c = col(), TOR = E.TOR;
      g.fillStyle = 'rgba(57,255,20,.26)';
      g.fillRect(-26, -TOR + 14, 52, 3); g.fillRect(-26, -TOR + 46, 52, 3); g.fillRect(-14, -TOR + 14, 3, 32); g.fillRect(-4, -TOR + 46, 3, 20);
      g.fillStyle = INK; g.fillRect(1, -TOR + 19, 24, 24);
      g.fillStyle = c; g.fillRect(4, -TOR + 22, 18, 18);
      g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(4, -TOR + 22, 6, 6);
      g.fillStyle = GOLD; g.fillRect(-30, -13, 60, 6);
      g.fillStyle = '#9a7412'; for (let i = 0; i < 6; i++) g.fillRect(-28 + i * 10, -13, 4, 6);
    },
    back() { const TOR = E.TOR; g.fillStyle = '#4a0d72'; g.fillRect(-31, -TOR + 2, 24, TOR + 10); g.fillStyle = '#6c1ba6'; g.fillRect(-31, -TOR + 2, 8, TOR + 10); },
    head() {
      E.headBase('#174a29', '#22693a');
      const c = col();
      g.fillStyle = INK; g.fillRect(2, -11, 12, 11); g.fillRect(15, -11, 10, 11);
      g.fillStyle = c; g.fillRect(4, -9, 8, 7); g.fillRect(17, -9, 6, 7);
      g.fillStyle = '#fff'; g.fillRect(4, -9, 3, 3); g.fillRect(17, -9, 2, 2);
      g.fillStyle = c; for (let i = 0; i < 5; i++) g.fillRect(1 + i * 5, 8 + (i % 2 ? 2 : 0), 4, 3);
      g.fillStyle = '#07060c'; g.fillRect(-26, -37, 52, 16);
      g.fillStyle = GOLD; g.fillRect(-24, -34, 48, 10);
      for (const x of [-24, -6, 12]) { g.fillStyle = '#07060c'; g.fillRect(x - 2, -50, 16, 15); g.fillStyle = GOLD; g.fillRect(x, -48, 12, 14); }
      g.fillStyle = c; for (const x of [-21, -3, 15]) g.fillRect(x, -44, 6, 6);
      g.fillStyle = '#fff3c0'; g.fillRect(-24, -34, 48, 2);
    }
  };
}
const SKIN = skinFor(() => colOf(mode()));

/* ---------- the technique ---------- */
T.add('bitking', { name: 'BITKING', jp: 'ビット王', mark: '王', who: 'The King of Bits, from the BIT MODE DLC', odds: 0, col: GREEN, glow: 'green', moves: MOVES,
  awakened: true, secret: true, skin: SKIN, as: ['BITKING', 'ビット王'],
  hint: '<b>1</b>–<b>4</b> · <b>hold</b> one for a bigger one · the same four in the air · <b>E</b> Save / Load State · <b>G</b> Kill Screen · <b>RMB</b> / <b>C</b> / <b>wheel</b> the next of 50 modes',
  awkName: 'Kill Screen', awaken(p) { p.move = { def: KILL, t: 0 }; } });
DEF = T.TECH.bitking;
if (JU.especial) JU.especial.add('bitking', ESP);
JU.awakened.LIST.push({ id: 'bitking', secret: true, name: 'BITKING', mark: '王', col: GREEN,
  what: '15 moves and 50 modes. Pixel Blaster, Byte Dash, Cartridge Slam, Mega Beam (hold one for a bigger one), four more in the air, Save State on E, Kill Screen on G, and an extra life.',
  later: () => `Beat the BIT MODE DLC: the green button above Play. Stages cleared: ${Math.min(S.st, 5)} of 5.`,
  open: () => dev() || !!S.king });

/* ---------- the mode, on his health bar and across the screen as it changes ---------- */
const strip = document.createElement('div'); strip.className = 'bkm';
const fb = E.root.querySelector('.fb.p1'); if (fb) fb.appendChild(strip);
const ban = document.createElement('div'); ban.className = 'bkban'; ban.setAttribute('aria-live', 'polite'); E.root.appendChild(ban);
const two = n => (n < 10 ? '0' : '') + n;
function paintMode(loud) {
  const M = mode();
  E.root.classList.toggle('bkon', on());
  strip.style.setProperty('--c', M.col);
  strip.innerHTML = `<b>MODE ${two(M.n)}/50</b><span>${M.name}</span>`;
  strip.classList.toggle('king', !!M.king);
  if (loud && on()) {
    ban.style.setProperty('--c', M.col); ban.classList.toggle('king', !!M.king);
    ban.innerHTML = `<small>MODE ${two(M.n)}</small><b>${M.name}</b>`;
    ban.classList.remove('on'); void ban.offsetWidth; ban.classList.add('on');
    clearTimeout(bannerT); bannerT = setTimeout(() => ban.classList.remove('on'), 1100);
  }
}
let wheelAcc = 0, wheelAt = 0;
E.root.addEventListener('wheel', e => {
  if (!on() || !fighting()) return;
  e.preventDefault();
  wheelAcc += e.deltaY;
  const now = performance.now();
  if (Math.abs(wheelAcc) < 40 || now - wheelAt < 70) return;
  wheelAt = now; setMode(mi + (wheelAcc > 0 ? 1 : -1)); wheelAcc = 0;
}, { passive: false });

/* ---------- wiring ---------- */
const press0 = H.press, tick0 = H.tick, fx0 = H.fx, post0 = H.post, reset0 = H.reset, start0 = H.fightStart, rim0 = H.rim,
  grav0 = H.gravity, rate0 = H.foeRate, hit0 = H.hit, shift0 = H.shift;
H.press = (a, inScene) => {
  if (!inScene && on() && fighting()) {
    const p = E.P1;
    if (a === 'alt') { if (!p.dead) setMode(mi + 1); return true; }
    if (SLOTS.includes(a) && !p.ground && !p.move && !p.ps && !(p.dashT > 0) && !p.dead && !(E.cd[a] > 0)) {
      E.cd[a] = (E.CD[a] || 4) * mode().f.cdm; p.move = { def: AIR[a], key: a, t: 0 }; E.hud.mv[a].classList.add('act');
      return true;
    }
  }
  return press0 ? press0(a, inScene) : false;
};
H.gravity = p => (on() && p === E.P1 && p.move && p.move.def.hover ? 0 : grav0 ? grav0(p) : 1);
H.foeRate = o => (rate0 ? rate0(o) : 1) * (o.bkIce > E.T ? .06 : 1);
H.hit = (o, face, h, dmg) => {
  hit0(o, face, h, dmg);
  if (!on() || h.bk) return;
  const p = E.P1, m = p.move;
  if (m && m.def.m1 && o !== p) { const M = mode(); pix(o.x, mid(o), 5, [colOf(M), M.alt], 360, 10, .35); aura(p, o, face, dmg || h.dmg, M); }
};
H.rim = f => {
  if (f === E.P1 && on() && !f.dead) return { col: colOf(mode()), blur: 9 + 3 * Math.sin(E.T * 9) };
  if (f !== E.P1) {
    if (f.bkIce > E.T) return { col: '#7fe9ff', blur: 14, wash: '#cff6ff', a: .42 };
    const d = DOTS.find(x => x.o === f);
    if (d) return { col: d.col, blur: 10 + 3 * Math.sin(E.T * 12) };
  }
  return rim0 ? rim0(f) : null;
};
H.shift = d => {
  if (shift0) shift0(d);
  for (const L of [parts, shots, booms, words, props]) for (const q of L) if (typeof q.x === 'number') q.x -= d;
  for (const z of zaps) { z.x0 -= d; z.x1 -= d; }
  if (saved) saved.x -= d;
  if (ks) ks.x -= d;
};
H.tick = dt => {
  tick0(dt);
  if (scd > 0) scd = Math.max(0, scd - dt);
  if (ecd > 0) ecd = Math.max(0, ecd - dt);
  updShots(dt);
  for (let i = props.length - 1; i >= 0; i--) { const q = props[i]; q.t += dt; if (q.upd) q.upd(q, dt); if (q.t >= q.life) props.splice(i, 1); }
  for (let i = DOTS.length - 1; i >= 0; i--) {
    const d = DOTS[i];
    if (!d.o || d.o.ko) { DOTS.splice(i, 1); continue; }
    if ((d.t += dt) >= d.every) {
      d.t -= d.every; d.left--;
      chip(d.o, d.n, d.col); pix(d.o.x, mid(d.o), 3, [d.col], 200, 9, .4);
      if (d.left <= 0) DOTS.splice(i, 1);
    }
  }
  if (!on()) { if (E.root.classList.contains('bkon')) E.root.classList.remove('bkon'); ks = null; }
  else if (!E.root.classList.contains('bkon')) paintMode(false);
  if (ks && !(E.P1.move && E.P1.move.def === KILL)) ks = null;      // (cut short, by whatever ended it: the screen mends)
};
H.fx = dt => {
  fx0(dt);
  for (let i = parts.length - 1; i >= 0; i--) {
    const q = parts[i]; q.t += dt;
    if (q.t >= q.life) { parts.splice(i, 1); continue; }
    q.vy -= 1500 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.y < 0) { q.y = 0; q.vy *= -.35; q.vx *= .6; }
    sq(q.x, q.y, q.s, q.col, 1 - (q.t / q.life) ** 2);
  }
  for (const q of props) if (q.draw) q.draw(q);
  for (const s of shots) drawShot(s);
  for (let i = booms.length - 1; i >= 0; i--) {
    const b = booms[i]; b.t += dt;
    if (b.t >= b.life) { booms.splice(i, 1); continue; }
    const u = b.t / b.life, n = 5, step = b.r / n, s = step * 1.08 * (1 - u * .45), reach = Math.min(n, u * 3.5 * n);
    for (let j = 0; j <= reach; j++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if (!j && dx !== 1) continue; bit(b.x + dx * j * step, b.y + dy * j * step, s, j % 2 ? b.col : '#ffffff', 1 - u * u); }
  }
  for (let i = zaps.length - 1; i >= 0; i--) {
    const z = zaps[i]; z.t += dt;
    if (z.t >= z.life) { zaps.splice(i, 1); continue; }
    const n = 9;
    for (let j = 0; j <= n; j++) { const u = j / n; sq(lerp(z.x0, z.x1, u) + (j % 2 ? 0 : rnd(-14, 14)), lerp(z.y0, z.y1, u) + rnd(-26, 26), 12, j % 3 ? z.col : '#fff', 1 - z.t / z.life); }
  }
  const p = E.P1, m = p && p.move;
  if (on() && m && m.def.draw) m.def.draw(p, m);
  if (on() && saved && p && !p.dead) {                // a floppy over his head while there is something saved
    const c = F(p.x, p.y + 360 + 8 * Math.sin(E.T * 4)), k = c[2], s = 26 * k;
    g.fillStyle = INK; g.fillRect(c[0] - s / 2 - 2, c[1] - s / 2 - 2, s + 4, s + 4);
    g.fillStyle = '#2f6bff'; g.fillRect(c[0] - s / 2, c[1] - s / 2, s, s);
    g.fillStyle = '#d8dde8'; g.fillRect(c[0] - s * .3, c[1] - s / 2, s * .6, s * .32);
    g.fillStyle = '#fff'; g.fillRect(c[0] - s * .34, c[1] + s * .04, s * .68, s * .4);
  }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = words.length - 1; i >= 0; i--) {
    const w = words[i]; w.t += dt;
    if (w.t >= w.life) { words.splice(i, 1); continue; }
    if (!w.n) continue;
    const c = F(w.x, w.y + w.t * 50), u = w.t / w.life, sz = Math.max(8, w.size * c[2]) | 0;
    g.globalAlpha = u > .7 ? (1 - u) / .3 : 1; g.font = `${sz}px ${PIX}`;
    g.fillStyle = INK; for (const [dx, dy] of [[3, 3], [-2, 0], [2, 0], [0, -2], [0, 2]]) g.fillText(w.n, c[0] + dx * c[2], c[1] + dy * c[2]);
    g.fillStyle = w.col; g.fillText(w.n, c[0], c[1]);
    g.globalAlpha = 1;
  }
};
H.post = dt => { post0(dt); if (on()) drawKill(); };
function fresh() { clearAll(); saved = null; ks = null; scd = 0; ecd = 0; lives = 1; }
H.reset = () => { reset0(); fresh(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) fresh(); else { shots.length = 0; props.length = 0; } paintMode(false); };
paintMode(false);

JU.bitking = { S, save, MODES, ELEM, FORM, get mode() { return mi; }, setMode, SKIN, skinFor, GREEN, GOLD, PIX, RAINBOW,
  get unlocked() { return dev() || !!S.king; },
  unlock() { if (S.king) return false; S.king = 1; save(); return true; },
  fx: { bit, sq, pix, cross, word, zap, colOf, drawCart, drawKill }, chip: chip8,
  // for tests: what is flying, and how he stands
  get state() { return { mode: mi, shots: shots.length, props: props.length, dots: DOTS.length, saved: !!saved, lives, ecd: +ecd.toFixed(2), scd: +scd.toFixed(2), ks: !!ks }; } };
})();
