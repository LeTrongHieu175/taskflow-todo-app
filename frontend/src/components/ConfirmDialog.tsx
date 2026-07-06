interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  isLoading,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="confirm-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Confirm delete</p>
            <h2 id="confirm-title">{title}</h2>
          </div>
        </div>
        <p className="confirm-copy">{description}</p>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="danger-button" onClick={() => void onConfirm()} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete task'}
          </button>
        </div>
      </div>
    </div>
  );
}
