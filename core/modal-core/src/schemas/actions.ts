/**
 * @fileoverview Action validation schemas for state management
 *
 * Provides Zod schemas for validating inputs to state action functions,
 * ensuring type safety and preventing invalid state mutations.
 */

import { z } from 'zod';
import { chainTypeSchema } from './wallet.js';
import { modalViewSchema } from './connection.js';
import { ChainType } from '../types.js';

/**
 * Schema for wallet IDs - non-empty strings
 */
export const walletIdSchema = z.string().min(1, 'Wallet ID cannot be empty').trim();

/**
 * Schema for session IDs - must follow specific format
 * Either starts with 'session_' or contains a dash (UUID format)
 */
export const sessionIdSchema = z
  .string()
  .min(1, 'Session ID cannot be empty')
  .trim()
  .refine(
    (val) => val.startsWith('session_') || val.includes('-'),
    'Session ID must start with "session_" or be in UUID format',
  );

/**
 * Schema for transaction IDs - non-empty strings
 */
export const transactionIdSchema = z.string().min(1, 'Transaction ID cannot be empty').trim();

/**
 * Schema for action chain IDs - can be string or number
 * Used in action parameters where chain IDs are not yet normalized to CAIP-2
 */
export const actionChainIdSchema = z.union([
  z.string().min(1, 'Chain ID cannot be empty').trim(),
  z.number().positive('Chain ID must be positive'),
]);

/**
 * Schema for non-empty strings (generic)
 */
export const nonEmptyStringSchema = z.string().min(1, 'Value cannot be empty').trim();

/**
 * Schema for EVM addresses
 */
export const evmAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address format');

/**
 * Schema for Solana addresses
 */
export const solanaAddressSchema = z
  .string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address format');

/**
 * Schema for Aztec addresses
 */
export const aztecAddressSchema = z
  .string()
  .min(1, 'Aztec address cannot be empty')
  .max(200, 'Aztec address too long');

/**
 * Schema for addresses with chain type validation
 */
export const addressWithChainSchema = z
  .object({
    address: z.string(),
    chainType: chainTypeSchema,
  })
  .refine(
    (data) => {
      switch (data.chainType) {
        case ChainType.Evm:
          return evmAddressSchema.safeParse(data.address).success;
        case ChainType.Solana:
          return solanaAddressSchema.safeParse(data.address).success;
        case ChainType.Aztec:
          return aztecAddressSchema.safeParse(data.address).success;
        default:
          return false;
      }
    },
    (data) => ({
      message: `Invalid ${data.chainType} address format`,
    }),
  );

/**
 * Schema for account info
 */
export const accountInfoSchema = z.object({
  address: z.string().min(1),
  name: z.string().optional(),
  balance: z
    .object({
      value: z.string(),
      formatted: z.string(),
      symbol: z.string(),
      decimals: z.number(),
    })
    .optional(),
  derivationPath: z.string().optional(),
  index: z.number().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  metadata: z
    .object({
      discoveredAt: z.number(),
      lastUsedAt: z.number(),
      transactionCount: z.number().optional(),
      accountType: z.string().optional(),
    })
    .optional(),
});

/**
 * Schema for chain info
 */
export const chainInfoSchema = z.object({
  chainId: actionChainIdSchema,
  chainType: chainTypeSchema,
  name: z.string().optional(),
  icon: z.string().optional(),
  isNative: z.boolean().optional(),
});

/**
 * Schema for permission set
 */
export const permissionSetSchema = z.object({
  methods: z.array(z.string()),
  events: z.array(z.string()),
  chains: z.array(actionChainIdSchema).optional(),
  autoSign: z.boolean().optional(),
  maxTransactionValue: z.string().optional(),
  chainSpecific: z.record(z.unknown()).optional(),
  walletSpecific: z.record(z.unknown()).optional(),
});

/**
 * Schema for provider metadata
 */
export const providerMetadataSchema = z.object({
  type: z.string().optional(),
  version: z.string().optional(),
  multiChainCapable: z.boolean().optional(),
  supportedMethods: z.array(z.string()).optional(),
});

/**
 * Schema for chain session info (matches ChainSessionInfo interface)
 */
export const chainSessionInfoSchema = z.object({
  // From SupportedChain
  chainId: z.string(),
  chainType: chainTypeSchema,
  name: z.string(),
  required: z.boolean(),
  label: z.string().optional(),
  interfaces: z.array(z.string()).optional(),
  group: z.string().optional(),
  icon: z.string().optional(),
  // From ChainSessionInfo
  isNative: z.boolean().optional(),
});

/**
 * Schema for create session parameters
 */
