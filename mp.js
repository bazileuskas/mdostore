/* JUJUTSU UNLIMITEDS — a server to play on with friends: up to five people in the same Free Exploration, seeing each other walk about.
   The game has no machine of its own to run a server on, so a "server" here is a room that the players' own browsers make between them:
   everybody types the same server code, and their games connect straight to one another (WebRTC), every one to every other. The public
   relay the announcements use (ntfy.sh) carries only the handshake, a few short messages when somebody joins. After that nothing goes
   through anybody's server at all. What that costs: there is no relay to fall back on, so a network that will not let two browsers talk
   directly (some school and office ones) cannot join; and, as in any peer-to-peer game, the players in a room can learn each other's
   internet addresses. That is why a room is found by a code that friends agree on, and not listed anywhere.
   What is shared: where each player is, which district, who they are playing as, their name, and what they last said. Fights are still
   each player's own: somebody in one is shown as standing where they were, marked as fighting */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, C = JU.cast, sfx = JU.sfx, S = JU.street;
const RELAY = 'https://ntfy.sh', MAX = 5, RATE = 100, ICE = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }];
const id = Array.from(crypto.getRandomValues(new Uint8Array(5)), b => b.toString(16).padStart(2, '0')).join('');
const peers = new Map();                             // everybody else in the room: id -> { id, pc, dc, name, st, f, say, sayT, ct }
const heard = {};                                   // what else may come down the line besides where somebody is: a challenge, a duel (pvp.js)
let code = '', topic = '', es = null, on = false, armed = false, greeted = false, loop = 0, note = '', noteT = 0, mine = { c: '', ct: 0 }, last = [0, 0], sayT = 0;
try { code = localStorage.getItem('jump.code') || ''; } catch (e) {}
const myName = () => ((JU.account && JU.account.name) || 'Player-' + id.slice(0, 4)).slice(0, 20);
const open = () => [...peers.values()].filter(p => p.dc && p.dc.readyState === 'open');
const post = m => fetch(`${RELAY}/${topic}`, { method: 'POST', body: JSON.stringify(Object.assign({ from: id }, m)) }).catch(() => {});
const slim = sdp => { let n = 0; return sdp.split('\r\n').filter(l => !l.startsWith('a=candidate') || (!/ tcp /i.test(l) && n++ < 10)).join('\r\n'); };      // (short enough for the relay to carry)
const gathered = pc => new Promise(r => { if (pc.iceGatheringState === 'complete') return r(); const t = setTimeout(r, 2500); pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); r(); } }); });

