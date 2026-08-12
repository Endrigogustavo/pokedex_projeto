import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  Pressable,
  Text,
} from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pokemon } from '@/@types/pokemon';
import { useTeam } from '@/context/TeamContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  getStats,
  updateStats,
  StatsResponse,
} from '@/integration/authIntegration';
import {
  getTypeColor,
  capitalize,
  statLabel,
  getStat,
} from '@/constants/pokemon';
import { styles } from './styles';

type Props = { allPokemons: Pokemon[] };

type Phase = 'battle' | 'done';
type Outcome = 'win' | 'lose' | 'draw';

// Pontos necessários para encerrar a batalha automaticamente em vitória.
const WIN_THRESHOLD = 3;

// Quantidade mínima de pokémons no time para liberar a batalha.
const MIN_TEAM_SIZE = 5;

type Round = {
  mine: Pokemon;
  myStat: string;
  myValue: number;
  bot: Pokemon;
  botStat: string;
  botValue: number;
  result: Outcome;
};

const PIX = { imageRendering: 'pixelated' } as any;

const pickRandom = (pool: Pokemon[], excludeIndex?: string): Pokemon | null => {
  const candidates = pool.filter((p) => p.index !== excludeIndex);
  if (candidates.length === 0) return pool[0] ?? null;
  return candidates[Math.floor(Math.random() * candidates.length)];
};

