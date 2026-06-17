import React, { useMemo, useState } from 'react';
import { View, FlatList, ScrollView, Pressable, Text } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Pokemon } from '@/@types/pokemon';
import { getTypeColor, capitalize, contrastText } from '@/constants/pokemon';
import PokemonCard from '@/components/pokemonCard';
import PokemonDetail from '@/components/pokemonDetail';
import { styles } from './styles';

type Props = {
  pokemons: Pokemon[];
};

const ALL = 'all';

export default function PokedexGrid({ pokemons }: Props) {
  const [search, setSearch]     = useState('');
  const [type, setType]         = useState<string>(ALL);
  const [selected, setSelected] = useState<Pokemon | null>(null);

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
