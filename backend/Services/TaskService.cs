using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Common;
using TaskFlow.Api.Data;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Mappings;
using TaskFlow.Api.Models;
using TaskStatusType = TaskFlow.Api.Models.TaskStatus;

namespace TaskFlow.Api.Services;

public sealed class TaskService(AppDbContext context) : ITaskService
{
    public async Task<PaginatedResponse<TaskResponseDto>> GetTasksAsync(TaskQueryDto query, CancellationToken cancellationToken = default)
    {
        var today = DateTime.Today;
        var summary = await GetSummaryAsync(today, cancellationToken);
        var tasksQuery = context.Tasks.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var searchTerm = query.Search.Trim();
            tasksQuery = tasksQuery.Where(task =>
                task.Title.Contains(searchTerm) ||
                (task.Description != null && task.Description.Contains(searchTerm)));
        }

        if (!string.IsNullOrWhiteSpace(query.Status) &&
            !query.Status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var status = Enum.Parse<TaskStatusType>(query.Status, true);
            tasksQuery = tasksQuery.Where(task => task.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(query.Priority) &&
            !query.Priority.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            var priority = Enum.Parse<TaskPriority>(query.Priority, true);
            tasksQuery = tasksQuery.Where(task => task.Priority == priority);
        }

        tasksQuery = ApplyDueFiltering(tasksQuery, query.Due, today);
        tasksQuery = ApplySorting(tasksQuery, query.SortBy);

        var totalItems = await tasksQuery.CountAsync(cancellationToken);
        var pagedTasks = await tasksQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);
        var items = pagedTasks
            .Select(task => task.ToTaskResponseDto())
            .ToList();

        return new PaginatedResponse<TaskResponseDto>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalItems = totalItems,
            TotalPages = totalItems == 0 ? 0 : (int)Math.Ceiling(totalItems / (double)query.PageSize),
            Summary = summary
        };
    }

    public async Task<TaskResponseDto> GetTaskByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var task = await context.Tasks
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (task is null)
        {
            throw new NotFoundException($"Task with id {id} was not found.");
        }

        return task.ToTaskResponseDto();
    }

    public async Task<TaskResponseDto> CreateTaskAsync(CreateTaskDto request, CancellationToken cancellationToken = default)
    {
        ValidateWhitespaceOnlyTitle(request.Title);

        var task = request.ToTaskItem();
        await context.Tasks.AddAsync(task, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return task.ToTaskResponseDto();
    }

    public async Task<TaskResponseDto> UpdateTaskAsync(int id, UpdateTaskDto request, CancellationToken cancellationToken = default)
    {
        ValidateWhitespaceOnlyTitle(request.Title);

        var task = await context.Tasks.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (task is null)
        {
            throw new NotFoundException($"Task with id {id} was not found.");
        }

        task.ApplyUpdate(request);
        await context.SaveChangesAsync(cancellationToken);

        return task.ToTaskResponseDto();
    }

    public async Task<TaskResponseDto> ToggleTaskStatusAsync(int id, CancellationToken cancellationToken = default)
    {
        var task = await context.Tasks.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (task is null)
        {
            throw new NotFoundException($"Task with id {id} was not found.");
        }

        task.Status = task.Status == TaskStatusType.Pending ? TaskStatusType.Completed : TaskStatusType.Pending;
        task.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        return task.ToTaskResponseDto();
    }

    public async Task DeleteTaskAsync(int id, CancellationToken cancellationToken = default)
    {
        var task = await context.Tasks.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (task is null)
        {
            throw new NotFoundException($"Task with id {id} was not found.");
        }

        context.Tasks.Remove(task);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task<TaskSummaryDto> GetSummaryAsync(DateTime today, CancellationToken cancellationToken)
    {
        var summaryQuery = context.Tasks.AsNoTracking();
        var totalTasks = await summaryQuery.CountAsync(cancellationToken);
        var pendingTasks = await summaryQuery.CountAsync(task => task.Status == TaskStatusType.Pending, cancellationToken);
        var completedTasks = await summaryQuery.CountAsync(task => task.Status == TaskStatusType.Completed, cancellationToken);
        var highPriorityTasks = await summaryQuery.CountAsync(task => task.Priority == TaskPriority.High, cancellationToken);
        var overdueTasks = await summaryQuery.CountAsync(
            task => task.Status != TaskStatusType.Completed && task.DueDate != null && task.DueDate < today,
            cancellationToken);
        var dueTodayTasks = await summaryQuery.CountAsync(
            task => task.Status != TaskStatusType.Completed && task.DueDate != null && task.DueDate == today,
            cancellationToken);

        return new TaskSummaryDto
        {
            TotalTasks = totalTasks,
            PendingTasks = pendingTasks,
            CompletedTasks = completedTasks,
            HighPriorityTasks = highPriorityTasks,
            OverdueTasks = overdueTasks,
            DueTodayTasks = dueTodayTasks
        };
    }

    private static IQueryable<TaskItem> ApplyDueFiltering(IQueryable<TaskItem> query, string? dueFilter, DateTime today)
    {
        return dueFilter?.Trim().ToLowerInvariant() switch
        {
            "today" => query.Where(task =>
                task.Status != TaskStatusType.Completed &&
                task.DueDate != null &&
                task.DueDate == today),
            "overdue" => query.Where(task =>
                task.Status != TaskStatusType.Completed &&
                task.DueDate != null &&
                task.DueDate < today),
            "upcoming" => query.Where(task =>
                task.Status != TaskStatusType.Completed &&
                task.DueDate != null &&
                task.DueDate > today),
            _ => query
        };
    }

    private static IQueryable<TaskItem> ApplySorting(IQueryable<TaskItem> query, string? sortBy)
    {
        return sortBy?.Trim().ToLowerInvariant() switch
        {
            "oldest" => query.OrderBy(task => task.CreatedAt),
            "duedate" => query
                .OrderBy(task => task.DueDate == null)
                .ThenBy(task => task.DueDate)
                .ThenByDescending(task => task.CreatedAt),
            "priority" => query
                .OrderByDescending(task => task.Priority == TaskPriority.High ? 3 : task.Priority == TaskPriority.Medium ? 2 : 1)
                .ThenByDescending(task => task.CreatedAt),
            _ => query.OrderByDescending(task => task.CreatedAt)
        };
    }

    private static void ValidateWhitespaceOnlyTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new RequestValidationException(
                "Validation failed",
                new Dictionary<string, string[]>
                {
                    ["title"] = ["Title is required."]
                });
        }
    }
}
