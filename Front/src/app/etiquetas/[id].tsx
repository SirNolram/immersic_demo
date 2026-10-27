import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { comandosEtiquetas, consultasEtiquetas } from '@/api/etiquetas';
import { Boton } from '@/componentes/Boton';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { FormularioEtiqueta } from '@/componentes/FormularioEtiqueta';
import { useCarga } from '@/hooks/useCarga';
import { colores, estilos } from '@/tema';
import { avisar, confirmar, mensajeDeError } from '@/utilidades/dialogos';

export default function EditarEtiqueta() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const etiquetaId = Number(id);
  const router = useRouter();
  const { datos, error, cargando, recargar } = useCarga(() => consultasEtiquetas.obtener(etiquetaId));

  const eliminar = async () => {
    const aceptar = await confirmar(
      'Eliminar etiqueta',
      'Solo se puede eliminar si ninguna escena ni pista la usa.',
      'Eliminar',
    );
    if (!aceptar) {
      return;
    }
    try {
      await comandosEtiquetas.eliminar(etiquetaId);
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
      <Stack.Screen options={{ title: 'Editar etiqueta' }} />
      <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
      {datos ? (
        <>
          <FormularioEtiqueta
            key={datos.id}
            inicial={{ nombre: datos.nombre, descripcion: datos.descripcion }}
            textoBoton="Guardar cambios"
            alGuardar={async (cambios) => {
              await comandosEtiquetas.actualizar(etiquetaId, cambios);
              router.back();
            }}
          />
          <View style={estilos.separador} />
          <Boton titulo="Eliminar etiqueta" variante="peligro" icono="trash-outline" alPresionar={eliminar} />
        </>
      ) : null}
    </ScrollView>
  );
}
