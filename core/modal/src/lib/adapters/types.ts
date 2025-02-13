import type { WalletInfo, ConnectedWallet } from '../../types.js';

/**
 * Interface for blockchain-specific wallet adapters
 * @interface Adapter
 * @description Adapters handle the communication and state management between
 * the dapp and a specific blockchain wallet implementation. They abstract away
 * the complexity of different wallet interfaces into a common API.
 *
 * @example
 * ```typescript
 * class MyWalletAdapter implements Adapter {
 *   async connect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
 *     // Implementation
 *   }
 *
 *   async disconnect(): Promise<void> {
 *     // Implementation
 *   }
 *
 *   async getProvider(): Promise<unknown> {
 *     // Implementation
 *   }
 *
 *   handleMessage(data: unknown): void {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface Adapter {
  /**
   * Establishes a connection with the wallet
   * @param {WalletInfo} walletInfo - Configuration for the wallet to connect
   * @returns {Promise<ConnectedWallet>} Information about the connected wallet
   * @throws {WalletConnectionError} If connection fails or is rejected
   */
  connect(walletInfo: WalletInfo): Promise<ConnectedWallet>;

  /**
   * Terminates the wallet connection and cleans up resources
   * @returns {Promise<void>}
   * @throws {WalletDisconnectionError} If disconnection fails
   */
  disconnect(): Promise<void>;

  /**
   * Retrieves the chain-specific provider instance
   * @returns {Promise<unknown>} Chain-specific provider (e.g., Web3Provider)
   * @throws {Error} If provider is unavailable
   */
  getProvider(): Promise<unknown>;

  /**
   * Processes incoming messages from the transport layer
   * @param {unknown} data - Message payload from the transport
   */
  handleMessage(data: unknown): void;
}

/**
 * Base configuration options for wallet adapters
 * @interface BaseAdapterOptions
 * @property {string} [chainId] - Target blockchain network identifier
 * @property {Record<string, unknown>} [key: string] - Additional chain-specific options
 */
export interface BaseAdapterOptions {
  /** Chain ID for the adapter */
  chainId?: string;
  /** Additional chain-specific options */
  [key: string]: unknown | undefined;
}

/**
 * Supported wallet adapter implementations
 * @enum {string}
 * @property {string} WalletMeshAztec - WalletMesh adapter for Aztec protocol
 * @property {string} ObsidionAztec - Obsidion wallet adapter for Aztec protocol
 */
export enum AdapterType {
  WalletMeshAztec = 'wm_aztec',
  ObsidionAztec = 'obsidion_aztec',
}

/**
 * Configuration options specific to Aztec protocol adapters
 * @interface AztecAdapterOptions
 * @extends {BaseAdapterOptions}
 * @property {string} [rpcUrl] - Aztec network RPC endpoint URL
 * @property {string} [networkId] - Aztec network identifier
 * @example
 * ```typescript
 * const options: AztecAdapterOptions = {
 *   chainId: "aztec:testnet",
 *   rpcUrl: "https://api.aztec.network/testnet",
 *   networkId: "11155111"
 * };
 * ```
 */
export interface AztecAdapterOptions extends BaseAdapterOptions {
  rpcUrl?: string;
  networkId?: string;
}

/**
 * Base configuration for wallet adapters
 * @interface BaseAdapterConfig
 * @template T - Type of adapter options extending BaseAdapterOptions
 * @property {AdapterType} type - Type of wallet adapter to use
 * @property {T} [options] - Configuration options for the adapter
 */
export interface BaseAdapterConfig<T extends BaseAdapterOptions = BaseAdapterOptions> {
  type: AdapterType;
  options?: T;
}

/**
 * Union type of all possible adapter configurations
 * @typedef {BaseAdapterConfig | BaseAdapterConfig<AztecAdapterOptions>} AdapterConfig
 */
export type AdapterConfig = BaseAdapterConfig | BaseAdapterConfig<AztecAdapterOptions>;

/**
 * Type helper to extract the correct options type for a given adapter type
 * @template T - Type extending AdapterType
 * @typedef {T extends AdapterType.WalletMeshAztec ? AztecAdapterOptions : BaseAdapterOptions} AdapterOptionsForType
 */
export type AdapterOptionsForType<T extends AdapterType> = T extends AdapterType.WalletMeshAztec
  ? AztecAdapterOptions
  : BaseAdapterOptions;
