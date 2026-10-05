/* JUJUTSU UNLIMITEDS — walking a district: whoever is being played, the passers-by, the curses loitering in it and, in the story, the trail
   of cursed energy. The district is a "world": Tokyo's one block (street.js) or Shibuya (shibuya.js). A world is asked for its ground, its
   buildings and what stands in it; it may also bring curses of its own (SPOTS), people who stand about (cast), things to talk to or use
   (spots), and a tick of its own. This file walks him through whichever it is, finds what is within reach, and hands the key press on */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, glow = E.glow, GLOW = E.GLOW, cam = E.cam, keys = E.keys, C = JU.cast, sfx = JU.sfx;
const { lerp, clamp, rnd } = E, TAU = Math.PI * 2;
const obj = E.root.querySelector('#obj');
const setObj = (t, s) => { obj.innerHTML = `${t}<small>${s}</small>`; };

let W = JU.tokyo;                                // the district being walked
let me, megumi, npcs = [], wisps = [], curses = [], cast = [], gone = [], st = {}, pal = null;

// free exploration: curses loiter around the block until he walks into one. A world may have its own list; a kind may be one of several
const SPOTS = [[1300, 620, 'grunt'], [2350, 1290, 'grunt'], [3300, 660, 'brute'], [4900, 640, 'special']];   // the last one is a special grade
const SPECIAL = ['mahito', 'hanami', 'jogo', 'choso'];
function curse(s) {
  const pool = s[2] === 'special' ? SPECIAL : s[2], kind = Array.isArray(pool) ? pool[Math.random() * pool.length | 0] : pool, f = JU.fights.make(kind, s[0]);
  f.z = s[1]; f.y = f.ground0 = 12; f.home = s[0]; f.kind = kind; f.spot = s; f.ph = rnd(0, 6); f.pose = C.STAND.slice(); f.target = C.STAND;
  return f;
}
function spawnCurses() { curses = (W.SPOTS || SPOTS).map(curse); gone = []; }
const status = () => { if (W.status) W.status(st, setObj); else setObj('Free exploration', `Curses exorcised: ${st.done}`); };
// he may have left a fight in a different body, or as somebody a technique makes of him
function dress() {
  const body = JU.clan.body();
  me.skin = body ? body.skin : JU.tech.skin || E.YUJI; me.scale = body ? body.scale : (JU.tech.active && JU.tech.active.scale) || 1;
}

// A fight started out here happens right where he is standing, and when it is over he is back on the street.
// o: { cfg: what the fight is (foes, label, stage ...), stay: he comes back to the very spot he left, after(won) }
function fight(o) {
  const x0 = me.x + 200, at = [me.x, me.z];
  JU.flash(innerWidth / 2, innerHeight / 2); sfx.confirm();
  const back = won => {                            // `won` is false when he simply left it
    const x = clamp(x0 + (won ? E.P1.x : -560), 100, W.LEN - 100);       // having run, he comes out well clear of it
    if (o.stay || !W.free(x, me.z)) { me.x = at[0]; me.z = at[1]; } else me.x = x;
    me.y = me.ground0 = W.gy(me.z, me.x); dress();
    cam.x = clamp(me.x, 700, W.LEN - 700); cam.yaw = 0; cam.zoom = 1; cam.lift = 0;
    E.setScene(scene); st.wait = E.T + .45;
    if (o.after) o.after(won);
    status();
  };
  JU.fights.start(Object.assign({ stage: W.stage ? W.stage(x0) : JU.stages.street(x0), label: W.label || 'Free exploration', p1x: -200, onWin: () => back(true), onFlee: () => back(false) }, o.cfg));
}
// walking into a curse
function encounter(c) {
  curses.splice(curses.indexOf(c), 1);
  fight({ cfg: { foes: [c.kind], wild: true }, after(won) {         // wild: out here a special grade may open its domain
    if (won) { st.done++; if (W.won) W.won(c.kind); if (W.respawn) gone.push({ s: c.spot, t: W.respawn }); }
    else { c.calm = 3; curses.push(c); }           // the one he ran from is still standing there, and takes a moment to notice him again
    if (!curses.length && !W.respawn) spawnCurses();
  } });
}
// somebody speaks, in the story's box. He stands still until they have finished
function talk(list, then) {
  st.talk = st.hold = true;
  JU.story.say(list, () => { st.talk = st.hold = false; st.wait = E.T + .45; if (then) then(); });      // (a moment before E does anything again: the press that closed the box is not also a press on what he is standing by)
}

