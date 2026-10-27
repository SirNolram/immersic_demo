using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Aplicacion.Dtos;
using Immersic.Api.Infraestructura;
using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Aplicacion.Consultas;

public class CapitulosConsultas
{
    private readonly ContextoLectura _db;

    public CapitulosConsultas(ContextoLectura db)
    {
        _db = db;
    }

    public async Task<Resultado<List<CapituloResumenDto>>> ListarPorLibroAsync(int libroId, CancellationToken cancelacion)
    {
        if (!await _db.Libros.AnyAsync(l => l.Id == libroId, cancelacion))
        {
            return Fallo.NoEncontrado($"No existe un libro con id {libroId}.");
        }

        var capitulos = await _db.Capitulos
            .Where(c => c.LibroId == libroId)
            .OrderBy(c => c.Numero)
            .Select(c => new CapituloResumenDto(
                c.Id,
                c.LibroId,
                c.Numero,
                c.Titulo,
                c.Contenido.Length,
                c.Escenas.Count,
                c.CreadoEn))
            .ToListAsync(cancelacion);

        return capitulos;
    }

    public async Task<Resultado<CapituloDto>> ObtenerAsync(int id, CancellationToken cancelacion)
    {
        var encontrado = await _db.Capitulos.FirstOrDefaultAsync(c => c.Id == id, cancelacion);
        if (encontrado is null)
        {
            return Fallo.NoEncontrado($"No existe un capítulo con id {id}.");
        }

        var cantidadEscenas = await _db.Escenas.CountAsync(e => e.CapituloId == id, cancelacion);
        return Mapeos.ACapituloDto(encontrado, cantidadEscenas);
    }
}
