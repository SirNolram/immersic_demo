namespace Immersic.Api.Aplicacion.Comun;

public static class FormatosAudio
{
    public const long TamanoMaximoBytes = 50L * 1024 * 1024;
    public const long TamanoMaximoSolicitud = TamanoMaximoBytes + 1024 * 1024;
    public const string Descripcion = "MP3, M4A, AAC o WAV";

    private static readonly Dictionary<string, string> TiposPorExtension = new(StringComparer.OrdinalIgnoreCase)
    {
        [".mp3"] = "audio/mpeg",
        [".m4a"] = "audio/mp4",
        [".aac"] = "audio/aac",
        [".wav"] = "audio/wav",
    };

    public static bool TryObtenerTipo(string nombreArchivo, out string extension, out string tipoContenido)
    {
        extension = Path.GetExtension(nombreArchivo).ToLowerInvariant();
        return TiposPorExtension.TryGetValue(extension, out tipoContenido!);
    }
}
