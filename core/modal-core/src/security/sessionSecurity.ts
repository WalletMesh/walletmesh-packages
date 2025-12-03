/**
 * Session Security Module
 *
 * This module implements secure session binding, validation, and recovery
 * for wallet connections. It ensures sessions are bound to their originating
 * origins and provides secure session persistence.
 *
 * @module security/sessionSecurity
 */

import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import type { Logger } from '../internal/core/logger/logger.js';
import { generateSessionId as generateSecureId, generateSecureToken } from '../utils/crypto.js';
import type { OriginValidator } from './originValidation.js';

/**
 * Session security configuration
 *
 * @remarks
 * Configures the session security module with origin binding, persistence,
 * recovery options, and activity tracking for secure wallet sessions.
 *
 * @public
 * @category Security
 * @example
 * ```typescript
 * const config: SessionSecurityConfig = {
 *   bindToOrigin: true,
 *   sessionTimeout: 3600000, // 1 hour
 *   enablePersistence: true,
 *   enableRecovery: true,
 *   maxConcurrentSessions: 5
 * };
 * ```
 */
export interface SessionSecurityConfig {
  /** Enable origin binding for sessions */
  bindToOrigin?: boolean;

  /** Session timeout in milliseconds */
  sessionTimeout?: number;

  /** Enable session persistence */
  enablePersistence?: boolean;

  /** Storage key prefix for persisted sessions */
  storageKeyPrefix?: string;

  /** Maximum number of concurrent sessions */
  maxConcurrentSessions?: number;

  /** Enable session recovery */
  enableRecovery?: boolean;

  /** Recovery timeout in milliseconds */
  recoveryTimeout?: number;

  /** Custom session ID generator */
  sessionIdGenerator?: () => string;

  /** Enable session activity tracking */
  trackActivity?: boolean;

  /** Log security events */
  logEvents?: boolean;
}

/**
 * Secure session information
 *
 * @remarks
 * Contains comprehensive information about a secure wallet session including
 * origin binding, authorization details, activity tracking, and recovery tokens.
 *
 * @public
 * @category Security
 * @example
 * ```typescript
 * const session: SecureSession = {
 *   id: 'session_1234567890',
 *   origin: 'https://myapp.com',
 *   walletId: 'metamask',
 *   authorizedChains: ['1', '137'],
 *   createdAt: Date.now(),
 *   lastActivity: Date.now(),
 *   expiresAt: Date.now() + 3600000,
 *   state: 'active',
 *   metadata: {
 *     userAgent: navigator.userAgent
 *   }
 * };
 * ```
 */
export interface SecureSession {
  /** Unique session identifier */
  id: string;

  /** Origin that created the session */
  origin: string;

  /** Wallet ID */
  walletId: string;

  /** Chain IDs authorized for this session */
  authorizedChains: string[];

  /** Session creation timestamp */
  createdAt: number;

  /** Last activity timestamp */
  lastActivity: number;

  /** Session expiry timestamp */
  expiresAt: number;

  /** Session metadata */
  metadata: {
    /** User agent that created the session */
    userAgent?: string;

    /** IP address hash (for additional validation) */
    ipHash?: string;

    /** Custom metadata */
    custom?: Record<string, unknown>;
  };

  /** Session state */
  state: 'active' | 'expired' | 'revoked';

  /** Recovery token (if recovery is enabled) */
  recoveryToken?: string;

  /** Number of recovery attempts */
  recoveryAttempts?: number;
}

/**
 * Session validation result
 *
 * @remarks
 * Contains the result of session validation including validity status,
 * failure reasons, and updated session information if activity tracking is enabled.
 *
 * @public
 * @category Security
 * @example
 * ```typescript
 * const result = sessionManager.validateSession(sessionId, origin);
 * if (!result.valid) {
 *   console.error(`Session invalid: ${result.reason}`);
 * }
 * ```
 */
export interface SessionValidationResult {
  /** Whether the session is valid */
  valid: boolean;

  /** Reason if invalid */
  reason?: 'expired' | 'origin_mismatch' | 'revoked' | 'not_found';

  /** Updated session (if activity tracking is enabled) */
  session?: SecureSession;
}

