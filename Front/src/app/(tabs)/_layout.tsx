import { Tabs } from 'expo-router';

export default function DisenoPestanas() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Biblioteca' }} />
      <Tabs.Screen name="musica" options={{ title: 'Música' }} />
      <Tabs.Screen name="configuracion" options={{ title: 'Configuración' }} />
    </Tabs>
  );
}
