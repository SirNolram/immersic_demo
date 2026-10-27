import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colores } from '@/tema';

export type NombreIcono = ComponentProps<typeof Ionicons>['name'];

type Variante = 'principal' | 'secundario' | 'peligro';

interface Props {
  titulo: string;
  alPresionar: () => void;
  variante?: Variante;
  icono?: NombreIcono;
  deshabilitado?: boolean;
  cargando?: boolean;
}

const colorTexto: Record<Variante, string> = {
  principal: colores.textoInverso,
  secundario: colores.texto,
  peligro: colores.peligro,
};

export function Boton({ titulo, alPresionar, variante = 'principal', icono, deshabilitado, cargando }: Props) {
  const inactivo = deshabilitado || cargando;
  const color = colorTexto[variante];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo, busy: !!cargando }}
      disabled={inactivo}
      onPress={alPresionar}
      style={({ pressed }) => [
        estilosBoton.base,
        estilosBoton[variante],
        pressed && estilosBoton.presionado,
        inactivo && estilosBoton.inactivo,
      ]}
    >
      {cargando ? (
        <ActivityIndicator size="small" color={color} />
      ) : icono ? (
        <Ionicons name={icono} size={18} color={color} />
      ) : null}
      <Text style={[estilosBoton.texto, { color }]}>{titulo}</Text>
    </Pressable>
  );
}

const estilosBoton = StyleSheet.create({
  base: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  principal: {
    backgroundColor: colores.texto,
  },
  secundario: {
    borderWidth: 1,
    borderColor: colores.linea,
    backgroundColor: colores.superficie,
  },
  peligro: {
    borderWidth: 1,
    borderColor: colores.peligro,
  },
  presionado: {
    opacity: 0.75,
  },
  inactivo: {
    opacity: 0.45,
  },
  texto: {
    fontSize: 15,
    fontWeight: '600',
  },
});
