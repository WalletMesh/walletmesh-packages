import {
  type WalletInfo,
  type WalletState,
  type WalletSession,
  type SessionStore,
  type ConnectedWallet,
  ConnectionState,
} from '../types.js';
import type { Connector } from './types.js';
import { createClientError } from './errors.js';

export class SessionManager {
  private initialized = false;
  private readonly store: SessionStore;

  constructor(store: SessionStore) {
    this.store = store;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.restoreSessions();
      this.initialized = true;
    } catch (error) {
      throw createClientError.initFailed('Failed to initialize session manager', {
        cause: error instanceof Error ? error : new Error('Unknown error'),
      });
    }
  }

  private async restoreSessions(): Promise<void> {
    try {
      // Handle both sync and async getSessions
      const sessions = await Promise.resolve(this.store.getSessions());
      for (const session of sessions) {
        try {
          const restoredSession = await this.restoreSession(session);
          this.setSession(session.id, restoredSession);
        } catch (error) {
          console.warn(`Failed to restore session ${session.id}:`, error);
        }
      }
    } catch (error) {
      throw createClientError.restoreFailed('Failed to restore wallet sessions', {
        cause: error instanceof Error ? error : new Error('Unknown error'),
      });
    }
  }

  private async restoreSession(session: WalletSession): Promise<WalletSession> {
    if (!this.validateSession(session)) {
      throw createClientError.error('Invalid session data', {
        session,
        code: 'invalid_session',
      });
    }

    // Update session status based on current wallet state
    if (session.status === ConnectionState.CONNECTED && !session.wallet.connected) {
      session.status = ConnectionState.CONNECTING;
    }

    return session;
  }

  private validateSession(session: WalletSession): boolean {
    return (
      typeof session === 'object' &&
      typeof session.id === 'string' &&
      typeof session.address === 'string' &&
      typeof session.wallet === 'object' &&
      typeof session.wallet.address === 'string' &&
      typeof session.wallet.state === 'object' &&
      typeof session.wallet.state.address === 'string' &&
      typeof session.wallet.state.networkId === 'number' &&
      typeof session.wallet.state.sessionId === 'string'
    );
  }

  getSession(id: string): WalletSession | undefined {
    return this.store.getSession(id);
  }

  getSessions(): WalletSession[] {
    return Array.from(this.store.sessions.values());
  }

  setSession(id: string, session: WalletSession): void {
    this.store.setSession(id, Object.freeze(session));
  }

  removeSession(id: string): void {
    this.store.removeSession(id);
  }

  updateSessionStatus(id: string, status: ConnectionState): void {
    const session = this.getSession(id);
    if (!session) return;

    const updatedSession: WalletSession = {
      ...session,
      status,
      wallet: {
        ...session.wallet,
        connected: status === ConnectionState.CONNECTED,
      },
    };

    this.setSession(id, updatedSession);
  }

  /**
   * Creates a new wallet session
   */
  createSession(wallet: ConnectedWallet, connector: Connector, expiry = Date.now() + 3600000): WalletSession {
    return Object.freeze({
      id: wallet.state?.sessionId ?? crypto.randomUUID(),
      address: wallet.address,
      chains: {},
      connector,
      expiry,
      status: wallet.connected ? ConnectionState.CONNECTED : ConnectionState.CONNECTING,
      wallet,
    });
  }

  /**
   * Resumes an existing session
   */
  async resumeSession(
    session: WalletSession,
    walletInfo: WalletInfo,
    state: WalletState,
  ): Promise<WalletSession> {
    const wallet = await session.connector.resume(walletInfo, state);
    return this.createSession(wallet, session.connector, session.expiry);
  }
}
