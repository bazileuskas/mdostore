/* JUJUTSU UNLIMITEDS — Domain Update 2: the black barrier, what is inside each domain, and letting one go early.
   JU.domain.raise(kind, { who, dur, cancel }) puts a domain up once its opening has whited out; JU.domain.drop() shatters it.
   G while a domain of his own is open drops it. Unlimited Void can be opened in a fight: Gojo clan with Limitless, G.
   Update 0.2v1, the clash: a domain raised while the other side's is standing does not replace it. The two stand half and half with a seam
   between them and neither one's effect works. Whoever does the more damage pushes the seam across, and the one it is pushed out of breaks */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, box = E.box, H = E.hooks, cam = E.cam, V = JU.vfx, sfx = JU.sfx, D = JU.domain, Fi = JU.fights;
const { clamp, rnd, ease, ZP } = E, TAU = Math.PI * 2, BLACK = '#04030a', RED = '#ff2440';
// each domain: the colour of its barrier, the colour it lays over the fight, the tone of its opening, what stands inside it, and what it does
// while it is open: tick(dt, enemy, d) when it is the player's, foe(dt, player, d) when an enemy has opened it over him.
// bare: it paints a sky of its own. solo: it does not clash, it replaces. JU.domain.kind(name, def) adds another
const KIND = {
  shrine: { rim: '255,60,80', tint: '120,0,16', tone: 'red', inside: () => shrine(), tick(dt, o, d) { ashes(dt); if (d.won) reap(dt, o, d); }, foe(dt, p, d) { ashes(dt); flay(dt, p, d); } },
  void: { rim: '150,215,255', tint: '10,40,110', tone: 'blue', bare: true, inside() { JU.maki.voidStage.sky(); JU.maki.voidStage.floor(); }, tick: (dt, o) => stillness(o), fx: o => knowing(o) }
};
const SHARDS = Array.from({ length: 28 }, () => [Math.random(), Math.random(), rnd(40, 130), rnd(0, TAU), rnd(-3, 3), rnd(.6, 1.4)]);
const SKULLS = Array.from({ length: 24 }, (_, i) => [(i % 2 ? 1 : -1) * rnd(300, 760), rnd(0, 60), ZP + rnd(150, 470), rnd(.9, 1.7)]).sort((a, b) => b[2] - a[2]);
const CLASH_T = 6, PUSH_FOE = .22, PUSH_ME = .3, WIN_T = 5, BACKLASH = .12;   // how long two domains can stay locked; the share of its health, and of his, that carries the seam right across;
                                                                             // how long the winner's stands afterwards; and what breaking costs the loser, as a share of its health
let dom = null, rival = null, clash = null, wreck = null, voidCd = 0, lastT = 0;    // the one standing (the player's, during a clash); the enemy's, during a clash; the tug between them; one that has just broken
const mine = d => d.who !== E.P2;
const shake = v => { if (!JU.reduceMotion) cam.shake = Math.max(cam.shake, v); };

/* ---------- the barrier ---------- */
// while the opening plays: a black dome swelling out from each caster until it has swallowed the arena
function rising(t) {
  for (const w of [D.who, D.vs]) {
    if (!w) continue;
    const c = F(w.x, 0), r = ease(clamp((t - D.T.shut) / (D.T.white - D.T.shut), 0, 1)) * E.VW * 1.25;
    g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.ellipse(c[0], c[1], r, r * .2, 0, 0, TAU); g.fill();
    g.fillStyle = BLACK; g.beginPath(); g.arc(c[0], c[1], r, Math.PI, TAU); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 5; g.beginPath(); g.arc(c[0], c[1], r, Math.PI, TAU); g.stroke();
  }
}
// from inside: black over everything behind the fight, with the curve of the shell just visible in it
function shell(rim, fill) {
  const VW = E.VW, HY = E.HY, c = P(0, 0, ZP + 700), gr = g.createLinearGradient(0, HY - 90, 0, HY);
  if (fill) {
    g.fillStyle = BLACK; g.fillRect(-300, -300, VW + 600, HY + 302);
    g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(-300, HY, VW + 600, E.VH - HY + 500);
  }
  g.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    g.strokeStyle = `rgba(${rim},${.2 - i * .04})`;
    g.beginPath(); g.ellipse(c[0], HY, VW * (.42 + i * .2), VW * (.3 + i * .15), 0, Math.PI, TAU); g.stroke();
  }
  gr.addColorStop(0, `rgba(${rim},0)`); gr.addColorStop(1, `rgba(${rim},.3)`);
  g.fillStyle = gr; g.fillRect(-300, HY - 90, VW + 600, 92);
}
const inside = k => { if (k.bare) { k.inside(); shell(k.rim, false); } else { shell(k.rim, true); k.inside(); } };

