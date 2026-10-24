/* JUJUTSU UNLIMITEDS — Build 0.16v1: SUB TECHNIQUES. What a sorcerer can learn on top of the technique they were born with, and carry
   whatever that technique is. One so far:
     REVERSED CURSED TECHNIQUE (反転術式). Shoko gives it to whoever finishes her errands at Jujutsu High (jjh.js). V in a fight: cursed
     energy multiplied by itself, negative times negative, turned positive and put back into the body. 45% of his health back over a second,
     then 25 seconds before it can be done again. Not in a duel against another player (pvp.js), and not while he is down.
     The Sukuna clan keeps V for its binding vow, so B does it too, for everybody.
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
const owns = id => dev() || !!S.own[id];
const SUBS = {
  rct: { name: 'Reversed Cursed Technique', short: 'RCT', jp: '反転術式', key: 'V', col: '#9fe870',
    what: 'Cursed energy multiplied by itself: negative times negative, turned positive and put back into the body. Heals 45% of your health over a second, then 25 seconds before it can be used again. Not in duels against other players.',
    how: 'The Healer, in the infirmary at Jujutsu High (Free Exploration), has errands for whoever wants to learn it.' }
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

/* ---------- the fight's side of it ---------- */
const press0 = H.press, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
H.press = (a, inScene) => {
  if (!inScene && fighting() && on() && (a === 'rct' || (a === 'vow' && !vowKey()))) { rct(); return true; }
  return press0 ? press0(a, inScene) : false;
};
H.tick = dt => {
  tick0(dt);
  if (cd > 0) cd = Math.max(0, cd - dt);
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
H.fx = dt => { fx0(dt); if (heal) aura(E.P1); };
const clear = () => { cd = 0; heal = null; paint(); };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) clear(); };

/* ---------- on screen in a fight: a badge with its key and its wait; on a touch screen, a button ---------- */
const badge = document.createElement('div');
badge.className = 'subhud'; badge.hidden = true; badge.innerHTML = '<kbd>V</kbd><b>RCT</b>';
E.root.appendChild(badge);
let shown = '';
function paint() {
  const id = on(), live = !!id && !duel();
  E.root.classList.toggle('rct', live);
  if (!id) { badge.hidden = true; return; }
  const d = SUBS[id], v = (cd / CD).toFixed(2), key = vowKey() ? 'B' : d.key, st = `${key}|${d.short}|${v}|${live}`;
  if (st === shown) return;
  shown = st; badge.hidden = !live;
  badge.querySelector('kbd').textContent = key; badge.querySelector('b').textContent = d.short;
  badge.style.setProperty('--cd', v); badge.classList.toggle('rdy', cd <= 0);
}

/* ---------- the title screen's panel ---------- */
function mount(el) {
  const cards = Object.keys(SUBS).map(id => {
    const d = SUBS[id], have = owns(id), eq = on() === id;
    return `<div class="subcard${have ? ' have' : ''}${eq ? ' eq' : ''}" style="--c:${d.col}"><b class="sjp" lang="ja">${d.jp}</b>
      <div><h3>${d.name}</h3><p>${d.what}</p><p class="how">${have ? (dev() && !S.own[id] ? 'Team account: unlocked.' : 'Learned.') + ` In a fight: <kbd>${d.key}</kbd> (or <kbd>B</kbd>).` : 'Locked. ' + d.how}</p></div>
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
JU.sub = { SUBS, owns, grant, mount, paint, get on() { return on(); }, get cd() { return cd; }, set cd(v) { cd = Math.max(0, +v || 0); paint(); }, get healing() { return !!heal; } };
})();
