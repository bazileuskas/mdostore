/* JUJUTSU UNLIMITEDS — Domain Update 1: how a Domain Expansion opens.
   A slanted panel snaps across the screen with the caster in close-up between the words DOMAIN and EXPANSION, a shock runs out
   from where they stand, the panel shuts, and then the barrier closes in from the edges of the screen until everything is white.
   The fight is frozen for all of it. JU.domain.open({ who, tone, skin, reveal, done }) plays it: `skin` is who the close-up shows
   (the caster as they are, unless given), and `reveal` runs under the white-out.
   Two domains opened against each other get a frame each: `vs: { who, tone, skin }` puts the second caster's under the first, with a sliver
   of the fight showing between the two. (`kind`, when given, says which domain is about to be raised: see clash.js) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, H = E.hooks, cam = E.cam, sfx = JU.sfx, root = E.root;
const { clamp, rnd, ease } = E, TAU = Math.PI * 2;

const TILT = -.122;                                 // the panel rises to the right, about seven degrees
const SIGN = [-.04, -.08, 1.72, 1.48, .32, -.32, 0];   // head back, both hands brought together under the chin
// seconds: panel in · the close-up has turned to face us · panel starts to shut · gone · the barrier closes in · white · the fight resumes · clear
const T_IN = .05, T_FACE = .32, T_HOLD = 1.15, T_SHUT = 1.28, T_FOG = 1.55, T_WHITE = 1.95, T_BACK = 2.05, T_END = 2.65;
// what is behind the caster in the panel: a deep sky, two kinds of cloud, and rings of light
const TONES = {
  blue: { sky: ['#03061a', '#102a66', '#040818'], a: 'white', b: 'blue', ring: 'rgba(170,215,255,' },
  red: { sky: ['#0d0204', '#5a0a16', '#0a0103'], a: 'fire', b: 'red', ring: 'rgba(255,170,150,' },
  purple: { sky: ['#07031a', '#34186e', '#06021a'], a: 'white', b: 'purple', ring: 'rgba(210,190,255,' },
  green: { sky: ['#02100a', '#0d4a2a', '#020d08'], a: 'white', b: 'green', ring: 'rgba(190,255,200,' },
  teal: { sky: ['#02100d', '#0d4a40', '#020d0b'], a: 'white', b: 'teal', ring: 'rgba(180,255,235,' },
  gold: { sky: ['#0e0902', '#5a4310', '#0b0702'], a: 'white', b: 'gold', ring: 'rgba(255,235,170,' }
};
let on = null, lastT = 0;

// one caster's frame: who is in it, which way they face, and the sky behind them
const frame = (o, p) => ({ who: p, face: p.face, tone: TONES[o.tone] || TONES.blue,
  port: { skin: o.skin || p.skin, x: 0, y: 0, face: p.face, spin: 1, scale: 1, pose: SIGN },
  clouds: Array.from({ length: 16 }, () => [rnd(-1, 1), rnd(-1, 1), rnd(.5, 1.3), rnd(0, TAU), Math.random() < .6]),
  lines: Array.from({ length: 12 }, () => [Math.random(), rnd(-1, 1), rnd(.5, 1.6)]) });

function open(o) {
  if (on) return false;
  const p = o.who;
  on = { t: 0, who: p, frames: [frame(o, p)], reveal: o.reveal, done: o.done, shown: false,
    fog: Array.from({ length: 26 }, (_, i) => [i % 2 ? 1 : -1, Math.random(), rnd(.7, 1.3), rnd(0, .3)]) };
  if (o.vs) on.frames.push(frame(o.vs, o.vs.who));
  lastT = E.T;
  for (const f of on.frames) { f.who.pose = SIGN.slice(); f.who.target = SIGN; f.who.vx = 0; }
  E.stop(.1); E.zoomIn(T_FOG);
  root.classList.add('dom');
  sfx.bf(); sfx.charge();
  if (!JU.reduceMotion) cam.shake = Math.max(cam.shake, o.vs ? 26 : 16);
  return true;
}

function word(s, x, y, a, VH) {
  g.save(); g.translate(x, y); g.rotate(-TILT); g.globalAlpha = a;
  g.font = `${Math.round(VH * .062)}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  if ('letterSpacing' in g) g.letterSpacing = '3px';
  g.lineJoin = 'round'; g.lineWidth = VH * .014; g.strokeStyle = '#07060c'; g.strokeText(s, 0, 0);
  g.fillStyle = '#fff'; g.fillText(s, 0, 0);
  g.restore();
}

// the caster drawn large: seen from behind at first, turning to face us as the view climbs from the chest to the eyes
function portrait(d, t, H0) {
  const f = d.port, e = ease(clamp((t - T_IN) / (T_FACE - T_IN), 0, 1)), hold = clamp((t - T_FACE) / (T_HOLD - T_FACE), 0, 1);
  const q = E.P(0, 0, E.ZP), k = E.K * q[2], S = H0 * 1.9 / (50 * k) * (1 + .08 * hold);
  f.spin = -Math.cos(Math.PI * e) || .001;
  g.save();
  g.translate(d.face * (hold * 16 - 8), H0 * .12);
  g.rotate(-d.face * .3 - TILT);                    // chin up, looking down at whoever is watching
  g.scale(S, S);
  g.translate(-q[0], (167 - 62 * (1 - e)) * k - q[1]);     // puts the head (or, to begin with, the chest) at the middle of the panel
  E.drawFighter(f);
  g.restore();
}

// one frame, centred on cy. top / bottom: whether DOMAIN sits on its upper edge and EXPANSION on its lower one
function panel(d, t, h, H0, VW, VH, cy, top, bottom) {
  const tone = d.tone, L = VW;
  g.save();
  g.translate(VW / 2, cy); g.rotate(TILT);
  g.save();
  g.beginPath(); g.rect(-L, -h, L * 2, h * 2); g.clip();
  const gr = g.createLinearGradient(-VW / 2, 0, VW / 2, 0);
  gr.addColorStop(0, tone.sky[0]); gr.addColorStop(.5, tone.sky[1]); gr.addColorStop(1, tone.sky[2]);
  g.fillStyle = gr; g.fillRect(-L, -H0, L * 2, H0 * 2);
  g.globalCompositeOperation = 'lighter';
  for (const c of d.clouds) E.glow(E.GLOW[c[4] ? tone.a : tone.b], c[0] * VW * .6 + Math.sin(t * .7 + c[3]) * 18, c[1] * H0 * .9, c[2] * H0 * 2.2, c[4] ? .55 : .8);
  g.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    g.strokeStyle = tone.ring + (.26 - i * .04) + ')';
    g.beginPath(); g.ellipse(-d.face * VW * .3, 0, H0 * (1 + i * .6), H0 * (1.5 + i * .8), 0, 0, TAU); g.stroke();
  }
  g.strokeStyle = 'rgba(255,255,255,.3)';                                              // streaks racing along the panel
  for (const s of d.lines) {
    const x = ((s[0] + t * s[2] * 1.4) % 1 * 2.4 - 1.2) * VW * .5 * -d.face;
    g.lineWidth = s[2] * 2; g.beginPath(); g.moveTo(x, s[1] * H0); g.lineTo(x + VW * .09 * s[2], s[1] * H0); g.stroke();
  }
  g.globalCompositeOperation = 'source-over';
  const wa = 1 - clamp((t - .03) / .08, 0, 1);                                         // it arrives as a bar of solid white
  if (wa > 0) { g.fillStyle = `rgba(255,255,255,${wa})`; g.fillRect(-L, -H0, L * 2, H0 * 2); }
  portrait(d, t, H0);
  g.restore();
  g.fillStyle = '#fff'; g.fillRect(-L, -h - 3, L * 2, 5); g.fillRect(-L, h - 2, L * 2, 5);
  const ta = Math.min(1, t / .05) * (1 - clamp((t - .72) / .36, 0, 1));
  if (ta > 0) { if (top) word('DOMAIN', -VW * .17, -h + 4, ta, VH); if (bottom) word('EXPANSION', VW * .15, h - 6, ta, VH); }
  g.restore();
}

function draw() {
  const d = on, VW = E.VW, VH = E.VH, two = d.frames.length > 1, H0 = VH * (two ? .14 : .19), t = (d.t += E.T - lastT);
  lastT = E.T;
  if (t < T_BACK) E.stop(.05);                      // the fight holds its breath until the domain is up
  g.save();
  if (t < .3) for (const fr of d.frames) {          // the shock: a dome of force thrown out from where each caster stands
    const p = fr.who, c = F(p.x, p.y + 150), gy = E.GY - 120, sx = VW / 2 + (c[0] - VW / 2) * cam.zoom, sy = gy + (c[1] - gy) * cam.zoom - cam.lift;
    const u = t / .3, r = ease(u) * VW * .95, a = 1 - u;
    g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.white, sx, sy - 60, 1100 * (1 - u * .5), a); g.globalCompositeOperation = 'source-over';
    g.fillStyle = `rgba(255,255,255,${.16 * a})`; g.beginPath(); g.arc(sx, sy + 150, r, Math.PI, TAU); g.fill();
    g.strokeStyle = `rgba(255,255,255,${.85 * a})`; g.lineWidth = 5;
    g.beginPath(); g.arc(sx, sy + 150, r, Math.PI, TAU); g.stroke();
    g.beginPath(); g.ellipse(sx, sy + 150, r, r * .22, 0, 0, TAU); g.stroke();
  }
  const h = H0 * Math.min(1, t / .04) * (t > T_HOLD ? 1 - ease(clamp((t - T_HOLD) / (T_SHUT - T_HOLD), 0, 1)) : 1);
  if (t < T_SHUT && h > .5) {
    if (two) { panel(d.frames[0], t, h, H0, VW, VH, VH * .225, true, false); panel(d.frames[1], t, h, H0, VW, VH, VH * .525, false, true); }   // one above the other, a sliver of the fight between them
    else panel(d.frames[0], t, h, H0, VW, VH, VH * .37, true, true);
  }
  if (t >= T_FOG) {                                 // the barrier closing in from both sides, and the white it leaves behind
    const u = clamp((t - T_FOG) / (T_WHITE - T_FOG), 0, 1), back = 1 - clamp((t - T_BACK) / (T_END - T_BACK), 0, 1);
    if (t < T_WHITE) for (const b of d.fog) {
      const e = clamp((u - b[3]) / (1 - b[3]), 0, 1), r = VW * (.1 + .85 * e * e) * b[2], x = VW / 2 + b[0] * VW * (.62 - .5 * e * e);
      E.glow(E.GLOW.white, x, b[1] * VH, r * 2, 1); E.glow(E.GLOW.white, x, b[1] * VH, r * 1.2, 1);
    }
    g.fillStyle = `rgba(255,255,255,${t < T_WHITE ? clamp((u - .6) / .4, 0, 1) : back})`; g.fillRect(0, 0, VW, VH);
  }
  g.restore();
  if (t >= T_WHITE && !d.shown) { d.shown = true; if (d.reveal) d.reveal(); }
  if (t >= T_BACK) root.classList.remove('dom');
  if (t >= T_END) { on = null; if (d.done) d.done(); }
}

const post0 = H.post, reset0 = H.reset;
H.post = dt => { post0(dt); if (on) draw(); };
H.reset = () => { reset0(); on = null; root.classList.remove('dom'); };

JU.domain = { open, SIGN, TONES, T: { shut: T_SHUT, white: T_WHITE },
  get busy() { return !!on; }, get time() { return on ? on.t : -1; }, get who() { return on ? on.who : null; },
  get vs() { return on && on.frames[1] ? on.frames[1].who : null; } };   // the second caster, when two are opening at once
})();
