/**
 * Provider state management types
 *
 * This module contains state management types for wallet providers,
 * moved from providers/types/WalletProvider.ts for better organization
 * and to establish a canonical source of truth.
 *
 * @module api/types/providerState
 * @packageDocumentation
 */

import type { ChainType } from '../../core/types.js';
import { ConnectionState } from '../../core/types.js';

// Re-export ConnectionState from core types (canonical definition)
export { ConnectionState };

/**
 * Connection information for wallet providers
 *
 * @public
 */
export interface ConnectionInfo {
  /** Connection state */
  state: ConnectionState;
  /** Connected accounts/addresses */
  accounts: string[];
  /** Chain/network identifier */
  chainId: string | number;
  /** Timestamp of connection */
  connectedAt?: number;
  /** Last activity timestamp */
  lastActivityAt?: number;
}

/**
 * Provider metadata
 *
 * @public
 */
export interface ProviderMetadata {
  /** Provider name */
  name: string;
  /** Provider icon URL */
  icon: string;
  /** Provider description */
  description?: string;
  /** Provider homepage */
  homepage?: string;
  /** Supported chains */
  supportedChains?: string[];
  /** Provider version */
  version?: string;
}

/**
 * Common connection options for all providers
 *
 * @public
 */
export interface CommonConnectOptions {
  /** Connection timeout in milliseconds */
  timeout?: number;
  /** Whether to show UI (false for silent connection) */
  showUI?: boolean;
  /** Preferred accounts to connect */
  preferredAccounts?: string[];
}

/**
 * Wallet provider error
 *
 * @public
 */
export class WalletProviderError extends Error {
  code: string;
  chainType?: ChainType;
  data?: unknown;

  constructor(message: string, code: string, chainType?: ChainType, data?: unknown) {
    super(message);
    this.name = 'WalletProviderError';
    this.code = code;
    if (chainType !== undefined) {
      this.chainType = chainType;
    }
    this.data = data;
  }
}

/**
 * Connection state manager for providers
 *
 * Provides utilities for managing and tracking provider connection state transitions.
 *
 * @public
 * @example
 * ```typescript
 * const stateManager = new ConnectionStateManager();
 *
 * stateManager.onStateChange((newState, oldState) => {
 *   console.log(`State changed from ${oldState} to ${newState}`);
 * });
 *
 * stateManager.setState(ConnectionState.Connecting);
 * console.log(stateManager.isConnecting()); // true
 * ```
 */
export class ConnectionStateManager {
  private state: ConnectionState;
  private listeners: Array<(state: ConnectionState, previousState: ConnectionState) => void> = [];

  constructor() {
    this.state = ConnectionState.Disconnected;
  }

  /**
   * Get current state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Update state
   */
  setState(newState: ConnectionState): void {
    if (newState !== this.state) {
      const previousState = this.state;
      this.state = newState;
      this.notifyListeners(newState, previousState);
    }
  }

  /**
   * Add state change listener
   *
   * @returns Unsubscribe function
   */
  onStateChange(listener: (state: ConnectionState, previousState: ConnectionState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === ConnectionState.Connected;
  }

  /**
   * Check if connecting
   */
  isConnecting(): boolean {
    return this.state === ConnectionState.Connecting;
  }

  /**
   * Check if disconnected
   */
  isDisconnected(): boolean {
    return this.state === ConnectionState.Disconnected;
  }

  /**
   * Check if in error state
   */
  isError(): boolean {
    return this.state === ConnectionState.Error;
  }

  /**
   * Check if in specific state
   */
  isInState(state: ConnectionState): boolean {
    return this.state === state;
  }

  private notifyListeners(state: ConnectionState, previousState: ConnectionState): void {
    for (const listener of this.listeners) {
      try {
        listener(state, previousState);
      } catch (error) {
        console.error('Error in connection state listener:', error);
      }
    }
  }
}
