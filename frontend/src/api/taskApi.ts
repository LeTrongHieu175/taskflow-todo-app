import type {
  ApiResponse,
  PaginatedTaskData,
  TaskItem,
  TaskMutationPayload,
  TaskQueryParams,
} from '../types/task';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  });

  const isJsonResponse = response.headers.get('content-type')?.includes('application/json');
  const payload = isJsonResponse ? (await response.json()) as ApiResponse<T> : null;

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.message ?? 'Unexpected API error.',
      response.status,
      payload?.errors,
    );
  }

  return payload.data;
}

function buildTaskQuery(params: TaskQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.search.trim()) {
    searchParams.set('search', params.search.trim());
  }

  if (params.status !== 'All') {
    searchParams.set('status', params.status);
  }

  if (params.priority !== 'All') {
    searchParams.set('priority', params.priority);
  }

  if (params.due) {
    searchParams.set('due', params.due);
  }

  searchParams.set('sortBy', params.sortBy);
  searchParams.set('page', String(params.page));
  searchParams.set('pageSize', String(params.pageSize));

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

function normalizePayload(payload: TaskMutationPayload): TaskMutationPayload {
  return {
    title: payload.title.trim(),
    description: payload.description?.trim() ? payload.description.trim() : undefined,
    priority: payload.priority,
    dueDate: payload.dueDate || undefined,
  };
}

export function getTasks(params: TaskQueryParams, signal?: AbortSignal): Promise<PaginatedTaskData> {
  return request<PaginatedTaskData>(`/tasks${buildTaskQuery(params)}`, { signal });
}

export function createTask(payload: TaskMutationPayload): Promise<TaskItem> {
  return request<TaskItem>('/tasks', {
    method: 'POST',
    body: JSON.stringify(normalizePayload(payload)),
  });
}

export function updateTask(taskId: number, payload: TaskMutationPayload): Promise<TaskItem> {
  return request<TaskItem>(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(normalizePayload(payload)),
  });
}

export function toggleTask(taskId: number): Promise<TaskItem> {
  return request<TaskItem>(`/tasks/${taskId}/toggle`, {
    method: 'PATCH',
  });
}

export function deleteTask(taskId: number): Promise<void> {
  return request<null>(`/tasks/${taskId}`, {
    method: 'DELETE',
  }).then(() => undefined);
}
