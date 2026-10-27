import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { consultasSalud } from '@/api/salud';
import { Campo } from '@/componentes/Campo';
import { useConfiguracion } from '@/configuracion/ContextoConfiguracion';
import { estilos } from '@/estilos';
import { useAccion } from '@/hooks/useAccion';

export default function Configuracion() {
  const router = useRouter();
  const { urlServidor, guardarUrl, restablecerUrl } = useConfiguracion();
  const [url, setUrl] = useState(urlServidor);
  const [estado, setEstado] = useState('');
  const { ocupado, error, ejecutar } = useAccion();

  useEffect(() => {
    setUrl(urlServidor);
  }, [urlServidor]);

  const probar = () =>
    ejecutar(async () => {
      setEstado('');
      const salud = await consultasSalud.obtener();
      setEstado(`API ${salud.api} · lectura ${salud.lectura} · escritura ${salud.escritura}`);
    });

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.titulo}>Servidor</Text>
      <Campo
        etiqueta="Dirección de la API"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      <View style={estilos.fila}>
        <Button title="Guardar" disabled={ocupado} onPress={() => ejecutar(() => guardarUrl(url))} />
        <Button title="Restablecer" disabled={ocupado} onPress={() => ejecutar(restablecerUrl)} />
        <Button title="Probar conexión" disabled={ocupado} onPress={probar} />
      </View>
      {estado ? <Text>{estado}</Text> : null}
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Text style={estilos.titulo}>Etiquetas</Text>
      <Button title="Administrar etiquetas" onPress={() => router.push('/etiquetas')} />
    </View>
  );
}
