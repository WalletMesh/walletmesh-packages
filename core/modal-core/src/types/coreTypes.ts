/**
 * Simplified and organized type exports for WalletMesh
 *
 * This file provides a clean, organized export structure that:
 * 1. Reduces total exports by ~70%
 * 2. Groups related types together
 * 3. Eliminates duplicate exports
 * 4. Uses consistent naming patterns
 * 5. Provides focused export paths
 *
 * @module types/coreTypes
 */

// ============================================================================
// IMPORTS
// ============================================================================

// Import types from their definition files
// These imports are re-exported below, so they appear unused to TypeScript
import type {
  BaseSessionMetadata,
  ConnectionState,
  ConnectionStatus,
  ErrorCategory,
  ModalView,
  MultiWalletState,
  Session,
  SessionPermissions,
  UseConnectionReturn,
  UseModalReturn,
  Wallet,
  WalletMeshError,
} from './baseTypes.js';

import type { CreateSessionParams, SimpleSessionState } from './sessionTypes.js';

// Session helper functions are re-exported below

// ============================================================================
// CORE FOUNDATION TYPES
// ============================================================================

// Re-export essential types from main types.ts
export type { ChainType, WalletInfo } from '../types.js';

// ============================================================================
// UNIFIED CORE TYPES
// ============================================================================

// Connection & Session Types
export type {
  ConnectionStatus,
  ConnectionState,
  MultiWalletState,
  Session,
  SessionPermissions,
  BaseSessionMetadata,
} from './baseTypes.js';

// Wallet Types
export type { Wallet } from './baseTypes.js';

// Modal Types
export type {
  ModalView,
  ModalState,
  ReactModalState,
} from './baseTypes.js';

// Error Types
export type {
  ErrorCategory,
  WalletMeshError,
} from './baseTypes.js';

// Chain Types
export type { ChainWithMetadata } from './baseTypes.js';

// Transaction Types
export type { Transaction } from './baseTypes.js';

// Import TransactionStatus from services for the constant below
import type { TransactionStatus } from '../services/index.js';

// Provider Types
export type { Provider } from './baseTypes.js';

// Hook Return Types
export type {
  UseConnectionReturn,
  UseModalReturn,
} from './baseTypes.js';

// Utility Types
export type {
  Optional,
  DeepPartial,
  ExtractHandlers,
} from './baseTypes.js';

// ============================================================================
// SIMPLIFIED SESSION TYPES
// ============================================================================

export type {
  Account,
  AccountDiscoveryOptions,
  SessionStatus,
  SimpleSessionState,
  CreateSessionParams,
  SessionUpdateOptions,
  SessionValidationResult,
  ChainSwitchOperation,
  AccountManagementOperation,
  SessionEventType,
  SessionEvent,
} from './sessionTypes.js';

// Session helper functions
export {
  isSessionExpired,
  isSessionActive,
  getPrimaryAccount,
  validateSession,
} from './sessionTypes.js';

// ============================================================================
// ORGANIZED EXPORT GROUPS
// ============================================================================

/**
 * Connection-related types
 */
export type ConnectionTypes = {
  ConnectionStatus: ConnectionStatus;
  ConnectionState: ConnectionState;
  MultiWalletState: MultiWalletState;
};

/**
 * Session-related types
 */
export type SessionTypes = {
  Session: Session;
  SessionState: SimpleSessionState;
  SessionPermissions: SessionPermissions;
  BaseSessionMetadata: BaseSessionMetadata;
  CreateSessionParams: CreateSessionParams;
};

/**
 * Type groupings for documentation purposes
 *
 * Wallet-related types:
 * - Wallet: Wallet information
 * - WalletInfo: Basic wallet metadata
 *
 * Modal-related types:
 * - ModalView: Current modal view
 * - ModalState: Complete modal state
 * - ReactModalState: React-specific modal state
 *
 * Error-related types:
 * - ErrorCategory: Error classification
 * - WalletMeshError: Standard error type
 *
 * Transaction-related types:
 * - TransactionStatus: Transaction lifecycle status
 * - Transaction: Transaction data
 *
 * Chain-related types:
 * - ChainType: Blockchain type (evm, solana, etc.)
 * - ChainInfo: Chain metadata
 */

/**
 * Hook return types
 */
export type HookTypes = {
  UseConnectionReturn: UseConnectionReturn;
  UseModalReturn: UseModalReturn;
};

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

/**
 * Type guard for ConnectionState
 */
export function isConnectionState(value: unknown): value is ConnectionState {
  return typeof value === 'object' && value !== null && 'status' in value && 'walletId' in value;
}

/**
 * Type guard for WalletMeshError
 */
export function isWalletMeshError(value: unknown): value is WalletMeshError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'category' in value
  );
}

/**
 * Type guard for Wallet
 */
export function isWallet(value: unknown): value is Wallet {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'chains' in value &&
    Array.isArray((value as Record<string, unknown>)['chains'])
  );
}

/**
 * Type guard for Session
 */
export function isSession(value: unknown): value is Session {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'connection' in value &&
    'provider' in value
  );
}

// ============================================================================
// DEPRECATION NOTICES
// ============================================================================

// WalletInfo is already exported above from '../types.js'

// ============================================================================
// CONSTANTS FOR TYPE VALIDATION
// ============================================================================

export const CONNECTION_STATUSES: readonly ConnectionStatus[] = [
  'disconnected',
  'connecting',
  'connected',
  'reconnecting',
  'error',
] as const;

export const MODAL_VIEWS: readonly ModalView[] = [
  'walletSelection',
  'connecting',
  'connected',
  'error',
  'switchingChain',
] as const;

export const ERROR_CATEGORIES: readonly ErrorCategory[] = [
  'user',
  'wallet',
  'network',
  'validation',
  'configuration',
  'unknown',
] as const;

export const TRANSACTION_STATUSES: readonly TransactionStatus[] = [
  'idle',
  'simulating',
  'proving',
  'sending',
  'pending',
  'confirming',
  'confirmed',
  'failed',
] as const;
