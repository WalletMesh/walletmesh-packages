/**
 * Integration tests for LazyAztecRouterProvider notification handling
 *
 * Tests the full notification lifecycle:
 * - Subscription to aztec_transactionStatus notifications
 * - Parsing of notification payloads
 * - Store updates for transaction status
 * - Transaction hash updates
 * - Error handling
 * - Notification handler cleanup
 */

import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import type { TransactionStatus } from './types.js';

// Shared state for notification handler across tests
let notificationHandler: ((params: unknown) => void) | null = null;
let mockAztecRouterProvider: ReturnType<typeof vi.fn>;

// Mock the lazy module loader to return our controlled mock
vi.mock('../../utils/lazy/index.js', () => ({
  createLazyModule: vi.fn().mockImplementation(() => ({
    getModule: async () => ({
      AztecRouterProvider: mockAztecRouterProvider,
      registerAztecSerializers: vi.fn(),
    }),
    wrap: vi.fn(),
  })),
}));

// Mock store (can be hoisted since it's not dynamically imported)
vi.mock('../../state/store.js', () => ({
  useStore: {
    getState: vi.fn(),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

// Mock store actions (can be hoisted since it's not dynamically imported)
vi.mock('../../state/actions/aztecTransactions.js', () => ({
  aztecTransactionActions: {
    updateAztecTransactionStatus: vi.fn(),
    updateAztecTransaction: vi.fn(),
  },
}));

// Now import the module under test
import { LazyAztecRouterProvider } from './lazy.js';
import { aztecTransactionActions } from '../../state/actions/aztecTransactions.js';

describe('LazyAztecRouterProvider - Notification Integration', () => {
  let mockTransport: JSONRPCTransport;
  let provider: LazyAztecRouterProvider;

  beforeEach(async () => {
    vi.useFakeTimers();
    notificationHandler = null;

    // Set up the mock AztecRouterProvider constructor
    mockAztecRouterProvider = vi.fn().mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue({ sessionId: 'test-session', permissions: {} }),
      disconnect: vi.fn().mockResolvedValue(undefined),
      call: vi.fn().mockResolvedValue({}),
      onNotification: vi.fn().mockImplementation((method: string, handler: (params: unknown) => void) => {
        if (method === 'aztec_transactionStatus') {
          notificationHandler = handler;
        }
        return () => {
          notificationHandler = null;
        };
      }),
    }));

    mockTransport = {
      send: vi.fn(),
      onMessage: vi.fn(),
    };

    provider = new LazyAztecRouterProvider(mockTransport);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Notification Subscription', () => {
    it('should subscribe to aztec_transactionStatus notifications during initialization', async () => {
      // Initialize provider
      await provider.connect({});

      // Get the mocked instance
      const mockInstance = mockAztecRouterProvider.mock.results[0]?.value;

      // Verify onNotification was called with correct event
      expect(mockInstance?.onNotification).toHaveBeenCalledWith(
        'aztec_transactionStatus',
        expect.any(Function),
      );
    });

    it('should verify onNotification method exists', async () => {
      // Initialize provider
      await provider.connect({});

      // Get the mocked instance
      const mockInstance = mockAztecRouterProvider.mock.results[0]?.value;

      // Verify onNotification method exists
      expect(mockInstance?.onNotification).toBeDefined();
      expect(typeof mockInstance?.onNotification).toBe('function');
    });
  });

  describe('Transaction Status Notifications', () => {
    beforeEach(async () => {
      // Initialize provider to set up notification handler
      await provider.connect({});
    });

    it('should parse and handle valid transaction status notification', async () => {
      expect(notificationHandler).not.toBeNull();

      const notification = {
        txStatusId: 'tx-1',
        status: 'proving' as TransactionStatus,
        timestamp: Date.now(),
      };

      // Emit notification
      notificationHandler?.(notification);

      // Advance timers for async processing
      await vi.advanceTimersByTimeAsync(100);

      // Verify store was updated
      expect(aztecTransactionActions.updateAztecTransactionStatus).toHaveBeenCalledWith(
        expect.anything(),
        'tx-1',
        'proving',
      );
    });

    it('should update transaction hash when provided', async () => {
      expect(notificationHandler).not.toBeNull();

      const notification = {
        txStatusId: 'tx-1',
        status: 'sending' as TransactionStatus,
        txHash: '0x1234567890abcdef',
        timestamp: Date.now(),
      };

      // Emit notification
      notificationHandler?.(notification);

      // Advance timers for async processing
      await vi.advanceTimersByTimeAsync(100);

      // Verify status was updated
      expect(aztecTransactionActions.updateAztecTransactionStatus).toHaveBeenCalledWith(
        expect.anything(),
        'tx-1',
        'sending',
      );

      // Verify hash was updated
      expect(aztecTransactionActions.updateAztecTransaction).toHaveBeenCalledWith(expect.anything(), 'tx-1', {
        txHash: '0x1234567890abcdef',
      });
    });

    it('should handle error in notification payload', async () => {
      expect(notificationHandler).not.toBeNull();

      const notification = {
        txStatusId: 'tx-1',
        status: 'failed' as TransactionStatus,
        error: 'Transaction failed: insufficient funds',
        timestamp: Date.now(),
      };

      // Emit notification
      notificationHandler?.(notification);

      // Advance timers for async processing
      await vi.advanceTimersByTimeAsync(100);

      // Verify status was updated
      expect(aztecTransactionActions.updateAztecTransactionStatus).toHaveBeenCalledWith(
        expect.anything(),
        'tx-1',
        'failed',
      );

      // Verify error was updated
      expect(aztecTransactionActions.updateAztecTransaction).toHaveBeenCalledWith(expect.anything(), 'tx-1', {
        error: expect.objectContaining({
          message: 'Transaction failed: insufficient funds',
        }),
      });
    });

    it('should progress through full transaction lifecycle', async () => {
      expect(notificationHandler).not.toBeNull();

      const stages: TransactionStatus[] = ['idle', 'simulating', 'proving', 'sending', 'pending', 'confirmed'];

      for (const status of stages) {
        const notification = {
          txStatusId: 'tx-lifecycle',
          status,
          timestamp: Date.now(),
          ...(status === 'sending' || status === 'pending' || status === 'confirmed'
            ? { txHash: '0xabc123def456' }
            : {}),
        };

        // Clear previous calls
        vi.clearAllMocks();

        // Emit notification
        notificationHandler?.(notification);

        // Advance timers
        await vi.advanceTimersByTimeAsync(100);

        // Verify status was updated for this stage
        expect(aztecTransactionActions.updateAztecTransactionStatus).toHaveBeenCalledWith(
          expect.anything(),
          'tx-lifecycle',
          status,
        );

        // Verify hash was updated for post-sending stages
        if (status === 'sending' || status === 'pending' || status === 'confirmed') {
          expect(aztecTransactionActions.updateAztecTransaction).toHaveBeenCalledWith(
            expect.anything(),
            'tx-lifecycle',
            { txHash: '0xabc123def456' },
          );
        }
      }
    });
  });

  describe('Invalid Notification Handling', () => {
    beforeEach(async () => {
      // Initialize provider to set up notification handler
      await provider.connect({});
    });

    it('should handle malformed notification gracefully', async () => {
      expect(notificationHandler).not.toBeNull();

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const malformedNotification = {
        // Missing required fields
        someInvalidField: 'invalid',
      };

      // Emit malformed notification - should not crash
      notificationHandler?.(malformedNotification);

      // Advance timers for async processing
      await vi.advanceTimersByTimeAsync(100);

      // Should log warning but not crash
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse transaction status notification'),
      );

      // Should not update store with invalid data
      expect(aztecTransactionActions.updateAztecTransactionStatus).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should handle notification with invalid status', async () => {
      expect(notificationHandler).not.toBeNull();

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const notification = {
        txStatusId: 'tx-1',
        status: 'invalid-status', // Invalid status
        timestamp: Date.now(),
      };

      // Emit notification with invalid status
      notificationHandler?.(notification);

      // Advance timers for async processing
      await vi.advanceTimersByTimeAsync(100);

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should handle notification parsing errors', async () => {
      expect(notificationHandler).not.toBeNull();

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Pass something that will cause parsing to fail
      const invalidNotification = null;

      // Emit invalid notification
      notificationHandler?.(invalidNotification);

      // Advance timers for async processing
      await vi.advanceTimersByTimeAsync(100);

      // Should log warning for parsing failures
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse transaction status notification'),
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Multiple Concurrent Transactions', () => {
    beforeEach(async () => {
      // Initialize provider to set up notification handler
      await provider.connect({});
    });

    it('should handle notifications for multiple transactions', async () => {
      expect(notificationHandler).not.toBeNull();

      const transactions = [
        { txStatusId: 'tx-1', status: 'proving' as TransactionStatus },
        { txStatusId: 'tx-2', status: 'sending' as TransactionStatus },
        { txStatusId: 'tx-3', status: 'confirmed' as TransactionStatus },
      ];

      for (const tx of transactions) {
        const notification = {
          ...tx,
          timestamp: Date.now(),
          ...(tx.status === 'sending' || tx.status === 'confirmed' ? { txHash: `0x${tx.txStatusId}hash` } : {}),
        };

        // Clear previous calls
        vi.clearAllMocks();

        // Emit notification
        notificationHandler?.(notification);

        // Advance timers
        await vi.advanceTimersByTimeAsync(50);

        // Verify correct transaction was updated
        expect(aztecTransactionActions.updateAztecTransactionStatus).toHaveBeenCalledWith(
          expect.anything(),
          tx.txStatusId,
          tx.status,
        );
      }
    });

    it('should handle rapid succession of status updates', async () => {
      expect(notificationHandler).not.toBeNull();

      const rapidUpdates: TransactionStatus[] = ['idle', 'simulating', 'proving', 'sending'];

      // Clear all mocks before rapid updates
      vi.clearAllMocks();

      // Emit all notifications rapidly
      for (const status of rapidUpdates) {
        notificationHandler?.({
          txStatusId: 'tx-rapid',
          status,
          timestamp: Date.now(),
        });
      }

      // Advance timers to process all updates
      await vi.advanceTimersByTimeAsync(500);

      // Should have processed all 4 updates
      expect(aztecTransactionActions.updateAztecTransactionStatus).toHaveBeenCalledTimes(4);
    });
  });

  describe('Notification Handler Cleanup', () => {
    it('should clean up notification handlers', async () => {
      // Initialize provider
      await provider.connect({});

      // Get the mocked instance
      const mockInstance = mockAztecRouterProvider.mock.results[0]?.value;

      // Verify onNotification was called and returned cleanup function
      expect(mockInstance?.onNotification).toHaveBeenCalledWith(
        'aztec_transactionStatus',
        expect.any(Function),
      );

      // Handler should be registered
      expect(notificationHandler).not.toBeNull();

      // Note: In a real implementation, cleanup would be called during provider disposal
      // This test verifies that the cleanup mechanism is set up correctly
    });

    it('should verify cleanup function is returned', async () => {
      // Initialize provider
      await provider.connect({});

      // Get the mocked instance
      const mockInstance = mockAztecRouterProvider.mock.results[0]?.value;

      // Verify onNotification was called and returned a cleanup function
      const onNotificationMock = mockInstance?.onNotification as ReturnType<typeof vi.fn>;
      expect(onNotificationMock).toHaveBeenCalled();

      // The return value should be a function (cleanup)
      const cleanupFn = onNotificationMock.mock.results[0]?.value;
      expect(typeof cleanupFn).toBe('function');

      // Call cleanup to verify it doesn't throw
      expect(() => cleanupFn()).not.toThrow();
    });
  });

  describe('Store Integration', () => {
    beforeEach(async () => {
      // Initialize provider to set up notification handler
      await provider.connect({});
    });

    it('should pass correct store instance to action calls', async () => {
      expect(notificationHandler).not.toBeNull();

      const notification = {
        txStatusId: 'tx-store',
        status: 'proving' as TransactionStatus,
        timestamp: Date.now(),
      };

      // Emit notification
      notificationHandler?.(notification);

      // Advance timers
      await vi.advanceTimersByTimeAsync(100);

      // Verify store was passed to action
      expect(aztecTransactionActions.updateAztecTransactionStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          getState: expect.any(Function),
          setState: expect.any(Function),
          subscribe: expect.any(Function),
        }),
        'tx-store',
        'proving',
      );
    });
  });

  describe('Logging and Diagnostics', () => {
    beforeEach(async () => {
      // Initialize provider to set up notification handler
      await provider.connect({});
    });

    it('should log notification receipt', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const notification = {
        txStatusId: 'tx-1',
        status: 'proving' as TransactionStatus,
        timestamp: Date.now(),
      };

      // Emit notification
      notificationHandler?.(notification);

      // Advance timers
      await vi.advanceTimersByTimeAsync(100);

      // Should log notification receipt
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Received aztec_transactionStatus notification'),
        notification,
      );

      consoleLogSpy.mockRestore();
    });

    it('should log parsed notification data', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const notification = {
        txStatusId: 'tx-1',
        status: 'proving' as TransactionStatus,
        timestamp: Date.now(),
      };

      // Emit notification
      notificationHandler?.(notification);

      // Advance timers
      await vi.advanceTimersByTimeAsync(100);

      // Should log parsed data
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Parsed transaction status notification'),
        expect.objectContaining({
          txStatusId: 'tx-1',
          status: 'proving',
        }),
      );

      consoleLogSpy.mockRestore();
    });
  });
});
