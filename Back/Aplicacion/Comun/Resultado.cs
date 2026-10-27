namespace Immersic.Api.Aplicacion.Comun;

public enum TipoFallo
{
    NoEncontrado,
    Conflicto,
    Invalido,
}

public sealed record Fallo(TipoFallo Tipo, string Mensaje, string Campo = "")
{
    public static Fallo NoEncontrado(string mensaje) => new(TipoFallo.NoEncontrado, mensaje);

    public static Fallo Conflicto(string mensaje) => new(TipoFallo.Conflicto, mensaje);

    public static Fallo Invalido(string campo, string mensaje) => new(TipoFallo.Invalido, mensaje, campo);
}

public sealed class Resultado<T>
{
    private Resultado(T? valor, Fallo? fallo)
    {
        Valor = valor;
        Fallo = fallo;
    }

    public T? Valor { get; }

    public Fallo? Fallo { get; }

    public static Resultado<T> Exito(T valor) => new(valor, null);

    public static implicit operator Resultado<T>(T valor) => Exito(valor);

    public static implicit operator Resultado<T>(Fallo fallo) => new(default, fallo);
}
