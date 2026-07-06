namespace TaskFlow.Api.Common;

public sealed class RequestValidationException : Exception
{
    public RequestValidationException(string message, IDictionary<string, string[]> errors)
        : base(message)
    {
        Errors = errors;
    }

    public IDictionary<string, string[]> Errors { get; }
}
