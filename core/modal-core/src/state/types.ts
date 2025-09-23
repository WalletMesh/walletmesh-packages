import type { ChainType } from '../types.js';

// Modal view type - matches the schema definition
export type ModalView = 'walletSelection' | 'connecting' | 'connected' | 'error' | 'switchingChain';

/**
 * Connection state machine using discriminated unions
 *
 * This type is designed for state management patterns where each status
 * has different available fields. For a simple object-based connection state,
 * use WalletConnectionState from api/types/connection.ts instead.
 *
 * @see WalletConnectionState - Object-based connection state for general use
 */
export type WalletConnectionState =
  | { status: 'disconnected'; walletId: string }
  | { status: 'connecting'; walletId: string; startedAt: number }
  | {
      status: 'connected';
      walletId: string;
      address: string;
      chainId: string;
      chainType: ChainType;
      connectedAt: number;
    }
  | { status: 'error'; walletId: string; error: Error; occurredAt: number }
  | {
      status: 'reconnecting';
      walletId: string;
      lastAddress: string;
      attempt: number;
      nextRetryAt: number;
    };

// Chain state within a session
export interface ChainState {
  chainId: string;
  chainType: ChainType;
  address: string;
  // Chain-specific data (balances, nonce, etc.)
  metadata: Record<string, unknown>;
  lastUsedAt: number;
}

export interface SessionHistoryEntry {
  sessionId: string;
  walletId: string;
  chainId: string;
  action: 'created' | 'switched' | 'disconnected';
  timestamp: number;
}

export interface WalletPermissions {
  [method: string]: boolean;
}

export interface UIError {
  code: string;
  message: string;
  details?: unknown;
}

export interface StoreConfig {
  maxConnections?: number;
  autoReconnect?: boolean;
  reconnectDelay?: number;
  persistSessions?: boolean;
  sessionTimeout?: number;
}
