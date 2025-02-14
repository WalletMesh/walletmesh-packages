import type { WalletSession } from './types.js';
import { ConnectionStatus, type ConnectedWallet } from '../../types.js';
import { WalletError } from './types.js';
import type { TransportConfig } from '../transports/types.js';
import type { ConnectorConfig } from '../connectors/types.js';

const STORAGE_KEY = 'walletmesh_wallet_session';

/**
 * Manages wallet sessions and their persistence in local storage.
 *
 * Handles the lifecycle of wallet sessions including:
 * - Session creation and updates
 * - State persistence
 * - Session restoration
 * - Validation of session data
 *
 * @remarks
 * Sessions are stored in localStorage under the key 'walletmesh_wallet_session'.
 * Each session contains wallet information, connection status, and configuration data.
 *
 * @example
 * ```typescript
 * const sessionManager = new SessionManager();
 *
 * // Create/update a session
 * sessionManager.setSession(walletId, session, true);
 *
 * // Retrieve a session
 * const session = sessionManager.getSession(walletId);
 * ```
 */
export class SessionManager {
  private sessions = new Map<string, WalletSession>();

  constructor() {
    this.restoreSessions();
  }

  /**
   * Creates a new session or updates an existing one.
   *
   * @param walletId - Unique identifier for the wallet
   * @param session - Session data to store
   * @param persist - Whether to persist the session to localStorage
   * @throws {WalletError} If the wallet state is invalid
   *
   * @remarks
   * When updating a session, it creates a deep copy of the session data
   * and validates the wallet state before storage.
   *
   * @example
   * ```typescript
   * sessionManager.setSession(walletId, {
   *   wallet: connectedWallet,
   *   status: ConnectionStatus.Connected,
   *   transportConfig: config,
   *   connectorConfig: config
   * }, true);
   * ```
   */
  setSession(walletId: string, session: WalletSession, persist = true): void {
    // Validate the wallet state before storing
    if (!this.validateWalletState(session.wallet.state)) {
      throw new WalletError('Invalid wallet state', 'storage');
    }

    // Create a deep copy of the session with state
    const updatedSession: WalletSession = {
      ...session,
      wallet: {
        ...session.wallet,
        state: {
          ...(session.wallet.state.chain && { chain: session.wallet.state.chain }),
          ...(session.wallet.state.address && { address: session.wallet.state.address }),
          ...(session.wallet.state.sessionId && { sessionId: session.wallet.state.sessionId }),
        },
        info: session.wallet.info,
      },
    };

    this.sessions.set(walletId, updatedSession);
    console.log('[SessionManager] Updated session state:', {
      id: walletId,
      state: updatedSession.wallet.state,
    });

    if (persist) {
      this.persistSessions();
    }
  }

  /**
   * Retrieves a session for a specific wallet.
   *
   * @param walletId - Unique identifier for the wallet
   * @returns The wallet session if found, undefined otherwise
   *
   * @example
   * ```typescript
   * const session = sessionManager.getSession(walletId);
   * if (session) {
   *   console.log('Wallet state:', session.wallet.state);
   * }
   * ```
   */
  getSession(walletId: string): WalletSession | undefined {
    return this.sessions.get(walletId);
  }

  /**
   * Updates the connection status of a session.
   *
   * @param walletId - Unique identifier for the wallet
   * @param status - New connection status
   * @param error - Optional error that caused the status change
   * @throws {WalletError} If no session exists for the wallet
   *
   * @remarks
   * This method persists the updated status to storage.
   *
   * @example
   * ```typescript
   * // Update status on disconnection
   * sessionManager.updateSessionStatus(
   *   walletId,
   *   ConnectionStatus.Disconnected,
   *   new Error('Connection lost')
   * );
   * ```
   */
  updateSessionStatus(walletId: string, status: ConnectionStatus, error?: Error): void {
    const session = this.sessions.get(walletId);
    if (!session) {
      throw new WalletError(`No session found for wallet ${walletId}`, 'client');
    }

    session.status = status;
    if (error) {
      session.lastError = error;
    }

    this.sessions.set(walletId, session);
    this.persistSessions();
  }

  /**
   * Removes a session from memory and storage.
   *
   * @param walletId - Unique identifier for the wallet to remove
   *
   * @example
   * ```typescript
   * // Clean up on wallet disconnection
   * sessionManager.removeSession(walletId);
   * ```
   */
  removeSession(walletId: string): void {
    this.sessions.delete(walletId);
    this.persistSessions();
  }

