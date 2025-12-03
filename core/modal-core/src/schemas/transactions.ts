/**
 * @fileoverview Transaction parameter schemas for runtime validation
 */

import { z } from 'zod';
import { caip2Schema } from './caip2.js';

// ============================================================================
// ADDRESS VALIDATION SCHEMAS
// ============================================================================

/**
 * EVM address validation (0x-prefixed, 40 hex characters)
 */
export const evmAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address format');

/**
 * Solana address validation (base58, 32-44 chars)
 */
export const solanaAddressSchema = z
  .string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address format');

/**
 * Aztec address validation
 */
export const aztecAddressSchema = z.string().min(1, 'Aztec address cannot be empty');

// ============================================================================
// COMMON TRANSACTION SCHEMAS
// ============================================================================

/**
 * Transaction status enumeration
 */
export const transactionStatusSchema = z.enum([
  'idle',
  'initiated',
  'simulating',
  'proving',
  'sending',
  'pending',
  'confirming',
  'confirmed',
  'failed',
]);

/**
 * Base transaction parameters common to all blockchain types
 */
export const baseTransactionParamsSchema = z.object({
  /** Target chain ID for the transaction */
  chainId: caip2Schema.optional(),
  /** Whether to automatically switch chains if needed */
  autoSwitchChain: z.boolean().optional(),
  /** Transaction metadata for tracking and UI purposes */
  metadata: z
    .object({
      /** Human-readable description of the transaction purpose */
      description: z.string().optional(),
      /** Categorization tag for the transaction */
      action: z.string().optional(),
      /** Custom application-specific data */
      data: z.record(z.unknown()).optional(),
    })
    .optional(),
});

// ============================================================================
// EVM TRANSACTION SCHEMAS
// ============================================================================

/**
 * EVM transaction parameters
 */
export const evmTransactionParamsSchema = baseTransactionParamsSchema.extend({
  /** Target address for the transaction */
  to: evmAddressSchema,
  /** Value to send in wei (as string to handle large numbers) */
  value: z.string().regex(/^\d+$/, 'Value must be numeric string').optional(),
  /** Transaction data for contract interactions */
  data: z
    .string()
    .regex(/^0x[a-fA-F0-9]*$/, 'Invalid hex data')
    .optional(),
  /** Gas limit override (as string) */
  gas: z.string().regex(/^\d+$/, 'Gas must be numeric string').optional(),
  /** Maximum fee per gas for EIP-1559 transactions (as string in wei) */
  maxFeePerGas: z.string().regex(/^\d+$/, 'Max fee must be numeric string').optional(),
  /** Maximum priority fee per gas for EIP-1559 transactions (as string in wei) */
  maxPriorityFeePerGas: z.string().regex(/^\d+$/, 'Priority fee must be numeric string').optional(),
  /** Transaction nonce override */
  nonce: z.number().int().min(0).optional(),
  /** From address (optional, defaults to current connected account) */
  from: evmAddressSchema.optional(),
});

/**
 * EVM transaction result
 */
export const evmTransactionResultSchema = z.object({
  /** Transaction hash */
  hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
  /** From address */
  from: evmAddressSchema,
  /** To address */
  to: evmAddressSchema.nullable(),
  /** Value transferred in wei */
  value: z.string(),
  /** Gas used */
  gasUsed: z.string().optional(),
  /** Effective gas price */
  effectiveGasPrice: z.string().optional(),
  /** Block number where transaction was mined */
  blockNumber: z.number().optional(),
  /** Block hash where transaction was mined */
  blockHash: z.string().optional(),
  /** Transaction status (1 for success, 0 for failure) */
  status: z.number().int().min(0).max(1).optional(),
});

// ============================================================================
// SOLANA TRANSACTION SCHEMAS
// ============================================================================

/**
 * Solana transaction parameters
 */
export const solanaTransactionParamsSchema = baseTransactionParamsSchema.extend({
  /** Serialized transaction in base64 format */
  transaction: z.string().refine((val) => {
    try {
      // Validate base64 encoding
      const decoded = Buffer.from(val, 'base64');
      return decoded.toString('base64') === val;
    } catch {
      return false;
    }
  }, 'Invalid base64 transaction'),
  /** Options for sending the transaction */
  options: z
    .object({
      /** Skip preflight transaction simulation */
      skipPreflight: z.boolean().optional(),
      /** Commitment level for preflight simulation */
      preflightCommitment: z.enum(['processed', 'confirmed', 'finalized']).optional(),
      /** Maximum number of retry attempts */
      maxRetries: z.number().int().min(0).max(10).optional(),
    })
    .optional(),
});

/**
 * Solana transaction result
 */
export const solanaTransactionResultSchema = z.object({
  /** Transaction signature */
  signature: z.string().min(1),
  /** Slot number */
  slot: z.number().optional(),
  /** Block time */
  blockTime: z.number().optional(),
  /** Transaction error if failed */
  err: z.any().nullable().optional(),
  /** Confirmation status */
  confirmationStatus: z.enum(['processed', 'confirmed', 'finalized']).optional(),
});

// ============================================================================
// AZTEC TRANSACTION SCHEMAS
// ============================================================================

/**
 * Aztec fee configuration
 */
