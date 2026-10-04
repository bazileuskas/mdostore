/* JUJUTSU UNLIMITEDS — Self-Embodiment of Perfection: the domain that comes with Transfiguration.
   Inside it a touch leaves a mark, and the next blow on anything marked kills it outright. It has to be earned: its bar fills only when something dies */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, H = E.hooks, cam = E.cam, V = JU.vfx, sfx = JU.sfx, D = JU.domain, T = JU.tech.TECH.trans;
const { rnd, ZP } = E, TAU = Math.PI * 2, TEAL = '#78e6c8';
const SET = .35, KILL = 30, BOSS = 45;              // seconds before a fresh mark can kill; how much of the bar a curse and a boss are worth
const here = () => D.now === 'perfection';

/* ---------- what you hear in there ----------
   The game has no recording of its own. If sounds/mahito-domain.mp3 has been put there it is looped; otherwise a drone is built on the spot */
const music = (() => {
  let ctx = null, live = null, file = null, noFile = false, on = false;
  const muted = () => { const b = document.getElementById('sfx'); return !!b && b.getAttribute('aria-pressed') === 'false'; };
  function drone() {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime, out = ctx.createGain(), low = ctx.createBiquadFilter(), parts = [];
      out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(.17, t + 1.2); out.connect(ctx.destination);
      low.type = 'lowpass'; low.frequency.value = 420; low.connect(out);
      const voice = (f, type, vol, to) => { const o = ctx.createOscillator(), v = ctx.createGain(); o.type = type; o.frequency.value = f; v.gain.value = vol; o.connect(v); v.connect(to); o.start(t); parts.push(o); return v; };
      voice(55, 'sawtooth', .5, low); voice(55.6, 'sawtooth', .5, low); voice(82.4, 'triangle', .35, low); voice(116.5, 'sine', .22, low);   // a low fifth with something sour leaning on it
      const high = voice(932, 'sine', .02, out), wob = ctx.createOscillator(), depth = ctx.createGain();                                     // a thin tone above, coming and going
      wob.frequency.value = .35; depth.gain.value = .03; wob.connect(depth); depth.connect(high.gain); wob.start(t); parts.push(wob);
      const beat = voice(46, 'sine', 0, out);                                                                                                 // and something like a pulse underneath
      const pulse = setInterval(() => { const n = ctx.currentTime; beat.gain.cancelScheduledValues(n); beat.gain.setValueAtTime(.5, n); beat.gain.exponentialRampToValueAtTime(.001, n + .28); }, 950);
      live = { out, parts, pulse };
    } catch (e) {}
  }
  function fallback() { noFile = true; if (on && !live) drone(); }
  // a file that will not load is reported by its own error event, which moves on to the next name; only being refused outright falls back to the drone here
  function play() { try { file.currentTime = 0; const pl = file.play(); if (pl && pl.catch) pl.catch(e => { if (e && e.name === 'NotAllowedError') fallback(); }); } catch (e) { fallback(); } }
  return {
    start() {
      if (muted()) return;
      on = true;
      if (noFile) { drone(); return; }
      if (!file) {                                  // whichever of these the player has put there: the first one that loads is the one that plays
        const list = [window.JU_SOUNDS && window.JU_SOUNDS['mahito-domain'], ...['mp3', 'm4a', 'ogg', 'wav'].map(x => 'sounds/mahito-domain.' + x)].filter(Boolean);
        let i = 0;
        file = new Audio(list[0]); file.loop = true; file.volume = .7;
        file.addEventListener('error', () => { if (++i < list.length) { file.src = list[i]; if (on) play(); } else fallback(); });
      }
      play();
    },
    stop() {
      on = false;
      if (file) try { file.pause(); } catch (e) {}
      if (!live) return;
      const { out, parts, pulse } = live, t = ctx.currentTime;
      live = null; clearInterval(pulse);
      out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(0, t + .6);
      setTimeout(() => { for (const p of parts) try { p.stop(); } catch (e) {} }, 800);
    }
  };
})();

