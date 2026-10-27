import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Button, ScrollView } from 'react-native';
import { consultasEtiquetas } from '@/api/etiquetas';
import { comandosPistas, consultasPistas } from '@/api/pistas';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { FormularioPista } from '@/componentes/FormularioPista';
import { estilos } from '@/estilos';
import { useCarga } from '@/hooks/useCarga';
import { avisar, confirmar, mensajeDeError } from '@/utilidades/dialogos';

export default function EditarPista() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pistaId = Number(id);
  const router = useRouter();

  const cargar = useCallback(async () => {
    const [pista, etiquetas] = await Promise.all([consultasPistas.obtener(pistaId), consultasEtiquetas.listar()]);
    return { pista, etiquetas };
  }, [pistaId]);

  const { datos, error, cargando, recargar } = useCarga(cargar);

  const eliminar = async () => {
    if (!(await confirmar('Eliminar pista', '¿Seguro que quieres eliminar esta pista?'))) {
      return;
    }
    try {
      await comandosPistas.eliminar(pistaId);
      router.back();
    } catch (e) {
      avisar('No se pudo eliminar', mensajeDeError(e));
    }
  };

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Stack.Screen options={{ title: 'Editar pista' }} />
      <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
      {datos ? (
        <>
          <FormularioPista
            key={datos.pista.id}
            etiquetas={datos.etiquetas}
            inicial={{
              nombre: datos.pista.nombre,
              artista: datos.pista.artista,
              archivoUrl: datos.pista.archivoUrl,
              etiquetaIds: datos.pista.etiquetas.map((e) => e.id),
            }}
            textoBoton="Guardar cambios"
            alGuardar={async (cambios) => {
              await comandosPistas.actualizar(pistaId, cambios);
              router.back();
            }}
          />
          <Button title="Eliminar pista" onPress={eliminar} />
        </>
      ) : null}
    </ScrollView>
  );
}
