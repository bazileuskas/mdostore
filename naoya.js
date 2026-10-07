/* JUJUTSU UNLIMITEDS — the mountains, the Unlimited Void, and the Maki fight */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, box = E.box, glow = E.glow, GLOW = E.GLOW, cam = E.cam, Fi = JU.fights, X = JU.cast2;
const { ZP } = E, TAU = Math.PI * 2, cut = JU.school.cut;
const line = (a, b) => { g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); };
let seed = 31;
const r = () => (seed = seed * 16807 % 2147483647) / 2147483647;

/* ================= a mountain pass at dusk ================= */
const peak = (j, L) => (Math.sin(j * 1.7 + L * 2) * .5 + Math.sin(j * .63 + L) * .5 + 1) * (150 - L * 38) + 30;
function tree(x, z, h) {
  box(x, 0, z, 26, h * .3, 26, '#2a1d16', '#1a120d');
  g.fillStyle = '#132219';
  for (let i = 0; i < 3; i++) {
    const y0 = h * (.22 + i * .24), w = h * (.36 - i * .08), a = P(x - w, y0, z), b = P(x + w, y0, z), c = P(x, y0 + h * .42, z);
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.closePath(); g.fill();
  }
}
const mountain = {
  sky() {
    const HY = E.HY, VW = E.VW, gr = g.createLinearGradient(0, 0, 0, HY);
    gr.addColorStop(0, '#0a0f26'); gr.addColorStop(.55, '#3a2f58'); gr.addColorStop(.88, '#b05a5a'); gr.addColorStop(1, '#e89a62');
    g.fillStyle = gr; g.fillRect(-80, -80, VW + 160, HY + 82);
    const mx = VW / 2 + 260 - cam.x * .02 - cam.yaw * 600;
    g.globalCompositeOperation = 'lighter'; glow(GLOW.fire, mx, HY - 60, 520, .5); g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#ffe9c4'; g.beginPath(); g.arc(mx, HY - 60, 46, 0, TAU); g.fill();
    for (let L = 0; L < 3; L++) {                // three ridges, each sliding at its own speed
      const off = cam.x * (.03 + L * .04) + cam.yaw * (520 + L * 160) + 4000, j0 = Math.floor(off / 90) - 2, n = Math.ceil(VW / 90) + 5;
      g.beginPath(); g.moveTo(-100, HY + 2);
      for (let j = j0; j < j0 + n; j++) g.lineTo(j * 90 - off, HY - peak(j, L));
      g.lineTo(VW + 100, HY + 2); g.closePath();
      g.fillStyle = ['#4a3a5c', '#2c2542', '#17152a'][L]; g.fill();
    }
  },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, '#5a4658'); gr.addColorStop(.3, '#2c2530'); gr.addColorStop(1, '#100d14');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    g.beginPath();                               // cracks in the rock
    for (let x = -1050; x <= 1050; x += 210) line(P(x + 40, 0, zn), P(x - 30, 0, ZP + 520));
    for (let z = Math.ceil(zn / 170) * 170; z <= ZP + 520; z += 170) line(P(-1050, 0, z), P(1050, 0, z + 30));
    g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 2; g.stroke();
  },
  back() {
    for (const [x, z, h] of [[-940, 420, 520], [-640, 520, 620], [-330, 460, 470], [300, 500, 560], [600, 430, 500], [900, 540, 640]]) tree(x, ZP + z, h);
    for (const s of [-1, 1]) box(s * 1150, 0, ZP + 60, 300, 440, 420, '#2b2632', '#1c1921', '#3a3442');     // rock walls closing the pass
    box(-470, 0, ZP + 230, 170, 96, 130, '#3a3540', '#27232c', '#4b4553');
    box(520, 0, ZP + 260, 130, 70, 110, '#3a3540', '#27232c', '#4b4553');
    const HY = E.HY, gr = g.createLinearGradient(0, HY - 60, 0, HY + 90);                                 // mist lying in the pass
    gr.addColorStop(0, 'rgba(255,220,200,0)'); gr.addColorStop(.5, 'rgba(255,220,200,.16)'); gr.addColorStop(1, 'rgba(255,220,200,0)');
    g.fillStyle = gr; g.fillRect(-80, HY - 60, E.VW + 160, 150);
  },
  front() { for (const [x, w] of [[-800, 170], [-180, 100], [420, 140], [880, 120]]) box(x, 0, ZP - 190, w, 36, 56, '#0d0b11', '#08070b', '#221d29'); }
};

