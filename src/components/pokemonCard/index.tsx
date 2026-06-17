import React from 'react';
import { View, Image, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Pokemon } from '@/@types/pokemon';
import { getTypeColor, capitalize, contrastText } from '@/constants/pokemon';
import { styles } from './styles';

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
      <MaterialCommunityIcons
        name="pokeball"
        size={90}
        color={watermark}
        style={styles.watermark}
      />

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
