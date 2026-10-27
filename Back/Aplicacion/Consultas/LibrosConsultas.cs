using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Aplicacion.Dtos;
using Immersic.Api.Infraestructura;
using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Aplicacion.Consultas;

public class LibrosConsultas
{
    private readonly ContextoLectura _db;

    public LibrosConsultas(ContextoLectura db)
    {
        _db = db;
    }

    public Task<List<LibroDto>> ListarAsync(string? buscar, CancellationToken cancelacion)
    {
        var consulta = _db.Libros.AsQueryable();
        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var patron = $"%{buscar.Trim()}%";
            consulta = consulta.Where(l =>
                EF.Functions.Like(l.Titulo, patron)
                || (l.Autor != null && EF.Functions.Like(l.Autor, patron)));
        }

        return consulta
            .OrderBy(l => l.Titulo)
            .Select(l => new LibroDto(l.Id, l.Titulo, l.Autor, l.CreadoEn, l.Capitulos.Count))
            .ToListAsync(cancelacion);
    }

    public async Task<Resultado<LibroDto>> ObtenerAsync(int id, CancellationToken cancelacion)
    {
        var encontrado = await _db.Libros
            .Where(l => l.Id == id)
            .Select(l => new LibroDto(l.Id, l.Titulo, l.Autor, l.CreadoEn, l.Capitulos.Count))
            .FirstOrDefaultAsync(cancelacion);

        if (encontrado is null)
        {
            return Fallo.NoEncontrado($"No existe un libro con id {id}.");
        }

        return encontrado;
    }
}
