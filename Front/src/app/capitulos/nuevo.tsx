import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { comandosCapitulos } from '@/api/capitulos';
import { FormularioCapitulo } from '@/componentes/FormularioCapitulo';
import { colores, estilos } from '@/tema';

export default function NuevoCapitulo() {
  const { libroId } = useLocalSearchParams<{ libroId: string }>();
  const router = useRouter();

  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: 'Nuevo capítulo' }} />
      <FormularioCapitulo
        textoBoton="Crear capítulo"
        alGuardar={async (datos) => {
          const capitulo = await comandosCapitulos.crear(Number(libroId), datos);
          router.replace(`/capitulos/${capitulo.id}`);
        }}
      />
    </ScrollView>
  );
}
