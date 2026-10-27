import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { comandosLibros, consultasLibros } from '@/api/libros';
import { Boton } from '@/componentes/Boton';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { FormularioLibro } from '@/componentes/FormularioLibro';
import { useCarga } from '@/hooks/useCarga';
import { colores, estilos } from '@/tema';
import { avisar, confirmar, mensajeDeError } from '@/utilidades/dialogos';

export default function EditarLibro() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const libroId = Number(id);
  const router = useRouter();
  const { datos, error, cargando, recargar } = useCarga(() => consultasLibros.obtener(libroId));

  const eliminar = async () => {
    if (!(await confirmar('Eliminar libro', 'Se borrarán también sus capítulos y escenas.', 'Eliminar'))) {
      return;
    }
    try {
      await comandosLibros.eliminar(libroId);
      router.dismissTo('/');
    } catch (e) {
      avisar('No se pudo eliminar', mensajeDeError(e));
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenido}>
      <Stack.Screen options={{ title: 'Editar libro' }} />
      <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
      {datos ? (
        <>
          <FormularioLibro
            key={datos.id}
            inicial={{ titulo: datos.titulo, autor: datos.autor }}
            textoBoton="Guardar cambios"
            alGuardar={async (cambios) => {
              await comandosLibros.actualizar(libroId, cambios);
              router.back();
            }}
          />
          <View style={estilos.separador} />
          <Boton titulo="Eliminar libro" variante="peligro" icono="trash-outline" alPresionar={eliminar} />
        </>
      ) : null}
    </ScrollView>
  );
}
