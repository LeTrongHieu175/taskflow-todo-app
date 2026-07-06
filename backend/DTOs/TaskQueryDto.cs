using System.ComponentModel.DataAnnotations;
using TaskFlow.Api.Models;
using TaskStatusType = TaskFlow.Api.Models.TaskStatus;

namespace TaskFlow.Api.DTOs;

public sealed class TaskQueryDto : IValidatableObject
{
    private static readonly string[] AllowedDueFilters = ["today", "overdue", "upcoming"];
    private static readonly string[] AllowedSorts = ["newest", "oldest", "dueDate", "priority"];

    public string? Search { get; init; }

    public string? Status { get; init; }

    public string? Priority { get; init; }

    public string? Due { get; init; }

    public string? SortBy { get; init; } = "newest";

    public int Page { get; init; } = 1;

    public int PageSize { get; init; } = 10;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!string.IsNullOrWhiteSpace(Status) &&
            !Status.Equals("All", StringComparison.OrdinalIgnoreCase) &&
            !Enum.TryParse<TaskStatusType>(Status, true, out _))
        {
            yield return new ValidationResult("Status must be Pending or Completed.", [nameof(Status)]);
        }

        if (!string.IsNullOrWhiteSpace(Priority) &&
            !Priority.Equals("All", StringComparison.OrdinalIgnoreCase) &&
            !Enum.TryParse<TaskPriority>(Priority, true, out _))
        {
            yield return new ValidationResult("Priority must be Low, Medium, or High.", [nameof(Priority)]);
        }

        if (!string.IsNullOrWhiteSpace(SortBy) &&
            !AllowedSorts.Contains(SortBy, StringComparer.OrdinalIgnoreCase))
        {
            yield return new ValidationResult("SortBy must be newest, oldest, dueDate, or priority.", [nameof(SortBy)]);
        }

        if (!string.IsNullOrWhiteSpace(Due) &&
            !AllowedDueFilters.Contains(Due, StringComparer.OrdinalIgnoreCase))
        {
            yield return new ValidationResult("Due must be today, overdue, or upcoming.", [nameof(Due)]);
        }

        if (Page < 1)
        {
            yield return new ValidationResult("Page must be greater than 0.", [nameof(Page)]);
        }

        if (PageSize < 1 || PageSize > 50)
        {
            yield return new ValidationResult("PageSize must be between 1 and 50.", [nameof(PageSize)]);
        }
    }
}
