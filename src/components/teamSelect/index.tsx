import React, { useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { Button, ProgressBar, useTheme, Appbar } from 'react-native-paper';

import { Pokemon } from '@/@types/pokemon';
import { TEAM_SIZE } from '@/constants/starters';
import PokemonCard from '@/components/pokemonCard';
import { styles } from './styles';

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
      <Appbar.Header
        style={[styles.appbar, { backgroundColor: theme.colors.primary }]}
        mode="center-aligned"
        dark
      >
        <Appbar.Content title="Monte seu time" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

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
