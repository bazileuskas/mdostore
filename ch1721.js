/* JUJUTSU UNLIMITEDS — season three goes on: chapter 17 (Perfect Preparation), 18 (The Zenin Clan), 19 (The Fight Club),
   20 (Tokyo No. 1 Colony) and 21 (Deadly Sentencing) */
(() => {
'use strict';

const E = JU.eng, C = JU.cast, X = JU.cast2, K = JU.cast5, V = JU.vfx, sfx = JU.sfx, Y = E.YUJI, add = JU.chapters.add;
const AS_MAKI = { skin: X.MAKI, tech: 'maki', name: ['Maki Zenin', '禪院真希'], hp: 110 };
const REBORN = Object.assign({}, AS_MAKI, { hp: 200 });                       // after the pit: nothing left in her that a curse could hold on to
const SEALED = { sealed: true };                                              // Yuji with his cursed energy confiscated
const who = i => JU.chapters.now.cast[i];
const floored = () => { const o = E.P2; o.target = E.POSE.down; o.rate = 7; };

// Mai goes, and takes every scrap of cursed energy the two of them shared with her. What she leaves is a sword
function gift() {
  const f = who(0);
  sfx.charge(); V.ring(f.x, 170, 300, '#9ad0c0', .6); V.sparks(f.x, 190, 'green', 22);
  V.custom(1.4, u => { f.alpha = Math.max(0, 1 - u * 1.2); });
  V.slash(f.x, 190, 1.2, 300, '#e8f0ff', 10, .9);
}

add(17, 'Perfect Preparation', [
  { stage: 'shrine', p1: [X.MAKI, -240], foe: ['ogi', 280], card: ['禪院家', 'THE ZENIN ESTATE'], lines: [
    ['maki', 'The storehouse is empty. You cleared out every cursed tool before I got here.'],
    ['ogi', 'You came to arm yourself for Megumi Fushiguro. As your father, I cannot allow that.'],
    ['ogi', 'I was never made head of this clan, and the reason is you and your sister. Tonight I put that right.'],
    ['maki', 'You never needed our help to fail.']
  ] },
  // she cannot win this one yet
  { foes: ['ogi'], stage: 'shrine', as: AS_MAKI, label: 'The storehouse', card: ['禪院扇', 'OGI ZENIN'], floor: 1,
    mid: { at: .55, low: .25, ends: true, lines: [
      ['ogi', 'A girl with no cursed energy, swinging borrowed tools. This was always how it would end.'],
      ['maki', '...I am not finished.'],
      ['ogi', 'The pit will finish what I started. You, and your sister with you.']
    ] } },
  { stage: 'pit', p1: [X.MAKI, -200], cast: [[K.MAI, 70, -1]], card: ['懲罰房', 'THE PIT'], lines: [
    ['mai', 'He threw the pair of us in. Listen. They are waking up, every curse the clan keeps down here.'],
    ['mai', 'You know why you were never whole, do you not? To jujutsu, twins are one person. While I hold cursed energy, you can never be rid of it.'],
    ['maki', 'Mai. Do not.'],
    ['mai', 'So I am taking all of it with me. And I am leaving you the one thing I could make.'],
    ['mai', 'Promise me. Tear the whole of it down. Leave nothing standing.', gift],
    ['maki', '...Mai.']
  ] },
  { foes: ['brute', 'ruin'], stage: 'pit', as: REBORN, label: 'The pit', card: ['天与呪縛', 'HEAVENLY RESTRICTION'] },
  { stage: 'shrine', p1: [X.MAKI, -240], foe: ['ogi', 280], card: ['真依の刀', 'WHAT MAI LEFT'], lines: [
    ['ogi', 'You climbed out. And that sword. Where is your sister?'],
    ['maki', '...'],
    ['ogi', 'That look. I have seen it once before. On him. On Toji.'],
    ['maki', 'She asked me for one thing. You are first.']
  ] },
  { foes: ['ogi'], stage: 'shrine', as: REBORN, label: 'What Mai left', card: ['禪院真希', 'MAKI ZENIN'], win: ['斬', 'CUT DOWN'] }
]);

add(18, 'The Zenin Clan', [
  { stage: 'shrine', p1: [X.MAKI, -240], foe: ['hei', 300], card: ['躯倶留隊', 'THE KUKURU UNIT'], lines: [
    ['hei', 'Maki has killed Ogi! By order of the clan, cut her down where she stands!'],
    ['maki', 'All of you at once, then. It saves me the walk.']
  ] },
  { foes: ['hei', 'hei', 'kukuru'], stage: 'shrine', as: REBORN, label: 'The clan', card: ['禪院家', 'THE ZENIN CLAN'] },
  { stage: 'shrine', p1: [X.MAKI, -240], foe: ['naoya', 300], card: ['禪院直哉', 'THE NEW HEAD'], lines: [
    ['naoya', 'Look at you. You have turned into him. Toji. The only man in this house I ever looked up to.'],
    ['naoya', 'But you are not the one who stands on that side of the line. I am.'],
    ['maki', 'You are in my way.']
  ] },
  { foes: ['naoya'], stage: 'shrine', as: REBORN, label: 'The heir', card: ['投射呪法', 'PROJECTION SORCERY'], win: ['終', 'THE END OF THE ZENIN'] },
  { stage: 'shrine', p1: [X.MAKI, -200], foe: ['naoya', 230], lines: [
    ['naoya', 'Not you. Anyone but you...', floored],
    ['maki', 'Tell whoever is left. The Zenin clan ended tonight.'],
    ['maki', 'It is done, Mai. I am going back to the others.']
  ] }
]);

add(19, 'The Fight Club', [
  { stage: 'street', p1: [Y, -260], cast: [[C.MEGUMI, 0, -1]], card: ['栃木', 'TOCHIGI'], lines: [
    ['megumi', 'Kinji Hakari. A third-year, suspended. When his luck is in, he is stronger than Okkotsu. We need him.'],
    ['megumi', 'He runs a fight club under a car park and he hates the school, so I cannot show my face. You go in as a fighter.'],
    ['yuji', 'Get in, get noticed, get to the man at the top. Got it.']
  ] },
  { stage: 'garage', p1: [Y, -240], foe: ['panda', 280], card: ['賭け試合', 'THE RING'], lines: [
    ['panda', 'Psst. Itadori. It is me. Play along. Make it look good and the boss will want to meet you.'],
    ['yuji', 'Panda?! ...Okay. Sorry in advance.']
  ] },
  { foes: ['panda'], stage: 'garage', label: 'Fight club', card: ['パンダ', 'PANDA'], win: ['勝', 'WINNER'] },
  { stage: 'garage', p1: [Y, -240], foe: ['hakari', 300], card: ['秤金次', 'KINJI HAKARI'], lines: [
    ['hakari', 'You have a fever in you, kid. I like that. But you are from the school, and you walked in here to lie to me.'],
    ['yuji', 'I came to ask for your help. People are dying in the Culling Game right now.'],
    ['hakari', 'Then show me how much you mean it. Fever is the only thing I trust.']
  ] },
  // he does not have to win. He has to keep getting up
  { foes: ['hakari'], stage: 'garage', label: 'Fever', card: ['熱', 'FEVER'], floor: 1,
    mid: { at: .5, low: .3, ends: true, lines: [
      ['hakari', 'Why do you keep getting up? You could have walked out of here ten punches ago.'],
      ['yuji', 'Because I am one small part of something bigger. If my part gets done, it does not matter what happens to me.'],
      ['hakari', '...Heh. A spare part with a fever. All right.']
    ] } },
  { stage: 'garage', p1: [Y, -260], cast: [[C.MEGUMI, -480, 1]], foe: ['hakari', 240], lines: [
    ['hakari', 'I am in. One condition: when this is over, the school stays out of my business.'],
    ['megumi', 'Done.'],
    ['hakari', 'Then let us go and gamble.']
  ] }
]);

add(20, 'Tokyo No. 1 Colony', [
  { stage: 'street', p1: [Y, -260], cast: [[C.MEGUMI, 0, -1]], card: ['東京第1結界', 'TOKYO NO. 1 COLONY'], lines: [
    ['megumi', 'Past this line we are players. The barrier drops everyone somewhere different, so we will be split up.'],
    ['megumi', 'The man we want is Hiromi Higuruma. A hundred and two points. Enough to add a rule.'],
    ['yuji', 'Then whoever finds him first asks nicely.'],
    ['kogane', 'Two players registered. Welcome to the Culling Game.']
  ] },
  { stage: 'street', p1: [Y, -240], foe: ['haba', 300], card: ['泳者', 'A PLAYER'], lines: [
    ['haba', 'A new one! New ones with a technique are worth five points. Have you got a technique?'],
    ['yuji', 'I am not here to fight you. I am looking for a man called Higuruma.'],
    ['haba', 'Everybody wants something. I want five points.']
  ] },
  { foes: ['haba'], stage: 'street', label: 'The colony', card: ['羽場', 'HABA'] },
  { stage: 'street', p1: [Y, -200], foe: ['haba', 230], lines: [
    ['yuji', 'Higuruma. Where is he?', floored],
    ['haba', 'The theatre... in Ikebukuro. He has not come out of it in days...'],
    ['yuji', 'Thanks. Stay down.']
  ] }
]);

add(21, 'Deadly Sentencing', [
  { stage: 'theatre', p1: [Y, -240], foe: ['higuruma', 300], card: ['日車寛見', 'HIROMI HIGURUMA'], domain: 'gold', lines: [
    ['yuji', 'Higuruma? I need your points. A hundred of them, for a rule that lets people stop killing each other.'],
    ['higuruma', 'I was a defence lawyer. I believed the law could shield the weak. Then I watched it break an innocent man, and I stopped believing.'],
    ['higuruma', 'This game lets me judge people as they deserve. I have no reason to end it.'],
    ['yuji', 'Then I will take the points from you.'],
    ['higuruma', 'Domain Expansion. Deadly Sentencing.']
  ] },
  { stage: 'court', p1: [Y, -260], foe: ['higuruma', 300], card: ['誅伏賜死', 'DEADLY SENTENCING'], lines: [
    ['higuruma', 'Nobody can raise a hand in here. This is a court. That is Judgeman, and he knows everything about the accused.'],
    ['judgeman', 'Yuji Itadori is suspected of entering a pachinko parlour while under age.'],
    ['yuji', '(...I did do that.) I only went in to use the toilet!'],
    ['judgeman', 'Guilty. Confiscation.'],
    ['higuruma', 'Your cursed energy has been confiscated. You have nothing left but your hands.']
  ] },
  { foes: ['higuruma'], stage: 'theatre', as: SEALED, label: 'Confiscation', card: ['没収', 'CONFISCATION'],
    mid: { at: .55, ends: true, domain: 'gold', lines: [
      ['higuruma', 'No cursed energy at all, and you are still standing. What are you made of?'],
      ['yuji', 'I want a retrial!'],
      ['higuruma', '...The accused has that right. Very well.']
    ] } },
  { stage: 'court', p1: [Y, -260], foe: ['higuruma', 300], card: ['再審', 'THE RETRIAL'], lines: [
    ['judgeman', 'Yuji Itadori is suspected of mass murder in Shibuya on the thirty-first of October.'],
    ['higuruma', '(That was Sukuna, in control of his body. He only has to say so, and no court could hold him to it.)'],
    ['yuji', 'It is true. I killed them. Every one of them.'],
    ['judgeman', 'Guilty. Confiscation. Death penalty.'],
    ['higuruma', 'The Executioner\'s Sword. Whoever it touches, dies. ...Why did you not deny it?']
  ] },
  // one touch of the sword is the end of him. It stops when Higuruma has seen enough
  { foes: ['higuruma2'], stage: 'theatre', as: SEALED, label: 'Death penalty', card: ['処刑人の剣', 'EXECUTIONER\'S SWORD'],
    mid: { at: .45, ends: true, lines: [
      ['higuruma', 'You could have put it on him. You chose to carry it yourself.'],
      ['yuji', 'They were my hands. That makes it mine.'],
      ['higuruma', '(Those eyes. The same as the man I could not save.)'],
      ['higuruma', 'Yuji Itadori. You are not guilty.']
    ] } },
  { stage: 'theatre', p1: [Y, -240], foe: ['higuruma', 260], card: ['総則追加', 'A NEW RULE'], lines: [
    ['higuruma', 'Kogane. I am adding a rule. Players may hand their points to one another.'],
    ['kogane', 'A rule has been added. Players may now transfer points to any other player.'],
    ['yuji', 'You are helping us?'],
    ['higuruma', 'I killed a judge and a prosecutor with these hands. When this is over, I will answer for it.'],
    ['yuji', 'Then come with us until it is.'],
    ['higuruma', 'Not yet. But we will meet again, Itadori. Go.']
  ] }
]);
})();
