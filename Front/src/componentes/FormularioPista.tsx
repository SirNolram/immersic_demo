import { useState } from 'react';
import { Text, View } from 'react-native';
import { Boton } from './Boton';
import { Campo } from './Campo';
import { SelectorEtiquetas } from './SelectorEtiquetas';
import { estilos } from '@/tema';
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
    <View style={{ gap: 16 }}>
      <Campo etiqueta="Nombre" value={nombre} onChangeText={setNombre} maxLength={150} />
      <Campo etiqueta="Artista (opcional)" value={artista} onChangeText={setArtista} maxLength={100} />
      <Campo
        etiqueta="Enlace de la canción (opcional)"
        ayuda="Por ejemplo, el enlace de Spotify o YouTube donde la escuchas."
        value={archivoUrl}
        onChangeText={setArchivoUrl}
        maxLength={500}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      <SelectorEtiquetas etiquetas={etiquetas} seleccionadas={etiquetaIds} alCambiar={setEtiquetaIds} />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Boton
        titulo={textoBoton}
        cargando={ocupado}
        deshabilitado={!nombre.trim() || etiquetaIds.length === 0}
        alPresionar={guardar}
      />
    </View>
  );
}
