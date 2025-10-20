/**
 * Integration tests for AztecTransactionStatusOverlay
 *
 * Tests the full transaction lifecycle display, auto-dismiss behavior,
 * navigation guards, focus trapping, and ESC key handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { AztecTransactionStatusOverlay } from './AztecTransactionStatusOverlay.js';
import type { WalletMeshState, TransactionResult, TransactionStatus, ChainType } from '@walletmesh/modal-core';

// Mock useStore hook with transaction state
let mockState: WalletMeshState;

vi.mock('../hooks/internal/useStore.js', () => ({
  useStore: vi.fn((selector?: (state: WalletMeshState) => unknown) => {
    if (selector) {
      return selector(mockState);
    }
    return mockState;
  }),
}));

// Helper to create properly typed transaction result
function createMockTransaction(
  txId: string,
  status: TransactionStatus,
  overrides: Partial<TransactionResult> = {}
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
    vi.useRealTimers();
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

      // Progress to confirmed
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'confirmed');
      rerender(<AztecTransactionStatusOverlay />);
      expect(screen.getByRole('heading', { name: 'Confirmed' })).toBeInTheDocument();
      expect(screen.getByText('Transaction successful')).toBeInTheDocument();
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
    it('should auto-dismiss after confirmed transaction', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'confirming', { startTime: Date.now() });

      const { rerender } = render(<AztecTransactionStatusOverlay />);

      // Initially visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Update to confirmed
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'confirmed');
      rerender(<AztecTransactionStatusOverlay />);

      // Should still be visible initially
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Confirmed' })).toBeInTheDocument();

      // Advance timers to trigger auto-dismiss (2.5 seconds)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2500);
      });

      // Overlay should be dismissed - use fake timers instead of waitFor
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should auto-dismiss after failed transaction', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', { startTime: Date.now() });

      const { rerender } = render(<AztecTransactionStatusOverlay />);

      // Update to failed
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'failed');
      rerender(<AztecTransactionStatusOverlay />);

      // Should show failed state
      expect(screen.getByRole('heading', { name: 'Failed' })).toBeInTheDocument();

      // Advance timers to trigger auto-dismiss
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2500);
      });

      // Overlay should be dismissed - use fake timers instead of waitFor
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should NOT auto-dismiss during active stages', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', { startTime: Date.now() });

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
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', { startTime: Date.now() });

      render(<AztecTransactionStatusOverlay />);

      // Should have attached beforeunload listener
      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    it('should remove beforeunload listener when transaction completes', async () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', { startTime: Date.now() });

      const { rerender, unmount } = render(<AztecTransactionStatusOverlay />);

      // Complete transaction
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'confirmed');
      rerender(<AztecTransactionStatusOverlay />);

      // Wait for auto-dismiss
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2500);
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
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', { startTime: Date.now() });

      render(<AztecTransactionStatusOverlay disableNavigationGuard={true} />);

      // Should NOT have attached beforeunload listener
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });
  });

  describe('Focus Trap and ESC Key', () => {
    it('should trap focus within overlay', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', { startTime: Date.now() });

      render(<AztecTransactionStatusOverlay />);

      const overlay = screen.getByRole('dialog');
      const content = overlay.querySelector('[tabindex="-1"]');

      // Content should be focusable
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('tabindex', '-1');
    });

    it('should allow ESC key to close when transaction completes', async () => {
      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'confirmed', { startTime: Date.now() });

      render(<AztecTransactionStatusOverlay />);

      // Advance timers to trigger useEffect and render
      await vi.advanceTimersByTimeAsync(0);

      // Overlay should be visible
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
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', { startTime: Date.now() });

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
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', { startTime: Date.now() });

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
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'confirmed', { startTime: Date.now() });

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

      // Overlay should still be visible
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
      mockState.entities.transactions[tx1] = createMockTransaction(tx1, 'proving', { txHash: '0xabc', startTime: Date.now() });
      mockState.entities.transactions[tx2] = createMockTransaction(tx2, 'sending', { txHash: '0xdef', startTime: Date.now() });

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
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', { startTime: Date.now() });

      render(
        <AztecTransactionStatusOverlay
          headline="Custom Headline"
          description="Custom Description"
        />
      );

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
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', { startTime: Date.now() });

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
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving', { startTime: Date.now() });

      render(<AztecTransactionStatusOverlay />);

      // Advance timers to trigger useEffect and render
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      // Get the overlay
      const overlay = screen.getByRole('dialog');
      expect(overlay).toHaveAttribute('aria-modal', 'true');
      expect(overlay).toHaveAttribute('aria-labelledby', 'tx-overlay-headline');
      expect(overlay).toHaveAttribute('aria-describedby', 'tx-overlay-description');

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

      // Progress to proving (stage 2)
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'proving');
      rerender(<AztecTransactionStatusOverlay />);

      progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '2');
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

    it('should clear auto-dismiss timers on unmount', async () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const txId = 'tx-1';
      mockState.active.transactionId = txId;
      mockState.entities.transactions[txId] = createMockTransaction(txId, 'confirmed', { startTime: Date.now() });

      const { unmount } = render(<AztecTransactionStatusOverlay />);

      // Advance timers to trigger useEffect and render
      await vi.advanceTimersByTimeAsync(0);

      // Verify overlay is rendered
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Advance time slightly to let the auto-dismiss timer be set
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Unmount before auto-dismiss fires
      unmount();

      // Should have cleared timers
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});
