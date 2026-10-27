import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Button, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { consultasEtiquetas } from '@/api/etiquetas';
import { consultasPistas } from '@/api/pistas';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { estilos } from '@/estilos';
import { useConfiguracion } from '@/configuracion/ContextoConfiguracion';
import { useCarga } from '@/hooks/useCarga';

export default function Musica() {
  const router = useRouter();
  const { lista } = useConfiguracion();
  const [buscar, setBuscar] = useState('');
  const [etiqueta, setEtiqueta] = useState('');

  const cargar = useCallback(async () => {
    const [pistas, etiquetas] = await Promise.all([
      consultasPistas.listar(buscar.trim(), etiqueta),
      consultasEtiquetas.listar(),
    ]);
    return { pistas, etiquetas };
  }, [buscar, etiqueta]);

  const { datos, error, cargando, recargar } = useCarga(cargar);

  useEffect(() => {
    if (lista) {
      void recargar();
    }
  }, [etiqueta, lista, recargar]);

  return (
    <View style={estilos.pantalla}>
      <Button title="Nueva pista" onPress={() => router.push('/pistas/nueva')} />
      <TextInput
        style={estilos.entrada}
        placeholder="Buscar por nombre o artista"
        value={buscar}
        onChangeText={setBuscar}
        onSubmitEditing={() => void recargar()}
        returnKeyType="search"
      />
      <View style={estilos.fila}>
        <Pressable onPress={() => setEtiqueta('')}>
          <Text>{etiqueta === '' ? '[x] todas' : '[ ] todas'}</Text>
        </Pressable>
        {(datos?.etiquetas ?? []).map((actual) => (
          <Pressable key={actual.id} onPress={() => setEtiqueta(actual.nombre)}>
            <Text>
              {etiqueta === actual.nombre ? '[x] ' : '[ ] '}
              {actual.nombre}
            </Text>
          </Pressable>
        ))}
      </View>
      <EstadoCarga cargando={cargando} error={error} alReintentar={recargar} />
      <FlatList
        data={datos?.pistas ?? []}
        keyExtractor={(pista) => String(pista.id)}
        ListEmptyComponent={cargando || error ? undefined : <Text>No hay pistas.</Text>}
        renderItem={({ item }) => (
          <Pressable style={estilos.item} onPress={() => router.push(`/pistas/${item.id}`)}>
            <Text style={estilos.titulo}>{item.nombre}</Text>
            <Text>{item.artista ?? 'Sin artista'}</Text>
            <Text>{item.etiquetas.map((e) => e.nombre).join(', ')}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
