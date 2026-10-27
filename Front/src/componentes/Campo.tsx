import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { estilos } from '@/estilos';

interface Props extends TextInputProps {
  etiqueta: string;
}

export function Campo({ etiqueta, multiline, style, ...resto }: Props) {
  return (
    <View style={{ gap: 4 }}>
      <Text>{etiqueta}</Text>
      <TextInput
        {...resto}
        multiline={multiline}
        style={[multiline ? estilos.entradaMultilinea : estilos.entrada, style]}
      />
    </View>
  );
}
