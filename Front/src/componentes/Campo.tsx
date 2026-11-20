import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colores, fuente } from '@/tema';

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
    fontFamily: fuente,
    fontSize: 14,
  },
  entrada: {
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 10,
    color: colores.texto,
    fontFamily: fuente,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multilinea: {
    minHeight: 280,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 24,
  },
  ayuda: {
    color: colores.textoSuave,
    fontFamily: fuente,
    fontSize: 13,
  },
});
