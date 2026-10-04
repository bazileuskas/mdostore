/* JUJUTSU UNLIMITEDS — update 0.2, the road to Shinjuku: chapter 22 (The Receipt), 23 (Sendai), 24 (Jackpot), 25 (Sakurajima), 26 (Star Rage),
   27 (Enchain), 28 (The Perfect Sphere), 29 (Unsealed) and 30 (December 24th), which ends as the Shinjuku Showdown begins */
(() => {
'use strict';

const E = JU.eng, g = E.g, F = E.F, C = JU.cast, X = JU.cast2, K3 = JU.cast3, K4 = JU.cast4, K5 = JU.cast5, K = JU.cast6, V = JU.vfx, sfx = JU.sfx, Y = E.YUJI, add = JU.chapters.add;
const { orb, beam } = JU.tech.tk, CHOSO = JU.choso.CHOSO;
const AS_MEGUMI = { skin: C.MEGUMI, tech: 'ten', name: ['Megumi Fushiguro', '伏黒恵'], hp: 130 };
const AS_YUTA = { skin: K4.YUTA, tech: 'yuta', name: ['Yuta Okkotsu', '乙骨憂太'], hp: 170 };
const AS_HAKARI = { skin: K5.HAKARI, tech: 'hakari', name: ['Kinji Hakari', '秤金次'], hp: 160 };
const AS_MAKI = { skin: X.MAKI, tech: 'maki', name: ['Maki Zenin', '禪院真希'], hp: 200 };
const AS_MAKI2 = Object.assign({}, AS_MAKI, { hp: 260 });                      // once she has seen what the air is doing
const AS_CHOSO = { skin: CHOSO, tech: 'blood', name: ['Choso', '脹相'], hp: 150 };
const AS_YUKI = { skin: K4.YUKI, tech: 'yuki', name: ['Yuki Tsukumo', '九十九由基'], hp: 220 };
const AS_SUKUNA = { skin: K.MEGUNA, tech: 'ten', name: ['Ryomen Sukuna', '両面宿儺'], hp: 220 };   // he fights this one with the boy's technique, not his own
const AS_GOJO = { skin: K.GOJO2, tech: 'limitless', name: ['Satoru Gojo', '五条悟'], hp: 200 };
const AS_GOJO_MAX = { skin: K.GOJO2, tech: 'alimit', name: ['Satoru Gojo', '五条悟'], hp: 300 };  // and for Shinjuku, nothing held back
const who = i => JU.chapters.now.cast[i];
const floored = () => { const o = E.P2; o.target = E.POSE.down; o.rate = 7; };
const said = (p, text, col) => E.fx.push({ k: 2, x: p.x, y: p.y + 390, n: text, col, t: 0, life: 1.6 });

// Rika, all of her: whatever he had lost is back
function rika(p) {
  p.hp = p.max; sfx.bf(); E.cam.shake = 24;
  V.ring(p.x, p.y + 160, 420, '#d9c9ff', .6); V.sparks(p.x, p.y + 180, 'purple', 26); said(p, 'RIKA  ·  FULLY MANIFESTED', '#d9c9ff');
}
// everything a star weighs, let go of at once
function hole() {
  const p = E.P1;
  sfx.bf(); sfx.blast(); E.cam.shake = 40;
  V.custom(2.4, u => { orb(p.x, 200, 30 + 300 * u, 'purple', '#000'); p.alpha = Math.max(0, 1 - u * 1.4); });
  V.ring(p.x, 200, 700, '#b79bff', 1.2); V.crack(p.x, 520);
}
// one word, and the boy he was waiting in is not the boy he is in
function take() {
  const m = who(0), p = E.P1;
  sfx.bf(); E.cam.shake = 30; p.flash = .4;
  V.impact(.3, m.x, 190); V.ring(m.x, 180, 320, '#ff2440', .5); V.sparks(m.x, 190, 'red', 26);
  m.skin = K.MEGUNA;
}
// Jacob's Ladder: a column of light, and what the box was holding steps out of it
function ladder() {
  const f = who(1);
  sfx.charge(); sfx.blast(); E.cam.shake = 22;
  V.custom(1.8, u => {
    const c = F(f.x, 0), k = c[2], w = 170 * k * Math.sin(u * Math.PI);
    g.globalCompositeOperation = 'lighter'; E.glow(E.GLOW.white, c[0], c[1] - 300 * k, 900 * k * Math.sin(u * Math.PI), .8);
    g.fillStyle = `rgba(255,244,200,${.8 * Math.sin(u * Math.PI)})`; g.fillRect(c[0] - w / 2, c[1] - 1400 * k, w, 1400 * k); g.globalCompositeOperation = 'source-over';
  });
  V.custom(1.1, u => { f.alpha = Math.min(1, u * 1.5); }, .6);
  V.ring(f.x, 170, 380, '#ffe9a0', .8);
}
// the first thing he did was fire on him from the other side of the ward
function purple() {
  const o = E.P2;
  sfx.bf(); sfx.blast(); E.cam.shake = 44; V.impact(.4, o.x, 180);
  V.custom(.5, u => { beam(-1500, o.x, 190, 110, 'purple', .8 * (1 - u)); orb(o.x, 190, 150 * (1 - u * .5), 'purple', '#14042a'); });
  V.crack(o.x, 520); V.rocks(o.x, 0, 24); E.addBlast(o.x, 190, '157,123,255', 700);
}

add(22, 'The Receipt', [
  { stage: 'street', p1: [C.MEGUMI, -240], foe: ['reggie', 300], card: ['東京第1結界', 'TOKYO NO. 1 COLONY'], lines: [
    ['megumi', 'The girl who offered to guide me was yours. She walks new players straight to you.'],
    ['reggie', 'Do not think badly of her. People do whatever gets them to tomorrow. I am Reggie, and you are worth five points to me.'],
    ['megumi', 'You are carrying more than forty. I will take those and keep looking for the rest.'],
    ['reggie', 'Every receipt on this coat is a contract. Whatever it says I paid for, I can have again. Let me show you what I have bought.']
  ] },
  { foes: ['reggie'], stage: 'street', as: AS_MEGUMI, label: 'The colony', card: ['再契象', 'CONTRACT RE-CREATION'],
    mid: { at: .5, low: .3, ends: true, lines: [
      ['reggie', 'A shikigami user. Your kind always runs dry in the end. I only have to keep my receipts.'],
      ['megumi', '(He wants this out in the open, where anything can fall on me. Then I pick the room.)'],
      ['megumi', 'Follow me if you want your five points.']
    ] } },
  { stage: 'gym', p1: [C.MEGUMI, -240], foe: ['reggie2', 300], card: ['体育館', 'THE GYM'], lines: [
    ['reggie', 'You ran all this way for a ceiling? I have receipts for things that do not need to fall on you.'],
    ['megumi', 'I did not come in here for the ceiling.'],
    ['megumi', 'I came for the floor.']
  ] },
  { foes: ['reggie2'], stage: 'gym', as: AS_MEGUMI, label: 'The gym', card: ['嵌合暗翳庭', 'CHIMERA SHADOW GARDEN'], domain: 'purple' },
  { stage: 'gym', p1: [C.MEGUMI, -200], foe: ['reggie2', 230], lines: [
    ['reggie', 'A domain with no walls to it. The whole floor was your shadow, and I was standing in it from the moment I walked in...', floored],
    ['megumi', 'It is not finished. It did not have to be.'],
    ['reggie', 'Take the points. Forty-one. Spend them on somebody worth it, and do not die of anything stupid.'],
    ['kogane', 'Forty-one points have been transferred.'],
    ['megumi', '(Tsumiki. A little longer. I am nearly there.)']
  ] }
]);

add(23, 'Sendai', [
  { stage: 'ruins', p1: [K4.YUTA, -240], foe: ['uro', 300], card: ['仙台結界', 'SENDAI COLONY'], lines: [
    ['yuta', 'Four players held this colony between them, and nobody else dared move. Now there are three.'],
    ['uro', 'Because of you. One afternoon, and you broke a balance I had been waiting on for weeks.'],
    ['yuta', 'I am sorry about your balance. I need points, and the three of you are holding most of them.'],
    ['uro', 'Then come and take the sky off me, boy.']
  ] },
  // two of the three, one after the other. Half-way through the second, Rika comes all the way out
  { foes: ['uro', 'ishigori'], stage: 'ruins', as: AS_YUTA, label: 'Sendai', card: ['四つ巴', 'THE STANDOFF'], win: ['決着', 'SETTLED'],
    mid: { foe: 'ishigori', at: .5, lines: [
      ['ishigori', 'There it is! Four hundred years I have been hungry for exactly this. Do not hold a thing back from me!'],
      ['yuta', 'I will not. Rika. All of it. Come.']
    ], after: rika } },
  { stage: 'ruins', p1: [K4.YUTA, -200], foe: ['ishigori', 230], lines: [
    ['ishigori', 'Full. For the first time since I came back, I am full...', floored],
    ['yuta', 'Your points, please. And then stay out of everybody\'s way.'],
    ['kogane', 'Points have been transferred.'],
    ['yuta', '(That is enough for a rule. Itadori, Fushiguro: hold on. I am coming back.)']
  ] }
]);

add(24, 'Jackpot', [
  { stage: 'docks', p1: [K5.HAKARI, -240], cast: [[K5.PANDA, -540, 1, .5]], foe: ['kashimo', 300], card: ['東京第2結界', 'TOKYO NO. 2 COLONY'], lines: [
    ['hakari', 'Panda. ...He did that to you?'],
    ['panda', 'Sorry, Kin. He asked me where Sukuna was, and I did not have an answer he liked.'],
    ['kashimo', 'Four hundred years ago I ran out of people worth fighting. I came back for one man, and you are not him. Are you at least strong?'],
    ['hakari', 'Depends on my luck. Stick around and see what happens when the machine pays out.']
  ] },
  { foes: ['kashimo'], stage: 'docks', as: AS_HAKARI, label: 'Tokyo No. 2', card: ['坐殺博徒', 'IDLE DEATH GAMBLE'], win: ['大当り', 'JACKPOT'] },
  { stage: 'docks', p1: [K5.HAKARI, -200], foe: ['kashimo', 230], lines: [
    ['kashimo', 'You kept getting back up. Every time I was sure of it...', floored],
    ['hakari', 'Luck is a skill. Now, a deal. You want Sukuna? Work with us, and I will put you in front of him myself.'],
    ['kashimo', '...For that, I will wait. Not for long.']
  ] }
]);

add(25, 'Sakurajima', [
  { stage: 'mountain', p1: [X.MAKI, -240], foe: ['naoya2', 300], card: ['桜島結界', 'SAKURAJIMA COLONY'], lines: [
    ['naoya', 'Found you. Do you know what it is, to be killed by a servant and come back as the thing you looked down on?'],
    ['maki', 'Naoya. You turned yourself into a curse to see me again. I would be flattered if it were not so sad.'],
    ['naoya', 'I am faster than I ever was alive. Faster than sound. You will not even see it coming.']
  ] },
  // she cannot keep up with him yet
  { foes: ['naoya2'], stage: 'mountain', as: AS_MAKI, label: 'Sakurajima', card: ['呪霊', 'THE CURSED SPIRIT'], floor: 1,
    mid: { at: .55, low: .3, ends: true, domain: 'purple', lines: [
      ['maki', '(He is not that fast. I am watching him and nothing else. The air moves first. The heat. All of it is telling me where he will be.)'],
      ['naoya', 'Still on your feet? Then I stop playing. Domain Expansion.']
    ] } },
  { stage: 'mountain', p1: [X.MAKI, -240], foe: ['naoya3', 300], card: ['時胞月宮殿', 'TIME CELL MOON PALACE'], lines: [
    ['naoya', 'In here every cell of you is pinned to my frames. It cannot miss. It never has.'],
    ['maki', 'It can if it cannot find me. I have no cursed energy at all. To your barrier I am a rock. A tree. There is nobody in here for it to hit.'],
    ['naoya', 'What?! That is not... You are standing right there!']
  ] },
  { foes: ['naoya3'], stage: 'mountain', as: AS_MAKI2, label: 'Nobody there', card: ['禪院真希', 'MAKI ZENIN'], win: ['斬', 'FOR GOOD THIS TIME'] },
  { stage: 'mountain', p1: [X.MAKI, -200], lines: [
    ['maki', 'That is twice. Do not make it a third time.'],
    ['maki', 'A hundred points here for whoever needs them. Time to find the others.']
  ] }
]);

add(26, 'Star Rage', [
  { stage: 'tomb', p1: [CHOSO, -240], cast: [[K4.YUKI, -540, 1]], foe: ['kenjaku', 300], card: ['薨星宮', 'THE TOMBS OF THE STAR CORRIDOR'], lines: [
    ['kenjaku2', 'Master Tengen. I have come to collect you.'],
    ['choso', 'You will not reach him. You made nine of us and threw us away. I am the eldest, and I remember.'],
    ['kenjaku2', 'Choso. One of the ones that did not work. What do you imagine you can do?'],
    ['choso', 'Buy time for my little brother. That is what an older brother is for.']
  ] },
  { foes: ['kenjaku'], stage: 'tomb', as: AS_CHOSO, label: 'The eldest', card: ['赤血操術', 'BLOOD MANIPULATION'], floor: 1,
    mid: { at: .75, low: .3, ends: true, lines: [
      ['kenjaku2', 'Better than I expected. I take it back: you were not a failure. Only dull.'],
      ['yuki', 'That will do, Choso. You have made him show me everything he has. Step back.'],
      ['choso', '...Do not die.']
    ] } },
  { stage: 'tomb', p1: [K4.YUKI, -240], cast: [[CHOSO, -580, 1]], foe: ['kenjaku', 300], card: ['九十九由基', 'YUKI TSUKUMO'], lines: [
    ['kenjaku2', 'Yuki Tsukumo. The special grade who never did a day of work in her life.'],
    ['yuki', 'I am working now. My technique is weight. Shall I show you how heavy one fist can get?']
  ] },
  { foes: ['kenjaku'], stage: 'tomb', as: AS_YUKI, label: 'Star Rage', card: ['星の怒り', 'STAR RAGE'], floor: 1,
    mid: { at: .45, low: .25, ends: true, lines: [
      ['kenjaku2', 'Gravity is mine as well, you see. You have been broken inside for some time now.'],
      ['yuki', 'Then I stop holding my own weight back. All of it. Everything a star weighs.', hole],
      ['kenjaku2', '...A black hole. She meant to take the whole tomb with her.'],
      ['kenjaku2', 'A pity. Tengen is mine now, and the merger begins whenever I say.']
    ] } }
]);

add(27, 'Enchain', [
  { stage: 'street', p1: [Y, -300], cast: [[C.MEGUMI, 0, -1], [K.HANA, 280, -1]], card: ['天使', 'THE ANGEL'], lines: [
    ['hana', 'I am Hana Kurusu, and the Angel lives in me. My technique puts out other techniques. The seal on Satoru Gojo is one of them.'],
    ['megumi', 'Then Gojo comes back. And with the new rule, Tsumiki can walk out of the game.'],
    ['yuji', 'We did it. We actually did it...'],
    ['megumi', '...Tsumiki? No. That is not my sister. Somebody else has been wearing her from the start.'],
    ['sukuna', 'A promise the brat made me long ago: one minute of his body, on one word. Enchain.', take],
    ['sukuna', 'A finger of mine, fed to him by my own hand. This one has what I wanted from the beginning. The Ten Shadows.'],
    ['yuji', 'Fushiguro! Get out of him! SUKUNA!']
  ] },
  // there is no winning this one. There is only not stopping
  { foes: ['meguna'], stage: 'street', label: 'Enchain', card: ['契闊', 'ENCHAIN'], floor: 1,
    mid: { at: .8, low: .35, ends: true, lines: [
      ['sukuna', 'You always were slow, brat. Did you think I stayed inside you because I had no choice?'],
      ['yuji', 'Give him back!'],
      ['sukuna', 'The boy is still struggling in here. I am going to go and drown him properly. Try to stay alive until I am bored.']
    ] } },
  { stage: 'street', p1: [Y, -200], lines: [
    ['yuji', 'Fushiguro...'],
    ['yuji', 'I will get you back. Whatever it takes. I swear it.']
  ] }
]);

add(28, 'The Perfect Sphere', [
  { stage: 'ruins', p1: [K.MEGUNA, -240], foe: ['yorozu', 300], card: ['仙台結界', 'SENDAI COLONY'], lines: [
    ['yorozu', 'Sukuna! A thousand years, and look at you. If I win, you marry me!'],
    ['sukuna', 'Yorozu. So you were the one who woke in his sister. Good. If she dies by these hands, the boy goes to the bottom and stays there.'],
    ['yorozu', 'Still talking about somebody else. I am going to teach you what love is, with the most perfect thing I ever made.'],
    ['sukuna', 'I will not be using my own technique. Only his. Call it trying the body on.']
  ] },
  { foes: ['yorozu'], stage: 'ruins', as: AS_SUKUNA, label: 'The bath', card: ['十種影法術', 'TEN SHADOWS'], win: ['浴', 'THE BATH'] },
  { stage: 'ruins', p1: [K.MEGUNA, -200], foe: ['yorozu', 230], lines: [
    ['yorozu', 'So that is how it ends. Then take this. The last thing I will ever build. Use it well, my love.', floored],
    ['sukuna', 'A blade. ...You were always a nuisance.'],
    ['sukuna', 'The boy has gone quiet. That leaves Satoru Gojo.']
  ] }
]);

add(29, 'Unsealed', [
  { stage: 'street', p1: [Y, -300], cast: [[K.HANA, -20, -1], [K.GOJO2, 300, -1]], setup(cast) { cast[1].alpha = 0; }, card: ['獄門疆・裏', 'THE BACK GATE'], lines: [
    ['hana', 'I am healed enough. Put the box down and stand back. The Angel will burn the seal away.'],
    ['yuji', 'Nineteen days. Please. Bring him back.'],
    ['hana', 'Jacob\'s Ladder.', ladder],
    ['gojo', 'Yo. ...I have been gone a while, have I not? Somebody tell me what I missed.'],
    ['yuji', 'Gojo-sensei! Megumi... Sukuna has Megumi.'],
    ['gojo', 'I know. I felt it from inside. Leave him to me.']
  ] },
  { stage: 'tomb', p1: [K.GOJO2, -240], cast: [[K3.KENJAKU, 600, -1]], foe: ['meguna', 280], card: ['対面', 'FACE TO FACE'], lines: [
    ['kenjaku2', 'Out already? I had hoped for a thousand years of quiet.'],
    ['gojo', 'That is Suguru\'s body, and I am taking it back from you. But you are second. He is first.'],
    ['sukuna', 'Satoru Gojo. You still think you are swimming. You are already on the board.'],
    ['gojo', 'The twenty-fourth of December. Shinjuku. The two of us and nobody else.'],
    ['sukuna', 'A month to say your goodbyes. Agreed.'],
    ['kenjaku2', 'Before we go: a parting gift. Let us see whether the box dulled you.']
  ] },
  { foes: ['ruin', 'ruin', 'finger'], stage: 'tomb', as: AS_GOJO, label: 'A parting gift', card: ['最強', 'THE STRONGEST'], win: ['最強', 'STILL THE STRONGEST'] },
  { stage: 'school', p1: [K.GOJO2, -200], cast: [[Y, -480, 1]], lines: [
    ['gojo', 'One month. Everybody trains, everybody gets stronger. And on the twenty-fourth, I take Megumi back.'],
    ['yuji', 'We will be ready, sensei.']
  ] }
]);

add(30, 'December 24th', [
  { stage: 'school', p1: [K.GOJO2, -200], cast: [[Y, -480, 1], [K4.YUTA, -720, 1]], card: ['十二月二十四日', 'DECEMBER 24TH'], lines: [
    ['yuji', 'Sensei. If you lose...'],
    ['gojo', 'Then the rest of you finish it. That is what I taught you for. But Yuji: I am going to win.'],
    ['yuta', 'We will be watching, all of us. If anything happens, we go in.'],
    ['gojo', 'Not until it is over. Nobody steps into this one but me. ...It has been a long time since I was allowed to go all out.']
  ] },
  { stage: 'shinjuku', p1: [K.GOJO2, -280], foe: ['meguna2', 300], card: ['新宿', 'SHINJUKU'], lines: [
    ['sukuna', 'You came alone.'],
    ['gojo', 'I opened with a Hollow Purple from the other side of the ward, and you are still on your feet. Good. I would have been disappointed.', purple],
    ['sukuna', 'The strongest of this age, against the strongest there has ever been. Show me, then.'],
    ['gojo', 'That second one is only a title. Tonight you have to take it from me.']
  ] },
  // the opening of it. It stops where the two domains go up
  { foes: ['meguna2'], stage: 'shinjuku', as: AS_GOJO_MAX, label: 'The showdown', card: ['人外魔境新宿決戦', 'THE SHINJUKU SHOWDOWN'], floor: 1,
    mid: { at: .5, low: .3, ends: true, domain: 'red', lines: [
      ['sukuna', 'Domain against domain, then. Let us see whose breaks first.'],
      ['gojo', 'Domain Expansion.']
    ] } },
  { stage: 'shinjuku', p1: [K.GOJO2, -280], foe: ['meguna2', 300], card: ['領域展開', 'DOMAIN EXPANSION'], lines: [
    ['gojo', 'Unlimited Void.'],
    ['sukuna', 'Malevolent Shrine.']
  ] }
]);
})();
