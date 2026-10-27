import { solicitar } from './cliente';
import type { Pista, PistaEntrada } from '@/tipos/modelos';

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
  crear: (datos: PistaEntrada) => solicitar<Pista>('/api/pistas', { metodo: 'POST', cuerpo: datos }),
  actualizar: (id: number, datos: PistaEntrada) =>
    solicitar<Pista>(`/api/pistas/${id}`, { metodo: 'PUT', cuerpo: datos }),
  eliminar: (id: number) => solicitar<void>(`/api/pistas/${id}`, { metodo: 'DELETE' }),
};
