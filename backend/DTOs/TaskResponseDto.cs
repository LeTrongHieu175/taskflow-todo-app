namespace TaskFlow.Api.DTOs;

public sealed class TaskResponseDto
{
    public int Id { get; init; }

    public string Title { get; init; } = string.Empty;

    public string? Description { get; init; }

    public string Status { get; init; } = string.Empty;

    public string Priority { get; init; } = string.Empty;

    public string? DueDate { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
