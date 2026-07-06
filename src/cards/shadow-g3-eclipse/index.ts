import type { CardDefinition } from "..";
import art from "./art.svg";

export const card: CardDefinition = {
  id: "shadow-g3-eclipse",
  name: "Eclipse Tyrant Noct",
  anime: "Night Contract Zero",
  nation: "Shadow Pact",
  grade: 3,
  power: 13000,
  shield: 0,
  critical: 1,
  rarity: "SSR",
  flavor: "He signs in silence. The world pays aloud.",
  art,
  cutscene: "rare-shadow-sigil",
  attackAnimation: "shadow",
  skills: [{ id: "eclipse-crit", name: "Midnight Clause", timing: "attack", cost: "Soul-blast 1", effect: "If opponent is grade 3, this unit gets +1 critical.", engineEffect: "extraCritical", amount: 1 }],
};
