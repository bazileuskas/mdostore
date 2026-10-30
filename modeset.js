/* JUJUTSU UNLIMITEDS — Build 0.22v2: what the techniques with modes share (tdced2.js, lovereap.js).
   script(): a move written as timed steps. find(): combos, read off what was pressed lately (each press within a window of the one before).
   And the manga's way of showing a blow, which the user asked for ("better sfx and vfx ... like from the anime and manga"): focus lines
   (集中線) closing on the point of it, the sound written into the picture (ドォン), and impact frames (the picture gone to black and white
   for a moment, the two of them in silhouette) */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, sfx = JU.sfx;
const { rnd } = E, TAU = Math.PI * 2;
const play = (name, vol, alt) => { if (!sfx.file(name, vol) && alt) alt(); };      // a clip (myinstants online, sounds/home-* at home), or a built one

/* ================= a move as timed steps =================
   steps: [t, fn(p, o, m)] once when its clock passes t; [t0, t1, fn(p, o, m, u, dt)] every frame between t0 and t1 (u from 0 to 1).
   o: { poses: [[t, pose], ...] (the last one whose t has passed), hover (held up in the air while it lasts), inv (untouchable for all of it),
        face (false: he keeps the way he is facing), keepVx (the steps move him: his speed is not zeroed each frame), start(p, o, m) } */
function script(name, dur, steps, o = {}) {
  return Object.assign({ name, dur: dur + .1, scripted: 1, run(p, m, t) {
    const q = E.P2, dt = t - (m.lt === undefined ? t : m.lt);
    m.lt = t;
    if (!m.s) { m.s = 1; m.did = new Set(); if (o.face !== false && q && !q.ko) p.face = q.x >= p.x ? 1 : -1; if (o.inv) p.inv = Math.max(p.inv || 0, dur); if (o.start) o.start(p, q, m); }
    if (!o.keepVx && !m.mv) p.vx = 0;
    m.mv = 0;
    if (o.hover && !m.drop) { p.vy = Math.max(p.vy, 0); if (p.y > 1) p.ground = false; }
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if (s.length === 2) { if (t >= s[0] && !m.did.has(i)) { m.did.add(i); s[1](p, q, m); } }
      else if (t >= s[0] && t < s[1]) s[2](p, q, m, (t - s[0]) / (s[1] - s[0]), dt);
    }
    if (o.poses) { let ps = null; for (const k of o.poses) if (t >= k[0]) ps = k[1]; if (ps) p.target = typeof ps === 'string' ? POSE[ps] : ps; }
    p.rate = o.rate || 40;
    if (t >= dur) E.endMove(p);
  } }, o.def || {});
}

/* ================= combos ================= */
const hist = [];                                    // { tech, mode, key, t, end }: what was pressed lately, that started something, and when it ended
function note(tech, mode, key) { hist.push({ tech, mode, key, t: E.T, end: 0 }); if (hist.length > 10) hist.shift(); }
function ended() { const h = hist[hist.length - 1]; if (h && !h.end) h.end = E.T; }      // (the window for the next key counts from here: a long move can still start a run)
function forget() { hist.length = 0; }
// table: [{ seq: [[mode, key], ...], def }]. The longest one that ends with (mode, key) pressed now, with every step in it within win of the next
function find(table, tech, mode, key, win = 1.8) {
  let best = null;
  for (const c of table) {
    const s = c.seq, n = s.length;
    if (s[n - 1][0] !== mode || s[n - 1][1] !== key || hist.length < n - 1 || (best && best.seq.length >= n)) continue;
    let ok = true, next = E.T;
    for (let i = n - 2, j = hist.length - 1; i >= 0; i--, j--) {
      const h = hist[j];
      if (!h || h.tech !== tech || h.mode !== s[i][0] || h.key !== s[i][1] || next - (h.end || h.t) > win) { ok = false; break; }
      next = h.t;
    }
    if (ok) best = c;
  }
  return best;
}

