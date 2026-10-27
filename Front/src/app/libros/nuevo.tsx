import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { comandosLibros } from '@/api/libros';
import { FormularioLibro } from '@/componentes/FormularioLibro';
import { estilos } from '@/estilos';

export default function NuevoLibro() {
  const router = useRouter();

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: 'Nuevo libro' }} />
      <FormularioLibro
        textoBoton="Crear libro"
        alGuardar={async (datos) => {
          const libro = await comandosLibros.crear(datos);
          router.replace(`/libros/${libro.id}`);
        }}
      />
    </View>
  );
}
