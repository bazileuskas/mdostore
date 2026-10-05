/* JUJUTSU UNLIMITEDS — clans: the roll, what each bloodline changes, and the hooks their abilities hang on */
(() => {
'use strict';

const E = JU.eng, H = E.hooks, Fi = JU.fights, sfx = JU.sfx, lerp = E.lerp;
const CLAN = {}, ORDER = [], NONE = {};
const st = { host: null };                       // host: a body that is not his own (Kenjaku's, or Sukuna's vessel)
let equipped = null, active = null, rolling = false, back = 0;
try { equipped = localStorage.getItem('ju.clan'); } catch (e) {}

// hp / ce / dmg / crit / m1s / tool are fractions: .1 = +10%. "Cursed energy" scales technique damage.
const add = (id, def) => { def.id = id; CLAN[id] = def; ORDER.push(id); };
add('kugisaki', { name: 'Kugisaki', jp: '釘崎', odds: 40, col: '#ff9a4d', hp: -.1, ce: .1, lines: ['+10% cursed energy', '-10% health'] });
add('fushiguro', { name: 'Fushiguro', jp: '伏黒', odds: 40, col: '#8f9bff', hp: -.05, ce: .03, dmg: .05, lines: ['+3% cursed energy', '+5% damage', '-5% health'] });
add('gojo', { name: 'Gojo', jp: '五条', odds: 10, col: '#38c8ff', ce: .3, crit: -.05, m1s: .2,
  lines: ['+30% cursed energy', '+20% basic attack speed', '-5% critical damage', 'With Limitless equipped: G opens Unlimited Void'], ability: 'R — the screen cracks like glass and you are standing where your mouse was' });
add('kenjaku', { name: 'Kenjaku', jp: '羂索', odds: 5, col: '#c77dff', hp: .3,
  lines: ['+30% health'], ability: 'R over a body — take it. Its technique, health, strength and speed are yours until you die' });
add('zenin', { name: 'Zenin', jp: '禪院', odds: 4.9, col: '#7ddc9a', hp: .15, tool: .3,
  lines: ['+15% health', 'Carries a cursed tool: +30% basic attack damage, longer reach'], ability: 'R — counter stance. A hit taken during it is turned aside and answered for 30' });
add('sukuna', { name: 'Sukuna', jp: '宿儺', odds: .1, col: '#ff2440', hp: .5,
  lines: ['+50% health', 'With Shrine equipped: +60% basic attack damage, +60% cursed energy, and G opens Malevolent Shrine'],
  ability: 'R near an enemy — choke hold, 80 damage in cleaves. Die and you become a finger: whatever killed you eats it and becomes your vessel (T takes over, V binding vow)' });

const X = () => (active && active.x) || NONE;    // the equipped clan's ability handlers (clan_a.js / clan_b.js)
const shrine = () => !!active && active.id === 'sukuna' && JU.tech.equipped === 'shrine';

/* ---------- what a clan does to the numbers ---------- */
H.power = (h, o) => {                            // multiplier on every hit the player lands
  if (!active || h.fixed) return 1;
  const m = E.P1.move, m1 = !!(m && m.def.m1), hs = st.host;
  let k = 1 + (active.dmg || 0);
  if (m1) k *= 1 + (active.tool || 0) + (shrine() ? .6 : 0) + (hs ? hs.m1 : 0);
  else k *= 1 + (active.ce || 0) + (shrine() ? .6 : 0) + (hs ? hs.ce : 0);
  if (X().power) k *= X().power(h, m1);
  if (k > 0 && Math.random() < .12) {            // critical hit
    k *= 1.5 * (1 + (active.crit || 0));
    E.fx.push({ k: 2, x: o.x, y: o.y + 330, n: 'CRIT', col: '#ffd23d', t: 0, life: .7 });
  }
  return k;
};
H.m1rate = () => (active ? 1 + (active.m1s || 0) + (st.host ? st.host.m1s : 0) : 1);
H.fightStart = (cfg, wave) => {
  if (!active) return;
  const p = E.P1, hs = st.host;
  if (!wave) { p.max = Math.round((hs ? hs.hp : 100) * (1 + (active.hp || 0))); p.hp = p.max; }
  p.skin = hs ? hs.skin : E.YUJI; p.scale = hs ? hs.scale : undefined;
  // outside the story he carries his clan's name, not his own: Yuji Gojo, Yuji Fushiguro. (A clan is only ever in play outside the story;
  // a body that is not his, or a technique that makes him somebody else, puts its own name up after this)
  Fi.nm.p1.textContent = hs ? hs.name : 'Yuji ' + active.name; Fi.nm.p1j.textContent = hs ? hs.jp : active.jp + '悠仁';
  if (X().start) X().start(p, cfg);
};
H.press = (a, inScene) => {                      // R = clan ability, T / V belong to Sukuna's vessel
  if (!active) return false;
  if (X().press && X().press(a, inScene)) return true;
  if (a === 'clan' && !inScene && X().r) X().r(E.P1);
  return a === 'clan' || a === 'takeover' || a === 'vow';
};
H.death = () => !!(active && X().death && X().death());

const guard0 = H.guard, aim0 = H.aim, tick0 = H.tick, fx0 = H.fx, post0 = H.post, under0 = H.under, reset0 = H.reset;
H.guard = (face, a) => !!(active && X().guard && X().guard(face, a)) || guard0(face, a);
H.aim = (p, h) => { h = aim0(p, h); return active && X().aim ? X().aim(p, h) : h; };
H.tick = dt => { tick0(dt); if (active && X().tick) X().tick(dt); };
H.fx = dt => { fx0(dt); if (active && X().fx) X().fx(dt); };
H.under = dt => { under0(dt); if (active && X().under) X().under(dt); };
H.post = dt => { post0(dt); if (active && X().post) X().post(dt); };
H.reset = () => { reset0(); revert(); };

const hintEl = document.getElementById('clanHint');
function hint() { hintEl.innerHTML = active ? `<b>${active.name} clan</b>${active.ability ? ' · ' + active.ability.split(' — ')[0] + ' ability' : ''}` : ''; }
function apply() { active = CLAN[equipped] || null; st.host = null; hint(); if (X().begin) X().begin(); }
function revert() { if (active && X().end) X().end(); active = null; st.host = null; hint(); }
function equip(id) {
  equipped = id; try { localStorage.setItem('ju.clan', id); } catch (e) {}
  if (id === 'toji' && JU.tech.equipped) JU.tech.equip('');   // the Toji clan has no cursed energy: taking it puts the technique down
  if (JU.shop && JU.shop.check) JU.shop.check();              // and anything that needed the clan he had goes with it
}

/* ---------- the Clan screen ---------- */
// a limited clan (def.limited = the moment it leaves) is drawn for first, at its own odds, for as long as it is here
const live = c => !c.limited || Date.now() < c.limited;
const left = c => {                                // to the second, the way a limited technique counts down
  const s = Math.floor((c.limited - Date.now()) / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), two = n => String(n).padStart(2, '0');
  return s <= 0 ? 'Ended' : 'Ends in ' + (d ? d + 'd ' : '') + (d || h ? two(h) + 'h ' : '') + two(Math.floor(s % 3600 / 60)) + 'm ' + two(s % 60) + 's';
};
setInterval(() => document.querySelectorAll('.ccard.lim').forEach(el => { const c = CLAN[el.dataset.clan], u = el.querySelector('u'); if (c && u) { u.textContent = left(c); el.classList.toggle('over', !live(c) && !mine(c.id)); } }), 1000);
const roll = () => {
  for (const id of ORDER) { const c = CLAN[id]; if (c.limited && live(c) && Math.random() * 100 < c.odds) return id; }
  let r = Math.random() * 100;
  for (const id of ORDER) if (!CLAN[id].limited && (r -= CLAN[id].odds) < 0) return id;
  return ORDER[0];
};
// since the public release a card equips only a clan he has drawn or bought (shop.js keeps the list)
const mine = id => !JU.shop || JU.shop.owns('clan', id);
const nope = el => { el.classList.remove('no'); void el.offsetWidth; el.classList.add('no'); sfx.back(); };
const retix = no => { const el = document.getElementById('tix'); if (el && JU.shop) el.outerHTML = JU.shop.tix('cl', no); };
const stats = c => `<ul>${c.lines.map(l => `<li>${l}</li>`).join('')}${c.ability ? `<li class="ab">${c.ability}</li>` : ''}</ul>`;
function show() {
  const c = CLAN[equipped], r = document.getElementById('cres');
  if (!r) return;
  r.innerHTML = c ? `<small>Your clan · ${c.odds}%${c.grade ? ' · ' + c.grade : ''}${c.limited ? ' · Limited time' : ''}</small><b style="color:${c.col}">${c.name}</b><span lang="ja">${c.jp}</span>${c.id === 'toji' ? '' : `<em>Outside the story you fight as Yuji ${c.name}</em>`}${stats(c)}`
    : `<small>No clan yet</small><p>${JU.shop && JU.shop.PAID ? 'Pick one of the three talismans to draw your bloodline: a draw uses a clan roll. A clan you have drawn before can be taken straight from its card.' : 'Pick one of the three talismans to draw your bloodline, or take a clan straight from the cards.'} Clans are used in Free Exploration.</p>`;
  document.querySelectorAll('.ccard').forEach(k => { k.classList.toggle('on', k.dataset.clan === equipped); k.classList.toggle('lock', !mine(k.dataset.clan)); });
}
function mount(body) {
  body.innerHTML = `<div class="roll papers">${[0, 1, 2].map(() => '<button class="paper cpaper" aria-label="Draw a clan"><b lang="ja">封</b><i>Draw</i></button>').join('')}
      <div class="rres" id="cres" aria-live="polite"></div></div>
    ${JU.shop ? JU.shop.tix('cl') : ''}
    ${ORDER.filter(id => CLAN[id].limited).map(id => { const c = CLAN[id]; return `<button class="ccard lim${live(c) || mine(id) ? '' : ' over'}${mine(id) ? '' : ' lock'}" data-clan="${id}" style="--c:${c.col}" aria-label="Take the ${c.name} clan, limited time"><b lang="ja">${c.jp[0]}</b><span><small>Limited time${c.grade ? ' · ' + c.grade : ''}</small>${c.name} clan</span><i>${c.odds}%</i><u>${left(c)}</u></button>`; }).join('')}
    <div class="tcards">${ORDER.filter(id => !CLAN[id].limited).map(id => { const c = CLAN[id]; return `<button class="ccard${mine(id) ? '' : ' lock'}" data-clan="${id}" style="--c:${c.col}" aria-label="Take the ${c.name} clan${mine(id) ? '' : ', not yours yet'}"><b lang="ja">${c.jp[0]}</b><span>${c.name}</span><i>${c.odds}%</i></button>`; }).join('')}</div>`;
  show();
}

// the draw: the chosen talisman flies to the middle of the screen, spins through every bloodline, and lands
// a card that is not his: it says how it is come by, and then the screen goes back to the clan he has
function sealed(c) {
  const r = document.getElementById('cres');
  if (!r) return;
  const how = c.limited ? (live(c) ? `Here for a limited time: draw it from a talisman (${c.odds}%) before it leaves.` : 'Its time is over. It cannot be drawn any more.') : `Draw it from a talisman (${c.odds}%)${c.odds <= 10 ? ', or look for it in the Daily Shop' : ''}.`;
  r.innerHTML = `<small>Sealed · not yours yet</small><b style="color:${c.col}">${c.name}</b><span lang="ja">${c.jp}</span><p>${how}</p>`;
  clearTimeout(back); back = setTimeout(show, 3400);
}
function cinema(src) {
  if (rolling) return;
  if (JU.shop && !JU.shop.take('cl')) { nope(src); retix(true); return; }      // no clan roll, no draw
  rolling = true; clearTimeout(back); retix();
  const result = roll(), c = CLAN[result], r0 = src.getBoundingClientRect(), rare = c.odds <= 1;
  const ov = document.createElement('div');
  ov.className = 'creveal';
  ov.innerHTML = '<div class="crays"></div><div class="cp"><b lang="ja">封</b><i></i></div><div class="cinfo"></div>';
  document.body.appendChild(ov);
  const cp = ov.children[1], face = cp.firstChild, sub = cp.lastChild, info = ov.lastChild;
  const cx = innerWidth / 2, cy = innerHeight * .42, x0 = r0.left + r0.width / 2, y0 = r0.top + r0.height / 2;
  const t0 = performance.now(), fly = JU.reduceMotion ? 1 : 750, spin = JU.reduceMotion ? 300 : rare ? 5600 : 4000, turns = rare ? 17 : 12;
  let last = -1;
  src.style.visibility = 'hidden';
  requestAnimationFrame(() => ov.classList.add('in'));
  const land = () => {
    if (JU.shop) JU.shop.grant('clan', result);       // what it lands on is his from now on
    equip(result);
    face.textContent = c.jp[0]; sub.textContent = c.name; ov.style.setProperty('--c', c.col);
    cp.style.transform = ''; cp.classList.remove('back'); cp.classList.add('got'); ov.classList.add('done');
    info.innerHTML = `<small>${c.odds}% · clan</small><b>${c.name}</b><span lang="ja">${c.jp}</span>${stats(c)}<em>Click to continue</em>`;
    JU.flash(cx, cy); JU.bolts(cx, cy, rare ? 44 : c.odds <= 5 ? 26 : c.odds <= 10 ? 16 : 9);
    if (c.odds <= 10) sfx.bf(); else sfx.confirm();
    const onKey = e => { if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); close(); } };
    const close = () => { removeEventListener('keydown', onKey, true); ov.remove(); src.style.visibility = ''; rolling = false; show(); };
    setTimeout(() => { ov.addEventListener('click', close); addEventListener('keydown', onKey, true); }, 600);
  };
  (function step(now) {
    const t = now - t0;
    if (t < fly) {                               // lift off the page and come to the centre
      const u = t / fly, e = u * u * (3 - 2 * u);
      cp.style.transform = `translate(${lerp(x0 - cx, 0, e)}px, ${lerp(y0 - cy, 0, e)}px) scale(${lerp(r0.height / cp.offsetHeight, 1, e)}) rotateY(${e * 360}deg)`;
    } else {
      const u = Math.min(1, (t - fly) / spin), e = 1 - Math.pow(1 - u, 3.4), ang = e * turns * 360, half = Math.floor((ang + 90) / 180);
      cp.style.transform = `rotateY(${ang}deg) rotateX(${Math.sin(u * 9) * 16 * (1 - u)}deg) rotateZ(${Math.sin(u * 37) * 10 * (1 - u)}deg) scale(${1 + .3 * Math.sin(u * Math.PI) + .06 * Math.sin(u * 70) * (1 - u)})`;
      ov.style.setProperty('--spin', ang * .25 + 'deg');
      if (half !== last) {                       // a different bloodline on the face every half turn
        last = half;
        const k = CLAN[half >= turns * 2 - 1 ? result : ORDER[Math.random() * ORDER.length | 0]];
        face.textContent = k.jp[0]; sub.textContent = k.name; ov.style.setProperty('--c', k.col);
        cp.classList.toggle('back', half % 2 === 1); sfx.hover();
      }
      if (u >= 1) return land();
    }
    requestAnimationFrame(step);
  })(t0);
}
document.addEventListener('click', e => {
  const p = e.target.closest('.cpaper'), k = e.target.closest('.ccard');
  if (p) cinema(p);
  else if (k && !rolling && !mine(k.dataset.clan)) { nope(k); sealed(CLAN[k.dataset.clan]); }      // not his: never drawn, never bought
  else if (k && !rolling && (live(CLAN[k.dataset.clan]) || (JU.shop && JU.shop.owns('clan', k.dataset.clan)))) { const r = k.getBoundingClientRect(); clearTimeout(back); equip(k.dataset.clan); show(); sfx.confirm(); JU.flash(r.left + r.width / 2, r.top + r.height / 2); }
});

JU.clan = {
  CLAN, ORDER, mount, apply, revert, equip, roll, st,
  ext(id, x) { CLAN[id].x = x; },               // ability handlers: r, press, tick, fx, under, post, guard, aim, power, start, death, street, begin, end
  key: a => H.press(a, true),
  street(dt) { if (active && X().street) X().street(dt); },
  body: () => st.host,
  get active() { return active; }, get equipped() { return equipped; }, get name() { const c = CLAN[equipped]; return c ? c.name : ''; }
};
})();
