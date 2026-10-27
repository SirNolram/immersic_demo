import { solicitar } from './cliente';
import type { CapituloResumen, Libro, LibroEntrada } from '@/tipos/modelos';

export const consultasLibros = {
  listar: (buscar = '') =>
    solicitar<Libro[]>(`/api/libros${buscar ? `?buscar=${encodeURIComponent(buscar)}` : ''}`),
  obtener: (id: number) => solicitar<Libro>(`/api/libros/${id}`),
  capitulos: (id: number) => solicitar<CapituloResumen[]>(`/api/libros/${id}/capitulos`),
};

export const comandosLibros = {
  crear: (datos: LibroEntrada) => solicitar<Libro>('/api/libros', { metodo: 'POST', cuerpo: datos }),
  actualizar: (id: number, datos: LibroEntrada) =>
    solicitar<Libro>(`/api/libros/${id}`, { metodo: 'PUT', cuerpo: datos }),
  eliminar: (id: number) => solicitar<void>(`/api/libros/${id}`, { metodo: 'DELETE' }),
};
