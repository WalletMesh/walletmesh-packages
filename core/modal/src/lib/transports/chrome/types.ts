/**
 * @file types.ts
 * @packageDocumentation
 * Type definitions for Chrome extension transport.
 */

import type { BaseTransportConfig } from '../types.js';

/**
 * Configuration options for Chrome extension transport.
 */
export interface ChromeTransportConfig extends BaseTransportConfig {
  /** Chrome extension ID to connect to */
  extensionId: string;
  /** Optional port name for the connection */
  portName?: string | undefined;
  /** Whether to auto-reconnect on disconnect (required from BaseTransportConfig) */
  autoReconnect: boolean;
}

/**
 * Chrome runtime message format.
 */
export interface ChromeMessage {
  /** Message type identifier */
  type: ChromeMessageType;
  /** Optional message payload */
  payload?: unknown;
  /** Optional error information */
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  /** Message timestamp */
  timestamp: number;
  /** Message ID for correlation */
  id: string;
}

/**
 * Chrome runtime port interface for extension communication.
 */
export interface ChromePort {
  name: string;
  disconnect(): void;
  error?: Error;
  onDisconnect: {
    addListener(callback: () => void): void;
    removeListener(callback: () => void): void;
  };
  onMessage: {
    addListener(callback: (message: ChromeMessage) => void): void;
    removeListener(callback: (message: ChromeMessage) => void): void;
  };
  postMessage(message: ChromeMessage): void;
}

/**
 * Chrome runtime API interface.
 */
export interface ChromeRuntime {
  connect(extensionId: string, connectInfo?: { name?: string | undefined }): ChromePort;
  lastError?: Error | undefined;
}

/**
 * Supported message types for Chrome extension transport.
 */
export enum ChromeMessageType {
  /** Connection request message */
  CONNECT = 'CONNECT',
  /** Connection response message */
  CONNECT_RESPONSE = 'CONNECT_RESPONSE',
  /** Disconnect notification */
  DISCONNECT = 'DISCONNECT',
  /** General purpose request */
  REQUEST = 'REQUEST',
  /** General purpose response */
  RESPONSE = 'RESPONSE',
  /** Error notification */
  ERROR = 'ERROR',
  /** Keep-alive ping */
  PING = 'PING',
  /** Keep-alive pong */
  PONG = 'PONG',
}

// Type guard for ChromeMessage
export function isChromeMessage(value: unknown): value is ChromeMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'timestamp' in value &&
    'id' in value &&
    typeof (value as ChromeMessage).timestamp === 'number' &&
    typeof (value as ChromeMessage).id === 'string' &&
    typeof (value as ChromeMessage).type === 'string' &&
    Object.values(ChromeMessageType).includes((value as ChromeMessage).type as ChromeMessageType)
  );
}

/**
 * Creates a message ID
 */
export function createMessageId(): string {
  return crypto.randomUUID();
}

// Chrome runtime global
declare global {
  interface Window {
    chrome?: {
      runtime: ChromeRuntime;
    };
  }
}
