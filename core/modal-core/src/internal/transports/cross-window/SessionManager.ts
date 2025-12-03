/**
 * Session Manager for Cross-Window Transport
 *
 * Manages session lifecycle, persistence, and recovery.
 * Handles session creation, validation, and cleanup.
 *
 * @module cross-window/SessionManager
 * @internal
 */

import { PROTOCOL_VERSION } from './protocol.js';

/**
 * Session configuration
 */
export interface SessionConfig {
  /** Session timeout in milliseconds */
  sessionTimeout?: number;
  /** Heartbeat interval in milliseconds */
  heartbeatInterval?: number;
  /** Maximum session age in milliseconds */
  maxSessionAge?: number;
  /** Whether to persist sessions across page reloads */
  persistSessions?: boolean;
  /** Storage key prefix for persisted sessions */
  storageKeyPrefix?: string;
  /** Whether to auto-resume sessions on reconnect */
  autoResume?: boolean;
}

/**
 * Session information
 */
export interface SessionInfo {
  /** Unique session identifier */
  id: string;
  /** Session creation timestamp */
  createdAt: number;
  /** Last activity timestamp */
  lastActivity: number;
  /** Remote origin URL */
  remoteOrigin: string;
  /** Session timeout in milliseconds */
  timeout: number;
  /** Heartbeat interval in milliseconds */
  heartbeatInterval: number;
  /** Protocol version */
  protocolVersion: string;
  /** Session metadata */
  metadata?: Record<string, unknown> | undefined;
  /** Session state */
  state: 'active' | 'suspended' | 'expired';
  /** Message statistics */
  stats: {
    messagesSent: number;
    messagesReceived: number;
    lastSequenceSent: number;
    lastSequenceReceived: number;
  };
}

/**
 * Default session configuration
 */
const DEFAULT_CONFIG: Required<SessionConfig> = {
  sessionTimeout: 300000, // 5 minutes
  heartbeatInterval: 30000, // 30 seconds
  maxSessionAge: 86400000, // 24 hours
  persistSessions: true,
  storageKeyPrefix: 'walletmesh:session:',
  autoResume: true,
};

/**
 * Manages session lifecycle and persistence
 */
export class SessionManager {
  private readonly config: Required<SessionConfig>;
  private readonly sessions = new Map<string, SessionInfo>();
  private readonly sessionTimers = new Map<string, NodeJS.Timeout>();
  private readonly isServer: boolean;

  constructor(config?: SessionConfig, isServer = false) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isServer = isServer;

