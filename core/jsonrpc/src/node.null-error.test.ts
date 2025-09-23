import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JSONRPCNode } from './node.js';
import type { JSONRPCTransport } from './types.js';

describe('JSONRPCNode - null error handling', () => {
  let transport: JSONRPCTransport;
  let messageHandler: ((message: unknown) => void) | undefined;

  beforeEach(() => {
    transport = {
      send: vi.fn().mockResolvedValue(undefined),
      onMessage: vi.fn((handler) => {
        messageHandler = handler;
      }),
    };
  });

  it('should handle response with error: null correctly', async () => {
    // Define method map
    type TestMethods = {
      testMethod: {
        params: { value: string };
        result: { success: boolean };
      };
    };

    const node = new JSONRPCNode<TestMethods>(transport);

    // Make a request
    const requestPromise = node.callMethod('testMethod', { value: 'test' });

    // Wait for the request to be sent and capture it
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Get the sent request to extract the ID
    const sentMessage = vi.mocked(transport.send).mock.calls[0]?.[0] as {
      id: string | number;
      jsonrpc: string;
      method: string;
      params?: unknown;
    };
    const requestId = sentMessage.id;

    // Simulate a response with error: null (which should be treated as no error)
    const response = {
      jsonrpc: '2.0',
      id: requestId,
      result: { success: true },
      error: null, // This is the problematic case we're fixing
    };

    // Send the response
    if (messageHandler) {
      messageHandler(response);
    }

    // The request should resolve successfully
    const result = await requestPromise;
    expect(result).toEqual({ success: true });
  });

  it('should handle response with error: undefined correctly', async () => {
    type TestMethods = {
      testMethod: {
        params: { value: string };
        result: { success: boolean };
      };
    };

    const node = new JSONRPCNode<TestMethods>(transport);

    const requestPromise = node.callMethod('testMethod', { value: 'test' });
    await new Promise((resolve) => setTimeout(resolve, 0));

    const sentMessage = vi.mocked(transport.send).mock.calls[0]?.[0] as {
      id: string | number;
      jsonrpc: string;
      method: string;
      params?: unknown;
    };
    const requestId = sentMessage.id;

    // Simulate a response with error: undefined (normal success case)
    const response = {
      jsonrpc: '2.0',
      id: requestId,
      result: { success: true },
      error: undefined,
    };

    if (messageHandler) {
      messageHandler(response);
    }

    const result = await requestPromise;
    expect(result).toEqual({ success: true });
  });

  it('should handle response without error field correctly', async () => {
    type TestMethods = {
      testMethod: {
        params: { value: string };
        result: { success: boolean };
      };
    };

    const node = new JSONRPCNode<TestMethods>(transport);

    const requestPromise = node.callMethod('testMethod', { value: 'test' });
    await new Promise((resolve) => setTimeout(resolve, 0));

    const sentMessage = vi.mocked(transport.send).mock.calls[0]?.[0] as {
      id: string | number;
      jsonrpc: string;
      method: string;
      params?: unknown;
    };
    const requestId = sentMessage.id;

    // Simulate a response without error field at all (also valid)
    const response = {
      jsonrpc: '2.0',
      id: requestId,
      result: { success: true },
    };

    if (messageHandler) {
      messageHandler(response);
    }

    const result = await requestPromise;
    expect(result).toEqual({ success: true });
  });

  it('should handle response with actual error object correctly', async () => {
    type TestMethods = {
      testMethod: {
        params: { value: string };
        result: { success: boolean };
      };
    };

    const node = new JSONRPCNode<TestMethods>(transport);

    const requestPromise = node.callMethod('testMethod', { value: 'test' });
    await new Promise((resolve) => setTimeout(resolve, 0));

    const sentMessage = vi.mocked(transport.send).mock.calls[0]?.[0] as {
      id: string | number;
      jsonrpc: string;
      method: string;
      params?: unknown;
    };
    const requestId = sentMessage.id;

    // Simulate a response with actual error
    const response = {
      jsonrpc: '2.0',
      id: requestId,
      error: {
        code: -32600,
        message: 'Invalid Request',
        data: 'Additional error information',
      },
    };

    if (messageHandler) {
      messageHandler(response);
    }

    // The request should reject with the error
    await expect(requestPromise).rejects.toThrow('Invalid Request');
  });
});
