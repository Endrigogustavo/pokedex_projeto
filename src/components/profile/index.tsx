import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
} from 'react-native';
import { Card, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useTeam } from '@/context/TeamContext';
import { useAuth } from '@/context/AuthContext';
import { evaluateAchievements } from '@/constants/achievements';
import { Stats } from '@/context/TeamContext';
import { capitalize, getTypeColor } from '@/constants/pokemon';
import StatBar from '@/components/statBar';
import { styles } from './styles';

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
