/* JUJUTSU UNLIMITEDS — Build 0.16: E SPECIALS. Every cursed technique has something on E now (on a touch screen, the E on the hotbar, which
   says what it is and how long it has to wait). Ratio Man's E is still the Ratio. Three are in their own files and only shown here: Cursed
   Judge's (the gavel thrown, judge.js), Miracle Dork's (the sword dropped, and steered with Z and X, haruta.js) and Love Reaper's (Rika's
   Pure Love, reaper.js). The rest are below:
     The Vessel (no technique)      CANCEL: a move he has just started, before it has hurt anybody, called off, and its wait with it. A quiet
                                    circle round him says so, the way it is in Jujutsu Shenanigans
     Ten Shadows                    SHADOW SWIM: down into his shadow, up out of theirs behind them, and the Divine Dogs out of it first. 22
     Transfiguration                SOUL TOUCH: a hand on them, and their soul pulled half out of them and stitched back. 26, and a long stun
     Disaster Plants                WOOD BALL: roots up out of the floor and closed round them, squeezing, and then it bursts into flowers. 36
     Limitless                      BLINK: gone, and behind them, and Lapse: Blue in their middle pulling them in. 16
     Projection Sorcery             24 FPS: six passes through them at twenty-four frames a second, the film running behind them. 35
     Shrine                         SHRINE FLICKER: the shrine, there behind him for a moment, and a storm of cuts. 30
     Awakened Projection            TIME CELL: a frame shut round them, seven laps of it, and the glass breaking. 36
     Awakened Limitless             UNLIMITED INFINITY: a pulse that throws them off, and for a moment nothing touches him: whatever tries is
                                    thrown back hard (20)
     Awakened Ten Shadows           NUE: THUNDER: Nue overhead, and three bolts of lightning. 34
     Switcher Stitcher              FEINT CLAP: the clap, and no swap; they flinch for one, and he is on them. 22
     Mark of the King               KING'S CROSS: the other eye opens, and two cuts the size of the arena, crossed. 30
     Cursed Cannon                  VENT: every bar of heat let out at once, and whatever is close is thrown off by it (more for more heat)
     True Cursed Energy Discharge   GRANITE ZERO: right up to them, and a blast from nothing away. 40
     Vengeful Artist, Mr. Instincto SPLATTER ART: the spear flicked, and five gobs of it thrown at them; the last leaves them bleeding. 30
   and the four the story hands out:
     Heavenly Restriction (Maki)    DRAGON-BONE: the blade up across her. A blow that lands on it in time is taken into it (none of it reaches
                                    her) and let out of the hilt as a jet behind one cut, worth more for more taken (18 and half as much again,
                                    up to 50). If nothing comes, she cuts anyway (12)
     Queen of Curses (Yuta)         CURSED SPEECH: Inumaki's, copied: "Don't move", and they don't, and he walks up and cuts them twice. 26
     Idle Death Gamble (Hakari)     PACHINKO: three reels over his head. Three alike, a jackpot: 27 in balls and a third of his bar; two alike,
                                    16; none, 6
     Star Rage (Yuki)               BLACK HOLE: one, in the middle of them, drawing them in and crushing (16), and then giving out (16) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, LINE = E.LINE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, Z = JU.bossfx, T = JU.tech;
const { rnd, clamp, lerp, ease } = E, TAU = Math.PI * 2, { shout } = T.tk;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const lit = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const exact = (o, n) => n / (o.dr || 1);            // a hit worth the stated amount, whatever the target is made of
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const up = o => !o.ko && !(o.alpha < 1);            // there to be hit (on the floor too: these do not go through tryHit)
const hs = o => o.scale || 1;
const mid = o => o.y + 165 * hs(o);
const label = (x, y, text, col, life = 1.2) => E.fx.push({ k: 2, x, y, n: text, col, t: 0, life });
// a blow of the special's own, on them wherever they are, pushed away from him
function hit(p, o, dmg, more) { E.applyHit(o, o.x >= p.x ? 1 : -1, Object.assign({ dmg: exact(o, dmg), kb: 160, stun: .7, stop: .06, col: '#ffffff', fixed: 1, mute: 1 }, more)); }
const hold = (o, t) => { if (!duel() && up(o)) Object.assign(o, { vx: 0, state: o.state === 'air' ? 'air' : 'hurt', stun: Math.max(o.stun || 0, t), act: null, tele: 0 }); };      // (a duel's other player is held by his own game)

/* ================= what each technique's E is ================= */
const SP = {};
const add = (id, d) => { SP[id] = d; };
let cd = 0, max = 1, shownV = -1, shownName = '';
const slot = E.hud.mv.esp;                          // the hotbar's E (index.html)
function which() {
  const a = T.active;
  if (a) return a.id;
  return E.P1.skin === E.YUJI ? 'yuji' : '';        // no technique: the Vessel, as he is
}

/* ---------- The Vessel: CANCEL ---------- */
const CANCEL = new Set(['strikes', 'crush', 'div', 'manji']);
function circle(p) {                                // the circle round him that says so: quiet, there and gone
  V.custom(.42, u => {
    const c = F(p.x, p.y + 150 * hs(p)), k = c[2], r = (150 + 36 * ease(u)) * k, a = (1 - u) * .75, f = F(p.x, p.y);
    lit(() => {
      g.strokeStyle = `rgba(150,200,255,${a * .45})`; g.lineWidth = 10 * k; g.beginPath(); g.arc(c[0], c[1], r * .97, 0, TAU); g.stroke();
      g.strokeStyle = `rgba(232,246,255,${a})`; g.lineWidth = 2.5 * k; g.beginPath(); g.arc(c[0], c[1], r, 0, TAU); g.stroke();
      g.strokeStyle = `rgba(232,246,255,${a * .55})`; g.lineWidth = 2 * k; g.beginPath(); g.ellipse(f[0], f[1] + 3 * k, r * 1.05, r * .27, 0, 0, TAU); g.stroke();
    });
  });
}
add('yuji', { name: 'Cancel', jp: '解', col: '#dff3ff', press(p) {
  const m = p.move;
  if (cd > 0 || !m || !CANCEL.has(m.key) || m.def.noCancel || m.landed || p.ps || p.dead) return true;      // nothing of his to call off (or it has already hurt somebody, or E is part of it: Rupture, tools.js)
  const k = m.key;
  E.endMove(p); E.cd[k] = 0;                        // and its wait goes with it
  p.vx = 0; p.vy = Math.min(p.vy, 0); p.spin = 1; p.target = POSE.idle;
  cd = max = .8;
  circle(p); sfx.evade();
  return true;
} });

/* ---------- Ten Shadows: SHADOW SWIM ---------- */
function puddle(x, life, big) {                     // a shadow on the floor, open, and shut again
  V.custom(life, u => {
    const c = F(x, 0), k = c[2], r = (big ? 175 : 135) * k * Math.sin(Math.min(1, u * 3) * Math.PI / 2) * (u > .75 ? (1 - u) / .25 : 1);
    g.fillStyle = 'rgba(6,4,14,.92)'; g.beginPath(); g.ellipse(c[0], c[1] + 3 * k, r, r * .26, 0, 0, TAU); g.fill();
    lit(() => { g.strokeStyle = 'rgba(143,155,255,.6)'; g.lineWidth = 3 * k; g.stroke(); });
  }, 0, true);
}
function dogHead(white, open) {                     // a Divine Dog's head, nose up, in its own small units
  const fur = white ? '#f2f4f8' : '#17151f', shade = white ? '#c9cede' : '#0b0a10';
  g.lineWidth = 3; g.strokeStyle = LINE; g.lineJoin = 'round';
  g.fillStyle = fur; g.beginPath(); g.moveTo(-26, 0); g.lineTo(-30, -18); g.lineTo(-20, -12); g.lineTo(-14, -34); g.lineTo(-4, -16); g.closePath(); g.fill(); g.stroke();      // ears
  g.beginPath(); g.roundRect(-34, -14, 56, 46, 8); g.fill(); g.stroke();
  g.save(); g.translate(18, 8); g.rotate(-.35 * open);
  g.fillStyle = fur; g.beginPath(); g.roundRect(0, -16, 44, 18, 5); g.fill(); g.stroke();      // the top of the muzzle
  g.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(8 + i * 9, 2); g.lineTo(12 + i * 9, 10); g.lineTo(16 + i * 9, 2); g.closePath(); g.fill(); }
  g.restore();
  g.save(); g.translate(18, 14); g.rotate(.45 * open);
  g.fillStyle = shade; g.beginPath(); g.roundRect(0, -2, 38, 14, 5); g.fill(); g.stroke();      // and the jaw
  g.fillStyle = '#ffffff'; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(8 + i * 10, -2); g.lineTo(12 + i * 10, -9); g.lineTo(16 + i * 10, -2); g.closePath(); g.fill(); }
  g.restore();
  g.fillStyle = '#c2182b'; g.beginPath(); g.arc(4, 0, 4, 0, TAU); g.fill();
}
function dogs(o) {                            // white and black, up out of the shadow under them, jaws open
  const x0 = o.x;
  V.custom(.65, u => {
    const rise = ease(Math.min(1, u * 4)), sink = u > .7 ? (u - .7) / .3 : 0, open = Math.sin(Math.min(1, u * 2.6) * Math.PI);
    for (const [dx, f, white] of [[-70, 1, true], [70, -1, false]]) {
      const c = F(x0 + dx, lerp(-80, 150, rise) - sink * 260), k = c[2] * 1.6;
      g.save(); g.translate(c[0], c[1]); g.scale(f * k, k); g.rotate(-.75); g.globalAlpha = 1 - sink;
      dogHead(white, open);
      g.restore();
    }
  });
}
let swam = false;                                  // (Shadow Swim has made him see-through: it is the one to put him back)
add('ten', { name: 'Shadow Swim', jp: '影泳ぎ', col: '#8f9bff', cd: 14, dur: 1.3, run(p, m, t) {
  const o = E.P2;
  p.vx = 0;
  if (!m.s) { m.s = 1; m.x0 = p.x; p.inv = Math.max(p.inv || 0, 1); swam = true; sfx.wave(); puddle(p.x, .8, false); }
  if (t < .32) { p.target = POSE.crushWind; p.alpha = Math.max(.02, 1 - t / .32); return; }      // down into his own shadow
  if (!m.go) {                                      // and up out of theirs, behind them; the dogs first
    m.go = 1; m.at = t; m.side = o.x >= m.x0 ? 1 : -1;
    p.x = clamp(o.x + m.side * 150, -960, 960); p.face = -m.side;
    puddle(o.x, .9, true); dogs(o); sfx.splat();
  }
  const s = t - m.at;
  if (s > .1 && !m.h1 && up(o)) { m.h1 = 1; hit(p, o, 10, { kb: 100, lift: 560, stun: .8, col: '#dfe3ff' }); sfx.hit(false); shake(14); }
  if (s > .3 && !m.h2 && up(o)) { m.h2 = 1; hit(p, o, 12, { kb: 280, lift: 680, stun: .9, stop: .1, heavy: 1, col: '#dfe3ff' }); sfx.hit(true); shake(20); V.sparks(o.x, mid(o), 'purple', 12); }
  p.alpha = clamp((s - .25) / .3, .02, 1); p.target = s < .5 ? POSE.crushWind : POSE.idle;
  if (s > .75) { p.alpha = 1; E.endMove(p); }
} });