export const aztecFeeConfigSchema = z.object({
  /** Gas settings */
  gasSettings: z
    .object({
      /** Gas limits */
      gasLimits: z
        .object({
          /** Teardown gas limits */
          teardownGasLimits: z.number().optional(),
          /** DA gas */
          daGas: z.number().optional(),
          /** L2 gas */
          l2Gas: z.number().optional(),
        })
        .optional(),
      /** Max fees per gas */
      maxFeesPerGas: z
        .object({
          /** Fee per DA gas */
          feePerDaGas: z.number().optional(),
          /** Fee per L2 gas */
          feePerL2Gas: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  /** Payment method */
  paymentMethod: z.string().optional(),
});

/**
 * Aztec transaction parameters
 */
export const aztecTransactionParamsSchema = baseTransactionParamsSchema.extend({
  /** Contract address */
  contractAddress: aztecAddressSchema,
  /** Function name to call */
  functionName: z.string().min(1, 'Function name is required'),
  /** Function arguments */
  args: z.array(z.unknown()).optional(),
  /** Fee configuration */
  fee: aztecFeeConfigSchema.optional(),
  /** Nonce for ordering */
  nonce: z.number().optional(),
  /** Whether this is a view function (read-only) */
  isView: z.boolean().optional(),
});

/**
 * Aztec transaction result
 */
export const aztecTransactionResultSchema = z.object({
  /** Transaction hash */
  txHash: z.string().min(1),
  /** Block number */
  blockNumber: z.number().optional(),
  /** Block hash */
  blockHash: z.string().optional(),
  /** Transaction status */
  status: z.enum(['pending', 'mined', 'failed']).optional(),
  /** Error message if failed */
  error: z.string().optional(),
});

// ============================================================================
// GENERIC TRANSACTION SCHEMAS
// ============================================================================

/**
 * Generic transaction request that can be for any chain type
 */
export const transactionRequestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('evm'),
    params: evmTransactionParamsSchema,
  }),
  z.object({
    type: z.literal('solana'),
    params: solanaTransactionParamsSchema,
  }),
  z.object({
    type: z.literal('aztec'),
    params: aztecTransactionParamsSchema,
  }),
]);

/**
 * Generic transaction result that can be from any chain type
 */
export const transactionResultSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('evm'),
    result: evmTransactionResultSchema,
  }),
  z.object({
    type: z.literal('solana'),
    result: solanaTransactionResultSchema,
  }),
  z.object({
    type: z.literal('aztec'),
    result: aztecTransactionResultSchema,
  }),
]);

/**
 * Transaction information for tracking
 */
export const transactionInfoSchema = z.object({
  /** Unique transaction ID for tracking */
  id: z.string(),
  /** Chain ID where transaction was sent */
  chainId: caip2Schema,
  /** Transaction status */
  status: transactionStatusSchema,
  /** Wallet ID that sent the transaction */
  walletId: z.string(),
  /** Transaction request data */
  request: transactionRequestSchema,
  /** Transaction result data */
  result: transactionResultSchema.optional(),
  /** Timestamp when transaction was created */
  createdAt: z.number(),
  /** Timestamp when transaction was last updated */
  updatedAt: z.number(),
  /** Error information if transaction failed */
  error: z
    .object({
      code: z.union([z.string(), z.number()]).optional(),
      message: z.string(),
      data: z.any().optional(),
    })
    .optional(),
});

/**
 * Transaction query options
 */
export const transactionQueryOptionsSchema = z.object({
  /** Filter by status */
  status: z.array(transactionStatusSchema).optional(),
  /** Filter by chain ID */
  chainId: caip2Schema.optional(),
  /** Filter by wallet ID */
  walletId: z.string().optional(),
  /** Limit number of results */
  limit: z.number().int().min(1).max(1000).optional(),
  /** Offset for pagination */
  offset: z.number().int().min(0).optional(),
  /** Sort order */
  sortOrder: z.enum(['asc', 'desc']).optional(),
  /** Only include transactions after this timestamp */
  since: z.number().optional(),
  /** Only include transactions before this timestamp */
  until: z.number().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Address types
export type EVMAddress = z.infer<typeof evmAddressSchema>;
export type SolanaAddress = z.infer<typeof solanaAddressSchema>;
export type AztecAddress = z.infer<typeof aztecAddressSchema>;

// Transaction status
export type TransactionStatus = z.infer<typeof transactionStatusSchema>;

// Base params
export type BaseTransactionParams = z.infer<typeof baseTransactionParamsSchema>;

// EVM types
export type EVMTransactionParams = z.infer<typeof evmTransactionParamsSchema>;
export type EVMTransactionResult = z.infer<typeof evmTransactionResultSchema>;

// Solana types
export type SolanaTransactionParams = z.infer<typeof solanaTransactionParamsSchema>;
export type SolanaTransactionResult = z.infer<typeof solanaTransactionResultSchema>;

// Aztec types
export type AztecFeeConfig = z.infer<typeof aztecFeeConfigSchema>;
export type AztecTransactionParams = z.infer<typeof aztecTransactionParamsSchema>;
export type AztecTransactionResult = z.infer<typeof aztecTransactionResultSchema>;

// Generic types
export type TransactionRequest = z.infer<typeof transactionRequestSchema>;
export type TransactionResult = z.infer<typeof transactionResultSchema>;
export type TransactionInfo = z.infer<typeof transactionInfoSchema>;
export type TransactionQueryOptions = z.infer<typeof transactionQueryOptionsSchema>;
