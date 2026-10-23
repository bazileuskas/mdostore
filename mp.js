/* JUJUTSU UNLIMITEDS — playing online: a server to play on with friends (up to five, found by a code), and the QUEUE, which pairs whoever is
   waiting, anywhere, for a 1v1. Taken from the phone app (github.com/bazileuskas/ju-app, app/net.js) so that the browser and the phones play
   on the same server, the dojo (wss://ju-dojo.onrender.com, its code is in that repo's server/): one WebSocket each, every message passed on
   through it, so there is nothing a network can refuse and nobody's address is shown to anybody. It replaces the first version of this file,
   which made rooms out of the players' own browsers (WebRTC, with ntfy.sh for the handshake).
   As in the app: a name to play under (the Play screen), the ping, a line that drops is reopened by itself and the same seat given back to the
   same device within its grace (15 s), and after a queued duel a rematch, the next opponent, or the way out. Added here, as the web version
   had it: the team's admin powers (account.js keeps and checks them), given from the list of who is on a server.
   (`localStorage['ju.app.server']` points one device at another dojo, e.g. ws://127.0.0.1:8790 for one run on this machine) */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, C = JU.cast, sfx = JU.sfx, S = JU.street;
const MAX = 5, RATE = 100, GRACE = 15;
const DOJO = 'wss://ju-dojo.onrender.com';
const server = () => { try { return localStorage.getItem('ju.app.server') || DOJO; } catch (e) { return DOJO; } }, ver = () => 'web';
const peers = new Map();                             // everybody else in the room: id -> { id, name, st, f, say, sayT, ct, a, away }
const heard = {};                                   // what else may come down the line besides where somebody is: a challenge, a duel (pvp.js)
let ws = null, id = '', code = '', on = false, armed = '', quick = false, phase = '', waiting = 0, match = null, asked = false, wasBusy = false;
let kind = '', pub = 1;                             // a server's kind: 'public' (anybody's: public-1, public-2 ... the first with room) or 'private' (by a code)
const PUBS = 40;                                    // how many public servers there are to try
const fresh = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');
let loop = 0, note = '', noteOk = false, noteT = 0, mine = { c: '', ct: 0 }, last = [0, 0], sayT = 0, retry = 0, backoff = 1, down = false, downAt = 0;
try { code = localStorage.getItem('jump.code') || ''; } catch (e) {}
let nick = '';                                      // the name he typed on the Play screen: it comes before an account's, and is kept on this device
try { nick = (localStorage.getItem('ju.app.name') || '').slice(0, 16); } catch (e) {}
const named = () => nick || (JU.account && JU.account.name) || '';
const myName = () => (named() || 'Player-' + (id || 'xxxx').slice(0, 4)).slice(0, 20);
const open = () => [...peers.values()];
const post = m => { if (!ws || ws.readyState !== 1) return false; try { ws.send(JSON.stringify(m)); return true; } catch (e) { return false; } };
function warn(text, ok) { note = text; noteOk = !!ok; noteT = 12; paint(); }
/* ---------- admin powers: the team's account gives them to somebody on the server, or takes them back (account.js keeps and checks them) ---------- */
let sure = '', sureT = 0;
const boss = () => !!(JU.account && JU.account.team && JU.account.dev);
heard.id = (p, s) => { p.dev = typeof s.d === 'string' && /^[0-9a-f]{16}$/.test(s.d) ? s.d : ''; paint(); };      // (which browser he is: the note is made out to it. Nothing else is ever signed)
heard.adm = (p, s) => { JU.account.take({ a: s.a, t: s.t0, sig: s.sig }).then(ok => { if (!ok) return; warn(s.a === 'give' ? 'The team gave you admin powers. Everything is unlocked.' : 'Your admin powers were taken back.', s.a === 'give'); send(); }); };
function grant(pid) {
  const p = peers.get(pid);
  if (!p || !p.dev || !boss()) return;
  if (sure !== pid) { sure = pid; clearTimeout(sureT); sureT = setTimeout(() => { sure = ''; paint(); }, 3500); sfx.hover(); paint(); return; }      // asked twice
  sure = ''; clearTimeout(sureT);
  const give = p.a !== 1, t = Date.now();
  JU.account.sign((give ? 'ju-admin|' : 'ju-admin-off|') + p.dev + '|' + t).then(sig => { to(pid, { t: 'adm', a: give ? 'give' : 'drop', t0: t, sig }); sfx.confirm(); warn(give ? `Admin powers given to ${p.name}.` : `Admin powers taken back from ${p.name}.`, true); },
    () => warn('That could not be signed. Log in to the team account again.'));
}

