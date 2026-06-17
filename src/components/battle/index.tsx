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
  getTypeColor,
  capitalize,
  statLabel,
  getStat,
} from '@/constants/pokemon';
import { styles } from './styles';

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

    if (won) {
      setReward(pickRewards(allPokemons, isOwned));
    }

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

      {phase !== 'choose' && myPokemon && (
        <>
          <View style={[styles.fighter, styles.myFighter, { borderColor: myColor }]}>
            <View style={[styles.fighterBadge, { backgroundColor: myColor }]}>
              <Text style={styles.fighterBadgeText}>VOCÊ</Text>
            </View>
            <Image source={{ uri: myPokemon.imagem }} style={[styles.fighterImg, PIX]} />
            <Text style={styles.fighterName}>{capitalize(myPokemon.nome)}</Text>
          </View>

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
