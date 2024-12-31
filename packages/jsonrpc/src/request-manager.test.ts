import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RequestManager } from './request-manager.js';
import { JSONRPCError } from './error.js';
import type { JSONRPCMethodMap, JSONRPCSerializer } from './types.js';

interface TestMethodMap extends JSONRPCMethodMap {
  add: {
    params: { a: number; b: number };
    result: number;
  };
  greet: {
    params: { name: string };
    result: string;
  };
}

describe('RequestManager', () => {
  let manager: RequestManager<TestMethodMap>;

  beforeEach(() => {
    manager = new RequestManager<TestMethodMap>();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should track pending requests', () => {
    const resolve = vi.fn();
    const reject = vi.fn();
    const id = 'request-1';

    manager.addRequest(id, resolve, reject);
    expect(manager.hasPendingRequest(id)).toBe(true);
    expect(manager.getPendingCount()).toBe(1);
  });

  it('should handle successful responses and clear timer if exists', () => {
    const resolve = vi.fn();
    const reject = vi.fn();
    const id = 'request-1';
    const result = 42;
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    manager.addRequest(id, resolve, reject, 1); // Add with 1 second timeout
    const handled = manager.handleResponse(id, result);

    expect(handled).toBe(true);
    expect(resolve).toHaveBeenCalledWith(result);
    expect(reject).not.toHaveBeenCalled();
    expect(manager.hasPendingRequest(id)).toBe(false);
    expect(clearTimeoutSpy).toHaveBeenCalled(); // Verify clearTimeout was called
  });

  it('should handle error responses', () => {
    const resolve = vi.fn();
    const reject = vi.fn();
    const id = 'request-1';
    const error = { code: -32000, message: 'Test error' };

    manager.addRequest(id, resolve, reject);
    const handled = manager.handleResponse(id, undefined, error);

    expect(handled).toBe(true);
    expect(resolve).not.toHaveBeenCalled();
    expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));

    const rejectCall = reject.mock.calls[0];
    if (rejectCall) {
      const errorArg = rejectCall[0] as JSONRPCError;
      expect(errorArg.code).toBe(error.code);
      expect(errorArg.message).toBe(error.message);
    }

    expect(manager.hasPendingRequest(id)).toBe(false);
  });

  it('should handle request timeouts', () => {
    const resolve = vi.fn();
    const reject = vi.fn();
    const id = 'request-1';

    manager.addRequest(id, resolve, reject, 1); // 1 second timeout
    vi.advanceTimersByTime(1000);

    expect(reject).toHaveBeenCalledWith(expect.any(JSONRPCError));

    const rejectCall = reject.mock.calls[0];
    if (rejectCall) {
      const errorArg = rejectCall[0] as JSONRPCError;
      expect(errorArg.code).toBe(-32000);
      expect(errorArg.message).toBe('Request timed out');
    }

    expect(manager.hasPendingRequest(id)).toBe(false);
  });

  it('should handle responses with serializers', () => {
    const resolve = vi.fn();
    const reject = vi.fn();
    const id = 'request-1';
    const serializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (params) => ({ serialized: JSON.stringify(params) }),
        deserialize: (data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: (result) => ({ serialized: result }),
        deserialize: (data) => data.serialized,
      },
    };

    manager.addRequest(id, resolve, reject, 0, serializer);
    const handled = manager.handleResponse(id, { serialized: 'Hello, World!' });

    expect(handled).toBe(true);
    expect(resolve).toHaveBeenCalledWith('Hello, World!');
    expect(reject).not.toHaveBeenCalled();
    expect(manager.hasPendingRequest(id)).toBe(false);
  });

  it('should handle cleanup of pending requests', () => {
    const resolve = vi.fn();
    const reject = vi.fn();
    const id = 'request-1';

    const cleanup = manager.addRequest(id, resolve, reject, 1);
    cleanup();

    expect(manager.hasPendingRequest(id)).toBe(false);
    expect(manager.getPendingCount()).toBe(0);
    vi.advanceTimersByTime(1000);
    expect(reject).not.toHaveBeenCalled(); // Timeout should not trigger
  });

  it('should ignore responses for unknown requests', () => {
    const handled = manager.handleResponse('unknown-id', 42);
    expect(handled).toBe(false);
  });

  it('should reject all pending requests and clear timers', () => {
    const resolve1 = vi.fn();
    const reject1 = vi.fn();
    const resolve2 = vi.fn();
    const reject2 = vi.fn();
    const error = new Error('Shutting down');
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    manager.addRequest('request-1', resolve1, reject1, 1); // Add with 1 second timeout
    manager.addRequest('request-2', resolve2, reject2, 2); // Add with 2 second timeout

    manager.rejectAllRequests(error);

    expect(reject1).toHaveBeenCalledWith(error);
    expect(reject2).toHaveBeenCalledWith(error);
    expect(manager.getPendingCount()).toBe(0);
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(2); // Verify clearTimeout was called for both requests
  });

  it('should handle multiple requests with different timeouts', () => {
    const resolve1 = vi.fn();
    const reject1 = vi.fn();
    const resolve2 = vi.fn();
    const reject2 = vi.fn();

    manager.addRequest('request-1', resolve1, reject1, 1); // 1 second timeout
    manager.addRequest('request-2', resolve2, reject2, 2); // 2 second timeout

    vi.advanceTimersByTime(1000);
    expect(reject1).toHaveBeenCalled();
    expect(reject2).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(reject2).toHaveBeenCalled();
  });

  it('should handle responses that arrive after timeout', () => {
    const resolve = vi.fn();
    const reject = vi.fn();
    const id = 'request-1';

    manager.addRequest(id, resolve, reject, 1);
    vi.advanceTimersByTime(1000); // Trigger timeout
    const handled = manager.handleResponse(id, 42);

    expect(handled).toBe(false); // Response should be ignored
    expect(resolve).not.toHaveBeenCalled();
  });

  it('should handle cleanup of timed out requests', () => {
    const resolve = vi.fn();
    const reject = vi.fn();
    const id = 'request-1';

    const cleanup = manager.addRequest(id, resolve, reject, 1);
    vi.advanceTimersByTime(1000); // Trigger timeout
    cleanup(); // Should not throw or cause issues

    expect(manager.hasPendingRequest(id)).toBe(false);
    expect(manager.getPendingCount()).toBe(0);
  });
});
