import type { WalletInfo, ConnectedWallet, WalletState } from '../../types.js';

/**
 * Interface for blockchain-specific wallet adapters.
 *
 * Adapters serve as intermediaries between the dApp and blockchain wallets,
 * providing a standardized interface for:
 * - Establishing wallet connections
 * - Managing wallet state
 * - Handling protocol-specific messaging
 * - Providing chain-specific providers
 *
 * Each adapter implementation handles the complexities of a specific
 * blockchain protocol or wallet type, abstracting them behind this
 * common interface.
 *
 * @remarks
 * Adapters are responsible for:
 * - Protocol-specific message handling
 * - State synchronization
 * - Connection lifecycle management
 * - Provider instantiation and management
 *
 * @example
 * ```typescript
 * class MyWalletAdapter implements Adapter {
 *   async connect(walletInfo: WalletInfo, existingState?: WalletState): Promise<ConnectedWallet> {
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
   * Establishes a new connection with the wallet.
   *
   * @param walletInfo - Configuration and metadata for the wallet to connect
   * @returns Promise resolving to the connected wallet details
   * @throws {WalletConnectionError} If connection fails or is rejected
   *
   * @remarks
   * The connection process typically involves:
   * 1. Initializing the protocol-specific connection
   * 2. Requesting user approval
   * 3. Setting up message handlers
   * 4. Establishing the initial wallet state
   *
   * @example
   * ```typescript
   * const wallet = await adapter.connect({
   *   id: 'my-wallet',
   *   name: 'My Wallet',
   *   icon: 'wallet-icon.png',
   *   transport: { type: 'postMessage' },
   *   adapter: { type: AdapterType.WalletMeshAztec }
   * });
   * ```
   */
  connect(walletInfo: WalletInfo): Promise<ConnectedWallet>;

  /**
   * Resumes an existing wallet connection using saved state.
   *
   * @param walletInfo - Configuration for the wallet to reconnect
   * @param savedState - Previously saved session state to restore
   * @returns Promise resolving to the reconnected wallet details
   * @throws {WalletError} If session restoration fails
   *
   * @remarks
   * Session restoration involves:
   * 1. Validating the saved state
   * 2. Reestablishing the connection
   * 3. Verifying the wallet state matches
   * 4. Reinitializing message handlers
   *
   * @example
   * ```typescript
   * const wallet = await adapter.resume(
   *   walletInfo,
   *   {
   *     chain: 'aztec:testnet',
   *     address: '0x...',
   *     sessionId: 'abc123'
   *   }
   * );
   * ```
   */
  resume(walletInfo: WalletInfo, savedState: WalletState): Promise<ConnectedWallet>;

  /**
   * Terminates the wallet connection and cleans up resources.
   *
   * @returns Promise that resolves when disconnection is complete
   * @throws {WalletDisconnectionError} If disconnection fails
   *
   * @remarks
   * Cleanup tasks typically include:
   * - Closing protocol-specific connections
   * - Removing message handlers
   * - Clearing cached state
   * - Releasing system resources
   */
  disconnect(): Promise<void>;

  /**
   * Retrieves the chain-specific provider instance
   * @returns {Promise<unknown>} Chain-specific provider (e.g., Web3Provider)
   * @throws {Error} If provider is unavailable
   */
  getProvider(): Promise<unknown>;

  /**
   * Processes incoming messages from the transport layer.
   *
   * @param data - Message payload from the transport
   *
   * @remarks
   * Message handling includes:
   * - Validating message format and content
   * - Updating internal state based on messages
   * - Triggering appropriate callbacks/events
   * - Error handling for malformed messages
   *
   * @example
   * ```typescript
   * adapter.handleMessage({
   *   type: 'STATE_UPDATE',
   *   payload: {
   *     chainId: 'aztec:testnet',
   *     address: '0x...'
   *   }
   * });
   * ```
   */
  handleMessage(data: unknown): void;
}

/**
 * Base configuration options for wallet adapters.
 *
 * Provides common configuration options that all adapters support,
 * while allowing for extension with protocol-specific options.
 *
 * @property {string} [chainId] - Target blockchain network identifier
 * @property {Record<string, unknown>} [key: string] - Additional chain-specific options
 *
 * @example
 * ```typescript
 * const baseOptions: BaseAdapterOptions = {
 *   chainId: 'ethereum:1',
 *   customOption: 'value'
 * };
 * ```
 */
export interface BaseAdapterOptions {
  /** Chain ID for the adapter */
  chainId?: string;
  /** Additional chain-specific options */
  [key: string]: unknown | undefined;
}

/**
 * Enumeration of supported wallet adapter implementations.
 *
 * Each value represents a specific adapter implementation that
 * handles different wallet protocols or implementations.
 *
 * @enum {string}
 * @property {string} WalletMeshAztec - WalletMesh adapter for Aztec protocol
 * @property {string} ObsidionAztec - Obsidion wallet adapter for Aztec protocol
 *
 * @example
 * ```typescript
 * const adapterConfig = {
 *   type: AdapterType.WalletMeshAztec,
 *   options: {
 *     chainId: 'aztec:testnet',
 *     rpcUrl: 'https://testnet.aztec.network'
 *   }
 * };
 * ```
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
 * Type helper to extract the correct options type for a given adapter type.
 *
 * Uses TypeScript's conditional types to map adapter types to their
 * corresponding options interfaces.
 *
 * @template T - Type extending AdapterType
 * @typedef {T extends AdapterType.WalletMeshAztec ? AztecAdapterOptions : BaseAdapterOptions} AdapterOptionsForType
 *
 * @example
 * ```typescript
 * // Type will be AztecAdapterOptions
 * type Options = AdapterOptionsForType<AdapterType.WalletMeshAztec>;
 *
 * // Type will be BaseAdapterOptions
 * type BaseOptions = AdapterOptionsForType<AdapterType.ObsidionAztec>;
 * ```
 */
export type AdapterOptionsForType<T extends AdapterType> = T extends AdapterType.WalletMeshAztec
  ? AztecAdapterOptions
  : BaseAdapterOptions;
