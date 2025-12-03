/**
 * Error types for modal-core
 *
 * This module re-exports error types from the schema module to ensure
 * consistency between type definitions and runtime validation.
 */

// Re-export schema-based types as the canonical error types
export type {
  ErrorCategory as ModalErrorCategory,
  ErrorData,
  ModalError,
  ErrorContext,
  UserError,
  WalletError,
  NetworkError,
  GeneralError,
  ErrorRecoveryOptions,
  RecoveryStrategy,
} from '../../../schemas/errors.js';

// Re-export error codes from schema for consistency
export { ERROR_CODES } from '../../../schemas/errors.js';

// Export the error implementation class
export { ModalErrorImpl } from './modalError.js';
