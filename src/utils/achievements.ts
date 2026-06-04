import { Stats } from '@/context/TeamContext';

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  current: (s: Stats) => number;
  target: number;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-win',
    title: 'Primeira Vitória',
    description: 'Vença sua primeira batalha',
    icon: 'trophy-variant',
    current: (s) => s.wins,
    target: 1,
  },
  {
    id: 'rookie',
    title: 'Treinador Iniciante',
    description: 'Participe de 5 batalhas',
    icon: 'school',
    current: (s) => s.battles,
    target: 5,
  },
  {
    id: 'veteran',
    title: 'Veterano de Batalha',
    description: 'Participe de 20 batalhas',
    icon: 'medal',
    current: (s) => s.battles,
    target: 20,
  },
  {
    id: 'legend-hunter',
    title: 'Caçador de Lendas',
    description: 'Derrote um Pokémon lendário',
    icon: 'star-four-points',
    current: (s) => s.legendariesDefeated,
    target: 1,
  },
  {
    id: 'unstoppable',
    title: 'Imparável',
    description: 'Conquiste 5 vitórias seguidas',
    icon: 'fire',
    current: (s) => s.bestStreak,
    target: 5,
  },
  {
    id: 'master',
    title: 'Mestre Pokémon',
    description: 'Acumule 50 vitórias',
    icon: 'crown',
    current: (s) => s.wins,
    target: 50,
  },
];

export type EvaluatedAchievement = AchievementDef & {
  value: number;
  unlocked: boolean;
};

export function evaluateAchievements(stats: Stats): EvaluatedAchievement[] {
  return ACHIEVEMENTS.map((a) => {
    const value = Math.min(a.current(stats), a.target);
    return { ...a, value, unlocked: a.current(stats) >= a.target };
  });
}
