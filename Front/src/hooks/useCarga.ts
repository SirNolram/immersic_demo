import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useConfiguracion } from '@/configuracion/ContextoConfiguracion';

export function useCarga<T>(cargar: () => Promise<T>) {
  const { lista, urlServidor } = useConfiguracion();
  const [datos, setDatos] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const cargarActual = useRef(cargar);
  cargarActual.current = cargar;

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setDatos(await cargarActual.current());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado.');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (lista) {
        void recargar();
      }
    }, [lista, urlServidor, recargar]),
  );

  return { datos, error, cargando, recargar };
}
