/* JUJUTSU UNLIMITEDS — Build 0.29v2: the KING OF JUJUTSU, awakened, and for admins only. The user: "add Heian era sukuna as a awakened admin
   only CT". The boss of heian.js to play as: his four arms, his second face and the mouth on his belly (JU.heian.KING), and his set turned on
   whoever he is fighting:
     1 DISMANTLE           blades of air the length of the arena: three of 12; five of 14 after the first line of the chant; seven of 16 after
                           the second, and the arena parted after them
     2 CLEAVE              in, one touch, and cut to pieces where they stand (6, 5 x 10, then 50)
     3 FURNACE             the fire arrow drawn with all four hands, "Fuga", and most of the arena goes up and stays burning (150, then 4 a beat)
     4 KAMUTOKE            the staff of lightning held up: six bolts on them and the last one huge (6 x 12, 45)
     E THE CHANT           a line at a time: SCALE OF THE DRAGON (a burst round him, 25; Dismantle grows), TWIN METEORS (two cuts out of the
                           sky meeting on them, 70; Dismantle grows again), RECOIL (the grid drawn over everything, and the World Cutting
                           Slash: whatever it touches dies, through anything). Then Recoil again, on a long wait
     G MALEVOLENT SHRINE   his domain: everything inside it cut, over and over (17 x 12)
   The Awaken CT screen shows it only to the team's account and to whoever the team has given admin powers (account.js); nobody else sees it,
   and the shop will not let anybody else equip it */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, B = JU.boss, X = JU.bossfx, C = JU.cut, K = JU.heian, T = JU.tech;
const { rnd, lerp, clamp } = E, TAU = Math.PI * 2, RED = K.RED, RO = K.RO, FIRE = K.FIRE, BOLT = K.BOLT;
const play = (name, vol, alt, rate = 1) => { if (!sfx.file(name, vol, rate)) alt(); };
const none = () => {};
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const dev = () => !!(JU.account && JU.account.dev);
const live = o => !!o && !o.ko && !(o.alpha < 1);
const can = o => live(o) && !(o.inv > 0) && o.state !== 'down' && o.state !== 'up';
const exact = (o, n) => n / (o.dr || 1);
const hs = o => o.scale || 1;
const mid = o => o.y + 170 * hs(o);
const bound = () => (H.bound ? H.bound() : 965);
const edge = x => clamp(x, -bound() + 30, bound() - 30);
const facing = (p, o) => { if (live(o)) p.face = o.x >= p.x ? 1 : -1; };
const on = () => T.active === DEF;
const label = (x, y, text, col = RED, life = 1.1) => E.fx.push({ k: 2, x, y, n: text, col, t: 0, life });
// a blow of his on them wherever they are, worth exactly what it says
function hit(o, face, dmg, more) { if (!can(o)) return false; E.applyHit(o, face, Object.assign({ dmg: exact(o, dmg), kb: 200, stun: .6, stop: .06, col: RED, fixed: 1 }, more)); return true; }
// and what does not move them (the floor burning under them): exactly n
function chip(o, n) {
  if (!live(o)) return;
  if (o.hp - n <= 0) { E.applyHit(o, E.P1.face, { dmg: exact(o, n), kb: 0, stun: .4, fixed: 1, col: FIRE, mute: 1 }); return; }
  o.hp -= n; o.lastHit = 0; o.flash = .06; E.addNum(o.x, o.y + 270 * hs(o), n, '#ff8c50');
}

/* ================= the chant: how far through it he is, this fight ================= */
const S = { lvl: 0, cd: 0, max: 1 };                  // lines said (3: all of it, and Recoil again after its wait); the wait before the next
const lvl = () => Math.min(2, S.lvl);

