/**
 * Tests for AztecTransactionStatusOverlay component
 *
 * @module components/AztecTransactionStatusOverlay.test
 */

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AztecTransactionStatusOverlay } from './AztecTransactionStatusOverlay.js';

// Import types for creating mock states
import type { TransactionResult, WalletMeshState } from '@walletmesh/modal-core';

// Helper to create a properly structured transaction result
function createMockTransaction(overrides: Partial<TransactionResult>): TransactionResult {
  return {
    txStatusId: 'tx-1',
    txHash: '0x1234567890abcdef',
    chainId: '31337',
    chainType: 'aztec',
    walletId: 'aztec-example-wallet',
    status: 'proving',
    from: '0x1234567890123456789012345678901234567890',
    // biome-ignore lint/suspicious/noExplicitAny: Test mock object
    request: {} as any,
    startTime: Date.now() - 5000,
    // biome-ignore lint/suspicious/noExplicitAny: Test mock function
    wait: async () => ({}) as any,
    ...overrides,
  } as TransactionResult;
}

// Helper to create a properly structured mock state
function createMockState(overrides?: Partial<WalletMeshState>): WalletMeshState {
  return {
    active: {
      transactionId: null,
      walletId: null,
      sessionId: null,
      selectedWalletId: null,
      ...overrides?.active,
    },
    entities: {
      wallets: {},
      sessions: {},
      transactions: {},
      ...overrides?.entities,
    },
    ui: {
      modalOpen: false,
      currentView: 'walletSelection' as const,
      viewHistory: [],
      loading: {},
      errors: {},
      ...overrides?.ui,
    },
    meta: {
      backgroundTransactionIds: [],
      lastDiscoveryTime: null,
      connectionTimestamps: {},
      availableWalletIds: [],
      discoveryErrors: [],
      transactionStatus: 'idle' as const,
      ...overrides?.meta,
    },
  };
}

// Mock the useStore hook
vi.mock('../hooks/internal/useStore.js', () => ({
  useStore: vi.fn((selector: (state: WalletMeshState) => unknown) => {
    const mockState = createMockState({
      active: { transactionId: 'tx-1', walletId: null, sessionId: null, selectedWalletId: null },
      entities: {
        wallets: {},
        sessions: {},
        transactions: {
          'tx-1': createMockTransaction({
            txStatusId: 'tx-1',
            status: 'proving',
          }),
        },
      },
    });
    return selector(mockState);
  }),
}));

// Mock useFocusTrap hook
const mockFocusTrapRef = { current: null };
vi.mock('../utils/useFocusTrap.js', () => ({
  useFocusTrap: vi.fn(() => mockFocusTrapRef),
}));

// Import mocked modules
import { useStore } from '../hooks/internal/useStore.js';
import { useFocusTrap } from '../utils/useFocusTrap.js';

