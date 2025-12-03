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

export * from './error.js';
// Enhanced error handling
export {
  type ErrorRecoveryStrategy,
  ErrorSeverity,
  ReceiveErrorCategory,
  type ReceiveErrorEvent,
  ReceiveErrorHandler,
  type ReceiveErrorHandlerConfig,
  type ReceiveErrorHandlerFunction,
} from './error-handling/receiveErrorHandler.js';
// Middleware utilities
export { createTransportContextMiddleware } from './middlewares/index.js';
export * from './node.js';
export type { JSONRPCProxyConfig } from './proxy.js';
export { JSONRPCProxy } from './proxy.js';
export * from './types.js';
export * from './utils.js';
