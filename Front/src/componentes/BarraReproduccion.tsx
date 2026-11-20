import { StyleSheet, Text, View } from 'react-native';
import { BotonIcono } from './BotonIcono';
import { BotonReproducir } from './BotonReproducir';
import { useReproduccion } from '@/reproduccion/ContextoReproduccion';
import { colores, fuente } from '@/tema';
import { duracionLegible } from '@/utilidades/texto';

export function BarraReproduccion() {
  const { pistaActual, segundos, duracion, detener } = useReproduccion();

  if (!pistaActual) {
    return null;
  }

  const avance = duracion > 0 ? Math.min(1, segundos / duracion) : 0;

  return (
    <View style={estilosBarra.contenedor}>
      <View style={estilosBarra.fila}>
        <BotonReproducir pista={pistaActual} tamano={44} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={estilosBarra.nombre} numberOfLines={1}>
            {pistaActual.nombre}
          </Text>
          <Text style={estilosBarra.detalle} numberOfLines={1}>
            {duracionLegible(segundos)} de {duracion > 0 ? duracionLegible(duracion) : '--:--'}
            {pistaActual.artista ? `, ${pistaActual.artista}` : ''}
          </Text>
        </View>
        <BotonIcono icono="close" etiqueta="Detener" color={colores.textoSuave} alPresionar={detener} />
      </View>
      <View style={estilosBarra.pista}>
        <View style={[estilosBarra.avance, { width: `${avance * 100}%` }]} />
      </View>
    </View>
  );
}

const estilosBarra = StyleSheet.create({
  contenedor: {
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.linea,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nombre: {
    color: colores.texto,
    fontFamily: fuente,
    fontSize: 15,
    fontWeight: '600',
  },
  detalle: {
    color: colores.textoSuave,
    fontFamily: fuente,
    fontSize: 13,
  },
  pista: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colores.linea,
    overflow: 'hidden',
  },
  avance: {
    height: 3,
    backgroundColor: colores.texto,
  },
});
