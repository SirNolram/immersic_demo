import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { establecerUrlBase } from '@/api/cliente';
import { almacenSeguro } from '@/utilidades/almacenSeguro';

const CLAVE_URL = 'immersic.urlServidor';
const CLAVE_GEMINI = 'immersic.claveGemini';
const PUERTO_API = 5080;

export function urlPorDefecto(): string {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host || 'localhost'}:${PUERTO_API}`;
}

interface ValorConfiguracion {
  urlServidor: string;
  claveGemini: string;
  lista: boolean;
  guardarUrl: (url: string) => Promise<void>;
  restablecerUrl: () => Promise<void>;
  guardarClaveGemini: (clave: string) => Promise<void>;
  borrarClaveGemini: () => Promise<void>;
}

const Contexto = createContext<ValorConfiguracion | null>(null);

export function ProveedorConfiguracion({ children }: { children: ReactNode }) {
  const [urlServidor, setUrlServidor] = useState(urlPorDefecto);
  const [claveGemini, setClaveGemini] = useState('');
  const [lista, setLista] = useState(false);

  const aplicarUrl = useCallback((url: string) => {
    establecerUrlBase(url);
    setUrlServidor(url);
  }, []);

  useEffect(() => {
    aplicarUrl(urlPorDefecto());
    Promise.all([
      AsyncStorage.getItem(CLAVE_URL).catch(() => null),
      almacenSeguro.leer(CLAVE_GEMINI).catch(() => null),
    ])
      .then(([url, clave]) => {
        if (url) {
          aplicarUrl(url);
        }
        setClaveGemini(clave ?? '');
      })
      .finally(() => setLista(true));
  }, [aplicarUrl]);

  const guardarUrl = useCallback(
    async (url: string) => {
      const limpia = url.trim().replace(/\/+$/, '');
      await AsyncStorage.setItem(CLAVE_URL, limpia);
      aplicarUrl(limpia);
    },
    [aplicarUrl],
  );

  const restablecerUrl = useCallback(async () => {
    await AsyncStorage.removeItem(CLAVE_URL);
    aplicarUrl(urlPorDefecto());
  }, [aplicarUrl]);

  const guardarClaveGemini = useCallback(async (clave: string) => {
    const limpia = clave.trim();
    await almacenSeguro.guardar(CLAVE_GEMINI, limpia);
    setClaveGemini(limpia);
  }, []);

  const borrarClaveGemini = useCallback(async () => {
    await almacenSeguro.borrar(CLAVE_GEMINI);
    setClaveGemini('');
  }, []);

  const valor = useMemo(
    () => ({
      urlServidor,
      claveGemini,
      lista,
      guardarUrl,
      restablecerUrl,
      guardarClaveGemini,
      borrarClaveGemini,
    }),
    [urlServidor, claveGemini, lista, guardarUrl, restablecerUrl, guardarClaveGemini, borrarClaveGemini],
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
