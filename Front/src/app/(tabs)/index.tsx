import { useRouter } from 'expo-router';
import { Button, FlatList, Pressable, Text, View } from 'react-native';
import { consultasLibros } from '@/api/libros';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { estilos } from '@/estilos';
import { useCarga } from '@/hooks/useCarga';

export default function Biblioteca() {
  const router = useRouter();
  const { datos, error, cargando, recargar } = useCarga(() => consultasLibros.listar());

  return (
    <View style={estilos.pantalla}>
      <Button title="Nuevo libro" onPress={() => router.push('/libros/nuevo')} />
      <EstadoCarga cargando={cargando} error={error} alReintentar={recargar} />
      <FlatList
        data={datos ?? []}
        keyExtractor={(libro) => String(libro.id)}
        ListEmptyComponent={cargando || error ? undefined : <Text>Todavía no hay libros.</Text>}
        renderItem={({ item }) => (
          <Pressable style={estilos.item} onPress={() => router.push(`/libros/${item.id}`)}>
            <Text style={estilos.titulo}>{item.titulo}</Text>
            <Text>
              {item.autor ?? 'Sin autor'} · {item.cantidadCapitulos} capítulo(s)
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