// everybody who is in the district besides him
function populate() {
  const n = W.civs || 7, gap = (W.LEN - 600) / n;
  npcs = Array.from({ length: n }, (_, i) => {
    const f = E.fighter(C.civ(i), 300 + i * gap + rnd(-150, 150), i & 1 ? 1 : -1);
    f.z = i % 3 === 0 ? rnd(1270, 1325) : rnd(540, 740); f.y = f.ground0 = 12;
    f.speed = rnd(70, 115); f.scale = rnd(.94, 1.04); f.walk = rnd(0, 6);
    return f;
  });
  megumi.alpha = W === JU.tokyo ? 1 : 0;
  cast = W.cast ? W.cast() : [];
  curses = []; gone = [];
  if (st.free) spawnCurses();
}
// another district, without leaving the game: the subway (shibuya.js)
function travel(world, at) {
  W = world || JU.tokyo;
  me.x = at ? at[0] : 420; me.z = at ? at[1] : 640; me.face = (at && at[2]) || 1; me.y = me.ground0 = W.gy(me.z, me.x);
  populate();
  cam.x = clamp(me.x, 700, W.LEN - 700); cam.yaw = 0; cam.zoom = 1; cam.shake = 0; cam.lift = 0;
  st.near = null; st.hold = st.talk = false; status();
}

function start(opts) {
  const last = opts && opts.free && !opts.world && JU.shibuya ? JU.shibuya.resume() : null;       // Free Exploration starts wherever he last got off the train
  if (last) opts = Object.assign({}, opts, last);
  W = (opts && opts.world) || JU.tokyo;
  me = E.fighter(E.YUJI, 420, 1); me.z = 640; me.y = me.ground0 = 12; me.pose = C.STAND.slice(); me.target = C.STAND;
  megumi = E.fighter(C.MEGUMI, JU.tokyo.SRC[0] + 10, 1); megumi.z = JU.tokyo.SRC[1]; megumi.y = megumi.ground0 = 12;
  megumi.pose = C.STAND.slice(); megumi.target = C.STAND;
  wisps = Array.from({ length: 26 }, () => ({ u: Math.random(), x: rnd(2500, 4200), z: rnd(560, 1300), h: rnd(60, 230), ph: rnd(0, TAU) }));
  st = { sense: 0, sensed: false, found: false, locked: false, hold: false, talk: false, near: null, goto: null, arrive: null, beat: 0, pulse: 0, zoom: 0, yaw: 0, free: !!(opts && opts.free), done: 0 };
  pal = null;
  if (st.free && opts.at) { me.x = opts.at[0]; me.z = opts.at[1]; me.y = me.ground0 = W.gy(me.z, me.x); }
  populate();
  const duo = opts && opts.duo;
  if (duo) {                                     // nobody at the controls: two people strolling down the far pavement
    me.skin = duo.me; me.x = 760; me.z = 1300;
    pal = E.fighter(duo.pal, me.x - 95, 1); pal.pose = C.STAND.slice(); pal.target = C.STAND; pal.walk = 2;
    megumi.alpha = 0;
    Object.assign(st, { locked: true, auto: .27, zoom: 1.9 });
  }
  cam.x = clamp(me.x, 700, W.LEN - 700); cam.yaw = 0; cam.zoom = st.zoom || 1; cam.shake = 0; cam.lift = 0;
  if (st.free) {
    JU.tech.apply(); JU.clan.apply();
    if (JU.tools) JU.tools.apply();
    dress();
    if (W.status) status();
    else setObj('Free exploration', [JU.tech.name && 'Technique: ' + JU.tech.name, JU.clan.name && 'Clan: ' + JU.clan.name, 'W A S D move · Shift run · walk into a curse to fight it'].filter(Boolean).join(' · '));
  }
  else setObj('Find Megumi', 'W A S D move · Shift run');
  E.setScene(scene);
}

