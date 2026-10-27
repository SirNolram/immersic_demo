import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import { consultasCapitulos } from '@/api/capitulos';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { estilos } from '@/estilos';
import { useCarga } from '@/hooks/useCarga';

export default function VerCapitulo() {
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
  const escenas = datos?.plan.escenas ?? [];
  const inicioPrimera = escenas[0]?.posicionInicio ?? 0;

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Stack.Screen options={{ title: datos?.capitulo.titulo ?? 'Capítulo' }} />
      <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
      {datos ? (
        <>
          <Button title="Escenas" onPress={() => router.push(`/capitulos/${capituloId}/escenas`)} />
          {escenas.length === 0 ? (
            <>
              <Text>Este capítulo todavía no tiene escenas.</Text>
              <Text>{datos.capitulo.contenido}</Text>
            </>
          ) : (
            <>
              {inicioPrimera > 0 ? <Text>{datos.capitulo.contenido.slice(0, inicioPrimera)}</Text> : null}
              {escenas.map((escena) => (
                <View key={escena.escenaId} style={estilos.item}>
                  <Text style={estilos.titulo}>
                    Escena {escena.orden} · {escena.etiquetas.map((e) => e.nombre).join(', ')}
                  </Text>
                  <Text>
                    Música: {escena.pistaRecomendada ? escena.pistaRecomendada.nombre : 'ninguna compatible'}
                  </Text>
                  <Text>{datos.capitulo.contenido.slice(escena.posicionInicio, escena.posicionFin)}</Text>
                </View>
              ))}
            </>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}
