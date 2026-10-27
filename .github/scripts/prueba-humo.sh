#!/usr/bin/env bash
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEMPORAL="$(mktemp -d)"
RESPUESTA="$TEMPORAL/respuesta.json"
API="http://127.0.0.1:5080"
PROCESO=""

terminar() {
  if [ -n "$PROCESO" ]; then
    kill "$PROCESO" 2>/dev/null || true
  fi
}
trap terminar EXIT

(
  cd "$RAIZ/Back"
  export ConnectionStrings__Escritura="Data Source=$TEMPORAL/prueba.db"
  export ConnectionStrings__Lectura="Data Source=$TEMPORAL/prueba.db"
  export ASPNETCORE_URLS="$API"
  exec dotnet bin/Release/net8.0/Immersic.Api.dll
) > "$TEMPORAL/api.log" 2>&1 &
PROCESO=$!

fallar() {
  echo "::error title=Prueba de punta a punta::$1"
  echo "--- respuesta"
  cat "$RESPUESTA" 2>/dev/null || true
  echo
  echo "--- api.log"
  tail -n 60 "$TEMPORAL/api.log"
  exit 1
}

for _ in $(seq 1 60); do
  if curl -fs "$API/api/salud" > /dev/null 2>&1; then
    break
  fi
  sleep 1
done
curl -fs "$API/api/salud" > /dev/null 2>&1 || fallar "La API no respondió"

pedir() {
  local metodo="$1" ruta="$2" esperado="$3" cuerpo="${4:-}"
  local argumentos=(-s -o "$RESPUESTA" -w "%{http_code}" -X "$metodo" "$API$ruta")
  if [ -n "$cuerpo" ]; then
    argumentos+=(-H "Content-Type: application/json" --data-binary "$cuerpo")
  fi
  local codigo
  codigo="$(curl "${argumentos[@]}")"
  if [ "$codigo" != "$esperado" ]; then
    fallar "$metodo $ruta respondió $codigo y se esperaba $esperado"
  fi
  echo "ok     $metodo $ruta -> $codigo"
}

campo() {
  jq -r "$1" "$RESPUESTA"
}

comprobar() {
  if [ "$(jq -r "$2" "$RESPUESTA")" != "true" ]; then
    fallar "$1"
  fi
  echo "ok     $1"
}

echo "== Salud y CORS"
pedir GET /api/salud 200
comprobar "lectura y escritura conectadas" '.lectura == "conectada" and .escritura == "conectada"'
CORS="$(curl -s -o /dev/null -D - -X OPTIONS "$API/api/libros" -H "Origin: http://localhost:8081" -H "Access-Control-Request-Method: POST" | tr -d '\r' | grep -i '^access-control-allow-origin:' || true)"
[ -n "$CORS" ] || fallar "CORS no permite el origen de Expo"
echo "ok     CORS: $CORS"

echo "== Etiquetas"
pedir GET /api/etiquetas 200
comprobar "12 etiquetas iniciales" 'length == 12'
CALMA="$(campo '.[] | select(.nombre == "calma") | .id')"
TERROR="$(campo '.[] | select(.nombre == "terror") | .id')"
MISTERIO="$(campo '.[] | select(.nombre == "misterio") | .id')"
FELIZ="$(campo '.[] | select(.nombre == "feliz") | .id')"
INTENSO="$(campo '.[] | select(.nombre == "intenso") | .id')"
pedir POST /api/etiquetas 201 '{"nombre":"Nostalgia","descripcion":"Recuerdos del pasado."}'
comprobar "nombre en minúsculas" '.nombre == "nostalgia"'
NOSTALGIA="$(campo .id)"
pedir POST /api/etiquetas 409 '{"nombre":"NOSTALGIA"}'
pedir POST /api/etiquetas 400 '{"nombre":"dos palabras"}'
pedir PUT "/api/etiquetas/$NOSTALGIA" 200 '{"nombre":"nostalgia","descripcion":"Añoranza."}'
pedir GET "/api/etiquetas/$NOSTALGIA" 200
comprobar "etiqueta actualizada" '.descripcion == "Añoranza."'
pedir DELETE "/api/etiquetas/$NOSTALGIA" 204
pedir GET "/api/etiquetas/$NOSTALGIA" 404

echo "== Libros"
pedir POST /api/libros 400 '{"titulo":""}'
pedir POST /api/libros 201 '{"titulo":"El faro de las mareas","autor":"Laura Gómez"}'
LIBRO="$(campo .id)"
pedir GET "/api/libros?buscar=faro" 200
comprobar "búsqueda por título" 'length == 1'
pedir PUT "/api/libros/$LIBRO" 200 '{"titulo":"El faro de las mareas (revisado)","autor":"Laura Gómez"}'
pedir GET "/api/libros/$LIBRO" 200
comprobar "título actualizado" '.titulo == "El faro de las mareas (revisado)"'
pedir GET /api/libros/999999 404

echo "== Capítulos"
CONTENIDO="$(printf '%s\n\n%s\n\n%s' \
  'La mañana llegó despacio sobre el puerto y las gaviotas descansaban en los mástiles.' \
  'Esa noche algo golpeó la puerta del faro y Elena bajó con una vela temblando en la mano.' \
  'Al amanecer todo el pueblo celebró en la plaza con música, risas y pan recién horneado.')"
