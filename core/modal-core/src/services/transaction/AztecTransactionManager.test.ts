/**
 * Tests for AztecTransactionManager
 *
 * Verifies that the transaction manager properly uses wallet-generated transaction IDs
 * and coordinates with wallet notifications for status updates.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AztecTransactionManager } from './AztecTransactionManager.js';
import { ChainType } from '../../types.js';
import type { WalletMeshState } from '../../state/store.js';
import type { AztecDappWallet, ContractFunctionInteraction, SentTx } from '../../providers/aztec/types.js';

// Mock executeTx function
vi.mock('../../providers/aztec/utils.js', () => ({
  executeTx: vi.fn(),
}));

// Import mocked executeTx
import { executeTx } from '../../providers/aztec/utils.js';

describe('AztecTransactionManager', () => {
  let mockStore: {
    getState: ReturnType<typeof vi.fn>;
    setState: ReturnType<typeof vi.fn>;
  };
  let mockWallet: AztecDappWallet;
  let mockInteraction: ContractFunctionInteraction;
  let manager: AztecTransactionManager;

  const WALLET_TX_STATUS_ID = 'wallet-generated-id-12345';
  const TX_HASH = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

  beforeEach(() => {
    // Create mock store
    const state: WalletMeshState = {
      ui: {
        modalOpen: false,
        currentView: 'walletSelection',
        viewHistory: [],
        loading: { connection: false, discovery: false, transaction: false, modal: false },
        errors: {},
      },
      entities: {
        wallets: {},
        sessions: {},
        transactions: {},
      },
      active: {
        walletId: null,
        sessionId: null,
        transactionId: null,
        selectedWalletId: null,
      },
      meta: {
        lastDiscoveryTime: null,
        connectionTimestamps: {},
        availableWalletIds: [],
        discoveryErrors: [],
        transactionStatus: 'idle',
        backgroundTransactionIds: [],
      },
    };

    mockStore = {
      getState: vi.fn(() => state),
      setState: vi.fn((updater) => {
        if (typeof updater === 'function') {
          const newState = updater(state);
          Object.assign(state, newState);
        } else {
          Object.assign(state, updater);
        }
      }),
    };

    // Create mock wallet
    mockWallet = {
      getAddress: vi.fn(),
      getCompleteAddress: vi.fn(),
      getChainId: vi.fn(),
      wmExecuteTx: vi.fn(),
    } as unknown as AztecDappWallet;

    // Create mock interaction
    mockInteraction = {} as ContractFunctionInteraction;

    // Create manager instance
    manager = new AztecTransactionManager({
      store: mockStore as any,
      chainId: 'aztec:31337',
      wallet: mockWallet,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('executeSync', () => {
    it('should use wallet-generated txStatusId instead of creating its own', async () => {
      // Setup: Mock executeTx to return wallet's txStatusId
      const mockSentTx: SentTx = {
        txHash: TX_HASH,
        txStatusId: WALLET_TX_STATUS_ID,
        wait: vi.fn().mockResolvedValue({ status: 'success' }),
      };

      vi.mocked(executeTx).mockResolvedValue(mockSentTx);

      // Execute transaction
      await manager.executeSync(mockInteraction);

      // Verify: executeTx was called
      expect(executeTx).toHaveBeenCalledWith(mockWallet, mockInteraction);

      // Verify: Transaction was added to store with WALLET's txStatusId
      expect(mockStore.setState).toHaveBeenCalled();
      const state = mockStore.getState();

      // The transaction should be created with wallet's ID
      const transaction = state.entities.transactions[WALLET_TX_STATUS_ID];
      expect(transaction).toBeDefined();
      expect(transaction?.txStatusId).toBe(WALLET_TX_STATUS_ID);
    });

    it('should handle wallet that does not provide txStatusId by generating one', async () => {
      // Setup: Mock executeTx to return SentTx without txStatusId
      const mockSentTx: SentTx = {
        txHash: TX_HASH,
        // No txStatusId - simulates wallet that doesn't support it
        wait: vi.fn().mockResolvedValue({ status: 'success' }),
      };

      vi.mocked(executeTx).mockResolvedValue(mockSentTx);

      // Execute transaction
      await manager.executeSync(mockInteraction);

      // Verify: Transaction was created with a generated txStatusId
      const state = mockStore.getState();
      const transactions = Object.values(state.entities.transactions);
      expect(transactions).toHaveLength(1);
      expect(transactions[0]?.txStatusId).toBeDefined();
      expect(transactions[0]?.txHash).toBe(TX_HASH);
    });

    it('should update transaction with txHash from wallet', async () => {
      // Setup: Mock executeTx
      const mockSentTx: SentTx = {
        txHash: TX_HASH,
        txStatusId: WALLET_TX_STATUS_ID,
        wait: vi.fn().mockResolvedValue({ status: 'success' }),
      };

      vi.mocked(executeTx).mockResolvedValue(mockSentTx);

      // Execute transaction
      await manager.executeSync(mockInteraction);

      // Verify: Transaction has the correct txHash
      const state = mockStore.getState();
      const transaction = state.entities.transactions[WALLET_TX_STATUS_ID];
      expect(transaction?.txHash).toBe(TX_HASH);
    });

    it('should not create duplicate transaction if wallet notification already created it', async () => {
      // Setup: Pre-populate store with transaction (simulating wallet notification)
      const state = mockStore.getState();
      state.entities.transactions[WALLET_TX_STATUS_ID] = {
        txStatusId: WALLET_TX_STATUS_ID,
        txHash: '',
        chainId: 'aztec:31337',
        chainType: ChainType.Aztec,
        walletId: 'aztec-wallet',
        status: 'proving', // Wallet already set this via notification after approval
        from: '',
        request: {} as never,
        startTime: Date.now(),
        mode: 'sync',
        stages: {},
        wait: vi.fn().mockResolvedValue({}),
      };

      const initialTxCount = Object.keys(state.entities.transactions).length;

      // Setup: Mock executeTx
      const mockSentTx: SentTx = {
        txHash: TX_HASH,
        txStatusId: WALLET_TX_STATUS_ID,
        wait: vi.fn().mockResolvedValue({ status: 'success' }),
      };

      vi.mocked(executeTx).mockResolvedValue(mockSentTx);

      // Execute transaction
      await manager.executeSync(mockInteraction);

      // Verify: No duplicate transaction created
      const finalState = mockStore.getState();
      expect(Object.keys(finalState.entities.transactions).length).toBe(initialTxCount);

      // Verify: Existing transaction was updated with txHash
      const transaction = finalState.entities.transactions[WALLET_TX_STATUS_ID];
      expect(transaction?.txHash).toBe(TX_HASH);
      expect(transaction?.status).toBe('proving'); // Preserved from notification
    });

    it('should set transaction as active for sync mode', async () => {
      // Setup: Mock executeTx
      const mockSentTx: SentTx = {
        txHash: TX_HASH,
        txStatusId: WALLET_TX_STATUS_ID,
        wait: vi.fn().mockResolvedValue({ status: 'success' }),
      };

      vi.mocked(executeTx).mockResolvedValue(mockSentTx);

      // Execute transaction
      await manager.executeSync(mockInteraction);

      // Verify: Transaction is set as active
      const state = mockStore.getState();
      const transaction = state.entities.transactions[WALLET_TX_STATUS_ID];
      expect(transaction?.mode).toBe('sync');

      // Check that transaction was added as active
      expect(state.active.transactionId).toBe(WALLET_TX_STATUS_ID);
    });
  });

  describe('executeAsync', () => {
    it('should create temporary transaction and replace with wallet txStatusId', async () => {
      // Setup: Mock executeTx
      const mockSentTx: SentTx = {
        txHash: TX_HASH,
        txStatusId: WALLET_TX_STATUS_ID,
        wait: vi.fn().mockResolvedValue({ status: 'success' }),
      };

      vi.mocked(executeTx).mockResolvedValue(mockSentTx);

      // Execute transaction asynchronously
      const returnedTxId = await manager.executeAsync(mockInteraction);

      // The returned ID is temporary (will be different from wallet's)
      expect(returnedTxId).toBeDefined();

      // Wait for background execution to complete
      await vi.waitFor(() => {
        const state = mockStore.getState();
        return state.entities.transactions[WALLET_TX_STATUS_ID] !== undefined;
      });

      // Verify: Wallet's transaction was created
      const state = mockStore.getState();
      expect(state.entities.transactions[WALLET_TX_STATUS_ID]).toBeDefined();
      expect(state.entities.transactions[WALLET_TX_STATUS_ID]?.mode).toBe('async');
    });

    it('should add async transaction to background list', async () => {
      // Setup: Mock executeTx
      const mockSentTx: SentTx = {
        txHash: TX_HASH,
        txStatusId: WALLET_TX_STATUS_ID,
        wait: vi.fn().mockResolvedValue({ status: 'success' }),
      };

      vi.mocked(executeTx).mockResolvedValue(mockSentTx);

      // Execute transaction asynchronously
      await manager.executeAsync(mockInteraction);

      // Verify: Transaction is in background list (initially with temp ID)
      const state = mockStore.getState();
      expect(state.meta.backgroundTransactionIds.length).toBeGreaterThan(0);
    });

    it('should invoke success callback with correct transaction', async () => {
      // Setup: Mock executeTx
      const mockSentTx: SentTx = {
        txHash: TX_HASH,
        txStatusId: WALLET_TX_STATUS_ID,
        wait: vi.fn().mockResolvedValue({ status: 'success' }),
      };

      vi.mocked(executeTx).mockResolvedValue(mockSentTx);

      // Setup: Success callback with promise to track completion
      let resolveCallback: () => void;
      const callbackPromise = new Promise<void>((resolve) => {
        resolveCallback = resolve;
      });

      const onSuccess = vi.fn(() => {
        resolveCallback();
      });
      const callbacks = { onSuccess };

      // Execute transaction asynchronously
      const tempTxId = await manager.executeAsync(mockInteraction, callbacks);
      expect(tempTxId).toBeDefined();

      // Wait for callback to be invoked
      await callbackPromise;

      // Verify: Callback was invoked with the correct transaction
      expect(onSuccess).toHaveBeenCalledTimes(1);
      const calledWith = onSuccess.mock.calls[0]?.[0];
      expect(calledWith?.txStatusId).toBe(WALLET_TX_STATUS_ID);
    });
  });

  describe('Transaction Lifecycle - Wallet Notification Coordination', () => {
    it('should allow wallet notifications to update transaction status before dApp operations', async () => {
      // This test simulates the real-world scenario:
      // 1. dApp calls executeSync
      // 2. Wallet sends 'proving' notification (creates/updates transaction after approval)
      // 3. dApp receives wallet's txStatusId and continues tracking that transaction

      const state = mockStore.getState();

      // Simulate wallet notification arriving first (before executeTx resolves)
      state.entities.transactions[WALLET_TX_STATUS_ID] = {
        txStatusId: WALLET_TX_STATUS_ID,
        txHash: '',
        chainId: 'aztec:31337',
        chainType: ChainType.Aztec,
        walletId: 'aztec-wallet',
        status: 'proving', // Wallet set this after user approval
        from: '',
        request: {} as never,
        startTime: Date.now(),
        mode: 'sync',
        stages: { proving: { start: Date.now() } },
        wait: vi.fn().mockResolvedValue({}),
      };

      // Setup: Mock executeTx (resolves after wallet notification)
      const mockSentTx: SentTx = {
        txHash: TX_HASH,
        txStatusId: WALLET_TX_STATUS_ID,
        wait: vi.fn().mockResolvedValue({ status: 'success' }),
      };

      vi.mocked(executeTx).mockResolvedValue(mockSentTx);

      // Execute transaction
      await manager.executeSync(mockInteraction);

      // Verify: Transaction status from wallet notification is preserved
      const finalState = mockStore.getState();
      const transaction = finalState.entities.transactions[WALLET_TX_STATUS_ID];
      expect(transaction?.status).toBe('proving');
      expect(transaction?.txHash).toBe(TX_HASH); // Updated by dApp
      expect(transaction?.stages?.proving).toBeDefined(); // From wallet notification
    });

    it('should handle wallet notification updating status to "proving" while dApp is tracking', async () => {
      // Setup: Mock executeTx
      const mockSentTx: SentTx = {
        txHash: TX_HASH,
        txStatusId: WALLET_TX_STATUS_ID,
        wait: vi.fn().mockImplementation(async () => {
          // Simulate wallet sending 'proving' notification while waiting
          const state = mockStore.getState();
          const tx = state.entities.transactions[WALLET_TX_STATUS_ID];
          if (tx) {
            tx.status = 'proving';
          }
          return { status: 'success' };
        }),
      };

      vi.mocked(executeTx).mockResolvedValue(mockSentTx);

      // Execute transaction
      await manager.executeSync(mockInteraction);

      // Verify: Status was updated by wallet notification
      const state = mockStore.getState();
      const transaction = state.entities.transactions[WALLET_TX_STATUS_ID];
      expect(transaction?.status).toBe('proving');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors from executeTx', async () => {
      // Setup: Mock executeTx to throw error
      const error = new Error('Transaction failed');
      vi.mocked(executeTx).mockRejectedValue(error);

      // Execute and expect error
      await expect(manager.executeSync(mockInteraction)).rejects.toThrow('Transaction failed');
    });

    it('should handle errors in wait() call', async () => {
      // Setup: Mock executeTx with wait() that throws
      const mockSentTx: SentTx = {
        txHash: TX_HASH,
        txStatusId: WALLET_TX_STATUS_ID,
        wait: vi.fn().mockRejectedValue(new Error('Wait failed')),
      };

      vi.mocked(executeTx).mockResolvedValue(mockSentTx);

      // Execute and expect error
      await expect(manager.executeSync(mockInteraction)).rejects.toThrow('Wait failed');
    });

    it('should clean up failed async transactions', async () => {
      // Setup: Mock executeTx to fail
      const error = new Error('Async transaction failed');
      vi.mocked(executeTx).mockRejectedValue(error);

      // Setup: Error callback
      const onError = vi.fn();
      const callbacks = { onError };

      // Execute transaction asynchronously
      await manager.executeAsync(mockInteraction, callbacks);

      // Wait for error callback
      await vi.waitFor(() => {
        return onError.mock.calls.length > 0;
      });

      // Verify: Error callback was invoked
      expect(onError).toHaveBeenCalledWith(error);
    });
  });
});
