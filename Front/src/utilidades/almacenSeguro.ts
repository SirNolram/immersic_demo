import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const enNavegador = Platform.OS === 'web';

export const almacenSeguro = {
  leer: (clave: string): Promise<string | null> =>
    enNavegador ? AsyncStorage.getItem(clave) : SecureStore.getItemAsync(clave),
  guardar: (clave: string, valor: string): Promise<void> =>
    enNavegador ? AsyncStorage.setItem(clave, valor) : SecureStore.setItemAsync(clave, valor),
  borrar: (clave: string): Promise<void> =>
    enNavegador ? AsyncStorage.removeItem(clave) : SecureStore.deleteItemAsync(clave),
};
