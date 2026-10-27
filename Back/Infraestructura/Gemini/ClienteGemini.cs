using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Dominio;
using Microsoft.Extensions.Options;

namespace Immersic.Api.Infraestructura.Gemini;

public class ClienteGemini : IAnalizadorEscenas
{
    private const string RespuestaInvalida = "Respuesta inválida de Gemini";
    private const string ContenidoBloqueado = "Contenido bloqueado por Gemini";

    private static readonly HashSet<string> RazonesBloqueo = new()
    {
        "SAFETY",
        "RECITATION",
        "BLOCKLIST",
        "PROHIBITED_CONTENT",
        "SPII",
        "IMAGE_SAFETY",
    };

    private readonly HttpClient _http;
    private readonly OpcionesGemini _opciones;

    public ClienteGemini(HttpClient http, IOptions<OpcionesGemini> opciones)
    {
        _http = http;
        _opciones = opciones.Value;
    }

    public string Modelo => _opciones.Modelo;

    public async Task<Resultado<List<EscenaPropuesta>>> ProponerEscenasAsync(
        string texto,
        IReadOnlyList<Etiqueta> etiquetas,
        string claveApi,
        CancellationToken cancelacion)
    {
        var url = $"{_opciones.UrlBase.TrimEnd('/')}/models/{Uri.EscapeDataString(_opciones.Modelo)}:generateContent";
        using var solicitud = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(
                JsonSerializer.Serialize(InstruccionesGemini.CrearCuerpo(texto, etiquetas)),
                Encoding.UTF8,
                "application/json"),
        };
        solicitud.Headers.TryAddWithoutValidation("x-goog-api-key", claveApi);

        HttpResponseMessage respuesta;
        try
        {
            respuesta = await _http.SendAsync(solicitud, cancelacion);
        }
        catch (TaskCanceledException) when (!cancelacion.IsCancellationRequested)
        {
            return Fallo.Externo(StatusCodes.Status504GatewayTimeout, "Tiempo de espera agotado", "Gemini tardó demasiado en responder.");
        }
        catch (HttpRequestException)
        {
            return Fallo.Externo(StatusCodes.Status502BadGateway, "Gemini no disponible", "No se pudo conectar con Gemini.");
        }