/* ---------- Transfiguration: SOUL TOUCH ---------- */
const SOUL = E.flat('#2f8f78', '#9ff3dc');
function grab(p, o) {
  sfx.charge(); E.stop(.12); shake(10);
  if (Z) Z.dim(.55, .7);
  hold(o, 1.1);
  V.custom(.8, u => {                               // its soul, half out of it toward his hand, and back: the shape it really is
    const pull = Math.sin(Math.min(1, u / .7) * Math.PI), f = p.x >= o.x ? 1 : -1, gh = E.over(o, SOUL);
    gh.x = o.x + f * 120 * pull; gh.y = o.y + 18 * pull;
    E.drawFighter(gh, .62 * (1 - u * .4));
    const c = F(o.x + f * 60 * pull, mid(o)), k = c[2];
    g.save(); g.strokeStyle = 'rgba(14,40,34,.85)'; g.lineWidth = 3 * k; g.lineCap = 'round';      // the stitches where it is torn
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(c[0] - 16 * k, c[1] + (i * 24 - 8) * k); g.lineTo(c[0] + 16 * k, c[1] + (i * 24 + 8) * k); g.stroke(); }
    g.restore();
    lit(() => E.glow(E.GLOW.teal, c[0], c[1], 260 * k * pull, .5));
  });
}
add('trans', { name: 'Soul Touch', jp: '魂に触れる', col: '#78e6c8', cd: 14, dur: 1.35, run(p, m, t) {
  const o = E.P2, f = p.face;
  if (m.got === undefined) {
    if (t < .1) { p.target = POSE.divWind; p.vx = 0; return; }
    p.target = POSE.jab; p.vx = t < .3 ? f * 1500 : 0;
    const gap = (o.x - p.x) * f;
    if (gap > -30 && gap < 190 && up(o) && o.state !== 'down' && o.state !== 'up') { m.got = t; p.vx = 0; grab(p, o); }
    else if (t > .45) E.endMove(p);
    return;
  }
  const s = t - m.got;
  p.vx = 0; p.target = s < .55 ? POSE.jab : POSE.idle;
  if (s > .58 && !m.back) {
    m.back = 1;
    hit(p, o, 26, { kb: 420, stun: 1.4, stop: .2, heavy: 1, col: '#78e6c8' });
    sfx.splat(); sfx.charge(); shake(22); V.ring(o.x, mid(o), 300, '#78e6c8', .35); V.sparks(o.x, mid(o), 'blue', 12);
    if (Z) Z.flash('120,230,200', .22, .25);
    label(o.x, o.y + 430 * hs(o), 'SOUL TOUCHED', '#9ff3dc');
  }
  if (s > .9) E.endMove(p);
} });

/* ---------- Disaster Plants: WOOD BALL ---------- */
function quad(x0, y0, cx, cy, x1, y1, u) {         // a curve drawn as far as u along it
  g.beginPath(); g.moveTo(x0, y0);
  for (let i = 1; i <= 16; i++) { const s = u * i / 16, a = (1 - s) * (1 - s), b = 2 * (1 - s) * s, c = s * s; g.lineTo(a * x0 + b * cx + c * x1, a * y0 + b * cy + c * y1); }
}
function ball(o) {                                  // roots up out of the floor and over them, shut like a fist
  V.custom(1.15, u => {
    const grow = ease(Math.min(1, u * 2.4)), fade = u > .9 ? (1 - u) / .1 : 1, s = hs(o);
    g.save(); g.globalAlpha = fade; g.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const d = (i - 3), a = F(o.x + d * 55 * s, 0), c = F(o.x + d * 170 * s, o.y + 230 * s), b = F(o.x + d * 14 * s, o.y + 350 * s), k = a[2];
      for (const [w, col] of [[30, LINE], [24, '#6b4a2a'], [9, '#8f6a3e']]) { quad(a[0], a[1], c[0], c[1], b[0], b[1], grow); g.strokeStyle = col; g.lineWidth = w * k; g.stroke(); }
      if (grow > .5) for (let j = 1; j < 4; j++) {      // leaves along it
        const q = j / 4 * grow, x = (1 - q) * (1 - q) * a[0] + 2 * (1 - q) * q * c[0] + q * q * b[0], y = (1 - q) * (1 - q) * a[1] + 2 * (1 - q) * q * c[1] + q * q * b[1];
        g.fillStyle = j & 1 ? '#7ddc6a' : '#4fae46'; g.beginPath(); g.ellipse(x + d * 6 * k, y, 9 * k, 5 * k, d * .4, 0, TAU); g.fill();
      }
    }
    if (grow >= 1) { const c = F(o.x, mid(o)), k = c[2]; lit(() => E.glow(E.GLOW.green, c[0], c[1], 380 * k * s, .25 + .1 * Math.sin(E.T * 20))); }
    g.restore();
  });
}
function bloom(o) {                                 // and burst, into flowers
  const x = o.x, y = mid(o);
  if (Z) for (let i = 0; i < 44; i++) Z.emit(3, x + rnd(-80, 80), y + rnd(-90, 90), rnd(-700, 700), rnd(-100, 900), rnd(6, 12), rnd(.7, 1.3), i % 3 ? '255,154,213' : i & 1 ? '125,220,106' : '255,236,140', { g: 900, vr: rnd(-12, 12), rot: rnd(0, TAU) });
  V.ring(x, y, 360, '#ff9ad5', .35); V.ring(x, y, 220, '#7ddc6a', .3); E.addBlast(x, y, '255,154,213', 320);
}
add('plants', { name: 'Wood Ball', jp: '木の球', col: '#7ddc6a', cd: 16, dur: 1.7, run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.target = t < 1.25 ? POSE.crushWind : POSE.idle;
  if (!m.s) { m.s = 1; m.ok = up(o) && Math.abs(o.x - p.x) < 1000; sfx.rise(.4); if (m.ok) { ball(o); sfx.wave(); } }
  if (!m.ok) { if (t > .5) E.endMove(p); return; }
  if (t > .3 && t < 1.12) hold(o, .3);              // held in it
  for (let i = 0; i < 4; i++) if (t > .45 + i * .15 && !m['q' + i] && up(o)) { m['q' + i] = 1; hit(p, o, 6, { kb: 0, stun: .5, stop: .03, col: '#7ddc6a' }); sfx.snap(); shake(8); }
  if (t > 1.12 && !m.burst && up(o)) { m.burst = 1; hit(p, o, 12, { kb: 300, lift: 760, stun: .9, stop: .12, heavy: 1, col: '#ff9ad5' }); sfx.blast(); shake(26); bloom(o); }
} });

