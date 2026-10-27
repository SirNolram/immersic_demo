# Immersic

Aplicación móvil de lectura con música. El usuario organiza sus libros por capítulos, marca las escenas de cada capítulo con etiquetas de emoción (calma, misterio, terror…) y la aplicación le indica qué pista de su música corresponde a cada escena.

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

La app detecta sola la dirección del computador y se conecta a `http://<IP-del-computador>:5080`. Si no logra conectarse, la dirección se puede cambiar en la pestaña **Configuración** con el botón **Probar conexión**.

## Arquitectura del backend

La API separa las operaciones de lectura y de escritura:

- **Consultas** (`Back/Aplicacion/Consultas`, `Back/Controladores/Consultas`): atienden los `GET`. Usan `ContextoLectura`, que abre la base de datos en modo de solo lectura y sin seguimiento de cambios.
- **Comandos** (`Back/Aplicacion/Comandos`, `Back/Controladores/Comandos`): atienden los `POST`, `PUT` y `DELETE`. Usan `ContextoEscritura`.

Cada lado tiene su propia cadena de conexión (`ConnectionStrings:Lectura` y `ConnectionStrings:Escritura` en `Back/appsettings.json`), así que las lecturas podrían apuntar a una réplica sin tocar el código.

```text
Back/
  Dominio/            Entidades (una por tabla)
  Infraestructura/    Contextos de lectura y escritura, conexión e inicialización de la base de datos
  Aplicacion/
    Comun/            Resultado de las operaciones, reglas de etiquetas y recomendador de música
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

Los errores se devuelven en formato *Problem Details*: `400` para datos inválidos, `404` si el recurso no existe y `409` para conflictos (por ejemplo, un número de capítulo repetido o una etiqueta en uso).

## Base de datos

El script `BD/schema.sql` crea las 7 tablas y carga 12 etiquetas iniciales. La API lo ejecuta al iniciar; también se puede ejecutar a mano:

```bash
sqlite3 immersic.db < BD/schema.sql
```

| Tabla | Descripción |
| --- | --- |
| `libros` | Libros de la biblioteca |
| `capitulos` | Capítulos de cada libro (hasta 60.000 caracteres) |
| `escenas` | Escenas de cada capítulo, marcadas por la posición donde empiezan |
| `etiquetas` | Emociones: suspenso, accion, calma, misterio, perdida, romance, terror, epico, feliz, triste, combate e intenso |
| `pistas` | Pistas de música |
| `escena_etiquetas` | De 1 a 3 etiquetas por escena |
| `pista_etiquetas` | De 1 a 3 etiquetas por pista |

## Reglas

- Cada escena y cada pista tiene de 1 a 3 etiquetas. `intenso` solo refuerza a otra etiqueta y no puede ir sola.
- La pista recomendada para una escena es la que comparte más etiquetas con ella. Tiene que compartir al menos una distinta de `intenso`.
- Si cambia el texto de un capítulo, se borran sus escenas, porque sus posiciones dejan de coincidir.
