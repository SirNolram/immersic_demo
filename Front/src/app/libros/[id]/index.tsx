import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { comandosCapitulos } from '@/api/capitulos';
import { comandosLibros, consultasLibros } from '@/api/libros';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { estilos } from '@/estilos';
import { useCarga } from '@/hooks/useCarga';
import { avisar, confirmar, mensajeDeError } from '@/utilidades/dialogos';

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

  const eliminarLibro = async () => {
    if (!(await confirmar('Eliminar libro', 'Se borrarán también sus capítulos y escenas.'))) {
      return;
    }
    try {
      await comandosLibros.eliminar(libroId);
      router.back();
    } catch (e) {
      avisar('No se pudo eliminar', mensajeDeError(e));
    }
  };

  const eliminarCapitulo = async (capituloId: number) => {
    if (!(await confirmar('Eliminar capítulo', 'Se borrarán también sus escenas.'))) {
      return;
    }
    try {
      await comandosCapitulos.eliminar(capituloId);
      await recargar();
    } catch (e) {
      avisar('No se pudo eliminar', mensajeDeError(e));
    }
  };

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: datos?.libro.titulo ?? 'Libro' }} />
      <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
      {datos ? (
        <>
          <Text>{datos.libro.autor ?? 'Sin autor'}</Text>
          <View style={estilos.fila}>
            <Button title="Editar libro" onPress={() => router.push(`/libros/${libroId}/editar`)} />
            <Button title="Eliminar libro" onPress={eliminarLibro} />
          </View>
          <Button
            title="Añadir capítulo"
            onPress={() => router.push({ pathname: '/capitulos/nuevo', params: { libroId: String(libroId) } })}
          />
          <FlatList
            data={datos.capitulos}
            keyExtractor={(capitulo) => String(capitulo.id)}
            ListEmptyComponent={<Text>Este libro todavía no tiene capítulos.</Text>}
            renderItem={({ item }) => (
              <View style={estilos.item}>
                <Text style={estilos.titulo}>
                  {item.numero}. {item.titulo}
                </Text>
                <Text>
                  {item.caracteres} caracteres · {item.cantidadEscenas} escena(s)
                </Text>
                <View style={estilos.fila}>
                  <Button title="Ver" onPress={() => router.push(`/capitulos/${item.id}`)} />
                  <Button title="Editar" onPress={() => router.push(`/capitulos/${item.id}/editar`)} />
                  <Button title="Eliminar" onPress={() => eliminarCapitulo(item.id)} />
                </View>
              </View>
            )}
          />
        </>
      ) : null}
    </View>
  );
}