/* ================= 1 — DISMANTLE ================= */
const LV = [{ n: 3, gap: .16, r: 120, d: 12 }, { n: 5, gap: .12, r: 150, d: 14 }, { n: 7, gap: .1, r: 175, d: 16 }];
const HEIGHT = [120, 205, 90, 220, 150, 100, 170];
// a blade of air thrown the length of the arena: it finds them as it passes, and parts the picture behind it
function blade(p, y, dmg, r, big, tilt) {
  const dir = p.face, speed = 2900;
  B.add({ life: 2600 / speed, x: p.x + dir * 90, upd(h, dt) {
    const o = E.P2;
    h.x += dir * speed * dt;
    if (!h.hit && can(o) && Math.abs(o.x - h.x) < 60 + r * .3) {
      h.hit = 1;
      hit(o, dir, dmg, big ? { kb: 700, lift: 560, stun: 1, stop: .12, heavy: 1 } : { kb: 180, stun: .6, stop: .05 });
      C.dice(o, big ? 4 : 2, 240, big);
      if (big) { C.frame(.1, o.x, o.y + 160); C.stamp('解', o.x, o.y + 330 * hs(o), 180); }
    }
    if (Math.random() < dt * 70) X.emit(1, h.x - dir * rnd(0, 140), y + rnd(-r, r) * .4, dir * rnd(300, 900), rnd(-60, 60), rnd(2, 4), rnd(.12, .25), RO);
    return Math.abs(h.x) < 1500;
  }, draw(h) {
    const rot = (dir > 0 ? 0 : Math.PI) - tilt * dir;
    for (const [back, al] of [[110, .22], [55, .45], [0, 1]]) { const c = F(h.x - dir * back, y); C.blade(c[0], c[1], rot, r * c[2], 1.2, al, .5); }
  } });
  C.arc(p.x, y + 30, dir, r * .9, tilt);
  C.slice(p.x + dir * 620, y, (dir > 0 ? 0 : Math.PI) + tilt * .3, 1150, { shift: big ? 13 : 8, w: big ? 1.4 : .9, delay: .05 });
  C.gash(p.x + dir * 160, rnd(-70, 70), p.x + dir * 1150, rnd(-70, 70), big ? 9 : 6, 2.4);
}
const DISMANTLE = { get name() { return ['Dismantle', 'Dismantle: Dragon Scale', 'Dismantle: Twin Meteors'][lvl()]; }, cd: 3, glow: 'red',
  get dur() { const L = LV[lvl()]; return .14 + L.n * L.gap + .25; },
  run(p, m, t) {
    const L = m.L || (m.L = LV[lvl()]);
    p.vx = 0; p.rate = 44;
    if (!m.s) { m.s = 1; facing(p, E.P2); if (L !== LV[0]) play('home-kj-kai', .9, none); }
    if (t < .14) { p.target = POSE.hookWind; return; }
    const n = Math.floor((t - .14) / L.gap);
    p.target = n >= L.n ? POSE.idle : n & 1 ? POSE.cross : POSE.hook;      // four hands, one after another
    if (n >= L.n || n === m.n) return;
    m.n = n;
    const last = n === L.n - 1;
    sfx.cut(last ? 1.6 : 1.1);
    blade(p, p.y + HEIGHT[n], last ? L.d + 10 : L.d, L.r * (last ? 1.25 : 1), last, K.TILT[n]);
    if (last && L !== LV[0]) {                        // grown, it parts the whole arena after it
      C.slice(cam.x, 300, p.face > 0 ? .12 : Math.PI - .12, 2600, { shift: 14, w: 1.6, life: .55, delay: .08 });
      X.flash(RO, .18, .25); shake(22);
      if (L === LV[2]) { V.split(p.face > 0 ? -.12 : .12); C.storm(cam.x, 8, true); }
    }
  } };

