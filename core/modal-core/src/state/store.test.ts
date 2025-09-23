import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ModalError } from '../internal/core/errors/types.js';
import { createMockWalletInfo } from '../testing/index.js';
import { ChainType } from '../types.js';
import type { WalletInfo } from '../types.js';
import type { WalletMeshState } from './store.js';

// Use vi.hoisted to ensure mock is applied before imports
const { mockSessionManager, sessions, resetActiveSessionId } = vi.hoisted(() => {
  const sessions = new Map();
  let activeSessionId = null;

  const createMockSession = (params) => {
    const now = Date.now();
    const accounts = params.accounts || [];
    const addresses = accounts.map((acc) => acc.address);

    const session = {
      sessionId: `session-${params.walletId}-${now}-${Math.random()}`,
      walletId: params.walletId,
      status: 'connected',
      accounts,
      activeAccount: accounts[0],
      addresses,
      primaryAddress: addresses[0],
      chain: params.chain,
      provider: {
        instance: params.provider,
        type: params.providerMetadata.type,
        version: params.providerMetadata.version,
        multiChainCapable: params.providerMetadata.multiChainCapable,
        supportedMethods: params.providerMetadata.supportedMethods,
      },
      permissions: params.permissions,
      metadata: {
        ...params.metadata,
        chainSwitches: [],
      },
      lifecycle: {
        createdAt: now,
        lastActiveAt: now,
        lastAccessedAt: now,
        operationCount: 0,
        activeTime: 0,
      },
      accountContext: {
        totalAccounts: accounts.length,
        activeAccountIndex: 0,
        selectionHistory: [],
        discoverySettings: {
          maxAccounts: 10,
          autoDiscover: true,
          gapLimit: 20,
        },
        accountPermissions: {
          canSwitchAccounts: true,
          canAddAccounts: true,
        },
      },
    };

    return session;
  };

  const resetActiveSessionId = () => {
    activeSessionId = null;
  };

  const mockSessionManager = {
    createSession: vi.fn().mockImplementation(async (params) => {
      const session = createMockSession(params);
      sessions.set(session.sessionId, session);
      // Set as active if first session
      if (!activeSessionId) {
        activeSessionId = session.sessionId;
      }
      return session;
    }),
    endSession: vi.fn().mockImplementation(async (sessionId) => {
      sessions.delete(sessionId);
      // Clear active session if it was the one being ended
      if (activeSessionId === sessionId) {
        activeSessionId = null;
      }
    }),
    getActiveSession: vi.fn().mockImplementation(() => {
      if (!activeSessionId) return null;
      return sessions.get(activeSessionId) || null;
    }),
    getSession: vi.fn().mockImplementation((sessionId) => sessions.get(sessionId)),
    switchToSession: vi.fn().mockImplementation((sessionId) => {
      if (sessions.has(sessionId)) {
        activeSessionId = sessionId;
      }
    }),
    getWalletSessions: vi.fn().mockImplementation((walletId) => {
      return Array.from(sessions.values()).filter((s) => s.walletId === walletId);
    }),
    switchChain: vi.fn().mockImplementation(async (sessionId, chainId) => {
      const session = sessions.get(sessionId);
      if (!session) throw new Error('Session not found');

      // Create new session for chain switch
      const now = Date.now();
      const chainSwitchRecord = {
        fromChainId: session.chain.chainId,
        toChainId: chainId,
        timestamp: now,
        success: true,
        duration: 100,
      };

      const newSession = {
        ...session,
        sessionId: `session-${session.walletId}-${chainId}-${now}`,
        chain: { ...session.chain, chainId },
        metadata: {
          ...session.metadata,
          chainSwitches: [...(session.metadata.chainSwitches || []), chainSwitchRecord],
        },
        lifecycle: {
          ...session.lifecycle,
          lastActiveAt: now,
          lastAccessedAt: now,
        },
      };
      sessions.set(newSession.sessionId, newSession);
      activeSessionId = newSession.sessionId;
      return newSession;
    }),
    updateSessionStatus: vi.fn().mockImplementation((sessionId, status) => {
      const session = sessions.get(sessionId);
      if (session) {
        session.status = status;
      }
    }),
    switchAccount: vi.fn().mockImplementation(async (sessionId, accountAddress) => {
      const session = sessions.get(sessionId);
      if (!session) throw new Error('Session not found');

      const account = session.accounts.find((acc) => acc.address === accountAddress);
      if (!account) throw new Error('Account not found');

      session.activeAccount = account;
      session.primaryAddress = accountAddress;
      session.lifecycle.lastActiveAt = Date.now();

      return session;
    }),
    discoverAccounts: vi.fn().mockImplementation(async (sessionId, options) => {
      const session = sessions.get(sessionId);
      if (!session) throw new Error('Session not found');

      // Mock discovering 2 new accounts
      const newAccounts = [
        {
          address: `0x${Math.random().toString(16).slice(2, 42)}`,
          name: `Account ${session.accounts.length + 1}`,
          index: session.accounts.length,
          isDefault: false,
          metadata: {
            discoveredAt: Date.now(),
            lastUsedAt: Date.now(),
            transactionCount: 0,
            accountType: 'standard',
          },
        },
        {
          address: `0x${Math.random().toString(16).slice(2, 42)}`,
          name: `Account ${session.accounts.length + 2}`,
          index: session.accounts.length + 1,
          isDefault: false,
          metadata: {
            discoveredAt: Date.now(),
            lastUsedAt: Date.now(),
            transactionCount: 0,
            accountType: 'standard',
          },
        },
      ];

      return newAccounts;
    }),
    addAccount: vi.fn().mockImplementation(async (sessionId, account) => {
      const session = sessions.get(sessionId);
      if (!session) throw new Error('Session not found');

      session.accounts.push(account);
      session.addresses.push(account.address);

      return session;
    }),
    removeAccount: vi.fn().mockImplementation(async (sessionId, accountAddress) => {
      const session = sessions.get(sessionId);
      if (!session) throw new Error('Session not found');

      session.accounts = session.accounts.filter((acc) => acc.address !== accountAddress);
      session.addresses = session.addresses.filter((addr) => addr !== accountAddress);

      // If active account was removed, switch to first account
      if (session.activeAccount.address === accountAddress && session.accounts.length > 0) {
        session.activeAccount = session.accounts[0];
        session.primaryAddress = session.accounts[0].address;
      }

      return session;
    }),
    getSessionAccounts: vi.fn().mockImplementation((sessionId) => {
      const session = sessions.get(sessionId);
      return session ? session.accounts : [];
    }),
    getActiveAccount: vi.fn().mockImplementation((sessionId) => {
      const session = sessions.get(sessionId);
      return session ? session.activeAccount : null;
    }),
    compareSessions: vi.fn().mockImplementation((sessionId1, sessionId2) => {
      const session1 = sessions.get(sessionId1);
      const session2 = sessions.get(sessionId2);

      if (!session1 || !session2) return null;

      return {
        sessionId1,
        sessionId2,
        isSameWallet: session1.walletId === session2.walletId,
        isSameChain: session1.chain.chainId === session2.chain.chainId,
        isSameAccount: session1.activeAccount.address === session2.activeAccount.address,
        walletDifferences:
          session1.walletId !== session2.walletId
            ? {
                wallet1: session1.walletId,
                wallet2: session2.walletId,
              }
            : null,
        chainDifferences:
          session1.chain.chainId !== session2.chain.chainId
            ? {
                chain1: session1.chain,
                chain2: session2.chain,
              }
            : null,
        accountDifferences:
          session1.activeAccount.address !== session2.activeAccount.address
            ? {
                account1: session1.activeAccount,
                account2: session2.activeAccount,
              }
            : null,
        compatibilityScore: session1.walletId === session2.walletId ? 0.8 : 0.2,
      };
    }),
    cleanupExpiredSessions: vi.fn().mockImplementation(async () => {
      const now = Date.now();
      for (const [sessionId, session] of sessions.entries()) {
        if (session.lifecycle.expiresAt && session.lifecycle.expiresAt < now) {
          sessions.delete(sessionId);
          if (activeSessionId === sessionId) {
            activeSessionId = null;
          }
        }
      }
    }),
  };

  return { mockSessionManager, sessions, resetActiveSessionId };
});

