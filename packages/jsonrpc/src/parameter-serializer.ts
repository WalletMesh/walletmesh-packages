import { JSONRPCError } from './error.js';
import type { JSONRPCSerializer, JSONRPCSerializedData } from './types.js';
import { isJSONRPCSerializedData } from './utils.js';
import { MessageValidator } from './message-validator.js';

/**
 * Handles serialization and deserialization of JSON-RPC method parameters and results.
 * This class ensures complex types can be safely transmitted over JSON-RPC by converting
 * them to/from a JSON-compatible format.
 *
 * @example
 * ```typescript
 * const serializer = new ParameterSerializer();
 *
 * // Serialize parameters with a custom serializer
 * const params = { date: new Date() };
 * const serialized = serializer.serializeParams(params, dateSerializer);
 *
 * // Deserialize parameters
 * const deserialized = serializer.deserializeParams(serialized, dateSerializer);
 * ```
 */
export class ParameterSerializer {
  private validator: MessageValidator;
  private fallbackSerializer?: JSONRPCSerializer<unknown, unknown>;

  constructor() {
    this.validator = new MessageValidator();
  }

  /**
   * Sets a fallback serializer to be used when no method-specific serializer is provided.
   *
   * @param serializer - The serializer to use as fallback
   * @example
   * ```typescript
   * const serializer = new ParameterSerializer();
   *
   * // Set a fallback serializer for handling dates
   * serializer.setFallbackSerializer({
   *   params: {
   *     serialize: value => ({ serialized: value instanceof Date ? value.toISOString() : String(value) }),
   *     deserialize: data => new Date(data.serialized)
   *   },
   *   result: {
   *     serialize: value => ({ serialized: value instanceof Date ? value.toISOString() : String(value) }),
   *     deserialize: data => new Date(data.serialized)
   *   }
   * });
   * ```
   */
  public setFallbackSerializer(serializer: JSONRPCSerializer<unknown, unknown>): void {
    this.fallbackSerializer = serializer;
  }

  /**
   * Serializes method parameters using the provided serializer.
   * If no serializer is provided or parameters are undefined/null, returns the original parameters.
   *
   * @typeParam P - The parameters type
   * @typeParam R - The result type
   * @param params - The parameters to serialize
   * @param serializer - Optional serializer for converting parameters
   * @returns The serialized parameters or the original parameters if no serializer
   * @throws {JSONRPCError} If serialization fails or produces invalid data
   *
   * @example
   * ```typescript
   * const params = { date: new Date() };
   * const serialized = serializer.serializeParams(params, {
   *   params: {
   *     serialize: date => ({ serialized: date.toISOString() }),
   *     deserialize: data => new Date(data.serialized)
   *   }
   * });
   * ```
   */
  public serializeParams<P, R>(
    params: P | undefined,
    serializer?: JSONRPCSerializer<P, R>,
  ): P | JSONRPCSerializedData | undefined {
    if (params === undefined || params === null) {
      return undefined;
    }
    if (!serializer?.params) {
      // Use fallback serializer if available
      if (this.fallbackSerializer?.params) {
        const serializedData = this.fallbackSerializer.params.serialize(params);
        if (!isJSONRPCSerializedData(serializedData)) {
          throw new JSONRPCError(-32602, 'Invalid serialized data format from fallback serializer');
        }
        return serializedData;
      }
      return params;
    }
    const serializedData = serializer.params.serialize(params);
    if (!isJSONRPCSerializedData(serializedData)) {
      throw new JSONRPCError(-32602, 'Invalid serialized data format');
    }
    return serializedData;
  }

  /**
   * Deserializes method parameters using the provided serializer.
   * If no serializer is provided, validates and returns the original parameters.
   *
   * @typeParam P - The parameters type
   * @typeParam R - The result type
   * @param params - The parameters to deserialize
   * @param serializer - Optional serializer for converting parameters
   * @returns The deserialized parameters
   * @throws {JSONRPCError} If deserialization fails or produces invalid data
   *
   * @example
   * ```typescript
   * const serialized = { serialized: '2023-12-31T00:00:00.000Z' };
   * const deserialized = serializer.deserializeParams(serialized, {
   *   params: {
   *     serialize: date => ({ serialized: date.toISOString() }),
   *     deserialize: data => new Date(data.serialized)
   *   }
   * });
   * ```
   */
  public deserializeParams<P, R>(params: unknown, serializer?: JSONRPCSerializer<P, R>): P | undefined {
    if (!params) {
      return undefined;
    }

    if (!serializer?.params) {
      // Use fallback serializer if available
      if (this.fallbackSerializer?.params) {
        const serializedData = this.validateSerializedData(params, 'params');

        try {
          const deserializedParams = this.fallbackSerializer.params.deserialize(serializedData);
          if (!this.validator.isValidParams(deserializedParams)) {
            throw new JSONRPCError(-32602, 'Invalid deserialized params format from fallback serializer');
          }
          return deserializedParams as P;
        } catch (error) {
          throw new JSONRPCError(-32000, error instanceof Error ? error.message : 'Unknown error');
        }
      }

      if (!this.validator.isValidParams(params)) {
        throw new JSONRPCError(-32602, 'Invalid params format');
      }
      return params as P;
    }

    const serializedData = this.validateSerializedData(params, 'params');

    let deserializedParams: unknown;
    try {
      deserializedParams = serializer.params.deserialize(serializedData);
    } catch (error) {
      throw new JSONRPCError(-32000, error instanceof Error ? error.message : 'Unknown error');
    }
    if (!this.validator.isValidParams(deserializedParams)) {
      throw new JSONRPCError(-32602, 'Invalid deserialized params format');
    }

    return deserializedParams as P;
  }

