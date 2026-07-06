import type { CardDefinition } from "..";
import art from "./art.svg";

export const card: CardDefinition = {
  id: "shadow-g1-guard",
  name: "Oathbound Shade Ren",
  anime: "Night Contract Zero",
  nation: "Shadow Pact",
  grade: 1,
  power: 7000,
  shield: 10000,
  critical: 1,
  rarity: "R",
  flavor: "Every promise has a shadow signature.",
  art,
  attackAnimation: "shadow",
  skills: [{ id: "guard-boost", name: "Contract Guard", timing: "guardian", effect: "When placed to guard, shield +5000.", engineEffect: "guardBoost", amount: 5000 }],
};
