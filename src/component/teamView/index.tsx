import React, { useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
} from 'react-native';
import { Card, Button, IconButton, Chip } from 'react-native-paper';

import { useTeam, TeamMember } from '@/context/TeamContext';
import { TEAM_SIZE } from '@/data/starters';
import { Pokemon } from '@/@types/pokemon';
import { getTypeColor, capitalize, contrastText } from '@/utils/pokemon';
import TypeBadge from '@/component/typeBadge';
import PokemonDetail from '@/component/pokemonDetail';

export default function TeamView() {
  const { team, bag, resetTeam, moveToTeam, moveToBag } = useTeam();
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const teamFull = team.length >= TEAM_SIZE;

  const renderMember = (member: TeamMember, inTeam: boolean) => {
    const { pokemon } = member;
    const color = getTypeColor(pokemon.tipos[0]);

    return (
      <Card key={member.id} mode="elevated" style={styles.card} elevation={1}>
        {/* Barra colorida lateral */}
        <View style={[styles.colorBar, { backgroundColor: color }]} />

        <View style={styles.cardInner}>
          <Pressable
            style={styles.pressArea}
            onPress={() => setSelected(pokemon)}
            android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
          >
            {/* Avatar com fundo colorido suave */}
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

          {/* Botão mover */}
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
        {/* ── Equipe ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meu Time</Text>
            <Chip compact style={styles.badge} textStyle={styles.badgeText}>
              {team.length}/{TEAM_SIZE}
            </Chip>
          </View>
          {team.map((m) => renderMember(m, true))}
        </View>

        {/* ── Bolsa ── */}
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

      {/* ── Rodapé ── */}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  scroll: {
    padding: 16,
    paddingBottom: 8,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B1B1F',
    letterSpacing: -0.1,
  },
  badge: {
    backgroundColor: '#E7E0EC',
    height: 24,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  card: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  colorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 10,
  },
  pressArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImg: {
    width: 52,
    height: 52,
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
    fontSize: 15,
    fontWeight: '800',
    color: '#1B1B1F',
    flex: 1,
    marginRight: 8,
  },
  number: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E9E9E',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  emptyBag: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 12,
    color: '#BDBDBD',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#F5F5F8',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E7E0EC',
  },
  resetBtn: {
    borderRadius: 14,
    borderColor: '#CC0000',
  },
});
