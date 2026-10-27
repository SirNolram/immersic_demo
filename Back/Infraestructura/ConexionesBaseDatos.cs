using Microsoft.Data.Sqlite;

namespace Immersic.Api.Infraestructura;

public sealed record ConexionesBaseDatos(string Escritura, string Lectura)
{
    private const string ArchivoPorDefecto = "Data Source=immersic.db";

    public static ConexionesBaseDatos Desde(IConfiguration configuracion, string rutaContenido)
    {
        var escritura = Normalizar(configuracion.GetConnectionString("Escritura") ?? ArchivoPorDefecto, rutaContenido);
        escritura.ForeignKeys = true;

        var lecturaConfigurada = configuracion.GetConnectionString("Lectura");
        var lectura = string.IsNullOrWhiteSpace(lecturaConfigurada)
            ? new SqliteConnectionStringBuilder(escritura.ToString())
            : Normalizar(lecturaConfigurada, rutaContenido);
        lectura.Mode = SqliteOpenMode.ReadOnly;

        return new ConexionesBaseDatos(escritura.ToString(), lectura.ToString());
    }

    private static SqliteConnectionStringBuilder Normalizar(string cadena, string rutaContenido)
    {
        var constructor = new SqliteConnectionStringBuilder(cadena);
        var archivo = constructor.DataSource;
        if (!string.IsNullOrWhiteSpace(archivo)
            && !archivo.Equals(":memory:", StringComparison.OrdinalIgnoreCase)
            && !Path.IsPathRooted(archivo))
        {
            constructor.DataSource = Path.Combine(rutaContenido, archivo);
        }

        return constructor;
    }
}
