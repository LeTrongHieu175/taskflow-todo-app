import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../api/taskApi';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Pagination } from '../components/Pagination';
import { TaskCard } from '../components/TaskCard';
import { TaskFilter } from '../components/TaskFilter';
import { TaskForm } from '../components/TaskForm';
import { Toast } from '../components/Toast';
import { useTasks } from '../hooks/useTasks';
import type { TaskFormValues, TaskItem, TaskQuickFilter, ToastMessage } from '../types/task';

interface EmptyStateContent {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function getEmptyStateContent(
  totalTasks: number,
  activeQuickFilter: TaskQuickFilter,
  hasActiveFilters: boolean,
  onCreateTask: () => void,
  onClearFilters: () => void,
): EmptyStateContent {
  if (totalTasks === 0) {
    return {
      icon: '✦',
      title: 'Your task list is empty',
      description: 'Create your first task to start organizing your day.',
      actionLabel: 'Add your first task',
      onAction: onCreateTask,
    };
  }

  switch (activeQuickFilter) {
    case 'overdue':
      return {
        icon: '✓',
        title: 'Great! You have no overdue tasks.',
        description: 'Everything due so far is under control. Keep the momentum going.',
        actionLabel: 'View all tasks',
        onAction: onClearFilters,
      };
    case 'completed':
      return {
        icon: '◎',
        title: 'No completed tasks yet.',
        description: 'Complete a task to track your progress.',
        actionLabel: 'View all tasks',
        onAction: onClearFilters,
      };
    case 'today':
      return {
        icon: '☼',
        title: 'No tasks due today.',
        description: 'You can plan ahead or create a new task.',
        actionLabel: 'Create a task',
        onAction: onCreateTask,
      };
    default:
      if (hasActiveFilters) {
        return {
          icon: '⌕',
          title: 'No matching tasks found.',
          description: 'Try another keyword or clear filters.',
          actionLabel: 'Clear filters',
          onAction: onClearFilters,
        };
      }

      return {
        icon: '○',
        title: 'No tasks found.',
        description: 'Create a task to start building your workflow.',
        actionLabel: 'Add task',
        onAction: onCreateTask,
      };
  }
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

export function TaskPage() {
  const {
    tasks,
    summary,
    pagination,
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
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskPendingDeletion, setTaskPendingDeletion] = useState<TaskItem | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type']) => {
    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id: crypto.randomUUID(),
        message,
        type,
      },
    ]);
  }, []);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
  }, []);

  useEffect(() => {
    if (error) {
      addToast(error, 'error');
    }
  }, [addToast, error]);

  const openCreateForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEdit = (task: TaskItem) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (values: TaskFormValues) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, values);
        addToast('Task updated successfully.', 'success');
      } else {
        await createTask(values);
        addToast('Task created successfully.', 'success');
      }

      setIsFormOpen(false);
      setEditingTask(null);
    } catch (submitError) {
      const message = getErrorMessage(submitError);
      addToast(message, 'error');
      throw submitError;
    }
  };

  const handleDelete = async () => {
    if (!taskPendingDeletion) {
      return;
    }

    try {
      await deleteTask(taskPendingDeletion.id);
      addToast('Task deleted successfully.', 'success');
      setTaskPendingDeletion(null);
    } catch (deleteError) {
      addToast(getErrorMessage(deleteError), 'error');
    }
  };

  const handleToggle = async (task: TaskItem) => {
    try {
      const updatedTask = await toggleTaskStatus(task);
      addToast(
        updatedTask.status === 'Completed'
          ? 'Task marked as completed.'
          : 'Task moved back to pending.',
        'success',
      );
    } catch (toggleError) {
      addToast(getErrorMessage(toggleError), 'error');
    }
  };

  const hasActiveFilters =
    query.search.trim() !== '' ||
    query.status !== 'All' ||
    query.priority !== 'All' ||
    query.due !== undefined ||
    query.sortBy !== 'newest';

  const completionRate = summary.totalTasks === 0
    ? 0
    : Math.round((summary.completedTasks / summary.totalTasks) * 100);

  const statCards = [
    { label: 'Total Tasks', value: summary.totalTasks, accentClass: 'stat-card-total', icon: '◫' },
    { label: 'Pending Tasks', value: summary.pendingTasks, accentClass: 'stat-card-pending', icon: '◔' },
    { label: 'Completed Tasks', value: summary.completedTasks, accentClass: 'stat-card-completed', icon: '✓' },
    { label: 'High Priority Tasks', value: summary.highPriorityTasks, accentClass: 'stat-card-high', icon: '!' },
    { label: 'Overdue Tasks', value: summary.overdueTasks, accentClass: 'stat-card-overdue', icon: '⏱' },
    { label: 'Due Today Tasks', value: summary.dueTodayTasks, accentClass: 'stat-card-today', icon: '☼' },
  ];

  const currentDateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const emptyStateContent = getEmptyStateContent(
    summary.totalTasks,
    activeQuickFilter,
    hasActiveFilters,
    openCreateForm,
    resetFilters,
  );

  return (
    <div className="app-shell">
      <div className="background-orb background-orb-left" />
      <div className="background-orb background-orb-right" />

      <main className="page">
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-topline">
              <span className="hero-badge">Personal Productivity Dashboard</span>
              <span className="hero-date">{currentDateLabel}</span>
            </div>
            <p className="eyebrow">Daily command center</p>
            <h1>TaskFlow</h1>
            <p className="hero-description">
              Organize your tasks with clarity, priority, and flow.
            </p>
          </div>

          <div className="hero-side">
            <div className="stats-grid">
              {statCards.map((card) => (
                <article key={card.label} className={`stat-card ${card.accentClass}`}>
                  <span className="stat-icon" aria-hidden="true">{card.icon}</span>
                  <strong>{card.value}</strong>
                  <span>{card.label}</span>
                </article>
              ))}
            </div>

            <article className="progress-card">
              <div className="progress-copy">
                <p className="eyebrow">Progress</p>
                <h2>{summary.completedTasks} of {summary.totalTasks} tasks completed</h2>
                <p>{completionRate}% complete</p>
              </div>
              <div className="progress-track" aria-label="Task completion progress">
                <div className="progress-fill" style={{ width: `${completionRate}%` }} />
              </div>
            </article>
          </div>
        </section>

        <TaskFilter
          search={query.search}
          status={query.status}
          priority={query.priority}
          sortBy={query.sortBy}
          activeQuickFilter={activeQuickFilter}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onPriorityChange={setPriority}
          onSortChange={setSortBy}
          onQuickFilterChange={setQuickFilter}
          onAddTask={openCreateForm}
        />

        <section className="task-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Task list</p>
              <h2>Keep work visible and actionable</h2>
              <p className="section-subcopy">Review priorities, due dates, and progress without losing focus.</p>
            </div>
            <button type="button" className="secondary-button" onClick={() => void refresh()}>
              Refresh
            </button>
          </div>

          {isLoading ? <LoadingSkeleton /> : null}

          {!isLoading && tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" aria-hidden="true">{emptyStateContent.icon}</div>
              <h3>{emptyStateContent.title}</h3>
              <p>{emptyStateContent.description}</p>
              {emptyStateContent.actionLabel && emptyStateContent.onAction ? (
                <button
                  type="button"
                  className={summary.totalTasks === 0 ? 'primary-button' : 'secondary-button'}
                  onClick={emptyStateContent.onAction}
                >
                  {emptyStateContent.actionLabel}
                </button>
              ) : null}
            </div>
          ) : null}

          {!isLoading && tasks.length > 0 ? (
            <>
              <div className="task-list">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEdit}
                    onDelete={setTaskPendingDeletion}
                    onToggle={handleToggle}
                  />
                ))}
              </div>

              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                pageSize={pagination.pageSize}
                onPageChange={setPage}
              />
            </>
          ) : null}
        </section>
      </main>

      <TaskForm
        isOpen={isFormOpen}
        task={editingTask}
        isSubmitting={isSubmitting}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmitForm}
      />

      <ConfirmDialog
        isOpen={taskPendingDeletion !== null}
        title="Delete this task?"
        description={`"${taskPendingDeletion?.title ?? ''}" will be permanently removed from TaskFlow.`}
        isLoading={isSubmitting}
        onCancel={() => setTaskPendingDeletion(null)}
        onConfirm={handleDelete}
      />

      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={dismissToast} />
        ))}
      </div>
    </div>
  );
}
