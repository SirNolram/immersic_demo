using Immersic.Api.Dominio;
using Immersic.Api.Infraestructura;
using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Aplicacion.Comun;

public static class ReglasEtiquetas
{
    public const string Modificadora = "intenso";

    public const int Minimo = 1;

    public const int Maximo = 3;

    public const string CampoEtiquetas = "EtiquetaIds";

    public static bool EsModificadora(string nombre) =>
        string.Equals(nombre, Modificadora, StringComparison.OrdinalIgnoreCase);

    public static async Task<Resultado<List<Etiqueta>>> ValidarAsync(
        ContextoBase db,
        IReadOnlyCollection<int> ids,
        CancellationToken cancelacion)
    {
        var distintos = ids.Distinct().ToList();
        if (distintos.Count != ids.Count)
        {
            return Fallo.Invalido(CampoEtiquetas, "No se puede repetir una etiqueta.");
        }

        if (distintos.Count < Minimo || distintos.Count > Maximo)
        {
            return Fallo.Invalido(CampoEtiquetas, $"Se necesitan entre {Minimo} y {Maximo} etiquetas.");
        }

        var etiquetas = await db.Etiquetas
            .Where(etiqueta => distintos.Contains(etiqueta.Id))
            .OrderBy(etiqueta => etiqueta.Id)
            .ToListAsync(cancelacion);

        var inexistentes = distintos.Except(etiquetas.Select(etiqueta => etiqueta.Id)).ToList();
        if (inexistentes.Count > 0)
        {
            return Fallo.Invalido(CampoEtiquetas, $"No existen etiquetas con id: {string.Join(", ", inexistentes)}.");
        }

        if (etiquetas.All(etiqueta => EsModificadora(etiqueta.Nombre)))
        {
            return Fallo.Invalido(CampoEtiquetas, $"La etiqueta \"{Modificadora}\" no puede ir sola; acompáñala de otra etiqueta.");
        }

        return etiquetas;
    }
}
