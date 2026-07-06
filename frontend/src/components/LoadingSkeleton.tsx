export function LoadingSkeleton() {
  return (
    <div className="task-list">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="task-card skeleton-card">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
          <div className="skeleton skeleton-meta" />
        </div>
      ))}
    </div>
  );
}
