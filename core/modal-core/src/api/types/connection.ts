/**
 * Consolidated connection state types for wallet management
 *
 * This module provides the canonical connection state interfaces that should be
 * used throughout the codebase instead of duplicated versions.
 *
 * @module types/connection
 * @public
 */

import type { ChainType, SupportedChain, WalletInfo } from '../../core/types.js';
import type { ModalError } from '../../internal/core/errors/types.js';
import type { ConnectionStatus } from './connectionStatus.js';

/**
 * Base connection state interface - the canonical version
 *
 * @public
 * @interface WalletConnectionState
 */
export interface WalletConnectionState {
  /** Current connection status */
  status: ConnectionStatus;
  /** ID of the connected wallet */
  walletId: string | null;
  /** List of connected account addresses */
  accounts: string[];
  /** Currently connected chain */
  chain: SupportedChain | null;
  /** Type of blockchain network */
  chainType: ChainType | null;
  /** Primary connected address (first account) */
  address: string | null;
}

/**
 * Extended connection state for wallet adapters with error handling
 *
 * @public
 * @interface WalletAdapterConnectionState
 */
export interface WalletAdapterConnectionState {
  /** Current connection status including error state */
  status: ConnectionStatus;
  /** Active connection if connected */
  connection: WalletConnection | null;
  /** Error if status is 'error' */
  error: ModalError | null;
  /** Current accounts */
  accounts: string[];

  // Computed properties (readonly)
  /** Whether currently connected */
  readonly isConnected: boolean;
  /** Whether currently connecting */
  readonly isConnecting: boolean;
  /** Current address if connected */
  readonly address: string | null;
  /** Current chain if connected */
  readonly chain: SupportedChain | null;
  /** Current chain type if connected */
  readonly chainType: ChainType | null;
}

/**
 * Multi-wallet connection state for individual wallet tracking
 *
 * @public
 * @interface MultiWalletConnectionState
 */
export interface MultiWalletConnectionState {
  /** Wallet identifier */
  walletId: string;
  /** Primary connected address */
  address: string;
  /** List of connected accounts */
  accounts: string[];
  /** Connected chain */
  chain: SupportedChain;
  /** Connected chain type */
  chainType: ChainType;
  /** Provider instance for this connection */
  provider: unknown;
  /** Timestamp when connected */
  connectedAt: number;
  /** Timestamp of last activity */
  lastActiveAt: number;
}

/**
 * Wallet connection details
 *
 * @public
 * @interface WalletConnection
 */
export interface WalletConnection {
  /** Wallet identifier */
  walletId: string;
  /** Primary connected address */
  address: string;
  /** Connected accounts */
  accounts: string[];
  /** Connected chain */
  chain: SupportedChain;
  /** Connected chain type */
  chainType: ChainType;
  /** Provider instance */
  provider: unknown;
  /** Wallet info/metadata */
  walletInfo: WalletInfo;
  /** Session identifier for reconnection */
  sessionId?: string;
  /** Connection metadata */
  metadata?: {
    /** Connection timestamp */
    connectedAt: number;
    /** Last activity timestamp */
    lastActiveAt: number;
    /** Connection source */
    source?: string;
    /** Session-specific metadata from wallet */
    sessionMetadata?: Record<string, unknown>;
  };
}

/**
 * Connection state for external APIs and React hooks
 * Provides a consistent view of wallet connection status
 * Enhanced with multi-account support
 *
 * @public
 * @interface ConnectionState
 */
export interface ConnectionState {
  // Core state (matches useAccount hook needs)
  status: ConnectionStatus;

  // Primary account data (when connected)
  address?: string | undefined;
  chain?: SupportedChain | undefined;
  chainType?: ChainType | undefined;
  walletInfo?: WalletInfo | undefined;

  // Multi-account support
  accounts?:
    | Array<{
        address: string;
        name?: string;
        balance?: {
          value: string;
          formatted: string;
          symbol: string;
          decimals: number;
        };
        isActive?: boolean;
        index?: number;
        derivationPath?: string;
      }>
    | undefined;

  activeAccount?:
    | {
        address: string;
        name?: string;
        balance?: {
          value: string;
          formatted: string;
          symbol: string;
          decimals: number;
        };
        index?: number;
        derivationPath?: string;
      }
    | undefined;

  // Connection details
  walletId: string | null;
  provider?: unknown | undefined; // Chain-specific provider

  // Error details (when error)
  error?: ModalError | undefined;

  // Derived booleans (for hook convenience)
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  isReconnecting: boolean;

  // Multi-account capabilities
  canSwitchAccounts?: boolean;
  canAddAccounts?: boolean;
  totalAccounts?: number;
}

/**
 * Multi-wallet connection tracking
 * For future multi-wallet support
 *
 * @public
 * @interface MultiWalletState
 */
export interface MultiWalletState {
  // Active connections by wallet ID
  connections: Map<string, ConnectionState>;

  // Currently selected/active wallet
  activeWalletId: string | null;

  // Global connection settings
  config: {
    maxConnections: number;
    autoReconnect: boolean;
    reconnectDelay: number;
  };
}
