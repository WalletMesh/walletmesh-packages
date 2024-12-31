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

  constructor() {
    this.validator = new MessageValidator();
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
      if (!this.validator.isValidParams(params)) {
        throw new JSONRPCError(-32602, 'Invalid params format');
      }
      return params as P;
    }

    if (!this.validator.isValidObject(params)) {
      throw new JSONRPCError(-32602, 'Invalid params format for serialization');
    }

    if (!('serialized' in params) || typeof params.serialized !== 'string') {
      throw new JSONRPCError(-32602, 'Invalid serialized data format');
    }

    const serializedData = { serialized: params.serialized };
    if (!isJSONRPCSerializedData(serializedData)) {
      throw new JSONRPCError(-32602, 'Invalid serialized data structure');
    }

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
      return result;
    }
    const serializedData = serializer.result.serialize(result);
    if (!isJSONRPCSerializedData(serializedData)) {
      throw new JSONRPCError(-32602, 'Invalid serialized data format');
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
      return result as R;
    }

    if (!this.validator.isValidObject(result)) {
      throw new JSONRPCError(-32602, 'Invalid result format for serialization');
    }

    if (!('serialized' in result) || typeof result.serialized !== 'string') {
      throw new JSONRPCError(-32602, 'Invalid serialized data format');
    }

    const serializedData = { serialized: result.serialized };
    if (!isJSONRPCSerializedData(serializedData)) {
      throw new JSONRPCError(-32602, 'Invalid serialized data structure');
    }

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
