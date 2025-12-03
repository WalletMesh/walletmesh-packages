import type React from 'react';
import { useEffect } from 'react';
import './Toast.css';

/**
 * Props for the {@link Toast} component.
 */
export interface ToastProps {
  /** Unique identifier for the toast notification. */
  id: string;
  /** The message content to display in the toast. */
  message: string;
  /** The type of toast, determining its style (e.g., 'error', 'success'). */
  type: 'error' | 'success' | 'info' | 'warning';
  /** Callback function invoked when the toast should be closed, either by user action or auto-dismissal. */
  onClose: (id: string) => void;
}

/**
 * A React component that displays a single toast notification.
 * Toasts are styled based on their `type` and include a message and a close button.
 * They automatically dismiss after a fixed duration (5 seconds).
 *
 * @param props - The properties for the Toast component, see {@link ToastProps}.
 * @returns A React functional component.
 */
const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  /** Effect to automatically dismiss the toast after 5 seconds. */
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        <button type="button" className="toast-close" onClick={() => onClose(id)} aria-label="Close">
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
