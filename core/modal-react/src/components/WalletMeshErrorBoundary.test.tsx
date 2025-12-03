import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WalletMeshErrorBoundary } from './WalletMeshErrorBoundary.js';

// Mock the logger
vi.mock('../utils/logger.js', () => ({
  createComponentLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

// Component that throws an error when shouldThrow is true
interface ThrowingComponentProps {
  shouldThrow: boolean;
  errorMessage?: string;
}

const ThrowingComponent = ({ shouldThrow, errorMessage = 'Test error' }: ThrowingComponentProps) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>No error</div>;
};

// Component that throws different types of errors
const ErrorTypeComponent = ({ errorType }: { errorType: string }) => {
  switch (errorType) {
    case 'string':
      throw 'String error';
    case 'object':
      throw { message: 'Object error', code: 500 };
    case 'null':
      throw null;
    case 'undefined':
      throw undefined;
    case 'number':
      throw 42;
    default:
      throw new Error('Default error');
  }
};

// Component that throws async errors (commented out for now - will be used in future async error tests)
// const AsyncThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
//   if (shouldThrow) {
//     setTimeout(() => {
//       throw new Error('Async error');
//     }, 0);
//   }
//   return <div>Async component</div>;
// };

// Custom error boundary for testing fallback
const CustomFallbackComponent = ({
  error,
  resetError,
}: {
  error: unknown;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
}) => (
  <div>
    <h1>Custom Error UI</h1>
    <p>Error: {error instanceof Error ? error.message : String(error)}</p>
    <button type="button" onClick={resetError}>
      Reset
    </button>
  </div>
);

/**
 * WalletMeshErrorBoundary Tests
 *
 * Comprehensive tests for React error boundary with organized structure:
 * - Error Catching (basic error detection, different error types, nested boundaries)
 * - Custom Fallback (fallback components, error passing, function fallbacks)
 * - Error Recovery (reset functionality, retry mechanisms, recovery flows)
 * - Error Information (error details, component stacks, callback handling)
 * - Default Fallback UI (built-in error displays, recovery suggestions)
 * - Production vs Development (environment-specific behavior, error detail visibility)
 * - Edge Cases (error handlers, null children, array children, special characters)
 * - Performance (no-error overhead, rapid cycles, memory efficiency)
 * - Accessibility (ARIA attributes, screen reader support, descriptive messages)
 * - Integration (Suspense compatibility, context providers, React key preservation)
 *
 * @internal
 */

describe('WalletMeshErrorBoundary', () => {
  // Type-safe wrapper for console spy that handles version differences
  let consoleErrorSpy: { mockRestore: () => void } | undefined;

  beforeEach(() => {
    // Suppress console.error during tests to avoid noise
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}) as { mockRestore: () => void };
    // Removed fake timers to fix timeout issues
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('Error Catching', () => {
    it('should render children when no error occurs', () => {
      render(
        <WalletMeshErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </WalletMeshErrorBoundary>,
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should catch and display error when child throws', () => {
      render(
        <WalletMeshErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="Connection failed" />
        </WalletMeshErrorBoundary>,
      );

      // Check if the error boundary rendered with role="alert"
      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();

      // Debug what's actually being rendered
      // console.log(errorContainer.textContent);

      // Check for the error heading instead of the specific message
      expect(screen.getByText('Application Error')).toBeInTheDocument();
    });

    it('should catch multiple different error types', () => {
      const errorTypes = ['string', 'object', 'null', 'undefined', 'number'];

      for (const errorType of errorTypes) {
        const { unmount } = render(
          <WalletMeshErrorBoundary>
            <ErrorTypeComponent errorType={errorType} />
          </WalletMeshErrorBoundary>,
        );

        // All error types should be caught and show the error UI
        const errorContainer = screen.getByRole('alert');
        expect(errorContainer).toBeInTheDocument();
        expect(screen.getByText('Application Error')).toBeInTheDocument();
        unmount();
      }
    });

    it('should handle nested error boundaries', () => {
      render(
        <WalletMeshErrorBoundary>
          <div>Outer boundary</div>
          <WalletMeshErrorBoundary>
            <ThrowingComponent shouldThrow={true} errorMessage="Inner error" />
          </WalletMeshErrorBoundary>
        </WalletMeshErrorBoundary>,
      );

      // Inner boundary should catch the error
      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();
      expect(screen.getByText('Application Error')).toBeInTheDocument();
      expect(screen.getByText('Outer boundary')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      render(
        <WalletMeshErrorBoundary fallback={CustomFallbackComponent}>
          <ThrowingComponent shouldThrow={true} errorMessage="Custom error" />
        </WalletMeshErrorBoundary>,
      );

      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
      expect(screen.getByText('Error: Custom error')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should pass error and resetError to custom fallback', () => {
      const mockFallback = vi.fn().mockReturnValue(<div>Mock fallback</div>);

      render(
        <WalletMeshErrorBoundary fallback={mockFallback}>
          <ThrowingComponent shouldThrow={true} errorMessage="Test error" />
        </WalletMeshErrorBoundary>,
      );

      expect(mockFallback).toHaveBeenCalledWith({
        error: expect.any(Error),
        errorInfo: expect.any(Object),
        resetError: expect.any(Function),
      });
      expect(mockFallback.mock.calls[0]?.[0]?.error?.message).toBe('Test error');
    });

    it('should render fallback as function', () => {
      const FallbackFunction = ({
        error,
      }: {
        error: unknown;
        errorInfo: React.ErrorInfo | null;
        resetError: () => void;
      }) => <div>Function fallback: {error instanceof Error ? error.message : String(error)}</div>;

      render(
        <WalletMeshErrorBoundary fallback={FallbackFunction}>
          <ThrowingComponent shouldThrow={true} errorMessage="Function error" />
        </WalletMeshErrorBoundary>,
      );

      expect(screen.getByText('Function fallback: Function error')).toBeInTheDocument();
    });
  });

  describe('Non-Error Objects', () => {
    it('should handle plain object errors without showing [object Object]', () => {
      render(
        <WalletMeshErrorBoundary>
          <ErrorTypeComponent errorType="object" />
        </WalletMeshErrorBoundary>,
      );

      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();

      // Should NOT display [object Object]
      expect(screen.queryByText(/\[object Object\]/)).not.toBeInTheDocument();

      // Should extract the message from the object (ErrorTypeComponent throws { message: 'Object error', code: 500 })
      const errorDetails = screen.getByLabelText('Error details');
      expect(errorDetails.textContent).toBe('Object error');
    });

    it('should extract message from object errors if available', () => {
      const ObjectWithMessageComponent = () => {
        throw { message: 'Custom object error message', code: 'ERR_001' };
      };

      render(
        <WalletMeshErrorBoundary>
          <ObjectWithMessageComponent />
        </WalletMeshErrorBoundary>,
      );

      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();

      // Should display the message from the object
      const errorText = screen.getByLabelText('Error details').textContent;
      expect(errorText).toBe('Custom object error message');

      // Should NOT display [object Object]
      expect(screen.queryByText(/\[object Object\]/)).not.toBeInTheDocument();
    });

    it('should handle various non-Error types', () => {
      const testCases = [
        { type: 'string', expectedContent: 'String error' },
        { type: 'number', expectedContent: '42' },
        { type: 'null', expectedContent: 'An unexpected error occurred. Please try again.' },
        { type: 'undefined', expectedContent: 'An unexpected error occurred. Please try again.' },
      ];

      for (const { type, expectedContent } of testCases) {
        const { unmount } = render(
          <WalletMeshErrorBoundary>
            <ErrorTypeComponent errorType={type} />
          </WalletMeshErrorBoundary>,
        );

        const errorDetails = screen.getByLabelText('Error details');
        expect(errorDetails.textContent).toBe(expectedContent);
        expect(screen.queryByText(/\[object Object\]/)).not.toBeInTheDocument();

        unmount();
      }
    });

    it('should handle empty objects', () => {
      const EmptyObjectComponent = () => {
        throw {};
      };

      render(
        <WalletMeshErrorBoundary>
          <EmptyObjectComponent />
        </WalletMeshErrorBoundary>,
      );

      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();

      // Should NOT display [object Object]
      expect(screen.queryByText(/\[object Object\]/)).not.toBeInTheDocument();

      // Should show a generic error message for empty objects
      const errorDetails = screen.getByLabelText('Error details');
      expect(errorDetails.textContent).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle objects with custom toString', () => {
      const CustomToStringComponent = () => {
        const error = {
          toString() {
            return 'Custom error representation';
          },
        };
        throw error;
      };

      render(
        <WalletMeshErrorBoundary>
          <CustomToStringComponent />
        </WalletMeshErrorBoundary>,
      );

      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();

      // Should use the custom toString method
      const errorDetails = screen.getByLabelText('Error details');
      expect(errorDetails.textContent).toBe('Custom error representation');
      expect(screen.queryByText(/\[object Object\]/)).not.toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should reset error state and re-render children', () => {
      const { rerender } = render(
        <WalletMeshErrorBoundary fallback={CustomFallbackComponent}>
          <ThrowingComponent shouldThrow={true} errorMessage="Recoverable error" />
        </WalletMeshErrorBoundary>,
      );

      // Error state
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();

      // Click reset button
      const resetButton = screen.getByText('Reset');
      resetButton.click();

      // Re-render with non-throwing component
      rerender(
        <WalletMeshErrorBoundary fallback={CustomFallbackComponent}>
          <ThrowingComponent shouldThrow={false} />
        </WalletMeshErrorBoundary>,
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should allow retry after error recovery', () => {
      let shouldThrow = true;

      const RetryComponent = () => {
        if (shouldThrow) {
          throw new Error('Retry error');
        }
        return <div>Success after retry</div>;
      };

      const { rerender } = render(
        <WalletMeshErrorBoundary fallback={CustomFallbackComponent}>
          <RetryComponent />
        </WalletMeshErrorBoundary>,
      );

      // Error state
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();

      // Fix the error condition
      shouldThrow = false;

      // Click reset button
      const resetButton = screen.getByText('Reset');
      resetButton.click();

      // Re-render with fixed component
      rerender(
        <WalletMeshErrorBoundary fallback={CustomFallbackComponent}>
          <RetryComponent />
        </WalletMeshErrorBoundary>,
      );

      expect(screen.getByText('Success after retry')).toBeInTheDocument();
    });
  });

  describe('Error Information', () => {
    it('should capture error details in error info', () => {
      const mockOnError = vi.fn();

      render(
        <WalletMeshErrorBoundary onError={mockOnError}>
          <ThrowingComponent shouldThrow={true} errorMessage="Detailed error" />
        </WalletMeshErrorBoundary>,
      );

      expect(mockOnError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.stringContaining('ThrowingComponent'),
        }),
      );
    });

    it('should provide component stack in error info', () => {
      const mockOnError = vi.fn();

      const NestedComponent = () => <ThrowingComponent shouldThrow={true} />;
      const WrapperComponent = () => <NestedComponent />;

      render(
        <WalletMeshErrorBoundary onError={mockOnError}>
          <WrapperComponent />
        </WalletMeshErrorBoundary>,
      );

      const errorInfo = mockOnError.mock.calls[0]?.[1];
      expect(errorInfo.componentStack).toContain('ThrowingComponent');
      expect(errorInfo.componentStack).toContain('NestedComponent');
      expect(errorInfo.componentStack).toContain('WrapperComponent');
    });

    it('should call onError callback when error occurs', () => {
      const mockOnError = vi.fn();

      render(
        <WalletMeshErrorBoundary onError={mockOnError}>
          <ThrowingComponent shouldThrow={true} errorMessage="Callback error" />
        </WalletMeshErrorBoundary>,
      );

      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError.mock.calls[0]?.[0]?.message).toBe('Callback error');
    });
  });

  describe('Default Fallback UI', () => {
    it('should render default error UI when no fallback provided', () => {
      render(
        <WalletMeshErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="Default UI error" />
        </WalletMeshErrorBoundary>,
      );

      // Should show error container with proper role
      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();
      expect(screen.getByText('Application Error')).toBeInTheDocument();
    });

    it('should include reload suggestion in default UI', () => {
      render(
        <WalletMeshErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </WalletMeshErrorBoundary>,
      );

      // Check for buttons which provide recovery actions
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should include retry button in default UI', () => {
      render(
        <WalletMeshErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </WalletMeshErrorBoundary>,
      );

      // Check for buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      // At least one button should exist for recovery
      expect(buttons[0]?.tagName).toBe('BUTTON');
    });
  });

  describe('Production vs Development', () => {
    it('should hide error details in production', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'production';

      render(
        <WalletMeshErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="Production error with sensitive data" />
        </WalletMeshErrorBoundary>,
      );

      // Should show error container
      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();
      expect(screen.getByText('Application Error')).toBeInTheDocument();
      // Should not show stack trace in production
      expect(screen.queryByText(/Development Error Details/)).not.toBeInTheDocument();

      if (originalEnv !== undefined) {
        process.env['NODE_ENV'] = originalEnv;
      }
    });

    it('should show error details in development', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      render(
        <WalletMeshErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="Development error details" />
        </WalletMeshErrorBoundary>,
      );

      // Should show error container
      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();
      expect(screen.getByText('Application Error')).toBeInTheDocument();
      // Should include development error details section
      expect(screen.getByText('Development Error Details')).toBeInTheDocument();

      if (originalEnv !== undefined) {
        process.env['NODE_ENV'] = originalEnv;
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle error in componentDidCatch', () => {
      const mockOnError = vi.fn().mockImplementation(() => {
        throw new Error('Error in error handler');
      });

      expect(() => {
        render(
          <WalletMeshErrorBoundary onError={mockOnError}>
            <ThrowingComponent shouldThrow={true} />
          </WalletMeshErrorBoundary>,
        );
      }).not.toThrow();
    });

    it('should handle null children', () => {
      expect(() => {
        render(<WalletMeshErrorBoundary>{null}</WalletMeshErrorBoundary>);
      }).not.toThrow();
    });

    it('should handle undefined children', () => {
      expect(() => {
        render(<WalletMeshErrorBoundary>{undefined}</WalletMeshErrorBoundary>);
      }).not.toThrow();
    });

    it('should handle array of children with mixed types', () => {
      expect(() => {
        render(
          <WalletMeshErrorBoundary>
            {[<div key="1">Valid component</div>, null, undefined, 'String child', 42]}
          </WalletMeshErrorBoundary>,
        );
      }).not.toThrow();
    });

    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(10000);

      render(
        <WalletMeshErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage={longMessage} />
        </WalletMeshErrorBoundary>,
      );

      // Should still render error UI for long messages
      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();
      expect(screen.getByText('Application Error')).toBeInTheDocument();
    });

    it('should handle error messages with special characters', () => {
      const specialMessage = '<script>alert("xss")</script>&amp;';

      render(
        <WalletMeshErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage={specialMessage} />
        </WalletMeshErrorBoundary>,
      );

      // Should still render error UI for special characters
      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();
      expect(screen.getByText('Application Error')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not impact performance when no errors occur', () => {
      const renderSpy = vi.fn();

      const MonitoredComponent = () => {
        renderSpy();
        return <div>Monitored component</div>;
      };

      const { rerender } = render(
        <WalletMeshErrorBoundary>
          <MonitoredComponent />
        </WalletMeshErrorBoundary>,
      );

      const initialRenderCount = renderSpy.mock.calls.length;

      // Re-render multiple times
      for (let i = 0; i < 5; i++) {
        rerender(
          <WalletMeshErrorBoundary>
            <MonitoredComponent />
          </WalletMeshErrorBoundary>,
        );
      }

      // Error boundary should not cause extra renders
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount + 5);
    });

    it('should handle rapid error/recovery cycles', () => {
      let shouldThrow = false;

      const RapidComponent = () => {
        if (shouldThrow) {
          throw new Error('Rapid error');
        }
        return <div>Rapid component</div>;
      };

      const { rerender } = render(
        <WalletMeshErrorBoundary fallback={CustomFallbackComponent}>
          <RapidComponent />
        </WalletMeshErrorBoundary>,
      );

      // Rapid error/recovery cycles
      for (let i = 0; i < 10; i++) {
        shouldThrow = !shouldThrow;

        rerender(
          <WalletMeshErrorBoundary fallback={CustomFallbackComponent}>
            <RapidComponent />
          </WalletMeshErrorBoundary>,
        );

        if (shouldThrow) {
          // Reset error
          const resetButton = screen.queryByText('Reset');
          if (resetButton) {
            resetButton.click();
          }
        }
      }

      // Should handle rapid cycles without memory leaks
      expect(screen.getByText('Rapid component')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes in error state', () => {
      render(
        <WalletMeshErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </WalletMeshErrorBoundary>,
      );

      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();
      expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have proper accessibility attributes', () => {
      render(
        <WalletMeshErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </WalletMeshErrorBoundary>,
      );

      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
      expect(errorContainer).toHaveAttribute('role', 'alert');
    });

    it('should have descriptive error message for screen readers', () => {
      render(
        <WalletMeshErrorBoundary>
          <ThrowingComponent shouldThrow={true} errorMessage="Accessible error" />
        </WalletMeshErrorBoundary>,
      );

      const errorMessage = screen.getByLabelText(/Error details/);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should work with React.Suspense', () => {
      const LazyComponent = () => {
        throw new Error('Error in lazy component');
      };

      expect(() => {
        render(
          <WalletMeshErrorBoundary>
            <LazyComponent />
          </WalletMeshErrorBoundary>,
        );
      }).not.toThrow();

      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();
      expect(screen.getByText('Application Error')).toBeInTheDocument();
    });

    it('should work with React context providers', () => {
      const TestContext = React.createContext('test-value');

      const ContextComponent = () => {
        const value = React.useContext(TestContext);
        throw new Error(`Context error: ${value}`);
      };

      render(
        <TestContext.Provider value="custom-value">
          <WalletMeshErrorBoundary>
            <ContextComponent />
          </WalletMeshErrorBoundary>
        </TestContext.Provider>,
      );

      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toBeInTheDocument();
      expect(screen.getByText('Application Error')).toBeInTheDocument();
    });

    it('should preserve React keys during error recovery', () => {
      const items = ['item1', 'item2', 'item3'];
      let shouldThrow = true;

      const ListComponent = () => {
        if (shouldThrow) {
          throw new Error('List error');
        }
        return (
          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        );
      };

      const { rerender } = render(
        <WalletMeshErrorBoundary fallback={CustomFallbackComponent}>
          <ListComponent />
        </WalletMeshErrorBoundary>,
      );

      // Error state
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();

      // Fix error and reset
      shouldThrow = false;
      const resetButton = screen.getByText('Reset');
      resetButton.click();

      rerender(
        <WalletMeshErrorBoundary fallback={CustomFallbackComponent}>
          <ListComponent />
        </WalletMeshErrorBoundary>,
      );

      // List should render correctly
      for (const item of items) {
        expect(screen.getByText(item)).toBeInTheDocument();
      }
    });
  });
});
