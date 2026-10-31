/* JUJUTSU UNLIMITEDS — Build 0.23: CLIMAX (最高潮), the Clapping Brawler's ult. switcher.js had none, and the user asked for "music from jjk like
   climax jumping for todos ult": Climax☆Jumping! is his idol's song on the season 2 soundtrack. Online it is played straight from myinstants
   ("todo beatdown", tagged climaxjumping: index.html's WEB, 'home-todo-awk'); at home from sounds/home-todo-awk.mp3. Nothing is copied onto the site.
   G, once the bar is full (it fills as his hits land): a thought, "WHAT KIND OF WOMAN IS YOUR TYPE?", then "IT'S TIME FOR THE CLIMAX!", and for
   thirty seconds the fight is his concert: lights sweeping the stage and a crowd of glow sticks along the front of it, the song round and round.
   While it lasts (the rules are ours): Boogie Woogie has no cooldown; every swap with the one he is fighting opens the Black Flash Stitcher Punch
   for a second, as a swap with the pebble does, and the Black Flash no longer takes Boogie Woogie away; and his strikes land a quarter harder */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, T = JU.tech, Z = JU.bossfx;
const { rnd } = E, TAU = Math.PI * 2, CYAN = '#7ad7ff';
const DEF = T.TECH.switcher, on = () => T.active === DEF;
const shake = v => { cam.shake = Math.max(cam.shake, v); };
const duel = () => !!(Fi.fight.cfg && Fi.fight.cfg.pvp);
const CLAP = [.1, 0, 1.5, 1.45, .3, -.3, 0], FIST_UP = [-.08, -.2, 2.8, .6, .3, -.35, 0];
const HYPE_T = 30, INTRO_T = 2.6, POW = 1.25;
sfx.preload(['home-todo-awk']);

let hy = null, watch = 0, shownT = -1, stage = 0;   // { t, intro, paused, music }; how far the stage has gone to a concert
const hyOn = () => !!hy && !hy.intro;
function awaken(p) {
  if (hy || !on()) return;
  hy = { t: HYPE_T, intro: true, paused: false, music: null };
  if (!duel() && !(H.foes && H.foes()) && !Fi.fight.paused) { Fi.fight.paused = true; hy.paused = true; }      // (the fight waits for it: not a duel's, not a raid's)
  p.inv = Math.max(p.inv || 0, INTRO_T + .3);
  p.move = { def: INTRO, t: 0 };
  E.zoomIn(INTRO_T);
  clearInterval(watch); watch = setInterval(() => { if (hy && E.root.dataset.mode !== 'fight') end(true); if (!hy) clearInterval(watch); }, 250);
}
const INTRO = { name: 'Climax', dur: INTRO_T, run(p, m, t) {
  p.vx = 0; p.rate = 16; p.target = t < 1.2 ? CLAP : FIST_UP;
  if (!m.a) { m.a = 1; if (JU.manga) JU.manga.think(p, 'WHAT KIND OF WOMAN IS YOUR TYPE?', { life: 1.2 }); sfx.gavel(.75); }
  if (t >= 1.2 && !m.b) { m.b = 1; if (JU.manga) JU.manga.say(p, "IT'S TIME FOR THE CLIMAX!", { life: 1.3 }); sfx.gavel(1); sfx.confirm(); hy.stage = true; }
  if (t >= 2.5 && !m.c) { m.c = 1; begin(p); }
} };
function begin(p) {
  hy.intro = false;
  if (hy.paused) { hy.paused = false; Fi.fight.paused = false; }
  E.banner('最高潮', 'CLIMAX'); sfx.bf(); shake(22);
  V.ring(p.x, p.y + 200, 480, CYAN, .4); V.sparks(p.x, p.y + 220, 'blue', 24);
  if (Z) { Z.flash('122,215,255', .3, .3); Z.shock(p.x, 760, '122,215,255', .5, 12); }
  hy.music = sfx.song('home-todo-awk', 0, .8, .6, true);
  E.cd.strikes = 0; shownT = -1;
}
function end(quiet) {
  const h = hy;
  if (!h) return;
  hy = null; clearInterval(watch);
  if (h.music) h.music.stop(1.4);
  if (h.paused && Fi.fight.paused) Fi.fight.paused = false;
  if (on()) T.drain();
  if (!quiet && on() && JU.manga) JU.manga.think(E.P1, '...ENCORE NEXT TIME.', { life: 1.6 });
}
const awkEl = document.getElementById('awk');
function awkBar() {
  if (!hyOn() || !on()) return;
  const s = Math.max(0, Math.ceil(hy.t));
  if (s === shownT) return;
  shownT = s; awkEl.style.setProperty('--a', Math.max(0, hy.t / HYPE_T)); awkEl.classList.remove('full');
  awkEl.lastElementChild.textContent = 'Climax · ' + s + 's';
}

