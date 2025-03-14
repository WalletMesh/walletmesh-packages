import type { WalletSession, SessionToken, ChainConnection } from './types.js';
import { ConnectionStatus, type WalletState, type WalletInfo, type ConnectedWallet } from '../../types.js';
import type { Connector } from '../connectors/types.js';
import { createConnector } from '../connectors/createConnector.js';
import { useWalletStore } from '../../store/walletStore.js';
import { WalletError } from './types.js';

// Constants
const MAX_RETRIES = 3;
const BASE_DELAY = 100;
const TOKEN_VALIDITY_DURATION = 24 * 60 * 60 * 1000;

/**
 * Custom error type for session-specific errors
 */
class SessionError extends WalletError {
  constructor(
    message: string,
    code: 'connector' | 'storage' | 'client' | 'transport' | 'timeout',
    cause?: Error,
  ) {
    super(message, code, cause);
    this.name = 'SessionError';
  }
}

/**
 * Manages wallet connection sessions using zustand store for persistence.
 */
export class SessionManager {
  private sessionCache = new Map<string, WalletSession>();
  private store: typeof useWalletStore;

  constructor() {
    this.store = useWalletStore;
    this.restoreSessions().catch(console.error);
  }

  /**
   * Creates or updates a session token
   */
  private createOrUpdateSessionToken(
    existing: SessionToken | undefined,
    incoming: Partial<SessionToken>,
    chainId: number,
  ): SessionToken {
    const now = Date.now();

    if (!existing || existing.expiresAt <= now) {
      return {
        id: incoming.id || crypto.randomUUID(),
        createdAt: now,
        expiresAt: now + TOKEN_VALIDITY_DURATION,
        walletType: incoming.walletType || '',
        publicKey: incoming.publicKey || '',
        permissions: incoming.permissions || [],
        accounts: incoming.accounts || [],
        chainIds: [chainId],
        nonce: crypto.randomUUID(),
        signature: incoming.signature || '',
      };
    }

    return {
      ...existing,
      permissions: Array.from(new Set([...existing.permissions, ...(incoming.permissions || [])])),
      accounts: Array.from(new Set([...existing.accounts, ...(incoming.accounts || [])])),
      chainIds: Array.from(new Set([...existing.chainIds, chainId])),
    };
  }

  /**
   * Creates a new session with valid structure
   */
  private createSession(
    id: string,
    wallet: ConnectedWallet,
    connector?: Connector,
    existingSession?: WalletSession,
  ): WalletSession {
    const now = Date.now();
    const chainId = Number(wallet.state.networkId || 0);

    const session: WalletSession = {
      id,
      createdAt: existingSession?.createdAt || now,
      wallet,
      chainConnections: new Map(existingSession?.chainConnections || []),
      sessionToken: this.createOrUpdateSessionToken(
        existingSession?.sessionToken,
        {
          walletType: wallet.info.id,
          accounts: [wallet.state.address || ''],
        },
        chainId,
      ),
      status: wallet.state.sessionId ? ConnectionStatus.Connected : ConnectionStatus.Idle,
    };

    if (connector) {
      session.connector = connector;
    }

    // Update chain connections if we have valid state
    if (wallet.state.address && wallet.state.networkId) {
      session.chainConnections.set(chainId, {
        address: wallet.state.address,
        permissions: session.sessionToken.permissions,
      });
    }

    return session;
  }

  /**
   * Stores or updates a wallet session.
   */
  setSession(walletId: string, session: WalletSession, persist = true): void {
    if (!this.validateWalletState(session.wallet.state)) {
      throw new WalletError('Invalid wallet state', 'storage');
    }

    // Create a properly structured session
    const updatedSession = this.createSession(
      walletId,
      session.wallet,
      session.connector,
      this.sessionCache.get(walletId),
    );

    // Update cache and store
    this.sessionCache.set(walletId, updatedSession);
    if (persist) {
      this.store.getState().setSession(walletId, updatedSession);
    }
  }

