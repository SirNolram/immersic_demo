using System.ComponentModel.DataAnnotations.Schema;

namespace Immersic.Api.Dominio;

[Table("pistas")]
public class Pista
{
    [Column("id")]
    public int Id { get; set; }

    [Column("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("artista")]
    public string? Artista { get; set; }

    [Column("archivo")]
    public string Archivo { get; set; } = string.Empty;

    [Column("nombre_original")]
    public string NombreOriginal { get; set; } = string.Empty;

    [Column("tipo_contenido")]
    public string TipoContenido { get; set; } = string.Empty;

    [Column("tamano_bytes")]
    public long TamanoBytes { get; set; }

    public List<PistaEtiqueta> Etiquetas { get; set; } = new();
}
