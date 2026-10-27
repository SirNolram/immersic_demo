using Immersic.Api.Aplicacion.Comandos;
using Immersic.Api.Aplicacion.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Immersic.Api.Controladores.Comandos;

[Route("api/etiquetas")]
public class EtiquetasComandosController : ControladorBase
{
    private readonly EtiquetasComandos _comandos;

    public EtiquetasComandosController(EtiquetasComandos comandos)
    {
        _comandos = comandos;
    }

    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(EtiquetaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<EtiquetaDto>> Crear(EtiquetaEntradaDto entrada, CancellationToken cancelacion) =>
        ResponderCreado(await _comandos.CrearAsync(entrada, cancelacion), creado => $"/api/etiquetas/{creado.Id}");

    [HttpPut("{id:int}")]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(EtiquetaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<EtiquetaDto>> Actualizar(int id, EtiquetaEntradaDto entrada, CancellationToken cancelacion) =>
        Responder(await _comandos.ActualizarAsync(id, entrada, cancelacion));

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Eliminar(int id, CancellationToken cancelacion) =>
        ResponderSinContenido(await _comandos.EliminarAsync(id, cancelacion));
}
