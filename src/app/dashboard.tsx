import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, BottomNavigation, Text } from 'react-native-paper';

import { getPokemon, getPokemonsByIds } from '@/integration/pokemonIntegration';
import { Pokemon } from '@/@types/pokemon';
import { STARTER_IDS } from '@/data/starters';
import { LEGENDARY_IDS } from '@/data/legendaries';
import { TeamProvider, useTeam } from '@/context/TeamContext';

import Pokeball from '@/component/pokeball';
import TeamSelect from '@/component/teamSelect';
import TeamView from '@/component/teamView';
import PokedexGrid from '@/component/pokedexGrid';
import Battle from '@/component/battle';
import Achievements from '@/component/achievements';

export default function Dashboard() {
  return (
    <TeamProvider>
      <DashboardInner />
    </TeamProvider>
  );
}

function DashboardInner() {
  const { hasTeam, createTeam } = useTeam();
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [legendaries, setLegendaries] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [navIndex, setNavIndex] = useState(0);

  const [routes] = useState([
    { key: 'equipe', title: 'Equipe', focusedIcon: 'bag-personal' },
    { key: 'pokedex', title: 'Pokédex', focusedIcon: 'pokeball' },
    //{ key: 'batalha', title: 'Batalha', focusedIcon: 'sword-cross' },
    { key: 'conquistas', title: 'Conquistas', focusedIcon: 'trophy' },
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, lendarios] = await Promise.all([
          getPokemon(),
          getPokemonsByIds(LEGENDARY_IDS),
        ]);
        setAllPokemons(data);
        setLegendaries(lendarios);
      } catch (error) {
        // erro de carregamento pode ser tratado aqui
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const starterPool = useMemo(
    () => allPokemons.filter((p) => STARTER_IDS.includes(Number(p.index))),
    [allPokemons]
  );

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'equipe':
        return <TeamView />;
      case 'pokedex':
        return <PokedexGrid pokemons={allPokemons} />;
     // case 'batalha':
       // return <Battle allPokemons={allPokemons} legendaries={legendaries} />;
      case 'conquistas':
        return <Achievements />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <Pokeball size={90} spinning />
        <Text variant="titleMedium" style={styles.loaderText}>
          Carregando Pokémons...
        </Text>
      </View>
    );
  }

  if (!hasTeam) {
    return <TeamSelect pool={starterPool} onConfirm={createTeam} />;
  }

  return (
    <View style={styles.screen}>
      <Appbar.Header style={styles.appbar} mode="center-aligned" dark>
        <Appbar.Content title="Pokédex Battle" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <BottomNavigation
        navigationState={{ index: navIndex, routes }}
        onIndexChange={setNavIndex}
        renderScene={renderScene}
        barStyle={styles.bar}
        activeColor="#D32F2F"
        inactiveColor="#9aa0a6"
        sceneAnimationEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F8',
    gap: 16,
  },
  loaderText: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  appbar: {
    backgroundColor: '#D32F2F',
  },
  appbarTitle: {
    fontWeight: '900',
  },
  bar: {
    backgroundColor: '#fff',
  },
});
