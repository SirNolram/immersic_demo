export class ErrorApi extends Error {
  readonly estado: number;

  constructor(estado: number, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
  }
}

interface Problema {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

interface Opciones {
  metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  cuerpo?: unknown;
}

const TIEMPO_ESPERA_MS = 10000;

let urlBase = 'http://localhost:5080';

export function establecerUrlBase(url: string): void {
  urlBase = url.trim().replace(/\/+$/, '');
}

async function leerMensaje(respuesta: Response): Promise<string> {
  try {
    const problema = (await respuesta.json()) as Problema;
    const detalles = problema.errors ? Object.values(problema.errors).flat() : [];
    if (detalles.length > 0) {
      return detalles.join('\n');
    }
    return problema.detail ?? problema.title ?? `Error ${respuesta.status}`;
  } catch {
    return `Error ${respuesta.status}`;
  }
}

export async function solicitar<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_ESPERA_MS);

  let respuesta: Response;
  try {
    respuesta = await fetch(`${urlBase}${ruta}`, {
      method: opciones.metodo ?? 'GET',
      headers: opciones.cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
      signal: controlador.signal,
    });
  } catch {
    throw new ErrorApi(0, `No se pudo conectar con el servidor (${urlBase}).`);
  } finally {
    clearTimeout(temporizador);
  }

  if (!respuesta.ok) {
    throw new ErrorApi(respuesta.status, await leerMensaje(respuesta));
  }

  if (respuesta.status === 204) {
    return undefined as T;
  }

  return (await respuesta.json()) as T;
}
