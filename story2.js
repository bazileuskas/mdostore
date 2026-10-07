/* JUJUTSU UNLIMITEDS — the school: clearing curses with Megumi, then the Finger Bearer and what wakes up */
(() => {
'use strict';

const E = JU.eng, C = JU.cast, S = JU.story, Fi = JU.fights, V = JU.vfx, ST = JU.stages, sfx = JU.sfx, cam = E.cam, root = E.root;
const { lerp, clamp, rnd } = E;
const fade = root.querySelector('#fade');

// freeze the fight and play a conversation in the arena.
// o: { lines, then, extra: () => [people], tick(real), cx: () => x, zoom, delay }
function cut(o) {
  root.classList.add('cine');
  E.setScene({
    mode: 'story',
    update(dt, real) {
      const y = E.P1, lim = Math.max(0, 1050 - E.VW / 2);
      if (!y.ground) { y.vy -= 2700 * real; y.y += y.vy * real; if (y.y <= 0) { y.y = 0; y.ground = true; } }
      const f = E.P2, at = o.look ? o.look() : (f.ko || f.alpha === 0 ? null : f.x);
      if (at !== null) y.face = at >= y.x ? 1 : -1;
      if (f.ko && f.alpha !== 0) f.alpha = Math.max(0, (f.alpha === undefined ? 1 : f.alpha) - real * .8);   // a beaten curse finishes dissolving
      if (o.free) E.blend(y, real); else C.stroll(y, false, real);
      E.blend(f, real);
      if (o.tick) o.tick(real);
      cam.x = lerp(cam.x, clamp(o.cx ? o.cx() : y.x, -lim, lim), 1 - Math.exp(-real * 2.5));
      cam.yaw = lerp(cam.yaw, .1 * Math.sin(E.T * .3), 1 - Math.exp(-real * 1.5));
      cam.zoom = lerp(cam.zoom, o.zoom || 1.18, 1 - Math.exp(-real * 2));
      cam.lift = lerp(cam.lift, o.lift === undefined ? 135 : o.lift, 1 - Math.exp(-real * 2));
      S.tick(real);
    },
    render(dt, real) { E.renderArena(real, o.extra ? o.extra() : []); },
    press: S.press
  });
  const go = () => S.say(o.lines, () => { root.classList.remove('cine'); o.then(); });
  if (o.delay) Fi.later(o.delay, go); else go();
}

const stand = (skin, x, face) => { const f = E.fighter(skin, x, face); f.pose = C.STAND.slice(); f.target = C.STAND; return f; };

/* ---------- 1: arriving ---------- */
function begin() {
  fade.classList.add('on');
  Fi.later(800, () => {
    ST.clear();
    const nobody = Fi.make('grunt', 700); nobody.alpha = 0; nobody.ko = true; nobody.state = 'down';
    E.arena({ stage: ST.school, foe: nobody, p1x: -260, yaw: -.3 });
    const m = stand(C.MEGUMI, -40, -1);
    fade.classList.remove('on');
    Fi.later(500, () => E.banner('廃校', 'THE SCHOOL', 'sm'));
    cut({
      extra: () => [m], look: () => m.x, tick: real => C.stroll(m, false, real), cx: () => -150, delay: 1900,
      lines: [
        ['megumi', 'This is it. The curtain is already down, so nobody outside can see in.'],
        ['megumi', 'Two curses in the yard. Low grade. We clear them, then the building.'],
        ['yuji', 'Easy. I am still warmed up from this morning.'],
        ['megumi', 'Do not get cocky. They hit back. Watch for the red ring closing on them, then dash through the swing.'],
        ['megumi', 'I will hang back and send the Divine Dog in. Go.']
      ],
      then: () => Fi.start({ foes: ['grunt', 'brute'], stage: ST.school, megumi: true, label: 'The school', p1x: -260, onWin: cleared })
    });
  });
}

/* ---------- 2: the yard is clear, and then it is not ---------- */
function cleared() {
  const y = E.P1, side = y.x < 0 ? 1 : -1, m = stand(C.MEGUMI, clamp(y.x + side * 250, -900, 900), -side);
  const tick = real => { m.face = y.x > m.x ? 1 : -1; C.stroll(m, false, real); };
  cut({
    extra: () => [m], look: () => m.x, tick, cx: () => (y.x + m.x) / 2,
    lines: [
      ['megumi', 'That is the yard clear. Not bad.'],
      ['yuji', 'Told you. Easy.'],
      ['megumi', '...Wait. Do you feel that?']
    ],
    then() {                                   // the pressure lands and a curtain drops between them
      ST.setBoss(true); ST.setVeil(side * 820);
      cam.shake = 28; sfx.bf(); V.impact(.36, y.x, 150); V.crack(y.x, 300);
      E.banner('特級', 'SPECIAL GRADE', 'sm');
      cut({
        extra: () => [m], look: () => m.x, cx: () => y.x, delay: 1300,
        tick(real) {                           // Megumi is thrown back behind it and lost from sight
          m.x = lerp(m.x, side * 940, 1 - Math.exp(-real * 3)); C.stroll(m, false, real);
          m.alpha = Math.max(0, (m.alpha === undefined ? 1 : m.alpha) - real * .45);
        },
        lines: [
          ['megumi', 'Vessel! Get back! That is not a grade three!'],
          ['megumi', 'It is a special grade! Do not fight it, just ru—'],
          ['yuji', 'Shadow?! I cannot see you! ...Shadow!'],
          ['yuji', 'Okay. Okay. Just me, then.']
        ],
        then: boss
      });
    }
  });
}

/* ---------- 3: alone with the Finger Bearer ---------- */
function boss() {
  Fi.start({ foes: ['finger'], stage: ST.school, label: 'Special grade', p1x: clamp(E.P1.x, -500, 500), floor: 5, rage: 24,
    low: { at: .24, fn: takeover }, onWin: ending });
  E.banner('特級呪霊', 'FINGER BEARER', 'sm');
}

// Yuji is about to lose: the screen breaks up into impact frames, and someone else stands up
function takeover() {
  const y = E.P1, o = E.P2, fight = Fi.fight;
  fight.paused = true;
  E.slow(1.7); cam.shake = 32; sfx.bf();
  V.impact(1.5, y.x, y.y + 150);
  for (let i = 0; i < 12; i++) { const a = rnd(0, 6.28), l = rnd(260, 620); V.bolt(y.x, 150, y.x + Math.cos(a) * l, 150 + Math.sin(a) * l, '#ff2440', rnd(.5, 1.4), rnd(3, 7), '#060205'); }
  Fi.later(700, () => { cam.shake = 26; sfx.bf(); });
  Fi.later(1500, () => fade.classList.add('on'));
  Fi.later(2200, () => {
    JU.sukuna.awaken();
    y.y = 0; y.vy = 0; y.vx = 0; y.ground = true;
    const dir = o.x >= y.x ? 1 : -1;
    Object.assign(o, { x: clamp(y.x + dir * 520, -930, 930), y: 0, vx: 0, vy: 0, ground: true, state: 'idle', act: null, tele: 0, dr: 1.5, poise: false });
    o.ai.t = 2.2;
    fade.classList.remove('on');
    cut({
      cx: () => y.x, zoom: 1.32, delay: 700,
      lines: [
        ['sukuna', 'Hah. Hahaha! So this is as far as the brat goes.'],
        ['sukuna', 'Losing to a thing like this. Pathetic.'],
        ['sukuna', 'You. Curse. You were looking down on me just now.'],
        ['sukuna', 'Know your place.']
      ],
      then() { E.setScene(null); cam.lift = 0; fight.paused = false; E.banner('呪いの王', 'KING OF CURSES', 'sm'); }
    });
  });
}

/* ---------- 4: after ---------- */
function ending() {
  const y = E.P1;
  cut({
    cx: () => y.x, zoom: 1.32,
    lines: [
      ['sukuna', 'Boring. I expected a finger of mine to put up more of a fight.'],
      ['sukuna', 'Now then. The brat is still asleep in here...'],
      ['sukuna', 'I think I will keep this body a little longer.']
    ],
    then: () => JU.chapter3.begin()
  });
}

const reset0 = E.hooks.reset;
E.hooks.reset = () => { reset0(); ST.clear(); };

JU.school = { begin, cut };
})();
