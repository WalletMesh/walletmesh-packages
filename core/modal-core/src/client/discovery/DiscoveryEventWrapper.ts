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
  | { type: 'discovery_started'; timestamp: number; sessionId?: string }
  | { type: 'discovery_progress'; progress: number; found: number; sessionId?: string }
  | { type: 'wallet_found'; wallet: QualifiedResponder; timestamp: number; sessionId: string }
  | { type: 'discovery_completed'; wallets: QualifiedResponder[]; duration: number; sessionId?: string }
  | { type: 'discovery_timeout'; partialResults: QualifiedResponder[]; sessionId?: string }
  | { type: 'discovery_error'; error: Error; recoverable: boolean; sessionId?: string }
  | { type: 'connection_requested'; walletId: string; sessionId?: string }
  | { type: 'connection_established'; walletId: string; sessionId: string }
  | { type: 'connection_failed'; walletId: string; error: Error; sessionId?: string };

interface ActiveSession {
  initiator: DiscoveryInitiator;
  foundWallets: QualifiedResponder[];
  startTime: number;
  wrapperSessionId: string;
  protocolSessionId?: string;
  progressTimer?: NodeJS.Timeout;
  cancelTimeout: () => void;
}

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
  private discoveryInitiator: DiscoveryInitiator;
  private readonly connectionManager: DiscoveryConnectionManager;
  private readonly logger: Logger;
  private readonly config: Required<EventWrapperConfig>;
  private readonly eventTarget = new EventTarget();
  private readonly activeSessions = new Map<string, ActiveSession>();

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
   * Update the discovery initiator instance
   * This allows using a fresh initiator for each discovery session
   */
  updateDiscoveryInitiator(discoveryInitiator: DiscoveryInitiator): void {
    this.discoveryInitiator = discoveryInitiator;
    this.logger.debug('Updated discovery initiator instance');
  }

  /**
   * Start discovery with event emissions
   */
  async startDiscovery(initiator?: DiscoveryInitiator): Promise<QualifiedResponder[]> {
    const discoveryInitiator = initiator ?? this.discoveryInitiator;

    if (!discoveryInitiator) {
      throw new Error('No discovery initiator available for discovery session');
    }

    const startTime = Date.now();
    const foundWallets: QualifiedResponder[] = [];
    const wrapperSessionId = this.generateSessionId();

    const { promise: timeoutPromise, cancel: cancelTimeout } = this.createTimeout(this.config.timeout);
    const discoveryPromise = discoveryInitiator.startDiscovery();

    const session: ActiveSession = {
      initiator: discoveryInitiator,
      foundWallets,
      startTime,
      wrapperSessionId,
      cancelTimeout,
    };

    if (this.config.emitProgress) {
      session.progressTimer = this.setupProgressTracking(session);
    }

    this.activeSessions.set(wrapperSessionId, session);

    try {
      this.emit({
        type: 'discovery_started',
        timestamp: startTime,
        sessionId: wrapperSessionId,
      });

      const result = await Promise.race([discoveryPromise, timeoutPromise]);

      if (result === 'timeout') {
        const timeoutSessionId = session.protocolSessionId ?? wrapperSessionId;

        this.logger.warn('Discovery timeout reached', {
          timeout: this.config.timeout,
          found: foundWallets.length,
          sessionId: timeoutSessionId,
        });

        try {
          if (discoveryInitiator.isDiscovering()) {
            await discoveryInitiator.stopDiscovery();
          }
        } catch (error) {
          this.logger.warn('Failed to stop discovery after timeout', {
            sessionId: timeoutSessionId,
            error,
          });
        }

        this.emit({
          type: 'discovery_timeout',
          partialResults: foundWallets,
          sessionId: timeoutSessionId,
        });

        return foundWallets;
      }

      const wallets = result as QualifiedResponder[];
      this.logger.debug('[DiscoveryEventWrapper] Discovery resolved with wallets', {
        wrapperSessionId,
        walletCount: wallets.length,
        responderIds: wallets.map((wallet) => wallet.responderId),
      });

      for (const wallet of wallets) {
        if (!foundWallets.find((w) => w.responderId === wallet.responderId)) {
          foundWallets.push(wallet);

          const protocolSessionId = wallet.sessionId ?? session.protocolSessionId ?? wrapperSessionId;
          session.protocolSessionId = protocolSessionId;

          this.emit({
            type: 'wallet_found',
            wallet,
            timestamp: Date.now(),
            sessionId: protocolSessionId,
          });
        }
      }

      const duration = Date.now() - startTime;
      const completionSessionId = session.protocolSessionId ?? wrapperSessionId;

      this.emit({
        type: 'discovery_completed',
        wallets: foundWallets,
        duration,
        sessionId: completionSessionId,
      });

      this.logger.info('Discovery completed successfully', {
        found: foundWallets.length,
        duration,
        sessionId: completionSessionId,
      });

      return foundWallets;
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
            ? new Error(error.message)
            : new Error(String(error));

      const errorSessionId = session.protocolSessionId ?? wrapperSessionId;
      this.logger.error('Discovery failed', { error: err, sessionId: errorSessionId });

      this.emit({
        type: 'discovery_error',
        error: err,
        recoverable: this.isRecoverableError(err),
        sessionId: errorSessionId,
      });

      throw err;
    } finally {
      this.cleanupSession(wrapperSessionId);
    }
  }

  /**
   * Stop discovery if in progress
   */
  async stopDiscovery(): Promise<void> {
    if (this.activeSessions.size === 0) {
      return;
    }

    const sessions = Array.from(this.activeSessions.entries());

    for (const [wrapperSessionId, session] of sessions) {
      try {
        if (session.initiator.isDiscovering()) {
          await session.initiator.stopDiscovery();
        }
      } catch (error) {
        this.logger.error('Failed to stop discovery session', { sessionId: wrapperSessionId, error });
      } finally {
        this.cleanupSession(wrapperSessionId);
      }
    }
  }

  /**
   * Establish connection to a discovered wallet
   */
  async connectToWallet(
    wallet: QualifiedResponder,
    sessionId?: string,
  ): Promise<{ sessionId: string; transport: unknown }> {
    try {
      this.emit({
        type: 'connection_requested',
        walletId: wallet.responderId,
        ...(sessionId ? { sessionId } : {}),
      });

      // Use connection manager to establish connection
      const connection = await this.connectionManager.connect(wallet, {
        requestedChains: [],
        requestedPermissions: [],
      });

      const resolvedSessionId = sessionId ?? connection.connectionId ?? 'unknown';

      this.emit({
        type: 'connection_established',
        walletId: wallet.responderId,
        sessionId: resolvedSessionId,
      });

      // Return connection info with required fields
      return {
        sessionId: resolvedSessionId,
        transport: connection,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      this.emit({
        type: 'connection_failed',
        walletId: wallet.responderId,
        error: err,
        ...(sessionId ? { sessionId } : {}),
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
   * Clean up all resources and event listeners
   */
  cleanup(): void {
    // Stop any ongoing discovery
    if (this.activeSessions.size > 0) {
      try {
        this.stopDiscovery();
      } catch (error) {
        this.logger.warn('Error stopping discovery during cleanup', error);
      }
    }

    this.activeSessions.clear();
  }

  /**
   * Setup progress tracking for a specific session
   */
  private setupProgressTracking(session: ActiveSession): NodeJS.Timeout {
    let lastCount = 0;

    return setInterval(() => {
      const currentCount = session.foundWallets.length;
      const elapsed = Date.now() - session.startTime;
      const progress = Math.min((elapsed / this.config.timeout) * 100, 100);

      if (currentCount !== lastCount || progress % 10 === 0) {
        const progressSessionId = session.protocolSessionId ?? session.wrapperSessionId;
        this.emit({
          type: 'discovery_progress',
          progress,
          found: currentCount,
          sessionId: progressSessionId,
        });
        lastCount = currentCount;
      }
    }, this.config.progressInterval);
  }

  /**
   * Cleanup progress tracking for a specific session
   */
  private cleanupProgressTracking(session: ActiveSession): void {
    if (session.progressTimer) {
      clearInterval(session.progressTimer);
      delete session.progressTimer;
    }
  }

  /**
   * Create timeout promise with cancellation
   */
  private createTimeout(ms: number): { promise: Promise<'timeout'>; cancel: () => void } {
    let timer: NodeJS.Timeout | undefined;

    const promise = new Promise<'timeout'>((resolve) => {
      timer = setTimeout(() => resolve('timeout'), ms);
    });

    return {
      promise,
      cancel: () => {
        if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }
      },
    };
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

  private cleanupSession(wrapperSessionId: string): void {
    const session = this.activeSessions.get(wrapperSessionId);
    if (!session) {
      return;
    }

    session.cancelTimeout();
    this.cleanupProgressTracking(session);
    this.activeSessions.delete(wrapperSessionId);
  }

  private generateSessionId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `session-${Math.random().toString(36).slice(2)}`;
  }
}
