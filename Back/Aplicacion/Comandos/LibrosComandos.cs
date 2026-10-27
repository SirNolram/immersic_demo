using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Aplicacion.Dtos;
using Immersic.Api.Dominio;
using Immersic.Api.Infraestructura;
using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Aplicacion.Comandos;

public class LibrosComandos
{
    private readonly ContextoEscritura _db;

    public LibrosComandos(ContextoEscritura db)
    {
        _db = db;
    }

    public async Task<Resultado<LibroDto>> CrearAsync(LibroEntradaDto entrada, CancellationToken cancelacion)
    {
        var nuevo = new Libro
        {
            Titulo = entrada.Titulo.Trim(),
            Autor = Texto.Limpiar(entrada.Autor),
            CreadoEn = DateTime.UtcNow,
        };

        _db.Libros.Add(nuevo);
        await _db.SaveChangesAsync(cancelacion);

        return Mapeos.ALibroDto(nuevo, 0);
    }

    public async Task<Resultado<LibroDto>> ActualizarAsync(int id, LibroEntradaDto entrada, CancellationToken cancelacion)
    {
        var existente = await _db.Libros.FirstOrDefaultAsync(l => l.Id == id, cancelacion);
        if (existente is null)
        {
            return Fallo.NoEncontrado($"No existe un libro con id {id}.");
        }

        existente.Titulo = entrada.Titulo.Trim();
        existente.Autor = Texto.Limpiar(entrada.Autor);
        await _db.SaveChangesAsync(cancelacion);

        var cantidadCapitulos = await _db.Capitulos.CountAsync(c => c.LibroId == id, cancelacion);
        return Mapeos.ALibroDto(existente, cantidadCapitulos);
    }

    public async Task<Resultado<bool>> EliminarAsync(int id, CancellationToken cancelacion)
    {
        var eliminados = await _db.Libros.Where(l => l.Id == id).ExecuteDeleteAsync(cancelacion);
        if (eliminados == 0)
        {
            return Fallo.NoEncontrado($"No existe un libro con id {id}.");
        }

        return true;
    }
}
