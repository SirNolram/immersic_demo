import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { consultasSalud } from '@/api/salud';
import { Boton } from '@/componentes/Boton';
import { Campo } from '@/componentes/Campo';
import { useConfiguracion } from '@/configuracion/ContextoConfiguracion';
import { useAccion } from '@/hooks/useAccion';
import { colores, estilos } from '@/tema';
import { confirmar } from '@/utilidades/dialogos';

const PAGINA_CLAVES_GEMINI = 'https://aistudio.google.com/apikey';

export default function Configuracion() {
  const router = useRouter();
  const { urlServidor, guardarUrl, restablecerUrl, claveGemini, guardarClaveGemini, borrarClaveGemini } =
    useConfiguracion();
  const [url, setUrl] = useState(urlServidor);
  const [estadoServidor, setEstadoServidor] = useState('');
  const [nuevaClave, setNuevaClave] = useState('');
  const servidor = useAccion();
  const gemini = useAccion();

  useEffect(() => {
    setUrl(urlServidor);
  }, [urlServidor]);

  const probar = () =>
    servidor.ejecutar(async () => {
      setEstadoServidor('');
      await guardarUrl(url);
      const salud = await consultasSalud.obtener();
      setEstadoServidor(`Conectado. Lectura ${salud.lectura}, escritura ${salud.escritura}.`);
    });

  const guardarClave = () =>
    gemini.ejecutar(async () => {
      await guardarClaveGemini(nuevaClave);
      setNuevaClave('');
    });

  const borrarClave = () =>
    gemini.ejecutar(async () => {
      const aceptar = await confirmar(
        'Borrar API key',
        'Tendrás que volver a escribirla para generar escenas con IA.',
        'Borrar',
      );
      if (aceptar) {
        await borrarClaveGemini();
      }
    });

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenido}>
      <Text style={estilos.seccion}>Servidor</Text>
      <Campo
        etiqueta="Dirección de la API"
        ayuda="Si la app no se conecta, escribe la IP del computador donde corre el backend."
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      <View style={estilos.fila}>
        <Boton titulo="Guardar y probar" icono="pulse" cargando={servidor.ocupado} alPresionar={probar} />
        <Boton
          titulo="Restablecer"
          variante="secundario"
          deshabilitado={servidor.ocupado}
          alPresionar={() => servidor.ejecutar(restablecerUrl)}
        />
      </View>
      {estadoServidor ? <Text style={estilos.texto}>{estadoServidor}</Text> : null}
      {servidor.error ? <Text style={estilos.error}>{servidor.error}</Text> : null}

      <View style={estilos.separador} />

      <Text style={estilos.seccion}>Gemini</Text>
      <Text style={estilos.textoSuave}>
        Con tu propia API key, Gemini divide cada capítulo en escenas y les asigna emociones. La llave se guarda
        solo en este dispositivo y el servidor no la almacena.
      </Text>
      {claveGemini ? (
        <Text style={estilos.texto}>Llave guardada, termina en {claveGemini.slice(-4)}.</Text>
      ) : (
        <Text style={estilos.texto}>Todavía no hay una llave guardada.</Text>
      )}
      <Campo
        etiqueta={claveGemini ? 'Reemplazar API key' : 'API key de Gemini'}
        value={nuevaClave}
        onChangeText={setNuevaClave}
        placeholder="AIza..."
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={estilos.fila}>
        <Boton
          titulo="Guardar llave"
          icono="key-outline"
          cargando={gemini.ocupado}
          deshabilitado={!nuevaClave.trim()}
          alPresionar={guardarClave}
        />
        {claveGemini ? (
          <Boton titulo="Borrar" variante="peligro" deshabilitado={gemini.ocupado} alPresionar={borrarClave} />
        ) : null}
      </View>
      <Boton
        titulo="Obtener una API key"
        variante="secundario"
        icono="open-outline"
        alPresionar={() => void Linking.openURL(PAGINA_CLAVES_GEMINI)}
      />
      {gemini.error ? <Text style={estilos.error}>{gemini.error}</Text> : null}

      <View style={estilos.separador} />

      <Text style={estilos.seccion}>Emociones</Text>
      <Text style={estilos.textoSuave}>Las etiquetas con las que se clasifican las escenas y las pistas.</Text>
      <Boton
        titulo="Administrar etiquetas"
        variante="secundario"
        icono="pricetags-outline"
        alPresionar={() => router.push('/etiquetas')}
      />
    </ScrollView>
  );
}
