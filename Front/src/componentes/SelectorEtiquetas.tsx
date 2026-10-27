import { Text, View } from 'react-native';
import { Chip } from './Chip';
import { estilos } from '@/tema';
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
    <View style={{ gap: 10 }}>
      <Text style={estilos.textoSuave}>
        Emociones: {seleccionadas.length} de {maximo}. La etiqueta intenso solo acompaña a otra.
      </Text>
      <View style={estilos.fila}>
        {etiquetas.map((etiqueta) => (
          <Chip
            key={etiqueta.id}
            nombre={etiqueta.nombre}
            seleccionado={seleccionadas.includes(etiqueta.id)}
            alPresionar={() => alternar(etiqueta.id)}
          />
        ))}
      </View>
    </View>
  );
}
