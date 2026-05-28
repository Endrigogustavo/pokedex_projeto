import React, {useEffect, useState} from 'react';
import {getPokemon} from '@/integration/pokemonIntegration';
import {Pokemon} from '@/types/pokemon';
import { View, Text } from 'react-native';

export default function Pokedex() {
    const [loading, setLoading] = useState(true);
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getPokemon(151);
                setPokemons(data);
            } catch (error) {
                console.error('Erro ao carregar os pokémons:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <View>
            <Text>Pokedex</Text>

        </View>
    );
}