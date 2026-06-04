import React, { useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Card, Text, Button, Chip, IconButton } from 'react-native-paper';

import { Pokemon } from '@/@types/pokemon';
import { useTeam, TeamMember } from '@/context/TeamContext';
import { TEAM_SIZE } from '@/data/starters';
import { getTypeColor, capitalize, hpColor, contrastText } from '@/utils/pokemon';
import StatBar from '@/component/statBar';
import PokemonDetail from '@/component/pokemonDetail';

export default function TeamView() {
  const { team, bag, healTeam, resetTeam, moveToTeam, moveToBag } = useTeam();
  const [selected, setSelected] = useState<Pokemon | null>(null);

  const allHealthy = team.every((m) => m.currentHp === m.maxHp);
  const teamFull = team.length >= TEAM_SIZE;

  const renderMember = (member: TeamMember, inTeam: boolean) => {
    const { pokemon, currentHp, maxHp } = member;
    const mainColor = getTypeColor(pokemon.tipos[0]);
    const ratio = maxHp > 0 ? currentHp / maxHp : 0;
    const fainted = currentHp <= 0;

    return (
      <Card key={member.id} mode="elevated" style={[styles.card, fainted && styles.fainted]}>
        <View style={[styles.accent, { backgroundColor: mainColor }]} />
        <Card.Content style={styles.cardContent}>
          <Pressable style={styles.pressArea} onPress={() => setSelected(pokemon)}>
            <View style={[styles.imageWrap, { backgroundColor: mainColor + '22' }]}>
              <Image source={{ uri: pokemon.imagem }} style={styles.image} />
            </View>
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text variant="titleMedium" style={styles.name}>
                  {capitalize(pokemon.nome)}
                </Text>
                <Text variant="labelMedium" style={styles.index}>
                  #{pokemon.index}
                </Text>
              </View>
              <View style={styles.chips}>
                {pokemon.tipos.map((tipo) => (
                  <Chip
                    key={tipo}
                    compact
                    style={[styles.chip, { backgroundColor: getTypeColor(tipo) }]}
                    textStyle={[styles.chipText, { color: contrastText(getTypeColor(tipo)) }]}
                  >
                    {capitalize(tipo)}
                  </Chip>
                ))}
              </View>
              <StatBar
                label="HP"
                value={currentHp}
                max={maxHp}
                color={fainted ? '#9aa0a6' : hpColor(ratio)}
                valueText={`${currentHp}/${maxHp}`}
              />
            </View>
          </Pressable>

          <IconButton
            icon={inTeam ? 'arrow-down-bold' : 'arrow-up-bold'}
            mode="contained"
            containerColor={inTeam ? '#E3E1E8' : '#2e9e5b'}
            iconColor={inTeam ? '#374151' : '#fff'}
            size={20}
            disabled={inTeam ? team.length <= 1 : teamFull}
            onPress={() => (inTeam ? moveToBag(member.id) : moveToTeam(member.id))}
          />
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.heading}>
            Equipe
          </Text>
          <Chip compact style={styles.countChip}>{`${team.length}/${TEAM_SIZE}`}</Chip>
        </View>
        {team.map((m) => renderMember(m, true))}

        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <Text variant="titleMedium" style={styles.heading}>
            Bolsa
          </Text>
          <Chip compact style={styles.countChip}>{`${bag.length}`}</Chip>
        </View>
        {bag.length === 0 ? (
          <Text variant="bodyMedium" style={styles.emptyBag}>
            Sua bolsa está vazia. Ganhe Pokémons vencendo batalhas! 
          </Text>
        ) : (
          bag.map((m) => renderMember(m, false))
        )}
      </ScrollView>

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="heart-plus"
          disabled={allHealthy}
          onPress={healTeam}
          style={styles.btn}
          buttonColor="#2e9e5b"
        >
          Curar equipe
        </Button>
        <Button mode="contained-tonal" icon="refresh" onPress={resetTeam} style={styles.btn}>
          Refazer
        </Button>
      </View>

      <PokemonDetail pokemon={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  heading: {
    fontWeight: '800',
  },
  countChip: {
    backgroundColor: '#E3E1E8',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  fainted: {
    opacity: 0.6,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  pressArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrap: {
    borderRadius: 50,
    padding: 8,
    marginRight: 14,
  },
  image: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontWeight: '800',
  },
  index: {
    color: '#9aa0a6',
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    height: 26,
  },
  chipText: {
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 14,
  },
  emptyBag: {
    color: '#9aa0a6',
    textAlign: 'center',
    paddingVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingTop: 8,
  },
  btn: {
    flex: 1,
    borderRadius: 12,
  },
});
