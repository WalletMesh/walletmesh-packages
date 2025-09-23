import { describe, expect, it } from 'vitest';
import type { JSONRPCContext, JSONRPCRequest, JSONRPCResponse } from './types.js';
import {
  applyToMethods,
  isJSONRPCID,
  isJSONRPCSerializedData,
  isJSONRPCVersion,
  wrapHandler,
} from './utils.js';

describe('Utils', () => {
  describe('applyToMethods', () => {
    type TestMethodMap = {
      test: { params: { value: string }; result: string };
      other: { params: { value: number }; result: number };
    };

    const middleware = async (
      _context: JSONRPCContext,
      _request: JSONRPCRequest<TestMethodMap, keyof TestMethodMap>,
      next: () => Promise<JSONRPCResponse<TestMethodMap, keyof TestMethodMap>>,
    ) => {
      return next();
    };

    it('should apply middleware only to specified methods', async () => {
      const wrappedMiddleware = applyToMethods(['test'], middleware);
      const next = async () => ({ jsonrpc: '2.0' as const, result: 'success', id: '1' });

      // Should apply to specified method
      await wrappedMiddleware({}, { jsonrpc: '2.0', method: 'test', id: '1' }, next);

      // Should skip unspecified method
      await wrappedMiddleware({}, { jsonrpc: '2.0', method: 'other', id: '2' }, next);
    });

    it('should handle requests without method property', async () => {
      const wrappedMiddleware = applyToMethods(['test'], middleware);
      const next = async () => ({ jsonrpc: '2.0' as const, result: 'success', id: '1' });

      // Should handle response objects (no method property)
      const result = await wrappedMiddleware(
        {},
        { jsonrpc: '2.0', method: 'test', id: '1' } as unknown as JSONRPCRequest<
          TestMethodMap,
          keyof TestMethodMap
        >,
        next,
      );

      expect(result).toEqual({ jsonrpc: '2.0' as const, result: 'success', id: '1' });
    });
  });

  describe('isJSONRPCID', () => {
    it('should validate string IDs', () => {
      expect(isJSONRPCID('123')).toBe(true);
      expect(isJSONRPCID('abc')).toBe(true);
      expect(isJSONRPCID('')).toBe(true);
    });

    it('should validate number IDs', () => {
      expect(isJSONRPCID(123)).toBe(true);
      expect(isJSONRPCID(0)).toBe(true);
      expect(isJSONRPCID(-1)).toBe(true);
    });

    it('should validate undefined for notifications', () => {
      expect(isJSONRPCID(undefined)).toBe(true);
    });

    it('should reject invalid ID types', () => {
      expect(isJSONRPCID(null)).toBe(false);
      expect(isJSONRPCID({})).toBe(false);
      expect(isJSONRPCID([])).toBe(false);
      expect(isJSONRPCID(true)).toBe(false);
      expect(isJSONRPCID(Symbol())).toBe(false);
    });
  });

  describe('isJSONRPCVersion', () => {
    it('should validate correct version', () => {
      expect(isJSONRPCVersion('2.0')).toBe(true);
    });

    it('should reject invalid versions', () => {
      expect(isJSONRPCVersion('1.0')).toBe(false);
      expect(isJSONRPCVersion('2')).toBe(false);
      expect(isJSONRPCVersion(2)).toBe(false);
      expect(isJSONRPCVersion(2.0)).toBe(false);
      expect(isJSONRPCVersion('3.0')).toBe(false);
      expect(isJSONRPCVersion(null)).toBe(false);
      expect(isJSONRPCVersion(undefined)).toBe(false);
      expect(isJSONRPCVersion({})).toBe(false);
    });
  });

  describe('isJSONRPCSerializedData', () => {
    it('should validate correct serialized data', () => {
      expect(isJSONRPCSerializedData({ serialized: 'test', method: 'test' })).toBe(true);
      expect(isJSONRPCSerializedData({ serialized: '', method: 'test' })).toBe(true);
    });

    it('should reject invalid serialized data', () => {
      expect(isJSONRPCSerializedData({ serialized: 123 })).toBe(false);
      expect(isJSONRPCSerializedData({ serialized: true })).toBe(false);
      expect(isJSONRPCSerializedData({ serialized: null })).toBe(false);
      expect(isJSONRPCSerializedData({ serialized: undefined })).toBe(false);
      expect(isJSONRPCSerializedData({ serialized: {} })).toBe(false);
      expect(isJSONRPCSerializedData({ serialized: [] })).toBe(false);
      expect(isJSONRPCSerializedData({ other: 'test' })).toBe(false);
      expect(isJSONRPCSerializedData({})).toBe(false);
      expect(isJSONRPCSerializedData(null)).toBe(false);
      expect(isJSONRPCSerializedData(undefined)).toBe(false);
      expect(isJSONRPCSerializedData('string')).toBe(false);
      expect(isJSONRPCSerializedData(123)).toBe(false);
    });

    it('should handle objects with additional properties', () => {
      expect(isJSONRPCSerializedData({ serialized: 'test', method: 'test', other: 'value' })).toBe(true);
    });
  });

  describe('wrapHandler', () => {
    type TestMethodMap = {
      test: { params: { value: string }; result: string };
    };

    it('should handle non-JSONRPCError errors', async () => {
      const handler = async () => {
        throw new Error('Test error');
      };

      const wrapped = wrapHandler<TestMethodMap, 'test', JSONRPCContext>(handler);
      const result = await wrapped({}, 'test', { value: 'test' });

      expect(result).toEqual({
        success: false,
        error: {
          code: -32000,
          message: 'Test error',
          data: undefined,
        },
      });
    });

    it('should handle non-Error objects', async () => {
      const handler = async () => {
        throw 'string error'; // not an Error instance
      };

      const wrapped = wrapHandler<TestMethodMap, 'test', JSONRPCContext>(handler);
      const result = await wrapped({}, 'test', { value: 'test' });

      expect(result).toEqual({
        success: false,
        error: {
          code: -32000,
          message: 'Unknown error',
          data: undefined,
        },
      });
    });
  });
});
