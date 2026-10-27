using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Aplicacion.Dtos;
using Immersic.Api.Dominio;
using Immersic.Api.Infraestructura;
using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Aplicacion.Comandos;

public class EscenasComandos
{
    private readonly ContextoEscritura _db;

    public EscenasComandos(ContextoEscritura db)
    {
        _db = db;
    }

    public async Task<Resultado<EscenaDto>> CrearAsync(int capituloId, EscenaEntradaDto entrada, CancellationToken cancelacion)
    {
        var capitulo = await _db.Capitulos.FirstOrDefaultAsync(c => c.Id == capituloId, cancelacion);
        if (capitulo is null)
        {
            return Fallo.NoEncontrado($"No existe un capítulo con id {capituloId}.");
        }

        var posicion = entrada.PosicionInicio ?? 0;
        if (posicion >= capitulo.Contenido.Length)
        {
            return Fallo.Invalido(
                nameof(EscenaEntradaDto.PosicionInicio),
                $"La posición debe ser menor que la longitud del capítulo ({capitulo.Contenido.Length} caracteres).");
        }

        var validacion = await ReglasEtiquetas.ValidarAsync(_db, entrada.EtiquetaIds, cancelacion);
        if (validacion.Fallo is not null)
        {
            return validacion.Fallo;
        }

        var existentes = await _db.Escenas.Where(e => e.CapituloId == capituloId).ToListAsync(cancelacion);
        if (existentes.Any(e => e.PosicionInicio == posicion))
        {
            return Fallo.Conflicto($"Ya existe una escena que empieza en la posición {posicion}.");
        }

        var etiquetas = validacion.Valor!;
        var nueva = new Escena
        {
            CapituloId = capituloId,
            PosicionInicio = posicion,
            FragmentoInicio = Texto.ExtraerFragmento(capitulo.Contenido, posicion),
        };
        foreach (var seleccionada in etiquetas)
        {
            nueva.Etiquetas.Add(new EscenaEtiqueta { EtiquetaId = seleccionada.Id });
        }

        var todas = existentes.Append(nueva).OrderBy(e => e.PosicionInicio).ToList();
        Renumerar(todas);

        _db.Escenas.Add(nueva);
        await _db.SaveChangesAsync(cancelacion);

        return ADto(nueva, todas, capitulo.Contenido.Length, etiquetas);
    }

    public async Task<Resultado<EscenaDto>> ActualizarEtiquetasAsync(int id, EscenaEtiquetasDto entrada, CancellationToken cancelacion)
    {
        var escena = await _db.Escenas
            .Include(e => e.Etiquetas)
            .FirstOrDefaultAsync(e => e.Id == id, cancelacion);
        if (escena is null)
        {
            return Fallo.NoEncontrado($"No existe una escena con id {id}.");
        }

        var validacion = await ReglasEtiquetas.ValidarAsync(_db, entrada.EtiquetaIds, cancelacion);
        if (validacion.Fallo is not null)
        {
            return validacion.Fallo;
        }

        var etiquetas = validacion.Valor!;
        var idsNuevos = etiquetas.Select(e => e.Id).ToHashSet();
        var idsActuales = escena.Etiquetas.Select(ee => ee.EtiquetaId).ToHashSet();

        _db.EscenaEtiquetas.RemoveRange(escena.Etiquetas.Where(ee => !idsNuevos.Contains(ee.EtiquetaId)).ToList());
        foreach (var idEtiqueta in idsNuevos.Where(nuevoId => !idsActuales.Contains(nuevoId)))
        {
            _db.EscenaEtiquetas.Add(new EscenaEtiqueta { EscenaId = id, EtiquetaId = idEtiqueta });
        }

        await _db.SaveChangesAsync(cancelacion);

        var hermanas = await _db.Escenas
            .Where(e => e.CapituloId == escena.CapituloId)
            .OrderBy(e => e.PosicionInicio)
            .ToListAsync(cancelacion);
        var contenido = await _db.Capitulos
            .Where(c => c.Id == escena.CapituloId)
            .Select(c => c.Contenido)
            .FirstAsync(cancelacion);

        return ADto(escena, hermanas, contenido.Length, etiquetas);
    }

    public async Task<Resultado<bool>> EliminarAsync(int id, CancellationToken cancelacion)
    {
        var escena = await _db.Escenas.FirstOrDefaultAsync(e => e.Id == id, cancelacion);
        if (escena is null)
        {
            return Fallo.NoEncontrado($"No existe una escena con id {id}.");
        }

        var restantes = await _db.Escenas
            .Where(e => e.CapituloId == escena.CapituloId && e.Id != id)
            .OrderBy(e => e.PosicionInicio)
            .ToListAsync(cancelacion);

        _db.Escenas.Remove(escena);
        Renumerar(restantes);
        await _db.SaveChangesAsync(cancelacion);
        return true;
    }

    public async Task<Resultado<bool>> EliminarTodasAsync(int capituloId, CancellationToken cancelacion)
    {
        if (!await _db.Capitulos.AnyAsync(c => c.Id == capituloId, cancelacion))
        {
            return Fallo.NoEncontrado($"No existe un capítulo con id {capituloId}.");
        }

        await _db.Escenas.Where(e => e.CapituloId == capituloId).ExecuteDeleteAsync(cancelacion);
        return true;
    }

    private static void Renumerar(IReadOnlyList<Escena> escenasOrdenadas)
    {
        for (var i = 0; i < escenasOrdenadas.Count; i++)
        {
            escenasOrdenadas[i].Orden = i + 1;
        }
    }

    private static EscenaDto ADto(Escena escena, IReadOnlyList<Escena> ordenadas, int longitudContenido, IEnumerable<Etiqueta> etiquetas)
    {
        var indice = -1;
        for (var i = 0; i < ordenadas.Count; i++)
        {
            if (ordenadas[i].PosicionInicio == escena.PosicionInicio)
            {
                indice = i;
                break;
            }
        }

        var fin = indice >= 0 && indice + 1 < ordenadas.Count ? ordenadas[indice + 1].PosicionInicio : longitudContenido;
        var resumen = etiquetas.OrderBy(e => e.Id).Select(Mapeos.AEtiquetaResumen).ToList();
        return new EscenaDto(escena.Id, escena.Orden, escena.PosicionInicio, fin, escena.FragmentoInicio, resumen);
    }
}
