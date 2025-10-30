import { describe, it, expect } from 'vitest';
import { deepEqual } from './deepEqual.js';

describe('deepEqual', () => {
  describe('primitives', () => {
    it('should return true for identical primitives', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual('hello', 'hello')).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(false, false)).toBe(true);
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(undefined, undefined)).toBe(true);
    });

    it('should return false for different primitives', () => {
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual('hello', 'world')).toBe(false);
      expect(deepEqual(true, false)).toBe(false);
      expect(deepEqual(null, undefined)).toBe(false);
    });

    it('should return false for different types', () => {
      expect(deepEqual(1, '1')).toBe(false);
      expect(deepEqual(0, false)).toBe(false);
      expect(deepEqual('', false)).toBe(false);
      expect(deepEqual(null, 0)).toBe(false);
      expect(deepEqual(undefined, null)).toBe(false);
    });

    it('should handle NaN correctly', () => {
      expect(deepEqual(Number.NaN, Number.NaN)).toBe(true);
      expect(deepEqual(Number.NaN, 0)).toBe(false);
      expect(deepEqual(Number.NaN, undefined)).toBe(false);
    });

    it('should handle symbols', () => {
      const sym1 = Symbol('test');
      const sym2 = Symbol('test');
      expect(deepEqual(sym1, sym1)).toBe(true);
      expect(deepEqual(sym1, sym2)).toBe(false);
    });

    it('should handle bigint', () => {
      expect(deepEqual(BigInt(123), BigInt(123))).toBe(true);
      expect(deepEqual(BigInt(123), BigInt(456))).toBe(false);
      expect(deepEqual(BigInt(123), 123)).toBe(false);
    });
  });

  describe('arrays', () => {
    it('should return true for identical arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqual(['a', 'b'], ['a', 'b'])).toBe(true);
      expect(deepEqual([], [])).toBe(true);
    });

    it('should return false for arrays with different values', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
    });

    it('should be sensitive to array order', () => {
      expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(false);
      expect(deepEqual(['a', 'b', 'c'], ['c', 'b', 'a'])).toBe(false);
    });

    it('should handle nested arrays', () => {
      expect(
        deepEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 4],
          ],
        ),
      ).toBe(true);
      expect(
        deepEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [4, 3],
          ],
        ),
      ).toBe(false);
    });

    it('should handle arrays with objects', () => {
      expect(deepEqual([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 2 }])).toBe(true);
      expect(deepEqual([{ a: 1 }, { b: 2 }], [{ b: 2 }, { a: 1 }])).toBe(false);
    });
  });

  describe('objects', () => {
    it('should return true for identical objects', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(deepEqual({}, {})).toBe(true);
    });

    it('should be insensitive to property order', () => {
      expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
      expect(deepEqual({ x: 'foo', y: 'bar', z: 'baz' }, { z: 'baz', x: 'foo', y: 'bar' })).toBe(true);
    });

    it('should return false for objects with different values', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
      expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
      expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    });

    it('should return false for objects with different keys', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false);
      expect(deepEqual({ x: 1 }, { y: 1 })).toBe(false);
    });

    it('should handle nested objects', () => {
      expect(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } })).toBe(true);
      expect(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } })).toBe(false);
    });

    it('should handle objects with null and undefined values', () => {
      expect(deepEqual({ a: null }, { a: null })).toBe(true);
      expect(deepEqual({ a: undefined }, { a: undefined })).toBe(true);
      expect(deepEqual({ a: null }, { a: undefined })).toBe(false);
    });
  });

  describe('mixed types', () => {
    it('should handle objects containing arrays', () => {
      const obj1 = { items: [1, 2, 3], name: 'test' };
      const obj2 = { name: 'test', items: [1, 2, 3] };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it('should handle arrays containing objects', () => {
      const arr1 = [{ a: 1 }, { b: 2 }, { c: 3 }];
      const arr2 = [{ a: 1 }, { b: 2 }, { c: 3 }];
      expect(deepEqual(arr1, arr2)).toBe(true);
    });

    it('should handle complex nested structures', () => {
      const obj1 = {
        user: {
          name: 'Alice',
          age: 30,
          hobbies: ['reading', 'coding'],
        },
        metadata: {
          created: '2024-01-01',
          tags: ['active', 'verified'],
        },
      };

      const obj2 = {
        metadata: {
          tags: ['active', 'verified'],
          created: '2024-01-01',
        },
        user: {
          hobbies: ['reading', 'coding'],
          age: 30,
          name: 'Alice',
        },
      };

      expect(deepEqual(obj1, obj2)).toBe(true);
    });
  });

  describe('special objects', () => {
    it('should handle Date objects', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-01');
      const date3 = new Date('2024-01-02');

      expect(deepEqual(date1, date2)).toBe(true);
      expect(deepEqual(date1, date3)).toBe(false);
    });

    it('should handle RegExp objects', () => {
      const regex1 = /test/gi;
      const regex2 = /test/gi;
      const regex3 = /test/g;
      const regex4 = /other/gi;

      expect(deepEqual(regex1, regex2)).toBe(true);
      expect(deepEqual(regex1, regex3)).toBe(false); // Different flags
      expect(deepEqual(regex1, regex4)).toBe(false); // Different pattern
    });
  });

  describe('circular references', () => {
    it('should handle simple circular references', () => {
      const obj1: Record<string, unknown> = { a: 1 };
      obj1['self'] = obj1;

      const obj2: Record<string, unknown> = { a: 1 };
      obj2['self'] = obj2;

      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it('should handle nested circular references', () => {
      const obj1: Record<string, unknown> = { a: 1, nested: {} };
      (obj1['nested'] as Record<string, unknown>)['parent'] = obj1;

      const obj2: Record<string, unknown> = { a: 1, nested: {} };
      (obj2['nested'] as Record<string, unknown>)['parent'] = obj2;

      expect(deepEqual(obj1, obj2)).toBe(true);
    });
  });

  describe('real-world discovery protocol use cases', () => {
    it('should correctly compare discovery response objects with different property orders', () => {
      const response1 = {
        type: 'discovery:wallet:response',
        sessionId: 'session-123',
        responderId: 'responder-456',
        rdns: 'com.example.wallet',
        name: 'Example Wallet',
        icon: 'data:image/svg+xml;base64,ABC123',
        matched: {
          required: {
            technologies: [
              {
                type: 'evm',
                interfaces: ['eip-1193', 'eip-6963'],
                features: ['eip-712'],
              },
            ],
            features: ['account-management'],
          },
        },
        transportConfig: {
          type: 'extension',
          extensionId: 'abc123def456',
        },
      };

      const response2 = {
        transportConfig: {
          extensionId: 'abc123def456',
          type: 'extension',
        },
        matched: {
          required: {
            features: ['account-management'],
            technologies: [
              {
                features: ['eip-712'],
                interfaces: ['eip-1193', 'eip-6963'],
                type: 'evm',
              },
            ],
          },
        },
        icon: 'data:image/svg+xml;base64,ABC123',
        name: 'Example Wallet',
        rdns: 'com.example.wallet',
        responderId: 'responder-456',
        sessionId: 'session-123',
        type: 'discovery:wallet:response',
      };

      expect(deepEqual(response1, response2)).toBe(true);
    });

    it('should detect different discovery responses', () => {
      const response1 = {
        type: 'discovery:wallet:response',
        sessionId: 'session-123',
        responderId: 'responder-456',
        rdns: 'com.example.wallet',
        name: 'Example Wallet',
        matched: {
          required: {
            technologies: [{ type: 'evm', interfaces: ['eip-1193'] }],
            features: ['account-management'],
          },
        },
      };

      const response2 = {
        type: 'discovery:wallet:response',
        sessionId: 'session-123',
        responderId: 'responder-789', // Different responder ID
        rdns: 'com.example.wallet',
        name: 'Example Wallet',
        matched: {
          required: {
            technologies: [{ type: 'evm', interfaces: ['eip-1193'] }],
            features: ['account-management'],
          },
        },
      };

      expect(deepEqual(response1, response2)).toBe(false);
    });

    it('should handle transportConfig variations correctly', () => {
      const config1 = {
        type: 'extension',
        extensionId: 'abc123',
        config: { timeout: 5000, retries: 3 },
      };

      const config2 = {
        config: { retries: 3, timeout: 5000 },
        extensionId: 'abc123',
        type: 'extension',
      };

      expect(deepEqual(config1, config2)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return true for same reference', () => {
      const obj = { a: 1, b: 2 };
      expect(deepEqual(obj, obj)).toBe(true);
    });

    it('should handle empty objects and arrays', () => {
      expect(deepEqual({}, {})).toBe(true);
      expect(deepEqual([], [])).toBe(true);
      expect(deepEqual({}, [])).toBe(false);
    });

    it('should return false when comparing object to array', () => {
      expect(deepEqual({ 0: 'a', 1: 'b' }, ['a', 'b'])).toBe(false);
    });

    it('should handle objects with numeric string keys', () => {
      expect(deepEqual({ '0': 'a', '1': 'b' }, { '0': 'a', '1': 'b' })).toBe(true);
    });
  });
});
