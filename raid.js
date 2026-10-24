/* JUJUTSU UNLIMITEDS — Build 0.15: RAIDS, in a public server (mp.js). "Start a raid" in the list of who is on the server asks everybody else
   there; ten seconds to say yes, and whoever did goes in with you. Three waves of curses and then a boss: several of them at once, from
   both sides of the arena, and the more players the more of them there are and the harder they are (health x1.45 and damage x1.15 for
   each player past the first; the boss's health x1.55).
   How several games fight the same curses when none of them is a server: every curse is run by one of the games in it, its owner. It
   goes after that game's player, and the others see it as its owner's game says it is (a puppet, net: game.js leaves it alone). A blow
   that lands on somebody else's curse is counted here and sent to its owner, whose game takes it off. The boss is Mahoraga, run by each
   game in turn: it goes after one player at a time, and turns to the next every twelve seconds.
   Several curses at once, but only ever two of them winding up on the same player at a time. 1, 2, 3 and the rest go at the nearest one
   (or the nearest the way he is pressing): that is the one whose health is at the top.
   Down: out until the next wave, back with half your health. Everybody down: the raid has failed. Mahoraga down: a clear, and fifty
   tokens each (and what each curse pays, for whoever's game it was). Alone works too */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, H = E.hooks, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, S = JU.street, M = JU.mp, T = JU.tech;
