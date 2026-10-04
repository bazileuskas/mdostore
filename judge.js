/* JUJUTSU UNLIMITEDS — early access: CURSED JUDGE. Hiromi Higuruma's gavel, with the moves the Defense Attorney has in Jujutsu Shenanigans:
   gavel strikes that grow through the chain, Extended Swings, Justice Served, Judgement's Reach and Pressing Charges.
   G is Deadly Sentencing, his domain: a trial. Count by count the accused pleads (confess, silence or denial) and so does he; every plea he calls
   right fills a third of the verdict. Three, and the court hands him the Executioner's Sword. G again swings it: three circles to hit on the beat,
   his accuracy against the accused's, and if his is the better one the cut kills whatever it lands on, however much health it had */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, M = E.MOVES;
const { clamp, lerp, rnd } = E, { shout, near } = JU.tech.tk, GOLD = '#e2c060', WOOD = ['#3a2a1c', '#5a4028'], D = JU.domain, TAU = Math.PI * 2;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const cut = (p, y, a, len, w = 14) => V.slash(p.x + p.face * 150, p.y + y, p.face > 0 ? a : Math.PI - a, len, GOLD, w);

/* ---------- the gavel itself: a handle along the line of whichever arm is doing the work, and a head across the end of it ---------- */
function gavel(p, size, len, ang) {
  const ps = p.pose, tp = p.target || ps, back = tp[3] > tp[2], a = ang === undefined ? (back ? ps[3] : ps[2]) : ang, w = E.hand(p, !back);
  const L = ang === undefined ? len * Math.min(size, 2.2) : len, h0 = F(w[0], w[1]), h1 = F(w[0] + Math.sin(a) * p.face * L, w[1] - Math.cos(a) * L), k = h0[2];
  const hw = 30 * size * k, hh = 74 * size * k, thick = Math.min(size, 3) * 2;      // the head: how far along the handle, how far across it
  g.lineCap = 'round'; g.beginPath(); g.moveTo(h0[0], h0[1]); g.lineTo(h1[0], h1[1]);
  g.strokeStyle = LINE; g.lineWidth = (9 + thick) * k; g.stroke(); g.strokeStyle = WOOD[0]; g.lineWidth = (5 + thick) * k; g.stroke(); g.lineCap = 'butt';
  g.save(); g.translate(h1[0], h1[1]); g.rotate(Math.atan2(h1[1] - h0[1], h1[0] - h0[0]));
  g.fillStyle = WOOD[1]; g.strokeStyle = LINE; g.lineWidth = 3; g.lineJoin = 'round';
  g.beginPath(); g.rect(-hw / 2, -hh / 2, hw, hh); g.fill(); g.stroke();
  g.fillStyle = GOLD; g.fillRect(-hw / 2, -hh * .38, hw, hh * .1); g.fillRect(-hw / 2, hh * .28, hw, hh * .1);
  g.restore();
}

/* ---------- the strikes: the same chain of four, with the gavel a size bigger every time ---------- */
const hit = (i, more) => Object.assign({}, M.m1[i].hit, { col: GOLD }, more);
const GAVEL = [
  Object.assign({}, M.m1[0], { gv: 1, hit: hit(0, { reach: 180 }) }),
  Object.assign({}, M.m1[1], { gv: 1.35, hit: hit(1, { reach: 185 }) }),
  Object.assign({}, M.m1[2], { gv: 1.8, hit: hit(2, { reach: 195 }) }),
  Object.assign({}, M.m1[3], { gv: 2.6, pre: 'crushWind', pose: 'crush', kick: 0, hit: hit(3, { reach: 220, ring: 1 }) })    // not a kick: the whole thing brought down
];

