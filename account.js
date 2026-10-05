/* JUJUTSU UNLIMITEDS — accounts, and the scroll in the top right corner that they are kept on.
   There is no server behind this game: it is a handful of files, and everything it remembers it keeps in the browser. So an account here
   is a name, a password and a save of its own, all of them in this browser and nowhere else. Registering on one device does not make the
   account exist on another. What it is good for is keeping two people's progress apart on a computer they share.
   One account is different: the team's. Its name is reserved and it can sign in from any browser, because the check for it ships with the
   game (as a salted, stretched hash: the password itself is in no file). While it is signed in everything is unlocked, the way it was for
   everybody before the public release.
   None of this is security against somebody who opens the developer tools. A game that runs entirely in the browser cannot keep anything
   from the person running it; what this does is keep honest players honest. */
(() => {
'use strict';

const sfx = JU.sfx, TEAM = 'TheUnlimitedsTeam', GUEST = '_guest', ROUNDS = 120000;
const TEAM_SALT = '9ccc5ca0f18acfc6', TEAM_V = '353497485db0c38d6701a02f4965022b8ca9ebd8c795d4887103df9112005a09';
const NAME = /^[A-Za-z0-9][A-Za-z0-9_]{2,19}$/, MINPW = 6;
const OWN = /^ju\.(sfx$|accounts$|session$|save\.)/;       // these are not part of anybody's progress

/* ---------- SHA-256, and the stretch built on it ---------- */
const K = new Int32Array(64), H0 = new Int32Array(8), W = new Int32Array(64);
for (let p = 2, n = 0; n < 64; p++) {                      // its constants: the fractional parts of the roots of the first primes
  let prime = true;
  for (let d = 2; d * d <= p; d++) if (p % d === 0) { prime = false; break; }
  if (!prime) continue;
  if (n < 8) H0[n] = (Math.sqrt(p) % 1) * 4294967296 | 0;
  K[n++] = (Math.cbrt(p) % 1) * 4294967296 | 0;
}
function block(h, m, o) {                                  // one 64-byte block of m, starting at o, folded into the state h
  for (let i = 0; i < 16; i++) W[i] = m[o + i * 4] << 24 | m[o + i * 4 + 1] << 16 | m[o + i * 4 + 2] << 8 | m[o + i * 4 + 3];
  for (let i = 16; i < 64; i++) {
    const a = W[i - 15], b = W[i - 2];
    W[i] = (W[i - 16] + ((a >>> 7 | a << 25) ^ (a >>> 18 | a << 14) ^ a >>> 3) + W[i - 7] + ((b >>> 17 | b << 15) ^ (b >>> 19 | b << 13) ^ b >>> 10)) | 0;
  }
  let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], k = h[7];
  for (let i = 0; i < 64; i++) {
    const t1 = (k + ((e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7)) + (e & f ^ ~e & g) + K[i] + W[i]) | 0;
    const t2 = (((a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10)) + (a & b ^ a & c ^ b & c)) | 0;
    k = g; g = f; f = e; e = d + t1 | 0; d = c; c = b; b = a; a = t1 + t2 | 0;
  }
  h[0] = h[0] + a | 0; h[1] = h[1] + b | 0; h[2] = h[2] + c | 0; h[3] = h[3] + d | 0; h[4] = h[4] + e | 0; h[5] = h[5] + f | 0; h[6] = h[6] + g | 0; h[7] = h[7] + k | 0;
}
const bytes = (h, out) => { for (let i = 0; i < 8; i++) { const x = h[i]; out[i * 4] = x >>> 24; out[i * 4 + 1] = x >>> 16; out[i * 4 + 2] = x >>> 8; out[i * 4 + 3] = x; } return out; };
function sha256(msg) {                                     // bytes in, 32 bytes out
  const l = msg.length, n = (l + 72 >> 6) * 64, m = new Uint8Array(n), h = Int32Array.from(H0), bits = l * 8;
  m.set(msg); m[l] = 128;
  m[n - 4] = bits >>> 24; m[n - 3] = bits >>> 16; m[n - 2] = bits >>> 8; m[n - 1] = bits;       // (nothing hashed here is long enough to need the other four)
  for (let o = 0; o < n; o += 64) block(h, m, o);
  return bytes(h, new Uint8Array(32));
}
const enc = s => new TextEncoder().encode(s);
const hex = b => Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
// a password, with its account's salt, put through the hash ROUNDS times over: the same answer everywhere, and slow to guess at
function stretch(salt, pass) {
  const s = enc(salt), m = new Uint8Array(64), h = new Int32Array(8), bits = (32 + s.length) * 8;
  m.set(sha256(enc(salt + ':' + pass)));
  m.set(s, 32); m[32 + s.length] = 128; m[62] = bits >>> 8; m[63] = bits;        // each round: the last answer, then the salt. It fits one block
  for (let i = 0; i < ROUNDS; i++) { h.set(H0); block(h, m, 0); bytes(h, m); }
  return hex(m.subarray(0, 32));
}
const proof = k => hex(sha256(enc('v:' + k)));             // what is kept of it: enough to check a key against, not enough to make one

/* ---------- who is here ---------- */
const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const drop = k => { try { localStorage.removeItem(k); } catch (e) {} };
const accounts = read('ju.accounts', {});
const has = id => Object.prototype.hasOwnProperty.call(accounts, id);
const rec = name => { const id = String(name).toLowerCase(); return id === TEAM.toLowerCase() ? { name: TEAM, salt: TEAM_SALT, v: TEAM_V, team: true } : has(id) ? accounts[id] : null; };
let me = null;                                             // the account signed in, or nobody
{
  const s = read('ju.session', null), r = s && typeof s.n === 'string' && typeof s.k === 'string' ? rec(s.n) : null;
  if (r && proof(s.k) === r.v) me = r; else if (s) drop('ju.session');
}
const slot = () => (me ? me.name.toLowerCase() : GUEST);

// everything the game has saved, under whoever is leaving; and whatever is kept for whoever is arriving, in its place
function swap(to, fresh) {
  const live = [], keep = {};
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('ju.') && !OWN.test(k)) live.push(k); }
  for (const k of live) keep[k] = localStorage.getItem(k);
  localStorage.setItem('ju.save.' + slot(), JSON.stringify(keep));
  const next = read('ju.save.' + to, null);
  if (!next && !fresh) return;                             // nothing is kept under that name here yet: it starts from what is in front of it
  for (const k of live) localStorage.removeItem(k);
  for (const k in next || {}) if (k.startsWith('ju.') && !OWN.test(k) && typeof next[k] === 'string') localStorage.setItem(k, next[k]);
}
const hello = v => { try { sessionStorage.setItem('ju.hello', v); } catch (e) {} };

