import type { TransportConfig } from './lib/transports/types.js';
import type { AdapterConfig, BaseAdapterOptions } from './lib/adapters/types.js';

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
export interface BaseWalletConfig {
  /** Unique identifier for the wallet */
  id: string;
  /** Display name */
  name: string;
  /** Icon URL or data URI */
  icon: string;
  /** Optional wallet URL */
  url?: string;
  /** Transport configuration */
  transport: TransportConfig;
}

/**
 * Information about a wallet that can be connected
 */
export interface WalletInfo extends BaseWalletConfig {
  /** Adapter configuration */
  adapter: AdapterConfig;
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
  /** Adapter options */
  adapterOptions?: BaseAdapterOptions;
}

/**
 * Information about a connected wallet
 */
export interface ConnectedWallet extends BaseWalletConfig, WalletState {
  /** Adapter configuration, merged with state */
  adapter: AdapterConfig & { options?: BaseAdapterOptions };
}