/* ---------- Malevolent Shrine: the hall and its horns, skulls heaped at its feet, blood lying on the floor ---------- */
function skull(s) {
  const c = P(s[0], s[1], s[2]), k = c[2] * s[3];
  g.fillStyle = '#d9d2bd'; g.beginPath(); g.roundRect(c[0] - 13 * k, c[1] - 24 * k, 26 * k, 22 * k, 8 * k); g.fill(); g.fillRect(c[0] - 8 * k, c[1] - 5 * k, 16 * k, 6 * k);
  g.fillStyle = '#12090c'; g.fillRect(c[0] - 8 * k, c[1] - 17 * k, 6 * k, 7 * k); g.fillRect(c[0] + 2 * k, c[1] - 17 * k, 6 * k, 7 * k);
}
function shrine() {
  const VW = E.VW, HY = E.HY, z = ZP + 330, top = P(0, 300, z);
  g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.red, top[0], top[1], VW * .95, .5 + .08 * Math.sin(E.T * 3)); g.globalCompositeOperation = 'source-over';
  g.strokeStyle = '#d9d2bd'; g.lineCap = 'round';   // the horns, behind the roof
  for (const s of [-1, 1]) {
    const a = P(s * 300, 400, z + 100), b = P(s * 640, 540, z + 100), c = P(s * 470, 830, z + 100);
    g.lineWidth = 36 * a[2]; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c[0], c[1]); g.stroke();
  }
  g.lineCap = 'butt';
  box(0, 0, z, 820, 40, 340, '#3a1e22', '#241215', '#4a262b');
  box(0, 40, z + 40, 460, 260, 250, '#5c121e', '#3a0b13');
  const m0 = P(-170, 240, z + 40), m1 = P(170, 112, z + 40);                   // the mouth, and the teeth in it
  g.fillStyle = '#0a0305'; g.fillRect(m0[0], m0[1], m1[0] - m0[0], m1[1] - m0[1]);
  g.fillStyle = '#e6dcc4';
  for (let i = 0; i < 8; i++) for (const y of [240, 148]) { const a = P(-158 + i * 42, y, z + 40), b = P(-128 + i * 42, y - 36, z + 40); g.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }
  box(0, 300, z, 860, 38, 340, '#1a0a0e', '#0d0507');
  box(0, 338, z + 60, 600, 32, 230, '#1a0a0e', '#0d0507');
  box(0, 370, z + 90, 320, 86, 160, '#5c121e', '#3a0b13');
  for (const s of [-1, 1]) box(s * 390, 338, z + 120, 32, 160, 32, '#d9d2bd', '#a39c88');
  for (const s of SKULLS) skull(s);
  g.fillStyle = 'rgba(120,0,16,.34)'; g.fillRect(-300, HY, VW + 600, E.VH - HY + 500);
  g.lineWidth = 2;
  for (let i = 0; i < 6; i++) {                     // rings spreading across the blood
    const r = (E.T * 70 + i * 120) % 720, c = P((i * 397) % 1500 - 750, 0, ZP + (i % 3 - 1) * 150);
    g.strokeStyle = `rgba(255,110,120,${.28 * (1 - r / 720)})`; g.beginPath(); g.ellipse(c[0], c[1], r * c[2], r * .24 * c[2], 0, 0, TAU); g.stroke();
  }
}

