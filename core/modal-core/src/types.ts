/**
 * @packageDocumentation
 * Core type definitions for the WalletMesh Modal Core package.
 */

/**
 * Core interfaces for wallet connectors.
 */

import type { Protocol, Transport } from './transport/index.js';

/**
 * Configuration for wallet connections
 */
export interface WalletConnectorConfig {
  /** Type of connector to use */
  type: string;
  /** Connector-specific options */
  options?: Record<string, unknown>;
}

/**
 * Configuration for connector implementations
 */
export interface ConnectorImplementationConfig {
  /** Transport instance for communication */
  transport: Transport;
  /** Protocol implementation */
  protocol: Protocol;
  /** Type of connector */
  type: string;
  /** Connector-specific options */
  options?: Record<string, unknown>;
}

/**
 * Core interface for protocol-specific wallet connectors.
 */
export interface Connector {
  /**
   * Establishes a connection with a wallet.
   * @param walletInfo Information about the wallet to connect
   * @returns Connected wallet details
   */
  connect(walletInfo: WalletInfo): Promise<ConnectedWallet>;

  /**
   * Resumes a previously established connection.
   * @param walletInfo Wallet information
   * @param state Previous wallet state
   * @returns Reconnected wallet details
   */
  resume(walletInfo: WalletInfo, state: WalletState): Promise<ConnectedWallet>;

  /**
   * Terminates the wallet connection.
   */
  disconnect(): Promise<void>;

  /**
   * Gets the chain-specific provider instance.
   */
  getProvider(): Promise<unknown>;
}

/**
 * Factory function type for creating connectors.
 */
export type ConnectorFactory = (config: ConnectorImplementationConfig) => Connector;

/**
 * Represents the connection status of a wallet.
 */
export enum ConnectionStatus {
  Idle = 'idle',
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnecting = 'disconnecting',
  Disconnected = 'disconnected',
  Resuming = 'resuming',
  Error = 'error',
}

/**
 * Information about a dApp using the WalletMesh library.
 */
export interface DappInfo {
  name: string;
  description?: string;
  url?: string;
  icon?: string;
  origin: string;
}

/**
 * Connector configuration for wallet interaction.
 */
export interface ConnectorConfig {
  type: string;
  options?: Record<string, unknown>;
}

/**
 * Static information about a wallet.
 */
export interface WalletInfo {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  connector: WalletConnectorConfig;
}

/**
 * The current state of a connected wallet.
 */
export interface WalletState {
  address: string | null;
  networkId: string | null;
  sessionId: string | null;
  isConnecting?: boolean;
  hasProvider?: boolean;
  hasPermissions?: boolean;
  error?: Error | null;
  [key: string]: unknown;
}

/**
 * Represents a connected wallet instance.
 */
export interface ConnectedWallet {
  info: WalletInfo;
  state: WalletState;
}

/**
 * Session token for managing wallet connections.
 */
export interface SessionToken {
  id: string;
  createdAt: number;
  expiresAt: number;
  walletType: string;
  publicKey: string;
  permissions: string[];
  accounts: string[];
  chainIds: number[];
  nonce: string;
  signature: string;
}

/**
 * Storage format for chain-specific connection data.
 */
export interface ChainConnection {
  address: string;
  permissions: string[];
}

/**
 * Core error class for wallet-related errors.
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
 * Base interface for wallet connectors.
 * Extended in client/types.ts to avoid circular dependencies.
 */
export interface BaseConnector {
  getProvider(): Promise<unknown>;
  disconnect(): Promise<void>;
}

/**
 * Session manager store interface
 */
export interface SessionStore {
  sessions: Map<string, WalletSession>;
  setSession(id: string, session: WalletSession): void;
  removeSession(id: string): void;
  clearSessions(): void;
  getState(): { sessions: Map<string, WalletSession> };
}

/**
 * Represents an active wallet session with base connector.
 */
export interface WalletSession {
  id: string;
  createdAt: number;
  connector?: unknown; // Will be typed as Connector from client/types.js when used
  wallet: ConnectedWallet;
  chainConnections: Map<number, ChainConnection>;
  sessionToken: SessionToken;
  status: ConnectionStatus;
  lastConnectionError?: Error;
}

/**
 * Core interface for wallet interactions with base connector.
 */
export interface WalletClient {
  getDappInfo(): Readonly<DappInfo>;
  initialize(): Promise<ConnectedWallet | null>;
  connectWallet(walletInfo: WalletInfo, connector: unknown): Promise<ConnectedWallet>; // Will be typed as Connector from client/types.js when used
  disconnectWallet(walletId: string): Promise<void>;
  getChainProvider(walletId: string): Promise<unknown>;
  getConnectedWallets(): ConnectedWallet[];
  getWalletConnections(walletId: string): Promise<Map<number, ChainConnection> | undefined>;
  getConnectedWallet(): ConnectedWallet | null;
  handleWalletError(error: WalletError): void;
}
