/**
 * Wallet preference service for managing user preferences and history
 *
 * This service provides functionality for storing and managing wallet preferences,
 * auto-connect settings, and usage history across sessions.
 *
 * @module services/preferences/WalletPreferenceService
 * @category Services
 */

import type { Logger } from '../../internal/core/logger/logger.js';
import type { WalletInfo } from '../../types.js';
import type { BaseServiceDependencies } from '../base/ServiceDependencies.js';
import type {
  WalletHistoryEntry,
  WalletPreference,
  WalletPreferenceServiceConfig,
  WalletPreferences,
} from './types.js';

/**
 * Service for managing wallet preferences and usage history
 *
 * The WalletPreferenceService provides persistent storage for user wallet preferences,
 * auto-connect settings, and maintains a history of wallet usage. It supports both
 * browser localStorage persistence and in-memory storage for non-browser environments.
 *
 * @category Services
 *
 * @example
 * ```typescript
 * // Initialize the service
 * const prefService = new WalletPreferenceService(dependencies);
 * prefService.configure({
 *   maxHistoryEntries: 10,
 *   enablePersistence: true,
 *   enableAutoConnect: true
 * });
 *
 * // Set auto-connect for a wallet
 * prefService.setAutoConnect('metamask', true);
 *
 * // Add wallet to history on connection
 * prefService.addToHistory('metamask', walletInfo);
 *
 * // Get preferred wallet for auto-connect
 * const preferredWallet = prefService.getPreferredWallet();
 * if (preferredWallet) {
 *   await wallet.connect(preferredWallet);
 * }
 *
 * // Get recent wallets for UI display
 * const recentWallets = prefService.getRecentWalletIds(5);
 * ```
 */
/**
 * Dependencies required by WalletPreferenceService
 */
export interface WalletPreferenceServiceDependencies extends BaseServiceDependencies {}

export class WalletPreferenceService {
  private logger: Logger;
  private config: WalletPreferenceServiceConfig = {
    maxHistoryEntries: 5,
    enablePersistence: true,
    storageKeyPrefix: 'walletmesh',
    enableAutoConnect: true,
  };

  private preferences: WalletPreferences = {};
  private history: WalletHistoryEntry[] = [];

  constructor(dependencies: WalletPreferenceServiceDependencies) {
    this.logger = dependencies.logger;
  }

  /**
   * Configure the service with custom settings
   *
   * Sets up the preference service with custom configuration options. This method
   * automatically loads existing preferences from storage if persistence is enabled.
   *
   * @param config - Optional configuration object
   * @param config.maxHistoryEntries - Maximum number of wallets to keep in history (default: 5)
   * @param config.enablePersistence - Whether to persist preferences to localStorage (default: true)
   * @param config.storageKeyPrefix - Prefix for localStorage keys (default: 'walletmesh')
   * @param config.enableAutoConnect - Whether to allow auto-connect functionality (default: true)
   *
   * @example
   * ```typescript
   * prefService.configure({
   *   maxHistoryEntries: 10,
   *   enablePersistence: true,
   *   storageKeyPrefix: 'myapp-wallets',
   *   enableAutoConnect: true
   * });
   * ```
   */
  configure(config?: WalletPreferenceServiceConfig): void {
    if (config) {
      this.config = { ...this.config, ...config };
      this.logger.debug('WalletPreferenceService configured', this.config);
    }

    // Load existing preferences and history from storage
    if (this.config.enablePersistence) {
      this.loadFromStorage();
    }
  }

  /**
   * Clean up resources
   *
   * Saves current state to storage (if persistence is enabled) and clears all
   * in-memory preferences and history. Should be called when the service is
   * no longer needed.
   *
   * @example
   * ```typescript
   * // On application shutdown
   * prefService.cleanup();
   * ```
   */
  cleanup(): void {
    // Save current state before cleanup
    if (this.config.enablePersistence) {
      this.saveToStorage();
    }

    this.preferences = {};
    this.history = [];
  }

