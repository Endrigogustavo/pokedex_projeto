import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

/** Registra o que fazer quando a API responder 401 (normalmente encerrar a sessão). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler;
}

/**
 * Cria uma instância axios com os interceptors de autenticação:
 * - request: injeta `Bearer <token>` lido do AsyncStorage;
 * - response: dispara o handler global quando a resposta for 401.
 */
export function createApi(baseURL: string) {
  const instance = axios.create({ baseURL });

  instance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('@Auth:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        onUnauthorized?.();
      }
      return Promise.reject(error);
    }
  );

  return instance;
}
