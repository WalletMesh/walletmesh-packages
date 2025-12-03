/**
 * @fileoverview Connect options validation schemas
 */

import { z } from 'zod';
import { caip2Schema } from './caip2.js';
import { chainTypeSchema } from './wallet.js';
import { walletIdSchema } from './actions.js';

// ============================================================================
// CONNECTION OPTIONS SCHEMAS
// ============================================================================

/**
 * Wallet selection criteria schema
 */
export const walletSelectionSchema = z.object({
  /** Specific wallet ID to connect */
  walletId: walletIdSchema.optional(),
  /** Filter by wallet features */
  features: z.array(z.string()).optional(),
  /** Filter by supported chains */
  supportedChains: z.array(caip2Schema).optional(),
  /** Include only installed wallets */
  installedOnly: z.boolean().optional(),
});

/**
 * Connection timeout configuration
 */
export const timeoutConfigSchema = z.object({
  /** Overall connection timeout in milliseconds */
  connection: z.number().int().min(5000).max(300000).default(60000),
  /** Wallet discovery timeout */
  discovery: z.number().int().min(1000).max(30000).default(10000),
  /** Individual operation timeout */
  operation: z.number().int().min(1000).max(60000).default(30000),
});

/**
 * Retry configuration for connection attempts
 */
export const retryConfigSchema = z.object({
  /** Maximum number of retry attempts */
  maxAttempts: z.number().int().min(0).max(10).default(3),
  /** Initial delay between retries in milliseconds */
  initialDelay: z.number().int().min(100).max(10000).default(1000),
  /** Backoff multiplier for exponential retry */
  backoffMultiplier: z.number().min(1).max(5).default(2),
  /** Maximum delay between retries */
  maxDelay: z.number().int().min(1000).max(60000).default(30000),
});

/**
 * Connection progress callback parameters
 */
export const connectionProgressSchema = z.object({
  /** Current step in the connection process */
  step: z.enum([
    'discovery',
    'selecting',
    'connecting',
    'authenticating',
    'establishing',
    'finalizing',
    'complete',
    'failed',
  ]),
  /** Progress percentage (0-100) */
  progress: z.number().int().min(0).max(100),
  /** Human-readable status message */
  message: z.string(),
  /** Additional context data */
  data: z.record(z.unknown()).optional(),
});

/**
 * Base connect options schema
 */
export const baseConnectOptionsSchema = z.object({
  /** Target chain to connect on */
  chainId: caip2Schema.optional(),
  /** Chain type preference */
  chainType: chainTypeSchema.optional(),
  /** Wallet selection criteria */
  walletSelection: walletSelectionSchema.optional(),
  /** Whether to show the modal UI */
  showModal: z.boolean().default(true),
  /** Silent mode - no user interaction */
  silent: z.boolean().default(false),
  /** Auto-select if only one wallet available */
  autoSelect: z.boolean().default(true),
  /** Timeout configuration */
  timeout: timeoutConfigSchema.optional(),
  /** Retry configuration */
  retry: retryConfigSchema.optional(),
  /** Request specific permissions */
  permissions: z.array(z.string()).optional(),
  /** Connection metadata */
  metadata: z
    .object({
      /** Connection request ID for tracking */
      requestId: z.string().optional(),
      /** Source of connection request */
      source: z.string().optional(),
      /** Custom application data */
      appData: z.record(z.unknown()).optional(),
    })
    .optional(),
});

/**
 * Advanced connect options with callbacks
 */
export const advancedConnectOptionsSchema = baseConnectOptionsSchema.extend({
  /** Progress callback */
  onProgress: z.function().args(connectionProgressSchema).returns(z.void()).optional(),
  /** Wallet selection callback */
  onWalletSelect: z
    .function()
    .args(walletIdSchema)
    .returns(z.union([z.void(), z.promise(z.void())]))
    .optional(),
  /** Connection established callback */
  onConnect: z
    .function()
    .args(
      z.object({
        walletId: walletIdSchema,
        address: z.string(),
        chainId: caip2Schema,
      }),
    )
    .returns(z.void())
    .optional(),
  /** Error callback */
  onError: z
    .function()
    .args(
      z.object({
        code: z.string(),
        message: z.string(),
        walletId: walletIdSchema.optional(),
        details: z.unknown(),
      }),
    )
    .returns(z.void())
    .optional(),
  /** Cancellation callback */
  onCancel: z.function().returns(z.void()).optional(),
});

