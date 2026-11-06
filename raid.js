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
   tokens each (and what each curse pays, for whoever's game it was). Alone works too.
   Build 0.31, ON THE STREET (the user's: "during raids instead of waves add so youre walking in a city but youre stiull inside the arena so
   youre ready to fight them at any moment"): no more waves. The raid is a walk down a district's street (rwalk.js: where the host is
   standing, and in that district), still in the arena the whole way: the waves are groups waiting along it, met where they wait, and the
   boss is at the far end. The host's game moves the arena on (whoever is furthest on carries it) and says where it is with its every 'me';
   everybody else's follows it, and everything sent between the games says where its arena was, so a curse is where it is in every game.
   Down is out until the street is quiet again (back with half your health), or until somebody heals you (rwalk.js: Limitless, Awakened
   Limitless, the Mechamaster, Love Reaper and its kin can heal a partner; 'heal' here). And every district raid (shibuya.js) is one of
   these now, alone: R.solo, its groups made from its fights, its rewards its own */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, H = E.hooks, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, S = JU.street, M = JU.mp, T = JU.tech;
const { rnd, clamp, ZP } = E, TAU = Math.PI * 2;
const ASK_T = 10, SEND_ES = 1 / 12, SEND_ME = 1 / 15, TURN = 12, PAY = 50, AT_ONCE = 2;      // (seconds) the ask; how often curses and players are sent; the boss's turn on each; what a clear pays; how many may wind up on him at once
const esc = x => String(x).replace(/[<>&"]/g, '');
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;
// the waves: [curse, how many alone, how many more for each player past the first]
const WAVES = [
  [['grunt', 3, 1]],
  [['grunt', 2, 1], ['brute', 2, 1]],
  [['brute', 2, 1], ['warped2', 1, 1], ['ruin', 1, 0]],
  [['boss', 1, 0]]
];
const ST = ['idle', 'act', 'hurt', 'air', 'down', 'up'];
const SCROLL = -250, AHEAD = 760, QUIET = 1.4;     // (Build 0.31) where the one furthest on carries the arena on from (behind its middle: whatever is met, is met in the middle of it); how far ahead of its middle a group is met; how long the street has to be quiet before whoever is down gets up
const W_ = () => JU.rwalk;                         // the street (rwalk.js, loaded after this)
const ox = () => (JU.rwalk ? JU.rwalk.ox : 0);
const off = o => (typeof o === 'number' ? o : ox()) - ox();      // how far another game's arena was from mine, when it said where something was

// the curses of this raid, made up for how many are in it. kind (Build 0.22v1): 'maho', or 'granite' (two players or more, and the Granite
// Cannon at the end of it, who may drop a Secret CT: dced.js)
const GRANITE = 'granite', NEED2 = 2;
const granite = () => !!R && R.kind === GRANITE;
function defs(n, kind) {
  const hp = 1 + .45 * (n - 1), dmg = 1 + .15 * (n - 1);
  for (const id of ['grunt', 'brute', 'warped2', 'ruin']) {
    const d = Fi.DEFS[id];
    if (d) Fi.DEFS['rd_' + id] = Object.assign({}, d, { hp: Math.round(d.hp * hp), human: false, atk: d.atk.map(a => Object.assign({}, a, { dmg: a.dmg * dmg })) });
  }
  const gr = kind === GRANITE && Fi.DEFS.gr_ryu, b = gr || Fi.DEFS.sb_mahoraga || Fi.DEFS.mahoraga;
  Fi.DEFS.rd_boss = Object.assign({}, b, { name: gr ? 'Granite Cannon' : 'Mahoraga', hp: Math.round((gr ? 1100 : 900) * (1 + .55 * (n - 1))), human: false, atk: b.atk.map(a => Object.assign({}, a, { dmg: a.dmg * (1 + .12 * (n - 1)) })) });
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
const here = pid => pid === me() || (!!R && pid === R.me) || !!M.peer(pid);
const fighting = () => !!R && R.phase === 'fight';
const canRaid = () => M.on && M.kind === 'public' && E.root.dataset.mode === 'street' && S.st && S.st.free && !S.st.hold && !S.st.talk && !(JU.pvp && JU.pvp.busy) && !R && !inv;
function make(id, hostId, ids, kind) {
  return { id, host: hostId, ids, me: me(), kind: kind === GRANITE ? GRANITE : 'maho', phase: 'gather', t: 0, wave: 0, list: [], byId: new Map(), alive: new Set(), down: new Set(), allies: new Map(),
    sendEs: 0, sendMe: 0, turnT: TURN, next: 0, out: [], pend: new Map(),
    plan: null, route: WAVES, solo: null, quiet: 0, ph: null };      // (Build 0.31: the street, rwalk.js; the groups along it, the last of them the boss; a district raid's own; how long the street has been quiet; the placeholder)
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
    const gr = granite(), few = gr && R.ids.length < NEED2;
    box.className = 'duel on small';
    box.innerHTML = `<div class="dask"><b>${gr ? 'Granite raid' : 'Raid'}</b><p>${few ? 'A Granite raid takes two players or more. Waiting for somebody to join.' : 'Waiting for the server to answer.'} In: <u>${names.join(', ')}</u></p><div><button type="button" data-raid="go" class="go"${few ? ' disabled' : ''}>Start now</button><button type="button" data-raid="cancel">Call it off</button></div><em data-left>${left(R.t)}</em></div>`;
    return;
  }
  if (inv) {
    const gr = inv.kind === GRANITE, what = gr ? 'Granite raid' : 'raid';
    box.className = 'duel on small';
    box.innerHTML = inv.joined
      ? `<div class="dask"><b>${gr ? 'Granite raid' : 'Raid'}</b><p>You are in <u>${esc(inv.name)}</u>'s ${what}. It starts when the time runs out.</p><div><button type="button" data-raid="no">Leave it</button></div><em data-left>${left(inv.until)}</em></div>`
      : `<div class="dask"><b>${gr ? 'Granite raid' : 'Raid'}</b><p><u>${esc(inv.name)}</u> is starting a ${what}: ${gr ? 'a street full of curses, and the Granite Cannon at the end of it. It takes two' : 'a street full of curses and a boss at the end of it, together'}.</p><div><button type="button" data-raid="yes" class="go">Join <kbd>Y</kbd></button><button type="button" data-raid="no">No <kbd>N</kbd></button></div><em data-left>${left(inv.until)}</em></div>`;
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
const chip = () => (M.on && M.kind === 'public' && !R && !inv ? '<button type="button" class="mpraid" data-raid="start">⚔ Start a raid</button><button type="button" class="mpraid gran" data-raid="granite" title="Two players or more. The Granite Cannon may drop a Secret CT">⚔ Granite raid · 2+</button>' : '');
function click(a) {
  if (a === 'start' || a === 'granite') { if (canRaid()) start(a === 'granite' ? GRANITE : 'maho'); else if (!(S.st && S.st.free) || E.root.dataset.mode !== 'street') toast('Out on the street first.'); return; }
  if (a === 'go' && R && R.phase === 'gather' && host()) { go(); return; }
  if (a === 'cancel' && R && R.phase === 'gather') { M.all({ t: 'raid', a: 'cancel', id: R.id }); R = null; paintBox(); M.paint(); sfx.back(); return; }
  if (a === 'yes' && inv && !inv.joined) { if (!canJoin()) { M.to(inv.host, { t: 'raid', a: 'no', id: inv.id }); inv = null; paintBox(); return; } inv.joined = true; M.to(inv.host, { t: 'raid', a: 'join', id: inv.id }); sfx.confirm(); paintBox(); return; }
  if (a === 'no' && inv) { M.to(inv.host, { t: 'raid', a: 'no', id: inv.id }); inv = null; paintBox(); M.paint(); sfx.back(); }
}
const canJoin = () => M.on && E.root.dataset.mode === 'street' && S.st && S.st.free && !S.st.talk && !(JU.pvp && JU.pvp.busy) && !R;

/* ================= asking, and going in ================= */
function start(kind) {
  R = make(Math.random().toString(36).slice(2, 10), me(), [me()], kind);
  R.t = Date.now() + ASK_T * 1000;
  M.all({ t: 'raid', a: 'ask', id: R.id, k: R.kind });
  sfx.confirm(); toast(granite() ? 'Granite raid: it takes two. The server has ten seconds to join.' : 'Raid: the server has ten seconds to join.', '#ffd23d'); paintBox(); tickBox(); M.paint();
}
function go() {                                     // the host: in, with whoever said yes
  if (!R || R.phase !== 'gather') return;
  R.ids = R.ids.filter(here);
  if (granite() && R.ids.length < NEED2) {          // a Granite raid takes two: nobody came, so it is off
    if (Date.now() < R.t) { toast('A Granite raid takes two players or more.', '#ff8a98'); return; }
    clearInterval(clock); M.all({ t: 'raid', a: 'cancel', id: R.id }); R = null; paintBox(); M.paint(); toast('Nobody joined: a Granite raid takes two players or more.', '#ff8a98'); return;
  }
  clearInterval(clock);
  const plan = W_().plan({ w: W_().here(), at: S.me ? S.me.x - 300 : 0, n: WAVES.length - 1 });      // (Build 0.31: the street, from where the host is standing)
  for (const pid of R.ids) if (pid !== R.me) say(pid, { a: 'go', ids: R.ids, k: R.kind, plan });
  if (E.root.dataset.mode !== 'street') { M.all({ t: 'raid', a: 'cancel', id: R.id }); R = null; paintBox(); M.paint(); return; }
  begin(R.id, R.me, R.ids, R.kind, plan);
}
// in: on the street (Build 0.31), in the arena, whoever is in it a little way apart at the near end. solo: a district raid's (soloRaid)
function begin(id, hostId, ids, kind, plan, solo) {
  const kept = R && R.id === id ? R : null;
  R = make(id, hostId, solo ? ids.slice(0, 1) : ids.filter(here), kind);
  if (kept) R.t = kept.t;
  if (solo) { R.me = R.host = R.ids[0]; R.solo = solo; R.route = solo.route; }
  R.phase = 'fight'; inv = null; paintBox(); M.paint();
  if (!solo) defs(R.ids.length, R.kind);
  R.plan = W_().clean(plan) || W_().plan({ w: 'shibuya', at: 0, n: R.route.length - 1 });
  const stage = W_().open(R.plan), n = Math.max(0, R.ids.indexOf(R.me));
  S.fight({ stay: true, cfg: { foes: ['raid0'], stage, label: solo ? 'Raid · ' + solo.name : 'Raid', p1x: -700 + n * 150, win: null, raid: id, onLose: () => down() }, after: solo ? solo.after : undefined });
  Fi.nm.p2.textContent = solo ? solo.name : 'Raid'; Fi.nm.p2j.textContent = solo ? solo.jp : '討伐';
  E.banner(solo ? solo.jp : '討伐', solo ? solo.name.toUpperCase() : 'RAID');
  toast(R.ids.length > 1 ? 'Down the street together: whatever is waiting on it, and the boss at the end.' : 'Down the street: whatever is waiting on it, and the boss at the end.', '#ffd23d');
  paintHud();
}
// Build 0.31: a district raid (shibuya.js), alone: its fights become the groups waiting down its street (the weaker ones two at a time), the
// last of them the boss at the far end. o: { name, jp, foes, w (its district), at (where its light is), after(won) }
function soloRaid(o) {
  if (R || inv || !Array.isArray(o.foes) || !o.foes.length) return false;
  const weak = id => { const d = Fi.DEFS[id]; return !!d && !d.kit && d.hp <= 160 && !d.poise; }, list = o.foes.filter(id => Fi.DEFS[id]), route = [];
  for (let i = 0; i < list.length - 1;) {
    if (weak(list[i]) && i + 1 < list.length - 1 && weak(list[i + 1])) { route.push([list[i], list[i + 1]]); i += 2; } else route.push([list[i++]]);
  }
  route.push([list[list.length - 1]]);
  const sid = me() || 'solo', plan = W_().plan({ w: o.w, end: o.at, n: route.length - 1 });
  begin(Math.random().toString(36).slice(2, 10), sid, [sid], 'maho', plan, { name: o.name, jp: o.jp || '討伐', route, after: o.after });
  return true;
}

/* ================= the groups down the street (the host says what comes, where, and whose each one is) ================= */
// Build 0.31: what were waves are met where they wait on the street (walk(), below): two of every three in front, one behind, out of the
// dark all at once; the boss in front, at the far end. Where each is, is said from the arena's middle in the sender's game (ox)
function nextWave() {
  const k = R.wave + 1, plan = R.route[k - 1], n = R.ids.length, last = k >= R.route.length, list = [];
  if (!plan) return;
  const who = R.ids.filter(pid => here(pid) && !R.down.has(pid));
  if (!who.length) who.push(R.me);
  let i = 0;
  const put = (def, owner) => {
    const side = last || i % 3 !== 2 ? 1 : -1;
    list.push([k + '.' + i, def, owner, side > 0 ? Math.round(last ? rnd(300, 420) : rnd(300, 640)) : -Math.round(rnd(760, 900)), r1(i * .45)]);
    i++;
  };
  if (R.solo) for (const def of plan) put(def, R.me);
  else for (const [def, base, more] of plan) for (let j = 0; j < base + more * (n - 1); j++) put('rd_' + def, def === 'boss' ? R.me : who[i % who.length]);
  tell({ a: 'wave', k, list, ox: r1(ox()) });
  wave(k, list, ox());
}
function wave(k, list, at) {
  if (!fighting() || !Array.isArray(list)) return;
  R.wave = Math.max(R.wave, k | 0);
  for (const e of list) R.alive.add(String(e[0]));
  R.turnT = TURN; R.quiet = 0;
  const last = k >= R.route.length, d0 = list[0] && Fi.DEFS[list[0][1]];
  if (last) {
    if (R.solo) E.banner((d0 && d0.jp) || '討伐', ((d0 && d0.name) || 'The boss').toUpperCase());
    else if (granite()) E.banner('砲', 'GRANITE CANNON'); else E.banner('魔虚羅', 'MAHORAGA');
  } else if (list.length === 1 && d0 && (d0.kit || d0.hp > 160)) E.banner(d0.jp || '呪霊', (d0.name || 'Curse').toUpperCase(), 'sm');
  else E.banner('襲撃', 'AMBUSH', 'sm');
  const base = typeof at === 'number' ? at : ox();
  for (const e of list) { const wx = (+e[3] || 0) + base; E.after(+e[4] || 0, () => spawn(e, wx)); }      // (wx: where it is in the world)
  paintHud();
}
function spawn(e, wx) {
  if (!fighting()) return;
  const [eid, def, owner] = e, d = Fi.DEFS[def];
  if (!d || R.byId.has(eid) || !R.alive.has(String(eid))) return;      // (already down before it got here: its owner's game was quicker)
  const x = clamp(wx - ox(), -960, 960), o = Fi.make(def, x);
  Object.assign(o, { eid: String(eid), def, owner: R.ids.includes(String(owner)) ? String(owner) : R.host, alpha: 0,      // (its owner gone from the raid since: the host's)
    human: R.solo ? !!d.human : false, face: x > E.P1.x ? -1 : 1, nm: d.name, jp: d.jp, boss: (String(eid).split('.')[0] | 0) >= R.route.length });
  if (o.owner !== R.me) { o.net = true; o.ai = null; o.nt = null; }
  R.list.push(o); R.byId.set(o.eid, o);
  V.ring(o.x, 150, 220, '#b79bff', .4); V.sparks(o.x, 160, 'purple', 8);
}
// one of mine is down for good: everybody is told, and its owner (me) is paid for it as for any curse
function killed(o) {
  R.alive.delete(o.eid);
  tell({ a: 'ko', e: o.eid });
  const d = Fi.DEFS[o.def];
  if (JU.shop && JU.shop.earn) JU.shop.earn(o.def === 'rd_boss' || o.boss || (d && d.kit) ? 15 : 5, o);      // (as any fight pays: a curse 5, a boss 15, shop.js)
  paintHud();
}
function down() {                                   // the fight's onLose: out until the street is quiet again, or somebody heals you (rwalk.js)
  if (!fighting()) return;
  R.down.add(R.me); R.quiet = 0; tell({ a: 'down' });
  toast(R.ids.length > 1 ? 'Down. Back on your feet once the street is quiet again, or sooner if somebody heals you.' : 'Down.', '#ff8a98');
  if (host()) check();
}
// on his feet again: the street quiet (with half his health), or a partner's heal (with what it gave)
function up(frac, by) {
  const p = E.P1;
  if (!fighting() || !(R.down.has(R.me) || p.dead)) return false;
  R.down.delete(R.me); R.quiet = 0;
  p.dead = false; p.ps = 'up'; p.stun = .35; p.hp = Math.max(1, Math.round(p.max * clamp(+frac || .5, .05, 1))); p.inv = 1.5; p.vx = 0;
  tell({ a: 'up' }); toast(by ? `${by} got you back on your feet.` : 'Back on your feet, with half your health.', '#7fe9ff');
  paintHud();
  return true;
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
  const cfg = Fi.fight.cfg, id = R.id, solo = R.solo;
  E.slow(.8); E.banner(won ? '討伐' : '敗北', won ? 'RAID CLEAR' : 'RAID FAILED');
  if (won) sfx.confirm();
  if (won && !solo) { if (JU.shop && JU.shop.earn) JU.shop.earn(PAY, E.P1); if (JU.yen) JU.yen.earn(PAY * 100); }      // (and yen, as every raid pays: yen.js. A district raid pays its own way: shibuya.js)
  const drop = won && !solo && granite() && JU.dced && JU.dced.raidDrop ? JU.dced.raidDrop() : false;      // the Granite Cannon down: everyone in it rolls for the Secret CT, 3%
  paintHud();
  Fi.later(3600, () => {
    if (!R || R.id !== id) return;
    R = null; paintHud(); M.paint(); W_().close();
    if (!solo) toast(won ? `Raid cleared. +${PAY} tokens.` + (drop ? ' And a Secret CT: Direct Cursed Energy Discharge!' : '') : 'The raid failed.', won ? '#ffd23d' : '#ff8a98');
    else if (!won) toast(`${solo.name}: the raid failed. Its light is still there, for another go.`, '#ff8a98');
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
    inv = { id: m.id, host: p.id, name: p.name, until: Date.now() + ASK_T * 1000, joined: false, kind: m.k === GRANITE ? GRANITE : 'maho' };
    sfx.charge(); paintBox(); tickBox(); M.paint();
    return;
  }
  if (inv && m.id === inv.id && p.id === inv.host) {
    if (m.a === 'cancel') { inv = null; paintBox(); M.paint(); toast('The raid was called off.'); }
    else if (m.a === 'go') {
      if (inv.joined && Array.isArray(m.ids) && m.ids.includes(me()) && canJoin()) begin(m.id, p.id, m.ids.map(String), m.k === GRANITE ? GRANITE : inv.kind, m.plan);
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
  if (a === 'wave' && p.id === R.host) wave(m.k | 0, m.list, typeof m.ox === 'number' ? m.ox : undefined);
  else if (a === 'es') states(p.id, m.l, m.ox);
  else if (a === 'me') ally(p, m);
  else if (a === 'heal') { const al = R.allies.get(p.id); if (al && W_()) W_().incoming(String(m.k), +m.n, al.f, al.name); }      // (Build 0.31: a partner's heal, on its way to me: rwalk.js)
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
function states(pid, l, at) {
  if (!Array.isArray(l)) return;
  const d = off(at);                                // (Build 0.31: from their arena's middle to mine)
  for (const s of l.slice(0, 24)) {
    if (!Array.isArray(s) || s.length < 15) continue;
    const o = R.byId.get(String(s[0]));
    if (!o || !o.net || o.owner !== pid) continue;
    o.nt = { x: (+s[1] || 0) + d, y: +s[2] || 0, f: s[3] < 0 ? -1 : 1, st: ST[s[4] | 0] || 'idle', hp: Math.max(0, +s[5] || 0), max: Math.max(1, +s[6] || 1), a: clamp(+s[7] || 0, 0, 1), p: s.slice(8, 15).map(v => +v || 0) };
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
  if (!dead && JU.ragdoll) JU.ragdoll.blow(o, d, m.rag);      // (a partner's blow that throws it is weighed as well: the harder, the longer it lies there. Build 0.31v1, ragdoll.js)
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
  Object.assign(o, { x: clamp(typeof s.x === 'number' ? s.x + off(s.ox) : o.x, -960, 960), y: Math.max(0, +s.y || 0), face: s.f < 0 ? -1 : 1, hp: clamp(+s.hp || o.hp, 1, 99999), max: Math.max(1, +s.max || o.max), dr: clamp(+s.dr || o.dr || 1, .3, 1), vx: 0, vy: 0 });
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
  tell({ a: 'own', e: o.eid, to, s: { x: r1(o.x), ox: r1(ox()), y: r1(o.y), f: o.face, hp: r1(o.hp), max: o.max, dr: r2(o.dr || 1), t: r2(ai.t || 1), kt: r2(ai.kt || 1), kcd: (ai.kcd || []).map(r2) } });
  adopt(o, to);
}

/* ================= the others in it, as their games say they are ================= */
function ally(p, m) {
  if (typeof m.x !== 'number' || !Array.isArray(m.p)) return;
  let a = R.allies.get(p.id);
  const t = T.TECH[m.tk], skin = (t && t.skin) || E.YUJI;
  if (!a) { a = { f: E.fighter(skin, m.x + off(m.ox), m.f < 0 ? -1 : 1), st: null, name: p.name }; a.f.z = ZP; a.f.ally = 1; R.allies.set(p.id, a); }
  a.f.skin = skin; a.f.scale = clamp(+m.sc || 1, .5, 2); a.st = m; a.name = p.name;
  if (p.id === R.host && !host() && typeof m.ox === 'number' && W_()) W_().to(m.ox);      // (Build 0.31: the host's game says where the arena is: mine follows)
  if (Array.isArray(m.fx)) echo(m.fx);
}
const allyX = a => a.st.x + off(a.st.ox);          // where one of them is, in my arena
function allies(dt) {
  for (const a of R.allies.values()) {
    const s = a.st, f = a.f;
    if (!s) continue;
    const k = 1 - Math.exp(-dt * 20), x = allyX(a);
    if (Math.abs(x - f.x) > 420) f.x = x; else f.x += (x - f.x) * k;
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
  else if (!best && R.ph && cur !== R.ph && !keep) { E.setFoe(R.ph); Fi.nm.p2.textContent = R.solo ? R.solo.name : 'Raid'; Fi.nm.p2j.textContent = R.solo ? R.solo.jp : '討伐'; }      // (Build 0.31: nothing left standing: on down the street, the camera on him)
  if (R.ph && E.P2 === R.ph) R.ph.x = p.x;        // (the placeholder stays on him, so that nothing is aimed down the street at nothing)
}
// what this game runs, sent: its curses, and me
function send(dt) {
  if ((R.sendEs -= dt) <= 0) {
    R.sendEs = SEND_ES;
    const l = [];
    for (const o of R.list) if (o.owner === R.me && !o.net && (!o.ko || o.alpha > 0)) l.push([o.eid, r1(o.x), r1(o.y), o.face, Math.max(0, ST.indexOf(o.state)), r1(o.hp), o.max, r2(o.alpha === undefined ? 1 : o.alpha), ...o.pose.map(r2)]);
    if (l.length) tell({ a: 'es', l, ox: r1(ox()) });
  }
  if ((R.sendMe -= dt) <= 0) {
    R.sendMe = SEND_ME;
    const p = E.P1, m = { a: 'me', x: r1(p.x), y: r1(p.y), f: p.face, sp: r2(p.spin), sc: p.scale || 1, p: p.pose.map(r2), tk: T.active ? T.active.id : '', hp: r1(Math.max(0, p.hp)), max: p.max, dead: p.dead ? 1 : 0, ox: r1(ox()) };
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
  say(o.owner, { a: 'rh', e: o.eid, d: r1(d), f: face, kb: Math.round(h.kb || 0), lift: Math.round(h.lift || 0), stun: r2(h.stun || .4), rag: h.rag === 'up' || h.rag === 'slam' ? h.rag : 0 });      // (rag: an uppercut's or a slam's, for how long it lies there: ragdoll.js)
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
  walk(dt);
  if (p.dead && !R.down.has(R.me)) down();
  if (R.down.has(R.me) && !R.alive.size) { if ((R.quiet += dt) >= QUIET) up(.5); } else R.quiet = 0;      // the street quiet again: up
  paintHud(true);
};
// Build 0.31: the street. The host's game carries the arena on behind whoever is furthest on, while nothing is standing; and meets each
// group where it waits, the boss at the far end. Everybody else's arena follows the host's (ally())
function walk(dt) {
  const Wk = W_(), st = Wk && Wk.state;
  if (!st) return;
  for (let i = R.list.length - 1; i >= 0; i--) { const o = R.list[i]; if (o.ko && o !== E.P2 && Math.abs(o.x) > 1100) { R.list.splice(i, 1); R.byId.delete(o.eid); } }      // (one left far behind)
  for (const o of R.list) if (o.ko && o.human && !o.net && o.state === 'down' && (o.koT = (o.koT || 0) + dt) > 1.6) o.alpha = Math.max(0, (o.alpha === undefined ? 1 : o.alpha) - dt * .8);      // (a person, not a curse: they do not go up in smoke, they are left behind)
  Wk.lock(R.alive.size > 0);
  if (!host() || R.phase !== 'fight') return;
  if (R.wave >= R.route.length) {                   // the boss's group down: cleared
    if (!R.alive.size) { if (!R.next) R.next = E.T + 1.2; else if (E.T >= R.next) { R.next = 0; end(true); } }
    return;
  }
  if (R.alive.size) return;
  let front = -1e9;
  if (!E.P1.dead && !R.down.has(R.me)) front = E.P1.x;
  for (const [pid, a] of R.allies) if (a.st && !a.st.dead && !R.down.has(pid)) front = Math.max(front, allyX(a));
  if (front > SCROLL && st.ox < st.b) Wk.move(Math.min(front - SCROLL, st.b - Wk.ox));
  const k = R.wave + 1, last = k >= R.route.length, at = last ? st.b : st.stops[k - 1];
  if (at === undefined || (last ? Wk.ox >= st.b - .5 : Wk.ox + AHEAD >= at)) nextWave();
}
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
// the raid's own line at the top: where on the street, how many are on you, who is in it; under it the street's line (rwalk.js), and the
// heal key if you have one and somebody to use it on
let hudKey = '';
function paintHud(quick) {
  if (!R || R.phase === 'gather') { if (hudKey) { hudKey = ''; hud.classList.remove('on'); hud.innerHTML = ''; } return; }
  const alive = R.alive.size, n = R.route.length, boss = R.wave >= n, Wk = W_();
  const who = R.ids.map(pid => (pid === R.me ? 'You' : (R.allies.get(pid) || {}).name || (M.peer(pid) || {}).name || 'Player') + (R.down.has(pid) ? ' (down)' : ''));
  const key = [R.phase, R.wave, alive, who.join(','), Wk ? Wk.key() : ''].join('|');
  if (quick && key === hudKey) return;
  hudKey = key; hud.classList.add('on');
  const what = R.phase === 'over' ? 'Over' : boss ? (alive ? `The boss · ${alive > 1 ? alive + ' left' : 'still standing'}` : 'The boss is down')
    : alive ? `${alive} on you · the curtain is down round you` : R.wave ? `The street is quiet · ${n - 1 - R.wave ? n - 1 - R.wave + ' more before the boss' : 'the boss is at the end'}` : 'Walk on down the street';
  hud.innerHTML = `<b>${R.solo ? esc(R.solo.name) : 'Raid'}</b><span>${what}</span><div class="rbar"></div><i>${who.map(esc).join(' · ')}</i>${Wk ? Wk.chip() : ''}`;
  if (Wk) Wk.paintBar(hud.querySelector('.rbar'));
}
// Build 0.31: the arena has moved along the street (rwalk.js, game.js E.shift): every curse in it keeps its place in the world, and so do
// the others (the engine has moved him and the one he is fighting)
const shift0 = H.shift;
H.shift = d => {
  if (shift0) shift0(d);
  if (!R) return;
  for (const o of R.list) { if (o !== E.P2) o.x -= d; if (o.nt) o.nt.x -= d; }
  for (const a of R.allies.values()) a.f.x -= d;
  if (R.ph && R.ph !== E.P2) R.ph.x -= d;
};
// Build 0.31, healing a partner (rwalk.js): who there is to heal, and the word to their game
const partners = () => (fighting() ? R.ids.filter(pid => pid !== R.me && here(pid) && R.allies.get(pid) && R.allies.get(pid).st)
  .map(pid => { const a = R.allies.get(pid); return { pid, f: a.f, name: a.name, hp: +a.st.hp || 0, max: +a.st.max || 100, down: R.down.has(pid) || !!a.st.dead }; }) : []);
function heal(pid, k, n) { if (fighting() && R.ids.includes(pid)) say(pid, { a: 'heal', k: String(k), n: r2(clamp(+n || 0, 0, .5)) }); }
H.fightStart = (cfg, wave) => {
  start0(cfg, wave);
  if (!cfg || !cfg.raid || !R || cfg.raid !== R.id) return;
  const o = E.P2;                                   // the placeholder: nothing, and nowhere
  Object.assign(o, { alpha: 0, net: true, ph: true, ko: true, state: 'down', ai: null, x: E.P1.x, hp: 1, max: 1 });      // (ko: nothing fades it in)
  R.ph = o;
};
H.reset = () => { reset0(); if (R && R.phase !== 'gather') { R = null; paintHud(); if (W_()) W_().close(); } };
const exit0 = JU.exitGame;
JU.exitGame = () => {
  if (R) { if (R.phase === 'gather') M.all({ t: 'raid', a: 'cancel', id: R.id }); else tell({ a: 'left' }); }
  if (inv) M.to(inv.host, { t: 'raid', a: 'no', id: inv.id });
  R = null; inv = null; paintBox(); paintHud(); clearInterval(clock); if (W_()) W_().close();
  exit0();
};

JU.raid = { chip, click, start, WAVES, solo: soloRaid, partners, heal, revive: (frac, by) => up(frac, by), isDown: () => !!R && R.phase === 'fight' && R.down.has(R.me), allies: () => (R && R.phase !== 'gather' ? [...R.allies.values()].filter(a => a.st).map(a => a.f) : []),      // (the others' fighters, for what their techniques carry: ratio.js, reaper.js)
 get state() { return R && { id: R.id, host: R.host, ids: R.ids.slice(), kind: R.kind, phase: R.phase, wave: R.wave, alive: [...R.alive], list: R.list.map(o => ({ eid: o.eid, def: o.def, owner: o.owner, net: !!o.net, hp: r1(o.hp), ko: !!o.ko, x: Math.round(o.x) })), down: [...R.down], allies: [...R.allies.keys()],
    solo: R.solo && R.solo.name, route: R.route.map(r => r.map(x => (Array.isArray(x) ? x[0] : x))), quiet: r2(R.quiet), ph: !!R.ph && E.P2 === R.ph }; },
  get invite() { return inv && { id: inv.id, host: inv.host, joined: inv.joined }; } };
})();