/* ================= Unlimited Void: everything, forever, all at once ================= */
const STREAKS = Array.from({ length: 80 }, () => [r() * TAU, r() * 900, 60 + r() * 260, 140 + r() * 420]);
const STARS = Array.from({ length: 90 }, () => [r(), r(), .8 + r() * 2, r() * TAU]);
const voidStage = {
  sky() {
    const HY = E.HY, VW = E.VW, VH = E.VH, cx = VW / 2 - cam.yaw * 400, cy = HY - 150;
    g.fillStyle = '#010106'; g.fillRect(-80, -80, VW + 160, VH + 400);
    g.globalCompositeOperation = 'lighter';       // clouds of light a long way off, and stars
    glow(GLOW.purple, cx - VW * .34, cy - 60, VW * .7, .3); glow(GLOW.blue, cx + VW * .36, cy + 40, VW * .8, .26);
    g.globalCompositeOperation = 'source-over';
    for (const s of STARS) { g.fillStyle = `rgba(220,240,255,${.4 + .4 * Math.sin(E.T * 2 + s[3])})`; g.fillRect(s[0] * (VW + 160) - 80, s[1] * HY, s[2], s[2]); }
    g.strokeStyle = 'rgba(190,225,255,.6)'; g.lineWidth = 2; g.beginPath();
    for (const s of STREAKS) { const d = (s[1] + E.T * s[3]) % 1000 + 150; g.moveTo(cx + Math.cos(s[0]) * d, cy + Math.sin(s[0]) * d); g.lineTo(cx + Math.cos(s[0]) * (d + s[2]), cy + Math.sin(s[0]) * (d + s[2])); }
    g.stroke();
    g.globalCompositeOperation = 'lighter'; glow(GLOW.blue, cx, cy, 760, .9); g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#000'; g.beginPath(); g.arc(cx, cy, 120, 0, TAU); g.fill();
    g.strokeStyle = '#dff3ff'; g.lineWidth = 5; g.stroke();
    g.strokeStyle = 'rgba(120,200,255,.8)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 150 + 8 * Math.sin(E.T * 3), 0, TAU); g.stroke();
    g.strokeStyle = 'rgba(223,243,255,.9)'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy, 320, 36, -.12, 0, Math.PI); g.stroke();   // the disc of light it is swallowing, seen edge on
    g.setLineDash([22, 30]); g.strokeStyle = 'rgba(120,200,255,.55)'; g.lineWidth = 2;                                                 // and a broken ring turning round it
    g.beginPath(); g.ellipse(cx, cy, 390 + 10 * Math.sin(E.T * 2), 100, -.12, E.T * .5, E.T * .5 + TAU); g.stroke(); g.setLineDash([]);
  },
  floor() {
    const HY = E.HY, VW = E.VW, VH = E.VH, gr = g.createLinearGradient(0, HY, 0, VH);
    gr.addColorStop(0, 'rgba(60,140,220,.5)'); gr.addColorStop(.3, 'rgba(10,20,50,.8)'); gr.addColorStop(1, '#010106');
    g.fillStyle = gr; g.fillRect(-80, HY, VW + 160, VH - HY + 320);
    g.beginPath();
    for (let x = -1500; x <= 1500; x += 150) line(P(x, 0, E.ZNEAR), P(x, 0, ZP + 2400));
    for (let z = Math.ceil(E.ZNEAR / 150) * 150; z < ZP + 2400; z += 150) line(P(-1500, 0, z), P(1500, 0, z));
    g.strokeStyle = 'rgba(140,210,255,.14)'; g.lineWidth = 1.5; g.stroke();
  },
  back() {}, front() {}
};
JU.chapters.STAGES.mountain = () => mountain;
JU.chapters.STAGES.void = () => voidStage;

/* ================= Maki fight (shown on the Play screen while Projection Sorcery is equipped) ================= */
function start() {
  const foe = Fi.make('maki', 240), nm = Fi.nm;
  const asNaoya = () => { E.P1.skin = X.NAOYA; nm.p1.textContent = 'Frame Runner'; nm.p1j.textContent = '投射'; };
  foe.ai = null;
  E.arena({ stage: mountain, foe, skin: X.NAOYA, p1x: -240, yaw: -.3 });
  E.banner('山', 'FRAME RUNNER  VS  HEAVENLY BLADE', 'sm');
  cut({
    look: () => foe.x, cx: () => 0, delay: 1500,
    lines: [
      ['naoya', 'You, of all people. Know where you stand, Heavenly Blade. Three steps behind me.'],
      ['maki', 'Still talking. You always did have more mouth than speed.'],
      ['naoya', 'Speed? Twenty-four frames a second. Count them, if your eyes can keep up.'],
      ['maki', 'I do not need to see them. I only need to hit you once.']
    ],
    then() {
      JU.tech.apply('projection');
      Fi.start({ foes: ['maki'], stage: mountain, label: 'Heavenly Blade fight', p1x: -240, win: ['勝', 'FRAME RUNNER WINS'], onWin() { Fi.later(1600, () => JU.exitGame()); } });
      asNaoya();
    }
  });
}

JU.maki = { start, mountain, voidStage };
})();
