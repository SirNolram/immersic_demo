using Immersic.Api.Aplicacion.Consultas;
using Immersic.Api.Aplicacion.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Immersic.Api.Controladores.Consultas;

[Route("api/libros")]
public class LibrosConsultasController : ControladorBase
{
    private readonly LibrosConsultas _consultas;

    public LibrosConsultasController(LibrosConsultas consultas)
    {
        _consultas = consultas;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<LibroDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<LibroDto>>> Listar([FromQuery] string? buscar, CancellationToken cancelacion) =>
        await _consultas.ListarAsync(buscar, cancelacion);

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(LibroDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LibroDto>> Obtener(int id, CancellationToken cancelacion) =>
        Responder(await _consultas.ObtenerAsync(id, cancelacion));
}