  /**
   * Serializes a method result using the provided serializer.
   * If no serializer is provided or result is undefined/null, returns the original result.
   *
   * @typeParam P - The parameters type
   * @typeParam R - The result type
   * @param result - The result to serialize
   * @param serializer - Optional serializer for converting the result
   * @returns The serialized result or the original result if no serializer
   * @throws {JSONRPCError} If serialization fails or produces invalid data
   *
   * @example
   * ```typescript
   * const result = new Date();
   * const serialized = serializer.serializeResult(result, {
   *   result: {
   *     serialize: date => ({ serialized: date.toISOString() }),
   *     deserialize: data => new Date(data.serialized)
   *   }
   * });
   * ```
   */
  public serializeResult<P, R>(
    result: R | undefined,
    serializer?: JSONRPCSerializer<P, R>,
  ): R | JSONRPCSerializedData | undefined {
    if (result === undefined || result === null) {
      return undefined;
    }
    if (!serializer?.result) {
      // Use fallback serializer if available
      if (this.fallbackSerializer?.result) {
        const serializedData = this.fallbackSerializer.result.serialize(result);
        if (!isJSONRPCSerializedData(serializedData)) {
          throw new JSONRPCError(-32602, 'Invalid serialized data format from fallback serializer');
        }
        return serializedData;
      }
      return result;
    }
    const serializedData = serializer.result.serialize(result);
    if (!isJSONRPCSerializedData(serializedData)) {
      throw new JSONRPCError(-32602, 'Invalid serialized data format');
    }
    return serializedData;
  }

  private validateSerializedData(data: unknown, type: 'params' | 'result'): { serialized: string } {
    if (!this.validator.isValidObject(data)) {
      throw new JSONRPCError(-32602, `Invalid ${type} format for serialization`);
    }

    const obj = data as Record<string, unknown>;
    if (!('serialized' in obj) || typeof obj.serialized !== 'string') {
      throw new JSONRPCError(-32602, 'Invalid serialized data format');
    }

    const serializedData = { serialized: obj.serialized };
    if (!isJSONRPCSerializedData(serializedData)) {
      throw new JSONRPCError(-32602, 'Invalid serialized data structure');
    }

    return serializedData;
  }

  /**
   * Deserializes a method result using the provided serializer.
   * If no serializer is provided, returns the original result.
   *
   * @typeParam P - The parameters type
   * @typeParam R - The result type
   * @param result - The result to deserialize
   * @param serializer - Optional serializer for converting the result
   * @returns The deserialized result
   * @throws {JSONRPCError} If deserialization fails or produces invalid data
   *
   * @example
   * ```typescript
   * const serialized = { serialized: '2023-12-31T00:00:00.000Z' };
   * const deserialized = serializer.deserializeResult(serialized, {
   *   result: {
   *     serialize: date => ({ serialized: date.toISOString() }),
   *     deserialize: data => new Date(data.serialized)
   *   }
   * });
   * ```
   */
  public deserializeResult<P, R>(result: unknown, serializer?: JSONRPCSerializer<P, R>): R | undefined {
    if (!result) {
      return undefined;
    }

    if (!serializer?.result) {
      // Use fallback serializer if available
      if (this.fallbackSerializer?.result) {
        const serializedData = this.validateSerializedData(result, 'result');
        try {
          const deserializedResult = this.fallbackSerializer.result.deserialize(serializedData);
          if (!this.validator.isValidValue(deserializedResult)) {
            throw new JSONRPCError(-32602, 'Invalid deserialized result format from fallback serializer');
          }
          return deserializedResult as R;
        } catch (error) {
          throw new JSONRPCError(-32602, 'Invalid deserialized result format from fallback serializer');
        }
      }
      return result as R;
    }

    const serializedData = this.validateSerializedData(result, 'result');
    let deserializedResult: unknown;
    try {
      deserializedResult = serializer.result.deserialize(serializedData);
    } catch (error) {
      throw new JSONRPCError(-32602, 'Invalid serialized data format');
    }

    if (!this.validator.isValidValue(deserializedResult)) {
      throw new JSONRPCError(-32602, 'Invalid serialized data format');
    }

    return deserializedResult as R;
  }
}