JU.account = Object.freeze({ TEAM, get name() { return me ? me.name : ''; }, get dev() { return !!(me && me.team); }, get signedIn() { return !!me; } });

/* ---------- the scroll ---------- */
const box = document.getElementById('ascroll');
if (!box) return;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let tab = 'in', busy = false, shut = 0;
box.innerHTML = `<div class="rod"></div><button class="ahead" id="ahead" aria-expanded="false" aria-controls="abody"></button>
  <div class="abody" id="abody"></div><div class="rod"></div>`;
const head = box.querySelector('#ahead'), body = box.querySelector('#abody');
const $ = q => body.querySelector(q);
body.inert = true;
const say = (text, ok) => { const m = $('#amsg'); if (m) { m.textContent = text; m.classList.toggle('ok', !!ok); } };
function fail(text) { say(text); sfx.back(); body.classList.remove('no'); void body.offsetWidth; body.classList.add('no'); }

function paint(note) {
  const team = !!(me && me.team);
  box.classList.toggle('in', !!me); box.classList.toggle('team', team);
  head.innerHTML = `<b lang="ja" aria-hidden="true">${team ? '無' : me ? '印' : '巻'}</b><span><small>${me ? (team ? 'Team account' : 'Signed in') : 'Account'}</small>${me ? esc(me.name) : 'Log in · Register'}</span><u aria-hidden="true"></u>`;
  if (me) {
    body.innerHTML = `<div class="ain"><small>${team ? 'The team’s account' : 'Signed in as'}</small><b>${esc(me.name)}</b>
      <p>${team ? 'Everything is unlocked for this account: every technique, clan and tool, and spins that use nothing up.' : 'Your techniques, clans, tickets and story are kept with this account.'}</p>
      <p class="amsg ok" id="amsg" aria-live="polite">${note || ''}</p>
      <button class="aseal" id="aout" type="button"><b lang="ja" aria-hidden="true">去</b><span>Log out</span></button>
      <p class="afine">${team ? 'This account signs in from any browser. What it has played is kept in the browser it was played in.' : 'Kept in this browser only.'}</p></div>`;
    return;
  }
  const up = tab === 'up';
  body.innerHTML = `<form class="aform" id="aform" novalidate>
      <div class="atabs"><button type="button" class="${up ? '' : 'on'}" data-tab="in">Log in</button><button type="button" class="${up ? 'on' : ''}" data-tab="up">Register</button></div>
      <label>Name<input id="aname" name="username" autocomplete="username" maxlength="20" spellcheck="false" autocapitalize="off" autocorrect="off"></label>
      <label>Password<input id="apass" name="password" type="password" autocomplete="${up ? 'new-password' : 'current-password'}" maxlength="64"></label>
      ${up ? '<label>Password, once more<input id="apass2" type="password" autocomplete="new-password" maxlength="64"></label>' : ''}
      <p class="amsg" id="amsg" aria-live="polite">${note || ''}</p>
      <button class="aseal" type="submit"><b lang="ja" aria-hidden="true">${up ? '記' : '入'}</b><span>${up ? 'Register' : 'Log in'}</span></button>
      <p class="afine">${up ? 'An account is kept in this browser only: it does not follow you to another device, and a forgotten password cannot be recovered. Use one you use nowhere else.'
        : 'Accounts are kept in this browser only. One made on another device is not here.'}</p>
    </form>`;
}
function open(on, quiet) {
  clearTimeout(shut);
  if (box.classList.contains('open') === on) return;
  box.classList.toggle('open', on); head.setAttribute('aria-expanded', on); body.inert = !on;       // rolled up, nothing inside it can be reached
  if (quiet) return;
  sfx.hover();
  if (on && !me && !matchMedia('(pointer:coarse)').matches) setTimeout(() => { const n = $('#aname'); if (n) n.focus({ preventScroll: true }); }, 60);
}

