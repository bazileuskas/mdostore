/* JUJUTSU UNLIMITEDS — season three: chapter 13 (The Executioner), 14 (Blood and Speed), 15 (Yuta Okkotsu) and 16 (The Culling Game) */
(() => {
'use strict';

const E = JU.eng, H = E.hooks, C = JU.cast, X = JU.cast2, K = JU.cast4, B = JU.boss, V = JU.vfx, sfx = JU.sfx, Fi = JU.fights, Y = E.YUJI, CHOSO = JU.choso.CHOSO, add = JU.chapters.add;
const { rnd } = E;
const BRO = { skin: CHOSO, call: 'PIERCING BLOOD', col: '#e0203c', dmg: 10 };                   // Choso, fighting at his side
const AS_CHOSO = { skin: CHOSO, tech: 'blood', name: ['Blood Brother', '血'], hp: 130 };

add(13, 'The Executioner', [
  { stage: 'ruins', p1: [Y, -240], cast: [[CHOSO, 40, -1]], card: ['東京', 'TOKYO · AFTER SHIBUYA'], lines: [
    ['choso', 'Ten million curses, loose in one city. This is what he left behind him when he walked out of Shibuya.'],
    ['yuji', 'Then I keep going until there are none left. It is the only thing I am still good for.'],
    ['choso', 'You do not carry it alone. Where my little brother goes, I go.'],
    ['yuji', 'I still do not get the brother thing. But thanks. Here they come.']
  ] },
  { foes: ['brute', 'ruin'], stage: 'ruins', ally: BRO, label: 'The ruins of Tokyo', card: ['呪霊', 'A CITY OF CURSES'] },
  { stage: 'ruins', p1: [Y, -260], cast: [[CHOSO, -480, 1]], foe: ['naoya', 300], card: ['投射', 'THE HEAVENLY HEIR'], lines: [
    ['naoya', 'So this is King of Curses\'s vessel. You look worse than the stories.'],
    ['yuji', 'Who are you?'],
    ['naoya', 'Frame Runner. My father\'s will hands our clan to Shadow Summoner. I would rather it did not.'],
    ['naoya', 'He is bound to come looking for you. So you are my bait. Stand still for me, will you?'],
    ['choso', 'Vessel. This one is fast. Do not take your eyes off him.']
  ] },
  // nobody wins this one: part-way through, something far worse arrives
  { foes: ['naoya'], stage: 'ruins', ally: BRO, label: 'The heir', card: ['投射呪法', 'PROJECTION SORCERY'], floor: 1,
    mid: { at: .6, low: .2, ends: true, lines: [
      ['naoya', 'Twenty-four frames to the second, and you cannot follow a single one of them.'],
      ['choso', 'Vessel, behind you. Somebody else has arrived. Somebody much worse than him.'],
      ['yuji', 'That cursed energy... I cannot find the bottom of it.']
    ] } },
  { stage: 'ruins', p1: [Y, -300], cast: [[K.YUTA, 60, -1], [CHOSO, -520, 1]], foe: ['naoya', 480], card: ['女王の器', 'THE EXECUTIONER'], lines: [
    ['yuta', 'The Vessel. My name is Keeper of the Queen. The higher-ups have made me your executioner.'],
    ['naoya', 'The special grade himself. Fine. The vessel is yours. I will clean up whatever that other thing is.'],
    ['choso', 'Run, Vessel! Draw him away from here. I will deal with this one and catch you up.'],
    ['yuji', 'Do not die on me, Blood Brother.']
  ] }
]);

/* ---------- chapter 14: a Death Painting's blood is poison to anything that is not one ---------- */
let venom = null;                                   // whoever has it in him
function poison(p, o) {
  venom = o; sfx.charge();
  B.say(o, 'POISONED', '#c77dff'); V.ring(o.x, o.y + 150, 240, '#c77dff', .4);
}
const floored = () => { const o = E.P2; o.target = E.POSE.down; o.rate = 7; };

add(14, 'Blood and Speed', [
  { stage: 'ruins', p1: [CHOSO, -240], foe: ['naoya', 280], card: ['血', 'THE ELDEST BROTHER'], lines: [
    ['naoya', 'A curse playing at family. That little brother of yours will be dead before you catch him up.'],
    ['choso', 'You have brothers of your own. I can tell. And you learned nothing from having them.'],
    ['naoya', 'I learned that they were in my way.'],
    ['choso', 'Then watch what an older brother is for. He walks in front, so the ones behind him know where to step.']
  ] },
  { foes: ['naoya'], stage: 'ruins', as: AS_CHOSO, label: 'Blood and speed', card: ['赤血操術', 'BLOOD MANIPULATION'], win: ['毒', 'POISONED'],
    mid: { at: .5, after: poison, lines: [
      ['naoya', 'Is that all of it? You are bleeding over half the street and I have barely started.'],
      ['choso', 'Over you, as well. Have you looked?'],
      ['choso', 'I am half a curse. My blood is poison to anything that is not. It has been inside you for some time.'],
      ['naoya', 'My legs. What have you done to my legs?!']
    ] } },
  { stage: 'ruins', p1: [CHOSO, -200], foe: ['naoya', 230], lines: [
    ['naoya', 'A half-breed. Beating me. This is not how it goes...', floored],
    ['choso', 'Crawl home to your clan. I have somewhere to be.'],
    ['choso', 'Hold on a little longer, Vessel.']
  ] }
]);

/* ---------- chapter 15: Rika has him, and the sword goes in ---------- */
let held = null;
function seized(p) { held = { p, t: 0 }; V.ring(p.x, 170, 300, '#d9c9ff', .45); E.cam.shake = 16; sfx.charge(); }
function stab() { const p = E.P1; p.hp = 1; V.impact(.35, p.x, 190); V.sparks(p.x, 210, 'red', 24); E.cam.shake = 28; sfx.bf(); }

add(15, 'Keeper of the Queen', [
  { stage: 'ruins', p1: [Y, -240], foe: ['yuta', 280], card: ['特級術師', 'SPECIAL GRADE'], lines: [
    ['yuta', 'I am sorry it has to be me. I do mean that.'],
    ['yuji', 'I know what I did in Shibuya. But I cannot die yet. Not while the curses he let out are still walking around.'],
    ['yuta', 'You are a good person. That is what makes this hard.'],
    ['yuta', 'Come on out, The Queen.']
  ] },
  // he cannot win this one either: at half Yuta's health, or when Yuji is nearly finished, Rika ends it
  { foes: ['yuta'], stage: 'ruins', label: 'The executioner', card: ['女王の器', 'KEEPER OF THE QUEEN'], floor: 1,
    mid: { at: .5, low: .22, ends: true, fn: seized, lines: [
      ['yuji', 'I cannot move. Something has hold of me. Are those... hands?'],
      ['yuta', 'That is The Queen. She does not let go.'],
      ['yuta', 'Forgive me, Vessel.', stab],
      ['yuji', '...Oh. So this... is where it stops...']
    ] } },
  { stage: 'ruins', p1: [Y, -220], cast: [[K.YUTA, 70, -1]], card: ['反転術式', 'REVERSE CURSED TECHNIQUE'], lines: [
    ['yuji', '...I am alive? You ran me through. I felt my heart stop.'],
    ['yuta', 'It did stop. I swore a binding vow to the higher-ups that I would kill The Vessel. So I killed you.'],
    ['yuta', 'And the moment your heart went still, I healed it. The vow is kept, and here you are.'],
    ['yuta', 'Blindfolded Infinity asked me to look out for you, before any of this began. I was never going to do anything else.']
  ] },
  { stage: 'ruins', p1: [Y, -240], cast: [[C.MEGUMI, 50, -1], [K.YUTA, 300, -1, 0, 150]], card: ['影法師', 'A FAVOUR'], lines: [
    ['megumi', 'Vessel. That is enough. Come back to the school.'],
    ['yuji', 'I cannot. King of Curses killed all those people with these hands. Stay near me and it happens again.'],
    ['megumi', 'Nobody here has clean hands. Me least of all. That is no reason to stop saving people.'],
    ['megumi', 'The Stitched One has started a killing game right across the country. My sister has been dragged into it.'],
    ['megumi', 'So do not ask me what you deserve. Help me. I need your strength.'],
    ['yuji', '...All right. Tell me what we have to do.']
  ] }
]);

/* ---------- chapter 16: what the game is, written up where everyone can read it ---------- */
const RULES = [
  'Once your technique wakes, you have 19 days to declare yourself at a colony.',
  'Break that rule, and your technique is torn out of you.',
  'Anyone who steps inside a colony becomes a player.',
  'Players score points by ending the lives of other players.',
  'A sorcerer is worth 5 points. Anyone else is worth 1.',
  'Spend 100 points, and you may add one rule to the game.',
  'The game must accept that rule, unless it would break the game.',
  'If your score does not change for 19 days, your technique is torn out.'
];
const board = document.createElement('div');
board.className = 'rules';
board.innerHTML = `<h4>The Culling Game<span lang="ja">死滅回游</span></h4><ol>${RULES.map(t => `<li>${t}</li>`).join('')}</ol>`;
E.root.appendChild(board);
const showRules = () => board.classList.add('on'), hideRules = () => board.classList.remove('on');

const who = i => JU.chapters.now.cast[i];
const unseen = i => cast => { cast[i].alpha = 0; };                                              // somebody who is not there yet when the scene opens
const appear = i => () => { const f = who(i); sfx.charge(); V.ring(f.x, 170, 260, '#ffffff', .5); V.custom(1, u => { f.alpha = Math.min(1, u * 1.25); }); };
const TOMB = { stage: 'tomb', p1: [Y, -150], cx: 60, zoom: 1 };

add(16, 'The Culling Game', [
  { stage: 'school', p1: [Y, -330], cast: [[C.MEGUMI, -130, -1], [X.MAKI, 40, -1], [K.YUTA, 200, -1], [K.YUKI, 400, -1], [CHOSO, -520, 1]], cx: -40, zoom: 1.04, setup: unseen(3),
    card: ['呪術高専', 'JUJUTSU HIGH'], lines: [
      ['megumi', 'Two problems. Blindfolded Infinity is shut inside the Prison Realm, and The Stitched One\'s game has already begun.'],
      ['maki', 'And one person who knows enough to help with both. Barrier Master, down in the Tombs of the Star Corridor.'],
      ['yuta', 'A barrier hides the way in. More than a thousand doors, and only one of them goes anywhere.'],
      ['choso', 'What is left of my brothers is kept in the storehouse beside it. I can feel them. I will find you the door.'],
      ['yuki', 'Then I am coming along. I have a question of my own for the old recluse.', appear(3)],
      ['yuji', 'Who are you?'],
      ['yuki', 'Star Rage. Special grade. More to the point: what sort of girl do you like, kid?']
    ] },
  Object.assign({}, TOMB, { cast: [[K.TENGEN, 330, -1, 1.12], [K.YUKI, -330, 1], [C.MEGUMI, -500, 1, 0, 130]], setup: unseen(0), card: ['薨星宮', 'TOMBS OF THE STAR CORRIDOR'], lines: [
    ['yuji', 'There is nothing in here. Only white, whichever way you look.'],
    ['yuki', 'Hiding from us, Barrier Master? After all this time, you shut the door in my face?'],
    ['tengen', 'I am not shutting you out. Welcome, all of you. And you, the vessel of King of Curses.', appear(0)],
    ['yuji', 'Four eyes... You are Barrier Master?'],
    ['tengen', 'Twelve years ago the merger with my Star Plasma Vessel failed. Without her I kept on changing.'],
    ['tengen', 'What stands in front of you is nearer to a curse than to a person.']
  ] }),
  Object.assign({}, TOMB, { cast: [[K.TENGEN, 330, -1, 1.12], [K.YUKI, -330, 1], [C.MEGUMI, -500, 1, 0, 130]], card: ['死滅回游', 'THE CULLING GAME'], lines: [
    ['megumi', 'The Stitched One. What is he after? What is this game for?'],
    ['tengen', 'He means to force the whole of humanity to change. By merging every person in this country with me.'],
    ['tengen', 'And since I am closer to a curse now, his technique can take hold of me. That is why he waited.'],
    ['yuki', 'So the Culling Game is how he gets everybody ready for it.'],
    ['tengen', 'It is a ritual. Ten colonies, each one shut inside a barrier. He woke techniques in people who never asked for one, all on the same night, and gave them these rules.', showRules],
    ['megumi', 'So anyone who will not kill has their technique torn out. That is a death sentence. And my sister is on the clock.'],
    ['yuji', 'A hundred points buys a rule. Then we add one that lets people stop.', hideRules]
  ] }),
  Object.assign({}, TOMB, { cast: [[K.TENGEN, 330, -1, 1.12], [K.YUTA, -330, 1], [C.MEGUMI, -500, 1, 0, 130], [K.YUKI, 120, 1, 0, 200], [CHOSO, -420, 1, 0, 260]], card: ['獄門疆', 'THE BACK GATE'], lines: [
    ['yuta', 'And Blindfolded Infinity? Can the Prison Realm be opened?'],
    ['tengen', 'It has a back gate, and I hold it. But a seal has to be forced, by something that cancels a technique outright.'],
    ['tengen', 'The Inverted Spear of Heaven would have done it. So would the Black Rope. Blindfolded Infinity saw to it that neither exists any more.'],
    ['tengen', 'One chance is left. A sorcerer from a thousand years ago is among the players. She calls herself Angel, and her technique erases any other.'],
    ['tengen', 'In return I ask for two of you, as guards. The Stitched One will come for me.'],
    ['choso', 'I will stay. He is the one who made me. Whatever ending he gets, I mean to be there for it.'],
    ['yuki', 'And so will I. Off you go, the rest of you.'],
    ['megumi', 'Then we split up. Find Angel. Find my sister. And find enough strength to walk into a colony and come out again.'],
    ['yuji', 'The Culling Game. All right. Let us go and break it.']
  ] })
]);

/* ---------- what runs under all of that ---------- */
const tick0 = H.tick, under0 = H.under, fx0 = H.fx, reset0 = H.reset, start0 = H.fightStart;
H.tick = dt => {
  tick0(dt);
  const o = venom;
  if (!o || o !== E.P2 || o.ko || Fi.fight.paused) return;
  o.hp = Math.max(1, o.hp - 5 * dt);              // it will not finish him: that is left to Choso
  if (o.ai) { o.ai.t += dt * .35; if (o.ai.kt !== undefined) o.ai.kt += dt * .45; }               // and everything he does comes slower
  if (Math.random() < dt * 14) V.puff('purple', o.x + rnd(-40, 40), o.y + rnd(40, 240), 0, rnd(60, 160), 26, .5);
};
H.under = dt => {                                 // Rika stands behind him...
  under0(dt);
  if (!held || held.p !== E.P1) return;
  const p = held.p;
  held.t += dt;
  K.rika(p.x - p.face * 105, p.face, 1, held.t * 2.5);
};
H.fx = dt => {                                    // ...and her hands close in front
  fx0(dt);
  if (held && held.p === E.P1) K.grip(held.p.x, held.p.face, held.t * 2.5);
};
H.reset = () => { reset0(); venom = held = null; hideRules(); };
H.fightStart = (cfg, wave) => { venom = held = null; start0(cfg, wave); };
})();
