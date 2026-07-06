using System.Text.Json.Serialization;

namespace TaskFlow.Api.Common;

public sealed class ApiResponse<T>
{
    public bool Success { get; init; }

    public string Message { get; init; } = string.Empty;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public T? Data { get; init; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public IDictionary<string, string[]>? Errors { get; init; }

    public static ApiResponse<T> SuccessResponse(T? data, string message) =>
        new()
        {
            Success = true,
            Message = message,
            Data = data
        };

    public static ApiResponse<T> Failure(string message, IDictionary<string, string[]>? errors = null) =>
        new()
        {
            Success = false,
            Message = message,
            Errors = errors
        };
}
