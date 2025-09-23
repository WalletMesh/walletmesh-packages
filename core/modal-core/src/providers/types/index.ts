/**
 * Provider Types Export Module
 *
 * This module exports all chain-specific provider interfaces and utilities
 * for type-safe wallet integration across different blockchain networks.
 *
 * @module providers/types
 */

// ===== EVM Provider Types =====
export type {
  // Core interfaces
  EVMProvider,
  EVMProviderFactory,
  EVMProviderState,
  EVMConnectOptions,
  // EIP-1193 types
  EIP1193EventMap,
  EIP1193RequestArguments,
  EIP1193ProviderError,
  // Transaction types
  EVMTransactionRequest,
  EVMTypedData,
  // Chain management
  AddEthereumChainParameter,
  SwitchEthereumChainParameter,
  WatchAssetParams,
} from './evmProvider.js';

export {
  // Error codes
  EIP1193ErrorCode,
  // Type guards
  isEVMProvider,
  isEIP1193Error,
} from './evmProvider.js';

// ===== Solana Provider Types =====
export type {
  // Core interfaces
  SolanaProvider,
  SolanaProviderFactory,
  SolanaProviderState,
  SolanaConnectOptions,
  // Wallet standard types
  SolanaWalletEventMap,
  SolanaWalletCapabilities,
  SolanaWalletFeature,
  PublicKey,
  // Transaction types
  SolanaTransaction,
  TransactionVersion,
  TransactionSignature,
  SignAndSendTransactionOptions,
  Commitment,
  // Sign in types
  SolanaSignInInput,
  SolanaSignInOutput,
} from './SolanaProvider.js';

export {
  // Error classes
  WalletError,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletAccountError,
  WalletPublicKeyError,
  WalletNotConnectedError,
  WalletSendTransactionError,
  WalletSignTransactionError,
  WalletSignMessageError,
  // Type guards and utilities
  isSolanaProvider,
  isSolanaWalletError,
  walletSupportsFeature,
  createMockPublicKey,
} from './SolanaProvider.js';

// ===== Aztec Provider Types =====
// Note: Aztec integration uses AztecRouterProvider from @walletmesh/aztec-rpc-wallet
// We also export utilities for Aztec provider detection and error handling

export {
  // Error classes
  AztecProviderError,
  // Type guards and utilities
  isAztecProvider,
  isAztecProviderError,
  isSandboxNetwork,
} from '../aztec/utils/typeGuards.js';

// ===== Unified Provider Types =====
export type {
  // Base interfaces
  BaseWalletProvider,
  WalletProvider,
  ExtendedWalletProvider,
  // Type utilities
  ChainType,
  ProviderTypeMap,
  GetProviderForChain,
  // Common types
  CommonWalletEventMap,
  ConnectionInfo,
  ProviderMetadata,
  CommonConnectOptions,
} from './WalletProvider.js';

export {
  // Enums
  ConnectionState,
  // Error classes
  WalletProviderError,
  // State management
  ConnectionStateManager,
  // Type guards and utilities
  isWalletProvider,
  isProviderType,
  getChainType,
  hasCapability,
  createMockConnectionInfo,
} from './WalletProvider.js';

// ===== Re-export provider type mapping =====
export interface ChainProviderMap {
  evm: import('./evmProvider.js').EVMProvider;
  solana: import('./SolanaProvider.js').SolanaProvider;
  // Note: For Aztec, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
}

// ===== Provider event type mapping =====
export interface ChainEventMap {
  evm: import('./evmProvider.js').EIP1193EventMap;
  solana: import('./SolanaProvider.js').SolanaWalletEventMap;
  // Note: For Aztec events, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
}

// ===== Provider state type mapping =====
export interface ChainStateMap {
  evm: import('./evmProvider.js').EVMProviderState;
  solana: import('./SolanaProvider.js').SolanaProviderState;
  // Note: For Aztec state, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
}

// ===== Provider connect options mapping =====
export interface ChainConnectOptionsMap {
  evm: import('./evmProvider.js').EVMConnectOptions;
  solana: import('./SolanaProvider.js').SolanaConnectOptions;
  // Note: For Aztec connection, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
}

// ===== Utility type to get provider events for a chain =====
export type GetEventsForChain<T extends keyof ChainEventMap> = ChainEventMap[T];

// ===== Utility type to get provider state for a chain =====
export type GetStateForChain<T extends keyof ChainStateMap> = ChainStateMap[T];

// ===== Utility type to get connect options for a chain =====
export type GetConnectOptionsForChain<T extends keyof ChainConnectOptionsMap> = ChainConnectOptionsMap[T];

