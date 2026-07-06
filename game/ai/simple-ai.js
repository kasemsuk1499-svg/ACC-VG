import { CIRCLES } from '../core/constants.js';
import { rideFromPath, callFromHand, attackVanguard, endTurn } from '../core/fight-engine.js';

export function runSimpleAiTurn(state, aiPlayerId) {
  const p = state.players[aiPlayerId];

  if (!p.normalRideUsed && p.hand.length > 0) {
    rideFromPath(state, aiPlayerId, 0);
  }

  const callTargets = [CIRCLES.FRONT_LEFT, CIRCLES.FRONT_RIGHT, CIRCLES.BACK_LEFT, CIRCLES.BACK_CENTER, CIRCLES.BACK_RIGHT];
  for (const circle of callTargets) {
    if (p.hand.length === 0) break;
    if (!p.rear[circle]) callFromHand(state, aiPlayerId, 0, circle);
  }

  attackVanguard(state, aiPlayerId, CIRCLES.FRONT_LEFT, CIRCLES.BACK_LEFT);
  if (!state.winnerId) attackVanguard(state, aiPlayerId, CIRCLES.VG, CIRCLES.BACK_CENTER);
  if (!state.winnerId) attackVanguard(state, aiPlayerId, CIRCLES.FRONT_RIGHT, CIRCLES.BACK_RIGHT);

  if (!state.winnerId) endTurn(state);
  return state;
}
