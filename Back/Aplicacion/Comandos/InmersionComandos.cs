using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Aplicacion.Dtos;
using Immersic.Api.Dominio;
using Immersic.Api.Infraestructura;
using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Aplicacion.Comandos;

public class InmersionComandos
{
    public const string EncabezadoClave = "X-Gemini-Api-Key";

    private readonly ContextoEscritura _db;
    private readonly IAnalizadorEscenas _analizador;

    public InmersionComandos(ContextoEscritura db, IAnalizadorEscenas analizador)
    {
        _db = db;
        _analizador = analizador;
    }

    public async Task<Resultado<InmersionGeneradaDto>> GenerarAsync(int capituloId, string? claveApi, CancellationToken cancelacion)
    {
        var clave = claveApi?.Trim() ?? string.Empty;
        if (clave.Length == 0)
        {
            return Fallo.Invalido(EncabezadoClave, $"Envía tu API key de Gemini en el encabezado {EncabezadoClave}.");
        }

        if (clave.Any(caracter => caracter <= ' ' || caracter > '~'))
        {
            return Fallo.Invalido(EncabezadoClave, "La API key de Gemini tiene caracteres no válidos.");
        }

        var capitulo = await _db.Capitulos.FirstOrDefaultAsync(c => c.Id == capituloId, cancelacion);
        if (capitulo is null)
        {
            return Fallo.NoEncontrado($"No existe un capítulo con id {capituloId}.");
        }

        if (string.IsNullOrWhiteSpace(capitulo.Contenido))
        {
            return Fallo.Invalido(nameof(Capitulo.Contenido), "El capítulo no tiene texto para analizar.");
        }

        var catalogo = await _db.Etiquetas.OrderBy(e => e.Id).ToListAsync(cancelacion);
        if (catalogo.Count == 0)
        {
            return Fallo.Conflicto("No hay etiquetas registradas para clasificar las escenas.");
        }

        var analisis = await _analizador.ProponerEscenasAsync(capitulo.Contenido, catalogo, clave, cancelacion);
        if (analisis.Fallo is not null)
        {
            return analisis.Fallo;
        }

        var porNombre = catalogo.ToDictionary(e => e.Nombre, StringComparer.OrdinalIgnoreCase);
        var permitidas = porNombre.Keys.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var ubicadas = UbicadorEscenas.Ubicar(capitulo.Contenido, analisis.Valor!, permitidas);
        if (ubicadas.Count == 0)
        {
            return Fallo.Externo(
                StatusCodes.Status502BadGateway,
                "Sin escenas",
                "Gemini no devolvió escenas que se pudieran ubicar en el texto. Intenta de nuevo.");
        }

        var nuevas = ubicadas
            .Select((ubicada, indice) => new Escena
            {
                CapituloId = capituloId,
                Orden = indice + 1,
                PosicionInicio = ubicada.PosicionInicio,
                FragmentoInicio = Texto.ExtraerFragmento(capitulo.Contenido, ubicada.PosicionInicio),
                Etiquetas = ubicada.Etiquetas
                    .Select(nombre => new EscenaEtiqueta { EtiquetaId = porNombre[nombre].Id })
                    .ToList(),
            })
            .ToList();

        await using (var transaccion = await _db.Database.BeginTransactionAsync(cancelacion))
        {
            await _db.Escenas.Where(e => e.CapituloId == capituloId).ExecuteDeleteAsync(cancelacion);
            _db.Escenas.AddRange(nuevas);
            capitulo.ProcesadoIa = true;
            await _db.SaveChangesAsync(cancelacion);
            await transaccion.CommitAsync(cancelacion);
        }

        var escenas = Mapeos.AEscenasDto(nuevas, capitulo.Contenido.Length, catalogo.ToDictionary(e => e.Id));
        return new InmersionGeneradaDto(capituloId, _analizador.Modelo, escenas.Count, escenas);
    }
}
