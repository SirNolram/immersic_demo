import { solicitar } from './cliente';
import type { Escena, EscenaEntrada, Recomendacion } from '@/tipos/modelos';

export const consultasEscenas = {
  recomendaciones: (id: number, limite = 5) =>
    solicitar<Recomendacion[]>(`/api/escenas/${id}/recomendaciones?limite=${limite}`),
};

export const comandosEscenas = {
  crear: (capituloId: number, datos: EscenaEntrada) =>
    solicitar<Escena>(`/api/capitulos/${capituloId}/escenas`, { metodo: 'POST', cuerpo: datos }),
  actualizarEtiquetas: (id: number, etiquetaIds: number[]) =>
    solicitar<Escena>(`/api/escenas/${id}`, { metodo: 'PUT', cuerpo: { etiquetaIds } }),
  eliminar: (id: number) => solicitar<void>(`/api/escenas/${id}`, { metodo: 'DELETE' }),
  eliminarTodas: (capituloId: number) =>
    solicitar<void>(`/api/capitulos/${capituloId}/escenas`, { metodo: 'DELETE' }),
};
