import { loadGameData } from '../game/core/data-loader.js';
import { makeSampleDeck, validateDeck } from '../game/core/deck-builder.js';
import { setupGame, startTurn, rideFromPath, callFromHand, attackVanguard, endTurn } from '../game/core/fight-engine.js';
import { CIRCLES } from '../game/core/constants.js';
import { runSimpleAiTurn } from '../game/ai/simple-ai.js';
import { rollBanner } from '../game/gacha/gacha-engine.js';
import { claimOfflineSalary } from '../game/economy/salary-engine.js';
import { renderCards, renderField, renderLog, renderProfile } from './ui.js';

const el = {
  btnLoad: document.querySelector('#btnLoad'),
  btnStart: document.querySelector('#btnStart'),
  btnAi: document.querySelector('#btnAi'),
  btnGacha: document.querySelector('#btnGacha'),
  btnSalary: document.querySelector('#btnSalary'),
  profileBox: document.querySelector('#profileBox'),
  fieldBox: document.querySelector('#fieldBox'),
  logBox: document.querySelector('#logBox'),
  cardsBox: document.querySelector('#cardsBox')
};

let data = null;
let state = null;
let profile = {
  uid: 'local-player',
  name: 'Player',
  currency: { gem: 10000, coin: 0 },
  ownedCards: {
    'ACC-G0-STARTER-001': 4,
    'ACC-G1-MAGIC-001': 4,
    'ACC-G2-SHONEN-001': 4,
    'ACC-G3-MAGIC-ACE-001': 4,
    'ACC-G1-TRIG-CRIT-001': 8,
    'ACC-G1-TRIG-DRAW-001': 4,
    'ACC-G0-TRIG-HEAL-001': 4,
    'ACC-G3-TRIG-OVER-001': 1
  },
  pity: {},
  lastSalaryClaimAt: Date.now() - 3 * 3600000
};

function refresh() {
  renderProfile(profile, el.profileBox);
  renderField(state, el.fieldBox);
  renderLog(state, el.logBox);
}

el.btnLoad.addEventListener('click', async () => {
  data = await loadGameData();
  renderCards(data.cards, el.cardsBox);
  el.btnStart.disabled = false;
  el.btnGacha.disabled = false;
  el.btnSalary.disabled = false;
  refresh();
});

el.btnStart.addEventListener('click', () => {
  const deckA = makeSampleDeck(data.cardMap);
  const deckB = makeSampleDeck(data.cardMap);
  const check = validateDeck({ mainDeckIds: deckA.mainDeckIds, pathDeckIds: deckA.pathDeckIds, cardMap: data.cardMap });
  if (!check.ok) {
    alert(check.errors.join('\n'));
    return;
  }

  state = setupGame({
    cardMap: data.cardMap,
    playerA: { id: 'P1', name: 'Player', ...deckA },
    playerB: { id: 'AI', name: 'AI', ...deckB }
  });
  startTurn(state, 'P1');
  el.btnAi.disabled = false;

  // เล่นตัวอย่างฝั่งผู้เล่นแบบเร็ว: ride, call, attack, end
  rideFromPath(state, 'P1', 0);
  callFromHand(state, 'P1', 0, CIRCLES.FRONT_LEFT);
  callFromHand(state, 'P1', 0, CIRCLES.BACK_LEFT);
  attackVanguard(state, 'P1', CIRCLES.FRONT_LEFT, CIRCLES.BACK_LEFT);
  if (!state.winnerId) attackVanguard(state, 'P1', CIRCLES.VG, null);
  if (!state.winnerId) endTurn(state);
  refresh();
});

el.btnAi.addEventListener('click', () => {
  if (!state || state.winnerId) return;
  runSimpleAiTurn(state, 'AI');
  refresh();
});

el.btnGacha.addEventListener('click', () => {
  const result = rollBanner({ profile, banner: data.banners[0], cards: data.cards, count: 10 });
  if (!result.ok) alert(result.error);
  else alert(`ได้การ์ด:\n${result.rewards.map(c => `${c.rarity} ${c.name}`).join('\n')}`);
  refresh();
});

el.btnSalary.addEventListener('click', () => {
  const deck = makeSampleDeck(data.cardMap);
  const result = claimOfflineSalary({
    profile,
    cards: data.cards,
    salaryConfig: data.salary,
    activeDeckIds: [...deck.mainDeckIds, ...deck.pathDeckIds]
  });
  alert(`รับเงินเดือน: Coin +${result.coin}, Gem +${result.gem}`);
  refresh();
});

refresh();
