import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, View } from 'react-native';
import { comandosEtiquetas, consultasEtiquetas } from '@/api/etiquetas';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { FormularioEtiqueta } from '@/componentes/FormularioEtiqueta';
import { estilos } from '@/estilos';
import { useCarga } from '@/hooks/useCarga';
import { avisar, confirmar, mensajeDeError } from '@/utilidades/dialogos';

export default function EditarEtiqueta() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const etiquetaId = Number(id);
  const router = useRouter();
  const { datos, error, cargando, recargar } = useCarga(() => consultasEtiquetas.obtener(etiquetaId));

  const eliminar = async () => {
    if (!(await confirmar('Eliminar etiqueta', '¿Seguro que quieres eliminar esta etiqueta?'))) {
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
    <View style={estilos.pantalla}>
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
          <Button title="Eliminar etiqueta" onPress={eliminar} />
        </>
      ) : null}
    </View>
  );
}