/* ---------- the socket: opened when a room or the queue is asked for, reopened by itself if it drops ---------- */
function connect(then) {
  const hello = () => post({ t: 'hello', name: named(), dev: JU.account && JU.account.device, ver: ver(), id: id || undefined });      // (no name: the server calls him Player-xxxx after his id, as myName() does)
  if (ws && ws.readyState === 1) { hello(); then(); return; }      // (said again: his name may have changed since)
  if (ws && ws.readyState === 0) { ws.addEventListener('open', then, { once: true }); return; }
  let w;
  try { w = new WebSocket(server()); } catch (e) { warn('Could not reach the server.'); return; }
  ws = w;
  w.onopen = () => { backoff = 1; hello(); then(); };
  w.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (err) { return; } hear(m); };
  w.onclose = () => { if (ws !== w) return; ws = null; if (on) lost(); };
  w.onerror = () => {};
}
function lost() {                                   // the line dropped while on a server: it is tried again at once, and the seat waits
  if (!down) { down = true; downAt = E.T; }
  warn(peers.size ? 'Connection lost. Reconnecting…' : `Lost the server. Trying again in ${backoff}s…`);
  clearTimeout(retry);
  retry = setTimeout(() => { if (!on) return; connect(() => { down = false; note = ''; paint(); }); }, peers.size ? 600 : backoff * 1000);      // (what he rejoins is settled when the server says who he is: 'ok', below)
  backoff = Math.min(backoff * 2, 10);
}

