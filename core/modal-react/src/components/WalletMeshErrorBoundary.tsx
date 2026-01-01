import type { RecoveryAction } from '@walletmesh/modal-core';
import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import {
  getRecoveryActions as getRecoveryActionsUtil,
  getUserFriendlyMessage as getUserFriendlyMessageUtil,
  isWalletMeshError as isWalletMeshErrorUtil,
} from '../utils/errorUtils.js';
import { type Logger, createComponentLogger } from '../utils/logger.js';

/**
 * Props for the WalletMeshErrorBoundary component
 * @public
 */
export interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Fallback UI to display when an error occurs */
  fallback?:
    | ReactNode
    | ((props: { error: Error | unknown; errorInfo: ErrorInfo | null; resetError: () => void }) => ReactNode);
  /** Callback when an error is caught */
  onError?: (error: Error | unknown, errorInfo: ErrorInfo) => void;
  /** Whether to log errors to console (default: true) */
  enableLogging?: boolean;
  /** Custom error message prefix for logging */
  logPrefix?: string;
}

/**
 * State for the WalletMeshErrorBoundary component
 * @public
 */
export interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The error that was caught, if any */
  error: Error | unknown | null;
  /** Error info with component stack trace */
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component for WalletMesh applications
 *
 * Catches JavaScript errors anywhere in the child component tree, logs those errors,
 * and displays a fallback UI instead of the component tree that crashed.
 * This component extends React's Component class and implements error boundary functionality.
 *
 * ## Error Handling Patterns
 *
 * The error boundary handles various types of errors:
 * - **Wallet Connection Errors**: Specific handling for wallet-related failures
 * - **Network Errors**: Connection timeouts and network failures
 * - **Runtime Errors**: JavaScript exceptions in child components
 * - **Async Errors**: Unhandled promise rejections (with useErrorBoundary hook)
 *
 * ## Recovery Strategies
 *
 * Automatic recovery actions based on error type:
 * - **Retry**: Re-render the component tree
 * - **Refresh**: Reload the entire application
 * - **Custom Actions**: Developer-defined recovery functions
 *
 * ## Logging and Debugging
 *
 * In development mode:
 * - Full stack traces are displayed
 * - Component stack is included
 * - Error objects are fully serialized
 *
 * In production mode:
 * - User-friendly messages are shown
 * - Sensitive information is hidden
 * - Errors can be sent to monitoring services
 *
 * @example
 * ```tsx
 * // Basic usage with default fallback UI
 * <WalletMeshErrorBoundary>
 *   <WalletMeshProvider config={config}>
 *     <App />
 *   </WalletMeshProvider>
 * </WalletMeshErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * // Custom fallback UI with error details
 * <WalletMeshErrorBoundary
 *   fallback={(props) => (
 *     <div className="error-page">
 *       <h1>Oops! Something went wrong</h1>
 *       <p>{props.error?.message || 'Unknown error'}</p>
 *       <button onClick={props.resetError}>
 *         Try Again
 *       </button>
 *     </div>
 *   )}
 *   onError={(error, info) => {
 *     // Send to error monitoring service
 *     errorReporter.log(error, info);
 *   }}
 * >
 *   <App />
 * </WalletMeshErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * // Production setup with monitoring
 * <WalletMeshErrorBoundary
 *   enableLogging={process.env['NODE_ENV'] === 'development'}
 *   logPrefix="[MyDApp]"
 *   onError={(error, errorInfo) => {
 *     // Log to Sentry, LogRocket, etc.
 *     Sentry.captureException(error, {
 *       contexts: {
 *         react: {
 *           componentStack: errorInfo.componentStack
 *         }
 *       }
 *     });
 *   }}
 *   fallback={<ErrorFallback />}
 * >
 *   <WalletMeshProvider config={config}>
 *     <Router>
 *       <App />
 *     </Router>
 *   </WalletMeshProvider>
 * </WalletMeshErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * // Nested error boundaries for granular error handling
 * <WalletMeshErrorBoundary fallback={<AppErrorFallback />}>
 *   <WalletMeshProvider config={config}>
 *     <Header />
 *     <WalletMeshErrorBoundary fallback={<WalletErrorFallback />}>
 *       <WalletSection />
 *     </WalletMeshErrorBoundary>
 *     <MainContent />
 *   </WalletMeshProvider>
 * </WalletMeshErrorBoundary>
 * ```
 *
 * @category Components
 * @since 1.0.0
 */
