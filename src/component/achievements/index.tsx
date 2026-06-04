import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Avatar, useTheme } from 'react-native-paper';

import { useTeam } from '@/context/TeamContext';
import { evaluateAchievements } from '@/utils/achievements';
import StatBar from '@/component/statBar';

export default function Achievements() {
  const { stats } = useTeam();
  const theme = useTheme();
  const achievements = evaluateAchievements(stats);

  const metrics = [
    { label: 'Batalhas', value: stats.battles, icon: 'sword-cross', color: '#1565C0' },
    { label: 'Vitórias', value: stats.wins, icon: 'trophy', color: '#2e9e5b' },
    { label: 'Derrotas', value: stats.losses, icon: 'skull-outline', color: '#9aa0a6' },
    { label: 'Sequência', value: stats.streak, icon: 'fire', color: '#F9A825' },
    { label: 'Melhor seq.', value: stats.bestStreak, icon: 'star', color: '#7038F8' },
    { label: 'Lendários', value: stats.legendariesDefeated, icon: 'star-four-points', color: '#D32F2F' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="titleMedium" style={styles.heading}>
        Progresso do treinador
      </Text>

      <View style={styles.metrics}>
        {metrics.map((m) => (
          <Card key={m.label} mode="elevated" style={styles.metricCard}>
            <Card.Content style={styles.metricContent}>
              <Avatar.Icon
                size={38}
                icon={m.icon}
                color="#fff"
                style={{ backgroundColor: m.color }}
              />
              <Text variant="headlineSmall" style={styles.metricValue}>
                {m.value}
              </Text>
              <Text variant="labelMedium" style={styles.metricLabel}>
                {m.label}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Text variant="titleMedium" style={styles.heading}>
        Conquistas
      </Text>

      {achievements.map((a) => (
        <Card key={a.id} mode="elevated" style={styles.achCard}>
          <Card.Content style={styles.achContent}>
            <Avatar.Icon
              size={46}
              icon={a.unlocked ? a.icon : 'lock'}
              color="#fff"
              style={{
                backgroundColor: a.unlocked ? theme.colors.primary : '#c5c9d3',
              }}
            />
            <View style={styles.achInfo}>
              <View style={styles.achTitleRow}>
                <Text variant="titleSmall" style={styles.achTitle}>
                  {a.title}
                </Text>
                {a.unlocked && (
                  <Text variant="labelMedium" style={styles.done}>
                    ✓ Concluído
                  </Text>
                )}
              </View>
              <Text variant="bodySmall" style={styles.achDesc}>
                {a.description}
              </Text>
              <StatBar
                value={a.value}
                max={a.target}
                color={a.unlocked ? theme.colors.primary : '#9aa0a6'}
                valueText={`${a.value}/${a.target}`}
              />
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  heading: {
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 4,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: '30%',
    backgroundColor: '#fff',
  },
  metricContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  metricValue: {
    fontWeight: '900',
    marginTop: 6,
  },
  metricLabel: {
    color: '#6b7280',
  },
  achCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  achContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achInfo: {
    flex: 1,
    marginLeft: 14,
  },
  achTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achTitle: {
    fontWeight: '800',
  },
  done: {
    color: '#2e9e5b',
    fontWeight: '800',
  },
  achDesc: {
    color: '#6b7280',
    marginBottom: 8,
  },
});