/* ---------- Limitless: BLINK ---------- */
function blue(o) {                                  // Lapse: Blue, in the middle of them: everything round it drawn in
  V.custom(.42, u => {
    const c = F(o.x, mid(o)), k = c[2], r = (70 + 30 * Math.sin(u * 30)) * k * (1 - u * .4);
    lit(() => {
      E.glow(E.GLOW.blue, c[0], c[1], r * 6, .8 * (1 - u * .5));
      for (let i = 0; i < 3; i++) { const rr = (300 - 280 * ((u * 2 + i / 3) % 1)) * k; g.strokeStyle = `rgba(56,200,255,${.6 * (1 - u)})`; g.lineWidth = 3 * k; g.beginPath(); g.arc(c[0], c[1], rr, 0, TAU); g.stroke(); }
    });
    g.fillStyle = '#04121c'; g.beginPath(); g.arc(c[0], c[1], r * .55, 0, TAU); g.fill();
    g.strokeStyle = '#bfe9ff'; g.lineWidth = 3 * k; g.stroke();
    if (Z && Math.random() < .8) { const a = rnd(0, TAU), d = rnd(180, 320); Z.emit(1, o.x + Math.cos(a) * d, mid(o) + Math.sin(a) * d, -Math.cos(a) * d * 4, -Math.sin(a) * d * 4, 4, .2, '120,210,255'); }
  });
}
add('limitless', { name: 'Blink', jp: '瞬間移動', col: '#38c8ff', cd: 10, dur: .95, run(p, m, t) {
  const o = E.P2;
  p.vx = 0;
  if (!m.s) {
    m.s = 1;
    const side = o.x >= p.x ? 1 : -1;
    if (Z) Z.ghost(p, .6, .3);
    V.ring(p.x, p.y + 160, 200, '#38c8ff', .3); sfx.blue();
    p.x = clamp(o.x + side * 150, -960, 960); p.face = -side;       // and there, behind them
    V.ring(p.x, p.y + 160, 200, '#bfe9ff', .3); shake(8);
    if (Z) Z.flare(p.x, p.y + 200, '56,200,255', 300, .15);
  }
  p.target = t < .55 ? POSE.divWind : POSE.idle;      // a hand out at them
  if (t > .1 && !m.b && up(o)) { m.b = 1; blue(o); }
  if (t > .5 && !m.h && up(o)) { m.h = 1; E.applyHit(o, p.x >= o.x ? 1 : -1, { dmg: exact(o, 16), kb: 520, lift: 260, stun: .9, stop: .12, heavy: 1, col: '#38c8ff', fixed: 1, mute: 1 }); sfx.blast(); shake(18); V.ring(o.x, mid(o), 260, '#38c8ff', .3); }      // pulled in, at him
} });

/* ---------- Projection Sorcery: 24 FPS ---------- */
function film(o, life) {                            // the strip running behind them, a frame for every pass
  V.custom(life, u => {
    const c = F(o.x, mid(o)), k = c[2], w = 980 * k, h = 300 * k, a = Math.min(1, u * 6, (1 - u) * 4), off = (E.T * 900 * k) % (120 * k);
    g.save(); g.globalAlpha = .55 * a;
    g.fillStyle = 'rgba(40,30,8,.55)'; g.fillRect(c[0] - w / 2, c[1] - h / 2, w, h);
    g.strokeStyle = 'rgba(255,210,61,.9)'; g.lineWidth = 3 * k; g.strokeRect(c[0] - w / 2, c[1] - h / 2, w, h);
    g.beginPath(); for (let x = c[0] - w / 2 + off; x < c[0] + w / 2; x += 120 * k) { g.moveTo(x, c[1] - h / 2 + 22 * k); g.lineTo(x, c[1] + h / 2 - 22 * k); } g.stroke();
    g.fillStyle = 'rgba(20,14,4,.9)'; for (let x = c[0] - w / 2 + off / 2; x < c[0] + w / 2; x += 40 * k) for (const y of [c[1] - h / 2 + 6 * k, c[1] + h / 2 - 16 * k]) g.fillRect(x, y, 16 * k, 10 * k);
    g.restore();
  }, 0, true);
}
add('projection', { name: '24 FPS', jp: '二十四コマ', col: '#ffd23d', cd: 14, dur: 1.15, run(p, m, t) {
  const o = E.P2, N = 6, D = .12;
  if (!m.s) { m.s = 1; m.k = 0; m.miss = !(up(o) && Math.abs(o.x - p.x) < 1100); if (!m.miss) { film(o, N * D + .25); sfx.zap(); } }
  if (m.miss) { p.vx = 0; if (t > .3) E.endMove(p); return; }
  p.vx = 0;
  const n = Math.floor(t / D);
  if (n < N && n >= m.k) {
    m.k = n + 1;
    const side = n & 1 ? -1 : 1, from = p.x, last = n === N - 1;
    if (Z) Z.ghost(p, .5, .2);
    p.x = clamp(o.x + side * 140, -960, 960); p.face = -side; p.target = n & 1 ? POSE.cross : POSE.jab;
    const y = p.y + 170;
    V.custom(.14, u => { const a = F(from, y), b = F(p.x, y); lit(() => { g.strokeStyle = `rgba(255,220,120,${1 - u})`; g.lineWidth = 6 * a[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }); });
    if (up(o)) { hit(p, o, last ? 10 : 5, last ? { kb: 900, lift: 420, stun: .9, stop: .12, heavy: 1, col: '#ffd23d' } : { kb: 20, stun: .5, stop: .02, col: '#ffd23d' }); sfx.hit(last); if (last) shake(18); }
  }
  if (n >= N) p.target = POSE.idle;
} });

/* ---------- Shrine: SHRINE FLICKER ---------- */
function shrine(p) {                                // the shrine, for a moment, behind him: a roof, pillars, and its mouths
  const x0 = p.x - p.face * 230;
  V.custom(1.35, u => {
    const fl = u > .82 ? (Math.random() < .5 ? 0 : (1 - u) / .18) : Math.min(1, u * 5) * (Math.random() < .08 ? .4 : 1);
    if (fl <= 0) return;
    const b = F(x0, 0), k = b[2], W = 520 * k, Hh = 640 * k;
    g.save(); g.globalAlpha = fl * .92;
    g.fillStyle = '#0d0306';
    g.beginPath(); g.moveTo(b[0] - W * .62, b[1] - Hh * .72); g.quadraticCurveTo(b[0], b[1] - Hh * 1.02, b[0] + W * .62, b[1] - Hh * .72); g.lineTo(b[0] + W * .44, b[1] - Hh * .8); g.lineTo(b[0] - W * .44, b[1] - Hh * .8); g.closePath(); g.fill();      // the roof
    for (const s of [-1, -.35, .35, 1]) g.fillRect(b[0] + s * W * .4 - 14 * k, b[1] - Hh * .74, 28 * k, Hh * .74);      // pillars
    g.fillRect(b[0] - W * .5, b[1] - Hh * .36, W, 26 * k);
    lit(() => {
      g.strokeStyle = 'rgba(255,36,64,.7)'; g.lineWidth = 3 * k;
      g.beginPath(); g.moveTo(b[0] - W * .62, b[1] - Hh * .72); g.quadraticCurveTo(b[0], b[1] - Hh * 1.02, b[0] + W * .62, b[1] - Hh * .72); g.stroke();
      for (let i = 0; i < 3; i++) {                 // mouths, along the beam
        const mx = b[0] + (i - 1) * W * .3, my = b[1] - Hh * .5;
        g.strokeStyle = 'rgba(255,36,64,.85)'; g.beginPath(); g.ellipse(mx, my, 34 * k, 14 * k, 0, 0, TAU); g.stroke();
        for (let j = 0; j < 5; j++) { g.beginPath(); g.moveTo(mx - 26 * k + j * 13 * k, my - 6 * k); g.lineTo(mx - 20 * k + j * 13 * k, my + 4 * k); g.stroke(); }
      }
      E.glow(E.GLOW.red, b[0], b[1] - Hh * .5, W * 1.6, .25 * fl);
    });
    g.restore();
  }, 0, true);
}
add('shrine', { name: 'Shrine Flicker', jp: '伏魔御廚子', col: '#ff2440', cd: 18, dur: 1.5, run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.target = t < 1.2 ? POSE.manjiWind : POSE.idle;      // the hands together: the sign of it
  if (!m.s) { m.s = 1; shrine(p); sfx.roar(.8); sfx.charge(); if (Z) { Z.dim(.7, 1.3); Z.flash('255,36,64', .28, .3); } }
  if (t > .3 && t < 1.15 && up(o)) {
    const n = Math.floor((t - .3) / .07);
    if (n !== m.n && n < 12) {
      m.n = n;
      V.slash(o.x + rnd(-40, 40), mid(o) + rnd(-90, 90), rnd(0, TAU), rnd(260, 440), n % 3 ? '#ff2440' : '#ffffff', rnd(5, 9));
      sfx.cut(.6 + Math.random() * .5);
      hit(p, o, 2.5, { kb: 20, stun: .45, stop: .015, col: '#ff2440' });
    }
  }
  if (t > 1.15 && !m.e) { m.e = 1; shake(24); if (up(o)) { V.crack(o.x, 300); label(o.x, o.y + 430 * hs(o), '解', '#ff2440', 1); } }
} });

