import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { consultasLibros } from '@/api/libros';
import { Boton } from '@/componentes/Boton';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { Fila } from '@/componentes/Fila';
import { Vacio } from '@/componentes/Vacio';
import { useCarga } from '@/hooks/useCarga';
import { colores, estilos, fuenteLectura } from '@/tema';
import { contar } from '@/utilidades/texto';

export default function Biblioteca() {
  const router = useRouter();
  const { datos, error, cargando, recargar } = useCarga(() => consultasLibros.listar());

  return (
    <FlatList
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={estilos.lista}
      data={datos ?? []}
      keyExtractor={(libro) => String(libro.id)}
      ListHeaderComponent={<EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />}
      ListEmptyComponent={
        datos ? (
          <Vacio
            icono="library-outline"
            mensaje="Tu biblioteca está vacía. Agrega un libro para empezar a leer con música."
          >
            <Boton titulo="Agregar libro" icono="add" alPresionar={() => router.push('/libros/nuevo')} />
          </Vacio>
        ) : undefined
      }
      renderItem={({ item }) => (
        <Fila
          serif
          titulo={item.titulo}
          detalle={item.autor ?? 'Autor desconocido'}
          pie={<Text style={estilos.textoSuave}>{contar(item.cantidadCapitulos, 'capítulo', 'capítulos')}</Text>}
          inicio={
            <View style={estilosBiblioteca.portada}>
              <Text style={estilosBiblioteca.inicial}>{item.titulo.charAt(0).toUpperCase()}</Text>
            </View>
          }
          alPresionar={() => router.push(`/libros/${item.id}`)}
        />
      )}
    />
  );
}

const estilosBiblioteca = StyleSheet.create({
  portada: {
    width: 44,
    height: 60,
    borderRadius: 4,
    backgroundColor: colores.superficieAlta,
    borderLeftWidth: 4,
    borderLeftColor: colores.linea,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: {
    color: colores.texto,
    fontFamily: fuenteLectura,
    fontSize: 22,
  },
});
