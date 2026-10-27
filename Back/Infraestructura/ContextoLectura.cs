using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Infraestructura;

public class ContextoLectura : ContextoBase
{
    public ContextoLectura(DbContextOptions<ContextoLectura> opciones)
        : base(opciones)
    {
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess) =>
        throw new InvalidOperationException("El contexto de lectura no permite guardar cambios.");

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default) =>
        throw new InvalidOperationException("El contexto de lectura no permite guardar cambios.");
}
