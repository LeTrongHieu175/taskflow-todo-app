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
  const activityDate = task.updatedAt ? `Updated: ${formatDateTime(task.updatedAt)}` : `Created: ${formatDateTime(task.createdAt)}`;

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
      <label className="task-toggle">
        <input
          type="checkbox"
          checked={task.status === 'Completed'}
          onChange={() => onToggle(task)}
          aria-label={task.status === 'Completed' ? `Mark ${task.title} as pending` : `Mark ${task.title} as completed`}
        />
        <span className="task-toggle-indicator" />
      </label>

      <div className="task-card-main">
        <div className="task-card-head">
          <div className="task-copy">
            <div className="task-badges">
              <span className={getPriorityTone(task.priority)}>{task.priority}</span>
              <span className={`badge ${task.status === 'Completed' ? 'badge-status-done' : 'badge-status-pending'}`}>
                {task.status}
              </span>
              {dueBadge}
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
        </div>

        <div className="task-card-body">
          <h3 className="task-title">{task.title}</h3>
          <p className="task-description">
            {task.description || 'No description provided for this task yet.'}
          </p>
        </div>

        <div className="task-meta">
          <span className={`meta-pill ${task.dueDate ? '' : 'meta-pill-quiet'}`}>
            Due: {formatDisplayDate(task.dueDate)}
          </span>
          <span className="meta-pill">{activityDate}</span>
        </div>
      </div>
    </article>
  );
}

export const TaskCard = memo(TaskCardComponent);