/* ---------- the concert ---------- */
const LIGHTS = [['122,215,255', .17, 1.1], ['255,120,200', .39, 1.6], ['255,214,90', .61, 1.3], ['122,215,255', .83, 1.9]];     // colour, where it hangs, how fast it sweeps
const CROWD = Array.from({ length: 34 }, (_, i) => ({ x: (i + .5) / 34 + ((i * 37) % 10 - 5) / 400, h: .055 + ((i * 53) % 7) / 220, ph: i * 1.37, stick: ['122,215,255', '255,120,200', '255,214,90', '160,255,170'][i % 4] }));
function drawLights(a) {                            // the stage dimmed, and the lights going over it
  const cv = g.canvas, W = cv.width, Hh = cv.height, T0 = E.T;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = `rgba(6,8,22,${.42 * a})`; g.fillRect(0, 0, W, Hh);
  g.globalCompositeOperation = 'lighter';
  for (const [rgb, at, sp] of LIGHTS) {
    const x0 = W * at, ang = Math.PI / 2 + Math.sin(T0 * sp + at * 9) * .5, len = Hh * 1.25, wd = .16;
    const gr = g.createLinearGradient(x0, 0, x0 + Math.cos(ang) * len, Math.sin(ang) * len);
    gr.addColorStop(0, `rgba(${rgb},${.42 * a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0, -10); g.lineTo(x0 + Math.cos(ang - wd) * len, Math.sin(ang - wd) * len); g.lineTo(x0 + Math.cos(ang + wd) * len, Math.sin(ang + wd) * len); g.closePath(); g.fill();
    g.fillStyle = `rgba(255,255,255,${.8 * a})`; g.beginPath(); g.arc(x0, 4, Hh * .012, 0, TAU); g.fill();
  }
  g.restore();
}
function drawCrowd(a) {                             // along the front: heads and shoulders against the light, a glow stick in every raised hand, on the beat
  const cv = g.canvas, W = cv.width, Hh = cv.height, T0 = E.T, beat = T0 * (170 / 60) * Math.PI;      // (the song is quick: about 170 a minute)
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  for (const c of CROWD) {
    const x = c.x * W, top = Hh * (1 - c.h), r = Hh * .026, sway = Math.sin(beat + c.ph) * Hh * .012;
    g.lineCap = 'round'; g.lineWidth = Hh * .008;
    const hx = x + Hh * .03 + sway * 1.6, hy0 = top - Hh * .045 + Math.abs(Math.sin(beat + c.ph)) * Hh * -.01;
    g.strokeStyle = `rgba(${c.stick},${.95 * a})`; g.shadowColor = `rgba(${c.stick},1)`; g.shadowBlur = Hh * .02;
    g.beginPath(); g.moveTo(hx, hy0); g.lineTo(hx + sway * .8, hy0 - Hh * .05); g.stroke();
    g.shadowBlur = 0;
    g.fillStyle = `rgba(4,5,14,${.92 * a})`;
    g.beginPath(); g.arc(x + sway * .4, top, r, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(x + sway * .3, Hh + r * .5, r * 2.1, Hh * c.h - r * .2, 0, Math.PI, 0); g.fill();
    g.strokeStyle = `rgba(4,5,14,${.92 * a})`; g.lineWidth = Hh * .012; g.beginPath(); g.moveTo(x + r, top + r * 1.6); g.lineTo(hx, hy0 + Hh * .004); g.stroke();
  }
  g.restore();
}

/* ---------- wiring ---------- */
DEF.awaken = awaken; DEF.awkName = 'Climax'; DEF.awkKeep = true;
Object.defineProperty(DEF, 'awkHits', { get() { return !hy; }, configurable: true });
JU.switcher.hype = hyOn;
const tick0 = H.tick, under0 = H.under, fx0 = H.fx, pow0 = H.power, reset0 = H.reset, start0 = H.fightStart;
H.power = (h, o) => (pow0 ? pow0(h, o) : 1) * (on() && hyOn() && o === E.P2 && E.P1.move && E.P1.move.def.m1 ? POW : 1);
H.tick = dt => {
  tick0(dt);
  stage += ((hy && hy.stage ? 1 : 0) - stage) * (1 - Math.exp(-dt * 3));
  if (!hy) return;
  const p = E.P1;
  if (!on() || p.dead) { end(true); return; }
  if (hy.intro) return;
  hy.t -= dt; awkBar();
  E.cd.strikes = 0;                                 // Boogie Woogie, whenever he likes
  if (Math.random() < dt * 10) V.mote(p.x, p.y + 250, Math.random() < .5 ? 'blue' : 'pink');
  if (hy.t <= 0) end();
};
H.under = dt => { under0(dt); if (stage > .01 && on()) drawLights(stage); };
H.fx = dt => { fx0(dt); if (stage > .01 && on()) drawCrowd(stage); };
H.reset = () => { reset0(); end(true); stage = 0; };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) { end(true); stage = 0; } };

JU.climax = { INTRO, get state() { return hy && { t: +hy.t.toFixed(2), intro: hy.intro, music: !!(hy.music && hy.music.playing), stage: +stage.toFixed(2) }; } };
})();
