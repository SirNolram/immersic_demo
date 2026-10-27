using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Aplicacion.Dtos;
using Immersic.Api.Dominio;
using Immersic.Api.Infraestructura;
using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Aplicacion.Comandos;

public class CapitulosComandos
{
    private readonly ContextoEscritura _db;

    public CapitulosComandos(ContextoEscritura db)
    {
        _db = db;
    }

    public async Task<Resultado<CapituloDto>> CrearAsync(int libroId, CapituloEntradaDto entrada, CancellationToken cancelacion)
    {
        if (!await _db.Libros.AnyAsync(l => l.Id == libroId, cancelacion))
        {
            return Fallo.NoEncontrado($"No existe un libro con id {libroId}.");
        }

        int numero;
        if (entrada.Numero is int solicitado)
        {
            if (await NumeroOcupadoAsync(libroId, solicitado, null, cancelacion))
            {
                return Fallo.Conflicto($"El libro ya tiene un capítulo con el número {solicitado}.");
            }

            numero = solicitado;
        }
        else
        {
            var ultimo = await _db.Capitulos
                .Where(c => c.LibroId == libroId)
                .MaxAsync(c => (int?)c.Numero, cancelacion);
            numero = (ultimo ?? 0) + 1;
        }

        var nuevo = new Capitulo
        {
            LibroId = libroId,
            Numero = numero,
            Titulo = entrada.Titulo.Trim(),
            Contenido = entrada.Contenido ?? string.Empty,
            CreadoEn = DateTime.UtcNow,
        };

        _db.Capitulos.Add(nuevo);
        await _db.SaveChangesAsync(cancelacion);

        return Mapeos.ACapituloDto(nuevo, 0);
    }

    public async Task<Resultado<CapituloDto>> ActualizarAsync(int id, CapituloEntradaDto entrada, CancellationToken cancelacion)
    {
        var existente = await _db.Capitulos.FirstOrDefaultAsync(c => c.Id == id, cancelacion);
        if (existente is null)
        {
            return Fallo.NoEncontrado($"No existe un capítulo con id {id}.");
        }

        if (entrada.Numero is int numero && numero != existente.Numero)
        {
            if (await NumeroOcupadoAsync(existente.LibroId, numero, id, cancelacion))
            {
                return Fallo.Conflicto($"El libro ya tiene un capítulo con el número {numero}.");
            }

            existente.Numero = numero;
        }

        existente.Titulo = entrada.Titulo.Trim();

        var contenidoCambio = entrada.Contenido is not null && entrada.Contenido != existente.Contenido;
        if (contenidoCambio)
        {
            existente.Contenido = entrada.Contenido!;
        }

        await using (var transaccion = await _db.Database.BeginTransactionAsync(cancelacion))
        {
            if (contenidoCambio)
            {
                await _db.Escenas.Where(e => e.CapituloId == id).ExecuteDeleteAsync(cancelacion);
            }

            await _db.SaveChangesAsync(cancelacion);
            await transaccion.CommitAsync(cancelacion);
        }

        var cantidadEscenas = await _db.Escenas.CountAsync(e => e.CapituloId == id, cancelacion);
        return Mapeos.ACapituloDto(existente, cantidadEscenas);
    }

    public async Task<Resultado<bool>> EliminarAsync(int id, CancellationToken cancelacion)
    {
        var eliminados = await _db.Capitulos.Where(c => c.Id == id).ExecuteDeleteAsync(cancelacion);
        if (eliminados == 0)
        {
            return Fallo.NoEncontrado($"No existe un capítulo con id {id}.");
        }

        return true;
    }

    private Task<bool> NumeroOcupadoAsync(int libroId, int numero, int? excluirId, CancellationToken cancelacion) =>
        _db.Capitulos.AnyAsync(
            c => c.LibroId == libroId && c.Numero == numero && (excluirId == null || c.Id != excluirId),
            cancelacion);
}
