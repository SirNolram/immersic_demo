import { Pressable, Text, View } from 'react-native';
import { estilos } from '@/estilos';
import type { EtiquetaResumen } from '@/tipos/modelos';

interface Props {
  etiquetas: EtiquetaResumen[];
  seleccionadas: number[];
  alCambiar: (ids: number[]) => void;
  maximo?: number;
}

export function SelectorEtiquetas({ etiquetas, seleccionadas, alCambiar, maximo = 3 }: Props) {
  const alternar = (id: number) => {
    if (seleccionadas.includes(id)) {
      alCambiar(seleccionadas.filter((actual) => actual !== id));
    } else if (seleccionadas.length < maximo) {
      alCambiar([...seleccionadas, id]);
    }
  };

  return (
    <View style={{ gap: 4 }}>
      <Text>
        Etiquetas ({seleccionadas.length}/{maximo})
      </Text>
      <View style={estilos.fila}>
        {etiquetas.map((etiqueta) => (
          <Pressable key={etiqueta.id} onPress={() => alternar(etiqueta.id)}>
            <Text>
              {seleccionadas.includes(etiqueta.id) ? '[x] ' : '[ ] '}
              {etiqueta.nombre}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
