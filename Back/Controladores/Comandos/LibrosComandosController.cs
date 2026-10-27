using Immersic.Api.Aplicacion.Comandos;
using Immersic.Api.Aplicacion.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Immersic.Api.Controladores.Comandos;

[Route("api/libros")]
public class LibrosComandosController : ControladorBase
{
    private readonly LibrosComandos _comandos;

    public LibrosComandosController(LibrosComandos comandos)
    {
        _comandos = comandos;
    }

    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(LibroDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<LibroDto>> Crear(LibroEntradaDto entrada, CancellationToken cancelacion) =>
        ResponderCreado(await _comandos.CrearAsync(entrada, cancelacion), creado => $"/api/libros/{creado.Id}");

    [HttpPut("{id:int}")]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(LibroDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<LibroDto>> Actualizar(int id, LibroEntradaDto entrada, CancellationToken cancelacion) =>
        Responder(await _comandos.ActualizarAsync(id, entrada, cancelacion));

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Eliminar(int id, CancellationToken cancelacion) =>
        ResponderSinContenido(await _comandos.EliminarAsync(id, cancelacion));
}
