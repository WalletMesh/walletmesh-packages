/**
 * Types for wallet preference service
 */

/**
 * Wallet preference configuration for a specific wallet
 */
export interface WalletPreference {
  /** Auto-connect to this wallet on startup */
  autoConnect?: boolean;
  /** Last connection timestamp */
  lastConnected?: number;
  /** Total connection count */
  connectionCount?: number;
  /** Custom user settings */
  userSettings?: Record<string, unknown>;
}

/**
 * Map of wallet preferences by wallet ID
 */
export interface WalletPreferences {
  [walletId: string]: WalletPreference;
}

/**
 * Wallet history entry for tracking usage
 */
export interface WalletHistoryEntry {
  /** Wallet ID */
  walletId: string;
  /** Wallet metadata if available */
  wallet?: {
    id: string;
    name: string;
    icon?: string;
    chains?: string[];
  };
  /** Last used timestamp */
  lastUsed: number;
  /** Total usage count */
  usageCount: number;
}

/**
 * Configuration options for WalletPreferenceService
 */
export interface WalletPreferenceServiceConfig {
  /** Maximum history entries to keep (default: 5) */
  maxHistoryEntries?: number;
  /** Enable localStorage persistence (default: true) */
  enablePersistence?: boolean;
  /** Storage key prefix (default: 'walletmesh') */
  storageKeyPrefix?: string;
  /** Enable auto-connect feature (default: true) */
  enableAutoConnect?: boolean;
}

/**
 * Storage statistics for preferences service
 */
export interface WalletPreferenceStats {
  /** Number of wallets with preferences */
  preferencesCount: number;
  /** Number of entries in history */
  historyCount: number;
  /** Wallet IDs with auto-connect enabled */
  autoConnectWallets: string[];
  /** Total usage count across all wallets */
  totalUsage: number;
}

/**
 * Preference update options
 */
export interface PreferenceUpdateOptions {
  /** Whether to save to storage immediately */
  immediate?: boolean;
  /** Whether to update timestamp */
  updateTimestamp?: boolean;
}

/**
 * History filter options
 */
export interface HistoryFilterOptions {
  /** Maximum number of entries to return */
  limit?: number;
  /** Only return entries after this timestamp */
  since?: number;
  /** Only return entries for these wallet IDs */
  walletIds?: string[];
}