/* ================= 2 — CLEAVE ================= */
const CLEAVE = { name: 'Cleave', cd: 7, dur: 1.4, glow: 'red', run(p, m, t) {
  const o = E.P2, gap = live(o) ? (o.x - p.x) * p.face : 999;
  p.rate = 44;
  if (m.done !== undefined) { p.vx = 0; p.target = t < m.done + .5 ? POSE.jab : POSE.idle; if (t > m.done + .8) E.endMove(p); return; }
  if (t > .36) { p.vx = 0; p.target = POSE.idle; if (t > .5) E.endMove(p); return; }
  if (!m.s) { m.s = 1; facing(p, o); sfx.whoosh(); }
  p.target = POSE.dash; p.vx = t > .06 && gap > 150 && Math.abs(p.x + p.face * 70) < bound() ? p.face * 2100 : 0;
  if (t > .06 && gap <= 230 && E.tryHit(p, { reach: 240, dmg: exact(o, 6), kb: 0, stun: 1.6, stop: .12, col: RED, fixed: 1 })) {
    m.done = t; p.vx = 0;
    const face = p.face;
    sfx.cut(1.3); C.dice(o, 9, 300); C.stamp('捌', o.x, o.y + 340 * hs(o), 200); V.ring(o.x - face * 30, o.y + 165 * hs(o), 110, RED, .2);
    for (let i = 1; i <= 5; i++) E.after(i * .08, () => { if (live(o)) { E.applyHit(o, face, { dmg: exact(o, 10), kb: 20, stun: .7, stop: .03, col: RED, fixed: 1 }); C.dice(o, 2, 280); sfx.cut(.8); } });
    E.after(.5, () => {
      if (!live(o)) return;
      E.applyHit(o, face, { dmg: exact(o, 50), kb: 900, lift: 600, stop: .16, heavy: 1, col: RED, fixed: 1 });
      sfx.cut(1.9); C.dice(o, 5, 430, true); C.web(o.x, 360); C.frame(.17, o.x, o.y + 160); shake(30);
    });
  }
} };

/* ================= 3 — FURNACE ================= */
const DRAW_T = 1.2;
const FURNACE = { name: 'Furnace', cd: 16, dur: DRAW_T + 1.1, glow: 'fire', run(p, m, t) {
  const f = p.face;
  p.vx = 0; p.rate = 30;
  if (t < DRAW_T) {                                   // drawn with all four hands, fire turning in to them
    p.target = K.BOW;
    if (!m.c) {
      m.c = 1; facing(p, E.P2); sfx.charge(); sfx.rise(1.1); C.stamp('竈', p.x, p.y + 420, 210, '#ff8c50');
      V.custom(DRAW_T, v => {
        if (p.move !== m) return;
        const h = B.fist(p, true), n = Math.min(1, v * 1.25);
        for (let i = 0; i < 5; i++) { const a = E.T * 6 + i * 1.26, r = 130 * (1 - v * .6); C.tongue(h[0] + Math.cos(a) * r, h[1] - 40 + Math.sin(a) * r * .5, 70 + 50 * v, 34, i * 2.1, .85); }
        C.arrow(h[0] - p.face * 260 * n, h[1], p.face, 260 * n, Math.min(1, v * 4));
      });
    }
    if (!m.v && t >= DRAW_T - .5) { m.v = 1; play('home-kj-fuga', 1, () => sfx.roar(.6)); }      // "Fuga", its last sound as he lets go
    if (Math.random() < .6) X.emit(5, p.x + rnd(-200, 200), rnd(0, 60), rnd(-40, 40), rnd(200, 600), rnd(3, 6), rnd(.5, 1), FIRE);
    return;
  }
  p.target = t < DRAW_T + .4 ? POSE.div : POSE.idle;
  if (!m.loose) {
    m.loose = 1; sfx.whoosh();
    const o = E.P2, far = live(o) ? (o.x - p.x) * f : -1, h = B.fist(p, true), x0 = h[0], y0 = h[1];
    const ex = m.ex = edge(far > -30 && far < 1500 ? o.x : p.x + f * 700);
    V.custom(.3, u => C.arrow(lerp(x0, ex - f * 260, u), lerp(y0, 140, u), f, 260));
    V.custom(.6, u => { for (let i = 0; i < 9; i++) if (i / 9 < Math.min(1, u * 4)) C.tongue(lerp(x0, ex, i / 9), 40, 110 * (1 - u), 40, i * 1.3, 1 - u); });
  }
  if (m.boom || t < DRAW_T + .3) return;
  m.boom = 1;
  const x = m.ex, o = E.P2;
  K.furnaceFx(x);
  if (can(o) && Math.abs(o.x - x) < 520 + 40 * hs(o)) hit(o, o.x >= x ? 1 : -1, 150, { kb: 1000, lift: 800, stun: 1, stop: .2, heavy: 1, col: '#ff8c50' });
  K.burning(x, 2.6, (h, dt) => { if ((h.tick = (h.tick || 0) - dt) > 0) return; h.tick = .3; const q = E.P2; if (live(q) && Math.abs(q.x - x) < 420 && q.y < 80) chip(q, 4); });
} };