// Forward declaration - actual definition comes later
export const createSessionParamsSchema = z.object({
  walletId: walletIdSchema,
  accounts: z.array(accountInfoSchema).min(1, 'At least one account is required'),
  activeAccountIndex: z.number().int().min(0).optional(),
  chain: chainSessionInfoSchema,
  provider: z.unknown().refine((val) => val !== null && val !== undefined, 'Provider is required'),
  permissions: permissionSetSchema.optional(),
  metadata: z.record(z.unknown()).optional(), // Generic record for now
  expiresAt: z.number().optional(),
  providerMetadata: providerMetadataSchema.optional(),
  sessionId: sessionIdSchema.optional(),
});

/**
 * Schema for chain switch record
 */
export const chainSwitchRecordSchema = z.object({
  switchId: z.string(),
  fromChain: z.any().nullable(), // ChainSessionInfo | null
  toChain: z.any(), // ChainSessionInfo (required)
  timestamp: z.number(),
  reason: z.enum(['user_request', 'dapp_request', 'auto_switch', 'fallback']),
  successful: z.boolean(),
  error: z.string().optional(),
});

/**
 * Schema for session metadata updates
 */
export const sessionMetadataSchema = z.object({
  wallet: z.object({
    name: z.string(),
    icon: z.string(),
    version: z.string().optional(),
    installUrl: z.string().optional(),
  }),
  dapp: z.object({
    name: z.string(),
    url: z.string().optional(),
    icon: z.string().optional(),
    domain: z.string().optional(),
  }),
  connection: z.object({
    initiatedBy: z.enum(['user', 'dapp', 'auto']),
    method: z.enum(['manual', 'deeplink', 'qr', 'extension', 'injected']),
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
  }),
  chainSwitches: z.array(chainSwitchRecordSchema).optional(),
});

/**
 * Schema for transaction status
 */
export const transactionStatusSchema = z.enum([
  'idle',
  'simulating',
  'proving',
  'sending',
  'pending',
  'confirming',
  'confirmed',
  'failed',
]);

/**
 * Schema for transaction error
 */
export const transactionErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  category: z.enum(['connection', 'network', 'wallet', 'user', 'general']),
  data: z.record(z.unknown()).optional(),
});

/**
 * Schema for transaction result
 */
export const transactionResultSchema = z.object({
  id: transactionIdSchema,
  hash: z.string().min(1, 'Transaction hash is required'),
  status: transactionStatusSchema,
  chainType: chainTypeSchema,
  from: z.string(),
  to: z.string(),
  value: z.string(),
  startTime: z.number(),
  endTime: z.number().optional(),
  error: transactionErrorSchema.optional(),
  blockNumber: z.number().optional(),
  blockHash: z.string().optional(),
  gasUsed: z.string().optional(),
  effectiveGasPrice: z.string().optional(),
  data: z.string().optional(),
  nonce: z.number().optional(),
});

/**
 * Schema for UI error (reusing ModalError structure)
 */
export const uiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  category: z.enum(['connection', 'network', 'wallet', 'user', 'general']),
  data: z.record(z.unknown()).optional(),
  recoverable: z.boolean().optional(),
});

/**
 * Re-export modal view schema for convenience
 */
export { modalViewSchema };

/**
 * Re-export wallet info schema for convenience
 */
export { walletInfoSchema } from './wallet.js';

/**
 * Schema for boolean values (for UI actions)
 */
export const booleanSchema = z.boolean();

/**
 * Schema for optional chain type
 */
export const optionalChainTypeSchema = chainTypeSchema.optional();

/**
 * Schema for discovery error (string)
 */
export const discoveryErrorSchema = nonEmptyStringSchema;

/**
 * Schema for block number validation
 */
export const blockNumberSchema = z.number().nonnegative('Block number must be non-negative');

/**
 * Schema for block hash validation
 */
export const blockHashSchema = nonEmptyStringSchema;

/**
 * Schema for failure reason validation
 */
export const failureReasonSchema = nonEmptyStringSchema;

/**
 * Type exports for convenience
 */
export type WalletId = z.infer<typeof walletIdSchema>;
export type SessionId = z.infer<typeof sessionIdSchema>;
export type TransactionId = z.infer<typeof transactionIdSchema>;
export type ActionChainId = z.infer<typeof actionChainIdSchema>;
export type CreateSessionParams = z.infer<typeof createSessionParamsSchema>;
export type TransactionResult = z.infer<typeof transactionResultSchema>;
export type TransactionStatus = z.infer<typeof transactionStatusSchema>;
export type TransactionError = z.infer<typeof transactionErrorSchema>;