/* ---------- joining, and being joined ---------- */
function make(pid, name) {
  const p = { id: pid, name: String(name || 'Player').slice(0, 20), st: null, f: null, say: '', sayT: 0, ct: 0, a: 0, away: false };
  peers.set(pid, p);
  return p;
}
function drop(pid) {
  const p = peers.get(pid);
  if (!p) return;
  peers.delete(pid);
  if (heard.gone) heard.gone(p);
  if (match && match.pid === pid) { match.gone = true; if (phase === 'matched' || phase === 'done') { phase = 'done'; rm.me = rm.them = false; } }
  paint();
}
function state(p, s) {                              // where he is, as his game says
  if (!s || typeof s.x !== 'number' || typeof s.z !== 'number') return;
  p.st = s; if (s.n) p.name = String(s.n).slice(0, 20);
  if ((s.a | 0) !== p.a) { p.a = s.a | 0; paint(); }
  if (s.c && s.ct !== p.ct) { p.ct = s.ct; p.say = String(s.c).slice(0, 80); p.sayT = 6; sfx.hover(); }
}
function hear(m) {
  if (!m || typeof m.t !== 'string') return;
  if (m.t === 'ok') {                                // a different id than before: the old seat is gone (the grace ran out, or the server restarted), so he starts again where he was
    const was = id; id = String(m.id || '');
    if (on && was && was !== id) { for (const pid of [...peers.keys()]) drop(pid); match = null; asked = false; rm.me = rm.them = false; phase = quick ? 'queue' : 'room'; post(quick ? { t: 'queue' } : { t: 'room', code }); }
    paint(); return;
  }
  if (!on) return;
  if (m.t === 'peers') {                             // the room as it is now
    const seen = new Set();
    for (const q of Array.isArray(m.list) ? m.list : []) {
      if (!q || q.id === id) continue;
      seen.add(q.id);
      const p = peers.get(q.id);
      if (p) p.name = String(q.name || p.name).slice(0, 20); else { const np = make(q.id, q.name); sfx.confirm(); to(q.id, { t: 'id', d: JU.account.device }); if (heard.come) heard.come(np); }      // (come: what he needs to know, from us: ps.js sends what has been built)
    }
    for (const pid of [...peers.keys()]) if (!seen.has(pid)) drop(pid);
    if (typeof m.code === 'string' && !quick) code = m.code;
    paint();
  }
  else if (m.t === 'full') {
    if (kind === 'public' && pub < PUBS) { pub++; code = 'public-' + pub; post({ t: 'room', code }); paint(); }      // that one is full: the next
    else leave(kind === 'public' ? 'Every public server is full. Try again in a moment.' : 'That server is full: five are in it already.');
  }
  else if (m.t === 'queued') { phase = 'queue'; waiting = m.n | 0; match = null; asked = false; rm.me = rm.them = false; paint(); }
  else if (m.t === 'match') { phase = 'matched'; match = { pid: String(m.pid), name: String(m.name || 'Player').slice(0, 20), host: !!m.host, t: E.T, gone: false }; asked = false; rm.me = rm.them = false; sfx.confirm(); paint(); }
  else if (m.t === 'st') { const p = peers.get(m.from); if (p) state(p, m.s); }
  else if (m.t === 'from') {
    const p = peers.get(m.from), s = m.m;
    if (!p || !s || typeof s.t !== 'string') return;
    if (heard[s.t]) heard[s.t](p, s);
    if (quick && s.t === 'duel' && s.a === 'ask' && match && p.id === match.pid) accept();      // a queued duel is agreed to by being asked for
  }
  else if (m.t === 'away') { const p = peers.get(String(m.id)); if (p) { p.away = true; warn(`${p.name} lost the connection. ${GRACE} seconds for them to come back…`); } }
  else if (m.t === 'back') { const p = peers.get(String(m.id)); if (p) { p.away = false; warn(`${p.name} is back.`, true); } }
  else if (m.t === 'gone') drop(String(m.id));
  else if (m.t === 'pong') { ping = Math.round(performance.now() - m.at); paintPing(); }
  else if (m.t === 'err') warn(String(m.msg || 'The server said no.').slice(0, 120));
}
/* ---------- ping: to the server every two seconds, and to whoever he is fighting (there and back, through the server) ---------- */
let ping = 0, peerPing = 0;
const foe = () => { const d = JU.pvp && JU.pvp.state.d; return d ? d.pid : match && !match.gone ? match.pid : ''; };
setInterval(() => {
  if (!on || !ws || ws.readyState !== 1) return;
  post({ t: 'ping', at: performance.now() });
  const pid = foe();
  if (pid && peers.has(pid)) post({ t: 'to', pid, m: { t: 'pg', at: performance.now() } }); else if (peerPing) { peerPing = 0; paintPing(); }
}, 2000);
heard.pg = (p, s) => { if (s.r) { peerPing = Math.round(performance.now() - s.at); paintPing(); } else post({ t: 'to', pid: p.id, m: { t: 'pg', at: s.at, r: 1 } }); };
const pingEl = document.createElement('div'); pingEl.className = 'ping'; E.root.appendChild(pingEl);
function paintPing() {
  const v = peerPing || ping, show = on && (down || v > 0);
  pingEl.classList.toggle('on', show);
  if (!show) return;
  pingEl.textContent = down ? 'NO CONNECTION' : `PING ${v} ms`;
  pingEl.dataset.q = down ? 'bad' : v < 90 ? 'good' : v < 180 ? 'ok' : 'bad';
}
// pvp.js puts the challenge on screen with Accept and Decline; in a queued duel it is accepted on the next frame
function accept() { setTimeout(() => { const b = document.querySelector('.duel.on [data-d="yes"]'); if (b) b.click(); }, 50); }      // (a timer, not a frame: a browser tab at the back has no frames)

