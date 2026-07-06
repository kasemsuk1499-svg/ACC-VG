import { CIRCLES, DECK_RULES, EVENT_TIMINGS, FRONT_ROW } from './constants.js';
import { draw, runSkills, clearBuffs, getCurrentPower, getCurrentCritical, addTempBuff } from './skill-engine.js';

let instanceCounter = 0;
function makeRef(cardId) {
  instanceCounter += 1;
  return { cardId, instanceId: `${cardId}#${instanceCounter}`, tempBuffs: [] };
}

export function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createPlayerState({ id, name, mainDeckIds, pathDeckIds }) {
  return {
    id,
    name,
    deck: shuffle(mainDeckIds.map(makeRef)),
    pathDeck: pathDeckIds.map(makeRef),
    hand: [],
    damage: [],
    drop: [],
    soul: [],
    bind: [],
    vanguard: null,
    rear: {
      [CIRCLES.FRONT_LEFT]: null,
      [CIRCLES.FRONT_RIGHT]: null,
      [CIRCLES.BACK_LEFT]: null,
      [CIRCLES.BACK_CENTER]: null,
      [CIRCLES.BACK_RIGHT]: null
    },
    usedOncePerFight: {},
    normalRideUsed: false,
    attacksThisTurn: 0,
    lostByDeckOut: false
  };
}

export function setupGame({ cardMap, playerA, playerB }) {
  const state = {
    cardMap,
    turnPlayerId: playerA.id,
    opponentId: playerB.id,
    phase: 'setup',
    turn: 1,
    log: [],
    winnerId: null,
    players: {
      [playerA.id]: createPlayerState(playerA),
      [playerB.id]: createPlayerState(playerB)
    }
  };

  for (const pid of [playerA.id, playerB.id]) {
    const p = state.players[pid];
    const g0Index = p.pathDeck.findIndex(ref => cardMap[ref.cardId]?.grade === 0);
    p.vanguard = p.pathDeck.splice(g0Index, 1)[0];
    draw(state, pid, DECK_RULES.startingHand);
    state.log.push(`${p.name} เริ่มด้วย ${cardMap[p.vanguard.cardId].name}`);
  }

  state.phase = 'ride';
  return state;
}

export function startTurn(state, playerId = state.turnPlayerId) {
  const p = state.players[playerId];
  p.normalRideUsed = false;
  p.attacksThisTurn = 0;
  clearBuffs(state, playerId, 'endOfTurn');
  standAll(p);
  draw(state, playerId, 1);
  runSkills(state, EVENT_TIMINGS.START_TURN, playerId, {});
  state.phase = 'ride';
  state.log.push(`เทิร์นของ ${p.name}`);
}

function standAll(player) {
  const units = [player.vanguard, ...Object.values(player.rear).filter(Boolean)];
  units.forEach(unit => { unit.rested = false; });
}

export function rideFromPath(state, playerId, handIndexToDiscard = 0) {
  const p = state.players[playerId];
  if (p.normalRideUsed) return { ok: false, error: 'เทิร์นนี้ Ride ไปแล้ว' };
  if (p.hand.length <= handIndexToDiscard) return { ok: false, error: 'ไม่มีการ์ดให้ทิ้งเป็นค่าใช้จ่าย' };

  const currentGrade = state.cardMap[p.vanguard.cardId]?.grade ?? 0;
  const nextIndex = p.pathDeck.findIndex(ref => state.cardMap[ref.cardId]?.grade === currentGrade + 1);
  if (nextIndex < 0) return { ok: false, error: 'ไม่มี Grade ถัดไปใน Anime Path Deck' };

  p.drop.push(...p.hand.splice(handIndexToDiscard, 1));
  const oldVanguard = p.vanguard;
  const next = p.pathDeck.splice(nextIndex, 1)[0];
  p.soul.push(oldVanguard);
  p.vanguard = next;
  p.normalRideUsed = true;

  state.log.push(`${p.name} Ride เป็น ${state.cardMap[next.cardId].name}`);
  runSkills(state, EVENT_TIMINGS.ON_RIDE_BY, playerId, { oldVanguard, newVanguard: next });
  return { ok: true };
}

