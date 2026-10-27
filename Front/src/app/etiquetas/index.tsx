import { Stack, useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { consultasEtiquetas } from '@/api/etiquetas';
import { BotonIcono } from '@/componentes/BotonIcono';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { Fila } from '@/componentes/Fila';
import { useCarga } from '@/hooks/useCarga';
import { colorEmocion, colores, estilos } from '@/tema';

export default function Etiquetas() {
  const router = useRouter();
  const { datos, error, cargando, recargar } = useCarga(() => consultasEtiquetas.listar());

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Emociones',
          headerRight: () => (
            <View style={{ marginRight: 8 }}>
              <BotonIcono icono="add" etiqueta="Agregar etiqueta" alPresionar={() => router.push('/etiquetas/nueva')} />
            </View>
          ),
        }}
      />
      <FlatList
        style={{ backgroundColor: colores.fondo }}
        contentContainerStyle={estilos.lista}
        data={datos ?? []}
        keyExtractor={(etiqueta) => String(etiqueta.id)}
        ListHeaderComponent={
          <View style={estilos.cabeceraLista}>
            <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
            <Text style={estilos.textoSuave}>
              Gemini usa la descripción de cada etiqueta para decidir qué emociones tiene una escena.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Fila
            titulo={item.nombre}
            detalle={item.descripcion || 'Sin descripción'}
            inicio={<View style={[estilosEtiquetas.punto, { backgroundColor: colorEmocion(item.nombre) }]} />}
            alPresionar={() => router.push(`/etiquetas/${item.id}`)}
          />
        )}
      />
    </>
  );
}

const estilosEtiquetas = StyleSheet.create({
  punto: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
