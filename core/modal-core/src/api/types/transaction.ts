/**
 * Transaction context for multi-wallet/multi-chain safety
 */

import type { ChainType, SupportedChain } from '../../core/types.js';

/**
 * Transaction context that explicitly specifies the target wallet and chain
 * This prevents accidental transactions on the wrong wallet or chain
 */
export interface TransactionContext {
  /** The wallet ID to use for this transaction */
  walletId: string;

  /** The chain where the transaction should be executed */
  chain: SupportedChain;

  /** Optional chain type for additional validation */
  chainType?: ChainType;

  /** Whether to auto-switch chains if needed */
  autoSwitchChain?: boolean;
}

/**
 * Safe transaction request that includes context
 */
export interface SafeTransactionRequest<T = unknown> {
  /** Transaction context specifying wallet and chain */
  context: TransactionContext;

  /** The actual transaction parameters */
  params: T;
}

/**
 * Result of a context-aware transaction
 */
export interface TransactionResult<T = unknown> {
  /** The result from the blockchain */
  result: T;

  /** The context that was used */
  context: TransactionContext;

  /** Whether a chain switch occurred */
  chainSwitched: boolean;

  /** The provider version at time of execution */
  providerVersion: number;
}

/**
 * Multi-wallet transaction manager interface
 */
export interface TransactionManager {
  /**
   * Execute a transaction with explicit context
   * @throws {Error} If wallet not connected or chain not supported
   */
  executeWithContext<T = unknown>(request: SafeTransactionRequest<T>): Promise<TransactionResult<T>>;

  /**
   * Validate that a transaction can be executed
   */
  validateContext(context: TransactionContext): Promise<{
    valid: boolean;
    reason?: string;
    suggestedAction?: 'connect-wallet' | 'switch-chain' | 'switch-wallet';
  }>;

  /**
   * Get the best wallet for a given chain
   */
  getBestWalletForChain(chain: SupportedChain): string | null;

  /**
   * Get all wallets that support a given chain
   */
  getWalletsForChain(chain: SupportedChain): string[];
}
