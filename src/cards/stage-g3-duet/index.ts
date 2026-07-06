import type { CardDefinition } from "..";
import art from "./art.svg";

export const card: CardDefinition = {
  id: "stage-g3-duet",
  name: "Starlight Duet Aria",
  anime: "Miracle Idol Circuit",
  nation: "Mystic Stage",
  grade: 3,
  power: 13000,
  shield: 0,
  critical: 1,
  rarity: "SSR",
  flavor: "Encore is not requested. It is inevitable.",
  art,
  cutscene: "rare-stage-encore",
  attackAnimation: "stage",
  skills: [{ id: "duet-draw", name: "Encore Step", timing: "attack", effect: "If you have two or more rear-guards, draw 1 and get +5000 power.", engineEffect: "draw", amount: 1 }],
};
