/* JUJUTSU UNLIMITEDS — cursed tools, and the clan that lives by them.
   The Cursed Tools screen (the button under the Shop) spins for one of four tools. Anybody can carry one, and it is used in place of a
   cursed technique: its moves take the first keys when no technique is active. The TOJI clan (limited time, 0.01%, disaster grade) carries
   three, switches between them with T, hits three times as hard with them, has four times the health, and cannot use a cursed technique at all */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, TOR = E.TOR, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, M = E.MOVES, C = JU.clan;
const { rnd, clamp } = E, TAU = Math.PI * 2, { shout } = JU.tech.tk, SLOTS = JU.tech.SLOTS;
const STEEL = '#e8f0ff', DEMON = '#c2182b', GOLD = '#e2c060', VIOLET = '#c77dff', CLOUD = '#ff5a6e';
const ENDS = Date.parse('2026-10-11T12:00:00Z');   // when the Toji clan leaves the draw: seven days after it arrived. Move the date to run it again
// The Dagger of the Demonly Holdings is meant to be earned through a questline, and that is not built. Until the public release the form was
// simply there for everybody. Now it is there for whoever has it (JU.shop.demon: the team's account; one day the questline, or the pack that holds it)
const demonOk = () => !JU.shop || JU.shop.demon;
const TOJI_TOOL = 3, COUNTER = 3, COUNTER_CD = 20, DEMON_TIME = 10;   // +200% tool damage; Deadly Counter's seconds and its wait; how long the demonic katana stays
const shake = v => { cam.shake = Math.max(cam.shake, v); };

