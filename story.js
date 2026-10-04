/* JUJUTSU UNLIMITEDS — story beats: Gojo after the fight, then finding Megumi */
(() => {
'use strict';

const E = JU.eng, C = JU.cast, sfx = JU.sfx, root = E.root, cam = E.cam;
const { lerp, clamp, ZP } = E;
const $ = s => root.querySelector(s);
const el = { dlg: $('#dlg'), who: $('#dWho'), jp: $('#dJp'), txt: $('#dTxt'), fade: $('#fade') };
const WHO = {
  gojo: ['Satoru Gojo', '五条悟', '#38c8ff'],
  yuji: ['Yuji Itadori', '虎杖悠仁', '#ff2440'],
  megumi: ['Megumi Fushiguro', '伏黒恵', '#8f9bff'],
  sukuna: ['Ryomen Sukuna', '両面宿儺', '#d0102a']
};

/* ---------- dialogue box ---------- */
let lines = null, li = 0, shown = 0, full = '', done = null;
const timers = [];
const later = (ms, fn) => timers.push(setTimeout(fn, ms));

function next() {
  if (++li >= lines.length) { lines = null; el.dlg.classList.remove('on'); const f = done; done = null; if (f) f(); return; }
  const w = WHO[lines[li][0]];
  el.who.textContent = w[0]; el.jp.textContent = w[1]; el.dlg.style.setProperty('--sp', w[2]);
  full = lines[li][1]; shown = 0; el.txt.textContent = '';
  if (lines[li][2]) lines[li][2]();             // some lines set something off on screen
}
function say(list, then) { lines = list; li = -1; done = then; next(); el.dlg.classList.add('on'); }
function tick(real) {                            // type the line out
  if (!lines || shown >= full.length) return;
  const n = Math.min(full.length, shown + real * 60);
  if ((n | 0) !== (shown | 0)) { el.txt.textContent = full.slice(0, n | 0); if ((n | 0) % 4 === 0) sfx.hover(); }
  shown = n;
}
function press(a) {
  if (!lines) return;
  if (a === 'skip') { const cur = lines; for (let n = 0; lines === cur && n < 99; n++) next(); return; }
  if (a !== 'ok' && a !== 'm1' && a !== 'jump') return;
  if (shown < full.length) { shown = full.length; el.txt.textContent = full; }
  else { sfx.back(); next(); }
}

/* ---------- 1: Gojo walks out of the shrine ---------- */
let gojo = null, gs = null;
const gojoScene = {
  mode: 'story',
  update(dt, real) {
    const y = E.P1;
    if (!y.ground) { y.vy -= 2700 * real; y.y += y.vy * real; if (y.y <= 0) { y.y = 0; y.ground = true; } }
    C.stroll(y, false, real);                    // Yuji drops his guard
    gojo.alpha = Math.min(1, gojo.alpha + real * 1.5);
    if (gs.walk) {                               // he comes from deep in the stage, growing as he nears
      const dx = gs.tx - gojo.x, dz = ZP - gojo.z, d = Math.hypot(dx, dz);
      if (d < 10) { gs.walk = false; gojo.z = ZP; talk(); }
      else { gojo.x += dx / d * 400 * real; gojo.z += dz / d * 400 * real; if (Math.abs(dx) > 20) gojo.face = dx > 0 ? 1 : -1; }
    } else gojo.face = y.x > gojo.x ? 1 : -1;
    C.stroll(gojo, gs.walk, real, 1.1);
    y.face = gojo.x > y.x ? 1 : -1;
    const lim = Math.max(0, 1050 - E.VW / 2);
    cam.x = lerp(cam.x, clamp((y.x + gs.tx) / 2, -lim, lim), 1 - Math.exp(-real * 2.5));
    cam.yaw = lerp(cam.yaw, gs.walk ? .22 : .1 * Math.sin(E.T * .3), 1 - Math.exp(-real * 1.5));   // slow orbit while they talk
    cam.zoom = lerp(cam.zoom, gs.walk ? 1 : 1.2, 1 - Math.exp(-real * 2));
    cam.lift = lerp(cam.lift, 135, 1 - Math.exp(-real * 2));
    tick(real);
  },
  render(dt, real) { E.renderArena(real, [gojo]); },
  press
};

function fightWon() {
  const y = E.P1, side = y.x > 250 ? -1 : 1;
  y.move = null; y.dashT = 0; y.spin = 1; y.vx = 0;
  gojo = E.fighter(C.GOJO, clamp(y.x * .3, -150, 150), 1);
  gojo.z = 1090; gojo.scale = 1.1; gojo.alpha = 0; gojo.pose = C.STAND.slice();
  gs = { walk: true, tx: clamp(y.x + side * 210, -900, 900) };
  root.classList.add('cine');
  E.setScene(gojoScene);
}

function talk() {
  say([
    ['gojo', 'Yo, Yuji! Sorry, sorry. I got held up buying sweets.'],
    ['gojo', 'But I caught the ending. That last hit of yours... the sparks went black.'],
    ['yuji', 'Yeah. It felt different. Like everything lined up for a split second.'],
    ['gojo', 'That was a Black Flash. Your cursed energy landed within a millionth of a second of your fist, and space itself bent around the hit.'],
    ['gojo', 'There are sorcerers who go their whole careers without landing one. You pulled it off on a training run. Honestly? I am impressed.'],
    ['yuji', 'So if I just do the same thing again...'],
    ['gojo', 'Nobody lands it on purpose. Not even me. But now your body knows what it feels like. Hold on to that.'],
    ['gojo', 'Right, class dismissed! Megumi is out in the city on a job. Go find him. You will feel the cursed energy before you see him.'],
    ['yuji', 'Got it!']
  ], () => {
    root.classList.remove('cine'); el.fade.classList.add('on');
    later(750, () => { JU.street.start(); el.fade.classList.remove('on'); later(600, () => E.banner('東京', 'TOKYO')); });
  });
}

/* ---------- 2: the alley ---------- */
function foundMegumi() {
  const S = JU.street, st = S.st, T = JU.tokyo;
  st.locked = true; st.zoom = 2.05; st.yaw = -.08;
  root.classList.add('cine');
  st.goto = [T.SRC[0] - 95, T.SRC[1] - 10];
  st.arrive = () => {
    S.me.face = 1; S.megumi.face = -1;           // Megumi turns from what is left of the curse
    say([
      ['megumi', '...Itadori. You are loud. I heard you coming from the main road.'],
      ['yuji', 'Fushiguro! Gojo-sensei said you were out here. That cursed energy, was that you?'],
      ['megumi', 'That was the curse. Grade three, hiding back here. It is dealt with. What you felt is what is left of it.'],
      ['yuji', 'Oh! Guess what. I landed a Black Flash today!'],
      ['megumi', '...On a training curse. Do not let it go to your head.'],
      ['megumi', 'Gojo-sensei sent word. Curses have nested in a school two blocks from here. We clear it tonight.'],
      ['yuji', 'Right behind you!']
    ], () => JU.school.begin());
  };
}

function reset() {
  while (timers.length) clearTimeout(timers.pop());
  lines = null; done = null;
  el.dlg.classList.remove('on'); el.fade.classList.remove('on'); root.classList.remove('cine');
}

JU.story = { fightWon, foundMegumi, press, tick, reset, say, WHO };
})();
