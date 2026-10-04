/* JUJUTSU UNLIMITEDS — chapter 8 (Hidden Inventory), chapter 9 (Shibuya) and chapter 10 (Blood Brother) */
(() => {
'use strict';

const E = JU.eng, C = JU.cast, X = JU.cast2, K = JU.cast3, D = JU.sets, V = JU.vfx, sfx = JU.sfx, Y = E.YUJI, add = JU.chapters.add;
const AS_GOJO = { skin: C.GOJO, tech: 'limitless', name: ['Satoru Gojo', '五条悟'] };

// the spear goes through the Infinity and through him
function stabbed(p) {
  p.hp = Math.max(1, p.max * .08);
  V.impact(.3, p.x, 200); V.sparks(p.x, 230, 'red', 20); E.cam.shake = 26; sfx.bf();
}

add(8, 'Hidden Inventory', [
  { stage: 'shrine', p1: [C.GOJO, -230], cast: [[K.GETO, 30, -1]], card: ['懐玉', 'TWELVE YEARS AGO'], lines: [
    ['geto', 'Our orders are simple, Satoru. Escort the Star Plasma Vessel to Master Tengen, and keep her alive until she gets there.'],
    ['gojo', 'Babysitting. Fine. We are the strongest, Suguru. Who is going to stop us?'],
    ['geto', 'There is a price on her head. Somebody will try.'],
    ['gojo', 'Then my technique stays up the whole way. Nothing touches her.']
  ] },
  { stage: 'shrine', p1: [C.GOJO, -240], foe: ['toji', 280], card: ['術師殺し', 'THE SORCERER KILLER'], lines: [
    ['toji', 'Three days without sleep, and your technique running the entire time. You look tired, Six Eyes.'],
    ['gojo', 'I felt nothing coming. Who are you?'],
    ['toji', 'Nobody. Not a drop of cursed energy in me. That is the whole trick.'],
    ['gojo', 'Suguru, take the girl and go. This one is mine.']
  ] },
  // he cannot win this one: at about half its health the fight is taken out of his hands
  { foes: ['toji'], stage: 'shrine', as: AS_GOJO, label: 'Hidden inventory', card: ['伏黒甚爾', 'TOJI FUSHIGURO'],
    mid: { at: .55, ends: true, fn: stabbed, lines: [
      ['toji', 'Your Infinity only stops what a technique can touch.'],
      ['toji', 'The Inverted Spear of Heaven. It cuts a technique off at the root.'],
      ['gojo', '...Through... the Infinity...'],
      ['toji', 'I must be out of practice. Killing the boy with the Six Eyes should have been harder than this.']
    ] } },
  { stage: 'shrine', p1: [C.GOJO, -200], foe: ['toji', 300], card: ['反転術式', 'REVERSE CURSED TECHNIQUE'], lines: [
    ['toji', 'You. I put a blade through your throat.'],
    ['gojo', 'You did. And right at the edge of dying I finally understood it. The core of cursed energy.'],
    ['gojo', 'I healed myself. I have never felt this good in my life.'],
    ['gojo', 'In all of heaven and earth, there is only me.']
  ] },
  { foes: ['toji'], stage: 'shrine', as: AS_GOJO, label: 'The honoured one', card: ['天上天下', 'THE HONOURED ONE'], win: ['茈', 'HOLLOW PURPLE'] },
  { stage: 'shrine', p1: [C.GOJO, -220], cast: [[K.GETO, 40, -1]], lines: [
    ['geto', 'Satoru. The girl is dead. He reached her before I could stop him.'],
    ['gojo', '...I know.'],
    ['geto', 'Tell me something. Which came first? You, or being the strongest?'],
    ['gojo', 'What kind of question is that?'],
    ['geto', 'One I cannot stop asking any more.']
  ] }
]);

// the gate shuts, and the strongest sorcerer alive is gone from the world
function sealed() {
  const p = E.P1;
  V.impact(.35, p.x, 180); V.ring(p.x, 180, 320, '#c9a53a', .5); V.sparks(p.x, 200, 'gold', 22); E.cam.shake = 26; sfx.bf();
  p.alpha = 0;
}

add(9, 'Shibuya', [
  { stage: 'street', p1: [Y, -260], cast: [[C.MEGUMI, -20, -1], [D.NOBARA, 110, -1]], card: ['十月三十一日', 'OCTOBER 31 · SHIBUYA'], lines: [
    ['megumi', 'A curtain came down over the whole of Shibuya. The people trapped inside can only say one thing.'],
    ['nobara', '"Bring us Satoru Gojo." Somebody built a trap and wrote his name on it.'],
    ['yuji', 'And he walked straight in?'],
    ['megumi', 'He is Gojo. Of course he did. We hold the outside until he is done.']
  ] },
  { stage: 'station', p1: [C.GOJO, -230], cast: [[X.HANAMI, 540, -1, 1.3]], foe: ['jogo', 280], card: ['渋谷駅', 'SHIBUYA STATION'], lines: [
    ['jogo', 'A platform packed with humans. You will not open your domain down here, Satoru Gojo.'],
    ['gojo', 'You brought a crowd to hide behind. Clever. For curses.'],
    ['hanami', 'Twenty minutes. That is all we have to take from you.'],
    ['gojo', 'Then I had better not waste any of them.']
  ] },
  { foes: ['hanami', 'jogo'], stage: 'station', as: AS_GOJO, label: 'Shibuya station', card: ['五条悟', 'THE STRONGEST'] },
  { stage: 'station', p1: [C.GOJO, -200], cast: [[K.KENJAKU, 180, -1]], card: ['獄門疆', 'PRISON REALM'], lines: [
    ['kenjaku', 'Hello, Satoru. It has been a long time.'],
    ['gojo', '...Suguru? No. I buried you myself. Who is in there?'],
    ['kenjaku', 'One minute of memories running through that head of yours. That was all the gate needed.'],
    ['gojo', 'My body will not move. So this is what you were after.'],
    ['kenjaku', 'Sleep well. The world will be a different shape when you wake.', sealed]
  ] },
  { stage: 'street', p1: [Y, -240], cast: [[C.MEGUMI, 0, -1]], lines: [
    ['megumi', 'Itadori. It just came over every channel. Gojo has been sealed.'],
    ['yuji', 'Sealed? Him?'],
    ['megumi', 'If we do not get him back, it is over. For Shibuya, and for everyone after it.'],
    ['yuji', 'Then we get him back. Whatever is standing in the way.']
  ] }
]);

// ten fingers at once, and somebody else is looking out of his eyes
function fed() {
  const p = E.P1;
  p.skin = JU.sukuna.SUKUNA;
  V.impact(.3, p.x, 180); V.ring(p.x, 180, 320, '#ff2440', .5); V.sparks(p.x, 200, 'red', 22); E.cam.shake = 24; sfx.bf();
}

add(10, 'Blood Brother', [
  { stage: 'station', p1: [Y, -240], foe: ['choso', 280], card: ['脹相', 'THE ELDEST BROTHER'], lines: [
    ['choso', 'Yuji Itadori. My brothers died under a bridge. Eso and Kechizu. You were there.'],
    ['yuji', '...I was. I killed them.'],
    ['choso', 'Did they say anything, at the end?'],
    ['yuji', 'They cried. For each other.'],
    ['choso', 'Then I will not make yours quick.']
  ] },
  { foes: ['choso'], stage: 'station', label: 'Blood brother', card: ['赤血操術', 'BLOOD MANIPULATION'], floor: 8, win: ['兄', 'BIG BROTHER'],
    mid: { at: .4, lines: [
      ['choso', 'What is this? A table. All of us eating together. And you, sitting there among them...'],
      ['choso', 'That never happened. That memory cannot exist!'],
      ['yuji', 'What are you talking about?']
    ] } },
  { stage: 'station', p1: [Y, -240], cast: [[JU.choso.CHOSO, 120, -1]], lines: [
    ['choso', 'An older brother always knows when one of his own is dying. I felt it with them. I feel it with you.'],
    ['yuji', 'You were trying to kill me a minute ago.'],
    ['choso', 'I need to think. Do not die before I have finished, Yuji.']
  ] },
  { stage: 'street', p1: [Y, -200], foe: ['jogo', 260], card: ['十本', 'TEN FINGERS'], lines: [
    ['jogo', 'Out cold. Good. Ten fingers, all at once. Wake up, King of Curses.', fed],
    ['sukuna', 'You have one minute before the brat comes back. State your business.'],
    ['jogo', 'Join us. Keep that body, and this age is yours.'],
    ['sukuna', 'Land one blow on me and I will consider it. Begin.']
  ] }
]);
})();
