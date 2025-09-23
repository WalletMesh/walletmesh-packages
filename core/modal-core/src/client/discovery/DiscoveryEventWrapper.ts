/**
 * Event wrapper for discovery protocol
 *
 * This module wraps the promise-based discovery protocol with an event-based
 * interface for better integration with the existing event-driven architecture.
 *
 * @module client/discovery/DiscoveryEventWrapper
 */

import type { DiscoveryInitiator, QualifiedResponder } from '@walletmesh/discovery';
import type { Logger } from '../../internal/core/logger/logger.js';
import type { DiscoveryConnectionManager } from './types.js';
// Removed unused import

/**
 * Discovery protocol events
 */
export type DiscoveryProtocolEvent =
  | { type: 'discovery_started'; timestamp: number }
  | { type: 'discovery_progress'; progress: number; found: number }
  | { type: 'wallet_found'; wallet: QualifiedResponder; timestamp: number }
  | { type: 'discovery_completed'; wallets: QualifiedResponder[]; duration: number }
  | { type: 'discovery_timeout'; partialResults: QualifiedResponder[] }
  | { type: 'discovery_error'; error: Error; recoverable: boolean }
  | { type: 'connection_requested'; walletId: string }
  | { type: 'connection_established'; walletId: string; sessionId: string }
  | { type: 'connection_failed'; walletId: string; error: Error };

/**
 * Event wrapper configuration
 */
export interface EventWrapperConfig {
  /** Discovery timeout in milliseconds */
  timeout?: number;
  /** Progress update interval in milliseconds */
  progressInterval?: number;
  /** Enable progress events */
  emitProgress?: boolean;
}

/**
 * Wraps discovery protocol with event-based interface
 */
export class DiscoveryEventWrapper {
  private readonly discoveryInitiator: DiscoveryInitiator;
  private readonly connectionManager: DiscoveryConnectionManager;
  private readonly logger: Logger;
  private readonly config: Required<EventWrapperConfig>;
  private readonly eventTarget = new EventTarget();

  private isDiscovering = false;
  private discoveryStartTime = 0;
  private progressTimer: NodeJS.Timeout | undefined;

  constructor(
    discoveryInitiator: DiscoveryInitiator,
    connectionManager: DiscoveryConnectionManager,
    logger: Logger,
    config: EventWrapperConfig = {},
  ) {
    this.discoveryInitiator = discoveryInitiator;
    this.connectionManager = connectionManager;
    this.logger = logger;
    this.config = {
      timeout: config.timeout || 5000,
      progressInterval: config.progressInterval || 500,
      emitProgress: config.emitProgress !== false,
    };
  }

  /**
   * Start discovery with event emissions
   */
  async startDiscovery(): Promise<QualifiedResponder[]> {
    if (this.isDiscovering) {
      this.logger.warn('Discovery already in progress');
      return [];
    }

    this.isDiscovering = true;
    this.discoveryStartTime = Date.now();
    const foundWallets: QualifiedResponder[] = [];

    try {
      // Emit start event
      this.emit({
        type: 'discovery_started',
        timestamp: this.discoveryStartTime,
      });

      // Setup progress tracking if enabled
      if (this.config.emitProgress) {
        this.setupProgressTracking(foundWallets);
      }

      // Start discovery with timeout
      const discoveryPromise = this.discoveryInitiator.startDiscovery();
      const timeoutPromise = this.createTimeout(this.config.timeout);

      const result = await Promise.race([discoveryPromise, timeoutPromise]);

      // Handle timeout
      if (result === 'timeout') {
        this.logger.warn('Discovery timeout reached', {
          timeout: this.config.timeout,
          found: foundWallets.length,
        });

        // Stop discovery if still in progress
        if (this.discoveryInitiator.isDiscovering()) {
          await this.discoveryInitiator.stopDiscovery();
        }

        this.emit({
          type: 'discovery_timeout',
          partialResults: foundWallets,
        });

        return foundWallets;
      }

      // Process results
      const wallets = result as QualifiedResponder[];

      // Emit individual wallet found events
      for (const wallet of wallets) {
        if (!foundWallets.find((w) => w.responderId === wallet.responderId)) {
          foundWallets.push(wallet);
          this.emit({
            type: 'wallet_found',
            wallet,
            timestamp: Date.now(),
          });
        }
      }

      // Emit completion event
      const duration = Date.now() - this.discoveryStartTime;
      this.emit({
        type: 'discovery_completed',
        wallets: foundWallets,
        duration,
      });

      this.logger.info('Discovery completed successfully', {
        found: foundWallets.length,
        duration,
      });

      return foundWallets;
    } catch (error) {
      // Handle both Error objects and ModalError objects
      const err =
        error instanceof Error
          ? error
          : error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
            ? new Error(error.message)
            : new Error(String(error));

      this.logger.error('Discovery failed', err);

      this.emit({
        type: 'discovery_error',
        error: err,
        recoverable: this.isRecoverableError(err),
      });

      throw err;
    } finally {
      this.isDiscovering = false;
      this.cleanupProgressTracking();
    }
  }