/* ---------- joining, and being joined ---------- */
function make(pid, name) {
  const pc = new RTCPeerConnection({ iceServers: ICE }), p = { id: pid, pc, dc: null, name: String(name || 'Player').slice(0, 20), st: null, f: null, say: '', sayT: 0, ct: 0 };
  const lost = () => { if (peers.get(pid) !== p) return; if (!p.was && on) warn(`Could not connect to ${p.name}. Their network or yours does not let two games talk directly.`); drop(pid); };
  pc.onconnectionstatechange = () => { if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) lost(); };
  setTimeout(() => { if (!p.was) lost(); }, 25000);
  peers.set(pid, p);
  return p;
}
function wire(p, dc) {
  p.dc = dc;
  dc.onopen = () => { p.was = true; sfx.confirm(); paint(); };
  dc.onclose = () => drop(p.id);
  dc.onmessage = e => {
    let s; try { s = JSON.parse(e.data); } catch (err) { return; }
    if (s && typeof s.t === 'string') { if (s.t === 'bye') drop(p.id); else if (heard[s.t]) heard[s.t](p, s); return; }
    if (!s || typeof s.x !== 'number' || typeof s.z !== 'number') return;
    p.st = s; if (s.n) p.name = String(s.n).slice(0, 20);
    if (s.c && s.ct !== p.ct) { p.ct = s.ct; p.say = String(s.c).slice(0, 80); p.sayT = 6; sfx.hover(); }
  };
}
function warn(text) { note = text; noteT = 12; paint(); }
function drop(pid) { const p = peers.get(pid); if (!p) return; peers.delete(pid); try { p.pc.close(); } catch (e) {} if (heard.gone) heard.gone(p); paint(); }
async function offer(to, name) {                     // of any two players it is the one whose id sorts first that calls the other, so nobody calls twice
  if (peers.has(to) || peers.size >= MAX - 1) return;
  const p = make(to, name);
  wire(p, p.pc.createDataChannel('ju'));
  await p.pc.setLocalDescription(await p.pc.createOffer()); await gathered(p.pc);
  post({ t: 'offer', to, name: myName(), sdp: slim(p.pc.localDescription.sdp) });
}
async function answer(m) {
  if (peers.has(m.from) || peers.size >= MAX - 1) return;
  const p = make(m.from, m.name);
  p.pc.ondatachannel = e => wire(p, e.channel);
  await p.pc.setRemoteDescription({ type: 'offer', sdp: m.sdp }); await p.pc.setLocalDescription(await p.pc.createAnswer()); await gathered(p.pc);
  post({ t: 'answer', to: m.from, sdp: slim(p.pc.localDescription.sdp) });
}
function hear(m) {
  if (!on || !m || typeof m.from !== 'string' || m.from === id) return;
  if (m.t === 'hello') {                             // somebody new: say who is here, and that it is full if it is
    if (peers.has(m.from)) drop(m.from);             // (or somebody who left and has come back)
    if (open().length >= MAX - 1) { post({ t: 'full', to: m.from }); return; }
    post({ t: 'here', to: m.from, name: myName() });
    if (id < m.from) offer(m.from, m.name);
  } else if (m.to !== id) return;
  else if (m.t === 'here') { if (id < m.from) offer(m.from, m.name); }
  else if (m.t === 'full') leave('That server is full: five are in it already.');
  else if (m.t === 'offer') answer(m).catch(() => drop(m.from));
  else if (m.t === 'answer') { const p = peers.get(m.from); if (p && p.pc.signalingState === 'have-local-offer') p.pc.setRemoteDescription({ type: 'answer', sdp: m.sdp }).catch(() => drop(m.from)); }
}
async function join(c) {
  if (on) leave();
  code = String(c || code).trim().toLowerCase().slice(0, 16);
  if (!code || !window.RTCPeerConnection || !window.EventSource) { note = code ? 'This browser cannot join a server.' : 'Type a server code first.'; return false; }
  try { localStorage.setItem('jump.code', code); } catch (e) {}
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ju-server:' + code)));
  topic = 'ju-mp-' + Array.from(h.subarray(0, 12), b => b.toString(16).padStart(2, '0')).join('');
  on = true; note = ''; greeted = false;
  es = new EventSource(`${RELAY}/${topic}/sse`);
  es.onmessage = e => { try { const d = JSON.parse(e.data); if (d.event === 'message') hear(JSON.parse(d.message)); } catch (err) {} };
  es.onopen = () => { if (!greeted) { greeted = true; post({ t: 'hello', name: myName() }); } };     // (once: the line to the relay may drop and come back)
  loop = setInterval(send, RATE); paint();
  return true;
}
function leave(why) {
  if (!on) return;
  on = false; armed = false; clearInterval(loop); if (es) es.close(); es = null;
  for (const p of open()) try { p.dc.send('{"t":"bye"}'); } catch (e) {}
  for (const pid of [...peers.keys()]) drop(pid);
  note = why || ''; noteT = why ? 8 : 0; paint();
}

