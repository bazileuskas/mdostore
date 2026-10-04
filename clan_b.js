/* JUJUTSU UNLIMITEDS — clan abilities II: Sukuna. Choke hold, Malevolent Shrine, and what happens after he dies */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, F = E.F, box = E.box, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, K = JU.clan, keys = E.keys;
const { clamp, rnd, ZP, LINE } = E, TAU = Math.PI * 2, RED = '#ff2440', { shout, hostOf, wear } = JU.clanKit;
const vowEl = document.getElementById('vows');
const wand = { t: 0, d: 1 }, buff = { mute: 0, blood: false, haste: 0, forced: 0 }, used = {};
let cd = 0, domCd = 0, finger = null, auto = false, aiT = 0, menu = false;
const vessel = () => (K.st.host && K.st.host.vessel ? K.st.host : null);

/* ---------- R: choke hold. Eight cleaves round the head, ten each ---------- */
const CHOKE = { name: 'Choke Hold', dur: 2, run(p, m, t) {
  const o = m.o, n = Math.floor(t / .2);
  p.vx = 0; p.rate = 30; p.target = t < 1.7 ? POSE.jab : POSE.idle;
  if (t < 1.7 && !o.ko) Object.assign(o, { x: p.x + p.face * 112, y: 62, vx: 0, vy: 0, ground: true, state: 'hurt', stun: .5, face: -p.face });   // held off the floor
  if (n !== m.n && n < 8 && !o.ko) {
    m.n = n; sfx.hit(false);
    for (let i = 0; i < 2; i++) V.slash(o.x + rnd(-30, 30), o.y + 215 * (o.scale || 1) + rnd(-30, 30), rnd(0, TAU), 190, RED, 8);
    E.applyHit(o, p.face, { dmg: 10 / (o.dr || 1), kb: 0, stun: .5, stop: .03, col: RED, fixed: 1 });
  }
  if (t >= 1.7 && !m.drop) { m.drop = 1; if (!o.ko) Object.assign(o, { ground: false, state: 'air', vy: 200, vx: p.face * 500 }); }
} };

/* ---------- G with Shrine equipped: Domain Expansion, Malevolent Shrine ---------- */
const DOMAIN = { name: 'Malevolent Shrine', dur: 4.4, glow: 'red', run(p, m, t) {
  const o = E.P2, n = Math.floor((t - .7) / .22);
  p.vx = 0; p.rate = 16; p.target = t < 4 ? JU.domain.SIGN : POSE.idle;
  if (!m.c) {                                     // the opening plays with the fight frozen, and nothing can interrupt him once it has begun
    m.c = 1; p.inv = 5;                           // the close-up is his own face, unless he is wearing a vessel
    JU.domain.open({ who: p, tone: 'red', skin: vessel() ? null : JU.sukuna.SUKUNA,
      reveal() {
        JU.domain.raise('shrine', { who: p, dur: 8.5, cancel() { if (p.move && p.move.def === DOMAIN) E.endMove(p); p.inv = 0; } });   // it stands a while after the cutting stops, so he can fight inside it. G lets it go early
        cam.shake = 24; E.after(.25, () => E.banner('伏魔御廚子', 'MALEVOLENT SHRINE', 'sm'));
      } });
  }
  if (t > .7 && n !== m.n && n < 15) {            // everything inside is cut, over and over
    m.n = n;
    for (let i = 0; i < 5; i++) V.slash(cam.x + rnd(-700, 700), rnd(40, 420), rnd(0, TAU), rnd(260, 560), RED, 9, i * .03);
    if (!o.ko && o.state !== 'down') E.applyHit(o, p.face, { dmg: 7, kb: 40, stun: .5, stop: .02, col: RED });
  }
} };
const awaken0 = H.awaken, tickAll0 = H.tick, startAll0 = H.fightStart, own = () => !!K.active && K.active.id === 'sukuna';
H.tick = dt => { tickAll0(dt); if (domCd > 0 && !own()) domCd -= dt; };          // outside the clan nothing else counts the cooldown down
H.fightStart = (cfg, wave) => { if (JU.domain.granted) domCd = 0; startAll0(cfg, wave); };
H.awaken = p => {                                 // the Sukuna clan with Shrine, or a story fight that hands him his domain
  if (!(JU.domain.granted === 'shrine' || (own() && JU.tech.equipped === 'shrine'))) return awaken0(p);
  if (domCd > 0) { shout(p, 'Domain: ' + Math.ceil(domCd) + 's', '#c88'); return; }
  if (p.ground && !p.move && !p.ps && !p.dead) { domCd = JU.training && JU.training.on ? 0 : 30; p.move = { def: DOMAIN, t: 0 }; }   // no waiting in Training
};

