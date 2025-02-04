import type { JSONRPCID } from './types.js';

/**
 * Validates JSON-RPC 2.0 message formats according to the specification.
 * This class ensures that messages conform to the expected structure and data types
 * before they are processed by the JSON-RPC node.
 *
 * @example
 * ```typescript
 * const validator = new MessageValidator();
 *
 * // Validate a request message
 * const isValid = validator.isValidMessage({
 *   jsonrpc: '2.0',
 *   method: 'add',
 *   params: { a: 1, b: 2 },
 *   id: '123'
 * });
 * ```
 */
export class MessageValidator {
  /**
   * Validates that a message follows the JSON-RPC 2.0 message structure.
   * Checks for required fields and their types based on message type (request, notification, event, or response).
   *
   * @param message - The message to validate
   * @returns True if the message is valid, false otherwise
   *
   * @example
   * ```typescript
   * // Request
   * validator.isValidMessage({
   *   jsonrpc: '2.0',
   *   method: 'add',
   *   params: { a: 1, b: 2 },
   *   id: '123'
   * });
   *
   * // Notification (no id)
   * validator.isValidMessage({
   *   jsonrpc: '2.0',
   *   method: 'log',
   *   params: { message: 'Hello' }
   * });
   *
   * // Event
   * validator.isValidMessage({
   *   jsonrpc: '2.0',
   *   event: 'userJoined',
   *   params: { username: 'Alice' }
   * });
   * ```
   */
  public isValidMessage(message: unknown): boolean {
    if (typeof message !== 'object' || message === null) {
      return false;
    }

    const msg = message as { jsonrpc?: string; method?: unknown; event?: unknown; id?: unknown };
    if (msg.jsonrpc !== '2.0') {
      return false;
    }

    return (
      (typeof msg.method === 'string' &&
        (msg.id === undefined || typeof msg.id === 'string' || typeof msg.id === 'number')) || // Request or notification
      typeof msg.event === 'string' || // Event
      msg.id !== undefined // Response
    );
  }

  /**
   * Validates that an object follows the JSON-RPC 2.0 request structure.
   * A valid request must have a string method name and optional params/id.
   *
   * @param req - The request object to validate
   * @returns Type predicate indicating if the object is a valid request
   *
   * @example
   * ```typescript
   * // Request with named parameters
   * validator.isValidRequest({
   *   method: 'add',
   *   params: { a: 1, b: 2 },
   *   id: '123'
   * });
   *
   * // Request with positional parameters
   * validator.isValidRequest({
   *   method: 'add',
   *   params: [1, 2],
   *   id: '123'
   * });
   * ```
   */
  public isValidRequest(req: unknown): req is {
    method: string;
    params?: unknown;
    id?: JSONRPCID;
  } {
    if (typeof req !== 'object' || req === null) return false;
    const r = req as Record<string, unknown>;

    // Validate method
    if (typeof r.method !== 'string') return false;

    // Validate params if present
    if (r.params !== undefined) {
      if (Array.isArray(r.params)) return true;
      if (typeof r.params === 'object' && r.params !== null) return true;
      return false;
    }

    return true;
  }

  /**
   * Validates that a value is a valid JSON-RPC parameter structure.
   * Parameters must be either an object with valid values or an array of valid values.
   *
   * @param value - The value to validate
   * @returns Type predicate indicating if the value is valid parameters
   *
   * @example
   * ```typescript
   * // Object parameters
   * validator.isValidParams({
   *   name: 'test',
   *   values: [1, 2, 3],
   *   nested: { x: 1, y: 2 }
   * });
   *
   * // Array parameters
   * validator.isValidParams([1, "test", { x: 1 }]);
   * ```
   */
  public isValidParams(value: unknown): value is Record<string, unknown> | unknown[] {
    if (!this.isValidObject(value) && !this.isValidArray(value)) {
      return false;
    }

    // For objects, validate that all values are of expected types
    if (this.isValidObject(value)) {
      // For objects with a 'name' property, it must be a string
      if ('name' in value && typeof value.name !== 'string') {
        return false;
      }
      // Check nested objects recursively
      for (const v of Object.values(value)) {
        if (this.isValidObject(v)) {
          if (!this.isValidParams(v)) {
            return false;
          }
        } else if (!this.isValidValue(v)) {
          return false;
        }
      }
      return true;
    }

    // For arrays, validate each element
    return value.every((v) => this.isValidValue(v));
  }

  /**
   * Validates that a value is a valid JSON-RPC value type.
   * Valid types are: string, number, boolean, null, object (with valid values), or array (of valid values).
   *
   * @param value - The value to validate
   * @returns True if the value is a valid JSON-RPC value, false otherwise
   *
   * @example
   * ```typescript
   * validator.isValidValue("string");     // true
   * validator.isValidValue(42);           // true
   * validator.isValidValue(true);         // true
   * validator.isValidValue(null);         // true
   * validator.isValidValue({ x: 1 });     // true
   * validator.isValidValue([1, 2]);       // true
   * validator.isValidValue(undefined);    // false
   * validator.isValidValue(Symbol());     // false
   * validator.isValidValue(() => {});     // false
   * ```
   */
  public isValidValue(value: unknown): boolean {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    ) {
      return true;
    }

    if (this.isValidObject(value)) {
      return Object.values(value).every((v) => this.isValidValue(v));
    }

    if (this.isValidArray(value)) {
      return value.every((v) => this.isValidValue(v));
    }

    return false;
  }

  /**
   * Validates that a value is a non-null, non-array object.
   *
   * @param value - The value to validate
   * @returns Type predicate indicating if the value is a valid object
   *
   * @example
   * ```typescript
   * validator.isValidObject({});          // true
   * validator.isValidObject({ x: 1 });    // true
   * validator.isValidObject([]);          // false
   * validator.isValidObject(null);        // false
   * validator.isValidObject("string");    // false
   * ```
   */
  public isValidObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Validates that a value is an array.
   *
   * @param value - The value to validate
   * @returns Type predicate indicating if the value is an array
   *
   * @example
   * ```typescript
   * validator.isValidArray([]);           // true
   * validator.isValidArray([1, 2, 3]);    // true
   * validator.isValidArray({});           // false
   * validator.isValidArray("string");     // false
   * ```
   */
  public isValidArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }
}
