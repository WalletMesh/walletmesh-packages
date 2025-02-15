/**
 * @packageDocumentation
 * Core type definitions for the WalletMesh client module.
 */

import type { DappInfo, WalletInfo, ConnectedWallet } from '../../types.js';
import type { Connector } from '../connectors/types.js';
import type { ConnectionStatus } from '../../types.js';

/**
 * Error class for wallet-related errors.
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
 * Session token for managing wallet connections
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
 * Storage format for chain-specific connection data
 */
export interface ChainConnection {
  address: string;
  permissions: string[];
}

/**
 * Represents an active wallet session
 */
export interface WalletSession {
  id: string;
  createdAt: number;
  connector?: Connector | undefined;
  wallet: ConnectedWallet;
  chainConnections: Map<number, ChainConnection>;
  sessionToken: SessionToken;
  status: ConnectionStatus;
  lastConnectionError?: Error;
}

/**
 * Serialized format of session data for storage
 */
export interface SerializedSession {
  id: string;
  createdAt: number;
  walletInfo: WalletInfo;
  wallet: ConnectedWallet;
  chainConnections: [number, ChainConnection][];
  sessionToken: SessionToken;
  status: ConnectionStatus;
  lastConnectionError?: Error;
}

/**
 * Core interface for wallet interactions
 */
export interface WalletClient {
  getDappInfo(): Readonly<DappInfo>;
  initialize(): Promise<ConnectedWallet | null>;
  connectWallet(
    walletInfo: WalletInfo,
    connector: Connector,
    options?: { persist?: boolean },
  ): Promise<ConnectedWallet>;
  disconnectWallet(walletId: string): Promise<void>;
  getChainProvider(walletId: string): Promise<unknown>;
  getConnectedWallets(): ConnectedWallet[];
  getWalletConnections(walletId: string): Promise<Map<number, ChainConnection> | undefined>;
  getConnectedWallet(): ConnectedWallet | null;
  handleWalletError(error: WalletError): void;
}
