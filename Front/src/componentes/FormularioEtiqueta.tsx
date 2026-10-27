import { useState } from 'react';
import { Text, View } from 'react-native';
import { Boton } from './Boton';
import { Campo } from './Campo';
import { estilos } from '@/tema';
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
    <View style={{ gap: 16 }}>
      <Campo
        etiqueta="Nombre (una palabra)"
        value={nombre}
        onChangeText={setNombre}
        maxLength={30}
        autoCapitalize="none"
      />
      <Campo etiqueta="Descripción" value={descripcion} onChangeText={setDescripcion} maxLength={300} />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Boton titulo={textoBoton} cargando={ocupado} deshabilitado={!nombre.trim()} alPresionar={guardar} />
    </View>
  );
}
