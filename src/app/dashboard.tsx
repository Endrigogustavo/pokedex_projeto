import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, BottomNavigation, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { getPokemon } from '@/integration/pokemonIntegration';
import { Pokemon } from '@/@types/pokemon';
import { STARTER_IDS } from '@/data/starters';
import { TeamProvider, useTeam } from '@/context/TeamContext';
import { useAuth } from '@/context/AuthContext';

import Pokeball from '@/component/pokeball';
import TeamSelect from '@/component/teamSelect';
import TeamView from '@/component/teamView';
import PokedexGrid from '@/component/pokedexGrid';
import Battle from '@/component/battle';
import Profile from '@/component/profile';

export default function Dashboard() {
  return (
    <TeamProvider>
      <DashboardInner />
    </TeamProvider>
  );
}

function DashboardInner() {
  const { hasTeam, createTeam, loadSavedTeam } = useTeam();
  const { isAuthenticated, isLoading: authLoading, userId, signOut } = useAuth();
  const theme  = useTheme();
  const router = useRouter();

  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading]         = useState(true);
  const [hydrating, setHydrating]     = useState(true);
  const [navIndex, setNavIndex]       = useState(0);
  const hydratedRef = useRef(false);

  const [routes] = useState([
    { key: 'equipe',  title: 'Equipe',  focusedIcon: 'account-group', unfocusedIcon: 'account-group-outline' },
    { key: 'pokedex', title: 'Pokédex', focusedIcon: 'pokeball',      unfocusedIcon: 'pokeball'              },
    { key: 'batalha', title: 'Batalha', focusedIcon: 'sword-cross',   unfocusedIcon: 'sword'                 },
    { key: 'perfil',  title: 'Perfil',  focusedIcon: 'account-circle',unfocusedIcon: 'account-circle-outline'},
  ]);

  // Guarda de autenticação: sem sessão volta para o login.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated]);

  // Carrega a lista de Pokémons da PokéAPI.
  useEffect(() => {
    getPokemon()
      .then(setAllPokemons)
      .finally(() => setLoading(false));
  }, []);

  // Carrega a equipe salva no dispositivo (uma vez) assim que houver sessão.
  // Se não houver nada salvo, cai na seleção de iniciais (TeamSelect).
  useEffect(() => {
    if (hydratedRef.current) return;
    if (authLoading || !userId) return;

    hydratedRef.current = true;
    loadSavedTeam().finally(() => setHydrating(false));
  }, [authLoading, userId]);

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  const starterPool = useMemo(
    () => allPokemons.filter((p) => STARTER_IDS.includes(Number(p.index))),
    [allPokemons]
  );

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'equipe':  return <TeamView />;
      case 'pokedex': return <PokedexGrid pokemons={allPokemons} />;
      case 'batalha': return <Battle allPokemons={allPokemons} />;
      case 'perfil':  return <Profile total={allPokemons.length} />;
      default:        return null;
    }
  };

  if (loading || authLoading || hydrating) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.colors.primary }]}>
        <Pokeball size={96} spinning />
        <Text variant="headlineSmall" style={styles.loaderBrand}>
          PokeFight
        </Text>
        <Text variant="bodyMedium" style={styles.loaderText}>
          Carregando Pokémons…
        </Text>
      </View>
    );
  }

  if (!hasTeam) {
    return <TeamSelect pool={starterPool} onConfirm={createTeam} />;
  }

  return (
    <View style={styles.screen}>
      <Appbar.Header
        style={[styles.appbar, { backgroundColor: theme.colors.primary }]}
        mode="center-aligned"
        dark
      >
        <Appbar.Content title="PokeFight" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="logout" onPress={handleLogout} color="#fff" />
      </Appbar.Header>

      <BottomNavigation
        navigationState={{ index: navIndex, routes }}
        onIndexChange={setNavIndex}
        renderScene={renderScene}
        barStyle={styles.tabBar}
        activeColor={theme.colors.primary}
        inactiveColor="#9E9E9E"
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
    gap: 8,
  },
  loaderBrand: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 24,
  },
  loaderText: {
    color: 'rgba(255,255,255,0.85)',
  },
  appbar: {
    elevation: 0,
    shadowOpacity: 0,
  },
  appbarTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 22,
    letterSpacing: 0.5,
  },
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E7E0EC',
  },
});
