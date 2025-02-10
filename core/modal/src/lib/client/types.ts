import type {
  ConnectedWallet,
  ConnectionStatus
} from '../../types.js';
import type { Transport } from '../transports/types.js';
import type { Adapter } from '../adapters/types.js';

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
  /** Session creation timestamp */
  timestamp: number;
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
    public readonly context: 'transport' | 'adapter' | 'client',
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'WalletError';
  }
}
