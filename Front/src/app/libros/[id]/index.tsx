import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { consultasLibros } from '@/api/libros';
import { Boton } from '@/componentes/Boton';
import { BotonIcono } from '@/componentes/BotonIcono';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { Fila } from '@/componentes/Fila';
import { Vacio } from '@/componentes/Vacio';
import { useCarga } from '@/hooks/useCarga';
import { colores, estilos } from '@/tema';
import { contar } from '@/utilidades/texto';

export default function DetalleLibro() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const libroId = Number(id);
  const router = useRouter();

  const cargar = useCallback(async () => {
    const [libro, capitulos] = await Promise.all([
      consultasLibros.obtener(libroId),
      consultasLibros.capitulos(libroId),
    ]);
    return { libro, capitulos };
  }, [libroId]);

  const { datos, error, cargando, recargar } = useCarga(cargar);

  const agregarCapitulo = () =>
    router.push({ pathname: '/capitulos/nuevo', params: { libroId: String(libroId) } });

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <View style={{ marginRight: 8 }}>
              <BotonIcono
                icono="create-outline"
                etiqueta="Editar libro"
                alPresionar={() => router.push(`/libros/${libroId}/editar`)}
              />
            </View>
          ),
        }}
      />
      <FlatList
        style={{ backgroundColor: colores.fondo }}
        contentContainerStyle={estilos.lista}
        data={datos?.capitulos ?? []}
        keyExtractor={(capitulo) => String(capitulo.id)}
        ListHeaderComponent={
          <View style={estilos.cabeceraLista}>
            <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
            {datos ? (
              <>
                <View style={{ gap: 6 }}>
                  <Text style={estilos.titulo}>{datos.libro.titulo}</Text>
                  <Text style={estilos.textoSuave}>{datos.libro.autor ?? 'Autor desconocido'}</Text>
                </View>
                {datos.capitulos.length > 0 ? (
                  <View style={[estilos.fila, { justifyContent: 'space-between' }]}>
                    <Text style={estilos.seccion}>{contar(datos.capitulos.length, 'capítulo', 'capítulos')}</Text>
                    <Boton titulo="Agregar capítulo" variante="secundario" icono="add" alPresionar={agregarCapitulo} />
                  </View>
                ) : null}
              </>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          datos ? (
            <Vacio
              icono="document-text-outline"
              mensaje="Este libro todavía no tiene capítulos. Pega el texto del primero."
            >
              <Boton titulo="Agregar capítulo" icono="add" alPresionar={agregarCapitulo} />
            </Vacio>
          ) : undefined
        }
        renderItem={({ item }) => (
          <Fila
            titulo={item.titulo}
            detalle={
              item.cantidadEscenas > 0
                ? contar(item.cantidadEscenas, 'escena', 'escenas')
                : item.caracteres > 0
                  ? 'Sin escenas todavía'
                  : 'Sin texto todavía'
            }
            inicio={<Text style={estilosLibro.numero}>{item.numero}</Text>}
            pie={
              item.procesadoIa ? (
                <View style={estilosLibro.insignia}>
                  <Text style={estilosLibro.textoInsignia}>Escenas generadas con IA</Text>
                </View>
              ) : null
            }
            alPresionar={() => router.push(`/capitulos/${item.id}`)}
          />
        )}
      />
    </>
  );
}

const estilosLibro = StyleSheet.create({
  numero: {
    width: 28,
    color: colores.textoSuave,
    fontSize: 17,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  insignia: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colores.linea,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  textoInsignia: {
    color: colores.textoSuave,
    fontSize: 12,
  },
});
