/**
 * Storage utilities for persisting client state
 *
 * Provides utilities for persisting wallet connection state and user preferences
 * using browser localStorage with proper error handling and key management.
 *
 * @module utils/dom/storage
 * @internal
 */

import type { Logger } from '../../core/logger/logger.js';

/**
 * Storage keys used by the WalletStorage utility
 *
 * Defines the storage keys used to persist different types of wallet data.
 * These keys are combined with a configurable prefix to avoid conflicts.
 *
 * @enum {string}
 * @internal
 */
export enum StorageKey {
  /**
   * Key for storing complete wallet state
   * @type {string}
   */
  State = 'walletState',
  /**
   * Key for storing last used connector ID
   * @type {string}
   */
  Connector = 'lastConnector',
  /**
   * Key for storing last used provider type
   * @type {string}
   */
  Provider = 'lastProvider',
  /**
   * Key for storing adapter session data
   * @type {string}
   */
  AdapterSession = 'adapterSession',
}

/**
 * Configuration options for the WalletStorage utility
 *
 * @interface StorageConfig
 * @internal
 */
export interface StorageConfig {
  /**
   * Key prefix for all storage items
   * @type {string}
   * @optional
   */
  prefix?: string;
}

/**
 * Type for wallet client state properties
 *
 * @interface WalletStorageState
 * @internal
 */
export interface WalletStorageState {
  /**
   * Dynamic properties for storage
   * @type {any}
   */
  // biome-ignore lint/suspicious/noExplicitAny: Storage can hold any serializable value
  [key: string]: any;
}

/**
 * Adapter session data for persistence
 *
 * @interface AdapterSessionData
 * @internal
 */
export interface AdapterSessionData {
  /** Unique wallet adapter ID */
  walletId: string;
  /** Session ID from the wallet */
  sessionId: string;
  /** Current chain ID */
  chainId: string;
  /** Chain type (EVM, Solana, Aztec) */
  chainType: string;
  /** Connected accounts */
  accounts: string[];
  /** Active account address */
  activeAccount: string;
  /** Session metadata */
  metadata: {
    /** When the session was created */
    connectedAt: number;
    /** When the session was last active */
    lastActiveAt: number;
    /** Wallet-specific metadata */
    walletMetadata?: Record<string, unknown>;
    /** Provider-specific metadata */
    providerMetadata?: Record<string, unknown>;
  };
  /** Transport configuration for reconnection */
  transportConfig?: {
    /** Transport type */
    type: string;
    /** Transport-specific configuration */
    config: Record<string, unknown>;
  };
}

/**
 * Persistent storage utility for managing wallet connection state and preferences
 *
 * Uses browser localStorage to persist wallet selections, connection details,
 * and user preferences across sessions. Provides error handling and key management.
 *
 * @class WalletStorage
 * @internal
 */
export class WalletStorage {
  /**
   * Storage key prefix
   * @type {string}
   * @private
   * @readonly
   */
  private readonly prefix: string;
  private readonly logger: Logger;

  /**
   * Create a new WalletStorage instance
   * @param {StorageConfig} [config={}] - Storage configuration options
   * @param {Logger} logger - Logger instance for debugging
   */
  constructor(config: StorageConfig, logger: Logger) {
    this.prefix = config.prefix ?? 'walletmesh_';
    this.logger = logger;
  }

  /**
   * Creates a full storage key by combining the prefix with a base key
   * @param {StorageKey} key - Base storage key
   * @returns {string} Prefixed storage key
   * @private
   */
  private getKey(key: StorageKey): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Saves wallet state to local storage
   * @param {Partial<WalletStorageState>} state - Partial wallet state to save
   * @public
   */
  saveState(state: Partial<WalletStorageState>): void {
    try {
      const key = this.getKey(StorageKey.State);
      const existingState = this.getState() ?? {};
      const newState = { ...existingState, ...state };
      localStorage.setItem(key, JSON.stringify(newState));
    } catch (error) {
      this.logger.error('Failed to save wallet state:', error);
    }
  }

  /**
   * Retrieves saved wallet state from local storage
   * @returns {Partial<WalletStorageState> | null} The saved wallet state or null if not found
   * @public
   */
  getState(): Partial<WalletStorageState> | null {
    try {
      const key = this.getKey(StorageKey.State);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error('Failed to get wallet state:', error);
      return null;
    }
  }

  /**
   * Saves the ID of the last used wallet connector
   * @param {string} connectorId - ID of the connector to save
   * @public
   */
  saveLastConnector(connectorId: string): void {
    try {
      const key = this.getKey(StorageKey.Connector);
      localStorage.setItem(key, connectorId);
    } catch (error) {
      this.logger.error('Failed to save last connector:', error);
    }
  }

