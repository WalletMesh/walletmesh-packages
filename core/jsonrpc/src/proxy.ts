import { JSONRPCError, TimeoutError } from './error.js';
import { isJSONRPCID } from './utils.js';
import type { JSONRPCTransport, JSONRPCID } from './types.js';

export interface JSONRPCProxyConfig {
  /** Timeout for requests in milliseconds */
  timeoutMs?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Custom logger function */
  logger?: (message: string, data?: unknown) => void;
  /** Chain ID for logging context */
  chainId?: string;
}

/**
 * JSONRPCProxy enables transparent forwarding of JSON-RPC messages
 * without serialization or deserialization. This is useful for routers,
 * gateways, and other intermediaries that need to forward messages
 * without processing their contents.
 *
 * Features:
 * - Transparent message forwarding
 * - Comprehensive logging
 * - Proper timeout handling with JSONRPCError integration
 * - Event forwarding for notifications
 */
export class JSONRPCProxy {
  private pendingRequests = new Map<
    JSONRPCID,
    {
      resolve: (response: unknown) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
      timestamp: number;
      method?: string | undefined;
    }
  >();

  private closed = false;

  constructor(
    private transport: JSONRPCTransport,
    private config: JSONRPCProxyConfig = {},
  ) {
    const { timeoutMs = 30000, debug = false } = config;

    this.log('Proxy initialized', {
      timeoutMs,
      debug,
      chainId: config.chainId,
    });

    // Set up response handler
    transport.onMessage(this.handleResponse.bind(this));
  }

  /**
   * Forward a raw JSON-RPC message and return the response.
   * For notifications (no id), returns undefined.
   * For requests (with id), waits for and returns the response.
   */
  async forward(message: unknown): Promise<unknown> {
    if (this.closed) {
      throw new JSONRPCError(-32000, 'Proxy is closed');
    }

    const id = this.extractId(message);
    const method = this.extractMethod(message);

    this.log('Forwarding message', { id, method, message });

    if (id === undefined) {
      // Notification - fire and forget
      try {
        await this.transport.send(message);
        this.log('Notification forwarded', { method });
        return undefined;
      } catch (error) {
        this.log('Failed to forward notification', { method, error });
        throw error;
      }
    }

    // Request - wait for response
    return new Promise((resolve, reject) => {
      const timeoutMs = this.config.timeoutMs ?? 30000;

      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        this.log('Request timeout', { id, method, timeoutMs });
        reject(new TimeoutError(`Request timeout after ${timeoutMs}ms`, id));
      }, timeoutMs);

      // Store pending request
      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout,
        timestamp: Date.now(),
        method,
      });

      // Send the message
      this.transport
        .send(message)
        .then(() => {
          this.log('Request forwarded', { id, method });
        })
        .catch((error) => {
          this.pendingRequests.delete(id);
          clearTimeout(timeout);
          this.log('Failed to forward request', { id, method, error });
          reject(error);
        });
    });
  }

  /**
   * Handle responses from the transport
   */
  private handleResponse(message: unknown): void {
    const id = this.extractId(message);

    if (id !== undefined && this.pendingRequests.has(id)) {
      const pending = this.pendingRequests.get(id) as NonNullable<
        ReturnType<typeof this.pendingRequests.get>
      >;
      this.pendingRequests.delete(id);
      clearTimeout(pending.timeout);

      this.log('Response received', {
        id,
        method: pending.method,
        duration: Date.now() - pending.timestamp,
      });

      pending.resolve(message);
    } else if (id === undefined) {
      // Handle events/notifications from the server
      const event = this.extractEvent(message);
      if (event) {
        this.log('Event received', { event });
        // Events are forwarded automatically by the transport layer
      }
    }
    // Ignore messages without id or without pending request
  }

  /**
   * Extract ID from a message using existing utility
   */
  private extractId(message: unknown): JSONRPCID | undefined {
    if (message && typeof message === 'object' && 'id' in message) {
      const id = (message as Record<string, unknown>).id;
      return isJSONRPCID(id) ? id : undefined;
    }
    return undefined;
  }

  /**
   * Extract method name from a message
   */
  private extractMethod(message: unknown): string | undefined {
    if (message && typeof message === 'object' && 'method' in message) {
      const method = (message as Record<string, unknown>).method;
      return typeof method === 'string' ? method : undefined;
    }
    return undefined;
  }

  /**
   * Extract event name from a message
   */
  private extractEvent(message: unknown): string | undefined {
    if (message && typeof message === 'object' && 'event' in message) {
      const event = (message as Record<string, unknown>).event;
      return typeof event === 'string' ? event : undefined;
    }
    return undefined;
  }

  /**
   * Log a message using the configured logger
   */
  private log(message: string, data?: unknown): void {
    if (this.config.debug || this.config.logger) {
      const logMessage = this.config.chainId
        ? `[JSONRPCProxy:${this.config.chainId}] ${message}`
        : `[JSONRPCProxy] ${message}`;

      if (this.config.logger) {
        this.config.logger(logMessage, data);
      } else if (this.config.debug) {
        console.log(logMessage, data || '');
      }
    }
  }

  /**
   * Clean up all pending requests and close the proxy
   */
  close(): void {
    if (this.closed) return;

    this.closed = true;
    this.log('Closing proxy', {
      pendingRequests: this.pendingRequests.size,
    });

    // Reject all pending requests
    for (const [, { reject, timeout }] of this.pendingRequests) {
      clearTimeout(timeout);
      reject(new JSONRPCError(-32000, 'Proxy closed'));
    }
    this.pendingRequests.clear();
  }
}
