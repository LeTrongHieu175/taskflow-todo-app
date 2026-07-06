using System.Text.Json;
using TaskFlow.Api.Common;

namespace TaskFlow.Api.Middleware;

public sealed class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Unhandled exception occurred.");
            await HandleExceptionAsync(context, exception);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, response) = exception switch
        {
            RequestValidationException validationException => (
                StatusCodes.Status400BadRequest,
                ApiResponse<object>.Failure(validationException.Message, validationException.Errors)),
            NotFoundException notFoundException => (
                StatusCodes.Status404NotFound,
                ApiResponse<object>.Failure(notFoundException.Message)),
            BadHttpRequestException badRequestException => (
                StatusCodes.Status400BadRequest,
                ApiResponse<object>.Failure(badRequestException.Message)),
            _ => (
                StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Failure("An unexpected error occurred."))
        };

        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