// ========================================================================
// EXPLICIT PROVIDER/INTERFACE TYPE CLARIFICATION
// ========================================================================

/**
 * Interface Specifications - Protocol Standards
 *
 * These are string identifiers that represent standardized wallet communication
 * protocols and APIs. They define HOW wallets and dApps communicate, not the
 * actual implementation objects.
 *
 * @example
 * ```typescript
 * // Interface specifications are used in chain configs
 * const chainConfig = {
 *   chainId: 'eip155:1',
 *   interfaces: ['eip-1193', 'eip-6963'] // These are interface specifications
 * };
 * ```
 */

/** EVM interface specifications - Ethereum wallet communication standards */
export type EVMInterface =
  | 'eip-1193' // Standard Ethereum Provider API
  | 'eip-6963' // Provider Discovery for EIP-1193 Providers
  | 'eip-1102' // Legacy provider request access
  | 'web3-provider'; // Legacy Web3 provider interface

/** Solana interface specifications - Solana wallet communication standards */
export type SolanaInterface =
  | 'solana-standard-wallet' // Solana Wallet Standard (latest)
  | 'solana-wallet-standard' // Alternative naming
  | 'solana-wallet-adapter'; // Wallet Adapter Protocol

/** Aztec interface specifications - Aztec wallet communication standards */
export type AztecInterface =
  | 'aztec-connect-v2' // Latest Aztec Connect protocol
  | 'aztec-wallet-api-v1' // Standard Aztec wallet API
  | 'aztec-rpc' // RPC-based interface
  | 'aztec-wallet'; // Generic Aztec wallet interface

/**
 * Provider Interface - Union of all interface specifications
 *
 * This type represents all supported wallet communication protocol standards
 * across different blockchain ecosystems.
 */
export type ProviderInterface = EVMInterface | SolanaInterface | AztecInterface;

/**
 * Provider Implementations - Runtime Objects
 *
 * These are the actual TypeScript interfaces that define the provider objects
 * that implement the wallet communication protocols. They are runtime objects
 * with methods, properties, and event emitters.
 *
 * @example
 * ```typescript
 * // Provider implementations are objects with methods
 * const provider: EVMProvider = wallet.getProvider();
 * await provider.request({ method: 'eth_accounts' });
 * ```
 */

/** Blockchain provider implementations - actual runtime provider objects */
export type BlockchainProviderImplementation =
  | import('./evmProvider.js').EVMProvider
  | import('./SolanaProvider.js').SolanaProvider;
// Note: For Aztec, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet

/**
 * Provider Implementation Mapping
 *
 * Maps interface specifications to their corresponding provider implementation types.
 * This provides type-safe resolution from protocol standards to actual provider objects.
 */
export type ProviderImplementationMap = {
  // EVM interface specifications → EVMProvider
  'eip-1193': import('./evmProvider.js').EVMProvider;
  'eip-6963': import('./evmProvider.js').EVMProvider;
  'eip-1102': import('./evmProvider.js').EVMProvider;
  'web3-provider': import('./evmProvider.js').EVMProvider;

  // Solana interface specifications → SolanaProvider
  'solana-standard-wallet': import('./SolanaProvider.js').SolanaProvider;
  'solana-wallet-standard': import('./SolanaProvider.js').SolanaProvider;
  'solana-wallet-adapter': import('./SolanaProvider.js').SolanaProvider;

  // Note: Aztec interface specifications removed - use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
};

/**
 * Chain Technology to Interface Specifications Mapping
 *
 * Maps blockchain technology types to their supported interface specifications.
 */
export type ChainInterfaceMap = {
  evm: EVMInterface;
  solana: SolanaInterface;
  aztec: AztecInterface;
};

/**
 * Utility type to get supported interface specifications for a chain technology
 */
export type GetInterfacesForChain<T extends keyof ChainInterfaceMap> = ChainInterfaceMap[T];

/**
 * Utility type to get provider implementation type from interface specification
 */
export type GetProviderForInterface<T extends keyof ProviderImplementationMap> = ProviderImplementationMap[T];

/**
 * Interface specification validation utilities
 */
export type InterfaceValidation = {
  /** Check if interface is supported for a chain type */
  isInterfaceSupported<T extends keyof ChainInterfaceMap>(
    chainType: T,
    interfaceSpec: string,
  ): interfaceSpec is ChainInterfaceMap[T];

  /** Get all supported interfaces for a chain type */
  getSupportedInterfaces<T extends keyof ChainInterfaceMap>(chainType: T): ChainInterfaceMap[T][];

  /** Get provider type that implements an interface */
  getProviderTypeForInterface<T extends ProviderInterface>(interfaceSpec: T): string;
};
