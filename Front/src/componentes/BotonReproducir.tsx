import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';
import { useReproduccion } from '@/reproduccion/ContextoReproduccion';
import { colores } from '@/tema';
import type { Pista } from '@/tipos/modelos';

interface Props {
  pista: Pista;
  tamano?: number;
}

export function BotonReproducir({ pista, tamano = 40 }: Props) {
  const { alternar, estaSonando } = useReproduccion();
  const sonando = estaSonando(pista.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={sonando ? `Pausar ${pista.nombre}` : `Reproducir ${pista.nombre}`}
      hitSlop={8}
      onPress={() => alternar(pista)}
      style={({ pressed }) => ({
        width: tamano,
        height: tamano,
        borderRadius: tamano / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: sonando ? colores.texto : colores.superficieAlta,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons
        name={sonando ? 'pause' : 'play'}
        size={tamano * 0.45}
        color={sonando ? colores.textoInverso : colores.texto}
        style={sonando ? undefined : { marginLeft: tamano * 0.06 }}
      />
    </Pressable>
  );
}
