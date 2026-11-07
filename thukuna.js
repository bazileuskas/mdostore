/* JUJUTSU UNLIMITEDS — Build 0.33: THUKUNA ;3, for admins only. The user: "make a new admin only CT called THUKUNA ;3 (include the face)
   and for each move play this sound from 20 seconds to the end whe nhe screams THUKUNAAAAAA, eacxh move is the recoil WCS and the e special
   is him becoming THUKUNA and make it be like in this image and his m1s are random 1 shot moves from the game."
   The King of Curses in the Vessel's body (sukuna.js), and:
     1 2 3 4   every one of them the World Cutting Slash: the King of Jujutsu's Recoil (aheian.js). The grid drawn over everything, and the
               cut that nothing stops (a guard, a shield, a wall of anything)
     M1        a one-shot move from the game, a different one each time, at random: the Cursed Judge's Executioner's Sword, the Cursed
               Speaker's "Die", Ratio Man's Overtime, the Miracle Dork's Instant Kill, the Love Reaper's Reaping Slash, Idle Transfiguration
               (the touch that kills, the Self-Embodiment of Perfection's) and Mr. Instincto's Black Flash
     E         he becomes THUKUNA, as in the user's picture: a cut-in of it, drawn by the game (the head as big as the rest of him, the red
               T-shirt, the crazed red eyes, the grin with its two front teeth, a clawed hand reaching out at you, "DISMANTLE!"), and that is
               what he is from then on: the head, the T-shirt, black claws. E again and he is the King of Curses again
   Every move screams THUKUNAAAAAA: sounds/home-thukuna.mp3, the user's clip from 20 seconds to its end, started again from the top by
   each move (sfx.file hands back what it starts, Build 0.33). It is a meme's sound, so this copy only (.gitignore; build.py leaves it out)
   and nothing on the public site has it: myinstants has no copy of it (the clips called Thukuna there were all checked against it).
   There the moves sound as the King of Jujutsu's do.
   Admin only: the CT screen shows it to the team's account and to whoever the team has given admin powers (tech.js); the shop lets
   nobody else equip it (shop.js). In a duel its blows kill (kill: 1, pvp.js), as only an admin's may */
