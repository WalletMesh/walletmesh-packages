import type { WalletInfo, ConnectedWallet, WalletState } from '../../types.js';

/**
 * Interface for blockchain-specific wallet connectors.
 *
 * Connectors serve as intermediaries between the dApp and blockchain wallets,
 * providing a standardized interface for:
 * - Establishing wallet connections
 * - Managing wallet state
 * - Handling protocol-specific messaging
 * - Providing chain-specific providers
 *
 * Each connector implementation handles the complexities of a specific
 * blockchain protocol or wallet type, abstracting them behind this
 * common interface.
 *
 * @remarks
 * Connectors are responsible for:
 * - Protocol-specific message handling
 * - State synchronization
 * - Connection lifecycle management
 * - Provider instantiation and management
 *
 * @example
 * ```typescript
 * class MyWalletConnector implements Connector {
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
export interface Connector {
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
   * const wallet = await connector.connect({
   *   id: 'my-wallet',
   *   name: 'My Wallet',
   *   icon: 'wallet-icon.png',
   *   transport: { type: 'postMessage' },
   *   connector: { type: ConnectorType.WalletMeshAztec }
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
   * const wallet = await connector.resume(
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
   * connector.handleMessage({
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
 * Base configuration options for wallet connectors.
 *
 * Provides common configuration options that all connectors support,
 * while allowing for extension with protocol-specific options.
 *
 * @property {string} [chainId] - Target blockchain network identifier
 * @property {Record<string, unknown>} [key: string] - Additional chain-specific options
 *
 * @example
 * ```typescript
 * const baseOptions: BaseConnectorOptions = {
 *   chainId: 'ethereum:1',
 *   customOption: 'value'
 * };
 * ```
 */
export interface BaseConnectorOptions {
  /** Chain ID for the connector */
  chainId?: string;
  /** Additional chain-specific options */
  [key: string]: unknown | undefined;
}

/**
 * Enumeration of supported wallet connector implementations.
 *
 * Each value represents a specific connector implementation that
 * handles different wallet protocols or implementations.
 *
 * @enum {string}
 * @property {string} WalletMeshAztec - WalletMesh connector for Aztec protocol
 * @property {string} ObsidionAztec - Obsidion wallet connector for Aztec protocol
 *
 * @example
 * ```typescript
 * const connectorConfig = {
 *   type: ConnectorType.WalletMeshAztec,
 *   options: {
 *     chainId: 'aztec:testnet',
 *     rpcUrl: 'https://testnet.aztec.network'
 *   }
 * };
 * ```
 */
export enum ConnectorType {
  WalletMeshAztec = 'wm_aztec',
  ObsidionAztec = 'obsidion_aztec',
}

/**
 * Configuration options specific to Aztec protocol connectors
 * @interface AztecConnectorOptions
 * @extends {BaseConnectorOptions}
 * @property {string} [rpcUrl] - Aztec network RPC endpoint URL
 * @property {string} [networkId] - Aztec network identifier
 * @example
 * ```typescript
 * const options: AztecConnectorOptions = {
 *   chainId: "aztec:testnet",
 *   rpcUrl: "https://api.aztec.network/testnet",
 *   networkId: "11155111"
 * };
 * ```
 */
export interface AztecConnectorOptions extends BaseConnectorOptions {
  rpcUrl?: string;
  networkId?: string;
}

/**
 * Base configuration for wallet connectors
 * @interface BaseConnectorConfig
 * @template T - Type of connector options extending BaseConnectorOptions
 * @property {ConnectorType} type - Type of wallet connector to use
 * @property {T} [options] - Configuration options for the connector
 */
export interface BaseConnectorConfig<T extends BaseConnectorOptions = BaseConnectorOptions> {
  type: ConnectorType;
  options?: T;
}

/**
 * Union type of all possible connector configurations
 * @typedef {BaseConnectorConfig | BaseConnectorConfig<AztecConnectorOptions>} ConnectorConfig
 */
export type ConnectorConfig = BaseConnectorConfig | BaseConnectorConfig<AztecConnectorOptions>;

/**
 * Type helper to extract the correct options type for a given connector type.
 *
 * Uses TypeScript's conditional types to map connector types to their
 * corresponding options interfaces.
 *
 * @template T - Type extending ConnectorType
 * @typedef {T extends ConnectorType.WalletMeshAztec ? AztecConnectorOptions : BaseConnectorOptions} ConnectorOptionsForType
 *
 * @example
 * ```typescript
 * // Type will be AztecConnectorOptions
 * type Options = ConnectorOptionsForType<ConnectorType.WalletMeshAztec>;
 *
 * // Type will be BaseConnectorOptions
 * type BaseOptions = ConnectorOptionsForType<ConnectorType.ObsidionAztec>;
 * ```
 */
export type ConnectorOptionsForType<T extends ConnectorType> = T extends ConnectorType.WalletMeshAztec
  ? AztecConnectorOptions
  : BaseConnectorOptions;
