import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import type { NombreIcono } from './Boton';
import { colores, estilos } from '@/tema';

interface Props {
  icono: NombreIcono;
  mensaje: string;
  children?: ReactNode;
}

export function Vacio({ icono, mensaje, children }: Props) {
  return (
    <View style={{ alignItems: 'center', gap: 14, paddingVertical: 40, paddingHorizontal: 24 }}>
      <Ionicons name={icono} size={36} color={colores.textoSuave} />
      <Text style={[estilos.textoSuave, { textAlign: 'center' }]}>{mensaje}</Text>
      {children}
    </View>
  );
}
