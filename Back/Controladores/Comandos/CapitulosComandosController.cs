using Immersic.Api.Aplicacion.Comandos;
using Immersic.Api.Aplicacion.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Immersic.Api.Controladores.Comandos;

public class CapitulosComandosController : ControladorBase
{
    private readonly CapitulosComandos _comandos;

    public CapitulosComandosController(CapitulosComandos comandos)
    {
        _comandos = comandos;
    }

    [HttpPost("api/libros/{libroId:int}/capitulos")]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(CapituloDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CapituloDto>> Crear(int libroId, CapituloEntradaDto entrada, CancellationToken cancelacion) =>
        ResponderCreado(await _comandos.CrearAsync(libroId, entrada, cancelacion), creado => $"/api/capitulos/{creado.Id}");

    [HttpPut("api/capitulos/{id:int}")]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(CapituloDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CapituloDto>> Actualizar(int id, CapituloEntradaDto entrada, CancellationToken cancelacion) =>
        Responder(await _comandos.ActualizarAsync(id, entrada, cancelacion));

    [HttpDelete("api/capitulos/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Eliminar(int id, CancellationToken cancelacion) =>
        ResponderSinContenido(await _comandos.EliminarAsync(id, cancelacion));
}
