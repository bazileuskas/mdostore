/* JUJUTSU UNLIMITEDS — the Shop: Cursed Tokens buy CT tickets, clan rolls and cursed tool spins, and the Daily Shop sells rare techniques
   and clans outright. Since the public release (PAID) a spin uses up a ticket of its own kind.
   This file also keeps what he holds. A player has three slots for cursed techniques and three for clans. A spin goes into the slot that is
   selected, in place of what was there ("spinning it off"), and anything as rare as 10% is asked about twice first. A limited one never goes
   into the three: it gets a slot of its own, and cannot be spun off. An early-access one sits in a free slot of its own too, and stays there
   when its character is released in full; that one can be spun off, and the slot goes with it.
   The team's account (account.js) is exempt from the tickets and the locks, not from the slots */
(() => {
'use strict';

const E = JU.eng, H = E.hooks, sfx = JU.sfx;
const PAID = true;                                  // the public release. false: tickets can be bought and kept, but a spin never needs one
const dev = () => !!(JU.account && JU.account.dev); // the team's account plays the way everybody did before the release
const paid = () => PAID && !dev();
const PRICE = 10, START = 100, WIN = 5, BOSS = 15;  // a ticket; what a new player starts with; what beating a curse or a boss pays
const BASE = 3, RARE = 10;                          // slots of each kind; and the odds at or under which spinning something off is asked about twice
// Early Access and the packs are sold for real money, and nothing is being sold yet: their buttons do nothing. EARLY_OPEN would let
// everybody equip the early-access techniques in the meantime. Since the public release it is off, so only the team's account has them
// (S.ea is where owning one is kept, and S.dd the Dagger of the Demonly Holdings)
const EARLY_OPEN = false, EARLY_PRICE = '$2.99';
const ITEMS = { ct: { name: 'CT Ticket', jp: '封', col: '#8f9bff', what: 'One spin of the Cursed Technique talisman.' },
                cl: { name: 'Clan Roll', jp: '族', col: '#ff9a4d', what: 'One draw from the three clan talismans.' },
                tl: { name: 'Cursed Tool Spin', jp: '具', col: '#cfd8e0', what: 'One spin of the Cursed Tools reel.' } };
const WORD = { ct: ['CT ticket', 'CT tickets', 'roll'], cl: ['clan roll', 'clan rolls', 'draw'], tl: ['cursed tool spin', 'cursed tool spins', 'spin'] };
const KIND = { tech: { one: 'technique', verb: 'roll', defs: () => JU.tech.TECH, eq: () => JU.tech.equipped, equip: id => JU.tech.equip(id) },
               clan: { one: 'clan', verb: 'draw', defs: () => JU.clan.CLAN, eq: () => JU.clan.equipped, equip: id => JU.clan.equip(id) } };
const S = { t: START, ct: 0, cl: 0, tl: 0, day: 0, got: [], own: null, slots: null, lim: null, ea: null, sel: null };
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
const has = kind => !paid() || S[kind] > 0;
function give(kind, n) { if (ITEMS[kind]) { S[kind] += n; save(); } }      // tickets won, not bought: a raid pays in them
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

/* ---------- what he holds ---------- */
// Older saves: before the public release nothing was kept (whatever was equipped counts as his); build 0.3 kept a plain list of what he
// owned. Either becomes slots here, once: the limited ones into slots of their own, and of the rest what was equipped and then the rarest
// go into the three
function migrate() {
  const was = S.own || {};
  if (!S.own || !Array.isArray(S.own.tool)) {
    const tools = [];
    for (const id of JU.tools.state.slots) if (JU.tools.TOOLS[id] && !tools.includes(id)) tools.push(id);
    S.own = { tool: tools, tech: was.tech, clan: was.clan };
  }
  if (!Array.isArray(S.ea && S.ea.tech) || !Array.isArray(S.ea.clan)) S.ea = { tech: [], clan: [] };
  if (S.slots && S.lim && S.sel && Array.isArray(S.slots.tech) && Array.isArray(S.slots.clan)) { delete S.own.tech; delete S.own.clan; return; }
  const T = JU.tech.TECH, pool = { tech: (S.own.tech || []).slice(), clan: (S.own.clan || []).slice() };
  if (!S.own.tech) { const t = JU.tech.equipped; if (T[t] && !T[t].free && !T[t].early && !T[t].awakened) pool.tech.push(t); }
  if (!S.own.clan && JU.clan.CLAN[JU.clan.equipped]) pool.clan.push(JU.clan.equipped);
  S.slots = { tech: [], clan: [] }; S.lim = { tech: [], clan: [] }; S.sel = { tech: 'b0', clan: 'b0' };
  for (const kind in KIND) {
    const D = KIND[kind].defs(), eq = KIND[kind].eq(), ids = pool[kind].filter((id, i, a) => D[id] && a.indexOf(id) === i);
    const rest = ids.filter(id => !D[id].limited && !D[id].early && !D[id].awakened && !D[id].free).sort((a, b) => (b === eq) - (a === eq) || D[a].odds - D[b].odds).slice(0, BASE);
    S.lim[kind] = ids.filter(id => D[id].limited);
    S.slots[kind] = Array.from({ length: BASE }, (_, i) => rest[i] || null);
    S.sel[kind] = S.lim[kind].includes(eq) ? 'l:' + eq : 'b' + Math.max(0, rest.indexOf(eq));
  }
  delete S.own.tech; delete S.own.clan;
  save();
}
// every slot he has of a kind: the three, then one for each limited thing he holds, then one for each early-access thing
function slotsOf(kind) {
  const D = KIND[kind].defs(), out = [];
  for (let i = 0; i < BASE; i++) { const id = S.slots[kind][i]; out.push({ key: 'b' + i, id: D[id] ? id : null, type: 'base', n: i + 1 }); }
  for (const id of S.lim[kind]) if (D[id]) out.push({ key: 'l:' + id, id, type: 'lim', n: out.length + 1 });
  for (const id of S.ea[kind]) if (D[id]) out.push({ key: 'e:' + id, id, type: 'ea', n: out.length + 1 });
  return out;
}
const holds = (kind, id) => !!id && slotsOf(kind).some(s => s.id === id);
const owns = (kind, id) => dev() || (kind === 'tool' ? S.own.tool.includes(id) : (kind === 'tech' && !!JU.tech.TECH[id] && !!JU.tech.TECH[id].free) || holds(kind, id));
function grant(kind, id) { if (kind === 'tool' && !S.own.tool.includes(id)) { S.own.tool.push(id); save(); } }
const picked = kind => { const all = slotsOf(kind); return all.find(s => s.key === S.sel[kind]) || all[0]; };
function pick(kind, key) { if (slotsOf(kind).some(s => s.key === key) && S.sel[kind] !== key) { S.sel[kind] = key; save(); } }
// where something bought would go: one of the three that is empty if there is one, or else the one that is selected
function target(kind) { const three = slotsOf(kind).filter(s => s.type === 'base'), s = picked(kind); return three.find(x => !x.id) || (s.type === 'base' ? s : three[0]); }
// something has been rolled or bought. A limited one gets a slot of its own; anything else goes into the slot named (or the one selected),
// in place of what was there. Gives back where it went, and what was lost to it
function place(kind, id, key) {
  const D = KIND[kind].defs();
  if (D[id].limited) { if (!S.lim[kind].includes(id)) S.lim[kind].push(id); S.sel[kind] = 'l:' + id; save(); return { key: 'l:' + id, lost: null }; }
  const s = slotsOf(kind).find(x => x.key === (key || S.sel[kind])), at = s && s.type === 'base' ? +s.key.slice(1) : target(kind).n - 1, lost = S.slots[kind][at];
  S.slots[kind][at] = id; S.sel[kind] = 'b' + at; save();
  return { key: 'b' + at, lost: lost && lost !== id ? lost : null };
}
// an early-access thing spun off: it goes, and the free slot it had goes with it
function giveUp(kind, key) {
  const id = key.slice(2);
  S.ea[kind] = S.ea[kind].filter(x => x !== id); S.sel[kind] = 'b0'; save(); check();
}
// what pressing spin would do to the slot that is selected: { slot, stop: why it cannot be spun at all, ea: it is a free slot being given up,
// ask: what has to be answered first }
function plan(kind) {
  const K = KIND[kind], s = picked(kind), d = s.id ? K.defs()[s.id] : null;
  if (s.type === 'lim') return { slot: s, stop: `${d.name} is limited: it keeps a slot of its own and cannot be spun off. Select another slot to ${K.verb} into.` };
  if (s.type === 'ea') return { slot: s, ea: true, ask: [
    { title: `Give up ${d.name}?`, text: `It sits in a free extra slot. Spinning it off takes the ${K.one} and the slot with it. Nothing is rolled in its place, and no ticket is used.`, yes: 'Spin it off', no: 'Keep it' },
    { title: 'Are you sure?', text: `${d.name} and its slot will both be gone. The slot does not come back.`, yes: 'Yes, give it up', no: 'Keep it' }] };
  if (d && d.odds <= RARE) return { slot: s, ask: [
    { title: `Spin off ${d.name}?`, text: `${d.name} is a ${d.odds}% ${K.one}. A ${K.verb} into slot ${s.n} takes its place, and it will be gone.`, yes: 'Spin it off', no: 'Keep it' },
    { title: 'Are you sure?', text: `There is no getting ${d.name} back, short of ${K.verb}ing it again.`, yes: 'Yes, spin it off', no: 'Keep it' }] };
  return { slot: s };
}
// a question that has to be answered before something is lost. Given several it puts them one after another, and anything but yes to
// every one of them is no
function ask(list) {
  return new Promise(done => {
    const ov = document.createElement('div'), panel = document.getElementById('panel'), was = panel.inert;
    let i = 0;
    const end = v => { removeEventListener('keydown', onKey, true); ov.remove(); panel.inert = was; done(v); };
    const onKey = e => {                            // Escape is no. Nothing typed here reaches the screen behind
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); sfx.back(); end(false); }
      else if (e.key !== 'Tab' && e.key !== 'Enter' && e.key !== ' ') e.stopPropagation();
    };
    const put = () => {
      const q = list[i];
      ov.innerHTML = `<div class="ask" role="alertdialog" aria-modal="true" aria-labelledby="askT"><b lang="ja" aria-hidden="true">${q.mark || '断'}</b>
        <small>${q.tag || (list.length > 1 ? `Asked twice · ${i + 1} of ${list.length}` : 'Before you do')}</small><h3 id="askT">${q.title}</h3><p>${q.text}</p>
        <div class="askb"><button class="keep" data-a="no">${q.no || 'Cancel'}</button><button class="go" data-a="yes">${q.yes || 'Yes'}</button></div></div>`;
      ov.querySelector(q.lead ? '.go' : '.keep').focus({ preventScroll: true });      // the safe answer is the one under his hand (unless the question is an invitation)
    };
    ov.className = 'askov';
    ov.addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      if (b.dataset.a === 'no') { sfx.back(); end(false); } else if (++i < list.length) { sfx.hover(); put(); } else { sfx.confirm(); end(true); }
    });
    panel.inert = true; document.body.appendChild(ov); addEventListener('keydown', onKey, true); put();
  });
}
// the row of slots a spin screen shows: which is selected (the next spin goes there), and which holds what he has equipped
function row(kind) {
  const K = KIND[kind], D = K.defs(), sel = picked(kind).key, eq = K.eq();
  return `<div class="pockets hold" id="hold">${slotsOf(kind).map(s => { const d = s.id ? D[s.id] : null, on = s.key === sel; return `<button class="pocket hslot${on ? ' on' : ''}${d && s.id === eq ? ' eq' : ''}${s.type === 'base' ? '' : ' ' + s.type}${d ? '' : ' empty'}" data-kind="${kind}" data-slot="${s.key}" data-id="${s.id || ''}" style="--c:${d ? d.col : '#555'}" aria-pressed="${on}" aria-label="Slot ${s.n}: ${d ? d.name : 'empty'}${on ? ', selected' : ''}">
      <small>${s.type === 'lim' ? 'Limited' : s.type === 'ea' ? 'Early Access' : 'Slot ' + s.n}${d && s.type !== 'ea' ? ' · ' + d.odds + '%' : ''}</small><b>${d ? d.name : 'Empty'}</b>
      <i>${s.type === 'lim' ? 'Cannot be spun off' : s.type === 'ea' ? (on ? 'Spun off, its slot goes too' : 'A free slot') : on ? 'Next ' + K.verb + ' lands here' + (d && d.odds <= RARE ? ' · asks twice' : '') : 'Press to select'}</i></button>`; }).join('')}</div>`;
}

