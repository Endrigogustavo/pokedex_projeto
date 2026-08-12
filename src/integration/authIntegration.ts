import axios from 'axios';

import { createApi } from './httpClient';

/** Autenticação (JWT). */
const authApi = createApi(`${process.env.EXPO_PUBLIC_API_URL}/fatec/login/v1`);

/** Estatísticas do treinador. */
const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api-pokemon/auth/v1`,
});

export type TokenResponse = {
  token: string;
};

export type RegistroRequest = {
  username: string;
  password: string;
  email: string;
  cep: string;
  roles: string[];
};

export type AuthRequest = {
  username: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  userId: string;
};

export type StatsResponse = {
  userId: string;
  username: string;
  level: number;
  vitorias: number;
  derrotas: number;
};

/** Payload de atualização de stats — a API espera os valores como string. */
export type UpdateStatsRequest = {
  level: string;
  vitorias: string;
  derrotas: string;
};

export const register = async (data: RegistroRequest): Promise<void> => {
  await authApi.post('/register', data);
};

export const login = async (data: AuthRequest): Promise<TokenResponse> => {
  const response = await authApi.post('/login', data);
  return response.data;
};

export const getStats = async (userId: string): Promise<StatsResponse> => {
  const response = await api.get<StatsResponse>(`/stats/${userId}`);
  return response.data;
};

export const updateStats = async (
  userId: string,
  data: UpdateStatsRequest
): Promise<StatsResponse> => {
  const response = await api.put<StatsResponse>(`/stats/${userId}`, data);
  return response.data;
};
