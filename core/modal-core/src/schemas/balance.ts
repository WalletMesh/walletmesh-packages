/**
 * @fileoverview Balance service input validation schemas
 */

import { z } from 'zod';
import { caip2Schema } from './caip2.js';
import { chainTypeSchema } from './wallet.js';
import { evmAddressSchema, solanaAddressSchema, aztecAddressSchema } from './transactions.js';

// ============================================================================
// ADDRESS VALIDATION SCHEMAS
// ============================================================================

/**
 * Generic blockchain address validation that checks based on chain type context
 */
export const blockchainAddressSchema = z.string().min(1, 'Address cannot be empty');

/**
 * Address with chain type for validation
 */
export const typedAddressSchema = z
  .object({
    address: z.string(),
    chainType: chainTypeSchema,
  })
  .superRefine((data, ctx) => {
    switch (data.chainType) {
      case 'evm': {
        const evmResult = evmAddressSchema.safeParse(data.address);
        if (!evmResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid EVM address format',
            path: ['address'],
          });
        }
        break;
      }
      case 'solana': {
        const solanaResult = solanaAddressSchema.safeParse(data.address);
        if (!solanaResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid Solana address format',
            path: ['address'],
          });
        }
        break;
      }
      case 'aztec': {
        const aztecResult = aztecAddressSchema.safeParse(data.address);
        if (!aztecResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid Aztec address format',
            path: ['address'],
          });
        }
        break;
      }
    }
  });

// ============================================================================
// TOKEN INFORMATION SCHEMAS
// ============================================================================

/**
 * Token information for balance queries
 */
export const tokenInfoSchema = z.object({
  /** Token contract address */
  address: z.string().min(1, 'Token address is required'),
  /** Token symbol (e.g., 'USDC', 'DAI') */
  symbol: z.string().min(1).max(20).optional(),
  /** Token decimals (e.g., 18 for most ERC20 tokens) */
  decimals: z.number().int().min(0).max(255).optional(),
  /** Token name */
  name: z.string().optional(),
  /** Token logo URI */
  logoURI: z.string().url().optional(),
});

/**
 * Extended token information with validation by chain type
 */
export const chainTokenInfoSchema = z
  .object({
    /** Token contract address */
    address: z.string().min(1, 'Token address is required'),
    /** Chain type for validation */
    chainType: chainTypeSchema,
    /** Token symbol */
    symbol: z.string().min(1).max(20).optional(),
    /** Token decimals */
    decimals: z.number().int().min(0).max(255).optional(),
    /** Token name */
    name: z.string().optional(),
    /** Token logo URI */
    logoURI: z.string().url().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate token address format based on chain type
    switch (data.chainType) {
      case 'evm': {
        const evmResult = evmAddressSchema.safeParse(data.address);
        if (!evmResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid EVM token address format',
            path: ['address'],
          });
        }
        break;
      }
      case 'solana': {
        const solanaResult = solanaAddressSchema.safeParse(data.address);
        if (!solanaResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid Solana token address format',
            path: ['address'],
          });
        }
        break;
      }
      // Aztec tokens may have different address formats
    }
  });

// ============================================================================
// BALANCE QUERY SCHEMAS
// ============================================================================

/**
 * Balance query options
 */
export const balanceQueryOptionsSchema = z.object({
  /** Whether to use cached balance if available */
  useCache: z.boolean().optional(),
  /** Time in milliseconds before cached data is considered stale */
  staleTime: z.number().int().min(0).optional(),
  /** Time in milliseconds before cached data is removed */
  cacheTime: z.number().int().min(0).optional(),
  /** Polling interval in milliseconds for balance updates */
  pollingInterval: z.number().int().min(1000).optional(),
  /** Whether to include metadata like token info */
  includeMetadata: z.boolean().optional(),
});

/**
 * Native balance query parameters
 */
export const getNativeBalanceParamsSchema = z.object({
  /** Blockchain provider instance */
  provider: z.any(), // Provider validation handled by JSON-RPC
  /** Address to query balance for */
  address: blockchainAddressSchema,
  /** Chain ID */
  chainId: caip2Schema,
  /** Query options */
  options: balanceQueryOptionsSchema.optional(),
});

/**
 * Token balance query parameters
 */
