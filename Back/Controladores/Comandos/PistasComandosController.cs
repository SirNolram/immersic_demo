using Immersic.Api.Aplicacion.Comandos;
using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Aplicacion.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Immersic.Api.Controladores.Comandos;

[Route("api/pistas")]
public class PistasComandosController : ControladorBase
{
    private readonly PistasComandos _comandos;

    public PistasComandosController(PistasComandos comandos)
    {
        _comandos = comandos;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(FormatosAudio.TamanoMaximoSolicitud)]
    [RequestFormLimits(MultipartBodyLengthLimit = FormatosAudio.TamanoMaximoSolicitud)]
    [ProducesResponseType(typeof(PistaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<PistaDto>> Importar([FromForm] PistaImportacionDto entrada, CancellationToken cancelacion) =>
        ResponderCreado(await _comandos.ImportarAsync(entrada, cancelacion), creada => $"/api/pistas/{creada.Id}");

    [HttpPut("{id:int}")]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(PistaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<PistaDto>> Actualizar(int id, PistaEntradaDto entrada, CancellationToken cancelacion) =>
        Responder(await _comandos.ActualizarAsync(id, entrada, cancelacion));

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Eliminar(int id, CancellationToken cancelacion) =>
        ResponderSinContenido(await _comandos.EliminarAsync(id, cancelacion));
}
