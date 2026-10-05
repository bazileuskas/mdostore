/* JUJUTSU UNLIMITEDS — boss movesets I: Mahito and Sukuna fight with the very techniques the player can roll (so does Hanami: see plants.js) */
(() => {
'use strict';

const B = JU.boss, T = JU.tech.TECH, TRANS = T.trans.moves, SHRINE = JU.sukuna.SM;

// (Hanami's Disaster Plants are in plants.js, with the rework of the technique itself)

// Transfiguration. Soul Isomer falls where he was standing when Mahito let it go, so the mark on the floor is the place to leave
const under = (o, p) => { const d = (p.x - o.x) * o.face; return d > -30 && d < 760 ? p.x : o.x + o.face * 340; };
B.kit('mahito', { tech: 'Transfiguration', col: '#78e6c8', glow: 'teal', scale: .8, moves: [
  { of: TRANS.strikes, cd: 4, max: 330, wind: .38, pre: 'hookWind' },
  { of: TRANS.crush, cd: 6, min: 300, max: 820, wind: .45, pre: 'divWind' },
  { of: TRANS.div, cd: 10, min: 140, max: 640, wind: .6, pre: 'kickWind', scale: .6 },
  { of: TRANS.manji, cd: 12, below: .75, max: 740, wind: .35, pre: 'crushWind', spot: [under, 210], then(o, p, c) { B.mark(c.spot, 210, .72, '#78e6c8'); } }
] });

// Shrine. He keeps the World Slash back until he has been made to work for it
B.kit('sukuna', { tech: 'Shrine', col: '#ff2440', glow: 'red', scale: .8, moves: [
  { of: SHRINE.strikes, cd: 5, min: 260, max: 920, wind: .5, pre: 'hookWind' },
  { of: SHRINE.crush, cd: 8, min: 150, max: 640, wind: .5, pre: 'kickWind', scale: .55 },
  { of: SHRINE.div, cd: 12, min: 300, wind: .3, pre: 'divWind', scale: .5 },
  { of: SHRINE.manji, cd: 16, below: .5, min: 200, wind: .3, pre: 'jab', scale: .5 }
] });
})();
