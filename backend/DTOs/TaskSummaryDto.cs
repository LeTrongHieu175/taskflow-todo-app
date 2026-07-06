namespace TaskFlow.Api.DTOs;

public sealed class TaskSummaryDto
{
    public int TotalTasks { get; init; }

    public int PendingTasks { get; init; }

    public int CompletedTasks { get; init; }

    public int HighPriorityTasks { get; init; }

    public int OverdueTasks { get; init; }

    public int DueTodayTasks { get; init; }
}
