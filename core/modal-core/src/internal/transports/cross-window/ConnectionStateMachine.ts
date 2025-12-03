/**
 * Connection State Machine for Cross-Window Transport
 *
 * Manages connection state transitions and control message handling
 * based on the current connection state and role (client/server).
 *
 * @module cross-window/ConnectionStateMachine
 * @internal
 */

import {
  CloseCode,
  type ControlMessage,
  ControlType,
  type ErrorPayload,
  type GoodbyeAckPayload,
  type GoodbyePayload,
  type HelloAckPayload,
  type HelloPayload,
  PROTOCOL_VERSION,
  type PingPayload,
  type PongPayload,
  type ReadyPayload,
  SUPPORTED_VERSIONS,
  createControlMessage,
} from './protocol.js';

/**
 * Connection states
 */
export enum ConnectionState {
  /** Not connected */
  Disconnected = 'disconnected',
  /** Initiating connection */
  Connecting = 'connecting',
  /** Performing handshake */
  Handshaking = 'handshaking',
  /** Fully connected and ready */
  Connected = 'connected',
  /** Attempting to reconnect */
  Reconnecting = 'reconnecting',
  /** Closing connection */
  Closing = 'closing',
  /** Connection closed */
  Closed = 'closed',
  /** Error state */
  Error = 'error',
}

/**
 * Connection role
 */
export enum ConnectionRole {
  Client = 'client',
  Server = 'server',
}

/**
 * Connection event handlers
 */
export interface ConnectionEventHandlers {
  /** Called when a message needs to be sent */
  onSendMessage: (message: ControlMessage) => void;
  /** Called when connection is established */
  onConnected?: (sessionId: string) => void;
  /** Called when connection is lost */
  onDisconnected?: (reason: string) => void;
  /** Called on connection error */
  onError?: (error: Error) => void;
}

/**
 * Connection metrics
 */
export interface ConnectionMetrics {
  messagesSent: number;
  messagesReceived: number;
  lastActivity: number;
  connectionStartTime: number;
  latency?: number;
}

/**
 * Manages connection state and control message handling
 */
export class ConnectionStateMachine {
  private state = ConnectionState.Disconnected;
  private sessionId: string | undefined;
  private remoteOrigin: string | undefined;
  private sequenceNumber = 0;
  private metrics: ConnectionMetrics = {
    messagesSent: 0,
    messagesReceived: 0,
    lastActivity: Date.now(),
    connectionStartTime: 0,
  };

  constructor(
    private readonly role: ConnectionRole,
    public readonly eventHandlers: ConnectionEventHandlers,
  ) {}

  /**
   * Get current state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Get session ID
   */
  getSessionId(): string | undefined {
    return this.sessionId;
  }

  /**
   * Get remote origin
   */
  getRemoteOrigin(): string | undefined {
    return this.remoteOrigin;
  }

  /**
   * Get connection metrics
   */
  getMetrics(): Readonly<ConnectionMetrics> {
    return { ...this.metrics };
  }

  /**
   * Initiate connection
   */
  connect(): void {
    if (this.state !== ConnectionState.Disconnected) {
      console.warn('[StateMachine] Already connected or connecting');
      return;
    }

    this.setState(ConnectionState.Connecting);
    this.metrics.connectionStartTime = Date.now();
  }

