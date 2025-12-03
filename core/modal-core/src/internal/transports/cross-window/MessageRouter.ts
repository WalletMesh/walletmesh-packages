/**
 * Message Router for Cross-Window Transport
 *
 * Routes incoming messages to appropriate handlers based on message category.
 * Separates control plane, data plane, and error handling.
 *
 * @module cross-window/MessageRouter
 * @internal
 */

import type { ConnectionStateMachine } from './ConnectionStateMachine.js';
import {
  type DataMessage,
  type ErrorMessage,
  MessageCategory,
  type TransportMessage,
  isControlMessage,
  isDataMessage,
  isErrorMessage,
  isTransportMessage,
} from './protocol.js';

/**
 * Message handler callback types
 */
export type DataMessageHandler = (message: DataMessage) => void | Promise<void>;
export type ErrorMessageHandler = (message: ErrorMessage) => void | Promise<void>;
export type RawMessageHandler = (data: unknown) => void | Promise<void>;

/**
 * Message router configuration
 */
export interface MessageRouterConfig {
  /** Connection state machine for control messages */
  stateMachine: ConnectionStateMachine;
  /** Handler for data plane messages */
  onDataMessage: DataMessageHandler;
  /** Handler for error messages */
  onErrorMessage?: ErrorMessageHandler;
  /** Handler for raw non-protocol messages (for backward compatibility) */
  onRawMessage?: RawMessageHandler;
  /** Whether to validate message sequence numbers */
  validateSequence?: boolean;
  /** Whether to allow out-of-order messages */
  allowOutOfOrder?: boolean;
}

/**
 * Message routing statistics
 */
export interface RoutingStats {
  /** Total messages received */
  messagesReceived: number;
  /** Messages by category */
  byCategory: {
    control: number;
    data: number;
    error: number;
    raw: number;
    invalid: number;
  };
  /** Out of sequence messages */
  outOfSequence: number;
  /** Dropped messages */
  dropped: number;
  /** Last received sequence number */
  lastSequence: number;
}

/**
 * Routes messages to appropriate handlers based on category
 */
export class MessageRouter {
  private readonly config: Required<MessageRouterConfig>;
  private readonly stats: RoutingStats;
  private lastReceivedSequence = -1;
  private expectedSequence = 0;
  private readonly outOfOrderBuffer = new Map<number, TransportMessage>();
  private readonly maxBufferSize = 100;

  constructor(config: MessageRouterConfig) {
    this.config = {
      onErrorMessage: this.defaultErrorHandler.bind(this),
      onRawMessage: this.defaultRawHandler.bind(this),
      validateSequence: true,
      allowOutOfOrder: true,
      ...config,
    };

    this.stats = {
      messagesReceived: 0,
      byCategory: {
        control: 0,
        data: 0,
        error: 0,
        raw: 0,
        invalid: 0,
      },
      outOfSequence: 0,
      dropped: 0,
      lastSequence: -1,
    };
  }

  /**
   * Route an incoming message to the appropriate handler
   */
  async routeMessage(data: unknown): Promise<void> {
    this.stats.messagesReceived++;

    // Check if it's a transport protocol message
    if (!isTransportMessage(data)) {
      // Handle as raw message (backward compatibility)
      this.stats.byCategory.raw++;
      await this.config.onRawMessage(data);
      return;
    }

    const message = data as TransportMessage;

    // Validate sequence if enabled
    if (this.config.validateSequence && !this.validateSequence(message)) {
      return; // Message was either buffered or dropped
    }

    // Route based on category
    await this.routeValidatedMessage(message);
  }

  /**
   * Route a validated message based on its category
   */
  private async routeValidatedMessage(message: TransportMessage): Promise<void> {
    try {
      switch (message.category) {
        case MessageCategory.Control:
          this.stats.byCategory.control++;
          if (isControlMessage(message)) {
            await this.config.stateMachine.handleControlMessage(message);
          }
          break;

        case MessageCategory.Data:
          this.stats.byCategory.data++;
          if (isDataMessage(message)) {
            await this.config.onDataMessage(message);
          }
          break;

        case MessageCategory.Error:
          this.stats.byCategory.error++;
          if (isErrorMessage(message)) {
            await this.config.onErrorMessage(message);
          }
          break;

        default:
          this.stats.byCategory.invalid++;
          console.warn('[MessageRouter] Unknown message category:', message.category);
      }
    } catch (error) {
      console.error('[MessageRouter] Error routing message:', error);
      // Don't throw - continue processing other messages
    }

    // Process any buffered out-of-order messages that can now be delivered
    await this.processBufferedMessages();
  }

