/* JUJUTSU UNLIMITEDS — Build 0.36: THE HUNDRED DOORS, a DLC. The user's: "our favourite Yuji will have tgo go through the entirety of doors
   1-100 but instead of the figure at doors 50 and 100 it will be a raid bossfight thats pretty easy and during it you also have to find books
   to weaken [it]. and at door 100 same but with switches", a wooden door of a button above Play with black goo round it, and their own door
   picture × the game's name on the DLC's page. The user asked for a crossover with another game; this is the user's design built with a
   place and monsters of this game's own (an inn of cursed spirits), not that game's hotel, creatures or name.
     THE INN      a hundred rooms, one after another, a numbered door at the far end of each. Through it, and it shuts behind you
     IN THE ROOMS chests to search (keys, healing talismans, now and then Cursed Tokens, notes the last guests left), closets to hide in
     WHAT LIVES THERE  THE STAMPEDE: the lamps shake and the floor rumbles; get into a closet before a herd of curses runs through ·
                  THE WATCHER: a dark room, an eye opens in the wall; keep still while it looks · THE GRASP: a black pool under your feet;
                  get off it · A MIMIC: one closet breathes; do not hide in that one · SEALED ROOMS: a curtain comes down; exorcise the
                  curses in it, with whatever technique, clan and tools are equipped
     DOOR 50      RAID BOSS: THE DOORKEEPER, in the inn's archive. Five books glow round the room: each one touched weakens it
     DOOR 100     RAID BOSS: THE DOORKEEPER again, every door of it open. Five switches: each one lights a lamp, and the light weakens it.
                  Beaten, the last door opens onto the street
   Every tenth room has a little shrine to rest at (all of your health back), and that is where you carry on from if you fall. The page:
   where you have got to, the hundred doors as a map, the records. Saved in ju.doors. Names and numbers are ours; no real names in it */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, P = E.P, cam = E.cam, H = E.hooks, POSE = E.POSE, sfx = JU.sfx, Fi = JU.fights, B = JU.boss, C = JU.cast, V = JU.vfx;