  /**
   * Retrieves a stored wallet session.
   */
  getSession(walletId: string): WalletSession | undefined {
    // Try cache first
    let session = this.sessionCache.get(walletId);
    if (session) {
      if (this.validateWalletState(session.wallet.state)) {
        return session;
      }
      // Remove invalid session from cache
      console.warn('[SessionManager] Removing invalid cached session:', walletId);
      this.sessionCache.delete(walletId);
    }

    // Try store
    session = this.store.getState().sessions.get(walletId);

    if (session && this.validateWalletState(session.wallet.state)) {
      this.sessionCache.set(walletId, session);
      return session;
    }

    return undefined;
  }

  /**
   * Gets all chain connections for a specific wallet.
   */
  getWalletConnections(walletId: string): Map<number, ChainConnection> | undefined {
    return this.getSession(walletId)?.chainConnections;
  }

  /**
   * Updates the connection status of a wallet session.
   */
  updateSessionStatus(walletId: string, status: ConnectionStatus, error?: Error): void {
    const session = this.getSession(walletId);
    if (!session) {
      throw new WalletError(`No session found for wallet ${walletId}`, 'client');
    }

    session.status = status;
    if (error) {
      session.lastConnectionError = error;
    }

    this.setSession(walletId, session);
  }

  /**
   * Removes a wallet session.
   */
  removeSession(walletId: string): void {
    this.sessionCache.delete(walletId);
    this.store.getState().removeSession(walletId);
  }

  /**
   * Gets all stored wallet sessions.
   */
  getSessions(): WalletSession[] {
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

  /**
   * Removes all stored wallet sessions.
   */
  clearSessions(): void {
    this.sessionCache.clear();
    this.store.getState().clearSessions();
  }

  /**
   * Validates the wallet state.
   */
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

  /**
   * Creates a connector instance from wallet info.
   */
  private async createConnectorFromInfo(walletInfo: WalletInfo): Promise<Connector | undefined> {
    try {
      return createConnector(walletInfo.connector);
    } catch (error) {
      console.warn('[SessionManager] Failed to create connector:', error);
      return undefined;
    }
  }

  /**
   * Restores a single session, ensuring proper structure
   */
  private async restoreSession(session: WalletSession): Promise<boolean> {
    try {
      // Validate session has required fields
      if (!this.validateWalletState(session.wallet.state)) {
        console.warn('[SessionManager] Invalid wallet state in session:', session.id);
        return false;
      }

      const connector = await this.createConnectorFromInfo(session.wallet.info);
      if (!connector) {
        console.warn('[SessionManager] Failed to create connector for session:', session.id);
        return false;
      }

      // Create a fresh session with proper structure
      const restoredSession = this.createSession(session.id, session.wallet, connector, session);

      restoredSession.status = ConnectionStatus.Resuming;
      this.sessionCache.set(session.id, restoredSession);
      this.store.getState().setSession(session.id, restoredSession);

      return true;
    } catch (err) {
      console.warn('[SessionManager] Failed to restore session:', session.id, err);
      return false;
    }
  }

  /**
   * Restores sessions from storage.
   */
  private async restoreSessions(): Promise<void> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < MAX_RETRIES) {
      try {
        const storedSessions = this.store.getState().sessions;
        console.log('[SessionManager] Restoring sessions, found:', storedSessions?.size);

        if (!storedSessions || storedSessions.size === 0) {
          console.log('[SessionManager] No sessions to restore');
          return;
        }

        let restoredCount = 0;
        for (const [_, session] of storedSessions) {
          if (await this.restoreSession(session)) {
            restoredCount++;
          }
        }

        if (restoredCount === 0) {
          console.warn('[SessionManager] No sessions were successfully restored');
          this.clearSessions();
        } else {
          console.log('[SessionManager] Successfully restored sessions:', restoredCount);
        }

        return;
      } catch (error) {
        lastError = error as Error;
        attempt++;
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, BASE_DELAY * 2 ** (attempt - 1)));
        }
      }
    }

    throw new SessionError(
      'Failed to restore sessions after multiple attempts',
      'storage',
      lastError || undefined,
    );
  }
}
