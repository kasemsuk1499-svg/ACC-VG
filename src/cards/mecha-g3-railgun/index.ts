import type { CardDefinition } from "..";
import art from "./art.svg";

export const card: CardDefinition = {
  id: "mecha-g3-railgun",
  name: "Railgun Empress Vesta",
  anime: "Neon Armored Rail",
  nation: "Mecha Orbit",
  grade: 3,
  power: 13000,
  shield: 0,
  critical: 1,
  rarity: "SR",
  flavor: "Her kingdom is any battlefield inside the crosshair.",
  art,
  cutscene: "rare-orbit-lock",
  attackAnimation: "beam",
  skills: [{ id: "retire-rear", name: "Satellite Verdict", timing: "attack", cost: "Counter-blast 1", effect: "Retire one enemy rear-guard, then get +5000 power.", engineEffect: "retireRear", amount: 5000 }],
};
