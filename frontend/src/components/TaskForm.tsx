import { useEffect, useState } from 'react';
import type { FieldErrors, TaskFormValues, TaskItem, TaskPriority } from '../types/task';

interface TaskFormProps {
  isOpen: boolean;
  task: TaskItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

const DEFAULT_VALUES: TaskFormValues = {
  title: '',
  description: '',
  priority: 'Medium',
  dueDate: '',
};

function getInitialValues(task: TaskItem | null): TaskFormValues {
  if (!task) {
    return DEFAULT_VALUES;
  }

  return {
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    dueDate: task.dueDate ?? '',
  };
}

function validate(values: TaskFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const trimmedTitle = values.title.trim();

  if (!trimmedTitle) {
    errors.title = 'Title is required.';
  } else if (trimmedTitle.length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  } else if (trimmedTitle.length > 100) {
    errors.title = 'Title must not exceed 100 characters.';
  }

  if (values.description.length > 500) {
    errors.description = 'Description must not exceed 500 characters.';
  }

  return errors;
}

export function TaskForm({ isOpen, task, isSubmitting, onClose, onSubmit }: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setValues(getInitialValues(task));
    setErrors({});
  }, [isOpen, task]);

  if (!isOpen) {
    return null;
  }

  const handleChange = <Key extends keyof TaskFormValues>(field: Key, value: TaskFormValues[Key]) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    await onSubmit(values);
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">{task ? 'Edit task' : 'New task'}</p>
            <h2 id="task-form-title">{task ? 'Update task details' : 'Create a new task'}</h2>
          </div>
          <button type="button" className="ghost-icon-button" onClick={onClose} aria-label="Close form">
            ×
          </button>
        </div>

        <form className="task-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <input
              value={values.title}
              onChange={(event) => handleChange('title', event.target.value)}
              placeholder="e.g. Ship TaskFlow README"
              maxLength={100}
            />
            {errors.title ? <small className="field-error">{errors.title}</small> : null}
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              value={values.description}
              onChange={(event) => handleChange('description', event.target.value)}
              placeholder="Add a short note, context, or checklist summary..."
              rows={5}
              maxLength={500}
            />
            <div className="field-helper-row">
              {errors.description ? <small className="field-error">{errors.description}</small> : <span />}
              <small className="field-counter">{values.description.length}/500</small>
            </div>
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Priority</span>
              <select
                value={values.priority}
                onChange={(event) => handleChange('priority', event.target.value as TaskPriority)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <label className="field">
              <span>Due date</span>
              <input
                type="date"
                value={values.dueDate}
                onChange={(event) => handleChange('dueDate', event.target.value)}
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
