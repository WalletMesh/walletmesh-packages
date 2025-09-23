/**
 * Enhanced Cross-Window Transport with Control Message Protocol
 *
 * Implements secure cross-window communication with proper session management,
 * heartbeat monitoring, and control/data plane separation.
 *
 * @module cross-window/EnhancedCrossWindowTransport
 * @internal
 */

import type {
  TransportConfig,
  TransportConnectedEvent,
  TransportDisconnectedEvent,
  TransportErrorEvent,
  TransportMessageEvent,
} from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import type { ErrorHandler } from '../../core/errors/errorHandler.js';
import type { Logger } from '../../core/logger/logger.js';
import { AbstractTransport } from '../AbstractTransport.js';
import {
  type ConnectionEventHandlers,
  ConnectionRole,
  ConnectionState,
  ConnectionStateMachine,
} from './ConnectionStateMachine.js';
import { type HeartbeatConfig, type HeartbeatHandlers, HeartbeatManager } from './HeartbeatManager.js';
import { MessageRouter, type MessageRouterConfig } from './MessageRouter.js';
import { type SessionConfig, type SessionInfo, SessionManager } from './SessionManager.js';
import {
  CloseCode,
  type ControlMessage,
  ControlType,
  type DataMessage,
  type ErrorMessage,
  type GoodbyePayload,
  type HelloPayload,
  SUPPORTED_VERSIONS,
  type TransportMessage,
  createControlMessage,
  createDataMessage,
} from './protocol.js';

/**
 * Enhanced configuration for CrossWindowTransport
 */
export interface EnhancedCrossWindowConfig extends TransportConfig {
  /** Target window to communicate with */
  targetWindow?: Window | null;
  /** Expected origin of the target window (required for security) */
  targetOrigin: string;
  /** Transport instance identifier */
  messageId?: string;
  /** Connection timeout in milliseconds */
  timeout?: number;
  /** Session configuration */
  session?: SessionConfig;
  /** Heartbeat configuration */
  heartbeat?: HeartbeatConfig;
  /** Client identifier for debugging */
  clientId?: string;
  /** Additional metadata to send during handshake */
  metadata?: Record<string, unknown>;
  /** Protocol capabilities to request */
  capabilities?: string[];
}

/**
 * Enhanced Cross-Window Transport Implementation
 */
export class EnhancedCrossWindowTransport extends AbstractTransport {
  private targetWindow: Window | null = null;
  private targetOrigin: string;
  private messageId: string;
  private clientId: string;
  private metadata?: Record<string, unknown>;
  private capabilities: string[] = [];

  // Protocol components
  private stateMachine!: ConnectionStateMachine;
  private messageRouter!: MessageRouter;
  private sessionManager!: SessionManager;
  private heartbeatManager!: HeartbeatManager;

  // State tracking
  private currentSession?: SessionInfo;
  private messageSequence = 0;
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private isServer = false;

  protected override connected = false;
  protected override config: EnhancedCrossWindowConfig;

  constructor(config: EnhancedCrossWindowConfig, logger: Logger, errorHandler: ErrorHandler) {
    super(config, logger, errorHandler);

    this.config = config;
    this.targetWindow = config.targetWindow || null;
    this.targetOrigin = config.targetOrigin;
    this.messageId = config.messageId || 'enhanced-cross-window';
    this.clientId = config.clientId || `client-${Date.now()}`;
    this.metadata = config.metadata || {};
    this.capabilities = config.capabilities || [];

    // Auto-detect if we're in a popup context (server/wallet)
    if (!this.targetWindow && typeof window !== 'undefined' && window.opener) {
      this.targetWindow = window.opener;
      this.isServer = true;
      this.log('debug', 'Auto-detected popup context (server role)');
    }

    // Initialize protocol components
    this.initializeComponents();

    this.log('debug', 'EnhancedCrossWindowTransport initialized', {
      targetOrigin: this.targetOrigin,
      messageId: this.messageId,
      clientId: this.clientId,
      role: this.isServer ? 'server' : 'client',
    });
  }

