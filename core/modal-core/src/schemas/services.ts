/**
 * @fileoverview Service configuration and parameter schemas for runtime validation
 */

import { z } from 'zod';
import { caip2Schema } from './caip2.js';

// ============================================================================
// CONNECTION SERVICE SCHEMAS
// ============================================================================

/**
 * Arguments for establishing a wallet connection
 */
export const connectArgsSchema = z.object({
  /** Optional wallet identifier to connect to */
  walletId: z.string().optional(),
  /** Optional chain ID to connect with */
  chainId: caip2Schema.optional(),
});

/**
 * Extended connection options with UI controls and progress tracking
 */
export const connectOptionsSchema = connectArgsSchema.extend({
  /** Whether to show the connection modal UI */
  showModal: z.boolean().optional(),
  /** Callback function to track connection progress */
  onProgress: z.function().args(z.number(), z.string(), z.string().optional()).returns(z.void()).optional(),
  /** Connection timeout in milliseconds */
  timeout: z.number().int().min(0).max(300000).optional(),
  /** Whether to auto-retry on failure */
  autoRetry: z.boolean().optional(),
  /** Number of retry attempts */
  retryAttempts: z.number().int().min(0).max(10).optional(),
  /** Custom metadata to attach to the connection */
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Options for disconnecting a wallet connection
 */
export const disconnectOptionsSchema = z.object({
  /** Force disconnection even if there are pending transactions */
  force: z.boolean().optional(),
  /** Human-readable reason for disconnection */
  reason: z.string().optional(),
});

/**
 * Connection progress information
 */
export const connectionProgressSchema = z.object({
  /** Progress percentage (0-100) */
  progress: z.number().int().min(0).max(100),
  /** Current step description */
  step: z.string(),
  /** Optional additional details about the current step */
  details: z.string().optional(),
});

/**
 * Connection validation result
 */
export const connectionValidationSchema = z.object({
  /** Whether the connection parameters are valid */
  isValid: z.boolean(),
  /** Error message if validation failed */
  error: z.string().optional(),
  /** Additional validation details */
  details: z.record(z.any()).optional(),
});

/**
 * Connection service configuration
 */
export const connectionServiceConfigSchema = z.object({
  /** Maximum retry attempts for connection */
  maxRetryAttempts: z.number().int().min(0).max(10).default(3),
  /** Response time threshold in milliseconds */
  responseTimeThreshold: z.number().int().min(100).max(30000).default(2000),
  /** Enable auto-reconnect on disconnect */
  autoReconnect: z.boolean().default(true),
  /** Reconnect delay in milliseconds */
  reconnectDelay: z.number().int().min(1000).max(60000).default(5000),
  /** Connection timeout in milliseconds */
  connectionTimeout: z.number().int().min(5000).max(300000).default(30000),
});

// ============================================================================
// WALLET PREFERENCE SERVICE SCHEMAS
// ============================================================================

/**
 * Wallet preference configuration for a specific wallet
 */
export const walletPreferenceSchema = z.object({
  /** Auto-connect to this wallet on startup */
  autoConnect: z.boolean().optional(),
  /** Last connection timestamp */
  lastConnected: z.number().optional(),
  /** Total connection count */
  connectionCount: z.number().int().min(0).optional(),
  /** Custom user settings */
  userSettings: z.record(z.unknown()).optional(),
});

/**
 * Map of wallet preferences by wallet ID
 */
export const walletPreferencesSchema = z.record(walletPreferenceSchema);

/**
 * Configuration options for WalletPreferenceService
 */
export const walletPreferenceServiceConfigSchema = z.object({
  /** Enable localStorage persistence */
  enablePersistence: z.boolean().default(true),
  /** Storage key prefix */
  storageKeyPrefix: z.string().default('walletmesh'),
  /** Enable auto-connect feature */
  enableAutoConnect: z.boolean().default(true),
});

/**
 * Storage statistics for preferences service
 */
export const walletPreferenceStatsSchema = z.object({
  /** Number of wallets with preferences */
  preferencesCount: z.number().int().min(0),
  /** Number of entries in history */
  historyCount: z.number().int().min(0),
  /** Wallet IDs with auto-connect enabled */
  autoConnectWallets: z.array(z.string()),
  /** Total usage count across all wallets */
  totalUsage: z.number().int().min(0),
});

/**
 * Preference update options
 */
export const preferenceUpdateOptionsSchema = z.object({
  /** Whether to save to storage immediately */
  immediate: z.boolean().optional(),
  /** Whether to update timestamp */
  updateTimestamp: z.boolean().optional(),
});

/**
 * History filter options
 */
export const historyFilterOptionsSchema = z.object({
  /** Maximum number of entries to return */
  limit: z.number().int().min(1).max(100).optional(),
  /** Only return entries after this timestamp */
  since: z.number().optional(),
  /** Only return entries for these wallet IDs */
  walletIds: z.array(z.string()).optional(),
});

// ============================================================================
// UI SERVICE SCHEMAS
// ============================================================================

/**
 * Connection UI display configuration
 */
export const connectionDisplayConfigSchema = z.object({
  /** Show ENS names when available */
  showEnsNames: z.boolean().default(true),
  /** Truncate addresses for display */
  truncateAddresses: z.boolean().default(true),
  /** Address truncation length */
  addressTruncateLength: z.number().int().min(4).max(20).default(6),
  /** Show wallet icon */
  showWalletIcon: z.boolean().default(true),
  /** Show chain icon */
  showChainIcon: z.boolean().default(true),
  /** Show balance */
  showBalance: z.boolean().default(false),
});

/**
 * Connect button state
 */
export const connectButtonStateSchema = z.object({
  /** Button text */
  text: z.string(),
  /** Whether button is disabled */
  disabled: z.boolean(),
  /** Whether to show loading state */
  loading: z.boolean(),
  /** Button variant */
  variant: z.enum(['primary', 'secondary', 'ghost']).optional(),
  /** Additional CSS classes */
  className: z.string().optional(),
});

// ============================================================================
// CHAIN SERVICE SCHEMAS
// ============================================================================

/**
 * Chain validation parameters
 */
export const chainValidationParamsSchema = z.object({
  /** Chain ID to validate */
  chainId: caip2Schema,
  /** Provider to validate against */
  provider: z.any(), // Provider validation handled by JSON-RPC
  /** Validation options */
  options: z
    .object({
      /** Skip network version check */
      skipNetworkCheck: z.boolean().optional(),
      /** Allow testnet chains */
      allowTestnets: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Chain switch parameters
 */
export const chainSwitchParamsSchema = z.object({
  /** Target chain ID */
  chainId: caip2Schema,
  /** Provider to switch */
  provider: z.any(),
  /** Whether to add chain if not exists */
  addIfNotExists: z.boolean().optional(),
  /** Chain configuration for adding */
  chainConfig: z
    .object({
      chainName: z.string(),
      rpcUrls: z.array(z.string().url()),
      nativeCurrency: z.object({
        name: z.string(),
        symbol: z.string(),
        decimals: z.number().int().min(0).max(255),
      }),
      blockExplorerUrls: z.array(z.string().url()).optional(),
    })
    .optional(),
});

/**
 * Chain service configuration
 */
export const chainServiceConfigSchema = z.object({
  /** Default chain ID */
  defaultChainId: caip2Schema.optional(),
  /** Auto add unknown chains */
  autoAddChain: z.boolean().default(false),
  /** Chain validation strictness */
  chainValidation: z.enum(['strict', 'loose']).default('strict'),
  /** Maximum chain switch retries */
  maxChainSwitchRetries: z.number().int().min(0).max(5).default(3),
  /** Chain switch retry delay */
  chainSwitchRetryDelay: z.number().int().min(500).max(10000).default(1000),
});

// ============================================================================
// TRANSACTION SERVICE CONFIGURATION
// ============================================================================

/**
 * Transaction service configuration
 */
export const transactionServiceConfigSchema = z.object({
  /** Default transaction timeout in milliseconds */
  defaultTimeout: z.number().int().min(1000).max(600000).default(120000),
  /** Transaction polling interval in milliseconds */
  pollingInterval: z.number().int().min(100).max(60000).default(3000),
  /** Maximum retry attempts */
  maxRetries: z.number().int().min(0).max(10).default(3),
  /** Number of confirmations required */
  confirmationBlocks: z.number().int().min(1).max(100).default(1),
  /** Auto-track submitted transactions */
  autoTrackTransactions: z.boolean().default(true),
  /** Maximum tracked transactions */
  maxTrackedTransactions: z.number().int().min(10).max(1000).default(100),
  /** Transaction history retention in milliseconds */
  historyRetention: z.number().int().min(3600000).max(2592000000).default(86400000), // 1 hour to 30 days, default 24 hours
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Connection Service Types
export type ConnectArgs = z.infer<typeof connectArgsSchema>;
export type ConnectOptions = z.infer<typeof connectOptionsSchema>;
export type DisconnectOptions = z.infer<typeof disconnectOptionsSchema>;
export type ConnectionProgress = z.infer<typeof connectionProgressSchema>;
export type ConnectionValidation = z.infer<typeof connectionValidationSchema>;
export type ConnectionServiceConfig = z.infer<typeof connectionServiceConfigSchema>;

// Wallet Preference Service Types
export type WalletPreference = z.infer<typeof walletPreferenceSchema>;
export type WalletPreferences = z.infer<typeof walletPreferencesSchema>;
export type WalletPreferenceServiceConfig = z.infer<typeof walletPreferenceServiceConfigSchema>;
export type WalletPreferenceStats = z.infer<typeof walletPreferenceStatsSchema>;
export type PreferenceUpdateOptions = z.infer<typeof preferenceUpdateOptionsSchema>;
export type HistoryFilterOptions = z.infer<typeof historyFilterOptionsSchema>;

// UI Service Types
export type ConnectionDisplayConfig = z.infer<typeof connectionDisplayConfigSchema>;
export type ConnectButtonState = z.infer<typeof connectButtonStateSchema>;

// Chain Service Types
export type ChainValidationParams = z.infer<typeof chainValidationParamsSchema>;
export type ChainSwitchParams = z.infer<typeof chainSwitchParamsSchema>;
export type ChainServiceConfig = z.infer<typeof chainServiceConfigSchema>;

// Transaction Service Types
export type TransactionServiceConfig = z.infer<typeof transactionServiceConfigSchema>;