describe('AztecTransactionStatusOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    // Reset DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {});

  describe('Focus Trapping', () => {
    it('should enable focus trap by default', () => {
      render(<AztecTransactionStatusOverlay />);

      expect(useFocusTrap).toHaveBeenCalledWith({
        enabled: true,
        autoFocus: true,
        restoreFocus: true,
      });
    });

    it('should disable focus trap when disableFocusTrap is true', () => {
      render(<AztecTransactionStatusOverlay disableFocusTrap={true} />);

      expect(useFocusTrap).toHaveBeenCalledWith({
        enabled: false,
        autoFocus: true,
        restoreFocus: true,
      });
    });

    it('should attach focus trap ref to content div', async () => {
      render(<AztecTransactionStatusOverlay />);

      // Advance timers to allow React to flush updates
      await vi.advanceTimersByTimeAsync(0);

      const content = document.querySelector('[class*="content"]');
      expect(content).toBeTruthy();
      expect(content?.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('ARIA Attributes', () => {
    it('should have proper dialog role and aria attributes', async () => {
      render(<AztecTransactionStatusOverlay />);

      // Advance timers to allow React to flush updates
      await vi.advanceTimersByTimeAsync(0);

      const overlay = document.querySelector('[role="dialog"]');
      expect(overlay).toBeTruthy();
      expect(overlay?.getAttribute('aria-modal')).toBe('true');

      // Verify aria-labelledby and aria-describedby reference valid elements
      const labelledBy = overlay?.getAttribute('aria-labelledby');
      const describedBy = overlay?.getAttribute('aria-describedby');
      expect(labelledBy).toBeTruthy();
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(labelledBy!)).toBeTruthy();
      expect(document.getElementById(describedBy!)).toBeTruthy();
    });

    it('should have elements with matching IDs for aria-labelledby and aria-describedby', async () => {
      render(<AztecTransactionStatusOverlay />);

      // Advance timers to allow React to flush updates
      await vi.advanceTimersByTimeAsync(0);

      const overlay = document.querySelector('[role="dialog"]');
      const labelledBy = overlay?.getAttribute('aria-labelledby');
      const describedBy = overlay?.getAttribute('aria-describedby');

      expect(document.getElementById(labelledBy!)).toBeTruthy();
      expect(document.getElementById(describedBy!)).toBeTruthy();
    });

    it('should display custom headline and description', async () => {
      render(<AztecTransactionStatusOverlay headline="Custom Headline" description="Custom Description" />);

      // Advance timers to allow React to flush updates
      await vi.advanceTimersByTimeAsync(0);

      const overlay = document.querySelector('[role="dialog"]');
      const labelledBy = overlay?.getAttribute('aria-labelledby');
      const describedBy = overlay?.getAttribute('aria-describedby');

      const headline = document.getElementById(labelledBy!);
      const description = document.getElementById(describedBy!);

      expect(headline?.textContent).toBe('Custom Headline');
      expect(description?.textContent).toBe('Custom Description');
    });
  });

  describe('ESC Key Handling', () => {
    it('should close overlay when ESC is pressed and transaction is confirmed', async () => {
      // Mock confirmed transaction
      vi.mocked(useStore).mockImplementation((selector: (state: WalletMeshState) => unknown) => {
        const mockState = createMockState({
          active: { transactionId: 'tx-1', walletId: null, sessionId: null, selectedWalletId: null },
          entities: {
            wallets: {},
            sessions: {},
            transactions: {
              'tx-1': createMockTransaction({
                txStatusId: 'tx-1',
                status: 'confirmed',
              }),
            },
          },
        });
        return selector(mockState);
      });

      render(<AztecTransactionStatusOverlay />);

      // Wait for initial render
      await vi.advanceTimersByTimeAsync(0);
      expect(document.querySelector('[role="dialog"]')).toBeTruthy();

      // Press ESC key
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      window.dispatchEvent(escEvent);

      // Advance timers for auto-dismiss
      await vi.advanceTimersByTimeAsync(2500);

      // Overlay should be dismissed
      expect(document.querySelector('[role="dialog"]')).toBeFalsy();
    });

    it('should not close overlay when ESC is pressed and transaction is active', async () => {
      render(<AztecTransactionStatusOverlay />);

      // Wait for initial render
      await vi.advanceTimersByTimeAsync(0);
      expect(document.querySelector('[role="dialog"]')).toBeTruthy();

      // Press ESC key (transaction is still in 'proving' state)
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      window.dispatchEvent(escEvent);

      // Overlay should still be visible
      expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    });

    it('should not close overlay when allowEscapeKeyClose is false', async () => {
      // Mock confirmed transaction
      vi.mocked(useStore).mockImplementation((selector: (state: WalletMeshState) => unknown) => {
        const mockState = createMockState({
          active: { transactionId: 'tx-1', walletId: null, sessionId: null, selectedWalletId: null },
          entities: {
            wallets: {},
            sessions: {},
            transactions: {
              'tx-1': createMockTransaction({
                txStatusId: 'tx-1',
                status: 'confirmed',
              }),
            },
          },
        });
        return selector(mockState);
      });

      render(<AztecTransactionStatusOverlay allowEscapeKeyClose={false} />);

      // Wait for initial render
      await vi.advanceTimersByTimeAsync(0);
      expect(document.querySelector('[role="dialog"]')).toBeTruthy();

      // Press ESC key
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      window.dispatchEvent(escEvent);

      // Overlay should still be visible (ESC disabled)
      expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    });

    it('should close overlay when ESC is pressed and transaction is failed', async () => {
      // Mock failed transaction
      vi.mocked(useStore).mockImplementation((selector: (state: WalletMeshState) => unknown) => {
        const mockState = createMockState({
          active: { transactionId: 'tx-1', walletId: null, sessionId: null, selectedWalletId: null },
          entities: {
            wallets: {},
            sessions: {},
            transactions: {
              'tx-1': createMockTransaction({
                txStatusId: 'tx-1',
                status: 'failed',
              }),
            },
          },
        });
        return selector(mockState);
      });

      render(<AztecTransactionStatusOverlay />);

      // Wait for initial render
      await vi.advanceTimersByTimeAsync(0);
      expect(document.querySelector('[role="dialog"]')).toBeTruthy();

      // Press ESC key
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      window.dispatchEvent(escEvent);

      // Advance timers for auto-dismiss
      await vi.advanceTimersByTimeAsync(2500);

      // Overlay should be dismissed
      expect(document.querySelector('[role="dialog"]')).toBeFalsy();
    });
  });

  describe('Navigation Guard', () => {
    it('should add beforeunload listener by default', async () => {
      const beforeUnloadSpy = vi.spyOn(window, 'addEventListener');

      render(<AztecTransactionStatusOverlay />);

      // Advance timers to allow React to flush updates
      await vi.advanceTimersByTimeAsync(0);

      expect(beforeUnloadSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

      beforeUnloadSpy.mockRestore();
    });

    it('should not add beforeunload listener when disableNavigationGuard is true', async () => {
      const beforeUnloadSpy = vi.spyOn(window, 'addEventListener');

      render(<AztecTransactionStatusOverlay disableNavigationGuard={true} />);

      // Advance timers to allow React to flush updates
      await vi.advanceTimersByTimeAsync(0);

      // Should not add beforeunload listener
      const beforeUnloadCalls = beforeUnloadSpy.mock.calls.filter(
        ([event]: [string, ...unknown[]]) => event === 'beforeunload',
      );
      expect(beforeUnloadCalls.length).toBe(0);

      beforeUnloadSpy.mockRestore();
    });
  });

  describe('Auto-dismiss Behavior', () => {
    it('should auto-dismiss after 2.5 seconds when transaction is confirmed', async () => {
      // Mock confirmed transaction
      vi.mocked(useStore).mockImplementation((selector: (state: WalletMeshState) => unknown) => {
        const mockState = createMockState({
          active: { transactionId: 'tx-1', walletId: null, sessionId: null, selectedWalletId: null },
          entities: {
            wallets: {},
            sessions: {},
            transactions: {
              'tx-1': createMockTransaction({
                txStatusId: 'tx-1',
                status: 'confirmed',
              }),
            },
          },
        });
        return selector(mockState);
      });

      render(<AztecTransactionStatusOverlay />);

      // Wait for initial render
      await vi.advanceTimersByTimeAsync(0);
      expect(document.querySelector('[role="dialog"]')).toBeTruthy();

      // Advance timers by 2.5 seconds
      await vi.advanceTimersByTimeAsync(2500);

      // Flush any pending React state updates
      await vi.advanceTimersByTimeAsync(0);

      // Overlay should be dismissed
      expect(document.querySelector('[role="dialog"]')).toBeFalsy();
    });

    it('should auto-dismiss after 2.5 seconds when transaction is failed', async () => {
      // Mock failed transaction
      vi.mocked(useStore).mockImplementation((selector: (state: WalletMeshState) => unknown) => {
        const mockState = createMockState({
          active: { transactionId: 'tx-1', walletId: null, sessionId: null, selectedWalletId: null },
          entities: {
            wallets: {},
            sessions: {},
            transactions: {
              'tx-1': createMockTransaction({
                txStatusId: 'tx-1',
                status: 'failed',
              }),
            },
          },
        });
        return selector(mockState);
      });

      render(<AztecTransactionStatusOverlay />);

      // Wait for initial render
      await vi.advanceTimersByTimeAsync(0);
      expect(document.querySelector('[role="dialog"]')).toBeTruthy();

      // Advance timers by 2.5 seconds
      await vi.advanceTimersByTimeAsync(2500);

      // Flush any pending React state updates
      await vi.advanceTimersByTimeAsync(0);

      // Overlay should be dismissed
      expect(document.querySelector('[role="dialog"]')).toBeFalsy();
    });
  });

  describe('Rendering', () => {
    it('should not render when no transactions are active', () => {
      // Mock no active transactions
      vi.mocked(useStore).mockImplementation((selector: (state: WalletMeshState) => unknown) => {
        const mockState = createMockState({
          active: { transactionId: null, walletId: null, sessionId: null, selectedWalletId: null },
          entities: {
            wallets: {},
            sessions: {},
            transactions: {},
          },
        });
        return selector(mockState);
      });

      const { container } = render(<AztecTransactionStatusOverlay />);

      expect(container.firstChild).toBeFalsy();
    });

    it.skip('should render transaction details', async () => {
      render(<AztecTransactionStatusOverlay />);

      // Advance timers to allow React to flush updates and trigger useEffect
      await vi.advanceTimersByTimeAsync(0);

      // First verify the overlay is rendering
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();

      // Check for headline showing current stage
      expect(screen.getByRole('heading', { name: 'Generating Proof' })).toBeTruthy();

      // Check for stage info
      expect(screen.getByText(/Creating zero-knowledge proof/)).toBeTruthy();
    });

    it('should show multiple transactions when showBackgroundTransactions is true', async () => {
      // Mock multiple transactions
      vi.mocked(useStore).mockImplementation((selector: (state: WalletMeshState) => unknown) => {
        const mockState = createMockState({
          active: { transactionId: 'tx-1', walletId: null, sessionId: null, selectedWalletId: null },
          entities: {
            wallets: {},
            sessions: {},
            transactions: {
              'tx-1': createMockTransaction({
                txStatusId: 'tx-1',
                txHash: '0x1111111111111111',
                status: 'proving',
              }),
              'tx-2': createMockTransaction({
                txStatusId: 'tx-2',
                txHash: '0x2222222222222222',
                status: 'simulating',
                startTime: Date.now() - 3000,
              }),
            },
          },
          meta: {
            backgroundTransactionIds: ['tx-2'],
            lastDiscoveryTime: null,
            connectionTimestamps: {},
            availableWalletIds: [],
            discoveryErrors: [],
            transactionStatus: 'idle' as const,
          },
        });
        return selector(mockState);
      });

      render(<AztecTransactionStatusOverlay showBackgroundTransactions={true} />);

      // Advance timers to allow React to flush updates
      await vi.advanceTimersByTimeAsync(0);

      expect(screen.getByText(/0x111111…111111/)).toBeTruthy();
      expect(screen.getByText(/0x222222…222222/)).toBeTruthy();
      expect(screen.getByText('Processing 2 transactions')).toBeTruthy();
    });
  });
});