/* ================= 4 — KAMUTOKE ================= */
const KAMUTOKE = { name: 'Kamutoke', cd: 14, dur: 2.3, glow: 'blue', run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < 2 ? K.RAISE : POSE.idle;
  if (!m.s) { m.s = 1; facing(p, E.P2); sfx.charge(); X.dim(.55, 2.4); label(p.x, p.y + 540, 'KAMUTOKE', '#aad7ff', 1.2); }
  if (t < .5 || m.go) return;
  m.go = 1; X.flash('200,230,255', .25, .3); sfx.thunder();
  const o = E.P2, cx = live(o) ? o.x : p.x + p.face * 400;
  [-300, -150, 0, 150, 300, 0].forEach((d, i) => E.after(.08 + i * .16, () => {       // six on them, a little either side of where they stand
    const q = E.P2, x = edge((live(q) ? q.x : cx) + d * .6 + rnd(-40, 40));
    K.boltFx(x, 110, false, i % 2 === 0);
    if (can(q) && Math.abs(q.x - x) < 130 + 40 * hs(q)) hit(q, q.x >= x ? 1 : -1, 12, { kb: 200, stun: .8, stop: .05, col: '#aad7ff' });
  }));
  E.after(1.15, () => {                               // and the last of them, on them, the size of a tower
    const q = E.P2, x = edge(live(q) ? q.x : cx);
    K.boltFx(x, 220, true, true);
    if (can(q) && Math.abs(q.x - x) < 230 + 40 * hs(q)) hit(q, q.x >= x ? 1 : -1, 45, { kb: 600, lift: 900, stun: 1, stop: .2, heavy: 1, col: '#aad7ff' });
  });
} };

