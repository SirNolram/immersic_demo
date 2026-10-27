import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Tabs } from 'expo-router';
import { View, type ColorValue } from 'react-native';
import type { NombreIcono } from '@/componentes/Boton';
import { BotonIcono } from '@/componentes/BotonIcono';
import { colores } from '@/tema';

function icono(activo: NombreIcono, inactivo: NombreIcono) {
  return ({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) => (
    <Ionicons name={focused ? activo : inactivo} color={typeof color === 'string' ? color : undefined} size={size} />
  );
}

function botonAgregar(etiqueta: string, ruta: '/libros/nuevo' | '/pistas/nueva') {
  return (
    <View style={{ marginRight: 12 }}>
      <BotonIcono icono="add" etiqueta={etiqueta} alPresionar={() => router.push(ruta)} />
    </View>
  );
}

export default function DisenoPestanas() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colores.fondo },
        headerTintColor: colores.texto,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colores.superficie, borderTopColor: colores.linea },
        tabBarActiveTintColor: colores.texto,
        tabBarInactiveTintColor: colores.textoSuave,
        sceneStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Biblioteca',
          tabBarIcon: icono('library', 'library-outline'),
          headerRight: () => botonAgregar('Agregar libro', '/libros/nuevo'),
        }}
      />
      <Tabs.Screen
        name="musica"
        options={{
          title: 'Música',
          tabBarIcon: icono('musical-notes', 'musical-notes-outline'),
          headerRight: () => botonAgregar('Agregar pista', '/pistas/nueva'),
        }}
      />
      <Tabs.Screen
        name="configuracion"
        options={{ title: 'Ajustes', tabBarIcon: icono('settings', 'settings-outline') }}
      />
    </Tabs>
  );
}