const { rnd, clamp, ZP } = E, TAU = Math.PI * 2;
const ASK_T = 10, SEND_ES = 1 / 12, SEND_ME = 1 / 15, TURN = 12, PAY = 50, AT_ONCE = 2, BETWEEN = 2.6, LEAD = 1.8;      // (seconds) the ask; how often curses and players are sent; the boss's turn on each; what a clear pays; how many may wind up on him at once; between waves; before the first
const esc = x => String(x).replace(/[<>&"]/g, '');
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;
// the waves: [curse, how many alone, how many more for each player past the first]
const WAVES = [
  [['grunt', 3, 1]],
  [['grunt', 2, 1], ['brute', 2, 1]],
  [['brute', 2, 1], ['warped2', 1, 1], ['ruin', 1, 0]],
  [['boss', 1, 0]]
];
const NAMES = ['FIRST WAVE', 'SECOND WAVE', 'THIRD WAVE'];
const ST = ['idle', 'act', 'hurt', 'air', 'down', 'up'];

// the curses of this raid, made up for how many are in it
function defs(n) {
  const hp = 1 + .45 * (n - 1), dmg = 1 + .15 * (n - 1);
  for (const id of ['grunt', 'brute', 'warped2', 'ruin']) {
    const d = Fi.DEFS[id];
    if (d) Fi.DEFS['rd_' + id] = Object.assign({}, d, { hp: Math.round(d.hp * hp), human: false, atk: d.atk.map(a => Object.assign({}, a, { dmg: a.dmg * dmg })) });
  }
  const b = Fi.DEFS.sb_mahoraga || Fi.DEFS.mahoraga;
  Fi.DEFS.rd_boss = Object.assign({}, b, { name: 'Mahoraga', hp: Math.round(900 * (1 + .55 * (n - 1))), human: false, atk: b.atk.map(a => Object.assign({}, a, { dmg: a.dmg * (1 + .12 * (n - 1)) })) });
}
// what the fight starts with, before the first wave: nothing to see
Fi.DEFS.raid0 = { name: 'Raid', jp: '討伐', skin: E.CURSE, hp: 1, scale: 1, speed: 0, range: 0, gap: [9, 9], atk: [], human: true };

/* ================= the state of it ================= */
let R = null;          // the raid this game is in: { id, host, ids (who is in it, in order), me, phase ('gather' | 'fight' | 'over'), t (the ask's end), wave, list (its curses), byId, alive (ids of curses still standing), down (who is down), allies (pid -> { f, st, name }), sendEs, sendMe, turnT, next (when the next wave comes), out (effects to send), pend (eid -> damage of mine not yet counted by its owner) }
let inv = null;        // a raid somebody else is asking me into: { id, host, name, until, joined }
let clock = 0, lastHurt = -9;
const me = () => M.id;
const say = (pid, m) => M.to(pid, Object.assign({ t: 'raid', id: R ? R.id : m.id }, m));
const tell = m => { if (R) for (const pid of R.ids) if (pid !== R.me) say(pid, m); };
const host = () => !!R && R.host === R.me;
const here = pid => pid === me() || !!M.peer(pid);
const fighting = () => !!R && R.phase === 'fight';
const canRaid = () => M.on && M.kind === 'public' && E.root.dataset.mode === 'street' && S.st && S.st.free && !S.st.hold && !S.st.talk && !(JU.pvp && JU.pvp.busy) && !R && !inv;
function make(id, hostId, ids) {
  return { id, host: hostId, ids, me: me(), phase: 'gather', t: 0, wave: 0, list: [], byId: new Map(), alive: new Set(), down: new Set(), allies: new Map(),
    sendEs: 0, sendMe: 0, turnT: TURN, next: 0, out: [], pend: new Map() };
}

/* ================= on screen: a line at the top, the ask, and the raid's own line while it lasts ================= */
const toastEl = document.createElement('div'); toastEl.className = 'dtoast'; E.root.appendChild(toastEl);
const box = document.createElement('div'); box.className = 'duel'; E.root.appendChild(box);
const hud = document.createElement('div'); hud.className = 'raidhud'; E.root.appendChild(hud);
let toastT = 0;
function toast(text, col) { toastEl.textContent = text; toastEl.style.setProperty('--c', col || '#ff8a98'); toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 4200); }
const left = until => Math.max(0, Math.ceil((until - Date.now()) / 1000));
function paintBox() {
  if (R && R.phase === 'gather') {
    const names = R.ids.map(pid => pid === R.me ? 'you' : esc((M.peer(pid) || {}).name || 'Player'));
    box.className = 'duel on small';
    box.innerHTML = `<div class="dask"><b>Raid</b><p>Waiting for the server to answer. In: <u>${names.join(', ')}</u></p><div><button type="button" data-raid="go" class="go">Start now</button><button type="button" data-raid="cancel">Call it off</button></div><em data-left>${left(R.t)}</em></div>`;
    return;
  }
  if (inv) {
    box.className = 'duel on small';
    box.innerHTML = inv.joined
      ? `<div class="dask"><b>Raid</b><p>You are in <u>${esc(inv.name)}</u>'s raid. It starts when the time runs out.</p><div><button type="button" data-raid="no">Leave it</button></div><em data-left>${left(inv.until)}</em></div>`
      : `<div class="dask"><b>Raid</b><p><u>${esc(inv.name)}</u> is starting a raid: three waves of curses and a boss, together.</p><div><button type="button" data-raid="yes" class="go">Join <kbd>Y</kbd></button><button type="button" data-raid="no">No <kbd>N</kbd></button></div><em data-left>${left(inv.until)}</em></div>`;
    return;
  }
  box.className = 'duel'; box.innerHTML = '';
}
function tickBox() {                                // every quarter of a second while something is being asked
  clearInterval(clock);
  clock = setInterval(() => {
    const el = box.querySelector('[data-left]');
    if (R && R.phase === 'gather') { if (el) el.textContent = left(R.t); if (Date.now() >= R.t) go(); return; }
    if (inv) { if (el) el.textContent = left(inv.until); if (Date.now() > inv.until + 6000) { inv = null; paintBox(); } return; }      // (the host's go is a moment late, at most)
    clearInterval(clock);
  }, 250);
}
box.addEventListener('pointerdown', e => e.stopPropagation());
box.addEventListener('click', e => { const b = e.target.closest('[data-raid]'); if (b) click(b.dataset.raid); });
addEventListener('keydown', e => {
  if (!inv || inv.joined || e.target instanceof HTMLInputElement) return;
  const k = e.key.toLowerCase();
  if (k === 'y' || k === 'n') { e.preventDefault(); e.stopPropagation(); click(k === 'y' ? 'yes' : 'no'); }
}, true);
// the button in the server's list (mp.js paints it there)
const chip = () => (M.on && M.kind === 'public' && !R && !inv ? '<button type="button" class="mpraid" data-raid="start">⚔ Start a raid</button>' : '');
function click(a) {
  if (a === 'start') { if (canRaid()) start(); else if (!(S.st && S.st.free) || E.root.dataset.mode !== 'street') toast('Out on the street first.'); return; }
  if (a === 'go' && R && R.phase === 'gather' && host()) { go(); return; }
  if (a === 'cancel' && R && R.phase === 'gather') { M.all({ t: 'raid', a: 'cancel', id: R.id }); R = null; paintBox(); M.paint(); sfx.back(); return; }
  if (a === 'yes' && inv && !inv.joined) { if (!canJoin()) { M.to(inv.host, { t: 'raid', a: 'no', id: inv.id }); inv = null; paintBox(); return; } inv.joined = true; M.to(inv.host, { t: 'raid', a: 'join', id: inv.id }); sfx.confirm(); paintBox(); return; }
  if (a === 'no' && inv) { M.to(inv.host, { t: 'raid', a: 'no', id: inv.id }); inv = null; paintBox(); M.paint(); sfx.back(); }
}
const canJoin = () => M.on && E.root.dataset.mode === 'street' && S.st && S.st.free && !S.st.talk && !(JU.pvp && JU.pvp.busy) && !R;

/* ================= asking, and going in ================= */
function start() {
  R = make(Math.random().toString(36).slice(2, 10), me(), [me()]);
  R.t = Date.now() + ASK_T * 1000;
  M.all({ t: 'raid', a: 'ask', id: R.id });
  sfx.confirm(); toast('Raid: the server has ten seconds to join.', '#ffd23d'); paintBox(); tickBox(); M.paint();
}
function go() {                                     // the host: in, with whoever said yes
  if (!R || R.phase !== 'gather') return;
  clearInterval(clock);
  R.ids = R.ids.filter(here);
  for (const pid of R.ids) if (pid !== R.me) say(pid, { a: 'go', ids: R.ids });
  if (E.root.dataset.mode !== 'street') { M.all({ t: 'raid', a: 'cancel', id: R.id }); R = null; paintBox(); M.paint(); return; }
  begin(R.id, R.me, R.ids);
}
function begin(id, hostId, ids) {
  const kept = R && R.id === id ? R : null;
  R = make(id, hostId, ids.filter(here));
  if (kept) R.t = kept.t;
  R.phase = 'fight'; inv = null; paintBox(); M.paint();
  defs(R.ids.length);
  const n = R.ids.indexOf(R.me);
  S.fight({ stay: true, cfg: { foes: ['raid0'], stage: E.SHRINE, label: 'Raid', p1x: -360 + n * 150, win: null, raid: id, onLose: () => down() } });
  Fi.nm.p2.textContent = 'Raid'; Fi.nm.p2j.textContent = '討伐';
  if (host()) R.next = E.T + LEAD;
  E.banner('討伐', 'RAID');
  paintHud();
}

/* ================= the waves (the host says what comes, and whose each one is) ================= */
function nextWave() {
  const k = R.wave + 1, plan = WAVES[k - 1], n = R.ids.length, who = R.ids.filter(here), list = [];
  let i = 0;
  for (const [def, base, more] of plan) for (let j = 0; j < base + more * (n - 1); j++, i++) {
    const side = i % 2 ? 1 : -1;
    list.push([k + '.' + i, 'rd_' + def, def === 'boss' ? R.me : who[i % who.length], side * Math.round(rnd(820, 940)), r1(i * .5)]);
  }
  tell({ a: 'wave', k, list });
  wave(k, list);
}
function wave(k, list) {
  if (!fighting() || !Array.isArray(list)) return;
  R.wave = k; R.alive = new Set(list.map(e => String(e[0])));
  R.turnT = TURN;
  const p = E.P1;
  if (R.down.has(R.me) || p.dead) {                 // whoever was down is back
    R.down.delete(R.me); p.dead = false; p.ps = null; p.stun = 0; p.hp = Math.max(1, Math.round(p.max * .5)); p.inv = 1.5; p.vx = 0;
    tell({ a: 'up' }); toast('Back in, with half your health.', '#7fe9ff');
  }
  R.down.clear();
  const boss = list.some(e => e[1] === 'rd_boss');
  if (boss) E.banner('魔虚羅', 'MAHORAGA'); else E.banner('第' + '一二三'[k - 1] + '波', NAMES[k - 1] || 'WAVE ' + k, 'sm');
  for (const e of list) E.after(+e[4] || 0, () => spawn(e));
  paintHud();
}
function spawn(e) {
  if (!fighting()) return;
  const [eid, def, owner, x] = e;
  if (!Fi.DEFS[def] || R.byId.has(eid) || !R.alive.has(String(eid))) return;      // (already down before it got here: its owner's game was quicker)
  const o = Fi.make(def, clamp(+x || 0, -960, 960));
  Object.assign(o, { eid: String(eid), def, owner: R.ids.includes(String(owner)) ? String(owner) : R.host, alpha: 0,      // (its owner gone from the raid since: the host's)
    human: false, face: x > 0 ? -1 : 1, nm: Fi.DEFS[def].name, jp: Fi.DEFS[def].jp });
  if (o.owner !== R.me) { o.net = true; o.ai = null; o.nt = null; }
  R.list.push(o); R.byId.set(o.eid, o);
  V.ring(o.x, 150, 220, '#b79bff', .4); V.sparks(o.x, 160, 'purple', 8);
}
// one of mine is down for good: everybody is told, and its owner (me) is paid for it as for any curse
function killed(o) {
  R.alive.delete(o.eid);
  tell({ a: 'ko', e: o.eid });
  if (JU.shop && JU.shop.earn) JU.shop.earn(o.def === 'rd_boss' ? 15 : 5, o);
  paintHud();
}
function down() {                                   // the fight's onLose: out until the next wave
  if (!fighting()) return;
  R.down.add(R.me); tell({ a: 'down' });
  toast(R.ids.length > 1 ? 'Down. You are back in at the next wave, if they hold out.' : 'Down.', '#ff8a98');
  if (host()) check();
}
function check() {                                  // the host: is everybody down?
  if (!fighting() || !host()) return;
  const live = R.ids.filter(here);
  if (live.length && live.every(pid => R.down.has(pid))) end(false);
}
function end(won) {
  if (!R) return;
  if (host()) tell({ a: 'end', won: !!won });
  finish(won);
}
function finish(won) {
  if (!fighting()) return;
  R.phase = 'over';
  const cfg = Fi.fight.cfg, id = R.id;
  E.slow(.8); E.banner(won ? '討伐' : '敗北', won ? 'RAID CLEAR' : 'RAID FAILED');
  if (won) { sfx.confirm(); if (JU.shop && JU.shop.earn) JU.shop.earn(PAY, E.P1); if (JU.yen) JU.yen.earn(PAY * 100); }      // (and yen, as every raid pays: yen.js)
  paintHud();
  Fi.later(3600, () => {
    if (!R || R.id !== id) return;
    R = null; paintHud(); M.paint();
    toast(won ? `Raid cleared. +${PAY} tokens.` : 'The raid failed.', won ? '#ffd23d' : '#ff8a98');
    if (Fi.fight.cfg === cfg) { if (won && cfg.onWin) cfg.onWin(); else if (cfg.onFlee) cfg.onFlee(); }
  });
}
// somebody is gone (left the raid, the game, or the server): their curses are the host's now, and if they were the host the next one is
function lose(pid) {
  if (!R) return;
  const i = R.ids.indexOf(pid);
  if (i < 0) return;
  R.ids.splice(i, 1); R.down.delete(pid);
  const al = R.allies.get(pid); R.allies.delete(pid);
  if (R.phase === 'gather') { paintBox(); return; }
  if (al) toast(`${al.name} left the raid.`, '#ff8a98');
  if (R.host === pid) R.host = R.ids.find(here) || R.me;
  for (const o of R.list) if (o.owner === pid && !o.ko) adopt(o, R.host);
  if (host()) check();
  paintHud();
}
function adopt(o, pid) {                            // a curse changes hands: run here now, or watched here now
  o.owner = pid;
  if (pid === R.me) { if (o.net) { o.net = false; o.ai = { d: Fi.DEFS[o.def], t: .8 }; o.state = o.y > 1 ? 'air' : 'idle'; o.ground = o.y <= 1; o.vx = o.vy = 0; o.alpha = 1; } }
  else { o.net = true; o.ai = null; o.nt = null; }
}

/* ================= what is said between the games ================= */
M.hear('raid', (p, m) => {
  if (!m || typeof m.a !== 'string') return;
  if (m.a === 'ask') {
    if (!canJoin() || inv) { M.to(p.id, { t: 'raid', a: 'no', id: m.id }); return; }
    inv = { id: m.id, host: p.id, name: p.name, until: Date.now() + ASK_T * 1000, joined: false };
    sfx.charge(); paintBox(); tickBox(); M.paint();
    return;
  }
  if (inv && m.id === inv.id && p.id === inv.host) {
    if (m.a === 'cancel') { inv = null; paintBox(); M.paint(); toast('The raid was called off.'); }
    else if (m.a === 'go') {
      if (inv.joined && Array.isArray(m.ids) && m.ids.includes(me()) && canJoin()) begin(m.id, p.id, m.ids.map(String));
      else { if (inv.joined) say(p.id, { a: 'left', id: m.id }); inv = null; paintBox(); M.paint(); }
    }
    return;
  }
  if (!R || m.id !== R.id || !R.ids.concat(R.phase === 'gather' ? [p.id] : []).includes(p.id)) return;
  const a = m.a;
  if (R.phase === 'gather') {                       // (the host's end of the ask)
    if (a === 'join' && !R.ids.includes(p.id) && R.ids.length < M.MAX) { R.ids.push(p.id); paintBox(); sfx.hover(); }
    else if (a === 'no' || a === 'left') lose(p.id);
    return;
  }
  if (a === 'wave' && p.id === R.host) wave(m.k | 0, m.list);
  else if (a === 'es') states(p.id, m.l);
  else if (a === 'me') ally(p, m);
  else if (a === 'rh') { const o = R.byId.get(String(m.e)); if (o && o.owner === R.me) remoteHit(o, m); }
  else if (a === 'ko') { const o = R.byId.get(String(m.e)); R.alive.delete(String(m.e)); if (o && !o.ko) fall(o); paintHud(); }
  else if (a === 'own') { const o = R.byId.get(String(m.e)); if (o && typeof m.to === 'string') take(o, m); }
  else if (a === 'down') { R.down.add(p.id); if (host()) check(); paintHud(); }
  else if (a === 'up') { R.down.delete(p.id); paintHud(); }
  else if (a === 'end' && p.id === R.host) finish(!!m.won);
  else if (a === 'left') lose(p.id);
});
M.hear('gone', p => { if (inv && inv.host === p.id) { inv = null; paintBox(); } lose(p.id); });

// the curses somebody else runs, as their game says they are: [eid, x, y, face, state, hp, max, alpha, the pose (7)]
function states(pid, l) {
  if (!Array.isArray(l)) return;
  for (const s of l.slice(0, 24)) {
    if (!Array.isArray(s) || s.length < 15) continue;
    const o = R.byId.get(String(s[0]));
    if (!o || !o.net || o.owner !== pid) continue;
    o.nt = { x: +s[1] || 0, y: +s[2] || 0, f: s[3] < 0 ? -1 : 1, st: ST[s[4] | 0] || 'idle', hp: Math.max(0, +s[5] || 0), max: Math.max(1, +s[6] || 1), a: clamp(+s[7] || 0, 0, 1), p: s.slice(8, 15).map(v => +v || 0) };
  }
}
H.netFoe = (o, dt) => {                             // (game.js: one somebody else's game runs) where it is, moving there rather than jumping
  if (o.ph) return;                                 // (the placeholder the fight starts with)
  const n = o.nt;
  if (!n) { o.alpha = Math.min(1, (o.alpha || 0) + dt * 2); return; }
  const k = 1 - Math.exp(-dt * 16);
  if (Math.abs(n.x - o.x) > 420) o.x = n.x; else o.x += (n.x - o.x) * k;
  o.y += (n.y - o.y) * k; o.face = n.f; o.state = n.st; o.alpha = n.a; o.max = n.max;
  const owed = R && R.pend.get(o.eid);
  o.hp = Math.max(0, n.hp - (owed ? owed.d : 0));
  for (let i = 0; i < 7; i++) o.pose[i] += (n.p[i] - o.pose[i]) * k;
  o.target = o.pose; o.ground = o.y <= 1; o.vx = o.vy = 0; o.stun = 1; o.inv = 0; o.ko = false;
};
// a blow of somebody else's, on a curse of mine: counted here (without the stop and the shake: those are on their screen)
function remoteHit(o, m) {
  if (o.ko || o.net) return;
  const d = clamp(+m.d || 0, 0, 5000), face = m.f < 0 ? -1 : 1, hs = o.scale || 1, dead = o.hp - d <= 0, kb = clamp(+m.kb || 0, 0, 1600), lift = clamp(+m.lift || 0, 0, 1500);
  o.hp = Math.max(0, o.hp - d); o.lastHit = 0; o.flash = .09; o.tele = 0;
  if (o.ai && !o.poise) o.ai.t = Math.max(o.ai.t, .55);
  if (o.poise && !dead) o.vx += face * kb * .12;
  else {
    o.face = -face; o.vx = face * kb;
    if (lift || !o.ground || dead) { o.vy = Math.max(lift, o.ground ? 520 : 320); o.ground = false; o.bounced = false; o.y = Math.max(o.y, 1); o.state = 'air'; }
    else { o.state = 'hurt'; o.stun = clamp(+m.stun || .4, .1, 1.2); }
  }
  E.addNum(o.x, o.y + 270 * hs, r1(d), '#bfe6ff'); E.addSpark(o.x - face * 26, o.y + 150 * hs, '#bfe6ff', 70);
  if (dead && !o.ko) { o.ko = true; killed(o); }
}
// one somebody else ran is down: it falls, and goes up in smoke as any curse does
function fall(o) { o.ko = true; o.net = false; o.ai = null; o.hp = 0; o.state = o.y > 1 ? 'air' : 'down'; o.ground = o.y <= 1; o.stun = 1.7; o.vx = o.vy = 0; if (o.ground) o.alpha = Math.min(o.alpha, 1); }
// the boss changes hands
function take(o, m) {
  const s = m.s || {};
  o.owner = m.to;
  if (m.to !== R.me) { o.net = true; o.ai = null; o.nt = null; return; }
  o.net = false; o.alpha = 1; o.ko = false;
  Object.assign(o, { x: clamp(+s.x || o.x, -960, 960), y: Math.max(0, +s.y || 0), face: s.f < 0 ? -1 : 1, hp: clamp(+s.hp || o.hp, 1, 99999), max: Math.max(1, +s.max || o.max), dr: clamp(+s.dr || o.dr || 1, .3, 1), vx: 0, vy: 0 });
  o.ground = o.y <= 1; o.state = o.ground ? 'idle' : 'air';
  o.ai = { d: Fi.DEFS[o.def], t: clamp(+s.t || 1, .2, 3), kt: clamp(+s.kt || 1, 0, 6), kcd: Array.isArray(s.kcd) ? s.kcd.map(v => clamp(+v || 0, 0, 30)) : undefined };
  R.turnT = TURN;
  toast(`${o.nm} is coming for you.`, '#ffd23d'); E.fx.push({ k: 2, x: o.x, y: o.y + 520, n: 'IT TURNS TO YOU', col: '#e2c060', t: 0, life: 1.4 });
}
// the boss, done with the one it was after: to the next who is up
function turn(o) {
  const live = R.ids.filter(pid => here(pid) && !R.down.has(pid));
  if (live.length < 2) { R.turnT = TURN; return; }
  const to = live[(live.indexOf(R.me) + 1) % live.length];
  if (to === R.me) { R.turnT = TURN; return; }
  const ai = o.ai || {};
  tell({ a: 'own', e: o.eid, to, s: { x: r1(o.x), y: r1(o.y), f: o.face, hp: r1(o.hp), max: o.max, dr: r2(o.dr || 1), t: r2(ai.t || 1), kt: r2(ai.kt || 1), kcd: (ai.kcd || []).map(r2) } });
  adopt(o, to);
}

/* ================= the others in it, as their games say they are ================= */
function ally(p, m) {
  if (typeof m.x !== 'number' || !Array.isArray(m.p)) return;
  let a = R.allies.get(p.id);
  const t = T.TECH[m.tk], skin = (t && t.skin) || E.YUJI;
  if (!a) { a = { f: E.fighter(skin, m.x, m.f < 0 ? -1 : 1), st: null, name: p.name }; a.f.z = ZP; a.f.ally = 1; R.allies.set(p.id, a); }
  a.f.skin = skin; a.f.scale = clamp(+m.sc || 1, .5, 2); a.st = m; a.name = p.name;
  if (Array.isArray(m.fx)) echo(m.fx);
}
function allies(dt) {
  for (const a of R.allies.values()) {
    const s = a.st, f = a.f;
    if (!s) continue;
    const k = 1 - Math.exp(-dt * 20);
    if (Math.abs(s.x - f.x) > 420) f.x = s.x; else f.x += (s.x - f.x) * k;
    f.y += ((+s.y || 0) - f.y) * k; f.face = s.f < 0 ? -1 : 1; f.spin = typeof s.sp === 'number' ? s.sp : 1;
    for (let i = 0; i < 7; i++) f.pose[i] += ((+s.p[i] || 0) - f.pose[i]) * k;
    f.target = f.pose; f.ground0 = 0; f.alpha = s.dead ? .55 : 1;
  }
}
// what my blows throw up, sent with me; and theirs, drawn here
const RAW = {};
let mute = false;
for (const k of Object.keys(V)) {
  if (k === 'clear' || typeof V[k] !== 'function') continue;
  const f = RAW[k] = V[k];
  V[k] = function (...a) {
    if (R && R.phase === 'fight' && !mute && R.out.length < 30 && a.every(x => x === undefined || typeof x === 'number' || typeof x === 'string' || typeof x === 'boolean')) R.out.push([k, ...a.map(x => (typeof x === 'number' ? r2(x) : x === undefined ? null : x))]);
    return f.apply(this, a);
  };
}
function echo(list) {
  mute = true;
  for (const it of list.slice(0, 30)) if (Array.isArray(it) && RAW[it[0]]) { try { RAW[it[0]](...it.slice(1).map(x => (x === null ? undefined : x))); } catch (err) {} }
  mute = false;
}

/* ================= the fight ================= */
// which of them he is fighting: the nearest, or the nearest the way he is pressing. Not while a move is under way
function focus() {
  const p = E.P1, cur = E.P2, keep = R.list.includes(cur) && !cur.ko && cur.alpha > .3;
  if (keep && (p.move || p.chainT > 0 || p.ps)) return;
  const dir = (E.keys.has('d') || E.keys.has('arrowright') ? 1 : 0) - (E.keys.has('a') || E.keys.has('arrowleft') ? 1 : 0);
  let best = null, bd = 1e9;
  for (const o of R.list) {
    if (o.ko || o.alpha < .4) continue;
    const dx = o.x - p.x;
    let d = Math.abs(dx) + Math.abs(o.y - p.y) * .5;
    if (dir && Math.sign(dx) !== dir) d += 2000;
    if (o === cur) d -= 120;
    if (d < bd) { bd = d; best = o; }
  }
  if (best && best !== cur) { E.setFoe(best); Fi.nm.p2.textContent = best.nm || 'Curse'; Fi.nm.p2j.textContent = best.jp || '呪霊'; }
}
// what this game runs, sent: its curses, and me
function send(dt) {
  if ((R.sendEs -= dt) <= 0) {
    R.sendEs = SEND_ES;
    const l = [];
    for (const o of R.list) if (o.owner === R.me && !o.net && (!o.ko || o.alpha > 0)) l.push([o.eid, r1(o.x), r1(o.y), o.face, Math.max(0, ST.indexOf(o.state)), r1(o.hp), o.max, r2(o.alpha === undefined ? 1 : o.alpha), ...o.pose.map(r2)]);
    if (l.length) tell({ a: 'es', l });
  }
  if ((R.sendMe -= dt) <= 0) {
    R.sendMe = SEND_ME;
    const p = E.P1, m = { a: 'me', x: r1(p.x), y: r1(p.y), f: p.face, sp: r2(p.spin), sc: p.scale || 1, p: p.pose.map(r2), tk: T.active ? T.active.id : '', hp: r1(Math.max(0, p.hp)), max: p.max, dead: p.dead ? 1 : 0 };
    if (R.out.length) { m.fx = R.out.slice(0, 20); R.out = []; if (JSON.stringify(m).length > 3800) delete m.fx; }
    tell(m);
  }
}
const tick0 = H.tick, fx0 = H.fx, cast0 = H.cast, idle0 = H.foeIdle, ko0 = H.ko, hit0 = H.hit, shield0 = H.shield, start0 = H.fightStart, reset0 = H.reset;
H.foes = () => (fighting() ? R.list : null);
H.cast = () => {
  const a = cast0 ? cast0() : null;
  if (!R || R.phase === 'gather') return a;
  const mine = R.list.filter(o => o !== E.P2 && !(o.alpha < .01));
  for (const al of R.allies.values()) if (al.st) mine.push(al.f);
  return a ? a.concat(mine) : mine.length ? mine : null;
};
// never more than two of mine winding up on him at once, and none in the moment after one has landed
H.foeIdle = (o, p, dt) => {
  if (fighting() && o.ai && !o.net && o.ai.t <= dt) {
    let busy = 0;
    for (const x of R.list) if (x !== o && !x.net && x.state === 'act') busy++;
    if (busy >= AT_ONCE || E.T - lastHurt < .45) o.ai.t = Math.max(o.ai.t, rnd(.25, .55));
  }
  idle0(o, p, dt);
};
const struck0 = H.struck;
H.struck = (p, face, a, dmg) => { if (struck0) struck0(p, face, a, dmg); lastHurt = E.T; };
// a blow of mine on a curse somebody else runs: theirs to count. Mine to see now, until they have
H.shield = (o, face, h) => { if (o.net) o.hp0 = o.hp; return shield0 ? shield0(o, face, h) : false; };
H.hit = (o, face, h) => {
  hit0(o, face, h);
  if (!fighting() || !o.net) return;
  const d = Math.max(0, (o.hp0 === undefined ? o.hp : o.hp0) - o.hp);
  const pd = R.pend.get(o.eid) || { d: 0, t: 0 }; pd.d += d; pd.t = .7; R.pend.set(o.eid, pd);
  say(o.owner, { a: 'rh', e: o.eid, d: r1(d), f: face, kb: Math.round(h.kb || 0), lift: Math.round(h.lift || 0), stun: r2(h.stun || .4) });
};
H.ko = o => {
  if (!Fi.fight.cfg || !Fi.fight.cfg.raid) return ko0 ? ko0(o) : false;
  if (o.net) { o.ko = false; return true; }        // somebody else's: down when their game says
  if (R && R.list.includes(o)) killed(o);
  return true;
};
H.tick = dt => {
  tick0(dt);
  if (!fighting()) return;
  const p = E.P1;
  focus(); send(dt); allies(dt);
  for (const [eid, pd] of R.pend) if ((pd.t -= dt) <= 0) R.pend.delete(eid);
  for (const o of R.list) {                         // mine coming in out of the dark; and not all standing in the same spot
    if (o.net) continue;
    if (o.alpha < 1 && !o.ko) { o.alpha = Math.min(1, o.alpha + dt * 2.2); if (Math.random() < dt * 30) V.puff('purple', o.x + rnd(-60, 60), rnd(0, 260), 0, 120, 40, .5); }
    if (o.ko || !o.ground) continue;
    for (const q of R.list) if (q !== o && !q.ko && Math.abs(q.x - o.x) < 70 && q.ground) o.x = clamp(o.x + Math.sign(o.x - q.x || 1) * 90 * dt, -960, 960);
  }
  for (let i = R.list.length - 1; i >= 0; i--) { const o = R.list[i]; if (o.ko && (o.alpha || 0) <= .01 && o !== E.P2) { R.list.splice(i, 1); R.byId.delete(o.eid); } }
  const b = R.list.find(o => o.def === 'rd_boss' && o.owner === R.me && !o.net && !o.ko);      // the boss, if it is mine just now: after its turn on me, the next
  if (b && (R.turnT -= dt) <= 0 && b.state === 'idle' && !b.act) turn(b);
  if (host() && R.wave && !R.alive.size && !R.next) R.next = E.T + BETWEEN;      // the host: the wave is cleared
  if (host() && R.next && E.T >= R.next) { R.next = 0; if (R.wave >= WAVES.length) end(true); else nextWave(); }
  if (p.dead && !R.down.has(R.me)) down();
  paintHud(true);
};
H.fx = dt => {
  fx0(dt);
  if (!fighting() && !(R && R.phase === 'over')) return;
  for (const o of R.list) {                         // the others' health, small, over them; and the ring of one about to strike
    if (o === E.P2 || o.ko || o.alpha < .5) continue;
    const hs = o.scale || 1, c = F(o.x, o.y + 300 * hs), k = c[2], w = 70 * k, u = clamp(o.hp / o.max, 0, 1);
    g.fillStyle = 'rgba(8,6,14,.75)'; g.fillRect(c[0] - w / 2, c[1], w, 6 * k);
    g.fillStyle = o.owner === R.me ? '#ff2440' : '#c977ff'; g.fillRect(c[0] - w / 2, c[1], w * u, 6 * k);
    if (o.state === 'act' && o.tele > 0) { const r = F(o.x, o.y + 150 * hs); g.strokeStyle = `rgba(255,36,64,${.35 + .6 * o.tele})`; g.lineWidth = 4; g.beginPath(); g.arc(r[0], r[1], (150 - 104 * o.tele) * hs * r[2], 0, TAU); g.stroke(); }
  }
  g.save(); g.textAlign = 'center'; g.textBaseline = 'bottom'; g.lineJoin = 'round';
  for (const a of R.allies.values()) {              // the others' names over their heads
    if (!a.st) continue;
    const c = F(a.f.x, a.f.y + 300 * (a.f.scale || 1)), k = c[2];
    g.font = `${Math.round(20 * k)}px Anton, Impact, sans-serif`; g.lineWidth = 5 * k; g.strokeStyle = '#07060c'; g.strokeText(a.name, c[0], c[1]);
    g.fillStyle = a.st.dead ? '#8a8592' : '#7fe9ff'; g.fillText(a.name, c[0], c[1]);
    const w = 64 * k, u = clamp((+a.st.hp || 0) / (+a.st.max || 100), 0, 1);
    g.fillStyle = 'rgba(8,6,14,.75)'; g.fillRect(c[0] - w / 2, c[1] + 3 * k, w, 5 * k); g.fillStyle = '#7fe9ff'; g.fillRect(c[0] - w / 2, c[1] + 3 * k, w * u, 5 * k);
  }
  g.restore();
};
// the raid's own line at the top: the wave, how many are left, who is in it
let hudKey = '';
function paintHud(quick) {
  if (!R || R.phase === 'gather') { if (hudKey) { hudKey = ''; hud.classList.remove('on'); hud.innerHTML = ''; } return; }
  const alive = R.alive.size, boss = R.wave === WAVES.length;
  const who = R.ids.map(pid => (pid === R.me ? 'You' : (R.allies.get(pid) || {}).name || (M.peer(pid) || {}).name || 'Player') + (R.down.has(pid) ? ' (down)' : ''));
  const key = [R.phase, R.wave, alive, who.join(',')].join('|');
  if (quick && key === hudKey) return;
  hudKey = key; hud.classList.add('on');
  hud.innerHTML = `<b>Raid</b><span>${R.phase === 'over' ? 'Over' : R.wave ? (boss ? 'The boss' : `Wave ${R.wave} of ${WAVES.length - 1}`) + (alive ? ` · ${alive} left` : ' · cleared') : 'Getting ready'}</span><i>${who.map(esc).join(' · ')}</i>`;
}
H.fightStart = (cfg, wave) => {
  start0(cfg, wave);
  if (!cfg || !cfg.raid || !R || cfg.raid !== R.id) return;
  const o = E.P2;                                   // the placeholder: nothing, and nowhere
  Object.assign(o, { alpha: 0, net: true, ph: true, ko: true, state: 'down', ai: null, x: 0, hp: 1, max: 1 });      // (ko: nothing fades it in)
};
H.reset = () => { reset0(); if (R && R.phase !== 'gather') { R = null; paintHud(); } };
const exit0 = JU.exitGame;
JU.exitGame = () => {
  if (R) { if (R.phase === 'gather') M.all({ t: 'raid', a: 'cancel', id: R.id }); else tell({ a: 'left' }); }
  if (inv) M.to(inv.host, { t: 'raid', a: 'no', id: inv.id });
  R = null; inv = null; paintBox(); paintHud(); clearInterval(clock);
  exit0();
};

JU.raid = { chip, click, start, WAVES, allies: () => (R && R.phase !== 'gather' ? [...R.allies.values()].filter(a => a.st).map(a => a.f) : []),      // (the others' fighters, for what their techniques carry: ratio.js, reaper.js)
 get state() { return R && { id: R.id, host: R.host, ids: R.ids.slice(), phase: R.phase, wave: R.wave, alive: [...R.alive], list: R.list.map(o => ({ eid: o.eid, def: o.def, owner: o.owner, net: !!o.net, hp: r1(o.hp), ko: !!o.ko, x: Math.round(o.x) })), down: [...R.down], allies: [...R.allies.keys()] }; },
  get invite() { return inv && { id: inv.id, host: inv.host, joined: inv.joined }; } };
})();
