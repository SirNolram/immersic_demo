import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colorEmocion, colores } from '@/tema';

interface Props {
  nombre: string;
  color?: string;
  seleccionado?: boolean;
  alPresionar?: () => void;
}

export function Chip({ nombre, color = colorEmocion(nombre), seleccionado = false, alPresionar }: Props) {
  if (!alPresionar) {
    return (
      <View style={[estilosChip.base, { backgroundColor: `${color}22` }]}>
        <View style={[estilosChip.punto, { backgroundColor: color }]} />
        <Text style={[estilosChip.texto, { color }]}>{nombre}</Text>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: seleccionado }}
      onPress={alPresionar}
      style={({ pressed }) => [
        estilosChip.base,
        estilosChip.seleccionable,
        { borderColor: seleccionado ? color : colores.linea },
        seleccionado && { backgroundColor: color },
        pressed && { opacity: 0.7 },
      ]}
    >
      {!seleccionado ? <View style={[estilosChip.punto, { backgroundColor: color }]} /> : null}
      <Text style={[estilosChip.texto, { color: seleccionado ? colores.textoInverso : colores.texto }]}>{nombre}</Text>
    </Pressable>
  );
}

const estilosChip = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  seleccionable: {
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  punto: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  texto: {
    fontSize: 13,
    fontWeight: '500',
  },
});