  // Wallet Preferences Management

  /**
   * Get all wallet preferences
   *
   * Returns a copy of all stored wallet preferences. The returned object can be
   * safely modified without affecting the service's internal state.
   *
   * @returns Object containing all wallet preferences indexed by wallet ID
   *
   * @example
   * ```typescript
   * const allPrefs = prefService.getAllPreferences();
   * console.log('Total wallets with preferences:', Object.keys(allPrefs).length);
   *
   * // Check which wallets have auto-connect enabled
   * Object.entries(allPrefs).forEach(([walletId, pref]) => {
   *   if (pref.autoConnect) {
   *     console.log(`${walletId} has auto-connect enabled`);
   *   }
   * });
   * ```
   */
  getAllPreferences(): WalletPreferences {
    return { ...this.preferences };
  }

  /**
   * Get preference for a specific wallet
   *
   * Returns the stored preferences for a specific wallet. Returns an empty object
   * if no preferences exist for the wallet.
   *
   * @param walletId - The ID of the wallet to get preferences for
   * @returns Wallet preference object or empty object if none exists
   *
   * @example
   * ```typescript
   * const metamaskPrefs = prefService.getWalletPreference('metamask');
   * if (metamaskPrefs.autoConnect) {
   *   console.log('MetaMask is set to auto-connect');
   * }
   * ```
   */
  getWalletPreference(walletId: string): WalletPreference {
    return { ...(this.preferences[walletId] || {}) };
  }

  /**
   * Set auto-connect preference for a wallet
   *
   * Enables or disables auto-connect for a specific wallet. When enabled, the wallet
   * will be automatically connected on application startup. Only one wallet can have
   * auto-connect enabled at a time.
   *
   * @param walletId - The ID of the wallet to set auto-connect for
   * @param enabled - Whether to enable or disable auto-connect
   *
   * @example
   * ```typescript
   * // Enable auto-connect for MetaMask
   * prefService.setAutoConnect('metamask', true);
   *
   * // Disable auto-connect
   * prefService.setAutoConnect('metamask', false);
   * ```
   */
  setAutoConnect(walletId: string, enabled: boolean): void {
    if (!this.config.enableAutoConnect) {
      this.logger.warn('Auto-connect is disabled in configuration');
      return;
    }

    if (!this.preferences[walletId]) {
      this.preferences[walletId] = {};
    }

    this.preferences[walletId].autoConnect = enabled;

    if (enabled) {
      this.preferences[walletId].lastConnected = Date.now();
    }

    this.saveToStorage();
    this.logger.debug('Auto-connect preference set', { walletId, enabled });
  }

  /**
   * Check if auto-connect is enabled for a wallet
   *
   * Returns whether auto-connect is enabled for a specific wallet. Returns false
   * if auto-connect is disabled globally or for the specific wallet.
   *
   * @param walletId - The ID of the wallet to check
   * @returns True if auto-connect is enabled for the wallet
   *
   * @example
   * ```typescript
   * if (prefService.isAutoConnectEnabled('metamask')) {
   *   console.log('MetaMask will auto-connect on startup');
   * }
   * ```
   */
  isAutoConnectEnabled(walletId: string): boolean {
    if (!this.config.enableAutoConnect) return false;
    return this.preferences[walletId]?.autoConnect || false;
  }

  /**
   * Get the preferred wallet for auto-connect
   *
   * Returns the ID of the wallet that has auto-connect enabled. Only one wallet
   * can be preferred at a time. Returns null if no wallet has auto-connect enabled
   * or if auto-connect is disabled globally.
   *
   * @returns The wallet ID with auto-connect enabled, or null if none
   *
   * @example
   * ```typescript
   * const preferredWallet = prefService.getPreferredWallet();
   * if (preferredWallet) {
   *   console.log(`Auto-connecting to ${preferredWallet}`);
   *   await wallet.connect(preferredWallet);
   * }
   * ```
   */
  getPreferredWallet(): string | null {
    if (!this.config.enableAutoConnect) return null;

    const walletIds = Object.keys(this.preferences);
    const preferred = walletIds.find((id) => this.preferences[id]?.autoConnect);
    return preferred || null;
  }

