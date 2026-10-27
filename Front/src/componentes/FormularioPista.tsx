import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { Campo } from './Campo';
import { SelectorEtiquetas } from './SelectorEtiquetas';
import { estilos } from '@/estilos';
import { useAccion } from '@/hooks/useAccion';
import type { EtiquetaResumen, PistaEntrada } from '@/tipos/modelos';

interface Props {
  etiquetas: EtiquetaResumen[];
  inicial?: PistaEntrada;
  textoBoton: string;
  alGuardar: (datos: PistaEntrada) => Promise<void>;
}

export function FormularioPista({ etiquetas, inicial, textoBoton, alGuardar }: Props) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [artista, setArtista] = useState(inicial?.artista ?? '');
  const [archivoUrl, setArchivoUrl] = useState(inicial?.archivoUrl ?? '');
  const [etiquetaIds, setEtiquetaIds] = useState<number[]>(inicial?.etiquetaIds ?? []);
  const { ocupado, error, ejecutar } = useAccion();

  const guardar = () =>
    ejecutar(() =>
      alGuardar({
        nombre: nombre.trim(),
        artista: artista.trim() || null,
        archivoUrl: archivoUrl.trim() || null,
        etiquetaIds,
      }),
    );

  return (
    <View style={{ gap: 12 }}>
      <Campo etiqueta="Nombre" value={nombre} onChangeText={setNombre} maxLength={150} />
      <Campo etiqueta="Artista (opcional)" value={artista} onChangeText={setArtista} maxLength={100} />
      <Campo
        etiqueta="Archivo o enlace (opcional)"
        value={archivoUrl}
        onChangeText={setArchivoUrl}
        maxLength={500}
        autoCapitalize="none"
      />
      <SelectorEtiquetas etiquetas={etiquetas} seleccionadas={etiquetaIds} alCambiar={setEtiquetaIds} />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Button
        title={ocupado ? 'Guardando...' : textoBoton}
        disabled={ocupado || !nombre.trim() || etiquetaIds.length === 0}
        onPress={guardar}
      />
    </View>
  );
}
