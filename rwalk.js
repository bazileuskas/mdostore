/* JUJUTSU UNLIMITEDS — Build 0.31: RAIDS ON THE STREET. The user's: "during raids instead of waves add so youre walking in a city but youre
   stiull inside the arena so youre ready to fight them at any moment and also make heling stations findable that heal you and for some
   characters like gojo or mechamaru etc add so you can heal your partner mid battle".
   THE STREET. A raid (raid.js: the ones started from a public server's list, and every district raid, shibuya.js) is fought on a district's
   own street instead of the shrine, and it never stops being a fight: the arena is the same arena, health, moves and all. What moves is the
   arena. While nothing is standing in it, walking on carries it down the street with you (E.shift: every fighter, everything flying about,
   keeps its place in the world while the arena's middle moves under them), and whatever is waiting further down is met where it waits, out
   of the dark all at once, in front and behind. While anything is still standing the arena stays where it is, a curtain drawn in on each
   side, until it is all down. At the far end of the street, the boss; each end of the street is a curtain (帳).
   Everybody in a raid is in the same arena (the host's game moves it, the others' follow it: raid.js), so nobody is left behind or runs on.
   HEALING STATIONS: a few along every street, wherever the raid puts them, lit green. Stand in the light and it gives back up to 40% of your
   health, a quarter of it a second, and then it is spent. Each player has each one to themselves. Once seen, a station is on the street's
   line under the raid's own.
   HEALING A PARTNER (H, or Heal on a phone): Limitless (Reverse Cursed Technique: Output), Awakened Limitless (the same, stronger), the
   Mechamaster (a Repair Puppet flies over and patches them up), Love Reaper and the three it combines into (Pure Love: Mend) heal whoever
   they are raiding with: one who is down first (back on their feet), otherwise the one most hurt. It takes a partner: alone, there is
   nobody to heal */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, P = E.P, cam = E.cam, H = E.hooks, POSE = E.POSE, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, Z = JU.bossfx;
const { rnd, clamp, lerp, ease, ZP } = E, TAU = Math.PI * 2;
const EDGE = 1900, STEP = 2000, TAIL = 1500, HALF = 965, VEIL = 45;      // how far a street keeps from the ends of its district; its length for each group waiting on it, and for the boss's stretch at the end; the arena's half width (game.js BOUND); how far past that a curtain hangs
const LOOK = 150;                                   // how far ahead of him the camera looks while the street is quiet
const ZS = ZP + 150, REACH = 105, CHARGE = .4, RATE = .25;      // where a station stands (just behind the fighters); how close to it he has to be; how much of his health it holds; how fast it gives it
const GREEN = '#8fffa8', GRGB = '143,255,168';
const lite = fn => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };

