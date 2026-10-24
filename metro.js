/* JUJUTSU UNLIMITEDS — Build 0.16v1: THE METRO. Getting off the train is no longer getting off in the street. Every stop is a station now
   (Kyoto's is the bullet train's), and it has to be walked through:
     arriving: off the train onto the platform; up the stairs, the escalator or the lift; out through the ticket gates, which take the
     ticket; across the concourse; up the exit stairs and out into the district.
     leaving: down the district's subway stairs; a ticket from the machines, paid in yen (yen.js); in through the gates; down to the
     platform; onto the train, where the route map (shibuya.js) asks where to. The screen over the train's doors says the next stop.
   A ticket is a fare: the route map only lets him off at a stop that costs that much or less. From anywhere: Shibuya ¥180, Tokyo and
   Shinjuku ¥210, Jujutsu High ¥430, Kyoto by bullet train ¥14,170. The gates stay shut without one (the team's account walks through), and
   going back out of the gates he came in by, without riding, gives the ticket back.
   One plan does for every station, each with its own line, colours, signs, train and neighbours: Tokyo (Marunouchi line, M17), Shibuya
   (Fukutoshin line, F16), Shinjuku (Marunouchi line, M08) and Kyoto (Tokaido Shinkansen). West to east: the exit stairs; the concourse,
   with the ticket machines, the fare chart over them and the station office's window; the gates; the stairs, the escalator and the lift
   down; and below, the platform, with its own stairs, escalator and lift back up, the platform doors and the train.
   Jujutsu High's station is a small one on the surface, inside its own map (jjh.js); it uses the machines, the gates and the train from here */