function register(name, pass) {
  const id = name.toLowerCase(), salt = hex(crypto.getRandomValues(new Uint8Array(8))), k = stretch(salt, pass);
  accounts[id] = { name, salt, v: proof(k), made: Date.now() };
  if (!write('ju.accounts', accounts) || !write('ju.session', { n: name, k })) { delete accounts[id]; return fail('This browser is not keeping saves, so an account cannot be made here.'); }
  drop('ju.save.' + GUEST);                                // what has been played so far goes with the new account: it is the guest's no longer
  me = accounts[id]; sfx.confirm();
  paint('Registered. What you have played so far is this account’s now.');
  shut = setTimeout(() => open(false, true), 3600);
}
function login(name, pass) {
  const r = rec(name);
  if (!r) return fail('No account by that name in this browser.');
  const k = stretch(r.salt, pass);
  if (proof(k) !== r.v) return fail('Wrong password.');
  try { swap(r.name.toLowerCase(), false); } catch (e) { return fail('This browser is not keeping saves.'); }
  write('ju.session', { n: r.name, k }); hello('in'); location.reload();
}
function logout() {
  try { swap(GUEST, true); } catch (e) {}
  drop('ju.session'); hello('out'); location.reload();
}
function submit() {
  if (busy || me) return;
  const name = $('#aname').value.trim(), pass = $('#apass').value, up = tab === 'up';
  if (!name || !pass) return fail('A name and a password.');
  if (up) {
    if (!NAME.test(name)) return fail('A name is 3 to 20 letters, numbers or _ and does not start with _.');
    if (rec(name)) return fail('That name is taken.');
    if (pass.length < MINPW) return fail('A password needs at least ' + MINPW + ' characters.');
    if (pass !== $('#apass2').value) return fail('The two passwords are not the same.');
  }
  busy = true; say('Reading the seal…', true);
  setTimeout(() => { busy = false; try { (up ? register : login)(name, pass); } catch (e) { fail('Something went wrong. Nothing was changed.'); } }, 40);   // (a moment first, so the line above is on screen while it works)
}

box.addEventListener('click', e => {
  const t = e.target.closest('[data-tab]');
  if (e.target.closest('#ahead')) { open(!box.classList.contains('open')); return; }
  if (t && !busy) { tab = t.dataset.tab; const n = $('#aname').value; sfx.hover(); paint(); $('#aname').value = n; $('#aname').focus({ preventScroll: true }); return; }
  if (e.target.closest('#aout')) { sfx.back(); logout(); }
});
box.addEventListener('submit', e => { e.preventDefault(); submit(); });
box.addEventListener('keydown', e => {                     // typing a name must not walk the menu behind it
  e.stopPropagation();
  if (e.key === 'Escape') { open(false); head.focus({ preventScroll: true }); }
});
box.addEventListener('pointerdown', () => clearTimeout(shut));
document.addEventListener('pointerdown', e => { if (box.classList.contains('open') && !box.contains(e.target)) open(false, true); });
addEventListener('storage', e => { if (e.key === 'ju.session') location.reload(); });       // signed in or out in another tab: this one follows

let note = '';
try { const v = sessionStorage.getItem('ju.hello'); sessionStorage.removeItem('ju.hello'); note = v === 'in' && me ? 'Signed in.' : v === 'out' && !me ? 'Logged out. Your progress stays with your account.' : ''; } catch (e) {}
paint(note);
if (note) { open(true, true); shut = setTimeout(() => open(false, true), 5200); }
})();