/* ================= the streets ================= */
const WORLDS = () => ({ shibuya: JU.shibuya && JU.shibuya.world, kyoto: JU.kyoto && JU.kyoto.world, shinjuku: JU.shinjuku && JU.shinjuku.world, jjh: JU.jjh && JU.jjh.world });
const worldOf = id => WORLDS()[id] || WORLDS().shibuya;
// the district he is standing in, for a raid started there (a station is its district's; the Tokyo block has no street long enough: Shibuya's)
function here() {
  const w = JU.street && JU.street.world, all = WORLDS();
  for (const id in all) if (all[id] && all[id] === w) return id;
  return w && w.stop && all[w.stop] ? w.stop : 'shibuya';
}
// a street for a raid: where its arena's middle starts and ends (a, b: in the world), where each group waits along it, and where the stations
// are. n: how many groups wait before the boss. at: where it starts (an online raid: where the host is standing); or end: where it ends (a
// district raid: its boss is waiting where its column of light was, or as near as the district allows)
function plan(o) {
  const id = WORLDS()[o.w] ? o.w : 'shibuya', W = worldOf(id), n = clamp(o.n | 0, 0, 8);
  const span = Math.min(STEP * n + TAIL, W.LEN - 2 * EDGE);
  const a = Math.round(o.end !== undefined ? clamp(o.end, EDGE + span, W.LEN - EDGE) - span : clamp(o.at || 0, EDGE, W.LEN - EDGE - span));
  const b = a + span, stops = [], heals = [];
  for (let i = 0; i < n; i++) stops.push(Math.round(a + STEP * (i + .62) + rnd(-260, 260)));      // (the first a little way down: the street first)
  for (let i = 0; i < n; i++) heals.push(Math.round(stops[i] + rnd(-150, 250)));      // (a group is met a good way short of where it waits (raid.js AHEAD): a station is on the quiet stretch after it, halfway to the next)
  return { w: id, a, b, stops, heals };
}
// one that came over the wire: only numbers, and only where the district has street
function clean(p) {
  if (!p || typeof p !== 'object') return null;
  const id = WORLDS()[p.w] ? p.w : 'shibuya', W = worldOf(id), num = v => clamp(+v || 0, 0, W.LEN);
  const a = num(p.a), b = Math.max(a, num(p.b)), list = v => (Array.isArray(v) ? v.slice(0, 8).map(num) : []);
  return { w: id, a, b, stops: list(p.stops), heals: list(p.heals) };
}

/* ================= the street being walked ================= */
// ST: { p (its plan), w (its district), ox (the arena's middle, in the world), heals: [{ x, gave, seen, spent, on, num, numT }], lock (how far
// the curtains are drawn in, 0..1), locked }
let ST = null, barEl = null;
function open(p0) {
  const p = clean(p0) || plan({ w: 'shibuya', at: 0, n: 3 });
  const s = ST = { p, w: worldOf(p.w), ox: p.a, heals: p.heals.map(x => ({ x, gave: 0, seen: false, spent: false, on: 0, num: 0, numT: 0, healing: false })), lock: 0, locked: false, ws: null, wsx: NaN };
  // the district's own street, drawn as a fight's stage, wherever the arena now stands in it (the world's stage(x0), made again when it moves)
  const ws = () => { if (s.wsx !== s.ox) { s.ws = s.w.stage(s.ox); s.wsx = s.ox; } return s.ws; };
  return {
    sky: () => ws().sky(),
    floor: () => { ws().floor(); pools(s); },
    back: () => { ws().back(); for (const h of s.heals) kiosk(s, h); },
    front: () => { ws().front(); curtains(s); }
  };
}
function close() { ST = null; barEl = null; flying.length = 0; hcd = 0; E.root.classList.remove('healer'); }
// the arena moves d down the street (or to where the host's game has it: to)
function move(d) { if (!ST || !(d = +d)) return; ST.ox += d; E.shift(d); }
const to = ox => { if (ST) move(clamp(+ox || 0, ST.p.a, ST.p.b) - ST.ox); };
const live = () => !!ST && !!(Fi.fight.cfg && Fi.fight.cfg.raid) && E.root.dataset.mode === 'fight';

