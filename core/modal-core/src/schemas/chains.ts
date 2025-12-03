/**
 * @fileoverview Chain configuration schemas for runtime validation
 * @module schemas/chains
 */

import { z } from 'zod';
import { chainTypeSchema } from './wallet.js';
import { caip2Schema, evmCAIP2Schema, solanaCAIP2Schema, aztecCAIP2Schema } from './caip2.js';

// ============================================================================
// CHAIN ID VALIDATION SCHEMAS
// ============================================================================

// ============================================================================
// CHAIN CONFIGURATION SCHEMAS
// ============================================================================

/**
 * Native currency configuration schema
 */
export const nativeCurrencySchema = z.object({
  /** Currency name (e.g., 'Ether', 'SOL', 'AZTEC') */
  name: z.string().min(1, 'Currency name is required'),
  /** Currency symbol (e.g., 'ETH', 'SOL', 'AZT') */
  symbol: z.string().min(1).max(10, 'Symbol must be 1-10 characters'),
  /** Number of decimals (e.g., 18 for ETH, 9 for SOL) */
  decimals: z.number().int().min(0).max(255),
});

/**
 * RPC endpoint configuration schema
 */
export const rpcEndpointSchema = z
  .object({
    /** RPC endpoint URL */
    url: z.string().url('Invalid RPC endpoint URL'),
    /** Optional API key header name */
    apiKeyHeader: z.string().optional(),
    /** Optional API key value */
    apiKey: z.string().optional(),
    /** Request timeout in milliseconds */
    timeout: z.number().int().min(1000).max(60000).optional(),
    /** Priority level for load balancing */
    priority: z.number().int().min(0).max(10).optional(),
  })
  .refine((data) => {
    // If apiKeyHeader is provided, apiKey must also be provided
    if (data.apiKeyHeader && !data.apiKey) {
      return false;
    }
    return true;
  }, 'API key is required when API key header is specified');

/**
 * Block explorer configuration schema
 */
export const blockExplorerSchema = z.object({
  /** Explorer name (e.g., 'Etherscan', 'Solscan') */
  name: z.string().min(1),
  /** Base URL for the explorer */
  url: z.string().url(),
  /** API endpoint if available */
  apiUrl: z.string().url().optional(),
  /** API key for authenticated requests */
  apiKey: z.string().optional(),
});

/**
 * EVM-specific chain configuration
 */
export const evmChainConfigSchema = z.object({
  /** Chain ID in CAIP-2 format (eip155:chainId) */
  chainId: evmCAIP2Schema,
  /** Chain type - must be 'evm' */
  chainType: z.literal('evm'),
  /** Network name */
  name: z.string().min(1),
  /** Native currency info */
  nativeCurrency: nativeCurrencySchema,
  /** RPC endpoints (primary and fallbacks) */
  rpcUrls: z.array(rpcEndpointSchema).min(1),
  /** Block explorer configuration */
  blockExplorers: z.array(blockExplorerSchema).optional(),
  /** Network icon URL */
  icon: z.string().url().optional(),
  /** Whether this is a testnet */
  testnet: z.boolean().optional(),
  /** ENS registry address if supported */
  ensAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
  /** Multicall contract address for batch operations */
  multicallAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
});

/**
 * Solana-specific chain configuration
 */
export const solanaChainConfigSchema = z.object({
  /** Chain ID in CAIP-2 format (solana:reference) */
  chainId: solanaCAIP2Schema,
  /** Chain type - must be 'solana' */
  chainType: z.literal('solana'),
  /** Network name */
  name: z.string().min(1),
  /** Native currency (always SOL) */
  nativeCurrency: nativeCurrencySchema.refine(
    (currency) => currency.symbol === 'SOL' && currency.decimals === 9,
    'Solana native currency must be SOL with 9 decimals',
  ),
  /** RPC endpoints */
  rpcUrls: z.array(rpcEndpointSchema).min(1),
  /** WebSocket endpoints for subscriptions */
  wsUrls: z.array(z.string().url().startsWith('wss://')).optional(),
  /** Block explorer configuration */
  blockExplorers: z.array(blockExplorerSchema).optional(),
  /** Network icon URL */
  icon: z.string().url().optional(),
  /** Whether this is a testnet/devnet */
  testnet: z.boolean().optional(),
  /** Commitment level for transactions */
  commitment: z.enum(['processed', 'confirmed', 'finalized']).optional(),
});

/**
 * Aztec-specific chain configuration
 */
export const aztecChainConfigSchema = z.object({
  /** Chain ID in CAIP-2 format (aztec:reference) */
  chainId: aztecCAIP2Schema,
  /** Chain type - must be 'aztec' */
  chainType: z.literal('aztec'),
  /** Network name */
  name: z.string().min(1),
  /** Native currency info */
  nativeCurrency: nativeCurrencySchema,
  /** RPC endpoints */
  rpcUrls: z.array(rpcEndpointSchema).min(1),
  /** Block explorer configuration */
  blockExplorers: z.array(blockExplorerSchema).optional(),
  /** Network icon URL */
  icon: z.string().url().optional(),
  /** Whether this is a testnet */
  testnet: z.boolean().optional(),
  /** Rollup contract address on L1 */
  rollupAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
  /** Privacy level configuration */
  privacyLevel: z.enum(['private', 'public']).optional(),
});

/**
 * Full chain configuration discriminated by chain type
 */
export const fullChainConfigSchema = z.discriminatedUnion('chainType', [
  evmChainConfigSchema,
  solanaChainConfigSchema,
  aztecChainConfigSchema,
]);

/**
 * Supported chain schema specific for modal configuration
 * Different from wallet chainConfigSchema to avoid conflicts
 */
