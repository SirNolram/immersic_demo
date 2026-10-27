import { Stack, useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { comandosEtiquetas } from '@/api/etiquetas';
import { FormularioEtiqueta } from '@/componentes/FormularioEtiqueta';
import { colores, estilos } from '@/tema';

export default function NuevaEtiqueta() {
  const router = useRouter();

  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: 'Nueva etiqueta' }} />
      <FormularioEtiqueta
        textoBoton="Crear etiqueta"
        alGuardar={async (datos) => {
          await comandosEtiquetas.crear(datos);
          router.back();
        }}
      />
    </ScrollView>
  );
}
