/**
 * Isolated tests for SSR utilities
 *
 * This test file runs in isolation with direct mocks to avoid
 * heavy test setup and async initialization issues.
 */

import { act, renderHook } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock logger
vi.mock('./logger.js', () => ({
  createComponentLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Minimal wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => children as React.ReactElement;
};

describe('SSR Utilities - Isolated Tests', () => {
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('useSSR Hook', () => {
    it('should detect browser environment', async () => {
      const { useSSR } = await import('../hooks/useSSR.js');
      const { result } = renderHook(() => useSSR(), { wrapper });

      expect(result.current.isBrowser).toBe(true);
      expect(result.current.isServer).toBe(false);
    });

    it('should start with isHydrated as false', async () => {
      const { useSSR } = await import('../hooks/useSSR.js');
      const { result } = renderHook(() => useSSR(), { wrapper });

      // Initially not hydrated
      expect(result.current.isHydrated).toBe(false);
    });

    it('should provide all expected properties', async () => {
      const { useSSR } = await import('../hooks/useSSR.js');
      const { result } = renderHook(() => useSSR(), { wrapper });

      expect(result.current).toHaveProperty('isBrowser');
      expect(result.current).toHaveProperty('isServer');
      expect(result.current).toHaveProperty('isHydrated');
      expect(typeof result.current.isBrowser).toBe('boolean');
      expect(typeof result.current.isServer).toBe('boolean');
      expect(typeof result.current.isHydrated).toBe('boolean');
    });
  });

  describe('SSR Behavior', () => {
    it('should handle multiple renders consistently', async () => {
      const { useSSR } = await import('../hooks/useSSR.js');
      const { result, rerender } = renderHook(() => useSSR(), { wrapper });

      const initialBrowser = result.current.isBrowser;
      const initialServer = result.current.isServer;

      rerender();

      // Values should remain consistent across rerenders
      expect(result.current.isBrowser).toBe(initialBrowser);
      expect(result.current.isServer).toBe(initialServer);
    });

    it('should provide consistent environment detection', async () => {
      const { useSSR } = await import('../hooks/useSSR.js');
      const { result } = renderHook(() => useSSR(), { wrapper });

      // In browser environment, isBrowser should be true and isServer false
      expect(result.current.isBrowser).toBe(true);
      expect(result.current.isServer).toBe(false);

      // These should be opposites
      expect(result.current.isBrowser).not.toBe(result.current.isServer);
    });
  });

  describe('Hydration State', () => {
    it('should transition from not hydrated to hydrated', async () => {
      const { useSSR } = await import('../hooks/useSSR.js');
      const { result } = renderHook(() => useSSR(), { wrapper });

      // Initial state - not hydrated
      expect(result.current.isHydrated).toBe(false);

      // Trigger hydration
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Should now be hydrated
      expect(result.current.isHydrated).toBe(true);
    });

    it('should remain hydrated after multiple rerenders', async () => {
      const { useSSR } = await import('../hooks/useSSR.js');
      const { result, rerender } = renderHook(() => useSSR(), { wrapper });

      // Trigger hydration
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(result.current.isHydrated).toBe(true);

      // Rerender multiple times
      rerender();
      rerender();

      // Should still be hydrated
      expect(result.current.isHydrated).toBe(true);
    });
  });
});
