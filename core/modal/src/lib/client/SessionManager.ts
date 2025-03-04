/**
 * @file SessionManager.ts
 * @packageDocumentation
 * Session management and persistence layer for the WalletMesh Modal package.
 */

import type { WalletSession, SessionToken, ChainConnection, SerializedSession } from './types.js';
import type { WalletState, WalletInfo } from '../../types.js';
import type { Connector } from '../connectors/types.js';
import { createConnector } from '../connectors/createConnector.js';
import { ConnectionStatus } from '../../types.js';
import { WalletError } from './types.js';

// Constants
const MAX_RETRIES = 3;
const BASE_DELAY = 100;
const FALLBACK_STORAGE_KEY = 'walletmesh_wallet_session_fallback';
const STORAGE_KEY = 'walletmesh_wallet_session';
const PERSIST_DEBOUNCE_DELAY = 500;
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
 * Storage interface for session data
 */
interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/**
 * LocalStorage adapter implementation
 */
class LocalStorageAdapter implements StorageAdapter {
  get(key: string): string | null {
    return localStorage.getItem(key);
  }

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}

/**
 * In-memory fallback storage adapter
 */
class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, string>();

  get(key: string): string | null {
    return this.storage.get(key) || null;
  }

  set(key: string, value: string): void {
    this.storage.set(key, value);
  }

  remove(key: string): void {
    this.storage.delete(key);
  }
}

/**
 * Manages wallet connection sessions and their persistence.
 */
export class SessionManager {
  private sessions = new Map<string, WalletSession>();
  private primaryStorage: StorageAdapter;
  private fallbackStorage: StorageAdapter;
  private persistTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.primaryStorage = new LocalStorageAdapter();
    this.fallbackStorage = new MemoryStorageAdapter();
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
   * Stores or updates a wallet session.
   */
  setSession(walletId: string, session: WalletSession, persist = true): void {
    const existingSession = this.sessions.get(walletId);
    const chainId = Number(session.wallet.state.networkId || 0);

    if (!this.validateWalletState(session.wallet.state)) {
      throw new WalletError('Invalid wallet state', 'storage');
    }

    const updatedSession: WalletSession = {
      id: session.id,
      createdAt: session.createdAt,
      wallet: {
        ...session.wallet,
        state: {
          networkId: session.wallet.state.networkId || '',
          address: session.wallet.state.address || '',
          sessionId: session.wallet.state.sessionId || '',
        },
        info: session.wallet.info,
      },
      chainConnections: new Map(existingSession?.chainConnections || []),
      sessionToken: this.createOrUpdateSessionToken(
        existingSession?.sessionToken,
        session.sessionToken || {},
        chainId,
      ),
      status: session.status,
      ...(session.connector && { connector: session.connector }),
      ...(session.lastConnectionError && { lastConnectionError: session.lastConnectionError }),
    };

    if (session.wallet.state.address && session.wallet.state.networkId) {
      updatedSession.chainConnections.set(chainId, {
        address: session.wallet.state.address,
        permissions: updatedSession.sessionToken.permissions,
      });
    }

    this.sessions.set(walletId, updatedSession);

    if (persist) {
      this.persistSessions();
    }
  }

  /**
   * Retrieves a stored wallet session.
   */
  getSession(walletId: string): WalletSession | undefined {
    return this.sessions.get(walletId);
  }

  /**
   * Gets all chain connections for a specific wallet.
   */
  getWalletConnections(walletId: string): Map<number, ChainConnection> | undefined {
    return this.sessions.get(walletId)?.chainConnections;
  }

  /**
   * Updates the connection status of a wallet session.
   */
  updateSessionStatus(walletId: string, status: ConnectionStatus, error?: Error): void {
    const session = this.sessions.get(walletId);
    if (!session) {
      throw new WalletError(`No session found for wallet ${walletId}`, 'client');
    }

    session.status = status;
    if (error) {
      session.lastConnectionError = error;
    }

    this.sessions.set(walletId, session);
    this.persistSessions();
  }

  /**
   * Removes a wallet session from storage.
   */
  removeSession(walletId: string): void {
    this.sessions.delete(walletId);
    this.persistSessions();
  }

