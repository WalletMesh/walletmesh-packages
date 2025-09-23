/**
 * Connection Manager for handling wallet connection lifecycle
 *
 * This module provides comprehensive connection management including:
 * - Connection state tracking
 * - Auto-reconnection logic
 * - Connection health monitoring
 * - Session persistence
 * - Error recovery
 *
 * @module client/ConnectionManager
 * @packageDocumentation
 */

import type { WalletConnection } from '../api/types/connection.js';
import type { SessionManager } from '../api/types/sessionState.js';
import type { Logger } from '../internal/core/logger/logger.js';
import type { WalletAdapter } from '../internal/wallets/base/WalletAdapter.js';

import { ErrorFactory } from '../internal/core/errors/errorFactory.js';

/**
 * Connection state information
 *
 * @public
 */
export interface ConnectionState {
  /** Wallet ID */
  walletId: string;
  /** Connection status */
  status: 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error';
  /** Connection attempt count */
  attempts: number;
  /** Last connection attempt timestamp */
  lastAttempt: number;
  /** Last successful connection timestamp */
  lastConnected: number;
  /** Connection error if any */
  error?: Error;
  /** Whether auto-reconnect is enabled */
  autoReconnect: boolean;
  /** Reconnection interval in milliseconds */
  reconnectInterval: number;
  /** Maximum reconnection attempts */
  maxReconnectAttempts: number;
}

/**
 * Connection recovery options
 *
 * @public
 */
export interface ConnectionRecoveryOptions {
  /** Whether to enable auto-reconnection */
  autoReconnect?: boolean;
  /** Interval between reconnection attempts */
  reconnectInterval?: number;
  /** Maximum number of reconnection attempts */
  maxReconnectAttempts?: number;
  /** Whether to persist session across page reloads */
  persistSession?: boolean;
  /** Custom recovery strategy */
  recoveryStrategy?: 'immediate' | 'exponential-backoff' | 'linear-backoff';
}

/**
 * Connection event types
 *
 * @public
 */
export type ConnectionEvent =
  | { type: 'connecting'; walletId: string }
  | { type: 'connected'; walletId: string; connection: WalletConnection }
  | { type: 'disconnecting'; walletId: string }
  | { type: 'disconnected'; walletId: string; reason?: string }
  | { type: 'error'; walletId: string; error: Error }
  | { type: 'recovery_started'; walletId: string; attempt: number }
  | { type: 'recovery_failed'; walletId: string; error: Error }
  | { type: 'recovery_succeeded'; walletId: string; connection: WalletConnection };

/**
 * Connection Manager class for handling wallet connection lifecycle
 *
 * @example
 * ```typescript
 * const connectionManager = new ConnectionManager(sessionManager, logger);
 *
 * // Enable auto-reconnection for a wallet
 * connectionManager.setRecoveryOptions('metamask', {
 *   autoReconnect: true,
 *   reconnectInterval: 5000,
 *   maxReconnectAttempts: 3
 * });
 *
 * // Listen for connection events
 * connectionManager.on('connected', (event) => {
 *   console.log('Wallet connected:', event.walletId);
 * });
 *
 * // Connect with recovery
 * await connectionManager.connectWithRecovery(adapter, options);
 * ```
 *
 * @public
 */
export class ConnectionManager {
  // private readonly _sessionManager: SessionManager;
  private readonly logger: Logger;
  private readonly eventTarget = new EventTarget();

  // Connection state tracking
  private readonly connectionStates = new Map<string, ConnectionState>();
  private readonly recoveryOptions = new Map<string, ConnectionRecoveryOptions>();
  private readonly recoveryTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

  // Synchronization primitives to prevent race conditions
  private readonly connectionLocks = new Map<string, Promise<void>>();
  private readonly operationQueue = new Map<string, Array<() => Promise<void>>>();

  // Health monitoring
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private readonly healthCheckIntervalMs = 30000; // 30 seconds

