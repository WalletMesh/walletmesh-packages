import { JSONRPCError } from './error.js';
import type { JSONRPCSerializer, JSONRPCSerializedData } from './types.js';
import { isJSONRPCSerializedData } from './utils.js';
import { MessageValidator } from './message-validator.js';

/**
 * Handles serialization and deserialization of JSON-RPC method parameters and results.
 * Supports custom serializers for complex types and provides fallback serialization.
 *
 * @example
 * ```typescript
 * // Create serializer instance
 * const serializer = new ParameterSerializer();
 *
 * // Set fallback serializer for dates
 * serializer.setFallbackSerializer({
 *   params: {
 *     serialize: (value, method) => ({
 *       serialized: value instanceof Date ? value.toISOString() : String(value),
 *       method
 *     }),
 *     deserialize: (data, method) => new Date(data.serialized)
 *   }
 * });
 *
 * // Use serializer
 * const params = { date: new Date() };
 * const serialized = serializer.serializeParams('processDate', params);
 * const deserialized = serializer.deserializeParams('processDate', serialized);
 * ```
 */
export class ParameterSerializer {
  private validator: MessageValidator;
  private fallbackSerializer?: JSONRPCSerializer<unknown, unknown>;

  constructor() {
    this.validator = new MessageValidator();
  }

  /**
   * Sets a fallback serializer to use when no method-specific serializer is available.
   *
   * @param serializer - The serializer to use as fallback
   *
   * @example
   * ```typescript
   * serializer.setFallbackSerializer({
   *   params: {
   *     serialize: (value, method) => ({
   *       serialized: JSON.stringify(value),
   *       method
   *     }),
   *     deserialize: (data, method) => JSON.parse(data.serialized)
   *   }
   * });
   * ```
   */
  public setFallbackSerializer(serializer: JSONRPCSerializer<unknown, unknown>): void {
    this.fallbackSerializer = serializer;
  }

  /**
   * Deserializes method parameters using the provided serializer or fallback.
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
   * const params = serializer.deserializeParams('processDate', {
   *   serialized: '2023-01-01T00:00:00Z',
   *   method: 'processDate'
   * });
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
      // Use fallback serializer if available
      if (this.fallbackSerializer?.params) {
        const serializedData = this.validateSerializedData(params, 'params');

        try {
          const deserializedParams = await this.fallbackSerializer.params.deserialize(method, serializedData);
          if (!this.validator.isValidParams(deserializedParams)) {
            throw new JSONRPCError(-32602, 'Invalid deserialized params format from fallback serializer');
          }
          return deserializedParams as P;
        } catch (error) {
          if (error instanceof JSONRPCError) {
            throw error;
          }
          // For non-Error throws or other errors, treat as server error
          throw new JSONRPCError(-32000, error instanceof Error ? error.message : 'Unknown error');
        }
      }

      return params as P;
    }

    const serializedData = this.validateSerializedData(params, 'params');

    try {
      const deserializedParams = await serializer.params.deserialize(method, serializedData);
      return deserializedParams as P;
    } catch (error) {
      throw new JSONRPCError(-32000, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Serializes method parameters using the provided serializer or fallback.
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
   * const serialized = serializer.serializeParams('processDate', {
   *   date: new Date()
   * });
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
      // Use fallback serializer if available
      if (this.fallbackSerializer?.params) {
        const serializedData = await this.fallbackSerializer.params.serialize(method, params);
        if (!isJSONRPCSerializedData(serializedData)) {
          throw new JSONRPCError(-32602, 'Invalid serialized data format from fallback serializer');
        }
        return { ...serializedData, method };
      }
      return params;
    }
    const serializedData = await serializer.params.serialize(method, params);
    if (!isJSONRPCSerializedData(serializedData)) {
      throw new JSONRPCError(-32602, 'Invalid serialized data format');
    }
    return { ...serializedData, method };
  }

  /**
   * Deserializes method result using the provided serializer or fallback.
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
   * const result = serializer.deserializeResult('processDate', {
   *   serialized: '2023-01-01T00:00:00Z',
   *   method: 'processDate'
   * });
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
      // Use fallback serializer if available
      if (this.fallbackSerializer?.result) {
        const serializedData = this.validateSerializedData(result, 'result');
        try {
          const deserializedResult = await this.fallbackSerializer.result.deserialize(method, serializedData);
          if (!this.validator.isValidValue(deserializedResult)) {
            throw new JSONRPCError(-32602, 'Invalid deserialized result format from fallback serializer');
          }
          return deserializedResult as R;
        } catch (error) {
          if (error instanceof JSONRPCError) {
            throw error;
          }
          throw new JSONRPCError(-32602, 'Invalid deserialized result format from fallback serializer');
        }
      }
      return result as R;
    }

    const serializedData = this.validateSerializedData(result, 'result');
    try {
      const deserializedResult = await serializer.result.deserialize(method, serializedData);
      if (!this.validator.isValidValue(deserializedResult)) {
        throw new JSONRPCError(-32602, 'Invalid serialized data format');
      }
      return deserializedResult as R;
    } catch (error) {
      if (error instanceof JSONRPCError) {
        throw error;
      }
      throw new JSONRPCError(-32602, 'Invalid serialized data format');
    }
  }

  /**
   * Serializes method result using the provided serializer or fallback.
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
   * const serialized = serializer.serializeResult('processDate', new Date());
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
      // Use fallback serializer if available
      if (this.fallbackSerializer?.result) {
        const serializedData = await this.fallbackSerializer.result.serialize(method, result);
        if (!isJSONRPCSerializedData(serializedData)) {
          throw new JSONRPCError(-32602, 'Invalid serialized data format from fallback serializer');
        }
        return { ...serializedData, method };
      }
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
