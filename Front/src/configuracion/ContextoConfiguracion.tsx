import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { establecerUrlBase } from '@/api/cliente';

const CLAVE_URL = 'immersic.urlServidor';
const PUERTO_API = 5080;

export function urlPorDefecto(): string {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host || 'localhost'}:${PUERTO_API}`;
}

interface ValorConfiguracion {
  urlServidor: string;
  lista: boolean;
  guardarUrl: (url: string) => Promise<void>;
  restablecerUrl: () => Promise<void>;
}

const Contexto = createContext<ValorConfiguracion | null>(null);

export function ProveedorConfiguracion({ children }: { children: ReactNode }) {
  const [urlServidor, setUrlServidor] = useState(urlPorDefecto);
  const [lista, setLista] = useState(false);

  const aplicar = useCallback((url: string) => {
    establecerUrlBase(url);
    setUrlServidor(url);
  }, []);

  useEffect(() => {
    aplicar(urlPorDefecto());
    AsyncStorage.getItem(CLAVE_URL)
      .then((guardada) => {
        if (guardada) {
          aplicar(guardada);
        }
      })
      .catch(() => undefined)
      .finally(() => setLista(true));
  }, [aplicar]);

  const guardarUrl = useCallback(
    async (url: string) => {
      const limpia = url.trim().replace(/\/+$/, '');
      await AsyncStorage.setItem(CLAVE_URL, limpia);
      aplicar(limpia);
    },
    [aplicar],
  );

  const restablecerUrl = useCallback(async () => {
    await AsyncStorage.removeItem(CLAVE_URL);
    aplicar(urlPorDefecto());
  }, [aplicar]);

  const valor = useMemo(
    () => ({ urlServidor, lista, guardarUrl, restablecerUrl }),
    [urlServidor, lista, guardarUrl, restablecerUrl],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useConfiguracion(): ValorConfiguracion {
  const valor = useContext(Contexto);
  if (!valor) {
    throw new Error('useConfiguracion debe usarse dentro de ProveedorConfiguracion.');
  }
  return valor;
}
