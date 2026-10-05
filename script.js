/* JUJUTSU UNLIMITEDS — the chapter runner: a chapter is a list of beats (scenes and fights) played in order */
(() => {
'use strict';

const E = JU.eng, C = JU.cast, Fi = JU.fights, V = JU.vfx, ST = JU.stages, D = JU.sets, sfx = JU.sfx, cam = E.cam, root = E.root, H = E.hooks;
const { clamp, rnd, ZP } = E, cut = JU.school.cut, nm = Fi.nm, fade = root.querySelector('#fade');
const CH = [], NUM = ['', '壱', '弐', '参', '肆', '伍', '陸', '漆', '捌', '玖', '拾', '拾壱', '拾弐', '拾参', '拾肆', '拾伍', '拾陸', '拾漆', '拾捌', '拾玖', '弐拾', '弐拾壱', '弐拾弐', '弐拾参', '弐拾肆', '弐拾伍', '弐拾陸', '弐拾漆', '弐拾捌', '弐拾玖', '参拾'];
const DONE = [], onStage = { cast: [], foe: null };    // chapters finished (kept between visits), and who is on stage in the current scene
try {
  DONE.push(...JSON.parse(localStorage.getItem('ju.done') || '[]'));
  // Finished chapters were not recorded before build 0.17. A save from then with all of season two finished and nothing from season one
  // is somebody who played season one before anyone was counting: count it, once
  if (!localStorage.getItem('ju.seasons')) {
    if ([8, 9, 10, 11, 12].every(n => DONE.includes(n)) && !DONE.some(n => n < 8)) { DONE.push(1, 2, 3, 4, 5, 6, 7); localStorage.setItem('ju.done', JSON.stringify(DONE)); }
    localStorage.setItem('ju.seasons', '1');
  }
} catch (e) {}
const STAGES = { shrine: () => E.SHRINE, school: () => ST.school, street: () => ST.street(2600), domain: () => D.domain, morgue: () => D.morgue };
const stand = c => { const f = E.fighter(c[0], c[1], c[2] || 1); f.pose = C.STAND.slice(); f.target = C.STAND; if (c[3]) f.scale = c[3]; if (c[4]) f.z = ZP + c[4]; return f; };
const nobody = () => { const f = Fi.make('grunt', 800); f.alpha = 0; f.ko = true; f.state = 'down'; return f; };
let ally = null, mid = null, token = 0;

// a story fight can hand the player a domain to open with G
function grant(kind) { if (JU.domain) JU.domain.granted = kind || null; if (kind) root.dataset.g = '1'; else delete root.dataset.g; }
function setup() { V.clear(); ST.clear(); JU.sukuna.revert(); JU.tech.revert(); grant(null); ally = null; mid = null; for (const k in E.cd) E.cd[k] = 0; }
// a Domain Expansion that closes one beat and opens the next under its own white-out
const expand = (who, tone, next) => { if (!JU.domain.open({ who, tone, reveal: () => next(true) })) next(); };

/* ---------- beat: a conversation ----------
   { stage, p1: [skin, x], cast: [[skin, x, face, scale, how far back]], foe: [id, x], card: [jp, en], lines, cx, zoom, setup(cast, foe),
     domain: tone (it ends with the foe, or the first of the cast, opening a domain) } */
function scene(b, next, first, now) {
  const go = () => {
    setup();
    const foe = b.foe ? Fi.make(b.foe[0], b.foe[1]) : nobody();
    foe.ai = null;
    E.arena({ stage: STAGES[b.stage](), foe, skin: b.p1 ? b.p1[0] : E.YUJI, p1x: b.p1 ? b.p1[1] : -260, yaw: -.25 });
    const p = E.P1, cast = (b.cast || []).map(stand), at = b.foe ? foe : cast[0];
    onStage.cast = cast; onStage.foe = foe;
    if (b.setup) b.setup(cast, foe);
    if (b.foe) foe.face = p.x > foe.x ? 1 : -1;
    fade.classList.remove('on');
    if (b.card) Fi.later(first ? 1700 : 500, () => E.banner(b.card[0], b.card[1], 'sm'));
    cut({
      extra: () => cast, look: () => (at ? at.x : p.x + 1), cx: () => (b.cx === undefined ? (at ? (p.x + at.x) / 2 : p.x) : b.cx), zoom: b.zoom,
      delay: (b.card ? 2000 : 800) + (first ? 1200 : 0), lines: b.lines, then: b.domain ? () => expand(at, b.domain, next) : next,
      tick(real) { for (const f of cast) C.stroll(f, false, real); }
    });
  };
  if (now) go(); else { fade.classList.add('on'); Fi.later(700, go); }   // a Domain Expansion hands over under its own white-out instead
}

/* ---------- beat: a fight ----------
   { foes, stage, label, card, as: { skin, tech, name: [en, jp], hp, domain }, ally: { skin, call, col, dmg, scale },
     mid: { at, low (or once the player is down to this share of his health), foe, lines, fn, after,
            ends (the fight is over after these lines, with nobody knocked out), domain: tone (and the foe opens a domain on the way out) },
     as.sealed (his technique has been taken: strikes only), floor, rage, win: [jp, en],
     domain: tone (the player ends it with a Domain Expansion) } */
function fightBeat(b, next) {
  fade.classList.add('on');
  Fi.later(700, () => {
    setup();
    const a = b.as || {};
    if (a.tech) JU.tech.apply(a.tech);
    grant(a.domain);
    Fi.start({ foes: b.foes, stage: STAGES[b.stage](), label: b.label || 'Story', floor: b.floor, rage: b.rage, win: b.domain ? null : b.win, wait: b.domain ? 1400 : 0,
      onWin() {
        ally = null; mid = null;
        if (!b.domain) { next(); return; }
        if (E.P1.move) E.endMove(E.P1);
        JU.domain.open({ who: E.P1, tone: b.domain, reveal: () => next(true) });
      } });
    E.P1.skin = a.skin || E.YUJI;
    nm.p1.textContent = a.name ? a.name[0] : 'Yuji Itadori'; nm.p1j.textContent = a.name ? a.name[1] : '虎杖悠仁';
    if (a.hp) E.P1.max = E.P1.hp = a.hp;
    if (a.sealed) { JU.boss.seal(9999); Fi.later(1700, () => E.fx.push({ k: 2, x: E.P1.x, y: 335, n: 'CURSED ENERGY CONFISCATED  ·  STRIKES ONLY', col: '#e2c060', t: 0, life: 2.4 })); }
    if (a.domain) Fi.later(1700, () => { if (JU.domain.granted) E.fx.push({ k: 2, x: E.P1.x, y: 335, n: 'G  ·  DOMAIN EXPANSION', col: '#ff2440', t: 0, life: 2 }); });
    if (b.ally) { const f = stand([b.ally.skin, -700, 1, b.ally.scale]); f.z = ZP + 190; ally = { f, a: b.ally, t: 3.5 }; }
    mid = b.mid ? Object.assign({ done: false, next }, b.mid) : null;
    fade.classList.remove('on');
    if (b.card) E.banner(b.card[0], b.card[1], 'sm');
  });
}

// the fight stops dead for a few lines, then picks up where it left off
function interlude(m) {
  const p = E.P1, o = E.P2;
  Fi.fight.paused = true;
  if (p.move) E.endMove(p);
  Object.assign(p, { ps: null, vx: 0, dashT: 0 });
  Object.assign(o, { state: 'idle', act: null, tele: 0, vx: 0, vy: 0, y: 0, ground: true });
  if (m.fn) m.fn(p, o);
  cut({
    look: () => o.x, cx: () => (p.x + o.x) / 2, extra: () => (ally ? [ally.f] : []), lines: m.lines,
    then() {
      if (m.ends) { ally = null; mid = null; if (m.domain) expand(o, m.domain, m.next); else m.next(); return; }
      E.setScene(null); cam.lift = 0; Fi.fight.paused = false; if (m.after) m.after(p, o);
    }
  });
}

const cast0 = H.cast, tick0 = H.tick, reset0 = H.reset;
H.cast = () => { const c = cast0(); return ally ? (c || []).concat(ally.f) : c; };
H.tick = dt => {
  tick0(dt);
  const o = E.P2, p = E.P1;
  if (ally) {                                     // a partner who hangs back and steps in every few seconds
    const f = ally.f, a = ally.a;
    f.face = o.x >= f.x ? 1 : -1;
    f.x += (clamp(p.x - p.face * 420, -900, 900) - f.x) * Math.min(1, dt * 1.5);
    C.stroll(f, false, dt);
    if (!o.ko && o.state !== 'down' && !(o.alpha < 1) && !Fi.fight.paused && (ally.t -= dt) <= 0) {
      ally.t = rnd(6, 8.5);
      E.fx.push({ k: 2, x: f.x, y: 370, n: a.call, col: a.col, t: 0, life: 1.1 }); sfx.charge();
      E.after(.35, () => {
        if (o.ko) return;
        E.applyHit(o, f.face, { dmg: a.dmg || 9, kb: 280, lift: 380, stun: .7, stop: .08, heavy: 1, col: a.col });
        for (let i = 0; i < 4; i++) V.slash(o.x + rnd(-30, 30), o.y + rnd(90, 230), rnd(-1, 1) + (i % 2 ? Math.PI : 0), 260, a.col, 10, i * .03);
      });
    }
  }
  if (mid && !mid.done && !Fi.fight.paused && !o.ko && !p.dead && (o.hp <= o.max * mid.at || (mid.low && p.hp <= p.max * mid.low)) &&
    (!mid.foe || Fi.fight.cfg.foes[Fi.fight.wave] === mid.foe)) { mid.done = true; interlude(mid); }
};
H.reset = () => { reset0(); token++; grant(null); ally = null; mid = null; };

/* ---------- chapters ---------- */
const add = (n, title, beats) => { CH[n] = { n, title, beats }; };
function run(beats, i, n, my, now) {
  const b = beats[i];
  (b.foes ? fightBeat : scene)(b, soon => { if (my !== token) return; if (i + 1 < beats.length) run(beats, i + 1, n, my, soon); else done(n); }, i === 0, now);
}
function play(n) {
  const c = CH[n], my = ++token;
  root.classList.remove('cine');
  E.banner('第' + NUM[n] + '章', c.title.toUpperCase(), 'sm');
  if (c.start) c.start(); else run(c.beats, 0, n, my);
}

// the story is told in seasons, the way the anime is
const SEASONS = [
  { n: 1, jp: '第一期', from: 1, about: 'The vessel, the school, the Goodwill Event' },
  { n: 2, jp: '第二期', from: 8, about: 'Hidden Inventory and Shibuya' },
  { n: 3, jp: '第三期', from: 13, about: 'The Culling Game, and the road to Shinjuku' }
];
const span = s => CH.filter(c => c && c.n >= s.from && c.n < ((SEASONS[s.n] || {}).from || 999));   // SEASONS[s.n] is the season after s
const seasonOf = n => SEASONS.filter(s => n >= s.from).pop();
const did = c => DONE.includes(c.n);

function finish(n) {
  if (!DONE.includes(n)) { DONE.push(n); try { localStorage.setItem('ju.done', JSON.stringify(DONE)); } catch (e) {} }
  if (JU.shop) JU.shop.earn(20);                  // a finished chapter pays
}
function done(n) {
  const my = ++token, s = seasonOf(n), last = span(s).pop().n === n;
  root.classList.add('cine');
  finish(n);
  E.banner('完', last ? `SEASON ${s.n} COMPLETE` : `CHAPTER ${n} COMPLETE`, 'sm'); sfx.confirm();
  Fi.later(3000, () => {
    if (my !== token) return;
    if (CH[n + 1]) play(n + 1);
    else { E.banner('続', 'TO BE CONTINUED', 'sm'); Fi.later(3400, () => JU.exitGame()); }
  });
}

// chapters 1-3 were built by hand before the runner existed; they just need a way in.
// 1 and 2 run straight on into the next chapter, so each counts as finished the moment the next one begins
const school0 = JU.school.begin, vow0 = JU.chapter3.begin;
JU.school.begin = () => { finish(1); school0(); };
JU.chapter3.begin = () => { finish(2); vow0(); };
CH[1] = { n: 1, title: 'Black Flash' };
CH[2] = { n: 2, title: 'The School', start: school0 };
CH[3] = { n: 3, title: 'The Vow', start: () => JU.chapter3.enter() };

// the Play screen: story (pick a season, then one of its chapters), free exploration, training, and the Maki fight when Naoya's technique is equipped
function seasonRow() {
  return `<div class="seasons">${SEASONS.map(s => {
    const cs = span(s), d = cs.filter(did).length;
    return `<button class="mode seas${d === cs.length ? ' did' : ''}" data-season="${s.n}" aria-label="Season ${s.n}: chapters ${cs[0].n} to ${cs[cs.length - 1].n}, ${d} of ${cs.length} finished">
      <b>S${s.n}</b><span lang="ja">${s.jp}</span><i>Chapters ${cs[0].n}–${cs[cs.length - 1].n}</i><u>${d}/${cs.length}</u></button>`;
  }).join('')}</div>`;
}
function chapterRow(s) {
  const cs = span(s), cols = cs.length > 12 ? Math.ceil(cs.length / 3) : cs.length > 5 ? Math.ceil(cs.length / 2) : cs.length;   // one row, two, or three for a long season
  return `<div class="seahd"><button class="sback" data-season="0" aria-label="Back to the seasons">‹ Seasons</button><b>Season ${s.n}</b><span lang="ja">${s.jp}</span><i>${s.about}</i></div>
    <div class="chaps" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${cs.map(c => `<button class="mode chap${did(c) ? ' did' : ''}" data-mode="story" data-ch="${c.n}" aria-label="Chapter ${c.n}: ${c.title}${did(c) ? ' (finished)' : ''}"><b>${c.n}</b><i>${c.title}</i></button>`).join('')}</div>`;
}
document.addEventListener('click', e => {         // a season opens onto its chapters; "Seasons" goes back to the three buttons
  const b = e.target.closest('[data-season]'), box = b && b.closest('#sbox');
  if (!box) return;
  const s = SEASONS[+b.dataset.season - 1], was = box.dataset.s;
  box.innerHTML = s ? chapterRow(s) : seasonRow();
  box.dataset.s = s ? s.n : '';
  if (s) sfx.confirm(); else sfx.back();
  const f = box.querySelector(s ? '.chap' : `[data-season="${was}"]`);
  if (f) f.focus({ preventScroll: true });
});

function mount(body) {
  const naoya = JU.tech.equipped === 'projection', nx = CH.find(c => c && !did(c)) || CH[1];
  body.innerHTML = `<div class="modes">
    <button class="mode" data-mode="story" data-ch="${nx.n}"><b>Story Mode</b><span lang="ja">物語</span><i>${nx.n > 1 ? `Carry on from chapter ${nx.n}, ${nx.title}` : 'From the first Black Flash onward'}. Or pick a season:</i></button>
    <div class="sbox" id="sbox">${seasonRow()}</div>
    <div class="duo">
      <button class="mode" data-mode="free"><b>Free Exploration</b><span lang="ja">自由探索</span><i>Roam Tokyo and exorcise the curses you run into. The subway at the east end of the block goes to Shibuya and to Kyoto, once you have exorcised ten and finished Season 1.</i></button>
      <button class="mode" data-mode="training"><b>Training</b><span lang="ja">修練</span><i>A training curse that never fights back. Test your technique and clan on it.</i></button>
      ${naoya ? `<button class="mode" data-mode="maki" style="border-left-color:#ffd23d"><b>Maki Fight</b><span lang="ja" style="color:#ffd23d">真希</span>
        <i>Naoya against Maki Zenin, up in the mountains. Here because Projection Sorcery is equipped.${JU.shop && JU.shop.PAID ? ` Costs ${JU.shop.FEES.maki} Cursed Tokens a go: you have ${JU.shop.tokens}.` : ''}</i></button>` : ''}
    </div>
  </div>`;
}

JU.chapters = { add, play, done, mount, STAGES, CH, DONE, SEASONS, now: onStage,
  // a mid-fight scene is still to come for whoever is being fought: the fight must not be over before it
  get pending() { return !!mid && !mid.done && !!Fi.fight.cfg && (!mid.foe || Fi.fight.cfg.foes[Fi.fight.wave] === mid.foe); } };
})();
