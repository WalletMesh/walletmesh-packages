import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSessionStore, type SessionStore } from './sessionStore.js';
import { ConnectionState, type WalletSession, type Connector } from '../types.js';

describe('SessionStore', () => {
  let sessionStore: SessionStore;
  let mockWalletSession: WalletSession;
  let mockConnector: Connector;

  beforeEach(() => {
    mockConnector = {
      getProvider: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      getState: vi.fn().mockReturnValue(ConnectionState.CONNECTED),
      resume: vi.fn(),
    };

    mockWalletSession = {
      id: 'test-session',
      address: '0xtest',
      chains: {},
      expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
      status: ConnectionState.CONNECTED,
      connector: mockConnector,
      wallet: {
        address: '0xtest',
        chainId: 1,
        publicKey: '0xpubkey',
        connected: true,
        type: 'test',
        state: {
          address: '0xtest',
          networkId: 1,
          sessionId: 'test-session',
          lastActive: Date.now(),
        },
      },
    };

    sessionStore = createSessionStore()();
  });

  describe('Session Management', () => {
    it('should store and retrieve sessions', () => {
      sessionStore.setSession(mockWalletSession.id, mockWalletSession);
      const retrievedSession = sessionStore.getSession(mockWalletSession.id);
      expect(retrievedSession).toEqual(mockWalletSession);
    });

    it('should remove sessions', () => {
      sessionStore.setSession(mockWalletSession.id, mockWalletSession);
      sessionStore.removeSession(mockWalletSession.id);
      const retrievedSession = sessionStore.getSession(mockWalletSession.id);
      expect(retrievedSession).toBeUndefined();
    });

    it('should get all sessions', () => {
      const anotherSession = {
        ...mockWalletSession,
        id: 'another-session',
        address: '0xanother',
      };

      sessionStore.setSession(mockWalletSession.id, mockWalletSession);
      sessionStore.setSession(anotherSession.id, anotherSession);

      const sessions = sessionStore.getSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions).toContainEqual(mockWalletSession);
      expect(sessions).toContainEqual(anotherSession);
    });

    it('should clear all sessions', () => {
      const anotherSession = {
        ...mockWalletSession,
        id: 'another-session',
        address: '0xanother',
      };

      sessionStore.setSession(mockWalletSession.id, mockWalletSession);
      sessionStore.setSession(anotherSession.id, anotherSession);
      sessionStore.clearSessions();

      expect(sessionStore.getSessions()).toHaveLength(0);
    });
  });

  describe('Session Validation', () => {
    it('should handle expired sessions', () => {
      const expiredSession = {
        ...mockWalletSession,
        expiry: Date.now() - 1000, // Expired 1 second ago
      };

      sessionStore.setSession(expiredSession.id, expiredSession);
      const retrievedSession = sessionStore.getSession(expiredSession.id);
      expect(retrievedSession).toBeUndefined();
    });

    it('should handle disconnected sessions', () => {
      const disconnectedSession = {
        ...mockWalletSession,
        status: ConnectionState.DISCONNECTED,
      };

      sessionStore.setSession(disconnectedSession.id, disconnectedSession);
      const retrievedSession = sessionStore.getSession(disconnectedSession.id);
      expect(retrievedSession).toBeUndefined();
    });

    it('should update session status', () => {
      sessionStore.setSession(mockWalletSession.id, mockWalletSession);
      mockWalletSession.status = ConnectionState.DISCONNECTED;
      sessionStore.setSession(mockWalletSession.id, mockWalletSession);

      const retrievedSession = sessionStore.getSession(mockWalletSession.id);
      expect(retrievedSession?.status).toBe(ConnectionState.DISCONNECTED);
    });
  });
});
