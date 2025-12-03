/**
 * Cross-Window Transport Protocol Definition
 *
 * Defines the control message protocol for secure, reliable cross-window communication.
 * This protocol separates control plane (session management, heartbeat) from data plane (JSON-RPC).
 *
 * @module cross-window/protocol
 * @internal
 */

/**
 * Current protocol version
 * Follows semantic versioning: major.minor.patch
 */
export const PROTOCOL_VERSION = '2.0.0';

/**
 * Supported protocol versions for backward compatibility
 * Ordered from newest to oldest
 */
export const SUPPORTED_VERSIONS = ['2.0.0', '1.0.0'];

/**
 * Message category enumeration
 * Defines the three types of messages in the protocol
 */
export enum MessageCategory {
  /** Control plane messages (handshake, heartbeat, session management) */
  Control = 'control',
  /** Data plane messages (JSON-RPC requests/responses) */
  Data = 'data',
  /** Error messages (transport-level errors) */
  Error = 'error',
}

/**
 * Control message type enumeration
 * Defines all control plane message types
 */
export enum ControlType {
  /** Initiates connection handshake (client -> server) */
  Hello = 'hello',
  /** Acknowledges HELLO and negotiates protocol (server -> client) */
  HelloAck = 'hello_ack',
  /** Confirms connection is ready (client -> server) */
  Ready = 'ready',
  /** Heartbeat ping (either direction) */
  Ping = 'ping',
  /** Heartbeat pong response (either direction) */
  Pong = 'pong',
  /** Graceful disconnect request (either direction) */
  Goodbye = 'goodbye',
  /** Acknowledges disconnect (either direction) */
  GoodbyeAck = 'goodbye_ack',
  /** Control plane error */
  Error = 'error',
  /** Resume existing session (client -> server) */
  Resume = 'resume',
  /** Acknowledges session resume (server -> client) */
  ResumeAck = 'resume_ack',
}

/**
 * Base transport message interface
 * All messages must conform to this structure
 */
export interface TransportMessage {
  /** Message category (control, data, or error) */
  category: MessageCategory;
  /** Specific message type within the category */
  type: string;
  /** Protocol version used by sender */
  version: string;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** Monotonically increasing sequence number */
  sequence: number;
  /** Session identifier (undefined before session establishment) */
  sessionId?: string | undefined;
  /** Message-specific payload */
  payload: unknown;
}

/**
 * Control message interface
 * Extends TransportMessage with control-specific typing
 */
export interface ControlMessage extends TransportMessage {
  category: MessageCategory.Control;
  type: ControlType;
  payload: ControlPayload;
}

/**
 * Data message interface
 * Wraps JSON-RPC or other application data
 */
export interface DataMessage extends TransportMessage {
  category: MessageCategory.Data;
  type: 'rpc_request' | 'rpc_response' | 'rpc_notification';
  payload: unknown; // JSON-RPC message
}

/**
 * Error message interface
 * Transport-level error reporting
 */
export interface ErrorMessage extends TransportMessage {
  category: MessageCategory.Error;
  type: 'transport_error' | 'protocol_error' | 'session_error';
  payload: TransportError;
}

/**
 * Union type for all control message payloads
 */
export type ControlPayload =
  | HelloPayload
  | HelloAckPayload
  | ReadyPayload
  | PingPayload
  | PongPayload
  | GoodbyePayload
  | GoodbyeAckPayload
  | ErrorPayload
  | ResumePayload
  | ResumeAckPayload;

/**
 * HELLO message payload
 * Sent by client to initiate connection
 */
