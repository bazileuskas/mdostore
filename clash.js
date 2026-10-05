/* JUJUTSU UNLIMITEDS — update 0.2v1, the rest of the Domain Update: out in Free Exploration a special grade can open a domain of its own,
   and a domain opened against a domain is a clash (the half-and-half of it is in domain2.js; the two frames at once are in domain.js).
   Who opens what: Mahito, Self-Embodiment of Perfection; Jogo, Coffin of the Iron Mountain; Hanami, Shining Sea of Growing Branches */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, H = E.hooks, cam = E.cam, V = JU.vfx, sfx = JU.sfx, D = JU.domain, Fi = JU.fights, K = D.kinds, keys = E.keys;
const { clamp, rnd, ZP } = E, TAU = Math.PI * 2, TEAL = '#78e6c8', FLAME = '#ff8c50', LEAF = '#aaffbe';
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
// below: the share of its health it has to be down to before it opens one unprompted. It has one a fight
const WILD = {
  mahito: { kind: 'perfection', jp: '自閉円頓裹', en: 'SELF-EMBODIMENT OF PERFECTION', dur: 8, below: .6 },
  jogo: { kind: 'coffin', jp: '蓋棺鉄囲山', en: 'COFFIN OF THE IRON MOUNTAIN', dur: 8, below: .6 },
  hanami: { kind: 'sea', jp: '朶頤光海', en: 'SHINING SEA OF GROWING BRANCHES', dur: 8, below: .6 }
};
const HARDER = { perfection: 1.4, coffin: 1.2 };    // what its owner's hits are worth while it stands over him

