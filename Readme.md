# Immersic

Aplicación móvil de lectura con música. El usuario organiza sus libros por capítulos y cada capítulo se divide en escenas con etiquetas de emoción (calma, misterio, terror…). Las escenas las puede proponer Gemini con la API key del propio usuario o se pueden marcar a mano. Con esas emociones, la aplicación indica qué pista de su música corresponde a cada escena.

## Estructura

```text
Front/      Aplicación móvil (Expo + React Native + TypeScript)
Back/       API REST (.NET 8, Entity Framework Core)
BD/         Script DDL de la base de datos (SQLite)
Readme.md
```

## Tecnologías

| Parte | Tecnología |
| --- | --- |
| Frontend | Expo SDK 58, React Native, TypeScript, Expo Router |
| Backend | .NET 8 (ASP.NET Core Web API), Entity Framework Core, Swagger |
| Base de datos | SQLite |
| Inteligencia artificial | Gemini (API REST `generateContent`), con la API key de cada usuario |
| Formato | JSON |

## Requisitos

- [.NET SDK 8](https://dotnet.microsoft.com/download) o superior.
- [Node.js](https://nodejs.org) 22.13 o superior (también sirve la 24).
- Para el celular: la app **Expo Go** y estar en la misma red Wi-Fi que el computador.

## Cómo ejecutar

### 1. Backend

```bash
cd Back
dotnet run
```

La API queda escuchando en el puerto **5080** de todas las interfaces de red, para que el celular pueda conectarse. La documentación está en **http://localhost:5080/swagger**.

La primera vez se crea el archivo `Back/immersic.db` a partir de `BD/schema.sql`. En Windows puede aparecer un aviso del firewall: hay que permitir el acceso en redes privadas.

### 2. Frontend

En otra terminal:

```bash
cd Front
npm install
npx expo start
```

- **Celular:** escanea el código QR con Expo Go (Android) o con la cámara (iPhone).
- **Navegador:** presiona `w`.
- **Emulador Android:** presiona `a`.

La app detecta sola la dirección del computador y se conecta a `http://<IP-del-computador>:5080`. Si no logra conectarse, la dirección se puede cambiar en la pestaña **Ajustes** con el botón **Guardar y probar**.

### 3. API key de Gemini (opcional)

Para que Gemini divida los capítulos en escenas:

1. Crea una API key gratuita en [Google AI Studio](https://aistudio.google.com/apikey).
2. En la app, abre **Ajustes**, pégala en **API key de Gemini** y presiona **Guardar llave**.
3. Abre un capítulo y presiona **Generar escenas con IA**.

La llave se guarda solo en el dispositivo (en el almacenamiento seguro del celular o en el navegador) y viaja en el encabezado `X-Gemini-Api-Key` de cada solicitud. La API la usa para llamar a Gemini y no la guarda en la base de datos ni en los registros. Sin llave, las escenas se pueden marcar a mano.

## La aplicación

| Pantalla | Qué permite |
| --- | --- |
| Biblioteca | Ver, agregar y abrir libros |
| Libro | Ver sus capítulos, agregar uno nuevo y editar o eliminar el libro |
| Capítulo | Leer el capítulo por escenas, con sus emociones y la pista recomendada para cada una; generar las escenas con IA |
| Escenas | Generar o volver a generar con IA, cambiar las emociones de una escena, eliminarla o marcar una nueva tocando el párrafo donde empieza |
| Música | Buscar pistas por nombre o artista y filtrarlas por emoción; agregar, editar y eliminar pistas. Las pistas son referencias (nombre, artista y enlace), la app no reproduce audio |
| Ajustes | Dirección del servidor, API key de Gemini y administración de las etiquetas de emoción |

## Arquitectura del frontend

```text
Front/src/
  app/              Pantallas (Expo Router: cada archivo es una ruta)
  api/              Llamadas a la API, separadas en consultas y comandos
  componentes/      Botones, campos, filas, chips de emoción y formularios
  configuracion/    Dirección del servidor y API key de Gemini guardadas en el dispositivo
  hooks/            Carga de datos, acciones con estado de espera y generación de escenas
  tipos/            Modelos que devuelve la API
  utilidades/       Diálogos, almacenamiento seguro y manejo de texto
  tema.ts           Colores, tipografía y estilos compartidos
```

## Arquitectura del backend

La API separa las operaciones de lectura y de escritura:

- **Consultas** (`Back/Aplicacion/Consultas`, `Back/Controladores/Consultas`): atienden los `GET`. Usan `ContextoLectura`, que abre la base de datos en modo de solo lectura y sin seguimiento de cambios.
- **Comandos** (`Back/Aplicacion/Comandos`, `Back/Controladores/Comandos`): atienden los `POST`, `PUT` y `DELETE`. Usan `ContextoEscritura`.

Cada lado tiene su propia cadena de conexión (`ConnectionStrings:Lectura` y `ConnectionStrings:Escritura` en `Back/appsettings.json`), así que las lecturas podrían apuntar a una réplica sin tocar el código.

La generación de escenas es un comando más (`InmersionComandos`). La capa de aplicación solo conoce la interfaz `IAnalizadorEscenas`; la implementación que habla con Gemini (`ClienteGemini`) está en la infraestructura. Gemini devuelve, para cada escena, las primeras palabras con las que empieza y sus etiquetas; `UbicadorEscenas` busca esas palabras en el texto del capítulo (sin distinguir mayúsculas, tildes ni tipos de comillas) para obtener la posición exacta donde empieza cada escena.

```text
Back/
  Dominio/            Entidades (una por tabla)
  Infraestructura/    Contextos de lectura y escritura, conexión e inicialización de la base de datos
    Gemini/           Cliente HTTP de Gemini, instrucciones y esquema de respuesta
  Aplicacion/
    Comun/            Resultado de las operaciones, reglas de etiquetas, recomendador de música y ubicador de escenas
    Dtos/             Datos de entrada y salida
    Consultas/        Lecturas
    Comandos/         Escrituras
  Controladores/
    Consultas/        Endpoints GET
    Comandos/         Endpoints POST, PUT y DELETE
```

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/salud` | Estado de la API y de las conexiones de lectura y escritura |
| GET | `/api/libros?buscar=` | Lista los libros |
| GET | `/api/libros/{id}` | Obtiene un libro |
| POST | `/api/libros` | Crea un libro |
| PUT | `/api/libros/{id}` | Actualiza un libro |
| DELETE | `/api/libros/{id}` | Elimina un libro con sus capítulos |
| GET | `/api/libros/{libroId}/capitulos` | Lista los capítulos de un libro |
| POST | `/api/libros/{libroId}/capitulos` | Crea un capítulo |
| GET | `/api/capitulos/{id}` | Obtiene un capítulo con su texto |
| PUT | `/api/capitulos/{id}` | Actualiza un capítulo (si cambia el texto, borra sus escenas) |
| DELETE | `/api/capitulos/{id}` | Elimina un capítulo |
| GET | `/api/capitulos/{capituloId}/escenas` | Lista las escenas de un capítulo |
| POST | `/api/capitulos/{capituloId}/escenas` | Crea una escena |
| DELETE | `/api/capitulos/{capituloId}/escenas` | Elimina todas las escenas de un capítulo |
| PUT | `/api/escenas/{id}` | Cambia las etiquetas de una escena |
| DELETE | `/api/escenas/{id}` | Elimina una escena |
| GET | `/api/escenas/{id}/recomendaciones?limite=` | Pistas recomendadas para una escena |
| GET | `/api/capitulos/{id}/inmersion` | Cada escena del capítulo con la pista que le corresponde |
| POST | `/api/capitulos/{id}/inmersion` | Genera las escenas con Gemini y reemplaza las actuales. Requiere el encabezado `X-Gemini-Api-Key` |
| GET | `/api/etiquetas` | Lista las etiquetas |
| GET | `/api/etiquetas/{id}` | Obtiene una etiqueta |
| POST | `/api/etiquetas` | Crea una etiqueta |
| PUT | `/api/etiquetas/{id}` | Actualiza una etiqueta |
| DELETE | `/api/etiquetas/{id}` | Elimina una etiqueta que no esté en uso |
| GET | `/api/pistas?buscar=&etiqueta=` | Lista las pistas |
| GET | `/api/pistas/{id}` | Obtiene una pista |
| POST | `/api/pistas` | Registra una pista con 1 a 3 etiquetas |
| PUT | `/api/pistas/{id}` | Actualiza una pista |
| DELETE | `/api/pistas/{id}` | Elimina una pista |

Los errores se devuelven en formato *Problem Details*: `400` para datos inválidos, `404` si el recurso no existe y `409` para conflictos (por ejemplo, un número de capítulo repetido o una etiqueta en uso). Al generar escenas, los errores de Gemini se traducen así: `401` API key inválida, `403` API key sin permiso, `422` contenido bloqueado, `429` cuota agotada, `502` Gemini no respondió algo utilizable y `504` tiempo de espera agotado.

### Configuración de Gemini

En `Back/appsettings.json`, sección `Gemini`:

| Clave | Valor por defecto | Descripción |
| --- | --- | --- |
| `Modelo` | `gemini-3.5-flash` | Modelo que se usa para analizar los capítulos |
| `UrlBase` | `https://generativelanguage.googleapis.com/v1beta` | Dirección de la API de Gemini |
| `TiempoEsperaSegundos` | `150` | Tiempo máximo de espera por capítulo |

## Base de datos

El script `BD/schema.sql` crea las 7 tablas y carga 12 etiquetas iniciales. La API lo ejecuta al iniciar; también se puede ejecutar a mano:

```bash
sqlite3 immersic.db < BD/schema.sql
```

| Tabla | Descripción |
| --- | --- |
| `libros` | Libros de la biblioteca |
| `capitulos` | Capítulos de cada libro (hasta 60.000 caracteres) y si sus escenas las generó la IA (`procesado_ia`) |
| `escenas` | Escenas de cada capítulo, marcadas por la posición donde empiezan |
| `etiquetas` | Emociones: suspenso, accion, calma, misterio, perdida, romance, terror, epico, feliz, triste, combate e intenso |
| `pistas` | Pistas de música |
| `escena_etiquetas` | De 1 a 3 etiquetas por escena |
| `pista_etiquetas` | De 1 a 3 etiquetas por pista |

## Reglas

- Cada escena y cada pista tiene de 1 a 3 etiquetas. `intenso` solo refuerza a otra etiqueta y no puede ir sola.
- La pista recomendada para una escena es la que comparte más etiquetas con ella. Tiene que compartir al menos una distinta de `intenso`.
- Si cambia el texto de un capítulo, se borran sus escenas, porque sus posiciones dejan de coincidir.
- Generar escenas con IA reemplaza las escenas del capítulo. Si Gemini falla, las escenas anteriores no se tocan.
- Las escenas generadas se pueden corregir a mano: cambiar sus emociones, eliminarlas o agregar otras.