function update(dt, real) {
  const p = me;
  if (st.free) JU.clan.street(dt);
  let mx = 0, mz = 0, run = 1;
  if (st.goto) {                                 // a cutscene is walking him to a mark
    const dx = st.goto[0] - p.x, dz = st.goto[1] - p.z, d = Math.hypot(dx, dz);
    if (d < 14) { st.goto = null; const f = st.arrive; st.arrive = null; if (f) f(); }
    else { mx = dx / d; mz = dz / d; }
  } else if (st.auto) {
    mx = W.free(p.x + 6, p.z) ? 1 : 0; run = st.auto;
  } else if (!st.locked && !st.hold) {
    mx = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
    mz = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0);
    run = keys.has('shift') ? 1.7 : 1;
    const l = Math.hypot(mx, mz) || 1; mx /= l; mz /= l;
  }
  const fastK = st.free && JU.awakened ? JU.awakened.streetTick(dt) : 1;   // Top Speed, out here: nothing while he runs his laps, a lot once he is up to speed
  run *= fastK;
  const sx = mx * 330 * run * dt, sz = mz * 290 * run * dt;
  if (st.goto || W.free(p.x + sx, p.z)) p.x += sx;
  if (st.goto || W.free(p.x, p.z + sz)) p.z += sz;
  if (Math.abs(mx) > .15) p.face = mx > 0 ? 1 : -1;
  p.y = p.ground0 = lerp(p.y, W.gy(p.z, p.x), 1 - Math.exp(-dt * 18));      // step up and down the kerbs
  C.stroll(p, !!(mx || mz), dt, run);

  for (const n of npcs) {
    if (n.frozen > 0) { n.frozen -= dt; continue; }                    // caught in a single frame: they do not move until it lets them go
    n.x += n.face * n.speed * dt;
    if (n.x < 120 || n.x > W.LEN - 120) n.face = -n.face;
    C.stroll(n, true, dt, n.speed / 110);
  }
  C.stroll(megumi, false, dt);
  for (const f of cast) { if (Math.abs(f.x - p.x) < 520 && Math.abs(f.z - p.z) < 520) f.face = p.x >= f.x ? 1 : -1; C.stroll(f, false, dt); }   // whoever is standing about turns to look at him
  if (pal) { pal.x = p.x - 95; pal.z = p.z + 24; pal.y = pal.ground0 = p.y; pal.face = p.face; C.stroll(pal, !!mx, dt, run); }
  for (let i = gone.length - 1; i >= 0; i--) {                         // an exorcised one's corner does not stay empty for good
    const q = gone[i];
    if ((q.t -= dt) <= 0 && Math.abs(q.s[0] - p.x) > 900) { curses.push(curse(q.s)); gone.splice(i, 1); }
  }
  for (const c of curses) {
    if (c.frozen > 0) { c.frozen -= dt; continue; }
    if (c.calm > 0) c.calm -= dt;
    c.x = c.home + Math.sin(E.T * .5 + c.ph) * 90; c.face = p.x > c.x ? 1 : -1; C.stroll(c, true, dt, .5);
    if (!(c.calm > 0) && !st.hold && Math.abs(p.x - c.x) < 120 && Math.abs(p.z - c.z) < 100) {
      if (fastK !== 1) { c.frozen = 2; sfx.hover(); continue; }         // during the sprint, and at top speed after it, a touch freezes it instead of starting the fight
      encounter(c); return;
    }
  }
  // somebody to talk to or something to use, within reach
  st.near = null;
  if (st.free && W.spots && !st.hold && !st.locked) {
    let best = 1e9;
    for (const s of W.spots) {
      if (s.show && !s.show()) continue;
      const d = Math.hypot(p.x - s.x, (p.z - s.z) * 1.15);
      if (d < (s.r || 150) && d < best) { best = d; st.near = s; }
    }
  }
  if (st.free && W.tick && W.tick(dt, real, p, st)) return;            // (a world's own business may take the scene elsewhere)

  // camera: leads the way he is walking, turns into it, and pushes in as he heads away from us
  const depth = clamp((p.z - 700) / 900, 0, 1);
  cam.x = lerp(cam.x, clamp(p.x + (st.locked ? 0 : p.face * 110), 700, W.LEN - 700), 1 - Math.exp(-real * 3));
  cam.yaw = lerp(cam.yaw, st.locked ? st.yaw : mx * .06, 1 - Math.exp(-real * 2));
  cam.zoom = lerp(cam.zoom, st.zoom || 1 + depth * .6, 1 - Math.exp(-real * 2.5));

  // sensing (the story, on the Tokyo block): nothing at first, then a pull that gets stronger the closer he is to the alley
  const SRC = JU.tokyo.SRC, d = Math.hypot(p.x - SRC[0], (p.z - SRC[1]) * 1.3);
  st.sense = lerp(st.sense, st.sensed ? clamp(1.15 - d / 1900, .12, 1) : 0, 1 - Math.exp(-real * 3));
  if (!st.free && !st.auto && !st.sensed && p.x > 2700) {
    st.sensed = true; cam.shake = 6;
    E.banner('呪力感知', 'CURSED ENERGY'); sfx.charge();
    setObj('Follow the cursed energy', 'It is stronger to the east');
  }
  if (st.sensed && !st.found) {
    if ((st.beat -= real) <= 0) { st.beat = lerp(1.15, .4, st.sense); st.pulse = 1; sfx.land(); }
    if (p.z > W.BZ + 30) { st.found = true; JU.story.foundMegumi(); }
  }
  st.pulse *= Math.exp(-real * 4);
  for (const w of wisps) { w.u += real * .16; if (w.u > 1) { w.u = 0; w.x = rnd(2500, 4200); w.z = rnd(560, 1300); } }
  JU.story.tick(real);
}

