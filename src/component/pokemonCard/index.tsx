import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Pokemon } from '@/@types/pokemon';
import { getTypeColor, capitalize, contrastText } from '@/utils/pokemon';

type Props = {
  pokemon: Pokemon;
  onPress: () => void;
  selected?: boolean;
};

/** Card colorido por tipo, reutilizado na Pokédex e na seleção de equipe. */
export default function PokemonCard({ pokemon, onPress, selected }: Props) {
  const mainColor = getTypeColor(pokemon.tipos[0]);
  const onColor = contrastText(mainColor);
  const isDark = onColor === '#ffffff';

  const overlay = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.13)';
  const watermark = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)';

  return (
    <Card
      mode="contained"
      onPress={onPress}
      style={[styles.card, { backgroundColor: mainColor }, selected && styles.selected]}
    >
      <MaterialCommunityIcons
        name="pokeball"
        size={108}
        color={watermark}
        style={styles.watermark}
      />

      {selected && (
        <Avatar.Icon
          size={26}
          icon="check-bold"
          style={styles.check}
          color={mainColor}
        />
      )}

      <View style={styles.body}>
        <Text variant="labelMedium" style={[styles.index, { color: onColor }]}>
          #{pokemon.index}
        </Text>

        <Image source={{ uri: pokemon.imagem }} style={styles.image} />

        <Text
          variant="titleSmall"
          numberOfLines={1}
          style={[styles.name, { color: onColor }]}
        >
          {capitalize(pokemon.nome)}
        </Text>

        <View style={styles.chips}>
          {pokemon.tipos.map((tipo) => (
            <View key={tipo} style={[styles.chip, { backgroundColor: overlay }]}>
              <Text
                variant="labelSmall"
                style={[styles.chipText, { color: onColor }]}
                numberOfLines={1}
              >
                {capitalize(tipo)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  selected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  watermark: {
    position: 'absolute',
    bottom: -18,
    right: -14,
  },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    zIndex: 2,
  },
  body: {
    padding: 12,
    alignItems: 'center',
  },
  index: {
    alignSelf: 'flex-start',
    fontWeight: '800',
    opacity: 0.85,
  },
  image: {
    width: 74,
    height: 74,
    resizeMode: 'contain',
    marginVertical: 4,
  },
  name: {
    fontWeight: '900',
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
  },
  chip: {
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  chipText: {
    fontWeight: '700',
    fontSize: 10,
  },
});