(() => {
'use strict';

const E = JU.eng, g = E.g, P = E.P, box = E.box, glow = E.glow, GLOW = E.GLOW, cam = E.cam, C = JU.cast, sfx = JU.sfx, S = JU.street, SH = JU.shibuya, K = SH.kit, Y = JU.yen;
const { lerp, clamp, rnd, ease } = E, TAU = Math.PI * 2, { slab, fill, lit, on, text, JP, EN } = K;
const dev = () => !!(JU.account && JU.account.dev);

/* ================= fares, and the machines that sell them ================= */
const FARE = { shibuya: 180, tokyo: 210, shinjuku: 210, jjh: 430, kyoto: 14170 };
const BUTTONS = [180, 210, 430, 14170];
const fareOf = id => FARE[id] || 210;
const yen = n => Y.fmt(n);
const tm = document.createElement('div'), hint = document.createElement('div'), lcd = document.createElement('div');
tm.className = 'tmach'; hint.className = 'mhint'; lcd.className = 'mlcd';
E.root.appendChild(tm); E.root.appendChild(hint); E.root.appendChild(lcd);
let tmOpen = false, hintT = 0;
function say(t) { hint.textContent = t; hint.classList.add('on'); clearTimeout(hintT); hintT = setTimeout(() => hint.classList.remove('on'), 2200); }
function paintMachine(msg, ok) {
  const rows = SH.STOPS.filter(s => FARE[s.id] && !s.soon).map(s => `<li><i class="rnd" style="--c:${s.code[2]}"><b>${s.code[0]}</b>${String(s.code[1]).padStart(2, '0')}</i><span>${s.name}<small lang="ja">${s.jp}${s.id === 'kyoto' ? ' · 新幹線' : ''}</small></span><b>${yen(fareOf(s.id))}</b></li>`).join('');
  tm.innerHTML = `<div class="tmbox" role="dialog" aria-modal="true" aria-label="Ticket machine"><div class="tmhead"><b lang="ja">きっぷうりば</b><span>Tickets</span><em>${dev() ? 'Team account · free' : yen(Y.y)}</em></div>
    <div class="tmbody"><div class="tmfares"><p><b lang="ja">運賃表</b> Fares from here</p><ul>${rows}</ul></div>
    <div class="tmbtns">${BUTTONS.map(f => `<button data-fare="${f}" class="${f > 1000 ? 'shin' : ''}${Y.ticket === f ? ' held' : ''}">${f > 1000 ? '<small lang="ja">新幹線 Shinkansen</small>' : '<small lang="ja">きっぷ Ticket</small>'}${yen(f)}</button>`).join('')}</div></div>
    <div class="tmfoot"><span class="${ok === false ? 'no' : ok ? 'yes' : ''}">${msg || (Y.ticket ? `You hold a ${yen(Y.ticket)} ticket. Another one hands it back first.` : 'Touch a fare. A ticket takes you to any stop that costs that much or less.')}</span><button id="tClose">Done <small>Esc</small></button></div></div>`;
}
function tmKey(e) {
  if (!tmOpen) return;
  const k = e.key.toLowerCase(), live = [...tm.querySelectorAll('[data-fare]'), tm.querySelector('#tClose')], at = live.indexOf(document.activeElement);
  if (k === 'escape' || k === 'tab' || k === 'x') { e.preventDefault(); e.stopPropagation(); closeMachine(); return; }
  if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', 'w', 's'].includes(k)) { e.preventDefault(); e.stopPropagation(); live[(at + (k === 'arrowleft' || k === 'arrowup' || k === 'a' || k === 'w' ? -1 : 1) + live.length) % live.length].focus(); sfx.hover(); return; }
  if (k === 'e') { e.preventDefault(); e.stopPropagation(); if (at >= 0) live[at].click(); return; }
  if (k !== 'enter' && k !== ' ') e.stopPropagation();
}
function machine() {
  if (tmOpen) return;
  tmOpen = true; S.st.hold = true; E.keys.clear(); paintMachine(); tm.classList.add('on'); sfx.confirm();
  addEventListener('keydown', tmKey, true);
  (tm.querySelector('[data-fare]') || tm.querySelector('#tClose')).focus({ preventScroll: true });
}
function closeMachine() {
  if (!tmOpen) return;
  tmOpen = false; removeEventListener('keydown', tmKey, true); tm.classList.remove('on'); S.st.hold = false; S.st.wait = E.T + .3; E.keys.clear(); sfx.back();
}
tm.addEventListener('click', e => {
  if (e.target.closest('#tClose')) { closeMachine(); return; }
  const b = e.target.closest('[data-fare]');
  if (!b) return;
  const f = +b.dataset.fare;
  if (Y.ride && !dev()) { paintMachine('You are already through the gates on a ticket. Ride, or go back out first.', false); sfx.back(); }
  else if (Y.buy(f)) { paintMachine(`${f > 1000 ? 'Shinkansen ticket' : 'Ticket'}: ${yen(f)}. The gates are on your right.`, true); sfx.confirm(); sfx.tick(2); }
  else { paintMachine(`Not enough yen: that one is ${yen(f)} and you have ${yen(Y.y)}. Exorcising pays.`, false); sfx.back(); }
  const nb = tm.querySelector(`[data-fare="${f}"]`); if (nb) nb.focus({ preventScroll: true });
});

/* ================= a moment of black between two places (and what happens behind it) ================= */
const fadeEl = E.root.querySelector('#fade');
let cutQ = null;
function cut(fn, hold = .45) { if (cutQ) return; cutQ = { t: hold, fn }; if (fadeEl) fadeEl.classList.add('on'); S.st.hold = true; E.keys.clear(); }
function step(dt, real) {
  if (!cutQ) return;
  if ((cutQ.t -= real) > 0) return;
  const f = cutQ.fn; cutQ = null; S.st.hold = false;
  f();
  if (fadeEl) fadeEl.classList.remove('on');
}
// somewhere else in the same place: he is put down there, and the camera with him
function put(x, z, face) { const me = S.me, W = S.world; me.x = x; me.z = z; if (face) me.face = face; me.y = me.ground0 = W.gy(z, x); cam.x = clamp(x, 700, W.LEN - 700); }

/* ================= the ticket gates ================= */
// a row of gates across the walk at gx: through a lane only, and in only with a ticket (or as the team). Crossing it eastward takes the
// ticket; westward ends the ride. inAt: the station he went in at, if he has not ridden since (going out there gives the ticket back)
let inAt = null, gateBeep = 0, flash = { t: 0, ok: true };
function gates(gx, lanes, stopId) {
  const G = { gx, lanes, last: null,
    free(x, z) {                                    // (in the gate's band: only along a lane, and only coming in with something to go through on)
      if (Math.abs(x - gx) > 56) return null;
      if (!lanes.some(l => z > l[0] + 12 && z < l[1] - 12)) return false;
      if (S.me && S.me.x < gx - 30 && !(Y.ride || Y.ticket || dev())) return false;
      return true;
    },
    tick(p, real) {
      if (G.last === null) G.last = p.x;
      if (G.last < gx && p.x >= gx) {               // in
        Y.enter(); inAt = stopId; flash = { t: .5, ok: true }; sfx.tick(5); say('ピッ · Through the gates');
      } else if (G.last >= gx && p.x < gx) {        // out
        if (inAt === stopId && Y.ride && !dev()) { const f = Y.ride; Y.exit(); Y.buy(f); say(`Ticket handed back · ${yen(f)}`); }
        else { Y.exit(); say('ピッ · ありがとうございました · Thank you'); }
        inAt = null; flash = { t: .5, ok: true }; sfx.tick(5);
      } else if (p.x < gx - 60 && p.x > gx - 150 && !(Y.ride || Y.ticket || dev()) && E.keys.size && (E.T - gateBeep) > 1.4) {       // pushing at it without a ticket
        gateBeep = E.T; flash = { t: .6, ok: false }; sfx.back(); say('ピンポーン · No ticket: buy one at the machines (券売機)');
      }
      G.last = p.x;
      if (flash.t > 0) flash.t -= real;
    } };
  return G;
}
// the gates themselves: grey cabinets with a blue reader on top, and the flaps between them
function gateRow(gx, lanes, cabs) {
  for (const cz of cabs) {
    box(gx, 12, cz - 30, 120, 104, 60, '#cfd4dc', '#8e95a2', '#e8ebf0');
    const r = P(gx - 34, 118, cz - 30);
    g.fillStyle = flash.t > 0 ? (flash.ok ? '#38c8ff' : '#ff3d5a') : '#2a6fd0'; g.beginPath(); g.ellipse(r[0], r[1], 16 * r[2], 6 * r[2], 0, 0, TAU); g.fill();
    lit(() => glow(flash.t > 0 && !flash.ok ? GLOW.red : GLOW.blue, r[0], r[1], 110 * r[2], flash.t > 0 ? .9 : .45));
    const a = P(gx + 40, 96, cz - 30); g.fillStyle = flash.t > 0 && !flash.ok ? '#ff3d5a' : '#3ddc84'; g.fillRect(a[0] - 8 * a[2], a[1] - 5 * a[2], 16 * a[2], 10 * a[2]);      // the arrow: green, or a red X
  }
}

/* ================= the trains ================= */
// a train on the far side of the platform: N cars of the line's colours. tr: { x (its front), v, st: 'in' | 'go' | 'come' | 'away', t, open }
function trainCars(T, tr, z, x0, x1) {
  const L = 760, N = 6;
  for (let i = 0; i < N; i++) {
    const cx = tr.x - L / 2 - i * (L + 24);
    if (cx + L / 2 < x0 || cx - L / 2 > x1 || Math.abs(cx - cam.x) > 3200) continue;
    const f = box(cx, 24, z, L, 300, 230, T.body, T.side, T.top || T.side), r = on(f, 300);
    fill(T.band, () => r(0, 150, 1, 186)); if (T.band2) fill(T.band2, () => r(0, 196, 1, 206));
    fill('rgba(170,200,230,.55)', () => { for (let w = 0; w < 4; w++) r(.06 + w * .24, 200, .2 + w * .24, 268); });       // windows
    for (let d = 0; d < 4; d++) {                                                                       // doors: open, shut
      const u = .115 + d * .257, o = tr.open * .045;
      fill('#1b2230', () => r(u - .045, 30, u + .045, 268));
      fill(T.door || '#c9ced8', () => { r(u - .045 - o, 30, u - o, 268); r(u + o, 30, u + .045 + o, 268); });
      if (tr.open > .5) { const q = P(cx - L / 2 + u * L, 150, z); lit(() => glow(GLOW.fire, q[0], q[1], 160 * q[2], .25)); }
    }
    if (i === 0 && T.nose) {                                                                            // the bullet train's long nose
      const a = P(cx + L / 2, 24, z), b = P(cx + L / 2, 260, z), c = P(cx + L / 2 + 420, 40, z + 60);
      g.fillStyle = T.body; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(b[0] + (c[0] - b[0]) * .3, b[1], c[0], c[1]); g.lineTo(a[0], a[1]); g.closePath(); g.fill();
      g.strokeStyle = T.band; g.lineWidth = 6 * a[2]; g.beginPath(); g.moveTo(a[0], a[1] - 30 * a[2]); g.lineTo(c[0], c[1]); g.stroke();
    }
    if (i === 0) { const q = P(cx + L / 2 - 60, 240, z); text(T.dest || '', cx + L / 2 - 90, 244, z, 22, '#ffb04a', JP); lit(() => glow(GLOW.fire, q[0], q[1], 80 * q[2], .4)); }
  }
}
function trainTick(tr, stopX, real) {
  tr.t += real;
  if (tr.st === 'come') { const u = Math.min(1, tr.t / 3); tr.x = lerp(stopX - 5200, stopX, 1 - (1 - u) * (1 - u)); if (u >= 1) { tr.st = 'in'; tr.t = 0; sfx.land(); } }
  else if (tr.st === 'in') { tr.open = Math.min(1, tr.open + real * 2.2); if (tr.leave && tr.t > tr.leave) { tr.st = 'go'; tr.t = 0; tr.leave = 0; } }
  else if (tr.st === 'go') { tr.open = Math.max(0, tr.open - real * 3); if (tr.open <= 0) { const u = tr.t - .4; if (u > 0) tr.x += (60 + u * 900) * real * 4; if (tr.x > stopX + 9000) { tr.st = 'away'; tr.t = 0; } } }
}

/* ================= one station plan for every stop ================= */
const LEN = 6300, Z0 = 500, Z1 = 1340, BZ = 1380, CEIL = 430;
const EX = { x0: 260, x1: 620, z1: 2300 };                                      // the exit: stairs going up and away through the wall
const MACH = [950, 1140, 1330, 1520], OFFICE = [1760, 2080];
const GX = 2520, LANES = [[575, 705], [775, 905], [975, 1105], [1175, 1300]], CABS = [540, 740, 940, 1140, 1330];
const ST = { x0: 2900, x1: 3220, z1: 2350 }, ES = { x0: 3270, x1: 3510, z1: 2350 }, EL = { x0: 3720, x1: 3980, z1: 1820 };
const WALL = [4300, 4640];
const PST = { x0: 4700, x1: 5100, z0: 600, z1: 860 }, PES = { x0: 4700, x1: 5100, z0: 900, z1: 1120 }, PEL = { x: 5300, z: 640 };
const TSTOP = 6750;                                                             // where the front of the train stops
const DOORX = [4960, 5240, 5520, 5800, 6060];                                   // the platform doors' openings
const UP = 300;                                                                 // how high the platform's stairs climb before they go through the ceiling

function station(D) {
  const tr = { x: TSTOP + 9000, st: 'away', t: 0, open: 0, leave: 0 };
  let elev = null;                                                              // the lift on the way: { t, dir }
  const G = gates(GX, LANES, D.id);
  const inA = (x, a) => x > a.x0 + 34 && x < a.x1 - 34;
  function gy(z, x) {
    if (z > Z1) {
      if (inA(x, EX)) return 12 + Math.max(0, z - BZ) * .5;                      // up the exit stairs
      if (inA(x, ST) || inA(x, ES)) return 12 - Math.max(0, z - BZ) * .5;       // down
      return 12;
    }
    if (x > PST.x0 && x < PST.x1 && z > PST.z0 && z < PES.z1) return 12 + clamp((PST.x1 - x) / (PST.x1 - PST.x0 - 60), 0, 1) * UP;      // up toward the west
    return 12;
  }
  function free(x, z) {
    if (x < 80 || x > LEN - 80 || z < Z0) return false;
    if (x > WALL[0] && x < WALL[1]) return false;
    if (z > Z1) {
      for (const a of [EX, ST, ES]) if (inA(x, a)) return z < a.z1 - 110;
      if (inA(x, EL)) return !!(elev && elev.open) && z < EL.z1 - 120;
      return false;
    }
    const gt = G.free(x, z); if (gt !== null) return gt;
    if (x > WALL[1] && x < PST.x1 + 10) {                                       // on the platform: the stairs and the escalator have rails down their sides
      if (Math.abs(z - PST.z0) < 22 || Math.abs(z - (PST.z1 + PES.z0) / 2) < 22 || Math.abs(z - PES.z1) < 22) return x > PST.x1 - 10;
    }
    if (Math.abs(x - PEL.x) < 90 && Math.abs(z - PEL.z) < 70) return false;      // round the lift shaft
    return true;
  }

  /* ---------- sky (the ceiling), the floor ---------- */
  function sky() {
    const HY = E.HY, VW = E.VW;
    g.fillStyle = D.ceil || '#2a2e36'; g.fillRect(-300, -300, VW + 600, HY + 302);
    const xa = cam.x - 3000, xb = cam.x + 3000;
    fill('#3a3f4a', () => slab(xa, xb, 300, BZ + 700, CEIL));
    fill('rgba(255,255,255,.92)', () => { for (let x = Math.floor(xa / 380) * 380; x < xb; x += 380) for (const z of [620, 980, 1300]) slab(x, x + 220, z, z + 26, CEIL - 2); });      // the light panels
    lit(() => { for (let x = Math.floor((cam.x - 2200) / 380) * 380; x < cam.x + 2200; x += 380) { const q = P(x + 110, CEIL - 4, 980); glow(GLOW.blue, q[0], q[1], 260 * q[2], .12); } });
  }
  function ground() {
    const HY = E.HY, VW = E.VW, VH = E.VH, zn = E.ZNEAR * .7, xa = cam.x - 3400, xb = cam.x + 3400;
    g.fillStyle = D.floor || '#b9b4a8'; g.fillRect(-300, HY, VW + 600, VH - HY + 300);
    fill(D.floor || '#b9b4a8', () => slab(xa, xb, zn, BZ + 10, 12));
    g.beginPath();
    for (let x = Math.floor((cam.x - 2400) / 120) * 120; x < cam.x + 2400; x += 120) { const a = P(x, 12, zn), b = P(x, 12, BZ); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    for (let z = 560; z < BZ; z += 120) { const a = P(xa, 12, z), b = P(xb, 12, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1.5; g.stroke();
    fill('#f2c200', () => {                                                    // the yellow tactile paving that leads the way
      slab(xa, Math.min(xb, WALL[0]), 880, 920, 13);
      for (const m of MACH) slab(m - 20, m + 20, 920, BZ - 70, 13);
      slab(Math.max(xa, WALL[1]), xb, 1260, 1290, 13);
    });
    if (cam.x > WALL[1] - 2600) fill('#f4f4f0', () => slab(Math.max(xa, WALL[1]), xb, 1330, 1340, 13));   // the platform's white edge line
  }

  /* ---------- through the wall: the exit stairs, the way down, the lift, and the track ---------- */
  function steps(a, up, moving) {
    const cx = (a.x0 + a.x1) / 2, w = a.x1 - a.x0, n = 16;
    if (!up) { const m = P(cx, 12, BZ)[1]; g.save(); g.beginPath(); g.rect(-9999, -9999, 30000, m + 9999); g.clip(); }      // (going down: the floor in front hides what is below its edge)
    fill('#9a958a', () => slab(a.x0, a.x1, BZ - 4, a.z1, 12));
    for (let i = n - 1; i >= 0; i--) {
      const z = BZ + (a.z1 - BZ) * i / n, y = 12 + (up ? 1 : -1) * (z - BZ) * .5, sh = moving ? ((E.T * .9) % 1) * (a.z1 - BZ) / n : 0;
      fill(i % 2 ? '#d8d4ca' : '#c6c2b6', () => slab(a.x0 + 8, a.x1 - 8, z + sh * (up ? -1 : 1), z + (a.z1 - BZ) / n, y));
      if (moving) fill('#f2c200', () => slab(a.x0 + 8, a.x1 - 8, z + sh, z + sh + 6, y + 1));
    }
    for (const s of [a.x0 + 4, a.x1 - 4]) { const p0 = P(s, 12 + 120, BZ), p1 = P(s, 12 + 120 + (up ? 1 : -1) * (a.z1 - BZ) * .5, a.z1); g.strokeStyle = moving ? '#222' : '#c0c4cc'; g.lineWidth = (moving ? 9 : 5) * p0[2]; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke(); }      // handrails
    const top = P(cx, 12 + (up ? 1 : -1) * (a.z1 - BZ) * .5 + 160, a.z1);
    if (up) lit(() => glow(D.day ? GLOW.white || GLOW.blue : GLOW.fire, top[0], top[1], w * 2.6 * top[2], .5));        // daylight (or street light) at the top
    if (!up) g.restore();
  }
  function alley() {
    if (cam.x < 3000) steps(EX, true, false);
    if (cam.x > 900 && cam.x < 6000) { steps(ST, false, false); steps(ES, false, true); }
    if (cam.x > 1400 && cam.x < 6500) {                                         // the lift's car, behind its doors
      const cx = (EL.x0 + EL.x1) / 2;
      fill('#d9dde4', () => slab(EL.x0, EL.x1, BZ - 4, EL.z1, 12)); box(cx, 12, EL.z1, EL.x1 - EL.x0, 340, 20, '#c3c8d0', '#9aa0aa');
      const q = P(cx, 300, EL.z1); lit(() => glow(GLOW.white || GLOW.blue, q[0], q[1], 300 * q[2], .5));
    }
    if (cam.x > WALL[1] - 2600) {                                               // the track: down in its pit, the train on it, the tunnel's far wall
      const xa = Math.max(cam.x - 3200, WALL[1]), xb = cam.x + 3200;
      fill('#1b1d22', () => slab(xa, xb, BZ, 2100, -90)); fill('#4a4d55', () => { slab(xa, xb, 1600, 1612, -84); slab(xa, xb, 1780, 1792, -84); });
      const f = box((xa + xb) / 2, -90, 2100, xb - xa, 620, 30, D.tunnel || '#d8d2c2', '#9a958a'), r = on(f, 620);
      fill(D.accent, () => r(0, 300, 1, 330));
      for (let x = Math.floor(xa / 900) * 900 + 450; x < xb; x += 900) {      // the station's name, again and again down the wall, and what is advertised between
        if (x < WALL[1] + 200) continue;
        if ((x / 900 | 0) % 2) { box(x, 250, 2096, 560, 230, 6, '#f7f7f2', '#c9c9c0'); stationBoard(x, 2094); }
        else { box(x, 250, 2096, 420, 260, 6, '#15161c', '#0c0d11'); poster(x, 2093, (x / 900 | 0) % 5); }
      }
      trainCars(D.train, tr, 1450, WALL[1], LEN + 3000);
    }
  }
  // the station name board: the name huge in kanji, its reading, the line's ring, and the stations either side
  function stationBoard(x, z) {
    text(D.jp, x, 405, z, 74, '#111', JP); text(D.name.toUpperCase(), x, 340, z, 30, '#111', EN);
    fill(D.code[2], () => { const a = P(x - 280, 296, z), b = P(x + 280, 306, z); g.rect(a[0], b[1], b[0] - a[0], a[1] - b[1]); });
    text('← ' + D.prev[0] + ' ' + D.prev[1], x - 150, 274, z, 17, '#333', JP); text(D.next[0] + ' ' + D.next[1] + ' →', x + 150, 274, z, 17, '#333', JP);
    const q = P(x - 225, 395, z), k = q[2];
    g.fillStyle = '#fff'; g.strokeStyle = D.code[2]; g.lineWidth = 9 * k; g.beginPath(); g.arc(q[0], q[1], 30 * k, 0, TAU); g.fill(); g.stroke();
    text(D.code[0], x - 225, 404, z, 20, '#111', EN); text(String(D.code[1]).padStart(2, '0'), x - 225, 386, z, 18, '#111', EN);
  }
  function poster(x, z, n) {
    const A = [['東京都立呪術高等専門学校', 'OPEN CAMPUS · 見学会', '#2c1f3a', '#e8c86a'], ['呪', 'CURSES ARE NOT REAL · 怪談ナイト', '#3a0d14', '#ff5a6e'], ['京都姉妹校交流会', 'GOODWILL EVENT · 9月', '#1f2b3a', '#9fd0ea'],
      ['パンダ', 'CURSED CORPSE PLUSH · 夜蛾', '#2a2a2a', '#f4f4f0'], ['新宿 ・ 12/24', 'ILLUMINATION · 聖夜', '#0e1a3a', '#8fd6ff']][n];
    fill(A[2], () => { const a = P(x - 190, 260, z), b = P(x + 190, 490, z); g.rect(a[0], b[1], b[0] - a[0], a[1] - b[1]); });
    text(A[0], x, 400, z, 30, A[3], JP); text(A[1], x, 320, z, 16, '#f4efe4', EN);
    const q = P(x, 375, z); lit(() => glow(GLOW.white || GLOW.blue, q[0], q[1], 420 * q[2], .1));
  }

  /* ---------- the wall on the street side of the platform level, and everything set into it ---------- */
  function wallTo(x0, x1) {
    if (x1 < cam.x - 2800 || x0 > cam.x + 2800) return;
    const f = box((x0 + x1) / 2, 12, BZ, x1 - x0, CEIL - 12, 40, D.wall || '#e8e4da', '#b8b4aa'), r = on(f, CEIL - 12);
    fill('rgba(0,0,0,.05)', () => { for (let y = 40; y < CEIL; y += 40) r(0, y, 1, y + 2); });
    fill(D.accent, () => r(0, 200, 1, 216));
  }
  function opening(a, sign, sub, col) {                                         // the wall over a way through, and its sign
    const cx = (a.x0 + a.x1) / 2;
    box(cx, 300, BZ, a.x1 - a.x0, CEIL - 300, 40, D.wall || '#e8e4da', '#b8b4aa');
    box(cx, 330, BZ - 46, Math.max(260, a.x1 - a.x0 - 40), 60, 8, col || '#15161c', '#0c0d11');
    text(sign, cx, 368, BZ - 50, 26, '#f5c400', JP); text(sub, cx, 342, BZ - 50, 15, '#f4f4f0', EN);
  }
  function buildings() {
    wallTo(-1700, EX.x0); opening(EX, '出口 ' + D.exit[0], 'EXIT ' + D.exit[0] + ' · ' + D.exit[2]);
    wallTo(EX.x1, ST.x0);
    if (cam.x < 4200) {
      for (const m of MACH) {                                                   // the ticket machines, set into the wall
        const f = box(m, 12, BZ - 56, 160, 250, 56, '#dfe4ec', '#a9b0bc', '#eef1f5'), r = on(f, 250);
        fill('#0f2a5c', () => r(.12, 120, .88, 220)); fill('#38c8ff', () => r(.16, 130, .84, 150)); fill('#1a1d24', () => { r(.2, 60, .45, 74); r(.55, 40, .85, 52); });
        const q = P(m, 170, BZ - 56); lit(() => glow(GLOW.blue, q[0], q[1], 200 * q[2], .35));
      }
      const fc = (MACH[0] + MACH[3]) / 2, f = box(fc, 280, BZ - 8, 720, 130, 8, '#f7f7f2', '#c9c9c0'), r = on(f, 130);      // the fare chart over them
      fill('rgba(0,0,0,.08)', () => r(.02, 8, .98, 122));
      let i = 0;
      for (const s of SH.STOPS) {
        if (!FARE[s.id]) continue;
        const u = .1 + i++ * .2, q = P(lerp(fc - 360, fc + 360, u), 360, BZ - 12), k = q[2];
        g.fillStyle = '#fff'; g.strokeStyle = s.code[2]; g.lineWidth = 6 * k; g.beginPath(); g.arc(q[0], q[1], 17 * k, 0, TAU); g.fill(); g.stroke();
        text(s.jp, lerp(fc - 360, fc + 360, u), 324, BZ - 12, 17, '#111', JP); text(String(fareOf(s.id)), lerp(fc - 360, fc + 360, u), 298, BZ - 12, 17, s.id === D.id ? '#999' : '#b00020', EN);
      }
      text('きっぷうりば  TICKETS', fc, 432 - 16, BZ - 8, 18, '#111', EN);
      const w = box((OFFICE[0] + OFFICE[1]) / 2, 12, BZ - 6, OFFICE[1] - OFFICE[0], 300, 6, '#9aa0aa', '#6f7680'), rw = on(w, 300);      // the office window
      fill('rgba(190,220,240,.75)', () => rw(.06, 100, .94, 260)); fill('#2a2e36', () => rw(.06, 40, .94, 100)); text('駅事務室  STATION OFFICE', (OFFICE[0] + OFFICE[1]) / 2, 280, BZ - 8, 15, '#111', EN);
      const s = P((OFFICE[0] + OFFICE[1]) / 2 + 40, 170, BZ + 30), sk = s[2];             // somebody in a uniform behind it
      g.fillStyle = '#1f2a44'; g.fillRect(s[0] - 24 * sk, s[1] - 10 * sk, 48 * sk, 60 * sk); g.fillStyle = '#e6c4a4'; g.beginPath(); g.arc(s[0], s[1] - 30 * sk, 18 * sk, 0, TAU); g.fill(); g.fillStyle = '#1f2a44'; g.fillRect(s[0] - 20 * sk, s[1] - 52 * sk, 40 * sk, 12 * sk);
    }
    opening(ST, 'ホーム ↓', 'TO THE PLATFORM', D.code[2]); wallTo(ST.x1, ES.x0); opening(ES, 'エスカレーター ↓', 'ESCALATOR DOWN', D.code[2]);
    wallTo(ES.x1, EL.x0);
    { const cx = (EL.x0 + EL.x1) / 2; opening(EL, 'エレベーター', 'LIFT · B2F', '#3a3f4a');
      const o = elev ? elev.open : 0, f = box(cx, 12, BZ - 6, EL.x1 - EL.x0 - 40, 280, 4, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)'), r = on(f, 280);
      fill('#c9ced6', () => { r(0, 0, .5 - o * .48, 280); r(.5 + o * .48, 0, 1, 280); }); fill('#8a909a', () => { r(.497 - o * .48, 0, .503 - o * .48, 280); });
      const b = P(EL.x1 + 30, 140, BZ - 10); g.fillStyle = '#20242c'; g.fillRect(b[0] - 8 * b[2], b[1] - 16 * b[2], 16 * b[2], 32 * b[2]); g.fillStyle = elev ? '#ffb04a' : '#ffffff'; g.beginPath(); g.arc(b[0], b[1], 5 * b[2], 0, TAU); g.fill(); }
    wallTo(EL.x1, WALL[0] + 40);
  }
  function between() {                                                          // the block between the two levels (nothing stands at BZ over the platform: that is the track)
    if (cam.x < 2600 || cam.x > 7200) return;
    const f = box((WALL[0] + WALL[1]) / 2, 12, Z0 - 260, WALL[1] - WALL[0], CEIL - 12, BZ - Z0 + 300, D.wall || '#e8e4da', '#b8b4aa', '#d0ccc2'), r = on(f, CEIL - 12);
    fill(D.accent, () => r(0, 200, 1, 216)); text('B2F  ホーム', (WALL[0] + WALL[1]) / 2, 300, Z0 - 262, 30, '#111', JP); text('PLATFORM LEVEL', (WALL[0] + WALL[1]) / 2, 262, Z0 - 262, 16, '#333', EN);
  }

  /* ---------- people, and what stands among them ---------- */
  const folk = [];
  [[300, 2400, 4], [2650, 4250, 3], [4720, 6200, 4]].forEach(([a, b, n], k) => { for (let i = 0; i < n; i++) {
    const f = E.fighter(C.civ(k * 4 + i + 1), rnd(a + 80, b - 80), i & 1 ? 1 : -1); f.z = rnd(560, 1260); f.y = f.ground0 = 12; f.speed = rnd(70, 120); f.scale = rnd(.94, 1.04); f.walk = rnd(0, 6); f.a = a; f.b = b;
    f.wait = k === 2 && i < 2;                                                  // two on the platform, waiting for the train
    if (f.wait) f.z = rnd(1180, 1260);
    folk.push(f);
  } });
  const person = f => ({ get z() { return f.z; }, draw() { E.shadow(f); E.drawFighter(f, f.alpha); } });
  function stepsUp(a, moving, z) {                                              // on the platform: a flight rising toward the west, into the ceiling
    const n = 12, w = (a.x1 - a.x0 - 60) / n, sh = moving ? ((E.T * 1.2) % 1) * w : 0;
    const list = Array.from({ length: n }, (_, i) => i).sort((p, q) => Math.abs(a.x1 - (q + .5) * w - cam.x) - Math.abs(a.x1 - (p + .5) * w - cam.x));
    for (const i of list) box(a.x1 - (i + .5) * w - sh, 12, a.z0, w, (i + 1) * UP / n, a.z1 - a.z0, i % 2 ? '#d8d4ca' : '#c6c2b6', '#9a958a', '#e4e0d6');
    for (const zz of [a.z0, a.z1]) { const p0 = P(a.x1, 120, zz), p1 = P(a.x0 + 60, 120 + UP, zz); g.strokeStyle = moving ? '#222' : '#c0c4cc'; g.lineWidth = (moving ? 9 : 5) * p0[2]; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke(); }
    box(a.x0 + 30, 12, a.z0, 60, UP + 14, a.z1 - a.z0, '#b8b4aa', '#8a867c', '#d0ccc2');
  }
  const props = [
    ...CABS.map(cz => ({ z: cz - 30, draw: () => gateRow(GX, LANES, [cz]) })),
    { z: 520, draw() { box(GX, 330, 520, 300, 60, 8, '#15161c', '#0c0d11'); text('改札口  TICKET GATES', GX, 360, 516, 20, '#f5c400', EN); } },
    { z: PST.z0, draw: () => stepsUp(PST, false) }, { z: PES.z0, draw: () => stepsUp(PES, true) },
    { z: PEL.z, draw() { box(PEL.x, 12, PEL.z - 60, 170, CEIL - 12, 130, 'rgba(170,200,230,.35)', 'rgba(120,150,180,.35)'); const o = elev && elev.plat ? elev.open : 0, f = box(PEL.x, 12, PEL.z - 62, 120, 260, 2, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)'), r = on(f, 260);
      fill('#c9ced6', () => { r(0, 0, .5 - o * .48, 260); r(.5 + o * .48, 0, 1, 260); }); text('エレベーター', PEL.x, 300, PEL.z - 64, 16, '#111', JP); } },
    ...DOORX.map(x => ({ z: 1352, draw() {                                        // platform doors: waist-high panels that slide aside when the train is in
      const o = tr.st === 'in' ? tr.open : 0;
      box(x - 140 + 70, 12, 1352, 140, 120, 14, '#e8ecf2', '#a9b0bc', '#f4f6f9'); box(x - 70 - 75 * o, 12, 1354, 70, 120, 10, '#cfd6e0', '#9aa2ae'); box(x + 70 + 75 * o, 12, 1354, 70, 120, 10, '#cfd6e0', '#9aa2ae');
      const q = P(x, 126, 1352); g.fillStyle = tr.st === 'in' ? '#3ddc84' : '#ff9a3d'; g.fillRect(q[0] - 10 * q[2], q[1] - 4 * q[2], 20 * q[2], 8 * q[2]);
    } })),
    { z: 760, draw() { box(5700, 12, 760, 240, 50, 60, '#8a6a3c', '#5e4526', '#a5824d'); box(5700, 12, 800, 240, 110, 10, '#8a6a3c', '#5e4526'); } },      // a bench
    { z: 1150, draw() { box(6120, 12, 1150, 90, 170, 60, '#e8ecf4', '#a9b0bc'); const q = P(6120, 120, 1150); lit(() => glow(GLOW.blue, q[0], q[1], 200 * q[2], .45)); } },      // a drinks machine
    ...folk.map(person),
    { z: Z0 - 260, draw: between }
  ];
  function front() {                                                            // signs hung from the ceiling, and the near pillars
    const hang = (x, a, b, col) => { if (Math.abs(x - cam.x) > 1800) return; box(x, 360, 470, 340, 56, 8, '#15161c', '#0c0d11'); text(a, x, 396, 466, 24, col || '#f5c400', JP); text(b, x, 372, 466, 14, '#f4f4f0', EN); };
    hang(440, '出口 ' + D.exit[0] + ' ↑', 'EXIT · ' + D.exit[2]); hang(1240, 'きっぷうりば', 'TICKETS · 券売機'); hang(2200, '改札 →', 'GATES · ' + D.line); hang(3300, 'のりば ↓', 'PLATFORM · ' + D.line, '#fff');
    hang(4900, '↑ 出口 · 改札', 'EXIT · GATES'); hang(5600, D.dir[0], D.dir[1], '#fff');
    for (const x of [800, 2000, 3600, 5900]) if (Math.abs(x - cam.x) < 1800) { const f = box(x, 12, 450, 110, CEIL, 110, D.wall || '#e8e4da', '#b8b4aa'), r = on(f, CEIL); fill(D.accent, () => r(0, 200, 1, 216)); }
  }

  /* ---------- what can be done here ---------- */
  const spots = [
    { x: (MACH[1] + MACH[2]) / 2, z: 1250, r: 330, h: 300, icon: '券', col: '#38c8ff', label: () => 'Buy a ticket · ' + (dev() ? 'free' : yen(Y.y)), use: () => machine() },
    { x: (OFFICE[0] + OFFICE[1]) / 2, z: 1250, r: 170, h: 320, icon: '駅', col: '#9aa3b5', label: 'Ask at the window', use: () => S.talk([['staff', `${D.name}, ${D.line}. The machines sell tickets; the fare chart over them says how far each one goes.`], ['staff', 'The gates take the ticket on the way in. Through them, the stairs, the escalator and the lift go down to the trains. Mind the doors.']]) },
    { x: (EL.x0 + EL.x1) / 2, z: 1250, r: 170, h: 320, icon: '昇', col: '#9aa3b5', label: 'Take the lift down', show: () => !elev, use: () => lift(false) },
    { x: PEL.x, z: PEL.z + 120, r: 170, h: 330, icon: '昇', col: '#9aa3b5', label: 'Take the lift up', show: () => !elev, use: () => lift(true) },
    { x: 5520, z: 1250, r: 300, h: 360, icon: '乗', col: D.code[2], label: 'Board the train', show: () => tr.st === 'in' && tr.open > .8, use: () => board() }
  ];
  function lift(up) {                                                           // the doors, the car, the doors: and he is on the other level
    elev = { t: 0, open: 0, plat: up, up };
    S.st.hold = true; E.keys.clear(); sfx.tick(1);
  }
  function liftTick(real) {
    if (!elev) return;
    const e = elev; e.t += real;
    if (e.t < .6) e.open = Math.min(1, e.t / .5);
    else if (e.t < 1.2) { if (!e.in) { e.in = 1; S.st.goto = e.up ? [PEL.x, PEL.z - 10] : [(EL.x0 + EL.x1) / 2, EL.z1 - 200]; S.st.arrive = () => {}; } }
    else if (e.t < 1.8) e.open = Math.max(0, 1 - (e.t - 1.2) / .5);
    else if (!e.cut) { e.cut = 1; sfx.tick(3); cut(() => { if (e.up) put((EL.x0 + EL.x1) / 2, EL.z1 - 200, 1); else put(PEL.x, PEL.z + 110, 1); elev = { t: 0, open: 0, plat: !e.up, out: 1 }; }, .5); }
    if (e.out) { e.open = Math.min(1, e.t / .5); if (e.t > .5 && !e.walk) { e.walk = 1; S.st.hold = false; if (!e.plat) { S.st.goto = [(EL.x0 + EL.x1) / 2, 1250]; S.st.arrive = () => {}; } } if (e.t > 1.6) { e.open = Math.max(0, 1 - (e.t - 1.6) / .5); if (e.t > 2.2) elev = null; } }
  }
  function board() {
    S.st.goto = [5520, 1330]; S.st.arrive = () => { S.st.hold = false; SH.openMap(); };
  }

  const world = { name: 'st_' + D.id, label: D.name + ' Station', stop: D.id, station: true, LEN, Z0, Z1, BZ, gy, free, sky, ground, alley, buildings, props, front, spots, civs: 0, SPOTS: [],
    cast: () => [],
    clip: f => (f.z > BZ && (inA(f.x, ST) || inA(f.x, ES)) ? P(f.x, 12, BZ)[1] : null),
    stage(x0) { const sh = fn => () => { cam.x += x0; fn(); cam.x -= x0; }; return { sky: sh(sky), floor: sh(ground), back: sh(() => { alley(); buildings(); }), front: sh(front) }; },
    status(st, set) {
      const x = S.me.x, where = x < GX ? (x < 800 ? 'Exit ' + D.exit[0] : 'Concourse') : x < WALL[0] ? 'Inside the gates' : 'Platform';
      set(`${D.name} Station <span lang="ja">${D.jp}駅</span>`, `${where} · ${D.line} · E use · ${dev() ? 'Team account: the gates open for you' : Y.ride ? 'On a ' + yen(Y.ride) + ' ride' : Y.ticket ? 'Ticket: ' + yen(Y.ticket) : 'No ticket · the machines sell them'}`);
    },
    tick(dt, real, p, st) {
      G.tick(p, real);
      trainTick(tr, TSTOP, real);
      liftTick(real);
      if (p.x > WALL[1] && tr.st === 'away') { tr.st = 'come'; tr.t = 0; sfx.whoosh(); }
      for (const f of folk) {
        if (f.wait) { f.face = -1; C.stroll(f, false, dt); continue; }
        f.x += f.face * f.speed * dt; if (f.x < f.a + 60 || f.x > f.b - 60) f.face = -f.face;
        C.stroll(f, true, dt, f.speed / 110);
      }
      const where = p.x < GX ? 0 : p.x < WALL[0] ? 1 : 2;
      if (st.wh !== where) { st.wh = where; S.status(); }
      if (cutQ) return false;
      if (inA(p.x, EX) && p.z > EX.z1 - 180) { cut(() => up(D)); return false; }                       // out at the top of the exit stairs
      if ((inA(p.x, ST) || inA(p.x, ES)) && p.z > ST.z1 - 180) { const esc = inA(p.x, ES); cut(() => (esc ? put(PST.x1 + 70, (PES.z0 + PES.z1) / 2, 1) : put(PST.x0 + 100, (PST.z0 + PST.z1) / 2, 1))); return false; }      // down: the stairs land at the top of the platform's flight, the escalator at its foot
      if (inA(p.x, ES) && p.z > BZ + 40 && !st.goto) { st.goto = [(ES.x0 + ES.x1) / 2, ES.z1 - 120]; st.arrive = () => {}; }      // the escalator carries him
      const onUp = p.x > PST.x0 && p.x < PST.x1 && p.z > PST.z0 && p.z < PES.z1;
      if (onUp && p.x < PST.x0 + 70) { cut(() => put((ST.x0 + ST.x1) / 2, ST.z1 - 230, 1)); return false; }       // up, back to the concourse, at the foot of its stairs
      if (onUp && p.z > PES.z0 && !st.goto) { st.goto = [PST.x0 + 40, p.z]; st.arrive = () => {}; }
      return false;
    },
    // straight off a train: the doors open, he steps out, and it goes
    arrive() { tr.x = TSTOP; tr.st = 'in'; tr.t = 0; tr.open = 1; tr.leave = 3.2; inAt = null; },
    reset() { tr.st = 'away'; tr.t = 0; tr.open = 0; elev = null; G.last = null; } };
  return world;
}

/* ================= the stations ================= */
const MARU = { body: '#d8202c', side: '#a0161f', band: '#f4f4f0', band2: '#b3b8c0', door: '#c22630', dest: '池袋' };
const DEF = {
  tokyo: { id: 'tokyo', name: 'Tokyo', jp: '東京', line: 'Marunouchi Line', code: ['M', 17, '#e60012'], prev: ['大手町', 'Ōtemachi'], next: ['銀座', 'Ginza'], exit: ['M2', '丸の内', 'Marunouchi side'], dir: ['池袋方面', 'FOR IKEBUKURO'], accent: '#e60012', train: MARU },
  shibuya: { id: 'shibuya', name: 'Shibuya', jp: '渋谷', line: 'Fukutoshin Line', code: ['F', 16, '#9c5e31'], prev: ['明治神宮前', 'Meiji-jingumae'], next: ['代官山', 'Daikanyama'], exit: ['A8', 'ハチ公口', 'Hachikō Square'], dir: ['和光市方面', 'FOR WAKOSHI'], accent: '#9c5e31',
    train: { body: '#d7dbe2', side: '#9aa0aa', band: '#9c5e31', band2: '#e8b84a', door: '#c9ced8', dest: '和光市' } },
  shinjuku: { id: 'shinjuku', name: 'Shinjuku', jp: '新宿', line: 'Marunouchi Line', code: ['M', 8, '#e60012'], prev: ['西新宿', 'Nishi-shinjuku'], next: ['新宿三丁目', 'Shinjuku-sanchōme'], exit: ['B13', '東口', 'East Exit'], dir: ['荻窪方面', 'FOR OGIKUBO'], accent: '#e60012', train: MARU },
  kyoto: { id: 'kyoto', name: 'Kyoto', jp: '京都', line: 'Tokaido Shinkansen', code: ['K', 11, '#1c5fb8'], prev: ['米原', 'Maibara'], next: ['新大阪', 'Shin-Ōsaka'], exit: ['八条口', '中央口', 'Central Exit'], dir: ['14番線 東京方面', 'TRACK 14 · FOR TOKYO'], accent: '#1c5fb8',
    wall: '#eef0f2', tunnel: '#e8eaee', train: { body: '#f6f7f9', side: '#c4c8d0', band: '#1c5fb8', band2: '#1c5fb8', door: '#e4e7ec', nose: true, dest: '東京' } }
};
const WORLDS = {};
Object.assign(JU.story.WHO, { staff: ['Station Staff', '駅員', '#9aa3b5'] });
const stationOf = id => DEF[id] ? (WORLDS[id] || (WORLDS[id] = station(DEF[id]))) : null;

/* ================= the trips ================= */
// from the street, down into the station: he comes down the exit stairs into the concourse
function down(id) {
  const w = stationOf(id);
  if (!w) { SH.openMap(); return; }
  sfx.whoosh(); cut(() => { w.reset(); S.travel(w, [(EX.x0 + EX.x1) / 2, EX.z1 - 260, 1]); S.st.goto = [(EX.x0 + EX.x1) / 2 + 60, 1200]; S.st.arrive = () => {}; E.banner(DEF[id].jp + '駅', (DEF[id].name + ' Station').toUpperCase()); }, .55);
}
// out at the top of the exit stairs, into the district
function up(D) {
  const s = SH.STOPS.find(x => x.id === D.id);
  if (!s || !s.world) return;
  S.travel(s.world(), s.at()); E.banner(s.jp, s.name.toUpperCase());
}
// the train, from the route map: the screen over the doors says where it is going, and then he is there, on the platform
function ride(stop) {
  inAt = null;
  const D = DEF[stop.id] || { jp: stop.jp, name: stop.name, code: stop.code };
  lcd.innerHTML = `<div><i class="rnd" style="--c:${stop.code[2]}"><b>${stop.code[0]}</b>${String(stop.code[1]).padStart(2, '0')}</i><b lang="ja">次は ${D.jp}</b><span>Next · ${D.name}${stop.id === 'kyoto' ? ' · Tokaido Shinkansen' : ''}</span></div>`;
  lcd.classList.add('on'); sfx.whoosh();
  cut(() => {
    lcd.classList.remove('on');
    const w = stationOf(stop.id);
    if (w) { w.reset(); S.travel(w, [5520, 1290, -1]); w.arrive(); E.banner(D.jp, D.name.toUpperCase()); }
    else if (stop.arrive) stop.arrive();
    else { S.travel(stop.world(), stop.at()); E.banner(stop.jp, stop.name.toUpperCase()); }
    SH.M.last = stop.id; SH.save();
  }, 1.6);
}

JU.metro = { FARE, fareOf, machine, closeMachine, gates, gateRow, trainCars, trainTick, cut, step, put, down, ride, stationOf, say, DEF,
  get open() { return tmOpen; }, get busy() { return !!cutQ; } };
})();
