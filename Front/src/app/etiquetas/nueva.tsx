import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { comandosEtiquetas } from '@/api/etiquetas';
import { FormularioEtiqueta } from '@/componentes/FormularioEtiqueta';
import { estilos } from '@/estilos';

export default function NuevaEtiqueta() {
  const router = useRouter();

  return (
    <View style={estilos.pantalla}>
      <Stack.Screen options={{ title: 'Nueva etiqueta' }} />
      <FormularioEtiqueta
        textoBoton="Crear etiqueta"
        alGuardar={async (datos) => {
          await comandosEtiquetas.crear(datos);
          router.back();
        }}
      />
    </View>
  );
}
