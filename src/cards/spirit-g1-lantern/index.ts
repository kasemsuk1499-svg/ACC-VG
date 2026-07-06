import type { CardDefinition } from "..";
import art from "./art.svg";

export const card: CardDefinition = {
  id: "spirit-g1-lantern",
  name: "Lantern Fox Kohaku",
  anime: "Fox Moon Pact",
  nation: "Spirit Court",
  grade: 1,
  power: 8000,
  shield: 5000,
  critical: 1,
  rarity: "R",
  flavor: "It guides the lost and tricks the arrogant.",
  art,
  attackAnimation: "stage",
  skills: [{ id: "call-soul", name: "Moonlit Path", timing: "onCall", effect: "Soul-charge 1.", engineEffect: "soulCharge", amount: 1 }],
};