  /**
   * Stop discovery if in progress
   */
  async stopDiscovery(): Promise<void> {
    if (!this.isDiscovering) {
      return;
    }

    try {
      if (this.discoveryInitiator.isDiscovering()) {
        await this.discoveryInitiator.stopDiscovery();
      }
    } catch (error) {
      this.logger.error('Failed to stop discovery', error);
    } finally {
      this.isDiscovering = false;
      this.cleanupProgressTracking();
    }
  }

  /**
   * Establish connection to a discovered wallet
   */
  async connectToWallet(wallet: QualifiedResponder): Promise<{ sessionId: string; transport: unknown }> {
    try {
      this.emit({
        type: 'connection_requested',
        walletId: wallet.responderId,
      });

      // Use connection manager to establish connection
      const connection = await this.connectionManager.connect(wallet, {
        requestedChains: [],
        requestedPermissions: [],
      });

      this.emit({
        type: 'connection_established',
        walletId: wallet.responderId,
        sessionId: connection.connectionId || 'unknown',
      });

      // Return connection info with required fields
      return {
        sessionId: connection.connectionId || 'unknown',
        transport: connection,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      this.emit({
        type: 'connection_failed',
        walletId: wallet.responderId,
        error: err,
      });

      throw err;
    }
  }

  /**
   * Add event listener
   */
  addEventListener(callback: (event: DiscoveryProtocolEvent) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<DiscoveryProtocolEvent>;
      callback(customEvent.detail);
    };

    this.eventTarget.addEventListener('discovery-protocol-event', handler);

    return () => {
      this.eventTarget.removeEventListener('discovery-protocol-event', handler);
    };
  }

  /**
   * Setup progress tracking
   */
  private setupProgressTracking(foundWallets: QualifiedResponder[]): void {
    let lastCount = 0;

    this.progressTimer = setInterval(() => {
      const currentCount = foundWallets.length;
      const elapsed = Date.now() - this.discoveryStartTime;
      const progress = Math.min((elapsed / this.config.timeout) * 100, 100);

      if (currentCount !== lastCount || progress % 10 === 0) {
        this.emit({
          type: 'discovery_progress',
          progress,
          found: currentCount,
        });
        lastCount = currentCount;
      }
    }, this.config.progressInterval);
  }

  /**
   * Cleanup progress tracking
   */
  private cleanupProgressTracking(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = undefined;
    }
  }

  /**
   * Create timeout promise
   */
  private createTimeout(ms: number): Promise<'timeout'> {
    return new Promise((resolve) => {
      setTimeout(() => resolve('timeout'), ms);
    });
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverableError(error: Error): boolean {
    const recoverablePatterns = ['timeout', 'network', 'connection', 'temporary'];

    const message = error.message.toLowerCase();
    return recoverablePatterns.some((pattern) => message.includes(pattern));
  }

  /**
   * Emit event
   */
  private emit(event: DiscoveryProtocolEvent): void {
    this.eventTarget.dispatchEvent(new CustomEvent('discovery-protocol-event', { detail: event }));
  }
}