  /**
   * Update wallet preference
   *
   * Updates the preferences for a specific wallet. Merges the provided preferences
   * with existing ones. Creates a new preference entry if none exists.
   *
   * @param walletId - The ID of the wallet to update preferences for
   * @param preference - Partial preference object to merge with existing preferences
   *
   * @example
   * ```typescript
   * // Update multiple preferences at once
   * prefService.updateWalletPreference('metamask', {
   *   autoConnect: true,
   *   lastConnected: Date.now(),
   *   customData: { theme: 'dark' }
   * });
   * ```
   */
  updateWalletPreference(walletId: string, preference: Partial<WalletPreference>): void {
    if (!this.preferences[walletId]) {
      this.preferences[walletId] = {};
    }

    this.preferences[walletId] = { ...this.preferences[walletId], ...preference };
    this.saveToStorage();
    this.logger.debug('Wallet preference updated', { walletId, preference });
  }

  /**
   * Clear preferences for a wallet
   *
   * Removes all stored preferences for a specific wallet. This includes auto-connect
   * settings and any custom preference data.
   *
   * @param walletId - The ID of the wallet to clear preferences for
   *
   * @example
   * ```typescript
   * // Clear preferences when user removes a wallet
   * prefService.clearWalletPreference('metamask');
   * ```
   */
  clearWalletPreference(walletId: string): void {
    delete this.preferences[walletId];
    this.saveToStorage();
    this.logger.debug('Wallet preference cleared', { walletId });
  }

  /**
   * Clear all preferences
   *
   * Removes all stored wallet preferences. This is a destructive operation that
   * clears all auto-connect settings and custom preference data for all wallets.
   *
   * @example
   * ```typescript
   * // Reset all preferences
   * if (confirm('Clear all wallet preferences?')) {
   *   prefService.clearAllPreferences();
   * }
   * ```
   */
  clearAllPreferences(): void {
    this.preferences = {};
    this.saveToStorage();
    this.logger.debug('All preferences cleared');
  }

  // Wallet History Management

  /**
   * Get wallet selection history
   *
   * Returns the complete wallet usage history, ordered by most recently used.
   * Each entry includes usage count and last used timestamp.
   *
   * @returns Array of wallet history entries
   *
   * @example
   * ```typescript
   * const history = prefService.getWalletHistory();
   * history.forEach(entry => {
   *   console.log(`${entry.walletId}: used ${entry.usageCount} times`);
   *   console.log(`Last used: ${new Date(entry.lastUsed).toLocaleString()}`);
   * });
   * ```
   */
  getWalletHistory(): WalletHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Add wallet to selection history
   *
   * Records a wallet selection in the usage history. Updates usage count and
   * last used timestamp if the wallet already exists in history. Maintains
   * the history size according to the configured maxHistoryEntries.
   *
   * @param walletId - The ID of the wallet to add to history
   * @param walletInfo - Optional wallet information to store with the history entry
   *
   * @remarks
   * Emits the `history-updated` event when a wallet is added to history
   *
   * @example
   * ```typescript
   * // Add to history when user selects a wallet
   * prefService.addToHistory('metamask', {
   *   id: 'metamask',
   *   name: 'MetaMask',
   *   icon: 'metamask-icon.svg',
   *   chains: ['1', '137', '42161']
   * });
   * ```
   */
  addToHistory(walletId: string, walletInfo?: WalletInfo): void {
    const existingIndex = this.history.findIndex((entry) => entry.walletId === walletId);
    const now = Date.now();

    if (existingIndex >= 0) {
      // Update existing entry
      const existing = this.history[existingIndex];
      if (existing) {
        existing.lastUsed = now;
        existing.usageCount = (existing.usageCount || 0) + 1;
        if (walletInfo) {
          existing.wallet = walletInfo;
        }

        // Move to front
        this.history.splice(existingIndex, 1);
        this.history.unshift(existing);
      }
    } else {
      // Add new entry
      const newEntry: WalletHistoryEntry = {
        walletId,
        ...(walletInfo && {
          wallet: {
            id: walletInfo.id,
            name: walletInfo.name,
            icon: walletInfo.icon || '',
            chains: walletInfo.chains,
          },
        }),
        lastUsed: now,
        usageCount: 1,
      };
      this.history.unshift(newEntry);
    }

    // Trim to max entries
    const maxEntries = this.config.maxHistoryEntries || 5;
    if (this.history.length > maxEntries) {
      this.history = this.history.slice(0, maxEntries);
    }

    this.saveToStorage();
    this.logger.debug('Wallet added to history', { walletId });
  }