  constructor(_sessionManager: SessionManager, logger: Logger) {
    this.logger = logger;

    // Start health monitoring
    this.startHealthMonitoring();

    this.logger.debug('ConnectionManager initialized');
  }

  /**
   * Connect to a wallet with recovery support
   *
   * @param adapter - Wallet adapter to connect with
   * @param options - Connection options
   * @returns Promise resolving to wallet connection
   * @public
   */
  async connectWithRecovery(
    adapter: WalletAdapter,
    options: Record<string, unknown> = {},
  ): Promise<WalletConnection> {
    const walletId = adapter.id;

    this.logger.debug('Connecting with recovery support', { walletId });

    // Use locking to prevent race conditions during connection
    return this.withConnectionLock(walletId, async () => {
      // Initialize connection state
      this.initializeConnectionState(walletId);

      try {
        // Get current state for attempt counting
        const currentState = this.connectionStates.get(walletId);

        // Update state to connecting atomically
        this.atomicUpdateConnectionState(walletId, {
          status: 'connecting',
          attempts: (currentState?.attempts || 0) + 1,
          lastAttempt: Date.now(),
        });
        this.emit({ type: 'connecting', walletId });

        // Attempt connection
        const connection = await adapter.connect(options);

        // Update state to connected atomically
        const updates: Partial<ConnectionState> = {
          status: 'connected',
          lastConnected: Date.now(),
        };

        // Clear error if it exists by creating new state without error
        const stateForUpdate = this.connectionStates.get(walletId);
        if (stateForUpdate?.error) {
          const { error, ...stateWithoutError } = stateForUpdate;
          this.connectionStates.set(walletId, { ...stateWithoutError, ...updates });
        } else {
          this.atomicUpdateConnectionState(walletId, updates);
        }

        // Setup connection monitoring
        this.setupConnectionMonitoring(walletId, adapter);

        this.emit({ type: 'connected', walletId, connection });
        this.logger.info('Successfully connected with recovery support', { walletId });

        return connection;
      } catch (error) {
        this.logger.error('Connection failed', { walletId, error });

        // Update state to error atomically
        this.atomicUpdateConnectionState(walletId, {
          status: 'error',
          error: error as Error,
        });

        this.emit({ type: 'error', walletId, error: error as Error });

        // Start recovery if enabled (but don't block the current operation)
        const recovery = this.recoveryOptions.get(walletId);
        if (recovery?.autoReconnect) {
          // Start recovery asynchronously to avoid blocking
          this.startRecovery(walletId, adapter, options).catch((recoveryError) => {
            this.logger.error('Failed to start recovery after connection failure', {
              walletId,
              originalError: error,
              recoveryError,
            });
          });
        }

        throw error;
      }
    });
  }

  /**
   * Disconnect from a wallet
   *
   * @param walletId - ID of the wallet to disconnect
   * @param adapter - Wallet adapter instance
   * @param reason - Optional reason for disconnection
   * @returns Promise that resolves when disconnected
   * @public
   */
  async disconnect(walletId: string, adapter: WalletAdapter, reason?: string): Promise<void> {
    this.logger.debug('Disconnecting wallet', { walletId, reason });

    // Use locking to coordinate with connection operations
    return this.withConnectionLock(walletId, async () => {
      // Stop recovery if active
      this.stopRecovery(walletId);

      // Update state to disconnecting
      this.atomicUpdateConnectionState(walletId, { status: 'disconnecting' });
      this.emit({ type: 'disconnecting', walletId });

      try {
        // Disconnect adapter
        await adapter.disconnect();

        // Update state to disconnected
        this.atomicUpdateConnectionState(walletId, { status: 'disconnected' });
        this.emit({ type: 'disconnected', walletId, ...(reason && { reason }) });

        this.logger.info('Successfully disconnected wallet', { walletId });
      } catch (error) {
        this.logger.error('Failed to disconnect wallet', { walletId, error });

        // Still mark as disconnected since we attempted
        this.atomicUpdateConnectionState(walletId, { status: 'disconnected', error: error as Error });
        this.emit({ type: 'disconnected', walletId, reason: 'error' });

        throw error;
      }
    });
  }

