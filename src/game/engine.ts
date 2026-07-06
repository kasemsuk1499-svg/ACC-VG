import { cards, cardsById, starterDeckIds, type CardDefinition, type Trigger } from "../cards";

export interface FighterState {
  name: string;
  deck: CardDefinition[];
  hand: CardDefinition[];
  damage: CardDefinition[];
  drop: CardDefinition[];
  soul: CardDefinition[];
  rearGuards: CardDefinition[];
  vanguard: CardDefinition;
  rideGrade: number;
  powerBonus: number;
  criticalBonus: number;
}

export interface BattleState {
  turn: number;
  active: "player" | "ai";
  player: FighterState;
  ai: FighterState;
  log: string[];
  winner?: "player" | "ai";
}

const gradeZero = cards.find((card) => card.grade === 0)!;

export function buildDeck(ids = starterDeckIds) {
  const expanded = [...ids];
  while (expanded.length < 40) expanded.push(starterDeckIds[expanded.length % starterDeckIds.length]);
  return shuffle(expanded.map((id) => cardsById.get(id) ?? gradeZero));
}

export function createBattle(playerName: string, ownedIds: string[]): BattleState {
  const playerDeck = buildDeck(ownedIds.length >= 10 ? ownedIds : starterDeckIds);
  const aiDeck = buildDeck(starterDeckIds.slice().reverse());
  const playerVanguard = drawFirstGradeZero(playerDeck);
  const aiVanguard = drawFirstGradeZero(aiDeck);
  return {
    turn: 1,
    active: "player",
    player: {
      name: playerName,
      deck: playerDeck,
      hand: draw(playerDeck, 5),
      damage: [],
      drop: [],
      soul: [],
      rearGuards: [],
      vanguard: playerVanguard,
      rideGrade: 0,
      powerBonus: 0,
      criticalBonus: 0,
    },
    ai: {
      name: "AI Rival",
      deck: aiDeck,
      hand: draw(aiDeck, 5),
      damage: [],
      drop: [],
      soul: [],
      rearGuards: [],
      vanguard: aiVanguard,
      rideGrade: 0,
      powerBonus: 0,
      criticalBonus: 0,
    },
    log: ["Stand up. Vanguard!"],
  };
}

export function playTurn(state: BattleState): BattleState {
  if (state.winner) return state;
  const next = structuredCloneBattle(state);
  const actor = next.active === "player" ? next.player : next.ai;
  const defender = next.active === "player" ? next.ai : next.player;
  actor.powerBonus = 0;
  actor.criticalBonus = 0;
  next.log.unshift(`Turn ${next.turn}: ${actor.name}'s turn.`);
  actor.hand.push(...draw(actor.deck, 1));
  next.log.unshift(`${actor.name} draws.`);
  ride(actor, next.log);
  callRearGuards(actor, next.log);
  attackWithVanguard(actor, defender, next.log);
  for (const rear of actor.rearGuards.slice(0, 2)) {
    if (next.winner) break;
    resolveAttack(actor, defender, rear, false, next.log);
    checkWinner(next);
  }
  checkWinner(next);
  next.active = next.active === "player" ? "ai" : "player";
  next.turn += next.active === "player" ? 1 : 0;
  return next;
}

export function pullGacha(amount: number) {
  const pool = cards.flatMap((card) => {
    const weight = card.rarity === "SSR" ? 1 : card.rarity === "SR" ? 3 : card.rarity === "RR" ? 7 : card.rarity === "R" ? 14 : 24;
    return Array.from({ length: weight }, () => card);
  });
  return Array.from({ length: amount }, () => pool[Math.floor(Math.random() * pool.length)]);
}

function ride(actor: FighterState, log: string[]) {
  const nextGrade = Math.min(actor.rideGrade + 1, 3);
  const rideIndex = actor.hand.findIndex((card) => card.grade === nextGrade);
  if (rideIndex < 0) return;
  const [nextVanguard] = actor.hand.splice(rideIndex, 1);
  actor.soul.push(actor.vanguard);
  actor.vanguard = nextVanguard;
  actor.rideGrade = nextGrade;
  log.unshift(`${actor.name} rides ${nextVanguard.name}.`);
  applySkills(actor, nextVanguard, "onRide", log);
}

function callRearGuards(actor: FighterState, log: string[]) {
  while (actor.rearGuards.length < 3) {
    const index = actor.hand.findIndex((card) => card.grade <= actor.rideGrade && card.grade > 0);
    if (index < 0) return;
    const [called] = actor.hand.splice(index, 1);
    actor.rearGuards.push(called);
    log.unshift(`${actor.name} calls ${called.name}.`);
    applySkills(actor, called, "onCall", log);
  }
}

