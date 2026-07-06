import { FRONT_ROW } from './constants.js';

function getCard(state, playerId, cardRef) {
  if (!cardRef) return null;
  return state.cardMap[cardRef.cardId || cardRef.id] || null;
}

function hasTag(card, tag) {
  return card?.styleTags?.includes(tag) || card?.styleTags?.includes('ANY');
}

function canPayCost(state, playerId, costs = []) {
  const p = state.players[playerId];
  return costs.every(cost => {
    if (cost.type === 'counterBlast') return p.damage.filter(d => !d.faceDown).length >= cost.value;
    if (cost.type === 'soulBlast') return p.soul.length >= cost.value;
    if (cost.type === 'discard') return p.hand.length >= cost.value;
    return true;
  });
}

function payCost(state, playerId, costs = []) {
  const p = state.players[playerId];
  for (const cost of costs) {
    if (cost.type === 'counterBlast') {
      let paid = 0;
      for (const dmg of p.damage) {
        if (!dmg.faceDown && paid < cost.value) {
          dmg.faceDown = true;
          paid += 1;
        }
      }
    }
    if (cost.type === 'soulBlast') {
      p.drop.push(...p.soul.splice(0, cost.value));
    }
    if (cost.type === 'discard') {
      p.drop.push(...p.hand.splice(0, cost.value));
    }
  }
}

function conditionPasses(state, playerId, sourceRef, skill, ctx) {
  const cond = skill.condition || {};
  const p = state.players[playerId];
  const sourceCard = getCard(state, playerId, sourceRef);
  const vanguardCard = getCard(state, playerId, p.vanguard);

  if (cond.vanguardHasTag && !hasTag(vanguardCard, cond.vanguardHasTag)) return false;
  if (cond.thisIsVanguard && p.vanguard?.instanceId !== sourceRef.instanceId) return false;
  if (cond.thisIsAttacker && ctx.attacker?.instanceId !== sourceRef.instanceId) return false;
  if (cond.sourceHasTag && !hasTag(sourceCard, cond.sourceHasTag)) return false;
  return true;
}

export function draw(state, playerId, count = 1) {
  const p = state.players[playerId];
  for (let i = 0; i < count; i += 1) {
    const top = p.deck.shift();
    if (!top) {
      p.lostByDeckOut = true;
      break;
    }
    p.hand.push(top);
  }
}

export function applyEffect(state, playerId, sourceRef, effect, ctx = {}) {
  const p = state.players[playerId];
  if (effect.type === 'draw') draw(state, playerId, effect.value || 1);

  if (effect.type === 'power') {
    const target = resolveTarget(state, playerId, sourceRef, effect.target, ctx);
    if (target) addTempBuff(state, target, { power: effect.value || 0, until: effect.until || 'endOfTurn' });
  }

  if (effect.type === 'critical') {
    const target = resolveTarget(state, playerId, sourceRef, effect.target, ctx);
    if (target) addTempBuff(state, target, { critical: effect.value || 0, until: effect.until || 'endOfTurn' });
  }

  if (effect.type === 'frontRowPower') {
    for (const circle of FRONT_ROW) {
      const unit = circle === 'vanguard' ? p.vanguard : p.rear[circle];
      if (unit) addTempBuff(state, unit, { power: effect.value || 0, until: effect.until || 'endOfTurn' });
    }
  }

  if (effect.type === 'counterCharge') {
    let charged = 0;
    for (const dmg of p.damage) {
      if (dmg.faceDown && charged < effect.value) {
        dmg.faceDown = false;
        charged += 1;
      }
    }
  }
}

function resolveTarget(state, playerId, sourceRef, target, ctx) {
  if (target === 'self') return sourceRef;
  if (target === 'attacker') return ctx.attacker;
  if (target === 'boostedUnit') return ctx.boostedUnit || ctx.attacker;
  if (target === 'vanguard') return state.players[playerId].vanguard;
  return sourceRef;
}

export function addTempBuff(state, unitRef, buff) {
  if (!unitRef.tempBuffs) unitRef.tempBuffs = [];
  unitRef.tempBuffs.push(buff);
}

export function getCurrentPower(state, playerId, unitRef) {
  const card = getCard(state, playerId, unitRef);
  const buffs = unitRef?.tempBuffs || [];
  return (card?.power || 0) + buffs.reduce((sum, buff) => sum + (buff.power || 0), 0);
}

export function getCurrentCritical(state, playerId, unitRef) {
  const card = getCard(state, playerId, unitRef);
  const buffs = unitRef?.tempBuffs || [];
  return (card?.critical || 1) + buffs.reduce((sum, buff) => sum + (buff.critical || 0), 0);
}

export function runSkills(state, eventName, playerId, ctx = {}) {
  const p = state.players[playerId];
  const sources = [p.vanguard, ...Object.values(p.rear).filter(Boolean)];
  const logs = [];

  for (const sourceRef of sources) {
    const sourceCard = getCard(state, playerId, sourceRef);
    for (const skill of sourceCard?.skills || []) {
      if (skill.timing !== eventName) continue;
      const key = `${sourceRef.instanceId}:${skill.id}`;
      if (skill.oncePerFight && p.usedOncePerFight[key]) continue;
      if (!conditionPasses(state, playerId, sourceRef, skill, ctx)) continue;
      if (!canPayCost(state, playerId, skill.cost)) continue;

      payCost(state, playerId, skill.cost);
      for (const effect of skill.effects || []) applyEffect(state, playerId, sourceRef, effect, ctx);
      if (skill.oncePerFight) p.usedOncePerFight[key] = true;
      logs.push(`${sourceCard.name}: ${skill.name}`);
    }
  }
  state.log.push(...logs);
  return logs;
}

export function clearBuffs(state, playerId, until) {
  const p = state.players[playerId];
  const units = [p.vanguard, ...Object.values(p.rear).filter(Boolean)];
  for (const unit of units) {
    unit.tempBuffs = (unit.tempBuffs || []).filter(buff => buff.until !== until);
  }
}
