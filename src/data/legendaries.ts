export const LEGENDARY_IDS = [
  144, 145, 146, 150, 151, // Gen 1 (aves lendárias, Mewtwo, Mew)
  249, 250,                // Lugia, Ho-oh
  382, 383, 384,           // Kyogre, Groudon, Rayquaza
  483, 484, 487, 491, 493, // Dialga, Palkia, Giratina, Darkrai, Arceus
];

/** Lendários invocáveis pelo botão oculto da batalha. */
export const GOD_TEAM_IDS = [483, 484, 487, 493]; // Dialga, Palkia, Giratina, Arceus

export function isLegendaryIndex(index: string): boolean {
  return LEGENDARY_IDS.includes(Number(index));
}
