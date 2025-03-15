import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { StoreApi, UseBoundStore } from 'zustand';
import { SessionStoreAdapter, defaultSessionStoreAdapter } from './sessionStoreAdapter.js';
import { ConnectionStatus } from '../types.js'; 
import type { WalletSession, ChainConnection, SessionStore } from '../types.js';

describe('SessionStoreAdapter', () => {
  // Mock store state and methods
  const mockSessions = new Map<string, WalletSession>();
  const mockSetSession = vi.fn();
  const mockRemoveSession = vi.fn();
  const mockClearSessions = vi.fn();
  
  const mockState: SessionStore = {
      sessions: mockSessions,
      setSession: mockSetSession,
      removeSession: mockRemoveSession,
      clearSessions: mockClearSessions,
      getState: function() { return this; }
  };
  
  // Create a zustand store mock
  const mockStore = vi.fn((selector?: (state: SessionStore) => unknown) => {
    if (selector) {
      return selector(mockState);
    }
    return mockState;
  }) as unknown as UseBoundStore<StoreApi<SessionStore>>;
  
  mockStore.getState = vi.fn(() => mockState);

  const mockSession: WalletSession = {
    id: 'test-id',
    createdAt: Date.now(),
    wallet: {
      info: {
        id: 'test-wallet',
        name: 'Test Wallet',
        connector: { type: 'test' }
      },
      state: {
        address: '0x123',
        networkId: '1',
        sessionId: 'test-session'
      }
    },
    chainConnections: new Map<number, ChainConnection>(),
    sessionToken: { id: 'token-id', createdAt: Date.now(), expiresAt: Date.now() + 3600000, walletType: 'test', publicKey: '0x123', permissions: [], accounts: [], chainIds: [], nonce: '123', signature: '0x456' },
    status: ConnectionStatus.Connected
  };

  const adapter = new SessionStoreAdapter(mockStore);

  beforeEach(() => {
    vi.clearAllMocks();
  });
 
  describe('constructor', () => {
    it('should create adapter with store', () => {
      const adapter = new SessionStoreAdapter(mockStore);
      expect(adapter['store']).toBe(mockStore);
    });

    it('should throw if store is invalid', () => {
      expect(() => new SessionStoreAdapter(null as unknown as UseBoundStore<StoreApi<SessionStore>>)).toThrow();
      expect(() => new SessionStoreAdapter(undefined as unknown as UseBoundStore<StoreApi<SessionStore>>)).toThrow();
    });
  });

  describe('sessions', () => {
    it('should return sessions from store state', async () => {
      const testSession = { ...mockSession, id: 'test-1' };
      mockSessions.set('test-1', testSession);
      
      const sessions = adapter.sessions;
      expect(sessions.get('test-1')).toBe(testSession);
      expect(sessions).toBe(mockSessions);
    });

    it('should handle empty sessions map', () => {
      mockSessions.clear();
      const sessions = adapter.sessions;
      expect(sessions.size).toBe(0);
    });

    it('should handle multiple sessions', () => {
      const sessions = new Map([['test-1', mockSession], ['test-2', { ...mockSession, id: 'test-2' }]]);
      mockSessions.clear();
      sessions.forEach((session, id) => mockSessions.set(id, session));
      expect(adapter.sessions).toBe(mockSessions);
    });
  });

  describe('setSession', () => {
    it('should call store setSession method', () => {
      const id = 'test-id';
      const session = { ...mockSession, id };
      adapter.setSession(id, session);
      expect(mockSetSession).toHaveBeenCalledWith(id, session);
    });
  });

  describe('removeSession', () => {
    it('should call store removeSession method', () => {
      const id = 'test-id';

      adapter.removeSession(id);
      expect(mockRemoveSession).toHaveBeenCalledWith(id);
    });
  });

  describe('clearSessions', () => {
    it('should call store clearSessions method', () => {
      adapter.clearSessions();
      expect(mockClearSessions).toHaveBeenCalled();
    });
  });

  describe('getState', () => {
    it('should return store state', () => {
      const state = adapter.getState();
      expect(state).toBe(mockStore.getState());
    });
  });

  describe('defaultSessionStoreAdapter', () => {
    it('should create new adapter instance with store', () => {
      const adapter = defaultSessionStoreAdapter(mockStore);
      expect(adapter).toBeInstanceOf(SessionStoreAdapter);
      expect(adapter['store']).toBe(mockStore);
    });

    it('should create different instances for different stores', () => {
      const store1 = vi.fn((selector?: (state: SessionStore) => unknown) => {
        if (selector) {
          return selector(mockState);
        }
        return mockState;
      }) as unknown as UseBoundStore<StoreApi<SessionStore>>;
      
      store1.getState = vi.fn(() => mockState);
      
      const store2 = vi.fn((selector?: (state: SessionStore) => unknown) => {
        if (selector) {
          return selector(mockState);
        }
        return mockState;
      }) as unknown as UseBoundStore<StoreApi<SessionStore>>;
      
      store2.getState = vi.fn(() => mockState);
      
      // Create different instances
      const adapter1 = defaultSessionStoreAdapter(store1);
      const adapter2 = defaultSessionStoreAdapter(store2);
      expect(adapter1).not.toBe(adapter2);
    });
  });
});