  /**
   * Retrieves all stored wallet sessions.
   */
  getSessions(): WalletSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Removes all stored wallet sessions.
   */
  clearSessions(): void {
    this.sessions.clear();
    this.primaryStorage.remove(STORAGE_KEY);
    this.fallbackStorage.remove(FALLBACK_STORAGE_KEY);
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
   * Validates serialized session data structure.
   */
  private validateSerializedSession(data: unknown): data is SerializedSession {
    const session = data as SerializedSession;
    return !!(
      session?.id &&
      session?.wallet?.info?.id &&
      session?.wallet?.info?.connector &&
      session?.wallet?.state?.networkId &&
      session?.wallet?.state?.address &&
      session?.wallet?.state?.sessionId &&
      session?.sessionToken &&
      Array.isArray(session?.chainConnections) &&
      session?.createdAt &&
      typeof session.status === 'string'
    );
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
   * Persists all valid sessions to storage.
   */
  private persistSessions(): void {
    if (this.persistTimeout) {
      clearTimeout(this.persistTimeout);
    }

    this.persistTimeout = setTimeout(async () => {
      let attempt = 0;
      let lastError: Error | null = null;

      while (attempt < MAX_RETRIES) {
        try {
          if (this.sessions.size === 0) {
            this.primaryStorage.remove(STORAGE_KEY);
            this.fallbackStorage.remove(FALLBACK_STORAGE_KEY);
            return;
          }

          const serializedSessions = Array.from(this.sessions.entries())
            .map(([, session]) => ({
              id: session.id,
              createdAt: session.createdAt,
              walletInfo: session.wallet.info,
              wallet: session.wallet,
              chainConnections: Array.from(session.chainConnections.entries()),
              sessionToken: session.sessionToken,
              status: session.status,
              ...(session.lastConnectionError && { lastConnectionError: session.lastConnectionError }),
            }))
            .filter(this.validateSerializedSession);

          if (serializedSessions.length > 0) {
            const sessionsJson = JSON.stringify(serializedSessions);
            try {
              this.primaryStorage.set(STORAGE_KEY, sessionsJson);
              return;
            } catch (primaryError) {
              console.warn('[SessionManager] Primary storage failed, using fallback:', primaryError);
              this.fallbackStorage.set(FALLBACK_STORAGE_KEY, sessionsJson);
              return;
            }
          }

          this.primaryStorage.remove(STORAGE_KEY);
          this.fallbackStorage.remove(FALLBACK_STORAGE_KEY);
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
        'Failed to persist sessions after multiple attempts',
        'storage',
        lastError || undefined,
      );
    }, PERSIST_DEBOUNCE_DELAY);
  }

  /**
   * Restores sessions from storage.
   */
  private async restoreSessions(): Promise<void> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < MAX_RETRIES) {
      try {
        let stored = this.primaryStorage.get(STORAGE_KEY);
        let usingFallback = false;

        if (!stored) {
          stored = this.fallbackStorage.get(FALLBACK_STORAGE_KEY);
          usingFallback = true;
        }

        if (!stored) {
          return;
        }

        let parsedData: unknown;
        try {
          parsedData = JSON.parse(stored);
          if (!Array.isArray(parsedData) || !parsedData.every(this.validateSerializedSession)) {
            throw new Error('Invalid data format');
          }
        } catch (err) {
          if (!usingFallback) {
            stored = this.fallbackStorage.get(FALLBACK_STORAGE_KEY);
            if (stored) {
              try {
                parsedData = JSON.parse(stored);
                if (!Array.isArray(parsedData) || !parsedData.every(this.validateSerializedSession)) {
                  throw new Error('Invalid fallback data format');
                }
              } catch {
                this.clearSessions();
                return;
              }
            } else {
              return;
            }
          } else {
            return;
          }
        }

        let restoredCount = 0;
        for (const data of parsedData as SerializedSession[]) {
          try {
            const connector = await this.createConnectorFromInfo(data.walletInfo);

            const session: WalletSession = {
              id: data.id,
              createdAt: data.createdAt,
              wallet: data.wallet,
              chainConnections: new Map(data.chainConnections),
              sessionToken: data.sessionToken,
              status: ConnectionStatus.Resuming,
              ...(connector && { connector }),
              ...(data.lastConnectionError && { lastConnectionError: data.lastConnectionError }),
            };

            this.sessions.set(session.id, session);
            restoredCount++;
          } catch (err) {
            console.warn('[SessionManager] Failed to restore session:', data.id, err);
          }
        }

        if (restoredCount === 0) {
          this.clearSessions();
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
