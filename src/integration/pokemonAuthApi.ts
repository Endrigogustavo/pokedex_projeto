import axios from 'axios';
import { Pokemon } from '@/@types/pokemon';
import { pixelSpriteUrl } from '@/integration/pokemonPixelImage';

const API_BASE_URL =
  'https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ───────────────────────── Tipos ─────────────────────────

/** Formato de Pokémon retornado pela API da AWS. */
export type CloudPokemon = {
  index: string;
  name: string;
  image: string;
  types: string[];
  abilities: Array<{ name: string; strength: number }>;
};

/** Estado do treinador retornado pelos endpoints de time/captura. */
export type TeamState = {
  id?: string;
  userId: string;
  team: CloudPokemon[];
  capture: CloudPokemon[];
};

/** Converte o Pokémon da nuvem para o tipo usado no app. */
export function cloudToPokemon(c: CloudPokemon): Pokemon {
  return {
    index: String(c.index).padStart(3, '0'),
    nome: c.name,
    imagem: pixelSpriteUrl(String(c.index)),
    tipos: c.types ?? [],
    poderes: (c.abilities ?? []).map((a) => ({
      nome: a.name,
      forca: a.strength,
    })),
  };
}

// Autenticação e stats moram em `authIntegration.ts` (JWT via httpClient).

// ──────────────────────── Pokémon ────────────────────────

export const pokemonAPI = {
  getTeam: async (userId: string): Promise<TeamState> => {
    const response = await api.get(`/pokemon/v1/team?user-id=${userId}`);
    return response.data;
  },

  updateTeam: async (
    userId: string,
    removedPokemonId: number,
    newPokemonId: number
  ): Promise<TeamState> => {
    const response = await api.put(
      `/pokemon/v1/team?user-id=${userId}&removed-pokemon=${removedPokemonId}&new-pokemon=${newPokemonId}`
    );
    return response.data;
  },

  addCapturedPokemon: async (
    userId: string,
    pokemonId: number
  ): Promise<TeamState> => {
    const response = await api.put(
      `/pokemon/v1/captured?user-id=${userId}&pokemon-id=${pokemonId}`
    );
    return response.data;
  },

  deleteCapturedPokemon: async (
    userId: string,
    pokemonId: number
  ): Promise<TeamState> => {
    const response = await api.delete(
      `/pokemon/v1/captured?user-id=${userId}&pokemon-id=${pokemonId}`
    );
    return response.data;
  },
};

export default api;
