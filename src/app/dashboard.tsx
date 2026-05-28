import React from 'react';
import { View, StyleSheet } from 'react-native';
import PokemonList from '@/component/pokemonList';

export default function Dashboard() {
  return (
    <View style={styles.container}>
      <PokemonList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
});
