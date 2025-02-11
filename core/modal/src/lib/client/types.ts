import type { ConnectedWallet, ConnectionStatus } from '../../types.js';
import type { Transport } from '../transports/types.js';
import type { Adapter } from '../adapters/types.js';
import type { WalletInfo, WalletState } from '../../types.js';

/**
 * Represents a wallet connection
 */
export interface WalletClient {
  /** Connects to a wallet using the provided transport and adapter */
  connectWallet(walletInfo: WalletInfo, transport: Transport, adapter: Adapter): Promise<ConnectedWallet>;

  /** Connects to a wallet using the provided transport and adapter */
  resumeWallet(walletInfo: WalletInfo, walletState: WalletState, transport: Transport, adapter: Adapter): Promise<ConnectedWallet>;

  /** Disconnects from the currently connected wallet */
  disconnectWallet(walletId: string): Promise<void>;

  /** Retrieves the current connection status */
  getConnectionStatus(): ConnectionStatus;

  /** Retrieves the current connected wallet, if any */
  getConnectedWallet(): ConnectedWallet | null;

  /** Retrieves the current wallet provider */
  getProvider(walletId: string): Promise<unknown>;

  /** Handles errors that occur during wallet operations */
  handleError(error: WalletError): void;
}

/**
 * Represents a session with a connected wallet
 */
export interface WalletSession {
  /** The transport used for communication */
  transport: Transport;
  /** The chain-specific adapter */
  adapter: Adapter;
  /** The connected wallet information */
  wallet: ConnectedWallet;
  /** Current connection status */
  status: ConnectionStatus;
  /** Last error if any */
  lastError?: Error;
}

/**
 * Message types for internal communication
 */
export enum MessageType {
  Provider = 'provider',
  Client = 'client',
  System = 'system',
}

/**
 * Internal message format
 */
export interface InternalMessage {
  type: MessageType;
  payload: unknown;
  walletId?: string;
}

/**
 * Session persistence options
 */
export interface SessionOptions {
  /** Whether to persist the session */
  persist?: boolean;
  /** Custom storage key */
  storageKey?: string;
}

/**
 * Client-specific error with context
 */
export class WalletError extends Error {
  constructor(
    message: string,
    public readonly context: 'transport' | 'adapter' | 'client' | 'storage',
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'WalletError';
  }
}
