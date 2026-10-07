/* JUJUTSU UNLIMITEDS — chapter 6 (The Goodwill Event) and chapter 7 (The Death Paintings) */
(() => {
'use strict';

const E = JU.eng, C = JU.cast, X = JU.cast2, D = JU.sets, V = JU.vfx, sfx = JU.sfx, Y = E.YUJI, add = JU.chapters.add;
const TODO = { skin: X.TODO, call: 'BOOGIE WOOGIE', col: '#7ad7ff', dmg: 10, scale: 1.2 };
const NOBARA = { skin: D.NOBARA, call: 'HAIRPIN', col: '#ff9a4d', dmg: 10 };

add(6, 'The Goodwill Event', [
  { stage: 'shrine', p1: [Y, -60], cast: [[C.MEGUMI, 230, -1], [D.NOBARA, 350, -1], [C.GOJO, -330, 1, 1.1]], card: ['交流会', 'THE GOODWILL EVENT'], cx: 60, lines: [
    ['gojo', 'Surprise! One dead first-year, alive and delivered. Ta-da!'],
    ['yuji', 'Uh. Hey, guys. So. I lived.'],
    ['nobara', '...You have something to say to us first.'],
    ['yuji', 'Sorry I did not tell you I was alive.'],
    ['megumi', '...Idiot.'],
    ['gojo', 'Touching. Now go and beat Kyoto for me.']
  ] },
  { stage: 'mountain', p1: [Y, -240], foe: ['todo', 260], card: ['拍手', 'CLAPPING BRAWLER'], lines: [
    ['todo', 'First-year. One question before we start. What kind of woman is your type?'],
    ['yuji', 'Huh? Uh... tall, I guess. With a nice...'],
    ['todo', '...! Just now, memories I never lived came flooding in. We were in the same class. You were my best friend.'],
    ['yuji', 'We met ten seconds ago!'],
    ['todo', 'Then come at me with everything you have, BROTHER!']
  ] },
  { foes: ['todo'], stage: 'mountain', label: 'Goodwill event', card: ['拍手', 'CLAPPING BRAWLER'], win: ['友', 'MY BEST FRIEND'],
    mid: { at: .5, lines: [
      ['todo', 'Stop! Your body moves and your cursed energy follows a beat behind. Do not send it to your fist. Be it, all at once.'],
      ['yuji', 'All at once...'],
      ['todo', 'Yes! Again, brother!']
    ] } },
  { stage: 'mountain', p1: [Y, -240], cast: [[X.TODO, -480, 1, 1.2]], foe: ['hanami', 300], card: ['特級呪霊', 'DISASTER BLOOM'], lines: [
    ['hanami', 'The forests, the seas and the skies can bear humankind no longer. They are asking for time to breathe.'],
    ['todo', 'A special grade, strolling into our exchange event. Brother. Shall we?'],
    ['yuji', 'Yeah. Together!']
  ] },
  // half-way through, Todo calls it and the next thing to land is a Black Flash
  { foes: ['hanami'], stage: 'mountain', ally: TODO, floor: 8, label: 'Special grade', card: ['花', 'DISASTER BLOOM'],
    mid: { at: .45, lines: [
      ['todo', 'Now, brother! The sparks of black choose nobody. But you are in the zone. Hit it!'],
      ['yuji', 'BLACK FLASH!']
    ], after(p, o) { E.applyHit(o, p.face, { dmg: 60, kb: 900, lift: 520, stop: .3, heavy: 1, col: '#ff2440' }); E.blackFlash(); } } },
  { stage: 'mountain', p1: [Y, -240], cast: [[C.GOJO, 40, -1, 1.1], [X.TODO, -500, 1, 1.2]], lines: [
    ['gojo', 'Sorry I am late. That curtain was built to keep out exactly one person. Flattering, really.'],
    ['gojo', 'I cleaned up what was left of it. Nice work, you two.'],
    ['yuji', 'Sensei, I landed it again. Black Flash. More than once!'],
    ['gojo', 'I know. I could feel it from outside the curtain.']
  ] }
]);

// Nobara's Resonance: the damage travels back down the blood to its owner
function resonance() {
  const o = E.P2;
  o.hp = Math.max(1, o.hp - 45); o.flash = .2;
  V.impact(.25, o.x, 150); E.cam.shake = 22; sfx.bf();
  for (let i = 0; i < 5; i++) V.slash(o.x, 120 + i * 30, i % 2 ? .6 : 2.5, 300, '#ff9a4d', 10, i * .04);
}

add(7, 'The Death Paintings', [
  { stage: 'mountain', p1: [Y, -260], cast: [[D.NOBARA, -30, -1], [C.MEGUMI, 130, -1]], card: ['八十八橋', 'YASOHACHI BRIDGE'], lines: [
    ['megumi', 'Everyone who was cursed crossed under this bridge at night. The source is down there.'],
    ['nobara', 'Then we go down. What are we waiting for?'],
    ['megumi', 'Something else is here too. I will take the source. You two...'],
    ['yuji', 'We have whatever that is. Go.']
  ] },
  { stage: 'mountain', p1: [Y, -240], cast: [[D.NOBARA, -470, 1], [X.KECHIZU, 440, -1, .95]], foe: ['eso', 260], card: ['呪胎九相図', 'THE DEATH PAINTINGS'], lines: [
    ['eso', 'Brother, look. Guests. And they have seen my back.'],
    ['kechizu', 'Guests! Guests!'],
    ['eso', 'We are two of the nine Death Paintings. Our elder brother asked a favour of us. So you die here.'],
    ['nobara', 'Vessel. The tall one is mine.']
  ] },
  { foes: ['kechizu', 'eso'], stage: 'mountain', ally: NOBARA, label: 'Death paintings',
    mid: { at: .5, foe: 'eso', lines: [
      ['eso', 'Wing King! My blood rots whatever it touches. You are both already dying.'],
      ['nobara', 'Your blood is inside me? Then you are in range. Resonance!', resonance],
      ['eso', 'She drove the nail into her own arm...?!']
    ] } },
  { stage: 'mountain', p1: [Y, -260], cast: [[D.NOBARA, -30, -1], [C.MEGUMI, 150, -1]], lines: [
    ['yuji', '...They were crying. For each other. Those were not just curses.'],
    ['nobara', 'I know. So we carry it. Accomplices, you and me.'],
    ['megumi', 'It is finished down there. I have the finger.'],
    ['yuji', 'Then let us go home.']
  ] }
]);
})();
