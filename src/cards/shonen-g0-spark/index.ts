import type { CardDefinition } from "..";
import art from "./art.svg";

export const card: CardDefinition = {
  id: "shonen-g0-spark",
  name: "Spark Cadet Riku",
  anime: "Starblade Academy",
  nation: "Shonen Nova",
  grade: 0,
  power: 6000,
  shield: 5000,
  critical: 1,
  rarity: "C",
  trigger: "draw",
  flavor: "The first shout is small. The comeback is not.",
  art,
  attackAnimation: "slash",
  skills: [{ id: "draw-trigger", name: "Draw Trigger", timing: "driveCheck", effect: "Draw 1 when revealed as a trigger.", engineEffect: "draw", amount: 1 }],
};