  /**
   * Set recovery options for a wallet
   *
   * @param walletId - ID of the wallet
   * @param options - Recovery options
   * @public
   */
  setRecoveryOptions(walletId: string, options: ConnectionRecoveryOptions): void {
    this.recoveryOptions.set(walletId, options);
    this.logger.debug('Recovery options set', { walletId, options });
  }

  /**
   * Get recovery options for a wallet
   *
   * @param walletId - ID of the wallet
   * @returns Recovery options or undefined if not set
   * @public
   */
  getRecoveryOptions(walletId: string): ConnectionRecoveryOptions | undefined {
    return this.recoveryOptions.get(walletId);
  }

  /**
   * Get connection state for a wallet
   *
   * @param walletId - ID of the wallet
   * @returns Connection state or undefined if not tracked
   * @public
   */
  getConnectionState(walletId: string): ConnectionState | undefined {
    return this.connectionStates.get(walletId);
  }

  /**
   * Get all connection states
   *
   * @returns Map of wallet IDs to connection states
   * @public
   */
  getAllConnectionStates(): Map<string, ConnectionState> {
    return new Map(this.connectionStates);
  }

  /**
   * Check if a wallet is connected
   *
   * @param walletId - ID of the wallet
   * @returns True if wallet is connected
   * @public
   */
  isConnected(walletId: string): boolean {
    const state = this.connectionStates.get(walletId);
    return state?.status === 'connected';
  }

  /**
   * Start recovery for a wallet manually
   *
   * @param walletId - ID of the wallet
   * @param adapter - Wallet adapter instance
   * @param options - Connection options
   * @public
   */
  async startManualRecovery(
    walletId: string,
    adapter: WalletAdapter,
    options: Record<string, unknown> = {},
  ): Promise<void> {
    this.logger.debug('Starting manual recovery', { walletId });

    const recoveryOpts = this.recoveryOptions.get(walletId);
    if (!recoveryOpts) {
      throw ErrorFactory.configurationError(`No recovery options set for wallet ${walletId}`);
    }

    await this.startRecovery(walletId, adapter, options);
  }

  /**
   * Stop recovery for a wallet
   *
   * @param walletId - ID of the wallet
   * @public
   */
  stopRecovery(walletId: string): void {
    const timeout = this.recoveryTimeouts.get(walletId);
    if (timeout) {
      clearTimeout(timeout);
      this.recoveryTimeouts.delete(walletId);
      this.logger.debug('Recovery stopped', { walletId });
    }
  }

  /**
   * Subscribe to connection events
   *
   * @param event - Event type
   * @param handler - Event handler
   * @returns Unsubscribe function
   * @public
   */
  on(event: ConnectionEvent['type'], handler: (event: ConnectionEvent) => void): () => void {
    const listener = (e: Event) => {
      const customEvent = e as CustomEvent<ConnectionEvent>;
      if (customEvent.detail.type === event) {
        handler(customEvent.detail);
      }
    };

    this.eventTarget.addEventListener('connection-event', listener);

    return () => {
      this.eventTarget.removeEventListener('connection-event', listener);
    };
  }

  /**
   * Subscribe to connection events once
   *
   * @param event - Event type
   * @param handler - Event handler
   * @returns Unsubscribe function
   * @public
   */
  once(event: ConnectionEvent['type'], handler: (event: ConnectionEvent) => void): () => void {
    const unsubscribe = this.on(event, (eventData) => {
      unsubscribe();
      handler(eventData);
    });
    return unsubscribe;
  }

  /**
   * Clean up connection manager resources
   *
   * @public
   */
  destroy(): void {
    this.logger.debug('Destroying ConnectionManager');

    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Stop all recovery timeouts
    for (const [walletId] of this.recoveryTimeouts) {
      this.stopRecovery(walletId);
    }

    // Clear state and locks
    this.connectionStates.clear();
    this.recoveryOptions.clear();
    this.connectionLocks.clear();
    this.operationQueue.clear();

    this.logger.info('ConnectionManager destroyed');
  }