        using (respuesta)
        {
            var datos = LeerJson(await respuesta.Content.ReadAsStringAsync(cancelacion));
            return respuesta.IsSuccessStatusCode
                ? LeerEscenas(datos)
                : TraducirError((int)respuesta.StatusCode, datos);
        }
    }

    private Fallo TraducirError(int estado, JsonNode? datos)
    {
        var error = Propiedad(datos, "error");
        var mensaje = Cadena(Propiedad(error, "message")) ?? string.Empty;
        var razones = (Propiedad(error, "details") as JsonArray ?? new JsonArray())
            .Select(detalle => Cadena(Propiedad(detalle, "reason")))
            .ToList();

        if (estado == 400 && (razones.Contains("API_KEY_INVALID") || mensaje.Contains("API key not valid", StringComparison.OrdinalIgnoreCase)))
        {
            return Fallo.Externo(StatusCodes.Status401Unauthorized, "API key de Gemini inválida", "La API key de Gemini no es válida.");
        }

        if (estado is 401 or 403)
        {
            return Fallo.Externo(StatusCodes.Status403Forbidden, "API key de Gemini sin permiso", "La API key de Gemini no tiene permiso para usar este modelo.");
        }

        if (estado == 404)
        {
            return Fallo.Externo(StatusCodes.Status502BadGateway, "Modelo no disponible", $"El modelo \"{_opciones.Modelo}\" no está disponible en Gemini.");
        }

        if (estado == 429)
        {
            return Fallo.Externo(StatusCodes.Status429TooManyRequests, "Cuota de Gemini agotada", "Se agotó la cuota de la API key de Gemini. Intenta más tarde.");
        }

        if (estado is >= 400 and < 500)
        {
            var detalle = mensaje.Length > 0 ? $": {mensaje}" : ".";
            return Fallo.Externo(StatusCodes.Status502BadGateway, "Solicitud rechazada por Gemini", $"Gemini rechazó la solicitud{detalle}");
        }

        return Fallo.Externo(StatusCodes.Status502BadGateway, "Gemini no disponible", "Gemini no está disponible en este momento.");
    }

    private static Resultado<List<EscenaPropuesta>> LeerEscenas(JsonNode? datos)
    {
        var bloqueo = Cadena(Propiedad(Propiedad(datos, "promptFeedback"), "blockReason"));
        if (bloqueo is not null)
        {
            return Fallo.Externo(StatusCodes.Status422UnprocessableEntity, ContenidoBloqueado, $"Gemini bloqueó el capítulo ({bloqueo}).");
        }

        var candidato = (Propiedad(datos, "candidates") as JsonArray)?.FirstOrDefault();
        if (candidato is null)
        {
            return Fallo.Externo(StatusCodes.Status502BadGateway, RespuestaInvalida, "Gemini no devolvió resultados.");
        }

        var razon = Cadena(Propiedad(candidato, "finishReason"));
        if (razon == "MAX_TOKENS")
        {
            return Fallo.Externo(StatusCodes.Status502BadGateway, RespuestaInvalida, "La respuesta de Gemini quedó incompleta.");
        }

        if (razon is not null && RazonesBloqueo.Contains(razon))
        {
            return Fallo.Externo(StatusCodes.Status422UnprocessableEntity, ContenidoBloqueado, $"Gemini bloqueó el capítulo ({razon}).");
        }

        if (razon is not null && razon != "STOP" && razon != "FINISH_REASON_UNSPECIFIED")
        {
            return Fallo.Externo(StatusCodes.Status502BadGateway, RespuestaInvalida, $"Gemini terminó la respuesta de forma inesperada ({razon}).");
        }

        var partes = Propiedad(Propiedad(candidato, "content"), "parts") as JsonArray ?? new JsonArray();
        var texto = string.Concat(partes
            .Where(parte => !EsVerdadero(Propiedad(parte, "thought")))
            .Select(parte => Cadena(Propiedad(parte, "text")))
            .OfType<string>());

        var contenido = LeerJson(texto);
        if (contenido is null)
        {
            return Fallo.Externo(StatusCodes.Status502BadGateway, RespuestaInvalida, "Gemini devolvió un JSON inválido.");
        }

        if (Propiedad(contenido, "escenas") is not JsonArray escenas)
        {
            return Fallo.Externo(StatusCodes.Status502BadGateway, RespuestaInvalida, "La respuesta de Gemini no contiene escenas.");
        }

        var propuestas = new List<EscenaPropuesta>();
        foreach (var escena in escenas)
        {
            var fragmento = Cadena(Propiedad(escena, "fragmento_inicio"));
            if (fragmento is null || Propiedad(escena, "etiquetas") is not JsonArray etiquetas)
            {
                continue;
            }

            propuestas.Add(new EscenaPropuesta(fragmento, etiquetas.Select(Cadena).OfType<string>().ToList()));
        }

        return propuestas;
    }

    private static JsonNode? LeerJson(string texto)
    {
        try
        {
            return JsonNode.Parse(texto);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static JsonNode? Propiedad(JsonNode? nodo, string nombre) =>
        nodo is JsonObject objeto && objeto.TryGetPropertyValue(nombre, out var valor) ? valor : null;

    private static string? Cadena(JsonNode? nodo) =>
        nodo is JsonValue valor && valor.TryGetValue<string>(out var texto) ? texto : null;

    private static bool EsVerdadero(JsonNode? nodo) =>
        nodo is JsonValue valor && valor.TryGetValue<bool>(out var verdadero) && verdadero;
}
