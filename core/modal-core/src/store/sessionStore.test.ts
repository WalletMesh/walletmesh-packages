/**
 * @packageDocumentation
 * Tests for session store implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createSessionStore } from './sessionStore.js';
import { ConnectionStatus } from '../types.js';
import type { WalletSession } from '../types.js';

describe('Session Store', () => {
  const store = createSessionStore();

  const mockSession: WalletSession = {
    id: 'test-session',
    createdAt: Date.now(),
    wallet: {
      info: {
        id: 'test-wallet',
        name: 'Test Wallet',
        connector: {
          type: 'mock',
          options: {},
        },
      },
      state: {
        address: '0xtest',
        networkId: '1',
        sessionId: 'test-session',
      },
    },
    chainConnections: new Map(),
    sessionToken: {
      id: 'test-token',
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
      walletType: 'mock',
      publicKey: '0xpubkey',
      permissions: ['connect'],
      accounts: ['0xtest'],
      chainIds: [1],
      nonce: 'test-nonce',
      signature: '0xsig',
    },
    status: ConnectionStatus.Connected,
  };

  beforeEach(() => {
    store.getState().clearSessions();
  });

  describe('initial state', () => {
    it('should have empty sessions map', () => {
      expect(store.getState().sessions.size).toBe(0);
    });
  });

  describe('session management', () => {
    it('should add a session', () => {
      store.getState().setSession(mockSession.id, mockSession);

      const storedSession = store.getState().sessions.get(mockSession.id);
      expect(storedSession).toBeDefined();
      expect(storedSession).toEqual(mockSession);
    });

    it('should update existing session', () => {
      store.getState().setSession(mockSession.id, mockSession);

      const updatedSession = {
        ...mockSession,
        status: ConnectionStatus.Disconnected,
      };
      store.getState().setSession(mockSession.id, updatedSession);

      const storedSession = store.getState().sessions.get(mockSession.id);
      expect(storedSession).toEqual(updatedSession);
      expect(storedSession?.status).toBe(ConnectionStatus.Disconnected);
    });

    it('should remove a session', () => {
      store.getState().setSession(mockSession.id, mockSession);
      expect(store.getState().sessions.has(mockSession.id)).toBe(true);

      store.getState().removeSession(mockSession.id);
      expect(store.getState().sessions.has(mockSession.id)).toBe(false);
    });

    it('should handle removing non-existent session', () => {
      expect(() => {
        store.getState().removeSession('non-existent');
      }).not.toThrow();
    });

    it('should clear all sessions', () => {
      store.getState().setSession('session1', mockSession);
      store.getState().setSession('session2', {
        ...mockSession,
        id: 'session2',
      });

      expect(store.getState().sessions.size).toBe(2);

      store.getState().clearSessions();
      expect(store.getState().sessions.size).toBe(0);
    });
  });

  describe('session state immutability', () => {
    it('should create new map instances on updates', () => {
      const initialSessions = store.getState().sessions;
      store.getState().setSession(mockSession.id, mockSession);
      const updatedSessions = store.getState().sessions;

      expect(updatedSessions).not.toBe(initialSessions);
    });

    it('should not affect other sessions when updating one', () => {
      const session1 = { ...mockSession, id: 'session1' };
      const session2 = { ...mockSession, id: 'session2' };

      store.getState().setSession(session1.id, session1);
      store.getState().setSession(session2.id, session2);

      const updatedSession1 = {
        ...session1,
        status: ConnectionStatus.Disconnected,
      };
      store.getState().setSession(session1.id, updatedSession1);

      expect(store.getState().sessions.get(session2.id)).toEqual(session2);
    });
  });
});
