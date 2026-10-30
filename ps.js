/* JUJUTSU UNLIMITEDS — Build 0.14: servers. Free Exploration asks where now: a PUBLIC server, that anybody playing can drop into (five to a
   server: when one is full the next one opens), or a PRIVATE one, made fresh under a code to give to friends (or joined with a friend's code).
   A private server has the + menu (the button at the right, or P):
     you: fly, no cooldowns, no stun (0.21v2, the user's: hits still hurt, but never stop him or his moves), god mode, an awakening that never
       empties, moon gravity, how hard you hit, how fast the game runs, your health
     dummies: a plain one, one with 1 health, an immortal one, one that attacks, one that blocks from the front, one that uses its Evasive
     a fight with any curse or boss; a district to go to (one that is open to him); the curses on the street
     build mode: blocks put down in the street (click to place, right click to take one away, R to turn it, 1 to 6 or the bar for which kind),
       that everybody on the server sees, walks round and can stand on. His own are kept on this device under the server's code
   None of it pays or counts for anything (a fight from the menu is a ps fight: shop.js, smark.js, awaken.js and shibuya.js leave those
   alone), and none of it is in force in a 1v1 */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, cam = E.cam, H = E.hooks, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, S = JU.street, M = JU.mp, keys = E.keys;
const { clamp, rnd } = E;
const esc = x => String(x).replace(/[<>&"]/g, '');

/* ================= what is set ================= */
const OFF = { fly: false, nocd: false, nostun: false, god: false, awk: false, moon: false, dmg: 1, speed: 1, hp: 0, dhp: 300, build: false, blk: 0, rot: false };
const O = Object.assign({}, OFF);
const on = () => !!(M && M.on && M.kind === 'private');
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const live = () => on() && !duel();                // the menu's settings, in force: in a private server, and not in a 1v1
const mode = () => E.root.dataset.mode;
let flyUp = false, flyDown = false;                // the touch buttons for flying
const FLY_TOP = 320;                               // how high he can fly in a fight: the top of the picture (the street's camera goes up after him instead)

/* ================= Free Exploration: where to ================= */
function choose(body) {
  body.innerHTML = `<div class="srv">
    <div class="seahd"><button class="sback" data-srv="back" aria-label="Back to Play">‹ Play</button><b>Free Exploration</b><span lang="ja">自由探索</span><i>Where to?</i></div>
    <div class="duo">
      <button class="mode" data-mode="free" data-mp="public"><b>Public server</b><span lang="ja">公開</span><i>Anybody playing can drop in: up to five to a server, and the next one opens when it is full. Challenge whoever you meet to a 1v1.</i></button>
      <button class="mode" data-mode="free" data-mp="private" style="border-left-color:#ffd23d"><b>Private server</b><span lang="ja" style="color:#ffd23d">私設</span><i>Your own, under a code to give your friends, and the + menu: fly, no cooldowns, no stun, god mode, your health, dummies, any curse to fight, and build mode.</i></button>
    </div>
    ${M ? M.codeCard() : ''}
  </div>`;
  sfx.confirm();
  const f = body.querySelector('.mode');
  if (f) f.focus({ preventScroll: true });
}
document.addEventListener('click', e => {            // (before the Play screen starts the game: Free Exploration is a choice first)
  const m = e.target.closest('.mode');
  if (m && m.dataset.mode === 'free' && !m.dataset.mp && m.closest('#pBody')) { e.preventDefault(); e.stopPropagation(); choose(m.closest('#pBody')); return; }
  if (e.target.closest('[data-srv="back"]')) { e.preventDefault(); e.stopPropagation(); JU.chapters.mount(document.getElementById('pBody')); sfx.back(); }
}, true);

/* ================= dummies, and the rest of what can be fought ================= */
const base = Fi.DEFS.dummy;                         // the training curse (training.js)
const dummy = (name, more) => Object.assign({}, base, { name, jp: '人形', atk: [], speed: 0, range: 0, gap: [9, 9] }, more);
Object.assign(Fi.DEFS, {
  psDummy: dummy('Dummy'),
  psOne: dummy('1 HP Dummy', { hp: 1 }),
  psImmortal: dummy('Immortal Dummy', { hp: 99999 }),
  psAttack: dummy('Attacking Dummy', { speed: 170, range: 170, gap: [.8, 1.5], atk: [
    { pre: 'hookWind', pose: 'hook', wind: .45, lunge: 280, reach: 175, dmg: 8, kb: 320, stun: .4 },
    { pre: 'crushWind', pose: 'crush', wind: .65, lunge: 320, reach: 200, dmg: 12, kb: 520, lift: 520 }] }),
  psBlock: dummy('Blocking Dummy'),
  psEvade: dummy('Evasive Dummy')
});
// [the fight's id, what kind of dummy, its name, what it does]
const DUMMIES = [['psDummy', 'dummy', 'Dummy', 'Stands there and takes it'], ['psOne', 'one', '1 HP dummy', 'Down in one hit'],
  ['psImmortal', 'immortal', 'Immortal dummy', 'Never goes down'], ['psAttack', 'attack', 'Attacking dummy', 'Hits back'],
  ['psBlock', 'block', 'Blocking dummy', 'Guards from the front: a heavy blow breaks it'], ['psEvade', 'evade', 'Evasive dummy', 'Gets out of uppercuts and slams']];
const SIZED = new Set(['dummy', 'attack', 'block', 'evade']);      // the ones the dummies' health is for
const FOES = ['grunt', 'brute', 'finger', 'jogo', 'mahito', 'hanami', 'todo', 'eso', 'kechizu', 'maki', 'choso', 'toji', 'geto', 'naoya', 'kenjaku', 'sukuna'];
const foes = () => FOES.filter(id => Fi.DEFS[id]);
const EV_DUMMY = 3;                                 // how often the evasive dummy can get out of something
// a fight from the menu: out on the street it starts where he stands and he comes back to the same spot; in a fight it takes that one's place
function fightWith(id, kind) {
  const cfg = { foes: [id], ps: kind, dummy: kind !== 'foe', label: 'Private server' };
  close();
  if (mode() === 'street') S.fight({ cfg, stay: true });
  else if (mode() === 'fight' && Fi.fight.cfg && Fi.fight.cfg.onFlee && !duel()) Fi.start(Object.assign({}, Fi.fight.cfg, cfg));
}
const leaveFight = () => { const c = Fi.fight.cfg; close(); if (c && c.onFlee && !duel()) c.onFlee(); };

/* ================= districts, and the curses in them ================= */
function districts() {
  const out = [['tokyo', 'Tokyo', () => JU.tokyo, () => [420, 640, 1]]], SB = JU.shibuya;
  if (SB && SB.STOPS) for (const s of SB.STOPS) if (s.world && !s.soon && s.id !== 'tokyo') out.push([s.id, s.name, s.world, s.at]);
  if (JU.kyoto && !out.some(d => d[0] === 'kyoto')) { const K = JU.kyoto.world; out.push(['kyoto', 'Kyoto', () => K, () => [420, (K.Z0 + 120) || 640, 1]]); }
  return out;
}
const reachable = id => id === 'tokyo' || id === 'jjh' || !!(JU.shibuya && JU.shibuya.canRide && JU.shibuya.canRide());      // (only where the subway would take him anyway)
function travel(id) {
  const d = districts().find(x => x[0] === id);
  if (!d || !reachable(id) || mode() !== 'street') return;
  close(); S.travel(d[2](), d[3]()); toast(d[1]);
}

/* ================= building ================= */
// [name, width, height, depth, front, side, top, glow]
const KINDS = [['Crate', 100, 100, 100, '#8a6338', '#5e4224', '#a37a4a'], ['Concrete', 120, 80, 120, '#6f6b78', '#4b4855', '#8a8694'],
  ['Wall', 240, 180, 40, '#3b3f52', '#262938', '#4f5468'], ['Pillar', 60, 320, 60, '#9a1a2c', '#64101c', '#b8283c'],
  ['Platform', 240, 40, 180, '#2f3644', '#1e232d', '#475066'], ['Neon', 80, 80, 80, '#38c8ff', '#1f7fa8', '#9fe6ff', 'blue']];
const MINE = 200, ALL = 900, TOP = 800, STEP = 56, PAD = 24;       // his own most; everybody's; how high (and how high he can fly on the street: the rooftops still in the picture); how high a step he can take up onto; how near he can walk to one
let blocks = [];                                    // { id, k (kind), x (middle), y (bottom), z (front), w (district), r (turned), mine }
let ghost = null, joined = '';                      // where the next one would go: { x, y, z, ok }; and the server its blocks were last loaded for
const size = b => { const K = KINDS[b.k]; return b.r ? [K[3], K[2], K[1]] : [K[1], K[2], K[3]]; };      // [across, up, deep]
const here = () => (S.world && S.world.name) || 'tokyo';
const snap = v => Math.round(v / 20) * 20;
function inside(b, x, z, pad = 0) { const [w, , d] = size(b); return Math.abs(x - b.x) < w / 2 + pad && z > b.z - pad && z < b.z + d + pad; }
// something built in the way of somebody at this height: walking into it, not up onto it
function blocked(x, z, y) {
  const w = here();
  for (const b of blocks) if (b.w === w && inside(b, x, z, PAD)) { const h = size(b)[1]; if (b.y < y + 230 && b.y + h > y + STEP) return true; }
  return false;
}
// the highest thing under him that he could be standing on (base: the ground there)
function ground(x, z, y, base) {
  const w = here();
  let top = base;
  for (const b of blocks) if (b.w === w && inside(b, x, z)) { const t = b.y + size(b)[1]; if (t <= y + STEP && t > top) top = t; }
  return top;
}
function aim(p) {                                   // the next block: in front of him, on whatever is already there
  const K = { k: O.blk, r: O.rot }, [w, h, d] = size(K), W = S.world, x = snap(p.x + p.face * (w / 2 + 70)), zc = snap(p.z), z = zc - d / 2, wn = here();
  let y = W.gy(zc, x);
  for (const b of blocks) if (b.w === wn && Math.abs(x - b.x) < (size(b)[0] + w) / 2 - 1 && z < b.z + size(b)[2] - 1 && z + d > b.z + 1) y = Math.max(y, b.y + size(b)[1]);
  const ok = W.free(x, zc) && y + h <= TOP && blocks.filter(b => b.mine).length < MINE && blocks.length < ALL;
  ghost = { x, y, z, k: O.blk, r: O.rot, ok };
}
const wire = b => ({ id: b.id, k: b.k, x: Math.round(b.x), y: Math.round(b.y), z: Math.round(b.z), w: b.w, r: b.r ? 1 : 0 });
function place() {
  if (!ghost || !ghost.ok) { sfx.back(); toast(blocks.filter(b => b.mine).length >= MINE ? `That is all you can build here (${MINE})` : 'Not there'); return; }
  const b = { id: Math.random().toString(36).slice(2, 10), k: ghost.k, x: ghost.x, y: ghost.y, z: ghost.z, w: here(), r: ghost.r, mine: true };
  blocks.push(b); M.all({ t: 'bk', a: 'add', b: wire(b) }); keep(); sfx.land(); sfx.hover();
}
function take() {                                   // the block under where the next would go, the top one; failing that the nearest
  const wn = here(), cx = ghost ? ghost.x : S.me.x, cz = ghost ? ghost.z + size(ghost)[2] / 2 : S.me.z;
  let best = null, bd = 160;
  for (const b of blocks) {
    if (b.w !== wn) continue;
    const d = inside(b, cx, cz) ? -b.y : Math.hypot(b.x - cx, b.z + size(b)[2] / 2 - cz);
    if (d < bd) { bd = d; best = b; }
  }
  if (!best) { sfx.back(); return; }
  drop(best.id, true); sfx.land();
}
function drop(id, tell) {
  const i = blocks.findIndex(b => b.id === id);
  if (i < 0) return;
  const was = blocks[i];
  blocks.splice(i, 1);
  if (tell) M.all({ t: 'bk', a: 'del', id });
  if (was.mine) keep();
}
// his own are kept on this device under the server's code, and come back when he opens it again
const slot = () => 'ju.ps.' + (M.code || '');
function keep() { try { localStorage.setItem(slot(), JSON.stringify(blocks.filter(b => b.mine).map(wire))); } catch (e) {} }
function load() {
  blocks = [];
  let list = [];
  try { list = JSON.parse(localStorage.getItem(slot()) || '[]'); } catch (e) {}
  for (const b of Array.isArray(list) ? list.slice(0, MINE) : []) { const c = clean(b); if (c) blocks.push(Object.assign(c, { mine: true })); }
  if (blocks.length) M.all({ t: 'bk', a: 'all', list: blocks.map(wire) });
}
function clean(b) {                                 // a block from somebody else's game: only what a block can be
  if (!b || typeof b.id !== 'string' || b.id.length > 40 || !KINDS[b.k | 0]) return null;
  const n = v => (typeof v === 'number' && isFinite(v) ? v : NaN), x = n(b.x), y = n(b.y), z = n(b.z);
  if (isNaN(x) || isNaN(y) || isNaN(z) || Math.abs(x) > 20000 || y < -50 || y > TOP || z < 0 || z > 6000) return null;
  return { id: b.id, k: b.k | 0, x, y, z, w: typeof b.w === 'string' ? b.w.slice(0, 20) : 'tokyo', r: !!b.r, mine: false };
}
function add(b) { if (!b || blocks.length >= ALL || blocks.some(x => x.id === b.id)) return; blocks.push(b); }
M.hear('bk', (p, s) => {
  if (!on()) return;
  if (s.a === 'add') add(clean(s.b));
  else if (s.a === 'del' && typeof s.id === 'string') drop(s.id, false);
  else if (s.a === 'all' && Array.isArray(s.list)) for (const b of s.list.slice(0, MINE)) add(clean(b));
});
M.hear('come', p => { if (!on()) return; const mine = blocks.filter(b => b.mine); if (mine.length) M.to(p.id, { t: 'bk', a: 'all', list: mine.map(wire) }); });      // somebody new: what I have built
function clearMine() { for (const b of blocks.filter(x => x.mine)) M.all({ t: 'bk', a: 'del', id: b.id }); blocks = blocks.filter(b => !b.mine); keep(); }
// drawn in the street with everybody else, nearest last: a box, outlined on the front, a neon one lit; and the next one, see-through
function drawBlock(b, a = 1, bad = false) {
  const K = KINDS[b.k], [w, h, d] = size(b);
  g.save(); g.globalAlpha = a;
  const f = E.box(b.x, b.y, b.z, w, h, d, bad ? '#8a1f2c' : K[4], bad ? '#5a141d' : K[5], bad ? '#a8283a' : K[6]);
  g.beginPath(); g.moveTo(f[0][0], f[0][1]); g.lineTo(f[1][0], f[1][1]); g.lineTo(f[2][0], f[2][1]); g.lineTo(f[3][0], f[3][1]); g.closePath();
  g.lineWidth = 2; g.strokeStyle = a < 1 ? (bad ? '#ff5a6e' : '#ffffff') : LINE; g.stroke();
  if (K[7] && a >= 1) { const c = P(b.x, b.y + h / 2, b.z); g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW[K[7]], c[0], c[1], (w + h) * 1.6 * c[2], .55 + .1 * Math.sin(E.T * 4 + b.x)); g.globalCompositeOperation = 'source-over'; }
  g.restore();
}
function props(W) {
  const wn = (W && W.name) || 'tokyo', out = [];
  for (const b of blocks) if (b.w === wn && Math.abs(b.x - cam.x) < 2800) out.push({ z: b.z + size(b)[2], draw: () => drawBlock(b) });
  if (O.build && ghost && live()) { const gh = ghost; out.push({ z: gh.z + size(gh)[2] + .5, draw: () => drawBlock(gh, .45, !gh.ok) }); }
  return out;
}

/* ================= the street's camera, up after him: flying, or up on something built ================= */
let rise = 0;                                      // how far up it has gone
const TOPS = { shibuya: '#020107', kyoto: '#040714' };      // the colour at the top of each district's sky (shibuya.js, kyoto.js; Tokyo's is street.js)
function follow(p, real) {
  let want = 0;
  if (live() && p.y > 1) {                         // his head kept in the picture, with room above it (the street pushes in as he walks away from us: walk.js)
    const q = P(p.x, p.y + 260, p.z), z = cam.zoom || 1;
    want = clamp((E.HY + 70) * (1 - 1 / z) + 120 / z - q[1], 0, 1300);
  }
  rise += (want - rise) * (1 - Math.exp(-real * 5));
  if (!want && rise < .5) rise = 0;
}
// walk.js, before anything is drawn: everything goes down by that much, and above the sky as it is drawn (300 over the top of the screen) is more night, and stars
function lift(W) {
  if (rise < 1) return;
  g.translate(0, rise);
  if (rise < 280) return;
  const top = -rise - 160, VW = E.VW;
  g.fillStyle = TOPS[W && W.name] || '#05060f'; g.fillRect(-400, top, VW + 800, -290 - top);
  g.fillStyle = 'rgba(255,255,255,.6)';
  for (let i = 0; i < 90; i++) {
    const y = -310 - (i * 389 % 1300), x = ((i * 233 - cam.x * .03) % (VW + 300) + VW + 300) % (VW + 300) - 150, s = i % 6 ? 2 : 3;
    if (y > top) g.fillRect(x, y, s, s);
  }
}

/* ================= on screen: the + button, its menu, a line of news, the build bar, and up and down for flying on a touch screen ================= */
const el = (cls, html, tag = 'div') => { const d = document.createElement(tag); d.className = cls; if (html) d.innerHTML = html; E.root.appendChild(d); return d; };
const plus = el('psplus', '+', 'button'), panel = el('pspanel'), news = el('pstoast'), bar = el('psbuild'), flyb = el('psflyb', '<button type="button" data-fly="up" aria-label="Fly up">▲</button><button type="button" data-fly="down" aria-label="Fly down">▼</button>');
plus.type = 'button'; plus.setAttribute('aria-label', 'Private server menu (P)');
let newsT = 0;
function toast(text) { news.textContent = text; news.classList.add('on'); clearTimeout(newsT); newsT = setTimeout(() => news.classList.remove('on'), 1800); }
const tog = (k, name, about) => `<button type="button" data-ps="tog" data-k="${k}" class="${O[k] ? 'on' : ''}"><b>${name}</b>${about ? `<i>${about}</i>` : ''}</button>`;
const cyc = (k, name, list) => `<button type="button" data-ps="cyc" data-k="${k}" data-list="${list.join(',')}" class="${O[k] !== 1 ? 'on' : ''}"><b>${name} ×${O[k]}</b><i>Press for the next</i></button>`;
function paint() {
  const fight = mode() === 'fight', street = mode() === 'street', cfg = Fi.fight.cfg;
  panel.innerHTML = `<header><b>Private server</b><u>${esc(M.code || '')}</u><button type="button" data-ps="close" aria-label="Close">✕</button></header>
    <h4>You</h4>
    <div class="psgrid">${tog('fly', 'Fly', 'Space up · Ctrl down (in a fight W and S too)')}${tog('nocd', 'No cooldowns')}${tog('nostun', 'No stun', 'Hits still hurt, but never stop you or your moves')}${tog('god', 'God mode', 'Your health never drops')}${tog('awk', 'Awakening always full')}${tog('moon', 'Moon gravity')}${cyc('dmg', 'Damage', [1, 2, 5, 10])}${cyc('speed', 'Game speed', [1, .5, 1.5, 2])}</div>
    <div class="psrow"><label>Your health <input data-in="hp" type="number" min="1" max="99999" inputmode="numeric" value="${O.hp || ''}" placeholder="100"></label><button type="button" data-ps="hp">Set</button>${[100, 500, 1000, 9999].map(v => `<button type="button" data-ps="hp" data-v="${v}">${v}</button>`).join('')}${fight ? '<button type="button" data-ps="heal">Heal</button>' : ''}</div>
    <h4>Dummies</h4>
    <div class="psgrid">${DUMMIES.map(d => `<button type="button" data-ps="fight" data-id="${d[0]}" data-kind="${d[1]}"><b>${d[2]}</b><i>${d[3]}</i></button>`).join('')}</div>
    <div class="psrow"><label>Their health <input data-in="dhp" type="number" min="1" max="99999" inputmode="numeric" value="${O.dhp}"></label><button type="button" data-ps="dhp">Set</button></div>
    <h4>Fight a curse</h4>
    <div class="psgrid">${foes().map(id => `<button type="button" data-ps="fight" data-id="${id}" data-kind="foe"><b>${esc(Fi.DEFS[id].name)}</b><i>${esc(Fi.DEFS[id].jp || '')}</i></button>`).join('')}</div>
    ${fight && cfg && cfg.onFlee ? '<div class="psrow"><button type="button" data-ps="leave">Back to the street</button></div>' : ''}
    <h4>World</h4>
    <div class="psgrid">${districts().map(d => `<button type="button" data-ps="go" data-id="${d[0]}"${street && reachable(d[0]) ? '' : ' disabled'}><b>${esc(d[1])}</b><i>${reachable(d[0]) ? (here() === d[0] ? 'You are here' : 'Go there') : 'Not open to you yet'}</i></button>`).join('')}
      <button type="button" data-ps="curses" data-a="clear"${street ? '' : ' disabled'}><b>Clear the street</b><i>No curses about</i></button><button type="button" data-ps="curses" data-a="back"${street ? '' : ' disabled'}><b>Bring the curses back</b></button></div>
    <h4>Build</h4>
    <div class="psgrid">${tog('build', 'Build mode', street ? 'Click place · Right click take away · R turn' : 'Out on the street')}<button type="button" data-ps="clearb"><b>Clear what I built</b><i>${blocks.filter(b => b.mine).length} block${blocks.filter(b => b.mine).length === 1 ? '' : 's'}</i></button></div>
    <div class="psrow"><button type="button" data-ps="reset">Everything back to normal</button></div>`;
}
function paintBar() {
  bar.innerHTML = KINDS.map((K, i) => `<button type="button" data-blk="${i}" class="${O.blk === i ? 'on' : ''}" style="--c:${K[4]}"><kbd>${i + 1}</kbd><b>${K[0]}</b></button>`).join('') +
    `<span><button type="button" data-bk="place">Place</button><button type="button" data-bk="take">Take away</button><button type="button" data-bk="turn">Turn${O.rot ? ' ✓' : ''}</button></span>`;
}
const isOpen = () => panel.classList.contains('on');
function open() { if (!on() || !(mode() === 'street' || mode() === 'fight')) return; paint(); panel.classList.add('on'); sfx.hover(); E.keys.clear(); }
function close() { if (!isOpen()) return; panel.classList.remove('on'); sfx.back(); }
plus.addEventListener('click', () => (isOpen() ? close() : open()));
for (const n of [plus, panel, bar, flyb]) { n.addEventListener('pointerdown', e => e.stopPropagation()); n.addEventListener('keydown', e => { if (e.key !== 'Escape') e.stopPropagation(); }); }
panel.addEventListener('click', e => {
  const b = e.target.closest('button[data-ps]');
  if (!b || b.disabled) return;
  const a = b.dataset.ps, p = E.P1;
  if (a === 'close') { close(); return; }
  if (a === 'tog') {
    const k = b.dataset.k;
    if (k === 'build' && mode() !== 'street') { toast('Build mode is for the street'); return; }
    O[k] = !O[k]; sfx.hover();
    toast(`${b.querySelector('b').textContent.replace(' ✓', '')} ${O[k] ? 'on' : 'off'}`);
    if (k === 'build') paintBar();
  } else if (a === 'cyc') {
    const k = b.dataset.k, list = b.dataset.list.split(',').map(Number);
    O[k] = list[(list.indexOf(O[k]) + 1) % list.length]; sfx.hover(); toast(`${k === 'dmg' ? 'Damage' : 'Game speed'} ×${O[k]}`);
  } else if (a === 'hp') {
    const v = +(b.dataset.v || panel.querySelector('[data-in="hp"]').value);
    if (!(v >= 1)) { sfx.back(); return; }
    O.hp = clamp(Math.round(v), 1, 99999);
    if (mode() === 'fight' && live() && !p.dead) { p.max = p.hp = O.hp; }
    sfx.confirm(); toast(`Your health: ${O.hp}`);
  } else if (a === 'dhp') {
    const v = +panel.querySelector('[data-in="dhp"]').value;
    if (!(v >= 1)) { sfx.back(); return; }
    O.dhp = clamp(Math.round(v), 1, 99999); sfx.confirm(); toast(`Dummies' health: ${O.dhp}`);
    const o = E.P2;
    if (mode() === 'fight' && Fi.fight.cfg && SIZED.has(Fi.fight.cfg.ps) && !o.ko) o.max = o.hp = O.dhp;
  } else if (a === 'heal') { if (!p.dead) p.hp = p.max; sfx.confirm(); }
  else if (a === 'fight') { fightWith(b.dataset.id, b.dataset.kind); return; }
  else if (a === 'leave') { leaveFight(); return; }
  else if (a === 'go') { travel(b.dataset.id); return; }
  else if (a === 'curses') { if (b.dataset.a === 'clear') S.curses.splice(0); else S.respawn(); sfx.confirm(); toast(b.dataset.a === 'clear' ? 'The street is clear' : 'The curses are back'); }
  else if (a === 'clearb') { clearMine(); sfx.confirm(); toast('Your blocks are gone'); }
  else if (a === 'reset') { const hp = O.hp; Object.assign(O, OFF, { blk: O.blk }); if (hp && mode() === 'fight' && !p.dead) { p.max = p.hp = 100; } sfx.back(); toast('Everything is back to normal'); }
  paint();
});
bar.addEventListener('click', e => {
  const k = e.target.closest('[data-blk]'), a = e.target.closest('[data-bk]');
  if (k) { O.blk = +k.dataset.blk; sfx.hover(); paintBar(); }
  else if (a) { const v = a.dataset.bk; if (v === 'place') place(); else if (v === 'take') take(); else { O.rot = !O.rot; sfx.hover(); paintBar(); } }
});
for (const b of flyb.querySelectorAll('button')) {
  const set = v => { if (b.dataset.fly === 'up') flyUp = v; else flyDown = v; };
  b.addEventListener('pointerdown', () => set(true));
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, () => set(false));
}
addEventListener('keydown', e => {                  // P: the menu. Esc closes it (and does not leave the game while it is open). 5 and 6: blocks
  if (!JU.game || !JU.game.state.running || e.target instanceof HTMLInputElement) return;
  const k = e.key.toLowerCase();
  if (k === 'escape' && isOpen()) { e.preventDefault(); e.stopPropagation(); close(); return; }
  if (k === 'p' && on() && !e.repeat) { e.preventDefault(); isOpen() ? close() : open(); return; }
  if ((k === '5' || k === '6') && O.build && live() && mode() === 'street') { O.blk = +k - 1; paintBar(); sfx.hover(); }
}, true);

