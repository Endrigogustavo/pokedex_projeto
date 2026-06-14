import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Button, ProgressBar, useTheme, Appbar } from 'react-native-paper';

import { Pokemon } from '@/@types/pokemon';
import { TEAM_SIZE } from '@/data/starters';
import PokemonCard from '@/component/pokemonCard';

type Props = {
  pool: Pokemon[];
  onConfirm: (pokemons: Pokemon[]) => void;
};

export default function TeamSelect({ pool, onConfirm }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const theme = useTheme();

  const toggle = (index: string) => {
    setSelected((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length >= TEAM_SIZE) return prev;
      return [...prev, index];
    });
  };

  const handleConfirm = () => {
    onConfirm(pool.filter((p) => selected.includes(p.index)));
  };

  const complete  = selected.length === TEAM_SIZE;
  const remaining = TEAM_SIZE - selected.length;

  return (
    <View style={styles.screen}>
      {/* ── AppBar ── */}
      <Appbar.Header
        style={[styles.appbar, { backgroundColor: theme.colors.primary }]}
        mode="center-aligned"
        dark
      >
        <Appbar.Content title="Monte seu time" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      {/* ── Progresso ── */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {selected.length} de {TEAM_SIZE} selecionados
          </Text>
          {complete && (
            <Text style={[styles.progressDone, { color: theme.colors.primary }]}>
              Pronto!
            </Text>
          )}
        </View>
        <ProgressBar
          progress={selected.length / TEAM_SIZE}
          color={theme.colors.primary}
          style={styles.progressBar}
        />
      </View>

      {/* ── Grade de starters ── */}
      <FlatList
        data={pool}
        keyExtractor={(item) => item.index}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            selected={selected.includes(item.index)}
            onPress={() => toggle(item.index)}
          />
        )}
      />

      {/* ── Botão de confirmar ── */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          disabled={!complete}
          onPress={handleConfirm}
          style={styles.confirmBtn}
          contentStyle={styles.confirmContent}
          labelStyle={styles.confirmLabel}
        >
          {complete ? 'Confirmar equipe' : `Selecione mais ${remaining}`}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  appbar: {
    elevation: 0,
    shadowOpacity: 0,
  },
  appbarTitle: {
    fontWeight: '900',
  },
  progressSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E7E0EC',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#49454F',
  },
  progressDone: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressBar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: '#E7E0EC',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    gap: 10,
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(245,245,248,0.97)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E7E0EC',
  },
  confirmBtn: {
    borderRadius: 16,
  },
  confirmContent: {
    height: 52,
  },
  confirmLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
