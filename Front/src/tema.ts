import { Platform, StyleSheet } from 'react-native';

export const colores = {
  fondo: '#0F1420',
  superficie: '#171E2D',
  superficieAlta: '#212A3C',
  linea: '#2B3548',
  texto: '#ECE6D8',
  textoSuave: '#99A1B3',
  textoInverso: '#0F1420',
  peligro: '#E0686B',
};

export const fuenteLectura = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

const coloresEmocion: Record<string, string> = {
  suspenso: '#D9A441',
  accion: '#F08A4B',
  calma: '#5FB3A8',
  misterio: '#9A7FD1',
  perdida: '#8391AD',
  romance: '#E57A9A',
  terror: '#D0494E',
  epico: '#E8C25A',
  feliz: '#F2D16B',
  triste: '#5C86C4',
  combate: '#D9603B',
  intenso: '#ECE6D8',
};

const coloresReserva = ['#6FA8DC', '#C78BD6', '#8CC084', '#E3A16F', '#7FC6C9', '#D6A0B5'];

export function colorEmocion(nombre: string): string {
  const conocido = coloresEmocion[nombre.toLowerCase()];
  if (conocido) {
    return conocido;
  }

  let suma = 0;
  for (const caracter of nombre) {
    suma = (suma * 31 + caracter.charCodeAt(0)) % 9973;
  }
  return coloresReserva[suma % coloresReserva.length] ?? colores.textoSuave;
}

export function colorDeEscena(etiquetas: { nombre: string }[]): string {
  const principal = etiquetas.find((etiqueta) => etiqueta.nombre !== 'intenso') ?? etiquetas[0];
  return principal ? colorEmocion(principal.nombre) : colores.linea;
}

export const estilos = StyleSheet.create({
  contenido: {
    padding: 16,
    paddingBottom: 48,
    gap: 16,
  },
  lista: {
    padding: 16,
    paddingBottom: 48,
  },
  cabeceraLista: {
    gap: 16,
    paddingBottom: 8,
  },
  fila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  titulo: {
    color: colores.texto,
    fontFamily: fuenteLectura,
    fontSize: 26,
    lineHeight: 32,
  },
  seccion: {
    color: colores.texto,
    fontSize: 17,
    fontWeight: '600',
    marginTop: 8,
  },
  texto: {
    color: colores.texto,
    fontSize: 15,
    lineHeight: 21,
  },
  textoSuave: {
    color: colores.textoSuave,
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    color: colores.peligro,
    fontSize: 14,
    lineHeight: 20,
  },
  separador: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colores.linea,
  },
  lectura: {
    color: colores.texto,
    fontFamily: fuenteLectura,
    fontSize: 18,
    lineHeight: 30,
  },
});
