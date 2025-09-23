/**
 * @fileoverview Client system schemas for runtime validation
 */

import { z } from 'zod';
import { chainTypeSchema, walletInfoSchema } from './wallet.js';
import { modalChainConfigSchema, supportedChainsConfigSchema } from './chains.js';

/**
 * Base provider interface schema
 */
export const baseProviderSchema = z.object({
  /**
   * Provider request method
   */
  request: z
    .function()
    .args(
      z.object({
        method: z.string(),
        params: z.array(z.any()).optional(),
      }),
    )
    .returns(z.promise(z.any())),

  /**
   * Event listener registration
   */
  on: z.function().args(z.string(), z.function().args(z.any()).returns(z.void())).returns(z.void()),

  /**
   * Event listener removal
   */
  removeListener: z
    .function()
    .args(z.string(), z.function().args(z.any()).returns(z.void()))
    .returns(z.void()),

  /**
   * Internal event emission (optional)
   */
  _emit: z.function().args(z.string(), z.any()).returns(z.void()).optional(),

  /**
   * Internal listener retrieval (optional)
   */
  _getListeners: z
    .function()
    .args(z.void())
    .returns(z.record(z.string(), z.array(z.function())))
    .optional(),
});

/**
 * Wallet client configuration schema
 */
export const walletClientConfigSchema = z.object({
  /**
   * Application name
   */
  appName: z.string().min(1),

  /**
   * Auto-reconnect on disconnect
   */
  autoReconnect: z.boolean().optional(),

  /**
   * Persist connection across sessions
   */
  persistConnection: z.boolean().optional(),

  /**
   * Provider interface
   */
  providerInterface: z.string().optional(),

  /**
   * Connection timeout in milliseconds
   */
  timeout: z.number().int().positive().optional(),

  /**
   * Storage key prefix for persistence
   */
  storageKeyPrefix: z.string().optional(),

  /**
   * Debug mode flag
   */
  debug: z.boolean().optional(),
});

/**
 * Wallet client state schema
 */
export const walletClientStateSchema = z.object({
  /**
   * Connection status
   */
  status: z.enum(['disconnected', 'connecting', 'connected']),

  /**
   * Active connector ID
   */
  activeConnector: z.string().nullable(),

  /**
   * Active chain ID
   */
  activeChain: z.union([z.string(), z.number()]).nullable(),

  /**
   * Active provider interface
   */
  activeProviderInterface: z.string().nullable(),

  /**
   * Connected accounts
   */
  accounts: z.array(z.string()),

  /**
   * Current error if any
   */
  error: z.instanceof(Error).nullable(),
});

/**
 * Connect options schema
 */
export const connectOptionsSchema = z.object({
  /**
   * Preferred provider interface
   */
  preferredInterface: z.string().optional(),

  /**
   * Preferred chain type
   */
  chainType: chainTypeSchema.optional(),

  /**
   * Silent connection (no UI)
   */
  silent: z.boolean().optional(),

  /**
   * Maximum retry attempts
   */
  maxRetries: z.number().int().nonnegative().optional(),

  /**
   * Retry delay in milliseconds
   */
  retryDelayMs: z.number().int().positive().optional(),

  /**
   * Connection timeout in milliseconds
   */
  timeoutMs: z.number().int().positive().optional(),
});

/**
 * Client event base schema
 */
export const clientEventBaseSchema = z.object({
  type: z.enum(['connecting', 'connected', 'disconnected', 'chain_changed', 'accounts_changed', 'error']),
});

/**
 * Client connecting event schema
 */
export const clientConnectingEventSchema = clientEventBaseSchema.extend({
  type: z.literal('connecting'),
  walletId: z.string(),
});

/**
 * Client connected event schema
 */
export const clientConnectedEventSchema = clientEventBaseSchema.extend({
  type: z.literal('connected'),
  walletId: z.string(),
  accounts: z.array(z.string()),
  chainId: z.union([z.string(), z.number()]),
  chainType: chainTypeSchema,
});

/**
 * Client disconnected event schema
 */
