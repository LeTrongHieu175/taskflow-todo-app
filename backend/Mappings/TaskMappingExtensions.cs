using System.Globalization;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Models;
using TaskStatusType = TaskFlow.Api.Models.TaskStatus;

namespace TaskFlow.Api.Mappings;

public static class TaskMappingExtensions
{
    public static TaskItem ToTaskItem(this CreateTaskDto request) =>
        new()
        {
            Title = request.Title.Trim(),
            Description = NormalizeDescription(request.Description),
            Priority = ParsePriority(request.Priority),
            Status = TaskStatusType.Pending,
            DueDate = request.DueDate?.Date,
            CreatedAt = DateTime.UtcNow
        };

    public static void ApplyUpdate(this TaskItem task, UpdateTaskDto request)
    {
        task.Title = request.Title.Trim();
        task.Description = NormalizeDescription(request.Description);
        task.Priority = ParsePriority(request.Priority);
        task.DueDate = request.DueDate?.Date;
        task.UpdatedAt = DateTime.UtcNow;
    }

    public static TaskResponseDto ToTaskResponseDto(this TaskItem task) =>
        new()
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status.ToString(),
            Priority = task.Priority.ToString(),
            DueDate = task.DueDate?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        };

    private static TaskPriority ParsePriority(string priority) =>
        Enum.Parse<TaskPriority>(priority, true);

    private static string? NormalizeDescription(string? description) =>
        string.IsNullOrWhiteSpace(description) ? null : description.Trim();
}