(() => {
'use strict';

const E = JU.eng, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, C = JU.cut, X = JU.bossfx, K = JU.heian, T = JU.tech, Fi = JU.fights;
const { rnd, lerp, clamp, ease } = E, TAU = Math.PI * 2;
const SUK = JU.sukuna.SUKUNA;
let g = E.g;                                        // (what everything here draws on: the game's canvas, or for a moment his card's, drawOn)
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const live = o => !!o && !o.ko && !(o.alpha < 1);
const exact = (o, n) => n / (o.dr || 1);
const hs = o => o.scale || 1;
const mid = o => o.y + 170 * hs(o);
const bound = () => (H.bound ? H.bound() : 965);
const duel = () => !!(JU.pvp && JU.pvp.busy);
const facing = (p, o) => { if (live(o)) p.face = o.x >= p.x ? 1 : -1; };
const on = () => T.active === DEF;
const label = (x, y, text, col, life = 1.1) => E.fx.push({ k: 2, x, y, n: text, col, t: 0, life });
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
// held where they stand for a moment (a duel's other player is held by his own game)
const hold = (o, t) => { if (!duel() && live(o)) Object.assign(o, { vx: 0, state: o.state === 'air' ? 'air' : 'hurt', stun: Math.max(o.stun || 0, t), act: null, tele: 0 }); };

const RED = '#ff2440', RO = '255,36,64', GOLD = '#ffd86a', GRGB = '255,216,106', PINK = '#ff3b55', LILAC = '#c9a0ff', SOUL = '#9fd0e0', SRGB = '159,208,224', INK = '#120a10';
// THUKUNA's colours, off the picture
const HAIR = '#dd8d76', HAIR2 = '#b5624e', UNDER = '#3d2620', SKIN = '#f5d0b2', SKIN2 = '#dcaa87', SKIN3 = '#c99572', SHIRT = '#c3242d', SHIRT2 = '#8f1820',
  MOUTH = '#5a1418', TONGUE = '#e3788a', IRIS = '#d0102a', CLAW = '#141016', WHITE = '#fffaf4';
const PGLOW = (() => {                              // a pink glow for the smoke he becomes it in
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.2, 'rgba(255,150,180,.85)'); gr.addColorStop(.5, 'rgba(255,120,160,.2)'); gr.addColorStop(1, 'rgba(255,120,160,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return c;
})();
E.GLOW.pink = E.GLOW.pink || PGLOW;

/* ================= the scream ================= */
const SCREAM = 'home-thukuna', LINE_SAID = 'THUKUNAAAAAA!';
let primed = false, voice = null;                   // voice: the scream going now (to start it again from the top on the next move)
const prime = () => { if (primed) return; primed = true; sfx.preload([SCREAM]); try { if (document.fonts) document.fonts.load("italic 800 40px 'Shantell Sans'"); } catch (e) {} };      // (and the handwriting's font, before the cut-in wants it)
let said = null;
function scream(p, vol = .95) {
  prime();
  if (voice && voice.pause) try { voice.pause(); } catch (e) {}
  const n = sfx.file(SCREAM, vol);
  voice = n && n.pause ? n : null;
  if (JU.manga && p) { if (said && said.el) said.el.remove(); said = JU.manga.say(p, LINE_SAID, { life: 1.8 }); }      // (and the words of it, in a box, as a manga has them)
  return !!n;
}

/* ================= a blow that kills, whatever it lands on ================= */
// through anything (a guard, a shield, a wall of anything: as the World Cutting Slash goes). The number shown is what they had
function lethal(o, face, more) {
  if (!live(o)) return false;
  const had = o.hp, n0 = E.fx.length, s0 = H.shield;
  H.shield = null;
  try { E.applyHit(o, face, Object.assign({ dmg: exact(o, o.hp * 10 + 1e4), kb: 900, lift: 700, stun: 1, stop: .25, heavy: 1, col: '#ffffff', fixed: 1, mute: 1, kill: 1 }, more)); }
  finally { H.shield = s0; }
  for (let i = E.fx.length - 1; i >= n0; i--) if (typeof E.fx[i].n === 'number') E.fx.splice(i, 1);
  if (!duel()) E.addNum(o.x, o.y + 270 * hs(o), Math.round(had), '#ffd27a');
  return true;
}

/* ================= 1 2 3 4 — the World Cutting Slash (the King of Jujutsu's Recoil, aheian.js) ================= */
const GRID_T = 1.8;                                 // the grid drawn over everything; and then the cut, as the scream ends
const WCS = () => ({ name: 'World Cutting Slash', cd: 5, dur: GRID_T + .9, glow: 'red', run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < GRID_T ? K.CHANT_POSE : t < GRID_T + .4 ? POSE.hook : POSE.idle;
  if (!m.s) {
    m.s = 1; facing(p, E.P2); scream(p);
    E.banner('反発', 'RECOIL', 'sm'); C.stamp('反', p.x, p.y + 430 * hs(p), 230); sfx.charge(); X.dim(.7, GRID_T + .8);
    const G = m.G = K.lines();
    V.custom(GRID_T, v => { if (p.move === m) K.drawGrid(G, v); });
  }
  if (!m.beat && t > GRID_T * .4) { m.beat = 1; sfx.beat(.4); shake(8); }
  if (t < GRID_T || m.go) return;
  m.go = 1;
  K.worldCutFx(m.G);
  const o = E.P2;
  if (live(o)) { lethal(o, p.face, { kb: 1300, lift: 900, stop: .3 }); C.dice(o, 9, 420, true); C.stamp('断', o.x, o.y + 340 * hs(o), 260); }
} });
const MOVES = { strikes: WCS(), crush: WCS(), div: WCS(), manji: WCS() };

/* ================= M1 — a one-shot move from the game, at random ================= */
// in to them, quick: true once he is there (m.at, when), false while he is on the way. Not there by `upTo`, and he stops
function reach(p, m, t, range, upTo = .42) {
  if (m.at !== undefined) return true;
  const o = E.P2;
  if (!live(o)) { p.vx = 0; return false; }
  const gap = (o.x - p.x) * p.face;
  if (gap > -40 && gap < range && Math.abs(o.y - p.y) < 240) { m.at = t; p.vx = 0; return true; }
  p.vx = t < upTo && gap > 0 && Math.abs(p.x + p.face * 80) < bound() ? p.face * 2300 : 0;
  return false;
}
// the start of every one of them: square up, scream, and its name
function begin(p, m) { m.s = 1; facing(p, E.P2); scream(p); label(p.x, p.y + 470 * hs(p), m.def.name.toUpperCase(), m.def.col || RED, 1); }
// on the way in: the dash, and what is left of him behind it
function going(p, m, t, range) {
  if (m.at !== undefined) return true;
  p.target = POSE.dash; p.rate = 40;
  if (E.T - (m.gh || 0) > .03) { m.gh = E.T; V.puff(m.def.glow || 'red', p.x - p.face * 40, p.y + 160, -p.face * 200, 0, 60, .2); }
  if (reach(p, m, t, range)) return true;
  if (t > .5) { p.vx = 0; p.target = POSE.idle; if (t > .62) E.endMove(p); }
  return false;
}

// the Cursed Judge's: the Executioner's Sword, a blade of nothing but light (judge.js)
const EXEC = { name: "Executioner's Sword", col: GOLD, dur: 1.05, glow: 'gold', sword: 1, run(p, m, t) {
  if (!m.s) { begin(p, m); sfx.sword(); }
  if (!going(p, m, t, 230)) return;
  const k = t - m.at;
  p.rate = 46; p.target = k < .1 ? POSE.crushWind : k < .45 ? POSE.crush : POSE.idle;
  if (m.hit || k < .1) return;
  m.hit = 1;
  const o = E.P2, y = mid(o);
  sfx.execute(); shake(40); V.split(p.face > 0 ? -.5 : .5); V.impact(.4, o.x, y);
  X.pillar(o.x, 150, 900, GRGB, .7); X.shock(o.x, 620, GRGB, .6, 14);
  V.slash(o.x, y, p.face > 0 ? -.9 : Math.PI + .9, 640, GOLD, 22); V.slash(o.x, y, p.face > 0 ? -.9 : Math.PI + .9, 700, '#ffffff', 7, .03); V.sparks(o.x, y, 'gold', 22);
  lethal(o, p.face, { kb: 900, lift: 560, col: GOLD });
  E.banner('処刑', "EXECUTIONER'S SWORD", 'sm');
} };
// the Cursed Speaker's last word: "Die" (inumaki.js). Said, and whatever it is said to dies
const SPEAK_WIND = [-.08, .12, .5, .3, .3, -.3, 0], SPEAK = [-.16, -.38, .7, .45, .35, -.35, 0];
const DIE = { name: 'Cursed Speech: Die', col: RED, dur: 1.15, glow: 'red', run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < .35 ? SPEAK_WIND : t < .85 ? SPEAK : POSE.idle;
  if (!m.s) begin(p, m);
  if (!m.boom && t > .3) { m.boom = 1; sfx.word(); }
  if (m.go || t < .35) return;
  m.go = 1;
  const o = E.P2;
  label(p.x + p.face * 60, p.y + 360 * hs(p), '死ね', RED, 1.2);
  const mx = p.x + p.face * 40, my = p.y + 290 * hs(p), tx = live(o) ? o.x : p.x + p.face * 700;
  for (let i = 0; i < 6; i++) E.after(i * .05, () => { V.ring(lerp(mx, tx, i / 5), lerp(my, live(o) ? mid(o) : my, i / 5), 70 + i * 40, '#ff3355', .3); });
  E.after(.1, () => V.ring(mx, my, 260, '#ffffff', .3));
  shake(44); E.stop(.12); X.shock(tx, 980, RO, .8, 18);
  if (live(o)) lethal(o, o.x >= p.x ? 1 : -1, { kb: 300, lift: 700, col: RED });
  E.banner('死ね', 'DIE', 'sm');
} };
// Ratio Man's: Overtime. The line at seven to three, and the blade through it (ratio.js)
const OVER = { name: 'Overtime', col: GOLD, dur: 1.05, glow: 'gold', run(p, m, t) {
  if (!m.s) { begin(p, m); sfx.whoosh(); }
  if (!going(p, m, t, 250)) return;
  const k = t - m.at;
  p.rate = 46; p.target = k < .3 ? POSE.div : POSE.idle;
  if (m.hit) return;
  m.hit = 1;
  const o = E.P2, ang = .8, x0 = o.x, y0 = mid(o);
  V.custom(.35, u => {                              // the line, seven parts to three
    const a = F(x0 - 140, y0 + 70), b = F(x0 + 140, y0 - 70);
    g.save(); g.globalAlpha = 1 - u; g.lineCap = 'round';
    g.strokeStyle = LINE; g.lineWidth = 9 * a[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    g.strokeStyle = GOLD; g.lineWidth = 4 * a[2]; g.stroke();
    const c = [lerp(a[0], b[0], .7), lerp(a[1], b[1], .7)];
    g.fillStyle = '#fff'; g.beginPath(); g.arc(c[0], c[1], 9 * a[2], 0, TAU); g.fill(); g.restore();
  });
  lethal(o, p.face, { kb: 300, lift: 260, col: INK });
  JU.kokusen.insane(o, { acc: GRGB, name: 'OVERTIME', size: 340, split: p.face > 0 ? -ang : ang });
} };
// the Miracle Dork's: Instant Kill (haruta.js)
const INSTANT = { name: 'Instant Kill', col: PINK, dur: .95, glow: 'red', run(p, m, t) {
  if (!m.s) begin(p, m);
  if (!going(p, m, t, 230)) return;
  const k = t - m.at;
  p.rate = 50; p.target = k < .08 ? POSE.hookWind : k < .4 ? POSE.hook : POSE.idle;
  if (m.hit || k < .08) return;
  m.hit = 1;
  const o = E.P2, y = mid(o);
  sfx.whoosh(); sfx.cut(1.4); shake(40); E.zoomIn(.5);
  V.slash(o.x, y, p.face > 0 ? 1.2 : Math.PI - 1.2, 420, PINK, 14); V.ring(o.x, y, 420, PINK, .3);
  if (JU.vengeful && JU.vengeful.fx) JU.vengeful.fx.pop(o.x, y + 170, 'トドメ', 64, PINK);
  lethal(o, p.face, { kb: 900, lift: 1200, col: PINK });
  E.banner('即死', 'INSTANT KILL', 'xs');
} };
// the Love Reaper's: Reaping Slash. The cut, black lightning out of them edged in red, and the kick that sends them the length of the arena (reaper.js)
const REAP = { name: 'Reaping Slash', col: LILAC, dur: 1.25, glow: 'purple', run(p, m, t) {
  if (!m.s) { begin(p, m); sfx.whoosh(); }
  if (!going(p, m, t, 230)) return;
  const k = t - m.at, o = E.P2;
  p.rate = 46; p.target = k < .12 ? POSE.hook : k < .28 ? POSE.kickWind : k < .65 ? POSE.kick : POSE.idle;
  if (!m.cut) {
    m.cut = 1; hold(o, .6); sfx.cut(1.6); E.stop(.1);
    const y = mid(o);
    V.slash(o.x, y, p.face > 0 ? .4 : Math.PI - .4, 760, RED, 20); V.slash(o.x, y, p.face > 0 ? -.5 : Math.PI + .5, 680, LILAC, 14, .04);
    for (let i = 0; i < 9; i++) { const a = rnd(0, TAU), l = rnd(300, 900); V.bolt(o.x, y, o.x + Math.cos(a) * l, y + Math.sin(a) * l * .8, RED, rnd(.25, .5), rnd(4, 9), INK); }
  }
  if (m.hit || k < .3) return;
  m.hit = 1;
  lethal(o, p.face, { kb: 3200, lift: 700, col: RED });
  sfx.blast(); sfx.punch(4, 1.2); shake(44); E.zoomIn(.5);
  V.ring(o.x, o.y + 150, 420, RED, .35); V.sparks(o.x, o.y + 150, 'red', 20); V.rocks(o.x, 0, 10);
  X.flash(RO, .3, .18); X.shock(o.x, 620, RO, .5, 12);
  E.banner('純愛', 'REAPING SLASH', 'sm');
} };
// Idle Transfiguration: a touch, and the shape of their soul is changed. Nothing gets up from it (mahito.js)
const IDLE = { name: 'Idle Transfiguration', col: SOUL, dur: 1.15, glow: 'blue', run(p, m, t) {
  if (!m.s) begin(p, m);
  if (!going(p, m, t, 200)) return;
  const k = t - m.at, o = E.P2;
  p.rate = 46; p.target = k < .5 ? POSE.jab : POSE.idle;
  if (!m.touch) {
    m.touch = 1; hold(o, .5); sfx.wave(); E.stop(.08);
    const x = o.x, y = mid(o);
    for (let i = 0; i < 4; i++) E.after(i * .07, () => V.ring(x - p.face * 20, y, 90 + i * 70, SOUL, .35));
    V.custom(.75, u => {                            // stitches across them as it takes
      const c = F(x, y), s = c[2];
      g.save(); g.globalAlpha = u < .8 ? 1 : (1 - u) / .2; g.strokeStyle = INK; g.lineCap = 'round'; g.lineWidth = 4 * s;
      for (let j = 0; j < 3; j++) {
        const yy = c[1] + (j - 1) * 55 * s, n = Math.min(7, Math.floor(u * 20));
        g.beginPath(); g.moveTo(c[0] - 70 * s, yy); g.lineTo(c[0] + 70 * s, yy + 8 * s); g.stroke();
        for (let i = 0; i < n; i++) { const xx = c[0] - 60 * s + i * 20 * s; g.beginPath(); g.moveTo(xx, yy - 10 * s); g.lineTo(xx + 6 * s, yy + 14 * s); g.stroke(); }
      }
      g.restore();
    });
    C.stamp('無為転変', x, y + 230, 120, '#cfe8f0');
  }
  if (m.go || k < .32) return;
  m.go = 1;
  lethal(o, p.face, { kb: 200, lift: 380, col: SOUL });
  X.flash(SRGB, .25, .2); V.sparks(o.x, mid(o), 'blue', 16);
  E.banner('無為転変', 'IDLE TRANSFIGURATION', 'sm');
} };
// Mr. Instincto's: a Black Flash, and nothing is left standing after his (vengeful.js)
const BF = { name: 'Black Flash', col: RED, dur: 1.05, glow: 'red', run(p, m, t) {
  if (!m.s) begin(p, m);
  if (!going(p, m, t, 210)) return;
  const k = t - m.at;
  p.rate = 50; p.target = k < .06 ? POSE.divWind : k < .4 ? POSE.div : POSE.idle;
  if (m.hit || k < .06) return;
  m.hit = 1;
  const o = E.P2;
  lethal(o, p.face, { kb: 1100, lift: 600, col: RED });
  JU.kokusen.insane(o, { acc: RO, name: 'BLACK FLASH', size: 360, split: p.face > 0 ? -.35 : .35 });
} };
const ONE = [EXEC, DIE, OVER, INSTANT, REAP, IDLE, BF];
let lastOne = null;
function m1(i) {
  const p = E.P1, d = (() => { const pool = ONE.filter(x => x !== lastOne); return pool[Math.random() * pool.length | 0]; })();
  lastOne = d;
  p.move = { def: d, i, t: 0 };
  return false;
}

/* ================= E — he becomes THUKUNA ================= */
const FORM_T = 1.9, ECD = 3;                        // as long as the scream; the wait before E does anything again
let form = null, ecd = 0, cut = null;               // form: THUKUNA is what he is ({ skin0: what he was }); cut: the cut-in going ({ t, life })
const REACH = [.22, -.12, 1.85, 1.1, .5, -.45, 0];   // reaching out at you, claws first
const BECOME = { name: 'THUKUNA', dur: FORM_T, glow: 'red', run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < .25 ? POSE.crushWind : t < FORM_T - .2 ? REACH : POSE.idle;
  if (!m.s) {
    m.s = 1; facing(p, E.P2); scream(p, 1);
    p.inv = Math.max(p.inv || 0, FORM_T + .3);
    cut = { t: 0, life: FORM_T - .05 }; X.dim(.6, FORM_T); sfx.charge();
  }
  if (!m.sw && t > .2) { m.sw = 1; become(p, true); poof(p); }      // (under the cut-in: the head grows)
  if (!m.end && t > FORM_T - .12) { m.end = 1; label(p.x, p.y + 560, 'THUKUNA ;3', '#ff9ab8', 1.4); shake(14); }
} };
const UNBECOME = { name: 'King of Curses', dur: .8, glow: 'red', run(p, m, t) {
  p.vx = 0; p.rate = 30; p.target = t < .3 ? POSE.crushWind : POSE.idle;
  if (!m.s) { m.s = 1; scream(p, .9); poof(p); become(p, false); label(p.x, p.y + 520, 'KING OF CURSES', RED, 1.1); }
} };
function become(p, yes) {
  if (yes && !form) { form = { skin0: p.skin }; p.skin = THUKUNA; }
  else if (!yes && form) { p.skin = form.skin0 === THUKUNA ? SUK : form.skin0 || SUK; form = null; }
  if (Fi && Fi.nm && Fi.nm.p1) { Fi.nm.p1.textContent = form ? 'THUKUNA ;3' : DEF.as[0]; Fi.nm.p1j.textContent = form ? 'チュクナ' : DEF.as[1]; }
}
function poof(p) {
  for (let i = 0; i < 26; i++) V.puff('pink', p.x + rnd(-80, 80), p.y + rnd(60, 420), rnd(-380, 380), rnd(-80, 420), rnd(60, 130), rnd(.35, .7));
  V.ring(p.x, p.y + 220, 300, '#ff9ab8', .35); sfx.blast();
}
const ESP = { jp: 'チュクナ', col: '#ff9ab8', name: () => (form ? 'King of Curses' : 'THUKUNA'), get left() { return ecd; }, get max() { return ECD; },
  press(p) {
    if (p.dead) return true;
    if (ecd > 0) { sfx.back(); return true; }
    if (p.move || p.ps || p.dashT > 0) return true;      // (in the middle of something: not now)
    p.move = { def: form ? UNBECOME : BECOME, key: 'esp', t: 0 };
    ecd = ECD;
    return true;
  } };