/* ---------- death: he becomes a finger, his killer eats it, and that body is his vessel ---------- */
const marked = skin => Object.assign({}, skin, { head() {     // the same face, with his marks on it
  skin.head();
  g.strokeStyle = '#0c0a0e'; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath();
  g.moveTo(8, -12); g.lineTo(11, -7); g.lineTo(14, -12); g.moveTo(-8, 10); g.lineTo(-2, 17); g.moveTo(-11, 13); g.lineTo(-5, 20); g.moveTo(22, 11); g.lineTo(24, 18);
  g.stroke(); g.lineCap = 'butt';
  g.fillStyle = '#d0102a';
  g.beginPath(); g.ellipse(5, 11, 3, 1.4, .15, 0, TAU); g.fill(); g.beginPath(); g.ellipse(17, 11, 2.4, 1.4, -.15, 0, TAU); g.fill();
} });
function incarnate() {
  const p = E.P1, o = E.P2, cfg = Fi.fight.cfg;
  finger = null; auto = true; menu = false; vowEl.classList.remove('on');
  Object.assign(buff, { mute: 0, blood: false, haste: 0, forced: 0 });
  for (const k in used) delete used[k];
  Object.assign(p, { dead: false, ps: null, alpha: undefined, x: o.x, y: 0, ground: true });
  wear(p, hostOf(o, { skin: marked(o.skin), jp: '器', vessel: true }));
  o.alpha = 0; o.ko = true;
  Fi.fight.paused = false;
  if (cfg && cfg.onWin) cfg.onWin();            // the fight is over: he walks out of it wearing whatever beat him
  if (JU.street) JU.street.setObj('Inside the vessel', 'It walks on its own · T take over · V binding vow');
}

/* ---------- binding vows with the vessel ---------- */
const VOWS = [
  ['Enchain', 'The vessel is healed in full. For one minute the body is yours, and in that minute you cannot hurt anyone.'],
  ['Blood Price', 'Take thirty percent of the vessel\'s health. In exchange every blow lands forty percent harder for as long as it lasts.'],
  ['A Stolen Minute', 'For one minute its cooldowns come back twice as fast. Afterwards the vessel takes its body back for fifteen seconds.']
];
function drawVows() {
  vowEl.innerHTML = '<small>Binding vow · 縛り</small>' + VOWS.map((v, i) => `<div class="${used[i] ? 'used' : ''}"><kbd>${i + 1}</kbd><b>${v[0]}</b><i>${v[1]}</i></div>`).join('') + '<em>1 · 2 · 3 seals one · V closes</em>';
}
function seal(i, inScene) {
  const p = E.P1, h = vessel();
  if (used[i]) return;
  used[i] = 1; menu = false; vowEl.classList.remove('on');
  if (i === 0) { buff.mute = 60; buff.forced = 0; auto = false; keys.delete('a'); keys.delete('d'); if (!inScene) p.hp = p.max; }
  else if (i === 1) { buff.blood = true; h.hp = Math.round(h.hp * .7); if (!inScene) { p.max = Math.round(p.max * .7); p.hp = Math.min(p.hp, p.max); } }
  else buff.haste = 60;
  E.banner('縛り', 'BINDING VOW', 'sm'); sfx.bf();
}
function tickBuff(dt, fight) {
  if (buff.mute > 0) buff.mute -= dt;
  if (buff.forced > 0) buff.forced -= dt;
  if (buff.haste > 0) {
    if (fight) for (const k in E.cd) if (E.cd[k] > 0) E.cd[k] = Math.max(0, E.cd[k] - dt);     // a second helping of cooldown each frame
    if ((buff.haste -= dt) <= 0) { buff.forced = 15; auto = true; }
  }
}

