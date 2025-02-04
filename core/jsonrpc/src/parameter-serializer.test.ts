import { describe, it, expect, beforeEach } from 'vitest';
import { ParameterSerializer } from './parameter-serializer.js';
import { JSONRPCError } from './error.js';
import type { JSONRPCSerializer, JSONRPCSerializedData } from './types.js';

describe('ParameterSerializer', () => {
  const serializer = new ParameterSerializer();

  describe('Parameter Serialization', () => {
    const testSerializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (method, params) => ({ serialized: JSON.stringify(params), method }),
        deserialize: (_method, data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: (method, result) => ({ serialized: result, method }),
        deserialize: (_method, data) => data.serialized,
      },
    };

    it('should handle undefined params', () => {
      expect(serializer.serializeParams('test', undefined, undefined)).toBeUndefined();
    });

    it('should pass through params when no serializer is provided', () => {
      const params = { name: 'test' };
      expect(serializer.serializeParams('test', params, undefined)).toBe(params);
    });

    it('should serialize params when serializer is provided', () => {
      const params = { name: 'test' };
      expect(serializer.serializeParams('test', params, testSerializer)).toEqual({
        serialized: JSON.stringify(params),
        method: 'test',
      });
    });

    it('should handle serialization errors in params', () => {
      const errorSerializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: (_method, _params) => {
            throw new Error('Serialization failed');
          },
          deserialize: (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (method, result) => ({ serialized: result, method }),
          deserialize: (_method, data) => data.serialized,
        },
      };

      expect(() => serializer.serializeParams('test', { name: 'test' }, errorSerializer)).toThrow(
        'Serialization failed',
      );
    });

    it('should validate serialized params data structure', () => {
      const invalidSerializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: (_method, _params) => ({ invalid: 'format' }) as unknown as JSONRPCSerializedData,
          deserialize: (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (method, result) => ({ serialized: result, method }),
          deserialize: (_method, data) => data.serialized,
        },
      };

      expect(() => serializer.serializeParams('test', { name: 'test' }, invalidSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should validate serialized params data type', () => {
      const invalidSerializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: (method, _params) =>
            ({ serialized: undefined, method }) as unknown as JSONRPCSerializedData,
          deserialize: (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (method, result) => ({ serialized: result, method }),
          deserialize: (_method, data) => data.serialized,
        },
      };

      expect(() => serializer.serializeParams('test', { name: 'test' }, invalidSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });

    it('should handle undefined serializer and params', () => {
      const params = { name: 'test' };
      expect(serializer.serializeParams('test', params, undefined)).toBe(params);
      expect(serializer.serializeParams('test', undefined, undefined)).toBeUndefined();
      expect(serializer.serializeParams('test', params, undefined)).toBe(params);
    });

    it('should handle undefined params with serializer', () => {
      expect(serializer.serializeParams('test', undefined, testSerializer)).toBeUndefined();
      expect(serializer.serializeParams('test', null, testSerializer)).toBeUndefined();
    });
  });

  describe('Result Serialization', () => {
    const testSerializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (method, params) => ({ serialized: JSON.stringify(params), method }),
        deserialize: (_method, data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: (method, result) => ({ serialized: result, method }),
        deserialize: (_method, data) => data.serialized,
      },
    };

    it('should handle undefined result', () => {
      expect(serializer.serializeResult('test', undefined, undefined)).toBeUndefined();
    });

    it('should pass through result when no serializer is provided', () => {
      const result = 'test';
      expect(serializer.serializeResult('test', result, undefined)).toBe(result);
    });

    it('should serialize result when serializer is provided', () => {
      expect(serializer.serializeResult('test', 'test', testSerializer)).toEqual({
        serialized: 'test',
        method: 'test',
      });
    });

    it('should handle serialization errors in result', () => {
      const errorSerializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (_method, _result) => {
            throw new Error('Serialization failed');
          },
          deserialize: (_method, data) => data.serialized,
        },
      };

      expect(() => serializer.serializeResult('test', 'test', errorSerializer)).toThrow(
        'Serialization failed',
      );
    });

    it('should validate serialized result data structure', () => {
      const invalidSerializer: JSONRPCSerializer<{ name: string }, string> = {
        params: testSerializer.params,
        result: {
          serialize: (_method, _result) => ({ invalid: 'format' }) as unknown as JSONRPCSerializedData,
          deserialize: (_method, data) => data.serialized,
        },
      };

      expect(() => serializer.serializeResult('test', 'test', invalidSerializer)).toThrow(
        new JSONRPCError(-32602, 'Invalid serialized data format'),
      );
    });
  });

  describe('Fallback Serializer', () => {
    const fallbackSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
      params: {
        serialize: (method, params) => ({ serialized: JSON.stringify(params), method }),
        deserialize: (_method, data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: (method, result) => ({ serialized: JSON.stringify(result), method }),
        deserialize: (_method, data) => JSON.parse(data.serialized),
      },
    };

    beforeEach(() => {
      serializer.setFallbackSerializer(fallbackSerializer);
    });

    describe('Parameter Serialization with Fallback', () => {
      it('should handle null params with fallback serializer', () => {
        expect(serializer.serializeParams('test', null, undefined)).toBeUndefined();
      });

      it('should handle undefined params with fallback serializer', () => {
        expect(serializer.serializeParams('test', undefined, undefined)).toBeUndefined();
      });

      it('should use fallback serializer when no method-specific serializer is provided', () => {
        const params = { test: 'value' };
        const serialized = serializer.serializeParams('test', params, undefined);
        expect(serialized).toEqual({ serialized: JSON.stringify(params), method: 'test' });
      });

      it('should prefer method-specific serializer over fallback', () => {
        const params = { test: 'value' };
        const methodSerializer: JSONRPCSerializer<typeof params, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: 'method-specific', method }),
            deserialize: (_method, _data) => params,
          },
          result: {
            serialize: (method, result) => ({ serialized: JSON.stringify(result), method }),
            deserialize: (_method, _data) => ({ test: 'method-specific' }),
          },
        };
        const serialized = serializer.serializeParams('test', params, methodSerializer);
        expect(serialized).toEqual({ serialized: 'method-specific', method: 'test' });
      });

      it('should throw error when fallback serializer throws an error', () => {
        const errorFallbackSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (_method, _params) => {
              throw new Error('Serialization error');
            },
            deserialize: (_method, _data) => ({ test: '' }),
          },
          result: {
            serialize: (method, result) => ({ serialized: JSON.stringify(result), method }),
            deserialize: (_method, _data) => ({ test: '' }),
          },
        };
        serializer.setFallbackSerializer(errorFallbackSerializer);
        expect(() => serializer.serializeParams('test', { test: 'value' }, undefined)).toThrow(
          'Serialization error',
        );
      });

      it('should throw error when fallback serializer produces invalid format', () => {
        const invalidFallbackSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (_method, _params) => ({ invalid: 'format' }) as unknown as JSONRPCSerializedData,
            deserialize: (_method, _data) => ({ test: '' }),
          },
          result: {
            serialize: (method, result) => ({ serialized: JSON.stringify(result), method }),
            deserialize: (_method, _data) => ({ test: '' }),
          },
        };
        serializer.setFallbackSerializer(invalidFallbackSerializer);
        expect(() => serializer.serializeParams('test', { test: 'value' }, undefined)).toThrow(
          new JSONRPCError(-32602, 'Invalid serialized data format from fallback serializer'),
        );
      });
    });

    describe('Result Serialization with Fallback', () => {
      beforeEach(() => {
        serializer.setFallbackSerializer(fallbackSerializer);
      });

      it('should use fallback serializer when no method-specific serializer is provided', () => {
        const result = { test: 'value' };
        const serialized = serializer.serializeResult('test', result, undefined);
        expect(serialized).toEqual({ serialized: JSON.stringify(result), method: 'test' });
      });

      it('should prefer method-specific serializer over fallback', () => {
        const result = { test: 'value' };
        const methodSerializer: JSONRPCSerializer<unknown, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: '', method }),
            deserialize: (_method, _data) => ({}),
          },
          result: {
            serialize: (method, _result) => ({ serialized: 'method-specific', method }),
            deserialize: (_method, _data) => ({ test: 'method-specific' }),
          },
        };
        const serialized = serializer.serializeResult('test', result, methodSerializer);
        expect(serialized).toEqual({ serialized: 'method-specific', method: 'test' });
      });

      it('should throw error when fallback serializer throws an error', () => {
        const errorFallbackSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: '', method }),
            deserialize: (_method, _data) => ({ test: '' }),
          },
          result: {
            serialize: (_method, _result) => {
              throw new Error('Serialization error');
            },
            deserialize: (_method, _data) => ({ test: '' }),
          },
        };
        serializer.setFallbackSerializer(errorFallbackSerializer);
        expect(() => serializer.serializeResult('test', { test: 'value' }, undefined)).toThrow(
          'Serialization error',
        );
      });

      it('should throw error when fallback serializer produces invalid format', () => {
        const invalidFallbackSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: '', method }),
            deserialize: (_method, _data) => ({ test: '' }),
          },
          result: {
            serialize: (_method, _result) => ({ invalid: 'format' }) as unknown as JSONRPCSerializedData,
            deserialize: (_method, _data) => ({ test: '' }),
          },
        };
        serializer.setFallbackSerializer(invalidFallbackSerializer);
        expect(() => serializer.serializeResult('test', { test: 'value' }, undefined)).toThrow(
          new JSONRPCError(-32602, 'Invalid serialized data format from fallback serializer'),
        );
      });
    });

    describe('Result Deserialization with Fallback', () => {
      beforeEach(() => {
        serializer.setFallbackSerializer(fallbackSerializer);
      });

      it('should handle undefined result with fallback serializer', () => {
        expect(serializer.deserializeResult('test', undefined)).toBeUndefined();
      });

      it('should handle null result with fallback serializer', () => {
        expect(serializer.deserializeResult('test', null)).toBeUndefined();
      });

      it('should throw error when result is not an object with fallback serializer', () => {
        expect(() => serializer.deserializeResult('test', 123)).toThrow(
          new JSONRPCError(-32602, 'Invalid result format for serialization'),
        );
      });

      it('should use fallback serializer when no method-specific serializer is provided', () => {
        const result = { test: 'value' };
        const serialized = { serialized: JSON.stringify(result), method: 'test' };
        const deserialized = serializer.deserializeResult('test', serialized);
        expect(deserialized).toEqual(result);
      });

      it('should prefer method-specific serializer over fallback', () => {
        const methodSerializer: JSONRPCSerializer<unknown, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: '', method }),
            deserialize: (_method, _data) => ({}),
          },
          result: {
            serialize: (method, _result) => ({ serialized: 'test', method }),
            deserialize: (_method, _data) => ({ test: 'method-specific' }),
          },
        };
        const deserialized = serializer.deserializeResult(
          'test',
          { serialized: 'test', method: 'test' },
          methodSerializer,
        );
        expect(deserialized).toEqual({ test: 'method-specific' });
      });

      it('should throw error when serialized data structure validation fails', () => {
        const invalidData = { serialized: '{"valid":"json"}' }; // Missing method field
        expect(() => serializer.deserializeResult('test', invalidData)).toThrow(
          new JSONRPCError(-32602, 'Invalid serialized data structure'),
        );
      });

      it('should throw error when deserializer produces invalid format', () => {
        const methodSerializer: JSONRPCSerializer<unknown, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: '', method }),
            deserialize: (_method, _data) => ({}),
          },
          result: {
            serialize: (method, _result) => ({ serialized: 'test', method }),
            deserialize: (_method, _data) => ({ fn: () => {} }) as unknown as { test: string }, // Functions are not valid JSON-RPC values
          },
        };
        expect(() =>
          serializer.deserializeResult('test', { serialized: 'test', method: 'test' }, methodSerializer),
        ).toThrow(new JSONRPCError(-32602, 'Invalid serialized data format'));
      });
    });

    describe('Parameter Deserialization with Fallback', () => {
      beforeEach(() => {
        serializer.setFallbackSerializer(fallbackSerializer);
      });

      it('should throw error when fallback deserializer throws error during params deserialization', () => {
        const errorFallbackSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: '', method }),
            deserialize: (_method, _data) => {
              throw new Error('Deserialization error');
            },
          },
          result: {
            serialize: (method, result) => ({ serialized: JSON.stringify(result), method }),
            deserialize: (_method, _data) => ({ test: '' }),
          },
        };
        serializer.setFallbackSerializer(errorFallbackSerializer);
        expect(() => serializer.deserializeParams('test', { serialized: 'test', method: 'test' })).toThrow(
          new JSONRPCError(-32000, 'Deserialization error'),
        );
      });

      it('should handle non-Error objects thrown by fallback deserializer during params deserialization', () => {
        const errorFallbackSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: '', method }),
            deserialize: (_method, _data) => {
              throw 'Non-error object thrown';
            },
          },
          result: {
            serialize: (method, result) => ({ serialized: JSON.stringify(result), method }),
            deserialize: (_method, _data) => ({ test: '' }),
          },
        };
        serializer.setFallbackSerializer(errorFallbackSerializer);
        expect(() => serializer.deserializeParams('test', { serialized: 'test', method: 'test' })).toThrow(
          new JSONRPCError(-32000, 'Unknown error'),
        );
      });

      it('should throw error when method-specific deserializer throws error during params deserialization', () => {
        const errorSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: 'test', method }),
            deserialize: (_method, _data) => {
              throw new Error('Method-specific error');
            },
          },
          result: {
            serialize: (method, result) => ({ serialized: JSON.stringify(result), method }),
            deserialize: (_method, _data) => ({ test: '' }),
          },
        };
        expect(() =>
          serializer.deserializeParams('test', { serialized: 'test', method: 'test' }, errorSerializer),
        ).toThrow(new JSONRPCError(-32000, 'Method-specific error'));
      });

      it('should handle non-Error objects thrown by method-specific deserializer during params deserialization', () => {
        const errorSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: 'test', method }),
            deserialize: (_method, _data) => {
              throw 'Non-error object thrown';
            },
          },
          result: {
            serialize: (method, result) => ({ serialized: JSON.stringify(result), method }),
            deserialize: (_method, _data) => ({ test: '' }),
          },
        };
        expect(() =>
          serializer.deserializeParams('test', { serialized: 'test', method: 'test' }, errorSerializer),
        ).toThrow(new JSONRPCError(-32000, 'Unknown error'));
      });

      it('should throw error when method-specific deserializer throws error during result deserialization', () => {
        const errorSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: 'test', method }),
            deserialize: (_method, _data) => ({ test: '' }),
          },
          result: {
            serialize: (method, result) => ({ serialized: JSON.stringify(result), method }),
            deserialize: (_method, _data) => {
              throw new Error('Result deserialization error');
            },
          },
        };
        expect(() =>
          serializer.deserializeResult('test', { serialized: 'test', method: 'test' }, errorSerializer),
        ).toThrow(new JSONRPCError(-32602, 'Invalid serialized data format'));
      });

      it('should throw error when result validation fails after method-specific deserialization', () => {
        const invalidMethodSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: 'test', method }),
            deserialize: (_method, _data) => ({ test: '' }),
          },
          result: {
            serialize: (method, result) => ({ serialized: JSON.stringify(result), method }),
            deserialize: (_method, _data) => ({ fn: () => {} }) as unknown as { test: string }, // Functions are not valid JSON-RPC values
          },
        };
        expect(() =>
          serializer.deserializeResult(
            'test',
            { serialized: 'test', method: 'test' },
            invalidMethodSerializer,
          ),
        ).toThrow(new JSONRPCError(-32602, 'Invalid serialized data format'));
      });

      it('should throw error when result validation fails after fallback deserialization', () => {
        const invalidFallbackSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: '', method }),
            deserialize: (_method, _data) => ({ test: '' }),
          },
          result: {
            serialize: (method, result) => ({ serialized: result as unknown as string, method }),
            deserialize: (_method, _data) => ({ fn: () => {} }) as unknown as { test: string },
          },
        };
        serializer.setFallbackSerializer(invalidFallbackSerializer);
        expect(() => serializer.deserializeResult('test', { serialized: 'test', method: 'test' })).toThrow(
          new JSONRPCError(-32602, 'Invalid deserialized result format from fallback serializer'),
        );
      });

      it('should handle undefined params with fallback serializer', () => {
        expect(serializer.deserializeParams('test', undefined)).toBeUndefined();
      });

      it('should handle null params with fallback serializer', () => {
        expect(serializer.deserializeParams('test', null)).toBeUndefined();
      });

      it('should throw error when params is not an object with fallback serializer', () => {
        expect(() => serializer.deserializeParams('test', 123)).toThrow(
          new JSONRPCError(-32602, 'Invalid params format for serialization'),
        );
      });

      it('should throw error when serialized field is missing with fallback serializer', () => {
        expect(() => serializer.deserializeParams('test', {})).toThrow(
          new JSONRPCError(-32602, 'Invalid serialized data format'),
        );
      });

      it('should throw error when serialized field is not a string with fallback serializer', () => {
        expect(() => serializer.deserializeParams('test', { serialized: 123, method: 'test' })).toThrow(
          new JSONRPCError(-32602, 'Invalid serialized data format'),
        );
      });

      it('should use fallback serializer when no method-specific serializer is provided', () => {
        const params = { test: 'value' };
        const serialized = { serialized: JSON.stringify(params), method: 'test' };
        const deserialized = serializer.deserializeParams('test', serialized);
        expect(deserialized).toEqual(params);
      });

      it('should prefer method-specific serializer over fallback', () => {
        const methodSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: 'test', method }),
            deserialize: (_method, _data) => ({ test: 'method-specific' }),
          },
          result: {
            serialize: (method, result) => ({ serialized: JSON.stringify(result), method }),
            deserialize: (_method, _data) => ({ test: 'method-specific' }),
          },
        };
        const deserialized = serializer.deserializeParams(
          'test',
          { serialized: 'test', method: 'test' },
          methodSerializer,
        );
        expect(deserialized).toEqual({ test: 'method-specific' });
      });

      it('should throw error when serialized data structure validation fails', () => {
        const invalidData = { serialized: '{"valid":"json"}' }; // Missing method field
        expect(() => serializer.deserializeParams('test', invalidData)).toThrow(
          new JSONRPCError(-32602, 'Invalid serialized data structure'),
        );
      });

      it('should throw error when fallback deserializer throws an error', () => {
        const errorFallbackSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: 'test', method }),
            deserialize: (_method, _data) => ({ test: '' }),
          },
          result: {
            serialize: (method, result) => ({ serialized: JSON.stringify(result), method }),
            deserialize: (_method, _data) => {
              throw new Error('Deserialization error');
            },
          },
        };
        serializer.setFallbackSerializer(errorFallbackSerializer);
        expect(() => serializer.deserializeResult('test', { serialized: 'test', method: 'test' })).toThrow(
          new JSONRPCError(-32602, 'Invalid deserialized result format from fallback serializer'),
        );
      });

      it('should handle non-Error objects thrown by fallback deserializer during result deserialization', () => {
        const errorFallbackSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: 'test', method }),
            deserialize: (_method, _data) => ({ test: '' }),
          },
          result: {
            serialize: (method, result) => ({ serialized: JSON.stringify(result), method }),
            deserialize: (_method, _data) => {
              throw 'Non-error object thrown';
            },
          },
        };
        serializer.setFallbackSerializer(errorFallbackSerializer);
        expect(() => serializer.deserializeResult('test', { serialized: 'test', method: 'test' })).toThrow(
          new JSONRPCError(-32602, 'Invalid deserialized result format from fallback serializer'),
        );
      });

      it('should pass through result when no result handlers are available', () => {
        // Create serializer with only params handlers
        const serializerWithoutResult: JSONRPCSerializer<unknown, string> = {
          params: {
            serialize: (method, params) => ({ serialized: JSON.stringify(params), method }),
            deserialize: (_method, data) => JSON.parse(data.serialized),
          },
        };

        // Create fallback serializer with only params handlers
        const fallbackWithoutResult: JSONRPCSerializer<unknown, string> = {
          params: {
            serialize: (method, params) => ({ serialized: JSON.stringify(params), method }),
            deserialize: (_method, data) => JSON.parse(data.serialized),
          },
        };

        serializer.setFallbackSerializer(fallbackWithoutResult);

        // Test with a valid result value
        const result = { data: 'test value' };
        const deserialized = serializer.deserializeResult('test', result, serializerWithoutResult);

        // Should return the original value unchanged
        expect(deserialized).toBe(result);
      });

      it('should throw error when fallback deserializer produces invalid format', () => {
        const invalidFallbackSerializer: JSONRPCSerializer<{ test: string }, { test: string }> = {
          params: {
            serialize: (method, _params) => ({ serialized: 'test', method }),
            deserialize: (_method, _data) => ({ fn: () => {} }) as unknown as { test: string },
          },
          result: {
            serialize: (method, result) => ({ serialized: JSON.stringify(result), method }),
            deserialize: (_method, _data) => ({ test: '' }),
          },
        };
        serializer.setFallbackSerializer(invalidFallbackSerializer);
        expect(() => serializer.deserializeParams('test', { serialized: 'test', method: 'test' })).toThrow(
          new JSONRPCError(-32602, 'Invalid deserialized params format from fallback serializer'),
        );
      });

      // New tests to cover uncovered lines
      it('should handle undefined params without serializer', () => {
        expect(serializer.deserializeParams('test', undefined, undefined)).toBeUndefined();
      });

      it('should throw error when params validation fails without serializer', () => {
        const invalidParams = () => {}; // Functions are not valid JSON-RPC values
        expect(() => serializer.deserializeParams('test', invalidParams, undefined)).toThrow(
          new JSONRPCError(-32602, 'Invalid params format for serialization'),
        );
      });

      it('should throw error when result validation fails without serializer', () => {
        const invalidResult = () => {}; // Functions are not valid JSON-RPC values
        expect(() => serializer.deserializeResult('test', invalidResult, undefined)).toThrow(
          new JSONRPCError(-32602, 'Invalid result format for serialization'),
        );
      });
    });
  });
});
