/**
 * Mock Aztec Transaction Notification Utilities
 *
 * Provides testing utilities for simulating Aztec transaction lifecycle
 * and notification emissions. Used for integration testing of the
 * transaction status overlay and notification handling system.
 *
 * @example
 * ```typescript
 * // Create mock notification emitter
 * const emitter = createMockAztecNotificationEmitter();
 *
 * // Simulate transaction lifecycle
 * await emitter.simulateTransaction('tx-1', {
 *   onStatus: (status) => console.log('Status:', status),
 *   stages: ['simulating', 'proving', 'sending', 'confirmed'],
 * });
 *
 * // Manual status emission
 * emitter.emitTransactionStatus({
 *   txStatusId: 'tx-1',
 *   status: 'proving',
 *   timestamp: Date.now(),
 * });
 * ```
 *
 * @module testing/mocks/mockAztecTransactions
 */

import { vi } from 'vitest';
import type { TransactionStatus } from '../../providers/aztec/types.js';
import { AZTEC_TEST_TX_HASH } from '../constants.js';

/**
 * Transaction status notification payload matching the schema
 * from modal-core/src/providers/aztec/types.ts
 */
export interface AztecTransactionStatusNotification {
  /** Internal tracking ID for correlating notifications */
  txStatusId: string;
  /** Current transaction status */
  status: TransactionStatus;
  /** Optional blockchain transaction hash (available after sending) */
  txHash?: string;
  /** Timestamp of the status update */
  timestamp: number;
  /** Optional error message (if status is 'failed') */
  error?: string;
}

/**
 * Options for simulating transaction lifecycle
 */
export interface SimulateTransactionOptions {
  /** Callback invoked on each status change */
  onStatus?: (notification: AztecTransactionStatusNotification) => void;
  /** Custom stages to simulate (defaults to full lifecycle) */
  stages?: TransactionStatus[];
  /** Delay between stages in ms (set to 0 for instant, default: 0 for tests) */
  stageDelay?: number;
  /** Whether to fail the transaction at a specific stage */
  failAt?: TransactionStatus;
  /** Custom error message for failures */
  errorMessage?: string;
  /** Custom transaction hash */
  txHash?: string;
}

/**
 * Mock notification listener callback
 */
export type NotificationListener = (notification: AztecTransactionStatusNotification) => void;

/**
 * Mock Aztec notification emitter for testing transaction status notifications
 */
export interface MockAztecNotificationEmitter {
  /**
   * Emit a transaction status notification
   */
  emitTransactionStatus(
    notification: Omit<AztecTransactionStatusNotification, 'timestamp'> & { timestamp?: number },
  ): void;

  /**
   * Simulate a complete transaction lifecycle with automatic stage progression
   */
  simulateTransaction(txStatusId: string, options?: SimulateTransactionOptions): Promise<void>;

  /**
   * Register a listener for transaction status notifications
   */
  onNotification(event: 'aztec_transactionStatus', listener: NotificationListener): () => void;

  /**
   * Get all emitted notifications for a transaction
   */
  getNotifications(txStatusId: string): AztecTransactionStatusNotification[];

  /**
   * Get all notifications across all transactions
   */
  getAllNotifications(): AztecTransactionStatusNotification[];

  /**
   * Clear all notification history
   */
  clearNotifications(): void;

  /**
   * Get current transaction status
   */
  getCurrentStatus(txStatusId: string): TransactionStatus | null;
}

/**
 * Default transaction lifecycle stages
 */
const DEFAULT_STAGES: TransactionStatus[] = [
  'idle',
  'simulating',
  'proving',
  'sending',
  'pending',
  'confirming',
  'confirmed',
];