export class WalletMeshErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private logger: Logger;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };

    // Create logger for this component
    const debug = typeof props.enableLogging === 'boolean' ? props.enableLogging : true;
    this.logger = createComponentLogger('ErrorBoundary', debug);
  }

  /**
   * Static lifecycle method called when an error is thrown in a descendant component
   *
   * This method is called during the "render" phase, so side effects are not permitted.
   * It should be used to update state to display an error UI on the next render.
   *
   * @param error - The error that was thrown by a descendant component
   * @returns Updated state to trigger error UI rendering
   */
  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  /**
   * Lifecycle method called after an error has been thrown by a descendant component
   *
   * This method is called during the "commit" phase, so side effects are permitted.
   * It's used for error logging and can trigger error reporting to external services.
   *
   * @param error - The error that was thrown, can be any type (not just Error instances)
   * @param errorInfo - Object containing the component stack trace showing where the error occurred
   * @override
   */
  override componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    const { onError, enableLogging = true, logPrefix = '[WalletMesh Error]' } = this.props;

    // Update state with error info while preserving the error
    this.setState({
      error,
      errorInfo,
    });

    // Log the error if enabled
    if (enableLogging) {
      // Safely extract error properties, handling non-Error objects
      const errorDetails =
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : {
              name: 'NonErrorException',
              message: String(error),
              stack: undefined,
            };

      // Log the full error object for debugging
      // Use multiple logging approaches to bypass any console overrides
      try {
        // Try to get the actual error details
        const errorString =
          error instanceof Error
            ? `${error.name}: ${error.message}\n${error.stack}`
            : JSON.stringify(error, null, 2);

        // Use native console.error directly
        const nativeConsole = window.console;
        nativeConsole.error(`${logPrefix} Error Details:\n`, errorString);

        // Also try console.log as fallback
        console.log(`${logPrefix} Error caught:`, error);
        console.log('Error type:', typeof error);
        console.log('Error constructor:', error?.constructor?.name);
        console.log('Error message:', error instanceof Error ? error.message : 'N/A');
        console.log('Error stack:', error instanceof Error ? error.stack : 'N/A');

        // If it's an object, log its properties
        if (error && typeof error === 'object') {
          console.log('Error properties:', Object.keys(error));
          console.log('Error JSON:', JSON.stringify(error, null, 2));
        }
      } catch (logError) {
        console.log('Failed to log error details:', logError);
      }

      this.logger.error(`${logPrefix} Error caught`, {
        error: errorDetails,
        originalError: error,
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
      });

      // Additional console logging for debugging
      console.error('WalletMesh Error Boundary:', error);
    }

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        this.logger.error('Error in WalletMeshErrorBoundary onError handler:', handlerError);
      }
    }
  }

  /**
   * Reset the error boundary state to clear the error and re-render children
   *
   * This method can be called to programmatically recover from an error state.
   * It's typically triggered by user actions like clicking a "Try Again" button.
   *
   * @public
   */
  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Get user-friendly error message using framework-agnostic utilities
   *
   * Transforms technical error messages into user-friendly explanations.
   * Handles various error types including Error instances, objects, and primitives.
   *
   * @param error - The error to get a message for (can be any type)
   * @returns A user-friendly error message string
   * @private
   */
  private getUserFriendlyMessage(error: Error | unknown): string {
    // If it's already an Error, use it directly
    if (error instanceof Error) {
      return getUserFriendlyMessageUtil(error);
    }

    // Handle null/undefined early
    if (error === null || error === undefined) {
      return 'An unexpected error occurred. Please try again.';
    }

    // Handle non-Error objects more intelligently
    if (typeof error === 'object') {
      // Check if the object has a message property
      const errorWithMessage = error as { message?: unknown; toString?: () => string };
      if ('message' in errorWithMessage && typeof errorWithMessage.message === 'string') {
        return getUserFriendlyMessageUtil(new Error(errorWithMessage.message));
      }

      // Try to get a meaningful string representation
      if (typeof errorWithMessage.toString === 'function') {
        const stringValue = errorWithMessage.toString();
        // Avoid the default "[object Object]" representation
        if (stringValue !== '[object Object]') {
          return getUserFriendlyMessageUtil(new Error(stringValue));
        }
      }

      // If we have an object with properties, try to create a meaningful message
      try {
        const jsonString = JSON.stringify(error);
        if (jsonString && jsonString !== '{}') {
          return getUserFriendlyMessageUtil(new Error(`Error: ${jsonString}`));
        }
      } catch {
        // Ignore JSON stringify errors (e.g., circular references)
      }

      // Empty object or object that couldn't be stringified
      return 'An unexpected error occurred. Please try again.';
    }

    // For primitives (strings, numbers, etc.)
    const errorString = String(error);
    return getUserFriendlyMessageUtil(new Error(errorString));
  }

  /**
   * Get recovery actions using framework-agnostic utilities
   *
   * Determines appropriate recovery actions based on the error type.
   * Returns an array of actions the user can take to recover from the error.
   *
   * @param error - The error to get recovery actions for
   * @returns Array of recovery action objects with type, label, and description
   * @private
   */
  private getRecoveryActions(error: Error | unknown): RecoveryAction[] {
    // If it's already an Error, use it directly
    if (error instanceof Error) {
      return getRecoveryActionsUtil(error);
    }

    // Handle non-Error objects consistently with getUserFriendlyMessage
    if (error && typeof error === 'object') {
      const errorWithMessage = error as { message?: unknown };
      if ('message' in errorWithMessage && typeof errorWithMessage.message === 'string') {
        return getRecoveryActionsUtil(new Error(errorWithMessage.message));
      }
    }

    // For all other cases, create a generic error
    const errorString = error ? String(error) : 'Unknown error';
    return getRecoveryActionsUtil(new Error(errorString));
  }

  /**
   * Render default fallback UI when no custom fallback is provided
   *
   * Creates a user-friendly error display with:
   * - Error message and icon
   * - Recovery action buttons
   * - Development mode stack trace
   * - Accessibility attributes
   *
   * @returns React node containing the error UI
   * @private
   */
  private renderDefaultFallback(): ReactNode {
    const { error } = this.state;
    // Always call getUserFriendlyMessage, even for falsy errors like null/undefined
    const userMessage = this.getUserFriendlyMessage(error);
    const isWalletError = error && isWalletMeshErrorUtil(error);
    const recoveryActions = error ? this.getRecoveryActions(error) : [];

    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{
          padding: '24px',
          margin: '16px',
          border: '1px solid #FEE2E2',
          borderRadius: '8px',
          backgroundColor: '#FEF2F2',
          color: '#7F1D1D',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '18px', marginRight: '8px' }}>⚠️</span>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            {isWalletError ? 'Wallet Connection Error' : 'Application Error'}
          </h3>
        </div>

        <p style={{ margin: '0 0 16px 0', lineHeight: '1.5' }}>{userMessage}</p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {recoveryActions.map((action, idx) => (
            <button
              key={`${action.type}-${action.label}`}
              type="button"
              onClick={() => {
                switch (action.type) {
                  case 'retry':
                    this.resetErrorBoundary();
                    break;
                  case 'refresh':
                    window.location.reload();
                    break;
                  default:
                    if (action.action) {
                      action.action();
                    }
                    break;
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: idx === 0 ? '#DC2626' : '#6B7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
              title={action.description}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Development mode: Show error details */}
        {typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'development' && error ? (
          <details style={{ marginTop: '16px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '500' }}>Development Error Details</summary>
            <pre
              style={{
                marginTop: '8px',
                padding: '12px',
                backgroundColor: '#F3F4F6',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                color: '#374151',
              }}
            >
              {error instanceof Error && error.stack ? error.stack : 'No stack trace available'}
            </pre>
          </details>
        ) : null}
      </div>
    );
  }

  /**
   * Renders the component
   * @returns Either the fallback UI if an error occurred, or the children
   * @override
   */
  override render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Render custom fallback if provided
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback({
            error: this.state.error,
            errorInfo: this.state.errorInfo,
            resetError: this.resetErrorBoundary,
          });
        }
        return fallback;
      }

      // Render default fallback
      return this.renderDefaultFallback();
    }

    return children;
  }
}