/* ---------- may it be equipped ---------- */
// His own always; an awakened one if its own conditions are met (awaken.js keeps those); anything else if he holds it in a slot
function allowed(id) {
  const t = JU.tech.TECH[id];
  if (!t) return false;
  if (dev() || t.free || (t.early && EARLY_OPEN)) return true;
  if (t.awakened) { const a = JU.awakened.LIST.find(x => x.id === id); return !!(a && a.open && a.open()); }
  return holds('tech', id);
}
// what is equipped has to be something he may equip. When the page loads, and whenever a clan or a slot changes (Sukuna's Mark leans on
// his clan, an awakened technique on the one it awakens), anything that is not is put down
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
    <p class="fine">${paid() ? 'A spin uses up one ticket of its own kind: a CT ticket for the technique talisman, a clan roll for a clan draw, a cursed tool spin for the reel. A technique or a clan lands in the slot you have selected, in place of what was there.'
      : dev() ? 'Team account: spins are free and use nothing up.' : 'Spins are free for now, so a ticket is not used up when you roll.'}</p>`;
}
// where a thing on sale would go if it were bought now, in words
function goes(o) {
  if (o.d.limited) return 'Limited: it gets a slot of its own';
  const t = target(o.kind), was = t.id ? KIND[o.kind].defs()[t.id] : null;
  return was ? `Goes into slot ${t.n}, in place of ${was.name}` : `Goes into slot ${t.n}, which is empty`;
}
function daily() {
  if (S.day !== today()) { S.day = today(); S.got = []; save(); }
  return `<div class="goods">${offers().map((o, i) => { const d = o.d, p = cost(d.odds), got = S.got.includes(o.kind + ':' + o.id), mine = !got && owns(o.kind, o.id); return `<div class="good" style="--c:${d.col}">
      <small>${o.kind === 'tech' ? 'Technique' : 'Clan'} · ${d.odds}% from a roll</small><b lang="ja" aria-hidden="true">${d.mark || d.jp[0]}</b><h4>${d.name}</h4>
      <p>${o.kind === 'tech' ? d.who : 'The ' + d.name + ' clan'}</p>${got || mine ? '' : `<span class="own">${goes(o)}</span>`}
      <div class="buy"><button class="${got ? 'sold' : mine ? 'mine' : S.t < p ? 'poor' : ''}" data-offer="${i}">${got ? 'Bought · equipped' : mine ? 'Yours already · equip' : coin + p + ' · Buy and equip'}</button></div>
    </div>`; }).join('')}</div>
    <p class="fine" id="shNext">${restock()}</p>`;
}
// Early Access: whatever technique is marked `early`, for real money. The button is there and, for now, does nothing at all.
// (The team's account gets a second one, so that the free slot an early-access technique sits in can be tried out)
function earlyTab() {
  const T = JU.tech.TECH;
  return `<div class="goods">${JU.tech.ORDER.filter(id => T[id].early).map(id => { const d = T[id]; return `<div class="good ea" style="--c:${d.col}">
      <small>Early Access · Cursed Technique</small><b lang="ja" aria-hidden="true">${d.mark || d.jp[0]}</b><h4>${d.name}</h4>
      <p>${d.who}. ${JU.tech.SLOTS.map(k => d.moves[k].name).join(', ')}.</p>
      <div class="buy"><button class="cash" data-early="${id}" aria-label="Early Access to ${d.name}, ${EARLY_PRICE}">${EARLY_PRICE} · Early Access</button>
        ${dev() ? `<button class="mine" data-eatry="${id}">${S.ea.tech.includes(id) ? 'Team only · take its slot away' : 'Team only · give it its free slot'}</button>` : ''}</div>
    </div>`; }).join('')}</div>
    <p class="fine">Early Access is not on sale yet, so this button does nothing for now. A technique bought in Early Access sits in a free slot of its own, and keeps it when its character is released in full.${dev() ? ' The team’s account can use every one of them already.' : EARLY_OPEN ? ' Until it is, the technique can be equipped from the Cursed Technique screen.' : ''}</p>`;
}
/* ---------- packs: several things at once, for real money. Like Early Access, nothing is on sale yet: the button is there and does nothing ---------- */
// the picture on the Heian Era God pack is one the user supplied (img/heian-sukuna.jpg; the one-file build carries it in window.JU_PICS)
const HEIAN = `<img src="${(window.JU_PICS && window.JU_PICS['heian-sukuna']) || 'img/heian-sukuna.jpg'}" alt="King of Curses as he was in the Heian era, four-armed, his hands at the sign of his domain">`;
const PACK_PRICE = '$12.99';
const PACKS = [{ id: 'heian', name: 'Heian Era God', tag: 'God Pack · King of Curses', price: PACK_PRICE, col: '#ff2440', pic: HEIAN,
  line: 'Everything the King of Curses had at his height, a thousand years ago, in one pack.',
  holds: [['Shrine', 'cursed technique'], ['King of Curses\'s Mark', 'awakened cursed technique'], ['King of Curses', 'clan'], ['Dagger of the Demonly Holdings', 'cursed tool'],
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
let asking = false;
document.addEventListener('click', e => {
  const t = e.target.closest('.stab'), b = e.target.closest('[data-buy]'), o = e.target.closest('[data-offer]'), ea = e.target.closest('[data-eatry]');
  if (asking) return;
  if (t) { tab = t.dataset.tab; sfx.hover(); draw(); return; }
  if (b) {                                          // tickets: one or ten
    const n = +b.dataset.n, r = b.getBoundingClientRect();
    if (S.t < PRICE * n) { refuse(b); return; }
    S.t -= PRICE * n; S[b.dataset.buy] += n; save(); draw();
    sfx.confirm(); JU.flash(r.left + r.width / 2, r.top + r.height / 2);
    return;
  }
  if (ea && dev()) {                                // the team trying the free slot out
    const id = ea.dataset.eatry;
    if (S.ea.tech.includes(id)) giveUp('tech', 'e:' + id); else { S.ea.tech.push(id); save(); }
    sfx.confirm(); draw();
    return;
  }
  if (!o) return;                                   // the Daily Shop: the thing itself, into a slot and equipped on the spot
  const f = offers()[+o.dataset.offer], K = KIND[f.kind], key = f.kind + ':' + f.id, p = cost(f.d.odds), r = o.getBoundingClientRect(), mine = owns(f.kind, f.id);
  if (S.got.includes(key)) return;
  const done = () => { K.equip(f.id); save(); draw(); sfx.bf(); JU.flash(r.left + r.width / 2, r.top + r.height / 2); JU.bolts(r.left + r.width / 2, r.top + r.height / 2, 12); };
  if (mine) { done(); return; }
  if (S.t < p) { refuse(o); return; }
  const tgt = target(f.kind), was = !f.d.limited && tgt.id ? K.defs()[tgt.id] : null;
  const buy = () => { S.t -= p; S.got.push(key); place(f.kind, f.id, tgt.key); done(); };
  if (!was) { buy(); return; }                      // it would take something's place: say what, and for something rare say it twice
  const qs = [{ title: `Replace ${was.name}?`, text: `${f.d.name} goes into slot ${tgt.n}, and ${was.name} (${was.odds}%) will be gone.`, yes: 'Buy and replace', no: 'Cancel' }];
  if (was.odds <= RARE) qs.push({ title: 'Are you sure?', text: `There is no getting ${was.name} back, short of ${K.verb}ing it again.`, yes: 'Yes, replace it', no: 'Cancel' });
  asking = true; ask(qs).then(yes => { asking = false; if (yes) buy(); });
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
JU.shop = { mount, take, has, give, tix, earn, offers, fee, owns, holds, grant, allowed, check, slotsOf, pick, place, plan, ask, row, giveUp, PACKS, FEES, PRICE, RARE,
  get PAID() { return paid(); }, get dev() { return dev(); }, get tokens() { return S.t; }, get owned() { return { ct: S.ct, cl: S.cl, tl: S.tl }; },
  get state() { return { slots: { tech: S.slots.tech.slice(), clan: S.slots.clan.slice() }, lim: { tech: S.lim.tech.slice(), clan: S.lim.clan.slice() }, ea: { tech: S.ea.tech.slice(), clan: S.ea.clan.slice() }, sel: Object.assign({}, S.sel), tool: S.own.tool.slice() }; },
  get demon() { return dev() || !!S.dd; } };        // may the dagger's other form be used?
migrate(); check(); sync();
})();
