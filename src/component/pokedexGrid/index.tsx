import React, { useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView, Pressable, Text } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Pokemon } from '@/@types/pokemon';
import { getTypeColor, capitalize, contrastText } from '@/utils/pokemon';
import PokemonCard from '@/component/pokemonCard';
import PokemonDetail from '@/component/pokemonDetail';

type Props = {
  pokemons: Pokemon[];
};

const ALL = 'all';

export default function PokedexGrid({ pokemons }: Props) {
  const [search, setSearch]     = useState('');
  const [type, setType]         = useState<string>(ALL);
  const [selected, setSelected] = useState<Pokemon | null>(null);

  // Tipos disponíveis (ordenados) a partir dos dados
  const types = useMemo(() => {
    const set = new Set<string>();
    pokemons.forEach((p) => p.tipos.forEach((t) => set.add(t)));
    return [ALL, ...Array.from(set).sort()];
  }, [pokemons]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return pokemons.filter((p) => {
      const matchTerm =
        !term || p.nome.toLowerCase().includes(term) || p.index.includes(term);
      const matchType = type === ALL || p.tipos.includes(type);
      return matchTerm && matchType;
    });
  }, [pokemons, search, type]);

  return (
    <View style={styles.container}>
      {/* ── Cabeçalho ── */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Pokédex</Text>
            <Text style={styles.subtitle}>
              {filtered.length} de {pokemons.length} Pokémons
            </Text>
          </View>
          <View style={styles.titleIcon}>
            <MaterialCommunityIcons name="pokeball" size={26} color="#CC0000" />
          </View>
        </View>

        <Searchbar
          placeholder="Buscar por nome ou número…"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          icon="magnify"
          clearIcon="close-circle"
          elevation={0}
        />
      </View>

      {/* ── Filtros por tipo ── */}
      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {types.map((t) => {
            const active  = type === t;
            const color   = t === ALL ? '#CC0000' : getTypeColor(t);
            const onColor = contrastText(color);
            return (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={[
                  styles.filterChip,
                  active
                    ? { backgroundColor: color, borderColor: color }
                    : { backgroundColor: '#fff', borderColor: '#E7E0EC' },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: active ? onColor : '#49454F' },
                  ]}
                >
                  {t === ALL ? 'Todos' : capitalize(t)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Grade ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.index}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={18}
        windowSize={11}
        removeClippedSubviews
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="magnify-close" size={64} color="#CACAD5" />
            <Text style={styles.emptyTitle}>Nenhum Pokémon encontrado</Text>
            <Text style={styles.emptySub}>Tente outro nome, número ou tipo</Text>
          </View>
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
    backgroundColor: '#F5F5F8',
  },
  header: {
    backgroundColor: '#F5F5F8',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1B1B1F',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 1,
  },
  titleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  searchbar: {
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  searchInput: {
    minHeight: 0,
    fontSize: 14,
  },
  filterWrap: {
    paddingBottom: 6,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 6,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterText: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  row: {
    gap: 10,
    marginBottom: 10,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 40,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#49454F',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});
