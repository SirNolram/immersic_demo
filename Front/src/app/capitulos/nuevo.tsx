import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { comandosCapitulos } from '@/api/capitulos';
import { Campo } from '@/componentes/Campo';
import { estilos } from '@/estilos';
import { useAccion } from '@/hooks/useAccion';

export default function NuevoCapitulo() {
  const { libroId } = useLocalSearchParams<{ libroId: string }>();
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const { ocupado, error, ejecutar } = useAccion();

  const crear = () =>
    ejecutar(async () => {
      const capitulo = await comandosCapitulos.crear(Number(libroId), { titulo: titulo.trim() });
      router.replace(`/capitulos/${capitulo.id}/editar`);
    });

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: 'Nuevo capítulo' }} />
      <Campo etiqueta="Título del capítulo" value={titulo} onChangeText={setTitulo} maxLength={150} />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <View style={estilos.fila}>
        <Button title="Cancelar" onPress={() => router.back()} />
        <Button title={ocupado ? 'Creando...' : 'Aceptar'} disabled={ocupado || !titulo.trim()} onPress={crear} />
      </View>
    </View>
  );
}
