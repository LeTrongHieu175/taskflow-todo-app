import { memo } from 'react';
import { formatDateTime, formatDisplayDate } from '../utils/dateFormat';
import { getTaskDueState } from '../utils/taskDue';
import type { TaskItem } from '../types/task';

interface TaskCardProps {
  task: TaskItem;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  onToggle: (task: TaskItem) => void;
}

function getPriorityTone(priority: TaskItem['priority']): string {
  switch (priority) {
    case 'High':
      return 'badge badge-priority-high';
    case 'Medium':
      return 'badge badge-priority-medium';
    default:
      return 'badge badge-priority-low';
  }
}

function TaskCardComponent({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
  const dueState = getTaskDueState(task);

  const dueBadge = (() => {
    switch (dueState) {
      case 'completed':
        return <span className="badge badge-due-completed">Completed</span>;
      case 'overdue':
        return <span className="badge badge-due-overdue">Overdue</span>;
      case 'today':
        return <span className="badge badge-due-today">Due Today</span>;
      case 'upcoming':
        return <span className="badge badge-due-upcoming">Upcoming</span>;
      default:
        return null;
    }
  })();

  return (
    <article className={`task-card ${task.status === 'Completed' ? 'task-card-completed' : ''}`}>
      <div className="task-card-main">
        <div className="task-card-row">
          <label className="task-toggle">
            <input
              type="checkbox"
              checked={task.status === 'Completed'}
              onChange={() => onToggle(task)}
            />
            <span className="task-toggle-indicator" />
          </label>
          <div className="task-copy">
            <div className="task-card-row task-card-row-top">
              <h3 className="task-title">{task.title}</h3>
              <div className="task-badges">
                {dueBadge}
                <span className={getPriorityTone(task.priority)}>{task.priority}</span>
                <span className={`badge ${task.status === 'Completed' ? 'badge-status-done' : 'badge-status-pending'}`}>
                  {task.status}
                </span>
              </div>
            </div>
            <p className="task-description">
              {task.description || 'No description provided for this task yet.'}
            </p>
          </div>
        </div>

        <div className="task-meta">
          <span>Due: {formatDisplayDate(task.dueDate)}</span>
          <span>Created: {formatDateTime(task.createdAt)}</span>
        </div>
      </div>

      <div className="task-actions">
        <button type="button" className="secondary-button" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button type="button" className="danger-button" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </article>
  );
}

export const TaskCard = memo(TaskCardComponent);