/**
 * Create a mock Aztec notification emitter for testing
 *
 * This utility provides a simple interface for simulating Aztec transaction
 * status notifications during tests. It tracks all emitted notifications
 * and supports both manual and automatic lifecycle simulation.
 *
 * @returns Mock notification emitter instance
 *
 * @example
 * ```typescript
 * const emitter = createMockAztecNotificationEmitter();
 *
 * // Register listener
 * const unsub = emitter.onNotification('aztec_transactionStatus', (notification) => {
 *   console.log('Status update:', notification.status);
 * });
 *
 * // Simulate transaction
 * await emitter.simulateTransaction('tx-1', {
 *   stageDelay: 0, // Instant for tests
 *   onStatus: (status) => expect(status.txStatusId).toBe('tx-1'),
 * });
 *
 * // Cleanup
 * unsub();
 * ```
 */
export function createMockAztecNotificationEmitter(): MockAztecNotificationEmitter {
  const listeners: NotificationListener[] = [];
  const notificationHistory: AztecTransactionStatusNotification[] = [];
  const transactionStatuses = new Map<string, TransactionStatus>();

  function emitTransactionStatus(
    notification: Omit<AztecTransactionStatusNotification, 'timestamp'> & { timestamp?: number },
  ): void {
    const fullNotification: AztecTransactionStatusNotification = {
      ...notification,
      timestamp: notification.timestamp ?? Date.now(),
    };

    // Update current status
    transactionStatuses.set(fullNotification.txStatusId, fullNotification.status);

    // Store in history
    notificationHistory.push(fullNotification);

    // Notify all listeners
    for (const listener of listeners) {
      listener(fullNotification);
    }
  }

  async function simulateTransaction(
    txStatusId: string,
    options: SimulateTransactionOptions = {},
  ): Promise<void> {
    const {
      onStatus,
      stages = DEFAULT_STAGES,
      stageDelay = 0,
      failAt,
      errorMessage = 'Transaction failed',
      txHash = AZTEC_TEST_TX_HASH,
    } = options;

    for (const status of stages) {
      // Check if we should fail at this stage
      if (failAt === status) {
        const failureNotification: AztecTransactionStatusNotification = {
          txStatusId,
          status: 'failed',
          timestamp: Date.now(),
          error: errorMessage,
          ...(status === 'sending' || status === 'pending' || status === 'confirming' ? { txHash } : {}),
        };

        emitTransactionStatus(failureNotification);
        onStatus?.(failureNotification);
        return;
      }

      // Emit normal status update
      const notification: AztecTransactionStatusNotification = {
        txStatusId,
        status,
        timestamp: Date.now(),
        // Include txHash once we reach sending stage
        ...(status === 'sending' || status === 'pending' || status === 'confirming' || status === 'confirmed'
          ? { txHash }
          : {}),
      };

      emitTransactionStatus(notification);
      onStatus?.(notification);

      // Add delay between stages if specified
      if (stageDelay > 0 && status !== stages[stages.length - 1]) {
        await new Promise((resolve) => setTimeout(resolve, stageDelay));
      }
    }
  }

  function onNotification(event: 'aztec_transactionStatus', listener: NotificationListener): () => void {
    if (event === 'aztec_transactionStatus') {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      };
    }
    throw new Error(`Unknown event type: ${event}`);
  }

  function getNotifications(txStatusId: string): AztecTransactionStatusNotification[] {
    return notificationHistory.filter((n) => n.txStatusId === txStatusId);
  }

  function getAllNotifications(): AztecTransactionStatusNotification[] {
    return [...notificationHistory];
  }

  function clearNotifications(): void {
    notificationHistory.length = 0;
    transactionStatuses.clear();
  }

  function getCurrentStatus(txStatusId: string): TransactionStatus | null {
    return transactionStatuses.get(txStatusId) ?? null;
  }

  return {
    emitTransactionStatus,
    simulateTransaction,
    onNotification,
    getNotifications,
    getAllNotifications,
    clearNotifications,
    getCurrentStatus,
  };
}

/**
 * Create a mock AztecRouterProvider with notification support
 *
 * This creates a minimal mock of AztecRouterProvider that supports
 * the notification pattern used by LazyAztecRouterProvider.
 *
 * @example
 * ```typescript
 * const { provider, emitter } = createMockAztecRouterProvider();
 *
 * // Register listener (like LazyAztecRouterProvider does)
 * const unsub = provider.onNotification('aztec_transactionStatus', (params) => {
 *   console.log('Notification:', params);
 * });
 *
 * // Simulate transaction
 * await emitter.simulateTransaction('tx-1');
 * ```
 */
