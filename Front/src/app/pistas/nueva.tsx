import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { consultasEtiquetas } from '@/api/etiquetas';
import { comandosPistas } from '@/api/pistas';
import { Boton } from '@/componentes/Boton';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { FormularioPista } from '@/componentes/FormularioPista';
import { useCarga } from '@/hooks/useCarga';
import { colores, estilos, fuente } from '@/tema';
import type { ArchivoAudio } from '@/tipos/modelos';
import { mensajeDeError } from '@/utilidades/dialogos';
import { sinExtension, tamanoLegible } from '@/utilidades/texto';

const EXTENSIONES = ['.mp3', '.m4a', '.aac', '.wav'];
const TAMANO_MAXIMO = 50 * 1024 * 1024;

function validar(archivo: ArchivoAudio): string | null {
  const nombre = archivo.nombre.toLowerCase();
  if (!EXTENSIONES.some((extension) => nombre.endsWith(extension))) {
    return 'Ese formato no es compatible. Elige un archivo MP3, M4A, AAC o WAV.';
  }
  if (archivo.tamanoBytes !== null && archivo.tamanoBytes > TAMANO_MAXIMO) {
    return 'El archivo supera el máximo de 50 MB.';
  }
  return null;
}

export default function ImportarCancion() {
  const router = useRouter();
  const { datos, error, cargando, recargar } = useCarga(() => consultasEtiquetas.listar());
  const [archivo, setArchivo] = useState<ArchivoAudio | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const elegir = async () => {
    setAviso(null);
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      const elegido = resultado.canceled ? undefined : resultado.assets[0];
      if (!elegido) {
        return;
      }
      const candidato: ArchivoAudio = {
        uri: elegido.uri,
        nombre: elegido.name,
        tipo: elegido.mimeType ?? 'audio/mpeg',
        tamanoBytes: elegido.size ?? null,
        archivoWeb: elegido.file,
      };
      const problema = validar(candidato);
      if (problema) {
        setAviso(problema);
        return;
      }
      setArchivo(candidato);
    } catch (e) {
      setAviso(mensajeDeError(e));
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: 'Importar canción' }} />
      <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
      {archivo ? (
        <View style={estilosImportar.archivo}>
          <View style={estilosImportar.icono}>
            <Ionicons name="musical-note" size={22} color={colores.texto} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={estilosImportar.nombre} numberOfLines={2}>
              {archivo.nombre}
            </Text>
            {archivo.tamanoBytes !== null ? (
              <Text style={estilos.textoSuave}>{tamanoLegible(archivo.tamanoBytes)}</Text>
            ) : null}
          </View>
          <Boton titulo="Cambiar" variante="secundario" alPresionar={() => void elegir()} />
        </View>
      ) : (
        <View style={estilosImportar.elegir}>
          <Ionicons name="musical-notes-outline" size={36} color={colores.textoSuave} />
          <Text style={[estilos.texto, { textAlign: 'center' }]}>
            Elige una canción guardada en tu dispositivo.
          </Text>
          <Text style={[estilos.textoSuave, { textAlign: 'center' }]}>MP3, M4A, AAC o WAV de hasta 50 MB.</Text>
          <Boton titulo="Elegir archivo de audio" icono="folder-open-outline" alPresionar={() => void elegir()} />
        </View>
      )}
      {aviso ? <Text style={estilos.error}>{aviso}</Text> : null}
      {archivo && datos ? (
        <FormularioPista
          key={archivo.uri}
          etiquetas={datos}
          inicial={{ nombre: sinExtension(archivo.nombre), artista: null, etiquetaIds: [] }}
          textoBoton="Importar canción"
          alGuardar={async (pista) => {
            await comandosPistas.importar(archivo, pista);
            router.back();
          }}
        />
      ) : null}
    </ScrollView>
  );
}

const estilosImportar = StyleSheet.create({
  elegir: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colores.linea,
    backgroundColor: colores.superficie,
  },
  archivo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colores.linea,
    backgroundColor: colores.superficie,
  },
  icono: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.superficieAlta,
  },
  nombre: {
    color: colores.texto,
    fontFamily: fuente,
    fontSize: 15,
    fontWeight: '600',
  },
});
