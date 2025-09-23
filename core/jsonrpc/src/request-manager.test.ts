import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TimeoutError } from './error.js';
import { RequestManager } from './request-manager.js';
import type { JSONRPCSerializer } from './types.js';

describe('RequestManager', () => {
  let manager: RequestManager;

  beforeEach(() => {
    manager = new RequestManager();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should track pending requests', () => {
    const id = '1';
    const resolve = vi.fn();
    const reject = vi.fn();

    manager.addRequest(id, resolve, reject);
    expect(manager.hasPendingRequest(id)).toBe(true);
    expect(manager.getPendingCount()).toBe(1);
  });

  it('should handle successful responses and clear timer if exists', async () => {
    const id = '1';
    const resolve = vi.fn();
    const reject = vi.fn();

    manager.addRequest(id, resolve, reject, 1);
    const handled = await manager.handleResponse(id, 42);

    expect(handled).toBe(true);
    expect(resolve).toHaveBeenCalledWith(42);
    expect(reject).not.toHaveBeenCalled();
    expect(manager.hasPendingRequest(id)).toBe(false);

    // Advance time past the timeout
    vi.advanceTimersByTime(1000);

    // The timeout should have been cleared, so reject should not be called
    expect(reject).not.toHaveBeenCalled();
  });

  it('should handle error responses', async () => {
    const id = '1';
    const resolve = vi.fn();
    const reject = vi.fn();

    manager.addRequest(id, resolve, reject);
    const handled = await manager.handleResponse(id, undefined, {
      code: -32000,
      message: 'Server error',
    });

    expect(handled).toBe(true);
    expect(reject).toHaveBeenCalled();
    expect(resolve).not.toHaveBeenCalled();
    expect(manager.hasPendingRequest(id)).toBe(false);
  });

  it('should handle request timeouts', () => {
    const id = '1';
    const resolve = vi.fn();
    const reject = vi.fn();

    manager.addRequest(id, resolve, reject, 1);

    // Advance time past the timeout
    vi.advanceTimersByTime(1000);

    expect(reject).toHaveBeenCalledWith(expect.any(TimeoutError));
    expect(resolve).not.toHaveBeenCalled();
    expect(manager.hasPendingRequest(id)).toBe(false);
  });

  it('should handle responses with serializers', async () => {
    const id = '1';
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

    manager.addRequest(id, resolve, reject, 0, serializer);
    const handled = await manager.handleResponse(id, { serialized: 'Hello World!', method: id });

    expect(handled).toBe(true);
    expect(resolve).toHaveBeenCalledWith('Hello World!');
    expect(reject).not.toHaveBeenCalled();
    expect(manager.hasPendingRequest(id)).toBe(false);
  });

  it('should handle cleanup of pending requests', () => {
    const id = '1';
    const resolve = vi.fn();
    const reject = vi.fn();

    const cleanup = manager.addRequest(id, resolve, reject, 1);
    cleanup();

    // Advance time past the timeout
    vi.advanceTimersByTime(1000);

    // The request should have been cleaned up, so neither resolve nor reject should be called
    expect(resolve).not.toHaveBeenCalled();
    expect(reject).not.toHaveBeenCalled();
    expect(manager.hasPendingRequest(id)).toBe(false);
  });

  it('should ignore responses for unknown requests', async () => {
    const handled = await manager.handleResponse('unknown', 42);
    expect(handled).toBe(false);
  });

  it('should reject all pending requests and clear timers', () => {
    const resolve1 = vi.fn();
    const reject1 = vi.fn();
    const resolve2 = vi.fn();
    const reject2 = vi.fn();

    manager.addRequest('1', resolve1, reject1, 1);
    manager.addRequest('2', resolve2, reject2, 2);

    const error = new Error('Connection closed');
    manager.rejectAllRequests(error);

    // Advance time past both timeouts
    vi.advanceTimersByTime(2000);

    // Both requests should be rejected with the error
    expect(reject1).toHaveBeenCalledWith(error);
    expect(reject2).toHaveBeenCalledWith(error);
    expect(resolve1).not.toHaveBeenCalled();
    expect(resolve2).not.toHaveBeenCalled();
    expect(manager.hasPendingRequest('1')).toBe(false);
    expect(manager.hasPendingRequest('2')).toBe(false);
  });

  it('should handle multiple requests with different timeouts', () => {
    const resolve1 = vi.fn();
    const reject1 = vi.fn();
    const resolve2 = vi.fn();
    const reject2 = vi.fn();

    manager.addRequest('1', resolve1, reject1, 1);
    manager.addRequest('2', resolve2, reject2, 2);

    // Advance time past first timeout
    vi.advanceTimersByTime(1000);

    expect(reject1).toHaveBeenCalledWith(expect.any(TimeoutError));
    expect(reject2).not.toHaveBeenCalled();
    expect(manager.hasPendingRequest('1')).toBe(false);
    expect(manager.hasPendingRequest('2')).toBe(true);

    // Advance time past second timeout
    vi.advanceTimersByTime(1000);

    expect(reject2).toHaveBeenCalledWith(expect.any(TimeoutError));
    expect(manager.hasPendingRequest('2')).toBe(false);
  });

  it('should handle responses that arrive after timeout', async () => {
    const id = '1';
    const resolve = vi.fn();
    const reject = vi.fn();

    manager.addRequest(id, resolve, reject, 1);

    // Advance time past timeout
    vi.advanceTimersByTime(1000);

    expect(reject).toHaveBeenCalledWith(expect.any(TimeoutError));
    expect(manager.hasPendingRequest(id)).toBe(false);

    // Try to handle response after timeout
    const handled = await manager.handleResponse(id, 42);
    expect(handled).toBe(false);
    expect(resolve).not.toHaveBeenCalled();
  });

  it('should handle cleanup of timed out requests', () => {
    const id = '1';
    const resolve = vi.fn();
    const reject = vi.fn();

    manager.addRequest(id, resolve, reject, 1);

    // Advance time past timeout
    vi.advanceTimersByTime(1000);

    expect(reject).toHaveBeenCalledWith(expect.any(TimeoutError));
    expect(manager.hasPendingRequest(id)).toBe(false);

    // Try to clean up after timeout
    const cleanup = manager.addRequest(id, resolve, reject, 1);
    cleanup();

    // Advance time again
    vi.advanceTimersByTime(1000);

    // No additional calls should be made
    expect(reject).toHaveBeenCalledTimes(1);
  });
});
