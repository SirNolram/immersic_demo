import { Stack, useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { consultasEtiquetas } from '@/api/etiquetas';
import { comandosPistas } from '@/api/pistas';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { FormularioPista } from '@/componentes/FormularioPista';
import { estilos } from '@/estilos';
import { useCarga } from '@/hooks/useCarga';

export default function NuevaPista() {
  const router = useRouter();
  const { datos, error, cargando, recargar } = useCarga(() => consultasEtiquetas.listar());

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Stack.Screen options={{ title: 'Nueva pista' }} />
      <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
      {datos ? (
        <FormularioPista
          etiquetas={datos}
          textoBoton="Crear pista"
          alGuardar={async (pista) => {
            await comandosPistas.crear(pista);
            router.back();
          }}
        />
      ) : null}
    </ScrollView>
  );
}