const MOVES = {
  // 1 — the gavel becomes a long-handled hammer: three swings, and then it comes down
  strikes: { name: 'Extended Swings', cd: 6, dur: 1.25, glow: 'gold', run(p, m, t) {
    const k = t < .12 ? -1 : t < .36 ? 0 : t < .6 ? 1 : t < .78 ? 2 : t < .95 ? 3 : 4;      // which swing this is; 3 is the wind-up before the slam
    p.rate = 44; m.gv = [1.7, 150];
    p.target = k < 0 ? POSE.hookWind : k === 3 ? POSE.crushWind : k === 4 ? (t < 1.12 ? POSE.crush : POSE.idle) : [POSE.hook, POSE.cross, POSE.hook][k];
    p.vx = k >= 0 && k < 3 && t - [.12, .36, .6][k] < .08 ? p.face * 240 : 0;
    if (k < 0 || k === 3 || k === m.k) return;
    m.k = k; sfx.swish(1.7);
    if (k < 3) {
      cut(p, 170, [-.4, .35, -.4][k], 360);
      if (E.tryHit(p, { reach: 250, dmg: 4, kb: 60, stun: .5, stop: .04, col: GOLD })) sfx.gavel(1.7);
      return;
    }
    const x = p.x + p.face * 190;
    sfx.gavel(2.6); shake(20); V.crack(x, 260); V.rocks(x, 0, 10); cut(p, 190, -1.25, 420, 16);
    E.tryHit(p, { reach: 260, dmg: 10, kb: 300, lift: 520, stun: .9, stop: .14, heavy: 1, ring: 1, col: GOLD });
  } },
  // 2 — he holds it up and it grows until it is absurd, and then he lets it fall. Whatever is under it goes a long way up
  crush: { name: 'Justice Served', cd: 9, dur: 1.25, glow: 'gold', run(p, m, t) {
    p.vx = 0; p.rate = 30;
    if (t < .6) {
      p.target = POSE.crushWind; m.gv = [lerp(1.2, 5.2, (t / .6) ** 2), 90];
      if (!m.c) { m.c = 1; sfx.charge(); }
      const w = E.hand(p, false); if (Math.random() < .7) V.mote(w[0], w[1] + 120, 'gold');
      return;
    }
    p.target = t < .95 ? POSE.crush : POSE.idle; p.rate = 50; m.gv = [5.2 * (t < .95 ? 1 : Math.max(.2, 1 - (t - .95) / .3 * .8)), 90];
    if (m.s) return;
    m.s = 1; sfx.gavel(4); sfx.blast(); shake(30);
    const x = p.x + p.face * 210;
    V.crack(x, 380); V.rocks(x, 0, 16); V.ring(x, 40, 380, GOLD, .45);
    if (E.tryHit(p, { reach: 380, dmg: 20, kb: 120, lift: 1150, stun: .9, stop: .2, heavy: 1, ring: 1, col: GOLD })) V.impact(.12, E.P2.x, E.P2.y + 150);
  } },
  // 3 — the handle runs out as far as it has to, and the head comes down on whatever is at the end of it
  div: { name: 'Judgement\'s Reach', cd: 7, dur: .95, glow: 'gold', run(p, m, t) {
    p.vx = 0; p.rate = 40;
    if (t < .18) { p.target = POSE.divWind; m.gv = [1.3, 70]; return; }
    if (!m.s) { const q = near(p, 780); m.s = 1; m.len = q ? clamp(Math.abs(q.x - p.x) - 50, 120, 740) : 620; sfx.swish(1.2); }
    if (t < .5) {
      const u = Math.min(1, (t - .18) / .14);
      p.target = POSE.jab; m.gv = [1.4, lerp(70, m.len, u), 1.62];
      if (u >= 1 && !m.done) { m.done = 1; if (E.tryHit(p, { reach: m.len + 90, dmg: 6, kb: 0, stun: .8, stop: .06, col: GOLD })) sfx.gavel(1.4); }
      return;
    }
    const down = Math.PI / 2 - Math.atan(150 / m.len), back = clamp((t - .66) / .25, 0, 1);     // tipped so the head meets the floor, then drawn back in
    p.target = t < .75 ? POSE.crush : POSE.idle; m.gv = [lerp(2.4, 1.3, back), lerp(m.len, 70, back), lerp(down, 1.2, back)];
    if (m.s2) return;
    const x = p.x + p.face * (m.len + 40);
    m.s2 = 1; sfx.gavel(2.4); shake(18); V.crack(x, 240); V.rocks(x, 0, 8); V.ring(x, 40, 240, GOLD, .35);
    E.tryHit(p, { reach: m.len + 120, dmg: 9, kb: 200, lift: 520, stun: .9, stop: .12, heavy: 1, ring: 1, col: GOLD });
  } },
  // 4 — in on a kick, in again behind it, and the gavel to finish. It leaves him set up for the third strike of the chain
  manji: { name: 'Pressing Charges', cd: 10, dur: 1.05, glow: 'gold', run(p, m, t) {
    const o = E.P2, gap = (o.x - p.x) * p.face;
    p.rate = 46; m.gv = [1.5, 80];
    if (t < .3) {
      if (m.k) { p.target = POSE.kick; p.vx = 0; return; }
      p.target = POSE.dash; p.vx = gap > 150 ? p.face * 1500 : 0;
      if ((gap > -30 && gap < 200) || t > .2) { m.k = 1; p.vx = 0; sfx.whoosh(); E.tryHit(p, { reach: 210, dmg: 7, kb: 420, stun: .7, stop: .08 }); }
      return;
    }
    if (m.s) { p.vx = 0; p.target = t < m.s + .22 ? POSE.hook : POSE.idle; if (!m.set && t > .8) { m.set = 1; p.chain = 2; p.chainT = .7; } return; }
    p.target = POSE.dash; p.vx = gap > 170 ? p.face * 1700 : 0;
    if ((gap > -30 && gap < 230) || t > .54) {
      m.s = t; p.vx = 0; sfx.swish(1.5); cut(p, 170, -.35, 400, 16);
      if (E.tryHit(p, { reach: 250, dmg: 12, kb: 860, lift: 420, stop: .14, heavy: 1, col: GOLD })) sfx.gavel(2);
    }
  } }
};

