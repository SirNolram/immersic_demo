using Microsoft.EntityFrameworkCore;

namespace Immersic.Api.Infraestructura;

public class ContextoEscritura : ContextoBase
{
    public ContextoEscritura(DbContextOptions<ContextoEscritura> opciones)
        : base(opciones)
    {
    }
}
