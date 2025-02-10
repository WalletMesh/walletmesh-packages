import type { WalletSession, SessionOptions } from './types.js';
import { ConnectionStatus, type ConnectedWallet } from '../../types.js';
import { WalletError } from './types.js';

interface StoredSession {
  id: string;
  wallet: ConnectedWallet;
  status: ConnectionStatus;
  timestamp: number;
}

const DEFAULT_STORAGE_KEY = 'walletmesh_sessions';

/**
 * Manages wallet sessions and their persistence
 */
export class SessionManager {
  private sessions = new Map<string, WalletSession>();
  private storageKey: string;

  constructor(options: SessionOptions = {}) {
    this.storageKey = options.storageKey || DEFAULT_STORAGE_KEY;
    this.restoreSessions();
  }

  /**
   * Creates or updates a session
   */
  setSession(
    walletId: string,
    session: WalletSession,
    persist: boolean = true
  ): void {
    this.sessions.set(walletId, {
      ...session,
      timestamp: Date.now()
    });

    if (persist) {
      this.persistSessions();
    }
  }

  /**
   * Retrieves a session by wallet ID
   */
  getSession(walletId: string): WalletSession | undefined {
    return this.sessions.get(walletId);
  }

  /**
   * Updates a session's status
   */
  updateSessionStatus(
    walletId: string,
    status: ConnectionStatus,
    error?: Error
  ): void {
    const session = this.sessions.get(walletId);
    if (!session) {
      throw new WalletError(
        `No session found for wallet ${walletId}`,
        'client'
      );
    }

    session.status = status;
    if (error) {
      session.lastError = error;
    }
    
    this.sessions.set(walletId, session);
    this.persistSessions();
  }

  /**
   * Removes a session
   */
  removeSession(walletId: string): void {
    this.sessions.delete(walletId);
    this.persistSessions();
  }

  /**
   * Lists all active sessions
   */
  getSessions(): WalletSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Clears all sessions
   */
  clearSessions(): void {
    this.sessions.clear();
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Persists sessions to localStorage
   */
  private persistSessions(): void {
    try {
      const serializedSessions = Array.from(this.sessions.entries()).map(
        ([id, session]) => ({
          id,
          wallet: session.wallet,
          status: session.status,
          timestamp: session.timestamp
        })
      );
      localStorage.setItem(this.storageKey, JSON.stringify(serializedSessions));
    } catch (error) {
      console.warn('Failed to persist sessions:', error);
    }
  }

  /**
   * Restores sessions from localStorage
   */
  private restoreSessions(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const sessions = JSON.parse(stored) as StoredSession[];
      
      for (const session of sessions) {
        if (session.id && session.wallet) {
          // Store partial session data - transport and adapter will be recreated on resume
          const partialSession: Partial<WalletSession> = {
            wallet: session.wallet,
            status: ConnectionStatus.Idle,
            timestamp: session.timestamp || Date.now()
          };
          this.sessions.set(session.id, partialSession as WalletSession);
        }
      }
    } catch (error) {
      console.warn('Failed to restore sessions:', error);
      localStorage.removeItem(this.storageKey);
    }
  }
}