import { createTestStore } from '../testing/index.js';
import { connectionActions } from './actions/connections.js';
import { transactionActions } from './actions/transactions.js';
import { uiActions } from './actions/ui.js';
// Import without mocking since we inject the mock directly
import { getActiveSession, useStore } from './store.js';

describe.sequential('Store', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(async () => {
    // Clear all mocks that might interfere with this test
    vi.clearAllMocks();
    vi.resetModules();

    // Clear the sessions map before each test
    sessions.clear();
    // Reset active session ID
    resetActiveSessionId();
    // Clear localStorage to prevent rehydration issues
    global.localStorage?.clear();
    vi.useFakeTimers();
    store = createTestStore({
      enableDevtools: false,
      persistOptions: { enabled: false },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial UI state', () => {
      const state = store.getState();

      expect(state.ui.modalOpen).toBe(false);
      expect(state.ui.currentView).toBe('walletSelection');
      expect(state.ui.loading.modal).toBe(false);
      expect(state.ui.errors['ui']).toBeUndefined();
    });

    it('should have correct initial connection state', () => {
      const state = store.getState();

      expect(Object.values(state.entities.sessions)).toBeInstanceOf(Array);
      expect(Object.values(state.entities.sessions).length).toBe(0);
      expect(state.active.sessionId).toBeNull();
      expect(Object.values(state.entities.wallets)).toBeInstanceOf(Array);
      expect(state.meta.availableWalletIds).toBeInstanceOf(Array);
    });

    it('should have correct initial wallet state', () => {
      const state = store.getState();

      expect(Object.values(state.entities.wallets)).toBeInstanceOf(Array);
      expect(state.meta.availableWalletIds).toBeInstanceOf(Array);
    });

    it('should have correct initial discovery state', () => {
      const state = store.getState();

      expect(state.ui.loading.discovery).toBe(false);
      expect(state.meta.lastDiscoveryTime).toBeNull();
      expect(state.meta.discoveryErrors).toEqual([]);
    });
  });

  describe('UI Actions', () => {
    it('should open modal', () => {
      uiActions.openModal(store);

      const state = store.getState();
      expect(state.ui.modalOpen).toBe(true);
      expect(state.ui.currentView).toBe('walletSelection');
      expect(state.ui.loading.modal).toBe(false);
      expect(state.ui.errors['ui']).toBeUndefined();
    });

    it('should close modal', () => {
      // First open, then close
      uiActions.openModal(store);
      uiActions.closeModal(store);

      const state = store.getState();
      expect(state.ui.modalOpen).toBe(false);
    });

    it('should set view', () => {
      uiActions.setView(store, 'connecting');

      const state = store.getState();
      expect(state.ui.currentView).toBe('connecting');
    });

    it('should set loading state', () => {
      uiActions.setLoading(store, 'modal', true);

      const state = store.getState();
      expect(state.ui.loading.modal).toBe(true);
    });

    it('should set error', () => {
      const error: ModalError = {
        code: 'test_error',
        message: 'Test error message',
        category: 'general',
      };

      uiActions.setError(store, 'ui', error);

      const state = store.getState();
      expect(state.ui.errors['ui']).toEqual(error);
    });

    it('should clear error when undefined is passed', () => {
      const error: ModalError = {
        code: 'test_error',
        message: 'Test error message',
        category: 'general',
      };

      uiActions.setError(store, 'ui', error);
      uiActions.setError(store, 'ui', undefined);

      const state = store.getState();
      expect(state.ui.errors['ui']).toBeUndefined();
    });
  });

  describe('Session Actions', () => {
    it('should create session', async () => {
      const sessionParams = {
        walletId: 'metamask',
        accounts: [
          {
            address: '0x1234567890123456789012345678901234567890',
            isDefault: true,
          },
        ],
        chain: {
          chainId: '0x1',
          chainType: ChainType.Evm,
          name: 'Ethereum Mainnet',
          required: false,
        },
        provider: { request: vi.fn(), on: vi.fn() },
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
            name: 'MetaMask',
            icon: 'data:image/svg+xml,<svg></svg>',
          },
        },
      };

      const session = await connectionActions.createSession(store, sessionParams);

      expect(session).toBeDefined();
      expect(session.walletId).toBe('metamask');

      const state = store.getState();
      expect(Object.values(state.entities.sessions).some((s) => s.sessionId === session.sessionId)).toBe(
        true,
      );
      expect(state.active.sessionId).toBe(session.sessionId);
    });

    it('should end session', async () => {
      // Create a session first
      const sessionParams = {
        walletId: 'metamask',
        accounts: [
          {
            address: '0x1234567890123456789012345678901234567890',
            isDefault: true,
          },
        ],
        chain: {
          chainId: '0x1',
          chainType: ChainType.Evm,
          name: 'Ethereum Mainnet',
          required: false,
        },
        provider: { request: vi.fn(), on: vi.fn() },
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
            name: 'MetaMask',
            icon: 'data:image/svg+xml,<svg></svg>',
          },
        },
      };

      const session = await connectionActions.createSession(store, sessionParams);

      // End the session
      await connectionActions.endSession(store, session.sessionId);

      const state = store.getState();
      expect(Object.values(state.entities.sessions).some((s) => s.sessionId === session.sessionId)).toBe(
        false,
      );
      expect(state.active.sessionId).toBeNull();
    });

    it('should get active session', () => {
      const state = store.getState();
      const activeSession = Object.values(state.entities.sessions).find(
        (s) => s.sessionId === state.active.sessionId,
      );

      // Initially no active session
      expect(activeSession).toBeUndefined();
    });

    it('should switch to session', async () => {
      // Create a session first
      const sessionParams = {
        walletId: 'metamask',
        accounts: [
          {
            address: '0x1234567890123456789012345678901234567890',
            isDefault: true,
          },
        ],
        chain: {
          chainId: '0x1',
          chainType: ChainType.Evm,
          name: 'Ethereum Mainnet',
          required: false,
        },
        provider: { request: vi.fn(), on: vi.fn() },
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
            name: 'MetaMask',
            icon: 'data:image/svg+xml,<svg></svg>',
          },
        },
      };

      const session = await connectionActions.createSession(store, sessionParams);

      connectionActions.switchToSession(store, session.sessionId);

      const state = store.getState();
      expect(state.active.sessionId).toBe(session.sessionId);
    });

    it('should get wallet sessions', () => {
      const state = store.getState();
      const sessions = Object.values(state.entities.sessions).filter((s) => s.walletId === 'metamask');

      expect(Array.isArray(sessions)).toBe(true);
    });

    it('should switch chain', async () => {
      // Create a session first
      const sessionParams = {
        walletId: 'metamask',
        accounts: [
          {
            address: '0x1234567890123456789012345678901234567890',
            isDefault: true,
          },
        ],
        chain: {
          chainId: '0x1',
          chainType: ChainType.Evm,
          name: 'Ethereum Mainnet',
          required: false,
        },
        provider: { request: vi.fn(), on: vi.fn() },
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
            name: 'MetaMask',
            icon: 'data:image/svg+xml,<svg></svg>',
          },
        },
      };

      const session = await connectionActions.createSession(store, sessionParams);

      const newSession = await connectionActions.switchChain(store, session.sessionId, '0x89');

      expect(newSession).toBeDefined();

      const state = store.getState();
      expect(state.active.sessionId).toBe(newSession.sessionId);
    });

    it('should get connection state', () => {
      const state = store.getState();
      const activeSession = Object.values(state.entities.sessions).find(
        (s) => s.sessionId === state.active.sessionId,
      );
      const connectionState = activeSession ? 'connected' : 'disconnected';

      expect(connectionState).toBeDefined();
      // In this test, we haven't created any sessions yet, so it should be disconnected
      expect(connectionState).toBe('disconnected');

      // Now let's create a session and verify it's connected
      connectionActions.createSession(store, {
        walletId: 'test-wallet',
        accounts: [{ address: '0x123', isDefault: true }],
        chain: { chainId: '1', chainType: ChainType.Evm, name: 'Ethereum', required: false },
        provider: {},
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
            icon: 'data:image/svg+xml,<svg></svg>',
          },
        },
      });

      const newState = store.getState();
      const activeSessionId = newState.active.sessionId;
      const newActiveSession = activeSessionId ? newState.entities.sessions[activeSessionId] : null;
      const newConnectionState = newActiveSession ? 'connected' : 'disconnected';

      expect(newConnectionState).toBe('connected');
    });
  });

  describe('Wallet Actions', () => {
    it('should add wallet', () => {
      const wallet = createMockWalletInfo('metamask', {
        name: 'metamask Wallet',
        icon: 'data:image/svg+xml,<svg>metamask</svg>',
        chains: [ChainType.Evm],
      });

      connectionActions.addWallet(store, wallet);

      const state = store.getState();
      expect(Object.values(state.entities.wallets).some((w) => w.id === 'metamask')).toBe(true);
      expect(Object.values(state.entities.wallets).find((w) => w.id === 'metamask')).toEqual(wallet);
    });

    it('should remove wallet', () => {
      const wallet = createMockWalletInfo('metamask', {
        name: 'metamask Wallet',
        icon: 'data:image/svg+xml,<svg>metamask</svg>',
        chains: [ChainType.Evm],
      });

      // Add then remove
      connectionActions.addWallet(store, wallet);
      connectionActions.removeWallet(store, 'metamask');

      const state = store.getState();
      const removedWallet = Object.values(state.entities.wallets).find((w) => w.id === 'metamask');
      expect(removedWallet).toBeUndefined();
    });

    // NOTE: Wallet discovery and availability checking has been moved to the service layer
    // These tests have been removed as the actions no longer exist at the state level
  });

  // NOTE: Discovery actions have been moved to the service layer
  // These tests have been removed as the actions no longer exist at the state level

  describe('Store Subscriptions', () => {
    it('should notify subscribers of state changes', () => {
      const subscriber = vi.fn();

      const unsubscribe = store.subscribe(subscriber);

      // Make a change
      uiActions.openModal(store);

      expect(subscriber).toHaveBeenCalled();

      unsubscribe();
    });

    it('should allow unsubscribing', () => {
      const subscriber = vi.fn();

      const unsubscribe = store.subscribe(subscriber);
      unsubscribe();

      // Make a change after unsubscribing
      uiActions.openModal(store);

      // Subscriber should not be called after unsubscribing
      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe('Singleton Store', () => {
    it('should use singleton store', () => {
      const state1 = useStore.getState();
      const state2 = useStore.getState();

      expect(state1).toBe(state2);
    });

    it('should maintain state across singleton access', () => {
      // Use the store instance from our test instead of the global singleton
      // since the global singleton has a different session manager

      uiActions.openModal(store);

      const state = store.getState();
      expect(state.ui.modalOpen).toBe(true);
    });
  });

  describe('Store Configuration', () => {
    it('should accept custom configuration', async () => {
      const customStore = createTestStore({
        enableDevtools: true,
        persistOptions: { enabled: true, name: 'custom-store' },
      });

      expect(customStore).toBeDefined();
      expect(customStore.getState()).toBeDefined();
    });

    it('should work with default configuration', async () => {
      const defaultStore = createTestStore();

      expect(defaultStore).toBeDefined();
      expect(defaultStore.getState()).toBeDefined();
    });
  });

  describe('Complex State Interactions', () => {
    it('should handle multiple wallet sessions', async () => {
      // Add multiple wallets
      const wallet1 = createMockWalletInfo('metamask', {
        name: 'metamask Wallet',
        icon: 'data:image/svg+xml,<svg>metamask</svg>',
        chains: [ChainType.Evm],
      });
      const wallet2 = createMockWalletInfo('phantom', {
        name: 'phantom Wallet',
        icon: 'data:image/svg+xml,<svg>phantom</svg>',
        chains: [ChainType.Evm],
      });

      connectionActions.addWallet(store, wallet1);
      connectionActions.addWallet(store, wallet2);

      // Create sessions for both wallets
      const sessionParams1 = {
        walletId: 'metamask',
        accounts: [
          {
            address: '0x1234567890123456789012345678901234567890',
            isDefault: true,
          },
        ],
        chain: { chainId: '0x1', chainType: ChainType.Evm, name: 'Ethereum', required: false },
        provider: { request: vi.fn() },
        providerMetadata: {
          type: 'injected' as const,
          version: '1.0.0',
          multiChainCapable: true,
          supportedMethods: ['eth_accounts'],
        },
        permissions: { methods: ['eth_accounts'], events: [] },
        metadata: {
          wallet: {
            name: 'MetaMask',
            icon: 'data:image/svg+xml,<svg></svg>',
          },
        },
      };

      const sessionParams2 = {
        walletId: 'phantom',
        accounts: [
          {
            address: 'SolanaAddress123',
            isDefault: true,
          },
        ],
        chain: { chainId: 'mainnet-beta', chainType: ChainType.Solana, name: 'Solana', required: false },
        provider: { connect: vi.fn() },
        providerMetadata: {
          type: 'injected' as const,
          version: '1.0.0',
          multiChainCapable: false,
          supportedMethods: ['connect'],
        },
        permissions: { methods: ['connect'], events: [] },
        metadata: {
          wallet: {
            name: 'Phantom',
            icon: 'data:image/svg+xml,<svg></svg>',
          },
        },
      };

      const session1 = await connectionActions.createSession(store, sessionParams1);
      const session2 = await connectionActions.createSession(store, sessionParams2);

      const state = store.getState();
      expect(Object.values(state.entities.sessions).length).toBe(2);
      const metamaskSessions = Object.values(state.entities.sessions).filter(
        (s) => s.walletId === 'metamask',
      );
      const phantomSessions = Object.values(state.entities.sessions).filter((s) => s.walletId === 'phantom');
      expect(metamaskSessions.some((s) => s.sessionId === session1.sessionId)).toBe(true);
      expect(phantomSessions.some((s) => s.sessionId === session2.sessionId)).toBe(true);
    });

    it('should maintain wallet index integrity during session operations', async () => {
      const sessionParams = {
        walletId: 'metamask',
        accounts: [
          {
            address: '0x1234567890123456789012345678901234567890',
            isDefault: true,
          },
        ],
        chain: { chainId: '0x1', chainType: ChainType.Evm, name: 'Ethereum', required: false },
        provider: { request: vi.fn() },
        providerMetadata: {
          type: 'injected' as const,
          version: '1.0.0',
          multiChainCapable: true,
          supportedMethods: ['eth_accounts'],
        },
        permissions: { methods: ['eth_accounts'], events: [] },
        metadata: {
          wallet: {
            name: 'MetaMask',
            icon: 'data:image/svg+xml,<svg></svg>',
          },
        },
      };

      const session = await connectionActions.createSession(store, sessionParams);

      // Verify wallet session exists
      let state = store.getState();
      const metamaskSessions = Object.values(state.entities.sessions).filter(
        (s) => s.walletId === 'metamask',
      );
      expect(metamaskSessions.map((s) => s.sessionId)).toEqual([session.sessionId]);

      // End session
      await connectionActions.endSession(store, session.sessionId);

      // Verify wallet session is cleaned up
      state = store.getState();
      const metamaskSessionsAfter = Object.values(state.entities.sessions).filter(
        (s) => s.walletId === 'metamask',
      );
      expect(metamaskSessionsAfter.length).toBe(0);
    });
  });
});
