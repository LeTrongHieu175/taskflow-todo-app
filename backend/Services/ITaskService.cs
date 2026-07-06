using TaskFlow.Api.Common;
using TaskFlow.Api.DTOs;

namespace TaskFlow.Api.Services;

public interface ITaskService
{
    Task<PaginatedResponse<TaskResponseDto>> GetTasksAsync(TaskQueryDto query, CancellationToken cancellationToken = default);

    Task<TaskResponseDto> GetTaskByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<TaskResponseDto> CreateTaskAsync(CreateTaskDto request, CancellationToken cancellationToken = default);

    Task<TaskResponseDto> UpdateTaskAsync(int id, UpdateTaskDto request, CancellationToken cancellationToken = default);

    Task<TaskResponseDto> ToggleTaskStatusAsync(int id, CancellationToken cancellationToken = default);

    Task DeleteTaskAsync(int id, CancellationToken cancellationToken = default);
}
