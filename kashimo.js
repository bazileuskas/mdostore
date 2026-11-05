/* JUJUTSU UNLIMITEDS — the MYTHICAL WARRIOR clan (Build 0.26; the user's: "a new limited clan called: Mythical Warrior which is kashimo and gives
   you a 30% damage boost to al damage and also immune to fire based attacks 2%"). Limited time, drawn for first at 2% while it is here.
   +30% on every hit he lands, the exact-number ones included (clan.js: fixed). Fire does not hurt him: what the fire bosses throw (Disaster
   Flames, Blazing Courage), Fuga and 500% Fuga, the Coffin of the Iron Mountain's burning (foes.js: Fi.burning marks it). It touches him, and
   he is not moved by it. No ability on R: the user asked for the two. His look stays his own, the same as every clan that is not a body */
(() => {
'use strict';

const E = JU.eng, H = E.hooks, V = JU.vfx, C = JU.clan;
const ENDS = Date.parse('2026-11-12T12:00:00Z');   // a week from Build 0.26
const BOLT = '#9fe8ff';

C.CLAN.kashimo = { id: 'kashimo', name: 'Mythical Warrior', jp: '雷神', odds: 2, col: BOLT, dmg: .3, fixed: .3, limited: ENDS,
  lines: ['+30% damage on everything you land, exact-number moves included', 'Immune to fire: flames, Fuga, a burning domain. It touches you and does nothing'] };
C.ORDER.push('kashimo');

// fire reached him (foes.js asks): nothing comes of it but a word over his head, and a crackle where it touched
let said = -1;
const fp0 = H.fireproof;
H.fireproof = (p, a) => {
  if (!(C.active && C.active.id === 'kashimo')) return !!(fp0 && fp0(p, a));
  if (E.T - said > .35) {                           // (not once a frame: a burning domain asks every second, the ember insects as often as they touch)
    said = E.T;
    E.fx.push({ k: 2, x: p.x, y: p.y + 300, n: 'IMMUNE', col: BOLT, t: 0, life: .8 });
    V.sparks(p.x, p.y + 150, 'blue', 6); V.ring(p.x, p.y + 150, 110, BOLT, .2);
  }
  return true;
};

JU.kashimo = { ENDS };
})();
