import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { Campo } from './Campo';
import { estilos } from '@/estilos';
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
    <View style={{ gap: 12 }}>
      <Campo etiqueta="Título" value={titulo} onChangeText={setTitulo} maxLength={150} />
      <Campo etiqueta="Autor (opcional)" value={autor} onChangeText={setAutor} maxLength={100} />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Button title={ocupado ? 'Guardando...' : textoBoton} disabled={ocupado || !titulo.trim()} onPress={guardar} />
    </View>
  );
}
