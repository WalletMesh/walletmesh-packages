/**
 * Test setup helpers for common wallet testing scenarios
 *
 * This module provides pre-configured test setups for common testing patterns,
 * reducing boilerplate in test files. Each helper creates a complete test
 * environment with mocked store, sessions, and wallets.
 *
 * @example
 * ```typescript
 * // Testing with a connected wallet
 * import { createConnectedTestSetup } from '@walletmesh/modal-core/testing';
 *
 * test('should display connected wallet info', () => {
 *   const { mockStore, address, walletId } = createConnectedTestSetup();
 *
 *   // Use the pre-configured store
 *   const state = mockStore.getState();
 *   expect(state.connections.activeSessionId).toBe('test-session');
 *   expect(state.connections.activeSessions.size).toBe(1);
 * });
 *
 * // Testing disconnected state
 * test('should show connect button when disconnected', () => {
 *   const { mockStore } = createDisconnectedTestSetup();
 *
 *   const state = mockStore.getState();
 *   expect(state.connections.activeSessionId).toBeNull();
 * });
 * ```
 *
 * @module testing/helpers/testSetups
 */

import type { WalletMeshState } from '../../state/store.js';
import { ChainType } from '../../types.js';
import { createMockSessionState } from '../mocks/mockSession.js';
import { createAutoMockedStore } from '../mocks/mockStore.js';

/**
 * Create a test setup with a connected wallet
 *
 * Sets up a complete test environment with:
 * - Active session with the specified wallet
 * - Store configured with connected state
 * - Mock session data
 *
 * @param walletId - ID of the connected wallet (default: 'metamask')
 * @param address - Connected wallet address (default: mock address)
 * @returns Test setup with store, session, and connection details
 *
 * @example
 * ```typescript
 * // Default MetaMask connection
 * const setup = createConnectedTestSetup();
 *
 * // Custom wallet connection
 * const setup = createConnectedTestSetup('phantom', '0xabc...');
 *
 * // Access the setup
 * const isConnected = setup.mockStore.getState().connections.activeSessionId !== null;
 * const session = setup.mockSession;
 * ```
 */
export function createConnectedTestSetup(
  walletId = 'metamask',
  address = '0x1234567890123456789012345678901234567890',
) {
  const mockSession = createMockSessionState({
    sessionId: 'test-session',
    walletId,
    activeAccount: {
      address,
      index: 0,
      derivationPath: "m/44'/60'/0'/0/0",
    },
    accounts: [
      {
        address,
        index: 0,
        derivationPath: "m/44'/60'/0'/0/0",
        isActive: true,
      },
    ],
  });

  const mockStore = createAutoMockedStore({
    entities: {
      sessions: {
        'test-session': mockSession,
      },
      wallets: {
        [walletId]: {
          id: walletId,
          name: walletId === 'metamask' ? 'MetaMask' : 'Mock Wallet',
          icon: '',
          chains: [ChainType.Evm],
        },
      },
      transactions: {},
    },
    active: {
      sessionId: 'test-session',
      walletId,
      transactionId: null,
      selectedWalletId: null,
    },
    meta: {
      availableWalletIds: [walletId],
      lastDiscoveryTime: null,
      connectionTimestamps: {},
      discoveryErrors: [],
      transactionStatus: 'idle' as const,
      backgroundTransactionIds: [],
    },
  });

  return {
    mockStore,
    mockSession,
    address,
    walletId,
  };
}

/**
 * Create a test setup with no connected wallets
 */
export function createDisconnectedTestSetup() {
  const mockStore = createAutoMockedStore();

  return {
    mockStore,
  };
}

/**
 * Create a test wrapper configuration for framework testing
 *
 * This helper is designed to be used by framework-specific test utilities
 * (e.g., @walletmesh/modal-react) to create consistent test environments.
 *
 * @param config - Configuration options
 * @param config.initialState - Initial state overrides
 * @returns Test wrapper configuration with mocked store
 *
 * @example
 * ```typescript
 * // In @walletmesh/modal-react tests
 * const { mockStore } = createTestWrapper({
 *   initialState: {
 *     ui: { isOpen: true, currentView: 'walletSelection' }
 *   }
 * });
 *
 * // Use with React Testing Library
 * const wrapper = ({ children }) => (
 *   <WalletMeshProvider store={mockStore}>
 *     {children}
 *   </WalletMeshProvider>
 * );
 * ```
 */
export function createTestWrapper(config?: { initialState?: Partial<WalletMeshState> }) {
  const mockStore = createAutoMockedStore(config?.initialState);

  return {
    mockStore,
    // React components will create their own wrapper using this store
  };
}
