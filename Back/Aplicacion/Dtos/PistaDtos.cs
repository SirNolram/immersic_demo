using System.ComponentModel.DataAnnotations;

namespace Immersic.Api.Aplicacion.Dtos;

public class PistaEntradaDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(150, ErrorMessage = "El nombre admite hasta 150 caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "El artista admite hasta 100 caracteres.")]
    public string? Artista { get; set; }

    [Required(ErrorMessage = "Las etiquetas son obligatorias.")]
    [MinLength(1, ErrorMessage = "La pista necesita al menos una etiqueta.")]
    [MaxLength(3, ErrorMessage = "La pista admite como máximo 3 etiquetas.")]
    public List<int> EtiquetaIds { get; set; } = new();
}

public class PistaImportacionDto
{
    [Required(ErrorMessage = "Elige un archivo de audio.")]
    public IFormFile? Archivo { get; set; }

    [StringLength(150, ErrorMessage = "El nombre admite hasta 150 caracteres.")]
    public string? Nombre { get; set; }

    [StringLength(100, ErrorMessage = "El artista admite hasta 100 caracteres.")]
    public string? Artista { get; set; }

    [Required(ErrorMessage = "Las etiquetas son obligatorias.")]
    [MinLength(1, ErrorMessage = "La pista necesita al menos una etiqueta.")]
    [MaxLength(3, ErrorMessage = "La pista admite como máximo 3 etiquetas.")]
    public List<int> EtiquetaIds { get; set; } = new();
}

public record PistaDto(
    int Id,
    string Nombre,
    string? Artista,
    string NombreArchivo,
    long TamanoBytes,
    string UrlAudio,
    List<EtiquetaResumenDto> Etiquetas);

public record AudioPistaDto(string Ruta, string TipoContenido);