JU.tech.add('judge', { name: 'Cursed Judge', jp: '誅伏賜死', mark: '槌', who: 'Hiromi Higuruma', odds: 0, col: GOLD, glow: 'gold', moves: MOVES,
  early: true,                                      // early access: not on the roll. See JU.shop.early for who may equip it
  awkName: 'Deadly Sentencing',
  awaken(p) {
    const o = E.P2;
    if (o.ko || o.alpha < 1 || D.busy || D.now) { JU.tech.charge(100); return; }     // nobody to try, or a domain already standing: the bar is handed back
    p.inv = Math.max(p.inv, 1);
    D.open({ who: p, tone: 'gold', reveal() { convene(p); } });
  }
});

/* ---------- Deadly Sentencing: the court ---------- */
D.kind('court', { rim: '226,192,96', tint: '70,52,10', bare: true, inside() { const c = JU.cast5.court; c.sky(); c.floor(); c.back(); } });
const PLEAS = [['Confess', '自白'], ['Silence', '黙秘'], ['Denial', '否認']];
// how the accused is standing gives its plea away, more often than not
const TELLS = ['Its shoulders have dropped. It looks ready to give in.', 'Its mouth is shut tight. It is looking at the floor.', 'It is glaring straight back at the judge.'];
const COUNTS = ['The accused is charged with harm done to people who could not fight back.', 'Second count: it was seen at the place, at the hour.',
  'Third count: it could have stopped, and it did not.', 'Fourth count: it has done this before.', 'Last count: it would do it again.'];
const ROUNDS = 5, GUILTY = 3, TELL = .65;           // counts in a trial; right calls needed; how often the tell is honest
const foeName = () => E.root.querySelector('.fb.p2 .nm b').textContent || 'The accused';
const board = document.createElement('div');
board.className = 'trial';
E.root.appendChild(board);
let trial = null, sword = false, duel = null, lastT = 0;

