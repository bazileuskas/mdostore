/* JUJUTSU UNLIMITEDS — chapter 4 (The Strongest) and chapter 5 (Mahito) */
(() => {
'use strict';

const E = JU.eng, C = JU.cast, X = JU.cast2, V = JU.vfx, sfx = JU.sfx, Y = E.YUJI, add = JU.chapters.add;
const AS_GOJO = { skin: C.GOJO, tech: 'limitless', name: ['Blindfolded Infinity', '無限'] };
const NANAMI = { skin: X.NANAMI, call: 'RATIO  7:3', col: '#ffd27a', dmg: 11 };

add(4, 'The Strongest', [
  { stage: 'shrine', p1: [Y, -230], cast: [[C.GOJO, -10, -1, 1.1]], card: ['呪術高専', 'JUJUTSU HIGH'], lines: [
    ['gojo', 'While the world thinks you are dead, we fix your one real problem. You have power. You have no control over it.'],
    ['yuji', 'So what is the training? More fights?'],
    ['gojo', 'Movies. You watch them holding this doll. Let your cursed energy waver for a second and it punches you.'],
    ['yuji', 'That is the whole... ow! I had not even pressed play!'],
    ['gojo', 'See? It works. Horror, comedy, three-hour dramas. Steady output through all of it.'],
    ['gojo', 'But first, a field trip. Somebody has been dying to meet me.']
  ] },
  { stage: 'mountain', p1: [C.GOJO, -200], cast: [[Y, -430, 1]], foe: ['jogo', 300], card: ['山道', 'A MOUNTAIN ROAD'], lines: [
    ['jogo', 'Blindfolded Infinity. Tonight the pillar this rotten human age leans on burns down.'],
    ['gojo', 'A special grade that can hold a conversation. Vessel, this one is a lesson. Watch closely.'],
    ['yuji', 'You brought me to a fight as homework?!'],
    ['gojo', 'The best kind. Do not blink.']
  ] },
  // the player is Gojo here, with the whole Limitless moveset
  { foes: ['jogo'], stage: 'mountain', as: AS_GOJO, label: 'The strongest', card: ['火山', 'DISASTER FLAME'], domain: 'blue' },
  { stage: 'void', p1: [C.GOJO, -160], cast: [[Y, -400, 1]], foe: ['jogo', 220], card: ['無量空処', 'UNLIMITED VOID'], zoom: 1.05, lines: [
    ['gojo', 'Domain Expansion. Unlimited Void.'],
    ['gojo', 'In here you see everything and feel everything, without end. So you can do nothing at all.'],
    ['jogo', '...I cannot... move. What... is this...'],
    ['yuji', 'So this is what the strongest looks like.'],
    ['gojo', 'This is what the top looks like, Vessel. Now climb.']
  ] }
]);

// Sukuna does not appreciate visitors
function trespass() {
  const o = E.P2;
  o.hp = Math.max(1, o.hp - 40); o.flash = .2;
  V.impact(.3, o.x, 150); V.sparks(o.x, 150, 'red', 20); E.cam.shake = 24; sfx.bf();
}

add(5, 'Soul Shaper', [
  { stage: 'street', p1: [Y, -260], cast: [[X.NANAMI, -20, -1]], card: ['川崎', 'KAWASAKI'], lines: [
    ['nanami', 'Ratio Blade. Grade one. I should say now that I do not like this job. I only dislike it less than my last one.'],
    ['yuji', 'Nice to meet you, Nanamin!'],
    ['nanami', 'Do not call me that. Look ahead. Those were people an hour ago. Something reshaped them.'],
    ['yuji', 'Can we turn them back?'],
    ['nanami', 'No. End it quickly. It is the only kindness we have left to give them.']
  ] },
  { foes: ['warped', 'warped2'], stage: 'street', ally: NANAMI, label: 'Kawasaki' },
  { stage: 'school', p1: [Y, -230], cast: [[X.NANAMI, -470, 1]], foe: ['mahito', 280], card: ['里桜高校', 'SATOZAKURA HIGH'], lines: [
    ['mahito', 'So you are King of Curses\'s vessel! I have wanted to get my hands on your soul for ages.'],
    ['yuji', 'You are the one who did that to those people.'],
    ['mahito', 'I changed their shape, that is all. Souls are clay. Shall we look at yours?'],
    ['nanami', 'Vessel. Do not let his palms touch you.']
  ] },
  { foes: ['mahito'], stage: 'school', ally: NANAMI, label: 'Special grade', card: ['魂', 'SOUL SHAPER'], win: ['逃', 'HE GOT AWAY'],
    mid: { at: .5, lines: [
      ['mahito', 'Got you. Now, what does the inside of a vessel look l—'],
      ['sukuna', 'Who told you that you could touch my soul?', trespass],
      ['mahito', 'There are two of them in there...!'],
      ['yuji', 'I do not know what you just did. But it hurt you. So I am not stopping.']
    ] } },
  { stage: 'school', p1: [Y, -230], cast: [[X.NANAMI, 0, -1]], lines: [
    ['nanami', 'He went down the drain. Literally. Shameless.'],
    ['yuji', 'Nanamin... I could not save a single one of them.'],
    ['nanami', 'No. But there will be no more after tonight, because of you. Learn the difference. It is how you keep going.'],
    ['yuji', '...Right.']
  ] }
]);
})();
