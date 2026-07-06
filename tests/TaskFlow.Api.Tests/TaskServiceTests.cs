using TaskFlow.Api.Common;
using TaskFlow.Api.Data;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Models;
using TaskFlow.Api.Services;
using TaskFlow.Api.Tests.Helpers;
using TaskStatusType = TaskFlow.Api.Models.TaskStatus;

namespace TaskFlow.Api.Tests;

public sealed class TaskServiceTests
{
    [Fact]
    public async Task CreateTaskAsync_ShouldCreateTaskSuccessfully()
    {
        await using var fixture = await CreateFixtureAsync();
        var service = new TaskService(fixture.Context);

        var result = await service.CreateTaskAsync(new CreateTaskDto
        {
            Title = "  Prepare final submission  ",
            Description = "Write recruiter note",
            Priority = "High",
            DueDate = new DateTime(2026, 7, 10)
        });

        Assert.True(result.Id > 0);
        Assert.Equal("Prepare final submission", result.Title);
        Assert.Equal("Pending", result.Status);
        Assert.Equal("High", result.Priority);
        Assert.Equal("2026-07-10", result.DueDate);
    }

    [Fact]
    public async Task CreateTaskAsync_ShouldFailWhenTitleIsWhitespace()
    {
        await using var fixture = await CreateFixtureAsync();
        var service = new TaskService(fixture.Context);

        var exception = await Assert.ThrowsAsync<RequestValidationException>(() =>
            service.CreateTaskAsync(new CreateTaskDto
            {
                Title = "   ",
                Priority = "Low"
            }));

        Assert.Equal("Validation failed", exception.Message);
        Assert.Contains("title", exception.Errors.Keys);
    }