  /**
   * Handle control message based on current state
   */
  async handleControlMessage(message: ControlMessage): Promise<void> {
    this.metrics.messagesReceived++;
    this.metrics.lastActivity = Date.now();

    console.debug(`[StateMachine] Handling ${message.type} in state ${this.state}`);

    try {
      switch (message.type) {
        case ControlType.Hello:
          await this.handleHello(message.payload as HelloPayload);
          break;
        case ControlType.HelloAck:
          await this.handleHelloAck(message.payload as HelloAckPayload);
          break;
        case ControlType.Ready:
          await this.handleReady(message.payload as ReadyPayload);
          break;
        case ControlType.Ping:
          await this.handlePing(message.payload as PingPayload);
          break;
        case ControlType.Pong:
          await this.handlePong(message.payload as PongPayload);
          break;
        case ControlType.Goodbye:
          await this.handleGoodbye(message.payload as GoodbyePayload);
          break;
        case ControlType.GoodbyeAck:
          await this.handleGoodbyeAck(message.payload as GoodbyeAckPayload);
          break;
        case ControlType.Error:
          await this.handleError(message.payload as ErrorPayload);
          break;
      }
    } catch (error) {
      console.error('[StateMachine] Error handling message:', error);
      this.eventHandlers.onError?.(error as Error);
    }
  }

  /**
   * Handle HELLO message (server only)
   */
  private async handleHello(payload: HelloPayload): Promise<void> {
    if (this.role !== ConnectionRole.Server) {
      console.warn('[StateMachine] Client received HELLO, ignoring');
      return;
    }

    if (this.state !== ConnectionState.Connecting) {
      console.warn('[StateMachine] Unexpected HELLO in state:', this.state);
      return;
    }

    // Negotiate protocol version
    const negotiatedVersion = this.negotiateVersion(payload.protocolVersions);

    // Generate session ID
    this.sessionId = this.generateSessionId();
    this.remoteOrigin = payload.origin;

    // Send HELLO_ACK
    const helloAck: HelloAckPayload = {
      origin: typeof window !== 'undefined' ? window.location.origin : 'server',
      negotiatedVersion,
      capabilities: [],
      sessionTimeout: 300000,
      heartbeatInterval: 30000,
      sessionId: this.sessionId,
      serverId: `server-${Date.now()}`,
    };

    const ackMessage = createControlMessage(
      ControlType.HelloAck,
      helloAck,
      ++this.sequenceNumber,
      this.sessionId,
    );

    this.eventHandlers.onSendMessage(ackMessage);
    this.metrics.messagesSent++;
    this.setState(ConnectionState.Handshaking);
  }

  /**
   * Handle HELLO_ACK message (client only)
   */
  private async handleHelloAck(payload: HelloAckPayload): Promise<void> {
    if (this.role !== ConnectionRole.Client) {
      console.warn('[StateMachine] Server received HELLO_ACK, ignoring');
      return;
    }

    if (this.state !== ConnectionState.Connecting) {
      console.warn('[StateMachine] Unexpected HELLO_ACK in state:', this.state);
      return;
    }

    // Store session info
    this.sessionId = payload.sessionId;
    this.remoteOrigin = payload.origin;

    // Send READY
    const ready: ReadyPayload = {
      status: 'connected',
      sessionId: this.sessionId,
    };

    const readyMessage = createControlMessage(
      ControlType.Ready,
      ready,
      ++this.sequenceNumber,
      this.sessionId,
    );

    this.eventHandlers.onSendMessage(readyMessage);
    this.metrics.messagesSent++;
    this.setState(ConnectionState.Connected);
    this.eventHandlers.onConnected?.(this.sessionId);
  }

  /**
   * Handle READY message (server only)
   */
  private async handleReady(payload: ReadyPayload): Promise<void> {
    if (this.role !== ConnectionRole.Server) {
      console.warn('[StateMachine] Client received READY, ignoring');
      return;
    }

    if (this.state !== ConnectionState.Handshaking) {
      console.warn('[StateMachine] Unexpected READY in state:', this.state);
      return;
    }

    if (payload.sessionId !== this.sessionId) {
      console.error('[StateMachine] Session ID mismatch in READY');
      return;
    }

    this.setState(ConnectionState.Connected);
    this.eventHandlers.onConnected?.(this.sessionId);
  }

