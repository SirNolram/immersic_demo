import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { comandosLibros, consultasLibros } from '@/api/libros';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { FormularioLibro } from '@/componentes/FormularioLibro';
import { estilos } from '@/estilos';
import { useCarga } from '@/hooks/useCarga';

export default function EditarLibro() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const libroId = Number(id);
  const router = useRouter();
  const { datos, error, cargando, recargar } = useCarga(() => consultasLibros.obtener(libroId));

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: 'Editar libro' }} />
      <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
      {datos ? (
        <FormularioLibro
          inicial={{ titulo: datos.titulo, autor: datos.autor }}
          textoBoton="Guardar cambios"
          alGuardar={async (cambios) => {
            await comandosLibros.actualizar(libroId, cambios);
            router.back();
          }}
        />
      ) : null}
    </View>
  );
}