/* ================= how THUKUNA looks ================= */
const HEAD = 1.95;                                  // his head: nearly twice what it was, on the same shoulders
const lw = n => { g.lineWidth = n / HEAD; };
// in the fight: the Vessel's rig, three quarters on, looking the way he faces
const ANCHOR = 34;                                  // the head grows from here: its chin a little over his shoulders, on a neck, clear of his arms
const shape = () => { g.beginPath(); g.ellipse(1, 0, 25.5, 24, 0, 0, TAU); };
const HP = [[-27, -5], [-34, -17], [-25, -19], [-31, -32], [-18, -28], [-20, -43], [-8, -33], [-4, -49], [4, -35], [11, -47], [15, -33], [24, -42], [23, -27], [32, -29], [27, -17], [31, -10],
  [23, -13], [19, -8.5], [15, -13.5], [10.5, -9.5], [6, -14.5], [1, -10.5], [-4, -15], [-9, -11.5], [-14, -15], [-19, -9]];
const hairPath = () => { g.beginPath(); g.moveTo(HP[0][0], HP[0][1]); for (let i = 1; i < HP.length; i++) g.lineTo(HP[i][0], HP[i][1]); g.closePath(); };
function neck(side, front) {
  const gr = g.createLinearGradient(-6, 0, 10, 0); gr.addColorStop(.3, side); gr.addColorStop(.8, front);
  g.fillStyle = gr; g.beginPath(); g.rect(-6, 10, 15, 12); g.fill();
  g.strokeStyle = LINE; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-6, 10); g.lineTo(-6, 21); g.moveTo(9, 10); g.lineTo(9, 21); g.stroke();
}
// the same head, in two flat tones: for a hit's flash, a dash's frames, the World Cutting Slash's silhouettes (game.js, flat)
function chibiSil(side, front) {
  neck(side, front);
  g.save(); g.translate(0, ANCHOR); g.scale(HEAD, HEAD); g.translate(0, -ANCHOR);
  const gr = g.createLinearGradient(-25, 0, 26, 0); gr.addColorStop(.35, side); gr.addColorStop(.8, front);
  g.fillStyle = gr; g.strokeStyle = LINE; g.lineJoin = 'round'; lw(3);
  shape(); g.fill(); g.stroke(); hairPath(); g.fill(); g.stroke(); shape(); g.fill();
  g.restore();
}
function chibiHead() {
  neck(SKIN2, SKIN);
  g.save();
  g.translate(0, ANCHOR); g.scale(HEAD, HEAD); g.translate(0, -ANCHOR);
  g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = LINE;
  const gr = g.createLinearGradient(-25, 0, 26, 0);
  gr.addColorStop(.25, SKIN2); gr.addColorStop(.7, SKIN);
  shape(); g.fillStyle = gr; g.fill();
  g.save(); shape(); g.clip();                      // the dark undercut, at the back and the side
  g.fillStyle = UNDER; g.beginPath(); g.moveTo(-27, -18); g.lineTo(-5, -18); g.lineTo(-7, -4); g.quadraticCurveTo(-14, 5, -27, 7); g.closePath(); g.fill();
  g.fillStyle = 'rgba(120,60,40,.18)'; g.beginPath(); g.ellipse(-2, 16, 18, 8, 0, 0, TAU); g.fill();      // (the shadow under the jaw)
  g.restore();
  shape(); lw(3); g.stroke();
  // the ear
  g.fillStyle = SKIN2; g.beginPath(); g.ellipse(-12.5, 3, 4.4, 6, -.1, 0, TAU); g.fill(); lw(2.2); g.stroke();
  lw(1.3); g.beginPath(); g.moveTo(-12.5, 0); g.quadraticCurveTo(-10.6, 3, -12.6, 6); g.stroke();
  // the hair: salmon, in spikes, the fringe short
  hairPath(); g.fillStyle = HAIR; g.fill(); lw(2.4); g.stroke();
  g.strokeStyle = HAIR2; lw(1.4); g.beginPath();
  for (const [a, b, c, d] of [[-22, -18, -26, -28], [-12, -20, -17, -36], [-2, -21, -4, -42], [8, -21, 10, -40], [17, -20, 21, -36], [23, -16, 28, -22]]) { g.moveTo(a, b); g.lineTo(c, d); }
  g.stroke(); g.strokeStyle = LINE;
  // the mark on his forehead
  lw(1.7); g.beginPath(); g.moveTo(8.6, -9.6); g.lineTo(11.6, -6.6); g.lineTo(14.6, -9.6); g.moveTo(11.6, -6.6); g.lineTo(11.6, -4.9); g.stroke();
  // the brows: thick, and down at the middle
  lw(3.3); g.beginPath(); g.moveTo(-3.5, -5.5); g.lineTo(8.2, -1.6); g.moveTo(15.2, -1.6); g.lineTo(23, -5); g.stroke();
  // the eyes: big, white all round, small red in the middle of them
  eye(3.2, 3, 6.1, 5, .9); eye(18.6, 3, 4.8, 4.8, .7);
  // under them: the second pair, as lines
  lw(1.4); g.beginPath(); g.moveTo(-2.6, 9); g.quadraticCurveTo(3, 11.2, 8.6, 8.8); g.moveTo(14.4, 8.8); g.quadraticCurveTo(18.6, 10.8, 22.6, 8.4); g.stroke();
  // the marks on his cheek
  lw(1.7); g.beginPath(); g.moveTo(-3.6, 6.4); g.quadraticCurveTo(-5.6, 8.4, -6.4, 12); g.moveTo(23.4, 6.6); g.quadraticCurveTo(24.6, 8, 25, 10.6); g.stroke();
  // the nose
  lw(1.3); g.beginPath(); g.moveTo(12.6, 6.2); g.quadraticCurveTo(14.6, 8.6, 12.2, 9.2); g.stroke();
  // the grin: wide open, the two front teeth, the tongue
  const mouth = () => { g.beginPath(); g.moveTo(1, 11.4); g.quadraticCurveTo(12, 9.4, 23.4, 11); g.quadraticCurveTo(22, 23.4, 11.8, 23.2); g.quadraticCurveTo(1.6, 22.6, 1, 11.4); g.closePath(); };
  mouth(); g.fillStyle = MOUTH; g.fill();
  g.save(); mouth(); g.clip();
  g.fillStyle = TONGUE; g.beginPath(); g.ellipse(12, 23, 7.8, 5.8, 0, 0, TAU); g.fill();
  g.strokeStyle = '#b8505e'; lw(1); g.beginPath(); g.moveTo(12, 18.4); g.lineTo(12, 21.5); g.stroke();
  g.fillStyle = WHITE; g.strokeStyle = LINE; lw(1.2);
  for (const x of [8.7, 12.3]) { g.beginPath(); g.roundRect(x, 8.6, 3.5, 6.2, [0, 0, 1.3, 1.3]); g.fill(); g.stroke(); }
  g.restore();
  mouth(); lw(2.2); g.strokeStyle = LINE; g.stroke();
  g.restore();
}
function eye(x, y, rx, ry, look) {
  g.fillStyle = WHITE; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); lw(1.5); g.strokeStyle = LINE; g.stroke();
  g.fillStyle = IRIS; g.beginPath(); g.arc(x + look, y + .3, ry * .46, 0, TAU); g.fill();
  g.fillStyle = LINE; g.beginPath(); g.arc(x + look, y + .3, ry * .2, 0, TAU); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(x + look - ry * .17, y - ry * .1, ry * .09, 0, TAU); g.fill();
  lw(2.5); g.beginPath(); g.ellipse(x, y, rx, ry, 0, Math.PI * 1.06, Math.PI * 1.94); g.stroke();      // the lid, heavier
}
const THUKUNA = {
  torso: [SHIRT2, SHIRT],
  armF: [SKIN2, SKIN, SKIN2, SKIN, .25],
  armB: [SKIN3, '#e0b18f', SKIN3, '#e0b18f', .25],
  legF: ['#2a2530', '#3a3342', '#1a171d', '#26222b', .21],
  legB: ['#1d1a22', '#29252f', '#121014', '#1c191f', .21],
  chest() {                                         // the T-shirt's neck, and where it folds
    g.fillStyle = '#6e0f16'; g.beginPath(); g.ellipse(6, -76, 19, 8, 0, 0, Math.PI); g.fill();
    g.strokeStyle = 'rgba(60,0,8,.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-14, -40); g.quadraticCurveTo(0, -34, 16, -42); g.stroke();
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-30, -8, 60, 4);
  },
  back: null,
  head: chibiHead,
  sil: chibiSil
};
// his claws, black and long, off the end of each hand that is out in front of him
function claws(p) {
  const ps = p.pose, r = ps[6];
  for (const front of [true, false]) {
    const w = E.hand(p, front);
    if (!front && (w[0] - p.x) * p.face < 52) continue;      // (the far hand, behind him or in front of his body: nothing of it to see)
    const a = front ? ps[2] : ps[3], c = F(w[0], w[1]), k = c[2] * 1.3, base = Math.atan2(Math.cos(a - r), p.face * Math.sin(a - r));
    const nx = -Math.sin(base), ny = Math.cos(base);
    g.fillStyle = CLAW;
    for (let i = 0; i < 4; i++) {
      const sp = (i - 1.5), an = base + sp * .2, L = (i === 0 || i === 3 ? 22 : 28) * k;
      const bx = c[0] + Math.cos(base) * 4 * k + nx * sp * 4 * k, by = c[1] + Math.sin(base) * 4 * k + ny * sp * 4 * k;
      const tx = bx + Math.cos(an + .22 * p.face) * L, ty = by + Math.sin(an + .22 * p.face) * L;
      g.beginPath(); g.moveTo(bx + nx * 2.4 * k, by + ny * 2.4 * k); g.quadraticCurveTo(bx + Math.cos(an) * L * .65, by + Math.sin(an) * L * .65, tx, ty); g.lineTo(bx - nx * 2.4 * k, by - ny * 2.4 * k); g.closePath();
      g.strokeStyle = 'rgba(255,214,222,.6)'; g.lineWidth = 1.6 * k; g.stroke(); g.fill();      // (a pale edge: black on a dark arena is not seen)
    }
  }
}
// the Executioner's Sword in his hand while it is out: a blade of light along his arm
function lightSword(p) {
  const ps = p.pose, w = E.hand(p, true), a = ps[2] - ps[6], c = F(w[0], w[1]), k = c[2] * 1.3, L = 190 * k;
  const ang = Math.atan2(Math.cos(a), p.face * Math.sin(a)), tx = c[0] + Math.cos(ang) * L, ty = c[1] + Math.sin(ang) * L, nx = -Math.sin(ang), ny = Math.cos(ang);
  lit(() => {
    E.glow(E.GLOW.gold, (c[0] + tx) / 2, (c[1] + ty) / 2, 300 * c[2], .5);
    g.fillStyle = 'rgba(255,216,106,.6)'; g.beginPath(); g.moveTo(c[0] + nx * 12 * k, c[1] + ny * 12 * k); g.lineTo(tx, ty); g.lineTo(c[0] - nx * 12 * k, c[1] - ny * 12 * k); g.closePath(); g.fill();
    g.fillStyle = '#fff6d8'; g.beginPath(); g.moveTo(c[0] + nx * 5 * k, c[1] + ny * 5 * k); g.lineTo(tx, ty); g.lineTo(c[0] - nx * 5 * k, c[1] - ny * 5 * k); g.closePath(); g.fill();
  });
}

