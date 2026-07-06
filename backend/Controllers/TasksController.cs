using Microsoft.AspNetCore.Mvc;
using TaskFlow.Api.Common;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Services;

namespace TaskFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class TasksController(ITaskService taskService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<TaskResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<PaginatedResponse<TaskResponseDto>>>> GetTasks(
        [FromQuery] TaskQueryDto query,
        CancellationToken cancellationToken)
    {
        var tasks = await taskService.GetTasksAsync(query, cancellationToken);
        return Ok(ApiResponse<PaginatedResponse<TaskResponseDto>>.SuccessResponse(tasks, "Tasks retrieved successfully"));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<TaskResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<TaskResponseDto>>> GetTaskById(int id, CancellationToken cancellationToken)
    {
        var task = await taskService.GetTaskByIdAsync(id, cancellationToken);
        return Ok(ApiResponse<TaskResponseDto>.SuccessResponse(task, "Task retrieved successfully"));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<TaskResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<TaskResponseDto>>> CreateTask(
        [FromBody] CreateTaskDto request,
        CancellationToken cancellationToken)
    {
        var task = await taskService.CreateTaskAsync(request, cancellationToken);
        return CreatedAtAction(
            nameof(GetTaskById),
            new { id = task.Id },
            ApiResponse<TaskResponseDto>.SuccessResponse(task, "Task created successfully"));
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<TaskResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<TaskResponseDto>>> UpdateTask(
        int id,
        [FromBody] UpdateTaskDto request,
        CancellationToken cancellationToken)
    {
        var task = await taskService.UpdateTaskAsync(id, request, cancellationToken);
        return Ok(ApiResponse<TaskResponseDto>.SuccessResponse(task, "Task updated successfully"));
    }

    [HttpPatch("{id:int}/toggle")]
    [ProducesResponseType(typeof(ApiResponse<TaskResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<TaskResponseDto>>> ToggleStatus(int id, CancellationToken cancellationToken)
    {
        var task = await taskService.ToggleTaskStatusAsync(id, cancellationToken);
        return Ok(ApiResponse<TaskResponseDto>.SuccessResponse(task, "Task status updated successfully"));
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> DeleteTask(int id, CancellationToken cancellationToken)
    {
        await taskService.DeleteTaskAsync(id, cancellationToken);
        return Ok(ApiResponse<object>.SuccessResponse(null, "Task deleted successfully"));
    }
}
