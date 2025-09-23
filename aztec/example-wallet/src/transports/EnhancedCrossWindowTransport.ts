/**
 * Enhanced Cross-Window Transport for Wallet Side
 *
 * Wallet-side implementation of the control message protocol for secure
 * cross-window communication with session management and heartbeat.
 *
 * This is the server-side implementation that pairs with the client-side
 * transport in modal-core.
 */

import type { JSONRPCTransport } from '@walletmesh/jsonrpc';

// Protocol definitions (duplicated here to avoid dependency on modal-core)
const PROTOCOL_VERSION = '2.0.0';
const SUPPORTED_VERSIONS = ['2.0.0', '1.0.0'];

enum MessageCategory {
  CONTROL = 'control',
  DATA = 'data',
  ERROR = 'error',
}

enum ControlType {
  HELLO = 'hello',
  HELLO_ACK = 'hello_ack',
  READY = 'ready',
  PING = 'ping',
  PONG = 'pong',
  GOODBYE = 'goodbye',
  GOODBYE_ACK = 'goodbye_ack',
  ERROR = 'error',
  RESUME = 'resume',
  RESUME_ACK = 'resume_ack',
}

enum CloseCode {
  NORMAL = 1000,
  GOING_AWAY = 1001,
  PROTOCOL_ERROR = 1002,
  UNSUPPORTED = 1003,
  INVALID_MESSAGE = 1007,
  POLICY_VIOLATION = 1008,
  TOO_LARGE = 1009,
  INTERNAL_ERROR = 1011,
  SERVICE_RESTART = 1012,
  TRY_AGAIN = 1013,
}

interface TransportMessage {
  category: MessageCategory;
  type: string;
  version: string;
  timestamp: number;
  sequence: number;
  sessionId?: string;
  payload: unknown;
}

interface HelloPayload {
  origin: string;
  capabilities: string[];
  protocolVersions: string[];
  preferredVersion: string;
  clientId?: string;
  metadata?: Record<string, unknown>;
}

interface HelloAckPayload {
  origin: string;
  negotiatedVersion: string;
  capabilities: string[];
  sessionTimeout: number;
  heartbeatInterval: number;
  sessionId: string;
  serverId?: string;
  metadata?: Record<string, unknown>;
}

interface ReadyPayload {
  status: 'connected';
  sessionId: string;
}

interface PingPayload {
  metrics: {
    messagesSent: number;
    messagesReceived: number;
    lastActivity: number;
    memoryUsage?: number;
  };
  pingTime: number;
}

interface PongPayload {
  metrics: {
    messagesSent: number;
    messagesReceived: number;
    latency: number;
    memoryUsage?: number;
  };
  pingTime: number;
  pongTime: number;
}

interface GoodbyePayload {
  reason: 'user_disconnect' | 'session_timeout' | 'error' | 'shutdown' | 'reconnecting';
  code: number;
  canReconnect: boolean;
  message?: string;
}

interface GoodbyeAckPayload {
  status: 'disconnected';
  reason: string;
}

/**
 * Enhanced wallet-side cross-window transport configuration
 */
export interface EnhancedWalletTransportConfig {
  /** Origin of the dApp to communicate with */
  targetOrigin: string;
  /** Server identifier */
  serverId?: string;
  /** Session timeout in milliseconds */
  sessionTimeout?: number;
  /** Heartbeat interval in milliseconds */
  heartbeatInterval?: number;
  /** Metadata to include in handshake */
  metadata?: Record<string, unknown>;
  /** Supported capabilities */
  capabilities?: string[];
}

/**
 * Session information
 */
interface SessionInfo {
  id: string;
  clientOrigin: string;
  clientId?: string;
  createdAt: number;
  lastActivity: number;
  protocolVersion: string;
  capabilities: string[];
  stats: {
    messagesSent: number;
    messagesReceived: number;
  };
}

/**
 * Enhanced wallet-side cross-window transport
 */
export class EnhancedWalletTransport implements JSONRPCTransport {
  private targetOrigin: string;
  private targetWindow: Window | null = null;
  private serverId: string;
  private sessionTimeout: number;
  private heartbeatInterval: number;
  private metadata?: Record<string, unknown>;
  private capabilities: string[];

  private session?: SessionInfo;
  private messageSequence = 0;
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private dataHandler: ((data: unknown) => void) | null = null;
  private heartbeatTimer?: NodeJS.Timeout;
  private sessionTimer?: NodeJS.Timeout;
  private isConnected = false;

