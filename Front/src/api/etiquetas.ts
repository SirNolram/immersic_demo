import { solicitar } from './cliente';
import type { Etiqueta, EtiquetaEntrada } from '@/tipos/modelos';

export const consultasEtiquetas = {
  listar: () => solicitar<Etiqueta[]>('/api/etiquetas'),
  obtener: (id: number) => solicitar<Etiqueta>(`/api/etiquetas/${id}`),
};

export const comandosEtiquetas = {
  crear: (datos: EtiquetaEntrada) => solicitar<Etiqueta>('/api/etiquetas', { metodo: 'POST', cuerpo: datos }),
  actualizar: (id: number, datos: EtiquetaEntrada) =>
    solicitar<Etiqueta>(`/api/etiquetas/${id}`, { metodo: 'PUT', cuerpo: datos }),
  eliminar: (id: number) => solicitar<void>(`/api/etiquetas/${id}`, { metodo: 'DELETE' }),
};
