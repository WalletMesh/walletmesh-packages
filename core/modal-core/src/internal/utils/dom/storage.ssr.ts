/**
 * Storage utilities for persisting client state with SSR safety
 *
 * Provides utilities for persisting wallet connection state and user preferences
 * using browser localStorage with proper error handling and key management.
 *
 * @module utils/dom/storage
 * @internal
 */

import { safeLocalStorage } from '../../../api/utils/environment.js';
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
  /**
   * Logger instance for debugging
   * @type {Logger}
   * @optional
   */
  logger?: Logger;
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
 * Persistent storage utility for managing wallet connection state and preferences
 *
 * Uses browser localStorage to persist wallet selections, connection details,
 * and user preferences across sessions. Provides error handling and key management.
 * SSR-safe implementation that gracefully handles server environments.
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

  /**
   * Logger instance
   * @type {Logger | undefined}
   * @private
   * @readonly
   */
  private readonly logger?: Logger;

  /**
   * Create a new WalletStorage instance
   * @param {StorageConfig} [config={}] - Storage configuration options
   */
  constructor(config: StorageConfig = {}) {
    this.prefix = config.prefix ?? 'walletmesh_';
    if (config.logger) {
      this.logger = config.logger;
    }
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
      safeLocalStorage.setItem(key, JSON.stringify(newState));
      this.logger?.debug('Wallet state saved', { key, state: newState });
    } catch (error) {
      this.logger?.error('Failed to save wallet state:', error);
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
      const data = safeLocalStorage.getItem(key);
      if (!data) return null;

      const state = JSON.parse(data);
      this.logger?.debug('Wallet state retrieved', { key, state });
      return state;
    } catch (error) {
      this.logger?.error('Failed to get wallet state:', error);
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
      safeLocalStorage.setItem(key, connectorId);
      this.logger?.debug('Last connector saved', { key, connectorId });
    } catch (error) {
      this.logger?.error('Failed to save last connector:', error);
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
      const connectorId = safeLocalStorage.getItem(key);
      this.logger?.debug('Last connector retrieved', { key, connectorId });
      return connectorId;
    } catch (error) {
      this.logger?.error('Failed to get last connector:', error);
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
      safeLocalStorage.setItem(key, providerType);
      this.logger?.debug('Last provider saved', { key, providerType });
    } catch (error) {
      this.logger?.error('Failed to save last provider:', error);
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
      const providerType = safeLocalStorage.getItem(key);
      this.logger?.debug('Last provider retrieved', { key, providerType });
      return providerType;
    } catch (error) {
      this.logger?.error('Failed to get last provider:', error);
      return null;
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
        safeLocalStorage.removeItem(fullKey);
      }
      this.logger?.debug('All wallet storage cleared');
    } catch (error) {
      this.logger?.error('Failed to clear wallet storage:', error);
    }
  }

  /**
   * Check if storage is available
   * @returns {boolean} True if storage operations will work
   * @public
   */
  isAvailable(): boolean {
    // Test if we can actually store and retrieve
    try {
      const testKey = `${this.prefix}_test`;
      safeLocalStorage.setItem(testKey, 'test');
      const value = safeLocalStorage.getItem(testKey);
      safeLocalStorage.removeItem(testKey);
      return value === 'test';
    } catch {
      return false;
    }
  }
}
