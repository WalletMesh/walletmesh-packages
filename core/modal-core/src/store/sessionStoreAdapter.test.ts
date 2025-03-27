import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionStoreAdapter } from './sessionStoreAdapter.js';
import { ConnectionState, type WalletSession } from '../types.js';
import type { SessionStore } from './sessionStore.js';
import type { StoreApi } from 'zustand';
import type { UseBoundStore } from 'zustand';

describe('SessionStoreAdapter', () => {
  let mockStore: SessionStore & { sessions: Map<string, WalletSession> };
  let mockUseStore: UseBoundStore<StoreApi<SessionStore>>;
  let adapter: SessionStoreAdapter;
  let mockDate: Date;

  beforeEach(() => {
    mockDate = new Date('2025-03-26T10:00:00Z');
    vi.setSystemTime(mockDate);

    const sessionsMap = new Map<string, WalletSession>();

    mockStore = {
      sessions: sessionsMap,
      getSession: vi.fn(),
      getSessions: vi.fn(),
      setSession: vi.fn(),
      removeSession: vi.fn(),
      clearSessions: vi.fn(),
    };

    mockUseStore = (() => mockStore) as UseBoundStore<StoreApi<SessionStore>>;
    adapter = new SessionStoreAdapter(mockUseStore);
  });

  const createMockSession = (id: string, expired = false): WalletSession => ({
    id,
    address: `0x${id}`,
    chains: {
      1: {
        chainId: 1,
        rpcUrl: 'https://eth.example.com',
        status: ConnectionState.DISCONNECTED,
      },
    },
    expiry: expired ? mockDate.getTime() - 1000 : mockDate.getTime() + 24 * 60 * 60 * 1000,
    status: ConnectionState.DISCONNECTED,
    connector: {
      getProvider: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      getState: vi.fn(),
      resume: vi.fn(),
    },
    wallet: {
      address: `0x${id}`,
      chainId: 1,
      publicKey: '0x123',
      connected: false,
      state: {
        address: `0x${id}`,
        networkId: 1,
        sessionId: id,
        lastActive: mockDate.getTime(),
      },
    },
  });

  it('should handle store initialization', () => {
    expect(() => new SessionStoreAdapter(undefined as unknown as typeof mockUseStore)).toThrow();
    expect(() => new SessionStoreAdapter(mockUseStore)).not.toThrow();
  });

  describe('Session Management', () => {
    it('should get sessions', () => {
      const mockSessions = [createMockSession('test1'), createMockSession('test2')];
      vi.mocked(mockStore.getSessions).mockReturnValue(mockSessions);

      const sessions = adapter.getSessions();
      expect(sessions).toEqual(mockSessions);
      expect(mockStore.getSessions).toHaveBeenCalled();
    });

    it('should get individual session', () => {
      const mockSession = createMockSession('test1');
      vi.mocked(mockStore.getSession).mockReturnValue(mockSession);

      const session = adapter.getSession('test1');
      expect(session).toEqual(mockSession);
      expect(mockStore.getSession).toHaveBeenCalledWith('test1');
    });

    it('should set session', () => {
      const mockSession = createMockSession('test1');
      adapter.setSession('test1', mockSession);

      expect(mockStore.setSession).toHaveBeenCalledWith('test1', mockSession);
    });

    it('should remove session', () => {
      adapter.removeSession('test1');
      expect(mockStore.removeSession).toHaveBeenCalledWith('test1');
    });

    it('should clear all sessions', () => {
      adapter.clearSessions();
      expect(mockStore.clearSessions).toHaveBeenCalled();
    });
  });

  describe('Session Expiry', () => {
    it('should not return expired session', () => {
      const expiredSession = createMockSession('expired', true);
      vi.mocked(mockStore.getSession).mockReturnValue(expiredSession);

      const session = adapter.getSession('expired');
      expect(session).toBeUndefined();
      expect(mockStore.removeSession).toHaveBeenCalledWith('expired');
    });

    it('should filter out expired sessions from list', () => {
      const activeSessions = [createMockSession('active1'), createMockSession('active2')];
      const expiredSessions = [createMockSession('expired1', true), createMockSession('expired2', true)];
      vi.mocked(mockStore.getSessions).mockReturnValue([...activeSessions, ...expiredSessions]);

      const sessions = adapter.getSessions();
      expect(sessions).toEqual(activeSessions);

      for (const session of expiredSessions) {
        expect(mockStore.removeSession).toHaveBeenCalledWith(session.id);
      }
    });

    it('should not store expired session', () => {
      const expiredSession = createMockSession('expired', true);
      adapter.setSession('expired', expiredSession);

      expect(mockStore.setSession).not.toHaveBeenCalled();
    });
  });

  describe('Session Access', () => {
    it('should access internal sessions map', () => {
      const session = createMockSession('test1');
      mockStore.sessions.set('test1', session);

      expect(adapter.sessions.get('test1')).toBe(session);
    });

    it('should handle missing sessions', () => {
      vi.mocked(mockStore.getSession).mockReturnValue(undefined);

      expect(adapter.getSession('nonexistent')).toBeUndefined();
      expect(mockStore.removeSession).not.toHaveBeenCalled();
    });
  });
});
