import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { comandosCapitulos } from '@/api/capitulos';
import { useConfiguracion } from '@/configuracion/ContextoConfiguracion';
import { confirmar, mensajeDeError } from '@/utilidades/dialogos';

export function useGenerarEscenas(capituloId: number, alTerminar: () => Promise<void>) {
  const router = useRouter();
  const { claveGemini } = useConfiguracion();
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generar = useCallback(
    async (escenasActuales: number) => {
      if (!claveGemini) {
        const irAjustes = await confirmar(
          'Falta tu API key de Gemini',
          'Guárdala en Ajustes para que Gemini pueda dividir el capítulo en escenas.',
          'Ir a Ajustes',
          false,
        );
        if (irAjustes) {
          router.push('/configuracion');
        }
        return;
      }

      if (escenasActuales > 0) {
        const reemplazar = await confirmar(
          'Generar escenas con IA',
          'Las escenas actuales se reemplazarán por las que proponga Gemini.',
          'Reemplazar',
        );
        if (!reemplazar) {
          return;
        }
      }

      setGenerando(true);
      setError(null);
      try {
        await comandosCapitulos.generarEscenas(capituloId, claveGemini);
        await alTerminar();
      } catch (e) {
        setError(mensajeDeError(e));
      } finally {
        setGenerando(false);
      }
    },
    [capituloId, claveGemini, alTerminar, router],
  );

  return { generando, error, generar };
}
