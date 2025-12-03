/**
 * Transaction-focused type exports
 *
 * Import path: @walletmesh/modal-core/types/transaction
 *
 * This focused export provides only transaction-related types
 * for better tree-shaking and cleaner imports.
 */

export type { Transaction } from './baseTypes.js';

// Re-export TransactionStatus from services
export type { TransactionStatus } from '../services/index.js';

export { TRANSACTION_STATUSES } from './coreTypes.js';
