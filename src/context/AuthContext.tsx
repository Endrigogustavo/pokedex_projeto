import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  login as loginApi,
  register as registerApi,
} from '@/integration/authIntegration';
import { setUnauthorizedHandler } from '@/integration/httpClient';
import { decodeToken, isTokenExpired, TokenPayload } from '@/utils/jwt';

type AuthContextData = {
  isAuthenticated: boolean;
  user: string | null;
  token: string | null;
  userId: string | null;
  roles: string[];
  isLoading: boolean;
  signIn: (
    username: string,
    password: string
  ) => Promise<{ ok: boolean; userId?: string }>;
  signUp: (
    username: string,
    password: string
  ) => Promise<{ ok: boolean; userId?: string; error?: string }>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /** A sessão é derivada do payload do JWT, não da resposta do login. */
  async function persistSession(newToken: string): Promise<TokenPayload> {
    const payload = decodeToken(newToken);

    setUser(payload.sub);
    setUserId(payload.sub);
    setRoles(payload.roles);
    setToken(newToken);
    setIsAuthenticated(true);

    await AsyncStorage.setItem('@Auth:user', payload.sub);
    await AsyncStorage.setItem('@Auth:token', newToken);
    await AsyncStorage.setItem('@Auth:userId', payload.sub);

    return payload;
  }

  async function clearSession() {
    setUser(null);
    setToken(null);
    setUserId(null);
    setRoles([]);
    setIsAuthenticated(false);

    await AsyncStorage.removeItem('@Auth:user');
    await AsyncStorage.removeItem('@Auth:token');
    await AsyncStorage.removeItem('@Auth:userId');
  }

  useEffect(() => {
    async function loadStorageData() {
      const storageToken = await AsyncStorage.getItem('@Auth:token');
      if (storageToken && !isTokenExpired(storageToken)) {
        await persistSession(storageToken);
      } else if (storageToken) {
        await clearSession();
      }
      setIsLoading(false);
    }
    loadStorageData();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });
  }, []);

  async function signIn(
    username: string,
    password: string
  ): Promise<{ ok: boolean; userId?: string }> {
    try {
      const response = await loginApi({ username, password });
      const payload = await persistSession(response.token);
      return { ok: true, userId: payload.sub };
    } catch {
      return { ok: false };
    }
  }

  async function signUp(
    username: string,
    password: string
  ): Promise<{ ok: boolean; userId?: string; error?: string }> {
    try {
      // `signUp` não coleta email/cep/roles: enviados vazios até a tela pedi-los.
      await registerApi({ username, password, email: '', cep: '', roles: [] });
      return await signIn(username, password);
    } catch (error: any) {
      return { ok: false, error: error?.message };
    }
  }

  function signOut() {
    clearSession();
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        userId,
        roles,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  return useContext(AuthContext);
}
