import { solicitar } from './cliente';
import type { Capitulo, CapituloEntrada, Escena, PlanInmersion } from '@/tipos/modelos';

export const consultasCapitulos = {
  obtener: (id: number) => solicitar<Capitulo>(`/api/capitulos/${id}`),
  escenas: (id: number) => solicitar<Escena[]>(`/api/capitulos/${id}/escenas`),
  plan: (id: number) => solicitar<PlanInmersion>(`/api/capitulos/${id}/inmersion`),
};

export const comandosCapitulos = {
  crear: (libroId: number, datos: CapituloEntrada) =>
    solicitar<Capitulo>(`/api/libros/${libroId}/capitulos`, { metodo: 'POST', cuerpo: datos }),
  actualizar: (id: number, datos: CapituloEntrada) =>
    solicitar<Capitulo>(`/api/capitulos/${id}`, { metodo: 'PUT', cuerpo: datos }),
  eliminar: (id: number) => solicitar<void>(`/api/capitulos/${id}`, { metodo: 'DELETE' }),
};
