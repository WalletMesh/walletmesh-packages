import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JSONRPCError } from './error.js';
import { MethodManager } from './method-manager.js';
import type { JSONRPCContext, JSONRPCSerializer, MethodResponse } from './types.js';

describe('MethodManager', () => {
  type TestMethodMap = {
    add: { params: { a: number; b: number }; result: number };
    greet: { params: { name: string }; result: string };
    getData: { params: undefined; result: { value: string } };
  };

  let manager: MethodManager<TestMethodMap>;

  beforeEach(() => {
    manager = new MethodManager<TestMethodMap>();
  });

  describe('Method Registration', () => {
    it('should register and retrieve methods', () => {
      const handler = async (
        _context: JSONRPCContext,
        _method: string,
        params: { a: number; b: number },
      ): Promise<MethodResponse<number>> => ({
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
      const handler = async (
        _context: JSONRPCContext,
        _method: string,
        params: { a: number; b: number },
      ): Promise<MethodResponse<number>> => ({
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
          serialize: async (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: async (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: async (method, result) => ({ serialized: result, method }),
          deserialize: async (_method, data) => data.serialized,
        },
      };

      manager.registerSerializer('greet', serializer);
      const retrievedSerializer = manager.getSerializer('greet');
      expect(retrievedSerializer).toBe(serializer);
    });

    it('should handle methods and serializers independently', () => {
      const handler = async (
        _context: JSONRPCContext,
        _method: string,
        params: { name: string },
      ): Promise<MethodResponse<string>> => ({
        success: true,
        data: `Hello ${params.name}!`,
      });

      const serializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: async (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: async (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: async (method, result) => ({ serialized: result, method }),
          deserialize: async (_method, data) => data.serialized,
        },
      };

      manager.registerMethod('greet', handler);
      manager.registerSerializer('greet', serializer);

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
      manager.handleResponse(nonExistentId, 42);
    });

    it('should clear timeout when handling response for request with timeout', () => {
      vi.useFakeTimers();
      const resolve = vi.fn();
      const reject = vi.fn();

      manager.addPendingRequest('1', resolve, reject, 1);
      manager.handleResponse('1', 42);

      vi.advanceTimersByTime(1000);

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

      manager.addPendingRequest('1', resolve, reject, 0);
      manager.handleResponse('1', 'test');
      expect(resolve).toHaveBeenCalledWith('test');
      expect(reject).not.toHaveBeenCalled();

      resolve.mockClear();
      reject.mockClear();
      manager.addPendingRequest('2', resolve, reject, 0);
      manager.handleResponse('2', 42);
      expect(resolve).toHaveBeenCalledWith(42);
      expect(reject).not.toHaveBeenCalled();

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

    it('should handle serialized responses', async () => {
      const resolve = vi.fn();
      const reject = vi.fn();
      const serializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: async (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: async (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: async (method, result) => ({ serialized: result, method }),
          deserialize: async (_method, data) => data.serialized,
        },
      };

      manager.addPendingRequest('1', resolve, reject, 0, serializer);
      await manager.handleResponse('1', { serialized: 'Hello!', method: '1' });

      expect(resolve).toHaveBeenCalledWith('Hello!');
      expect(reject).not.toHaveBeenCalled();
    });

    it('should handle serialized responses with missing or invalid method', async () => {
      const resolve = vi.fn();
      const reject = vi.fn();
      const serializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: async (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: async (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: async (method, result) => ({ serialized: result, method }),
          deserialize: async (_method, data) => data.serialized,
        },
      };

      manager.addPendingRequest('1', resolve, reject, 0, serializer);
      await manager.handleResponse('1', { serialized: 'Hello!' });

      expect(resolve).toHaveBeenCalledWith('Hello!');
      expect(reject).not.toHaveBeenCalled();
    });

    it('should handle invalid serialized responses', () => {
      const resolve = vi.fn();
      const reject = vi.fn();
      const serializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: async (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: async (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: async (method, result) => ({ serialized: result, method }),
          deserialize: async (_method, data) => data.serialized,
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

    it('should handle deserialization errors', async () => {
      const resolve = vi.fn();
      const reject = vi.fn();
      const serializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: async (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: async (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: async (method, result) => ({ serialized: result, method }),
          deserialize: async () => {
            throw new Error('Failed to deserialize');
          },
        },
      };

      manager.addPendingRequest('1', resolve, reject, 0, serializer);
      await manager.handleResponse('1', { serialized: 'invalid', method: '1' });

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
          serialize: async (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: async (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: async (method, result) => ({ serialized: result, method }),
          deserialize: async (_method, data) => data.serialized,
        },
      };

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

  describe('Phantom Timeout Prevention', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should not trigger phantom timeout after successful response', async () => {
      const resolve = vi.fn();
      const reject = vi.fn();
      const requestId = 'test-phantom-timeout';

      // Add a pending request with a 1 second timeout
      manager.addPendingRequest(requestId, resolve, reject, 1);

      // Simulate a successful response arriving before timeout
      await manager.handleResponse(requestId, { success: true });

      // Advance time past the timeout period
      vi.advanceTimersByTime(1500);

      // The resolve should have been called once from the response
      expect(resolve).toHaveBeenCalledTimes(1);
      expect(resolve).toHaveBeenCalledWith({ success: true });

      // The reject should NOT have been called (phantom timeout prevented)
      expect(reject).toHaveBeenCalledTimes(0);
    });

    it('should not trigger phantom timeout after error response', async () => {
      const resolve = vi.fn();
      const reject = vi.fn();
      const requestId = 'test-phantom-error-timeout';

      // Add a pending request with a 1 second timeout
      manager.addPendingRequest(requestId, resolve, reject, 1);

      // Simulate an error response arriving before timeout
      await manager.handleResponse(requestId, null, {
        code: -32000,
        message: 'Test error',
      });

      // Advance time past the timeout period
      vi.advanceTimersByTime(1500);

      // The reject should have been called once from the error response
      expect(reject).toHaveBeenCalledTimes(1);
      expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));

      // The resolve should NOT have been called
      expect(resolve).toHaveBeenCalledTimes(0);
    });

    it('should still timeout if no response is received', async () => {
      const resolve = vi.fn();
      const reject = vi.fn();
      const requestId = 'test-real-timeout';

      // Add a pending request with a 1 second timeout
      manager.addPendingRequest(requestId, resolve, reject, 1);

      // Advance time past the timeout period WITHOUT sending a response
      vi.advanceTimersByTime(1500);

      // The reject should have been called once from the timeout
      expect(reject).toHaveBeenCalledTimes(1);
      expect(reject).toHaveBeenCalledWith(expect.any(Error));

      // The resolve should NOT have been called
      expect(resolve).toHaveBeenCalledTimes(0);
    });

    it('should handle race condition where timeout and response arrive simultaneously', async () => {
      const resolve = vi.fn();
      const reject = vi.fn();
      const requestId = 'test-race-condition';

      // Add a pending request with a very short timeout
      manager.addPendingRequest(requestId, resolve, reject, 0.001); // 1ms timeout

      // Advance time to almost trigger timeout
      vi.advanceTimersByTime(0.5);

      // Handle response at the same time timeout would fire
      const responsePromise = manager.handleResponse(requestId, { data: 'response' });
      vi.advanceTimersByTime(1);

      await responsePromise;

      // Either the timeout or the response should win, but not both
      const totalCalls = resolve.mock.calls.length + reject.mock.calls.length;
      expect(totalCalls).toBe(1);

      // If resolve was called, it should be with the response data
      if (resolve.mock.calls.length > 0) {
        expect(resolve).toHaveBeenCalledWith({ data: 'response' });
      }
    });
  });
});
