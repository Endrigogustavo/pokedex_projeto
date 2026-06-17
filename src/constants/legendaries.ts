export const LEGENDARY_IDS = [
  144, 145, 146, 150, 151,
  249, 250,
  382, 383, 384,
  483, 484, 487, 491, 493,
];

export const GOD_TEAM_IDS = [483, 484, 487, 493];

export function isLegendaryIndex(index: string): boolean {
  return LEGENDARY_IDS.includes(Number(index));
}