/**
 * Session security manager
 *
 * @remarks
 * Manages secure wallet sessions with the following features:
 * - Origin binding to prevent session hijacking
 * - Configurable session timeouts with automatic expiry
 * - Session persistence across page reloads
 * - Recovery tokens for session restoration
 * - Activity tracking to extend active sessions
 * - Concurrent session limits per origin
 * - Automatic cleanup of expired sessions
 *
 * @public
 * @category Security
 * @example
 * ```typescript
 * const sessionManager = new SessionSecurityManager({
 *   bindToOrigin: true,
 *   sessionTimeout: 3600000,
 *   enableRecovery: true
 * }, logger);
 *
 * // Create a new session
 * const session = await sessionManager.createSession({
 *   origin: 'https://myapp.com',
 *   walletId: 'metamask',
 *   authorizedChains: ['1', '137']
 * });
 *
 * // Validate session
 * const validation = sessionManager.validateSession(session.id, 'https://myapp.com');
 * if (validation.valid) {
 *   // Session is valid
 * }
 * ```
 */
export class SessionSecurityManager {
  private readonly config: Required<SessionSecurityConfig>;
  private readonly logger: Logger;
  private readonly sessions = new Map<string, SecureSession>();
  private readonly sessionsByOrigin = new Map<string, Set<string>>();
  private readonly sessionsByWallet = new Map<string, Set<string>>();
  private cleanupTimer: NodeJS.Timeout | null = null;
  private originValidator: OriginValidator | null = null;

  constructor(config: SessionSecurityConfig, logger: Logger, originValidator?: OriginValidator) {
    this.config = {
      bindToOrigin: true,
      sessionTimeout: 3600000, // 1 hour
      enablePersistence: true,
      storageKeyPrefix: 'walletmesh_session_',
      maxConcurrentSessions: 10,
      enableRecovery: true,
      recoveryTimeout: 300000, // 5 minutes
      sessionIdGenerator: this.generateSessionId,
      trackActivity: true,
      logEvents: true,
      ...config,
    };
    this.logger = logger;
    this.originValidator = originValidator || null;

    // Load persisted sessions if enabled
    if (this.config.enablePersistence) {
      this.loadPersistedSessions();
    }

    // Start cleanup timer
    this.startCleanupTimer();
  }

  /**
   * Create a new secure session
   *
   * @remarks
   * Creates a new secure session bound to the specified origin and wallet.
   * Enforces concurrent session limits and validates origin if validator is provided.
   *
   * @param params - Session creation parameters
   * @param params.origin - The origin creating the session
   * @param params.walletId - The wallet identifier
   * @param params.authorizedChains - Chain IDs authorized for this session
   * @param params.metadata - Optional session metadata
   * @returns The created secure session
   * @throws Error if origin validation fails
   *
   * @example
   * ```typescript
   * const session = await sessionManager.createSession({
   *   origin: window.location.origin,
   *   walletId: 'metamask',
   *   authorizedChains: ['1', '137'],
   *   metadata: {
   *     userAgent: navigator.userAgent,
   *     custom: { theme: 'dark' }
   *   }
   * });
   * ```
   */
  async createSession(params: {
    origin: string;
    walletId: string;
    authorizedChains: string[];
    metadata?: SecureSession['metadata'];
  }): Promise<SecureSession> {
    // Validate origin if validator is available
    if (this.originValidator) {
      const isValidOrigin = await this.originValidator.validate(params.origin);
      if (!isValidOrigin) {
        throw ErrorFactory.configurationError('Invalid origin for session creation');
      }
    }

    // Check concurrent session limit per origin
    const originSessions = this.sessionsByOrigin.get(params.origin) || new Set();
    if (originSessions.size >= this.config.maxConcurrentSessions) {
      // Revoke oldest session
      const oldestSessionId = Array.from(originSessions)[0];
      if (oldestSessionId) {
        await this.revokeSession(oldestSessionId);
      }
    }

    const now = Date.now();
    const session: SecureSession = {
      id: this.config.sessionIdGenerator(),
      origin: params.origin,
      walletId: params.walletId,
      authorizedChains: params.authorizedChains,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + this.config.sessionTimeout,
      metadata: params.metadata || {},
      state: 'active',
      ...(this.config.enableRecovery ? { recoveryToken: this.generateRecoveryToken() } : {}),
      recoveryAttempts: 0,
    };

    // Store session
    this.sessions.set(session.id, session);

    // Update indices
    if (!this.sessionsByOrigin.has(params.origin)) {
      this.sessionsByOrigin.set(params.origin, new Set());
    }
    const originSessionSet = this.sessionsByOrigin.get(params.origin);
    if (originSessionSet) {
      originSessionSet.add(session.id);
    }

    if (!this.sessionsByWallet.has(params.walletId)) {
      this.sessionsByWallet.set(params.walletId, new Set());
    }
    const walletSessions = this.sessionsByWallet.get(params.walletId);
    if (walletSessions) {
      walletSessions.add(session.id);
    }

    // Persist if enabled
    if (this.config.enablePersistence) {
      this.persistSession(session);
    }

    this.logEvent('session_created', { sessionId: session.id, origin: params.origin });

    return session;
  }

