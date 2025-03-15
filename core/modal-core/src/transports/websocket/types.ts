import type { TransportConfig } from '../types.js';

/**
 * Configuration options specific to WebSocket transport
 * Extends the base transport configuration with WebSocket-specific options
 *
 * @interface WebSocketTransportConfig
 * @extends {TransportConfig}
 */
export interface WebSocketTransportConfig extends TransportConfig {
  /**
   * WebSocket URL to connect to
   * The URL should include the protocol (ws:// or wss://)
   */
  url: string;

  /**
   * Optional WebSocket protocols
   * Can be a single protocol string or an array of protocol strings
   * These are used during the WebSocket handshake to agree on a protocol
   */
  protocols?: string | string[];
}
