import { solicitar } from './cliente';
import type { Salud } from '@/tipos/modelos';

export const consultasSalud = {
  obtener: () => solicitar<Salud>('/api/salud'),
};