  /**
   * Returns an array of all stored sessions.
   *
   * @returns Array of wallet sessions
   *
   * @example
   * ```typescript
   * const sessions = sessionManager.getSessions();
   * console.log('Active sessions:', sessions.length);
   * ```
   */
  getSessions(): WalletSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Removes all sessions from memory and storage.
   *
   * @remarks
   * This is a destructive operation that cannot be undone.
   * Use with caution as it will remove all wallet connections.
   *
   * @example
   * ```typescript
   * // Reset all connections
   * sessionManager.clearSessions();
   * ```
   */
  clearSessions(): void {
    this.sessions.clear();
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Validates session data structure and required fields.
   *
   * @param session - Session data to validate
   * @returns True if the session data is valid, false otherwise
   *
   * @internal
   * This method checks for required fields including:
   * - Wallet ID and info
   * - State fields (address, sessionId, chain)
   * - Transport and connector configurations
   */
  private validateSessionData(session: Partial<StoredSession>): boolean {
    // Required session fields
    const hasValidStructure = !!(
      session?.id &&
      session?.wallet?.info?.id &&
      session?.wallet?.state?.address &&
      session?.wallet?.state?.sessionId &&
      session?.wallet?.state?.chain &&
      session?.transportConfig &&
      session?.connectorConfig
    );

    if (!hasValidStructure) {
      console.warn('[SessionManager] Invalid session structure:', {
        hasId: !!session?.id,
        hasWalletInfo: !!session?.wallet?.info?.id,
        hasAddress: !!session?.wallet?.state?.address,
        hasSessionId: !!session?.wallet?.state?.sessionId,
        hasChain: !!session?.wallet?.state?.chain,
        hasTransport: !!session?.transportConfig,
        hasConnector: !!session?.connectorConfig,
      });
      return false;
    }

    return true;
  }

  /**
   * Validates that a wallet state contains all required fields.
   *
   * @param state - Wallet state to validate
   * @returns True if the state contains all required fields, false otherwise
   *
   * @internal
   * Required fields:
   * - chain: The blockchain network identifier
   * - address: The wallet's blockchain address
   * - sessionId: Unique session identifier
   */
  private validateWalletState(
    state: Partial<{
      chain: string;
      address: string;
      sessionId: string;
    }>,
  ): boolean {
    const isValid = !!(state?.chain && state?.address && state?.sessionId);
    if (!isValid) {
      console.warn('[SessionManager] Invalid wallet state:', {
        hasChain: !!state?.chain,
        hasAddress: !!state?.address,
        hasSessionId: !!state?.sessionId,
      });
    }
    return isValid;
  }

  /**
   * Persists valid sessions to localStorage.
   *
   * @internal
   * This method:
   * - Filters out invalid sessions
   * - Serializes session data
   * - Handles storage errors
   * - Cleans up storage if no valid sessions exist
   *
   * @throws {WalletError} If persistence fails
   */
  private persistSessions(): void {
    try {
      // If there are no sessions, explicitly remove the storage item
      if (this.sessions.size === 0) {
        localStorage.removeItem(STORAGE_KEY);
        console.log('[SessionManager] Cleared sessions from localStorage');
        return;
      }

      const serializedSessions = Array.from(this.sessions.entries())
        .map(
          ([id, session]): StoredSession => ({
            id,
            wallet: session.wallet,
            status: session.status,
            timestamp: Date.now(),
            transportConfig: session.transportConfig || session.wallet.info.transport,
            connectorConfig: session.connectorConfig || session.wallet.info.connector,
          }),
        )
        .filter((session) => this.validateSessionData(session));

      // Only persist if we have valid sessions
      if (serializedSessions.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedSessions));
        console.log('[SessionManager] Persisted sessions:', serializedSessions.length);
      } else {
        // If no valid sessions remain after filtering, remove from storage
        localStorage.removeItem(STORAGE_KEY);
        console.log('[SessionManager] No valid sessions to persist, cleared localStorage');
      }
    } catch (error) {
      console.error('[SessionManager] Failed to persist sessions:', error);
      throw new WalletError('Failed to persist sessions', 'storage', error as Error);
    }
  }

  /**
   * Attempts to restore sessions from localStorage.
   *
   * @internal
   * This method:
   * - Loads stored session data
   * - Validates each session independently
   * - Handles parsing errors gracefully
   * - Sets restored sessions to Resuming status
   * - Cleans up invalid storage data
   */
  private restoreSessions(): void {
    try {
      console.log('[SessionManager] Attempting to restore sessions');
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        console.log('[SessionManager] No stored sessions found');
        return;
      }

      let parsedData: StoredSession[];
      try {
        parsedData = JSON.parse(stored);
        if (!Array.isArray(parsedData)) {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.warn('[SessionManager] Failed to parse stored sessions:', err);
        return;
      }

      // Process each session independently
      for (const session of parsedData) {
        try {
          // Only validate the structure, don't expire sessions
          if (!this.validateSessionData(session)) {
            console.warn('[SessionManager] Skipping invalid session:', session.id);
            continue;
          }

          const restoredSession: WalletSession = {
            wallet: session.wallet,
            status: ConnectionStatus.Resuming,
            transportConfig: session.transportConfig,
            connectorConfig: session.connectorConfig,
          };

          this.sessions.set(session.id, restoredSession);
          console.log('[SessionManager] Restored session:', {
            id: session.id,
            state: session.wallet.state,
          });
        } catch (err) {
          // Don't let one bad session prevent others from being restored
          console.warn('[SessionManager] Failed to restore session:', session.id, err);
        }
      }

      // Only clear storage if we didn't restore any sessions
      if (this.sessions.size === 0) {
        console.log('[SessionManager] No valid sessions could be restored');
        localStorage.removeItem(STORAGE_KEY);
      } else {
        console.log('[SessionManager] Successfully restored', this.sessions.size, 'sessions');
      }
    } catch (error) {
      console.error('[SessionManager] Session restoration failed:', error);
      // Don't clear storage on general errors
    }
  }
}

/**
 * Represents a session as stored in localStorage
 *
 * @internal
 * This interface defines the shape of serialized session data
 */
interface StoredSession {
  id: string;
  wallet: ConnectedWallet;
  status: ConnectionStatus;
  timestamp: number;
  transportConfig: TransportConfig;
  connectorConfig: ConnectorConfig;
}