const S = { slots: [null, null, null], cur: 0, demon: false };       // what is in each pocket, which one is in hand, and which form the dagger is in
try { Object.assign(S, JSON.parse(localStorage.getItem('ju.tools') || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem('ju.tools', JSON.stringify(S)); } catch (e) {} };

let live = false, dressed = false;                  // tools are in play this session; the hotbar is wearing a tool's names
let m1cd = 0, dc = 0, dcCd = 0, purg = 0, demonT = 0, root = null;   // the spear's wait between strikes; Deadly Counter and its cooldown; the Purgatory stance; the demonic katana; a grab holding the enemy
const dots = [];                                    // damage still to come: bleeding, demons
const toji = () => !!C.active && C.active.id === 'toji';
const mult = () => (toji() ? TOJI_TOOL : 1);
const held = () => (!live ? null : toji() ? TOOLS[S.slots[S.cur]] || null : JU.tech.using ? null : TOOLS[S.slots[0]] || null);
const hit = (n, more) => Object.assign({ dmg: n, tool: n }, more);     // a tool's damage is exact, before the clan's bonus
// damage that arrives later and does not stagger
function chip(o, n, col) {
  const d = n * mult();
  o.flash = .05; E.addNum(o.x, o.y + 270 * (o.scale || 1), +d.toFixed(1), col);
  if (o.hp - d <= 0) E.applyHit(o, 1, { dmg: 99999, kb: 0, stun: .4, fixed: 1, col }); else o.hp -= d;
}
const bleed = (o, total, ticks, every, col) => dots.push({ o, left: ticks, per: total / ticks, every, t: every, col });

/* ---------- what each tool does ---------- */
const lunge = (name, cd, base, more, then) => ({ name, cd, dur: .5, run(p, m, t) {     // a short step in and the point of it
  p.rate = 46; p.vx = t > .06 && t < .16 ? p.face * 700 : 0; p.target = t < .3 ? POSE.jab : POSE.idle;
  if (m.done || t < .08 || t > .24 || !E.tryHit(p, hit(base, Object.assign({ reach: 215, kb: 120, stun: .6, stop: .08 }, more)))) return;
  m.done = 1; then(E.P2, p);
} });
const SLASH = { name: 'Katana Slash', cd: 5, dur: .55, run(p, m, t) {
  p.rate = 46; p.vx = t > .1 && t < .2 ? p.face * 520 : 0; p.target = t < .12 ? POSE.hookWind : t < .36 ? POSE.hook : POSE.idle;
  if (t < .12 || m.s) return;
  m.s = 1; sfx.whoosh(); V.slash(p.x + p.face * 150, p.y + 170, p.face > 0 ? -.35 : Math.PI + .35, 460, STEEL, 16);
  E.tryHit(p, hit(70, { reach: 280, kb: 640, lift: 320, stop: .14, heavy: 1, col: STEEL }));
} };
const STAB = lunge('Stab', 6, 25, { col: VIOLET }, o => bleed(o, 70, 10, .5, DEMON));             // and it goes on bleeding: seventy more over five seconds
const GRAB = lunge('Demonic Grab', 9, 40, { col: DEMON, stun: 1 }, o => {                           // and then hands come up out of the floor for it
  bleed(o, 120, 10, .4, DEMON); root = { o, t: 4 }; sfx.charge(); V.ring(o.x, 40, 260, DEMON, .4);
});
const STANCE = [-.1, 0, 2.2, .9, .3, -.3, 0];
const PURG = { name: 'Purgatory', cd: 25, dur: 1.3, run(p, m, t) {                                  // a counter: be hit while it is held, and come back with something worse
  p.vx = 0; p.rate = 20; p.target = t < 1.2 ? STANCE : POSE.idle;
  if (!m.c) { m.c = 1; purg = 1.2; sfx.charge(); shout(p, '煉獄', DEMON); }
} };
const DEMONIC = { name: 'Demonic Katana', cd: .4, dur: .34, run(p, m, t) {                          // one cut. It does not need a second
  p.rate = 50; p.vx = t < .1 ? p.face * 620 : 0; p.target = t < .22 ? POSE.hook : POSE.idle;
  if (m.s || t < .05) return;
  m.s = 1; sfx.bf(); shake(26); V.slash(p.x + p.face * 160, p.y + 170, p.face > 0 ? -.3 : Math.PI + .3, 560, DEMON, 22);
  if (E.tryHit(p, { reach: 320, dmg: 999999, fixed: 1, kb: 900, lift: 500, stop: .22, heavy: 1, col: DEMON })) V.impact(.2, E.P2.x, E.P2.y + 150);
} };
const INVERSION = { name: 'Inversion Stab', cd: 12, dur: .7, run(p, m, t) {
  p.rate = 46;
  if (t < .2) { p.target = POSE.divWind; p.vx = 0; return; }
  p.target = t < .45 ? POSE.jab : POSE.idle; p.vx = t < .32 ? p.face * 1300 : 0;
  if (m.done || t > .34 || !E.tryHit(p, hit(450, { reach: 250, kb: 900, lift: 420, stop: .3, heavy: 1, col: GOLD }))) return;
  m.done = 1; shake(34); sfx.bf(); V.impact(.2, E.P2.x, E.P2.y + 150);
} };
// their own strikes. Playful Cloud is all strikes. It used to land four or five a second and hold whatever it hit until the next one arrived, which
// nothing got out of; now it is one every 0.3 seconds (`every`, below), and its target is free again before the next. The spear strikes once
// every two seconds, and it shows
const cloudM1 = i => Object.assign({}, M.m1[i], { dur: .24, strike: .05, pre: i % 2 ? 'hookWind' : 'crushWind', pose: i % 2 ? 'hook' : 'crush', lunge: 150, kick: 0,
  hit: hit(7, { reach: 215, kb: i === 3 ? 420 : 40, lift: i === 3 ? 300 : 0, stun: .2, stop: .02, col: CLOUD }) });
const spearM1 = i => Object.assign({}, M.m1[i], { dur: .45, strike: .12, pre: 'divWind', pose: 'jab', lunge: 420, kick: 0,
  hit: hit(30, { reach: 235, kb: 420, lift: 200, stun: .6, stop: .1, heavy: 1, col: GOLD }) });

const TOOLS = {
  katana: { id: 'katana', name: 'Cursed Katana', jp: '呪刀', mark: '刀', odds: 40, col: '#cfd8e0', moves: [SLASH], what: 'Katana Slash: 70.' },
  dagger: { id: 'dagger', name: 'Dagger', jp: '短刀', mark: '短', odds: 40, col: VIOLET, moves: [STAB], what: 'Stab: 25, then 70 more as it bleeds.' },
  cloud: { id: 'cloud', name: 'Playful Cloud', jp: '游雲', mark: '雲', odds: 19.9, col: CLOUD, moves: [], m1: cloudM1, every: .3, what: 'No moves, only strikes: 7 each, one every 0.3 seconds.' },
  spear: { id: 'spear', name: 'Inverted Spear of Heaven', jp: '天逆鉾', mark: '鉾', odds: .1, col: GOLD, moves: [INVERSION], m1: spearM1, every: 2, what: 'Inversion Stab: 450. One strike every 2 seconds, 30 each.' }
};
const ORDER = ['katana', 'dagger', 'cloud', 'spear'];
const DEMONLY = { name: 'Dagger of the Demonly Holdings', what: 'Demonic Grab: 40, then demons for 120 more. Purgatory: a counter. Be hit while it is held and you come back with the Deadly Demonic Katana.' };
const movesOf = t => (!t ? [] : demonT > 0 ? [DEMONIC] : t.id === 'dagger' && S.demon ? [GRAB, PURG] : t.moves);
const nameOf = t => (t.id === 'dagger' && S.demon ? DEMONLY.name : t.name);

/* ---------- the hotbar wears the tool in hand ---------- */
const BASE = { names: {}, cd: {} };
for (const k of SLOTS) { BASE.names[k] = E.hud.mv[k].querySelector('b').textContent; BASE.cd[k] = E.CD[k]; }
const strip = document.createElement('div');
strip.className = 'tsm tools';
E.root.querySelector('.fb.p1').appendChild(strip);
function dress() {
  const t = held(), mv = movesOf(t), wear = toji() || !!t;
  if (wear || dressed) for (let i = 0; i < 4; i++) {
    const k = SLOTS[i], m = mv[i], b = E.hud.mv[k].querySelector('b');
    b.textContent = m ? m.name : wear && toji() ? '—' : BASE.names[k];
    E.CD[k] = m ? m.cd : wear && toji() ? 1 : BASE.cd[k];
  }
  dressed = wear;
  strip.classList.toggle('on', wear);
  if (!wear) return;
  const n = toji() ? 3 : 1, where = ['In hand', 'Cursed spirit', 'Waist'];
  strip.innerHTML = Array.from({ length: n }, (_, j) => { const i = (S.cur + j) % n, x = TOOLS[toji() ? S.slots[i] : S.slots[0]]; return `<span class="tpk${j ? '' : ' on'}"><small>${where[j]}</small>${x ? nameOf(x) : '—'}</span>`; }).join('') + (n > 1 ? '<span class="tpk key">T switches</span>' : '');
}
function swap() {                                   // T: whatever was round his neck is in his hand now
  const filled = [0, 1, 2].filter(i => TOOLS[S.slots[i]]);
  if (filled.length < 2) return;
  S.cur = filled[(filled.indexOf(S.cur) + 1) % filled.length]; save();
  const p = E.P1, t = held();
  if (p.move && !p.move.def.m1) E.endMove(p);
  for (const k of SLOTS) E.cd[k] = Math.min(E.cd[k], 1);
  sfx.whoosh(); shout(p, nameOf(t).toUpperCase(), t.col); dress();
}

/* ---------- the tool, drawn in whichever hand is doing the work ---------- */
function weapon(p, t) {
  const ps = p.pose, tp = p.target || ps, back = tp[3] > tp[2], a = back ? ps[3] : ps[2], w = E.hand(p, !back), dx = Math.sin(a) * p.face, dy = -Math.cos(a);
  const at = L => F(w[0] + dx * L, w[1] + dy * L), h0 = at(-16), k = h0[2];
  const rod = (L0, L1, wd, col) => { const a0 = at(L0), a1 = at(L1); g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.strokeStyle = LINE; g.lineWidth = (wd + 4) * k; g.stroke(); g.strokeStyle = col; g.lineWidth = wd * k; g.stroke(); };
  g.lineCap = 'round';
  if (demonT > 0) { const c = at(90); g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.red, c[0], c[1], 260 * k, .6); g.globalCompositeOperation = 'source-over'; rod(-16, 14, 8, '#2a1016'); rod(14, 190, 7, DEMON); }
  else if (t.id === 'katana') { rod(-16, 14, 8, '#3a2f4a'); rod(14, 165, 6, STEEL); }
  else if (t.id === 'dagger') { rod(-14, 10, 8, '#2a1f36'); rod(10, 70, 7, S.demon ? DEMON : '#cfd8e0'); }
  else if (t.id === 'cloud') { for (let i = 0; i < 3; i++) rod(-10 + i * 62, 42 + i * 62, 11, CLOUD); }
  else { rod(-16, 16, 8, '#3a2a1c'); rod(16, 104, 9, '#cfd8e0'); rod(40, 78, 5, GOLD); }               // the spear: a short heavy blade with a second point beside it
  g.lineCap = 'butt';
}

