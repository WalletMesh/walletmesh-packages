/**
 * Smart connect options with chain-specific sub-options
 *
 * Provides a unified interface for connection options while supporting
 * chain-specific configuration through discriminated unions and optional
 * sub-options for different blockchain types.
 */

import type { ChainType, SupportedChain } from '../../core/types.js';

/**
 * EVM-specific connection options
 */
export interface EVMConnectOptions {
  /** Specific EVM chain ID to connect to */
  chainId?: string;

  /** List of required chains for the application */
  requiredChains?: string[];

  /** Connect silently without user interaction if possible */
  silent?: boolean;

  /** Whether to request additional permissions */
  requestPermissions?: boolean;

  /** EIP-1193 specific options */
  eip1193?: {
    /** Methods the dApp wants to access */
    methods?: string[];
    /** Events the dApp wants to subscribe to */
    events?: string[];
  };
}

/**
 * Solana-specific connection options
 */
export interface SolanaConnectOptions {
  /** Solana cluster to connect to */
  cluster?: 'mainnet-beta' | 'testnet' | 'devnet';

  /** Only connect if the wallet is already trusted */
  onlyIfTrusted?: boolean;

  /** Whether to include read-only accounts */
  includeReadOnly?: boolean;
}

/**
 * Aztec-specific connection options
 */
export interface AztecConnectOptions {
  /** Whether to use sandbox environment */
  sandbox?: boolean;

  /** PXE (Private eXecution Environment) URL */
  pxeUrl?: string;

  /** Aztec network configuration */
  network?: {
    chainId?: number;
    rpcUrl?: string;
  };

  /** Whether to sync on connection */
  autoSync?: boolean;

  /** Sync timeout in milliseconds */
  syncTimeout?: number;

  /** Required permissions for the dApp */
  permissions?: string[];
}

/**
 * Base connection options common to all chains
 */
export interface BaseConnectOptions {
  /** Connection timeout in milliseconds */
  timeout?: number;

  /** Whether to connect silently without modal if possible */
  silent?: boolean;

  /** Whether to auto-retry on failure */
  autoRetry?: boolean;

  /** Number of retry attempts */
  retryAttempts?: number;

  /** Custom metadata to attach to the connection */
  metadata?: Record<string, unknown>;
}

/**
 * Discriminated union for chain-specific connect options
 */
export type ChainSpecificConnectOptions =
  | {
      chainType: ChainType;
      chain?: SupportedChain;
      evmOptions?: EVMConnectOptions;
    }
  | {
      chainType: ChainType;
      chain?: SupportedChain;
      solanaOptions?: SolanaConnectOptions;
    }
  | {
      chainType: ChainType;
      chain?: SupportedChain;
      aztecOptions?: AztecConnectOptions;
    };

/**
 * Connect options supporting all chain types
 *
 * This interface provides a single entry point for connection options
 * while maintaining type safety for chain-specific configurations.
 */
export interface ConnectOptions extends BaseConnectOptions {
  /** Optional wallet ID to connect to directly */
  walletId?: string;

  /** Chain type and ID to connect to */
  chainType?: ChainType;
  chain?: SupportedChain;

  /** EVM-specific options */
  evmOptions?: EVMConnectOptions;

  /** Solana-specific options */
  solanaOptions?: SolanaConnectOptions;

  /** Aztec-specific options */
  aztecOptions?: AztecConnectOptions;
}

/**
 * Strongly-typed connect options for specific chain types
 */
export interface TypedConnectOptions<T extends ChainType> extends BaseConnectOptions {
  /** The specific chain type */
  chainType: T;

  /** Chain ID within the specified chain type */
  chain?: SupportedChain;

  /** Wallet to connect to */
  walletId?: string;

  /** Chain-specific options */
  chainOptions: T extends ChainType
    ? T extends ChainType
      ? EVMConnectOptions | SolanaConnectOptions | AztecConnectOptions
      : never
    : never;
}

/**
 * Options for switching chains
 */
export interface SwitchChainOptions {
  /** Target chain */
  chain: SupportedChain;

  /** Target chain type */
  chainType: ChainType;

  /** Whether to add the chain if it doesn't exist */
  addChainIfNotExists?: boolean;

  /** Chain-specific switch options */
  evmOptions?: {
    /** Chain configuration to add if needed */
    chainConfig?: {
      chainName: string;
      rpcUrls: string[];
      nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
      };
      blockExplorerUrls?: string[];
    };
  };

  solanaOptions?: {
    /** Solana cluster name */
    cluster?: 'mainnet-beta' | 'testnet' | 'devnet';
  };

  aztecOptions?: {
    /** Network configuration */
    network?: {
      rpcUrl: string;
      pxeUrl?: string;
      sandbox?: boolean;
    };
  };
}

/**
 * Connection result with chain-specific provider
 */
export interface TypedConnectionResult<T extends ChainType> {
  /** Connected address */
  address: string;

  /** All connected addresses */
  addresses: string[];

  /** Chain */
  chain: SupportedChain;

  /** Chain type */
  chainType: T;

  /** Wallet ID */
  walletId: string;

  /** Chain-specific provider */
  provider: T extends ChainType ? import('./chainProviders.js').ChainProvider : unknown;
}

/**
 * Helper type to extract connect options for a specific chain type
 */
export type GetConnectOptions<T extends ChainType> = TypedConnectOptions<T>;

/**
 * Helper type to validate connect options at compile time
 */
export type ValidateConnectOptions<T extends ConnectOptions> = T['chainType'] extends ChainType
  ? T['evmOptions'] extends EVMConnectOptions | undefined
    ? T['solanaOptions'] extends SolanaConnectOptions | undefined
      ? T['aztecOptions'] extends AztecConnectOptions | undefined
        ? T
        : never
      : never
    : never
  : T;

/**
 * Factory function type for creating chain-specific connect options
 */
export interface ConnectOptionsFactory {
  /** Create EVM connect options */
  createEVM(options: EVMConnectOptions & BaseConnectOptions): TypedConnectOptions<ChainType>;

  /** Create Solana connect options */
  createSolana(options: SolanaConnectOptions & BaseConnectOptions): TypedConnectOptions<ChainType>;

  /** Create Aztec connect options */
  createAztec(options: AztecConnectOptions & BaseConnectOptions): TypedConnectOptions<ChainType>;
}
