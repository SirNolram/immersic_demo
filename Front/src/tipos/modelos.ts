export interface Libro {
  id: number;
  titulo: string;
  autor: string | null;
  creadoEn: string;
  cantidadCapitulos: number;
}

export interface LibroEntrada {
  titulo: string;
  autor: string | null;
}

export interface CapituloResumen {
  id: number;
  libroId: number;
  numero: number;
  titulo: string;
  caracteres: number;
  cantidadEscenas: number;
  procesadoIa: boolean;
  creadoEn: string;
}

export interface Capitulo extends CapituloResumen {
  contenido: string;
}

export interface CapituloEntrada {
  titulo: string;
  contenido?: string;
  numero?: number;
}

export interface EtiquetaResumen {
  id: number;
  nombre: string;
}

export interface Etiqueta extends EtiquetaResumen {
  descripcion: string;
}

export interface EtiquetaEntrada {
  nombre: string;
  descripcion: string;
}

export interface Pista {
  id: number;
  nombre: string;
  artista: string | null;
  archivoUrl: string | null;
  etiquetas: EtiquetaResumen[];
}

export interface PistaEntrada {
  nombre: string;
  artista: string | null;
  archivoUrl: string | null;
  etiquetaIds: number[];
}

export interface Escena {
  id: number;
  orden: number;
  posicionInicio: number;
  posicionFin: number;
  fragmentoInicio: string;
  etiquetas: EtiquetaResumen[];
}

export interface EscenaEntrada {
  posicionInicio: number;
  etiquetaIds: number[];
}

export interface EscenaPlan {
  escenaId: number;
  orden: number;
  posicionInicio: number;
  posicionFin: number;
  fragmentoInicio: string;
  etiquetas: EtiquetaResumen[];
  pistaRecomendada: Pista | null;
  afinidad: number;
}

export interface PlanInmersion {
  capituloId: number;
  tituloCapitulo: string;
  procesadoIa: boolean;
  escenas: EscenaPlan[];
}

export interface InmersionGenerada {
  capituloId: number;
  modelo: string;
  cantidadEscenas: number;
  escenas: Escena[];
}

export interface Recomendacion {
  pista: Pista;
  afinidad: number;
  etiquetasCompartidas: string[];
}

export interface Salud {
  api: string;
  lectura: string;
  escritura: string;
  fecha: string;
}
