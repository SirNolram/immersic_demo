using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Aplicacion.Dtos;
using Immersic.Api.Dominio;
using Immersic.Api.Infraestructura;
using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Aplicacion.Comandos;

public class PistasComandos
{
    private readonly ContextoEscritura _db;

    public PistasComandos(ContextoEscritura db)
    {
        _db = db;
    }

    public async Task<Resultado<PistaDto>> CrearAsync(PistaEntradaDto entrada, CancellationToken cancelacion)
    {
        var validacion = await ReglasEtiquetas.ValidarAsync(_db, entrada.EtiquetaIds, cancelacion);
        if (validacion.Fallo is not null)
        {
            return validacion.Fallo;
        }

        var etiquetas = validacion.Valor!;
        var nueva = new Pista
        {
            Nombre = entrada.Nombre.Trim(),
            Artista = Texto.Limpiar(entrada.Artista),
            ArchivoUrl = Texto.Limpiar(entrada.ArchivoUrl),
        };

        foreach (var seleccionada in etiquetas)
        {
            nueva.Etiquetas.Add(new PistaEtiqueta { EtiquetaId = seleccionada.Id });
        }

        _db.Pistas.Add(nueva);
        await _db.SaveChangesAsync(cancelacion);

        return Mapeos.APistaDto(nueva, etiquetas);
    }

    public async Task<Resultado<PistaDto>> ActualizarAsync(int id, PistaEntradaDto entrada, CancellationToken cancelacion)
    {
        var existente = await _db.Pistas
            .Include(p => p.Etiquetas)
            .FirstOrDefaultAsync(p => p.Id == id, cancelacion);
        if (existente is null)
        {
            return Fallo.NoEncontrado($"No existe una pista con id {id}.");
        }

        var validacion = await ReglasEtiquetas.ValidarAsync(_db, entrada.EtiquetaIds, cancelacion);
        if (validacion.Fallo is not null)
        {
            return validacion.Fallo;
        }

        var etiquetas = validacion.Valor!;
        existente.Nombre = entrada.Nombre.Trim();
        existente.Artista = Texto.Limpiar(entrada.Artista);
        existente.ArchivoUrl = Texto.Limpiar(entrada.ArchivoUrl);

        var idsNuevos = etiquetas.Select(e => e.Id).ToHashSet();
        var idsActuales = existente.Etiquetas.Select(pe => pe.EtiquetaId).ToHashSet();

        var sobrantes = existente.Etiquetas.Where(pe => !idsNuevos.Contains(pe.EtiquetaId)).ToList();
        _db.PistaEtiquetas.RemoveRange(sobrantes);

        foreach (var idEtiqueta in idsNuevos.Where(nuevoId => !idsActuales.Contains(nuevoId)))
        {
            _db.PistaEtiquetas.Add(new PistaEtiqueta { PistaId = id, EtiquetaId = idEtiqueta });
        }

        await _db.SaveChangesAsync(cancelacion);

        return Mapeos.APistaDto(existente, etiquetas);
    }

    public async Task<Resultado<bool>> EliminarAsync(int id, CancellationToken cancelacion)
    {
        var eliminadas = await _db.Pistas.Where(p => p.Id == id).ExecuteDeleteAsync(cancelacion);
        if (eliminadas == 0)
        {
            return Fallo.NoEncontrado($"No existe una pista con id {id}.");
        }

        return true;
    }
}