/* ---------- the Toji clan ---------- */
const TOJI = Object.assign({}, JU.cast3.TOJI, {
  chest() { g.save(); g.translate(-12, -10); g.rotate(.55); g.fillStyle = '#2a2c36'; g.fillRect(-3.5, -6, 7, 34); g.fillStyle = '#b9a56a'; g.fillRect(-5, -8, 10, 4); g.restore(); },   // one on his waist
  back() {                                          // and the cursed spirit he keeps the rest in, wound round his neck
    g.lineCap = 'round'; g.beginPath(); g.moveTo(-32, -TOR + 20); g.quadraticCurveTo(-10, -TOR - 16, 24, -TOR + 8);
    g.strokeStyle = LINE; g.lineWidth = 18; g.stroke(); g.strokeStyle = '#b9a6c9'; g.lineWidth = 13; g.stroke(); g.lineCap = 'butt';
    g.fillStyle = '#d8c8e6'; g.beginPath(); g.arc(27, -TOR + 10, 10, 0, TAU); g.fill(); g.lineWidth = 2.5; g.strokeStyle = LINE; g.stroke();
    g.fillStyle = LINE; g.fillRect(28, -TOR + 6, 3, 3); g.fillRect(31, -TOR + 12, 4, 2);
  } });
const HOST = { skin: TOJI, scale: 1.05, hp: 100, name: 'Toji Fushiguro', jp: '伏黒甚爾', m1: 0, ce: 0, m1s: 0 };
C.CLAN.toji = { id: 'toji', name: 'Toji', jp: '甚爾', odds: .01, col: '#cfd8e0', hp: 3, limited: ENDS, grade: 'Disaster grade',
  lines: ['+300% health', '+200% cursed tool damage', 'Carries three cursed tools at once: one in hand, one in the cursed spirit round his neck, one at his waist. T switches',
    'No cursed energy at all: a cursed technique cannot be equipped with this clan, nor this clan with a cursed technique'],
  ability: 'R — Deadly Counter. For three seconds, anything that hits you dies on the spot' };
