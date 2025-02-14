import type { DappInfo, WalletInfo, ConnectedWallet } from '../../types.js';
import type { Transport } from '../transports/types.js';
import type { Connector } from '../connectors/types.js';
import type { ConnectionStatus } from '../../types.js';

/**
 * Custom error class for wallet-related errors.
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
 * Represents an active wallet session with its associated state and configurations.
 *
 * Maintains the connection state, transport layer, protocol connector, and wallet information
 * required to manage an active wallet connection.
 *
 * @property {Transport} [transport] - Optional transport instance for communication
 * @property {Connector} [connector] - Optional connector instance for protocol handling
 * @property {ConnectedWallet} wallet - The connected wallet instance
 * @property {ConnectionStatus} status - Current connection status
 * @property {Error} [lastError] - Last error encountered, if any
 * @property {TransportConfig} transportConfig - Configuration for transport reconnection
 * @property {ConnectorConfig} connectorConfig - Configuration for connector reconnection
 *
 * @example
 * ```typescript
 * const session: WalletSession = {
 *   transport: new PostMessageTransport(),
 *   connector: new WalletConnector(),
 *   wallet: connectedWallet,
 *   status: ConnectionStatus.Connected,
 *   transportConfig: { type: 'postMessage' },
 *   connectorConfig: { type: 'standard' }
 * };
 * ```
 */
export interface WalletSession {
  transport?: Transport;
  connector?: Connector;
  wallet: ConnectedWallet;
  status: ConnectionStatus;
  lastError?: Error;
  // Store configurations for reconnection
  transportConfig: import('../transports/types.js').TransportConfig;
  connectorConfig: import('../connectors/types.js').ConnectorConfig;
}

/**
 * Defines the core interface for interacting with wallets.
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
  getDappInfo(): Readonly<DappInfo>;
  initialize(): Promise<ConnectedWallet | null>;
  connectWallet(
    walletInfo: WalletInfo,
    transport: Transport,
    connector: Connector,
    options?: { persist?: boolean },
  ): Promise<ConnectedWallet>;
  disconnectWallet(walletId: string): Promise<void>;
  getProvider(walletId: string): Promise<unknown>;
  getConnectedWallets(): ConnectedWallet[];
  getConnectedWallet(): ConnectedWallet | null;
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
