using Immersic.Api.Aplicacion.Consultas;
using Immersic.Api.Aplicacion.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Immersic.Api.Controladores.Consultas;

public class CapitulosConsultasController : ControladorBase
{
    private readonly CapitulosConsultas _consultas;

    public CapitulosConsultasController(CapitulosConsultas consultas)
    {
        _consultas = consultas;
    }

    [HttpGet("api/libros/{libroId:int}/capitulos")]
    [ProducesResponseType(typeof(List<CapituloResumenDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<CapituloResumenDto>>> Listar(int libroId, CancellationToken cancelacion) =>
        Responder(await _consultas.ListarPorLibroAsync(libroId, cancelacion));

    [HttpGet("api/capitulos/{id:int}")]
    [ProducesResponseType(typeof(CapituloDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CapituloDto>> Obtener(int id, CancellationToken cancelacion) =>
        Responder(await _consultas.ObtenerAsync(id, cancelacion));
}
