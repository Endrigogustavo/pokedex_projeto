import React, { useState } from 'react';
import { View, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import {
  Card,
  Surface,
  Text,
  Button,
  Chip,
  Avatar,
  TouchableRipple,
  Snackbar,
  Portal,
  Modal,
} from 'react-native-paper';

import { Pokemon } from '@/@types/pokemon';
import { useTeam, TeamMember } from '@/context/TeamContext';
import { GOD_TEAM_IDS } from '@/data/legendaries';
import { getNextEvolutionId, getPokemonById } from '@/integration/pokemonIntegration';
import {
  getTypeColor,
  capitalize,
  calcDamage,
  effectivenessLabel,
  hpColor,
  maxHpFor,
} from '@/utils/pokemon';
import StatBar from '@/component/statBar';
import PokemonCard from '@/component/pokemonCard';

type Props = {
  allPokemons: Pokemon[];
  legendaries: Pokemon[];
};

type Result = 'win' | 'lose' | null;
type OpponentKind = 'normal' | 'rare' | 'legendary';
type Reward = { kind: 'pick' | 'legendary'; options: Pokemon[] } | null;

function pickRandom(arr: Pokemon[], n: number): Pokemon[] {
  const copy = [...arr];
  const out: Pokemon[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

export default function Battle({ allPokemons, legendaries }: Props) {
  const {
    team,
    setTeam,
    healTeam,
    summonGods,
    addPokemon,
    addMemberWin,
    evolveMember,
    stats,
    startBattleCount,
    recordWin,
    recordLoss,
  } = useTeam();

  const [opponent, setOpponent] = useState<TeamMember | null>(null);
  const [opponentKind, setOpponentKind] = useState<OpponentKind>('normal');
  const [activeIndex, setActiveIndex] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [result, setResult] = useState<Result>(null);
  const [snack, setSnack] = useState('');
  const [reward, setReward] = useState<Reward>(null);

  const firstAlive = (members: TeamMember[]) =>
    members.findIndex((m) => m.currentHp > 0);

  const teamWiped = firstAlive(team) === -1;

  const startBattle = () => {
    const alive = firstAlive(team);
    if (alive === -1) return;

    const n = startBattleCount();
    let pool = allPokemons;
    let kind: OpponentKind = 'normal';
    if (n % 20 === 0 && legendaries.length > 0) {
      pool = legendaries;
      kind = 'legendary';
    } else if (n % 5 === 0) {
      kind = 'rare';
    }

    const random = pool[Math.floor(Math.random() * pool.length)];
    const hpMult = kind === 'legendary' ? 1.6 : kind === 'rare' ? 1.25 : 1;
    const maxHp = Math.round(maxHpFor(random) * hpMult);

    setOpponent({ id: 'opp', pokemon: random, maxHp, currentHp: maxHp, wins: 0 });
    setOpponentKind(kind);
    setActiveIndex(alive);
    setResult(null);

    const intro =
      kind === 'legendary'
        ? `⚡ Um LENDÁRIO ${capitalize(random.nome)} apareceu!`
        : kind === 'rare'
        ? `✨ Um ${capitalize(random.nome)} raro apareceu!`
        : `Um ${capitalize(random.nome)} selvagem apareceu!`;
    setLog([intro]);
  };

  /** Recompensas e evolução após uma vitória. */
  const onWin = (winner: TeamMember) => {
    const newWins = stats.wins + 1;
    if (newWins % 20 === 0 && legendaries.length > 0) {
      setReward({ kind: 'legendary', options: pickRandom(legendaries, 1) });
    } else if (newWins % 5 === 0) {
      setReward({ kind: 'pick', options: pickRandom(allPokemons, 3) });
    }
    maybeEvolve(winner);
  };

  const maybeEvolve = async (winner: TeamMember) => {
    const memberWins = winner.wins + 1;
    addMemberWin(winner.id);
    if (memberWins % 3 !== 0) return;
    try {
      const nextId = await getNextEvolutionId(Number(winner.pokemon.index));
      if (!nextId) return;
      const evolved = await getPokemonById(nextId);
      evolveMember(winner.id, evolved);
      setSnack(`✨ ${capitalize(winner.pokemon.nome)} evoluiu para ${capitalize(evolved.nome)}!`);
    } catch (e) {
      // ignora falha de evolução
    }
  };

  const claim = (pokemon: Pokemon) => {
    const dest = addPokemon(pokemon);
    setReward(null);
    setSnack(
      `${capitalize(pokemon.nome)} ${dest === 'team' ? 'entrou para a equipe!' : 'foi para a bolsa!'}`
    );
  };

  const commit = (
    teamCopy: TeamMember[],
    opp: TeamMember,
    active: number,
    newLog: string[],
    res: Result
  ) => {
    setTeam(teamCopy);
    setOpponent(opp);
    setActiveIndex(active);
    setLog(newLog);
    if (res === 'win') {
      recordWin(opponentKind === 'legendary');
      onWin(teamCopy[active]);
    } else if (res === 'lose') {
      recordLoss();
    }
    if (res) setResult(res);
  };

  /** Um turno completo: jogador ataca e, se sobreviver, o oponente revida. */
  const attack = () => {
    if (!opponent || result) return;

    const teamCopy = team.map((m) => ({ ...m }));
    const opp = { ...opponent };
    const newLog = [...log];

    let active =
      teamCopy[activeIndex].currentHp > 0 ? activeIndex : firstAlive(teamCopy);
    if (active === -1) return;

    const playerHit = calcDamage(teamCopy[active].pokemon, opp.pokemon);
    opp.currentHp = Math.max(0, opp.currentHp - playerHit.damage);
    newLog.push(
      `${capitalize(teamCopy[active].pokemon.nome)} atacou e causou ${playerHit.damage} de dano.${effectivenessLabel(playerHit.multiplier)}`
    );

    if (opp.currentHp <= 0) {
      newLog.push(`${capitalize(opp.pokemon.nome)} desmaiou! Você venceu a batalha!`);
      commit(teamCopy, opp, active, newLog, 'win');
      return;
    }

    const oppHit = calcDamage(opp.pokemon, teamCopy[active].pokemon);
    teamCopy[active].currentHp = Math.max(0, teamCopy[active].currentHp - oppHit.damage);
    newLog.push(
      `${capitalize(opp.pokemon.nome)} revidou e causou ${oppHit.damage} de dano.${effectivenessLabel(oppHit.multiplier)}`
    );

    if (teamCopy[active].currentHp <= 0) {
      newLog.push(`${capitalize(teamCopy[active].pokemon.nome)} desmaiou!`);
      const next = firstAlive(teamCopy);
      if (next === -1) {
        newLog.push('Toda a sua equipe desmaiou... Você perdeu.');
        commit(teamCopy, opp, 0, newLog, 'lose');
        return;
      }
      newLog.push(`Vai, ${capitalize(teamCopy[next].pokemon.nome)}!`);
      active = next;
    }

    commit(teamCopy, opp, active, newLog, null);
  };

  /** Resolve a batalha inteira de uma vez. */
  const autoBattle = () => {
    if (!opponent || result) return;

    const teamCopy = team.map((m) => ({ ...m }));
    const opp = { ...opponent };
    const newLog = [...log];
    let active =
      teamCopy[activeIndex].currentHp > 0 ? activeIndex : firstAlive(teamCopy);
    let turns = 0;

    while (active !== -1 && opp.currentHp > 0 && turns < 300) {
      turns++;
      const playerHit = calcDamage(teamCopy[active].pokemon, opp.pokemon);
      opp.currentHp = Math.max(0, opp.currentHp - playerHit.damage);
      newLog.push(
        `${capitalize(teamCopy[active].pokemon.nome)} causou ${playerHit.damage} de dano.${effectivenessLabel(playerHit.multiplier)}`
      );
      if (opp.currentHp <= 0) {
        newLog.push(`${capitalize(opp.pokemon.nome)} desmaiou! Você venceu a batalha!`);
        break;
      }

      const oppHit = calcDamage(opp.pokemon, teamCopy[active].pokemon);
      teamCopy[active].currentHp = Math.max(0, teamCopy[active].currentHp - oppHit.damage);
      newLog.push(
        `${capitalize(opp.pokemon.nome)} causou ${oppHit.damage} de dano.${effectivenessLabel(oppHit.multiplier)}`
      );
      if (teamCopy[active].currentHp <= 0) {
        newLog.push(`${capitalize(teamCopy[active].pokemon.nome)} desmaiou!`);
        const next = firstAlive(teamCopy);
        if (next === -1) {
          newLog.push('Toda a sua equipe desmaiou... Você perdeu.');
          break;
        }
        newLog.push(`Vai, ${capitalize(teamCopy[next].pokemon.nome)}!`);
        active = next;
      }
    }

    const finalResult: Result =
      opp.currentHp <= 0 ? 'win' : firstAlive(teamCopy) === -1 ? 'lose' : null;
    commit(teamCopy, opp, active === -1 ? 0 : active, newLog, finalResult);
  };

  const switchTo = (idx: number) => {
    if (result || team[idx].currentHp <= 0 || idx === activeIndex) return;
    setActiveIndex(idx);
    setLog((prev) => [...prev, `Vai, ${capitalize(team[idx].pokemon.nome)}!`]);
  };

  /** Botão oculto: invoca os deuses (trocam os 4 primeiros da equipe). */
  const handleSummon = () => {
    const gods = legendaries.filter((p) => GOD_TEAM_IDS.includes(Number(p.index)));
    if (gods.length === 0) return;
    summonGods(gods);
    setSnack('⚡ Os deuses entraram! Os 4 primeiros foram para a bolsa.');
  };

  const player = team[activeIndex];
  const opponentLabel =
    opponentKind === 'legendary'
      ? '⚡ LENDÁRIO'
      : opponentKind === 'rare'
      ? '✨ Encontro raro'
      : 'Oponente selvagem';

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topChips}>
          <Chip icon="trophy" compact style={styles.winsChip}>
            {`${stats.wins}`}
          </Chip>
          <Chip icon="sword-cross" compact style={styles.battleChip}>
            {`Luta #${stats.battles + (opponent && !result ? 0 : 1)}`}
          </Chip>
        </View>
        <Button
          mode="contained"
          icon="heart-plus"
          compact
          buttonColor="#2e9e5b"
          onPress={healTeam}
        >
          Curar
        </Button>
      </View>

      <Card
        mode="elevated"
        style={[styles.arena, opponentKind === 'legendary' && styles.arenaLegendary]}
      >
        <Card.Content>
          {opponent ? (
            <Combatant member={opponent} label={opponentLabel} align="right" />
          ) : (
            <View style={styles.emptyOpponent}>
              <Text variant="bodyMedium" style={styles.muted}>
                Nenhum oponente
              </Text>
            </View>
          )}

          {/* Botão OCULTO: segure o "VS" para invocar os deuses */}
          <Pressable onLongPress={handleSummon} delayLongPress={600}>
            <Avatar.Text size={40} label="VS" style={styles.vs} color="#fff" />
          </Pressable>

          {player ? <Combatant member={player} label="Você" align="left" /> : null}
        </Card.Content>
      </Card>

      {result && (
        <Surface
          style={[
            styles.banner,
            { backgroundColor: result === 'win' ? '#2e9e5b' : '#374151' },
          ]}
          elevation={2}
        >
          <Text variant="titleMedium" style={styles.bannerText}>
            {result === 'win' ? '🎉 Vitória!' : '💀 Derrota...'}
          </Text>
        </Surface>
      )}

      <Surface style={styles.logBox} elevation={1}>
        <ScrollView contentContainerStyle={styles.logContent}>
          {[...log].reverse().map((line, i) => (
            <Text key={i} variant="bodySmall" style={styles.logLine}>
              • {line}
            </Text>
          ))}
          {log.length === 0 && (
            <Text variant="bodyMedium" style={styles.logHint}>
              Procure um oponente para iniciar a batalha.
            </Text>
          )}
        </ScrollView>
      </Surface>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bench}
      >
        {team.map((m, idx) => {
          const fainted = m.currentHp <= 0;
          const isActive = idx === activeIndex;
          return (
            <TouchableRipple
              key={m.id}
              onPress={() => switchTo(idx)}
              borderless
              style={[
                styles.benchItem,
                isActive && styles.benchActive,
                fainted && styles.benchFainted,
              ]}
            >
              <Image source={{ uri: m.pokemon.imagem }} style={styles.benchImg} />
            </TouchableRipple>
          );
        })}
      </ScrollView>

      <View style={styles.actions}>
        {!opponent || result ? (
          <Button
            mode="contained"
            icon="magnify"
            disabled={teamWiped}
            onPress={startBattle}
            style={styles.action}
            contentStyle={styles.actionContent}
          >
            {teamWiped ? 'Cure sua equipe primeiro' : 'Procurar oponente'}
          </Button>
        ) : (
          <>
            <Button
              mode="contained"
              icon="sword"
              onPress={attack}
              style={styles.action}
              contentStyle={styles.actionContent}
            >
              Atacar
            </Button>
            <Button
              mode="contained-tonal"
              icon="fast-forward"
              onPress={autoBattle}
              style={styles.actionAuto}
              contentStyle={styles.actionContent}
            >
              Auto
            </Button>
          </>
        )}
      </View>

      {/* Modal de recompensa (a cada 5 / 20 vitórias) */}
      <Portal>
        <Modal
          visible={!!reward}
          onDismiss={() => setReward(null)}
          contentContainerStyle={styles.rewardModal}
        >
          {reward && (
            <Surface style={styles.rewardSheet} elevation={5}>
              <Text variant="titleLarge" style={styles.rewardTitle}>
                {reward.kind === 'legendary'
                  ? '⚡ Lendário encontrado!'
                  : '🎁 Recompensa de vitórias!'}
              </Text>
              <Text variant="bodyMedium" style={styles.rewardSubtitle}>
                {reward.kind === 'legendary'
                  ? 'Toque para adicionar à sua equipe'
                  : 'Escolha 1 Pokémon para o seu time'}
              </Text>
              <View style={styles.rewardOptions}>
                {reward.options.map((p) => (
                  <PokemonCard key={p.index} pokemon={p} onPress={() => claim(p)} />
                ))}
              </View>
            </Surface>
          )}
        </Modal>
      </Portal>

      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack('')}
        duration={3500}
        style={styles.snackbar}
      >
        {snack}
      </Snackbar>
    </View>
  );
}