/* ---------- the cut-in: the picture, drawn: his head and shoulders, close, a hand reaching out at you, "DISMANTLE!" ---------- */
const SPK = [[184, .2], [194, .34], [205, .28], [216, .42], [228, .36], [240, .48], [252, .4], [264, .5], [276, .44], [288, .52], [300, .4], [312, .48], [324, .36], [336, .4], [347, .3], [356, .2]];
const FRINGE = [[.98, -.16], [.86, -.36], [.72, -.42], [.6, -.34], [.48, -.5], [.34, -.42], [.2, -.55], [.06, -.45], [-.08, -.57], [-.22, -.45], [-.36, -.54], [-.5, -.41], [-.62, -.5], [-.75, -.35], [-.88, -.37], [-.99, -.18]];
// a clawed hand: the palm at (x, y), the fingers out the way `ang` points, s the size of it
function hand2d(x, y, s, ang, spread = .28, side = 1) {      // (side: which side of the fingers the thumb is)
  g.lineJoin = 'round'; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const a = ang + (i - 1.5) * spread, bx = x + Math.cos(a) * .36 * s, by = y + Math.sin(a) * .36 * s, L = (i === 0 || i === 3 ? .58 : .74) * s;
    const ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L;
    g.strokeStyle = LINE; g.lineWidth = .3 * s; g.beginPath(); g.moveTo(bx, by); g.lineTo(ex, ey); g.stroke();
    g.strokeStyle = SKIN; g.lineWidth = .22 * s; g.stroke();
    const cl = .5 * s, nx = -Math.sin(a), ny = Math.cos(a), ca = a + .35;
    g.fillStyle = CLAW; g.beginPath();
    g.moveTo(ex + nx * .1 * s, ey + ny * .1 * s); g.quadraticCurveTo(ex + Math.cos(a) * cl * .7 + nx * .1 * s, ey + Math.sin(a) * cl * .7 + ny * .1 * s, ex + Math.cos(ca) * cl, ey + Math.sin(ca) * cl);
    g.lineTo(ex - nx * .1 * s, ey - ny * .1 * s); g.closePath(); g.fill();
  }
  const ta = ang + side * (1.5 * spread + .7), tx = x + Math.cos(ta) * .7 * s, ty = y + Math.sin(ta) * .7 * s;      // the thumb
  g.strokeStyle = LINE; g.lineWidth = .3 * s; g.beginPath(); g.moveTo(x, y); g.lineTo(tx, ty); g.stroke(); g.strokeStyle = SKIN; g.lineWidth = .22 * s; g.stroke();
  g.fillStyle = CLAW; g.beginPath(); g.moveTo(tx, ty - .08 * s); g.lineTo(tx + Math.cos(ta + .3) * .36 * s, ty + Math.sin(ta + .3) * .36 * s); g.lineTo(tx + .08 * s, ty + .06 * s); g.closePath(); g.fill();
  g.fillStyle = SKIN; g.strokeStyle = LINE; g.lineWidth = .07 * s; g.beginPath(); g.ellipse(x, y, .52 * s, .46 * s, ang, 0, TAU); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(120,60,40,.5)'; g.lineWidth = .04 * s; g.beginPath(); g.arc(x - Math.cos(ang) * .05 * s, y - Math.sin(ang) * .05 * s, .25 * s, ang - .9, ang + .9); g.stroke();
}
// his head, face on, the size R (half its width), centred at (cx, cy)
function headFront(cx, cy, R) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  // the ears, and the head
  for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(cx + sd * .99 * R, cy + .1 * R, .16 * R, .24 * R, 0, 0, TAU); g.fillStyle = SKIN2; g.fill(); g.lineWidth = .028 * R; g.strokeStyle = LINE; g.stroke(); }
  const shape = () => { g.beginPath(); g.ellipse(cx, cy, 1 * R, .95 * R, 0, 0, TAU); };
  const gr = g.createRadialGradient(cx + .15 * R, cy - .2 * R, .2 * R, cx, cy, 1.05 * R);
  gr.addColorStop(0, SKIN); gr.addColorStop(.75, SKIN); gr.addColorStop(1, SKIN2);
  shape(); g.fillStyle = gr; g.fill();
  g.save(); shape(); g.clip();
  g.fillStyle = UNDER;                              // the dark sides, over the ears
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(cx + sd * 1.05 * R, cy - .5 * R); g.lineTo(cx + sd * .72 * R, cy - .52 * R); g.lineTo(cx + sd * .8 * R, cy - .12 * R); g.quadraticCurveTo(cx + sd * .9 * R, cy + .08 * R, cx + sd * 1.05 * R, cy + .1 * R); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(214,120,110,.22)';             // blush
  for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(cx + sd * .62 * R, cy + .3 * R, .2 * R, .11 * R, 0, 0, TAU); g.fill(); }
  g.restore();
  shape(); g.lineWidth = .032 * R; g.strokeStyle = LINE; g.stroke();
  // the hair
  const rx = 1.03 * R, ry = .95 * R, at = (a, e = 0) => [cx + Math.cos(a) * (rx + e), cy - .02 * R + Math.sin(a) * (ry + e)];
  g.beginPath();
  SPK.forEach(([d, l], i) => {
    const a = d * Math.PI / 180, b1 = at(a - .095), tip = at(a + .05 + (i % 3 - 1) * .05, l * R), b2 = at(a + .095);
    if (i === 0) g.moveTo(b1[0], b1[1]); else g.lineTo(b1[0], b1[1]);
    g.lineTo(tip[0], tip[1]); g.lineTo(b2[0], b2[1]);
  });
  for (const [x, y] of FRINGE) g.lineTo(cx + x * R, cy + y * R);
  g.closePath(); g.fillStyle = HAIR; g.fill(); g.lineWidth = .03 * R; g.strokeStyle = LINE; g.stroke();
  g.strokeStyle = HAIR2; g.lineWidth = .028 * R; g.beginPath();
  SPK.forEach(([d, l], i) => { if (i % 2 || d < 200 || d > 340) return; const a = d * Math.PI / 180, p0 = at(a, -.3 * R), p1 = at(a + .03, l * R * .7); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); });
  g.stroke();
  g.strokeStyle = LINE;
  // the mark on his forehead
  g.lineWidth = .045 * R; g.beginPath(); g.moveTo(cx - .13 * R, cy - .45 * R); g.lineTo(cx, cy - .33 * R); g.lineTo(cx + .13 * R, cy - .45 * R); g.moveTo(cx, cy - .33 * R); g.lineTo(cx, cy - .25 * R); g.stroke();
  // the brows: thick, angry, down at the middle; and the frown
  g.lineWidth = .085 * R; g.beginPath(); g.moveTo(cx - .7 * R, cy - .34 * R); g.lineTo(cx - .14 * R, cy - .15 * R); g.moveTo(cx + .14 * R, cy - .15 * R); g.lineTo(cx + .7 * R, cy - .34 * R); g.stroke();
  g.lineWidth = .025 * R; g.beginPath(); g.moveTo(cx - .06 * R, cy - .23 * R); g.lineTo(cx - .03 * R, cy - .12 * R); g.moveTo(cx + .06 * R, cy - .23 * R); g.lineTo(cx + .03 * R, cy - .12 * R); g.stroke();
  // the eyes
  for (const sd of [-1, 1]) {
    const ex = cx + sd * .37 * R, ey = cy + .02 * R, erx = .215 * R, ery = .165 * R;
    g.fillStyle = WHITE; g.beginPath(); g.ellipse(ex, ey, erx, ery, sd * -.08, 0, TAU); g.fill(); g.lineWidth = .025 * R; g.stroke();
    g.fillStyle = IRIS; g.beginPath(); g.arc(ex - sd * .01 * R, ey + .01 * R, .085 * R, 0, TAU); g.fill();
    g.fillStyle = LINE; g.beginPath(); g.arc(ex - sd * .01 * R, ey + .01 * R, .038 * R, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - sd * .01 * R - .03 * R, ey - .025 * R, .016 * R, 0, TAU); g.fill();
    g.lineWidth = .05 * R; g.beginPath(); g.ellipse(ex, ey, erx, ery, sd * -.08, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    g.lineWidth = .028 * R; g.beginPath(); g.moveTo(ex - .2 * R, ey + .2 * R); g.quadraticCurveTo(ex, ey + .27 * R, ex + .2 * R, ey + .19 * R); g.stroke();      // the second pair, as lines under them
    g.lineWidth = .034 * R; g.beginPath(); g.moveTo(cx + sd * .63 * R, cy + .1 * R); g.quadraticCurveTo(cx + sd * .74 * R, cy + .15 * R, cx + sd * .8 * R, cy + .29 * R); g.stroke();      // the cheek marks
  }
  // the nose
  g.lineWidth = .025 * R; g.beginPath(); g.moveTo(cx - .03 * R, cy + .14 * R); g.quadraticCurveTo(cx + .05 * R, cy + .22 * R, cx - .04 * R, cy + .25 * R); g.stroke();
  // the grin
  const mouth = () => { g.beginPath(); g.moveTo(cx - .5 * R, cy + .31 * R); g.quadraticCurveTo(cx, cy + .27 * R, cx + .5 * R, cy + .31 * R); g.quadraticCurveTo(cx + .43 * R, cy + .9 * R, cx, cy + .9 * R); g.quadraticCurveTo(cx - .43 * R, cy + .9 * R, cx - .5 * R, cy + .31 * R); g.closePath(); };
  mouth(); g.fillStyle = MOUTH; g.fill();
  g.save(); mouth(); g.clip();
  g.fillStyle = TONGUE; g.beginPath(); g.ellipse(cx, cy + .86 * R, .3 * R, .2 * R, 0, 0, TAU); g.fill();
  g.strokeStyle = '#b8505e'; g.lineWidth = .02 * R; g.beginPath(); g.moveTo(cx, cy + .7 * R); g.lineTo(cx, cy + .8 * R); g.stroke();
  g.fillStyle = WHITE; g.strokeStyle = LINE; g.lineWidth = .022 * R;
  for (const x of [cx - .135 * R, cx + .005 * R]) { g.beginPath(); g.roundRect(x, cy + .25 * R, .13 * R, .2 * R, [0, 0, .035 * R, .035 * R]); g.fill(); g.stroke(); }
  g.restore();
  mouth(); g.lineWidth = .035 * R; g.strokeStyle = LINE; g.stroke();
}
// the whole of the picture: shoulders, the T-shirt, the arms, the head, the hands. reach: how far the near hand is out at you (0 to 1)
function bust(cx, cy, R, reach = 1) {
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  // the far arm, out to the left
  g.strokeStyle = LINE; g.lineWidth = .44 * R; g.beginPath(); g.moveTo(cx - .9 * R, cy + 1.3 * R); g.lineTo(cx - 1.75 * R, cy + 1.95 * R); g.stroke();
  g.strokeStyle = SKIN; g.lineWidth = .36 * R; g.stroke();
  // the T-shirt
  g.fillStyle = SHIRT; g.strokeStyle = LINE; g.lineWidth = .035 * R;
  g.beginPath(); g.moveTo(cx - .35 * R, cy + .82 * R); g.quadraticCurveTo(cx - 1.15 * R, cy + .9 * R, cx - 1.3 * R, cy + 1.45 * R); g.lineTo(cx - 1.2 * R, cy + 2.6 * R); g.lineTo(cx + 1.25 * R, cy + 2.6 * R); g.lineTo(cx + 1.3 * R, cy + 1.45 * R); g.quadraticCurveTo(cx + 1.15 * R, cy + .9 * R, cx + .35 * R, cy + .82 * R); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = SHIRT2; g.beginPath(); g.moveTo(cx - 1.3 * R, cy + 1.45 * R); g.quadraticCurveTo(cx - .9 * R, cy + 1.7 * R, cx - .7 * R, cy + 2.6 * R); g.lineTo(cx - 1.2 * R, cy + 2.6 * R); g.closePath(); g.fill();
  g.fillStyle = SKIN2; g.beginPath(); g.ellipse(cx, cy + .86 * R, .3 * R, .14 * R, 0, 0, TAU); g.fill();      // the neck, in the collar
  g.strokeStyle = '#6e0f16'; g.lineWidth = .06 * R; g.beginPath(); g.ellipse(cx, cy + .88 * R, .36 * R, .16 * R, 0, .1, Math.PI - .1); g.stroke();
  // the head
  headFront(cx, cy, R);
  // the far hand
  hand2d(cx - 1.85 * R, cy + 2.05 * R, .42 * R, Math.PI * .85, .3);
  // the near arm, coming at you, and its hand the biggest thing in the picture
  const hx = cx + lerp(1.15, 1.45, reach) * R, hy = cy + lerp(1.75, 1.45, reach) * R, s = lerp(.5, .78, reach) * R;
  g.strokeStyle = LINE; g.lineWidth = .5 * R; g.beginPath(); g.moveTo(cx + .95 * R, cy + 1.55 * R); g.lineTo(hx, hy + .2 * R); g.stroke();
  g.strokeStyle = SKIN; g.lineWidth = .42 * R; g.stroke();
  hand2d(hx, hy, s, -Math.PI * .36, .3, -1);
  g.restore();
}
// "DISMANTLE!", in his handwriting, beside his head
function dismantle(x, y, size, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.font = `italic 800 ${Math.round(size)}px 'Shantell Sans','Comic Neue',sans-serif`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = size * .22; g.strokeStyle = '#ffffff'; g.strokeText('DISMANTLE!', 0, 0);
  g.fillStyle = '#111014'; g.fillText('DISMANTLE!', 0, 0);
  g.restore();
}
function drawCut(c) {
  const VW = E.VW, VH = E.VH, t = c.t, life = c.life, still = !!JU.reduceMotion;
  const inU = ease(clamp(t / .14, 0, 1)), outU = clamp((t - (life - .2)) / .2, 0, 1), dx = (1 - inU) * VW * .9 - ease(outU) * VW * .9;
  g.save();
  g.fillStyle = `rgba(6,4,10,${.55 * (1 - outU)})`; g.fillRect(0, 0, VW, VH);
  // the panel: white, a black frame, at a slant
  const y0 = VH * .1, y1 = VH * .9, sl = VH * .06;
  g.translate(dx, 0);
  g.beginPath(); g.moveTo(-20, y0 + sl); g.lineTo(VW + 20, y0 - sl); g.lineTo(VW + 20, y1 - sl); g.lineTo(-20, y1 + sl); g.closePath();
  g.fillStyle = '#fbf8f3'; g.fill();
  g.save(); g.clip();
  const R = Math.min(VH * .2, VW * .16), cx = VW * .44, cy = VH * .44, jx = still ? 0 : rnd(-1, 1) * R * .02, jy = still ? 0 : rnd(-1, 1) * R * .02;
  g.strokeStyle = 'rgba(17,16,20,.55)'; g.lineWidth = 1.5;      // focus lines, in on him
  g.beginPath();
  for (let i = 0; i < 70; i++) { const a = i / 70 * TAU + (still ? 0 : Math.sin(t * 9 + i) * .01), r0 = R * (2.1 + (i * 37 % 11) / 10), r1 = VW; g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); }
  g.stroke();
  const pulse = still ? 1 : 1 + .025 * Math.sin(t * 46);
  g.save(); g.translate(cx + jx, cy + jy); g.scale(pulse, pulse); g.translate(-(cx + jx), -(cy + jy));
  bust(cx + jx, cy + jy, R, clamp(t / .5, 0, 1));
  g.restore();
  dismantle(cx + R * 1.3, cy - R * .5, R * .34, -.32);
  g.restore();
  g.lineWidth = 6; g.strokeStyle = '#111014';
  g.beginPath(); g.moveTo(-20, y0 + sl); g.lineTo(VW + 20, y0 - sl); g.moveTo(VW + 20, y1 - sl); g.lineTo(-20, y1 + sl); g.stroke();
  g.restore();
  if (t < .08) { g.fillStyle = `rgba(255,255,255,${1 - t / .08})`; g.fillRect(0, 0, VW, VH); }
}
// his face, for his card on the CT screen
function cardFace() {
  try {
    const cv = document.createElement('canvas'); cv.width = cv.height = 160;
    drawOn(cv.getContext('2d'), () => headFront(80, 96, 50));
    return cv.toDataURL('image/png');
  } catch (e) { return ''; }
}
// the drawing above, onto another canvas: everything here draws on `g`, so for the moment that is the other one
function drawOn(ctx, fn) { const g0 = g; g = ctx; try { fn(); } finally { g = g0; } }

