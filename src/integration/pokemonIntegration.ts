import axios from 'axios';
import { Pokemon } from '@/@types/pokemon';

const API_URL = axios.create({
    baseURL: 'https://pokeapi.co/api/v2',
});

function mapPokemon(dado: any): Pokemon {
    return {
        index: dado.id.toString().padStart(3, '0'),
        nome: dado.name,
        imagem: dado.sprites.other['official-artwork'].front_default || dado.sprites.front_default,
        tipos: dado.types.map((typeInfo: { type: { name: string } }) => typeInfo.type.name),
        poderes: dado.stats.map((statInfo: { stat: { name: string }, base_stat: number }) => ({
            nome: statInfo.stat.name,
            forca: statInfo.base_stat,
        })),
    };
}

export const getPokemon = async (limit = 151): Promise<Pokemon[]> => {
    const response = await API_URL.get(`/pokemon?limit=${limit}`);
    const list = response.data.results;

    return Promise.all(
        list.map(async (pokemon: { url: string }) => {
            const pokemonValue = await API_URL.get(pokemon.url);
            return mapPokemon(pokemonValue.data);
        })
    );
};

/** Busca Pokémons específicos pelo id (usado para os lendários). */
export const getPokemonsByIds = async (ids: number[]): Promise<Pokemon[]> => {
    return Promise.all(
        ids.map(async (id) => {
            const response = await API_URL.get(`/pokemon/${id}`);
            return mapPokemon(response.data);
        })
    );
};

export const getPokemonById = async (id: number): Promise<Pokemon> => {
    const response = await API_URL.get(`/pokemon/${id}`);
    return mapPokemon(response.data);
};

/** Devolve o id da próxima evolução do Pokémon, ou null se não evoluir. */
export const getNextEvolutionId = async (id: number): Promise<number | null> => {
    const species = await API_URL.get(`/pokemon-species/${id}`);
    const speciesName: string = species.data.name;

    const chainRes = await API_URL.get(species.data.evolution_chain.url);

    type ChainNode = { species: { name: string; url: string }; evolves_to: ChainNode[] };

    const findNode = (node: ChainNode): ChainNode | null => {
        if (node.species.name === speciesName) return node;
        for (const child of node.evolves_to) {
            const found = findNode(child);
            if (found) return found;
        }
        return null;
    };

    const node = findNode(chainRes.data.chain);
    if (!node || node.evolves_to.length === 0) return null;

    const parts = node.evolves_to[0].species.url.split('/').filter(Boolean);
    const nextId = Number(parts[parts.length - 1]);
    return Number.isNaN(nextId) ? null : nextId;
};
