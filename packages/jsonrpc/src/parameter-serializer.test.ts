import { describe, it, expect, vi } from 'vitest';
import { ParameterSerializer } from './parameter-serializer.js';
import { JSONRPCError } from './error.js';
import type { JSONRPCSerializer, JSONRPCSerializedData } from './types.js';

// Mock isJSONRPCSerializedData to return false for our test case
vi.mock('./utils.js', () => ({
  isJSONRPCSerializedData: vi.fn((data: unknown) => {
    // Return false for our specific test case
    if (data && typeof data === 'object' && 'serialized' in data && data.serialized === 'test-invalid') {
      return false;
    }
    // Otherwise use the real implementation
    return (
      typeof data === 'object' &&
      data !== null &&
      'serialized' in data &&
      typeof (data as { serialized: unknown }).serialized === 'string'
    );
  }),
}));

// Mock MessageValidator to control validation behavior
vi.mock('./message-validator.js', () => ({
  MessageValidator: class {
    isValidValue(value: unknown): boolean {
      // Return false for our specific test case
      if (value === 'invalid-value') {
        return false;
      }
      // Return false for functions
      if (typeof value === 'function') {
        return false;
      }
      // Return false for objects with function values
      if (typeof value === 'object' && value !== null) {
        return !Object.values(value).some((v) => typeof v === 'function');
      }
      return true;
    }

    isValidParams(value: unknown): boolean {
      if (typeof value !== 'object' || value === null) {
        return false;
      }
      // Check for functions or invalid values recursively
      const hasInvalidValue = (obj: object): boolean => {
        return Object.values(obj).some((v) => {
          if (typeof v === 'function') return true;
          if (typeof v === 'object' && v !== null) return hasInvalidValue(v);
          if (typeof v === 'number') return true; // Numbers are invalid for name properties
          return false;
        });
      };
      return !hasInvalidValue(value);
    }

    isValidObject(value: unknown): boolean {
      return typeof value === 'object' && value !== null;
    }
  },
}));

