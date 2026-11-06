/* JUJUTSU UNLIMITEDS — Build 0.32, Season 4: the Shinjuku Showdown, to the very end. The user's: "add s4 and 12 chapter to go with it".
   It goes on from chapter 30 (December 24th), where both domains went up:
     31 Domain Against Domain    Blindfolded Infinity against King of Curses, the two domains locked over them the whole way (domain2.js's clash)
     32 The Wheel                Mahoraga, adapting to the Infinity, and Hollow Purple at two hundred percent
     33 The World-Cutting Slash  the last exchange, won; and the slash that cuts the world. The terminal, afterwards
     34 Mythical Beast Amber     the Thunder God's one go at him; and the true form, the King of Jujutsu, back
     35 The Verdict              the Judge, with the Vessel beside him: Deadly Sentencing, and the Executioner's Sword
     36 The Eldest               the Vessel, with the Blood Brother beside him, to the end of him
     37 Brothers                 the Clapping Brawler, back with one palm and the right instrument: Boogie Woogie, and Black Flash after Black Flash
     38 Heavenly Restriction     the Heavenly Blade, nobody there for him to see
     39 Five Minutes             the Keeper of the Queen, in Blindfolded Infinity's body: Unlimited Void, and one more Hollow Purple
     40 The Vessel's Domain      the Vessel's own: a street at sundown, and his fists cutting at where the King stops and the boy starts
     41 Resonance                the Straw Doll, back, with a nail for his last finger; the last fight, to the end, and the boy coming back out
     42 The Three of Us          what is left of him, going; and the three of them, the morning after (fin: THE END, script.js)
   Everybody in it by the name the game gives them (no character's own name); the dialogue is this game's own */