  /**
   * Retrieves the ID of the last used wallet connector
   * @returns {string | null} The last used connector ID or null if not found
   * @public
   */
  getLastConnector(): string | null {
    try {
      const key = this.getKey(StorageKey.Connector);
      return localStorage.getItem(key);
    } catch (error) {
      this.logger.error('Failed to get last connector:', error);
      return null;
    }
  }

  /**
   * Saves the type of the last used provider interface
   * @param {string} providerType - Provider interface type to save
   * @public
   */
  saveLastProvider(providerType: string): void {
    try {
      const key = this.getKey(StorageKey.Provider);
      localStorage.setItem(key, providerType);
    } catch (error) {
      this.logger.error('Failed to save last provider:', error);
    }
  }

  /**
   * Retrieves the type of the last used provider interface
   * @returns {string | null} The last used provider type or null if not found
   * @public
   */
  getLastProvider(): string | null {
    try {
      const key = this.getKey(StorageKey.Provider);
      return localStorage.getItem(key);
    } catch (error) {
      this.logger.error('Failed to get last provider:', error);
      return null;
    }
  }

  /**
   * Saves adapter session data for persistence across page refreshes
   * @param {string} walletId - ID of the wallet adapter
   * @param {AdapterSessionData} sessionData - Session data to persist
   * @public
   */
  saveAdapterSession(walletId: string, sessionData: AdapterSessionData): void {
    try {
      const key = this.getKey(StorageKey.AdapterSession);
      const sessions = this.getAllAdapterSessions();
      sessions[walletId] = {
        ...sessionData,
        metadata: {
          ...sessionData.metadata,
          lastActiveAt: Date.now(),
        },
      };
      localStorage.setItem(key, JSON.stringify(sessions));
      this.logger.debug('Saved adapter session', { walletId, sessionId: sessionData.sessionId });
    } catch (error) {
      this.logger.error('Failed to save adapter session:', error);
    }
  }

  /**
   * Retrieves saved adapter session data for a specific wallet
   * @param {string} walletId - ID of the wallet adapter
   * @returns {AdapterSessionData | null} The saved session data or null if not found
   * @public
   */
  getAdapterSession(walletId: string): AdapterSessionData | null {
    try {
      const sessions = this.getAllAdapterSessions();
      const session = sessions[walletId];
      if (session) {
        // Check if session is not too old (24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const age = Date.now() - (session.metadata.lastActiveAt || 0);
        if (age > maxAge) {
          this.logger.debug('Adapter session expired', { walletId, age });
          this.clearAdapterSession(walletId);
          return null;
        }
        return session;
      }
      return null;
    } catch (error) {
      this.logger.error('Failed to get adapter session:', error);
      return null;
    }
  }

  /**
   * Retrieves all saved adapter sessions
   * @returns {Record<string, AdapterSessionData>} Map of wallet IDs to session data
   * @private
   */
  private getAllAdapterSessions(): Record<string, AdapterSessionData> {
    try {
      const key = this.getKey(StorageKey.AdapterSession);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      this.logger.error('Failed to get all adapter sessions:', error);
      return {};
    }
  }

  /**
   * Clears saved adapter session data for a specific wallet
   * @param {string} walletId - ID of the wallet adapter
   * @public
   */
  clearAdapterSession(walletId: string): void {
    try {
      const sessions = this.getAllAdapterSessions();
      if (walletId in sessions) {
        delete sessions[walletId];
        const key = this.getKey(StorageKey.AdapterSession);
        if (Object.keys(sessions).length > 0) {
          localStorage.setItem(key, JSON.stringify(sessions));
        } else {
          localStorage.removeItem(key);
        }
        this.logger.debug('Cleared adapter session', { walletId });
      }
    } catch (error) {
      this.logger.error('Failed to clear adapter session:', error);
    }
  }

  /**
   * Updates the last active time for an adapter session
   * @param {string} walletId - ID of the wallet adapter
   * @public
   */
  touchAdapterSession(walletId: string): void {
    try {
      const session = this.getAdapterSession(walletId);
      if (session) {
        session.metadata.lastActiveAt = Date.now();
        this.saveAdapterSession(walletId, session);
      }
    } catch (error) {
      this.logger.error('Failed to touch adapter session:', error);
    }
  }

  /**
   * Clears all stored wallet data from local storage
   * @public
   */
  clearAll(): void {
    try {
      for (const key of Object.values(StorageKey)) {
        const fullKey = this.getKey(key);
        localStorage.removeItem(fullKey);
      }
    } catch (error) {
      this.logger.error('Failed to clear wallet storage:', error);
    }
  }
}