/* ================= the curtain: across each end of the street, and drawn in round the arena while anything is standing in it ================= */
function veil(s, xw, dir, a) {                      // dir: which side of it is dark (1: past it to the right)
  if (a <= .01) return;
  const c = F(xw - s.ox, 0), sx = c[0], W = E.VW, Hh = E.VH, w = 110;
  if (dir > 0 ? sx > W + 60 : sx < -60) return;
  const gr = g.createLinearGradient(sx, 0, sx + dir * w, 0);
  gr.addColorStop(0, 'rgba(7,3,14,0)'); gr.addColorStop(1, `rgba(7,3,14,${.93 * a})`);
  g.fillStyle = gr; g.fillRect(dir > 0 ? sx : sx - w, -200, w, Hh + 400);
  g.fillStyle = `rgba(7,3,14,${.93 * a})`;
  if (dir > 0) g.fillRect(sx + w - 1, -200, W + 400, Hh + 400); else g.fillRect(-400, -200, sx - w + 401, Hh + 400);
  lite(() => {                                      // its edge: a seam of cursed energy running down it
    g.strokeStyle = `rgba(150,105,255,${.34 * a})`; g.lineWidth = 3;
    g.beginPath();
    for (let y = -40; y <= Hh + 40; y += 24) { const xx = sx + dir * (8 + 6 * Math.sin(y * .03 + E.T * 2.2)); y === -40 ? g.moveTo(xx, y) : g.lineTo(xx, y); }
    g.stroke();
  });
}
function curtains(s) {
  veil(s, s.p.a - HALF - VEIL, -1, 1); veil(s, s.p.b + HALF + VEIL, 1, 1);
  if (s.lock > .01) { veil(s, s.ox - HALF - VEIL, -1, s.lock * .8); veil(s, s.ox + HALF + VEIL, 1, s.lock * .8); }
}

