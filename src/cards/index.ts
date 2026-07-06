import { card as shonenG0Spark } from "./shonen-g0-spark";
import { card as shonenG1Boost } from "./shonen-g1-boost";
import { card as shonenG2Striker } from "./shonen-g2-striker";
import { card as shonenG3Astral } from "./shonen-g3-astral";
import { card as spiritG0Heal } from "./spirit-g0-heal";
import { card as spiritG1Lantern } from "./spirit-g1-lantern";
import { card as mechaG0Front } from "./mecha-g0-front";
import { card as mechaG3Railgun } from "./mecha-g3-railgun";
import { card as stageG0Crit } from "./stage-g0-crit";
import { card as stageG3Duet } from "./stage-g3-duet";
import { card as shadowG1Guard } from "./shadow-g1-guard";
import { card as shadowG3Eclipse } from "./shadow-g3-eclipse";

export type Nation =
  | "Shonen Nova"
  | "Spirit Court"
  | "Mecha Orbit"
  | "Mystic Stage"
  | "Shadow Pact";

export type Rarity = "C" | "R" | "RR" | "SR" | "SSR";
export type Trigger = "critical" | "draw" | "heal" | "front" | "over";
export type SkillTiming =
  | "onRide"
  | "onCall"
  | "attack"
  | "boost"
  | "driveCheck"
  | "damageCheck"
  | "guardian"
  | "gachaReveal";

export interface CardSkill {
  id: string;
  name: string;
  timing: SkillTiming;
  cost?: string;
  effect: string;
  engineEffect:
    | "gainPower"
    | "draw"
    | "soulCharge"
    | "counterCharge"
    | "extraCritical"
    | "healOne"
    | "retireRear"
    | "guardBoost"
    | "none";
  amount?: number;
}

export interface CardDefinition {
  id: string;
  name: string;
  anime: string;
  nation: Nation;
  grade: 0 | 1 | 2 | 3;
  power: number;
  shield: number;
  critical: number;
  rarity: Rarity;
  trigger?: Trigger;
  flavor: string;
  art: string;
  cutscene?: string;
  attackAnimation?: "slash" | "beam" | "impact" | "stage" | "shadow";
  skills: CardSkill[];
}

export const cards: CardDefinition[] = [
  shonenG0Spark,
  shonenG1Boost,
  shonenG2Striker,
  shonenG3Astral,
  spiritG0Heal,
  spiritG1Lantern,
  mechaG0Front,
  mechaG3Railgun,
  stageG0Crit,
  stageG3Duet,
  shadowG1Guard,
  shadowG3Eclipse,
];

export const cardsById = new Map(cards.map((card) => [card.id, card]));

export const starterDeckIds = [
  "shonen-g0-spark",
  "spirit-g0-heal",
  "mecha-g0-front",
  "stage-g0-crit",
  "shonen-g1-boost",
  "shonen-g1-boost",
  "spirit-g1-lantern",
  "shadow-g1-guard",
  "shonen-g2-striker",
  "shonen-g2-striker",
  "shonen-g3-astral",
  "mecha-g3-railgun",
  "stage-g3-duet",
  "shadow-g3-eclipse",
];
