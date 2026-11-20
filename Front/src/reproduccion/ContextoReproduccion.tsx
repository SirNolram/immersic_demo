import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { urlCompleta } from '@/api/cliente';
import type { Pista } from '@/tipos/modelos';

interface ValorReproduccion {
  pistaActual: Pista | null;
  sonando: boolean;
  segundos: number;
  duracion: number;
  alternar: (pista: Pista) => void;
  detener: () => void;
  estaSonando: (pistaId: number) => boolean;
}

const Contexto = createContext<ValorReproduccion | null>(null);

export function ProveedorReproduccion({ children }: { children: ReactNode }) {
  const reproductor = useAudioPlayer(null);
  const estado = useAudioPlayerStatus(reproductor);
  const [pistaActual, setPistaActual] = useState<Pista | null>(null);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
  }, []);

  const alternar = useCallback(
    (pista: Pista) => {
      if (pistaActual?.id !== pista.id) {
        reproductor.replace({ uri: urlCompleta(pista.urlAudio), name: pista.nombre });
        reproductor.play();
        setPistaActual(pista);
        return;
      }

      if (estado.playing) {
        reproductor.pause();
        return;
      }

      if (estado.duration > 0 && estado.currentTime >= estado.duration - 0.25) {
        void reproductor.seekTo(0);
      }
      reproductor.play();
    },
    [estado.currentTime, estado.duration, estado.playing, pistaActual, reproductor],
  );

  const detener = useCallback(() => {
    reproductor.pause();
    setPistaActual(null);
  }, [reproductor]);

  const estaSonando = useCallback(
    (pistaId: number) => pistaActual?.id === pistaId && estado.playing,
    [estado.playing, pistaActual],
  );

  const valor = useMemo(
    () => ({
      pistaActual,
      sonando: estado.playing,
      segundos: estado.currentTime,
      duracion: estado.duration,
      alternar,
      detener,
      estaSonando,
    }),
    [pistaActual, estado.playing, estado.currentTime, estado.duration, alternar, detener, estaSonando],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useReproduccion(): ValorReproduccion {
  const valor = useContext(Contexto);
  if (!valor) {
    throw new Error('useReproduccion debe usarse dentro de ProveedorReproduccion.');
  }
  return valor;
}