/* ---------- Awakened Projection: TIME CELL ---------- */
function cell(o, life) {                            // a frame shut round them: glass, a film border, and cracks that spread till it goes
  V.custom(life, u => {
    const c = F(o.x, mid(o) + 20), k = c[2] * hs(o), w = 280 * k, h = 400 * k, a = Math.min(1, u * 8);
    g.save(); g.globalAlpha = a;
    g.fillStyle = 'rgba(255,220,245,.12)'; g.fillRect(c[0] - w / 2, c[1] - h / 2, w, h);
    g.strokeStyle = '#d24fb4'; g.lineWidth = 6 * k; g.strokeRect(c[0] - w / 2, c[1] - h / 2, w, h);
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2 * k; g.strokeRect(c[0] - w / 2 + 10 * k, c[1] - h / 2 + 10 * k, w - 20 * k, h - 20 * k);
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.6 * k; g.beginPath();      // the cracks
    const n = Math.floor(u * 9);
    for (let i = 0; i < n; i++) { const a0 = i * 2.39, r0 = 20 * k, r1 = (60 + (i * 37 % 70)) * k * Math.min(1, u * 1.6); g.moveTo(c[0] + Math.cos(a0) * r0, c[1] + Math.sin(a0) * r0); g.lineTo(c[0] + Math.cos(a0 + .3) * r1, c[1] + Math.sin(a0 + .3) * r1); }
    g.stroke();
    g.restore();
  });
}
add('aproj', { name: 'Time Cell', jp: '時間の檻', col: '#d24fb4', cd: 16, dur: 1.4, run(p, m, t) {
  const o = E.P2;
  p.vx = 0;
  if (!m.s) { m.s = 1; m.ok = up(o) && Math.abs(o.x - p.x) < 1100; if (m.ok) { cell(o, 1.05); sfx.charge(); hold(o, 1.2); } }
  if (!m.ok) { if (t > .3) E.endMove(p); return; }
  const n = Math.floor((t - .15) / .11);
  if (t > .15 && n < 7 && n !== m.n) {
    m.n = n;
    const an = n / 7 * TAU;
    if (Z) Z.ghost(p, .45, .2);
    p.x = clamp(o.x + Math.cos(an) * 175, -960, 960); p.face = o.x >= p.x ? 1 : -1; p.target = n & 1 ? POSE.manji : POSE.jab;
    if (up(o)) { hit(p, o, 4, { kb: 0, stun: .6, stop: .02, col: '#d24fb4' }); sfx.zap(); }
    hold(o, .5);
  }
  if (t > 1 && !m.e) {                              // and the glass goes
    m.e = 1; p.target = POSE.manji;
    if (up(o)) hit(p, o, 8, { kb: 600, lift: 700, stun: .9, stop: .14, heavy: 1, col: '#ffffff' });
    sfx.blast(); shake(26);
    if (Z) for (let i = 0; i < 30; i++) Z.emit(3, o.x + rnd(-130, 130), mid(o) + rnd(-190, 190), rnd(-800, 800), rnd(-200, 900), rnd(6, 14), rnd(.6, 1.1), i & 1 ? '255,220,245' : '210,79,180', { g: 1500, vr: rnd(-14, 14), rot: rnd(0, TAU) });
    V.ring(o.x, mid(o), 340, '#d24fb4', .3);
  }
  if (t > 1.2) p.target = POSE.idle;
} });

/* ---------- Awakened Limitless: UNLIMITED INFINITY ---------- */
let inf = null;                                     // the moment nothing touches him: { t (left), cool (before the next throw-back) }
function hexes(p) {                                 // Infinity, seen: a sphere of it round him, the cells of it lit where it is pressed
  const c = F(p.x, p.y + 160 * hs(p)), k = c[2], R = 210 * k, a = Math.min(1, inf.t * 3);
  lit(() => {
    E.glow(E.GLOW.blue, c[0], c[1], R * 2.6, .4 * a);
    g.strokeStyle = `rgba(150,220,255,${.8 * a})`; g.lineWidth = 3 * k;
    g.beginPath(); g.arc(c[0], c[1], R, 0, TAU); g.stroke();
    g.strokeStyle = `rgba(150,220,255,${.36 * a})`; g.lineWidth = 1.8 * k; g.beginPath();
    for (let i = 0; i < 6; i++) { const an = i / 6 * TAU + E.T * .6; g.moveTo(c[0] + Math.cos(an) * R * .35, c[1] + Math.sin(an) * R * .35); g.lineTo(c[0] + Math.cos(an) * R, c[1] + Math.sin(an) * R); }
    for (const rr of [.35, .68]) { g.moveTo(c[0] + R * rr, c[1]); g.arc(c[0], c[1], R * rr, 0, TAU); }
    g.stroke();
  });
}
add('alimit', { name: 'Unlimited Infinity', jp: '無下限', col: '#38c8ff', cd: 15, dur: .45, run(p, m, t) {
  p.vx = 0; p.target = POSE.manjiWind;
  if (m.s) return;
  m.s = 1; inf = { t: 1.8, cool: 0 };
  sfx.blue(); shake(12); V.ring(p.x, p.y + 160, 360, '#38c8ff', .4);
  if (Z) { Z.shock(p.x, 520, '56,200,255', .5, 10); Z.flash('56,200,255', .2, .2); }
  const o = E.P2;
  if (up(o) && Math.abs(o.x - p.x) < 320) hit(p, o, 10, { kb: 950, lift: 260, stun: .7, stop: .08, heavy: 1, col: '#38c8ff' });
} });
function repel() {                                  // something tried: it is thrown back off him, hard
  const p = E.P1, o = E.P2;
  if (inf.cool > 0 || !up(o)) return;
  inf.cool = .35;
  hit(p, o, 20, { kb: 1300, lift: 420, stun: .9, stop: .1, heavy: 1, col: '#ff4a5e' });
  sfx.red(); shake(22); V.ring(p.x, p.y + 160, 300, '#ff4a5e', .3);
  if (Z) Z.flare(p.x, p.y + 160, '255,74,94', 420, .2);
  label(p.x, p.y + 430, 'INFINITY', '#bfe9ff', .9);
}

/* ---------- Awakened Ten Shadows: NUE: THUNDER ---------- */
function nue(m) {                                   // Nue, overhead: a white mask, a dark body and wings that go down and up
  V.custom(1.45, u => {
    const b = m.bird, c = F(b.x, b.y), k = c[2] * 1.5, flap = Math.sin(E.T * 16), a = Math.min(1, u * 6, (1 - u) * 5);
    g.save(); g.translate(c[0], c[1]); g.scale(b.f * k, k); g.globalAlpha = a; g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = LINE;
    for (const s of [-1, 1]) {                      // the wings
      g.fillStyle = s < 0 ? '#1b1d33' : '#2a2d4d';
      g.beginPath(); g.moveTo(-10, -8); g.lineTo(-90, -40 - 50 * flap * s); g.lineTo(-150, 6 - 30 * flap * s); g.lineTo(-60, 14); g.closePath(); g.fill(); g.stroke();
    }
    g.fillStyle = '#23263f'; g.beginPath(); g.ellipse(0, 0, 52, 30, 0, 0, TAU); g.fill(); g.stroke();      // the body
    g.fillStyle = '#f2f0ea'; g.beginPath(); g.roundRect(30, -26, 40, 36, 10); g.fill(); g.stroke();      // the mask
    g.fillStyle = LINE; g.fillRect(44, -16, 7, 5); g.fillRect(58, -16, 7, 5);
    g.fillStyle = '#23263f'; g.beginPath(); g.moveTo(-48, 6); g.lineTo(-92, 26); g.lineTo(-84, 6); g.closePath(); g.fill(); g.stroke();      // the tail
    g.restore();
    lit(() => E.glow(E.GLOW.purple, c[0], c[1], 300 * k, .25 + .15 * Math.random()));
  });
}
add('ats', { name: 'Nue: Thunder', jp: '鵺・雷', col: '#8f9bff', cd: 14, dur: 1.45, run(p, m, t) {
  const o = E.P2, dt = t - (m.lt === undefined ? t : m.lt);
  m.lt = t;
  p.vx = 0; p.target = t < 1.2 ? POSE.manjiWind : POSE.idle;
  if (!m.s) { m.s = 1; m.bird = { x: p.x - p.face * 300, y: 760, f: p.face }; nue(m); sfx.swish(1.6); }
  const b = m.bird, tx = o.x - b.f * 60, ty = Math.max(mid(o) + 280, 450), q = 1 - Math.exp(-dt * 6);      // over them
  b.x += (tx - b.x) * q; b.y += (ty - b.y) * q; b.f = o.x >= b.x ? 1 : -1;
  for (let i = 0; i < 3; i++) if (t > .45 + i * .3 && !m['z' + i]) {
    m['z' + i] = 1;
    const last = i === 2;
    if (Z) { Z.lightning(b.x, b.y - 20, o.x, mid(o), '180,190,255', .28, last ? 7 : 5, 3); Z.flash('200,210,255', last ? .3 : .15, .15); }
    sfx.zap(); if (last) sfx.blast();
    if (up(o)) { hit(p, o, last ? 14 : 10, last ? { kb: 400, lift: 640, stun: .9, stop: .14, heavy: 1, col: '#c9d0ff' } : { kb: 40, stun: .7, stop: .06, col: '#c9d0ff' }); V.sparks(o.x, mid(o), 'purple', 10); }
    shake(last ? 24 : 12);
  }
} });

