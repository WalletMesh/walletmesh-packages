/**
 * Connection-focused type exports
 *
 * Import path: @walletmesh/modal-core/types/connection
 *
 * This focused export provides only connection-related types
 * for better tree-shaking and cleaner imports.
 */

export type {
  ConnectionStatus,
  ConnectionState,
  MultiWalletState,
  Session,
  SessionPermissions,
  BaseSessionMetadata,
} from './baseTypes.js';

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

export {
  isSessionExpired,
  isSessionActive,
  getPrimaryAccount,
  validateSession,
} from './sessionTypes.js';

export { CONNECTION_STATUSES } from './coreTypes.js';