export const clientDisconnectedEventSchema = clientEventBaseSchema.extend({
  type: z.literal('disconnected'),
  reason: z.string().optional(),
});

/**
 * Client chain changed event schema
 */
export const clientChainChangedEventSchema = clientEventBaseSchema.extend({
  type: z.literal('chain_changed'),
  chainId: z.union([z.string(), z.number()]),
  chainType: chainTypeSchema,
});

/**
 * Client accounts changed event schema
 */
export const clientAccountsChangedEventSchema = clientEventBaseSchema.extend({
  type: z.literal('accounts_changed'),
  accounts: z.array(z.string()),
});

/**
 * Client error event schema
 */
export const clientErrorEventSchema = clientEventBaseSchema.extend({
  type: z.literal('error'),
  error: z.instanceof(Error),
  code: z.union([z.string(), z.number(), z.null()]).optional(),
  context: z.string().optional(),
  retryCount: z.number().int().nonnegative().optional(),
  fatal: z.boolean().optional(),
});

/**
 * Discriminated union for all client events
 */
export const clientEventSchema = z.discriminatedUnion('type', [
  clientConnectingEventSchema,
  clientConnectedEventSchema,
  clientDisconnectedEventSchema,
  clientChainChangedEventSchema,
  clientAccountsChangedEventSchema,
  clientErrorEventSchema,
]);

/**
 * Logger configuration schema for WalletMeshClient
 */
export const walletMeshLoggerConfigSchema = z.object({
  /** Enable debug logging */
  debug: z.boolean().optional(),
  /** Custom logger prefix */
  prefix: z.string().optional(),
  /** Log level */
  level: z.enum(['debug', 'info', 'warn', 'error', 'silent']).optional(),
});

/**
 * Provider loader configuration schema
 */
export const providerLoaderConfigSchema = z.object({
  /** Preload providers on initialization */
  preloadOnInit: z.boolean().optional(),
  /** Chain types to preload */
  preloadChainTypes: z.array(chainTypeSchema).optional(),
  /** Custom provider factory functions */
  customProviders: z
    .record(
      chainTypeSchema,
      z.function().returns(
        z.promise(
          z.object({
            default: z.any(),
          }),
        ),
      ),
    )
    .optional(),
});

/**
 * Discovery configuration schema
 */
export const discoveryConfigSchema = z.object({
  /** Enable wallet discovery */
  enabled: z.boolean().optional(),
  /** Discovery timeout in milliseconds */
  timeout: z.number().int().min(1000).max(60000).optional(),
  /** Discovery scan interval */
  scanInterval: z.number().int().min(1000).max(300000).optional(),
  /** Maximum discovery retries */
  maxRetries: z.number().int().min(0).max(10).optional(),
});

/**
 * Wallet filter function schema
 */
export const walletFilterFunctionSchema = z.function().args(walletInfoSchema).returns(z.boolean());

/**
 * Wallet filter configuration schema
 */
export const walletFilterConfigSchema = z.object({
  /** Wallet display order */
  order: z.array(z.string()).optional(),
  /** Wallets to include */
  include: z.array(z.string()).optional(),
  /** Wallets to exclude */
  exclude: z.array(z.string()).optional(),
  /** Custom filter function */
  filter: walletFilterFunctionSchema.optional(),
  /** Filter by mobile support */
  mobile: z.boolean().optional(),
  /** Filter by desktop support */
  desktop: z.boolean().optional(),
  /** Filter by required features */
  features: z.array(z.string()).optional(),
});

/**
 * Extended wallet configuration schema
 */
export const extendedWalletConfigSchema = z.object({
  /** Filter configuration */
  filter: walletFilterConfigSchema.optional(),
  /** Featured wallet IDs */
  featured: z.array(z.string()).optional(),
  /** Hidden wallet IDs */
  hidden: z.array(z.string()).optional(),
});

/**
 * Comprehensive WalletMeshClient configuration schema
 */
