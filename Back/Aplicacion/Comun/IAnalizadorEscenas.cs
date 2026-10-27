using Immersic.Api.Dominio;

namespace Immersic.Api.Aplicacion.Comun;

public record EscenaPropuesta(string FragmentoInicio, List<string> Etiquetas);

public interface IAnalizadorEscenas
{
    string Modelo { get; }

    Task<Resultado<List<EscenaPropuesta>>> ProponerEscenasAsync(
        string texto,
        IReadOnlyList<Etiqueta> etiquetas,
        string claveApi,
        CancellationToken cancelacion);
}
