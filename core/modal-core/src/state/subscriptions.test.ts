import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionState } from '../api/types/sessionState.js';
import {
  CHAIN_IDS,
  TEST_ADDRESS,
  createMockSessionState,
  createMockWalletInfo,
  createTestStore,
} from '../testing/index.js';

import { connectionActions } from './actions/connections.js';
import type { WalletMeshState } from './store.js';
// Import the modules we need to test
import {
  subscribeToAllChanges,
  subscribeToConnectionChanges,
  subscriptions,
  waitForConnection,
  waitForModalClose,
  waitForState,
} from './subscriptions.js';

// Mock only the connectionActions
vi.mock('./actions/connections.js', () => ({
  connectionActions: {
    getWalletSessions: vi.fn(),
  },
}));

describe('subscriptions', () => {
  let store: ReturnType<typeof createTestStore>;
  let originalUseStore: typeof import('./store.js').useStore;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Create a real test store
    store = createTestStore({
      enableDevtools: false,
      persistOptions: { enabled: false },
    });

    // Set initial state with proper permissions structure
    const testSession = createMockSessionState({
      sessionId: 'test-session-123',
      walletId: 'metamask',
      status: 'connected',
      primaryAddress: TEST_ADDRESS,
      chain: { chainId: '0x1', chainType: 'evm' },
      permissions: { methods: [], chains: [], events: [] },
    });

    const metamaskWallet = createMockWalletInfo('metamask', { name: 'Test Wallet' });

    store.setState({
      entities: {
        wallets: { metamask: metamaskWallet },
        sessions: { 'test-session-123': testSession },
        transactions: {},
      },
      ui: {
        modalOpen: false,
        currentView: 'walletSelection',
        viewHistory: [],
        loading: {
          isLoading: false,
          operations: {},
          modal: false,
          connection: false,
          discovery: false,
          transaction: false,
        },
        errors: {},
      },
      active: {
        walletId: 'metamask',
        sessionId: 'test-session-123',
        transactionId: null,
        selectedWalletId: null,
      },
      meta: {
        lastDiscoveryTime: null,
        connectionTimestamps: {},
        availableWalletIds: ['metamask'],
        discoveryErrors: [],
        transactionStatus: 'idle',
      },
    });

    // Store original and replace with our test store
    const storeModule = await import('./store.js');
    originalUseStore = storeModule.useStore;
    Object.assign(storeModule, { useStore: store });

    // Setup connectionActions mock
    vi.mocked(connectionActions.getWalletSessions).mockImplementation((store, walletId) => {
      const state = store.getState();
      return Object.values(state.entities.sessions).filter((s) => s.walletId === walletId);
    });
  });

  afterEach(async () => {
    // Clear all timers before restoring real timers to prevent unhandled rejections
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();

    // Restore original useStore
    if (originalUseStore) {
      const storeModule = await import('./store.js');
      Object.assign(storeModule, { useStore: originalUseStore });
    }
  });

  describe('session subscription', () => {
    it('should subscribe to session changes for a specific wallet', () => {
      const callback = vi.fn();
      const walletId = 'metamask';

      const unsubscribe = subscriptions.session(walletId).subscribe(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should call callback when session data changes', () => {
      const callback = vi.fn();
      const walletId = 'metamask';

      // Mock getWalletSessions to return sessions
      vi.mocked(connectionActions.getWalletSessions).mockReturnValueOnce([
        store.getState().entities.sessions[0],
      ]);

      // Subscribe to changes
      const unsubscribe = subscriptions.session(walletId).subscribe(callback);

      // Mock getWalletSessions to return updated sessions
      const updatedSession = createMockSessionState({
        ...store.getState().entities.sessions[0],
        primaryAddress: '0x456',
      });

      vi.mocked(connectionActions.getWalletSessions).mockReturnValue([updatedSession]);

      // Trigger subscription by changing state
      store.setState((state) => ({
        ...state,
        connections: {
          ...state.connections,
          activeSessions: [updatedSession],
        },
      }));

      expect(callback).toHaveBeenCalled();
      unsubscribe();
    });

    it('should not call callback when session data is unchanged', () => {
      const callback = vi.fn();
      const walletId = 'metamask';

      const sessions = [store.getState().entities.sessions[0]];
      vi.mocked(connectionActions.getWalletSessions).mockReturnValue(sessions);

      const unsubscribe = subscriptions.session(walletId).subscribe(callback);

      // Trigger subscription with same data (no actual change)
      const currentState = store.getState();
      store.setState(currentState);

      expect(callback).not.toHaveBeenCalled();
      unsubscribe();
    });
  });

  describe('sessions subscription', () => {
    it('should subscribe to all sessions changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.sessions().subscribe(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should call callback when sessions change', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.sessions().subscribe(callback);

      const newSession = createMockSessionState({
        sessionId: 'session2',
        walletId: 'wallet2',
        permissions: { methods: [], chains: [], events: [] },
      });

      // Update sessions
      store.setState((state) => ({
        ...state,
        entities: {
          ...state.entities,
          sessions: {
            ...state.entities.sessions,
            session2: newSession,
          },
        },
      }));

      expect(callback).toHaveBeenCalledWith(Object.values(store.getState().entities.sessions));
      unsubscribe();
    });
  });

  describe('activeWallet subscription', () => {
    it('should subscribe to active wallet changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.activeWallet().subscribe(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should call callback when active wallet changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.activeWallet().subscribe(callback);

      // Change active session ID to trigger update
      store.setState((state) => ({
        ...state,
        active: {
          ...state.active,
          sessionId: 'different-session',
        },
      }));

      expect(callback).toHaveBeenCalledWith(null);
      unsubscribe();
    });

    it('should handle wallet disconnection', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.activeWallet().subscribe(callback);

      // Clear sessions
      store.setState((state) => ({
        ...state,
        entities: {
          ...state.entities,
          sessions: {},
        },
        active: {
          ...state.active,
          sessionId: null,
        },
      }));

      expect(callback).toHaveBeenCalledWith(null);
      unsubscribe();
    });
  });

  describe('ui subscriptions', () => {
    it('should subscribe to modal open state changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.ui.isOpen(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should call callback when modal opens', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.ui.isOpen(callback);

      // Open modal
      store.setState((state) => ({
        ...state,
        ui: {
          ...state.ui,
          modalOpen: true,
        },
      }));

      expect(callback).toHaveBeenCalledWith(true);
      unsubscribe();
    });

    it('should subscribe to view changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.ui.view(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should call callback when view changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.ui.view(callback);

      // Change view
      store.setState((state) => ({
        ...state,
        ui: {
          ...state.ui,
          currentView: 'connecting',
        },
      }));

      expect(callback).toHaveBeenCalledWith('connecting');
      unsubscribe();
    });

    it('should subscribe to loading state changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.ui.loading(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should call callback when loading state changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.ui.loading(callback);

      // Set loading
      store.setState((state) => ({
        ...state,
        ui: {
          ...state.ui,
          loading: {
            ...state.ui.loading,
            isLoading: true,
          },
        },
      }));

      expect(callback).toHaveBeenCalledWith({ isLoading: true });
      unsubscribe();
    });

    it('should subscribe to error state changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.ui.error(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should call callback when error state changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.ui.error(callback);

      const error = { code: 'test_error', message: 'Test error', category: 'general' as const };

      // Set error
      store.setState((state) => ({
        ...state,
        ui: {
          ...state.ui,
          errors: {
            test: error,
          },
        },
      }));

      expect(callback).toHaveBeenCalledWith(error);
      unsubscribe();
    });
  });

  describe('availableWallets subscription', () => {
    it('should subscribe to available wallets changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.availableWallets(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should call callback when available wallets change', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.availableWallets(callback);

      const newWallet = createMockWalletInfo('wallet2', { name: 'Another Wallet' });

      // Add wallet
      store.setState((state) => ({
        ...state,
        entities: {
          ...state.entities,
          wallets: {
            ...state.entities.wallets,
            wallet2: newWallet,
          },
        },
      }));

      expect(callback).toHaveBeenCalledWith(Object.values(store.getState().entities.wallets));
      unsubscribe();
    });
  });

  describe('discovery subscriptions', () => {
    it('should subscribe to scanning state changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.discovery.isScanning(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should call callback when scanning state changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.discovery.isScanning(callback);

      // Set scanning
      store.setState((state) => ({
        ...state,
        ui: {
          ...state.ui,
          loading: {
            ...state.ui.loading,
            discovery: true,
          },
        },
      }));

      expect(callback).toHaveBeenCalledWith(true);
      unsubscribe();
    });

    it('should subscribe to discovered wallets changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.discovery.wallets(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should call callback when discovered wallets change', () => {
      const callback = vi.fn();
      const unsubscribe = subscriptions.discovery.wallets(callback);

      const newWallet = createMockWalletInfo('wallet3', { name: 'Discovered Wallet' });

      // Add discovered wallet
      store.setState((state) => ({
        ...state,
        entities: {
          ...state.entities,
          wallets: {
            ...state.entities.wallets,
            wallet3: newWallet,
          },
        },
      }));

      expect(callback).toHaveBeenCalled();
      unsubscribe();
    });
  });

  describe('waitForState', () => {
    it('should resolve when condition is met', async () => {
      const selector = (state: WalletMeshState) => state.ui.modalOpen;
      const predicate = (isOpen: boolean) => isOpen === true;
      const promise = waitForState(selector, predicate, 1000);

      // Open modal after a delay
      setTimeout(() => {
        store.setState((state) => ({
          ...state,
          ui: { ...state.ui, modalOpen: true },
        }));
      }, 100);

      await vi.advanceTimersByTimeAsync(100);
      await expect(promise).resolves.toBe(true);
    });

    it('should timeout when condition is not met', async () => {
      const selector = (state: WalletMeshState) => state.ui.modalOpen;
      const predicate = (isOpen: boolean) => isOpen === true;
      const promise = waitForState(selector, predicate, 500);

      await vi.advanceTimersByTimeAsync(600);
      await expect(promise).rejects.toMatchObject({
        code: 'request_timeout',
        message: 'Timeout waiting for state',
        category: 'network',
      });

      // Wait a bit more to ensure all cleanup is complete
      await vi.advanceTimersByTimeAsync(10);
    });

    it('should resolve immediately if condition already met', async () => {
      // Set initial state to open
      store.setState((state) => ({
        ...state,
        ui: { ...state.ui, modalOpen: true },
      }));

      const selector = (state: WalletMeshState) => state.ui.modalOpen;
      const predicate = (isOpen: boolean) => isOpen === true;
      const promise = waitForState(selector, predicate, 1000);

      await expect(promise).resolves.toBe(true);
    });
  });

  describe('waitForConnection', () => {
    it('should resolve when wallet connects', async () => {
      // Start disconnected
      store.setState((state) => ({
        ...state,
        entities: {
          ...state.entities,
          sessions: {},
        },
        active: {
          ...state.active,
          sessionId: null,
        },
      }));

      const promise = waitForConnection('metamask', 1000);

      // Connect wallet after a delay
      setTimeout(() => {
        const connectedSession = createMockSessionState({
          sessionId: 'new-session',
          walletId: 'metamask',
          status: 'connected',
          permissions: { methods: [], chains: [], events: [] },
        });

        store.setState((state) => ({
          ...state,
          entities: {
            ...state.entities,
            sessions: {
              'new-session': connectedSession,
            },
          },
          active: {
            ...state.active,
            sessionId: 'new-session',
          },
        }));
      }, 100);

      await vi.advanceTimersByTimeAsync(100);
      const result = await promise;
      expect(result).toBeDefined();
      expect(result.walletId).toBe('metamask');
    });

    it('should timeout when wallet does not connect', async () => {
      // Start disconnected
      store.setState((state) => ({
        ...state,
        entities: {
          ...state.entities,
          sessions: {},
        },
        active: {
          ...state.active,
          sessionId: null,
        },
      }));

      const promise = waitForConnection('metamask', 500);

      await vi.advanceTimersByTimeAsync(600);
      await expect(promise).rejects.toThrow('Timeout waiting for state');

      // Wait a bit more to ensure all cleanup is complete
      await vi.advanceTimersByTimeAsync(10);
    });
  });

  describe('waitForModalClose', () => {
    it('should resolve when modal closes', async () => {
      // Start with modal open
      store.setState((state) => ({
        ...state,
        ui: { ...state.ui, modalOpen: true },
      }));

      const promise = waitForModalClose(1000);

      // Close modal after a delay
      setTimeout(() => {
        store.setState((state) => ({
          ...state,
          ui: { ...state.ui, modalOpen: false },
        }));
      }, 100);

      await vi.advanceTimersByTimeAsync(100);
      await expect(promise).resolves.toBeUndefined();
    });

    it('should timeout when modal does not close', async () => {
      // Start with modal open
      store.setState((state) => ({
        ...state,
        ui: { ...state.ui, modalOpen: true },
      }));

      const promise = waitForModalClose(500);

      await vi.advanceTimersByTimeAsync(600);
      await expect(promise).rejects.toThrow('Timeout waiting for state');

      // Wait a bit more to ensure all cleanup is complete
      await vi.advanceTimersByTimeAsync(10);
    });
  });

  describe('subscribeToConnectionChanges', () => {
    it('should call appropriate handlers based on connection status', () => {
      const handlers = {
        onConnecting: vi.fn(),
        onConnected: vi.fn(),
        onDisconnected: vi.fn(),
        onError: vi.fn(),
        onReconnecting: vi.fn(),
      };

      const walletId = 'metamask';

      // Start with no sessions for this wallet
      vi.mocked(connectionActions.getWalletSessions).mockReturnValueOnce([]);

      const unsubscribe = subscribeToConnectionChanges(walletId, handlers);

      // Mock getWalletSessions to return a connected session
      const connectedSession = createMockSessionState({
        walletId: 'metamask',
        status: 'connected',
        permissions: { methods: [], chains: [], events: [] },
      });

      vi.mocked(connectionActions.getWalletSessions).mockReturnValue([connectedSession]);

      // Trigger state change to invoke subscription
      store.setState((state) => ({
        ...state,
        connections: {
          ...state.connections,
          activeSessions: [connectedSession],
        },
      }));

      expect(handlers.onConnected).toHaveBeenCalledWith({
        address: TEST_ADDRESS,
        chainId: '0x1', // Chain ID comes as hex string
      });

      unsubscribe();
    });

    it('should not call handlers when no connected session exists', () => {
      const handlers = {
        onConnecting: vi.fn(),
        onConnected: vi.fn(),
        onDisconnected: vi.fn(),
        onError: vi.fn(),
        onReconnecting: vi.fn(),
      };

      const walletId = 'metamask';

      // Mock getWalletSessions to return a connecting session (not connected)
      const connectingSession = createMockSessionState({
        walletId: 'metamask',
        status: 'connecting',
        permissions: { methods: [], chains: [], events: [] },
      });

      vi.mocked(connectionActions.getWalletSessions).mockReturnValue([connectingSession]);

      const unsubscribe = subscribeToConnectionChanges(walletId, handlers);

      // Trigger state change
      store.setState((state) => ({
        ...state,
        connections: {
          ...state.connections,
          activeSessions: [connectingSession],
        },
      }));

      // No handlers should be called because the function only processes 'connected' sessions
      expect(handlers.onConnecting).not.toHaveBeenCalled();
      expect(handlers.onConnected).not.toHaveBeenCalled();
      expect(handlers.onError).not.toHaveBeenCalled();

      unsubscribe();
    });

    it('should handle multiple sessions and only process connected ones', () => {
      const handlers = {
        onConnecting: vi.fn(),
        onConnected: vi.fn(),
        onDisconnected: vi.fn(),
        onError: vi.fn(),
        onReconnecting: vi.fn(),
      };

      const walletId = 'metamask';

      // Mock getWalletSessions to return multiple sessions with different statuses
      const sessions = [
        createMockSessionState({
          walletId: 'metamask',
          status: 'error',
          sessionId: 'error-session',
          permissions: { methods: [], chains: [], events: [] },
        }),
        createMockSessionState({
          walletId: 'metamask',
          status: 'connected',
          sessionId: 'connected-session',
          permissions: { methods: [], chains: [], events: [] },
        }),
      ];

      // Start with no sessions
      vi.mocked(connectionActions.getWalletSessions).mockReturnValueOnce([]);

      const unsubscribe = subscribeToConnectionChanges(walletId, handlers);

      // Now return the sessions with the connected one
      vi.mocked(connectionActions.getWalletSessions).mockReturnValue(sessions);

      // Trigger state change
      store.setState((state) => ({
        ...state,
        connections: {
          ...state.connections,
          activeSessions: sessions,
        },
      }));

      // Should only process the connected session
      expect(handlers.onConnected).toHaveBeenCalledWith({
        address: TEST_ADDRESS,
        chainId: '0x1', // Chain ID comes as hex string
      });
      expect(handlers.onError).not.toHaveBeenCalled();

      unsubscribe();
    });

    it('should not call handlers when no sessions match', () => {
      const handlers = {
        onConnecting: vi.fn(),
        onConnected: vi.fn(),
        onDisconnected: vi.fn(),
        onError: vi.fn(),
        onReconnecting: vi.fn(),
      };

      const walletId = 'wallet2'; // Different wallet ID

      // Mock getWalletSessions to return empty array for different wallet
      vi.mocked(connectionActions.getWalletSessions).mockReturnValue([]);

      const unsubscribe = subscribeToConnectionChanges(walletId, handlers);

      // Trigger state change
      store.setState((state) => ({
        ...state,
        connections: {
          ...state.connections,
          activeSessions: [...Object.values(state.entities.sessions)],
        },
      }));

      // No handlers should be called
      expect(handlers.onConnecting).not.toHaveBeenCalled();
      expect(handlers.onConnected).not.toHaveBeenCalled();
      expect(handlers.onDisconnected).not.toHaveBeenCalled();
      expect(handlers.onError).not.toHaveBeenCalled();
      expect(handlers.onReconnecting).not.toHaveBeenCalled();

      unsubscribe();
    });
  });

  describe('subscribeToAllChanges', () => {
    it('should call callback on any state change', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToAllChanges(callback);

      // Change any part of state
      store.setState((state) => ({
        ...state,
        ui: { ...state.ui, isLoading: true },
      }));

      // The callback is called with the entire state
      expect(callback).toHaveBeenCalled();
      const callArgs = callback.mock.calls[0][0];
      expect(callArgs.ui.isLoading).toBe(true);

      unsubscribe();
    });
  });
});
