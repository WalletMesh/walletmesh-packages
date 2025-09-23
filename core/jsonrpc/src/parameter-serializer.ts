import { JSONRPCError } from './error.js';
import { MessageValidator } from './message-validator.js';
import type { JSONRPCSerializedData, JSONRPCSerializer } from './types.js';
import { isJSONRPCSerializedData } from './utils.js';

/**
 * Handles serialization and deserialization of JSON-RPC method parameters and results.
 * Supports custom serializers for complex types.
 *
 * @example
 * ```typescript
 * // Create serializer instance
 * const serializer = new ParameterSerializer();
 *
 * // Use serializer with a custom serializer
 * const customSerializer = {
 *   params: {
 *     serialize: (method, value) => ({
 *       serialized: value instanceof Date ? value.toISOString() : String(value),
 *       method
 *     }),
 *     deserialize: (method, data) => new Date(data.serialized)
 *   }
 * };
 *
 * // Serialize and deserialize with custom serializer
 * const params = { date: new Date() };
 * const serialized = await serializer.serializeParams('processDate', params, customSerializer);
 * const deserialized = await serializer.deserializeParams('processDate', serialized, customSerializer);
 * ```
 */
export class ParameterSerializer {
  private validator: MessageValidator;

  constructor() {
    this.validator = new MessageValidator();
  }

  /**
   * Deserializes method parameters using the provided serializer.
   *
   * @param method - The method name associated with these parameters
   * @param params - The parameters to deserialize
   * @param serializer - Optional method-specific serializer
   * @returns The deserialized parameters
   * @throws {JSONRPCError} If deserialization fails or produces invalid data
   *
   * @example
   * ```typescript
   * // Deserialize date parameter
   * const params = await serializer.deserializeParams('processDate', {
   *   serialized: '2023-01-01T00:00:00Z',
   *   method: 'processDate'
   * }, dateSerializer);
   * ```
   */
  public async deserializeParams<P, R>(
    method: string,
    params: unknown,
    serializer?: JSONRPCSerializer<P, R>,
  ): Promise<P | undefined> {
    if (!params) {
      return undefined;
    }

    if (!serializer?.params) {
      return params as P;
    }

    try {
      const serializedData = this.validateSerializedData(params, 'params');
      const deserializedParams = await serializer.params.deserialize(method, serializedData);
      return deserializedParams as P;
    } catch (error) {
      if (error instanceof JSONRPCError) {
        throw error;
      }
      throw new JSONRPCError(-32000, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Serializes method parameters using the provided serializer.
   *
   * @param method - The method name associated with these parameters
   * @param params - The parameters to serialize
   * @param serializer - Optional method-specific serializer
   * @returns The serialized parameters
   * @throws {JSONRPCError} If serialization fails or produces invalid format
   *
   * @example
   * ```typescript
   * // Serialize date parameter
   * const serialized = await serializer.serializeParams('processDate', {
   *   date: new Date()
   * }, dateSerializer);
   * ```
   */
  public async serializeParams<P, R>(
    method: string,
    params: P | undefined,
    serializer?: JSONRPCSerializer<P, R>,
  ): Promise<P | JSONRPCSerializedData | undefined> {
    if (params === undefined || params === null) {
      return undefined;
    }
    if (!serializer?.params) {
      return params;
    }
    const serializedData = await serializer.params.serialize(method, params);
    if (!isJSONRPCSerializedData(serializedData)) {
      throw new JSONRPCError(-32602, 'Invalid serialized data format');
    }
    return { ...serializedData, method };
  }

  /**
   * Deserializes method result using the provided serializer.
   *
   * @param method - The method name associated with this result
   * @param result - The result to deserialize
   * @param serializer - Optional method-specific serializer
   * @returns The deserialized result
   * @throws {JSONRPCError} If deserialization fails or produces invalid data
   *
   * @example
   * ```typescript
   * // Deserialize date result
   * const result = await serializer.deserializeResult('processDate', {
   *   serialized: '2023-01-01T00:00:00Z',
   *   method: 'processDate'
   * }, dateSerializer);
   * ```
   */
  public async deserializeResult<P, R>(
    method: string,
    result: unknown,
    serializer?: JSONRPCSerializer<P, R>,
  ): Promise<R | undefined> {
    if (!result) {
      return undefined;
    }

    if (!serializer?.result) {
      return result as R;
    }

    const serializedData = this.validateSerializedData(result, 'result');
    try {
      const deserializedResult = await serializer.result.deserialize(method, serializedData);
      // Don't validate the deserialized result with isValidValue because custom serializers
      // are specifically designed to handle non-JSON types like class instances
      return deserializedResult as R;
    } catch (error) {
      if (error instanceof JSONRPCError) {
        throw error;
      }
      throw new JSONRPCError(-32602, 'Invalid serialized data format');
    }
  }

  /**
   * Serializes method result using the provided serializer.
   *
   * @param method - The method name associated with this result
   * @param result - The result to serialize
   * @param serializer - Optional method-specific serializer
   * @returns The serialized result
   * @throws {JSONRPCError} If serialization fails or produces invalid format
   *
   * @example
   * ```typescript
   * // Serialize date result
   * const serialized = await serializer.serializeResult('processDate', new Date(), dateSerializer);
   * ```
   */
  public async serializeResult<P, R>(
    method: string,
    result: R | undefined,
    serializer?: JSONRPCSerializer<P, R>,
  ): Promise<R | JSONRPCSerializedData | undefined> {
    if (result === undefined || result === null) {
      return undefined;
    }
    if (!serializer?.result) {
      return result;
    }
    const serializedData = await serializer.result.serialize(method, result);
    if (!isJSONRPCSerializedData(serializedData)) {
      throw new JSONRPCError(-32602, 'Invalid serialized data format');
    }
    return { ...serializedData, method };
  }

  /**
   * Validates that data matches the JSONRPCSerializedData format.
   *
   * @param data - The data to validate
   * @param type - Whether this is for parameters or result
   * @returns The validated data
   * @throws {JSONRPCError} If the data format is invalid
   */
  private validateSerializedData(data: unknown, type: 'params' | 'result'): JSONRPCSerializedData {
    if (!this.validator.isValidObject(data)) {
      throw new JSONRPCError(-32602, `Invalid ${type} format for serialization`);
    }

    const obj = data as Record<string, unknown>;
    if (!('serialized' in obj) || typeof obj.serialized !== 'string') {
      throw new JSONRPCError(-32602, 'Invalid serialized data format');
    }

    if (!isJSONRPCSerializedData(obj)) {
      throw new JSONRPCError(-32602, 'Invalid serialized data structure');
    }

    return obj;
  }
}
