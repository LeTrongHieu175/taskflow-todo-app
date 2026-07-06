import type { TaskPriority, TaskQuickFilter, TaskSortBy, TaskStatus } from '../types/task';

interface TaskFilterProps {
  search: string;
  status: 'All' | TaskStatus;
  priority: 'All' | TaskPriority;
  sortBy: TaskSortBy;
  activeQuickFilter: TaskQuickFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: 'All' | TaskStatus) => void;
  onPriorityChange: (value: 'All' | TaskPriority) => void;
  onSortChange: (value: TaskSortBy) => void;
  onQuickFilterChange: (value: TaskQuickFilter) => void;
  onAddTask: () => void;
}

const QUICK_FILTER_OPTIONS: Array<{ value: TaskQuickFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'highPriority', label: 'High Priority' },
  { value: 'completed', label: 'Completed' },
];

export function TaskFilter({
  search,
  status,
  priority,
  sortBy,
  activeQuickFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onSortChange,
  onQuickFilterChange,
  onAddTask,
}: TaskFilterProps) {
  return (
    <section className="filter-panel">
      <div className="filter-panel-copy">
        <p className="eyebrow">Task controls</p>
        <h2>Search, filter, and prioritize your work</h2>
      </div>

      <div className="quick-filter-row" aria-label="Quick filters">
        {QUICK_FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`quick-filter-chip ${activeQuickFilter === option.value ? 'quick-filter-chip-active' : ''}`}
            aria-pressed={activeQuickFilter === option.value}
            onClick={() => onQuickFilterChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="filter-grid">
        <label className="field">
          <span>Search</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search title or description..."
          />
        </label>

        <label className="field">
          <span>Status</span>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as 'All' | TaskStatus)}
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </label>

        <label className="field">
          <span>Priority</span>
          <select
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value as 'All' | TaskPriority)}
          >
            <option value="All">All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>

        <label className="field">
          <span>Sort by</span>
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as TaskSortBy)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </label>

        <div className="filter-action">
          <button type="button" className="primary-button add-task-button" onClick={onAddTask}>
            Add Task
          </button>
        </div>
      </div>
    </section>
  );
}
