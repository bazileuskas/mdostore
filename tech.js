/* JUJUTSU UNLIMITEDS — cursed techniques: the roll, what is equipped, and the plumbing every technique shares */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, H = E.hooks, LINE = E.LINE, sfx = JU.sfx;
const SLOTS = ['strikes', 'crush', 'div', 'manji'], TECH = {}, ORDER = [];
const BASE = { cd: Object.assign({}, E.CD), names: {} };
for (const k of SLOTS) BASE.names[k] = E.hud.mv[k].querySelector('b').textContent;
let equipped = null, active = null, based = false, spinning = false, asking = false, clock = 0, back = 0;   // based: the free Yuji card is what is equipped, and in use
const noToji = id => { if (id && JU.clan && JU.clan.equipped === 'toji') JU.clan.equip(''); };   // and taking a technique gives the Toji clan up
try { equipped = localStorage.getItem('ju.tech'); } catch (e) {}

// glow colours the techniques need on top of the engine's own
function mk(rgb) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.2, `rgba(${rgb},.85)`); gr.addColorStop(.5, `rgba(${rgb},.2)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return c;
}
Object.assign(E.GLOW, { green: mk('125,220,106'), gold: mk('255,210,61'), teal: mk('120,230,200'), indigo: mk('143,155,255'), white: mk('255,255,255') });

// def: { name, jp, who, odds, col, glow, moves: { strikes, crush, div, manji }, dash?, m1?(i), aim?(p, h), guard?(face, a), tick?(dt) }
const add = (id, def) => { def.id = id; TECH[id] = def; ORDER.push(id); };
// Yuji, as a technique of his own: free, never rolled, always there. Equipping it is fighting with the moves everybody starts with
add('yuji', { name: 'The Vessel', jp: '器', mark: '拳', who: 'Cursed Strikes, Divergent Fist and Black Flash', odds: 0, col: '#ff7a59', glow: 'blue', free: true, base: true,
  moves: Object.fromEntries(SLOTS.map(k => [k, { name: BASE.names[k], cd: BASE.cd[k] }])) });

/* ---------- equipping ---------- */
function label(set) {
  for (const k of SLOTS) { E.hud.mv[k].querySelector('b').textContent = set ? set[k].name : BASE.names[k]; E.CD[k] = set ? set[k].cd : BASE.cd[k]; E.cd[k] = 0; }
}
function apply(id) {
  const t = TECH[id || equipped];
  if (!t) return;
  if (t.base) { revert(); based = true; return; }   // nothing to put on: his own moves are the technique
  based = false; active = t; label(t.moves); E.CD.dash = t.dash || BASE.cd.dash; JU.sukuna.style = t.id === 'shrine';
  hintEl.innerHTML = t.hint || ''; E.root.dataset.tech = t.id;      // a technique with something to explain says it under the controls
  awk = t.awaken ? (t.awkStart === undefined ? 50 : t.awkStart) : 0; bar(); awkEl.classList.toggle('on', !!t.awaken);
}
function revert() {
  based = false;
  if (!active) return;
  active = null; label(null); E.CD.dash = BASE.cd.dash; JU.sukuna.style = false; hintEl.innerHTML = ''; E.root.dataset.tech = '';
  awkEl.classList.remove('on', 'full');
}

const move0 = H.move, reset0 = H.reset, tick0 = H.tick, under0 = H.under;
H.move = k => move0(k) || (active ? active.moves[k] : null);
H.m1 = i => !(active && active.m1) || active.m1(i);
H.aim = (p, h) => (active && active.aim ? active.aim(p, h) : h);
H.guard = (face, a) => !!(active && active.guard && active.guard(face, a));
H.reset = () => { reset0(); revert(); };
H.tick = dt => { tick0(dt); if (active && active.tick) active.tick(dt); };
H.under = dt => {                              // the technique's colour pooling at his feet
  under0(dt);
  if (!active) return;
  const p = E.P1, c = F(p.x, p.y + 30);
  g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW[active.glow], c[0], c[1], 320 * c[2], .26 + .06 * Math.sin(E.T * 6)); g.globalCompositeOperation = 'source-over';
};

// awakening: the bar fills as his hits land; G spends it
const hit0 = H.hit, awkEl = document.getElementById('awk'), hintEl = document.getElementById('techHint');
let awk = 0;
const bar = () => {
  const nm = (active && active.awkName) || 'Awakening';
  awkEl.style.setProperty('--a', awk / 100); awkEl.classList.toggle('full', awk >= 100);
  awkEl.lastElementChild.textContent = awk >= 100 ? 'Press G · ' + nm + ' ready' : nm + ' · ' + Math.floor(awk) + '%';
};
// most techniques fill it by landing hits; one that sets awkHits: false is filled from outside, with JU.tech.charge()
function charge(n) {
  if (!(active && active.awaken) || awk >= 100) return;
  awk = Math.min(100, awk + n); bar();
  if (awk >= 100) { E.fx.push({ k: 2, x: E.P1.x, y: E.P1.y + 400, n: ((active.awkName || 'Awakening') + ' ready  ·  G').toUpperCase(), col: '#ffd23d', t: 0, life: 1.6 }); sfx.charge(); }
}
H.dash = () => (active && active.dashFx) || null;
H.hit = (o, face, h) => {
  hit0(o, face, h);
  const m = E.P1.move, spending = m && !m.key && !m.def.m1;      // the awakening itself: its punches do not refill the bar
  if (active && active.awkHits !== false && !spending) charge(h.dmg * 3.2);
};
H.awaken = p => {
  if (!(active && active.awaken && awk >= 100 && p.ground && !p.move && !p.ps && !p.dead)) return;
  if (!active.awkKeep) { awk = 0; bar(); }       // one that is not built yet keeps its bar
  active.awaken(p);
};

/* ---------- shared drawing + combat helpers for the technique files ---------- */
// a blocky creature or object made of rectangles, standing on the fighting plane
function sprite(x, y, face, s, a, col, rects, deco) {
  const c = F(x, y), k = c[2] * s;
  g.save(); g.translate(c[0], c[1]); g.scale(face * k, k); g.globalAlpha = Math.max(0, Math.min(1, a));
  g.fillStyle = col; g.strokeStyle = LINE; g.lineWidth = 3; g.lineJoin = 'round';
  for (const r of rects) { g.beginPath(); g.rect(r[0], r[1], r[2], r[3]); g.fill(); g.stroke(); }
  if (deco) deco();
  g.restore(); g.globalAlpha = 1;
}
function orb(x, y, r, img, core) {
  const c = F(x, y);
  g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW[img], c[0], c[1], r * 4.4 * c[2], 1); g.globalCompositeOperation = 'source-over';
  if (core) { g.fillStyle = core; g.beginPath(); g.arc(c[0], c[1], r * c[2], 0, 6.2832); g.fill(); }
}
function beam(x0, x1, y, w, img, a) {
  const p = F(x0, y), q = F(x1, y), n = Math.max(2, Math.abs(q[0] - p[0]) / (w * .7) | 0);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i <= n; i++) E.glow(E.GLOW[img], p[0] + (q[0] - p[0]) * i / n, p[1] + (q[1] - p[1]) * i / n, w * 2.6 * p[2], a);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = a; g.strokeStyle = '#fff'; g.lineWidth = w * .34 * p[2]; g.lineCap = 'round';
  g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); g.lineCap = 'butt'; g.globalAlpha = 1;
}
const shout = (p, text, col) => E.fx.push({ k: 2, x: p.x, y: p.y + 390, n: text, col, t: 0, life: 1.1 });
// n follow-up hits on a target, `every` seconds apart
const dot = (o, face, n, every, h, each) => { for (let i = 1; i <= n; i++) E.after(i * every, () => { if (!o.ko) { E.applyHit(o, face, h); if (each) each(i); } }); };
// the opponent, if it is in front of him and within range
const near = (p, range) => { const o = E.P2, d = (o.x - p.x) * p.face; return d > -30 && d < range && !o.ko && o.state !== 'down' ? o : null; };

/* ---------- the roll (Cursed Technique screen on the title menu) ---------- */
// a card for whoever is coming next. It says that somebody is, and gives a different hint each time it is pressed
const HINTS = ['A ring on a chain, and a promise made at eleven.', 'He is never the only one in the room.', 'He carries a sword he would rather not have to use.', 'Show him a thing once.'];
let hintAt = 0;
const TEASE = false;                                // the card is put away for now (the user's call, 0.2v6). true brings it back
// a limited technique (def.limited = the moment it leaves) is rolled for first, at its own odds, for as long as it is here.
// If it does not come up, the usual table decides
const live = t => !t.limited || Date.now() < t.limited;
// how long it has left, to the second: "Ends in 6d 00h 37m 12s". The days are dropped when there are none, and then the hours
function left(t) {
  const s = Math.floor((t.limited - Date.now()) / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), two = n => String(n).padStart(2, '0');
  return s <= 0 ? 'Ended' : 'Ends in ' + (d ? d + 'd ' : '') + (d || h ? two(h) + 'h ' : '') + two(Math.floor(s % 3600 / 60)) + 'm ' + two(s % 60) + 's';
}
// since the public release a card equips only what he may equip: what he holds in his slots (shop.js keeps them, and the rules)
const mine = id => !JU.shop || JU.shop.allowed(id);
const nope = el => { el.classList.remove('no'); void el.offsetWidth; el.classList.add('no'); sfx.back(); };
const retix = no => { const el = document.getElementById('tix'); if (el && JU.shop) el.outerHTML = JU.shop.tix('ct', no); };
function stamp() { document.querySelectorAll('.tcard.lim:not(.ea):not(.tease)').forEach(c => { const t = TECH[c.dataset.tech]; c.classList.toggle('over', !live(t) && !mine(t.id)); c.querySelector('u').textContent = left(t); }); }
function roll() {
  for (const id of ORDER) { const t = TECH[id]; if (t.limited && live(t) && !(JU.shop && JU.shop.holds('tech', id)) && Math.random() * 100 < t.odds) return id; }      // (a limited one he holds already is not rolled twice)
  let r = Math.random() * 100;
  for (const id of ORDER) if (!TECH[id].limited && (r -= TECH[id].odds) < 0) return id;
  return ORDER.find(id => TECH[id].odds > 0 && !TECH[id].limited);
}
function show(fresh) {
  const t = TECH[equipped], r = document.getElementById('rres');
  if (!r) return;
  r.innerHTML = t ? `<small>${fresh ? 'You rolled' : 'Equipped'}</small><b style="color:${t.col}">${t.name}</b><span lang="ja">${t.jp}</span>
    <em>${t.who} · ${t.free ? 'Free' : t.awakened ? 'Awakened' : t.early ? 'Early Access' : t.odds + '%' + (t.limited ? ' · Limited time' : '')}</em><p>${SLOTS.map((k, i) => `${i + 1} ${t.moves[k].name}`).join(' · ')}</p>`
    : `<small>No technique yet</small><p>${JU.shop && JU.shop.PAID ? 'Roll the talisman with a CT ticket: what it lands on goes into the slot you have selected.' : 'Roll the talisman, or just pick a card below.'} It is used in Free Exploration.</p>`;
  document.querySelectorAll('.tcard[data-tech]').forEach(c => { c.classList.toggle('on', c.dataset.tech === equipped); c.classList.toggle('lock', !mine(c.dataset.tech)); });
  stamp();
}
function mount(body) {
  body.innerHTML = `<div class="roll"><button class="paper" id="paper" aria-label="Roll a cursed technique"><b lang="ja">封</b><i>Click to roll</i></button>
    <div class="rres" id="rres" aria-live="polite"></div>
    ${JU.awakened ? '<button class="awkct" id="awkct" aria-label="Awakened cursed techniques"><span lang="ja">覚醒</span>Awaken CT</button>' : ''}</div>
    ${JU.shop ? JU.shop.row('tech') + JU.shop.tix('ct') : ''}
    ${ORDER.filter(id => TECH[id].limited).map(id => { const t = TECH[id]; return `<button class="tcard lim${mine(id) ? '' : ' lock'}" data-tech="${id}" style="--c:${t.col}" aria-label="Equip ${t.name}, limited time"><b lang="ja">${t.mark || t.jp[0]}</b><span><small>Limited time</small>${t.name}</span><i>${t.who} · ${t.odds}%</i><u></u></button>`; }).join('')}
    ${ORDER.filter(id => TECH[id].early).map(id => { const t = TECH[id]; return `<button class="tcard lim ea${mine(id) ? '' : ' lock'}" data-tech="${id}" style="--c:${t.col}" aria-label="Equip ${t.name}, early access"><b lang="ja">${t.mark || t.jp[0]}</b><span><small>Early Access</small>${t.name}</span><i>${t.who}</i><u>$2.99</u></button>`; }).join('')}
    ${TEASE ? `<button class="tcard lim tease" id="tease" style="--c:#d9c9ff" aria-label="A character still to come. Press for a hint"><b lang="ja">？</b><span><small>Next character</small>? ? ?</span><i>${HINTS[hintAt]}</i><u>Soon</u></button>` : ''}
    <div class="tcards t8">${ORDER.filter(id => !TECH[id].limited && !TECH[id].early && !TECH[id].awakened).map(id => { const t = TECH[id]; return `<button class="tcard${mine(id) ? '' : ' lock'}" data-tech="${id}" style="--c:${t.col}" aria-label="Equip ${t.name}${mine(id) ? '' : ', not yours yet'}"><b lang="ja">${t.mark || t.jp[0]}</b><span>${t.name}</span><i>${t.free ? 'Free' : t.odds + '%'}</i></button>`; }).join('')}</div>`;
  show(false);
  clearInterval(clock); clock = setInterval(() => { if (document.querySelector('.tcard.lim')) stamp(); else clearInterval(clock); }, 1000);
}
// a card that is not his: it says how it is come by, and then the screen goes back to what he has equipped
function sealed(t) {
  const r = document.getElementById('rres');
  if (!r) return;
  const how = t.early ? 'An Early Access technique. Early Access is not on sale yet.' : t.limited ? (live(t) ? `Here for a limited time: roll it from the talisman (${t.odds}%) before it leaves.` : 'Its time is over. It cannot be rolled any more.')
    : `Roll it from the talisman (${t.odds}%)${t.odds <= 10 ? ', or look for it in the Daily Shop' : ''}.`;
  r.innerHTML = `<small>Sealed · not yours yet</small><b style="color:${t.col}">${t.name}</b><span lang="ja">${t.jp}</span><p>${how}</p>`;
  clearTimeout(back); back = setTimeout(() => show(false), 3400);
}
// the row of slots, drawn again after something in it has changed
const rerow = () => { const el = document.getElementById('hold'); if (el && JU.shop) el.outerHTML = JU.shop.row('tech'); };
// something said in the box beside the talisman, for a moment
function say(head, text) {
  const r = document.getElementById('rres');
  if (!r) return;
  r.innerHTML = `<small>${head}</small><p>${text}</p>`;
  clearTimeout(back); back = setTimeout(() => show(false), 4200);
}
// The talisman pressed. A roll goes into the slot that is selected, in place of what is there, so first: may that slot be spun at all, and
// does what is in it have to be asked about (shop.js: JU.shop.plan)
function spin(paper) {
  if (spinning || asking) return;
  const plan = JU.shop ? JU.shop.plan('tech') : {};
  if (plan.stop) { nope(paper); say('It cannot be spun off', plan.stop); return; }      // the slot selected holds a limited one
  if (plan.ea) {                                    // a free slot: spinning it off gives it up, and nothing is rolled
    asking = true;
    JU.shop.ask(plan.ask).then(yes => {
      asking = false;
      if (!yes) return;
      const t = TECH[plan.slot.id], body = document.getElementById('pBody');
      JU.shop.giveUp('tech', plan.slot.key); sfx.back();
      if (body && document.getElementById('paper')) mount(body);
      say('Spun off', `${t.name} is gone, and its slot with it.`);
    });
    return;
  }
  if (JU.shop && !JU.shop.has('ct')) { nope(paper); retix(true); return; }      // no ticket, no roll
  if (plan.ask) { asking = true; JU.shop.ask(plan.ask).then(yes => { asking = false; if (yes) go(paper); }); return; }      // something rare is in that slot: asked twice
  go(paper);
}
function go(paper) {
  if (spinning || (JU.shop && !JU.shop.take('ct'))) return;
  spinning = true; clearTimeout(back); retix();
  const result = roll(), faces = ORDER.filter(id => live(TECH[id]) && !TECH[id].early && !TECH[id].awakened && !TECH[id].free), t0 = performance.now(), dur = JU.reduceMotion ? 300 : 3000, turns = 10, face = paper.querySelector('b'), sub = paper.querySelector('i');
  let lastHalf = -1;
  paper.classList.remove('got'); paper.classList.add('spin');
  (function step(now) {
    const u = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - u, 3.2), ang = e * turns * 360, half = Math.floor((ang + 90) / 180);
    paper.style.transform = `rotateY(${ang}deg) rotateZ(${Math.sin(u * 44) * (1 - u) * 16}deg) scale(${1 + Math.sin(u * Math.PI) * .4})`;
    if (half !== lastHalf) {                     // every time it turns edge-on a different technique is on the face
      lastHalf = half;
      const t = TECH[half >= turns * 2 - 1 ? result : faces[Math.random() * faces.length | 0]];
      face.textContent = t.mark || t.jp[0]; sub.textContent = t.name; paper.style.setProperty('--c', t.col);
      paper.classList.toggle('back', half % 2 === 1); sfx.hover();
    }
    if (u < 1) { requestAnimationFrame(step); return; }
    const t = TECH[result], r = paper.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    equipped = result; try { localStorage.setItem('ju.tech', result); } catch (err) {} noToji(result);
    const at = JU.shop ? JU.shop.place('tech', result) : null;      // into the slot that was selected, or a slot of its own if it is a limited one
    face.textContent = t.mark || t.jp[0]; sub.textContent = t.name; paper.style.setProperty('--c', t.col);
    paper.style.transform = ''; paper.classList.remove('spin', 'back'); paper.classList.add('got');
    JU.flash(x, y); JU.bolts(x, y, t.odds <= 5 ? 26 : t.odds <= 10 ? 16 : 9);
    if (t.odds <= 10) sfx.bf(); else sfx.confirm();
    show(true); spinning = false;
    if (at) {                                     // and where it went, and what it cost him
      const lb = document.querySelector('#rres small'), lost = TECH[at.lost];
      rerow(); if (lb) lb.textContent = 'You rolled · ' + (at.key[0] === 'l' ? 'it has a slot of its own' : 'slot ' + (+at.key.slice(1) + 1) + (lost ? ', in place of ' + lost.name : ''));
    }
  })(t0);
}
document.addEventListener('click', e => {
  const p = e.target.closest('#paper'), c = e.target.closest('.tcard'), ts = e.target.closest('#tease'), sl = e.target.closest('.hslot[data-kind="tech"]');
  if (ts) { hintAt = (hintAt + 1) % HINTS.length; ts.querySelector('i').textContent = HINTS[hintAt]; ts.classList.remove('no'); void ts.offsetWidth; ts.classList.add('no'); sfx.hover(); return; }
  if (p) { spin(p); return; }
  if (spinning || asking) return;
  if (sl) {                                         // a slot: the next roll goes there, and what it holds is what he fights with
    JU.shop.pick('tech', sl.dataset.slot);
    if (TECH[sl.dataset.id]) wear(TECH[sl.dataset.id], sl); else { sfx.hover(); clearTimeout(back); show(false); rerow(); }
    return;
  }
  if (!c) return;
  if (!mine(c.dataset.tech)) { nope(c); sealed(TECH[c.dataset.tech]); return; }   // not his: not rolled, not bought, or early access
  if (!live(TECH[c.dataset.tech]) && JU.shop && !JU.shop.owns('tech', c.dataset.tech)) return;   // a limited technique that has left cannot be picked up any more
  // a card equips its technique on the spot, and the slot that holds it is the one selected
  const held = JU.shop && JU.shop.slotsOf('tech').find(s => s.id === c.dataset.tech);
  if (held) JU.shop.pick('tech', held.key);
  wear(TECH[c.dataset.tech], c);
});
// a technique put on, from its slot or from its card
function wear(t, el) {
  const paper = document.getElementById('paper'), r = el.getBoundingClientRect();
  clearTimeout(back);
  equipped = t.id; try { localStorage.setItem('ju.tech', t.id); } catch (err) {} noToji(t.id);
  if (paper) { paper.querySelector('b').textContent = t.mark || t.jp[0]; paper.querySelector('i').textContent = t.name; paper.style.setProperty('--c', t.col); }
  show(false); rerow(); sfx.confirm(); JU.flash(r.left + r.width / 2, r.top + r.height / 2);
}

JU.tech = {
  add, TECH, ORDER, SLOTS, mount, apply, revert, roll, charge, tk: { sprite, orb, beam, shout, dot, near },
  equip(id) { equipped = id; try { localStorage.setItem('ju.tech', id); } catch (e) {} noToji(id); },
  get name() { const t = TECH[equipped]; return t ? t.name : ''; }, get active() { return active; }, get using() { return !!active || based; }, get equipped() { return equipped; }, get skin() { return (active && active.skin) || null; }
};
})();
