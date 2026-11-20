using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Aplicacion.Dtos;
using Immersic.Api.Dominio;
using Immersic.Api.Infraestructura;
using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Aplicacion.Comandos;

public class PistasComandos
{
    private const int LargoNombre = 150;
    private const int LargoNombreOriginal = 255;

    private readonly ContextoEscritura _db;
    private readonly IAlmacenAudio _almacen;

    public PistasComandos(ContextoEscritura db, IAlmacenAudio almacen)
    {
        _db = db;
        _almacen = almacen;
    }

    public async Task<Resultado<PistaDto>> ImportarAsync(PistaImportacionDto entrada, CancellationToken cancelacion)
    {
        var archivo = entrada.Archivo;
        if (archivo is null || archivo.Length == 0)
        {
            return Fallo.Invalido(nameof(entrada.Archivo), "Elige un archivo de audio que no esté vacío.");
        }

        if (!FormatosAudio.TryObtenerTipo(archivo.FileName, out var extension, out var tipoContenido))
        {
            return Fallo.Invalido(nameof(entrada.Archivo), $"Formato no compatible. Usa un archivo {FormatosAudio.Descripcion}.");
        }

        if (archivo.Length > FormatosAudio.TamanoMaximoBytes)
        {
            return Fallo.Invalido(nameof(entrada.Archivo), "El archivo supera el máximo de 50 MB.");
        }

        var validacion = await ReglasEtiquetas.ValidarAsync(_db, entrada.EtiquetaIds, cancelacion);
        if (validacion.Fallo is not null)
        {
            return validacion.Fallo;
        }

        var nombreOriginal = Recortar(Path.GetFileName(archivo.FileName), LargoNombreOriginal);
        var nombre = Texto.Limpiar(entrada.Nombre) ?? Recortar(Path.GetFileNameWithoutExtension(nombreOriginal).Trim(), LargoNombre);
        if (nombre.Length == 0)
        {
            nombre = "Canción sin nombre";
        }

        string guardado;
        await using (var contenido = archivo.OpenReadStream())
        {
            guardado = await _almacen.GuardarAsync(contenido, extension, cancelacion);
        }

        var etiquetas = validacion.Valor!;
        var nueva = new Pista
        {
            Nombre = nombre,
            Artista = Texto.Limpiar(entrada.Artista),
            Archivo = guardado,
            NombreOriginal = nombreOriginal,
            TipoContenido = tipoContenido,
            TamanoBytes = archivo.Length,
            Etiquetas = etiquetas.Select(etiqueta => new PistaEtiqueta { EtiquetaId = etiqueta.Id }).ToList(),
        };

        try
        {
            _db.Pistas.Add(nueva);
            await _db.SaveChangesAsync(cancelacion);
        }
        catch
        {
            _almacen.Eliminar(guardado);
            throw;
        }

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
        var existente = await _db.Pistas.FirstOrDefaultAsync(p => p.Id == id, cancelacion);
        if (existente is null)
        {
            return Fallo.NoEncontrado($"No existe una pista con id {id}.");
        }

        _db.Pistas.Remove(existente);
        await _db.SaveChangesAsync(cancelacion);
        _almacen.Eliminar(existente.Archivo);
        return true;
    }

    private static string Recortar(string texto, int largo) => texto.Length <= largo ? texto : texto[..largo];
}
