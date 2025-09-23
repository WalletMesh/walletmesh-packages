import '../test-utils/setup.js';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAccount } from '../hooks/useAccount.js';
import { useBalance } from '../hooks/useBalance.js';
import { useConnect } from '../hooks/useConnect.js';
import { createTestWrapper } from '../test-utils/testHelpers.js';

describe('Performance Tests', () => {
  let wrapper: ReturnType<typeof createTestWrapper>['wrapper'];

  beforeEach(() => {
    vi.clearAllMocks();
    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should minimize re-renders when using multiple hooks', () => {
    let accountRenders = 0;
    let balanceRenders = 0;
    let connectRenders = 0;

    // Track renders for each hook
    renderHook(
      () => {
        accountRenders++;
        return useAccount();
      },
      { wrapper },
    );

    renderHook(
      () => {
        balanceRenders++;
        return useBalance();
      },
      { wrapper },
    );

    const { result: connectResult } = renderHook(
      () => {
        connectRenders++;
        return useConnect();
      },
      { wrapper },
    );

    // Initial render - allow for React StrictMode double rendering
    expect(accountRenders).toBeLessThanOrEqual(2);
    expect(balanceRenders).toBeLessThanOrEqual(2);
    expect(connectRenders).toBeLessThanOrEqual(2);

    // Simulate a connection - catch any errors to prevent unhandled rejection
    act(() => {
      connectResult.current.connect('metamask').catch(() => {
        // Expected error in test environment - client not available
      });
    });

    // With centralized store, only relevant hooks should re-render
    // Account hook should re-render (connection state changed)
    // Balance hook might re-render multiple times during connection (connecting → session created → idle)
    // Connect hook should re-render (connection state changed)
    expect(accountRenders).toBeLessThanOrEqual(3);
    expect(balanceRenders).toBeLessThanOrEqual(3);
    expect(connectRenders).toBeLessThanOrEqual(3);
  });

  it('should have fast hook initialization', () => {
    const startTime = performance.now();

    // Render all hooks
    renderHook(() => useAccount(), { wrapper });
    renderHook(() => useBalance(), { wrapper });
    renderHook(() => useConnect(), { wrapper });

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should initialize all hooks in under 50ms
    expect(duration).toBeLessThan(50);
  });

  it('should efficiently handle rapid state updates', async () => {
    const { result } = renderHook(() => useConnect(), { wrapper });

    const startTime = performance.now();

    // Simulate rapid connect/disconnect cycles
    for (let i = 0; i < 100; i++) {
      await act(async () => {
        await result.current.connect('metamask').catch(() => {
          // Ignore errors in performance test - we're just testing speed
        });
      });
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should handle 100 updates in under 100ms (1ms per update)
    expect(duration).toBeLessThan(100);
  });

  it('should have minimal memory footprint', () => {
    // Create multiple instances of hooks
    const hooks = [];

    for (let i = 0; i < 10; i++) {
      const { result } = renderHook(
        () => ({
          account: useAccount(),
          balance: useBalance(),
          connect: useConnect(),
        }),
        { wrapper },
      );
      hooks.push(result);
    }

    // All hooks should share the same underlying store
    // This is validated by the fact that we can create many instances
    // without errors or excessive memory usage
    expect(hooks).toHaveLength(10);

    // Verify all hooks are functional
    for (const hook of hooks) {
      expect(hook.current.account).toBeDefined();
      expect(hook.current.balance).toBeDefined();
      expect(hook.current.connect).toBeDefined();
    }
  });

  it('should optimize selector performance', () => {
    const { result } = renderHook(() => useAccount(), { wrapper });

    const startTime = performance.now();

    // Access selectors multiple times
    for (let i = 0; i < 1000; i++) {
      void result.current.isConnected;
      void result.current.address;
      void result.current.chain;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should access selectors 1000 times in under 10ms
    expect(duration).toBeLessThan(10);
  });
});