  /**
   * Initialize protocol components
   */
  private initializeComponents(): void {
    // Initialize session manager
    this.sessionManager = new SessionManager(this.config.session, this.isServer);

    // Initialize connection state machine
    const connectionHandlers: ConnectionEventHandlers = {
      onSendMessage: (message) => this.sendControlMessage(message),
      onConnected: (sessionId) => this.handleConnected(sessionId),
      onDisconnected: (reason) => this.handleDisconnected(reason),
      onError: (error) => this.handleError(error),
    };

    this.stateMachine = new ConnectionStateMachine(
      this.isServer ? ConnectionRole.Server : ConnectionRole.Client,
      connectionHandlers,
    );

    // Initialize message router
    const routerConfig: MessageRouterConfig = {
      stateMachine: this.stateMachine,
      onDataMessage: (message) => this.handleDataMessage(message),
      onErrorMessage: (message) => this.handleErrorMessage(message),
      onRawMessage: (data) => this.handleRawMessage(data),
    };

    this.messageRouter = new MessageRouter(routerConfig);

    // Initialize heartbeat manager
    const heartbeatHandlers: HeartbeatHandlers = {
      onSendPing: (message) => this.sendControlMessage(message),
      onHealthy: () => this.log('debug', 'Connection healthy'),
      onDegraded: () => this.log('warn', 'Connection degraded'),
      onDead: () => this.handleDeadConnection(),
    };

    this.heartbeatManager = new HeartbeatManager(this.config.heartbeat || {}, heartbeatHandlers);
  }

