import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, ScrollView, Text } from 'react-native';
import { comandosCapitulos, consultasCapitulos } from '@/api/capitulos';
import { Campo } from '@/componentes/Campo';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { estilos } from '@/estilos';
import { useAccion } from '@/hooks/useAccion';
import { useCarga } from '@/hooks/useCarga';
import { confirmar } from '@/utilidades/dialogos';

const MAXIMO_CARACTERES = 60000;

export default function EditarCapitulo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const capituloId = Number(id);
  const router = useRouter();
  const { datos, error, cargando, recargar } = useCarga(() => consultasCapitulos.obtener(capituloId));
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const accion = useAccion();

  useEffect(() => {
    if (datos) {
      setTitulo(datos.titulo);
      setContenido(datos.contenido);
    }
  }, [datos]);

  const guardar = () =>
    accion.ejecutar(async () => {
      if (!datos) {
        return;
      }
      const cambiaTexto = contenido !== datos.contenido;
      if (cambiaTexto && datos.cantidadEscenas > 0) {
        const seguir = await confirmar(
          'Guardar cambios',
          'El texto cambió, así que se borrarán las escenas de este capítulo.',
        );
        if (!seguir) {
          return;
        }
      }
      await comandosCapitulos.actualizar(capituloId, { titulo: titulo.trim(), contenido });
      router.back();
    });

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Stack.Screen options={{ title: 'Editar capítulo' }} />
      <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
      {datos ? (
        <>
          <Campo etiqueta="Título" value={titulo} onChangeText={setTitulo} maxLength={150} />
          <Campo
            etiqueta={`Contenido (${contenido.length}/${MAXIMO_CARACTERES})`}
            value={contenido}
            onChangeText={setContenido}
            maxLength={MAXIMO_CARACTERES}
            multiline
          />
          {accion.error ? <Text style={estilos.error}>{accion.error}</Text> : null}
          <Button
            title={accion.ocupado ? 'Guardando...' : 'Guardar'}
            disabled={accion.ocupado || !titulo.trim()}
            onPress={guardar}
          />
        </>
      ) : null}
    </ScrollView>
  );
}
