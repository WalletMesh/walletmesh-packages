/**
 * @packageDocumentation
 *
 * @packageDocumentation
 * Core type definitions for the WalletMesh client module.
 *
 * This module defines the fundamental types and interfaces that form the contract
 * between different components of the WalletMesh system. It includes:
 * - Error handling types
 * - Session management interfaces
 * - Core client interface definition
 * - Configuration types
 */

import type { DappInfo, WalletInfo, ConnectedWallet } from '../../types.js';
import type { Connector } from '../connectors/types.js';
import type { ConnectionStatus } from '../../types.js';

/**
 * Specialized error class for wallet-related errors.
 *
 * Extends the native Error class to provide additional context about wallet errors.
 * Categorizes errors by type to help with error handling and debugging.
 *
 * @extends Error
 *
 * @property {string} name - Always set to 'WalletError'
 * @property {Error} [cause] - Optional underlying error that caused this error
 * @property {string} type - Categorizes the error source:
 *   - 'client': Errors from the WalletMeshClient
 *   - 'connector': Errors from wallet protocol connectors
 *   - 'transport': Communication/messaging errors
 *   - 'storage': Session storage/persistence errors
 *   - 'timeout': Operation timeout errors
 *
 * @example
 * ```typescript
 * throw new WalletError(
 *   'Failed to connect to wallet',
 *   'transport',
 *   new Error('Connection refused')
 * );
 * ```
 */
export class WalletError extends Error {
  public override name = 'WalletError';
  public override cause?: Error;
  public readonly type: 'client' | 'connector' | 'transport' | 'storage' | 'timeout';

  constructor(message: string, type: WalletError['type'], cause?: Error) {
    super(message);
    this.type = type;
    if (cause) this.cause = cause;
  }
}

/**
 * Represents an active wallet session with its associated state and configuration.
 *
 * A session is the core data structure that maintains the state of a wallet
 * connection, including:
 * - Connection status and history
 * - Protocol-specific connector instance
 * - Wallet state and metadata
 * - Error tracking
 *
 * Maintains the connection state, protocol connector, and wallet information
 * required to manage an active wallet connection.
 *
 * @property {Connector} [connector] - Optional connector instance for protocol handling
 * @property {ConnectedWallet} wallet - The connected wallet instance
 * @property {ConnectionStatus} status - Current connection status
 * @property {Error} [lastError] - Last error encountered, if any
 * @property {ConnectorConfig} connectorConfig - Configuration for connector reconnection
 *
 * @example
 * ```typescript
 * const session: WalletSession = {
 *   connector: new WalletConnector(),
 *   wallet: connectedWallet,
 *   status: ConnectionStatus.Connected,
 *   connectorConfig: { type: 'standard' }
 * };
 * ```
 */
export interface WalletSession {
  id: string;
  timestamp: number;
  connector?: Connector;
  wallet: ConnectedWallet;
  status: ConnectionStatus;
  lastError?: Error;
}

/**
 * Core interface for wallet interactions in the WalletMesh system.
 *
 * This interface defines the contract that all wallet client implementations
 * must fulfill. It provides a complete API for:
 *
 * Connection Management:
 * - Establishing new wallet connections
 * - Managing connection lifecycle
 * - Handling disconnections
 *
 * State Management:
 * - Reading connection state
 * - Querying connected wallets
 * - Accessing blockchain providers
 *
 * Error Handling:
 * - Standardized error processing
 * - Connection recovery
 *
 * @remarks
 * The WalletClient interface is the primary integration point for dApps.
 * It abstracts away the complexities of:
 * - Protocol-specific communication
 * - Session persistence
 * - Connection recovery
 * - State synchronization
 *
 *
 * Implementations of this interface provide methods for:
 * - Wallet connection and disconnection
 * - Session management
 * - State queries
 * - Error handling
 *
 * @example
 * ```typescript
 * class MyWalletClient implements WalletClient {
 *   async initialize() {
 *     // Restore previous session if available
 *     return this.attemptRestore();
 *   }
 *
 *   async connectWallet(walletInfo, transport, connector) {
 *     // Establish new wallet connection
 *     return this.connect(walletInfo);
 *   }
 *
 *   // ... other method implementations
 * }
 * ```
 */
export interface WalletClient {
  /**
   * Gets the immutable dApp information associated with this client.
   */
  getDappInfo(): Readonly<DappInfo>;

  /**
   * Initializes the client and attempts to restore any saved sessions.
   *
   * @returns Promise resolving to restored wallet if available
   * @throws {WalletError} If initialization fails
   *
   * @remarks
   * - Should be called when dApp loads
   * - Attempts to restore the most recent session
   * - Returns null if no session to restore
   */
  initialize(): Promise<ConnectedWallet | null>;

  /**
   * Establishes a new wallet connection.
   *
   * @param walletInfo - Information about the wallet to connect
   * @param connector - Protocol-specific connector instance
   * @param options - Optional connection configuration
   * @returns Promise resolving to connected wallet instance
   * @throws {WalletError} If connection fails
   *
   * @remarks
   * - Validates wallet information
   * - Manages connector lifecycle
   * - Handles session persistence
   */
  connectWallet(
    walletInfo: WalletInfo,
    connector: Connector,
    options?: { persist?: boolean },
  ): Promise<ConnectedWallet>;

  /**
   * Disconnects a specific wallet.
   *
   * @param walletId - ID of wallet to disconnect
   * @throws {WalletError} If disconnection fails
   *
   * @remarks
   * - Cleans up connection resources
   * - Removes session data if not preserving
   * - Handles failed disconnections
   */
  disconnectWallet(walletId: string): Promise<void>;

  /**
   * Gets the blockchain-specific provider for a wallet.
   *
   * @param walletId - ID of wallet to get provider for
   * @returns Promise resolving to provider instance
   * @throws {WalletError} If provider unavailable
   */
  getProvider(walletId: string): Promise<unknown>;

  /**
   * Gets all currently connected wallets.
   *
   * @returns Array of connected wallet instances
   *
   * @remarks
   * Returns only wallets in Connected state
   */
  getConnectedWallets(): ConnectedWallet[];

  /**
   * Gets the primary connected wallet.
   *
   * @returns Connected wallet or null if none connected
   */
  getConnectedWallet(): ConnectedWallet | null;

  /**
   * Processes a wallet-related error.
   *
   * @param error - Error to handle
   *
   * @remarks
   * Implementations should:
   * - Log error details
   * - Update connection state
   * - Trigger UI updates
   * - Attempt recovery if possible
   */
  handleError(error: WalletError): void;
}

/**
 * Configuration options for session storage behavior.
 *
 * @property {string} [storageKey] - Custom key for storing sessions in localStorage.
 *   Defaults to 'walletmesh_wallet_session' if not specified.
 *
 * @example
 * ```typescript
 * const options: SessionOptions = {
 *   storageKey: 'custom_wallet_sessions'
 * };
 * ```
 */
export interface SessionOptions {
  /** Storage key for sessions */
  storageKey?: string;
}
