import { Stack, useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { comandosLibros } from '@/api/libros';
import { FormularioLibro } from '@/componentes/FormularioLibro';
import { colores, estilos } from '@/tema';

export default function NuevoLibro() {
  const router = useRouter();

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenido}>
      <Stack.Screen options={{ title: 'Nuevo libro' }} />
      <FormularioLibro
        textoBoton="Crear libro"
        alGuardar={async (datos) => {
          const libro = await comandosLibros.crear(datos);
          router.replace(`/libros/${libro.id}`);
        }}
      />
    </ScrollView>
  );
}