/* ================= every frame ================= */
function frame() {
  const ps = on(), street = mode() === 'street';
  E.root.classList.toggle('ps', ps);
  E.root.classList.toggle('psb', ps && O.build && street);
  E.root.classList.toggle('psf', ps && O.fly && !duel());
  if (ps && M.code !== joined) { joined = M.code; load(); }      // a private server he has opened before: what he built in it
  if (!ps) { if (joined) { joined = ''; blocks = []; } if (isOpen()) close(); }
}
// out on the street (walk.js calls it every frame): building, flying, and what the menu shows
function street(dt, real, p) {
  frame();
  follow(p, real);
  if (!live()) { ghost = null; return; }
  if (O.build) { aim(p); if (!bar.firstChild) paintBar(); } else ghost = null;
}
function fly(y, gy, dt) {                           // flying on the street: up and down, never under the ground
  const up = keys.has(' ') || flyUp, down = keys.has('control') || flyDown;
  return clamp(y + ((up ? 1 : 0) - (down ? 1 : 0)) * 460 * dt, gy, TOP);
}
// a key on the street, while building: click puts one down, right click takes one away, R turns it, 1 to 4 pick (5 and 6 above)
function key(a) {
  if (!live()) return false;
  if (O.fly && a === 'jump') return true;
  if (!O.build) return false;
  if (a === 'm1') { place(); return true; }
  if (a === 'alt') { take(); return true; }
  if (a === 'clan') { O.rot = !O.rot; paintBar(); sfx.hover(); return true; }
  const n = ['strikes', 'crush', 'div', 'manji'].indexOf(a);
  if (n >= 0) { O.blk = n; paintBar(); sfx.hover(); return true; }
  return false;
}

