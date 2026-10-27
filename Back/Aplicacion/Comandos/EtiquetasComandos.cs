using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Aplicacion.Dtos;
using Immersic.Api.Dominio;
using Immersic.Api.Infraestructura;
using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Aplicacion.Comandos;

public class EtiquetasComandos
{
    private readonly ContextoEscritura _db;

    public EtiquetasComandos(ContextoEscritura db)
    {
        _db = db;
    }

    public async Task<Resultado<EtiquetaDto>> CrearAsync(EtiquetaEntradaDto entrada, CancellationToken cancelacion)
    {
        var nombre = NormalizarNombre(entrada.Nombre);
        if (await _db.Etiquetas.AnyAsync(e => e.Nombre == nombre, cancelacion))
        {
            return Fallo.Conflicto($"Ya existe una etiqueta llamada \"{nombre}\".");
        }

        var nueva = new Etiqueta
        {
            Nombre = nombre,
            Descripcion = entrada.Descripcion?.Trim() ?? string.Empty,
        };

        _db.Etiquetas.Add(nueva);
        await _db.SaveChangesAsync(cancelacion);

        return Mapeos.AEtiquetaDto(nueva);
    }

    public async Task<Resultado<EtiquetaDto>> ActualizarAsync(int id, EtiquetaEntradaDto entrada, CancellationToken cancelacion)
    {
        var existente = await _db.Etiquetas.FirstOrDefaultAsync(e => e.Id == id, cancelacion);
        if (existente is null)
        {
            return Fallo.NoEncontrado($"No existe una etiqueta con id {id}.");
        }

        var nombre = NormalizarNombre(entrada.Nombre);
        if (await _db.Etiquetas.AnyAsync(e => e.Nombre == nombre && e.Id != id, cancelacion))
        {
            return Fallo.Conflicto($"Ya existe otra etiqueta llamada \"{nombre}\".");
        }

        existente.Nombre = nombre;
        existente.Descripcion = entrada.Descripcion?.Trim() ?? string.Empty;
        await _db.SaveChangesAsync(cancelacion);

        return Mapeos.AEtiquetaDto(existente);
    }

    public async Task<Resultado<bool>> EliminarAsync(int id, CancellationToken cancelacion)
    {
        var existente = await _db.Etiquetas.FirstOrDefaultAsync(e => e.Id == id, cancelacion);
        if (existente is null)
        {
            return Fallo.NoEncontrado($"No existe una etiqueta con id {id}.");
        }

        var enPistas = await _db.PistaEtiquetas.CountAsync(pe => pe.EtiquetaId == id, cancelacion);
        var enEscenas = await _db.EscenaEtiquetas.CountAsync(ee => ee.EtiquetaId == id, cancelacion);
        if (enPistas > 0 || enEscenas > 0)
        {
            return Fallo.Conflicto(
                $"La etiqueta \"{existente.Nombre}\" está asignada a {enPistas} pista(s) y {enEscenas} escena(s). Quítala de ellas antes de eliminarla.");
        }

        _db.Etiquetas.Remove(existente);
        await _db.SaveChangesAsync(cancelacion);
        return true;
    }

    private static string NormalizarNombre(string nombre) => nombre.Trim().ToLowerInvariant();
}
