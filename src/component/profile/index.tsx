import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Text,
} from 'react-native';
import { Card, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useTeam } from '@/context/TeamContext';
import { useAuth } from '@/context/AuthContext';
import { evaluateAchievements } from '@/utils/achievements';
import { Stats } from '@/context/TeamContext';
import { capitalize, getTypeColor } from '@/utils/pokemon';
import StatBar from '@/component/statBar';

type Props = {
  total: number;
};

export default function Profile({ total }: Props) {
  const { team, bag } = useTeam();
  const { user, userStats, signOut, refreshStats } = useAuth();
  const theme  = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    refreshStats();
  }, []);

  const owned       = team.length + bag.length;
  const dexProgress = total > 0 ? owned / total : 0;
  const level       = userStats?.level ?? 1;
  const vitorias    = userStats?.vitorias ?? 0;
  const derrotas    = userStats?.derrotas ?? 0;

  // Conquistas avaliadas a partir das estatísticas da nuvem.
  const cloudStats: Stats = {
    battles: vitorias + derrotas,
    wins: vitorias,
    losses: derrotas,
    streak: 0,
    bestStreak: 0,
    legendariesDefeated: 0,
  };
  const achievements = evaluateAchievements(cloudStats);
  const unlocked     = achievements.filter((a) => a.unlocked).length;

  const summary = [
    { label: 'Nível',    value: level,    icon: 'star',          color: '#F59E0B' },
    { label: 'Vitórias', value: vitorias, icon: 'trophy',        color: '#2E9E5B' },
    { label: 'Derrotas', value: derrotas, icon: 'skull-outline', color: '#9E9E9E' },
    { label: 'Capturas', value: owned,    icon: 'pokeball',      color: '#CC0000' },
  ];

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Cabeçalho do perfil ── */}
      <View style={[styles.headerCard, { backgroundColor: theme.colors.primary }]}>
        <MaterialCommunityIcons
          name="pokeball"
          size={200}
          color="rgba(255,255,255,0.10)"
          style={styles.headerBall}
          pointerEvents="none"
        />

        <View style={styles.avatar}>
          {team[0] ? (
            <Image source={{ uri: team[0].pokemon.imagem }} style={styles.avatarImg} />
          ) : (
            <MaterialCommunityIcons name="account" size={44} color="#CC0000" />
          )}
        </View>

        <Text style={styles.trainerName}>{capitalize(user ?? 'Treinador')}</Text>
        <View style={styles.levelPill}>
          <MaterialCommunityIcons name="shield-star" size={13} color="#fff" />
          <Text style={styles.levelText}>Treinador Nível {level}</Text>
        </View>
      </View>

      {/* ── Resumo (4 métricas) ── */}
      <View style={styles.summaryRow}>
        {summary.map((s) => (
          <View key={s.label} style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: s.color + '18' }]}>
              <MaterialCommunityIcons name={s.icon as any} size={20} color={s.color} />
            </View>
            <Text style={styles.summaryValue}>{s.value}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Progresso da Pokédex ── */}
      <Card mode="elevated" style={styles.progressCard} elevation={1}>
        <View style={styles.blockPad}>
          <View style={styles.blockHeader}>
            <Text style={styles.blockTitle}>Progresso da Pokédex</Text>
            <Text style={[styles.blockValue, { color: theme.colors.primary }]}>
              {owned}/{total}
            </Text>
          </View>
          <StatBar
            value={owned}
            max={total || 1}
            color={theme.colors.primary}
            valueText={`${Math.round(dexProgress * 100)}%`}
          />
        </View>
      </Card>

      {/* ── Showcase do time ── */}
      {team.length > 0 && (
        <View style={styles.block}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Meu Time</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.teamRow}
          >
            {team.map((m) => {
              const color = getTypeColor(m.pokemon.tipos[0]);
              return (
                <View key={m.id} style={styles.teamItem}>
                  <View style={[styles.teamAvatar, { backgroundColor: color + '22', borderColor: color }]}>
                    <Image source={{ uri: m.pokemon.imagem }} style={styles.teamImg} />
                  </View>
                  <Text style={styles.teamName} numberOfLines={1}>
                    {capitalize(m.pokemon.nome)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── Conquistas ── */}
      <View style={styles.block}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Conquistas</Text>
          <Text style={styles.sectionCount}>
            {unlocked}/{achievements.length}
          </Text>
        </View>

        {achievements.map((a) => (
          <Card key={a.id} mode="elevated" style={styles.achCard} elevation={1}>
            <View style={styles.achContent}>
              <View
                style={[
                  styles.achIcon,
                  { backgroundColor: a.unlocked ? theme.colors.primary : '#C5C9D3' },
                ]}
              >
                <MaterialCommunityIcons
                  name={(a.unlocked ? a.icon : 'lock') as any}
                  size={20}
                  color="#fff"
                />
              </View>

              <View style={styles.achInfo}>
                <View style={styles.achTitleRow}>
                  <Text style={styles.achTitle} numberOfLines={1}>{a.title}</Text>
                  {a.unlocked && <Text style={styles.achDone}>✓</Text>}
                </View>
                <Text style={styles.achDesc}>{a.description}</Text>
                <StatBar
                  value={a.value}
                  max={a.target}
                  color={a.unlocked ? theme.colors.primary : '#C5C9D3'}
                  valueText={`${a.value}/${a.target}`}
                />
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* ── Sair ── */}
      <Button
        mode="outlined"
        icon="logout"
        onPress={handleLogout}
        style={styles.logoutBtn}
        textColor="#CC0000"
      >
        Sair da conta
      </Button>

      <View style={{ height: insets.bottom + 8 }} />
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
  headerCard: {
    borderRadius: 24,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 22,
    overflow: 'hidden',
    marginBottom: 16,
  },
  headerBall: {
    position: 'absolute',
    top: -30,
    right: -40,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  avatarImg: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
  },
  trainerName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 12,
    letterSpacing: 0.3,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1B1B1F',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  block: {
    marginBottom: 16,
  },
  progressCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
  },
  blockPad: {
    padding: 16,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B1B1F',
  },
  blockValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B1B1F',
    letterSpacing: -0.1,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  teamRow: {
    gap: 14,
    paddingVertical: 2,
    paddingRight: 8,
  },
  teamItem: {
    alignItems: 'center',
    width: 72,
  },
  teamAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  teamImg: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  teamName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#49454F',
    textAlign: 'center',
  },
  achCard: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 16,
  },
  achContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  achIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  achInfo: {
    flex: 1,
  },
  achTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  achTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1B1B1F',
    flex: 1,
  },
  achDone: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2E9E5B',
    marginLeft: 8,
  },
  achDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  logoutBtn: {
    borderRadius: 14,
    borderColor: '#CC0000',
    marginTop: 4,
  },
});