export function resonanceRideFromHand(state, playerId, handIndex) {
  const p = state.players[playerId];
  if (p.normalRideUsed) return { ok: false, error: 'เทิร์นนี้ Ride ไปแล้ว' };
  const target = p.hand[handIndex];
  if (!target) return { ok: false, error: 'ไม่พบการ์ดในมือ' };
  const targetCard = state.cardMap[target.cardId];
  const vgCard = state.cardMap[p.vanguard.cardId];
  if (targetCard.id !== vgCard.id || !vgCard.resonanceRide) {
    return { ok: false, error: 'ต้องเป็นการ์ดชื่อเดียวกับ Vanguard และมี resonanceRide' };
  }

  p.hand.splice(handIndex, 1);
  p.soul.push(p.vanguard);
  p.vanguard = target;
  p.normalRideUsed = true;
  state.log.push(`${p.name} Resonance Ride!`);
  runSkills(state, EVENT_TIMINGS.ON_RESONANCE_RIDE, playerId, { newVanguard: target });
  return { ok: true };
}

export function callFromHand(state, playerId, handIndex, circle) {
  const p = state.players[playerId];
  const cardRef = p.hand[handIndex];
  if (!cardRef) return { ok: false, error: 'ไม่พบการ์ดในมือ' };
  if (!Object.prototype.hasOwnProperty.call(p.rear, circle)) return { ok: false, error: 'circle ไม่ถูกต้อง' };
  if (p.rear[circle]) p.drop.push(p.rear[circle]);
  p.rear[circle] = cardRef;
  p.hand.splice(handIndex, 1);
  state.log.push(`${p.name} Call ${state.cardMap[cardRef.cardId].name} ลง ${circle}`);
  runSkills(state, EVENT_TIMINGS.ON_PLACED, playerId, { placedCircle: circle, placedUnit: cardRef });
  return { ok: true };
}

export function attackVanguard(state, playerId, attackerCircle, boostCircle = null) {
  const opponentId = getOpponentId(state, playerId);
  const p = state.players[playerId];
  const op = state.players[opponentId];

  const attacker = attackerCircle === CIRCLES.VG ? p.vanguard : p.rear[attackerCircle];
  if (!attacker) return { ok: false, error: 'ไม่มีตัวโจมตี' };
  if (attacker.rested) return { ok: false, error: 'ตัวนี้โจมตีไปแล้ว' };

  const booster = boostCircle ? p.rear[boostCircle] : null;
  runSkills(state, EVENT_TIMINGS.ON_ATTACK, playerId, { attacker, attackerCircle, target: op.vanguard });

  if (booster) {
    runSkills(state, EVENT_TIMINGS.ON_BOOST, playerId, { attacker, booster, boostedUnit: attacker });
  }

  let attackPower = getCurrentPower(state, playerId, attacker);
  if (booster) attackPower += getCurrentPower(state, playerId, booster);
  const defensePower = getCurrentPower(state, opponentId, op.vanguard);

  attacker.rested = true;
  if (booster) booster.rested = true;
  p.attacksThisTurn += 1;

  const driveLogs = attackerCircle === CIRCLES.VG ? driveCheck(state, playerId) : [];
  attackPower = getCurrentPower(state, playerId, attacker) + (booster ? getCurrentPower(state, playerId, booster) : 0);
  const hit = attackPower >= defensePower;

  state.log.push(`โจมตี ${attackPower} vs ${defensePower} → ${hit ? 'Hit' : 'No Hit'}`);
  if (hit) {
    const crit = getCurrentCritical(state, playerId, attacker);
    for (let i = 0; i < crit; i += 1) damageCheck(state, opponentId, playerId);
    runSkills(state, EVENT_TIMINGS.ON_HIT, playerId, { attacker, target: op.vanguard });
  }

  clearBuffs(state, playerId, 'endOfBattle');
  checkWinner(state);
  return { ok: true, hit, driveLogs };
}