  constructor(config: EnhancedWalletTransportConfig) {
    this.targetOrigin = config.targetOrigin;
    this.serverId = config.serverId || `wallet-${Date.now()}`;
    this.sessionTimeout = config.sessionTimeout || 300000; // 5 minutes
    this.heartbeatInterval = config.heartbeatInterval || 30000; // 30 seconds
    this.metadata = config.metadata;
    this.capabilities = config.capabilities || [];

    // Auto-detect target window (should be opener)
    if (window?.opener) {
      this.targetWindow = window.opener;
    }
  }

  /**
   * Connect the transport
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    // Set up message listener
    this.setupMessageListener();

    // Wait for HELLO from client
    console.log('[WalletTransport] Waiting for client HELLO');
  }

  /**
   * Disconnect the transport
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    // Send GOODBYE if we have a session
    if (this.session) {
      const goodbye: GoodbyePayload = {
        reason: 'shutdown',
        code: CloseCode.NORMAL,
        canReconnect: false,
        message: 'Wallet closing',
      };

      await this.sendControlMessage(ControlType.GOODBYE, goodbye);
    }

    this.cleanup();
  }

  /**
   * Send data through the transport
   */
  async send(data: unknown): Promise<void> {
    if (!this.isConnected || !this.session) {
      throw new Error('Not connected');
    }

    const message: TransportMessage = {
      category: MessageCategory.DATA,
      type: 'rpc_response',
      version: PROTOCOL_VERSION,
      timestamp: Date.now(),
      sequence: this.getNextSequence(),
      sessionId: this.session.id,
      payload: data,
    };

    await this.sendMessage(message);
    this.updateSessionActivity();
  }

  /**
   * Set data handler
   */
  onData(handler: (data: unknown) => void): void {
    this.dataHandler = handler;
  }

  /**
   * Remove data handler
   */
  offData(): void {
    this.dataHandler = null;
  }

  /**
   * Set message handler (required by JSONRPCTransport interface)
   */
  onMessage(handler: (data: unknown) => void): void {
    // For compatibility, we use onData for the actual handler
    this.onData(handler);
  }

  /**
   * Remove message handler (required by JSONRPCTransport interface)
   */
  offMessage(): void {
    this.offData();
  }

  /**
   * Set up message listener
   */
  private setupMessageListener(): void {
    this.messageHandler = async (event: MessageEvent) => {
      // Validate origin
      if (event.origin !== this.targetOrigin) {
        return;
      }

      // Validate source
      if (this.targetWindow && event.source !== this.targetWindow) {
        return;
      }

      const message = event.data;

      // Check if it's a transport protocol message
      if (!this.isTransportMessage(message)) {
        // Handle legacy messages for backward compatibility
        if (message?.jsonrpc === '2.0') {
          this.dataHandler?.(message);
        }
        return;
      }

      // Route based on category
      try {
        switch (message.category) {
          case MessageCategory.CONTROL:
            await this.handleControlMessage(message);
            break;
          case MessageCategory.DATA:
            await this.handleDataMessage(message);
            break;
          case MessageCategory.ERROR:
            await this.handleErrorMessage(message);
            break;
        }
      } catch (error) {
        console.error('[WalletTransport] Error handling message:', error);
      }
    };

    window.addEventListener('message', this.messageHandler);
  }

  /**
   * Handle control message
   */
  private async handleControlMessage(message: TransportMessage): Promise<void> {
    console.log('[WalletTransport] Control message:', message.type);

    switch (message.type) {
      case ControlType.HELLO:
        await this.handleHello(message.payload as HelloPayload);
        break;
      case ControlType.READY:
        await this.handleReady(message.payload as ReadyPayload);
        break;
      case ControlType.PING:
        await this.handlePing(message.payload as PingPayload);
        break;
      case ControlType.GOODBYE:
        await this.handleGoodbye(message.payload as GoodbyePayload);
        break;
      case ControlType.RESUME:
        // Future: handle session resume
        break;
    }
  }

  /**
   * Handle HELLO message
   */
  private async handleHello(payload: HelloPayload): Promise<void> {
    console.log('[WalletTransport] Received HELLO from client:', payload);

    // Create session
    const sessionId = this.generateSessionId();
    this.session = {
      id: sessionId,
      clientOrigin: payload.origin,
      clientId: payload.clientId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      protocolVersion: this.negotiateVersion(payload.protocolVersions),
      capabilities: this.negotiateCapabilities(payload.capabilities),
      stats: {
        messagesSent: 0,
        messagesReceived: 0,
      },
    };

    // Send HELLO_ACK
    const helloAck: HelloAckPayload = {
      origin: window.location.origin,
      negotiatedVersion: this.session.protocolVersion,
      capabilities: this.session.capabilities,
      sessionTimeout: this.sessionTimeout,
      heartbeatInterval: this.heartbeatInterval,
      sessionId: sessionId,
      serverId: this.serverId,
      metadata: this.metadata,
    };

    await this.sendControlMessage(ControlType.HELLO_ACK, helloAck);
    console.log('[WalletTransport] Sent HELLO_ACK');

    // Start session timer
    this.startSessionTimer();
  }

