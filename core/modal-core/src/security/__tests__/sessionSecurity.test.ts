/**
 * Unit tests for session security module
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDebugLogger } from '../../internal/core/logger/logger.js';
import { createTypedMock } from '../../testing/index.js';
import type { OriginValidator } from '../originValidation.js';
import { type SecureSession, SessionSecurityManager } from '../sessionSecurity.js';

describe('SessionSecurityManager', () => {
  let sessionManager: SessionSecurityManager;
  let logger: ReturnType<typeof createDebugLogger>;
  let mockOriginValidator: OriginValidator;

  beforeEach(() => {
    vi.useFakeTimers();
    logger = createDebugLogger('SessionSecurityTest', true);

    // Mock origin validator
    mockOriginValidator = createTypedMock<OriginValidator>({
      validate: vi.fn().mockResolvedValue(true),
    });

    // Mock localStorage for browser environment
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
    global.localStorage = localStorageMock as Partial<Storage> as Storage;

    // Mock clearInterval if not defined
    if (typeof clearInterval === 'undefined') {
      global.clearInterval = vi.fn();
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionManager?.destroy();
    vi.clearAllMocks();
  });

  describe('Session Creation', () => {
    it('should create a new session with default config', async () => {
      sessionManager = new SessionSecurityManager({}, logger);

      const session = await sessionManager.createSession({
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1', 'eip155:137'],
        metadata: {
          userAgent: 'Mozilla/5.0',
          custom: { appVersion: '1.0.0' },
        },
      });

      expect(session).toMatchObject({
        id: expect.stringMatching(/^session_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1', 'eip155:137'],
        state: 'active',
        metadata: {
          userAgent: 'Mozilla/5.0',
          custom: { appVersion: '1.0.0' },
        },
      });
      expect(session.createdAt).toBeCloseTo(Date.now(), -2);
      expect(session.lastActivity).toBeCloseTo(Date.now(), -2);
      expect(session.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should validate origin when validator is provided', async () => {
      sessionManager = new SessionSecurityManager({ bindToOrigin: true }, logger, mockOriginValidator);

      await sessionManager.createSession({
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
      });

      expect(mockOriginValidator.validate).toHaveBeenCalledWith('https://example.com');
    });

    it('should reject invalid origin', async () => {
      // Create a new mock that definitely returns false
      const strictOriginValidator = createTypedMock<OriginValidator>({
        validate: vi.fn().mockResolvedValue(false),
      });

      sessionManager = new SessionSecurityManager({ bindToOrigin: true }, logger, strictOriginValidator);

      await expect(
        sessionManager.createSession({
          origin: 'http://malicious.com',
          walletId: 'metamask',
          authorizedChains: ['eip155:1'],
        }),
      ).rejects.toMatchObject({
        message: 'Invalid origin for session creation',
        code: 'configuration_error',
        category: 'general',
      });
    });

    it('should enforce concurrent session limit per origin', async () => {
      sessionManager = new SessionSecurityManager({ maxConcurrentSessions: 2 }, logger);

      const origin = 'https://example.com';

      // Create 2 sessions
      const session1 = await sessionManager.createSession({
        origin,
        walletId: 'wallet1',
        authorizedChains: ['eip155:1'],
      });

      const session2 = await sessionManager.createSession({
        origin,
        walletId: 'wallet2',
        authorizedChains: ['eip155:1'],
      });

      // Creating 3rd session should revoke the oldest
      const session3 = await sessionManager.createSession({
        origin,
        walletId: 'wallet3',
        authorizedChains: ['eip155:1'],
      });

      // Check that session1 was revoked
      const validation = sessionManager.validateSession(session1.id, origin);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('revoked');

      // Sessions 2 and 3 should still be valid
      expect(sessionManager.validateSession(session2.id, origin).valid).toBe(true);
      expect(sessionManager.validateSession(session3.id, origin).valid).toBe(true);
    });

    it('should include recovery token when recovery is enabled', async () => {
      sessionManager = new SessionSecurityManager({ enableRecovery: true }, logger);

      const session = await sessionManager.createSession({
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
      });

      expect(session.recoveryToken).toBeDefined();
      expect(session.recoveryToken).toMatch(/^[a-f0-9]{64}$/); // 32 bytes hex
      expect(session.recoveryAttempts).toBe(0);
    });
  });

  describe('Session Validation', () => {
    let session: SecureSession;

    beforeEach(async () => {
      sessionManager = new SessionSecurityManager(
        {
          bindToOrigin: true,
          sessionTimeout: 3600000, // 1 hour
        },
        logger,
      );

      session = await sessionManager.createSession({
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
      });
    });

    it('should validate active session', () => {
      const result = sessionManager.validateSession(session.id, session.origin);
      expect(result.valid).toBe(true);
      expect(result.session).toBeDefined();
    });

    it('should reject non-existent session', () => {
      const result = sessionManager.validateSession('invalid-session-id', 'https://example.com');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('not_found');
    });

    it('should reject expired session', async () => {
      // Create a new session with short timeout
      const testManager = new SessionSecurityManager(
        {
          bindToOrigin: true,
          sessionTimeout: 1000, // 1 second
        },
        logger,
      );

      const testSession = await testManager.createSession({
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
      });

      // Advance time past expiry
      vi.advanceTimersByTime(2000); // 2 seconds

      const result = testManager.validateSession(testSession.id, testSession.origin);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('expired');

      testManager.destroy();
    });

    it('should reject session with origin mismatch', () => {
      const result = sessionManager.validateSession(session.id, 'https://different.com');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('origin_mismatch');
    });

    it('should allow origin mismatch when origin binding is disabled', async () => {
      sessionManager = new SessionSecurityManager({ bindToOrigin: false }, logger);

      const unboundSession = await sessionManager.createSession({
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
      });

      const result = sessionManager.validateSession(unboundSession.id, 'https://different.com');
      expect(result.valid).toBe(true);
    });

    it('should update activity tracking when enabled', async () => {
      sessionManager = new SessionSecurityManager(
        {
          trackActivity: true,
          sessionTimeout: 3600000,
          bindToOrigin: true,
        },
        logger,
      );

      const newSession = await sessionManager.createSession({
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
      });

      const initialActivity = newSession.lastActivity;
      const initialExpiry = newSession.expiresAt;

      // Advance time
      vi.advanceTimersByTime(1000);

      const result = sessionManager.validateSession(newSession.id, newSession.origin);
      expect(result.valid).toBe(true);
      expect(result.session?.lastActivity).toBeGreaterThan(initialActivity);
      expect(result.session?.expiresAt).toBeGreaterThan(initialExpiry);
    });

    it('should reject revoked session', async () => {
      await sessionManager.revokeSession(session.id);

      const result = sessionManager.validateSession(session.id, session.origin);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('revoked');
    });
  });

  describe('Session Recovery', () => {
    let session: SecureSession;

    beforeEach(async () => {
      sessionManager = new SessionSecurityManager(
        {
          enableRecovery: true,
          recoveryTimeout: 300000, // 5 minutes
          bindToOrigin: true,
        },
        logger,
      );

      session = await sessionManager.createSession({
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
      });
    });

    it('should recover session with valid token', async () => {
      const recoveryToken = session.recoveryToken;
      if (!recoveryToken) {
        throw new Error('Recovery token is required for test');
      }

      // Simulate disconnection
      session.state = 'expired';

      const recovered = await sessionManager.recoverSession(recoveryToken, session.origin);

      expect(recovered).toBeDefined();
      expect(recovered?.id).toBe(session.id);
      expect(recovered?.state).toBe('active');
      expect(recovered?.recoveryToken).not.toBe(recoveryToken); // New token
      expect(recovered?.recoveryAttempts).toBe(1);
    });

    it('should reject recovery with invalid token', async () => {
      const recovered = await sessionManager.recoverSession('invalid-token', session.origin);
      expect(recovered).toBeNull();
    });

    it('should reject recovery after timeout', async () => {
      const recoveryToken = session.recoveryToken;
      if (!recoveryToken) {
        throw new Error('Recovery token is required for test');
      }

      // Advance time past recovery timeout
      vi.advanceTimersByTime(301000); // 5 minutes + 1 second

      const recovered = await sessionManager.recoverSession(recoveryToken, session.origin);
      expect(recovered).toBeNull();
    });

    it('should reject recovery from different origin', async () => {
      const recoveryToken = session.recoveryToken;
      if (!recoveryToken) {
        throw new Error('Recovery token is required for test');
      }

      const recovered = await sessionManager.recoverSession(recoveryToken, 'https://different.com');
      expect(recovered).toBeNull();
    });

    it('should limit recovery attempts', async () => {
      const token1 = session.recoveryToken;
      if (!token1) {
        throw new Error('Recovery token is required for test');
      }

      // First recovery
      const recovered1 = await sessionManager.recoverSession(token1, session.origin);
      expect(recovered1).toBeDefined();

      // Second recovery
      const token2 = recovered1?.recoveryToken;
      if (!token2) {
        throw new Error('Recovery token is required for test');
      }
      const recovered2 = await sessionManager.recoverSession(token2, session.origin);
      expect(recovered2).toBeDefined();

      // Third recovery
      const token3 = recovered2?.recoveryToken;
      if (!token3) {
        throw new Error('Recovery token is required for test');
      }
      const recovered3 = await sessionManager.recoverSession(token3, session.origin);
      expect(recovered3).toBeDefined();

      // Fourth recovery should fail and revoke session
      const token4 = recovered3?.recoveryToken;
      if (!token4) {
        throw new Error('Recovery token is required for test');
      }
      const recovered4 = await sessionManager.recoverSession(token4, session.origin);
      expect(recovered4).toBeNull();

      // Session should be revoked
      const validation = sessionManager.validateSession(session.id, session.origin);
      expect(validation.valid).toBe(false);
    });

    it('should return null when recovery is disabled', async () => {
      sessionManager = new SessionSecurityManager({ enableRecovery: false }, logger);

      const nonRecoverableSession = await sessionManager.createSession({
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
      });

      expect(nonRecoverableSession.recoveryToken).toBeUndefined();

      const recovered = await sessionManager.recoverSession('any-token', 'https://example.com');
      expect(recovered).toBeNull();
    });
  });

  describe('Session Queries', () => {
    beforeEach(async () => {
      sessionManager = new SessionSecurityManager({}, logger);

      // Create sessions for different origins and wallets
      await sessionManager.createSession({
        origin: 'https://app1.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
      });

      await sessionManager.createSession({
        origin: 'https://app1.com',
        walletId: 'phantom',
        authorizedChains: ['solana:mainnet'],
      });

      await sessionManager.createSession({
        origin: 'https://app2.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
      });
    });

    it('should get sessions by origin', () => {
      const app1Sessions = sessionManager.getSessionsByOrigin('https://app1.com');
      expect(app1Sessions).toHaveLength(2);
      expect(app1Sessions.map((s) => s.walletId).sort()).toEqual(['metamask', 'phantom']);

      const app2Sessions = sessionManager.getSessionsByOrigin('https://app2.com');
      expect(app2Sessions).toHaveLength(1);
      expect(app2Sessions[0].walletId).toBe('metamask');
    });

    it('should get sessions by wallet', () => {
      const metamaskSessions = sessionManager.getSessionsByWallet('metamask');
      expect(metamaskSessions).toHaveLength(2);
      expect(metamaskSessions.map((s) => s.origin).sort()).toEqual(['https://app1.com', 'https://app2.com']);

      const phantomSessions = sessionManager.getSessionsByWallet('phantom');
      expect(phantomSessions).toHaveLength(1);
      expect(phantomSessions[0].origin).toBe('https://app1.com');
    });

    it('should return empty array for non-existent queries', () => {
      expect(sessionManager.getSessionsByOrigin('https://nonexistent.com')).toEqual([]);
      expect(sessionManager.getSessionsByWallet('nonexistent-wallet')).toEqual([]);
    });
  });

  describe('Session Persistence', () => {
    it('should persist sessions to localStorage', async () => {
      sessionManager = new SessionSecurityManager({ enablePersistence: true }, logger);

      const session = await sessionManager.createSession({
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        `walletmesh_session_${session.id}`,
        JSON.stringify(session),
      );
    });

    it('should load persisted sessions on initialization', () => {
      const persistedSession = {
        id: 'session_123',
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
        state: 'active',
        createdAt: Date.now() - 1000,
        lastActivity: Date.now() - 1000,
        expiresAt: Date.now() + 3600000,
        metadata: {},
      };

      (localStorage.getItem as vi.MockedFunction<typeof localStorage.getItem>).mockReturnValue(
        JSON.stringify(persistedSession),
      );

      // Mock Object.keys to return the persisted session key
      const originalObjectKeys = Object.keys;
      Object.keys = vi.fn().mockImplementation((obj) => {
        if (obj === localStorage) {
          return ['walletmesh_session_session_123'];
        }
        return originalObjectKeys(obj);
      });

      sessionManager = new SessionSecurityManager({ enablePersistence: true }, logger);

      const sessions = sessionManager.getSessionsByOrigin('https://example.com');
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('session_123');

      // Restore Object.keys
      Object.keys = originalObjectKeys;
    });

    it('should not load expired persisted sessions', () => {
      const expiredSession = {
        id: 'session_123',
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
        state: 'active',
        createdAt: Date.now() - 7200000,
        lastActivity: Date.now() - 7200000,
        expiresAt: Date.now() - 3600000, // Expired 1 hour ago
        metadata: {},
      };

      (localStorage.getItem as vi.MockedFunction<typeof localStorage.getItem>).mockReturnValue(
        JSON.stringify(expiredSession),
      );

      // Mock Object.keys to return the persisted session key
      const originalObjectKeys = Object.keys;
      Object.keys = vi.fn().mockImplementation((obj) => {
        if (obj === localStorage) {
          return ['walletmesh_session_session_123'];
        }
        return originalObjectKeys(obj);
      });

      sessionManager = new SessionSecurityManager({ enablePersistence: true }, logger);

      const sessions = sessionManager.getSessionsByOrigin('https://example.com');
      expect(sessions).toHaveLength(0);

      // Restore Object.keys
      Object.keys = originalObjectKeys;
    });

    it('should remove persisted session on revoke', async () => {
      sessionManager = new SessionSecurityManager({ enablePersistence: true }, logger);

      const session = await sessionManager.createSession({
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
      });

      await sessionManager.revokeSession(session.id);

      expect(localStorage.removeItem).toHaveBeenCalledWith(`walletmesh_session_${session.id}`);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup expired sessions automatically', async () => {
      sessionManager = new SessionSecurityManager(
        { sessionTimeout: 1000 }, // 1 second
        logger,
      );

      // Create sessions
      const session1 = await sessionManager.createSession({
        origin: 'https://example.com',
        walletId: 'wallet1',
        authorizedChains: ['eip155:1'],
      });

      const session2 = await sessionManager.createSession({
        origin: 'https://example.com',
        walletId: 'wallet2',
        authorizedChains: ['eip155:1'],
      });

      // Advance time to expire sessions
      vi.advanceTimersByTime(2000);

      // Trigger cleanup
      vi.advanceTimersByTime(60000); // 1 minute for cleanup timer

      // Sessions should be removed
      expect(sessionManager.getSessionsByOrigin('https://example.com')).toHaveLength(0);
    });

    it('should clear all sessions', async () => {
      sessionManager = new SessionSecurityManager({}, logger);

      // Create multiple sessions
      await sessionManager.createSession({
        origin: 'https://app1.com',
        walletId: 'wallet1',
        authorizedChains: ['eip155:1'],
      });

      await sessionManager.createSession({
        origin: 'https://app2.com',
        walletId: 'wallet2',
        authorizedChains: ['eip155:1'],
      });

      expect(sessionManager.getSessionsByOrigin('https://app1.com')).toHaveLength(1);
      expect(sessionManager.getSessionsByOrigin('https://app2.com')).toHaveLength(1);

      // Clear all
      sessionManager.clearAllSessions();

      expect(sessionManager.getSessionsByOrigin('https://app1.com')).toHaveLength(0);
      expect(sessionManager.getSessionsByOrigin('https://app2.com')).toHaveLength(0);
    });

    it('should stop cleanup timer on destroy', () => {
      sessionManager = new SessionSecurityManager({}, logger);

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      sessionManager.destroy();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Event Logging', () => {
    it('should log security events when enabled', async () => {
      const debugSpy = vi.spyOn(logger, 'debug');

      sessionManager = new SessionSecurityManager({ logEvents: true }, logger);

      const session = await sessionManager.createSession({
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
      });

      expect(debugSpy).toHaveBeenCalledWith(
        'Session security: session_created',
        expect.objectContaining({
          sessionId: session.id,
          origin: 'https://example.com',
        }),
      );

      await sessionManager.revokeSession(session.id);

      expect(debugSpy).toHaveBeenCalledWith(
        'Session security: session_revoked',
        expect.objectContaining({
          sessionId: session.id,
        }),
      );
    });

    it('should log security violations', async () => {
      const debugSpy = vi.spyOn(logger, 'debug');

      sessionManager = new SessionSecurityManager(
        {
          bindToOrigin: true,
          logEvents: true,
        },
        logger,
      );

      const session = await sessionManager.createSession({
        origin: 'https://example.com',
        walletId: 'metamask',
        authorizedChains: ['eip155:1'],
      });

      // Attempt validation from wrong origin
      sessionManager.validateSession(session.id, 'https://malicious.com');

      expect(debugSpy).toHaveBeenCalledWith(
        'Session security: origin_mismatch',
        expect.objectContaining({
          sessionId: session.id,
          expectedOrigin: 'https://example.com',
          actualOrigin: 'https://malicious.com',
        }),
      );
    });
  });
});