/* ================= in a fight ================= */
const tick0 = H.tick, pre0 = H.playerPre, grav0 = H.gravity, speed0 = H.speed, pow0 = H.power, hit0 = H.hit, shield0 = H.shield, fx0 = H.fx, start0 = H.fightStart, nostun0 = H.noStun;
H.speed = () => (speed0 ? speed0() : 1) * (live() ? O.speed : 1);
H.gravity = p => (grav0 ? grav0(p) : 1) * (p === E.P1 && live() ? (O.fly && !p.ps ? 0 : O.moon ? .35 : 1) : 1);
H.playerPre = (p, o, dt) => {
  if (live() && O.nostun && p.ps && !p.dead) { p.ps = null; p.stun = 0; }      // No stun: whatever else put him down (a guard broken), he is straight back up
  const r = pre0 ? pre0(p, o, dt) : false;
  if (!r && live() && O.fly && !p.dead) {           // flying: up while jump is held, down while S is, and otherwise he stays where he is
    const up = keys.has('w') || keys.has(' ') || keys.has('arrowup') || flyUp, down = keys.has('s') || keys.has('arrowdown') || keys.has('control') || flyDown;
    if (up) { p.ground = false; p.vy = 560; } else if (down) { if (!p.ground) p.vy = -560; } else if (!p.ground) p.vy = 0;
    if (p.y > FLY_TOP) { p.y = FLY_TOP; p.vy = Math.min(p.vy, 0); }
  }
  return r;
};
H.power = (h, o) => (pow0 ? pow0(h, o) : 1) * (live() && o === E.P2 ? O.dmg : 1);
// No stun: a hit on him still hurts, but stops nothing (foes.js asks before it staggers him, launches him or cuts his move short)
let shrugT = -9;                                   // (when it last said so over him: not every hit)
H.noStun = (p, a) => {
  if (nostun0 && nostun0(p, a)) return true;
  if (!live() || !O.nostun) return false;
  if (E.T - shrugT > 2) { shrugT = E.T; E.fx.push({ k: 2, x: p.x, y: p.y + 360, n: 'NO STUN', col: '#f4efe4', t: 0, life: .6 }); }
  return true;
};
H.hit = (o, face, h) => { hit0(o, face, h); if (o === E.P2 && o.psKind === 'immortal') o.hp = o.max; };      // the immortal one is whole again at once
// the blocking dummy's guard: anything ordinary from in front of it is stopped; something heavy (into the air, 16 or more, a block breaker) breaks it
H.shield = (o, face, h) => {
  if (shield0 && shield0(o, face, h)) return true;
  if (o !== E.P2 || o.psKind !== 'block' || o.ko || o.gb > 0 || o.face !== -face || o.state === 'air' || o.state === 'down' || o.state === 'up') return false;
  const x = o.x - face * 40, y = o.y + 200 * (o.scale || 1);
  if (h.lift || h.brk || h.dmg * (o.dr || 1) >= 16) {
    o.gb = 2; sfx.guardBreak(); E.stop(.08); cam.shake = Math.max(cam.shake, 14);
    V.ring(x, y, 230, '#ff5a6e', .3); V.sparks(x, y, 'red', 12); E.addSpark(x, y, '#ff5a6e', 130);
    E.fx.push({ k: 2, x: o.x, y: o.y + 360, n: 'GUARD BROKEN', col: '#ff5a6e', t: 0, life: 1 });
    return false;
  }
  o.vx = face * Math.min(300, (h.kb || 200) * .4); o.blockAt = E.T;
  sfx.block(); E.stop(.04); cam.shake = Math.max(cam.shake, 5);
  E.addSpark(x, y, '#dff3ff', 90); V.ring(x, y, 120, '#bfe6ff', .18); V.sparks(x, y, 'white', 5);
  E.fx.push({ k: 2, x: o.x, y: o.y + 330, n: 'BLOCK', col: '#bfe6ff', t: 0, life: .5 });
  return true;
};
H.tick = dt => {
  tick0(dt);
  frame();
  const p = E.P1, o = E.P2;
  if (o.psKind === 'block' && o.gb > 0) o.gb -= dt;
  if (o.psKind === 'evade' && !o.ko) {             // the evasive dummy: a moment after it is thrown or slammed, it is out of it
    o.knockT = o.state === 'air' || o.state === 'down' ? (o.knockT || 0) + dt : 0;
    if (o.knockT > .15 && E.T - (o.evPs || -9) > EV_DUMMY && JU.evasive) { o.evPs = E.T; o.evAt = undefined; JU.evasive.foe(o, 1); }
  }
  if (!live()) return;
  if (O.nocd) { for (const k in E.cd) E.cd[k] = 0; if (JU.evasive && JU.evasive.cd > 0) JU.evasive.cd = 0; if (JU.especial) JU.especial.cd = 0; }
  if (O.god && !p.dead) { p.hp = p.max; Fi.fight.floor = Math.max(Fi.fight.floor || 0, 1); }
  if (O.awk) JU.tech.charge(100);
};
H.fightStart = (cfg, wave) => {
  start0(cfg, wave);
  const o = E.P2;
  o.psKind = cfg && cfg.ps;
  if (cfg && cfg.ps && cfg.ps !== 'attack' && cfg.ps !== 'foe') o.ai = null;      // (a dummy that does not attack has nothing on its mind at all. A beaten curse from the menu ends the fight as any other does, foes.js; a dummy gets up again, training.js)
  if (cfg && SIZED.has(cfg.ps)) o.max = o.hp = O.dhp;
  if (live() && O.hp && !cfg.pvp) { E.P1.max = E.P1.hp = O.hp; }
};
H.fx = dt => {
  fx0(dt);
  const o = E.P2;
  if (o.psKind === 'block' && !o.ko && !(o.gb > 0) && o.state !== 'air' && o.state !== 'down') {      // its guard, while it has one: two arcs in front of it
    const f = o.face, c = E.F(o.x + f * 34, o.y + 208 * (o.scale || 1)), k = c[2], hot = Math.max(0, 1 - (E.T - (o.blockAt || -9)) / .22);
    g.save(); g.translate(c[0], c[1]); g.scale(f, 1); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    for (const [r, w, a] of [[84, 7, .26], [68, 3, .2]]) { g.strokeStyle = `rgba(190,225,255,${a + .55 * hot + .05 * Math.sin(E.T * 9)})`; g.lineWidth = w * k; g.beginPath(); g.arc(0, 0, r * k * (1 + .08 * hot), -1.05, 1.05); g.stroke(); }
    g.restore();
  }
};

/* ================= leaving ================= */
const exit0 = JU.exitGame;
JU.exitGame = () => { close(); Object.assign(O, OFF); flyUp = flyDown = false; ghost = null; rise = 0; exit0(); frame(); };

JU.ps = { street, fly, key, props, blocked, ground, lift, toast, open, close, KINDS, DUMMIES, O, get rise() { return rise; },
  get flying() { return live() && O.fly; }, get on() { return on(); }, get blocks() { return blocks.map(wire); }, get ghost() { return ghost && Object.assign({}, ghost); } };
})();