export function createMockAztecRouterProvider() {
  const emitter = createMockAztecNotificationEmitter();

  const provider = {
    call: vi
      .fn()
      .mockImplementation(async (_chainId: string, request: { method: string; params?: unknown }) => {
        // Simulate aztec_wmExecuteTx method
        if (request.method === 'aztec_wmExecuteTx') {
          const txStatusId = `tx-${Date.now()}`;
          const txHash = AZTEC_TEST_TX_HASH;

          // Return result matching AztecDappWallet.wmExecuteTx
          return { txHash, txStatusId };
        }

        throw new Error(`Unmocked method: ${request.method}`);
      }),
    onNotification: emitter.onNotification.bind(emitter),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
  };

  return {
    provider,
    emitter,
  };
}

/**
 * Create a transaction status notification with defaults
 *
 * Helper function to create valid notification objects with sensible defaults.
 *
 * @param overrides - Partial notification to override defaults
 * @returns Complete transaction status notification
 *
 * @example
 * ```typescript
 * const notification = createTransactionStatusNotification({
 *   txStatusId: 'tx-1',
 *   status: 'proving',
 * });
 * ```
 */
export function createTransactionStatusNotification(
  overrides: Partial<AztecTransactionStatusNotification> &
    Pick<AztecTransactionStatusNotification, 'txStatusId'>,
): AztecTransactionStatusNotification {
  return {
    status: 'idle',
    timestamp: Date.now(),
    ...overrides,
  };
}

/**
 * Create multiple notifications for testing batch scenarios
 *
 * @param count - Number of transactions to create
 * @param statusOverrides - Optional status overrides per transaction
 * @returns Array of notification emitters with unique IDs
 *
 * @example
 * ```typescript
 * const transactions = createMultipleTransactions(3, [
 *   { status: 'proving' },
 *   { status: 'sending' },
 *   { status: 'confirmed' },
 * ]);
 * ```
 */
export function createMultipleTransactions(
  count: number,
  statusOverrides: Array<Partial<AztecTransactionStatusNotification>> = [],
): Array<{ txStatusId: string; notification: AztecTransactionStatusNotification }> {
  return Array.from({ length: count }, (_, index) => {
    const txStatusId = `tx-${index + 1}`;
    const overrides = statusOverrides[index] || {};

    return {
      txStatusId,
      notification: createTransactionStatusNotification({
        txStatusId,
        ...overrides,
      }),
    };
  });
}

/**
 * Vitest helper to advance through transaction stages with fake timers
 *
 * When using vitest fake timers, this helper advances time and processes
 * microtasks between transaction stages.
 *
 * @param emitter - Mock notification emitter
 * @param txStatusId - Transaction ID
 * @param options - Simulation options
 *
 * @example
 * ```typescript
 * import { vi } from 'vitest';
 *
 * beforeEach(() => {
 *   vi.useFakeTimers();
 * });
 *
 * it('should progress through stages', async () => {
 *   const emitter = createMockAztecNotificationEmitter();
 *
 *   const promise = simulateTransactionWithFakeTimers(emitter, 'tx-1', {
 *     stageDelay: 1000,
 *   });
 *
 *   // Advance through each stage
 *   await vi.advanceTimersByTimeAsync(1000); // idle -> simulating
 *   await vi.advanceTimersByTimeAsync(1000); // simulating -> proving
 *   // ... etc
 *
 *   await promise;
 * });
 * ```
 */
export async function simulateTransactionWithFakeTimers(
  emitter: MockAztecNotificationEmitter,
  txStatusId: string,
  options: SimulateTransactionOptions = {},
): Promise<void> {
  // When using fake timers, the simulation runs instantly
  // Tests should manually advance timers as needed
  return emitter.simulateTransaction(txStatusId, {
    ...options,
    stageDelay: options.stageDelay ?? 0,
  });
}
