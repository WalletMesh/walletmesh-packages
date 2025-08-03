import type { JSONRPCSerializer } from '@walletmesh/jsonrpc';
import type { MethodCall } from './types.js';

/**
 * A method call with potentially serialized parameters
 * @public
 */
export interface SerializedMethodCall {
  method: string;
  params?: unknown;
}

/**
 * Registry for method-specific serializers in the router provider.
 * This allows registering serializers for the actual wallet methods
 * (e.g., aztec_getAddress) rather than the wrapper method (wm_call).
 */
export class ProviderSerializerRegistry {
  private serializers = new Map<string, JSONRPCSerializer<unknown, unknown>>();

  /**
   * Register a serializer for a specific method
   */
  register<P, R>(method: string, serializer: JSONRPCSerializer<P, R>): void {
    this.serializers.set(method, serializer);
  }

  /**
   * Get a serializer for a method, if registered
   */
  get(method: string): JSONRPCSerializer<unknown, unknown> | undefined {
    return this.serializers.get(method);
  }

  /**
   * Check if a method has a registered serializer
   */
  has(method: string): boolean {
    return this.serializers.has(method);
  }

  /**
   * Serialize a method call (including its parameters)
   */
  async serializeCall(call: MethodCall<string>): Promise<SerializedMethodCall> {
    const method = call.method;
    const serializer = this.get(method);

    if (serializer?.params && call.params !== undefined) {
      const result = await serializer.params.serialize(method, call.params);
      return {
        ...call,
        params: result,
      };
    }

    return call as SerializedMethodCall;
  }

  /**
   * Deserialize a result from a method call
   */
  async deserializeResult(method: string, result: unknown): Promise<unknown> {
    const serializer = this.get(method);

    // Check if result is in serialized format
    if (serializer?.result && this.isSerializedResult(result)) {
      return await serializer.result.deserialize(method, result);
    }

    return result;
  }

  /**
   * Type guard to check if a result object matches the expected structure for serialized data.
   * @param result - The result object to check.
   * @returns True if the result is in the serialized format, false otherwise.
   */
  private isSerializedResult(result: unknown): result is { serialized: string; method: string } {
    return result !== null && typeof result === 'object' && 'serialized' in result && 'method' in result;
  }
}
