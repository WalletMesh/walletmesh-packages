/**
 * @fileoverview Connection and state schemas for runtime validation
 */

import { z } from 'zod';
import { chainTypeSchema, walletInfoSchema } from './wallet.js';

/**
 * Connection state enumeration
 */
export const connectionStateSchema = z.enum(['disconnected', 'connecting', 'connected']);

/**
 * Connection result schema for successful connections
 */
export const connectionResultSchema = z.object({
  /**
   * Primary connected wallet address
   */
  address: z.string(),

  /**
   * All connected wallet accounts
   */
  accounts: z.array(z.string()),

  /**
   * Connected chain identifier
   */
  chainId: z.union([z.string(), z.number()]),

  /**
   * Connected blockchain type
   */
  chainType: chainTypeSchema,

  /**
   * Chain-specific provider for blockchain interactions
   */
  provider: z.unknown(),

  /**
   * Wallet ID used for connection
   */
  walletId: z.string(),

  /**
   * Connected wallet information
   */
  walletInfo: walletInfoSchema,
});

/**
 * Modal view types
 */
export const modalViewSchema = z.enum([
  'walletSelection',
  'connecting',
  'connected',
  'error',
  'switchingChain',
  'proving',
]);

/**
 * Internal modal state schema (for internal state managers)
 */
export const internalModalStateSchema = z.object({
  /**
   * Whether the modal is currently open
   */
  isOpen: z.boolean(),

  /**
   * Current active view
   */
  currentView: modalViewSchema,

  /**
   * Currently selected wallet ID
   */
  walletId: z.string().nullable(),

  /**
   * Currently selected chain type
   */
  chain: chainTypeSchema.nullable(),

  /**
   * Current error if any
   */
  error: z.instanceof(Error).nullable(),

  /**
   * Whether modal is in loading state
   */
  isLoading: z.boolean(),

  /**
   * Whether wallet is currently connected
   */
  isConnected: z.boolean(),

  /**
   * List of connected account addresses
   */
  accounts: z.array(z.string()),

  /**
   * Currently connected chain ID
   */
  chainId: z.union([z.string(), z.number()]).nullable(),

  /**
   * Connected wallet address
   */
  address: z.string().nullable(),
});

/**
 * Public modal state schema (for external API)
 */
export const modalStateSchema = z.object({
  /**
   * Whether the modal is currently open
   */
  isOpen: z.boolean(),

  /**
   * Current active view
   */
  currentView: z.string(),

  /**
   * Currently selected wallet ID
   */
  walletId: z.string().nullable(),

  /**
   * Current error if any
   */
  error: z.instanceof(Error).nullable().optional(),

  /**
   * Available wallets list
   */
  wallets: z.array(walletInfoSchema),

  /**
   * Currently connecting wallet ID
   */
  connectingWallet: z.string().optional(),
});

/**
 * Modal configuration schema
 */
export const modalConfigSchema = z.object({
  /**
   * Whether to show provider selection step
   */
  showProviderSelection: z.boolean(),

  /**
   * UI theme setting
   */
  theme: z.enum(['light', 'dark', 'system']),

  /**
   * Blockchain type
   */
  chain: chainTypeSchema,

  /**
   * Auto-close delay in milliseconds
   */
  autoCloseDelay: z.number().int().nonnegative(),

  /**
   * Whether to persist wallet selection
   */
  persistWalletSelection: z.boolean(),

  /**
   * Debug mode flag
   */
  debug: z.boolean(),

  /**
   * Optional callback before modal opens
   */
  onBeforeOpen: z
    .function()
    .args(z.void())
    .returns(z.union([z.boolean(), z.promise(z.boolean())]))
    .optional(),

  /**
   * Optional callback after modal opens
   */
  onAfterOpen: z
    .function()
    .args(z.void())
    .returns(z.union([z.void(), z.promise(z.void())]))
    .optional(),
});

// Type exports
export type ConnectionState = z.infer<typeof connectionStateSchema>;
export type ConnectionResult = z.infer<typeof connectionResultSchema>;
export type ModalView = z.infer<typeof modalViewSchema>;
export type ModalState = z.infer<typeof modalStateSchema>;
export type ModalConfig = z.infer<typeof modalConfigSchema>;
