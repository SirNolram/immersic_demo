import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProveedorConfiguracion } from '@/configuracion/ContextoConfiguracion';

export default function DisenoRaiz() {
  return (
    <ProveedorConfiguracion>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ProveedorConfiguracion>
  );
}
