import type { CardDefinition } from "..";
import art from "./art.svg";

export const card: CardDefinition = {
  id: "shonen-g1-boost",
  name: "Blaze Senpai Kana",
  anime: "Starblade Academy",
  nation: "Shonen Nova",
  grade: 1,
  power: 8000,
  shield: 5000,
  critical: 1,
  rarity: "R",
  flavor: "She turns rivalry into fuel.",
  art,
  attackAnimation: "impact",
  skills: [{ id: "boost-3k", name: "Battle Cheer", timing: "boost", effect: "During a boosted attack, give the attacker +3000 power.", engineEffect: "gainPower", amount: 3000 }],
};
