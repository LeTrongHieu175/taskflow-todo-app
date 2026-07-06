import { useCallback, useEffect, useState } from 'react';
import {
  ApiError,
  createTask,
  deleteTask,
  getTasks,
  toggleTask,
  updateTask,
} from '../api/taskApi';
import { useDebounce } from './useDebounce';
import type {
  PaginatedTaskData,
  TaskFormValues,
  TaskItem,
  TaskPriority,
  TaskQueryParams,
  TaskQuickFilter,
  TaskSortBy,
  TaskStatus,
  TaskSummary,
} from '../types/task';

const DEFAULT_SUMMARY: TaskSummary = {
  totalTasks: 0,
  pendingTasks: 0,
  completedTasks: 0,
  highPriorityTasks: 0,
  overdueTasks: 0,
  dueTodayTasks: 0,
};

const DEFAULT_DATA: PaginatedTaskData = {
  items: [],
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  summary: DEFAULT_SUMMARY,
};

const DEFAULT_QUERY: TaskQueryParams = {
  search: '',
  status: 'All',
  priority: 'All',
  due: undefined,
  sortBy: 'newest',
  page: 1,
  pageSize: 10,
};

const QUICK_FILTER_DEFAULTS: Record<TaskQuickFilter, Partial<TaskQueryParams>> = {
  all: {},
  today: { due: 'today' },
  overdue: { due: 'overdue' },
  highPriority: { priority: 'High' },
  completed: { status: 'Completed' },
};

function getQuickFilterReset(activeQuickFilter: TaskQuickFilter): Partial<TaskQueryParams> {
  switch (activeQuickFilter) {
    case 'today':
    case 'overdue':
      return { due: undefined };
    case 'highPriority':
      return { priority: 'All' };
    case 'completed':
      return { status: 'All' };
    default:
      return {};
  }
}

function toMutationPayload(values: TaskFormValues) {
  return {
    title: values.title,
    description: values.description,
    priority: values.priority,
    dueDate: values.dueDate,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error occurred.';
}

export function useTasks() {
  const [query, setQuery] = useState<TaskQueryParams>(DEFAULT_QUERY);
  const [data, setData] = useState<PaginatedTaskData>(DEFAULT_DATA);
  const [activeQuickFilter, setActiveQuickFilter] = useState<TaskQuickFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(query.search, 300);

  const fetchTasks = useCallback(
    async (overrides?: Partial<TaskQueryParams>) => {
      const nextQuery: TaskQueryParams = {
        ...query,
        search: debouncedSearch,
        ...overrides,
      };

      setIsLoading(true);
      setError(null);

      try {
        const response = await getTasks(nextQuery);

        if (response.totalItems === 0 && nextQuery.page > 1) {
          setQuery((currentQuery) => ({
            ...currentQuery,
            page: 1,
          }));
          return;
        }

        if (response.totalPages > 0 && nextQuery.page > response.totalPages) {
          setQuery((currentQuery) => ({
            ...currentQuery,
            page: response.totalPages,
          }));
          return;
        }

        setData(response);
      } catch (fetchError) {
        setError(getErrorMessage(fetchError));
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearch, query],
  );

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const setSearch = useCallback((search: string) => {
    setQuery((currentQuery) => ({
      ...currentQuery,
      search,
      page: 1,
    }));
  }, []);

  const setStatus = useCallback((status: 'All' | TaskStatus) => {
    setActiveQuickFilter((currentQuickFilter) =>
      currentQuickFilter === 'completed' && status !== 'Completed' ? 'all' : currentQuickFilter,
    );
    setQuery((currentQuery) => ({
      ...currentQuery,
      status,
      page: 1,
    }));
  }, []);

  const setPriority = useCallback((priority: 'All' | TaskPriority) => {
    setActiveQuickFilter((currentQuickFilter) =>
      currentQuickFilter === 'highPriority' && priority !== 'High' ? 'all' : currentQuickFilter,
    );
    setQuery((currentQuery) => ({
      ...currentQuery,
      priority,
      page: 1,
    }));
  }, []);

  const setSortBy = useCallback((sortBy: TaskSortBy) => {
    setQuery((currentQuery) => ({
      ...currentQuery,
      sortBy,
      page: 1,
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((currentQuery) => ({
      ...currentQuery,
      page,
    }));
  }, []);

  const refresh = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  const setQuickFilter = useCallback((nextQuickFilter: TaskQuickFilter) => {
    setActiveQuickFilter((currentQuickFilter) => {
      setQuery((currentQuery) => {
        const resetPatch = getQuickFilterReset(currentQuickFilter);
        const nextPatch = QUICK_FILTER_DEFAULTS[nextQuickFilter];

        return {
          ...currentQuery,
          ...resetPatch,
          ...nextPatch,
          page: 1,
        };
      });

      return nextQuickFilter;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setActiveQuickFilter('all');
    setQuery((currentQuery) => ({
      ...currentQuery,
      ...DEFAULT_QUERY,
      pageSize: currentQuery.pageSize,
    }));
  }, []);

  const handleCreateTask = useCallback(async (values: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      const createdTask = await createTask(toMutationPayload(values));
      await fetchTasks({ page: 1 });
      setQuery((currentQuery) => ({
        ...currentQuery,
        page: 1,
      }));
      return createdTask;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchTasks]);

  const handleUpdateTask = useCallback(async (taskId: number, values: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      const updatedTask = await updateTask(taskId, toMutationPayload(values));
      await fetchTasks();
      return updatedTask;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchTasks]);

  const handleDeleteTask = useCallback(async (taskId: number) => {
    setIsSubmitting(true);
    try {
      await deleteTask(taskId);
      await fetchTasks();
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchTasks]);

  const handleToggleTaskStatus = useCallback(async (task: TaskItem) => {
    const nextStatus: TaskStatus = task.status === 'Pending' ? 'Completed' : 'Pending';

    setData((currentData) => ({
      ...currentData,
      items: currentData.items.map((currentTask) =>
        currentTask.id === task.id
          ? { ...currentTask, status: nextStatus }
          : currentTask,
      ),
    }));

    try {
      const updatedTask = await toggleTask(task.id);
      setData((currentData) => ({
        ...currentData,
        items: currentData.items.map((currentTask) =>
          currentTask.id === task.id ? updatedTask : currentTask,
        ),
      }));
      await fetchTasks();
      return updatedTask;
    } catch (toggleError) {
      setData((currentData) => ({
        ...currentData,
        items: currentData.items.map((currentTask) =>
          currentTask.id === task.id ? task : currentTask,
        ),
      }));
      throw toggleError;
    }
  }, [fetchTasks]);

  return {
    tasks: data.items,
    summary: data.summary,
    pagination: {
      page: data.page,
      pageSize: data.pageSize,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
    },
    query,
    activeQuickFilter,
    error,
    isLoading,
    isSubmitting,
    setSearch,
    setStatus,
    setPriority,
    setSortBy,
    setPage,
    setQuickFilter,
    resetFilters,
    refresh,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    toggleTaskStatus: handleToggleTaskStatus,
  };
}
