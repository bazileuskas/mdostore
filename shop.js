/* JUJUTSU UNLIMITEDS — the Shop: Cursed Tokens buy CT tickets and clan rolls, and the Daily Shop sells rare techniques and clans outright.
   Spins are still free. PAID is the one switch that makes a spin use up a ticket, for when the game is released. */
(() => {
'use strict';

const E = JU.eng, H = E.hooks, sfx = JU.sfx;
const PAID = false;                                 // false: tickets can be bought and kept, but a spin never needs one
const PRICE = 10, START = 100, WIN = 5, BOSS = 15;  // a ticket; what a new player starts with; what beating a curse or a boss pays
// Early Access is sold for real money, and nothing is being sold yet: the button in the shop does nothing, and until it does
// EARLY_OPEN lets everybody equip the early-access technique. Set it to false once buying it is real (S.ea is where owning it would be kept)
const EARLY_OPEN = true, EARLY_PRICE = '$2.99';
const ITEMS = { ct: { name: 'CT Ticket', jp: '封', col: '#8f9bff', what: 'One spin of the Cursed Technique talisman.' },
                cl: { name: 'Clan Roll', jp: '族', col: '#ff9a4d', what: 'One draw from the three clan talismans.' } };
const S = { t: START, ct: 0, cl: 0, day: 0, got: [] };
let tab = 'tickets', clock = 0, home = null;
try { Object.assign(S, JSON.parse(localStorage.getItem('ju.shop') || '{}')); } catch (e) {}

function sync() {
  const w = document.querySelector('#wallet b'), s = document.getElementById('shTok');
  if (w) w.textContent = S.t;
  if (s) s.textContent = S.t;
}
const save = () => { try { localStorage.setItem('ju.shop', JSON.stringify(S)); } catch (e) {} sync(); };
function earn(n, o) {
  S.t += n; save();
  if (o) E.fx.push({ k: 2, x: o.x, y: 330, n: '+' + n + ' TOKENS', col: '#ffd23d', t: 0, life: 1.3 });
}
// a spin is about to happen: is it allowed? (Always, until PAID is switched on; then it costs a ticket)
function take(kind) {
  if (!PAID) return true;
  if (S[kind] > 0) { S[kind]--; save(); return true; }
  return false;
}

/* ---------- the Daily Shop: three rare things, different every day ---------- */
const today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);   // a day number that turns over at local midnight
const cost = odds => (odds >= 10 ? 60 : odds >= 4 ? 120 : odds >= 2 ? 200 : 600);              // the rarer it is from a roll, the more it costs
function rng(seed) {
  return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function offers() {
  const T = JU.tech.TECH, C = JU.clan.CLAN, r = rng(today() * 7919 + 13), pick = a => a.splice(r() * a.length | 0, 1)[0];
  const techs = JU.tech.ORDER.filter(id => T[id].odds <= 10 && !T[id].free && !T[id].early && !T[id].awakened && (!T[id].limited || Date.now() < T[id].limited)).map(id => ({ kind: 'tech', id, d: T[id] }));   // early access is never sold for tokens
  const clans = JU.clan.ORDER.filter(id => C[id].odds <= 10 && !C[id].limited).map(id => ({ kind: 'clan', id, d: C[id] }));
  const out = [pick(techs), pick(clans)];           // always one technique and one clan, and then one more of either
  out.push(pick(techs.concat(clans)));
  return out;
}
function restock() {
  const n = new Date(), m = Math.ceil((new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1) - n) / 6e4);
  return 'New stock in ' + (m >= 60 ? Math.floor(m / 60) + 'h ' + m % 60 + 'm' : m + 'm');
}

/* ---------- the counter ---------- */
const coin = '<i lang="ja" aria-hidden="true">呪</i>';
function tickets() {
  return `<div class="goods">${Object.keys(ITEMS).map(k => { const it = ITEMS[k]; return `<div class="good" style="--c:${it.col}">
      <b lang="ja" aria-hidden="true">${it.jp}</b><h4>${it.name}</h4><p>${it.what}</p><span class="own">Owned: ${S[k]}</span>
      <div class="buy">${[1, 10].map(n => `<button class="${S.t < PRICE * n ? 'poor' : ''}" data-buy="${k}" data-n="${n}">${coin}${PRICE * n} · Buy ${n}</button>`).join('')}</div>
    </div>`; }).join('')}</div>
    <p class="fine">Spins are free for now, so a ticket is not used up when you roll. They will be needed once the game is released.</p>`;
}
function daily() {
  if (S.day !== today()) { S.day = today(); S.got = []; save(); }
  return `<div class="goods">${offers().map((o, i) => { const d = o.d, p = cost(d.odds), got = S.got.includes(o.kind + ':' + o.id); return `<div class="good" style="--c:${d.col}">
      <small>${o.kind === 'tech' ? 'Technique' : 'Clan'} · ${d.odds}% from a roll</small><b lang="ja" aria-hidden="true">${d.mark || d.jp[0]}</b><h4>${d.name}</h4>
      <p>${o.kind === 'tech' ? d.who : 'The ' + d.name + ' clan'}</p>
      <div class="buy"><button class="${got ? 'sold' : S.t < p ? 'poor' : ''}" data-offer="${i}">${got ? 'Bought · equipped' : coin + p + ' · Buy and equip'}</button></div>
    </div>`; }).join('')}</div>
    <p class="fine" id="shNext">${restock()}</p>`;
}
// Early Access: whatever technique is marked `early`, for real money. The button is there and, for now, does nothing at all
function early() {
  const T = JU.tech.TECH;
  return `<div class="goods">${JU.tech.ORDER.filter(id => T[id].early).map(id => { const d = T[id]; return `<div class="good ea" style="--c:${d.col}">
      <small>Early Access · Cursed Technique</small><b lang="ja" aria-hidden="true">${d.mark || d.jp[0]}</b><h4>${d.name}</h4>
      <p>${d.who}. ${JU.tech.SLOTS.map(k => d.moves[k].name).join(', ')}.</p>
      <div class="buy"><button class="cash" data-early="${id}" aria-label="Early Access to ${d.name}, ${EARLY_PRICE}">${EARLY_PRICE} · Early Access</button></div>
    </div>`; }).join('')}</div>
    <p class="fine">Early Access is not on sale yet, so this button does nothing for now.${EARLY_OPEN ? ' Until it is, the technique can be equipped from the Cursed Technique screen.' : ''}</p>`;
}
/* ---------- packs: several things at once, for real money. Like Early Access, nothing is on sale yet: the button is there and does nothing ---------- */
// the picture on the Heian Era God pack is one the user supplied (img/heian-sukuna.jpg; the one-file build carries it in window.JU_PICS)
const HEIAN = `<img src="${(window.JU_PICS && window.JU_PICS['heian-sukuna']) || 'img/heian-sukuna.jpg'}" alt="Sukuna as he was in the Heian era, four-armed, his hands at the sign of his domain">`;
const PACK_PRICE = '$12.99';
const PACKS = [{ id: 'heian', name: 'Heian Era God', tag: 'God Pack · Ryomen Sukuna', price: PACK_PRICE, col: '#ff2440', pic: HEIAN,
  line: 'Everything the King of Curses had at his height, a thousand years ago, in one pack.',
  holds: [['Shrine', 'cursed technique'], ['Sukuna\'s Mark', 'awakened cursed technique'], ['Sukuna', 'clan'], ['Dagger of the Demonly Holdings', 'cursed tool'],
          ['50', 'Clan spins'], ['75', 'CT spins'], ['30', 'Cursed Tool spins']] }];
function packs() {
  return `<div class="goods">${PACKS.map(k => `<div class="good pack" style="--c:${k.col}">
      <div class="ppic">${k.pic}</div>
      <small>${k.tag}</small><h4>${k.name}</h4><p>${k.line}</p>
      <ul class="plist">${k.holds.map(h => `<li><b>${h[0]}</b> ${h[1]}</li>`).join('')}</ul>
      <div class="buy"><button class="cash god" data-pack="${k.id}" aria-label="${k.name} pack, ${k.price}">${k.price} · ${k.name} pack</button></div>
    </div>`).join('')}</div>
    <p class="fine">Packs are not on sale yet, so this button does nothing for now.</p>`;
}
function draw() {
  if (!home || !home.isConnected) return;
  const TABS = [['tickets', 'Tickets'], ['daily', 'Daily Shop'], ['packs', 'Packs'], ['early', 'Early Access']];
  home.innerHTML = `<div class="shop">
    <div class="purse">${coin}<b id="shTok">${S.t}</b><span>Cursed Tokens</span><em>Beat a curse: +${WIN} · Beat a boss: +${BOSS}</em></div>
    <div class="stabs">${TABS.map(t => `<button class="stab${tab === t[0] ? ' on' : ''}${t[0] === 'early' ? ' ea' : t[0] === 'packs' ? ' god' : ''}" data-tab="${t[0]}">${t[1]}</button>`).join('')}</div>
    ${tab === 'daily' ? daily() : tab === 'early' ? early() : tab === 'packs' ? packs() : tickets()}
  </div>`;
}
function mount(body) {
  home = body; draw();
  clearInterval(clock);
  clock = setInterval(() => { const n = document.getElementById('shNext'); if (!home.isConnected) clearInterval(clock); else if (n) n.textContent = restock(); }, 30000);
}
function refuse(b) { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); sfx.back(); }
document.addEventListener('click', e => {
  const t = e.target.closest('.stab'), b = e.target.closest('[data-buy]'), o = e.target.closest('[data-offer]');
  if (t) { tab = t.dataset.tab; sfx.hover(); draw(); return; }
  if (b) {                                          // tickets: one or ten
    const n = +b.dataset.n, r = b.getBoundingClientRect();
    if (S.t < PRICE * n) { refuse(b); return; }
    S.t -= PRICE * n; S[b.dataset.buy] += n; save(); draw();
    sfx.confirm(); JU.flash(r.left + r.width / 2, r.top + r.height / 2);
    return;
  }
  if (!o) return;                                   // the Daily Shop: the thing itself, equipped on the spot
  const f = offers()[+o.dataset.offer], key = f.kind + ':' + f.id, p = cost(f.d.odds), r = o.getBoundingClientRect();
  if (S.got.includes(key)) return;
  if (S.t < p) { refuse(o); return; }
  S.t -= p; S.got.push(key); (f.kind === 'tech' ? JU.tech : JU.clan).equip(f.id); save(); draw();
  sfx.bf(); JU.flash(r.left + r.width / 2, r.top + r.height / 2); JU.bolts(r.left + r.width / 2, r.top + r.height / 2, 12);
});

// beating something pays: a little for a curse, more for a boss, nothing for the training dummy
const ko0 = H.ko;
H.ko = o => {
  const res = ko0(o), cfg = JU.fights.fight.cfg;
  if (cfg && !cfg.dummy && o.ai) earn(o.ai.d.kit ? BOSS : WIN, o);
  return res;
};

sync();
// The Maki boss fight is to cost 50 tokens a go once tokens matter. Like the spins, it is free until PAID is switched on
const FEES = { maki: 50 };
function fee(kind) {
  if (!PAID) return true;
  if (S.t < FEES[kind]) return false;
  S.t -= FEES[kind]; save();
  return true;
}
JU.shop = { mount, take, earn, offers, fee, PAID, PACKS, get tokens() { return S.t; }, get owned() { return { ct: S.ct, cl: S.cl }; },
  get early() { return EARLY_OPEN || !!S.ea; } };  // may the early-access technique be equipped?
})();
