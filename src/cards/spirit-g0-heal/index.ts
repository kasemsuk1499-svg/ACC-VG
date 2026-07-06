import type { CardDefinition } from "..";
import art from "./art.svg";

export const card: CardDefinition = {
  id: "spirit-g0-heal",
  name: "Temple Mender Yua",
  anime: "Fox Moon Pact",
  nation: "Spirit Court",
  grade: 0,
  power: 5000,
  shield: 15000,
  critical: 1,
  rarity: "C",
  trigger: "heal",
  flavor: "A bell rings, and pain remembers how to leave.",
  art,
  skills: [{ id: "heal-trigger", name: "Heal Trigger", timing: "damageCheck", effect: "Heal 1 if your damage is not lower than the opponent's.", engineEffect: "healOne", amount: 1 }],
};
