/* JUJUTSU UNLIMITEDS — touch controls for phones and tablets: a stick, a few buttons, and a hotbar that can be tapped */
(() => {
'use strict';

const root = document.getElementById('game'), doc = document.documentElement, keys = JU.game.keys, press = JU.game.press;
const flag = (k, on) => { if (on) keys.add(k); else keys.delete(k); };

// phones and tablets get the controls straight away; anything else gets them the first time its screen is touched
const enable = () => doc.classList.add('touch');
if (matchMedia('(hover: none) and (pointer: coarse)').matches) enable(); else addEventListener('touchstart', enable, { once: true, passive: true });

const ui = document.createElement('div');
ui.className = 'tc';
ui.innerHTML = `<div class="tstick"><i></i></div>
  <div class="tbtns">
    <button class="t-s t-awk" data-a="awk" aria-label="Awakening">G</button><button class="t-s t-clan" data-a="clan" aria-label="Clan ability">R</button>
    <button class="t-s t-ves t-t" data-a="takeover" aria-label="Take over">T</button><button class="t-s t-ves t-v" data-a="vow" aria-label="Binding vow">V</button>
    <button class="t-dash" data-a="dash">Dash</button><button class="t-jump" data-a="jump">Jump</button><button class="t-hit" data-a="m1">Strike</button>
  </div>
  <button class="t-x" data-x="1" aria-label="Back to the title">✕</button><button class="t-skip" data-a="skip">Skip ▸▸</button>`;
root.appendChild(ui);
const rot = document.createElement('div');
rot.className = 'rot'; rot.innerHTML = '<b lang="ja">回</b><span>Turn your phone sideways</span>';
document.body.appendChild(rot);

/* ---------- buttons. The game treats a tap anywhere as a strike, so a tap on a control must not travel any further ---------- */
ui.addEventListener('pointerdown', e => {
  const b = e.target.closest('button');
  e.stopPropagation();
  if (!b) return;
  e.preventDefault();
  if (b.dataset.x) JU.exitGame(); else press(b.dataset.a);
});
ui.addEventListener('pointermove', e => e.stopPropagation());
root.querySelectorAll('.hotbar .mv').forEach(el => el.addEventListener('pointerdown', e => { e.stopPropagation(); press(el.dataset.m); }));
document.getElementById('awk').addEventListener('pointerdown', e => { e.stopPropagation(); press('awk'); });

/* ---------- the stick: left and right in a fight (up jumps), all four ways on the street, and pushed right out it runs ---------- */
const stick = ui.querySelector('.tstick'), knob = stick.firstElementChild;
let id = null, wasUp = false;
function set(x, y) {
  const up = y < -.55;
  knob.style.transform = `translate(${x * 58}%, ${y * 58}%)`;
  flag('a', x < -.35); flag('d', x > .35); flag('w', y < -.4); flag('s', y > .4); flag('shift', Math.hypot(x, y) > .92);
  if (up && !wasUp && root.dataset.mode === 'fight') press('jump');
  wasUp = up;
}
function move(e) {
  const r = stick.getBoundingClientRect(), R = r.width / 2;
  let x = (e.clientX - r.left - R) / R, y = (e.clientY - r.top - R) / R;
  const m = Math.hypot(x, y);
  if (m > 1) { x /= m; y /= m; }
  set(x, y);
}
const drop = e => { if (e.pointerId === id) { id = null; set(0, 0); } };
stick.addEventListener('pointerdown', e => { id = e.pointerId; try { stick.setPointerCapture(id); } catch (err) {} move(e); });
stick.addEventListener('pointermove', e => { if (e.pointerId === id) move(e); });
stick.addEventListener('pointerup', drop); stick.addEventListener('pointercancel', drop);

// which clan is in play decides which of the small buttons are worth showing
new MutationObserver(() => { root.dataset.clan = JU.clan.active ? JU.clan.active.id : ''; })
  .observe(document.getElementById('clanHint'), { childList: true, characterData: true, subtree: true });

// starting a mode from a touch screen goes full screen and asks for landscape, where the browser allows either
document.addEventListener('click', e => {
  if (!doc.classList.contains('touch') || !e.target.closest('.mode') || document.fullscreenElement) return;
  const go = doc.requestFullscreen || doc.webkitRequestFullscreen;
  if (go) Promise.resolve(go.call(doc)).then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape')).catch(() => {});
}, true);
})();
