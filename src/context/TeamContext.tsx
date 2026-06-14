import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pokemon } from '@/@types/pokemon';
import { maxHpFor} from '@/utils/pokemon';
import { pixelSpriteUrl } from '@/integration/pokemonPixelImage'
import { TEAM_SIZE } from '@/data/starters';
import { pokemonAPI } from '@/integration/pokemonAuthApi';
import { useAuth } from '@/context/AuthContext';

const teamKey = (userId: string) => `@PokeFight:team_${userId}`;

export type TeamMember = {
  id: string;
  pokemon: Pokemon;
  maxHp: number;
  currentHp: number;
  wins: number;
};

export type Stats = {
  battles: number;
  wins: number;
  losses: number;
  streak: number;
  bestStreak: number;
  legendariesDefeated: number;
};

const INITIAL_STATS: Stats = {
  battles: 0,
  wins: 0,
  losses: 0,
  streak: 0,
  bestStreak: 0,
  legendariesDefeated: 0,
};

let uidCounter = 0;
function toMember(pokemon: Pokemon): TeamMember {
  const maxHp = maxHpFor(pokemon);
  uidCounter += 1;
  const normalized = { ...pokemon, imagem: pixelSpriteUrl(pokemon.index) };
  return { id: `${pokemon.index}-${uidCounter}`, pokemon: normalized, maxHp, currentHp: maxHp, wins: 0 };
}

