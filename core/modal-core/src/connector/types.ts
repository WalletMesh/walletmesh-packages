/**
 * @packageDocumentation
 * Core connector types and interfaces for WalletMesh.
 */

import type { Protocol, Transport } from '../transport/index.js';
import type { WalletInfo, WalletState, ConnectedWallet } from '../types.js';

/**
 * Configuration options for connectors
 */
export interface ConnectorConfig<T = unknown> {
  /** Transport instance for communication */
  transport: Transport;
  /** Protocol implementation */
  protocol: Protocol;
  /** Connector-specific options */
  options?: T;
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
   * Processes incoming messages from the transport.
   */
  handleMessage(data: unknown): void;

  /**
   * Gets the chain-specific provider instance.
   */
  getProvider(): Promise<unknown>;
}

/**
 * Factory function type for creating connectors.
 */
export type ConnectorFactory<T = unknown> = (config: ConnectorConfig<T>) => Connector;

/**
 * Registry of available connector types.
 */
export enum ConnectorType {
  JSONRPC = 'json-rpc',
  IFRAME = 'iframe',
  WINDOW = 'window',
  CUSTOM = 'custom',
}
