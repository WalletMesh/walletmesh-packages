/**
 * Base transport interface for handling communication between frontend and backend
 */
export interface Transport {
  /** Establishes the transport connection */
  connect(): Promise<void>;
  
  /** Closes the transport connection and cleans up resources */
  disconnect(): Promise<void>;
  
  /** Sends data through the transport */
  send(data: unknown): Promise<void>;
  
  /** Registers a handler for incoming messages */
  onMessage(handler: (data: unknown) => void): void;
}

/**
 * Interface for wallet adapters that handle chain-specific operations
 */
export interface Adapter {
  /** Connects to the wallet and returns connected wallet information */
  connect(walletInfo: WalletInfo): Promise<ConnectedWallet>;
  
  /** Disconnects from the wallet and cleans up */
  disconnect(): Promise<void>;
  
  /** Retrieves the chain-specific provider instance */
  getProvider(): Promise<unknown>;
  
  /** Handles incoming messages from the transport */
  handleMessage(data: unknown): void;
}

/**
 * Information about a DApp using the wallet
 */
export interface DappInfo {
  name: string;
  description: string;
  icon: string; // Data URI for the Dapp icon
  origin: string;
}

/**
 * Information about a wallet that can be connected
 */
export interface WalletInfo {
  name: string;
  icon: string;
  url?: string;
  adapterType: AdapterType;
  adapterOptions?: AdapterOptions;
  transportType: TransportType;
  transportOptions?: TransportOptions;
}

/**
 * Information about a connected wallet
 */
export interface ConnectedWallet extends WalletInfo {
  chain?: string;
  address?: string;
  sessionId?: string;
}

/**
 * Options for configuring a transport
 */
export interface TransportOptions {
  url?: string;
  origin?: string;
  extensionId?: string;
}

/**
 * Options for configuring an adapter
 */
export interface AdapterOptions {
  chainId?: string;
}

/**
 * Available transport types
 */
export enum TransportType {
  PostMessage = 'postMessage',
  WebSocket = 'websocket',
  Extension = 'extension',
}

/**
 * Available adapter types
 */
export enum AdapterType {
  WalletMeshAztec = 'wm_aztec',
}

/**
 * Connection status states
 */
export enum ConnectionStatus {
  Idle = 'idle',
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnecting = 'disconnecting',
  Resuming = 'resuming',
}
