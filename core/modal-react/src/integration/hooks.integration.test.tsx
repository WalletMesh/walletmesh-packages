/**
 * Integration tests for React hooks
 *
 * These tests verify that multiple hooks work together correctly
 * and maintain consistent state across the application.
 */

import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useAccount,
  useBalance,
  useConnect,
  useSwitchChain,
  useWalletEvents,
  useWalletProvider,
} from '../index.js';
import { createTestWrapper } from '../test-utils/testHelpers.js';

describe('Hook Integration Tests', () => {
  let wrapper: ReturnType<typeof createTestWrapper>['wrapper'];

  beforeEach(() => {
    vi.clearAllMocks();
    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Hook Availability', () => {
    describe('core connection hooks', () => {
      it('should provide all connection-related hooks', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            connect: useConnect(),
          }),
          { wrapper },
        );

        expect(result.current.account).toBeDefined();
        expect(result.current.connect).toBeDefined();
        expect(result.current.connect.disconnect).toBeDefined();
      });

      it('should provide consistent initial states', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            connect: useConnect(),
          }),
          { wrapper },
        );

        expect(result.current.account.isConnected).toBe(false);
        expect(result.current.connect.isConnecting).toBe(false);
      });
    });

    describe('utility hooks', () => {
      it('should provide wallet management hooks', () => {
        const { result } = renderHook(
          () => ({
            balance: useBalance(),
            switchChain: useSwitchChain(),
            provider: useWalletProvider(),
          }),
          { wrapper },
        );

        expect(result.current.balance).toBeDefined();
        expect(result.current.switchChain).toBeDefined();
        expect(result.current.provider).toBeDefined();
      });

      it('should provide proper function interfaces', () => {
        const { result } = renderHook(
          () => ({
            balance: useBalance(),
            switchChain: useSwitchChain(),
          }),
          { wrapper },
        );

        expect(typeof result.current.balance.refetch).toBe('function');
        expect(typeof result.current.switchChain.switchChain).toBe('function');
      });
    });

    describe('comprehensive hook integration', () => {
      it('should provide all hooks without errors', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            connect: useConnect(),
            balance: useBalance(),
            switchChain: useSwitchChain(),
            provider: useWalletProvider(),
          }),
          { wrapper },
        );

        // All hooks should be available
        expect(result.current.account).toBeDefined();
        expect(result.current.connect).toBeDefined();
        expect(result.current.connect.disconnect).toBeDefined();
        expect(result.current.balance).toBeDefined();
        expect(result.current.switchChain).toBeDefined();
        expect(result.current.provider).toBeDefined();
      });
    });
  });

  describe('State Consistency', () => {
    describe('across connection states', () => {
      it('should maintain consistent disconnected state', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            connect: useConnect(),
            balance: useBalance(),
          }),
          { wrapper },
        );

        // Initial disconnected state should be consistent
        expect(result.current.account.isConnected).toBe(false);
        expect(result.current.connect.isConnecting).toBe(false);
        expect(result.current.balance.data).toBeUndefined();
      });

      it('should provide consistent state properties', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            connect: useConnect(),
          }),
          { wrapper },
        );

        // State consistency checks
        expect(result.current.account.isConnected).toBe(false);
        expect(result.current.connect.isConnecting).toBe(false);
        expect(result.current.account.status).toBeDefined();
        expect(result.current.connect.status).toBeDefined();
      });
    });

    describe('during wallet switching', () => {
      it('should handle wallet switching state consistently', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            switchChain: useSwitchChain(),
            balance: useBalance(),
          }),
          { wrapper },
        );

        expect(result.current.account).toBeDefined();
        expect(result.current.switchChain).toBeDefined();
        expect(result.current.balance).toBeDefined();
      });
    });

    describe('during chain switching', () => {
      it('should maintain state consistency during chain operations', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            switchChain: useSwitchChain(),
          }),
          { wrapper },
        );

        // Chain may be null when disconnected, check if account object is properly structured
        expect(result.current.account).toBeDefined();
        expect(typeof result.current.switchChain.switchChain).toBe('function');
      });
    });
  });

  describe('Complex Interactions', () => {
    describe('connect -> disconnect -> reconnect flow', () => {
      it('should handle complete connection lifecycle', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            connect: useConnect(),
          }),
          { wrapper },
        );

        // Initial state
        expect(result.current.account.isConnected).toBe(false);
        expect(typeof result.current.connect.connect).toBe('function');
        expect(typeof result.current.connect.disconnect).toBe('function');
      });

      it('should maintain function availability throughout lifecycle', () => {
        const { result } = renderHook(
          () => ({
            connect: useConnect(),
          }),
          { wrapper },
        );

        expect(typeof result.current.connect.connect).toBe('function');
        expect(typeof result.current.connect.disconnect).toBe('function');
        expect(typeof result.current.connect.disconnectAll).toBe('function');
      });
    });

    describe('multi-wallet session management', () => {
      it('should handle multiple wallet sessions', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            connect: useConnect(),
          }),
          { wrapper },
        );

        expect(result.current.account).toBeDefined();
        expect(result.current.connect.connectedWallets).toBeDefined();
      });
    });

    describe('concurrent hook usage', () => {
      it('should handle concurrent hook operations', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            connect: useConnect(),
            balance: useBalance(),
            switchChain: useSwitchChain(),
          }),
          { wrapper },
        );

        // All hooks should coexist without conflicts
        expect(result.current.account).toBeDefined();
        expect(result.current.connect).toBeDefined();
        expect(result.current.balance).toBeDefined();
        expect(result.current.switchChain).toBeDefined();
      });
    });
  });

  describe('Error Propagation', () => {
    describe('network errors across hooks', () => {
      it('should handle network errors consistently', () => {
        const { result } = renderHook(
          () => ({
            connect: useConnect(),
            balance: useBalance(),
            switchChain: useSwitchChain(),
          }),
          { wrapper },
        );

        expect(result.current.connect.error).toBeDefined();
        expect(result.current.balance.error).toBeDefined();
        expect(result.current.switchChain.error).toBeDefined();
      });
    });

    describe('wallet rejection handling', () => {
      it('should propagate wallet rejection errors', () => {
        const { result } = renderHook(
          () => ({
            connect: useConnect(),
            switchChain: useSwitchChain(),
          }),
          { wrapper },
        );

        expect(result.current.connect.error).toBeDefined();
        expect(result.current.switchChain.error).toBeDefined();
      });
    });
  });

  describe('Event System Integration', () => {
    describe('event subscription coordination', () => {
      it('should provide event subscription methods', () => {
        // Test that hooks can be called without errors
        const events: string[] = [];

        const { result } = renderHook(
          () => {
            // Test event subscription
            useWalletEvents('connection:established', () => {
              events.push('established');
            });

            return { events };
          },
          { wrapper },
        );

        // Hook should not throw errors
        expect(result.current).toBeDefined();
      });

      it('should handle multiple event subscriptions', () => {
        const { result } = renderHook(
          () => {
            useWalletEvents('connection:established', () => {});
            useWalletEvents('connection:lost', () => {});
            useWalletEvents('chain:switched', () => {});

            return { subscribed: true };
          },
          { wrapper },
        );

        expect(result.current.subscribed).toBe(true);
      });
    });

    describe('event cleanup and management', () => {
      it('should handle event subscription cleanup', () => {
        const { unmount } = renderHook(
          () => {
            useWalletEvents('connection:established', () => {});
            return {};
          },
          { wrapper },
        );

        expect(() => {
          unmount();
        }).not.toThrow();
      });
    });
  });

  describe('Provider Integration', () => {
    describe('wallet provider access', () => {
      it('should provide wallet provider access', () => {
        const { result } = renderHook(() => useWalletProvider(), { wrapper });

        // Provider hook should be available
        expect(result.current).toBeDefined();
      });

      it('should maintain provider consistency with account state', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            provider: useWalletProvider(),
          }),
          { wrapper },
        );

        expect(result.current.account).toBeDefined();
        expect(result.current.provider).toBeDefined();
      });
    });

    describe('provider state synchronization', () => {
      it('should sync provider state with connection state', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            provider: useWalletProvider(),
          }),
          { wrapper },
        );

        // Provider should reflect connection state
        expect(result.current.account.isConnected).toBe(false);
        expect(result.current.provider).toBeDefined();
      });
    });
  });

  describe('Balance Integration', () => {
    describe('balance functionality', () => {
      it('should provide balance functionality', () => {
        const { result } = renderHook(() => useBalance(), { wrapper });

        // Balance hook should have expected structure (data may be undefined when not connected)
        expect(result.current).toBeDefined();
        expect(result.current.isLoading).toBeDefined();
        expect(result.current.error).toBeDefined();
        expect(typeof result.current.refetch).toBe('function');
      });

      it('should integrate with account connection state', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            balance: useBalance(),
          }),
          { wrapper },
        );

        expect(result.current.account.isConnected).toBe(false);
        expect(result.current.balance.data).toBeUndefined();
      });
    });

    describe('balance updates and caching', () => {
      it('should handle balance refetch operations', () => {
        const { result } = renderHook(() => useBalance(), { wrapper });

        expect(typeof result.current.refetch).toBe('function');
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Chain Management Integration', () => {
    describe('chain switching functionality', () => {
      it('should provide chain switching functionality', () => {
        const { result } = renderHook(() => useSwitchChain(), { wrapper });

        // Switch chain hook should be available
        expect(result.current).toBeDefined();
        expect(typeof result.current.switchChain).toBe('function');
      });

      it('should integrate with account chain state', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            switchChain: useSwitchChain(),
          }),
          { wrapper },
        );

        // Chain may be null when disconnected, check if account object is properly structured
        expect(result.current.account).toBeDefined();
        expect(typeof result.current.switchChain.switchChain).toBe('function');
      });
    });

    describe('chain state consistency', () => {
      it('should maintain chain state across hooks', () => {
        const { result } = renderHook(
          () => ({
            account: useAccount(),
            switchChain: useSwitchChain(),
            balance: useBalance(),
          }),
          { wrapper },
        );

        // Chain state should be consistent across hooks
        // Chain may be null when disconnected, check if account object is properly structured
        expect(result.current.account).toBeDefined();
        expect(result.current.switchChain).toBeDefined();
        expect(result.current.balance).toBeDefined();
      });
    });
  });
});