/* ================= E — THE CHANT ================= */
function line(jp, en, kanji, p) { E.banner(jp, en, 'sm'); C.stamp(kanji, p.x, p.y + 430, 230); sfx.charge(); X.dim(.55, 1.4); }
const SCALE = { name: 'Scale of the Dragon', dur: 1.3, glow: 'red', run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < 1 ? K.CHANT_POSE : POSE.idle;
  if (!m.s) { m.s = 1; line('竜鱗', 'SCALE OF THE DRAGON', '竜鱗', p); }
  if (t < .55 || m.go) return;
  m.go = 1; S.lvl = 1; S.cd = S.max = 4; relabel();
  sfx.bf(); shake(26); X.flash(RO, .3, .5); X.shock(p.x, 720, RO, .9, 18); X.pillar(p.x, 150, 1000, RO, 1);
  for (let i = 0; i < 40; i++) X.emit(3, p.x + rnd(-60, 60), p.y + rnd(80, 300), rnd(-900, 900), rnd(-100, 900), rnd(7, 12), rnd(.7, 1.3), i & 1 ? RO : '255,190,120', { g: 900, dr: 1.2, vr: rnd(-12, 12), w: .62, rot: rnd(0, TAU), edge: 'rgba(20,0,6,.7)' });      // scales of it, coming off him
  const o = E.P2;
  if (can(o) && Math.abs(o.x - p.x) < 380) hit(o, o.x >= p.x ? 1 : -1, 25, { kb: 1100, lift: 420, stun: .8, stop: .12, heavy: 1 });
  label(p.x, p.y + 560, 'DISMANTLE EMPOWERED', RED, 1.3);
} };
const METEORS = { name: 'Twin Meteors', dur: 1.9, glow: 'red', run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < 1.5 ? K.CHANT_POSE : POSE.idle;
  if (!m.s) { m.s = 1; line('番いの流星', 'TWIN METEORS', '番', p); sfx.rise(.75); }
  if (t < .45) return;
  if (m.tx === undefined) { const o = E.P2; m.tx = edge(live(o) ? o.x : p.x + p.face * 450); K.meteorFall(m.tx); }
  if (t < 1.2 || m.go) return;
  m.go = 1; S.lvl = 2; S.cd = S.max = 4; relabel();
  K.meteorsFx(m.tx);
  const o = E.P2;
  if (can(o) && Math.abs(o.x - m.tx) < 320 + 40 * hs(o)) hit(o, o.x >= m.tx ? 1 : -1, 70, { kb: 1000, lift: 820, stun: 1, stop: .2, heavy: 1 });
  label(p.x, p.y + 560, 'DISMANTLE EMPOWERED', RED, 1.3);
} };
const GRID_T = 1.8;
const RECOIL = { name: 'Recoil', dur: GRID_T + .9, glow: 'red', run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < GRID_T ? K.CHANT_POSE : t < GRID_T + .4 ? POSE.hook : POSE.idle;
  if (!m.s) {
    m.s = 1; line('反発', 'RECOIL', '反', p); X.dim(.7, GRID_T + .8);
    const G = m.G = K.lines();
    V.custom(GRID_T, v => { if (p.move === m) K.drawGrid(G, v); });
  }
  if (!m.beat && t > GRID_T * .4) { m.beat = 1; sfx.beat(.4); shake(8); }
  if (!m.v && t >= GRID_T - .27) { m.v = 1; play('home-kj-kai', 1, () => sfx.cut(2)); }
  if (t < GRID_T || m.go) return;
  m.go = 1; S.lvl = 3; S.cd = S.max = 30; relabel();
  K.worldCutFx(m.G);
  const o = E.P2;
  if (live(o)) {                                      // whatever it touches: a guard, a shield, a wall of anything, it goes through
    const s0 = H.shield; H.shield = null;
    try { E.applyHit(o, p.face, { dmg: exact(o, o.hp * 10 + 1e4), kb: 1300, lift: 900, stop: .3, heavy: 1, col: '#ffffff', fixed: 1 }); } finally { H.shield = s0; }
    C.dice(o, 9, 420, true); C.stamp('断', o.x, o.y + 340 * hs(o), 260);
  }
} };
const CHANT = [SCALE, METEORS, RECOIL];
const ESP = { jp: '詠', col: RED, name: () => CHANT[Math.min(2, S.lvl)].name, get left() { return S.cd; }, get max() { return S.max || 1; },
  press(p) {
    if (p.dead) return true;
    if (S.cd > 0) { sfx.back(); return true; }
    if (p.move || p.ps || p.dashT > 0 || !p.ground) return true;      // (in the middle of something: not now)
    p.move = { def: CHANT[Math.min(2, S.lvl)], key: 'esp', t: 0 };
    return true;
  } };

/* ================= G — MALEVOLENT SHRINE ================= */
const SHRINE = { name: 'Malevolent Shrine', dur: 4.6, glow: 'red', run(p, m, t) {
  const o = E.P2, n = Math.floor((t - .7) / .2);
  p.vx = 0; p.rate = 16; p.target = t < 4.2 ? JU.domain.SIGN : POSE.idle;
  if (!m.c) {
    m.c = 1; p.inv = 5;
    JU.domain.open({ who: p, tone: 'red', skin: K.KING, kind: 'shrine', reveal() {
      JU.domain.raise('shrine', { who: p, dur: 9, cancel() { if (p.move && p.move.def === SHRINE) E.endMove(p); p.inv = 0; } });
      shake(24); E.after(.25, () => { if (!JU.domain.clashing) E.banner('伏魔御廚子', 'MALEVOLENT SHRINE', 'sm'); });
    } });
  }
  if (t > .7 && n !== m.n && n < 17) {               // everything inside it, cut, over and over
    m.n = n;
    C.storm(cam.x, 4, n % 4 === 3); sfx.cut(n % 4 === 3 ? 1.6 : .9);
    if (live(o) && o.state !== 'down') { E.applyHit(o, p.face, { dmg: exact(o, 12), kb: 40, stun: .5, stop: .02, col: RED, fixed: 1 }); C.dice(o, 2, 300, n % 4 === 3); if (n % 4 === 3) C.frame(.1, o.x, o.y + 160); }
  }
} };
function awaken(p) { if (JU.domain && JU.domain.open) p.move = { def: SHRINE, t: 0 }; }

