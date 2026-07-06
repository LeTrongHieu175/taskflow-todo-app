import type { TaskItem } from '../types/task';

export type TaskDueState = 'none' | 'completed' | 'overdue' | 'today' | 'upcoming';

export function getTodayDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getTaskDueState(task: TaskItem, today = getTodayDateString()): TaskDueState {
  if (task.status === 'Completed') {
    return 'completed';
  }

  if (!task.dueDate) {
    return 'none';
  }

  if (task.dueDate < today) {
    return 'overdue';
  }

  if (task.dueDate === today) {
    return 'today';
  }

  return 'upcoming';
}
