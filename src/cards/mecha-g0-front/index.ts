import type { CardDefinition } from "..";
import art from "./art.svg";

export const card: CardDefinition = {
  id: "mecha-g0-front",
  name: "Orbit Drone N-00",
  anime: "Neon Armored Rail",
  nation: "Mecha Orbit",
  grade: 0,
  power: 6000,
  shield: 15000,
  critical: 1,
  rarity: "C",
  trigger: "front",
  flavor: "Small chassis. Full formation protocol.",
  art,
  skills: [{ id: "front-trigger", name: "Front Trigger", timing: "driveCheck", effect: "All front row units get +10000 power.", engineEffect: "gainPower", amount: 10000 }],
};