function join(c, k) {                               // a server by code, as before (k: what kind it is. A code that is not a public one is a private server)
  if (on) leave();
  code = String(c || code).trim().toLowerCase().slice(0, 16);
  kind = k || (/^public-\d+$/.test(code) ? 'public' : 'private');
  if (!code || !window.WebSocket) { note = code ? 'This device cannot join a server.' : 'Type a server code first.'; return false; }
  if (kind === 'private') try { localStorage.setItem('jump.code', code); } catch (e) {}
  quick = false; on = true; note = ''; phase = 'room'; down = false;
  connect(() => post({ t: 'room', code }));
  loop = setInterval(send, RATE); paint();
  return true;
}
function joinPublic() { pub = 1; return join('public-1', 'public'); }      // the first public server with room in it (the rest: 'full', above)
function host() { return join(fresh(), 'private'); }                       // a private server of his own, under a code nobody else has
function queue() {                                  // the queue: the server pairs whoever is waiting
  if (on) leave();
  if (!window.WebSocket) { note = 'This device cannot play online.'; return false; }
  quick = true; on = true; note = ''; phase = 'queue'; code = ''; waiting = 0; match = null; asked = false; down = false; rm.me = rm.them = false;
  connect(() => post({ t: 'queue' }));
  loop = setInterval(send, RATE); paint();
  return true;
}
function next() {                                   // after a queued duel: back in the queue for another
  if (!on || !quick) return;
  phase = 'queue'; match = null; asked = false; waiting = 0; rm.me = rm.them = false;
  for (const pid of [...peers.keys()]) drop(pid);
  post({ t: 'queue' }); sfx.confirm(); paint();
}
/* ---------- a rematch: both ask for it, and the host challenges again ---------- */
const rm = { me: false, them: false };
function rematch() {
  if (!on || !quick || !match || match.gone || phase !== 'done') return;
  rm.me = true; M.to(match.pid, { t: 'rm' }); sfx.confirm();
  settle(); paint();
}
heard.rm = (p, s) => { if (match && p.id === match.pid && phase === 'done') { rm.them = true; if (!rm.me) sfx.hover(); settle(); paint(); } };
function settle() { if (rm.me && rm.them) { phase = 'matched'; asked = false; match.t = E.T; rm.me = rm.them = false; paint(); } }
function leave(why) {
  if (!on) return;
  on = false; armed = ''; quick = false; kind = ''; phase = ''; match = null; asked = false; down = false; clearInterval(loop); clearTimeout(retry);
  post({ t: 'leave' });
  for (const pid of [...peers.keys()]) drop(pid);
  note = why || ''; noteT = why ? 8 : 0; paint();
}

