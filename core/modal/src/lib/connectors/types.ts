import type { WalletInfo, ConnectedWallet, WalletState } from '../../types.js';

/**
 * Interface for blockchain-specific wallet connectors.
 *
 * Connectors serve as intermediaries between the dApp and blockchain wallets,
 * providing a standardized interface for:
 * - Establishing wallet connections
 * - Managing wallet state and communication
 * - Handling protocol-specific messaging
 * - Providing chain-specific providers
 *
 * Each connector implementation handles the complexities of a specific
 * blockchain protocol or wallet type, abstracting them behind this
 * common interface.
 */
export interface Connector {
  /**
   * Establishes a new connection with the wallet.
   *
   * @param walletInfo - Configuration and metadata for the wallet to connect
   * @returns Promise resolving to the connected wallet details
   * @throws {WalletError} If connection fails or is rejected
   *
   * @remarks
   * The connection process typically involves:
   * 1. Creating and initializing transport
   * 2. Initializing the protocol-specific connection
   * 3. Requesting user approval
   * 4. Setting up message handlers
   * 5. Establishing the initial wallet state
   */
  connect(walletInfo: WalletInfo): Promise<ConnectedWallet>;

  /**
   * Resumes an existing wallet connection.
   *
   * @param walletInfo - Configuration for the wallet to reconnect
   * @param savedState - Previous session state to restore
   * @returns Promise resolving to the reconnected wallet details
   * @throws {WalletError} If session restoration fails
   *
   * @remarks
   * Session restoration involves:
   * 1. Recreating transport layer
   * 2. Validating the saved state
   * 3. Reestablishing the connection
   * 4. Verifying the wallet state matches
   */
  resume(walletInfo: WalletInfo, savedState: WalletState): Promise<ConnectedWallet>;

  /**
   * Terminates the wallet connection and cleans up resources.
   * @throws {WalletError} If disconnection fails
   *
   * @remarks
   * Cleanup tasks typically include:
   * - Closing transport connections
   * - Closing protocol-specific connections
   * - Removing message handlers
   * - Clearing cached state
   * - Releasing system resources
   */
  disconnect(): Promise<void>;

  /**
   * Processes incoming messages from the transport layer.
   * @param data - Message payload from the transport
   */
  handleMessage(data: unknown): void;

  /**
   * Gets chain-specific provider instance.
   * @returns Chain-specific provider (e.g., Web3Provider)
   * @throws {Error} If provider is unavailable
   */
  getProvider(): Promise<unknown>;
}

/**
 * Enumeration of supported wallet connector implementations.
 */
export enum ConnectorType {
  FakeAztec = 'fake_aztec',
  ObsidionAztec = 'obsidion_aztec',
}

/**
 * Configuration options specific to Aztec protocol connectors
 */
export interface AztecConnectorOptions {
  chainId?: string;
  rpcUrl?: string;
  networkId?: string;
}

/**
 * Configuration for wallet connectors.
 * Generic type T allows each connector to define its own options interface.
 */
export interface WalletConnectorConfig<T = unknown> {
  type: ConnectorType;
  options?: T;
}

// Helper type to enforce Aztec options for Aztec connectors
export type AztecConnectorConfig = WalletConnectorConfig<AztecConnectorOptions>;
