export type TaskStatus = 'Pending' | 'Completed';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskSortBy = 'newest' | 'oldest' | 'dueDate' | 'priority';

export type TaskDueFilter = 'today' | 'overdue' | 'upcoming';

export type TaskQuickFilter = 'all' | 'today' | 'overdue' | 'highPriority' | 'completed';

export interface TaskItem {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface TaskSummary {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
}

export interface PaginatedTaskData {
  items: TaskItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  summary: TaskSummary;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface TaskQueryParams {
  search: string;
  status: 'All' | TaskStatus;
  priority: 'All' | TaskPriority;
  due?: TaskDueFilter;
  sortBy: TaskSortBy;
  page: number;
  pageSize: number;
}

export interface TaskFormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
}

export interface TaskMutationPayload {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export type FieldErrors = Partial<Record<'title' | 'description', string>>;
