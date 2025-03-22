/**
 * Core wallet types and interfaces
 */

/**
 * Dapp information
 */
export interface DappInfo {
  /** Dapp name */
  name: string;
  /** Dapp icon URL */
  icon?: string;
  /** Dapp URL */
  url: string;
  /** Dapp origin */
  origin: string;
}

/**
 * Wallet information
 */
export interface WalletInfo {
  /** Wallet address */
  address: string;
  /** Connected chain ID */
  chainId: number;
  /** Wallet public key */
  publicKey: string;
  /** Wallet identifier */
  id?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Connected wallet instance
 */
export interface ConnectedWallet {
  /** Wallet address */
  address: string;
  /** Connected chain ID */
  chainId: number;
  /** Wallet public key */
  publicKey: string;
  /** Whether wallet is connected */
  connected: boolean;
  /** Wallet type */
  type?: string;
  /** Associated wallet info */
  info?: WalletInfo;
  /** Connection state */
  state?: WalletState;
}

/**
 * Connection status enum
 */
export enum ConnectionStatus {
  /** Not connected */
  DISCONNECTED = 'disconnected',
  /** Connection in progress */
  CONNECTING = 'connecting',
  /** Successfully connected */
  CONNECTED = 'connected',
  /** Connection error */
  ERROR = 'error',
}

/**
 * Chain connection information
 */
export interface ChainConnection {
  /** Chain/network ID */
  chainId: number;
  /** Connection URL */
  rpcUrl: string;
  /** Connection status */
  status: ConnectionStatus;
}

/**
 * Session store interface
 */
export interface SessionStore {
  /** Gets a specific session */
  getSession(id: string): WalletSession | undefined;
  /** Gets all sessions */
  getSessions(): WalletSession[];
  /** Sets a session */
  setSession(id: string, session: WalletSession): void;
  /** Removes a session */
  removeSession(id: string): void;
  /** Clears all sessions */
  clearSessions(): void;
  /** Internal sessions map */
  readonly sessions: Map<string, WalletSession>;
}

/**
 * Wallet session information
 */
export interface WalletSession {
  /** Session ID */
  id: string;
  /** Connected wallet address */
  address: string;
  /** Chain connections */
  chains: Record<number, ChainConnection>;
  /** Session expiry timestamp */
  expiry: number;
  /** Connection status */
  status: ConnectionStatus;
  /** Active connector */
  connector: Connector;
  /** Connected wallet */
  wallet: ConnectedWallet;
}

/**
 * Provider interface
 */
export interface Provider {
  /** Sends a request to the provider */
  request<T = unknown>(method: string, params?: unknown[]): Promise<T>;
  /** Connect to provider */
  connect(): Promise<void>;
  /** Disconnect from provider */
  disconnect(): Promise<void>;
  /** Check if provider is connected */
  isConnected(): boolean;
}

/**
 * Wallet state
 */
export interface WalletState {
  /** Connected address */
  address: string;
  /** Network/chain ID */
  networkId: number;
  /** Session identifier */
  sessionId: string;
  /** Last activity timestamp */
  lastActive: number;
}

/**
 * Wallet error
 */
export class WalletError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

/**
 * Wallet connector interface
 */
export interface Connector {
  /** Gets provider instance */
  getProvider(): Promise<Provider>;
  /** Connects to wallet */
  connect(walletInfo: WalletInfo): Promise<ConnectedWallet>;
  /** Disconnects from wallet */
  disconnect(): Promise<void>;
  /** Gets connection state */
  getState(): ConnectionStatus;
  /** Resumes existing connection */
  resume(walletInfo: WalletInfo, state: WalletState): Promise<ConnectedWallet>;
}

/**
 * Connector implementation configuration
 */
export interface ConnectorImplementationConfig {
  /** Connector type */
  type: string;
  /** Human-readable name */
  name: string;
  /** Factory function to create provider instance */
  factory: () => Promise<Provider>;
  /** Additional options */
  options?: Record<string, unknown>;
}

/**
 * Wallet connector configuration
 */
export interface WalletConnectorConfig {
  /** Connector type */
  type: string;
  /** Optional config parameters */
  options?: Record<string, unknown>;
  /** Default chain ID */
  defaultChainId?: number;
}

/**
 * Wallet client interface
 */
export interface WalletClient {
  /** Connects to wallet */
  connect(config: WalletConnectorConfig): Promise<ConnectedWallet>;
  /** Disconnects current wallet */
  disconnect(): Promise<void>;
  /** Gets current state */
  getState(): ConnectionStatus;
}
