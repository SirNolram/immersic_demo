using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Aplicacion.Dtos;
using Immersic.Api.Infraestructura;
using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Aplicacion.Consultas;

public class PistasConsultas
{
    private readonly ContextoLectura _db;

    public PistasConsultas(ContextoLectura db)
    {
        _db = db;
    }

    public async Task<List<PistaDto>> ListarAsync(string? buscar, string? etiqueta, CancellationToken cancelacion)
    {
        var consulta = _db.Pistas.AsQueryable();

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var patron = $"%{buscar.Trim()}%";
            consulta = consulta.Where(p =>
                EF.Functions.Like(p.Nombre, patron)
                || (p.Artista != null && EF.Functions.Like(p.Artista, patron)));
        }

        if (!string.IsNullOrWhiteSpace(etiqueta))
        {
            var nombreEtiqueta = etiqueta.Trim().ToLowerInvariant();
            consulta = consulta.Where(p => p.Etiquetas.Any(pe => pe.Etiqueta!.Nombre == nombreEtiqueta));
        }

        var pistas = await consulta
            .Include(p => p.Etiquetas)
            .ThenInclude(pe => pe.Etiqueta)
            .OrderBy(p => p.Nombre)
            .ThenBy(p => p.Id)
            .ToListAsync(cancelacion);

        return pistas.Select(p => Mapeos.APistaDto(p)).ToList();
    }

    public async Task<Resultado<PistaDto>> ObtenerAsync(int id, CancellationToken cancelacion)
    {
        var encontrada = await _db.Pistas
            .Include(p => p.Etiquetas)
            .ThenInclude(pe => pe.Etiqueta)
            .FirstOrDefaultAsync(p => p.Id == id, cancelacion);

        if (encontrada is null)
        {
            return Fallo.NoEncontrado($"No existe una pista con id {id}.");
        }

        return Mapeos.APistaDto(encontrada);
    }
}
