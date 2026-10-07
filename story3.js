/* JUJUTSU UNLIMITEDS — chapter 3: Megumi against Sukuna, the heart, the binding vow, the morgue, and Nobara */
(() => {
'use strict';

const E = JU.eng, C = JU.cast, S = JU.story, Fi = JU.fights, V = JU.vfx, ST = JU.stages, D = JU.sets, sfx = JU.sfx, cam = E.cam, root = E.root, POSE = E.POSE, H = E.hooks;
const { clamp, rnd } = E, cut = JU.school.cut, nm = Fi.nm;
const fade = root.querySelector('#fade');

Object.assign(S.WHO, { shoko: ['The Healer', '医師', '#b9c3cc'], nobara: ['Straw Doll', '藁人形', '#ff9a4d'] });

// Sukuna as an opponent: quicker than anything so far, and he throws cuts from range
Fi.DEFS.sukuna = { name: 'King of Curses', jp: '呪いの王', skin: JU.sukuna.SUKUNA, hp: 240, scale: 1, speed: 250, range: 190, gap: [.45, 1.1], dr: .6,
  atk: [{ pre: 'hookWind', pose: 'hook', wind: .42, lunge: 380, reach: 200, dmg: 8, kb: 420, stun: .45 },
        { pre: 'kickWind', pose: 'kick', wind: .5, lunge: 420, reach: 220, dmg: 11, kb: 620, lift: 560 },
        { pre: 'hookWind', pose: 'jab', wind: .6, lunge: 0, far: 1, shot: 1, dmg: 9, kb: 380, stun: .5 }] };

const stand = (skin, x, face) => { const f = E.fighter(skin, x, face); f.pose = C.STAND.slice(); f.target = C.STAND; return f; };
const nobody = () => { const f = Fi.make('grunt', 800); f.alpha = 0; f.ko = true; f.state = 'down'; return f; };
const SIT = [0, 0, .35, -.15, 1.5, 1.44, 0], HOLD = [-.04, 0, 1.45, .15, .22, -.22, 0], WAVE = [.02, -.1, 2.75, -.06, .07, -.07, 0];
let brawl = false;

/* ---------- 1: the curtain lifts and Megumi finds the wrong person standing there ---------- */
function begin() {
  ST.setBoss(false); ST.setVeil(null);
  const s = E.P1, side = s.x < 0 ? 1 : -1, m = stand(C.MEGUMI, clamp(s.x + side * 900, -940, 940), -side);
  cut({
    extra: () => [m], look: () => m.x, cx: () => (s.x + m.x) / 2, delay: 900,
    tick(real) {                                  // he runs in from where the curtain was
      const tx = s.x + side * 300, walking = Math.abs(m.x - tx) > 12;
      if (walking) m.x += Math.sign(tx - m.x) * 420 * real;
      C.stroll(m, walking, real, 1.3);
    },
    lines: [
      ['megumi', 'Vessel! The curtain is down, are you... no.'],
      ['megumi', 'Those marks. You are not Vessel.'],
      ['sukuna', 'The brat is asleep. He handed me this body, and now he cannot take it back.'],
      ['megumi', 'Then I will beat you until he wakes up.'],
      ['sukuna', 'Good. Come and entertain me, Shadow Summoner.']
    ],
    then() {                                      // from here the player is Megumi, with the Ten Shadows
      JU.sukuna.revert(); JU.tech.apply('ten');
      brawl = true;
      Fi.start({ foes: ['sukuna'], stage: ST.school, label: 'Summoner', p1x: clamp(m.x, -500, 500), floor: 6, low: { at: .3, fn: heart } });
      E.P1.skin = C.MEGUMI;
      nm.p1.textContent = 'Shadow Summoner'; nm.p1j.textContent = '影法師';
      E.banner('影法師', 'SHADOW SUMMONER', 'sm');
    }
  });
}

const tick0 = H.tick, reset0 = H.reset;
H.tick = dt => {                                  // part-way through, Sukuna simply stops fighting
  tick0(dt);
  if (brawl && !Fi.fight.paused && (E.P2.hp <= E.P2.max * .65 || Fi.fight.time > 28)) heart();
};
H.reset = () => { reset0(); brawl = false; };

/* ---------- 2: the heart ---------- */
function heart() {
  if (!brawl) return;
  brawl = false;
  const m = E.P1, s = E.P2;
  let held = false;
  Fi.fight.paused = true;
  Object.assign(s, { state: 'idle', act: null, tele: 0, vx: 0, vy: 0, y: 0, ground: true, target: C.STAND, rate: 14 });
  if (m.move) E.endMove(m);
  m.ps = null; m.vx = 0; m.dashT = 0;
  JU.tech.revert();
  V.custom(90, () => { if (held) { const w = E.hand(s, true); D.heart(w[0], w[1] + 8, 1 + .12 * Math.sin(E.T * 9)); } });
  const rip = () => {
    s.target = POSE.hookWind; s.rate = 30;
    Fi.later(320, () => {
      const x = s.x + s.face * 14, y = 190;
      held = true; s.target = HOLD; cam.shake = 22; sfx.hit(true); E.stop(.1);
      V.sparks(x, y, 'red', 22); V.ring(x, y, 170, '#ff2440', .35);
      for (let i = 0; i < 14; i++) V.puff('red', x, y, s.face * rnd(40, 320), rnd(-80, 260), rnd(18, 34), rnd(.4, .8), -1500);
    });
  };
  cut({
    look: () => s.x, cx: () => (m.x + s.x) / 2, zoom: 1.25,
    tick() { if (s.target !== POSE.down) s.face = m.x > s.x ? 1 : -1; },
    lines: [
      ['sukuna', 'Shadows that answer to you. Not bad, Shadow Summoner. I was almost enjoying myself.'],
      ['sukuna', 'But I have just thought of something better.'],
      ['megumi', 'What are you doing? Stop!'],
      ['sukuna', 'Watch closely.', rip],
      ['megumi', 'That is... that is Vessel\'s heart!'],
      ['sukuna', 'I do not need one to live. He does. If the brat takes this body back now, he dies.'],
      ['sukuna', 'A hostage. Simple enough, is it not?'],
      ['yuji', 'Shadow... sorry. I am taking it back anyway.', () => { s.skin = E.YUJI; JU.flash(innerWidth / 2, innerHeight / 2); }],
      ['megumi', 'Don\'t! Without a heart you will—'],
      ['yuji', 'I know. Look after everyone for me. And live a long time, okay?', () => { held = false; s.target = POSE.down; s.rate = 5; }],
      ['megumi', 'Vessel. ...Vessel!']
    ],
    then() { fade.classList.add('on'); Fi.later(1100, domain); }
  });
}

/* ---------- 3: Sukuna's innate domain, and the vow ---------- */
function domain() {
  V.clear(); ST.clear();
  const sk = E.fighter(JU.sukuna.SUKUNA, 330, -1);
  sk.y = sk.ground0 = 220; sk.pose = SIT.slice(); sk.target = SIT;
  E.arena({ stage: D.domain, foe: sk, skin: E.YUJI, p1x: -330, yaw: .3 });
  nm.p1.textContent = 'The Vessel'; nm.p1j.textContent = '器';
  fade.classList.remove('on');
  Fi.later(600, () => E.banner('生得領域', 'INNATE DOMAIN', 'sm'));
  const y = E.P1, g = E.g;
  const vow = () => {
    E.banner('縛り', 'BINDING VOW', 'sm'); sfx.bf(); cam.shake = 16;
    V.custom(3.2, u => {                          // a ring of chain drawing tight around him
      const c = E.F(y.x, 150), R = (200 - 80 * Math.min(1, u * 2)) * c[2];
      g.strokeStyle = `rgba(255,60,80,${Math.min(1, (1 - u) * 4)})`; g.lineWidth = 5;
      for (let i = 0; i < 14; i++) { const th = i / 14 * 6.283 + E.T * 1.5; g.beginPath(); g.ellipse(c[0] + Math.cos(th) * R, c[1] + Math.sin(th) * R * .42, 16 * c[2], 9 * c[2], th, 0, 6.283); g.stroke(); }
    });
  };
  cut({
    look: () => sk.x, cx: () => 0, zoom: .95, lift: 77, delay: 2200,
    lines: [
      ['sukuna', 'You look lost, brat. This is the inside of me. You are here because your body no longer has a heart.'],
      ['yuji', 'Then fix it! You are the one who tore it out!'],
      ['sukuna', 'I will. On my terms. We make a binding vow.'],
      ['sukuna', 'When I chant "Enchain", you hand this body over to me for one minute.'],
      ['yuji', 'One minute for you to kill someone. No.'],
      ['sukuna', 'In that minute I will not hurt anyone. Not kill, not harm. That is part of the vow, and a vow punishes whoever breaks it.'],
      ['sukuna', 'In exchange, your heart beats again. Well?'],
      ['yuji', '...One minute. Nobody gets hurt. And I get to go back.'],
      ['yuji', 'Fine. I accept.', vow],
      ['sukuna', 'Then it is sealed. Off you go, brat. Wake up.']
    ],
    then() { fade.classList.add('on'); Fi.later(1100, morgue); }
  });
}

/* ---------- 4: the morgue ---------- */
function morgue() {
  V.clear();
  E.arena({ stage: D.morgue, foe: nobody(), skin: E.YUJI, p1x: 70, yaw: -.22 });
  const y = E.P1, go = stand(C.GOJO, -330, 1), sh = stand(D.SHOKO, 350, -1);
  let hop = 0;
  go.scale = 1.1; go.rate = sh.rate = 10;
  y.y = y.ground0 = 92; y.pose = POSE.down.slice(); y.target = POSE.down; y.rate = 6;   // laid out on the table
  fade.classList.remove('on');
  Fi.later(600, () => E.banner('遺体安置所', 'THE MORGUE', 'sm'));
  cut({
    free: true, extra: () => [go, sh], cx: () => 20, zoom: 1.1, delay: 2200,
    tick(real) { E.blend(go, real); E.blend(sh, real); hop = Math.max(0, hop - real * 3); sh.y = Math.sin(hop * Math.PI) * 46; },
    lines: [
      ['shoko', 'The Vessel. Fifteen. No heart. What a waste. Right, let us get the autopsy over with.'],
      ['gojo', 'Be thorough, The Healer. I want to know everything about how a vessel—'],
      ['yuji', '...Uh. Hi. Why is it so cold in here?', () => { y.target = SIT; cam.shake = 5; sfx.jump(); }],
      ['shoko', 'He is sitting up. He had no heart ten seconds ago. That is not how any of this works!', () => {
        hop = 1; sh.target = POSE.hurt; E.fx.push({ k: 2, x: sh.x, y: 380, n: '!?', col: '#fff', t: 0, life: 1.1 });
        Fi.later(1300, () => { sh.target = C.STAND; });
      }],
      ['gojo', 'Vessel! Welcome back!', () => { go.target = WAVE; Fi.later(1700, () => { go.target = C.STAND; }); }],
      ['shoko', 'You are not even surprised?'],
      ['gojo', 'Not even a little. I had a feeling he was not finished.'],
      ['yuji', 'Blindfolded Infinity-sensei... I think I made a deal with him. It is all fuzzy.'],
      ['gojo', 'We will get to that. For now, as far as the higher-ups know, The Vessel is dead. Let us keep it that way for a while.']
    ],
    then() { fade.classList.add('on'); Fi.later(1100, kugisaki); }
  });
}

/* ---------- 5: Megumi and Nobara, out in the city ---------- */
function kugisaki() {
  V.clear();
  JU.street.start({ duo: { me: C.MEGUMI, pal: D.NOBARA } });
  root.classList.add('cine');
  fade.classList.remove('on');
  Fi.later(700, () => E.banner('藁人形', 'STRAW DOLL', 'sm'));
  Fi.later(3000, () => {
    S.say([
      ['nobara', 'So this is Tokyo at night. Louder than I pictured. I love it.'],
      ['megumi', 'You have been here a week, Straw Doll.'],
      ['nobara', 'And you have barely said ten words in it. It is about the other first-year. Vessel.'],
      ['megumi', '...He died getting me out of there. I had known him two weeks.'],
      ['nobara', 'I never even got to meet him. Was he strong?'],
      ['megumi', 'He was an idiot. He swallowed a special-grade cursed object to save people he had only just met.'],
      ['nobara', 'So, strong.'],
      ['megumi', '...Yeah.'],
      ['nobara', 'Then we get stronger. Strong enough that nobody has to do that for us again. Got it, Shadow?'],
      ['megumi', 'Got it.']
    ], () => JU.chapters.done(3));
  });
}

// jumping straight here from the chapter select: stand Sukuna in the yard first
function enter() {
  ST.clear(); V.clear();
  E.arena({ stage: ST.school, foe: nobody(), p1x: -120, yaw: -.3 });
  JU.sukuna.awaken(); begin();
}

JU.chapter3 = { begin, enter, heart, domain, morgue, kugisaki };
})();