export function driveCheck(state, playerId) {
  const p = state.players[playerId];
  const drive = Math.max(0, state.cardMap[p.vanguard.cardId]?.drive || 1);
  const logs = [];
  for (let i = 0; i < drive; i += 1) {
    const cardRef = p.deck.shift();
    if (!cardRef) {
      p.lostByDeckOut = true;
      break;
    }
    const card = state.cardMap[cardRef.cardId];
    logs.push(`Drive Check: ${card.name}${card.trigger ? ` [${card.trigger}]` : ''}`);
    state.log.push(logs[logs.length - 1]);
    resolveTrigger(state, playerId, cardRef, 'drive');
    if (card.trigger !== 'OVER') p.hand.push(cardRef);
  }
  return logs;
}

export function damageCheck(state, damagedPlayerId, attackerPlayerId) {
  const p = state.players[damagedPlayerId];
  const cardRef = p.deck.shift();
  if (!cardRef) {
    p.lostByDeckOut = true;
    return;
  }
  const card = state.cardMap[cardRef.cardId];
  state.log.push(`Damage Check ${p.name}: ${card.name}${card.trigger ? ` [${card.trigger}]` : ''}`);
  resolveTrigger(state, damagedPlayerId, cardRef, 'damage', attackerPlayerId);
  if (card.trigger !== 'OVER') p.damage.push({ ...cardRef, faceDown: false });
}

export function resolveTrigger(state, playerId, cardRef, source, attackerPlayerId = null) {
  const p = state.players[playerId];
  const card = state.cardMap[cardRef.cardId];
  if (!card.trigger) return;

  const bestUnit = p.vanguard;
  if (card.trigger === 'CRIT') {
    addTempBuff(state, bestUnit, { power: card.triggerPower || 10000, critical: 1, until: 'endOfTurn' });
  }
  if (card.trigger === 'DRAW') {
    draw(state, playerId, 1);
    addTempBuff(state, bestUnit, { power: card.triggerPower || 10000, until: 'endOfTurn' });
  }
  if (card.trigger === 'HEAL') {
    const opponent = state.players[attackerPlayerId || getOpponentId(state, playerId)];
    if (p.damage.length >= opponent.damage.length && p.damage.length > 0) {
      p.drop.push(p.damage.pop());
      state.log.push(`${p.name} Heal 1 damage`);
    }
    addTempBuff(state, bestUnit, { power: card.triggerPower || 10000, until: 'endOfTurn' });
  }
  if (card.trigger === 'FRONT') {
    for (const circle of FRONT_ROW) {
      const unit = circle === CIRCLES.VG ? p.vanguard : p.rear[circle];
      if (unit) addTempBuff(state, unit, { power: card.triggerPower || 10000, until: 'endOfTurn' });
    }
  }
  if (card.trigger === 'OVER') {
    p.bind.push(cardRef);
    draw(state, playerId, 1);
    addTempBuff(state, bestUnit, { power: card.triggerPower || 100000000, until: 'endOfTurn' });
    if (source === 'damage') state.log.push('OVER จาก Damage: ไม่รับดาเมจใบนี้');
    if (source === 'drive') state.log.push('OVER จาก Drive: เปิดเอฟเฟกต์พิเศษของการ์ดได้');
  }
}

export function endTurn(state) {
  const current = state.turnPlayerId;
  clearBuffs(state, current, 'endOfTurn');
  const next = getOpponentId(state, current);
  state.turnPlayerId = next;
  state.opponentId = current;
  state.turn += 1;
  startTurn(state, next);
}

export function getOpponentId(state, playerId) {
  return Object.keys(state.players).find(id => id !== playerId);
}

export function checkWinner(state) {
  for (const [pid, p] of Object.entries(state.players)) {
    const opponentId = getOpponentId(state, pid);
    if (p.damage.length >= DECK_RULES.damageLose || p.lostByDeckOut) {
      state.winnerId = opponentId;
      state.log.push(`${state.players[opponentId].name} ชนะ!`);
    }
  }
}
