import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';
import type { NombreIcono } from './Boton';
import { colores } from '@/tema';

interface Props {
  icono: NombreIcono;
  etiqueta: string;
  alPresionar: () => void;
  color?: string;
  deshabilitado?: boolean;
}

export function BotonIcono({ icono, etiqueta, alPresionar, color = colores.texto, deshabilitado }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      disabled={deshabilitado}
      hitSlop={10}
      onPress={alPresionar}
      style={({ pressed }) => ({ padding: 6, opacity: deshabilitado ? 0.4 : pressed ? 0.6 : 1 })}
    >
      <Ionicons name={icono} size={22} color={color} />
    </Pressable>
  );
}