/* ================= the technique ================= */
JU.tech.add('thukuna', { name: 'THUKUNA ;3', jp: 'チュクナ', mark: ';3', who: 'The King of Curses, screaming', odds: 0, col: '#ff6f91', glow: 'red', moves: MOVES,
  admin: true, skin: SUK, as: ['King of Curses', '呪いの王'], m1, icon: cardFace(),      // (icon: his face on his card, tech.js)
  hint: '<b>1</b>–<b>4</b> World Cutting Slash · <b>M1</b> a one-shot, any · <b>E</b> THUKUNA' });
const DEF = T.TECH.thukuna;
JU.especial.add('thukuna', ESP);

/* ---------- wiring ---------- */
const tick0 = H.tick, fx0 = H.fx, post0 = H.post, reset0 = H.reset, start0 = H.fightStart;
H.tick = dt => {
  tick0(dt);
  if (!on()) { if (form) { const p = E.P1; if (p.skin === THUKUNA) p.skin = form.skin0 || SUK; form = null; } cut = null; return; }
  if (ecd > 0) ecd = Math.max(0, ecd - dt);
  if (!primed) prime();
  const p = E.P1;
  if (form && p.skin === SUK && !p.dead) p.skin = THUKUNA;      // (put back in the King of Curses' body for a moment, by whatever: THUKUNA again)
};
H.fx = dt => {
  fx0(dt);
  if (!on()) return;
  const p = E.P1;
  if (p.dead || p.alpha < .1) return;
  if (p.skin === THUKUNA) claws(p);
  if (p.move && p.move.def.sword && p.move.t < .9) lightSword(p);
};
H.post = dt => {
  if (post0) post0(dt);
  if (!cut) return;
  cut.t += dt || 0;
  if (cut.t >= cut.life) { cut = null; return; }
  drawCut(cut);
};
const clear = () => { if (form) { const p = E.P1; if (p.skin === THUKUNA) p.skin = form.skin0 || SUK; form = null; } cut = null; ecd = 0; lastOne = null; };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) clear(); if (on()) prime(); };

JU.thukuna = { MOVES, ONE, ESP, SKIN: THUKUNA, BECOME, UNBECOME, bust, headFront, get form() { return !!form; }, get cut() { return cut && { t: +cut.t.toFixed(2) }; } };
})();
