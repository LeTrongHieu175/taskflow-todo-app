using System.ComponentModel.DataAnnotations;
using TaskFlow.Api.Models;

namespace TaskFlow.Api.DTOs;

public sealed class CreateTaskDto : IValidatableObject
{
    public string Title { get; init; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Description must not exceed 500 characters.")]
    public string? Description { get; init; }

    public string Priority { get; init; } = TaskPriority.Medium.ToString();

    public DateTime? DueDate { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var title = Title?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(title))
        {
            yield return new ValidationResult("Title is required.", [nameof(Title)]);
        }
        else if (title.Length < 3 || title.Length > 100)
        {
            yield return new ValidationResult("Title must be between 3 and 100 characters.", [nameof(Title)]);
        }

        if (!Enum.TryParse<TaskPriority>(Priority, true, out _))
        {
            yield return new ValidationResult("Priority must be Low, Medium, or High.", [nameof(Priority)]);
        }
    }
}
