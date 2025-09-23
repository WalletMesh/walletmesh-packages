import type { JSONRPCSerializer } from '@walletmesh/jsonrpc';
import { describe, expect, it, vi } from 'vitest';
import { ProviderSerializerRegistry } from './provider-serialization.js';
import type { MethodCall } from './types.js';

describe('ProviderSerializerRegistry', () => {
  describe('register', () => {
    it('should register a serializer for a method', () => {
      const registry = new ProviderSerializerRegistry();
      const serializer: JSONRPCSerializer<unknown, unknown> = {
        params: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
        result: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
      };

      registry.register('test_method', serializer);

      expect(registry.has('test_method')).toBe(true);
      expect(registry.get('test_method')).toBe(serializer);
    });

    it('should overwrite existing serializer for the same method', () => {
      const registry = new ProviderSerializerRegistry();
      const serializer1: JSONRPCSerializer<unknown, unknown> = {
        params: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
      };
      const serializer2: JSONRPCSerializer<unknown, unknown> = {
        params: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
      };

      registry.register('test_method', serializer1);
      registry.register('test_method', serializer2);

      expect(registry.get('test_method')).toBe(serializer2);
    });
  });

  describe('get', () => {
    it('should return undefined for unregistered method', () => {
      const registry = new ProviderSerializerRegistry();

      expect(registry.get('unknown_method')).toBeUndefined();
    });

    it('should return the registered serializer', () => {
      const registry = new ProviderSerializerRegistry();
      const serializer: JSONRPCSerializer<unknown, unknown> = {
        params: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
      };

      registry.register('test_method', serializer);

      expect(registry.get('test_method')).toBe(serializer);
    });
  });

  describe('has', () => {
    it('should return false for unregistered method', () => {
      const registry = new ProviderSerializerRegistry();

      expect(registry.has('unknown_method')).toBe(false);
    });

    it('should return true for registered method', () => {
      const registry = new ProviderSerializerRegistry();
      const serializer: JSONRPCSerializer<unknown, unknown> = {
        params: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
      };

      registry.register('test_method', serializer);

      expect(registry.has('test_method')).toBe(true);
    });
  });

  describe('serializeCall', () => {
    it('should return the call as-is when no serializer is registered', async () => {
      const registry = new ProviderSerializerRegistry();
      const call: MethodCall<'test_method'> = {
        method: 'test_method',
        params: ['param1', 'param2'],
      };

      const result = await registry.serializeCall(call);

      expect(result).toEqual(call);
    });

    it('should return the call as-is when serializer has no params serializer', async () => {
      const registry = new ProviderSerializerRegistry();
      const serializer = {
        result: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
      } as unknown as JSONRPCSerializer<unknown, unknown>;
      const call: MethodCall<'test_method'> = {
        method: 'test_method',
        params: ['param1', 'param2'],
      };

      registry.register('test_method', serializer);
      const result = await registry.serializeCall(call);

      expect(result).toEqual(call);
    });

    it('should return the call as-is when params are undefined', async () => {
      const registry = new ProviderSerializerRegistry();
      const serializer: JSONRPCSerializer<unknown, unknown> = {
        params: {
          serialize: vi.fn().mockResolvedValue('serialized'),
          deserialize: vi.fn(),
        },
      };
      const call: MethodCall<'test_method'> = {
        method: 'test_method',
      };

      registry.register('test_method', serializer);
      const result = await registry.serializeCall(call);

      expect(result).toEqual(call);
      expect(serializer.params?.serialize).not.toHaveBeenCalled();
    });

    it('should serialize params when serializer is registered', async () => {
      const registry = new ProviderSerializerRegistry();
      const serializedParams = { serialized: 'data' };
      const serializer: JSONRPCSerializer<unknown, unknown> = {
        params: {
          serialize: vi.fn().mockResolvedValue(serializedParams),
          deserialize: vi.fn(),
        },
      };
      const call: MethodCall<'test_method'> = {
        method: 'test_method',
        params: ['param1', 'param2'],
      };

      registry.register('test_method', serializer);
      const result = await registry.serializeCall(call);

      expect(serializer.params?.serialize).toHaveBeenCalledWith('test_method', ['param1', 'param2']);
      expect(result).toEqual({
        method: 'test_method',
        params: serializedParams,
      });
    });

    it('should handle serialization errors', async () => {
      const registry = new ProviderSerializerRegistry();
      const error = new Error('Serialization failed');
      const serializer: JSONRPCSerializer<unknown, unknown> = {
        params: {
          serialize: vi.fn().mockRejectedValue(error),
          deserialize: vi.fn(),
        },
      };
      const call: MethodCall<'test_method'> = {
        method: 'test_method',
        params: ['param1'],
      };

      registry.register('test_method', serializer);

      await expect(registry.serializeCall(call)).rejects.toThrow(error);
    });
  });

  describe('deserializeResult', () => {
    it('should return the result as-is when no serializer is registered', async () => {
      const registry = new ProviderSerializerRegistry();
      const result = { data: 'test' };

      const deserialized = await registry.deserializeResult('test_method', result);

      expect(deserialized).toBe(result);
    });

    it('should return the result as-is when serializer has no result deserializer', async () => {
      const registry = new ProviderSerializerRegistry();
      const serializer = {
        params: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
      } as JSONRPCSerializer<unknown, unknown>;
      const result = { data: 'test' };

      registry.register('test_method', serializer);
      const deserialized = await registry.deserializeResult('test_method', result);

      expect(deserialized).toBe(result);
    });

    it('should return the result as-is when result is not in serialized format', async () => {
      const registry = new ProviderSerializerRegistry();
      const serializer = {
        params: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
        result: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
      } as JSONRPCSerializer<unknown, unknown>;

      registry.register('test_method', serializer);

      // Test various non-serialized formats
      const results = [
        null,
        undefined,
        'string',
        123,
        true,
        { data: 'test' }, // Missing required fields
        { serialized: 'data' }, // Missing method field
        { method: 'test' }, // Missing serialized field
      ];

      for (const result of results) {
        const deserialized = await registry.deserializeResult('test_method', result);
        expect(deserialized).toBe(result);
        expect(serializer.result?.deserialize).not.toHaveBeenCalled();
      }
    });

    it('should deserialize result when in serialized format', async () => {
      const registry = new ProviderSerializerRegistry();
      const deserializedData = { original: 'data' };
      const serializer = {
        params: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
        result: {
          serialize: vi.fn(),
          deserialize: vi.fn().mockResolvedValue(deserializedData),
        },
      } as JSONRPCSerializer<unknown, unknown>;
      const serializedResult = {
        serialized: 'encoded-data',
        method: 'test_method',
      };

      registry.register('test_method', serializer);
      const result = await registry.deserializeResult('test_method', serializedResult);

      expect(serializer.result?.deserialize).toHaveBeenCalledWith('test_method', serializedResult);
      expect(result).toBe(deserializedData);
    });

    it('should handle deserialization errors', async () => {
      const registry = new ProviderSerializerRegistry();
      const error = new Error('Deserialization failed');
      const serializer = {
        params: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
        result: {
          serialize: vi.fn(),
          deserialize: vi.fn().mockRejectedValue(error),
        },
      } as JSONRPCSerializer<unknown, unknown>;
      const serializedResult = {
        serialized: 'encoded-data',
        method: 'test_method',
      };

      registry.register('test_method', serializer);

      await expect(registry.deserializeResult('test_method', serializedResult)).rejects.toThrow(error);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple methods with different serializers', async () => {
      const registry = new ProviderSerializerRegistry();

      const serializer1: JSONRPCSerializer<unknown, unknown> = {
        params: {
          serialize: vi.fn().mockResolvedValue('serialized1'),
          deserialize: vi.fn(),
        },
      };

      const serializer2: JSONRPCSerializer<unknown, unknown> = {
        params: {
          serialize: vi.fn().mockResolvedValue('serialized2'),
          deserialize: vi.fn(),
        },
      };

      registry.register('method1', serializer1);
      registry.register('method2', serializer2);

      const call1: MethodCall<'method1'> = {
        method: 'method1',
        params: ['test'],
      };

      const call2: MethodCall<'method2'> = {
        method: 'method2',
        params: ['test'],
      };

      const result1 = await registry.serializeCall(call1);
      const result2 = await registry.serializeCall(call2);

      expect(result1.params).toBe('serialized1');
      expect(result2.params).toBe('serialized2');
    });

    it('should handle serializers with only params or only result', async () => {
      const registry = new ProviderSerializerRegistry();

      const paramsOnlySerializer: JSONRPCSerializer<unknown, unknown> = {
        params: {
          serialize: vi.fn().mockResolvedValue('serialized-params'),
          deserialize: vi.fn(),
        },
      };

      const resultOnlySerializer = {
        params: {
          serialize: vi.fn(),
          deserialize: vi.fn(),
        },
        result: {
          serialize: vi.fn(),
          deserialize: vi.fn().mockResolvedValue('deserialized-result'),
        },
      } as JSONRPCSerializer<unknown, unknown>;

      registry.register('params_method', paramsOnlySerializer);
      registry.register('result_method', resultOnlySerializer);

      // Test params-only serializer
      const call: MethodCall<'params_method'> = {
        method: 'params_method',
        params: ['test'],
      };
      const serializedCall = await registry.serializeCall(call);
      expect(serializedCall.params).toBe('serialized-params');

      // Test result-only serializer
      const serializedResult = {
        serialized: 'data',
        method: 'result_method',
      };
      const deserializedResult = await registry.deserializeResult('result_method', serializedResult);
      expect(deserializedResult).toBe('deserialized-result');
    });
  });
});
