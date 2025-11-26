/**
 * Integration tests for AztecTransactionStatusOverlay
 *
 * Tests the full transaction lifecycle display, auto-dismiss behavior,
 * navigation guards, focus trapping, and ESC key handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { AztecTransactionStatusOverlay } from './AztecTransactionStatusOverlay.js';
import type {
  WalletMeshState,
  TransactionResult,
  TransactionStatus,
  ChainType,
} from '@walletmesh/modal-core';

// Mock useStore hook with transaction state
let mockState: WalletMeshState;

// Create a mock store instance with setState for ESC key dismiss
const mockStoreInstance = {
  getState: vi.fn(() => mockState),
  setState: vi.fn(),
  subscribe: vi.fn(() => () => {}),
};

vi.mock('../hooks/internal/useStore.js', () => ({
  useStore: vi.fn((selector?: (state: WalletMeshState) => unknown) => {
    if (selector) {
      return selector(mockState);
    }
    return mockState;
  }),
  useStoreWithEquality: vi.fn((selector?: (state: WalletMeshState) => unknown) => {
    if (selector) {
      return selector(mockState);
    }
    return mockState;
  }),
  shallowEqual: vi.fn((a: unknown, b: unknown) => a === b),
  useStoreInstance: vi.fn(() => mockStoreInstance),
}));

// Mock useFocusTrap hook
const mockFocusTrapRef = { current: null };
vi.mock('../utils/useFocusTrap.js', () => ({
  useFocusTrap: vi.fn(() => mockFocusTrapRef),
}));

// Helper to create properly typed transaction result
function createMockTransaction(
  txId: string,
  status: TransactionStatus,
  overrides: Partial<TransactionResult> = {},
): TransactionResult {
  return {
    txStatusId: txId,
    txHash: overrides.txHash || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    chainId: '31337',
    chainType: 'aztec' as ChainType,
    walletId: 'aztec-wallet',
    status,
    from: '0x1234567890123456789012345678901234567890',
    request: {
      contractAddress: '0xcontract',
      functionName: 'transfer',
      args: [],
    },
    startTime: Date.now(),
    wait: vi.fn().mockResolvedValue({}),
    ...overrides,
  };
}

describe('AztecTransactionStatusOverlay - Integration Tests', () => {
  beforeEach(() => {
    // Reset mock state before each test
    mockState = {
      ui: {
        modalOpen: false,
        currentView: 'walletSelection' as const,
        viewHistory: [],
        loading: { connection: false, discovery: false, transaction: false },
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
        transactionStatus: 'idle' as const,
        backgroundTransactionIds: [],
      },
    };

    // Clear all mocks
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup(); // Properly cleanup React components
    vi.clearAllTimers();
  });

  describe('Sync Transaction Flow', () => {
    it('should display full-screen overlay for active transaction', async () => {
      // Setup: Active transaction in idle state
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'idle');

      render(<AztecTransactionStatusOverlay />);

      // Advance timers to trigger useEffect and render
      await vi.advanceTimersByTimeAsync(0);

      // Overlay should be visible
      const overlay = screen.getByRole('dialog');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveAttribute('aria-modal', 'true');

      // Should show starting state
      expect(screen.getByRole('heading', { name: 'Starting' })).toBeInTheDocument();
      expect(screen.getByText('Initializing transaction')).toBeInTheDocument();
    });

    it('should progress through all transaction stages', async () => {
      const txId = 'tx-1';

      // Start with idle
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'idle');

      const { rerender } = render(<AztecTransactionStatusOverlay />);

      // Verify idle state
      expect(screen.getByRole('heading', { name: 'Starting' })).toBeInTheDocument();

      // Progress to simulating
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'simulating');
      rerender(<AztecTransactionStatusOverlay />);
      expect(screen.getByRole('heading', { name: 'Simulating' })).toBeInTheDocument();

      // Progress to proving (the long stage)
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving');
      rerender(<AztecTransactionStatusOverlay />);
      expect(screen.getByRole('heading', { name: 'Generating Proof' })).toBeInTheDocument();
      expect(screen.getByText('Creating zero-knowledge proof (1-2 minutes)')).toBeInTheDocument();

      // Progress to sending
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'sending', { txHash: '0xabc123' });
      rerender(<AztecTransactionStatusOverlay />);
      expect(screen.getByRole('heading', { name: 'Sending' })).toBeInTheDocument();

      // Progress to failed (stays visible until dismissed)
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'failed');
      rerender(<AztecTransactionStatusOverlay />);
      expect(screen.getByRole('heading', { name: 'Failed' })).toBeInTheDocument();
      expect(screen.getByText('Transaction failed')).toBeInTheDocument();

      // Note: confirmed transactions auto-dismiss immediately,
      // so we test the failed state which stays visible
    });

    it('should display transaction hash when available', async () => {
      const txId = 'tx-1';
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'sending', { txHash });

      render(<AztecTransactionStatusOverlay />);

      // Should show shortened hash
      const shortened = `${txHash.slice(0, 8)}…${txHash.slice(-6)}`;
      expect(screen.getByText(shortened)).toBeInTheDocument();
    });

    it('should show elapsed time for transaction', async () => {
      const txId = 'tx-1';
      const startTime = Date.now() - 5000; // 5 seconds ago

      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', { startTime });

      render(<AztecTransactionStatusOverlay />);

      // Should show duration (approximately 5 seconds)
      // Use fake timers to avoid waiting
      await vi.advanceTimersByTimeAsync(0);
      const durationText = screen.getByText(/\d+\.\d+s/);
      expect(durationText).toBeInTheDocument();
    });
  });

  describe('Auto-Dismiss Behavior', () => {
    it('should show success state for 1 second then auto-dismiss when confirmed', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'confirmed', {
        startTime: Date.now(),
      });

      render(<AztecTransactionStatusOverlay />);

      // Let effect run - overlay should show success state
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      // Overlay should still be visible showing "Confirmed" success state
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Confirmed' })).toBeInTheDocument();

      // Wait for 1-second delay
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });

      // Overlay should be dismissed after the delay
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should NOT auto-dismiss failed transactions (user must dismiss)', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', {
        startTime: Date.now(),
      });

      const { rerender } = render(<AztecTransactionStatusOverlay />);

      // Update to failed
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'failed');
      rerender(<AztecTransactionStatusOverlay />);

      // Should show failed state
      expect(screen.getByRole('heading', { name: 'Failed' })).toBeInTheDocument();

      // Even after significant time, overlay should remain visible
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      // Overlay should still be visible (failed transactions require user dismissal)
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Verify dismiss button is present
      const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
      expect(dismissButton).toBeInTheDocument();
    });

    it('should NOT auto-dismiss during active stages', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', {
        startTime: Date.now(),
      });

      render(<AztecTransactionStatusOverlay />);

      // Advance timers (more than auto-dismiss delay)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      // Should still be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Generating Proof' })).toBeInTheDocument();
    });
  });

  describe('Navigation Guard', () => {
    it('should attach beforeunload listener during active transaction', async () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', {
        startTime: Date.now(),
      });

      render(<AztecTransactionStatusOverlay />);

      // Should have attached beforeunload listener
      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    it('should remove beforeunload listener when transaction completes', async () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', {
        startTime: Date.now(),
      });

      const { unmount } = render(<AztecTransactionStatusOverlay />);

      // Complete transaction (confirmed transactions auto-dismiss immediately)
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'confirmed');

      // Allow React to process the state update and auto-dismiss
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      // Unmount to trigger cleanup
      unmount();

      // Should have removed listener
      expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    it('should NOT attach navigation guard when disabled', async () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      addEventListenerSpy.mockClear();

      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', {
        startTime: Date.now(),
      });

      render(<AztecTransactionStatusOverlay disableNavigationGuard={true} />);

      // Should NOT have attached beforeunload listener
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });
  });

  describe('Focus Trap and ESC Key', () => {
    it('should trap focus within overlay', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', {
        startTime: Date.now(),
      });

      render(<AztecTransactionStatusOverlay />);

      const overlay = screen.getByRole('dialog');
      const content = overlay.querySelector('[tabindex="-1"]');

      // Content should be focusable
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('tabindex', '-1');
    });

    it('should allow ESC key to close when transaction fails', async () => {
      // Note: confirmed transactions auto-dismiss immediately,
      // so we test ESC dismissal with failed transactions which require user action
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'failed', {
        startTime: Date.now(),
      });

      render(<AztecTransactionStatusOverlay />);

      // Advance timers to trigger useEffect and render
      await vi.advanceTimersByTimeAsync(0);

      // Overlay should be visible (failed transactions stay until dismissed)
      const overlay = screen.getByRole('dialog');
      expect(overlay).toBeInTheDocument();

      // Press ESC key using direct event dispatch
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        // Give time for state update
        await vi.advanceTimersByTimeAsync(100);
      });

      // Overlay should be dismissed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should NOT allow ESC key during active stages', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', {
        startTime: Date.now(),
      });

      render(<AztecTransactionStatusOverlay />);

      // Advance timers to trigger useEffect and render
      await vi.advanceTimersByTimeAsync(0);

      // Press ESC key using direct event dispatch
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await vi.advanceTimersByTimeAsync(100);
      });

      // Overlay should still be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Generating Proof' })).toBeInTheDocument();
    });

    it('should disable focus trap when requested', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', {
        startTime: Date.now(),
      });

      render(<AztecTransactionStatusOverlay disableFocusTrap={true} />);

      // Advance timers to trigger useEffect and render
      await vi.advanceTimersByTimeAsync(0);

      // Overlay should still render
      const overlay = screen.getByRole('dialog');
      expect(overlay).toBeInTheDocument();
    });

    it('should disable ESC key when requested', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      // Use 'failed' status since 'confirmed' auto-dismisses immediately
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'failed', {
        startTime: Date.now(),
      });

      render(<AztecTransactionStatusOverlay allowEscapeKeyClose={false} />);

      // Advance timers to trigger useEffect and render
      await vi.advanceTimersByTimeAsync(0);

      // Get the overlay
      const overlay = screen.getByRole('dialog');
      expect(overlay).toBeInTheDocument();

      // Press ESC key using direct event dispatch
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await vi.advanceTimersByTimeAsync(100);
      });

      // Overlay should still be visible (ESC disabled)
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Multiple Concurrent Transactions', () => {
    it('should show primary transaction by default', async () => {
      const tx1 = 'tx-1';
      const tx2 = 'tx-2';

      // Setup two transactions
      mockState.active.transactionId = tx1;
      mockState.meta.backgroundTransactionIds = [tx2];
      mockState.entities.transactions[tx1] = createMockTransaction(tx1, 'proving', { startTime: Date.now() });
      mockState.entities.transactions[tx2] = createMockTransaction(tx2, 'sending', { startTime: Date.now() });

      render(<AztecTransactionStatusOverlay />);

      // Advance timers to trigger useEffect and render
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      // Should show primary transaction (tx1)
      expect(screen.getByRole('heading', { name: 'Generating Proof' })).toBeInTheDocument();

      // Should NOT show background transaction by default
      expect(screen.queryByText(/Processing 2 transactions/)).not.toBeInTheDocument();
    });

    it('should show multiple transactions when enabled', async () => {
      const tx1 = 'tx-1';
      const tx2 = 'tx-2';

      mockState.active.transactionId = tx1;
      mockState.meta.backgroundTransactionIds = [tx2];
      mockState.entities.transactions[tx1] = createMockTransaction(tx1, 'proving', {
        txHash: '0xabc',
        startTime: Date.now(),
      });
      mockState.entities.transactions[tx2] = createMockTransaction(tx2, 'sending', {
        txHash: '0xdef',
        startTime: Date.now(),
      });

      render(<AztecTransactionStatusOverlay showBackgroundTransactions={true} />);

      // Advance timers to trigger useEffect and render
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      // Should show both transactions
      expect(screen.getByText(/Processing 2 transactions/)).toBeInTheDocument();

      // Should show both transaction hashes
      expect(screen.getByText(/0xabc/)).toBeInTheDocument();
      expect(screen.getByText(/0xdef/)).toBeInTheDocument();
    });
  });

  describe('Custom Text and Container', () => {
    it('should use custom headline and description', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', {
        startTime: Date.now(),
      });

      render(<AztecTransactionStatusOverlay headline="Custom Headline" description="Custom Description" />);

      // Advance timers to trigger useEffect and render
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      // Use role-based queries for better reliability
      expect(screen.getByRole('heading', { name: 'Custom Headline' })).toBeInTheDocument();
      expect(screen.getByText('Custom Description')).toBeInTheDocument();

      // Should NOT show default text
      expect(screen.queryByRole('heading', { name: 'Generating Proof' })).not.toBeInTheDocument();
    });

    it('should render into custom container', async () => {
      const customContainer = document.createElement('div');
      customContainer.id = 'custom-overlay-container';
      document.body.appendChild(customContainer);

      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', {
        startTime: Date.now(),
      });

      render(<AztecTransactionStatusOverlay container={customContainer} />);

      // Overlay should be in custom container - use fake timers instead of waitFor
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(customContainer.querySelector('[role="dialog"]')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', {
        startTime: Date.now(),
      });

      render(<AztecTransactionStatusOverlay />);

      // Advance timers to trigger useEffect and render
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      // Get the overlay
      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveAttribute('aria-modal', 'true');

      // Verify aria-labelledby and aria-describedby reference valid elements (dynamic IDs from useId)
      const labelledBy = overlay.getAttribute('aria-labelledby');
      const describedBy = overlay.getAttribute('aria-describedby');
      expect(labelledBy).toBeTruthy();
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(labelledBy!)).toBeTruthy();
      expect(document.getElementById(describedBy!)).toBeTruthy();

      // Progress bar should have aria-valuenow
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax');
    });

    it('should update progressbar value based on current stage', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'idle');

      const { rerender } = render(<AztecTransactionStatusOverlay />);

      // Advance timers to trigger useEffect and render
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      let progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');

      // Progress to proving (stage 1 in simplified STAGE_ORDER)
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving');
      rerender(<AztecTransactionStatusOverlay />);

      progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '1');
    });
  });

  describe('Edge Cases', () => {
    it('should not render when no transaction is active', () => {
      // No active transaction
      const { container } = render(<AztecTransactionStatusOverlay />);

      // Should not render anything
      expect(container.firstChild).toBeNull();
    });

    it('should handle missing transaction data gracefully', async () => {
      // Active transaction ID but no data in entities
      mockState.active.transactionId = 'tx-missing';

      render(<AztecTransactionStatusOverlay />);

      // Should not crash, should not render
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should handle unmount cleanly during active transaction', async () => {
      // Note: With status-based dismiss (not timers), we test clean unmount behavior
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      // Use 'proving' status which stays visible (not auto-dismissed)
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', {
        startTime: Date.now(),
      });

      const { unmount } = render(<AztecTransactionStatusOverlay />);

      // Advance timers to trigger useEffect and render
      await vi.advanceTimersByTimeAsync(0);

      // Verify overlay is rendered
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Unmount during active transaction (should not throw)
      expect(() => unmount()).not.toThrow();

      // Overlay should no longer be in document
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Wallet Notification Coordination - Regression Test', () => {
    /**
     * This test verifies the transaction notification flow after user approval.
     *
     * The overlay now appears starting from the 'proving' stage
     * (after user approval is completed in the wallet).
     */
    it('should show correct status progression as wallet sends notifications', async () => {
      // This test simulates the notification flow from wallet after approval
      const walletTxId = 'wallet-tx-lifecycle';

      // Stage 1: User approves, wallet sends 'proving' notification (first visible status)
      mockState.entities.transactions[walletTxId] = createMockTransaction(walletTxId, 'proving', {
        startTime: Date.now(),
      });
      mockState.active.transactionId = walletTxId;

      const { rerender } = render(<AztecTransactionStatusOverlay />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(screen.getByRole('heading', { name: 'Generating Proof' })).toBeInTheDocument();
      expect(screen.getByText('Creating zero-knowledge proof (1-2 minutes)')).toBeInTheDocument();

      // Stage 2: Wallet sends 'sending' notification
      mockState.entities.transactions[walletTxId] = createMockTransaction(walletTxId, 'sending', {
        startTime: Date.now(),
      });

      rerender(<AztecTransactionStatusOverlay />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(screen.getByRole('heading', { name: 'Sending' })).toBeInTheDocument();

      // Stage 3: Wallet sends 'confirmed' notification
      // Confirmed transactions show success state for 1 second then auto-dismiss
      mockState.entities.transactions[walletTxId] = createMockTransaction(walletTxId, 'confirmed', {
        startTime: Date.now(),
      });

      rerender(<AztecTransactionStatusOverlay />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      // Overlay should show "Confirmed" success state
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Confirmed' })).toBeInTheDocument();

      // Wait for 1-second delay
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });

      // Overlay should be dismissed after the delay
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should show failed status and require user dismissal', async () => {
      // Simulate a transaction that fails
      const walletTxId = 'wallet-tx-failed';

      // Stage 1: Transaction starts proving
      mockState.entities.transactions[walletTxId] = createMockTransaction(walletTxId, 'proving', {
        startTime: Date.now(),
      });
      mockState.active.transactionId = walletTxId;

      const { rerender } = render(<AztecTransactionStatusOverlay />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(screen.getByRole('heading', { name: 'Generating Proof' })).toBeInTheDocument();

      // Stage 2: Transaction fails
      mockState.entities.transactions[walletTxId] = createMockTransaction(walletTxId, 'failed', {
        startTime: Date.now(),
      });

      rerender(<AztecTransactionStatusOverlay />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      // Failed transaction stays visible - user must dismiss
      expect(screen.getByRole('heading', { name: 'Failed' })).toBeInTheDocument();
      expect(screen.getByText('Transaction failed')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });

    it('should handle case where dApp had old transaction ID and wallet creates new one', async () => {
      const oldDappTxId = 'dapp-generated-id-old';
      const walletTxId = 'wallet-generated-id-new';

      // Old scenario: dApp created transaction with its own ID
      // (this should NOT be the active transaction anymore)
      mockState.entities.transactions[oldDappTxId] = createMockTransaction(oldDappTxId, 'sending', {
        startTime: Date.now() - 5000, // Older transaction
      });

      // Wallet created its own transaction with 'proving' (first notification after approval)
      mockState.entities.transactions[walletTxId] = createMockTransaction(walletTxId, 'proving', {
        startTime: Date.now(),
      });

      // The ACTIVE transaction should be the wallet's ID
      mockState.active.transactionId = walletTxId;

      render(<AztecTransactionStatusOverlay />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      // Verify: Shows wallet's status (proving), not dApp's old status (sending)
      expect(screen.getByRole('heading', { name: 'Generating Proof' })).toBeInTheDocument();

      // Verify: "proving" is the ACTIVE stage
      const provingStage = document.querySelector('[data-stage="proving"]');
      expect(provingStage).toHaveClass('_stage--active_8dd704');
    });

    it('should only display transaction that matches wallet notification ID', async () => {
      const walletTxId = 'correct-wallet-tx-id';
      const wrongTxId = 'wrong-tx-id';

      // Setup: Two transactions in store
      mockState.entities.transactions[wrongTxId] = createMockTransaction(wrongTxId, 'sending', {
        startTime: Date.now() - 10000,
      });

      mockState.entities.transactions[walletTxId] = createMockTransaction(walletTxId, 'proving', {
        startTime: Date.now(),
      });

      // Active transaction is the wallet's ID
      mockState.active.transactionId = walletTxId;

      render(<AztecTransactionStatusOverlay />);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      // Should show the wallet's transaction status
      expect(screen.getByRole('heading', { name: 'Generating Proof' })).toBeInTheDocument();

      // Verify the transaction ID shown matches wallet's ID
      const state = mockState;
      const activeTx = state.entities.transactions[state.active.transactionId!];
      expect(activeTx?.txStatusId).toBe(walletTxId);
      expect(activeTx?.status).toBe('proving');
    });
  });
});
