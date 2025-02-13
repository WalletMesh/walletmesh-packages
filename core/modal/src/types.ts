import type { TransportConfig } from './lib/transports/types.js';
import type { AdapterConfig } from './lib/adapters/types.js';

/**
 * Information about a DApp using the wallet
 */
export interface DappInfo {
  name: string;
  description: string;
  origin: string;
  icon?: string;
  rpcUrl?: string;
}

/**
 * Base wallet configuration
 */
export interface WalletInfo {
  id: string;
  name: string;
  icon?: string;
  url?: string;
  supportedChains?: string[];
  adapter: AdapterConfig;
  transport: TransportConfig;
}

/**
 * Connected wallet state
 */
export interface WalletState {
  chain?: string;
  address?: string;
  sessionId?: string;
}

/**
 * Connected wallet
 */
export interface ConnectedWallet {
  info: WalletInfo;
  state: WalletState;
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
