namespace Immersic.Api.Infraestructura.Gemini;

public class OpcionesGemini
{
    public const string Seccion = "Gemini";

    public string Modelo { get; set; } = "gemini-3.5-flash";

    public string UrlBase { get; set; } = "https://generativelanguage.googleapis.com/v1beta";

    public int TiempoEsperaSegundos { get; set; } = 150;
}
