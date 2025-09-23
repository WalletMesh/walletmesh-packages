/**
 * Connection state management for discovery protocol
 *
 * This module manages the state of wallet connections established through
 * the discovery protocol, including session persistence and recovery.
 *
 * @module client/discovery/ConnectionState
 */

import type { QualifiedResponder } from '@walletmesh/discovery';
import type { Logger } from '../../internal/core/logger/logger.js';

/**
 * Connection state information
 */
export interface ConnectionState {
  /** Wallet ID */
  walletId: string;
  /** Connection status */
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  /** Session ID if connected */
  sessionId?: string;
  /** Transport configuration */
  transport?: {
    type: string;
    config: Record<string, unknown>;
  };
  /** Connection timestamp */
  connectedAt?: number;
  /** Last activity timestamp */
  lastActivity?: number;
  /** Error information if status is 'error' */
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
  /** Original qualified wallet data */
  qualifiedWallet?: QualifiedResponder;
}

/**
 * Connection state change event
 */
export interface ConnectionStateChangeEvent {
  walletId: string;
  previousState: ConnectionState['status'];
  newState: ConnectionState['status'];
  sessionId?: string;
  error?: ConnectionState['error'];
}

/**
 * Connection state manager for discovery service
 */
export class ConnectionStateManager {
  private readonly connections = new Map<string, ConnectionState>();
  private readonly logger: Logger;
  private readonly eventTarget = new EventTarget();

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Update connection state
   */
  updateConnectionState(walletId: string, updates: Partial<ConnectionState>): void {
    const existing = this.connections.get(walletId);
    const previousState = existing?.status || 'disconnected';

    const newState: ConnectionState = {
      walletId,
      status: 'disconnected',
      ...existing,
      ...updates,
      lastActivity: Date.now(),
    };

    this.connections.set(walletId, newState);

    // Emit state change event if status changed
    if (newState.status !== previousState) {
      this.emitStateChange({
        walletId,
        previousState,
        newState: newState.status,
        ...(newState.sessionId && { sessionId: newState.sessionId }),
        ...(newState.error && { error: newState.error }),
      });
    }

    this.logger.debug('Connection state updated', {
      walletId,
      status: newState.status,
      previousState,
    });
  }

  /**
   * Get connection state for a wallet
   */
  getConnectionState(walletId: string): ConnectionState | undefined {
    return this.connections.get(walletId);
  }

  /**
   * Get all connection states
   */
  getAllConnectionStates(): Map<string, ConnectionState> {
    return new Map(this.connections);
  }

  /**
   * Get connected wallets
   */
  getConnectedWallets(): ConnectionState[] {
    return Array.from(this.connections.values()).filter((state) => state.status === 'connected');
  }

  /**
   * Check if wallet is connected
   */
  isConnected(walletId: string): boolean {
    const state = this.connections.get(walletId);
    return state?.status === 'connected';
  }

  /**
   * Clear connection state for a wallet
   */
  clearConnectionState(walletId: string): void {
    const existing = this.connections.get(walletId);
    if (existing) {
      this.connections.delete(walletId);

      if (existing.status !== 'disconnected') {
        this.emitStateChange({
          walletId,
          previousState: existing.status,
          newState: 'disconnected',
        });
      }
    }
  }

  /**
   * Clear all connection states
   */
  clearAllConnectionStates(): void {
    const connectedWallets = this.getConnectedWallets();
    this.connections.clear();

    // Emit disconnect events for all connected wallets
    for (const wallet of connectedWallets) {
      this.emitStateChange({
        walletId: wallet.walletId,
        previousState: 'connected',
        newState: 'disconnected',
      });
    }
  }

  /**
   * Add connection state change listener
   */
  onStateChange(callback: (event: ConnectionStateChangeEvent) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<ConnectionStateChangeEvent>;
      callback(customEvent.detail);
    };

    this.eventTarget.addEventListener('state-change', handler);

    return () => {
      this.eventTarget.removeEventListener('state-change', handler);
    };
  }

  /**
   * Emit state change event
   */
  private emitStateChange(event: ConnectionStateChangeEvent): void {
    this.eventTarget.dispatchEvent(new CustomEvent('state-change', { detail: event }));
  }

  /**
   * Serialize connection states for persistence
   */
  serialize(): Record<string, ConnectionState> {
    const serialized: Record<string, ConnectionState> = {};

    for (const [walletId, state] of this.connections) {
      // Only persist connected sessions
      if (state.status === 'connected' && state.sessionId) {
        serialized[walletId] = {
          walletId: state.walletId,
          status: state.status,
          sessionId: state.sessionId,
          ...(state.transport && { transport: state.transport }),
          ...(state.connectedAt && { connectedAt: state.connectedAt }),
          ...(state.lastActivity && { lastActivity: state.lastActivity }),
        };
      }
    }

    return serialized;
  }

  /**
   * Restore connection states from persistence
   */
  restore(states: Record<string, ConnectionState>): void {
    for (const [walletId, state] of Object.entries(states)) {
      // Mark restored connections as needing recovery
      this.connections.set(walletId, {
        ...state,
        status: 'disconnected', // Will need to reconnect
      });
    }

    this.logger.info('Restored connection states', {
      count: Object.keys(states).length,
    });
  }

  /**
   * Get session recovery information
   */
  getRecoverableSessions(): Array<{
    walletId: string;
    sessionId: string;
    transport: ConnectionState['transport'];
  }> {
    const recoverable: Array<{
      walletId: string;
      sessionId: string;
      transport: ConnectionState['transport'];
    }> = [];

    for (const state of this.connections.values()) {
      if (state.sessionId && state.transport) {
        recoverable.push({
          walletId: state.walletId,
          sessionId: state.sessionId,
          transport: state.transport,
        });
      }
    }

    return recoverable;
  }
}
