/**
 * @packageDocumentation
 * Manages wallet sessions and connections
 */

import { WalletError, ErrorCode } from '../index.js';
import { ConnectionStatus } from '../types.js';
import type { 
  SessionStore,
  WalletSession,
  ChainConnection
} from '../types.js';
import { defaultSessionStore } from '../store/sessionStore.js';
import { defaultSessionStoreAdapter } from '../store/sessionStoreAdapter.js';

/**
 * Manages wallet sessions
 */
export class SessionManager {
  /** Session cache */
  private sessionCache = new Map<string, WalletSession>();

  constructor(private readonly store: SessionStore = defaultSessionStoreAdapter(defaultSessionStore)) {}

  /**
   * Initializes session manager
   */
  async initialize(): Promise<void> {
    try {
      // Restore sessions from store
      await this.restoreSessions();
    } catch (error) {
      throw new WalletError('Failed to initialize session manager', ErrorCode.STORAGE);
    }
  }

  /**
   * Restores wallet sessions
   */
  private async restoreSessions(): Promise<void> {
    try {
      const allSessions = await this.store.getSessions();
      for (const session of allSessions) {
        if (!session?.wallet?.state) continue;

        // Maintain connected status if wallet is connected
        const status = session.wallet.connected 
          ? ConnectionStatus.CONNECTED 
          : ConnectionStatus.CONNECTING;
        
        const restoredSession: WalletSession = {
          ...session,
          status
        };

        this.sessionCache.set(restoredSession.id, restoredSession);
        this.store.setSession(restoredSession.id, restoredSession);
      }
    } catch (error) {
      throw new WalletError('Failed to restore sessions', ErrorCode.STORAGE);
    }
  }

  /**
   * Gets session for wallet ID
   */
  getSession(walletId: string): WalletSession | undefined {
    // Always check store first to ensure latest state
    const session = this.store.getSession(walletId);
    
    // If session not in store, clear cache and return undefined
    if (!session) {
      this.sessionCache.delete(walletId);
      return undefined;
    }

    // Create a shallow clone and freeze it to prevent mutations
    const sessionClone = Object.freeze({ ...session });

    this.sessionCache.set(walletId, sessionClone);
    return sessionClone;
  }

  /**
   * Gets all active sessions
   */
  getSessions(): WalletSession[] {
    return Array.from(this.sessionCache.values());
  }

  /**
   * Updates session status
   */
  updateSessionStatus(walletId: string, status: ConnectionStatus): void {
    const session = this.getSession(walletId);
    if (!session) return;

    // Update wallet connected state based on status
    const connected = status === ConnectionStatus.CONNECTED;
    const updatedSession = {
      ...session,
      status,
      wallet: {
        ...session.wallet,
        connected
      }
    };

    // Update store first, then cache
    this.store.setSession(walletId, updatedSession);
    this.sessionCache.set(walletId, updatedSession);
  }

  /**
   * Gets chain connections for wallet
   */
  getChainConnections(walletId: string): Record<number, ChainConnection> | undefined {
    return this.getSession(walletId)?.chains;
  }

  /**
   * Sets a session
   */
  setSession(id: string, session: WalletSession): void {
    const sessionClone = { ...session }; // Clone to prevent mutation
    // Store first, then cache
    this.store.setSession(id, sessionClone);
    this.sessionCache.set(id, sessionClone);
  }

  /**
   * Removes a session
   */
  removeSession(id: string): void {
    // Always attempt removal from both to ensure consistency
    this.store.removeSession(id);
    this.sessionCache.delete(id);
  }
}
