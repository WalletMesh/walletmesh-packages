/**
 * Tests for SessionManager
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type SessionConfig,
  type SessionInfo,
  SessionManager,
  createSessionManager,
} from './SessionManager.js';

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  let mockStorage: Storage;

  beforeEach(() => {
    // Mock sessionStorage
    mockStorage = {
      length: 0,
      clear: vi.fn(),
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      key: vi.fn(),
    } as unknown as Storage;

    // Replace global sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: mockStorage,
      writable: true,
    });

    // Use fake timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Session Creation', () => {
    beforeEach(() => {
      sessionManager = new SessionManager();
    });

    it('should create a new session with unique ID', () => {
      const session1 = sessionManager.createSession('https://example.com');
      const session2 = sessionManager.createSession('https://example.com');

      expect(session1.id).toBeDefined();
      expect(session2.id).toBeDefined();
      expect(session1.id).not.toBe(session2.id);
    });

    it('should set correct session properties', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const metadata = { clientId: 'client_123', name: 'Test App' };
      const session = sessionManager.createSession('https://example.com', metadata);

      expect(session.remoteOrigin).toBe('https://example.com');
      expect(session.createdAt).toBe(now);
      expect(session.lastActivity).toBe(now);
      expect(session.metadata).toEqual(metadata);
      expect(session.state).toBe('active');
      expect(session.timeout).toBe(300000); // Default 5 minutes
      expect(session.heartbeatInterval).toBe(30000); // Default 30 seconds
      expect(session.stats).toEqual({
        messagesSent: 0,
        messagesReceived: 0,
        lastSequenceSent: -1,
        lastSequenceReceived: -1,
      });
    });

    it('should use custom config values', () => {
      const config: SessionConfig = {
        sessionTimeout: 600000,
        heartbeatInterval: 60000,
      };
      sessionManager = new SessionManager(config);

      const session = sessionManager.createSession('https://example.com');

      expect(session.timeout).toBe(600000);
      expect(session.heartbeatInterval).toBe(60000);
    });

    it('should generate appropriate session ID prefix', () => {
      const clientManager = new SessionManager({}, false);
      const serverManager = new SessionManager({}, true);

      const clientSession = clientManager.createSession('https://example.com');
      const serverSession = serverManager.createSession('https://example.com');

      expect(clientSession.id).toMatch(/^cli_/);
      expect(serverSession.id).toMatch(/^srv_/);
    });
  });

  describe('Session Retrieval', () => {
    beforeEach(() => {
      sessionManager = new SessionManager();
    });

    it('should retrieve existing session', () => {
      const created = sessionManager.createSession('https://example.com');
      const retrieved = sessionManager.getSession(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return undefined for non-existent session', () => {
      const session = sessionManager.getSession('non_existent_id');
      expect(session).toBeUndefined();
    });

    it('should not return expired session', () => {
      const session = sessionManager.createSession('https://example.com');

      // Advance time beyond session timeout
      vi.advanceTimersByTime(301000); // 5 minutes + 1 second

      const retrieved = sessionManager.getSession(session.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Session Activity', () => {
    beforeEach(() => {
      sessionManager = new SessionManager();
    });

    it('should update last activity time', () => {
      const session = sessionManager.createSession('https://example.com');
      const initialActivity = session.lastActivity;

      vi.advanceTimersByTime(10000);
      sessionManager.updateActivity(session.id);

      const updated = sessionManager.getSession(session.id);
      expect(updated?.lastActivity).toBeGreaterThan(initialActivity);
    });

    it('should reset session timer on activity', () => {
      const session = sessionManager.createSession('https://example.com');

      // Advance time close to timeout
      vi.advanceTimersByTime(290000); // 4:50 minutes

      // Update activity
      sessionManager.updateActivity(session.id);

      // Advance more time
      vi.advanceTimersByTime(20000); // 20 seconds

      // Session should still be active
      const retrieved = sessionManager.getSession(session.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.state).toBe('active');
    });

    it('should update message statistics', () => {
      const session = sessionManager.createSession('https://example.com');

      sessionManager.updateStats(session.id, 'sent', 5);
      sessionManager.updateStats(session.id, 'received', 3);
      sessionManager.updateStats(session.id, 'sent', 6);
      sessionManager.updateStats(session.id, 'received', 4);

      const updated = sessionManager.getSession(session.id);
      expect(updated?.stats).toEqual({
        messagesSent: 2,
        messagesReceived: 2,
        lastSequenceSent: 6,
        lastSequenceReceived: 4,
      });
    });
  });

  describe('Session Suspension and Resumption', () => {
    beforeEach(() => {
      sessionManager = new SessionManager();
    });

    it('should suspend an active session', () => {
      const session = sessionManager.createSession('https://example.com');
      sessionManager.suspendSession(session.id);

      const suspended = sessionManager.getSession(session.id);
      expect(suspended).toBeUndefined(); // Suspended sessions not returned by getSession

      // But can be resumed
      const resumed = sessionManager.resumeSession(session.id);
      expect(resumed).toBeDefined();
      expect(resumed?.state).toBe('active');
    });

    it('should resume a suspended session within timeout', () => {
      const session = sessionManager.createSession('https://example.com');
      const originalId = session.id;

      sessionManager.suspendSession(session.id);

      // Advance time but within double timeout
      vi.advanceTimersByTime(400000); // 6:40 minutes (less than double timeout)

      const resumed = sessionManager.resumeSession(originalId);
      expect(resumed).toBeDefined();
      expect(resumed?.id).toBe(originalId);
      expect(resumed?.state).toBe('active');
    });

    it('should not resume expired suspended session', () => {
      const session = sessionManager.createSession('https://example.com');
      sessionManager.suspendSession(session.id);

      // Advance time beyond double timeout
      vi.advanceTimersByTime(700000); // 11:40 minutes

      const resumed = sessionManager.resumeSession(session.id);
      expect(resumed).toBeUndefined();
    });

    it('should check if session can be resumed', () => {
      const session = sessionManager.createSession('https://example.com');
      sessionManager.updateStats(session.id, 'received', 5);

      // Active sessions cannot be resumed (they're already active)
      expect(sessionManager.canResumeSession(session.id, 5)).toBe(false);

      // Suspend the session first
      sessionManager.suspendSession(session.id);

      // Now can check if resumable with correct sequence
      expect(sessionManager.canResumeSession(session.id, 5)).toBe(true);

      // Cannot resume with wrong sequence
      expect(sessionManager.canResumeSession(session.id, 3)).toBe(false);

      // Cannot resume non-existent session
      expect(sessionManager.canResumeSession('non_existent', 5)).toBe(false);
    });
  });

  describe('Session Expiration', () => {
    beforeEach(() => {
      sessionManager = new SessionManager();
    });

    it('should expire a session', () => {
      const session = sessionManager.createSession('https://example.com');
      sessionManager.expireSession(session.id);

      const expired = sessionManager.getSession(session.id);
      expect(expired).toBeUndefined();

      // Cannot resume expired session
      const resumed = sessionManager.resumeSession(session.id);
      expect(resumed).toBeUndefined();
    });

    it('should clean up expired sessions', () => {
      // Create multiple sessions
      const _session1 = sessionManager.createSession('https://example1.com');
      const session2 = sessionManager.createSession('https://example2.com');
      const _session3 = sessionManager.createSession('https://example3.com');

      // Suspend one
      sessionManager.suspendSession(session2.id);

      // Age one beyond max age
      vi.advanceTimersByTime(86500000); // 24 hours + 100 seconds

      const cleaned = sessionManager.cleanupExpiredSessions();
      expect(cleaned).toBe(3); // All should be cleaned

      const active = sessionManager.getActiveSessions();
      expect(active).toHaveLength(0);
    });

    it('should timeout suspended sessions after double timeout', () => {
      const session = sessionManager.createSession('https://example.com');
      sessionManager.suspendSession(session.id);

      vi.advanceTimersByTime(650000); // > 2 * 5 minutes

      const cleaned = sessionManager.cleanupExpiredSessions();
      expect(cleaned).toBe(1);
    });
  });

  describe('Session Management', () => {
    beforeEach(() => {
      sessionManager = new SessionManager();
    });

    it('should get all active sessions', () => {
      const session1 = sessionManager.createSession('https://example1.com');
      const session2 = sessionManager.createSession('https://example2.com');
      sessionManager.suspendSession(session2.id);
      const session3 = sessionManager.createSession('https://example3.com');

      const active = sessionManager.getActiveSessions();
      expect(active).toHaveLength(2);
      expect(active.map((s) => s.id)).toContain(session1.id);
      expect(active.map((s) => s.id)).toContain(session3.id);
    });

    it('should get session counts by state', () => {
      sessionManager.createSession('https://example1.com');
      sessionManager.createSession('https://example2.com');
      const session3 = sessionManager.createSession('https://example3.com');
      sessionManager.suspendSession(session3.id);

      const counts = sessionManager.getSessionCounts();
      expect(counts).toEqual({
        active: 2,
        suspended: 1,
        expired: 0,
      });
    });

    it('should clear all sessions', () => {
      sessionManager.createSession('https://example1.com');
      sessionManager.createSession('https://example2.com');
      sessionManager.createSession('https://example3.com');

      sessionManager.clearAllSessions();

      const active = sessionManager.getActiveSessions();
      expect(active).toHaveLength(0);

      const counts = sessionManager.getSessionCounts();
      expect(counts).toEqual({
        active: 0,
        suspended: 0,
        expired: 0,
      });
    });

    it('should dispose properly', () => {
      const _session1 = sessionManager.createSession('https://example1.com');
      const _session2 = sessionManager.createSession('https://example2.com');

      sessionManager.dispose();

      const active = sessionManager.getActiveSessions();
      expect(active).toHaveLength(0);
    });
  });

  describe('Session Persistence', () => {
    it('should persist sessions to storage', () => {
      sessionManager = new SessionManager({ persistSessions: true });
      const session = sessionManager.createSession('https://example.com');

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        `walletmesh:session:${session.id}`,
        JSON.stringify(session),
      );
    });

    it('should not persist when disabled', () => {
      sessionManager = new SessionManager({ persistSessions: false });
      sessionManager.createSession('https://example.com');

      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it('should load persisted sessions on initialization', () => {
      const now = Date.now();
      const persistedSession: SessionInfo = {
        id: 'srv_test_123',
        createdAt: now - 60000, // 1 minute ago
        lastActivity: now - 30000, // 30 seconds ago
        remoteOrigin: 'https://example.com',
        timeout: 300000,
        heartbeatInterval: 30000,
        protocolVersion: '2.0.0',
        state: 'suspended', // Must be suspended to be loadable
        stats: {
          messagesSent: 5,
          messagesReceived: 3,
          lastSequenceSent: 5,
          lastSequenceReceived: 3,
        },
      };

      mockStorage.length = 1;
      mockStorage.key = vi.fn().mockReturnValue('walletmesh:session:srv_test_123');
      mockStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(persistedSession));

      // Set time so session is still resumable
      vi.setSystemTime(now);

      sessionManager = new SessionManager({ persistSessions: true });

      // Should be loaded as suspended and be resumable
      const resumed = sessionManager.resumeSession('srv_test_123');
      expect(resumed).toBeDefined();
      expect(resumed?.id).toBe('srv_test_123');
      expect(resumed?.state).toBe('active'); // Should be active after resume
    });

    it('should clean up expired persisted sessions', () => {
      const expiredSession: SessionInfo = {
        id: 'srv_expired_123',
        createdAt: Date.now() - 90000000, // Very old
        lastActivity: Date.now() - 90000000,
        remoteOrigin: 'https://example.com',
        timeout: 300000,
        heartbeatInterval: 30000,
        protocolVersion: '2.0.0',
        state: 'suspended',
        stats: {
          messagesSent: 0,
          messagesReceived: 0,
          lastSequenceSent: -1,
          lastSequenceReceived: -1,
        },
      };

      mockStorage.length = 1;
      mockStorage.key = vi.fn().mockReturnValue('walletmesh:session:srv_expired_123');
      mockStorage.getItem = vi.fn().mockReturnValue(JSON.stringify(expiredSession));

      sessionManager = new SessionManager({ persistSessions: true });

      // Should remove expired session
      expect(mockStorage.removeItem).toHaveBeenCalledWith('walletmesh:session:srv_expired_123');
    });

    it('should handle storage errors gracefully', () => {
      mockStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage full');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      sessionManager = new SessionManager({ persistSessions: true });
      sessionManager.createSession('https://example.com');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SessionManager] Failed to persist session:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it('should use custom storage key prefix', () => {
      sessionManager = new SessionManager({
        persistSessions: true,
        storageKeyPrefix: 'custom:session:',
      });

      const session = sessionManager.createSession('https://example.com');

      expect(mockStorage.setItem).toHaveBeenCalledWith(`custom:session:${session.id}`, expect.any(String));
    });
  });

  describe('Session Timers', () => {
    beforeEach(() => {
      sessionManager = new SessionManager({ sessionTimeout: 10000 }); // 10 seconds for testing
    });

    it('should automatically suspend inactive sessions', async () => {
      // Mock Date.now() to control time
      const startTime = 1000000;
      let currentTime = startTime;
      vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

      const session = sessionManager.createSession('https://example.com');
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      // Advance both system time and timers
      currentTime = startTime + 10001; // Move time forward past timeout
      await vi.advanceTimersByTimeAsync(10001); // Trigger the timer

      // Check that suspension was logged
      expect(consoleSpy).toHaveBeenCalledWith(`[SessionManager] Session ${session.id} timed out`);
      consoleSpy.mockRestore();

      // Session should be suspended (not returned by getSession)
      const retrieved = sessionManager.getSession(session.id);
      expect(retrieved).toBeUndefined();

      // Suspended session can be resumed if within double timeout (20 seconds)
      const resumed = sessionManager.resumeSession(session.id);
      expect(resumed).toBeDefined();
      expect(resumed?.state).toBe('active');
    });

    it('should reschedule timer after timeout check', () => {
      const session = sessionManager.createSession('https://example.com');

      // Update activity before timeout
      vi.advanceTimersByTime(5000);
      sessionManager.updateActivity(session.id);

      // Advance to original timeout time
      vi.advanceTimersByTime(6000);

      // Session should still be active
      const retrieved = sessionManager.getSession(session.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.state).toBe('active');
    });
  });

  describe('Factory Function', () => {
    it('should create session manager with factory', () => {
      const config: SessionConfig = {
        sessionTimeout: 60000,
        heartbeatInterval: 10000,
      };

      const manager = createSessionManager(config, true);
      expect(manager).toBeInstanceOf(SessionManager);

      const session = manager.createSession('https://example.com');
      expect(session.id).toMatch(/^srv_/);
      expect(session.timeout).toBe(60000);
    });
  });
});
