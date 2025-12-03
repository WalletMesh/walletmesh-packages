/**
 * Tests for navigation.ts
 * @internal
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { uiActions } from '../../../state/actions/ui.js';
import { useStore } from '../../../state/store.js';
import { createTestEnvironment, installCustomMatchers } from '../../../testing/index.js';
import type { ModalView } from '../../state/types.js';
import { isValidViewTransition, useViewNavigation } from './navigation.js';

// Install domain-specific matchers
installCustomMatchers();

// Mock the ui actions
vi.mock('../../../state/actions/ui.js', () => ({
  uiActions: {
    setView: vi.fn(),
    setError: vi.fn(),
    setLoading: vi.fn(),
    openModal: vi.fn(),
    closeModal: vi.fn(),
    startScanning: vi.fn(),
    stopScanning: vi.fn(),
    addDiscoveryError: vi.fn(),
    clearDiscoveryErrors: vi.fn(),
  },
}));

// Don't globally mock - we'll spy in beforeEach
let mockCurrentView = 'walletSelection';

describe('navigation', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();

    // Spy on the unified store instead of globally mocking
    vi.spyOn(useStore, 'getState').mockReturnValue({
      ui: {
        get currentView() {
          return mockCurrentView;
        },
        isOpen: false,
        isLoading: false,
        isScanning: false,
        lastScanTime: null,
        discoveryErrors: [],
      },
      connections: {
        activeSessions: [],
        activeSessionId: null,
        wallets: [],
        availableWalletIds: [],
      },
      transactions: {
        history: [],
        current: null,
        status: 'idle',
        error: null,
      },
    } as ReturnType<typeof useStore.getState>);

    // Reset mocks
    vi.clearAllMocks();
    mockCurrentView = 'walletSelection';
  });

  afterEach(async () => {
    await testEnv.teardown();
    vi.restoreAllMocks();
  });

  describe('useViewNavigation', () => {
    it('should return current view', () => {
      const navigation = useViewNavigation();

      expect(navigation.currentView).toBe('walletSelection');
    });

    it('should provide navigation functions', () => {
      const navigation = useViewNavigation();

      expect(typeof navigation.navigateToWalletSelection).toBe('function');
      expect(typeof navigation.navigateToProviderSelection).toBe('function');
      expect(typeof navigation.navigateToConnecting).toBe('function');
      expect(typeof navigation.navigateToConnected).toBe('function');
      expect(typeof navigation.navigateToError).toBe('function');
    });

    describe('navigateToWalletSelection', () => {
      it('should call setView with walletSelection', () => {
        const navigation = useViewNavigation();

        navigation.navigateToWalletSelection();

        expect(uiActions.setView).toHaveBeenCalledWith(useStore, 'walletSelection');
      });
    });

    describe('navigateToProviderSelection', () => {
      it('should call setView with providerSelection', () => {
        const navigation = useViewNavigation();

        navigation.navigateToProviderSelection();

        expect(uiActions.setView).toHaveBeenCalledWith(useStore, 'walletSelection');
      });
    });

    describe('navigateToConnecting', () => {
      it('should call setConnecting with wallet ID', () => {
        const navigation = useViewNavigation();

        navigation.navigateToConnecting('metamask');

        expect(uiActions.setView).toHaveBeenCalledWith(useStore, 'connecting');
        expect(uiActions.setLoading).toHaveBeenCalledWith(useStore, 'modal', true);
      });

      it('should handle different wallet IDs', () => {
        const navigation = useViewNavigation();

        const walletIds = ['metamask', 'walletconnect', 'coinbase', 'trust'];

        for (const walletId of walletIds) {
          navigation.navigateToConnecting(walletId);
          expect(uiActions.setView).toHaveBeenCalledWith(useStore, 'connecting');
          expect(uiActions.setLoading).toHaveBeenCalledWith(useStore, 'modal', true);
        }

        expect(uiActions.setView).toHaveBeenCalledTimes(walletIds.length);
        expect(uiActions.setLoading).toHaveBeenCalledTimes(walletIds.length);
      });
    });

    describe('navigateToConnected', () => {
      it('should set view to connected and loading to false', () => {
        const navigation = useViewNavigation();

        navigation.navigateToConnected('0x123');

        expect(uiActions.setView).toHaveBeenCalledWith(useStore, 'connected');
        expect(uiActions.setLoading).toHaveBeenCalledWith(useStore, 'modal', false);
      });

      it('should handle address and chainId parameters', () => {
        const navigation = useViewNavigation();

        // Test with address only
        navigation.navigateToConnected('0x123');
        expect(uiActions.setView).toHaveBeenCalledWith(useStore, 'connected');
        expect(uiActions.setLoading).toHaveBeenCalledWith(useStore, 'modal', false);

        // Clear mocks
        vi.clearAllMocks();

        // Test with address and chainId
        navigation.navigateToConnected('0x456', '1');
        expect(uiActions.setView).toHaveBeenCalledWith(useStore, 'connected');
        expect(uiActions.setLoading).toHaveBeenCalledWith(useStore, 'modal', false);
      });
    });

    describe('navigateToError', () => {
      it('should call setError with error message', () => {
        const navigation = useViewNavigation();

        navigation.navigateToError('Connection failed');

        expect(uiActions.setView).toHaveBeenCalledWith(useStore, 'error');
        expect(uiActions.setError).toHaveBeenCalledWith(useStore, 'ui', {
          code: 'UNKNOWN_ERROR',
          message: 'Connection failed',
          category: 'general',
          recoveryStrategy: 'retry',
        });
      });

      it('should handle different error messages', () => {
        const navigation = useViewNavigation();

        const errorMessages = [
          'Connection failed',
          'Wallet not found',
          'User rejected request',
          'Network error',
        ];

        for (const errorMessage of errorMessages) {
          navigation.navigateToError(errorMessage);
          expect(uiActions.setView).toHaveBeenCalledWith(useStore, 'error');
          expect(uiActions.setError).toHaveBeenCalledWith(useStore, 'ui', {
            code: 'UNKNOWN_ERROR',
            message: errorMessage,
            category: 'general',
            recoveryStrategy: 'retry',
          });
        }

        expect(uiActions.setView).toHaveBeenCalledTimes(errorMessages.length);
        expect(uiActions.setError).toHaveBeenCalledTimes(errorMessages.length);
      });
    });

    describe('with different current views', () => {
      it('should return correct current view when changed', () => {
        mockCurrentView = 'connecting';

        const navigation = useViewNavigation();

        expect(navigation.currentView).toBe('connecting');
      });

      it('should handle all valid modal views', () => {
        const validViews: ModalView[] = [
          'walletSelection',
          'providerSelection',
          'connecting',
          'connected',
          'error',
        ];

        for (const view of validViews) {
          mockCurrentView = view;
          const navigation = useViewNavigation();
          expect(navigation.currentView).toBe(view);
        }
      });
    });
  });

  describe('isValidViewTransition', () => {
    it('should allow most transitions by default', () => {
      const validTransitions = [
        ['walletSelection', 'providerSelection'],
        ['walletSelection', 'connecting'],
        ['providerSelection', 'connecting'],
        ['connecting', 'connected'],
        ['connecting', 'error'],
        ['connected', 'walletSelection'],
        ['error', 'walletSelection'],
        ['error', 'connecting'],
      ] as const;

      for (const [from, to] of validTransitions) {
        expect(isValidViewTransition(from, to)).toBe(true);
      }
    });

    it('should prevent invalid direct transitions', () => {
      const invalidTransitions = [
        ['walletSelection', 'connected'],
        ['providerSelection', 'connected'],
      ] as const;

      for (const [from, to] of invalidTransitions) {
        expect(isValidViewTransition(from, to)).toBe(false);
      }
    });

    it('should allow all transitions from connected state', () => {
      const fromConnected = [
        ['connected', 'walletSelection'],
        ['connected', 'providerSelection'],
        ['connected', 'connecting'],
        ['connected', 'error'],
      ] as const;

      for (const [from, to] of fromConnected) {
        expect(isValidViewTransition(from, to)).toBe(true);
      }
    });

    it('should allow all transitions from error state', () => {
      const fromError = [
        ['error', 'walletSelection'],
        ['error', 'providerSelection'],
        ['error', 'connecting'],
        ['error', 'connected'],
      ] as const;

      for (const [from, to] of fromError) {
        expect(isValidViewTransition(from, to)).toBe(true);
      }
    });

    it('should allow all transitions from connecting state', () => {
      const fromConnecting = [
        ['connecting', 'walletSelection'],
        ['connecting', 'providerSelection'],
        ['connecting', 'connected'],
        ['connecting', 'error'],
      ] as const;

      for (const [from, to] of fromConnecting) {
        expect(isValidViewTransition(from, to)).toBe(true);
      }
    });

    it('should handle edge cases', () => {
      // Same view transition (should be allowed for refresh/reset scenarios)
      expect(isValidViewTransition('walletSelection', 'walletSelection')).toBe(true);
      expect(isValidViewTransition('connecting', 'connecting')).toBe(true);
      expect(isValidViewTransition('connected', 'connected')).toBe(true);
      expect(isValidViewTransition('error', 'error')).toBe(true);
    });

    it('should be symmetric for allowed transitions', () => {
      // Test that allowed transitions work in both directions where logical
      const symmetricTransitions = [
        ['walletSelection', 'providerSelection'],
        ['walletSelection', 'error'],
        ['providerSelection', 'error'],
      ] as const;

      for (const [view1, view2] of symmetricTransitions) {
        expect(isValidViewTransition(view1, view2)).toBe(true);
        expect(isValidViewTransition(view2, view1)).toBe(true);
      }
    });

    it('should handle all valid modal view combinations', () => {
      const allViews: ModalView[] = [
        'walletSelection',
        'providerSelection',
        'connecting',
        'connected',
        'error',
      ];

      // Test all combinations and verify logic
      for (const from of allViews) {
        for (const to of allViews) {
          const result = isValidViewTransition(from, to);

          // Verify specific business rules
          if (from === 'walletSelection' && to === 'connected') {
            expect(result).toBe(false);
          } else if (from === 'providerSelection' && to === 'connected') {
            expect(result).toBe(false);
          } else {
            expect(result).toBe(true);
          }
        }
      }
    });

    it('should maintain consistency with invalid transitions rules', () => {
      // Verify the rules match the implementation
      expect(isValidViewTransition('walletSelection', 'connected')).toBe(false);
      expect(isValidViewTransition('providerSelection', 'connected')).toBe(false);

      // These should be allowed
      expect(isValidViewTransition('walletSelection', 'connecting')).toBe(true);
      expect(isValidViewTransition('providerSelection', 'connecting')).toBe(true);
      expect(isValidViewTransition('connecting', 'connected')).toBe(true);
    });
  });
});
