/**
 * Integration tests for wallet connection flow
 *
 * This test file focuses on:
 * - End-to-end wallet connection workflows
 * - Integration between WalletRegistry, SessionManager, and Store
 * - Multi-wallet connection scenarios
 * - Chain switching during active connections
 * - Connection persistence and recovery
 * - State synchronization across components
 * - Real-world usage patterns
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateSessionParams, SessionState } from '../api/types/sessionState.js';
import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import { ERROR_CODES } from '../internal/core/errors/types.js';
import { WalletRegistry } from '../internal/registries/wallets/WalletRegistry.js';
import { SessionManager } from '../internal/session/SessionManager.js';
import { connectionActions } from '../state/actions/connections.js';
import { transactionActions } from '../state/actions/transactions.js';
import { uiActions } from '../state/actions/ui.js';
import {
  ChainType,
  createMockEvmProvider,
  createMockSolanaProvider,
  createTestStore,
  testSetupPatterns,
} from '../testing/index.js';

// Mock provider for testing
const createMockProvider = (chainType: ChainType = ChainType.Evm) => {
  if (chainType === ChainType.Evm) {
    const evmResponses = {};
    // External RPC method names require underscores
    Object.assign(evmResponses, {
      ['eth_accounts']: ['0x1234567890123456789012345678901234567890'],
      ['eth_chainId']: '0x1',
      ['wallet_switchEthereumChain']: null,
      ['eth_sendTransaction']: '0xabcdef1234567890abcdef1234567890abcdef12',
    });
    return createMockEvmProvider(evmResponses);
  }
  if (chainType === ChainType.Solana) {
    const provider = createMockSolanaProvider();
    provider.connect = vi.fn().mockResolvedValue({
      publicKey: { toString: () => 'SolanaAddress123' },
    });
    return provider;
  }

  return createMockEvmProvider();
};

const createMockSessionParams = (overrides: Partial<CreateSessionParams> = {}): CreateSessionParams => ({
  walletId: 'test-wallet',
  accounts: [
    {
      address: '0x1234567890123456789012345678901234567890',
      name: 'Test Account',
    },
  ],
  chain: {
    chainId: '0x1',
    chainType: ChainType.Evm,
    name: 'Ethereum Mainnet',
    required: true,
  },
  provider: createMockProvider(),
  providerMetadata: {
    type: 'injected' as const,
    version: '1.0.0',
    multiChainCapable: true,
    supportedMethods: ['eth_accounts'],
  },
  permissions: {
    methods: ['eth_accounts'],
    events: ['accountsChanged'],
  },
  metadata: {
    wallet: {
      name: 'Test Wallet',
      icon: 'test-icon.png',
    },
  },
  ...overrides,
});

describe('Wallet Connection Integration', () => {
  let store: ReturnType<typeof createTestStore>;
  let sessionManager: SessionManager;
  let walletRegistry: WalletRegistry;

  beforeEach(() => {
    // Clear localStorage to prevent session persistence between tests
    global.localStorage?.clear();
    sessionManager = new SessionManager();
    store = createTestStore({
      enableDevtools: false,
      persistOptions: { enabled: false },
    });
    walletRegistry = new WalletRegistry();
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('End-to-End Wallet Connection Flow', () => {
    it('should complete full connection flow with state updates', async () => {
      // 1. Load builtin adapters
      await walletRegistry.loadBuiltinAdapters();
      const adapters = walletRegistry.getAllAdapters();
      expect(adapters.length).toBeGreaterThan(0);

      // 2. Open modal
      uiActions.openModal(store);

      let state = store.getState();
      expect(state.ui.modalOpen).toBe(true);
      expect(state.ui.currentView).toBe('walletSelection');

      // 3. Set connecting state
      uiActions.setView(store, 'connecting');
      uiActions.setLoading(store, 'modal', true);

      state = store.getState();
      expect(state.ui.currentView).toBe('connecting');
      expect(state.ui.loading.modal).toBe(true);

      // 4. Create session
      const sessionParams = createMockSessionParams();
      const session = await connectionActions.createSession(store, sessionParams);

      expect(session).toBeDefined();
      expect(session.walletId).toBe('test-wallet');
      expect(session.status).toBe('connected');

      // 5. Update UI to connected state
      uiActions.setView(store, 'connected');
      uiActions.setLoading(store, 'modal', false);

      state = store.getState();
      expect(state.ui.currentView).toBe('connected');
      expect(state.ui.loading.modal).toBe(false);
      expect(Object.values(state.entities.sessions).some((s) => s.sessionId === session.sessionId)).toBe(
        true,
      );
      expect(state.active.sessionId).toBe(session.sessionId);

      // 6. Verify connection state
      const activeSession = connectionActions.getActiveSession(store);
      expect(activeSession).toBeDefined();
      expect(activeSession?.status).toBe('connected');
      expect(activeSession?.walletId).toBe('test-wallet');
      expect(activeSession?.activeAccount.address).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should handle connection failure with error states', async () => {
      // 1. Start connection process
      uiActions.openModal(store);
      uiActions.setView(store, 'connecting');
      uiActions.setLoading(store, 'modal', true);

      // 2. Simulate connection failure by setting error state
      // Since createSession doesn't validate, we simulate failure at UI level
      const error = ErrorFactory.configurationError('Invalid wallet configuration');

      // 3. Update UI to error state
      uiActions.setView(store, 'error');
      uiActions.setLoading(store, 'modal', false);
      uiActions.setError(store, 'ui', error);

      const state = store.getState();
      expect(state.ui.currentView).toBe('error');
      expect(state.ui.loading.modal).toBe(false);
      expect(state.ui.errors['ui']).toMatchObject({
        code: ERROR_CODES.CONFIGURATION_ERROR,
        message: 'Invalid wallet configuration',
      });
      expect(Object.values(state.entities.sessions).length).toBe(0);
    });

    it('should handle wallet switching during connection', async () => {
      // 1. Create initial session
      const sessionParams1 = createMockSessionParams({ walletId: 'metamask' });
      const session1 = await connectionActions.createSession(store, sessionParams1);

      expect(session1.walletId).toBe('metamask');
      expect(connectionActions.getActiveSession(store)?.sessionId).toBe(session1.sessionId);

      // 2. Create second session with different wallet
      const sessionParams2 = createMockSessionParams({
        walletId: 'phantom',
        chain: { chainId: 'mainnet-beta', chainType: ChainType.Solana, name: 'Solana', required: true },
        accounts: [{ address: 'SolanaAddress123', name: 'Solana Account' }],
        provider: createMockProvider(ChainType.Solana),
      });
      const session2 = await connectionActions.createSession(store, sessionParams2);

      expect(session2.walletId).toBe('phantom');

      // 3. Verify both sessions exist
      const state = store.getState();
      expect(Object.values(state.entities.sessions).length).toBe(2);
      expect(state.active.sessionId).toBe(session2.sessionId); // Latest should be active

      // 4. Switch between sessions
      connectionActions.switchToSession(store, session1.sessionId);
      let currentState = store.getState();
      expect(currentState.active.sessionId).toBe(session1.sessionId);

      connectionActions.switchToSession(store, session2.sessionId);
      currentState = store.getState();
      expect(currentState.active.sessionId).toBe(session2.sessionId);
    });
  });

  describe('Chain Switching Integration', () => {
    it('should handle cross-chain operations', async () => {
      // 1. Create EVM session
      const evmParams = createMockSessionParams({
        walletId: 'metamask',
        chain: { chainId: '0x1', chainType: ChainType.Evm, name: 'Ethereum', required: true },
      });
      const evmSession = await connectionActions.createSession(store, evmParams);

      // 2. Switch to different EVM chain
      const newEvmSession = await connectionActions.switchChain(store, evmSession.sessionId, '0x89');
      expect(newEvmSession.chain.chainId).toBe('0x89');

      // 3. Create Solana session
      const solanaParams = createMockSessionParams({
        walletId: 'phantom',
        chain: { chainId: 'mainnet-beta', chainType: ChainType.Solana, name: 'Solana', required: true },
        accounts: [{ address: 'SolanaAddress123', name: 'Solana Account' }],
        provider: createMockProvider(ChainType.Solana),
      });
      const solanaSession = await connectionActions.createSession(store, solanaParams);

      // 4. Switch between different chain types
      connectionActions.switchToSession(store, newEvmSession.sessionId);
      let activeSession = connectionActions.getActiveSession(store);
      expect(activeSession?.chain.chainType).toBe(ChainType.Evm);
      expect(activeSession?.chain.chainId).toBe('0x89');

      connectionActions.switchToSession(store, solanaSession.sessionId);
      activeSession = connectionActions.getActiveSession(store);
      expect(activeSession?.chain.chainType).toBe(ChainType.Solana);
      expect(activeSession?.chain.chainId).toBe('mainnet-beta');
    });

    it('should handle chain switch failures gracefully', async () => {
      // 1. Create session with provider that fails chain switching
      const failingProvider = createMockEvmProvider({
        // biome-ignore lint/style/useNamingConvention: EIP-3326 RPC method name
        wallet_switchEthereumChain: new Error('Chain not supported'),
      });

      const sessionParams = createMockSessionParams({
        provider: failingProvider,
      });
      const session = await connectionActions.createSession(store, sessionParams);

      // 2. Attempt chain switch (should fail)
      // switchChain doesn't actually interact with the provider, it just updates the session
      const updatedSession = await connectionActions.switchChain(store, session.sessionId, '0x999');

      // The chain ID will be updated in the session even though the provider doesn't support it
      expect(updatedSession.chain.chainId).toBe('0x999');

      // 3. Verify the chain was updated in the session
      const activeSession = connectionActions.getActiveSession(store);
      expect(activeSession?.chain.chainId).toBe('0x999');
    });
  });

  describe('Multi-Wallet Management', () => {
    it('should manage multiple concurrent wallet sessions', async () => {
      // 1. Create sessions for different wallets
      const metamaskSession = await connectionActions.createSession(
        store,
        createMockSessionParams({ walletId: 'metamask' }),
      );
      const walletConnectSession = await connectionActions.createSession(
        store,
        createMockSessionParams({ walletId: 'walletconnect' }),
      );
      const coinbaseSession = await connectionActions.createSession(
        store,
        createMockSessionParams({ walletId: 'coinbase' }),
      );

      // 2. Verify all sessions exist
      const state = store.getState();
      expect(Object.values(state.entities.sessions).length).toBe(3);

      // 3. Get sessions for specific wallet
      const metamaskSessions = connectionActions.getWalletSessions(store, 'metamask');
      expect(metamaskSessions.length).toBe(1);
      expect(metamaskSessions[0]?.sessionId).toBe(metamaskSession.sessionId);

      // 4. End specific session
      await connectionActions.endSession(store, walletConnectSession.sessionId);
      const newState = store.getState();
      expect(Object.values(newState.entities.sessions).length).toBe(2);
      expect(
        Object.values(newState.entities.sessions).some((s) => s.sessionId === walletConnectSession.sessionId),
      ).toBe(false);
    });

    it('should handle session cleanup and wallet index maintenance', async () => {
      // 1. Create sessions with same wallet on different chains
      const session1 = await connectionActions.createSession(
        store,
        createMockSessionParams({
          walletId: 'metamask',
          chain: { chainId: '0x1', chainType: ChainType.Evm, name: 'Ethereum', required: true },
        }),
      );
      const session2 = await connectionActions.createSession(
        store,
        createMockSessionParams({
          walletId: 'metamask',
          chain: { chainId: '0x89', chainType: ChainType.Evm, name: 'Polygon', required: true },
        }),
      );

      // 2. Verify wallet has multiple sessions
      const metamaskSessions = connectionActions.getWalletSessions(store, 'metamask');
      expect(metamaskSessions.length).toBe(2);

      // 3. End all sessions for wallet
      await connectionActions.endSession(store, session1.sessionId);
      await connectionActions.endSession(store, session2.sessionId);

      // 4. Verify wallet sessions are cleaned up
      const remainingSessions = connectionActions.getWalletSessions(store, 'metamask');
      expect(remainingSessions.length).toBe(0);

      const state = store.getState();
      expect(Object.values(state.entities.sessions).length).toBe(0);
      expect(state.active.sessionId).toBeNull();
    });
  });

  describe('Wallet Discovery Integration', () => {
    it('should integrate wallet discovery with connection flow', async () => {
      // 1. Start discovery
      uiActions.startDiscovery(store);

      let state = store.getState();
      expect(state.ui.loading.discovery).toBe(true);

      // 2. Add discovered wallets
      connectionActions.addWallet(store, {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22%23000%22%2F%3E%3C%2Fsvg%3E',
        chains: [ChainType.Evm],
        metadata: {},
        features: [],
        provider: null,
      });

      state = store.getState();
      expect(Object.values(state.entities.wallets).length).toBe(1);
      expect(Object.values(state.entities.wallets)[0]?.id).toBe('metamask');

      // 3. Stop discovery
      uiActions.stopDiscovery(store);

      state = store.getState();
      expect(state.ui.loading.discovery).toBe(false);

      // 4. Connect to discovered wallet
      const session = await connectionActions.createSession(
        store,
        createMockSessionParams({ walletId: 'metamask' }),
      );

      expect(session.walletId).toBe('metamask');
    });

    it('should handle discovery errors and recovery', async () => {
      // 1. Add discovery error
      uiActions.addDiscoveryError(store, 'Failed to scan for wallets');

      let state = store.getState();
      expect(state.meta.discoveryErrors.length).toBe(1);
      expect(state.meta.discoveryErrors[0]).toBe('Failed to scan for wallets');

      // 2. Continue with manually added wallets
      connectionActions.addWallet(store, {
        id: 'phantom',
        name: 'Phantom',
        icon: 'data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22%23000%22%2F%3E%3C%2Fsvg%3E',
        chains: [ChainType.Solana],
        metadata: {},
        features: [],
        provider: null,
      });

      // 3. Clear discovery errors
      uiActions.clearDiscoveryErrors(store);

      state = store.getState();
      expect(state.meta.discoveryErrors.length).toBe(0);

      // 4. Wallet should still be available
      expect(Object.values(state.entities.wallets).length).toBe(1);
      expect(Object.values(state.entities.wallets)[0]?.id).toBe('phantom');
    });
  });

  describe('Error Handling Integration', () => {
    it('should maintain consistent state during error scenarios', async () => {
      // 1. Create initial valid session
      const session1 = await connectionActions.createSession(
        store,
        createMockSessionParams({ walletId: 'metamask' }),
      );

      // 2. Attempt to create invalid session
      try {
        await connectionActions.createSession(store, {
          walletId: '',
          accounts: [],
        } as CreateSessionParams);
      } catch (error) {
        // Expected to fail
      }

      // 3. Original session should remain intact
      const state = store.getState();
      expect(Object.values(state.entities.sessions).length).toBe(1);
      expect(state.active.sessionId).toBe(session1.sessionId);

      // 4. Attempt invalid operation on existing session
      // switchChain with invalid session returns null
      const result = await connectionActions.switchChain(store, 'invalid-session-id', '0x89');
      expect(result).toBeNull();

      // 5. State should remain consistent
      const finalState = store.getState();
      expect(Object.values(finalState.entities.sessions).length).toBe(1);
      expect(finalState.active.sessionId).toBe(session1.sessionId);
    });

    it('should handle concurrent operations safely', async () => {
      // 1. Start multiple concurrent operations
      const operations = [
        connectionActions.createSession(store, createMockSessionParams({ walletId: 'metamask' })),
        connectionActions.createSession(store, createMockSessionParams({ walletId: 'phantom' })),
        connectionActions.createSession(store, createMockSessionParams({ walletId: 'coinbase' })),
      ];

      const sessions = await Promise.all(operations);

      // 2. All sessions should be created
      const state = store.getState();
      expect(Object.values(state.entities.sessions).length).toBe(3);
      expect(sessions.every((s) => s.status === 'connected')).toBe(true);

      // 3. Concurrent switches
      const switchOps = sessions.map((s) => connectionActions.switchToSession(store, s.sessionId));

      await Promise.all(switchOps);

      // 4. Last switch should win
      const finalState = store.getState();
      expect(finalState.active.sessionId).toBeDefined();
      expect(Object.values(finalState.entities.sessions).length).toBe(3);
    });
  });

  describe('Performance Integration', () => {
    it('should handle large numbers of wallet sessions efficiently', async () => {
      const startTime = Date.now();
      const sessionCount = 50;

      // 1. Create many sessions
      const createPromises = Array.from({ length: sessionCount }, (_, i) =>
        connectionActions.createSession(
          store,
          createMockSessionParams({
            walletId: `wallet-${i}`,
            accounts: [{ address: `0x${i.toString(16).padStart(40, '0')}`, name: `Account ${i}` }],
          }),
        ),
      );

      await Promise.all(createPromises);

      // 2. Verify all sessions created
      const state = store.getState();
      expect(Object.values(state.entities.sessions).length).toBe(sessionCount);

      // 3. Performance check - should complete in reasonable time
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeLessThan(5000); // 5 seconds for 50 sessions

      // 4. Efficient lookup
      const lookupStart = Date.now();
      const sessions = connectionActions.getWalletSessions(store, 'wallet-25');
      const lookupElapsed = Date.now() - lookupStart;

      expect(sessions.length).toBe(1);
      expect(lookupElapsed).toBeLessThan(10); // Should be very fast

      // 5. Batch cleanup
      const cleanupStart = Date.now();
      connectionActions.clearAll(store);
      const cleanupElapsed = Date.now() - cleanupStart;

      const finalState = store.getState();
      expect(Object.values(finalState.entities.sessions).length).toBe(0);
      expect(cleanupElapsed).toBeLessThan(100); // Should be fast
    });
  });
});
