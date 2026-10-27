using Immersic.Api.Aplicacion.Dtos;
using Immersic.Api.Infraestructura;

namespace Immersic.Api.Aplicacion.Consultas;

public class SaludConsultas
{
    private readonly ContextoLectura _lectura;
    private readonly ContextoEscritura _escritura;

    public SaludConsultas(ContextoLectura lectura, ContextoEscritura escritura)
    {
        _lectura = lectura;
        _escritura = escritura;
    }

    public async Task<SaludDto> ObtenerAsync(CancellationToken cancelacion)
    {
        var lectura = await _lectura.Database.CanConnectAsync(cancelacion);
        var escritura = await _escritura.Database.CanConnectAsync(cancelacion);

        return new SaludDto(
            "ok",
            lectura ? "conectada" : "sin conexión",
            escritura ? "conectada" : "sin conexión",
            DateTime.UtcNow);
    }
}
