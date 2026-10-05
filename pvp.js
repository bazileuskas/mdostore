/* JUJUTSU UNLIMITEDS — One v Ones: a duel with somebody who is on the same server (mp.js).
   He is challenged from the list of who is on the server. If he takes it, each of the two bans one cursed technique (neither may then use
   either), each picks one of what is left, and they fight: no clan, no cursed tool, the technique and nothing else.
   How two games fight each other when neither is a server: each one runs its own fighter, and is the judge of what happens to him. The
   other one is a puppet on this screen, standing and posing as its owner's game says it is. When a blow of mine lands on the puppet, my game
   tells its owner how hard; his game decides whether he blocked it or was already out of the way, takes the health off, and says what he
   has left. So what I see of him is a moment old, and a hit is counted where the one who threw it saw it land.
   Every technique was built to fight curses with hundreds of health while he has a hundred, so in a duel both are given the same large
   amount (HP), and no one blow may take more than a share of it (CAP). What is not carried across: the other one's technique as drawn by
   its own file (a beam, a shikigami). His body, his blows, the sparks, slashes and rings they throw up are */
(() => {
'use strict';

const E = JU.eng, H = E.hooks, Fi = JU.fights, S = JU.street, M = JU.mp, V = JU.vfx, sfx = JU.sfx, T = JU.tech;
const HP = 600, CAP = .4, K = 100 / HP;              // what each has in a duel (it was 1200: fights went on too long); the most one blow may take; and what that makes of his own hundred
const ASK_T = 20, BAN_T = 25, PICK_T = 30, SEND = 1 / 30, BUNCH = .08, QUIET = 10, BREAK = 2.6;
const esc = x => String(x).replace(/[<>&"]/g, '');
const r2 = v => Math.round(v * 100) / 100;

let D = null;                                       // the duel being arranged or fought: { pid, name, host, phase, bans, picks, t }
let F = null;                                       // and the fight itself, while it lasts
let mute = false, clock = 0;
const REC = { w: 0, l: 0 };
try { Object.assign(REC, JSON.parse(localStorage.getItem('ju.pvp') || '{}')); } catch (e) {}
const keep = () => { try { localStorage.setItem('ju.pvp', JSON.stringify(REC)); } catch (e) {} };

/* ---------- who may be picked ---------- */
const board = () => T.ORDER.filter(id => T.TECH[id]);
// an awakened or Early Access technique is his to pick only if it is his. Everything else is open to both, whatever they hold
const shut = id => { const t = T.TECH[id]; return !!(t.awakened || t.early) && !(JU.shop && JU.shop.allowed(id)); };
const free = () => E.root.dataset.mode === 'street' && S.st && S.st.free && !S.st.hold && !S.st.talk && M.on;
const say = (pid, m) => M.to(pid, Object.assign({ t: 'duel' }, m));

/* ---------- on screen: a line at the top, the challenge, the board ---------- */
const toastEl = document.createElement('div'); toastEl.className = 'dtoast'; E.root.appendChild(toastEl);
const box = document.createElement('div'); box.className = 'duel'; E.root.appendChild(box);
let toastT = 0;
function toast(text, col) { toastEl.textContent = text; toastEl.style.setProperty('--c', col || '#7fe9ff'); toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 4200); }
function hold(v) { if (S.st) S.st.hold = v; if (v) E.keys.clear(); }
function shut0() { box.className = 'duel'; box.innerHTML = ''; clearInterval(clock); }
const left = () => Math.max(0, Math.ceil((D.t - Date.now()) / 1000));

function paint() {
  const d = D;
  if (!d || d.phase === 'fight' || d.phase === 'over') { shut0(); return; }
  if (d.phase === 'ask') { box.className = 'duel on small'; box.innerHTML = `<div class="dask"><b>Challenge sent</b><p>Waiting for ${esc(d.name)} to answer.</p><div><button type="button" data-d="quit">Cancel</button></div><em data-left>${left()}</em></div>`; return; }
  if (d.phase === 'asked') { box.className = 'duel on small'; box.innerHTML = `<div class="dask"><b>1 v 1</b><p><u>${esc(d.name)}</u> challenges you. One ban each, one technique each, no clans, no cursed tools.</p><div><button type="button" data-d="yes" class="go">Accept <kbd>Y</kbd></button><button type="button" data-d="no">Decline <kbd>N</kbd></button></div><em data-left>${left()}</em></div>`; return; }
  const ban = d.phase === 'ban', vs = d.phase === 'vs', mineId = ban ? d.bans.me : d.picks.me, theirs = ban ? d.bans.them : d.picks.them;
  const cards = board().map(id => {
    const t = T.TECH[id], banned = !ban && (d.bans.me === id || d.bans.them === id), no = !ban && shut(id), cls = ['dc', banned ? 'ban' : '', no && !banned ? 'no' : '', mineId === id ? 'me' : '', vs && theirs === id ? 'them' : ''].filter(Boolean).join(' ');
    const tag = banned ? 'Banned' : no ? (t.early ? 'Early Access' : 'Not awakened') : t.awakened ? 'Awakened' : t.early ? 'Early Access' : t.base ? 'No technique' : '';
    return `<button type="button" class="${cls}" data-id="${id}" style="--c:${t.col}"${banned || no || mineId !== undefined || vs ? ' disabled' : ''}><b lang="ja">${esc(t.mark || (t.jp || '')[0] || '')}</b><span>${esc(t.name)}</span><small>${tag}</small></button>`;
  }).join('');
  const nameOf = id => (id === undefined ? 'choosing…' : id === '' ? (ban ? 'no ban' : '…') : esc(T.TECH[id].name));
  box.className = 'duel on';
  box.innerHTML = `<div class="dbox"><header><b>1 v 1</b><span>${esc(M.myName())} <i>vs</i> ${esc(d.name)}</span><em data-left>${vs ? '' : left()}</em></header>
    <p class="dstep">${vs ? 'Fight.' : ban ? '<u>Ban</u> one cursed technique. Neither of you will be able to use it.' : '<u>Pick</u> your cursed technique. No clans, no cursed tools: this and nothing else.'}</p>
    <div class="dgrid">${cards}</div>
    <footer><span>You: <u>${ban || vs || mineId === undefined ? nameOf(mineId) : esc(T.TECH[mineId].name)}</u></span><span>${esc(d.name)}: <u>${vs ? nameOf(theirs) : theirs === undefined ? 'choosing…' : 'ready'}</u></span><button type="button" data-d="quit">Leave</button></footer></div>`;
}
function watch(sec) {                               // every phase has a clock, and something that happens when it runs out
  D.t = Date.now() + sec * 1000; clearInterval(clock);
  clock = setInterval(() => {
    if (!D) { clearInterval(clock); return; }
    const el = box.querySelector('[data-left]'); if (el && D.phase !== 'vs') el.textContent = left();
    if (Date.now() < D.t) return;
    const d = D;
    if (d.phase === 'ask') { say(d.pid, { a: 'quit' }); over(`${d.name} did not answer.`); }
    else if (d.phase === 'asked') { say(d.pid, { a: 'no' }); over(''); }
    else if (d.phase === 'ban' && d.bans.me === undefined) choose('');
    else if (d.phase === 'pick' && d.picks.me === undefined) { const ok = board().filter(id => id !== d.bans.me && id !== d.bans.them && !shut(id)); choose(ok[Math.random() * ok.length | 0] || 'yuji'); }
    else if (d.phase === 'ban' || d.phase === 'pick') { say(d.pid, { a: 'quit' }); over(`${d.name} did not choose.`); }      // (a long while after he should have)
  }, 250);
}
// the arranging is over without a fight
function over(why, col) { const was = D; D = null; shut0(); if (was && was.phase !== 'ask' && was.phase !== 'asked') hold(false); if (why) toast(why, col || '#ff8a98'); M.paint(); }

/* ---------- arranging it ---------- */
function invite(pid) {
  const p = M.peer(pid);
  if (!p) return;
  if (D) { toast('One duel at a time.', '#ff8a98'); return; }
  if (!free()) return;
  if (p.st && (p.st.b || p.st.d)) { toast(`${p.name} is in a fight.`, '#ff8a98'); return; }
  D = { pid, name: p.name, host: true, phase: 'ask', bans: {}, picks: {} };
  say(pid, { a: 'ask' }); sfx.confirm(); watch(ASK_T); paint();
}
function draft() { D.phase = 'ban'; hold(true); watch(BAN_T); paint(); sfx.confirm(); M.paint(); }
function choose(id) {
  const d = D;
  if (!d) return;
  if (d.phase === 'ban' && d.bans.me === undefined) { d.bans.me = id; say(d.pid, { a: 'ban', id }); }
  else if (d.phase === 'pick' && d.picks.me === undefined) { if (!T.TECH[id] || id === d.bans.me || id === d.bans.them || shut(id)) return; d.picks.me = id; say(d.pid, { a: 'pick', id }); }
  else return;
  sfx.confirm(); step();
}
function step() {
  const d = D;
  if (d.phase === 'ban' && d.bans.me !== undefined && d.bans.them !== undefined) { d.phase = 'pick'; watch(PICK_T); }
  else if (d.phase === 'pick' && d.picks.me !== undefined && d.picks.them !== undefined) { d.phase = 'vs'; clearInterval(clock); paint(); setTimeout(() => { if (D === d && d.phase === 'vs') begin(); }, 1700); return; }
  else if (d.phase === 'ban' && d.bans.me !== undefined) d.t = Date.now() + (BAN_T + 20) * 1000;       // mine is in: what is left is waiting for his
  else if (d.phase === 'pick' && d.picks.me !== undefined) d.t = Date.now() + (PICK_T + 20) * 1000;
  paint();
}
M.hear('duel', (p, m) => {
  const d = D;
  if (m.a === 'ask') {
    if (d || !free()) { say(p.id, { a: 'busy' }); return; }
    D = { pid: p.id, name: p.name, host: false, phase: 'asked', bans: {}, picks: {} };
    sfx.charge(); watch(ASK_T); paint(); return;
  }
  if (!d || d.pid !== p.id) return;
  if (m.a === 'yes' && d.phase === 'ask') { if (free()) draft(); else { say(p.id, { a: 'quit' }); over(''); } }
  else if (m.a === 'no' && d.phase === 'ask') over(`${d.name} declined.`);
  else if (m.a === 'busy' && d.phase === 'ask') over(`${d.name} is busy.`);
  else if (m.a === 'ban' && d.phase === 'ban' && d.bans.them === undefined) { d.bans.them = T.TECH[m.id] ? m.id : ''; step(); }
  else if (m.a === 'pick' && d.phase === 'pick' && d.picks.them === undefined && T.TECH[m.id] && m.id !== d.bans.me && m.id !== d.bans.them) { d.picks.them = m.id; step(); }
  else if (m.a === 'quit') { if (d.phase === 'fight') finish(true, `${d.name} left the duel.`); else if (d.phase !== 'over') over(`${d.name} left the duel.`); }
  else if (m.a === 'hit') struck(m);
  else if (m.a === 'ko') finish(true);
  else if (m.a === 's' && F) { F.r = m; F.quiet = 0; if (m.fx) echo(m.fx); }
});
M.hear('gone', p => { const d = D; if (!d || d.pid !== p.id) return; if (d.phase === 'fight') finish(true, `${d.name} left the server.`); else if (d.phase !== 'over') over(`${d.name} left the server.`); });

// (the board is redrawn when the other one chooses. A mouse press counts at once, so a redraw between press and release cannot lose it)
box.addEventListener('pointerdown', e => { e.stopPropagation(); if (e.pointerType === 'mouse' && e.button === 0) act(e); });
box.addEventListener('click', act);
function act(e) {
  const b = e.target.closest('button'), d = D;
  if (!b || !d || b.disabled) return;
  if (b.dataset.id !== undefined) { choose(b.dataset.id); return; }
  const a = b.dataset.d;
  if (a === 'yes' && d.phase === 'asked') { if (!free()) { say(d.pid, { a: 'busy' }); over(''); return; } say(d.pid, { a: 'yes' }); draft(); }
  else if (a === 'no') { say(d.pid, { a: 'no' }); over(''); sfx.back(); }
  else if (a === 'quit') { say(d.pid, { a: 'quit' }); over(''); sfx.back(); }
}
addEventListener('keydown', e => {                  // while the board is up the keys are its own. Escape leaves the duel, not the game
  const d = D;
  if (!d || d.phase === 'fight' || d.phase === 'over' || e.target instanceof HTMLInputElement) return;
  const k = e.key.toLowerCase(), small = d.phase === 'ask' || d.phase === 'asked';
  if (k === 'escape') { e.preventDefault(); e.stopPropagation(); say(d.pid, { a: d.phase === 'asked' ? 'no' : 'quit' }); over(''); sfx.back(); return; }
  if (d.phase === 'asked' && (k === 'y' || k === 'n')) { e.preventDefault(); e.stopPropagation(); box.querySelector(`[data-d="${k === 'y' ? 'yes' : 'no'}"]`).click(); return; }
  if (!small) e.stopPropagation();                  // (a challenge waiting for its answer does not stop him walking)
}, true);

/* ---------- the fight ---------- */
function begin() {
  const d = D, mine = T.TECH[d.picks.me], his = T.TECH[d.picks.them];
  if (E.root.dataset.mode !== 'street') { say(d.pid, { a: 'quit' }); over(''); return; }
  d.phase = 'fight'; shut0(); hold(false);
  JU.clan.revert(); if (JU.tools) JU.tools.off(); T.revert(); T.apply(d.picks.me);      // the technique and nothing else. The tools go away first: put away afterwards, they would take the hotbar's names and cooldowns back to his bare hands'
  Fi.DEFS.pvp = { name: d.name, jp: his.name, skin: his.skin || E.YUJI, hp: HP, scale: his.scale || 1, speed: 0, range: 1e9, gap: [9, 9], atk: [], human: true };
  S.fight({ stay: true, cfg: { foes: ['pvp'], stage: E.SHRINE, label: '1 v 1', p1x: d.host ? -230 : 230, win: null, pvp: d, onLose: () => finish(false) } });
  Fi.nm.p1.textContent = M.myName(); Fi.nm.p1j.textContent = mine.name; Fi.nm.p2.textContent = d.name; Fi.nm.p2j.textContent = his.name;
}
// he is himself again: his own technique, his clan, his tools
function restore() { T.revert(); T.apply(); JU.clan.apply(); if (JU.tools) JU.tools.apply(); }
function finish(won, why) {
  const d = D;
  if (!d || d.phase !== 'fight') return;
  d.phase = 'over';
  if (F) F.over = true;
  if (!won) { const p = E.P1; say(d.pid, { a: 'ko' }); if (!p.dead) { p.dead = true; p.ps = p.ground ? 'down' : 'air'; p.stun = 99; } }
  if (won) REC.w++; else REC.l++; keep();
  E.slow(.7); E.banner(won ? '勝利' : '敗北', won ? 'VICTORY' : 'DEFEATED');
  if (won) sfx.confirm();
  if (why) toast(why);
  const cfg = Fi.fight.cfg;
  Fi.later(3400, () => { if (Fi.fight.cfg !== cfg || D !== d) return; F = null; D = null; restore(); cfg.onWin(); M.paint(); toast(`${won ? 'You beat' : 'You lost to'} ${d.name}. Your record: ${REC.w} won, ${REC.l} lost.`, won ? '#ffd23d' : '#ff8a98'); });
}
// leaving the game in the middle of it
function abort() {
  const d = D;
  if (!d) return;
  if (d.phase !== 'over') say(d.pid, { a: d.phase === 'asked' ? 'no' : 'quit' });
  if (d.phase === 'fight') { REC.l++; keep(); }
  if (d.phase === 'fight' || d.phase === 'over') restore(); else hold(false);
  F = null; D = null; shut0(); clearInterval(clock);
}
const exit0 = JU.exitGame;
JU.exitGame = () => { abort(); exit0(); };

// a blow of his has landed on what his game shows of me
function struck(m) {
  if (!F || F.over || typeof m.dmg !== 'number' || !(m.dmg >= 0)) return;
  F.got = m.n | 0;
  const dmg = Math.min(m.dmg, HP * CAP) * K, face = m.f < 0 ? -1 : 1;
  mute = true;
  if (m.kb || m.lift || m.stun) { const a = { dmg, exact: 1, shown: dmg / K, kb: Math.min(+m.kb || 0, 1400), stun: Math.min(+m.stun || .3, 1.2) }; if (m.lift) a.lift = Math.min(+m.lift, 900); Fi.hurt(face, a, 1); }
  else Fi.chip(dmg, '#ff5a6e');                      // nothing behind it: rot, bleeding, a domain's sure-hit
  mute = false;
}
// what his blows threw up, drawn here as well
const RAW = {};
for (const k of Object.keys(V)) {
  if (k === 'clear' || typeof V[k] !== 'function') continue;
  const f = RAW[k] = V[k];
  V[k] = function (...a) {
    if (F && !F.over && !mute && F.out.length < 40 && a.every(x => x === undefined || typeof x === 'number' || typeof x === 'string' || typeof x === 'boolean')) F.out.push([k, ...a.map(x => (typeof x === 'number' ? r2(x) : x === undefined ? null : x))]);
    return f.apply(this, a);
  };
}
const FXK = { 1: 1, 3: 1, 4: 1, 5: 1 }, seen = new WeakSet();      // of the engine's own: shockwaves, dust, the arc of a swing, blasts
function echo(list) {
  if (!Array.isArray(list)) return;
  mute = true;
  for (const it of list.slice(0, 40)) {
    if (!Array.isArray(it)) continue;
    if (it[0] === '#') { const e = it[1]; if (e && FXK[e.k] && typeof e.x === 'number') { const c = { t: 0 }; for (const k of ['k', 'x', 'y', 'r', 'vx', 's', 'face', 'life']) if (typeof e[k] === 'number') c[k] = e[k]; for (const k of ['col', 'rgb']) if (typeof e[k] === 'string') c[k] = e[k].slice(0, 40); c.life = Math.min(c.life || .3, 1); seen.add(c); E.fx.push(c); } }
    else if (RAW[it[0]]) { try { RAW[it[0]](...it.slice(1).map(x => (x === null ? undefined : x))); } catch (err) {} }
  }
  mute = false;
}

const start0 = H.fightStart, tick0 = H.tick, hit0 = H.hit, ko0 = H.ko, pow0 = H.power, reset0 = H.reset, fx0 = H.fx;
H.fx = dt => {
  if (fx0) fx0(dt);
  const f = F;
  if (!f || f.over || f.age > 5) return;
  const p = E.P1, g = E.g, c = E.F(p.x, p.y + 345 * (p.scale || 1)), k = c[2], a = Math.min(1, (5 - f.age) * 2);
  g.save(); g.globalAlpha = a; g.font = `${Math.round(26 * k)}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.lineJoin = 'round';
  g.lineWidth = 6 * k; g.strokeStyle = '#07060c'; g.strokeText('YOU', c[0], c[1]); g.fillStyle = '#ffd23d'; g.fillText('YOU', c[0], c[1]);
  g.beginPath(); g.moveTo(c[0] - 9 * k, c[1] + 4 * k); g.lineTo(c[0] + 9 * k, c[1] + 4 * k); g.lineTo(c[0], c[1] + 16 * k); g.closePath(); g.fill();
  g.restore();
};
H.fightStart = (cfg, wave) => {
  start0(cfg, wave);
  F = null;
  if (!cfg.pvp) return;
  const p = E.P1, o = E.P2;
  p.max = p.hp = 100; p.face = cfg.pvp.host ? 1 : -1;
  o.x = -p.x; o.face = -p.face; o.max = o.hp = HP; o.alpha = 1;
  F = { o, r: null, sm: o.pose.slice(), seq: 0, sent: [], hit: null, acc: null, exact: 0, last: HP, got: 0, sendT: 0, quiet: 0, stunT: 0, age: 0, out: [], over: false };
};
H.power = (h, o) => { const k = pow0 ? pow0(h, o) : 1; if (F && o === F.o) F.exact += h.dmg * (o.dr || 1) * k; return k; };
H.hit = (o, face, h) => {
  hit0(o, face, h);
  if (!F || o !== F.o) return;
  const a = F.hit || (F.hit = { kb: 0, lift: 0, stun: 0, f: face });
  a.kb = Math.max(a.kb, h.kb || 0); a.lift = Math.max(a.lift, h.lift || 0); a.stun = Math.max(a.stun, h.stun || 0); a.f = face;
};
H.ko = o => { if (F) { o.ko = false; return true; } return ko0(o); };        // he is down when his own game says he is
H.tick = dt => {
  tick0(dt);
  const f = F;
  if (!f) return;
  const p = E.P1, o = E.P2, d = D, r = f.r;
  f.age += dt;
  // what I did to him since the last time round, by whatever means
  const dealt = Math.max(f.last - o.hp, f.exact, 0); f.exact = 0;
  if (!f.over && (dealt > 0 || f.hit)) {
    const a = f.acc || (f.acc = { dmg: 0, kb: 0, lift: 0, stun: 0, f: p.face, t: E.T });
    a.dmg += dealt;
    if (f.hit) { a.kb = Math.max(a.kb, f.hit.kb); a.lift = Math.max(a.lift, f.hit.lift); a.stun = Math.max(a.stun, f.hit.stun); a.f = f.hit.f; }
  }
  f.hit = null;
  if (f.acc && E.T - f.acc.t >= BUNCH) {             // blows that land together go as one
    const a = f.acc, dmg = Math.min(a.dmg, HP * CAP); f.acc = null;
    say(d.pid, { a: 'hit', n: ++f.seq, dmg: r2(dmg), kb: Math.round(a.kb), lift: Math.round(a.lift), stun: r2(a.stun), f: a.f });
    f.sent.push({ n: f.seq, dmg });
  }
  // him, as his game says he is
  if (r) {
    const k = 1 - Math.exp(-dt * 24);
    if (Math.abs(r.x - o.x) > 420) o.x = r.x; else o.x += (r.x - o.x) * k;
    o.y += (r.y - o.y) * k; o.face = r.f < 0 ? -1 : 1; o.spin = typeof r.sp === 'number' ? r.sp : 1; o.scale = r.sc || 1;
    o.state = r.ps === 'down' || r.ps === 'up' || r.ps === 'hurt' || r.ps === 'air' ? r.ps : 'idle';
    o.inv = r.inv ? .15 : 0;
    if (Array.isArray(r.p)) for (let i = 0; i < 7; i++) { f.sm[i] += ((+r.p[i] || 0) - f.sm[i]) * k; o.pose[i] = f.sm[i]; }
    while (f.sent.length && f.sent[0].n <= (r.hs | 0)) f.sent.shift();
  } else for (let i = 0; i < 7; i++) f.sm[i] = o.pose[i];
  o.stun = 1; o.ground = true; o.vx = o.vy = 0; o.ko = false; o.max = HP;
  let owed = f.acc ? f.acc.dmg : 0; for (const s of f.sent) owed += s.dmg;      // what I have hit him for that he has not yet counted
  o.hp = f.last = Math.max(1, (r ? Math.max(0, +r.hp || 0) / K : HP) - owed);
  // somebody being hit without a break gets one
  if (f.over) { /* nothing more is counted */ }
  else if (p.ps === 'hurt' || p.ps === 'air') { if ((f.stunT += dt) > BREAK) { f.stunT = 0; p.inv = 1.4; E.fx.push({ k: 2, x: p.x, y: p.y + 330, n: 'BREAK', col: '#7fe9ff', t: 0, life: .8 }); } } else if (!p.ps) f.stunT = Math.max(0, f.stunT - dt * 2);
  // me, to him
  for (const e of E.fx) if (!seen.has(e)) { seen.add(e); if (FXK[e.k] && f.out.length < 40) { const c = {}; for (const k of ['k', 'x', 'y', 'r', 'vx', 's', 'face', 'life', 'col', 'rgb']) if (e[k] !== undefined) c[k] = typeof e[k] === 'number' ? r2(e[k]) : e[k]; f.out.push(['#', c]); } }
  if ((f.sendT -= dt) <= 0) {
    f.sendT = SEND;
    const m = { a: 's', x: Math.round(p.x), y: Math.round(p.y), f: p.face, sp: r2(p.spin), sc: p.scale || 1, ps: p.dead ? 'down' : p.ps || '', inv: p.inv > 0 || p.dashT > 0 ? 1 : 0, hp: r2(Math.max(0, p.hp)), hs: f.got, p: p.pose.map(r2) };
    if (f.out.length) { m.fx = f.out; f.out = []; }
    say(d.pid, m);
  }
  if (f.over) return;
  if (p.dead || p.hp <= 0) { finish(false); return; }
  if ((f.quiet += dt) > QUIET) finish(true, `${d.name} stopped answering.`);
};
H.reset = () => { if (reset0) reset0(); if (D && (D.phase === 'fight' || D.phase === 'over')) { F = null; D = null; T.revert(); } };

JU.pvp = { invite, HP, CAP, get busy() { return !!D && D.phase !== 'ask' && D.phase !== 'asked'; }, get record() { return { w: REC.w, l: REC.l }; },
  get state() { return { d: D && { pid: D.pid, name: D.name, host: D.host, phase: D.phase, bans: D.bans, picks: D.picks }, f: F && { seq: F.seq, sent: F.sent.length, got: F.got, r: F.r, over: F.over, last: F.last } }; } };
})();
