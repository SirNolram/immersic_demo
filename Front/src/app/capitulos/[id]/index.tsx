import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { consultasCapitulos } from '@/api/capitulos';
import { Boton } from '@/componentes/Boton';
import { BotonIcono } from '@/componentes/BotonIcono';
import { Chip } from '@/componentes/Chip';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { Vacio } from '@/componentes/Vacio';
import { useCarga } from '@/hooks/useCarga';
import { useGenerarEscenas } from '@/hooks/useGenerarEscenas';
import { colorDeEscena, colores, estilos } from '@/tema';
import type { Pista } from '@/tipos/modelos';
import { contar } from '@/utilidades/texto';

export default function LeerCapitulo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const capituloId = Number(id);
  const router = useRouter();

  const cargar = useCallback(async () => {
    const [capitulo, plan] = await Promise.all([
      consultasCapitulos.obtener(capituloId),
      consultasCapitulos.plan(capituloId),
    ]);
    return { capitulo, plan };
  }, [capituloId]);

  const { datos, error, cargando, recargar } = useCarga(cargar);
  const generacion = useGenerarEscenas(capituloId, recargar);

  const contenido = datos?.capitulo.contenido ?? '';
  const escenas = datos?.plan.escenas ?? [];
  const inicioPrimera = escenas[0]?.posicionInicio ?? 0;

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenido}>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <View style={estilos.fila}>
              <BotonIcono
                icono="layers-outline"
                etiqueta="Escenas"
                alPresionar={() => router.push(`/capitulos/${capituloId}/escenas`)}
              />
              <BotonIcono
                icono="create-outline"
                etiqueta="Editar capítulo"
                alPresionar={() => router.push(`/capitulos/${capituloId}/editar`)}
              />
            </View>
          ),
        }}
      />
      <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
      {datos ? (
        <>
          <View style={{ gap: 6 }}>
            <Text style={estilos.textoSuave}>Capítulo {datos.capitulo.numero}</Text>
            <Text style={estilos.titulo}>{datos.capitulo.titulo}</Text>
            {escenas.length > 0 ? (
              <Text style={estilos.textoSuave}>
                {contar(escenas.length, 'escena', 'escenas')}
                {datos.plan.procesadoIa ? ' propuestas por Gemini' : ' marcadas a mano'}
              </Text>
            ) : null}
          </View>

          {contenido.trim() === '' ? (
            <Vacio icono="document-text-outline" mensaje="Este capítulo todavía no tiene texto.">
              <Boton
                titulo="Agregar texto"
                icono="create-outline"
                alPresionar={() => router.push(`/capitulos/${capituloId}/editar`)}
              />
            </Vacio>
          ) : escenas.length === 0 ? (
            <>
              <View style={estilosLector.aviso}>
                <Text style={estilos.texto}>
                  Divide el capítulo en escenas para que cada una tenga su emoción y su música.
                </Text>
                <Boton
                  titulo="Generar escenas con IA"
                  icono="sparkles-outline"
                  cargando={generacion.generando}
                  alPresionar={() => void generacion.generar(0)}
                />
                <Boton
                  titulo="Marcar escenas a mano"
                  variante="secundario"
                  deshabilitado={generacion.generando}
                  alPresionar={() => router.push(`/capitulos/${capituloId}/escenas`)}
                />
                <EstadoGeneracion generando={generacion.generando} error={generacion.error} />
              </View>
              <Text style={estilos.lectura}>{contenido}</Text>
            </>
          ) : (
            <>
              {inicioPrimera > 0 ? (
                <Text style={estilos.lectura}>{contenido.slice(0, inicioPrimera).trim()}</Text>
              ) : null}
              {escenas.map((escena) => (
                <View
                  key={escena.escenaId}
                  style={[estilosLector.escena, { borderLeftColor: colorDeEscena(escena.etiquetas) }]}
                >
                  <View style={estilos.fila}>
                    {escena.etiquetas.map((etiqueta) => (
                      <Chip key={etiqueta.id} nombre={etiqueta.nombre} />
                    ))}
                  </View>
                  <Musica pista={escena.pistaRecomendada} />
                  <Text style={estilos.lectura}>
                    {contenido.slice(escena.posicionInicio, escena.posicionFin).trim()}
                  </Text>
                </View>
              ))}
              <View style={estilos.separador} />
              <Boton
                titulo="Volver a generar con IA"
                variante="secundario"
                icono="sparkles-outline"
                cargando={generacion.generando}
                alPresionar={() => void generacion.generar(escenas.length)}
              />
              <EstadoGeneracion generando={generacion.generando} error={generacion.error} />
            </>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

function Musica({ pista }: { pista: Pista | null }) {
  if (!pista) {
    return (
      <View style={estilosLector.musica}>
        <Ionicons name="musical-note-outline" size={16} color={colores.textoSuave} />
        <Text style={estilos.textoSuave}>Ninguna pista tiene estas emociones todavía.</Text>
      </View>
    );
  }

  const enlace = pista.archivoUrl;
  return (
    <Pressable
      disabled={!enlace}
      onPress={() => enlace && void Linking.openURL(enlace)}
      style={estilosLector.musica}
      accessibilityRole={enlace ? 'link' : undefined}
    >
      <Ionicons name="musical-note" size={16} color={colores.texto} />
      <Text style={estilosLector.pista} numberOfLines={1}>
        {pista.nombre}
        {pista.artista ? <Text style={estilos.textoSuave}>  {pista.artista}</Text> : null}
      </Text>
      {enlace ? <Ionicons name="open-outline" size={15} color={colores.textoSuave} /> : null}
    </Pressable>
  );
}

function EstadoGeneracion({ generando, error }: { generando: boolean; error: string | null }) {
  if (generando) {
    return <Text style={estilos.textoSuave}>Gemini está leyendo el capítulo. Puede tardar un par de minutos.</Text>;
  }
  return error ? <Text style={estilos.error}>{error}</Text> : null;
}

const estilosLector = StyleSheet.create({
  aviso: {
    gap: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.linea,
  },
  escena: {
    gap: 10,
    paddingLeft: 14,
    paddingVertical: 4,
    borderLeftWidth: 3,
  },
  musica: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pista: {
    flexShrink: 1,
    color: colores.texto,
    fontSize: 14,
    fontWeight: '500',
  },
});
