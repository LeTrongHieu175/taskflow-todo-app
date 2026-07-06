using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Common;
using TaskFlow.Api.Data;
using TaskFlow.Api.Middleware;
using TaskFlow.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(entry => entry.Value?.Errors.Count > 0)
            .ToDictionary(
                entry => ToCamelCase(entry.Key),
                entry => entry.Value!.Errors
                    .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage) ? "Invalid value." : error.ErrorMessage)
                    .Distinct()
                    .ToArray());

        var response = ApiResponse<object>.Failure("Validation failed", errors);
        return new BadRequestObjectResult(response);
    };
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("TaskFlowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4173",
                "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

await EnsureDatabaseAsync(app);

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("TaskFlowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();

static async Task EnsureDatabaseAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var contentRootPath = scope.ServiceProvider.GetRequiredService<IHostEnvironment>().ContentRootPath;
    Directory.CreateDirectory(Path.Combine(contentRootPath, "App_Data"));
    await context.Database.EnsureCreatedAsync();
    await DbSeeder.SeedAsync(context);
}

static string ToCamelCase(string value)
{
    if (string.IsNullOrWhiteSpace(value))
    {
        return value;
    }

    var cleaned = value.Split('.').Last();
    return char.ToLowerInvariant(cleaned[0]) + cleaned[1..];
}