function Combatant({
  member,
  label,
  align,
}: {
  member: TeamMember;
  label: string;
  align: 'left' | 'right';
}) {
  const { pokemon, currentHp, maxHp } = member;
  const mainColor = getTypeColor(pokemon.tipos[0]);
  const ratio = maxHp > 0 ? currentHp / maxHp : 0;

  return (
    <View
      style={[
        styles.combatant,
        align === 'right' ? styles.alignRight : styles.alignLeft,
      ]}
    >
      <View style={styles.combatantInfo}>
        <Text variant="labelSmall" style={styles.combatantLabel}>
          {label.toUpperCase()}
        </Text>
        <Text variant="titleMedium" style={styles.combatantName}>
          {capitalize(pokemon.nome)}
        </Text>
        <StatBar
          value={currentHp}
          max={maxHp}
          color={hpColor(ratio)}
          valueText={`${currentHp}/${maxHp}`}
        />
      </View>
      <View style={[styles.combatantImgWrap, { backgroundColor: mainColor + '22' }]}>
        <Image source={{ uri: pokemon.imagem }} style={styles.combatantImg} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  topChips: {
    flexDirection: 'row',
    gap: 8,
  },
  winsChip: {
    backgroundColor: '#FFE08C',
  },
  battleChip: {
    backgroundColor: '#E3E1E8',
  },
  arena: {
    backgroundColor: '#fff',
  },
  arenaLegendary: {
    borderWidth: 2,
    borderColor: '#D32F2F',
  },
  combatant: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alignLeft: {
    flexDirection: 'row',
  },
  alignRight: {
    flexDirection: 'row-reverse',
  },
  combatantInfo: {
    flex: 1,
  },
  combatantLabel: {
    color: '#9aa0a6',
    fontWeight: '700',
  },
  combatantName: {
    fontWeight: '800',
    marginBottom: 6,
  },
  combatantImgWrap: {
    borderRadius: 50,
    padding: 6,
  },
  combatantImg: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
  },
  emptyOpponent: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: {
    color: '#9aa0a6',
  },
  vs: {
    alignSelf: 'center',
    backgroundColor: '#D32F2F',
    marginVertical: 6,
  },
  banner: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  bannerText: {
    color: '#fff',
    fontWeight: '900',
  },
  logBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginTop: 12,
  },
  logContent: {
    padding: 12,
  },
  logLine: {
    color: '#374151',
    marginBottom: 6,
    lineHeight: 18,
  },
  logHint: {
    color: '#9aa0a6',
    textAlign: 'center',
    marginTop: 20,
  },
  bench: {
    gap: 10,
    paddingVertical: 12,
  },
  benchItem: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  benchActive: {
    borderColor: '#D32F2F',
  },
  benchFainted: {
    opacity: 0.4,
  },
  benchImg: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  action: {
    flex: 1,
    borderRadius: 12,
  },
  actionAuto: {
    flex: 0.6,
    borderRadius: 12,
  },
  actionContent: {
    height: 48,
  },
  rewardModal: {
    padding: 20,
  },
  rewardSheet: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
  },
  rewardTitle: {
    fontWeight: '900',
    textAlign: 'center',
  },
  rewardSubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  rewardOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  snackbar: {
    backgroundColor: '#1B1B1F',
  },
});
