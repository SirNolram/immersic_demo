using Immersic.Api.Aplicacion.Comun;
using Microsoft.Extensions.Options;

namespace Immersic.Api.Infraestructura.Audio;

public class AlmacenAudioLocal : IAlmacenAudio
{
    private readonly string _carpeta;

    public AlmacenAudioLocal(IOptions<OpcionesAudio> opciones, IWebHostEnvironment entorno)
    {
        var carpeta = opciones.Value.Carpeta;
        _carpeta = Path.IsPathRooted(carpeta) ? carpeta : Path.Combine(entorno.ContentRootPath, carpeta);
        Directory.CreateDirectory(_carpeta);
    }

    public async Task<string> GuardarAsync(Stream contenido, string extension, CancellationToken cancelacion)
    {
        var archivo = $"{Guid.NewGuid():N}{extension}";
        var ruta = Path.Combine(_carpeta, archivo);
        try
        {
            await using var destino = new FileStream(ruta, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true);
            await contenido.CopyToAsync(destino, cancelacion);
        }
        catch
        {
            Eliminar(archivo);
            throw;
        }

        return archivo;
    }

    public string? ObtenerRuta(string archivo)
    {
        var ruta = Path.Combine(_carpeta, Path.GetFileName(archivo));
        return File.Exists(ruta) ? ruta : null;
    }

    public bool Eliminar(string archivo)
    {
        var ruta = Path.Combine(_carpeta, Path.GetFileName(archivo));
        try
        {
            File.Delete(ruta);
            return true;
        }
        catch (Exception error) when (error is IOException or UnauthorizedAccessException)
        {
            return false;
        }
    }
}
