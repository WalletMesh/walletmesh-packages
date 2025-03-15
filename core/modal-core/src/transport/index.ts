/**
 * @packageDocumentation
 * Transport layer exports for WalletMesh Core.
 */

// Core types and interfaces
export * from './types.js';

// JSON-RPC Protocol implementation
export * from './json-rpc.js';

// Window transport implementation
export * from './window.js';

// Error types and utilities
export * from './errors.js';

// Protocol validation
export {
  ProtocolValidator,
  type ValidationResult,
} from './protocol-validator.js';

// Re-export common types and constants
export {
  MessageType,
  TransportError,
  TransportErrorCode,
  type Message,
  type MessageHandler,
  type Transport,
  type Protocol,
  type TransportOptions,
} from './types.js';
