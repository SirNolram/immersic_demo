import { DarkTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProveedorConfiguracion } from '@/configuracion/ContextoConfiguracion';
import { ProveedorReproduccion } from '@/reproduccion/ContextoReproduccion';
import { colores, fuente } from '@/tema';

const temaImmersic: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colores.texto,
    background: colores.fondo,
    card: colores.fondo,
    text: colores.texto,
    border: colores.linea,
    notification: colores.peligro,
  },
};

export default function DisenoRaiz() {
  return (
    <ProveedorConfiguracion>
      <ProveedorReproduccion>
        <ThemeProvider value={temaImmersic}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colores.fondo },
              headerTintColor: colores.texto,
              headerTitleStyle: { fontFamily: fuente },
              headerShadowVisible: false,
              headerBackButtonDisplayMode: 'minimal',
              contentStyle: { backgroundColor: colores.fondo },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </ProveedorReproduccion>
    </ProveedorConfiguracion>
  );
}
