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

    [HttpGet("{id:int}/audio")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK, "audio/mpeg", "audio/mp4", "audio/aac", "audio/wav")]
    [ProducesResponseType(StatusCodes.Status206PartialContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Audio(int id, CancellationToken cancelacion) =>
        ResponderCon(
            await _consultas.ObtenerAudioAsync(id, cancelacion),
            audio => PhysicalFile(audio.Ruta, audio.TipoContenido, enableRangeProcessing: true));
}
