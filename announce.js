/* JUJUTSU UNLIMITEDS — announcements from the team, shown at the top of every player's screen within a second or two of being sent.
   The game has no server of its own, so they travel over a public relay (ntfy.sh): every open copy of the game listens to one topic, and the
   team's account posts to it from the scroll in the corner. Anybody can post to a public topic, so every announcement is signed (Ed25519)
   with a key made from the team's sign-in (account.js), and a game shows only what checks out against the public half kept here. One more
   than ten minutes old is not shown either, so nothing can be played back later. A browser that cannot check a signature shows nothing */
(() => {
'use strict';

const HOST = 'https://ntfy.sh', PUB = JU.account.PUB, MAXLEN = 160, FRESH = 600, STAY = 11000;
let topic = 'jujutsu-unlimiteds-024aef04681f', es = null, key = null, showing = false, hide = 0;
const queue = [], sfx = JU.sfx, enc = s => new TextEncoder().encode(s);
const unhex = h => new Uint8Array(h.match(/../g).map(b => parseInt(b, 16)));
const seen = () => { try { return JSON.parse(localStorage.getItem('juannounce.seen') || '[]'); } catch (e) { return []; } };
const pub = async () => key || (key = await crypto.subtle.importKey('raw', unhex(PUB), { name: 'Ed25519' }, false, ['verify']));

/* ---------- the banner ---------- */
const el = document.createElement('div');
el.className = 'annc'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
el.innerHTML = `<div class="annc-in"><b>TheUnlimitedsTeam</b><svg viewBox="0 0 24 24" role="img" aria-label="Verified"><g fill="#1d9bf0"><circle cx="12" cy="12" r="8.6"/>${Array.from({ length: 8 }, (_, i) => `<circle cx="${(12 + Math.cos(i * Math.PI / 4) * 7.6).toFixed(2)}" cy="${(12 + Math.sin(i * Math.PI / 4) * 7.6).toFixed(2)}" r="3.5"/>`).join('')}</g><path d="M7.4 12.4l3.1 3.1 6.2-6.6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span></div>`;
document.body.appendChild(el);
function next() {
  if (showing || !queue.length) return;
  showing = true; el.querySelector('span').textContent = queue.shift();        // (as text, never as markup)
  el.classList.add('on'); sfx.confirm();
  hide = setTimeout(done, STAY);
}
function done() { clearTimeout(hide); el.classList.remove('on'); setTimeout(() => { showing = false; next(); }, 450); }
el.addEventListener('click', done);

/* ---------- hearing one ---------- */
async function take(raw) {
  let d;
  try { d = JSON.parse(raw); } catch (e) { return; }
  if (!d || typeof d.m !== 'string' || typeof d.t !== 'number' || typeof d.s !== 'string' || !d.m || d.m.length > MAXLEN || !/^[0-9a-f]{128}$/.test(d.s)) return;
  if (Math.abs(Date.now() / 1000 - d.t) > FRESH) return;                        // too old (or from the future): not shown
  const got = seen(), id = d.s.slice(0, 20);
  if (got.includes(id)) return;                                                // already shown here
  let ok = false;
  try { ok = await crypto.subtle.verify({ name: 'Ed25519' }, await pub(), unhex(d.s), enc('ju-announce|' + d.t + '|' + d.m)); } catch (e) {}
  if (!ok) return;                                                             // not the team's: dropped without a word
  got.push(id); try { localStorage.setItem('juannounce.seen', JSON.stringify(got.slice(-30))); } catch (e) {}
  queue.push(d.m); next();
}
function listen() {
  if (es) es.close();
  if (!window.EventSource || !window.crypto || !crypto.subtle) return;
  try {
    es = new EventSource(`${HOST}/${topic}/sse?since=10m`);                    // (and anything from the last ten minutes, for somebody who has only just opened the game)
    es.onmessage = e => { try { const d = JSON.parse(e.data); if (d.event === 'message') take(d.message); } catch (err) {} };
  } catch (e) {}
}

/* ---------- sending one: the team's account only (the signing is account.js's, and needs its sign-in) ---------- */
async function send(text) {
  const m = String(text).replace(/\s+/g, ' ').trim().slice(0, MAXLEN);
  if (!m) throw new Error('Nothing to send.');
  const t = Math.floor(Date.now() / 1000), s = await JU.account.sign('ju-announce|' + t + '|' + m);
  const r = await fetch(`${HOST}/${topic}`, { method: 'POST', body: JSON.stringify({ t, m, s }) });
  if (!r.ok) throw new Error('The relay would not take it (' + r.status + ').');
}

JU.announce = { send, MAXLEN, get topic() { return topic; }, set topic(v) { topic = v; listen(); } };
listen();
})();