  /**
   * Handle READY message
   */
  private async handleReady(payload: ReadyPayload): Promise<void> {
    console.log('[WalletTransport] Received READY from client');

    if (!this.session || payload.sessionId !== this.session.id) {
      console.error('[WalletTransport] Invalid session in READY');
      return;
    }

    this.isConnected = true;
    console.log('[WalletTransport] Connection established');
  }

  /**
   * Handle PING message
   */
  private async handlePing(payload: PingPayload): Promise<void> {
    if (!this.session) {
      return;
    }

    // Calculate latency
    const pongTime = Date.now();
    const latency = pongTime - payload.pingTime;

    // Send PONG
    const pong: PongPayload = {
      metrics: {
        messagesSent: this.session.stats.messagesSent,
        messagesReceived: this.session.stats.messagesReceived,
        latency,
      },
      pingTime: payload.pingTime,
      pongTime,
    };

    await this.sendControlMessage(ControlType.PONG, pong);
    this.updateSessionActivity();
  }

  /**
   * Handle GOODBYE message
   */
  private async handleGoodbye(payload: GoodbyePayload): Promise<void> {
    console.log('[WalletTransport] Received GOODBYE:', payload);

    // Send GOODBYE_ACK
    const ack: GoodbyeAckPayload = {
      status: 'disconnected',
      reason: payload.reason,
    };

    await this.sendControlMessage(ControlType.GOODBYE_ACK, ack);

    // Clean up
    this.cleanup();
  }

  /**
   * Handle data message
   */
  private async handleDataMessage(message: TransportMessage): Promise<void> {
    if (!this.session) {
      return;
    }

    this.session.stats.messagesReceived++;
    this.updateSessionActivity();

    // Pass to data handler
    this.dataHandler?.(message.payload);
  }

  /**
   * Handle error message
   */
  private async handleErrorMessage(message: TransportMessage): Promise<void> {
    console.error('[WalletTransport] Error message:', message.payload);
  }

  /**
   * Send control message
   */
  private async sendControlMessage(type: ControlType, payload: unknown): Promise<void> {
    const message: TransportMessage = {
      category: MessageCategory.CONTROL,
      type,
      version: PROTOCOL_VERSION,
      timestamp: Date.now(),
      sequence: this.getNextSequence(),
      sessionId: this.session?.id,
      payload,
    };

    await this.sendMessage(message);
  }

  /**
   * Send message
   */
  private async sendMessage(message: TransportMessage): Promise<void> {
    if (!this.targetWindow || (this.targetWindow as Window).closed) {
      throw new Error('Target window closed');
    }

    this.targetWindow.postMessage(message, this.targetOrigin);

    if (this.session) {
      this.session.stats.messagesSent++;
    }
  }

  /**
   * Get next sequence number
   */
  private getNextSequence(): number {
    return ++this.messageSequence;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 11);
    return `srv_${timestamp}_${random}`;
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

  /**
   * Negotiate capabilities
   */
  private negotiateCapabilities(clientCapabilities: string[]): string[] {
    return clientCapabilities.filter((cap) => this.capabilities.includes(cap));
  }

  /**
   * Update session activity
   */
  private updateSessionActivity(): void {
    if (this.session) {
      this.session.lastActivity = Date.now();
    }

    // Reset session timer
    this.startSessionTimer();
  }

  /**
   * Start session timer
   */
  private startSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    this.sessionTimer = setTimeout(() => {
      if (this.session) {
        const now = Date.now();
        if (now - this.session.lastActivity > this.sessionTimeout) {
          console.log('[WalletTransport] Session timeout');
          this.disconnect().catch(console.error);
        } else {
          this.startSessionTimer();
        }
      }
    }, this.sessionTimeout);
  }

  /**
   * Check if message is a transport message
   */
  private isTransportMessage(data: unknown): data is TransportMessage {
    return (
      typeof data === 'object' &&
      data !== null &&
      'category' in data &&
      'type' in data &&
      'version' in data &&
      'timestamp' in data &&
      'sequence' in data &&
      'payload' in data
    );
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    this.isConnected = false;
    this.session = undefined;

    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }

    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }

    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = undefined;
    }
  }
}
