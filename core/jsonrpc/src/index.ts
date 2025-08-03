/**
 * JSON-RPC 2.0 implementation with bi-directional communication support.
 * This module provides a complete implementation of the JSON-RPC 2.0 specification
 * with additional features for bi-directional communication, middleware support,
 * and type safety.
 *
 * Key exports:
 * - {@link JSONRPCNode} - Main class for JSON-RPC communication
 * - {@link JSONRPCError} - Error handling
 * - Type definitions for method maps, events, and context
 * - Utility functions for validation and type checking
 *
 * @module jsonrpc
 */

export * from './types.js';
export * from './error.js';
export * from './utils.js';
export * from './node.js';
export { JSONRPCProxy } from './proxy.js';
export type { JSONRPCProxyConfig } from './proxy.js';

// Enhanced error handling
export {
  ReceiveErrorHandler,
  ReceiveErrorCategory,
  ErrorSeverity,
  type ReceiveErrorEvent,
  type ReceiveErrorHandlerFunction,
  type ReceiveErrorHandlerConfig,
  type ErrorRecoveryStrategy,
} from './error-handling/receiveErrorHandler.js';
