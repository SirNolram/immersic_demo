import { Platform } from 'react-native';
import { solicitar } from './cliente';
import type { ArchivoAudio, Pista, PistaEntrada } from '@/tipos/modelos';

const TIEMPO_IMPORTACION_MS = 120000;

function adjuntarArchivo(formulario: FormData, archivo: ArchivoAudio): void {
  if (Platform.OS === 'web' && archivo.archivoWeb) {
    formulario.append('archivo', archivo.archivoWeb);
    return;
  }
  const archivoNativo = { uri: archivo.uri, name: archivo.nombre, type: archivo.tipo };
  formulario.append('archivo', archivoNativo as unknown as Blob);
}

export const consultasPistas = {
  listar: (buscar = '', etiqueta = '') => {
    const parametros = new URLSearchParams();
    if (buscar) {
      parametros.append('buscar', buscar);
    }
    if (etiqueta) {
      parametros.append('etiqueta', etiqueta);
    }
    const consulta = parametros.toString();
    return solicitar<Pista[]>(`/api/pistas${consulta ? `?${consulta}` : ''}`);
  },
  obtener: (id: number) => solicitar<Pista>(`/api/pistas/${id}`),
};

export const comandosPistas = {
  importar: (archivo: ArchivoAudio, datos: PistaEntrada) => {
    const formulario = new FormData();
    adjuntarArchivo(formulario, archivo);
    formulario.append('nombre', datos.nombre);
    if (datos.artista) {
      formulario.append('artista', datos.artista);
    }
    for (const id of datos.etiquetaIds) {
      formulario.append('etiquetaIds', String(id));
    }
    return solicitar<Pista>('/api/pistas', { metodo: 'POST', formulario, tiempoEsperaMs: TIEMPO_IMPORTACION_MS });
  },
  actualizar: (id: number, datos: PistaEntrada) =>
    solicitar<Pista>(`/api/pistas/${id}`, { metodo: 'PUT', cuerpo: datos }),
  eliminar: (id: number) => solicitar<void>(`/api/pistas/${id}`, { metodo: 'DELETE' }),
};
