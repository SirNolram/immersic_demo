import { StyleSheet } from 'react-native';

export const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  fila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  entrada: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
  },
  entradaMultilinea: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    minHeight: 240,
    textAlignVertical: 'top',
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    gap: 4,
  },
  titulo: {
    fontWeight: 'bold',
  },
  error: {
    color: '#b00020',
  },
});
