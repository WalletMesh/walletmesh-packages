import React, { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import Toast from '../components/Toast.js';

/**
 * Represents the data structure for a single toast notification item.
 */
interface ToastItem {
  /** Unique identifier for the toast. */
  id: string;
  /** The message content of the toast. */
  message: string;
  /** The type of the toast, determining its appearance and icon. */
  type: 'error' | 'success' | 'info' | 'warning';
}

/**
 * Defines the shape of the context value provided by {@link ToastProvider}.
 * It includes functions to show different types of toasts.
 */
interface ToastContextType {
  /** Shows a toast notification with a custom message and type. */
  showToast: (message: string, type?: ToastItem['type']) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

/**
 * React context for managing and displaying toast notifications.
 * @internal
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Custom React hook to access the toast context.
 * This hook provides functions to display various types of toast notifications.
 * It must be used within a {@link ToastProvider}.
 *
 * @returns The toast context value, providing `showToast`, `showError`, etc. functions.
 * @throws If used outside of a `ToastProvider`.
 *
 * @example
 * ```typescript
 * const { showError, showSuccess } = useToast();
 * // ...
 * showError('Something went wrong!');
 * showSuccess('Operation completed successfully.');
 * ```
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Props for the {@link ToastProvider} component.
 */
interface ToastProviderProps {
  /** The child components that will have access to the toast context. */
  children: ReactNode;
}

/**
 * Provides the toast notification context to its children.
 * It manages the state of active toasts and renders them in a toast container.
 * Components within this provider can use the `useToast` hook to trigger notifications.
 *
 * @param props - The properties for the ToastProvider, see {@link ToastProviderProps}.
 * @returns A React functional component.
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  /** State holding the array of currently active toast notifications. */
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  /**
   * Displays a toast notification.
   * @param message - The message to display.
   * @param type - The type of toast ('info', 'success', 'error', 'warning'). Defaults to 'info'.
   */
  const showToast = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7); // More unique ID
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  /** Displays an error toast. */
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  /** Displays a success toast. */
  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  /** Displays an informational toast. */
  const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);
  /** Displays a warning toast. */
  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

  /**
   * Removes a toast notification from the display.
   * @param id - The ID of the toast to remove.
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess, showInfo, showWarning }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
