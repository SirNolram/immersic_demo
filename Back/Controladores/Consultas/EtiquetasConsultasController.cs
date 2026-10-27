using Immersic.Api.Aplicacion.Consultas;
using Immersic.Api.Aplicacion.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Immersic.Api.Controladores.Consultas;

[Route("api/etiquetas")]
public class EtiquetasConsultasController : ControladorBase
{
    private readonly EtiquetasConsultas _consultas;

    public EtiquetasConsultasController(EtiquetasConsultas consultas)
    {
        _consultas = consultas;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<EtiquetaDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<EtiquetaDto>>> Listar(CancellationToken cancelacion) =>
        await _consultas.ListarAsync(cancelacion);

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(EtiquetaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EtiquetaDto>> Obtener(int id, CancellationToken cancelacion) =>
        Responder(await _consultas.ObtenerAsync(id, cancelacion));
}
