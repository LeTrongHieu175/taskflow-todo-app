using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Models;
using TaskStatusType = TaskFlow.Api.Models.TaskStatus;

namespace TaskFlow.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Tasks.AnyAsync())
        {
            return;
        }

        var today = DateTime.UtcNow.Date;
        var tasks = new[]
        {
            CreateTask("Prepare internship test", "Review requirements and plan TaskFlow scope.", TaskPriority.High, TaskStatusType.Pending, today.AddDays(2), today.AddDays(-4)),
            CreateTask("Build backend foundation", "Set up API, SQLite, DTOs, and service layer.", TaskPriority.High, TaskStatusType.Pending, today.AddDays(1), today.AddDays(-3)),
            CreateTask("Create responsive UI", "Implement dashboard, filters, modal form, and task cards.", TaskPriority.High, TaskStatusType.Pending, today.AddDays(3), today.AddDays(-2)),
            CreateTask("Write README", "Document setup steps and product thinking clearly.", TaskPriority.Medium, TaskStatusType.Pending, today.AddDays(4), today.AddDays(-1)),
            CreateTask("Add seed data", "Make first-run demo experience useful for reviewers.", TaskPriority.Low, TaskStatusType.Completed, today.AddDays(-1), today.AddDays(-6), today.AddDays(-2)),
            CreateTask("Test filtering behavior", "Verify search, status filter, priority filter, and sorting.", TaskPriority.Medium, TaskStatusType.Pending, today.AddDays(5), today.AddDays(-2)),
            CreateTask("Refine loading states", "Add skeletons, disabled buttons, and empty states.", TaskPriority.Medium, TaskStatusType.Completed, today.AddDays(1), today.AddDays(-5), today.AddDays(-1)),
            CreateTask("Polish mobile layout", "Adjust spacing and stacking for smaller screens.", TaskPriority.Low, TaskStatusType.Pending, null, today.AddDays(-1)),
            CreateTask("Implement delete confirmation", "Prevent accidental destructive actions.", TaskPriority.Medium, TaskStatusType.Completed, null, today.AddDays(-7), today.AddDays(-3)),
            CreateTask("Review code quality", "Clean names, remove duplication, and verify build output.", TaskPriority.High, TaskStatusType.Pending, today.AddDays(6), today)
        };

        await context.Tasks.AddRangeAsync(tasks);
        await context.SaveChangesAsync();
    }

    private static TaskItem CreateTask(
        string title,
        string description,
        TaskPriority priority,
        TaskStatusType status,
        DateTime? dueDate,
        DateTime createdAt,
        DateTime? updatedAt = null) =>
        new()
        {
            Title = title,
            Description = description,
            Priority = priority,
            Status = status,
            DueDate = dueDate?.Date,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };
}
