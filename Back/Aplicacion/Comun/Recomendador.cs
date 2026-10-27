using Immersic.Api.Aplicacion.Dtos;
using Immersic.Api.Dominio;

namespace Immersic.Api.Aplicacion.Comun;

public sealed record Afinidad(int Puntaje, List<string> EtiquetasCompartidas);

public static class Recomendador
{
    public static Afinidad Calcular(IReadOnlyCollection<string> etiquetasEscena, IReadOnlyCollection<string> etiquetasPista)
    {
        var compartidas = etiquetasEscena
            .Intersect(etiquetasPista, StringComparer.OrdinalIgnoreCase)
            .ToList();

        var principales = compartidas.Count(nombre => !ReglasEtiquetas.EsModificadora(nombre));
        return principales == 0
            ? new Afinidad(0, new List<string>())
            : new Afinidad(compartidas.Count, compartidas);
    }

    public static List<RecomendacionDto> Recomendar(
        IReadOnlyCollection<string> etiquetasEscena,
        IEnumerable<Pista> pistas,
        int limite)
    {
        return pistas
            .Select(pista => new
            {
                Pista = pista,
                Afinidad = Calcular(
                    etiquetasEscena,
                    pista.Etiquetas.Select(relacion => relacion.Etiqueta?.Nombre).OfType<string>().ToList()),
            })
            .Where(candidata => candidata.Afinidad.Puntaje > 0)
            .OrderByDescending(candidata => candidata.Afinidad.Puntaje)
            .ThenBy(candidata => candidata.Pista.Nombre, StringComparer.OrdinalIgnoreCase)
            .ThenBy(candidata => candidata.Pista.Id)
            .Take(limite)
            .Select(candidata => new RecomendacionDto(
                Mapeos.APistaDto(candidata.Pista),
                candidata.Afinidad.Puntaje,
                candidata.Afinidad.EtiquetasCompartidas))
            .ToList();
    }
}