function paint() {
  const t = trial, shown = t.phase !== 'ask', hit = t.me === t.foe;
  const said = t.phase === 'verdict' ? (t.won ? 'Guilty. The sentence is death: take the sword.' : 'The court cannot convict. Not guilty.')
    : shown ? `${t.name}: ${PLEAS[t.foe][0]}. ` + (hit ? 'You called it.' : 'You called it wrong.') : '';
  board.innerHTML = `<div class="tbar"><b>Verdict</b>${[0, 1, 2].map(i => `<i class="${i < t.score ? 'on' : ''}"></i>`).join('')}<span>${t.score} / ${GUILTY}</span><em>Count ${t.round + 1} of ${ROUNDS}</em></div>
    <div class="tbody"><small><span lang="ja">誅伏賜死</span> · Deadly Sentencing · Judgeman</small>
      <p>${COUNTS[t.round]} How does it plead?</p><p class="tt">${TELLS[t.lean]}</p>
      <div class="tpicks${shown ? ' done' : ''}">${PLEAS.map((p, i) => `<button data-plea="${i}" class="${shown && i === t.me ? 'me' : ''}${shown && i === t.foe ? ' foe' : ''}" aria-label="${p[0]}"><kbd>${i + 1}</kbd><b>${p[0]}</b><span lang="ja">${p[1]}</span></button>`).join('')}</div>
      <p class="tr${(t.phase === 'verdict' ? t.won : hit) ? '' : ' no'}">${said || 'Call its plea: 1, 2 or 3. Match it and the verdict fills by a third.'}</p></div>`;
}
function convene(p) {                               // the white-out has just covered the screen: the court is in session
  D.raise('court', { who: p, dur: 600 });
  trial = { phase: 'intro', t: 0, round: 0, score: 0, lean: Math.random() * 3 | 0, me: -1, foe: -1, won: false, name: foeName() };
  lastT = E.T;
  for (let i = E.fx.length - 1; i >= 0; i--) if (E.fx[i].k === 2) E.fx.splice(i, 1);     // nothing is left hanging in the air over the court
  E.banner('誅伏賜死', 'DEADLY SENTENCING', 'sm');
}
function plead(i) {
  const t = trial;
  if (!t || t.phase !== 'ask') return;
  t.me = i; t.foe = Math.random() < TELL ? t.lean : (t.lean + 1 + (Math.random() * 2 | 0)) % 3;
  if (t.me === t.foe) { t.score++; sfx.gavel(2.2); } else sfx.back();
  t.phase = 'shown'; t.t = 0; paint();
}
function runTrial() {                               // the fight does not move while the court sits, so this runs on the clock on the wall
  const t = trial, real = Math.min(.05, E.T - lastT);
  lastT = E.T; E.stop(.05); t.t += real;
  E.root.classList.add('dom');                      // the fight's own HUD is put away (the opening takes this off again as it ends, so it is set every frame)
  cam.lift = lerp(cam.lift, 120, 1 - Math.exp(-real * 3));     // and the picture is lifted clear of the pleas
  if (t.phase === 'intro') { if (t.t > 1.1) { t.phase = 'ask'; t.t = 0; paint(); board.classList.add('on'); } return; }
  if (t.phase === 'shown' && t.t > 1.5) {
    const left = ROUNDS - t.round - 1;
    if (t.score >= GUILTY || t.score + left < GUILTY) { t.phase = 'verdict'; t.won = t.score >= GUILTY; t.t = 0; if (t.won) { sfx.gavel(4); sfx.bf(); shake(24); } else sfx.back(); }
    else { t.round++; t.lean = Math.random() * 3 | 0; t.me = t.foe = -1; t.phase = 'ask'; t.t = 0; }
    paint();
  } else if (t.phase === 'verdict' && t.t > 2) {
    const won = t.won;
    adjourn(); D.drop();
    if (won) { sword = true; E.banner('処刑人の剣', 'EXECUTIONER\'S SWORD', 'sm'); sfx.charge(); } else E.banner('無罪', 'NOT GUILTY', 'sm');
  }
}
function adjourn() { trial = null; cam.lift = 0; board.classList.remove('on'); E.root.classList.remove('dom'); }
board.addEventListener('click', e => { const b = e.target.closest('[data-plea]'); if (b) plead(+b.dataset.plea); });

