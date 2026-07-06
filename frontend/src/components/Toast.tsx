import { useEffect } from 'react';
import type { ToastMessage } from '../types/task';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onClose(toast.id);
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onClose, toast.id]);

  return (
    <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
      <div>
        <strong>{toast.type === 'success' ? 'Success' : 'Error'}</strong>
        <p>{toast.message}</p>
      </div>
      <button type="button" className="ghost-icon-button" onClick={() => onClose(toast.id)} aria-label="Dismiss toast">
        ×
      </button>
    </div>
  );
}