export interface HelloPayload {
  /** Sender's origin URL */
  origin: string;
  /** List of supported protocol capabilities */
  capabilities: string[];
  /** Supported protocol versions in preference order */
  protocolVersions: string[];
  /** Preferred protocol version */
  preferredVersion: string;
  /** Optional client identifier */
  clientId?: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * HELLO_ACK message payload
 * Sent by server in response to HELLO
 */
export interface HelloAckPayload {
  /** Server's origin URL */
  origin: string;
  /** Negotiated protocol version */
  negotiatedVersion: string;
  /** Mutually supported capabilities */
  capabilities: string[];
  /** Session timeout in milliseconds */
  sessionTimeout: number;
  /** Heartbeat interval in milliseconds */
  heartbeatInterval: number;
  /** Generated session ID */
  sessionId: string;
  /** Optional server identifier */
  serverId?: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * READY message payload
 * Confirms connection establishment
 */
export interface ReadyPayload {
  /** Connection status */
  status: 'connected';
  /** Session ID confirmation */
  sessionId: string;
}

/**
 * PING message payload
 * Heartbeat request
 */
export interface PingPayload {
  /** Connection metrics */
  metrics: {
    /** Number of messages sent in this session */
    messagesSent: number;
    /** Number of messages received in this session */
    messagesReceived: number;
    /** Last activity timestamp */
    lastActivity: number;
    /** Optional memory usage */
    memoryUsage?: number;
  };
  /** Ping timestamp for latency calculation */
  pingTime: number;
}

/**
 * PONG message payload
 * Heartbeat response
 */
export interface PongPayload {
  /** Connection metrics */
  metrics: {
    /** Number of messages sent in this session */
    messagesSent: number;
    /** Number of messages received in this session */
    messagesReceived: number;
    /** Calculated round-trip latency in milliseconds */
    latency: number;
    /** Optional memory usage */
    memoryUsage?: number;
  };
  /** Original ping timestamp */
  pingTime: number;
  /** Pong timestamp */
  pongTime: number;
}

/**
 * GOODBYE message payload
 * Graceful disconnect request
 */
export interface GoodbyePayload {
  /** Disconnect reason */
  reason: 'user_disconnect' | 'session_timeout' | 'error' | 'shutdown' | 'reconnecting';
  /** Standard close code (similar to WebSocket close codes) */
  code: number;
  /** Whether client can attempt reconnection */
  canReconnect: boolean;
  /** Optional human-readable message */
  message?: string;
}

/**
 * GOODBYE_ACK message payload
 * Disconnect acknowledgment
 */
export interface GoodbyeAckPayload {
  /** Final status */
  status: 'disconnected';
  /** Echo of disconnect reason */
  reason: string;
}

/**
 * ERROR message payload
 * Control plane error
 */
export interface ErrorPayload {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Whether the error is recoverable */
  recoverable: boolean;
  /** Suggested retry delay in milliseconds */
  retryAfter?: number;
  /** Error context */
  context?: Record<string, unknown>;
}

/**
 * RESUME message payload
 * Attempt to resume existing session
 */
export interface ResumePayload {
  /** Session ID to resume */
  sessionId: string;
  /** Last received sequence number */
  lastSequence: number;
  /** Client metrics for continuity check */
  metrics: {
    messagesSent: number;
    messagesReceived: number;
  };
}

/**
 * RESUME_ACK message payload
 * Session resume acknowledgment
 */
export interface ResumeAckPayload {
  /** Resume status */
  status: 'resumed' | 'rejected';
  /** New or existing session ID */
  sessionId: string;
  /** Server's last sequence number */
  lastSequence: number;
  /** Messages missed during disconnect (if any) */
  missedMessages?: TransportMessage[];
  /** Rejection reason if status is 'rejected' */
  reason?: string;
}

/**
 * Transport-level error structure
 */
export interface TransportError {
  /** Error code (e.g., 'INVALID_SESSION', 'PROTOCOL_MISMATCH') */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Whether the error is recoverable */
  recoverable: boolean;
  /** Suggested retry delay in milliseconds */
  retryAfter?: number;
  /** Additional error context */
  context?: Record<string, unknown>;
  /** Stack trace for debugging (development only) */
  stack?: string;
}

/**
 * Protocol capabilities
 * Features that can be negotiated during handshake
 */
export enum Capability {
  /** Support for message batching */
  Batch = 'batch',
  /** Support for subscriptions/notifications */
  Subscriptions = 'subscriptions',
  /** Support for message compression */
  Compression = 'compression',
  /** Support for message encryption */
  Encryption = 'encryption',
  /** Support for binary data */
  Binary = 'binary',
  /** Support for request cancellation */
  Cancellation = 'cancellation',
  /** Support for progress notifications */
  Progress = 'progress',
}

/**
 * Standard close codes (similar to WebSocket)
 */
export enum CloseCode {
  /** Normal closure */
  Normal = 1000,
  /** Going away (page unload, etc.) */
  GoingAway = 1001,
  /** Protocol error */
  ProtocolError = 1002,
  /** Unsupported data */
  Unsupported = 1003,
  /** Invalid message */
  InvalidMessage = 1007,
  /** Policy violation */
  PolicyViolation = 1008,
  /** Message too large */
  TooLarge = 1009,
  /** Internal error */
  InternalError = 1011,
  /** Service restart */
  ServiceRestart = 1012,
  /** Try again later */
  TryAgain = 1013,
}

/**
 * Type guards for message validation
 */
export function isTransportMessage(data: unknown): data is TransportMessage {
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

export function isControlMessage(message: TransportMessage): message is ControlMessage {
  return message.category === MessageCategory.Control;
}

export function isDataMessage(message: TransportMessage): message is DataMessage {
  return message.category === MessageCategory.Data;
}

export function isErrorMessage(message: TransportMessage): message is ErrorMessage {
  return message.category === MessageCategory.Error;
}

/**
 * Create a transport message
 */
export function createTransportMessage(
  category: MessageCategory,
  type: string,
  payload: unknown,
  sequence: number,
  sessionId?: string,
): TransportMessage {
  return {
    category,
    type,
    version: PROTOCOL_VERSION,
    timestamp: Date.now(),
    sequence,
    sessionId,
    payload,
  };
}

/**
 * Create a control message
 */
export function createControlMessage(
  type: ControlType,
  payload: ControlPayload,
  sequence: number,
  sessionId?: string,
): ControlMessage {
  return {
    category: MessageCategory.Control,
    type,
    version: PROTOCOL_VERSION,
    timestamp: Date.now(),
    sequence,
    sessionId,
    payload,
  } as ControlMessage;
}

/**
 * Create a data message
 */
export function createDataMessage(
  payload: unknown,
  sequence: number,
  sessionId?: string,
  type: 'rpc_request' | 'rpc_response' | 'rpc_notification' = 'rpc_request',
): DataMessage {
  return {
    category: MessageCategory.Data,
    type,
    version: PROTOCOL_VERSION,
    timestamp: Date.now(),
    sequence,
    sessionId,
    payload,
  };
}

/**
 * Create an error message
 */
export function createErrorMessage(
  error: TransportError,
  sequence: number,
  sessionId?: string,
): ErrorMessage {
  return {
    category: MessageCategory.Error,
    type: 'transport_error',
    version: PROTOCOL_VERSION,
    timestamp: Date.now(),
    sequence,
    sessionId,
    payload: error,
  };
}