const pickRewards = (pool: Pokemon[], owned: (i: string) => boolean, count = 3): Pokemon[] => {
  const candidates = pool.filter((p) => !owned(p.index));
  const source = candidates.length >= count ? candidates : pool;
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const randomStat = (p: Pokemon, used: string[]): string => {
  const all = p.poderes.map((s) => s.nome);
  const available = all.filter((n) => !used.includes(n));
  const pool = available.length > 0 ? available : all;
  return pool[Math.floor(Math.random() * pool.length)];
};

const buildRound = (
  mine: Pokemon,
  bot: Pokemon,
  usedMy: string[],
  usedBot: string[]
): Round => {
  const myStat = randomStat(mine, usedMy);
  const botStat = randomStat(bot, usedBot);
  const myValue = getStat(mine, myStat);
  const botValue = getStat(bot, botStat);
  const result: Outcome =
    myValue > botValue ? 'win' : myValue < botValue ? 'lose' : 'draw';
  return { mine, myStat, myValue, bot, botStat, botValue, result };
};

export default function Battle({ allPokemons }: Props) {
  const { team, addPokemon, isOwned } = useTeam();
  const { userId } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const [phase, setPhase]           = useState<Phase>('battle');
  const [botPokemon, setBotPokemon] = useState<Pokemon | null>(null);
  const [rounds, setRounds]         = useState<Round[]>([]);
  const [reward, setReward]         = useState<Pokemon[] | null>(null);
  const [claimedName, setClaimedName] = useState<string | null>(null);
  const [userStats, setUserStats]     = useState<StatsResponse | null>(null);

  const myScore  = rounds.filter((r) => r.result === 'win').length;
  const botScore = rounds.filter((r) => r.result === 'lose').length;

  useEffect(() => {
    if (!userId) return;
    getStats(userId)
      .then(setUserStats)
      .catch(() => {
        // sem stats na nuvem a batalha continua, só não pontua
      });
  }, [userId]);

  useEffect(() => {
    if (!botPokemon && allPokemons.length > 0) {
      setBotPokemon(pickRandom(allPokemons));
    }
  }, [allPokemons, botPokemon]);


  useEffect(() => {
    if (phase !== 'battle' || !botPokemon) return;

    const won  = rounds.filter((r) => r.result === 'win').length;
    const lost = rounds.filter((r) => r.result === 'lose').length;

    if (won > WIN_THRESHOLD || rounds.length >= team.length) {
      finalize(won, lost);
      return;
    }

    const t = setTimeout(() => {
      const mine = team[rounds.length].pokemon;
      const usedMy = rounds.map((r) => r.myStat);
      const usedBot = rounds.map((r) => r.botStat);
      const round = buildRound(mine, botPokemon, usedMy, usedBot);
      setRounds((prev) => [...prev, round]);
    }, 1100);
    return () => clearTimeout(t);
  }, [phase, rounds, botPokemon, team]);

  const newBattle = () => {
    setBotPokemon(pickRandom(allPokemons));
    setRounds([]);
    setReward(null);
    setClaimedName(null);
    setPhase('battle');
  };

  const claimReward = (p: Pokemon) => {
    const dest = addPokemon(p);
    setClaimedName(capitalize(p.nome));
    showToast(
      dest === 'team'
        ? `${capitalize(p.nome)} entrou no seu time!`
        : `${capitalize(p.nome)} foi para a bolsa (time cheio)!`,
      'success'
    );
  };

  const finalize = (my: number, bot: number) => {
    const won  = my > bot;
    const draw = my === bot;
    setPhase('done');

    showToast(
      won ? 'Você venceu a batalha! 🏆' : draw ? 'Empate!' : 'Você perdeu...',
      won ? 'success' : draw ? 'info' : 'error'
    );

    if (won) {
      setReward(pickRewards(allPokemons, isOwned, 1));
    }

    if (!draw && userId) {
      const v = userStats?.vitorias ?? 0;
      const d = userStats?.derrotas ?? 0;
      const newV = v + (won ? 1 : 0);
      const newD = d + (won ? 0 : 1);
      const newLevel = Math.floor(newV / 3) + 1;

      updateStats(userId, {
        level: String(newLevel),
        vitorias: String(newV),
        derrotas: String(newD),
      })
        .then(setUserStats)
        .catch(() => {
          // placar local segue válido mesmo se a nuvem falhar
        });
    }
  };

  if (team.length < MIN_TEAM_SIZE) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="sword-cross" size={56} color="#CACAD5" />
        <Text style={styles.emptyTitle}>
          Monte um time com pelo menos {MIN_TEAM_SIZE} pokémons para batalhar
        </Text>
        <Text style={styles.emptySub}>
          Você tem {team.length} de {MIN_TEAM_SIZE}
        </Text>
      </View>
    );
  }

  const lastRound = rounds[rounds.length - 1] ?? null;
  const myPokemon = lastRound?.mine ?? team[0]?.pokemon ?? null;
  const botColor  = botPokemon ? getTypeColor(botPokemon.tipos[0]) : '#888';
  const myColor   = myPokemon ? getTypeColor(myPokemon.tipos[0]) : '#888';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Batalha de Atributos</Text>
      </View>

      {myPokemon && botPokemon && (
        <>
          <View style={styles.arena}>
            <View style={styles.arenaRow}>
              <View style={styles.arenaSide}>
                <View style={[styles.arenaBadge, { backgroundColor: myColor }]}>
                  <Text style={styles.arenaBadgeText}>VOCÊ</Text>
                </View>
                <Image source={{ uri: myPokemon.imagem }} style={[styles.arenaImg, PIX]} />
                <Text style={styles.arenaName} numberOfLines={1}>{capitalize(myPokemon.nome)}</Text>
              </View>

              <View style={styles.arenaCenter}>
                <View style={styles.scorePill}>
                  <Text style={styles.scoreText}>
                    {myScore} <Text style={styles.scoreDim}>x</Text> {botScore}
                  </Text>
                </View>
                <MaterialCommunityIcons name="sword-cross" size={22} color="#9CA3AF" />
              </View>

              <View style={styles.arenaSide}>
                <View style={[styles.arenaBadge, { backgroundColor: botColor }]}>
                  <Text style={styles.arenaBadgeText}>INIMIGO</Text>
                </View>
                <Image source={{ uri: botPokemon.imagem }} style={[styles.arenaImg, PIX]} />
                <Text style={styles.arenaName} numberOfLines={1}>{capitalize(botPokemon.nome)}</Text>
              </View>
            </View>

            {lastRound ? (
              <View
                style={[
                  styles.duel,
                  {
                    backgroundColor:
                      lastRound.result === 'win'
                        ? '#E6F4EA'
                        : lastRound.result === 'lose'
                        ? '#FDECEA'
                        : '#EEF0F4',
                  },
                ]}
              >
                <View style={styles.duelSide}>
                  <Text style={styles.duelStat}>{statLabel(lastRound.myStat)}</Text>
                  <Text style={[styles.duelValue, { color: myColor }]}>{lastRound.myValue}</Text>
                </View>
                <Text
                  style={[
                    styles.duelResult,
                    {
                      color:
                        lastRound.result === 'win'
                          ? '#2E9E5B'
                          : lastRound.result === 'lose'
                          ? '#C62828'
                          : '#6B7280',
                    },
                  ]}
                >
                  {lastRound.result === 'win' ? '✓' : lastRound.result === 'lose' ? '✗' : '='}
                </Text>
                <View style={styles.duelSide}>
                  <Text style={styles.duelStat}>{statLabel(lastRound.botStat)}</Text>
                  <Text style={[styles.duelValue, { color: botColor }]}>{lastRound.botValue}</Text>
                </View>
              </View>
            ) : (
              <View style={[styles.duel, { backgroundColor: '#EEF0F4' }]}>
                <MaterialCommunityIcons name="dice-multiple" size={22} color="#6B7280" />
                <Text style={styles.duelPending}>Sorteando atributos...</Text>
              </View>
            )}

            {phase === 'battle' && (
              <Text style={styles.arenaProgress}>
                Rodada {Math.min(rounds.length + 1, team.length)} de {team.length}
              </Text>
            )}
          </View>

          {phase === 'done' && (
            <>
              <View style={styles.finalBox}>
                <MaterialCommunityIcons
                  name={
                    myScore > botScore
                      ? 'trophy'
                      : myScore < botScore
                      ? 'emoticon-sad-outline'
                      : 'handshake-outline'
                  }
                  size={48}
                  color={
                    myScore > botScore
                      ? '#F59E0B'
                      : myScore < botScore
                      ? '#C62828'
                      : '#6B7280'
                  }
                />
                <Text style={styles.finalTitle}>
                  {myScore > botScore ? 'Vitória!' : myScore < botScore ? 'Derrota' : 'Empate'}
                </Text>
                <Text style={styles.finalScore}>
                  {myScore} a {botScore}
                </Text>
              </View>

              {myScore > botScore && reward && !claimedName && (
                <View style={styles.rewardBox}>
                  <Text style={styles.rewardTitle}>Sua recompensa</Text>
                  <Text style={styles.rewardSub}>Toque para adicioná-lo ao seu time</Text>
                  <View style={styles.rewardGrid}>
                    {reward.map((p) => {
                      const color = getTypeColor(p.tipos[0]);
                      return (
                        <Pressable
                          key={p.index}
                          onPress={() => claimReward(p)}
                          style={({ pressed }) => [
                            styles.rewardPick,
                            { borderColor: color },
                            pressed && styles.pressed,
                          ]}
                        >
                          <Image source={{ uri: p.imagem }} style={[styles.pickImg, PIX]} />
                          <Text style={styles.pickName} numberOfLines={1}>
                            {capitalize(p.nome)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {claimedName && (
                <View style={styles.claimedBox}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#2E9E5B" />
                  <Text style={styles.claimedText}>{claimedName} adicionado!</Text>
                </View>
              )}

              {(myScore <= botScore || claimedName) && (
                <Button
                  mode="contained"
                  icon="sword-cross"
                  onPress={newBattle}
                  style={styles.againBtn}
                  contentStyle={{ height: 48 }}
                >
                  Nova batalha
                </Button>
              )}
            </>
          )}

          {rounds.length > 0 && (
            <View style={styles.history}>
              <Text style={styles.historyTitle}>Rodadas</Text>
              {rounds.map((r, i) => (
                <View key={i} style={styles.historyRow}>
                  <Text style={styles.historyIdx}>{i + 1}</Text>
                  <Text style={styles.historyCell}>
                    {statLabel(r.myStat)} {r.myValue}
                  </Text>
                  <MaterialCommunityIcons
                    name={
                      r.result === 'win'
                        ? 'chevron-right'
                        : r.result === 'lose'
                        ? 'chevron-left'
                        : 'minus'
                    }
                    size={16}
                    color={
                      r.result === 'win'
                        ? '#2E9E5B'
                        : r.result === 'lose'
                        ? '#C62828'
                        : '#6B7280'
                    }
                  />
                  <Text style={[styles.historyCell, styles.historyRight]}>
                    {r.botValue} {statLabel(r.botStat)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