/* ================= the manga's pieces ================= */
const bits = [];                                    // focus lines and sound words, on the real clock (they carry on through a hit-stop)
let imp = null;                                     // impact frames: { t0, life, who, kind }
// focus lines: dark strokes from far out, closing on a point and leaving it clear
function focus(x, y, life = .45, col = '#05040a', n = 90) { bits.push({ kind: 'focus', x, y, t0: E.T, life, col, n, seed: 1 + (Math.random() * 1e6 | 0) }); }
// a sound word, written into the picture where the blow is: big, outlined, tilted, popping in
function ono(text, x, y, size = 1, col = '#ffffff', life = .9) { bits.push({ kind: 'ono', text, x, y, size, col, t0: E.T, life, rot: rnd(-.22, .22) }); }
// impact frames: kind 'bw' (white, them black; then black, them white), 'red' (black, them red; then red, them black), 'neg' (one white frame)
function frames(who, life = .16, kind = 'bw') { imp = { t0: E.T, life, who: who.filter(Boolean), kind }; }
// all of a big blow at once: the frames, the lines, the word, a hit-stop
function bigHit(p, o, word, col, kind = 'bw') { frames([p, o], .16, kind); if (o) { focus(o.x, o.y + 170 * (o.scale || 1)); if (word) ono(word, o.x + rnd(-60, 60), o.y + 420 * (o.scale || 1), 1.2, col); } E.stop(.08); }
const SIL = { black: E.flat('#000000', '#000000'), white: E.flat('#ffffff', '#ffffff'), red: E.flat('#ff2440', '#ff2440') };
function drawFocus(b, u) {
  const c = F(b.x, b.y), a = u < .15 ? u / .15 : 1 - (u - .15) / .85;
  let sd = (b.seed + Math.floor((E.T - b.t0) * 24) * 7919) % 2147483646 + 1;      // (drawn again every few frames, the way a page is)
  const rr = () => (sd = sd * 16807 % 2147483647) / 2147483647, R0 = 230 * c[2], R1 = 3200;
  g.save(); g.globalAlpha = .82 * a; g.fillStyle = b.col;
  for (let i = 0; i < b.n; i++) {
    const an = rr() * TAU, w = .003 + rr() * .011, r0 = R0 * (1 + rr() * 1.1);
    g.beginPath(); g.moveTo(c[0] + Math.cos(an) * r0, c[1] + Math.sin(an) * r0); g.lineTo(c[0] + Math.cos(an - w) * R1, c[1] + Math.sin(an - w) * R1); g.lineTo(c[0] + Math.cos(an + w) * R1, c[1] + Math.sin(an + w) * R1); g.closePath(); g.fill();
  }
  g.restore();
}
function drawOno(b, u) {
  const c = F(b.x, b.y), k = c[2], pop = u < .12 ? .55 + u / .12 * .6 : 1.15 - Math.min(.15, (u - .12) * .4), a = u > .72 ? (1 - u) / .28 : 1, px = Math.round(96 * b.size * k);
  g.save(); g.translate(c[0], c[1]); g.rotate(b.rot); g.scale(pop, pop); g.globalAlpha = Math.max(0, a);
  g.font = `${px}px 'Yuji Syuku','Yu Mincho',serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = px * .2; g.strokeStyle = '#05040a'; g.strokeText(b.text, 0, 0);
  g.lineWidth = px * .08; g.strokeStyle = '#ffffff'; g.strokeText(b.text, 0, 0);
  g.fillStyle = b.col; g.fillText(b.text, 0, 0);
  g.restore();
}
function drawImp() {
  const I = imp, u = (E.T - I.t0) / I.life;
  if (u >= 1) { imp = null; return; }
  const full = col => { g.fillStyle = col; g.fillRect(-4000, -3000, 8000 + E.VW, 6000 + E.VH); };
  const sil = skin => { for (const w of I.who) if (!(w.alpha < .05)) E.drawFighter(E.over(w, skin), 1); };
  if (I.kind === 'neg') { full('rgba(255,255,255,.92)'); sil(SIL.black); return; }
  if (I.kind === 'red') { if (u < .5) { full('#05040a'); sil(SIL.red); } else { full('#ff2440'); sil(SIL.black); } return; }
  if (u < .5) { full('#ffffff'); sil(SIL.black); } else { full('#05040a'); sil(SIL.white); }
}
const fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
H.fx = dt => {
  fx0(dt);
  for (let i = bits.length - 1; i >= 0; i--) {
    const b = bits[i], u = (E.T - b.t0) / b.life;
    if (u >= 1) { bits.splice(i, 1); continue; }
    if (b.kind === 'focus') drawFocus(b, u);
  }
  if (imp) drawImp();
  for (const b of bits) if (b.kind === 'ono') drawOno(b, (E.T - b.t0) / b.life);
  if (bits.length > 40) bits.splice(0, bits.length - 40);
};
const clear = () => { bits.length = 0; imp = null; forget(); };
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) clear(); };

/* ================= a strip of modes on his health bar ================= */
// items: [{ short, keys, col }]. cls: its class (styled in index.html). Gives { el, paint(i) }
function strip(cls, items) {
  const el = document.createElement('div'); el.className = cls;
  el.innerHTML = items.map((d, i) => `<i data-i="${i}" style="--c:${d.col}"><b>${d.short}</b><u>${d.keys}</u></i>`).join('');
  const fb = E.root.querySelector('.fb.p1'); if (fb) fb.appendChild(el);
  return { el, paint(i) { el.querySelectorAll('i').forEach((x, j) => x.classList.toggle('on', j === i)); } };
}

JU.ms = { script, note, ended, forget, find, focus, ono, frames, bigHit, strip, play, get hist() { return hist.map(h => h.tech + ':' + h.mode + ':' + h.key); }, get state() { return { bits: bits.length, imp: !!imp }; } };
})();