  // Private implementation methods

  /**
   * Execute an operation with proper locking to prevent race conditions
   */
  private async withConnectionLock<T>(walletId: string, operation: () => Promise<T>): Promise<T> {
    // Check if there's already a lock for this wallet
    const existingLock = this.connectionLocks.get(walletId);

    if (existingLock) {
      // Wait for existing operation to complete before starting ours
      await existingLock;
    }

    // Create a new lock for this operation
    let resolveFunc: (() => void) | undefined;
    const lock = new Promise<void>((resolve) => {
      resolveFunc = resolve;
    });

    this.connectionLocks.set(walletId, lock);

    try {
      const result = await operation();
      return result;
    } finally {
      // Release the lock
      this.connectionLocks.delete(walletId);
      resolveFunc?.();
    }
  }

  /**
   * Update connection state atomically to prevent race conditions
   */
  private atomicUpdateConnectionState(walletId: string, updates: Partial<ConnectionState>): void {
    const current = this.connectionStates.get(walletId);
    if (current) {
      // Create a complete new state object to ensure atomicity
      const newState = { ...current, ...updates };
      this.connectionStates.set(walletId, newState);
    }
  }

  private initializeConnectionState(walletId: string): void {
    if (!this.connectionStates.has(walletId)) {
      this.connectionStates.set(walletId, {
        walletId,
        status: 'idle',
        attempts: 0,
        lastAttempt: 0,
        lastConnected: 0,
        autoReconnect: false,
        reconnectInterval: 5000,
        maxReconnectAttempts: 3,
      });
    }
  }

