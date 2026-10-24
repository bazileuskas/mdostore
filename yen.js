/* JUJUTSU UNLIMITEDS — Build 0.16v1: YEN. A second currency, apart from the Cursed Tokens: what a sorcerer is paid in the city like anybody
   else, and pays for train tickets with (metro.js). Exorcising pays it out on the street, more for worse curses; raids, secret bosses and
   Shoko's errands pay it too. Everybody starts with ¥3,000. It has its own save ('ju.yen'), which follows the account like the rest do.
   Also here, the ticket he holds: one at a time, and it is a fare: it takes him to any stop that costs that much or less. The ticket gates
   take it on the way in and keep the fare of the ride he is on until he goes out through the gates at the other end.
   The team's account rides for nothing: it goes through the gates without a ticket and the machines charge it nothing */
(() => {
'use strict';

const E = JU.eng, sfx = JU.sfx;
const START = 3000;
const Y = { y: START, tk: 0, ride: 0, got: 0 };    // yen; the ticket held (its fare; 0 none); the fare of the ride he is on; earned in all
try { Object.assign(Y, JSON.parse(localStorage.getItem('ju.yen') || '{}')); } catch (e) {}
const dev = () => !!(JU.account && JU.account.dev);
const fmt = n => '¥' + Math.round(n).toLocaleString('en-US');
const save = () => { try { localStorage.setItem('ju.yen', JSON.stringify(Y)); } catch (e) {} paint(); };

// what an exorcism out on the street pays: by grade, and anything with a whole kit of moves of its own is a special grade's fee
const BOUNTY = { grunt: 800, brute: 1500, warped: 1000, warped2: 1200, ruin: 3000, finger: 8000, hei: 900, kukuru: 2500 };
const fee = kind => BOUNTY[kind] || (JU.fights.DEFS[kind] && JU.fights.DEFS[kind].kit ? 12000 : 1000);

/* ---------- on screen: the purse on the street, and the title's second line under the tokens ---------- */
const hud = document.createElement('div');
hud.className = 'yenhud'; hud.innerHTML = '<b></b><span></span><i></i>';
E.root.appendChild(hud);
let popT = 0;
function paint() {
  hud.querySelector('b').textContent = fmt(Y.y);
  hud.querySelector('span').textContent = dev() ? 'Team account · rides free' : Y.ride ? 'On a ' + fmt(Y.ride) + ' ride' : Y.tk ? 'Ticket · ' + fmt(Y.tk) : 'No ticket';
  hud.classList.toggle('tk', !!(Y.tk || Y.ride || dev()));
  const w = document.querySelector('#yenWallet b');
  if (w) w.textContent = Math.round(Y.y).toLocaleString('en-US');
}
function pop(text) {                                  // what was just paid in or out, rising off the purse
  const i = hud.querySelector('i');
  i.textContent = text; i.classList.remove('go'); void i.offsetWidth; i.classList.add('go');
  clearTimeout(popT); popT = setTimeout(() => i.classList.remove('go'), 1600);
}

function earn(n, quiet) {
  n = Math.round(n); if (!(n > 0)) return;
  Y.y += n; Y.got += n; save();
  if (!quiet) { pop('+' + fmt(n)); sfx.tick(4); }
}
function spend(n) {
  if (dev()) return true;
  if (Y.y < n) return false;
  Y.y -= n; save(); pop('−' + fmt(n));
  return true;
}
// a ticket from the machine: for the fare chosen. One is held at a time, so buying another hands the first back first
function buy(fare) {
  const back = Y.tk;
  if (!dev() && Y.y + back < fare) return false;
  if (!dev()) Y.y += back - fare;
  Y.tk = fare; save(); pop('Ticket · ' + fmt(fare));
  return true;
}
// through the gates: in takes the ticket (the team's account goes in on a pass that covers anywhere); out ends the ride
function enter() {
  if (Y.ride) return true;                           // (already on one: walking back and forth inside the gates is not a new ride)
  if (dev()) { Y.ride = 99999; save(); return true; }
  if (!Y.tk) return false;
  Y.ride = Y.tk; Y.tk = 0; save();
  return true;
}
function exit() { if (Y.ride) { Y.ride = 0; save(); } }

paint();
JU.yen = { fmt, earn, spend, buy, enter, exit, fee, paint, START,
  bounty(kind) { earn(fee(kind)); },
  get y() { return Y.y; }, get ticket() { return Y.tk; }, get ride() { return Y.ride; }, get free() { return dev(); },
  get state() { return Object.assign({}, Y); } };
})();