/* ---------- putting one up, and letting it go ---------- */
function raise(kind, o) {
  if (clash) return;                                // two are locked together already: there is no room for a third
  const d = Object.assign({ kind, t: 0, dur: 5, fall: 0 }, o), up = dom && !dom.fall ? dom : null;
  if (up && mine(up) !== mine(d) && !KIND[kind].solo && !KIND[up.kind].solo) { lock(mine(d) ? d : up, mine(d) ? up : d); return; }
  if (up && KIND[up.kind].end) KIND[up.kind].end();  // whatever was standing is simply gone
  dom = d; rival = null; lastT = E.T;
}
function drop(early) {
  if (!dom || dom.fall || clash) return;
  if (early && dom.cancel) dom.cancel();
  if (KIND[dom.kind].end) KIND[dom.kind].end();
  dom.fall = .001; lastT = E.T;
  sfx.blast(); shake(16);
}

/* ---------- two at once ---------- */
function lock(me, foe) {
  const p = E.P1, o = E.P2;
  if (me.cancel) me.cancel();                       // whatever his was in the middle of doing, it stops
  dom = me; rival = foe;
  clash = { t: 0, dur: CLASH_T, seam: 0, show: 0, side: p.x <= o.x ? -1 : 1, hpP: p.hp, hpO: o.hp };   // side: which half of the picture is his
  lastT = E.T; sfx.bf(); shake(26);
  E.after(.3, () => { if (clash) E.banner('領域の押し合い', 'DOMAIN CLASH', 'sm'); });
}
function tug(dt) {
  const c = clash, p = E.P1, o = E.P2;
  c.t += dt;
  c.seam = clamp(c.seam + Math.max(0, c.hpO - o.hp) / (o.max * PUSH_FOE) - Math.max(0, c.hpP - p.hp) / (p.max * PUSH_ME), -1, 1);    // every point of damage either way moves it
  c.hpO = o.hp; c.hpP = p.hp;
  c.show += (c.seam - c.show) * Math.min(1, dt * 8);
  if (Math.random() < dt * 5) sfx.hover();
  if (o.ko) settle(1); else if (p.dead) settle(-1);
  else if (Math.abs(c.seam) >= 1 || c.t >= c.dur) settle(c.seam > .03 ? 1 : c.seam < -.03 ? -1 : 0);
}
// it is decided. 1: his has swallowed theirs. -1: theirs has swallowed his. 0: neither gave, and both go
function settle(w) {
  const c = clash, me = dom, foe = rival, p = E.P1, o = E.P2, VW = E.VW, mid = seamAt(E.VH / 2, true), meLeft = c.side < 0;
  const gone = d => { if (KIND[d.kind].end) KIND[d.kind].end(); };
  clash = null; rival = null; lastT = E.T;
  sfx.blast(); sfx.bf(); shake(30);
  if (w > 0) {
    gone(foe); wreck = { rim: KIND[foe.kind].rim, f: .001, x0: meLeft ? mid : 0, x1: meLeft ? VW : mid };
    me.won = true; me.dur = Math.max(me.dur, me.t + WIN_T);
    E.banner('領域崩壊', 'THEIR DOMAIN BREAKS', 'sm');
    if (!o.ko) {                                    // and whoever was holding it up pays for that
      E.applyHit(o, o.x >= p.x ? 1 : -1, { dmg: o.max * BACKLASH / (o.dr || 1), kb: 300, stun: 1.4, stop: .2, heavy: 1, col: '#ffffff', fixed: 1 });
      if (o.ai) { o.ai.t = Math.max(o.ai.t, 1.6); if (o.ai.kt !== undefined) o.ai.kt = Math.max(o.ai.kt, 2.4); }
    }
  } else if (w < 0) {
    if (me.cancel) me.cancel();
    gone(me); wreck = { rim: KIND[me.kind].rim, f: .001, x0: meLeft ? 0 : mid, x1: meLeft ? mid : VW };
    dom = foe; foe.won = true; foe.dur = Math.max(foe.dur, foe.t + WIN_T);
    E.banner('領域崩壊', 'YOUR DOMAIN BREAKS', 'sm');
    Fi.chip(Math.round(p.max * BACKLASH), '#ffffff');
    if (JU.boss) JU.boss.seal(4);                   // his technique is burnt out for a moment
    E.fx.push({ k: 2, x: p.x, y: p.y + 390, n: 'TECHNIQUE BURNT OUT', col: '#c88', t: 0, life: 1.6 });
  } else {
    if (me.cancel) me.cancel();
    gone(me); gone(foe); me.fall = .001;            // the one shattering covers the whole picture
    E.banner('相殺', 'BOTH DOMAINS BREAK', 'sm');
  }
}
// where the seam runs. It leans a little, like the frames of the opening. In the picture as drawn, or (screen) as it ends up on the glass
function seamAt(y, screen) {
  const VW = E.VW, VH = E.VH, x = VW / 2 - clash.side * clash.show * VW * .47 + 64 - 128 * y / VH;
  return screen ? (x - VW / 2) * cam.zoom + VW / 2 : x;
}
function half(left, screen) {                       // the outline of one side of it
  const VW = E.VW, VH = E.VH, y0 = -700, y1 = VH + 900, far = left ? -4000 : VW + 4000, gy = E.GY - 120;
  const Y = y => (screen ? (y - gy) * cam.zoom + gy - cam.lift : y);
  g.beginPath(); g.moveTo(far, Y(y0)); g.lineTo(seamAt(y0, screen), Y(y0)); g.lineTo(seamAt(y1, screen), Y(y1)); g.lineTo(far, Y(y1)); g.closePath();
}
const sides = () => (clash.side < 0 ? [dom, rival] : [rival, dom]);     // whose is on the left, whose on the right
function split() {
  const VH = E.VH, s = sides(), ka = KIND[s[0].kind], kb = KIND[s[1].kind];
  g.save(); half(true); g.clip(); inside(ka); g.restore();
  g.save(); half(false); g.clip(); inside(kb); g.restore();
  g.lineJoin = 'miter'; g.beginPath();              // the seam: where the two barriers are grinding on each other
  for (let i = 0; i <= 16; i++) { const y = -200 + i * (VH + 500) / 16, x = seamAt(y) + (i % 2 ? 1 : -1) * rnd(3, 15); i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = `rgba(${ka.rim},.55)`; g.lineWidth = 22; g.stroke(); g.strokeStyle = `rgba(${kb.rim},.55)`; g.lineWidth = 12; g.stroke();
  g.globalCompositeOperation = 'source-over'; g.strokeStyle = '#fff'; g.lineWidth = 3.5; g.stroke();
}
function meter() {                                  // the tug of it, drawn under the health bars
  const c = clash, VW = E.VW, VH = E.VH, s = sides(), w = VW * .34, x0 = VW / 2 - w / 2, y = VH * .15, h = Math.max(8, VH * .017), mid = x0 + w * (.5 - c.side * c.show * .5);
  g.fillStyle = 'rgba(8,6,14,.82)'; g.fillRect(x0 - 5, y - 5, w + 10, h + 10);
  g.fillStyle = `rgb(${KIND[s[0].kind].rim})`; g.fillRect(x0, y, mid - x0, h);
  g.fillStyle = `rgb(${KIND[s[1].kind].rim})`; g.fillRect(mid, y, x0 + w - mid, h);
  g.fillStyle = '#fff'; g.fillRect(mid - 2.5, y - 7, 5, h + 14);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.strokeStyle = '#07060c';
  g.font = `${Math.round(VH * .034)}px Anton, Impact, sans-serif`; g.lineWidth = VH * .008;
  g.strokeText('DOMAIN CLASH  ·  ' + Math.ceil(c.dur - c.t), VW / 2, y - VH * .032); g.fillText('DOMAIN CLASH  ·  ' + Math.ceil(c.dur - c.t), VW / 2, y - VH * .032);
  g.font = `600 ${Math.round(VH * .018)}px sans-serif`; g.lineWidth = VH * .005; g.fillStyle = 'rgba(244,239,228,.85)';
  g.strokeText('DAMAGE PUSHES IT ACROSS', VW / 2, y + h + VH * .026); g.fillText('DAMAGE PUSHES IT ACROSS', VW / 2, y + h + VH * .026);
}
function pieces(rim, f, x0, x1) {                   // a barrier coming down in bits, between two edges of the screen
  const VH = E.VH, span = x1 - x0;
  g.fillStyle = `rgba(255,255,255,${.55 * (1 - f) ** 2})`; g.fillRect(x0, 0, span, VH);
  g.lineWidth = 2; g.strokeStyle = `rgba(${rim},.8)`; g.fillStyle = BLACK;
  for (const s of SHARDS) {
    const r = s[2] * (1 - f * .3);
    g.save(); g.translate(x0 + s[0] * span, s[1] * VH * .7 + f * f * VH * .9 * s[5]); g.rotate(s[3] + s[4] * f); g.globalAlpha = 1 - f;
    g.beginPath(); g.moveTo(-r, r * .5); g.lineTo(r * .9, r * .2); g.lineTo(-r * .1, -r); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  g.globalAlpha = 1;
}

/* ---------- what they do ---------- */
// Malevolent Shrine: embers off the blood, and cuts opening in the air on their own
function ashes(dt) {
  if (Math.random() < dt * 40) V.puff('red', cam.x + rnd(-800, 800), rnd(0, 60), 0, rnd(140, 320), rnd(20, 40), .8);
  if (Math.random() < dt * 5) JU.cut.slice(cam.x + rnd(-800, 800), rnd(30, 430), rnd(-1.4, 1.4), rnd(200, 520), { shift: 4, w: .6 });
}
// ...and once it has won a clash there is nothing left to stop it cutting
function reap(dt, o, d) {
  if (o.ko || (d.cuts || 0) >= 15 || (d.cutT = (d.cutT || 0) - dt) > 0) return;
  d.cutT = .22; d.cuts = (d.cuts || 0) + 1;
  JU.cut.storm(cam.x, 3, d.cuts % 5 === 0); sfx.cut(.9);
  if (o.state !== 'down') { E.applyHit(o, o.x >= E.P1.x ? 1 : -1, { dmg: 7, kb: 40, stun: .5, stop: .02, col: RED }); JU.cut.dice(o, 2, 300); }
}
// the same thing, when it is somebody else's and he is the one standing in it
function flay(dt, p, d) {
  if ((d.cutT = (d.cutT || 0) - dt) > 0) return;
  d.cutT = .4;
  JU.cut.dice(p, 2, 300); JU.cut.storm(cam.x, 1);
  Fi.chip(2, RED);
}
// Unlimited Void: it can do nothing at all
function stillness(o) {
  if (o.ko) return;
  if (o.state === 'idle' || o.state === 'act' || o.state === 'up') Object.assign(o, { state: 'hurt', stun: .4, act: null, tele: 0 });
  o.flash = .06;
}
// ... because everything there is to know is arriving in its head at once
function knowing(o) {
  const c = F(o.x, o.y + 285 * (o.scale || 1)), k = c[2];
  g.strokeStyle = 'rgba(190,230,255,.8)'; g.lineWidth = 3;
  g.beginPath(); g.ellipse(c[0], c[1] - 34 * k, 46 * k, 13 * k, 0, E.T * 4, E.T * 4 + 4.6); g.stroke();
  g.lineWidth = 1.5; g.strokeStyle = 'rgba(190,230,255,.35)'; g.beginPath();
  for (let i = 0; i < 7; i++) { const a = i * .9 + E.T * 1.3, d = 150 + 60 * Math.sin(E.T * 3 + i); g.moveTo(c[0] + Math.cos(a) * d * k, c[1] + Math.sin(a) * d * .6 * k); g.lineTo(c[0] + Math.cos(a) * 26 * k, c[1] + Math.sin(a) * 16 * k); }
  g.stroke();
}

const under0 = H.under, fx0 = H.fx, post0 = H.post, tick0 = H.tick, awaken0 = H.awaken, reset0 = H.reset, start0 = H.fightStart;
H.under = dt => {                                   // the barrier goes down first, so everything that lies on the floor is drawn over it
  if (clash) split();
  else if (dom && !dom.fall) inside(KIND[dom.kind]);
  else if (!dom && D.busy && D.time >= D.T.shut) rising(D.time);
  under0(dt);
};
H.fx = dt => {
  fx0(dt);
  const k = dom && !dom.fall && !clash && mine(dom) && KIND[dom.kind];
  if (k && k.fx && !E.P2.ko) k.fx(E.P2);
};
H.post = dt => {
  post0(dt);
  const VW = E.VW, VH = E.VH, real = E.T - lastT;
  lastT = E.T;
  if (wreck) { wreck.f = Math.min(1, wreck.f + real / .7); pieces(wreck.rim, wreck.f, wreck.x0, wreck.x1); if (wreck.f >= 1) wreck = null; }
  if (!dom) return;
  if (clash) {                                      // each one's colour lying over its own half, and the tug between them
    if (D.busy) return;
    const s = sides(), a = .2 + .04 * Math.sin(E.T * 5);
    g.fillStyle = `rgba(${KIND[s[0].kind].tint},${a})`; half(true, true); g.fill();
    g.fillStyle = `rgba(${KIND[s[1].kind].tint},${a})`; half(false, true); g.fill();
    meter();
    return;
  }
  const k = KIND[dom.kind];
  if (!dom.fall) {                                  // the colour of the place lying over everything in it
    if (!D.busy) { g.fillStyle = `rgba(${k.tint},${(.2 + .04 * Math.sin(E.T * 5)) * clamp(dom.t * 2, 0, 1)})`; g.fillRect(0, 0, VW, VH); }
    return;
  }
  dom.fall = Math.min(1, dom.fall + real / .7);     // breaking: a flash, and the pieces of the barrier falling away
  pieces(k.rim, dom.fall, 0, VW);
  if (dom.fall >= 1) dom = null;
};
H.tick = dt => {
  tick0(dt);
  if (voidCd > 0) voidCd -= dt;
  if (!dom || dom.fall) return;
  if (clash) { tug(dt); return; }
  const o = E.P2, p = E.P1, k = KIND[dom.kind], foe = !mine(dom);
  dom.t += dt;
  if (foe) { if (k.foe) k.foe(dt, p, dom); } else if (k.tick) k.tick(dt, o, dom);
  if (dom.t >= dom.dur || (o.ko && dom.t > .4) || (foe && p.dead)) drop(!foe && o.ko);
};
H.awaken = p => {
  if (D.busy || clash) return;
  if (dom && !dom.fall && mine(dom)) { drop(true); return; }   // G while a domain of his own is open lets it go
  const K = JU.clan.active, t = JU.tech.active;
  if (!(K && K.id === 'gojo' && t && t.id === 'limitless')) return awaken0(p);
  if (voidCd > 0) { E.fx.push({ k: 2, x: p.x, y: p.y + 390, n: 'Domain: ' + Math.ceil(voidCd) + 's', col: '#8fb7c8', t: 0, life: 1.1 }); return; }
  if (!p.ground || p.move || p.ps || p.dead || E.P2.ko) return;
  voidCd = JU.training.on ? 0 : 30; p.inv = Math.max(p.inv, 1);   // no waiting in Training
  D.open({ who: p, tone: 'blue', skin: JU.cast.GOJO, kind: 'void',
    reveal() { raise('void', { who: p, dur: 6 }); E.after(.25, () => { if (!clash) E.banner('無量空処', 'UNLIMITED VOID', 'sm'); }); } });
};
H.reset = () => { reset0(); dom = rival = clash = wreck = null; voidCd = 0; };
H.fightStart = (cfg, wave) => { dom = rival = clash = wreck = null; start0(cfg, wave); };

const brief = d => d && { kind: d.kind, mine: mine(d), t: +d.t.toFixed(2), dur: d.dur, fall: d.fall, won: !!d.won };
Object.assign(D, { raise, drop, kinds: KIND, kind(name, def) { KIND[name] = def; } });
Object.defineProperty(D, 'up', { get: () => !!dom && !dom.fall });
Object.defineProperty(D, 'now', { get: () => (dom && !dom.fall && !clash && mine(dom) ? dom.kind : null) });    // his own domain, standing and doing what it does
Object.defineProperty(D, 'foe', { get: () => (dom && !dom.fall && !clash && !mine(dom) ? dom.kind : null) });   // an enemy's, standing over him
Object.defineProperty(D, 'clashing', { get: () => !!clash });
Object.defineProperty(D, 'clock', { get: () => (dom ? dom.t : 0) });                                             // and for how long
Object.defineProperty(D, 'state', { get: () => ({ dom: brief(dom), rival: brief(rival), clash: clash && { t: +clash.t.toFixed(2), seam: +clash.seam.toFixed(3), side: clash.side } }) });
})();