C.ORDER.push('toji');
C.ext('toji', {
  begin() { C.st.host = HOST; JU.tech.revert(); },  // he looks like Toji, and whatever technique was equipped stays where it is
  r(p) {
    if (dcCd > 0) { shout(p, 'Deadly Counter: ' + Math.ceil(dcCd) + 's', '#c88'); return; }
    if (p.dead || p.ps) return;
    dc = COUNTER; dcCd = COUNTER_CD; sfx.charge(); shout(p, 'DEADLY COUNTER', '#ffffff'); V.ring(p.x, p.y + 150, 260, '#ffffff', .4);
  },
  press(a, inScene) { if (a === 'takeover' && !inScene) { swap(); return true; } return false; },
  guard(face) {                                     // it did hit him. That was the mistake
    if (dc <= 0) return false;
    const p = E.P1, o = E.P2;
    dc = 0; sfx.bf(); shake(32); V.impact(.3, o.x, o.y + 150); V.slash(o.x, o.y + 170, face > 0 ? Math.PI + .3 : -.3, 620, '#ffffff', 22);
    E.fx.push({ k: 2, x: p.x, y: p.y + 400, n: 'DEADLY COUNTER', col: '#ffffff', t: 0, life: 1.2 });
    if (!o.ko) E.applyHit(o, -face, { dmg: 999999, kb: 900, lift: 520, stun: .9, stop: .3, heavy: 1, col: '#ffffff', fixed: 1 });
    return true;
  }
});

