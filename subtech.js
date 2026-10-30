/* JUJUTSU UNLIMITEDS — Build 0.16v1: SUB TECHNIQUES. What a sorcerer can learn on top of the technique they were born with, and carry
   whatever that technique is. Two so far:
     REVERSED CURSED TECHNIQUE (反転術式). Shoko gives it to whoever finishes her errands at Jujutsu High (jjh.js). V in a fight: cursed
     energy multiplied by itself, negative times negative, turned positive and put back into the body. 45% of his health back over a second,
     then 25 seconds before it can be done again. Not in a duel against another player (pvp.js), and not while he is down.
     The Sukuna clan keeps V for its binding vow, so B does it too, for everybody.
     JACKPOT (大当たり, Build 0.21v1, the user's): every move he lands is a gamble, 50/50, decided once for the move. Half the time it pays
     now: the move lands half as hard again (x1.5) and 20% of his health comes back. Half the time it pays later: a third of each hit now, a
     third some time later (two to eight seconds), and the last third ten seconds after the hit, doubled, with 40 health back when it lands.
     Always on (no key). Free for now: the user did not say how it is to be got. Strikes are not moves: only 1 to 4, E, and the like
   The title screen's SUB TECHNIQUES button shows what there is, which one is on, and where to get the rest.
   The team's account has them all, as it has everything else */
