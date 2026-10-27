import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colores, fuenteLectura } from '@/tema';

interface Props {
  titulo: string;
  detalle?: string;
  inicio?: ReactNode;
  pie?: ReactNode;
  serif?: boolean;
  alPresionar: () => void;
}

export function Fila({ titulo, detalle, inicio, pie, serif = false, alPresionar }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={alPresionar}
      style={({ pressed }) => [estilosFila.fila, pressed && { backgroundColor: colores.superficie }]}
    >
      {inicio}
      <View style={estilosFila.cuerpo}>
        <Text style={[estilosFila.titulo, serif && estilosFila.serif]} numberOfLines={2}>
          {titulo}
        </Text>
        {detalle ? <Text style={estilosFila.detalle}>{detalle}</Text> : null}
        {pie}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colores.textoSuave} />
    </Pressable>
  );
}

const estilosFila = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colores.linea,
  },
  cuerpo: {
    flex: 1,
    gap: 4,
  },
  titulo: {
    color: colores.texto,
    fontSize: 16,
    fontWeight: '500',
  },
  serif: {
    fontFamily: fuenteLectura,
    fontSize: 19,
    fontWeight: 'normal',
  },
  detalle: {
    color: colores.textoSuave,
    fontSize: 14,
  },
});
