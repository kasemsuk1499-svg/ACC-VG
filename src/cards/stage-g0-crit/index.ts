import type { CardDefinition } from "..";
import art from "./art.svg";

export const card: CardDefinition = {
  id: "stage-g0-crit",
  name: "Opening Act Miri",
  anime: "Miracle Idol Circuit",
  nation: "Mystic Stage",
  grade: 0,
  power: 5000,
  shield: 15000,
  critical: 1,
  rarity: "C",
  trigger: "critical",
  flavor: "The crowd knows the chorus before the song begins.",
  art,
  skills: [{ id: "crit-trigger", name: "Critical Trigger", timing: "driveCheck", effect: "Give one unit +10000 power and +1 critical.", engineEffect: "extraCritical", amount: 1 }],
};