  /**
   * Handle PING message
   */
  private async handlePing(payload: PingPayload): Promise<void> {
    if (this.state !== ConnectionState.Connected) {
      return;
    }

    // Calculate latency
    const pongTime = Date.now();
    const latency = pongTime - payload.pingTime;
    this.metrics.latency = latency;

    // Send PONG
    const pong: PongPayload = {
      metrics: {
        messagesSent: this.metrics.messagesSent,
        messagesReceived: this.metrics.messagesReceived,
        latency,
      },
      pingTime: payload.pingTime,
      pongTime,
    };

    const pongMessage = createControlMessage(ControlType.Pong, pong, ++this.sequenceNumber, this.sessionId);

    this.eventHandlers.onSendMessage(pongMessage);
    this.metrics.messagesSent++;
  }

  /**
   * Handle PONG message
   */
  private async handlePong(payload: PongPayload): Promise<void> {
    if (this.state !== ConnectionState.Connected) {
      return;
    }

    // Update latency metric
    this.metrics.latency = payload.metrics.latency;
  }

  /**
   * Handle GOODBYE message
   */
  private async handleGoodbye(payload: GoodbyePayload): Promise<void> {
    // Send GOODBYE_ACK
    const ack: GoodbyeAckPayload = {
      status: 'disconnected',
      reason: payload.reason,
    };

    const ackMessage = createControlMessage(
      ControlType.GoodbyeAck,
      ack,
      ++this.sequenceNumber,
      this.sessionId,
    );

    this.eventHandlers.onSendMessage(ackMessage);
    this.metrics.messagesSent++;

    // Transition to closed state
    this.setState(ConnectionState.Closed);
    this.eventHandlers.onDisconnected?.(payload.reason);
  }

  /**
   * Handle GOODBYE_ACK message
   */
  private async handleGoodbyeAck(payload: GoodbyeAckPayload): Promise<void> {
    this.setState(ConnectionState.Closed);
    this.eventHandlers.onDisconnected?.(payload.reason);
  }

  /**
   * Handle ERROR message
   */
  private async handleError(payload: ErrorPayload): Promise<void> {
    console.error('[StateMachine] Received error:', payload);

    if (payload.recoverable) {
      // Stay in current state but notify error
      this.eventHandlers.onError?.(new Error(payload.message));
    } else {
      // Transition to error state
      this.setState(ConnectionState.Error);
      this.eventHandlers.onError?.(new Error(payload.message));
      this.eventHandlers.onDisconnected?.('error');
    }
  }

  /**
   * Send GOODBYE and disconnect
   */
  async disconnect(reason = 'user_disconnect'): Promise<void> {
    if (this.state === ConnectionState.Disconnected || this.state === ConnectionState.Closed) {
      return;
    }

    const goodbye: GoodbyePayload = {
      reason: reason as GoodbyePayload['reason'],
      code: CloseCode.Normal,
      canReconnect: false,
    };

    const message = createControlMessage(ControlType.Goodbye, goodbye, ++this.sequenceNumber, this.sessionId);

    this.eventHandlers.onSendMessage(message);
    this.metrics.messagesSent++;
    this.setState(ConnectionState.Closing);
  }

  /**
   * Reset state machine
   */
  reset(): void {
    this.state = ConnectionState.Disconnected;
    this.sessionId = undefined;
    this.remoteOrigin = undefined;
    this.sequenceNumber = 0;
    this.metrics = {
      messagesSent: 0,
      messagesReceived: 0,
      lastActivity: Date.now(),
      connectionStartTime: 0,
    };
  }

  /**
   * Set state and notify listeners
   */
  private setState(newState: ConnectionState): void {
    const oldState = this.state;
    this.state = newState;
    console.debug(`[StateMachine] State transition: ${oldState} -> ${newState}`);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 11);
    const prefix = this.role === ConnectionRole.Server ? 'srv' : 'cli';
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Negotiate protocol version
   */
  private negotiateVersion(clientVersions: string[]): string {
    for (const version of SUPPORTED_VERSIONS) {
      if (clientVersions.includes(version)) {
        return version;
      }
    }
    return PROTOCOL_VERSION;
  }
}
