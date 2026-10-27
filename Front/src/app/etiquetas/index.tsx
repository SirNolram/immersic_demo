import { Stack, useRouter } from 'expo-router';
import { Button, FlatList, Pressable, Text, View } from 'react-native';
import { consultasEtiquetas } from '@/api/etiquetas';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { estilos } from '@/estilos';
import { useCarga } from '@/hooks/useCarga';

export default function Etiquetas() {
  const router = useRouter();
  const { datos, error, cargando, recargar } = useCarga(() => consultasEtiquetas.listar());

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: 'Etiquetas' }} />
      <Button title="Nueva etiqueta" onPress={() => router.push('/etiquetas/nueva')} />
      <EstadoCarga cargando={cargando} error={error} alReintentar={recargar} />
      <FlatList
        data={datos ?? []}
        keyExtractor={(etiqueta) => String(etiqueta.id)}
        renderItem={({ item }) => (
          <Pressable style={estilos.item} onPress={() => router.push(`/etiquetas/${item.id}`)}>
            <Text style={estilos.titulo}>{item.nombre}</Text>
            <Text>{item.descripcion}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