/* ---------- what stands in it: two great hands closed over the arena like a cage, and a floor sewn together out of pieces ---------- */
const FINGERS = [[-1, 620, 1], [-1, 820, .9], [-1, 1020, .78], [1, 620, 1], [1, 820, .9], [1, 1020, .78]];
function cage() {
  const HY = E.HY, VW = E.VW, z = ZP + 420, mid = P(0, 300, z);
  g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.teal, mid[0], mid[1], VW * .85, .32 + .05 * Math.sin(E.T * 2)); g.globalCompositeOperation = 'source-over';
  g.lineCap = 'round';
  for (const f of FINGERS) {
    const s = f[0], a = P(s * f[1], 0, z), b = P(s * (f[1] - 60), 520 * f[2], z), c = P(s * (f[1] - 430), 640 * f[2], z), w = 86 * a[2] * f[2];
    for (const [lw, col] of [[w + 8, '#050d0b'], [w, '#17362f']]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0], b[1], c[0], c[1]); g.stroke(); }
    g.strokeStyle = 'rgba(120,230,200,.3)'; g.lineWidth = 2;
    for (const u of [.35, .62]) {                   // the creases of the knuckles
      const v = 1 - u, x = v * v * a[0] + 2 * v * u * b[0] + u * u * c[0], y = v * v * a[1] + 2 * v * u * b[1] + u * u * c[1];
      g.beginPath(); g.moveTo(x - w * .4, y); g.lineTo(x + w * .4, y); g.stroke();
    }
  }
  g.lineCap = 'butt';
  g.fillStyle = 'rgba(10,70,58,.4)'; g.fillRect(-300, HY, VW + 600, E.VH - HY + 500);
  g.strokeStyle = 'rgba(120,230,200,.3)'; g.lineWidth = 2; g.beginPath();                 // seams, with their stitches
  for (let i = -3; i <= 3; i++) for (let j = 0; j < 9; j++) {
    const zz = Math.max(E.ZNEAR, ZP - 260) + j * 90, a = P(i * 300 - 16, 0, zz), b = P(i * 300 + 16, 0, zz + 40);
    g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]);
  }
  g.stroke();
}
// the mark itself, on whatever has been touched: its outline will not hold still, and it has been sewn shut
function brand(o) {
  if (o.mark === undefined || o.ko) return;
  const c = F(o.x, o.y + 170 * (o.scale || 1)), k = c[2];
  g.strokeStyle = TEAL; g.lineWidth = 4; g.beginPath();
  for (let i = 0; i <= 16; i++) { const a = i / 16 * TAU, r = (72 + 12 * Math.sin(a * 5 + E.T * 12)) * k; i ? g.lineTo(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r) : g.moveTo(c[0] + r, c[1]); }
  g.stroke();
  g.lineWidth = 3; g.beginPath(); g.moveTo(c[0] - 40 * k, c[1]); g.lineTo(c[0] + 40 * k, c[1]);
  for (let i = -2; i <= 2; i++) { g.moveTo(c[0] + i * 16 * k - 5 * k, c[1] - 9 * k); g.lineTo(c[0] + i * 16 * k + 5 * k, c[1] + 9 * k); }
  g.stroke();
}
D.kind('perfection', { rim: '120,230,200', tint: '6,60,50', inside: cage, fx: brand,
  tick(dt) { if (Math.random() < dt * 30) V.puff('teal', cam.x + rnd(-800, 800), rnd(0, 320), 0, rnd(40, 120), rnd(16, 30), 1); },
  end() { E.P2.mark = undefined; music.stop(); } });

/* ---------- the touch, and the second touch ---------- */
const pow0 = H.power, hit0 = H.hit, ko0 = H.ko, reset0 = H.reset;
H.power = (h, o) => {
  const k = pow0(h, o);
  if (!here() || o.mark === undefined || o.ko || D.clock - o.mark < SET || !(h.dmg > 0)) return k;
  return Math.max(k, (o.hp + 1) / (h.dmg * (o.dr || 1)));                 // marked, and touched again: whatever it had left is gone
};
H.hit = (o, face, h) => {
  hit0(o, face, h);
  if (!here()) return;
  const y = o.y + 170 * (o.scale || 1);
  if (o.hp <= 0) { V.sparks(o.x, y, 'teal', 26); V.ring(o.x, y, 320, TEAL, .5); E.fx.push({ k: 2, x: o.x, y: y + 150, n: '無為転変', col: TEAL, t: 0, life: 1.2 }); }
  else if (o.mark === undefined) { o.mark = D.clock; V.ring(o.x, y, 150, TEAL, .35); sfx.charge(); E.fx.push({ k: 2, x: o.x, y: y + 150, n: 'MARKED', col: TEAL, t: 0, life: 1.1 }); }
};
// it is paid for in kills: three or four of them fill the bar
H.ko = o => { const res = ko0(o); if (JU.tech.active === T && JU.fights.fight.cfg) JU.tech.charge(o.ai && o.ai.d.kit ? BOSS : KILL); return res; };
H.reset = () => { reset0(); music.stop(); };

Object.assign(T, { awkStart: 0, awkHits: false, awkName: 'Domain',
  awaken(p) {
    p.inv = Math.max(p.inv, 1);
    D.open({ who: p, tone: 'teal', skin: JU.cast2.MAHITO, reveal() {
      D.raise('perfection', { who: p, dur: 9 }); music.start();
      E.after(.25, () => E.banner('自閉円頓裹', 'SELF-EMBODIMENT OF PERFECTION', 'xs'));
    } });
  } });
})();
