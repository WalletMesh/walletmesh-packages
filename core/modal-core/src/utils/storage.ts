import type { WalletClientState } from '../types/client.js';

/**
 * Storage keys enum
 */
export enum StorageKey {
  STATE = 'walletState',
  CONNECTOR = 'lastConnector',
  PROVIDER = 'lastProvider',
}

/**
 * Storage configuration interface
 */
export interface StorageConfig {
  /** Key prefix for all storage items */
  prefix?: string;
}

/**
 * Storage utility class for managing wallet connection state
 */
export class WalletStorage {
  private readonly prefix: string;

  constructor(config: StorageConfig = {}) {
    this.prefix = config.prefix ?? 'walletmesh_';
  }

  /**
   * Get full storage key with prefix
   */
  private getKey(key: StorageKey): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Save wallet state to storage
   */
  saveState(state: Partial<WalletClientState>): void {
    try {
      const key = this.getKey(StorageKey.STATE);
      const existingState = this.getState() ?? {};
      const newState = { ...existingState, ...state };
      localStorage.setItem(key, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save wallet state:', error);
    }
  }

  /**
   * Get wallet state from storage
   */
  getState(): Partial<WalletClientState> | null {
    try {
      const key = this.getKey(StorageKey.STATE);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get wallet state:', error);
      return null;
    }
  }

  /**
   * Save last used connector ID
   */
  saveLastConnector(connectorId: string): void {
    try {
      const key = this.getKey(StorageKey.CONNECTOR);
      localStorage.setItem(key, connectorId);
    } catch (error) {
      console.error('Failed to save last connector:', error);
    }
  }

  /**
   * Get last used connector ID
   */
  getLastConnector(): string | null {
    try {
      const key = this.getKey(StorageKey.CONNECTOR);
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get last connector:', error);
      return null;
    }
  }

  /**
   * Save last used provider interface
   */
  saveLastProvider(providerType: string): void {
    try {
      const key = this.getKey(StorageKey.PROVIDER);
      localStorage.setItem(key, providerType);
    } catch (error) {
      console.error('Failed to save last provider:', error);
    }
  }

  /**
   * Get last used provider interface
   */
  getLastProvider(): string | null {
    try {
      const key = this.getKey(StorageKey.PROVIDER);
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get last provider:', error);
      return null;
    }
  }

  /**
   * Clear all stored wallet data
   */
  clearAll(): void {
    try {
      for (const key of Object.values(StorageKey)) {
        const fullKey = this.getKey(key);
        localStorage.removeItem(fullKey);
      }
    } catch (error) {
      console.error('Failed to clear wallet storage:', error);
    }
  }
}