(() => {
'use strict';

const E = JU.eng, H = E.hooks, sfx = JU.sfx, V = JU.vfx, Fi = JU.fights, Z = JU.bossfx, g = E.g, F = E.F;
const TAU = Math.PI * 2, { rnd } = E;
const S = { own: {}, on: 'rct' };                  // what he has; which one is on
try { Object.assign(S, JSON.parse(localStorage.getItem('ju.sub') || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem('ju.sub', JSON.stringify(S)); } catch (e) {} paint(); };
const dev = () => !!(JU.account && JU.account.dev);
const owns = id => dev() || !!S.own[id] || !!(SUBS[id] && SUBS[id].free);
const SUBS = {
  rct: { name: 'Reversed Cursed Technique', short: 'RCT', jp: '反転術式', key: 'V', col: '#9fe870',
    what: 'Cursed energy multiplied by itself: negative times negative, turned positive and put back into the body. Heals 45% of your health over a second, then 25 seconds before it can be used again. Not in duels against other players.',
    how: 'The Healer, in the infirmary at Jujutsu High (Free Exploration), has errands for whoever wants to learn it.' },
  jackpot: { name: 'Jackpot', short: 'JACKPOT', jp: '大当たり', key: '★', col: '#ffd24a', passive: true, free: true,
    what: 'Every move you land is a gamble, 50/50. Half the time it pays now: the move hits 1.5x as hard and 20% of your health comes back. Half the time it pays later: a third of the damage now, a third some time after, and the last third ten seconds after the hit, doubled, and 40 health back when it lands.',
    how: 'Free for now.' }
};
const HEAL = .45, DUR = 1, CD = 25, GREEN = '#9fe870';
let cd = 0, heal = null;                            // heal: { left, t }
const on = () => (owns(S.on) && SUBS[S.on] ? S.on : null);
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const fighting = () => E.root.dataset.mode === 'fight' && !E.root.classList.contains('cine') && !Fi.fight.paused;
const vowKey = () => !!(JU.clan && JU.clan.active && JU.clan.equipped === 'sukuna');      // (V is the binding vow's, then)
const shout = (p, t, c) => E.fx.push({ k: 2, x: p.x, y: p.y + 390, n: t, col: c, t: 0, life: 1.1 });

/* ---------- Reversed Cursed Technique ---------- */
function rct() {
  const p = E.P1;
  if (duel()) { shout(p, 'Not in a duel', '#c88'); sfx.back(); return; }
  if (p.dead || p.ps === 'down') return;
  if (cd > 0) { shout(p, 'Not yet · ' + Math.ceil(cd) + 's', '#c88'); sfx.back(); return; }
  if (p.hp >= p.max) { shout(p, 'Nothing to heal', '#c8e8c0'); return; }
  cd = CD; heal = { left: Math.min(p.max - p.hp, p.max * HEAL), t: 0 };
  shout(p, '反転術式', GREEN); sfx.charge(); sfx.rise(.6);
  E.addNum(p.x, p.y + 300, '+' + Math.round(heal.left), GREEN);
  V.ring(p.x, p.y + 160, 260, GREEN, .45); V.ring(p.x, p.y + 160, 170, '#ffffff', .3);
  if (Z) { Z.flash('159,232,112', .14, .25); for (let i = 0; i < 18; i++) { const a = rnd(0, TAU); Z.emit(0, p.x + Math.cos(a) * 140, p.y + 160 + Math.sin(a) * 140, -Math.cos(a) * 300, -Math.sin(a) * 300, rnd(30, 60), rnd(.3, .5), i & 1 ? '159,232,112' : '235,255,225'); } }
  paint();
}
function aura(p) {                                  // while it works: the body lit from inside, and the light rising off it
  const k = heal.t / DUR, c = F(p.x, p.y + 165 * (p.scale || 1)), s = c[2];
  g.globalCompositeOperation = 'lighter';
  E.glow(E.GLOW.green || E.GLOW.blue, c[0], c[1], 420 * s, .55 * Math.sin(Math.min(1, k) * Math.PI) + .15);
  E.glow(E.GLOW.white || E.GLOW.blue, c[0], c[1] - 20 * s, 180 * s, .35 * (1 - k));
  g.strokeStyle = `rgba(200,255,180,${.5 * (1 - k)})`; g.lineWidth = 2.5 * s;
  for (let i = 0; i < 3; i++) { const r = (60 + ((heal.t * 1.6 + i / 3) % 1) * 150) * s; g.beginPath(); g.ellipse(c[0], c[1] + 150 * s, r, r * .28, 0, 0, TAU); g.stroke(); }      // rings at his feet, going out
  g.globalCompositeOperation = 'source-over';
}

/* ---------- Jackpot ---------- */
const JP_GOLD = '#ffd24a', JP_BOOST = 1.5, JP_BOOST_HEAL = .2, JP_HEAL = 40, JP_LAST = 10;
const owed = [];                                    // { o, t, at, dmg, face, heal }: the rest of a split, still to land
let jpMove = null;                                  // his last move, and (jpAt) when it was last going: a ball or a shot can land after it has ended
// the move a hit belongs to, if the gamble has a say in it: his own, not a strike, not one of the owed parts landing
function jpOf(h, o) {
  if (on() !== 'jackpot' || h.jp || o === E.P1) return null;
  const m = E.P1.move;
  if (m && !m.def.m1) return m;
  return !m && jpMove && E.T - jpMove.jpAt < 2.5 ? jpMove : null;    // (a ball or a shot still out from the last one)
}
const roll = m => { if (!m.jp) { m.jp = Math.random() < .5 ? 'now' : 'later'; m.jpNew = true; } return m.jp; };
function jpSay(p, text, col) { E.fx.push({ k: 2, x: p.x, y: p.y + 450, n: text, col, t: 0, life: 1.3 }); }
const pow0 = H.power, hit0 = H.hit;
H.power = (h, o) => {                               // (called before the hit lands: the roll is decided here, once a move)
  const base = pow0 ? pow0(h, o) : 1, m = jpOf(h, o);
  if (!m) return base;
  return base * (roll(m) === 'now' ? JP_BOOST : 1 / 3);
};
H.hit = (o, face, h) => {
  if (hit0) hit0(o, face, h);
  const m = jpOf(h, o);
  if (!m) return;
  const p = E.P1;
  jpMove = m;
  if (m.jpNew) {                                     // the reels, the first time this move lands
    m.jpNew = false;
    if (sfx.ding) sfx.ding(m.jp === 'now' ? 3 : 1);
    if (m.jp === 'now') {
      const back = Math.round(Math.min(p.max - p.hp, p.max * JP_BOOST_HEAL));
      if (!p.dead && back > 0) { p.hp += back; E.addNum(p.x, p.y + 300, '+' + back, '#9be7a0'); }
      jpSay(p, 'JACKPOT · x1.5', JP_GOLD);
      if (Z) Z.flash('255,210,74', .12, .2);
    } else jpSay(p, 'PAYS LATER · 1/3 · 1/3 · 2/3', '#e8d9a8');
  }
  if (m.jp === 'later') {                            // the rest of this hit, owed: a third some time later, the last third (doubled) at ten seconds
    const third = h.dmg / 3;                         // (as it was going to land: whatever makes it harder or softer does so again when each part lands)
    owed.push({ o, t: 0, at: 2 + Math.random() * 6, dmg: third, face, heal: false });
    owed.push({ o, t: 0, at: JP_LAST, dmg: third * 2, face, heal: !m.jpHealed, last: true });
    m.jpHealed = true;
  }
};
function payOwed(dt) {
  const p = E.P1;
  for (let i = owed.length - 1; i >= 0; i--) {
    const q = owed[i];
    q.t += dt;
    if (q.t < q.at) continue;
    owed.splice(i, 1);
    if (q.o.ko || (q.o !== E.P2 && !(H.foes && H.foes() && H.foes().includes(q.o)))) continue;      // (gone, or not in this fight any more)
    E.applyHit(q.o, q.face, { dmg: q.dmg, kb: q.last ? 200 : 0, stun: q.last ? .5 : .15, stop: q.last ? .08 : .03, heavy: q.last ? 1 : 0, col: JP_GOLD, jp: 1, mute: 1 });
    if (sfx.ding) sfx.ding(q.last ? 3 : 2);
    if (Z) for (let j = 0; j < (q.last ? 16 : 6); j++) Z.emit(3, q.o.x + rnd(-30, 30), q.o.y + rnd(120, 260), rnd(-500, 500), rnd(200, 800), rnd(5, 9), rnd(.5, 1), '255,210,74', { g: 1700, vr: rnd(-14, 14), rot: rnd(0, TAU), edge: 'rgba(122,84,16,.9)' });
    if (q.heal && !p.dead) { const back = Math.round(Math.min(p.max - p.hp, JP_HEAL)); if (back > 0) { p.hp += back; E.addNum(p.x, p.y + 300, '+' + back, '#9be7a0'); } jpSay(p, 'PAID OUT', JP_GOLD); }
  }
}
function drawOwed() {                               // what is still owed on somebody: a gold coin for each part, with the seconds left on it
  const by = new Map();
  for (const q of owed) { if (!by.has(q.o)) by.set(q.o, []); by.get(q.o).push(q); }
  for (const [o, list] of by) {
    if (o.ko) continue;
    list.sort((a, b) => (a.at - a.t) - (b.at - b.t));
    list.slice(0, 6).forEach((q, i) => {
      const c = F(o.x + (i - (Math.min(6, list.length) - 1) / 2) * 62, o.y + 440 * (o.scale || 1)), k = c[2], left = Math.max(0, q.at - q.t);
      g.fillStyle = q.last ? '#ffd24a' : '#e8d9a8'; g.beginPath(); g.arc(c[0], c[1], 26 * k, 0, TAU); g.fill(); g.lineWidth = 3.5 * k; g.strokeStyle = '#7a5410'; g.stroke();
      g.fillStyle = '#3a2808'; g.font = `${Math.max(12, Math.round(28 * k))}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(Math.ceil(left)), c[0], c[1] + 1);
    });
  }
}

/* ---------- the fight's side of it ---------- */
const press0 = H.press, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
H.press = (a, inScene) => {
  if (!inScene && fighting() && on() === 'rct' && (a === 'rct' || (a === 'vow' && !vowKey()))) { rct(); return true; }
  return press0 ? press0(a, inScene) : false;
};
H.tick = dt => {
  tick0(dt);
  if (cd > 0) cd = Math.max(0, cd - dt);
  if (owed.length) payOwed(dt);
  if (E.P1.move && !E.P1.move.def.m1) { jpMove = E.P1.move; jpMove.jpAt = E.T; }
  const p = E.P1;
  if (heal) {
    const step = Math.min(heal.left, p.max * HEAL * dt / DUR);
    if (!p.dead) p.hp = Math.min(p.max, p.hp + step);
    heal.left -= step; heal.t += dt;
    if (Math.random() < .7) V.mote(p.x + rnd(-60, 60), p.y + rnd(80, 300), 'green');
    if (heal.left <= .01 || p.dead || heal.t > DUR + .5) heal = null;
  }
  paint();
};
H.fx = dt => { fx0(dt); if (heal) aura(E.P1); if (owed.length) drawOwed(); };
const clear = () => { cd = 0; heal = null; owed.length = 0; jpMove = null; paint(); };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) clear(); };

/* ---------- on screen in a fight: a badge with its key and its wait; on a touch screen, a button ---------- */
const badge = document.createElement('div');
badge.className = 'subhud'; badge.hidden = true; badge.innerHTML = '<kbd>V</kbd><b>RCT</b>';
E.root.appendChild(badge);
let shown = '';
function paint() {
  const id = on(), live = !!id && !duel();
  E.root.classList.toggle('rct', live && id === 'rct');      // (the touch button is RCT's: Jackpot has nothing to press)
  if (!id) { badge.hidden = true; return; }
  const d = SUBS[id], v = (cd / CD).toFixed(2), key = vowKey() ? 'B' : d.key, st = `${key}|${d.short}|${v}|${live}`;
  if (st === shown) return;
  shown = st; badge.hidden = !live;
  badge.querySelector('kbd').textContent = key; badge.querySelector('b').textContent = d.short;
  badge.style.setProperty('--cd', d.passive ? '0' : v); badge.classList.toggle('rdy', d.passive || cd <= 0);
}

/* ---------- the title screen's panel ---------- */
function mount(el) {
  const cards = Object.keys(SUBS).map(id => {
    const d = SUBS[id], have = owns(id), eq = on() === id;
    return `<div class="subcard${have ? ' have' : ''}${eq ? ' eq' : ''}" style="--c:${d.col}"><b class="sjp" lang="ja">${d.jp}</b>
      <div><h3>${d.name}</h3><p>${d.what}</p><p class="how">${have ? (d.free ? 'Free for now.' : dev() && !S.own[id] ? 'Team account: unlocked.' : 'Learned.') + (d.passive ? ' Always on in a fight.' : ` In a fight: <kbd>${d.key}</kbd> (or <kbd>B</kbd>).`) : 'Locked. ' + d.how}</p></div>
      <button data-sub="${id}" ${have ? '' : 'disabled'}>${!have ? 'Locked' : eq ? 'Equipped' : 'Equip'}</button></div>`;
  }).join('');
  el.innerHTML = `<div class="subs"><p class="subintro">Sub techniques go on top of whatever cursed technique you have. One can be on at a time.</p>${cards}
    <p class="subintro dim">More to learn later.</p></div>`;
  el.querySelectorAll('[data-sub]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.sub;
    if (!owns(id)) return;
    S.on = S.on === id ? '' : id; save(); sfx.confirm(); mount(el);
  }));
}

function grant(id) { if (!SUBS[id]) return; S.own[id] = 1; if (!S.on) S.on = id; save(); }
paint();
JU.sub = { SUBS, owns, grant, mount, paint, get on() { return on(); }, set on(id) { if (id === '' || SUBS[id]) { S.on = id; save(); } }, get owed() { return owed.map(q => ({ left: +(q.at - q.t).toFixed(1), dmg: +q.dmg.toFixed(2), last: !!q.last })); }, get cd() { return cd; }, set cd(v) { cd = Math.max(0, +v || 0); paint(); }, get healing() { return !!heal; } };
})();
