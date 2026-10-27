using System.ComponentModel.DataAnnotations;

namespace Immersic.Api.Aplicacion.Dtos;

public class CapituloEntradaDto
{
    [Required(ErrorMessage = "El título es obligatorio.")]
    [StringLength(150, ErrorMessage = "El título admite hasta 150 caracteres.")]
    public string Titulo { get; set; } = string.Empty;

    [StringLength(60000, ErrorMessage = "El contenido admite hasta 60.000 caracteres.")]
    public string? Contenido { get; set; }

    [Range(1, 10000, ErrorMessage = "El número debe estar entre 1 y 10.000.")]
    public int? Numero { get; set; }
}

public record CapituloResumenDto(
    int Id,
    int LibroId,
    int Numero,
    string Titulo,
    int Caracteres,
    int CantidadEscenas,
    bool ProcesadoIa,
    DateTime CreadoEn);

public record CapituloDto(
    int Id,
    int LibroId,
    int Numero,
    string Titulo,
    string Contenido,
    int Caracteres,
    int CantidadEscenas,
    bool ProcesadoIa,
    DateTime CreadoEn);