    // Load persisted sessions if enabled
    if (this.config.persistSessions && typeof window !== 'undefined') {
      this.loadPersistedSessions();
    }
  }

  /**
   * Create a new session
   */
  createSession(remoteOrigin: string, metadata?: Record<string, unknown>): SessionInfo {
    const sessionId = this.generateSessionId();
    const now = Date.now();

    const session: SessionInfo = {
      id: sessionId,
      createdAt: now,
      lastActivity: now,
      remoteOrigin,
      timeout: this.config.sessionTimeout,
      heartbeatInterval: this.config.heartbeatInterval,
      protocolVersion: PROTOCOL_VERSION,
      metadata,
      state: 'active',
      stats: {
        messagesSent: 0,
        messagesReceived: 0,
        lastSequenceSent: -1,
        lastSequenceReceived: -1,
      },
    };

    this.sessions.set(sessionId, session);
    this.startSessionTimer(sessionId);
    this.persistSession(session);

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): SessionInfo | undefined {
    const session = this.sessions.get(sessionId);
    if (session && this.isSessionValid(session)) {
      return session;
    }
    return undefined;
  }

  /**
   * Update session activity
   */
  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
      this.resetSessionTimer(sessionId);
      this.persistSession(session);
    }
  }

  /**
   * Update session statistics
   */
  updateStats(sessionId: string, type: 'sent' | 'received', sequence: number): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      if (type === 'sent') {
        session.stats.messagesSent++;
        session.stats.lastSequenceSent = sequence;
      } else {
        session.stats.messagesReceived++;
        session.stats.lastSequenceReceived = sequence;
      }
      this.updateActivity(sessionId);
    }
  }

  /**
   * Suspend a session (for temporary disconnects)
   */
  suspendSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.state = 'suspended';
      this.clearSessionTimer(sessionId);
      this.persistSession(session);
    }
  }

  /**
   * Resume a suspended session
   */
  resumeSession(sessionId: string): SessionInfo | undefined {
    const session = this.sessions.get(sessionId);
    if (session && this.isSessionResumable(session)) {
      session.state = 'active';
      session.lastActivity = Date.now();
      this.startSessionTimer(sessionId);
      this.persistSession(session);
      return session;
    }
    return undefined;
  }

  /**
   * Expire a session
   */
  expireSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.state = 'expired';
      this.clearSessionTimer(sessionId);
      this.sessions.delete(sessionId);
      this.removePersistedSession(sessionId);
    }
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (
        session.state === 'expired' ||
        now - session.createdAt > this.config.maxSessionAge ||
        (session.state === 'suspended' && now - session.lastActivity > this.config.sessionTimeout * 2)
      ) {
        this.expireSession(sessionId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): SessionInfo[] {
    return Array.from(this.sessions.values()).filter((session) => session.state === 'active');
  }

  /**
   * Get session count by state
   */
  getSessionCounts(): Record<string, number> {
    const counts = { active: 0, suspended: 0, expired: 0 };
    for (const session of this.sessions.values()) {
      counts[session.state]++;
    }
    return counts;
  }

  /**
   * Check if a session can be resumed
   */
  canResumeSession(sessionId: string, lastSequence: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !this.isSessionResumable(session)) {
      return false;
    }

    // Check sequence continuity
    return session.stats.lastSequenceReceived === lastSequence;
  }

  /**
   * Clear all sessions
   */
  clearAllSessions(): void {
    for (const sessionId of this.sessions.keys()) {
      this.expireSession(sessionId);
    }
  }

  /**
   * Dispose of the session manager
   */
  dispose(): void {
    this.clearAllSessions();
    for (const timer of this.sessionTimers.values()) {
      clearTimeout(timer);
    }
    this.sessionTimers.clear();
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 11);
    const prefix = this.isServer ? 'srv' : 'cli';
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Check if a session is valid
   */
  private isSessionValid(session: SessionInfo): boolean {
    const now = Date.now();
    return (
      session.state === 'active' &&
      now - session.lastActivity <= session.timeout &&
      now - session.createdAt <= this.config.maxSessionAge
    );
  }

  /**
   * Check if a session can be resumed
   */
  private isSessionResumable(session: SessionInfo): boolean {
    const now = Date.now();
    return (
      session.state === 'suspended' &&
      now - session.lastActivity <= session.timeout * 2 && // Allow double timeout for resume
      now - session.createdAt <= this.config.maxSessionAge
    );
  }

  /**
   * Start session timeout timer
   */
  private startSessionTimer(sessionId: string): void {
    this.clearSessionTimer(sessionId);

    const timer = setTimeout(() => {
      const session = this.sessions.get(sessionId);
      if (session) {
        const now = Date.now();
        if (now - session.lastActivity > session.timeout) {
          console.debug(`[SessionManager] Session ${sessionId} timed out`);
          this.suspendSession(sessionId);
        } else {
          // Reschedule check
          this.startSessionTimer(sessionId);
        }
      }
    }, this.config.sessionTimeout);

    this.sessionTimers.set(sessionId, timer);
  }

  /**
   * Reset session timeout timer
   */
  private resetSessionTimer(sessionId: string): void {
    this.startSessionTimer(sessionId);
  }

  /**
   * Clear session timeout timer
   */
  private clearSessionTimer(sessionId: string): void {
    const timer = this.sessionTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.sessionTimers.delete(sessionId);
    }
  }

  /**
   * Persist session to storage
   */
  private persistSession(session: SessionInfo): void {
    if (!this.config.persistSessions || typeof window === 'undefined') {
      return;
    }

    try {
      const key = `${this.config.storageKeyPrefix}${session.id}`;
      const data = JSON.stringify(session);
      window.sessionStorage.setItem(key, data);
    } catch (error) {
      console.warn('[SessionManager] Failed to persist session:', error);
    }
  }

  /**
   * Remove persisted session from storage
   */
  private removePersistedSession(sessionId: string): void {
    if (!this.config.persistSessions || typeof window === 'undefined') {
      return;
    }

    try {
      const key = `${this.config.storageKeyPrefix}${sessionId}`;
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('[SessionManager] Failed to remove persisted session:', error);
    }
  }

  /**
   * Load persisted sessions from storage
   */
  private loadPersistedSessions(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const prefix = this.config.storageKeyPrefix;
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key?.startsWith(prefix)) {
          const data = window.sessionStorage.getItem(key);
          if (data) {
            const session = JSON.parse(data) as SessionInfo;
            if (this.isSessionResumable(session)) {
              session.state = 'suspended'; // Mark as suspended for resume
              this.sessions.set(session.id, session);
            } else {
              // Clean up expired session
              window.sessionStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('[SessionManager] Failed to load persisted sessions:', error);
    }
  }
}

/**
 * Create a session manager with default configuration
 */
export function createSessionManager(config?: SessionConfig, isServer = false): SessionManager {
  return new SessionManager(config, isServer);
}
