using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Immersic.Api.Aplicacion.Comun;

public record EscenaUbicada(int PosicionInicio, List<string> Etiquetas);

public static class UbicadorEscenas
{
    private const int MinimoPalabrasPrefijo = 4;
    private const int MinimoCaracteresPrefijo = 12;
    private const int MaximoRetrocesoPuntuacion = 5;

    private static readonly (string Simbolos, string Reemplazo)[] Reemplazos =
    {
        ("‘’‚‛′´`", "'"),
        ("“”„‟«»″", "\""),
        ("‐‑‒–—―−", "-"),
        ("…", "..."),
    };

    public static List<EscenaUbicada> Ubicar(
        string texto,
        IEnumerable<EscenaPropuesta> propuestas,
        IReadOnlySet<string> etiquetasPermitidas)
    {
        var (normalizado, origen) = Normalizar(texto);
        var ubicadas = new List<EscenaUbicada>();
        var desde = 0;

        foreach (var propuesta in propuestas)
        {
            var etiquetas = FiltrarEtiquetas(propuesta.Etiquetas, etiquetasPermitidas);
            if (etiquetas.Count == 0)
            {
                continue;
            }

            var encontrado = Buscar(normalizado, Candidatos(propuesta.FragmentoInicio), desde);
            if (encontrado < 0)
            {
                continue;
            }

            var posicion = RetrocederPuntuacion(texto, origen[encontrado]);
            if (ubicadas.Count > 0 && posicion <= ubicadas[^1].PosicionInicio)
            {
                continue;
            }

            ubicadas.Add(new EscenaUbicada(posicion, etiquetas));
            desde = encontrado + 1;
        }

        if (ubicadas.Count > 0)
        {
            ubicadas[0] = ubicadas[0] with { PosicionInicio = 0 };
        }

        return ubicadas;
    }

    private static List<string> FiltrarEtiquetas(IEnumerable<string> etiquetas, IReadOnlySet<string> permitidas)
    {
        var validas = etiquetas
            .Select(nombre => nombre.Trim().ToLowerInvariant())
            .Where(permitidas.Contains)
            .Distinct()
            .Take(ReglasEtiquetas.Maximo)
            .ToList();

        return validas.Any(nombre => !ReglasEtiquetas.EsModificadora(nombre)) ? validas : new List<string>();
    }

    private static (string Texto, List<int> Origen) Normalizar(string texto)
    {
        var resultado = new StringBuilder(texto.Length);
        var origen = new List<int>(texto.Length);
        var indice = 0;

        foreach (var caracter in texto.EnumerateRunes())
        {
            var normal = NormalizarCaracter(caracter);
            var espacioRepetido = normal == " " && resultado.Length > 0 && resultado[resultado.Length - 1] == ' ';
            if (!espacioRepetido)
            {
                resultado.Append(normal);
                for (var i = 0; i < normal.Length; i++)
                {
                    origen.Add(indice);
                }
            }

            indice += caracter.Utf16SequenceLength;
        }

        return (resultado.ToString(), origen);
    }

    private static string NormalizarCaracter(Rune caracter)
    {
        if (Rune.IsWhiteSpace(caracter))
        {
            return " ";
        }

        var texto = caracter.ToString();
        foreach (var (simbolos, reemplazo) in Reemplazos)
        {
            if (simbolos.Contains(texto, StringComparison.Ordinal))
            {
                return reemplazo;
            }
        }

        var sinTildes = new StringBuilder();
        foreach (var parte in texto.Normalize(NormalizationForm.FormD))
        {
            var categoria = CharUnicodeInfo.GetUnicodeCategory(parte);
            if (categoria is not (UnicodeCategory.NonSpacingMark or UnicodeCategory.SpacingCombiningMark or UnicodeCategory.EnclosingMark))
            {
                sinTildes.Append(parte);
            }
        }

        return sinTildes.ToString().ToLowerInvariant();
    }

    private static List<string> Candidatos(string fragmento)
    {
        var limpio = Regex.Replace(Normalizar(fragmento).Texto, @"\.{3,}\s*$", string.Empty).Trim();
        var variantes = new[] { limpio, Regex.Replace(limpio, @"^[^\p{L}\p{N}]+", string.Empty) };
        var candidatos = new List<string>();

        foreach (var variante in variantes)
        {
            var palabras = variante.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            for (var cantidad = palabras.Length; cantidad >= 1; cantidad--)
            {
                var candidato = string.Join(' ', palabras.Take(cantidad));
                var completo = cantidad == palabras.Length;
                if (!completo && (cantidad < MinimoPalabrasPrefijo || candidato.Length < MinimoCaracteresPrefijo))
                {
                    break;
                }

                if (candidato.Length >= 3 && !candidatos.Contains(candidato))
                {
                    candidatos.Add(candidato);
                }
            }
        }

        return candidatos;
    }

    private static int Buscar(string texto, IEnumerable<string> candidatos, int desde)
    {
        foreach (var candidato in candidatos)
        {
            var indice = texto.IndexOf(candidato, desde, StringComparison.Ordinal);
            if (indice >= 0)
            {
                return indice;
            }
        }

        return -1;
    }

    private static int RetrocederPuntuacion(string texto, int posicion)
    {
        var inicio = posicion;
        while (inicio > 0 && posicion - inicio < MaximoRetrocesoPuntuacion)
        {
            var anterior = texto[inicio - 1];
            if (char.IsLetter(anterior) || char.IsNumber(anterior) || char.IsWhiteSpace(anterior) || char.IsSurrogate(anterior))
            {
                break;
            }

            inicio--;
        }

        return inicio;
    }
}
