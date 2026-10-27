using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Aplicacion.Dtos;
using Immersic.Api.Infraestructura;
using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Aplicacion.Consultas;

public class EtiquetasConsultas
{
    private readonly ContextoLectura _db;

    public EtiquetasConsultas(ContextoLectura db)
    {
        _db = db;
    }

    public Task<List<EtiquetaDto>> ListarAsync(CancellationToken cancelacion) =>
        _db.Etiquetas
            .OrderBy(e => e.Id)
            .Select(e => new EtiquetaDto(e.Id, e.Nombre, e.Descripcion))
            .ToListAsync(cancelacion);

    public async Task<Resultado<EtiquetaDto>> ObtenerAsync(int id, CancellationToken cancelacion)
    {
        var encontrada = await _db.Etiquetas.FirstOrDefaultAsync(e => e.Id == id, cancelacion);
        if (encontrada is null)
        {
            return Fallo.NoEncontrado($"No existe una etiqueta con id {id}.");
        }

        return Mapeos.AEtiquetaDto(encontrada);
    }
}
