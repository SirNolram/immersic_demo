export interface Linea {
  inicio: number;
  texto: string;
}

export function dividirEnLineas(contenido: string): Linea[] {
  const lineas: Linea[] = [];
  let inicio = 0;

  for (const linea of contenido.split('\n')) {
    const recortada = linea.trim();
    if (recortada.length > 0) {
      lineas.push({ inicio: inicio + (linea.length - linea.trimStart().length), texto: recortada });
    }
    inicio += linea.length + 1;
  }

  return lineas;
}
