import type { ChainType } from '../../types/chains.js';

/**
 * Configuration options for the Chrome extension transport
 * @interface ChromeExtensionConfig
 */
export interface ChromeExtensionConfig {
  /** Chrome extension ID */
  extensionId: string;
  /** Optional connection timeout in milliseconds */
  timeout?: number;
}

/**
 * Message types for Chrome extension transport communication
 * @enum {string}
 */
export enum MessageType {
  /** Connect to wallet */
  CONNECT = 'connect',
  /** Disconnect from wallet */
  DISCONNECT = 'disconnect',
  /** Get provider instance */
  GET_PROVIDER = 'getProvider',
  /** Send request to provider */
  REQUEST = 'request',
}

/**
 * Message structure for Chrome extension transport
 * @interface TransportMessage
 * @template T - Type of the message data
 */
export interface TransportMessage<T = unknown> {
  /** Message type */
  type: MessageType;
  /** Optional message data */
  data?: T;
}

/**
 * Response structure for Chrome extension transport
 * @interface TransportResponse
 * @template T - Type of the response data
 */
export interface TransportResponse<T = unknown> {
  /** Whether the operation was successful */
  success: boolean;
  /** Optional response data */
  data?: T;
  /** Optional error message if operation failed */
  error?: string;
}

/**
 * Parameters for connecting to a wallet
 * @interface ConnectParams
 */
export interface ConnectParams {
  /** Chain to connect to */
  chain: ChainType;
  /** Optional connection timeout in milliseconds */
  timeout?: number;
}

/**
 * Handler function type for transport messages
 * @callback MessageHandler
 * @param message - The received message
 */
export type MessageHandler = (message: TransportMessage) => void;

/**
 * Interface for Chrome extension transport
 * Defines the communication layer between dApp and extension
 * @interface ChromeExtensionTransport
 */
export interface ChromeExtensionTransport {
  /**
   * Send message to extension
   * @template T - Type of the message data
   * @template R - Type of the response data
   * @param message - Message to send
   * @returns Promise that resolves with the response
   */
  sendMessage<T = unknown, R = unknown>(message: TransportMessage<T>): Promise<TransportResponse<R>>;

  /**
   * Handler for incoming messages
   * @optional
   */
  onMessage?: MessageHandler;
}
