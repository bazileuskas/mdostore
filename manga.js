/* JUJUTSU UNLIMITEDS — Build 0.17v1: manga lettering, for what the characters say and think in their awakenings and finishers. Two kinds,
   after the user's two pictures of it (Jujutsu Shenanigans'):
     THOUGHT   the words on their own: black lettering with a white edge, no balloon ("COME, RIKA.")
     SPEECH    the words in a white box with a black border, the kind a manga panel has ("LET'S GET")
   The user's way of asking for them: "for the thought speech" is the first, "in the speech bubble add" the second. Both sit by whoever they
   belong to and follow them about, pop in, and go. The lettering is Shantell Sans (Google Fonts), the nearest to the pictures' */
(() => {
'use strict';

const E = JU.eng, cam = E.cam, H = E.hooks;
const layer = document.createElement('div');
layer.className = 'manga'; layer.setAttribute('aria-live', 'polite');
E.root.appendChild(layer);
const live = [];                                    // { el, f, t, life, side, up }

// where a point of the world is on the page: the camera's zoom and lift as render() has them, then the canvas's scale
function page(x, y) {
  const c = E.F(x, y), VW = E.VW, cy = E.GY - 120, z = cam.zoom || 1;
  return [(VW / 2 + (c[0] - VW / 2) * z) * E.S, (cy + (c[1] - cy) * z - (cam.lift || 0)) * E.S];
}
function place(it) {
  const f = it.f, hs = f.scale || 1, c = page(f.x + (f.face || 1) * it.side * (it.el.classList.contains('say') ? 190 : 120) * hs, f.y + it.up * hs);
  it.el.style.translate = `${Math.round(c[0])}px ${Math.round(c[1])}px`;
}
// kind: 'think' or 'say'; f: whoever it belongs to; o: { life (seconds), side (-1 behind them, 0 over them, 1 in front), up (how high) }
function add(kind, f, text, o = {}) {
  const el = document.createElement('div');
  el.className = 'mg ' + kind; el.textContent = text;
  layer.appendChild(el);
  const it = { el, f, t: 0, life: o.life || 1.8, side: o.side === undefined ? (kind === 'say' ? 1 : -1) : o.side, up: o.up || (kind === 'say' ? 300 : 400) };
  live.push(it); place(it);
  return it;
}
const think = (f, text, o) => add('think', f, text, o);
const say = (f, text, o) => add('say', f, text, o);
function clear() { for (const it of live) it.el.remove(); live.length = 0; }

const post0 = H.post;
H.post = dt => {
  if (post0) post0(dt);
  for (let i = live.length - 1; i >= 0; i--) {
    const it = live[i];
    it.t += dt || 0;
    if (it.t >= it.life) { it.el.remove(); live.splice(i, 1); continue; }
    if (it.t >= it.life - .25 && !it.out) { it.out = true; it.el.classList.add('out'); }
    place(it);
  }
};
const reset0 = H.reset, start0 = H.fightStart;
H.reset = () => { reset0(); clear(); };
H.fightStart = (cfg, wave) => { start0(cfg, wave); if (!wave) clear(); };

JU.manga = { think, say, clear, get live() { return live.map(it => [it.el.className, it.el.textContent]); } };
})();