// Add display name for React DevTools
(WalletMeshErrorBoundary as typeof WalletMeshErrorBoundary & { displayName?: string }).displayName =
  'WalletMeshErrorBoundary';

/**
 * Hook to programmatically capture and handle errors in functional components
 *
 * Provides imperative API for error boundary functionality in hooks.
 * Note: This creates a local error state, not connected to parent error boundaries.
 *
 * ## Use Cases
 * - Capture async errors that error boundaries can't catch
 * - Programmatically trigger error states
 * - Reset error states from within components
 * - Handle errors in event handlers and effects
 *
 * @returns Object with error control functions
 * @returns resetErrorBoundary - Function to clear the current error state
 * @returns captureError - Function to trigger an error state
 *
 * @example
 * ```tsx
 * function RiskyComponent() {
 *   const { captureError, resetErrorBoundary } = useErrorBoundary();
 *
 *   const handleRiskyOperation = async () => {
 *     try {
 *       await riskyAsyncOperation();
 *     } catch (error) {
 *       // This will trigger the nearest error boundary
 *       captureError(error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleRiskyOperation}>
 *         Perform Risky Operation
 *       </button>
 *       <button onClick={resetErrorBoundary}>
 *         Reset Errors
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Handling errors in useEffect
 * function DataLoader({ userId }: { userId: string }) {
 *   const { captureError } = useErrorBoundary();
 *   const [data, setData] = useState(null);
 *
 *   useEffect(() => {
 *     fetchUserData(userId)
 *       .then(setData)
 *       .catch(captureError); // Errors will trigger error boundary
 *   }, [userId, captureError]);
 *
 *   return <div>{data && <UserProfile data={data} />}</div>;
 * }
 * ```
 *
 * @category Hooks
 * @since 1.0.0
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetErrorBoundary = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    resetErrorBoundary,
    captureError,
  };
}