  /**
   * Validate message sequence number
   */
  private validateSequence(message: TransportMessage): boolean {
    const { sequence } = message;

    // First message or reset
    if (this.lastReceivedSequence === -1) {
      this.lastReceivedSequence = sequence;
      this.expectedSequence = sequence + 1;
      this.stats.lastSequence = sequence;
      return true;
    }

    // In-order message
    if (sequence === this.expectedSequence) {
      this.lastReceivedSequence = sequence;
      this.expectedSequence = sequence + 1;
      this.stats.lastSequence = sequence;
      return true;
    }

    // Out-of-order message
    if (sequence > this.expectedSequence) {
      this.stats.outOfSequence++;

      if (this.config.allowOutOfOrder) {
        // Buffer for later delivery
        if (this.outOfOrderBuffer.size < this.maxBufferSize) {
          this.outOfOrderBuffer.set(sequence, message);
          return false; // Don't process yet
        }
        // Buffer full, drop oldest
        const oldestKey = Math.min(...this.outOfOrderBuffer.keys());
        this.outOfOrderBuffer.delete(oldestKey);
        this.outOfOrderBuffer.set(sequence, message);
        this.stats.dropped++;
        return false;
      }
      // Drop out-of-order messages
      this.stats.dropped++;
      console.warn(
        `[MessageRouter] Dropped out-of-order message: expected ${this.expectedSequence}, got ${sequence}`,
      );
      return false;
    }

    // Duplicate or old message
    if (sequence <= this.lastReceivedSequence) {
      console.debug(`[MessageRouter] Ignoring duplicate/old message: ${sequence}`);
      return false;
    }

    return true;
  }

  /**
   * Process buffered out-of-order messages
   */
  private async processBufferedMessages(): Promise<void> {
    while (this.outOfOrderBuffer.has(this.expectedSequence)) {
      const message = this.outOfOrderBuffer.get(this.expectedSequence);
      if (message) {
        this.outOfOrderBuffer.delete(this.expectedSequence);
        this.lastReceivedSequence = this.expectedSequence;
        this.expectedSequence++;
        this.stats.lastSequence = message.sequence;
        await this.routeValidatedMessage(message);
      }
    }
  }

  /**
   * Default error message handler
   */
  private defaultErrorHandler(message: ErrorMessage): void {
    console.error('[MessageRouter] Transport error:', message.payload);
  }

  /**
   * Default raw message handler
   */
  private defaultRawHandler(data: unknown): void {
    console.debug('[MessageRouter] Raw message (non-protocol):', data);
  }

  /**
   * Get routing statistics
   */
  getStats(): Readonly<RoutingStats> {
    return { ...this.stats };
  }

  /**
   * Reset router state
   */
  reset(): void {
    this.lastReceivedSequence = -1;
    this.expectedSequence = 0;
    this.outOfOrderBuffer.clear();
    this.stats.messagesReceived = 0;
    this.stats.byCategory = {
      control: 0,
      data: 0,
      error: 0,
      raw: 0,
      invalid: 0,
    };
    this.stats.outOfSequence = 0;
    this.stats.dropped = 0;
    this.stats.lastSequence = -1;
  }

  /**
   * Clear buffered messages
   */
  clearBuffer(): void {
    const size = this.outOfOrderBuffer.size;
    this.outOfOrderBuffer.clear();
    if (size > 0) {
      console.debug(`[MessageRouter] Cleared ${size} buffered messages`);
    }
  }

  /**
   * Get buffer status
   */
  getBufferStatus(): { size: number; sequences: number[] } {
    return {
      size: this.outOfOrderBuffer.size,
      sequences: Array.from(this.outOfOrderBuffer.keys()).sort((a, b) => a - b),
    };
  }
}

/**
 * Create a message router with default configuration
 */
export function createMessageRouter(
  stateMachine: ConnectionStateMachine,
  onDataMessage: DataMessageHandler,
  options?: Partial<Omit<MessageRouterConfig, 'stateMachine' | 'onDataMessage'>>,
): MessageRouter {
  return new MessageRouter({
    stateMachine,
    onDataMessage,
    ...options,
  });
}
