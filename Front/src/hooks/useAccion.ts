import { useCallback, useState } from 'react';

export function useAccion() {
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ejecutar = useCallback(async (accion: () => Promise<void>) => {
    setOcupado(true);
    setError(null);
    try {
      await accion();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado.');
    } finally {
      setOcupado(false);
    }
  }, []);

  return { ocupado, error, ejecutar };
}
