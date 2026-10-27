using System.ComponentModel.DataAnnotations;

namespace Immersic.Api.Aplicacion.Dtos;

public class EscenaEntradaDto
{
    [Required(ErrorMessage = "La posición de inicio es obligatoria.")]
    [Range(0, 59999, ErrorMessage = "La posición debe estar entre 0 y 59.999.")]
    public int? PosicionInicio { get; set; }

    [Required(ErrorMessage = "Las etiquetas son obligatorias.")]
    [MinLength(1, ErrorMessage = "La escena necesita al menos una etiqueta.")]
    [MaxLength(3, ErrorMessage = "La escena admite como máximo 3 etiquetas.")]
    public List<int> EtiquetaIds { get; set; } = new();
}

public class EscenaEtiquetasDto
{
    [Required(ErrorMessage = "Las etiquetas son obligatorias.")]
    [MinLength(1, ErrorMessage = "La escena necesita al menos una etiqueta.")]
    [MaxLength(3, ErrorMessage = "La escena admite como máximo 3 etiquetas.")]
    public List<int> EtiquetaIds { get; set; } = new();
}

public record EscenaDto(
    int Id,
    int Orden,
    int PosicionInicio,
    int PosicionFin,
    string FragmentoInicio,
    List<EtiquetaResumenDto> Etiquetas);

public record RecomendacionDto(PistaDto Pista, int Afinidad, List<string> EtiquetasCompartidas);

public record EscenaPlanDto(
    int EscenaId,
    int Orden,
    int PosicionInicio,
    int PosicionFin,
    string FragmentoInicio,
    List<EtiquetaResumenDto> Etiquetas,
    PistaDto? PistaRecomendada,
    int Afinidad);

public record PlanInmersionDto(int CapituloId, string TituloCapitulo, bool ProcesadoIa, List<EscenaPlanDto> Escenas);

public record InmersionGeneradaDto(int CapituloId, string Modelo, int CantidadEscenas, List<EscenaDto> Escenas);

public record SaludDto(string Api, string Lectura, string Escritura, DateTime Fecha);