/* ================= healing stations ================= */
function pools(s) {                                 // the green light each one throws on the pavement in front of it: stand in it
  lite(() => {
    for (const h of s.heals) {
      if (h.spent) continue;
      const x = h.x - s.ox;
      if (Math.abs(x - cam.x) > 1500) continue;
      const c = P(x, 0, ZP + 10), k = c[2], a = .2 + .1 * Math.sin(E.T * 2.4 + h.x) + h.on * .25;
      g.save(); g.translate(c[0], c[1]); g.scale(1, .24);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, 190 * k);
      gr.addColorStop(0, `rgba(${GRGB},${a})`); gr.addColorStop(1, `rgba(${GRGB},0)`);
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 190 * k, 0, TAU); g.fill();
      g.restore();
    }
  });
}
function kiosk(s, h) {                              // a roadside cabinet with a green cross, a lit sign on top, a talisman down its side, and a column of light over it
  const x = h.x - s.ox;
  if (Math.abs(x - cam.x) > 1500) return;
  const on = !h.spent, pulse = .55 + .25 * Math.sin(E.T * 2.4 + h.x) + h.on * .45;
  E.box(x, 0, ZS, 156, 14, 84, '#565d5b', '#3a403e', '#7b8582');                                   // the step it stands on
  E.box(x, 14, ZS + 12, 100, 232, 48, on ? '#e8f0eb' : '#8d9691', on ? '#b3c3b8' : '#6b7470', on ? '#f6fbf7' : '#a0a8a3');      // the cabinet
  E.box(x, 246, ZS + 8, 128, 13, 66, on ? '#2f6b45' : '#3d4642', on ? '#22503a' : '#2b3330', on ? '#3f8b5b' : '#4b5551');       // its roof
  const sg = E.box(x, 259, ZS + 16, 96, 50, 20, on ? '#1f8f4a' : '#46504b', on ? '#16683a' : '#353d39');                         // and the sign on it
  const c = P(x, 150, ZS + 12), k = c[2];
  if (on) lite(() => { E.glow(E.GLOW.green, c[0], c[1], 360 * k, pulse * .8); const m = P(x, 284, ZS + 16); E.glow(E.GLOW.green, m[0], m[1], 260 * m[2], pulse * .7); });
  g.fillStyle = on ? '#22c25a' : '#5b6a61';
  g.fillRect(c[0] - 11 * k, c[1] - 36 * k, 22 * k, 72 * k); g.fillRect(c[0] - 36 * k, c[1] - 11 * k, 72 * k, 22 * k);
  if (on) { g.fillStyle = 'rgba(230,255,236,.85)'; g.fillRect(c[0] - 5 * k, c[1] - 30 * k, 10 * k, 60 * k); g.fillRect(c[0] - 30 * k, c[1] - 5 * k, 60 * k, 10 * k); }
  const tl = sg[3], br = sg[1], cx = (tl[0] + br[0]) / 2, cy = (tl[1] + br[1]) / 2, ks = (br[1] - tl[1]) / 50;
  g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 ${Math.max(8, Math.round(30 * ks))}px system-ui, sans-serif`;
  g.fillStyle = on ? '#eafff0' : '#9aa59f'; g.fillText('回復', cx, cy + ks); g.restore();
  const t = P(x + 37, 226, ZS + 11), kt = t[2];                      // the talisman
  g.fillStyle = on ? '#f3ead2' : '#a7a293'; g.fillRect(t[0] - 7 * kt, t[1], 14 * kt, 58 * kt);
  g.fillStyle = on ? '#b3122a' : '#6e4a50'; g.fillRect(t[0] - 1.6 * kt, t[1] + 8 * kt, 3.2 * kt, 40 * kt);
  if (!on) return;
  lite(() => {                                      // seen from down the street: a column of green light over it
    const a = P(x, 310, ZS), b = P(x, 1100, ZS), w = 64 * a[2];
    const gr = g.createLinearGradient(0, a[1], 0, b[1]);
    gr.addColorStop(0, `rgba(${GRGB},${.3 * pulse})`); gr.addColorStop(1, `rgba(${GRGB},0)`);
    g.fillStyle = gr; g.fillRect(a[0] - w / 2, b[1], w, a[1] - b[1]);
    for (let i = 0; i < 4; i++) { const u = (E.T * .35 + i / 4 + h.x * .001) % 1, m = P(x + Math.sin(i * 2.1 + E.T) * 24, 310 + u * 560, ZS); E.glow(E.GLOW.green, m[0], m[1], 28 * m[2], .9 * (1 - u)); }
  });
}
function label(s, h) {                              // its name over it once he is near, and what it still has in it
  const p = E.P1, x = h.x - s.ox;
  if (h.spent || Math.abs(p.x - x) > 520) return;
  const c = F(x, 345), k = c[2], left = Math.round(Math.max(0, CHARGE - h.gave / Math.max(1, p.max)) * 100);
  g.save(); g.textAlign = 'center'; g.textBaseline = 'bottom'; g.lineJoin = 'round';
  g.font = `${Math.round(24 * k)}px Anton, Impact, sans-serif`; g.lineWidth = 6 * k; g.strokeStyle = '#06110a'; g.strokeText('HEALING STATION', c[0], c[1]);
  g.fillStyle = GREEN; g.fillText('HEALING STATION', c[0], c[1]);
  g.font = `600 ${Math.round(15 * k)}px system-ui, sans-serif`; g.lineWidth = 4 * k; g.strokeText(`stand in the light · ${left}% left`, c[0], c[1] + 20 * k);
  g.fillStyle = '#d9ffe2'; g.fillText(`stand in the light · ${left}% left`, c[0], c[1] + 20 * k);
  g.restore();
}
function tickHeals(dt) {
  const s = ST, p = E.P1;
  for (const h of s.heals) {
    const x = h.x - s.ox;
    if (!h.seen && Math.abs(x - cam.x) < E.VW / 2 + 40) { h.seen = true; if (!h.spent) { sfx.hover(); E.fx.push({ k: 2, x, y: 470, n: 'HEALING STATION', col: GREEN, t: 0, life: 1.4 }); } }
    const cap = CHARGE * p.max;
    if (!h.spent && cap - h.gave <= .05) { h.spent = true; h.healing = false; }      // (all given; or his health is less than it was, and so is what it holds for him)
    if (h.spent) { h.on = Math.max(0, h.on - dt * 3); continue; }
    const inside = Math.abs(p.x - x) < REACH && p.y < 60 && !p.dead && !(JU.raid && JU.raid.isDown()), want = inside && p.hp < p.max - .01;
    h.on = want ? Math.min(1, h.on + dt * 4) : Math.max(0, h.on - dt * 3);
    if (!want) { h.healing = false; continue; }
    if (!h.healing) { h.healing = true; sfx.charge(); }
    const amt = Math.max(0, Math.min(cap - h.gave, p.max * RATE * dt, p.max - p.hp));
    p.hp += amt; h.gave += amt; h.num += amt;
    if ((h.numT -= dt) <= 0 && h.num >= 1) { h.numT = .3; E.addNum(p.x, p.y + 290, '+' + Math.round(h.num), GREEN); h.num = 0; }
    if (Math.random() < dt * 26) V.puff('green', p.x + rnd(-50, 50), p.y + rnd(20, 240), rnd(-20, 20), rnd(160, 320), rnd(22, 40), rnd(.4, .7));
    if (cap - h.gave <= .05) {                      // all given
      h.spent = true; h.healing = false;
      if (h.num >= 1) E.addNum(p.x, p.y + 290, '+' + Math.round(h.num), GREEN);
      h.num = 0; E.fx.push({ k: 2, x, y: 420, n: 'SPENT', col: '#9fb5a6', t: 0, life: 1.1 });
    }
  }
}

/* ================= healing a partner ================= */
const RCT = { id: 'rct', name: 'Reverse Cursed Technique: Output', short: 'RCT: OUTPUT', jp: '反転術式・出力', col: '#bdf4ff', rgb: '189,244,255', frac: .3, cd: 22, look: 'beam', land: .45 };
const RCT2 = Object.assign({}, RCT, { id: 'rct2', short: 'RCT: OUTPUT · MAX', frac: .4, cd: 18 });
const LOVE = { id: 'love', name: 'Pure Love: Mend', short: 'PURE LOVE: MEND', jp: '純愛・治癒', col: '#f3c4ff', rgb: '243,196,255', frac: .35, cd: 24, look: 'love', land: .65 };
const PUPPET = { id: 'puppet', name: 'Repair Puppet', short: 'REPAIR PUPPET', jp: '修繕傀儡', col: '#ffc46b', rgb: '255,196,107', frac: .32, cd: 24, look: 'puppet', land: .9, dur: 3 };
const HEALERS = { limitless: RCT, alimit: RCT2, mecha: PUPPET, reaper: LOVE, tlr: LOVE, flr: LOVE, tflr: LOVE, yuta: LOVE };
const KINDS = { rct: RCT, rct2: RCT2, love: LOVE, puppet: PUPPET };
const healer = () => { const t = JU.tech.active; return (t && HEALERS[t.id]) || null; };
let hcd = 0;
// heals on their way: { k (the kind), from, to (the fighters, as this game has them), t, frac, mine (one of mine going out: its health is
// put in by their game), given, num, by (who sent it) }
const flying = [];
const say = (p, n, col) => E.fx.push({ k: 2, x: p.x, y: p.y + 400, n, col, t: 0, life: 1.1 });
function tryHeal() {
  const p = E.P1, k = healer(), R = JU.raid;
  if (!k) { say(p, 'THIS TECHNIQUE CANNOT HEAL OTHERS', '#9a98a6'); sfx.back(); return; }
  if (p.dead || R.isDown()) return;
  const list = R.partners();
  if (!list.length) { say(p, 'NOBODY TO HEAL', '#c8e8c0'); sfx.back(); return; }
  if (hcd > 0) { say(p, 'NOT YET · ' + Math.ceil(hcd) + 'S', '#cc8888'); sfx.back(); return; }
  const down = list.filter(x => x.down), hurt = list.filter(x => !x.down && x.hp < x.max - .5).sort((a, b) => a.hp / a.max - b.hp / b.max), who = down[0] || hurt[0];
  if (!who) { say(p, 'NOBODY NEEDS IT', '#c8e8c0'); return; }
  hcd = k.cd;
  flying.push({ k, from: p, to: who.f, t: 0, frac: k.frac, mine: true, given: 0, num: 0, by: '' });
  R.heal(who.pid, k.id, k.frac);
  say(p, k.short, k.col); sfx.charge(); if (k.look === 'puppet') sfx.whoosh();
  if (Z) Z.flash(k.rgb, .08, .2);
}
// one of theirs, for me: from their fighter as this game has it (raid.js hears it)
function incoming(kid, frac, from, by) {
  const k = KINDS[kid];
  if (!k || !from || !live()) return;
  flying.push({ k, from, to: E.P1, t: 0, frac: clamp(+frac || 0, 0, .5), mine: false, given: 0, num: 0, by: String(by || 'Your partner').slice(0, 24) });
  sfx.charge();
}
function give(e, f) {                               // what one of theirs puts back into me, as it lands
  const p = E.P1, R = JU.raid;
  if (f <= 0 || e.given >= e.frac) return;
  if (p.dead || R.isDown()) { e.given = e.frac; if (R.revive(Math.max(.3, e.frac), e.by)) { say(p, 'BACK ON YOUR FEET', e.k.col); burst(p, e.k); } return; }      // down: up again, with all of it at once
  f = Math.min(f, e.frac - e.given); e.given += f;
  const amt = Math.min(p.max - p.hp, f * p.max);
  if (amt > 0) { p.hp += amt; e.num += amt; }
  if (e.num >= 1 && (e.k.look !== 'puppet' || e.given >= e.frac - 1e-6 || e.num >= p.max * .08)) { E.addNum(p.x, p.y + 300, '+' + Math.round(e.num), GREEN); e.num = 0; }
}
function burst(f, k) { V.ring(f.x, f.y + 160, 260, k.col, .45); V.ring(f.x, f.y + 160, 160, '#ffffff', .3); for (let i = 0; i < 10; i++) V.puff('green', f.x + rnd(-60, 60), f.y + rnd(40, 260), rnd(-60, 60), rnd(120, 300), rnd(26, 46), rnd(.4, .7)); }
function tickFlying(dt) {
  for (let i = flying.length - 1; i >= 0; i--) {
    const e = flying[i], k = e.k, was = e.t;
    e.t += dt;
    if (was < k.land && e.t >= k.land) {          // it reaches them
      burst(e.to, k);
      if (!e.mine) say(E.P1, (k.jp + ' · ' + e.by).toUpperCase(), k.col);
    }
    if (!e.mine && e.t >= k.land) give(e, k.dur ? e.frac * clamp((e.t - k.land) / k.dur, 0, 1) - e.given : e.frac);
    if (k.look === 'puppet' && e.t >= k.land && e.t < k.land + k.dur && Math.random() < dt * 14) V.sparks(e.to.x + rnd(-30, 30), e.to.y + rnd(170, 240), 'fire', 2);
    if (e.t > k.land + (k.dur || 0) + .7) flying.splice(i, 1);
  }
}
const chest = f => [f.x, f.y + 165 * (f.scale || 1)];
const arc = (a, b, u, h) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * h];
function drawFlying() {
  for (const e of flying) {
    const k = e.k, A = chest(e.from), B = chest(e.to), u = clamp(e.t / k.land, 0, 1);
    if (k.look === 'puppet') puppet(e);
    lite(() => {
      if (k.look === 'beam' && e.t < k.land + .3) {           // a beam of it from his chest to theirs
        const tip = [lerp(A[0], B[0], ease(u)), lerp(A[1], B[1], ease(u))], a = F(A[0], A[1]), b = F(tip[0], tip[1]);
        const w = (7 + 4 * Math.sin(E.T * 38)) * a[2] * (e.t > k.land ? Math.max(0, 1 - (e.t - k.land) / .3) : 1);
        g.lineCap = 'round';
        g.strokeStyle = `rgba(${k.rgb},.8)`; g.lineWidth = w * 2.4; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
        g.strokeStyle = '#ffffff'; g.lineWidth = w * .7; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
        g.lineCap = 'butt';
        E.glow(E.GLOW.white, a[0], a[1], 150 * a[2], .7); E.glow(E.GLOW.blue, b[0], b[1], 210 * b[2], .8);
      } else if (k.look === 'love' && e.t < k.land + .1) {    // a ribbon of light over an arc, from him to them
        for (let i = 0; i < 16; i++) {
          const v = u - i * .04;
          if (v < 0 || v > 1) continue;
          const q = arc(A, B, v, 230), c = F(q[0], q[1]);
          E.glow(E.GLOW.pink || E.GLOW.purple, c[0], c[1], (78 - i * 3.6) * c[2], .85 * (1 - i / 16));
        }
      }
      if (e.t >= k.land) {                          // where it lands: light, and rings going out
        const v = (e.t - k.land) / .7;
        if (v < 1) {
          const c = F(B[0], B[1]);
          g.strokeStyle = `rgba(${k.rgb},${1 - v})`; g.lineWidth = 4 * (1 - v) + 1;
          g.beginPath(); g.arc(c[0], c[1], (60 + 210 * ease(v)) * c[2], 0, TAU); g.stroke();
          E.glow(E.GLOW.green, c[0], c[1], 400 * c[2], .5 * (1 - v));
        }
      }
    });
  }
}
function puppet(e) {                                // the Mechamaster's: a small puppet flies over on its thrusters, works on them, and goes
  const k = e.k, f0 = e.from, A = [f0.x - (f0.face || 1) * 40, f0.y + 240 * (f0.scale || 1)], B = [e.to.x - (e.to.face || 1) * 75, e.to.y + 265 * (e.to.scale || 1)];      // (where its feet are: up by their shoulder)
  let x, y, face, a = 1, work = false;
  if (e.t < k.land) { const u = ease(e.t / k.land); x = lerp(A[0], B[0], u); y = lerp(A[1], B[1], u) + Math.sin(u * Math.PI) * 170; face = Math.sign(B[0] - A[0]) || 1; }
  else if (e.t < k.land + k.dur) { x = B[0] + Math.sin(E.T * 3) * 12; y = B[1] + Math.sin(E.T * 5) * 9; face = Math.sign(e.to.x - x) || 1; work = true; }
  else { const v = (e.t - k.land - k.dur) / .7; x = B[0]; y = B[1] + v * 420; face = 1; a = Math.max(0, 1 - v); }
  const skin = (JU.mecha && JU.mecha.PUPPET) || E.CURSE, c = F(x, y), hand = F(x + face * 34, y + 70);
  lite(() => {
    E.glow(E.GLOW.fire, c[0], c[1] + 6 * c[2], 110 * c[2], .85 * a);                       // its thrusters
    if (work) {                                     // and what it is doing to them: a lamp on its hand, a line of it down onto them, sparks
      const t = F(e.to.x, e.to.y + 200 * (e.to.scale || 1));
      g.strokeStyle = `rgba(${k.rgb},${.55 + .3 * Math.sin(E.T * 30)})`; g.lineWidth = 4 * c[2]; g.beginPath(); g.moveTo(hand[0], hand[1]); g.lineTo(t[0], t[1]); g.stroke();
      E.glow(E.GLOW.gold || E.GLOW.fire, hand[0], hand[1], 90 * c[2], .8); E.glow(E.GLOW.green, t[0], t[1], 150 * t[2], .6);
    }
  });
  E.drawFighter({ skin, x, y, face, spin: 1, scale: .5, pose: POSE.jump.slice() }, a);
}

/* ================= the fight's side of it ================= */
const press0 = H.press, tick0 = H.tick, fx0 = H.fx, reset0 = H.reset, camX0 = H.camX;
H.press = (a, inScene) => {
  if (a === 'heal' && !inScene && live() && JU.raid && JU.raid.state && JU.raid.state.phase === 'fight') { tryHeal(); return true; }
  return press0 ? press0(a, inScene) : false;
};
// while the street is quiet the camera looks down it, a little ahead of him; while something is on him, at the two of them (never so far
// off as to lose him)
H.camX = () => {
  const c = camX0 ? camX0() : null;
  if (typeof c === 'number' || !live()) return c;
  const p = E.P1, o = E.P2;
  if (o && !o.ph && !o.ko && !(o.alpha < .3) && Math.abs(o.x - p.x) < 1500) return clamp((p.x + o.x) / 2, p.x - 380, p.x + 380);
  return p.x + LOOK;
};
H.tick = dt => {
  if (tick0) tick0(dt);
  if (!live()) return;
  ST.lock = ST.locked ? Math.min(1, ST.lock + dt * 2.5) : Math.max(0, ST.lock - dt * 1.5);
  if (hcd > 0) hcd = Math.max(0, hcd - dt);
  tickHeals(dt); tickFlying(dt);
  if (barEl) barEl.style.setProperty('--u', clamp((ST.ox - ST.p.a) / Math.max(1, ST.p.b - ST.p.a), 0, 1).toFixed(4));
  E.root.classList.toggle('healer', !!healer() && !!JU.raid && JU.raid.partners().length > 0);
};
H.fx = dt => {
  if (fx0) fx0(dt);
  if (!live()) return;
  for (const h of ST.heals) label(ST, h);
  drawFlying();
};
H.reset = () => { if (reset0) reset0(); flying.length = 0; hcd = 0; };

/* ================= on the raid's line at the top: how far down the street, the stations seen, and the heal key ================= */
function paintBar(el) {
  barEl = el;
  if (!el || !ST) return;
  const s = ST, span = Math.max(1, s.p.b - s.p.a), at = x => (clamp((x - s.p.a) / span, 0, 1) * 100).toFixed(1);
  el.innerHTML = `<i class="rb-road"></i><i class="rb-done"></i>${s.heals.filter(h => h.seen).map(h => `<i class="rb-heal${h.spent ? ' spent' : ''}" style="left:${at(h.x)}%" title="Healing station"></i>`).join('')}<i class="rb-boss" lang="ja">討</i><i class="rb-me"></i>`;
  el.style.setProperty('--u', clamp((s.ox - s.p.a) / span, 0, 1).toFixed(4));
}
const key = () => (ST ? ST.heals.map(h => +h.seen + 2 * h.spent).join('') + '|' + (healer() ? Math.ceil(hcd) : '-') : '');
function chip() {
  const k = healer();
  if (!k || !ST || !JU.raid || !JU.raid.partners().length) return '';
  return `<em class="rhl"><kbd>H</kbd> ${k.name} · ${hcd > 0 ? Math.ceil(hcd) + 's' : 'ready'}</em>`;
}

/* ================= a Heal button on a phone ================= */
const tb = document.querySelector('.tc .tbtns');
if (tb) { const b = document.createElement('button'); b.className = 't-s t-heal'; b.dataset.a = 'heal'; b.setAttribute('aria-label', 'Heal your partner'); b.textContent = 'Heal'; tb.appendChild(b); }

JU.rwalk = { plan, clean, open, close, move, to, here, worldOf, paintBar, key, chip, healer, incoming, HEALERS, KINDS, HALF, CHARGE, RATE,
  lock(on) { if (ST) ST.locked = !!on; },
  get ox() { return ST ? ST.ox : 0; }, get on() { return !!ST; },
  get state() { return ST && { w: ST.p.w, a: ST.p.a, b: ST.p.b, ox: Math.round(ST.ox), stops: ST.p.stops.slice(), lock: +ST.lock.toFixed(2), locked: ST.locked, hcd: +hcd.toFixed(1), flying: flying.length,
    heals: ST.heals.map(h => ({ x: h.x, gave: Math.round(h.gave), seen: h.seen, spent: h.spent })) }; } };
})();
