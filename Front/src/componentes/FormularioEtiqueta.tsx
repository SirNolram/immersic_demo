import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { Campo } from './Campo';
import { estilos } from '@/estilos';
import { useAccion } from '@/hooks/useAccion';
import type { EtiquetaEntrada } from '@/tipos/modelos';

interface Props {
  inicial?: EtiquetaEntrada;
  textoBoton: string;
  alGuardar: (datos: EtiquetaEntrada) => Promise<void>;
}

export function FormularioEtiqueta({ inicial, textoBoton, alGuardar }: Props) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '');
  const { ocupado, error, ejecutar } = useAccion();

  const guardar = () =>
    ejecutar(() => alGuardar({ nombre: nombre.trim(), descripcion: descripcion.trim() }));

  return (
    <View style={{ gap: 12 }}>
      <Campo etiqueta="Nombre (una palabra)" value={nombre} onChangeText={setNombre} maxLength={30} autoCapitalize="none" />
      <Campo etiqueta="Descripción" value={descripcion} onChangeText={setDescripcion} maxLength={300} />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Button title={ocupado ? 'Guardando...' : textoBoton} disabled={ocupado || !nombre.trim()} onPress={guardar} />
    </View>
  );
}
