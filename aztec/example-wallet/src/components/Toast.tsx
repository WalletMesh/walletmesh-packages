import type React from 'react';
import { useEffect } from 'react';
import './Toast.css';

export interface ToastProps {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]); // Only depend on id, not onClose to avoid stale closures

  return (
    <div id={id} className={`toast toast-${type}`} data-toast-id={id}>
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
