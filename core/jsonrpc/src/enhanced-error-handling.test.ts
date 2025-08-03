import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSONRPCNode } from './node.js';
import { JSONRPCError } from './error.js';
import type { JSONRPCTransport } from './types.js';

// Test interface to access private methods - using 'as any' in tests to access private methods
interface TestNode {
  categorizeReceiveError: (error: unknown) => {
    category: string;
    severity: string;
    recoveryAction: string;
  };
  handleReceiveError: (error: unknown, rawMessage: unknown) => void;
  receiveMessage: (message: unknown) => Promise<void>;
  eventManager: { emit?: (event: string, data: unknown) => void };
}

describe('JSONRPCNode Enhanced Error Handling', () => {
  let mockTransport: JSONRPCTransport;
  let node: TestNode;
  let messageCallback: (message: unknown) => void;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    mockTransport = {
      send: vi.fn().mockResolvedValue(undefined),
      onMessage: vi.fn().mockImplementation((callback) => {
        messageCallback = callback;
      }),
    };

    // biome-ignore lint/suspicious/noExplicitAny: Testing private methods requires bypassing type safety
    node = new JSONRPCNode(mockTransport) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Error Categorization', () => {
    it('should categorize parse errors as HIGH severity', () => {
      const error = new JSONRPCError(-32700, 'Parse error');

      // Test the categorization method directly
      const errorInfo = node.categorizeReceiveError(error);

      expect(errorInfo.category).toBe('PARSE');
      expect(errorInfo.severity).toBe('HIGH');
      expect(errorInfo.recoveryAction).toBe('Validate message format before processing');
    });

    it('should categorize validation errors as MEDIUM severity', () => {
      const error = new JSONRPCError(-32600, 'Invalid Request');
      const errorInfo = node.categorizeReceiveError(error);

      expect(errorInfo.category).toBe('VALIDATION');
      expect(errorInfo.severity).toBe('MEDIUM');
      expect(errorInfo.recoveryAction).toBe('Check JSON-RPC message structure and required fields');
    });

    it('should categorize method not found as LOW severity', () => {
      const error = new JSONRPCError(-32601, 'Method not found');
      const errorInfo = node.categorizeReceiveError(error);

      expect(errorInfo.category).toBe('METHOD');
      expect(errorInfo.severity).toBe('LOW');
      expect(errorInfo.recoveryAction).toBe('Register the missing method handler');
    });

    it('should categorize internal errors as MEDIUM severity', () => {
      const error = new JSONRPCError(-32603, 'Internal error');
      const errorInfo = node.categorizeReceiveError(error);

      expect(errorInfo.category).toBe('METHOD');
      expect(errorInfo.severity).toBe('MEDIUM');
      expect(errorInfo.recoveryAction).toBe('Review method implementation for errors');
    });

    it('should categorize transport errors as HIGH severity', () => {
      const error = new Error('Transport connection failed');
      const errorInfo = node.categorizeReceiveError(error);

      expect(errorInfo.category).toBe('TRANSPORT');
      expect(errorInfo.severity).toBe('HIGH');
      expect(errorInfo.recoveryAction).toBe('Check transport connection and retry');
    });

    it('should categorize unknown errors as CRITICAL severity', () => {
      const error = new Error('Something unexpected happened');
      const errorInfo = node.categorizeReceiveError(error);

      expect(errorInfo.category).toBe('UNKNOWN');
      expect(errorInfo.severity).toBe('CRITICAL');
      expect(errorInfo.recoveryAction).toBe('Investigate unexpected error and add proper handling');
    });

    it('should categorize server errors in JSON-RPC range correctly', () => {
      const error = new JSONRPCError(-32050, 'Custom server error');
      const errorInfo = node.categorizeReceiveError(error);

      expect(errorInfo.category).toBe('METHOD');
      expect(errorInfo.severity).toBe('MEDIUM');
      expect(errorInfo.recoveryAction).toBe('Review server error and retry if appropriate');
    });
  });

  describe('Error Logging', () => {
    it('should log LOW severity errors to debug', () => {
      const error = new JSONRPCError(-32601, 'Method not found');
      node.handleReceiveError(error, { method: 'unknownMethod' });

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Category: METHOD, Severity: LOW'),
        expect.objectContaining({
          error: 'Method not found',
          recoveryAction: 'Register the missing method handler',
        }),
      );
    });

    it('should log MEDIUM severity errors to warn', () => {
      const error = new JSONRPCError(-32600, 'Invalid Request');
      node.handleReceiveError(error, { jsonrpc: '1.0' });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Category: VALIDATION, Severity: MEDIUM'),
        expect.objectContaining({
          error: 'Invalid Request',
          recoveryAction: 'Check JSON-RPC message structure and required fields',
        }),
      );
    });

    it('should log HIGH severity errors to error', () => {
      const error = new JSONRPCError(-32700, 'Parse error');
      node.handleReceiveError(error, '{"invalid"}');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Category: PARSE, Severity: HIGH'),
        expect.objectContaining({
          error: 'Parse error',
          recoveryAction: 'Validate message format before processing',
        }),
      );
    });

    it('should log CRITICAL severity errors to error', () => {
      const error = new Error('Unknown critical error');
      node.handleReceiveError(error, null);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Category: UNKNOWN, Severity: CRITICAL'),
        expect.objectContaining({
          error: 'Unknown critical error',
          recoveryAction: 'Investigate unexpected error and add proper handling',
        }),
      );
    });
  });

  describe('Error Event Emission', () => {
    it('should handle error emission gracefully if event manager lacks emit', () => {
      const error = new Error('Test error');

      // Mock event manager without emit method
      node.eventManager = {};

      // Should not throw
      expect(() => {
        node.handleReceiveError(error, null);
      }).not.toThrow();
    });

    it('should handle failed error emission gracefully', () => {
      const error = new Error('Test error');

      // Mock event manager with failing emit method
      node.eventManager = {
        emit: vi.fn().mockImplementation(() => {
          throw new Error('Emit failed');
        }),
      };

      node.handleReceiveError(error, null);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[JSONRPCNode] Failed to emit error event:',
        expect.any(Error),
      );
    });
  });

  describe('Message Pattern Detection', () => {
    it('should detect JSON parse errors by message content', () => {
      const error = new Error('Failed to parse JSON message');
      const errorInfo = node.categorizeReceiveError(error);

      expect(errorInfo.category).toBe('PARSE');
      expect(errorInfo.severity).toBe('HIGH');
    });

    it('should detect validation errors by message content', () => {
      const error = new Error('Invalid message format');
      const errorInfo = node.categorizeReceiveError(error);

      expect(errorInfo.category).toBe('VALIDATION');
      expect(errorInfo.severity).toBe('MEDIUM');
    });

    it('should detect transport errors by message content', () => {
      const error = new Error('Connection lost to transport');
      const errorInfo = node.categorizeReceiveError(error);

      expect(errorInfo.category).toBe('TRANSPORT');
      expect(errorInfo.severity).toBe('HIGH');
    });
  });

  describe('Non-Error Objects', () => {
    it('should handle non-Error objects gracefully', () => {
      const errorInfo = node.categorizeReceiveError('String error');

      expect(errorInfo.category).toBe('UNKNOWN');
      expect(errorInfo.severity).toBe('CRITICAL');
      expect(errorInfo.recoveryAction).toBe('Investigate unexpected error and add proper handling');
    });

    it('should handle null/undefined errors', () => {
      const nullErrorInfo = node.categorizeReceiveError(null);
      const undefinedErrorInfo = node.categorizeReceiveError(undefined);

      expect(nullErrorInfo.category).toBe('UNKNOWN');
      expect(undefinedErrorInfo.category).toBe('UNKNOWN');
    });
  });

  describe('Integration with Transport', () => {
    it('should use enhanced error handling when receive message fails', async () => {
      // Mock receiveMessage to throw an error
      const originalReceiveMessage = node.receiveMessage;
      node.receiveMessage = vi.fn().mockRejectedValue(new Error('Mock error'));

      const handleReceiveErrorSpy = vi.spyOn(node, 'handleReceiveError');

      // Trigger message callback
      messageCallback({ test: 'message' });

      // Wait for async error handling
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(handleReceiveErrorSpy).toHaveBeenCalledWith(expect.any(Error), { test: 'message' });

      // Restore original method
      node.receiveMessage = originalReceiveMessage;
    });
  });

  describe('Recovery Action Suggestions', () => {
    const testCases = [
      {
        error: new JSONRPCError(-32700, 'Parse error'),
        expectedAction: 'Validate message format before processing',
      },
      {
        error: new JSONRPCError(-32600, 'Invalid Request'),
        expectedAction: 'Check JSON-RPC message structure and required fields',
      },
      {
        error: new JSONRPCError(-32601, 'Method not found'),
        expectedAction: 'Register the missing method handler',
      },
      {
        error: new JSONRPCError(-32603, 'Internal error'),
        expectedAction: 'Review method implementation for errors',
      },
      {
        error: new Error('Transport connection failed'),
        expectedAction: 'Check transport connection and retry',
      },
      {
        error: new Error('Unknown error'),
        expectedAction: 'Investigate unexpected error and add proper handling',
      },
    ];

    for (const { error, expectedAction } of testCases) {
      it(`should suggest correct recovery action for ${error.message}`, () => {
        const errorInfo = node.categorizeReceiveError(error);
        expect(errorInfo.recoveryAction).toBe(expectedAction);
      });
    }
  });
});
