import type { CardDefinition } from "..";
import art from "./art.svg";

export const card: CardDefinition = {
  id: "shonen-g3-astral",
  name: "Astral Hero, Leonis Rex",
  anime: "Starblade Academy",
  nation: "Shonen Nova",
  grade: 3,
  power: 13000,
  shield: 0,
  critical: 1,
  rarity: "SSR",
  flavor: "The sky answers when he calls his final form.",
  art,
  cutscene: "rare-hero-burst",
  attackAnimation: "beam",
  skills: [
    { id: "onride-draw", name: "Heroic Arrival", timing: "onRide", effect: "Draw 1 card when rode from grade 2.", engineEffect: "draw", amount: 1 },
    { id: "attack-crit", name: "Final Nova Drive", timing: "attack", cost: "Soul-blast 1", effect: "This unit gets +10000 power and +1 critical.", engineEffect: "extraCritical", amount: 1 },
  ],
};
