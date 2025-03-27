import type { Transport, ErrorHandler, Protocol } from '../transport/types.js';
import type { Provider } from '../types.js';

/**
 * Cleanup handler type
 */
export type CleanupHandler = () => void;

/**
 * Protocol message interface
 */
export interface ProtocolMessage<TReq = unknown, TRes = unknown> {
  request: TReq;
  response: TRes;
}

/**
 * Request message interface
 */
export interface RequestMessage<T = unknown> {
  method: string;
  params: T[];
}

// Re-export transport and core types
export type { Transport, ErrorHandler, Protocol, Provider };
