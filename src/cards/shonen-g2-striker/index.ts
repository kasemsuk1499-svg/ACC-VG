import type { CardDefinition } from "..";
import art from "./art.svg";

export const card: CardDefinition = {
  id: "shonen-g2-striker",
  name: "Meteor Striker Juno",
  anime: "Starblade Academy",
  nation: "Shonen Nova",
  grade: 2,
  power: 10000,
  shield: 5000,
  critical: 1,
  rarity: "RR",
  flavor: "One swing, one promise, one new crater.",
  art,
  attackAnimation: "slash",
  skills: [{ id: "attack-5k", name: "Meteor Rush", timing: "attack", cost: "Counter-blast 1", effect: "This unit gets +5000 power until end of battle.", engineEffect: "gainPower", amount: 5000 }],
};
