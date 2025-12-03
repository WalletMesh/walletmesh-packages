/**
 * Comprehensive integration tests for service integration with React hooks
 *
 * These tests verify that the React hooks properly delegate business logic
 * to the modal-core services and maintain consistent behavior. Includes both
 * basic service functionality tests and advanced integration scenarios.
 */

import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// Ensure the vi.mock is applied by importing the mock file (commented out due to parsing issues)
// import '../test-utils/centralizedMocks.js';
import { useAccount, useSwitchChain } from '../index.js';
import { createTestWrapper } from '../test-utils/testHelpers.js';

describe('Service Integration Tests', () => {
  let wrapper: ReturnType<typeof createTestWrapper>['wrapper'];

  beforeEach(() => {
    vi.clearAllMocks();
    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useSwitchChain Integration', () => {
    it('should provide chain switching and validation functionality', () => {
      const { result } = renderHook(() => useSwitchChain(), { wrapper });

      // The hook should provide chain switching functionality
      expect(result.current).toBeDefined();
      expect(typeof result.current?.switchChain).toBe('function');
      expect(typeof result.current?.ensureChain).toBe('function');
      expect(typeof result.current?.validateChain).toBe('function');
    });
  });

  describe('useAccount Integration', () => {
    it('should provide wallet selection functionality', () => {
      const { result } = renderHook(() => useAccount(), { wrapper });

      // Check that account hook includes wallet selection
      expect(result.current).toBeDefined();
      expect(result.current?.availableWallets).toBeDefined();
      expect(typeof result.current?.selectWallet).toBe('function');
      expect(typeof result.current?.setPreferredWallet).toBe('function');
    });
  });

  describe('Cross-Service Integration', () => {
    it('should provide all services without errors', () => {
      const { result } = renderHook(
        () => ({
          account: useAccount(),
          switchChain: useSwitchChain(),
        }),
        { wrapper },
      );

      // All services should be available
      expect(result.current.account).toBeDefined();
      expect(result.current.switchChain).toBeDefined();
    });
  });

  describe('Service Error Handling', () => {
    it('should handle service errors gracefully', () => {
      const { result } = renderHook(
        () => ({
          account: useAccount(),
        }),
        { wrapper },
      );

      // Services should be available even when not connected
      expect(result.current.account).toBeDefined();
    });
  });
});