function person(f) {
  if (f.kind) {                                  // a curse gives itself away
    const q = P(f.x, 130, f.z);
    g.globalCompositeOperation = 'lighter'; glow(GLOW.purple, q[0], q[1], 420 * q[2], .5 + .2 * Math.sin(E.T * 4)); g.globalCompositeOperation = 'source-over';
  }
  E.shadow(f); E.drawFighter(f, f.alpha);
}
// over something he could talk to or use: a small mark while he is far off, and what E would do once he is close
function mark(s, near) {
  const q = P(s.x, (s.h || 340) + 44 + 8 * Math.sin(E.T * 3 + s.x), s.z), k = Math.min(1.25, q[2]);
  if (q[0] < -200 || q[0] > E.VW + 200) return;
  g.save(); g.translate(q[0], q[1]);
  if (near) {
    const label = typeof s.label === 'function' ? s.label() : s.label, fs = Math.round(17 * k + 6);
    g.font = `600 ${fs}px Oswald, 'Segoe UI', sans-serif`; g.textBaseline = 'middle'; g.textAlign = 'left';
    const tw = g.measureText(label).width, bw = tw + fs * 2.5, bh = fs * 1.8;
    g.fillStyle = 'rgba(8,6,14,.9)'; g.fillRect(-bw / 2, -bh, bw, bh); g.fillStyle = s.col || '#ffd23d'; g.fillRect(-bw / 2, -bh, 4, bh);
    g.fillStyle = s.col || '#ffd23d'; g.fillRect(-bw / 2 + 12, -bh * .78, fs * 1.1, bh * .56);
    g.fillStyle = '#0b0710'; g.textAlign = 'center'; g.fillText('E', -bw / 2 + 12 + fs * .55, -bh / 2 + 1);
    g.fillStyle = '#f4efe4'; g.textAlign = 'left'; g.fillText(label, -bw / 2 + 12 + fs * 1.5, -bh / 2 + 1);
  } else {
    const r = 15 * k + 5;
    g.rotate(Math.PI / 4); g.fillStyle = 'rgba(8,6,14,.85)'; g.fillRect(-r, -r, r * 2, r * 2); g.strokeStyle = s.col || '#ffd23d'; g.lineWidth = 2; g.strokeRect(-r, -r, r * 2, r * 2); g.rotate(-Math.PI / 4);
    g.fillStyle = s.col || '#ffd23d'; g.font = `${Math.round(r * 1.25)}px 'Yuji Syuku','Yu Mincho',serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s.icon || '話', 0, 1);
  }
  g.restore();
}

function render() {
  const VW = E.VW, VH = E.VH, HY = E.HY, T = E.T, k = g.canvas.width / VW;
  g.setTransform(k, 0, 0, k, 0, 0);
  const sh = JU.reduceMotion ? 0 : cam.shake;
  g.save();
  g.translate(VW / 2 + rnd(-sh, sh), HY + 70 + rnd(-sh, sh)); g.scale(cam.zoom, cam.zoom); g.translate(-VW / 2, -(HY + 70));

  W.sky(); W.ground(); W.alley();
  // during a cutscene the camera is pushed right in, so passers-by on the near pavement would fill the frame
  const people = [me, ...(W === JU.tokyo ? [megumi] : []), ...npcs, ...curses, ...cast, ...(pal ? [pal] : [])].filter(f => Math.abs(f.x - cam.x) < 2600 && !(st.locked && f.speed && f.z < 1000));
  const deep = [], list = [];                    // what stands back beyond the building line (an alley, a square) is drawn before the buildings
  for (const it of W.props) (it.z > W.Z1 + 20 ? deep : list).push(it);
  for (const f of people) (f.z > W.Z1 + 20 ? deep : list).push({ z: f.z, f });
  deep.sort((a, b) => b.z - a.z);
  for (const it of deep) it.f ? person(it.f) : it.draw();
  W.buildings();
  list.sort((a, b) => b.z - a.z);
  for (const it of list) it.f ? person(it.f) : it.draw();

  if (st.sense > .01) {                          // motes of cursed energy drifting toward their source
    const SRC = JU.tokyo.SRC;
    g.globalCompositeOperation = 'lighter';
    for (const w of wisps) {
      const e = w.u * w.u * (3 - 2 * w.u);
      const q = P(lerp(w.x, SRC[0], e) + Math.sin(T * 2 + w.ph) * 30, w.h + Math.sin(T * 3 + w.ph) * 18, lerp(w.z, SRC[1], e));
      glow(GLOW.purple, q[0], q[1], 64 * q[2] * (1.2 - e * .5), st.sense * Math.sin(w.u * Math.PI));
    }
    g.globalCompositeOperation = 'source-over';
  }
  if (st.free && JU.awakened) JU.awakened.streetDraw();
  if (st.free && JU.switcher) JU.switcher.streetDraw();
  if (st.free && W.spots && !st.hold) for (const s of W.spots) if (Math.abs(s.x - cam.x) < 1700 && !(s.show && !s.show())) mark(s, s === st.near);
  if (!st.locked) W.front();                     // close-ups drop the poles that would cross the frame
  g.restore();

  if (st.sense > .01) {                          // the pull of it, bleeding in from the side it comes from
    const dir = clamp((JU.tokyo.SRC[0] - me.x) / 900, -1, 1), cx = VW * (.5 - dir * .25);
    const gr = g.createRadialGradient(cx, VH * .5, VH * .3, cx, VH * .5, VW * .8);
    gr.addColorStop(0, 'rgba(150,70,255,0)'); gr.addColorStop(1, `rgba(150,70,255,${st.sense * (.22 + .5 * st.pulse)})`);
    g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  }
  const vg = g.createRadialGradient(VW / 2, VH * .5, VH * .45, VW / 2, VH * .5, Math.max(VW, VH) * .75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)');
  g.fillStyle = vg; g.fillRect(0, 0, VW, VH);
}

const scene = { mode: 'street', update, render, press(a) {
  if (st.talk) { JU.story.press(a); return; }                          // somebody is speaking: the key turns their page
  if (st.free && st.near && !st.hold && E.T >= (st.wait || 0) && (a === 'ok' || a === 'm1')) { sfx.confirm(); st.near.use(st.near); return; }   // E (or a click): whatever is within reach
  if (st.free && JU.awakened && JU.awakened.streetKey(a)) return;      // R + 2 with Awakened Projection: Top Speed, out on the street
  if (st.free && JU.switcher && JU.switcher.streetKey(a)) return;      // R with Switcher Stitcher: Boogie Woogie with whoever is nearest
  if (!(st.free && JU.clan.key(a))) JU.story.press(a);
} };
JU.street = { start, scene, setObj, fight, talk, travel, status,
  get world() { return W; }, get me() { return me; }, get megumi() { return megumi; }, get st() { return st; }, get npcs() { return npcs; }, get curses() { return curses; }, get cast() { return cast; } };
})();
