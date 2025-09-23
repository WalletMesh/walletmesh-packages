import { describe, expect, it } from 'vitest';
import { JSONRPCError } from './error.js';
import { ParameterSerializer } from './parameter-serializer.js';
import type { JSONRPCSerializedData, JSONRPCSerializer } from './types.js';

describe('ParameterSerializer', () => {
  const serializer = new ParameterSerializer();

  describe('Parameter Serialization', () => {
    const testSerializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: async (method, params) => ({ serialized: JSON.stringify(params), method }),
        deserialize: async (_method, data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: async (method, result) => ({ serialized: result, method }),
        deserialize: async (_method, data) => data.serialized,
      },
    };

    it('should handle undefined params', async () => {
      const result = await serializer.serializeParams('test', undefined, undefined);
      expect(result).toBeUndefined();
    });

    it('should pass through params when no serializer is provided', async () => {
      const params = { name: 'test' };
      const result = await serializer.serializeParams('test', params, undefined);
      expect(result).toBe(params);
    });

    it('should serialize params when serializer is provided', async () => {
      const params = { name: 'test' };
      const result = await serializer.serializeParams('test', params, testSerializer);
      expect(result).toEqual({
        serialized: JSON.stringify(params),
        method: 'test',
      });
    });

    it('should handle serialization errors in params', async () => {
      const errorSerializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: async (_method, _params) => {
            throw new Error('Serialization failed');
          },
          deserialize: async (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: async (method, result) => ({ serialized: result, method }),
          deserialize: async (_method, data) => data.serialized,
        },
      };

      await expect(serializer.serializeParams('test', { name: 'test' }, errorSerializer)).rejects.toThrow(
        'Serialization failed',
      );
    });

    it('should validate serialized params data structure', async () => {
      const invalidSerializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: async (_method, _params) => ({ invalid: 'format' }) as unknown as JSONRPCSerializedData,
          deserialize: async (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: async (method, result) => ({ serialized: result, method }),
          deserialize: async (_method, data) => data.serialized,
        },
      };

      await expect(serializer.serializeParams('test', { name: 'test' }, invalidSerializer)).rejects.toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should validate serialized params data type', async () => {
      const invalidSerializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: async (method, _params) =>
            ({ serialized: undefined, method }) as unknown as JSONRPCSerializedData,
          deserialize: async (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: async (method, result) => ({ serialized: result, method }),
          deserialize: async (_method, data) => data.serialized,
        },
      };

      await expect(serializer.serializeParams('test', { name: 'test' }, invalidSerializer)).rejects.toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should handle undefined serializer and params', async () => {
      const params = { name: 'test' };
      const result1 = await serializer.serializeParams('test', params, undefined);
      expect(result1).toBe(params);
      const result2 = await serializer.serializeParams('test', undefined, undefined);
      expect(result2).toBeUndefined();
      const result3 = await serializer.serializeParams('test', params, undefined);
      expect(result3).toBe(params);
    });

    it('should handle undefined params with serializer', async () => {
      const result1 = await serializer.serializeParams('test', undefined, testSerializer);
      expect(result1).toBeUndefined();
      const result2 = await serializer.serializeParams('test', null, testSerializer);
      expect(result2).toBeUndefined();
    });
  });

  describe('Result Serialization', () => {
    const testSerializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: async (method, params) => ({ serialized: JSON.stringify(params), method }),
        deserialize: async (_method, data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: async (method, result) => ({ serialized: result, method }),
        deserialize: async (_method, data) => data.serialized,
      },
    };

    it('should handle undefined result', async () => {
      const result = await serializer.serializeResult('test', undefined, undefined);
      expect(result).toBeUndefined();
    });

    it('should pass through result when no serializer is provided', async () => {
      const result = 'test';
      const serialized = await serializer.serializeResult('test', result, undefined);
      expect(serialized).toBe(result);
    });

    it('should serialize result when serializer is provided', async () => {
      const serialized = await serializer.serializeResult('test', 'test', testSerializer);
      expect(serialized).toEqual({
        serialized: 'test',
        method: 'test',
      });
    });

    it('should handle serialization errors in result', async () => {
      const errorSerializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: async (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: async (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: async (_method, _result) => {
            throw new Error('Serialization failed');
          },
          deserialize: async (_method, data) => data.serialized,
        },
      };

      await expect(serializer.serializeResult('test', 'test', errorSerializer)).rejects.toThrow(
        'Serialization failed',
      );
    });

    it('should validate serialized result data structure', async () => {
      const invalidSerializer: JSONRPCSerializer<{ name: string }, string> = {
        params: testSerializer.params,
        result: {
          serialize: async (_method, _result) => ({ invalid: 'format' }) as unknown as JSONRPCSerializedData,
          deserialize: async (_method, data) => data.serialized,
        },
      };

      await expect(serializer.serializeResult('test', 'test', invalidSerializer)).rejects.toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });
  });

  describe('Parameter Deserialization', () => {
    const testSerializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: async (method, params) => ({ serialized: JSON.stringify(params), method }),
        deserialize: async (_method, data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: async (method, result) => ({ serialized: result, method }),
        deserialize: async (_method, data) => data.serialized,
      },
    };

    it('should handle undefined params without serializer', async () => {
      const result = await serializer.deserializeParams('test', undefined, undefined);
      expect(result).toBeUndefined();
    });

    it('should pass through params when no serializer is provided', async () => {
      const params = { name: 'test' };
      const result = await serializer.deserializeParams('test', params, undefined);
      expect(result).toBe(params);
    });

    it('should deserialize params when serializer is provided', async () => {
      const serializedData = { serialized: JSON.stringify({ name: 'test' }), method: 'test' };
      const result = await serializer.deserializeParams('test', serializedData, testSerializer);
      expect(result).toEqual({ name: 'test' });
    });

    it('should throw error when serialized data is invalid', async () => {
      const invalidData = { invalid: 'format' };
      await expect(serializer.deserializeParams('test', invalidData, testSerializer)).rejects.toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });
  });

  describe('Result Deserialization', () => {
    const testSerializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: async (method, params) => ({ serialized: JSON.stringify(params), method }),
        deserialize: async (_method, data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: async (method, result) => ({ serialized: result, method }),
        deserialize: async (_method, data) => data.serialized,
      },
    };

    it('should handle undefined result without serializer', async () => {
      const result = await serializer.deserializeResult('test', undefined, undefined);
      expect(result).toBeUndefined();
    });

    it('should pass through result when no serializer is provided', async () => {
      const result = 'test';
      const deserialized = await serializer.deserializeResult('test', result, undefined);
      expect(deserialized).toBe(result);
    });

    it('should deserialize result when serializer is provided', async () => {
      const serializedData = { serialized: 'test', method: 'test' };
      const result = await serializer.deserializeResult('test', serializedData, testSerializer);
      expect(result).toBe('test');
    });

    it('should throw error when serialized data is invalid', async () => {
      const invalidData = { invalid: 'format' };
      await expect(serializer.deserializeResult('test', invalidData, testSerializer)).rejects.toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });
  });
});