const { rnd, clamp, lerp } = E, TAU = Math.PI * 2, ZP = E.ZP, D = Fi.DEFS;
const $ = s => document.querySelector(s);
const dev = () => !!(JU.shop && JU.shop.dev);
const pad = n => String(n).padStart(3, '0');
const SERIF = "'Yuji Syuku', 'Yu Mincho', serif", SANS = "Oswald, 'Arial Narrow', sans-serif";
const LOGO = (window.JU_PICS && window.JU_PICS.doorlogo) || 'img/doorlogo.png';
const pick = a => a[Math.random() * a.length | 0];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ================= what the DLC has come to (ju.doors) ================= */
// best: the furthest room · cp: the room a run carries on from · runs, deaths, wins (times out of the inn) · k50 / k100: the bosses' first
// clears (paid once) · found: tokens found in chests, ever · music
const S = { best: 0, cp: 0, runs: 0, deaths: 0, wins: 0, k50: 0, k100: 0, found: 0, music: 1, fast: 0 };
try { Object.assign(S, JSON.parse(localStorage.getItem('ju.doors') || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem('ju.doors', JSON.stringify(S)); } catch (e) {} };
const cpRoom = n => n === 0 || n === 50 || n === 100 || n % 10 === 0;

/* ================= the sound of the place (made here, no files) ================= */
const SND = (() => {
  const ctx = () => (sfx.on && sfx.ctx) || null;
  function tone(f0, f1, dur, type, vol, at = 0, cut = 2400) {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + at, o = a.createOscillator(), v = a.createGain(), lp = a.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = cut; o.type = type;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    v.gain.setValueAtTime(.0001, t); v.gain.exponentialRampToValueAtTime(vol, t + Math.min(.02, dur / 4)); v.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(lp); lp.connect(v); v.connect(a.destination); o.start(t); o.stop(t + dur + .05);
  }
  function noise(dur, vol, freq, at = 0, type = 'lowpass', q = .8, fade = true) {
    const a = ctx(); if (!a) return;
    const n = Math.max(1, Math.floor(a.sampleRate * dur)), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (fade ? 1 - i / n : Math.min(1, i / (n * .3), (n - i) / (n * .2)));
    const s = a.createBufferSource(), f = a.createBiquadFilter(), v = a.createGain(), t = a.currentTime + at;
    s.buffer = buf; f.type = type; f.frequency.value = freq; f.Q.value = q; v.gain.value = vol;
    s.connect(f); f.connect(v); v.connect(a.destination); s.start(t);
  }
  // a hinge: a bow of friction, sticking and slipping (a sawtooth whose pitch wanders, through a narrow band)
  function creak(dur = .7, vol = .05, at = 0) {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + at, o = a.createOscillator(), f = a.createBiquadFilter(), v = a.createGain();
    o.type = 'sawtooth'; f.type = 'bandpass'; f.frequency.value = 1150; f.Q.value = 5;
    const N = 9, curve = new Float32Array(N);
    for (let i = 0; i < N; i++) curve[i] = 55 + Math.random() * 70 + (i === N - 1 ? 30 : 0);
    o.frequency.setValueCurveAtTime(curve, t, dur);
    v.gain.setValueAtTime(.0001, t); v.gain.exponentialRampToValueAtTime(vol, t + .06); v.gain.setValueAtTime(vol, t + dur * .7); v.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(f); f.connect(v); v.connect(a.destination); o.start(t); o.stop(t + dur + .05);
  }
  const L = {
    step() { noise(.05, .05, 300); },
    creak() { creak(.75, .06); },
    shut() { tone(90, 38, .3, 'sine', .5); noise(.12, .22, 500); },
    thud() { tone(70, 30, .4, 'sine', .55); noise(.2, .25, 260); },
    drawer() { noise(.22, .12, 900, 0, 'bandpass', 1.4, false); tone(160, 120, .08, 'triangle', .05, .2); },
    key() { tone(1400, 1300, .07, 'triangle', .05); tone(1900, 1800, .09, 'triangle', .04, .06); },
    coin() { tone(980, 980, .06, 'square', .03); tone(1310, 1310, .12, 'square', .03, .06, 3000); },
    heal() { tone(330, 660, .35, 'sine', .08); noise(.35, .05, 2400, 0, 'highpass'); },
    page() { noise(.18, .1, 3200, 0, 'bandpass', .7); noise(.12, .08, 2600, .1, 'bandpass', .7); },
    rumble() { noise(2.6, .32, 120, 0, 'lowpass', .7, false); tone(48, 40, 2.6, 'sine', .3); },
    herd() { noise(1.4, .5, 340, 0, 'lowpass', .8, false); tone(110, 60, 1.2, 'sawtooth', .07, 0, 500); for (let i = 0; i < 9; i++) tone(80, 40, .1, 'sine', .3, i * .13); },
    stir() { noise(1.2, .07, 1800, 0, 'bandpass', 3, false); tone(62, 58, 1.2, 'sine', .14); },
    seen() { tone(220, 110, .25, 'sawtooth', .06, 0, 900); noise(.2, .14, 700); },
    grasp() { noise(.4, .2, 380, 0, 'lowpass', 2); tone(140, 60, .35, 'triangle', .1); },
    bite() { noise(.08, .3, 1600); tone(260, 90, .2, 'square', .08, 0, 1200); noise(.1, .25, 900, .1); },
    flip() { tone(120, 90, .08, 'square', .1, 0, 900); noise(.06, .2, 1400); tone(60, 60, .9, 'sawtooth', .025, .08, 300); },
    lamp() { tone(330, 330, .5, 'triangle', .05); tone(495, 495, .6, 'triangle', .04, .05); },
    seal() { noise(.9, .2, 200, 0, 'lowpass', .7, false); tone(55, 41, 1, 'sawtooth', .07, 0, 400); },
    roar() { tone(90, 45, .9, 'sawtooth', .12, 0, 600); noise(.8, .3, 420, 0, 'lowpass', 1.2); },
    die() { tone(160, 40, 1.2, 'sawtooth', .07, 0, 700); noise(1, .2, 300); },
    out() { [262, 330, 392, 523].forEach((f, i) => tone(f, f, .5, 'triangle', .06, i * .14)); },
    knock(i = 0) { tone(110 - i * 8, 50, .16, 'sine', .55); noise(.05, .2, 700); }
  };
  return (name, ...a) => { try { if (L[name]) L[name](...a); } catch (e) {} };
})();

/* ---------- music: a low drone for the inn, drums for the Doorkeeper ---------- */
const MUS = (() => {
  let nodes = [], tm = 0, now = '';
  const ctx = () => (sfx.on && sfx.ctx) || null;
  function drum(a, at, f0, vol) {
    const o = a.createOscillator(), v = a.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(38, at + .3);
    v.gain.setValueAtTime(vol, at); v.gain.exponentialRampToValueAtTime(.0001, at + .4);
    o.connect(v); v.connect(a.destination); o.start(at); o.stop(at + .45);
  }
  function start(name) {
    if (now === name) return;
    stop();
    const a = ctx(); if (!a || !S.music) return;
    now = name;
    const out = a.createGain(); out.gain.value = 0; out.connect(a.destination);
    out.gain.linearRampToValueAtTime(name === 'boss' ? .05 : .035, a.currentTime + 2);
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = name === 'boss' ? 700 : 420; lp.connect(out);
    const fs = name === 'boss' ? [55, 58.3, 82.4] : name === 'event' ? [49, 73.4, 98.6] : [43.6, 65.4, 87.3];
    for (const f of fs) { const o = a.createOscillator(); o.type = f > 80 ? 'triangle' : 'sawtooth'; o.frequency.value = f; o.detune.value = rnd(-8, 8); o.connect(lp); o.start(); nodes.push(o); }
    const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = .07; lg.gain.value = 160; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(); nodes.push(lfo);
    nodes.push(out);
    let beat = 0;
    tm = setInterval(() => {
      const b = ctx(); if (!b) return;
      if (name === 'boss') { const t = b.currentTime + .05; drum(b, t, beat % 4 === 0 ? 110 : 80, beat % 4 === 0 ? .35 : .18); if (beat % 8 === 6) drum(b, t + .2, 90, .2); }
      else if (Math.random() < .07) SND('creak');           // the building settling, somewhere
      beat++;
    }, name === 'boss' ? 430 : 1600);
  }
  function stop() {
    clearInterval(tm); tm = 0; now = '';
    const a = ctx();
    for (const n of nodes) { try { if (n.gain && a) { n.gain.cancelScheduledValues(a.currentTime); n.gain.setTargetAtTime(0, a.currentTime, .2); setTimeout(() => n.disconnect(), 900); } else if (n.stop) n.stop(a ? a.currentTime + .8 : 0); } catch (e) {} }
    nodes = [];
  }
  return { start, stop, get now() { return now; } };
})();

/* ================= the inn: a wing every ten rooms, each its own colours ================= */
const WINGS = [
  { name: 'THE FRONT HALL', jp: '表館', wall: '#4b3a2a', pat: 'rgba(255,226,180,.07)', wain: '#2b1b10', floor: '#2e1e12', rug: '#5c1618', rug2: '#c9a050', wood: '#3a2414', woodS: '#24160c', woodT: '#4a301c', ceil: '#140d08', lamp: [255, 176, 96] },
  { name: 'THE GREEN WING', jp: '緑館', wall: '#26382f', pat: 'rgba(200,255,220,.05)', wain: '#1f1610', floor: '#2a1c12', rug: '#1d3a2c', rug2: '#b89a52', wood: '#33241a', woodS: '#21170f', woodT: '#45311f', ceil: '#0d120f', lamp: [235, 196, 120] },
  { name: 'THE LACQUER WING', jp: '漆館', wall: '#4c1b18', pat: 'rgba(255,190,160,.06)', wain: '#1c0d0a', floor: '#2a1712', rug: '#121010', rug2: '#b8862e', wood: '#2a0f0c', woodS: '#1a0908', woodT: '#3a1612', ceil: '#120706', lamp: [255, 150, 90] },
  { name: 'THE INDIGO WING', jp: '藍館', wall: '#20264a', pat: 'rgba(190,200,255,.06)', wain: '#151526', floor: '#231a14', rug: '#2a1c44', rug2: '#d8c690', wood: '#2c2230', woodS: '#1c1520', woodT: '#3c3040', ceil: '#0b0b16', lamp: [214, 200, 255] },
  { name: 'THE ASH WING', jp: '灰館', wall: '#3b3936', pat: 'rgba(255,255,255,.04)', wain: '#24221f', floor: '#2b2622', rug: '#3a2f2a', rug2: '#8c8270', wood: '#3a3530', woodS: '#26221e', woodT: '#4a443e', ceil: '#121110', lamp: [220, 210, 190] },
  { name: 'THE ARCHIVE WING', jp: '書館', wall: '#4a3b1c', pat: 'rgba(255,236,170,.07)', wain: '#2a1f0c', floor: '#2c2010', rug: '#3c1a0c', rug2: '#d9b25a', wood: '#3c2a12', woodS: '#271b0b', woodT: '#4e3818', ceil: '#141007', lamp: [255, 200, 110] },
  { name: 'THE PLUM WING', jp: '梅館', wall: '#3c1f38', pat: 'rgba(255,200,240,.06)', wain: '#21121f', floor: '#2a1a1c', rug: '#561c3a', rug2: '#e0b7c8', wood: '#2e1a28', woodS: '#1d1019', woodT: '#3e2436', ceil: '#100810', lamp: [255, 170, 200] },
  { name: 'THE BURNT WING', jp: '焦館', wall: '#251b15', pat: 'rgba(255,120,60,.05)', wain: '#140e0a', floor: '#1e1510', rug: '#2a0d08', rug2: '#6a3a1c', wood: '#1c130e', woodS: '#120c08', woodT: '#2a1c14', ceil: '#0a0705', lamp: [255, 120, 60] },
  { name: 'THE RED WING', jp: '紅館', wall: '#5c1016', pat: 'rgba(255,160,160,.06)', wain: '#2a080b', floor: '#2a1210', rug: '#14080a', rug2: '#c9a050', wood: '#2c0c0e', woodS: '#1c0709', woodT: '#3c1214', ceil: '#120405', lamp: [255, 110, 100] },
  { name: 'THE LAST WING', jp: '終館', wall: '#16130f', pat: 'rgba(255,215,140,.05)', wain: '#0d0b08', floor: '#15110c', rug: '#0c0a08', rug2: '#b8862e', wood: '#1a1510', woodS: '#100d0a', woodT: '#251e17', ceil: '#070605', lamp: [255, 214, 140] }
];
const WZ = ZP + 230, CEIL = 600, SW = 1050, ENT = -790, DW = 210, DH = 382;
const wingOf = n => WINGS[clamp(Math.floor(Math.max(0, n - 1) / 10), 0, 9)];
const NOTES = [
  'If the lamps start to shake, do not stand there looking at them.',
  'The closets are safe. Not the one that breathes.',
  'It cannot see you if you do not move. I am almost sure of it.',
  'Fifty doors down there is a room full of books. It hates the books.',
  'At the very end I turned on one light, and it screamed.',
  'The key is always in a drawer. Always the last one you look in.',
  'Whoever built this inn wanted the guests to stay.',
  'Do not count the doors. They are counting you.',
  'There is a shrine every ten rooms. Rest there. You will not get another chance.',
  'I heard knocking from the other side of a door I had already come through.',
  'The black pools on the floor are hands. Keep walking.',
  'Room service has not come in a long time.'
];

/* ================= a room: what is in it, and what will happen there ================= */
// kinds: lobby (0) · shrine (every tenth) · calm (49, 99) · boss (50, 100) · plain · locked · sealed · stampede · dark (a Watcher) · grasp
let forced = null;                                   // (tests: the kind the next ordinary room will be, JU.doors.next)
function kindOf(n) {
  if (n === 0) return 'lobby';
  if (n === 50 || n === 100) return 'boss';
  if (n % 10 === 0) return 'shrine';
  if (forced) { const k = forced; forced = null; return k; }
  if (n === 49 || n === 99 || n === 1) return 'calm';
  const w = [['plain', 30], ['locked', n >= 3 ? 20 : 0], ['sealed', n >= 2 ? 16 : 0], ['stampede', n >= 4 ? 15 : 0], ['dark', n >= 7 ? 11 : 0], ['grasp', n >= 13 ? 9 : 0]];
  if (run && run.last) w.forEach(x => { if (x[0] === run.last && x[0] !== 'plain') x[1] *= .3; });      // (rarely the same thing twice running)
  let r = Math.random() * w.reduce((s, x) => s + x[1], 0);
  for (const [k, v] of w) if ((r -= v) < 0) return k;
  return 'plain';
}
function gen(n) {
  const kind = kindOf(n), pal = n === 50 ? WINGS[5] : n === 100 ? WINGS[9] : wingOf(n);
  const R = { n, kind, pal, t: 0, items: [], words: [], dark: kind === 'dark', ev: null, sealed: kind === 'sealed', curtain: 0, flick: 0, shake: 0, motes: [] };
  R.ex = kind === 'boss' ? 0 : kind === 'lobby' ? 640 : Math.round(rnd(420, 860));
  R.door = { door: 1, x: R.ex, w: kind === 'boss' ? 300 : DW, h: kind === 'boss' ? 440 : DH, num: n + 1, open: 0, locked: kind === 'locked' || kind === 'boss', sealed: kind === 'sealed', last: n === 100 };
  R.ent = { x: ENT, w: DW, h: DH, num: n, open: 0, back: 1 };
  if (kind === 'boss') { R.ent.x = -820; R.boss = 1; }
  for (let i = 0; i < 24; i++) R.motes.push({ x: rnd(-1000, 1000), y: rnd(40, 520), z: rnd(ZP - 150, WZ - 60), v: rnd(4, 14), ph: rnd(0, TAU) });
  if (kind !== 'boss') furnish(R);
  if (kind === 'stampede') R.ev = { kind, ph: 'wait', at: rnd(1.6, 3.4), t: 0, dir: Math.random() < .5 ? 1 : -1, pack: [], warn: clamp(2.7 - n * .008, 1.9, 2.7) };
  if (kind === 'dark') R.ev = { kind: 'watcher', ph: 'shut', t: 0, next: rnd(2.2, 3.6), x: 0, seen: 0 };
  if (kind === 'grasp') R.ev = { kind, t: 0, next: rnd(1.6, 2.6), pools: [] };
  R.stage = roomStage(R);
  return R;
}
// what stands along the back wall, between the two doors
function furnish(R) {
  const taken = [[R.ent.x - 150, R.ent.x + 150], [R.ex - 150, R.ex + 150]];
  const free = (a, b) => a > -985 && b < 985 && !taken.some(([l, r]) => b > l && a < r);
  const put = (kind, w, o, xs) => {
    for (const x of xs || shuffle([-560, -400, -240, -80, 80, 240, 400, 560, 720, 880, -940].map(v => v + rnd(-30, 30)))) {
      if (!free(x - w / 2, x + w / 2)) continue;
      taken.push([x - w / 2 - 24, x + w / 2 + 24]);
      const it = Object.assign({ kind, x, w }, o); R.items.push(it); return it;
    }
    return null;
  };
  const k = R.kind;
  if (k === 'lobby') {
    put('desk', 420, {}, [-260]); put('sign', 10, {}, [220]); put('lamp', 46, { lit: 1 }, [80]); put('lamp', 46, { lit: 1 }, [380]);
    put('chest', 150, { loot: 'note' }, [880]); return;
  }
  if (k === 'shrine') { put('shrine', 260, {}, [lerp(R.ent.x, R.ex, .5)]); put('lamp', 46, { lit: 1 }); put('lamp', 46, { lit: 1 }); put('scroll', 90); return; }
  const closets = k === 'stampede' || k === 'dark' ? 2 : Math.random() < .55 ? 1 : 0, chests = k === 'locked' ? 3 : 1 + (Math.random() < .5 ? 1 : 0);
  for (let i = 0; i < closets; i++) put('closet', 230, { mimic: R.n >= 18 && i === 1 && Math.random() < .4 });
  if (closets === 1 && R.n >= 22 && Math.random() < .12) R.items.find(x => x.kind === 'closet').mimic = true;
  const cs = [];
  for (let i = 0; i < chests; i++) { const c = put('chest', 150, { loot: null }); if (c) cs.push(c); }
  if (k === 'locked') { if (cs.length) pick(cs).loot = 'key'; else R.door.locked = false; }
  for (const c of cs) if (!c.loot) { const r = Math.random(); c.loot = r < .26 ? 'heal' : r < .44 ? 'tokens' : r < .58 ? 'note' : 'none'; }
  const lamps = R.dark ? 1 : 1 + (Math.random() < .6 ? 1 : 0);
  for (let i = 0; i < lamps; i++) put('lamp', 46, { lit: R.dark ? 0 : 1 });
  for (const d of shuffle(['scroll', 'window', 'clock', 'shelf', 'vase', 'scroll', 'window', 'painting'])) put(d, d === 'window' ? 220 : d === 'shelf' ? 190 : d === 'clock' ? 80 : d === 'painting' ? 160 : d === 'vase' ? 60 : 90, { glyph: pick('静夢扉帰影眠灯鍵門宿'), ph: rnd(0, TAU) });
  R.pend = R.items.filter(x => x.kind === 'lamp' || x.kind === 'window').map(x => x.x);
}

/* ================= drawing the room ================= */
const wq = (x0, x1, y0, y1, z) => { E.quad(P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)); };
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
function lit(R) { return R.flick > 0 ? (Math.random() < .5 ? .25 : 1) : R.dark ? 0 : 1; }      // how bright its lamps burn just now
function roomStage(R) {
  return {
    sky() {
      const W = R.pal, VW = E.VW, VH = E.VH;
      g.fillStyle = '#040302'; g.fillRect(-80, -80, VW + 160, VH + 160);
      const zn = E.ZNEAR + 1;
      E.quad(P(-SW, CEIL, zn), P(SW, CEIL, zn), P(SW, CEIL, WZ), P(-SW, CEIL, WZ)); g.fillStyle = W.ceil; g.fill();
      g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 5; g.beginPath();
      for (let z = WZ - 120; z > zn; z -= 160) { const a = P(-SW, CEIL, z), b = P(SW, CEIL, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
      g.stroke();
      // the back wall: paper above, panels below, a rail between
      wq(-SW, SW, 0, CEIL, WZ); g.fillStyle = W.wall; g.fill();
      g.fillStyle = W.pat;
      for (let x = -SW + 35; x < SW; x += 70) { const a = P(x - 2, CEIL - 40, WZ), b = P(x + 2, 160, WZ); g.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }
      for (let x = -SW + 70; x < SW; x += 140) for (let y = 220; y < CEIL - 60; y += 90) { const c = P(x, y, WZ), s = 7 * c[2]; g.fillRect(c[0] - s, c[1] - s, s * 2, s * 2); }
      wq(-SW, SW, 0, 160, WZ); g.fillStyle = W.wain; g.fill();
      g.fillStyle = 'rgba(0,0,0,.28)';
      for (let x = -SW + 20; x < SW; x += 130) { const a = P(x + 12, 140, WZ), b = P(x + 118, 20, WZ); g.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }
      wq(-SW, SW, 156, 172, WZ); g.fillStyle = W.woodT; g.fill();
      wq(-SW, SW, CEIL - 34, CEIL, WZ); g.fillStyle = W.woodS; g.fill();
      if (R.curtain > 0) { wq(-SW, SW, 0, CEIL, WZ); g.fillStyle = `rgba(4,2,8,${.75 * R.curtain})`; g.fill(); }
      if (R.ev && R.ev.kind === 'watcher') drawWatcher(R);
    },
    floor() {
      const W = R.pal, zn = E.ZNEAR + 1;
      E.quad(P(-SW, 0, zn), P(SW, 0, zn), P(SW, 0, WZ), P(-SW, 0, WZ)); g.fillStyle = W.floor; g.fill();
      g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1.5; g.beginPath();
      let row = 0;
      for (let z = WZ; z > zn; z -= 38, row++) {
        const a = P(-SW, 0, z), b = P(SW, 0, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]);
        for (let x = -SW + (row % 3) * 110; x < SW; x += 330) { const c = P(x, 0, z), d = P(x, 0, Math.max(zn, z - 38)); g.moveTo(c[0], c[1]); g.lineTo(d[0], d[1]); }
      }
      g.stroke();
      // the runner down the middle of the room
      if (!R.boss) {
        const z0 = ZP - 80, z1 = ZP + 120, x0 = -SW + 70, x1 = SW - 70;
        E.quad(P(x0, 0, z0), P(x1, 0, z0), P(x1, 0, z1), P(x0, 0, z1)); g.fillStyle = W.rug; g.fill();
        E.quad(P(x0 + 26, 0, z0 + 16), P(x1 - 26, 0, z0 + 16), P(x1 - 26, 0, z1 - 16), P(x0 + 26, 0, z1 - 16)); g.strokeStyle = W.rug2; g.lineWidth = 2; g.stroke();
        g.fillStyle = W.rug2; g.globalAlpha = .35;
        for (let x = x0 + 120; x < x1 - 60; x += 240) { const c = P(x, 0, (z0 + z1) / 2), s = 16 * c[2]; g.beginPath(); g.moveTo(c[0] - s * 2, c[1]); g.lineTo(c[0], c[1] - s * .7); g.lineTo(c[0] + s * 2, c[1]); g.lineTo(c[0], c[1] + s * .7); g.closePath(); g.fill(); }
        g.globalAlpha = 1;
      }
      // light pooling under the lamps
      const L = lit(R);
      if (L > 0) {
        g.globalCompositeOperation = 'lighter';
        for (const it of R.items) if (it.kind === 'lamp' && it.lit) {
          const p = P(it.x, 0, WZ - 120); g.save(); g.translate(p[0], p[1]); g.scale(1, .3);
          const gr = g.createRadialGradient(0, 0, 0, 0, 0, 320 * p[2]); gr.addColorStop(0, rgba(R.pal.lamp, .22 * L)); gr.addColorStop(1, rgba(R.pal.lamp, 0));
          g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 320 * p[2], 0, TAU); g.fill(); g.restore();
        }
        g.globalCompositeOperation = 'source-over';
      }
      if (R.boss) bossFloor(R);
    },
    back() {
      const W = R.pal, zn = E.ZNEAR + 1;
      for (const s of [-1, 1]) {                      // the side walls, running away from us
        const x = s * SW, a = P(x, 0, zn), b = P(x, 0, WZ), c = P(x, CEIL, WZ), d = P(x, CEIL, zn);
        E.quad(a, b, c, d); g.fillStyle = W.wall; g.fill(); g.fillStyle = 'rgba(0,0,0,.45)'; g.fill();
        const e = P(x, 160, WZ), f = P(x, 160, zn); E.quad(a, b, e, f); g.fillStyle = W.wain; g.fill();
      }
      if (R.boss) bossBack(R);
      for (const it of R.items) drawItem(R, it);
      drawDoor(R, R.ent); drawDoor(R, R.door);
      for (const x of R.pend || []) drawPendant(R, x);
    },
    front() { drawFront(R); }
  };
}
// a door in the back wall: its frame, the dark beyond it, the leaf swinging away from us on its hinge, its number over it
function drawDoor(R, d) {
  const W = R.pal, z = WZ - 1, x0 = d.x - d.w / 2, x1 = d.x + d.w / 2, h = d.h;
  wq(x0 - 24, x1 + 24, 0, h + 28, z); g.fillStyle = W.woodS; g.fill();
  wq(x0 - 12, x1 + 12, 0, h + 14, z); g.fillStyle = '#0b0705'; g.fill();
  wq(x0, x1, 0, h, z); g.fillStyle = '#010101'; g.fill();
  if (d.open > .05) {                               // light from the room beyond
    const c = P(d.x, h * .45, z + 200), gr = g.createRadialGradient(c[0], c[1], 0, c[0], c[1], 160 * c[2]);
    gr.addColorStop(0, d.last ? 'rgba(200,220,255,.5)' : rgba(R.pal.lamp, .16 * d.open)); gr.addColorStop(1, 'rgba(0,0,0,0)');
    wq(x0, x1, 0, h, z); g.fillStyle = gr; g.fill();
  }
  const ang = d.open * 1.7, cx = x0 + Math.cos(ang) * d.w, cz = z + Math.sin(ang) * d.w;
  const a = P(x0, 0, z), b = P(cx, 0, cz), c = P(cx, h, cz), e = P(x0, h, z);
  E.quad(a, b, c, e); g.fillStyle = d.open > .02 ? W.woodS : W.wood; g.fill();
  g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2; g.stroke();
  if (d.open < .02) {                               // shut: its panels, its knob
    const pt = (u, v) => [lerp(lerp(a[0], b[0], u), lerp(e[0], c[0], u), v), lerp(lerp(a[1], b[1], u), lerp(e[1], c[1], u), v)];
    g.fillStyle = 'rgba(0,0,0,.22)';
    for (const [u0, v0, u1, v1] of [[.14, .56, .86, .9], [.14, .1, .86, .48]]) { const p0 = pt(u0, v1), p1 = pt(u1, v0); g.fillRect(p0[0], p0[1], p1[0] - p0[0], p1[1] - p0[1]); }
    const kn = pt(d.back ? .14 : .86, .47); g.fillStyle = '#c9a050'; g.beginPath(); g.arc(kn[0], kn[1], 7 * a[2], 0, TAU); g.fill();
    if (d.locked && !d.back) {                       // a bar across it, and a lock
      const l0 = pt(-.05, .46), l1 = pt(1.05, .54); g.fillStyle = '#4a3420'; g.fillRect(l0[0], l1[1], l1[0] - l0[0], l0[1] - l1[1]);
      const lk = pt(.5, .5); g.fillStyle = '#b8862e'; g.fillRect(lk[0] - 13 * a[2], lk[1] - 4 * a[2], 26 * a[2], 24 * a[2]);
      g.strokeStyle = '#b8862e'; g.lineWidth = 4 * a[2]; g.beginPath(); g.arc(lk[0], lk[1] - 4 * a[2], 9 * a[2], Math.PI, 0); g.stroke();
      if (R.boss) { g.strokeStyle = '#6f6a62'; g.lineWidth = 6 * a[2]; g.beginPath(); const q0 = pt(0, .9), q1 = pt(1, .15), q2 = pt(0, .15), q3 = pt(1, .9); g.moveTo(q0[0], q0[1]); g.lineTo(q1[0], q1[1]); g.moveTo(q2[0], q2[1]); g.lineTo(q3[0], q3[1]); g.stroke(); }
    }
    if (d.sealed && !d.back) {                       // talismans across it
      for (const [u, r] of [[.3, -.5], [.7, .5]]) {
        const q = pt(u, .55); g.save(); g.translate(q[0], q[1]); g.rotate(r); g.fillStyle = '#eadfc4'; g.fillRect(-12 * a[2], -95 * a[2], 24 * a[2], 190 * a[2]);
        g.fillStyle = '#a5102a'; g.font = `${Math.round(18 * a[2])}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('封', 0, 0); g.restore();
      }
    }
  }
  // the number over it
  const pl = P(d.x, h + 62, z), k = pl[2];
  g.fillStyle = '#1a120a'; g.fillRect(pl[0] - 54 * k, pl[1] - 22 * k, 108 * k, 44 * k);
  g.fillStyle = d.last ? '#e8eef8' : '#c9a050'; g.fillRect(pl[0] - 50 * k, pl[1] - 18 * k, 100 * k, 36 * k);
  g.fillStyle = '#1a120a'; g.font = `600 ${Math.round(28 * k)}px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(d.last ? 'EXIT' : pad(d.num), pl[0], pl[1] + 1);
}
function drawPendant(R, x) {                        // a paper lantern on a cord, hanging over the room
  const z = ZP + 170, top = P(x, CEIL, z), c = P(x, 455, z), k = c[2], L = lit(R) * (R.dark ? 0 : 1);
  g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(c[0], c[1] - 40 * k); g.stroke();
  g.fillStyle = L > .5 ? rgba(R.pal.lamp, .95) : '#3a3028'; g.beginPath(); g.ellipse(c[0], c[1], 26 * k, 38 * k, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(c[0], c[1] + i * 12 * k, 26 * k * Math.cos(i * .35), 4 * k, 0, 0, TAU); g.stroke(); }
  if (L > .5) { g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.fire, c[0], c[1], 240 * k, .55 * L); g.globalCompositeOperation = 'source-over'; }
}
function drawItem(R, it) {
  const W = R.pal, L = lit(R);
  switch (it.kind) {
    case 'chest': {                                 // a chest of drawers
      const z = WZ - 74, f = E.box(it.x, 0, z, it.w, 168, 72, W.wood, W.woodS, W.woodT), [a, b, c, e] = f;
      const pt = (u, v) => [lerp(lerp(a[0], b[0], u), lerp(e[0], c[0], u), v), lerp(lerp(a[1], b[1], u), lerp(e[1], c[1], u), v)];
      const rows = [[.06, .34], [.38, .66], [.7, .94]];
      rows.forEach(([v0, v1], i) => {
        const cols = i === 2 ? [[.06, .48], [.52, .94]] : [[.06, .94]];
        for (const [u0, u1] of cols) {
          const p0 = pt(u0, v1), p1 = pt(u1, v0), open = it.open && i === 1;
          g.fillStyle = open ? '#050302' : 'rgba(0,0,0,.25)'; g.fillRect(p0[0], p0[1], p1[0] - p0[0], p1[1] - p0[1]);
          const m = pt((u0 + u1) / 2, (v0 + v1) / 2); g.fillStyle = '#b8862e'; g.fillRect(m[0] - 9 * a[2], m[1] - 2 * a[2], 18 * a[2], 5 * a[2]);
        }
      });
      if (it.open) { const d = E.box(it.x, 62, z - 46, it.w * .86, 50, 46, W.woodT, W.woodS, '#120c08'); void d; }      // (the middle drawer, pulled out)
      if (it.glint && !it.open) { const m = pt(.5, .5); g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.fire, m[0], m[1], 60 * a[2], .3 + .2 * Math.sin(E.T * 4)); g.globalCompositeOperation = 'source-over'; }
      break;
    }
    case 'closet': {                                // a tall closet: two doors. One of them may be breathing
      const br = it.mimic && !it.spent ? Math.sin(E.T * 2.3 + it.x) * 5 : 0, z = WZ - 92, h = 340 + br;
      const f = E.box(it.x, 0, z, it.w, h, 90, W.wood, W.woodS, W.woodT), [a, b, c, e] = f;
      const pt = (u, v) => [lerp(lerp(a[0], b[0], u), lerp(e[0], c[0], u), v), lerp(lerp(a[1], b[1], u), lerp(e[1], c[1], u), v)];
      const open = it.bite > 0 ? 1 : it.peek || 0;
      if (open > 0) { const p0 = pt(.06, .96), p1 = pt(.94, .04); g.fillStyle = '#030202'; g.fillRect(p0[0], p0[1], p1[0] - p0[0], p1[1] - p0[1]); }
      if (it.bite > 0) {                            // its teeth
        g.fillStyle = '#efe6d2'; const p0 = pt(.06, .96), p1 = pt(.94, .04), w = p1[0] - p0[0], hh = p1[1] - p0[1];
        for (let i = 0; i < 7; i++) { const x = p0[0] + w * (i + .5) / 7; g.beginPath(); g.moveTo(x - w / 16, p0[1]); g.lineTo(x, p0[1] + hh * .2); g.lineTo(x + w / 16, p0[1]); g.fill(); g.beginPath(); g.moveTo(x - w / 16, p1[1]); g.lineTo(x, p1[1] - hh * .2); g.lineTo(x + w / 16, p1[1]); g.fill(); }
        g.fillStyle = '#c2182b'; const m = pt(.5, .55); g.beginPath(); g.arc(m[0], m[1], 10 * a[2], 0, TAU); g.fill();
      } else {
        g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 2.5; const m0 = pt(.5, 0), m1 = pt(.5, 1); g.beginPath(); g.moveTo(m0[0], m0[1]); g.lineTo(m1[0], m1[1]); g.stroke();
        g.fillStyle = 'rgba(0,0,0,.2)';
        for (const [u0, u1] of [[.08, .44], [.56, .92]]) for (const [v0, v1] of [[.08, .44], [.52, .92]]) { const p0 = pt(u0, v1), p1 = pt(u1, v0); g.fillRect(p0[0], p0[1], p1[0] - p0[0], p1[1] - p0[1]); }
        g.fillStyle = '#c9a050'; for (const u of [.45, .55]) { const k = pt(u, .5); g.beginPath(); g.arc(k[0], k[1], 5 * a[2], 0, TAU); g.fill(); }
        if (it.in) {                                // somebody in there, looking out of the crack
          const k = pt(.5, .78); g.fillStyle = '#fff'; g.fillRect(k[0] - 7 * a[2], k[1], 4 * a[2], 3 * a[2]); g.fillRect(k[0] + 3 * a[2], k[1], 4 * a[2], 3 * a[2]);
        }
        if (it.mimic && !it.spent && Math.sin(E.T * .9 + it.x) > .9) { const k = pt(.5, .62); g.fillStyle = '#ff2440'; g.fillRect(k[0] - 2 * a[2], k[1], 4 * a[2], 4 * a[2]); }
      }
      break;
    }
    case 'lamp': {                                  // a paper floor lamp
      const z = WZ - 62, on = it.lit && L > 0;
      E.box(it.x, 0, z, 46, 14, 46, '#1c140e', '#120c08', '#2a1e14');
      E.box(it.x, 14, z + 4, 10, 30, 10, '#1c140e', '#120c08');
      const f = E.box(it.x, 44, z, 54, 92, 54, on ? rgba(W.lamp, .95) : '#4a4034', on ? rgba(W.lamp, .7) : '#3a3228', on ? '#fff3d6' : '#554a3c');
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; const [a, b, c, e] = f; for (let i = 1; i < 4; i++) { const y = lerp(a[1], e[1], i / 4); g.beginPath(); g.moveTo(a[0], y); g.lineTo(b[0], y); g.stroke(); }
      if (on) { const c2 = P(it.x, 90, z); g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.fire, c2[0], c2[1], 300 * c2[2], .55 * L); g.globalCompositeOperation = 'source-over'; }
      break;
    }
    case 'scroll': {                                // a hanging scroll with one word on it
      const a = P(it.x - 40, 470, WZ - 2), b = P(it.x + 40, 200, WZ - 2), k = a[2];
      g.fillStyle = '#2a1a10'; g.fillRect(a[0] - 6 * k, a[1] - 8 * k, b[0] - a[0] + 12 * k, 10 * k); g.fillRect(a[0] - 6 * k, b[1], b[0] - a[0] + 12 * k, 10 * k);
      g.fillStyle = '#d8ccb0'; g.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
      g.fillStyle = '#1a120a'; g.font = `${Math.round(54 * k)}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(it.glyph || '扉', (a[0] + b[0]) / 2, lerp(a[1], b[1], .45));
      break;
    }
    case 'window': {                                // a paper window, the moon behind it
      const a = P(it.x - it.w / 2 + 10, 420, WZ - 2), b = P(it.x + it.w / 2 - 10, 190, WZ - 2), k = a[2], w = b[0] - a[0], h = b[1] - a[1];
      g.fillStyle = '#1a120a'; g.fillRect(a[0] - 8 * k, a[1] - 8 * k, w + 16 * k, h + 16 * k);
      const gr = g.createLinearGradient(0, a[1], 0, b[1]); gr.addColorStop(0, '#b9c4d8'); gr.addColorStop(1, '#8a94a8');
      g.fillStyle = gr; g.fillRect(a[0], a[1], w, h);
      if (Math.sin(E.T * .23 + it.ph) > .985) { g.fillStyle = 'rgba(10,8,12,.85)'; const sx = a[0] + w * ((E.T * 2 + it.ph) % 1); g.fillRect(sx, a[1] + h * .2, w * .14, h * .8); }      // (something passes outside)
      g.strokeStyle = '#1a120a'; g.lineWidth = 2.5 * k; g.beginPath();
      for (let i = 1; i < 4; i++) { g.moveTo(a[0] + w * i / 4, a[1]); g.lineTo(a[0] + w * i / 4, b[1]); }
      for (let i = 1; i < 3; i++) { g.moveTo(a[0], a[1] + h * i / 3); g.lineTo(b[0], a[1] + h * i / 3); }
      g.stroke();
      break;
    }
    case 'clock': {                                 // a tall clock that has stopped
      const f = E.box(it.x, 0, WZ - 50, 70, 300, 46, W.wood, W.woodS, W.woodT), c = P(it.x, 240, WZ - 50), k = c[2];
      void f; g.fillStyle = '#d8ccb0'; g.beginPath(); g.arc(c[0], c[1], 24 * k, 0, TAU); g.fill();
      g.strokeStyle = '#1a120a'; g.lineWidth = 2.5 * k; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0] - 4 * k, c[1] - 16 * k); g.moveTo(c[0], c[1]); g.lineTo(c[0] + 12 * k, c[1] + 6 * k); g.stroke();
      break;
    }
    case 'shelf': {                                 // books on shelves
      const f = E.box(it.x, 0, WZ - 50, it.w, 290, 46, W.wood, W.woodS, W.woodT), [a, b, , e] = f, cols = ['#5c1618', '#1d3a2c', '#2a1c44', '#6a4a1c', '#3a3a40', '#4c2a18'];
      for (let r = 0; r < 4; r++) {
        const y0 = lerp(a[1], e[1], .06 + r * .24), y1 = lerp(a[1], e[1], .26 + r * .24);
        for (let i = 0; i < 9; i++) { const x = lerp(a[0], b[0], .06 + i * .1); g.fillStyle = cols[(i * 7 + r * 3 + Math.round(it.x)) % 6]; g.fillRect(x, y1 + (y0 - y1) * .1 * (i % 3), (b[0] - a[0]) * .085, (y0 - y1) * (.9 - .1 * (i % 3))); }
      }
      break;
    }
    case 'vase': {
      const c = P(it.x, 0, WZ - 50), k = c[2];
      E.box(it.x, 0, WZ - 50, 60, 70, 46, W.wood, W.woodS, W.woodT);
      const v = P(it.x, 70, WZ - 50); g.fillStyle = '#2a3a4c'; g.beginPath(); g.ellipse(v[0], v[1] - 30 * k, 16 * k, 30 * k, 0, 0, TAU); g.fill();
      g.strokeStyle = '#1d3a2c'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(v[0], v[1] - 58 * k); g.lineTo(v[0] + 6 * k, v[1] - 100 * k); g.stroke();
      g.fillStyle = '#a5102a'; g.beginPath(); g.arc(v[0] + 6 * k, v[1] - 104 * k, 9 * k, 0, TAU); g.fill();
      break;
    }
    case 'painting': {                              // somebody's portrait, the face gone dark
      const a = P(it.x - 60, 430, WZ - 2), b = P(it.x + 60, 240, WZ - 2), k = a[2];
      g.fillStyle = '#b8862e'; g.fillRect(a[0] - 8 * k, a[1] - 8 * k, b[0] - a[0] + 16 * k, b[1] - a[1] + 16 * k);
      g.fillStyle = '#1e1a16'; g.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
      g.fillStyle = '#2e2620'; const cx = (a[0] + b[0]) / 2; g.beginPath(); g.arc(cx, lerp(a[1], b[1], .38), 22 * k, 0, TAU); g.fill(); g.fillRect(cx - 34 * k, lerp(a[1], b[1], .6), 68 * k, (b[1] - a[1]) * .4);
      if (Math.sin(E.T * .5 + it.ph) > .96) { g.fillStyle = '#ff2440'; g.fillRect(cx - 9 * k, lerp(a[1], b[1], .36), 4 * k, 3 * k); g.fillRect(cx + 5 * k, lerp(a[1], b[1], .36), 4 * k, 3 * k); }
      break;
    }
    case 'desk': {                                  // the front desk, and the bell nobody answers
      E.box(it.x, 0, WZ - 160, it.w, 120, 90, W.wood, W.woodS, W.woodT);
      const c = P(it.x + 120, 120, WZ - 150), k = c[2]; g.fillStyle = '#c9a050'; g.beginPath(); g.arc(c[0], c[1] - 8 * k, 12 * k, Math.PI, 0); g.fill(); g.fillRect(c[0] - 14 * k, c[1] - 9 * k, 28 * k, 4 * k);
      const s = P(it.x, 500, WZ - 2); g.fillStyle = '#1a120a'; g.fillRect(s[0] - 190 * s[2], s[1] - 40 * s[2], 380 * s[2], 80 * s[2]);
      g.fillStyle = '#c9a050'; g.font = `${Math.round(40 * s[2])}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('百扉旅館', s[0], s[1] - 8 * s[2]);
      g.font = `600 ${Math.round(13 * s[2])}px ${SANS}`; g.fillText('THE INN OF A HUNDRED DOORS', s[0], s[1] + 24 * s[2]);
      break;
    }
    case 'sign': {                                  // the house rules, by the first door
      const a = P(it.x - 70, 420, WZ - 2), b = P(it.x + 70, 200, WZ - 2), k = a[2];
      g.fillStyle = '#d8ccb0'; g.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
      g.fillStyle = '#1a120a'; g.font = `600 ${Math.round(15 * k)}px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      ['HOUSE RULES', 'KEEP GOING', 'HIDE WHEN IT SHAKES', 'KEEP STILL WHEN IT LOOKS', 'DO NOT STAND ON THE DARK'].forEach((t, i) => g.fillText(t, (a[0] + b[0]) / 2, a[1] + (22 + i * 36) * k));
      break;
    }
    case 'shrine': {                                // a little shrine: candles, a mirror, a rope
      const z = WZ - 80, f = E.box(it.x, 0, z, it.w, 110, 80, '#2a1a10', '#1a100a', '#3a2616');
      void f; const m = P(it.x, 190, z), k = m[2];
      g.fillStyle = '#c9a050'; g.beginPath(); g.arc(m[0], m[1], 38 * k, 0, TAU); g.fill(); g.fillStyle = '#d8e2f0'; g.beginPath(); g.arc(m[0], m[1], 30 * k, 0, TAU); g.fill();
      const r0 = P(it.x - it.w / 2, 300, z), r1 = P(it.x + it.w / 2, 300, z); g.strokeStyle = '#d8ccb0'; g.lineWidth = 7 * k; g.beginPath(); g.moveTo(r0[0], r0[1]); g.quadraticCurveTo(m[0], r0[1] + 40 * k, r1[0], r1[1]); g.stroke();
      for (const dx of [-90, 90]) {
        const c = P(it.x + dx, 110, z - 20); g.fillStyle = '#eadfc4'; g.fillRect(c[0] - 5 * k, c[1] - 34 * k, 10 * k, 34 * k);
        if (!it.used || Math.sin(E.T * 7 + dx) > -2) { g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.fire, c[0], c[1] - 44 * k, (it.used ? 70 : 110) * k * (.9 + .1 * Math.sin(E.T * 13 + dx)), .9); g.globalCompositeOperation = 'source-over'; }
      }
      break;
    }
  }
}

/* ---------- THE WATCHER: an eye in the wall of a dark room ---------- */
function drawWatcher(R) {
  const ev = R.ev, c = P(ev.x, 400, WZ - 1), k = c[2];
  if (ev.ph === 'shut') return;
  const u = ev.ph === 'stir' ? ev.t / 1.3 : 1, open = ev.ph === 'open' ? Math.min(1, ev.t / .25) : u * .12, w = 170 * k, h = 70 * k * open;
  g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.red, c[0], c[1], 420 * k * (.4 + .6 * u), .5 * u); g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#e8dccb'; g.beginPath(); g.moveTo(c[0] - w, c[1]); g.quadraticCurveTo(c[0], c[1] - h * 2, c[0] + w, c[1]); g.quadraticCurveTo(c[0], c[1] + h * 2, c[0] - w, c[1]); g.fill();
  if (open > .3) {
    const px = clamp((E.P1.x - ev.x) * .05, -60, 60) * k;
    g.fillStyle = '#7a0e1d'; g.beginPath(); g.arc(c[0] + px, c[1], 36 * k * open, 0, TAU); g.fill();
    g.fillStyle = '#050203'; g.beginPath(); g.arc(c[0] + px, c[1], 16 * k * open, 0, TAU); g.fill();
  }
  g.strokeStyle = '#1a0306'; g.lineWidth = 4 * k; g.beginPath(); g.moveTo(c[0] - w, c[1]); g.quadraticCurveTo(c[0], c[1] - h * 2, c[0] + w, c[1]); g.quadraticCurveTo(c[0], c[1] + h * 2, c[0] - w, c[1]); g.stroke();
}

/* ---------- in front of everything: dust in the light, the black pools, the herd's dust ---------- */
function drawFront(R) {
  const L = lit(R);
  for (const m of R.motes) {
    m.y += m.v * .016; if (m.y > 560) m.y = 40;
    const c = P(m.x + Math.sin(E.T * .3 + m.ph) * 30, m.y, m.z);
    g.fillStyle = `rgba(255,236,200,${(.12 + .1 * Math.sin(E.T + m.ph)) * (R.dark ? .3 : L)})`; g.fillRect(c[0], c[1], 2 * c[2], 2 * c[2]);
  }
  const ev = R.ev;
  if (ev && ev.kind === 'grasp') for (const q of ev.pools) {   // a pool of black, and then the hands out of it
    const c = P(q.x, 0, ZP), k = c[2], u = Math.min(1, q.t / .3), w = 130 * k * u;
    g.fillStyle = 'rgba(2,1,3,.92)'; g.beginPath(); g.ellipse(c[0], c[1], w, w * .22, 0, 0, TAU); g.fill();
    g.strokeStyle = `rgba(120,20,40,${.5 * u})`; g.lineWidth = 2; g.stroke();
    if (q.t > .95) {
      const h = Math.min(1, (q.t - .95) / .12) * (q.t > 1.4 ? Math.max(0, 1 - (q.t - 1.4) / .25) : 1);
      for (let i = 0; i < 5; i++) {
        const hx = c[0] + (i - 2) * 36 * k, top = c[1] - (130 + 40 * Math.sin(i * 2.1)) * k * h;
        g.strokeStyle = '#050307'; g.lineWidth = 16 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx, c[1]); g.lineTo(hx + (i - 2) * 10 * k * h, top); g.stroke();
        g.lineWidth = 5 * k; for (let f = -1; f <= 1; f++) { g.beginPath(); g.moveTo(hx + (i - 2) * 10 * k * h, top); g.lineTo(hx + (i - 2) * 10 * k * h + f * 10 * k, top - 22 * k * h); g.stroke(); }
      }
      g.lineCap = 'butt';
    }
  }
  if (ev && ev.kind === 'stampede' && ev.ph === 'run') {      // the dust the herd kicks up
    const lead = ev.lead;
    for (let i = 0; i < 10; i++) { const x = lead - ev.dir * i * 70, c = P(x, 30 + (i % 3) * 30, ZP - 120 + (i % 4) * 60); g.fillStyle = `rgba(60,48,40,${.35 - i * .03})`; g.beginPath(); g.arc(c[0], c[1], (60 + i * 8) * c[2], 0, TAU); g.fill(); }
  }
  if (R.boss) bossFront(R);
}

/* ================= THE DOORKEEPER: the raid boss at 50 and at 100 ================= */
const DKC = '#ffb347';
function dkSkin(final) {
  const eye = final ? '#ff2440' : '#ffb347';
  return {
    torso: final ? ['#2a120c', '#3e1c12'] : ['#24150d', '#3a2414'],
    armF: ['#24150d', '#3a2414', '#0c0806', '#1a120c', .26], armB: ['#170d08', '#24150d', '#080504', '#100b08', .26],
    legF: ['#1f120b', '#311d10', '#0c0806', '#1a120c', .2], legB: ['#140c07', '#1f120b', '#080504', '#100b08', .2],
    chest() {                                     // a door's panels on its chest, a keyhole glowing in it, keys on a ring
      const TOR = E.TOR;
      g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2.5; g.strokeRect(-25, -TOR + 7, 21, 30); g.strokeRect(2, -TOR + 7, 23, 30); g.strokeRect(-25, -TOR + 42, 50, 28);
      g.fillStyle = '#b8862e'; g.beginPath(); g.arc(13, -TOR + 52, 6, 0, TAU); g.fill();
      g.fillStyle = eye; g.fillRect(11, -TOR + 50, 4, 12);
      g.strokeStyle = '#c9a050'; g.lineWidth = 2; g.beginPath(); g.arc(-14, -6, 8, 0, TAU); g.stroke();
      g.fillStyle = '#c9a050'; for (const [x, r] of [[-20, -.4], [-14, 0], [-8, .4]]) { g.save(); g.translate(x, 2); g.rotate(r); g.fillRect(-1.5, 0, 3, 14); g.fillRect(-1.5, 10, 6, 3); g.restore(); }
    },
    head() {                                      // a door for a head, taller than any head, with a peephole that looks at you
      g.fillStyle = final ? '#3a1a10' : '#33200f'; g.strokeStyle = '#07060c'; g.lineWidth = 3;
      g.beginPath(); g.rect(-24, -78, 50, 104); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2; g.strokeRect(-17, -70, 36, 34); g.strokeRect(-17, -28, 36, 44);
      g.fillStyle = '#c9a050'; g.fillRect(-10, -84, 24, 8);
      g.fillStyle = '#d8b25a'; g.beginPath(); g.arc(18, -4, 4.5, 0, TAU); g.fill();
      g.fillStyle = '#000'; g.beginPath(); g.arc(4, -52, 9, 0, TAU); g.fill();
      g.fillStyle = eye; g.beginPath(); g.arc(6, -52, 4.5 + Math.sin(E.T * 6) * .8, 0, TAU); g.fill();
      if (final) { g.fillStyle = '#efe6d2'; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-14 + i * 7, 6); g.lineTo(-10.5 + i * 7, 14); g.lineTo(-7 + i * 7, 6); g.fill(); } }
    }
  };
}
const DK_ATK = [{ pre: 'hookWind', pose: 'hook', wind: .62, lunge: 300, reach: 240, dmg: 8, kb: 420, stun: .45 },
                { pre: 'crushWind', pose: 'crush', wind: .82, lunge: 260, reach: 255, dmg: 11, kb: 600, lift: 520 }];
D.dk50 = { name: 'THE DOORKEEPER', jp: '扉番', skin: dkSkin(false), hp: 520, scale: 1.5, speed: 165, range: 230, gap: [.8, 1.6], dr: .5, poise: true, atk: DK_ATK };
D.dk100 = { name: 'THE DOORKEEPER · EVERY DOOR OPEN', jp: '扉番・全開', skin: dkSkin(true), hp: 760, scale: 1.7, speed: 185, range: 245, gap: [.7, 1.4], dr: .45, poise: true, atk: DK_ATK };
// a door, falling flat out of the dark onto the spot that was marked
function fallingDoor(x, y, k = 1) {
  const a = P(x - 110 * k, y + 22, ZP - 60), b = P(x + 110 * k, y + 22, ZP - 60), c = P(x + 110 * k, y, ZP + 300 * k), d = P(x - 110 * k, y, ZP + 300 * k);
  E.quad(a, b, c, d); g.fillStyle = '#3a2414'; g.fill(); g.strokeStyle = '#120a06'; g.lineWidth = 3; g.stroke();
  const m = P(x + 70 * k, y + 22, ZP + 120 * k); g.fillStyle = '#c9a050'; g.beginPath(); g.arc(m[0], m[1], 6 * m[2], 0, TAU); g.fill();
}
function drawKey(s) {
  const c = F(s.x, s.y), k = c[2];
  g.save(); g.translate(c[0], c[1]); g.rotate(s.t * 14);
  g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.fire, 0, 0, 80 * k, .5); g.globalCompositeOperation = 'source-over';
  g.strokeStyle = '#d8b25a'; g.lineWidth = 6 * k; g.beginPath(); g.arc(-18 * k, 0, 11 * k, 0, TAU); g.stroke();
  g.fillStyle = '#d8b25a'; g.fillRect(-8 * k, -3 * k, 36 * k, 6 * k); g.fillRect(18 * k, 2 * k, 5 * k, 10 * k); g.fillRect(26 * k, 2 * k, 5 * k, 7 * k);
  g.restore();
}
function dkKit(id, final) {
  const hit = (d, more) => Object.assign({ dmg: final ? d + 2 : d, kb: 480 }, more);
  B.kit(id, { tech: final ? 'Every Door Open' : 'Doorkeeping', col: DKC, glow: 'fire', fire: false, every: final ? [1.9, 3.2] : [2.4, 3.9], moves: [
    { name: 'Slammed Door', cd: 5, wind: .45, pre: 'crushWind', dur: 1.05,
      run(o, p, A, t) {
        o.target = POSE.crush;
        if (A.x === undefined) {
          A.x = p.x; B.mark(A.x, 140, .7, DKC); SND('creak');
          const x = A.x; B.add({ life: .72, draw: h => fallingDoor(x, 1100 * (1 - Math.min(1, h.t / .7) ** 2)) });
        }
        if (t >= .7 && !A.land) {
          A.land = 1; B.burst(A.x, 140, hit(9, { kb: 520, lift: 480 })); SND('thud'); cam.shake = Math.max(cam.shake, 16); V.rocks(A.x, 0, 6);
          const x = A.x; B.add({ life: .35, draw: h => { g.globalAlpha = 1 - h.t / .35; fallingDoor(x, 0); g.globalAlpha = 1; } });
        }
      } },
    { name: 'Knock, Knock', cd: 6, wind: .55, pre: 'hookWind', dur: 1.05,
      run(o, p, A, t) {
        for (const [i, at] of [[0, 0], [1, .45]]) if (t >= at && !A['k' + i]) {
          A['k' + i] = 1; o.target = i ? POSE.hook : POSE.crush; cam.shake = Math.max(cam.shake, 14); SND('knock', i);
          B.wave(o.x + o.face * 90, o.face, 900, 1900, hit(7, { kb: 320, lift: 360 }), DKC);
          if (final) B.wave(o.x - o.face * 90, -o.face, 900, 1900, hit(7, { kb: 320, lift: 360 }), DKC);
        }
      } },
    { name: 'Key Throw', cd: 4, min: 260, wind: .5, pre: 'divWind', dur: .9,
      run(o, p, A, t) {
        o.target = POSE.div;
        const n = Math.min(final ? 5 : 3, Math.floor(t / .18) + 1);
        while ((A.n || 0) < n) {
          A.n = (A.n || 0) + 1;
          const hx = o.x + o.face * 120, dx = p.x - hx + rnd(-90, 90), T = .75;
          B.shot({ x: hx, y: 280, vx: dx / T, vy: (0 - 280 + .5 * 1400 * T * T) / T, grav: 1400, r: 24, life: 2.4, a: hit(6, { kb: 240, stun: .3 }), draw: drawKey, land: s => V.rocks(s.x, 0, 2) });
          sfx.whoosh();
        }
      } },
    { name: 'Doorway Rush', cd: 7, min: 200, max: 1500, wind: .62, pre: 'kickWind', dur: .7,
      run(o, p, A, t) {
        if (t < .5) {
          o.target = POSE.dash; o.vx = o.face * 1450;
          if (Math.random() < .5) E.addDust(o.x);
          if (!A.s) { A.s = 1; SND('roar'); }
          if (!A.hit && B.swing(o, 170, hit(10, { kb: 720, lift: 420 }))) A.hit = 1;
        } else { o.vx *= .5; o.target = POSE.idle; }
      } }
  ].concat(final ? [
    { name: 'A Hundred Doors', cd: 12, below: .65, wind: .8, pre: 'crushWind', dur: 2.1,
      run(o, p, A, t) {
        o.target = POSE.crush;
        if (!A.xs) {                                // five doors down across the hall, one after another: one gap, near where he stood
          const gap = clamp(p.x + rnd(-200, 200), -760, 760), xs = [];
          for (let x = -880; x <= 880; x += 220) if (Math.abs(x - gap) > 160) xs.push(x);
          A.xs = shuffle(xs).slice(0, 6).sort((a, b) => (a - p.x) * (a - p.x) - (b - p.x) * (b - p.x)); A.d = [];
          A.xs.forEach((x, i) => { B.mark(x, 120, .7 + i * .2, DKC); B.add({ life: .72 + i * .2, draw: h => { const u = Math.max(0, (h.t - i * .2) / .7); fallingDoor(x, 1100 * (1 - Math.min(1, u) ** 2), .9); } }); });
          SND('roar');
        }
        A.xs.forEach((x, i) => { if (t >= .7 + i * .2 && !A.d[i]) { A.d[i] = 1; B.burst(x, 120, hit(9, { kb: 500, lift: 440 })); SND('thud'); cam.shake = Math.max(cam.shake, 12); V.rocks(x, 0, 4); } });
      } }] : [])
  });
}
dkKit('dk50', false); dkKit('dk100', true);

/* ---------- the boss rooms: the archive (50) and the lamp hall (100) ---------- */
function bossBack(R) {
  const W = R.pal, cols = ['#5c1618', '#1d3a2c', '#2a1c44', '#6a4a1c', '#3a3a40', '#4c2a18'];
  if (R.n === 50) {                                 // shelves of books from the floor to the ceiling, all along the wall
    for (let x = -960; x <= 960; x += 200) {
      if (Math.abs(x) < 240 || Math.abs(x - R.ent.x) < 170) continue;
      const [a, b, , e] = E.box(x, 0, WZ - 60, 180, 540, 56, W.wood, W.woodS, W.woodT);
      for (let r = 0; r < 7; r++) {
        const y0 = lerp(a[1], e[1], .03 + r * .14), y1 = lerp(a[1], e[1], .15 + r * .14);
        for (let i = 0; i < 9; i++) { const xx = lerp(a[0], b[0], .05 + i * .1); g.fillStyle = cols[Math.abs(i * 5 + r * 3 + Math.round(x / 200)) % 6]; g.fillRect(xx, y1 + (y0 - y1) * .12 * (i % 3), (b[0] - a[0]) * .088, (y0 - y1) * (.88 - .12 * (i % 3))); }
      }
    }
  } else {                                          // a hall of pillars; five great lanterns, dark until a switch lights one
    for (const x of [-940, -470, 470, 940]) E.box(x, 0, WZ - 70, 70, CEIL, 70, W.woodS, '#070605', W.wood);
    const B0 = run && run.boss;
    LAMPS.forEach((x, i) => {
      const on = B0 && B0.items && B0.items[i] && B0.items[i].on, c = P(x, 470, ZP + 260), top = P(x, CEIL, ZP + 260), k = c[2];
      g.strokeStyle = '#000'; g.lineWidth = 3; g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(c[0], c[1] - 50 * k); g.stroke();
      g.fillStyle = on ? '#ffe2a8' : '#2a241c'; g.beginPath(); g.ellipse(c[0], c[1], 36 * k, 52 * k, 0, 0, TAU); g.fill();
      g.strokeStyle = '#1a120a'; g.lineWidth = 3 * k; g.stroke();
      if (on) { g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.fire, c[0], c[1], 520 * k, .75); g.globalCompositeOperation = 'source-over'; }
    });
    if (B0 && B0.n === 100) for (const it of B0.items) {     // the switches, on posts just behind where he fights
      const k = P(it.x, 0, ZP + 70)[2];
      E.box(it.x, 0, ZP + 70, 70, 120, 50, '#2a241c', '#18140f', '#3a3228');
      const pv = P(it.x, 120, ZP + 70), ang = it.on ? -.7 : .7 - 1.4 * clamp(it.hold / FLIP, 0, 1);
      g.strokeStyle = '#8a8478'; g.lineWidth = 9 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(pv[0], pv[1]); g.lineTo(pv[0] + Math.sin(ang) * 70 * k, pv[1] - Math.cos(ang) * 70 * k); g.stroke(); g.lineCap = 'butt';
      g.fillStyle = it.on ? '#ffd23d' : '#a5102a'; g.beginPath(); g.arc(pv[0] + Math.sin(ang) * 70 * k, pv[1] - Math.cos(ang) * 70 * k, 12 * k, 0, TAU); g.fill();
      const lamp = P(it.x, 90, ZP + 44); g.fillStyle = it.on ? '#ffd23d' : (E.T * 3 | 0) % 2 ? '#3a1014' : '#a5102a'; g.fillRect(lamp[0] - 8 * k, lamp[1] - 8 * k, 16 * k, 16 * k);
    }
  }
}
const LAMPS = [-840, -420, 0, 420, 840];
function bossFloor(R) {
  if (R.n !== 100 || !run || !run.boss) return;
  g.globalCompositeOperation = 'lighter';
  run.boss.items.forEach((s, i) => {
    if (!s.on) return;
    const p = P(LAMPS[i], 0, ZP + 120); g.save(); g.translate(p[0], p[1]); g.scale(1, .3);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 420 * p[2]); gr.addColorStop(0, 'rgba(255,214,140,.3)'); gr.addColorStop(1, 'rgba(255,214,140,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 420 * p[2], 0, TAU); g.fill(); g.restore();
  });
  g.globalCompositeOperation = 'source-over';
}
// what the fight is about: the books (50), the switches (100). Drawn over everything, so they are always seen
function bossFront(R) {
  const Bz = run && run.boss;
  if (!Bz || Bz.n !== R.n) return;
  for (const it of Bz.items) {
    if (R.n === 50) {
      if (it.got) continue;
      const bob = Math.sin(E.T * 2.4 + it.x) * 12, c = F(it.x, it.y + bob), k = c[2];
      g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.fire, c[0], c[1], 200 * k * (1 + .12 * Math.sin(E.T * 5 + it.x)), .8); g.globalCompositeOperation = 'source-over';
      g.save(); g.translate(c[0], c[1]); g.rotate(Math.sin(E.T * 1.6 + it.x) * .15);
      g.fillStyle = '#5c1618'; g.fillRect(-26 * k, -34 * k, 52 * k, 64 * k);
      g.fillStyle = '#f2e6c8'; g.fillRect(-21 * k, -30 * k, 44 * k, 56 * k);
      g.fillStyle = '#7a1418'; g.fillRect(-26 * k, -34 * k, 8 * k, 64 * k);
      g.fillStyle = '#c9a050'; g.font = `${Math.round(22 * k)}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('名', 2 * k, -2 * k);
      g.restore();
    } else {
      const c = P(it.x, 0, ZP + 70), k = c[2];
      if (!it.on && it.hold > 0) { g.strokeStyle = '#ffd23d'; g.lineWidth = 5 * k; g.beginPath(); g.arc(c[0], c[1] - 190 * k, 30 * k, -Math.PI / 2, -Math.PI / 2 + TAU * it.hold / FLIP); g.stroke(); }
      if (!it.on && Math.abs(E.P1.x - it.x) < 260) { g.fillStyle = '#ffd23d'; g.font = `600 ${Math.round(18 * k)}px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('STAND HERE', c[0], c[1] - 236 * k); }
    }
  }
  if (R.n === 100) {                                // the dark of the hall, less with every lamp lit
    const on = Bz.items.filter(s => s.on).length;
    g.fillStyle = `rgba(4,3,2,${.34 - on * .06})`; g.fillRect(-200, -200, E.VW + 400, E.VH + 400);
  }
}
const FLIP = .5;

/* ================= a run ================= */
let run = null;          // { n, R, st, frac, key, found, t, hide, card, fade, boss, cut, last }
const ph = E.fighter(E.CURSE, 9000, -1); ph.alpha = 0; ph.ko = true; ph.hp = 0;      // (nobody: the engine always wants somebody across from him)
const SC = { mode: 'doors', update: (dt, real) => update(dt, real), render: (dt, real) => render(dt, real), press: a => press(a) };
function dress(p) {
  const body = JU.clan && JU.clan.body && JU.clan.body();
  p.skin = body ? body.skin : (JU.tech && JU.tech.skin) || E.YUJI; p.scale = body ? body.scale : (JU.tech && JU.tech.active && JU.tech.active.scale) || 1;
}
// stand him in room R: where he is, or coming out of the door he came in by
function stage(R, x, coming) {
  E.arena({ stage: R.stage, foe: ph, skin: E.P1.skin, p1x: x, yaw: 0 });
  const p = E.P1; dress(p);
  p.alpha = 1; p.z = ZP; p.face = 1; p.hurtT = 0; p.held = 0;
  if (coming) { p.z = WZ + 60; p.alpha = 0; }
  cam.x = clamp(x, -lim(), lim()); cam.yaw = 0; cam.zoom = 1; cam.shake = 0;
  E.setScene(SC);
}
const lim = () => Math.max(0, SW - E.VW / 2);
function enterRoom(n) {
  const R = gen(n);
  run.R = R; run.n = n; run.last = R.kind; run.hide = null;
  if (n > S.best) S.best = n;
  if (cpRoom(n) && n !== S.cp) { S.cp = n; run.saved = 1; }
  save();
  stage(R, R.ent.x, true);
  R.ent.open = 1;
  run.st = 'enter'; run.et = 0; run.card = { t: 0 };
  if (R.kind !== 'boss' && MUS.now !== 'amb') MUS.start('amb');
  paint();
}
function begin(n) {
  hideOv();
  JU.tech.apply(); JU.clan.apply(); if (JU.tools) JU.tools.apply();      // whatever is equipped, as in Free Exploration
  n = clamp(n | 0, 0, 100);
  if (n === 0) S.runs++;
  run = { n, R: null, st: 'enter', frac: 1, key: false, found: 0, t: 0, et: 0, fade: 1, card: null, boss: null, start: performance.now() };
  E.root.classList.add('drrun');
  enterRoom(n);
}

/* ---------- moving about ---------- */
function update(dt, real) {
  if (!run || !run.R) return;
  const p = E.P1, R = run.R;
  R.t += dt; run.t += dt;
  if (run.fade > 0 && run.st !== 'through' && run.st !== 'dead') run.fade = Math.max(0, run.fade - real * 2.2);
  if (run.card) { run.card.t += real; if (run.card.t > 2.6) run.card = null; }
  if (R.flick > 0) R.flick = Math.max(0, R.flick - dt);
  for (const d of [R.ent, R.door]) if (d.target !== undefined) d.open = lerp(d.open, d.target, 1 - Math.exp(-dt * 9));
  for (const it of R.items) { if (it.bite > 0) it.bite -= dt; }
  switch (run.st) {
    case 'enter': {                                 // out of the door he came in by, and it shuts behind him
      run.et += dt;
      const u = Math.min(1, run.et / .55);
      p.z = lerp(WZ + 60, ZP, u * u * (3 - 2 * u)); p.alpha = Math.min(1, u * 2.5); C.stroll(p, u < 1, dt, .9);
      if (run.et > .55 && R.ent.target === undefined) { R.ent.target = 0; setTimeout(() => SND('shut'), 160); }
      if (run.et > .9) { run.st = 'walk'; p.z = ZP; arrive(R); }
      break;
    }
    case 'walk': move(p, dt); break;
    case 'hide': p.vx = 0; break;
    case 'through': {                               // into the next door, and the dark beyond it
      run.et += dt;
      const d = R.door, u = clamp((run.et - .3) / .6, 0, 1);
      if (run.et > .3) { p.x = lerp(run.x0, d.x, Math.min(1, u * 1.4)); p.z = lerp(ZP, WZ + 80, u * u); C.stroll(p, true, dt, 1); p.alpha = 1 - clamp((u - .7) / .3, 0, 1); }
      else C.stroll(p, false, dt);
      if (run.et > .75) run.fade = Math.min(1, (run.et - .75) / .3);
      if (run.et > 1.12) { if (d.last) ending(); else enterRoom(R.n + 1); }
      break;
    }
    case 'cut': cutUpdate(dt); break;
    case 'dead': { p.target = POSE.down; p.rate = 10; E.blend(p, dt); break; }
  }
  events(dt);
  const aim = run.st === 'cut' && run.cut && run.cut.cam !== undefined ? run.cut.cam : p.x + p.face * 110;
  cam.x = lerp(cam.x, clamp(aim, -lim(), lim()), 1 - Math.exp(-real * 5));
  cam.yaw = lerp(cam.yaw, lim() ? cam.x / lim() * .05 : 0, 1 - Math.exp(-real * 3));
  paint();
}
function move(p, dt) {
  const k = E.keys, dir0 = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0);
  let dir = dir0;
  if (p.held > 0) { p.held -= dt; dir = 0; }
  if (p.hurtT > 0) {                                // knocked off his feet
    p.hurtT -= dt; p.x = clamp(p.x + p.vx * dt, -960, 960); p.vx *= Math.exp(-dt * 3);
    if (!p.ground) { p.vy -= 2700 * dt; p.y += p.vy * dt; if (p.y <= 0) { p.y = 0; p.vy = 0; p.ground = true; E.addDust(p.x); sfx.land(); } }
    p.target = !p.ground ? POSE.air : p.hurtT > .3 ? POSE.down : POSE.idle; p.rate = 14; E.blend(p, dt);
    return;
  }
  const fast = k.has('shift'), sp = fast ? 540 : 340;
  p.vx = dir * sp;
  if (dir) p.face = dir;
  p.x = clamp(p.x + p.vx * dt, -960, 960);
  if (dir && p.ground && (p.stepT = (p.stepT || 0) + dt * (fast ? 1.6 : 1)) > .32) { p.stepT = 0; SND('step'); }
  if (!p.ground) {
    p.vy -= 2700 * dt; p.y += p.vy * dt;
    if (p.y <= 0) { p.y = 0; p.vy = 0; p.ground = true; E.addDust(p.x); sfx.land(); }
    p.target = p.vy > 0 ? POSE.jump : POSE.fall; p.rate = 12; E.blend(p, dt);
  } else C.stroll(p, !!dir, dt, fast ? 1.6 : 1);
}
// what he is standing by, that E would use
function near() {
  const p = E.P1, R = run.R;
  if (run.st === 'hide') return run.hide;
  if (run.st !== 'walk' || p.hurtT > 0) return null;
  let best = null, bd = 1e9;
  for (const it of R.items) {
    if (!use[it.kind] || (it.kind === 'chest' && it.open) || (it.kind === 'shrine' && it.used)) continue;
    const d = Math.abs(it.x - p.x);
    if (d < it.w / 2 + 50 && d < bd) { bd = d; best = it; }
  }
  const dd = Math.abs(R.door.x - p.x);
  if (dd < R.door.w / 2 + 40 && dd < bd && !R.boss) best = R.door;
  else if (R.boss && R.done && dd < R.door.w / 2 + 40) best = R.door;
  return best;
}
function label(it) {
  if (!it) return '';
  if (it.door) return it.sealed ? 'SEALED' : it.locked ? (run.key ? 'UNLOCK' : 'LOCKED · FIND THE KEY') : it.last ? 'GO OUT' : 'OPEN DOOR ' + pad(it.num);
  if (run.st === 'hide') return 'COME OUT';
  return { chest: 'SEARCH', closet: 'HIDE', shrine: 'REST' }[it.kind] || '';
}
const use = {
  chest(it) {
    it.open = 1; SND('drawer');
    setTimeout(() => {
      if (!run) return;
      const p = E.P1, y = 330;
      if (it.loot === 'key') { run.key = true; SND('key'); say(it.x, y, 'A KEY', '#ffd23d'); }
      else if (it.loot === 'heal') { run.frac = Math.min(1, run.frac + .3); SND('heal'); say(it.x, y, 'HEALING TALISMAN +30%', '#9fe870'); }
      else if (it.loot === 'tokens') { const n = 2 + (Math.random() * 5 | 0); run.found += n; S.found += n; save(); if (JU.shop && JU.shop.earn) JU.shop.earn(n, null); SND('coin'); say(it.x, y, '+' + n + ' CURSED TOKENS', '#ffd23d'); }
      else if (it.loot === 'note') { SND('page'); note(pick(NOTES)); }
      else say(it.x, y, 'NOTHING', '#9a9088');
      void p;
    }, 260);
  },
  closet(it) {
    const p = E.P1;
    if (it.mimic && !it.spent) {                    // it was not a closet
      it.spent = 1; it.bite = .7; SND('bite'); hurt(.2, 'MIMIC!', it.x >= p.x ? -1 : 1); return;
    }
    run.st = 'hide'; run.hide = it; it.in = true; p.alpha = 0; p.x = it.x; p.vx = 0; SND('shut');
  },
  shrine(it) { it.used = 1; run.frac = 1; SND('heal'); say(it.x, 360, 'RESTED · ALL YOUR HEALTH BACK', '#9fe870'); }
};
function act() {
  const it = near();
  if (!it) return;
  if (run.st === 'hide') { const c = run.hide; c.in = false; run.hide = null; run.st = 'walk'; E.P1.alpha = 1; SND('creak'); return; }
  if (it.door) {
    if (it.sealed) { sfx.back(); return; }
    if (it.locked) {
      if (!run.key) { sfx.back(); SND('knock', 1); say(it.x, 420, 'LOCKED', '#ff8a5a'); return; }
      it.locked = false; run.key = false; SND('key'); say(it.x, 420, 'UNLOCKED', '#ffd23d'); return;
    }
    through(); return;
  }
  use[it.kind](it);
}
function through() {
  const R = run.R, p = E.P1;
  run.st = 'through'; run.et = 0; run.x0 = p.x; R.door.target = 1; SND('creak');
  p.face = R.door.x >= p.x ? 1 : -1;
}
function press(a) {
  if (!run) return;
  if (a === 'ok' || a === 'm1') act();
  else if (a === 'jump' && run.st === 'walk') { const p = E.P1; if (p.ground && !(p.hurtT > 0) && !(p.held > 0)) { p.vy = 960; p.ground = false; sfx.jump(); E.addDust(p.x); } }
}
const say = (x, y, n, col, life = 1.4) => E.fx.push({ k: 2, x, y, n, col, t: 0, life });
// hurt out here (fr: a share of all his health)
function hurt(fr, why, dir) {
  if (!run || run.st === 'dead') return;
  const p = E.P1;
  run.frac = Math.max(0, run.frac - fr); p.flash = .12; run.red = 1;
  cam.shake = Math.max(cam.shake, 16); sfx.hit(true);
  E.addSpark(p.x, p.y + 150, '#ff5a6e', 110); E.addNum(p.x, p.y + 290, Math.round(fr * 100) + '%', '#ff5a6e');
  if (why) say(p.x, 420, why, '#ff5a6e', 1.2);
  if (dir) { p.hurtT = .95; p.vx = dir * 620; p.vy = 520; p.ground = false; p.y = Math.max(p.y, 1); }
  if (run.frac <= 0) died();
}
function arrive(R) {
  if (R.kind === 'sealed') { run.st = 'cut'; run.cut = { kind: 'seal', t: 0 }; SND('seal'); return; }
  if (R.kind === 'boss') { run.st = 'cut'; run.cut = { kind: 'boss', t: 0, cam: 0 }; MUS.stop(); SND('rumble'); return; }
  if (R.kind === 'shrine' && run.saved) { run.saved = 0; say(E.P1.x, 430, 'CHECKPOINT · DOOR ' + pad(R.n), '#ffd23d', 1.8); }
  if (R.kind === 'lobby') note('Welcome. Your room is at the end of the hall. Then the next one. Then the next one.', 4.2);
}

/* ---------- what happens in the rooms ---------- */
function events(dt) {
  const R = run.R, ev = R.ev, p = E.P1, hidden = run.st === 'hide';
  if (!ev || run.st === 'dead' || run.st === 'enter' || run.st === 'through' || run.st === 'fight') return;
  ev.t += dt;
  if (ev.kind === 'stampede') {
    if (ev.ph === 'wait' && (R.t > ev.at || Math.abs(p.x - R.ex) < 260)) { ev.ph = 'warn'; ev.t = 0; SND('rumble'); say(p.x, 440, 'THE LAMPS ARE SHAKING...', '#ffb347', 1.6); }
    else if (ev.ph === 'warn') {
      R.flick = .2; cam.shake = Math.max(cam.shake, 2 + 6 * ev.t / ev.warn);
      if (ev.t > ev.warn) {
        ev.ph = 'run'; ev.t = 0; ev.lead = -ev.dir * 1500; ev.hit = false; SND('herd');
        const n = 8 + Math.min(8, R.n / 10 | 0);
        ev.pack = Array.from({ length: n }, (_, i) => { const big = i % 3 === 2, f = E.fighter(big ? D.brute.skin : D.grunt.skin, 0, ev.dir); f.off = i * 62 + rnd(0, 40); f.z = ZP - 130 + rnd(0, 300); f.scale = big ? 1.15 : rnd(.85, 1.02); f.walk = rnd(0, 6); return f; });
      }
    } else if (ev.ph === 'run') {
      R.flick = .2; cam.shake = Math.max(cam.shake, 10);
      ev.lead += ev.dir * 2500 * dt;
      for (const f of ev.pack) { f.x = ev.lead - ev.dir * f.off; f.face = ev.dir; C.stroll(f, true, dt, 2.6); f.y = Math.abs(Math.sin(f.walk)) * 16; }
      const tail = ev.lead - ev.dir * (ev.pack.length * 62 + 60);
      if (!ev.hit && !hidden && p.y < 260 && (p.x - tail) * ev.dir > -40 && (ev.lead - p.x) * ev.dir > -40) { ev.hit = true; hurt(R.n < 30 ? .3 : R.n < 70 ? .38 : .45, 'TRAMPLED', ev.dir); }
      if ((tail - ev.dir * 1200) * ev.dir > 0) { ev.ph = 'done'; ev.pack = []; R.flick = 0; if (!ev.hit) say(p.x, 430, 'IT PASSED', '#cfc8bc'); }
    }
  } else if (ev.kind === 'watcher') {
    if (ev.ph === 'shut' && ev.t > ev.next) { ev.ph = 'stir'; ev.t = 0; ev.x = clamp(p.x + rnd(-300, 300), -700, 700); SND('stir'); }
    else if (ev.ph === 'stir' && ev.t > 1.3) { ev.ph = 'open'; ev.t = 0; ev.seen = 0; say(p.x, 440, 'KEEP STILL', '#ff5a6e', 1.4); }
    else if (ev.ph === 'open') {
      const moving = !hidden && (Math.abs(p.vx) > 20 || !p.ground);
      if (moving) { ev.seen += dt; if (ev.seen > .32) { ev.seen = 0; SND('seen'); hurt(.1, 'IT SEES YOU'); } } else ev.seen = Math.max(0, ev.seen - dt);
      if (ev.t > 3) { ev.ph = 'shut'; ev.t = 0; ev.next = rnd(4.5, 8); }
    }
  } else if (ev.kind === 'grasp') {
    if (!hidden && ev.t > ev.next && run.st === 'walk') { ev.t = 0; ev.next = clamp(rnd(2.4, 4) - R.n * .01, 1.6, 4); ev.pools.push({ x: p.x, t: 0, done: false }); SND('grasp'); }
    for (let i = ev.pools.length - 1; i >= 0; i--) {
      const q = ev.pools[i]; q.t += dt;
      if (q.t > .95 && !q.done) { q.done = true; if (!hidden && Math.abs(p.x - q.x) < 100 && p.y < 70) { hurt(.12, 'GRABBED'); p.held = .8; SND('bite'); } }
      if (q.t > 1.7) ev.pools.splice(i, 1);
    }
  }
}
// the herd, drawn with everybody else
const cast0 = H.cast;
H.cast = () => {
  const a = cast0 ? cast0() : null;
  const ev = run && run.R && run.R.ev && E.root.dataset.mode === 'doors' && run.R.ev.kind === 'stampede' && run.R.ev.ph === 'run' ? run.R.ev.pack : null;
  return ev && ev.length ? (a || []).concat(ev) : a;
};

/* ---------- a sealed room, and the bosses' entrances ---------- */
function cutUpdate(dt) {
  const c = run.cut, R = run.R, p = E.P1;
  c.t += dt; C.stroll(p, false, dt);
  if (c.kind === 'seal') {                          // the curtain comes down, and the curses come out of the walls
    R.curtain = Math.min(1, c.t / .8); R.door.sealed = true;
    if (c.t > 1.3) sealedFight();
  } else if (c.kind === 'boss') {
    cam.shake = Math.max(cam.shake, c.t < 1.6 ? 5 : 0);
    if (c.t > .6 && !c.door) { c.door = 1; R.door.target = 1; SND('creak'); }
    if (c.t > 1.5 && !c.say) { c.say = 1; SND('roar'); E.banner(R.n === 50 ? '扉番' : '扉番・全開', 'RAID BOSS · THE DOORKEEPER', 'sm'); }
    if (c.t > 2.6) bossFight(R.n);
  }
}
function toFight(cfg) {
  run.st = 'fight';
  const fr = run.frac;
  Fi.start(Object.assign({ stage: run.R.stage, p1x: clamp(E.P1.x, -760, 760), doors: run.R.n }, cfg));
  if (cfg.full) E.P1.hp = E.P1.max; else E.P1.hp = Math.max(1, Math.round(fr * E.P1.max));
  paint();
}
function sealedFight() {
  const n = run.R.n, foes = n < 20 ? ['grunt'] : n < 45 ? ['grunt', 'brute'] : n < 75 ? ['grunt', 'brute', 'brute'] : ['brute', 'brute', 'brute'];
  toFight({ foes, label: 'DOOR ' + pad(n) + ' · SEALED', win: ['祓', 'UNSEALED'], wait: 1300,
    onWin: () => { if (!run) return; run.frac = E.P1.hp / E.P1.max; const R = run.R; R.sealed = false; R.door.sealed = false; R.curtain = 0; R.kind = 'cleared'; backTo(R); },
    onLose: died });
}
function backTo(R) {                                // after a fight: back on his feet in the room, where he was
  const x = clamp(E.P1.x, -960, 960);
  stage(R, x, false);
  run.st = 'walk';
  if (MUS.now !== 'amb') MUS.start('amb');
}
function bossFight(n) {
  const R = run.R;
  run.boss = { n, got: 0, done: false, items: n === 50
    ? shuffle([-800, -280, 60, 380, 640, 800]).slice(0, 5).map((x, i) => ({ x, y: [40, 180, 300, 90, 240][i], got: false }))      // (none where he starts, at -560)
    : LAMPS.map(x => ({ x, on: false, hold: 0 })) };
  MUS.start('boss');
  R.door.target = 0;
  toFight({ foes: [n === 50 ? 'dk50' : 'dk100'], label: 'RAID BOSS · DOOR ' + n, p1x: -560, full: 1, win: ['祓', 'THE DOORKEEPER FALLS'], wait: 2400,
    onWin: () => bossWon(n), onLose: died });
}
function bossWon(n) {
  if (!run) return;
  const R = run.R, first = n === 50 ? !S.k50 : !S.k100, pay = first ? (n === 50 ? 100 : 300) : 0;
  if (n === 50) S.k50 = 1; else S.k100 = 1;
  if (pay && JU.shop && JU.shop.earn) JU.shop.earn(pay, null);
  run.found += pay; save();
  run.frac = Math.max(.5, E.P1.hp / E.P1.max);
  R.done = 1; R.door.locked = false; R.door.target = .3; run.boss = null;
  backTo(R);
  MUS.stop();
  say(E.P1.x, 470, pay ? '+' + pay + ' CURSED TOKENS · FIRST CLEAR' : 'THE DOOR IS OPEN', '#ffd23d', 2.6);
  if (n === 100) say(E.P1.x, 400, 'THE LAST DOOR IS OPEN', '#e8eef8', 2.6);
}
// during a boss fight: the books and the switches, and what they do to it
function weaken() {
  const Bz = run.boss, o = E.P2;
  Bz.got++;
  const fifty = Bz.n === 50, base = D[fifty ? 'dk50' : 'dk100'].dr;
  if (o && !o.ko) {
    o.dr = base + Bz.got * (fifty ? .16 : .19);
    if (o.ground && o.state !== 'down') { o.state = 'hurt'; o.act = null; o.stun = Bz.got >= 5 ? 2.4 : .9; o.vx = 0; o.flash = .2; }
    E.addSpark(o.x, o.y + 200 * (o.scale || 1), DKC, 160);
  }
  V.ring(E.P1.x, E.P1.y + 150, 200, '#ffd23d', .35);
  cam.shake = Math.max(cam.shake, 10);
  if (Bz.got >= 5) { E.banner(fifty ? '名' : '灯', fifty ? 'ITS NAME IS TORN OUT · IT IS WEAK' : 'EVERY LIGHT IS ON · IT IS WEAK', 'sm'); SND('roar'); }
  else say(E.P1.x, 440, (fifty ? 'BOOK ' : 'SWITCH ') + Bz.got + '/5 · IT IS WEAKER', '#ffd23d', 1.4);
}
const tick0 = H.tick;
H.tick = dt => {
  tick0(dt);
  const Bz = run && run.boss, cfg = Fi.fight.cfg;
  if (!Bz || !cfg || cfg.doors !== Bz.n || E.root.dataset.mode !== 'fight') return;
  const p = E.P1;
  paint();
  if (p.dead) return;
  if (Bz.n === 50) for (const b of Bz.items) {
    if (b.got) continue;
    const by = b.y + Math.sin(E.T * 2.4 + b.x) * 12;
    if (Math.abs(p.x - b.x) < 75 && by > p.y - 40 && by < p.y + 300 * (p.scale || 1)) { b.got = true; SND('page'); weaken(); for (let i = 0; i < 6; i++) V.puff && V.puff('purple', b.x, by, rnd(-300, 300), rnd(100, 400), 30, .5); }
  } else for (const s of Bz.items) {
    if (s.on) continue;
    if (Math.abs(p.x - s.x) < 80 && p.y < 140) { s.hold += dt; if (s.hold >= FLIP) { s.on = true; s.hold = FLIP; SND('flip'); setTimeout(() => SND('lamp'), 200); weaken(); } }
    else s.hold = Math.max(0, s.hold - dt * 1.5);
  }
};
const fp0 = H.foePower, fr0 = H.foeRate;
H.foePower = a => (fp0 ? fp0(a) : 1) * (run && run.boss && E.root.dataset.mode === 'fight' ? 1 - run.boss.got * .1 : 1);
H.foeRate = o => (fr0 ? fr0(o) : 1) * (run && run.boss && o && o.ai && (o.ai.d === D.dk50 || o.ai.d === D.dk100) ? 1 - run.boss.got * .06 : 1);

/* ---------- falling, and getting out ---------- */
function died() {
  if (!run || run.st === 'dead') return;
  run.st = 'dead'; run.boss = null; S.deaths++; save();
  MUS.stop(); SND('die');
  const p = E.P1; p.hurtT = 0;
  setTimeout(() => {
    if (!run || run.st !== 'dead') return;
    const cp = S.cp;
    showOv('dead', `<small>DOOR ${pad(run.n)}</small><b>YOU DIED</b><p>${run.n === cp ? 'You carry on from this door.' : 'You carry on from door ' + pad(cp) + ', the last checkpoint.'}</p>
      <div class="drbtns"><button data-do="again">CONTINUE · DOOR ${pad(cp)} <small>E</small></button><button data-do="leave">LEAVE <small>ESC</small></button></div>`);
  }, E.root.dataset.mode === 'fight' ? 1500 : 1200);
}
function again() { const cp = S.cp; hideOv(); if (run) JU.game.start('doors', cp); }
function ending() {
  const secs = Math.round((performance.now() - run.start) / 1000), first = S.wins === 0;
  S.wins++; S.best = 100; S.cp = 0; save();
  run.st = 'dead'; run.fade = 1; MUS.stop(); SND('out');
  showOv('out', `<small>DOOR 100 · THE LAST DOOR</small><b>YOU GOT OUT</b><p>Out of the inn of a hundred doors and onto the street${first ? ', for the first time' : ''}. This run: ${Math.floor(secs / 60)}m ${secs % 60}s, ${run.found} Cursed Tokens earned.</p>
    <div class="drbtns"><button data-do="leave">BACK TO THE PAGE <small>E</small></button></div>`);
}

/* ---------- the screen over the room: the light, the dark, the closet's slats, the number of the door ---------- */
function render(dt, real) {
  E.renderArena(dt);
  if (!run || !run.R) return;
  const R = run.R, VW = E.VW, VH = E.VH, p = E.P1;
  if (R.flick > 0 && Math.random() < .45) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, VW, VH); }
  if (R.dark && run.st !== 'fight') {               // a dark room: only round him
    const c = P(p.x, p.y + 150, p.z || ZP), gr = g.createRadialGradient(c[0], c[1], 40, c[0], c[1], 360);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.55, 'rgba(0,0,0,.72)'); gr.addColorStop(1, 'rgba(0,0,0,.95)');
    g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
    if (R.ev && R.ev.kind === 'watcher' && R.ev.ph !== 'shut') drawWatcher(R);      // (it can be seen in the dark: it is the only thing that can)
  }
  if (run.st === 'hide') {                          // looking out between the slats of the closet
    g.fillStyle = 'rgba(0,0,0,.84)'; g.fillRect(0, 0, VW, VH);
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 6; i++) { const y = VH * (.3 + i * .07); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(VW * .18, y, VW * .64, VH * .022); }
    g.globalCompositeOperation = 'source-over';
  }
  if (run.red > 0) { g.fillStyle = `rgba(160,0,20,${.35 * run.red})`; g.fillRect(0, 0, VW, VH); run.red = Math.max(0, run.red - real * 2.5); }
  if (run.st === 'dead') { g.fillStyle = 'rgba(40,0,6,.45)'; g.fillRect(0, 0, VW, VH); }
  if (run.card && R.n > 0) {                        // the number of the door, over the room as he comes in
    const u = run.card.t, a = u < .3 ? u / .3 : u > 2 ? Math.max(0, 1 - (u - 2) / .6) : 1;
    g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(0,0,0,.6)'; g.font = `600 ${Math.round(VH * .028)}px ${SANS}`; g.fillText(R.kind === 'boss' ? 'RAID BOSS' : R.pal.name, VW / 2 + 2, VH * .12 + 2);
    g.fillStyle = '#d9c9a8'; g.fillText(R.kind === 'boss' ? 'RAID BOSS' : R.pal.name, VW / 2, VH * .12);
    g.font = `${Math.round(VH * .11)}px ${SERIF}`; g.fillStyle = 'rgba(0,0,0,.7)'; g.fillText(pad(R.n), VW / 2 + 4, VH * .21 + 4);
    g.fillStyle = R.n % 50 === 0 ? '#ff8a5a' : '#f2e6c8'; g.fillText(pad(R.n), VW / 2, VH * .21);
    g.globalAlpha = 1;
  }
  if (run.fade > 0) { g.fillStyle = `rgba(0,0,0,${run.fade})`; g.fillRect(0, 0, VW, VH); }
}

/* ================= the HUD over a run, and the boxes that come up ================= */
const hud = document.createElement('div'); hud.className = 'drhud'; hud.setAttribute('aria-live', 'polite');
hud.innerHTML = `<div class="drtop"><b class="drn"><small>DOOR</small><i>000</i></b><span class="drhp" aria-label="Health"><i></i></span><em class="drinv"></em></div>
  <button class="drpr" type="button"></button>
  <div class="drtouch"><button type="button" data-dr="jump">JUMP</button><button type="button" data-dr="use">USE</button></div>
  <p class="drkeys"><kbd>A</kbd><kbd>D</kbd> walk · <kbd>Shift</kbd> run · <kbd>W</kbd> jump · <kbd>E</kbd> use · <kbd>Esc</kbd> leave</p>`;
E.root.appendChild(hud);
const obj = document.createElement('div'); obj.className = 'drobj'; E.root.appendChild(obj);
const ov = document.createElement('div'); ov.className = 'drov'; ov.setAttribute('aria-live', 'assertive'); E.root.appendChild(ov);
const paper = document.createElement('div'); paper.className = 'drnote'; E.root.appendChild(paper);
let ovKind = '', noteT = 0, lastPaint = '';
function showOv(kind, html) { ovKind = kind; ov.className = 'drov on ' + kind; ov.innerHTML = html; }
function hideOv() { ovKind = ''; ov.className = 'drov'; ov.innerHTML = ''; }
function note(t, s = 3.4) { paper.textContent = t; paper.classList.add('on'); clearTimeout(noteT); noteT = setTimeout(() => paper.classList.remove('on'), s * 1000); }
function paint() {
  if (!run) return;
  const it = near(), lb = label(it), Bz = run.boss;
  const key = [run.n, Math.round(run.frac * 200), run.key, lb, run.found, Bz ? Bz.got : -1, run.st].join('|');
  if (key === lastPaint) return;
  lastPaint = key;
  hud.querySelector('.drn i').textContent = pad(run.n);
  hud.querySelector('.drhp i').style.width = (run.frac * 100).toFixed(1) + '%';
  hud.querySelector('.drhp').classList.toggle('low', run.frac < .3);
  hud.querySelector('.drinv').innerHTML = (run.key ? '<span class="k">⚷ KEY</span>' : '') + (run.found ? `<span>+${run.found} TOKENS</span>` : '');
  const pr = hud.querySelector('.drpr');
  pr.innerHTML = lb ? `<kbd>E</kbd> ${lb}` : ''; pr.classList.toggle('on', !!lb); pr.classList.toggle('no', /LOCKED|SEALED/.test(lb));
  obj.className = 'drobj' + (Bz ? ' on' : '');
  if (Bz) obj.innerHTML = Bz.n === 50 ? `<b>BOOKS</b><span>${'▮'.repeat(Bz.got)}${'▯'.repeat(5 - Bz.got)}</span><i>touch the glowing books: each one weakens it</i>` : `<b>SWITCHES</b><span>${'●'.repeat(Bz.got)}${'○'.repeat(5 - Bz.got)}</span><i>stand at a switch to pull it: the light weakens it</i>`;
}
hud.addEventListener('pointerdown', e => {
  const b = e.target.closest('button');
  e.stopPropagation();
  if (!b || !run) return;
  if (b.classList.contains('drpr')) act();
  else if (b.dataset.dr === 'use') act();
  else if (b.dataset.dr === 'jump') press('jump');
  paint();
});
ov.addEventListener('pointerdown', e => {
  const b = e.target.closest('[data-do]'); e.stopPropagation();
  if (!b) return;
  if (b.dataset.do === 'again') again(); else { hideOv(); JU.exitGame(); }
});
// while a box is up, a key is an answer to it, not a step
addEventListener('keydown', e => {
  if (!ovKind || !run) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (e.repeat) return;
  const k = e.key;
  if (ovKind === 'dead') { if (k === 'Escape') { hideOv(); JU.exitGame(); } else if (k === 'e' || k === 'E' || k === 'Enter' || k === ' ') again(); }
  else if (ovKind === 'out') { if (k === 'e' || k === 'E' || k === 'Enter' || k === ' ' || k === 'Escape') { hideOv(); JU.exitGame(); } }
}, true);

/* ================= the page: [their door] × JUJUTSU UNLIMITEDS ================= */
let busy = false, bgRaf = 0;
function mount() {
  const el = $('#drIn');
  if (!el) return;
  const cp = S.cp, started = S.best > 0 && cp > 0;
  let map = '';
  for (let i = 1; i <= 100; i++) {
    const boss = i === 50 || i === 100, past = i <= S.best, here = i === cp && started, chk = i % 10 === 0 && !boss;
    map += `<i class="${boss ? 'b ' : ''}${past ? 'p ' : ''}${here ? 'h ' : ''}${chk ? 'c' : ''}" title="Door ${pad(i)}${boss ? ': RAID BOSS' : chk ? ': a shrine' : ''}"></i>`;
  }
  el.innerHTML = `<header class="dvhead"><img class="dvlogo" src="${LOGO}" alt="The door"><b class="dvx" aria-hidden="true">×</b><span class="dvju">JUJUTSU<br>UNLIMITEDS</span></header>
    <h1 class="dvtitle"><small>百扉旅館</small>THE HUNDRED DOORS</h1>
    <p class="dvtag"><span>DLC</span> A CURSED INN · A HUNDRED DOORS · ONE WAY OUT <span>${dev() ? 'TEAM' : 'FREE'}</span></p>
    <div class="dvmap" aria-label="Doors reached: ${S.best} of 100">${map}</div>
    <div class="dvgo">${started ? `<button class="dvbtn go" type="button" data-go="${cp}">CONTINUE <small>FROM DOOR ${pad(cp)}</small></button><button class="dvbtn new" type="button" data-go="0">NEW RUN <small>FROM THE FRONT DESK</small></button>` : `<button class="dvbtn go" type="button" data-go="0">ENTER THE INN <small>DOOR 001 IS WAITING</small></button>`}</div>
    <div class="dvcards">
      <div class="dvcard boss${S.k50 ? ' won' : ''}"><small>DOOR 050 · RAID BOSS</small><b>THE DOORKEEPER</b><p>In the archive. Five books glow round the room: touch them and it weakens.</p><i>${S.k50 ? 'BEATEN' : 'FIRST CLEAR · 100 CURSED TOKENS'}</i></div>
      <div class="dvcard boss${S.k100 ? ' won' : ''}"><small>DOOR 100 · RAID BOSS</small><b>EVERY DOOR OPEN</b><p>In the lamp hall. Pull the five switches: every lamp lit weakens it.</p><i>${S.k100 ? 'BEATEN' : 'FIRST CLEAR · 300 CURSED TOKENS'}</i></div>
      <div class="dvcard rec"><small>RECORDS</small><b>BEST: DOOR ${pad(S.best)}</b><p>Got out ${S.wins} time${S.wins === 1 ? '' : 's'} · fell ${S.deaths} time${S.deaths === 1 ? '' : 's'} · ${S.found} tokens found in drawers</p><i>A SHRINE EVERY TEN DOORS</i></div>
    </div>
    <footer class="dvfoot"><button class="dvback" type="button">◀ BACK <small>ESC</small></button><span class="dvhint">The Stampede: hide in a closet · The Watcher: keep still · The Grasp: step off the black · A breathing closet: stay out</span>
      <button class="dvmus" type="button" aria-pressed="${!!S.music}">♪ ${S.music ? 'ON' : 'OFF'}</button></footer>`;
}
function focusFirst() { const b = $('#drIn .dvbtn.go') || $('#drIn .dvback'); if (b) b.focus({ preventScroll: true }); }
function play(n, x, y) {
  if (busy || !JU.doorTitle || !JU.doorTitle.open) return;
  MUS.stop(); stopBg();
  JU.startGame(x, y, 'doors', n);
}
document.addEventListener('click', e => {
  const page = $('#drev');
  if (!page || !page.contains(e.target)) return;
  const go = e.target.closest('[data-go]');
  if (go) { const r = go.getBoundingClientRect(); sfx.confirm(); play(+go.dataset.go, e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2); return; }
  if (e.target.closest('.dvmus')) { S.music = S.music ? 0 : 1; save(); if (S.music) MUS.start('event'); else MUS.stop(); mount(); const m = $('#drIn .dvmus'); if (m) m.focus(); return; }
  if (e.target.closest('.dvback')) { if (JU.doorTitle) JU.doorTitle.close(); }
});
addEventListener('keydown', e => {                    // the arrows go round the page; Esc goes back (index.html)
  if (!JU.doorTitle || !JU.doorTitle.open || (JU.game && JU.game.state.running)) return;
  const k = e.key, list = [...document.querySelectorAll('#drIn .dvbtn, #drIn .dvback, #drIn .dvmus')];
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].includes(k) || !list.length) return;
  e.preventDefault();
  const i = Math.max(0, list.indexOf(document.activeElement)), dir = k === 'ArrowLeft' || k === 'a' || k === 'ArrowUp' || k === 'w' ? -1 : 1;
  list[(i + dir + list.length) % list.length].focus({ preventScroll: true }); sfx.hover();
});
// behind it: a hall of doors running away, a lamp that flickers, black goo running down from the top
const DRIPS = Array.from({ length: 26 }, () => ({ x: Math.random(), l: rnd(.02, .12), v: rnd(.01, .04), w: rnd(.004, .012) }));
function bg() {
  const cv = $('#drbg');
  if (!cv) return;
  const Wd = Math.ceil(innerWidth / 2), Hd = Math.ceil(innerHeight / 2), x = cv.getContext('2d');
  if (cv.width !== Wd || cv.height !== Hd) { cv.width = Wd; cv.height = Hd; }
  const t = performance.now() / 1000, fl = Math.sin(t * 13) > .93 || Math.sin(t * 7.1) > .97 ? .35 : 1;
  x.fillStyle = '#050302'; x.fillRect(0, 0, Wd, Hd);
  const cx = Wd / 2, cy = Hd * .52, vw = Wd * .07, vh = Hd * .1;
  for (let i = 9; i >= 0; i--) {                     // the hall: frames one inside the next, doors down both sides
    const u = i / 9, s = lerp(1, .06, Math.pow(1 - u, .3)), w = Wd * .62 * s + vw, h = Hd * .9 * s + vh, sh = Math.round(14 + 30 * s);
    x.strokeStyle = `rgb(${sh + 18},${sh + 8},${sh})`; x.lineWidth = Math.max(1, 3 * s); x.strokeRect(cx - w / 2, cy - h / 2, w, h);
    if (i % 2 && i > 1) for (const sd of [-1, 1]) { const dx = cx + sd * w / 2 - (sd > 0 ? w * .07 : 0), dw = w * .07, dh = h * .62; x.fillStyle = `rgb(${sh + 30},${sh + 14},${sh + 4})`; x.fillRect(dx, cy + h / 2 - dh, dw, dh); x.fillStyle = '#c9a050'; x.fillRect(dx + dw * (sd > 0 ? .15 : .7), cy + h / 2 - dh * .5, Math.max(1, dw * .14), Math.max(1, dw * .14)); }
  }
  const gr = x.createRadialGradient(cx, cy - Hd * .3, 0, cx, cy - Hd * .3, Hd * .7); gr.addColorStop(0, `rgba(255,176,96,${.28 * fl})`); gr.addColorStop(1, 'rgba(255,176,96,0)');
  x.fillStyle = gr; x.fillRect(0, 0, Wd, Hd);
  x.fillStyle = `rgba(255,214,150,${.9 * fl})`; x.beginPath(); x.ellipse(cx, cy - Hd * .3, 6, 9, 0, 0, TAU); x.fill();
  x.fillStyle = '#020102';                          // the goo along the top, and running down
  x.beginPath(); x.moveTo(0, 0);
  for (let i = 0; i <= 40; i++) { const u = i / 40; x.lineTo(u * Wd, Hd * (.035 + .018 * Math.sin(u * 23 + t * .7) + .012 * Math.sin(u * 61 - t))); }
  x.lineTo(Wd, 0); x.closePath(); x.fill();
  for (const d of DRIPS) {
    d.l += d.v / 60; if (d.l > .55) { d.l = rnd(.02, .06); d.x = Math.random(); }
    const px = d.x * Wd, w = Math.max(2, d.w * Wd), y1 = Hd * d.l;
    x.fillRect(px - w / 2, 0, w, y1); x.beginPath(); x.arc(px, y1, w * .9, 0, TAU); x.fill();
  }
}
function loop() { bgRaf = requestAnimationFrame(loop); bg(); }
function startBg() { cancelAnimationFrame(bgRaf); bgRaf = requestAnimationFrame(loop); }
function stopBg() { cancelAnimationFrame(bgRaf); bgRaf = 0; }

/* ================= wiring ================= */
const gstart0 = JU.game.start;
JU.game.start = (mode, arg) => { gstart0(mode, arg); if (mode === 'doors') begin(arg); };
const exit0 = JU.exitGame;
JU.exitGame = () => {
  const was = run;
  if (was) { run = null; hideOv(); paper.classList.remove('on'); MUS.stop(); E.root.classList.remove('drrun'); }
  exit0();
  if (!was) return;
  if (JU.doorTitle && JU.doorTitle.open) { mount(); startBg(); MUS.start('event'); setTimeout(focusFirst, 60); }
};
const reset0 = H.reset;
H.reset = () => { reset0(); if (!run) E.root.classList.remove('drrun'); };

/* ---------- its look: the HUD in a run, and the page (only here: the title has its own, index.html) ---------- */
const css = document.createElement('style');
css.textContent = `
.drhud,.drobj,.drov,.drnote{display:none}
.game[data-mode="doors"] .drhud{display:block}
.drhud{position:absolute;inset:0;z-index:6;pointer-events:none;font-family:Oswald,sans-serif;color:#efe2c4}
.drtop{position:absolute;left:clamp(10px,2vw,28px);top:clamp(10px,2vh,24px);display:flex;align-items:center;gap:clamp(8px,1.4vw,18px)}
.drn{display:grid;line-height:.9;text-shadow:0 2px 8px #000}.drn small{font:600 clamp(9px,1.2vh,13px)/1 Oswald,sans-serif;letter-spacing:.3em;color:#c9a050}
.drn i{font:400 clamp(28px,6vh,60px)/1 'Yuji Syuku',serif;font-style:normal}
.drhp{position:relative;width:clamp(120px,18vw,260px);height:clamp(9px,1.4vh,14px);background:#160c08;border:2px solid #4a301c;box-shadow:0 0 0 2px #000}
.drhp i{position:absolute;inset:0 auto 0 0;background:linear-gradient(#e0b46a,#9a6a2a);transition:width .25s}
.drhp.low i{background:linear-gradient(#ff7a6a,#a5102a);animation:drlow .8s steps(2) infinite}@keyframes drlow{50%{opacity:.55}}
.drinv{display:flex;gap:10px;font:600 clamp(11px,1.6vh,16px)/1 Oswald,sans-serif;font-style:normal;letter-spacing:.08em}.drinv span{padding:.35em .6em;background:rgba(10,6,4,.7);border:1px solid #4a301c}.drinv .k{color:#ffd23d;border-color:#b8862e}
.drpr{position:absolute;left:50%;bottom:clamp(70px,15vh,150px);transform:translateX(-50%) scale(.9);opacity:0;pointer-events:none;font:600 clamp(14px,2.4vh,24px)/1 Oswald,sans-serif;letter-spacing:.1em;color:#f2e6c8;background:rgba(12,7,4,.82);border:2px solid #8a6a3a;padding:.5em 1em;transition:opacity .15s,transform .15s;cursor:pointer}
.drpr.on{opacity:1;transform:translateX(-50%);pointer-events:auto}.drpr.no{border-color:#a5102a;color:#ffb0a0}
.drhud kbd,.drpr kbd{display:inline-block;min-width:1.5em;padding:.15em .35em;margin-right:.4em;border:1px solid #c9a050;color:#ffd23d;font:inherit;text-align:center}
.drkeys{position:absolute;left:clamp(10px,2vw,28px);bottom:clamp(8px,1.6vh,18px);margin:0;font:400 clamp(10px,1.5vh,14px)/1 Oswald,sans-serif;color:rgba(239,226,196,.6)}.drkeys kbd{font-size:.9em;padding:.05em .3em;margin:0 .15em}
.drtouch{display:none;position:absolute;right:clamp(14px,3vw,40px);bottom:clamp(14px,4vh,40px);gap:12px;pointer-events:auto}
.touch .game[data-mode="doors"] .drtouch{display:flex}.touch .drkeys{display:none}.touch .drtop{left:calc(clamp(10px,2vw,28px) + 54px)}
.drtouch button{width:clamp(64px,11vh,96px);height:clamp(64px,11vh,96px);border-radius:50%;border:2px solid #8a6a3a;background:rgba(20,12,6,.7);color:#f2e6c8;font:600 clamp(12px,2vh,16px)/1 Oswald,sans-serif;letter-spacing:.1em}
.game.drrun[data-mode="fight"] .drobj.on{display:flex}
.drobj{position:absolute;left:50%;top:clamp(78px,15vh,140px);transform:translateX(-50%);z-index:6;align-items:center;gap:14px;padding:.5em 1.1em;background:rgba(12,7,4,.8);border:2px solid #b8862e;font:600 clamp(12px,1.9vh,18px)/1 Oswald,sans-serif;letter-spacing:.12em;color:#f2e6c8;pointer-events:none}
.drobj span{color:#ffd23d;letter-spacing:.2em;font-size:1.2em}.drobj i{font:400 .78em/1.2 Oswald,sans-serif;font-style:normal;color:rgba(242,230,200,.75);letter-spacing:.04em}
.drov.on{display:grid;position:absolute;inset:0;z-index:30;place-content:center;justify-items:center;gap:clamp(8px,2vh,18px);text-align:center;background:rgba(6,0,2,.72);font-family:Oswald,sans-serif;color:#f2e6c8;animation:drin .5s both}
@keyframes drin{from{opacity:0}}
.drov small{font:600 clamp(12px,1.8vh,18px)/1 Oswald,sans-serif;letter-spacing:.35em;color:#c9a050}
.drov b{font:400 clamp(44px,11vh,120px)/1 'Yuji Syuku',serif;color:#ff5a4a;text-shadow:0 4px 0 #2a0408,0 0 40px rgba(255,40,40,.4)}.drov.out b{color:#f2e6c8;text-shadow:0 4px 0 #2a1a08,0 0 40px rgba(255,214,140,.5)}
.drov p{max-width:min(620px,86vw);margin:0;font:400 clamp(13px,2vh,19px)/1.4 Oswald,sans-serif;color:rgba(242,230,200,.85)}
.drbtns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.drbtns button{font:600 clamp(13px,2.1vh,20px)/1 Oswald,sans-serif;letter-spacing:.12em;padding:.7em 1.3em;background:#1a0f08;color:#f2e6c8;border:2px solid #8a6a3a;cursor:pointer}
.drbtns button:hover,.drbtns button:focus-visible{background:#3a2414;border-color:#ffd23d;outline:0}.drbtns small{opacity:.6;margin-left:.5em}
.drnote.on{display:block;position:absolute;left:50%;top:22%;transform:translateX(-50%) rotate(-1.5deg);z-index:7;max-width:min(460px,80vw);padding:1.1em 1.4em;background:#e8dcc0;color:#2a1a0e;font:400 clamp(14px,2.3vh,21px)/1.35 'Yuji Syuku',serif;box-shadow:0 10px 30px rgba(0,0,0,.7);animation:drin .3s both;pointer-events:none}
.drnote.on::before{content:"A NOTE";display:block;margin-bottom:.4em;font:600 .62em/1 Oswald,sans-serif;letter-spacing:.3em;color:#7a5a30}
/* the page */
#drIn{position:relative;z-index:1;display:grid;justify-items:center;gap:clamp(8px,1.8vh,18px);width:min(1100px,94vw);padding:clamp(14px,3vh,40px) 0;color:#efe2c4;font-family:Oswald,sans-serif}
.dvhead{display:flex;align-items:center;gap:clamp(12px,2.4vw,34px)}
.dvlogo{height:clamp(70px,15vh,150px);width:auto;filter:drop-shadow(0 0 18px rgba(255,214,150,.45)) drop-shadow(0 4px 0 #000)}
.dvx{font:400 clamp(26px,5vh,54px)/1 Oswald,sans-serif;color:#c9a050}
.dvju{font:400 clamp(28px,6vh,62px)/.92 Anton,Oswald,sans-serif;letter-spacing:.04em;color:#f2e6c8;text-shadow:0 3px 0 #5a1418,0 0 26px rgba(255,60,60,.3)}
.dvtitle{margin:0;display:grid;justify-items:center;font:400 clamp(22px,4.6vh,48px)/1 Oswald,sans-serif;letter-spacing:.24em;color:#f2e6c8;text-shadow:0 2px 0 #000}
.dvtitle small{font:400 clamp(14px,2.6vh,26px)/1.3 'Yuji Syuku',serif;letter-spacing:.3em;color:#c9a050}
.dvtag{margin:0;font:600 clamp(10px,1.5vh,14px)/1 Oswald,sans-serif;letter-spacing:.24em;color:rgba(239,226,196,.7)}.dvtag span{padding:.3em .55em;margin:0 .6em;background:#5c1618;color:#f2e6c8}
.dvmap{display:grid;grid-template-columns:repeat(25,1fr);gap:clamp(2px,.35vh,4px);width:min(620px,90vw);padding:clamp(5px,1vh,10px);background:rgba(10,6,3,.75);border:2px solid #3a2414}
.dvmap i{aspect-ratio:3/4;background:#24160c;border:1px solid #3a2414;border-radius:2px 2px 0 0}
.dvmap i.p{background:#8a6a3a;border-color:#c9a050}.dvmap i.c{box-shadow:inset 0 -3px 0 #9fe870}.dvmap i.b{background:#3a0e10;border-color:#a5102a}.dvmap i.b.p{background:#ff8a5a}
.dvmap i.h{background:#ffd23d;box-shadow:0 0 10px #ffd23d;animation:drh 1.2s ease-in-out infinite}@keyframes drh{50%{box-shadow:0 0 2px #ffd23d}}
.dvgo{display:flex;gap:clamp(8px,1.4vw,16px);flex-wrap:wrap;justify-content:center}
.dvbtn{display:grid;gap:.3em;justify-items:center;padding:.75em 1.6em;font:600 clamp(16px,2.8vh,28px)/1 Oswald,sans-serif;letter-spacing:.14em;color:#1a0f08;background:linear-gradient(#e8c47a,#b8862e);border:3px solid #1a0f08;box-shadow:0 0 0 2px #c9a050,0 8px 20px rgba(0,0,0,.6);cursor:pointer}
.dvbtn small{font:600 .48em/1 Oswald,sans-serif;letter-spacing:.2em;opacity:.75}.dvbtn.new{background:linear-gradient(#5a3a22,#2e1c10);color:#f2e6c8}
.dvbtn:hover,.dvbtn:focus-visible{outline:0;filter:brightness(1.15);box-shadow:0 0 0 2px #ffd23d,0 0 30px rgba(255,210,61,.45)}
.dvcards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(8px,1.2vw,14px);width:min(1000px,94vw)}
.dvcard{display:grid;gap:.4em;align-content:start;padding:clamp(8px,1.6vh,16px);background:rgba(14,8,4,.8);border:2px solid #3a2414;text-align:left}
.dvcard small{font:600 clamp(9px,1.3vh,12px)/1 Oswald,sans-serif;letter-spacing:.24em;color:#c9a050}.dvcard b{font:400 clamp(16px,2.6vh,24px)/1 Oswald,sans-serif;letter-spacing:.1em}
.dvcard p{margin:0;font:400 clamp(11px,1.6vh,15px)/1.35 Oswald,sans-serif;color:rgba(239,226,196,.75)}.dvcard i{font:600 clamp(9px,1.3vh,12px)/1 Oswald,sans-serif;font-style:normal;letter-spacing:.16em;color:#ffd23d}
.dvcard.boss{border-color:#5c1618}.dvcard.won{border-color:#c9a050}.dvcard.won i{color:#9fe870}
.dvfoot{display:flex;align-items:center;justify-content:space-between;gap:12px;width:min(1000px,94vw)}
.dvback,.dvmus{font:600 clamp(12px,1.9vh,17px)/1 Oswald,sans-serif;letter-spacing:.14em;padding:.6em 1em;background:#1a0f08;color:#efe2c4;border:2px solid #4a301c;cursor:pointer}
.dvback:hover,.dvback:focus-visible,.dvmus:hover,.dvmus:focus-visible{outline:0;border-color:#ffd23d}.dvback small{opacity:.55;margin-left:.4em}
.dvhint{font:400 clamp(10px,1.4vh,13px)/1.3 Oswald,sans-serif;color:rgba(239,226,196,.55);text-align:center}
@media (max-width:760px){.dvcards{grid-template-columns:1fr}.dvmap{grid-template-columns:repeat(20,1fr)}.dvhint{display:none}}
@media (max-height:520px) and (min-aspect-ratio:1/1){#drIn{gap:6px;padding:8px 0}.dvcards{grid-template-columns:repeat(3,minmax(0,1fr))}.dvcard{padding:6px 8px}.dvcard p,.dvtag,.dvhint{display:none}.dvmap{width:min(440px,58vw);grid-template-columns:repeat(25,1fr)}.dvlogo{height:44px}.dvju{font-size:22px}.dvtitle{font-size:18px}.dvtitle small{font-size:12px}.dvbtn{padding:.5em 1.1em;font-size:15px}}
`;
document.head.appendChild(css);

JU.doors = {
  open() { mount(); startBg(); MUS.start('event'); setTimeout(focusFirst, 80); },
  close() { stopBg(); MUS.stop(); },
  focus: focusFirst, mount, play, S, save, gen, WINGS,
  // for tests: where a run is, and a way to put him in front of any door
  get run() { return run && { n: run.n, st: run.st, frac: +run.frac.toFixed(3), key: run.key, kind: run.R && run.R.kind, ev: run.R && run.R.ev && run.R.ev.kind, boss: run.boss && { n: run.boss.n, got: run.boss.got } }; },
  get room() { return run && run.R; }, get boss() { return run && run.boss; }, get over() { return ovKind; }, set next(k) { forced = k; }, act, press, music: MUS
};
})();