export const getTokenBalanceParamsSchema = z.object({
  /** Blockchain provider instance */
  provider: z.any(), // Provider validation handled by JSON-RPC
  /** Address to query balance for */
  address: blockchainAddressSchema,
  /** Chain ID */
  chainId: caip2Schema,
  /** Token information */
  token: tokenInfoSchema,
  /** Query options */
  options: balanceQueryOptionsSchema.optional(),
});

/**
 * Multi-token balance query parameters
 */
export const getMultiTokenBalanceParamsSchema = z.object({
  /** Blockchain provider instance */
  provider: z.any(),
  /** Address to query balance for */
  address: blockchainAddressSchema,
  /** Chain ID */
  chainId: caip2Schema,
  /** Array of tokens to query */
  tokens: z.array(tokenInfoSchema).min(1).max(100),
  /** Query options */
  options: balanceQueryOptionsSchema.optional(),
});

// ============================================================================
// BALANCE RESULT SCHEMAS
// ============================================================================

/**
 * Balance information result
 */
export const balanceInfoSchema = z.object({
  /** Raw balance value as string */
  value: z.string(),
  /** Formatted balance for display */
  formatted: z.string(),
  /** Currency symbol */
  symbol: z.string(),
  /** Number of decimals */
  decimals: z.number().int().min(0).max(255),
  /** USD value if available */
  usdValue: z.number().optional(),
  /** Price per unit in USD */
  usdPrice: z.number().optional(),
  /** Timestamp when balance was fetched */
  timestamp: z.number().optional(),
});

/**
 * Token balance with metadata
 */
export const tokenBalanceInfoSchema = balanceInfoSchema.extend({
  /** Token information */
  token: tokenInfoSchema,
  /** Whether token is verified */
  isVerified: z.boolean().optional(),
  /** Token type (e.g., 'ERC20', 'SPL') */
  tokenType: z.string().optional(),
});

/**
 * Multi-token balance result
 */
export const multiTokenBalanceResultSchema = z.object({
  /** Native balance */
  native: balanceInfoSchema,
  /** Token balances */
  tokens: z.array(tokenBalanceInfoSchema),
  /** Total USD value across all balances */
  totalUsdValue: z.number().optional(),
  /** Timestamp when balances were fetched */
  timestamp: z.number(),
});

// ============================================================================
// BALANCE SERVICE CONFIGURATION
// ============================================================================

/**
 * Balance service configuration
 */
export const balanceServiceConfigSchema = z.object({
  /** Default cache time in milliseconds */
  defaultCacheTime: z.number().int().min(0).max(3600000).default(300000), // 5 minutes
  /** Default stale time in milliseconds */
  defaultStaleTime: z.number().int().min(0).max(600000).default(30000), // 30 seconds
  /** Enable automatic balance polling */
  enablePolling: z.boolean().default(false),
  /** Default polling interval in milliseconds */
  defaultPollingInterval: z.number().int().min(5000).max(300000).default(30000),
  /** Maximum concurrent balance queries */
  maxConcurrentQueries: z.number().int().min(1).max(50).default(10),
  /** Enable USD price fetching */
  enableUsdPrices: z.boolean().default(false),
  /** Price provider configuration */
  priceProvider: z
    .object({
      /** Price provider type */
      type: z.enum(['coingecko', 'coinmarketcap', 'custom']).optional(),
      /** API key if required */
      apiKey: z.string().optional(),
      /** Custom endpoint URL */
      endpoint: z.string().url().optional(),
    })
    .optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Address types
export type BlockchainAddress = z.infer<typeof blockchainAddressSchema>;
export type TypedAddress = z.infer<typeof typedAddressSchema>;

// Token types
export type TokenInfo = z.infer<typeof tokenInfoSchema>;
export type ChainTokenInfo = z.infer<typeof chainTokenInfoSchema>;

// Query parameter types
export type BalanceQueryOptions = z.infer<typeof balanceQueryOptionsSchema>;
export type GetNativeBalanceParams = z.infer<typeof getNativeBalanceParamsSchema>;
export type GetTokenBalanceParams = z.infer<typeof getTokenBalanceParamsSchema>;
export type GetMultiTokenBalanceParams = z.infer<typeof getMultiTokenBalanceParamsSchema>;

// Result types
export type BalanceInfo = z.infer<typeof balanceInfoSchema>;
export type TokenBalanceInfo = z.infer<typeof tokenBalanceInfoSchema>;
export type MultiTokenBalanceResult = z.infer<typeof multiTokenBalanceResultSchema>;

// Configuration types
export type BalanceServiceConfig = z.infer<typeof balanceServiceConfigSchema>;