  /**
   * Validate a session
   *
   * @remarks
   * Validates that a session exists, is not expired, matches the origin,
   * and is in a valid state. Updates activity tracking if enabled.
   *
   * @param sessionId - The session ID to validate
   * @param origin - The origin making the request
   * @returns Validation result with status and updated session
   *
   * @example
   * ```typescript
   * const result = sessionManager.validateSession(sessionId, origin);
   * if (result.valid) {
   *   // Session is valid, proceed with request
   *   const session = result.session;
   * } else {
   *   // Handle invalid session
   *   console.error(`Session invalid: ${result.reason}`);
   * }
   * ```
   */
  validateSession(sessionId: string, origin: string): SessionValidationResult {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return { valid: false, reason: 'not_found' };
    }

    // Check expiry first to update state if needed
    const now = Date.now();
    if (now > session.expiresAt) {
      session.state = 'expired';
      return { valid: false, reason: 'expired' };
    }

    // Check state after expiry check
    if (session.state === 'revoked') {
      return { valid: false, reason: 'revoked' };
    }

    if (session.state === 'expired') {
      return { valid: false, reason: 'expired' };
    }

    // Check origin binding
    if (this.config.bindToOrigin && session.origin !== origin) {
      this.logEvent('origin_mismatch', { sessionId, expectedOrigin: session.origin, actualOrigin: origin });
      return { valid: false, reason: 'origin_mismatch' };
    }

    // Update activity if tracking is enabled
    if (this.config.trackActivity) {
      session.lastActivity = now;
      session.expiresAt = now + this.config.sessionTimeout;

      if (this.config.enablePersistence) {
        this.persistSession(session);
      }
    }

