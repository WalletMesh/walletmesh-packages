/**
 * Tests for MessageRouter
 */

import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type ConnectionEventHandlers,
  ConnectionRole,
  ConnectionStateMachine,
} from './ConnectionStateMachine.js';
import {
  type DataMessageHandler,
  type ErrorMessageHandler,
  MessageRouter,
  type MessageRouterConfig,
  type RawMessageHandler,
} from './MessageRouter.js';
import {
  type ControlMessage,
  ControlType,
  type DataMessage,
  type ErrorMessage,
  type MessageCategory,
  type TransportMessage,
  createControlMessage,
  createDataMessage,
  createErrorMessage,
  createTransportMessage,
} from './protocol.js';

describe('MessageRouter', () => {
  let router: MessageRouter;
  let stateMachine: ConnectionStateMachine;
  let mockHandlers: {
    onDataMessage: Mock;
    onErrorMessage: Mock;
    onRawMessage: Mock;
  };
  let mockStateMachineHandlers: ConnectionEventHandlers;

  beforeEach(() => {
    // Create mock handlers
    mockHandlers = {
      onDataMessage: vi.fn(),
      onErrorMessage: vi.fn(),
      onRawMessage: vi.fn(),
    };

    // Create mock state machine handlers
    mockStateMachineHandlers = {
      onSendMessage: vi.fn(),
      onConnected: vi.fn(),
      onDisconnected: vi.fn(),
      onError: vi.fn(),
    };

    // Create state machine
    stateMachine = new ConnectionStateMachine(ConnectionRole.CLIENT, mockStateMachineHandlers);

    // Spy on state machine method
    vi.spyOn(stateMachine, 'handleControlMessage').mockResolvedValue(undefined);
  });

  describe('Message Routing', () => {
    beforeEach(() => {
      const config: MessageRouterConfig = {
        stateMachine,
        onDataMessage: mockHandlers.onDataMessage,
        onErrorMessage: mockHandlers.onErrorMessage,
        onRawMessage: mockHandlers.onRawMessage,
        validateSequence: false, // Disable for basic routing tests
      };
      router = new MessageRouter(config);
    });

    it('should route control messages to state machine', async () => {
      const controlMessage = createControlMessage(
        ControlType.PING,
        { metrics: { messagesSent: 1, messagesReceived: 0, lastActivity: Date.now() }, pingTime: Date.now() },
        1,
      );

      await router.routeMessage(controlMessage);

      expect(stateMachine.handleControlMessage).toHaveBeenCalledWith(controlMessage);
      expect(mockHandlers.onDataMessage).not.toHaveBeenCalled();
      expect(mockHandlers.onErrorMessage).not.toHaveBeenCalled();
    });

    it('should route data messages to data handler', async () => {
      const dataMessage = createDataMessage(
        { jsonrpc: '2.0', method: 'test', params: [], id: 1 },
        1,
        'session_123',
      );

      await router.routeMessage(dataMessage);

      expect(mockHandlers.onDataMessage).toHaveBeenCalledWith(dataMessage);
      expect(stateMachine.handleControlMessage).not.toHaveBeenCalled();
      expect(mockHandlers.onErrorMessage).not.toHaveBeenCalled();
    });

    it('should route error messages to error handler', async () => {
      const errorMessage = createErrorMessage(
        {
          code: 'TEST_ERROR',
          message: 'Test error',
          recoverable: true,
        },
        1,
        'session_123',
      );

      await router.routeMessage(errorMessage);

      expect(mockHandlers.onErrorMessage).toHaveBeenCalledWith(errorMessage);
      expect(stateMachine.handleControlMessage).not.toHaveBeenCalled();
      expect(mockHandlers.onDataMessage).not.toHaveBeenCalled();
    });

    it('should route raw messages to raw handler', async () => {
      const rawMessage = {
        jsonrpc: '2.0',
        method: 'test',
        params: [],
        id: 1,
      };

      await router.routeMessage(rawMessage);

      expect(mockHandlers.onRawMessage).toHaveBeenCalledWith(rawMessage);
      expect(stateMachine.handleControlMessage).not.toHaveBeenCalled();
      expect(mockHandlers.onDataMessage).not.toHaveBeenCalled();
    });

    it('should handle unknown message category', async () => {
      const unknownMessage = {
        category: 'unknown' as unknown as MessageCategory,
        type: 'test',
        version: '2.0.0',
        timestamp: Date.now(),
        sequence: 1,
        payload: {},
      };

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await router.routeMessage(unknownMessage);

      expect(consoleSpy).toHaveBeenCalledWith('[MessageRouter] Unknown message category:', 'unknown');
      consoleSpy.mockRestore();
    });

    it('should handle routing errors gracefully', async () => {
      const dataMessage = createDataMessage({}, 1);

      // Make handler throw error
      mockHandlers.onDataMessage.mockRejectedValue(new Error('Handler error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw
      await expect(router.routeMessage(dataMessage)).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith('[MessageRouter] Error routing message:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Sequence Validation', () => {
    beforeEach(() => {
      const config: MessageRouterConfig = {
        stateMachine,
        onDataMessage: mockHandlers.onDataMessage,
        validateSequence: true,
        allowOutOfOrder: true,
      };
      router = new MessageRouter(config);
    });

    it('should accept first message with any sequence', async () => {
      const message = createDataMessage({}, 5, 'session_123');

      await router.routeMessage(message);

      expect(mockHandlers.onDataMessage).toHaveBeenCalledWith(message);

      const stats = router.getStats();
      expect(stats.lastSequence).toBe(5);
    });

    it('should accept in-order messages', async () => {
      const message1 = createDataMessage({ data: 1 }, 1, 'session_123');
      const message2 = createDataMessage({ data: 2 }, 2, 'session_123');
      const message3 = createDataMessage({ data: 3 }, 3, 'session_123');

      await router.routeMessage(message1);
      await router.routeMessage(message2);
      await router.routeMessage(message3);

      expect(mockHandlers.onDataMessage).toHaveBeenCalledTimes(3);
      expect(mockHandlers.onDataMessage).toHaveBeenNthCalledWith(1, message1);
      expect(mockHandlers.onDataMessage).toHaveBeenNthCalledWith(2, message2);
      expect(mockHandlers.onDataMessage).toHaveBeenNthCalledWith(3, message3);

      const stats = router.getStats();
      expect(stats.lastSequence).toBe(3);
      expect(stats.outOfSequence).toBe(0);
    });

    it('should buffer out-of-order messages', async () => {
      const message1 = createDataMessage({ data: 1 }, 1, 'session_123');
      const message3 = createDataMessage({ data: 3 }, 3, 'session_123');
      const message2 = createDataMessage({ data: 2 }, 2, 'session_123');

      await router.routeMessage(message1);
      await router.routeMessage(message3); // Out of order - should be buffered

      expect(mockHandlers.onDataMessage).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onDataMessage).toHaveBeenCalledWith(message1);

      const bufferStatus = router.getBufferStatus();
      expect(bufferStatus.size).toBe(1);
      expect(bufferStatus.sequences).toContain(3);

      // Now send missing message
      await router.routeMessage(message2);

      // Both message2 and buffered message3 should be delivered
      expect(mockHandlers.onDataMessage).toHaveBeenCalledTimes(3);
      expect(mockHandlers.onDataMessage).toHaveBeenNthCalledWith(2, message2);
      expect(mockHandlers.onDataMessage).toHaveBeenNthCalledWith(3, message3);

      const stats = router.getStats();
      expect(stats.lastSequence).toBe(3);
      expect(stats.outOfSequence).toBe(1);
    });

    it('should ignore duplicate messages', async () => {
      const message1 = createDataMessage({ data: 1 }, 1, 'session_123');
      const message1Dup = createDataMessage({ data: 'duplicate' }, 1, 'session_123');

      await router.routeMessage(message1);

      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      await router.routeMessage(message1Dup);

      expect(mockHandlers.onDataMessage).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onDataMessage).toHaveBeenCalledWith(message1);
      expect(consoleSpy).toHaveBeenCalledWith('[MessageRouter] Ignoring duplicate/old message: 1');

      consoleSpy.mockRestore();
    });

    it('should handle buffer overflow', async () => {
      const config: MessageRouterConfig = {
        stateMachine,
        onDataMessage: mockHandlers.onDataMessage,
        validateSequence: true,
        allowOutOfOrder: true,
      };
      router = new MessageRouter(config);

      // Set internal maxBufferSize to small value for testing
      (router as unknown as { maxBufferSize: number }).maxBufferSize = 3;

      // Send first message
      await router.routeMessage(createDataMessage({}, 1, 'session_123'));

      // Send many out-of-order messages to overflow buffer
      for (let i = 10; i < 15; i++) {
        await router.routeMessage(createDataMessage({ seq: i }, i, 'session_123'));
      }

      const bufferStatus = router.getBufferStatus();
      expect(bufferStatus.size).toBeLessThanOrEqual(3);

      const stats = router.getStats();
      expect(stats.dropped).toBeGreaterThan(0);
    });

    it('should drop out-of-order messages when not allowed', async () => {
      const config: MessageRouterConfig = {
        stateMachine,
        onDataMessage: mockHandlers.onDataMessage,
        validateSequence: true,
        allowOutOfOrder: false,
      };
      router = new MessageRouter(config);

      const message1 = createDataMessage({ data: 1 }, 1, 'session_123');
      const message3 = createDataMessage({ data: 3 }, 3, 'session_123');

      await router.routeMessage(message1);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await router.routeMessage(message3);

      expect(mockHandlers.onDataMessage).toHaveBeenCalledTimes(1);
      expect(mockHandlers.onDataMessage).toHaveBeenCalledWith(message1);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[MessageRouter] Dropped out-of-order message: expected 2, got 3',
      );

      const stats = router.getStats();
      expect(stats.dropped).toBe(1);

      consoleSpy.mockRestore();
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      const config: MessageRouterConfig = {
        stateMachine,
        onDataMessage: mockHandlers.onDataMessage,
      };
      router = new MessageRouter(config);
    });

    it('should track message counts by category', async () => {
      const controlMessage = createControlMessage(
        ControlType.PING,
        {
          metrics: { messagesSent: 1, messagesReceived: 0, lastActivity: Date.now() },
          pingTime: Date.now(),
        },
        1,
      );
      const dataMessage = createDataMessage({}, 2);
      const errorMessage = createErrorMessage({ code: 'TEST', message: 'Test', recoverable: true }, 3);
      const rawMessage = { jsonrpc: '2.0', method: 'test', id: 1 };

      await router.routeMessage(controlMessage);
      await router.routeMessage(dataMessage);
      await router.routeMessage(errorMessage);
      await router.routeMessage(rawMessage);

      const stats = router.getStats();
      expect(stats.messagesReceived).toBe(4);
      expect(stats.byCategory.control).toBe(1);
      expect(stats.byCategory.data).toBe(1);
      expect(stats.byCategory.error).toBe(1);
      expect(stats.byCategory.raw).toBe(1);
      expect(stats.byCategory.invalid).toBe(0);
    });

    it('should reset statistics', async () => {
      // Send some messages
      await router.routeMessage(createDataMessage({}, 1));
      await router.routeMessage(createDataMessage({}, 2));

      let stats = router.getStats();
      expect(stats.messagesReceived).toBe(2);

      // Reset
      router.reset();

      stats = router.getStats();
      expect(stats.messagesReceived).toBe(0);
      expect(stats.lastSequence).toBe(-1);
      expect(stats.byCategory.data).toBe(0);
    });
  });

  describe('Buffer Management', () => {
    beforeEach(() => {
      const config: MessageRouterConfig = {
        stateMachine,
        onDataMessage: mockHandlers.onDataMessage,
        validateSequence: true,
        allowOutOfOrder: true,
      };
      router = new MessageRouter(config);
    });

    it('should clear buffer', async () => {
      // Create out-of-order scenario
      await router.routeMessage(createDataMessage({}, 1));
      await router.routeMessage(createDataMessage({}, 3));
      await router.routeMessage(createDataMessage({}, 4));

      let bufferStatus = router.getBufferStatus();
      expect(bufferStatus.size).toBe(2);

      router.clearBuffer();

      bufferStatus = router.getBufferStatus();
      expect(bufferStatus.size).toBe(0);
    });

    it('should report buffer status', async () => {
      await router.routeMessage(createDataMessage({}, 1));
      await router.routeMessage(createDataMessage({}, 5));
      await router.routeMessage(createDataMessage({}, 3));
      await router.routeMessage(createDataMessage({}, 7));

      const bufferStatus = router.getBufferStatus();
      expect(bufferStatus.size).toBe(3);
      expect(bufferStatus.sequences).toEqual([3, 5, 7]);
    });

    it('should process buffered messages when gap is filled', async () => {
      // Send messages with gaps
      await router.routeMessage(createDataMessage({ data: 1 }, 1));
      await router.routeMessage(createDataMessage({ data: 3 }, 3));
      await router.routeMessage(createDataMessage({ data: 4 }, 4));
      await router.routeMessage(createDataMessage({ data: 6 }, 6));

      expect(mockHandlers.onDataMessage).toHaveBeenCalledTimes(1);

      // Fill first gap
      await router.routeMessage(createDataMessage({ data: 2 }, 2));

      // Messages 2, 3, 4 should be delivered
      expect(mockHandlers.onDataMessage).toHaveBeenCalledTimes(4);

      // Message 6 still buffered
      const bufferStatus = router.getBufferStatus();
      expect(bufferStatus.sequences).toEqual([6]);

      // Fill second gap
      await router.routeMessage(createDataMessage({ data: 5 }, 5));

      // Message 5 and 6 should be delivered
      expect(mockHandlers.onDataMessage).toHaveBeenCalledTimes(6);

      // Buffer should be empty
      expect(router.getBufferStatus().size).toBe(0);
    });
  });

  describe('Default Handlers', () => {
    it('should use default error handler', async () => {
      const config: MessageRouterConfig = {
        stateMachine,
        onDataMessage: mockHandlers.onDataMessage,
        // Don't provide onErrorMessage - use default
      };
      router = new MessageRouter(config);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const errorMessage = createErrorMessage({ code: 'TEST', message: 'Test error', recoverable: false }, 1);

      await router.routeMessage(errorMessage);

      expect(consoleSpy).toHaveBeenCalledWith('[MessageRouter] Transport error:', errorMessage.payload);
      consoleSpy.mockRestore();
    });

    it('should use default raw handler', async () => {
      const config: MessageRouterConfig = {
        stateMachine,
        onDataMessage: mockHandlers.onDataMessage,
        // Don't provide onRawMessage - use default
      };
      router = new MessageRouter(config);

      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      const rawMessage = { some: 'data' };

      await router.routeMessage(rawMessage);

      expect(consoleSpy).toHaveBeenCalledWith('[MessageRouter] Raw message (non-protocol):', rawMessage);
      consoleSpy.mockRestore();
    });
  });

  describe('Factory Function', () => {
    it('should create router with factory function', async () => {
      const { createMessageRouter } = await import('./MessageRouter.js');

      const router = createMessageRouter(stateMachine, mockHandlers.onDataMessage, {
        onErrorMessage: mockHandlers.onErrorMessage,
        validateSequence: true,
      });

      expect(router).toBeInstanceOf(MessageRouter);

      // Test it works
      const dataMessage = createDataMessage({}, 1);
      await router.routeMessage(dataMessage);
      expect(mockHandlers.onDataMessage).toHaveBeenCalledWith(dataMessage);
    });
  });
});
