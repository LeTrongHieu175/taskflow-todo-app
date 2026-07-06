export function formatDisplayDate(dateValue: string | null): string {
  if (!dateValue) {
    return 'No due date';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(`${dateValue}T00:00:00`));
}

export function formatDateTime(dateValue: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateValue));
}
