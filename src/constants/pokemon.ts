import { Pokemon } from '@/@types/pokemon';

export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    grass: '#78C850', fire: '#F08030', water: '#6890F0', bug: '#A8B820', normal: '#A8A878',
    poison: '#A040A0', electric: '#F8D030', ground: '#E0C068', fairy: '#EE99AC', fighting: '#C03028',
    psychic: '#F85888', rock: '#B8A038', ghost: '#705898', ice: '#98D8D8', dragon: '#7038F8',
    dark: '#705848', steel: '#B8B8D0', flying: '#A890F0',
  };
  return colors[type] || '#A8A8A8';
}

export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function contrastText(hex: string): '#1a1a1a' | '#ffffff' {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#1a1a1a' : '#ffffff';
}

export function pseudoLevel(pokemon: Pokemon): number {
  const total = pokemon.poderes.reduce((sum, p) => sum + Number(p.forca), 0);
  return Math.max(5, Math.min(100, Math.round(total / 12)));
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Atq. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidade',
};

export function statLabel(nome: string): string {
  return STAT_LABELS[nome] || nome;
}

export function getStat(pokemon: Pokemon, nome: string): number {
  const stat = pokemon.poderes.find((p) => p.nome === nome);
  return stat ? Number(stat.forca) : 0;
}

export function maxHpFor(pokemon: Pokemon): number {
  return getStat(pokemon, 'hp') * 2;
}

type TypeRelation = { x2: string[]; x05: string[]; x0: string[] };

const TYPE_CHART: Record<string, TypeRelation> = {
  normal: { x2: [], x05: ['rock', 'steel'], x0: ['ghost'] },
  fire: { x2: ['grass', 'ice', 'bug', 'steel'], x05: ['fire', 'water', 'rock', 'dragon'], x0: [] },
  water: { x2: ['fire', 'ground', 'rock'], x05: ['water', 'grass', 'dragon'], x0: [] },
  electric: { x2: ['water', 'flying'], x05: ['electric', 'grass', 'dragon'], x0: ['ground'] },
  grass: { x2: ['water', 'ground', 'rock'], x05: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'], x0: [] },
  ice: { x2: ['grass', 'ground', 'flying', 'dragon'], x05: ['fire', 'water', 'ice', 'steel'], x0: [] },
  fighting: { x2: ['normal', 'ice', 'rock', 'dark', 'steel'], x05: ['poison', 'flying', 'psychic', 'bug', 'fairy'], x0: ['ghost'] },
  poison: { x2: ['grass', 'fairy'], x05: ['poison', 'ground', 'rock', 'ghost'], x0: ['steel'] },
  ground: { x2: ['fire', 'electric', 'poison', 'rock', 'steel'], x05: ['grass', 'bug'], x0: ['flying'] },
  flying: { x2: ['grass', 'fighting', 'bug'], x05: ['electric', 'rock', 'steel'], x0: [] },
  psychic: { x2: ['fighting', 'poison'], x05: ['psychic', 'steel'], x0: ['dark'] },
  bug: { x2: ['grass', 'psychic', 'dark'], x05: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'], x0: [] },
  rock: { x2: ['fire', 'ice', 'flying', 'bug'], x05: ['fighting', 'ground', 'steel'], x0: [] },
  ghost: { x2: ['psychic', 'ghost'], x05: ['dark'], x0: ['normal'] },
  dragon: { x2: ['dragon'], x05: ['steel'], x0: ['fairy'] },
  dark: { x2: ['psychic', 'ghost'], x05: ['fighting', 'dark', 'fairy'], x0: [] },
  steel: { x2: ['ice', 'rock', 'fairy'], x05: ['fire', 'water', 'electric', 'steel'], x0: [] },
  fairy: { x2: ['fighting', 'dragon', 'dark'], x05: ['fire', 'poison', 'steel'], x0: [] },
};

export function typeMultiplier(attackType: string, defenderTypes: string[]): number {
  const row = TYPE_CHART[attackType];
  if (!row) return 1;

  let mult = 1;
  for (const def of defenderTypes) {
    if (row.x2.includes(def)) mult *= 2;
    else if (row.x05.includes(def)) mult *= 0.5;
    else if (row.x0.includes(def)) mult *= 0;
  }
  return mult;
}

export type DamageResult = { damage: number; multiplier: number };

export function calcDamage(attacker: Pokemon, defender: Pokemon): DamageResult {
  const atk = getStat(attacker, 'attack');
  const def = getStat(defender, 'defense');
  const attackType = attacker.tipos[0] || 'normal';
  const multiplier = typeMultiplier(attackType, defender.tipos);
  const variance = 0.85 + Math.random() * 0.3;

  let damage = Math.round((atk * 0.5 - def * 0.25) * multiplier * variance);
  damage = multiplier > 0 ? Math.max(1, damage) : 0;

  return { damage, multiplier };
}

export function effectivenessLabel(multiplier: number): string {
  if (multiplier === 0) return ' Não teve efeito!';
  if (multiplier > 1) return ' Foi super eficaz!';
  if (multiplier < 1) return ' Foi pouco eficaz.';
  return '';
}

export function hpColor(ratio: number): string {
  if (ratio > 0.5) return '#4caf50';
  if (ratio > 0.2) return '#ff9800';
  return '#f44336';
}
