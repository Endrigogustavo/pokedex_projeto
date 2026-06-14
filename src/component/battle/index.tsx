import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
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
import { useToast } from '@/hooks/useToast';
import {
  getTypeColor,
  capitalize,
  statLabel,
  getStat,
} from '@/utils/pokemon';

type Props = { allPokemons: Pokemon[] };

type Phase = 'choose' | 'battle' | 'done';
type Outcome = 'win' | 'lose' | 'draw';

type Round = {
  myStat: string;
  myValue: number;
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

export default function Battle({ allPokemons }: Props) {
  const { team, addPokemon, isOwned } = useTeam();
  const { userStats, updateStats } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const [phase, setPhase]           = useState<Phase>('choose');
  const [myPokemon, setMyPokemon]   = useState<Pokemon | null>(null);
  const [botPokemon, setBotPokemon] = useState<Pokemon | null>(null);
  const [usedMine, setUsedMine]     = useState<string[]>([]);
  const [usedBot, setUsedBot]       = useState<string[]>([]);
  const [myScore, setMyScore]       = useState(0);
  const [botScore, setBotScore]     = useState(0);
  const [rounds, setRounds]         = useState<Round[]>([]);
  const [reward, setReward]         = useState<Pokemon[] | null>(null);
  const [claimedName, setClaimedName] = useState<string | null>(null);

  // Sorteia o adversário ao montar (e quando a lista carrega).
  useEffect(() => {
    if (!botPokemon && allPokemons.length > 0) {
      setBotPokemon(pickRandom(allPokemons));
    }
  }, [allPokemons, botPokemon]);

  const stats = myPokemon ? myPokemon.poderes.map((p) => p.nome) : [];

  const newBattle = () => {
    setMyPokemon(null);
    setBotPokemon(pickRandom(allPokemons));
    setUsedMine([]);
    setUsedBot([]);
    setMyScore(0);
    setBotScore(0);
    setRounds([]);
    setReward(null);
    setClaimedName(null);
    setPhase('choose');
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

  const chooseMine = (p: Pokemon) => {
    setMyPokemon(p);
    setPhase('battle');
  };

  const finalize = (my: number, bot: number) => {
    const won  = my > bot;
    const draw = my === bot;
    setPhase('done');

    showToast(
      won ? 'Você venceu a batalha! 🏆' : draw ? 'Empate!' : 'Você perdeu...',
      won ? 'success' : draw ? 'info' : 'error'
    );

    // Vitória dá uma recompensa: 3 Pokémons aleatórios para escolher.
    if (won) {
      setReward(pickRewards(allPokemons, isOwned));
    }

    // Persiste o resultado nas estatísticas da nuvem.
    if (!draw) {
      const v = userStats?.vitorias ?? 0;
      const d = userStats?.derrotas ?? 0;
      const newV = v + (won ? 1 : 0);
      const newD = d + (won ? 0 : 1);
      const newLevel = Math.floor(newV / 3) + 1;
      updateStats(newLevel, newV, newD);
    }
  };

  const playStat = (statName: string) => {
    if (!myPokemon || !botPokemon) return;
    if (usedMine.includes(statName)) return;

    const myValue = getStat(myPokemon, statName);

    // O bot é estratégico: escolhe o maior atributo que ainda não usou.
    const botRemaining = stats.filter((s) => !usedBot.includes(s));
    const botStat = botRemaining.reduce((best, s) =>
      getStat(botPokemon, s) > getStat(botPokemon, best) ? s : best
    );
    const botValue = getStat(botPokemon, botStat);

    const result: Outcome =
      myValue > botValue ? 'win' : myValue < botValue ? 'lose' : 'draw';

    const round: Round = { myStat: statName, myValue, botStat, botValue, result };
    const newRounds   = [...rounds, round];
    const newUsedMine = [...usedMine, statName];
    const newUsedBot  = [...usedBot, botStat];
    const newMyScore  = myScore + (result === 'win' ? 1 : 0);
    const newBotScore = botScore + (result === 'lose' ? 1 : 0);

    setRounds(newRounds);
    setUsedMine(newUsedMine);
    setUsedBot(newUsedBot);
    setMyScore(newMyScore);
    setBotScore(newBotScore);

    if (newUsedMine.length >= stats.length) {
      finalize(newMyScore, newBotScore);
    }
  };

  // ── Sem time ──────────────────────────────────────────────
  if (team.length === 0) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="sword-cross" size={56} color="#CACAD5" />
        <Text style={styles.emptyTitle}>Monte um time para batalhar</Text>
      </View>
    );
  }

  const lastRound = rounds[rounds.length - 1] ?? null;
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
        {phase !== 'choose' && (
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>
              {myScore} <Text style={styles.scoreDim}>x</Text> {botScore}
            </Text>
          </View>
        )}
      </View>

      {/* ── Adversário ── */}
      {botPokemon && (
        <View style={[styles.fighter, { borderColor: botColor }]}>
          <View style={[styles.fighterBadge, { backgroundColor: botColor }]}>
            <Text style={styles.fighterBadgeText}>ADVERSÁRIO</Text>
          </View>
          <Image source={{ uri: botPokemon.imagem }} style={[styles.fighterImg, PIX]} />
          <Text style={styles.fighterName}>{capitalize(botPokemon.nome)}</Text>
          <Text style={styles.fighterTypes}>
            {botPokemon.tipos.map(capitalize).join(' · ')}
          </Text>
        </View>
      )}

      {/* ── Fase: escolher meu Pokémon ── */}
      {phase === 'choose' && (
        <>
          <Text style={styles.sectionTitle}>Escolha seu Pokémon</Text>
          <View style={styles.teamGrid}>
            {team.map((m) => {
              const color = getTypeColor(m.pokemon.tipos[0]);
              return (
                <Pressable
                  key={m.id}
                  onPress={() => chooseMine(m.pokemon)}
                  style={({ pressed }) => [
                    styles.teamPick,
                    { borderColor: color },
                    pressed && styles.pressed,
                  ]}
                >
                  <Image source={{ uri: m.pokemon.imagem }} style={[styles.pickImg, PIX]} />
                  <Text style={styles.pickName} numberOfLines={1}>
                    {capitalize(m.pokemon.nome)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {/* ── Fase: batalha em andamento / fim ── */}
      {phase !== 'choose' && myPokemon && (
        <>
          <View style={[styles.fighter, styles.myFighter, { borderColor: myColor }]}>
            <View style={[styles.fighterBadge, { backgroundColor: myColor }]}>
              <Text style={styles.fighterBadgeText}>VOCÊ</Text>
            </View>
            <Image source={{ uri: myPokemon.imagem }} style={[styles.fighterImg, PIX]} />
            <Text style={styles.fighterName}>{capitalize(myPokemon.nome)}</Text>
          </View>

          {/* Resultado da última rodada */}
          {lastRound && (
            <View
              style={[
                styles.roundBanner,
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
              <Text style={styles.roundText}>
                Você: {statLabel(lastRound.myStat)}{' '}
                <Text style={styles.roundValue}>{lastRound.myValue}</Text>
                {'   vs   '}
                Bot: {statLabel(lastRound.botStat)}{' '}
                <Text style={styles.roundValue}>{lastRound.botValue}</Text>
              </Text>
              <Text
                style={[
                  styles.roundResult,
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
                {lastRound.result === 'win'
                  ? '✓ Ponto seu!'
                  : lastRound.result === 'lose'
                  ? '✗ Ponto do bot'
                  : '= Empate'}
              </Text>
            </View>
          )}

          {/* Atributos disponíveis */}
          {phase === 'battle' && (
            <>
              <Text style={styles.sectionTitle}>
                Escolha um atributo ({stats.length - usedMine.length} restantes)
              </Text>
              <View style={styles.attrGrid}>
                {myPokemon.poderes.map((poder) => {
                  const used = usedMine.includes(poder.nome);
                  return (
                    <Pressable
                      key={poder.nome}
                      disabled={used}
                      onPress={() => playStat(poder.nome)}
                      style={({ pressed }) => [
                        styles.attrBtn,
                        used && styles.attrUsed,
                        pressed && !used && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.attrLabel, used && styles.attrUsedText]}>
                        {statLabel(poder.nome)}
                      </Text>
                      <Text style={[styles.attrValue, used && styles.attrUsedText]}>
                        {used ? '—' : poder.forca}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Resultado final */}
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

              {/* Recompensa: escolher 1 de 3 Pokémons aleatórios */}
              {myScore > botScore && reward && !claimedName && (
                <View style={styles.rewardBox}>
                  <Text style={styles.rewardTitle}>Escolha sua recompensa</Text>
                  <Text style={styles.rewardSub}>Um deles entra para o seu time</Text>
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

              {/* Só libera nova batalha após pegar a recompensa (quando venceu) */}
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

          {/* Histórico de rodadas */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F8',
    gap: 12,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#49454F',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1B1B1F',
    letterSpacing: -0.3,
  },
  scorePill: {
    backgroundColor: '#1B1B1F',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  scoreText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  scoreDim: {
    color: '#9E9E9E',
    fontWeight: '700',
  },
  fighter: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  myFighter: {
    marginTop: 4,
  },
  fighterBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderBottomRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  fighterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  fighterImg: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
  },
  fighterName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1B1B1F',
    marginTop: 4,
  },
  fighterTypes: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B1B1F',
    marginTop: 8,
    marginBottom: 12,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  teamPick: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    paddingVertical: 10,
  },
  pickImg: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  pickName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#49454F',
    marginTop: 2,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  roundBanner: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    gap: 4,
  },
  roundText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B1B1F',
    textAlign: 'center',
  },
  roundValue: {
    fontWeight: '900',
  },
  roundResult: {
    fontSize: 14,
    fontWeight: '900',
  },
  attrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  attrBtn: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    gap: 2,
  },
  attrUsed: {
    backgroundColor: '#ECECEF',
    elevation: 0,
  },
  attrUsedText: {
    color: '#BDBDBD',
  },
  attrLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  attrValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#CC0000',
  },
  finalBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    padding: 24,
    gap: 6,
    marginBottom: 12,
  },
  finalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1B1B1F',
  },
  finalScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  rewardBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1B1B1F',
    textAlign: 'center',
  },
  rewardSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 14,
  },
  rewardGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  rewardPick: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  claimedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E6F4EA',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  claimedText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2E9E5B',
  },
  againBtn: {
    borderRadius: 14,
    backgroundColor: '#CC0000',
    alignSelf: 'stretch',
    marginBottom: 12,
  },
  history: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B1B1F',
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEE',
    gap: 8,
  },
  historyIdx: {
    width: 18,
    fontSize: 11,
    fontWeight: '800',
    color: '#9E9E9E',
  },
  historyCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#1B1B1F',
  },
  historyRight: {
    textAlign: 'right',
  },
});
