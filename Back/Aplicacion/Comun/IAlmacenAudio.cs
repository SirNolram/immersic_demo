namespace Immersic.Api.Aplicacion.Comun;

public interface IAlmacenAudio
{
    Task<string> GuardarAsync(Stream contenido, string extension, CancellationToken cancelacion);

    string? ObtenerRuta(string archivo);

    bool Eliminar(string archivo);
}
