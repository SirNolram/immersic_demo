import { Alert, Platform } from 'react-native';

interface VentanaNavegador {
  confirm?: (mensaje: string) => boolean;
  alert?: (mensaje: string) => void;
}

const ventana = globalThis as VentanaNavegador;

export function confirmar(
  titulo: string,
  mensaje: string,
  textoAceptar = 'Aceptar',
  destructivo = true,
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(ventana.confirm ? ventana.confirm(`${titulo}\n\n${mensaje}`) : true);
  }

  return new Promise((resolver) => {
    Alert.alert(
      titulo,
      mensaje,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolver(false) },
        { text: textoAceptar, style: destructivo ? 'destructive' : 'default', onPress: () => resolver(true) },
      ],
      { cancelable: true, onDismiss: () => resolver(false) },
    );
  });
}

export function avisar(titulo: string, mensaje: string): void {
  if (Platform.OS === 'web') {
    ventana.alert?.(`${titulo}\n\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
}

export function mensajeDeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}
