/* JUJUTSU UNLIMITEDS — chapter 11 (The King of Curses) and chapter 12 (The Last of Mahito) */
(() => {
'use strict';

const E = JU.eng, C = JU.cast, X = JU.cast2, K = JU.cast3, V = JU.vfx, sfx = JU.sfx, Y = E.YUJI, SUKUNA = JU.sukuna.SUKUNA, add = JU.chapters.add;
const AS_SUKUNA = { skin: SUKUNA, tech: 'shrine', name: ['Ryomen Sukuna', '両面宿儺'], hp: 150, domain: 'shrine' };   // more health than the boy, and G opens Malevolent Shrine
const TODO = { skin: X.TODO, call: 'BOOGIE WOOGIE', col: '#7ad7ff', dmg: 10, scale: 1.2 };

add(11, 'The King of Curses', [
  // the player is Sukuna for this chapter, with the whole of Shrine
  { foes: ['jogo'], stage: 'street', as: AS_SUKUNA, label: 'One minute', card: ['両面宿儺', 'RYOMEN SUKUNA'], win: ['焔', 'ASHES'] },
  { stage: 'street', p1: [SUKUNA, -220], foe: ['jogo', 240], lines: [
    ['jogo', 'Not one blow. I could not land even one...'],
    ['sukuna', 'You burned hotter than a thousand years of sorcerers. Be proud of it. You were strong.'],
    ['jogo', '...What is this? Tears?']
  ] },
  { stage: 'street', p1: [SUKUNA, -240], cast: [[C.MEGUMI, -520, 1]], foe: ['mahoraga', 300], card: ['魔虚羅', 'THE DIVINE GENERAL'], lines: [
    ['megumi', 'I call the one no Ten Shadows user has ever tamed. Come out, Mahoraga.'],
    ['sukuna', 'Megumi Fushiguro. You would die just to drag that thing into the world? I still have a use for you.'],
    ['sukuna', 'So the ritual breaks if somebody else kills it. Fine. Come, then. Show me what adapts to anything.']
  ] },
  // it adapts as the fight goes on. Fuga lands twice as hard while the shrine is open
  { foes: ['mahoraga'], stage: 'street', as: AS_SUKUNA, label: 'The divine general', card: ['魔虚羅', 'MAHORAGA'], win: ['竈', 'FUGA'] },
  { stage: 'street', p1: [Y, -200], card: ['渋谷', 'WHAT IS LEFT OF SHIBUYA'], lines: [
    ['yuji', '...Where am I? What happened here? The buildings. All of it is gone.'],
    ['yuji', 'People lived here. I can still feel what he did with these hands.'],
    ['yuji', 'I cannot stop. If I stop now, then all of this was only murder.']
  ] }
]);

const now = () => JU.chapters.now;
// Mahito's hand, and then there is nobody standing where Nanami was
function gone() {
  const n = now().cast[0];
  V.impact(.3, n.x, 180); V.sparks(n.x, 190, 'teal', 26); V.ring(n.x, 180, 260, '#78e6c8', .4); E.cam.shake = 24; sfx.bf();
  n.alpha = 0;
}
// swallowed whole
function taken() {
  const o = E.P2;
  V.ring(o.x, 160, 300, '#c9a53a', .5); V.sparks(o.x, 180, 'purple', 24); E.cam.shake = 18; sfx.charge();
  o.alpha = 0;
}

add(12, 'The Last of Mahito', [
  { stage: 'station', p1: [Y, -260], cast: [[X.NANAMI, -20, -1]], foe: ['mahito', 320], card: ['渋谷駅', 'SHIBUYA STATION'], lines: [
    ['nanami', 'Itadori. You are still standing. Good.'],
    ['yuji', 'Nanamin! You are hurt. Stop, let me...'],
    ['mahito', 'Found you, Seven-to-Three. Oh, and the vessel as well. What timing.'],
    ['nanami', 'The rest is yours, Itadori.', gone],
    ['yuji', 'MAHITO!']
  ] },
  // he cannot finish it alone: half-way through, the fight stops and Todo arrives
  { foes: ['mahito'], stage: 'station', label: 'Shibuya', card: ['真人', 'MAHITO'],
    mid: { at: .5, ends: true, lines: [
      ['mahito', 'You are slowing down. Tired? Sad? Souls get so heavy when they break.'],
      ['yuji', '...Nanamin. Kugisaki. I could not...'],
      ['todo', 'On your feet, brother! We are sorcerers. We do not get to fall while there is still someone left to save!']
    ] } },
  { stage: 'station', p1: [Y, -240], cast: [[X.TODO, -480, 1, 1.2]], foe: ['mahito2', 300], card: ['遍殺即霊体', 'HIS TRUE SHAPE'], lines: [
    ['mahito', 'I finally understand my own soul. This is the shape it was always meant to take.'],
    ['todo', 'He has changed. Stay sharp, brother. My technique still works with one good hand.'],
    ['yuji', 'You were right about one thing, Mahito. We are the same. So I will be the thing that kills you, as many times as it takes.']
  ] },
  { foes: ['mahito2'], stage: 'station', ally: TODO, label: 'The soul', card: ['真人', 'MAHITO'], win: ['黒閃', 'BLACK FLASH'] },
  { stage: 'station', p1: [Y, -240], cast: [[K.KENJAKU, 420, -1]], foe: ['mahito', 150], card: ['呪霊操術', 'CURSED SPIRIT MANIPULATION'], lines: [
    ['mahito', 'No. No, stay back. I am not finished, I can still...'],
    ['kenjaku', 'You look as though you need rescuing, Mahito.', taken],
    ['yuji', 'He swallowed him. You. You are the one who sealed Gojo.'],
    ['kenjaku', 'And you are Sukuna\'s cage. We will meet again, Yuji Itadori. The age of curses has only just begun.']
  ] }
]);
})();