pedir POST "/api/libros/$LIBRO/capitulos" 201 "$(jq -n --arg c "$CONTENIDO" '{titulo: "La tormenta", contenido: $c}')"
CAPITULO="$(campo .id)"
comprobar "número asignado automáticamente" '.numero == 1'
pedir POST "/api/libros/$LIBRO/capitulos" 409 '{"titulo":"Repetido","numero":1}'
pedir POST "/api/libros/$LIBRO/capitulos" 201 '{"titulo":"Epílogo"}'
EPILOGO="$(campo .id)"
pedir GET "/api/libros/$LIBRO/capitulos" 200
comprobar "dos capítulos" 'length == 2'

echo "== Pistas"
pedir POST /api/pistas 201 "{\"nombre\":\"Puerto en calma\",\"etiquetaIds\":[$CALMA]}"
PISTA_CALMA="$(campo .id)"
pedir POST /api/pistas 201 "{\"nombre\":\"Sombras del faro\",\"etiquetaIds\":[$TERROR,$INTENSO]}"
PISTA_TERROR="$(campo .id)"
pedir POST /api/pistas 201 "{\"nombre\":\"Fiesta en la plaza\",\"etiquetaIds\":[$FELIZ]}"
pedir POST /api/pistas 400 "{\"nombre\":\"Solo intensa\",\"etiquetaIds\":[$INTENSO]}"
pedir POST /api/pistas 400 "{\"nombre\":\"Cuatro\",\"etiquetaIds\":[$CALMA,$TERROR,$FELIZ,$MISTERIO]}"
pedir GET "/api/pistas?etiqueta=terror" 200
comprobar "filtro por etiqueta" 'length == 1'
pedir PUT "/api/pistas/$PISTA_CALMA" 200 "{\"nombre\":\"Puerto en calma\",\"artista\":\"Orquesta Andina\",\"etiquetaIds\":[$CALMA,$FELIZ]}"
comprobar "etiquetas de la pista actualizadas" '[.etiquetas[].nombre] | sort == ["calma", "feliz"]'

echo "== Escenas"
SEGUNDA="$(jq -n --arg c "$CONTENIDO" '$c | index("Esa noche")')"
TERCERA="$(jq -n --arg c "$CONTENIDO" '$c | index("Al amanecer")')"
pedir POST "/api/capitulos/$CAPITULO/escenas" 201 "{\"posicionInicio\":$TERCERA,\"etiquetaIds\":[$FELIZ]}"
pedir POST "/api/capitulos/$CAPITULO/escenas" 201 "{\"posicionInicio\":0,\"etiquetaIds\":[$CALMA]}"
comprobar "orden según la posición" '.orden == 1'
pedir POST "/api/capitulos/$CAPITULO/escenas" 201 "{\"posicionInicio\":$SEGUNDA,\"etiquetaIds\":[$MISTERIO]}"
ESCENA_MEDIA="$(campo .id)"
comprobar "escena del medio" '.orden == 2'
pedir POST "/api/capitulos/$CAPITULO/escenas" 409 "{\"posicionInicio\":0,\"etiquetaIds\":[$CALMA]}"
pedir POST "/api/capitulos/$CAPITULO/escenas" 400 "{\"posicionInicio\":5000,\"etiquetaIds\":[$CALMA]}"
pedir PUT "/api/escenas/$ESCENA_MEDIA" 200 "{\"etiquetaIds\":[$TERROR,$INTENSO]}"
comprobar "etiquetas de la escena actualizadas" '[.etiquetas[].nombre] | sort == ["intenso", "terror"]'
pedir GET "/api/escenas/$ESCENA_MEDIA/recomendaciones" 200
comprobar "recomienda la pista de terror" '.[0].pista.nombre == "Sombras del faro" and .[0].afinidad == 2'
pedir GET "/api/capitulos/$CAPITULO/inmersion" 200
comprobar "plan con tres escenas" '(.escenas | length) == 3 and .escenas[0].pistaRecomendada.nombre == "Puerto en calma"'
pedir DELETE "/api/escenas/$ESCENA_MEDIA" 204
pedir GET "/api/capitulos/$CAPITULO/escenas" 200
comprobar "orden recalculado al eliminar" '[.[].orden] == [1, 2]'

echo "== Integridad"
pedir DELETE "/api/etiquetas/$CALMA" 409
pedir PUT "/api/capitulos/$CAPITULO" 200 '{"titulo":"La tormenta","contenido":"Texto nuevo del capítulo."}'
comprobar "al cambiar el texto se borran las escenas" '.cantidadEscenas == 0'
pedir DELETE "/api/pistas/$PISTA_TERROR" 204
pedir DELETE "/api/libros/$LIBRO" 204
pedir GET "/api/capitulos/$EPILOGO" 404

echo "== Documentación"
pedir GET /swagger/v1/swagger.json 200
comprobar "Swagger separa consultas y comandos" '[.paths["/api/libros"] | keys[]] | sort == ["get", "post"]'

echo
echo "Prueba de punta a punta completada sin errores."