/* ---------- wiring ---------- */
const move0 = H.move, m10 = H.m1, moveFx0 = H.moveFx, press0 = H.press, pow0 = H.power, guard0 = H.guard, tick0 = H.tick, under0 = H.under, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
H.move = k => { const m = movesOf(held())[SLOTS.indexOf(k)]; return m || move0(k); };
H.m1 = i => {
  const t = held();
  if (t && t.every) { if (m1cd > 0) return false; m1cd = t.every; }
  return m10(i);
};
H.moveFx = (p, m) => { moveFx0(p, m); const t = held(); if (t && t.m1 && m.def === M.m1[m.i]) m.def = t.m1(m.i); };
H.press = (a, inScene) => {
  if (!inScene && live && toji() && SLOTS.includes(a) && !movesOf(held())[SLOTS.indexOf(a)]) return true;   // nothing on that key: he has no cursed energy to put there
  return press0 ? press0(a, inScene) : false;
};
H.power = (h, o) => {
  const k = pow0 ? pow0(h, o) : 1, m = E.P1.move;
  if (h.tool) return h.tool * mult() / (h.dmg * (o.dr || 1));                    // a tool's own damage: the stated amount, and three times that for Toji
  return held() && o === E.P2 && m && m.def.m1 && !h.fixed ? k * mult() : k;      // an ordinary strike with a tool in his hand
};
H.guard = (face, a) => {
  if (purg > 0 && live) {                           // Purgatory, and something has hit him
    const p = E.P1;
    purg = 0; demonT = DEMON_TIME; p.hp = p.max; p.inv = Math.max(p.inv, 1.2);
    if (p.move) E.endMove(p);
    for (const k of SLOTS) E.cd[k] = 0;
    sfx.bf(); shake(34); V.impact(.45, p.x, p.y + 150); V.ring(p.x, p.y + 150, 420, DEMON, .5);
    E.banner('天獄の間・煉獄', 'PURGATORY', 'sm'); dress();
    return true;
  }
  return guard0 ? guard0(face, a) : false;
};
H.tick = dt => {
  tick0(dt);
  if (!live) return;
  if (m1cd > 0) m1cd -= dt;
  if (dc > 0) dc -= dt;
  if (dcCd > 0) dcCd -= dt;
  if (purg > 0) purg -= dt;
  if (demonT > 0 && (demonT -= dt) <= 0) { shout(E.P1, 'THE KATANA IS GONE', DEMON); dress(); }
  if (root) {                                       // held where it stands while they have hold of it
    const o = root.o;
    if ((root.t -= dt) <= 0 || o.ko || o !== E.P2) root = null;
    else { o.vx = 0; if (o.state === 'idle' || o.state === 'act' || o.state === 'up') Object.assign(o, { state: 'hurt', stun: .3, act: null, tele: 0 }); }
  }
  for (let i = dots.length - 1; i >= 0; i--) {
    const d = dots[i];
    if (d.o !== E.P2 || d.o.ko) { dots.splice(i, 1); continue; }
    if ((d.t -= dt) > 0) continue;
    d.t = d.every; chip(d.o, d.per, d.col); V.sparks(d.o.x, d.o.y + 170, 'red', 3);
    if (--d.left <= 0) dots.splice(i, 1);
  }
};
H.under = dt => {
  under0(dt);
  if (!root) return;
  const o = root.o, T = E.T, a = Math.min(1, root.t);                              // the demons: hands up out of the floor, round its legs
  for (let i = 0; i < 7; i++) {
    const c = F(o.x + (i - 3) * 34 + Math.sin(T * 3 + i) * 8, 0), k = c[2], h = (70 + 50 * Math.sin(T * 5 + i * 1.3)) * k;
    g.fillStyle = `rgba(20,4,8,${.9 * a})`; g.strokeStyle = `rgba(194,24,43,${a})`; g.lineWidth = 2;
    g.beginPath(); g.rect(c[0] - 9 * k, c[1] - h, 18 * k, h); g.fill(); g.stroke();
    for (let f = -1; f <= 1; f++) { g.beginPath(); g.rect(c[0] + (f * 8 - 3) * k, c[1] - h - 16 * k, 6 * k, 18 * k); g.fill(); g.stroke(); }
  }
};
H.fx = dt => {
  fx0(dt);
  if (!live) return;
  const p = E.P1, t = held();
  if (t && !p.dead && !(p.alpha < .05)) weapon(p, t);
  if (dc > 0 || purg > 0) {                         // a counter is up: the ring round him says for how long
    const c = F(p.x, p.y + 150), r = 150 * c[2], u = dc > 0 ? dc / COUNTER : purg / 1.2;
    g.strokeStyle = dc > 0 ? 'rgba(255,255,255,.9)' : 'rgba(194,24,43,.9)'; g.lineWidth = 4;
    g.beginPath(); g.arc(c[0], c[1], r, -Math.PI / 2, -Math.PI / 2 + TAU * u); g.stroke();
    g.setLineDash([8, 14]); g.lineWidth = 2; g.beginPath(); g.arc(c[0], c[1], r * 1.14, E.T * 2, E.T * 2 + TAU); g.stroke(); g.setLineDash([]);
  }
};
const clear = () => { m1cd = dc = dcCd = purg = demonT = 0; root = null; dots.length = 0; };
H.reset = () => {
  reset0(); clear(); live = false;
  if (dressed) { for (const k of SLOTS) { E.hud.mv[k].querySelector('b').textContent = BASE.names[k]; E.CD[k] = BASE.cd[k]; } dressed = false; }
  strip.classList.remove('on');
};
H.fightStart = (cfg, wave) => { if (!wave) clear(); start0(cfg, wave); if (live) dress(); };
// Free Exploration and Training call this after the technique and the clan have been put on
function apply() { live = true; if (!TOOLS[S.slots[S.cur]]) S.cur = Math.max(0, S.slots.findIndex(x => TOOLS[x])); dress(); }

