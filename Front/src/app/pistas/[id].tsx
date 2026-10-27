import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { consultasEtiquetas } from '@/api/etiquetas';
import { comandosPistas, consultasPistas } from '@/api/pistas';
import { Boton } from '@/componentes/Boton';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { FormularioPista } from '@/componentes/FormularioPista';
import { useCarga } from '@/hooks/useCarga';
import { colores, estilos } from '@/tema';
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
    if (!(await confirmar('Eliminar pista', 'Dejará de recomendarse en las escenas.', 'Eliminar'))) {
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
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
    >
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
          <View style={estilos.separador} />
          <Boton titulo="Eliminar pista" variante="peligro" icono="trash-outline" alPresionar={eliminar} />
        </>
      ) : null}
    </ScrollView>
  );
}
