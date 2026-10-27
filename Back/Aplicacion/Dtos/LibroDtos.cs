using System.ComponentModel.DataAnnotations;

namespace Immersic.Api.Aplicacion.Dtos;

public class LibroEntradaDto
{
    [Required(ErrorMessage = "El título es obligatorio.")]
    [StringLength(150, ErrorMessage = "El título admite hasta 150 caracteres.")]
    public string Titulo { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "El autor admite hasta 100 caracteres.")]
    public string? Autor { get; set; }
}

public record LibroDto(int Id, string Titulo, string? Autor, DateTime CreadoEn, int CantidadCapitulos);
