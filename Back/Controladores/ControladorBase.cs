using Immersic.Api.Aplicacion.Comun;
using Microsoft.AspNetCore.Mvc;

namespace Immersic.Api.Controladores;

[ApiController]
[Produces("application/json")]
public abstract class ControladorBase : ControllerBase
{
    protected ActionResult<T> Responder<T>(Resultado<T> resultado)
    {
        if (resultado.Fallo is not null)
        {
            return RespuestaFallo(resultado.Fallo);
        }

        return Ok(resultado.Valor);
    }

    protected ActionResult<T> ResponderCreado<T>(Resultado<T> resultado, Func<T, string> ubicacion)
    {
        if (resultado.Fallo is not null)
        {
            return RespuestaFallo(resultado.Fallo);
        }

        var valor = resultado.Valor!;
        return Created(ubicacion(valor), valor);
    }

    protected IActionResult ResponderSinContenido(Resultado<bool> resultado)
    {
        if (resultado.Fallo is not null)
        {
            return RespuestaFallo(resultado.Fallo);
        }

        return NoContent();
    }

    private ActionResult RespuestaFallo(Fallo fallo)
    {
        switch (fallo.Tipo)
        {
            case TipoFallo.NoEncontrado:
                return Problem(detail: fallo.Mensaje, statusCode: StatusCodes.Status404NotFound, title: "Recurso no encontrado");
            case TipoFallo.Conflicto:
                return Problem(detail: fallo.Mensaje, statusCode: StatusCodes.Status409Conflict, title: "Conflicto con los datos existentes");
            default:
                ModelState.AddModelError(fallo.Campo, fallo.Mensaje);
                return ValidationProblem(title: "La solicitud tiene datos inválidos.", modelStateDictionary: ModelState);
        }
    }
}
