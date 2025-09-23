/**
 * @fileoverview Error system schemas for runtime validation
 */

import { z } from 'zod';

/**
 * Error category enumeration
 */
export const errorCategorySchema = z.enum(['user', 'wallet', 'network', 'general', 'validation', 'sandbox']);

/**
 * Error data schema for additional error context
 */
export const errorDataSchema = z.record(z.unknown());

/**
 * Recovery strategy enumeration
 */
export const recoveryStrategySchema = z.enum(['retry', 'wait_and_retry', 'manual_action', 'none']);

/**
 * Base modal error schema
 *
 * Note: Recoverability is determined by the recoveryStrategy field:
 * - If recoveryStrategy is present and not 'none', the error is recoverable
 * - If recoveryStrategy is 'none' or undefined, the error is not recoverable
 */
export const modalErrorSchema = z.object({
  /**
   * Error code identifier
   */
  code: z.string(),

  /**
   * Human-readable error message
   */
  message: z.string(),

  /**
   * Error category
   */
  category: errorCategorySchema,

  /**
   * Recovery strategy for this error
   * - 'retry': Can be retried immediately
   * - 'wait_and_retry': Should wait before retrying
   * - 'manual_action': Requires user intervention
   * - 'none': Not recoverable (fatal error)
   * - undefined: Not recoverable (default)
   */
  recoveryStrategy: recoveryStrategySchema.optional(),

  /**
   * Retry delay in milliseconds (for retry strategies)
   */
  retryDelay: z.number().int().positive().optional(),

  /**
   * Maximum number of retry attempts
   */
  maxRetries: z.number().int().min(0).optional(),

  /**
   * Error classification for recovery purposes
   */
  classification: z
    .enum(['network', 'permission', 'provider', 'temporary', 'permanent', 'unknown'])
    .optional(),

  /**
   * Additional error data
   */
  data: errorDataSchema.optional(),

  /**
   * Underlying cause of the error
   */
  cause: z.unknown().optional(),
});

/**
 * Comprehensive error codes for all categories
 */
export const ERROR_CODES = {
  // User errors
  USER_REJECTED: 'user_rejected',
  USER_CANCELLED: 'user_cancelled',

  // Wallet errors
  WALLET_NOT_FOUND: 'wallet_not_found',
  WALLET_NOT_INSTALLED: 'wallet_not_installed',
  WALLET_LOCKED: 'wallet_locked',

  // Network errors
  NETWORK_ERROR: 'network_error',
  CONNECTION_FAILED: 'connection_failed',
  REQUEST_TIMEOUT: 'request_timeout',

  // General errors
  UNKNOWN_ERROR: 'unknown_error',
  CONFIGURATION_ERROR: 'configuration_error',

  // Configuration errors
  INVALID_ADAPTER: 'invalid_adapter',
  INVALID_TRANSPORT: 'invalid_transport',

  // Transport errors
  TRANSPORT_UNAVAILABLE: 'transport_unavailable',
  MESSAGE_FAILED: 'message_failed',
  TRANSPORT_DISCONNECTED: 'transport_disconnected',

  // Adapter errors
  RENDER_FAILED: 'render_failed',
  MOUNT_FAILED: 'mount_failed',
  CLEANUP_FAILED: 'cleanup_failed',

  // Service errors
  VALIDATION_ERROR: 'validation_error',
  NOT_FOUND: 'not_found',
  INVALID_PARAMS: 'invalid_params',

  // Transaction errors
  TRANSACTION_FAILED: 'transaction_failed',
  TRANSACTION_REVERTED: 'transaction_reverted',
  GAS_ESTIMATION_FAILED: 'gas_estimation_failed',
  SIMULATION_FAILED: 'simulation_failed',
} as const;

/**
 * User error codes enumeration
 */
export const userErrorCodeSchema = z.enum(['user_rejected', 'user_cancelled']);

/**
 * Wallet error codes enumeration
 */
export const walletErrorCodeSchema = z.enum(['wallet_not_found', 'wallet_not_installed', 'wallet_locked']);

/**
 * Network error codes enumeration
 */
export const networkErrorCodeSchema = z.enum(['network_error', 'connection_failed', 'request_timeout']);

/**
 * General error codes enumeration
 */
export const generalErrorCodeSchema = z.enum(['unknown_error', 'configuration_error']);

/**
 * User error schema
 */
export const userErrorSchema = modalErrorSchema.extend({
  code: userErrorCodeSchema,
  category: z.literal('user'),
});

/**
 * Wallet error schema
 */
export const walletErrorSchema = modalErrorSchema.extend({
  code: walletErrorCodeSchema,
  category: z.literal('wallet'),
});

/**
 * Network error schema
 */
export const networkErrorSchema = modalErrorSchema.extend({
  code: networkErrorCodeSchema,
  category: z.literal('network'),
});

/**
 * General error schema
 */
export const generalErrorSchema = modalErrorSchema.extend({
  code: generalErrorCodeSchema,
  category: z.literal('general'),
});

/**
 * Error recovery options schema
 */
export const errorRecoveryOptionsSchema = z.object({
  /**
   * Suggested retry action
   */
  retryAction: z.string().optional(),

  /**
   * Maximum retry attempts
   */
  maxRetries: z.number().int().nonnegative().optional(),

  /**
   * Retry delay in milliseconds
   */
  retryDelay: z.number().int().positive().optional(),

  /**
   * Recovery strategies
   */
  strategies: z.array(z.string()).optional(),
});

/**
 * Error context schema for additional debugging information
 */
export const errorContextSchema = z.object({
  /**
   * Component or module where error occurred
   */
  component: z.string().optional(),

  /**
   * Method or function where error occurred
   */
  method: z.string().optional(),

  /**
   * Operation that caused the error
   */
  operation: z.string().optional(),

  /**
   * Wallet ID if error is wallet-related
   */
  walletId: z.string().optional(),

  /**
   * Chain ID if error is chain-related
   */
  chainId: z.string().optional(),

  /**
   * Attempt number for retry scenarios
   */
  attempt: z.number().optional(),

  /**
   * Timestamp when error occurred
   */
  timestamp: z.date().optional(),

  /**
   * User agent information
   */
  userAgent: z.string().optional(),

  /**
   * Additional context data
   */
  extra: z.record(z.unknown()).optional(),
});

// Type exports
export type ErrorCategory = z.infer<typeof errorCategorySchema>;
export type ErrorData = z.infer<typeof errorDataSchema>;
export type ModalError = z.infer<typeof modalErrorSchema>;
export type RecoveryStrategy = z.infer<typeof recoveryStrategySchema>;
export type UserErrorCode = z.infer<typeof userErrorCodeSchema>;
export type WalletErrorCode = z.infer<typeof walletErrorCodeSchema>;
export type NetworkErrorCode = z.infer<typeof networkErrorCodeSchema>;
export type GeneralErrorCode = z.infer<typeof generalErrorCodeSchema>;
export type UserError = z.infer<typeof userErrorSchema>;
export type WalletError = z.infer<typeof walletErrorSchema>;
export type NetworkError = z.infer<typeof networkErrorSchema>;
export type GeneralError = z.infer<typeof generalErrorSchema>;
export type ErrorRecoveryOptions = z.infer<typeof errorRecoveryOptionsSchema>;
export type ErrorContext = z.infer<typeof errorContextSchema>;