/* ---------- Switcher Stitcher: FEINT CLAP ---------- */
function confused(o, life) { V.custom(life, u => { const c = F(o.x, o.y + 330 * hs(o)), k = c[2]; g.save(); g.globalAlpha = Math.min(1, (1 - u) * 4); g.font = `700 ${Math.round(44 * k)}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.lineWidth = 6 * k; g.strokeStyle = LINE; g.strokeText('?!', c[0], c[1] - u * 20 * k); g.fillStyle = '#7ad7ff'; g.fillText('?!', c[0], c[1] - u * 20 * k); g.restore(); }); }
add('switcher', { name: 'Feint Clap', jp: 'フェイント', col: '#7ad7ff', cd: 10, dur: 1, run(p, m, t) {
  const o = E.P2, f = p.face;
  if (t < .18) { p.target = POSE.manjiWind; p.vx = 0; return; }
  if (!m.c) {                                       // the clap, and nothing changes places: they brace for it anyway
    m.c = 1; sfx.gavel(.75); sfx.hover(); shake(8);
    V.ring(p.x, p.y + 160, 210, '#7ad7ff', .3); V.sparks(p.x, p.y + 170, 'blue', 10); label(p.x, p.y + 480, 'CLAP', '#7ad7ff', .7);
    m.feint = up(o) && o.state !== 'down';
    if (m.feint) { hold(o, .9); confused(o, .9); }
  }
  if (!m.feint) { p.target = POSE.idle; p.vx = 0; if (t > .45) E.endMove(p); return; }
  const gap = (o.x - p.x) * f;
  if (t < .48) { p.target = POSE.dash; p.vx = gap > 150 ? f * 1900 : 0; return; }      // and he is on them before they have worked it out
  if (!m.h) {
    m.h = 1; p.vx = 0; p.target = POSE.cross;
    if (Math.abs(o.x - p.x) < 260 && up(o)) { hit(p, o, 22, { kb: 900, lift: 380, stun: .9, stop: .16, heavy: 1, col: '#ffffff' }); sfx.hit(true); shake(26); E.zoomIn(.3); label(o.x, o.y + 420 * hs(o), 'FEINT', '#7ad7ff'); }
  }
  if (t > .72) p.target = POSE.idle;
  p.vx = 0;
} });

/* ---------- Mark of the King: KING'S CROSS ---------- */
function eye(p) {                                   // the second eye, open under his own, and the marks lit
  V.custom(.75, u => {
    const c = F(p.x + p.face * 18, p.y + 222 * hs(p)), k = c[2], a = Math.min(1, u * 6, (1 - u) * 3);
    lit(() => { E.glow(E.GLOW.red, c[0], c[1], 140 * k, .9 * a); });
    g.save(); g.globalAlpha = a; g.fillStyle = '#ff2440'; g.beginPath(); g.ellipse(c[0], c[1] + 12 * k, 7 * k, 3.2 * k, 0, 0, TAU); g.fill(); g.restore();
  });
}
function cross(o, i) {                              // a cut the size of the arena, through them
  const a = (i ? -1 : 1) * .78, x = o.x, y = mid(o);
  V.slash(x, y, a, 1100, '#ff2440', 18); V.slash(x, y, a, 1160, '#ffffff', 6, .03);
  if (i && V.split) V.split(-a);
}
add('smark', { name: "King's Cross", jp: '王の十字', col: '#ff2440', cd: 15, dur: 1.1, run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.target = t < .3 ? POSE.crushWind : t < .62 ? POSE.crush : POSE.idle;
  if (!m.s) { m.s = 1; eye(p); sfx.charge(); if (Z) Z.dim(.5, .7); }
  if (t > .32 && !m.a && up(o)) { m.a = 1; cross(o, 0); hit(p, o, 15, { kb: 100, stun: .8, stop: .1, heavy: 1, col: '#ff2440' }); sfx.cut(1.8); shake(16); }
  if (t > .47 && !m.b && up(o)) { m.b = 1; cross(o, 1); hit(p, o, 15, { kb: 700, lift: 520, stun: .9, stop: .14, heavy: 1, col: '#ff2440' }); sfx.cut(2.2); shake(28); V.crack(o.x, 360); if (Z) Z.flash('255,36,64', .3, .25); }
} });

/* ---------- Cursed Cannon: VENT ---------- */
const VENT = [-.18, -.3, 2.85, 2.65, .5, -.5, 0];   // both hands up at his hair, and his head back
add('cannon', { name: 'Vent', jp: '放熱', col: '#7fe9ff', cd: 12, dur: .8, run(p, m, t) {
  const o = E.P2;
  p.vx = 0; p.target = t < .55 ? VENT : POSE.idle;
  if (m.s) return;
  m.s = 1;
  const C = JU.cannon, h = C ? C.state.heat : 0;
  if (C) C.heat = 0;                                // every bar of it, out at once
  sfx.steam(); sfx.blast(); shake(14 + 5 * h);
  if (Z) { Z.boom(p.x, p.y + 230, 120 + 30 * h, '127,233,255', { n: 18 + 4 * h, smoke: '200,230,240', hot: '255,255,255' }); Z.shock(p.x, 380 + 60 * h, '127,233,255', .5, 12); }
  for (let i = 0; i < 26; i++) V.puff('white', p.x + rnd(-40, 40), p.y + 290, rnd(-500, 500), rnd(100, 600), rnd(40, 80), .7);
  if (up(o) && Math.abs(o.x - p.x) < 300 + 40 * h) hit(p, o, 8 + 6 * h, { kb: 700 + 150 * h, lift: 300, stun: .8, stop: .1, heavy: 1, col: '#7fe9ff' });
  label(p.x, p.y + 470, h ? 'VENTED ×' + h : 'VENT', '#7fe9ff');
} });

/* ---------- True Cursed Energy Discharge: GRANITE ZERO ---------- */
add('tced', { name: 'Granite Zero', jp: '零距離砲', col: '#7fe9ff', cd: 18, dur: 1.2, run(p, m, t) {
  const o = E.P2, f = p.face, gap = (o.x - p.x) * f, K = JU.cannon && JU.cannon.kit;
  const mz = () => (K ? K.muzzle(p) : [p.x + f * 60, p.y + 270]);
  if (t < .3) { p.target = POSE.dash; p.vx = gap > 200 ? f * 1800 : 0; return; }      // right up to them
  if (t < .62) { p.target = K ? K.AIM : POSE.manjiWind; p.vx = 0; const q = mz(); V.mote(q[0], q[1], 'blue'); if (!m.c) { m.c = 1; sfx.rise(.32); } return; }
  if (!m.f) {
    m.f = 1; p.target = K ? K.RECOIL : POSE.idle; p.vx = -f * 260;
    const q = mz(), a = { x0: q[0], y0: q[1], x1: q[0] + f * 900, y1: Math.max(60, mid(o)) };
    if (K) K.beam(a, 150, .55, 2);
    sfx.cannon(2); shake(36); E.zoomIn(.35);
    if (Z) { Z.flash('255,255,255', .45, .2); Z.flare(q[0], q[1], '127,233,255', 520, .3); }
    if (up(o) && gap > -40 && gap < 700) { hit(p, o, 40, { kb: 1400, lift: 380, stun: .9, stop: .2, heavy: 1, col: '#7fe9ff' }); V.ring(o.x, mid(o), 340, '#7fe9ff', .35); }
  }
  if (t > .9) p.target = POSE.idle;
  p.vx *= .9;
} });

/* ---------- Vengeful Artist (and Mr. Instincto): SPLATTER ART ---------- */
const shots = [];                                   // things thrown by a special, in flight: { x, y, vx, vy, r, col, t, hit(o) }
function splatter(p) {
  const o = E.P2, f = p.face, VA = JU.vengeful, red = JU.gore !== false;
  for (let i = 0; i < 5; i++) {
    const tx = o.x + rnd(-30, 30), ty = mid(o) + rnd(-60, 60), x = p.x + f * 120, y = p.y + 220, T0 = .32 + i * .05;
    shots.push({ x, y, vx: (tx - x) / T0, vy: (ty - y) / T0 + 1300 * T0 / 2, g: 1300, r: 16, col: red ? '#9a0c1e' : '#f2c14e', t: -i * .06, life: 1.2, done: false,
      land(s) {
        if (VA && VA.fx) { VA.fx.splash(s.x, s.y, f, 3, .8); if (VA.fx.pool) VA.fx.pool(s.x, 60, 8); }
        if (up(o) && Math.abs(s.x - o.x) < 90 * hs(o) && Math.abs(s.y - mid(o)) < 200 * hs(o)) {
          const last = i === 4;
          hit(p, o, 6, { kb: last ? 520 : 40, lift: last ? 300 : 0, stun: .6, stop: .03, col: s.col, bleed: last ? 1 : 0 });
          sfx.splat();
          if (last && VA && VA.wound && !o.ko) VA.wound(o);
        }
      } });
  }
}
const SPLATTER = { name: 'Splatter Art', jp: '飛沫画', col: '#f2c14e', cd: 14, dur: 1.05, run(p, m, t) {
  p.vx = 0;
  if (t < .2) { p.target = POSE.hookWind; return; }
  p.target = t < .5 ? POSE.hook : POSE.idle;
  if (!m.s) { m.s = 1; sfx.swish(1.4); splatter(p); V.slash(p.x + p.face * 110, p.y + 200, p.face > 0 ? -.6 : Math.PI + .6, 420, '#f2c14e', 12); }
} };
add('vengeful', SPLATTER); add('instincto', SPLATTER);
function flyShots(dt) {
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    if ((s.t += dt) < 0) continue;
    s.vy -= s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt;
    if (s.home && up(E.P2)) s.x += (E.P2.x + s.dx - s.x) * Math.min(1, dt * 10);      // (falling on them, wherever they have got to)
    const o = E.P2, there = Math.abs(s.x - o.x) < 70 * hs(o) && Math.abs(s.y - mid(o)) < 170 * hs(o);
    if (there || s.y <= 0 || s.t > s.life) { if (!s.done) { s.done = true; s.land(s); } shots.splice(i, 1); }
  }
}
function drawShots() {
  for (const s of shots) {
    if (s.t < 0) continue;
    const c = F(s.x, s.y), k = c[2];
    g.fillStyle = s.col; g.strokeStyle = LINE; g.lineWidth = 2.5 * k;
    g.beginPath(); g.ellipse(c[0], c[1], s.r * k * 1.3, s.r * k, Math.atan2(-s.vy, s.vx), 0, TAU); g.fill(); g.stroke();
  }
}

/* ---------- Heavenly Restriction (Maki): DRAGON-BONE ---------- */
const BONE = '#ffb070';
function bone(p, m) {                               // the blade, held across her: a glint running up it, and once it has taken a blow, the heat of what it took
  V.custom(1.6, () => {
    if (p.move !== m) return;
    const a = E.hand(p, true), b = E.hand(p, false), c = F((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), k = c[2], f = p.face;
    const sw = m.swT === undefined ? 0 : ease(Math.min(1, (E.T - m.swT) / .12)), an = lerp(-1.05, .45, sw);      // up across her, then down through them
    const dx = Math.cos(an) * f, dy = Math.sin(an), nx = -dy, ny = dx, L = 250 * k, W = 15 * k;
    const at = (d, n) => [c[0] + dx * d + nx * n, c[1] + dy * d + ny * n], path = pts => { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); };
    const heat = m.gotT === undefined ? 0 : Math.min(1, (E.T - m.gotT) * 7);
    g.save(); g.lineJoin = 'round'; g.strokeStyle = LINE; g.lineWidth = 3 * k;
    g.fillStyle = '#3a2a20'; path([at(-34 * k, 5 * k), at(20 * k, 5 * k), at(20 * k, -5 * k), at(-34 * k, -5 * k)]); g.fill(); g.stroke();      // the grip
    g.fillStyle = heat ? `rgb(255,${Math.round(lerp(216, 150, heat))},${Math.round(lerp(224, 60, heat))})` : '#d8e0e8';
    path([at(28 * k, W), at(L - 46 * k, W * .9), at(L, 0), at(L - 46 * k, -W * .9), at(28 * k, -W)]); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(40,46,56,.45)'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(...at(30 * k, 0)); g.lineTo(...at(L - 30 * k, 0)); g.stroke();      // the spine
    g.fillStyle = '#efe4c8'; g.strokeStyle = LINE; g.lineWidth = 3 * k;
    path([at(14 * k, 34 * k), at(30 * k, 26 * k), at(30 * k, -26 * k), at(14 * k, -34 * k)]); g.fill(); g.stroke();      // the guard, bone
    g.restore();
    lit(() => {
      const q = (E.T * 1.8) % 1, s = at(lerp(40 * k, L - 20 * k, q), 0);
      E.glow(E.GLOW.white, s[0], s[1], 60 * k, .9 * Math.sin(q * Math.PI));
      if (heat) { const md = at(L * .5, 0); E.glow(E.GLOW.fire, md[0], md[1], 300 * k, .55 * heat); }
      if (heat && (m.swT === undefined || E.T - m.swT < .3)) {      // the jet, out of the end of the hilt: short while it builds, long behind the cut
        const q = at(-34 * k, 0), len = (m.swT === undefined ? 90 : 260) * k * (.85 + .15 * Math.random()), w = 18 * k;
        g.fillStyle = 'rgba(255,140,50,.55)'; g.beginPath(); g.moveTo(q[0] + nx * w, q[1] + ny * w); g.lineTo(q[0] - dx * len, q[1] - dy * len); g.lineTo(q[0] - nx * w, q[1] - ny * w); g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,240,200,.9)'; g.beginPath(); g.moveTo(q[0] + nx * w * .45, q[1] + ny * w * .45); g.lineTo(q[0] - dx * len * .6, q[1] - dy * len * .6); g.lineTo(q[0] - nx * w * .45, q[1] - ny * w * .45); g.closePath(); g.fill();
        E.glow(E.GLOW.fire, q[0], q[1], 160 * k, .8);
      }
    });
  });
}
function jet(p, n) {                                // what it took, let out of the end of the hilt in one go: it drives the cut
  if (!Z) return;
  const a = E.hand(p, true), f = p.face, x = a[0] - f * 20, y = a[1] - 35;
  for (let i = 0; i < n; i++) Z.emit(Math.random() < .5 ? 0 : 5, x, y, -f * rnd(900, 1700), rnd(-500, -100), rnd(14, 34), rnd(.15, .3), Math.random() < .5 ? '255,176,112' : '255,236,180');
}
function caught(face, a, mul = 1) {                 // a blow that lands while it is up goes into the blade instead of her
  const p = E.P1, m = p.move;
  if (!m || m.def !== SP.maki || m.got !== undefined || p.dead || a.pierce || a.dmg >= 9000) return false;
  m.got = m.t; m.gotT = E.T; m.stored = a.dmg * mul;
  p.inv = Math.max(p.inv || 0, .6); p.face = -face;
  sfx.block(); sfx.charge(); E.stop(.1); shake(12);
  const h = E.hand(p, true);
  E.addSpark(h[0], h[1], '#ffd0a0', 140); V.ring(h[0], h[1], 200, BONE, .3); V.sparks(h[0], h[1], 'fire', 10);
  label(p.x, p.y + 480, 'ABSORBED', '#ffd0a0', .8);
  return true;
}
add('maki', { name: 'Dragon-Bone', jp: '竜骨', col: '#7ddc9a', cd: 14, dur: 1.6, run(p, m, t) {
  const o = E.P2;
  if (!m.s) { m.s = 1; bone(p, m); sfx.blade(); }
  if (m.got === undefined) {                        // behind the blade, waiting for it
    p.vx = 0; p.target = POSE.vaGuard;
    if (t < .9) return;
    m.got = -1;                                     // nothing came: she cuts anyway, with nothing behind it
  }
  const full = m.got >= 0, s = t - (full ? m.got : .9);
  if (full && s < .16) { p.vx = 0; p.target = POSE.vaGuard; jet(p, 2); return; }
  if (!m.swung) {
    m.swung = 1; m.swT = E.T; sfx.whoosh();
    if (up(o)) p.face = o.x >= p.x ? 1 : -1;
    m.v = full ? clamp(((o.x - p.x) * p.face - 140) / .14, 900, 6000) : 900;      // as far as it takes to reach them
    if (full) { sfx.blast(); shake(14); }
  }
  const f = p.face, dash = s < (full ? .3 : .14), gap = (o.x - p.x) * f;
  p.target = dash ? POSE.haCutA : POSE.idle; p.vx = dash && gap > 60 ? f * m.v : 0;
  if (full && dash) jet(p, 3);
  if (!m.h && up(o) && gap > -60 && gap < 240) {
    m.h = 1;
    const ang = f > 0 ? -.35 : Math.PI + .35;
    if (full) {
      hit(p, o, clamp(18 + m.stored * 1.5, 18, 50), { kb: 1100, lift: 460, stun: .9, stop: .2, heavy: 1, col: BONE });
      V.slash(o.x, mid(o), ang, 900, BONE, 22); V.slash(o.x, mid(o), ang, 960, '#ffffff', 7, .03);
      sfx.hit(true); shake(30); E.zoomIn(.3); V.crack(o.x, 320); label(o.x, o.y + 430 * hs(o), 'DRAGON-BONE', BONE);
      if (Z) Z.flash('255,176,112', .3, .25);
    } else { hit(p, o, 12, { kb: 420, stun: .6, stop: .08, col: '#d8e0e8' }); V.slash(o.x, mid(o), ang, 420, '#d8e0e8', 12); sfx.hit(false); }
  }
  if (s > .7) E.endMove(p);
} });

/* ---------- Queen of Curses (Yuta): CURSED SPEECH ---------- */
const LILAC = '#d9c9ff';
function seal(p, life) {                            // Inumaki's marks, at the corners of his mouth: a snake's eye and its fangs, copied
  V.custom(life, u => {
    const c = F(p.x + p.face * 16, p.y + 204 * hs(p)), k = c[2], a = Math.min(1, u * 8, (1 - u) * 5);
    g.save(); g.globalAlpha = a; g.strokeStyle = LILAC; g.lineWidth = 2 * k; g.lineCap = 'round';
    for (const s of [-1, 1]) {
      const x = c[0] + s * 9 * k;
      g.beginPath(); g.arc(x + s * 4 * k, c[1] - 2 * k, 3 * k, 0, TAU); g.stroke();
      g.beginPath(); g.moveTo(x + s * 2 * k, c[1] + 2 * k); g.lineTo(x + s * 9 * k, c[1] + 5 * k); g.moveTo(x + s * 4 * k, c[1] + 3 * k); g.lineTo(x + s * 5 * k, c[1] + 8 * k); g.stroke();
    }
    g.restore();
    lit(() => E.glow(E.GLOW.purple, c[0], c[1], 90 * k, .7 * a));
  });
}
function words(p, o) {                              // the words: big, out of his mouth, and the sound of them rolling at them
  const x0 = p.x + p.face * 30, y0 = p.y + 204 * hs(p), f = p.face;
  V.custom(.55, u => {
    for (let i = 0; i < 4; i++) {
      const q = u * 1.4 - i * .14;
      if (q <= 0 || q >= 1) continue;
      const c = F(lerp(x0, o.x, q), lerp(y0, mid(o), q)), k = c[2], r = (40 + 120 * q) * k, a0 = f > 0 ? 0 : Math.PI;
      lit(() => { g.strokeStyle = `rgba(217,201,255,${.8 * (1 - q)})`; g.lineWidth = 6 * k; g.beginPath(); g.arc(c[0], c[1], r, a0 - 1.1, a0 + 1.1); g.stroke(); });
    }
  });
  V.custom(1.1, u => {
    const c = F(p.x, p.y + 470 * hs(p)), k = c[2], pop = u < .12 ? 1.6 - u / .12 * .6 : 1, a = Math.min(1, (1 - u) * 5), jit = u < .5 ? 3 * k : 0;
    g.save(); g.translate(c[0] + rnd(-jit, jit), c[1] + rnd(-jit, jit)); g.scale(pop, pop); g.globalAlpha = a;
    g.fillStyle = '#ffffff'; g.strokeStyle = LINE; g.lineWidth = 4 * k; g.lineJoin = 'miter';
    g.beginPath(); for (let i = 0; i < 18; i++) { const an = i / 18 * TAU, rr = (i & 1 ? 120 : 160) * k; g.lineTo(Math.cos(an) * rr * 1.5, Math.sin(an) * rr * .62); } g.closePath(); g.fill(); g.stroke();      // a burst, the way a shout is drawn
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `400 ${Math.round(62 * k)}px 'Yuji Syuku', 'Yu Mincho', serif`; g.fillStyle = '#1a1024'; g.fillText('動くな', 0, -10 * k);
    g.font = `400 ${Math.round(22 * k)}px Anton, Impact, sans-serif`; g.fillStyle = '#7a4fc0'; g.fillText("DON'T MOVE", 0, 40 * k);
    g.restore();
  });
}
function frozen(o, life) {                          // held where they stand: shaking against it, and getting nowhere
  V.custom(life, u => {
    const c = F(o.x, mid(o)), k = c[2] * hs(o), a = Math.min(1, u * 8, (1 - u) * 6);
    g.save(); g.globalAlpha = a * .9; g.strokeStyle = LILAC; g.lineWidth = 3 * k; g.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const s = i & 1 ? 1 : -1, y = c[1] + (i - 2.5) * 46 * k, x = c[0] + s * (95 + 8 * Math.sin(E.T * 60 + i)) * k; g.beginPath(); g.moveTo(x, y - 14 * k); g.lineTo(x + s * 10 * k, y); g.lineTo(x, y + 14 * k); g.stroke(); }
    g.restore();
  });
}
add('yuta', { name: 'Cursed Speech', jp: '呪言', col: LILAC, cd: 16, dur: 1.35, run(p, m, t) {
  const o = E.P2;
  if (!m.s) { m.s = 1; seal(p, 1.2); sfx.charge(); }
  if (t < .22) { p.vx = 0; p.target = POSE.manjiWind; return; }
  if (!m.w) {
    m.w = 1; words(p, o); sfx.wave(); sfx.roar(.5); shake(14); if (Z) Z.dim(.5, .9);
    m.ok = up(o) && Math.abs(o.x - p.x) < 1200;
  }
  if (!m.ok) { p.vx = 0; p.target = POSE.idle; if (t > .6) E.endMove(p); return; }
  if (t > .36 && !m.f) { m.f = 1; hold(o, 1.2); frozen(o, 1); sfx.blast(); V.ring(o.x, mid(o), 280, LILAC, .3); label(o.x, o.y + 430 * hs(o), 'FROZEN', LILAC, .9); }
  if (t > .36 && t < .95) hold(o, .25);            // (and let go before the last cut, or it could not throw them)
  const f = p.face, gap = (o.x - p.x) * f;
  if (t < .62) { p.vx = 0; p.target = POSE.manjiWind; return; }
  if (t < .8) { p.target = POSE.dash; p.vx = gap > 170 ? f * 2600 : 0; return; }      // and he walks right up to them
  p.vx = 0;
  if (!m.a) { m.a = 1; p.target = POSE.hook; sfx.whoosh(); V.slash(o.x, mid(o), f > 0 ? -.4 : Math.PI + .4, 520, LILAC, 14); if (up(o)) hit(p, o, 10, { kb: 60, stun: .6, stop: .08, col: LILAC }); }
  if (t > .98 && !m.b) {
    m.b = 1; p.target = POSE.crush; sfx.cut(1.6);
    V.slash(o.x, mid(o), f > 0 ? -1.2 : Math.PI + 1.2, 760, '#ffffff', 18); V.slash(o.x, mid(o), f > 0 ? -1.2 : Math.PI + 1.2, 800, LILAC, 6, .03);
    if (up(o)) { hit(p, o, 16, { kb: 700, lift: 620, stun: .9, stop: .16, heavy: 1, col: LILAC }); shake(24); if (Z) Z.flash('217,201,255', .25, .2); }
  }
  if (t > 1.15) p.target = POSE.idle;
} });

/* ---------- Idle Death Gamble (Hakari): PACHINKO ---------- */
const FEVER = '#7ad7ff', GOLDS = '#ffd23d';
const STOPS = [.45, .65, .85];
function reels(p, m) {                              // three windows over his head, spinning, and stopping one at a time
  V.custom(1.9, u => {
    const t = m.tt, c = F(p.x, p.y + 400 * hs(p)), k = c[2], w = 56 * k, h = 76 * k, a = Math.min(1, u * 10, (1 - u) * 6);
    const won = t >= m.stop3 && m.r[0] === m.r[2] && m.r[0] === m.r[1], fl = won && Math.sin(E.T * 30) > 0;
    g.save(); g.globalAlpha = a;
    g.fillStyle = 'rgba(8,14,30,.92)'; g.strokeStyle = fl ? GOLDS : FEVER; g.lineWidth = 4 * k;
    g.beginPath(); g.roundRect(c[0] - 1.95 * w, c[1] - .82 * h, 3.9 * w, 1.64 * h, 12 * k); g.fill(); g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `400 ${Math.round(58 * k)}px Anton, Impact, sans-serif`;
    for (let i = 0; i < 3; i++) {
      const x = c[0] + (i - 1) * 1.2 * w, stop = i < 2 ? STOPS[i] : m.stop3, done = t >= stop;
      g.fillStyle = '#f4f1e6'; g.fillRect(x - w / 2, c[1] - h / 2, w, h);
      g.save(); g.beginPath(); g.rect(x - w / 2, c[1] - h / 2, w, h); g.clip();
      if (done) {
        const d = m.r[i], bob = Math.max(0, 1 - (t - stop) * 8) * 12 * k;
        g.fillStyle = d === 7 ? '#e0203c' : won ? '#c98a00' : '#1a1420'; g.fillText(String(d), x, c[1] + bob);
      } else {
        const roll = t * 16 + i * 2.3, off = (roll % 1) * h;
        for (let j = -1; j <= 1; j++) { const d = ((Math.floor(roll) - j) % 7 + 7) % 7 + 1; g.fillStyle = d === 7 ? '#e0203c' : '#1a1420'; g.fillText(String(d), x, c[1] + off + j * h); }
      }
      g.restore();
      g.strokeStyle = LINE; g.lineWidth = 2.5 * k; g.strokeRect(x - w / 2, c[1] - h / 2, w, h);
    }
    const reach = m.r[0] === m.r[1] && t >= STOPS[1];
    let say = '', col = FEVER;
    if (t >= m.stop3) [say, col] = won ? ['大当り JACKPOT', GOLDS] : reach ? ['惜しい · SO CLOSE', FEVER] : ['ハズレ · MISS', '#9aa3b5'];
    else if (reach) say = 'リーチ · REACH';
    if (say) { g.font = `400 ${Math.round(26 * k)}px Anton, Impact, sans-serif`; g.lineWidth = 5 * k; g.strokeStyle = LINE; g.strokeText(say, c[0], c[1] - h * .82 - 22 * k); g.fillStyle = col; g.fillText(say, c[0], c[1] - h * .82 - 22 * k); }
    g.restore();
    if (fl) lit(() => E.glow(E.GLOW.gold, c[0], c[1], 360 * k, .5));
  });
}
function payout(p, n, each, big) {                  // and the machine pays out: silver balls, down on them from above
  const o = E.P2;
  for (let i = 0; i < n; i++) {
    const last = big && i === n - 1;
    shots.push({ x: o.x + rnd(-70, 70), y: 1050 + i * 18, vx: 0, vy: -900, g: 2200, r: last ? 18 : 11, col: '#dfe6ee', t: -i * .025, life: 2, done: false, home: true, dx: rnd(-45, 45),
      land(s) {
        if (up(o) && Math.abs(s.x - o.x) < 110 * hs(o) && s.y < o.y + 380 * hs(o)) {
          hit(p, o, each, last ? { kb: 700, lift: 560, stun: .9, stop: .14, heavy: 1, col: GOLDS } : { kb: 0, stun: .45, stop: .015, col: FEVER });
          if (last) { sfx.blast(); shake(22); V.ring(o.x, mid(o), 320, GOLDS, .35); } else if (i % 3 === 0) sfx.snap();
        } else V.sparks(s.x, Math.max(10, s.y), 'white', 2);
      } });
  }
}
function roll() {                                   // three numbers: one in five a jackpot, two in five two alike (and the third not), the rest all different
  const r = Math.random(), a = 1 + Math.floor(Math.random() * 7), b = 1 + (a + Math.floor(Math.random() * 6)) % 7;
  if (r < .2) return [a, a, a];
  if (r < .6) return [a, a, b];
  let c = 1 + Math.floor(Math.random() * 7);
  while (c === a || c === b) c = 1 + c % 7;
  return [a, b, c];
}
add('hakari', { name: 'Pachinko', jp: 'パチンコ', col: FEVER, cd: 12, dur: 1.5, quiet: true, run(p, m, t) {      // (quiet: the machine says what it is)
  p.vx = 0; m.tt = t;
  if (!m.s) {
    m.s = 1; m.r = roll();
    m.stop3 = m.r[0] === m.r[1] ? 1.1 : STOPS[2];  // two alike: the third takes its time
    reels(p, m); sfx.rise(.5);
  }
  p.target = t < m.stop3 ? POSE.manjiWind : POSE.idle;
  for (let i = 0; i < 3; i++) if (!m['k' + i] && t >= (i < 2 ? STOPS[i] : m.stop3)) { m['k' + i] = 1; sfx.tick(i * 2); if (i === 1 && m.r[0] === m.r[1]) sfx.charge(); }
  if (t >= m.stop3 + .08 && !m.pay) {
    m.pay = 1;
    const won = m.r[0] === m.r[1] && m.r[1] === m.r[2], reach = m.r[0] === m.r[1];
    if (won) { payout(p, 18, 1.5, true); sfx.confirm(); sfx.bf(); shake(16); if (Z) Z.flash('255,210,61', .3, .3); JU.tech.charge(35); }      // a jackpot: and the bar toward the real one
    else if (reach) { payout(p, 8, 2, false); sfx.hover(); }
    else { payout(p, 3, 2, false); sfx.back(); }
  }
  if (m.pay && t > m.stop3 + .3) E.endMove(p);
} });

/* ---------- Star Rage (Yuki): BLACK HOLE ---------- */
const STAR = '#ffd87a';
function hole(m) {                                  // a star's worth of mass in one point: black, a ring of light going round it, and everything drawn in
  V.custom(1.45, u => {
    const b = m.bh, c = F(b.x, b.y), k = c[2], grow = ease(Math.min(1, u * 3)), end = u > .8 ? Math.max(0, 1 - (u - .8) / .12) : 1, R = 70 * k * grow * end * (1 + .06 * Math.sin(E.T * 40));
    if (R <= .5) return;
    lit(() => {
      E.glow(E.GLOW.gold, c[0], c[1], R * 7, .55 * grow * end);
      for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(255,${200 + i * 20},${120 + i * 50},${.75 - i * .2})`; g.lineWidth = (10 - i * 3) * k; g.beginPath(); g.ellipse(c[0], c[1], R * (2.4 + i * .5), R * (.55 + i * .1), -.25, E.T * 3 + i, E.T * 3 + i + TAU * .8); g.stroke(); }
    });
    g.fillStyle = '#000'; g.beginPath(); g.arc(c[0], c[1], R, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(255,236,190,.9)'; g.lineWidth = 2.5 * k; g.stroke();      // the ring of light right at its edge
    lit(() => { g.strokeStyle = 'rgba(255,230,160,.85)'; g.lineWidth = 6 * k; g.beginPath(); g.ellipse(c[0], c[1], R * 2.4, R * .55, -.25, 0, Math.PI); g.stroke(); });      // the near side of the disc, across it
    if (Z && u < .8) for (let i = 0; i < 3; i++) { const an = rnd(0, TAU), d = rnd(220, 480); Z.emit(1, b.x + Math.cos(an) * d, b.y + Math.sin(an) * d * .6, -Math.cos(an) * d * 3 - Math.sin(an) * 600, -Math.sin(an) * d * 1.8 + Math.cos(an) * 400, 4, .25, '255,216,122'); }
  });
}
add('yuki', { name: 'Black Hole', jp: 'ブラックホール', col: STAR, cd: 18, dur: 1.6, run(p, m, t) {
  const o = E.P2, dt = t - (m.lt === undefined ? t : m.lt);
  m.lt = t;
  p.vx = 0; p.target = t < 1.2 ? POSE.jab : POSE.idle;      // a hand out at it, holding it there
  if (!m.s) {
    m.s = 1; m.ok = up(o) && Math.abs(o.x - p.x) < 1100;
    m.bh = { x: m.ok ? o.x : p.x + p.face * 500, y: m.ok ? mid(o) + 40 : 260 };
    hole(m); sfx.charge(); sfx.rise(1.1); if (Z) Z.dim(.6, 1.3);
  }
  if (m.ok && up(o) && t > .2 && t < 1.15 && !duel()) { o.x += (m.bh.x - o.x) * (1 - Math.exp(-dt * 6)); hold(o, .3); }      // drawn in, and kept there
  for (let i = 0; i < 4; i++) if (t > .4 + i * .15 && !m['q' + i] && m.ok && up(o)) { m['q' + i] = 1; hit(p, o, 4, { kb: 0, stun: .5, stop: .02, col: STAR }); V.sparks(o.x, mid(o), 'gold', 6); shake(6); }
  if (t > 1.17 && !m.e) {                           // and it gives out: everything it took, at once
    m.e = 1; sfx.blast(); sfx.wave(); shake(32); E.zoomIn(.3);
    if (Z) { Z.flash('255,236,190', .45, .3); Z.shock(m.bh.x, 760, '255,216,122', .6, 14); }
    V.ring(m.bh.x, m.bh.y, 420, STAR, .4); E.addBlast(m.bh.x, m.bh.y, '255,216,122', 380);
    if (m.ok && up(o) && Math.abs(o.x - m.bh.x) < 260) hit(p, o, 16, { kb: 900, lift: 720, stun: .9, stop: .16, heavy: 1, col: STAR });
  }
} });

