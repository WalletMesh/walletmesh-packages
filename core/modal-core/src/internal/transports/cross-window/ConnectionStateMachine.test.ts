/**
 * Tests for ConnectionStateMachine
 */

import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type ConnectionEventHandlers,
  ConnectionRole,
  ConnectionState,
  ConnectionStateMachine,
} from './ConnectionStateMachine.js';
import {
  CloseCode,
  type ControlMessage,
  ControlType,
  type ErrorPayload,
  type GoodbyeAckPayload,
  type GoodbyePayload,
  type HelloAckPayload,
  type HelloPayload,
  type PingPayload,
  type PongPayload,
  type ReadyPayload,
  createControlMessage,
} from './protocol.js';

describe('ConnectionStateMachine', () => {
  let stateMachine: ConnectionStateMachine;
  let mockHandlers: {
    onSendMessage: Mock;
    onConnected: Mock;
    onDisconnected: Mock;
    onError: Mock;
  };
  let handlers: ConnectionEventHandlers;

  beforeEach(() => {
    mockHandlers = {
      onSendMessage: vi.fn(),
      onConnected: vi.fn(),
      onDisconnected: vi.fn(),
      onError: vi.fn(),
    };

    handlers = {
      onSendMessage: mockHandlers.onSendMessage,
      onConnected: mockHandlers.onConnected,
      onDisconnected: mockHandlers.onDisconnected,
      onError: mockHandlers.onError,
    };
  });

  describe('State Management', () => {
    it('should start in DISCONNECTED state', () => {
      stateMachine = new ConnectionStateMachine(ConnectionRole.Client, handlers);
      expect(stateMachine.getState()).toBe(ConnectionState.Disconnected);
    });

    it('should transition to CONNECTING on connect()', () => {
      stateMachine = new ConnectionStateMachine(ConnectionRole.Client, handlers);
      stateMachine.connect();
      expect(stateMachine.getState()).toBe(ConnectionState.Connecting);
    });

    it('should not connect if already connecting', () => {
      stateMachine = new ConnectionStateMachine(ConnectionRole.Client, handlers);
      stateMachine.connect();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      stateMachine.connect();
      expect(consoleSpy).toHaveBeenCalledWith('[StateMachine] Already connected or connecting');
      consoleSpy.mockRestore();
    });

    it('should reset to DISCONNECTED state', () => {
      stateMachine = new ConnectionStateMachine(ConnectionRole.Client, handlers);
      stateMachine.connect();
      stateMachine.reset();
      expect(stateMachine.getState()).toBe(ConnectionState.Disconnected);
      expect(stateMachine.getSessionId()).toBeUndefined();
    });
  });

  describe('Client Role - Message Handling', () => {
    beforeEach(() => {
      stateMachine = new ConnectionStateMachine(ConnectionRole.Client, handlers);
    });

    it('should ignore HELLO message as client', async () => {
      const helloPayload: HelloPayload = {
        origin: 'https://example.com',
        capabilities: [],
        protocolVersions: ['2.0.0'],
        preferredVersion: '2.0.0',
      };

      const message = createControlMessage(ControlType.Hello, helloPayload, 1);
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await stateMachine.handleControlMessage(message);

      expect(consoleSpy).toHaveBeenCalledWith('[StateMachine] Client received HELLO, ignoring');
      expect(mockHandlers.onSendMessage).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle HELLO_ACK and send READY', async () => {
      stateMachine.connect();

      const helloAckPayload: HelloAckPayload = {
        origin: 'https://wallet.com',
        negotiatedVersion: '2.0.0',
        capabilities: [],
        sessionTimeout: 300000,
        heartbeatInterval: 30000,
        sessionId: 'session_123',
        serverId: 'server_456',
      };

      const message = createControlMessage(ControlType.HelloAck, helloAckPayload, 1);
      await stateMachine.handleControlMessage(message);

      expect(stateMachine.getState()).toBe(ConnectionState.Connected);
      expect(stateMachine.getSessionId()).toBe('session_123');
      expect(mockHandlers.onConnected).toHaveBeenCalledWith('session_123');

      // Check READY was sent
      expect(mockHandlers.onSendMessage).toHaveBeenCalledTimes(1);
      const sentMessage = mockHandlers.onSendMessage.mock.calls[0][0] as ControlMessage;
      expect(sentMessage.type).toBe(ControlType.Ready);
      expect((sentMessage.payload as ReadyPayload).sessionId).toBe('session_123');
    });

    it('should ignore READY message as client', async () => {
      const readyPayload: ReadyPayload = {
        status: 'connected',
        sessionId: 'session_123',
      };

      const message = createControlMessage(ControlType.Ready, readyPayload, 1);
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await stateMachine.handleControlMessage(message);

      expect(consoleSpy).toHaveBeenCalledWith('[StateMachine] Client received READY, ignoring');
      consoleSpy.mockRestore();
    });
  });

  describe('Server Role - Message Handling', () => {
    beforeEach(() => {
      stateMachine = new ConnectionStateMachine(ConnectionRole.Server, handlers);
    });

    it('should handle HELLO and send HELLO_ACK', async () => {
      stateMachine.connect();

      const helloPayload: HelloPayload = {
        origin: 'https://dapp.com',
        capabilities: ['batch', 'subscriptions'],
        protocolVersions: ['2.0.0', '1.0.0'],
        preferredVersion: '2.0.0',
        clientId: 'client_789',
      };

      const message = createControlMessage(ControlType.Hello, helloPayload, 1);
      await stateMachine.handleControlMessage(message);

      expect(stateMachine.getState()).toBe(ConnectionState.Handshaking);
      expect(stateMachine.getSessionId()).toBeDefined();

      // Check HELLO_ACK was sent
      expect(mockHandlers.onSendMessage).toHaveBeenCalledTimes(1);
      const sentMessage = mockHandlers.onSendMessage.mock.calls[0][0] as ControlMessage;
      expect(sentMessage.type).toBe(ControlType.HelloAck);

      const ackPayload = sentMessage.payload as HelloAckPayload;
      expect(ackPayload.negotiatedVersion).toBe('2.0.0');
      expect(ackPayload.sessionId).toBeDefined();
    });

    it('should handle READY and complete connection', async () => {
      stateMachine.connect();

      // First send HELLO to get session ID
      const helloPayload: HelloPayload = {
        origin: 'https://dapp.com',
        capabilities: [],
        protocolVersions: ['2.0.0'],
        preferredVersion: '2.0.0',
      };

      await stateMachine.handleControlMessage(createControlMessage(ControlType.Hello, helloPayload, 1));

      const sessionId = stateMachine.getSessionId();
      expect(sessionId).toBeDefined();

      // Now send READY
      const readyPayload: ReadyPayload = {
        status: 'connected',
        sessionId: sessionId || '',
      };

      await stateMachine.handleControlMessage(
        createControlMessage(ControlType.Ready, readyPayload, 2, sessionId),
      );

      expect(stateMachine.getState()).toBe(ConnectionState.Connected);
      expect(mockHandlers.onConnected).toHaveBeenCalledWith(sessionId);
    });

    it('should reject READY with wrong session ID', async () => {
      stateMachine.connect();

      // Send HELLO first
      const helloPayload: HelloPayload = {
        origin: 'https://dapp.com',
        capabilities: [],
        protocolVersions: ['2.0.0'],
        preferredVersion: '2.0.0',
      };

      await stateMachine.handleControlMessage(createControlMessage(ControlType.Hello, helloPayload, 1));

      // Send READY with wrong session ID
      const readyPayload: ReadyPayload = {
        status: 'connected',
        sessionId: 'wrong_session_id',
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await stateMachine.handleControlMessage(createControlMessage(ControlType.Ready, readyPayload, 2));

      expect(consoleSpy).toHaveBeenCalledWith('[StateMachine] Session ID mismatch in READY');
      expect(stateMachine.getState()).toBe(ConnectionState.Handshaking);
      expect(mockHandlers.onConnected).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should ignore HELLO_ACK as server', async () => {
      const helloAckPayload: HelloAckPayload = {
        origin: 'https://wallet.com',
        negotiatedVersion: '2.0.0',
        capabilities: [],
        sessionTimeout: 300000,
        heartbeatInterval: 30000,
        sessionId: 'session_123',
        serverId: 'server_456',
      };

      const message = createControlMessage(ControlType.HelloAck, helloAckPayload, 1);
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await stateMachine.handleControlMessage(message);

      expect(consoleSpy).toHaveBeenCalledWith('[StateMachine] Server received HELLO_ACK, ignoring');
      consoleSpy.mockRestore();
    });
  });

  describe('PING/PONG Handling', () => {
    beforeEach(() => {
      stateMachine = new ConnectionStateMachine(ConnectionRole.Client, handlers);
      // Get to connected state
      stateMachine.connect();
    });

    it('should handle PING and send PONG when connected', async () => {
      // First establish connection
      const helloAckPayload: HelloAckPayload = {
        origin: 'https://wallet.com',
        negotiatedVersion: '2.0.0',
        capabilities: [],
        sessionTimeout: 300000,
        heartbeatInterval: 30000,
        sessionId: 'session_123',
        serverId: 'server_456',
      };

      await stateMachine.handleControlMessage(createControlMessage(ControlType.HelloAck, helloAckPayload, 1));

      mockHandlers.onSendMessage.mockClear();

      // Send PING
      const pingPayload: PingPayload = {
        metrics: {
          messagesSent: 10,
          messagesReceived: 8,
          lastActivity: Date.now(),
        },
        pingTime: Date.now(),
      };

      await stateMachine.handleControlMessage(
        createControlMessage(ControlType.Ping, pingPayload, 2, 'session_123'),
      );

      // Check PONG was sent
      expect(mockHandlers.onSendMessage).toHaveBeenCalledTimes(1);
      const sentMessage = mockHandlers.onSendMessage.mock.calls[0][0] as ControlMessage;
      expect(sentMessage.type).toBe(ControlType.Pong);

      const pongPayload = sentMessage.payload as PongPayload;
      expect(pongPayload.pingTime).toBe(pingPayload.pingTime);
      expect(pongPayload.metrics.latency).toBeGreaterThanOrEqual(0);
    });

    it('should ignore PING when not connected', async () => {
      const pingPayload: PingPayload = {
        metrics: {
          messagesSent: 10,
          messagesReceived: 8,
          lastActivity: Date.now(),
        },
        pingTime: Date.now(),
      };

      await stateMachine.handleControlMessage(createControlMessage(ControlType.Ping, pingPayload, 1));

      expect(mockHandlers.onSendMessage).not.toHaveBeenCalled();
    });

    it('should handle PONG and update metrics', async () => {
      // Establish connection first
      const helloAckPayload: HelloAckPayload = {
        origin: 'https://wallet.com',
        negotiatedVersion: '2.0.0',
        capabilities: [],
        sessionTimeout: 300000,
        heartbeatInterval: 30000,
        sessionId: 'session_123',
        serverId: 'server_456',
      };

      await stateMachine.handleControlMessage(createControlMessage(ControlType.HelloAck, helloAckPayload, 1));

      const pongPayload: PongPayload = {
        metrics: {
          messagesSent: 8,
          messagesReceived: 10,
          latency: 50,
        },
        pingTime: Date.now() - 50,
        pongTime: Date.now(),
      };

      await stateMachine.handleControlMessage(
        createControlMessage(ControlType.Pong, pongPayload, 2, 'session_123'),
      );

      const metrics = stateMachine.getMetrics();
      expect(metrics.latency).toBe(50);
    });
  });

  describe('GOODBYE Handling', () => {
    beforeEach(() => {
      stateMachine = new ConnectionStateMachine(ConnectionRole.Client, handlers);
    });

    it('should send GOODBYE on disconnect', async () => {
      // Establish connection first
      stateMachine.connect();
      const helloAckPayload: HelloAckPayload = {
        origin: 'https://wallet.com',
        negotiatedVersion: '2.0.0',
        capabilities: [],
        sessionTimeout: 300000,
        heartbeatInterval: 30000,
        sessionId: 'session_123',
        serverId: 'server_456',
      };

      await stateMachine.handleControlMessage(createControlMessage(ControlType.HelloAck, helloAckPayload, 1));

      mockHandlers.onSendMessage.mockClear();

      // Disconnect
      await stateMachine.disconnect('user_disconnect');

      expect(mockHandlers.onSendMessage).toHaveBeenCalledTimes(1);
      const sentMessage = mockHandlers.onSendMessage.mock.calls[0][0] as ControlMessage;
      expect(sentMessage.type).toBe(ControlType.Goodbye);

      const goodbyePayload = sentMessage.payload as GoodbyePayload;
      expect(goodbyePayload.reason).toBe('user_disconnect');
      expect(goodbyePayload.code).toBe(CloseCode.Normal);
      expect(stateMachine.getState()).toBe(ConnectionState.Closing);
    });

    it('should handle GOODBYE and send ACK', async () => {
      const goodbyePayload: GoodbyePayload = {
        reason: 'shutdown',
        code: CloseCode.GoingAway,
        canReconnect: false,
        message: 'Server shutting down',
      };

      await stateMachine.handleControlMessage(createControlMessage(ControlType.Goodbye, goodbyePayload, 1));

      // Check GOODBYE_ACK was sent
      expect(mockHandlers.onSendMessage).toHaveBeenCalledTimes(1);
      const sentMessage = mockHandlers.onSendMessage.mock.calls[0][0] as ControlMessage;
      expect(sentMessage.type).toBe(ControlType.GoodbyeAck);

      const ackPayload = sentMessage.payload as GoodbyeAckPayload;
      expect(ackPayload.status).toBe('disconnected');
      expect(ackPayload.reason).toBe('shutdown');

      expect(stateMachine.getState()).toBe(ConnectionState.Closed);
      expect(mockHandlers.onDisconnected).toHaveBeenCalledWith('shutdown');
    });

    it('should handle GOODBYE_ACK', async () => {
      const goodbyeAckPayload: GoodbyeAckPayload = {
        status: 'disconnected',
        reason: 'user_disconnect',
      };

      await stateMachine.handleControlMessage(
        createControlMessage(ControlType.GoodbyeAck, goodbyeAckPayload, 1),
      );

      expect(stateMachine.getState()).toBe(ConnectionState.Closed);
      expect(mockHandlers.onDisconnected).toHaveBeenCalledWith('user_disconnect');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      stateMachine = new ConnectionStateMachine(ConnectionRole.Client, handlers);
    });

    it('should handle recoverable errors', async () => {
      stateMachine.connect();

      const errorPayload: ErrorPayload = {
        code: 'TEMP_ERROR',
        message: 'Temporary error occurred',
        recoverable: true,
        retryAfter: 5000,
      };

      await stateMachine.handleControlMessage(createControlMessage(ControlType.Error, errorPayload, 1));

      expect(stateMachine.getState()).toBe(ConnectionState.Connecting);
      expect(mockHandlers.onError).toHaveBeenCalled();
      expect(mockHandlers.onDisconnected).not.toHaveBeenCalled();
    });

    it('should handle non-recoverable errors', async () => {
      const errorPayload: ErrorPayload = {
        code: 'FATAL_ERROR',
        message: 'Fatal error occurred',
        recoverable: false,
      };

      await stateMachine.handleControlMessage(createControlMessage(ControlType.Error, errorPayload, 1));

      expect(stateMachine.getState()).toBe(ConnectionState.Error);
      expect(mockHandlers.onError).toHaveBeenCalled();
      expect(mockHandlers.onDisconnected).toHaveBeenCalledWith('error');
    });

    it('should handle errors during message processing', async () => {
      // Mock an error in onSendMessage
      mockHandlers.onSendMessage.mockImplementation(() => {
        throw new Error('Send failed');
      });

      stateMachine.connect();

      const helloPayload: HelloPayload = {
        origin: 'https://dapp.com',
        capabilities: [],
        protocolVersions: ['2.0.0'],
        preferredVersion: '2.0.0',
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // This should be a server to process HELLO
      const serverMachine = new ConnectionStateMachine(ConnectionRole.Server, {
        ...handlers,
        onSendMessage: mockHandlers.onSendMessage,
      });
      serverMachine.connect();

      await serverMachine.handleControlMessage(createControlMessage(ControlType.Hello, helloPayload, 1));

      expect(consoleSpy).toHaveBeenCalledWith('[StateMachine] Error handling message:', expect.any(Error));
      expect(mockHandlers.onError).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Metrics', () => {
    beforeEach(() => {
      stateMachine = new ConnectionStateMachine(ConnectionRole.Client, handlers);
    });

    it('should track message counts', async () => {
      const initialMetrics = stateMachine.getMetrics();
      expect(initialMetrics.messagesSent).toBe(0);
      expect(initialMetrics.messagesReceived).toBe(0);

      // Handle a message
      const errorPayload: ErrorPayload = {
        code: 'TEST',
        message: 'Test',
        recoverable: true,
      };

      await stateMachine.handleControlMessage(createControlMessage(ControlType.Error, errorPayload, 1));

      const updatedMetrics = stateMachine.getMetrics();
      expect(updatedMetrics.messagesReceived).toBe(1);
    });

    it('should track connection start time', () => {
      const beforeConnect = Date.now();
      stateMachine.connect();
      const afterConnect = Date.now();

      const metrics = stateMachine.getMetrics();
      expect(metrics.connectionStartTime).toBeGreaterThanOrEqual(beforeConnect);
      expect(metrics.connectionStartTime).toBeLessThanOrEqual(afterConnect);
    });

    it('should update last activity time', async () => {
      const beforeMessage = Date.now();

      const errorPayload: ErrorPayload = {
        code: 'TEST',
        message: 'Test',
        recoverable: true,
      };

      await stateMachine.handleControlMessage(createControlMessage(ControlType.Error, errorPayload, 1));

      const metrics = stateMachine.getMetrics();
      expect(metrics.lastActivity).toBeGreaterThanOrEqual(beforeMessage);
    });
  });

  describe('Protocol Negotiation', () => {
    it('should negotiate highest common version', async () => {
      stateMachine = new ConnectionStateMachine(ConnectionRole.Server, handlers);
      stateMachine.connect();

      const helloPayload: HelloPayload = {
        origin: 'https://dapp.com',
        capabilities: [],
        protocolVersions: ['3.0.0', '2.0.0', '1.0.0'],
        preferredVersion: '3.0.0',
      };

      await stateMachine.handleControlMessage(createControlMessage(ControlType.Hello, helloPayload, 1));

      const sentMessage = mockHandlers.onSendMessage.mock.calls[0][0] as ControlMessage;
      const ackPayload = sentMessage.payload as HelloAckPayload;

      // Should negotiate to 2.0.0 (highest common version)
      expect(ackPayload.negotiatedVersion).toBe('2.0.0');
    });

    it('should fallback to default version if no match', async () => {
      stateMachine = new ConnectionStateMachine(ConnectionRole.Server, handlers);
      stateMachine.connect();

      const helloPayload: HelloPayload = {
        origin: 'https://dapp.com',
        capabilities: [],
        protocolVersions: ['99.0.0'],
        preferredVersion: '99.0.0',
      };

      await stateMachine.handleControlMessage(createControlMessage(ControlType.Hello, helloPayload, 1));

      const sentMessage = mockHandlers.onSendMessage.mock.calls[0][0] as ControlMessage;
      const ackPayload = sentMessage.payload as HelloAckPayload;

      // Should fallback to current version
      expect(ackPayload.negotiatedVersion).toBe('2.0.0');
    });
  });

  describe('Session ID Generation', () => {
    it('should generate unique session IDs', async () => {
      const serverMachine = new ConnectionStateMachine(ConnectionRole.Server, handlers);
      const clientMachine = new ConnectionStateMachine(ConnectionRole.Client, handlers);

      const sessionIds = new Set<string>();

      // Generate multiple sessions
      for (let i = 0; i < 10; i++) {
        const machine = i % 2 === 0 ? serverMachine : clientMachine;
        machine.reset();
        machine.connect();

        if (machine === serverMachine) {
          // Trigger session generation for server
          const helloPayload: HelloPayload = {
            origin: 'https://dapp.com',
            capabilities: [],
            protocolVersions: ['2.0.0'],
            preferredVersion: '2.0.0',
          };

          await machine.handleControlMessage(createControlMessage(ControlType.Hello, helloPayload, 1));

          const sessionId = machine.getSessionId();
          if (sessionId) {
            expect(sessionIds.has(sessionId)).toBe(false);
            sessionIds.add(sessionId);
            expect(sessionId.startsWith('srv_')).toBe(true);
          }
        }
      }

      expect(sessionIds.size).toBeGreaterThan(0);
    });
  });
});