/* ---------- the two that had no inside yet ---------- */
function coffin() {                                 // the inside of a volcano: black rock, and everything under it molten
  const VW = E.VW, HY = E.HY, VH = E.VH, T = E.T, z = ZP + 380;
  lit(() => E.glow(E.GLOW.fire, VW / 2 - cam.x * .05, HY - 40, VW * 1.1, .55 + .08 * Math.sin(T * 3)));
  for (const s of [-1, 1]) {                        // the walls of the crater, leaning in overhead
    const a = P(s * 420, 0, z), b = P(s * 540, 300, z), c = P(s * 300, 640, z), d = P(s * 1600, 800, z), e = P(s * 1600, 0, z);
    g.fillStyle = '#140805'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.lineTo(e[0], e[1]); g.closePath(); g.fill();
    g.strokeStyle = `rgba(255,130,40,${.55 + .2 * Math.sin(T * 4 + s)})`; g.lineWidth = 3; g.beginPath();      // veins of it showing through the rock
    for (let i = 0; i < 4; i++) { const q0 = P(s * (540 + i * 190), 40 + i * 30, z), q1 = P(s * (480 + i * 200), 240 + i * 60, z), q2 = P(s * (570 + i * 180), 430 + i * 40, z); g.moveTo(q0[0], q0[1]); g.lineTo(q1[0], q1[1]); g.lineTo(q2[0], q2[1]); }
    g.stroke();
  }
  g.fillStyle = '#0d0503';                          // teeth of rock hanging from the roof
  for (let i = -5; i <= 5; i++) { const t = P(i * 170, 700, z - 60), k = t[2], len = (120 + (i * i * 37) % 110) * k; g.beginPath(); g.moveTo(t[0] - 46 * k, t[1]); g.lineTo(t[0] + 46 * k, t[1]); g.lineTo(t[0] + ((i * 13) % 20) * k, t[1] + len); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(150,40,0,.36)'; g.fillRect(-300, HY, VW + 600, VH - HY + 500);
  for (let i = 0; i < 7; i++) {                     // pools where the floor has given way
    const q = P((i * 331) % 1700 - 850, 0, ZP + (i % 3 - 1) * 170), r = 110 + (i * 53) % 90;
    g.fillStyle = `rgba(255,${120 + (i * 20) % 60},30,${.35 + .25 * Math.sin(T * 2.4 + i)})`; g.beginPath(); g.ellipse(q[0], q[1], r * q[2], r * .24 * q[2], 0, 0, TAU); g.fill();
  }
}
function sea() {                                    // a sea of light, and branches the size of buildings growing up out of it
  const VW = E.VW, HY = E.HY, VH = E.VH, T = E.T, z = ZP + 420, gr = g.createLinearGradient(0, 0, 0, HY), fg = g.createLinearGradient(0, HY, 0, VH);
  gr.addColorStop(0, '#04140c'); gr.addColorStop(.7, '#1d5a3a'); gr.addColorStop(1, '#d8ffd0');
  g.fillStyle = gr; g.fillRect(-300, -300, VW + 600, HY + 302);
  lit(() => E.glow(E.GLOW.white, VW / 2 - cam.x * .05, HY - 20, VW * 1.2, .5));
  g.lineCap = 'round';
  for (const [x, h, w, lean] of [[-760, 700, 120, 160], [-340, 560, 80, -90], [280, 640, 96, 120], [720, 740, 130, -150]]) {
    const a = P(x, 0, z), b = P(x + lean * .4, h * .55, z), c = P(x + lean, h, z);
    for (const [lw, col] of [[w + 10, '#06120c'], [w, '#12301f']]) { g.strokeStyle = col; g.lineWidth = lw * a[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c[0], c[1]); g.stroke(); }
    g.strokeStyle = '#12301f'; g.lineWidth = w * .4 * a[2];
    for (const s of [-1, 1]) { const d = P(x + lean * .5 + s * 230, h * .82, z); g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(d[0], d[1]); g.stroke(); }
  }
  g.lineCap = 'butt';
  fg.addColorStop(0, 'rgba(216,255,208,.85)'); fg.addColorStop(.4, 'rgba(60,150,96,.5)'); fg.addColorStop(1, 'rgba(6,30,18,.6)');
  g.fillStyle = fg; g.fillRect(-300, HY, VW + 600, VH - HY + 500);
  g.strokeStyle = 'rgba(230,255,225,.4)'; g.lineWidth = 2;
  for (let i = 0; i < 7; i++) { const r = (T * 60 + i * 130) % 900, q = P((i * 397) % 1500 - 750, 0, ZP + (i % 3 - 1) * 150); g.globalAlpha = 1 - r / 900; g.beginPath(); g.ellipse(q[0], q[1], r * q[2], r * .24 * q[2], 0, 0, TAU); g.stroke(); }
  g.globalAlpha = 1;
}
// something that happens to him every `every` seconds for as long as it stands
const each = (d, dt, every, fn) => { if ((d.acc = (d.acc || 0) + dt) >= every) { d.acc -= every; fn(); } };
const embers = dt => { if (Math.random() < dt * 40) V.puff('fire', cam.x + rnd(-800, 800), rnd(0, 80), 0, rnd(160, 360), rnd(20, 44), .8); };
const drift = dt => { if (Math.random() < dt * 26) V.puff('green', cam.x + rnd(-800, 800), rnd(0, 340), rnd(-40, 40), rnd(30, 110), rnd(14, 28), 1.1); };
D.kind('coffin', { rim: '255,120,40', tint: '130,34,0', tone: 'red', inside: coffin, tick: embers,
  foe(dt, p, d) { embers(dt); each(d, dt, 1, () => { Fi.chip(3, FLAME); V.fire(p.x, 10, 6); }); } });          // simply being in there burns
D.kind('sea', { rim: '170,255,190', tint: '24,90,48', tone: 'green', bare: true, inside: sea, tick: drift,
  foe(dt, p, d) {                                   // roots round his ankles, and what they take goes to her
    const o = E.P2;
    drift(dt);
    each(d, dt, 1, () => { Fi.chip(2, LEAF); if (!o.ko) o.hp = Math.min(o.max, o.hp + o.max * .02); V.puff('green', p.x, p.y + 150, (o.x - p.x) * 2.2, 0, 40, .4); });
  } });
// Mahito's own, when it is Mahito's: the soul is being handled the whole time he is inside it
Object.assign(K.perfection, { tone: 'teal', foe(dt, p, d) {
  if (Math.random() < dt * 30) V.puff('teal', cam.x + rnd(-800, 800), rnd(0, 320), 0, rnd(40, 120), rnd(16, 30), 1);
  each(d, dt, 1.2, () => { Fi.chip(3, TEAL); V.ring(p.x, p.y + 150, 110, TEAL, .3); });
} });
K.garden.tone = 'purple'; K.court.tone = 'gold'; K.court.solo = true;      // a trial is not a tug of war: it replaces whatever was standing

/* ---------- a special grade and its domain ---------- */
let used = false, queued = false;                   // it has opened its one already; G was pressed while theirs was still opening
const wildNow = () => { const f = Fi.fight, c = f.cfg; return c && c.wild ? WILD[c.foes[f.wave]] || null : null; };
const said = (w, o) => E.after(.25, () => { if (!D.clashing && !o.ko) E.banner(w.jp, w.en, 'xs'); });
function theirs(o, w) {                             // its domain goes up
  D.raise(w.kind, { who: o, dur: w.dur });
  if (w.kind === 'perfection' && JU.perfection) JU.perfection.music.start();
  said(w, o);
}
function bossOpen(o, w) {
  const p = E.P1, his = D.now;                      // if his is standing, both frames go up at once and the two lock
  used = true;
  if (o.state === 'act') { o.state = 'idle'; o.act = null; o.tele = 0; }
  D.open({ who: o, tone: K[w.kind].tone, vs: his ? { who: p, tone: K[his].tone || 'blue', skin: p.skin } : null, reveal() { theirs(o, w); } });
}
// his own, opened while theirs is standing, or while it still has one to answer with: the second frame, and then the clash
const open0 = D.open;
D.open = o => {
  const p = E.P1, f = E.P2;
  if (o.kind && o.who === p && !o.vs && !D.clashing && !K[o.kind].solo) {
    const w = wildNow(), up = D.foe;
    if (up) o = Object.assign({}, o, { vs: { who: f, tone: K[up].tone || 'red', skin: f.skin } });
    else if (w && !used && !f.ko && !(f.alpha < 1)) {
      const reveal0 = o.reveal;
      used = true;
      o = Object.assign({}, o, { vs: { who: f, tone: K[w.kind].tone, skin: f.skin }, reveal() { if (reveal0) reveal0(); theirs(f, w); } });
    }
  }
  return open0(o);
};

const tick0 = H.tick, awaken0 = H.awaken, reset0 = H.reset, start0 = H.fightStart, fpow0 = H.foePower;
H.foePower = a => (fpow0 ? fpow0(a) : 1) * (HARDER[D.foe] || 1);
H.awaken = p => {
  if (D.busy && D.who === E.P2 && !D.vs) {          // theirs is still opening: his answer is held until it is up
    if (!queued) { queued = true; E.fx.push({ k: 2, x: p.x, y: p.y + 390, n: 'G  ·  CLASH', col: '#ffd23d', t: 0, life: 1.4 }); }
    return;
  }
  awaken0(p);
};
H.tick = dt => {
  tick0(dt);
  const o = E.P2, p = E.P1, w = wildNow();
  if (queued && !D.busy) { queued = false; if (D.foe && !p.dead) { if (p.move) E.endMove(p); H.awaken(p); } }
  if (D.foe === 'sea' && !p.move && !p.ps && !p.dead && !(p.dashT > 0) && p.ground) {      // wading in it
    const dir = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
    if (dir) p.x = clamp(p.x - dir * 360 * .4 * dt, -965, 965);
  }
  if (w && !used && !o.ko && !p.dead && !Fi.fight.paused && !D.busy && !D.clashing && !D.foe && o.hp <= o.max * w.below && o.state === 'idle' && o.ground && !(o.alpha < 1) && !(JU.plants && JU.plants.dazed(o)))
    bossOpen(o, w);
};
H.reset = () => { reset0(); used = queued = false; };
H.fightStart = (cfg, wave) => { used = queued = false; start0(cfg, wave); };

JU.clash = { WILD, get used() { return used; } };
})();
