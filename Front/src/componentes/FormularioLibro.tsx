import { useState } from 'react';
import { Text, View } from 'react-native';
import { Boton } from './Boton';
import { Campo } from './Campo';
import { estilos } from '@/tema';
import { useAccion } from '@/hooks/useAccion';
import type { LibroEntrada } from '@/tipos/modelos';

interface Props {
  inicial?: LibroEntrada;
  textoBoton: string;
  alGuardar: (datos: LibroEntrada) => Promise<void>;
}

export function FormularioLibro({ inicial, textoBoton, alGuardar }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '');
  const [autor, setAutor] = useState(inicial?.autor ?? '');
  const { ocupado, error, ejecutar } = useAccion();

  const guardar = () =>
    ejecutar(() => alGuardar({ titulo: titulo.trim(), autor: autor.trim() || null }));

  return (
    <View style={{ gap: 16 }}>
      <Campo etiqueta="Título" value={titulo} onChangeText={setTitulo} maxLength={150} />
      <Campo etiqueta="Autor (opcional)" value={autor} onChangeText={setAutor} maxLength={100} />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Boton titulo={textoBoton} cargando={ocupado} deshabilitado={!titulo.trim()} alPresionar={guardar} />
    </View>
  );
}
