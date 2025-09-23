import type { ModalError } from '../internal/core/errors/types.js';
import type { ChainType } from '../types.js';
import type { ChainInfo } from './chain/types.js';

// Common service types
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: ModalError;
}

export interface ServiceEvent<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
}

// Chain-related types are now in services/chain/types.ts

// Connection-related types
export interface ConnectionInfo {
  walletId: string;
  address: string;
  chainId: string;
  chainType: ChainType;
  connectedAt: number;
}

// Transaction-related types
export interface TransactionRequest {
  from?: string;
  to: string;
  value?: string;
  data?: string;
  gas?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
  chainId?: string;
}

export interface TransactionResult {
  id: string;
  hash: string;
  wait: () => Promise<TransactionReceipt>;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
  from: string;
  to?: string;
  gasUsed: string;
  status: '0x0' | '0x1' | 0 | 1;
  logs?: Array<unknown>;
}

// TransactionStatus is now imported from ./transaction/types.js
import type { TransactionStatus } from './transaction/types.js';

export interface TransactionInfo {
  id: string;
  hash?: string;
  status: TransactionStatus;
  request: TransactionRequest;
  receipt?: TransactionReceipt;
  error?: ModalError;
  startTime: number;
  endTime?: number;
  chainId: string;
  chainType: ChainType;
}

// Balance-related types
export interface Balance {
  value: bigint;
  formatted: string;
  symbol: string;
  decimals: number;
}

export interface TokenBalance extends Balance {
  token: string;
  name?: string;
}

export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

// Service events
export interface ServiceEvents {
  // Connection events
  'connection:established': ConnectionInfo;
  'connection:lost': { walletId: string; reason: string };

  // Chain events
  'chain:changed': { from: string; to: string };
  'chain:added': ChainInfo;

  // Transaction events
  'transaction:sent': { id: string; hash: string };
  'transaction:confirmed': { id: string; receipt: TransactionReceipt };
  'transaction:failed': { id: string; error: ModalError };

  // Balance events
  'balance:updated': { address: string; balance: Balance };
}

// Validation types
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}
