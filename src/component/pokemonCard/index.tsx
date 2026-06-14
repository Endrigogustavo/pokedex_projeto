import React from 'react';
import { View, Image, StyleSheet, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Pokemon } from '@/@types/pokemon';
import { getTypeColor, capitalize, contrastText } from '@/utils/pokemon';

type Props = {
  pokemon: Pokemon;
  onPress: () => void;
  selected?: boolean;
};

function PokemonCard({ pokemon, onPress, selected }: Props) {
  const mainColor = getTypeColor(pokemon.tipos[0]);
  const onColor   = contrastText(mainColor);
  const isDark    = onColor === '#ffffff';
  const chipBg    = isDark ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.12)';
  const watermark = isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.06)';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: mainColor, borderColor: selected ? '#fff' : 'transparent' },
        pressed && styles.pressed,
      ]}
    >
      {/* Watermark pokéball */}
      <MaterialCommunityIcons
        name="pokeball"
        size={90}
        color={watermark}
        style={styles.watermark}
      />

      {/* Check quando selecionado */}
      {selected && (
        <View style={styles.checkBadge}>
          <MaterialCommunityIcons name="check" size={12} color={mainColor} />
        </View>
      )}

      <View style={styles.body}>
        <Text style={[styles.number, { color: onColor }]}>#{pokemon.index}</Text>

        <Image
          source={{ uri: pokemon.imagem }}
          style={[styles.image, { imageRendering: 'pixelated' } as any]}
          fadeDuration={0}
        />

        <Text numberOfLines={1} style={[styles.name, { color: onColor }]}>
          {capitalize(pokemon.nome)}
        </Text>

        <View style={styles.chips}>
          {pokemon.tipos.map((tipo) => (
            <View key={tipo} style={[styles.chip, { backgroundColor: chipBg }]}>
              <Text style={[styles.chipText, { color: onColor }]}>
                {capitalize(tipo)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

export default React.memo(PokemonCard);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 3,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  watermark: {
    position: 'absolute',
    bottom: -14,
    right: -10,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 2,
  },
  body: {
    padding: 10,
    alignItems: 'center',
  },
  number: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '800',
    opacity: 0.75,
    marginBottom: 2,
  },
  image: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
    marginVertical: 4,
  },
  name: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  chip: {
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
