using Immersic.Api.Aplicacion.Consultas;
using Immersic.Api.Aplicacion.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Immersic.Api.Controladores.Consultas;

public class EscenasConsultasController : ControladorBase
{
    private readonly EscenasConsultas _consultas;

    public EscenasConsultasController(EscenasConsultas consultas)
    {
        _consultas = consultas;
    }

    [HttpGet("api/capitulos/{capituloId:int}/escenas")]
    [ProducesResponseType(typeof(List<EscenaDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<EscenaDto>>> Listar(int capituloId, CancellationToken cancelacion) =>
        Responder(await _consultas.ListarPorCapituloAsync(capituloId, cancelacion));

    [HttpGet("api/capitulos/{id:int}/inmersion")]
    [ProducesResponseType(typeof(PlanInmersionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PlanInmersionDto>> ObtenerPlan(int id, CancellationToken cancelacion) =>
        Responder(await _consultas.ObtenerPlanAsync(id, cancelacion));

    [HttpGet("api/escenas/{id:int}/recomendaciones")]
    [ProducesResponseType(typeof(List<RecomendacionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<RecomendacionDto>>> Recomendaciones(int id, [FromQuery] int? limite, CancellationToken cancelacion) =>
        Responder(await _consultas.RecomendarAsync(id, limite, cancelacion));
}