/* ---------- the Cursed Tools screen: the reel, the pockets, the four cards ---------- */
let spinning = false, pick = 0;                     // which pocket the next tool goes into
const count = () => (C.equipped === 'toji' ? 3 : 1);
const roll = () => { let r = Math.random() * 100; for (const id of ORDER) if ((r -= TOOLS[id].odds) < 0) return id; return ORDER[0]; };
const tile = id => { const t = TOOLS[id]; return `<i class="tile" style="--c:${t.col}"><b lang="ja">${t.mark}</b><span>${t.name}</span></i>`; };
function put(id) { S.slots[pick] = id; if (pick >= count()) pick = 0; save(); }
// since the public release a card gives him only a tool he has spun or bought (shop.js keeps the list), and a spin uses a cursed tool spin
const mine = id => !JU.shop || JU.shop.owns('tool', id);
const nope = el => { el.classList.remove('no'); void el.offsetWidth; el.classList.add('no'); sfx.back(); };
const retix = no => { const el = document.getElementById('tix'); if (el && JU.shop) el.outerHTML = JU.shop.tix('tl', no); };
// and what is in his pockets has to be his: called when the page loads (shop.js)
function check(owns, demon) {
  let ch = false;
  S.slots = S.slots.map(id => (id && !owns(id) ? (ch = true, null) : id));
  if (S.demon && !demon) { S.demon = false; ch = true; }
  if (ch) save();
}
function mount(body) {
  const n = count(), where = ['In hand', 'Cursed spirit, round the neck', 'Waist'];
  if (pick >= n) pick = 0;
  body.innerHTML = `<div class="reelbox"><div class="reel"><div class="strip" id="strip">${ORDER.concat(ORDER, ORDER).map(tile).join('')}</div><u></u></div>
      <button class="spinb" id="spinb">Spin<span lang="ja">回</span></button><div class="rres" id="tres" aria-live="polite"></div></div>
    ${JU.shop ? JU.shop.tix('tl') : ''}
    <div class="pockets">${Array.from({ length: n }, (_, i) => { const t = TOOLS[S.slots[i]]; return `<button class="pocket${i === pick ? ' on' : ''}" data-pocket="${i}" style="--c:${t ? t.col : '#555'}" aria-label="${where[i]}: ${t ? nameOf(t) : 'empty'}"><small>${n > 1 ? where[i] : 'Your cursed tool'}</small><b>${t ? nameOf(t) : 'Empty'}</b></button>`; }).join('')}</div>
    <div class="tcards wcards">${ORDER.map(id => { const t = TOOLS[id]; return `<button class="wcard${S.slots.slice(0, n).includes(id) ? ' on' : ''}${mine(id) ? '' : ' lock'}" data-tool="${id}" style="--c:${t.col}" aria-label="Take the ${t.name}${mine(id) ? '' : ', not yours yet'}"><b lang="ja">${t.mark}</b><span>${t.name}</span><i>${t.odds}%</i><p>${t.what}</p></button>`; }).join('')}</div>
    <button class="formb${S.demon ? ' on' : ''}${demonOk() ? '' : ' lock'}" id="formb"><b>${S.demon ? DEMONLY.name : demonOk() ? 'Dagger' : DEMONLY.name}</b><small>${demonOk() ? 'The dagger’s form · click to change' : 'The dagger’s other form · sealed · a questline to come'}</small><p>${S.demon || !demonOk() ? DEMONLY.what : TOOLS.dagger.what}</p></button>
    <p class="fine">${n > 1 ? 'The Toji clan carries three: pick a pocket, then spin or take a card to fill it. In a fight, T switches between them.' : 'You carry one cursed tool. It is used in place of a cursed technique, in Free Exploration and Training: its moves are on the first keys when no technique is equipped. The Toji clan carries three.'}${JU.shop && JU.shop.PAID ? ' A spin uses a cursed tool spin, and what it lands on is yours: after that its card puts it in your pocket.' : ''}</p>`;
}
function spin() {
  if (spinning) return;
  if (JU.shop && !JU.shop.take('tl')) { nope(document.getElementById('spinb')); retix(true); return; }      // no cursed tool spin, no spin
  retix();
  const strip = document.getElementById('strip'), res = document.getElementById('tres'), id = roll(), seq = Array.from({ length: 30 }, roll), dur = JU.reduceMotion ? 300 : 3200;
  seq[26] = id; spinning = true; res.innerHTML = '';
  strip.style.transition = 'none'; strip.style.transform = 'translateX(0)'; strip.innerHTML = seq.map(tile).join('');
  void strip.offsetWidth;
  const w = strip.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(strip).columnGap || 0), view = strip.parentNode.getBoundingClientRect().width;
  strip.style.transition = `transform ${dur}ms cubic-bezier(.12,.72,.14,1)`; strip.style.transform = `translateX(${-(26 * w + w / 2 - view / 2)}px)`;
  const tick = setInterval(() => sfx.hover(), 110);
  setTimeout(() => {
    const t = TOOLS[id], body = document.getElementById('pBody'), r = strip.parentNode.getBoundingClientRect();
    clearInterval(tick); spinning = false; if (JU.shop) JU.shop.grant('tool', id); put(id);
    JU.flash(r.left + r.width / 2, r.top + r.height / 2); if (t.odds <= 1) { sfx.bf(); JU.bolts(r.left + r.width / 2, r.top + r.height / 2, 30); } else sfx.confirm();
    if (body && document.getElementById('strip')) { mount(body); document.getElementById('strip').innerHTML = [id, id, id].map(tile).join(''); document.getElementById('tres').innerHTML = `<small>You spun · ${t.odds}%</small><b style="color:${t.col}">${t.name}</b><span lang="ja">${t.jp}</span><p>${t.what}</p>`; }
  }, dur + 120);
}
document.addEventListener('click', e => {
  const body = document.getElementById('pBody'), k = e.target.closest('[data-tool]'), pk = e.target.closest('[data-pocket]');
  if (e.target.closest('#spinb')) { spin(); return; }
  if (spinning) return;
  if (e.target.closest('#formb')) { if (!demonOk()) { nope(e.target.closest('#formb')); return; } S.demon = !S.demon; save(); sfx.confirm(); mount(body); return; }
  if (pk) { pick = +pk.dataset.pocket; sfx.hover(); mount(body); return; }
  if (!k) return;
  if (!mine(k.dataset.tool)) {                      // not his: he has not spun it
    const t = TOOLS[k.dataset.tool], res = document.getElementById('tres');
    nope(k); if (res) res.innerHTML = `<small>Sealed · not yours yet</small><b style="color:${t.col}">${t.name}</b><span lang="ja">${t.jp}</span><p>Spin the reel for it (${t.odds}%).</p>`;
    return;
  }
  const r = k.getBoundingClientRect();
  put(k.dataset.tool); sfx.confirm(); JU.flash(r.left + r.width / 2, r.top + r.height / 2); mount(body);
});

JU.tools = { TOOLS, ORDER, mount, apply, roll, check, ENDS, TOJI, get state() { return { live, slots: S.slots.slice(), cur: S.cur, demon: S.demon, dc, dcCd, purg, demonT, m1cd, dots: dots.length, held: held() && held().id }; } };
})();
