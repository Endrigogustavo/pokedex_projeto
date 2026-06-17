import React, { useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  Pressable,
  Text,
} from 'react-native';
import { Card, Button, IconButton, Chip } from 'react-native-paper';

import { useTeam, TeamMember } from '@/context/TeamContext';
import { TEAM_SIZE } from '@/constants/starters';
import { Pokemon } from '@/@types/pokemon';
import { getTypeColor, capitalize } from '@/constants/pokemon';
import TypeBadge from '@/components/typeBadge';
import PokemonDetail from '@/components/pokemonDetail';
import { styles } from './styles';

export default function TeamView() {
  const { team, bag, resetTeam, moveToTeam, moveToBag } = useTeam();
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const teamFull = team.length >= TEAM_SIZE;

  const renderMember = (member: TeamMember, inTeam: boolean) => {
    const { pokemon } = member;
    const color = getTypeColor(pokemon.tipos[0]);

    return (
      <Card key={member.id} mode="elevated" style={styles.card} elevation={1}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />

        <View style={styles.cardInner}>
          <Pressable
            style={styles.pressArea}
            onPress={() => setSelected(pokemon)}
            android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
          >
            <View style={[styles.avatar, { backgroundColor: color + '22' }]}>
              <Image source={{ uri: pokemon.imagem }} style={styles.avatarImg} />
            </View>

            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {capitalize(pokemon.nome)}
                </Text>
                <Text style={styles.number}>#{pokemon.index}</Text>
              </View>

              <View style={styles.typeRow}>
                {pokemon.tipos.map((t) => (
                  <TypeBadge key={t} type={t} size="sm" />
                ))}
              </View>
            </View>
          </Pressable>

          <IconButton
            icon={inTeam ? 'chevron-down' : 'chevron-up'}
            mode="contained-tonal"
            size={20}
            disabled={inTeam ? team.length <= 1 : teamFull}
            containerColor={inTeam ? '#F0EEFA' : '#DCF4E5'}
            iconColor={inTeam ? '#6750A4' : '#1B6B3A'}
            onPress={() => (inTeam ? moveToBag(member.id) : moveToTeam(member.id))}
          />
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meu Time</Text>
            <Chip compact style={styles.badge} textStyle={styles.badgeText}>
              {team.length}/{TEAM_SIZE}
            </Chip>
          </View>
          {team.map((m) => renderMember(m, true))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bolsa</Text>
            {bag.length > 0 && (
              <Chip compact style={styles.badge} textStyle={styles.badgeText}>
                {bag.length}
              </Chip>
            )}
          </View>

          {bag.length === 0 ? (
            <View style={styles.emptyBag}>
              <Text style={styles.emptyText}>Bolsa vazia</Text>
              <Text style={styles.emptyHint}>
                Capture Pokémons na aba Pokédex
              </Text>
            </View>
          ) : (
            bag.map((m) => renderMember(m, false))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          icon="refresh"
          onPress={resetTeam}
          style={styles.resetBtn}
          textColor="#CC0000"
        >
          Refazer time
        </Button>
      </View>

      <PokemonDetail pokemon={selected} onClose={() => setSelected(null)} />
    </View>
  );
}