/* ================= the three in their own files ================= */
if (JU.judge && JU.judge.esp) add('judge', JU.judge.esp);
if (JU.haruta && JU.haruta.esp) add('haruta', JU.haruta.esp);
if (JU.reaper && JU.reaper.esp) add('reaper', JU.reaper.esp);
const RATIO = { name: 'Ratio', show: true };         // (Ratio Man's E is the Ratio, ratio.js: shown here, not done here)

/* ================= E ================= */
function use(d, p) {
  if (d.press) return d.press(p);                   // its own way of doing it
  if (cd > 0) { sfx.back(); return true; }
  if (p.move || p.ps || p.dead || p.dashT > 0 || !p.ground) return true;      // (in the middle of something: not now)
  cd = max = d.cd;
  p.move = { def: d, key: 'esp', t: 0 };
  slot.classList.add('act');
  if (!d.quiet) shout(p, d.jp, d.col);
  sfx.charge();
  return true;
}
const press0 = H.press, tick0 = H.tick, fx0 = H.fx, hit0 = H.hit, guard0 = H.guard, reset0 = H.reset, start0 = H.fightStart;
H.press = (a, inScene) => {
  if (!inScene && (a === 'ok' || a === 'esp') && E.root.dataset.mode === 'fight' && !E.root.classList.contains('cine') && !Fi.fight.paused) {
    const d = SP[which()];
    if (d && use(d, E.P1)) return true;
    if (a === 'esp') a = 'ok';                      // (the hotbar's E, on a touch screen: as if E had been pressed)
  }
  return press0 ? press0(a, inScene) : false;
};
// a blow of his that has landed while a move was going: that move cannot be called off any more
H.hit = (o, face, h) => { hit0(o, face, h); const p = E.P1; if (p.move && o === E.P2) p.move.landed = true; };
H.guard = (face, a, mul) => {
  if (guard0 && guard0(face, a, mul)) return true;
  if (inf && inf.t > 0 && !E.P1.dead) { repel(); return true; }      // Infinity: it does not reach him
  return caught(face, a, mul);                      // (or Dragon-Bone takes it)
};
// the hotbar's E: what it is, and its wait
function paintSlot() {
  const id = which(), d = SP[id] || (id === 'ratio' ? RATIO : null);
  slot.hidden = !d;
  E.root.classList.toggle('esp', !!d && id !== 'ratio');
  if (!d) return;
  const nm = typeof d.name === 'function' ? d.name() : d.name;
  if (nm !== shownName) { shownName = nm; slot.querySelector('b').textContent = nm; slot.style.setProperty('--ec', d.col || '#dff3ff'); }
  const left = d.left !== undefined ? d.left : d.press && id !== 'yuji' ? 0 : cd, mx = d.max !== undefined ? d.max : max;
  const v = Math.round(clamp(left / (mx || 1), 0, 1) * 50) / 50;
  if (v !== shownV) {
    if (v === 0 && shownV > 0) { slot.classList.remove('rdy'); void slot.offsetWidth; slot.classList.add('rdy'); }
    shownV = v; slot.style.setProperty('--cd', v);
  }
}
H.tick = dt => {
  tick0(dt);
  if (cd > 0) cd = Math.max(0, cd - dt);
  if (inf && (inf.t -= dt) <= 0) inf = null; else if (inf && inf.cool > 0) inf.cool -= dt;
  const p = E.P1;
  if (swam && !(p.move && p.move.def === SP.ten)) { swam = false; p.alpha = 1; }      // (Shadow Swim over, or cut short: he is back out of the shadow)
  if (shots.length) flyShots(dt);
  paintSlot();
};
H.fx = dt => {
  fx0(dt);
  if (inf && inf.t > 0) hexes(E.P1);
  if (shots.length) drawShots();
};
const clear = () => { cd = 0; inf = null; shots.length = 0; if (swam) { swam = false; E.P1.alpha = 1; } };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) clear(); paintSlot(); };

JU.especial = { SP, add, which, get cd() { return cd; }, set cd(v) { cd = Math.max(0, +v || 0); for (const k in SP) if (SP[k].nocd) SP[k].nocd(); }, get inf() { return inf && { t: +inf.t.toFixed(2) }; } };
})();