(() => {
'use strict';

const E = JU.eng, C = JU.cast, X = JU.cast2, K3 = JU.cast3, K5 = JU.cast5, K6 = JU.cast6, S = JU.cast7, Y = E.YUJI, add = JU.chapters.add;
const CHOSO = JU.choso.CHOSO, KING = JU.heian.KING;
const AS_GOJO = { skin: K6.GOJO2, tech: 'alimit', name: ['Blindfolded Infinity', '無限'], hp: 300 };
const AS_KASHIMO = { skin: (JU.beast && JU.beast.SKIN) || K6.KASHIMO, tech: 'beast', name: ['Thunder God', '雷神'], hp: 260 };
const AS_JUDGE = { skin: K5.HIGURUMA, tech: 'judge', name: ['The Judge', '裁判官'], hp: 230 };
const AS_VESSEL = { tech: 'yuji', name: ['The Vessel', '器'], hp: 240 };
const AS_MAKI = { skin: X.MAKI, tech: 'maki', name: ['Heavenly Blade', '天与'], hp: 270 };
const AS_KEEPER = { skin: S.GOJOY, tech: 'alimit', name: ['Keeper of the Queen', '女王の器'], hp: 300 };
const AS_MARK = { tech: 'smark', name: ['The Vessel', '器'], hp: 260 };
const AS_MARK2 = Object.assign({}, AS_MARK, { hp: 300 });                        // the last of it: everybody's blows behind his
const BY_VESSEL = { skin: Y, call: 'DIVERGENT FIST', col: '#ff5a6e', dmg: 10 };
const BY_CHOSO = { skin: CHOSO, call: 'PIERCING BLOOD', col: '#e0203c', dmg: 12 };
const BY_TODO = { skin: X.TODO, call: 'BOOGIE WOOGIE', col: '#7ad7ff', scale: 1.2, act: S.boogie };
const BY_NOBARA = { skin: S.NOBARA, call: 'RESONANCE', col: '#ff5a6e', act: S.nail };
const who = i => JU.chapters.now.cast[i];
const foe = () => JU.chapters.now.foe;
const floored = f => { const o = f && f.skin ? f : E.P2; o.target = E.POSE.down; o.rate = 7; };
const lying = () => floored(foe());

add(31, 'Domain Against Domain', [
  { stage: 'shinjuku', p1: [K6.GOJO2, -280], foe: ['meguna5', 300], card: ['人外魔境新宿決戦', 'THE SHINJUKU SHOWDOWN'], domain: 'blue', by: 'p1', vs: 'red', lines: [
    ['gojo', 'His domain has no walls. It does not have to close round anything: it only has to stand. And mine keeps cracking under it.'],
    ['sukuna', 'Every time yours breaks, you raise it again. How many times can that head of yours burn out and come back?'],
    ['gojo', 'Reverse Cursed Technique on my own brain, every time. Burn it out, heal it, open it again. I can do this all night.'],
    ['sukuna', 'Then do it. I am in no hurry at all.'],
    ['gojo', 'Domain Expansion.']
  ] },
  // the two of them locked together from the first moment, and again every so often: push the seam across, or it pushes you
  { foes: ['meguna5'], stage: 'shinjuku', as: AS_GOJO, label: 'Domain against domain', card: ['領域の押し合い', 'DOMAIN CLASH'], floor: 1,
    start: (p, o) => S.clash(p, o, true), startAt: .3,
    mid: { at: .55, low: .3, ends: true, lines: [
      ['sukuna', 'Five times your barrier has broken, and five times you have put it back up. You are enjoying this.'],
      ['gojo', 'Of course I am. Nobody has ever made me work this hard.'],
      ['sukuna', 'Then let me make it harder. The boy carried a shikigami into this body with him. The strongest of all ten.']
    ] } },
  { stage: 'shinjuku', p1: [K6.GOJO2, -300], cast: [[K3.MAHORAGA, 80, -1, 1.25]], foe: ['meguna5', 420], setup(cast) { cast[0].alpha = 0; }, card: ['魔虚羅', 'THE DIVINE GENERAL'], lines: [
    ['sukuna', 'Ten Shadows. I call on the one no wielder has ever tamed.'],
    ['sukuna', 'Mahoraga.', () => S.arrive(who(0), '#e9e4d2')],
    ['gojo', 'So that is why you wanted his body. I was wondering when you would bring that out.']
  ] }
]);

add(32, 'The Wheel', [
  { stage: 'shinjuku', p1: [K6.GOJO2, -280], cast: [[K6.MEGUNA, 540, -1]], foe: ['maho5', 240], card: ['適応', 'ADAPTATION'], lines: [
    ['gojo', 'Every time that wheel turns, it gets used to whatever hurt it. My Infinity is next on its list.'],
    ['sukuna', 'Let it learn. When it has turned far enough, it will walk straight through your Infinity, and I will walk in behind it.'],
    ['gojo', 'Then I break it before it gets there.']
  ] },
  // the wheel turns as it is hit: everything takes less and less out of it. Finish it before it has you
  { foes: ['maho5'], stage: 'shinjuku', as: AS_GOJO, label: 'The wheel', card: ['八握剣', 'THE EIGHT-HANDLED WHEEL'], floor: 1,
    mid: { at: .35, low: .3, ends: true, lines: [
      ['sukuna', 'Three turns. It has your Infinity now.'],
      ['gojo', '(It got used to the Infinity. It has never been hit by this.)'],
      ['gojo', 'Blue, all the way out. Red, all the way out. And the two of them together, past anything I have ever let go of.']
    ] } },
  { stage: 'shinjuku', p1: [K6.GOJO2, -320], cast: [[K6.MEGUNA, 440, -1]], foe: ['maho5', 150], card: ['虚式「茈」', 'HOLLOW PURPLE: 200%'], lines: [
    ['gojo', 'Hollow Purple. Two hundred percent.', () => S.purple200(E.P1, [foe(), who(0)])],
    ['sukuna', 'The shikigami is gone. And half of the ward with it.', lying],
    ['sukuna', 'But the wheel turned before it went, and it showed me what it had learned. That is all I needed it for.'],
    ['gojo', '(Showed him? Showed him what?)']
  ] }
]);

add(33, 'The World-Cutting Slash', [
  { stage: 'shinjuku', p1: [K6.GOJO2, -280], foe: ['meguna6', 300], card: ['最後の撃ち合い', 'THE LAST EXCHANGE'], lines: [
    ['sukuna', 'Look at us. You are worn to the bone, Blindfolded Infinity, and so am I. One more exchange decides it.'],
    ['gojo', 'Black Flash, and Black Flash again. I have found the rhythm now. Can you say the same?'],
    ['sukuna', 'Come and find out.']
  ] },
  { foes: ['meguna6'], stage: 'shinjuku', as: AS_GOJO, label: 'The last exchange', card: ['黒閃', 'BLACK FLASH'], win: ['勝', 'IT IS OVER'] },
  { stage: 'shinjuku', p1: [K6.GOJO2, -200], foe: ['meguna6', 260], setup: () => lying(), lines: [
    ['gojo', 'That is that. The strongest there has ever been, and I beat him.'],
    ['gojo', 'You were fun, you know. I have not been able to say that to anybody in a very long time.'],
    ['sukuna', 'Blindfolded Infinity. The wheel did not learn your Infinity for itself. It learned it for me. It showed me how to cut what the Infinity holds apart.'],
    ['sukuna', 'Not you. The world you are standing in.', () => S.worldCut(E.P1)],
    ['sukuna', 'You were the strongest of your age. I will remember you, Blindfolded Infinity.']
  ] },
  { stage: 'airport', p1: [K6.GOJO2, -300], cast: [[K3.GETO, 40, -1], [X.NANAMI, 290, -1]], card: ['空港', 'THE TERMINAL'], lines: [
    ['geto', 'You took your time.'],
    ['gojo', 'Curse Eater. And Ratio Blade. ...So this is where everybody went. An airport. Of course it is.'],
    ['nanami', 'North or south, they say. I have been sitting here for a while, trying to decide.'],
    ['gojo', 'Did I look cool, at least? At the end?'],
    ['geto', 'You did everything you set out to do, and you enjoyed every second of it. That was always your problem.'],
    ['gojo', '...The kids will finish it. They are stronger than they think. Let them find that out for themselves.']
  ] }
]);

add(34, 'Mythical Beast Amber', [
  { stage: 'shinjuku', p1: [AS_KASHIMO.skin, -260], foe: ['meguna7', 300], card: ['雷神', 'THE THUNDER GOD'], lines: [
    ['kashimo', 'Blindfolded Infinity has fallen. Then it is my turn. Four hundred years I have waited for you, King of Curses.'],
    ['sukuna', 'The Thunder God. You have one trick worth seeing, and you can only show it once. Go on, then.'],
    ['kashimo', 'Once is all I came for. Mythical Beast Amber.', () => S.amber(E.P1)]
  ] },
  // everything at once, and his body burning itself up to hold it: there is no coming back from this one
  { foes: ['meguna7'], stage: 'shinjuku', as: AS_KASHIMO, label: 'Once', card: ['幻獣琥珀', 'MYTHICAL BEAST AMBER'], floor: 1,
    mid: { at: .55, low: .35, ends: true, lines: [
      ['sukuna', 'Your body is burning itself up to keep that form. It is a fine thing to watch, Thunder God. And it is over.'],
      ['kashimo', '...Was I enough? Did I give you a fight?'],
      ['sukuna', 'You did. Now rest.']
    ] } },
  { stage: 'shinjuku', p1: [K5.HIGURUMA, -460], cast: [[Y, -680, 1]], foe: ['meguna7', 260], card: ['真の姿', 'THE TRUE FORM'], lines: [
    ['sukuna', 'The boy\'s body has done everything I asked of it. It is time I wore my own again.', () => S.trueForm(foe())],
    ['sukuna', 'A thousand years ago, they called this the King of Jujutsu. Who is next?'],
    ['higuruma', 'We are.'],
    ['yuji', 'King of Curses. Give Shadow back.']
  ] }
]);

add(35, 'The Verdict', [
  { stage: 'shinjuku', p1: [K5.HIGURUMA, -260], cast: [[Y, -490, 1]], foe: ['king_judge', 320], card: ['裁判官', 'THE JUDGE'], lines: [
    ['higuruma', 'Vessel. Keep him off me long enough, and I will put him on trial.'],
    ['yuji', 'Go! I have got your back!'],
    ['sukuna', 'A lawyer. I have not been judged by anyone in a thousand years.']
  ] },
  { foes: ['king_judge'], stage: 'shinjuku', as: AS_JUDGE, ally: BY_VESSEL, label: 'The court sits', card: ['誅伏賜死', 'DEADLY SENTENCING'], floor: 1,
    mid: { at: .7, low: .35, ends: true, domain: 'gold', by: 'p1', lines: [
      ['higuruma', 'That is long enough. Thank you, Vessel.'],
      ['higuruma', 'Domain Expansion. Deadly Sentencing.']
    ] } },
  { stage: 'court', p1: [K5.HIGURUMA, -260], foe: ['king_judge', 300], card: ['判決', 'THE VERDICT'], lines: [
    ['higuruma', 'The accused is King of Curses. The Arbiter will read the charge.'],
    ['judgeman', 'The accused is suspected of the deaths in Shibuya, the deaths in Shinjuku, and more than this court has the time to name.'],
    ['sukuna', 'Every one of them. Read the rest.'],
    ['judgeman', 'Guilty. Confiscation. Death penalty.'],
    ['higuruma', 'The Executioner\'s Sword. One touch of it, and you are finished.']
  ] },
  { stage: 'shinjuku', p1: [K5.HIGURUMA, -240], cast: [[Y, -520, 1]], foe: ['king_judge', 260], lines: [
    ['sukuna', 'A blade that kills whatever it touches. Then I make sure it touches nothing.'],
    ['higuruma', '(He saw it coming before I swung. He sees all of it...)'],
    ['sukuna', 'Too slow, Judge. Dismantle.', () => { floored(E.P1); JU.vfx.sparks(E.P1.x, 160, 'red', 26); }],
    ['higuruma', 'Vessel... the sword. Take it. You never deserved any of this...'],
    ['yuji', 'JUDGE!']
  ] }
]);

add(36, 'The Eldest', [
  { stage: 'shinjuku', p1: [Y, -260], cast: [[CHOSO, -480, 1]], foe: ['king_blood', 320], card: ['長兄', 'THE ELDEST'], lines: [
    ['yuji', 'The sword is gone. It went out the moment he did.'],
    ['choso', 'Little brother. Stay behind me.'],
    ['yuji', 'Blood Brother! You are hurt worse than I am.'],
    ['choso', 'That is what an older brother is for. There are eight of us I could not protect. I am not losing a ninth.'],
    ['sukuna', 'The Death Painting. Your blood will boil away before it reaches me.']
  ] },
  { foes: ['king_blood'], stage: 'shinjuku', as: AS_VESSEL, ally: BY_CHOSO, label: 'Together', card: ['赤血操術', 'BLOOD MANIPULATION'], floor: 1,
    mid: { at: .6, low: .3, ends: true, lines: [
      ['sukuna', 'Enough. Dismantle.'],
      ['choso', 'VESSEL! DOWN!'],
      ['yuji', 'BLOOD BROTHER!']
    ] } },
  { stage: 'shinjuku', p1: [Y, -220], cast: [[KING, 560, -1, 1.12]], foe: ['choso', 40], setup: (cast, f) => floored(f), lines: [      // (him as the one lying there, so that nothing stands him back up)
    ['choso', 'You are all right. Good. That is all I wanted.'],
    ['choso', 'Mother. Brothers. I am coming. ...I was an older brother to the end.'],
    ['yuji', '...You were. I will not waste it. I swear.']
  ] }
]);

add(37, 'Brothers', [
  { stage: 'shinjuku', p1: [Y, -260], cast: [[X.TODO, -520, 1, 1.2]], foe: ['king_todo', 320], setup(cast) { cast[0].alpha = 0; }, card: ['拍手', 'THE CLAP'], lines: [
    ['sukuna', 'Alone again, brat. Everyone who stands next to you dies. Have you noticed?'],
    ['todo', 'BROTHER!', () => S.arrive(who(0))],
    ['yuji', 'Clapping Brawler! Your hand...'],
    ['todo', 'I lost a hand, not the rhythm. One palm and the right instrument, and Boogie Woogie still sings.'],
    ['todo', 'Do not think, Brother. Listen for the clap, and hit whatever is in front of you.']
  ] },
  // every so often, a clap: the two of you are where the other one was, and he takes a moment to work it out
  { foes: ['king_todo'], stage: 'shinjuku', as: AS_VESSEL, ally: BY_TODO, label: 'Brothers', card: ['不義遊戯', 'BOOGIE WOOGIE'], floor: 1,
    mid: { at: .55, low: .3, ends: true, lines: [
      ['todo', 'Do you feel it, Brother? The sparks are coming closer together.'],
      ['yuji', 'Black Flash. And again. And again. I know exactly where the next one is.'],
      ['sukuna', 'Four in a row... What are you?'],
      ['yuji', 'Your vessel. And I am taking my friend back out of you.']
    ] } }
]);

add(38, 'Heavenly Restriction', [
  { stage: 'shinjuku', p1: [X.MAKI, -260], cast: [[Y, -490, 1]], foe: ['king_maki', 320], card: ['天与', 'HEAVENLY BLADE'], lines: [
    ['maki', 'Vessel. Get your breath back. I will take him for a while.'],
    ['sukuna', 'The one with no cursed energy. The Sorcerer Killer was the same. I remember his kind.'],
    ['maki', 'Then you know how this goes.']
  ] },
  { foes: ['king_maki'], stage: 'shinjuku', as: AS_MAKI, label: 'Nobody there', card: ['天与呪縛', 'HEAVENLY RESTRICTION'], floor: 1,
    mid: { at: .55, low: .3, ends: true, lines: [
      ['sukuna', 'You cut me. A tool, in hands the world does not even see.'],
      ['maki', 'And I will keep cutting until somebody better gets here.'],
      ['sukuna', 'Somebody already has. Look who it is.']
    ] } }
]);

add(39, 'Five Minutes', [
  { stage: 'shinjuku', p1: [S.GOJOY, -240], cast: [[Y, -440, 1], [X.MAKI, -600, 1]], foe: ['king_void', 320], card: ['五分間', 'FIVE MINUTES'], lines: [
    ['yuji', 'Sensei...? No. The stitches. Who is...'],
    ['yuta', 'It is me, Vessel. The Stitched One\'s technique, on his body. He would have hated it, and then told me to do it anyway.'],
    ['sukuna', 'Keeper of the Queen, wearing Blindfolded Infinity like a coat. How long do you have?'],
    ['yuta', 'Five minutes. That is long enough.']
  ] },
  { foes: ['king_void'], stage: 'shinjuku', as: AS_KEEPER, label: 'Borrowed', card: ['無量空処', 'UNLIMITED VOID'], floor: 1,
    mid: { at: .5, low: .3, ends: true, lines: [
      ['yuta', 'His eyes see everything at once. I do not know how he lived with it.'],
      ['sukuna', 'Your five minutes are nearly gone, Keeper.'],
      ['yuta', 'Then I spend the last of them on one more. Hollow Purple.', () => S.purple200(E.P1, [E.P2])]
    ] } },
  { stage: 'shinjuku', p1: [S.GOJOY, -220], cast: [[Y, -520, 1]], foe: ['king_void', 280], lines: [
    ['yuta', 'That is all of it. Vessel... the rest is yours.', () => floored(E.P1)],
    ['yuji', 'I have got it, Keeper. Rest.']
  ] }
]);

add(40, 'The Vessel\'s Domain', [
  { stage: 'shinjuku', p1: [Y, -260], foe: ['king_dusk', 300], card: ['器', 'THE VESSEL'], domain: 'gold', by: 'p1', lines: [
    ['sukuna', 'Every one of them has fallen, and you are still standing. Why do you keep getting up, brat?'],
    ['yuji', 'Because I am a cog. A cog does its part, and mine is not finished yet.'],
    ['yuji', 'Domain Expansion.']
  ] },
  { stage: 'dusk', p1: [Y, -260], foe: ['king_dusk', 300], card: ['領域展開', 'DOMAIN EXPANSION'], lines: [
    ['sukuna', 'What is this? No walls. No sure hit. A street at sundown... a railway crossing. Your town.'],
    ['yuji', 'It is not here to kill you. It is here so you can see what I see.'],
    ['yuji', 'Shadow is still in there somewhere. I am going to keep hitting you until I find him.']
  ] },
  { foes: ['king_dusk'], stage: 'dusk', as: AS_MARK, label: 'Soul to soul', card: ['魂の境界', 'THE EDGE OF THE SOUL'], floor: 1,
    mid: { at: .5, low: .3, ends: true, lines: [
      ['yuji', 'I can feel the edge of you now. Where you stop, and where he starts.'],
      ['sukuna', 'You are cutting at my soul... You learned that from Soul Shaper, of all of them.'],
      ['yuji', 'I learned it from everybody.']
    ] } }
]);

add(41, 'Resonance', [
  { stage: 'shinjuku', p1: [Y, -260], cast: [[S.NOBARA, -510, 1]], foe: ['king_last', 300], setup(cast) { cast[0].alpha = 0; }, card: ['共鳴り', 'RESONANCE'], lines: [
    ['sukuna', 'Is that all? Your domain is gone, brat, and you can barely stand.'],
    ['nobara', 'Did you all forget about me? That is rude.', () => S.arrive(who(0), '#ff8a5a')],
    ['yuji', 'Straw Doll! You are... you are alive!'],
    ['nobara', 'I kept my head down and my hammer close. And I have had a nail ready for this for a long time.'],
    ['nobara', 'Your last finger, King of Curses. The one you never got round to. Resonance.', () => S.resonance(foe())],
    ['sukuna', 'Through my own finger... into my soul...!']
  ] },
  // the last of it, to the end: every so often she drives in another nail
  { foes: ['king_last'], stage: 'shinjuku', as: AS_MARK2, ally: BY_NOBARA, label: 'The last of it', card: ['黒閃', 'BLACK FLASH'], win: ['祓', 'EXORCISED'],
    mid: { at: .5, lines: [
      ['sukuna', 'I am the King of Curses! I will not be put down by a cog and a doll!'],
      ['yuji', 'Shadow! I am right here! Grab hold!']
    ] } },
  { stage: 'shinjuku', p1: [Y, -240], cast: [[C.MEGUMI, 80, -1]], foe: ['king_last', 300], setup(cast) { cast[0].alpha = 0; lying(); }, lines: [
    ['sukuna', 'The boy... is slipping out of my hands...', () => S.separate(foe(), who(0))],
    ['yuji', 'Shadow!'],
    ['megumi', '...Vessel. You came all this way for me.'],
    ['yuji', 'I told you I would. Whatever it took.']
  ] }
]);

add(42, 'The Three of Us', [
  { stage: 'dusk', p1: [Y, -240], cast: [[KING, 240, -1, .92]], card: ['呪いの王', 'KING OF CURSES'], lines: [
    ['yuji', 'There is not much of you left.'],
    ['sukuna', 'Come to gloat, brat?'],
    ['yuji', 'No. You could come back. Live in me again. I would not let you hurt anybody, but you would not have to be alone.'],
    ['sukuna', 'Pity. From you, of all people. ...No. I lived the way I chose, and I will end the same way.'],
    ['sukuna', 'If there is a next time... perhaps I will try it differently.', () => S.ashes(who(0))],
    ['yuji', '...Goodbye, King of Curses.']
  ] },
  { stage: 'school', p1: [Y, -240], cast: [[C.MEGUMI, 30, -1], [S.NOBARA, 280, -1]], card: ['その後', 'AFTERWARDS'], lines: [
    ['nobara', 'So. Where is this mission, then? I have spent long enough lying around.'],
    ['megumi', 'A curse in a tunnel outside the city. Grade two. Nothing special.'],
    ['yuji', 'Nothing special sounds good to me.'],
    ['yuji', 'Let us go. The three of us.']
  ] }
], { fin: true });
})();
