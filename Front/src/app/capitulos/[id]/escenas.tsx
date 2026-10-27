import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { consultasCapitulos } from '@/api/capitulos';
import { comandosEscenas } from '@/api/escenas';
import { consultasEtiquetas } from '@/api/etiquetas';
import { Boton } from '@/componentes/Boton';
import { BotonIcono } from '@/componentes/BotonIcono';
import { Chip } from '@/componentes/Chip';
import { EstadoCarga } from '@/componentes/EstadoCarga';
import { SelectorEtiquetas } from '@/componentes/SelectorEtiquetas';
import { useAccion } from '@/hooks/useAccion';
import { useCarga } from '@/hooks/useCarga';
import { useGenerarEscenas } from '@/hooks/useGenerarEscenas';
import { colorDeEscena, colores, estilos, fuenteLectura } from '@/tema';
import type { Escena } from '@/tipos/modelos';
import { confirmar } from '@/utilidades/dialogos';
import { dividirEnLineas } from '@/utilidades/texto';

export default function EscenasCapitulo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const capituloId = Number(id);
  const [posicion, setPosicion] = useState<number | null>(null);
  const [etiquetaIds, setEtiquetaIds] = useState<number[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [etiquetasEdicion, setEtiquetasEdicion] = useState<number[]>([]);
  const accion = useAccion();

  const cargar = useCallback(async () => {
    const [capitulo, escenas, etiquetas] = await Promise.all([
      consultasCapitulos.obtener(capituloId),
      consultasCapitulos.escenas(capituloId),
      consultasEtiquetas.listar(),
    ]);
    return { capitulo, escenas, etiquetas };
  }, [capituloId]);

  const { datos, error, cargando, recargar } = useCarga(cargar);
  const generacion = useGenerarEscenas(capituloId, recargar);
  const lineas = useMemo(() => dividirEnLineas(datos?.capitulo.contenido ?? ''), [datos]);
  const inicios = useMemo(() => new Set((datos?.escenas ?? []).map((e) => e.posicionInicio)), [datos]);
  const ocupado = accion.ocupado || generacion.generando;

  const empezarEdicion = (escena: Escena) => {
    setEditando(escena.id);
    setEtiquetasEdicion(escena.etiquetas.map((e) => e.id));
  };

  const guardarEdicion = () =>
    accion.ejecutar(async () => {
      if (editando === null) {
        return;
      }
      await comandosEscenas.actualizarEtiquetas(editando, etiquetasEdicion);
      setEditando(null);
      await recargar();
    });

  const crear = () =>
    accion.ejecutar(async () => {
      if (posicion === null) {
        return;
      }
      await comandosEscenas.crear(capituloId, { posicionInicio: posicion, etiquetaIds });
      setPosicion(null);
      setEtiquetaIds([]);
      await recargar();
    });

  const eliminar = (escenaId: number) =>
    accion.ejecutar(async () => {
      if (await confirmar('Eliminar escena', 'El texto de esta escena pasará a la escena anterior.', 'Eliminar')) {
        await comandosEscenas.eliminar(escenaId);
        await recargar();
      }
    });

  const eliminarTodas = () =>
    accion.ejecutar(async () => {
      if (await confirmar('Borrar todas las escenas', 'El capítulo quedará sin escenas.', 'Borrar')) {
        await comandosEscenas.eliminarTodas(capituloId);
        await recargar();
      }
    });

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={estilos.contenido}>
      <Stack.Screen options={{ title: 'Escenas' }} />
      <EstadoCarga cargando={cargando && !datos} error={error} alReintentar={recargar} />
      {datos ? (
        <>
          <View style={estilosEscenas.panel}>
            <Text style={estilos.texto}>
              Gemini lee el capítulo, lo divide en escenas y elige hasta tres emociones para cada una.
            </Text>
            <Boton
              titulo={datos.escenas.length > 0 ? 'Volver a generar con IA' : 'Generar escenas con IA'}
              icono="sparkles-outline"
              cargando={generacion.generando}
              deshabilitado={accion.ocupado || datos.capitulo.contenido.trim() === ''}
              alPresionar={() => void generacion.generar(datos.escenas.length)}
            />
            {generacion.generando ? (
              <Text style={estilos.textoSuave}>Gemini está leyendo el capítulo. Puede tardar un par de minutos.</Text>
            ) : null}
            {generacion.error ? <Text style={estilos.error}>{generacion.error}</Text> : null}
          </View>

          {accion.error ? <Text style={estilos.error}>{accion.error}</Text> : null}

          <Text style={estilos.seccion}>Escenas del capítulo</Text>
          {datos.escenas.length === 0 ? (
            <Text style={estilos.textoSuave}>Todavía no hay escenas. Genéralas con IA o márcalas abajo.</Text>
          ) : null}
          {datos.escenas.map((escena) => (
            <View
              key={escena.id}
              style={[estilosEscenas.escena, { borderLeftColor: colorDeEscena(escena.etiquetas) }]}
            >
              <View style={estilosEscenas.cabecera}>
                <Text style={estilos.textoSuave}>Escena {escena.orden}</Text>
                <View style={estilos.fila}>
                  <BotonIcono
                    icono="pricetags-outline"
                    etiqueta="Cambiar emociones"
                    deshabilitado={ocupado}
                    alPresionar={() => (editando === escena.id ? setEditando(null) : empezarEdicion(escena))}
                  />
                  <BotonIcono
                    icono="trash-outline"
                    etiqueta="Eliminar escena"
                    color={colores.peligro}
                    deshabilitado={ocupado}
                    alPresionar={() => eliminar(escena.id)}
                  />
                </View>
              </View>
              <Text style={estilosEscenas.fragmento}>{escena.fragmentoInicio}</Text>
              {editando === escena.id ? (
                <View style={{ gap: 12 }}>
                  <SelectorEtiquetas
                    etiquetas={datos.etiquetas}
                    seleccionadas={etiquetasEdicion}
                    alCambiar={setEtiquetasEdicion}
                  />
                  <View style={estilos.fila}>
                    <Boton
                      titulo="Guardar emociones"
                      cargando={accion.ocupado}
                      deshabilitado={etiquetasEdicion.length === 0}
                      alPresionar={guardarEdicion}
                    />
                    <Boton titulo="Cancelar" variante="secundario" alPresionar={() => setEditando(null)} />
                  </View>
                </View>
              ) : (
                <View style={estilos.fila}>
                  {escena.etiquetas.map((etiqueta) => (
                    <Chip key={etiqueta.id} nombre={etiqueta.nombre} />
                  ))}
                </View>
              )}
            </View>
          ))}
          {datos.escenas.length > 1 ? (
            <Boton
              titulo="Borrar todas las escenas"
              variante="peligro"
              icono="trash-outline"
              deshabilitado={ocupado}
              alPresionar={eliminarTodas}
            />
          ) : null}

          <View style={estilos.separador} />

          <Text style={estilos.seccion}>Marcar una escena a mano</Text>
          <Text style={estilos.textoSuave}>
            Toca el párrafo donde empieza la escena. Los marcados con una barra ya inician una escena.
          </Text>
          <View style={{ gap: 2 }}>
            {lineas.map((linea) => {
              const ocupada = inicios.has(linea.inicio);
              const elegida = posicion === linea.inicio;
              return (
                <Pressable
                  key={linea.inicio}
                  disabled={ocupada}
                  onPress={() => setPosicion(elegida ? null : linea.inicio)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: elegida, disabled: ocupada }}
                  style={[
                    estilosEscenas.linea,
                    ocupada && estilosEscenas.lineaOcupada,
                    elegida && estilosEscenas.lineaElegida,
                  ]}
                >
                  <Text
                    numberOfLines={2}
                    style={[estilosEscenas.textoLinea, ocupada && { color: colores.textoSuave }]}
                  >
                    {linea.texto}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <SelectorEtiquetas etiquetas={datos.etiquetas} seleccionadas={etiquetaIds} alCambiar={setEtiquetaIds} />
          <Boton
            titulo="Crear escena"
            icono="add"
            cargando={accion.ocupado}
            deshabilitado={generacion.generando || posicion === null || etiquetaIds.length === 0}
            alPresionar={crear}
          />
        </>
      ) : null}
    </ScrollView>
  );
}

const estilosEscenas = StyleSheet.create({
  panel: {
    gap: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.linea,
  },
  escena: {
    gap: 8,
    paddingLeft: 14,
    paddingVertical: 4,
    borderLeftWidth: 3,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fragmento: {
    color: colores.texto,
    fontFamily: fuenteLectura,
    fontSize: 16,
    lineHeight: 24,
  },
  linea: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  lineaOcupada: {
    borderLeftColor: colores.linea,
  },
  lineaElegida: {
    backgroundColor: colores.superficieAlta,
    borderLeftColor: colores.texto,
  },
  textoLinea: {
    color: colores.texto,
    fontFamily: fuenteLectura,
    fontSize: 15,
    lineHeight: 22,
  },
});
