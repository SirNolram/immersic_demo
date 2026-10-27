import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { comandosCapitulos, consultasCapitulos } from '@/api/capitulos';
import { Boton } from '@/componentes/Boton';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { FormularioCapitulo } from '@/componentes/FormularioCapitulo';
import { useCarga } from '@/hooks/useCarga';
import { colores, estilos } from '@/tema';
import { avisar, confirmar, mensajeDeError } from '@/utilidades/dialogos';

export default function EditarCapitulo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const capituloId = Number(id);
  const router = useRouter();
  const { datos, error, cargando, recargar } = useCarga(() => consultasCapitulos.obtener(capituloId));

  const eliminar = async () => {
    if (!datos || !(await confirmar('Eliminar capítulo', 'Se borrarán también sus escenas.', 'Eliminar'))) {
      return;
    }
    try {
      await comandosCapitulos.eliminar(capituloId);
      router.dismissTo(`/libros/${datos.libroId}`);
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
      <Stack.Screen options={{ title: 'Editar capítulo' }} />
      <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
      {datos ? (
        <>
          <FormularioCapitulo
            key={datos.id}
            inicial={{ titulo: datos.titulo, contenido: datos.contenido }}
            textoBoton="Guardar cambios"
            alGuardar={async (cambios) => {
              const cambiaTexto = cambios.contenido !== datos.contenido;
              if (cambiaTexto && datos.cantidadEscenas > 0) {
                const seguir = await confirmar(
                  'Guardar cambios',
                  'El texto cambió, así que se borrarán las escenas de este capítulo.',
                  'Guardar',
                );
                if (!seguir) {
                  return;
                }
              }
              await comandosCapitulos.actualizar(capituloId, cambios);
              router.back();
            }}
          />
          <View style={estilos.separador} />
          <Boton titulo="Eliminar capítulo" variante="peligro" icono="trash-outline" alPresionar={eliminar} />
        </>
      ) : null}
    </ScrollView>
  );
}
