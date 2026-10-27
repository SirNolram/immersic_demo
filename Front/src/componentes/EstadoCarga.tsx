import { ActivityIndicator, Text, View } from 'react-native';
import { Boton } from './Boton';
import { colores, estilos } from '@/tema';

interface Props {
  cargando: boolean;
  error: string | null;
  alReintentar: () => void;
}

export function EstadoCarga({ cargando, error, alReintentar }: Props) {
  if (cargando) {
    return <ActivityIndicator color={colores.texto} style={{ marginVertical: 24 }} />;
  }

  if (error) {
    return (
      <View style={{ gap: 12, alignItems: 'flex-start' }}>
        <Text style={estilos.error}>{error}</Text>
        <Boton titulo="Reintentar" variante="secundario" icono="refresh" alPresionar={alReintentar} />
      </View>
    );
  }

  return null;
}