/* ---------- what is sent, and what is done with what arrives ---------- */
function send() {
  const me = S.me;
  if (!me || !peers.size) return;
  const street = E.root.dataset.mode === 'street', moving = Math.abs(me.x - last[0]) + Math.abs(me.z - last[1]) > 1.5;
  last = [me.x, me.z];
  post({ t: 'st', s: { w: S.world.name || 'tokyo', x: Math.round(me.x), y: Math.round(me.y), z: Math.round(me.z), f: me.face, m: moving ? 1 : 0, r: E.keys.has('shift') ? 1.7 : 1, b: street ? 0 : 1,
    k: (JU.tech.active && JU.tech.active.id) || '', h: JU.clan.body() ? JU.clan.equipped || '' : '', d: JU.pvp && JU.pvp.busy ? 1 : 0, a: boss() ? 2 : JU.account && JU.account.admin ? 1 : 0, n: myName(), c: mine.c, ct: mine.ct } });
}
const lookOf = st => { const t = JU.tech.TECH[st.k], toji = st.h === 'toji' && JU.tools && JU.tools.TOJI; return { skin: toji || (t && t.skin) || E.YUJI, scale: toji ? 1.05 : (t && t.scale) || 1 }; };
// the others who are in this district, as people to be drawn with everybody else in it
function fighters() {
  const W = S.world, here = W.name || 'tokyo', out = [];
  for (const p of open()) {
    const st = p.st;
    if (!st || st.w !== here) { p.f = null; continue; }
    const look = lookOf(st);
    if (!p.f) { p.f = E.fighter(look.skin, st.x, st.f || 1); p.f.z = st.z; p.f.pose = C.STAND.slice(); p.f.target = C.STAND; p.f.walk = 0; }
    p.f.skin = look.skin; p.f.scale = look.scale;
    out.push(p.f);
  }
  return out;
}
function tick(dt) {
  if (armed && !on) { const a = armed; armed = ''; if (a === 'quick') queue(); else if (a === 'public') joinPublic(); else if (a === 'private') host(); else join(code); }
  if (sayT > 0) sayT -= dt;
  if (noteT > 0 && (noteT -= dt) <= 0) { note = ''; paint(); }
  if (quick && on) {
    if (S.st && S.st.free && S.curses.length) S.curses.splice(0);         // nobody to walk into while waiting: the duel is the fight
    const busy = !!(JU.pvp && JU.pvp.busy);
    if (match && !match.gone && match.host && !asked && !busy && phase === 'matched' && E.T - match.t > .6 && peers.has(match.pid)) { asked = true; JU.pvp.invite(match.pid); paint(); }
    if (wasBusy && !busy && match && phase === 'matched') { phase = 'done'; rm.me = rm.them = false; paint(); }       // the duel is over: the chip offers what is next
    wasBusy = busy;
  }
  const W = S.world;
  for (const p of peers.values()) {
    if (p.sayT > 0) p.sayT -= dt;
    const f = p.f, st = p.st;
    if (!f || !st) continue;
    const k = 1 - Math.exp(-dt * 12);                 // he is drawn where he was last heard to be, and walks there rather than jumping
    f.x += (st.x - f.x) * k; f.z += (st.z - f.z) * k; f.face = st.f || f.face; f.ground0 = W.gy(f.z, f.x);
    f.y = typeof st.y === 'number' ? f.y + (st.y - f.y) * k : f.ground0;      // (up off the ground, if he is flying or standing on something built)
    C.stroll(f, !!st.m && !st.b, dt, st.r || 1);
  }
}
function tag(x, y, z, name, say, busy, own) {
  const q = P(x, y, z), k = Math.min(1.2, q[2]), fs = Math.round(15 * k + 6);
  if (q[0] < -200 || q[0] > E.VW + 200) return;
  g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  if (!own) { g.font = `600 ${fs}px Oswald, 'Segoe UI', sans-serif`; g.lineWidth = 4; g.strokeStyle = '#07060c'; g.strokeText(name + (busy ? ' · fighting' : ''), q[0], q[1]); g.fillStyle = busy ? '#ff8a98' : '#7fe9ff'; g.fillText(name + (busy ? ' · fighting' : ''), q[0], q[1]); }
  if (say) {
    g.font = `400 ${fs}px Oswald, 'Segoe UI', sans-serif`;
    const w = g.measureText(say).width + fs * 1.4, h = fs * 1.9, by = q[1] - fs * 1.9;
    g.fillStyle = 'rgba(244,239,228,.96)'; g.beginPath(); g.roundRect(q[0] - w / 2, by - h / 2, w, h, 8); g.fill(); g.beginPath(); g.moveTo(q[0] - 7, by + h / 2 - 1); g.lineTo(q[0] + 7, by + h / 2 - 1); g.lineTo(q[0], by + h / 2 + 9); g.closePath(); g.fill();
    g.fillStyle = '#0b0710'; g.fillText(say, q[0], by + 1);
  }
  g.restore();
}
function draw() {                                    // names over their heads, and what they have just said
  if (!on) return;
  for (const p of peers.values()) if (p.f && p.st) tag(p.f.x, p.f.y + 372 * (p.f.scale || 1), p.f.z, p.name, p.sayT > 0 ? p.say : '', !!(p.st.b || p.st.d), false);
  if (sayT > 0 && S.me) tag(S.me.x, S.me.y + 372 * (S.me.scale || 1), S.me.z, '', mine.c, false, true);
}

