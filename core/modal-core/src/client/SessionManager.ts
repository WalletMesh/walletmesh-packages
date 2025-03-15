import {
  WalletError,
  ConnectionStatus,
  type WalletSession,
  type ChainConnection,
  type WalletState,
  type SessionStore,
} from '../types.js';
import { createConnector } from './createConnector.js';
import { defaultSessionStore } from '../store/sessionStore.js';
import { defaultSessionStoreAdapter } from '../store/sessionStoreAdapter.js';

const MAX_RETRIES = 3;
const BASE_DELAY = 100;

export class SessionManager {
  private sessionCache = new Map<string, WalletSession>();

  constructor(private readonly store: SessionStore = defaultSessionStoreAdapter(defaultSessionStore)) {}

  public async initialize(): Promise<void> {
    await this.restoreSessions();
  }

  private validateWalletState(state: WalletState): boolean {
    if (!state?.networkId || !state?.address || !state?.sessionId) {
      console.warn('[SessionManager] Invalid wallet state:', {
        hasNetworkId: !!state?.networkId,
        hasAddress: !!state?.address,
        hasSessionId: !!state?.sessionId,
      });
      return false;
    }
    return true;
  }

  private async restoreSession(session: WalletSession, attempt = 0): Promise<void> {
    if (attempt >= MAX_RETRIES) {
      return;
    }

    try {
      const connector = await createConnector(session.wallet.info.connector);
      const restoredSession = {
        ...session,
        connector,
        status: ConnectionStatus.Resuming,
      };
      
      // Only clear error on successful restore
      restoredSession.lastConnectionError = undefined as unknown as Error;
      this.sessionCache.set(session.id, restoredSession);
      this.store.setSession(session.id, restoredSession);
    } catch (error) {
      // Persist error between retries
      const failedSession = {
        ...session,
        status: ConnectionStatus.Error,
        lastConnectionError: error as Error,
      };

      this.sessionCache.set(session.id, failedSession);
      this.store.setSession(session.id, failedSession);

      // Schedule next retry
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, BASE_DELAY * 2 ** attempt));
        await this.restoreSession(failedSession, attempt + 1);
      }
    }
  }

  private async restoreSessions(): Promise<void> {
    try {
      const storedSessions = this.store.getState().sessions;
      console.log('[SessionManager] Restoring sessions, found:', storedSessions?.size);

      if (!storedSessions || storedSessions.size === 0) {
        console.log('[SessionManager] No sessions to restore');
        return;
      }

      for (const session of storedSessions.values()) {
        if (this.validateWalletState(session.wallet.state)) {
          await this.restoreSession(session);
        }
      }
    } catch (error) {
      throw new WalletError('Failed to restore sessions', 'storage', error as Error);
    }
  }

  public setSession(walletId: string, session: WalletSession, persist = true): void {
    if (!this.validateWalletState(session.wallet.state)) {
      throw new WalletError('Invalid wallet state', 'storage');
    }
    
    this.sessionCache.set(walletId, session);
    if (persist) {
      this.store.setSession(walletId, session);
    }
  }

  public getSession(walletId: string): WalletSession | undefined {
    const session = this.sessionCache.get(walletId) || this.store.getState().sessions.get(walletId);
    if (session && this.validateWalletState(session.wallet.state)) {
      this.sessionCache.set(walletId, session);
      return session;
    }
    return undefined;
  }

  public updateSessionStatus(walletId: string, status: ConnectionStatus, error?: Error): void {
    const session = this.getSession(walletId);
    if (!session) {
      throw new WalletError(`No session found for wallet ${walletId}`, 'client');
    }

    const updatedSession = { ...session };
    updatedSession.status = status;
    updatedSession.lastConnectionError = error || (undefined as unknown as Error);
    
    this.setSession(walletId, updatedSession);
  }

  public removeSession(walletId: string): void {
    this.sessionCache.delete(walletId);
    this.store.removeSession(walletId);
  }

  public getSessions(): WalletSession[] {
    const sessions = this.store.getState().sessions;
    console.log('[SessionManager] Getting sessions, store has:', sessions.size);

    const result = Array.from(sessions.values()).filter((session) => {
      try {
        if (!session?.wallet) {
          console.warn('[SessionManager] Session missing wallet:', session);
          return false;
        }

        return Boolean(
          session.wallet.state?.sessionId &&
            session.wallet.info?.connector &&
            session.wallet.state?.address &&
            session.wallet.state?.networkId,
        );
      } catch (err) {
        return false;
      }
    });

    console.log('[SessionManager] Retrieved valid sessions:', result.length);
    return result;
  }

  public clearSessions(): void {
    this.sessionCache.clear();
    this.store.clearSessions();
  }

  public getWalletConnections(walletId: string): Map<number, ChainConnection> | undefined {
    return this.getSession(walletId)?.chainConnections;
  }
}