/* ================= the technique ================= */
const MOVES = { strikes: DISMANTLE, crush: CLEAVE, div: FURNACE, manji: KAMUTOKE };
JU.tech.add('aheian', { name: 'King of Jujutsu', jp: '呪術の王', mark: '王', who: 'The King of Curses, a thousand years ago', odds: 0, col: RED, glow: 'red', moves: MOVES,
  awakened: true, skin: K.KING, as: ['King of Jujutsu', '呪術の王'], awaken, awkName: 'Malevolent Shrine',
  hint: '<b>E</b> the chant, a line at a time: Scale of the Dragon, Twin Meteors, Recoil · <b>G</b> Malevolent Shrine' });
const DEF = T.TECH.aheian;
JU.especial.add('aheian', ESP);
// its card on the Awaken CT screen: the team's and the admins', and nobody else's (awaken.js leaves out a card whose hide() says so)
JU.awakened.LIST.push({ id: 'aheian', name: 'King of Jujutsu', mark: '王', col: RED,
  what: 'The King of Curses a thousand years ago: four arms and two faces. Dismantle, Cleave, Furnace, Kamutoke; E chants Scale of the Dragon, Twin Meteors, Recoil; G Malevolent Shrine.',
  open: dev, hide: () => !dev(), later: () => 'Admin only.', note: 'Admin only.' });

// Dismantle's name on the hotbar, as the chant grows it
let shownL = '';
function relabel() { const nm = DISMANTLE.name; if (nm === shownL || !on()) return; shownL = nm; E.hud.mv.strikes.querySelector('b').textContent = nm; }
// where the lower arms go: out of the way of the mouth on his belly while it speaks; all four on the bow for Furnace (game.js draws f.low)
const LOW = new Map([[FURNACE, [2.4, -.9]], [KAMUTOKE, [-.4, .35]], [SCALE, [-.5, .3]], [METEORS, [-.5, .3]], [RECOIL, [-.5, .3]], [SHRINE, [-.4, .4]]]);
const SPEAKS = new Set([FURNACE, SCALE, METEORS, RECOIL]);

const tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
let mouthed = false;
H.tick = dt => {
  tick0(dt);
  if (!on()) { if (mouthed) { K.mouth = 0; mouthed = false; } return; }
  const p = E.P1, m = p.move, d = m && m.def;
  JU.sukuna.style = true;                             // (his plain strikes cut, as the Shrine's do: sukuna.js)
  if (S.cd > 0) S.cd = Math.max(0, S.cd - dt);
  K.mouth = d && SPEAKS.has(d) ? 1 : 0; mouthed = true;
  const want = d && LOW.get(d), k = 1 - Math.exp(-dt * 14), ps = p.pose, dflt = [ps[2] * .6 - .2, ps[3] * .55 + .45];
  if (want) { if (!p.low) p.low = dflt; for (let i = 0; i < 2; i++) p.low[i] += (want[i] - p.low[i]) * k; }
  else if (p.low) { for (let i = 0; i < 2; i++) p.low[i] += (dflt[i] - p.low[i]) * k; if (Math.abs(p.low[0] - dflt[0]) + Math.abs(p.low[1] - dflt[1]) < .05) p.low = null; }
  relabel();
};
H.fx = dt => {
  fx0(dt);
  const p = E.P1, m = p.move;
  if (on() && m && m.def === KAMUTOKE && m.t < 2 && !p.dead) K.staff(p);      // Kamutoke in his raised hand
};
const clear = () => { S.lvl = 0; S.cd = 0; S.max = 1; shownL = ''; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) { clear(); relabel(); } };

JU.aheian = { MOVES, CHANT, SHRINE, ESP, get chant() { return { lvl: S.lvl, cd: +S.cd.toFixed(1) }; } };
})();
