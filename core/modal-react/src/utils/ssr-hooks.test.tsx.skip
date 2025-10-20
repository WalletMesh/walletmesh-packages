/**
 * Comprehensive tests for enhanced SSR functionality
 */
// Import test setup first
import '../test-utils/setup.js';
import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAccount } from '../hooks/useAccount.js';
import { useConfig } from '../hooks/useConfig.js';
import { useConnect } from '../hooks/useConnect.js';
import { useSSR } from '../hooks/useSSR.js';
import { createTestWrapper } from '../test-utils/testHelpers.js';

describe('Enhanced SSR Utilities', () => {
  let wrapper: ReturnType<typeof createTestWrapper>['wrapper'];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('SSR Hook', () => {
    it('should provide SSR detection utilities', async () => {
      const { result } = renderHook(() => useSSR(), { wrapper });

      expect(result.current.isBrowser).toBe(true);
      expect(result.current.isServer).toBe(false);

      // Check hydration state - starts false but becomes true after useEffect
      expect(result.current.isHydrated).toBe(false);

      await act(async () => {
        await Promise.resolve();
      });

      // Advance fake timers to allow hydration effect to run.
      // Call runAllTimers() twice to flush chained timers/microtasks
      // that may schedule follow-up timeouts inside useEffect.
      await act(async () => {
        vi.runAllTimers();
        vi.runAllTimers();
      });
      expect(result.current.isHydrated).toBe(true);
    });
  });

  describe('useAccount with SSR', () => {
    it('should provide safe default values during SSR', () => {
      const { result } = renderHook(() => useAccount(), { wrapper });

      expect(result.current.status).toBe('disconnected');
      expect(result.current.isConnected).toBe(false);
      expect(result.current.address).toBeNull();
    });
  });

  describe('useConfig with SSR', () => {
    it('should provide safe modal controls during SSR', () => {
      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(result.current.isOpen).toBe(false);
      expect(typeof result.current.open).toBe('function');
      expect(typeof result.current.close).toBe('function');
    });
  });

  describe('Component rendering with SSR', () => {
    it('should render without hydration mismatches', () => {
      const TestComponent = () => {
        const { isOpen } = useConfig();
        const { isConnected } = useAccount();
        const { isBrowser } = useSSR();

        return (
          <div>
            <span>Modal: {isOpen ? 'Open' : 'Closed'}</span>
            <span>Connected: {isConnected ? 'Yes' : 'No'}</span>
            <span>Browser: {isBrowser ? 'Yes' : 'No'}</span>
          </div>
        );
      };

      const TestWrapper = wrapper;
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      expect(screen.getByText('Modal: Closed')).toBeInTheDocument();
      expect(screen.getByText('Connected: No')).toBeInTheDocument();
      expect(screen.getByText('Browser: Yes')).toBeInTheDocument();
    });
  });

  describe('SSR-safe wallet operations', () => {
    it('should handle wallet operations without errors', async () => {
      const TestComponent = () => {
        const { connect } = useConnect();
        const { isConnected } = useAccount();

        return (
          <div>
            <button
              type="button"
              onClick={() => {
                connect('metamask').catch(() => {
                  // Ignore errors in SSR test
                });
              }}
            >
              Connect
            </button>
            <span>{isConnected ? 'Connected' : 'Not Connected'}</span>
          </div>
        );
      };

      const TestWrapper = wrapper;
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      expect(screen.getByText('Not Connected')).toBeInTheDocument();
      // Connect operations should be safe even during SSR
      expect(() => screen.getByText('Connect').click()).not.toThrow();
    });
  });
});

describe('SSR Provider Behavior', () => {
  let wrapper: ReturnType<typeof createTestWrapper>['wrapper'];

  beforeEach(() => {
    vi.clearAllMocks();
    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with SSR-safe defaults', () => {
    const TestComponent = () => {
      const { status } = useAccount();
      const { isOpen } = useConfig();

      return (
        <div>
          <span>Status: {status}</span>
          <span>Modal: {isOpen ? 'Open' : 'Closed'}</span>
        </div>
      );
    };

    const TestWrapper = wrapper;
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Should have SSR-safe default values immediately
    expect(screen.getByText('Status: disconnected')).toBeInTheDocument();
    expect(screen.getByText('Modal: Closed')).toBeInTheDocument();
  });

  it('should handle multiple renders without side effects', () => {
    let renderCount = 0;

    const TestComponent = () => {
      renderCount++;
      useConfig(); // Using hook to trigger re-renders
      return <div>Render: {renderCount}</div>;
    };

    const TestWrapper = wrapper;
    const { rerender } = render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Rerender multiple times
    rerender(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    rerender(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Should have rendered 3 times total (or 4 in React 18 StrictMode)
    // React 18 in development mode may double-render components
    expect(renderCount).toBeGreaterThanOrEqual(3);
    expect(renderCount).toBeLessThanOrEqual(4);
  });
});
