import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Button, Pressable, ScrollView, Text, View } from 'react-native';
import { consultasCapitulos } from '@/api/capitulos';
import { comandosEscenas } from '@/api/escenas';
import { consultasEtiquetas } from '@/api/etiquetas';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { SelectorEtiquetas } from '@/componentes/SelectorEtiquetas';
import { estilos } from '@/estilos';
import { useAccion } from '@/hooks/useAccion';
import { useCarga } from '@/hooks/useCarga';
import { confirmar } from '@/utilidades/dialogos';
import { dividirEnLineas } from '@/utilidades/texto';

export default function EscenasCapitulo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const capituloId = Number(id);
  const [posicion, setPosicion] = useState<number | null>(null);
  const [etiquetaIds, setEtiquetaIds] = useState<number[]>([]);
  const accion = useAccion();

  const cargar = useCallback(async () => {
    const [capitulo, escenas, etiquetas] = await Promise.all([
      consultasCapitulos.obtener(capituloId),
      consultasCapitulos.escenas(capituloId),
      consultasEtiquetas.listar(),
    ]);
    return { capitulo, escenas, etiquetas };
  }, [capituloId]);

  const { datos, error, cargando, recargar } = useCarga(cargar);
  const lineas = useMemo(() => dividirEnLineas(datos?.capitulo.contenido ?? ''), [datos]);
  const inicios = useMemo(() => new Set((datos?.escenas ?? []).map((e) => e.posicionInicio)), [datos]);

  const crear = () =>
    accion.ejecutar(async () => {
      if (posicion === null) {
        return;
      }
      await comandosEscenas.crear(capituloId, { posicionInicio: posicion, etiquetaIds });
      setPosicion(null);
      setEtiquetaIds([]);
      await recargar();
    });

  const eliminar = (escenaId: number) =>
    accion.ejecutar(async () => {
      if (await confirmar('Eliminar escena', '¿Seguro que quieres eliminar esta escena?')) {
        await comandosEscenas.eliminar(escenaId);
        await recargar();
      }
    });

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Stack.Screen options={{ title: 'Escenas' }} />
      <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
      {accion.error ? <Text style={estilos.error}>{accion.error}</Text> : null}
      {datos ? (
        <>
          <Text style={estilos.titulo}>Escenas actuales</Text>
          {datos.escenas.length === 0 ? <Text>No hay escenas.</Text> : null}
          {datos.escenas.map((escena) => (
            <View key={escena.id} style={estilos.item}>
              <Text>
                {escena.orden}. {escena.fragmentoInicio}
              </Text>
              <Text>{escena.etiquetas.map((e) => e.nombre).join(', ')}</Text>
              <Button title="Eliminar" disabled={accion.ocupado} onPress={() => eliminar(escena.id)} />
            </View>
          ))}

          <Text style={estilos.titulo}>Nueva escena</Text>
          <Text>Toca la línea donde empieza la escena:</Text>
          {lineas.map((linea) => (
            <Pressable
              key={linea.inicio}
              disabled={inicios.has(linea.inicio)}
              onPress={() => setPosicion(linea.inicio)}
            >
              <Text>
                {posicion === linea.inicio ? '> ' : inicios.has(linea.inicio) ? '# ' : '  '}
                {linea.texto.slice(0, 80)}
              </Text>
            </Pressable>
          ))}
          <SelectorEtiquetas etiquetas={datos.etiquetas} seleccionadas={etiquetaIds} alCambiar={setEtiquetaIds} />
          <Button
            title={accion.ocupado ? 'Guardando...' : 'Crear escena'}
            disabled={accion.ocupado || posicion === null || etiquetaIds.length === 0}
            onPress={crear}
          />
        </>
      ) : null}
    </ScrollView>
  );
}
