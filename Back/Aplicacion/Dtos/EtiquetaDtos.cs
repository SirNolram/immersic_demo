using System.ComponentModel.DataAnnotations;

namespace Immersic.Api.Aplicacion.Dtos;

public class EtiquetaEntradaDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(30, ErrorMessage = "El nombre admite hasta 30 caracteres.")]
    [RegularExpression(@"^\s*[\p{L}\p{N}_-]+\s*$", ErrorMessage = "El nombre debe ser una sola palabra (letras, números, guion o guion bajo).")]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(300, ErrorMessage = "La descripción admite hasta 300 caracteres.")]
    public string? Descripcion { get; set; }
}

public record EtiquetaDto(int Id, string Nombre, string Descripcion);

public record EtiquetaResumenDto(int Id, string Nombre);