K.ext('sukuna', {
  r(p) {
    const o = E.P2, gap = (o.x - p.x) * p.face;
    if (cd > 0) { shout(p, 'Not yet', '#c88'); return; }
    if (!p.ground || p.move || p.ps || p.dead || o.ko || o.state === 'down') return;
    if (gap < -30 || gap > 210) { shout(p, 'Too far', '#c88'); return; }
    cd = 8; p.move = { def: CHOKE, t: 0, o }; shout(p, '握', RED); sfx.charge();
  },
  press(a, inScene) {
    const v = vessel();
    if (menu) {
      const i = ['strikes', 'crush', 'div'].indexOf(a);
      if (i >= 0) seal(i, inScene); else if (a === 'vow' || a === 'skip') { menu = false; vowEl.classList.remove('on'); }
      return true;
    }
    if (a === 'vow') {
      if (v) { menu = true; drawVows(); vowEl.classList.add('on'); } else if (!inScene) shout(E.P1, 'No vessel to bargain with', '#c88');
      return true;
    }
    if (a !== 'takeover') return false;
    if (!v) return true;
    if (buff.forced > 0) { if (!inScene) shout(E.P1, 'The vessel has the body', '#c88'); return true; }
    auto = !auto; keys.delete('a'); keys.delete('d');
    if (inScene) JU.street.setObj(auto ? 'Inside the vessel' : 'In control', auto ? 'It walks on its own · T take over · V binding vow' : 'W A S D move · T let go · V binding vow');
    else shout(E.P1, auto ? 'Letting go' : 'Taking over', RED);
    return true;
  },
  power: () => (buff.mute > 0 ? 0 : buff.blood ? 1.4 : 1),
  start() { finger = null; },
  death() {
    const p = E.P1;
    if (E.P2.ko || finger) return !!finger;
    p.dead = true; p.ps = p.ground ? 'down' : 'air'; p.stun = 99;
    Fi.fight.paused = true; E.slow(.8); E.banner('指', 'A CURSED OBJECT', 'sm'); sfx.bf();
    finger = { x: p.x, t: 0, stage: 0 };
    return true;
  },
  tick(dt) {
    const p = E.P1, o = E.P2;
    if (cd > 0) cd -= dt;
    if (domCd > 0) domCd -= dt;
    if (finger) {
      finger.t += dt;
      if (finger.stage === 0 && finger.t > 1.1) { finger.stage = 1; p.alpha = 0; V.ring(finger.x, 40, 130, RED, .4); }
      else if (finger.stage === 1) {              // whatever killed him comes over to it
        const dx = finger.x - o.x;
        Object.assign(o, { state: 'idle', act: null, tele: 0 });
        if (Math.abs(dx) > 50) o.vx = Math.sign(dx) * 300; else { finger.stage = 2; finger.t = 0; o.vx = 0; sfx.land(); }
      } else if (finger.stage === 2 && finger.t > .7) {
        finger.stage = 3; finger.t = 0;
        V.ring(o.x, o.y + 150, 300, RED, .5); V.sparks(o.x, 180, 'red', 20); cam.shake = 22; E.banner('受肉', 'INCARNATED', 'sm'); sfx.bf();
      } else if (finger.stage === 3 && finger.t > 1.4) incarnate();
      return;
    }
    if (!vessel()) return;
    tickBuff(dt, true);
    if (auto && !Fi.fight.paused && !p.dead) {    // the vessel fights for itself
      const dx = o.x - p.x;
      keys.delete('a'); keys.delete('d');
      if (!o.ko) { if (Math.abs(dx) > 135) keys.add(dx > 0 ? 'd' : 'a'); else if ((aiT -= dt) <= 0) { aiT = .34; JU.game.press('m1'); } }
    }
  },
  street(dt) {                                    // out on the street it wanders where it likes
    if (!vessel()) return;
    tickBuff(dt, false);
    if (!auto) return;
    if ((wand.t -= dt) <= 0) { wand.t = rnd(1.5, 3.5); wand.d = Math.random() < .2 ? 0 : Math.random() < .75 ? 1 : -1; }
    for (const k of ['a', 'd', 'w', 's']) keys.delete(k);
    if (wand.d) keys.add(wand.d > 0 ? 'd' : 'a');
  },
  fx() {
    if (!finger || finger.stage > 1 || finger.stage < 1) return;
    const c = F(finger.x, 0), k = c[2];           // the finger, lying where he fell
    g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.red, c[0], c[1] - 20 * k, 150 * k, .7); g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#6b4a3a'; g.strokeStyle = LINE; g.lineWidth = 3;
    g.beginPath(); g.roundRect(c[0] - 9 * k, c[1] - 46 * k, 18 * k, 46 * k, 6 * k); g.fill(); g.stroke();
    g.fillStyle = '#1a1014'; g.fillRect(c[0] - 6 * k, c[1] - 44 * k, 12 * k, 12 * k);
  },
  begin() { cd = domCd = 0; finger = null; auto = false; menu = false; vowEl.classList.remove('on'); },
  end() { finger = null; menu = false; vowEl.classList.remove('on'); for (const k of ['a', 'd']) keys.delete(k); }
});
})();
