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

export function contar(cantidad: number, singular: string, plural: string): string {
  return `${cantidad.toLocaleString('es')} ${cantidad === 1 ? singular : plural}`;
}

export function tamanoLegible(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('es')} KB`;
  }
  return `${(bytes / (1024 * 1024)).toLocaleString('es', { maximumFractionDigits: 1 })} MB`;
}

export function duracionLegible(segundos: number): string {
  const total = Math.max(0, Math.floor(segundos));
  const minutos = Math.floor(total / 60);
  return `${minutos}:${String(total % 60).padStart(2, '0')}`;
}

export function sinExtension(nombreArchivo: string): string {
  const punto = nombreArchivo.lastIndexOf('.');
  return punto > 0 ? nombreArchivo.slice(0, punto) : nombreArchivo;
}
