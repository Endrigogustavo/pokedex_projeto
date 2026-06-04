import React from 'react';
import { View, Image, StyleSheet, ScrollView } from 'react-native';
import { Portal, Appbar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Pokemon } from '@/@types/pokemon';
import { getTypeColor, statLabel, capitalize, contrastText } from '@/utils/pokemon';
import StatBar from '@/component/statBar';

const STAT_MAX = 180;

type Props = {
  pokemon: Pokemon | null;
  onClose: () => void;
};

export default function PokemonDetail({ pokemon, onClose }: Props) {
  if (!pokemon) return null;

  const mainColor = getTypeColor(pokemon.tipos[0]);
  const onColor = contrastText(mainColor);
  const isDark = onColor === '#ffffff';
  const chipBg = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.13)';
  const total = pokemon.poderes.reduce((sum, p) => sum + Number(p.forca), 0);

  return (
    <Portal>
      <View style={styles.fullscreen}>
        <View style={[styles.hero, { backgroundColor: mainColor }]}>
          <Appbar.Header style={styles.appbar}>
            <Appbar.BackAction
              onPress={onClose}
              accessibilityLabel="Voltar"
              color={onColor}
            />
            <Appbar.Content title="" />
            <Text variant="titleMedium" style={[styles.headerIndex, { color: onColor }]}>
              #{pokemon.index}
            </Text>
            <View style={{ width: 12 }} />
          </Appbar.Header>

          <MaterialCommunityIcons
            name="pokeball"
            size={230}
            color={isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.07)'}
            style={styles.watermark}
          />

          <Image source={{ uri: pokemon.imagem }} style={styles.image} />
          <Text variant="headlineMedium" style={[styles.name, { color: onColor }]}>
            {capitalize(pokemon.nome)}
          </Text>
          <View style={styles.chips}>
            {pokemon.tipos.map((tipo) => (
              <View key={tipo} style={[styles.chip, { backgroundColor: chipBg }]}>
                <Text variant="labelLarge" style={[styles.chipText, { color: onColor }]}>
                  {capitalize(tipo)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Status base
          </Text>

          {pokemon.poderes.map((poder) => (
            <StatBar
              key={poder.nome}
              label={statLabel(poder.nome)}
              value={Number(poder.forca)}
              max={STAT_MAX}
              color={mainColor}
            />
          ))}

          <View style={styles.totalRow}>
            <Text variant="titleMedium" style={styles.totalLabel}>
              Total
            </Text>
            <Text variant="titleMedium" style={styles.totalValue}>
              {total}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3F4F8',
  },
  hero: {
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
  appbar: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  headerIndex: {
    color: '#fff',
    fontWeight: '900',
  },
  watermark: {
    position: 'absolute',
    top: 30,
    alignSelf: 'center',
  },
  image: {
    width: 320,
    height: 320,
    resizeMode: 'contain',
  },
  name: {
    color: '#fff',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  chips: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  chipText: {
    color: '#fff',
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 18,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E3E1E8',
  },
  totalLabel: {
    fontWeight: '800',
    color: '#49454F',
  },
  totalValue: {
    fontWeight: '900',
    color: '#1a1a1a',
  },
});
