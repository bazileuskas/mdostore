/* JUJUTSU UNLIMITEDS — the Shop: Cursed Tokens buy CT tickets, clan rolls and cursed tool spins, and the Daily Shop sells rare techniques
   and clans outright. Since the public release (PAID) a spin uses up a ticket of its own kind and a card equips only what has been rolled
   or bought, so this file also keeps the list of what he owns. The team's account (account.js) is exempt from all of it */
(() => {
'use strict';

const E = JU.eng, H = E.hooks, sfx = JU.sfx;
const PAID = true;                                  // the public release. false: tickets can be bought and kept, but a spin never needs one
const dev = () => !!(JU.account && JU.account.dev); // the team's account plays the way everybody did before the release
const paid = () => PAID && !dev();
const PRICE = 10, START = 100, WIN = 5, BOSS = 15;  // a ticket; what a new player starts with; what beating a curse or a boss pays
// Early Access and the packs are sold for real money, and nothing is being sold yet: their buttons do nothing. EARLY_OPEN would let
// everybody equip the early-access techniques in the meantime. Since the public release it is off, so only the team's account has them
// (S.ea is where owning Early Access would be kept, and S.dd the Dagger of the Demonly Holdings)
const EARLY_OPEN = false, EARLY_PRICE = '$2.99';
const ITEMS = { ct: { name: 'CT Ticket', jp: '封', col: '#8f9bff', what: 'One spin of the Cursed Technique talisman.' },
                cl: { name: 'Clan Roll', jp: '族', col: '#ff9a4d', what: 'One draw from the three clan talismans.' },
                tl: { name: 'Cursed Tool Spin', jp: '具', col: '#cfd8e0', what: 'One spin of the Cursed Tools reel.' } };
const WORD = { ct: ['CT ticket', 'CT tickets', 'roll'], cl: ['clan roll', 'clan rolls', 'draw'], tl: ['cursed tool spin', 'cursed tool spins', 'spin'] };
const S = { t: START, ct: 0, cl: 0, tl: 0, day: 0, got: [], own: null };
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
// a spin is about to happen: is it allowed? It costs a ticket of its own kind (nothing, for the team's account)
function take(kind) {
  if (!paid()) return true;
  if (S[kind] > 0) { S[kind]--; save(); return true; }
  return false;
}
// the line a spin screen shows under its talisman: how many of its tickets are left. no: he has just been turned away
function tix(kind, no) {
  const n = S[kind], w = WORD[kind];
  if (!paid()) return `<p class="tix" id="tix"><b>∞</b>${dev() ? 'Team account · ' : ''}${w[2]}s are free</p>`;
  return `<p class="tix${n ? '' : ' out'}${no ? ' no' : ''}" id="tix"><b>${n}</b>${n ? (n > 1 ? w[1] : w[0]) + ' · a ' + w[2] + ' uses one' : 'No ' + w[1] + ' · the Shop sells them, ' + PRICE + ' Cursed Tokens each'}</p>`;
}

/* ---------- what he owns ---------- */
// Before the public release a card equipped anything. Now a card equips what has been rolled or bought, so the save keeps a list.
// The first time an older save meets this, whatever it had equipped at that moment is counted as owned
function migrate() {
  if (S.own && S.own.tech && S.own.clan && S.own.tool) return;
  const T = JU.tech.TECH, t = JU.tech.equipped, c = JU.clan.equipped, own = S.own = { tech: [], clan: [], tool: [] };
  if (T[t] && !T[t].free && !T[t].early && !T[t].awakened) own.tech.push(t);
  if (JU.clan.CLAN[c]) own.clan.push(c);
  for (const id of JU.tools.state.slots) if (JU.tools.TOOLS[id] && !own.tool.includes(id)) own.tool.push(id);
  save();
}
const owns = (kind, id) => dev() || (kind === 'tech' && !!JU.tech.TECH[id] && !!JU.tech.TECH[id].free) || S.own[kind].includes(id);
function grant(kind, id) { if (!S.own[kind].includes(id)) { S.own[kind].push(id); save(); } }
const early = () => dev() || EARLY_OPEN || !!S.ea;
// may this technique be equipped? His own always; an early-access one if that has been bought; an awakened one if its own conditions
// are met (awaken.js keeps those); anything else if he owns it
function allowed(id) {
  const t = JU.tech.TECH[id];
  if (!t) return false;
  if (dev() || t.free) return true;
  if (t.early) return early();
  if (t.awakened) { const a = JU.awakened.LIST.find(x => x.id === id); return !!(a && a.open && a.open()); }
  return S.own.tech.includes(id);
}
// what is equipped has to be something he may equip. When the page loads, and whenever the clan changes (Sukuna's Mark leans on it),
// anything that is not is put down
let checking = false;
function check() {
  if (checking || dev()) return;
  checking = true;
  if (JU.clan.equipped && !owns('clan', JU.clan.equipped)) JU.clan.equip('');
  if (JU.tech.equipped && !allowed(JU.tech.equipped)) JU.tech.equip('');
  JU.tools.check(id => owns('tool', id), !!S.dd);
  checking = false;
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
    <p class="fine">${paid() ? 'A spin uses up one ticket of its own kind: a CT ticket for the technique talisman, a clan roll for a clan draw, a cursed tool spin for the reel. What a spin lands on is yours to keep.'
      : dev() ? 'Team account: spins are free and use nothing up.' : 'Spins are free for now, so a ticket is not used up when you roll.'}</p>`;
}
function daily() {
  if (S.day !== today()) { S.day = today(); S.got = []; save(); }
  return `<div class="goods">${offers().map((o, i) => { const d = o.d, p = cost(d.odds), got = S.got.includes(o.kind + ':' + o.id), mine = !got && owns(o.kind, o.id); return `<div class="good" style="--c:${d.col}">
      <small>${o.kind === 'tech' ? 'Technique' : 'Clan'} · ${d.odds}% from a roll</small><b lang="ja" aria-hidden="true">${d.mark || d.jp[0]}</b><h4>${d.name}</h4>
      <p>${o.kind === 'tech' ? d.who : 'The ' + d.name + ' clan'}</p>
      <div class="buy"><button class="${got ? 'sold' : mine ? 'mine' : S.t < p ? 'poor' : ''}" data-offer="${i}">${got ? 'Bought · equipped' : mine ? 'Yours already · equip' : coin + p + ' · Buy and equip'}</button></div>
    </div>`; }).join('')}</div>
    <p class="fine" id="shNext">${restock()}</p>`;
}
// Early Access: whatever technique is marked `early`, for real money. The button is there and, for now, does nothing at all
function earlyTab() {
  const T = JU.tech.TECH;
  return `<div class="goods">${JU.tech.ORDER.filter(id => T[id].early).map(id => { const d = T[id]; return `<div class="good ea" style="--c:${d.col}">
      <small>Early Access · Cursed Technique</small><b lang="ja" aria-hidden="true">${d.mark || d.jp[0]}</b><h4>${d.name}</h4>
      <p>${d.who}. ${JU.tech.SLOTS.map(k => d.moves[k].name).join(', ')}.</p>
      <div class="buy"><button class="cash" data-early="${id}" aria-label="Early Access to ${d.name}, ${EARLY_PRICE}">${EARLY_PRICE} · Early Access</button></div>
    </div>`; }).join('')}</div>
    <p class="fine">Early Access is not on sale yet, so this button does nothing for now.${dev() ? ' The team’s account has it already.' : EARLY_OPEN ? ' Until it is, the technique can be equipped from the Cursed Technique screen.' : ''}</p>`;
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
    ${tab === 'daily' ? daily() : tab === 'early' ? earlyTab() : tab === 'packs' ? packs() : tickets()}
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
  if (!o) return;                                   // the Daily Shop: the thing itself, his from then on and equipped on the spot
  const f = offers()[+o.dataset.offer], key = f.kind + ':' + f.id, p = cost(f.d.odds), r = o.getBoundingClientRect(), mine = owns(f.kind, f.id);
  if (S.got.includes(key)) return;
  if (!mine && S.t < p) { refuse(o); return; }
  if (!mine) { S.t -= p; S.got.push(key); grant(f.kind, f.id); }
  (f.kind === 'tech' ? JU.tech : JU.clan).equip(f.id); save(); draw();
  sfx.bf(); JU.flash(r.left + r.width / 2, r.top + r.height / 2); JU.bolts(r.left + r.width / 2, r.top + r.height / 2, 12);
});

// beating something pays: a little for a curse, more for a boss, nothing for the training dummy
const ko0 = H.ko;
H.ko = o => {
  const res = ko0(o), cfg = JU.fights.fight.cfg;
  if (cfg && !cfg.dummy && o.ai) earn(o.ai.d.kit ? BOSS : WIN, o);
  return res;
};

// The Maki boss fight costs 50 tokens a go (not for the team's account)
const FEES = { maki: 50 };
function fee(kind) {
  if (!paid()) return true;
  if (S.t < FEES[kind]) return false;
  S.t -= FEES[kind]; save();
  return true;
}
JU.shop = { mount, take, tix, earn, offers, fee, owns, grant, allowed, check, PACKS, FEES, PRICE,
  get PAID() { return paid(); }, get dev() { return dev(); }, get tokens() { return S.t; }, get owned() { return { ct: S.ct, cl: S.cl, tl: S.tl }; },
  get own() { return { tech: S.own.tech.slice(), clan: S.own.clan.slice(), tool: S.own.tool.slice() }; },
  get early() { return early(); },                  // may the early-access techniques be equipped?
  get demon() { return dev() || !!S.dd; } };        // and the dagger's other form?
migrate(); check(); sync();
})();
