import type { Transport, TransportType } from './types.js';
import { TransportTypes } from './types.js';

/**
 * No-operation transport implementation for testing purposes.
 *
 * Provides a minimal transport implementation that maintains connection
 * state and message handler registration but performs no actual
 * communication. Useful for testing wallet integration without
 * requiring a real transport mechanism.
 *
 * @implements {Transport}
 *
 * @example
 * ```typescript
 * const transport = new NullTransport();
 * await transport.connect();
 *
 * transport.onMessage((data) => {
 *   console.log('Message received:', data);
 * });
 *
 * // Messages sent are echoed back to the handler
 * await transport.send({ type: 'test' });
 * ```
 *
 * @remarks
 * This transport:
 * - Tracks connection state
 * - Maintains a message handler
 * - Echoes sent messages back to handler
 * - Performs no actual network operations
 */
export class NullTransport implements Transport {
  private connected = false;
  private messageHandler: ((data: unknown) => void) | null = null;

  /**
   * Simulates establishing a connection.
   *
   * @returns Promise that resolves immediately
   *
   * @remarks
   * Simply sets the connected flag to true without
   * performing any actual connection operations.
   */
  async connect(): Promise<void> {
    this.connected = true;
  }

  /**
   * Simulates disconnecting the transport.
   *
   * @returns Promise that resolves immediately
   *
   * @remarks
   * Resets the transport state:
   * - Sets connected flag to false
   * - Clears message handler
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.messageHandler = null;
  }

  /**
   * Simulates sending a message.
   *
   * @param data - Message data to "send"
   * @returns Promise that resolves immediately
   * @throws {Error} If transport is not connected
   *
   * @remarks
   * - Verifies connection state
   * - If a message handler is registered, echoes the message back
   * - Allows testing message flow without actual transport
   *
   * @example
   * ```typescript
   * transport.onMessage(data => {
   *   // Will receive the same data that was sent
   *   console.log('Echo received:', data);
   * });
   *
   * await transport.send({ test: 'data' });
   * ```
   */
  async send(data: unknown): Promise<void> {
    if (!this.connected) {
      throw new Error('Transport not connected');
    }
    // Still a no-op but now checks connection state
    if (this.messageHandler) {
      // Simulate message handling for state changes
      this.messageHandler(data);
    }
  }

  /**
   * Registers a message handler function.
   *
   * @param handler - Function to process "received" messages
   *
   * @remarks
   * The handler will be called with any data passed to send(),
   * simulating a message echo for testing purposes.
   */
  onMessage(handler: (data: unknown) => void): void {
    this.messageHandler = handler;
  }

  /**
   * Removes a message handler function.
   *
   * @param handler - Previously registered handler to remove
   */
  offMessage(handler: (data: unknown) => void): void {
    if (this.messageHandler === handler) {
      this.messageHandler = null;
    }
  }

  getType(): TransportType {
    return TransportTypes.NULL;
  }

  /**
   * Reports the simulated connection state.
   *
   * @returns True if connect() was called and disconnect() wasn't
   *
   * @remarks
   * Provides a way to verify the transport's state in tests
   * and ensure proper connect/disconnect flow.
   */
  isConnected(): boolean {
    return this.connected;
  }
}
