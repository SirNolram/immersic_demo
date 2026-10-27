import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { consultasEtiquetas } from '@/api/etiquetas';
import { consultasPistas } from '@/api/pistas';
import { Boton } from '@/componentes/Boton';
import { Chip } from '@/componentes/Chip';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { Fila } from '@/componentes/Fila';
import { Vacio } from '@/componentes/Vacio';
import { useConfiguracion } from '@/configuracion/ContextoConfiguracion';
import { useCarga } from '@/hooks/useCarga';
import { colores, estilos } from '@/tema';

export default function Musica() {
  const router = useRouter();
  const { lista } = useConfiguracion();
  const [buscar, setBuscar] = useState('');
  const [etiqueta, setEtiqueta] = useState('');

  const cargar = useCallback(async () => {
    const [pistas, etiquetas] = await Promise.all([
      consultasPistas.listar(buscar.trim(), etiqueta),
      consultasEtiquetas.listar(),
    ]);
    return { pistas, etiquetas };
  }, [buscar, etiqueta]);

  const { datos, error, cargando, recargar } = useCarga(cargar);

  useEffect(() => {
    if (lista) {
      void recargar();
    }
  }, [etiqueta, lista, recargar]);

  const filtrando = buscar.trim() !== '' || etiqueta !== '';

  return (
    <FlatList
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.lista}
      data={datos?.pistas ?? []}
      keyExtractor={(pista) => String(pista.id)}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={estilos.cabeceraLista}>
          <TextInput
            style={estilosMusica.buscador}
            placeholder="Buscar por canción o artista"
            placeholderTextColor={colores.textoSuave}
            selectionColor={colores.texto}
            value={buscar}
            onChangeText={setBuscar}
            onSubmitEditing={() => void recargar()}
            returnKeyType="search"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <Chip
              nombre="todas"
              color={colores.texto}
              seleccionado={etiqueta === ''}
              alPresionar={() => setEtiqueta('')}
            />
            {(datos?.etiquetas ?? []).map((actual) => (
              <Chip
                key={actual.id}
                nombre={actual.nombre}
                seleccionado={etiqueta === actual.nombre}
                alPresionar={() => setEtiqueta(etiqueta === actual.nombre ? '' : actual.nombre)}
              />
            ))}
          </ScrollView>
          <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
        </View>
      }
      ListEmptyComponent={
        datos ? (
          filtrando ? (
            <Vacio icono="search-outline" mensaje="Ninguna pista coincide con la búsqueda." />
          ) : (
            <Vacio
              icono="musical-notes-outline"
              mensaje="Registra las canciones que escuchas al leer y marca qué emociones transmiten."
            >
              <Boton titulo="Agregar pista" icono="add" alPresionar={() => router.push('/pistas/nueva')} />
            </Vacio>
          )
        ) : undefined
      }
      renderItem={({ item }) => (
        <Fila
          titulo={item.nombre}
          detalle={item.artista ?? 'Artista desconocido'}
          pie={
            <View style={[estilos.fila, { marginTop: 4 }]}>
              {item.etiquetas.map((e) => (
                <Chip key={e.id} nombre={e.nombre} />
              ))}
            </View>
          }
          alPresionar={() => router.push(`/pistas/${item.id}`)}
        />
      )}
    />
  );
}

const estilosMusica = StyleSheet.create({
  buscador: {
    backgroundColor: colores.superficie,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colores.linea,
    color: colores.texto,
    fontSize: 16,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
});
