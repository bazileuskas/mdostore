/* JUJUTSU UNLIMITEDS — Domain Update 2: the black barrier, what is inside each domain, and letting one go early.
   JU.domain.raise(kind, { who, dur, cancel }) puts a domain up once its opening has whited out; JU.domain.drop() shatters it.
   G while a domain is open drops it. Unlimited Void can be opened in a fight: Gojo clan with Limitless, G. */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, box = E.box, H = E.hooks, cam = E.cam, V = JU.vfx, sfx = JU.sfx, D = JU.domain;
const { clamp, rnd, ease, ZP } = E, TAU = Math.PI * 2, BLACK = '#04030a';
// each domain: the colour of its barrier, the colour it lays over the fight, what stands inside it, and what it does while it is open.
// bare: it paints a sky of its own. JU.domain.kind(name, def) adds another
const KIND = {
  shrine: { rim: '255,60,80', tint: '120,0,16', inside: () => shrine(), tick: dt => ashes(dt) },
  void: { rim: '150,215,255', tint: '10,40,110', bare: true, inside() { JU.maki.voidStage.sky(); JU.maki.voidStage.floor(); }, tick: (dt, o) => stillness(o), fx: o => knowing(o) }
};
const SHARDS = Array.from({ length: 28 }, () => [Math.random(), Math.random(), rnd(40, 130), rnd(0, TAU), rnd(-3, 3), rnd(.6, 1.4)]);
const SKULLS = Array.from({ length: 24 }, (_, i) => [(i % 2 ? 1 : -1) * rnd(300, 760), rnd(0, 60), ZP + rnd(150, 470), rnd(.9, 1.7)]).sort((a, b) => b[2] - a[2]);
let dom = null, voidCd = 0, lastT = 0;

/* ---------- the barrier ---------- */
// while the opening plays: a black dome swelling out from the caster until it has swallowed the arena
function rising(t) {
  const c = F(D.who.x, 0), r = ease(clamp((t - D.T.shut) / (D.T.white - D.T.shut), 0, 1)) * E.VW * 1.25;
  g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.ellipse(c[0], c[1], r, r * .2, 0, 0, TAU); g.fill();
  g.fillStyle = BLACK; g.beginPath(); g.arc(c[0], c[1], r, Math.PI, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 5; g.beginPath(); g.arc(c[0], c[1], r, Math.PI, TAU); g.stroke();
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
function raise(kind, o) { dom = Object.assign({ kind, t: 0, dur: 5, fall: 0 }, o); lastT = E.T; }
function drop(early) {
  if (!dom || dom.fall) return;
  if (early && dom.cancel) dom.cancel();
  if (KIND[dom.kind].end) KIND[dom.kind].end();
  dom.fall = .001; lastT = E.T;
  sfx.blast(); if (!JU.reduceMotion) cam.shake = Math.max(cam.shake, 16);
}

const under0 = H.under, fx0 = H.fx, post0 = H.post, tick0 = H.tick, awaken0 = H.awaken, reset0 = H.reset, start0 = H.fightStart;
H.under = dt => {                                   // the barrier goes down first, so everything that lies on the floor is drawn over it
  if (dom && !dom.fall) {
    const k = KIND[dom.kind];
    if (k.bare) { k.inside(); shell(k.rim, false); } else { shell(k.rim, true); k.inside(); }
  } else if (!dom && D.busy && D.time >= D.T.shut) rising(D.time);
  under0(dt);
};
// Malevolent Shrine: embers off the blood, and cuts opening in the air on their own
function ashes(dt) {
  if (Math.random() < dt * 40) V.puff('red', cam.x + rnd(-800, 800), rnd(0, 60), 0, rnd(140, 320), rnd(20, 40), .8);
  if (Math.random() < dt * 14) V.slash(cam.x + rnd(-800, 800), rnd(30, 430), rnd(0, TAU), rnd(200, 520), '#ff2440', rnd(3, 7));
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
H.fx = dt => {
  fx0(dt);
  const k = dom && !dom.fall && KIND[dom.kind];
  if (k && k.fx && !E.P2.ko) k.fx(E.P2);
};
H.post = dt => {
  post0(dt);
  if (!dom) return;
  const VW = E.VW, VH = E.VH, k = KIND[dom.kind], real = E.T - lastT;
  lastT = E.T;
  if (!dom.fall) {                                  // the colour of the place lying over everything in it
    if (!D.busy) { g.fillStyle = `rgba(${k.tint},${(.2 + .04 * Math.sin(E.T * 5)) * clamp(dom.t * 2, 0, 1)})`; g.fillRect(0, 0, VW, VH); }
    return;
  }
  const f = dom.fall = Math.min(1, dom.fall + real / .7);                        // breaking: a flash, and the pieces of the barrier falling away
  g.fillStyle = `rgba(255,255,255,${.55 * (1 - f) ** 2})`; g.fillRect(0, 0, VW, VH);
  g.lineWidth = 2; g.strokeStyle = `rgba(${k.rim},.8)`; g.fillStyle = BLACK;
  for (const s of SHARDS) {
    const r = s[2] * (1 - f * .3);
    g.save(); g.translate(s[0] * VW, s[1] * VH * .7 + f * f * VH * .9 * s[5]); g.rotate(s[3] + s[4] * f); g.globalAlpha = 1 - f;
    g.beginPath(); g.moveTo(-r, r * .5); g.lineTo(r * .9, r * .2); g.lineTo(-r * .1, -r); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  g.globalAlpha = 1;
  if (f >= 1) dom = null;
};
H.tick = dt => {
  tick0(dt);
  if (voidCd > 0) voidCd -= dt;
  if (!dom || dom.fall) return;
  const o = E.P2;
  dom.t += dt;
  if (KIND[dom.kind].tick) KIND[dom.kind].tick(dt, o);
  if (dom.t >= dom.dur || (o.ko && dom.t > .4)) drop(o.ko);
};
H.awaken = p => {
  if (D.busy) return;
  if (dom) { drop(true); return; }                  // G while a domain is open lets it go
  const K = JU.clan.active, t = JU.tech.active;
  if (!(K && K.id === 'gojo' && t && t.id === 'limitless')) return awaken0(p);
  if (voidCd > 0) { E.fx.push({ k: 2, x: p.x, y: p.y + 390, n: 'Domain: ' + Math.ceil(voidCd) + 's', col: '#8fb7c8', t: 0, life: 1.1 }); return; }
  if (!p.ground || p.move || p.ps || p.dead || E.P2.ko) return;
  voidCd = JU.training.on ? 0 : 30; p.inv = Math.max(p.inv, 1);   // no waiting in Training
  D.open({ who: p, tone: 'blue', skin: JU.cast.GOJO,
    reveal() { raise('void', { who: p, dur: 6 }); E.after(.25, () => E.banner('無量空処', 'UNLIMITED VOID', 'sm')); } });
};
H.reset = () => { reset0(); dom = null; voidCd = 0; };
H.fightStart = (cfg, wave) => { dom = null; start0(cfg, wave); };

Object.assign(D, { raise, drop, kind(name, def) { KIND[name] = def; } });
Object.defineProperty(D, 'up', { get: () => !!dom && !dom.fall });
Object.defineProperty(D, 'now', { get: () => (dom && !dom.fall ? dom.kind : null) });   // which domain is open, if any
Object.defineProperty(D, 'clock', { get: () => (dom ? dom.t : 0) });                    // and for how long
})();
