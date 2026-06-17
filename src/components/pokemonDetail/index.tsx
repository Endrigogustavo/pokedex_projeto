import React, { useEffect } from 'react';
import {
  View,
  Image,
  ScrollView,
  Dimensions,
  Text,
  BackHandler,
} from 'react-native';
import { Portal, Appbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pokemon } from '@/@types/pokemon';
import { getTypeColor, statLabel, capitalize, contrastText } from '@/constants/pokemon';
import StatBar from '@/components/statBar';
import { styles } from './styles';

const STAT_MAX     = 180;
const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = {
  pokemon: Pokemon | null;
  onClose: () => void;
};

export default function PokemonDetail({ pokemon, onClose }: Props) {
  const insets = useSafeAreaInsets();

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
        <View style={[styles.hero, { backgroundColor: mainColor }]}>
          <Appbar.Header style={styles.appbar}>
            <Appbar.BackAction onPress={onClose} color={onColor} />
            <Appbar.Content title="" />
            <Text style={[styles.heroNumber, { color: onColor }]}>
              #{pokemon.index}
            </Text>
            <View style={{ width: 16 }} />
          </Appbar.Header>

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