/* ---------- the Executioner's Sword: three circles, his timing against the accused's ---------- */
const RING = [1.25, 1.05, .85], SPOT = [[.5, .48], [.34, .44], [.66, .44]], R0 = 3.2, R1 = .3, WINDOW = .35;   // how long each ring takes to close; where each circle is; and how far off the beat still scores
const beat = i => RING[i] * (R0 - 1) / (R0 - R1);   // the moment the ring is exactly on the circle
const avg = a => a.reduce((s, v) => s + v, 0) / (a.length || 1), pct = v => Math.round(v * 100) + '%';
function blade(p) {
  const ps = p.pose, tp = p.target || ps, back = tp[3] > tp[2], a = back ? ps[3] : ps[2], w = E.hand(p, !back);
  const h0 = F(w[0], w[1]), h1 = F(w[0] + Math.sin(a) * p.face * 200, w[1] - Math.cos(a) * 200), k = h0[2], dx = h1[0] - h0[0], dy = h1[1] - h0[1], n = Math.hypot(dx, dy) || 1;
  const line = (w, col, u0 = 0) => { g.strokeStyle = col; g.lineWidth = w * k; g.beginPath(); g.moveTo(h0[0] + dx * u0, h0[1] + dy * u0); g.lineTo(h1[0], h1[1]); g.stroke(); };
  g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.gold, h0[0] + dx * .55, h0[1] + dy * .55, 300 * k, .6 + .2 * Math.sin(E.T * 9)); g.globalCompositeOperation = 'source-over';
  g.lineCap = 'round'; line(15, LINE); line(9, '#fff6d0', .14); line(3, GOLD, .14);
  g.strokeStyle = GOLD; g.lineWidth = 7 * k; g.beginPath();                       // the guard, across the bottom of it
  g.moveTo(h0[0] + dx * .14 - dy / n * 24 * k, h0[1] + dy * .14 + dx / n * 24 * k); g.lineTo(h0[0] + dx * .14 + dy / n * 24 * k, h0[1] + dy * .14 - dx / n * 24 * k); g.stroke();
  g.lineCap = 'butt';
}
const EXEC = { name: 'Execution', dur: .8, glow: 'gold', run(p, m, t) {
  const o = E.P2, gap = (o.x - p.x) * p.face;
  p.rate = 46;
  if (m.at !== undefined) { p.vx = 0; p.target = t < m.at + .3 ? POSE.hook : POSE.idle; return; }
  if (t > .45) { p.vx = 0; p.target = POSE.idle; return; }                       // never got there: the sword is still his
  p.target = POSE.dash; p.vx = gap > 150 ? p.face * 1700 : 0;
  if (gap > -30 && gap < 215 && !o.ko && !(o.alpha < 1)) {
    const skill = !o.ai ? .4 : o.ai.d.kit ? .72 : .55;                           // a boss has a steadier hand than a stray curse; the training dummy has none
    m.at = t; p.vx = 0; p.inv = Math.max(p.inv, 1);
    duel = { phase: 'in', t: 0, i: 0, mine: [], theirs: [0, 1, 2].map(() => clamp(skill + rnd(-.2, .2), .05, .98)), name: foeName(), who: p, foe: o, won: false };
    lastT = E.T; E.root.classList.add('dom'); sfx.charge();
  }
} };
function tap() {
  const d = duel;
  if (d.phase !== 'ring') return;
  const acc = clamp(1 - Math.abs(d.t - beat(d.i)) / WINDOW, 0, 1);
  d.mine.push(acc); d.phase = 'beat'; d.t = 0;
  if (acc > .5) sfx.gavel(1 + acc); else sfx.back();
}
function text(s, x, y, size, col, align = 'center') {
  g.font = `${Math.round(size)}px Anton, Impact, sans-serif`; g.textAlign = align; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = size * .2; g.strokeStyle = '#07060c'; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y);
}
function runDuel() {
  const d = duel, VW = E.VW, VH = E.VH, real = Math.min(.05, E.T - lastT), R = VH * .085;
  lastT = E.T; E.stop(.05); d.t += real;
  if (d.phase === 'in' && d.t > .9) { d.phase = 'ring'; d.t = 0; }
  else if (d.phase === 'ring' && d.t > RING[d.i]) { d.mine.push(0); d.phase = 'beat'; d.t = 0; sfx.back(); }      // let it close without pressing: nothing for that one
  else if (d.phase === 'beat' && d.t > .65) { d.t = 0; if (++d.i < 3) d.phase = 'ring'; else { d.phase = 'result'; d.won = avg(d.mine) >= avg(d.theirs); if (d.won) sfx.bf(); else sfx.back(); } }
  else if (d.phase === 'result' && d.t > 1.7) { strike(); return; }
  g.save();
  g.fillStyle = 'rgba(4,3,8,.78)'; g.fillRect(0, 0, VW, VH);
  g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.gold, VW / 2, VH * .46, VW * .7, .22); g.globalCompositeOperation = 'source-over';
  text('EXECUTIONER\'S SWORD', VW / 2, VH * .1, VH * .075, GOLD);
  text('Press when the ring meets the circle   ·   J  ·  Click  ·  Space', VW / 2, VH * .175, VH * .03, '#f4efe4');
  if (d.phase === 'ring' || d.phase === 'beat') {
    const s = SPOT[d.i], cx = VW * s[0], cy = VH * s[1], done = d.phase === 'beat', acc = done ? d.mine[d.i] : 0;
    g.fillStyle = done ? `rgba(226,192,96,${.18 + .5 * acc * (1 - d.t / .65)})` : 'rgba(226,192,96,.14)'; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 5; g.stroke();
    if (!done) { g.strokeStyle = GOLD; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, R * lerp(R0, R1, d.t / RING[d.i]), 0, TAU); g.stroke(); }
    else { text(pct(acc), cx, cy, VH * .07, acc > .5 ? '#fff' : '#ff5a6e'); text(acc > .9 ? 'PERFECT' : acc > .6 ? 'GOOD' : acc > 0 ? 'OFF' : 'MISSED', cx, cy + R * 1.5, VH * .04, acc > .6 ? GOLD : '#ff5a6e'); }
    text(d.i + 1 + ' / 3', cx, cy - R * 1.6, VH * .035, '#f4efe4');
  }
  const y0 = VH * .78, col = [VW * .44, VW * .53, VW * .62];
  [['YOU', d.mine, GOLD], [d.name.toUpperCase(), d.theirs, '#ff5a6e']].forEach((r, j) => {      // both scores, a circle at a time
    const y = y0 + j * VH * .065;
    text(r[0], VW * .39, y, VH * .036, r[2], 'right');
    for (let i = 0; i < 3; i++) text(i < d.mine.length ? pct(r[1][i]) : '—', col[i], y, VH * .036, i < d.mine.length ? '#f4efe4' : 'rgba(244,239,228,.35)');
    if (d.phase === 'result') text(pct(avg(r[1])), VW * .73, y, VH * .046, r[2]);
  });
  if (d.phase === 'result') text(d.won ? 'EXECUTED' : 'THE BLADE MISSED', VW / 2, VH * .46, VH * .13, d.won ? GOLD : '#ff5a6e');
  g.restore();
}
function strike() {                                 // the duel is over: either the sentence is carried out, or the sword is gone
  const d = duel, p = d.who, o = d.foe;
  duel = null; sword = false; E.root.classList.remove('dom');
  if (!d.won || o !== E.P2 || o.ko) { shout(p, 'THE SWORD BREAKS', '#c88'); V.sparks(p.x + p.face * 80, p.y + 200, 'gold', 16); return; }
  sfx.gavel(4); shake(40); V.split(p.face > 0 ? -.5 : .5); V.impact(.4, o.x, o.y + 150);
  V.slash(o.x, o.y + 170 * (o.scale || 1), p.face > 0 ? -.9 : Math.PI + .9, 640, GOLD, 22);
  E.applyHit(o, p.face, { dmg: (o.hp + 1) / (o.dr || 1), kb: 900, lift: 560, stun: .9, stop: .34, heavy: 1, col: GOLD, fixed: 1 });   // whatever it had left
}