  /**
   * Internal implementation of connect method
   */
  protected async connectInternal(): Promise<void> {
    if (this.connected || this.stateMachine.getState() !== ConnectionState.Disconnected) {
      return;
    }

    return new Promise((resolve, reject) => {
      const timeoutMs = this.config.timeout || 30000;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      try {
        if (!this.targetWindow) {
          throw ErrorFactory.configurationError('Target window is required', {
            transport: 'enhanced-cross-window',
          });
        }

        // Set up message listener
        this.setupMessageListener();

        // Set up connection timeout
        timeoutId = setTimeout(() => {
          cleanup();
          reject(
            ErrorFactory.connectionFailed('Connection timeout', {
              transport: 'enhanced-cross-window',
              timeout: timeoutMs,
            }),
          );
        }, timeoutMs);

        // Store original handlers
        const originalConnected = this.stateMachine.eventHandlers.onConnected;
        const originalError = this.stateMachine.eventHandlers.onError;

        // Set up one-time connection handlers
        this.stateMachine.eventHandlers.onConnected = (sessionId) => {
          cleanup();
          if (originalConnected) this.stateMachine.eventHandlers.onConnected = originalConnected;
          if (originalError) this.stateMachine.eventHandlers.onError = originalError;
          originalConnected?.(sessionId);
          resolve();
        };

        this.stateMachine.eventHandlers.onError = (error) => {
          cleanup();
          if (originalConnected) this.stateMachine.eventHandlers.onConnected = originalConnected;
          if (originalError) this.stateMachine.eventHandlers.onError = originalError;
          originalError?.(error);
          reject(error);
        };

        // Initiate connection based on role
        if (this.isServer) {
          // Server waits for HELLO from client
          this.stateMachine.connect();
          this.log('debug', 'Server waiting for client HELLO');
        } else {
          // Client sends HELLO to server
          this.stateMachine.connect();
          const helloPayload: HelloPayload = {
            origin: window.location.origin,
            capabilities: this.capabilities,
            protocolVersions: SUPPORTED_VERSIONS,
            preferredVersion: SUPPORTED_VERSIONS[0] || '1.0.0',
            clientId: this.clientId,
            ...(this.metadata ? { metadata: this.metadata } : {}),
          };

          const helloMessage = createControlMessage(ControlType.Hello, helloPayload, this.getNextSequence());
          this.sendControlMessage(helloMessage);
          this.log('debug', 'Client sent HELLO to server');
        }
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }

  /**
   * Set up message event listener
   */
  private setupMessageListener(): void {
    this.messageHandler = (event: MessageEvent) => {
      // Validate origin
      if (event.origin !== this.targetOrigin) {
        return;
      }

      // Validate source window
      if (this.targetWindow && event.source !== this.targetWindow) {
        return;
      }

      this.log('debug', 'Received message', {
        origin: event.origin,
        data: event.data,
      });

      // Route message through the message router
      this.messageRouter.routeMessage(event.data).catch((error) => {
        this.log('error', 'Failed to route message', error);
      });
    };

    window.addEventListener('message', this.messageHandler);
  }

  /**
   * Handle data message
   */
  private async handleDataMessage(message: DataMessage): Promise<void> {
    // Update session activity
    if (this.currentSession) {
      this.sessionManager.updateActivity(this.currentSession.id);
      this.sessionManager.updateStats(this.currentSession.id, 'received', message.sequence);
    }

    // Emit as transport message event
    this.emit({
      type: 'message',
      data: message.payload,
    } as TransportMessageEvent);
  }

  /**
   * Handle error message
   */
  private async handleErrorMessage(message: ErrorMessage): Promise<void> {
    this.log('error', 'Received error message', { message: message.payload.message });

    this.emit({
      type: 'error',
      error: ErrorFactory.transportError(message.payload.message),
    } as TransportErrorEvent);
  }

  /**
   * Handle raw message (backward compatibility)
   */
  private async handleRawMessage(data: unknown): Promise<void> {
    // Handle legacy JSON-RPC messages
    if (data && typeof data === 'object' && 'jsonrpc' in data && data.jsonrpc === '2.0') {
      this.emit({
        type: 'message',
        data,
      } as TransportMessageEvent);
    }
  }

  /**
   * Handle connection established
   */
  private handleConnected(sessionId: string): void {
    this.connected = true;
    const session = this.sessionManager.getSession(sessionId);
    if (session) {
      this.currentSession = session;
    }

    // Start heartbeat
    this.heartbeatManager.start(sessionId);

    this.log('info', 'Connection established', {
      sessionId,
      role: this.isServer ? 'server' : 'client',
    });

    this.emit({
      type: 'connected',
    } as TransportConnectedEvent);
  }

  /**
   * Handle disconnection
   */
  private handleDisconnected(reason: string): void {
    this.connected = false;

    // Stop heartbeat
    this.heartbeatManager.stop();

    // Suspend session
    if (this.currentSession) {
      this.sessionManager.suspendSession(this.currentSession.id);
    }

    this.log('info', 'Disconnected', { reason });

    this.emit({
      type: 'disconnected',
      reason,
    } as TransportDisconnectedEvent);
  }

  /**
   * Handle transport error
   */
  private handleError(error: Error): void {
    this.log('error', 'Transport error', { message: error.message });

    const modalError = ErrorFactory.transportError(error.message);
    this.emit({
      type: 'error',
      error: modalError,
    } as TransportErrorEvent);
  }

  /**
   * Handle dead connection
   */
  private handleDeadConnection(): void {
    this.log('error', 'Connection is dead');

    // Initiate disconnect
    this.disconnect().catch((error) => {
      this.log('error', 'Failed to disconnect', error);
    });
  }

  /**
   * Send control message
   */
  private sendControlMessage(message: ControlMessage): void {
    this.sendRawMessage(message).catch((error) => {
      this.log('error', 'Failed to send control message', error);
    });
  }

  /**
   * Send raw message
   */
  private async sendRawMessage(message: TransportMessage): Promise<void> {
    if (!this.targetWindow || (this.targetWindow as Window).closed) {
      throw ErrorFactory.transportDisconnected('Target window closed', 'enhanced-cross-window');
    }

    try {
      this.targetWindow.postMessage(message, this.targetOrigin);

      // Update session statistics
      if (this.currentSession) {
        this.sessionManager.updateStats(this.currentSession.id, 'sent', message.sequence);
        this.heartbeatManager.updateMessageStats(
          this.currentSession.stats.messagesSent,
          this.currentSession.stats.messagesReceived,
        );
      }
    } catch (error) {
      throw ErrorFactory.messageFailed('Failed to send message', {
        transport: 'enhanced-cross-window',
        originalError: error,
      });
    }
  }

  /**
   * Get next message sequence number
   */
  private getNextSequence(): number {
    return ++this.messageSequence;
  }

  /**
   * Internal implementation of disconnect method
   */
  protected async disconnectInternal(): Promise<void> {
    if (!this.connected) {
      return;
    }

    // Send GOODBYE message
    if (this.currentSession) {
      const goodbyePayload: GoodbyePayload = {
        reason: 'user_disconnect',
        code: CloseCode.Normal,
        canReconnect: true,
        message: 'User initiated disconnect',
      };

      const goodbyeMessage = createControlMessage(
        ControlType.Goodbye,
        goodbyePayload,
        this.getNextSequence(),
        this.currentSession.id,
      );

      await this.sendRawMessage(goodbyeMessage);
    }

    // Clean up
    this.connected = false;
    this.heartbeatManager.stop();

    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }

    // Expire session
    if (this.currentSession) {
      this.sessionManager.expireSession(this.currentSession.id);
      // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
      delete this.currentSession;
    }

    // Reset state machine
    this.stateMachine.reset();

    this.emit({
      type: 'disconnected',
      reason: 'Transport disconnected',
    } as TransportDisconnectedEvent);
  }

  /**
   * Internal implementation of send method
   */
  protected async sendInternal(data: unknown): Promise<void> {
    if (!this.connected || !this.currentSession) {
      throw ErrorFactory.transportError('Not connected', 'enhanced-cross-window');
    }

    // Create data message
    const dataMessage = createDataMessage(
      data,
      this.getNextSequence(),
      this.currentSession.id,
      'rpc_request',
    );

    await this.sendRawMessage(dataMessage);
  }

  /**
   * Destroy the transport and clean up resources
   */
  override async destroy(): Promise<void> {
    await this.disconnect();

    // Dispose of all components
    this.heartbeatManager.dispose();
    this.sessionManager.dispose();
    this.messageRouter.reset();

    this.targetWindow = null;
    super.destroy();
  }
}
