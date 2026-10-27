using Immersic.Api.Aplicacion.Comandos;
using Immersic.Api.Aplicacion.Comun;
using Immersic.Api.Aplicacion.Consultas;
using Immersic.Api.Infraestructura;
using Immersic.Api.Infraestructura.Gemini;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var conexiones = ConexionesBaseDatos.Desde(builder.Configuration, builder.Environment.ContentRootPath);

builder.Services.AddDbContext<ContextoEscritura>(opciones => opciones.UseSqlite(conexiones.Escritura));
builder.Services.AddDbContext<ContextoLectura>(opciones => opciones
    .UseSqlite(conexiones.Lectura)
    .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking));

builder.Services.AddScoped<SaludConsultas>();
builder.Services.AddScoped<LibrosConsultas>();
builder.Services.AddScoped<CapitulosConsultas>();
builder.Services.AddScoped<EscenasConsultas>();
builder.Services.AddScoped<EtiquetasConsultas>();
builder.Services.AddScoped<PistasConsultas>();

builder.Services.AddScoped<LibrosComandos>();
builder.Services.AddScoped<CapitulosComandos>();
builder.Services.AddScoped<EscenasComandos>();
builder.Services.AddScoped<EtiquetasComandos>();
builder.Services.AddScoped<PistasComandos>();
builder.Services.AddScoped<InmersionComandos>();

builder.Services.Configure<OpcionesGemini>(builder.Configuration.GetSection(OpcionesGemini.Seccion));
builder.Services.AddHttpClient<IAnalizadorEscenas, ClienteGemini>((proveedor, cliente) =>
{
    var opciones = proveedor.GetRequiredService<IOptions<OpcionesGemini>>().Value;
    cliente.Timeout = TimeSpan.FromSeconds(opciones.TiempoEsperaSegundos);
});

builder.Services.AddCors(opciones => opciones.AddDefaultPolicy(politica => politica
    .AllowAnyOrigin()
    .AllowAnyHeader()
    .AllowAnyMethod()));

builder.Services
    .AddControllers()
    .ConfigureApiBehaviorOptions(opciones =>
    {
        opciones.InvalidModelStateResponseFactory = contexto =>
        {
            var fabrica = contexto.HttpContext.RequestServices.GetRequiredService<ProblemDetailsFactory>();
            var problema = fabrica.CreateValidationProblemDetails(
                contexto.HttpContext,
                contexto.ModelState,
                StatusCodes.Status400BadRequest,
                "La solicitud tiene datos inválidos.");

            return new BadRequestObjectResult(problema) { ContentTypes = { "application/problem+json" } };
        };
    });

builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opciones =>
{
    opciones.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Immersic API",
        Version = "v1",
        Description = "API REST de Immersic con operaciones de lectura (consultas) y escritura (comandos) separadas. La generación de escenas usa la API key de Gemini de cada usuario, enviada en el encabezado X-Gemini-Api-Key, y no se guarda.",
    });
});

var app = builder.Build();

using (var alcance = app.Services.CreateScope())
{
    var db = alcance.ServiceProvider.GetRequiredService<ContextoEscritura>();
    await InicializadorBaseDatos.AplicarEsquemaAsync(db);
}

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseCors();

app.UseSwagger();
app.UseSwaggerUI(opciones =>
{
    opciones.SwaggerEndpoint("/swagger/v1/swagger.json", "Immersic API v1");
    opciones.DocumentTitle = "Immersic API";
});

app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();
app.MapControllers();

app.Run();