// ============================================================================
// RECONNECT OPTIONS SCHEMAS
// ============================================================================

/**
 * Reconnect options schema
 */
export const reconnectOptionsSchema = z.object({
  /** Session ID to reconnect */
  sessionId: z.string().min(1),
  /** Force reconnection even if session appears valid */
  force: z.boolean().default(false),
  /** Validate session before reconnecting */
  validateSession: z.boolean().default(true),
  /** Timeout for reconnection */
  timeout: z.number().int().min(5000).max(60000).default(30000),
  /** Whether to show UI during reconnection */
  showUI: z.boolean().default(false),
  /** Fallback to new connection if reconnect fails */
  fallbackToConnect: z.boolean().default(true),
});

// ============================================================================
// DISCONNECT OPTIONS SCHEMAS
// ============================================================================

/**
 * Disconnect options schema
 */
export const disconnectOptionsSchema = z.object({
  /** Session ID to disconnect (or current if not specified) */
  sessionId: z.string().optional(),
  /** Clear stored session data */
  clearSession: z.boolean().default(true),
  /** Notify the wallet of disconnection */
  notifyWallet: z.boolean().default(true),
  /** Reason for disconnection */
  reason: z
    .enum([
      'user_requested',
      'app_requested',
      'wallet_disconnected',
      'network_error',
      'session_expired',
      'other',
    ])
    .optional(),
  /** Additional context for disconnection */
  context: z.string().optional(),
});

// ============================================================================
// MULTI-WALLET CONNECTION SCHEMAS
// ============================================================================

/**
 * Multi-wallet connection request
 */
export const multiWalletConnectSchema = z.object({
  /** List of wallets to connect */
  wallets: z
    .array(
      z.object({
        walletId: walletIdSchema,
        chainId: caip2Schema.optional(),
        required: z.boolean().default(false),
      }),
    )
    .min(1)
    .max(10),
  /** Connection strategy */
  strategy: z
    .enum([
      'parallel', // Connect all at once
      'sequential', // Connect one by one
      'race', // First successful connection wins
    ])
    .default('parallel'),
  /** Continue on individual failures */
  continueOnError: z.boolean().default(true),
  /** Overall timeout for all connections */
  timeout: z.number().int().min(10000).max(300000).default(120000),
});

// ============================================================================
// CONNECTION STATE SCHEMAS
// ============================================================================

/**
 * Connection state query options
 */
export const connectionStateQuerySchema = z.object({
  /** Include detailed wallet information */
  includeWalletInfo: z.boolean().default(false),
  /** Include chain metadata */
  includeChainInfo: z.boolean().default(false),
  /** Include account balances */
  includeBalances: z.boolean().default(false),
  /** Include connection history */
  includeHistory: z.boolean().default(false),
  /** Filter by wallet IDs */
  walletIds: z.array(walletIdSchema).optional(),
  /** Filter by chain IDs */
  chainIds: z.array(caip2Schema).optional(),
  /** Filter by connection status */
  status: z.enum(['connected', 'connecting', 'disconnected', 'error']).optional(),
});

/**
 * Connection health check options
 */
export const connectionHealthCheckSchema = z.object({
  /** Check provider responsiveness */
  checkProvider: z.boolean().default(true),
  /** Verify account access */
  checkAccounts: z.boolean().default(true),
  /** Test signing capability */
  checkSigning: z.boolean().default(false),
  /** Timeout for health check */
  timeout: z.number().int().min(1000).max(30000).default(10000),
  /** Include detailed diagnostics */
  detailed: z.boolean().default(false),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type WalletSelection = z.infer<typeof walletSelectionSchema>;
export type TimeoutConfig = z.infer<typeof timeoutConfigSchema>;
export type RetryConfig = z.infer<typeof retryConfigSchema>;
export type ConnectionProgress = z.infer<typeof connectionProgressSchema>;
export type BaseConnectOptions = z.infer<typeof baseConnectOptionsSchema>;
export type AdvancedConnectOptions = z.infer<typeof advancedConnectOptionsSchema>;
export type ReconnectOptions = z.infer<typeof reconnectOptionsSchema>;
export type DisconnectOptions = z.infer<typeof disconnectOptionsSchema>;
export type MultiWalletConnect = z.infer<typeof multiWalletConnectSchema>;
export type ConnectionStateQuery = z.infer<typeof connectionStateQuerySchema>;
export type ConnectionHealthCheck = z.infer<typeof connectionHealthCheckSchema>;
