using Immersic.Api.Aplicacion.Comandos;
using Immersic.Api.Aplicacion.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Immersic.Api.Controladores.Comandos;

public class InmersionComandosController : ControladorBase
{
    private readonly InmersionComandos _comandos;

    public InmersionComandosController(InmersionComandos comandos)
    {
        _comandos = comandos;
    }

    [HttpPost("api/capitulos/{id:int}/inmersion")]
    [ProducesResponseType(typeof(InmersionGeneradaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status504GatewayTimeout)]
    public async Task<ActionResult<InmersionGeneradaDto>> Generar(
        int id,
        [FromHeader(Name = InmersionComandos.EncabezadoClave)] string? claveApi,
        CancellationToken cancelacion) =>
        Responder(await _comandos.GenerarAsync(id, claveApi, cancelacion));
}
