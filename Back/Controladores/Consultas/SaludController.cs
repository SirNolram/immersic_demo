using Immersic.Api.Aplicacion.Consultas;
using Immersic.Api.Aplicacion.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Immersic.Api.Controladores.Consultas;

[Route("api/salud")]
public class SaludController : ControladorBase
{
    private readonly SaludConsultas _consultas;

    public SaludController(SaludConsultas consultas)
    {
        _consultas = consultas;
    }

    [HttpGet]
    [ProducesResponseType(typeof(SaludDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SaludDto>> Obtener(CancellationToken cancelacion) =>
        await _consultas.ObtenerAsync(cancelacion);
}
