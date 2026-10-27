using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Aplicacion.Dtos;
using Immersic.Api.Dominio;
using Immersic.Api.Infraestructura;
using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Aplicacion.Consultas;

public class EscenasConsultas
{
    private const int LimiteRecomendacionesPorDefecto = 5;
    private const int LimiteRecomendacionesMaximo = 50;

    private readonly ContextoLectura _db;

    public EscenasConsultas(ContextoLectura db)
    {
        _db = db;
    }

    public async Task<Resultado<List<EscenaDto>>> ListarPorCapituloAsync(int capituloId, CancellationToken cancelacion)
    {
        var contenido = await ObtenerContenidoAsync(capituloId, cancelacion);
        if (contenido is null)
        {
            return Fallo.NoEncontrado($"No existe un capítulo con id {capituloId}.");
        }

        var escenas = await CargarEscenasAsync(capituloId, cancelacion);
        return Mapeos.AEscenasDto(escenas, contenido.Length);
    }

    public async Task<Resultado<List<RecomendacionDto>>> RecomendarAsync(int escenaId, int? limite, CancellationToken cancelacion)
    {
        var escena = await _db.Escenas
            .Include(e => e.Etiquetas)
            .ThenInclude(ee => ee.Etiqueta)
            .FirstOrDefaultAsync(e => e.Id == escenaId, cancelacion);
        if (escena is null)
        {
            return Fallo.NoEncontrado($"No existe una escena con id {escenaId}.");
        }

        var etiquetasEscena = escena.Etiquetas
            .Select(ee => ee.Etiqueta?.Nombre)
            .OfType<string>()
            .ToList();

        var pistas = await CargarPistasAsync(cancelacion);
        var cantidad = Math.Clamp(limite ?? LimiteRecomendacionesPorDefecto, 1, LimiteRecomendacionesMaximo);
        return Recomendador.Recomendar(etiquetasEscena, pistas, cantidad);
    }

    public async Task<Resultado<PlanInmersionDto>> ObtenerPlanAsync(int capituloId, CancellationToken cancelacion)
    {
        var capitulo = await _db.Capitulos.FirstOrDefaultAsync(c => c.Id == capituloId, cancelacion);
        if (capitulo is null)
        {
            return Fallo.NoEncontrado($"No existe un capítulo con id {capituloId}.");
        }

        var escenas = await CargarEscenasAsync(capituloId, cancelacion);
        var pistas = await CargarPistasAsync(cancelacion);

        var plan = Mapeos.AEscenasDto(escenas, capitulo.Contenido.Length)
            .Select(escena =>
            {
                var nombres = escena.Etiquetas.Select(etiqueta => etiqueta.Nombre).ToList();
                var mejor = Recomendador.Recomendar(nombres, pistas, 1).FirstOrDefault();
                return new EscenaPlanDto(
                    escena.Id,
                    escena.Orden,
                    escena.PosicionInicio,
                    escena.PosicionFin,
                    escena.FragmentoInicio,
                    escena.Etiquetas,
                    mejor?.Pista,
                    mejor?.Afinidad ?? 0);
            })
            .ToList();

        return new PlanInmersionDto(capitulo.Id, capitulo.Titulo, plan);
    }

    private Task<string?> ObtenerContenidoAsync(int capituloId, CancellationToken cancelacion) =>
        _db.Capitulos
            .Where(c => c.Id == capituloId)
            .Select(c => c.Contenido)
            .FirstOrDefaultAsync(cancelacion);

    private Task<List<Escena>> CargarEscenasAsync(int capituloId, CancellationToken cancelacion) =>
        _db.Escenas
            .Where(e => e.CapituloId == capituloId)
            .Include(e => e.Etiquetas)
            .ThenInclude(ee => ee.Etiqueta)
            .OrderBy(e => e.PosicionInicio)
            .ToListAsync(cancelacion);

    private Task<List<Pista>> CargarPistasAsync(CancellationToken cancelacion) =>
        _db.Pistas
            .Include(p => p.Etiquetas)
            .ThenInclude(pe => pe.Etiqueta)
            .ToListAsync(cancelacion);
}