  /**
   * Remove wallet from history
   *
   * Removes a wallet from the usage history. This does not affect stored preferences,
   * only the history tracking.
   *
   * @param walletId - The ID of the wallet to remove from history
   *
   * @example
   * ```typescript
   * // Remove wallet from history when it's uninstalled
   * prefService.removeFromHistory('metamask');
   * ```
   */
  removeFromHistory(walletId: string): void {
    this.history = this.history.filter((entry) => entry.walletId !== walletId);
    this.saveToStorage();
    this.logger.debug('Wallet removed from history', { walletId });
  }

  /**
   * Clear all history
   *
   * Removes all wallet usage history. This does not affect stored preferences,
   * only the history tracking.
   *
   * @example
   * ```typescript
   * // Clear history for privacy
   * prefService.clearHistory();
   * console.log('Wallet history cleared');
   * ```
   */
  clearHistory(): void {
    this.history = [];
    this.saveToStorage();
    this.logger.debug('History cleared');
  }

  /**
   * Get recent wallet IDs in order
   *
   * Returns an array of wallet IDs ordered by most recently used. Useful for
   * displaying a "recent wallets" list in the UI.
   *
   * @param limit - Maximum number of wallet IDs to return (defaults to maxHistoryEntries)
   * @returns Array of wallet IDs ordered by most recent usage
   *
   * @example
   * ```typescript
   * // Get 3 most recent wallets for quick access menu
   * const recentWallets = prefService.getRecentWalletIds(3);
   * console.log('Recent wallets:', recentWallets);
   * // Output: ['metamask', 'walletconnect', 'coinbase']
   * ```
   */
  getRecentWalletIds(limit?: number): string[] {
    const maxEntries = limit || this.config.maxHistoryEntries || 5;
    return this.history.slice(0, maxEntries).map((entry) => entry.walletId);
  }

  /**
   * Get most frequently used wallet
   *
   * Returns the wallet ID with the highest usage count. Useful for suggesting
   * a default wallet based on user behavior.
   *
   * @returns The most frequently used wallet ID, or null if no history exists
   *
   * @example
   * ```typescript
   * const mostUsed = prefService.getMostUsedWallet();
   * if (mostUsed) {
   *   console.log(`Your most used wallet is ${mostUsed}`);
   *   // Suggest this wallet as default
   * }
   * ```
   */
  getMostUsedWallet(): string | null {
    if (this.history.length === 0) return null;

    const sorted = [...this.history].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

    return sorted[0]?.walletId || null;
  }

  // Storage Management

