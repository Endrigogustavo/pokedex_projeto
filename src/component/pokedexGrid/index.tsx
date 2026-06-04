import React, { useMemo, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';

import { Pokemon } from '@/@types/pokemon';
import PokemonCard from '@/component/pokemonCard';
import PokemonDetail from '@/component/pokemonDetail';

type Props = {
  pokemons: Pokemon[];
};

export default function PokedexGrid({ pokemons }: Props) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Pokemon | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pokemons;
    return pokemons.filter(
      (p) => p.nome.toLowerCase().includes(term) || p.index.includes(term)
    );
  }, [pokemons, search]);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar por nome ou número"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        style={styles.searchbar}
        inputStyle={styles.searchInput}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.index}
        numColumns={3}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text variant="bodyLarge" style={styles.empty}>
            Nenhum Pokémon encontrado
          </Text>
        }
        renderItem={({ item }) => (
          <PokemonCard pokemon={item} onPress={() => setSelected(item)} />
        )}
      />

      <PokemonDetail pokemon={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    margin: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    minHeight: 0,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  column: {
    gap: 12,
    marginBottom: 12,
  },
  empty: {
    textAlign: 'center',
    color: '#9aa0a6',
    marginTop: 40,
  },
});
