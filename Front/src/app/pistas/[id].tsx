import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { consultasEtiquetas } from '@/api/etiquetas';
import { comandosPistas, consultasPistas } from '@/api/pistas';
import { Boton } from '@/componentes/Boton';
import { BotonReproducir } from '@/componentes/BotonReproducir';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { FormularioPista } from '@/componentes/FormularioPista';
import { useCarga } from '@/hooks/useCarga';
import { useReproduccion } from '@/reproduccion/ContextoReproduccion';
import { colores, estilos, fuente } from '@/tema';
import { avisar, confirmar, mensajeDeError } from '@/utilidades/dialogos';
import { tamanoLegible } from '@/utilidades/texto';

export default function EditarPista() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pistaId = Number(id);
  const router = useRouter();
  const { pistaActual, detener } = useReproduccion();

  const cargar = useCallback(async () => {
    const [pista, etiquetas] = await Promise.all([consultasPistas.obtener(pistaId), consultasEtiquetas.listar()]);
    return { pista, etiquetas };
  }, [pistaId]);

  const { datos, error, cargando, recargar } = useCarga(cargar);

  const eliminar = async () => {
    const aceptar = await confirmar(
      'Eliminar canción',
      'Se borrará el archivo del servidor y dejará de recomendarse en las escenas.',
      'Eliminar',
    );
    if (!aceptar) {
      return;
    }
    try {
      await comandosPistas.eliminar(pistaId);
      if (pistaActual?.id === pistaId) {
        detener();
      }
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
      <Stack.Screen options={{ title: 'Canción' }} />
      <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
      {datos ? (
        <>
          <View style={estilosPista.cabecera}>
            <BotonReproducir pista={datos.pista} tamano={56} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={estilosPista.nombre} numberOfLines={2}>
                {datos.pista.nombre}
              </Text>
              <Text style={estilos.textoSuave} numberOfLines={1}>
                {datos.pista.nombreArchivo}, {tamanoLegible(datos.pista.tamanoBytes)}
              </Text>
            </View>
          </View>
          <FormularioPista
            key={datos.pista.id}
            etiquetas={datos.etiquetas}
            inicial={{
              nombre: datos.pista.nombre,
              artista: datos.pista.artista,
              etiquetaIds: datos.pista.etiquetas.map((e) => e.id),
            }}
            textoBoton="Guardar cambios"
            alGuardar={async (cambios) => {
              await comandosPistas.actualizar(pistaId, cambios);
              router.back();
            }}
          />
          <View style={estilos.separador} />
          <Boton titulo="Eliminar canción" variante="peligro" icono="trash-outline" alPresionar={eliminar} />
        </>
      ) : null}
    </ScrollView>
  );
}

const estilosPista = StyleSheet.create({
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.linea,
  },
  nombre: {
    color: colores.texto,
    fontFamily: fuente,
    fontSize: 18,
    fontWeight: '600',
  },
});
