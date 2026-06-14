import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { authAPI, LoginResponse, UserStats } from '@/integration/pokemonAuthApi';

type AuthContextData = {
  isAuthenticated: boolean;
  user: string | null;
  userId: string | null;
  userStats: UserStats | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshStats: () => Promise<void>;
  updateStats: (
    level: number,
    vitorias: number,
    derrotas: number
  ) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const USER_STORAGE_KEY = '@PokeFight:user';
const USER_ID_STORAGE_KEY = '@PokeFight:userId';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  /** Recupera a sessão salva e carrega as estatísticas do usuário. */
  const loadStorageData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const storedUserId = await AsyncStorage.getItem(USER_ID_STORAGE_KEY);

      if (storedUser && storedUserId) {
        setUser(storedUser);
        setUserId(storedUserId);
        setIsAuthenticated(true);

        try {
          const stats = await authAPI.getStats(storedUserId);
          setUserStats(stats);
        } catch {
          // estatísticas indisponíveis não impedem o uso do app
        }
      }
    } catch {
      // falha ao ler storage é ignorada (usuário segue deslogado)
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response: LoginResponse = await authAPI.login({ username, password });

      if (response.userId) {
        // A API não devolve o username, então usamos o informado no login.
        await AsyncStorage.setItem(USER_STORAGE_KEY, username);
        await AsyncStorage.setItem(USER_ID_STORAGE_KEY, response.userId);

        setUser(username);
        setUserId(response.userId);
        setIsAuthenticated(true);

        try {
          const stats = await authAPI.getStats(response.userId);
          setUserStats(stats);
        } catch {
          // segue mesmo sem estatísticas
        }

        return true;
      }
      return false;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403)
          throw new Error('Usuário ou senha incorretos');
        if (status === 404) throw new Error('Usuário não encontrado');
        if (status === 500)
          throw new Error('Erro no servidor. Tente novamente mais tarde');
      } else if (error.request) {
        throw new Error('Sem conexão com o servidor. Verifique sua internet');
      }
      throw new Error(
        error.response?.data?.message || 'Erro ao fazer login. Tente novamente'
      );
    }
  };

  const register = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response: LoginResponse = await authAPI.register({
        username,
        password,
      });
      return !!response.userId;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        if (status === 409 || status === 400)
          throw new Error('Usuário já existe. Escolha outro nome');
        if (status === 500)
          throw new Error('Erro no servidor. Tente novamente mais tarde');
      } else if (error.request) {
        throw new Error('Sem conexão com o servidor. Verifique sua internet');
      }
      throw new Error(
        error.response?.data?.message || 'Erro ao registrar. Tente novamente'
      );
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(USER_ID_STORAGE_KEY);
    } finally {
      setUser(null);
      setUserId(null);
      setUserStats(null);
      setIsAuthenticated(false);
    }
  };

  const refreshStats = async () => {
    if (!userId) return;
    try {
      const stats = await authAPI.getStats(userId);
      setUserStats(stats);
    } catch {
      // ignora falha de atualização
    }
  };

  const updateStats = async (
    level: number,
    vitorias: number,
    derrotas: number
  ): Promise<boolean> => {
    if (!userId) return false;
    try {
      const stats = await authAPI.updateStats(userId, {
        level: level.toString(),
        vitorias: vitorias.toString(),
        derrotas: derrotas.toString(),
      });
      setUserStats(stats);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        userId,
        userStats,
        isLoading,
        signIn,
        register,
        signOut,
        refreshStats,
        updateStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  return useContext(AuthContext);
}
