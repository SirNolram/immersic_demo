using System.ComponentModel.DataAnnotations;

namespace Immersic.Api.Aplicacion.Dtos;

public class PistaEntradaDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(150, ErrorMessage = "El nombre admite hasta 150 caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "El artista admite hasta 100 caracteres.")]
    public string? Artista { get; set; }

    [StringLength(500, ErrorMessage = "La ruta del archivo admite hasta 500 caracteres.")]
    public string? ArchivoUrl { get; set; }

    [Required(ErrorMessage = "Las etiquetas son obligatorias.")]
    [MinLength(1, ErrorMessage = "La pista necesita al menos una etiqueta.")]
    [MaxLength(3, ErrorMessage = "La pista admite como máximo 3 etiquetas.")]
    public List<int> EtiquetaIds { get; set; } = new();
}

public record PistaDto(int Id, string Nombre, string? Artista, string? ArchivoUrl, List<EtiquetaResumenDto> Etiquetas);
