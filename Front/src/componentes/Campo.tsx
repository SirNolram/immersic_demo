import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colores, fuenteLectura } from '@/tema';

interface Props extends TextInputProps {
  etiqueta: string;
  ayuda?: string;
}

export function Campo({ etiqueta, ayuda, multiline, style, ...resto }: Props) {
  return (
    <View style={estilosCampo.contenedor}>
      <Text style={estilosCampo.etiqueta}>{etiqueta}</Text>
      <TextInput
        placeholderTextColor={colores.textoSuave}
        selectionColor={colores.texto}
        {...resto}
        multiline={multiline}
        style={[estilosCampo.entrada, multiline && estilosCampo.multilinea, style]}
      />
      {ayuda ? <Text style={estilosCampo.ayuda}>{ayuda}</Text> : null}
    </View>
  );
}

const estilosCampo = StyleSheet.create({
  contenedor: {
    gap: 6,
  },
  etiqueta: {
    color: colores.textoSuave,
    fontSize: 14,
  },
  entrada: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 10,
    color: colores.texto,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multilinea: {
    minHeight: 280,
    textAlignVertical: 'top',
    fontFamily: fuenteLectura,
    fontSize: 17,
    lineHeight: 26,
  },
  ayuda: {
    color: colores.textoSuave,
    fontSize: 13,
  },
});