/* ---------- wiring ---------- */
const DEF = JU.tech.TECH.judge, on = () => JU.tech.active === DEF;
const moveFx0 = H.moveFx, fx0 = H.fx, press0 = H.press, post0 = H.post, awaken0 = H.awaken, reset0 = H.reset, start0 = H.fightStart;
let size = 1;
H.press = (a, inScene) => {
  if (trial) { const i = ['strikes', 'crush', 'div'].indexOf(a); if (i >= 0) plead(i); return true; }     // nothing else happens while the court sits
  if (duel) { if (a === 'm1' || a === 'jump' || a === 'ok') tap(); return true; }
  return press0 ? press0(a, inScene) : false;
};
H.awaken = p => {                                   // with the sword in his hand, G is the execution
  if (!(on() && sword) || D.busy || D.now) return awaken0(p);
  const o = E.P2;
  if (p.ground && !p.move && !p.ps && !p.dead && !o.ko) { p.face = o.x >= p.x ? 1 : -1; p.move = { def: EXEC, t: 0 }; sfx.swish(1.4); }
};
H.post = dt => { post0(dt); if (trial) runTrial(); else if (duel) runDuel(); };
const clear = () => { if (trial) adjourn(); if (duel) E.root.classList.remove('dom'); duel = null; sword = false; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { if (!wave) clear(); start0(cfg, wave); };
H.moveFx = (p, m) => {
  moveFx0(p, m);
  if (!on() || !m.def.m1) return;
  if (m.def === M.m1[m.i]) m.def = GAVEL[m.i];      // an ordinary strike has just begun: it is a gavel strike instead
  const s = m.def.gv || 1.8;
  if (m.sw && !m.gs) { m.gs = 1; sfx.swish(s); }
  if (m.done && !m.gk) { m.gk = 1; sfx.gavel(s); V.ring(E.P2.x, E.P2.y + 160, 70 * s, GOLD, .18); }
  if (m.def === GAVEL[1] && m.done && !m.tap && m.t > m.def.strike + .12) {     // the second strike raps twice
    m.tap = 1;
    if (!E.P2.ko) { E.applyHit(E.P2, p.face, { dmg: 2, kb: 60, stun: .34, stop: .03, col: GOLD }); sfx.gavel(1.35); }
  }
};
H.fx = dt => {
  fx0(dt);
  const p = E.P1, m = p.move;
  if (!on() || p.dead || p.alpha < .05) return;
  if (sword) {                                      // the gavel is put away: this is what he is holding now
    const c = F(p.x, p.y + 345);
    blade(p); text('G  ·  EXECUTE', c[0], c[1], 24 * c[2], GOLD);
    return;
  }
  if (m && m.gv) { size = m.gv[0]; gavel(p, size, m.gv[1], m.gv[2]); return; }      // a move sizes it for itself
  size += ((m && m.def.m1 ? m.def.gv || 1.8 : 1) - size) * Math.min(1, dt * 24);
  gavel(p, size, 70);
};

JU.judge = { GAVEL, MOVES, EXEC, plead, set sword(v) { sword = !!v; },
  get state() { return { sword, trial: trial && { phase: trial.phase, round: trial.round, score: trial.score, lean: trial.lean, me: trial.me, foe: trial.foe },
    duel: duel && { phase: duel.phase, i: duel.i, t: duel.t, mine: duel.mine.slice(), theirs: duel.theirs.slice(), won: duel.won, beat: duel.i < 3 ? beat(duel.i) : 0 } }; } };
})();