    [Fact]
    public async Task UpdateTaskAsync_ShouldThrowWhenTaskDoesNotExist()
    {
        await using var fixture = await CreateFixtureAsync();
        var service = new TaskService(fixture.Context);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.UpdateTaskAsync(999, new UpdateTaskDto
            {
                Title = "Update missing task",
                Priority = "Medium"
            }));
    }

    [Fact]
    public async Task ToggleTaskStatusAsync_ShouldSwitchBetweenPendingAndCompleted()
    {
        await using var fixture = await CreateFixtureAsync();
        var createdTask = await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.Medium, "Toggle me");
        var service = new TaskService(fixture.Context);

        var firstToggle = await service.ToggleTaskStatusAsync(createdTask.Id);
        var secondToggle = await service.ToggleTaskStatusAsync(createdTask.Id);

        Assert.Equal("Completed", firstToggle.Status);
        Assert.Equal("Pending", secondToggle.Status);
    }

    [Fact]
    public async Task GetTasksAsync_ShouldFilterByStatus()
    {
        await using var fixture = await CreateFixtureAsync();
        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.Low, "Pending task");
        await SeedTaskAsync(fixture.Context, TaskStatusType.Completed, TaskPriority.High, "Completed task");
        var service = new TaskService(fixture.Context);

        var result = await service.GetTasksAsync(new TaskQueryDto
        {
            Status = "Completed",
            Page = 1,
            PageSize = 10
        });

        Assert.Single(result.Items);
        Assert.Equal("Completed", result.Items.Single().Status);
    }

    [Fact]
    public async Task GetTasksAsync_ShouldSortByPriorityThenCreatedAt()
    {
        await using var fixture = await CreateFixtureAsync();
        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.Low, "Low task", DateTime.UtcNow.AddMinutes(-3));
        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.High, "High task old", DateTime.UtcNow.AddMinutes(-2));
        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.High, "High task new", DateTime.UtcNow.AddMinutes(-1));
        var service = new TaskService(fixture.Context);

        var result = await service.GetTasksAsync(new TaskQueryDto
        {
            SortBy = "priority",
            Page = 1,
            PageSize = 10
        });

        Assert.Equal("High task new", result.Items.First().Title);
        Assert.Equal("Low task", result.Items.Last().Title);
    }

    [Fact]
    public async Task GetTasksAsync_ShouldPaginateResults()
    {
        await using var fixture = await CreateFixtureAsync();
        for (var index = 1; index <= 12; index++)
        {
            await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.Medium, $"Task {index}", DateTime.UtcNow.AddMinutes(index));
        }

        var service = new TaskService(fixture.Context);
        var result = await service.GetTasksAsync(new TaskQueryDto
        {
            SortBy = "oldest",
            Page = 2,
            PageSize = 5
        });

        Assert.Equal(5, result.Items.Count);
        Assert.Equal(12, result.TotalItems);
        Assert.Equal(3, result.TotalPages);
        Assert.Equal("Task 6", result.Items.First().Title);
    }

    [Fact]
    public async Task GetTasksAsync_ShouldReturnExpandedGlobalSummary()
    {
        await using var fixture = await CreateFixtureAsync();
        var today = DateTime.Today;

        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.High, "Overdue high", dueDate: today.AddDays(-1));
        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.Medium, "Due today", dueDate: today);
        await SeedTaskAsync(fixture.Context, TaskStatusType.Completed, TaskPriority.High, "Completed high", dueDate: today.AddDays(-2));
        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.Low, "Future task", dueDate: today.AddDays(3));

        var service = new TaskService(fixture.Context);
        var result = await service.GetTasksAsync(new TaskQueryDto { Page = 1, PageSize = 10 });

        Assert.Equal(4, result.Summary.TotalTasks);
        Assert.Equal(3, result.Summary.PendingTasks);
        Assert.Equal(1, result.Summary.CompletedTasks);
        Assert.Equal(2, result.Summary.HighPriorityTasks);
        Assert.Equal(1, result.Summary.OverdueTasks);
        Assert.Equal(1, result.Summary.DueTodayTasks);
    }

    [Fact]
    public async Task GetTasksAsync_ShouldFilterDueTodayTasks()
    {
        await using var fixture = await CreateFixtureAsync();
        var today = DateTime.Today;

        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.Medium, "Today task", dueDate: today);
        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.Medium, "Overdue task", dueDate: today.AddDays(-1));
        await SeedTaskAsync(fixture.Context, TaskStatusType.Completed, TaskPriority.Medium, "Completed today", dueDate: today);
        var service = new TaskService(fixture.Context);

        var result = await service.GetTasksAsync(new TaskQueryDto
        {
            Due = "today",
            Page = 1,
            PageSize = 10
        });

        Assert.Single(result.Items);
        Assert.Equal("Today task", result.Items.Single().Title);
    }

    [Fact]
    public async Task GetTasksAsync_ShouldFilterOverdueTasks()
    {
        await using var fixture = await CreateFixtureAsync();
        var today = DateTime.Today;

        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.Medium, "Overdue task", dueDate: today.AddDays(-2));
        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.Medium, "Future task", dueDate: today.AddDays(2));
        await SeedTaskAsync(fixture.Context, TaskStatusType.Completed, TaskPriority.Medium, "Completed overdue", dueDate: today.AddDays(-3));
        var service = new TaskService(fixture.Context);

        var result = await service.GetTasksAsync(new TaskQueryDto
        {
            Due = "overdue",
            Page = 1,
            PageSize = 10
        });

        Assert.Single(result.Items);
        Assert.Equal("Overdue task", result.Items.Single().Title);
    }

    [Fact]
    public async Task GetTasksAsync_ShouldFilterUpcomingTasks()
    {
        await using var fixture = await CreateFixtureAsync();
        var today = DateTime.Today;

        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.High, "Upcoming one", dueDate: today.AddDays(1));
        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.Low, "Upcoming two", dueDate: today.AddDays(4));
        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.Medium, "Due today", dueDate: today);
        var service = new TaskService(fixture.Context);

        var result = await service.GetTasksAsync(new TaskQueryDto
        {
            Due = "upcoming",
            SortBy = "oldest",
            Page = 1,
            PageSize = 10
        });

        Assert.Equal(2, result.Items.Count);
        Assert.All(result.Items, item => Assert.Contains("Upcoming", item.Title));
    }

    [Fact]
    public async Task GetTasksAsync_ShouldKeepSummaryGlobalWhenListIsFiltered()
    {
        await using var fixture = await CreateFixtureAsync();
        var today = DateTime.Today;

        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.High, "Today high", dueDate: today);
        await SeedTaskAsync(fixture.Context, TaskStatusType.Pending, TaskPriority.Low, "Overdue low", dueDate: today.AddDays(-1));
        await SeedTaskAsync(fixture.Context, TaskStatusType.Completed, TaskPriority.Medium, "Completed task", dueDate: today.AddDays(-2));
        var service = new TaskService(fixture.Context);

        var result = await service.GetTasksAsync(new TaskQueryDto
        {
            Due = "today",
            Page = 1,
            PageSize = 10
        });

        Assert.Single(result.Items);
        Assert.Equal(3, result.Summary.TotalTasks);
        Assert.Equal(1, result.Summary.OverdueTasks);
        Assert.Equal(1, result.Summary.DueTodayTasks);
        Assert.Equal(1, result.Summary.CompletedTasks);
    }

    private static async Task<TestFixture> CreateFixtureAsync()
    {
        var (context, connection) = await TestDbContextFactory.CreateAsync();
        return new TestFixture(context, connection);
    }

    private static async Task<TaskItem> SeedTaskAsync(
        AppDbContext context,
        TaskStatusType status,
        TaskPriority priority,
        string title,
        DateTime? createdAt = null,
        DateTime? dueDate = null)
    {
        var task = new TaskItem
        {
            Title = title,
            Description = $"{title} description",
            Status = status,
            Priority = priority,
            DueDate = dueDate?.Date,
            CreatedAt = createdAt ?? DateTime.UtcNow
        };

        await context.Tasks.AddAsync(task);
        await context.SaveChangesAsync();
        return task;
    }

    private sealed class TestFixture(AppDbContext context, Microsoft.Data.Sqlite.SqliteConnection connection) : IAsyncDisposable
    {
        public AppDbContext Context { get; } = context;

        public Microsoft.Data.Sqlite.SqliteConnection Connection { get; } = connection;

        public async ValueTask DisposeAsync()
        {
            await Context.DisposeAsync();
            await Connection.DisposeAsync();
        }
    }
}