  private async startRecovery(
    walletId: string,
    adapter: WalletAdapter,
    options: Record<string, unknown>,
  ): Promise<void> {
    // Use the same locking mechanism to prevent concurrent recovery attempts
    return this.withConnectionLock(walletId, async () => {
      const recoveryOpts = this.recoveryOptions.get(walletId) || {};
      const state = this.connectionStates.get(walletId);

      if (!state) {
        this.logger.error('Cannot start recovery - no connection state', { walletId });
        return;
      }

      const maxAttempts = recoveryOpts.maxReconnectAttempts || 3;
      if (state.attempts >= maxAttempts) {
        this.logger.warn('Max recovery attempts reached', { walletId, attempts: state.attempts });
        this.emit({
          type: 'recovery_failed',
          walletId,
          error: new Error(`Max recovery attempts (${maxAttempts}) reached for wallet ${walletId}`),
        });
        return;
      }

      const interval = this.calculateRecoveryInterval(recoveryOpts, state.attempts);

      this.logger.info('Starting connection recovery', {
        walletId,
        attempt: state.attempts + 1,
        interval,
        strategy: recoveryOpts.recoveryStrategy || 'linear-backoff',
      });

      this.emit({
        type: 'recovery_started',
        walletId,
        attempt: state.attempts + 1,
      });

      // Use a promise-based approach with proper timeout and cleanup
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(async () => {
          // Clear this timeout from the map immediately
          this.recoveryTimeouts.delete(walletId);

          try {
            this.atomicUpdateConnectionState(walletId, {
              attempts: state.attempts + 1,
              lastAttempt: Date.now(),
              status: 'connecting',
            });

            const connection = await adapter.connect(options);

            const updates: Partial<ConnectionState> = {
              status: 'connected',
              lastConnected: Date.now(),
            };

            // Clear error if it exists by creating new state without error
            const recoveryState = this.connectionStates.get(walletId);
            if (recoveryState?.error) {
              const { error, ...stateWithoutError } = recoveryState;
              this.connectionStates.set(walletId, { ...stateWithoutError, ...updates });
            } else {
              this.atomicUpdateConnectionState(walletId, updates);
            }

            this.emit({
              type: 'recovery_succeeded',
              walletId,
              connection,
            });

            // Setup monitoring for recovered connection
            this.setupConnectionMonitoring(walletId, adapter);

            this.logger.info('Connection recovery succeeded', { walletId });
            resolve();
          } catch (error) {
            this.logger.error('Connection recovery failed', { walletId, error });

            this.atomicUpdateConnectionState(walletId, {
              status: 'error',
              error: error as Error,
            });

            this.emit({
              type: 'recovery_failed',
              walletId,
              error: error as Error,
            });

            // Attempt recovery again if within limits - schedule next attempt without recursion
            const updatedState = this.connectionStates.get(walletId);
            if (updatedState && updatedState.attempts < maxAttempts) {
              // Schedule next recovery attempt instead of recursive call
              setTimeout(
                () => {
                  this.startRecovery(walletId, adapter, options).catch((recoveryError) => {
                    this.logger.error('Failed to start next recovery attempt', { walletId, recoveryError });
                  });
                },
                this.calculateRecoveryInterval(recoveryOpts, updatedState.attempts),
              );
              resolve(); // Resolve if we're continuing recovery
            } else {
              // All recovery attempts failed - reject to indicate total failure
              reject(error);
            }
          }
        }, interval);

        this.recoveryTimeouts.set(walletId, timeout);
      });
    });
  }

  private calculateRecoveryInterval(options: ConnectionRecoveryOptions, attempt: number): number {
    const baseInterval = options.reconnectInterval || 5000;
    const strategy = options.recoveryStrategy || 'linear-backoff';

    switch (strategy) {
      case 'immediate':
        return 0;

      case 'exponential-backoff':
        return baseInterval * 2 ** attempt;

      default:
        return baseInterval * (attempt + 1);
    }
  }

  private setupConnectionMonitoring(walletId: string, adapter: WalletAdapter): void {
    // Listen for adapter events to detect disconnections
    adapter.on('connection:lost', () => {
      this.logger.warn('Connection lost detected', { walletId });

      this.atomicUpdateConnectionState(walletId, { status: 'disconnected' });
      this.emit({ type: 'disconnected', walletId, reason: 'connection_lost' });

      // Start recovery if enabled
      const recovery = this.recoveryOptions.get(walletId);
      if (recovery?.autoReconnect) {
        this.startRecovery(walletId, adapter, {}).catch((error) => {
          this.logger.error('Failed to start auto-recovery', { walletId, error });
        });
      }
    });

    adapter.on('accounts:changed', () => {
      this.logger.debug('Accounts changed', { walletId });
      // Could trigger re-validation or session updates here
    });

    adapter.on('chain:changed', () => {
      this.logger.debug('Chain changed', { walletId });
      // Could trigger chain validation or provider updates here
    });
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks().catch((error) => {
        this.logger.error('Health check failed', error);
      });
    }, this.healthCheckIntervalMs);

    this.logger.debug('Health monitoring started', {
      intervalMs: this.healthCheckIntervalMs,
    });
  }

  private async performHealthChecks(): Promise<void> {
    const connectedWallets = Array.from(this.connectionStates.entries()).filter(
      ([, state]) => state.status === 'connected',
    );

    if (connectedWallets.length === 0) {
      return;
    }

    this.logger.debug('Performing health checks', {
      walletCount: connectedWallets.length,
    });

    for (const [walletId, state] of connectedWallets) {
      try {
        // Basic health check - could be enhanced with adapter-specific checks
        const timeSinceLastConnected = Date.now() - state.lastConnected;
        const maxIdleTime = 5 * 60 * 1000; // 5 minutes

        if (timeSinceLastConnected > maxIdleTime) {
          this.logger.warn('Connection appears stale', {
            walletId,
            timeSinceLastConnected,
          });

          // Could trigger a ping or re-validation here
        }
      } catch (error) {
        this.logger.error('Health check failed for wallet', { walletId, error });
      }
    }
  }

  private emit(event: ConnectionEvent): void {
    this.eventTarget.dispatchEvent(new CustomEvent('connection-event', { detail: event }));
  }
}
