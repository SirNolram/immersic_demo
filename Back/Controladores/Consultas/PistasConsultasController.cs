using Immersic.Api.Aplicacion.Consultas;
using Immersic.Api.Aplicacion.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Immersic.Api.Controladores.Consultas;

[Route("api/pistas")]
public class PistasConsultasController : ControladorBase
{
    private readonly PistasConsultas _consultas;

    public PistasConsultasController(PistasConsultas consultas)
    {
        _consultas = consultas;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<PistaDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PistaDto>>> Listar(
        [FromQuery] string? buscar,
        [FromQuery] string? etiqueta,
        CancellationToken cancelacion) =>
        await _consultas.ListarAsync(buscar, etiqueta, cancelacion);

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PistaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PistaDto>> Obtener(int id, CancellationToken cancelacion) =>
        Responder(await _consultas.ObtenerAsync(id, cancelacion));
}
