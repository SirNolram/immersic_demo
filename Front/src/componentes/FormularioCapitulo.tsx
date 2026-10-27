import { useState } from 'react';
import { Text, View } from 'react-native';
import { Boton } from './Boton';
import { Campo } from './Campo';
import { useAccion } from '@/hooks/useAccion';
import { estilos } from '@/tema';

const MAXIMO_CARACTERES = 60000;

interface DatosCapitulo {
  titulo: string;
  contenido: string;
}

interface Props {
  inicial?: DatosCapitulo;
  textoBoton: string;
  alGuardar: (datos: DatosCapitulo) => Promise<void>;
}

export function FormularioCapitulo({ inicial, textoBoton, alGuardar }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '');
  const [contenido, setContenido] = useState(inicial?.contenido ?? '');
  const { ocupado, error, ejecutar } = useAccion();

  const guardar = () => ejecutar(() => alGuardar({ titulo: titulo.trim(), contenido }));

  return (
    <View style={{ gap: 16 }}>
      <Campo etiqueta="Título" value={titulo} onChangeText={setTitulo} maxLength={150} />
      <Campo
        etiqueta="Texto del capítulo"
        ayuda={`${contenido.length.toLocaleString('es')} de ${MAXIMO_CARACTERES.toLocaleString('es')} caracteres`}
        placeholder="Pega aquí el texto del capítulo."
        value={contenido}
        onChangeText={setContenido}
        maxLength={MAXIMO_CARACTERES}
        multiline
      />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Boton titulo={textoBoton} cargando={ocupado} deshabilitado={!titulo.trim()} alPresionar={guardar} />
    </View>
  );
}