function attackWithVanguard(actor: FighterState, defender: FighterState, log: string[]) {
  applySkills(actor, actor.vanguard, "attack", log);
  resolveAttack(actor, defender, actor.vanguard, true, log);
  const checks = actor.rideGrade >= 3 ? 2 : 1;
  for (let i = 0; i < checks; i += 1) {
    const [checked] = draw(actor.deck, 1);
    if (!checked) continue;
    actor.hand.push(checked);
    log.unshift(`${actor.name} drive checks ${checked.name}${checked.trigger ? ` (${checked.trigger})` : ""}.`);
    if (checked.trigger) resolveTrigger(actor, defender, checked.trigger, log);
  }
}

function resolveAttack(actor: FighterState, defender: FighterState, attacker: CardDefinition, isVanguard: boolean, log: string[]) {
  const attackPower = attacker.power + actor.powerBonus + (isVanguard ? actor.vanguard.grade * 1000 : 0);
  const defensePower = defender.vanguard.power + defender.powerBonus;
  if (attackPower >= defensePower) {
    const critical = attacker.critical + actor.criticalBonus;
    log.unshift(`${attacker.name} hits for ${critical} damage.`);
    for (let i = 0; i < critical; i += 1) damageCheck(defender, actor, log);
  } else {
    log.unshift(`${attacker.name} attacks, but ${defender.name} defends.`);
  }
  actor.powerBonus = 0;
  actor.criticalBonus = 0;
}

function damageCheck(defender: FighterState, attacker: FighterState, log: string[]) {
  const [damage] = draw(defender.deck, 1);
  if (!damage) return;
  defender.damage.push(damage);
  log.unshift(`${defender.name} damage checks ${damage.name}${damage.trigger ? ` (${damage.trigger})` : ""}.`);
  if (damage.trigger) resolveTrigger(defender, attacker, damage.trigger, log);
}

function resolveTrigger(owner: FighterState, opponent: FighterState, trigger: Trigger, log: string[]) {
  owner.powerBonus += trigger === "over" ? 100000000 : 10000;
  if (trigger === "critical") owner.criticalBonus += 1;
  if (trigger === "draw") owner.hand.push(...draw(owner.deck, 1));
  if (trigger === "front") owner.powerBonus += 5000;
  if (trigger === "heal" && owner.damage.length >= opponent.damage.length && owner.damage.length > 0) {
    owner.drop.push(owner.damage.pop()!);
    log.unshift(`${owner.name} heals 1 damage.`);
  }
}

function applySkills(actor: FighterState, card: CardDefinition, timing: string, log: string[]) {
  for (const skill of card.skills.filter((item) => item.timing === timing)) {
    if (skill.engineEffect === "gainPower") actor.powerBonus += skill.amount ?? 0;
    if (skill.engineEffect === "draw") actor.hand.push(...draw(actor.deck, skill.amount ?? 1));
    if (skill.engineEffect === "soulCharge") actor.soul.push(...draw(actor.deck, skill.amount ?? 1));
    if (skill.engineEffect === "extraCritical") {
      actor.powerBonus += 10000;
      actor.criticalBonus += skill.amount ?? 1;
    }
    log.unshift(`${card.name}: ${skill.name}.`);
  }
}

function draw(deck: CardDefinition[], amount: number) {
  return deck.splice(0, amount);
}

function drawFirstGradeZero(deck: CardDefinition[]) {
  const index = deck.findIndex((card) => card.grade === 0);
  const [card] = deck.splice(index, 1);
  return card ?? gradeZero;
}

function shuffle<T>(items: T[]) {
  return items
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function checkWinner(state: BattleState) {
  if (state.player.damage.length >= 6) state.winner = "ai";
  if (state.ai.damage.length >= 6) state.winner = "player";
}

function structuredCloneBattle(state: BattleState): BattleState {
  return {
    ...state,
    player: cloneFighter(state.player),
    ai: cloneFighter(state.ai),
    log: [...state.log],
  };
}

function cloneFighter(fighter: FighterState): FighterState {
  return {
    ...fighter,
    deck: [...fighter.deck],
    hand: [...fighter.hand],
    damage: [...fighter.damage],
    drop: [...fighter.drop],
    soul: [...fighter.soul],
    rearGuards: [...fighter.rearGuards],
  };
}
