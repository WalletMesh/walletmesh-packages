import type { JSONRPCErrorInterface } from './types.js';

/**
 * JSON-RPC Error class.
 *
 * Represents an error that can occur during JSON-RPC communication.
 */
export class JSONRPCError extends Error implements JSONRPCErrorInterface {
  override name = 'JSONRPCError';

  /**
   * Creates a new JSONRPCError instance.
   *
   * @param code - The error code.
   * @param message - The error message.
   * @param data - Additional error data.
   */
  constructor(
    public code: number,
    message: string,
    public data?: string | Record<string, unknown>,
  ) {
    super(message);
  }

  override toString(): string {
    const msg = `${this.name}(${this.code}): ${this.message}`;
    if (this.data !== undefined) {
      if (typeof this.data === 'string') {
        return `${msg}, Data: ${this.data}`;
      }
      return `${msg}, Data: ${JSON.stringify(this.data)}`;
    }
    return msg;
  }
}
