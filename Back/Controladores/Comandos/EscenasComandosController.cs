using Immersic.Api.Aplicacion.Comandos;
using Immersic.Api.Aplicacion.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Immersic.Api.Controladores.Comandos;

public class EscenasComandosController : ControladorBase
{
    private readonly EscenasComandos _comandos;

    public EscenasComandosController(EscenasComandos comandos)
    {
        _comandos = comandos;
    }

    [HttpPost("api/capitulos/{capituloId:int}/escenas")]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(EscenaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<EscenaDto>> Crear(int capituloId, EscenaEntradaDto entrada, CancellationToken cancelacion) =>
        ResponderCreado(await _comandos.CrearAsync(capituloId, entrada, cancelacion), creada => $"/api/capitulos/{capituloId}/escenas");

    [HttpPut("api/escenas/{id:int}")]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(EscenaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EscenaDto>> ActualizarEtiquetas(int id, EscenaEtiquetasDto entrada, CancellationToken cancelacion) =>
        Responder(await _comandos.ActualizarEtiquetasAsync(id, entrada, cancelacion));

    [HttpDelete("api/escenas/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Eliminar(int id, CancellationToken cancelacion) =>
        ResponderSinContenido(await _comandos.EliminarAsync(id, cancelacion));

    [HttpDelete("api/capitulos/{capituloId:int}/escenas")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EliminarTodas(int capituloId, CancellationToken cancelacion) =>
        ResponderSinContenido(await _comandos.EliminarTodasAsync(capituloId, cancelacion));
}