describe('ParameterSerializer', () => {
  const serializer = new ParameterSerializer();

  describe('Parameter Serialization', () => {
    const testSerializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (params) => ({ serialized: JSON.stringify(params) }),
        deserialize: (data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: (result) => ({ serialized: result }),
        deserialize: (data) => data.serialized,
      },
    };

    it('should handle undefined params', () => {
      expect(serializer.serializeParams(undefined, testSerializer)).toBeUndefined();
    });

    it('should pass through params when no serializer is provided', () => {
      const params = { name: 'test' };
      expect(serializer.serializeParams(params, undefined)).toBe(params);
    });

    it('should serialize params when serializer is provided', () => {
      const params = { name: 'test' };
      expect(serializer.serializeParams(params, testSerializer)).toEqual({
        serialized: JSON.stringify(params),
      });
    });

    it('should handle serialization errors in params', () => {
      const errorSerializer = {
        params: {
          serialize: () => {
            throw new Error('Serialization failed');
          },
          deserialize: (data: { serialized: string }) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (result: string) => ({ serialized: result }),
          deserialize: (data: { serialized: string }) => data.serialized,
        },
      } as JSONRPCSerializer<{ name: string }, string>;

      expect(() => serializer.serializeParams({ name: 'test' }, errorSerializer)).toThrow(
        'Serialization failed',
      );
    });

    it('should validate serialized params data structure', () => {
      const invalidSerializer = {
        params: {
          serialize: () => ({ invalid: 'format' }) as unknown as JSONRPCSerializedData,
          deserialize: (data: { serialized: string }) => JSON.parse(data.serialized),
        },
        result: testSerializer.result,
      } as JSONRPCSerializer<{ name: string }, string>;

      expect(() => serializer.serializeParams({ name: 'test' }, invalidSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should validate non-object params format', () => {
      expect(() => serializer.deserializeParams(123, undefined)).toThrow(
        new JSONRPCError(-32602, 'Invalid params format'),
      );
    });

    it('should validate params with function values when no serializer', () => {
      expect(() => serializer.deserializeParams({ fn: () => {} }, undefined)).toThrow(
        new JSONRPCError(-32602, 'Invalid params format'),
      );
    });

    it('should validate params with invalid name property type when no serializer', () => {
      expect(() => serializer.deserializeParams({ name: () => {} }, undefined)).toThrow(
        new JSONRPCError(-32602, 'Invalid params format'),
      );
    });

    it('should validate params with non-string name property when no serializer', () => {
      expect(() => serializer.deserializeParams({ name: 123 }, undefined)).toThrow(
        new JSONRPCError(-32602, 'Invalid params format'),
      );
    });

    it('should validate params with object containing non-string name property when no serializer', () => {
      expect(() => serializer.deserializeParams({ nested: { name: 123 } }, undefined)).toThrow(
        new JSONRPCError(-32602, 'Invalid params format'),
      );
    });

    it('should validate params with invalid name property when no serializer', () => {
      expect(() => serializer.deserializeParams({ name: 123 }, undefined)).toThrow(
        new JSONRPCError(-32602, 'Invalid params format'),
      );
    });

    it('should validate params with invalid nested values when no serializer', () => {
      expect(() => serializer.deserializeParams({ fn: () => {} }, undefined)).toThrow(
        new JSONRPCError(-32602, 'Invalid params format'),
      );
    });

    it('should validate params format for serialization', () => {
      expect(() => serializer.deserializeParams(123, testSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid params format for serialization'),
      );
    });

    it('should validate serialized params data type', () => {
      const invalidSerializer = {
        params: {
          serialize: () => ({ serialized: undefined }) as unknown as JSONRPCSerializedData,
          deserialize: (data: { serialized: string }) => JSON.parse(data.serialized),
        },
        result: testSerializer.result,
      } as JSONRPCSerializer<{ name: string }, string>;

      expect(() => serializer.serializeParams({ name: 'test' }, invalidSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should handle undefined serializer and params', () => {
      const params = { name: 'test' };
      expect(serializer.serializeParams(params, undefined)).toBe(params);
      expect(serializer.serializeParams(undefined, undefined)).toBeUndefined();
      expect(serializer.serializeParams(params, undefined)).toBe(params);
    });

    it('should handle undefined params with serializer', () => {
      expect(serializer.serializeParams(undefined, testSerializer)).toBeUndefined();
      expect(serializer.serializeParams(null, testSerializer)).toBeUndefined();
    });
  });

  describe('Parameter Deserialization', () => {
    const testSerializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (params) => ({ serialized: JSON.stringify(params) }),
        deserialize: (data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: (result) => ({ serialized: result }),
        deserialize: (data) => data.serialized,
      },
    };

    it('should handle undefined params', () => {
      expect(serializer.deserializeParams(undefined, testSerializer)).toBeUndefined();
    });

    it('should validate non-serialized params format', () => {
      expect(() => serializer.deserializeParams(123, undefined)).toThrow(
        new JSONRPCError(-32602, 'Invalid params format'),
      );
    });

    it('should pass through valid non-serialized params', () => {
      const params = { name: 'test' };
      expect(serializer.deserializeParams(params, undefined)).toBe(params);
    });

    it('should deserialize params when serializer is provided', () => {
      const serializedParams = { serialized: JSON.stringify({ name: 'test' }) };
      expect(serializer.deserializeParams(serializedParams, testSerializer)).toEqual({ name: 'test' });
    });

    it('should validate serialized params structure', () => {
      expect(() => serializer.deserializeParams({ invalid: 'format' }, testSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should throw error when serialized data structure is invalid', () => {
      // Create an object that will pass the initial checks but fail isJSONRPCSerializedData
      const invalidData = { serialized: 'test-invalid' };
      expect(() => serializer.deserializeParams(invalidData, testSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data structure'),
      );
    });

    it('should validate serialized field type', () => {
      expect(() => serializer.deserializeParams({ serialized: 123 }, testSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should validate missing serialized field', () => {
      expect(() => serializer.deserializeParams({ otherField: 'value' }, testSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should validate serialized field is string', () => {
      expect(() =>
        serializer.deserializeParams({ serialized: { nested: 'object' } }, testSerializer),
      ).toThrow(new JSONRPCError(-32602, 'Invalid serialized data format'));
    });

    it('should handle deserialization errors in params', () => {
      const errorSerializer = {
        params: {
          serialize: (params: { name: string }) => ({ serialized: JSON.stringify(params) }),
          deserialize: () => {
            throw new Error('Deserialization failed');
          },
        },
        result: {
          serialize: (result: string) => ({ serialized: result }),
          deserialize: (data: { serialized: string }) => data.serialized,
        },
      } as JSONRPCSerializer<{ name: string }, string>;

      expect(() => serializer.deserializeParams({ serialized: '{}' }, errorSerializer)).toThrow(
        new JSONRPCError(-32000, 'Deserialization failed'),
      );
    });

    it('should validate deserialized params format', () => {
      const invalidSerializer = {
        params: {
          serialize: (params: { name: string }) => ({ serialized: JSON.stringify(params) }),
          deserialize: () => ({ name: 123 }) as unknown as { name: string },
        },
        result: {
          serialize: (result: string) => ({ serialized: result }),
          deserialize: (data: { serialized: string }) => data.serialized,
        },
      } as JSONRPCSerializer<{ name: string }, string>;

      expect(() => serializer.deserializeParams({ serialized: '{}' }, invalidSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid deserialized params format'),
      );
    });

    it('should validate deserialized params with invalid nested values', () => {
      const invalidSerializer = {
        params: {
          serialize: (params: { name: string }) => ({ serialized: JSON.stringify(params) }),
          deserialize: () => ({ name: 'test', fn: () => {} }) as unknown as { name: string },
        },
        result: testSerializer.result,
      } as JSONRPCSerializer<{ name: string }, string>;

      expect(() => serializer.deserializeParams({ serialized: '{}' }, invalidSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid deserialized params format'),
      );
    });
  });

  describe('Result Serialization', () => {
    const testSerializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (params) => ({ serialized: JSON.stringify(params) }),
        deserialize: (data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: (result) => ({ serialized: result }),
        deserialize: (data) => data.serialized,
      },
    };

    it('should handle undefined result', () => {
      expect(serializer.serializeResult(undefined, testSerializer)).toBeUndefined();
    });

    it('should pass through result when no serializer is provided', () => {
      const result = 'test';
      expect(serializer.serializeResult(result, undefined)).toBe(result);
    });

    it('should serialize result when serializer is provided', () => {
      expect(serializer.serializeResult('test', testSerializer)).toEqual({
        serialized: 'test',
      });
    });

    it('should handle serialization errors in result', () => {
      const errorSerializer = {
        params: {
          serialize: (params: { name: string }) => ({ serialized: JSON.stringify(params) }),
          deserialize: (data: { serialized: string }) => JSON.parse(data.serialized),
        },
        result: {
          serialize: () => {
            throw new Error('Serialization failed');
          },
          deserialize: (data: { serialized: string }) => data.serialized,
        },
      } as JSONRPCSerializer<{ name: string }, string>;

      expect(() => serializer.serializeResult('test', errorSerializer)).toThrow('Serialization failed');
    });

    it('should validate serialized result data structure', () => {
      const invalidSerializer = {
        params: testSerializer.params,
        result: {
          serialize: () => ({ invalid: 'format' }) as unknown as JSONRPCSerializedData,
          deserialize: (data: { serialized: string }) => data.serialized,
        },
      } as JSONRPCSerializer<{ name: string }, string>;

      expect(() => serializer.serializeResult('test', invalidSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });
  });

  describe('Result Deserialization', () => {
    const testSerializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (params) => ({ serialized: JSON.stringify(params) }),
        deserialize: (data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: (result) => ({ serialized: result }),
        deserialize: (data) => data.serialized,
      },
    };

    it('should handle undefined result', () => {
      expect(serializer.deserializeResult(undefined, testSerializer)).toBeUndefined();
    });

    it('should pass through result when no serializer is provided', () => {
      const result = 'test';
      expect(serializer.deserializeResult(result, undefined)).toBe(result);
    });

    it('should deserialize result when serializer is provided', () => {
      const serializedResult = { serialized: 'test' };
      expect(serializer.deserializeResult(serializedResult, testSerializer)).toBe('test');
    });

    it('should validate serialized result structure', () => {
      expect(() => serializer.deserializeResult({ invalid: 'format' }, testSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should throw error when serialized result data structure is invalid', () => {
      // Create an object that will pass the initial checks but fail isJSONRPCSerializedData
      const invalidData = { serialized: 'test-invalid' };
      expect(() => serializer.deserializeResult(invalidData, testSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data structure'),
      );
    });

    it('should validate serialized field type', () => {
      expect(() => serializer.deserializeResult({ serialized: 123 }, testSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should validate missing serialized field in result', () => {
      expect(() => serializer.deserializeResult({ otherField: 'value' }, testSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should validate serialized field is string in result', () => {
      expect(() =>
        serializer.deserializeResult({ serialized: { nested: 'object' } }, testSerializer),
      ).toThrow(new JSONRPCError(-32602, 'Invalid serialized data format'));
    });

    it('should handle deserialization errors in result with specific error code and message', () => {
      const errorSerializer = {
        params: {
          serialize: (params: { name: string }) => ({ serialized: JSON.stringify(params) }),
          deserialize: (data: { serialized: string }) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (result: string) => ({ serialized: result }),
          deserialize: () => {
            throw new Error('Deserialization failed');
          },
        },
      } as JSONRPCSerializer<{ name: string }, string>;

      expect(() => serializer.deserializeResult({ serialized: 'test' }, errorSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should handle deserialization errors in result with non-Error object', () => {
      const errorSerializer = {
        params: {
          serialize: (params: { name: string }) => ({ serialized: JSON.stringify(params) }),
          deserialize: (data: { serialized: string }) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (result: string) => ({ serialized: result }),
          deserialize: () => {
            throw 'Not an Error object';
          },
        },
      } as JSONRPCSerializer<{ name: string }, string>;

      expect(() => serializer.deserializeResult({ serialized: 'test' }, errorSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should validate serialized result data structure with invalid data', () => {
      expect(() =>
        serializer.deserializeResult({ serialized: { nested: 'object' } }, testSerializer),
      ).toThrow(new JSONRPCError(-32602, 'Invalid serialized data format'));
    });

    it('should validate deserialized result with invalid nested values', () => {
      const invalidSerializer = {
        params: testSerializer.params,
        result: {
          serialize: (result: string) => ({ serialized: result }),
          deserialize: () => {
            const fn = () => {};
            return fn as unknown as string;
          },
        },
      } as JSONRPCSerializer<{ name: string }, string>;

      expect(() => serializer.deserializeResult({ serialized: 'test' }, invalidSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should validate deserialized result value', () => {
      const invalidSerializer = {
        params: testSerializer.params,
        result: {
          serialize: (result: string) => ({ serialized: result }),
          deserialize: () => 'invalid-value',
        },
      } as JSONRPCSerializer<{ name: string }, string>;

      expect(() => serializer.deserializeResult({ serialized: 'test' }, invalidSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });
  });
});