/* ---------- on screen: who is in the server, and somewhere to type ---------- */
const esc = x => String(x).replace(/[<>&"]/g, '');
const chip = document.createElement('div');
chip.className = 'mp'; chip.id = 'mp';
E.root.appendChild(chip);
function paint() {
  paintPing();
  const n = open().length + 1;
  chip.classList.toggle('on', on || !!note);
  if (!on) { chip.innerHTML = note ? `<small class="${noteOk ? 'fine' : 'gone'}">${esc(note)}</small>` : ''; return; }
  const noteEl = note ? `<small class="${noteOk ? 'fine' : 'gone'}">${esc(note)}</small>` : '';
  if (quick) {
    const who = esc(match ? match.name : '');
    const line = phase === 'queue' ? `Looking for an opponent…${waiting > 1 ? ` ${waiting} in the queue.` : ''}` : phase === 'matched' ? `Matched with <u>${who}</u>.` : phase === 'done' ? (match && match.gone ? `<u>${who}</u> has left.` : rm.them && !rm.me ? `<u>${who}</u> wants a rematch.` : rm.me ? `Rematch asked. Waiting for <u>${who}</u>…` : `That was <u>${who}</u>.`) : 'Reaching the server…';
    const btns = phase === 'done' ? `${match && !match.gone && !rm.me ? '<button type="button" data-rm="1">Rematch</button>' : ''}<button type="button" data-next="1">Next opponent</button><button type="button" data-out="1">Leave</button>` : '';
    chip.innerHTML = `<b>Queue</b><ul><li>${line}</li></ul><span class="mpbtns">${btns}</span>${noteEl}`;
    return;
  }
  const had = chip.querySelector('input'), val = had ? had.value : '', foc = had && document.activeElement === had;
  chip.innerHTML = `<b>${kind === 'public' ? `Public server <u>${pub}</u>` : `Private server <u>${esc(code)}</u>`}&nbsp;·&nbsp;${n}&nbsp;/&nbsp;${MAX}</b><ul><li>${esc(myName())} (you)${JU.account.admin ? '<em>admin</em>' : ''}</li>${open().map(p => `<li>${esc(p.name)}${p.away ? ' <em>· away</em>' : ''}<span>${boss() && p.dev && p.a !== 2 ? `<button type="button" data-adm="${p.id}" class="${p.a === 1 ? 'has' : ''}" title="${p.a === 1 ? 'Take admin powers back from' : 'Give admin powers to'} ${esc(p.name)}">${sure === p.id ? 'Sure?' : p.a === 1 ? 'Admin ✓' : 'Admin'}</button>` : ''}${JU.pvp ? `<button type="button" data-duel="${p.id}" title="Challenge ${esc(p.name)} to a 1v1">1v1</button>` : ''}</span></li>`).join('')}</ul>${JU.raid ? JU.raid.chip() : ''}
    <input maxlength="80" placeholder="/ to say something" aria-label="Say something to the server">${noteEl || (n < 2 ? (kind === 'public' ? '<small>Nobody else here yet. Anybody who picks a public server can drop in.</small>' : '<small>Give your friends the code above: Free Exploration, Private server, and they type it in.</small>') : JU.pvp ? '<small>1v1: challenge somebody to a duel.</small>' : '')}`;
  const inp = chip.querySelector('input'); inp.value = val; if (foc) inp.focus();
}
chip.addEventListener('keydown', e => {              // typing here is typing, not walking
  e.stopPropagation();
  const inp = e.target;
  if (!(inp instanceof HTMLInputElement)) return;
  if (e.key === 'Enter') { const t = inp.value.trim(); if (t) { mine = { c: t.slice(0, 80), ct: Date.now() }; sayT = 6; } inp.value = ''; inp.blur(); }
  else if (e.key === 'Escape') { e.preventDefault(); inp.blur(); }
});
chip.addEventListener('pointerdown', e => e.stopPropagation());
chip.addEventListener('click', e => {
  const b = e.target.closest('[data-duel]'), nx = e.target.closest('[data-next]'), r = e.target.closest('[data-rm]'), out = e.target.closest('[data-out]'), ad = e.target.closest('[data-adm]'), rd = e.target.closest('[data-raid]');
  if (rd && JU.raid) { JU.raid.click(rd.dataset.raid); rd.blur(); }
  else if (ad) grant(ad.dataset.adm); else if (nx) next(); else if (r) rematch(); else if (out) JU.exitGame(); else if (b && JU.pvp) { JU.pvp.invite(b.dataset.duel); b.blur(); }
});
addEventListener('keydown', e => { if (on && !quick && e.key === '/' && E.root.dataset.mode === 'street' && !(e.target instanceof HTMLInputElement)) { const inp = chip.querySelector('input'); if (inp) { e.preventDefault(); e.stopPropagation(); E.keys.clear(); inp.focus(); } } }, true);

// the cards on the Play screen (script.js puts them there), and their buttons
const card = () => `<div class="mpcard mpwho"><b><label for="mpName">Your name</label></b><span lang="ja">名</span>
    <div class="mprow"><input id="mpName" maxlength="16" placeholder="Player" value="${esc(named())}" spellcheck="false" autocomplete="off" autocapitalize="words" enterkeyhint="done" aria-label="Your name"></div></div>
  <div class="mpcard"><b>Queue</b><span lang="ja">列</span>
    <i>A 1v1 against whoever is queued up, anywhere in the world: a ban each, a technique each, no clans, no cursed tools. You wait on the street, and the duel comes to you.</i>
    <div class="mprow"><button class="mode mpgo" data-mode="free" data-mp="quick"><b>Queue up</b></button></div></div>`;
// a friend's private server, by its code (in Free Exploration's choice: ps.js)
const codeCard = () => `<div class="mpcard"><b>Join a private server</b><span lang="ja">参加</span>
    <i>Type the code a friend gives you (the top right of their screen).</i>
    <div class="mprow"><input id="mpCode" maxlength="16" placeholder="Server code" value="${esc(kind === 'public' ? '' : code)}" spellcheck="false" autocapitalize="off" aria-label="Server code"><button class="mode mpgo" data-mode="free" data-mp="room"><b>Join</b></button></div>
    <small id="mpNote">${esc(note)}</small></div>`;
document.addEventListener('input', e => {             // the name is kept as it is typed
  if (e.target.id !== 'mpName') return;
  nick = e.target.value.replace(/[<>&"]/g, '').trim().slice(0, 16);
  try { localStorage.setItem('ju.app.name', nick); } catch (err) {}
});
document.addEventListener('keydown', e => { if (e.target.id === 'mpName' && e.key === 'Enter') e.target.blur(); });
document.addEventListener('click', e => {
  const nw = e.target.closest('#mpNew'), m = e.target.closest('.mode');
  if (nw) { const inp = document.getElementById('mpCode'); inp.value = Array.from(crypto.getRandomValues(new Uint8Array(6)), b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join(''); inp.focus(); inp.select(); sfx.hover(); return; }
  if (!m || !m.dataset.mode) return;
  armed = m.dataset.mp || '';                        // any other way into the game is played alone
  if (armed !== 'room') return;
  const inp = document.getElementById('mpCode'), c = inp ? inp.value.trim().toLowerCase() : '';
  if (!c) { e.stopPropagation(); e.preventDefault(); armed = ''; const nt = document.getElementById('mpNote'); if (nt) nt.textContent = 'Type a server code first, or press New code.'; sfx.back(); return; }
  code = c;
}, true);
const exit0 = JU.exitGame;
JU.exitGame = () => { leave(); exit0(); };            // leaving the game leaves the server

const to = (pid, m) => peers.has(pid) && post({ t: 'to', pid, m });
const M = JU.mp = { card, codeCard, join, joinPublic, host, queue, leave, tick, fighters, draw, MAX, to, hear(t, fn) { const was = heard[t]; heard[t] = was ? (p, s) => { was(p, s); fn(p, s); } : fn; }, peer: pid => peers.get(pid), paint, myName,
  all(m) { for (const pid of peers.keys()) to(pid, m); },      // (to everybody on the server)
  get kind() { return on ? kind : ''; }, get code() { return code; }, get pub() { return pub; },
  cut() { if (ws) ws.close(); },                     // (drops the line on purpose, for trying what a lost connection does: JU.mp.cut() in the console)
  get on() { return on; }, get id() { return id; }, get quick() { return quick; }, get down() { return down; },
  get state() { return { on, quick, phase, code, match, down, rm: { ...rm }, peers: [...peers.values()].map(p => ({ id: p.id, name: p.name, away: p.away, st: p.st })) }; } };
})();