type TeamContextType = {
  team: TeamMember[];
  bag: TeamMember[];
  hasTeam: boolean;
  createTeam: (pokemons: Pokemon[]) => void;
  hydrateTeam: (team: Pokemon[], bag?: Pokemon[]) => void;
  loadSavedTeam: () => Promise<boolean>;
  addPokemon: (pokemon: Pokemon) => 'team' | 'bag';
  isOwned: (index: string) => boolean;
  moveToTeam: (id: string) => void;
  moveToBag: (id: string) => void;
  summonGods: (gods: Pokemon[]) => void;
  evolveMember: (id: string, evolved: Pokemon) => void;
  addMemberWin: (id: string) => void;
  setTeam: (team: TeamMember[]) => void;
  healTeam: () => void;
  resetTeam: () => void;
  stats: Stats;
  startBattleCount: () => number;
  recordWin: (legendary: boolean) => void;
  recordLoss: () => void;
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [bag, setBag] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const { userId } = useAuth();
  const readyRef = useRef(false);

  /** Persiste equipe e bolsa no dispositivo (por usuário). */
  useEffect(() => {
    if (!userId || !readyRef.current) return;
    const data = JSON.stringify({
      team: team.map((m) => m.pokemon),
      bag: bag.map((m) => m.pokemon),
    });
    AsyncStorage.setItem(teamKey(userId), data).catch(() => {});
  }, [team, bag, userId]);

  /** Sincroniza captura na nuvem (best-effort, não bloqueia a UI). */
  const cloudCapture = (index: string) => {
    if (userId) pokemonAPI.addCapturedPokemon(userId, Number(index)).catch(() => {});
  };
  const cloudRelease = (index: string) => {
    if (userId) pokemonAPI.deleteCapturedPokemon(userId, Number(index)).catch(() => {});
  };

  /** Cria a equipe inicial (iniciais escolhidos) e captura na nuvem. */
  const createTeam = (pokemons: Pokemon[]) => {
    readyRef.current = true;
    setTeam(pokemons.map(toMember));
    setBag([]);
    pokemons.forEach((p) => cloudCapture(p.index));
  };

  /** Lê a equipe salva no dispositivo. Retorna true se havia algo salvo. */
  const loadSavedTeam = async (): Promise<boolean> => {
    if (!userId) return false;
    try {
      const raw = await AsyncStorage.getItem(teamKey(userId));
      if (!raw) return false;
      const parsed = JSON.parse(raw) as { team?: Pokemon[]; bag?: Pokemon[] };
      const savedTeam = parsed.team ?? [];
      if (savedTeam.length === 0) return false;
      readyRef.current = true;
      setTeam(savedTeam.map(toMember));
      setBag((parsed.bag ?? []).map(toMember));
      return true;
    } catch {
      return false;
    }
  };

  /** Carrega equipe e bolsa (sem recapturar). */
  const hydrateTeam = (teamPokemons: Pokemon[], bagPokemons: Pokemon[] = []) => {
    readyRef.current = true;
    setTeam(teamPokemons.map(toMember));
    setBag(bagPokemons.map(toMember));
  };

  const isOwned = (index: string): boolean =>
    [...team, ...bag].some((m) => m.pokemon.index === index);

  /**
   * Adiciona um Pokémon (recompensa de batalha): entra na equipe se houver
   * espaço, senão vai pra bolsa. Persiste e sincroniza a captura na nuvem.
   */
  const addPokemon = (pokemon: Pokemon): 'team' | 'bag' => {
    readyRef.current = true;
    const member = toMember(pokemon);
    let dest: 'team' | 'bag';
    if (team.length < TEAM_SIZE) {
      setTeam((prev) => [...prev, member]);
      dest = 'team';
    } else {
      setBag((prev) => [...prev, member]);
      dest = 'bag';
    }
    cloudCapture(pokemon.index);
    return dest;
  };

  const moveToTeam = (id: string) => {
    if (team.length >= TEAM_SIZE) return;
    const member = bag.find((m) => m.id === id);
    if (!member) return;
    setBag(bag.filter((m) => m.id !== id));
    setTeam([...team, member]);
  };

  const moveToBag = (id: string) => {
    if (team.length <= 1) return;
    const member = team.find((m) => m.id === id);
    if (!member) return;
    setTeam(team.filter((m) => m.id !== id));
    setBag([...bag, member]);
  };

  /** Cheat: os 4 primeiros da equipe vão pra bolsa e os deuses entram no lugar. */
  const summonGods = (gods: Pokemon[]) => {
    const present = new Set([...team, ...bag].map((m) => m.pokemon.index));
    const godMembers = gods.filter((g) => !present.has(g.index)).map(toMember);
    if (godMembers.length === 0) return;

    const removed = team.slice(0, godMembers.length);
    const kept = team.slice(godMembers.length);
    setTeam([...godMembers, ...kept]);
    setBag([...bag, ...removed]);
  };

  const evolveMember = (id: string, evolved: Pokemon) => {
    setTeam((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const newMax = maxHpFor(evolved);
        const ratio = m.maxHp > 0 ? m.currentHp / m.maxHp : 1;
        return { ...m, pokemon: evolved, maxHp: newMax, currentHp: Math.round(newMax * ratio) };
      })
    );
  };

  const addMemberWin = (id: string) => {
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, wins: m.wins + 1 } : m)));
  };

  const healTeam = () => {
    setTeam((prev) => prev.map((m) => ({ ...m, currentHp: m.maxHp })));
  };

  const resetTeam = () => {
    [...team, ...bag].forEach((m) => cloudRelease(m.pokemon.index));
    if (userId) AsyncStorage.removeItem(teamKey(userId)).catch(() => {});
    setTeam([]);
    setBag([]);
    setStats(INITIAL_STATS);
  };

  const startBattleCount = (): number => {
    const next = stats.battles + 1;
    setStats((s) => ({ ...s, battles: next }));
    return next;
  };

  const recordWin = (legendary: boolean) => {
    setStats((s) => {
      const streak = s.streak + 1;
      return {
        ...s,
        wins: s.wins + 1,
        streak,
        bestStreak: Math.max(s.bestStreak, streak),
        legendariesDefeated: s.legendariesDefeated + (legendary ? 1 : 0),
      };
    });
  };

  const recordLoss = () => {
    setStats((s) => ({ ...s, losses: s.losses + 1, streak: 0 }));
  };

  return (
    <TeamContext.Provider
      value={{
        team,
        bag,
        hasTeam: team.length > 0,
        createTeam,
        hydrateTeam,
        loadSavedTeam,
        addPokemon,
        isOwned,
        moveToTeam,
        moveToBag,
        summonGods,
        evolveMember,
        addMemberWin,
        setTeam,
        healTeam,
        resetTeam,
        stats,
        startBattleCount,
        recordWin,
        recordLoss,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam(): TeamContextType {
  const ctx = useContext(TeamContext);
  if (!ctx) {
    throw new Error('useTeam deve ser usado dentro de um TeamProvider');
  }
  return ctx;
}
