import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  Text,
  BackHandler,
} from 'react-native';
import { Portal, Appbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pokemon } from '@/@types/pokemon';
import { getTypeColor, statLabel, capitalize, contrastText } from '@/utils/pokemon';
import StatBar from '@/component/statBar';

const STAT_MAX     = 180;
const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = {
  pokemon: Pokemon | null;
  onClose: () => void;
};

export default function PokemonDetail({ pokemon, onClose }: Props) {
  const insets = useSafeAreaInsets();

  // Fecha com o botão físico "voltar" do Android quando aberto.
  useEffect(() => {
    if (!pokemon) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [pokemon, onClose]);

  if (!pokemon) return null;

  const mainColor = getTypeColor(pokemon.tipos[0]);
  const onColor   = contrastText(mainColor);
  const isDark    = onColor === '#ffffff';
  const chipBg    = isDark ? 'rgba(255,255,255,0.26)' : 'rgba(0,0,0,0.12)';
  const total     = pokemon.poderes.reduce((s, p) => s + Number(p.forca), 0);

  return (
    <Portal>
      <View style={[styles.fullscreen, { paddingBottom: insets.bottom }]}>

        {/* ─── Hero colorido ─── */}
        <View style={[styles.hero, { backgroundColor: mainColor }]}>
          <Appbar.Header style={styles.appbar}>
            <Appbar.BackAction onPress={onClose} color={onColor} />
            <Appbar.Content title="" />
            <Text style={[styles.heroNumber, { color: onColor }]}>
              #{pokemon.index}
            </Text>
            <View style={{ width: 16 }} />
          </Appbar.Header>

          {/* Pokéball de fundo — wrapper com pointerEvents none deixa o toque passar */}
          <View pointerEvents="none" style={styles.heroBallWrap}>
            <MaterialCommunityIcons
              name="pokeball"
              size={SCREEN_WIDTH * 0.95}
              color={isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)'}
              style={styles.heroBall}
            />
          </View>

          <Image
            source={{ uri: pokemon.imagem }}
            style={[styles.heroImage, { imageRendering: 'pixelated' } as any]}
          />

          <Text style={[styles.heroName, { color: onColor }]}>
            {capitalize(pokemon.nome)}
          </Text>

          {/* Badges de tipo */}
          <View style={styles.typeRow}>
            {pokemon.tipos.map((tipo) => (
              <View key={tipo} style={[styles.typeBadge, { backgroundColor: chipBg }]}>
                <Text style={[styles.typeText, { color: onColor }]}>
                  {capitalize(tipo)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── Corpo / stats ─── */}
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsHeader}>
            <Text style={styles.sectionTitle}>Status Base</Text>
            <View style={[styles.totalPill, { backgroundColor: mainColor + '18' }]}>
              <Text style={[styles.totalText, { color: mainColor }]}>
                Total  {total}
              </Text>
            </View>
          </View>

          {pokemon.poderes.map((poder) => (
            <StatBar
              key={poder.nome}
              label={statLabel(poder.nome)}
              value={Number(poder.forca)}
              max={STAT_MAX}
              color={mainColor}
            />
          ))}
        </ScrollView>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5F5F8',
  },
  hero: {
    alignItems: 'center',
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  appbar: {
    backgroundColor: 'transparent',
    width: '100%',
    elevation: 0,
    shadowOpacity: 0,
  },
  heroNumber: {
    fontSize: 14,
    fontWeight: '800',
    opacity: 0.85,
  },
  heroBallWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '2%',
  },
  heroBall: {},
  heroImage: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.72,
    maxWidth: 300,
    maxHeight: 300,
    resizeMode: 'contain',
  },
  heroName: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  typeBadge: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 24,
    paddingBottom: 40,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1B1B1F',
    letterSpacing: -0.2,
  },
  totalPill: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  totalText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
