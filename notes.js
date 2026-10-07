/* JUJUTSU UNLIMITEDS — the patch notes: every update so far, written out on an old scroll with a picture beside each one */
(() => {
'use strict';

// Newest first. v = the build, jp = the seal stamped beside it, pic = notes/<pic>.jpg, cap = what the picture shows.
// A new update goes at the top of this list.
const NOTES = [
  { v: '0.7', name: 'Boss VFX', jp: '彩', date: '5 Oct 2026', pic: 'bossfx', cap: 'Mahoraga, adapting: the wheel turns one notch', items: [
    'Every boss in the story has been redrawn. What they do is what it was; what it looks like is not',
    'Each boss has an element of its own now, and its body gives it off the whole fight: Disaster Flame’s fire and embers, Blood Brother’s and Rot Wing’s blood, Thunder God’s lightning, the flicker of King of Curses’s cuts, Soul Shaper’s wisps, Disaster Bloom’s petals, Receipt Man’s receipts. Sorcerer Killer and Heavenly Blade give off nothing at all, because they have no cursed energy: only the air they move',
    'A boss’s move is called on a card. While it winds up, light is dragged in to it and the floor under it is marked, and the big ones dim the world behind them',
    'Bosses are introduced by name when the fight begins, flare when a move they were holding back comes free, and go out properly when they are beaten',
    'What they throw trails light and bursts. What they land throws sparks, splashes or splinters in their own element, flashes the screen their colour, and leaves scorch, blood and craters on the floor',
    'Season 1: the Finger Bearer’s Cursed Cannon is a beam; Disaster Flame’s volcano erupts, his flame is a jet, and his Meteor is a cracked rock on fire; Clapping Brawler’s Boogie Woogie leaves both of you where you were for a moment; Rot Wing’s Wing King lashes, Rot Maw’s jaws shut, Heavenly Blade’s Playful Cloud has its three lengths',
    'Season 2: Sorcerer Killer’s chain is a chain; Mahoraga’s wheel turns behind it; Frame Runner’s Freeze Frame is a frame of film; The Queen’s arm comes down out of the dark; Blazing Elder’s blade leaves the floor burning; Jackpot Gambler’s shutters have their lights and their pachinko balls; Rotor Head has his rotor; The Judge’s Executioner’s Sword is a blade of light',
    'Season 3: Receipt Man’s knives and truck, Sky Captain breaking the sky, Granite Cannon’s Granite Blast, Thunder God’s lightning, Frame Runner ahead of his own sound, The Stitched One’s Uzumaki and Antigravity System, The Constructor’s liquid metal and True Sphere'] },
  { v: '0.6', name: 'One v Ones', jp: '対', date: '5 Oct 2026', pic: 'duel', cap: 'The board: one ban each, then one technique each', items: [
    'Servers: Free Exploration with up to five people. On the Play screen, agree on a server code with your friends and all type the same one. You are then in the same Tokyo, Shibuya and Kyoto, and see each other walk about with your names over your heads',
    'Press / to say something. It shows in a bubble over your head',
    'One v Ones: challenge anybody on your server from the list in the corner. Each of you bans one cursed technique, each picks one of what is left, and you fight. No clans, no cursed tools',
    'In a duel both fighters have the same health, and no single blow takes more than two fifths of it. Blocking, and dashing through a blow, work against a person the way they do against a curse',
    'Every ordinary technique can be picked in a duel whether you hold it or not. Awakened and Early Access techniques only by whoever has them, though anybody may ban them',
    'Duels won and lost are counted',
    'There is no machine behind a server: the games connect straight to each other. Some school and office networks do not allow that, and the game says so when it cannot reach somebody. Join only with people you know'] },
  { v: '0.5', name: 'Kyoto', jp: '京', date: '5 Oct 2026', pic: 'kyoto', cap: 'Kyoto Station, Kyoto Tower, and the fire on the hill', items: [
    'The Kyoto expansion: a second stop on the line, by bullet train, open on the same terms as Shibuya. Laid out from the real city: the bamboo grove at Arashiyama, the Golden Pavilion, Kyoto Jujutsu High, Kyoto Station and Kyoto Tower, the Crimson River, Gion and Hanamikoji, Yasaka Shrine, the Yasaka Pagoda, Kiyomizu-dera, the thousand gates of Fushimi Inari, and the Heavenly estate. Over all of it, 大 burning on the hill',
    'In Kyoto: Clapping Brawler, Bullet Maker, Shrine Singer and Heavenly Blade to talk to; three raids (The Goodwill Event, A Thousand Curses on the Crimson bridge, The Heavenly Estate); and five secret bosses, two of them standing where a thousand-year-old sorcerer would',
    'The route board has been redrawn the way the ones on a station wall are: a yellow sign, a white street map, and every stop as its numbered ring',
    'True Cursed Energy Discharge has a new fourth move, Dessert: steam off his hair, a burst that throws him across the stage, a beating where the enemy falls, one red swing, and a last blow that everything stops for. 1000 in all',
    'Max Granite Blast has moved to G. The bar under his health fills with the damage he does, and G spends it',
    'Awakened Ten Shadows has been redrawn. Shiro is a wolf now, not a box. Max Elephant comes down with its water. Mahoraga stands under its eight-handled wheel. And in Chimera Shadow Garden the rest of the ten are standing in the shadow as what they are: Nue, the toad, the great serpent, the elephant',
    'Announcements from the team appear at the top of the screen, marked with a blue tick'] },
  { v: '0.4', name: 'Map Update', jp: '渋', date: '5 Oct 2026', pic: 'shibuya', cap: 'Hachiko Square: the statue, the old green train car, and somebody waiting by the dog', items: [
    'The Tokyo block has a subway entrance at its east end. Walk to the end of the block and a route map asks where to. The line opens once you have exorcised 10 curses and finished Season 1',
    'One stop is open, the nearest: Shibuya, on the night of the incident, under the curtain. It is about three times the length of the Tokyo block and laid out from the real place: Dogenzaka, Mark City and the Avenue Exit, Shibuya 109, Center Gai, the Scramble Crossing under QFRONT, Hachiko Square, the station and the Yamanote viaduct, Scramble Square, Hikarie, Miyashita Park, Nonbei Yokocho, Expressway Route 3 and C Tower',
    'People to talk to, with E or a tap: The Driver, Ratio Blade, Summoner, Straw Doll, Panda, Star Rage, The Healer at the tollgate, and Blindfolded Infinity as he was at school, waiting by the dog',
    'Blindfolded Infinity awakens Limitless for whoever comes to him carrying it. That is how Awakened Limitless is unlocked now',
    'Awakened Ten Shadows is earned: 100 curses exorcised with Ten Shadows, 10 of them bosses. Summoner, up on Dogenzaka, keeps you told of the count',
    'Three raids, each marked by a column of red light: The Night Parade on the crossing, The Sealing Ground five floors under Hikarie, The Curtain\'s Anchor under C Tower. Fights one straight after another with something worse at the end, and tokens and tickets for clearing them',
    'Five secret bosses. Two are there for whoever goes looking; three only turn up once something else has been done',
    'The Healer\'s reversed technique: your next fight starts with half again your health',
    'Curses on every block, and their corners do not stay empty. Free Exploration starts wherever you last got off the train',
    'Shinjuku and the other stops are on the map, and sealed for now'] },
  { v: '0.3v1', name: 'Three Slots', jp: '枠', date: '5 Oct 2026', pic: 'slots', cap: 'Three slots, one more for a limited technique, and a free one for Early Access', items: [
    'Three slots for cursed techniques, and three for clans. Press a slot to select it: what it holds is what you fight with, and the next roll or draw lands there, in place of what was in it',
    'Spinning off anything as rare as 10% is asked about twice first',
    'A limited technique or clan never goes into the three. It gets a slot of its own (a fourth, a fifth, as many as you hold), it cannot be spun off, and it is never rolled a second time',
    'An Early Access technique sits in a free slot of its own, and keeps it when its character is released in full. That one can be spun off, but the slot goes with it, and nothing is rolled in its place',
    'The Daily Shop puts what you buy into an empty slot if you have one. If you have not, it says what would be replaced, and asks before it does it',
    'Saves from before this keep what they held: limited ones in slots of their own, and of the rest the one that was equipped and then the rarest go into the three',
    'Playful Cloud is slower: one strike every 0.3 seconds, down from four or five a second, and whatever it hits is free again before the next one lands'] },
  { v: '0.3', name: 'Public Release', jp: '公', date: '5 Oct 2026', pic: 'tced', cap: 'Granite Blast at full power', items: [
    'The game is out. From here on a spin uses a ticket of its own kind: a CT ticket for the technique talisman, a clan roll for a clan draw, and a new one, the cursed tool spin, for the reel. Each is 10 Cursed Tokens in the Shop',
    'What a spin lands on is yours to keep. A card now equips only what you own: the rest are shown sealed, and pressing one says how it is come by',
    'Whatever you had equipped when this update arrived (your technique, your clan, the tools in your pockets) counts as yours',
    'Accounts. The scroll in the top right corner unrolls into Log in and Register, and SFX has moved to its left. An account has a save of its own: techniques, clans, tickets, tokens, story. Accounts are kept in the browser they are made in, and do not follow you to another device',
    'Awakened techniques are earned now. Awakened Projection: three Projection Frame v2 from the Heavenly Blade boss, who gives one up 5% of the time. King of Curses\'s Mark: the King of Curses clan, 150 Black Flashes as King of Curses, 500 curses exorcised. Awakened Limitless and Awakened Ten Shadows: the technique each is the awakening of',
    'The Heavenly Blade fight costs 50 Cursed Tokens a go',
    'Early Access techniques and the Dagger of the Demonly Holdings are sealed until they can be had: Early Access is not on sale yet, and the dagger\'s questline is not built',
    'A new awakened technique: True Cursed Energy Discharge. Granite Cannon with nothing held back, and no heat to mind. It is Cursed Cannon awakened, so it asks for Cursed Cannon',
    'Volley (1): ten quick beams, 14 each. Downpour (2): eight more, thrown up to come down out of the sky wherever it is standing by then, 26 each, and he is free to move while they fall',
    'Repulse (3): a burst all round him, 110. Hit him while he gathers it and the hit is turned aside, the burst comes at once, and it is worth 176',
    'Max Granite Blast (4): 900, and wide enough to be seen from above'] },
  { v: '0.2v6', name: 'Early Access: Cursed Cannon', jp: '砲', date: '5 Oct 2026', pic: 'cannon', cap: 'Granite Blast, held the full three seconds', items: [
    'A new early-access character: Granite Cannon, with Cursed Cannon. It is on the Cursed Technique screen and in the Shop\'s Early Access tab',
    'Granite Blast (1), a second between them, out of the front of his hair. Let go at once it does 45. Held 1.4 seconds, 80. Held the full 3, anything from 120 to 145, and it goes whether he lets go or not',
    'Every quick Granite Blast heats him. After four he is overheated: nothing comes out, quick or held, until his hair has been seen to',
    'Hair Comb (3): 2.78 seconds with the comb and the heat is gone. Hit him while he is at it and it is not',
    'Cursed Punches (2): he walks into it and trades. It takes 90 to 110. It gets its own back while he does it: he takes 30 to 40, though that never quite puts him down',
    'Right click (or C) switches him to underheat and back. In underheat every blast is worth less than the one before it, 82% of it each time, but ten of them fit where four did',
    'His fourth move is still to come',
    'Ryu himself has been redrawn from the anime (a black jacket, a fur collar, a tag on a chain), and the Granite Blast he fires as a boss is the same white-blue',
    'The Heian Era God pack has its picture',
    'The card for whoever is coming next has been put away for now'] },
  { v: '0.2v5', name: 'QOL II × Combat Update 4', jp: '防御', date: '5 Oct 2026', pic: 'block', cap: 'Vessel Blindfolded Infinity, with his guard up', items: [
    'Outside the story he carries his clan\'s name: Vessel Blindfolded Infinity, Vessel Shadow, Vessel Heavenly. Story Mode still calls him The Vessel, and a technique or a clan that makes him somebody else keeps that somebody\'s name',
    'Block: hold F and his guard is up. An ordinary blow that lands on it from the front does nothing at all',
    'A heavy blow breaks it: anything that would have thrown him into the air, or that hits for 16 or more. He takes half of it, keeps his feet, and cannot block again for two seconds',
    'Behind his guard he can walk, slowly, and nothing else: no strikes, no moves, no dash, no jump until the key is let go. A blow from behind, a sure-hit and the Executioner\'s Sword are not blocked',
    'On a phone there is a Block button to hold down',
    'The Shop has a Packs tab, and in it the Heian Era God pack, $12.99: Shrine, King of Curses\'s Mark, the King of Curses clan, the Dagger of the Demonly Holdings, 50 Clan spins, 75 CT spins and 30 Cursed Tool spins. Like Early Access it is not on sale yet, so its button does nothing',
    'The sound of a blow stopped on his guard is made by the game. A file of your own saved as sounds/block.mp3 is used instead'] },
  { v: '0.2v4', name: 'Shrine Rework × Blood Brother', jp: '斬血', date: '5 Oct 2026', pic: 'cuts', cap: 'Malevolent Shrine, cutting', items: [
    'Shrine has been redrawn from the anime, all of it. A cut is not a red line across the screen any more: it parts what it goes through. A hairline first, then the two sides slide past each other, the floor, the background and whoever is standing there with them, the gap shows black with its edges still hot, and it closes',
    'Dismantle: three blades of air thrown the length of the arena. Each one parts the whole arena along its path and leaves a gash in the floor under it, and the third dices what it reaches',
    'Cleave: one touch and the target is cut everywhere at once, four more times, and then it comes apart: pieces, ink, and the floor under it webbed the way a Cleave put into the ground webs it',
    'Fuga: flames turn in to his hand and become an arrow. It crosses the arena in a tenth of a second, and where it lands a fire stands on a floor cracked and glowing',
    'World Slash: the light goes, a line is drawn across everything, and the picture splits along it and stays split for a moment',
    'The heavy cuts land in the frame the anime shows them in: white with the cuts on it as hairlines, then the colour of raw meat with broad dark strokes across it. Dismantle and Cleave are brushed onto the air as they land',
    'Malevolent Shrine cuts the air, the floor and whatever is on it, over and over, and leaves the floor gashed. King of Curses\'s plain strikes are blades now, the choke hold cuts, and King of Curses\'s Mark cuts the same way. King of Curses as a boss has all of it too',
    'Blood Brother: the edge of him is lit red while the technique is his, brighter while he is striking',
    'Blood Brother\'s plain strikes are hardened blood: a spike off the first fist, a blade off each of the next two, a wider one off his foot. They reach a little further than a bare hand',
    'Piercing Blood is held. His hands come together and stay together for as long as the fourth key is down, up to three seconds, with blood winding round him. The longer, the harder: 28 for a tap, 33 at the old timing, 64 just short of two seconds',
    'At two seconds he flashes red, and from then on what he lets go is the wave: all of it at once, across the arena, landing when it gets there. 70 at two seconds, 110 at three. Knocked out of it before he lets go, most of the wait is handed back',
    'New sounds, made by the game: a cut, Fuga landing, his pulse while Piercing Blood is gathered, the shot, the wave'] },
  { v: '0.2v3', name: 'Cursed Judge: Full Release', jp: '解禁', date: '5 Oct 2026', pic: 'release', cap: 'Justice Served, as it looks now', items: [
    'Cursed Judge is out of Early Access. It is on the roll at 3% and has a card of its own on the Cursed Technique screen. Ten Shadows goes from 40% to 37% to make the room',
    'The gavel has been redrawn from the anime: dark lacquered ends, a band of brass round the middle, and the cross cut into the brass. Every strike leaves a red arc where the head went, and lands with that cross struck into the air',
    'When one of his heavy blows lands, the whole picture goes crimson and black for a moment, the way the anime shows him',
    'Extended Swings: the handle is let out into a red staff that bows as it is swung, and each swing arrives on the hit instead of after it',
    'Justice Served: the gavel grows over his head until it fills the top of the screen, its shadow spreads on the floor, and it comes down in a tenth of a second. It leaves a dent with the cross in it, a wall of dust and pieces of the floor',
    'Judgement\'s Reach: the staff runs out across the arena, lifts, and brings the head down at the far end of it. Pressing Charges leaves dark red after-images of him on both dashes',
    'The Executioner\'s Sword is a blade of light, held upright in front of him, with a guard of light and the same cross where the two meet. The circles are played in the dark around it, and a sentence carried out is a line of light through whatever it lands on',
    'The three circles are harder the stronger the accused is. The stars under the title show how hard. Against something strong the rings close faster, being off the beat is forgiven less, its own hand is steadier, and the rings no longer close at an even speed. Against the training curse and weak curses it is a little easier than it was',
    'New sounds, every one of them made by the game itself: the gavel as wood on wood with the room answering, a slam for the big ones, the court convening, a bell for a plea called right, the sword, the circles, the execution. Nothing is taken from the anime. Sound files of your own in the sounds folder are used instead (the names are in sounds/README.txt)',
    'Blood Brother counts down on its banner to the second: days, hours, minutes and seconds until it leaves. The Sorcerer Killer clan does the same',
    'Awakened Limitless has been redrawn from the anime. Blue, Red and Purple are balls of the stuff with weather turning inside them, not a glow with a dot in the middle',
    'Maximum: Blue winds the air into itself and drags pieces of the floor after it. Reversal Red: MAX is a bead at his fingertip with light standing out of it, then a line across the arena that leaves the floor scorched',
    '150% Hollow Purple puts the lights out while it is made and leaves a crater. Imaginary Technique: Purple leaves a trench. None of the damage has changed',
    'A sub-screen that is taller than the window scrolls now, instead of being cut off at the top and the bottom'] },
  { v: '0.2v2', name: 'QOL Update', jp: '調整', date: '5 Oct 2026', pic: 'qol', cap: 'Sonic Boom, as it looks now', items: [
    'Awakened Projection looks nothing like it did. Frame Breaker: the frame is a pane of glass now. Four frames of him arrive one after another to hit it, it cracks further each time, and then it shatters. Same damage',
    'Sonic Boom: a wall of air bowed forward, three rings left standing where it went through, ink and dust torn along behind it. It lands when the front reaches the enemy',
    'Mach 3: frames stack up at his back while it charges, MACH 1, 2, 3, he is gone, a frame hangs in the air for every step of the way, and the sound catches up a moment later (28, then 12)',
    'Root Spikes (Disaster Plants) does two and a half times the damage: 12.5 and then 22.5, and 20 for a root step that comes up under the enemy. Disaster Bloom\'s own are unchanged',
    'Switcher Stitcher has its fourth move, Ground Slam: he runs it down, gets it over his head and puts it through the floor. 70. The floor comes up in slabs that fall, bounce, and can be kicked about by dashing through them',
    'Blood Brother: Slicing Exorcism does 30 (was 19) every 3 seconds. Flowing Red Scale lasts 10 seconds (was 8): hits land 50% harder (was 30%), strikes come 40% quicker (was 30%), and he walks faster',
    'Blood Brother in the air. Slicing Exorcism is thrown at the floor and runs along it like a saw (33). Flowing Red Scale is a dive that starts the ten seconds with a hit (22, and that hit already has the bonus on it)',
    'Transfiguration: Blade Arm stuns for 0.768 of a second, on the ground or out of the air. On the ground the enemy can do nothing for that long, even one too heavy to stagger; out of the air it lies where it landed for that long',
    'Cursed Judge: Justice Served does 30 (was 20) and is far bigger. Most of the arena in front of him, a little behind him, and anything in the air over it',
    'Deadly Sentencing is easier to win: six counts instead of five, one wrong plea is ruled out for you on every count, and how the accused is standing gives the answer away 85% of the time (was 65%). The three circles for the sword are more forgiving too',
    'The Arbiter has been redrawn: a dark mass hung in the air like a pair of scales, a white mask with its eyes sewn shut, a pan on chains at either end. His mouth moves when he reads a count',
    'Somebody new is on the way. There is a card for them on the Cursed Technique screen. It will not say who, and it gives a different hint each time you press it'] },
  { v: '0.2v1', name: 'Domain Update × Disaster Plants Rework', jp: '領域', date: '5 Oct 2026', pic: 'clash', cap: 'A clash: Unlimited Void against Malevolent Shrine', items: [
    'Domain clash. Open a domain against a domain and both frames come up at once, one above the other. The arena splits in two: your domain on your half, theirs on the other, with a seam between them',
    'While they are locked together neither domain does anything. Damage you deal pushes the seam toward them; damage you take pushes it back. It lasts six seconds, or until the seam reaches an edge',
    'Win and theirs breaks: they lose 12% of their health, they are stunned, and yours stands five seconds more doing what it does. Lose and yours breaks: 12 damage, and your technique moves are out for four seconds. Dead level, and both break',
    'Special grades in Free Exploration have domains of their own now, one a fight, opened at 60% health. Soul Shaper: Self-Embodiment of Perfection (it wears you down the whole time, and his hits land 40% harder). Disaster Flame: Coffin of the Iron Mountain (it burns). Disaster Bloom: Shining Sea of Growing Branches (you wade, it drains you and feeds her)',
    'Open yours first and they answer with theirs at once. Or press G while theirs is opening or standing, and yours goes up against it',
    'G only lets go of a domain that is your own',
    'Disaster Plants rework. Root Spikes is new from the ground up: roots of pale bark with thorns on them, each bigger than the last, and the biggest comes up under the enemy and lifts it. 5, then 9',
    'Root Spikes in the air grows three roots to stand on, like steps, for seven seconds. Anything standing where one comes up is thrown',
    'Cursed Buds look the same in flight, and now leave a bud on what they hit for nine seconds: its hits do 40% less, and it swings and walks a third slower',
    'Flower Field has new flowers, and now really does stop its target: it does not move or attack for four and a half seconds. When Disaster Bloom uses it on you, you are held where you stand for three seconds (you can still strike) instead of losing your technique',
    'Solar Beam is as it was'] },
  { v: '0.2', name: 'The Road to Shinjuku', jp: '新宿', date: '4 Oct 2026', pic: 'shinjuku', cap: 'Shinjuku, the twenty-fourth of December', items: [
    'Nine new chapters, 22 to 30, carrying Season 3 from the colonies to the night of the Shinjuku Showdown',
    '22 The Receipt: play as Summoner against Receipt Man, out on the street and then in the gym, where it ends on Chimera Shadow Garden',
    '23 Sendai: play as Keeper of the Queen (Katana Rush, The Queen, Cursed Energy Slash, Reverse Cursed Technique) against Sky Captain and Granite Cannon',
    '24 Jackpot: play as Jackpot Gambler against Thunder God. Fill the bar and G is the Jackpot: for twelve seconds whatever is done to him is undone',
    '25 Sakurajima: Heavenly Blade against Frame Runner, back as a cursed spirit, and his domain',
    '26 Star Rage: Blood Brother, and then Star Rage (Star Rage, Garuda, Mass Driver, Bom Ba Ye), against The Stitched One',
    '27 Enchain: King of Curses takes Summoner. 28 The Perfect Sphere: play as King of Curses in Summoner\'s body, with the Ten Shadows, against The Constructor',
    '29 Unsealed: Blindfolded Infinity is out of the box. 30 December 24th: Blindfolded Infinity, with Awakened Limitless, walks out to meet King of Curses in Shinjuku. It stops as the two domains go up',
    'New opponents with movesets of their own: Receipt Man, Sky Captain, Granite Cannon, Thunder God, cursed-spirit Frame Runner, The Stitched One and The Constructor. New places: the gym, the docks of Tokyo No. 2, and Shinjuku in the snow',
    'A long season lays its chapters out in three rows'] },
  { v: '0.19v8', name: 'King of Curses\'s Mark and Deadly Sentencing', jp: '王の印', date: '4 Oct 2026', pic: 'smark', cap: 'Shinjutsu Shrine: a thousand cuts, 3 each', items: [
    'King of Curses\'s Mark, the fourth Awakened CT (Cursed Technique screen, Awaken CT). Free for now. Later it will need the King of Curses clan, 150 Black Flashes as King of Curses and 500 curses exorcised: both are being counted already',
    '1 Deadly Cleave: he dashes in, takes hold of it and lets Cleave off into it. 666',
    '2 Shrine Cleave: a shrine with no domain round it stands for five seconds and cuts at the enemy. 500 in all',
    '3 500% Fuga: an arrow of fire. 700 where it lands, and the enemy is thrown the length of the arena',
    '4 Shinjutsu Shrine: the shrine comes up out of the floor with no barrier at all and cuts a thousand times at 3 each. 3000 in all',
    '1 + R together: a 0.2 second shrine. 150, eight seconds between them',
    'The Vessel is a cursed technique of his own now: free, first card on the Cursed Technique screen. It is the moveset everybody starts with',
    'Cursed Judge (still Early Access): G is Deadly Sentencing, a real domain now. The Arbiter reads a count, the accused pleads Confess, Silence or Denial, and so do you (1, 2, 3 or click). Call it the same and the verdict bar at the top fills by a third. How the accused is standing gives it away more often than not',
    'Three thirds and you are handed the Executioner\'s Sword. G swings it: three circles, press each as the ring meets it. Your accuracy against the accused\'s: beat it and the cut kills, whatever health was left. Lose and the sword breaks'] },
  { v: '0.19v7', name: 'The Sorcerer Killer Clan and Cursed Tools', jp: '呪具', date: '4 Oct 2026', pic: 'toji', cap: 'The Sorcerer Killer clan, three tools on him', items: [
    'Cursed Tools: a new button under the Shop opens a reel that spins for one of four tools. Cursed Katana 40%, Dagger 40%, Playful Cloud 19.9%, Inverted Spear of Heaven 0.1%. Spins are free for now, and there is a card for each tool',
    'You carry one tool. It is used in place of a cursed technique, in Free Exploration and Training: its moves are on the first keys',
    'Cursed Katana: Katana Slash, 70. Dagger: Stab, 25 and then 70 more as it bleeds',
    'The dagger has a second form, the Dagger of the Demonly Holdings: Demonic Grab (40, then demons for 120 more) and Purgatory, a counter. Be hit while it is held and you come back at full health with the Deadly Demonic Katana, which kills in one cut, for ten seconds',
    'Playful Cloud: no moves, only strikes, 7 each, one every 0.2 seconds. Inverted Spear of Heaven: Inversion Stab for 450, and one strike every two seconds for 30',
    'The Sorcerer Killer clan: limited time, 0.01%, disaster grade. +300% health, +200% cursed tool damage, and you look like Sorcerer Killer',
    'It carries three tools at once: one in hand, one in the cursed spirit round his neck, one at his waist. T switches',
    'R is Deadly Counter: for three seconds anything that hits you dies on the spot',
    'It has no cursed energy: equipping it puts your cursed technique down, and equipping a technique gives the clan up'] },
  { v: '0.19v6', name: 'Early Access: Switcher Stitcher', jp: '拍手', date: '4 Oct 2026', pic: 'switcher', cap: 'Stitcher Punch', items: [
    'A second early-access technique: Switcher Stitcher (Clapping Brawler). It is on the Cursed Technique screen and in the Shop\'s Early Access tab',
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
    'Secret, Blindfolded Infinity clan only: press R and 2 while the domain is opening for a 0.2 second domain. The enemy is frozen for seven seconds, you are far faster, every hit is worth 7, and it ends on a Black Flash worth 250',
    'Awakened Projection: out on the street, Top Speed is now a straight sprint down the road instead of laps'] },
  { v: '0.19v3', name: 'Awakened CT', jp: '覚醒', date: '4 Oct 2026', pic: 'awakened', cap: 'Top Speed on the street', items: [
    'An AWAKEN CT button on the Cursed Technique screen, across from the talisman, opens a second menu of four awakened techniques',
    'Awakened Projection is the first: you fight, and walk Tokyo, as Frame Runner the cursed spirit',
    'Frame Breaker (1): one target, caught in a frame that breaks four times over',
    'Top Speed (2): twenty-four laps round the enemy, each quicker than the last. Afterwards you move far faster for nine seconds, and whatever you touch freezes for two',
    'Out on the street in Free Exploration, hold R and press 2 for Top Speed: passers-by and curses you brush past freeze where they stand',
    'Sonic Boom (3) and Mach 3 (4) round out the set',
    'It is free for now. Later it will take three Projection Frame v2, which the Heavenly Blade boss already drops one time in twenty',
    'Awakened Limitless, Awakened Ten Shadows and King of Curses\'s Mark are on the menu as coming soon'] },
  { v: '0.19v2', name: 'Early Access: Cursed Judge', jp: '審判', date: '4 Oct 2026', pic: 'judge', cap: 'Justice Served', items: [
    'A new early-access technique: Cursed Judge (The Judge), with the Defense Attorney\'s moves from another game',
    'His strikes are gavel strikes. The gavel is a size bigger with every strike of the chain, the second one raps twice, and each has its own sound',
    'Extended Swings (1): the gavel becomes a long hammer. Three swings, then a slam',
    'Justice Served (2): it grows to an absurd size and comes down, launching whatever is under it',
    'Judgement\'s Reach (3): the handle runs out across the arena and the head drops on the far end',
    'Pressing Charges (4): a rush into a kick, a second rush, and a swing that sets up the third strike',
    'Deadly Sentencing is on G. It is not built yet, so for now it does nothing',
    'The Shop has an Early Access tab at $2.99. It is not on sale yet, so the button does nothing and the technique can be equipped for free'] },
  { v: '0.19', name: 'Combat Update 2', jp: '昇拳', date: '4 Oct 2026', pic: 'combat2', cap: 'The Black Flash uppercut', items: [
    'Uppercut: hold jump while you throw the chain of strikes. You will not jump, and the last strike launches the enemy straight up',
    'Black Flash uppercut: as Vessel, press 3 once during the uppercut. No timing needed. It uses Divergent Fist\'s cooldown',
    'Black Flash slam: straight after a Black Flash uppercut, click once and press 3 once more. Vessel goes up after the enemy and brings it down for 300 damage',
    'Cursed Strikes in the air (1 while airborne, as Vessel): a dropkick loaded with cursed energy that grounds whatever it lands on, as in another game. 24 damage',
    'Blade Arm in the air (Transfiguration, 1 while airborne): he comes down on the point of the blade. 18 damage',
    'Mach in the air (Projection Sorcery, 4 while airborne): it charges, then he is on the enemy in an instant with impact frames. 150 damage',
    'Training: the awakening or domain is ready at all times, with no bar to fill and no cooldown',
    'Five more chapters in Season 3, 17 to 21: Perfect Preparation, The Heavenly Clan, The Fight Club, Tokyo No. 1 Colony, Deadly Sentencing',
    'Play as Heavenly Blade with a moveset of her own: Split Soul Katana, Spear Throw, Vanishing Step, Playful Cloud',
    'New bosses: Blazing Elder, Panda, Jackpot Gambler, Rotor Head and The Judge. In his court your technique is confiscated, and one touch of the Executioner\'s Sword is the end',
    'A story fight with a scene still to come can no longer be ended early by one huge hit'] },
  { v: '0.18', name: 'Season 3', jp: '死滅', date: '4 Oct 2026', pic: 'season3', cap: 'Keeper of the Queen calls The Queen down', items: [
    'The Play screen is sorted into seasons: S1, S2 and S3. Press one to see its chapters',
    'Story Mode carries on from the first chapter you have not finished',
    'Season 3 begins with four new chapters, 13 to 16: The Executioner, Blood and Speed, Keeper of the Queen, The Culling Game',
    'Play as Blood Brother against Frame Runner. Half-way through, the poison in his blood starts eating at Frame Runner',
    'New bosses with movesets of their own: Frame Runner (Projection Sorcery) and Keeper of the Queen (Katana Rush, The Queen, Cursed Energy Slash, Reverse Cursed Technique)',
    'New faces: Star Rage and Barrier Master. New places: the ruins of Tokyo and the Tombs of the Star Corridor',
    'Barrier Master sets out the eight rules of the Culling Game',
    'Chapters 1 and 2 now turn gold when finished, like the rest'] },
  { v: '0.17', name: 'Combat Update', jp: '戦闘', date: '4 Oct 2026', pic: 'combat', cap: 'Blindfolded Infinity against Sorcerer Killer', items: [
    'Down slam: throw the last strike of the chain while you are in the air (strike three times, jump, strike) and it slams the enemy into the floor for twice the finisher\'s damage',
    'Black Flash down slam: as Vessel, press 3 in the air and hit the Black Flash timing. It lands for three times a Black Flash',
    'Black Flash finisher: when a Black Flash is the killing blow, the enemy is held where it was hit while the sparks keep coming',
    'Five new chapters, 8 to 12: Hidden Inventory, Shibuya, Blood Brother, The King of Curses, The Last of Soul Shaper',
    'New bosses with movesets of their own: Sorcerer Killer, Blood Brother, Mahoraga and Soul Shaper\'s true shape. A new stage: Shibuya station',
    'Finished chapters are marked in gold on the Play screen, and finishing one pays 20 Cursed Tokens',
    'Transfiguration has a domain, Self-Embodiment of Perfection: inside it a touch leaves a mark, and the next blow on anything marked kills it. Its bar fills only with kills, three or four of them',
    'Chapter 11 is fairer: King of Curses has more health and opens Malevolent Shrine with G, Fuga hits harder (twice as hard inside the shrine), and Mahoraga has a quarter less health and adapts more slowly'] },
  { v: '0.16', name: 'The Shop', jp: '売店', date: '4 Oct 2026', pic: 'shop', cap: 'The Daily Shop', items: [
    'A Shop button on the right of the title screen, with your Cursed Tokens above it',
    'CT tickets and clan rolls cost 10 tokens a spin. Spins stay free for now',
    'The Daily Shop sells three rare techniques or clans, different every day',
    'Beating a curse pays 5 tokens, and a boss pays 15'] },
  { v: '0.15', name: 'Black Flash × Domain Update 2', jp: '結界', date: '4 Oct 2026', pic: 'void', cap: 'Unlimited Void, opened in a fight', items: [
    'Limitless: use Reversal: Red, then press R. Blue drags the enemy back onto your fist for a Black Flash worth 30% of its full health',
    'Transfiguration: land Idle Transfiguration (3), then press 2 for a Black Flash worth 60 damage',
    'Shrine with the King of Curses clan: Cleave (2), choke hold (R), then Dismantle (1) for a Black Flash worth 120 damage. Every move then waits 20 seconds',
    'A black barrier swells out from the caster as a domain opens, and shatters when it ends',
    'More to see inside both domains: horns, skulls and blood in Malevolent Shrine, stars and a ring of light in Unlimited Void',
    'Unlimited Void can be opened in a fight: Blindfolded Infinity clan with Limitless, press G. The enemy can do nothing while it is open',
    'Press G while your domain is open to let it go early'] },
  { v: '0.145v5', name: 'Domain Update 1', jp: '領域', date: '4 Oct 2026', pic: 'domain', cap: 'Malevolent Shrine opening', items: [
    'A Domain Expansion now opens with a slanted panel across the screen: the caster in close-up between the words DOMAIN and EXPANSION',
    'A dome of force bursts out from the caster, the panel shuts, and white floods in from the edges before the domain appears',
    'The fight freezes while it plays, and the caster cannot be interrupted',
    'Used by Malevolent Shrine (King of Curses clan with Shrine, press G) and by Blindfolded Infinity\'s Unlimited Void at the end of chapter 4',
    'This scroll: every update so far, with pictures'] },
  { v: '0.145v4', name: 'Blood Brother', jp: '赤血', date: '4 Oct 2026', pic: 'choso', cap: 'Blood Brother firing Piercing Blood', items: [
    'Limited time technique: Blood Brother (Blood Brother), 2.5% from the roll, gone after seven days',
    'The only technique that changes how you look: you fight and walk Tokyo as Blood Brother',
    'Moves: Slicing Exorcism, Flowing Red Scale, Supernova, Piercing Blood',
    'Touch controls for phones and tablets: a stick, Strike, Jump and Dash, and a hotbar you can tap',
    'The whole game can be saved as one file to send to a friend'] },
  { v: '0.145v3', name: 'Boss Update', jp: '特級', date: '4 Oct 2026', pic: 'boss', cap: 'Disaster Bloom raising Root Spikes', items: [
    'Every boss fights with a moveset of its own, listed under its health bar',
    'Disaster Bloom uses Disaster Plants, Soul Shaper uses Transfiguration, King of Curses uses Shrine',
    'New movesets for the Finger Bearer, Disaster Flame, Clapping Brawler, Rot Wing, Rot Maw and Heavenly Blade',
    'Some moves stay locked until the boss has been hurt',
    'New mode: Training, with a curse that never fights back'] },
  { v: '0.145v2', name: 'Clans', jp: '一族', date: '4 Oct 2026', pic: 'clan', cap: 'The clan draw', items: [
    'Draw a clan from three talismans: Straw Doll 40%, Shadow 40%, Blindfolded Infinity 10%, The Stitched One 5%, Heavenly 4.9%, King of Curses 0.1%',
    'A clan changes your health, damage and speed, and most have an ability on R',
    'Blindfolded Infinity warps to the cursor, Heavenly counters with a cursed tool, The Stitched One takes a beaten body, King of Curses chokes his enemy',
    'Die as King of Curses and you become a finger: whatever killed you eats it and becomes your vessel',
    'A card for every clan, to try one without drawing'] },
  { v: '0.145', name: 'Seven Chapters', jp: '七章', date: '3 Oct 2026', pic: 'chapters', cap: 'Frame Runner against Heavenly Blade in the mountains', items: [
    'Story Mode runs to chapter 7: The Strongest, Soul Shaper, The Goodwill Event, The Death Paintings',
    'A chapter select on the Play screen',
    'Tab or X skips a conversation',
    'Projection Sorcery: a far dash that leaves blue afterimages, and an awakening on G (the hair fix, then 24 punches)',
    'Heavenly Blade Fight appears on the Play screen while Projection Sorcery is equipped'] },
  { v: '0.141', name: 'The Vow', jp: '縛り', date: '3 Oct 2026', pic: 'vow', cap: 'King of Curses\'s innate domain', items: [
    'Chapter 3: play as Summoner against King of Curses',
    'King of Curses tears out the heart, and Vessel wakes among the bones of his innate domain',
    'The binding vow: Enchain',
    'The morgue with Blindfolded Infinity and The Healer, and Straw Doll arrives in Tokyo'] },
  { v: '0.14', name: 'Cursed Techniques', jp: '術式', date: '3 Oct 2026', pic: 'technique', cap: 'The technique roll', items: [
    'Roll the talisman for a technique: Ten Shadows 40%, Transfiguration 20%, Disaster Plants 20%, Limitless 10%, Projection Sorcery 5%, Shrine 5%',
    'Every technique has four moves of its own',
    'A card for every technique, to equip one without rolling'] },
  { v: '0.13', name: 'The School', jp: '呪霊', date: '3 Oct 2026', pic: 'school', cap: 'King of Curses against the Finger Bearer', items: [
    'Chapter 2: clear the school with Summoner and his Divine Dog',
    'A special grade boss: the Finger Bearer',
    'Impact frames, and King of Curses takes over with Dismantle, Cleave, Open and World Slash',
    'Heavier visuals for every move',
    'Story Mode gets its name, and Free Exploration is added'] },
  { v: '0.12', name: 'Tokyo', jp: '東京', date: '3 Oct 2026', pic: 'tokyo', cap: 'The streets of Tokyo', items: [
    'Blindfolded Infinity walks out after the first Black Flash',
    'Walk the streets of Tokyo, sense cursed energy and find Summoner',
    'More depth everywhere: an orbiting camera and solid buildings'] },
  { v: '0.11', name: 'Black Flash', jp: '黒閃', date: '3 Oct 2026', pic: 'fight', cap: 'The first Black Flash', items: [
    'Play opens a side-on arena fight as Vessel',
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