/* ---------- what is sent, and what is done with what arrives ---------- */
function send() {
  const me = S.me, live = open();
  if (!me || !live.length) return;
  const street = E.root.dataset.mode === 'street', moving = Math.abs(me.x - last[0]) + Math.abs(me.z - last[1]) > 1.5;
  last = [me.x, me.z];
  const s = JSON.stringify({ w: S.world.name || 'tokyo', x: Math.round(me.x), z: Math.round(me.z), f: me.face, m: moving ? 1 : 0, r: E.keys.has('shift') ? 1.7 : 1, b: street ? 0 : 1,
    k: (JU.tech.active && JU.tech.active.id) || '', h: JU.clan.body() ? JU.clan.equipped || '' : '', d: JU.pvp && JU.pvp.busy ? 1 : 0, n: myName(), c: mine.c, ct: mine.ct });
  for (const p of live) try { p.dc.send(s); } catch (e) {}
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
  if (armed && !on) { armed = false; join(code); }
  if (sayT > 0) sayT -= dt;
  if (noteT > 0 && (noteT -= dt) <= 0) { note = ''; paint(); }
  const W = S.world;
  for (const p of peers.values()) {
    if (p.sayT > 0) p.sayT -= dt;
    const f = p.f, st = p.st;
    if (!f || !st) continue;
    const k = 1 - Math.exp(-dt * 12);                 // he is drawn where he was last heard to be, and walks there rather than jumping
    f.x += (st.x - f.x) * k; f.z += (st.z - f.z) * k; f.face = st.f || f.face; f.y = f.ground0 = W.gy(f.z, f.x);
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
  const n = open().length + 1;
  chip.classList.toggle('on', on || !!note);
  if (!on) { chip.innerHTML = note ? `<small class="gone">${esc(note)}</small>` : ''; return; }
  const had = chip.querySelector('input'), val = had ? had.value : '', foc = had && document.activeElement === had;
  chip.innerHTML = `<b>Server <u>${code.replace(/[<>&"]/g, '')}</u> · ${n} / ${MAX}</b><ul><li>${esc(myName())} (you)</li>${open().map(p => `<li>${esc(p.name)}${JU.pvp ? `<button type="button" data-duel="${p.id}" title="Challenge ${esc(p.name)} to a 1v1">1v1</button>` : ''}</li>`).join('')}</ul>
    <input maxlength="80" placeholder="/ to say something" aria-label="Say something to the server">${note ? `<small class="gone">${esc(note)}</small>` : n < 2 ? '<small>Waiting for the others. They type the same code.</small>' : JU.pvp ? '<small>1v1: challenge somebody to a duel.</small>' : ''}`;
  const inp = chip.querySelector('input'); inp.value = val; if (foc) inp.focus();
}
chip.addEventListener('keydown', e => {              // typing here is typing, not walking
  e.stopPropagation();
  const inp = e.target;
  if (e.key === 'Enter') { const t = inp.value.trim(); if (t) { mine = { c: t.slice(0, 80), ct: Date.now() }; sayT = 6; } inp.value = ''; inp.blur(); }
  else if (e.key === 'Escape') { e.preventDefault(); inp.blur(); }
});
chip.addEventListener('pointerdown', e => e.stopPropagation());
chip.addEventListener('click', e => { const b = e.target.closest('[data-duel]'); if (b && JU.pvp) { JU.pvp.invite(b.dataset.duel); b.blur(); } });
addEventListener('keydown', e => { if (on && e.key === '/' && E.root.dataset.mode === 'street' && !(e.target instanceof HTMLInputElement)) { const inp = chip.querySelector('input'); if (inp) { e.preventDefault(); e.stopPropagation(); E.keys.clear(); inp.focus(); } } }, true);

// the card on the Play screen (script.js puts it there), and its buttons
const card = () => `<div class="mpcard"><b>Play with friends</b><span lang="ja">共闘</span>
    <i>Up to ${MAX} people in the same Free Exploration, and One v Ones against any of them: a ban each, a technique each, no clans, no cursed tools. Pick a server code with your friends, and everybody types the same one.</i>
    <div class="mprow"><input id="mpCode" maxlength="16" placeholder="Server code" value="${code.replace(/[<>&"]/g, '')}" spellcheck="false" autocapitalize="off" aria-label="Server code"><button class="mode mpgo" data-mode="free" data-mp="1"><b>Join server</b></button><button class="mpnew" id="mpNew" type="button">New code</button></div>
    <small id="mpNote">${note || 'Your games connect directly to each other, so join only with people you know.'}</small></div>`;
document.addEventListener('click', e => {
  const nw = e.target.closest('#mpNew'), m = e.target.closest('.mode');
  if (nw) { const inp = document.getElementById('mpCode'); inp.value = Array.from(crypto.getRandomValues(new Uint8Array(6)), b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join(''); inp.focus(); inp.select(); sfx.hover(); return; }
  if (!m || !m.dataset.mode) return;
  armed = !!m.dataset.mp;                            // any other way into the game is played alone
  if (!armed) return;
  const inp = document.getElementById('mpCode'), c = inp ? inp.value.trim().toLowerCase() : '';
  if (!c) { e.stopPropagation(); e.preventDefault(); armed = false; const nt = document.getElementById('mpNote'); if (nt) nt.textContent = 'Type a server code first, or press New code.'; sfx.back(); return; }
  code = c;
}, true);
const exit0 = JU.exitGame;
JU.exitGame = () => { leave(); exit0(); };            // leaving the game leaves the server

const to = (pid, m) => { const p = peers.get(pid); if (!p || !p.dc || p.dc.readyState !== 'open') return false; try { p.dc.send(JSON.stringify(m)); return true; } catch (e) { return false; } };
JU.mp = { card, join, leave, tick, fighters, draw, MAX, to, hear(t, fn) { heard[t] = fn; }, peer: pid => peers.get(pid), paint, myName, get on() { return on; }, get id() { return id; },
  get state() { return { on, code, topic, peers: [...peers.values()].map(p => ({ name: p.name, open: !!(p.dc && p.dc.readyState === 'open'), st: p.st })) }; } };
})();