    return { valid: true, session };
  }

  /**
   * Recover a session using recovery token
   *
   * @remarks
   * Attempts to recover a session using a recovery token. Validates the token,
   * checks recovery timeout, verifies origin, and enforces attempt limits.
   *
   * @param recoveryToken - The recovery token
   * @param origin - The origin attempting recovery
   * @returns The recovered session or null if recovery fails
   *
   * @example
   * ```typescript
   * const recoveredSession = await sessionManager.recoverSession(
   *   savedRecoveryToken,
   *   window.location.origin
   * );
   * if (recoveredSession) {
   *   console.log('Session recovered successfully');
   * } else {
   *   console.error('Session recovery failed');
   * }
   * ```
   */
  async recoverSession(recoveryToken: string, origin: string): Promise<SecureSession | null> {
    if (!this.config.enableRecovery) {
      return null;
    }

    // Find session by recovery token
    let targetSession: SecureSession | null = null;
    for (const session of this.sessions.values()) {
      if (session.recoveryToken === recoveryToken) {
        targetSession = session;
        break;
      }
    }

    if (!targetSession) {
      this.logEvent('recovery_failed', { reason: 'invalid_token' });
      return null;
    }

    // Check if recovery is within timeout
    const now = Date.now();
    if (now - targetSession.lastActivity > this.config.recoveryTimeout) {
      this.logEvent('recovery_failed', { sessionId: targetSession.id, reason: 'timeout' });
      return null;
    }

    // Validate origin
    if (this.config.bindToOrigin && targetSession.origin !== origin) {
      this.logEvent('recovery_failed', { sessionId: targetSession.id, reason: 'origin_mismatch' });
      return null;
    }

    // Update recovery attempts
    targetSession.recoveryAttempts = (targetSession.recoveryAttempts || 0) + 1;

    // Limit recovery attempts
    if (targetSession.recoveryAttempts > 3) {
      await this.revokeSession(targetSession.id);
      this.logEvent('recovery_failed', { sessionId: targetSession.id, reason: 'max_attempts' });
      return null;
    }

    // Recover session
    targetSession.state = 'active';
    targetSession.lastActivity = now;
    targetSession.expiresAt = now + this.config.sessionTimeout;

    // Generate new recovery token
    targetSession.recoveryToken = this.generateRecoveryToken();

    if (this.config.enablePersistence) {
      this.persistSession(targetSession);
    }

    this.logEvent('session_recovered', { sessionId: targetSession.id });

    return targetSession;
  }

  /**
   * Revoke a session
   *
   * @remarks
   * Revokes a session, marking it as invalid and removing it from active indices.
   * The session is kept in memory temporarily for validation to return proper
   * 'revoked' status before eventual cleanup.
   *
   * @param sessionId - The session ID to revoke
   *
   * @example
   * ```typescript
   * // Revoke session on logout
   * await sessionManager.revokeSession(sessionId);
   * console.log('Session revoked');
   * ```
   */
  async revokeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Set state to revoked but keep the session in memory
    // This allows validation to return proper 'revoked' reason
    session.state = 'revoked';

    // Remove from indices
    const originSessions = this.sessionsByOrigin.get(session.origin);
    if (originSessions) {
      originSessions.delete(sessionId);
      if (originSessions.size === 0) {
        this.sessionsByOrigin.delete(session.origin);
      }
    }

    const walletSessions = this.sessionsByWallet.get(session.walletId);
    if (walletSessions) {
      walletSessions.delete(sessionId);
      if (walletSessions.size === 0) {
        this.sessionsByWallet.delete(session.walletId);
      }
    }

    // Don't remove from sessions map immediately - keep for validation
    // The cleanup timer will eventually remove revoked sessions

    if (this.config.enablePersistence) {
      this.removePersistedSession(sessionId);
    }

    this.logEvent('session_revoked', { sessionId });
  }

  /**
   * Get all sessions for an origin
   *
   * @remarks
   * Retrieves all active sessions associated with a specific origin.
   * Useful for managing multiple sessions from the same origin.
   *
   * @param origin - The origin to query
   * @returns Array of sessions for the origin
   *
   * @example
   * ```typescript
   * const sessions = sessionManager.getSessionsByOrigin('https://myapp.com');
   * console.log(`Found ${sessions.length} sessions for origin`);
   * ```
   */
  getSessionsByOrigin(origin: string): SecureSession[] {
    const sessionIds = this.sessionsByOrigin.get(origin) || new Set();
    return Array.from(sessionIds)
      .map((id) => this.sessions.get(id))
      .filter((session): session is SecureSession => session !== undefined);
  }

  /**
   * Get all sessions for a wallet
   *
   * @remarks
   * Retrieves all active sessions associated with a specific wallet.
   * Useful for managing sessions across different origins for the same wallet.
   *
   * @param walletId - The wallet ID to query
   * @returns Array of sessions for the wallet
   *
   * @example
   * ```typescript
   * const sessions = sessionManager.getSessionsByWallet('metamask');
   * sessions.forEach(session => {
   *   console.log(`Session from ${session.origin}`);
   * });
   * ```
   */
  getSessionsByWallet(walletId: string): SecureSession[] {
    const sessionIds = this.sessionsByWallet.get(walletId) || new Set();
    return Array.from(sessionIds)
      .map((id) => this.sessions.get(id))
      .filter((session): session is SecureSession => session !== undefined);
  }

  /**
   * Clear all sessions
   *
   * @remarks
   * Removes all sessions from memory and persistent storage.
   * Use with caution as this will invalidate all active sessions.
   *
   * @example
   * ```typescript
   * // Clear all sessions during security incident
   * sessionManager.clearAllSessions();
   * console.log('All sessions cleared');
   * ```
   */
  clearAllSessions(): void {
    this.sessions.clear();
    this.sessionsByOrigin.clear();
    this.sessionsByWallet.clear();

    if (this.config.enablePersistence) {
      this.clearPersistedSessions();
    }

    this.logEvent('all_sessions_cleared');
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return generateSecureId('session');
  }

  /**
   * Generate recovery token
   */
  private generateRecoveryToken(): string {
    return generateSecureToken(32);
  }

  /**
   * Load persisted sessions
   */
  private loadPersistedSessions(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith(this.config.storageKeyPrefix));

      for (const key of keys) {
        const sessionData = localStorage.getItem(key);
        if (sessionData) {
          const session = JSON.parse(sessionData) as SecureSession;

          // Validate session is not expired
          if (session.state === 'active' && session.expiresAt > Date.now()) {
            this.sessions.set(session.id, session);

            // Rebuild indices
            if (!this.sessionsByOrigin.has(session.origin)) {
              this.sessionsByOrigin.set(session.origin, new Set());
            }
            const sessionOriginSet = this.sessionsByOrigin.get(session.origin);
            if (sessionOriginSet) {
              sessionOriginSet.add(session.id);
            }

            if (!this.sessionsByWallet.has(session.walletId)) {
              this.sessionsByWallet.set(session.walletId, new Set());
            }
            const sessionWalletSet = this.sessionsByWallet.get(session.walletId);
            if (sessionWalletSet) {
              sessionWalletSet.add(session.id);
            }
          }
        }
      }

      this.logEvent('sessions_loaded', { count: this.sessions.size });
    } catch (error) {
      this.logger.error('Failed to load persisted sessions', error);
    }
  }

  /**
   * Persist a session
   */
  private persistSession(session: SecureSession): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const key = `${this.config.storageKeyPrefix}${session.id}`;
      localStorage.setItem(key, JSON.stringify(session));
    } catch (error) {
      this.logger.error('Failed to persist session', { sessionId: session.id, error });
    }
  }

  /**
   * Remove persisted session
   */
  private removePersistedSession(sessionId: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const key = `${this.config.storageKeyPrefix}${sessionId}`;
      localStorage.removeItem(key);
    } catch (error) {
      this.logger.error('Failed to remove persisted session', { sessionId, error });
    }
  }

  /**
   * Clear all persisted sessions
   */
  private clearPersistedSessions(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith(this.config.storageKeyPrefix));

      for (const key of keys) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      this.logger.error('Failed to clear persisted sessions', error);
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    // Clean up expired sessions every minute
    if (typeof setInterval === 'undefined') {
      // Skip timer setup in environments without setInterval
      return;
    }

    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const expiredSessions: string[] = [];

      for (const [sessionId, session] of this.sessions) {
        if (session.state === 'active' && now > session.expiresAt) {
          session.state = 'expired';
          expiredSessions.push(sessionId);
        }
      }

      // Remove expired sessions
      for (const sessionId of expiredSessions) {
        const session = this.sessions.get(sessionId);
        if (session) {
          // Remove from indices
          const originSessions = this.sessionsByOrigin.get(session.origin);
          if (originSessions) {
            originSessions.delete(sessionId);
            if (originSessions.size === 0) {
              this.sessionsByOrigin.delete(session.origin);
            }
          }

          const walletSessions = this.sessionsByWallet.get(session.walletId);
          if (walletSessions) {
            walletSessions.delete(sessionId);
            if (walletSessions.size === 0) {
              this.sessionsByWallet.delete(session.walletId);
            }
          }

          // Now remove from sessions map
          this.sessions.delete(sessionId);

          if (this.config.enablePersistence) {
            this.removePersistedSession(sessionId);
          }
        }
      }

      // Also clean up revoked sessions
      const revokedSessions: string[] = [];
      for (const [sessionId, session] of this.sessions) {
        if (session.state === 'revoked') {
          revokedSessions.push(sessionId);
        }
      }

      for (const sessionId of revokedSessions) {
        this.sessions.delete(sessionId);
        if (this.config.enablePersistence) {
          this.removePersistedSession(sessionId);
        }
      }

      if (expiredSessions.length > 0) {
        this.logEvent('cleanup', { expired: expiredSessions.length });
      }
    }, 60000); // Every minute
  }

  /**
   * Log security event
   */
  private logEvent(event: string, data?: Record<string, unknown>): void {
    if (!this.config.logEvents) return;

    this.logger.debug(`Session security: ${event}`, data);
  }

  /**
   * Destroy session manager
   *
   * @remarks
   * Cleans up all resources including timers and session data.
   * Call this when the session manager is no longer needed.
   *
   * @example
   * ```typescript
   * // Clean up on application shutdown
   * sessionManager.destroy();
   * ```
   */
  destroy(): void {
    if (this.cleanupTimer) {
      // Handle environments where clearInterval might not be defined
      if (typeof clearInterval !== 'undefined') {
        clearInterval(this.cleanupTimer);
      }
      this.cleanupTimer = null;
    }

    this.clearAllSessions();
  }
}
