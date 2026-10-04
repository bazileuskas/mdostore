/* JUJUTSU UNLIMITEDS — the patch notes: every update so far, written out on an old scroll with a picture beside each one */
(() => {
'use strict';

// Newest first. v = the build, jp = the seal stamped beside it, pic = notes/<pic>.jpg, cap = what the picture shows.
// A new update goes at the top of this list.
const NOTES = [
  { v: '0.2', name: 'The Road to Shinjuku', jp: '新宿', date: '4 Oct 2026', pic: 'shinjuku', cap: 'Shinjuku, the twenty-fourth of December', items: [
    'Nine new chapters, 22 to 30, carrying Season 3 from the colonies to the night of the Shinjuku Showdown',
    '22 The Receipt: play as Megumi against Reggie Star, out on the street and then in the gym, where it ends on Chimera Shadow Garden',
    '23 Sendai: play as Yuta (Katana Rush, Rika, Cursed Energy Slash, Reverse Cursed Technique) against Takako Uro and Ryu Ishigori',
    '24 Jackpot: play as Hakari against Hajime Kashimo. Fill the bar and G is the Jackpot: for twelve seconds whatever is done to him is undone',
    '25 Sakurajima: Maki against Naoya, back as a cursed spirit, and his domain',
    '26 Star Rage: Choso, and then Yuki Tsukumo (Star Rage, Garuda, Mass Driver, Bom Ba Ye), against Kenjaku',
    '27 Enchain: Sukuna takes Megumi. 28 The Perfect Sphere: play as Sukuna in Megumi\'s body, with the Ten Shadows, against Yorozu',
    '29 Unsealed: Gojo is out of the box. 30 December 24th: Gojo, with Awakened Limitless, walks out to meet Sukuna in Shinjuku. It stops as the two domains go up',
    'New opponents with movesets of their own: Reggie, Uro, Ishigori, Kashimo, cursed-spirit Naoya, Kenjaku and Yorozu. New places: the gym, the docks of Tokyo No. 2, and Shinjuku in the snow',
    'A long season lays its chapters out in three rows'] },
  { v: '0.19v8', name: 'Sukuna\'s Mark and Deadly Sentencing', jp: '宿儺の印', date: '4 Oct 2026', pic: 'smark', cap: 'Shinjutsu Shrine: a thousand cuts, 3 each', items: [
    'Sukuna\'s Mark, the fourth Awakened CT (Cursed Technique screen, Awaken CT). Free for now. Later it will need the Sukuna clan, 150 Black Flashes as Sukuna and 500 curses exorcised: both are being counted already',
    '1 Deadly Cleave: he dashes in, takes hold of it and lets Cleave off into it. 666',
    '2 Shrine Cleave: a shrine with no domain round it stands for five seconds and cuts at the enemy. 500 in all',
    '3 500% Fuga: an arrow of fire. 700 where it lands, and the enemy is thrown the length of the arena',
    '4 Shinjutsu Shrine: the shrine comes up out of the floor with no barrier at all and cuts a thousand times at 3 each. 3000 in all',
    '1 + R together: a 0.2 second shrine. 150, eight seconds between them',
    'Yuji Itadori is a cursed technique of his own now: free, first card on the Cursed Technique screen. It is the moveset everybody starts with',
    'Cursed Judge (still Early Access): G is Deadly Sentencing, a real domain now. Judgeman reads a count, the accused pleads Confess, Silence or Denial, and so do you (1, 2, 3 or click). Call it the same and the verdict bar at the top fills by a third. How the accused is standing gives it away more often than not',
    'Three thirds and you are handed the Executioner\'s Sword. G swings it: three circles, press each as the ring meets it. Your accuracy against the accused\'s: beat it and the cut kills, whatever health was left. Lose and the sword breaks'] },
  { v: '0.19v7', name: 'The Toji Clan and Cursed Tools', jp: '呪具', date: '4 Oct 2026', pic: 'toji', cap: 'The Toji clan, three tools on him', items: [
    'Cursed Tools: a new button under the Shop opens a reel that spins for one of four tools. Cursed Katana 40%, Dagger 40%, Playful Cloud 19.9%, Inverted Spear of Heaven 0.1%. Spins are free for now, and there is a card for each tool',
    'You carry one tool. It is used in place of a cursed technique, in Free Exploration and Training: its moves are on the first keys',
    'Cursed Katana: Katana Slash, 70. Dagger: Stab, 25 and then 70 more as it bleeds',
    'The dagger has a second form, the Dagger of the Demonly Holdings: Demonic Grab (40, then demons for 120 more) and Purgatory, a counter. Be hit while it is held and you come back at full health with the Deadly Demonic Katana, which kills in one cut, for ten seconds',
    'Playful Cloud: no moves, only strikes, 7 each, one every 0.2 seconds. Inverted Spear of Heaven: Inversion Stab for 450, and one strike every two seconds for 30',
    'The Toji clan: limited time, 0.01%, disaster grade. +300% health, +200% cursed tool damage, and you look like Toji',
    'It carries three tools at once: one in hand, one in the cursed spirit round his neck, one at his waist. T switches',
    'R is Deadly Counter: for three seconds anything that hits you dies on the spot',
    'It has no cursed energy: equipping it puts your cursed technique down, and equipping a technique gives the clan up'] },
  { v: '0.19v6', name: 'Early Access: Switcher Stitcher', jp: '拍手', date: '4 Oct 2026', pic: 'switcher', cap: 'Stitcher Punch', items: [
    'A second early-access technique: Switcher Stitcher (Aoi Todo). It is on the Cursed Technique screen and in the Shop\'s Early Access tab',
    'You are bigger, you walk and strike more slowly, and every strike does one and a half times the damage',
    'Boogie Woogie (1): a clap, and you and the enemy have changed places. Whatever it was doing, it stops for a moment',
    'Out on the street in Free Exploration, R is the clap: you change places with whoever is nearest',
    'Stitcher Punch (2): a very long wind-up, then a punch the size of a door for 95 that sends the enemy flying',
    'Pebble Throw (3): a pebble with real weight. It arcs and bounces. Press 1 while it is still about and you are where the stone is',
    'There is no fourth move yet'] },
  { v: '0.19v5', name: 'Awakened Ten Shadows', jp: '十種', date: '4 Oct 2026', pic: 'ats', cap: 'Mahoraga, called', items: [
    'Awakened Ten Shadows is the third awakened technique on the AWAKEN CT menu',
    'Two meters under your health bar: shikigami left to call (one, plus one for every enemy you have exorcised) and cursed energy (it rises on its own and with every hit you land)',
    'Shiro (1): needs 25% cursed energy. The white Divine Dog stays at your side; press 1 again and it bites for 20. After five bites it is gone',
    'Rabbit Escape (2): needs 40%. Rabbits flood the floor, the arena no longer ends at its walls, and walking off the far edge leaves the fight',
    'Rabbit Stampede: press 2 again while the rabbits are out. They pile onto the enemy, 48 of them, one damage each',
    'Mahoraga (3): needs 100%. The full summoning, then Mahoraga fights beside you for fourteen seconds',
    'Max Elephant (4): needs 60%. It lands on the enemy for 30',
    'Domain Expansion on G: Chimera Shadow Garden. The enemy cannot move, and shikigami cost nothing and have no limit while it is open',
    'Awakened Limitless: after a 0.2 second domain you no longer have to strike by hand. Stand in reach and the hits land by themselves'] },
  { v: '0.19v4', name: 'Awakened Limitless', jp: '無下限', date: '4 Oct 2026', pic: 'alimit', cap: 'Imaginary Technique: Purple', items: [
    'Awakened Limitless is the second awakened technique on the AWAKEN CT menu',
    'Maximum: Blue (1): a big blue orb circles you for four seconds and drags the enemy after it',
    'Reversal Red: MAX (2): Red at full speed, across the whole arena',
    'Secret: press 1 straight after Reversal Red: MAX. The camera flies once round you and you fire Imaginary Technique: Purple for 275. Both moves then wait 25 seconds',
    '150% Hollow Purple (3): a massive purple orb that explodes beside the target for 1050. It will be earned through a questline later; for now it is unlocked',
    'Unlimited Void (4): the Domain Expansion, on the fourth key',
    'Secret, Gojo clan only: press R and 2 while the domain is opening for a 0.2 second domain. The enemy is frozen for seven seconds, you are far faster, every hit is worth 7, and it ends on a Black Flash worth 250',
    'Awakened Projection: out on the street, Top Speed is now a straight sprint down the road instead of laps'] },
  { v: '0.19v3', name: 'Awakened CT', jp: '覚醒', date: '4 Oct 2026', pic: 'awakened', cap: 'Top Speed on the street', items: [
    'An AWAKEN CT button on the Cursed Technique screen, across from the talisman, opens a second menu of four awakened techniques',
    'Awakened Projection is the first: you fight, and walk Tokyo, as Naoya the cursed spirit',
    'Frame Breaker (1): one target, caught in a frame that breaks four times over',
    'Top Speed (2): twenty-four laps round the enemy, each quicker than the last. Afterwards you move far faster for nine seconds, and whatever you touch freezes for two',
    'Out on the street in Free Exploration, hold R and press 2 for Top Speed: passers-by and curses you brush past freeze where they stand',
    'Sonic Boom (3) and Mach 3 (4) round out the set',
    'It is free for now. Later it will take three Projection Frame v2, which the Maki boss already drops one time in twenty',
    'Awakened Limitless, Awakened Ten Shadows and Sukuna\'s Mark are on the menu as coming soon'] },
  { v: '0.19v2', name: 'Early Access: Cursed Judge', jp: '審判', date: '4 Oct 2026', pic: 'judge', cap: 'Justice Served', items: [
    'A new early-access technique: Cursed Judge (Hiromi Higuruma), with the Defense Attorney\'s moves from Jujutsu Shenanigans',
    'His strikes are gavel strikes. The gavel is a size bigger with every strike of the chain, the second one raps twice, and each has its own sound',
    'Extended Swings (1): the gavel becomes a long hammer. Three swings, then a slam',
    'Justice Served (2): it grows to an absurd size and comes down, launching whatever is under it',
    'Judgement\'s Reach (3): the handle runs out across the arena and the head drops on the far end',
    'Pressing Charges (4): a rush into a kick, a second rush, and a swing that sets up the third strike',
    'Deadly Sentencing is on G. It is not built yet, so for now it does nothing',
    'The Shop has an Early Access tab at $2.99. It is not on sale yet, so the button does nothing and the technique can be equipped for free'] },
  { v: '0.19', name: 'Combat Update 2', jp: '昇拳', date: '4 Oct 2026', pic: 'combat2', cap: 'The Black Flash uppercut', items: [
    'Uppercut: hold jump while you throw the chain of strikes. You will not jump, and the last strike launches the enemy straight up',
    'Black Flash uppercut: as Yuji, press 3 once during the uppercut. No timing needed. It uses Divergent Fist\'s cooldown',
    'Black Flash slam: straight after a Black Flash uppercut, click once and press 3 once more. Yuji goes up after the enemy and brings it down for 300 damage',
    'Cursed Strikes in the air (1 while airborne, as Yuji): a dropkick loaded with cursed energy that grounds whatever it lands on, as in Jujutsu Shenanigans. 24 damage',
    'Blade Arm in the air (Transfiguration, 1 while airborne): he comes down on the point of the blade. 18 damage',
    'Mach in the air (Projection Sorcery, 4 while airborne): it charges, then he is on the enemy in an instant with impact frames. 150 damage',
    'Training: the awakening or domain is ready at all times, with no bar to fill and no cooldown',
    'Five more chapters in Season 3, 17 to 21: Perfect Preparation, The Zenin Clan, The Fight Club, Tokyo No. 1 Colony, Deadly Sentencing',
    'Play as Maki with a moveset of her own: Split Soul Katana, Spear Throw, Vanishing Step, Playful Cloud',
    'New bosses: Ogi Zenin, Panda, Kinji Hakari, Haba and Hiromi Higuruma. In his court your technique is confiscated, and one touch of the Executioner\'s Sword is the end',
    'A story fight with a scene still to come can no longer be ended early by one huge hit'] },
  { v: '0.18', name: 'Season 3', jp: '死滅', date: '4 Oct 2026', pic: 'season3', cap: 'Yuta Okkotsu calls Rika down', items: [
    'The Play screen is sorted into seasons: S1, S2 and S3. Press one to see its chapters',
    'Story Mode carries on from the first chapter you have not finished',
    'Season 3 begins with four new chapters, 13 to 16: The Executioner, Blood and Speed, Yuta Okkotsu, The Culling Game',
    'Play as Choso against Naoya Zenin. Half-way through, the poison in his blood starts eating at Naoya',
    'New bosses with movesets of their own: Naoya (Projection Sorcery) and Yuta Okkotsu (Katana Rush, Rika, Cursed Energy Slash, Reverse Cursed Technique)',
    'New faces: Yuki Tsukumo and Master Tengen. New places: the ruins of Tokyo and the Tombs of the Star Corridor',
    'Tengen sets out the eight rules of the Culling Game',
    'Chapters 1 and 2 now turn gold when finished, like the rest'] },
  { v: '0.17', name: 'Combat Update', jp: '戦闘', date: '4 Oct 2026', pic: 'combat', cap: 'Gojo against Toji Fushiguro', items: [
    'Down slam: throw the last strike of the chain while you are in the air (strike three times, jump, strike) and it slams the enemy into the floor for twice the finisher\'s damage',
    'Black Flash down slam: as Yuji, press 3 in the air and hit the Black Flash timing. It lands for three times a Black Flash',
    'Black Flash finisher: when a Black Flash is the killing blow, the enemy is held where it was hit while the sparks keep coming',
    'Five new chapters, 8 to 12: Hidden Inventory, Shibuya, Blood Brother, The King of Curses, The Last of Mahito',
    'New bosses with movesets of their own: Toji Fushiguro, Choso, Mahoraga and Mahito\'s true shape. A new stage: Shibuya station',
    'Finished chapters are marked in gold on the Play screen, and finishing one pays 20 Cursed Tokens',
    'Transfiguration has a domain, Self-Embodiment of Perfection: inside it a touch leaves a mark, and the next blow on anything marked kills it. Its bar fills only with kills, three or four of them',
    'Chapter 11 is fairer: Sukuna has more health and opens Malevolent Shrine with G, Fuga hits harder (twice as hard inside the shrine), and Mahoraga has a quarter less health and adapts more slowly'] },
  { v: '0.16', name: 'The Shop', jp: '売店', date: '4 Oct 2026', pic: 'shop', cap: 'The Daily Shop', items: [
    'A Shop button on the right of the title screen, with your Cursed Tokens above it',
    'CT tickets and clan rolls cost 10 tokens a spin. Spins stay free for now',
    'The Daily Shop sells three rare techniques or clans, different every day',
    'Beating a curse pays 5 tokens, and a boss pays 15'] },
  { v: '0.15', name: 'Black Flash × Domain Update 2', jp: '結界', date: '4 Oct 2026', pic: 'void', cap: 'Unlimited Void, opened in a fight', items: [
    'Limitless: use Reversal: Red, then press R. Blue drags the enemy back onto your fist for a Black Flash worth 30% of its full health',
    'Transfiguration: land Idle Transfiguration (3), then press 2 for a Black Flash worth 60 damage',
    'Shrine with the Sukuna clan: Cleave (2), choke hold (R), then Dismantle (1) for a Black Flash worth 120 damage. Every move then waits 20 seconds',
    'A black barrier swells out from the caster as a domain opens, and shatters when it ends',
    'More to see inside both domains: horns, skulls and blood in Malevolent Shrine, stars and a ring of light in Unlimited Void',
    'Unlimited Void can be opened in a fight: Gojo clan with Limitless, press G. The enemy can do nothing while it is open',
    'Press G while your domain is open to let it go early'] },
  { v: '0.145v5', name: 'Domain Update 1', jp: '領域', date: '4 Oct 2026', pic: 'domain', cap: 'Malevolent Shrine opening', items: [
    'A Domain Expansion now opens with a slanted panel across the screen: the caster in close-up between the words DOMAIN and EXPANSION',
    'A dome of force bursts out from the caster, the panel shuts, and white floods in from the edges before the domain appears',
    'The fight freezes while it plays, and the caster cannot be interrupted',
    'Used by Malevolent Shrine (Sukuna clan with Shrine, press G) and by Gojo\'s Unlimited Void at the end of chapter 4',
    'This scroll: every update so far, with pictures'] },
  { v: '0.145v4', name: 'Blood Brother', jp: '赤血', date: '4 Oct 2026', pic: 'choso', cap: 'Choso firing Piercing Blood', items: [
    'Limited time technique: Blood Brother (Choso), 2.5% from the roll, gone after seven days',
    'The only technique that changes how you look: you fight and walk Tokyo as Choso',
    'Moves: Slicing Exorcism, Flowing Red Scale, Supernova, Piercing Blood',
    'Touch controls for phones and tablets: a stick, Strike, Jump and Dash, and a hotbar you can tap',
    'The whole game can be saved as one file to send to a friend'] },
  { v: '0.145v3', name: 'Boss Update', jp: '特級', date: '4 Oct 2026', pic: 'boss', cap: 'Hanami raising Root Spikes', items: [
    'Every boss fights with a moveset of its own, listed under its health bar',
    'Hanami uses Disaster Plants, Mahito uses Transfiguration, Sukuna uses Shrine',
    'New movesets for the Finger Bearer, Jogo, Todo, Eso, Kechizu and Maki',
    'Some moves stay locked until the boss has been hurt',
    'New mode: Training, with a curse that never fights back'] },
  { v: '0.145v2', name: 'Clans', jp: '一族', date: '4 Oct 2026', pic: 'clan', cap: 'The clan draw', items: [
    'Draw a clan from three talismans: Kugisaki 40%, Fushiguro 40%, Gojo 10%, Kenjaku 5%, Zenin 4.9%, Sukuna 0.1%',
    'A clan changes your health, damage and speed, and most have an ability on R',
    'Gojo warps to the cursor, Zenin counters with a cursed tool, Kenjaku takes a beaten body, Sukuna chokes his enemy',
    'Die as Sukuna and you become a finger: whatever killed you eats it and becomes your vessel',
    'A card for every clan, to try one without drawing'] },
  { v: '0.145', name: 'Seven Chapters', jp: '七章', date: '3 Oct 2026', pic: 'chapters', cap: 'Naoya against Maki in the mountains', items: [
    'Story Mode runs to chapter 7: The Strongest, Mahito, The Goodwill Event, The Death Paintings',
    'A chapter select on the Play screen',
    'Tab or X skips a conversation',
    'Projection Sorcery: a far dash that leaves blue afterimages, and an awakening on G (the hair fix, then 24 punches)',
    'Maki Fight appears on the Play screen while Projection Sorcery is equipped'] },
  { v: '0.141', name: 'The Vow', jp: '縛り', date: '3 Oct 2026', pic: 'vow', cap: 'Sukuna\'s innate domain', items: [
    'Chapter 3: play as Megumi against Sukuna',
    'Sukuna tears out the heart, and Yuji wakes among the bones of his innate domain',
    'The binding vow: Enchain',
    'The morgue with Gojo and Shoko, and Nobara arrives in Tokyo'] },
  { v: '0.14', name: 'Cursed Techniques', jp: '術式', date: '3 Oct 2026', pic: 'technique', cap: 'The technique roll', items: [
    'Roll the talisman for a technique: Ten Shadows 40%, Transfiguration 20%, Disaster Plants 20%, Limitless 10%, Projection Sorcery 5%, Shrine 5%',
    'Every technique has four moves of its own',
    'A card for every technique, to equip one without rolling'] },
  { v: '0.13', name: 'The School', jp: '呪霊', date: '3 Oct 2026', pic: 'school', cap: 'Sukuna against the Finger Bearer', items: [
    'Chapter 2: clear the school with Megumi and his Divine Dog',
    'A special grade boss: the Finger Bearer',
    'Impact frames, and Sukuna takes over with Dismantle, Cleave, Open and World Slash',
    'Heavier visuals for every move',
    'Story Mode gets its name, and Free Exploration is added'] },
  { v: '0.12', name: 'Tokyo', jp: '東京', date: '3 Oct 2026', pic: 'tokyo', cap: 'The streets of Tokyo', items: [
    'Gojo walks out after the first Black Flash',
    'Walk the streets of Tokyo, sense cursed energy and find Megumi',
    'More depth everywhere: an orbiting camera and solid buildings'] },
  { v: '0.11', name: 'Black Flash', jp: '黒閃', date: '3 Oct 2026', pic: 'fight', cap: 'The first Black Flash', items: [
    'Play opens a side-on arena fight as Yuji',
    'Basic strikes, Cursed Strikes, Crushing Blow, Divergent Fist and Manji Kick, plus a dash',
    'Press 3 again as the ring closes for a Black Flash'] },
  { v: '0.1', name: 'The Title', jp: '呪術', date: '3 Oct 2026', pic: 'title', cap: 'Where it started', items: [
    'The title screen: JUJUTSU UNLIMITEDS',
    'Four buttons: Play, Cursed Technique, Clan, Credits'] }
];

// the single-file build carries its pictures inside the page (window.JU_PICS); otherwise they are files in notes/
const pic = name => (window.JU_PICS && window.JU_PICS[name]) || 'notes/' + name + '.jpg';

function mount(body) {
  body.innerHTML = `<div class="scroll">
    <div class="rod"></div>
    <div class="parch" tabindex="0">
      <header class="shead"><b lang="ja">更新之記</b><p>A record of every update, the newest first.</p><i lang="ja" aria-hidden="true">呪</i></header>
      ${NOTES.map(n => `<article class="note">
        <div class="hanko" lang="ja" aria-hidden="true">${n.jp}</div>
        <div class="ntext"><small>Build ${n.v} · ${n.date}</small><h3>${n.name}</h3><ul>${n.items.map(t => `<li>${t}</li>`).join('')}</ul></div>
        <figure class="npic"><img src="${pic(n.pic)}" alt="${n.cap}"><figcaption>${n.cap}</figcaption></figure>
      </article>`).join('')}
      <p class="send" lang="ja" aria-hidden="true">以上</p>
    </div>
    <div class="rod"></div>
  </div>`;
  body.querySelectorAll('.npic img').forEach(im => im.addEventListener('error', () => im.closest('.npic').remove()));   // a missing picture leaves no hole
}

JU.notes = { NOTES, mount };
})();
