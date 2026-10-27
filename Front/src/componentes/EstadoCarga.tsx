import { ActivityIndicator, Button, Text, View } from 'react-native';
import { estilos } from '@/estilos';

interface Props {
  cargando: boolean;
  error: string | null;
  alReintentar: () => void;
}

export function EstadoCarga({ cargando, error, alReintentar }: Props) {
  if (cargando) {
    return <ActivityIndicator />;
  }

  if (error) {
    return (
      <View style={{ gap: 8 }}>
        <Text style={estilos.error}>{error}</Text>
        <Button title="Reintentar" onPress={alReintentar} />
      </View>
    );
  }

  return null;
}
