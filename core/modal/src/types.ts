import type { TransportConfig } from './lib/transports/types.js';
import type { AdapterConfig } from './lib/adapters/types.js';

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
 * Base wallet configuration
 */
export interface WalletInfo {
  /** Unique identifier for the wallet */
  id: string;
  /** Display name */
  name: string;
  /** Icon URL or data URI */
  icon: string | undefined;
  /** Optional wallet URL */
  url?: string;
  /** Adapter configuration */
  adapter: AdapterConfig;
  /** Transport configuration */
  transport: TransportConfig;
}

/**
 * Connected wallet state
 */
export interface WalletState {
  /** Chain identifier */
  chain?: string;
  /** Wallet address */
  address?: string;
  /** Session identifier */
  sessionId?: string;
}

/**
 * Connected wallet
 */
export interface ConnectedWallet {
  info: WalletInfo;
  state: WalletState;
}