export const walletMeshClientConfigSchema = z.object({
  /** Application name displayed to users */
  appName: z.string().min(1, 'App name is required'),
  /** Optional application description */
  appDescription: z.string().optional(),
  /** Application URL */
  appUrl: z.string().url().optional(),
  /** Application icon URL */
  appIcon: z.string().url().optional(),
  /** WalletConnect project ID */
  projectId: z.string().optional(),
  /** Supported chain configurations */
  chains: z.array(modalChainConfigSchema).optional(),
  /** Wallet configuration options */
  wallets: z
    .union([extendedWalletConfigSchema, walletFilterFunctionSchema, z.array(walletInfoSchema)])
    .optional(),
  /** Enable debug mode */
  debug: z.boolean().optional(),
  /** Logger configuration */
  logger: walletMeshLoggerConfigSchema.optional(),
  /** Provider loader configuration */
  providerLoader: providerLoaderConfigSchema.optional(),
  /** Discovery configuration */
  discovery: discoveryConfigSchema.optional(),
  /** Supported chains configuration */
  supportedChains: supportedChainsConfigSchema.optional(),
  /** Modal UI configuration */
  modal: z
    .object({
      /** Enable modal UI */
      enabled: z.boolean().optional(),
      /** Auto-close delay in milliseconds */
      autoCloseDelay: z.number().int().min(0).max(60000).optional(),
      /** Show provider selection */
      showProviderSelection: z.boolean().optional(),
      /** Persist wallet selection */
      persistWalletSelection: z.boolean().optional(),
      /** Theme configuration */
      theme: z
        .object({
          mode: z.enum(['light', 'dark', 'auto']).optional(),
          primaryColor: z.string().optional(),
        })
        .optional(),
      /** Size configuration */
      size: z
        .object({
          width: z.union([z.number(), z.string()]).optional(),
          height: z.union([z.number(), z.string()]).optional(),
        })
        .optional(),
    })
    .optional(),
  /** Storage configuration */
  storage: z
    .object({
      /** Storage key prefix */
      keyPrefix: z.string().optional(),
      /** Enable session persistence */
      persist: z.boolean().optional(),
    })
    .optional(),
  /** Security configuration */
  security: z
    .object({
      /** Session timeout in milliseconds */
      sessionTimeout: z.number().int().min(60000).max(86400000).optional(),
      /** Validate message origins */
      validateOrigin: z.boolean().optional(),
      /** Allowed origins for cross-origin communication */
      allowedOrigins: z.array(z.string().url()).optional(),
      /** Origin validation configuration */
      originValidation: z
        .object({
          enabled: z.boolean().optional(),
          allowedOrigins: z.array(z.string().url()).optional(),
        })
        .optional(),
      /** Rate limiting configuration */
      rateLimit: z
        .object({
          maxRequests: z.number().int().min(1).max(10000).optional(),
          windowMs: z.number().int().min(1000).max(3600000).optional(),
        })
        .optional(),
      /** Session security configuration */
      sessionSecurity: z
        .object({
          timeout: z.number().int().min(60000).max(86400000).optional(),
          validateOnRequest: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

// Type exports
export type BaseProvider = z.infer<typeof baseProviderSchema>;
export type WalletClientConfig = z.infer<typeof walletClientConfigSchema>;
export type WalletClientState = z.infer<typeof walletClientStateSchema>;
export type ConnectOptions = z.infer<typeof connectOptionsSchema>;
export type ClientEvent = z.infer<typeof clientEventSchema>;
export type WalletMeshLoggerConfig = z.infer<typeof walletMeshLoggerConfigSchema>;
export type ProviderLoaderConfig = z.infer<typeof providerLoaderConfigSchema>;
export type DiscoveryConfig = z.infer<typeof discoveryConfigSchema>;
export type WalletFilterFunction = z.infer<typeof walletFilterFunctionSchema>;
export type WalletFilterConfig = z.infer<typeof walletFilterConfigSchema>;
export type ExtendedWalletConfig = z.infer<typeof extendedWalletConfigSchema>;
export type WalletMeshClientConfig = z.infer<typeof walletMeshClientConfigSchema>;