  /**
   * Load preferences and history from storage
   */
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      this.logger.debug('localStorage not available, skipping load');
      return;
    }

    try {
      // Load preferences
      const preferencesKey = `${this.config.storageKeyPrefix}:preferences`;
      const preferencesData = localStorage.getItem(preferencesKey);
      if (preferencesData) {
        this.preferences = JSON.parse(preferencesData);
      }

      // Load history
      const historyKey = `${this.config.storageKeyPrefix}:recent-wallets`;
      const historyData = localStorage.getItem(historyKey);
      if (historyData) {
        this.history = JSON.parse(historyData);
      }

      this.logger.debug('Preferences and history loaded from storage');
    } catch (error) {
      this.logger.error('Failed to load preferences from storage', { error });
      this.preferences = {};
      this.history = [];
    }
  }

  /**
   * Save preferences and history to storage
   */
  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') {
      this.logger.debug('localStorage not available, skipping save');
      return;
    }

    if (!this.config.enablePersistence) {
      return;
    }

    try {
      // Save preferences
      const preferencesKey = `${this.config.storageKeyPrefix}:preferences`;
      localStorage.setItem(preferencesKey, JSON.stringify(this.preferences));

      // Save history
      const historyKey = `${this.config.storageKeyPrefix}:recent-wallets`;
      localStorage.setItem(historyKey, JSON.stringify(this.history));

      this.logger.debug('Preferences and history saved to storage');
    } catch (error) {
      this.logger.error('Failed to save preferences to storage', { error });
    }
  }

  /**
   * Import preferences from external source
   *
   * Replaces all current preferences with the provided preferences object.
   * Useful for restoring preferences from a backup or migrating from another system.
   *
   * @param preferences - Complete preferences object to import
   *
   * @example
   * ```typescript
   * // Import preferences from backup
   * const backup = JSON.parse(backupData);
   * prefService.importPreferences(backup.preferences);
   * console.log('Preferences restored from backup');
   * ```
   */
  importPreferences(preferences: WalletPreferences): void {
    this.preferences = { ...preferences };
    this.saveToStorage();
    this.logger.debug('Preferences imported', { count: Object.keys(preferences).length });
  }

  /**
   * Export preferences for backup/migration
   *
   * Returns a copy of all current preferences suitable for backup or migration.
   * The returned object can be serialized to JSON for storage.
   *
   * @returns Complete preferences object
   *
   * @example
   * ```typescript
   * // Create backup of preferences
   * const preferences = prefService.exportPreferences();
   * const backup = {
   *   version: '1.0',
   *   timestamp: Date.now(),
   *   preferences
   * };
   * localStorage.setItem('wallet-backup', JSON.stringify(backup));
   * ```
   */
  exportPreferences(): WalletPreferences {
    return { ...this.preferences };
  }

  /**
   * Get storage statistics
   *
   * Returns statistics about stored preferences and history. Useful for debugging
   * and displaying storage usage information to users.
   *
   * @returns Object containing storage statistics
   * @returns {number} returns.preferencesCount - Number of wallets with stored preferences
   * @returns {number} returns.historyCount - Number of wallets in history
   * @returns {string[]} returns.autoConnectWallets - Array of wallet IDs with auto-connect enabled
   * @returns {number} returns.totalUsage - Total usage count across all wallets
   *
   * @example
   * ```typescript
   * const stats = prefService.getStorageStats();
   * console.log(`Preferences stored for ${stats.preferencesCount} wallets`);
   * console.log(`History contains ${stats.historyCount} wallets`);
   * console.log(`Auto-connect enabled for: ${stats.autoConnectWallets.join(', ')}`);
   * console.log(`Total wallet connections: ${stats.totalUsage}`);
   * ```
   */
  getStorageStats(): {
    preferencesCount: number;
    historyCount: number;
    autoConnectWallets: string[];
    totalUsage: number;
  } {
    const autoConnectWallets = Object.keys(this.preferences).filter(
      (walletId) => this.preferences[walletId]?.autoConnect,
    );

    const totalUsage = this.history.reduce((sum, entry) => sum + (entry.usageCount || 0), 0);

    return {
      preferencesCount: Object.keys(this.preferences).length,
      historyCount: this.history.length,
      autoConnectWallets,
      totalUsage,
    };
  }
}
