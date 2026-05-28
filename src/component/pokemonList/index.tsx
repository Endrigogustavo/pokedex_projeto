import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getPokemon } from '@/integration/pokemonIntegration';
import { Pokemon } from '@/@types/pokemon';
const PAGE_SIZE = 12;

const PokemonList = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const data = await getPokemon();
        setPokemons(data);
      } catch (error) {
        // Pode adicionar um tratamento de erro aqui
      } finally {
        setLoading(false);
      }
    };
    fetchPokemons();
  }, []);

  const totalPages = Math.ceil(pokemons.length / PAGE_SIZE);
  const paginatedPokemons = pokemons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return <ActivityIndicator size="large" color="#150b80" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={paginatedPokemons}
        keyExtractor={(item) => item.index}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.imagem }} style={styles.image} />
            </View>
            <View style={styles.info}>
              <Text style={styles.index}>#{item.index}</Text>
              <Text style={styles.name}>{item.nome}</Text>
              <View style={styles.typeRow}>
                {item.tipos.map((tipo) => (
                  <View key={tipo} style={[styles.typeBadge, { backgroundColor: getTypeColor(tipo) }]}> 
                    <Text style={styles.typeText}>{tipo}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
      <View style={styles.pagination}>
        <Text
          style={[styles.pageButton, page === 1 && styles.disabledButton]}
          onPress={() => page > 1 && setPage(page - 1)}
        >
          Anterior
        </Text>
        <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
        <Text
          style={[styles.pageButton, page === totalPages && styles.disabledButton]}
          onPress={() => page < totalPages && setPage(page + 1)}
        >
          Próxima
        </Text>
      </View>
    </View>
  );
};

function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    grass: '#78C850', fire: '#F08030', water: '#6890F0', bug: '#A8B820', normal: '#A8A878',
    poison: '#A040A0', electric: '#F8D030', ground: '#E0C068', fairy: '#EE99AC', fighting: '#C03028',
    psychic: '#F85888', rock: '#B8A038', ghost: '#705898', ice: '#98D8D8', dragon: '#7038F8',
    dark: '#705848', steel: '#B8B8D0', flying: '#A890F0',
  };
  return colors[type] || '#AAA';
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  imageContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 8,
    marginRight: 18,
  },
  image: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  info: {
    flex: 1,
  },
  index: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#150b80',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  typeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
    gap: 16,
  },
  pageButton: {
    fontSize: 16,
    color: '#150b80',
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e6e6fa',
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.4,
  },
  pageInfo: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 8,
  },
});

export default PokemonList;