export const modalChainConfigSchema = z.object({
  /** Chain/network identifier in CAIP-2 format */
  chainId: caip2Schema,

  /** Type of blockchain network */
  chainType: chainTypeSchema,

  /** Display name of the network */
  name: z.string(),

  /** Optional URL or data URI of the network's icon */
  icon: z.string().optional(),
});

// ============================================================================
// CHAIN VALIDATION UTILITIES
// ============================================================================

/**
 * Chain metadata validation for quick lookups
 */
export const chainMetadataSchema = z.object({
  /** Chain ID in CAIP-2 format */
  chainId: caip2Schema,
  /** Chain type */
  chainType: chainTypeSchema,
  /** Display name */
  name: z.string(),
  /** Short name/symbol */
  shortName: z.string().optional(),
  /** Chain native currency symbol */
  nativeCurrency: z.object({
    symbol: z.string(),
    decimals: z.number(),
  }),
  /** Whether this is a testnet */
  testnet: z.boolean().default(false),
});

/**
 * Chain switch request parameters
 */
export const chainSwitchParamsSchema = z.object({
  /** Target chain ID in CAIP-2 format */
  chainId: caip2Schema,
  /** Force switch even if chain is not configured */
  force: z.boolean().optional(),
  /** Show user confirmation dialog */
  showConfirmation: z.boolean().optional(),
});

/**
 * Chain validation result
 */
export const chainValidationResultSchema = z.object({
  /** Whether the chain is valid and supported */
  valid: z.boolean(),
  /** Validation errors if any */
  errors: z.array(z.string()),
  /** Warnings about the chain */
  warnings: z.array(z.string()),
  /** Suggested alternative chains in CAIP-2 format */
  suggestions: z.array(caip2Schema).optional(),
});

// ============================================================================
// COMMON CHAIN CONFIGURATIONS
// ============================================================================

/**
 * Well-known chain IDs in CAIP-2 format for validation
 */
export const wellKnownChainIds = {
  // EVM chains (eip155 namespace)
  ethereum: 'eip155:1',
  goerli: 'eip155:5',
  sepolia: 'eip155:11155111',
  polygon: 'eip155:137',
  polygonMumbai: 'eip155:80001',
  avalanche: 'eip155:43114',
  avalancheFuji: 'eip155:43113',
  arbitrum: 'eip155:42161',
  arbitrumGoerli: 'eip155:421613',
  arbitrumSepolia: 'eip155:421614',
  optimism: 'eip155:10',
  optimismGoerli: 'eip155:420',
  optimismSepolia: 'eip155:11155420',
  base: 'eip155:8453',
  baseSepolia: 'eip155:84532',
  bsc: 'eip155:56',
  bscTestnet: 'eip155:97',

  // Solana chains (solana namespace)
  solanaMainnet: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  solanaDevnet: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  solanaTestnet: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',

  // Aztec chains (aztec namespace)
  aztecMainnet: 'aztec:mainnet',
  aztecTestnet: 'aztec:testnet',
  aztecSandbox: 'aztec:31337',
} as const;

/**
 * Type-safe well-known chain ID type
 */
export type WellKnownChainId = (typeof wellKnownChainIds)[keyof typeof wellKnownChainIds];

/**
 * Chain ID validation with well-known chains
 */
export const knownChainIdSchema = z.enum([...Object.values(wellKnownChainIds)] as [string, ...string[]]);

/**
 * Supported chain schema
 * @remarks Defines the structure of a supported chain configuration
 */
export const supportedChainSchema = z.object({
  /** Chain identifier in CAIP-2 format */
  chainId: caip2Schema,

  /** Type of blockchain this chain belongs to */
  chainType: chainTypeSchema,

  /** Human-readable name of the chain */
  name: z.string(),

  /** Whether this chain is required for the dApp to function */
  required: z.boolean(),

  /** Display label for the chain (optional override of name) */
  label: z.string().optional(),

  /** List of required provider interfaces for this chain */
  interfaces: z.array(z.string()).optional(),

  /** Grouping identifier for multi-chain scenarios */
  group: z.string().optional(),

  /** Optional icon URL for the chain */
  icon: z.string().optional(),
});

/**
 * Supported chains configuration schema
 */
export const supportedChainsConfigSchema = z.object({
  /** Chains organized by technology/type */
  chainsByTech: z.record(z.array(supportedChainSchema)),

  /** Whether to allow multiple wallets per chain */
  allowMultipleWalletsPerChain: z.boolean().optional(),

  /** Whether to allow fallback chains when required chains aren't available */
  allowFallbackChains: z.boolean().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Configuration types
export type ModalChainConfig = z.infer<typeof modalChainConfigSchema>;
export type SupportedChain = z.infer<typeof supportedChainSchema>;
export type SupportedChainsConfig = z.infer<typeof supportedChainsConfigSchema>;
export type NativeCurrency = z.infer<typeof nativeCurrencySchema>;
export type RPCEndpoint = z.infer<typeof rpcEndpointSchema>;
export type BlockExplorer = z.infer<typeof blockExplorerSchema>;

// Chain-specific configuration types
export type EVMChainConfig = z.infer<typeof evmChainConfigSchema>;
export type SolanaChainConfig = z.infer<typeof solanaChainConfigSchema>;
export type AztecChainConfig = z.infer<typeof aztecChainConfigSchema>;
export type FullChainConfig = z.infer<typeof fullChainConfigSchema>;

// Utility types
export type ChainMetadata = z.infer<typeof chainMetadataSchema>;
export type ChainSwitchParams = z.infer<typeof chainSwitchParamsSchema>;
export type ChainValidationResult = z.infer<typeof chainValidationResultSchema>;
export type KnownChainId = z.infer<typeof knownChainIdSchema>;
