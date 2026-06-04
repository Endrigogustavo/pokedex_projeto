import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, Text, Button } from 'react-native-paper';

import { Pokemon } from '@/@types/pokemon';
import { TEAM_SIZE } from '@/data/starters';
import PokemonCard from '@/component/pokemonCard';

type Props = {
  pool: Pokemon[];
  onConfirm: (pokemons: Pokemon[]) => void;
};

export default function TeamSelect({ pool, onConfirm }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

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

  const complete = selected.length === TEAM_SIZE;

  return (
    <View style={styles.screen}>
      <Appbar.Header style={styles.appbar} mode="center-aligned" dark>
        <Appbar.Content title="Monte sua equipe" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <Text variant="bodyMedium" style={styles.intro}>
        Escolha {TEAM_SIZE} Pokémons iniciais para começar sua jornada
      </Text>

      <FlatList
        data={pool}
        keyExtractor={(item) => item.index}
        numColumns={3}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            selected={selected.includes(item.index)}
            onPress={() => toggle(item.index)}
          />
        )}
      />

      <View style={styles.footer}>
        <Button
          mode="contained"
          icon="check-bold"
          disabled={!complete}
          onPress={handleConfirm}
          style={styles.confirm}
          contentStyle={styles.confirmContent}
          labelStyle={styles.confirmLabel}
        >
          {complete
            ? 'Confirmar equipe'
            : `Selecione ${TEAM_SIZE - selected.length} Pokémon(s)`}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F4F8',
  },
  appbar: {
    backgroundColor: '#D32F2F',
  },
  appbarTitle: {
    fontWeight: '900',
  },
  intro: {
    textAlign: 'center',
    color: '#49454F',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  column: {
    gap: 12,
    marginBottom: 12,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
  confirm: {
    borderRadius: 14,
  },
  confirmContent: {
    height: 52,
  },
  confirmLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
