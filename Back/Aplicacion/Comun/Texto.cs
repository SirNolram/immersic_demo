using System.Text.RegularExpressions;

namespace Immersic.Api.Aplicacion.Comun;

public static class Texto
{
    private const int LongitudFragmento = 80;

    public static string ExtraerFragmento(string texto, int posicion)
    {
        if (posicion < 0 || posicion >= texto.Length)
        {
            return string.Empty;
        }

        var fin = Math.Min(texto.Length, posicion + (LongitudFragmento * 3));
        var limpio = Regex.Replace(texto[posicion..fin], @"\s+", " ").Trim();
        if (limpio.Length <= LongitudFragmento)
        {
            return limpio;
        }

        var recorte = limpio[..LongitudFragmento];
        if (char.IsHighSurrogate(recorte[^1]))
        {
            recorte = recorte[..^1];
        }

        var ultimoEspacio = recorte.LastIndexOf(' ');
        return (ultimoEspacio > LongitudFragmento / 2 ? recorte[..ultimoEspacio] : recorte).Trim();
    }

    public static string? Limpiar(string? valor) =>
        string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
}
