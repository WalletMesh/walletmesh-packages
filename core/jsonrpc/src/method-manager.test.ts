import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MethodManager } from './method-manager.js';
import { JSONRPCError } from './error.js';
import type { JSONRPCContext, JSONRPCSerializer, MethodHandler } from './types.js';

describe('MethodManager', () => {
  type TestMethodMap = {
    add: { params: { a: number; b: number }; result: number };
    greet: { params: { name: string }; result: string };
    getData: { params: undefined; result: { value: string } };
  };

  let manager: MethodManager<TestMethodMap>;

  beforeEach(() => {
    manager = new MethodManager<TestMethodMap, JSONRPCContext>();
  });

  describe('Method Registration', () => {
    it('should register and retrieve methods', () => {
      const handler: MethodHandler<TestMethodMap, 'add', JSONRPCContext> = async (
        _context,
        _method,
        params,
      ) => ({
        success: true,
        data: params.a + params.b,
      });

      manager.registerMethod('add', handler);
      const method = manager.getMethod('add');

      expect(method).toBeDefined();
      const registeredMethod = method as NonNullable<typeof method>;
      expect(registeredMethod).toBe(handler);
    });

    it('should register and retrieve methods independently', () => {
      const handler: MethodHandler<TestMethodMap, 'add', JSONRPCContext> = async (
        _context,
        _method,
        params,
      ) => ({
        success: true,
        data: params.a + params.b,
      });

      manager.registerMethod('add', handler);
      const method = manager.getMethod('add');

      expect(method).toBe(handler);
    });

    it('should register and retrieve serializers independently', () => {
      const serializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (method, result) => ({ serialized: result, method }),
          deserialize: (_method, data) => data.serialized,
        },
      };

      manager.registerSerializer('greet', serializer);
      const retrievedSerializer = manager.getSerializer('greet');
      expect(retrievedSerializer).toBe(serializer);
    });

    it('should handle methods and serializers independently', () => {
      const handler: MethodHandler<TestMethodMap, 'greet', JSONRPCContext> = async (
        _context,
        _method,
        params,
      ) => ({
        success: true,
        data: `Hello ${params.name}!`,
      });

      const serializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (method, result) => ({ serialized: result, method }),
          deserialize: (_method, data) => data.serialized,
        },
      };

      // Register them independently
      manager.registerMethod('greet', handler);
      manager.registerSerializer('greet', serializer);

      // Get them independently
      const method = manager.getMethod('greet');
      const retrievedSerializer = manager.getSerializer('greet');

      expect(method).toBe(handler);
      expect(retrievedSerializer).toBe(serializer);
    });
  });

  describe('Request Handling', () => {
    it('should handle pending requests with timeouts', () => {
      vi.useFakeTimers();

      const resolve = vi.fn();
      const reject = vi.fn();

      manager.addPendingRequest('1', resolve, reject, 1);

      vi.advanceTimersByTime(1000);

      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));
      const calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const [firstCall] = calls;
      const [error] = firstCall as [JSONRPCError];
      expect(error.message).toBe('Request timed out');

      vi.useRealTimers();
    });

    it('should ignore response if no pending request exists', () => {
      const nonExistentId = 'non-existent';
      // This should not throw and should just return
      manager.handleResponse(nonExistentId, 42);
    });

    it('should clear timeout when handling response for request with timeout', () => {
      vi.useFakeTimers();
      const resolve = vi.fn();
      const reject = vi.fn();

      manager.addPendingRequest('1', resolve, reject, 1);
      manager.handleResponse('1', 42);

      // Advance time past the timeout
      vi.advanceTimersByTime(1000);

      // The timeout should have been cleared, so reject should not be called
      expect(reject).not.toHaveBeenCalled();
      expect(resolve).toHaveBeenCalledWith(42);

      vi.useRealTimers();
    });

    it('should handle successful responses', () => {
      const resolve = vi.fn();
      const reject = vi.fn();

      manager.addPendingRequest('1', resolve, reject, 0);
      manager.handleResponse('1', 42);

      expect(resolve).toHaveBeenCalledWith(42);
      expect(reject).not.toHaveBeenCalled();
    });

    it('should handle undefined result', () => {
      const resolve = vi.fn();
      const reject = vi.fn();

      manager.addPendingRequest('1', resolve, reject, 0);
      manager.handleResponse('1', undefined);

      expect(resolve).toHaveBeenCalledWith(undefined);
      expect(reject).not.toHaveBeenCalled();
    });

    it('should handle null result', () => {
      const resolve = vi.fn();
      const reject = vi.fn();

      manager.addPendingRequest('1', resolve, reject, 0);
      manager.handleResponse('1', null);

      expect(resolve).toHaveBeenCalledWith(null);
      expect(reject).not.toHaveBeenCalled();
    });

    it('should handle primitive result types', () => {
      const resolve = vi.fn();
      const reject = vi.fn();

      // Test string
      manager.addPendingRequest('1', resolve, reject, 0);
      manager.handleResponse('1', 'test');
      expect(resolve).toHaveBeenCalledWith('test');
      expect(reject).not.toHaveBeenCalled();

      // Test number
      resolve.mockClear();
      reject.mockClear();
      manager.addPendingRequest('2', resolve, reject, 0);
      manager.handleResponse('2', 42);
      expect(resolve).toHaveBeenCalledWith(42);
      expect(reject).not.toHaveBeenCalled();

      // Test boolean
      resolve.mockClear();
      reject.mockClear();
      manager.addPendingRequest('3', resolve, reject, 0);
      manager.handleResponse('3', true);
      expect(resolve).toHaveBeenCalledWith(true);
      expect(reject).not.toHaveBeenCalled();
    });

    it('should handle error responses', () => {
      const resolve = vi.fn();
      const reject = vi.fn();

      // Test with string data
      manager.addPendingRequest('1', resolve, reject, 0);
      manager.handleResponse('1', undefined, {
        code: -32601,
        message: 'Method not found',
        data: 'test',
      });

      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));
      let calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      let [firstCall] = calls;
      let [error] = firstCall as [JSONRPCError];
      expect(error.code).toBe(-32601);
      expect(error.message).toBe('Method not found');
      expect(error.data).toBe('test');
      expect(resolve).not.toHaveBeenCalled();

      // Test with object data
      resolve.mockClear();
      reject.mockClear();
      manager.addPendingRequest('2', resolve, reject, 0);
      manager.handleResponse('2', undefined, {
        code: -32601,
        message: 'Method not found',
        data: { method: 'test', details: 'not found' },
      });

      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));
      calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      [firstCall] = calls;
      [error] = firstCall as [JSONRPCError];
      expect(error.code).toBe(-32601);
      expect(error.message).toBe('Method not found');
      expect(error.data).toEqual({ method: 'test', details: 'not found' });
      expect(resolve).not.toHaveBeenCalled();

      // Test with undefined data
      resolve.mockClear();
      reject.mockClear();
      manager.addPendingRequest('3', resolve, reject, 0);
      manager.handleResponse('3', undefined, {
        code: -32601,
        message: 'Method not found',
      });

      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));
      calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      [firstCall] = calls;
      [error] = firstCall as [JSONRPCError];
      expect(error.code).toBe(-32601);
      expect(error.message).toBe('Method not found');
      expect(error.data).toBeUndefined();
      expect(resolve).not.toHaveBeenCalled();
    });

    it('should handle serialized responses', () => {
      const resolve = vi.fn();
      const reject = vi.fn();
      const serializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (method, result) => ({ serialized: result, method }),
          deserialize: (_method, data) => data.serialized,
        },
      };

      manager.addPendingRequest('1', resolve, reject, 0, serializer);
      manager.handleResponse('1', { serialized: 'Hello!', method: '1' });

      expect(resolve).toHaveBeenCalledWith('Hello!');
      expect(reject).not.toHaveBeenCalled();
    });

    it('should handle serialized responses with missing or invalid method', () => {
      const resolve = vi.fn();
      const reject = vi.fn();
      const serializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (method, result) => ({ serialized: result, method }),
          deserialize: (_method, data) => data.serialized,
        },
      };

      // Test with missing method property
      manager.addPendingRequest('1', resolve, reject, 0, serializer);
      manager.handleResponse('1', { serialized: 'Hello!' });

      expect(resolve).toHaveBeenCalledWith('Hello!');
      expect(reject).not.toHaveBeenCalled();

      // Test with non-string method property
      resolve.mockClear();
      reject.mockClear();
      manager.addPendingRequest('2', resolve, reject, 0, serializer);
      manager.handleResponse('2', { serialized: 'Hello!', method: 123 });

      expect(resolve).toHaveBeenCalledWith('Hello!');
      expect(reject).not.toHaveBeenCalled();
    });

    it('should handle invalid serialized responses', () => {
      const resolve = vi.fn();
      const reject = vi.fn();
      const serializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (method, result) => ({ serialized: result, method }),
          deserialize: (_method, data) => data.serialized,
        },
      };

      manager.addPendingRequest('1', resolve, reject, 0, serializer);
      manager.handleResponse('1', { invalid: 'format' });

      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));
      const calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const [firstCall] = calls;
      const [error] = firstCall as [JSONRPCError];
      expect(error.code).toBe(-32603);
      expect(error.message).toBe('Invalid serialized result format');
      expect(resolve).not.toHaveBeenCalled();
    });

    it('should handle deserialization errors', () => {
      const resolve = vi.fn();
      const reject = vi.fn();
      const serializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (method, result) => ({ serialized: result, method }),
          deserialize: () => {
            throw new Error('Failed to deserialize');
          },
        },
      };

      manager.addPendingRequest('1', resolve, reject, 0, serializer);
      manager.handleResponse('1', { serialized: 'invalid', method: '1' });

      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));
      const calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const [firstCall] = calls;
      const [error] = firstCall as [JSONRPCError];
      expect(error.code).toBe(-32000);
      expect(error.message).toBe('Failed to deserialize result');
      expect(resolve).not.toHaveBeenCalled();
    });

    it('should handle non-JSON-serializable results', () => {
      const resolve = vi.fn();
      const reject = vi.fn();
      const circular = { ref: {} };
      circular.ref = circular;

      manager.addPendingRequest('1', resolve, reject, 0);
      manager.handleResponse('1', circular);

      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));
      const calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const [firstCall] = calls;
      const [error] = firstCall as [JSONRPCError];
      expect(error.code).toBe(-32603);
      expect(error.message).toBe('Result is not JSON-serializable');
      expect(resolve).not.toHaveBeenCalled();
    });

    it('should handle invalid result types', () => {
      const resolve = vi.fn();
      const reject = vi.fn();

      // Test with arrow function
      manager.addPendingRequest('1', resolve, reject, 0);
      manager.handleResponse('1', () => {});

      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));
      let calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      let [firstCall] = calls;
      let [error] = firstCall as [JSONRPCError];
      expect(error.code).toBe(-32603);
      expect(error.message).toBe('Invalid result type');
      expect(resolve).not.toHaveBeenCalled();

      // Test with regular function
      resolve.mockClear();
      reject.mockClear();
      manager.addPendingRequest('2', resolve, reject, 0);
      function testFunc() {
        return 'test';
      }
      manager.handleResponse('2', testFunc);

      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));
      calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      [firstCall] = calls;
      [error] = firstCall as [JSONRPCError];
      expect(error.code).toBe(-32603);
      expect(error.message).toBe('Invalid result type');
      expect(resolve).not.toHaveBeenCalled();

      // Test with Symbol
      resolve.mockClear();
      reject.mockClear();
      manager.addPendingRequest('3', resolve, reject, 0);
      manager.handleResponse('3', Symbol('test'));

      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));
      calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      [firstCall] = calls;
      [error] = firstCall as [JSONRPCError];
      expect(error.code).toBe(-32603);
      expect(error.message).toBe('Invalid result type');
      expect(resolve).not.toHaveBeenCalled();
    });

    it('should handle invalid serialized data format', () => {
      const resolve = vi.fn();
      const reject = vi.fn();
      const serializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (method, result) => ({ serialized: result, method }),
          deserialize: (_method, data) => data.serialized,
        },
      };

      // Test with null result
      manager.addPendingRequest('1', resolve, reject, 0, serializer);
      manager.handleResponse('1', null);

      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));
      let calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      let [firstCall] = calls;
      let [error] = firstCall as [JSONRPCError];
      expect(error.code).toBe(-32603);
      expect(error.message).toBe('Invalid serialized result format');
      expect(resolve).not.toHaveBeenCalled();

      // Test with non-object result
      resolve.mockClear();
      reject.mockClear();
      manager.addPendingRequest('2', resolve, reject, 0, serializer);
      manager.handleResponse('2', 'not an object');

      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));
      calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      [firstCall] = calls;
      [error] = firstCall as [JSONRPCError];
      expect(error.code).toBe(-32603);
      expect(error.message).toBe('Invalid serialized result format');
      expect(resolve).not.toHaveBeenCalled();

      // Test with object missing serialized property
      resolve.mockClear();
      reject.mockClear();
      manager.addPendingRequest('3', resolve, reject, 0, serializer);
      manager.handleResponse('3', { notSerialized: 'test' });

      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));
      calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      [firstCall] = calls;
      [error] = firstCall as [JSONRPCError];
      expect(error.code).toBe(-32603);
      expect(error.message).toBe('Invalid serialized result format');
      expect(resolve).not.toHaveBeenCalled();

      // Test with non-string serialized value
      resolve.mockClear();
      reject.mockClear();
      manager.addPendingRequest('4', resolve, reject, 0, serializer);
      manager.handleResponse('4', { serialized: 123, method: '4' });

      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));
      calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      [firstCall] = calls;
      [error] = firstCall as [JSONRPCError];
      expect(error.code).toBe(-32603);
      expect(error.message).toBe('Invalid serialized result format');
      expect(resolve).not.toHaveBeenCalled();
    });
  });

  describe('Request Cleanup', () => {
    it('should reject all pending requests', () => {
      const resolve1 = vi.fn();
      const reject1 = vi.fn();
      const resolve2 = vi.fn();
      const reject2 = vi.fn();

      manager.addPendingRequest('1', resolve1, reject1, 0);
      manager.addPendingRequest('2', resolve2, reject2, 0);

      const reason = new Error('Connection closed');
      manager.rejectAllRequests(reason);

      expect(reject1).toHaveBeenCalledWith(reason);
      expect(reject2).toHaveBeenCalledWith(reason);
      expect(resolve1).not.toHaveBeenCalled();
      expect(resolve2).not.toHaveBeenCalled();
    });

    it('should clean up timeouts when rejecting all requests', () => {
      vi.useFakeTimers();

      const resolve = vi.fn();
      const reject = vi.fn();

      manager.addPendingRequest('1', resolve, reject, 1);
      manager.rejectAllRequests(new Error('Connection closed'));

      vi.advanceTimersByTime(1000);

      // The timeout should have been cleared, so reject should only be called once
      expect(reject).toHaveBeenCalledTimes(1);
      expect(reject).toHaveBeenCalledWith(expect.any(Error));
      const calls = reject.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const [firstCall] = calls;
      const [error] = firstCall as [Error];
      expect(error.message).toBe('Connection closed');

      vi.useRealTimers();
    });
  });
});
