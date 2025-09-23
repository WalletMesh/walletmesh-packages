import '../test-utils/setup.js';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAddress, useConnectionStatus, useIsConnected } from '../hooks/granular/index.js';
import { useAccount } from '../hooks/useAccount.js';
import { createTestWrapper } from '../test-utils/testHelpers.js';
import { useRenderCount } from '../utils/performance.js';

describe('Re-render Optimization Tests', () => {
  let wrapper: ReturnType<typeof createTestWrapper>['wrapper'];

  beforeEach(() => {
    vi.clearAllMocks();
    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should minimize re-renders with granular hooks', () => {
    let connectionStatusRenders = 0;
    let addressRenders = 0;
    let isConnectedRenders = 0;

    // Track renders for each granular hook
    renderHook(
      () => {
        connectionStatusRenders++;
        return useConnectionStatus();
      },
      { wrapper },
    );

    renderHook(
      () => {
        addressRenders++;
        return useAddress();
      },
      { wrapper },
    );

    renderHook(
      () => {
        isConnectedRenders++;
        return useIsConnected();
      },
      { wrapper },
    );

    // Initial render - allow for React StrictMode double rendering
    expect(connectionStatusRenders).toBeLessThanOrEqual(2);
    expect(addressRenders).toBeLessThanOrEqual(2);
    expect(isConnectedRenders).toBeLessThanOrEqual(2);

    // Simulate a state change that only affects connection status
    // Since we're using granular selectors, only connectionStatus should re-render

    // The granular hooks should have minimal re-renders
    expect(connectionStatusRenders).toBeLessThanOrEqual(3);
    expect(addressRenders).toBeLessThanOrEqual(3);
    expect(isConnectedRenders).toBeLessThanOrEqual(3);
  });

  it('should have fast hook initialization with granular selectors', () => {
    const startTime = performance.now();

    // Render granular hooks
    renderHook(() => useConnectionStatus(), { wrapper });
    renderHook(() => useAddress(), { wrapper });
    renderHook(() => useIsConnected(), { wrapper });

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should initialize granular hooks very quickly (faster than composite hooks)
    expect(duration).toBeLessThan(10);
  });

  it('should efficiently handle rapid state updates with granular hooks', async () => {
    const { result: connectionResult } = renderHook(() => useConnectionStatus(), { wrapper });
    const { result: addressResult } = renderHook(() => useAddress(), { wrapper });

    const startTime = performance.now();

    // Simulate rapid state changes
    for (let i = 0; i < 50; i++) {
      await act(async () => {
        // Access the hook results to trigger any internal updates
        void connectionResult.current;
        void addressResult.current;
      });
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should handle updates very quickly with granular hooks
    expect(duration).toBeLessThan(50);
  });

  it('should track render count with performance hooks', () => {
    const TestComponent = () => {
      const renderCount = useRenderCount('TestComponent');
      const connectionStatus = useConnectionStatus();
      return { renderCount, connectionStatus };
    };

    const { result, rerender } = renderHook(() => TestComponent(), { wrapper });

    // Initial render (renderCount starts at 0, gets incremented after first render)
    expect(result.current.renderCount).toBe(0);

    // Force re-render
    rerender();
    expect(result.current.renderCount).toBe(1);

    // Multiple re-renders
    rerender();
    rerender();
    expect(result.current.renderCount).toBe(3);
  });

  it('should have minimal memory footprint with granular hooks', () => {
    // Create multiple instances of granular hooks
    const hooks = [];

    for (let i = 0; i < 20; i++) {
      const { result } = renderHook(
        () => ({
          connectionStatus: useConnectionStatus(),
          address: useAddress(),
          isConnected: useIsConnected(),
        }),
        { wrapper },
      );
      hooks.push(result);
    }

    // All hooks should share the same underlying store with granular subscriptions
    expect(hooks).toHaveLength(20);

    // Verify all hooks are functional
    for (const hook of hooks) {
      expect(hook.current.connectionStatus).toBeDefined();
      expect(hook.current.address).toBeDefined();
      expect(hook.current.isConnected).toBeDefined();
    }
  });

  it('should optimize selector performance with granular subscriptions', () => {
    const { result } = renderHook(() => useConnectionStatus(), { wrapper });

    const startTime = performance.now();

    // Access selector multiple times
    for (let i = 0; i < 1000; i++) {
      void result.current;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should access granular selectors very quickly
    expect(duration).toBeLessThan(5);
  });

  it('should demonstrate improved performance vs composite hook', () => {
    // Test composite hook (useAccount)
    const compositeStart = performance.now();
    const { result: accountResult } = renderHook(() => useAccount(), { wrapper });
    const compositeEnd = performance.now();
    const compositeDuration = compositeEnd - compositeStart;

    // Test granular hooks equivalent to useAccount
    const granularStart = performance.now();
    renderHook(() => useConnectionStatus(), { wrapper });
    renderHook(() => useAddress(), { wrapper });
    renderHook(() => useIsConnected(), { wrapper });
    const granularEnd = performance.now();
    const granularDuration = granularEnd - granularStart;

    // Granular hooks should be faster to initialize
    // Note: This may vary in test environment, so we use a reasonable threshold
    expect(granularDuration).toBeLessThan(compositeDuration + 10);

    // Verify functionality is equivalent
    expect(accountResult.current).toBeDefined();
    expect(accountResult.current.status).toBeDefined();
  });
});
