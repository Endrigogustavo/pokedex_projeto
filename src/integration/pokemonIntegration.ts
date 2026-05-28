import axios from 'axios';
import { Pokemon } from '@/@types/pokemon';

const API_URL = axios.create({
    baseURL: 'https://pokeapi.co/api/v2',
});

export const getPokemon = async (limit = 151): Promise<Pokemon[]> => {
    const response = await API_URL.get(`/pokemon?limit=${limit}`);
    const list = response.data.results;

    const pokemonsDetails = await Promise.all(
        list.map(async (pokemon: { url: string }) => {
            const pokemonValue = await API_URL.get(pokemon.url);
            const dadoPokemon = pokemonValue.data;

            const pokemonData: Pokemon = {
                index: dadoPokemon.id.toString().padStart(3, '0'),
                nome: dadoPokemon.name,
                imagem: dadoPokemon.sprites.other['official-artwork'].front_default || dadoPokemon.sprites.front_default,
                tipos: dadoPokemon.types.map((typeInfo: { type: { name: string } }) => typeInfo.type.name),
                poderes: dadoPokemon.stats.map((statInfo: { stat: { name: string }, base_stat: number }) => ({
                    nome: statInfo.stat.name,
                    forca: statInfo.base_stat,
                })),
            };
            return pokemonData;
        })
    );

    return pokemonsDetails;
}